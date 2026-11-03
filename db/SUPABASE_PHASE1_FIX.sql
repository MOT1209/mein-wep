-- ============================================================
-- إصلاحات أمنية — المرحلة 1
-- الصق هذا كامل في: Supabase → SQL Editor → New query → Run
-- آمن وقابل لإعادة التشغيل (idempotent). يُطبَّق بعد كل ملفات db/ الأخرى.
-- ============================================================

-- 1. vault_items: سياسة "Authenticated users can read all vault items"
--    كما هي في SUPABASE_VAULT_UPDATE.sql تسمح لأي مستخدم مسجَّل بقراءة
--    العناصر الخاصة (Private)، ولا يوجد ملف في db/ يصلحها.
--    في قاعدة الإنتاج (فُحصت 2026-10-11) هي مُصلَحة يدوياً إلى is_admin()
--    لكن باسم مضلِّل. هذه الخطوة تجعل الملفات مطابقة للواقع وتصحح الاسم.
drop policy if exists "Authenticated users can read all vault items" on public.vault_items;
drop policy if exists "Admins can read all vault items" on public.vault_items;
create policy "Admins can read all vault items"
on public.vault_items for select
to authenticated using (public.is_admin());
-- العناصر العامة تبقى مقروءة للجميع عبر "Anyone can read Public vault items".

-- 2. contact_messages: الإدراج مفتوح لـ anon مباشرةً عبر REST، لذا حدود
--    الطول في api/contact.js وحدها لا تكفي — نفرضها في قاعدة البيانات.
--    NOT VALID: لا يفشل بسبب صفوف قديمة، لكنه يُطبَّق على كل إدراج جديد.
alter table public.contact_messages drop constraint if exists contact_messages_length_chk;
alter table public.contact_messages add constraint contact_messages_length_chk check (
  char_length(name) between 1 and 100
  and char_length(email) between 3 and 200
  and char_length(message) between 1 and 5000
) not valid;
