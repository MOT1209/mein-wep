# Phase 02 Repair Plan and Modernization Roadmap

**Nothing in this file has been started.** Phase 02 needs the owner's explicit approval, and every step that changes the live site, the database or a release is asked for again before it runs (CLAUDE.md).

## 0. Could not be verified in Phase 01

| Item | Why | How to verify in Phase 02 |
|---|---|---|
| Live RLS policies, grants and Auth sign-up setting | no database credentials | owner runs the read-only `pg_policies` / `role_table_grants` queries in the SQL editor, or grants a read-only connection |
| Whether the CMS migrations are applied live | same | `select to_regclass('public.studio_projects')` |
| Live headers, CSP violations, Core Web Vitals | network policy blocked the site | Lighthouse or Playwright from an environment that can reach it |
| Which Vercel env vars are set (`GEMINI_API_KEY`, `CRON_SECRET`, `RATE_LIMIT_SALT`, `VERCEL_DEPLOY_HOOK_URL`) | no Vercel access | owner checks Project → Settings → Environment Variables (names only) |
| The king2 deployment behind `/auth` and `/king2` | different project | separate audit |
| Games, apps and APK runtime behaviour | out of scope (AGENTS.md rule 8) | device testing |

## H. Modernization roadmap

Complexity: S = under half a day, M = 1–2 days, L = several days.

| # | Improvement | Priority | Complexity | Depends on | Expected result | Acceptance criteria |
|---|---|---|---|---|---|---|
| R-1 | Legacy RLS fix and baseline migration | **P0** | M | owner runs read-only policy queries | no non-admin writes anywhere | PGlite test: non-admin insert or update on `models`, `projects`, `bot_knowledge`, `vault_items`, `lessons`, `prompts`, `codes`, `images`, `media` → denied; live `pg_policies` shows no `true` write policy for `authenticated` |
| R-2 | Harden AI proxies | **P0** | S | – | key cannot be drained by scripts | `/api/gemini` uses `sharedLimited` and a daily global cap; `/api/evaluate` removed or behind a flag; tests in `tests/api.test.mjs` cover the 429 and forged-origin cases |
| R-3 | Remove `setup-keystore.yml` and `deploy.yml` | **P0** | S | owner OK | no workflow can leak signing keys or publish the repo root | files gone; CI green |
| R-4 | Fix dead config | P1 | S | – | CI and infrastructure files match reality | `prod-smoke` removed or working; `render.yaml` fixed or removed; `.pyc` untracked; `verify` still `PARITY OK` |
| R-5 | Pin and SRI third-party scripts; drop puter | P1 | S | – | no floating CDN code | every external `<script>` has an exact version and `integrity`; CSP unchanged or narrower |
| R-6 | Contact: shared limit, remove direct anon insert | P1 | S | R-1 | spam throttled across instances | anon REST insert denied in a PGlite test; API still inserts (through an RPC) |
| R-7 | Consolidate helpers (limiter, origins, Supabase client) | P2 | M | R-2 | one implementation of each | `grep` shows one limiter; tests pass |
| R-8 | Retire the legacy admin dashboard | P2 | L | new views for vault, lessons, models, bot | `/admin/*` CSP without `'unsafe-inline'` | `dashboard.html` and `js/admin.js` removed; redirect added in `vercel.json`; CSP rule tightened; admin tests green |
| R-9 | Migrate `vault/*`, `devos`, `learning` to tokens | P2 | L | – | one design system; less CSS | those pages no longer link `style.css`; checked visually at 375 and 1280 px |
| R-10 | Asset fingerprinting and long cache | P2 | M | – | fewer revalidations | hashed filenames; `immutable` header for hashed assets; `verify` updated deliberately |
| R-11 | Tighten the site-wide CSP | P2 | M | R-5, R-9 | XSS blast radius reduced | no `'unsafe-inline'` in `script-src` on migrated pages; wildcard hosts reduced to those used |
| R-12 | Move APKs and audio out of the deploy | P3 | M | the `apks-latest` Release | deploy −38 MB | downloads link to Release assets; checksums still shown |
| R-13 | ESLint plus `@ts-check` on `api/` | P3 | S | – | static checks in CI | `npm run lint` in CI, 0 errors |
| R-14 | Separate king2 from this origin | P3 | M | owner decision | no shared origin with another app | rewrites removed or moved to a subdomain |

## I. Phase 02 execution plan (first batch, exact files)

**Step 1: security P0** (one branch, one PR, nothing merged without approval)
1. `supabase/migrations/<ts>_legacy_rls_baseline.sql` (new): drop `"Admins can view all models"`, `"Admins can insert models"`, `"Admins can update models"`, `"Admins can delete models"` and `"Admins can view all projects"`; keep or recreate the `is_admin()` versions; `alter function public.increment_visitor_count() set search_path = ''`. Every statement guarded so the file can be re-run.
2. `tests/db.test.mjs` plus `tests/db/supabase-stubs.sql`: add legacy-table cases (anon, non-admin, admin).
3. `db/SUPABASE_SECURITY_FIX.sql`: guard the `revoke` for when the function is missing (documentation-level fix), and update `SUPABASE_MIGRATIONS.md`.
4. `api/gemini.js`, `api/evaluate.js`: import `sharedLimited` and `clientIp` from `api/_lib/http.js`; add a global daily bucket; decide whether to remove `evaluate`. If it is removed: delete `api/evaluate.js`, then check `scripts/check-url-surface.mjs` and the function count.
5. `tests/api.test.mjs`: tests for forged origins and the shared limit.
6. `.github/workflows/setup-keystore.yml`, `.github/workflows/deploy.yml`: delete.

**Step 2: hygiene P1**
- `.github/workflows/ci.yml` (remove `prod-smoke`, or add a tracked read-only smoke script)
- `render.yaml`
- `.gitignore` plus `git rm --cached mcp/colab-mcp/__pycache__/*`
- `models/Rashid-Model/index.html` (pin plus SRI; drop puter)
- `api/contact.js` (shared limit), plus a migration revoking the direct anon insert on `contact_messages` and adding an RPC

**Step 3: P2 refactors** (separate PRs): R-7, R-8, R-9, R-10, R-11.

Each step ends with `npm run build && npm run verify && npm test`. UI steps are also checked with Playwright at 375 px and 1280 px. The owner applies the SQL to the live database; this is never run automatically.

## 10. Future platform requirements (MYON WEB 2.0)

Common foundation needed by most modules: **(F1)** the hardened, versioned database (R-1); **(F2)** auth with roles beyond owner and admin (a `user` role, and per-module permissions in `admin_users` or a `roles` table); **(F3)** a server-side API layer that fits the Vercel function cap (keep the single `[resource].js` router, or move to Vercel Pro or another backend); **(F4)** a typed or validated data layer (shared validators like `cms-validate.js`, ideally JSDoc types); **(F5)** a strict CSP and no legacy inline code (R-8, R-11); **(F6)** a client app shell for authenticated, dynamic pages (the admin app already shows the pattern: ES modules plus i18n).

| Module | Architectural requirements | Depends on |
|---|---|---|
| 1. Personal Dashboard | signed-in owner area; widgets reading the CMS and activity logs; reuse the `admin/app` shell | F1, F2, F6 |
| 2. Developer Hub | GitHub data already synced (`github_repositories`); add commits and PR stats through the existing cron; public project pages from CMS | F1, cron (exists) |
| 3. AI Center | one hardened AI gateway (`api/gemini.js` generalised): provider abstraction, per-user quotas in Postgres, usage log table, key only on the server | R-2, F1, F2 |
| 4. AI Agents Management | agent definitions table, run log, and a queue (serverless timeouts of 30 s mean long runs need an external worker, e.g. Render or Supabase Edge Functions) | 3, F3 |
| 5. MCP Servers Integration | registry table of MCP servers; servers run **outside** Vercel (the repo already has `mcp/`, `king-colab-MCP/` as separate projects); secrets per server held server-side; owner-only | 4, F2 |
| 6. Project Management | tables for tasks, milestones and links to `studio_projects` and GitHub issues; RLS per owner | F1, F2 |
| 7. Knowledge Base | unify `okf/*.md`, `bot_knowledge` and the vault docs into one versioned content type; full-text search (Postgres `tsvector`) or build-time index | F1, R-9 |
| 8. Digital Vault | move `vault_items` into the CMS; private items via signed URLs (private Storage bucket); optional client-side encryption for secrets | F1, F2, R-8 |
| 9. Learning Center | `lessons` table into the CMS; render at build time instead of the 218 KB client; progress per user if accounts are opened | F1, F2 |
| 10. Blog and Media | already CMS-backed (`blog_posts`, the `media` bucket); add tags, pagination, image variants | exists |
| 11. Analytics | privacy-first: Vercel Analytics or a server-side event table; consent gating; no counts shown publicly without data (AGENTS.md honesty rule) | F1, consent |
| 12. Advanced Admin | roles and permissions, audit-log viewer, MFA (Supabase Auth MFA), retire the legacy dashboard | F2, R-8 |

**Conclusion [RECOMMENDATION]:** none of these modules needs a rewrite. They need **F1 and F2 first**, then the modules can be added one at a time as CMS resources plus Eleventy pages, with the same tests-and-verify gate. The real constraints are the serverless time limit (affects 4 and 5) and the function-count cap (F3).
