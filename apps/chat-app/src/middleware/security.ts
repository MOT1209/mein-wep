import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { corsOrigins, isProd } from '../config/env.js';

export const securityHeaders = helmet({
  contentSecurityPolicy: false, // API only — the SPA serves its own CSP
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

export const corsMiddleware = cors({
  origin(origin, cb) {
    // No Origin header = same-origin / curl / server-to-server.
    if (!origin || corsOrigins.includes(origin)) {
      cb(null, true);
      return;
    }
    cb(new Error('Origin not allowed by CORS policy.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 600,
});

export const jsonBody = express.json({
  limit: '32kb',
  type: ['application/json'],
});

export function securityNotes(): string[] {
  return [
    'helmet security headers',
    `CORS allowlist (${corsOrigins.length} origin${corsOrigins.length === 1 ? '' : 's'})`,
    isProd ? 'secure cookies enabled' : 'development cookie settings',
  ];
}
