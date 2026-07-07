# KING2-IMAGE stickman SDXL LoRA training — Kaggle script kernel
# Dataset: alking77/king2-stickman-dataset (10,000 x 1024 PNG + captions)
import json
import os
import subprocess
import zipfile
from pathlib import Path

WORK = Path('/kaggle/working')


def run(cmd):
    print('>>', cmd, flush=True)
    r = subprocess.run(cmd, shell=True)
    if r.returncode != 0:
        raise SystemExit(f'STEP_FAILED ({r.returncode}): {cmd}')


# ---------------------------------------------------------------- installs
run('pip install -q git+https://github.com/huggingface/diffusers')
run('pip install -qU accelerate transformers peft bitsandbytes datasets huggingface_hub Pillow numpy')
run('pip uninstall -y wandb torchao -q')
run('wget -q https://raw.githubusercontent.com/huggingface/diffusers/main/examples/text_to_image/train_text_to_image_lora_sdxl.py -O train_text_to_image_lora_sdxl.py')
run("sed -i 's/is_wandb_available()/False/g' train_text_to_image_lora_sdxl.py")
run("sed -i 's/log_with=args.report_to/log_with=None/g' train_text_to_image_lora_sdxl.py")
print('INSTALL_OK', flush=True)

# ---------------------------------------------------------------- dataset
INPUT = Path('/kaggle/input')
print('input mounts:', [str(p) for p in INPUT.glob('*')], flush=True)
for p in sorted(INPUT.glob('*/*'))[:30]:
    print('  ', p, flush=True)

data_root = None
metas = sorted(INPUT.rglob('metadata.jsonl'))
if metas:
    data_root = metas[0].parent            # Kaggle auto-unzipped layout
else:
    zips = sorted(INPUT.rglob('*.zip'))
    assert zips, f'NO_DATASET_FOUND under {INPUT}'
    extract = WORK / 'extract'
    with zipfile.ZipFile(zips[0]) as z:
        z.extractall(extract)
    metas = sorted(extract.rglob('metadata.jsonl'))
    assert metas, 'NO_METADATA_IN_ZIP'
    data_root = metas[0].parent
assert (data_root / 'images').is_dir(), f'NO_IMAGES_DIR in {data_root}'
print('data_root:', data_root, flush=True)

# flat imagefolder layout in /kaggle/working: symlinked images + metadata.jsonl
train_dir = WORK / 'train_data'
train_dir.mkdir(exist_ok=True)
n = 0
with open(data_root / 'metadata.jsonl', encoding='utf-8') as fin, \
     open(train_dir / 'metadata.jsonl', 'w', encoding='utf-8') as fout:
    for line in fin:
        m = json.loads(line)
        base = os.path.basename(m['file_name'])
        src = data_root / 'images' / base
        dst = train_dir / base
        if not dst.exists():
            os.symlink(src, dst)
        fout.write(json.dumps({'file_name': base, 'caption': m['caption']},
                              ensure_ascii=False) + '\n')
        n += 1
assert n >= 10000, f'DATASET_INCOMPLETE: {n}'
print('DATASET_OK images:', n, flush=True)

# ---------------------------------------------------------------- accelerate
os.environ['CUDA_VISIBLE_DEVICES'] = '0'
from accelerate.utils import write_basic_config
write_basic_config(mixed_precision='fp16')

# ---------------------------------------------------------------- train
run(
    'accelerate launch train_text_to_image_lora_sdxl.py'
    ' --pretrained_model_name_or_path=stabilityai/stable-diffusion-xl-base-1.0'
    ' --pretrained_vae_model_name_or_path=madebyollin/sdxl-vae-fp16-fix'
    f' --train_data_dir={train_dir}'
    ' --caption_column=caption'
    ' --resolution=768 --center_crop --random_flip'
    ' --train_batch_size=1'
    ' --gradient_accumulation_steps=4'
    ' --gradient_checkpointing'
    ' --use_8bit_adam'
    ' --mixed_precision=fp16'
    ' --max_train_steps=3500'
    ' --learning_rate=1e-4'
    ' --lr_scheduler=cosine --lr_warmup_steps=0'
    ' --rank=16'
    ' --snr_gamma=5.0'
    ' --checkpointing_steps=1000 --checkpoints_total_limit=2'
    ' --seed=42'
    ' --output_dir=/kaggle/working/king2-stickman-lora'
)

weights = WORK / 'king2-stickman-lora' / 'pytorch_lora_weights.safetensors'
assert weights.exists(), 'TRAIN_FAILED: no weights file'
print('TRAIN_OK', weights.stat().st_size, 'bytes', flush=True)

# ---------------------------------------------------------------- smoke test
try:
    import torch
    from diffusers import DiffusionPipeline
    pipe = DiffusionPipeline.from_pretrained(
        'stabilityai/stable-diffusion-xl-base-1.0', torch_dtype=torch.float16
    ).to('cuda')
    pipe.load_lora_weights(str(weights.parent), weight_name=weights.name)
    for i, prompt in enumerate([
        'a stickman running, simple black and white stick figure line drawing',
        'a stickman doing a handstand, simple black and white stick figure line drawing',
    ]):
        img = pipe(prompt, num_inference_steps=30, guidance_scale=7.0).images[0]
        img.save(WORK / f'stickman_test_{i}.png')
    print('SMOKE_TEST_OK', flush=True)
except Exception as e:
    print('SMOKE_TEST_SKIPPED:', e, flush=True)

# keep output folder small for `kaggle kernels output`
import shutil
for cp in (WORK / 'king2-stickman-lora').glob('checkpoint-*'):
    shutil.rmtree(cp, ignore_errors=True)
shutil.rmtree(extract, ignore_errors=True)
print('ALL_DONE', flush=True)
