import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { env, isTest } from '../config/env.js';

function sendRateLimited(_req: Request, res: Response): void {
  res.status(429).json({
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please slow down and try again shortly.',
    },
  });
}

function build(windowMs: number, max: number) {
  return rateLimit({
    windowMs,
    max: isTest ? max * 20 : max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many requests.' } },
    handler: sendRateLimited,
  });
}

export const apiLimiter = build(env.RATE_LIMIT_WINDOW_MS, env.RATE_LIMIT_MAX);
export const authLimiter = build(env.RATE_LIMIT_WINDOW_MS, env.AUTH_RATE_LIMIT_MAX);
export const messageLimiter = build(env.RATE_LIMIT_WINDOW_MS, env.MESSAGE_RATE_LIMIT_MAX);
