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
