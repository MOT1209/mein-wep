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
  const count = (html.match(/data-copy="[0-9a-f]{64}"/g) || []).length;
  assert.equal(count, Object.keys(manifest.apps).length);
  assert.doesNotMatch(html, /Building\.\.\.|Pending first build/);
});
