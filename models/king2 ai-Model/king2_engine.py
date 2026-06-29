import json
import requests
import os
import zipfile
import io
import pandas as pd
import urllib3
from dotenv import load_dotenv
from self_learning import SelfLearningEngine
from datetime import datetime
from knowledge_db import KnowledgeDB

try:
    from skills import load_skills
    _skills_available = True
except ImportError:
    _skills_available = False
    def load_skills():
        return []
from model_manager import get_model_manager

urllib3.disable_warnings()

load_dotenv()

KAGGLE_CONFIG = {
    "username": os.getenv("KAGGLE_USERNAME", ""),
    "key": os.getenv("KAGGLE_KEY", "")
}

_kaggle_session = None

def _get_kaggle_session():
    global _kaggle_session
    if _kaggle_session is None:
        _kaggle_session = requests.Session()
        _kaggle_session.headers.update({'Authorization': f"Token {KAGGLE_CONFIG['key']}"})
    return _kaggle_session

class King2Engine:
    def __init__(self, config_path="api_config.json"):
        self.config_path = config_path
        self.config = self._load_config()
        print("Loading SQLite database...")
        self.db = KnowledgeDB()
        print(f"Database loaded: {self.db.count()} entries")
        
        # Keep old memory for image/audio
        base_dir = os.path.dirname(os.path.abspath(__file__))
        memory_path = os.path.join(base_dir, "Alking_Memory")
        self.memory = SelfLearningEngine(memory_path=memory_path)
        print(f"Memory loaded: {len(self.memory.knowledge)} entries")
        print("Loading skills...")
        self.skills = []
        print("Engine ready")

    def _load_config(self):
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                config = json.load(f)
            # Replace ${ENV_VAR} placeholders with actual environment variables
            def _resolve_env_vars(obj):
                if isinstance(obj, str) and obj.startswith("${") and obj.endswith("}"):
                    env_var = obj[2:-1]
                    return os.getenv(env_var, "")
                elif isinstance(obj, dict):
                    return {k: _resolve_env_vars(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [_resolve_env_vars(v) for v in obj]
                return obj
            return _resolve_env_vars(config)
        except:
            return {"apis": {}, "routing": {}}

    def _get_key(self, provider):
        return os.getenv(f"{provider.upper()}_API_KEY")

    def _get_provider_timeout(self, provider):
        """Get per-provider timeout from config, default 15s."""
        apis = self.config.get("apis", {})
        if provider in apis:
            return apis[provider].get("timeout", 15)
        return 15

    def _call_api(self, provider, message):
        local_providers = ("gemma", "qwen", "king2-qwen", "king2-gemma", "ollama-king2", "ollama-qwen", "ollama-gemma")
        
        if provider not in local_providers:
            api_key = self._get_key(provider)
            if not api_key or api_key == "your_api_key_here":
                print(f"DEBUG: {provider.upper()} API Key is missing or invalid in .env")
                return None
        
        try:
            if provider == "gemini":
                return self._gemini(message)
            elif provider == "groq":
                return self._groq(message)
            elif provider == "openrouter":
                return self._openrouter(message)
            elif provider == "opencode-zen":
                return self._opencode_zen(message)
            elif provider == "gemma":
                return self._gemma(message)
            elif provider == "qwen":
                return self._qwen(message)
            elif provider == "king2-qwen":
                return self._king2_qwen(message)
            elif provider == "king2-gemma":
                return self._king2_gemma(message)
            elif provider == "ollama-king2":
                return self._ollama_generate("king2-arabic", message)
            elif provider == "ollama-qwen":
                return self._ollama_chat("king2-qwen3.5-9b", message)
            elif provider == "ollama-gemma":
                return self._ollama_chat("king2-gemma-4-e4b", message)
            else:
                print(f"DEBUG: Unknown provider {provider}")
                return None
        except requests.exceptions.Timeout:
            print(f"DEBUG: Timeout calling {provider}")
            return None
        except requests.exceptions.ConnectionError as e:
            print(f"DEBUG: Connection error calling {provider}: {str(e)[:100]}")
            return None
        except requests.exceptions.RequestException as e:
            print(f"DEBUG: Request exception calling {provider}: {str(e)[:100]}")
            return None
        except Exception as e:
            print(f"DEBUG: Critical error calling {provider}: {str(e)}")
            return None

    def _call_api_with_retry(self, provider, message):
        """
        Call a single provider with retry logic and exponential backoff.
        Returns (text, provider) on success, or None if all retries fail.
        """
        max_retries = self.config.get("routing", {}).get("retry_count", 2)
        last_error = None
        
        for attempt in range(1, max_retries + 1):
            try:
                result = self._call_api(provider, message)
                if result:
                    return result
                # If result is None but no exception, it might be API key missing
                if attempt == 1:
                    # First attempt might have missing key info already logged
                    pass
            except Exception as e:
                last_error = e
            
            if attempt < max_retries:
                import time
                wait = 0.5 * (2 ** (attempt - 1))  # exponential backoff: 0.5s, 1s, 2s...
                print(f"[RETRY] {provider} attempt {attempt} failed, retrying in {wait:.1f}s")
                time.sleep(wait)
        
        return None

    def get_fallback_chain(self):
        """Build the provider fallback chain from config or default.
        الترتيب: النماذج المحلية → Gemini → Groq → OpenRouter → OpenCode/Zen
        عند فشل أي مزود، ينتقل تلقائياً للمزود التالي."""
        primary = self.config.get("routing", {}).get("primary", "gemini")
        fallback_order = self.config.get("routing", {}).get("fallback_order", [])

        # Check for fine-tuned models first
        has_king2_qwen = self._has_fine_tuned("qwen")
        has_king2_gemma = self._has_fine_tuned("gemma")
        has_ollama = self._check_ollama_running()

        local_models = []
        if has_king2_qwen:
            local_models.append("king2-qwen")
        if has_king2_gemma:
            local_models.append("king2-gemma")
        if self._check_ollama_running():
            local_models.append("ollama-king2")
            local_models.append("ollama-qwen")
            local_models.append("ollama-gemma")

        if not fallback_order:
            fallback_order = ["gemini", "groq", "openrouter", "opencode-zen"]

        # Prioritize: fine-tuned models first, then API fallback
        chain = local_models + fallback_order
        seen = set()
        result = []
        for p in chain:
            if p not in seen:
                seen.add(p)
                result.append(p)
        return result

    def _has_fine_tuned(self, model_type):
        """Check if fine-tuned GGUF model is available."""
        from model_manager import MODEL_CONFIGS
        key = f"king2-{model_type}"
        if key in MODEL_CONFIGS:
            path = MODEL_CONFIGS[key].get("path")
            return path and os.path.exists(path)
        return False

    def _check_ollama_running(self):
        """Check if Ollama is running."""
        try:
            resp = requests.get("http://127.0.0.1:11434/api/tags", timeout=2)
            return resp.status_code == 200
        except:
            pass
        return False

    def _gemini(self, message):
        api_key = self._get_key("gemini")
        if not api_key:
            return None
        model = "gemini-2.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        
        system_instruction = "أنت KING2، مساعد ذكي. أجب بالعربية بشكل مختصر ومفيد."
        
        payload = {
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "contents": [{"parts": [{"text": message}]}],
            "generationConfig": {"maxOutputTokens": 2000, "temperature": 0.7}
        }
        
        timeout = self._get_provider_timeout("gemini")
        resp = requests.post(url, json=payload, timeout=timeout)
        if resp.status_code == 200:
            data = resp.json()
            if "candidates" in data:
                return data["candidates"][0]["content"]["parts"][0]["text"]
        return None

    def _gemini_stream(self, message):
        """Streaming version of Gemini API call. Yields text chunks."""
        api_key = self._get_key("gemini")
        if not api_key:
            return
        model = "gemini-2.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?key={api_key}&alt=sse"
        
        system_instruction = "أنت KING2، مساعد ذكي. أجب بالعربية بشكل مختصر ومفيد."
        
        payload = {
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "contents": [{"parts": [{"text": message}]}],
            "generationConfig": {"maxOutputTokens": 2000, "temperature": 0.7}
        }
        
        timeout = self._get_provider_timeout("gemini")
        resp = requests.post(url, json=payload, timeout=timeout, stream=True)
        if resp.status_code != 200:
            return
        
        for line in resp.iter_lines():
            if line:
                line = line.decode('utf-8').strip()
                if line.startswith('data:') and line != 'data: [DONE]':
                    try:
                        data = json.loads(line[5:])
                        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if text:
                            yield text
                    except json.JSONDecodeError:
                        continue

    def _groq(self, message):
        api_key = self._get_key("groq")
        if not api_key:
            return None
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        
        system_prompt = """أنت KING2، مساعد ذكاء اصطناعي ملكي. أجب بالعربية بشكل واضح ومختصر ومفيد."""
        
        timeout = self._get_provider_timeout("groq")
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": 2000,
            "temperature": 0.7
        }
        
        resp = requests.post(url, headers=headers, json=payload, timeout=timeout)
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"]
        
        # Fallback Groq model if llama-3.3 is not active
        payload["model"] = "mixtral-8x7b-32768"
        resp = requests.post(url, headers=headers, json=payload, timeout=timeout)
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"]
        return None

    def _groq_stream(self, message):
        """Streaming Groq. Yields text chunks."""
        api_key = self._get_key("groq")
        if not api_key:
            return
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        
        system_prompt = "أنت KING2، مساعد ذكي. أجب بالعربية."
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": 2000,
            "temperature": 0.7,
            "stream": True
        }
        
        timeout = self._get_provider_timeout("groq")
        resp = requests.post(url, headers=headers, json=payload, timeout=timeout, stream=True)
        if resp.status_code != 200:
            # Try fallback model
            payload["model"] = "mixtral-8x7b-32768"
            payload["stream"] = True
            resp = requests.post(url, headers=headers, json=payload, timeout=timeout, stream=True)
            if resp.status_code != 200:
                return
        
        for line in resp.iter_lines():
            if line:
                line = line.decode('utf-8').strip()
                if line.startswith('data:') and line != 'data: [DONE]':
                    try:
                        data = json.loads(line[5:])
                        chunk = data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        if chunk:
                            yield chunk
                    except json.JSONDecodeError:
                        continue

    def _openrouter(self, message):
        api_key = self._get_key("openrouter")
        if not api_key:
            return None
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}", 
            "Content-Type": "application/json",
            "HTTP-Referer": "https://alking-ai-king2-f4rr.vercel.app",
            "X-Title": "KING2 AI"
        }
        
        system_prompt = "أنت KING2، مساعد ذكي. أجب بالعربية."
        
        timeout = self._get_provider_timeout("openrouter")
        
        payload = {
            "model": "google/gemini-2.5-flash",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": 2000,
            "temperature": 0.7
        }
        
        resp = requests.post(url, headers=headers, json=payload, timeout=timeout)
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"]
        return None

    def _openrouter_stream(self, message):
        """Streaming OpenRouter. Yields text chunks."""
        api_key = self._get_key("openrouter")
        if not api_key:
            return
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}", 
            "Content-Type": "application/json",
            "HTTP-Referer": "https://alking-ai-king2-f4rr.vercel.app",
            "X-Title": "KING2 AI"
        }
        
        system_prompt = "أنت KING2، مساعد ذكي. أجب بالعربية."
        
        payload = {
            "model": "google/gemini-2.5-flash",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": 2000,
            "temperature": 0.7,
            "stream": True
        }
        
        timeout = self._get_provider_timeout("openrouter")
        resp = requests.post(url, headers=headers, json=payload, timeout=timeout, stream=True)
        if resp.status_code != 200:
            return
        
        for line in resp.iter_lines():
            if line:
                line = line.decode('utf-8').strip()
                if line.startswith('data:') and line != 'data: [DONE]':
                    try:
                        data = json.loads(line[5:])
                        chunk = data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        if chunk:
                            yield chunk
                    except json.JSONDecodeError:
                        continue

    def _opencode_zen(self, message):
        """OpenCode/Zen API - direct chat completion."""
        api_key = self._get_key("opencode")
        if not api_key:
            return None
        url = "https://api.opencode.ai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        
        system_prompt = "أنت KING2، مساعد ذكاء اصطناعي ملكي. أجب بالعربية."
        
        timeout = self._get_provider_timeout("opencode")
        
        payload = {
            "model": "zen",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": 2000,
            "temperature": 0.7
        }
        
        resp = requests.post(url, headers=headers, json=payload, timeout=timeout)
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"]
        return None

    def _opencode_zen_stream(self, message):
        """Streaming OpenCode/Zen API. Yields text chunks."""
        api_key = self._get_key("opencode")
        if not api_key:
            return
        url = "https://api.opencode.ai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        
        system_prompt = "أنت KING2، مساعد ذكي. أجب بالعربية."
        
        payload = {
            "model": "zen",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": 2000,
            "temperature": 0.7,
            "stream": True
        }
        
        timeout = self._get_provider_timeout("opencode")
        resp = requests.post(url, headers=headers, json=payload, timeout=timeout, stream=True)
        if resp.status_code != 200:
            return
        
        for line in resp.iter_lines():
            if line:
                line = line.decode('utf-8').strip()
                if line.startswith('data:') and line != 'data: [DONE]':
                    try:
                        data = json.loads(line[5:])
                        chunk = data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        if chunk:
                            yield chunk
                    except json.JSONDecodeError:
                        continue

    def _king2_qwen(self, message):
        """KING2 Fine-tuned Qwen3.5-9B (local GGUF)"""
        return self._call_local_llama("king2-qwen", message)

    def _king2_gemma(self, message):
        """KING2 Fine-tuned Gemma 4 E4B (local GGUF)"""
        return self._call_local_llama("king2-gemma", message)

    def _call_local_llama(self, model_key, message):
        """Call a local llama.cpp server running a specific model."""
        from model_manager import MODEL_CONFIGS
        cfg = MODEL_CONFIGS.get(model_key)
        if not cfg:
            return None
        port = cfg["port"]
        url = f"http://127.0.0.1:{port}/v1/chat/completions"
        try:
            resp = requests.post(url, json={
                "model": cfg["model_api_name"],
                "messages": [{"role": "user", "content": message}],
                "max_tokens": cfg["max_tokens"],
                "temperature": 0.7,
            }, timeout=60)
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
        except:
            pass
        return None

    def _ollama_chat(self, model_name, message):
        """Call Ollama API for a model."""
        url = "http://127.0.0.1:11434/api/chat"
        try:
            resp = requests.post(url, json={
                "model": model_name,
                "messages": [{"role": "user", "content": message}],
                "stream": False,
                "options": {"temperature": 0.7, "num_ctx": 16384},
            }, timeout=60)
            if resp.status_code == 200:
                return resp.json().get("message", {}).get("content", "")
        except:
            pass
        return None

    def _ollama_generate(self, model_name, message):
        """Call Ollama generate API (more reliable for some models)."""
        url = "http://127.0.0.1:11434/api/generate"
        try:
            resp = requests.post(url, json={
                "model": model_name,
                "prompt": message,
                "stream": False,
                "options": {"temperature": 0.7, "num_ctx": 4096},
            }, timeout=60)
            if resp.status_code == 200:
                return resp.json().get("response", "")
        except:
            pass
        return None

    # --- Streaming versions ---
    def _king2_qwen_stream(self, message):
        yield from self._stream_local_llama("king2-qwen", message)

    def _king2_gemma_stream(self, message):
        yield from self._stream_local_llama("king2-gemma", message)

    def _ollama_stream(self, model_name, message):
        url = "http://127.0.0.1:11434/api/chat"
        try:
            resp = requests.post(url, json={
                "model": model_name,
                "messages": [{"role": "user", "content": message}],
                "stream": True,
                "options": {"temperature": 0.7, "num_ctx": 16384},
            }, stream=True, timeout=60)
            for line in resp.iter_lines():
                if line:
                    try:
                        data = json.loads(line.decode("utf-8"))
                        chunk = data.get("message", {}).get("content", "")
                        if chunk:
                            yield chunk
                    except:
                        continue
        except:
            pass

    def _ollama_stream_generate(self, model_name, message):
        url = "http://127.0.0.1:11434/api/generate"
        try:
            resp = requests.post(url, json={
                "model": model_name,
                "prompt": message,
                "stream": True,
                "options": {"temperature": 0.7, "num_ctx": 4096},
            }, stream=True, timeout=60)
            for line in resp.iter_lines():
                if line:
                    try:
                        data = json.loads(line.decode("utf-8"))
                        chunk = data.get("response", "")
                        if chunk:
                            yield chunk
                    except:
                        continue
        except:
            pass

    def _stream_local_llama(self, model_key, message):
        from model_manager import MODEL_CONFIGS
        cfg = MODEL_CONFIGS.get(model_key)
        if not cfg:
            return
        port = cfg["port"]
        url = f"http://127.0.0.1:{port}/v1/chat/completions"
        try:
            resp = requests.post(url, json={
                "model": cfg["model_api_name"],
                "messages": [{"role": "user", "content": message}],
                "max_tokens": cfg["max_tokens"],
                "temperature": 0.7,
                "stream": True,
            }, stream=True, timeout=60)
            for line in resp.iter_lines():
                if line:
                    line = line.decode("utf-8").strip()
                    if line.startswith("data:") and line != "data: [DONE]":
                        try:
                            data = json.loads(line[5:])
                            chunk = data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if chunk:
                                yield chunk
                        except:
                            continue
        except:
            pass

    def _load_knowledge_context(self, query, max_results=3):
        """Load relevant knowledge from knowledge_base.json for RAG context."""
        try:
            kb_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "knowledge_base.json")
            with open(kb_path, "r", encoding="utf-8") as f:
                kb = json.load(f)
            query_lower = query.lower()
            scored = []
            for entry in kb.get("knowledge", []):
                q = entry.get("question", "").lower()
                a = entry.get("answer", "").lower()
                score = 0
                for word in query_lower.split():
                    if len(word) > 2 and (word in q or word in a):
                        score += 1
                if score > 0:
                    scored.append((score, entry))
            scored.sort(key=lambda x: -x[0])
            top = scored[:max_results]
            if top:
                ctx = "\n--- معرفة KING2 السابقة ---\n"
                for _, entry in top:
                    ctx += f"س: {entry['question']}\nج: {entry['answer'][:300]}\n\n"
                return ctx
        except Exception as e:
            print(f"[RAG] Error: {str(e)[:80]}")
        return ""

    def _gemma_tools(self):
        """Define tools for Gemma 4 native tool calling."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": "البحث في الإنترنت للحصول على معلومات حديثة",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "استعلام البحث"}
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "calculate",
                    "description": "إجراء عملية حسابية (جمع، طرح، ضرب، قسمة، أسس، جذور)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "expression": {"type": "string", "description": "العبارة الرياضية المراد حسابها"}
                        },
                        "required": ["expression"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "kaggle_search",
                    "description": "البحث في Kaggle عن datasets و notebooks",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "موضوع البحث"}
                        },
                        "required": ["query"]
                    }
                }
            }
        ]

    def _gemma_system_prompt(self):
        """Full KING2 system prompt with personality."""
        return """أنت KING2، مساعد الذكاء الاصطناعي الملكي المتطور.

## هويتك
- الاسم: KING2 (الملك الذهبي)
- أنت مساعد ذكي ملكي، فخور بإمكانياتك ولكن متواضع في خدمتك
- طورت لتكون أول منصة ذكاء اصطناعي عربية متكاملة

## قواعد الرد
1. أجب بالعربية الفصحى أولاً دائماً
2. إذا سألك المستخدم بلغة أخرى (English, 中文, ...)، أجب بنفس اللغة
3. كن مختصراً ومفيداً وواضحاً
4. استخدم markdown (عناوين، تنسيق، أكواد) عند الحاجة
5. للمسائل الرياضية: اشرح الخطوات بالتفصيل مع أمثلة
6. للبرمجة: اكتب كوداً نظيفاً مع شرح
7. كن مهذباً ومحترماً
8. إذا سأل عنك: قل "أنا KING2، مساعد ذكاء اصطناعي متطور"

## مجالات خبرتك
- الحساب والرياضيات (جبر، هندسة، إحصاء، تفاضل وتكامل)
- البرمجة (Python, JavaScript, وغيرها)
- التحليل والبحث
- الترجمة بين اللغات
- الكتابة الإبداعية
- تحليل الصور

## أسلوبك
ذكي، سريع، مفيد، مع لمسة ملكية راقية في ردودك"""

    def _load_fine_tuned_adapter(self):
        """Load fine-tuned KING2 LoRA adapter if available."""
        base_dir = os.path.dirname(os.path.abspath(__file__))
        adapter_path = os.path.join(base_dir, "gemma-4-e4b", "lora_adapter")
        if os.path.exists(adapter_path):
            print("[GEMMA] KING2 fine-tuned adapter found!")
            return adapter_path
        return None

    def _gemma(self, message):
        """Call local Gemma 4 with KING2 personality, RAG context, and tool calling."""
        from model_manager import get_model_manager
        mm = get_model_manager()

        # Load or swap to Gemma
        if not mm.load_model("gemma"):
            print("[GEMMA] Failed to load model via ModelManager")
            return None

        api_url = mm.get_api_url()
        if not api_url:
            print("[GEMMA] No API URL available")
            return None

        url = f"{api_url}/chat/completions"
        headers = {"Content-Type": "application/json"}
        timeout = 60

        context = self._load_knowledge_context(message)
        user_msg = message
        if context:
            user_msg = f"{context}\n\nسؤال المستخدم: {message}"

        payload = {
            "model": mm.get_model_name(),
            "messages": [
                {"role": "system", "content": self._gemma_system_prompt()},
                {"role": "user", "content": user_msg}
            ],
            "max_tokens": 4096,
            "temperature": 0.7,
            "tools": self._gemma_tools()
        }
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=timeout)
            if resp.status_code == 200:
                result = resp.json()
                choice = result["choices"][0]
                msg = choice.get("message", {})
                if msg.get("content"):
                    return msg["content"]
                if msg.get("tool_calls"):
                    return self._handle_tool_calls(msg["tool_calls"], message)
                return None
            print(f"[GEMMA] HTTP {resp.status_code}: {resp.text[:200]}")
        except requests.ConnectionError:
            print("[GEMMA] Local server not running")
        except Exception as e:
            print(f"[GEMMA] Error: {str(e)[:100]}")
        return None

    def _handle_tool_calls(self, tool_calls, original_message):
        """Execute tool calls from Gemma 4 and return result."""
        results = []
        for tc in tool_calls:
            func = tc.get("function", {})
            name = func.get("name", "")
            args_str = func.get("arguments", "{}")
            try:
                args = json.loads(args_str) if isinstance(args_str, str) else args_str
            except:
                args = {}
            if name == "calculate":
                expr = args.get("expression", "")
                try:
                    result = eval(expr, {"__builtins__": {}}, {"abs": abs, "round": round, "pow": pow, "min": min, "max": max, "sum": sum, "int": int, "float": float})
                    results.append(f"نتيجة العملية {expr} = {result}")
                except Exception as e:
                    results.append(f"خطأ في الحساب: {str(e)}")
            elif name == "web_search":
                results.append(f"[بحث ويب] تم استلام طلب بحث عن: {args.get('query', '')}")
            elif name == "kaggle_search":
                results.append(f"[Kaggle] تم استلام طلب بحث عن: {args.get('query', '')}")
            else:
                results.append(f"[أداة] {name}: تم التنفيذ")
        return "\n".join(results)

    def _gemma_stream(self, message):
        """Streaming local Gemma 4 with KING2 personality + RAG context."""
        from model_manager import get_model_manager
        mm = get_model_manager()

        if not mm.load_model("gemma"):
            return

        api_url = mm.get_api_url()
        if not api_url:
            return

        url = f"{api_url}/chat/completions"
        headers = {"Content-Type": "application/json"}
        timeout = 60

        context = self._load_knowledge_context(message)
        user_msg = message
        if context:
            user_msg = f"{context}\n\nسؤال المستخدم: {message}"

        payload = {
            "model": mm.get_model_name(),
            "messages": [
                {"role": "system", "content": self._gemma_system_prompt()},
                {"role": "user", "content": user_msg}
            ],
            "max_tokens": 4096,
            "temperature": 0.7,
            "stream": True,
            "tools": self._gemma_tools()
        }
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=timeout, stream=True)
            if resp.status_code != 200:
                print(f"[GEMMA] Stream HTTP {resp.status_code}")
                return
            for line in resp.iter_lines():
                if line:
                    line = line.decode('utf-8').strip()
                    if line.startswith('data:') and line != 'data: [DONE]':
                        try:
                            data = json.loads(line[5:])
                            choices = data.get("choices", [])
                            if choices:
                                delta = choices[0].get("delta", {})
                                if delta.get("content"):
                                    yield delta["content"]
                        except json.JSONDecodeError:
                            continue
        except requests.ConnectionError:
            print("[GEMMA] Local server not running")
        except Exception as e:
            print(f"[GEMMA] Stream error: {str(e)[:100]}")

    def _qwen_tools(self):
        """Define tools for Qwen3.5-9B native tool calling."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": "البحث في الإنترنت للحصول على معلومات حديثة",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "استعلام البحث"}
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "calculate",
                    "description": "إجراء عملية حسابية (جمع، طرح، ضرب، قسمة، أسس، جذور)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "expression": {"type": "string", "description": "العبارة الرياضية المراد حسابها"}
                        },
                        "required": ["expression"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "kaggle_search",
                    "description": "البحث في Kaggle عن datasets و notebooks",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "موضوع البحث"}
                        },
                        "required": ["query"]
                    }
                }
            }
        ]

    def _qwen_system_prompt(self):
        """Full KING2 system prompt for Qwen3.5-9B with personality."""
        return """أنت KING2، مساعد الذكاء الاصطناعي الملكي المتطور 💎

## هويتك
- الاسم: KING2 (الملك الذهبي)
- أنت مساعد ذكي ملكي، مبني على Qwen3.5-9B، فخور بإمكانياتك ولكن متواضع في خدمتك
- طورت لتكون أول منصة ذكاء اصطناعي عربية متكاملة

## قواعد الرد
1. أجب بالعربية الفصحى أولاً دائماً
2. إذا سألك المستخدم بلغة أخرى (English, 中文, ...)، أجب بنفس اللغة
3. كن مختصراً ومفيداً وواضحاً
4. استخدم markdown (عناوين، تنسيق، أكواد) عند الحاجة
5. للمسائل الرياضية: اشرح الخطوات بالتفصيل مع أمثلة
6. للبرمجة: اكتب كوداً نظيفاً مع شرح
7. كن مهذباً ومحترماً
8. إذا سأل عنك: قل "أنا KING2، مساعد ذكاء اصطناعي متطور مبني على Qwen3.5"

## مجالات خبرتك
- الحساب والرياضيات (جبر، هندسة، إحصاء، تفاضل وتكامل)
- البرمجة (Python, JavaScript, وغيرها)
- التحليل والبحث
- الترجمة بين اللغات
- الكتابة الإبداعية
- تحليل الصور والرؤية الحاسوبية
- استخدام الأدوات والبحث في الإنترنت

## أسلوبك
ذكي، سريع، مفيد، مع لمسة ملكية راقية في ردودك"""

    def _load_fine_tuned_adapter_qwen(self):
        """Load fine-tuned KING2 LoRA adapter for Qwen if available."""
        base_dir = os.path.dirname(os.path.abspath(__file__))
        adapter_path = os.path.join(base_dir, "qwen3.5-9b", "lora_adapter")
        if os.path.exists(adapter_path):
            print("[QWEN] KING2 fine-tuned adapter found!")
            return adapter_path
        return None

    def _qwen(self, message):
        """Call local Qwen3.5-9B with KING2 personality, RAG context, and tool calling."""
        from model_manager import get_model_manager
        mm = get_model_manager()

        if not mm.load_model("qwen"):
            print("[QWEN] Failed to load model via ModelManager")
            return None

        api_url = mm.get_api_url()
        if not api_url:
            print("[QWEN] No API URL available")
            return None

        url = f"{api_url}/chat/completions"
        headers = {"Content-Type": "application/json"}
        timeout = 90

        context = self._load_knowledge_context(message)
        user_msg = message
        if context:
            user_msg = f"{context}\n\nسؤال المستخدم: {message}"

        payload = {
            "model": mm.get_model_name(),
            "messages": [
                {"role": "system", "content": self._qwen_system_prompt()},
                {"role": "user", "content": user_msg}
            ],
            "max_tokens": 8192,
            "temperature": 0.7,
            "tools": self._qwen_tools()
        }
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=timeout)
            if resp.status_code == 200:
                result = resp.json()
                choice = result["choices"][0]
                msg = choice.get("message", {})
                if msg.get("content"):
                    return msg["content"]
                if msg.get("tool_calls"):
                    return self._handle_tool_calls(msg["tool_calls"], message)
                return None
            print(f"[QWEN] HTTP {resp.status_code}: {resp.text[:200]}")
        except requests.ConnectionError:
            print("[QWEN] Local server not running")
        except Exception as e:
            print(f"[QWEN] Error: {str(e)[:100]}")
        return None

    def _qwen_stream(self, message):
        """Streaming local Qwen3.5-9B with KING2 personality + RAG context."""
        from model_manager import get_model_manager
        mm = get_model_manager()

        if not mm.load_model("qwen"):
            return

        api_url = mm.get_api_url()
        if not api_url:
            return

        url = f"{api_url}/chat/completions"
        headers = {"Content-Type": "application/json"}
        timeout = 90

        context = self._load_knowledge_context(message)
        user_msg = message
        if context:
            user_msg = f"{context}\n\nسؤال المستخدم: {message}"

        payload = {
            "model": mm.get_model_name(),
            "messages": [
                {"role": "system", "content": self._qwen_system_prompt()},
                {"role": "user", "content": user_msg}
            ],
            "max_tokens": 8192,
            "temperature": 0.7,
            "stream": True,
            "tools": self._qwen_tools()
        }
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=timeout, stream=True)
            if resp.status_code != 200:
                print(f"[QWEN] Stream HTTP {resp.status_code}")
                return
            for line in resp.iter_lines():
                if line:
                    line = line.decode('utf-8').strip()
                    if line.startswith('data:') and line != 'data: [DONE]':
                        try:
                            data = json.loads(line[5:])
                            choices = data.get("choices", [])
                            if choices:
                                delta = choices[0].get("delta", {})
                                if delta.get("content"):
                                    yield delta["content"]
                        except json.JSONDecodeError:
                            continue
        except requests.ConnectionError:
            print("[QWEN] Local server not running")
        except Exception as e:
            print(f"[QWEN] Stream error: {str(e)[:100]}")

    def get_response(self, message, image_data=None):
        import traceback
        message = message.strip()
        if not message:
            return "أهلاً! أنا KING2", "system"
        
        # Check if this is an image-related query
        is_image_query = image_data is not None or "صورة" in message or "image" in message.lower()
        
        try:
            # 1. Fast search in SQLite database (FTS5)
            match, score = self.db.search(message, limit=3)
            
            if match:
                print(f"[DB] Found: {match.get('category', 'unknown')}")
                return f"[من ذاكرة KING2] {match['answer']}", "memory"
        except Exception as e:
            print(f"MEMORY ERROR: {str(e)[:50]}")
        
        # 2. For image analysis, try Gemini vision (via openrouter or native gemini) first
        if is_image_query:
            for provider in ["gemini", "openrouter"]:
                try:
                    result = self._call_api(provider, message)
                    if result:
                        return result, provider
                except Exception as e:
                    print(f"[VISION ERROR] {provider} failed: {str(e)[:50]}")
        
        # 3. Text responses fallback chain with retry (from config)
        fallback_chain = self.get_fallback_chain()
        print(f"[ROUTING] Provider chain: {' → '.join(fallback_chain)}")
        for provider in fallback_chain:
            print(f"[API] Trying {provider}...")
            result = self._call_api_with_retry(provider, message)
            if result:
                print(f"[API SUCCESS] Response returned by provider: {provider}")
                return result, provider
            print(f"[API FAILED] {provider} exhausted, trying next...")
        
        # 4. Ultimate fallback with smart message
        import requests
        return "أعتذر، لا يمكنني الإجابة الآن بسبب مشاكل تقنية. يرجى المحاولة مرة أخرى بعد قليل.\n" \
               "تعذر الوصول إلى المزود الحالي، يتم التبديل تلقائياً...", "fallback"

    def get_response_stream(self, message, image_data=None):
        """
        Streaming version of get_response. Yields (chunk, provider) tuples.
        Uses fallback chain with retry for each provider's streaming method.
        """
        import time
        message = message.strip()
        if not message:
            yield ("أهلاً! أنا KING2", "system")
            return
        
        # Text response fallback chain with streaming
        fallback_chain = self.get_fallback_chain()
        
        stream_methods = {
            "gemini": self._gemini_stream,
            "groq": self._groq_stream,
            "openrouter": self._openrouter_stream,
            "opencode-zen": self._opencode_zen_stream,
            "gemma": self._gemma_stream,
            "qwen": self._qwen_stream,
            "king2-qwen": self._king2_qwen_stream,
            "king2-gemma": self._king2_gemma_stream,
            "ollama-king2": lambda m: self._ollama_stream_generate("king2-arabic", m),
            "ollama-qwen": lambda m: self._ollama_stream("king2-qwen3.5-9b", m),
            "ollama-gemma": lambda m: self._ollama_stream("king2-gemma-4-e4b", m),
        }
        
        for provider in fallback_chain:
            stream_func = stream_methods.get(provider)
            if not stream_func:
                continue
            
            max_retries = self.config.get("routing", {}).get("retry_count", 2)
            
            for attempt in range(1, max_retries + 1):
                try:
                    collected = []
                    for chunk in stream_func(message):
                        collected.append(chunk)
                        yield (chunk, provider)
                    
                    if collected:
                        return  # success, exit the generator
                except Exception as e:
                    print(f"[STREAM ERROR] {provider} attempt {attempt}: {str(e)[:100]}")
                    if attempt < max_retries:
                        time.sleep(0.5 * (2 ** (attempt - 1)))
                    continue
        
        # Ultimate fallback
        yield ("أعتذر، لا يمكنني الإجابة الآن. يرجى التحقق من اتصال API والمحاولة لاحقاً.", "fallback")

    def sync_with_kaggle(self, search_query="medical", max_results=5):
        """جسر Kaggle - سحب البيانات الجديدة وإضافتها للذاكرة"""
        print(f"[KAGGLE] Searching for: {search_query}")
        
        try:
            session = _get_kaggle_session()
            url = f"https://www.kaggle.com/api/v1/datasets/list?search={search_query}&sort_by=hottest&page=1"
            
            resp = session.get(url, timeout=30, verify=True)
            
            if resp.status_code != 200:
                print(f"[KAGGLE] Error: {resp.status_code}")
                return {"status": "error", "message": f"API returned {resp.status_code}"}
            
            datasets = resp.json()
            if not datasets:
                return {"status": "no_data", "message": "No datasets found"}
            
            results = []
            downloaded_count = 0
            
            for dataset in datasets[:max_results]:
                dataset_ref = dataset.get("ref", "")
                title = dataset.get("title", "Unknown")
                print(f"[KAGGLE] Found: {title}")
                
                try:
                    download_url = f"https://www.kaggle.com/api/v1/datasets/download/{dataset_ref}"
                    dl_resp = session.get(download_url, timeout=60, verify=True)
                    
                    if dl_resp.status_code == 200:
                        extracted = self._process_kaggle_data(dl_resp.content, title)
                        if extracted:
                            downloaded_count += 1
                            results.append({"title": title, "entries": len(extracted)})
                except Exception as e:
                    print(f"[KAGGLE] Could not download {title}: {str(e)[:50]}")
                    continue
            
            print(f"[KAGGLE] Downloaded and processed {downloaded_count} datasets")
            return {
                "status": "success",
                "datasets_found": len(datasets),
                "datasets_downloaded": downloaded_count,
                "results": results
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def _process_kaggle_data(self, content, dataset_name):
        """معالجة بيانات Kaggle وإضافتها مباشرة إلى SQLite"""
        try:
            if not content:
                return None
                
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                csv_files = [f for f in z.namelist() if f.endswith('.csv')]
                
                if not csv_files:
                    print(f"[KAGGLE] No CSV files in {dataset_name}")
                    return None
                
                new_entries = []
                for csv_file in csv_files[:2]:
                    try:
                        with z.open(csv_file) as f:
                            df = pd.read_csv(f)
                            
                            for _, row in df.iterrows():
                                question = str(row.iloc[0]) if len(row) > 0 else dataset_name
                                answer = str(row.iloc[1]) if len(row) > 1 else str(row.to_dict())
                                
                                # Save directly to database
                                content = f"Q: {question[:200]}\nA: {answer[:500]}"
                                self.db.add_entry(content, category=f"Kaggle-{dataset_name[:20]}", source="kaggle")
                                new_entries.append(1)
                    except Exception as e:
                        continue
                
                if new_entries:
                    self.memory.knowledge.extend(new_entries)
                    self.memory._save_all()
                    print(f"[KAGGLE] Added {len(new_entries)} entries to memory")
                    return new_entries
                    
        except Exception as e:
            print(f"[KAGGLE] Processing error: {str(e)[:100]}")
            return None
        
        return None

def interactive_chat():
    engine = King2Engine()
    print("="*60)
    print("  KING2 AI - Interactive Chat Session")
    print("="*60)
    print(f"Memory: {len(engine.memory.knowledge)} entries loaded")
    print(f"Skills: {len(engine.skills)} loaded")
    print("="*60)
    print(engine.config.get("king2_personality", {}).get("greeting", "أهلاً! أنا KING2"))
    print("="*60)
    print("اكتب EXIT للإنهاء\n")
    
    while True:
        try:
            user_input = input("\n[أنت]: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit", "خروج"]:
                print("\n[MEMORY] Saving learned knowledge...")
                engine.memory._save_all()
                print("KING2: وداعاً! تشرفني محادثتك. إلى اللقاء!")
                break
            
            response, source = engine.get_response(user_input)
            print(f"\n[KING2] ({source}): {response}")
        except KeyboardInterrupt:
            print("\n\nKING2: إلى اللقاء!")
            break
        except Exception as e:
            print(f"\n[ERROR]: {str(e)}")

if __name__ == "__main__":
    interactive_chat()