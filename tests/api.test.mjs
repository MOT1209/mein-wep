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
  await (await load('github'))(req({ method: 'GET', query: { endpoint: '/not-allowed' } }), r);
  assert.equal(r.statusCode, 400);
});

test('rss: builds a feed from blog/posts.json', async () => {
  const r = res();
  (await load('rss'))(req({ method: 'GET' }), r);
  assert.equal(r.statusCode, 200);
  assert.match(String(r.body), /<rss version="2.0"/);
});
