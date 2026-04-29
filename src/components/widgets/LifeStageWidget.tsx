'use client';

import { User, Users, Baby, GraduationCap, Sun, Home } from 'lucide-react';
import type { LifeStage } from '@/lib/scoring';

interface LifeStageWidgetProps {
  onConfirm: (stage: LifeStage) => void;
}

const OPTIONS: {
  value: LifeStage;
  label: string;
  hint: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { value: 'solo', label: 'Solo', hint: 'Living on my own', Icon: User },
  { value: 'couple', label: 'Couple', hint: 'Just the two of us', Icon: Users },
  { value: 'young_family', label: 'Young family', hint: 'Little ones at home', Icon: Baby },
  { value: 'school_family', label: 'School-age family', hint: 'Kids in school', Icon: GraduationCap },
  { value: 'empty_nester', label: 'Empty-nester / retiring', hint: 'Kids have moved out', Icon: Sun },
  { value: 'roommates', label: 'Roommates', hint: 'Sharing with friends', Icon: Home },
];

export default function LifeStageWidget({ onConfirm }: LifeStageWidgetProps) {
  return (
    <div className="w-80 max-w-full rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--line-soft)]">
        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
          Life Stage
        </p>
        <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">
          Helps us tune the match weights to what actually matters for you.
        </p>
      </div>

      <div className="p-2 grid grid-cols-1 gap-1">
        {OPTIONS.map(({ value, label, hint, Icon }) => (
          <button
            key={value}
            onClick={() => onConfirm(value)}
            className="focus-ring group w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-[6px] border border-transparent hover:border-[var(--line)] hover:bg-[var(--paper-3)] transition-colors"
          >
            <span className="h-7 w-7 shrink-0 rounded-[6px] bg-[var(--paper-3)] border border-[var(--line-soft)] flex items-center justify-center group-hover:bg-[var(--accent-tint)] group-hover:border-[var(--line)] transition-colors">
              <Icon
                className="h-3.5 w-3.5 text-[var(--ink-2)] group-hover:text-[var(--accent-color)]"
                strokeWidth={1.75}
              />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-medium text-[var(--ink)] leading-tight">
                {label}
              </span>
              <span className="block text-[11px] text-[var(--ink-3)] leading-tight">
                {hint}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
