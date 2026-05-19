-- ==============================================================================
-- SUPABASE SETUP SCRIPT FOR FROMLITEN
-- Run this in your Supabase SQL Editor to create all necessary tables and policies.
-- ==============================================================================

-- 1. Enable Row Level Security (RLS) is on by default for new tables, but good to be explicit.

-- ==============================================================================
-- TABLE: projects
-- Stores your portfolio projects (Games, Apps, etc.)
-- ==============================================================================
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  category text check (category in ('Game', 'App', 'Open Source', 'Web')),
  status text default 'Public' check (status in ('Public', 'Private')),
  image_url text,
  link text,
  github_link text,
  technologies text[] -- Array of strings e.g. ['HTML', 'JS']
);

-- RLS Policies for projects
alter table public.projects enable row level security;

-- Policy: Everyone can view 'Public' projects
create policy "Public projects are viewable by everyone"
on public.projects for select
using ( status = 'Public' );

-- Policy: Admins can view ALL projects (Public & Private)
-- (Assuming authenticated users are admins for now, or check email)
create policy "Admins can view all projects"
on public.projects for select
to authenticated
using ( true );

-- Policy: Admins can INSERT/UPDATE/DELETE projects
create policy "Admins can insert projects"
on public.projects for insert
to authenticated
with check ( true );

create policy "Admins can update projects"
on public.projects for update
to authenticated
using ( true );

create policy "Admins can delete projects"
on public.projects for delete
to authenticated
using ( true );


-- ==============================================================================
-- TABLE: site_stats
-- Stores visitor counters and other global metrics
-- ==============================================================================
create table public.site_stats (
  id int primary key, -- We'll just use id=1 for the main counter
  visitor_count bigint default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert initial row
insert into public.site_stats (id, visitor_count) values (1, 0);

-- RLS Policies for site_stats
alter table public.site_stats enable row level security;

-- Policy: Everyone can read stats
create policy "Everyone can read stats"
on public.site_stats for select
using ( true );

-- Policy: Anyone can increment (via RPC is safer, but direct update for simplicity if needed)
-- Better practice: Use a stored procedure (RPC) to increment safely.
-- For now, let's allow public update for simplicity, OR restrict to RPC.
-- Let's stick to RPC for incrementing to avoid race conditions.

-- ==============================================================================
-- FUNCTION: increment_visitor_count
-- ==============================================================================
create or replace function increment_visitor_count()
returns void as $$
begin
  update public.site_stats
  set visitor_count = visitor_count + 1
  where id = 1;
end;
$$ language plpgsql security definer;


-- ==============================================================================
-- TABLE: bot_knowledge
-- Stores dynamic Q&A for Rashid-AI
-- ==============================================================================
create table public.bot_knowledge (
  id uuid default gen_random_uuid() primary key,
  keywords text[] not null, -- e.g. ['price', 'cost']
  response_en text,
  response_ar text,
  action_url text -- Optional link to open
);

-- RLS Policies for bot_knowledge
alter table public.bot_knowledge enable row level security;

-- Policy: Everyone can read knowledge
create policy "Everyone can read knowledge"
on public.bot_knowledge for select
using ( true );

-- Policy: Admins can manage knowledge
create policy "Admins can manage knowledge"
on public.bot_knowledge for all
to authenticated
using ( true );

-- ==============================================================================
-- SEED DATA (Optional)
-- ==============================================================================
insert into public.projects (title, category, status, description, link, image_url, technologies)
values 
('Farmer Game', 'Game', 'Public', 'A 3D farming simulation.', 'farm-game/index.html', 'fas fa-tractor', ARRAY['3D', 'WebGL']),
('Quran App', 'App', 'Public', 'Beautiful Quran recitation app.', 'quran-app/index.html', 'fas fa-book-open', ARRAY['Audio', 'PWA']),
('Rust Game', 'Game', 'Public', 'Experimental Rust + WASM game.', 'rust-game/index.html', 'fab fa-rust', ARRAY['Rust', 'WASM']),
('Calculator Vault', 'App', 'Public', 'Privacy-focused calculator vault.', 'calculator-vault/index.html', 'fas fa-user-secret', ARRAY['Security', 'Utility']),
('Quiz App', 'App', 'Public', 'Interactive quiz application.', 'quiz-app/index.html', 'fas fa-question', ARRAY['Education', 'JS']);
-- ==============================================================================
-- TABLE: lessons
-- Stores content for the Learning Center
-- ==============================================================================
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  icon_class text default 'fas fa-book',
  progress int default 0,
  tags text[],
  content_url text, -- Link to the full lesson/article
  category text check (category in ('Programming', 'Web', 'Game Dev', 'Other'))
);

alter table public.lessons enable row level security;

create policy "Everyone can view lessons"
on public.lessons for select
using ( true );

create policy "Admins can manage lessons"
on public.lessons for all
to authenticated
using ( true );

-- Seed lessons
insert into public.lessons (title, description, icon_class, progress, tags, category)
values 
('Python Basics', 'Master the fundamentals of Python programming, from variables to OOP.', 'fab fa-python', 80, ARRAY['Syntax', 'OOP', 'Scripting'], 'Programming'),
('Modern Web Development', 'Learn how to build responsive websites using HTML5, CSS3, and JS.', 'fab fa-html5', 65, ARRAY['HTML/CSS', 'Frontend', 'Responsive'], 'Web'),
('Game Dev with Three.js', 'Dive into 3D web graphics and immersive scenes.', 'fas fa-gamepad', 40, ARRAY['WebGL', '3D Math', 'Physics'], 'Game Dev');

-- ==============================================================================
-- TABLE: models
-- Dynamic Rashid Models content shown on the homepage.
-- ==============================================================================
create table public.models (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  icon_class text default 'fas fa-cube',
  link text,
  specs text[] default '{}',
  status text default 'Public' check (status in ('Public', 'Private')),
  sort_order int default 100
);

alter table public.models enable row level security;

create policy "Public models are viewable by everyone"
on public.models for select
using (status = 'Public');

create policy "Admins can view all models"
on public.models for select
to authenticated
using (true);

create policy "Admins can insert models"
on public.models for insert
to authenticated
with check (true);

create policy "Admins can update models"
on public.models for update
to authenticated
using (true)
with check (true);

create policy "Admins can delete models"
on public.models for delete
to authenticated
using (true);

insert into public.models (title, description, icon_class, link, specs, status, sort_order)
values
('Rashid AI v2.0', 'Flagship conversational AI powered by Gemini & OpenRouter. Multilingual support.', 'fas fa-brain', 'Rashid-app/index.html', ARRAY['Gemini API', '10+ Languages'], 'Public', 10),
('Game Engine Core', 'Proprietary 3D engine built with Three.js, physics, AI behaviors, and procedural generation.', 'fas fa-cubes', '#projects', ARRAY['Three.js', 'Real-time'], 'Public', 20),
('Backend Infrastructure', 'Supabase-powered backend with authentication, realtime database, and PWA capabilities.', 'fas fa-server', null, ARRAY['Supabase', 'Realtime'], 'Public', 30);

alter publication supabase_realtime add table public.models;

-- ==============================================================================
-- TABLE: vault_items
-- Dynamic Vault categories shown on the homepage.
-- ==============================================================================
create table public.vault_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  icon_class text default 'fas fa-folder',
  link text,
  count_label text default 'New',
  status text default 'Public' check (status in ('Public', 'Private')),
  sort_order int default 100
);

alter table public.vault_items enable row level security;

create policy "Public vault items are viewable by everyone"
on public.vault_items for select
using (status = 'Public');

create policy "Admins can view all vault items"
on public.vault_items for select
to authenticated
using (true);

create policy "Admins can insert vault items"
on public.vault_items for insert
to authenticated
with check (true);

create policy "Admins can update vault items"
on public.vault_items for update
to authenticated
using (true)
with check (true);

create policy "Admins can delete vault items"
on public.vault_items for delete
to authenticated
using (true);

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
-- TABLE: admin_users
-- Restricts content management to selected Supabase Auth users only.
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

insert into public.admin_users (user_id, email)
select id, email from auth.users
where email in ('zwnt45602@gmail.com', 'zwnt45602@gamil.com')
on conflict (user_id) do update set email = excluded.email;

revoke all on table public.admin_users from anon;
grant select on table public.admin_users to authenticated;

drop policy if exists "Public models are viewable by everyone" on public.models;
drop policy if exists "Admins can view all models" on public.models;
drop policy if exists "Admins can insert models" on public.models;
drop policy if exists "Admins can update models" on public.models;
drop policy if exists "Admins can delete models" on public.models;

create policy "Models read access"
on public.models for select
using (
  status = 'Public'
  or exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

create policy "Models admin insert"
on public.models for insert
to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Models admin update"
on public.models for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Models admin delete"
on public.models for delete
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;
revoke all on table public.admin_users from anon;
revoke all on table public.admin_users from authenticated;

drop policy if exists "Admins can read own admin status" on public.admin_users;

drop policy if exists "Models read access" on public.models;
drop policy if exists "Models admin insert" on public.models;
drop policy if exists "Models admin update" on public.models;
drop policy if exists "Models admin delete" on public.models;

create policy "Models read access"
on public.models for select
using (status = 'Public' or public.is_admin());

create policy "Models admin insert"
on public.models for insert
to authenticated
with check (public.is_admin());

create policy "Models admin update"
on public.models for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Models admin delete"
on public.models for delete
to authenticated
using (public.is_admin());

drop policy if exists "Vault items read access" on public.vault_items;
drop policy if exists "Vault items admin insert" on public.vault_items;
drop policy if exists "Vault items admin update" on public.vault_items;
drop policy if exists "Vault items admin delete" on public.vault_items;

create policy "Vault items read access"
on public.vault_items for select
using (status = 'Public' or public.is_admin());

create policy "Vault items admin insert"
on public.vault_items for insert
to authenticated
with check (public.is_admin());

create policy "Vault items admin update"
on public.vault_items for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Vault items admin delete"
on public.vault_items for delete
to authenticated
using (public.is_admin());
