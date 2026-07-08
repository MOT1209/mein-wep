---
base_model:
- stabilityai/stable-diffusion-xl-base-1.0
- madebyollin/sdxl-vae-fp16-fix
library_name: diffusers
pipeline_tag: text-to-image
license: openrail++
tags:
- diffusers
- stable-diffusion-xl
- sdxl
- lora
- text-to-image
- king2
- arabic
- art
- image-generation
- fal-ai
inference:
  parameters:
    guidance_scale: 7.5
    negative_prompt: blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature
widget:
- text: a futuristic royal palace at sunset, highly detailed, 8k, golden hour, epic composition
  output:
    url: https://huggingface.co/RASHID778/king2-image/resolve/main/examples/example_01.png
- text: majestic arabian knight on horseback, desert landscape, cinematic lighting, photorealistic, 4k
  output:
    url: https://huggingface.co/RASHID778/king2-image/resolve/main/examples/example_02.png
- text: ancient library with floating books, mystical atmosphere, volumetric lighting, detailed illustration
  output:
    url: https://huggingface.co/RASHID778/king2-image/resolve/main/examples/example_03.png
- text: cosmic king on a throne of stars, nebula background, majestic, epic fantasy, concept art
  output:
    url: https://huggingface.co/RASHID778/king2-image/resolve/main/examples/example_04.png
datasets:
- jackyhate/text-to-image-2M
language:
- en
- ar
thumbnail: https://huggingface.co/RASHID778/king2-image/resolve/main/examples/example_01.png
---

<p align="center">
  <img src="https://huggingface.co/RASHID778/king2-image/resolve/main/examples/example_01.png" alt="KING2 Image Banner" width="80%">
</p>

<h1 align="center">👑 KING2-IMAGE — SDXL LoRA</h1>

<p align="center">
  <strong>A curated Stable Diffusion XL LoRA (rank 16) fine-tuned for majestic, high-quality text-to-image generation with a distinctive aesthetic.</strong>
</p>

<p align="center">
  <a href="https://huggingface.co/RASHID778/king2-image"><img src="https://img.shields.io/badge/🤗%20Hugging%20Face-king2--image-FF6F00?style=flat-square" alt="Hugging Face"></a>
  <a href="https://huggingface.co/spaces/RASHID778/king2-qwen2.5-3b"><img src="https://img.shields.io/badge/🚀%20Spaces-Demo-00BFFF?style=flat-square" alt="Spaces"></a>
  <a href="https://huggingface.co/RASHID778/king2-image/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-OpenRAIL++-blue?style=flat-square" alt="License"></a>
  <a href="https://huggingface.co/models?other=king2"><img src="https://img.shields.io/badge/🏷️%20KING2-Series-8A2BE2?style=flat-square" alt="KING2 Series"></a>
</p>

---

## 📋 Overview

**KING2-IMAGE** is a **Stable Diffusion XL LoRA adapter** (rank 16) trained on a curated 3,000-image subset of the [jackyhate/text-to-image-2M](https://huggingface.co/datasets/jackyhate/text-to-image-2M) dataset. It is designed to produce visually striking, detailed, and aesthetically refined images — from majestic royal scenes and cinematic landscapes to fantasy art and photorealistic portraits.

Built as part of the **KING2 AI ecosystem**, this model inherits the "royal" essence of the KING2 brand, excelling at generating images with grandeur, rich color palettes, and epic compositions.

| Property | Value |
|----------|-------|
| **Base Model** | [`stabilityai/stable-diffusion-xl-base-1.0`](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0) |
| **VAE** | [`madebyollin/sdxl-vae-fp16-fix`](https://huggingface.co/madebyollin/sdxl-vae-fp16-fix) |
| **LoRA Rank** | 16 |
| **Resolution** | 768×768 |
| **Training Steps** | 1,500 |
| **Precision** | fp16 |
| **Library** | [🧨 Diffusers](https://github.com/huggingface/diffusers) |
| **License** | [OpenRAIL++](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md) |

---

## ✨ Features

- **🎨 Curated Aesthetic** — Fine-tuned on a hand-picked subset that emphasizes quality, composition, and visual appeal.
- **👑 Royal & Majestic Style** — Excels at grand, epic, and regal image generation — palaces, knights, kings, fantasy worlds.
- **🌍 Bilingual Prompt Support** — Works with both English and Arabic prompts (Arabic prompts may require transliteration or English for best results).
- **⚡ Lightweight Adapter** — Only ~93 MB LoRA weights; combines with the base SDXL model for a total footprint manageable on consumer GPUs.
- **🔥 Inference Provider Ready** — Deployable instantly via [fal-ai](https://fal.ai) (live) with zero setup.
- **🔄 Diffusers Native** — Drop-in compatible with the Hugging Face Diffusers ecosystem; easy to integrate into existing pipelines.

---

## 🏋️ Training Details

### Dataset

| Property | Detail |
|----------|--------|
| **Source** | [`jackyhate/text-to-image-2M`](https://huggingface.co/datasets/jackyhate/text-to-image-2M) |
| **Subset Size** | 3,000 images (curated, high-quality) |
| **Resolution** | 768×768 |
| **Format** | Image-Text pairs |

The training used a carefully curated subset of 3,000 image-text pairs from the larger text-to-image-2M dataset, selected to emphasize high visual quality, diverse scenes (nature, architecture, fantasy, portraits, landscapes), and compositional richness.

### Hyperparameters

| Parameter | Value |
|-----------|-------|
| **Base Model** | `stabilityai/stable-diffusion-xl-base-1.0` |
| **VAE** | `madebyollin/sdxl-vae-fp16-fix` |
| **LoRA Rank (r)** | 16 |
| **LoRA Alpha** | 16 |
| **Resolution** | 768 × 768 |
| **Optimizer** | AdamW (8-bit) |
| **Learning Rate** | 1e-4 |
| **LR Scheduler** | Cosine |
| **Training Steps** | 1,500 |
| **Batch Size** | 4 (per device) |
| **Gradient Accumulation** | 2 |
| **Mixed Precision** | fp16 |
| **Noise Offset** | 0.05 |
| **Checkpoints Saved** | Every 500 steps (checkpoint-500, checkpoint-1000, checkpoint-1500) |

### Checkpoints

| Checkpoint | Steps | Description |
|------------|-------|-------------|
| `checkpoint-500` | 500 | Early snapshot — good for broad compositional styles |
| `checkpoint-1000` | 1,000 | Mid-training — balanced detail and coherence |
| `checkpoint-1500` | **1,500 (final)** | Fully trained — recommended for best results |

---

## 📦 Installation

### Requirements

- Python ≥ 3.10
- PyTorch ≥ 2.0.0
- CUDA-compatible GPU with ≥ 8 GB VRAM (recommended)
- Hugging Face Diffusers, Transformers, Accelerate

### Setup

```bash
# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/macOS
# .\venv\Scripts\activate   # Windows

# Install dependencies
pip install -U diffusers transformers accelerate torch safetensors
```

---

## 🚀 Usage

### Basic Inference

```python
import torch
from diffusers import DiffusionPipeline

# Load the base SDXL pipeline
pipe = DiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True,
)
pipe.to("cuda")

# Load the KING2-IMAGE LoRA adapter
pipe.load_lora_weights("RASHID778/king2-image")

# Optional: Use the fp16 VAE for memory efficiency
pipe.vae = DiffusionPipeline.from_pretrained(
    "madebyollin/sdxl-vae-fp16-fix",
    torch_dtype=torch.float16,
).vae

# Generate
prompt = "a futuristic royal palace at sunset, highly detailed, 8k, golden hour"
image = pipe(
    prompt,
    num_inference_steps=30,
    guidance_scale=7.5,
    negative_prompt="blurry, low quality, distorted, ugly, bad anatomy, watermark, text",
).images[0]

image.save("king2_output.png")
```

### LoRA Weight Configuration

You can adjust the LoRA influence scale for finer control:

```python
pipe.load_lora_weights("RASHID778/king2-image", adapter_name="king2")
pipe.set_adapters(["king2"], adapter_weights=[0.85])  # scale from 0.0 to 1.0
```

### Using with diffusers `StableDiffusionXLPipeline` Directly

```python
from diffusers import StableDiffusionXLPipeline
import torch

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True,
).to("cuda")

pipe.load_lora_weights("RASHID778/king2-image")

prompt = "majestic arabian knight on horseback, desert dunes, cinematic lighting, photorealistic, 4k"
image = pipe(
    prompt,
    num_inference_steps=25,
    guidance_scale=7.0,
).images[0]

image.save("knight.png")
```

### Inference Providers (Zero Setup)

You can use this model directly without any local setup via **fal-ai**:

```python
# Using fal Python client (pip install fal)
import fal

result = fal.run(
    "fal-ai/sdxl-lora",
    arguments={
        "model_name": "stabilityai/stable-diffusion-xl-base-1.0",
        "lora_path": "https://huggingface.co/RASHID778/king2-image",
        "prompt": "cosmic king on a throne of stars, nebula background, majestic, epic fantasy",
        "negative_prompt": "blurry, low quality",
        "num_images": 1,
        "guidance_scale": 7.5,
        "num_inference_steps": 30,
    }
)
print(result["images"][0]["url"])
```

---

## 🎯 Example Prompts

Here are some prompts that work exceptionally well with KING2-IMAGE:

### Royal & Majestic

| Prompt | Style |
|--------|-------|
| `a futuristic royal palace at sunset, highly detailed, 8k, golden hour, epic composition` | Cinematic / Epic |
| `majestic arabian knight on horseback, desert landscape, cinematic lighting, photorealistic, 4k` | Photorealistic |
| `cosmic king on a throne of stars, nebula background, majestic, epic fantasy, concept art` | Fantasy Art |
| `ancient king with golden crown, ornate throne room, dramatic lighting, oil painting style` | Classical Art |

### Fantasy & Mystical

| Prompt | Style |
|--------|-------|
| `ancient library with floating books, mystical atmosphere, volumetric lighting, detailed illustration` | Illustrative |
| `enchanted forest with glowing crystals, magical blue and purple hues, fantasy landscape, detailed` | Fantasy |
| `dragon coiled around a crystal tower, stormy sky, epic scale, cinematic, 8k` | Epic Fantasy |

### Architecture & Scenery

| Prompt | Style |
|--------|-------|
| `grand mosque at night, illuminated, reflective pool, stars, ultra detailed, architectural photography` | Architectural |
| `oriental garden with water fountain, blooming flowers, warm sunlight, peaceful, highly detailed` | Scenic |
| `massive marble palace with golden domes, symmetrical composition, bright blue sky, majestic` | Symmetrical |

### Arabic / Middle Eastern Themes

| Prompt | Style |
|--------|-------|
| `arabian fortress at dawn, sandstorm clearing, golden light, cinematic wide shot` | Cinematic |
| `traditional arabian market alley, lanterns, warm colors, detailed architecture, bustling` | Detailed |

---

## 🖼️ Example Images

<p align="center">
  <img src="https://huggingface.co/RASHID778/king2-image/resolve/main/examples/example_01.png" alt="Example 1 — Futuristic royal palace at sunset" width="45%">
  <img src="https://huggingface.co/RASHID778/king2-image/resolve/main/examples/example_02.png" alt="Example 2 — Majestic arabian knight on horseback" width="45%">
</p>
<p align="center">
  <img src="https://huggingface.co/RASHID778/king2-image/resolve/main/examples/example_03.png" alt="Example 3 — Ancient library with floating books" width="45%">
  <img src="https://huggingface.co/RASHID778/king2-image/resolve/main/examples/example_04.png" alt="Example 4 — Cosmic king on a throne of stars" width="45%">
</p>

<p align="center"><em>Images generated with KING2-IMAGE using prompts from the example tables above.</em></p>

---

## ⚠️ Limitations

- **Resolution Constraint** — Trained at 768×768. Higher resolutions (>1024) may produce artifacts or quality degradation.
- **Domain Specificity** — Fine-tuned primarily for majestic, royal, and fantasy aesthetics. May not perform optimally on unrelated domains (e.g., modern tech, medical imagery, abstract minimalism).
- **Bias & Representation** — As with all generative models trained on web data, the model may reflect biases present in the training dataset. Use responsibly and critically evaluate outputs.
- **Arabic Prompts** — The model was trained primarily on English captions. Arabic prompts may produce less reliable results; transliteration to English is recommended.
- **Not a Checkpoint** — This is a LoRA adapter only. The base SDXL model must be loaded separately (requires ~12 GB VRAM for full pipeline).
- **Safety** — The model has not been fine-tuned for safety filtering. Always use appropriate NSFW/content filters in production deployments.

---

## 🔬 Technical Notes

- The adapter was trained using the Diffusers `train_text_to_image_lora_sdxl.py` script.
- All checkpoints use `.safetensors` format for secure and fast loading.
- Xet storage is used on Hugging Face for efficient large-file hosting.
- Available for live inference via the fal-ai Inference Provider on Hugging Face.

---

## 📜 License

This model is released under the **OpenRAIL++** license, which permits:

- ✅ **Use** — Free to use for both research and commercial purposes
- ✅ **Modification** — You may fine-tune, adapt, or modify the weights
- ✅ **Distribution** — You may share the weights and derivatives

**Conditions:**

- ❗ You must not use the model to generate illegal or harmful content
- ❗ You must include the same license when redistributing
- ❗ You must not use the model to violate any applicable laws

The base model `stabilityai/stable-diffusion-xl-base-1.0` is also released under [OpenRAIL++](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md).

---

## 🏛️ KING2 Ecosystem

KING2-IMAGE is part of the **KING2 AI Series**:

| Model | Type | Description |
|-------|------|-------------|
| [`king2-qwen2.5-3b`](https://huggingface.co/RASHID778/king2-qwen2.5-3b) | LLM (LoRA) | Arabic conversational AI assistant with royal persona |
| [`king2-image`](https://huggingface.co/RASHID778/king2-image) | SDXL LoRA | Text-to-image generation with majestic aesthetic |
| [KING2 Space](https://huggingface.co/spaces/RASHID778/king2-qwen2.5-3b) | Demo | Try the KING2 experience live |

---

## 🙏 Acknowledgements

- [Stability AI](https://stability.ai/) for the SDXL base model
- [@jackyhate](https://huggingface.co/jackyhate) for the text-to-image-2M dataset
- [@madebyollin](https://huggingface.co/madebyollin) for the fp16 VAE fix
- [Hugging Face](https://huggingface.co) for the Diffusers library and model hosting
- [fal-ai](https://fal.ai) for the inference provider integration

---

## 📬 Contact & Community

- **Author:** [RASHID778](https://huggingface.co/RASHID778)
- **GitHub:** [MOT1209](https://github.com/MOT1209)
- **Report Issues:** [Community Tab](https://huggingface.co/RASHID778/king2-image/discussions)

---

<p align="center">
  Made with 👑 by <strong>RASHID778</strong>
  <br>
  <sub>Part of the KING2 AI Series — Royal Intelligence</sub>
</p>
