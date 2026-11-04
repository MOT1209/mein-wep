/**
 * Supabase REST calls made on behalf of the signed-in admin.
 *
 * Every call carries the admin's own JWT and the publishable key, never a
 * service-role key, so Row Level Security in the database decides what is
 * allowed (see supabase/migrations). A bug here can at most do what the admin
 * could do by hand in the dashboard.
 */

export class DbError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Turns a PostgREST/Storage error body into a message safe to show the admin. */
function explain(status, body) {
  const code = body?.code || '';
  if (code === '23505' || status === 409) return new DbError(409, 'That value is already used (it must be unique).', code);
  if (code === '23514' || code === '23502' || code === '22P02' || code === '22023') {
    return new DbError(400, `Rejected by the database: ${body.message || 'invalid value'}`, code);
  }
  if (code === '42501' || status === 401 || status === 403) return new DbError(403, 'Not allowed.', code);
  if (code === 'PGRST205' || code === '42P01' || code === '42883') {
    return new DbError(503, 'The CMS tables are missing: apply supabase/migrations first.', code);
  }
  if (status === 404) return new DbError(404, 'Not found.', code);
  return new DbError(status >= 500 ? 502 : status, body?.message || body?.error || `Database request failed (${status})`, code);
}

export function createDb(auth) {
  const { env, accessToken } = auth;

  async function call(method, path, { body, prefer, headers = {}, raw = false } = {}) {
    const h = { apikey: env.anonKey, Authorization: `Bearer ${accessToken}`, Accept: 'application/json', ...headers };
    if (body !== undefined && !(body instanceof Uint8Array)) h['Content-Type'] = 'application/json';
    if (prefer) h.Prefer = prefer;
    const r = await fetch(`${env.url}${path}`, {
      method,
      headers: h,
      body: body === undefined ? undefined : body instanceof Uint8Array ? body : JSON.stringify(body),
    });
    const text = await r.text();
    let json = null;
    if (text) {
      try { json = JSON.parse(text); } catch { json = null; }
    }
    if (!r.ok) throw explain(r.status, json);
    return raw ? { json, headers: r.headers } : json;
  }

  const rest = (method, table, query = '', opts) => call(method, `/rest/v1/${table}${query ? `?${query}` : ''}`, opts);

  return {
    call,
    select: (table, query) => rest('GET', table, query),
    insert: (table, rows, query = '') => rest('POST', table, query, { body: rows, prefer: 'return=representation' }),
    update: (table, query, patch) => {
      if (!query) throw new Error('update needs a filter');
      return rest('PATCH', table, query, { body: patch, prefer: 'return=representation' });
    },
    remove: (table, query) => {
      if (!query) throw new Error('delete needs a filter');
      return rest('DELETE', table, query, { prefer: 'return=representation' });
    },
    upsert: (table, rows, onConflict) => rest('POST', table, `on_conflict=${encodeURIComponent(onConflict)}`, {
      body: rows, prefer: 'return=representation,resolution=merge-duplicates',
    }),
    rpc: (fn, args) => call('POST', `/rest/v1/rpc/${fn}`, { body: args ?? {} }),
    storage: (method, path, opts) => call(method, `/storage/v1/${path}`, opts),
    publicUrl: (bucket, objectPath) => `${env.url}/storage/v1/object/public/${bucket}/${objectPath.split('/').map(encodeURIComponent).join('/')}`,
  };
}

/** PostgREST filter value: eq.<value>, URL-encoded. */
export const eq = (v) => `eq.${encodeURIComponent(String(v))}`;
