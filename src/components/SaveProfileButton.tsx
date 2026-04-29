'use client';

import { useState } from 'react';
import { Bookmark, Check, X, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/scoring';

interface SaveProfileButtonProps {
  profile: UserProfile;
}

export default function SaveProfileButton({ profile }: SaveProfileButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [wantsAlerts, setWantsAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/saved-profile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, profile, wantsAlerts }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setDone(json.digest ?? 'Saved.');
    } catch (err: any) {
      setError(err?.message ?? 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setDone(null);
          setError(null);
        }}
        className="focus-ring inline-flex items-center gap-1 h-8 px-2.5 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[11px] font-medium text-[var(--ink-2)] transition-colors"
        title="Save profile and get weekly matches by email"
      >
        <Bookmark className="h-3 w-3" strokeWidth={2} />
        Save
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="shrink-0 border-b border-[var(--line)] px-5 py-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium">
                  Save & subscribe
                </p>
                <h3 className="font-editorial text-[16px] font-medium text-[var(--ink)] mt-0.5">
                  Get weekly matches
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring h-7 w-7 rounded-[6px] hover:bg-[var(--paper-3)] flex items-center justify-center text-[var(--ink-3)]"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            <div className="px-5 py-4 space-y-4">
              {done ? (
                <div className="space-y-2 py-4">
                  <div className="h-8 w-8 rounded-full bg-[var(--good)]/15 flex items-center justify-center">
                    <Check
                      className="h-4 w-4 text-[var(--good)]"
                      strokeWidth={2.5}
                    />
                  </div>
                  <p className="text-[13px] text-[var(--ink)]">{done}</p>
                </div>
              ) : (
                <>
                  <p className="text-[12px] text-[var(--ink-2)]">
                    We'll send a curated weekly digest of new properties that
                    match your profile. No spam, unsubscribe anytime.
                  </p>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="focus-ring w-full mt-1 h-9 px-3 text-[13px] rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)] text-[var(--ink)] placeholder:text-[var(--ink-4)] focus:outline-none focus:border-[var(--line-strong)]"
                    />
                  </div>

                  <label className="flex items-start gap-2 text-[12px] text-[var(--ink-2)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantsAlerts}
                      onChange={(e) => setWantsAlerts(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>Send me a weekly digest of new matches</span>
                  </label>

                  {error && (
                    <p className="text-[11px] text-[var(--danger)]">{error}</p>
                  )}

                  <button
                    type="button"
                    onClick={submit}
                    disabled={saving || !email}
                    className="focus-ring w-full h-9 rounded-[6px] bg-[var(--accent-color)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity disabled:bg-[var(--ink-4)] disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                  >
                    {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                    {saving ? 'Saving' : 'Save profile'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
