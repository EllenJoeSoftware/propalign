'use client';

import dynamic from 'next/dynamic';

const ChatInterface = dynamic(() => import('@/components/ChatInterface'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full max-w-2xl mx-auto border rounded-lg bg-muted/10 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading PropAlign AI...</p>
      </div>
    </div>
  ),
});

export default function ChatInterfaceWrapper() {
  return <ChatInterface />;
}
