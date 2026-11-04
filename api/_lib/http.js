/**
 * Small HTTP helpers shared by the admin functions.
 *
 * Files under api/_lib/ start with an underscore, so Vercel does not turn them
 * into endpoints; they are only imported by real functions.
 */

export const ALLOWED_ORIGINS = [
  'https://rashid-wep.vercel.app',
  'http://localhost:8080', // eleventy --serve
  'http://localhost:3000', // vercel dev
];

export function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || 'unknown';
}

/**
 * Fixed-window limiter kept in memory. Per serverless instance and reset on a
 * cold start, so it slows casual abuse; the hard brute-force limit on
 * passwords is Supabase Auth's own per-IP limit (the browser talks to it
 * directly, so Supabase sees the real client IP).
 */
export function createLimiter(limit, windowMs) {
  const hits = new Map();
  return function limited(key) {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
      }
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  };
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of String(header).split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const name = part.slice(0, i).trim();
    if (!name || name in out) continue;
    try {
      out[name] = decodeURIComponent(part.slice(i + 1).trim());
    } catch {
      out[name] = '';
    }
  }
  return out;
}

export function serializeCookie(name, value, { maxAge, path = '/', httpOnly = true } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, 'Secure', 'SameSite=Strict'];
  if (httpOnly) parts.push('HttpOnly');
  if (maxAge !== undefined) parts.push(`Max-Age=${Math.max(0, Math.floor(maxAge))}`);
  return parts.join('; ');
}

/** Headers every admin API response carries. */
export function noStore(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

/**
 * Cross-site request forgery guard for state-changing requests.
 * The session cookies are SameSite=Strict already; on top of that a write must
 * come from an allowed Origin and carry a custom header, which a plain HTML
 * form on another site cannot set.
 */
export function csrfOk(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  // Same-origin is always allowed: that is how Vercel preview deployments
  // (rashid-wep-git-<branch>-….vercel.app) reach their own API. A page on
  // another site cannot make the browser send this deployment's host as its
  // Origin.
  const host = req.headers.host;
  const sameOrigin = typeof host === 'string' && /^[a-z0-9.-]+(:\d+)?$/i.test(host)
    && (origin === `https://${host}` || (/^localhost(:\d+)?$/.test(host) && origin === `http://${host}`));
  if (!sameOrigin && !ALLOWED_ORIGINS.includes(origin)) return false;
  return req.headers['x-admin-csrf'] === '1';
}

export function sendError(res, status, error) {
  return res.status(status).json({ error });
}

/**
 * Shared limit across all serverless instances (public.rate_limit_hit in
 * supabase/migrations/20261104090000_rate_limits.sql). Resolves true when the
 * request is over the limit. The IP is hashed with a server-side salt
 * (RATE_LIMIT_SALT, else CRON_SECRET) so nobody can compute another person's
 * bucket and lock them out. Fails open (false) if the database is not
 * reachable or not migrated: the in-memory limiter still applies, and
 * passwords are rate-limited by Supabase Auth itself.
 */
export async function sharedLimited(env, action, ip, limit, windowS) {
  if (!env) return false;
  const salt = process.env.RATE_LIMIT_SALT || process.env.CRON_SECRET || '';
  const { createHash } = await import('node:crypto');
  const bucket = `${action}:${createHash('sha256').update(`${salt}|${ip}`).digest('hex').slice(0, 32)}`;
  try {
    const r = await fetch(`${env.url}/rest/v1/rpc/rate_limit_hit`, {
      method: 'POST',
      headers: { apikey: env.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_bucket: bucket, p_limit: limit, p_window_s: windowS }),
      signal: AbortSignal.timeout(1500),
    });
    if (!r.ok) return false;
    return (await r.json()) === false;
  } catch {
    return false;
  }
}
