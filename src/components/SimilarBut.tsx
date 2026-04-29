'use client';

import { TrendingDown, BedDouble, MapPin, Trees } from 'lucide-react';
import type { UserProfile, PropertyMatch } from '@/lib/scoring';

interface SimilarButProps {
  prop: PropertyMatch;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

/**
 * Tweak buttons that mutate the profile to find variations on the current
 * top match. Each click adjusts a single dimension and lets the right pane
 * refilter automatically — no chat round-trip needed.
 */
export default function SimilarBut({
  prop,
  profile,
  setProfile,
}: SimilarButProps) {
  const goCheaper = () => {
    // Drop budget cap to ~80% of current match price (rounded).
    const newCap = Math.max(
      prop.isForRent ? 2_000 : 400_000,
      Math.round((prop.price * 0.8) / 500) * 500,
    );
    setProfile((p) => ({ ...p, budget: newCap }));
  };

  const goBigger = () => {
    setProfile((p) => ({ ...p, minBedrooms: Math.min(10, prop.bedrooms + 1) }));
  };

  const goDifferentSuburb = () => {
    // Drop the current property's suburb from the user's selection (if it's
    // there) or, if they had none selected, exclude this suburb specifically.
    setProfile((p) => {
      const next = (p.suburbs ?? []).filter(
        (s) => s.toLowerCase() !== prop.location.toLowerCase(),
      );
      return { ...p, suburbs: next };
    });
  };

  const goWithGarden = () => {
    // Add Outdoor as a top priority if not already there.
    setProfile((p) => {
      const current = p.topPriorities ?? [];
      if (current.includes('outdoor')) return p;
      // Replace the lowest-strength priority slot
      const next = current.length >= 2 ? [current[1], 'outdoor'] : [...current, 'outdoor'];
      return { ...p, topPriorities: next as any };
    });
  };

  const Btn = ({
    onClick,
    Icon,
    label,
    title,
  }: {
    onClick: () => void;
    Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    label: string;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="focus-ring inline-flex items-center gap-1 h-7 px-2.5 rounded-full border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] hover:bg-[var(--paper-3)] text-[10px] font-medium text-[var(--ink-2)] transition-colors"
    >
      <Icon className="h-2.5 w-2.5" strokeWidth={2} />
      {label}
    </button>
  );

  return (
    <div className="rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)] font-medium mb-2">
        Show me similar but…
      </p>
      <div className="flex items-center flex-wrap gap-1.5">
        <Btn
          onClick={goCheaper}
          Icon={TrendingDown}
          label="Cheaper"
          title="Cap budget around 20% lower"
        />
        <Btn
          onClick={goBigger}
          Icon={BedDouble}
          label="Bigger"
          title={`At least ${prop.bedrooms + 1}+ bedrooms`}
        />
        <Btn
          onClick={goDifferentSuburb}
          Icon={MapPin}
          label="Different area"
          title={`Exclude ${prop.location} from selection`}
        />
        <Btn
          onClick={goWithGarden}
          Icon={Trees}
          label="More outdoor"
          title="Boost outdoor space priority"
        />
      </div>
    </div>
  );
}
