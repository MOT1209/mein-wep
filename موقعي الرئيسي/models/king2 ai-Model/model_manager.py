#!/usr/bin/env python3
"""
مدير النماذج المحلية - KING2 Local Model Manager
يدير llama.cpp server كـ subprocess لتحميل وتشغيل Gemma 4 و Qwen3.5-9B
بدون الحاجة إلى LM Studio
"""
import os
import sys
import time
import json
import signal
import subprocess
import atexit
import threading
from pathlib import Path
from urllib.request import urlopen
from urllib.error import URLError

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
LLAMA_CPP_DIR = os.path.join(BASE_DIR, "llama_cpp")

if sys.platform == "win32":
    SERVER_EXE = os.path.join(LLAMA_CPP_DIR, "llama-server.exe")
else:
    SERVER_EXE = os.path.join(LLAMA_CPP_DIR, "llama-server")

# Configuration for each model
MODEL_CONFIGS = {
    "gemma": {
        "path": os.path.join(MODELS_DIR, "gemma-4-e4b", "gemma-4-e4b-it-q4_k_m.gguf"),
        "port": 1235,
        "max_tokens": 4096,
        "n_gpu_layers": 0,
        "n_ctx": 8192,
        "n_threads": 4,
        "model_api_name": "gemma-4-e4b",
    },
    "qwen": {
        "path": os.path.join(MODELS_DIR, "qwen3.5-9b", "qwen3.5-9b-q4_k_m.gguf"),
        "port": 1236,
        "max_tokens": 8192,
        "n_gpu_layers": 0,
        "n_ctx": 16384,
        "n_threads": 4,
        "model_api_name": "qwen3.5-9b",
    },
    # KING2 Fine-tuned models (بعد التدريب باستخدام LLaMA Factory)
    "king2-qwen": {
        "path": os.path.join(MODELS_DIR, "king2-qwen3.5-9b", "king2-qwen3.5-9b-q4_k_m.gguf"),
        "port": 1236,
        "max_tokens": 8192,
        "n_gpu_layers": 0,
        "n_ctx": 16384,
        "n_threads": 4,
        "model_api_name": "king2-qwen3.5-9b",
        "fine_tuned": True,
        "base_model": "qwen",
    },
    "king2-gemma": {
        "path": os.path.join(MODELS_DIR, "king2-gemma-4-e4b", "king2-gemma-4-e4b-q4_k_m.gguf"),
        "port": 1235,
        "max_tokens": 4096,
        "n_gpu_layers": 0,
        "n_ctx": 8192,
        "n_threads": 4,
        "model_api_name": "king2-gemma-4-e4b",
        "fine_tuned": True,
        "base_model": "gemma",
    },
    # Ollama managed models (يُشغل عبر Ollama API)
    "ollama-king2": {
        "path": None,
        "port": 11434,
        "max_tokens": 2048,
        "n_gpu_layers": -1,
        "n_ctx": 4096,
        "n_threads": 4,
        "model_api_name": "king2",
        "ollama_model": "king2-arabic:latest",
    },
    "ollama-qwen": {
        "path": None,
        "port": 11434,
        "max_tokens": 8192,
        "n_gpu_layers": -1,
        "n_ctx": 16384,
        "n_threads": 4,
        "model_api_name": "king2-qwen3.5-9b",
        "ollama_model": "king2-qwen3.5-9b",
    },
    "ollama-gemma": {
        "path": None,
        "port": 11434,
        "max_tokens": 4096,
        "n_gpu_layers": -1,
        "n_ctx": 8192,
        "n_threads": 4,
        "model_api_name": "king2-gemma-4-e4b",
        "ollama_model": "king2-gemma-4-e4b",
    },
}


class LocalModelProvider:
    """
    يدير llama.cpp server كـ subprocess.
    - يشغل server.exe مع GGUF معين
    - يدعم تبديل النماذج (kill old → start new)
    - يوفر API endpoint للـ engine
    - يعمل على CPU فقط (بدون GPU)
    """

    def __init__(self):
        self.current_model_id = None
        self.process = None
        self._lock = threading.Lock()
        self.port = None
        self.server_ready = threading.Event()
        self._monitor_thread = None
        self._running = False
        atexit.register(self._cleanup)

    @property
    def is_ready(self):
        return self.current_model_id is not None and self.process is not None and self.process.poll() is None

    def _get_server_path(self):
        """Find llama-server.exe path."""
        if os.path.exists(SERVER_EXE):
            return SERVER_EXE
        # Check PATH
        import shutil
        found = shutil.which("llama-server")
        if found:
            return found
        return None

    def _is_ollama_model(self, cfg):
        return cfg.get("ollama_model") is not None

    def _check_ollama(self):
        """Check if Ollama is running and accessible."""
        try:
            resp = urlopen("http://127.0.0.1:11434/api/tags", timeout=3)
            return resp.status == 200
        except:
            return False

    def load_model(self, model_id: str) -> bool:
        """
        تحميل نموذج: إيقاف النموذج الحالي ← تشغيل server مع النموذج الجديد
        يدعم: llama.cpp, GGUF, Ollama
        Returns True if successful.
        """
        if model_id not in MODEL_CONFIGS:
            print(f"[ModelManager] نموذج غير معروف: {model_id}")
            return False

        if model_id == self.current_model_id and self.is_ready:
            print(f"[ModelManager] {model_id} قيد التشغيل بالفعل")
            return True

        cfg = MODEL_CONFIGS[model_id]

        # === Ollama mode ===
        if self._is_ollama_model(cfg):
            return self._load_ollama_model(model_id, cfg)

        # === GGUF / llama.cpp mode ===
        if not os.path.exists(cfg["path"]):
            print(f"[ModelManager] GGUF غير موجود: {cfg['path']}")
            print(f"[ModelManager]    شغّل download_models.py أولاً")
            return False

        server_path = self._get_server_path()
        if not server_path:
            print(f"[ModelManager] llama-server.exe غير موجود!")
            return False

        self.unload_model()

        self.port = cfg["port"]
        cmd = [
            server_path,
            "-m", cfg["path"],
            "--port", str(self.port),
            "--host", "127.0.0.1",
            "-c", str(cfg["n_ctx"]),
            "-t", str(cfg["n_threads"]),
            "--mlock",
            "--no-mmap",
            "--cont-batching",
            "-ngl", str(cfg.get("n_gpu_layers", 0)),
        ]

        print(f"[ModelManager] جاري تشغيل {model_id} على المنفذ {self.port}...")

        try:
            self.process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=LLAMA_CPP_DIR,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
            )
            self.current_model_id = model_id
            self._running = True

            if self._wait_for_server(timeout=120):
                print(f"[ModelManager] {model_id} جاهز على http://127.0.0.1:{self.port}")
                self._monitor_thread = threading.Thread(target=self._monitor_process, daemon=True)
                self._monitor_thread.start()
                return True
            else:
                print(f"[ModelManager] {model_id} لم يشتغل خلال المهلة")
                self.unload_model()
                return False

        except Exception as e:
            print(f"[ModelManager] فشل تشغيل {model_id}: {e}")
            self.unload_model()
            return False

    def _load_ollama_model(self, model_id: str, cfg) -> bool:
        """Load model via Ollama if available."""
        from urllib.request import Request

        if not self._check_ollama():
            print(f"[ModelManager] Ollama غير شغال على port 11434")
            print(f"[ModelManager] شغّل: ollama serve")
            return False

        ollama_model = cfg["ollama_model"]
        self.port = cfg["port"]
        self.current_model_id = model_id

        # Check if model exists in Ollama
        try:
            req = Request(f"http://127.0.0.1:{self.port}/api/show")
            req.add_header("Content-Type", "application/json")
            resp = urlopen(req, data=json.dumps({"name": ollama_model}).encode(), timeout=5)
            if resp.status == 200:
                print(f"[ModelManager] نموذج Ollama {ollama_model} موجود بالفعل")
        except:
            print(f"[ModelManager] نموذج Ollama {ollama_model} غير موجود. شغّل: ollama pull {ollama_model}")

        print(f"[ModelManager] Ollama {model_id} جاهز على http://127.0.0.1:{self.port}")
        return True

    def _wait_for_server(self, timeout=120):
        """Wait for server health endpoint to respond."""
        start = time.time()
        url = f"http://127.0.0.1:{self.port}/health"

        while time.time() - start < timeout:
            if self.process and self.process.poll() is not None:
                # Process died
                stderr = self.process.stderr.read().decode('utf-8', errors='replace')[:500] if self.process.stderr else ""
                print(f"[ModelManager] ❌ Server died: {stderr}")
                return False
            try:
                resp = urlopen(url, timeout=2)
                if resp.status == 200:
                    return True
            except (URLError, Exception):
                time.sleep(2)
        return False

    def _monitor_process(self):
        """Monitor the server process in background."""
        while self._running and self.process and self.process.poll() is None:
            time.sleep(5)
        if self._running:
            print(f"[ModelManager] ⚠️  انتهت عملية {self.current_model_id} بشكل غير متوقع")
            self.current_model_id = None
            self.port = None

    def unload_model(self):
        """إيقاف النموذج الحالي."""
        self._running = False
        if self.process:
            print(f"[ModelManager] ⏹️  إيقاف {self.current_model_id}...")
            try:
                if sys.platform == "win32":
                    self.process.terminate()
                    try:
                        self.process.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        self.process.kill()
                        self.process.wait(timeout=5)
                else:
                    self.process.send_signal(signal.SIGTERM)
                    try:
                        self.process.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        self.process.kill()
                        self.process.wait(timeout=5)
            except Exception as e:
                print(f"[ModelManager] خطأ في الإيقاف: {e}")
            finally:
                self.process = None
                self.current_model_id = None
                self.port = None
                print(f"[ModelManager] ✅ تم الإيقاف")

    def get_api_url(self):
        """Get the OpenAI-compatible API URL for the current model."""
        if self.is_ready and self.port:
            return f"http://127.0.0.1:{self.port}/v1"
        return None

    def get_model_name(self):
        """Get the current model's API name for chat completions."""
        if self.current_model_id:
            return MODEL_CONFIGS[self.current_model_id]["model_api_name"]
        return None

    def get_model_config(self):
        """Get full config of currently loaded model."""
        if self.current_model_id:
            return MODEL_CONFIGS[self.current_model_id]
        return None

    def _cleanup(self):
        """Cleanup on exit."""
        self.unload_model()

    def list_available_models(self):
        """List which models have GGUF files downloaded."""
        available = []
        for model_id, cfg in MODEL_CONFIGS.items():
            if os.path.exists(cfg["path"]):
                size_gb = os.path.getsize(cfg["path"]) / (1024 ** 3)
                available.append({
                    "id": model_id,
                    "size_gb": round(size_gb, 1),
                    "port": cfg["port"],
                })
        return available


# Singleton instance
_instance = None


def get_model_manager():
    global _instance
    if _instance is None:
        _instance = LocalModelProvider()
    return _instance


# CLI
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="KING2 Local Model Manager")
    parser.add_argument("model", nargs="?", help="Model ID: gemma or qwen")
    parser.add_argument("--list", action="store_true", help="List available models")
    parser.add_argument("--stop", action="store_true", help="Stop current model")
    args = parser.parse_args()

    mgr = get_model_manager()

    if args.list:
        print("📋 النماذج المتاحة:")
        for m in mgr.list_available_models():
            print(f"  {'✅' if m['id'] == mgr.current_model_id else '  '} {m['id']}: {m['size_gb']}GB (port {m['port']})")
        sys.exit(0)

    if args.stop:
        mgr.unload_model()
        sys.exit(0)

    if args.model:
        success = mgr.load_model(args.model)
        if success:
            print(f"✅ {args.model} جاهز للاستخدام")
            print(f"   API: {mgr.get_api_url()}/chat/completions")
            # Keep running until Ctrl+C
            try:
                while mgr.is_ready:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n⏹️  إيقاف...")
                mgr.unload_model()
        else:
            sys.exit(1)
    else:
        parser.print_help()
