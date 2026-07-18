FROM runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04

WORKDIR /app

# Install vLLM + dependencies
RUN pip install vllm==0.6.3.post1 fastapi uvicorn requests

# Copy model files
COPY . /app/

# Download base model + LoRA adapter
RUN python -c "from huggingface_hub import snapshot_download; snapshot_download('Qwen/Qwen3.5-9B', local_dir='/models/qwen3.5-9b')"

# Copy LoRA adapter (يُرفع من local إلى السيرفر)
# COPY ./king2-qwen-adapter /models/king2-qwen-adapter

EXPOSE 8000

CMD ["python", "deploy/serve_vllm.py"]
