'use client';

import { TrendingDown, MapPin, BedDouble, Sparkles } from 'lucide-react';
import type { UserProfile } from '@/lib/scoring';

interface SuggestionChipsProps {
  profile: UserProfile;
  onPick: (text: string) => void;
}

interface Suggestion {
  text: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

/**
 * Choose 2-3 suggestions that make sense given the current profile state.
 * Don't suggest things that don't exist yet (no "find cheaper" when no budget).
 */
function buildSuggestions(profile: UserProfile): Suggestion[] {
  const out: Suggestion[] = [];

  if (profile.budget > 0) {
    out.push({ text: 'Show me cheaper options', Icon: TrendingDown });
  }
  if (profile.minBedrooms < 4) {
    out.push({
      text: `Show me ${profile.minBedrooms + 1}+ bedroom homes`,
      Icon: BedDouble,
    });
  }
  if (profile.suburbs && profile.suburbs.length > 0) {
    out.push({ text: 'Try a different suburb', Icon: MapPin });
  }
  if (!profile.lifeStage) {
    out.push({ text: "I'm not sure where to start", Icon: Sparkles });
  }
  if (profile.topPriorities && profile.topPriorities.length > 0) {
    out.push({ text: 'What else should matter to me?', Icon: Sparkles });
  }

  return out.slice(0, 3);
}

export default function SuggestionChips({
  profile,
  onPick,
}: SuggestionChipsProps) {
  const suggestions = buildSuggestions(profile);
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-3 flex items-center flex-wrap gap-1.5">
      {suggestions.map(({ text, Icon }) => (
        <button
          key={text}
          type="button"
          onClick={() => onPick(text)}
          className="focus-ring inline-flex items-center gap-1 h-7 px-2.5 rounded-full border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] hover:bg-[var(--paper-3)] text-[10px] font-medium text-[var(--ink-2)] transition-colors"
        >
          <Icon className="h-2.5 w-2.5" strokeWidth={2} />
          {text}
        </button>
      ))}
    </div>
  );
}
