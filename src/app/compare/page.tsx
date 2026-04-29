'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Bed,
  Bath,
  MapPin,
  Building2,
  Share2,
  Check,
} from 'lucide-react';
import type { PropertyRow } from '@/lib/scoring';
import {
  calculateOwnershipCost,
  fmtRand,
} from '@/lib/sa-financial';

function ComparePageInner() {
  const params = useSearchParams();
  const ids = (params.get('ids') ?? '').split(',').filter(Boolean);
  const [items, setItems] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    fetch('/api/properties/by-ids', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
      .then((r) => r.json())
      .then((data) => setItems(data.results ?? []))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } catch {
      // noop
    }
  };

  return (
    <main className="min-h-screen w-full bg-[var(--paper)] flex flex-col">
      <header className="shrink-0 border-b border-[var(--line)] px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-1.5 h-8 px-3 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[11px] font-medium text-[var(--ink-2)] transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to search
        </Link>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium">
            Side-by-Side
          </p>
          <h1 className="font-editorial text-[18px] font-medium text-[var(--ink)] leading-tight">
            Comparison
          </h1>
        </div>

        <button
          type="button"
          onClick={share}
          className="focus-ring inline-flex items-center gap-1.5 h-8 px-3 rounded-[6px] bg-[var(--accent-color)] text-white text-[11px] font-medium hover:opacity-90 transition-opacity"
        >
          {shared ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Share2 className="h-3 w-3" />
              Share link
            </>
          )}
        </button>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin px-6 py-6">
        {loading ? (
          <p className="text-[12px] text-[var(--ink-3)]">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-[12px] text-[var(--ink-3)]">
            Nothing to compare. Pick 2-4 properties on the search page.
          </p>
        ) : (
          <ComparisonGrid items={items} />
        )}
      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <ComparePageInner />
    </Suspense>
  );
}

function ComparisonGrid({ items }: { items: PropertyRow[] }) {
  // Detect "delta" rows — fields where values differ between properties.
  const isDelta = (values: Array<string | number>) => {
    const set = new Set(values.map(String));
    return set.size > 1;
  };

  const rows: Array<{
    label: string;
    values: Array<string | number>;
    deltaable?: boolean;
  }> = [
    {
      label: 'Price',
      values: items.map((p) =>
        `${fmtRand(p.price)}${p.isForRent ? '/mo' : ''}`,
      ),
      deltaable: true,
    },
    { label: 'Suburb', values: items.map((p) => p.location), deltaable: true },
    {
      label: 'Province',
      values: items.map((p) => p.province ?? '—'),
      deltaable: true,
    },
    {
      label: 'Property type',
      values: items.map((p) => p.propertyType),
      deltaable: true,
    },
    { label: 'Bedrooms', values: items.map((p) => p.bedrooms), deltaable: true },
    {
      label: 'Bathrooms',
      values: items.map((p) => p.bathrooms),
      deltaable: true,
    },
    {
      label: 'Rent or buy',
      values: items.map((p) => (p.isForRent ? 'Rent' : 'Buy')),
      deltaable: true,
    },
  ];

  // Cost rows (skip rentals — they share the simpler model)
  const showOwnership = items.every((p) => !p.isForRent);
  if (showOwnership) {
    const breakdowns = items.map((p) =>
      calculateOwnershipCost({ price: p.price, propertyType: p.propertyType }),
    );
    rows.push(
      {
        label: 'True monthly',
        values: breakdowns.map((b) => fmtRand(b.totalMonthly)),
        deltaable: true,
      },
      {
        label: 'Upfront',
        values: breakdowns.map((b) => fmtRand(b.totalUpfront, { compact: true })),
        deltaable: true,
      },
      {
        label: 'Transfer duty',
        values: breakdowns.map((b) => fmtRand(b.transferDuty)),
        deltaable: true,
      },
      {
        label: 'Bond payment',
        values: breakdowns.map((b) => fmtRand(b.bondPayment)),
        deltaable: true,
      },
      {
        label: 'Levies',
        values: breakdowns.map((b) =>
          b.levies > 0 ? fmtRand(b.levies) : 'None',
        ),
        deltaable: true,
      },
    );
  }

  // Features — show as a union pivot
  const allFeatures = Array.from(
    new Set(
      items.flatMap((p) => {
        try {
          return JSON.parse(p.features ?? '[]') as string[];
        } catch {
          return [];
        }
      }),
    ),
  ).sort();

  return (
    <div className="min-w-fit">
      {/* Property header row with image + title */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `160px repeat(${items.length}, minmax(220px, 1fr))`,
        }}
      >
        <div /> {/* spacer above the row labels */}
        {items.map((p) => (
          <article
            key={p.id}
            className="rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] overflow-hidden"
          >
            {p.imageUrl ? (
              <div className="h-[168px] w-full overflow-hidden bg-[var(--paper-3)]">
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-[168px] w-full bg-[var(--paper-3)] flex items-center justify-center">
                <Building2
                  className="h-5 w-5 text-[var(--ink-4)]"
                  strokeWidth={1.5}
                />
              </div>
            )}
            <div className="p-3 space-y-1">
              <h3 className="font-editorial text-[13px] font-medium leading-snug text-[var(--ink)] line-clamp-2">
                {p.title}
              </h3>
              <p className="text-[10px] text-[var(--ink-3)] inline-flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />
                {p.location}
              </p>
              <p className="text-[10px] text-[var(--ink-3)] inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <Bed className="h-2.5 w-2.5" />
                  {p.bedrooms}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Bath className="h-2.5 w-2.5" />
                  {p.bathrooms}
                </span>
              </p>
            </div>
          </article>
        ))}

        {/* Comparison rows */}
        {rows.map((row) => {
          const delta = row.deltaable && isDelta(row.values);
          return (
            <RowDisplay key={row.label} label={row.label} delta={delta}>
              {row.values.map((v, i) => (
                <Cell key={i} delta={delta}>
                  {v}
                </Cell>
              ))}
            </RowDisplay>
          );
        })}

        {/* Features pivot */}
        {allFeatures.length > 0 && (
          <RowDisplay label="Features">
            {items.map((p, i) => {
              const has = (() => {
                try {
                  return new Set(JSON.parse(p.features ?? '[]') as string[]);
                } catch {
                  return new Set<string>();
                }
              })();
              return (
                <Cell key={i}>
                  <div className="flex flex-wrap gap-1">
                    {allFeatures.map((f) => {
                      const present = has.has(f);
                      return (
                        <span
                          key={f}
                          className={
                            'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[9px] ' +
                            (present
                              ? 'bg-[var(--accent-tint)] border-[var(--accent-color)]/30 text-[var(--ink)]'
                              : 'bg-[var(--paper-3)] border-[var(--line)] text-[var(--ink-4)] line-through')
                          }
                        >
                          {f}
                        </span>
                      );
                    })}
                  </div>
                </Cell>
              );
            })}
          </RowDisplay>
        )}
      </div>
    </div>
  );
}

function RowDisplay({
  label,
  delta = false,
  children,
}: {
  label: string;
  delta?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)] font-medium py-3 self-center">
        {label}
        {delta && (
          <span className="ml-1 text-[9px] text-[var(--accent-color)] normal-case tracking-normal">
            • differs
          </span>
        )}
      </div>
      {children}
    </>
  );
}

function Cell({
  delta = false,
  children,
}: {
  delta?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        'rounded-[6px] border border-[var(--line)] px-3 py-2 text-[12px] text-[var(--ink)] ' +
        (delta ? 'bg-[var(--accent-tint)]' : 'bg-[var(--paper-2)]')
      }
    >
      {children}
    </div>
  );
}
