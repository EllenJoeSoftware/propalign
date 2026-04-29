'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  User,
  Wallet,
  TrendingUp,
  MapPin,
  Bed,
  ListChecks,
  GraduationCap,
} from 'lucide-react';
import type { UserProfile } from '@/lib/scoring';

interface ProfilePanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const friendlyStage: Record<string, string> = {
  solo: 'Solo',
  couple: 'Couple',
  young_family: 'Young family',
  school_family: 'School-age family',
  empty_nester: 'Empty-nester',
  roommates: 'Roommates',
};

const friendlyPriority: Record<string, string> = {
  commute: 'Commute',
  quiet_safe: 'Quiet & safe',
  walkable: 'Walkable',
  schools: 'Schools',
  security: 'Security',
  outdoor: 'Outdoor',
};

export default function ProfilePanel({
  profile,
  setProfile,
}: ProfilePanelProps) {
  const [open, setOpen] = useState(true);

  // Don't render at all until the user has answered at least the rent/buy
  // and one substantive question — pre-onboarding the panel is just clutter.
  const hasSubstance =
    !!profile.lifeStage ||
    profile.netIncome > 0 ||
    profile.budget > 0 ||
    (profile.suburbs?.length ?? 0) > 0;
  if (!hasSubstance) return null;

  const fields: Array<{
    Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    label: string;
    value: string;
    onClear?: () => void;
  }> = [];

  fields.push({
    Icon: User,
    label: 'Mode',
    value: `${profile.isBuying ? 'Buying' : 'Renting'}${
      profile.lifeStage ? ` · ${friendlyStage[profile.lifeStage]}` : ''
    }`,
    onClear: profile.lifeStage
      ? () => setProfile((p) => ({ ...p, lifeStage: undefined }))
      : undefined,
  });

  if (profile.netIncome > 0) {
    fields.push({
      Icon: TrendingUp,
      label: 'Net income',
      value: `R${profile.netIncome.toLocaleString('en-ZA')}/mo`,
      onClear: () => setProfile((p) => ({ ...p, netIncome: 0 })),
    });
  }

  if (profile.budget > 0) {
    fields.push({
      Icon: Wallet,
      label: 'Budget',
      value: `R${profile.budget.toLocaleString('en-ZA')}${profile.isBuying ? '' : '/mo'}`,
      onClear: () => setProfile((p) => ({ ...p, budget: 0 })),
    });
  }

  if (profile.suburbs && profile.suburbs.length > 0) {
    fields.push({
      Icon: MapPin,
      label: 'Suburbs',
      value:
        profile.suburbs.length <= 2
          ? profile.suburbs.join(', ')
          : `${profile.suburbs[0]} + ${profile.suburbs.length - 1} more`,
      onClear: () =>
        setProfile((p) => ({ ...p, suburbs: [], provinces: [] })),
    });
  }

  if (profile.minBedrooms > 1) {
    fields.push({
      Icon: Bed,
      label: 'Bedrooms',
      value: `${profile.minBedrooms}+`,
      onClear: () => setProfile((p) => ({ ...p, minBedrooms: 1 })),
    });
  }

  if (profile.topPriorities && profile.topPriorities.length > 0) {
    fields.push({
      Icon: ListChecks,
      label: 'Priorities',
      value: profile.topPriorities
        .map((p) => friendlyPriority[p] ?? p)
        .join(', '),
      onClear: () => setProfile((p) => ({ ...p, topPriorities: [] })),
    });
  }

  if (profile.schoolLocations.length > 0) {
    fields.push({
      Icon: GraduationCap,
      label: 'Schools',
      value: profile.schoolLocations
        .slice(0, 2)
        .map((s) => s.name)
        .join(', ') +
        (profile.schoolLocations.length > 2
          ? ` + ${profile.schoolLocations.length - 2}`
          : ''),
      onClear: () => setProfile((p) => ({ ...p, schoolLocations: [] })),
    });
  }

  return (
    <section className="shrink-0 border-b border-[var(--line)] bg-[var(--paper)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-6 py-2.5 flex items-center justify-between gap-3 hover:bg-[var(--paper-3)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium">
            Your profile
          </span>
          <span className="font-data text-[11px] text-[var(--ink-3)]">
            {fields.length} {fields.length === 1 ? 'fact' : 'facts'}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-3 w-3 text-[var(--ink-3)]" strokeWidth={2} />
        ) : (
          <ChevronDown className="h-3 w-3 text-[var(--ink-3)]" strokeWidth={2} />
        )}
      </button>
      {open && (
        <div className="px-6 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {fields.map(({ Icon, label, value, onClear }) => (
            <div
              key={label}
              className="flex items-start gap-2 px-2.5 py-1.5 rounded-[6px] bg-[var(--paper-2)] border border-[var(--line-soft)]"
            >
              <Icon
                className="h-3 w-3 mt-0.5 text-[var(--ink-3)] shrink-0"
                strokeWidth={2}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-[0.1em] text-[var(--ink-3)] font-medium">
                  {label}
                </p>
                <p className="text-[12px] text-[var(--ink)] leading-tight truncate">
                  {value}
                </p>
              </div>
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="focus-ring text-[10px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors shrink-0"
                  title={`Clear ${label}`}
                >
                  Clear
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
