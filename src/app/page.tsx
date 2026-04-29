import ChatInterfaceWrapper from '@/components/ChatInterfaceWrapper';
import { CompareProvider } from '@/components/CompareProvider';
import CompareTray from '@/components/CompareTray';

export default function Home() {
  return (
    <CompareProvider>
      <main className="h-screen w-full bg-[var(--paper)] overflow-hidden">
        <ChatInterfaceWrapper />
        <CompareTray />
      </main>
    </CompareProvider>
  );
}
