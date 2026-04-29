/**
 * For a given buy listing, estimate the equivalent monthly rent in the same
 * suburb for similar bedrooms (±1). Used by the Rent vs Buy widget.
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const suburb: string = body.suburb;
  const bedrooms: number = Number(body.bedrooms ?? 0);

  if (!suburb || !bedrooms) {
    return NextResponse.json(
      { error: 'suburb and bedrooms are required' },
      { status: 400 },
    );
  }

  try {
    const db = getDb();
    const snap = await db
      .collection('properties')
      .where('isForRent', '==', true)
      .limit(500)
      .get();

    const candidates = snap.docs
      .map((d) => d.data() as Record<string, any>)
      .filter((p) => {
        const loc = String(p.location ?? '').toLowerCase();
        return (
          loc.includes(suburb.toLowerCase()) &&
          Math.abs(Number(p.bedrooms ?? 0) - bedrooms) <= 1
        );
      });

    if (candidates.length === 0) {
      // Fall back to any rental in the suburb regardless of bedrooms
      const anyInSuburb = snap.docs
        .map((d) => d.data() as Record<string, any>)
        .filter((p) =>
          String(p.location ?? '')
            .toLowerCase()
            .includes(suburb.toLowerCase()),
        );
      if (anyInSuburb.length === 0) {
        return NextResponse.json({
          estimate: null,
          sampleSize: 0,
          message: `No rental comps found in ${suburb}`,
        });
      }
      const avg =
        anyInSuburb.reduce((s, p) => s + Number(p.price ?? 0), 0) /
        anyInSuburb.length;
      return NextResponse.json({
        estimate: Math.round(avg / 500) * 500,
        sampleSize: anyInSuburb.length,
        method: 'suburb-average',
      });
    }

    const prices = candidates.map((p) => Number(p.price ?? 0)).sort((a, b) => a - b);
    // Use median for robustness
    const median = prices[Math.floor(prices.length / 2)];

    return NextResponse.json({
      estimate: Math.round(median / 500) * 500,
      sampleSize: candidates.length,
      method: 'bedroom-matched-median',
    });
  } catch (err: any) {
    console.error('rent-estimate error:', err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}
