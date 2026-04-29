/**
 * Live property search. Two modes:
 *
 *   - "score" (lifeStage or topPriorities set): wide candidate fetch (capped),
 *     in-memory ranking by suitability score, page slice in JS. Uses page
 *     numbers because the order is computed client-side in this request.
 *
 *   - "suburb" (browse — no preference signal): true Firestore cursor
 *     pagination using `startAfter(lastDoc)`. Cheap, scales unboundedly.
 *
 * Both return a `totalCount` from the Firestore `count()` aggregate so the
 * UI can show "X of Y".
 */

import { NextResponse } from 'next/server';
import {
  findCandidates,
  findPage,
  countMatching,
} from '@/lib/properties-repo';
import {
  calculateSuitabilityScore,
  type UserProfile,
  type PropertyMatch,
} from '@/lib/scoring';
import { cacheGet, cacheSet, cacheKey } from '@/lib/search-cache';

// Lower cap protects against Firestore read-quota burns. With server-side
// suburb filtering via searchTags, 500 is plenty for any sensibly-narrowed
// search; only "everything everywhere" queries would clip at this ceiling
// and those don't deserve perfect ranking anyway.
const SCORE_FETCH_CAP = 500;

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
  const cursor: string | null = body.cursor ?? null;

  // Score mode kicks in once we have a real preference signal.
  const hasSignal =
    !!profile.lifeStage ||
    (Array.isArray(profile.topPriorities) && profile.topPriorities.length > 0);
  const sort: 'suburb' | 'score' = hasSignal ? 'score' : 'suburb';

  const filters = {
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
  };

  // Cache key — the response only depends on filters, page, pageSize, sort
  // mode, and (for score mode) the scoring inputs that come from `profile`.
  // Bundle them all into a stable string so identical requests share results.
  const ck = cacheKey({
    filters,
    page,
    pageSize,
    cursor,
    sort,
    // Score-mode-only inputs that change ranking
    lifeStage: profile.lifeStage,
    topPriorities: profile.topPriorities,
    socialDensityPref: profile.socialDensityPref,
    aestheticEra: profile.aestheticEra,
    securityTier: profile.securityTier,
    netIncome: profile.netIncome,
  });
  const cached = cacheGet(ck);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    if (sort === 'suburb') {
      // ── BROWSE MODE — true cursor pagination ───────────────────────────
      const [pageResult, totalCount] = await Promise.all([
        findPage(filters, pageSize, cursor),
        countMatching(filters),
      ]);

      // Score is still computed (so the UI can render the bar if it wants),
      // but ordering is by Firestore (price asc, suburb-grouped).
      const scored = pageResult.rows
        .map((p) => calculateSuitabilityScore(p, profile))
        // Re-sort by location then price for the "browse the catalogue" feel
        .sort((a, b) => {
          const loc = a.location.localeCompare(b.location);
          return loc !== 0 ? loc : a.price - b.price;
        });

      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const payload = {
        results: scored,
        page,
        pageSize,
        totalPages,
        totalCount,
        sort,
        nextCursor: pageResult.nextCursor,
      };
      cacheSet(ck, payload);
      return NextResponse.json(payload);
    }

    // ── SCORE MODE — wide fetch + in-memory rank + slice ─────────────────
    const candidates = await findCandidates({
      ...filters,
      limit: SCORE_FETCH_CAP,
    });

    const totalCount = candidates.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    const scored: PropertyMatch[] = candidates
      .map((p) => calculateSuitabilityScore(p, profile))
      .sort((a, b) => b.score - a.score);

    const slice = scored.slice(start, start + pageSize);

    const payload = {
      results: slice,
      page: safePage,
      pageSize,
      totalPages,
      totalCount,
      sort,
      nextCursor: null,
    };
    cacheSet(ck, payload);
    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('properties/search error:', err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}
