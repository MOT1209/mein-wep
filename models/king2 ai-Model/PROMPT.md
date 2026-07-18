# KING2 AI — منصة الذكاء الاصطناعي العربية

## الوصف
منصة KING2 هي مساعد ذكاء اصطناعي متكامل باللغة العربية، يدعم المحادثة الذكية، تحليل الصور، إنشاء الصور، قاعدة معرفة ديناميكية، والتعلم الذاتي.

## التقنيات
- الباك إند: Python FastAPI + Uvicorn
- الواجهة: Next.js 14 App Router + React 18 + TypeScript + Tailwind CSS
- مزودي AI: Gemini, Groq, OpenRouter, ZAI (مع fallback تلقائي)
- قاعدة البيانات: Supabase (PostgreSQL) + SQLite (احتياطي)
- المصادقة: NextAuth v4 + bcrypt
- النشر: Render (باك إند) + Vercel (واجهة)

## الهيكل
- `app.py` — نقطة الدخول الرئيسية للباك إند
- `king2_engine.py` — محرك AI الأساسي
- `next-frontend/` — واجهة Next.js
- `skills/` — مهارات الـ agent (بحث ويب، آلة حاسبة)

## الأوامر المهمة
- تشغيل الباك إند: `python app.py`
- تشغيل الواجهة: `cd next-frontend && npm run dev`
- بناء الواجهة: `cd next-frontend && npm run build`

## ملاحظات
- نظام RTL بالكامل، اللغة العربية أساسية
- التصميم مظلم (dark theme) مع ألوان كحلية وذهبية
- المستخدم الرئيسي (admin): Rashid2010
- مفاتيح API في `.env` — لا تفضح للـ client
