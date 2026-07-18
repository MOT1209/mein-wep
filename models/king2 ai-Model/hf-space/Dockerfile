# ─── KING2 AI — Hugging Face Space Dockerfile ─────────────────────────────────
# Base: PyTorch 2.5.1 with CUDA 12.4 + cuDNN 9
#
# NOTE: This Dockerfile is optional. HF Spaces can auto-detect Gradio and
# install deps from requirements.txt without it.  Use this file if you need
# exact control over the environment or system-level packages.
# ────────────────────────────────────────────────────────────────────────────────

FROM pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

LABEL maintainer="RASHID778"
LABEL description="KING2 AI - Fine-tuned Qwen2.5-3B-Instruct with LoRA"

# Prevent Python from writing .pyc and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install system dependencies needed by bitsandbytes / tokenizers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the default HF Space port
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Run with uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
