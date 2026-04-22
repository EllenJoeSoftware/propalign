import ChatInterfaceWrapper from '@/components/ChatInterfaceWrapper';

export default function Home() {
  return (
    <main className="h-screen flex flex-col bg-muted/30 overflow-hidden">
      <header className="text-center py-6 px-4 shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Find Your <span className="text-primary">Perfect Home</span> in SA
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          PropAlign AI uses your lifestyle and budget to find the best match.
        </p>
      </header>

      <div className="flex-1 overflow-hidden px-4 pb-4">
        <ChatInterfaceWrapper />
      </div>
    </main>
  );
}
