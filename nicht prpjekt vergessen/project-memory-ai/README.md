# 🚀 AlKing Dashboard 2.0 — رادار صناعة المحتوى الذكي

مشروع AlKing Dashboard هو "رادار مركزي" لصناعة المحتوى، يهدف إلى نقل التحكم من التشتت بين التطبيقات إلى منصة واحدة ذكية.

> **منصة متكاملة**: Next.js 16 + React 19 + TypeScript + Supabase + Tailwind v4 + Framer Motion

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?logo=vercel)](https://dashboard77-phi.vercel.app/)

---

## ✨ الميزات العشر الكاملة

| # | الميزة | الوصف | الحالة |
|---|--------|-------|--------|
| 1 | 🟢 **رادار الترندات** (Trend Radar) | اكتشاف الترندات قبل صعودها | ✅ |
| 2 | 🟢 **محطة الصوت** (Voice Station) | تحويل النص لصوت احترافي (Web Speech API) | ✅ |
| 3 | 🟢 **المقص الذكي** (Auto-Clipper) | مونتاج فيديو احترافي | ✅ |
| 4 | 🟢 **بوت التفاعل** (Engagement Bot) | ردود ذكية على التعليقات | ✅ |
| 5 | 🟢 **المركز المباشر** (Live Center) | مراقبة البث المباشر على الخريطة | ✅ |
| 6 | 🟢 **الشخصية الرقمية** (AI Persona) | إنشاء avatar يتكلم بصوتك | ✅ |
| 7 | 🟢 **رادار المنافسين** (Competitors Radar) | تحليل قنوات المنافسين | ✅ |
| 8 | 🟢 **المترجم العالمي** (Global Dubber) | دبلجة الفيديو لـ 12 لغة | ✅ |
| 9 | 🟢 **استوديو الصور** (Thumbnail Studio) | توليد أغلفة احترافية | ✅ |
| 10 | 🟢 **لوحة الأرباح** (Revenue Dashboard) | متابعة الدخل من المنصات مع رسوم بيانية | ✅ |

> ✅ **10/10 ميزات مبنية بالكامل** - كلها متاحة من واجهة التنقل

---

## 🏗️ مساحات العمل

| المساحة | التبويبات الفرعية | الوصف |
|---------|-------------------|-------|
| **لوحة التحكم** (Dashboard) | الرئيسية • الترندات • التفاعل • الأرباح • المباشر • المنافسين | التحكم الأساسي والإحصائيات |
| **فاحص الكود** (Inspector) | متصفح الملفات • فحص أمني • مساعد ذكي | تحليل وفحص المشاريع البرمجية |
| **استوديو المحتوى** (Studio) | فيديو • صور • محتوى • صوت • دبلجة • شخصية | إنشاء وتحرير المحتوى |
| **الإعدادات** (Settings) | اللغة • المظهر • الحساب | إعدادات النظام والمستخدم |

---

## 🔧 الإعداد للتطوير المحلي

### 1. نسخ المتغيرات البيئية
```bash
cp .env.example .env.local
# ثم املأ المفاتيح من الخدمات التالية
```

### 2. المفاتيح المطلوبة

| الخدمة | الرابط | الغرض |
|--------|--------|-------|
| **OpenRouter** | https://openrouter.ai/keys | الذكاء الاصطناعي (نصوص، صور) |
| **Gemini** | https://aistudio.google.com/apikey | الفحص الأمني الاحتياطي |
| **FAL AI** | https://fal.ai/dashboard | إنشاء الفيديو (Pika) |
| **OCR Space** | https://ocr.space/ocrapi | استخراج النص من الصور |
| **Supabase** | https://supabase.com/dashboard | قاعدة البيانات والتوثيق |

### 3. تشغيل قاعدة البيانات (Supabase)
- اذهب إلى Supabase Dashboard → SQL Editor
- الصق محتوى ملف `supabase_schema.sql` ونفذه
- انسخ `Project URL` و `anon key` إلى `.env.local`

### 4. التشغيل
```bash
npm install
npm run dev
# افتح http://localhost:3000
```

---

## 🌐 النشر

المشروع منشور على: [https://dashboard77-phi.vercel.app/](https://dashboard77-phi.vercel.app/)

---

## 📁 هيكل المشروع

```
src/
├── app/                    # App Router
│   ├── api/               # API endpoints
│   │   ├── files/         # إدارة الملفات
│   │   ├── gemini/        # Gemini AI
│   │   ├── import-local/  # استيراد محلي
│   │   ├── scan/          # فحص الكود
│   │   └── smart/         # Smart API الموحد
│   ├── auth/              # صفحات التوثيق
│   ├── login/             # تسجيل الدخول
│   ├── register/          # إنشاء حساب
│   └── layout.tsx         # التخطيط الرئيسي
├── components/
│   ├── dashboard/         # مكونات لوحة التحكم (6 مشاهد)
│   ├── inspector/         # مكونات الفاحص
│   ├── studio/            # مكونات الاستوديو (6 مشاهد)
│   └── shared/            # مكونات مشتركة (TopNav)
├── lib/                   # مكتبات مساعدة
├── store/                 # State management
└── types/                 # أنواع TypeScript
```

---

> **ملاحظة**: `.env.local` مضاف إلى `.gitignore` — لا تشاركه أبداً
