import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { sendToUsers } from '../../realtime/hub.js';
import * as conversations from '../conversations/conversations.service.js';

const messageIdParamSchema = z.object({ messageId: z.string().uuid() });

export const messagesRouter = Router();

messagesRouter.use(requireAuth);

messagesRouter.delete(
  '/:messageId',
  validate(messageIdParamSchema, 'params'),
  async (req, res, next) => {
    try {
      const { messageId } = req.params as unknown as { messageId: string };
      const result = await conversations.deleteMessage(req.user!.sub, messageId);
      sendToUsers(result.participantIds, {
        type: 'message:deleted',
        conversationId: result.conversationId,
        messageId: result.messageId,
        deletedAt: result.deletedAt,
      });
      res.json({ messageId: result.messageId, deletedAt: result.deletedAt });
    } catch (err) {
      next(err);
    }
  },
);
