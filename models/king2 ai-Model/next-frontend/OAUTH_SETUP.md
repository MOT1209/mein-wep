# إعداد تسجيل الدخول بـ Google و GitHub

## 1. Google OAuth

### الخطوة 1: إنشاء مشروع Google Cloud
1. اذهب إلى https://console.cloud.google.com/apis/credentials
2. أنشئ مشروعاً جديداً (أو اختر مشروعاً موجوداً)
3. اذهب إلى **OAuth consent screen**
4. اختر **External** (خارجي)
5. املأ المعلومات المطلوبة (اسم التطبيق: `KING2 AI`، بريدك الإلكتروني)
6. أضف نطاق `.../auth/userinfo.email` و `.../auth/userinfo.profile`

### الخطوة 2: إنشاء OAuth Client ID
1. اذهب إلى **Credentials** ← **Create Credentials** ← **OAuth client ID**
2. نوع التطبيق: **Web application**
3. الاسم: `KING2 Web`
4. **Authorized JavaScript origins**:
   - `https://alking-ai-king2-f4rr.vercel.app`
   - `http://localhost:3000`
5. **Authorized redirect URIs** (الأهم!):
   - `https://alking-ai-king2-f4rr.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
6. اضغط **Create**
7. انسخ **Client ID** و **Client Secret**

### الخطوة 3: أضف المفاتيح في Vercel
في Vercel Dashboard:
1. اذهب إلى المشروع → **Settings** → **Environment Variables**
2. أضف:
   ```
   GOOGLE_CLIENT_ID = القيمة التي نسختها
   GOOGLE_CLIENT_SECRET = القيمة التي نسختها
   ```

---

## 2. GitHub OAuth

### الخطوة 1: إنشاء OAuth App
1. اذهب إلى https://github.com/settings/developers
2. اضغط **New OAuth App**
3. املأ:
   - **Application name**: `KING2 AI`
   - **Homepage URL**: `https://alking-ai-king2-f4rr.vercel.app`
   - **Authorization callback URL**: `https://alking-ai-king2-f4rr.vercel.app/api/auth/callback/github`
4. اضغط **Register application**
5. انسخ **Client ID** و **Client Secret**

### الخطوة 2: أضف المفاتيح في Vercel
```
GITHUB_CLIENT_ID = القيمة التي نسختها
GITHUB_CLIENT_SECRET = القيمة التي نسختها
```

---

## 3. متغيرات البيئة الأساسية في Vercel

تأكد من أن هذه المتغيرات موجودة كلها في Vercel:

| المتغير | القيمة |
|---------|--------|
| `DATABASE_URL` | رابط PostgreSQL من Render |
| `NEXTAUTH_URL` | `https://alking-ai-king2-f4rr.vercel.app` |
| `NEXTAUTH_SECRET` | مفتاح سري قوي (مثل: `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | من Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | من Google Cloud Console |
| `GITHUB_CLIENT_ID` | من GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | من GitHub OAuth |
| `NODE_ENV` | `production` |

---

## 4. اختبار

1. اذهب إلى `https://alking-ai-king2-f4rr.vercel.app/auth/signin`
2. جرب تسجيل الدخول بـ Google
3. جرب تسجيل الدخول بـ GitHub

إذا واجهت خطأ، تحقق من **Vercel Function Logs**:
```
Vercel Dashboard → Project → Functions → آخر طلب
```

الأخطاء الشائعة:
- `redirect_uri_mismatch` → تأكد من أن redirect URI في Google Cloud يطابق تماماً رابط Vercel
- `OAuthAccountNotLinked` → البريد الإلكتروني مستخدم مع مزود آخر (سجل دخول بكلمة المرور أولاً)
