/**
 * Build a normalized `searchTags` array for a property doc. Lets us push
 * suburb/property-type/mode/bedroom filters to Firestore server-side via
 * `array-contains-any`, instead of pulling everything and filtering in JS.
 *
 * Tag conventions (all lowercase, hyphens not spaces):
 *   - mode:        "rent" | "buy"
 *   - province:    "gauteng", "western-cape", …
 *   - suburb:      "sandton", "cape-town-cbd", …
 *   - type:        "apartment", "house", "townhouse", …
 *   - bedrooms:    "beds-1", "beds-2", "beds-3", "beds-4plus"
 *
 * Multi-bucket bedroom tags are emitted (e.g. a 4-bed gets "beds-4plus" AND
 * also matches when someone asks for ≥3-bed via a query that includes any of
 * `beds-3`, `beds-4plus` — but we keep the buckets simple: each property has
 * one bedroom tag matching its actual size, and the query expands the user's
 * minimum into all buckets that satisfy it.
 */

export interface TagSource {
  isForRent?: boolean;
  province?: string;
  location?: string;
  propertyType?: string;
  bedrooms?: number;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function bedroomBucket(beds: number): string {
  if (!beds || beds <= 0) return 'beds-0';
  if (beds === 1) return 'beds-1';
  if (beds === 2) return 'beds-2';
  if (beds === 3) return 'beds-3';
  return 'beds-4plus';
}

/** Expand a "minimum bedrooms" filter into the bucket tags that satisfy it. */
export function bedroomBucketsForMin(minBedrooms: number): string[] {
  if (minBedrooms <= 1) return ['beds-1', 'beds-2', 'beds-3', 'beds-4plus'];
  if (minBedrooms === 2) return ['beds-2', 'beds-3', 'beds-4plus'];
  if (minBedrooms === 3) return ['beds-3', 'beds-4plus'];
  return ['beds-4plus'];
}

export function buildSearchTags(p: TagSource): string[] {
  const out: string[] = [];
  if (p.isForRent === true) out.push('rent');
  if (p.isForRent === false) out.push('buy');
  if (p.province) out.push(`province:${slug(p.province)}`);
  if (p.location) out.push(`suburb:${slug(p.location)}`);
  if (p.propertyType) out.push(`type:${slug(p.propertyType)}`);
  if (typeof p.bedrooms === 'number') out.push(bedroomBucket(p.bedrooms));
  return out;
}

export const tagSlug = slug;

/**
 * Whether a property has a usable image URL. Used as a denormalized boolean
 * field (`hasImage`) so we can filter image-less listings server-side without
 * burning our single-inequality budget in the Firestore query.
 */
export function computeHasImage(imageUrl: unknown): boolean {
  return typeof imageUrl === 'string' && imageUrl.trim().length > 0;
}

/**
 * The "true monthly cost" denormalized for sorting. For rent listings it's
 * just the monthly rent; for buy listings it's bond + rates + levies +
 * insurance based on the SA financial defaults. Stored on the doc so the
 * search endpoint can sort efficiently without recomputing per request.
 *
 * Imports lazily to avoid circular module loads at top-level.
 */
export async function computeTrueMonthlyCost(opts: {
  price: number;
  propertyType: string;
  isForRent: boolean;
}): Promise<number> {
  if (opts.isForRent) return Math.round(opts.price);
  const { calculateOwnershipCost } = await import('./sa-financial');
  return calculateOwnershipCost({
    price: opts.price,
    propertyType: opts.propertyType,
  }).totalMonthly;
}

/** Sync version — for places where dynamic import is awkward. */
export function computeTrueMonthlyCostSync(opts: {
  price: number;
  propertyType: string;
  isForRent: boolean;
}): number {
  if (opts.isForRent) return Math.round(opts.price);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { calculateOwnershipCost } = require('./sa-financial');
  return calculateOwnershipCost({
    price: opts.price,
    propertyType: opts.propertyType,
  }).totalMonthly;
}
