# Feature Audit (Phase 01)

Each section was checked in code and in the local `dist/` build (Chromium at 375 px and 1280 px). **Behaviour on the live site and against the live Supabase database was not verified** because both were unreachable from this session.

## G. Feature assessment

### 1. Personal portfolio (`/`, `/about.html`, `/contact.html`, `/de/`, `/ar/`)
- **Working [FACT]:** the pages build and render, with one `h1` and no overflow at 375 px or 1280 px. The language switcher and `hreflang` work, and Arabic is right-to-left. The settings dialog is in `src/js/home.js`. The contact form posts to `/api/contact` (honeypot plus validation).
- **Implementation:** `index.njk` plus the shared `_includes/pages/home.njk`; i18n strings are in `_data/i18n/*.json` (the key set is tested).
- **Missing or concerns:** contact limits are per instance only (SECURITY S-08). The homepage loads Google Tag Manager; make sure the cookie consent (`js/cookie-consent.js`) gates it **[not verified]**.

### 2. King Studio (`/king-studio/`, `/apps/`, `/games/`, `/labs/`, `/<section>/<slug>/`, also DE/AR)
- **Working [FACT]:** a catalogue validated at build time (`_data/kingStudio.js`), project pages and three languages. Tested by `tests/king-studio.test.mjs` (11 tests).
- **Content state [FACT]:** 6 of 8 records in `_data/studioCatalog.json` have `"hidden": true`. Only **Calculator Vault** and **Quiz Master** are public. **Games** and **Labs** show the empty state ("No experiments are published right now"). `vercel.json` sends the old project URLs of hidden items to `/king-studio/` (temporary 302).
- **Gap:** the CMS tables (`studio_projects`) and the git catalogue are two sources. `scripts/cms/source.mjs` decides which one wins, and that depends on the CMS being live (not verified).

### 3. Labs
- **[FACT]** Labs is a **section of King Studio** (`king-studio/labs.njk`), not a separate app. It currently has **no visible entries**: `block-world` ("In Development") and `rashid-ai` ("Experimental") are both hidden.
- The experimental **Rashid AI** tool exists at `/models/Rashid-Model/`. It loads `js.puter.com`, which the production CSP blocks (and no code uses it), plus unpinned CDN scripts (S-06).

### 4. Downloads (`/downloads.html`)
- **Working [FACT]:** it lists **2 APKs** (calculator-app v1.0.1, quiz-app v1.4.1) with SHA-256 checksums computed at build time from the real files.
- `apks/updates.json` holds 6 apps. The 4 hidden projects' APKs are still in git and in `dist/` (31 MB served, but not linked from the page).
- **Inconsistency:** the `app_updates` seed in `db/SUPABASE_APP_UPDATES.sql` lists older versions than `updates.json` (see DATABASE-AUDIT).

### 5. Blog (`/blog/`, 8 posts, `/blog/rss.xml`, `/api/rss`)
- **Working [FACT]:** static posts from `blog/*.njk` plus `posts.json`, and an RSS feed generated at build time and at request time (`api/rss.js` merges published CMS posts with a 2.5 s timeout). The CMS post templates `blog/cms-post.njk` and `blog/cms-posts.njk` exist.
- **Missing:** search, tags or category pages, and pagination (not needed yet at 8 posts).

### 6. Vault (`/vault/{api,code,docs,media,prompts}/`)
- **Implementation [FACT]:** static HTML pages on the legacy `style.css` (107 KB) plus AdSense. `src/js/modules/vault.js` reads `vault_items` from Supabase, with escaped output. `vault/code/` keeps its snippets in the browser (`deleteSnippet` is local) and escapes its output.
- **Concerns:** not migrated to the design tokens; legacy table and policies (DATABASE-AUDIT); the `archive` folder holds only `.gitkeep` and an index.
- **Missing:** private items require the legacy dashboard; the new admin has no vault view.

### 7. Admin
- **New dashboard `admin/app.html` [FACT]:** sign-in through Supabase Auth, then an HttpOnly cookie session. It covers overview, projects, categories, GitHub sync and review, media library, content (settings, pages, nav), blog, activity log, publish (deploy hook), inbox and app updates. Tests: `admin-api` (22), `admin-auth` (23), `admin-app` (9), `admin-login-ui` (8).
- **Legacy dashboard `admin/dashboard.html` [FACT]:** still linked from the new nav (`admin/app/main.js:43`). It manages the legacy tables through `/api/admin/rest`. It needs `'unsafe-inline'` (S-07).
- **Not verified:** whether the live database has the CMS migration applied. `docs/ADMIN_SYSTEM.md:98` says it did not at the time of writing.
- **Missing:** multi-factor sign-in, an audit log viewer filter, and a vault, lessons and models editor in the new UI.

### 8. API (`api/*`)
| Endpoint | State | Notes |
|---|---|---|
| `/api/contact` | works (code + tests) | per-instance limit |
| `/api/gemini` | works if `GEMINI_API_KEY` is set | S-02 cost abuse |
| `/api/evaluate` | deployed, but its game (Denkmalen) is not served by this project | S-02; likely dead here |
| `/api/github` | works; path allow-list | `Sec-Fetch-Site` is forgeable, low impact |
| `/api/rss` | works | |
| `/api/cron/github-sync` | works if `CRON_SECRET` is at least 32 characters and enabled in the dashboard | daily at 03:23 UTC |
| `/api/admin/*` | works | see SECURITY "done well" |
| `/api/auth/*`, `/auth/*`, `/king2/*` | **proxied to another deployment** | S-04; not audited (other repo) |

### Other served sections (not in the brief, found in the repo)
- `/learning.html`: lessons from Supabase (218 KB client).
- `/quran.html` (+ `/quran-app` and `/apps/quran-pro` rewrites).
- `/devos.html`, `/okf/` (Markdown knowledge files), and `/llms.txt`.
- Games: `farm-game`, `kingcraft-game`, `rust-game`. Apps: `calculator-app`, `quiz-app`. All are separate PWAs with their own service workers. Their internals were not audited (AGENTS.md rule 8).

### Broken or dead [FACT]
- CI job `prod-smoke` (`ci.yml:76-83`) runs `.testsprite/*.py`, which is untracked, so it fails if it is ever dispatched.
- `render.yaml:15` `rootDir: games/denkmalen-game` does not exist in the repo.
- `js.puter.com` script on Rashid AI (blocked by the CSP and unused).
- `deploy.yml` (GitHub Pages) is obsolete, because the site is served by Vercel.

## E. Bugs and technical debt

| # | Problem | Location | Impact | Recommended solution |
|---|---|---|---|---|
| B-1 | Permissive legacy `models` policies | `db/SUPABASE_SETUP.sql:217-223` | any signed-in user can edit content (if live matches) | versioned fix migration plus a test |
| B-2 | `SECURITY_FIX.sql` not idempotent | `db/SUPABASE_SECURITY_FIX.sql:15` | fresh set-up fails at step 6 | wrap in `exception when undefined_function` |
| B-3 | Dead `prod-smoke` CI job | `.github/workflows/ci.yml:76-83` | misleading; fails if run | remove, or track a minimal read-only smoke script |
| B-4 | `render.yaml` wrong `rootDir` | `render.yaml:15` | Render blueprint cannot build | point at the real path, or move it to the Denkmalen repo |
| B-5 | `/api/evaluate` serves a game not hosted here | `api/evaluate.js` | paid endpoint with no client | remove, or gate with an env flag |
| B-6 | Seed versions out of date | `db/SUPABASE_APP_UPDATES.sql` vs `apks/updates.json` | update checker may compare against stale data | single source |
| B-7 | Unminified legacy CSS linked | `vault/*`, `devos.html` | +107 KB per page | link `style.min.css` now; migrate later |
| B-8 | Duplicate limiters, origin lists, Supabase clients | `api/*.js`, `src/js/**` | drift risk | consolidate into `api/_lib/http.js` and one client |
| B-9 | Tracked `.pyc` | `mcp/colab-mcp/__pycache__/` | repo noise | `git rm --cached`, add to `.gitignore` |
| B-10 | No linter or type checker | `package.json` | style and type bugs unchecked | add ESLint (flat config) plus `// @ts-check` / JSDoc on `api/` |
| B-11 | Hidden APKs still deployed | `apks/` | 31 MB per deploy | Releases only |
| B-12 | Two admin UIs, two content models | `admin/`, `db/` vs `supabase/` | maintenance cost | migrate the remaining views, then retire the legacy ones |
