# Route map — two hosts, do not conflate

Any test suite/tool hitting this project must target the correct host per route.
Mixing these up produces false "404 / missing route" failures — see `runs/` history.

## Host 1 — the site itself (test everything below against this)
Primary: `https://rashid-wep.vercel.app`
Mirror:  `https://mot1209.github.io/fromliten/`

All pages and the custom API live here:
- `/about.html`, `/privacy.html`, `/terms.html`, `/offline.html`, `/contact.html`, `/index.html`
- `/blog/`, `/blog/rss.xml`, `/blog/posts.json`
- `/admin/login.html`, `/admin/dashboard.html` (page only — auth itself goes through Host 2, see below)
- `/games/` (`/games/kingcraft-game/`, `/games/rust-game/`, `/games/farm-game/`)
- `/apps/calculator-app/`, `/apps/quran-app/`, `/apps/quiz-app/` (not `calculator-vault`/`quran-pro`/`quiz-master` — those are marketing names, not folder slugs)
- `/models/Rashid-Model/`
- `/vault/{prompts,docs,code,media,archive,api}/` — each is a single static page; there is no per-item server route (`/vault/{categoryId}/{itemId}` is not a thing — items render client-side inside the category page)
- `/api/gemini` (POST), `/api/github` (GET), `/api/rss` (GET), `/api/contact` (POST) — Vercel serverless functions in `api/*.js`

## Host 2 — Supabase backend (only test REST/Auth paths here)
`https://kcltollasghlvuoxvjqa.supabase.co`

This is Supabase's own API gateway (Kong). It ONLY recognizes:
- `/rest/v1/*` — e.g. `/rest/v1/contact_messages` (requires `apikey` header; anon insert allowed via RLS, see `SUPABASE_CONTACT_FIX.sql`)
- `/auth/v1/*` — e.g. `/auth/v1/token?grant_type=password` (admin login goes through here, called client-side by `supabase-js`, not through a `/admin/login` REST path)
- `/storage/v1/*`, `/functions/v1/*`

Any other path (`/about.html`, `/admin`, `/blog`, `/contact`, `/apps/...`, etc.) returns
`404 {"error":"requested path is invalid"}` here **by design** — that's Kong's generic
catch-all for unrecognized paths, not a sign the app is missing a route.

Requests to Host 2 also require both `apikey` and `Authorization: Bearer <key>` headers;
sending only one produces `401 Invalid API key` regardless of path validity.

## Reference implementation
`.testsprite/test3.py` already does this correctly: it reads the current anon key from
`js/supabase-config.js` (single source of truth), sends page/app requests to Host 1,
and only routes `/rest/v1/*` and `/auth/v1/*` calls to Host 2.
