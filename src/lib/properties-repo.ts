/**
 * Firestore properties repo.
 *
 * Two query paths:
 *
 *   1. `findCandidates()` — wide fetch for SCORE-MODE searches. The chat
 *      route uses this when it has profile signal (life-stage, top priorities)
 *      and needs to score every match in memory. Suburb filtering happens
 *      server-side via the `searchTags` array (`array-contains-any`), so we
 *      only pull docs in the user's chosen suburbs from Firestore — no more
 *      "30 cheapest renters but none in Sandton" trap.
 *
 *   2. `findPage()` — true cursor pagination for BROWSE-MODE listings. The
 *      right pane uses this when the user has no preference signal yet and
 *      we just want to flip through the catalogue. Each page is one Firestore
 *      query; the next-page cursor is the doc ID of the last result.
 *
 * Plus `countMatching()` for the "X of Y" headline using the Firestore
 * `count()` aggregate (one cheap server-side query, no doc reads).
 */

import { getDb } from './firebase';
import type { PropertyRow } from './scoring';
import {
  bedroomBucketsForMin,
  tagSlug,
} from './property-tags';

const COLLECTION = 'properties';

/** Coerce a Firestore Timestamp / Date / string to an ISO string (or undef). */
function tsToIso(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value.toDate === 'function') {
    try {
      return value.toDate().toISOString();
    } catch {
      return undefined;
    }
  }
  if (typeof value._seconds === 'number') {
    return new Date(value._seconds * 1000).toISOString();
  }
  return undefined;
}

function snapToRow(d: FirebaseFirestore.QueryDocumentSnapshot): PropertyRow {
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
    createdAt: tsToIso(v.createdAt),
  };
}

// ----------------------------------------------------------------------------
// Filters
// ----------------------------------------------------------------------------

export interface PropertyFilters {
  isBuying?: boolean;
  budget?: number;
  minBedrooms?: number;
  propertyType?: string;
  /** Suburb names (case-insensitive). */
  areas?: string[];
  /** Maximum candidates to fetch (used by score-mode). */
  limit?: number;
}

/**
 * Build the base server-side query that BOTH paths share. Returns a Query
 * already filtered by `isForRent`, `propertyType`, `searchTags` (suburbs +
 * bedrooms), and ordered by price.
 *
 * Firestore allows ONE range filter per query — we use `price`. We use
 * `array-contains-any` once on `searchTags` to combine suburb + bedroom
 * minimum filters into a single tag union (up to Firestore's 30-value cap).
 */
function buildBaseQuery(
  filters: PropertyFilters,
): FirebaseFirestore.Query {
  const db = getDb();
  let q: FirebaseFirestore.Query = db.collection(COLLECTION);

  // Always exclude listings without images — denormalized boolean so it
  // composes with other filters (a `where imageUrl != null` query would
  // burn our single-inequality budget).
  q = q.where('hasImage', '==', true);

  if (filters.isBuying !== undefined) {
    q = q.where('isForRent', '==', !filters.isBuying);
  }
  if (filters.propertyType) {
    q = q.where('propertyType', '==', filters.propertyType);
  }
  if (filters.budget && filters.budget > 0) {
    q = q.where('price', '<=', filters.budget);
  }

  // Combine suburb + bedroom-bucket filters into an array-contains-any check.
  // We can use array-contains-any AT MOST once per query, so we union the
  // tags into a single array. If the user picks more than 30 suburbs, fall
  // back to no server-side suburb filter (then filter in JS after the fetch).
  const suburbTags = (filters.areas ?? []).map((s) => `suburb:${tagSlug(s)}`);
  const bedTags =
    filters.minBedrooms && filters.minBedrooms > 1
      ? bedroomBucketsForMin(filters.minBedrooms)
      : [];

  // We can only put ONE of {suburb tags, bed tags} into array-contains-any
  // (Firestore restricts to one such filter per query). Suburbs are usually
  // far more selective so we prefer them.
  if (suburbTags.length > 0 && suburbTags.length <= 30) {
    q = q.where('searchTags', 'array-contains-any', suburbTags);
  } else if (suburbTags.length === 0 && bedTags.length > 0 && bedTags.length <= 30) {
    q = q.where('searchTags', 'array-contains-any', bedTags);
  }

  q = q.orderBy('price', 'asc');
  return q;
}

/**
 * In-memory finishing pass. Applies anything we couldn't push to Firestore:
 *   - Suburb partial-match (when >30 suburbs were picked)
 *   - Bedroom minimum (when we pushed suburbs to server, beds had to fall back)
 */
function applyMemoryFilters(
  rows: PropertyRow[],
  filters: PropertyFilters,
): PropertyRow[] {
  let out = rows;

  // Bedrooms — only apply if the server-side filter didn't already handle it.
  if (filters.minBedrooms && filters.minBedrooms > 1) {
    out = out.filter((r) => r.bedrooms >= filters.minBedrooms!);
  }

  // Suburbs — only apply if the user picked >30 (server-side fallback case).
  if (filters.areas && filters.areas.length > 30) {
    const needles = filters.areas.map((a) => a.toLowerCase());
    out = out.filter((r) => {
      const loc = r.location.toLowerCase();
      return needles.some((n) => loc.includes(n));
    });
  }

  return out;
}

// ----------------------------------------------------------------------------
// Public API — score mode (wide fetch + score in memory)
// ----------------------------------------------------------------------------

export async function findCandidates(
  filters: PropertyFilters,
): Promise<PropertyRow[]> {
  // Cap defaults to 2000 — enough to score richly without doc-read blowups.
  // Server-side suburb filtering means even 10k+ properties typically
  // return well under the cap when a user has picked specific suburbs.
  const cap = filters.limit ?? 2000;
  const q = buildBaseQuery(filters).limit(cap);
  const snap = await q.get();
  const rows = snap.docs.map(snapToRow);
  return applyMemoryFilters(rows, filters);
}

// ----------------------------------------------------------------------------
// Public API — browse mode (true cursor pagination)
// ----------------------------------------------------------------------------

export interface PageResult {
  rows: PropertyRow[];
  /** Doc ID of the last row in the page; pass to next request as `cursor`. */
  nextCursor: string | null;
}

/**
 * One page of properties matching `filters`, ordered by price.
 * `pageSize` defaults to 10. `cursor` is the doc ID returned as `nextCursor`
 * from the previous page (or omitted for page 1).
 */
export async function findPage(
  filters: PropertyFilters,
  pageSize: number,
  cursor?: string | null,
): Promise<PageResult> {
  const db = getDb();
  let q = buildBaseQuery(filters);

  if (cursor) {
    const cursorDoc = await db.collection(COLLECTION).doc(cursor).get();
    if (cursorDoc.exists) q = q.startAfter(cursorDoc);
  }

  // We may need to over-fetch and post-filter for cases the in-memory
  // pass still cuts (suburbs > 30, or bedroom mismatch when suburbs took
  // the server-side slot). Fetch 3x the requested page, then trim.
  const fetched = await q.limit(pageSize * 3 + 5).get();
  const rows = fetched.docs.map(snapToRow);
  const filtered = applyMemoryFilters(rows, filters);
  const sliced = filtered.slice(0, pageSize);

  // The next cursor is the *Firestore* last-doc that produced our page —
  // not the last sliced row, because the cursor is for the underlying query.
  // We pick the last doc whose ID matches one of the sliced rows; if our
  // slice didn't reach the end of `fetched`, we use the last sliced row's id
  // (it'll have a Firestore doc with the same id since these came from there).
  const lastSlicedId = sliced[sliced.length - 1]?.id;
  const lastSnap = fetched.docs.find((d) => d.id === lastSlicedId);
  const nextCursor =
    sliced.length === pageSize && lastSnap ? lastSnap.id : null;

  return { rows: sliced, nextCursor };
}

// ----------------------------------------------------------------------------
// Public API — count aggregate (cheap "X of Y" headline)
// ----------------------------------------------------------------------------

export async function countMatching(
  filters: PropertyFilters,
): Promise<number> {
  const q = buildBaseQuery(filters);
  // Note: Firestore's count() doesn't apply our in-memory bedroom/suburb
  // tail filters, so this is approximate when those kick in. For the main
  // case (suburbs ≤30 chosen) it's exact.
  try {
    const snap = await q.count().get();
    return snap.data().count;
  } catch {
    // Fallback if the SDK in use doesn't support count() aggregate
    const fallback = await q.limit(10000).get();
    return applyMemoryFilters(fallback.docs.map(snapToRow), filters).length;
  }
}

// ----------------------------------------------------------------------------
// Health check
// ----------------------------------------------------------------------------
export async function ping(): Promise<{ count: number; sample?: string }> {
  const db = getDb();
  const snap = await db.collection(COLLECTION).limit(1).get();
  return {
    count: snap.size,
    sample: snap.docs[0]?.get('title'),
  };
}
