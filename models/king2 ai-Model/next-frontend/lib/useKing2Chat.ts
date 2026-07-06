'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ── Public types ──────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

export type StreamingStatus =
  | 'idle'
  | 'loading'
  | 'streaming'
  | 'thinking'
  | 'error';

interface UseKing2ChatOptions {
  /** The API endpoint URL */
  api: string;
  /** Extra body fields merged into every request */
  body?: Record<string, unknown>;
  /** Called when the assistant message is fully received */
  onFinish?: (message: Message) => void;
  /** Called when a non-recoverable error occurs */
  onError?: (error: string) => void;
  /** Credentials mode for fetch */
  credentials?: RequestCredentials;
  /** Extra HTTP headers */
  headers?: Record<string, string>;
  /** Pre-loaded messages when resuming a saved conversation */
  initialMessages?: Message[];
  /** The conversation these initialMessages belong to; skips guest-id restore */
  initialConversationId?: string | null;
}

// ── Internal helpers ──────────────────────────────────────

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  baseDelayMs: 1000,
  maxDelayMs: 5000,
};

const GUEST_MESSAGE_LIMIT = 10;
const GUEST_STORAGE_KEY = 'king2_guest_messages';
const GUEST_CONVERSATION_KEY = 'king2_guest_conversation_id';

function getGuestMessages(): Message[] {
  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveGuestMessages(messages: Message[]) {
  try {
    localStorage.setItem(
      GUEST_STORAGE_KEY,
      JSON.stringify(messages.slice(-100)),
    );
  } catch {
    // quota exceeded – silently ignore
  }
}

function getStoredConversationId(): string | null {
  try {
    return localStorage.getItem(GUEST_CONVERSATION_KEY);
  } catch {
    return null;
  }
}

function setStoredConversationId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(GUEST_CONVERSATION_KEY, id);
    } else {
      localStorage.removeItem(GUEST_CONVERSATION_KEY);
    }
  } catch {
    /* ignore */
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Hook ──────────────────────────────────────────────────

export function useKing2Chat({
  api,
  body: extraBody,
  onFinish,
  onError,
  credentials,
  headers: extraHeaders,
  initialMessages,
  initialConversationId,
}: UseKing2ChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingStatus, setStreamingStatus] =
    useState<StreamingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId ?? null,
  );
  const [guestMessageCount, setGuestMessageCount] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const isGuestRef = useRef(true);
  const isMountedRef = useRef(true);

  // Keep ref in sync with state
  messagesRef.current = messages;

  // ── Restore guest data on mount ───────────────────────
  useEffect(() => {
    // Only restore guest messages on explicit request via setMessages
    // Auto-loading from localStorage is handled by ChatInterface component.
    // Skip when a specific saved conversation was explicitly requested
    // (e.g. opened from chat history) — that id must win instead.
    if (!initialConversationId) {
      const storedConvId = getStoredConversationId();
      if (storedConvId) {
        setConversationId(storedConvId);
      }
    }
    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist messages to localStorage on every change (guest mode)
  useEffect(() => {
    if (isGuestRef.current && messages.length > 0) {
      saveGuestMessages(messages);
    }
  }, [messages]);

  // ── core: append a message & stream the reply ─────────
  const append = useCallback(
    async (message: Omit<Message, 'id' | 'createdAt'>) => {
      const userMsg: Message = {
        id: crypto.randomUUID(),
        ...message,
        createdAt: new Date(),
      };

      const currentMessages = messagesRef.current;
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setStreamingStatus('loading');
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      let attempt = 0;

      while (attempt <= RETRY_CONFIG.maxRetries) {
        try {
          const res = await fetch(api, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...extraHeaders,
            },
            body: JSON.stringify({
              messages: [...currentMessages, userMsg],
              ...extraBody,
              conversationId: conversationId ?? undefined,
            }),
            signal: controller.signal,
            credentials,
          });

          // ── HTTP-level error ─────────────────────────
          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            const errMsg =
              errBody?.error?.message ||
              errBody?.error ||
              `HTTP ${res.status}`;

            if (res.status === 429) {
              // Guest limit – not retryable
              const remaining = errBody?.error?.remaining ?? 0;
              setError(errMsg);
              setStreamingStatus('error');
              setIsLoading(false);
              abortRef.current = null;
              setGuestMessageCount(
                GUEST_MESSAGE_LIMIT - remaining,
              );
              onError?.(errMsg);
              return;
            }

            throw new Error(errMsg);
          }

          // ── Extract conversation ID from header ──────
          const convId = res.headers.get('X-Conversation-Id');
          if (convId) {
            setConversationId(convId);
            setStoredConversationId(convId);
            isGuestRef.current = false;
          }

          // ── Determine stream type ────────────────────
          const contentType = res.headers.get('Content-Type') || '';
          const isSSE = contentType.includes('text/event-stream');

          const reader = res.body?.getReader();
          if (!reader) throw new Error('لا يوجد تيار استجابة');

          const decoder = new TextDecoder();
          let assistantContent = '';
          const assistantId = crypto.randomUUID();

          // Add placeholder message so the UI renders immediately
          setMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: 'assistant',
              content: '',
              createdAt: new Date(),
            },
          ]);

          setStreamingStatus('streaming');
          attempt = 0; // reset retry counter on first success

          // ── Stream read loop ─────────────────────────
          let buffer = '';
          /* eslint-disable no-constant-condition */
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });

            if (isSSE) {
              // SSE parsing – split on '\n', keep partial line in buffer
              buffer += text;
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;

                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);

                  if (parsed.type === 'error') {
                    setError(parsed.content);
                    setStreamingStatus('error');
                    onError?.(parsed.content);
                    continue;
                  }

                  // Treat 'text' and 'step_update' as content
                  if (
                    parsed.type === 'text' ||
                    parsed.type === 'step_update'
                  ) {
                    assistantContent += parsed.content || '';
                  } else if (parsed.type === 'step') {
                    // step metadata – update thinking status
                    setStreamingStatus('thinking');
                    continue;
                  }
                } catch {
                  // Not JSON – fall back to raw text
                  assistantContent += data;
                }
              }
            } else {
              // Raw text streaming (plain/text)
              assistantContent += text;
            }

            // Throttle React re-renders (still update on every chunk
            // for smooth UX but batch via requestAnimationFrame later)
            if (!isMountedRef.current) break;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: assistantContent }
                  : m,
              ),
            );
          }

          // ── Final update ─────────────────────────────
          const finalMessage: Message = {
            id: assistantId,
            role: 'assistant',
            content: assistantContent,
            createdAt: new Date(),
          };

          if (isMountedRef.current) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? finalMessage : m)),
            );
            setIsLoading(false);
            setStreamingStatus('idle');
            abortRef.current = null;
            setGuestMessageCount((prev) => prev + 1);
            onFinish?.(finalMessage);
          }

          return; // success
        } catch (err: any) {
          if (err.name === 'AbortError') {
            setIsLoading(false);
            setStreamingStatus('idle');
            abortRef.current = null;
            return;
          }

          attempt++;

          if (attempt <= RETRY_CONFIG.maxRetries) {
            // Exponential backoff
            const delay = Math.min(
              RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt - 1),
              RETRY_CONFIG.maxDelayMs,
            );
            setStreamingStatus('thinking');
            await sleep(delay);
          } else {
            // All retries exhausted
            const errMsg = err.message || 'حدث خطأ في الاتصال';
            if (isMountedRef.current) {
              setError(errMsg);
              setIsLoading(false);
              setStreamingStatus('error');
              abortRef.current = null;
              onError?.(errMsg);
            }
          }
        }
      }
    },
    [api, extraBody, extraHeaders, conversationId, credentials, onFinish, onError],
  );

  // ── stop / abort ────────────────────────────────────────
  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setStreamingStatus('idle');
  }, []);

  // ── reload: resend the last user message ────────────────
  const reload = useCallback(() => {
    const msgs = messagesRef.current;
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      append({ role: 'user', content: lastUser.content });
    }
  }, [append]);

  // ── clear local guest data ──────────────────────────────
  const clearGuestData = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      localStorage.removeItem(GUEST_CONVERSATION_KEY);
    } catch {
      /* ignore */
    }
    setMessages([]);
    setConversationId(null);
    setGuestMessageCount(0);
    setError(null);
    setStreamingStatus('idle');
    setIsLoading(false);
  }, []);

  return {
    messages,
    setMessages,
    isLoading,
    streamingStatus,
    error,
    conversationId,
    guestMessageCount,
    guestMessageLimit: GUEST_MESSAGE_LIMIT,
    append,
    stop,
    reload,
    clearGuestData,
  };
}
