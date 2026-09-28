import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { errors } from './errors.js';

export interface AccessTokenPayload {
  sub: string;
  username: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
    issuer: 'chat-app',
    audience: 'chat-app-client',
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'chat-app',
      audience: 'chat-app-client',
    });
    if (typeof decoded === 'string' || !decoded.sub || !('username' in decoded)) {
      throw errors.unauthorized('Invalid access token.');
    }
    return { sub: String(decoded.sub), username: String(decoded.username) };
  } catch (err) {
    if (err instanceof Error && err.name === 'TokenExpiredError') {
      throw errors.unauthorized('Access token expired.');
    }
    throw errors.unauthorized('Invalid access token.');
  }
}

export function getAccessTokenTtlSeconds(): number {
  const match = /^(\d+)([smhd])$/.exec(env.ACCESS_TOKEN_TTL);
  if (!match) return 900;
  const value = Number(match[1]);
  const unit = match[2];
  const factor = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  return value * factor;
}

/** Opaque refresh token. Only the SHA-256 hash is ever persisted. */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(48).toString('base64url');
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
