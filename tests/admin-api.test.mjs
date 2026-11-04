// Admin CMS API (api/admin/[resource].js) and the scheduled GitHub sync,
// against a fake Supabase and a fake GitHub. No network, no secrets.
import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { kingMatch, normalizeRepo } from '../api/_lib/github.js';
import { sniffImage, prepareUpload } from '../api/_lib/media.js';
import { safeUrl, validate } from '../api/_lib/cms-validate.js';

const ORIGIN = 'https://rashid-wep.vercel.app';
const SB = 'https://example-project.supabase.co';
const AT = '__Secure-rw_admin_at';
const HOOK = 'https://api.vercel.com/v1/integrations/deploy/prj_abc/hook123';
const now = () => Math.floor(Date.now() / 1000);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (claims) => `${b64({ alg: 'HS256' })}.${b64({ role: 'authenticated', ...claims })}.c2ln`;
const TOKEN = jwt({ sub: 'admin-id', exp: now() + 3600, amr: [{ method: 'password', timestamp: now() - 60 }] });
const ANON = jwt({ role: 'anon' });

let calls;
let tables;     // table -> rows returned for GET
let githubRepos;
let sharedLimitReached = false;
const realFetch = globalThis.fetch;

function reply(status, body, headers = {}) {
  return Promise.resolve(new Response(body === undefined ? null : JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json', ...headers },
  }));
}

function fakeFetch(url, init = {}) {
  const u = new URL(String(url));
  const method = init.method || 'GET';
  const call = { url: String(url), method, headers: init.headers || {}, body: init.body };
  calls.push(call);
  const bearer = (init.headers?.Authorization || '').replace(/^Bearer /, '');
  if (u.host === 'api.github.com') {
    return reply(200, githubRepos.slice((Number(u.searchParams.get('page')) - 1) * 100, Number(u.searchParams.get('page')) * 100));
  }
  if (String(url) === HOOK) return reply(201, { job: { id: 'job_1' } });
  if (u.pathname === '/auth/v1/user') return bearer === TOKEN ? reply(200, { id: 'admin-id', email: 'owner@example.com' }) : reply(401, {});
  if (u.pathname === '/rest/v1/rpc/is_admin') return reply(200, bearer === TOKEN);
  if (u.pathname === '/rest/v1/rpc/github_sync_apply') {
    return reply(200, { status: 'success', repos_seen: JSON.parse(init.body).p_repos.length, new_candidates: 1, updated: 0, missing: 0 });
  }
  if (u.pathname === '/rest/v1/rpc/rate_limit_hit') return reply(200, !sharedLimitReached);
  if (u.pathname.startsWith('/rest/v1/rpc/')) return reply(200, { configured: true });
  if (u.pathname.startsWith('/storage/v1/')) return reply(200, { Key: 'ok' });
  const table = u.pathname.replace('/rest/v1/', '');
  if (method === 'GET') return reply(200, tables[table] ?? []);
  if (method === 'POST') {
    const body = JSON.parse(init.body);
    const rows = (Array.isArray(body) ? body : [body]).map((r, i) => ({ id: `00000000-0000-4000-8000-00000000000${i}`, ...r }));
    return reply(201, rows);
  }
  if (method === 'PATCH') return reply(200, [{ id: '00000000-0000-4000-8000-000000000009', slug: 'x', ...JSON.parse(init.body) }]);
  if (method === 'DELETE') return reply(200, tables[`${table}:deleted`] ?? [{ id: '00000000-0000-4000-8000-000000000009', slug: 'x' }]);
  return reply(404, {});
}

beforeEach(() => {
  process.env.SUPABASE_URL = SB;
  process.env.SUPABASE_ANON_KEY = ANON;
  delete process.env.VERCEL_DEPLOY_HOOK_URL;
  delete process.env.CRON_SECRET;
  delete process.env.GITHUB_TOKEN;
  calls = [];
  tables = {};
  githubRepos = [];
  sharedLimitReached = false;
  globalThis.fetch = fakeFetch;
  console.error = () => {};
});
after(() => { globalThis.fetch = realFetch; });

function res() {
  const o = { statusCode: 0, body: null, headers: {} };
  o.status = (c) => { o.statusCode = c; return o; };
  o.json = (b) => { o.body = b; return o; };
  o.end = () => o;
  o.setHeader = (k, v) => { o.headers[k.toLowerCase()] = v; };
  return o;
}
const router = async () => (await import('../api/admin/[resource].js')).default;
async function api(resource, body, { headers } = {}) {
  const r = res();
  await (await router())({
    method: 'POST',
    query: { resource },
    headers: headers ?? { origin: ORIGIN, host: 'rashid-wep.vercel.app', 'x-admin-csrf': '1', cookie: `${AT}=${TOKEN}` },
    body,
    socket: {},
  }, r);
  return r;
}
const writes = () => calls.filter((c) => c.method !== 'GET' && c.url.includes('/rest/v1/') && !c.url.includes('/rpc/') && !c.url.includes('activity_logs'));

// --- guard -----------------------------------------------------------------

test('every resource needs a valid admin session and the CSRF header', async () => {
  const noSession = await api('projects', { action: 'list' }, { headers: { origin: ORIGIN, host: 'rashid-wep.vercel.app', 'x-admin-csrf': '1' } });
  assert.equal(noSession.statusCode, 401);
  const noCsrf = await api('projects', { action: 'list' }, { headers: { origin: ORIGIN, host: 'rashid-wep.vercel.app', cookie: `${AT}=${TOKEN}` } });
  assert.equal(noCsrf.statusCode, 403);
  const crossSite = await api('projects', { action: 'list' }, { headers: { origin: 'https://evil.example', host: 'rashid-wep.vercel.app', 'x-admin-csrf': '1', cookie: `${AT}=${TOKEN}` } });
  assert.equal(crossSite.statusCode, 403);
  assert.equal((await api('nope', { action: 'list' })).statusCode, 404);
  assert.equal((await api('projects', { action: 'constructor' })).statusCode, 400);
  assert.equal((await api('projects', { action: '__proto__' })).statusCode, 400);
});

test('data calls use the admin JWT and the publishable key, never a service key', async () => {
  const r = await api('projects', { action: 'list' });
  assert.equal(r.statusCode, 200);
  const call = calls.find((c) => c.url.includes('/rest/v1/studio_projects'));
  assert.equal(call.headers.Authorization, `Bearer ${TOKEN}`);
  assert.equal(call.headers.apikey, ANON);
});

// --- projects ----------------------------------------------------------------

test('create validates fields, defaults to hidden and logs the change', async () => {
  const bad = await api('projects', { action: 'create', fields: { title: 'X', section: 'labs', role: 'admin' } });
  assert.equal(bad.statusCode, 400);
  assert.match(bad.body.error, /Unknown field: role/);
  const xss = await api('projects', { action: 'create', fields: { title: 'X', section: 'labs', demo_url: 'javascript:alert(1)' } });
  assert.equal(xss.statusCode, 400);
  const ok = await api('projects', { action: 'create', fields: { title: 'King Agent', section: 'labs' } });
  assert.equal(ok.statusCode, 200);
  const insert = writes().find((c) => c.url.includes('/rest/v1/studio_projects') && c.method === 'POST');
  const sent = JSON.parse(insert.body);
  assert.equal(sent.visibility, 'hidden');
  assert.equal(sent.slug, 'king-agent');
  assert.ok(calls.some((c) => c.url.includes('/rest/v1/activity_logs') && JSON.parse(c.body).action === 'create'));
});

test('delete is a soft delete; purge only works from the trash', async () => {
  await api('projects', { action: 'delete', id: '00000000-0000-4000-8000-000000000001' });
  const soft = writes().find((c) => c.method === 'PATCH');
  assert.match(soft.url, /deleted_at=is\.null/);
  assert.ok(JSON.parse(soft.body).deleted_at);
  calls = [];
  await api('projects', { action: 'purge', id: '00000000-0000-4000-8000-000000000001' });
  const del = writes().find((c) => c.method === 'DELETE');
  assert.match(del.url, /deleted_at=not\.is\.null/);
  tables['studio_projects:deleted'] = [];
  const notTrashed = await api('projects', { action: 'purge', id: '00000000-0000-4000-8000-000000000001' });
  assert.equal(notTrashed.statusCode, 400);
});

test('no handler ever calls GitHub with a write method', async () => {
  githubRepos = [{ id: 1, name: 'KingAgent', full_name: 'MOT1209/KingAgent', html_url: 'https://github.com/MOT1209/KingAgent', owner: { login: 'MOT1209' } }];
  tables.github_repositories = [{ id: 1, name: 'KingAgent', full_name: 'MOT1209/KingAgent', description: 'Agent', language: 'TypeScript', is_archived: false }];
  await api('github', { action: 'sync' });
  await api('github', { action: 'approve', repo_id: 1 });
  await api('projects', { action: 'purge', id: '00000000-0000-4000-8000-000000000001' });
  assert.ok(calls.filter((c) => c.url.includes('api.github.com')).every((c) => c.method === 'GET'));
});

// --- GitHub --------------------------------------------------------------------

test('KING matching starts at a word and never auto-publishes', async () => {
  assert.equal(kingMatch({ name: 'KingAgent' }), 'name contains KING');
  assert.equal(kingMatch({ name: 'King_Browser' }), 'name contains KING');
  assert.equal(kingMatch({ name: 'my-king3d-ai' }), 'name contains KING');
  assert.equal(kingMatch({ name: 'booking-app' }), null);
  assert.equal(kingMatch({ name: 'walkingdead', description: 'not related' }), null);
  assert.equal(kingMatch({ name: 'tool', description: 'Part of the KING suite' }), 'description mentions KING');
  assert.equal(kingMatch({ name: 'tool', topics: ['king-studio'] }), 'has a KING topic');
  const n = normalizeRepo({ id: 5, name: 'x', full_name: 'MOT1209/x', html_url: 'https://github.com/MOT1209/x', private: true, archived: true });
  assert.equal(n.is_private, true);
  assert.equal(n.is_archived, true);
});

test('manual sync sends every owned repo with match reasons; other owners are dropped', async () => {
  githubRepos = [
    { id: 1, name: 'KingAgent', full_name: 'MOT1209/KingAgent', html_url: 'https://github.com/MOT1209/KingAgent', owner: { login: 'MOT1209' } },
    { id: 2, name: 'Tarjim', full_name: 'MOT1209/Tarjim', html_url: 'https://github.com/MOT1209/Tarjim', owner: { login: 'MOT1209' } },
    { id: 3, name: 'king-fork', full_name: 'someone/king-fork', html_url: 'https://github.com/someone/king-fork', owner: { login: 'someone' } },
  ];
  const r = await api('github', { action: 'sync' });
  assert.equal(r.statusCode, 200);
  const rpc = calls.find((c) => c.url.endsWith('/rest/v1/rpc/github_sync_apply'));
  const body = JSON.parse(rpc.body);
  assert.equal(body.p_trigger, 'manual');
  assert.equal(body.p_complete, true);
  assert.deepEqual(body.p_repos.map((x) => [x.id, x.match_reason]), [[1, 'name contains KING'], [2, null]]);
  assert.equal(rpc.headers.Authorization, `Bearer ${TOKEN}`, 'manual sync runs as the admin');
});

test('approve creates a hidden project linked to the repo and marks it approved', async () => {
  tables.github_repositories = [{ id: 7, name: 'King_Browser', full_name: 'MOT1209/King_Browser', description: 'A browser', language: 'C++', is_archived: false }];
  const r = await api('github', { action: 'approve', repo_id: 7, section: 'apps' });
  assert.equal(r.statusCode, 200);
  const insert = writes().find((c) => c.method === 'POST' && c.url.includes('studio_projects'));
  const p = JSON.parse(insert.body);
  assert.equal(p.visibility, 'hidden');
  assert.equal(p.github_repo_id, 7);
  assert.equal(p.section, 'apps');
  assert.deepEqual(p.technologies, ['C++']);
  const mark = writes().find((c) => c.method === 'PATCH' && c.url.includes('github_repositories'));
  assert.equal(JSON.parse(mark.body).review_state, 'approved');
  assert.equal((await api('github', { action: 'approve', repo_id: 'drop table' })).statusCode, 400);
});

test('enable scheduled sync needs CRON_SECRET and never returns it', async () => {
  assert.equal((await api('github', { action: 'schedule_enable' })).statusCode, 412);
  process.env.CRON_SECRET = 's'.repeat(40);
  const r = await api('github', { action: 'schedule_enable' });
  assert.equal(r.statusCode, 200);
  const status = await api('github', { action: 'schedule_status' });
  assert.equal(status.body.data.cronSecret, true);
  assert.ok(!JSON.stringify(status.body).includes('sss'));
});

// --- media -----------------------------------------------------------------------

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);

test('uploads are typed by their bytes, not their name', async () => {
  assert.equal(sniffImage(PNG).type, 'image/png');
  assert.equal(sniffImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')), null);
  assert.equal(sniffImage(Buffer.from('<html><script>alert(1)</script></html>     ')), null);
  const up = prepareUpload({ folder: 'projects', filename: 'evil.svg', dataBase64: PNG.toString('base64') });
  assert.match(up.path, /^projects\/evil-[0-9a-f]{10}\.png$/);
  assert.throws(() => prepareUpload({ folder: '../etc', filename: 'a.png', dataBase64: PNG.toString('base64') }), /Folder/);
  assert.throws(() => prepareUpload({ filename: 'a.png', dataBase64: Buffer.alloc(3.5 * 1024 * 1024).toString('base64') }), /too large/);
  const html = await api('media', { action: 'upload', filename: 'x.png', dataBase64: Buffer.from('<html><body>hi there you</body></html>').toString('base64') });
  assert.equal(html.statusCode, 400);
});

test('upload stores in the media bucket as the admin with the sniffed type', async () => {
  const r = await api('media', { action: 'upload', folder: 'projects', filename: 'Logo.JPG', dataBase64: PNG.toString('base64') });
  assert.equal(r.statusCode, 200);
  const put = calls.find((c) => c.url.includes('/storage/v1/object/media/'));
  assert.equal(put.headers['Content-Type'], 'image/png');
  assert.equal(put.headers.Authorization, `Bearer ${TOKEN}`);
  assert.match(r.body.data.url, /^https:\/\/example-project\.supabase\.co\/storage\/v1\/object\/public\/media\/projects\/logo-[0-9a-f]+\.png$/);
});

test('deleting an image that is still used is refused unless forced', async () => {
  tables.studio_projects = [{ slug: 'king-agent' }];
  const r = await api('media', { action: 'delete', path: 'projects/logo-abc.png' });
  assert.equal(r.statusCode, 409);
  assert.match(r.body.error, /project king-agent/);
  const forced = await api('media', { action: 'delete', path: 'projects/logo-abc.png', force: true });
  assert.equal(forced.statusCode, 200);
  assert.equal((await api('media', { action: 'delete', path: '../../secret' })).statusCode, 400);
});

// --- content, blog, publish ---------------------------------------------------

test('settings, pages and navigation are validated', async () => {
  assert.equal((await api('content', { action: 'settings_set', key: 'Bad Key', value: 1 })).statusCode, 400);
  assert.equal((await api('content', { action: 'settings_set', key: 'site.name', value: { value: 'Rashid' } })).statusCode, 200);
  assert.equal((await api('content', { action: 'pages_set', page_key: 'admin', locale: 'en', content: {} })).statusCode, 400);
  assert.equal((await api('content', { action: 'pages_set', page_key: 'home', locale: 'fr', content: {} })).statusCode, 400);
  assert.equal((await api('content', { action: 'pages_set', page_key: 'home', locale: 'ar', content: { headline: { html: '<b>' } } })).statusCode, 400);
  assert.equal((await api('content', { action: 'pages_set', page_key: 'home', locale: 'ar', content: { headline: 'مرحبا' } })).statusCode, 200);
  assert.equal((await api('content', { action: 'nav_create', fields: { nav_key: 'x', label: 'X', href: 'javascript:alert(1)' } })).statusCode, 400);
  assert.equal((await api('content', { action: 'nav_create', fields: { nav_key: 'tools', label: 'Tools', href: 'king-studio/labs/' } })).statusCode, 200);
});

test('blog posts start as drafts, cannot take a file-based slug, and publish or schedule', async () => {
  const draft = await api('blog', { action: 'create', fields: { title: 'Hello', body_md: '# Hi' } });
  assert.equal(draft.statusCode, 200);
  assert.equal(JSON.parse(writes().find((c) => c.method === 'POST').body).status, 'draft');
  const clash = await api('blog', { action: 'create', fields: { title: 'X', slug: 'flutter-clean-architecture' } });
  assert.equal(clash.statusCode, 409);
  calls = [];
  const future = new Date(Date.now() + 86400000).toISOString();
  await api('blog', { action: 'publish', id: '00000000-0000-4000-8000-000000000001', published_at: future });
  const patch = writes().find((c) => c.method === 'PATCH');
  assert.equal(JSON.parse(patch.body).published_at, future);
  assert.ok(calls.some((c) => c.url.includes('activity_logs') && JSON.parse(c.body).action === 'schedule_post'));
});

test('publish needs a real Vercel deploy hook and calls it', async () => {
  assert.equal((await api('publish', { action: 'run' })).statusCode, 412);
  process.env.VERCEL_DEPLOY_HOOK_URL = 'https://evil.example/hook';
  assert.equal((await api('publish', { action: 'run' })).statusCode, 412);
  process.env.VERCEL_DEPLOY_HOOK_URL = HOOK;
  const r = await api('publish', { action: 'run' });
  assert.equal(r.statusCode, 200);
  assert.ok(calls.some((c) => c.url === HOOK && c.method === 'POST'));
});

test('publish, sync and uploads are also limited across instances (shared limit)', async () => {
  process.env.VERCEL_DEPLOY_HOOK_URL = HOOK;
  sharedLimitReached = true;
  // Own IP, so the per-instance counter used by earlier tests does not interfere.
  const headers = { origin: ORIGIN, host: 'rashid-wep.vercel.app', 'x-admin-csrf': '1', cookie: `${AT}=${TOKEN}`, 'x-forwarded-for': '203.0.113.9' };
  const r = await api('publish', { action: 'run' }, { headers });
  assert.equal(r.statusCode, 429);
  assert.ok(!calls.some((c) => c.url === HOOK), 'the hook is not called when limited');
  const rpc = calls.find((c) => c.url.endsWith('/rpc/rate_limit_hit'));
  const body = JSON.parse(rpc.body);
  assert.match(body.p_bucket, /^publish-run:[0-9a-f]{32}$/, 'IP is hashed, never stored raw');
  sharedLimitReached = false;
  assert.equal((await api('publish', { action: 'run' }, { headers })).statusCode, 200);
});

test('contact messages and app updates: validated, logged', async () => {
  assert.equal((await api('messages', { action: 'list' })).statusCode, 200);
  assert.equal((await api('messages', { action: 'delete', id: 'all' })).statusCode, 400);
  assert.equal((await api('messages', { action: 'delete', id: 7 })).statusCode, 200);
  assert.match(writes().find((c) => c.method === 'DELETE').url, /contact_messages\?id=eq\.7$/);
  assert.equal((await api('updates', { action: 'save', app_id: 'com.rashid.quizmaster', version: 'x; drop' })).statusCode, 400);
  assert.equal((await api('updates', { action: 'save', app_id: 'com.rashid.quizmaster', version: '1.5.0', url: 'javascript:alert(1)' })).statusCode, 400);
  const ok = await api('updates', { action: 'save', app_id: 'com.rashid.quizmaster', version: '1.5.0', url: '/apks/quiz-app-v1.5.0.apk', release_date: '2026-11-04' });
  assert.equal(ok.statusCode, 200);
  const up = calls.find((c) => c.url.includes('/rest/v1/app_updates') && c.method === 'POST');
  assert.match(up.url, /on_conflict=app_id/);
  assert.equal(JSON.parse(up.body).release_date, '2026-11-04');
});

test('overview reports config as booleans only', async () => {
  process.env.VERCEL_DEPLOY_HOOK_URL = HOOK;
  process.env.GITHUB_TOKEN = 'github_pat_secretvalue';
  const r = await api('overview', { action: 'get' });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.body.data.config, { deployHook: true, githubToken: true, cronSecret: false });
  assert.ok(!JSON.stringify(r.body).includes('secretvalue'));
  assert.ok(!JSON.stringify(r.body).includes('hook123'));
});

// --- shared validation ----------------------------------------------------------

test('safeUrl accepts https and site paths only', () => {
  for (const ok of ['https://github.com/MOT1209/x', 'apps/quiz-app/', '/images/a.png', 'king-studio/#x']) assert.ok(safeUrl(ok), ok);
  for (const bad of ['javascript:alert(1)', 'JAVASCRIPT:x', 'data:text/html,x', '//evil.example', 'http://x.example', 'https://x.example/ a', 'vbscript:x', ' https://x']) {
    assert.ok(!safeUrl(bad), bad);
  }
  assert.throws(() => validate('studio_projects', { i18n: { fr: {} } }, { partial: true }), /unknown language/);
  assert.throws(() => validate('studio_projects', { i18n: { de: { html: 'x' } } }, { partial: true }), /unknown field/);
});

// --- scheduled sync --------------------------------------------------------------

const cron = async () => (await import('../api/cron/github-sync.js')).default;
async function runCron(auth) {
  const r = res();
  await (await cron())({ method: 'GET', headers: auth ? { authorization: auth } : {}, query: {} }, r);
  return r;
}

test('scheduled sync: off without CRON_SECRET, 401 with a wrong one', async () => {
  assert.equal((await runCron('Bearer x')).statusCode, 503);
  process.env.CRON_SECRET = 'c'.repeat(40);
  assert.equal((await runCron()).statusCode, 401);
  assert.equal((await runCron(`Bearer ${'d'.repeat(40)}`)).statusCode, 401);
});

test('scheduled sync passes the secret to the RPC with only the publishable key, then rebuilds', async () => {
  process.env.CRON_SECRET = 'c'.repeat(40);
  process.env.VERCEL_DEPLOY_HOOK_URL = HOOK;
  githubRepos = [{ id: 1, name: 'KingAgent', full_name: 'MOT1209/KingAgent', html_url: 'https://github.com/MOT1209/KingAgent', owner: { login: 'MOT1209' } }];
  const r = await runCron(`Bearer ${'c'.repeat(40)}`);
  assert.equal(r.statusCode, 200);
  assert.equal(r.body.rebuild, 'started');
  const rpc = calls.find((c) => c.url.endsWith('/rpc/github_sync_apply'));
  const body = JSON.parse(rpc.body);
  assert.equal(body.p_secret, 'c'.repeat(40));
  assert.equal(body.p_trigger, 'scheduled');
  assert.equal(rpc.headers.apikey, ANON);
  assert.equal(rpc.headers.Authorization, undefined);
});
