# KING2 Stickman Dataset — 10,000 images

Curated dataset of **exactly 10,000** stick-figure pose images with English captions,
built for training the **KING2-IMAGE** SDXL LoRA (`RASHID778/king2-image`, `stickman/` adapter).

## Sources

| Source | Contribution |
|---|---|
| [Deepthought42424/humanml3d_stick_figures_5_frames](https://huggingface.co/datasets/Deepthought42424/humanml3d_stick_figures_5_frames) | 29,228 motion sequences (832,864 frames scanned) — primary image source |
| [hassanjbara/humanml3d_stick_figures](https://huggingface.co/datasets/hassanjbara/humanml3d_stick_figures) | 21 sequences (subset of the same corpus, deduplicated by sample_id) |
| [HumanML3D texts](https://github.com/EricGuo5513/HumanML3D) | official motion descriptions used as captions (keyed by sample_id) |

A wider search of Hugging Face, Kaggle and GitHub (keywords: stickman, stick figure,
line drawing, skeleton drawing, stickman pose/action…) found **no other public dataset**
of comparable scale and usable licensing.

## Pipeline

1. **Frame selection** — for every motion sequence, 3 candidate frames at 30/50/70% of
   the motion were decoded and the highest-scoring mid-action pose kept (1 image per
   sequence, maximizing pose diversity).
2. **Quality scoring (1–10)** — heuristic on ink ratio, contrast (std), figure bounding-box
   coverage and edge clipping. Only images with **score ≥ 8** were kept.
3. **Deduplication** — exact + near-duplicate removal via 256-bit dHash with 32-bit-band
   LSH (Hamming ≤ 12): **5,936 near-duplicates removed** (23,292 unique remained).
4. **Standardization** — every image converted to **1024×1024, RGB, PNG** (source frames
   are square 512×512 renders; LANCZOS upscale — lossless in practice for line art).
5. **Captioning** — the official HumanML3D text for each motion, rewritten to stickman
   phrasing (e.g. *"a person is taking a picture"* → *"a stickman is taking a picture,
   simple black and white stick figure line drawing"*), plus derived action tags.
6. **Final selection** — top 10,000 by quality score.

## Structure

```
dataset/
├── images/          10,000 × 1024×1024 RGB PNG (000000.png … 009999.png)
├── captions/        one .txt caption per image (same basename)
├── metadata.jsonl   file_name, caption, tags, quality_score, source, sample_id, frame_index
└── README.md
```

## metadata.jsonl example

```json
{"file_name": "images/000000.png", "caption": "a stickman walking in a strong manner, simple black and white stick figure line drawing", "tags": ["stickman", "stick figure", "pose", "line drawing", "minimal", "black and white", "walking"], "quality_score": 10, "source": "humanml3d_stick_figures_5_frames", "sample_id": "...", "frame_index": 12}
```

## Known limitations

- **Single visual style**: all images are thick-stroke skeleton renders on white —
  no head circle, no colors, no backgrounds, no objects. For a general-purpose
  stickman model, mix with synthetic cartoon-style stickman images
  (see `king2_stickman_pipeline.ipynb` SDXL-Turbo generator).
- **Single figure per image**: HumanML3D motions are single-person; no multi-figure scenes.
- **License**: HumanML3D derives from AMASS/HumanAct12, which carry academic/research
  licenses. The upstream HF datasets declare no explicit license. Treat this dataset as
  **research use**; review licensing before commercial deployment.
