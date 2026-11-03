# Test Report

Only results that were actually executed are listed. Each entry names the environment it ran in.

## Phase 1: admin authentication (2026-11-03, cloud dev container, Node 22)

### Commands

| Command | Result |
|---|---|
| `npm run build` | ✅ 41 pages written, 362 files copied |
| `npm run verify` | ✅ `URL-surface PARITY OK — 403 expected, 403 in dist/` (+6 new admin files: 1 page, 1 stylesheet, 4 scripts) |
| `npm test` | ✅ 56 tests, 56 pass, 0 fail, 0 skipped (38 existing + 18 new in `tests/admin-auth.test.mjs`) |

### New unit tests (`tests/admin-auth.test.mjs`, fake Supabase, no network)

- GET session without cookies → 401 with `Cache-Control: no-store`
- Missing Supabase env → 500 with a generic message
- A service-role key in `SUPABASE_ANON_KEY` is refused and never served
- `/api/admin/config` returns only the URL and the publishable key
- POST session without Origin, with a foreign Origin, or without the CSRF header → 403, no cookies
- A non-admin sign-in → 403, the Supabase session is revoked and no cookies are set
- An admin sign-in → two cookies, each `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/api/admin`; the token is not echoed back
- A sign-in older than 8 h → 401 on POST and on GET, and the cookies are cleared
- A valid cookie → 200, and the idle window is re-issued (~2 h)
- An expired access token → refreshed with the refresh cookie, and the refresh token is rotated
- An admin removed from `admin_users` → 403 on the next request
- DELETE session needs the CSRF header, revokes the session and clears the cookies
- rest: unauthenticated → 401; missing CSRF → 403
- rest: unknown table (`admin_users`), a forbidden action, an unfiltered update or delete, injected column, filter or key names → 400
- rest: forwards with the admin's JWT and the publishable key, translating filters and order correctly
- Admin pages: no ads or analytics, no browser Supabase client, `noindex`; the sign-in and reset pages have no inline script, style or handlers
- Admin scripts never write tokens to `localStorage`/`sessionStorage`
- `vercel.json`: every `/admin` rule has a CSP without ad hosts, `frame-ancestors 'none'` and `no-store`; the sign-in CSP has no `'unsafe-inline'` scripts; `/api/admin` is not rewritten

### Browser check (Playwright Chromium, `dist/` served locally, `/api/admin/*` and Supabase mocked)

| Width | Check | Result |
|---|---|---|
| 375 and 1280 | Sign-in page renders, no horizontal scroll | ✅ |
| 375 and 1280 | Wrong password → "Email or password is wrong." | ✅ |
| 375 and 1280 | Right password → session POST → dashboard shown | ✅ |
| 375 and 1280 | Dashboard `scrollWidth` equals the viewport | ✅ |
| 375 and 1280 | Logout → back to sign-in with "You are signed out." | ✅ |
| 375 | `/admin/dashboard.html` without a session → redirected to sign-in | ✅ |
| 375 (dark) | Reset link: token removed from the URL, form shown; short password refused; valid password → sign-in page with confirmation | ✅ |
| 375 | Reset page without a token → "invalid or has expired" | ✅ |

External fonts and Font Awesome were blocked in this environment, so typography and icons were not judged from these screenshots.

### Not tested

- **Against the live Supabase project or on Vercel.** The container's network proxy refuses both. Real sign-in, real cookie behaviour on `rashid-wep.vercel.app` and the reset email must be checked after a preview deploy.
- Accessibility audit with a screen reader.
