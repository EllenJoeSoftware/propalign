'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { UserProfile } from '@/lib/scoring';
import PropertiesPane from './PropertiesPane';

const ChatInterface = dynamic(() => import('@/components/ChatInterface'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-7 w-7 animate-spin rounded-full border-[2.5px] border-[var(--accent-color)] border-t-transparent" />
        <p className="text-[12px] text-[var(--ink-3)]">Loading PropAlign…</p>
      </div>
    </div>
  ),
});

const INITIAL_PROFILE: UserProfile = {
  netIncome: 0,
  budget: 0,
  isBuying: false,
  schoolLocations: [],
  transportMode: 'car',
  minBedrooms: 1,
  lifestylePreferences: [],
};

export default function ChatInterfaceWrapper() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  // Bumping this key forces ChatInterface to fully remount, which clears
  // the underlying useChat() state — messages, input, tool invocations.
  const [sessionKey, setSessionKey] = useState(0);

  const handleReset = useCallback(() => {
    setProfile(INITIAL_PROFILE);
    setSessionKey((k) => k + 1);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full">
      <div className="w-full lg:w-[460px] xl:w-[500px] lg:shrink-0 lg:border-r border-[var(--line)] h-[60vh] lg:h-full">
        <ChatInterface
          key={sessionKey}
          profile={profile}
          setProfile={setProfile}
          onReset={handleReset}
        />
      </div>

      <div className="flex-1 border-t lg:border-t-0 border-[var(--line)] h-[40vh] lg:h-full">
        <PropertiesPane profile={profile} />
      </div>
    </div>
  );
}
