/**
 * Fetch a small batch of properties by ID for the /compare page.
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import type { PropertyRow } from '@/lib/scoring';

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const ids: string[] = Array.isArray(body.ids) ? body.ids.slice(0, 4) : [];
  if (ids.length === 0) {
    return NextResponse.json({ results: [] });
  }

  try {
    const db = getDb();
    const docs = await Promise.all(
      ids.map((id) => db.collection('properties').doc(id).get()),
    );

    const results: PropertyRow[] = docs
      .filter((d) => d.exists)
      .map((d) => {
        const v = d.data() as Record<string, any>;
        return {
          id: d.id,
          title: v.title ?? '',
          description: v.description ?? '',
          price: Number(v.price ?? 0),
          location: v.location ?? '',
          propertyType: v.propertyType ?? '',
          bedrooms: Number(v.bedrooms ?? 0),
          bathrooms: Number(v.bathrooms ?? 0),
          lat: Number(v.lat ?? 0),
          lng: Number(v.lng ?? 0),
          features:
            typeof v.features === 'string'
              ? v.features
              : JSON.stringify(v.features ?? []),
          imageUrl: v.imageUrl ?? null,
          isForRent: v.isForRent === true,
          listingId: v.listingId ?? v.listing_id,
          listingUrl: v.listingUrl ?? v.listing_url,
          fullDescription: v.fullDescription ?? v['full description'],
          city: v.city,
          region: v.region,
          province: v.province,
          source: v.source,
        };
      });

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('properties/by-ids error:', err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}
