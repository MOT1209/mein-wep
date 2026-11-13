#!/usr/bin/env node
/**
 * Dependency-free static checks for the first-party JavaScript (npm run lint).
 *
 * 1. Syntax: every tracked .js/.mjs file under the site's own folders must
 *    parse (node --check), so a typo cannot reach production.
 * 2. Server rules for api/: no secret-shaped literals and no use of a
 *    service-role key (the admin API is designed to run without one).
 *
 * Games, apps and the other projects kept in this repository are excluded:
 * they are separate PWAs with their own builds (AGENTS.md rule 8).
 *
 * A full linter (ESLint) and type checking were not added in Phase 02 to
 * avoid new dependencies; see docs/ARCHITECTURE.md.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const ROOTS = ['api/', 'scripts/', 'js/', 'src/js/', 'admin/', 'tests/', '_data/', 'models/Rashid-Model/'];
const SKIP = [/^js\/vendor\//, /^scripts\/templates\//];

const files = execFileSync('git', ['ls-files', '-z', '--', ...ROOTS], { encoding: 'utf8' })
  .split('\0')
  .filter((f) => /\.(m?js)$/.test(f) && !SKIP.some((re) => re.test(f)) && fs.existsSync(f));

const problems = [];
for (const f of files) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) problems.push(`${f}: syntax error\n${(r.stderr || '').split('\n').slice(0, 4).join('\n')}`);
}

const SECRET = /(AIza[0-9A-Za-z_-]{35}|sk-(proj|ant)-[A-Za-z0-9_-]{10,}|AKIA[0-9A-Z]{16}|sb_secret_[A-Za-z0-9_-]{10,})/;
for (const f of files.filter((x) => x.startsWith('api/'))) {
  const src = fs.readFileSync(f, 'utf8');
  if (SECRET.test(src)) problems.push(`${f}: secret-shaped literal`);
  if (/SUPABASE_SERVICE_ROLE|service_role_key/i.test(src)) problems.push(`${f}: service-role key used in a function`);
}

if (problems.length) {
  console.error(problems.join('\n\n'));
  console.error(`\nlint: ${problems.length} problem(s) in ${files.length} files`);
  process.exit(1);
}
console.log(`lint: ${files.length} files OK`);
