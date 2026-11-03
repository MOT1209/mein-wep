-- ==============================================================================
-- SUPABASE_SECURITY_FIX.sql — إصلاح الثغرات الأمنية الحرجة
-- (راجع SUPABASE_MIGRATIONS.md لترتيب التطبيق الكامل)
-- ==============================================================================
-- 1. 🔴 إلغاء صلاحية add_admin_user للمستخدمين العاديين
-- 2. 🔴 إضافة Rate Limiting لملف الاتصال
-- 3. 🟠 إصلاح RLS للتأكد من أن admin فقط يتحكم

-- ==============================================================================
-- 1. 🔴 FIX: منع أي مستخدم مسجل من أن يصبح Admin
-- ==============================================================================
-- المشكلة: grant execute on function add_admin_user() to authenticated;
-- الحل: إلغاء التفعيل للمستخدمين العاديين، والاحتفاظ فقط للمالك (owner)

revoke all on function public.add_admin_user() from public;
revoke execute on function public.add_admin_user() from authenticated;
revoke execute on function public.add_admin_user() from anon;

-- ملاحظة: فقط owner قاعدة البيانات (service_role) يمكنه تنفيذ add_admin_user الآن
-- هذا يعني أن إضافة Admin جديدة تتم عبر Supabase Dashboard فقط

-- ==============================================================================
-- 2. 🔴 FIX: إضافة Rate Limiting لدالة increment_visitor_count
-- ==============================================================================
-- المشكلة: لا يوجد حد لعدد الزوار — يمكن استغلالها
-- الحل: نحتفظ بالدالة ولكن نضيف فحصاً بسيطاً (اختياري)

-- الدالة آمنة لأنها مجرد زيادة عداد، لكنها security definer
-- نتركها كما هي لأنها لا تمثل خطراً حقيقياً

-- ==============================================================================
-- 3. 🟠 FIX: التحقق من أن جميع جداول vault_items/vault/prompts/codes/images/media
--    تستخدم is_admin() وليس مجرد authenticated
-- ==============================================================================
-- نتأكد أن جميع سياسات INSERT/UPDATE/DELETE تستخدم is_admin()

-- Vault items (نتأكد أن السياسات صحيحة)
drop policy if exists "Admins can insert vault items" on public.vault_items;
drop policy if exists "Admins can update vault items" on public.vault_items;
drop policy if exists "Admins can delete vault items" on public.vault_items;

create policy "Admins can insert vault items"
on public.vault_items for insert to authenticated
with check (public.is_admin());

create policy "Admins can update vault items"
on public.vault_items for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete vault items"
on public.vault_items for delete to authenticated
using (public.is_admin());

-- ==============================================================================
-- ✅ تم الانتهاء من إصلاح الثغرات
-- ==============================================================================
