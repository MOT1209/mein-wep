/**
 * POST /api/admin/<resource>  { action, ...args }  ->  { data } | { error }
 *
 * One function for every CMS operation (Vercel Hobby allows 12 functions per
 * deployment), routed by the path segment and the `action` field. Each
 * request is checked by requireAdmin() first: valid session, admin role,
 * same-origin + X-Admin-CSRF header. Handlers are in api/_lib/cms-handlers.js.
 */
import { requireAdmin } from '../_lib/admin-auth.js';
import { HANDLERS } from '../_lib/cms-handlers.js';
import { InputError } from '../_lib/cms-validate.js';
import { DbError, createDb } from '../_lib/supabase-rest.js';
import { clientIp, createLimiter, noStore, sendError, sharedLimited } from '../_lib/http.js';

const limits = {
  default: createLimiter(180, 60 * 1000),
  'media.upload': createLimiter(30, 60 * 1000),
  'github.sync': createLimiter(6, 60 * 1000),
  'publish.run': createLimiter(4, 60 * 1000),
};

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed');
  }
  const resource = String(req.query?.resource ?? '');
  const group = Object.hasOwn(HANDLERS, resource) ? HANDLERS[resource] : null;
  const { action, ...args } = req.body && typeof req.body === 'object' ? req.body : {};
  const fn = group && typeof action === 'string' && Object.hasOwn(group, action) ? group[action] : null;
  if (!group) return sendError(res, 404, 'Unknown resource');
  if (!fn) return sendError(res, 400, 'Unknown action');

  const key = `${resource}.${action}`;
  const ip = clientIp(req);
  if (limits.default(ip) || (limits[key] && limits[key](ip))) return sendError(res, 429, 'Too many requests, wait a moment');

  const auth = await requireAdmin(req, res, { csrf: true });
  if (!auth) return undefined;

  // Expensive or outward actions are also limited across all instances.
  const SHARED = { 'media.upload': [60, 600], 'github.sync': [12, 600], 'publish.run': [10, 600] };
  if (SHARED[key] && await sharedLimited(auth.env, key.replace('.', '-'), ip, ...SHARED[key])) {
    return sendError(res, 429, 'Too many requests, wait a few minutes');
  }

  const db = createDb(auth);
  const log = async (act, entity, entityId, details) => {
    try {
      await db.insert('activity_logs', {
        actor_id: auth.user.id,
        actor_email: auth.user.email ?? null,
        action: act,
        entity,
        entity_id: entityId === null || entityId === undefined ? null : String(entityId).slice(0, 200),
        details: details ?? {},
      });
    } catch (err) {
      console.error('activity log failed:', err.message);
    }
  };

  try {
    const data = await fn.call(group, { db, log, auth }, args);
    return res.status(200).json({ data });
  } catch (err) {
    if (err instanceof InputError || err instanceof DbError) {
      return res.status(err.status || 400).json({ error: err.message, details: err.details });
    }
    if (err?.status && err.status >= 400 && err.status < 600) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(`admin ${key} failed:`, err);
    return sendError(res, 500, 'Something went wrong on the server');
  }
}
