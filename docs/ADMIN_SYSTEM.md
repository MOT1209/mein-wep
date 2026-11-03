# Admin System

Status: **Phase 1 (authentication) implemented.** Later phases (dashboard rebuild, King Studio management, CMS, media) extend this file.

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

## 8. Known limitations after Phase 1

- **The existing dashboard still edits legacy tables** that the public site does not read (audit A6). Phase 2 rebuilds the dashboard and connects it to the build.
- **The legacy inline admin bar no longer appears.** `src/js/modules/admin.js` (loaded by the KingCraft showcase) only showed when a browser Supabase session existed. Admin work now happens in `/admin`.
- **Roles:** one role (admin = row in `admin_users`). `admin_profiles` with explicit roles comes with the schema in Phase 8.
- **Not tested against the live Supabase project.** The development environment cannot reach it. The flow is covered by unit tests with a fake Supabase and by a browser run with mocked endpoints (see `TEST_REPORT.md`).
