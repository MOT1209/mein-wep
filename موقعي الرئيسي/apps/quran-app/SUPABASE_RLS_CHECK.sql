-- Quran Pro — RLS verification (read-only)
-- Run this in Supabase Dashboard > SQL Editor.
-- This script only reads metadata; it does not change tables or data.

-- 1) Confirm RLS is enabled on both Quran Pro tables.
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('quran_pro_user_data', 'quran_pro_stats')
ORDER BY c.relname;

-- 2) List the policies currently installed on both tables.
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check AS check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('quran_pro_user_data', 'quran_pro_stats')
ORDER BY tablename, cmd, policyname;

-- Expected metadata result:
-- * rls_enabled = true for both tables.
-- * policies are scoped to the authenticated role.
-- * SELECT uses: auth.uid() = user_id.
-- * INSERT check uses: auth.uid() = user_id.
-- * UPDATE uses auth.uid() = user_id and has the same WITH CHECK.
-- * DELETE uses: auth.uid() = user_id.
--
-- This metadata query does not prove runtime behavior by itself. For the
-- behavioral proof, run: npm run test:supabase
-- The integration test checks anonymous read before/after a write, INSERT,
-- UPDATE through upsert, authenticated read-back, and cleanup.
