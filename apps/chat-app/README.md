# Chat App — Backend

Realtime chat backend: **PostgreSQL + REST + WebSocket**, TypeScript (ESM), Express, `ws`, raw `pg`.

- API reference: **[docs/API.md](docs/API.md)**
- Frontend is built separately against that document — the backend owns the contracts.

## Stack

| Concern | Choice |
| --- | --- |
| Runtime | Node ≥ 20 (ESM, `"type": "module"`) |
| HTTP | Express 4 + `helmet` + `cors` + `express-rate-limit` + `cookie-parser` |
| Validation | `zod` (`middleware/validate.ts`) |
| DB | `pg` (no ORM), SQL migrations in `migrations/` |
| Auth | JWT access token (Bearer) + rotating opaque refresh token in an `httpOnly` cookie, `bcryptjs` (cost 12 prod / 4 test) |
| Realtime | `ws` — first frame must be `{type:"auth",token}`, then the socket is bound to the user |
| Tests | Vitest + supertest, against an embedded PostgreSQL 17 |

## Quick start

```bash
npm install

# 1. Start a database (bundled PostgreSQL 17 — no Docker, no system install)
npm run db:start          # leaves it running, prints DATABASE_URL

# 2. Configure
cp .env.example .env      # paste the printed DATABASE_URL, set a real JWT_SECRET

# 3. Migrate + run
npm run migrate
npm run dev               # http://localhost:4000
```

`GET /health` → `{ "status": "ok", "uptime": … }`.

Already have Postgres (Docker, Supabase, Neon)? Just point `DATABASE_URL` at it and skip `npm run db:start`.

### Environment

See `.env.example` for the full list. Required: `DATABASE_URL`.
Production-critical: `JWT_SECRET` (≥ 32 chars), `CORS_ORIGINS` (comma-separated frontend origins), `NODE_ENV=production` (enables `Secure` cookies and cost-12 password hashing).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | API with watch mode (`tsx watch`) |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run `dist/server.js` |
| `npm run migrate` | Apply `migrations/*.sql` (idempotent, tracked in `schema_migrations`) |
| `npm run db:start` | Start the bundled PostgreSQL 17 in the foreground (dev only) |
| `npm test` | Full suite — boots its own isolated Postgres, runs migrations, then the tests |
| `npm run typecheck` / `npm run lint` | `tsc --noEmit` over `src` and `tests` |

## Database

Schema lives in `migrations/001_init.sql`:

- `users`, `refresh_tokens`
- `conversations` (+ partial unique `direct_key` for 1:1 chats)
- `conversation_participants` (read/delivered pointers per user)
- `messages`

Migrations run automatically in tests; in dev/prod run `npm run migrate`.

**No Docker on this machine:** `src/db/embedded.ts` provisions a real PostgreSQL 17 from the `embedded-postgres` npm package into `.pgdata/` (dev) and `.pgdata-test/` (tests). Both directories are gitignored. First boot downloads/extracts the binaries; `initdb` runs with `--encoding=UTF8 --locale=C` so UTF-8 migrations work on a Windows host.

## Testing

```bash
npm test
```

`tests/globalSetup.ts`:

1. starts an embedded PostgreSQL on port **5434** (persistent data dir, wiped before each run),
2. refuses to run if the server encoding is not UTF-8,
3. applies migrations,
4. sets `DATABASE_URL` for every worker (the Vitest config does **not** set it),
5. stops the server on teardown and kills any stray `postmaster`.

Workers run serially (`fileParallelism: false`) because they share one database.

`TEST_DATABASE_URL` overrides the database — **never point it at anything you care about**, the suite truncates its tables.

## Layout

```
src/
  app.ts                 # Express app: security, CORS, /health, routers, error handler
  server.ts              # HTTP server + WebSocket gateway attach
  config/                # env (zod), pg pool + query helpers
  db/                    # migrate, embedded-postgres provisioner, dev starter
  lib/                   # errors, logger, password, tokens
  middleware/            # auth, validate (zod), rateLimit, security, errorHandler
  modules/
    auth/                # register, login, refresh, logout, me
    users/               # profile, search, public profile
    conversations/       # conversations + messages + read receipts
    messages/            # DELETE /messages/:id
  realtime/              # hub (socket registry), presence, events (zod contracts), gateway
  types/                 # DTOs + express Request augmentation
migrations/              # 001_init.sql
tests/                   # auth, users, conversations, authorization, realtime
docs/API.md              # contract for the frontend
```

## Security notes

- Access tokens are short-lived (`15m`); refresh tokens are opaque, hashed with SHA-256 at rest, rotated on every refresh, and stored in an `httpOnly` cookie scoped to `/api/v1/auth`.
- Tokens are never accepted from the WebSocket query string — the first frame carries them.
- Non-membership and unknown ids both answer `404`, so ids cannot be probed.
- Login does not disclose whether an account exists.
- `helmet` headers, strict CORS allowlist, per-route rate limits, 16 KB WebSocket payload cap.
- `textContent`-safe by construction: the API returns structured JSON only.
