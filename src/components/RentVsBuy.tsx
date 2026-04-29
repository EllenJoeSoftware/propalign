'use client';

import { useEffect, useState } from 'react';
import { Scale, Info, ChevronDown } from 'lucide-react';
import { rentVsBuy, fmtRand } from '@/lib/sa-financial';

interface RentVsBuyProps {
  buyPrice: number;
  propertyType: string;
  suburb: string;
  bedrooms: number;
}

export default function RentVsBuy({
  buyPrice,
  propertyType,
  suburb,
  bedrooms,
}: RentVsBuyProps) {
  const [open, setOpen] = useState(false);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [sampleSize, setSampleSize] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/rent-estimate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ suburb, bedrooms }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setEstimate(data.estimate ?? null);
        setSampleSize(data.sampleSize ?? 0);
      })
      .catch(() => !cancelled && setEstimate(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [suburb, bedrooms]);

  if (loading) {
    return (
      <div className="rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)] px-3 py-2">
        <p className="text-[11px] text-[var(--ink-3)]">
          Estimating equivalent rent…
        </p>
      </div>
    );
  }

  if (!estimate) {
    return null; // No comps — silently skip rather than show a useless module
  }

  const projection = rentVsBuy({
    buyPrice,
    propertyType,
    equivalentMonthlyRent: estimate,
    termYears: 5,
  });

  const verdict =
    projection.breakEvenYear === null
      ? `Renting wins for the full 5 years.`
      : projection.breakEvenYear === 1
        ? `Buying pays off almost immediately.`
        : `Buying breaks even in year ${projection.breakEvenYear}.`;

  return (
    <div className="rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2 flex items-center gap-2 text-left"
      >
        <Scale className="h-3 w-3 text-[var(--ink-3)] shrink-0" strokeWidth={2} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)] font-medium">
            Rent vs Buy
          </p>
          <p className="font-editorial text-[12px] text-[var(--ink-2)] italic leading-snug">
            {verdict}
          </p>
        </div>
        <ChevronDown
          className={`h-3 w-3 text-[var(--ink-3)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-[var(--line-soft)]">
          <p className="text-[11px] text-[var(--ink-2)]">
            An equivalent rental in {suburb} runs ~
            <span className="font-data text-[var(--ink)]">
              {fmtRand(estimate)}
            </span>
            <span className="text-[var(--ink-3)]">/mo</span>
            {sampleSize > 0 && (
              <span className="text-[var(--ink-3)]">
                {' '}(median of {sampleSize} comps).
              </span>
            )}
          </p>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <Stat label="Yr 1 cost — buy" value={projection.yearByYear[0]?.cumulativeBuyCost} />
            <Stat
              label="Yr 1 cost — rent"
              value={projection.yearByYear[0]?.cumulativeRentCost}
            />
            <Stat
              label="Yr 5 net buy"
              value={projection.yearByYear[4]?.netBuyPosition}
            />
          </div>

          <p className="text-[10px] leading-snug text-[var(--ink-3)] flex items-start gap-1.5 border-t border-[var(--line-soft)] pt-2">
            <Info className="h-2.5 w-2.5 mt-[2px] shrink-0" />
            <span>
              Assumes 5%/yr property appreciation, 7%/yr rent escalation, 9%/yr
              return on cash invested instead. Fee&shy;line costs included in
              the buy side.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-[6px] border border-[var(--line-soft)] bg-[var(--paper-2)] p-2">
      <p className="text-[var(--ink-3)]">{label}</p>
      <p className="font-data text-[11px] text-[var(--ink)] mt-0.5">
        {value !== undefined ? fmtRand(value, { compact: true }) : '—'}
      </p>
    </div>
  );
}
