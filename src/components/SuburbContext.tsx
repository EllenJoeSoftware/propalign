'use client';

import { Zap, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  getLoadShedding,
  getSafety,
  LS_TIER_LABEL,
  SAFETY_TIER_LABEL,
  type LoadSheddingTier,
  type SafetyTier,
} from '@/lib/sa-context';

interface SuburbContextProps {
  suburb: string;
  /** When true, only show LS tier (smaller footprint for grid cards). */
  compact?: boolean;
}

const LS_COLOR: Record<LoadSheddingTier, string> = {
  minimal: 'text-[var(--good)] border-[var(--good)]/30',
  low: 'text-[var(--good)] border-[var(--good)]/20',
  moderate: 'text-[var(--ink-2)] border-[var(--line)]',
  high: 'text-[var(--warn)] border-[var(--warn)]/30',
  severe: 'text-[var(--danger)] border-[var(--danger)]/30',
};

const SAFETY_COLOR: Record<SafetyTier, string> = {
  low: 'text-[var(--good)] border-[var(--good)]/20',
  moderate: 'text-[var(--ink-2)] border-[var(--line)]',
  high: 'text-[var(--warn)] border-[var(--warn)]/30',
  very_high: 'text-[var(--danger)] border-[var(--danger)]/30',
};

export default function SuburbContext({
  suburb,
  compact = false,
}: SuburbContextProps) {
  const ls = getLoadShedding(suburb);
  const safety = getSafety(suburb);
  if (!ls && !safety) return null;

  return (
    <div className="flex items-center flex-wrap gap-1.5">
      {ls && (
        <span
          title={`${ls.approxHoursPerYear} hrs/yr · ${ls.note}`}
          className={
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] bg-[var(--paper-2)] ' +
            LS_COLOR[ls.tier]
          }
        >
          <Zap className="h-2.5 w-2.5" strokeWidth={2} />
          <span className="font-medium">{LS_TIER_LABEL[ls.tier]}</span>
          {!compact && (
            <span className="font-data text-[var(--ink-3)]">
              ~{ls.approxHoursPerYear}h/yr
            </span>
          )}
        </span>
      )}
      {!compact && safety && (
        <span
          title={`${safety.precinct} · ${safety.note}`}
          className={
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] bg-[var(--paper-2)] ' +
            SAFETY_COLOR[safety.tier]
          }
        >
          {safety.tier === 'low' ? (
            <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2} />
          ) : (
            <ShieldAlert className="h-2.5 w-2.5" strokeWidth={2} />
          )}
          <span className="font-medium">{SAFETY_TIER_LABEL[safety.tier]}</span>
        </span>
      )}
    </div>
  );
}
