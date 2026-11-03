/**
 * Owner-only admin sessions on top of Supabase Auth.
 *
 * - The password check is Supabase Auth's own (the browser signs in directly
 *   against Supabase, which rate-limits per real client IP).
 * - The browser then hands the tokens to POST /api/admin/session once. From
 *   then on they live only in HttpOnly, Secure, SameSite=Strict cookies scoped
 *   to /api/admin, so page scripts can never read them and they are never sent
 *   to the /king2 or /auth rewrites on other deployments.
 * - Every protected request verifies the token with Supabase (GET
 *   /auth/v1/user) and asks the database whether the user is an admin
 *   (rpc is_admin, i.e. the admin_users table). No service-role key is used:
 *   data calls run as the signed-in user, so Row Level Security stays the
 *   final authority.
 *
 * Env: SUPABASE_URL, SUPABASE_ANON_KEY (the publishable key, already used by
 * api/contact.js).
 */
import { noStore, parseCookies, serializeCookie, csrfOk, sendError } from './http.js';

export const COOKIE_PATH = '/api/admin';
export const ACCESS_COOKIE = '__Secure-rw_admin_at';
export const REFRESH_COOKIE = '__Secure-rw_admin_rt';

/** Hard cap on a session, counted from the password sign-in. */
export const ABSOLUTE_MAX_S = 8 * 60 * 60;
/** A session with no admin request for this long expires. */
export const IDLE_MAX_S = 2 * 60 * 60;

const TOKEN_RE = /^[A-Za-z0-9._~+/=-]{16,4096}$/;

export function supabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  // This key reaches the browser (api/admin/config.js). Refuse to run if
  // someone put a secret key in the variable by mistake.
  if (isSecretKey(anonKey)) {
    console.error('SUPABASE_ANON_KEY holds a secret/service-role key; use the publishable key');
    return null;
  }
  return { url: url.replace(/\/+$/, ''), anonKey };
}

export function isSecretKey(key) {
  if (String(key).startsWith('sb_secret_')) return true;
  const claims = String(key).split('.').length === 3 ? jwtClaims(String(key)) : null;
  return claims?.role === 'service_role';
}

function headers(env, accessToken, extra = {}) {
  const h = { apikey: env.anonKey, ...extra };
  if (accessToken) h.Authorization = `Bearer ${accessToken}`;
  return h;
}

/** Payload of a JWT that Supabase has already accepted. Not a verification. */
export function jwtClaims(token) {
  try {
    const part = token.split('.')[1];
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

/** Seconds since the password (or recovery) sign-in that started the session. */
export function sessionStartedAt(claims) {
  const amr = Array.isArray(claims?.amr) ? claims.amr : [];
  const times = amr.map((m) => Number(m?.timestamp)).filter((t) => Number.isFinite(t) && t > 0);
  return times.length ? Math.min(...times) : null;
}

export async function getUser(env, accessToken) {
  const r = await fetch(`${env.url}/auth/v1/user`, { headers: headers(env, accessToken) });
  if (!r.ok) return null;
  const user = await r.json();
  return user && user.id ? user : null;
}

export async function isAdmin(env, accessToken) {
  const r = await fetch(`${env.url}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: headers(env, accessToken, { 'Content-Type': 'application/json' }),
    body: '{}',
  });
  if (!r.ok) return false;
  return (await r.json()) === true;
}

export async function refresh(env, refreshToken) {
  const r = await fetch(`${env.url}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: headers(env, null, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!r.ok) return null;
  const s = await r.json();
  return s && s.access_token && s.refresh_token ? s : null;
}

export async function revoke(env, accessToken) {
  try {
    await fetch(`${env.url}/auth/v1/logout?scope=local`, {
      method: 'POST',
      headers: headers(env, accessToken),
    });
  } catch {
    // Best effort: the cookies are cleared either way.
  }
}

export function validToken(t) {
  return typeof t === 'string' && TOKEN_RE.test(t);
}

/** Seconds left before the absolute cap, or null when the start is unknown. */
function absoluteRemaining(claims, now) {
  const started = sessionStartedAt(claims);
  if (!started) return null;
  return started + ABSOLUTE_MAX_S - now;
}

export function setSessionCookies(res, { accessToken, refreshToken, expiresIn, claims }) {
  const now = Math.floor(Date.now() / 1000);
  const remaining = absoluteRemaining(claims, now) ?? 0;
  const accessAge = Math.min(Number(expiresIn) || 3600, remaining);
  const refreshAge = Math.min(IDLE_MAX_S, remaining);
  res.setHeader('Set-Cookie', [
    serializeCookie(ACCESS_COOKIE, accessToken, { path: COOKIE_PATH, maxAge: accessAge }),
    serializeCookie(REFRESH_COOKIE, refreshToken, { path: COOKIE_PATH, maxAge: refreshAge }),
  ]);
}

export function clearSessionCookies(res) {
  res.setHeader('Set-Cookie', [
    serializeCookie(ACCESS_COOKIE, '', { path: COOKIE_PATH, maxAge: 0 }),
    serializeCookie(REFRESH_COOKIE, '', { path: COOKIE_PATH, maxAge: 0 }),
  ]);
}

/**
 * Checks a fresh token pair before it becomes a session (used at sign-in).
 * Returns { ok: true, user, claims } or { ok: false, status, error }.
 */
export async function vetTokens(env, accessToken) {
  const user = await getUser(env, accessToken);
  if (!user) return { ok: false, status: 401, error: 'Invalid or expired session' };
  const claims = jwtClaims(accessToken);
  const remaining = absoluteRemaining(claims, Math.floor(Date.now() / 1000));
  if (remaining === null || remaining <= 0) {
    return { ok: false, status: 401, error: 'Session too old, sign in again' };
  }
  if (!(await isAdmin(env, accessToken))) {
    return { ok: false, status: 403, error: 'Not an administrator' };
  }
  return { ok: true, user, claims };
}

/**
 * Guard for every protected admin endpoint.
 *
 * Resolves to { user, accessToken, env } when the request carries a valid
 * admin session (refreshing the access token when needed), or sends the error
 * response itself and resolves to null.
 *
 *   const auth = await requireAdmin(req, res);
 *   if (!auth) return;
 */
export async function requireAdmin(req, res, { csrf = req.method !== 'GET' } = {}) {
  noStore(res);
  const env = supabaseEnv();
  if (!env) {
    console.error('SUPABASE_URL / SUPABASE_ANON_KEY not set');
    sendError(res, 500, 'Server misconfigured');
    return null;
  }
  if (csrf && !csrfOk(req)) {
    sendError(res, 403, 'Forbidden');
    return null;
  }

  const cookies = parseCookies(req.headers.cookie);
  let accessToken = validToken(cookies[ACCESS_COOKIE]) ? cookies[ACCESS_COOKIE] : null;
  const refreshToken = validToken(cookies[REFRESH_COOKIE]) ? cookies[REFRESH_COOKIE] : null;
  let user = accessToken ? await getUser(env, accessToken) : null;
  let rotated = null;

  if (!user && refreshToken) {
    rotated = await refresh(env, refreshToken);
    if (rotated) {
      accessToken = rotated.access_token;
      user = rotated.user?.id ? rotated.user : await getUser(env, accessToken);
    }
  }

  if (!user) {
    clearSessionCookies(res);
    sendError(res, 401, 'Not signed in');
    return null;
  }

  const claims = jwtClaims(accessToken);
  const remaining = absoluteRemaining(claims, Math.floor(Date.now() / 1000));
  if (remaining === null || remaining <= 0) {
    await revoke(env, accessToken);
    clearSessionCookies(res);
    sendError(res, 401, 'Session expired');
    return null;
  }

  if (!(await isAdmin(env, accessToken))) {
    await revoke(env, accessToken);
    clearSessionCookies(res);
    sendError(res, 403, 'Not an administrator');
    return null;
  }

  // Re-issue the cookies on every authorised request: that slides the idle
  // window and stores a rotated token pair. Never past the absolute cap.
  if (rotated) {
    setSessionCookies(res, {
      accessToken,
      refreshToken: rotated.refresh_token,
      expiresIn: rotated.expires_in,
      claims,
    });
  } else if (refreshToken) {
    const exp = Number(claims?.exp) - Math.floor(Date.now() / 1000);
    setSessionCookies(res, { accessToken, refreshToken, expiresIn: exp > 0 ? exp : 60, claims });
  }

  return { user, accessToken, env, expiresAt: Math.floor(Date.now() / 1000) + remaining };
}
