'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  GitCompareArrows,
  Check,
  X,
} from 'lucide-react';
import { useCompare } from './CompareProvider';
import type { UserProfile, PropertyMatch } from '@/lib/scoring';
import CostBreakdown from './CostBreakdown';
import RentVsBuy from './RentVsBuy';
import ViewingAssistant from './ViewingAssistant';
import SuburbContext from './SuburbContext';
import SimilarBut from './SimilarBut';
import DaysOnMarket from './DaysOnMarket';
import BondPreApproval from './BondPreApproval';
import PartnerSuggestions from './PartnerSuggestions';

interface PropertiesPaneProps {
  profile: UserProfile;
  setProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
  pageSize?: number;
}

interface SearchResponse {
  results: PropertyMatch[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  sort: 'suburb' | 'score';
  /** Cursor for the next page (browse mode only; null otherwise). */
  nextCursor: string | null;
}

const friendlyPriority: Record<string, string> = {
  commute: 'Commute',
  quiet_safe: 'Quiet & safe',
  walkable: 'Walkable',
  schools: 'Schools',
  security: 'Security',
  outdoor: 'Outdoor',
};

const friendlyStage: Record<string, string> = {
  solo: 'Solo',
  couple: 'Couple',
  young_family: 'Young family',
  school_family: 'School-age family',
  empty_nester: 'Empty-nester',
  roommates: 'Roommates',
};

export default function PropertiesPane({
  profile,
  setProfile,
  pageSize = 10,
}: PropertiesPaneProps) {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  // Cursor stack for browse-mode pagination — held in a ref so updating it
  // doesn't trigger the fetch effect. Index N holds the cursor used to fetch
  // page N+1 (so cursorsRef.current[0] is always null = page 1).
  const cursorsRef = useRef<(string | null)[]>([null]);
  const reqIdRef = useRef(0);

  // Delta tracking — what changed between the previous result set and this one.
  const previousIdsRef = useRef<Set<string>>(new Set());
  const previousTotalRef = useRef<number>(0);
  const [delta, setDelta] = useState<{
    added: number;
    removed: number;
    totalDiff: number;
  } | null>(null);
  const deltaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        b: profile.isBuying,
        bg: profile.budget,
        mb: profile.minBedrooms,
        s: profile.suburbs ?? [],
        ls: profile.lifeStage ?? '',
        tp: profile.topPriorities ?? [],
        sd: profile.socialDensityPref ?? '',
        ae: profile.aestheticEra ?? '',
        st: profile.securityTier ?? '',
      }),
    [profile],
  );

  useEffect(() => {
    setPage(1);
    cursorsRef.current = [null];
  }, [filterKey]);

  useEffect(() => {
    const myId = ++reqIdRef.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const cursor = cursorsRef.current[page - 1] ?? null;
        const res = await fetch('/api/properties/search', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ profile, page, pageSize, cursor }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as SearchResponse;
        if (reqIdRef.current === myId) {
          // Compute delta vs previous result set.
          const newIds = new Set(json.results.map((r) => r.id));
          const oldIds = previousIdsRef.current;
          let added = 0;
          let removed = 0;
          if (oldIds.size > 0) {
            for (const id of newIds) if (!oldIds.has(id)) added++;
            for (const id of oldIds) if (!newIds.has(id)) removed++;
          }
          const totalDiff = json.totalCount - previousTotalRef.current;

          // Only flash a delta if something actually changed and we had a
          // baseline. Skip on first load (oldIds.size === 0) — there's no
          // "delta" against nothing.
          if (oldIds.size > 0 && (added > 0 || removed > 0)) {
            setDelta({ added, removed, totalDiff });
            if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
            deltaTimerRef.current = setTimeout(() => setDelta(null), 3500);
          }
          previousIdsRef.current = newIds;
          previousTotalRef.current = json.totalCount;
          setData(json);

          // Cache the next-page cursor in the ref (no re-render).
          if (json.sort === 'suburb' && json.nextCursor) {
            if (!cursorsRef.current[page]) {
              cursorsRef.current = [...cursorsRef.current];
              cursorsRef.current[page] = json.nextCursor;
            }
          }
        }
      } catch (err: any) {
        if (reqIdRef.current === myId)
          setError(err?.message ?? 'Could not load properties');
      } finally {
        if (reqIdRef.current === myId) setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [profile, page, pageSize]);

  // Filter chips — each carries an optional `clear` callback so the user
  // can remove that constraint with a click. We only attach `clear` if
  // setProfile was provided by the parent.
  const filterChips = useMemo(() => {
    const chips: Array<{ label: string; clear?: () => void }> = [];

    if (profile.lifeStage) {
      chips.push({
        label: friendlyStage[profile.lifeStage] ?? profile.lifeStage,
        clear: setProfile
          ? () => setProfile((p) => ({ ...p, lifeStage: undefined }))
          : undefined,
      });
    }
    chips.push({
      label: profile.isBuying ? 'Buying' : 'Renting',
      // Don't make rent/buy clearable — it's a primary axis, not a filter
    });
    if (profile.budget > 0) {
      chips.push({
        label: `≤ R${profile.budget.toLocaleString('en-ZA')}${profile.isBuying ? '' : '/mo'}`,
        clear: setProfile
          ? () => setProfile((p) => ({ ...p, budget: 0 }))
          : undefined,
      });
    }
    if (profile.minBedrooms > 1) {
      chips.push({
        label: `${profile.minBedrooms}+ bed`,
        clear: setProfile
          ? () => setProfile((p) => ({ ...p, minBedrooms: 1 }))
          : undefined,
      });
    }
    if (profile.suburbs && profile.suburbs.length > 0) {
      chips.push({
        label:
          profile.suburbs.length === 1
            ? profile.suburbs[0]
            : `${profile.suburbs.length} suburbs`,
        clear: setProfile
          ? () => setProfile((p) => ({ ...p, suburbs: [], provinces: [] }))
          : undefined,
      });
    }
    if (profile.topPriorities && profile.topPriorities.length) {
      for (const p of profile.topPriorities) {
        chips.push({
          label: friendlyPriority[p] ?? p,
          clear: setProfile
            ? () =>
                setProfile((prev) => ({
                  ...prev,
                  topPriorities: (prev.topPriorities ?? []).filter(
                    (x) => x !== p,
                  ),
                }))
            : undefined,
        });
      }
    }
    return chips;
  }, [profile, setProfile]);

  const results = data?.results ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const sort = data?.sort ?? 'suburb';
  const start = data ? (data.page - 1) * data.pageSize + 1 : 0;
  const end = data ? start + results.length - 1 : 0;

  // Stats strip: derived facts about the current result set.
  const stats = useMemo(() => {
    if (!results.length) return null;
    const prices = results.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const suburbCount = new Set(results.map((p) => p.location)).size;
    return { min, max, suburbCount };
  }, [results]);

  // Hero only in score mode and only on page 1 — it's the genuine top match.
  const showHero = sort === 'score' && page === 1 && results.length >= 4;
  const hero = showHero ? results[0] : null;
  const rest = showHero ? results.slice(1) : results;

  return (
    <section className="flex flex-col h-full bg-[var(--paper)]">
      {/* Header */}
      <header className="shrink-0 border-b border-[var(--line)] px-6 pt-5 pb-4">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium">
              {sort === 'score' ? 'Curated Matches' : 'Browse the Catalogue'}
            </p>
            <h2 className="mt-1 font-editorial text-[22px] font-medium tracking-[-0.015em] text-[var(--ink)] leading-tight inline-flex items-baseline gap-2 flex-wrap">
              {loading && !data ? (
                'Loading…'
              ) : (
                <>
                  <span>
                    <span className="font-data">{totalCount}</span>{' '}
                    {totalCount === 1 ? 'property' : 'properties'}
                  </span>
                  {delta && (
                    <span className="font-sans text-[11px] font-medium tracking-normal animate-in fade-in inline-flex items-center gap-2">
                      {delta.added > 0 && (
                        <span className="text-[var(--good)]">
                          +<span className="font-data">{delta.added}</span> new
                        </span>
                      )}
                      {delta.removed > 0 && (
                        <span className="text-[var(--ink-3)]">
                          −<span className="font-data">{delta.removed}</span>{' '}
                          removed
                        </span>
                      )}
                    </span>
                  )}
                </>
              )}
            </h2>
          </div>
          {loading && data && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--ink-3)]" />
          )}
        </div>

        {/* Stats strip */}
        {stats && (
          <div className="mt-3 flex items-center gap-4 font-data text-[11px] text-[var(--ink-3)]">
            <span>
              <span className="text-[var(--ink)]">
                R{stats.min.toLocaleString('en-ZA')}
              </span>
              <span className="mx-1 text-[var(--ink-4)]">–</span>
              <span className="text-[var(--ink)]">
                R{stats.max.toLocaleString('en-ZA')}
              </span>
              {!profile.isBuying && (
                <span className="text-[var(--ink-4)]"> /mo</span>
              )}
            </span>
            <span className="text-[var(--ink-4)]">·</span>
            <span>
              <span className="text-[var(--ink)]">{stats.suburbCount}</span>{' '}
              <span className="font-sans">suburb{stats.suburbCount === 1 ? '' : 's'}</span>
            </span>
            <span className="text-[var(--ink-4)]">·</span>
            <span className="font-sans">
              sorted by {sort === 'score' ? 'suitability' : 'suburb'}
            </span>
          </div>
        )}

        {filterChips.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1 -mb-1">
            <Filter
              className="h-3 w-3 shrink-0 text-[var(--ink-3)]"
              strokeWidth={2}
            />
            {filterChips.map((c, i) =>
              c.clear ? (
                <button
                  key={i}
                  type="button"
                  onClick={c.clear}
                  title={`Remove "${c.label}" filter`}
                  className="focus-ring shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[var(--line)] bg-[var(--paper-2)] text-[10px] text-[var(--ink-2)] whitespace-nowrap hover:border-[var(--line-strong)] hover:bg-[var(--paper-3)] transition-colors"
                >
                  {c.label}
                  <X className="h-2 w-2 text-[var(--ink-3)]" strokeWidth={2.5} />
                </button>
              ) : (
                <span
                  key={i}
                  className="shrink-0 px-2 py-0.5 rounded-full border border-[var(--line)] bg-[var(--paper-2)] text-[10px] text-[var(--ink-2)] whitespace-nowrap"
                >
                  {c.label}
                </span>
              ),
            )}
          </div>
        )}
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-5">
        {error ? (
          <div className="text-[13px] text-[var(--danger)]">{error}</div>
        ) : results.length === 0 && !loading ? (
          <EmptyState />
        ) : (
          <>
            {hero && (
              <HeroCard
                prop={hero}
                profile={profile}
                setProfile={setProfile}
              />
            )}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {rest.map((p, idx) => (
                <PropertyCard
                  key={p.id}
                  prop={p}
                  ordinal={start + (showHero ? idx + 1 : idx)}
                  showScore={sort === 'score'}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pager */}
      {totalCount > 0 && totalPages > 1 && (
        <footer className="shrink-0 border-t border-[var(--line)] px-6 py-3 flex items-center justify-between gap-3">
          <p className="font-data text-[11px] text-[var(--ink-3)]">
            {start}–{end} of {totalCount}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="focus-ring h-8 w-8 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[var(--ink-2)] transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="font-data text-[12px] text-[var(--ink)] tabular-nums px-2 min-w-[5.5rem] text-center">
              <span className="font-medium">{page}</span>
              <span className="text-[var(--ink-3)] mx-1">/</span>
              <span className="text-[var(--ink-3)]">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="focus-ring h-8 w-8 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[var(--ink-2)] transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </footer>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Hero card — featured top match
// ---------------------------------------------------------------------------
function HeroCard({
  prop,
  profile,
  setProfile,
}: {
  prop: PropertyMatch;
  profile: UserProfile;
  setProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
}) {
  const scoreClass =
    prop.score >= 80
      ? 'text-[var(--good)]'
      : prop.score >= 60
        ? 'text-[var(--ink)]'
        : 'text-[var(--ink-3)]';

  return (
    <article className="overflow-hidden rounded-[12px] border border-[var(--line)] bg-[var(--paper-2)] transition-colors hover:border-[var(--line-strong)]">
      {/* Kicker bar */}
      <div className="px-4 py-2 border-b border-[var(--line-soft)] flex items-center gap-2 bg-[var(--paper-3)]">
        <Sparkles
          className="h-3 w-3 text-[var(--accent-color)]"
          strokeWidth={2}
        />
        <span className="text-[10px] uppercase tracking-[0.12em] font-medium text-[var(--ink-2)]">
          Top match for you
        </span>
        <span className="ml-auto font-data text-[11px] text-[var(--ink-3)]">
          01
        </span>
      </div>

      {prop.imageUrl ? (
        <div className="relative h-[336px] w-full overflow-hidden bg-[var(--paper-3)]">
          <img
            src={prop.imageUrl}
            alt={prop.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-[336px] w-full bg-[var(--paper-3)] flex items-center justify-center">
          <Building2
            className="h-7 w-7 text-[var(--ink-4)]"
            strokeWidth={1.5}
          />
        </div>
      )}

      <div className="p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-editorial text-[20px] font-medium tracking-[-0.015em] text-[var(--ink)] leading-snug">
            {prop.title}
          </h3>
          <span className="font-data text-[16px] font-medium text-[var(--ink)] shrink-0 mt-1">
            R{prop.price.toLocaleString('en-ZA')}
            {prop.isForRent && (
              <span className="text-[11px] font-normal text-[var(--ink-3)]">
                /mo
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-[12px] text-[var(--ink-3)]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {prop.location}
          </span>
          <span className="text-[var(--ink-4)]">·</span>
          <span>{prop.propertyType}</span>
          <span className="text-[var(--ink-4)]">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Bed className="h-3 w-3" />
            {prop.bedrooms}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bath className="h-3 w-3" />
            {prop.bathrooms}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <SuburbContext suburb={prop.location} />
          <DaysOnMarket createdAt={prop.createdAt} />
        </div>

        <div className="pt-3 border-t border-[var(--line-soft)] space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium">
              Suitability
            </span>
            <span className={`font-data text-[14px] font-medium ${scoreClass}`}>
              {prop.score}
              <span className="text-[var(--ink-4)]">/100</span>
            </span>
          </div>
          <div className="h-px w-full bg-[var(--line-soft)] relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[var(--accent-color)]"
              style={{ width: `${prop.score}%` }}
            />
          </div>
          {prop.explanation && (
            <p className="font-editorial italic text-[12px] leading-relaxed text-[var(--ink-2)] pt-1">
              {prop.explanation}
            </p>
          )}
        </div>

        <CostBreakdown
          price={prop.price}
          propertyType={prop.propertyType}
          isForRent={prop.isForRent}
        />

        {!prop.isForRent && (
          <RentVsBuy
            buyPrice={prop.price}
            propertyType={prop.propertyType}
            suburb={prop.location}
            bedrooms={prop.bedrooms}
          />
        )}

        {!prop.isForRent && (
          <BondPreApproval
            price={prop.price}
            netIncome={profile.netIncome}
          />
        )}

        {setProfile && (
          <SimilarBut prop={prop} profile={profile} setProfile={setProfile} />
        )}

        <PartnerSuggestions isForRent={prop.isForRent} />

        <div className="flex items-center gap-2 flex-wrap pt-1">
          <ViewingAssistant
            propertyId={prop.id}
            propertyTitle={prop.title}
          />
          <CompareToggle id={prop.id} />
          {prop.listingUrl && (
            <a
              href={prop.listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1 h-8 px-3 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[11px] font-medium text-[var(--ink-2)] transition-colors"
            >
              View listing
              <ExternalLink className="h-2.5 w-2.5" strokeWidth={2} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Compact card — the rest of the grid
// ---------------------------------------------------------------------------
function PropertyCard({
  prop,
  ordinal,
  showScore,
}: {
  prop: PropertyMatch;
  ordinal: number;
  showScore: boolean;
}) {
  const scoreClass =
    prop.score >= 80
      ? 'text-[var(--good)]'
      : prop.score >= 60
        ? 'text-[var(--ink)]'
        : 'text-[var(--ink-3)]';

  return (
    <article className="overflow-hidden rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] transition-colors hover:border-[var(--line-strong)]">
      {prop.imageUrl ? (
        <div className="relative h-48 w-full overflow-hidden bg-[var(--paper-3)]">
          <img
            src={prop.imageUrl}
            alt={prop.title}
            className="h-full w-full object-cover"
          />
          {/* Ordinal stamp — top-left */}
          <span className="absolute top-2 left-2 font-data text-[10px] font-medium text-white bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
            {String(ordinal).padStart(2, '0')}
          </span>
        </div>
      ) : (
        <div className="relative h-48 w-full bg-[var(--paper-3)] flex items-center justify-center border-b border-[var(--line-soft)]">
          <Building2
            className="h-5 w-5 text-[var(--ink-4)]"
            strokeWidth={1.5}
          />
          <span className="absolute top-2 left-2 font-data text-[10px] font-medium text-[var(--ink-3)]">
            {String(ordinal).padStart(2, '0')}
          </span>
        </div>
      )}

      <div className="p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-editorial text-[14px] font-medium tracking-[-0.01em] text-[var(--ink)] leading-snug line-clamp-2">
            {prop.title}
          </h3>
          <span className="font-data text-[13px] font-medium text-[var(--ink)] shrink-0 mt-0.5">
            R{prop.price.toLocaleString('en-ZA')}
            {prop.isForRent && (
              <span className="text-[10px] font-normal text-[var(--ink-3)]">
                /mo
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] text-[var(--ink-3)]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" />
            {prop.location}
          </span>
          <span className="text-[var(--ink-4)]">·</span>
          <span>{prop.propertyType}</span>
          <span className="text-[var(--ink-4)]">·</span>
          <span className="inline-flex items-center gap-1">
            <Bed className="h-2.5 w-2.5" />
            {prop.bedrooms}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath className="h-2.5 w-2.5" />
            {prop.bathrooms}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1">
          <SuburbContext suburb={prop.location} compact />
          <DaysOnMarket createdAt={prop.createdAt} compact />
        </div>

        {showScore && (
          <div className="pt-2 border-t border-[var(--line-soft)] space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)] font-medium">
                Suitability
              </span>
              <span
                className={`font-data text-[12px] font-medium ${scoreClass}`}
              >
                {prop.score}
                <span className="text-[var(--ink-4)]">/100</span>
              </span>
            </div>
            <div className="h-px w-full bg-[var(--line-soft)] relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-[var(--accent-color)]"
                style={{ width: `${prop.score}%` }}
              />
            </div>
          </div>
        )}

        <CostBreakdown
          price={prop.price}
          propertyType={prop.propertyType}
          isForRent={prop.isForRent}
          compact
        />

        <div className="flex items-center justify-between gap-2 pt-1">
          <CompareToggle id={prop.id} small />
          {prop.listingUrl && (
            <a
              href={prop.listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1 text-[10px] font-medium text-[var(--accent-color)] hover:underline"
            >
              View listing
              <ExternalLink className="h-2 w-2" strokeWidth={2} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function CompareToggle({
  id,
  small = false,
}: {
  id: string;
  small?: boolean;
}) {
  const { has, toggle, full } = useCompare();
  const active = has(id);
  const disabled = !active && full;

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      disabled={disabled}
      title={
        disabled
          ? 'Already comparing 4 properties — remove one first'
          : active
            ? 'Remove from compare'
            : 'Add to compare'
      }
      className={
        'focus-ring inline-flex items-center gap-1 rounded-[6px] border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ' +
        (small
          ? 'h-7 px-2 text-[10px] '
          : 'h-8 px-3 text-[11px] font-medium ') +
        (active
          ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
          : 'bg-[var(--paper-2)] border-[var(--line)] hover:border-[var(--line-strong)] text-[var(--ink-2)]')
      }
    >
      {active ? (
        <Check className={small ? 'h-2.5 w-2.5' : 'h-3 w-3'} strokeWidth={2.5} />
      ) : (
        <GitCompareArrows
          className={small ? 'h-2.5 w-2.5' : 'h-3 w-3'}
          strokeWidth={2}
        />
      )}
      {active ? 'Comparing' : 'Compare'}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-12 w-12 rounded-full bg-[var(--paper-3)] border border-[var(--line)] flex items-center justify-center mb-3">
        <Building2 className="h-5 w-5 text-[var(--ink-3)]" strokeWidth={1.5} />
      </div>
      <p className="font-editorial text-[15px] font-medium text-[var(--ink)]">
        Nothing fits yet
      </p>
      <p className="mt-1 text-[11px] text-[var(--ink-3)] max-w-[20rem]">
        Try widening your budget, picking more suburbs, or relaxing the bedroom
        minimum on the left.
      </p>
    </div>
  );
}
