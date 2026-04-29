'use client';

import { Clock } from 'lucide-react';

interface DaysOnMarketProps {
  createdAt?: string;
  /** Smaller variant for grid cards. */
  compact?: boolean;
}

export default function DaysOnMarket({
  createdAt,
  compact = false,
}: DaysOnMarketProps) {
  if (!createdAt) return null;
  const ts = Date.parse(createdAt);
  if (Number.isNaN(ts)) return null;

  const days = Math.max(0, Math.floor((Date.now() - ts) / 86_400_000));

  // Tier:
  //   • 0-13   fresh (no badge — too noisy)
  //   • 14-44  on-market (neutral)
  //   • 45-89  lingering (terracotta)
  //   • 90+    stale, likely negotiable (terracotta strong)
  if (days < 14) return null;

  let tone = 'text-[var(--ink-2)] border-[var(--line)]';
  let label = `Listed ${days} days ago`;
  let title =
    'On the market a while — sellers may be more open to a serious offer';

  if (days >= 90) {
    tone = 'text-[var(--warn)] border-[var(--warn)]/30';
    title = 'Stale listing — strong negotiation signal';
  } else if (days >= 45) {
    tone = 'text-[var(--warn)] border-[var(--warn)]/20';
  }

  return (
    <span
      title={title}
      className={
        'inline-flex items-center gap-1 rounded-full border bg-[var(--paper-2)] ' +
        (compact ? 'px-1.5 py-0.5 text-[9px] ' : 'px-2 py-0.5 text-[10px] ') +
        tone
      }
    >
      <Clock
        className={compact ? 'h-2 w-2' : 'h-2.5 w-2.5'}
        strokeWidth={2}
      />
      <span className="font-medium">{label}</span>
    </span>
  );
}
