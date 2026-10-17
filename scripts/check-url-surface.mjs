import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { TEMPLATE_OUTPUTS } from './site-templates.mjs';

/**
 * URL-surface parity gate.
 *
 * The deployed surface MUST be identical to today's served surface:
 *   expected = `git ls-files` trees minus .vercelignore exclusions
 *              minus the F13 config/tooling files that must not be served.
 *   actual   = every file actually present in dist/.
 *
 * Fails (exit 1) if anything expected is missing from dist/ or if dist/
 * contains anything that is not expected.
 */

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

// Files that exist locally for the build but must never be served.
const NOT_SERVED = [
  /^dist\//,
  /^node_modules\//,
  /^package(?:-lock)?\.json$/,
  /^eleventy\.config\.mjs$/,
  /^\.eleventyignore$/,
  /^_data\//,
  /^_includes\//,
  /^tests\//,
  /^scripts\/check-url-surface\.mjs$/,
  /^scripts\/site-templates\.mjs$/,
];

// Mirror .vercelignore exclusion patterns applied to the git-tracked tree.
// Kept in sync with VERCEL_IGNORE in eleventy.config.mjs.
const VERCEL_IGNORE = [
  /\/android\//,
  /\/\.gradle\//,
  // See the matching comment in eleventy.config.mjs: apks/*.apk is the
  // intentional public release folder, not stray android build output.
  /\.aab$/,
  /\.jks$/,
  /\.keystore$/,
  /keystore\.properties$/,
  /\/node_modules\//,
  /\/dist\//,
  /\/www\//,
  /\/\.idea\//,
  /\.log$/,
  /^\.agents\//,
  /^\.opencode\//,
  /^\.testsprite\//,
  /^linguaverse\//,
  /^denkmalen\//,
  /^mcp\//,
  /^notebooks\//,
  /^tools\//,
  /^agents\//,
  /^docs\//,
  /^\.pi\//,
  // Internal docs, tooling config, DB schema and unrelated backends — never
  // linked from any page. Root-level *.md only: okf/*.md is served on purpose.
  /^\.claude\//,
  /^\.github\//,
  /^\.vscode\//,
  /^[^/]+\.md$/,
  /^apks\/[^/]+\.md$/,
  /^db\//,
  /^render\.yaml$/,
  /^skills-lock\.json$/,
  /^king-colab-MCP\//,
  /^apps\/chat-app\//,
  /^روابط-الإدارة\.txt$/,
  /^تقرير-مراجعة-المشروع\.html$/,
  /__pycache__\//,
  /\.pyc$/,
];

function walk(dir, base = '', out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.join(base, e.name).replace(/\\/g, '/');
    if (e.isDirectory()) walk(full, rel, out);
    else out.push(rel);
  }
  return out;
}

function isExcluded(p) {
  for (const rule of [...NOT_SERVED, ...VERCEL_IGNORE]) {
    if (rule.test(p)) return true;
  }
  return false;
}

// `-z` + null-byte splitting: see the matching comment in
// eleventy.config.mjs — plain `git ls-files` octal-escapes non-ASCII
// filenames, which breaks comparison against the real paths on disk.
const tracked = execSync('git ls-files -z', { cwd: ROOT, encoding: 'utf8' })
  .split('\0')
  .map((l) => l.trim())
  .filter(Boolean)
  .filter((p) => !isExcluded(p))
  // git knows a page as `index.njk`; dist/ contains the rendered `index.html`.
  // Compare like for like. See scripts/site-templates.mjs.
  .flatMap((p) => TEMPLATE_OUTPUTS[p] ?? p);

const actual = walk(DIST).filter((p) => !isExcluded(p));

const missing = tracked.filter((p) => !actual.includes(p));
const extra = actual.filter((p) => !tracked.includes(p));

let ok = true;

if (missing.length) {
  ok = false;
  console.error('MISSING from dist/ (would 404 after flip):');
  for (const m of missing) console.error('  - ' + m);
}

if (extra.length) {
  ok = false;
  console.error('EXTRA in dist/ (would be newly served):');
  for (const e of extra) console.error('  + ' + e);
}

if (ok) {
  console.log(`URL-surface PARITY OK — ${tracked.length} expected, ${actual.length} in dist/.`);
} else {
  console.error(`URL-surface MISMATCH — ${tracked.length} expected vs ${actual.length} in dist/.`);
  process.exit(1);
}