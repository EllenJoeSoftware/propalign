import ChatInterfaceWrapper from '@/components/ChatInterfaceWrapper';

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
          <ChatInterfaceWrapper />
        </section>

        <footer className="text-center text-sm text-muted-foreground pt-12">
          &copy; 2026 PropAlign AI. Powered by Next.js & Vercel AI SDK.
        </footer>
      </div>
    </main>
  );
}
