'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const ChatInterface = dynamic(
  () =>
    import('@/components/chat/ChatInterface').then((m) => ({
      default: m.ChatInterface,
    })),
  { ssr: false, loading: () => <ChatSkeleton /> }
);

const LandingPage = dynamic(
  () =>
    import('@/components/landing/LandingPage').then((m) => ({
      default: m.LandingPage,
    })),
  { ssr: false, loading: () => <LandingSkeleton /> }
);

function ChatSkeleton() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-surface-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-king-500" />
        <p className="text-sm text-zinc-500">جاري التحميل...</p>
      </div>
    </div>
  );
}

function LandingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-700 border-t-king-500" />
        <p className="text-sm text-zinc-500">جاري تحميل المنصة...</p>
      </div>
    </div>
  );
}

function HomePageInner() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('guest') === 'true';

  if (status === 'loading') {
    return <ChatSkeleton />;
  }

  const isAuthenticated = status === 'authenticated';

  // Show ChatInterface if:
  // 1. User is authenticated, OR
  // 2. User clicked "ابدأ المحادثة مجاناً" (guest=true)
  if (isAuthenticated || isGuestMode) {
    return <ChatInterface isGuest={!isAuthenticated} />;
  }

  // Show Landing Page for non-authenticated visitors
  return <LandingPage />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <HomePageInner />
    </Suspense>
  );
}
