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
2. اسم المشروع: `king2-backend` (يطابق `render.yaml`)
3. الإعدادات (استخدم `render.yaml` في جذر هذا المجلد مباشرة — Render يقرأها تلقائيًا كـ Blueprint):
   - **Root Directory**: جذر هذا المستودع (يحتوي `app.py` و`requirements.txt` مباشرة، بدون مسار فرعي)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/keep-alive`

---

## الخطوة 4: إضافة مفاتيح API

⚠️ القائمة الفعلية للمتغيرات المطلوبة موجودة في `render.yaml` (جذر هذا المجلد) —
اعتبره المصدر الوحيد للحقيقة بدل نسخ القائمة هنا (لتفادي تعارض الملفين مستقبلًا).
حاليًا (راجع `render.yaml` للتأكد من عدم تغييرها):

```
GEMINI_API_KEY=<مطلوب — Gemini>
GROQ_API_KEY=<مطلوب — Groq>
OPENROUTER_API_KEY=<مطلوب — OpenRouter>
ZAI_API_KEY=<مطلوب — Z.ai>
RASHID_USERNAME=admin
RASHID_PASSWORD=<كلمة مرور الأدمن>
SUPABASE_URL=<اختياري — من Supabase Dashboard>
SUPABASE_ANON_KEY=<اختياري — من Supabase Dashboard>
```

ملاحظة: `app.py` يتحقق أيضًا من `OPENCODE_API_KEY` عند الإقلاع، لكنه غير موجود في
`render.yaml` الحالي — غيابه لا يوقف الخدمة، فقط يطبع تحذيرًا في السجلات. أضفه
يدويًا في Render إذا كانت الميزة التي يعتمد عليها مستخدمة فعليًا.

---

## الخطوة 5: النشر

1. انقر "Create Web Service"
2. انتظر حتى يكتمل البناء (3-5 دقائق)
3. احصل على الرابط: `https://king2-ai.onrender.com`

---

## 🔧 ملفات التكوين

### render.yaml
انظر الملف الفعلي `render.yaml` في جذر هذا المجلد — يحدَّث مباشرة هناك عند
تغيير الخدمة، بدل نسخة مكررة هنا قد تفقد التزامن معه.

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