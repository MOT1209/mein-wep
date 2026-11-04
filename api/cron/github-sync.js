/**
 * GET /api/cron/github-sync — the daily GitHub sync (vercel.json "crons").
 *
 * Vercel calls this with `Authorization: Bearer <CRON_SECRET>`. The function
 * holds only the publishable Supabase key; it passes CRON_SECRET to
 * public.github_sync_apply(), which checks it against the hash the admin
 * stored ("Enable scheduled sync" in the dashboard) and can write nothing but
 * repository metadata and a sync log. There is no service-role key.
 *
 * After a successful sync it can start a rebuild (VERCEL_DEPLOY_HOOK_URL), so
 * repository metadata and blog posts scheduled for today go live; set
 * CRON_REBUILD=0 to turn that off.
 */
import crypto from 'node:crypto';
import { listOwnerRepos } from '../_lib/github.js';
import { supabaseEnv } from '../_lib/admin-auth.js';
import { noStore, sendError } from '../_lib/http.js';

const DEPLOY_HOOK = /^https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\/[A-Za-z0-9_]+\/[A-Za-z0-9_]+$/;

function authorised(req, secret) {
  const got = Buffer.from(String(req.headers.authorization ?? ''));
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}

export default async function handler(req, res) {
  noStore(res);
  const secret = process.env.CRON_SECRET || '';
  if (secret.length < 32) return sendError(res, 503, 'Scheduled sync is not configured');
  if (!authorised(req, secret)) return sendError(res, 401, 'Unauthorized');
  if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed');
  const env = supabaseEnv();
  if (!env) return sendError(res, 500, 'Server misconfigured');

  const list = await listOwnerRepos();
  const r = await fetch(`${env.url}/rest/v1/rpc/github_sync_apply`, {
    method: 'POST',
    headers: { apikey: env.anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      p_repos: list.repos,
      p_complete: list.complete,
      p_trigger: 'scheduled',
      p_secret: secret,
      p_error: list.error,
    }),
  });
  if (!r.ok) {
    console.error('scheduled sync rejected:', r.status, (await r.text()).slice(0, 300));
    return sendError(res, 502, 'Sync could not be saved (is the scheduled sync enabled in the dashboard?)');
  }
  const summary = await r.json();

  let rebuild = 'skipped';
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL || '';
  if (process.env.CRON_REBUILD !== '0' && DEPLOY_HOOK.test(hook) && summary.status !== 'failed') {
    const h = await fetch(hook, { method: 'POST' }).catch(() => null);
    rebuild = h?.ok ? 'started' : 'failed';
  }
  return res.status(200).json({ ...summary, rebuild });
}
