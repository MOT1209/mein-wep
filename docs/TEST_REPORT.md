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

## Phases 2–12: CMS, King Studio, GitHub, media, blog (2026-11-03, cloud dev container, Node 22)

### Commands

| Command | Result |
|---|---|
| `npm run build` | ✅ (without Supabase env: `[cms] Supabase not configured … using the content in git`) |
| `npm run verify` | ✅ `URL-surface PARITY OK — 415 expected, 415 in dist/` |
| `npm test` | ✅ **107 tests, 107 pass, 0 fail, 0 skipped** |
| `npm audit` | 1 moderate (minimatch, build-time; see SECURITY_AUDIT R8). The high markdown-it advisory is fixed. |
| Fallback parity | ✅ built without the CMS, every page is byte-identical to the pre-CMS build (`diff -r`), except the intended changes: `blog/index.html` (cards now built with `textContent`), the new empty `blog/cms-posts.json`, two stylesheets with added rules, and the admin files (`admin/app*`, `admin/js/login.js`) |

### Per file

| File | Tests | What it covers |
|---|---|---|
| `tests/db.test.mjs` | 12 | migration + seed apply and re-apply on PGlite; seed mirrors the catalogue; RLS as anon / signed-in non-admin / admin; soft delete and restore; unsafe links, missing alt text and bad slugs rejected by constraints; drafts and future posts not public; `github_sync_apply` access, review decisions never overridden, owner fields untouched, missing detection (public-only listings never mark private repos); repo metadata public only for public projects; media bucket rules; private schema unreachable |
| `tests/admin-api.test.mjs` | 19 | session + CSRF on every resource, prototype keys rejected; admin JWT + publishable key only; create/validate/log; soft delete and purge-from-trash; GitHub is never written; KING matching (`booking` does not match); sync payload; approve → hidden project; scheduled-sync secret never returned; uploads typed by bytes (SVG/HTML refused, folder traversal refused, size cap); upload as admin; delete refused while referenced; settings/pages/nav validation; blog drafts, slug clash with file posts, scheduling; deploy hook validation; overview flags are booleans; `safeUrl`; cron auth and RPC payload |
| `tests/cms-build.test.mjs` | 11 | full Eleventy build from a CMS fixture: pages in 3 languages; external image/demo/GitHub links; escaped DB text; categories per language; hidden CMS project has no page, card or download; URL gate matches the build; build fails on an unsafe link; menu/brand/home/footer from the CMS with `javascript:` links dropped; CMS blog post page with Markdown raw HTML and `javascript:` links removed; JSON-LD cannot be closed; posts in index list and homepage; a file-based post is never overwritten |
| `tests/admin-app.test.mjs` | 8 | translations complete in ar/en/de; every used key exists; no HTML sinks; no inline script or third parties; strict CSP; dashboard page fields match what templates read; sign-in opens the dashboard |
| `tests/admin-auth.test.mjs` | 19 | Phase 1 sessions (see above) |
| existing suites | 38 | unchanged and passing |

Mutation check: deliberately breaking four rules (purge outside the trash, approve publishing directly, loose KING matching, skipping the image type check) made the matching API tests fail, and they passed again once restored.

### Browser checks (Playwright Chromium, `dist/` served locally, API mocked)

| Check | Result |
|---|---|
| Dashboard: all 13 screens at 375 px (Arabic) and 1280 px (Arabic, English) render without errors and without horizontal scroll | ✅ |
| Direction: `dir=rtl` in Arabic, `ltr` in English; layout mirrors | ✅ |
| Mobile menu opens and closes (Escape) | ✅ |
| Move to trash asks for confirmation (dialog names the project), then calls the API | ✅ |
| Project editor saves the expected fields (HTML in text is sent as text) | ✅ |
| Blog index after the `innerHTML` rewrite: 8 posts, 14 categories, no errors | ✅ |

### Not tested

- Against the live Supabase project: the migration has not been applied there yet, and the network to Supabase is blocked from this environment.
- Real uploads to Supabase Storage, the real Vercel Deploy Hook and the real cron run.
- Screen-reader pass and Lighthouse scores.
- Fonts and Font Awesome icons (blocked in this environment, so screenshots use fallback fonts).

## Follow-up pass: remaining limitations (2026-11-04)

| Command | Result |
|---|---|
| `npm run build` | ✅ |
| `npm run verify` | ✅ `URL-surface PARITY OK — 416 expected, 416 in dist/` |
| `npm test` | ✅ **118 tests, 118 pass, 0 fail, 0 skipped** |
| `npm audit` | 1 moderate (minimatch via @11ty/recursive-copy; build-time; fix is under two weeks old) |

New or changed tests: RSS with CMS posts (static and live, Supabase down → file posts only); About and Contact overrides; `rate_limit_hit` on PGlite (per bucket, window reset, bad input, private table); shared limit → 429 for sign-in and publish, with the IP hashed; owner-only actions refused for role `admin`; messages and app-update validation; GitHub proxy origin rules and query handling; fetch-cms production/preview fallback rules.

Parity: without the CMS, `/api/rss` is byte-identical to before and `/blog/rss.xml` differs only by one whitespace-only line. About and Contact pages are byte-identical.

Browser: the Messages and App updates screens at 375 and 1280 px (Arabic): no errors, no horizontal scroll, and HTML in a sender name is shown as text.

## Sign-in page fixes: show-password eye, honest reset result (2026-11-04)

`tests/admin-login-ui.test.mjs` (8 tests) runs the real `login.js` and `password-toggle.js` in a minimal fake browser against fake Supabase answers: reset success only on an accepted request; refusals (400 not authorised, 429, 500, 503, 422) shown with their reason and never green; unknown or missing email; sign-in errors for wrong credentials, unconfirmed, banned, rate limit, outage; successful sign-in clears the field and opens the dashboard; a non-admin is told so; the toggle switches one or two fields, labels and pressed state, and hides again on page hide; both pages carry the control with a 44 px target and no inline script or style. **Mutation check:** restoring the old "anything but 429 is success" behaviour made the refusal test fail.

Browser (Playwright Chromium, 375 px, dark mode, mocked Supabase): password hidden by default, the eye shows and hides it (44×44 px), refused reset shows the SMTP hint in the normal style, accepted reset shows the green message, the reset page's single eye controls both fields, no horizontal scroll.

**Not tested:** a real reset email from the live Supabase project (it depends on the project's mail settings, see DEPLOYMENT_GUIDE §1).

## Sign-in with a real Supabase session (2026-11-04)

**Found by the owner on the live site:** after Supabase accepted the password, the page said "Sign-in failed". Cause: `api/admin/session` required refresh tokens of 16+ characters, but Supabase's real refresh tokens are about 12 characters, so every real sign-in got `400 Missing session tokens`. All earlier tests and mocks used 20-character refresh tokens, so none noticed. Fixed with a separate refresh-token check (8–512 characters, same safe character set).

New tests use the real shape: sign-in and later requests with a 12-character refresh token, renewal of an expired access token with one, and garbage (too short, too long, spaces, separators, markup) still refused. They fail on the old code and pass on the fix.

Also checked in Chromium with the **real Content-Security-Policy headers from `vercel.json`** applied by a small server (earlier browser checks used a server without them): all 15 dashboard screens, the publish dialog and both password pages: 0 policy violations, styles applied. A new static test keeps inline style attributes out of the dashboard code.
