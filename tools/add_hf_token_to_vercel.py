# -*- coding: utf-8 -*-
"""إضافة HF_TOKEN إلى مشروع KING2 على Vercel — يُشغَّل يدويًا مرة واحدة.

الاستخدام:  python tools/add_hf_token_to_vercel.py
يطلب التوكن، يتحقق من صلاحيته، ثم يضيفه لبيئة الإنتاج في alking-ai-king2-7777.
"""
import json
import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

PROJECT = "alking-ai-king2-7777"


def read_token() -> str:
    raw = input("ألصق توكن HuggingFace: ")
    m = re.search(r"hf_[A-Za-z0-9]+", raw)
    if not m:
        print("❌ لم أجد توكنًا يبدأ بـ hf_ في المُدخل.")
        sys.exit(1)
    return m.group(0)


def validate_token(token: str) -> str:
    req = urllib.request.Request(
        "https://huggingface.co/api/whoami-v2",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.load(resp).get("name", "?")


def main() -> None:
    token = read_token()
    print(f"التقطت توكنًا طوله {len(token)} حرفًا — جاري التحقق...")
    name = validate_token(token)
    print(f"✅ التوكن صالح — حساب HuggingFace: {name}")

    workdir = Path(tempfile.mkdtemp(prefix="king2_vercel_"))
    r = subprocess.run(
        ["vercel", "link", "--yes", "--project", PROJECT],
        cwd=workdir, capture_output=True, text=True, shell=True,
    )
    if r.returncode != 0:
        print("❌ فشل ربط المشروع:\n" + (r.stdout or "") + (r.stderr or ""))
        sys.exit(1)

    # حذف أي نسخة قديمة ثم الإضافة (يتجاهل الخطأ لو غير موجودة)
    subprocess.run(
        ["vercel", "env", "rm", "HF_TOKEN", "production", "--yes"],
        cwd=workdir, capture_output=True, text=True, shell=True,
    )
    r = subprocess.run(
        ["vercel", "env", "add", "HF_TOKEN", "production"],
        cwd=workdir, input=token, capture_output=True, text=True, shell=True,
    )
    out = (r.stdout or "") + (r.stderr or "")
    if r.returncode != 0:
        print("❌ فشلت الإضافة:\n" + out)
        sys.exit(1)
    print("✅ تم إضافة HF_TOKEN لبيئة الإنتاج.")
    print("الآن ارجع لكلود وقل «تم» ليعيد النشر ويتحقق.")


if __name__ == "__main__":
    main()
