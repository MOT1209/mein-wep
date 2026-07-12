-- ==============================================================================
-- SUPABASE SETUP SCRIPT FOR Rashid
-- Run this in your Supabase SQL Editor to create all necessary tables and policies.
--
-- ⚠️ DESTRUCTIVE: this script DROPS and recreates media/images/codes/prompts/
-- vault_items/models/lessons/bot_knowledge/site_stats/admin_users/projects —
-- all real content in those tables is wiped. This is meant for FIRST-TIME setup
-- only, never for re-running against a live database with real data.
--
-- Five other SUPABASE_*.sql files in this repo are later, idempotent patches on
-- top of this base (safe to re-run anytime) — see SUPABASE_MIGRATIONS.md for the
-- verified apply order. They don't touch this file's DROP list.
-- ==============================================================================

-- Clean slate: drop everything first to avoid schema mismatch from failed runs
drop table if exists public.media cascade;
drop table if exists public.images cascade;
drop table if exists public.codes cascade;
drop table if exists public.prompts cascade;
drop table if exists public.vault_items cascade;
drop table if exists public.models cascade;
drop table if exists public.lessons cascade;
drop table if exists public.bot_knowledge cascade;
drop table if exists public.site_stats cascade;
drop table if exists public.admin_users cascade;
drop table if exists public.projects cascade;
drop function if exists public.is_admin();
drop function if exists public.increment_visitor_count();

-- ==============================================================================
-- 1. TABLE: projects
-- ==============================================================================
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  category text check (category in ('Game', 'App', 'Open Source', 'Web')),
  status text default 'Public' check (status in ('Public', 'Private')),
  image_url text,
  link text,
  github_link text,
  technologies text[]
);

alter table public.projects enable row level security;

create policy "Public projects are viewable by everyone"
on public.projects for select using (status = 'Public');

create policy "Admins can view all projects"
on public.projects for select to authenticated using (true);

create policy "Admins can insert projects"
on public.projects for insert to authenticated with check (true);

create policy "Admins can update projects"
on public.projects for update to authenticated using (true);

create policy "Admins can delete projects"
on public.projects for delete to authenticated using (true);

-- ==============================================================================
-- 2. TABLE: site_stats + FUNCTION: increment_visitor_count
-- ==============================================================================
create table public.site_stats (
  id int primary key,
  visitor_count bigint default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

insert into public.site_stats (id, visitor_count) values (1, 0);
alter table public.site_stats enable row level security;
create policy "Everyone can read stats" on public.site_stats for select using (true);

create or replace function increment_visitor_count()
returns void as $$
begin
  update public.site_stats set visitor_count = visitor_count + 1 where id = 1;
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 3. TABLE: bot_knowledge
-- ==============================================================================
create table if not exists public.bot_knowledge (
  id uuid default gen_random_uuid() primary key,
  keywords text[] not null, response_en text, response_ar text, action_url text
);
alter table public.bot_knowledge enable row level security;
create policy "Everyone can read knowledge" on public.bot_knowledge for select using (true);
create policy "Admins can manage knowledge" on public.bot_knowledge for all to authenticated using (true);

-- ==============================================================================
-- 4. SEED: projects
-- ==============================================================================
insert into public.projects (title, category, status, description, link, image_url, technologies)
values 
('Farmer Game', 'Game', 'Public', 'A 3D farming simulation.', 'games/farm-game/index.html', 'fas fa-tractor', ARRAY['3D', 'WebGL']),
('Quran App', 'App', 'Public', 'Beautiful Quran recitation app.', 'apps/quran-app/index.html', 'fas fa-book-open', ARRAY['Audio', 'PWA']),
('Rust Game', 'Game', 'Public', 'Experimental Rust + WASM game.', 'games/rust-game/index.html', 'fab fa-rust', ARRAY['Rust', 'WASM']),
('Calculator Vault', 'App', 'Public', 'Privacy-focused calculator vault.', 'apps/calculator-vault/index.html', 'fas fa-user-secret', ARRAY['Security', 'Utility']),
('Quiz App', 'App', 'Public', 'Interactive quiz application.', 'apps/quiz-app/index.html', 'fas fa-question', ARRAY['Education', 'JS']);

-- ==============================================================================
-- 5. TABLE: admin_users + FUNCTION: is_admin (MUST be before any table whose
--    policies reference admin_users or is_admin())
-- ==============================================================================
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_users enable row level security;

create policy "Admins can read own admin status"
on public.admin_users for select
to authenticated
using ((select auth.uid()) = user_id);

-- استبدل القيمة أدناه ببريد حسابك الحقيقي قبل تشغيل السكربت (لا تُثبّت بريدًا حقيقيًا هنا)
insert into public.admin_users (user_id, email)
select id, email from auth.users
where email = 'OWNER_EMAIL_PLACEHOLDER@example.com'
on conflict (user_id) do update set email = excluded.email;

revoke all on table public.admin_users from anon;
grant select on table public.admin_users to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

-- NOTE: anon MUST keep EXECUTE on is_admin(). The public SELECT policies on
-- prompts/codes/images/media/lessons/models use `(status='Public' OR is_admin())`,
-- so anonymous visitors evaluate is_admin() while reading. Without this grant the
-- API returns 401 "permission denied for function is_admin" and the whole site's
-- vault/content fails to load. The function is SECURITY DEFINER and returns false
-- for anon (auth.uid() is null), so granting it is safe — no data is exposed.
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- RPC: add_admin_user (security definer — allows new users to self-register as admin)
create or replace function public.add_admin_user()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.admin_users (user_id, email)
  values ((select auth.uid()), (select email from auth.users where id = (select auth.uid())))
  on conflict (user_id) do nothing;
$$;

revoke all on function public.add_admin_user() from public;
revoke execute on function public.add_admin_user() from anon;
grant execute on function public.add_admin_user() to authenticated;

-- ==============================================================================
-- 6. TABLE: lessons (now admin_users + is_admin() exist — safe to reference them)
-- ==============================================================================
create table if not exists public.lessons (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null, description text, icon_class text default 'fas fa-book',
  progress int default 0, tags text[] default '{}', category text default 'General',
  status text default 'Public' check (status in ('Public', 'Private')), sort_order int default 100
);

alter table public.lessons enable row level security;

create policy "Lessons read access"
on public.lessons for select
using (status = 'Public' or exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Lessons admin insert"
on public.lessons for insert to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Lessons admin update"
on public.lessons for update to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Lessons admin delete"
on public.lessons for delete to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

insert into public.lessons (title, description, icon_class, progress, tags, category, status, sort_order)
values 
('Python Basics', 'Master the fundamentals of Python programming, from variables to OOP.', 'fab fa-python', 80, ARRAY['Syntax', 'OOP', 'Scripting'], 'Programming', 'Public', 10),
('Modern Web Development', 'Learn how to build responsive websites using HTML5, CSS3, and JS.', 'fab fa-html5', 65, ARRAY['HTML/CSS', 'Frontend', 'Responsive'], 'Web', 'Public', 20),
('Game Dev with Three.js', 'Dive into 3D web graphics and immersive scenes.', 'fas fa-gamepad', 40, ARRAY['WebGL', '3D Math', 'Physics'], 'Game Dev', 'Public', 30);

-- ==============================================================================
-- 7. TABLE: models
-- ==============================================================================
create table if not exists public.models (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null, description text, icon_class text default 'fas fa-cube',
  link text, specs text[] default '{}',
  status text default 'Public' check (status in ('Public', 'Private')), sort_order int default 100
);

alter table public.models enable row level security;

create policy "Public models are viewable by everyone" on public.models for select
  using (status = 'Public');
create policy "Admins can view all models" on public.models for select
  to authenticated using (true);
create policy "Admins can insert models" on public.models for insert
  to authenticated with check (true);
create policy "Admins can update models" on public.models for update
  to authenticated using (true);
create policy "Admins can delete models" on public.models for delete
  to authenticated using (true);

insert into public.models (title, description, icon_class, link, specs, status, sort_order)
values
('Rashid AI v2.0', 'Flagship conversational AI powered by Gemini & OpenRouter.', 'fas fa-brain', 'models/Rashid-app/index.html', ARRAY['Gemini API', '10+ Languages'], 'Public', 10),
('Game Engine Core', '3D engine built with Three.js, physics, AI behaviors.', 'fas fa-cubes', '#projects', ARRAY['Three.js', 'Real-time'], 'Public', 20),
('Backend Infrastructure', 'Supabase-powered backend with auth and realtime.', 'fas fa-server', null, ARRAY['Supabase', 'Realtime'], 'Public', 30);

alter publication supabase_realtime add table public.models;

-- ==============================================================================
-- 8. TABLE: vault_items
-- ==============================================================================
create table if not exists public.vault_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null, description text, icon_class text default 'fas fa-folder',
  link text, count_label text default 'New',
  status text default 'Public' check (status in ('Public', 'Private')), sort_order int default 100
);

alter table public.vault_items enable row level security;

create policy "Public vault items are viewable by everyone" on public.vault_items for select
  using (status = 'Public');
create policy "Admins can view all vault items" on public.vault_items for select
  to authenticated using (true);
create policy "Admins can insert vault items" on public.vault_items for insert
  to authenticated with check (true);
create policy "Admins can update vault items" on public.vault_items for update
  to authenticated using (true);
create policy "Admins can delete vault items" on public.vault_items for delete
  to authenticated using (true);

insert into public.vault_items (title, description, icon_class, link, count_label, status, sort_order)
values
('Prompts', 'Polished command templates and AI prompts', 'fas fa-terminal', 'vault/prompts/index.html', '12+ Prompts', 'Public', 10),
('Code Library', 'Clean, reusable code snippets', 'fas fa-code', 'vault/code/index.html', '50+ Snippets', 'Public', 20),
('Archive', 'Visual assets and design resources', 'fas fa-images', 'vault/archive/index.html', '100+ Assets', 'Public', 30),
('Media', 'Tutorials, demos and showcases', 'fas fa-video', 'vault/media/index.html', '25+ Videos', 'Public', 40),
('Documentation', 'Project docs and technical guides', 'fas fa-book', 'vault/docs/index.html', '8+ Docs', 'Public', 50),
('API Reference', 'API endpoints and integrations', 'fas fa-plug', 'vault/api/index.html', '5+ APIs', 'Public', 60);

alter publication supabase_realtime add table public.vault_items;

-- ==============================================================================
-- 9. TABLE: prompts
-- ==============================================================================
create table if not exists public.prompts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null, content text not null,
  status text default 'Public' check (status in ('Public', 'Private')), sort_order int default 100
);

alter table public.prompts enable row level security;
create policy "Prompts read access" on public.prompts for select using (status = 'Public' or public.is_admin());
create policy "Prompts admin insert" on public.prompts for insert to authenticated with check (public.is_admin());
create policy "Prompts admin update" on public.prompts for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Prompts admin delete" on public.prompts for delete to authenticated using (public.is_admin());

insert into public.prompts (title, content, status, sort_order) values
('Code Review Assistant', 'Review code for bugs, performance issues, and best practices.', 'Public', 10),
('API Design Pattern', 'Design a RESTful API for {resource} with CRUD, pagination, filtering.', 'Public', 20),
('Debug Mode', 'Analyze error logs and identify root cause.', 'Public', 30),
('Unit Test Generator', 'Generate unit tests with edge cases.', 'Public', 40),
('Refactoring Expert', 'Improve code readability and performance.', 'Public', 50),
('Database Schema', 'Design normalized schema with indexes.', 'Public', 60);

-- ==============================================================================
-- 10. TABLE: codes
-- ==============================================================================
create table if not exists public.codes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null, language text default 'text', code text not null, description text,
  status text default 'Public' check (status in ('Public', 'Private')), sort_order int default 100
);

alter table public.codes enable row level security;
create policy "Codes read access" on public.codes for select using (status = 'Public' or public.is_admin());
create policy "Codes admin insert" on public.codes for insert to authenticated with check (public.is_admin());
create policy "Codes admin update" on public.codes for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Codes admin delete" on public.codes for delete to authenticated using (public.is_admin());

insert into public.codes (title, language, code, description, status, sort_order) values
('fetchWrapper.js', 'javascript', 'const fetchWrapper = async (url, options = {}) => {\n  const res = await fetch(url, {\n    headers: { "Content-Type": "application/json", ...options.headers },\n    ...options\n  });\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  return res.json();\n};', 'Reusable fetch wrapper', 'Public', 10),
('debounce util', 'javascript', 'function debounce(fn, delay = 300) {\n  let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };\n}', 'Performance utility', 'Public', 20),
('css-glassmorphism', 'css', '.glass {\n  background: rgba(255,255,255,0.05);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border: 1px solid rgba(255,255,255,0.1);\n  border-radius: 16px;\n}', 'Glassmorphism card', 'Public', 30),
('throttle util', 'javascript', 'function throttle(fn, limit = 100) {\n  let inThrottle; return (...args) => { if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => { inThrottle = false; }, limit); } };\n}', 'Limits scroll/resize calls', 'Public', 40);

-- ==============================================================================
-- 11. TABLE: images
-- ==============================================================================
create table if not exists public.images (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  url text not null, description text,
  status text default 'Public' check (status in ('Public', 'Private')), sort_order int default 100
);

alter table public.images enable row level security;
create policy "Images read access" on public.images for select using (status = 'Public' or public.is_admin());
create policy "Images admin insert" on public.images for insert to authenticated with check (public.is_admin());
create policy "Images admin update" on public.images for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Images admin delete" on public.images for delete to authenticated using (public.is_admin());

insert into public.images (url, description, status, sort_order) values
('images/screenshots/kingcraft.svg', 'KingCraft 3D voxel sandbox', 'Public', 10),
('images/screenshots/rust-construction.svg', 'Rust Construction physics sandbox', 'Public', 20),
('images/screenshots/farm-empire.svg', 'Farm Empire farming simulation', 'Public', 30),
('images/screenshots/rashid-ai.svg', 'Rashid AI conversational assistant', 'Public', 40),
('images/logo.webp', 'Rashid platform logo', 'Public', 50);

-- ==============================================================================
-- 12. TABLE: media
-- ==============================================================================
create table if not exists public.media (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null, type text check (type in ('video', 'audio')) default 'video',
  url text, thumbnail text, mimeType text default 'video/mp4', description text,
  status text default 'Public' check (status in ('Public', 'Private')), sort_order int default 100
);

alter table public.media enable row level security;
create policy "Media read access" on public.media for select using (status = 'Public' or public.is_admin());
create policy "Media admin insert" on public.media for insert to authenticated with check (public.is_admin());
create policy "Media admin update" on public.media for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Media admin delete" on public.media for delete to authenticated using (public.is_admin());

insert into public.media (title, type, url, description, status, sort_order) values
('Platform Overview', 'video', '', 'Overview of the Rashid ecosystem', 'Public', 10),
('KingCraft Gameplay', 'video', '', 'Walkthrough of KingCraft 3D', 'Public', 20),
('Rashid AI Demo', 'video', '', 'AI assistant features demo', 'Public', 30);

-- ==============================================================================
-- 13. FINAL: Replace temporary polices with is_admin() where needed
-- ==============================================================================
drop policy if exists "Admins can read own admin status" on public.admin_users;

-- Lessons → replace subquery with is_admin()
drop policy if exists "Lessons read access" on public.lessons;
drop policy if exists "Lessons admin insert" on public.lessons;
drop policy if exists "Lessons admin update" on public.lessons;
drop policy if exists "Lessons admin delete" on public.lessons;
create policy "Lessons read access" on public.lessons for select
  using (status = 'Public' or public.is_admin());
create policy "Lessons admin insert" on public.lessons for insert
  to authenticated with check (public.is_admin());
create policy "Lessons admin update" on public.lessons for update
  to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Lessons admin delete" on public.lessons for delete
  to authenticated using (public.is_admin());

-- Models
drop policy if exists "Models read access" on public.models;
drop policy if exists "Models admin insert" on public.models;
drop policy if exists "Models admin update" on public.models;
drop policy if exists "Models admin delete" on public.models;
create policy "Models read access" on public.models for select
  using (status = 'Public' or public.is_admin());
create policy "Models admin insert" on public.models for insert
  to authenticated with check (public.is_admin());
create policy "Models admin update" on public.models for update
  to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Models admin delete" on public.models for delete
  to authenticated using (public.is_admin());

-- Vault items
drop policy if exists "Vault items read access" on public.vault_items;
drop policy if exists "Vault items admin insert" on public.vault_items;
drop policy if exists "Vault items admin update" on public.vault_items;
drop policy if exists "Vault items admin delete" on public.vault_items;
create policy "Vault items read access" on public.vault_items for select
  using (status = 'Public' or public.is_admin());
create policy "Vault items admin insert" on public.vault_items for insert
  to authenticated with check (public.is_admin());
create policy "Vault items admin update" on public.vault_items for update
  to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Vault items admin delete" on public.vault_items for delete
  to authenticated using (public.is_admin());

-- ==============================================================================
-- 11. TABLE: contact_messages
-- ==============================================================================
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.contact_messages enable row level security;

create policy "Anyone can insert contact messages"
on public.contact_messages for insert to anon, authenticated
with check (true);

create policy "Only admins can view contact messages"
on public.contact_messages for select
to authenticated using (public.is_admin());
