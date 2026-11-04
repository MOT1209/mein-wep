-- Minimal stand-ins for what a Supabase project provides, so the migrations in
-- supabase/ can be applied and their RLS checked on PGlite in `npm test`.
create role anon nologin;
create role authenticated nologin;
create schema if not exists extensions;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean,
  file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(),
  bucket_id text, name text, owner uuid);
alter table storage.objects enable row level security;
grant usage on schema public, storage to anon, authenticated;
grant select, insert, update, delete on storage.objects to authenticated;
