'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import {
  UserProfile,
  LifeStage,
  Priority,
  SocialDensity,
  AestheticEra,
  SecurityTier,
} from '@/lib/scoring';
import { Loader2, ArrowUp, RotateCcw, PanelLeftClose } from 'lucide-react';
import BudgetWidget from './widgets/BudgetWidget';
import IncomeWidget from './widgets/IncomeWidget';
import LocationWidget from './widgets/LocationWidget';
import LifeStageWidget from './widgets/LifeStageWidget';
import TradeoffsWidget from './widgets/TradeoffsWidget';
import VibeProxiesWidget from './widgets/VibeProxiesWidget';
import BedroomsWidget from './widgets/BedroomsWidget';
import SchoolsWidget from './widgets/SchoolsWidget';
import type { School } from '@/lib/sa-schools';
import SaveProfileButton from './SaveProfileButton';
import ShareButton from './ShareButton';
import SuggestionChips from './SuggestionChips';
import ProfilePanel from './ProfilePanel';

interface ChatInterfaceProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onReset?: () => void;
  onToggleCollapse?: () => void;
}

/**
 * Pick a contextual loading label based on the most recent message's tool
 * invocations or the user's last text. Keeps the "thinking" state honest
 * about what's actually happening.
 */
function thinkingLabel(
  messages: Array<{ role: string; content: string; toolInvocations?: any[] }>,
  profile: UserProfile,
): string {
  const last = messages[messages.length - 1];
  if (!last) return 'Thinking';

  // If the last message has an in-flight searchProperties call, show the
  // actual suburbs being searched.
  if (last.toolInvocations && last.toolInvocations.length > 0) {
    const inflight = last.toolInvocations.find((t: any) => t.state === 'call');
    if (inflight) {
      switch (inflight.toolName) {
        case 'searchProperties': {
          const suburbs =
            (inflight.args?.areas as string[] | undefined) ??
            profile.suburbs ??
            [];
          if (suburbs.length === 1) {
            return `Searching listings in ${suburbs[0]}…`;
          }
          if (suburbs.length > 1) {
            return `Searching listings across ${suburbs.length} suburbs…`;
          }
          return 'Searching listings across South Africa…';
        }
        case 'askForIncome':
          return 'Setting up the income question…';
        case 'askForBudget':
          return 'Setting up the budget question…';
        case 'askForLocation':
          return 'Loading the location picker…';
        case 'askForSchools':
          return 'Loading the schools list…';
        case 'askForBedrooms':
          return 'Loading the bedrooms picker…';
        case 'askLifeStage':
          return 'Setting up life-stage options…';
        case 'askTopTwoTradeoffs':
          return 'Setting up the trade-off question…';
        case 'askVibeProxies':
          return 'Setting up the vibe questions…';
      }
    }
  }

  // Otherwise pick a label based on what's missing.
  if (!profile.lifeStage) return 'Reading your message…';
  if (profile.budget === 0) return 'Working out the next question…';
  if ((profile.suburbs?.length ?? 0) === 0)
    return 'Thinking about where you should look…';
  return 'Refining your matches…';
}

export default function ChatInterface({
  profile,
  setProfile,
  onReset,
  onToggleCollapse,
}: ChatInterfaceProps) {

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    addToolResult,
    append,
  } = useChat({
    api: '/api/chat',
    body: { profile },
    initialMessages: [
      {
        id: 'initial-greeting',
        role: 'assistant',
        content:
          "Hello. I help you find the right home in South Africa — rent or buy. Which would you like to do?",
      },
    ],
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }, [input]);

  const handleBudgetConfirm = (value: number, toolCallId: string) => {
    setProfile((prev) => ({ ...prev, budget: value }));
    addToolResult({ toolCallId, result: { budget: value, success: true } });
  };

  const handleIncomeConfirm = (value: number, toolCallId: string) => {
    setProfile((prev) => ({ ...prev, netIncome: value }));
    addToolResult({ toolCallId, result: { netIncome: value, success: true } });
  };

  const handleLocationConfirm = (
    selection: { provinces: string[]; suburbs: string[] },
    toolCallId: string,
  ) => {
    setProfile((prev) => ({
      ...prev,
      provinces: selection.provinces,
      suburbs: selection.suburbs,
    }));
    addToolResult({
      toolCallId,
      result: {
        provinces: selection.provinces,
        suburbs: selection.suburbs,
        success: true,
      },
    });
  };

  const handleLifeStageConfirm = (stage: LifeStage, toolCallId: string) => {
    setProfile((prev) => ({ ...prev, lifeStage: stage }));
    addToolResult({
      toolCallId,
      result: { lifeStage: stage, success: true },
    });
  };

  const handleTradeoffsConfirm = (picks: Priority[], toolCallId: string) => {
    setProfile((prev) => ({ ...prev, topPriorities: picks }));
    addToolResult({
      toolCallId,
      result: { topPriorities: picks, success: true },
    });
  };

  const handleVibesConfirm = (
    vibes: {
      socialDensityPref: SocialDensity;
      aestheticEra: AestheticEra;
      securityTier: SecurityTier;
    },
    toolCallId: string,
  ) => {
    setProfile((prev) => ({
      ...prev,
      socialDensityPref: vibes.socialDensityPref,
      aestheticEra: vibes.aestheticEra,
      securityTier: vibes.securityTier,
    }));
    addToolResult({
      toolCallId,
      result: { ...vibes, success: true },
    });
  };

  const handleBedroomsConfirm = (count: number, toolCallId: string) => {
    setProfile((prev) => ({ ...prev, minBedrooms: count }));
    addToolResult({
      toolCallId,
      result: { minBedrooms: count, success: true },
    });
  };

  const handleSchoolsConfirm = (schools: School[], toolCallId: string) => {
    const schoolLocations = schools.map((s) => ({
      lat: s.lat,
      lng: s.lng,
      name: s.name,
    }));
    setProfile((prev) => ({ ...prev, schoolLocations }));
    addToolResult({
      toolCallId,
      result: {
        schools: schools.map((s) => ({ id: s.id, name: s.name })),
        success: true,
      },
    });
  };

  const renderToolInvocations = (toolInvocations: any[], inBubble = false) => {
    return toolInvocations.map((toolInvocation) => {
      const { toolName, toolCallId, state } = toolInvocation;

      if (toolName === 'askForIncome' && state === 'call') {
        return (
          <div key={toolCallId} className={inBubble ? 'mt-3' : ''}>
            <IncomeWidget
              initialValue={(toolInvocation.args as any).initialValue}
              onConfirm={(val) => handleIncomeConfirm(val, toolCallId)}
            />
          </div>
        );
      }

      if (toolName === 'askForBudget' && state === 'call') {
        return (
          <div key={toolCallId} className={inBubble ? 'mt-3' : ''}>
            <BudgetWidget
              initialValue={(toolInvocation.args as any).initialValue}
              netIncome={profile.netIncome}
              onConfirm={(val) => handleBudgetConfirm(val, toolCallId)}
            />
          </div>
        );
      }

      if (toolName === 'askLifeStage' && state === 'call') {
        return (
          <div key={toolCallId} className={inBubble ? 'mt-3' : ''}>
            <LifeStageWidget
              onConfirm={(s) => handleLifeStageConfirm(s, toolCallId)}
            />
          </div>
        );
      }

      if (toolName === 'askTopTwoTradeoffs' && state === 'call') {
        return (
          <div key={toolCallId} className={inBubble ? 'mt-3' : ''}>
            <TradeoffsWidget
              showSchools={(toolInvocation.args as any).showSchools ?? false}
              onConfirm={(p) => handleTradeoffsConfirm(p, toolCallId)}
            />
          </div>
        );
      }

      if (toolName === 'askVibeProxies' && state === 'call') {
        return (
          <div key={toolCallId} className={inBubble ? 'mt-3' : ''}>
            <VibeProxiesWidget
              onConfirm={(v) => handleVibesConfirm(v, toolCallId)}
            />
          </div>
        );
      }

      if (toolName === 'askForLocation' && state === 'call') {
        return (
          <div key={toolCallId} className={inBubble ? 'mt-3' : ''}>
            <LocationWidget
              onConfirm={(sel) => handleLocationConfirm(sel, toolCallId)}
            />
          </div>
        );
      }

      if (toolName === 'askForBedrooms' && state === 'call') {
        return (
          <div key={toolCallId} className={inBubble ? 'mt-3' : ''}>
            <BedroomsWidget
              initialValue={profile.minBedrooms}
              onConfirm={(n) => handleBedroomsConfirm(n, toolCallId)}
            />
          </div>
        );
      }

      if (toolName === 'askForSchools' && state === 'call') {
        return (
          <div key={toolCallId} className={inBubble ? 'mt-3' : ''}>
            <SchoolsWidget
              onConfirm={(s) => handleSchoolsConfirm(s, toolCallId)}
            />
          </div>
        );
      }

      if (toolName === 'searchProperties' && state === 'result') {
        const result = toolInvocation.result;
        if (result?.error) {
          return (
            <div
              key={toolCallId}
              className="mt-2 rounded-[6px] border border-[var(--line)] bg-[var(--paper-3)] px-3 py-2 text-[12px] text-[var(--danger)]"
            >
              {result.error}
            </div>
          );
        }
        const results = Array.isArray(result) ? result : [];
        return (
          <p
            key={toolCallId}
            className={
              'text-[11px] text-[var(--ink-3)] italic ' +
              (inBubble ? 'mt-2' : '')
            }
          >
            Updated — {results.length} fresh match
            {results.length === 1 ? '' : 'es'} on the right.
          </p>
        );
      }

      return null;
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--paper)]">
      {/* Header — flat paper, single hairline */}
      <header className="shrink-0 border-b border-[var(--line)] px-6 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[7px] bg-[var(--accent-color)] flex items-center justify-center">
            <span className="font-editorial text-[15px] font-medium text-white leading-none">
              P
            </span>
          </div>
          <div className="leading-tight">
            <h2 className="font-editorial text-[18px] font-medium tracking-[-0.01em] text-[var(--ink)]">
              PropAlign
            </h2>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium">
              South African Concierge
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 font-data text-[12px]">
            <span className="text-[var(--ink-3)]">
              {profile.isBuying ? 'Buying' : 'Renting'}
            </span>
            {profile.budget > 0 && (
              <>
                <span className="text-[var(--ink-4)]">·</span>
                <span className="text-[var(--ink)] font-medium">
                  R{profile.budget.toLocaleString('en-ZA')}
                  {!profile.isBuying && (
                    <span className="text-[var(--ink-3)] font-normal">/mo</span>
                  )}
                </span>
              </>
            )}
          </div>
          <ShareButton profile={profile} />
          <SaveProfileButton profile={profile} />
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="focus-ring inline-flex items-center gap-1 h-8 px-2.5 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[11px] font-medium text-[var(--ink-2)] transition-colors"
              title="Reset profile and start a new conversation"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={2} />
              Start over
            </button>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="focus-ring hidden lg:inline-flex items-center justify-center h-8 w-8 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
              title="Collapse chat (focus on listings)"
              aria-label="Collapse chat"
            >
              <PanelLeftClose className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </header>

      <ProfilePanel profile={profile} setProfile={setProfile} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
        <div className="space-y-4">
          {messages.map((m, idx) => {
            const hasText = m.content && m.content.trim().length > 0;
            const hasTools = m.toolInvocations && m.toolInvocations.length > 0;
            // Show suggestion chips below the LAST assistant message that has
            // text and no in-flight tool widgets, and only when we're not
            // mid-stream. Skips the initial greeting (it has its own buttons).
            const isLastAssistantText =
              !isLoading &&
              m.role === 'assistant' &&
              hasText &&
              !hasTools &&
              m.id !== 'initial-greeting' &&
              idx === messages.length - 1;

            if (m.role === 'assistant' && !hasText && !hasTools) return null;

            if (m.role === 'assistant' && !hasText && hasTools) {
              return (
                <div key={m.id} className="flex justify-start">
                  <div className="max-w-[92%] w-full">
                    {renderToolInvocations(m.toolInvocations!, false)}
                  </div>
                </div>
              );
            }

            const isUser = m.role === 'user';

            return (
              <div
                key={m.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2 items-start`}
              >
                {!isUser && (
                  <div className="h-6 w-6 mt-1 shrink-0 rounded-full bg-[var(--accent-color)] flex items-center justify-center">
                    <span className="font-data text-[10px] font-semibold text-white">
                      P
                    </span>
                  </div>
                )}

                <div
                  className={
                    isUser
                      ? 'max-w-[80%] rounded-[10px] rounded-br-[4px] bg-[var(--accent-color)] text-white px-4 py-2.5 text-[14px] leading-relaxed'
                      : 'max-w-[82%] rounded-[10px] rounded-bl-[4px] border border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink)] px-4 py-2.5 text-[14px] leading-relaxed'
                  }
                >
                  {hasText && <p className="whitespace-pre-wrap">{m.content}</p>}

                  {m.id === 'initial-greeting' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          setProfile((prev) => ({ ...prev, isBuying: false }));
                          append({ role: 'user', content: 'I want to Rent' });
                        }}
                        className="focus-ring h-9 px-4 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[12px] font-medium text-[var(--ink)] transition-colors"
                      >
                        Rent
                      </button>
                      <button
                        onClick={() => {
                          setProfile((prev) => ({ ...prev, isBuying: true }));
                          append({ role: 'user', content: 'I want to Buy' });
                        }}
                        className="focus-ring h-9 px-4 rounded-[6px] bg-[var(--accent-color)] hover:opacity-90 text-[12px] font-medium text-white transition-opacity"
                      >
                        Buy
                      </button>
                    </div>
                  )}

                  {hasTools && renderToolInvocations(m.toolInvocations!, true)}

                  {isLastAssistantText && (
                    <SuggestionChips
                      profile={profile}
                      onPick={(text) =>
                        append({ role: 'user', content: text })
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start gap-2 items-start">
              <div className="h-6 w-6 mt-1 shrink-0 rounded-full bg-[var(--accent-color)] flex items-center justify-center">
                <span className="font-data text-[10px] font-semibold text-white">
                  P
                </span>
              </div>
              <div className="border border-[var(--line)] bg-[var(--paper-2)] rounded-[10px] rounded-bl-[4px] px-4 py-2.5 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--ink-3)]" />
                <span className="text-[12px] text-[var(--ink-3)]">
                  {thinkingLabel(messages, profile)}
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-[var(--line)] px-6 py-4"
      >
        <div className="flex items-end gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--paper-2)] focus-within:border-[var(--line-strong)] focus-within:shadow-[0_0_0_3px_rgba(30,58,95,0.10)] transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder="Type a message…"
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-transparent px-4 py-3 text-[14px] text-[var(--ink)] placeholder:text-[var(--ink-4)] focus:outline-none disabled:opacity-50 max-h-32"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="m-1.5 h-8 w-8 shrink-0 rounded-[6px] bg-[var(--accent-color)] flex items-center justify-center text-white transition-opacity hover:opacity-90 disabled:bg-[var(--ink-4)] disabled:cursor-not-allowed"
            aria-label="Send"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
