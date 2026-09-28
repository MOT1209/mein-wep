import { z } from 'zod';

export const createConversationSchema = z.object({
  recipientId: z.string().uuid('recipientId must be a valid user id.'),
});
export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const conversationIdParamSchema = z.object({
  conversationId: z.string().uuid(),
});

export const listConversationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const messagesQuerySchema = z.object({
  before: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export type MessagesQuery = z.infer<typeof messagesQuerySchema>;

export const sendMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty.')
    .max(4000, 'Message must be at most 4000 characters.'),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const markReadSchema = z
  .object({
    lastReadMessageId: z.string().uuid().optional(),
  })
  .default({});
export type MarkReadInput = z.infer<typeof markReadSchema>;
