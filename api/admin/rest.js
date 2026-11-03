/**
 * POST /api/admin/rest  — narrow data access for the admin dashboard.
 *
 * The browser no longer holds a Supabase token (it is in an HttpOnly cookie),
 * so the dashboard sends its table operations here. Each request is checked
 * by requireAdmin() and then forwarded to Supabase PostgREST **as the signed-in
 * admin** (their own JWT, the publishable key, no service role): Row Level
 * Security still decides what is allowed.
 *
 * Only the tables and operations the dashboard uses are accepted, with plain
 * identifiers and equality filters. Updates and deletes must be filtered.
 *
 * Body:
 *   { table, action: 'select'|'insert'|'update'|'delete'|'upsert',
 *     columns?, filters?: [{ column, value }], order?: { column, ascending },
 *     single?, count?: 'exact', head?, values?, onConflict? }
 */
import { requireAdmin } from '../_lib/admin-auth.js';
import { clientIp, createLimiter, sendError } from '../_lib/http.js';

const ALL = ['select', 'insert', 'update', 'delete', 'upsert'];

export const TABLES = {
  projects: ALL,
  lessons: ALL,
  models: ALL,
  bot_knowledge: ALL,
  prompts: ALL,
  codes: ALL,
  images: ALL,
  media: ALL,
  vault_items: ALL,
  contact_messages: ['select', 'delete'],
  app_updates: ['select', 'upsert', 'update'],
  site_stats: ['select'],
};

const IDENT = /^[a-z_][a-z0-9_]{0,62}$/;
const MAX_ROWS = 100;
const limited = createLimiter(120, 60 * 1000);

function bad(res, msg) {
  return sendError(res, 400, msg);
}

function scalar(v) {
  return typeof v === 'string' ? v.length <= 512 : typeof v === 'number' ? Number.isFinite(v) : typeof v === 'boolean';
}

/** Validates the body and returns { url, init } for PostgREST, or a string error. */
export function buildRequest(env, body, accessToken) {
  const { table, action, columns = '*', filters = [], order, single, count, head, values, onConflict } = body || {};
  if (!Object.hasOwn(TABLES, table)) return 'Unknown table';
  if (!TABLES[table].includes(action)) return 'Action not allowed on this table';

  const qs = new URLSearchParams();
  if (action === 'select') {
    if (columns !== '*' && !(typeof columns === 'string' && columns.split(',').every((c) => IDENT.test(c.trim())))) {
      return 'Bad columns';
    }
    qs.set('select', columns === '*' ? '*' : columns.split(',').map((c) => c.trim()).join(','));
  }

  if (!Array.isArray(filters) || filters.length > 5) return 'Bad filters';
  for (const f of filters) {
    if (!f || !IDENT.test(f.column) || !scalar(f.value)) return 'Bad filter';
    qs.append(f.column, `eq.${f.value}`);
  }
  if ((action === 'update' || action === 'delete') && filters.length === 0) {
    return 'Update and delete need a filter';
  }

  if (order) {
    if (!IDENT.test(order.column)) return 'Bad order';
    qs.set('order', `${order.column}.${order.ascending === false ? 'desc' : 'asc'}`);
  }

  const prefer = [];
  if (action === 'select' && count === 'exact') prefer.push('count=exact');
  if (action === 'upsert') {
    if (onConflict !== undefined) {
      if (!IDENT.test(onConflict)) return 'Bad onConflict';
      qs.set('on_conflict', onConflict);
    }
    prefer.push('resolution=merge-duplicates');
  }

  let payload;
  if (action === 'insert' || action === 'upsert' || action === 'update') {
    const rows = Array.isArray(values) ? values : [values];
    if (!rows.length || rows.length > MAX_ROWS) return 'Bad values';
    for (const row of rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) return 'Bad values';
      if (!Object.keys(row).every((k) => IDENT.test(k))) return 'Bad values';
    }
    if (action === 'update' && rows.length !== 1) return 'Update takes one object';
    payload = JSON.stringify(action === 'update' ? rows[0] : rows);
    if (payload.length > 200_000) return 'Payload too large';
  }

  const method = { select: head ? 'HEAD' : 'GET', insert: 'POST', upsert: 'POST', update: 'PATCH', delete: 'DELETE' }[action];
  const headers = {
    apikey: env.anonKey,
    Authorization: `Bearer ${accessToken}`,
    Accept: single ? 'application/vnd.pgrst.object+json' : 'application/json',
  };
  if (payload) headers['Content-Type'] = 'application/json';
  if (prefer.length) headers.Prefer = prefer.join(',');
  if (action === 'select' && !single) headers.Range = `0-${499}`;

  return {
    url: `${env.url}/rest/v1/${table}?${qs.toString()}`,
    init: { method, headers, body: payload },
  };
}

function countFrom(contentRange) {
  const total = String(contentRange || '').split('/')[1];
  return total && total !== '*' ? Number(total) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed');
  }
  if (limited(clientIp(req))) return sendError(res, 429, 'Too many requests');

  const auth = await requireAdmin(req, res, { csrf: true });
  if (!auth) return undefined;

  const built = buildRequest(auth.env, req.body, auth.accessToken);
  if (typeof built === 'string') return bad(res, built);

  try {
    const r = await fetch(built.url, built.init);
    const text = built.init.method === 'HEAD' ? '' : await r.text();
    let data = null;
    if (text) {
      try { data = JSON.parse(text); } catch { data = null; }
    }
    const count = countFrom(r.headers.get('content-range'));
    if (!r.ok) {
      const message = (data && (data.message || data.error)) || `Request failed (${r.status})`;
      return res.status(r.status >= 500 ? 502 : r.status).json({ data: null, count: null, error: { message } });
    }
    return res.status(200).json({ data, count, error: null });
  } catch (err) {
    console.error('admin rest error:', err.message);
    return res.status(502).json({ data: null, count: null, error: { message: 'Database unavailable' } });
  }
}
