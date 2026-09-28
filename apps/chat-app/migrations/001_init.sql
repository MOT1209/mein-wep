-- 001_init.sql — chat app baseline schema
-- Designed so groups/files/calls can be added later without breaking changes.

create extension if not exists pgcrypto;

-- ───────────────────────────── users ─────────────────────────────
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  username      varchar(32)  not null,
  email         varchar(255) not null,
  password_hash text         not null,
  display_name  varchar(64)  not null,
  bio           varchar(160),
  avatar_url    text,
  is_disabled   boolean      not null default false,
  last_seen_at  timestamptz,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now(),
  constraint users_username_format check (username ~ '^[a-z0-9_]{3,32}$'),
  constraint users_email_format    check (position('@' in email) > 1)
);

create unique index if not exists users_username_lower_uq on users (lower(username));
create unique index if not exists users_email_lower_uq    on users (lower(email));
create index if not exists users_display_name_idx on users (lower(display_name));

-- ──────────────────────── refresh sessions ───────────────────────
-- Opaque refresh tokens are stored only as SHA-256 hashes.
create table if not exists refresh_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  token_hash   text not null,
  expires_at   timestamptz not null,
  revoked_at   timestamptz,
  user_agent   text,
  ip           inet,
  created_at   timestamptz not null default now()
);

create unique index if not exists refresh_tokens_hash_uq on refresh_tokens (token_hash);
create index if not exists refresh_tokens_user_idx on refresh_tokens (user_id);
create index if not exists refresh_tokens_expires_idx on refresh_tokens (expires_at);

-- ─────────────────────── conversations ───────────────────────────
create table if not exists conversations (
  id         uuid primary key default gen_random_uuid(),
  type       varchar(16) not null default 'private',
  -- sorted "userIdA:userIdB" for private chats; guarantees exactly one
  -- direct conversation per user pair. NULL once group chats exist.
  direct_key varchar(80),
  created_at timestamptz not null default now(),
  constraint conversations_type_check check (type in ('private', 'group'))
);

create unique index if not exists conversations_direct_key_uq
  on conversations (direct_key) where direct_key is not null;

create table if not exists conversation_participants (
  conversation_id     uuid not null references conversations(id) on delete cascade,
  user_id             uuid not null references users(id) on delete cascade,
  role                varchar(16) not null default 'member',
  -- read / delivered pointers, evaluated against messages.created_at
  last_read_at        timestamptz,
  last_read_message_id uuid,
  last_delivered_at   timestamptz,
  joined_at           timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conversation_participants_user_idx
  on conversation_participants (user_id);

-- ─────────────────────────── messages ────────────────────────────
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references users(id) on delete cascade,
  body            text not null,
  -- NULL = live; non-NULL = tombstone kept so ordering stays stable
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  constraint messages_body_check check (length(body) between 1 and 4000)
);

create index if not exists messages_conversation_created_idx
  on messages (conversation_id, created_at desc, id desc);
create index if not exists messages_sender_idx on messages (sender_id);
