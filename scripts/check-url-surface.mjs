import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

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
  /^_data\//,
  /^_includes\//,
  /^scripts\/check-url-surface\.mjs$/,
];

// Mirror .vercelignore exclusion patterns applied to the git-tracked tree.
const VERCEL_IGNORE = [
  /\/android\//,
  /\/\.gradle\//,
  /\.apk$/,
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

const tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' })
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)
  .filter((p) => !isExcluded(p));

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