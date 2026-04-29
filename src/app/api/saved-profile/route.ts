/**
 * Save (or update) a user profile + email for weekly digests. Stored in
 * Firestore at `saved_profiles/<email>`. Doc ID is the lowercased email
 * so re-saves overwrite cleanly.
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import type { UserProfile } from '@/lib/scoring';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email: string = (body.email ?? '').trim().toLowerCase();
  const profile: UserProfile = body.profile;
  const wantsAlerts: boolean = body.wantsAlerts ?? true;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'A valid email is required' },
      { status: 400 },
    );
  }
  if (!profile) {
    return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
  }

  try {
    const db = getDb();
    const ref = db.collection('saved_profiles').doc(email);

    // Set createdAt only if the doc didn't already exist; otherwise leave it.
    const existing = await ref.get();
    const payload: Record<string, any> = {
      email,
      profile,
      wantsAlerts,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (!existing.exists) {
      payload.createdAt = FieldValue.serverTimestamp();
    }
    await ref.set(payload, { merge: true });

    return NextResponse.json({
      saved: true,
      email,
      digest: wantsAlerts
        ? 'You\'ll get a curated weekly digest of new matches.'
        : 'Profile saved. Email digests are off — toggle them anytime.',
    });
  } catch (err: any) {
    console.error('saved-profile error:', err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? 'Could not save' },
      { status: 500 },
    );
  }
}

/** GET returns the saved profile for an email if it exists (used to restore). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get('email') ?? '').trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  try {
    const db = getDb();
    const doc = await db.collection('saved_profiles').doc(email).get();
    if (!doc.exists) return NextResponse.json({ profile: null });
    return NextResponse.json({ profile: doc.data() });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Could not load' },
      { status: 500 },
    );
  }
}
