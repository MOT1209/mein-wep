# KING2-IMAGE — free ZeroGPU Space hosting the trained SDXL stickman LoRA.
import random

import gradio as gr
import spaces
import torch
from diffusers import DiffusionPipeline

BASE = "stabilityai/stable-diffusion-xl-base-1.0"
REPO = "RASHID778/king2-image"
STICKMAN_SUFFIX = ", simple black and white stick figure line drawing"
MAX_SEED = 2**31 - 1

pipe = DiffusionPipeline.from_pretrained(BASE, torch_dtype=torch.float16, use_safetensors=True)
pipe.load_lora_weights(
    REPO, weight_name="stickman/pytorch_lora_weights.safetensors", adapter_name="stickman"
)
pipe.to("cuda")


@spaces.GPU(duration=75)
def generate(prompt, lora_scale=0.6, steps=25, guidance=8.0, seed=-1):
    """Generate one stickman image. lora_scale ~0.6 avoids the line-texture collapse."""
    if not prompt or not prompt.strip():
        raise gr.Error("النص مطلوب")
    if seed is None or int(seed) < 0:
        seed = random.randint(0, MAX_SEED)
    pipe.set_adapters(["stickman"], adapter_weights=[float(lora_scale)])
    generator = torch.Generator("cuda").manual_seed(int(seed))
    image = pipe(
        prompt.strip() + STICKMAN_SUFFIX,
        num_inference_steps=int(steps),
        guidance_scale=float(guidance),
        height=768,
        width=768,
        generator=generator,
    ).images[0]
    return image


demo = gr.Interface(
    fn=generate,
    inputs=[
        gr.Text(label="prompt", placeholder="a stickman running"),
        gr.Slider(0.0, 1.5, value=0.6, step=0.05, label="lora_scale"),
        gr.Slider(1, 50, value=25, step=1, label="steps"),
        gr.Slider(0.0, 15.0, value=8.0, step=0.5, label="guidance"),
        gr.Number(value=-1, label="seed (-1 = random)"),
    ],
    outputs=gr.Image(type="pil", label="image", format="png"),
    title="KING2-IMAGE — Stickman",
    description="Trained SDXL LoRA (RASHID778/king2-image, stickman adapter).",
    api_name="generate",
)

if __name__ == "__main__":
    demo.queue(max_size=20).launch()
