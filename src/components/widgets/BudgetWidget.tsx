'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface BudgetWidgetProps {
  onConfirm: (value: number) => void;
  initialValue?: number;
  /** If known, used to flag when user pushes >30% of net income. */
  netIncome?: number;
}

const MIN = 2000;
const MAX = 50000;
const STEP = 500;

export default function BudgetWidget({
  onConfirm,
  initialValue,
  netIncome,
}: BudgetWidgetProps) {
  const start =
    typeof initialValue === 'number' && initialValue >= MIN
      ? initialValue
      : 10000;
  const [value, setValue] = useState<number>(start);

  // Stutzer & Frey + SA financial-advisor guideline: keep housing ≤ 30% of net.
  const stretchPct =
    netIncome && netIncome > 0 ? value / netIncome : null;
  const overStretched = stretchPct !== null && stretchPct > 0.30;

  return (
    <div className="w-80 max-w-full rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--line-soft)]">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
          Monthly Budget
        </p>
        <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">
          What can you comfortably spend each month?
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="font-data text-[28px] font-semibold tracking-[-0.02em] text-[var(--ink)] leading-none">
            R{value.toLocaleString('en-ZA')}
          </p>
          <p className="mt-1 text-[11px] text-[var(--ink-3)]">
            {stretchPct !== null
              ? `${Math.round(stretchPct * 100)}% of your net income`
              : 'per month'}
          </p>
        </div>

        <SliderPrimitive.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          min={MIN}
          max={MAX}
          step={STEP}
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
            aria-label="Budget"
          />
        </SliderPrimitive.Root>

        <div className="flex justify-between font-data text-[11px] text-[var(--ink-3)]">
          <span>R{MIN.toLocaleString('en-ZA')}</span>
          <span>R{MAX.toLocaleString('en-ZA')}+</span>
        </div>

        {overStretched && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)]">
            <AlertTriangle
              className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[var(--warn)]"
              strokeWidth={2}
            />
            <p className="text-[11px] leading-snug text-[var(--ink-2)]">
              Most South Africans aim for ≤<span className="font-data">30%</span> of
              net income on housing. You can still confirm this — just a heads-up.
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
