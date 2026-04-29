'use client';

import { Banknote, ExternalLink } from 'lucide-react';
import { fmtRand } from '@/lib/sa-financial';

interface BondPreApprovalProps {
  price: number;
  netIncome: number;
}

/**
 * Affiliate / lead-gen handoff. Real partner integrations would replace these
 * URLs with affiliate-tagged links and post the user's profile via API.
 * For now: estimate qualification + link out.
 */
export default function BondPreApproval({
  price,
  netIncome,
}: BondPreApprovalProps) {
  // Quick affordability estimate: bond ≤ ~30% of net income.
  const monthlyCap = netIncome * 0.3;
  // What price would 30% of net cover at prime, 20yr, 10% deposit?
  // Reverse the standard amortisation: P = pmt * (1 - (1+i)^-n) / i
  const i = 0.1175 / 12;
  const n = 20 * 12;
  const principalCap = monthlyCap > 0
    ? (monthlyCap * (1 - Math.pow(1 + i, -n))) / i
    : 0;
  const priceCap = principalCap > 0 ? principalCap / 0.9 : 0;
  const qualifies = priceCap >= price * 0.85;

  return (
    <div className="rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)] overflow-hidden">
      <div className="px-3 py-2.5 flex items-start gap-2.5">
        <div className="h-7 w-7 shrink-0 rounded-[6px] bg-[var(--accent-color)] flex items-center justify-center">
          <Banknote className="h-3.5 w-3.5 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)] font-medium">
            Bond pre-approval
          </p>
          <p className="font-editorial text-[13px] text-[var(--ink)] leading-snug mt-0.5">
            {qualifies
              ? `Likely qualifies based on a ${fmtRand(netIncome)}/mo income.`
              : netIncome > 0
                ? `On your income, you'd typically qualify up to ~${fmtRand(priceCap, { compact: true })}.`
                : `Pre-approval gives you a clear bond ceiling and a stronger offer.`}
          </p>
          <div className="mt-2 flex items-center flex-wrap gap-1.5">
            <a
              href={`https://www.ooba.co.za/?utm_source=propalign&utm_medium=referral&utm_campaign=preapproval&price=${price}`}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1 h-7 px-2.5 rounded-[6px] bg-[var(--accent-color)] text-white text-[11px] font-medium hover:opacity-90 transition-opacity"
            >
              ooba Home Loans
              <ExternalLink className="h-2.5 w-2.5" strokeWidth={2} />
            </a>
            <a
              href="https://www.betterbond.co.za/?utm_source=propalign&utm_medium=referral&utm_campaign=preapproval"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1 h-7 px-2.5 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[11px] font-medium text-[var(--ink-2)] transition-colors"
            >
              BetterBond
              <ExternalLink className="h-2.5 w-2.5" strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
