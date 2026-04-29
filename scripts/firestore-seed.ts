/**
 * Seed Firestore `properties` with ~300 procedurally generated SA listings.
 *
 *   npm run seed:firestore
 *
 * Distribution roughly mirrors real SA listing density: more in Gauteng &
 * Western Cape, fewer in Northern Cape & Limpopo. Prices reflect suburb tier.
 * The collection is CLEARED before seeding — re-running gives a fresh dataset.
 */

import 'dotenv/config';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { SUBURBS_BY_PROVINCE, type Province } from '../src/lib/sa-suburbs';
import { buildSearchTags, computeHasImage } from '../src/lib/property-tags';

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
db.settings({ ignoreUndefinedProperties: true });

// ----------------------------------------------------------------------------
// Geography & price tiers
// ----------------------------------------------------------------------------

/** Approximate centre lat/lng per province. Used as anchor with random jitter. */
const PROVINCE_ANCHORS: Record<Province, { lat: number; lng: number }> = {
  Gauteng:         { lat: -26.10, lng: 28.05 },
  'Western Cape':  { lat: -33.93, lng: 18.50 },
  'KwaZulu-Natal': { lat: -29.85, lng: 31.00 },
  'Eastern Cape':  { lat: -33.95, lng: 25.60 },
  'Free State':    { lat: -29.10, lng: 26.20 },
  Mpumalanga:      { lat: -25.50, lng: 30.97 },
  Limpopo:         { lat: -23.90, lng: 29.45 },
  'North West':    { lat: -25.60, lng: 27.24 },
  'Northern Cape': { lat: -28.74, lng: 24.77 },
};

/** Weighted province distribution for the 300-property mix. */
const PROVINCE_QUOTA: Record<Province, number> = {
  Gauteng: 105,
  'Western Cape': 75,
  'KwaZulu-Natal': 36,
  'Eastern Cape': 21,
  'Free State': 15,
  Mpumalanga: 15,
  Limpopo: 12,
  'North West': 12,
  'Northern Cape': 9,
};

type Tier = 'premium' | 'upper_mid' | 'mid' | 'affordable';

const TIER_HINTS: Record<string, Tier> = {
  // Premium
  Sandton: 'premium', Bryanston: 'premium', 'Hyde Park': 'premium',
  'Camps Bay': 'premium', Clifton: 'premium', 'Bantry Bay': 'premium',
  Fresnaye: 'premium', Bishopscourt: 'premium', Constantia: 'premium',
  Llandudno: 'premium', Saxonwold: 'premium', Houghton: 'premium',
  Morningside: 'premium', Waterkloof: 'premium', Umhlanga: 'premium',
  'La Lucia': 'premium', Bedfordview: 'premium',
  // Upper-mid
  Rosebank: 'upper_mid', 'Sea Point': 'upper_mid', 'Green Point': 'upper_mid',
  Gardens: 'upper_mid', Tamboerskloof: 'upper_mid', Newlands: 'upper_mid',
  Stellenbosch: 'upper_mid', 'Somerset West': 'upper_mid',
  'Durban North': 'upper_mid', Hillcrest: 'upper_mid', Kloof: 'upper_mid',
  Centurion: 'upper_mid', Hatfield: 'upper_mid', Lynnwood: 'upper_mid',
  Menlyn: 'upper_mid', Midrand: 'upper_mid', Edenvale: 'upper_mid',
  Greenside: 'upper_mid', Linden: 'upper_mid', Northcliff: 'upper_mid',
  Killarney: 'upper_mid', Parktown: 'upper_mid', Brooklyn: 'upper_mid',
  'Hout Bay': 'upper_mid',
  // Affordable
  Soweto: 'affordable', Mthatha: 'affordable', 'Aliwal North': 'affordable',
  Queenstown: 'affordable', Welkom: 'affordable', Bethlehem: 'affordable',
  Sasolburg: 'affordable', Kroonstad: 'affordable', Parys: 'affordable',
  Emalahleni: 'affordable', Middelburg: 'affordable', Secunda: 'affordable',
  Sabie: 'affordable', Hazyview: 'affordable', Standerton: 'affordable',
  Ermelo: 'affordable', Mokopane: 'affordable', Thohoyandou: 'affordable',
  Phalaborwa: 'affordable', 'Louis Trichardt': 'affordable',
  Lephalale: 'affordable', Mahikeng: 'affordable', Klerksdorp: 'affordable',
  Brits: 'affordable', Lichtenburg: 'affordable', Vryburg: 'affordable',
  Kuruman: 'affordable', Kathu: 'affordable', Springbok: 'affordable',
  'De Aar': 'affordable', Newcastle: 'affordable', Empangeni: 'affordable',
};

function tierFor(suburb: string): Tier {
  return TIER_HINTS[suburb] ?? 'mid';
}

// rent (R/mo) and buy (R) ranges per tier
const TIER_RENT: Record<Tier, [number, number]> = {
  premium: [25_000, 80_000],
  upper_mid: [13_000, 30_000],
  mid: [7_000, 18_000],
  affordable: [3_500, 9_500],
};
const TIER_BUY: Record<Tier, [number, number]> = {
  premium: [4_500_000, 28_000_000],
  upper_mid: [1_800_000, 6_500_000],
  mid: [950_000, 2_800_000],
  affordable: [420_000, 1_400_000],
};

// ----------------------------------------------------------------------------
// Type / bedroom / feature / image distributions
// ----------------------------------------------------------------------------

const PROPERTY_TYPES_W: Array<[string, number]> = [
  ['Apartment', 35],
  ['House', 35],
  ['Townhouse', 15],
  ['Cottage', 8],
  ['Studio', 7],
];

const BEDROOMS_BY_TYPE: Record<string, number[]> = {
  Studio: [1],
  Apartment: [1, 1, 2, 2, 2, 3, 3],
  Cottage: [1, 1, 2],
  Townhouse: [2, 3, 3, 4],
  House: [2, 3, 3, 4, 4, 5],
};

const ALL_FEATURES = [
  'Security', 'Garden', 'Garage', 'Pool', 'Gym', 'Pet Friendly',
  'Solar', 'Inverter', 'Borehole', 'Generator', 'Fibre',
  'Quiet', 'Central', 'Walk to Transport', 'Café Strip', 'Sea View',
  'Mountain View', 'Modern', 'Newly Renovated', 'Original Character',
  'Gated Estate', 'Complex', 'Standalone', 'Patio', 'Balcony',
  'Open Plan', 'En-Suite', 'Study', 'Servants Quarters', 'Wheelchair Access',
];

const IMAGE_POOL = [
  'photo-1545324418-cc1a3fa10c00', // sandton-style apt
  'photo-1512917774080-9991f1c4c750', // garden cottage
  'photo-1600585154340-be6161a56a0c', // family house
  'photo-1502672260266-1c1ef2d93688', // studio
  'photo-1502005229762-cf1b2da7c5d6', // modern home exterior
  'photo-1560448204-e02f11c3d0e2', // beach house
  'photo-1564013799919-ab600027ffc6', // contemporary
  'photo-1568605114967-8130f3a36994', // lounge interior
  'photo-1570129477492-45c003edd2be', // suburb house
  'photo-1582268611958-ebfd161ef9cf', // apartment block
  'photo-1494526585095-c41746248156', // open-plan kitchen
  'photo-1505691938895-1758d7feb511', // garden
  'photo-1583608205776-bfb35f0d9f83', // pool exterior
  'photo-1593696140826-c58b021acf8b', // bedroom
  'photo-1493809842364-78817add7ffb', // urban
  'photo-1519302959554-a75be0afc82a', // corner apt
];

// ----------------------------------------------------------------------------
// Random helpers
// ----------------------------------------------------------------------------

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickWeighted<T>(items: Array<[T, number]>): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of items) {
    r -= w;
    if (r <= 0) return v;
  }
  return items[items.length - 1][0];
}
function sampleN<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}
function jitter(v: number, range: number): number {
  return v + (Math.random() - 0.5) * 2 * range;
}
function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

// ----------------------------------------------------------------------------
// Generate one property
// ----------------------------------------------------------------------------

function generateProperty(province: Province) {
  const suburbs = SUBURBS_BY_PROVINCE[province];
  const suburb = pick(suburbs);
  const tier = tierFor(suburb);

  const propertyType = pickWeighted(PROPERTY_TYPES_W);
  const bedrooms = pick(BEDROOMS_BY_TYPE[propertyType]);
  const bathrooms = Math.max(1, Math.min(bedrooms, randInt(1, 3)));

  const isForRent = Math.random() < 0.65;
  const [lo, hi] = isForRent ? TIER_RENT[tier] : TIER_BUY[tier];
  // Smaller properties skew lower in the tier band
  const sizeFactor = bedrooms <= 1 ? 0.5 : bedrooms <= 2 ? 0.7 : 1;
  const rawPrice = rand(lo, hi) * sizeFactor;
  const price = isForRent
    ? roundTo(rawPrice, 500)
    : roundTo(rawPrice, 25_000);

  const anchor = PROVINCE_ANCHORS[province];
  const lat = +jitter(anchor.lat, 0.3).toFixed(4);
  const lng = +jitter(anchor.lng, 0.3).toFixed(4);

  // Features biased by tier and type
  const featureCount = randInt(3, 6);
  const features = sampleN(ALL_FEATURES, featureCount);
  if (tier === 'premium' && Math.random() < 0.7) features.push('Security');
  if ((propertyType === 'Apartment' || propertyType === 'Studio') &&
      Math.random() < 0.4) features.push('Walk to Transport');
  if (propertyType === 'House' && Math.random() < 0.6) features.push('Garden');
  // Deduplicate
  const featuresUniq = Array.from(new Set(features));

  const titleAdj = pick([
    'Modern', 'Spacious', 'Cosy', 'Light-filled', 'Classic',
    'Contemporary', 'Charming', 'Generous', 'Elegant', 'Renovated',
  ]);
  const title = `${titleAdj} ${bedrooms}-bedroom ${propertyType.toLowerCase()} in ${suburb}`;

  const description = buildDescription({
    suburb, propertyType, bedrooms, bathrooms, tier, isForRent, features: featuresUniq,
  });

  const imageUrl =
    `https://images.unsplash.com/${pick(IMAGE_POOL)}?w=800&q=80`;

  return {
    title,
    description,
    price,
    location: suburb,
    propertyType,
    bedrooms,
    bathrooms,
    lat,
    lng,
    features: JSON.stringify(featuresUniq),
    imageUrl,
    hasImage: computeHasImage(imageUrl),
    isForRent,
    province, // bonus field — useful for future filtering
    searchTags: buildSearchTags({
      isForRent,
      province,
      location: suburb,
      propertyType,
      bedrooms,
    }),
  };
}

function buildDescription(opts: {
  suburb: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  tier: Tier;
  isForRent: boolean;
  features: string[];
}): string {
  const { suburb, propertyType, bedrooms, bathrooms, tier, isForRent, features } = opts;
  const tierLine =
    tier === 'premium'
      ? 'an upmarket address'
      : tier === 'upper_mid'
        ? 'a sought-after pocket'
        : tier === 'affordable'
          ? 'a quiet, value-for-money area'
          : 'an established neighbourhood';
  const featLine = features.length
    ? ` Features: ${features.slice(0, 4).join(', ')}.`
    : '';
  const intent = isForRent ? 'Available to rent.' : 'On the market for sale.';
  return `A ${bedrooms}-bed, ${bathrooms}-bath ${propertyType.toLowerCase()} in ${suburb}, ${tierLine}.${featLine} ${intent}`;
}

// ----------------------------------------------------------------------------
// Clear + seed
// ----------------------------------------------------------------------------

const COLLECTION = 'properties';

async function clearCollection() {
  const col = db.collection(COLLECTION);
  let total = 0;
  while (true) {
    const snap = await col.limit(200).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    total += snap.size;
  }
  return total;
}

async function main() {
  console.log('Connecting to project:',
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? '{}').project_id ??
    process.env.FIREBASE_PROJECT_ID);

  console.log('Clearing existing properties...');
  const cleared = await clearCollection();
  console.log(`  removed ${cleared} existing docs.`);

  // Build the full list before writing so we can log a clean summary.
  const all: ReturnType<typeof generateProperty>[] = [];
  for (const province of Object.keys(PROVINCE_QUOTA) as Province[]) {
    const quota = PROVINCE_QUOTA[province];
    for (let i = 0; i < quota; i++) {
      all.push(generateProperty(province));
    }
  }

  // Stamp + write in chunks of 250 (Firestore batch cap is 500 ops).
  const now = new Date();
  const col = db.collection(COLLECTION);
  let written = 0;
  const CHUNK = 250;
  for (let i = 0; i < all.length; i += CHUNK) {
    const batch = db.batch();
    for (const p of all.slice(i, i + CHUNK)) {
      batch.set(col.doc(), { ...p, createdAt: now, updatedAt: now });
    }
    await batch.commit();
    written += Math.min(CHUNK, all.length - i);
    console.log(`  wrote ${written}/${all.length}`);
  }

  // Summary
  const byProvince: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let rent = 0;
  for (const p of all) {
    byProvince[p.province] = (byProvince[p.province] ?? 0) + 1;
    byType[p.propertyType] = (byType[p.propertyType] ?? 0) + 1;
    if (p.isForRent) rent++;
  }
  console.log('\nDone.');
  console.log('By province:', byProvince);
  console.log('By type:', byType);
  console.log(`Rent / Buy: ${rent} / ${all.length - rent}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
