# -*- coding: utf-8 -*-
"""رفع توكن HuggingFace كداتاست خاص على Kaggle — يُشغَّل يدويًا مرة واحدة.

الاستخدام:  python tools/upload_hf_token_to_kaggle.py
يطلب التوكن بإدخال مخفي، يتحقق من صلاحيته، ثم ينشئ داتاست خاصًا
alking77/king2-secrets يقرأه نوتبوك التدريب من /kaggle/input/king2-secrets/hf_token.txt
"""
import json
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

DATASET_ID = "alking77/king2-secrets"


def validate_token(token: str) -> str:
    req = urllib.request.Request(
        "https://huggingface.co/api/whoami-v2",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        info = json.load(resp)
    role = (info.get("auth") or {}).get("accessToken", {}).get("role", "")
    name = info.get("name", "?")
    if role not in ("write", "fineGrained"):
        print(f"⚠️ التوكن صالح (حساب: {name}) لكن صلاحيته '{role}' وليست Write — الرفع سيفشل.")
        sys.exit(1)
    return name


def read_token() -> str:
    raw = input("ألصق توكن HuggingFace (بصلاحية Write): ")
    # استخراج التوكن حتى لو لُصق معه نص إضافي من الحافظة
    m = re.search(r"hf_[A-Za-z0-9]+", raw)
    if not m:
        print("❌ لم أجد توكنًا يبدأ بـ hf_ في المُدخل. انسخ التوكن وحده وأعد المحاولة.")
        sys.exit(1)
    return m.group(0)


def main() -> None:
    token = read_token()
    print(f"التقطت توكنًا طوله {len(token)} حرفًا — جاري التحقق...")

    name = validate_token(token)
    print(f"✅ التوكن صالح — حساب HuggingFace: {name}")

    workdir = Path(tempfile.mkdtemp(prefix="king2_secret_"))
    try:
        (workdir / "hf_token.txt").write_text(token, encoding="ascii")
        (workdir / "dataset-metadata.json").write_text(
            json.dumps(
                {
                    "id": DATASET_ID,
                    "title": "king2-secrets",
                    "licenses": [{"name": "unknown"}],
                }
            ),
            encoding="utf-8",
        )
        # CLI 2.2+: الإنشاء خاص افتراضيًا (لا يوجد --private، و -u تجعله عامًا)
        r = subprocess.run(
            ["kaggle", "datasets", "create", "-p", str(workdir)],
            capture_output=True, text=True,
        )
        out = (r.stdout or "") + (r.stderr or "")
        if r.returncode != 0 or "already exists" in out.lower() or "409" in out:
            print("الداتاست موجود مسبقًا — أرفع نسخة جديدة...")
            r = subprocess.run(
                ["kaggle", "datasets", "version", "-p", str(workdir),
                 "-m", "rotate hf token"],
                capture_output=True, text=True,
            )
            out = (r.stdout or "") + (r.stderr or "")
        if r.returncode != 0:
            print("❌ فشل رفع الداتاست:\n" + out)
            sys.exit(1)
        print(f"✅ تم: https://www.kaggle.com/datasets/{DATASET_ID} (خاص)")
        print("الآن ارجع لكلود وقل «تم» ليُطلق التدريب.")
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


if __name__ == "__main__":
    main()
