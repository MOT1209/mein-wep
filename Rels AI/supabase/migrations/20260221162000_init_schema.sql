-- تفعيل إضافة pgvector للمشروع
create extension if not exists vector;

-- 1. جدول المستخدمين (Users Table)
create table users (
  id uuid references auth.users not null primary key,
  email text unique not null,
  username text unique not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. مكتبة المحتوى (Content Library)
create table content_library (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  type text check (type in ('quran', 'nasheed')) not null,
  audio_url text,
  video_url text,
  thumbnail_url text,
  duration integer, -- بالثواني
  tags text[],
  vector_embedding vector(1536), -- تضمين لمعنى الآية/الأنشودة (مناسب لأبعاد OpenAI مثلاً)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. الريلز المولدة عبر الـ AI (Generated Reels)
create table generated_reels (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  prompt_used text,
  status text check (status in ('pending', 'processing', 'completed', 'failed')) default 'pending',
  output_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. المفضلة (Favorites)
create table favorites (
  user_id uuid references users(id) not null,
  content_id uuid references content_library(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, content_id)
);

-- RLS (Row Level Security) - حماية البيانات
alter table content_library enable row level security;
alter table generated_reels enable row level security;

-- السماح للجميع بقراءة مكتبة المحتوى
create policy "Public content is viewable by everyone." on content_library for select using (true);

-- دالة البحث الدلالي باستخدام pgvector
create or replace function match_content (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  video_url text,
  similarity float
)
language sql stable
as $$
  select
    content_library.id,
    content_library.title,
    content_library.video_url,
    1 - (content_library.vector_embedding <=> query_embedding) as similarity
  from content_library
  where 1 - (content_library.vector_embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
