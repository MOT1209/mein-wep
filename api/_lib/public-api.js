/**
 * Shared guards for the public (unauthenticated) functions: CORS, abuse
 * limits and the Gemini call. One implementation instead of a copy per file.
 *
 * Origin checks are NOT authentication. A browser cannot lie about Origin,
 * but curl and scripts can send any header, so the Origin allow-list only
 * keeps other websites from using these endpoints from their visitors'
 * browsers. What actually bounds abuse (and the cost of the paid Gemini key)
 * is the rate limiting below:
 *
 *   1. an in-memory limit per serverless instance (fast, always on);
 *   2. a shared limit per client IP across all instances, counted in Postgres
 *      (public.rate_limit_hit, supabase/migrations/20261104090000_rate_limits.sql);
 *   3. a shared daily cap for the whole site (GEMINI_DAILY_LIMIT), so even a
 *      distributed abuser cannot run up an unbounded bill.
 *
 * If the database limiter is unreachable or not migrated yet, (2) and (3)
 * fail open and log a warning; (1) still applies. See docs/SECURITY.md.
 */
import { clientIp, createLimiter, sharedLimited } from './http.js';
import { supabaseEnv } from './admin-auth.js';

export const PUBLIC_ORIGINS = [
  'https://rashid-wep.vercel.app',
  'http://localhost:3000', // vercel dev
  'http://localhost:5500', // live-server
  'http://127.0.0.1:5500',
  'http://localhost:8080', // eleventy --serve
  'http://127.0.0.1:8080',
];

/**
 * Sets CORS headers for an allowed Origin. Returns false (and nothing is set)
 * when the Origin is missing or foreign; the caller answers 403.
 */
export function allowOrigin(req, res, methods = 'POST, OPTIONS') {
  const origin = req.headers.origin;
  if (!origin || !PUBLIC_ORIGINS.includes(origin)) return false;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '600');
  return true;
}

const memoryLimiters = new Map();
function memoryLimited(action, ip, perMinute) {
  if (!memoryLimiters.has(action)) memoryLimiters.set(action, createLimiter(perMinute, 60 * 1000));
  return memoryLimiters.get(action)(ip);
}

let warned = false;
async function shared(env, action, key, limit, windowS) {
  if (!env) {
    if (!warned) {
      console.warn('shared rate limit unavailable (SUPABASE_URL / SUPABASE_ANON_KEY not set): per-instance limits only');
      warned = true;
    }
    return false;
  }
  return sharedLimited(env, action, key, limit, windowS);
}

function positiveInt(value, fallback) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

/**
 * Applies the three limits for one public action. Resolves to null when the
 * request may go on, or to { status, error } to send back.
 *
 *   perMinute  per IP, per instance and shared
 *   perDay     per IP, shared
 *   dailyEnv   name of an env var holding the site-wide daily cap
 *   dailyDefault  cap used when that variable is unset
 */
export async function checkLimits(req, action, { perMinute, perDay, dailyEnv, dailyDefault }) {
  const ip = clientIp(req);
  if (memoryLimited(action, ip, perMinute)) {
    return { status: 429, error: 'Too many requests, slow down.' };
  }
  const env = supabaseEnv();
  if (await shared(env, `${action}-min`, ip, perMinute, 60)) {
    return { status: 429, error: 'Too many requests, slow down.' };
  }
  if (perDay && await shared(env, `${action}-day`, ip, perDay, 86400)) {
    return { status: 429, error: 'Daily limit reached, try again tomorrow.' };
  }
  if (dailyEnv) {
    const cap = positiveInt(process.env[dailyEnv], dailyDefault);
    if (await shared(env, `${action}-all`, 'site', cap, 86400)) {
      return { status: 503, error: 'The service is busy today, try again tomorrow.' };
    }
  }
  return null;
}

export const GEMINI_MODEL_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
export const GEMINI_TIMEOUT_MS = 20_000;

/**
 * Calls Gemini with the server-side key. Resolves to the answer text ('' when
 * the model returned none). Throws an Error with .code = 'upstream' or
 * 'timeout'; the message is for the server log only, never for the client.
 */
export async function callGemini(apiKey, body, { timeoutMs = GEMINI_TIMEOUT_MS, fetchImpl = fetch } = {}) {
  let response;
  try {
    response = await fetchImpl(GEMINI_MODEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const e = new Error(`Gemini request failed: ${err.name}`);
    e.code = err.name === 'TimeoutError' ? 'timeout' : 'upstream';
    throw e;
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const e = new Error(`Gemini ${response.status}: ${detail.slice(0, 300)}`);
    e.code = 'upstream';
    throw e;
  }
  const data = await response.json().catch(() => null);
  return data?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join('') ?? '';
}

/** True when the request body was sent as JSON (Vercel parsed it to an object). */
export function jsonBody(req) {
  const type = String(req.headers['content-type'] || '');
  return req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    && (type === '' || type.toLowerCase().startsWith('application/json'));
}
