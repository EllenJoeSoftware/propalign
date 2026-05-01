/**
 * Wipe the entire Firestore `properties` collection.
 *
 *   npm run clear:firestore           # asks for confirmation
 *   npm run clear:firestore -- --yes  # no prompt (CI / scripted use)
 *
 * Deletes in batches of 500 (Firestore's per-batch cap) and prints a
 * running total. Safe to re-run if interrupted — just resumes deleting
 * whatever is left.
 */

import 'dotenv/config';
import * as readline from 'node:readline';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const COLLECTION = 'properties';
const BATCH_SIZE = 500;

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

async function confirm(): Promise<boolean> {
  if (process.argv.includes('--yes')) return true;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(
      `\nThis will DELETE every document in the "${COLLECTION}" collection.\nType "yes" to continue: `,
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'yes');
      },
    );
  });
}

async function main() {
  // Show what we're about to delete.
  const countSnap = await db.collection(COLLECTION).count().get();
  const total = countSnap.data().count;
  console.log(`Collection "${COLLECTION}" has ${total} documents.`);

  if (total === 0) {
    console.log('Nothing to delete.');
    return;
  }

  if (!(await confirm())) {
    console.log('Aborted.');
    return;
  }

  let deleted = 0;
  while (true) {
    const snap = await db.collection(COLLECTION).limit(BATCH_SIZE).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += snap.size;
    process.stdout.write(`  deleted ${deleted}/${total}…\r`);
  }
  console.log(`\nDone. Removed ${deleted} documents.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
