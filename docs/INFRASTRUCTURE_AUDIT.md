# Infrastructure Audit (Phase 0)

Date: 2026-11-03 · Branch: `ccr-29710a3b-rqtxlm` · Base commit: `aa03615`

This is an inspection only. No application code was changed in Phase 0.

Each finding is labelled with how it was established:

- **[verified]**: read in the code or produced by a command run during this audit.
- **[unverified]**: could not be checked from the audit environment. The reason is given.
- **[opinion]**: a judgement, not a fact.

---

## 1. What could and could not be checked

| Check | Result |
|---|---|
| `npm ci` | ✅ ran [verified] |
| `npm run build` | ✅ 41 pages written, 356 files copied, ~3 s [verified] |
| `npm run verify` | ✅ `URL-surface PARITY OK — 397 expected, 397 in dist/` [verified] |
| `npm test` | ✅ 38 tests, 38 pass, 0 fail, 0 skipped [verified] |
| `npm audit` | ⚠️ 3 vulnerabilities in dev dependencies (1 high, 2 moderate), see §8 [verified] |
| Lint / type check | None configured in `package.json` [verified] |
| Live site (`rashid-wep.vercel.app`) | ❌ the audit container's network proxy refuses the connection (HTTP 403 on CONNECT) [unverified] |
| Live Supabase (`kcltollasghlvuoxvjqa.supabase.co`) | ❌ also refused by the proxy. The Supabase connector in this session sees **no projects**, so the database belongs to another Supabase account or org [unverified] |
| Vercel project `rashid-wep` | Found (`prj_VQcpl4BUkforqSugIBUjQ6KovqnR`, team `mot1209s-projects`). Reading env var **names** and deployments returned `403 forbidden`: this connection is not authorised for that team [unverified] |
| GitHub repos of `MOT1209` | ✅ listed through the GitHub search API: 24 repositories [verified] |

**So the live database state (which SQL files were applied, whether public sign-up is off, who is in `admin_users`) is unknown.** Everything about RLS below describes the SQL files in `db/`, not the live database.

---

## 2. Architecture as it is

| Area | Finding |
|---|---|
| Generator | Eleventy 3.1.6. Only `.njk` files are templates. Everything else is copied file by file from `git ls-files` (`eleventy.config.mjs`). Output goes to `dist/` [verified] |
| Served surface | Guarded by `scripts/check-url-surface.mjs`. The `NOT_SERVED` and `VERCEL_IGNORE` lists are duplicated between that script and `eleventy.config.mjs` and must be kept in step by hand [verified] |
| Hosting | Vercel: `buildCommand: npm run build`, `outputDirectory: dist`, and `api/*.js` as functions with a 10 s limit [verified] |
| Functions | `api/contact.js` (inserts into Supabase with the anon key), `api/gemini.js` and `api/evaluate.js` (Gemini proxy), `api/github.js` (read-only GitHub proxy for 3 fixed endpoints), `api/rss.js` [verified] |
| Dependencies | Dev only: `@11ty/eleventy`, `clean-css`. No runtime npm dependencies. supabase-js is self-hosted at `js/vendor/supabase-2.117.2.js` [verified] |
| Languages | EN default, DE and AR under `/de/` and `/ar/`, with i18n keys enforced by `tests/i18n.test.mjs` [verified] |
| CI | `.github/workflows/ci.yml`: a regex secret scan, then build, verify and test on PRs and on `main`. `apk-build.yml` publishes APKs. `deploy.yml` (GitHub Pages) is manual-only and archived [verified] |

### 2.1 How public content is produced today (the key constraint)

**All public content is generated at build time from files in git.** [verified]

- King Studio is built from `_data/studioCatalog.json`, validated by `_data/kingStudio.js`. The build **fails** on an unknown status, a missing image, a missing launch URL or APK, or an image without alt text.
- The blog is built from `blog/posts.json` plus one `blog/<id>.njk` per post. RSS comes from the same JSON (`blog/rss.xml` and `api/rss.js`).
- Downloads come from `apks/updates.json`, with SHA-256 computed from the real APK at build time.
- Navigation and UI strings come from `_data/site.json` and `_data/i18n/*.json`.
- The homepage deliberately ships **no Supabase, no admin shortcut and no ads**. `tests/site-shell.test.mjs` enforces this.

**Consequence:** anything an admin panel writes to Supabase will **not** appear on the public site until a rebuild reads it. Making the content editable needs one of these:

1. a build-time data module that reads Supabase, plus a Vercel Deploy Hook the admin panel triggers after saving; or
2. the admin panel commits the JSON files to GitHub through a server-side function, which triggers a Vercel build; or
3. the public pages fetch content from Supabase in the browser. This would undo the build-time validation, the "no Supabase on homepage" rule, SEO-rendered HTML and the URL gate. [opinion: not recommended]

This is the main architectural decision before Phase 1 (see §10).

---

## 3. Existing admin system

Two static pages already exist and are served: `/admin/login.html` and `/admin/dashboard.html`. `/admin` and `/admin/` rewrite to the login page. `robots.txt` disallows `/admin/` [verified].

| # | Finding | Severity |
|---|---|---|
| A1 | Authentication is Supabase Auth, run entirely in the browser (`signInWithPassword`). The session is held by supabase-js in `localStorage`: there are no HttpOnly cookies, no server session and no server-side session expiry beyond Supabase's JWT expiry [verified] | Medium |
| A2 | The dashboard "guard" is a client-side redirect: `getSession()` then `rpc('is_admin')`. The dashboard HTML and `js/admin.js` are public static files. That is acceptable **only if** RLS is correct, because RLS is the real protection [verified] | Info |
| A3 | After a successful login the page redirects to `../index.html`, not to the dashboard, and never checks `is_admin` [verified] | Low (UX bug) |
| A4 | **AdSense is loaded on both admin pages.** `login.html` loads it unconditionally. `dashboard.html` loads it after cookie consent. Third-party script on a page that holds an authenticated session [verified] | **High** |
| A5 | The login page has no rate limiting or lockout of its own and relies on Supabase Auth's built-in limits [verified] | Medium |
| A6 | The dashboard writes legacy tables (`projects`, `lessons`, `models`, `bot_knowledge`, `vault_items`, `prompts`, `codes`, `images`, `media`, `contact_messages`, `app_updates`). **None of them feed King Studio, the blog or the homepage**, which are built from JSON in git (see §2.1). So editing "projects" in today's dashboard changes nothing on the public catalogue [verified] | High (functional) |
| A7 | Rendering uses `innerHTML` templates with `escapeHTML()` on most fields. Exceptions: `item.language` in the vault list (`admin/dashboard.html` ~L764) is not escaped, and record ids go unescaped into inline `onclick="...('${id}')"` handlers. The data is admin-written, so this is a stored-XSS risk only if a non-admin can write those tables [verified] | Low–Medium |
| A8 | The UI uses `alert()` and inline styles, and its colour scheme (violet `#6d28d9`) does not use `css/tokens.css` [verified] | Low (design) |
| A9 | No logout-everywhere, no activity log, no CSRF concern (no cookies), no password policy UI [verified] | Info |

---

## 4. Supabase (from the SQL files in `db/`)

Project ref in client code: `kcltollasghlvuoxvjqa`. Every JWT committed in the repo was decoded: all are `role: anon` (publishable). **No service-role key was found in tracked files** [verified].

Admin model: `admin_users(user_id → auth.users)` and `is_admin()`, a `SECURITY DEFINER` function with a pinned `search_path` [verified].

| # | Finding | Severity |
|---|---|---|
| S1 | `SUPABASE_SETUP.sql` creates `projects` and `bot_knowledge` with `to authenticated using (true)` write policies. **Any signed-in user can write.** `SUPABASE_SETUP_FIXED.sql` replaces them with `is_admin()`. Whether the fix is applied live is **unknown** | **Critical if not applied** |
| S2 | `add_admin_user()` let any authenticated user make themselves admin. `SUPABASE_SECURITY_FIX.sql` revokes it. Whether that is applied live is **unknown** | **Critical if not applied** |
| S3 | Whether Supabase **public sign-up** is enabled is unknown. If it is on, together with S1 or S2, any visitor can register and take over content | **Critical if combined** |
| S4 | `SUPABASE_SETUP.sql` is destructive (drops tables). It is documented as "first run only" in `SUPABASE_MIGRATIONS.md`, but nothing stops a re-run | Medium |
| S5 | No migration tooling. The SQL files are unnumbered, there is no `supabase/migrations/` and no record of which files ran | Medium |
| S6 | `contact_messages`: anon insert with length limits (PHASE1_FIX), select and delete for admins only. `api/contact.js` inserts with the anon key and an in-memory rate limit (5/min per instance) | OK |
| S7 | Supabase Storage is not used anywhere in the repo | Info |

**Owner action needed to close S1–S3:** run the queries in Appendix A in the Supabase SQL editor (read-only) and share the output, or connect this Supabase project to the session's Supabase connector.

---

## 5. King Studio and the GitHub catalogue

- 8 records in `_data/studioCatalog.json`. **6 are `hidden: true`** (kingcraft, rust-construction, farm-empire, quran-pro, block-world, rashid-ai). **2 are public** (calculator-vault, quiz-master) [verified].
- Records have **no GitHub repository field**, and none link to a repo [verified].
- Statuses are fixed: `Available`, `In Development`, `Experimental`, `Coming Soon`. Sections are fixed: `games`, `apps`, `labs`. The categories requested in the brief (AI Projects, AI Agents, Developer Tools, Browsers, IDEs…) do not exist yet [verified].
- GitHub owner `MOT1209` has **24 repositories** (20 public, 4 private). The names that contain "king" (case-insensitive) are: `KingAgent`, `King_Browser`, `KINGCODE-IDE`, `kingagent-factory` (private), `KING-SKILLS`, `king3d-ai` and `King2-MODLEN` (private). **None of these are in the catalogue** [verified].
- `api/github.js` only proxies `/users/MOT1209`, `/repos` and `/events`. Requests without an Origin header are allowed, so anyone can spend the server token's rate limit on those 3 read-only endpoints (10/min per IP per instance) [verified]. Low.
- `vercel.json` rewrites `/king2/*`, `/auth/*` and **`/api/auth/*`** to `king2-platform.vercel.app`. A new admin API must not use the `/api/auth/` prefix, or the rewrite captures it [verified].

---

## 6. Security headers and CSP

Set in `vercel.json` for `/(.*)` [verified]: HSTS (preload), `X-Frame-Options: DENY`, nosniff, Referrer-Policy, Permissions-Policy, COOP and CORP `same-origin`, and a CSP header with no `<meta>` CSP.

| # | Finding | Severity |
|---|---|---|
| H1 | `script-src` allows `'unsafe-inline'` plus wide host wildcards (`*.google.com`, `*.doubleclick.net`, `*.googlesyndication.com`, `*.supabase.co`, `https://*.vercel.app` in connect-src). The CSP therefore gives little XSS protection site-wide | Medium |
| H2 | There is no stricter CSP for `/admin/*`. An admin path could get its own header: no ads, no `unsafe-inline` scripts, `connect-src` limited to self and the Supabase project | Medium (fix in Phase 1) |
| H3 | `.js`/`.css` are served with `max-age=0, must-revalidate`. That is correct for unhashed assets, but there is no long-lived caching | Info |

---

## 7. SEO, accessibility and responsiveness

- Canonicals, `hreflang`, unique titles and descriptions, and JSON-LD validity on King Studio pages are covered by tests [verified].
- `sitemap.xml` and `robots.txt` exist, and `/admin/` is disallowed [verified].
- `admin/login.html` carries a `BreadcrumbList` JSON-LD and a canonical. That is harmless, but `noindex` pages don't need them [verified].
- Layouts were **not** checked in a browser in this phase. That happens in Phase 9/11.

---

## 8. Dependency audit (`npm audit`)

| Package | Severity | Path | Fix |
|---|---|---|---|
| markdown-it ≤14.3.2 | high (ReDoS / quadratic time) | dev, via Eleventy | `npm audit fix` |
| minimatch <11.0.1 | moderate (ReDoS) | dev, via Eleventy | `npm audit fix` |
| @11ty/recursive-copy (via minimatch) | moderate | dev, via Eleventy | `npm audit fix` |

All three are dev-only and run only on content in this repo at build time, so the real-world risk is low. They are still worth fixing in a small separate PR [opinion].

---

## 9. Other hygiene findings

- **R1**: `روابط-الإدارة.txt` (admin URLs) and `تقرير-مراجعة-المشروع.html` are tracked at the repo root. They are excluded from serving, but they are public in the GitHub repository. Not secret, just noise [verified].
- **R2**: the `NOT_SERVED`/`VERCEL_IGNORE` lists are duplicated in two files. A shared module would remove the drift risk [opinion].
- **R3**: about 3,000 tracked files, including `.claude/`, `.agents/`, `.opencode/`, `games/` and `apps/`. Not served, but the repo is heavy [verified].
- **R4**: the in-memory rate limiters in `api/*.js` are per-instance and reset on cold start (their own comments say so). A real limit for login or admin needs shared state: a Supabase table or Upstash [verified].

---

## 10. Decisions needed from the owner before Phase 1

These choices change the design, so they are not made silently.

**D1: Where does editable content live, and how does it reach the public site?**

| Option | How it works | Pros | Cons |
|---|---|---|---|
| **A (recommended)** Supabase as the source of truth, read at build time | `_data/*.js` fetches published rows from Supabase during `npm run build`, with a committed JSON snapshot as fallback. The admin panel saves through `/api/admin/*` and then calls a Vercel Deploy Hook | Matches the brief (tables, RLS, media in Supabase Storage); keeps static HTML, SEO, the URL gate and build validation | A change goes live after a rebuild (~1 min); the build depends on Supabase being reachable (mitigated by the snapshot) |
| B: Git as the database | `/api/admin/*` commits `studioCatalog.json`/posts to GitHub with a fine-scoped token, which triggers a Vercel build | Full history, no DB dependency, keeps every existing check | Needs a GitHub token with write access; uploaded media go into git; drafts are awkward |
| C: Runtime fetch | Public pages read Supabase in the browser | Instant updates | Breaks current guarantees (see §2.1) |

**D2: Supabase access.** This session cannot see project `kcltollasghlvuoxvjqa`. Either connect it to the Supabase connector or run Appendix A and paste the results. **No migration will be applied to the live database without that and your explicit go-ahead.**

**D3: Vercel access.** Reading env var names and deployment status needs this connection authorised for team `mot1209s-projects`. The next request that needs it will produce a consent link for you to approve.

**D4: GitHub token for sync.** Recommended: a **fine-grained PAT** (or a GitHub App) with read-only *Metadata* on `MOT1209` repos, stored as a Vercel env var (`GITHUB_SYNC_TOKEN`). Include private repos (`kingagent-factory`, `King2-MODLEN`) only if they should be discoverable.

**D5: Admin URL.** Keep `/admin/` (already in `robots.txt` and the rewrites) and rebuild its pages, rather than add a second admin.

---

## Appendix A: read-only queries for the owner (Supabase SQL editor)

```sql
-- A1. Which policies exist on content tables, and do writes require is_admin()?
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies where schemaname = 'public' order by tablename, cmd;

-- A2. Can ordinary users still run add_admin_user()? (expect: false, false)
select has_function_privilege('authenticated', 'public.add_admin_user()', 'execute') as authenticated_can,
       has_function_privilege('anon', 'public.add_admin_user()', 'execute') as anon_can;

-- A3. How many admins exist? (expect exactly 1; do not paste emails)
select count(*) from public.admin_users;

-- A4. Tables and RLS status
select c.relname, c.relrowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' order by 1;
```

Also check in the Dashboard: **Authentication → Sign In / Providers → "Allow new users to sign up"** should be **off**.
