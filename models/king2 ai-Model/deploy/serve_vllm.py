"""
تشغيل KING2 Fine-tuned model باستخدام vLLM على سيرفر GPU
يُستخدم مع: RunPod, Vast.ai, أو أي سيرفر CUDA
"""

import os
import yaml
from vllm import LLM, SamplingParams
from vllm.entrypoints.openai.api_server import run_server

CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "vllm_config.yaml")


def load_config():
    with open(CONFIG_PATH, "r") as f:
        return yaml.safe_load(f)


def start():
    cfg = load_config()

    # Load base model + LoRA adapter
    llm = LLM(
        model=cfg["model"],
        enable_lora=cfg.get("enable_lora", False),
        max_model_len=cfg.get("max_model_len", 16384),
        gpu_memory_utilization=cfg.get("gpu_memory_utilization", 0.95),
        tensor_parallel_size=cfg.get("tensor_parallel_size", 1),
        quantization=cfg.get("quantization", None),
    )

    # Run OpenAI-compatible server
    run_server(
        llm=llm,
        host=cfg.get("host", "0.0.0.0"),
        port=cfg.get("port", 8000),
        api_key=cfg.get("api_key", None),
    )


if __name__ == "__main__":
    start()
