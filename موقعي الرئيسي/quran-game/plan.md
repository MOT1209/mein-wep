# 🕌 خطة تطوير تطبيق القرآن الكريم - Quran App

## 📋 نظرة عامة على المشروع

| البند | التفاصيل |
|-------|---------|
| **الاسم** | Quran App - تطبيق القرآن الكريم |
| **الإصدار** | v1.0.1 (Build 9) |
| **الرابط** | https://rashid-wep.vercel.app/apps/quran-app/ |
| **App ID** | `com.rashid.quranapp` |
| **الحجم** | ~4,467 سطر كود |

---

## 🏗️ هيكل المشروع

```
quran-app/
├── index.html              # الصفحة الرئيسية (523 سطر)
├── manifest.json           # ملف PWA Manifest
├── sw.js                   # Service Worker للدعم دون اتصال (162 سطر)
├── package.json            # Capacitor 8 + AdMob
├── capacitor.config.json   # إعدادات الأندرويد
├── version.json            # معلومات الإصدار والتحديثات OTA
├── css/
│   └── style.css           # الأنماط (2,175 سطر)
├── js/
│   ├── app.js              # التطبيق الرئيسي (1,405 سطر)
│   ├── ads.js              # إعلانات AdMob (125 سطر)
│   ├── update-checker.js   # فحص التحديثات (77 سطر)
│   └── vendor/
│       ├── capacitor.js    # Capacitor API (UMD)
│       └── admob.js        # AdMob Library (UMD)
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
- ✅ Service Worker + network-first للـ API
- ✅ كاش 30 يوم + مؤشر عدم الاتصال

### 6. إعلانات AdMob (Capacitor فقط)
- ✅ Banner, Interstitial, Rewarded

### 7. تحديث OTA
- ✅ فحص version.json تلقائي

### 8. التصميم
- ✅ Glassmorphism + ليلي/نهاري + Responsive + RTL + iOS Safe Area

---

## 📊 إحصائيات الكود

| الملف | الأسطر |
|-------|--------|
| css/style.css | 2,175 |
| js/app.js | 1,405 |
| index.html | 523 |
| sw.js | 162 |
| js/ads.js | 125 |
| js/update-checker.js | 77 |
| **الإجمالي** | **4,467** |

---

## 🐛 مشاكل معروفة

### حرجة
| # | المشكلة | الموقع |
|---|---------|--------|
| 1 | `innerHTML` مع بيانات مستخدم (مخاطر XSS) | app.js:191, 280, 295, 323, 420-421, 817 |
| 2 | ملف `quran-data.js` مفقود في SW | sw.js:8 |
| 3 | توقيت آيات تقريبي فقط | app.js:617-619 |

### متوسطة
| # | المشكلة | الموقع |
|---|---------|--------|
| 4 | لا يوجد صفحة offline مخصصة | sw.js:78 |
| 5 | لا يوجد build/minify pipeline | package.json |
| 6 | `escapeHtml()` يستخدم `innerHTML` | app.js:448-450 |
| 7 | لا يوجد TypeScript أو أنواع بيانات | المشروع كله |

---

## 🎯 خطة التطوير (4 مراحل)

### المرحلة 1: إصلاح المشاكل الحرجة
- [ ] استبدال `innerHTML` بـ `textContent` / DOM API
- [ ] حذف `quran-data.js` من sw.js STATIC_ASSETS
- [ ] إنشاء صفحة offline جميلة
- [ ] إصلاح `escapeHtml()` لاستخدام `textContent`
- [ ] مراجعة أمان AdMob App ID

### المرحلة 2: تحسينات الأداء
- [ ] إضافة minification (esbuild/terser)
- [ ] تحسين استراتيجية الكاش
- [ ] Lazy loading
- [ ] إضافة defer/async لجميع السكربتات

### المرحلة 3: ميزات جديدة
- [ ] قائمة الأجزاء (30 جزء)
- [ ] Media Session API (تلاوة في الخلفية)
- [ ] حفظ موضع آخر آية
- [ ] صفحة offline جميلة

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
| Build | Capacitor 8 |
| Hosting | Vercel |
| Ads | AdMob (Capacitor Community) |
| PWA | Service Worker + Manifest |

---

*آخر تحديث: 2026-07-20*
