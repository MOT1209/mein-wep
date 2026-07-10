-- ============================================================
-- إصلاح حفظ رسائل التواصل + عرضها في لوحة الإدارة
-- الصق هذا كامل في: Supabase → SQL Editor → New query → Run
-- آمن وقابل لإعادة التشغيل (idempotent).
-- ============================================================

-- تأكد من وجود الجدول
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- أي زائر يستطيع إرسال رسالة (إدراج)
drop policy if exists "anon_insert_contact" on public.contact_messages;
create policy "anon_insert_contact"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- فقط الأدمن (أنت في لوحة الإدارة) يرى الرسائل — وليس أي مستخدم مسجّل
drop policy if exists "auth_read_contact" on public.contact_messages;
create policy "auth_read_contact"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

-- فقط الأدمن يحذف الرسائل
drop policy if exists "auth_delete_contact" on public.contact_messages;
create policy "auth_delete_contact"
  on public.contact_messages for delete
  to authenticated
  using (public.is_admin());
