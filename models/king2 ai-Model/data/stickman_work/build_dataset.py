# -*- coding: utf-8 -*-
"""KING2-IMAGE stickman dataset builder.

Phase A (scan): iterate parquet shards, pick the best frame per motion sequence,
quality-score it, hash it, caption it from HumanML3D texts.
Phase B (select): dedupe, filter, rank, standardize to 1024x1024 RGB PNG,
write dataset/{images,captions,metadata.jsonl,README.md} + report.json.
"""
import io
import json
import os
import re
import sys
import zipfile
from collections import defaultdict
from pathlib import Path

import numpy as np
import pyarrow.parquet as pq
from PIL import Image

WORK = Path(__file__).parent
CAND_DIR = WORK / "candidates"
DATASET = WORK / "dataset"
TARGET = 10_000
MIN_SCORE = 8

# ---------------------------------------------------------------- captions
_SUBJ_RE = re.compile(
    r"\b(?:a|the)\s+(?:man|woman|person|human|figure|guy|girl|boy|lady|male|female|character|individual|subject)\b",
    re.IGNORECASE,
)
_BARE_SUBJ_RE = re.compile(
    r"^(?:person|man|woman|human|figure|someone|somebody|he|she|it)\b", re.IGNORECASE
)
_STANDING_RE = re.compile(r"\b(?:standing|stand)\s+(?:person|man|woman|figure)\b", re.IGNORECASE)


def load_texts(zip_path: Path) -> dict:
    texts = {}
    with zipfile.ZipFile(zip_path) as z:
        for name in z.namelist():
            if not name.endswith(".txt"):
                continue
            sid = Path(name).stem
            raw = z.read(name).decode("utf-8", errors="replace")
            lines = [ln.split("#", 1)[0].strip() for ln in raw.splitlines() if ln.strip()]
            lines = [ln for ln in lines if 8 <= len(ln) <= 200]
            if lines:
                # shortest description is usually the cleanest
                texts[sid] = sorted(lines, key=len)[0]
    return texts


def to_stickman_caption(desc: str) -> str:
    c = desc.strip().rstrip(".").lower()
    c = _STANDING_RE.sub("standing stickman", c)
    c, n = _SUBJ_RE.subn("a stickman", c, count=1)
    if n == 0:
        if _BARE_SUBJ_RE.match(c):
            c = _BARE_SUBJ_RE.sub("a stickman", c, count=1)
        else:
            c = f"a stickman: {c}"
    # collapse any later subject mentions too
    c = _SUBJ_RE.sub("the stickman", c)
    c = re.sub(r"\s+", " ", c).strip()
    return f"{c}, simple black and white stick figure line drawing"


ACTION_WORDS = {
    "walk": "walking", "run": "running", "jump": "jumping", "kick": "kicking",
    "punch": "punching", "dance": "dancing", "sit": "sitting", "stand": "standing",
    "turn": "turning", "wave": "waving", "climb": "climbing", "throw": "throwing",
    "pick": "picking up", "crawl": "crawling", "squat": "squatting", "stretch": "stretching",
    "swim": "swimming", "balance": "balancing", "spin": "spinning", "bend": "bending",
    "crouch": "crouching", "hop": "hopping", "swing": "swinging", "lift": "lifting",
    "step": "stepping", "raise": "raising arms", "clap": "clapping", "fight": "fighting",
    "exercis": "exercising", "stumbl": "stumbling", "fall": "falling",
}


def make_tags(caption: str) -> list:
    tags = ["stickman", "stick figure", "pose", "line drawing", "minimal", "black and white"]
    for stem, tag in ACTION_WORDS.items():
        if stem in caption:
            tags.append(tag)
    return tags[:12]


# ---------------------------------------------------------------- image quality
def quality_score(arr: np.ndarray) -> int:
    """1-10 heuristic for a grayscale skeleton render on white background."""
    h, w = arr.shape
    dark = arr < 128
    ink = float(dark.mean())
    std = float(arr.std())
    if std < 8 or ink < 0.004:
        return 1  # blank
    if ink > 0.45:
        return 2  # noise / corrupted
    ys, xs = np.nonzero(dark)
    bh, bw = ys.max() - ys.min(), xs.max() - xs.min()
    bbox_frac = max(bh / h, bw / w)
    # clipped figure: ink touching image border
    border = dark[0, :].any() or dark[-1, :].any() or dark[:, 0].any() or dark[:, -1].any()
    score = 10
    if ink < 0.01:
        score -= 2          # figure too thin/tiny
    if bbox_frac < 0.30:
        score -= 3          # figure occupies too little of the frame
    elif bbox_frac < 0.45:
        score -= 1
    if border:
        score -= 3          # clipped at the edge
    if std < 25:
        score -= 2
    return max(1, min(10, score))


def dhash256(img: Image.Image) -> int:
    g = np.asarray(img.resize((17, 16), Image.LANCZOS).convert("L"), dtype=np.int16)
    bits = (g[:, 1:] > g[:, :-1]).flatten()
    return int.from_bytes(np.packbits(bits).tobytes(), "big")


def hamming(a: int, b: int) -> int:
    return bin(a ^ b).count("1")


# ---------------------------------------------------------------- phase A
def scan_shards(parquets, texts):
    CAND_DIR.mkdir(exist_ok=True)
    candidates = []
    seen_sids = set()
    stats = defaultdict(int)
    for pth in parquets:
        pf = pq.ParquetFile(pth)
        for batch in pf.iter_batches(batch_size=32):
            for row in batch.to_pylist():
                sid = row["sample_id"]
                stats["sequences"] += 1
                if sid in seen_sids:
                    stats["dup_sample_id"] += 1
                    continue
                seen_sids.add(sid)
                desc = texts.get(sid)
                if not desc:
                    stats["no_caption"] += 1
                    continue
                imgs = row["images"]
                n = len(imgs)
                stats["frames_total"] += n
                if n == 0:
                    continue
                # candidate frames at 30%/50%/70% of the motion (mid-action poses)
                idxs = sorted({int(n * f) for f in (0.3, 0.5, 0.7)} & set(range(n))) or [n // 2]
                best = None
                for i in idxs:
                    b = imgs[i]["bytes"] if isinstance(imgs[i], dict) else imgs[i]
                    try:
                        im = Image.open(io.BytesIO(b)).convert("L")
                    except Exception:
                        stats["corrupted"] += 1
                        continue
                    if im.size[0] < 512 or im.size[1] < 512:
                        stats["too_small"] += 1
                        continue
                    s = quality_score(np.asarray(im, dtype=np.uint8))
                    if best is None or s > best[0]:
                        best = (s, i, b, im)
                if best is None:
                    continue
                s, i, b, im = best
                stats["scored"] += 1
                if s < MIN_SCORE:
                    stats["low_quality"] += 1
                    continue
                fn = CAND_DIR / f"{sid}.png"
                fn.write_bytes(b)
                candidates.append({
                    "sample_id": sid, "frame": i, "score": s,
                    "hash": dhash256(im), "desc": desc,
                })
        print(f"  scanned {pth.name}: total candidates so far {len(candidates)}", flush=True)
    return candidates, stats


# ---------------------------------------------------------------- phase B
def dedupe(cands, threshold=12):
    """Near-duplicate removal via 256-bit dHash + 32-bit band LSH."""
    kept, removed = [], 0
    buckets = defaultdict(list)  # band -> [(hash, kept_index)]
    for c in sorted(cands, key=lambda c: -c["score"]):
        h = c["hash"]
        bands = [(j, (h >> (32 * j)) & 0xFFFFFFFF) for j in range(8)]
        dup = False
        checked = set()
        for j, band in bands:
            for h2, ki in buckets[(j, band)]:
                if ki in checked:
                    continue
                checked.add(ki)
                if hamming(h, h2) <= threshold:
                    dup = True
                    break
            if dup:
                break
        if dup:
            removed += 1
            continue
        ki = len(kept)
        kept.append(c)
        for j, band in bands:
            buckets[(j, band)].append((h, ki))
    return kept, removed


def build_final(kept):
    (DATASET / "images").mkdir(parents=True, exist_ok=True)
    (DATASET / "captions").mkdir(parents=True, exist_ok=True)
    final = kept[:TARGET]
    meta_lines = []
    for k, c in enumerate(final):
        fn = f"{k:06d}.png"
        im = Image.open(CAND_DIR / f"{c['sample_id']}.png").convert("RGB")
        if im.size != (1024, 1024):
            im = im.resize((1024, 1024), Image.LANCZOS)
        im.save(DATASET / "images" / fn, optimize=True)
        caption = to_stickman_caption(c["desc"])
        tags = make_tags(caption)
        (DATASET / "captions" / f"{k:06d}.txt").write_text(caption, encoding="utf-8")
        meta_lines.append(json.dumps({
            "file_name": f"images/{fn}", "caption": caption, "tags": tags,
            "quality_score": c["score"], "source": "humanml3d_stick_figures_5_frames",
            "sample_id": c["sample_id"], "frame_index": c["frame"],
        }, ensure_ascii=False))
        if (k + 1) % 1000 == 0:
            print(f"  wrote {k + 1}/{len(final)}", flush=True)
    (DATASET / "metadata.jsonl").write_text("\n".join(meta_lines) + "\n", encoding="utf-8")
    return final


def main():
    parquets = sorted((WORK / "raw5f" / "data").glob("*.parquet"))
    print(f"shards: {len(parquets)}")
    texts = load_texts(WORK / "texts" / "texts.zip")
    print(f"captions loaded: {len(texts)}")

    print("Phase A: scanning shards...")
    cands, stats = scan_shards(parquets, texts)
    print(f"candidates (score>={MIN_SCORE}): {len(cands)}")

    print("Phase B: dedupe...")
    kept, ndup = dedupe(cands)
    stats["near_duplicates_removed"] = ndup
    print(f"after dedupe: {len(kept)}")

    if len(kept) < TARGET:
        print(f"WARNING: only {len(kept)} < {TARGET}")
    final = build_final(kept)
    stats["final"] = len(final)

    report = dict(stats)
    report["candidates_scored_ge8"] = len(cands)
    (WORK / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    print("DONE")


if __name__ == "__main__":
    main()
