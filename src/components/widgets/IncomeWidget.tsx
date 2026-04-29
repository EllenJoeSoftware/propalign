'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { useState } from 'react';

interface IncomeWidgetProps {
  onConfirm: (value: number) => void;
  initialValue?: number;
}

const MIN = 3000;
const MAX = 150000;
const STEP = 1000;

export default function IncomeWidget({
  onConfirm,
  initialValue,
}: IncomeWidgetProps) {
  const start =
    typeof initialValue === 'number' && initialValue >= MIN
      ? initialValue
      : 20000;
  const [value, setValue] = useState<number>(start);

  // 30% rule — common SA financial advisor guideline
  const recommendedBudget = Math.round((value * 0.3) / 500) * 500;

  return (
    <div className="w-80 max-w-full rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--line-soft)]">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
          Monthly Net Income
        </p>
        <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">
          After tax — used to size a healthy housing budget.
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="font-data text-[28px] font-semibold tracking-[-0.02em] text-[var(--ink)] leading-none">
            R{value.toLocaleString('en-ZA')}
          </p>
          <p className="mt-1 text-[11px] text-[var(--ink-3)]">
            ≈ R{recommendedBudget.toLocaleString('en-ZA')} suggested housing budget (30%)
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
            <SliderPrimitive.Range className="absolute bg-[var(--accent-color)] rounded-full h-full" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className="block h-3.5 w-3.5 bg-[var(--paper-2)] rounded-full border-[1.5px] border-[var(--accent-color)] focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(30,58,95,0.18)] cursor-grab active:cursor-grabbing"
            aria-label="Monthly net income"
          />
        </SliderPrimitive.Root>

        <div className="flex justify-between font-data text-[11px] text-[var(--ink-3)]">
          <span>R{MIN.toLocaleString('en-ZA')}</span>
          <span>R{MAX.toLocaleString('en-ZA')}+</span>
        </div>

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
