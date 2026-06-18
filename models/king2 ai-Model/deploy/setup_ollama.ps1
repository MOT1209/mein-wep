# Setup Ollama for KING2 Fine-tuned Models
# يشغّل هذا السكربت بعد تحميل النموذج المدرب (GGUF)

$MODEL_DIR = "C:\Users\aihmo\alle folder von code\موقعي الرئيسي\models\king2 ai-Model"
$OLLAMA_DIR = "$env:USERPROFILE\.ollama\models"

Write-Host "=== KING2 AI - Ollama Setup ===" -ForegroundColor Cyan

# 1. Check if Ollama is installed
try {
    $ollamaVersion = & ollama --version 2>$null
    Write-Host "Ollama found: $ollamaVersion" -ForegroundColor Green
} catch {
    Write-Host "Ollama not installed! Download from: https://ollama.com/download" -ForegroundColor Yellow
    exit 1
}

# 2. Check if GGUF model exists
$GGUF_PATH = "$MODEL_DIR\models\king2-qwen3.5-9b\king2-qwen3.5-9b-q4_k_m.gguf"
if (-not (Test-Path $GGUF_PATH)) {
    Write-Host "Fine-tuned GGUF not found at: $GGUF_PATH" -ForegroundColor Yellow
    Write-Host "Run Colab notebook first to train and export the model." -ForegroundColor Yellow
    exit 1
}

# 3. Create Modelfile and import to Ollama
Write-Host "Importing KING2 Qwen3.5-9B to Ollama..." -ForegroundColor Cyan
& ollama create king2-qwen3.5-9b -f "$MODEL_DIR\Modelfile"

Write-Host "Done! Run: ollama run king2-qwen3.5-9b" -ForegroundColor Green
