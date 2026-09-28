import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { searchSchema, updateProfileSchema, usernameParamSchema } from './users.schemas.js';
import * as usersService from './users.service.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/me', async (req, res, next) => {
  try {
    res.json({ user: await usersService.getMe(req.user!.sub) });
  } catch (err) {
    next(err);
  }
});

usersRouter.patch('/me', validate(updateProfileSchema), async (req, res, next) => {
  try {
    res.json({ user: await usersService.updateMe(req.user!.sub, req.body) });
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/search', validate(searchSchema, 'query'), async (req, res, next) => {
  try {
    const { q, limit } = req.query as unknown as { q: string; limit: number };
    res.json({ users: await usersService.search(q, limit, req.user!.sub) });
  } catch (err) {
    next(err);
  }
});

usersRouter.get(
  '/:username',
  validate(usernameParamSchema, 'params'),
  async (req, res, next) => {
    try {
      const { username } = req.params as unknown as { username: string };
      res.json({ user: await usersService.getByUsername(username) });
    } catch (err) {
      next(err);
    }
  },
);
