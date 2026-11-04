// Unit tests for the Vercel functions in api/. They call each handler with a
// mock req/res — no network, no env secrets — so they run the same in CI and
// locally: `npm test`.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';

const ORIGIN = 'https://rashid-wep.vercel.app';

const req = (r = {}) => ({ headers: {}, method: 'POST', body: {}, query: {}, socket: {}, ...r });
function res() {
  const o = { statusCode: 0, body: null, headers: {} };
  o.status = (c) => { o.statusCode = c; return o; };
  o.json = (b) => { o.body = b; return o; };
  o.send = (b) => { o.body = b; return o; };
  o.end = () => o;
  o.setHeader = (k, v) => { o.headers[k] = v; };
  return o;
}
const load = async (name) => (await import(`../api/${name}.js`)).default;

before(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;
  delete process.env.GEMINI_API_KEY;
  // Handlers log expected misconfiguration errors; keep test output readable.
  console.error = () => {};
});

test('every api/*.js exports a handler as an ES module', async () => {
  for (const name of ['contact', 'evaluate', 'gemini', 'github', 'rss']) {
    assert.equal(typeof await load(name), 'function', name);
  }
});

test('contact: missing Supabase env -> 500, no hardcoded fallback', async () => {
  const r = res();
  await (await load('contact'))(req({
    headers: { origin: ORIGIN },
    body: { name: 'Test', email: 'a@b.co', message: 'hello there friend' },
  }), r);
  assert.equal(r.statusCode, 500);
});

test('contact: rejects over-long name', async () => {
  const r = res();
  await (await load('contact'))(req({
    body: { name: 'x'.repeat(101), email: 'a@b.co', message: 'hello there friend' },
  }), r);
  assert.equal(r.statusCode, 400);
});

for (const name of ['gemini', 'evaluate']) {
  test(`${name}: request without Origin -> 403`, async () => {
    const r = res();
    await (await load(name))(req({ body: { prompt: 'hi' } }), r);
    assert.equal(r.statusCode, 403);
  });

  test(`${name}: foreign Origin -> 403`, async () => {
    const r = res();
    await (await load(name))(req({ headers: { origin: 'https://evil.example' }, body: { prompt: 'hi' } }), r);
    assert.equal(r.statusCode, 403);
  });
}

test('gemini: allowed Origin without key -> generic 500', async () => {
  const r = res();
  await (await load('gemini'))(req({ headers: { origin: ORIGIN }, body: { prompt: 'hi' } }), r);
  assert.equal(r.statusCode, 500);
  assert.deepEqual(r.body, { error: 'Server misconfigured' });
});

test('github: same-origin GET (no Origin header) is allowed; unknown endpoint -> 400', async () => {
  const r = res();
  await (await load('github'))(req({ method: 'GET', headers: { 'sec-fetch-site': 'same-origin' }, query: { endpoint: '/not-allowed' } }), r);
  assert.equal(r.statusCode, 400);
});

test('github: the unencoded repos query from the client works; unknown params are dropped', async () => {
  const realFetch = globalThis.fetch;
  let asked = '';
  globalThis.fetch = async (url) => { asked = String(url); return new Response('[]', { status: 200 }); };
  try {
    const r = res();
    await (await load('github'))(req({ method: 'GET', headers: { 'sec-fetch-site': 'same-origin' }, query: { endpoint: '/users/MOT1209/repos?per_page=100', sort: 'updated', evil: '1' } }), r);
    assert.equal(r.statusCode, 200);
    assert.equal(asked, 'https://api.github.com/users/MOT1209/repos?per_page=100&sort=updated');
    const bad = res();
    await (await load('github'))(req({ method: 'GET', headers: { 'sec-fetch-site': 'same-origin' }, query: { endpoint: '/users/MOT1209/../../user/emails' } }), bad);
    assert.equal(bad.statusCode, 400);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('github: a request with no Origin and no Sec-Fetch-Site (curl, scripts) is refused', async () => {
  for (const headers of [{}, { 'sec-fetch-site': 'cross-site' }, { 'sec-fetch-site': 'none' }]) {
    const r = res();
    await (await load('github'))(req({ method: 'GET', headers, query: { endpoint: '/users/MOT1209' } }), r);
    assert.equal(r.statusCode, 403, JSON.stringify(headers));
  }
});

test('rss: adds published CMS posts from Supabase and survives a Supabase failure', async () => {
  const realFetch = globalThis.fetch;
  process.env.SUPABASE_URL = 'https://x.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.c2ln';
  let asked = '';
  try {
    globalThis.fetch = async (url) => {
      asked = decodeURIComponent(String(url));
      return new Response(JSON.stringify([{ slug: 'from-cms', title: 'From <CMS>', description: 'd', published_at: '2099-01-01T00:00:00Z', categories: [] }]), { status: 200 });
    };
    const r = res();
    await (await load('rss'))(req({ method: 'GET' }), r);
    assert.equal(r.statusCode, 200);
    assert.match(r.body, /blog\/from-cms\.html/);
    assert.match(r.body, /From &lt;CMS&gt;/);
    assert.match(asked, /status=eq\.published/);
    assert.match(asked, /deleted_at=is\.null/);
    globalThis.fetch = async () => { throw new Error('down'); };
    const r2 = res();
    await (await load('rss'))(req({ method: 'GET' }), r2);
    assert.equal(r2.statusCode, 200);
    assert.ok(!r2.body.includes('from-cms'));
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
  }
});

test('rss: builds a feed from blog/posts.json', async () => {
  const r = res();
  await (await load('rss'))(req({ method: 'GET' }), r);
  assert.equal(r.statusCode, 200);
  assert.match(String(r.body), /<rss version="2.0"/);
});
