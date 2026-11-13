# Repository Analysis (Phase 01)

Audited commit `612856d`, 934 git-tracked files. Facts come from `git ls-files`, from reading the code and from the build output.

## B. Repository structure

| Path | Tracked files | Responsibility | Served from `dist/`? |
|---|---|---|---|
| `*.njk`, `blog/`, `king-studio/`, `de/`, `ar/` | ~40 | Eleventy page templates | yes |
| `_includes/` (layouts, partials, `studio/`, `king-studio/`, `pages/`) | 28 | Shared header, footer, cards, homepage body | rendered |
| `_data/` | 11 | `site.json` (nav, translations), `studioCatalog.json` plus `kingStudio.js` (validated catalogue), `downloads.js`, `releases.js`, `cms.js`, `blogPosts.js`, `rssFeed.js`, `i18n/{en,de,ar}.json` | no (data only) |
| `api/` | 18 | Vercel functions: `gemini`, `evaluate`, `contact`, `github`, `rss`, `cron/github-sync`, `admin/{session,config,rest,[resource]}`, plus helpers in `_lib/` | functions |
| `admin/` | 21 | New dashboard `app.html` plus `app/*.js` (AR/EN/DE); legacy `dashboard.html`; login and reset pages | yes |
| `css/` | 11 | `tokens.css` (design tokens), `site.css`, `home.css`, `king-studio.css`, `downloads.css`, `blog-post.css`; legacy `style.css` and `style.min.css` (109 KB) | yes |
| `js/`, `src/js/` | 17 + 34 | Page scripts; `src/js/home.js` (settings); legacy `src/js/main.js` and 16 `modules/*`; `utils/dom.js` (escaping) | yes |
| `supabase/migrations`, `supabase/seed` | 3 | **Versioned** CMS schema plus RLS, and the rate-limit table | no |
| `db/*.sql` | 9 | **Legacy, hand-run** SQL (setup and fixes); order is documented in `SUPABASE_MIGRATIONS.md` | no |
| `scripts/` | 14 | Build tooling (`fetch-cms`, `minify-css`), the URL gate `check-url-surface.mjs`, `site-templates.mjs`, Capacitor helpers | no |
| `tests/` | 13 | `node:test` suites (API, auth, admin UI, DB on PGlite, dist, i18n, King Studio, site shell) | no |
| `games/` | 279 | Standalone PWAs: `farm-game`, `kingcraft-game`, `rust-game` (`kingcraft1` excluded) | yes |
| `apps/` | 76 | `calculator-app`, `quiz-app` (`chat-app` excluded) | yes |
| `apks/` | 9 | Six APKs (~31 MB) plus `updates.json` | yes |
| `audio/quran/` | 12 | Quran audio (~7 MB) | yes |
| `vault/` | 10 | Static vault pages (api, code, docs, media, prompts) | yes |
| `models/Rashid-Model/` | 5 | "Rashid AI" experimental chat and image tool | yes |
| `okf/` | 27 | Markdown knowledge files (`/okf` rewrite) | yes |
| `linguaverse/`, `denkmalen/`, `mcp/`, `agents/`, `tools/`, `notebooks/`, `king-colab-MCP/` | ~200 | Other projects kept in the same repo | **no** (excluded in `eleventy.config.mjs:72-100`) |
| `.github/workflows/` | 4 | `ci.yml`, `apk-build.yml`, `setup-keystore.yml`, `deploy.yml` (GitHub Pages, manual only) | no |
| `vercel.json` | 1 | Headers (CSP), redirects, rewrites (including the `/king2` proxy), cron | config |
| `docs/` | 20 | Architecture, admin, DB schema, deployment and earlier audits | no |

## Important files

- `eleventy.config.mjs`: copies tracked files one by one; holds the never-serve list (must match `scripts/check-url-surface.mjs`).
- `scripts/check-url-surface.mjs`: makes `dist/` equal to the tracked, servable files (417 at audit time).
- `api/_lib/admin-auth.js`: the admin session model (cookies, idle limit of 2 h and absolute limit of 8 h, `is_admin` RPC).
- `api/_lib/http.js`: CSRF check, in-memory and shared rate limiters, cookie helpers.
- `api/admin/rest.js`: the allow-listed table proxy used by the legacy dashboard.
- `api/_lib/cms-handlers.js`: all CMS actions (projects, blog, media, GitHub, publish, messages, app updates).
- `supabase/migrations/20261103120000_admin_cms.sql`: CMS tables, RLS, the media bucket, `github_sync_apply`.
- `_data/kingStudio.js`: catalogue validation; the build fails on bad data.

## C. Technical assessment

**Technologies [FACT]:** Node 20–24 (CI uses 22; local was 22.23.4). Eleventy 3.1.6, markdown-it 14.3.3, clean-css 5.3.3, and PGlite 0.5.10 for tests. Plain ES modules with no framework. Supabase is used for Postgres, Auth and Storage. Vercel serves static files and functions, and runs a cron at 03:23 UTC. Capacitor builds the Android apps in CI.

**Dependencies [FACT]:** 4 dev dependencies and 0 runtime dependencies. `npm audit`: 0 vulnerabilities. `npm outdated`: eleventy 3.1.6 → 3.1.8 (patch); pglite 0.5.10 → 0.5.16; markdown-it 14.3.3 → 15.0.3 (major). The vendored `js/vendor/supabase-2.117.2.js` (218 KB) is pinned. **Unpinned** CDN scripts exist in `models/Rashid-Model/index.html:23-25`.

**Infrastructure [FACT]:** Vercel project `rashid-wep` builds `main`. `/king2`, `/auth/*` and `/api/auth/*` are **rewritten to another deployment** (`king2-platform.vercel.app`, `vercel.json:115-118`). `render.yaml` describes a Render service for the Denkmalen socket server.

**Architecture:**
- **Separation of concerns.** Good in the new code: handlers, validation (`cms-validate.js`), DB access (`supabase-rest.js`) and auth are separate. Weak in the legacy code: inline scripts in `admin/dashboard.html`, large HTML-template strings.
- **Duplication [FACT].** Three copies of the same in-memory rate limiter (`api/gemini.js:28`, `api/evaluate.js:32`, `api/github.js`, `api/contact.js`), even though `api/_lib/http.js:createLimiter` exists. Four origin allow-lists. Four Supabase client set-ups (`js/supabase-config.js`, `src/js/config/supabase.js`, `src/js/modules/supabase.js`, `src/js/services/supabase.js`). Two admin UIs, and two content models (legacy tables and CMS tables).
- **Type safety.** None: no TypeScript and no JSDoc checking. Input validation is done by hand in `cms-validate.js` and is thorough.
- **Naming.** Mostly consistent. Slugs and app ids differ between systems (`calculator-vault` vs `calculator-app`, `quran-pro` vs `quran-app`) and are bridged by rewrites in `vercel.json`.
- **Scalability.** A static site scales freely. The function cap (12 on Hobby) shapes the API design. Shared rate limits use Postgres.
- **Maintainability.** Good where tests exist (130). There is no linter or formatter, and the large legacy files are untested.

## Technical debt (summary; details in FEATURE-AUDIT §E)

| # | Debt | Location |
|---|---|---|
| D-1 | Legacy schema exists only as hand-run SQL, not versioned or tested | `db/*.sql` |
| D-2 | Legacy admin dashboard alongside the new one | `admin/dashboard.html`, `js/admin.js` |
| D-3 | Legacy CSS (109 KB, conflicting `:root`) still loaded by unmigrated pages | `css/style.css`; e.g. `vault/docs/` loads 107 KB of CSS |
| D-4 | Duplicate limiters, origin lists and Supabase clients | see above |
| D-5 | Binary bloat in git: APKs (~31 MB), audio (~7 MB); pack size **112 MiB** | `apks/`, `audio/` |
| D-6 | Tracked build junk: `mcp/colab-mcp/__pycache__/*.pyc` (3 files) | `mcp/` |
| D-7 | Dead or broken config: CI `prod-smoke` calls untracked `.testsprite/*.py` (`ci.yml:82-83`); `render.yaml:15` `rootDir: games/denkmalen-game` does not exist | |
| D-8 | Unrelated projects in the deploy root (linguaverse, denkmalen, mcp, agents, …) | root |
| D-9 | No linter or type checker | `package.json` |
