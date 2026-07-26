# 🔄 كيف ترسل تحديثاً للمستخدمين (نظام OTA داخل التطبيق)

كل تطبيق مثبّت يفحص الملف المركزي [`updates.json`](updates.json) عند فتحه. إذا وجد إصداراً أحدث من المثبّت → تظهر للمستخدم **نافذة تحديث** فيها الملاحظات وزرّا (تحديث الآن / لاحقاً)، والمستخدم يقرّر.

## لإصدار تحديث لتطبيق ما (3 خطوات):

1. **ابنِ APK الجديد** وضعه في مجلد `apks/` باسم فيه الإصدار الجديد، مثل:
   `apks/kingcraft-game-v0.7.0.apk`

2. **حدّث `apks/updates.json`** — ارفع رقم الإصدار، الرابط، التاريخ، والملاحظات:
   ```json
   "com.rashid.kingcraft": {
     "name": "KingCraft",
     "version": "0.7.0",
     "url": "/apks/kingcraft-game-v0.7.0.apk",
     "date": "2026-07-01",
     "notes": ["إضافة الكهوف والمناجم.", "تحسين الأداء وإصلاح أخطاء."]
   }
   ```

3. **ارفع التغييرات** (git push). فور النشر، أي مستخدم يفتح نسخته القديمة سترى له نافذة التحديث.

> **مهم:** يجب أن يكون رقم `version` في `updates.json` **أكبر** من الإصدار المضمّن في التطبيق المثبّت (semver: 0.7.0 > 0.6.0). النسخة المضمّنة تُضبط في `window.RASHID_APP` داخل `index.html` لكل تطبيق — حدّثها أيضاً عند البناء الجديد.

## معرّفات التطبيقات

| التطبيق | المعرّف (id) | الملف |
|---------|-------------|-------|
| KingCraft | `com.rashid.kingcraft` | games/kingcraft-game/ |
| Rust Construction | `com.rashid.rustsurvival` | games/rust-game/ |
| Farm Empire | `com.rashid.farmempire` | games/farm-game/ |
| Quran Pro | `com.rashid.quranpro` | apps/quran-app/ |
| Calculator Vault | `com.rashid.smartvault` | apps/calculator-app/ |
| Quiz Master | `com.rashid.quizmaster` | apps/quiz-app/ |

## اختبار شكل النافذة (على الويب)

- افتح أي تطبيق على الموقع وأضِف `?demoupdate=1` → تظهر النافذة بوضع تجريبي.
- أو `?updatecheck=1` → يشغّل الفحص الحقيقي على الويب (عادةً يعمل داخل تطبيق Android فقط).

> ملاحظة: النظام لا يزعج زوّار الموقع — يعمل تلقائياً فقط داخل تطبيق Android المثبّت (Capacitor).
