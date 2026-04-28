/**
 * Firebase Admin SDK initialization.
 *
 * Requires one of these env-var setups:
 *   (A) FIREBASE_SERVICE_ACCOUNT_JSON  — full service-account JSON as a string
 *   (B) FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *       (private key with literal \n escapes)
 *
 * See docs/firebase-migration.md for setup steps.
 */

import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const globalForFirebase = globalThis as unknown as {
  firebaseApp?: App;
  firestoreDb?: Firestore;
};

function buildCredentials() {
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

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase credentials missing. Set FIREBASE_SERVICE_ACCOUNT_JSON, ' +
        'or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.',
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
  // Ignore undefined fields when writing — saves us a bunch of "or null" checks.
  db.settings({ ignoreUndefinedProperties: true });
  globalForFirebase.firestoreDb = db;
  return db;
}
