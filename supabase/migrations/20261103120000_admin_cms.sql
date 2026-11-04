-- =============================================================================
-- 20261103120000_admin_cms.sql — Admin CMS, King Studio catalogue, GitHub sync
-- =============================================================================
-- Versioned migration (see docs/DATABASE_SCHEMA.md). Additive only:
--   * creates new tables, never drops or rewrites existing ones;
--   * keeps the legacy tables (projects, lessons, models, …) untouched;
--   * safe to run more than once (IF NOT EXISTS / OR REPLACE / ON CONFLICT).
--
-- Access model
--   anon / authenticated  read published rows only (Row Level Security)
--   admin                 a row in public.admin_users -> public.is_admin()
--   scheduled sync        public.github_sync_apply() with a secret whose
--                         SHA-256 hash is stored in private.app_secrets
-- No policy anywhere grants writes to a non-admin.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- 0. Admins (exists since db/SUPABASE_SETUP.sql; recreated only if missing)
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);
alter table public.admin_users add column if not exists role text not null default 'owner';
do $$ begin
  alter table public.admin_users add constraint admin_users_role_check check (role in ('owner', 'admin'));
exception when duplicate_object then null; end $$;
alter table public.admin_users enable row level security;
drop policy if exists "Admins can read own admin status" on public.admin_users;
create policy "Admins can read own admin status" on public.admin_users
  for select to authenticated using ((select auth.uid()) = user_id);
revoke all on table public.admin_users from anon;
revoke insert, update, delete on table public.admin_users from authenticated;
grant select on table public.admin_users to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- The self-registration helper from the first setup must stay locked.
do $$ begin
  revoke execute on function public.add_admin_user() from public, anon, authenticated;
exception when undefined_function then null; end $$;

-- -----------------------------------------------------------------------------
-- 1. Shared helpers
-- -----------------------------------------------------------------------------
create or replace function public.cms_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- A link the public site may render: https://… or a site-relative path.
-- Rejects javascript:, data: and any other scheme, protocol-relative //host,
-- and anything with whitespace.
create or replace function public.cms_safe_url(u text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select u is null
      or (length(u) <= 2048
          and u !~ '\s'
          and (u ~* '^https://[a-z0-9.-]+(:[0-9]+)?(/|$|\?|#)'
               -- a relative path never needs ':' (that is how schemes are written)
               or (u !~ ':' and u ~* '^(/[^/]|[a-z0-9#])')));
$$;

-- -----------------------------------------------------------------------------
-- 2. Categories
-- -----------------------------------------------------------------------------
create table if not exists public.project_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  name text not null check (length(name) between 1 and 80),
  name_de text check (name_de is null or length(name_de) <= 80),
  name_ar text check (name_ar is null or length(name_ar) <= 80),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 3. GitHub repositories (metadata owned by the sync, never by the owner)
-- -----------------------------------------------------------------------------
create table if not exists public.github_repositories (
  id bigint primary key,                       -- GitHub's numeric repo id: stable across renames
  full_name text not null unique,
  name text not null,
  description text,
  html_url text not null check (html_url ~ '^https://github\.com/'),
  homepage text check (public.cms_safe_url(homepage)),
  language text,
  topics text[] not null default '{}',
  default_branch text,
  is_private boolean not null default false,
  is_archived boolean not null default false,
  is_fork boolean not null default false,
  stars integer not null default 0,
  gh_created_at timestamptz,
  gh_pushed_at timestamptz,
  gh_updated_at timestamptz,
  status text not null default 'ok' check (status in ('ok', 'missing')),
  review_state text not null default 'unmatched'
    check (review_state in ('pending', 'approved', 'ignored', 'unmatched')),
  match_reason text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_synced_at timestamptz not null default now()
);
create index if not exists github_repositories_review_idx on public.github_repositories (review_state);

-- -----------------------------------------------------------------------------
-- 4. King Studio projects (all fields owned by the owner)
-- -----------------------------------------------------------------------------
create table if not exists public.studio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  section text not null check (section in ('games', 'apps', 'labs')),
  title text not null check (length(title) between 1 and 120),
  short_description text not null default '' check (length(short_description) <= 400),
  description text check (description is null or length(description) <= 20000),
  project_type text not null default 'App' check (length(project_type) between 1 and 40),
  category_id uuid references public.project_categories(id) on delete set null,
  platforms text[] not null default '{}',
  technologies text[] not null default '{}',
  features text[] not null default '{}',
  status text not null default 'In Development'
    check (status in ('Available', 'In Development', 'Experimental', 'Coming Soon')),
  featured boolean not null default false,
  visibility text not null default 'hidden' check (visibility in ('public', 'hidden')),
  sort_order integer not null default 0,
  cover_image text check (public.cms_safe_url(cover_image)),
  image_alt text check (image_alt is null or length(image_alt) <= 300),
  launch_url text check (public.cms_safe_url(launch_url)),
  demo_url text check (public.cms_safe_url(demo_url)),
  download_url text check (public.cms_safe_url(download_url)),
  apk_id text check (apk_id is null or apk_id ~ '^[a-z][a-z0-9_.]{2,100}$'),
  github_repo_id bigint unique references public.github_repositories(id) on delete set null,
  i18n jsonb not null default '{}'::jsonb check (jsonb_typeof(i18n) = 'object'),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_projects_image_needs_alt check (cover_image is null or coalesce(image_alt, '') <> ''),
  constraint studio_projects_coming_soon_no_launch check (status <> 'Coming Soon' or launch_url is null)
);
create index if not exists studio_projects_public_idx
  on public.studio_projects (section, sort_order) where visibility = 'public' and deleted_at is null;
create index if not exists studio_projects_category_idx on public.studio_projects (category_id);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.studio_projects(id) on delete cascade,
  url text not null check (public.cms_safe_url(url)),
  alt text not null check (length(alt) between 1 and 300),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists project_images_project_idx on public.project_images (project_id, sort_order);

-- -----------------------------------------------------------------------------
-- 5. Site content
-- -----------------------------------------------------------------------------
create table if not exists public.website_settings (
  key text primary key check (key ~ '^[a-z][a-z0-9_.]{1,60}$'),
  value jsonb not null,
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.website_pages (
  page_key text not null check (page_key ~ '^[a-z][a-z0-9_-]{1,40}$'),
  locale text not null check (locale in ('en', 'de', 'ar')),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (page_key, locale)
);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  nav_key text not null unique check (nav_key ~ '^[a-z][a-z0-9_-]{1,40}$'),
  label text not null check (length(label) between 1 and 40),
  label_de text check (label_de is null or length(label_de) <= 40),
  label_ar text check (label_ar is null or length(label_ar) <= 40),
  href text not null check (href = '' or public.cms_safe_url(href)),  -- '' is the home page
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 100),
  locale text not null default 'en' check (locale in ('en', 'de', 'ar')),
  title text not null check (length(title) between 1 and 200),
  description text not null default '' check (length(description) <= 400),
  body_md text not null default '' check (length(body_md) <= 200000),
  cover_image text check (public.cms_safe_url(cover_image)),
  cover_alt text check (cover_alt is null or length(cover_alt) <= 300),
  categories text[] not null default '{}',
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  seo_title text check (seo_title is null or length(seo_title) <= 200),
  seo_description text check (seo_description is null or length(seo_description) <= 400),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_published_has_date check (status <> 'published' or published_at is not null),
  constraint blog_posts_cover_needs_alt check (cover_image is null or coalesce(cover_alt, '') <> '')
);
create index if not exists blog_posts_public_idx on public.blog_posts (published_at desc)
  where status = 'published' and deleted_at is null;

-- -----------------------------------------------------------------------------
-- 6. Logs
-- -----------------------------------------------------------------------------
create table if not exists public.github_sync_logs (
  id uuid primary key default gen_random_uuid(),
  trigger text not null check (trigger in ('manual', 'scheduled')),
  status text not null check (status in ('success', 'partial', 'failed')),
  repos_seen integer not null default 0,
  new_candidates integer not null default 0,
  updated integer not null default 0,
  missing integer not null default 0,
  error text check (error is null or length(error) <= 2000),
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists github_sync_logs_started_idx on public.github_sync_logs (started_at desc);

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_email text,
  action text not null check (length(action) <= 60),
  entity text not null check (length(entity) <= 60),
  entity_id text check (entity_id is null or length(entity_id) <= 200),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_logs_created_idx on public.activity_logs (created_at desc);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['project_categories', 'studio_projects', 'website_settings',
                           'website_pages', 'navigation_items', 'blog_posts']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I
                    for each row execute function public.cms_touch_updated_at()', t, t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 7. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.project_categories  enable row level security;
alter table public.github_repositories enable row level security;
alter table public.studio_projects     enable row level security;
alter table public.project_images      enable row level security;
alter table public.website_settings    enable row level security;
alter table public.website_pages       enable row level security;
alter table public.navigation_items    enable row level security;
alter table public.blog_posts          enable row level security;
alter table public.github_sync_logs    enable row level security;
alter table public.activity_logs       enable row level security;

-- Policies are recreated so re-running the file converges on this definition.
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public' and tablename in (
             'project_categories', 'github_repositories', 'studio_projects', 'project_images',
             'website_settings', 'website_pages', 'navigation_items', 'blog_posts',
             'github_sync_logs', 'activity_logs')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Read: public rows for everyone, everything for admins.
create policy cms_read on public.project_categories for select using (true);
create policy cms_read on public.studio_projects for select
  using ((visibility = 'public' and deleted_at is null) or (select public.is_admin()));
create policy cms_read on public.project_images for select
  using ((select public.is_admin()) or exists (
    select 1 from public.studio_projects p
    where p.id = project_id and p.visibility = 'public' and p.deleted_at is null));
create policy cms_read on public.github_repositories for select
  using ((select public.is_admin()) or exists (
    select 1 from public.studio_projects p
    where p.github_repo_id = github_repositories.id and p.visibility = 'public' and p.deleted_at is null));
create policy cms_read on public.website_settings for select using (is_public or (select public.is_admin()));
create policy cms_read on public.website_pages for select using (true);
create policy cms_read on public.navigation_items for select using (visible or (select public.is_admin()));
create policy cms_read on public.blog_posts for select
  using ((status = 'published' and published_at <= now() and deleted_at is null) or (select public.is_admin()));
create policy cms_read on public.github_sync_logs for select to authenticated using ((select public.is_admin()));
create policy cms_read on public.activity_logs for select to authenticated using ((select public.is_admin()));

-- Write: admins only.
do $$
declare t text;
begin
  foreach t in array array['project_categories', 'github_repositories', 'studio_projects', 'project_images',
                           'website_settings', 'website_pages', 'navigation_items', 'blog_posts']
  loop
    execute format('create policy cms_admin_insert on public.%I for insert to authenticated
                    with check ((select public.is_admin()))', t);
    execute format('create policy cms_admin_update on public.%I for update to authenticated
                    using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('create policy cms_admin_delete on public.%I for delete to authenticated
                    using ((select public.is_admin()))', t);
  end loop;
end $$;
-- Logs are append-only, and only admins append.
create policy cms_admin_insert on public.activity_logs for insert to authenticated
  with check ((select public.is_admin()) and actor_id = (select auth.uid()));
create policy cms_admin_insert on public.github_sync_logs for insert to authenticated
  with check ((select public.is_admin()));

grant select on public.project_categories, public.studio_projects, public.project_images,
  public.github_repositories, public.website_settings, public.website_pages,
  public.navigation_items, public.blog_posts to anon, authenticated;
grant select on public.github_sync_logs, public.activity_logs to authenticated;
grant insert, update, delete on public.project_categories, public.studio_projects, public.project_images,
  public.github_repositories, public.website_settings, public.website_pages,
  public.navigation_items, public.blog_posts to authenticated;
grant insert on public.activity_logs, public.github_sync_logs to authenticated;
revoke insert, update, delete on public.project_categories, public.studio_projects, public.project_images,
  public.github_repositories, public.website_settings, public.website_pages,
  public.navigation_items, public.blog_posts, public.activity_logs, public.github_sync_logs from anon;

-- -----------------------------------------------------------------------------
-- 8. Scheduled GitHub sync without a service-role key
-- -----------------------------------------------------------------------------
-- The scheduled job (api/cron/github-sync.js) holds only the publishable key
-- and CRON_SECRET. It may call exactly one function, which checks the secret
-- against a stored SHA-256 hash and can only write repository metadata and a
-- sync log. It cannot touch projects, content, users or admins.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_secrets (
  name text primary key,
  secret_hash text not null,
  updated_at timestamptz not null default now()
);
revoke all on table private.app_secrets from public, anon, authenticated;

-- Admin-only: store the hash of the scheduled-job secret (called by the admin
-- API with the value of CRON_SECRET, so the secret never passes through SQL
-- history or the browser).
create or replace function public.admin_set_cron_secret(p_secret text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  if p_secret is null or length(p_secret) < 32 then
    raise exception 'secret must be at least 32 characters' using errcode = '22023';
  end if;
  insert into private.app_secrets (name, secret_hash, updated_at)
  values ('cron', encode(extensions.digest(p_secret, 'sha256'), 'hex'), now())
  on conflict (name) do update set secret_hash = excluded.secret_hash, updated_at = now();
end;
$$;
revoke all on function public.admin_set_cron_secret(text) from public, anon;
grant execute on function public.admin_set_cron_secret(text) to authenticated;

-- Admin-only: is the scheduled sync configured? (never returns the hash)
create or replace function public.admin_cron_secret_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare s record;
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  select updated_at into s from private.app_secrets where name = 'cron';
  return jsonb_build_object('configured', s.updated_at is not null, 'updated_at', s.updated_at);
end;
$$;
revoke all on function public.admin_cron_secret_status() from public, anon;
grant execute on function public.admin_cron_secret_status() to authenticated;

-- Applies one sync run. Allowed for an admin (manual sync) or for a caller
-- that presents the scheduled-job secret.
--   p_repos     jsonb array of repositories (fields as in github_repositories,
--               plus match_reason when the repo looks like a KING project)
--   p_complete  true when p_repos is the owner's full repository list, so a
--               known repo that is absent can be marked 'missing'
-- Field-level rule: only repository metadata is written. Owner-managed
-- studio_projects fields are never touched; review_state only moves from
-- 'unmatched' to 'pending' (never overrides 'approved' or 'ignored').
create or replace function public.github_sync_apply(
  p_repos jsonb,
  p_complete boolean,
  p_trigger text,
  p_secret text default null,
  p_error text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ok boolean := false;
  v_seen integer := 0;
  v_new integer := 0;
  v_updated integer := 0;
  v_missing integer := 0;
  v_now timestamptz := now();
  v_status text;
  v_has_private boolean;
begin
  if public.is_admin() then
    v_ok := true;
  elsif p_secret is not null and length(p_secret) >= 32 then
    select exists (
      select 1 from private.app_secrets
      where name = 'cron' and secret_hash = encode(extensions.digest(p_secret, 'sha256'), 'hex')
    ) into v_ok;
  end if;
  if not v_ok then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  if p_trigger not in ('manual', 'scheduled') then
    raise exception 'bad trigger' using errcode = '22023';
  end if;
  if p_repos is null or jsonb_typeof(p_repos) <> 'array' or jsonb_array_length(p_repos) > 1000 then
    raise exception 'bad repository list' using errcode = '22023';
  end if;

  with incoming as (
    select * from jsonb_to_recordset(p_repos) as x(
      id bigint, full_name text, name text, description text, html_url text, homepage text,
      language text, topics text[], default_branch text, is_private boolean, is_archived boolean,
      is_fork boolean, stars integer, gh_created_at timestamptz, gh_pushed_at timestamptz,
      gh_updated_at timestamptz, match_reason text)
    where id is not null and full_name is not null and html_url ~ '^https://github\.com/'
  ), upserted as (
    insert into public.github_repositories as g (
      id, full_name, name, description, html_url, homepage, language, topics, default_branch,
      is_private, is_archived, is_fork, stars, gh_created_at, gh_pushed_at, gh_updated_at,
      status, review_state, match_reason, first_seen_at, last_seen_at, last_synced_at)
    select id, full_name, coalesce(name, split_part(full_name, '/', 2)), left(description, 1000), html_url,
           case when public.cms_safe_url(homepage) and homepage ~* '^https://' then homepage end,
           left(language, 60), coalesce(topics, '{}'), left(default_branch, 200),
           coalesce(is_private, false), coalesce(is_archived, false), coalesce(is_fork, false),
           coalesce(stars, 0), gh_created_at, gh_pushed_at, gh_updated_at,
           'ok', case when match_reason is not null then 'pending' else 'unmatched' end,
           left(match_reason, 200), v_now, v_now, v_now
    from incoming
    on conflict (id) do update set
      full_name = excluded.full_name, name = excluded.name, description = excluded.description,
      html_url = excluded.html_url, homepage = excluded.homepage, language = excluded.language,
      topics = excluded.topics, default_branch = excluded.default_branch,
      is_private = excluded.is_private, is_archived = excluded.is_archived, is_fork = excluded.is_fork,
      stars = excluded.stars, gh_created_at = excluded.gh_created_at,
      gh_pushed_at = excluded.gh_pushed_at, gh_updated_at = excluded.gh_updated_at,
      status = 'ok', match_reason = excluded.match_reason,
      review_state = case when g.review_state = 'unmatched' and excluded.match_reason is not null
                          then 'pending' else g.review_state end,
      last_seen_at = v_now, last_synced_at = v_now
    returning (xmax = 0) as inserted, review_state
  )
  select count(*), count(*) filter (where inserted and review_state = 'pending'),
         count(*) filter (where not inserted)
    into v_seen, v_new, v_updated
  from upserted;

  -- A list fetched without a token holds public repos only; private ones
  -- that are absent from it are not missing, just invisible to that call.
  select exists (select 1 from jsonb_array_elements(p_repos) e where (e->>'is_private')::boolean)
    into v_has_private;
  if p_complete and p_error is null then
    update public.github_repositories
       set status = 'missing', last_synced_at = v_now
     where status = 'ok' and last_seen_at < v_now and (not is_private or v_has_private);
    get diagnostics v_missing = row_count;
  end if;

  v_status := case when p_error is null then 'success' when v_seen > 0 then 'partial' else 'failed' end;
  insert into public.github_sync_logs (trigger, status, repos_seen, new_candidates, updated, missing, error, started_at, finished_at)
  values (p_trigger, v_status, v_seen, v_new, v_updated, v_missing, left(p_error, 2000), v_now, clock_timestamp());

  return jsonb_build_object('status', v_status, 'repos_seen', v_seen, 'new_candidates', v_new,
                            'updated', v_updated, 'missing', v_missing);
end;
$$;
revoke all on function public.github_sync_apply(jsonb, boolean, text, text, text) from public;
grant execute on function public.github_sync_apply(jsonb, boolean, text, text, text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 9. Media storage: public read, admin write, images only, 5 MB
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media admin list" on storage.objects;
drop policy if exists "media admin insert" on storage.objects;
drop policy if exists "media admin update" on storage.objects;
drop policy if exists "media admin delete" on storage.objects;
-- Public files are served from the public URL without a policy; listing the
-- bucket is for admins only.
create policy "media admin list" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
