'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { buildShareUrl } from '@/lib/share-state';
import type { UserProfile } from '@/lib/scoring';

interface ShareButtonProps {
  profile: UserProfile;
}

export default function ShareButton({ profile }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = buildShareUrl(profile);
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'PropAlign — my home search',
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore (user dismissed share, or clipboard blocked)
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title="Copy a link that restores this exact profile"
      className="focus-ring inline-flex items-center gap-1 h-8 px-2.5 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[11px] font-medium text-[var(--ink-2)] transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-[var(--good)]" strokeWidth={2.5} />
          Copied
        </>
      ) : (
        <>
          <Share2 className="h-3 w-3" strokeWidth={2} />
          Share
        </>
      )}
    </button>
  );
}
