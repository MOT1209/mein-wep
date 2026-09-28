import { z } from 'zod';

/** ── Server → Client ─────────────────────────────────────────── */
export type ServerEvent =
  | { type: 'hello'; userId: string; serverTime: string }
  | { type: 'pong'; serverTime: string }
  | { type: 'presence:update'; userId: string; status: 'online' | 'offline'; lastSeenAt: string }
  | { type: 'conversation:new'; conversation: unknown }
  | { type: 'conversation:updated'; conversation: unknown }
  | { type: 'message:new'; conversationId: string; message: unknown }
  | { type: 'message:deleted'; conversationId: string; messageId: string; deletedAt: string }
  | { type: 'typing'; conversationId: string; userId: string; isTyping: boolean }
  | {
      type: 'message:read';
      conversationId: string;
      userId: string;
      lastReadAt: string;
      lastReadMessageId: string | null;
    }
  | { type: 'error'; code: string; message: string; requestId?: string };

/** ── Client → Server ─────────────────────────────────────────── */
export const clientEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ping') }),
  z.object({
    type: z.literal('typing'),
    conversationId: z.string().uuid(),
    isTyping: z.boolean(),
  }),
  z.object({
    type: z.literal('message:read'),
    conversationId: z.string().uuid(),
    lastReadMessageId: z.string().uuid().optional(),
  }),
  z.object({
    type: z.literal('message:delivered'),
    conversationId: z.string().uuid(),
  }),
]);

export type ClientEvent = z.infer<typeof clientEventSchema>;

export const WS_CLOSE = {
  NORMAL: 1000,
  UNAUTHORIZED: 4001,
  POLICY: 4003,
  TIMEOUT: 4008,
  ERROR: 5000,
} as const;
