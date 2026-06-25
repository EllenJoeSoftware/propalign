/**
 * Partner inquiry endpoint — stores agent/agency interest in Firestore.
 * Collection: `partner_inquiries/<auto-id>`
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim().toLowerCase();
  const agency = (body.agency ?? '').trim();
  const phone = (body.phone ?? '').trim();
  const message = (body.message ?? '').trim();

  // Validation
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'A valid email is required' },
      { status: 400 },
    );
  }

  try {
    const db = getDb();
    const ref = db.collection('partner_inquiries').doc();

    await ref.set({
      name,
      email,
      agency: agency || null,
      phone: phone || null,
      message: message || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ received: true }, { status: 201 });
  } catch (err: any) {
    console.error('partner inquiry error:', err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? 'Could not save inquiry' },
      { status: 500 },
    );
  }
}
