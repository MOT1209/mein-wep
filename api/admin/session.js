/**
 * Admin session endpoint.
 *
 *   GET    /api/admin/session   -> { authenticated, email, expiresAt } or 401/403
 *   POST   /api/admin/session   { access_token, refresh_token, expires_in }
 *                               -> turns a fresh Supabase sign-in into an
 *                                  HttpOnly cookie session, admins only
 *   DELETE /api/admin/session   -> signs out (revokes the Supabase session)
 *
 * There is no sign-up anywhere: admins are the rows of public.admin_users.
 */
import {
  ABSOLUTE_MAX_S, ACCESS_COOKIE, sessionStartedAt, clearSessionCookies, requireAdmin, revoke, setSessionCookies,
  supabaseEnv, validToken, vetTokens,
} from '../_lib/admin-auth.js';
import { clientIp, createLimiter, csrfOk, noStore, parseCookies, sendError } from '../_lib/http.js';

const signInLimited = createLimiter(10, 60 * 1000);
const readLimited = createLimiter(120, 60 * 1000);

export default async function handler(req, res) {
  noStore(res);
  const ip = clientIp(req);

  if (req.method === 'GET') {
    if (readLimited(ip)) return sendError(res, 429, 'Too many requests');
    const auth = await requireAdmin(req, res, { csrf: false });
    if (!auth) return undefined;
    return res.status(200).json({
      authenticated: true,
      email: auth.user.email || null,
      expiresAt: auth.expiresAt,
    });
  }

  if (req.method === 'POST') {
    if (signInLimited(ip)) return sendError(res, 429, 'Too many attempts, wait a minute');
    if (!csrfOk(req)) return sendError(res, 403, 'Forbidden');
    const env = supabaseEnv();
    if (!env) {
      console.error('SUPABASE_URL / SUPABASE_ANON_KEY not set');
      return sendError(res, 500, 'Server misconfigured');
    }
    const { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn } = req.body || {};
    if (!validToken(accessToken) || !validToken(refreshToken)) {
      return sendError(res, 400, 'Missing session tokens');
    }
    const vet = await vetTokens(env, accessToken);
    if (!vet.ok) {
      // A valid non-admin sign-in is ended right away, so it cannot linger.
      await revoke(env, accessToken);
      clearSessionCookies(res);
      return sendError(res, vet.status, vet.error);
    }
    setSessionCookies(res, { accessToken, refreshToken, expiresIn, claims: vet.claims });
    return res.status(200).json({
      authenticated: true,
      email: vet.user.email || null,
      expiresAt: sessionStartedAt(vet.claims) + ABSOLUTE_MAX_S,
    });
  }

  if (req.method === 'DELETE') {
    if (!csrfOk(req)) return sendError(res, 403, 'Forbidden');
    const env = supabaseEnv();
    const token = parseCookies(req.headers.cookie)[ACCESS_COOKIE];
    if (env && validToken(token)) await revoke(env, token);
    clearSessionCookies(res);
    return res.status(200).json({ authenticated: false });
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return sendError(res, 405, 'Method not allowed');
}
