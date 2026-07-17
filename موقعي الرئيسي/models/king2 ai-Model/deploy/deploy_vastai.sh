#!/bin/bash
# نشر KING2 AI على Vast.ai (أو أي سيرفر Ubuntu + GPU)
# استخدم这个 السكربت بعد استئجار سيرفر على Vast.ai

set -e

echo "=== KING2 AI Deployment on Vast.ai ==="

# 1. Install dependencies
sudo apt-get update
sudo apt-get install -y python3-pip git

# 2. Install vLLM
pip install vllm==0.6.3.post1 fastapi uvicorn pyyaml requests

# 3. Clone repo or copy files
# git clone https://github.com/YOUR_USER/king2-ai-model.git /app
# cd /app

# 4. Download base model
python3 -c "
from huggingface_hub import snapshot_download
snapshot_download('Qwen/Qwen3.5-9B', local_dir='/models/qwen3.5-9b')
"

# 5. Start vLLM server
python3 deploy/serve_vllm.py
