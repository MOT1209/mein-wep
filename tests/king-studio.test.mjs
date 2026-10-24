// King Studio output checks. Like dist.test.mjs these read the built dist/
// (run `npm run build` first; skipped otherwise). They prove every page was
// generated and that every internal link, image and download on those pages
// resolves to a file that is actually served.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const built = existsSync('dist/king-studio/index.html');
const skip = !built && 'run npm run build first';
// Hidden records stay in the data but get no page (see _data/kingStudio.js).
const allProjects = JSON.parse(readFileSync('_data/studioCatalog.json', 'utf8')).projects;
const catalog = allProjects.filter((p) => !p.hidden);

const PAGES = [
  'king-studio/index.html',
  'king-studio/games/index.html',
  'king-studio/apps/index.html',
  'king-studio/labs/index.html',
  ...catalog.map((p) => `king-studio/${p.section}/${p.id}/index.html`),
];

const read = (rel) => readFileSync(path.join('dist', rel), 'utf8');

// Resolve a relative href/src from a page to a file in dist/.
function resolves(page, ref) {
  const clean = ref.split('#')[0].split('?')[0];
  if (!clean) return true;
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(page), clean));
  if (target.startsWith('..')) return false;
  if (existsSync(path.join('dist', target)) && !target.endsWith('/')) return true;
  return existsSync(path.join('dist', target, 'index.html'));
}

test('every King Studio page is generated', { skip }, () => {
  assert.deepEqual(PAGES.filter((p) => !existsSync(`dist/${p}`)), []);
});

test('no template sources or data files leak into dist/', { skip }, () => {
  for (const p of ['king-studio/index.njk', 'king-studio/project.njk', '_data', '_includes']) {
    assert.equal(existsSync(`dist/${p}`), false, p);
  }
});

test('all internal links, images and scripts on King Studio pages resolve', { skip }, () => {
  const broken = [];
  for (const page of PAGES) {
    const html = read(page);
    for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const ref = m[1];
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref)) continue;
      if (!resolves(page, ref)) broken.push(`${page} -> ${ref}`);
    }
  }
  assert.deepEqual(broken, []);
});

test('no empty links or unfilled template output', { skip }, () => {
  for (const page of PAGES) {
    const html = read(page);
    assert.doesNotMatch(html, /href=""|src=""|undefined|\[object Object\]|{{|{%/, page);
  }
});

test('each page has a unique title, description and matching canonical', { skip }, () => {
  const titles = new Set();
  for (const page of PAGES) {
    const html = read(page);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title, `${page} title`);
    assert.equal(titles.has(title), false, `duplicate title: ${title}`);
    titles.add(title);
    assert.match(html, /<meta name="description" content="[^"]{20,}"/, page);
    const url = page.replace(/index\.html$/, '');
    assert.ok(html.includes(`<link rel="canonical" href="https://rashid-wep.vercel.app/${url}">`), `${page} canonical`);
  }
});

test('structured data is valid JSON and inline scripts are not injected from data', { skip }, () => {
  for (const page of PAGES) {
    const ld = read(page).match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];
    assert.ok(ld, `${page} json-ld`);
    const data = JSON.parse(ld);
    assert.equal(data['@type'], 'BreadcrumbList');
  }
});

test('every catalogue download is a real, served file', { skip }, () => {
  for (const p of catalog.filter((c) => c.apkId)) {
    const html = read(`king-studio/${p.section}/${p.id}/index.html`);
    const href = html.match(/href="([^"]+\.apk)" download/)?.[1];
    assert.ok(href, `${p.id} download link`);
    assert.ok(resolves(`king-studio/${p.section}/${p.id}/index.html`, href), `${p.id} apk`);
  }
});

test('projects without a launch URL render no Play/Open button', { skip }, () => {
  for (const p of catalog.filter((c) => !c.launchUrl)) {
    const html = read(`king-studio/${p.section}/${p.id}/index.html`);
    assert.doesNotMatch(html, />(?:Play now|Open)</, p.id);
    assert.match(html, /No public build is available yet/, p.id);
  }
});

test('homepage links to King Studio and keeps its canonical', { skip }, () => {
  const html = read('index.html');
  assert.match(html, /href="king-studio\/"/);
  assert.ok(html.includes('<link rel="canonical" href="https://rashid-wep.vercel.app/">'));
});

test('hidden projects have no page and appear on no listing', { skip }, () => {
  const hidden = allProjects.filter((p) => p.hidden);
  assert.ok(hidden.length > 0);
  const listings = ['index.html', 'king-studio/index.html', 'king-studio/games/index.html',
    'king-studio/apps/index.html', 'king-studio/labs/index.html', 'downloads.html'];
  for (const p of hidden) {
    assert.equal(existsSync(`dist/king-studio/${p.section}/${p.id}/index.html`), false, `${p.id}: page`);
    for (const page of listings) {
      assert.ok(!read(page).includes(`>${p.title}<`), `${p.id} listed on ${page}`);
    }
  }
  const redirects = JSON.parse(readFileSync('vercel.json', 'utf8')).redirects.map((r) => r.source);
  for (const p of hidden) {
    assert.ok(redirects.includes(`/king-studio/${p.section}/${p.id}/`), `${p.id}: redirect`);
  }
});
