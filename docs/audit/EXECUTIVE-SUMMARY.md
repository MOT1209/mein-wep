# MYON WEB 2.0 — Phase 01 Audit: Executive Summary

- **Date:** 2026-11-13
- **Commit audited:** `612856d` (branch `claude/determined-wright-2c34sq`, same tree as `main` at the time)
- **Scope:** read-only. No application code, database, configuration or deployment was changed. The only files added are the reports in `docs/audit/`.
- **Legend used in all reports:** **[FACT]** is verified from code, a command or a measurement. **[ASSUMPTION]** could not be verified. **[RECOMMENDATION]** is an opinion or a proposal.

## A. Current condition

The project is a **static Eleventy 3 site with Vercel serverless functions and Supabase**. Its condition is **healthy and well-guarded at the core**, with **a large layer of legacy code and data around it**.

| Check (run in this audit) | Result |
|---|---|
| `npm ci` | OK, 2.5 s |
| `npm run build` | OK. 43 pages written, 374 files copied, 0.66 s for Eleventy |
| `npm run verify` (URL-surface gate) | `PARITY OK — 417 expected, 417 in dist/` |
| `npm test` | **130 tests, 130 pass, 0 fail, 0 skipped** (16.5 s) |
| `npm audit` | **0 vulnerabilities** |
| CI on `main` (GitHub Actions, last 5 runs) | all `success` |
| Linting / type checking | **not available**: the project has no linter, no TypeScript and no `tsconfig` |
| Live site (rashid-wep.vercel.app) | **not reachable from this session**: the network policy refused the connection |
| Live Supabase database | **not accessible**: no credentials. Audited from SQL files and a local PGlite replay |

## Architecture assessment

- **[FACT] Strong core.** The admin system (`api/admin/*`, `api/_lib/*`) uses HttpOnly cookies scoped to `/api/admin` and a CSRF check (Origin plus a custom header). Every request re-checks the session and the admin role. It needs no service-role key, so RLS stays the final authority. It also has shared database-backed rate limits, a deny-by-default table allow-list, uploads checked by their file bytes (magic numbers) and owner-only destructive actions. All of this is covered by tests.
- **[FACT] Strong build safety.** Only git-tracked files reach `dist/`, and `verify` fails if the set of served URLs changes. CI adds a secret scan.
- **[FACT] Two data models live side by side.** Legacy tables (`projects`, `models`, `vault_items`, `lessons`, `bot_knowledge`, …) come from hand-run SQL files in `db/`. The new versioned CMS (`supabase/migrations/`) adds `studio_projects`, `blog_posts` and others. There are also two admin UIs: `admin/dashboard.html` (legacy) and `admin/app.html` (new).
- **[FACT] Mixed frontend generations.** The legacy `css/style.css` is 109 KB, minified with conflicting `:root` blocks. There are 16 legacy modules in `src/js/modules/` and four separate Supabase client set-ups. The new pages run on `css/tokens.css`.
- **[RECOMMENDATION]** The core can carry new modules **without a rewrite**: Eleventy pages, `api/admin/[resource].js` handler groups, versioned migrations with RLS tests and i18n data files are all extensible. The limits are the Vercel Hobby cap of 12 functions (already worked around by routing everything through `[resource].js`), the lack of type checking and the legacy layer.

## Main strengths

1. A security-conscious admin and API design, with tests that prove the RLS rules on PGlite (`tests/db.test.mjs`).
2. A deploy safety net: the URL-surface gate, git-tracked-only builds, a secret scan, and a clear `AGENTS.md`.
3. Fast, light pages. Uncompressed first-party weight on the main pages is about 30–100 KB (see the performance report), there is no framework, and nothing overflows horizontally at 375 px.
4. Three languages (EN/DE/AR, with right-to-left support) and a test that keeps the i18n keys in step.
5. A data-validated King Studio catalogue: the build fails on bad records.

## Main weaknesses

1. **Legacy database policies in the repo are unsafe.** A replay of `db/*.sql` in the documented order leaves `public.models` **writable by any signed-in user**. The live state is unknown. → SECURITY-AUDIT S-01.
2. **Public AI proxies can be abused at your cost.** `api/gemini.js` and `api/evaluate.js` only check a spoofable `Origin` header and an in-memory limit, and `/api/evaluate` serves a game this deployment does not host. → S-02.
3. **A risky dormant workflow.** `setup-keystore.yml` would print signing passwords into Actions logs and upload the keystore as an artifact. It has never run. → S-03.
4. **Legacy surface.** The old dashboard needs `'unsafe-inline'`; pages load unpinned CDN scripts without SRI; the site-wide CSP is very broad. → S-04 to S-07.
5. **Drift and dead configuration.** The CI `prod-smoke` job points at untracked files, `render.yaml` points at a folder that does not exist, `.pyc` files are tracked, about 31 MB of APKs plus audio are in git (pack size 112 MiB), and there are four Supabase client modules.
6. **Little public content.** Six of the eight catalogue entries are `hidden`, so King Studio shows 2 apps, and Games and Labs show empty states. This is a content decision, not a bug.

## Top 5 priorities (details in PHASE-02-REPAIR-PLAN.md)

1. Verify and fix the live RLS policies on the legacy tables (`models` first), then fold the legacy schema into a versioned migration with PGlite tests.
2. Harden `api/gemini.js` and `api/evaluate.js`: shared rate limit, a daily cap, and remove or gate `/api/evaluate`.
3. Neutralise `setup-keystore.yml` (delete it, or stop logging passwords and uploading the keystore).
4. Remove dead or broken configuration (CI `prod-smoke`, `render.yaml`, tracked `__pycache__`) and pin plus SRI-protect the CDN scripts.
5. Retire the legacy admin dashboard and the legacy Supabase clients, which removes `'unsafe-inline'` from `/admin/*`.

## Phase 01 status

Complete within its read-only limits. What could not be verified is listed in each report and summarised in `PHASE-02-REPAIR-PLAN.md` §0.
