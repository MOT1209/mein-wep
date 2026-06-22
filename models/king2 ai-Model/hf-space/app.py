#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
KING2 AI — Hugging Face Space
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Fine-tuned Qwen2.5-3B-Instruct with LoRA adapter.
- Gradio chat interface (Arabic-first, KING2 dark theme)
- OpenAI-compatible API at /v1/chat/completions
- 4-bit quantised for T4 GPU (15 GB VRAM)

Model:  RASHID778/king2-qwen2.5-3b  (LoRA adapter, ~60 MB)
Base:   Qwen/Qwen2.5-3B-Instruct   (3B params)
"""

from __future__ import annotations

import os
import re
import json
import time
import torch
import logging
from typing import List, Optional, Generator, AsyncGenerator, Union
from threading import Thread
from contextlib import asynccontextmanager

import gradio as gr
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field

from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TextIteratorStreamer,
)
from peft import PeftModel

# ─── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("king2")

# ─── Configuration ─────────────────────────────────────────────────────────────

BASE_MODEL_ID   = "Qwen/Qwen2.5-3B-Instruct"
LORA_MODEL_ID   = "RASHID778/king2-qwen2.5-3b"
HF_TOKEN        = os.getenv("HF_TOKEN", None)

SYSTEM_PROMPT   = (
    "أنت KING2، مساعد الذكاء الاصطناعي الملكي المتطور. "
    "أجب بالعربية الفصحى أولاً دائماً. كن مهذياً ومحترفاً."
)

PORT                = int(os.getenv("PORT", "7860"))
DEFAULT_MAX_TOKENS  = 2048
DEFAULT_TEMPERATURE = 0.7
DEFAULT_TOP_P       = 0.9

# ─── Model Loading (cached at module level) ────────────────────────────────────

log.info("=" * 60)
log.info("👑 KING2 AI — Loading model…")
log.info("=" * 60)

device = "cuda" if torch.cuda.is_available() else "cpu"
log.info(f"• Device         : {device}")

if torch.cuda.is_available():
    log.info(f"• GPU            : {torch.cuda.get_device_name(0)}")
    vram_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
    log.info(f"• VRAM           : {vram_gb:.1f} GB")

quant_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
)

# -- Base model ---------------------------------------------------------------
log.info(f"• Loading base   : {BASE_MODEL_ID}")
try:
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL_ID,
        quantization_config=quant_config,
        torch_dtype=torch.bfloat16,
        device_map="auto",
        token=HF_TOKEN,
    )
    log.info("  ✓ Base model loaded")
except Exception as exc:
    log.error(f"  ✗ Failed to load base model: {exc}")
    raise

# -- LoRA adapter -------------------------------------------------------------
log.info(f"• Loading LoRA   : {LORA_MODEL_ID}")
try:
    model = PeftModel.from_pretrained(model, LORA_MODEL_ID, token=HF_TOKEN)
    model.eval()
    log.info("  ✓ LoRA adapter loaded")
except Exception as exc:
    log.error(f"  ✗ Failed to load LoRA: {exc}")
    raise

# -- Tokenizer ----------------------------------------------------------------
log.info(f"• Tokenizer      : {BASE_MODEL_ID}")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID, token=HF_TOKEN)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token
log.info("  ✓ Tokenizer ready")

# -- Sanity check -------------------------------------------------------------
sample = tokenizer("السلام عليكم", return_tensors="pt")
n_params = sum(p.numel() for p in model.parameters())
log.info(f"• Parameters     : {n_params/1e6:.1f}M")
log.info("=" * 60)
log.info("✅ KING2 AI ready")
log.info("=" * 60)

# ─── Generation Helpers ────────────────────────────────────────────────────────

def build_messages(
    history: list,
    user_message: str,
    system_prompt: Optional[str] = None,
) -> list[dict]:
    """Convert Gradio history into Qwen chat-template messages.

    Accepts both ``type="tuples"`` and ``type="messages"`` history formats.
    """
    messages = [{"role": "system", "content": system_prompt or SYSTEM_PROMPT}]

    for item in history:
        if isinstance(item, dict):
            # messages format
            role = item.get("role", "user")
            content = item.get("content", "")
            if content:
                messages.append({"role": role, "content": content})
        elif isinstance(item, (list, tuple)) and len(item) >= 2:
            # tuples format
            user_msg, bot_msg = item[0], item[1]
            if user_msg:
                messages.append({"role": "user", "content": user_msg})
            if bot_msg:
                messages.append({"role": "assistant", "content": bot_msg})

    if user_message:
        messages.append({"role": "user", "content": user_message})

    return messages


def generate(
    messages: list[dict],
    max_new_tokens: int = DEFAULT_MAX_TOKENS,
    temperature: float = DEFAULT_TEMPERATURE,
    top_p: float = DEFAULT_TOP_P,
) -> str:
    """Non-streaming generation."""
    text = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    inputs = tokenizer(text, return_tensors="pt").to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            top_p=top_p,
            do_sample=temperature > 0,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )

    return tokenizer.decode(
        outputs[0][inputs.input_ids.shape[1]:],
        skip_special_tokens=True,
    ).strip()


def generate_stream(
    messages: list[dict],
    max_new_tokens: int = DEFAULT_MAX_TOKENS,
    temperature: float = DEFAULT_TEMPERATURE,
    top_p: float = DEFAULT_TOP_P,
) -> Generator[str, None, None]:
    """Streaming generation — yields text chunks as they arrive."""
    text = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    inputs = tokenizer(text, return_tensors="pt").to(model.device)

    streamer = TextIteratorStreamer(
        tokenizer,
        skip_prompt=True,
        skip_special_tokens=True,
    )

    # Unpack inputs dict (input_ids, attention_mask) as top-level kwargs
    generation_kwargs = dict(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        streamer=streamer,
        max_new_tokens=max_new_tokens,
        temperature=temperature,
        top_p=top_p,
        do_sample=temperature > 0,
        pad_token_id=tokenizer.pad_token_id,
        eos_token_id=tokenizer.eos_token_id,
    )

    thread = Thread(target=model.generate, kwargs=generation_kwargs)
    thread.start()

    for new_text in streamer:
        yield new_text


# ─── FastAPI Application ───────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("🚀 KING2 API server started")
    yield
    log.info("👋 KING2 API server shutting down")


app = FastAPI(
    title="KING2 AI API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Models ───────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str = Field(..., description="user | assistant | system")
    content: str = Field(..., description="Message text")

class DeltaMessage(BaseModel):
    role: Optional[str] = None
    content: Optional[str] = None

class ChatCompletionRequest(BaseModel):
    model: str = Field(default="king2-qwen2.5-3b")
    messages: List[ChatMessage]
    max_tokens: int = Field(default=DEFAULT_MAX_TOKENS, ge=1, le=8192)
    temperature: float = Field(default=DEFAULT_TEMPERATURE, ge=0.0, le=2.0)
    top_p: float = Field(default=DEFAULT_TOP_P, ge=0.0, le=1.0)
    stream: bool = False
    frequency_penalty: Optional[float] = 0.0
    presence_penalty: Optional[float] = 0.0

class UsageInfo(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

class ResponseChoice(BaseModel):
    index: int = 0
    message: ChatMessage
    finish_reason: str = "stop"
    logprobs: Optional[dict] = None

class ChatCompletionResponse(BaseModel):
    id: str = ""
    object: str = "chat.completion"
    created: int = 0
    model: str = ""
    choices: List[ResponseChoice] = []
    usage: UsageInfo = UsageInfo()

# ─── API Routes ────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "KING2 AI API",
        "version": "1.0.0",
        "model": LORA_MODEL_ID,
        "base_model": BASE_MODEL_ID,
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "models": "/v1/models",
            "chat": "/v1/chat/completions",
        },
    }


@app.get("/health")
async def health_check():
    gpu = {}
    if torch.cuda.is_available():
        gpu = {
            "name": torch.cuda.get_device_name(0),
            "vram_gb": round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 1),
            "allocated_gb": round(torch.cuda.memory_allocated() / 1024**3, 2),
            "cached_gb": round(torch.cuda.memory_reserved() / 1024**3, 2),
        }
    return {
        "status": "ok",
        "model": LORA_MODEL_ID,
        "device": device,
        "gpu": gpu or None,
        "uptime": time.time(),
    }


@app.get("/v1/models")
async def list_models():
    return {
        "object": "list",
        "data": [
            {
                "id": "king2-qwen2.5-3b",
                "object": "model",
                "created": int(time.time()),
                "owned_by": "RASHID778",
            }
        ],
    }


@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    # Build message thread
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in request.messages:
        messages.append({"role": m.role, "content": m.content})

    # Count prompt tokens for usage report
    prompt_text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    prompt_tokens = len(tokenizer.encode(prompt_text))

    # ── Streaming ──────────────────────────────────────────────────────
    if request.stream:
        return StreamingResponse(
            _stream_openai(messages, request.model, request.max_tokens, request.temperature, request.top_p),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    # ── Non-streaming ──────────────────────────────────────────────────
    response = generate(
        messages,
        max_new_tokens=request.max_tokens,
        temperature=request.temperature,
        top_p=request.top_p,
    )
    completion_tokens = len(tokenizer.encode(response))

    return ChatCompletionResponse(
        id=f"chatcmpl-{int(time.time())}",
        created=int(time.time()),
        model=request.model,
        choices=[
            ResponseChoice(
                message=ChatMessage(role="assistant", content=response),
            )
        ],
        usage=UsageInfo(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
        ),
    )


async def _stream_openai(
    messages: list[dict],
    model_id: str,
    max_tokens: int,
    temperature: float,
    top_p: float,
) -> AsyncGenerator[str, None]:
    """OpenAI-compatible SSE streaming."""
    completion_id = f"chatcmpl-{int(time.time())}"
    created = int(time.time())

    # Role chunk
    role_chunk = {
        "id": completion_id,
        "object": "chat.completion.chunk",
        "created": created,
        "model": model_id,
        "choices": [{"index": 0, "delta": {"role": "assistant", "content": ""}, "finish_reason": None}],
    }
    yield f"data: {json.dumps(role_chunk, ensure_ascii=False)}\n\n"

    # Content chunks
    for text_chunk in generate_stream(messages, max_new_tokens=max_tokens, temperature=temperature, top_p=top_p):
        content_chunk = {
            "id": completion_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": model_id,
            "choices": [{"index": 0, "delta": {"content": text_chunk}, "finish_reason": None}],
        }
        yield f"data: {json.dumps(content_chunk, ensure_ascii=False)}\n\n"

    # Final chunk
    final_chunk = {
        "id": completion_id,
        "object": "chat.completion.chunk",
        "created": created,
        "model": model_id,
        "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
    }
    yield f"data: {json.dumps(final_chunk, ensure_ascii=False)}\n\n"
    yield "data: [DONE]\n\n"


# ─── Gradio Interface ──────────────────────────────────────────────────────────

CUSTOM_CSS = """
/* ─── KING2 Dark Theme (Arabic-first) ─────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');

:root {
    --king-bg: #0a0a0f;
    --king-bg-secondary: #111118;
    --king-bg-tertiary: #1a1a24;
    --king-bg-elevated: #222230;
    --king-primary: #6366f1;
    --king-primary-dark: #4f46e5;
    --king-accent-gold: #d4a574;
    --king-accent-emerald: #10b981;
    --king-text: #f1f5f9;
    --king-text-secondary: #94a3b8;
    --king-text-muted: #64748b;
    --king-border: #2a2a35;
    --king-radius: 14px;
}
* { font-family: 'Noto Sans Arabic', sans-serif; }
.gradio-container {
    background: var(--king-bg) !important;
    color: var(--king-text) !important;
    direction: rtl !important;
    max-width: 880px !important;
    margin: 0 auto !important;
    padding: 1.5rem 1rem !important;
}
h1 {
    color: var(--king-accent-gold) !important;
    text-align: center !important;
    font-size: 2.8rem !important;
    font-weight: 700 !important;
    letter-spacing: -0.02em !important;
    margin-bottom: 0.1rem !important;
}
h3 {
    color: var(--king-text-secondary) !important;
    text-align: center !important;
    font-weight: 400 !important;
    font-size: 1.1rem !important;
    margin-top: 0 !important;
    margin-bottom: 1.5rem !important;
}
.gr-box, .panel {
    border-color: var(--king-border) !important;
    background: var(--king-bg-secondary) !important;
    border-radius: var(--king-radius) !important;
}
.gr-form {
    background: transparent !important;
    border: none !important;
}
label, .gr-label {
    color: var(--king-text-secondary) !important;
    font-weight: 500 !important;
}
input, textarea, .gr-input, .gr-textarea {
    background: var(--king-bg-tertiary) !important;
    color: var(--king-text) !important;
    border: 1px solid var(--king-border) !important;
    border-radius: 12px !important;
    padding: 12px 16px !important;
    font-size: 1rem !important;
}
input:focus, textarea:focus, .gr-input:focus, .gr-textarea:focus {
    border-color: var(--king-primary) !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important;
    outline: none !important;
}
.message {
    border-radius: 18px !important;
    padding: 14px 20px !important;
    margin-bottom: 8px !important;
    max-width: 85% !important;
    word-break: break-word !important;
    line-height: 1.7 !important;
}
.user {
    background: var(--king-primary-dark) !important;
    color: #fff !important;
    border-bottom-left-radius: 4px !important;
    margin-left: auto !important;
}
.bot {
    background: var(--king-bg-elevated) !important;
    color: var(--king-text) !important;
    border: 1px solid rgba(212, 165, 116, 0.3) !important;
    border-bottom-right-radius: 4px !important;
}
.gr-button {
    border-radius: 12px !important;
    font-weight: 600 !important;
    padding: 10px 24px !important;
    transition: all 0.15s ease !important;
    cursor: pointer !important;
}
.gr-button-primary {
    background: linear-gradient(135deg, var(--king-primary), var(--king-primary-dark)) !important;
    color: #fff !important;
    border: none !important;
}
.gr-button-primary:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35) !important;
}
.gr-button-secondary {
    background: transparent !important;
    color: var(--king-text-secondary) !important;
    border: 1px solid var(--king-border) !important;
}
.gr-button-secondary:hover {
    background: var(--king-bg-tertiary) !important;
    border-color: var(--king-text-secondary) !important;
}
footer { display: none !important; }
.gr-status, .gr-info { color: var(--king-text-muted) !important; }
.svelte-1v1l6gy, .svelte-1mc0d7b { background: transparent !important; }
.gr-chatbot, .chatbot-container {
    background: var(--king-bg-secondary) !important;
    border: 1px solid var(--king-border) !important;
    border-radius: var(--king-radius) !important;
    padding: 8px !important;
}
.gr-chatbot .bot .message-wrap, .gr-chatbot .user .message-wrap {
    background: transparent !important;
}
.gr-chatbot .bot .message-wrap p, .gr-chatbot .user .message-wrap p {
    margin: 0 !important;
}
.gr-dropdown, select {
    background: var(--king-bg-tertiary) !important;
    color: var(--king-text) !important;
    border: 1px solid var(--king-border) !important;
    border-radius: 10px !important;
}
.gr-dropdown:focus, select:focus {
    border-color: var(--king-primary) !important;
}
.gr-radio {
    accent-color: var(--king-primary) !important;
}
/* Scrollbar */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
    background: var(--king-bg-secondary);
}
::-webkit-scrollbar-thumb {
    background: var(--king-border);
    border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
    background: var(--king-text-muted);
}
"""


def gradio_chat_fn(message: str, history: list):
    """Gradio streaming chat function."""
    messages = build_messages(history, message)

    partial = ""
    for text_chunk in generate_stream(messages):
        partial += text_chunk
        yield partial


# Build Gradio interface (standalone ChatInterface — simpler & more reliable)
demo = gr.ChatInterface(
    fn=gradio_chat_fn,
    type="tuples",
    title="👑 KING2 AI\nمساعد الذكاء الاصطناعي الملكي",
    description=(
        "أهلاً بك في KING2 — مساعدك الذكي. اكتب سؤالك أو استفسارك بالعربية.\n\n"
        "Welcome to KING2 — your intelligent assistant. Ask in Arabic or English."
    ),
    theme=gr.themes.Soft(
        primary_hue=gr.themes.Color(
            c50="#eef2ff",  c100="#e0e7ff", c200="#c7d2fe",
            c300="#a5b4fc", c400="#818cf8", c500="#6366f1",
            c600="#4f46e5", c700="#4338ca", c800="#3730a3",
            c900="#312e81", c950="#1e1b4b",
        ),
        secondary_hue=gr.themes.Color(
            c50="#fffbeb",  c100="#fef3c7", c200="#fde68a",
            c300="#fcd34d", c400="#fbbf24", c500="#d4a574",
            c600="#b45309", c700="#92400e", c800="#78350f",
            c900="#451a03",
        ),
        neutral_hue=gr.themes.Color(
            c50="#f8fafc",  c100="#f1f5f9", c200="#e2e8f0",
            c300="#cbd5e1", c400="#94a3b8", c500="#64748b",
            c600="#475569", c700="#334155", c800="#1e293b",
            c900="#0f172a", c950="#020617",
        ),
        spacing_size=gr.themes.sizes.spacing_md,
        radius_size=gr.themes.sizes.radius_md,
        text_size=gr.themes.sizes.text_md,
        font=("Noto Sans Arabic", "sans-serif"),
    ),
    css=CUSTOM_CSS,
    submit_btn="إرسال ✦",
    retry_btn="🔄 إعادة المحاولة",
    undo_btn="🔙 تراجع",
    clear_btn="🗑️ مسح المحادثة",
    autofocus=True,
)


# ─── Mount Gradio on FastAPI ───────────────────────────────────────────────────

app = gr.mount_gradio_app(app, demo, path="/")

# ─── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    log.info(f"🚀 Starting KING2 server on port {PORT}")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=PORT,
        log_level="info",
    )
