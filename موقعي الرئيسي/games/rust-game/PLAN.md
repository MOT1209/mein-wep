# 🎯 الخطة الشاملة — Rust Survival 3D

**الهدف:** إصلاح كل مشاكل الفحص وتشغيل اللعبة على الموقع المباشر.

## الوضع الحالي (من الفحص)
| البند | الحالة |
|---|---|
| النسخة الويب (Three.js) | ✅ سليمة تقنيًا |
| منفذ Godot 4 | ✅ 942 PASS |
| النشر على Vercel | ❌ 404 — `games/` غير متتبَّع في git |
| AdMob | ⚠️ أكواد وهمية |
| PWA (sw.js) | ⚠️ cache-first + تحديث مزدوج |

## السبب الجذري لـ 404
Vercel ينشر من **git HEAD** لريبو mein-wep. مجلد `games/` في الجذر **غير متتبَّع في git** → غير موجود في النشر. الحل: مزامنة نسخة النشر + إضافة للـ git + push.

---

## المرحلة 1 — إصلاحات الكود (قبل النشر)
- [x] 1.1 `sw.js`: network-first للملاحة + رفع CACHE_NAME إلى v2
- [x] 1.2 `index.html`: إزالة التحميل المزدوج لـ update-checker
- [x] 1.3 `index.html`: توحيد رقم الإصدار (8.0 → 1.1.0)
- [x] 1.4 `version.json`: تحديث changelog
- [x] 1.5 `game.js`: إيقاف إعادة إنشاء Fog كل إطار

## المرحلة 2 — مزامنة نسخة النشر
- [x] 2.1 نسخ ملفات الويب من `موقعي الرئيسي/games/rust-game` → `games/rust-game` (جذر الريبو)
- [x] 2.2 استثناء godot/ وrust-1/ وdocs/ (ليست للويب)
- [x] 2.3 `.gitignore` لنسخة النشر

## المرحلة 3 — النشر على Vercel
- [x] 3.1 `git add games/rust-game` + commit
- [x] 3.2 `git push origin main`
- [x] 3.3 متابعة الـ deployment
- [x] 3.4 التحقق: `/games/rust-game/` → 200

## المرحلة 4 — التحقق الشامل
- [x] 4.1 فحص HTML المنشور (العناصر، السكربتات)
- [x] 4.2 فحص sw.js / manifest / version.json live
- [x] 4.3 لقطة شاشة للعبة عبر agent-browser (1262×568)

## المرحلة 5 — AdMob (البند الوحيد الذي يحتاج حسابك)
- [x] 5.0 بناء الـ APK تلقائيًا (GitHub Actions) — 3.2MB مباشر على الموقع ✅
- [x] 5.0 إصلاح CI/CD Pipeline (كان يفشل على كل push بسبب مجلد Maarifah الغائب)
- [ ] 5.1 إنشاء 3 وحدات (Banner/Interstitial/Rewarded) في وحدة تحكم AdMob ← **يحتاج دخولك لحساب Google**
- [ ] 5.2 استبدال الأكواد في `js/ads.js` + `ca-app-pub-6142754371257083~XXXXXXXXXX` (الـ App ID)
- [ ] 5.3 إعادة بناء APK (دفعة واحدة كافية — الـ CI يعيد البناء تلقائيًا)
