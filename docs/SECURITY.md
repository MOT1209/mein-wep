# Security

How the site is protected, what each control relies on, and what is still open. Findings and their history are in `docs/audit/` (Phase 01) and `docs/PHASE-02-REPORT.md`.

## Reporting a problem

Contact the owner privately (see `/contact.html`). Do not open a public issue for a vulnerability.

## Secrets

| Secret | Where it lives | Never |
|---|---|---|
| `GEMINI_API_KEY` | Vercel env (server only) | in client code or the repository |
| `CRON_SECRET`, `RATE_LIMIT_SALT`, `VERCEL_DEPLOY_HOOK_URL`, `GITHUB_TOKEN` | Vercel env | in client code or the repository |
| Android signing keystore and passwords | GitHub Actions secrets `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` | in a workflow input, a log or an artifact |
| Supabase service-role key | **nowhere**: nothing in this system needs it | anywhere |

The Supabase URL and the **publishable** (anon) key are public by design (`js/supabase-config.js`, `/api/admin/config`). `api/_lib/admin-auth.js` refuses to run if `SUPABASE_ANON_KEY` holds a secret or service-role key.

Checks:
- The CI secret scan (`.github/workflows/ci.yml`) looks for Google, OpenAI/Anthropic and AWS key shapes and `SERVICE_ROLE`/`SECRET` assignments in `.js` and `.html` files.
- `npm run lint` (`scripts/lint.mjs`) refuses secret-shaped literals and a service-role key in `api/`.

## Authentication and authorisation

- **Admin:** sign-in goes through Supabase Auth in the browser. The session lives only in HttpOnly, `Secure`, `SameSite=Strict`, `__Secure-` cookies scoped to `/api/admin`. Every request re-checks the token and `is_admin()`. There is an idle limit of 2 h and an absolute limit of 8 h. Owner-only actions check `admin_users.role = 'owner'`. Details: `docs/ADMIN_SYSTEM.md`.
- **CSRF:** writes need an allowed same-origin `Origin` **and** the `X-Admin-CSRF: 1` header (`api/_lib/http.js` `csrfOk`).
- **Public sign-up exists** (the farm game uses Supabase Auth). So "signed in" never means "admin"; every policy must say `is_admin()` explicitly.

## Database (Row Level Security)

- Every content table has RLS on. Writes are `is_admin()` only. Public reads return `status = 'Public'` rows (legacy tables) or published, non-deleted rows (CMS tables).
- `supabase/migrations/20261113120000_legacy_rls_hardening.sql` removed the over-broad legacy policies: `models` writable by any signed-in user, and private `projects` readable by any signed-in user. It also drops **any** permissive write policy whose condition is the constant `true` on the legacy content tables.
- `contact_messages`: anyone may insert (the contact form). Only the admin reads and deletes. There are database length checks.
- Farm-game tables: each user reads and writes only their own rows (`auth.uid()`).
- Storage bucket `media`: public read; list and write for admins only; images only, 5 MB.
- Tests run on PGlite in `npm test`:
  - `tests/db.test.mjs`: CMS tables and functions.
  - `tests/db-legacy.test.mjs`: replays `db/*.sql`, proves the old hole, then checks anon, non-admin and admin.

**Production status:** the migrations must be applied by the owner in the Supabase SQL editor (`docs/DEPLOYMENT_GUIDE.md` §2). Until then, the live database keeps whatever policies it has. After applying, check with:

```sql
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies where schemaname = 'public' order by 1, 2;
```

No row for a content table should have `cmd` in (INSERT, UPDATE, DELETE, ALL) with `qual`/`with_check` both `true` or empty.

## Public API functions

`api/_lib/public-api.js` is shared by `/api/gemini`, `/api/evaluate`, `/api/contact` and `/api/github`.

- **Origin is not authentication.** The allow-list (`PUBLIC_ORIGINS`) only stops other websites from using the endpoints from their visitors' browsers. Scripts can send any header.
- **Abuse limits** are what bound cost:

| Endpoint | Per IP | Site-wide |
|---|---|---|
| `/api/gemini` | 10/min, 100/day | `GEMINI_DAILY_LIMIT` per day (default 500), shared with evaluate |
| `/api/evaluate` | 20/min, 200/day | same cap |
| `/api/contact` | 5/min, 20/day | none |
| `/api/github` | 30/min (per instance) | none (spends only GitHub quota; responses cached 5 min at the edge) |

  The per-IP and site-wide counts are shared across all serverless instances through `public.rate_limit_hit` in Postgres. IPs are hashed with a server-side salt. If the database limiter is unreachable or not migrated, these limits **fail open** with a logged warning, and a per-instance in-memory limit still applies.
- **Input:** JSON bodies only. Prompts are limited to 8000 characters. Drawings must be base64 PNG, JPEG or WebP under about 4 MB. Word, category, time and locale are validated.
- **Upstream:** 20 s timeout to Gemini, 8 s to Supabase and GitHub. Errors return a generic message (`AI service unavailable`); provider details go to the server log only. `/api/gemini` returns only the answer text.

## Content Security Policy and headers (`vercel.json`)

- The CSP is an **HTTP header**. Do not add a `<meta>` CSP (AGENTS.md rule 5). `quran.html` still carries an old one; it only narrows that page further.
- **Site-wide:** `default-src 'self'`; scripts from self, Google Tag Manager and Analytics, AdSense and DoubleClick, and **exact package paths** on jsDelivr (`three@0.160.0`, `@supabase/supabase-js@2`) and unpkg (`three@0.160.0`). It also sets `object-src 'none'`, `base-uri 'self'`, `form-action 'self' https://formsubmit.co`, `frame-ancestors 'self'` and `upgrade-insecure-requests`.
- **`/admin/*`:** stricter rules. The new dashboard and the sign-in pages use `script-src 'self'` with no inline code. The legacy `admin/dashboard.html` still needs `'unsafe-inline'`.
- **Other headers:** HSTS (1 year, preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (`SAMEORIGIN` for `/apps/*`, `/games/*` so the downloads page can preview them), `Referrer-Policy: strict-origin-when-cross-origin` (`no-referrer` on admin), `Permissions-Policy` denying camera, microphone, geolocation, payment, USB, sensors and display capture, `COOP: same-origin`, `CORP: same-origin`.
- **Guard:** `tests/csp.test.mjs` fails if any third-party script in the built pages is not allowed by `script-src`, or if a removed broad host comes back.

### Staged plan for `'unsafe-inline'` (not done yet)

`'unsafe-inline'` remains in the site-wide `script-src` because the shared layout (the GTM consent bootstrap, the font `onload` swap) and the legacy pages and games use inline scripts and handlers. To remove it:
1. Move the layout's inline scripts into `js/` files, and replace `onload="this.media='all'"` with a preload pattern.
2. Give the migrated pages (home, about, contact, King Studio, blog, downloads) a stricter per-route CSP in `vercel.json`, and check them with the violation harness described in `docs/PHASE-02-REPORT.md`.
3. Migrate or isolate legacy pages and games one at a time.

## Android signing

Never generate or pass the keystore through a workflow. See `docs/DEPLOYMENT.md` → Android signing. `apk-build.yml` runs only on `push` to `main` and manual dispatch (never on `pull_request`), uses the four secrets through env (GitHub masks them in logs), deletes the decoded keystore after the build, and refuses to publish an APK that fails `apksigner verify`.

## Known open items

See `docs/PHASE-02-REPORT.md` §10 (remaining issues). The main ones: production verification of the migrations, `'unsafe-inline'`, the same-origin `/king2` and `/auth` rewrites, and direct anon inserts into `contact_messages`.
