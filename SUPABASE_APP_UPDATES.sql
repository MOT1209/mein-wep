-- ============================================================
-- جدول تحديثات التطبيقات (OTA) — يُنشر منه إشعار التحديث
-- الصق هذا كاملاً في: Supabase → SQL Editor → New query → Run
-- آمن وقابل لإعادة التشغيل.
-- (راجع SUPABASE_MIGRATIONS.md لترتيب التطبيق الكامل)
-- ============================================================

create table if not exists public.app_updates (
  app_id       text primary key,
  name         text,
  version      text not null,
  url          text,
  notes        text,            -- كل سطر = ملاحظة
  release_date text,
  icon         text,
  updated_at   timestamptz not null default now()
);

alter table public.app_updates enable row level security;

-- أي تطبيق مثبّت (anon) يقرأ آخر إصدار ليقارن
drop policy if exists "anon_read_app_updates" on public.app_updates;
create policy "anon_read_app_updates"
  on public.app_updates for select
  to anon, authenticated using (true);

-- فقط الأدمن (أنت في لوحة الإدارة) ينشر/يعدّل التحديثات — وليس أي مستخدم مسجّل
drop policy if exists "auth_write_app_updates" on public.app_updates;
create policy "auth_write_app_updates"
  on public.app_updates for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- القيم الابتدائية (الإصدارات الحالية)
insert into public.app_updates (app_id, name, version, url, notes, release_date) values
  ('com.rashid.kingcraft',    'KingCraft',         '0.6.0', '/apks/kingcraft-game-v0.6.0.apk', 'الإصدار الحالي المستقر.', '2026-06-16'),
  ('com.rashid.rustsurvival', 'Rust Construction', '1.1.0', '/apks/rust-game-v1.1.0.apk',      E'تدوير البناء وتحسين التضاريس.\nإصلاحات استقرار.', '2026-06-16'),
  ('com.rashid.farmempire',   'Farm Empire',       '2.0.0', '/apks/farm-game-v2.0.0.apk',      'عالم ثلاثي الأبعاد، زراعة، حيوانات، وطقس.', '2026-06-16'),
  ('com.rashid.quranpro',     'Quran Pro',         '1.0.0', '/apks/quran-app-v1.0.0.apk',      'الإصدار الأول.', '2026-06-16'),
  ('com.rashid.smartvault',   'Calculator Vault',  '1.0.0', '/apks/calculator-app-v1.0.0.apk', 'الإصدار الأول.', '2026-06-16'),
  ('com.rashid.quizmaster',   'Quiz Master',       '1.0.0', '/apks/quiz-app-v1.0.0.apk',       'الإصدار الأول.', '2026-06-16')
on conflict (app_id) do nothing;
