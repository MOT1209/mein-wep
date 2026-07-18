# -*- coding: utf-8 -*-
"""Synthetic cartoon-stickman generator — the v2 supplement.

Addresses the #1 weakness of the HumanML3D set (single style: headless skeleton,
no color, no props, no scenes) by generating cartoon stickmen with a round head,
backgrounds, objects, emotions and multi-figure interactions, via SDXL-Turbo.

Runs on a GPU (Kaggle T4 / Colab). Outputs the SAME dataset structure as the
HumanML3D set so the two can simply be concatenated for a v2 mixed training:

  synthetic_dataset/
  ├── images/         1024x1024 RGB PNG
  ├── captions/       one .txt per image
  └── metadata.jsonl  file_name, caption, tags, quality_score, source

Target: ~4,000 accepted images (tune N_TARGET). Mix 10k HumanML3D + 4k synthetic
gives real pose diversity AND cartoon style/scene coverage.
"""
import json
import os
import random
from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path(os.environ.get("SYN_OUT", "/kaggle/working/synthetic_dataset"))
N_TARGET = int(os.environ.get("SYN_N", "4000"))
N_CANDIDATES = int(N_TARGET * 1.25)
GEN_RES = 512          # SDXL-Turbo native; upscaled to 1024 at pack time
BATCH = 8
random.seed(7)

STYLE = [
    "a cartoon stick figure with a round head",
    "a simple stickman drawing with a circular head",
    "a childlike stick figure doodle with a round head",
    "a clean vector stickman with a round head and stick limbs",
]
SINGLE = [
    "running", "jumping", "walking", "sitting on a chair", "waving hello", "dancing",
    "climbing a ladder", "riding a bicycle", "swimming", "punching", "kicking",
    "throwing a ball", "reading a book", "sleeping", "crying", "laughing",
    "clapping hands", "falling down", "flying like a superhero", "praying",
    "playing guitar", "playing basketball", "cooking", "painting on a canvas",
    "driving a car", "skateboarding", "surfing a wave", "skiing", "boxing",
    "doing yoga", "meditating", "thinking with hand on chin", "drinking coffee",
    "holding an umbrella", "holding a sword", "shooting a bow and arrow",
    "playing with a dog", "holding a balloon", "fishing", "gardening",
    "playing chess", "doing a handstand", "doing a cartwheel", "juggling balls",
    "climbing a mountain", "saluting", "texting on a phone",
]
MULTI = [
    "two stick figures shaking hands", "two stick figures fighting",
    "two stick figures hugging", "two stick figures high-fiving",
    "two stick figures racing each other", "two stick figures playing catch",
    "a group of stick figures forming a circle", "a team of stick figures playing soccer",
    "two stick figures dancing together", "a crowd of stick figures cheering",
]
EMOTION = [
    "happy expression", "sad expression", "angry expression", "surprised expression",
    "scared expression", "excited expression", "tired expression", "proud expression",
    "", "", "",
]
BG = [
    "on a plain white background", "in a park", "on a stage", "in a gym",
    "in a city street", "on a mountain", "at the beach", "in a classroom",
    "in space with stars", "underwater with bubbles", "in a kitchen",
]

ACTION_TAG = {
    "run": "running", "jump": "jumping", "walk": "walking", "kick": "kicking",
    "punch": "punching", "danc": "dancing", "sit": "sitting", "climb": "climbing",
    "swim": "swimming", "box": "boxing", "yoga": "yoga", "fight": "fighting",
}


def build_prompt():
    style = random.choice(STYLE)
    emo = random.choice(EMOTION)
    bg = random.choice(BG)
    if random.random() < 0.2:
        subject = random.choice(MULTI)
    else:
        subject = f"a stickman {random.choice(SINGLE)}"
    parts = [style, "of", subject]
    if emo:
        parts.append(f", {emo}")
    parts.append(f", {bg}")
    return " ".join(parts).replace(" , ", ", ")


def caption_of(prompt: str) -> str:
    c = prompt
    for s in STYLE:
        c = c.replace(s + " of ", "")
    return f"{c}, cartoon stick figure with a round head"


def tags_of(caption: str):
    t = ["stickman", "stick figure", "cartoon", "round head", "pose"]
    if "two " in caption or "group" in caption or "crowd" in caption or "team" in caption:
        t.append("multiple figures")
    for stem, tag in ACTION_TAG.items():
        if stem in caption:
            t.append(tag)
    return t[:12]


def quality_score(img: Image.Image) -> int:
    arr = np.asarray(img.convert("L"), dtype=np.float32)
    dark = float((arr < 128).mean())
    std = float(arr.std())
    if std < 8:
        return 1
    if dark < 0.005:
        return 2
    if dark > 0.55:
        return 3
    score = 10
    if not (0.01 <= dark <= 0.4):
        score -= 3
    if std < 30:
        score -= 2
    return max(1, min(10, score))


def main():
    import torch
    from diffusers import AutoPipelineForText2Image

    (OUT / "images").mkdir(parents=True, exist_ok=True)
    (OUT / "captions").mkdir(parents=True, exist_ok=True)

    pipe = AutoPipelineForText2Image.from_pretrained(
        "stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16"
    ).to("cuda")
    pipe.set_progress_bar_config(disable=True)

    prompts = [build_prompt() for _ in range(N_CANDIDATES)]
    meta = []
    kept = idx = 0
    while kept < N_TARGET and idx < len(prompts):
        batch = prompts[idx: idx + BATCH]
        idx += BATCH
        try:
            imgs = pipe(prompt=batch, num_inference_steps=2, guidance_scale=0.0,
                        height=GEN_RES, width=GEN_RES).images
        except Exception as e:
            print("batch failed:", e, flush=True)
            continue
        for img, prompt in zip(imgs, batch):
            if kept >= N_TARGET:
                break
            if quality_score(img) < 8:
                continue
            fn = f"syn_{kept:06d}.png"
            img.convert("RGB").resize((1024, 1024), Image.LANCZOS).save(OUT / "images" / fn)
            cap = caption_of(prompt)
            (OUT / "captions" / fn.replace(".png", ".txt")).write_text(cap, encoding="utf-8")
            meta.append({
                "file_name": f"images/{fn}", "caption": cap, "tags": tags_of(cap),
                "quality_score": 8, "source": "synthetic_sdxl_turbo",
            })
            kept += 1
        if kept and kept % 500 < BATCH:
            print(f"generated {kept}/{N_TARGET}", flush=True)

    with open(OUT / "metadata.jsonl", "w", encoding="utf-8") as f:
        for m in meta:
            f.write(json.dumps(m, ensure_ascii=False) + "\n")
    print(f"DONE: {kept} synthetic images -> {OUT}", flush=True)


if __name__ == "__main__":
    main()
