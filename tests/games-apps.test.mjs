// Games and apps share one origin with the site: their service workers and
// pages must not wipe each other's caches, and the Android packaging must
// carry every shared script a page loads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { rewriteSharedRefs } from '../scripts/copy-to-www.mjs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const WORKERS = ['sw.js', 'games/kingcraft-game/sw.js', 'games/farm-game/sw.js', 'games/rust-game/sw.js',
  'apps/calculator-app/sw.js', 'apps/quiz-app/sw.js'];

test('each service worker deletes only its own old caches', () => {
  for (const f of WORKERS) {
    const src = read(f);
    const name = src.match(/const CACHE(?:_NAME)?\s*=\s*['"]([^'"]+)['"]/)?.[1];
    assert.ok(name, `${f}: cache name`);
    // The cleanup must test a prefix (startsWith or an anchored pattern) that the current name matches.
    const prefix = src.match(/startsWith\(\s*['"]([^'"]+)['"]\s*\)/)?.[1];
    const pattern = src.match(/\/\^\(([^)]+)\)\/\.test\(/)?.[1];
    assert.ok(prefix || pattern, `${f}: cleanup is not limited to this app's caches`);
    if (prefix) assert.ok(name.startsWith(prefix), `${f}: ${name} does not start with ${prefix}`);
    if (pattern) assert.ok(new RegExp(`^(${pattern})`).test(name), `${f}: ${name} does not match ${pattern}`);
  }
});

test('no served game or app page unregisters every service worker of the site', () => {
  const files = execFileSync('git', ['ls-files', 'games', 'apps'], { encoding: 'utf8' }).split('\n')
    .filter((f) => /\.(html|js)$/.test(f) && !/^games\/(kingcraft1|rust-game\/rust-1)\/|^apps\/(chat-app|wordking)\//.test(f));
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    // Unregistering is fine only for a filtered list (this app's own scope).
    assert.ok(!/getRegistrations\(\)(?![\s\S]{0,20}\.filter\()[\s\S]{0,200}\.unregister\(\)/.test(src), `${f} unregisters all service workers`);
  }
});

test('each game and app loads one update checker, after its RASHID_APP config', () => {
  for (const f of ['games/kingcraft-game/index.html', 'games/farm-game/index.html', 'games/rust-game/index.html',
    'apps/calculator-app/index.html', 'apps/quiz-app/index.html']) {
    const html = read(f);
    const checkers = [...html.matchAll(/<script[^>]+update-checker\.js/g)];
    assert.equal(checkers.length, 1, `${f}: ${checkers.length} update checkers`);
    assert.ok(html.indexOf('window.RASHID_APP') > -1 && html.indexOf('window.RASHID_APP') < checkers[0].index, `${f}: config after checker`);
  }
});

test('Android packaging rewrites shared scripts, also in sub-folders, and never climbs out of js/', () => {
  const { html, files } = rewriteSharedRefs([
    '<script src="../../js/vendor/admob.js"></script>',
    '<script src="../../js/unified-game-controls.js"></script>',
    '<script src="../../js/unified-game-controls.js"></script>',
    '<script src="../../js/../secrets.js"></script>',
  ].join(''));
  assert.deepEqual(files, ['vendor/admob.js', 'unified-game-controls.js']);
  assert.ok(html.includes('src="js/vendor/admob.js"') && html.includes('src="js/unified-game-controls.js"'));
  assert.ok(html.includes('src="../../js/../secrets.js"'), 'a ".." path is left alone, not copied');
  for (const f of files) assert.ok(fs.existsSync(new URL(`../js/${f}`, import.meta.url)), `js/${f} exists`);
});

test('the calculator vault keeps its code hashed, and does not claim to store files it does not', () => {
  const app = read('apps/calculator-app/js/app.js');
  assert.ok(!/localStorage\.setItem\(\s*['"]vaultPassword['"]\s*,\s*input/.test(app), 'code stored as plain text');
  assert.match(app, /crypto\.subtle\.digest\('SHA-256'/);
  assert.ok(!/تمت إضافة/.test(app), 'no "files added" message for files that are not stored');
});
