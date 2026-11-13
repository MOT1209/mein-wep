# Deployment

The site is a static Eleventy build served by Vercel (project `rashid-wep`, production branch `main`). The CMS and admin steps are in `docs/DEPLOYMENT_GUIDE.md`; this page is the overview.

## Commands

```bash
npm ci            # Node 20-24 (CI uses 22)
npm run lint      # syntax of first-party JS, no secrets in api/
npm run build     # CMS prebuild -> CSS minify -> Eleventy -> dist/
npm run verify    # dist/ must equal the tracked, servable files
npm test          # node:test suites (PGlite for the database)
```

CI (`.github/workflows/ci.yml`) runs the secret scan, then `lint`, `build`, `verify`, `test` and `npm audit --audit-level=high` on every pull request and on `main`.

## Release flow

1. Work on a branch and open a pull request. CI must be green.
2. The owner approves and merges. **Merging to `main` deploys to production** (Vercel builds `main` with `npm run build`).
3. Check the deployment: Vercel shows `READY`, the key pages load, and there are no runtime errors in Vercel → Logs.
4. Rollback: Vercel → Deployments → promote the previous deployment, or revert the merge commit.

Only git-tracked files reach `dist/` (`eleventy.config.mjs`). A new file must be `git add`-ed. Never use `git add .` or `git add -A` (AGENTS.md rule 1).

## Database migrations

Supabase is not migrated automatically. The owner runs the files in the SQL editor, in order:

1. `supabase/migrations/20261103120000_admin_cms.sql`
2. `supabase/migrations/20261104090000_rate_limits.sql`
3. `supabase/migrations/20261113120000_legacy_rls_hardening.sql`
4. `supabase/seed/20261103120100_seed_cms.sql` (first time only; it skips rows that already exist)

All are safe to re-run. Never re-run `db/SUPABASE_SETUP.sql` on a live database: it drops tables. `db/` is the historical record of the hand-run legacy SQL (`SUPABASE_MIGRATIONS.md`). New changes go to `supabase/migrations/` with a PGlite test.

## Environment variables (Vercel, names only)

| Name | Required | Used by |
|---|---|---|
| `SUPABASE_URL` | yes | contact form, CMS build, admin API, RSS, shared rate limits |
| `SUPABASE_ANON_KEY` | yes | the same (publishable key only) |
| `GEMINI_API_KEY` | for AI features | `/api/gemini`, `/api/evaluate` |
| `GEMINI_DAILY_LIMIT` | no (default 500) | site-wide daily cap on Gemini calls |
| `RATE_LIMIT_SALT` | recommended | salt for hashed IPs in rate-limit buckets (falls back to `CRON_SECRET`) |
| `CRON_SECRET` | for the daily sync | `/api/cron/github-sync` (32+ characters) |
| `VERCEL_DEPLOY_HOOK_URL` | for Publish | admin Publish button, rebuild after sync |
| `GITHUB_TOKEN` | no | `/api/github` and the sync (higher GitHub limits, private repos) |
| `CMS_REQUIRED`, `CMS_DISABLE`, `CRON_REBUILD` | no | see `docs/DEPLOYMENT_GUIDE.md` |

No Supabase service-role key is needed or allowed.

## Android signing

APKs are built by `.github/workflows/apk-build.yml` (Capacitor) and published to the `apks-latest` GitHub Release. A full run publishes files, so ask the owner before dispatching it.

**One-time keystore setup, on your own computer (never in CI):**

```bash
keytool -genkeypair -v -keystore rashid-release-key.jks -alias rashid-key -keyalg RSA -keysize 2048 -validity 10000
```

```bash
base64 -w0 rashid-release-key.jks > rashid-release-key.b64
```

Then, in GitHub → Settings → Secrets and variables → Actions, add `KEYSTORE_BASE64` (the content of the `.b64` file), `KEYSTORE_PASSWORD`, `KEY_ALIAS` (`rashid-key`) and `KEY_PASSWORD`. Delete the `.b64` file. Keep the `.jks` and its passwords in a password manager **and** an offline backup: Android rejects updates signed with a different key, so losing it means a new app listing.

Without these secrets, the workflow signs with a throwaway key and warns. Such APKs cannot be updated by a correctly signed build later.

The old `setup-keystore.yml` workflow was removed in Phase 02: it echoed the passwords into the job log and uploaded the keystore as an artifact.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `verify` fails after adding a file | file not tracked, or a new served path | `git add` it; for a new page also update `scripts/site-templates.mjs` |
| Build log: `[cms] Supabase not configured` | `SUPABASE_URL` / `SUPABASE_ANON_KEY` missing | set them in Vercel; the build uses git content meanwhile |
| `/api/gemini` returns 500 `Server misconfigured` | `GEMINI_API_KEY` missing | set it in Vercel |
| `/api/gemini` returns 503 | site-wide daily cap reached | wait, or raise `GEMINI_DAILY_LIMIT` |
| Log: `shared rate limit unavailable` | Supabase env missing | set the env vars; until then only per-instance limits apply |
| Rate limits never trigger across instances | `20261104090000_rate_limits.sql` not applied | apply it (the limiter fails open without it) |
| A page's script is blocked | CSP | add the exact host or path to `vercel.json`; `tests/csp.test.mjs` shows which |
| Admin sign-in: "Not an administrator" | user not in `admin_users` | insert the user's id in the SQL editor (`docs/DEPLOYMENT_GUIDE.md` §1) |
