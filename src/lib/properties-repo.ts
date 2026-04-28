/**
 * Firestore properties repo.
 *
 * Firestore can only apply ONE range filter per query. We push the most
 * selective filters server-side and finish the rest in JavaScript on a
 * bounded candidate set. The candidate window is wide enough for browse-mode
 * pagination over a few hundred listings.
 */

import { getDb } from './firebase';
import type { PropertyRow } from './scoring';

const COLLECTION = 'properties';

export interface PropertyFilters {
  isBuying?: boolean;
  budget?: number;
  minBedrooms?: number;
  propertyType?: string;
  /** Suburb partial-match list. ANY match counts. Applied in-memory. */
  areas?: string[];
  /** Maximum candidates to fetch before in-memory filtering. */
  limit?: number;
}

/** Fetch matching candidates. */
export async function findCandidates(
  filters: PropertyFilters,
): Promise<PropertyRow[]> {
  const db = getDb();
  let q: FirebaseFirestore.Query = db.collection(COLLECTION);

  if (filters.isBuying !== undefined) {
    q = q.where('isForRent', '==', !filters.isBuying);
  }
  if (filters.propertyType) {
    q = q.where('propertyType', '==', filters.propertyType);
  }
  if (filters.budget && filters.budget > 0) {
    q = q.where('price', '<=', filters.budget).orderBy('price', 'asc');
  } else {
    q = q.orderBy('price', 'asc');
  }

  // Default candidate window is generous because suburb partial-match and
  // bedroom filters run in-memory after this query — a too-narrow window
  // collapses to zero when the chosen suburbs are pricier than the cheapest
  // 30-60 rentals under the budget cap.
  q = q.limit(filters.limit ?? 500);

  const snap = await q.get();

  const rows: PropertyRow[] = snap.docs.map((d) => {
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
    };
  });

  let out = rows;
  if (filters.minBedrooms && filters.minBedrooms > 0) {
    out = out.filter((r) => r.bedrooms >= filters.minBedrooms!);
  }
  if (filters.areas && filters.areas.length > 0) {
    const needles = filters.areas.map((a) => a.toLowerCase());
    out = out.filter((r) => {
      const loc = r.location.toLowerCase();
      return needles.some((n) => loc.includes(n));
    });
  }
  return out;
}

/** Health-check ping. */
export async function ping(): Promise<{ count: number; sample?: string }> {
  const db = getDb();
  const snap = await db.collection(COLLECTION).limit(1).get();
  return {
    count: snap.size,
    sample: snap.docs[0]?.get('title'),
  };
}
