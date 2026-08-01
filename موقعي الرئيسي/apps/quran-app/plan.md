# 🕌 خطة تطوير تطبيق القرآن الكريم - Quran App

## 📋 نظرة عامة على المشروع

| البند | التفاصيل |
|-------|---------|
| **الاسم** | Quran App - تطبيق القرآن الكريم |
| **الإصدار** | v1.1.0 (Build 10) |
| **الرابط** | https://rashid-wep.vercel.app/apps/quran-app/ |
| **App ID** | `com.rashid.quranpro` |
| **الحجم** | 5,813 سطر كود موثق + أصول التطبيق |

---

## 🏗️ هيكل المشروع

```
quran-app/
├── index.html              # الصفحة الرئيسية (637 سطر)
├── manifest.json           # ملف PWA Manifest
├── sw.js                   # Service Worker للدعم دون اتصال (184 سطر)
├── package.json            # Vite + Capacitor build
├── capacitor.config.json   # إعدادات الأندرويد
├── version.json            # معلومات الإصدار والتحديثات OTA
├── css/
│   └── style.css           # الأنماط (2,605 سطر)
├── js/
│   ├── app.js              # التطبيق الرئيسي (2,088 سطر)
│   ├── update-checker.js   # فحص التحديثات (97 سطر)
│   ├── vendor/
│   │   └── capacitor.js    # Capacitor API (UMD)
└── icons/                  # أيقونات PWA (8 أحجام)
```

---

## ✅ الميزات الحالية

### 1. قراءة القرآن
- ✅ 114 سورة مع معلومات كاملة
- ✅ تصفية (مكية/مدنية) + بحث فوري
- ✅ خطوط عربية: Scheherazade New, Amiri, Cairo, Noto Naskh Arabic
- ✅ تصميم Mushaf تقليدي + بسملة تلقائية

### 2. التلاوة والاستماع
- ✅ **20+ قارئ** via mp3quran.net (ملفات MP3 كاملة)
- ✅ عناصر تحكم كاملة + سرعة (x0.5-x2.0)
- ✅ تكرار آية + تلاوة متواصلة
- ⚠️ توقيت الآيات تقريبي (لا timestamps حقيقية)

### 3. البحث والتفسير
- ✅ بحث عبر alquran.cloud API + debounce + Ctrl+K
- ✅ تفسير: الجلالين، الميسر، ابن كثير، السعدي، الوسيط
- ✅ ترجمة: English, Français, اردو

### 4. المفضلة + التقدم
- ✅ حفظ آيات + سور في localStorage
- ✅ تتبع السور المقروءة + آخر قراءة

### 5. PWA + Offline
- ✅ Service Worker + stale-while-revalidate للـ API
- ✅ كاش shell كامل + كاش صوت محدود + صفحة عدم اتصال ديناميكية المسار

### 6. تجربة خالية من الإعلانات
- ✅ لا توجد إعلانات في الويب أو تطبيق Android
- ✅ لا يتم تحميل AdSense أو AdMob أو أي SDK إعلاني

### 7. تحديث OTA
- ✅ فحص version.json تلقائي

### 8. التصميم
- ✅ Glassmorphism + ليلي/نهاري + Responsive + RTL + iOS Safe Area

---

## 📊 إحصائيات الكود

| الملف | الأسطر |
|-------|--------|
| css/style.css | 2,605 |
| js/app.js | 2,088 |
| index.html | 637 |
| sw.js | 184 |
| js/auth.js | 186 |
| js/supabase-config.js | 16 |
| js/update-checker.js | 97 |
| **الإجمالي** | **5,813** |

---

## 🐛 مشاكل معروفة

### تم حلها
| # | المشكلة السابقة | الحالة |
|---|----------------|--------|
| 1 | استخدام `innerHTML` في `app.js` | ✅ لا يوجد استخدام تنفيذي؛ بقيت كلمة داخل تعليق أمني فقط |
| 2 | صفحة offline محدودة ومسارات ثابتة | ✅ Service Worker يستخدم مساره تلقائياً ويخدم shell كاملًا |
| 3 | غياب build/minify pipeline | ✅ Vite + esbuild، والبناء يخرج إلى `dist/` |
| 4 | `escapeHtml()` يستخدم `innerHTML` | ✅ الدالة القديمة حُذفت لأنها غير مستخدمة |
| 5 | مرجع `quran-data.js` القديم | ✅ أزيل من الخطة؛ البيانات تُجلب من API ديناميكياً |
| 6 | تحميل `update-checker.js` مرتين | ✅ بقيت النسخة المحلية فقط لتجنب الفحص المكرر |
| 7 | اختلاف مسار النشر وApp ID | ✅ وُحّد المسار إلى `/apps/quran-app/` والهوية إلى `com.rashid.quranpro` |
| 8 | تثبيت Service Worker بعد فشل كاش shell | ✅ فشل الكاش يُفشل التثبيت بدلاً من تشغيل worker ناقص |

### ما تبقى / تحسينات اختيارية
| # | البند | النوع | الموقع |
|---|-------|------|--------|
| 1 | توقيت الآيات تقريبي بدون timestamps | تحسين دقة | `js/app.js` |
| 2 | مفتاح Supabase anon ظاهر في الواجهة | ملاحظة تصميم متوقعة؛ الحماية تعتمد على RLS | `js/supabase-config.js` |
| 3 | لا يوجد TypeScript أو types | تحسين صيانة | المشروع كله |

---

## 🎯 خطة التطوير (4 مراحل)

### المرحلة 1: إصلاح المشاكل الحرجة — مكتملة
- [x] استبدال `innerHTML` بـ `textContent` / DOM API
- [x] إزالة مرجع `quran-data.js` القديم من التوثيق والكاش
- [x] إنشاء صفحة offline واستخدام مسار ديناميكي
- [x] حذف `escapeHtml()` غير المستخدمة
- [x] إزالة الإعلانات وSDKs الإعلانية احتراماً لطبيعة التطبيق

### المرحلة 2: تحسينات الأداء — مكتملة جزئياً
- [x] إضافة minification عبر Vite + esbuild
- [x] تحسين استراتيجية الكاش: shell كامل، API stale-while-revalidate، وصوت محدود
- [ ] Lazy loading للآيات — تحسين اختياري
- [x] استخدام `defer` للسكربتات المحلية

### المرحلة 3: ميزات جديدة
- [ ] قائمة الأجزاء (30 جزء)
- [ ] Media Session API (تلاوة في الخلفية)
- [ ] حفظ موضع آخر آية
- [ ] توفير timestamps دقيقة للآيات
- [ ] تكبير الكلمات عند القراءة

### المرحلة 4: الجودة
- [ ] وحدات اختبار (Vitest)
- [ ] مراجعة WCAG 2.1
- [ ] تحسين SEO
- [ ] توثيق JSDoc

---

## 🔧 التقنيات

| الفئة | التقنية |
|-------|---------|
| Frontend | HTML5, CSS3, Vanilla JS |
| APIs | alquran.cloud, mp3quran.net |
| Build | Vite + esbuild + Capacitor |
| Hosting | Vercel |
| Ads | None — ad-free |
| PWA | Service Worker + Manifest |

---

*آخر تحديث: 2026-08-01 · الإصدار الحالي خالٍ من الإعلانات*
