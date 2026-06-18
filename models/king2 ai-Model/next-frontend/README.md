# KING2 AI Platform - Next.js 14 Migration

منصة KING2 للذكاء الاصطناعي - إعادة البناء بـ Next.js 14 (App Router)

## 🚀 البدء السريع

### 1. تثبيت الاعتماديات

```bash
cd next-king2
npm install
```

### 2. إعداد قاعدة البيانات

```bash
# انسخ ملف البيئة
cp .env.example .env

# عدّل DATABASE_URL في .env according to your PostgreSQL setup

# إنشاء الجداول
npx prisma db push

# توليد Prisma Client
npx prisma generate
```

### 3. تشغيل الخادم

```bash
npm run dev
```

افتح http://localhost:3000

## 📁 هيكلية المشروع

```
next-king2/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── health/        # Health Check Endpoint
│   ├── globals.css        # الأنماط العالمية
│   ├── layout.tsx         # Layout الرئيسي
│   └── page.tsx          # صفحة المحادثة
├── components/
│   ├── layout/
│   │   ├── Header.tsx    # Header مع مؤشر الصحة
│   │   └── Sidebar.tsx   # Sidebar مع القائمة
│   └── ui/               # مكونات UI
├── lib/
│   └── prisma.ts         # Prisma Client
├── prisma/
│   └── schema.prisma     # مخطط قاعدة البيانات
└── package.json
```

## 🗄️ مخطط قاعدة البيانات

### الجداول الرئيسية:

1. **User** - المستخدمين
2. **UserSettings** - إعدادات المستخدمين
3. **Conversation** - المحادثات
4. **Message** - الرسائل
5. **Attachment** - المرفقات
6. **Reaction** - التفاعلات
7. **KnowledgeBase** - قاعدة المعرفة
8. **Session** - الجلسات
9. **VerificationToken** - رموز التحقق

## 🎨 المميزات

- ✅ Dark Mode RTL Interface
- ✅ Health Check API `/api/health`
- ✅ PostgreSQL Schema مع Prisma
- ✅ Sidebar Navigation
- ✅ Header مع مؤشر الاتصال
- ✅ Chat Interface

## 🔧 الأوامر المتاحة

```bash
npm run dev          # تشغيل في وضع التطوير
npm run build        # بناء للإنتاج
npm run start        # تشغيل في الإنتاج
npm run lint         # فحص الأخطاء
npx prisma studio    # فتح Prisma Studio
```

## 📝 ملاحظات

- تأكد من تشغيل PostgreSQL قبل البدء
- يمكنك استخدام Docker لـ PostgreSQL:
  ```bash
  docker run --name king2-db -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=king2_db -p 5432:5432 -d postgres
  ```

## 🔗 ربط المشروع القديم

لربط هذا المشروع مع كود KING2 الأصلي:
1. يمكنك تشغيل Flask API القديم على منفذ مختلف
2. ربط Next.js بـ API الخارجي
3. استخدام Next.js كـ Frontend فقط

---

**Author**: MiniMax Agent  
**Version**: 1.0.0  
**Date**: 2026-05-12