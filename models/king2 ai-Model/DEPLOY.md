# 🚀 KING2 AI - دليل النشر على Render.com

## المتطلبات

- حساب GitHub
- حساب Render.com
- مشروع KING2 على GitHub

---

## الخطوة 1: رفع المشروع على GitHub

1. تأكد من وجود ملف `.gitignore` (تم إنشاؤه)
2. ارفع المشروع:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## الخطوة 2: إنشاء حساب Render

1. اذهب إلى [render.com](https://render.com)
2. سجّل باستخدام حساب GitHub
3. انقر على "New" → "Web Service"

---

## الخطوة 3: ربط GitHub

1. اختر repository يحتوي على KING2
2. اسم المشروع: `king2-ai`
3. الإعدادات:
   - **Root Directory**: `Alking_AI_Platform/backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

---

## الخطوة 4: إضافة مفاتيح API

في لوحة Render، اذهب إلى **Environment Variables** وأضف:

```
PIXABAY_API_KEY=<من Pixabay>
YOUTUBE_API_KEY=<من Google Cloud Console>
GOOGLE_SEARCH_API_KEY=<من Google Cloud Console>
GOOGLE_SEARCH_ENGINE_ID=<من Google Custom Search>
KAGGLE_USERNAME=<من Kaggle>
KAGGLE_KEY=<من Kaggle>
```

### مفاتيح الذكاء الاصطناعي (اختياري):
```
GROQ_API_KEY=gsk_YOUR_KEY_HERE
GEMINI_API_KEY=AIzaSy_YOUR_KEY_HERE
```

---

## الخطوة 5: النشر

1. انقر "Create Web Service"
2. انتظر حتى يكتمل البناء (3-5 دقائق)
3. احصل على الرابط: `https://king2-ai.onrender.com`

---

## 🔧 ملفات التكوين

### render.yaml
```yaml
services:
  - type: web
    name: king2-ai
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: "3.11"
```

### .gitignore (مهم!)
```
.env
__pycache__/
*.db
uploads/
```

---

## ✅ اختبار بعد النشر

جرب الروابط:
- `https://your-app.onrender.com/` - الصفحة الرئيسية
- `https://your-app.onrender.com/api/status` - حالة API
- `https://your-app.onrender.com/stats` - إحصائيات

---

## 🔑 تسجيل الدخول عبر Google و GitHub

### إضافة المتغيرات في Render Dashboard

اذهب إلى Render Dashboard → Environment Variables وأضف:

```
SUPABASE_URL=<من Supabase Dashboard>
SUPABASE_ANON_KEY=<من Supabase Dashboard>
SUPABASE_SERVICE_KEY=<من Supabase Dashboard>
GOOGLE_CLIENT_ID=<من Google Cloud Console>
GOOGLE_CLIENT_SECRET=<من Google Cloud Console>
GITHUB_CLIENT_ID=<من GitHub OAuth>
GITHUB_CLIENT_SECRET=<من GitHub OAuth>
OAUTH_REDIRECT_BASE=https://your-app.onrender.com
```

⚠️ **مفاتيح API السرية لا تضاف في الكود!** أضفها مباشرة في Render Dashboard.

### إعداد Google Cloud Console
1. اذهب إلى https://console.cloud.google.com/apis/credentials
2. أضف **Authorized redirect URI**:
   ```
   https://your-app.onrender.com/auth/google/callback
   ```

### إعداد GitHub OAuth
1. اذهب إلى https://github.com/settings/developers
2. أضف **Authorization callback URL**:
   ```
   https://your-app.onrender.com/auth/github/callback
   ```

---

## ❌ حل المشاكل

### خطأ في البناء:
- تأكد من مسار `requirements.txt`
- تأكد من Python version (3.11)

### خطأ في التشغيل:
- تأكد من إضافة `PORT` في Environment Variables
- تحقق من Console logs في Render

### API Keys لا تعمل:
- أضف المفاتيح في Environment Variables وليس في الكود

---

## 📝 ملاحظات

- **الـ Database**: قاعدة البيانات `king2_core.db` موجودة محلياً. لن تعمل على Render.
- **Uploads**: مجلد `uploads` لا يُرفع (مضاف في .gitignore)
- **الذاكرة**: التعلم الذاتي يعمل لكن يحتاج تخزين خارجي للاستمرارية

---

## 📞 الدعم

إذا واجهت مشاكل، راجع:
- [Render Docs](https://render.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)