# -*- coding: utf-8 -*-
"""نشر منصة king2 (Next.js) كمشروع Vercel اسمه king2-platform — يُشغَّل يدويًا.

يقرأ الأسرار من next-frontend/.env المحلي، ينشئ/يربط مشروع king2-platform،
يرفع المتغيرات لبيئة الإنتاج (مع تصحيح الدومين إلى rashid-wep.vercel.app/king2)،
ثم ينشر. القيم لا تُطبع ولا تُرسل لأي جهة غير Vercel.

الاستخدام:  python tools/deploy_king2_platform.py
"""
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
FRONTEND = HERE / "models" / "king2 ai-Model" / "next-frontend"
ENV_FILE = FRONTEND / ".env"
PROJECT = "king2-platform"
PUBLIC_URL = "https://rashid-wep.vercel.app/king2"

# المتغيرات التي تذهب للإنتاج (نستبعد المحلية: HOST/PORT/MEMORY/KAGGLE/RASHID_*)
CLOUD_KEYS = {
    "NEXTAUTH_SECRET", "SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_KEY",
    "OPENROUTER_API_KEY", "GEMINI_API_KEY", "GROQ_API_KEY", "GROQ_MODEL", "ZAI_API_KEY",
    "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET",
    "AIKING_IDENTITY", "AIKING_VERSION", "KING", "NEXT_PUBLIC_APP_NAME",
}
# قيَم يفرضها الدومين الجديد (تتجاوز ما في .env)
DOMAIN_OVERRIDES = {
    "NEXTAUTH_URL": PUBLIC_URL,
    "NEXT_PUBLIC_APP_URL": PUBLIC_URL,
    "OAUTH_REDIRECT_BASE": PUBLIC_URL,
    "IMAGE_PROVIDER": "king2",
}


def sh(args, **kw):
    return subprocess.run(args, shell=True, text=True, cwd=str(FRONTEND), **kw)


def add_env(key: str, value: str):
    # حذف أي نسخة قديمة (يتجاهل الخطأ) ثم الإضافة عبر stdin
    sh(f'vercel env rm {key} production --yes', capture_output=True)
    r = sh(f'vercel env add {key} production', input=value + "\n", capture_output=True)
    ok = r.returncode == 0
    print(f"  {'✅' if ok else '❌'} {key}")
    return ok


def parse_env(path: Path) -> dict:
    out = {}
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def main():
    if not ENV_FILE.exists():
        print(f"❌ لم أجد {ENV_FILE}")
        sys.exit(1)
    env = parse_env(ENV_FILE)

    print(f"1) ربط/إنشاء مشروع Vercel: {PROJECT}")
    r = sh(f'vercel link --yes --project {PROJECT}', capture_output=True)
    print("  " + (r.stdout or r.stderr or "").strip().splitlines()[-1] if (r.stdout or r.stderr) else "")

    print("2) رفع متغيرات البيئة للإنتاج:")
    hf = os.environ.get("HF_TOKEN") or input("  ألصق HF_TOKEN (بصلاحية Inference Providers): ").strip()
    add_env("HF_TOKEN", hf)
    for k, v in DOMAIN_OVERRIDES.items():
        add_env(k, v)
    for k in CLOUD_KEYS:
        if env.get(k):
            add_env(k, env[k])
        else:
            print(f"  ⚠️ {k} غير موجود في .env — تجاوزته")

    print("3) نشر للإنتاج (قد يأخذ 1-3 دقائق للبناء)...")
    r = sh('vercel deploy --prod --yes')
    if r.returncode != 0:
        print("❌ فشل النشر — راجع المخرجات أعلاه.")
        sys.exit(1)
    print("\n✅ اكتمل. ارجع لكلود وقل «تم» ليربط الـ rewrite ويتحقق.")
    print("⚠️ مهم: حدّث روابط OAuth في Google/GitHub Console لتشمل:")
    print(f"   {PUBLIC_URL}/api/auth/callback/google")
    print(f"   {PUBLIC_URL}/api/auth/callback/github")


if __name__ == "__main__":
    main()
