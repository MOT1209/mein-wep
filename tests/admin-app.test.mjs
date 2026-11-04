// Static checks on the admin dashboard (admin/app): translations complete,
// no HTML injection sinks, nothing inline that the strict CSP would block.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const dir = new URL('../admin/app/', import.meta.url);
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
const src = Object.fromEntries(files.map((f) => [f, fs.readFileSync(new URL(f, dir), 'utf8')]));
const all = Object.values(src).join('\n');

// i18n.js touches localStorage at import time; give it a stub.
globalThis.localStorage ??= { getItem: () => null, setItem: () => {} };
const { DICTS } = await import('../admin/app/i18n.js');
const { PAGE_FIELDS } = await import('../admin/app/views-content.js').catch(() => ({ PAGE_FIELDS: null }));

test('all three languages have exactly the same keys and no empty text', () => {
  const keys = Object.keys(DICTS.en).sort();
  for (const l of ['ar', 'de']) {
    assert.deepEqual(Object.keys(DICTS[l]).sort(), keys, `${l} keys differ from en`);
    for (const [k, v] of Object.entries(DICTS[l])) assert.ok(String(v).trim(), `${l}.${k} is empty`);
  }
});

test('every literal t() key used by the dashboard exists', () => {
  const used = [...all.matchAll(/\bt\(\s*'([^']+)'/g)].map((m) => m[1]);
  assert.ok(used.length > 100);
  const missing = [...new Set(used)].filter((k) => !(k in DICTS.en));
  assert.deepEqual(missing, []);
});

test('keys built at runtime exist too', () => {
  const dynamic = [
    ...['overview', 'studio', 'github', 'categories', 'media', 'pages', 'navigation', 'blog', 'settings', 'security', 'activity'].map((k) => `nav.${k}`),
    ...['games', 'apps', 'labs'].map((k) => `section.${k}`),
    ...['Available', 'In Development', 'Experimental', 'Coming Soon'].map((k) => `status.${k}`),
    ...['en', 'de', 'ar'].map((k) => `lang.${k}`),
    ...['All', 'Public', 'Hidden', 'Trash'].map((k) => `studio.filter${k}`),
    ...['Pending', 'Approved', 'Other', 'Ignored'].map((k) => `github.tab${k}`),
    ...['draft', 'published', 'scheduled', 'trash'].map((k) => `blog.${k}`),
    ...['home', 'studio', 'about', 'contact', 'footer'].map((k) => `pages.${k}`),
    ...['c1', 'c2', 'c3', 'c4'].map((k) => `security.${k}`),
    ...['when', 'who', 'what', 'item'].map((k) => `activity.${k}`),
    ...['configDeployHook', 'configGithubToken', 'configCron'].map((k) => `overview.${k}`),
  ];
  if (PAGE_FIELDS) for (const fields of Object.values(PAGE_FIELDS)) for (const [k] of fields) dynamic.push(`pages.f.${k}`);
  const missing = dynamic.filter((k) => !(k in DICTS.en));
  assert.deepEqual(missing, []);
});

test('no HTML injection sinks in the dashboard code', () => {
  for (const [f, code] of Object.entries(src)) {
    assert.ok(!/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write|\beval\(|new Function\(/.test(code), f);
  }
});

test('dashboard page has no inline script, style or handlers and loads no third parties', () => {
  const html = fs.readFileSync(new URL('../admin/app.html', import.meta.url), 'utf8');
  assert.deepEqual(html.match(/<script(?![^>]*\bsrc=)[^>]*>/g) ?? [], []);
  assert.ok(!/\sstyle=|\son[a-z]+=/.test(html));
  assert.ok(!/https?:\/\/(?!rashid)/.test(html.replace(/xmlns="[^"]+"/g, '')), 'no external hosts');
  assert.match(html, /noindex/);
});

test('vercel.json serves the dashboard with a strict CSP', () => {
  const cfg = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const rule = cfg.headers.find((h) => h.source === '/admin/app.html');
  const csp = rule.headers.find((h) => h.key === 'Content-Security-Policy').value;
  assert.match(csp, /script-src 'self';/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.ok(!/unsafe-inline|unsafe-eval|googlesyndication/.test(csp));
});

test('the dashboard edits exactly the page texts the templates read', async () => {
  const cms = fs.readFileSync(new URL('../_data/cms.js', import.meta.url), 'utf8');
  const pages = JSON.parse(cms.match(/const PAGES = (\[[^\]]+\])/)[1].replace(/'/g, '"'));
  assert.deepEqual(Object.keys(PAGE_FIELDS).sort(), pages.sort());
  const tpl = ['_includes/pages/home.njk', '_includes/studio/index.njk', '_includes/partials/site-footer.njk',
    'about.njk', 'de/about.njk', 'ar/about.njk', 'contact.njk', 'de/contact.njk', 'ar/contact.njk']
    .map((f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')).join('\n');
  for (const [page, fields] of Object.entries(PAGE_FIELDS)) {
    for (const [k] of fields) {
      const prefix = { footer: 'cms.pages.footer[L].', about: 'CA.', contact: 'CC.' }[page] ?? 'C.';
      const used = tpl.includes(`${prefix}${k}`);
      assert.ok(used, `${page}.${k} is offered in the dashboard but no template reads it`);
    }
  }
});

test('sign-in leads to the new dashboard', () => {
  assert.match(fs.readFileSync(new URL('../admin/js/login.js', import.meta.url), 'utf8'), /DASHBOARD = '\/admin\/app\.html'/);
});
