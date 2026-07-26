# -*- coding: utf-8 -*-
"""اختبار توليد صورة فعلية بموديل KING2-IMAGE — نفس الاستدعاء الذي يعمله الموقع.

الاستخدام:  python tools/verify_king2_image.py
يطلب التوكن (محليًا فقط)، يجرب مزوّدات HF بالترتيب نفسه، ويحفظ الصورة الناتجة
في king2_verify_output.png ليراها المستخدم.
"""
import base64
import json
import re
import sys
import urllib.request

MODEL = "RASHID778/king2-image"
LORA_URL = f"https://huggingface.co/{MODEL}/resolve/main/pytorch_lora_weights.safetensors"
PROMPT = "a futuristic royal palace at sunset, highly detailed, 8k, cinematic"
OUT = "king2_verify_output.png"


def read_token() -> str:
    raw = input("ألصق توكن HuggingFace (نفس اللي في Vercel): ")
    m = re.search(r"hf_[A-Za-z0-9]+", raw)
    if not m:
        print("❌ لم أجد توكنًا يبدأ بـ hf_")
        sys.exit(1)
    return m.group(0)


def post(url: str, token: str, payload: dict, timeout: int = 60):
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read(), r.headers.get("content-type", "")
    except urllib.error.HTTPError as e:
        return e.code, e.read(), ""
    except Exception as e:
        return 0, str(e).encode(), ""


def save_image(data: bytes) -> None:
    with open(OUT, "wb") as f:
        f.write(data)
    print(f"✅✅ نجح! الصورة محفوظة في: {OUT} ({len(data):,} bytes)")
    print("افتحها لتشاهد إنتاج موديلك KING2-IMAGE 🎨")


def main() -> None:
    token = read_token()
    print("جاري التوليد بموديلك... (قد يأخذ 20-40 ثانية أول مرة)\n")

    # 1) OpenAI-compatible images endpoint (provider-agnostic)
    print("[1/2] تجربة router /v1/images/generations ...")
    st, body, _ = post(
        "https://router.huggingface.co/v1/images/generations",
        token,
        {"model": MODEL, "prompt": PROMPT, "response_format": "b64_json"},
    )
    if st == 200:
        try:
            d = json.loads(body)
            b64 = d.get("data", [{}])[0].get("b64_json")
            if b64:
                save_image(base64.b64decode(b64))
                return
        except Exception:
            pass
    print(f"    ← ما نجح (HTTP {st}): {body[:200].decode(errors='replace')}\n")

    # 2) fal-ai مباشرة مع الـ LoRA
    print("[2/2] تجربة fal-ai/fast-sdxl + LoRA مباشرة ...")
    st, body, _ = post(
        "https://router.huggingface.co/fal-ai/fal-ai/fast-sdxl",
        token,
        {
            "prompt": PROMPT,
            "loras": [{"path": LORA_URL, "scale": 1}],
            "image_size": "square_hd",
            "num_inference_steps": 28,
            "guidance_scale": 7,
            "sync_mode": True,
        },
    )
    if st == 200:
        try:
            d = json.loads(body)
            url = d.get("images", [{}])[0].get("url")
            if url:
                if url.startswith("data:"):
                    save_image(base64.b64decode(url.split(",", 1)[1]))
                else:
                    with urllib.request.urlopen(url, timeout=60) as r:
                        save_image(r.read())
                return
        except Exception as e:
            print("    parse error:", e)
    print(f"    ← ما نجح (HTTP {st}): {body[:300].decode(errors='replace')}\n")

    print("❌ لم ينجح أي مزوّد. الأسباب المحتملة:")
    print("  - التوكن يفتقد صلاحية 'Make calls to Inference Providers' (أنشئ توكن نوع Read).")
    print("  - نفد رصيد Inference المجاني الشهري في حسابك.")
    print("  في كلتا الحالتين: الموقع يرجع تلقائيًا لـ Pollinations فلا يتعطل.")
    sys.exit(1)


if __name__ == "__main__":
    main()
