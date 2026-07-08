# -*- coding: utf-8 -*-
"""Try the uploaded stickman LoRA via the exact path the platform uses
(HF router -> fal-ai fast-sdxl with the stickman adapter weight)."""
import base64
import json
import urllib.request
from pathlib import Path

from huggingface_hub import get_token

TOKEN = get_token()
LORA = "https://huggingface.co/RASHID778/king2-image/resolve/main/stickman/pytorch_lora_weights.safetensors"
OUT = Path(__file__).parent / "try_out"
OUT.mkdir(exist_ok=True)

PROMPTS = [
    "a stickman running, simple black and white stick figure line drawing",
    "a stickman doing yoga, simple black and white stick figure line drawing",
    "a stickman kicking a ball, simple black and white stick figure line drawing",
]


def gen(prompt: str):
    body = json.dumps({
        "prompt": prompt,
        "loras": [{"path": LORA, "scale": 1}],
        "image_size": "square_hd",
        "num_inference_steps": 28,
        "guidance_scale": 7,
        "sync_mode": True,
    }).encode()
    req = urllib.request.Request(
        "https://router.huggingface.co/fal-ai/fal-ai/fast-sdxl",
        data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"},
    )
    with urllib.request.urlopen(req, timeout=90) as r:
        data = json.load(r)
    url = data["images"][0]["url"]
    if url.startswith("data:"):
        b64 = url.split(",", 1)[1]
        return base64.b64decode(b64)
    with urllib.request.urlopen(url, timeout=60) as ir:
        return ir.read()


for i, p in enumerate(PROMPTS):
    try:
        img = gen(p)
        fn = OUT / f"try_{i}.png"
        fn.write_bytes(img)
        print(f"OK  {fn}  ({len(img)} bytes)  <- {p}", flush=True)
    except Exception as e:
        print(f"FAIL [{p}]: {type(e).__name__}: {str(e)[:200]}", flush=True)
print("DONE")
