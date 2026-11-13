# Database Audit (Phase 01)

## Access

**[FACT] The live Supabase project was not accessible**: no credentials, and the session's network policy is restricted. Everything below comes from the SQL in the repo, the code that queries it, and a **local PGlite replay** (an in-memory Postgres, nothing remote). The build log confirms that the CMS fetch skipped Supabase: `[cms] Supabase not configured for this build: using the content in git.`

`docs/ADMIN_SYSTEM.md:98` says *"The live database is not migrated yet"*. Whether that is still true **could not be verified**.

## Two schema sources

| Source | How it is applied | Tested? | Tables |
|---|---|---|---|
| `db/*.sql` (9 files, legacy) | pasted by hand into the SQL editor, in the order from `SUPABASE_MIGRATIONS.md` | **no** | `projects`, `site_stats`, `bot_knowledge`, `admin_users`, `lessons`, `models`, `vault_items`, `prompts`, `codes`, `images`, `media`, `contact_messages`, `app_updates`, farm-game tables (`game_saves`, `player_stats`, `player_achievements`, `leaderboard`, `daily_quests`, `seasonal_events`, `game_inventory`) |
| `supabase/migrations/*.sql` (2 files, versioned) | migration files, additive and re-runnable | **yes**, `tests/db.test.mjs` (13 tests) on PGlite | `admin_users` (+ `role`), `project_categories`, `github_repositories`, `studio_projects`, `project_images`, `website_settings`, `website_pages`, `navigation_items`, `blog_posts`, `github_sync_logs`, `activity_logs`, `private.app_secrets`, `private.rate_limits`; storage bucket `media` |

**[FACT]** `db/SUPABASE_SETUP.sql` is destructive: it starts by dropping tables (`:15-…`), and its own header warns about this.

## RLS review

### Versioned CMS (`supabase/migrations/20261103120000_admin_cms.sql`): good

- Reads: public rows for everyone, all rows for admins (`:305-322`). Blog posts become public only when `status='published' and published_at <= now() and deleted_at is null`.
- Writes: `is_admin()` only (`:325-337`). Logs are append-only, and `activity_logs` requires `actor_id = auth.uid()`.
- Grants: insert, update and delete are revoked from `anon` explicitly.
- `is_admin()`, `admin_set_cron_secret`, `github_sync_apply` and `rate_limit_hit` are all `SECURITY DEFINER` with `search_path = ''`, and they check the caller.
- Storage: anyone can read public files; listing, insert, update and delete require `is_admin()`.

### Legacy (`db/`): issues found by replay

I replayed `db/` files 1–6 and 8 in the documented order on PGlite with `tests/db/supabase-stubs.sql`, plus Supabase-like default grants and a stub `supabase_realtime` publication. The script is in the session scratchpad and was not committed.

| Table | Non-admin signed-in user, insert | Policies left after the replay |
|---|---|---|
| `models` | **ALLOWED** (update ALLOWED too) | old `"Admins can … models"` with `true`, plus new `is_admin()` ones (OR-ed) |
| `projects` | denied | select `"Admins can view all projects"` is still `using (true)` (S-09) |
| `bot_knowledge` | denied | fixed by `SUPABASE_SETUP_FIXED.sql` |
| `vault_items` | denied | fixed by `SECURITY_FIX` / `PHASE1_FIX` |
| `lessons` | denied | uses admin checks |

Other facts:
- `db/SUPABASE_SECURITY_FIX.sql` **fails** on a fresh replay (`function public.add_admin_user() does not exist`), because `SETUP_FIXED.sql:67` drops that function first. The index says it is idempotent; it is not.
- `contact_messages`: `anon` may insert directly (`with check (true)`). Length checks exist, but they are `NOT VALID`, so old rows are not checked.
- `app_updates`: writes are `is_admin()` only. The seed rows (`db/SUPABASE_APP_UPDATES.sql`) list older versions than `apks/updates.json` (for example `farm-game-v2.0.0` vs the shipped `v2.5.0` APK), a **data consistency** gap if the table is the source the apps read.

## Indexes and performance

- The CMS migration defines primary keys, uniques and FK columns. Tables are small (a personal site), so no bottleneck is expected **[ASSUMPTION]**.
- `private.rate_limits` cleans itself up probabilistically (2 % of calls). This is fine at this scale.
- Admin reads cap at 500 rows (`api/admin/rest.js`: `Range 0-499`), and lists have no pagination beyond that. This is acceptable for now.
- Queries: every server call goes through PostgREST with the user's JWT, and none uses raw SQL. `api/rss.js` uses a 2.5 s timeout and falls back to the git content.

## Error handling

- `api/_lib/supabase-rest.js` maps PostgREST errors to `DbError`, and `[resource].js` returns a 4xx with the message.
- `sharedLimited()` **fails open** if the database is unreachable (documented, deliberate).
- `api/contact.js` logs the Supabase body on failure and returns a generic 500. Good: no detail is leaked.

## Auth integration

- Admins are rows in `public.admin_users`, with roles `owner` and `admin`. There is no sign-up path in the admin UI.
- **[ASSUMPTION]** Public sign-up is enabled in Supabase Auth for the farm game (`signUp` in `games/farm-game/js/systems/DatabaseService.js:95-105`). That is what makes S-01 exploitable.

## Recommendations

1. Read the live policies first (`select tablename, policyname, cmd, roles, qual, with_check from pg_policies where schemaname='public'`), and compare them with this report.
2. Write `supabase/migrations/<ts>_legacy_baseline.sql`: an idempotent definition of the legacy tables as they should be. Drop the four permissive `models` policies and the `projects` select-all policy. Add `search_path` to `increment_visitor_count`. Extend `tests/db.test.mjs` to cover the legacy tables.
3. Mark `db/` as archived (read-only history), and point `SUPABASE_MIGRATIONS.md` at the versioned folder.
4. Decide on one content model: migrate or retire the legacy tables that overlap the CMS (`projects` vs `studio_projects`, `media` vs the storage `media` bucket).
5. Bring `app_updates` in line with `apks/updates.json`, or generate one from the other.
