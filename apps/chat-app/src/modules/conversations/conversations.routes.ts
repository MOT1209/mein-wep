import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { messageLimiter } from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import { sendToUsers } from '../../realtime/hub.js';
import {
  createConversationSchema,
  conversationIdParamSchema,
  listConversationsSchema,
  markReadSchema,
  messagesQuerySchema,
  sendMessageSchema,
  type MessagesQuery,
} from './conversations.schemas.js';
import * as conversations from './conversations.service.js';

export const conversationsRouter = Router();

conversationsRouter.use(requireAuth);

conversationsRouter.post(
  '/',
  validate(createConversationSchema),
  async (req, res, next) => {
    try {
      const viewerId = req.user!.sub;
      const { conversation, created } = await conversations.createPrivate(viewerId, req.body);
      if (created) {
        sendToUsers([conversation.participant.id, viewerId], {
          type: 'conversation:new',
          conversation,
        });
      }
      res.status(created ? 201 : 200).json({ conversation, created });
    } catch (err) {
      next(err);
    }
  },
);

conversationsRouter.get('/', validate(listConversationsSchema, 'query'), async (req, res, next) => {
  try {
    const { limit } = req.query as unknown as { limit: number };
    res.json({ conversations: await conversations.list(req.user!.sub, limit) });
  } catch (err) {
    next(err);
  }
});

conversationsRouter.get(
  '/:conversationId',
  validate(conversationIdParamSchema, 'params'),
  async (req, res, next) => {
    try {
      const { conversationId } = req.params as unknown as { conversationId: string };
      res.json({ conversation: await conversations.getForViewer(conversationId, req.user!.sub) });
    } catch (err) {
      next(err);
    }
  },
);

conversationsRouter.get(
  '/:conversationId/messages',
  validate(conversationIdParamSchema, 'params'),
  validate(messagesQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const { conversationId } = req.params as unknown as { conversationId: string };
      const query = req.query as unknown as MessagesQuery;
      res.json(await conversations.getMessages(req.user!.sub, conversationId, query));
    } catch (err) {
      next(err);
    }
  },
);

conversationsRouter.post(
  '/:conversationId/messages',
  messageLimiter,
  validate(conversationIdParamSchema, 'params'),
  validate(sendMessageSchema),
  async (req, res, next) => {
    try {
      const { conversationId } = req.params as unknown as { conversationId: string };
      const viewerId = req.user!.sub;
      const { message, participantIds } = await conversations.createMessage(
        viewerId,
        conversationId,
        req.body,
      );
      sendToUsers(participantIds, { type: 'message:new', conversationId, message });
      sendToUsers(participantIds, {
        type: 'conversation:updated',
        conversation: await conversations.getForViewer(conversationId, viewerId),
      });
      res.status(201).json({ message });
    } catch (err) {
      next(err);
    }
  },
);

conversationsRouter.post(
  '/:conversationId/read',
  validate(conversationIdParamSchema, 'params'),
  validate(markReadSchema),
  async (req, res, next) => {
    try {
      const { conversationId } = req.params as unknown as { conversationId: string };
      const viewerId = req.user!.sub;
      const { lastReadAt, participantIds } = await conversations.markRead(
        viewerId,
        conversationId,
        req.body.lastReadMessageId,
      );
      sendToUsers(participantIds, {
        type: 'message:read',
        conversationId,
        userId: viewerId,
        lastReadAt,
        lastReadMessageId: req.body.lastReadMessageId ?? null,
      });
      res.json({ lastReadAt, unreadCount: 0 });
    } catch (err) {
      next(err);
    }
  },
);
