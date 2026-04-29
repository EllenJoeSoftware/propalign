'use client';

import { Shield, Truck, Wifi, ExternalLink } from 'lucide-react';

interface PartnerSuggestionsProps {
  isForRent: boolean;
}

interface Partner {
  name: string;
  blurb: string;
  url: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const PARTNERS: Partner[] = [
  {
    name: 'Naked Insurance',
    blurb: 'Building & contents in 90 seconds',
    url: 'https://www.naked.insurance/?utm_source=propalign&utm_medium=referral',
    Icon: Shield,
  },
  {
    name: 'King Price',
    blurb: 'Decreasing-premium home insurance',
    url: 'https://www.kingprice.co.za/?utm_source=propalign&utm_medium=referral',
    Icon: Shield,
  },
  {
    name: 'Stuttafords Removals',
    blurb: 'Free quote on local moves',
    url: 'https://stuttafords.co.za/get-a-quote/?utm_source=propalign&utm_medium=referral',
    Icon: Truck,
  },
  {
    name: 'WeFibre',
    blurb: 'Compare fibre + LTE in your suburb',
    url: 'https://www.wefibre.co.za/?utm_source=propalign&utm_medium=referral',
    Icon: Wifi,
  },
];

export default function PartnerSuggestions({ isForRent }: PartnerSuggestionsProps) {
  // Owners need building insurance + removals; renters mostly need contents +
  // removals + fibre. We surface a focused 3 each.
  const list = isForRent
    ? PARTNERS.filter((p) => p.name !== 'King Price')
    : PARTNERS.filter((p) => p.name !== 'WeFibre');

  return (
    <div className="rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)] p-3">
      <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)] font-medium mb-2">
        Move-in essentials
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {list.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] p-2.5 flex items-start gap-2 transition-colors"
          >
            <p.Icon
              className="h-3 w-3 mt-0.5 text-[var(--ink-2)] shrink-0"
              strokeWidth={2}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[var(--ink)] inline-flex items-center gap-1">
                {p.name}
                <ExternalLink
                  className="h-2 w-2 text-[var(--ink-3)]"
                  strokeWidth={2}
                />
              </p>
              <p className="text-[10px] text-[var(--ink-3)] leading-snug mt-0.5">
                {p.blurb}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
