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

export default function Home() {
  return (
    <main className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Find Your <span className="text-primary">Perfect Home</span> in SA
          </h1>
          <p className="text-xl text-muted-foreground">
            PropAlign AI uses your lifestyle and budget to find the best match.
          </p>
        </header>

        <section className="mt-12">
          <ChatInterface />
        </section>
        
        <footer className="text-center text-sm text-muted-foreground pt-12">
          &copy; 2026 PropAlign AI. Powered by Next.js & Vercel AI SDK.
        </footer>
      </div>
    </main>
  );
}
