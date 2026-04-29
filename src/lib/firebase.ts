/**
 * Firebase Admin SDK initialization.
 *
 * Supports three credential sources, in priority order. Use whichever fits
 * your hosting environment best:
 *
 *   1. FIREBASE_SERVICE_ACCOUNT_PATH
 *      Path to a JSON file on disk (e.g. /home/user/.firebase/key.json).
 *      Cleanest for shared cPanel hosting where complex env-var values get
 *      mangled by the shell.
 *
 *   2. FIREBASE_SERVICE_ACCOUNT_JSON_B64
 *      Base64-encoded service account JSON. One env var, no shell-quoting
 *      headaches. Works everywhere.
 *
 *   3. FIREBASE_SERVICE_ACCOUNT_JSON
 *      Raw service-account JSON as a single env var. Works on Vercel /
 *      Cloud Run / Firebase App Hosting; often broken on shared cPanel.
 *
 *   4. FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *      Three-variable split. The private key must use \n escapes for newlines.
 */

import * as fs from 'node:fs';
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const globalForFirebase = globalThis as unknown as {
  firebaseApp?: App;
  firestoreDb?: Firestore;
};

function buildCredentials() {
  // (1) Path to a file on disk
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path) {
    try {
      const raw = fs.readFileSync(path, 'utf8');
      return cert(JSON.parse(raw));
    } catch (err: any) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_PATH is set (${path}) but the file is unreadable or not valid JSON: ${err.message}`,
      );
    }
  }

  // (2) Base64-encoded JSON
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64;
  if (b64) {
    try {
      const json = Buffer.from(b64.trim(), 'base64').toString('utf8');
      return cert(JSON.parse(json));
    } catch (err: any) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON_B64 is set but is not valid base64-encoded JSON: ' +
          err.message,
      );
    }
  }

  // (3) Raw JSON
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      return cert(JSON.parse(json));
    } catch (err: any) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON is set but not valid JSON: ' +
          err.message,
      );
    }
  }

  // (4) Three-variable split
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'No Firebase credentials configured. Set ONE of:\n' +
        '  - FIREBASE_SERVICE_ACCOUNT_PATH (path to JSON file)\n' +
        '  - FIREBASE_SERVICE_ACCOUNT_JSON_B64 (base64-encoded JSON)\n' +
        '  - FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON)\n' +
        '  - FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY',
    );
  }

  return cert({ projectId, clientEmail, privateKey });
}

function getApp(): App {
  if (globalForFirebase.firebaseApp) return globalForFirebase.firebaseApp;
  const existing = getApps()[0];
  if (existing) {
    globalForFirebase.firebaseApp = existing;
    return existing;
  }
  const app = initializeApp({ credential: buildCredentials() });
  globalForFirebase.firebaseApp = app;
  return app;
}

export function getDb(): Firestore {
  if (globalForFirebase.firestoreDb) return globalForFirebase.firestoreDb;
  const db = getFirestore(getApp());
  db.settings({ ignoreUndefinedProperties: true });
  globalForFirebase.firestoreDb = db;
  return db;
}
