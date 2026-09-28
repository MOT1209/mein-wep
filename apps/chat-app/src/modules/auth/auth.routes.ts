import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema, registerSchema } from './auth.schemas.js';
import * as authService from './auth.service.js';

export const authRouter = Router();

function meta(req: { headers: Record<string, unknown>; ip?: string }) {
  return {
    userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
    ip: req.ip,
  };
}

authRouter.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  async (req, res, next) => {
    try {
      res.status(201).json(await authService.register(req.body, res, meta(req)));
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    res.status(200).json(await authService.login(req.body, res, meta(req)));
  } catch (err) {
    next(err);
  }
});

authRouter.post('/refresh', authLimiter, async (req, res, next) => {
  try {
    const token = (req.cookies as Record<string, string | undefined>)?.[authService.REFRESH_COOKIE];
    res.status(200).json(await authService.refresh(token, res, meta(req)));
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    const token = (req.cookies as Record<string, string | undefined>)?.[authService.REFRESH_COOKIE];
    await authService.logout(token, res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    res.json({ user: await authService.me(req.user!.sub) });
  } catch (err) {
    next(err);
  }
});
