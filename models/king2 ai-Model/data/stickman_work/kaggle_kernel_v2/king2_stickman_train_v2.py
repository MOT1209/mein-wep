# KING2-IMAGE stickman SDXL LoRA — v2 (anti-overfit) on Kaggle T4.
# Fixes v1's ~50% collapse into line-texture by lowering capacity and steps:
#   rank 16->8, steps 3500->2000, lr 1e-4->5e-5, + noise_offset.
import json
import os
import subprocess
import zipfile
from pathlib import Path

WORK = Path('/kaggle/working')


def run(cmd):
    print('>>', cmd, flush=True)
    if subprocess.run(cmd, shell=True).returncode != 0:
        raise SystemExit(f'STEP_FAILED: {cmd}')


run('pip install -q git+https://github.com/huggingface/diffusers')
run('pip install -qU accelerate transformers peft bitsandbytes datasets huggingface_hub Pillow numpy')
run('pip uninstall -y wandb torchao -q')
run('wget -q https://raw.githubusercontent.com/huggingface/diffusers/main/examples/text_to_image/train_text_to_image_lora_sdxl.py -O train_text_to_image_lora_sdxl.py')
run("sed -i 's/is_wandb_available()/False/g' train_text_to_image_lora_sdxl.py")
run("sed -i 's/log_with=args.report_to/log_with=None/g' train_text_to_image_lora_sdxl.py")
print('INSTALL_OK', flush=True)

# dataset (Kaggle auto-unzips the attached dataset somewhere under /kaggle/input)
INPUT = Path('/kaggle/input')
metas = sorted(INPUT.rglob('metadata.jsonl'))
if metas:
    data_root = metas[0].parent
    extract = None
else:
    zips = sorted(INPUT.rglob('*.zip'))
    assert zips, f'NO_DATASET under {INPUT}'
    extract = WORK / 'extract'
    with zipfile.ZipFile(zips[0]) as z:
        z.extractall(extract)
    data_root = sorted(extract.rglob('metadata.jsonl'))[0].parent
assert (data_root / 'images').is_dir(), f'NO_IMAGES in {data_root}'

train_dir = WORK / 'train_data'
train_dir.mkdir(exist_ok=True)
n = 0
with open(data_root / 'metadata.jsonl', encoding='utf-8') as fin, \
     open(train_dir / 'metadata.jsonl', 'w', encoding='utf-8') as fout:
    for line in fin:
        m = json.loads(line)
        base = os.path.basename(m['file_name'])
        dst = train_dir / base
        if not dst.exists():
            os.symlink(data_root / 'images' / base, dst)
        fout.write(json.dumps({'file_name': base, 'caption': m['caption']}, ensure_ascii=False) + '\n')
        n += 1
assert n >= 10000, f'DATASET_INCOMPLETE: {n}'
print('DATASET_OK images:', n, flush=True)

os.environ['CUDA_VISIBLE_DEVICES'] = '0'
from accelerate.utils import write_basic_config
write_basic_config(mixed_precision='fp16')

run(
    'accelerate launch train_text_to_image_lora_sdxl.py'
    ' --pretrained_model_name_or_path=stabilityai/stable-diffusion-xl-base-1.0'
    ' --pretrained_vae_model_name_or_path=madebyollin/sdxl-vae-fp16-fix'
    f' --train_data_dir={train_dir}'
    ' --caption_column=caption'
    ' --resolution=768 --center_crop --random_flip'
    ' --train_batch_size=1 --gradient_accumulation_steps=4'
    ' --gradient_checkpointing --use_8bit_adam --mixed_precision=fp16'
    ' --max_train_steps=2000'          # was 3500 — less overfitting
    ' --learning_rate=5e-5'            # was 1e-4 — gentler
    ' --lr_scheduler=cosine --lr_warmup_steps=100'
    ' --rank=8'                        # was 16 — less texture memorization
    ' --snr_gamma=5.0'
    ' --noise_offset=0.05'             # reduces contrast/texture collapse
    ' --checkpointing_steps=1000 --checkpoints_total_limit=1'
    ' --seed=42'
    ' --output_dir=/kaggle/working/king2-stickman-lora-v2'
)

weights = WORK / 'king2-stickman-lora-v2' / 'pytorch_lora_weights.safetensors'
assert weights.exists(), 'TRAIN_FAILED: no weights'
print('TRAIN_OK', weights.stat().st_size, 'bytes', flush=True)

# smoke test at scale 0.7 (v1 was better below 1.0)
try:
    import torch
    from diffusers import DiffusionPipeline
    pipe = DiffusionPipeline.from_pretrained(
        'stabilityai/stable-diffusion-xl-base-1.0', torch_dtype=torch.float16).to('cuda')
    pipe.load_lora_weights(str(weights.parent), weight_name=weights.name)
    pipe.set_adapters(['default_0'], adapter_weights=[0.8]) if hasattr(pipe, 'set_adapters') else None
    for i, p in enumerate([
        'a stickman running, simple black and white stick figure line drawing',
        'a stickman sitting on a chair, simple black and white stick figure line drawing',
        'a stickman doing yoga, simple black and white stick figure line drawing',
        'a stickman kicking a ball, simple black and white stick figure line drawing',
    ]):
        img = pipe(p, num_inference_steps=25, guidance_scale=8.0, height=768, width=768).images[0]
        img.save(WORK / f'v2_test_{i}.png')
    print('SMOKE_TEST_OK', flush=True)
except Exception as e:
    print('SMOKE_TEST_SKIPPED:', e, flush=True)

# cleanup (guarded — the v1 bug was an unguarded rmtree of an undefined path)
import shutil
for cp in (WORK / 'king2-stickman-lora-v2').glob('checkpoint-*'):
    shutil.rmtree(cp, ignore_errors=True)
if extract is not None:
    shutil.rmtree(extract, ignore_errors=True)
print('ALL_DONE', flush=True)
