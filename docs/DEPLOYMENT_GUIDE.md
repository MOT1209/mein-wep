# Deployment Guide

How to take the admin CMS live. The site deploys from `main` on Vercel (project `rashid-wep`). Merging a PR deploys it.

**The order matters.** Until step 2 is done the site keeps rendering the content in git, exactly as before. Nothing breaks while you set things up.

## 0. Already done

| What | Where | Status |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` (publishable key) | Vercel → Environment Variables, **Production + Preview** | ✅ set (Preview added on 2026-11-03) |
| Admin sign-in, sessions, password reset | `/admin/` | ✅ live since PR #21 |

## 1. Supabase settings (dashboard, once)

1. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up".
2. **Authentication → URL Configuration → Redirect URLs**: add
   - `https://rashid-wep.vercel.app/admin/reset-password.html`
   - `https://rashid-wep-git-*-mot1209s-projects.vercel.app/**` (preview deployments)
3. **Authentication → SMTP Settings**: set up your own mail service (for example Resend, Brevo or a Gmail app password). **Without it, password-reset emails may never arrive.** Supabase's built-in mail service is meant for testing: it may only deliver to members of your Supabase organisation and allows very few emails per hour. The sign-in page now shows the real reason when Supabase refuses to send, instead of a success message.
4. **SQL editor**: run the read-only checks in `docs/INFRASTRUCTURE_AUDIT.md`, Appendix A. `admin_users` must contain exactly your account.

### If you cannot sign in (forgotten password, or no reset email)

The password is stored by Supabase Auth, hashed, in `auth.users`; our own tables never hold it. To set one without an email, in the SQL editor first check that the account exists and which exact address it uses:

```sql
select email, email_confirmed_at from auth.users;
```

Sign in with **that exact address**. If `email_confirmed_at` is empty, confirm the account in **Authentication → Users**. To set a new password directly (replace both placeholders; delete the query from the editor's history afterwards):

```sql
update auth.users
set encrypted_password = extensions.crypt('NEW-PASSWORD-AT-LEAST-12-CHARS', extensions.gen_salt('bf'))
where email = 'your-address@example.com';
```

Then make sure the account is an admin: `select email from public.admin_users;` must list it.

## 2. Apply the database migration and seed

In **Supabase → SQL editor**, paste and run these files from the repository, **in this order**:

1. `supabase/migrations/20261103120000_admin_cms.sql`: tables, RLS policies, sync functions and the media bucket.
2. `supabase/migrations/20261104090000_rate_limits.sql`: shared rate limits.
3. `supabase/seed/20261103120100_seed_cms.sql`: copies today's catalogue, categories, navigation and site name.

Both files are **additive and safe to re-run**. They never drop or overwrite a table, and the seed skips rows that already exist. The legacy tables (`projects`, `lessons`, …) are untouched.

Check: open `/admin/app.html#/studio`. You should see the 8 catalogue projects (6 hidden, 2 published).

From the next deploy on, the build reads the published content from Supabase. Its log shows `[cms] using Supabase: …` instead of `[cms] Supabase not configured`.

## 3. Publish button (Vercel Deploy Hook)

1. Vercel → Project `rashid-wep` → **Settings → Git → Deploy Hooks**: create a hook named `admin-publish` for branch `main`.
2. Copy the URL. It looks like `https://api.vercel.com/v1/integrations/deploy/prj_…/…`.
3. Add it as **`VERCEL_DEPLOY_HOOK_URL`** (type *Sensitive*, **Production**).
4. Redeploy once so the functions see it.

The dashboard's **Publish site** button and the daily job then rebuild the site. Treat the hook URL like a password: anyone who has it can trigger rebuilds, though not change content.

## 4. Daily GitHub sync (optional, recommended)

1. Generate a random secret of at least 32 characters, for example `openssl rand -hex 32` on your computer.
2. Add it as **`CRON_SECRET`** (Sensitive, Production) and redeploy.
3. In the dashboard → **GitHub** → press **Enable daily sync**. This stores only a SHA-256 hash of the secret in Supabase.

Vercel then calls `/api/cron/github-sync` once a day at about 03:23 UTC (Hobby crons are approximate). After a successful sync it starts a rebuild, so GitHub metadata and blog posts scheduled for that day go live. Set `CRON_REBUILD=0` to turn the rebuild off.

## 5. Private repositories (optional)

Without a token the sync sees public repositories only (20 of 24 today). To include private ones:

1. GitHub → Settings → Developer settings → **Fine-grained token**. Resource owner `MOT1209`, repository access as you choose. Permissions: **Metadata: Read-only**, nothing else.
2. Add it as **`GITHUB_TOKEN`** (Sensitive, Production) and redeploy.

The existing `api/github.js` proxy also uses `GITHUB_TOKEN` if present, for higher rate limits.

## 6. Production builds and the CMS (automatic)

Nothing to set. On a Vercel **production** build, any CMS failure other than "tables not created yet" stops the build, and the previous deployment stays live, so a project hidden in the CMS can never reappear. Previews and local builds fall back to git with a warning.

`CMS_REQUIRED=1` makes every failure fatal, including missing tables. `CMS_REQUIRED=0` always allows the fallback, for example during a Supabase outage when you must deploy a code fix.

Leave it unset for Preview if you want previews to build without Supabase.

## Environment variables (names only)

| Name | Needed for | Scope |
|---|---|---|
| `SUPABASE_URL` | everything with the CMS, contact form | Production, Preview |
| `SUPABASE_ANON_KEY` | the same (publishable key only; the server refuses a secret key) | Production, Preview |
| `VERCEL_DEPLOY_HOOK_URL` | Publish button, rebuild after the daily sync | Production |
| `CRON_SECRET` | daily GitHub sync | Production |
| `GITHUB_TOKEN` | private repos in the sync (optional) | Production |
| `CMS_REQUIRED` | optional: `1` = every CMS failure is fatal, `0` = always fall back (production default: stop on failures, see §6) | Production |
| `RATE_LIMIT_SALT` | optional: salt for the shared rate-limit buckets (falls back to `CRON_SECRET`) | Production |
| `CRON_REBUILD` | `0` = no rebuild after the daily sync (optional) | Production |
| `GEMINI_API_KEY` | existing AI proxy, unchanged | Production |

**Never** add a Supabase service-role key. Nothing in this system needs one.

## Verifying a deployment

1. Vercel deployment state is **READY**.
2. `/admin/` shows the sign-in page, and signing in opens `/admin/app.html`.
3. The overview shows real counts and "Server setup" flags for steps 3–5.
4. Change a project's short description, press **Publish site**, wait about a minute, and check the King Studio page.
5. Vercel → Logs: no `[cms] WARNING` line in the build log and no runtime errors on `/api/admin/*`.

## Rollback

- **Content:** hidden or trashed items can be restored in the dashboard, and every change is in the activity log.
- **Code:** Vercel → Deployments → promote the previous deployment (instant), or revert the merge commit.
- **Database:** the migration only adds objects. To stop the CMS from feeding the site without touching data, set **`CMS_DISABLE=1`** (and remove `CMS_REQUIRED` if set); the build then uses the content in git.
