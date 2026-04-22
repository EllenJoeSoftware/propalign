'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  const { messages, input, handleInputChange, handleSubmit, isLoading, addToolResult, append } = useChat({
    api: '/api/chat',
    body: { data: { profile } },
    initialMessages: [
      {
        id: 'initial-greeting',
        role: 'assistant',
        content: 'Hi! I\'m PropAlign AI. I\'ll help you find the perfect home in South Africa. Are you looking to rent or buy?',
      },
    ],
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === 'updateProfile') {
        const args = toolCall.args as Partial<UserProfile>;
        setProfile((prev) => ({ ...prev, ...args }));
      }
    },
  });

  const handleBudgetConfirm = async (value: number, toolCallId: string) => {
    setProfile(prev => ({ ...prev, budget: value }));
    addToolResult({
      toolCallId,
      result: { budget: value, success: true },
    });
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-lg bg-background shadow-lg">
      <div className="p-4 border-b bg-muted/50 rounded-t-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">PropAlign AI</h2>
          <p className="text-xs text-muted-foreground">South Africa&apos;s Smart Real Estate Assistant</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium">Budget: R{profile.budget.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{profile.isBuying ? 'Buying' : 'Renting'}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted border shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>

                {m.id === 'initial-greeting' && (
                  <div className="mt-3 flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-7 text-[10px]"
                      onClick={() => append({ role: 'user', content: 'I want to Rent' })}
                    >
                      Rent
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-7 text-[10px]"
                      onClick={() => append({ role: 'user', content: 'I want to Buy' })}
                    >
                      Buy
                    </Button>
                  </div>
                )}
                
                {m.toolInvocations?.map((toolInvocation) => {
                  const { toolName, toolCallId, state } = toolInvocation;

                  if (toolName === 'askForBudget' && state === 'call') {
                    return (
                      <BudgetWidget 
                        key={toolCallId}
                        initialValue={(toolInvocation.args as any).initialValue}
                        onConfirm={(val) => handleBudgetConfirm(val, toolCallId)}
                      />
                    );
                  }

                  if (toolName === 'searchProperties' && state === 'result') {
                    const results = toolInvocation.result as PropertyMatch[];
                    return (
                      <div key={toolCallId} className="mt-4 grid grid-cols-1 gap-3">
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
                })}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted border rounded-lg p-3 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">PropAlign is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t flex space-x-2">
        <Input
          value={input}
          placeholder="Type your message..."
          onChange={handleInputChange}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
