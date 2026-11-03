-- ==============================================================================
-- SUPABASE_SETUP_FIXED.sql (راجع SUPABASE_MIGRATIONS.md لترتيب التطبيق الكامل)
-- المرحلة 1: إصلاح صلاحيات RLS لجدولَي projects و bot_knowledge
--
-- المشكلة: سياسات INSERT/UPDATE/DELETE لهذين الجدولين كانت تستخدم
--   "to authenticated using (true) / with check (true)" — أي مستخدم مسجّل
--   (وليس الأدمن فقط) يستطيع الكتابة والحذف.
--
-- الإصلاح: نحتذي نمط جدول lessons الصحيح ونتحقق من العضوية في admin_users:
--   exists (select 1 from public.admin_users where user_id = (select auth.uid()))
--
-- هذا الملف idempotent وآمن: لا يلمس الجداول ولا البيانات ولا سياسات SELECT
-- العامة — يعيد فقط بناء سياسات الكتابة. قابل للّصق مباشرة في Supabase SQL Editor.
-- المتطلّب المسبق: جدول public.admin_users موجود (من SUPABASE_SETUP.sql).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. جدول projects — سياسات الكتابة (INSERT / UPDATE / DELETE)
-- ------------------------------------------------------------------------------
drop policy if exists "Admins can insert projects" on public.projects;
drop policy if exists "Admins can update projects" on public.projects;
drop policy if exists "Admins can delete projects" on public.projects;

create policy "Admins can insert projects"
on public.projects for insert to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can update projects"
on public.projects for update to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can delete projects"
on public.projects for delete to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- ------------------------------------------------------------------------------
-- 2. جدول bot_knowledge — استبدال سياسة "for all" بسياسات كتابة محصورة بالأدمن
--    (نُسقِط سياسة "Admins can manage knowledge" القديمة التي كانت تمنح كل
--     العمليات لأي مستخدم مسجّل، ونستبدلها بسياسات INSERT/UPDATE/DELETE صريحة.
--     سياسة "Everyone can read knowledge" العامة تبقى كما هي — لا نلمسها.)
-- ------------------------------------------------------------------------------
drop policy if exists "Admins can manage knowledge" on public.bot_knowledge;
drop policy if exists "Admins can insert knowledge" on public.bot_knowledge;
drop policy if exists "Admins can update knowledge" on public.bot_knowledge;
drop policy if exists "Admins can delete knowledge" on public.bot_knowledge;

create policy "Admins can insert knowledge"
on public.bot_knowledge for insert to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can update knowledge"
on public.bot_knowledge for update to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can delete knowledge"
on public.bot_knowledge for delete to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- ------------------------------------------------------------------------------
-- 3. إغلاق ثغرة التسجيل الذاتي كأدمن
--    الدالة add_admin_user() (security definer) كانت تسمح لأي مستخدم مسجّل
--    بإضافة نفسه إلى admin_users عبر RPC. لم تعد الواجهة تستدعيها (المرحلة 2)،
--    ونحذفها هنا لإغلاق المسار نهائياً. (idempotent: if exists)
-- ------------------------------------------------------------------------------
drop function if exists public.add_admin_user();
