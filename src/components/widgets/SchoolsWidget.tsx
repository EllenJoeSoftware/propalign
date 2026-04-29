'use client';

import { useMemo, useState } from 'react';
import { Search, X, Check, GraduationCap } from 'lucide-react';
import { SA_SCHOOLS, type School } from '@/lib/sa-schools';

interface SchoolsWidgetProps {
  onConfirm: (schools: School[]) => void;
}

export default function SchoolsWidget({ onConfirm }: SchoolsWidgetProps) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SA_SCHOOLS.slice(0, 30);
    return SA_SCHOOLS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.suburb.toLowerCase().includes(q) ||
        s.province.toLowerCase().includes(q),
    ).slice(0, 50);
  }, [query]);

  const toggle = (id: string) =>
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const confirm = () => {
    const chosen = SA_SCHOOLS.filter((s) => picked.includes(s.id));
    onConfirm(chosen);
  };

  return (
    <div className="w-[22rem] max-w-full rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--line-soft)] flex items-center gap-2">
        <div className="h-7 w-7 rounded-[6px] bg-[var(--paper-3)] border border-[var(--line-soft)] flex items-center justify-center">
          <GraduationCap
            className="h-3.5 w-3.5 text-[var(--ink-2)]"
            strokeWidth={1.75}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
            Schools (optional)
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">
            Add the schools your kids attend or are aiming for.
          </p>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ink-3)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, suburb, or province"
            className="focus-ring w-full h-9 pl-9 pr-9 text-[13px] rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)] text-[var(--ink)] placeholder:text-[var(--ink-4)] focus:outline-none focus:border-[var(--line-strong)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)]"
              aria-label="Clear"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="max-h-56 overflow-y-auto scrollbar-thin pr-1 -mr-1 space-y-1">
          {visible.length === 0 ? (
            <p className="text-[12px] text-[var(--ink-3)] text-center py-6">
              No schools match &quot;{query}&quot;
            </p>
          ) : (
            visible.map((s) => {
              const active = picked.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className={
                    'focus-ring w-full text-left flex items-start gap-2 px-3 py-2 rounded-[6px] border transition-colors ' +
                    (active
                      ? 'bg-[var(--accent-tint)] border-[var(--accent-color)]'
                      : 'bg-[var(--paper-2)] border-[var(--line)] hover:border-[var(--line-strong)]')
                  }
                >
                  <span
                    className={
                      'mt-0.5 h-3 w-3 rounded-[3px] border flex items-center justify-center shrink-0 ' +
                      (active
                        ? 'bg-[var(--accent-color)] border-[var(--accent-color)]'
                        : 'bg-[var(--paper-2)] border-[var(--line-strong)]')
                    }
                  >
                    {active && (
                      <Check
                        className="h-2 w-2 text-white"
                        strokeWidth={3}
                      />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12px] font-medium text-[var(--ink)] leading-tight">
                      {s.name}
                    </span>
                    <span className="block text-[10px] text-[var(--ink-3)] leading-tight">
                      {s.suburb}, {s.province} · {s.type} · {s.level}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onConfirm([])}
            className="focus-ring h-8 px-3 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[11px] text-[var(--ink-2)]"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={picked.length === 0}
            className="focus-ring flex-1 h-8 rounded-[6px] bg-[var(--accent-color)] text-white text-[11px] font-medium hover:opacity-90 transition-opacity disabled:bg-[var(--ink-4)] disabled:cursor-not-allowed"
          >
            Confirm
            <span className="font-data ml-1.5 opacity-80">
              ({picked.length})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
