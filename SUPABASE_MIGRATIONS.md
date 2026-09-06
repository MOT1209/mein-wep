# فهرس ملفات Supabase SQL

مرجع واحد يوضّح ترتيب تطبيق كل ملفات `SUPABASE_*.sql` في [`db/`](db/)، بدل تخمين
الترتيب من التواريخ أو المحتوى. رُتّبت هنا حسب أول ظهور لها في تاريخ git (وهو
نفسه ترتيب الاعتماد الفعلي بينها).

| # | الملف | الغرض | آمن لإعادة التشغيل؟ |
|---|-------|-------|----------------------|
| 1 | [`SUPABASE_SETUP.sql`](db/SUPABASE_SETUP.sql) | الإعداد الأساسي: كل الجداول (`projects`, `bot_knowledge`, `lessons`, `prompts`, `codes`, `images`, `media`, `vault_items`, `models`, `site_stats`, `admin_users`) ودالة `is_admin()` | **لا — مدمِّر.** يحذف الجداول أولًا. أول تشغيل فقط. |
| 2 | [`SUPABASE_VAULT_UPDATE.sql`](db/SUPABASE_VAULT_UPDATE.sql) | أعمدة إضافية لـ `vault_items` لدعم الخزينة بالتبويبات | نعم (idempotent) |
| 3 | [`SUPABASE_CONTACT_FIX.sql`](db/SUPABASE_CONTACT_FIX.sql) | جدول `contact_messages` + سياسات RLS (قراءة/حذف للأدمن فقط) | نعم (idempotent) |
| 4 | [`SUPABASE_APP_UPDATES.sql`](db/SUPABASE_APP_UPDATES.sql) | جدول `app_updates` (تحديثات OTA للتطبيقات) + RLS (كتابة للأدمن فقط) | نعم (idempotent) |
| 5 | [`SUPABASE_SETUP_FIXED.sql`](db/SUPABASE_SETUP_FIXED.sql) | يُصلح سياسات RLS لجدولَي `projects` و`bot_knowledge` (كانت تسمح لأي مستخدم مسجّل بالكتابة، وليس الأدمن فقط) | نعم (idempotent) |
| 6 | [`SUPABASE_SECURITY_FIX.sql`](db/SUPABASE_SECURITY_FIX.sql) | إصلاحات أمنية حرجة: صلاحية `add_admin_user`، Rate Limiting لنموذج التواصل، تأكيد RLS للأدمن | نعم (idempotent) |
| 7 | [`SUPABASE_FARM_GAME.sql`](db/SUPABASE_FARM_GAME.sql) | جداول لعبة Farm Empire (`game_saves` وغيرها) — مستقلة عن ترقيم 1-6، تُشغَّل عند تفعيل حفظ اللعبة على الخادم | نعم — تضيف جداول جديدة فقط، لا تلمس القائمة الحالية |

## كيف تستخدم هذا الفهرس

- **قاعدة بيانات جديدة تمامًا:** شغّل الملفات بالترتيب أعلاه من 1 إلى 6.
- **قاعدة بيانات حية موجودة:** لا تُعِد تشغيل الملف رقم 1 أبدًا (يحذف البيانات).
  الملفات 2-6 آمنة لإعادة التشغيل في أي وقت للتأكد أن آخر إصلاح مُطبَّق فعليًا.
- لا يوجد ملف "كل شيء في مكان واحد" لأن التحقق من تطابقه مع حالة القاعدة الحية
  يتطلب وصولًا مباشرًا لا يملكه أي أداة أوتوماتيكية بأمان — هذا الفهرس هو
  مصدر الحقيقة للترتيب بدل ملف SQL مُدمَج قد ينحرف عن الواقع.
