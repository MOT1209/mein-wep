# 🔐 الأسرار (Secrets)

ملفات البيئة الحساسة في هذا المشروع **مشفّرة** ولا تُرفع كنص صريح.

| مشفّر (مرفوع) | الأصل (محلي، يتجاهله git) |
|----------------|---------------------------|
| `.env.enc` | `.env` |
| `next-frontend/.env.enc` | `next-frontend/.env` |
| `next-frontend/.env.production.local.enc` | `next-frontend/.vercel/.env.production.local` |

## فك التشفير (للمالك فقط)

1. تأكد من وجود ملف المفتاح: `%USERPROFILE%\king2-secret.key` (غير مرفوع — احتفظ به بأمان).
2. شغّل:
   ```powershell
   .\decrypt-secrets.ps1
   ```

## إعادة التشفير بعد تعديل سرّ

```powershell
$env:KEYPASS = (Get-Content "$env:USERPROFILE\king2-secret.key" -Raw).Trim()
openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -salt -in .env -out .env.enc -pass env:KEYPASS
```

> التشفير: AES‑256‑CBC + PBKDF2 (100k تكرار). من لا يملك المفتاح لا يستطيع قراءة الأسرار.
