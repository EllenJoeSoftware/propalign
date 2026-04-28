'use client';

import { useState } from 'react';
import { BedDouble, Check } from 'lucide-react';

interface BedroomsWidgetProps {
  onConfirm: (count: number) => void;
  initialValue?: number;
}

const OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function BedroomsWidget({
  onConfirm,
  initialValue,
}: BedroomsWidgetProps) {
  const [picked, setPicked] = useState<number | null>(
    typeof initialValue === 'number' && initialValue >= 1 ? initialValue : null,
  );

  return (
    <div className="w-80 max-w-full rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--line-soft)] flex items-center gap-2">
        <div className="h-7 w-7 rounded-[6px] bg-[var(--paper-3)] border border-[var(--line-soft)] flex items-center justify-center">
          <BedDouble
            className="h-3.5 w-3.5 text-[var(--ink-2)]"
            strokeWidth={1.75}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
            Bedrooms
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">
            What's the smallest you'd consider? Tap to pick.
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 5 × 2 grid of number tiles */}
        <div className="grid grid-cols-5 gap-1.5">
          {OPTIONS.map((n) => {
            const active = picked === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPicked(n)}
                className={
                  'focus-ring h-10 rounded-[6px] border font-data text-[14px] font-medium transition-colors ' +
                  (active
                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                    : 'bg-[var(--paper-2)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line-strong)]')
                }
                aria-pressed={active}
                aria-label={`${n} bedroom${n === 1 ? '' : 's'}`}
              >
                {n === 10 ? '10+' : n}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => picked !== null && onConfirm(picked)}
          disabled={picked === null}
          className="focus-ring w-full h-9 rounded-[6px] bg-[var(--accent-color)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity disabled:bg-[var(--ink-4)] disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
        >
          {picked !== null && <Check className="h-3 w-3" strokeWidth={2.5} />}
          {picked === null
            ? 'Pick a number'
            : `Confirm ${picked === 10 ? '10+' : picked} bedroom${picked === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  );
}
