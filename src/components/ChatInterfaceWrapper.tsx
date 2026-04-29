'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { PanelLeftOpen } from 'lucide-react';
import type { UserProfile } from '@/lib/scoring';
import PropertiesPane from './PropertiesPane';
import { readProfileFromLocation } from '@/lib/share-state';

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

const COLLAPSE_KEY = 'propalign:chat-collapsed';

export default function ChatInterfaceWrapper() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [sessionKey, setSessionKey] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  // Restore profile from share URL + collapse state on first mount.
  useEffect(() => {
    const shared = readProfileFromLocation();
    if (shared) setProfile({ ...INITIAL_PROFILE, ...shared });
    try {
      if (localStorage.getItem(COLLAPSE_KEY) === '1') setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setProfile(INITIAL_PROFILE);
    setSessionKey((k) => k + 1);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('s');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full relative">
      {/* Chat column */}
      <div
        className={
          'transition-[width,opacity,transform] duration-300 lg:shrink-0 lg:border-r border-[var(--line)] ' +
          (collapsed
            ? 'lg:w-0 lg:opacity-0 lg:-translate-x-2 lg:overflow-hidden hidden lg:block'
            : 'w-full lg:w-[460px] xl:w-[500px] h-[60vh] lg:h-full')
        }
        aria-hidden={collapsed}
      >
        {!collapsed && (
          <ChatInterface
            key={sessionKey}
            profile={profile}
            setProfile={setProfile}
            onReset={handleReset}
            onToggleCollapse={toggleCollapse}
          />
        )}
      </div>

      {/* Floating "Show chat" handle when collapsed (desktop only) */}
      {collapsed && (
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden lg:inline-flex focus-ring fixed top-3 left-3 z-40 items-center gap-1.5 h-9 px-3 rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[11px] font-medium text-[var(--ink-2)] shadow-soft"
          title="Show chat"
        >
          <PanelLeftOpen className="h-3.5 w-3.5" strokeWidth={2} />
          Show chat
        </button>
      )}

      {/* Properties column */}
      <div
        className={
          'flex-1 border-t lg:border-t-0 border-[var(--line)] ' +
          (collapsed
            ? 'h-screen lg:h-full'
            : 'h-[40vh] lg:h-full')
        }
      >
        <PropertiesPane profile={profile} setProfile={setProfile} />
      </div>
    </div>
  );
}
