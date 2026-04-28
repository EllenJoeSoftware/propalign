'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Search, X, Check } from 'lucide-react';
import {
  PROVINCES,
  SUBURBS_BY_PROVINCE,
  type Province,
} from '@/lib/sa-suburbs';

interface LocationWidgetProps {
  onConfirm: (selection: { provinces: Province[]; suburbs: string[] }) => void;
}

export default function LocationWidget({ onConfirm }: LocationWidgetProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProvinces, setSelectedProvinces] = useState<Province[]>([]);
  const [selectedSuburbs, setSelectedSuburbs] = useState<string[]>([]);
  const [filter, setFilter] = useState('');

  const toggleProvince = (p: Province) => {
    const wasSelected = selectedProvinces.includes(p);
    setSelectedProvinces((prev) =>
      wasSelected ? prev.filter((x) => x !== p) : [...prev, p],
    );
    if (wasSelected) {
      const stale = new Set(SUBURBS_BY_PROVINCE[p]);
      setSelectedSuburbs((prev) => prev.filter((s) => !stale.has(s)));
    }
  };

  const toggleSuburb = (s: string) => {
    setSelectedSuburbs((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const visibleSuburbs = useMemo(() => {
    const all = selectedProvinces.flatMap((p) => SUBURBS_BY_PROVINCE[p]);
    const q = filter.trim().toLowerCase();
    if (!q) return all;
    return all.filter((s) => s.toLowerCase().includes(q));
  }, [selectedProvinces, filter]);

  const handleConfirm = () => {
    onConfirm({ provinces: selectedProvinces, suburbs: selectedSuburbs });
  };

  return (
    <div className="w-[22rem] max-w-full rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--line-soft)] flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
            Location · Step {step} of 2
          </p>
          <p className="mt-0.5 text-[13px] font-medium text-[var(--ink)]">
            {step === 1 ? 'Choose province(s)' : 'Pick your suburbs'}
          </p>
        </div>

        {/* Step indicator — two thin bars */}
        <div className="flex items-center gap-1">
          <span
            className={`h-[2px] w-6 rounded-full transition-colors ${
              step >= 1 ? 'bg-[var(--accent-color)]' : 'bg-[var(--line)]'
            }`}
          />
          <span
            className={`h-[2px] w-6 rounded-full transition-colors ${
              step >= 2 ? 'bg-[var(--accent-color)]' : 'bg-[var(--line)]'
            }`}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="p-4 space-y-4"
          >
            <div className="flex flex-wrap gap-1.5">
              {PROVINCES.map((p) => {
                const active = selectedProvinces.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleProvince(p)}
                    className={
                      'focus-ring inline-flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-full border transition-colors ' +
                      (active
                        ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                        : 'bg-[var(--paper-2)] border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--line-strong)]')
                    }
                  >
                    {active && <Check className="h-3 w-3" strokeWidth={2.5} />}
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selectedProvinces.length === 0}
              className="focus-ring w-full h-9 rounded-[6px] bg-[var(--accent-color)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity disabled:bg-[var(--ink-4)] disabled:cursor-not-allowed"
            >
              Continue
              <span className="font-data ml-1.5 opacity-80">
                ({selectedProvinces.length})
              </span>
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="p-4 space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ink-3)]" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search suburbs"
                className="focus-ring w-full h-9 pl-9 pr-9 text-[13px] rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)] text-[var(--ink)] placeholder:text-[var(--ink-4)] focus:outline-none focus:border-[var(--line-strong)] transition-colors"
              />
              {filter && (
                <button
                  type="button"
                  onClick={() => setFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
                  aria-label="Clear"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Counts */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--ink-3)]">
                <span className="font-data font-medium text-[var(--ink)]">
                  {selectedSuburbs.length}
                </span>{' '}
                selected
                {visibleSuburbs.length > 0 && (
                  <>
                    {' · '}
                    <span className="font-data">{visibleSuburbs.length}</span>{' '}
                    shown
                  </>
                )}
              </span>
              {selectedSuburbs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSuburbs([])}
                  className="text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Suburb chips */}
            <div className="max-h-56 overflow-y-auto scrollbar-thin pr-1 -mr-1">
              {visibleSuburbs.length === 0 ? (
                <p className="text-[12px] text-[var(--ink-3)] text-center py-6">
                  No suburbs match &quot;{filter}&quot;
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {visibleSuburbs.map((s) => {
                    const active = selectedSuburbs.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSuburb(s)}
                        className={
                          'focus-ring inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border transition-colors ' +
                          (active
                            ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                            : 'bg-[var(--paper-2)] border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--line-strong)]')
                        }
                      >
                        {active && <Check className="h-2.5 w-2.5" strokeWidth={2.5} />}
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="focus-ring h-9 px-3 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[12px] text-[var(--ink-2)] inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedSuburbs.length === 0}
                className="focus-ring flex-1 h-9 rounded-[6px] bg-[var(--accent-color)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity disabled:bg-[var(--ink-4)] disabled:cursor-not-allowed"
              >
                Confirm
                <span className="font-data ml-1.5 opacity-80">
                  ({selectedSuburbs.length})
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
