# KING2-IMAGE — Stickman Adapter

**Repo:** `RASHID778/king2-image` · **Path:** `stickman/pytorch_lora_weights.safetensors`
**Base:** `stabilityai/stable-diffusion-xl-base-1.0` · **Type:** LoRA (rank 16)

A style/pose adapter that makes SDXL draw **stick-figure illustrations** in a wide
range of human poses and actions.

## Training data
- **Dataset:** `RASHID778/king2-stickman-dataset` — 10,000 curated 1024×1024 RGB PNGs.
- **Source:** best mid-action frame of each HumanML3D motion sequence
  (`Deepthought42424/humanml3d_stick_figures_5_frames`), quality-scored (kept ≥ 8/10),
  near-duplicate-filtered (256-bit dHash), captioned from the official HumanML3D texts.
- Every image is a single figure, thick-stroke skeleton on white background.

## Recommended inference
```python
from diffusers import DiffusionPipeline
import torch

pipe = DiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16
).to("cuda")
pipe.load_lora_weights(
    "RASHID778/king2-image",
    weight_name="stickman/pytorch_lora_weights.safetensors",
)

image = pipe(
    "a stickman doing a backflip, simple black and white stick figure line drawing",
    num_inference_steps=30, guidance_scale=7.0,
).images[0]
```

## Prompting tips
- Keep the trigger phrasing the model saw in training:
  `… , simple black and white stick figure line drawing`.
- Best at: **single-figure body poses/actions** (run, jump, kick, sit, climb, dance…).
- LoRA scale **0.8–1.0**. Lower it toward 0.6 if the pose collapses.
- Guidance 6–8, 25–35 steps.

## Known limitations
- **One visual style** — no head circle, no color, no props, no backgrounds.
- **Single figure** — multi-figure scenes (two stickmen fighting) are out of distribution.
- To broaden style/scene coverage, train a **v2** mixing this set with the synthetic
  cartoon-stickman set (see `gen_synthetic_stickman.py`) — round head, backgrounds,
  objects, and 2-figure interactions.

## License
Derived from HumanML3D (AMASS/HumanAct12). Treat as **research use**; review upstream
licensing before commercial deployment.
