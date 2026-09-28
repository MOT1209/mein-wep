import type { NextFunction, Request, Response } from 'express';
import { errors } from '../lib/errors.js';
import { verifyAccessToken } from '../lib/tokens.js';

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractBearer(req);
    if (!token) throw errors.unauthorized('Missing access token.');
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

/** Attaches req.user when a valid token is present, but never rejects. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractBearer(req);
    if (token) req.user = verifyAccessToken(token);
    next();
  } catch {
    next();
  }
}
