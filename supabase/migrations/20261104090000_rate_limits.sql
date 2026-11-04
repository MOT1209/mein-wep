-- =============================================================================
-- 20261104090000_rate_limits.sql — rate limits shared by every server instance
-- =============================================================================
-- The in-memory limiters in api/_lib/http.js are per serverless instance. For
-- the sensitive endpoints (admin sign-in, publish, GitHub sync, uploads) the
-- API also counts in the database, so a limit holds across instances and cold
-- starts. Buckets are opaque strings built on the server (an action name plus
-- a salted hash of the client IP); the table lives in the private schema and
-- is only reachable through this function. Additive and re-runnable.
-- =============================================================================

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.rate_limits (
  bucket text primary key,
  hits integer not null,
  reset_at timestamptz not null
);
revoke all on table private.rate_limits from public, anon, authenticated;

-- Returns true while the bucket is within p_limit hits per p_window_s seconds.
create or replace function public.rate_limit_hit(p_bucket text, p_limit integer, p_window_s integer)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_hits integer;
begin
  if p_bucket is null or p_bucket !~ '^[a-z0-9._:-]{1,120}$'
     or p_limit is null or p_limit < 1 or p_limit > 10000
     or p_window_s is null or p_window_s < 1 or p_window_s > 86400 then
    raise exception 'bad rate limit arguments' using errcode = '22023';
  end if;

  -- Keep the table small: drop long-expired buckets now and then.
  if random() < 0.02 then
    delete from private.rate_limits where reset_at < now() - interval '1 hour';
  end if;

  insert into private.rate_limits as r (bucket, hits, reset_at)
  values (p_bucket, 1, now() + make_interval(secs => p_window_s))
  on conflict (bucket) do update set
    hits = case when r.reset_at <= now() then 1 else r.hits + 1 end,
    reset_at = case when r.reset_at <= now() then now() + make_interval(secs => p_window_s) else r.reset_at end
  returning hits into v_hits;

  return v_hits <= p_limit;
end;
$$;
revoke all on function public.rate_limit_hit(text, integer, integer) from public;
grant execute on function public.rate_limit_hit(text, integer, integer) to anon, authenticated;
