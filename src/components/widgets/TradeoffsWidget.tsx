'use client';

import { useState } from 'react';
import {
  Clock,
  Volume2,
  Footprints,
  GraduationCap,
  ShieldCheck,
  Trees,
  Check,
} from 'lucide-react';
import type { Priority } from '@/lib/scoring';

interface TradeoffsWidgetProps {
  /** When false, hide the schools card. */
  showSchools?: boolean;
  onConfirm: (picks: Priority[]) => void;
}

const ITEMS: {
  value: Priority;
  label: string;
  hint: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { value: 'commute',    label: 'Short commute',     hint: 'Or remote-work flex',         Icon: Clock },
  { value: 'quiet_safe', label: 'Quiet & safe',      hint: 'Peaceful streets',            Icon: Volume2 },
  { value: 'walkable',   label: 'Walkable',          hint: 'Cafés, shops, life nearby',  Icon: Footprints },
  { value: 'schools',    label: 'Top schools',       hint: 'Catchment & access',          Icon: GraduationCap },
  { value: 'security',   label: 'Lock-and-go',       hint: 'Gated or complex',            Icon: ShieldCheck },
  { value: 'outdoor',    label: 'Outdoor space',     hint: 'Garden or balcony',           Icon: Trees },
];

const MAX = 2;

export default function TradeoffsWidget({
  showSchools = true,
  onConfirm,
}: TradeoffsWidgetProps) {
  const [picked, setPicked] = useState<Priority[]>([]);

  const visible = showSchools ? ITEMS : ITEMS.filter((i) => i.value !== 'schools');

  const toggle = (p: Priority) => {
    setPicked((prev) => {
      if (prev.includes(p)) return prev.filter((x) => x !== p);
      if (prev.length >= MAX) return [prev[1], p]; // FIFO
      return [...prev, p];
    });
  };

  return (
    <div className="w-[22rem] max-w-full rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--line-soft)]">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
          Trade-offs
        </p>
        <p className="mt-0.5 text-[13px] font-medium text-[var(--ink)]">
          Pick the <span className="font-data">two</span> that matter most.
        </p>
        <p className="mt-1 text-[11px] text-[var(--ink-3)]">
          Forced choice gives a truer signal than rating each one.
        </p>
      </div>

      <div className="p-3 grid grid-cols-2 gap-2">
        {visible.map(({ value, label, hint, Icon }) => {
          const active = picked.includes(value);
          return (
            <button
              key={value}
              onClick={() => toggle(value)}
              className={
                'focus-ring text-left p-3 rounded-[8px] border transition-colors ' +
                (active
                  ? 'bg-[var(--accent-tint)] border-[var(--accent-color)]'
                  : 'bg-[var(--paper-2)] border-[var(--line)] hover:border-[var(--line-strong)]')
              }
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon
                  className={
                    'h-4 w-4 ' +
                    (active ? 'text-[var(--accent-color)]' : 'text-[var(--ink-2)]')
                  }
                  strokeWidth={1.75}
                />
                {active && (
                  <Check
                    className="h-3 w-3 text-[var(--accent-color)]"
                    strokeWidth={3}
                  />
                )}
              </div>
              <p className="text-[12px] font-medium text-[var(--ink)] leading-tight">
                {label}
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--ink-3)] leading-tight">
                {hint}
              </p>
            </button>
          );
        })}
      </div>

      <div className="px-3 pb-3 flex items-center gap-2">
        <p className="flex-1 text-[11px] text-[var(--ink-3)]">
          <span className="font-data text-[var(--ink)]">{picked.length}</span> of{' '}
          <span className="font-data">2</span> selected
        </p>
        <button
          onClick={() => onConfirm(picked)}
          disabled={picked.length !== MAX}
          className="focus-ring h-9 px-4 rounded-[6px] bg-[var(--accent-color)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity disabled:bg-[var(--ink-4)] disabled:cursor-not-allowed"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
