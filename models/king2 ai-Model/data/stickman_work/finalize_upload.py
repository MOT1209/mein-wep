# -*- coding: utf-8 -*-
"""Run when the Kaggle training kernel COMPLETEs.

1. Download kernel output.
2. Verify pytorch_lora_weights.safetensors exists and is non-trivial.
3. Upload it to RASHID778/king2-image under stickman/.
4. Save the two smoke-test PNGs the kernel produced (if present) for review.

Usage:  python finalize_upload.py
"""
import json
import os
import sys
from pathlib import Path

from huggingface_hub import HfApi

WORK = Path(__file__).parent
OUT = WORK / "kernel_final"
KERNEL = "alking77/king2-stickman-lora-train"
MODEL_REPO = "RASHID778/king2-image"
DATASET_REPO = "RASHID778/king2-stickman-dataset"


def sh(cmd: str) -> int:
    print(">>", cmd, flush=True)
    return os.system(cmd)


def main():
    OUT.mkdir(exist_ok=True)
    # 1. download output (retry — Kaggle SSL is flaky)
    for _ in range(5):
        rc = sh(f'kaggle kernels output {KERNEL} -p "{OUT}"')
        if rc == 0:
            break
    weights = OUT / "pytorch_lora_weights.safetensors"
    if not weights.exists():
        # sometimes nested under king2-stickman-lora/
        cand = list(OUT.rglob("pytorch_lora_weights.safetensors"))
        if cand:
            weights = cand[0]
    assert weights.exists(), f"NO WEIGHTS in {OUT} — training may not have finished"
    size_mb = weights.stat().st_size / 1e6
    assert size_mb > 1, f"weights suspiciously small: {size_mb:.2f} MB"
    print(f"OK weights: {weights} ({size_mb:.1f} MB)")

    tests = sorted(OUT.rglob("stickman_test_*.png"))
    print(f"smoke-test images: {[str(t) for t in tests]}")

    # 2. upload to HF under stickman/
    api = HfApi()
    api.upload_file(
        path_or_fileobj=str(weights),
        path_in_repo="stickman/pytorch_lora_weights.safetensors",
        repo_id=MODEL_REPO, repo_type="model",
        commit_message="Add stickman LoRA adapter (10k HumanML3D stick-figure dataset)",
    )
    print(f"UPLOADED -> https://huggingface.co/{MODEL_REPO}/tree/main/stickman")

    # 3. append usage to model card
    card = f'''

## \U0001f574️ Stickman adapter

A second LoRA in this repo (`stickman/`), trained on a curated 10,000-image
stick-figure dataset (`{DATASET_REPO}`) derived from HumanML3D motion sequences,
for stick-figure poses and actions.

```python
from diffusers import DiffusionPipeline
import torch

pipe = DiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16
).to("cuda")
pipe.load_lora_weights("{MODEL_REPO}", weight_name="stickman/pytorch_lora_weights.safetensors")

image = pipe(
    "a stickman running, simple black and white stick figure line drawing",
    num_inference_steps=30, guidance_scale=7.0,
).images[0]
```
'''
    (OUT / "README_STICKMAN_APPEND.md").write_text(card, encoding="utf-8")
    print("wrote README_STICKMAN_APPEND.md (append to repo README manually or via next step)")
    print("DONE")


if __name__ == "__main__":
    sys.exit(main())
