'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface BudgetWidgetProps {
  onConfirm: (value: number) => void;
  initialValue?: number;
  /** If known, used to flag when user pushes >30% of net income. */
  netIncome?: number;
  /**
   * When true, the widget collects a PURCHASE PRICE (R300k–R30M).
   * When false (or undefined), it collects a MONTHLY RENT (R2k–R50k).
   * The two modes use different units, so the search backend can use the
   * value at face value with no conversion.
   */
  isBuying?: boolean;
}

// Two slider configs — one per mode.
const RENT_CFG = {
  min: 2000,
  max: 50000,
  step: 500,
  default: 10000,
  title: 'Monthly Rent',
  prompt: 'What can you comfortably spend each month?',
  unitNote: 'per month',
  fmtTick: (n: number) => `R${n.toLocaleString('en-ZA')}`,
} as const;

const BUY_CFG = {
  min: 300_000,
  max: 30_000_000,
  step: 50_000,
  default: 1_500_000,
  title: 'Purchase Price',
  prompt: 'What’s the most you’d consider paying?',
  unitNote: 'total purchase price',
  fmtTick: (n: number) =>
    n >= 1_000_000
      ? `R${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
      : `R${(n / 1000).toFixed(0)}k`,
} as const;

/**
 * Monthly bond payment for a SA-style 20-year, 11.25% (prime) bond.
 * Used to translate purchase price → effective monthly outlay so we can
 * compare buyer affordability against the same 30%-of-net rule.
 */
function monthlyBondPayment(
  price: number,
  annualRate = 0.1125,
  years = 20,
): number {
  if (price <= 0) return 0;
  const r = annualRate / 12;
  const n = years * 12;
  return (price * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function BudgetWidget({
  onConfirm,
  initialValue,
  netIncome,
  isBuying = false,
}: BudgetWidgetProps) {
  const cfg = isBuying ? BUY_CFG : RENT_CFG;

  const start =
    typeof initialValue === 'number' && initialValue >= cfg.min
      ? Math.min(initialValue, cfg.max)
      : cfg.default;
  const [value, setValue] = useState<number>(start);

  // Effective monthly housing cost. For renters this IS the value; for
  // buyers it's the implied bond payment. The 30%-of-net rule is applied
  // to whichever is appropriate.
  const monthlyCost = isBuying ? monthlyBondPayment(value) : value;
  const stretchPct =
    netIncome && netIncome > 0 ? monthlyCost / netIncome : null;
  const overStretched = stretchPct !== null && stretchPct > 0.30;

  // Format the headline number — R12,500 for rent, R1.5M for purchase.
  const headline = isBuying
    ? value >= 1_000_000
      ? `R${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
      : `R${value.toLocaleString('en-ZA')}`
    : `R${value.toLocaleString('en-ZA')}`;

  // Sub-label under the headline — different per mode.
  const subLabel = isBuying
    ? `≈ R${Math.round(monthlyCost).toLocaleString('en-ZA')}/mo bond${
        stretchPct !== null
          ? ` · ${Math.round(stretchPct * 100)}% of net income`
          : ''
      }`
    : stretchPct !== null
      ? `${Math.round(stretchPct * 100)}% of your net income`
      : cfg.unitNote;

  return (
    <div className="w-80 max-w-full rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--line-soft)]">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
          {cfg.title}
        </p>
        <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">{cfg.prompt}</p>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="font-data text-[28px] font-semibold tracking-[-0.02em] text-[var(--ink)] leading-none">
            {headline}
          </p>
          <p className="mt-1 text-[11px] text-[var(--ink-3)]">{subLabel}</p>
        </div>

        <SliderPrimitive.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          defaultValue={[start]}
          onValueChange={(vals) => {
            if (Array.isArray(vals) && typeof vals[0] === 'number') {
              setValue(vals[0]);
            }
          }}
        >
          <SliderPrimitive.Track className="bg-[var(--paper-3)] relative grow rounded-full h-1">
            <SliderPrimitive.Range
              className={
                'absolute rounded-full h-full ' +
                (overStretched ? 'bg-[var(--warn)]' : 'bg-[var(--accent-color)]')
              }
            />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className={
              'block h-3.5 w-3.5 bg-[var(--paper-2)] rounded-full border-[1.5px] focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(30,58,95,0.18)] cursor-grab active:cursor-grabbing transition-colors ' +
              (overStretched
                ? 'border-[var(--warn)]'
                : 'border-[var(--accent-color)]')
            }
            aria-label={cfg.title}
          />
        </SliderPrimitive.Root>

        <div className="flex justify-between font-data text-[11px] text-[var(--ink-3)]">
          <span>{cfg.fmtTick(cfg.min)}</span>
          <span>{cfg.fmtTick(cfg.max)}+</span>
        </div>

        {overStretched && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)]">
            <AlertTriangle
              className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[var(--warn)]"
              strokeWidth={2}
            />
            <p className="text-[11px] leading-snug text-[var(--ink-2)]">
              Most South Africans aim for ≤
              <span className="font-data"> 30%</span> of net income on housing.
              You can still confirm this — just a heads-up.
            </p>
          </div>
        )}

        <button
          onClick={() => onConfirm(value)}
          className="focus-ring w-full h-9 rounded-[6px] bg-[var(--accent-color)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
