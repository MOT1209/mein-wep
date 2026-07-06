'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import type { Message } from '@/lib/useKing2Chat';

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
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('guest') === 'true';
  const openConversationId = searchParams.get('c');

  const [loadedMessages, setLoadedMessages] = useState<Message[] | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);

  // Opened from chat history (?c=<id>) — fetch its messages once before
  // rendering ChatInterface, so it mounts with the full history already in
  // place instead of an empty chat that then jumps to populated.
  useEffect(() => {
    if (!openConversationId || status !== 'authenticated') return;
    let cancelled = false;
    setLoadingConversation(true);
    fetch(`/king2/api/chat?conversationId=${encodeURIComponent(openConversationId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((conversation) => {
        if (cancelled || !conversation) return;
        const userId = (session?.user as any)?.id;
        const mapped: Message[] = (conversation.messages || [])
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((m: any) => ({
            id: m.id,
            role: m.sender_id && m.sender_id === userId ? 'user' : (m.sender_id ? 'user' : 'assistant'),
            content: m.content,
            createdAt: new Date(m.created_at),
          }));
        setLoadedMessages(mapped);
      })
      .catch(() => setLoadedMessages([]))
      .finally(() => {
        if (!cancelled) setLoadingConversation(false);
      });
    return () => {
      cancelled = true;
    };
  }, [openConversationId, status, session]);

  if (status === 'loading' || loadingConversation) {
    return <ChatSkeleton />;
  }

  const isAuthenticated = status === 'authenticated';

  // Show ChatInterface if:
  // 1. User is authenticated, OR
  // 2. User clicked "ابدأ المحادثة مجاناً" (guest=true)
  if (isAuthenticated || isGuestMode) {
    return (
      <ChatInterface
        isGuest={!isAuthenticated}
        conversationId={openConversationId || undefined}
        initialMessages={loadedMessages || undefined}
      />
    );
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
