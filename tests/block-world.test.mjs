// Block World is served as the vite build of games/kingcraft1
// (npm run build:block-world), never as its TypeScript source.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const DIR = new URL('../games/block-world/', import.meta.url);

test('Block World is the built game: relative asset paths that exist, no TypeScript source', () => {
  const html = fs.readFileSync(new URL('index.html', DIR), 'utf8');
  const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(assets.length, 'loads a built bundle');
  for (const a of assets) assert.ok(fs.existsSync(new URL(a.slice(2), DIR)), `${a} exists`);
  assert.ok(!/\/src\/main\.ts|(?:src|href)="\//.test(html), 'no source entry or root-absolute paths');
});

test('the build output holds only the page and its bundle', () => {
  const files = fs.readdirSync(DIR, { recursive: true }).map(String).map((f) => f.replace(/\\/g, '/')).sort();
  for (const f of files) assert.match(f, /^(index\.html|assets(\/[\w.-]+\.(js|css))?)$/, f);
});
