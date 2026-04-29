import { NextResponse } from 'next/server';
import { ping } from '@/lib/properties-repo';

/**
 * Health check for the Firestore connection. Returns the document count of
 * the `properties` collection (capped at 1) and the title of the first row,
 * so we know auth + reads are working without dumping the whole table.
 */
export async function GET() {
  try {
    const result = await ping();
    return NextResponse.json({
      status: 'connected',
      backend: 'firestore',
      collection: 'properties',
      sampleCount: result.count,
      sampleTitle: result.sample ?? null,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        backend: 'firestore',
        error: err?.message ?? String(err),
        hint:
          'Check FIREBASE_SERVICE_ACCOUNT_JSON (or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY) in .env. See docs/firebase-migration.md.',
      },
      { status: 500 },
    );
  }
}
