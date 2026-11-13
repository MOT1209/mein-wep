// Regression guards for page-level fixes made in Phase 02.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('learning page reads lessons with one fetch, not the 218 KB supabase-js bundle', () => {
  const page = read('learning.njk');
  assert.ok(!page.includes('supabase-2.117.2.js'), 'learning.njk must not load the full client');
  const js = read('js/learning.js');
  assert.ok(js.includes('/rest/v1/lessons'), 'reads PostgREST directly');
  assert.ok(!/innerHTML/.test(js), 'renders with textContent only');
  assert.match(js, /safeLessonUrl/, 'lesson links are filtered (no javascript: URLs)');
});

test('legacy pages load the minified legacy stylesheet exactly once', () => {
  for (const f of ['devos.html', 'vault/api/index.html', 'vault/archive/index.html', 'vault/code/index.html',
    'vault/docs/index.html', 'vault/media/index.html', 'vault/prompts/index.html']) {
    const html = read(f);
    assert.equal((html.match(/css\/style\.min\.css/g) || []).length, 1, f);
    assert.ok(!/css\/style\.css/.test(html), `${f} still links the unminified file`);
  }
});

test('Rashid AI loads no unpinned CDN scripts', () => {
  const html = read('models/Rashid-Model/index.html');
  assert.ok(!html.includes('cdn.jsdelivr.net'));
  assert.ok(!html.includes('js.puter.com'));
  assert.ok(html.includes('/js/vendor/chart-4.6.1.umd.min.js'));
});
