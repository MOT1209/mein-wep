import type { Response } from 'express';
import { one, withTransaction } from '../../config/db.js';
import { env, isProd } from '../../config/env.js';
import { errors } from '../../lib/errors.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import {
  generateRefreshToken,
  getAccessTokenTtlSeconds,
  hashToken,
  signAccessToken,
} from '../../lib/tokens.js';
import type { AuthResponse, UserRow } from '../../types/index.js';
import { toPublicUser } from '../../types/index.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';

export const REFRESH_COOKIE = 'refresh_token';

interface SessionRow {
  id: string;
  expires_at: Date;
}

function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/api/v1/auth',
    maxAge: maxAgeMs,
  };
}

async function createSession(
  userId: string,
  meta: { userAgent?: string; ip?: string },
): Promise<string> {
  const { token, hash } = generateRefreshToken();
  const ttlMs = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  await withTransaction(async (client) => {
    // Keep only the newest few sessions per user so stolen tokens age out.
    await client.query(
      `delete from refresh_tokens
        where user_id = $1
          and id not in (
            select id from refresh_tokens
             where user_id = $1 and revoked_at is null
             order by created_at desc
             limit 10
          )`,
      [userId],
    );
    await client.query(
      `insert into refresh_tokens (user_id, token_hash, expires_at, user_agent, ip)
       values ($1, $2, now() + ($3 || ' days')::interval, $4, $5)`,
      [
        userId,
        hash,
        String(env.REFRESH_TOKEN_TTL_DAYS),
        meta.userAgent?.slice(0, 255) ?? null,
        meta.ip ?? null,
      ],
    );
  });
  return token;
}

function issueTokens(user: UserRow, res: Response, refreshToken: string): AuthResponse {
  const expiresIn = getAccessTokenTtlSeconds();
  res.cookie(
    REFRESH_COOKIE,
    refreshToken,
    cookieOptions(env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  );
  return {
    user: toPublicUser(user),
    accessToken: signAccessToken({ sub: user.id, username: user.username }),
    expiresIn,
  };
}

export async function register(
  input: RegisterInput,
  res: Response,
  meta: { userAgent?: string; ip?: string },
): Promise<AuthResponse> {
  const existing = await one<{ field: string }>(
    `select case
        when exists (select 1 from users where lower(username) = $1) then 'username'
        when exists (select 1 from users where lower(email) = $2) then 'email'
      end as field`,
    [input.username, input.email],
  );
  if (existing?.field === 'username') {
    throw errors.conflict('That username is already taken.');
  }
  if (existing?.field === 'email') {
    throw errors.conflict('An account with that email already exists.');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await one<UserRow>(
    `insert into users (username, email, password_hash, display_name, last_seen_at)
     values ($1, $2, $3, $4, now())
     returning *`,
    [input.username, input.email, passwordHash, input.displayName ?? input.username],
  );
  if (!user) throw errors.internal();

  const refreshToken = await createSession(user.id, meta);
  return issueTokens(user, res, refreshToken);
}

export async function login(
  input: LoginInput,
  res: Response,
  meta: { userAgent?: string; ip?: string },
): Promise<AuthResponse> {
  const isEmail = input.identifier.includes('@');
  const user = await one<UserRow>(
    isEmail
      ? 'select * from users where lower(email) = lower($1)'
      : 'select * from users where lower(username) = lower($1)',
    [input.identifier],
  );

  // Same error for unknown user and wrong password (no account enumeration).
  const invalid = errors.unauthorized('Incorrect email/username or password.');
  if (!user) throw invalid;

  const ok = await verifyPassword(input.password, user.password_hash);
  if (!ok) throw invalid;
  if (user.is_disabled) throw errors.forbidden('This account is disabled.');

  const active = await one<UserRow>(
    'update users set last_seen_at = now() where id = $1 returning *',
    [user.id],
  );
  const refreshToken = await createSession(user.id, meta);
  return issueTokens(active ?? user, res, refreshToken);
}

export async function refresh(
  tokenFromCookie: string | undefined,
  res: Response,
  meta: { userAgent?: string; ip?: string },
): Promise<AuthResponse> {
  if (!tokenFromCookie) throw errors.unauthorized('Missing refresh token.');

  const hash = hashToken(tokenFromCookie);
  const session = await one<SessionRow & { user_id: string }>(
    `select id, user_id, expires_at
       from refresh_tokens
      where token_hash = $1 and revoked_at is null and expires_at > now()`,
    [hash],
  );
  if (!session) throw errors.unauthorized('Refresh token is invalid or expired.');

  const user = await one<UserRow>('select * from users where id = $1', [session.user_id]);
  if (!user || user.is_disabled) throw errors.unauthorized('Account unavailable.');

  // Rotation: the presented token is consumed, a new one is issued.
  await one('update refresh_tokens set revoked_at = now() where id = $1', [session.id]);

  const refreshToken = await createSession(user.id, meta);
  return issueTokens(user, res, refreshToken);
}

export async function logout(tokenFromCookie: string | undefined, res: Response): Promise<void> {
  if (tokenFromCookie) {
    await one(
      'update refresh_tokens set revoked_at = now() where token_hash = $1 and revoked_at is null',
      [hashToken(tokenFromCookie)],
    );
  }
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/api/v1/auth',
  });
}

export async function me(userId: string): Promise<AuthResponse['user']> {
  const user = await one<UserRow>('select * from users where id = $1', [userId]);
  if (!user) throw errors.notFound('User not found.');
  return toPublicUser(user);
}
