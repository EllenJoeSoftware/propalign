'use client';

import { useState } from 'react';
import { ClipboardList, X, Loader2, AlertTriangle } from 'lucide-react';

interface Checklist {
  intro: string;
  groups: Array<{
    title: string;
    items: Array<{ question: string; why: string }>;
  }>;
  redFlags: string[];
}

interface ViewingAssistantProps {
  propertyId: string;
  propertyTitle: string;
}

export default function ViewingAssistant({
  propertyId,
  propertyTitle,
}: ViewingAssistantProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setOpen(true);
    if (data) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/viewing-checklist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as Checklist;
      setData(json);
    } catch (err: any) {
      setError(err?.message ?? 'Could not generate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={generate}
        className="focus-ring inline-flex items-center gap-1.5 h-8 px-3 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[11px] font-medium text-[var(--ink-2)] transition-colors"
      >
        <ClipboardList className="h-3 w-3" strokeWidth={2} />
        Prep me for the viewing
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="shrink-0 border-b border-[var(--line)] px-5 py-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium">
                  Viewing Prep
                </p>
                <h3 className="font-editorial text-[16px] font-medium text-[var(--ink)] line-clamp-1 mt-0.5">
                  {propertyTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring h-7 w-7 rounded-[6px] hover:bg-[var(--paper-3)] flex items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)]"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
              {loading && (
                <div className="flex flex-col items-center py-12 gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-color)]" />
                  <p className="text-[12px] text-[var(--ink-3)]">
                    Reading the listing and tailoring questions…
                  </p>
                </div>
              )}

              {error && (
                <p className="text-[13px] text-[var(--danger)]">{error}</p>
              )}

              {data && (
                <div className="space-y-5">
                  <p className="font-editorial italic text-[14px] leading-relaxed text-[var(--ink-2)]">
                    {data.intro}
                  </p>

                  {data.groups.map((g, gi) => (
                    <section key={gi} className="space-y-2">
                      <h4 className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium">
                        {g.title}
                      </h4>
                      <ul className="space-y-2">
                        {g.items.map((it, ii) => (
                          <li
                            key={ii}
                            className="rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)] px-3 py-2"
                          >
                            <p className="text-[12px] font-medium text-[var(--ink)] leading-snug">
                              {it.question}
                            </p>
                            <p className="mt-1 text-[10px] leading-snug text-[var(--ink-3)]">
                              {it.why}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}

                  {data.redFlags?.length > 0 && (
                    <section className="rounded-[6px] border border-[var(--warn)]/50 bg-[var(--paper-3)] p-3 space-y-2">
                      <h4 className="text-[10px] uppercase tracking-[0.12em] text-[var(--warn)] font-medium inline-flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3" />
                        Red flags from the listing
                      </h4>
                      <ul className="space-y-1.5">
                        {data.redFlags.map((rf, ri) => (
                          <li
                            key={ri}
                            className="text-[11px] text-[var(--ink-2)] leading-snug"
                          >
                            • {rf}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              )}
            </div>

            <footer className="shrink-0 border-t border-[var(--line)] px-5 py-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring h-8 px-3 rounded-[6px] bg-[var(--accent-color)] text-white text-[11px] font-medium hover:opacity-90 transition-opacity"
              >
                Got it
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
