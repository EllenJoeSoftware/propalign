/**
 * Live property search with pagination.
 *
 * Two sort modes:
 *   - "suburb" (browse) — alphabetical by location, then price asc.
 *     Used when the user hasn't given any preference signal yet.
 *   - "score" — by suitability score desc.
 *     Used as soon as the profile has lifeStage OR topPriorities set.
 *
 * Either way pagination applies (default 10 per page).
 */

import { NextResponse } from 'next/server';
import { findCandidates } from '@/lib/properties-repo';
import {
  calculateSuitabilityScore,
  type UserProfile,
  type PropertyMatch,
} from '@/lib/scoring';

const FETCH_CAP = 500; // covers our seeded 300 listings comfortably

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const profile: UserProfile = body.profile ?? {
    netIncome: 0,
    budget: 0,
    isBuying: false,
    schoolLocations: [],
    transportMode: 'car',
    minBedrooms: 1,
    lifestylePreferences: [],
  };

  const page = Math.max(1, Number(body.page ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(body.pageSize ?? 10)));

  // Decide sort mode: score once we have a real preference signal.
  const hasSignal =
    !!profile.lifeStage ||
    (Array.isArray(profile.topPriorities) && profile.topPriorities.length > 0);
  const sort: 'suburb' | 'score' = hasSignal ? 'score' : 'suburb';

  try {
    const candidates = await findCandidates({
      isBuying:
        profile.isBuying === true || profile.isBuying === false
          ? profile.isBuying
          : undefined,
      budget: profile.budget && profile.budget > 0 ? profile.budget : undefined,
      minBedrooms:
        profile.minBedrooms && profile.minBedrooms > 1
          ? profile.minBedrooms
          : undefined,
      areas:
        profile.suburbs && profile.suburbs.length > 0
          ? profile.suburbs
          : undefined,
      limit: FETCH_CAP,
    });

    const scored: PropertyMatch[] = candidates.map((p) =>
      calculateSuitabilityScore(p, profile),
    );

    const ordered =
      sort === 'score'
        ? scored.sort((a, b) => b.score - a.score)
        : scored.sort((a, b) => {
            const loc = a.location.localeCompare(b.location);
            return loc !== 0 ? loc : a.price - b.price;
          });

    const totalCount = ordered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const slice = ordered.slice(start, start + pageSize);

    return NextResponse.json({
      results: slice,
      page: safePage,
      pageSize,
      totalPages,
      totalCount,
      sort,
    });
  } catch (err: any) {
    console.error('properties/search error:', err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}
