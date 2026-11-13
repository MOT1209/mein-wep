// Guards the site-wide Content-Security-Policy in vercel.json:
//  * every third-party script the built pages load (script tags and import
//    maps) is allowed by script-src, so tightening the CSP cannot silently
//    break a page again (rust-game's three.js was blocked this way);
//  * the broad hosts removed in Phase 02 do not come back;
//  * baseline directives stay in place.
// Needs `npm run build` (skips without dist/), like tests/dist.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const DIST = path.join(ROOT, 'dist');
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const csp = vercel.headers.find((h) => h.source === '/(.*)').headers.find((h) => h.key === 'Content-Security-Policy').value;
const directives = Object.fromEntries(csp.split(';').map((d) => d.trim().split(/\s+/)).map(([k, ...v]) => [k, v]));

/** CSP source-expression match for an absolute https URL (host wildcard + path prefix). */
function allowed(url, sources) {
  const u = new URL(url);
  return sources.some((s) => {
    if (!s.startsWith('https://')) return false;
    const m = s.match(/^https:\/\/([^/]+)(\/.*)?$/);
    const [host, p = ''] = [m[1], m[2]];
    const hostOk = host.startsWith('*.') ? u.hostname.endsWith(host.slice(1)) : u.hostname === host;
    if (!hostOk) return false;
    if (!p || p === '/') return true;
    return p.endsWith('/') ? u.pathname.startsWith(p) : u.pathname === p;
  });
}

function htmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(f, out);
    else if (e.name.endsWith('.html')) out.push(f);
  }
  return out;
}

test('every third-party script in dist/ is allowed by script-src', { skip: !fs.existsSync(DIST) && 'run npm run build first' }, () => {
  const bad = [];
  for (const f of htmlFiles(DIST)) {
    if (f.includes(`${path.sep}admin${path.sep}`)) continue; // /admin has its own, stricter CSP
    const html = fs.readFileSync(f, 'utf8');
    const urls = [...html.matchAll(/<script[^>]+src="(https:\/\/[^"]+)"/g)].map((m) => m[1]);
    for (const m of html.matchAll(/<script[^>]+type="importmap"[^>]*>([\s\S]*?)<\/script>/g)) {
      urls.push(...Object.values(JSON.parse(m[1]).imports || {}).filter((u) => u.startsWith('https://')));
    }
    for (const u of urls) if (!allowed(u, directives['script-src'])) bad.push(`${path.relative(DIST, f)}: ${u}`);
  }
  assert.deepEqual(bad, []);
});

test('no broad or unused hosts in the site-wide CSP', () => {
  for (const host of ['*.vercel.app', '*.onrender.com', 'openrouter.ai', 'generativelanguage.googleapis.com', 'js.puter.com', "'unsafe-eval'"]) {
    assert.ok(!csp.includes(host), host);
  }
  assert.ok(!directives['script-src'].includes('https://cdn.jsdelivr.net'), 'jsDelivr only by exact package path');
  assert.ok(!directives['script-src'].includes('https://unpkg.com'), 'unpkg only by exact package path');
});

test('baseline directives are present', () => {
  assert.deepEqual(directives['object-src'], ["'none'"]);
  assert.deepEqual(directives['base-uri'], ["'self'"]);
  assert.deepEqual(directives['frame-ancestors'], ["'self'"]);
  assert.ok(directives['form-action']);
  assert.ok('upgrade-insecure-requests' in directives);
  const global = vercel.headers.find((h) => h.source === '/(.*)').headers;
  const get = (k) => global.find((h) => h.key === k)?.value;
  assert.equal(get('X-Content-Type-Options'), 'nosniff');
  assert.match(get('Strict-Transport-Security'), /max-age=31536000/);
  for (const feature of ['camera=()', 'microphone=()', 'geolocation=()', 'display-capture=()']) {
    assert.ok(get('Permissions-Policy').includes(feature), feature);
  }
});

test('the site-wide script-src never allows Supabase or any wildcard CDN to serve scripts', () => {
  assert.ok(!directives['script-src'].some((s) => s.includes('supabase.co')));
  assert.ok(!directives['script-src'].includes('https://cdnjs.cloudflare.com'));
});
