// Abuse protection on the public functions (api/gemini.js, api/evaluate.js,
// api/contact.js, api/github.js) and their shared guard api/_lib/public-api.js.
// fetch is replaced per test, so nothing reaches Gemini, GitHub or Supabase.
import { test, before, afterEach } from 'node:test';
import assert from 'node:assert/strict';

const ORIGIN = 'https://rashid-wep.vercel.app';
const SUPA = 'https://project.supabase.example';
let ipSeq = 0;
const freshIp = () => `203.0.113.${++ipSeq}`;

const req = (r = {}) => ({
  method: 'POST', body: {}, query: {}, socket: {},
  ...r,
  headers: { 'x-forwarded-for': freshIp(), ...(r.headers || {}) },
});
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
const realFetch = globalThis.fetch;

/**
 * Fake network. `limits(bucket)` decides the database limiter's answer
 * (true = within the limit); `gemini` is the Gemini behaviour.
 */
function network({ limits = () => true, gemini = () => ({ text: '{"score":80,"accuracy":70,"creativity":90,"clarity":60,"comment":"ok"}' }) } = {}) {
  const calls = { gemini: 0, buckets: [] };
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u.startsWith(`${SUPA}/rest/v1/rpc/rate_limit_hit`)) {
      const { p_bucket: bucket } = JSON.parse(init.body);
      calls.buckets.push(bucket);
      return new Response(JSON.stringify(limits(bucket)), { status: 200 });
    }
    if (u.includes('generativelanguage.googleapis.com')) {
      calls.gemini += 1;
      const g = gemini();
      if (g.throw) throw g.throw;
      if (g.status) return new Response('{"error":{"message":"quota project 123 key AIza…"}}', { status: g.status });
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: g.text }] } }],
        usageMetadata: { promptTokenCount: 5 }, modelVersion: 'internal',
      }), { status: 200 });
    }
    if (u.startsWith('https://api.github.com/')) {
      return new Response('{"message":"Not Found"}', { status: 404 });
    }
    throw new Error(`unexpected fetch ${u}`);
  };
  return calls;
}

before(() => {
  console.error = () => {};
  console.warn = () => {};
});
afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_DAILY_LIMIT;
});
function withEnv() {
  process.env.SUPABASE_URL = SUPA;
  process.env.SUPABASE_ANON_KEY = 'sb_publishable_test';
  process.env.GEMINI_API_KEY = 'test-key-not-real';
}
const ask = (prompt = 'hello', extra = {}) => req({ headers: { origin: ORIGIN, 'content-type': 'application/json' }, body: { prompt }, ...extra });

test('gemini: a forged allowed Origin is still bound by the shared per-IP limit', async () => {
  withEnv();
  const calls = network({ limits: (b) => !b.startsWith('gemini-min:') });
  const r = res();
  await (await load('gemini'))(ask(), r);
  assert.equal(r.statusCode, 429);
  assert.equal(calls.gemini, 0, 'Gemini is never called when limited');
  assert.ok(calls.buckets[0].startsWith('gemini-min:'));
  assert.ok(!calls.buckets[0].includes('203.0.113'), 'the IP is hashed, not stored');
});

test('gemini: per-IP daily limit and the site-wide daily cap', async () => {
  withEnv();
  let calls = network({ limits: (b) => !b.startsWith('gemini-day:') });
  let r = res();
  await (await load('gemini'))(ask(), r);
  assert.equal(r.statusCode, 429);
  assert.equal(calls.gemini, 0);

  calls = network({ limits: (b) => !b.startsWith('gemini-all:') });
  r = res();
  await (await load('gemini'))(ask(), r);
  assert.equal(r.statusCode, 503);
  assert.equal(calls.gemini, 0);
});

test('gemini: returns only the answer text, never the provider metadata', async () => {
  withEnv();
  network({ gemini: () => ({ text: 'Hi!' }) });
  const r = res();
  await (await load('gemini'))(ask(), r);
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.body, { candidates: [{ content: { parts: [{ text: 'Hi!' }] } }] });
});

test('gemini: provider errors and timeouts give a generic message without details', async () => {
  withEnv();
  network({ gemini: () => ({ status: 429 }) });
  let r = res();
  await (await load('gemini'))(ask(), r);
  assert.equal(r.statusCode, 502);
  assert.deepEqual(r.body, { error: 'AI service unavailable' });

  network({ gemini: () => ({ throw: Object.assign(new Error('t'), { name: 'TimeoutError' }) }) });
  r = res();
  await (await load('gemini'))(ask(), r);
  assert.equal(r.statusCode, 504);
  assert.deepEqual(r.body, { error: 'AI service unavailable' });
});

test('gemini: input validation (method, JSON, empty and oversized prompts)', async () => {
  withEnv();
  network();
  const g = await load('gemini');
  const cases = [
    [req({ method: 'GET', headers: { origin: ORIGIN } }), 405],
    [req({ headers: { origin: ORIGIN, 'content-type': 'text/plain' }, body: 'prompt=hi' }), 415],
    [ask('   '), 400],
    [ask(42), 400],
    [ask('x'.repeat(8001)), 400],
  ];
  for (const [rq, code] of cases) {
    const r = res();
    await g(rq, r);
    assert.equal(r.statusCode, code, JSON.stringify(rq.body));
  }
});

test('gemini: without the database limiter, the per-instance limit still applies', async () => {
  process.env.GEMINI_API_KEY = 'test-key-not-real';
  network({ gemini: () => ({ text: 'ok' }) });
  const g = await load('gemini');
  const ip = freshIp();
  const codes = [];
  for (let i = 0; i < 11; i++) {
    const r = res();
    await g(req({ headers: { origin: ORIGIN, 'x-forwarded-for': ip }, body: { prompt: 'hi' } }), r);
    codes.push(r.statusCode);
  }
  assert.deepEqual(codes.slice(0, 10), Array(10).fill(200));
  assert.equal(codes[10], 429);
});

const drawing = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const judge = (body) => req({ headers: { origin: ORIGIN, 'content-type': 'application/json' }, body: { word: 'cat', drawingData: drawing, ...body } });

test('evaluate: validates the drawing, word, category, time and locale', async () => {
  withEnv();
  network();
  const e = await load('evaluate');
  for (const [body, code] of [
    [{ drawingData: 'data:image/png;base64,<script>' }, 400],
    [{ drawingData: 'x'.repeat(4_000_001) }, 400],
    [{ word: '' }, 400],
    [{ category: 'x'.repeat(61) }, 400],
    [{ drawingTime: -1 }, 400],
  ]) {
    const r = res();
    await e(judge(body), r);
    assert.equal(r.statusCode, code, JSON.stringify(body).slice(0, 60));
  }
  const r = res();
  await e(judge({ locale: 'xx' }), r);
  assert.equal(r.statusCode, 200);
  assert.equal(r.body.score, 80);
});

test('evaluate: limited before spending; template score without a key or on provider failure', async () => {
  withEnv();
  let calls = network({ limits: (b) => !b.startsWith('evaluate-min:') });
  let r = res();
  await (await load('evaluate'))(judge({}), r);
  assert.equal(r.statusCode, 429);
  assert.equal(calls.gemini, 0);

  calls = network({ gemini: () => ({ status: 500 }) });
  r = res();
  await (await load('evaluate'))(judge({ locale: 'de' }), r);
  assert.equal(r.statusCode, 200);
  assert.ok(r.body.score >= 0 && r.body.score <= 100 && typeof r.body.comment === 'string');

  delete process.env.GEMINI_API_KEY;
  calls = network();
  r = res();
  await (await load('evaluate'))(judge({}), r);
  assert.equal(r.statusCode, 200);
  assert.equal(calls.gemini, 0);
});

test('contact: foreign Origin refused; honeypot answers success without saving', async () => {
  const c = await load('contact');
  let r = res();
  await c(req({ headers: { origin: 'https://evil.example' }, body: { name: 'Ann', email: 'a@b.co', message: 'hello there friend' } }), r);
  assert.equal(r.statusCode, 403);

  // No Supabase env: had the handler tried to save, it would answer 500.
  r = res();
  await c(req({ headers: { origin: ORIGIN }, body: { name: 'Ann', email: 'a@b.co', message: 'hello there friend', website: 'spam' } }), r);
  assert.equal(r.statusCode, 201);
});

test('contact: a sixth message in a minute from one IP is refused', async () => {
  const c = await load('contact');
  const ip = freshIp();
  const codes = [];
  for (let i = 0; i < 6; i++) {
    const r = res();
    await c(req({ headers: { origin: ORIGIN, 'x-forwarded-for': ip }, body: { name: 'A' } }), r);
    codes.push(r.statusCode);
  }
  assert.deepEqual(codes, [400, 400, 400, 400, 400, 429]);
});

test('github: an upstream error is reported as an error, not passed on as data', async () => {
  network();
  const r = res();
  await (await load('github'))(req({ method: 'GET', headers: { 'sec-fetch-site': 'same-origin' }, query: { endpoint: '/users/MOT1209' } }), r);
  assert.equal(r.statusCode, 502);
  assert.deepEqual(r.body, { error: 'GitHub API unavailable' });
});

test('no public function holds its own copy of the rate limiter or origin list', async () => {
  const fs = await import('node:fs');
  for (const name of ['gemini', 'evaluate', 'contact', 'github']) {
    const src = fs.readFileSync(new URL(`../api/${name}.js`, import.meta.url), 'utf8');
    assert.ok(!/const hits = new Map/.test(src), `${name}: local limiter`);
    assert.ok(!/ALLOWED_ORIGINS\s*=/.test(src), `${name}: local origin list`);
  }
});
