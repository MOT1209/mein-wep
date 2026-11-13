/**
 * GitHub API Proxy — Vercel Serverless Function
 *
 * Keeps GITHUB_TOKEN server-side to avoid rate limits.
 * Set the token: Vercel Dashboard → Project → Environment Variables
 *   Name: GITHUB_TOKEN
 *   Value: (classic GitHub PAT with public_repo scope)
 */

import { clientIp, createLimiter } from './_lib/http.js';
import { PUBLIC_ORIGINS } from './_lib/public-api.js';

const GITHUB_API = 'https://api.github.com';
const ALLOWED = ['/users/MOT1209', '/users/MOT1209/repos', '/users/MOT1209/events'];

const limited = createLimiter(30, 60 * 1000);

export default async (req, res) => {
  // Only this site may use the proxy (and its token's rate limit). Browsers
  // send Origin on cross-origin requests and Sec-Fetch-Site on all fetches; a
  // same-origin GET carries Sec-Fetch-Site: same-origin and often no Origin.
  // A request with neither (curl, scripts) is refused.
  const origin = req.headers.origin;
  const fetchSite = req.headers['sec-fetch-site'];
  if (origin) {
    if (!PUBLIC_ORIGINS.includes(origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (fetchSite !== 'same-origin') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Per instance only: this proxy spends nothing but the token's GitHub quota,
  // and the responses are cached at the edge below.
  if (limited(clientIp(req))) {
    return res.status(429).json({ error: 'Too many requests, slow down.' });
  }

  // The client sends ?endpoint=/users/MOT1209/repos?per_page=100&sort=updated
  // unencoded, so the path's own query arrives split across `endpoint` and
  // the top-level query. Only the path is matched against ALLOWED; per_page
  // and sort are passed on when valid, everything else is dropped.
  const raw = typeof req.query.endpoint === 'string' ? req.query.endpoint : '';
  const [pathPart, inner = ''] = raw.split('?');
  if (!pathPart || !ALLOWED.includes(pathPart)) {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }
  const params = new URLSearchParams(inner);
  const perPage = Number(params.get('per_page') ?? req.query.per_page);
  const sort = String(params.get('sort') ?? req.query.sort ?? '');
  const out = new URLSearchParams();
  if (Number.isInteger(perPage) && perPage >= 1 && perPage <= 100) out.set('per_page', String(perPage));
  if (['updated', 'created', 'pushed', 'full_name'].includes(sort)) out.set('sort', sort);
  const endpoint = out.toString() ? `${pathPart}?${out}` : pathPart;

  const token = process.env.GITHUB_TOKEN;
  const headers = { 'Accept': 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`${GITHUB_API}${endpoint}`, { headers, signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      console.error('GitHub upstream error:', response.status);
      return res.status(502).json({ error: 'GitHub API unavailable' });
    }
    const data = await response.json();
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    console.error('GitHub proxy error:', err.message);
    return res.status(500).json({ error: 'GitHub API unavailable' });
  }
};
