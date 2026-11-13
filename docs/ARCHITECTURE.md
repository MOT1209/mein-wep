# Architecture

```
            ┌──────────────── Browser ────────────────┐
 visitors → │ static pages from dist/ (no CMS calls)  │
 owner    → │ /admin/app.html (dashboard, ES modules) │
            └───────────────┬─────────────────────────┘
                            │ same-origin, HttpOnly session cookies, CSRF header
            ┌───────────────▼───────────── Vercel ─────────────────────────┐
            │ api/admin/session.js   sign-in → cookie session              │
            │ api/admin/[resource].js  CMS operations (requireAdmin)       │
            │ api/admin/rest.js       legacy dashboard data                │
            │ api/cron/github-sync.js daily sync (CRON_SECRET)             │
            │ build: scripts/fetch-cms.mjs → Eleventy → dist/              │
            └──────┬───────────────────────────┬──────────────────────────┘
                   │ admin JWT + publishable key│ publishable key (RLS: public rows)
            ┌──────▼───────────────────────────▼──────┐     ┌──────────────┐
            │ Supabase: Auth · Postgres (RLS) · Storage │     │ GitHub (read)│
            └───────────────────────────────────────────┘     └──────────────┘
```

## Decisions

1. **Static public site, editable content (option A).** Supabase holds the content, and the build turns it into static pages. Visitors never talk to Supabase or the admin API; SEO, the URL gate and build validation stay. A change goes live when the owner presses **Publish site**, which triggers a Vercel Deploy Hook rebuild (about a minute).
2. **One source module.** `scripts/cms/source.mjs` decides where content comes from: the `.cms-cache/cms.json` written by the prebuild step, or the files in git. `_data/kingStudio.js`, `_data/cms.js`, `_data/blogPosts.js`, `_data/downloads.js`, `_data/releases.js` and the URL gate (`scripts/site-templates.mjs`) all read through it, so they can never disagree.
3. **Graceful fallback.** No env, no tables, an empty database or a fetch error each mean the build uses git content, which is byte-identical to the pre-CMS site. `CMS_REQUIRED=1` turns a fallback into a failed build for production.
4. **No service-role key anywhere.** Admin requests run with the admin's own JWT, so Row Level Security is the final authority. The scheduled sync uses one narrow `SECURITY DEFINER` function gated by a hashed secret.
5. **Server-side authorisation on every request.** `api/_lib/admin-auth.js` `requireAdmin()` checks the session, `is_admin()`, the absolute and idle expiry, same-origin and the CSRF header. Hiding links is not security.
6. **Twelve-function budget.** Vercel Hobby allows 12 functions per deployment. All CMS operations share `api/admin/[resource].js`; 10 functions are in use.
7. **No new runtime dependencies.** Vanilla JS in the dashboard. Dev-only additions: `@electric-sql/pglite` (tests the SQL and RLS) and `markdown-it` (already in Eleventy; now declared and patched).

## Where things are

| Path | Role |
|---|---|
| `supabase/migrations/`, `supabase/seed/` | schema, RLS, functions; seed from today's content (`scripts/cms/gen-seed.mjs`) |
| `scripts/fetch-cms.mjs` | prebuild: published content → `.cms-cache/cms.json` |
| `scripts/cms/source.mjs` | CMS or git, record mapping, hidden APKs, CMS blog posts |
| `_data/cms.js` | menu, page texts, settings, blog posts for the templates |
| `api/_lib/admin-auth.js`, `http.js` | sessions, guard, cookies, CSRF, rate limits |
| `api/_lib/cms-handlers.js`, `cms-validate.js` | CMS operations and input allow-lists |
| `api/_lib/github.js`, `media.js`, `supabase-rest.js` | GitHub reader, upload checks, Supabase calls as the admin |
| `admin/app.html`, `admin/app/*` | dashboard (AR/EN/DE) |
| `admin/login.html`, `admin/reset-password.html` | sign-in and password reset |
| `admin/dashboard.html` | older dashboard for the legacy tables ("Older tools") |

## Request lifecycle (edit → live)

1. The owner saves in the dashboard. `POST /api/admin/projects {action:'update'}` → `requireAdmin` → validated fields → Supabase as the admin → `activity_logs`.
2. The owner presses **Publish site**. `POST /api/admin/publish {action:'run'}` → Vercel Deploy Hook.
3. Vercel builds: `fetch-cms.mjs` reads the public rows → Eleventy renders → `npm run verify`-style checks run in CI on PRs.
4. The new static pages are live.

## Service boundaries (Phase 02)

| Layer | Module | Rule |
|---|---|---|
| Public functions | `api/gemini.js`, `api/evaluate.js`, `api/contact.js`, `api/github.js`, `api/rss.js` | validate input, then `api/_lib/public-api.js` (`allowOrigin`, `checkLimits`, `callGemini`); generic errors to the client, details to the log |
| Admin functions | `api/admin/*` | `requireAdmin()` first; data through `api/_lib/supabase-rest.js` as the admin |
| Shared HTTP | `api/_lib/http.js` | limiter, cookies, CSRF, shared rate limit (`sharedLimited`) |
| Database | `supabase/migrations/*` | every table RLS-on, writes `is_admin()` only, each migration has a PGlite test |
| Browser config | `js/supabase-config.js` | URL and publishable key only; read-only pages use a plain `fetch` (see `js/learning.js`) instead of loading supabase-js |
| Headers | `vercel.json` | CSP as a header; `tests/csp.test.mjs` keeps it in step with the pages |

## Patterns for new modules

The planned modules (dashboard, developer hub, AI center, agents, MCP, project management, knowledge base, vault, learning, analytics) should reuse these patterns rather than add new ones:

1. **Data:** a migration in `supabase/migrations/` (tables, RLS, grants), plus a case in a PGlite test that tries anon, a signed-in non-admin and the admin.
2. **Admin operations:** a handler group in `api/_lib/cms-handlers.js`, routed by `api/admin/[resource].js` (this keeps within the 12-function limit), with an allow-list validator in `cms-validate.js`.
3. **Public reads:** rendered at build time from `scripts/cms/source.mjs` when possible; otherwise a small `fetch` to PostgREST with the publishable key.
4. **Anything that spends money or quota** (AI providers): go through `checkLimits` and one shared daily cap.
5. **Long-running work** (agents, MCP servers): not in a Vercel function (30 s limit). Run it elsewhere and talk to it through one authenticated admin endpoint.

## Tooling

- `npm run lint` is a dependency-free syntax check of the first-party JavaScript plus secret rules for `api/`. ESLint and TypeScript checking were deliberately **not** added in Phase 02 (no new dependencies without a written reason). If the code base grows, the next step is `// @ts-check` with JSDoc types on `api/` using a dev-only `typescript`, run in CI.
- Legacy layers still present by design: `admin/dashboard.html` with `js/admin.js` (legacy tables), `css/style.css` (unmigrated pages, served minified), `src/js/main.js` and `src/js/modules/*` (used by the KingCraft showcase and the service worker precache). Remove them only after their pages are migrated.
