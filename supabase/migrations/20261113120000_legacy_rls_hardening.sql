-- =============================================================================
-- 20261113120000_legacy_rls_hardening.sql — least privilege on the legacy tables
-- =============================================================================
-- The legacy tables (projects, models, vault_items, …) were created by the
-- hand-run files in db/. Replaying those files in the documented order
-- (SUPABASE_MIGRATIONS.md) leaves public.models writable by ANY signed-in
-- user: db/SUPABASE_SETUP.sql creates "Admins can insert/update/delete models"
-- with `true`, later adds is_admin() policies under other names, and never
-- drops the first ones (permissive policies are OR-ed). Public sign-up exists
-- for the farm game, so "signed in" is not "admin". See docs/audit/.
--
-- What this migration does, only for tables that exist:
--   1. enables Row Level Security;
--   2. drops the known over-broad legacy policies by name, and ANY other
--      permissive write policy (INSERT/UPDATE/DELETE/ALL) whose condition is
--      the constant `true` — so drift on the live database is caught too;
--   3. recreates admin-only write policies (is_admin()) and the public read
--      policies (Public rows for everyone, all rows for admins);
--   4. revokes write privileges from anon on these tables;
--   5. pins search_path on the legacy SECURITY DEFINER counter function.
--
-- Not touched: contact_messages inserts (the public contact form relies on
-- them; length checks exist), the farm-game tables (per-user policies on
-- auth.uid()), admin_users (managed by 20261103120000_admin_cms.sql).
--
-- Additive in effect and safe to re-run. Rollback: see the end of this file.
-- =============================================================================

do $$
declare
  t text;
  p record;
  has_status boolean;
  -- Tables whose rows are content managed by the owner.
  content_tables text[] := array['projects', 'models', 'vault_items', 'lessons', 'bot_knowledge',
                                 'prompts', 'codes', 'images', 'media', 'app_updates'];
  -- Known over-broad policies from db/*.sql (dropped wherever they still exist).
  bad_names text[] := array[
    'Admins can view all models', 'Admins can insert models', 'Admins can update models', 'Admins can delete models',
    'Admins can view all projects',
    'Admins can view all vault items', 'Authenticated users can read all vault items',
    'Admins can manage knowledge'];
begin
  foreach t in array content_tables || array['site_stats'] loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;

    execute format('alter table public.%I enable row level security', t);

    for p in select policyname from pg_policies
             where schemaname = 'public' and tablename = t and policyname = any (bad_names) loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;

    -- Any remaining permissive write policy that lets every caller through.
    for p in select policyname from pg_policies
             where schemaname = 'public' and tablename = t
               and permissive = 'PERMISSIVE'
               and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
               and (coalesce(btrim(qual), 'true') = 'true' and coalesce(btrim(with_check), 'true') = 'true') loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;

    execute format('revoke insert, update, delete, truncate on public.%I from anon', t);
  end loop;

  -- Admin-only writes and a uniform read rule for the content tables.
  foreach t in array content_tables loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;

    execute format('drop policy if exists legacy_admin_insert on public.%I', t);
    execute format('drop policy if exists legacy_admin_update on public.%I', t);
    execute format('drop policy if exists legacy_admin_delete on public.%I', t);
    execute format('create policy legacy_admin_insert on public.%I for insert to authenticated
                    with check ((select public.is_admin()))', t);
    execute format('create policy legacy_admin_update on public.%I for update to authenticated
                    using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('create policy legacy_admin_delete on public.%I for delete to authenticated
                    using ((select public.is_admin()))', t);

    select exists (select 1 from information_schema.columns
                   where table_schema = 'public' and table_name = t and column_name = 'status')
      into has_status;
    execute format('drop policy if exists legacy_read on public.%I', t);
    if t = 'app_updates' or t = 'bot_knowledge' then
      -- Read by every installed app / the site chatbot: all rows are public.
      execute format('create policy legacy_read on public.%I for select using (true)', t);
    elsif has_status then
      execute format($f$create policy legacy_read on public.%I for select
                      using (status = 'Public' or (select public.is_admin()))$f$, t);
    else
      execute format('create policy legacy_read on public.%I for select using ((select public.is_admin()))', t);
    end if;
  end loop;
end $$;

-- The visitor counter is SECURITY DEFINER; a fixed search_path stops a caller
-- from shadowing objects it references (its body uses public.site_stats).
do $$ begin
  alter function public.increment_visitor_count() set search_path = '';
exception when undefined_function then null; end $$;

-- -----------------------------------------------------------------------------
-- Rollback (manual, NOT recommended: it reopens the hole). To undo only the
-- policies this file created, for each table above:
--   drop policy if exists legacy_admin_insert on public.<t>;
--   drop policy if exists legacy_admin_update on public.<t>;
--   drop policy if exists legacy_admin_delete on public.<t>;
--   drop policy if exists legacy_read on public.<t>;
-- then re-run the matching db/*.sql file. The dropped over-broad policies are
-- deliberately not restored here.
-- -----------------------------------------------------------------------------
