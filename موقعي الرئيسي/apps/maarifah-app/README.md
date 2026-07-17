# تطبيق معرفة (Maarifah App)

تطبيق تعليمي ومعرفي متكامل مبني بـ **Flutter** باتباع **Clean Architecture**.

## المميزات
- معلومات عامة، برمجة، ذكاء اصطناعي، دورات، اختبارات، مجتمع.
- مساعد ذكاء اصطناعي (محلي قابل للتوصيل بأي API).
- نظام نقاط XP، شارات، إنجازات، Leaderboard.
- دعم العربية الكامل RTL + الإنجليزية.
- الوضع الليلي والنهاري.
- لوحة تحكم (Admin) لإدارة المحتوى.
- بيانات محلية (يعمل مباشرة بلا خادم) + بنية Repository تسمح بالتبديل لأي Backend.

## التشغيل
```bash
cd maarifah_app
flutter create .          # لتوليد مجلدات android/ ios/ (مرة واحدة فقط)
flutter pub get
flutter run
```

> ملاحظة: `flutter create .` يولّد منصات التشغيل (Android/iOS) دون المساس بمجلد `lib/` أو `pubspec.yaml`.

## بيانات الدخول التجريبية
- مستخدم عادي: `user@maarifah.app` / `123456`
- مدير (Admin): `admin@maarifah.app` / `admin123`

## البنية
```
lib/
├── main.dart
├── app.dart
├── core/            # ثوابت، ثيمات، خدمات، أدوات، Widgets عامة
├── data/            # models، datasources، repositories impl
├── domain/          # entities، عقود repositories، usecases
├── presentation/    # screens، widgets، providers
├── routes/          # go_router
└── localization/    # AR / EN
```
