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
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return false;
  return req.headers['x-admin-csrf'] === '1';
}

export function sendError(res, status, error) {
  return res.status(status).json({ error });
}
