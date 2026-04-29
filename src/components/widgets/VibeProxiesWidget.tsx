'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type {
  SocialDensity,
  AestheticEra,
  SecurityTier,
} from '@/lib/scoring';

interface VibeProxiesWidgetProps {
  onConfirm: (vibes: {
    socialDensityPref: SocialDensity;
    aestheticEra: AestheticEra;
    securityTier: SecurityTier;
  }) => void;
}

type Pair<T extends string> = {
  id: 'social' | 'era' | 'security';
  prompt: string;
  options: { value: T; label: string; sub: string }[];
};

const PAIRS: [Pair<SocialDensity>, Pair<AestheticEra>, Pair<SecurityTier>] = [
  {
    id: 'social',
    prompt: 'Which sounds more like you?',
    options: [
      {
        value: 'quiet_leafy',
        label: 'Quiet by 9pm',
        sub: 'Leafy streets, low traffic',
      },
      {
        value: 'vibrant_urban',
        label: 'Streets buzzing till late',
        sub: 'Cafés, shops, energy',
      },
    ],
  },
  {
    id: 'era',
    prompt: 'Style preference?',
    options: [
      {
        value: 'character',
        label: 'Original character',
        sub: 'Wooden floors, history',
      },
      {
        value: 'new_build',
        label: 'Brand-new finishes',
        sub: 'Modern, low-maintenance',
      },
    ],
  },
  {
    id: 'security',
    prompt: 'Where do you feel most at home?',
    options: [
      { value: 'standalone', label: 'Standalone home', sub: 'Privacy, walls' },
      {
        value: 'gated_estate',
        label: 'Gated estate',
        sub: 'Communal security',
      },
      { value: 'complex', label: 'Apartment / complex', sub: 'Lock-and-go' },
    ],
  },
];

export default function VibeProxiesWidget({ onConfirm }: VibeProxiesWidgetProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [social, setSocial] = useState<SocialDensity | null>(null);
  const [era, setEra] = useState<AestheticEra | null>(null);
  const [security, setSecurity] = useState<SecurityTier | null>(null);

  const setAndAdvance = (v: string) => {
    if (step === 0) {
      setSocial(v as SocialDensity);
      setStep(1);
    } else if (step === 1) {
      setEra(v as AestheticEra);
      setStep(2);
    } else if (step === 2) {
      const finalSecurity = v as SecurityTier;
      setSecurity(finalSecurity);
      onConfirm({
        socialDensityPref: social!,
        aestheticEra: era!,
        securityTier: finalSecurity,
      });
    }
  };

  const current = PAIRS[step];
  const selectedSoFar =
    step === 0 ? social : step === 1 ? era : step === 2 ? security : null;

  return (
    <div className="w-[22rem] max-w-full rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--line-soft)] flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
            Vibe · {step + 1} of 3
          </p>
          <p className="mt-0.5 text-[13px] font-medium text-[var(--ink)]">
            {current.prompt}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={
                'h-[2px] w-6 rounded-full transition-colors ' +
                (step >= i ? 'bg-[var(--accent-color)]' : 'bg-[var(--line)]')
              }
            />
          ))}
        </div>
      </div>

      <motion.div
        key={current.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="p-3 space-y-2"
      >
        {current.options.map((opt) => {
          const active = selectedSoFar === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setAndAdvance(opt.value)}
              className={
                'focus-ring w-full text-left p-3 rounded-[8px] border flex items-center justify-between gap-3 transition-colors ' +
                (active
                  ? 'bg-[var(--accent-tint)] border-[var(--accent-color)]'
                  : 'bg-[var(--paper-2)] border-[var(--line)] hover:border-[var(--line-strong)]')
              }
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--ink)] leading-tight">
                  {opt.label}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--ink-3)] leading-tight">
                  {opt.sub}
                </p>
              </div>
              {active ? (
                <Check
                  className="h-4 w-4 text-[var(--accent-color)] shrink-0"
                  strokeWidth={2.5}
                />
              ) : (
                <span className="h-4 w-4 shrink-0" />
              )}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
