---
title: KING2 AI
emoji: 👑
colorFrom: indigo
colorTo: yellow
sdk: gradio
sdk_version: 5.0.0
app_file: app.py
pinned: false
license: apache-2.0
---

# 👑 KING2 AI — مساعد الذكاء الاصطناعي الملكي

<p align="center">
  <strong>Royal AI Assistant — Fine-tuned Qwen2.5-3B-Instruct with LoRA</strong>
</p>

<p align="center" dir="rtl">
  <strong>مساعد ذكاء اصطناعي ملكي، مبني على نموذج Qwen2.5-3B مع محول LoRA</strong>
</p>

---

## 🌐 English

**KING2 AI** is a fine-tuned conversational assistant built on top of
[Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct) with a
LoRA adapter trained by [RASHID778](https://huggingface.co/RASHID778).

### Features

- 💬 **Chat interface** — Arabic-first Gradio UI with the KING2 dark theme
- ⚡ **OpenAI-compatible API** — endpoint at `/v1/chat/completions` for integration
  with the KING2 Next.js platform or any OpenAI SDK client
- 🎯 **4-bit quantised** — runs efficiently on a T4 GPU (15 GB VRAM)
- 🔌 **Streaming support** — both the chat UI and the API support token-by-token
  streaming
- 📜 **ChatML format** — uses Qwen's chat template with a custom KING2 system prompt

### API Usage

```bash
curl https://YOUR-SPACE.hf.space/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "king2-qwen2.5-3b",
    "messages": [{"role": "user", "content": "ما هي عاصمة السعودية؟"}],
    "temperature": 0.7,
    "stream": true
  }'
```

### Model Info

| Property       | Value                              |
|---------------|-------------------------------------|
| Base model    | Qwen/Qwen2.5-3B-Instruct           |
| LoRA adapter  | RASHID778/king2-qwen2.5-3b         |
| Parameters    | ~3B (base)                         |
| Quantisation  | 4-bit NF4 (via bitsandbytes)       |
| Device map    | auto (GPU → CPU offload)           |
| Context       | Up to 32K tokens                   |
| Language      | Arabic (primary), English          |

---

## 🌙 العربية

**KING2 AI** هو مساعد محادثة مخصص، مبني على نموذج Qwen2.5-3B-Instruct مع محول LoRA
مدرب بواسطة RASHID778.

### المميزات

- 💬 **واجهة محادثة** — تصميم عربي مع واجهة KING2 المظلمة
- ⚡ **واجهة API** — متوافقة مع OpenAI في `/v1/chat/completions` للتكامل مع
  منصة KING2 Next.js أو أي مكتبة تدعم OpenAI
- 🎯 **كمية 4-bit** — يعمل بكفاءة على معالج T4 (15 جيجابايت VRAM)
- 🔌 **بث مباشر** — دعم البث المباشر للأحرف في الواجهة و API
- 📜 **صيغة ChatML** — استخدام قالب محادثة Qwen مع تعليمات KING2 المخصصة

### استخدام API

```bash
curl https://YOUR-SPACE.hf.space/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "king2-qwen2.5-3b",
    "messages": [{"role": "user", "content": "ما هي عاصمة السعودية؟"}],
    "temperature": 0.7
  }'
```

### معلومات النموذج

| الخاصية       | القيمة                             |
|---------------|------------------------------------|
| النموذج الأساسي | Qwen/Qwen2.5-3B-Instruct          |
| محول LoRA     | RASHID778/king2-qwen2.5-3b         |
| المعاملات     | ~3 مليار                           |
| الكمية        | 4-bit NF4                          |
| توزيع الجهاز  | تلقائي (GPU → CPU)                 |
| السياق        | حتى 32 ألف رمز                     |
| اللغة         | العربية (أساسية)، الإنجليزية       |

---

## 🚀 Deploy to Hugging Face Spaces

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) → **Create new Space**
2. Choose **Gradio** SDK
3. Select a **GPU** hardware tier (T4 small is sufficient)
4. Set the following **Secrets**:
   - `HF_TOKEN`: Your Hugging Face token (for accessing gated models)
5. Upload these files or connect your GitHub repository

```bash
# Or push via CLI
git clone https://huggingface.co/spaces/YOUR_USER/YOUR_SPACE
cd YOUR_SPACE
cp /path/to/king2-qwen2.5-3b/hf-space/* .
git add .
git commit -m "Initial deploy: KING2 AI"
git push
```

### Environment Variables

| Variable   | Required | Description                           |
|------------|----------|---------------------------------------|
| `HF_TOKEN` | Yes*     | Hugging Face token for gated models   |
| `PORT`     | No       | Server port (default: 7860)           |

*\* Required only if the base model or LoRA adapter requires authentication.*

---

## 📦 Repository Structure

```
hf-space/
├── app.py            # Main application (Gradio + FastAPI)
├── requirements.txt  # Python dependencies
├── README.md         # This file
└── Dockerfile        # Optional custom build
```

---

<p align="center">
  <strong>👑 KING2 — Royal AI Assistant</strong><br>
  <sub>Built with ❤️ by Rashid</sub>
</p>
