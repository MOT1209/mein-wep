# MYON WEB 2.0 — Phase 02 Report: Repair, Security Hardening and Cleanup

- **Date:** 2026-11-13
- **Branch:** `feature/myon-web-phase-02-repair`, based on `main` at `1280aca`
- **Status:** complete locally; **not merged, not deployed**, and the database migration is **not applied to production**.

Status labels: **FIXED** (done and verified locally), **PARTIALLY FIXED**, **NOT FIXED**, and **NEEDS PRODUCTION VERIFICATION** (done in the code; production must still be applied or checked).

## 1. Executive summary

The three highest-risk Phase 01 findings are fixed in code and covered by tests:
- the legacy `models` table that any signed-in user could write;
- Gemini endpoints whose only protection was a spoofable Origin and per-instance limits;
- a dormant workflow that would leak the Android signing credentials.

The site-wide CSP is narrower, and **a real production break was found and fixed**: the CSP blocked rust-game's three.js modules, so the web version of that game could not load its 3D engine. `/learning.html` dropped from 221 KB to 10 KB of JavaScript. Legacy pages now load the minified stylesheet once instead of the full one (twice on four vault pages), with pixel-identical results.

Tests went from **130 to 157**, all passing. No new npm dependency was added; the only new third-party file is the vendored Chart.js that a page already used. The database fix takes effect only after the owner runs the new migration in Supabase.

## 2. Files modified

| Area | Files |
|---|---|
| Database | `supabase/migrations/20261113120000_legacy_rls_hardening.sql` (new), `db/SUPABASE_SECURITY_FIX.sql`, `SUPABASE_MIGRATIONS.md` |
| API | `api/_lib/public-api.js` (new), `api/gemini.js`, `api/evaluate.js`, `api/contact.js`, `api/github.js`, `api/rss.js` |
| CI/CD | `.github/workflows/ci.yml`, `.github/workflows/apk-build.yml`, `package.json`, `scripts/lint.mjs` (new), `.gitignore` |
| Headers | `vercel.json` (site-wide CSP) |
| Pages | `models/Rashid-Model/index.html`, `js/vendor/chart-4.6.1.umd.min.js` (new), `learning.njk`, `js/learning.js`, `js/supabase-config.js`, `devos.html`, `vault/{api,archive,code,docs,media,prompts}/index.html` |
| Tests (new) | `tests/db-legacy.test.mjs`, `tests/public-api.test.mjs`, `tests/csp.test.mjs`, `tests/pages.test.mjs` |
| Docs | `docs/PHASE-02-REPORT.md`, `docs/SECURITY.md`, `docs/DEPLOYMENT.md` (new); `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT_GUIDE.md` (updated) |

## 3. Files removed and why each is safe

| File | Why it was removed | Why removing it is safe |
|---|---|---|
| `.github/workflows/setup-keystore.yml` | Took keystore passwords as plain inputs, echoed them to the log and uploaded the `.jks` as an artifact | Never run (GitHub API: 0 runs); nothing references it; the local `keytool` procedure is in `docs/DEPLOYMENT.md` |
| `.github/workflows/deploy.yml` | Manual GitHub Pages deploy that uploads the whole repo root (`path: '.'`) | The site is served by Vercel; the file said it was archived; no references |
| `mcp/colab-mcp/__pycache__/*.pyc` (3) | Generated Python bytecode in git | Untracked only (`git rm --cached`; still on disk); `mcp/` is excluded from `dist/`; now ignored |
| Inside `models/Rashid-Model/index.html`: `js.puter.com` and `supabase-js@2` tags | Unused | No code in `script.js` uses puter or Supabase; puter was already blocked by the CSP |
| Inside `.github/workflows/ci.yml`: the `prod-smoke` job | Ran `.testsprite/*.py`, which is not tracked | It could only fail; live smoke checks are done on request (CLAUDE.md) |

## 4. Security vulnerabilities fixed

| Phase 01 ID | Issue | Status | Evidence |
|---|---|---|---|
| S-01 HIGH | `models` writable by any signed-in user | **FIXED** in code, **NEEDS PRODUCTION VERIFICATION** | `tests/db-legacy.test.mjs`: the hole reproduces without the migration (test 1) and the protection tests fail when the migration is removed; with it, 8/8 pass |
| S-09 LOW | Private `projects` rows readable by any signed-in user | **FIXED**, **NEEDS PRODUCTION VERIFICATION** | same test file, "public rows stay readable; private rows only for the admin" |
| S-10 LOW | `increment_visitor_count` without `search_path` | **FIXED**, **NEEDS PRODUCTION VERIFICATION** | migration step 5. Correction to Phase 01: `db/SUPABASE_FUNCTION_SEARCH_PATH.sql` does **not** cover this function |
| S-02 MEDIUM | Gemini proxies: spoofable Origin, per-instance limits | **FIXED** (shared limits need the rate-limit migration live: **NEEDS PRODUCTION VERIFICATION**) | `tests/public-api.test.mjs` tests 1–6, 8 |
| S-03 MEDIUM | Keystore workflow could leak credentials | **FIXED** | workflow deleted |
| S-05 MEDIUM | Broad CSP | **PARTIALLY FIXED**: hosts narrowed, directives added; `'unsafe-inline'` remains (staged plan in `docs/SECURITY.md`) | violation harness, `tests/csp.test.mjs` |
| S-06 LOW | Unpinned CDN scripts on Rashid AI | **FIXED** | Chart.js vendored at the resolved version 4.6.1; unused tags removed |
| S-08 LOW | Contact spam limits per instance only | **PARTIALLY FIXED**: shared limits added; direct anon REST insert still allowed (removing it needs an RPC plus a coordinated deploy) | `tests/public-api.test.mjs` tests 9–10 |
| S-04 MEDIUM | `/king2`, `/auth/*`, `/api/auth/*` rewrites to another deployment on this origin | **NOT FIXED**: needs your decision (remove or move to a subdomain) | — |
| S-07 LOW | Legacy dashboard needs `'unsafe-inline'` on `/admin/*` | **NOT FIXED** (kept by agreement) | — |
| S-11 INFO | `deploy.yml` | **FIXED** (removed) | — |
| S-12 INFO | tracked `.pyc` | **FIXED** | — |
| *new* | Contact form fallback to formsubmit.co was blocked by the CSP | **FIXED** (`connect-src` and `form-action` allow it) | static check of `contact.html` plus the CSP |
| *new* | `/api/github` passed GitHub errors on as data with status 200 | **FIXED** (502) | `tests/public-api.test.mjs` test 11 |
| *new* | `js/learning.js` would open any `content_url`, including `javascript:` | **FIXED** (https or site-relative only) | Playwright run with a mocked API |
| *new* | `db/SUPABASE_SECURITY_FIX.sql` failed on a fresh database | **FIXED** | replay in `tests/db-legacy.test.mjs` |

## 5. Supabase policy changes

`supabase/migrations/20261113120000_legacy_rls_hardening.sql` covers only the tables that exist: `projects`, `models`, `vault_items`, `lessons`, `bot_knowledge`, `prompts`, `codes`, `images`, `media`, `app_updates` (and `site_stats` for steps 1, 2 and 4). It:

1. enables RLS;
2. drops the known over-broad policies by name: `"Admins can view all models"`, `"Admins can insert/update/delete models"`, `"Admins can view all projects"`, `"Admins can view all vault items"`, `"Authenticated users can read all vault items"` and `"Admins can manage knowledge"`;
3. drops **any** other permissive INSERT, UPDATE, DELETE or ALL policy whose condition is the constant `true`, which catches drift on the live database;
4. creates `legacy_admin_insert`, `legacy_admin_update` and `legacy_admin_delete` (`is_admin()`), and `legacy_read` (`status = 'Public' or is_admin()`; all rows for `app_updates` and `bot_knowledge`, which are public by design);
5. revokes INSERT, UPDATE, DELETE and TRUNCATE from `anon`;
6. sets `search_path = ''` on `increment_visitor_count()`.

Not touched: the `contact_messages` insert (the form needs it), the farm-game per-user tables, `admin_users`, and storage (already admin-only).

The migration is safe to re-run (tested twice in a row). Rollback notes are at the end of the file. It does not restore the dropped policies, on purpose.

Service-role key: none exists in the code, in client bundles or in the functions (lint rule added).

## 6. AI API improvements

- One shared guard, `api/_lib/public-api.js`, replaces four copies of the limiter and the origin list.
- Limits: 10/min and 100/day per IP for `/api/gemini`; 20/min and 200/day for `/api/evaluate`; a site-wide `GEMINI_DAILY_LIMIT` (default 500) shared by both. These are counted in Postgres across instances, with hashed IPs. A per-instance limit always applies.
- JSON-only bodies, `415` otherwise. Prompts: a non-empty string of at most 8000 characters. Drawings: base64 PNG, JPEG or WebP of about 4 MB at most. Word, category, time and locale are validated.
- 20 s timeout. `504` on timeout and `502` on provider errors, with a generic message. Provider details go to the log only.
- `/api/gemini` returns only `{ candidates: [{ content: { parts: [{ text }] } }] }`, the exact path both clients read (`models/Rashid-Model/script.js:260`, `js/rashid-ai-v2.js:448`).
- `/api/evaluate` was kept (by agreement) and still answers with a template score when the key is missing or Gemini fails.
- The key stays server-side (`GEMINI_API_KEY`); `js/gemini-config.js` holds only the proxy path.

## 7. CI/CD improvements

- Removed `setup-keystore.yml` and `deploy.yml`, and the broken `prod-smoke` job.
- `apk-build.yml`:
  - dropped the unused `id-token: write`;
  - added a step that deletes the decoded keystore from the runner (`if: always()`);
  - unchanged otherwise: triggers stay `push` to `main` and manual dispatch (no `pull_request`), secrets come through env and GitHub masks them, and publishing still requires `apksigner verify`.
  - **Not run** in this phase: a run publishes files.
- `ci.yml`: added `npm run lint` and `npm audit --audit-level=high`.
- The safe signing procedure is in `docs/DEPLOYMENT.md`.

## 8. Performance (measured locally)

Method: `dist/` served locally and loaded in Chromium at 375 px; first-party bytes are uncompressed file sizes. Live-site timings could not be measured: the network policy blocks the production host.

| Page | Before | After |
|---|---|---|
| `/learning.html` JS | 221 KB (supabase-js 218 KB, 55 KB gzip) | **10 KB** |
| `/vault/code/`, `/vault/media/`, `/vault/prompts/`, `/vault/archive/` CSS | `style.css` 107 KB, **requested twice** (two URLs) | `style.min.css` 102 KB, once |
| `/vault/docs/`, `/vault/api/` CSS | 107 KB | 102 KB |
| `/devos.html` CSS | 118 KB | 113 KB |
| `/models/Rashid-Model/` | Chart.js from jsDelivr (third-party, unpinned) | the same file self-hosted (~205 KB); total bytes unchanged, one fewer third-party connection |

Visual check: full-page screenshots of the 7 legacy pages at 375 px and 1280 px are **pixel-identical** before and after the stylesheet switch (14 of 14).

Not done in this phase (documented in `docs/audit/PHASE-02-REPAIR-PLAN.md`): asset fingerprinting with long cache lifetimes, moving APKs and audio out of the deploy (it changes published URLs), and replacing Font Awesome.

## 9. Tests executed (exact results)

| Command | Result |
|---|---|
| `npm ci` | OK |
| `npm run lint` | `lint: 106 files OK` (a probe file with a syntax error made it fail as expected) |
| `npm run build` | OK |
| `npm run verify` | `URL-surface PARITY OK — 418 expected, 418 in dist/` (+1: the vendored Chart.js) |
| `npm test` | **157 tests, 157 pass, 0 fail, 0 skipped** (130 before) |
| `npm audit` | 0 vulnerabilities |

New tests:
- `tests/db-legacy.test.mjs` (8): legacy SQL replay; anon, non-admin and admin.
- `tests/public-api.test.mjs` (12): forged origin, shared, daily and site limits, timeouts, no provider leakage, validation, per-instance fallback.
- `tests/csp.test.mjs` (4).
- `tests/pages.test.mjs` (3).

**Mutation checks:** without the new migration, 4 of the 8 legacy-RLS tests fail; against the old `vercel.json`, all 4 CSP tests fail.

Browser checks:
- **CSP violation harness:** a local server applying the real `vercel.json` headers, with Playwright on 25 pages. Before: 3 violations; after: 0.
- **Learning page** with a mocked API: rendering, empty and error states, an XSS payload shown as text, a `javascript:` link refused.
- **Chart.js** loads (`Chart.version` = 4.6.1).
- **Note:** this environment blocks third-party hosts, so fonts and icons do not render in screenshots.

## 10. Remaining issues

| Issue | Status | Next step |
|---|---|---|
| Migrations not applied to the live database | NEEDS PRODUCTION VERIFICATION | the owner runs the files in `docs/DEPLOYMENT.md` order, then the `pg_policies` check in `docs/SECURITY.md` |
| Shared limits depend on `20261104090000_rate_limits.sql` being live | NEEDS PRODUCTION VERIFICATION | same; until then per-instance limits apply (fail open, logged) |
| `'unsafe-inline'` in the site-wide `script-src` | NOT FIXED (staged plan) | move layout inline scripts to files, then per-route strict CSP |
| `/king2`, `/auth/*`, `/api/auth/*` same-origin rewrites | NOT FIXED | your decision: remove, or move king2 to its own domain |
| Direct anon insert into `contact_messages` | PARTIALLY FIXED | RPC with its own limit, and the API switched to it, deployed together |
| Legacy admin dashboard (`'unsafe-inline'` on `/admin/*`) | NOT FIXED (kept by agreement) | migrate the vault, lessons, models and bot views to `admin/app` |
| `render.yaml` points at `games/denkmalen-game`, which was never in the repo | NOT FIXED | your decision: a Render service may be linked to it, so it was not touched |
| Four Supabase client set-ups in `src/js/*` and `js/` | NOT FIXED | all are referenced (service-worker precache, games, legacy modules); consolidate when those pages are migrated |
| APKs (31 MB) and audio (7 MB) in git and in every deploy | NOT FIXED | move to Releases or a CDN with redirects (changes published URLs) |
| ESLint and type checking | NOT FIXED (no new dependencies) | `// @ts-check` with a dev-only `typescript` if wanted |
| `quran.html` has a `<meta>` CSP | NOT FIXED | harmless (narrows only); remove when the page is migrated |

## 11. Production verification status

Nothing was deployed or merged, and no SQL was run against Supabase. **None of the changes are verified in production.** Everything above is verified locally: unit, PGlite and browser tests against the local build.

## 12. Dependencies and blockers

- **No database credentials:** RLS is verified on PGlite with Supabase-like roles and default grants, not on the live project.
- **No network access to the production host:** live headers, CSP behaviour with real third parties (AdSense, GTM, fonts) and Core Web Vitals are unverified.
- **APK workflow not run** (it publishes files).
- **npm dependencies:** none added or upgraded (`npm audit`: 0). New vendored file: `js/vendor/chart-4.6.1.umd.min.js` (MIT), identical to the npm package's `dist/chart.umd.min.js`.

## 13. Git

Branch `feature/myon-web-phase-02-repair`, one commit per priority:

| Commit | Scope |
|---|---|
| `9ece3a4` | fix(db): close open write policies on the legacy tables |
| `dbbb25f` | fix(api): shared abuse limits and safer errors on the public functions |
| `450028e` | ci: remove workflows that could leak signing keys or publish the repo |
| `0e8ef83` | fix(csp): narrow the site-wide policy and unblock rust-game's three.js |
| `0a5db2d` | perf: learning page without supabase-js; legacy pages on the minified CSS |
| `ab771e1` | ci: dependency-free lint step; rss logs instead of failing silently |
| (this commit) | docs: Phase 02 report, SECURITY, DEPLOYMENT, ARCHITECTURE |

## 14. Recommended next steps

1. Review the branch and its pull request; merge only after your approval (a merge deploys).
2. After the merge, apply the three migrations in Supabase, run the `pg_policies` check, and confirm `/api/gemini` and the contact form on the live site. Set `RATE_LIMIT_SALT` and, if wanted, `GEMINI_DAILY_LIMIT`.
3. Load `/games/rust-game/` on the live site and confirm the 3D view now loads.
4. Decide on the `/king2` rewrites and `render.yaml`.
5. Then plan Phase 03. It has not been started.
