/**
 * Firebase Web SDK config — browser-side only.
 *
 * NOT used by the chat API (`searchProperties` goes through `firebase-admin`
 * via `src/lib/firebase.ts`). Kept here for future client-side features:
 *   - Firebase Auth (user accounts, magic-link login)
 *   - Firebase Storage (browser uploads of property images)
 *   - Realtime Firestore listeners (live property feeds)
 *
 * To use this, add `firebase` to dependencies (`npm i firebase`) and import
 * `getApp` from this file in a "use client" component.
 *
 * The values below are the public web config — safe to ship to the browser.
 * They DO NOT grant admin access; that's gated by Firestore security rules.
 */

export const firebaseConfig = {
  apiKey: 'AIzaSyBazvLVhDcskcg0g8UpDHEuEhho8DcYXxE',
  authDomain: 'propalign-500fc.firebaseapp.com',
  projectId: 'propalign-500fc',
  storageBucket: 'propalign-500fc.firebasestorage.app',
  messagingSenderId: '372059628465',
  appId: '1:372059628465:web:e01e6ecd465be31f4b5390',
  measurementId: 'G-53K93TKC7Q',
};

// When you actually need it later, uncomment:
// import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
// let app: FirebaseApp;
// export function getClientApp(): FirebaseApp {
//   if (!app) app = getApps()[0] ?? initializeApp(firebaseConfig);
//   return app;
// }
