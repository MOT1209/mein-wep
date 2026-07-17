import os
import torch
import logging
from huggingface_hub import HfApi
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("merge")

BASE_MODEL = "Qwen/Qwen2.5-3B-Instruct"
LORA_ADAPTER = "RASHID778/king2-qwen2.5-3b"
OUTPUT_REPO = "RASHID778/king2-qwen2.5-3b-merged"
HF_TOKEN = os.getenv("HF_TOKEN")

log.info("=== KING2 Merge LoRA + Base Model ===")

log.info("Loading base model...")
dtype = torch.float16 if torch.cuda.is_available() else torch.float32
model = AutoModelForCausalLM.from_pretrained(BASE_MODEL, torch_dtype=dtype, device_map="auto", token=HF_TOKEN)
log.info("Base model loaded")

log.info("Loading LoRA...")
model = PeftModel.from_pretrained(model, LORA_ADAPTER, token=HF_TOKEN)
log.info("LoRA loaded")

log.info("Merging...")
merged = model.merge_and_unload()
log.info("Merge complete")

log.info("Saving locally...")
merged.save_pretrained("./king2-merged")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, token=HF_TOKEN)
tokenizer.save_pretrained("./king2-merged")
log.info("Saved to ./king2-merged")

log.info("Uploading to HF...")
api = HfApi()
api.create_repo(OUTPUT_REPO, repo_type="model", exist_ok=True, token=HF_TOKEN)
api.upload_folder(folder_path="./king2-merged", repo_id=OUTPUT_REPO, token=HF_TOKEN)
log.info("Uploaded!")
