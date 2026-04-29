'use client';

import Link from 'next/link';
import { useCompare } from './CompareProvider';
import { GitCompareArrows, X } from 'lucide-react';

export default function CompareTray() {
  const { ids, remove, clear, max } = useCompare();
  if (ids.length === 0) return null;

  const url = `/compare?ids=${ids.join(',')}`;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[92vw]">
      <div className="rounded-[10px] border border-[var(--line-strong)] bg-[var(--paper-2)] shadow-lg flex items-center gap-3 px-3 py-2">
        <GitCompareArrows
          className="h-3.5 w-3.5 text-[var(--accent-color)] shrink-0"
          strokeWidth={2}
        />
        <p className="text-[11px] text-[var(--ink-2)] whitespace-nowrap">
          <span className="font-data font-medium text-[var(--ink)]">
            {ids.length}
          </span>
          <span className="text-[var(--ink-3)]"> / {max} to compare</span>
        </p>

        <div className="hidden sm:flex items-center gap-1.5">
          {ids.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => remove(id)}
              className="focus-ring inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[var(--line)] bg-[var(--paper-3)] text-[10px] font-data text-[var(--ink-2)] hover:border-[var(--line-strong)]"
              title="Remove from compare"
            >
              {i + 1}
              <X className="h-2 w-2" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={clear}
          className="focus-ring text-[10px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
        >
          Clear
        </button>

        <Link
          href={url}
          className="focus-ring h-8 px-3 rounded-[6px] bg-[var(--accent-color)] text-white text-[11px] font-medium hover:opacity-90 transition-opacity inline-flex items-center"
        >
          Compare {ids.length === 1 ? '' : ids.length}
        </Link>
      </div>
    </div>
  );
}
