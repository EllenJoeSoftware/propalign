/**
 * One-shot backfill: add `searchTags` to every existing property doc.
 *
 *   npm run migrate:tags
 *
 * Idempotent — safe to re-run. Skips docs that already have non-empty tags
 * unless --force is passed.
 */

import 'dotenv/config';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { buildSearchTags, computeHasImage } from '../src/lib/property-tags';

const FORCE = process.argv.includes('--force');

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

async function main() {
  console.log('Backfilling searchTags…');
  const col = db.collection('properties');
  let updated = 0;
  let skipped = 0;
  let scanned = 0;
  const CHUNK = 250;

  // Use cursor pagination (so we can't OOM even on 100k docs).
  let last: FirebaseFirestore.QueryDocumentSnapshot | null = null;

  while (true) {
    let q: FirebaseFirestore.Query = col.orderBy('__name__').limit(CHUNK);
    if (last) q = q.startAfter(last);
    const snap = await q.get();
    if (snap.empty) break;

    const batch = db.batch();
    let inBatch = 0;
    for (const doc of snap.docs) {
      scanned++;
      const v = doc.data() as Record<string, any>;
      const hasTagsAlready =
        Array.isArray(v.searchTags) && v.searchTags.length > 0;
      const hasImageFlagAlready = typeof v.hasImage === 'boolean';
      if (hasTagsAlready && hasImageFlagAlready && !FORCE) {
        skipped++;
        continue;
      }
      const update: Record<string, any> = {};
      if (!hasTagsAlready || FORCE) {
        update.searchTags = buildSearchTags({
          isForRent: v.isForRent === true,
          province: v.province,
          location: v.location,
          propertyType: v.propertyType,
          bedrooms: Number(v.bedrooms ?? 0),
        });
      }
      if (!hasImageFlagAlready || FORCE) {
        update.hasImage = computeHasImage(v.imageUrl);
      }
      batch.update(doc.ref, update);
      inBatch++;
      updated++;
    }
    if (inBatch > 0) await batch.commit();
    last = snap.docs[snap.docs.length - 1];
    console.log(`  scanned ${scanned}, updated ${updated}, skipped ${skipped}`);
    if (snap.size < CHUNK) break;
  }

  console.log(`\nDone. Updated ${updated} docs. Skipped ${skipped} (already had tags). Pass --force to overwrite.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
