# Security Audit (Phase 01)

Severity scale: CRITICAL / HIGH / MEDIUM / LOW / INFORMATIONAL. Each finding says whether it is a **confirmed** vulnerability (reproduced or read directly from code that runs) or a **potential** risk (depends on state this audit could not see). **No secrets are printed in this report.** The only key-like value seen is the Supabase publishable (anon) key in `js/supabase-config.js`, which is public by design.

## Not verifiable in this session

- **The live Supabase database** (policies, grants, buckets, the Auth sign-up setting). There were no credentials, so findings about it come from the SQL in the repo.
- **The live site's HTTP headers.** The network policy blocked `rashid-wep.vercel.app`. CSP findings come from `vercel.json`.
- **The Vercel environment variables** (which ones are set, for example whether `GEMINI_API_KEY`, `CRON_SECRET` or `RATE_LIMIT_SALT` exist).

## Summary

| ID | Severity | Status | Finding |
|---|---|---|---|
| S-01 | **HIGH** | Confirmed in repo SQL; live state unknown | `public.models` writable by any signed-in user after replaying `db/*.sql` |
| S-02 | **MEDIUM** | Confirmed (code) | Public Gemini proxies (`/api/gemini`, `/api/evaluate`) protected only by a spoofable `Origin` and per-instance limits; cost abuse |
| S-03 | **MEDIUM** | Potential (workflow never run) | `setup-keystore.yml` would log signing passwords and publish the keystore as an artifact |
| S-04 | MEDIUM | Confirmed (config) | Same-origin rewrite of `/auth/*`, `/api/auth/*` and `/king2/*` to another deployment |
| S-05 | MEDIUM | Confirmed (config) | Site-wide CSP allows `'unsafe-inline'` scripts and broad wildcards |
| S-06 | LOW | Confirmed (code) | Unpinned third-party scripts without SRI on `models/Rashid-Model/` |
| S-07 | LOW | Confirmed (code) | Legacy admin dashboard needs `'unsafe-inline'` on `/admin/*` |
| S-08 | LOW | Confirmed (code) | `/api/contact` limit is per instance only; spam can bypass it |
| S-09 | LOW | Potential | `projects` "Admins can view all projects" policy is `using (true)` for any signed-in user (private rows readable) |
| S-10 | LOW | Confirmed | `increment_visitor_count()` is `SECURITY DEFINER` without a fixed `search_path` in `db/SUPABASE_SETUP.sql` (fixed by `db/SUPABASE_FUNCTION_SEARCH_PATH.sql` if applied) |
| S-11 | INFO | Confirmed | `deploy.yml` (manual) would publish the whole repo root to GitHub Pages |
| S-12 | INFO | Confirmed | Tracked `.pyc` files and `.env.example` templates (no secrets found in them by the CI pattern scan) |

---

### S-01 HIGH: legacy `models` table is writable by any authenticated user (repo SQL)

- **Evidence [FACT]:**
  - `db/SUPABASE_SETUP.sql:217-223` creates the policies `"Admins can view/insert/update/delete models"` with `using (true)` / `with check (true)` for `authenticated`.
  - Later, `db/SUPABASE_SETUP.sql:380-390` drops and creates **differently named** policies (`"Models admin insert"` …) that use `is_admin()`. The old permissive ones are never dropped, and Postgres ORs permissive policies together.
  - No later file in `db/` fixes this. `SUPABASE_SETUP_FIXED.sql` only fixes `projects` and `bot_knowledge`.
- **Reproduced:** I replayed `db/` in the order from `SUPABASE_MIGRATIONS.md` (1–6, 8), then `supabase/migrations/*`, on PGlite with the repo's own stub schema (`tests/db/supabase-stubs.sql`) and Supabase's default grants. As a signed-in **non-admin** user:
  - `insert into public.models` → **ALLOWED**
  - `update public.models` → **ALLOWED** (4 rows)
  - `projects`, `bot_knowledge`, `vault_items`, `lessons` inserts → denied by RLS (correct)
- **Exploitability:** this needs a signed-in account. `games/farm-game/js/systems/DatabaseService.js:95-105` calls `auth.signUp`, which suggests public sign-up is enabled **[ASSUMPTION]**. If so, anyone can create an account and edit or deface the `models` content (and anything that renders it).
- **Side finding:** `db/SUPABASE_SECURITY_FIX.sql:15` fails on a fresh database because `SUPABASE_SETUP_FIXED.sql:67` already dropped `add_admin_user()`. The file is documented as idempotent but is not.
- **Fix:** run `select * from pg_policies where tablename='models'` on the live database. Drop the four `"Admins can … models"` policies. Fold the legacy schema into a versioned migration with PGlite tests like `tests/db.test.mjs`. Review the Auth sign-up setting.

### S-02 MEDIUM: AI proxies can be called by any non-browser client

- **Evidence [FACT]:** `api/gemini.js:46-49` and `api/evaluate.js:126-129` accept a request when `req.headers.origin` is in an allow-list. Any script or `curl` can set this header. The comment "a missing Origin means a non-browser client" is true, but a forged Origin is not caught.
- Rate limits are in-memory per serverless instance (`api/gemini.js:24-37`: 10/min; `api/evaluate.js:24`: 20/min), reset on cold start, and keyed on `x-forwarded-for`.
- `/api/evaluate` accepts up to about 4 MB of image data per call (`api/evaluate.js:30`).
- **[FACT]** The game it serves (Denkmalen) is **not** deployed by this project (`denkmalen/` is excluded at `eleventy.config.mjs:82`, and the folder named in the comment, `games/denkmalen-game`, does not exist). So the endpoint is likely unused here, but it still spends the key.
- **Impact:** any attacker can drive Gemini usage on the owner's key, so cost and quota exhaustion.
- **Fix:** use `sharedLimited()` from `api/_lib/http.js` (the database-backed limit already used by the admin API) plus a global daily cap. Require `Sec-Fetch-Site: same-origin` in addition to `Origin` (raises the bar but is also forgeable). Remove `/api/evaluate` or gate it behind configuration if Denkmalen is served elsewhere. Set a quota or budget alert on the Google key.

### S-03 MEDIUM (potential): keystore workflow leaks signing credentials if run

- **Evidence [FACT]:**
  - `.github/workflows/setup-keystore.yml:9-26` takes the passwords as `workflow_dispatch` inputs, which GitHub does not mask.
  - `:80-89` echoes `KEYSTORE_PASSWORD` and `KEY_PASSWORD` into the job log.
  - `:68-72` and `:94-98` upload the `.jks` and its base64 as artifacts. On a public repository, these logs and artifacts are readable by others.
- **[FACT]** The GitHub API shows **0 runs** of this workflow, so nothing has leaked.
- **Fix:** delete the workflow (its own output says "delete this workflow file"), or generate the keystore locally.

### S-04 MEDIUM: other deployments served on this origin

- **Evidence [FACT]:** `vercel.json:115-118` rewrites `/king2/*`, `/auth/*` and `/api/auth/*` to `king2-platform.vercel.app`. Pages from that app run with the **same origin** as this site, so they share `localStorage` and non-path-scoped cookies with it. That includes the Supabase session that legacy pages (`js/supabase-config.js`, the farm game) keep in `localStorage`.
- **Mitigated:** admin cookies are scoped to `Path=/api/admin` (`api/_lib/admin-auth.js:25`), so they are not sent to the rewrites.
- **Fix:** if king2 is still needed, move it to its own subdomain. Otherwise remove the rewrites.

### S-05 MEDIUM: site-wide CSP is permissive

- **Evidence [FACT]:** `vercel.json:23`. `script-src` includes `'unsafe-inline'`, `https://*.google.com`, `https://*.doubleclick.net`, `https://*.supabase.co` and `https://cdn.jsdelivr.net` (any npm package). `connect-src` includes `https://*.vercel.app`, `https://*.onrender.com` and `https://openrouter.ai`. `img-src https:` and `media-src https:` are wide open. There is no `frame-ancestors` (`X-Frame-Options: DENY` covers framing).
- **Impact:** if any XSS appeared, the CSP would barely limit it. jsDelivr and the wildcard Google hosts allow script gadgets.
- **Fix:** move inline scripts to files, then drop `'unsafe-inline'` page by page (the admin login pages already do this). Narrow the hosts to those actually used.

### S-06 LOW: unpinned scripts without SRI

- **Evidence [FACT]:** `models/Rashid-Model/index.html:23` loads `cdn.jsdelivr.net/npm/chart.js` (no version), `:25` loads `@supabase/supabase-js@2` (floating major version), and `:24` loads `https://js.puter.com/v2/`. None has an `integrity` attribute.
- `js.puter.com` is **not** in the CSP `script-src`, so production blocks it, and no code in `script.js` uses it.
- **Fix:** pin exact versions with SRI, or vendor them like `js/vendor/supabase-2.117.2.js`. Remove the puter tag.

### S-07 LOW: legacy dashboard keeps `'unsafe-inline'` on `/admin/*`

- **Evidence [FACT]:** `vercel.json:41` applies to `/admin/(.*)` with `script-src 'self' 'unsafe-inline'`, needed by inline code in `admin/dashboard.html`. The more specific rules for `/admin/app.html` and the login pages are strict (`script-src 'self'`).
- Output in `admin/dashboard.html:717-840` and `js/admin.js` goes through an `escapeHTML` helper. I found no unescaped user data, but this was not exhaustively proven.
- **Fix:** retire `dashboard.html` once the new dashboard covers its tables (vault, lessons, models, bot knowledge).

### S-08 LOW: contact spam limits

- **Evidence [FACT]:**
  - `api/contact.js:17-30` uses an in-memory limit of 5/min per instance, keyed on `x-forwarded-for`.
  - A honeypot field is checked.
  - Database length checks exist (`db/SUPABASE_PHASE1_FIX.sql`).
  - `anon` can also insert into `contact_messages` **directly via REST** (`db/SUPABASE_CONTACT_FIX.sql:21-24`), which bypasses the API limit entirely.
- **Fix:** use `sharedLimited`, and revoke the direct anon insert (route inserts through the API only, via a `SECURITY DEFINER` RPC with its own limit).

### S-09 LOW (potential): `projects` private rows readable by any signed-in user

- `db/SUPABASE_SETUP.sql:51-52` has `"Admins can view all projects" … to authenticated using (true)`. `SUPABASE_SETUP_FIXED.sql` fixes insert, update and delete but not this select policy (confirmed in the PGlite policy dump).
- Impact depends on whether private rows hold anything sensitive.

### S-10 LOW: `SECURITY DEFINER` without `search_path`

- `db/SUPABASE_SETUP.sql` `increment_visitor_count()` is fixed by `db/SUPABASE_FUNCTION_SEARCH_PATH.sql`. Whether that file was applied live is unknown.
- The function is callable by anyone, so the visitor count can be inflated (by design, low impact).

### S-11 INFO: `deploy.yml` uploads `path: '.'`

- `.github/workflows/deploy.yml:35`, manual only. It would publish every tracked file, including `docs/`, `db/` and other projects. Recommend deleting it, since the site is served from Vercel.

### S-12 INFO: repository hygiene

- Tracked `mcp/colab-mcp/__pycache__/*.pyc`.
- `.env.example` files contain templates only (the CI secret scan pattern is clean).

## What is done well (verified in code and tests)

- Admin session: HttpOnly, `Secure`, `SameSite=Strict`, `__Secure-` prefix, path-scoped cookies; idle limit of 2 h and absolute limit of 8 h; revocation on role loss (`api/_lib/admin-auth.js`).
- CSRF: an Origin allow-list or same-host check, plus `X-Admin-CSRF` on every write (`api/_lib/http.js:csrfOk`).
- No service-role key anywhere; `supabaseEnv()` refuses to run with a secret key.
- `/api/admin/rest` checks identifiers by regex, allows only equality filters, needs a filter on update or delete, and caps rows and payload size.
- Media: type checked by file bytes, no SVG, 3 MB cap, strict path regex (`api/_lib/media.js`). The bucket enforces MIME type and 5 MB again.
- The cron is authenticated with a constant-time comparison and a 32-character minimum secret. The database stores only a SHA-256 hash, and the cron RPC can write only repository metadata.
- CMS RLS is verified by `tests/db.test.mjs` for anon, non-admin and admin.
- `cms_safe_url` blocks `javascript:` and protocol-relative URLs in CMS links.
- `npm audit`: 0 vulnerabilities. CI scans for secrets.
