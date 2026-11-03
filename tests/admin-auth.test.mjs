// Admin authentication: api/admin/*, api/_lib/admin-auth.js and the admin
// pages. Supabase is replaced by a fake fetch, so no network or secrets.
import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ORIGIN = 'https://rashid-wep.vercel.app';
const SB = 'https://example-project.supabase.co';
const AT = '__Secure-rw_admin_at';
const RT = '__Secure-rw_admin_rt';
const now = () => Math.floor(Date.now() / 1000);

function jwt(claims) {
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc({ role: 'authenticated', ...claims })}.c2lnbmF0dXJlLXBsYWNlaG9sZGVy`;
}
const freshToken = (sub = 'admin-id', ageS = 60) =>
  jwt({ sub, exp: now() + 3600, amr: [{ method: 'password', timestamp: now() - ageS }] });

// --- fake Supabase ---------------------------------------------------------
let users;      // token -> user
let admins;     // user ids that are admins
let refreshes;  // refresh token -> new session
let calls;
const realFetch = globalThis.fetch;

function fakeFetch(url, init = {}) {
  calls.push({ url: String(url), init });
  const auth = (init.headers?.Authorization || '').replace(/^Bearer /, '');
  const reply = (status, body, headers = {}) => Promise.resolve(new Response(
    body === undefined ? null : JSON.stringify(body),
    { status, headers: { 'content-type': 'application/json', ...headers } },
  ));
  const u = new URL(url);
  if (u.pathname === '/auth/v1/user') return users[auth] ? reply(200, users[auth]) : reply(401, { msg: 'bad jwt' });
  if (u.pathname === '/rest/v1/rpc/is_admin') return reply(200, !!(users[auth] && admins.has(users[auth].id)));
  if (u.pathname === '/auth/v1/logout') return reply(204);
  if (u.pathname === '/auth/v1/token') {
    const s = refreshes[JSON.parse(init.body).refresh_token];
    return s ? reply(200, s) : reply(400, { msg: 'invalid refresh' });
  }
  if (u.pathname.startsWith('/rest/v1/')) {
    return users[auth] ? reply(200, [{ id: 1 }], { 'content-range': '0-0/7' }) : reply(401, { message: 'jwt' });
  }
  return reply(404, {});
}

beforeEach(() => {
  process.env.SUPABASE_URL = SB;
  process.env.SUPABASE_ANON_KEY = jwt({ role: 'anon' });
  users = {};
  admins = new Set(['admin-id']);
  refreshes = {};
  calls = [];
  globalThis.fetch = fakeFetch;
  console.error = () => {};
});
after(() => { globalThis.fetch = realFetch; });

const req = (r = {}) => ({ method: 'GET', headers: {}, body: {}, query: {}, socket: {}, ...r });
function res() {
  const o = { statusCode: 0, body: null, headers: {} };
  o.status = (c) => { o.statusCode = c; return o; };
  o.json = (b) => { o.body = b; return o; };
  o.end = () => o;
  o.setHeader = (k, v) => { o.headers[k.toLowerCase()] = v; };
  return o;
}
const writeHeaders = { origin: ORIGIN, 'x-admin-csrf': '1' };
const session = async () => (await import('../api/admin/session.js')).default;
const rest = async () => (await import('../api/admin/rest.js')).default;
const config = async () => (await import('../api/admin/config.js')).default;
const cookies = (r) => [].concat(r.headers['set-cookie'] || []);

// --- session ---------------------------------------------------------------

test('GET session without cookies -> 401, no-store', async () => {
  const r = res();
  await (await session())(req(), r);
  assert.equal(r.statusCode, 401);
  assert.equal(r.headers['cache-control'], 'no-store');
});

test('missing Supabase env -> 500 and nothing leaks', async () => {
  delete process.env.SUPABASE_URL;
  const r = res();
  await (await session())(req(), r);
  assert.equal(r.statusCode, 500);
  assert.deepEqual(r.body, { error: 'Server misconfigured' });
});

test('a service-role key in SUPABASE_ANON_KEY is refused, never served', async () => {
  process.env.SUPABASE_ANON_KEY = jwt({ role: 'service_role' });
  const r = res();
  await (await config())(req(), r);
  assert.equal(r.statusCode, 500);
  assert.ok(!JSON.stringify(r.body).includes('eyJ'));
});

test('config returns only the URL and the publishable key', async () => {
  const r = res();
  await (await config())(req(), r);
  assert.equal(r.statusCode, 200);
  assert.deepEqual(Object.keys(r.body).sort(), ['anonKey', 'supabaseUrl']);
});

test('POST session needs an allowed Origin and the CSRF header', async () => {
  const t = freshToken();
  users[t] = { id: 'admin-id', email: 'owner@example.com' };
  for (const headers of [{}, { origin: 'https://evil.example', 'x-admin-csrf': '1' }, { origin: ORIGIN }]) {
    const r = res();
    await (await session())(req({ method: 'POST', headers, body: { access_token: t, refresh_token: 'refresh-token-123456' } }), r);
    assert.equal(r.statusCode, 403, JSON.stringify(headers));
    assert.equal(cookies(r).length, 0);
  }
});

test('POST session for a non-admin -> 403, Supabase session revoked, no cookies', async () => {
  const t = freshToken('someone');
  users[t] = { id: 'someone', email: 'x@example.com' };
  const r = res();
  await (await session())(req({ method: 'POST', headers: writeHeaders, body: { access_token: t, refresh_token: 'refresh-token-123456' } }), r);
  assert.equal(r.statusCode, 403);
  assert.ok(calls.some((c) => c.url.includes('/auth/v1/logout')));
  assert.ok(cookies(r).every((c) => /Max-Age=0/.test(c)));
});

test('POST session for the admin sets HttpOnly, Secure, SameSite=Strict cookies on /api/admin only', async () => {
  const t = freshToken();
  users[t] = { id: 'admin-id', email: 'owner@example.com' };
  const r = res();
  await (await session())(req({ method: 'POST', headers: writeHeaders, body: { access_token: t, refresh_token: 'refresh-token-123456', expires_in: 3600 } }), r);
  assert.equal(r.statusCode, 200);
  assert.equal(r.body.email, 'owner@example.com');
  const set = cookies(r);
  assert.equal(set.length, 2);
  for (const c of set) {
    assert.match(c, /HttpOnly/);
    assert.match(c, /Secure/);
    assert.match(c, /SameSite=Strict/);
    assert.match(c, /Path=\/api\/admin(;|$)/);
  }
  assert.ok(!JSON.stringify(r.body).includes(t), 'token is not echoed back');
});

test('a sign-in older than the 8 h cap is rejected', async () => {
  const t = freshToken('admin-id', 9 * 3600);
  users[t] = { id: 'admin-id' };
  const r = res();
  await (await session())(req({ method: 'POST', headers: writeHeaders, body: { access_token: t, refresh_token: 'refresh-token-123456' } }), r);
  assert.equal(r.statusCode, 401);

  const g = res();
  await (await session())(req({ headers: { cookie: `${AT}=${t}; ${RT}=refresh-token-123456` } }), g);
  assert.equal(g.statusCode, 401);
  assert.ok(cookies(g).every((c) => /Max-Age=0/.test(c)));
});

test('GET session with a valid cookie -> 200 and slides the idle window', async () => {
  const t = freshToken();
  users[t] = { id: 'admin-id', email: 'owner@example.com' };
  const r = res();
  await (await session())(req({ headers: { cookie: `${AT}=${t}; ${RT}=refresh-token-123456` } }), r);
  assert.equal(r.statusCode, 200);
  assert.equal(r.body.authenticated, true);
  const rtCookie = cookies(r).find((c) => c.startsWith(RT));
  const maxAge = Number(/Max-Age=(\d+)/.exec(rtCookie)[1]);
  assert.ok(maxAge > 7000 && maxAge <= 7200, `idle window ${maxAge}`);
});

test('expired access token is refreshed with the refresh cookie and rotated', async () => {
  const fresh = freshToken('admin-id', 600);
  users[fresh] = { id: 'admin-id', email: 'owner@example.com' };
  refreshes['old-refresh-token-1234'] = { access_token: fresh, refresh_token: 'new-refresh-token-5678', expires_in: 3600, user: users[fresh] };
  const r = res();
  await (await session())(req({ headers: { cookie: `${AT}=expired.token.value-xyz; ${RT}=old-refresh-token-1234` } }), r);
  assert.equal(r.statusCode, 200);
  assert.ok(cookies(r).some((c) => c.startsWith(`${RT}=new-refresh-token-5678`)));
});

test('an admin removed from admin_users loses access on the next request', async () => {
  const t = freshToken();
  users[t] = { id: 'admin-id' };
  admins.clear();
  const r = res();
  await (await session())(req({ headers: { cookie: `${AT}=${t}; ${RT}=refresh-token-123456` } }), r);
  assert.equal(r.statusCode, 403);
});

test('DELETE session revokes and clears cookies; requires CSRF header', async () => {
  const t = freshToken();
  users[t] = { id: 'admin-id' };
  const blocked = res();
  await (await session())(req({ method: 'DELETE', headers: { cookie: `${AT}=${t}` } }), blocked);
  assert.equal(blocked.statusCode, 403);

  const r = res();
  await (await session())(req({ method: 'DELETE', headers: { ...writeHeaders, cookie: `${AT}=${t}` } }), r);
  assert.equal(r.statusCode, 200);
  assert.ok(calls.some((c) => c.url.includes('/auth/v1/logout')));
  assert.ok(cookies(r).every((c) => /Max-Age=0/.test(c)));
});

// --- data proxy ------------------------------------------------------------

function adminCookie() {
  const t = freshToken();
  users[t] = { id: 'admin-id' };
  return { t, cookie: `${AT}=${t}; ${RT}=refresh-token-123456` };
}

test('rest: unauthenticated -> 401; missing CSRF -> 403', async () => {
  const a = res();
  await (await rest())(req({ method: 'POST', headers: writeHeaders, body: { table: 'projects', action: 'select' } }), a);
  assert.equal(a.statusCode, 401);
  const b = res();
  await (await rest())(req({ method: 'POST', headers: { cookie: adminCookie().cookie }, body: { table: 'projects', action: 'select' } }), b);
  assert.equal(b.statusCode, 403);
});

test('rest: rejects unknown tables, forbidden actions, unfiltered writes and bad identifiers', async () => {
  const { cookie } = adminCookie();
  const bodies = [
    { table: 'admin_users', action: 'select' },
    { table: 'site_stats', action: 'update', values: { visitor_count: 1 }, filters: [{ column: 'id', value: 1 }] },
    { table: 'projects', action: 'delete' },
    { table: 'projects', action: 'update', values: { title: 'x' } },
    { table: 'projects', action: 'select', columns: 'id,(select 1)' },
    { table: 'projects', action: 'select', filters: [{ column: 'id;drop', value: 1 }] },
    { table: 'projects', action: 'insert', values: [{ 'bad key': 1 }] },
  ];
  for (const body of bodies) {
    const r = res();
    await (await rest())(req({ method: 'POST', headers: { ...writeHeaders, cookie }, body }), r);
    assert.equal(r.statusCode, 400, JSON.stringify(body));
  }
});

test('rest: forwards as the signed-in admin with the publishable key, never a service key', async () => {
  const { t, cookie } = adminCookie();
  const r = res();
  await (await rest())(req({
    method: 'POST',
    headers: { ...writeHeaders, cookie },
    body: { table: 'projects', action: 'select', count: 'exact', filters: [{ column: 'status', value: 'Public' }], order: { column: 'created_at', ascending: false } },
  }), r);
  assert.equal(r.statusCode, 200);
  assert.equal(r.body.count, 7);
  const call = calls.find((c) => c.url.startsWith(`${SB}/rest/v1/projects`));
  const u = new URL(call.url);
  assert.equal(u.searchParams.get('status'), 'eq.Public');
  assert.equal(u.searchParams.get('order'), 'created_at.desc');
  assert.equal(call.init.headers.Authorization, `Bearer ${t}`);
  assert.equal(call.init.headers.apikey, process.env.SUPABASE_ANON_KEY);
});

// --- pages and headers -----------------------------------------------------

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('admin pages load no ads, no Supabase client and no inline script on the sign-in pages', () => {
  for (const p of ['admin/login.html', 'admin/reset-password.html', 'admin/dashboard.html']) {
    const html = read(p);
    assert.ok(!/googlesyndication|adsbygoogle|googletagmanager/.test(html), `${p} loads ads/analytics`);
    assert.ok(!/vendor\/supabase|supabase-config\.js/.test(html), `${p} builds a browser Supabase session`);
    assert.match(html, /noindex/);
  }
  for (const p of ['admin/login.html', 'admin/reset-password.html']) {
    const inline = read(p).match(/<script(?![^>]*\bsrc=)[^>]*>/g) || [];
    assert.deepEqual(inline, [], `${p} has inline script`);
    assert.ok(!/\sstyle=|\son[a-z]+=/.test(read(p)), `${p} has inline style or handler`);
  }
});

test('admin scripts never store tokens in web storage', () => {
  for (const p of ['admin/js/login.js', 'admin/js/reset-password.js', 'admin/js/admin-client.js']) {
    assert.ok(!/(local|session)Storage\.setItem/.test(read(p)), p);
  }
});

test('vercel.json gives /admin a CSP without ad hosts and frame-ancestors none', () => {
  const cfg = JSON.parse(read('vercel.json'));
  const rules = cfg.headers.filter((h) => h.source.startsWith('/admin'));
  for (const src of ['/admin', '/admin/', '/admin/(.*)']) {
    assert.ok(rules.some((h) => h.source === src), `no header rule for ${src}`);
  }
  for (const rule of rules) {
    const csp = rule.headers.find((h) => h.key === 'Content-Security-Policy').value;
    assert.ok(!/googlesyndication|doubleclick|googletagmanager/.test(csp), rule.source);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.ok(rule.headers.some((h) => h.key === 'Cache-Control' && h.value === 'no-store'));
  }
  const strict = rules.find((h) => h.source.includes('login'));
  assert.ok(!/unsafe-inline/.test(strict.headers.find((h) => h.key === 'Content-Security-Policy').value.split(';')[1]));
  assert.ok(!cfg.rewrites.some((r) => r.source.startsWith('/api/admin')), '/api/admin must not be rewritten away');
});
