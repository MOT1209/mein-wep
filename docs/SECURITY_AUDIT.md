# Security Audit

Scope: the admin system (PR #21 and the CMS work after it), the public site where it reads CMS content, and the Supabase schema. Method: code review against each category below, plus automated tests (`tests/admin-auth`, `admin-api`, `admin-app`, `cms-build`, `db`). The live Supabase project and live site could not be probed from the development environment (network blocked), so live configuration is listed as **owner checks**.

Severity: **High** = exploitable now or with one common mistake; **Medium** = defence-in-depth gap; **Low** = hygiene.

## Results by category

| Category | Finding | Status |
|---|---|---|
| Authentication bypass | Every admin endpoint calls `requireAdmin()`: token verified by Supabase (`/auth/v1/user`), then `is_admin()`. There are no client-side-only checks. The dashboard HTML holds no data. | ✅ covered by tests |
| Unauthorised API access | 401 without a session, 403 for non-admins. Unknown resource or action → 404/400, and prototype keys (`constructor`, `__proto__`) are rejected. | ✅ tests |
| Privilege escalation | `admin_users` cannot be written by API roles; `add_admin_user()` revoked; the legacy data proxy excludes `admin_users`. A user removed from `admin_users` loses access on their next request. | ✅ tests (PGlite + API) |
| RLS policies | Every CMS table has RLS. Public roles read published rows only; all writes need `is_admin()`. Activity rows must carry the caller's own id. | ✅ `tests/db.test.mjs` |
| XSS (public site) | Nunjucks autoescape. The `link` filter only emits https:// or site paths (anything else becomes `#`). Markdown is rendered with HTML off, and markdown-it drops `javascript:` links. JSON-LD uses `dump` with `<` escaped. The build fails on an unsafe CMS link. | ✅ tests with injected `<script>`, `javascript:` |
| XSS (blog index) | **Found and fixed:** `blog/index.njk` built cards with `innerHTML` from `posts.json`. Now `textContent` only, so CMS posts cannot inject markup. | ✅ fixed |
| XSS (dashboard) | No `innerHTML`, `insertAdjacentHTML`, `eval` or `new Function` in `admin/app/*` (test enforced). Strict CSP `script-src 'self'`. | ✅ tests |
| CSRF | SameSite=Strict cookies + same-origin `Origin` + `X-Admin-CSRF` header on every write. Previews are allowed by same-origin only, never other `*.vercel.app` hosts. | ✅ tests |
| SQL injection | No SQL is built from input: PostgREST filters are URL-encoded values on allow-listed columns; identifiers must match `^[a-z_][a-z0-9_]*$`; RPCs take jsonb. | ✅ tests |
| SSRF | The server only fetches fixed hosts: GitHub API, the Supabase URL from env, and the deploy hook (validated as `https://api.vercel.com/v1/integrations/deploy/…`). No user-supplied URL is ever fetched server-side. | ✅ |
| File uploads | Type from magic bytes (PNG/JPEG/WebP/GIF/AVIF), never from the name. SVG and HTML refused. 3 MB cap in code, 5 MB and a MIME list on the bucket. Random file names, folder pattern checked. Files are served from the Supabase origin, not the site. Deleting an image that is still used needs confirmation. | ✅ tests |
| Secret exposure | No secrets in the repo (CI scan + manual check; all committed JWTs are `anon`). `/api/admin/config` returns only the URL and publishable key, and refuses to run if a service-role or `sb_secret_` key is configured. The overview reports server settings as booleans. `CRON_SECRET` is stored only as a SHA-256 hash. | ✅ tests |
| GitHub token permissions | Optional, read-only fine-grained token (**Metadata: read**). Never sent to the browser or stored in the DB. No code path writes to GitHub (test). | ✅ |
| Sessions | HttpOnly, Secure, SameSite=Strict cookies scoped to `/api/admin`, so they are not sent to the `/king2` and `/auth` rewrites. 8 h absolute cap from sign-in, 2 h idle, refresh rotation, revoke on sign-out. Tokens are never in `localStorage`. | ✅ tests |
| Rate limiting | Passwords: Supabase per-IP limit (the browser signs in directly). Our endpoints: per-instance in-memory limits, plus a **shared** database counter (`rate_limit_hit`, salted IP hash) for sign-in (20/15 min), publish, sync and uploads. | ✅ fixed (R2) |
| CSP / headers | `/admin/app.html`, login and reset: strict CSP, `frame-ancestors 'none'`, `no-store`, `noindex`, `no-referrer`. AdSense removed from admin pages. | ✅ tests |
| Scheduled job | `Bearer CRON_SECRET`, compared timing-safe. The RPC only writes repository metadata and logs. | ✅ tests |

## Residual risks and recommendations

| # | Risk | Severity | Recommendation |
|---|---|---|---|
| R1 | **Live configuration unverified**: public sign-up setting, contents of `admin_users`, whether the old `db/` fixes ran. If sign-up is open *and* the old `using (true)` policies are still on the legacy tables, anyone could register and edit those legacy tables. The new CMS tables are safe either way. | **High until checked** | Owner: DEPLOYMENT_GUIDE §1 and audit Appendix A. |
| R2 | ~~In-memory rate limits reset per instance.~~ | — | **Fixed:** shared counter in `supabase/migrations/20261104090000_rate_limits.sql`. It fails open (with in-memory limits and Supabase's limits still on) if the database is unreachable. |
| R3 | The site-wide CSP still allows `'unsafe-inline'` scripts and wide ad hosts (needed by legacy pages and AdSense). | Medium | Migrate inline scripts page by page, then tighten. |
| R4 | The legacy dashboard (`/admin/dashboard.html`) still uses inline handlers and `innerHTML` with escaping, for the legacy lessons/models/vault/bot tables only. Contact messages and app updates moved to the new dashboard. | Low | Retire it once those legacy tables are no longer needed. |
| R5 | ~~A fetch failure during a production build falls back to git content.~~ | — | **Fixed:** production builds now stop on any failure other than "tables not created yet", and the previous deployment stays live. |
| R6 | ~~`api/github.js` accepted requests without an Origin header.~~ | — | **Fixed:** an allowed Origin or `Sec-Fetch-Site: same-origin` is now required. Also fixed: its repo and activity endpoints had always returned 400 because of an unencoded client query. |
| R7 | Linking a private repository to a public project makes its metadata (name, description, language) public through RLS. | Low (owner choice) | Only link private repos you are happy to show. |
| R8 | `npm audit`: 1 moderate advisory left (minimatch via `@11ty/recursive-copy`, build-time only on repo paths). The patched release is one day old. | Low | `npm audit fix` after it has aged two weeks. |
| R9 | Supabase keeps a sign-in token in the login page's memory for a moment before handing it to the server. | Low | Inherent to the chosen design (keeps Supabase's per-IP brute-force limits). The strict CSP on that page limits script injection. |

## Owner checks (cannot be done from here)

- [ ] Supabase: public sign-up **off**; redirect URLs set (DEPLOYMENT_GUIDE §1).
- [ ] `select email from public.admin_users;` returns only your account.
- [ ] Appendix A queries: no `using (true)` write policies on legacy tables; `add_admin_user()` not executable by `authenticated`/`anon`.
- [ ] Vercel: no service-role key in any environment variable.
- [ ] Rotate `CRON_SECRET` / the deploy hook if either is ever shared.
