// Every page on the shared shell must ship a working mobile menu: the
// trigger, the menu it controls, and the script that wires them. Before this
// test the homepage and most secondary pages rendered a menu button that did
// nothing. Needs `npm run build` first; skipped otherwise.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const built = existsSync('dist/index.html');
const skip = !built && 'run npm run build first';

const SHELL_PAGES = [
  'index.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html',
  '404.html', 'downloads.html', 'learning.html',
  'de/index.html', 'de/about.html', 'de/contact.html',
  'ar/index.html', 'ar/about.html', 'ar/contact.html',
  ...(built ? readdirSync('dist/blog').filter((f) => f.endsWith('.html')).map((f) => `blog/${f}`) : []),
];

const read = (p) => readFileSync(`dist/${p}`, 'utf8');

test('shell pages wire a mobile menu to js/site-nav.js', { skip }, () => {
  for (const page of SHELL_PAGES) {
    const html = read(page);
    const control = html.match(/data-menu-open[^>]*aria-controls="([^"]+)"|aria-controls="([^"]+)"[^>]*data-menu-open/);
    assert.ok(control, `${page}: no [data-menu-open] trigger`);
    const id = control[1] || control[2];
    assert.match(html, new RegExp(`id="${id}"[^>]*data-menu|data-menu[^>]*id="${id}"`), `${page}: menu #${id} missing`);
    assert.match(html, /src="[^"]*js\/site-nav\.js/, `${page}: site-nav.js not loaded`);
  }
});

test('migrated pages no longer load the legacy stylesheet', { skip }, () => {
  for (const page of SHELL_PAGES) {
    assert.doesNotMatch(read(page), /href="[^"]*css\/style(\.min)?\.css/, page);
  }
});

test('homepage carries no fabricated testimonials', { skip }, () => {
  const src = readFileSync('src/js/modules/enhancements.js', 'utf8');
  assert.doesNotMatch(src, /User Feedback|Abdullah S\.|Maximilian G\.|Youssef H\./);
});

test('downloads show build-time SHA-256 for every release', { skip }, () => {
  const html = read('downloads.html');
  const manifest = JSON.parse(readFileSync('apks/updates.json', 'utf8'));
  const hidden = new Set(JSON.parse(readFileSync('_data/studioCatalog.json', 'utf8')).projects
    .filter((p) => p.hidden && p.apkId).map((p) => p.apkId));
  const count = (html.match(/data-copy="[0-9a-f]{64}"/g) || []).length;
  assert.equal(count, Object.keys(manifest.apps).filter((id) => !hidden.has(id)).length);
  assert.doesNotMatch(html, /Building\.\.\.|Pending first build/);
});

// The homepage is static HTML rendered from the same data as King Studio and
// the blog. It used to fetch projects from Supabase on top of a hand-written
// fallback list that drifted from apks/updates.json, and it carried an AI
// widget, an ad slot and a keyboard shortcut to the admin login.
test('homepage renders its projects and posts from build-time data', { skip }, () => {
  const html = read('index.html');
  const catalog = JSON.parse(readFileSync('_data/studioCatalog.json', 'utf8')).projects;
  const featured = catalog.filter((p) => p.featured && !p.hidden && (p.section === 'games' || p.section === 'apps'));
  assert.ok(featured.length > 0);
  for (const p of featured) {
    assert.match(html, new RegExp(`href="king-studio/${p.section}/${p.id}/"`), `${p.id} missing from homepage`);
  }
  const posts = JSON.parse(readFileSync('blog/posts.json', 'utf8'))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  for (const post of posts) {
    assert.match(html, new RegExp(`href="blog/${post.id}\\.html"`), `${post.id} missing from homepage`);
  }
  assert.doesNotMatch(html, /Offline Mode|id="gaming-grid"/);
});

test('homepage ships no AI widget, ads, Supabase or admin shortcut', { skip }, () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /voice-widget|rashid-ai-v2|gemini-config/);
  assert.doesNotMatch(html, /adsbygoogle|googlesyndication/);
  assert.doesNotMatch(html, /src="[^"]*supabase[^"]*\.js/i);
  assert.doesNotMatch(html, /admin\/login/);
  assert.doesNotMatch(html, /src\/js\/main\.js/);
});

// About and Contact are where people who want to hire Rashid end up: no ads
// there, and so no cookie banner either (nothing on them sets a cookie).
test('About and Contact carry no ads or cookie banner', { skip }, () => {
  for (const page of ['about.html', 'contact.html']) {
    const html = read(page);
    assert.doesNotMatch(html, /adsbygoogle|googlesyndication/, `${page}: ads`);
    assert.doesNotMatch(html, /id="cookie-consent"/, `${page}: cookie banner`);
  }
});
