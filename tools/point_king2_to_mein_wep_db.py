# -*- coding: utf-8 -*-
"""تحويل king2-platform لاستخدام قاعدة بيانات "Mein WEP" النشطة بدل مشروع king2 النائم.

قاعدة Mein WEP (kcltollasghlvuoxvjqa) فيها بالفعل نفس بنية جداول king2
(users/accounts/sessions/verification_tokens/conversations/messages...)
وهي نشطة (ACTIVE_HEALTHY) — بعكس مشروع king2 الأصلي (ogafhmpzjwrwnyzhvgrf) النائم.

يحتاج SUPABASE_SERVICE_KEY من: supabase.com/dashboard → Mein WEP →
Project Settings → API → service_role key (سرّي، لا تشاركه).

الاستخدام:  python tools/point_king2_to_mein_wep_db.py
"""
import re
import subprocess
import sys

PROJECT = "king2-platform"
SUPABASE_URL = "https://kcltollasghlvuoxvjqa.supabase.co"
# مفتاح anon عام بالتصميم (ليس سرًا) — نفس القيمة من لوحة Mein WEP
SUPABASE_ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbHRvbGxhc2dobHZ1b3h2anFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODI5NDksImV4cCI6MjA5Njg1ODk0OX0."
    "w-op2d4THYCrKjql9t1j7BiBZM2krDEkw-vdOwFzXFE"
)


def sh(cmd_str, **kw):
    return subprocess.run(cmd_str, shell=True, text=True, capture_output=True, **kw)


def add_env(key: str, value: str) -> bool:
    sh(f'vercel env rm {key} production --yes')
    r = sh(f'vercel env add {key} production', input=value + "\n")
    ok = r.returncode == 0
    print(f"  {'✅' if ok else '❌'} {key}")
    return ok


def main():
    raw = input("ألصق SUPABASE_SERVICE_KEY لمشروع Mein WEP (service_role، سرّي): ")
    m = re.search(r"eyJ[\w.\-]+", raw)
    if not m:
        print("❌ لم أجد JWT صالحًا (يبدأ بـ eyJ) في المُدخل.")
        sys.exit(1)
    service_key = m.group(0)
    print(f"التقطت مفتاحًا طوله {len(service_key)} حرفًا.")

    print(f"\n1) ربط مشروع Vercel: {PROJECT}")
    r = sh(f'vercel link --yes --project {PROJECT}')
    if r.returncode != 0:
        print("❌ فشل الربط:\n" + (r.stdout or "") + (r.stderr or ""))
        sys.exit(1)

    print("2) تحديث متغيرات Supabase للإنتاج:")
    add_env("SUPABASE_URL", SUPABASE_URL)
    add_env("SUPABASE_ANON_KEY", SUPABASE_ANON_KEY)
    add_env("SUPABASE_SERVICE_KEY", service_key)

    print("3) إعادة النشر...")
    r = sh('vercel deploy --prod --yes')
    if r.returncode != 0:
        print("❌ فشل النشر:\n" + (r.stdout or "")[-2000:] + (r.stderr or "")[-2000:])
        sys.exit(1)
    print(r.stdout[-500:])
    print("\n✅ اكتمل. ارجع لكلود وقل «تم» ليعيد اختبار التسجيل والدخول وتوليد الصور.")


if __name__ == "__main__":
    main()
