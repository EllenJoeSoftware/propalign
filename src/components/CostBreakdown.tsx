'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import {
  calculateOwnershipCost,
  estimateRentalUpfront,
  fmtRand,
  DEFAULT_BOND_RATE,
  DEFAULT_BOND_TERM_YEARS,
  DEFAULT_DEPOSIT_RATIO,
} from '@/lib/sa-financial';

interface CostBreakdownProps {
  price: number;
  propertyType: string;
  isForRent: boolean;
  /** When true, only renders the headline summary line (no chevron, no expand). */
  compact?: boolean;
}

export default function CostBreakdown({
  price,
  propertyType,
  isForRent,
  compact = false,
}: CostBreakdownProps) {
  const [open, setOpen] = useState(false);

  // Rental path — much simpler. No bond, no transfer duty.
  if (isForRent) {
    const r = useMemo(() => estimateRentalUpfront(price), [price]);
    return (
      <div className="rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)] overflow-hidden">
        <button
          type="button"
          onClick={() => !compact && setOpen((o) => !o)}
          className="w-full px-3 py-2 flex items-center justify-between gap-2 text-left"
          disabled={compact}
        >
          <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)] font-medium">
            True monthly cost
          </span>
          <span className="font-data text-[12px] font-medium text-[var(--ink)]">
            {fmtRand(price)}
            <span className="text-[var(--ink-3)] font-normal">/mo</span>
          </span>
          {!compact && (
            <ChevronDown
              className={`h-3 w-3 text-[var(--ink-3)] transition-transform ${open ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        {open && (
          <div className="px-3 pb-3 pt-1 text-[11px] space-y-1 border-t border-[var(--line-soft)]">
            <Row label="First month" value={r.firstMonth} />
            <Row label="Deposit (1 month)" value={r.deposit} />
            <Row label="Admin / FICA fee" value={r.adminFee} small />
            <div className="flex justify-between pt-1 border-t border-[var(--line-soft)] font-medium">
              <span className="text-[var(--ink-2)]">To move in</span>
              <span className="font-data text-[var(--ink)]">
                {fmtRand(r.totalUpfront)}
              </span>
            </div>
            <p className="pt-1 text-[10px] text-[var(--ink-3)] flex items-start gap-1.5">
              <Info className="h-2.5 w-2.5 mt-[2px] shrink-0" />
              <span>
                Excludes utilities (electricity, water, fibre) which the
                tenant typically pays directly.
              </span>
            </p>
          </div>
        )}
      </div>
    );
  }

  // Buy path — the full calculator.
  const b = useMemo(
    () => calculateOwnershipCost({ price, propertyType }),
    [price, propertyType],
  );

  return (
    <div className="rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)] overflow-hidden">
      <button
        type="button"
        onClick={() => !compact && setOpen((o) => !o)}
        className="w-full px-3 py-2 flex items-center justify-between gap-2 text-left"
        disabled={compact}
      >
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)] font-medium">
            True monthly cost
          </span>
          <span className="font-data text-[12px] font-medium text-[var(--ink)]">
            {fmtRand(b.totalMonthly)}
            <span className="text-[var(--ink-3)] font-normal">/mo</span>
            <span className="ml-2 text-[10px] text-[var(--ink-3)] font-normal">
              + {fmtRand(b.totalUpfront, { compact: true })} upfront
            </span>
          </span>
        </div>
        {!compact && (
          <ChevronDown
            className={`h-3 w-3 text-[var(--ink-3)] transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t border-[var(--line-soft)]">
          {/* Upfront */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)] font-medium mb-1.5">
              Upfront
            </p>
            <div className="space-y-1 text-[11px]">
              <Row
                label={`Deposit (${Math.round(b.inputs.depositRatio * 100)}%)`}
                value={b.deposit}
              />
              <Row label="Transfer duty (SARS)" value={b.transferDuty} />
              <Row label="Bond registration" value={b.bondRegistration} small />
              <Row label="Transfer attorney" value={b.conveyancing} small />
              <div className="flex justify-between pt-1 border-t border-[var(--line-soft)] font-medium">
                <span className="text-[var(--ink-2)]">Total upfront</span>
                <span className="font-data text-[var(--ink)]">
                  {fmtRand(b.totalUpfront)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)] font-medium mb-1.5">
              Monthly
            </p>
            <div className="space-y-1 text-[11px]">
              <Row label="Bond repayment" value={b.bondPayment} />
              <Row label="Municipal rates" value={b.rates} small />
              {b.levies > 0 && (
                <Row label="Body corporate levies" value={b.levies} small />
              )}
              <Row label="Building insurance" value={b.insurance} small />
              <div className="flex justify-between pt-1 border-t border-[var(--line-soft)] font-medium">
                <span className="text-[var(--ink-2)]">Total monthly</span>
                <span className="font-data text-[var(--ink)]">
                  {fmtRand(b.totalMonthly)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] leading-snug text-[var(--ink-3)] flex items-start gap-1.5 border-t border-[var(--line-soft)] pt-2">
            <Info className="h-2.5 w-2.5 mt-[2px] shrink-0" />
            <span>
              Estimates assume {Math.round(DEFAULT_DEPOSIT_RATIO * 100)}%
              deposit, {DEFAULT_BOND_TERM_YEARS}-year bond at{' '}
              {(DEFAULT_BOND_RATE * 100).toFixed(2)}%, building insurance only.
              Rates &amp; levies are tier-estimated; your real numbers may
              differ.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  small = false,
}: {
  label: string;
  value: number;
  small?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${small ? 'text-[var(--ink-3)]' : 'text-[var(--ink-2)]'}`}
    >
      <span>{label}</span>
      <span className="font-data text-[var(--ink)]">{fmtRand(value)}</span>
    </div>
  );
}
