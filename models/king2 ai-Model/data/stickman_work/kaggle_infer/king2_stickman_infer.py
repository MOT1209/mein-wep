# KING2 stickman LoRA v1 — scale sweep test on Kaggle T4.
# Tests whether lowering the LoRA scale fixes v1's line-texture collapse,
# WITHOUT any retraining. Renders the prompts that failed at scale 1.0,
# each at scales 0.5 / 0.6 / 0.7, as a comparison grid.
import subprocess
from pathlib import Path

WORK = Path("/kaggle/working")


def run(cmd):
    print(">>", cmd, flush=True)
    if subprocess.run(cmd, shell=True).returncode != 0:
        raise SystemExit(f"FAILED: {cmd}")


run("pip install -q git+https://github.com/huggingface/diffusers")
run("pip install -qU transformers peft accelerate safetensors")
run("pip uninstall -y torchao -q")   # peft rejects Kaggle's old torchao
print("INSTALL_OK", flush=True)

import torch
from diffusers import DiffusionPipeline
from PIL import Image

pipe = DiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16
).to("cuda")
pipe.load_lora_weights(
    "RASHID778/king2-image",
    weight_name="stickman/pytorch_lora_weights.safetensors",
    adapter_name="stk",
)
pipe.set_progress_bar_config(disable=True)
print("MODEL_OK", flush=True)

# the 4 prompts that collapsed at scale 1.0
PROMPTS = [
    "a stickman sitting on a chair",
    "a stickman doing yoga",
    "a stickman kicking a ball",
    "a stickman doing a handstand",
]
SCALES = [0.5, 0.6, 0.7]
SUFFIX = ", simple black and white stick figure line drawing"

rows = []
for pi, p in enumerate(PROMPTS):
    row = []
    for s in SCALES:
        pipe.set_adapters(["stk"], adapter_weights=[s])
        g = torch.Generator("cuda").manual_seed(42)
        img = pipe(p + SUFFIX, num_inference_steps=25, guidance_scale=8.0,
                   height=640, width=640, generator=g).images[0]
        img.save(WORK / f"p{pi}_s{int(s*100)}.png")
        row.append(img)
        print(f"gen '{p}' @ scale {s}", flush=True)
    rows.append(row)

# grid: rows = prompts, cols = scales (0.5/0.6/0.7)
cell = 640
grid = Image.new("RGB", (cell * len(SCALES), cell * len(PROMPTS)), "white")
for r, row in enumerate(rows):
    for c, im in enumerate(row):
        grid.paste(im, (c * cell, r * cell))
grid.save(WORK / "scale_sweep_grid.png")
print("GRID_OK (cols: scale 0.5 | 0.6 | 0.7)", flush=True)
print("ALL_DONE", flush=True)
