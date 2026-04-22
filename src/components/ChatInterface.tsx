'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserProfile, PropertyMatch } from '@/lib/scoring';
import { Loader2, Send } from 'lucide-react';
import BudgetWidget from './widgets/BudgetWidget';

export default function ChatInterface() {
  const [profile, setProfile] = useState<UserProfile>({
    netIncome: 0,
    budget: 0,
    isBuying: false,
    schoolLocations: [],
    transportMode: 'car',
    minBedrooms: 1,
    lifestylePreferences: [],
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, addToolResult, append } = useChat({
    api: '/api/chat',
    body: { profile },
    initialMessages: [
      {
        id: 'initial-greeting',
        role: 'assistant',
        content: "Hi! I'm PropAlign AI. I'll help you find the perfect home in South Africa. Are you looking to rent or buy?",
      },
    ],
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea as user types
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [input]);

  const handleBudgetConfirm = (value: number, toolCallId: string) => {
    setProfile(prev => ({ ...prev, budget: value }));
    addToolResult({ toolCallId, result: { budget: value, success: true } });
  };

  const renderToolInvocations = (toolInvocations: any[], inBubble = false) => {
    return toolInvocations.map((toolInvocation) => {
      const { toolName, toolCallId, state } = toolInvocation;

      if (toolName === 'askForBudget' && state === 'call') {
        return (
          <div key={toolCallId} className={inBubble ? 'mt-3' : ''}>
            <BudgetWidget
              initialValue={(toolInvocation.args as any).initialValue}
              onConfirm={(val) => handleBudgetConfirm(val, toolCallId)}
            />
          </div>
        );
      }

      if (toolName === 'searchProperties' && state === 'result') {
        const results = toolInvocation.result as PropertyMatch[];
        if (!Array.isArray(results) || !results.length) return null;
        return (
          <div key={toolCallId} className={`grid grid-cols-1 gap-3 ${inBubble ? 'mt-4' : ''}`}>
            {results.map((prop) => (
              <Card key={prop.id} className="p-3 border-l-4 border-l-green-500">
                <h3 className="font-bold text-sm">{prop.title}</h3>
                <p className="text-xs text-muted-foreground">R{prop.price.toLocaleString()}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded">
                    {prop.score}% Match
                  </span>
                  <Button variant="outline" size="sm" className="h-7 text-xs">View Details</Button>
                </div>
                <p className="mt-2 text-[10px] leading-tight italic">{prop.explanation}</p>
              </Card>
            ))}
          </div>
        );
      }

      return null;
    });
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-2xl mx-auto border-x bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-muted/50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-semibold">PropAlign AI</h2>
          <p className="text-xs text-muted-foreground">South Africa&apos;s Smart Real Estate Assistant</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium">Budget: R{profile.budget.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{profile.isBuying ? 'Buying' : 'Renting'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((m) => {
            const hasText = m.content && m.content.trim().length > 0;
            const hasTools = m.toolInvocations && m.toolInvocations.length > 0;

            if (m.role === 'assistant' && !hasText && !hasTools) return null;

            if (m.role === 'assistant' && !hasText && hasTools) {
              return (
                <div key={m.id} className="flex justify-start">
                  <div className="max-w-[85%]">
                    {renderToolInvocations(m.toolInvocations!, false)}
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted border shadow-sm rounded-bl-sm'
                  }`}
                >
                  {hasText && (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  )}

                  {m.id === 'initial-greeting' && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => append({ role: 'user', content: 'I want to Rent' })}
                      >
                        Rent
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => append({ role: 'user', content: 'I want to Buy' })}
                      >
                        Buy
                      </Button>
                    </div>
                  )}

                  {hasTools && renderToolInvocations(m.toolInvocations!, true)}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">PropAlign is thinking…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input — textarea + send button stacked */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex flex-col gap-2 shrink-0 bg-background">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message…"
          disabled={isLoading}
          rows={3}
          className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 overflow-hidden"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-full"
        >
          {isLoading
            ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
            : <Send className="h-4 w-4 mr-2" />}
          Send
        </Button>
      </form>
    </div>
  );
}
