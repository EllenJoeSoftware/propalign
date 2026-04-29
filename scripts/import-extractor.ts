/**
 * Import scraped property JSON files from PropertyExtractor into Firestore.
 *
 *   npm run import:extractor                       # default folder
 *   npm run import:extractor -- --src=PATH         # custom folder
 *   npm run import:extractor -- --replace          # clear existing first
 *
 * Each source file looks like:
 *   {
 *     "title": "...",
 *     "listing_id": "4586934",
 *     "listing_url": "https://www.privateproperty.co.za/.../RR4586934",
 *     "price": 28500,
 *     "full description": "...",
 *     "location": "",            // empty — derived from URL
 *     "propertyType": "House",
 *     "bedrooms": 3, "bathrooms": 5,
 *     "lat": 0, "lng": 0,        // 0 — derived from province anchor
 *     "features": "[]",          // empty — extracted from description
 *     "imageUrl": "...",
 *     "isForRent": true,
 *     "province": "Gauteng",
 *     "createdAt": "...", "updatedAt": "..."
 *   }
 *
 * Doc IDs are `pp_<listing_id>` so re-imports overwrite cleanly.
 */

import 'dotenv/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { SUBURBS_BY_PROVINCE, type Province } from '../src/lib/sa-suburbs';
import { buildSearchTags, computeHasImage } from '../src/lib/property-tags';

// ----------------------------------------------------------------------------
// Args
// ----------------------------------------------------------------------------
function getArg(name: string): string | undefined {
  const flag = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(flag));
  return found ? found.slice(flag.length) : undefined;
}
const REPLACE_ALL = process.argv.includes('--replace');
const SRC_DIR =
  getArg('src') ??
  path.resolve(__dirname, '..', '..', 'PropertyExtractor', 'properties');

// ----------------------------------------------------------------------------
// Firebase init
// ----------------------------------------------------------------------------
function buildCredentials() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) return cert(JSON.parse(json));
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Set FIREBASE_SERVICE_ACCOUNT_JSON or 3-var split in .env');
  }
  return cert({ projectId, clientEmail, privateKey });
}
if (!getApps().length) initializeApp({ credential: buildCredentials() });
const db = getFirestore();
// Drop undefined fields silently (some scraped records lack region/city).
db.settings({ ignoreUndefinedProperties: true });
const COLLECTION = 'properties';

// ----------------------------------------------------------------------------
// Province anchors (mirrors firestore-seed.ts) — used when lat/lng=0.
// ----------------------------------------------------------------------------
const PROVINCE_ANCHORS: Record<Province, { lat: number; lng: number }> = {
  Gauteng: { lat: -26.10, lng: 28.05 },
  'Western Cape': { lat: -33.93, lng: 18.50 },
  'KwaZulu-Natal': { lat: -29.85, lng: 31.00 },
  'Eastern Cape': { lat: -33.95, lng: 25.60 },
  'Free State': { lat: -29.10, lng: 26.20 },
  Mpumalanga: { lat: -25.50, lng: 30.97 },
  Limpopo: { lat: -23.90, lng: 29.45 },
  'North West': { lat: -25.60, lng: 27.24 },
  'Northern Cape': { lat: -28.74, lng: 24.77 },
};

function jitter(v: number, range: number): number {
  return v + (Math.random() - 0.5) * 2 * range;
}

// ----------------------------------------------------------------------------
// Canonical suburb lookup (case-insensitive, dash-tolerant)
// ----------------------------------------------------------------------------
const ALL_SUBURBS = (
  Object.values(SUBURBS_BY_PROVINCE) as string[][]
).flat();

const SUBURB_INDEX: Record<string, string> = {};
for (const s of ALL_SUBURBS) {
  SUBURB_INDEX[s.toLowerCase().replace(/[\s-]/g, '')] = s;
}

function canonicalSuburb(raw: string): string | null {
  const key = raw.toLowerCase().replace(/[\s-]/g, '');
  return SUBURB_INDEX[key] ?? null;
}

function titleCase(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// ----------------------------------------------------------------------------
// Parse listing URL → { isForRent, province, region, city, suburb }
// Format: https://www.privateproperty.co.za/{intent}/{province}/{region}/{city}/{suburb}/.../{RRid}
// Some URLs have a region (e.g. "west-rand"), some don't.
// ----------------------------------------------------------------------------
function parseListingUrl(url: string) {
  try {
    const u = new URL(url);
    const segs = u.pathname.split('/').filter(Boolean);
    if (segs.length < 4) return null;

    const intent = segs[0]; // "to-rent" or "for-sale"
    const isForRent = intent === 'to-rent';
    const provinceSlug = segs[1];
    const province = titleCase(provinceSlug) as Province;

    // Drop trailing RR-id, drop empty
    const meaningful = segs.slice(2).filter((s) => !/^RR\d+$/i.test(s));
    // Last meaningful segment is most likely a street; second-to-last (or last
    // if there's no street) is suburb. We try to canonicalize each segment.
    let suburb: string | null = null;
    for (let i = meaningful.length - 1; i >= 0; i--) {
      const cand = canonicalSuburb(meaningful[i]);
      if (cand) {
        suburb = cand;
        break;
      }
    }
    // Fallback: pick the segment most likely to be the suburb (last that
    // looks alphabetic, not a street number).
    if (!suburb) {
      const fallback =
        meaningful
          .reverse()
          .find((s) => /[a-z]/i.test(s) && !/^\d+-/.test(s)) ?? meaningful[0];
      suburb = titleCase(fallback ?? '');
    }

    // City = first segment after province that isn't the suburb
    let city: string | undefined;
    let region: string | undefined;
    if (segs.length >= 5) {
      // Heuristic: regions tend to end with "-rand" or "-metro" or "-district"
      const r = segs[2];
      if (/-(rand|metro|district)$/.test(r)) {
        region = titleCase(r);
        city = titleCase(segs[3] ?? '');
      } else {
        city = titleCase(r);
      }
    }

    return { isForRent, province, region, city, suburb };
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// Feature extraction — keyword scan on full description.
// ----------------------------------------------------------------------------
const FEATURE_PATTERNS: Array<[RegExp, string]> = [
  [/\bsolar\b/i, 'Solar'],
  [/\binverter\b/i, 'Inverter'],
  [/\bbattery\b/i, 'Battery Backup'],
  [/\bborehole\b/i, 'Borehole'],
  [/\bjojo\b/i, 'JoJo Tank'],
  [/\bgenerator\b/i, 'Generator'],
  [/\bfibre\b/i, 'Fibre'],
  [/\b(swimming\s+pool|pool)\b/i, 'Pool'],
  [/\bgym\b/i, 'Gym'],
  [/\bgarden\b/i, 'Garden'],
  [/\bgarage\b/i, 'Garage'],
  [/\bcarport\b/i, 'Carport'],
  [/\b(security|24[- ]?hour\s+security|armed\s+response|alarm)\b/i, 'Security'],
  [/\b(gated|estate)\b/i, 'Gated Estate'],
  [/\bcomplex\b/i, 'Complex'],
  [/\bbalcony\b/i, 'Balcony'],
  [/\bpatio\b/i, 'Patio'],
  [/\bbraai\b/i, 'Braai'],
  [/\bopen[- ]plan\b/i, 'Open Plan'],
  [/\b(quiet|peaceful)\b/i, 'Quiet'],
  [/\b(pet[- ]?friendly|pets?\s+allowed|pet\s+friendly)\b/i, 'Pet Friendly'],
  [/\b(no\s+pets?|not\s+pets?[- ]?friendly|sorry,?\s+no\s+pets?)\b/i, 'No Pets'],
  [/\b(walk(?:ing)?\s+to|near(?:by)?\s+(?:transport|train|bus|taxi)|minibus\s+taxi)\b/i, 'Walk to Transport'],
  [/\bsea\s+view\b/i, 'Sea View'],
  [/\bmountain\s+view\b/i, 'Mountain View'],
  [/\b(modern|contemporary)\b/i, 'Modern'],
  [/\b(renovated|newly\s+renovated)\b/i, 'Renovated'],
  [/\b(prepaid|pre[- ]?paid)\s+electricity\b/i, 'Prepaid Electricity'],
  [/\ben[- ]?suite\b/i, 'En-Suite'],
  [/\bstudy\b/i, 'Study'],
  [/\bscullery\b/i, 'Scullery'],
  [/\blaundry\b/i, 'Laundry'],
  [/\bservants?\s+quarters?\b/i, 'Servants Quarters'],
];

function extractFeatures(text: string): string[] {
  if (!text) return [];
  const hits: string[] = [];
  const seen = new Set<string>();
  for (const [pattern, name] of FEATURE_PATTERNS) {
    if (pattern.test(text) && !seen.has(name)) {
      hits.push(name);
      seen.add(name);
    }
  }
  // If both "No Pets" and "Pet Friendly" matched, drop "Pet Friendly".
  if (seen.has('No Pets') && seen.has('Pet Friendly')) {
    return hits.filter((h) => h !== 'Pet Friendly');
  }
  return hits;
}

// ----------------------------------------------------------------------------
// Normalize one source record → a Firestore document.
// ----------------------------------------------------------------------------
interface RawRecord {
  title?: string;
  description?: string;
  listing_id?: string;
  listing_url?: string;
  price?: number;
  'full description'?: string;
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  lat?: number;
  lng?: number;
  features?: string;
  imageUrl?: string | null;
  isForRent?: boolean;
  province?: string;
}

function normalize(raw: RawRecord) {
  const fullDesc = raw['full description'] ?? raw.description ?? '';
  const url = raw.listing_url ?? '';
  const parsed = url ? parseListingUrl(url) : null;

  // Province
  const province: Province =
    (raw.province as Province) ??
    (parsed?.province as Province) ??
    'Gauteng';

  // Location: prefer raw, then URL-derived, then "Unknown"
  let location =
    (raw.location && raw.location.trim()) ||
    parsed?.suburb ||
    'Unknown';

  // Lat/lng: if 0, jitter from province anchor
  let lat = Number(raw.lat ?? 0);
  let lng = Number(raw.lng ?? 0);
  if (!lat || !lng) {
    const anchor = PROVINCE_ANCHORS[province] ?? PROVINCE_ANCHORS.Gauteng;
    lat = +jitter(anchor.lat, 0.3).toFixed(4);
    lng = +jitter(anchor.lng, 0.3).toFixed(4);
  }

  // Features: if empty array, extract from full description
  let featuresArr: string[];
  try {
    const parsedF = JSON.parse(raw.features ?? '[]');
    featuresArr = Array.isArray(parsedF) ? parsedF : [];
  } catch {
    featuresArr = [];
  }
  if (featuresArr.length === 0) {
    featuresArr = extractFeatures(fullDesc);
  }

  // Bathrooms: source data sometimes has bedrooms == bathrooms == X.
  // Cap bathrooms at bedrooms + 2 to avoid silly counts (5-bath 3-bed etc).
  const bedrooms = Number(raw.bedrooms ?? 0);
  let bathrooms = Number(raw.bathrooms ?? 0);
  if (bedrooms > 0 && bathrooms > bedrooms + 2) {
    bathrooms = Math.max(1, Math.min(bathrooms, bedrooms + 1));
  }

  const isForRent =
    typeof raw.isForRent === 'boolean'
      ? raw.isForRent
      : parsed?.isForRent ?? true;
  const propertyType = raw.propertyType ?? 'House';

  return {
    listingId: raw.listing_id,
    listingUrl: url,
    title: raw.title ?? `Property in ${location}`,
    description: raw.description ?? '',
    fullDescription: fullDesc,
    price: Number(raw.price ?? 0),
    location,
    propertyType,
    bedrooms,
    bathrooms,
    lat,
    lng,
    features: JSON.stringify(featuresArr),
    imageUrl: raw.imageUrl ?? null,
    hasImage: computeHasImage(raw.imageUrl),
    isForRent,
    province,
    region: parsed?.region,
    city: parsed?.city,
    source: 'privateproperty',
    searchTags: buildSearchTags({
      isForRent,
      province,
      location,
      propertyType,
      bedrooms,
    }),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

// ----------------------------------------------------------------------------
// Clear existing collection (only if --replace)
// ----------------------------------------------------------------------------
async function clearCollection() {
  let total = 0;
  while (true) {
    const snap = await db.collection(COLLECTION).limit(200).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    total += snap.size;
  }
  return total;
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
  console.log('Source folder:', SRC_DIR);
  if (!fs.existsSync(SRC_DIR)) {
    throw new Error(`Source folder not found: ${SRC_DIR}`);
  }

  if (REPLACE_ALL) {
    console.log('Clearing existing properties...');
    const cleared = await clearCollection();
    console.log(`  removed ${cleared} existing docs.`);
  }

  const entries = fs
    .readdirSync(SRC_DIR)
    .filter((f) => f.toLowerCase().endsWith('.json'));
  console.log(`Found ${entries.length} JSON files. Importing...`);

  const col = db.collection(COLLECTION);
  const skippedNoId: string[] = [];
  let written = 0;
  const CHUNK = 200;

  for (let i = 0; i < entries.length; i += CHUNK) {
    const slice = entries.slice(i, i + CHUNK);
    const batch = db.batch();
    for (const fname of slice) {
      const filePath = path.join(SRC_DIR, fname);
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as RawRecord;
      const doc = normalize(raw);
      if (!doc.listingId) {
        skippedNoId.push(fname);
        continue;
      }
      const docId = `pp_${doc.listingId}`;
      batch.set(col.doc(docId), doc, { merge: true });
    }
    await batch.commit();
    written += slice.length - skippedNoId.length + (i > 0 ? 0 : 0);
    console.log(
      `  wrote ${Math.min(written, entries.length)}/${entries.length}`,
    );
  }

  // Province / type summary
  const byProvince: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let rent = 0;
  for (const fname of entries) {
    try {
      const raw = JSON.parse(
        fs.readFileSync(path.join(SRC_DIR, fname), 'utf8'),
      ) as RawRecord;
      const p = raw.province ?? 'Unknown';
      byProvince[p] = (byProvince[p] ?? 0) + 1;
      const t = raw.propertyType ?? 'Unknown';
      byType[t] = (byType[t] ?? 0) + 1;
      if (raw.isForRent !== false) rent++;
    } catch {
      // skip
    }
  }

  console.log('\nDone.');
  console.log('By province:', byProvince);
  console.log('By type:', byType);
  console.log(`Rent / Buy: ${rent} / ${entries.length - rent}`);
  if (skippedNoId.length) {
    console.log(`Skipped (no listing_id): ${skippedNoId.length}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
