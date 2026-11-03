# Database Schema

Supabase project `kcltollasghlvuoxvjqa` (Postgres). The CMS schema is defined in **versioned migrations** under `supabase/migrations/`, with seed data in `supabase/seed/`. Older one-off scripts are in `db/` (see `SUPABASE_MIGRATIONS.md`); the CMS does not depend on them, but re-creates `admin_users` and `is_admin()` if they are missing.

`tests/db.test.mjs` applies every migration and seed to PGlite (in-process Postgres) and checks the policies as anon, a signed-in non-admin and the admin, on every `npm test`.

## Conventions

- UUID primary keys (`gen_random_uuid()`), except `github_repositories.id` (GitHub's numeric id, stable across renames) and `activity_logs.id` (identity).
- `created_at` / `updated_at` (`timestamptz`), with `updated_at` kept by the trigger `cms_touch_updated_at()`.
- Slugs match `^[a-z0-9]+(-[a-z0-9]+)*$`.
- Every link column passes `cms_safe_url()`: `https://…` or a site-relative path with no scheme. This rejects `javascript:`, `data:`, `//host` and whitespace.
- Soft delete via `deleted_at` on projects and posts. A permanent delete is only possible from the trash.

## Tables

| Table | Purpose | Key columns / constraints |
|---|---|---|
| `admin_users` | who is an admin | `user_id → auth.users` (cascade), `role` ∈ owner/admin |
| `project_categories` | catalogue categories, custom ones allowed | `slug` unique; `name`, `name_de`, `name_ar`; `sort_order` |
| `studio_projects` | King Studio projects (owner-managed) | `slug` unique; `section` ∈ games/apps/labs; `status` ∈ 4 values; `visibility` ∈ public/hidden; `featured`; `sort_order`; `category_id → project_categories` (set null); `github_repo_id → github_repositories` (unique, set null); `i18n` jsonb (de/ar overrides); image needs alt text; "Coming Soon" has no launch link |
| `project_images` | gallery | `project_id → studio_projects` (cascade), `url`, `alt`, `sort_order` |
| `github_repositories` | repository metadata (sync-managed) | `id` = GitHub id; `full_name` unique; language, topics, archived, private, fork, stars, push dates; `status` ∈ ok/missing; `review_state` ∈ pending/approved/ignored/unmatched; `match_reason` |
| `github_sync_logs` | one row per sync | trigger ∈ manual/scheduled; status ∈ success/partial/failed; counts; error |
| `website_settings` | key/value settings | `key` pattern, `value` jsonb, `is_public` |
| `website_pages` | page texts per language | PK (`page_key`, `locale`), `content` jsonb |
| `navigation_items` | site menu | `nav_key` unique; labels en/de/ar; `href` ('' = home); `visible`; `sort_order` |
| `blog_posts` | CMS blog posts | `slug` unique; `locale`; `body_md`; `status` ∈ draft/published; `published_at` (future = scheduled); SEO fields; soft delete |
| `activity_logs` | audit trail, append-only | actor, action, entity, entity_id, details |
| `private.app_secrets` | SHA-256 hash of `CRON_SECRET` | not reachable by API roles |

Storage bucket **`media`**: public read, 5 MB limit, `image/png|jpeg|webp|gif|avif` only (no SVG).

## Row Level Security

| Table | anon / signed-in non-admin | admin |
|---|---|---|
| `studio_projects` | read where `visibility='public' AND deleted_at IS NULL` | all |
| `project_images` | read images of public projects | all |
| `github_repositories` | read repos linked to a public project | all |
| `project_categories`, `website_pages` | read all | all |
| `website_settings` | read where `is_public` | all |
| `navigation_items` | read where `visible` | all |
| `blog_posts` | read where published, `published_at <= now()`, not deleted | all |
| `github_sync_logs`, `activity_logs` | none | read; insert (activity rows must carry the admin's own id); no update or delete |
| `storage.objects` (media) | none via the API (files are served from the public URL) | list, insert, update, delete |

Writes for non-admins: none. `anon` has no write privilege at all, and `authenticated` writes are filtered to `is_admin()`.

## Functions

| Function | Who may call | What it does |
|---|---|---|
| `is_admin()` | anon, authenticated | `SECURITY DEFINER`, pinned `search_path`; true when the caller is in `admin_users` |
| `cms_safe_url(text)` | constraint helper | link check described above |
| `admin_set_cron_secret(text)` | admins | stores the SHA-256 hash of the scheduled-job secret (≥ 32 chars) |
| `admin_cron_secret_status()` | admins | whether a hash is stored (never returns it) |
| `github_sync_apply(repos, complete, trigger, secret, error)` | an admin, or anyone holding `CRON_SECRET` | upserts repository metadata, moves `unmatched` to `pending` for new KING matches, marks absent repos `missing` (public ones only when the listing had no token), writes a sync log. It never touches `studio_projects`, `approved` or `ignored`. |
| `add_admin_user()` | nobody (revoked) | legacy self-registration helper, kept locked |

## Field ownership (GitHub sync)

| Owned by the owner (`studio_projects`) | Owned by the sync (`github_repositories`) |
|---|---|
| title, slug, descriptions, images, category, section, status, visibility, featured, order, links, translations | description, language, topics, URLs, default branch, archived/private/fork, stars, dates, status |

The build shows GitHub's description only when the owner's short description is empty.

## Applying

See `docs/DEPLOYMENT_GUIDE.md` §2. New schema changes go in a new timestamped file in `supabase/migrations/`; never edit an applied one.
