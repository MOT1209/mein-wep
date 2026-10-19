// Guards the served surface. `npm run verify` only proves dist/ matches the
// exclusion lists; this checks the lists themselves still keep internal files
// out and real pages in. Needs a build first (`npm run build`); skipped if
// dist/ is missing so `npm test` still works on a fresh checkout.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const built = existsSync('dist/index.html');

const MUST_NOT_SERVE = [
  '.claude', '.github', '.vscode', '.agents', '.opencode', '.testsprite',
  'CLAUDE.md', 'README.md', 'SUPABASE_MIGRATIONS.md', 'db', 'render.yaml',
  'skills-lock.json', 'package.json', 'eleventy.config.mjs', 'tests',
  'apps/chat-app', 'king-colab-MCP', 'linguaverse', 'denkmalen',
  'روابط-الإدارة.txt', 'تقرير-مراجعة-المشروع.html',
  'api', 'scripts', 'vercel.json', 'games/kingcraft1',
];

const MUST_SERVE = [
  'index.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html',
  '404.html', 'sitemap.xml', 'robots.txt', 'llms.txt', 'okf/index.md',
  'blog/posts.json', 'src/js/main.js', 'js/vendor/supabase-2.117.2.js',
];

test('dist/ contains no internal files', { skip: !built && 'run npm run build first' }, () => {
  const leaked = MUST_NOT_SERVE.filter((p) => existsSync(`dist/${p}`));
  assert.deepEqual(leaked, []);
});

test('dist/ still contains the public pages', { skip: !built && 'run npm run build first' }, () => {
  const missing = MUST_SERVE.filter((p) => !existsSync(`dist/${p}`));
  assert.deepEqual(missing, []);
});
