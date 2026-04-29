/**
 * PropAlign — Adaptive scoring
 *
 * See docs/interview-algorithm.md for the research-backed reasoning behind
 * these weights, archetypes, and modifiers. Short version:
 *   1. Pick archetype-based BASE weights (life-stage drives most variance).
 *   2. Apply Q4 trade-off boosts (+10 each, redistributed proportionally).
 *   3. Apply Q5 vibe modifiers as multipliers on dimension sub-scores.
 */

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type LifeStage =
  | 'solo'
  | 'couple'
  | 'young_family'
  | 'school_family'
  | 'empty_nester'
  | 'roommates';

export type Horizon =
  | 'rent_short'
  | 'rent_long'
  | 'buy_starter'
  | 'buy_forever';

export type Priority =
  | 'commute'
  | 'quiet_safe'
  | 'walkable'
  | 'schools'
  | 'security'
  | 'outdoor';

export type SocialDensity = 'quiet_leafy' | 'neighbourly' | 'vibrant_urban';
export type AestheticEra = 'character' | 'new_build' | 'no_pref';
export type SecurityTier =
  | 'standalone'
  | 'gated_estate'
  | 'complex'
  | 'no_pref';

type Dimension =
  | 'afford'
  | 'commute'
  | 'social'
  | 'security'
  | 'outdoor'
  | 'schools'
  | 'resilience'
  | 'fit'
  | 'noise';

export interface UserProfile {
  name?: string;
  netIncome: number;
  budget: number;
  isBuying: boolean;
  workLocation?: { lat: number; lng: number; address: string };
  schoolLocations: { lat: number; lng: number; name: string }[];
  transportMode: 'car' | 'public' | 'ride-hailing';
  preferredType?: string;
  minBedrooms: number;
  lifestylePreferences: string[];
  provinces?: string[];
  suburbs?: string[];
  // Adaptive interview fields
  lifeStage?: LifeStage;
  horizon?: Horizon;
  topPriorities?: Priority[];
  socialDensityPref?: SocialDensity;
  aestheticEra?: AestheticEra;
  securityTier?: SecurityTier;
}

export interface PropertyRow {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  lat: number;
  lng: number;
  features: string;
  imageUrl?: string | null;
  isForRent: boolean;
  /** Source listing identifier (e.g. PrivateProperty's "RR4586934"). */
  listingId?: string;
  /** Original URL on the source portal. */
  listingUrl?: string;
  /** Long-form description from the source listing. */
  fullDescription?: string;
  /** City parsed from the URL path (e.g. "Pretoria"). */
  city?: string;
  /** Region parsed from the URL path (e.g. "West Rand"). */
  region?: string;
  /** Province (e.g. "Gauteng"). Already on synthetic data via the seeder. */
  province?: string;
  /** Source portal name (e.g. "privateproperty"). */
  source?: string;
  /** When the listing was first imported / created. ISO string. */
  createdAt?: string;
}

export interface PropertyMatch {
  id: string;
  title: string;
  price: number;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl?: string | null;
  isForRent: boolean;
  /** Original listing URL — link out to the source portal. */
  listingUrl?: string;
  /** When the listing was created (ISO). Used for days-on-market. */
  createdAt?: string;
  score: number;
  breakdown: Record<string, number>;
  explanation: string;
}

// ----------------------------------------------------------------------------
// Archetype base weights (sum to 100 per row)
// ----------------------------------------------------------------------------

const BASE_WEIGHTS: Record<LifeStage, Record<Dimension, number>> = {
  solo:          { afford:25, commute:25, social:15, security:5,  outdoor:5,  schools:0,  resilience:10, fit:10, noise:5 },
  couple:        { afford:20, commute:20, social:10, security:10, outdoor:15, schools:0,  resilience:10, fit:10, noise:5 },
  young_family:  { afford:20, commute:15, social:5,  security:15, outdoor:15, schools:5,  resilience:10, fit:10, noise:5 },
  school_family: { afford:18, commute:15, social:5,  security:12, outdoor:10, schools:20, resilience:10, fit:5,  noise:5 },
  empty_nester:  { afford:20, commute:5,  social:10, security:15, outdoor:15, schools:0,  resilience:15, fit:15, noise:5 },
  roommates:     { afford:30, commute:25, social:20, security:5,  outdoor:5,  schools:0,  resilience:5,  fit:5,  noise:5 },
};

const PRIORITY_TO_DIM: Record<Priority, Dimension> = {
  commute: 'commute',
  quiet_safe: 'noise',
  walkable: 'social',
  schools: 'schools',
  security: 'security',
  outdoor: 'outdoor',
};

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function inferLifeStage(profile: UserProfile): LifeStage {
  if (profile.schoolLocations.length > 0) return 'school_family';
  if (profile.minBedrooms >= 3) return 'young_family';
  if (profile.minBedrooms === 2) return 'couple';
  return 'solo';
}

export function resolveWeights(profile: UserProfile): Record<Dimension, number> {
  const stage: LifeStage = profile.lifeStage ?? inferLifeStage(profile);
  const base = { ...BASE_WEIGHTS[stage] };
  const picked = profile.topPriorities ?? [];
  if (picked.length === 0) return base;

  const BOOST = 10;
  const totalBoost = picked.length * BOOST;
  const pickedDims = new Set<Dimension>(picked.map((p) => PRIORITY_TO_DIM[p]));
  pickedDims.add('afford'); // never penalize affordability

  const dims = Object.keys(base) as Dimension[];
  const donorTotal = dims
    .filter((d) => !pickedDims.has(d))
    .reduce((sum, d) => sum + base[d], 0);

  const result = { ...base };
  for (const p of picked) {
    result[PRIORITY_TO_DIM[p]] += BOOST;
  }
  for (const d of dims) {
    if (!pickedDims.has(d) && donorTotal > 0) {
      const share = base[d] / donorTotal;
      result[d] = Math.max(0, base[d] - totalBoost * share);
    }
  }
  return result;
}

// ----------------------------------------------------------------------------
// Sub-scores (0..1)
// ----------------------------------------------------------------------------

function affordSub(p: PropertyRow, profile: UserProfile): number {
  const cap = profile.budget > 0 ? profile.budget : profile.netIncome * 0.3;
  if (cap <= 0) return 0.5;
  const r = p.price / cap;
  if (r <= 0.8) return 1;
  if (r <= 1.0) return 0.7;
  if (r <= 1.2) return 0.4;
  return 0.1;
}

function commuteSub(p: PropertyRow, profile: UserProfile): number {
  if (!profile.workLocation) return 0.6;
  const km = getDistance(p.lat, p.lng, profile.workLocation.lat, profile.workLocation.lng);
  if (km <= 5) return 1;
  if (km <= 15) return 0.8;
  if (km <= 30) return 0.5;
  return 0.2;
}

function schoolsSub(p: PropertyRow, profile: UserProfile): number {
  if (profile.schoolLocations.length === 0) return 1;
  const min = Math.min(
    ...profile.schoolLocations.map((s) =>
      getDistance(p.lat, p.lng, s.lat, s.lng),
    ),
  );
  if (min <= 3) return 1;
  if (min <= 8) return 0.7;
  if (min <= 15) return 0.4;
  return 0.1;
}

function featureMatch(features: string[], needles: string[]): number {
  const lower = features.map((f) => f.toLowerCase());
  const hits = needles.filter((n) =>
    lower.some((f) => f.includes(n.toLowerCase())),
  ).length;
  if (hits === 0) return 0.4;
  return Math.min(1, 0.4 + hits * 0.3);
}

function socialSub(profile: UserProfile, fts: string[]): number {
  const base = featureMatch(fts, ['central', 'walk', 'transport', 'cafe', 'café']);
  if (profile.socialDensityPref === 'vibrant_urban') return base;
  if (profile.socialDensityPref === 'quiet_leafy') return 1 - base;
  return 0.5 + (base - 0.5) * 0.5;
}

function securitySub(profile: UserProfile, fts: string[]): number {
  const tier = profile.securityTier;
  const lower = fts.map((f) => f.toLowerCase());
  const isGated = lower.some((f) => f.includes('estate') || f.includes('gated'));
  const isComplex = lower.some(
    (f) => f.includes('complex') || f.includes('apartment'),
  );
  const hasSecurity = lower.some(
    (f) => f.includes('security') || f.includes('alarm'),
  );
  if (tier === 'gated_estate') return isGated ? 1 : 0.3;
  if (tier === 'complex') return isComplex ? 1 : 0.4;
  if (tier === 'standalone') return !isGated && !isComplex ? 1 : 0.5;
  return hasSecurity ? 0.8 : 0.6;
}

function outdoorSub(fts: string[]): number {
  return featureMatch(fts, ['garden', 'balcony', 'patio', 'yard']);
}

function resilienceSub(fts: string[]): number {
  return featureMatch(fts, [
    'solar', 'inverter', 'battery', 'borehole', 'jojo', 'generator',
  ]);
}

function noiseSub(fts: string[]): number {
  const lower = fts.map((f) => f.toLowerCase());
  if (lower.some((f) => f.includes('quiet') || f.includes('peaceful'))) return 1;
  if (lower.some((f) => f.includes('nightlife') || f.includes('main road')))
    return 0.2;
  return 0.6;
}

function fitSub(p: PropertyRow, profile: UserProfile): number {
  let s = 0;
  if (p.bedrooms >= profile.minBedrooms) s += 0.5;
  if (
    profile.preferredType &&
    p.propertyType.toLowerCase() === profile.preferredType.toLowerCase()
  ) {
    s += 0.5;
  } else if (!profile.preferredType) {
    s += 0.5;
  }
  if (profile.aestheticEra === 'character') {
    if (/cottage|character|heritage|victorian|edwardian/i.test(p.description))
      s = Math.min(1, s + 0.1);
  } else if (profile.aestheticEra === 'new_build') {
    if (/modern|new|contemporary|2024|2025|2026/i.test(p.description))
      s = Math.min(1, s + 0.1);
  }
  return s;
}

// ----------------------------------------------------------------------------
// Public scorer
// ----------------------------------------------------------------------------

export function calculateSuitabilityScore(
  property: PropertyRow,
  profile: UserProfile,
): PropertyMatch {
  const features: string[] = JSON.parse(property.features || '[]');
  const subs: Record<Dimension, number> = {
    afford: affordSub(property, profile),
    commute: commuteSub(property, profile),
    social: socialSub(profile, features),
    security: securitySub(profile, features),
    outdoor: outdoorSub(features),
    schools: schoolsSub(property, profile),
    resilience: resilienceSub(features),
    fit: fitSub(property, profile),
    noise: noiseSub(features),
  };

  const weights = resolveWeights(profile);
  const breakdown: Record<string, number> = {};
  let total = 0;
  for (const dim of Object.keys(subs) as Dimension[]) {
    const earned = weights[dim] * subs[dim];
    breakdown[dim] = Math.round(earned);
    total += earned;
  }
  const score = Math.min(100, Math.round(total));

  const friendly: Record<Dimension, string> = {
    afford: 'comfortably within budget',
    commute: 'short commute to your work',
    social: 'walkable, social neighbourhood',
    security: 'matches your security preference',
    outdoor: 'plenty of outdoor space',
    schools: 'close to schools',
    resilience: 'good load-shedding resilience',
    fit: 'right size and type',
    noise: 'quiet area',
  };
  const ranked = (Object.keys(subs) as Dimension[])
    .filter((d) => weights[d] > 0 && subs[d] >= 0.7)
    .sort((a, b) => (breakdown[b] || 0) - (breakdown[a] || 0))
    .slice(0, 3);
  const explanation =
    ranked.length > 0
      ? `Strong on: ${ranked.map((d) => friendly[d]).join(', ')}.`
      : 'Closest match given your filters.';

  return {
    id: property.id,
    title: property.title,
    price: property.price,
    location: property.location,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    imageUrl: property.imageUrl,
    isForRent: property.isForRent,
    listingUrl: property.listingUrl,
    createdAt: property.createdAt,
    score,
    breakdown,
    explanation,
  };
}
