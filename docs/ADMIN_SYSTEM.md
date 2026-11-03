# Admin System

Status: **authentication (Phase 1) live; dashboard, King Studio, GitHub, media, content and blog management implemented** (see §9). Setup steps: `docs/DEPLOYMENT_GUIDE.md`.

Architecture decision (owner, D1 in `INFRASTRUCTURE_AUDIT.md`): **Option A**. Supabase is the source of truth for editable content. The public site keeps being generated at build time; saving in the admin panel will trigger a Vercel rebuild (Phase 2+).

---

## 1. How sign-in works

```
browser (admin/login.html)
  │ 1. POST {SUPABASE_URL}/auth/v1/token?grant_type=password   ← Supabase checks the password
  │                                                              and rate-limits per real client IP
  │ 2. POST /api/admin/session { access_token, refresh_token }
  ▼
api/admin/session.js
  │ 3. GET  /auth/v1/user          (is the token genuine?)
  │ 4. POST /rest/v1/rpc/is_admin  (is this user in public.admin_users?)
  │ 5. sign-in older than 8 h?     → refuse
  │ 6. Set-Cookie: __Secure-rw_admin_at / __Secure-rw_admin_rt
  │       HttpOnly; Secure; SameSite=Strict; Path=/api/admin
  ▼
admin/dashboard.html → admin/js/admin-client.js → /api/admin/rest (every call re-checked)
```

- **No public registration.** Nothing calls Supabase sign-up. An admin is a row in `public.admin_users`.
- **Non-admins are rejected and their Supabase session is revoked** at step 4, so a stray account cannot keep a session.
- **The browser never stores a token.** The login page drops the tokens as soon as the server has them, and it also deletes any old `sb-*-auth-token` from `localStorage` left by the previous login.
- **The cookies are scoped to `/api/admin`.** They are never sent with page requests or with the `/king2`, `/auth` and `/api/auth` rewrites, which go to another deployment.

## 2. Server-side authorisation

`api/_lib/admin-auth.js` → `requireAdmin(req, res)` is the single guard. **Every protected endpoint must call it first:**

```js
const auth = await requireAdmin(req, res);   // writes 401/403/500 itself
if (!auth) return;
// auth.user, auth.accessToken, auth.env
```

On each call it:

1. rejects writes without an allowed `Origin` **and** the `X-Admin-CSRF: 1` header (CSRF);
2. verifies the access token with Supabase, or refreshes it with the refresh cookie and rotates both;
3. enforces the **absolute 8 h cap**, counted from the password sign-in (`amr` claim);
4. calls `is_admin()`. Removing a user from `admin_users` ends their access on their next request;
5. re-issues the cookies, which slides the **2 h idle window** (never past the 8 h cap).

**No service-role key is used.** Data requests are made with the admin's own JWT and the publishable key, so Supabase Row Level Security still decides every read and write. `supabaseEnv()` refuses to run if `SUPABASE_ANON_KEY` ever holds a secret or service-role key, because `/api/admin/config` serves that value to the browser.

## 3. Endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/admin/config` | GET | none | `{ supabaseUrl, anonKey }`: public values the sign-in page needs |
| `/api/admin/session` | POST | fresh Supabase tokens + CSRF | create the cookie session (admins only), 10/min per IP |
| `/api/admin/session` | GET | session | `{ authenticated, email, expiresAt }` |
| `/api/admin/session` | DELETE | CSRF | sign out: revoke the Supabase session and clear the cookies |
| `/api/admin/rest` | POST | session + CSRF | allow-listed table operations for the dashboard (below), 120/min per IP |

`/api/admin/rest` accepts only these tables: `projects`, `lessons`, `models`, `bot_knowledge`, `prompts`, `codes`, `images`, `media`, `vault_items` (all actions); `contact_messages` (select, delete); `app_updates` (select, update, upsert); `site_stats` (select). It allows plain identifiers only, equality filters only, at most 100 rows per write and at most 500 rows per read. **Update and delete must have a filter.** `admin_users` is not reachable.

## 4. Password reset

1. On the sign-in page, enter the email and choose **Forgot password?**. The page calls Supabase `/auth/v1/recover` with `redirect_to=/admin/reset-password.html`. The reply is the same whether or not the address exists, so the form cannot be used to probe for accounts.
2. The emailed link opens `admin/reset-password.html` with a one-time recovery token in the URL fragment. The page removes the fragment from the address bar straight away, saves the new password (minimum 12 characters), then ends the recovery session and sends you back to the sign-in page.

## 5. Pages and headers

| Page | Notes |
|---|---|
| `/admin`, `/admin/`, `/admin/login.html` | New sign-in page on `css/tokens.css`. No ads, no inline script, no third-party code |
| `/admin/reset-password.html` | New |
| `/admin/dashboard.html` | The existing dashboard, unchanged apart from the client: its Supabase calls now go through `/api/admin/rest`. **AdSense removed** |

`vercel.json` gives every `/admin` path: `Cache-Control: no-store`, `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer` and its own CSP with **no ad or analytics hosts**, `frame-ancestors 'none'`, and `connect-src` limited to self and Supabase. The sign-in and reset pages get the strict CSP `script-src 'self'`. The dashboard still needs `'unsafe-inline'` until Phase 2 replaces its inline handlers.

## 6. Brute-force and rate limits

- **Passwords:** Supabase Auth's per-IP limit on `/auth/v1/token`. The browser talks to Supabase directly, so Supabase sees the real client IP, not Vercel's.
- **Our endpoints:** in-memory fixed-window limiters (per serverless instance, reset on cold start). They slow casual abuse but are not a global counter. A shared limiter (Supabase table or Upstash) is planned with the database work in Phase 8.

## 7. Owner actions required (Phase 1)

These cannot be done from the development environment:

1. **Vercel → Project `rashid-wep` → Settings → Environment Variables**: `SUPABASE_URL` and `SUPABASE_ANON_KEY` (the *publishable/anon* key, never the secret one) must exist for **Production** and **Preview**. `api/contact.js` already uses them; the admin API fails closed with `500 Server misconfigured` without them.
2. **Supabase → Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up".
3. **Supabase → Authentication → URL Configuration → Redirect URLs**: add `https://rashid-wep.vercel.app/admin/reset-password.html`. Without it, reset links go to the Site URL instead.
4. **Supabase SQL editor**: run the read-only queries in `INFRASTRUCTURE_AUDIT.md` Appendix A. Confirm that `admin_users` has exactly your account and that `add_admin_user()` is not executable by `authenticated`/`anon`. If the write policies still say `using (true)`, apply `db/SUPABASE_SETUP_FIXED.sql` and `db/SUPABASE_SECURITY_FIX.sql`. Both are safe to re-run.
5. Recommended: **Supabase → Authentication → Rate Limits**: keep sign-in attempts low (for example 10 per 5 minutes per IP).

## 8. Known limitations

- **The live database is not migrated yet.** Until `supabase/migrations` and the seed are applied (DEPLOYMENT_GUIDE §2), the new dashboard shows a "tables missing" message and the site renders the content in git.
- **The legacy inline admin bar no longer appears.** `src/js/modules/admin.js` (KingCraft showcase) depended on a browser session. Admin work happens in `/admin`.
- **Roles:** `admin_users.role` exists (owner/admin), but every admin has the same rights today.
- **RSS** (`blog/rss.xml`, `/api/rss`) lists the file-based posts only. CMS posts are on their own pages, in the blog index and on the homepage, but not yet in the feed.
- **About and Contact** are written per language in the templates; their texts are not editable in the dashboard yet. Editable: homepage hero, King Studio intro, footer text, menu, brand name, social links, contact email.
- **Not tested against the live Supabase project.** Unit tests use a fake Supabase, the SQL is tested on PGlite, and the dashboard was checked in Chromium with a mocked API (see `TEST_REPORT.md`).

## 9. Dashboard (`/admin/app.html`)

Arabic by default (RTL), English and German. Built from the site tokens, mobile first. The page has no inline script and its own strict CSP. All text goes in through `textContent`.

| Screen | What the owner can do |
|---|---|
| Overview | counts (projects total/published/hidden/in development/featured/trash, repos to review, posts), recent changes, latest activity, website reachability, last publish, last sync, server setup flags |
| King Studio | filter (all/published/hidden/trash), search, section filter; publish/hide, feature, move up/down, move to trash, restore, delete permanently (the GitHub repo is never touched) |
| Project editor | name, slug, section, status, type, category, visibility, featured, short and full description, platforms, technologies, features, cover image and alt text (pick from or upload to the media library), launch/demo/download links, APK id, gallery (add, reorder, remove), German and Arabic translations, linked repository (metadata, unlink) |
| GitHub | sync now; To review / In King Studio / Other / Ignored; add a repo to a section (creates a hidden project), ignore, re-review; daily sync status and enable; private-repo token status; sync history |
| Categories | add, rename (en/de/ar), reorder, delete (projects keep existing without a category) |
| Media library | upload (large images shrunk to WebP in the browser), folders, copy link, replace in place, delete (warns while still used) |
| Pages | homepage hero, King Studio intro, footer text, per language |
| Navigation | add, edit labels (en/de/ar) and links, show/hide, reorder, remove |
| Blog | drafts, publish now, schedule, back to draft, trash, restore, delete permanently; Markdown body, cover, categories, tags, SEO fields |
| Website settings | brand name, contact email, social links |
| Security | signed-in account, session end, password reset email, checklist |
| Activity log | every change with time, who, what and item |

**Publish site** (top bar) rebuilds the public site. Saved changes go live after it, in about a minute. The older dashboard for the legacy tables (lessons, models, vault, contact messages, app updates) stays under **Older tools**.

## 10. CMS API

`POST /api/admin/<resource> { action, ...args }` (`api/admin/[resource].js` → `api/_lib/cms-handlers.js`). Every call: `requireAdmin` → input allow-list (`cms-validate.js`) → Supabase as the admin → `activity_logs`.

| Resource | Actions |
|---|---|
| `overview` | `get` |
| `projects` | `list`, `get`, `create`, `update`, `set_visibility`, `set_featured`, `delete` (soft), `restore`, `purge` (trash only), `reorder`, `set_images` |
| `categories` | `list`, `create`, `update`, `delete` |
| `github` | `list`, `sync`, `logs`, `approve`, `ignore`, `unignore`, `link`, `unlink`, `schedule_status`, `schedule_enable` |
| `media` | `list`, `upload`, `delete` |
| `content` | `settings_list`, `settings_set`, `settings_delete`, `pages_get`, `pages_set`, `nav_list`, `nav_create`, `nav_update`, `nav_delete`, `nav_reorder` |
| `blog` | `list`, `get`, `create`, `update`, `publish`, `unpublish`, `delete`, `restore`, `purge` |
| `activity` | `list` |
| `publish` | `run` |
