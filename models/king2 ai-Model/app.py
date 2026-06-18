import os, sys, io, json, warnings
warnings.filterwarnings('ignore')
import logging
for _lg in ['kaggle', 'kaggle.api', 'kaggle.api.kaggle_api_extended', 'urllib3', 'urllib3.connectionpool']:
    logging.getLogger(_lg).setLevel(logging.CRITICAL)
    logging.getLogger(_lg).disabled = True

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request, Response, BackgroundTasks, Depends, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse, StreamingResponse
from pydantic import BaseModel
import uvicorn
import time
import re
import base64
import threading
import traceback
import hashlib
import asyncio
import requests
import secrets
from datetime import datetime, timedelta
from typing import Optional
from PIL import Image
from dotenv import load_dotenv
load_dotenv()

# Validate required API keys at startup
REQUIRED_KEYS = ["GEMINI_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "ZAI_API_KEY"]
for key in REQUIRED_KEYS:
    val = os.getenv(key)
    if not val or val == "your_api_key_here":
        print(f"[WARN] {key} is missing or invalid in .env")
    else:
        print(f"[OK] {key} is configured ({val[:8]}...)")

# Gemma 4 and Qwen3.5-9B are local via ModelManager (llama.cpp server)
print("[KING2] Gemma 4 / Qwen3.5-9B (local) via ModelManager (llama.cpp server)")

import bcrypt

from king2_engine import King2Engine
from self_learning import SelfLearningEngine
from supabase_client import get_supabase
from database import Database
try:
    from kaggle_search import KaggleSearch
except (SystemExit, Exception):
    class KaggleSearch:
        def is_available(self): return False
        def search_notebooks(self, *a, **k): return []
        def search_datasets(self, *a, **k): return []
        def extract_keywords(self, *a, **k): return []
from peace_injection import inject_peace_knowledge, verify_injection
try:
    from video_editor import VideoEditor, get_video_editor
except:
    class VideoEditor:
        def __init__(self): pass
    def get_video_editor():
        return None

# Image compression utility
def compress_image(image_bytes, max_size=1200, quality=82):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        if max(img.size) > max_size:
            ratio = max_size / max(img.size)
            new_size = (int(img.width * ratio), int(img.height * ratio))
            img.thumbnail(new_size, Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=quality, optimize=True)
        return buf.getvalue()
    except Exception as e:
        print(f"Compress error: {e}")
        return image_bytes

# Gemini Vision Analysis
def gemini_vision_analyze(image_bytes, prompt=""):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        encoded = base64.b64encode(image_bytes).decode('utf-8')
        model = "gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        system_text = "أنت KING2 لتحليل الصور. أجب بالعربية الفصحى. كن دقيقاً ومفصلاً في الوصف."
        user_text = prompt or "قم بتحليل هذه الصورة باللغة العربية. صف ما تراه بالتفصيل."
        payload = {
            "systemInstruction": {"parts": [{"text": system_text}]},
            "contents": [{"parts": [
                {"text": user_text},
                {"inline_data": {"mime_type": "image/jpeg", "data": encoded}}
            ]}],
            "generationConfig": {"maxOutputTokens": 512, "temperature": 0.4}
        }
        resp = requests.post(url, json=payload, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            if "candidates" in data and data["candidates"]:
                return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"Gemini Vision error: {e}")
    return None

# Qwen3.5-9B Vision Analysis (local via ModelManager)
def qwen_vision_analyze(image_bytes, prompt=""):
    try:
        from model_manager import get_model_manager
        mm = get_model_manager()

        if not mm.load_model("qwen"):
            print("[QWEN VISION] Failed to load qwen via ModelManager")
            return None

        api_url = mm.get_api_url()
        if not api_url:
            return None

        encoded = base64.b64encode(image_bytes).decode('utf-8')
        url = f"{api_url}/chat/completions"
        headers = {"Content-Type": "application/json"}
        user_text = prompt or "قم بتحليل هذه الصورة باللغة العربية. صف ما تراه بالتفصيل."
        payload = {
            "model": mm.get_model_name(),
            "messages": [
                {
                    "role": "system",
                    "content": "أنت KING2 لتحليل الصور. أجب بالعربية الفصحى. كن دقيقاً ومفصلاً في الوصف."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_text},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded}"}}
                    ]
                }
            ],
            "max_tokens": 1024,
            "temperature": 0.4
        }
        resp = requests.post(url, json=payload, headers=headers, timeout=60)
        if resp.status_code == 200:
            data = resp.json()
            if "choices" in data and data["choices"]:
                return data["choices"][0]["message"]["content"]
        else:
            print(f"[QWEN VISION] HTTP {resp.status_code}: {resp.text[:200]}")
    except requests.ConnectionError:
        print("[QWEN VISION] Local server not running")
    except Exception as e:
        print(f"[QWEN VISION] Error: {e}")
    return None

# Image Generation via external API
def generate_image(prompt):
    try:
        url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}?width=1024&height=1024&nofeed=true"
        resp = requests.get(url, timeout=30)
        if resp.status_code == 200:
            filename = f"gen_{int(time.time())}.jpg"
            filepath = os.path.join(UPLOAD_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(resp.content)
            return f"/uploads/{filename}"
    except Exception as e:
        print(f"Generate image error: {e}")
    return None

BASE = os.path.dirname(os.path.abspath(__file__))
FRONTEND = os.path.join(BASE, "frontend")
UPLOAD_DIR = os.path.join(BASE, "uploads")
TEMP_DIR = os.path.join(BASE, "temp_videos")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# ================================================================
# KING2 INTEGRATED IDENTITY SYSTEM - Rashid2010 Only
# ================================================================

RASHID_USERNAME = os.getenv("RASHID_USERNAME", "admin")
RASHID_PASSWORD = os.getenv("RASHID_PASSWORD") or os.getenv("ADMIN_PASSWORD", "")

_rate_limit_store: dict = {}
_rate_lock = threading.Lock()

_session_store: dict = {}
_session_lock = threading.Lock()

if not RASHID_PASSWORD:
    raise ValueError("RASHID_PASSWORD or ADMIN_PASSWORD must be set in .env")
_rashid_password_hash = bcrypt.hashpw(RASHID_PASSWORD.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def _init_rashid_user():
    try:
        db = get_db()
        if db:
            db.init_users_table()
            existing = db.get_user(RASHID_USERNAME)
            if not existing:
                db.create_user(RASHID_USERNAME, _rashid_password_hash, "admin")
                print(f"[KING2] Rashid2010 user created in database")
            else:
                db.create_user(RASHID_USERNAME, _rashid_password_hash, "admin")
                print(f"[KING2] Rashid2010 user updated in database")
    except Exception as e:
        print(f"[KING2] Could not init Rashid user: {e}")

class AuthManager:
    def __init__(self):
        self.blocked_ips: dict = {}
        self.failed_attempts: dict = {}
        self.max_attempts = 5
        self.ban_duration = 3600

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def is_ip_blocked(self, ip: str) -> bool:
        with _rate_lock:
            if ip in self.blocked_ips:
                if time.time() < self.blocked_ips[ip]:
                    return True
                else:
                    del self.blocked_ips[ip]
                    if ip in self.failed_attempts:
                        del self.failed_attempts[ip]
        return False

    def record_failed_attempt(self, ip: str) -> bool:
        with _rate_lock:
            if ip not in self.failed_attempts:
                self.failed_attempts[ip] = {"count": 0, "first_attempt": time.time()}
            self.failed_attempts[ip]["count"] += 1
            attempts = self.failed_attempts[ip]["count"]
            if attempts >= self.max_attempts:
                self.blocked_ips[ip] = time.time() + self.ban_duration
                return True
            return False

    def clear_failed_attempts(self, ip: str):
        with _rate_lock:
            if ip in self.failed_attempts:
                del self.failed_attempts[ip]
            if ip in self.blocked_ips:
                del self.blocked_ips[ip]

    def get_remaining_attempts(self, ip: str) -> int:
        with _rate_lock:
            attempts = self.failed_attempts.get(ip, {}).get("count", 0)
            return max(0, self.max_attempts - attempts)

    def verify_password(self, password: str) -> bool:
        try:
            return bcrypt.checkpw(password.encode('utf-8'), _rashid_password_hash.encode('utf-8'))
        except:
            return False

    def create_session(self) -> str:
        session_token = secrets.token_urlsafe(32)
        with _session_lock:
            _session_store[session_token] = {
                "username": RASHID_USERNAME,
                "created_at": time.time(),
                "ip": None
            }
        return session_token

    def validate_session(self, session_token: str) -> Optional[str]:
        if not session_token:
            print("[Validate] No token provided")
            return None
        with _session_lock:
            if session_token in _session_store:
                session = _session_store[session_token]
                if time.time() - session["created_at"] < 86400:
                    print(f"[Validate] Success: {session['username']}")
                    return session["username"]
                else:
                    print(f"[Validate] Token expired")
                    del _session_store[session_token]
            else:
                print(f"[Validate] Token not found in store")
        return None

    def destroy_session(self, session_token: str):
        with _session_lock:
            if session_token in _session_store:
                del _session_store[session_token]

    def is_rashid(self, username: str) -> bool:
        return username == RASHID_USERNAME

    def create_session_user(self, username: str, role: str = "user") -> str:
        session_token = secrets.token_urlsafe(32)
        with _session_lock:
            _session_store[session_token] = {
                "username": username,
                "role": role,
                "created_at": time.time(),
                "ip": None
            }
        return session_token

_auth_manager = AuthManager()

def _auto_inject_peace():
    try:
        from peace_injection import inject_peace_knowledge
        db = get_db()
        if db:
            print("[KING2] Auto-injecting peace knowledge...")
            result = inject_peace_knowledge(db)
            print(f"[KING2] Peace injection done: {result.get('total', 0)} entries")
    except Exception as e:
        print(f"[KING2] Peace injection skipped: {e}")

def verify_session(request: Request, session_token: Optional[str] = Cookie(None)) -> Optional[str]:
    if not session_token:
        return None
    return _auth_manager.validate_session(session_token)

# ================================================================

app = FastAPI()
_ALLOWED_ORIGINS = [
    "https://alking-ai-king2-f4rr.vercel.app",
    "http://localhost:3000",
    "http://localhost:8001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8001",
    # Cloudflare Tunnel domains (dynamic)
    "https://*.trycloudflare.com",
]
app.add_middleware(CORSMiddleware, allow_origins=_ALLOWED_ORIGINS, allow_origin_regex=r"https://.*\.trycloudflare\.com", allow_methods=["*"], allow_headers=["*"])

import atexit
atexit.register(lambda: print("[KING2] Shutdown complete"))

@app.on_event("startup")
async def _startup():
    """Initialize core services on app startup."""
    _init_rashid_user()

# ================================================================
_engine = None
_learner = None
_admin_db = None
_kb_manager = None
_db = None
_kaggle = None

def get_db():
    global _db
    if _db is None:
        sup = get_supabase()
        if sup and sup.available:
            _db = sup
            print("[Database] Using Supabase")
        else:
            try:
                _db = Database()
                print(f"[Database] Fallback to SQLite: {_db.is_postgres if hasattr(_db, 'is_postgres') else 'unknown'}")
            except Exception as e:
                print(f"[Database] Init error: {e}")
                _db = None
    return _db

def get_engine():
    global _engine
    if _engine is None:
        try:
            from king2_engine import King2Engine
            _engine = King2Engine()
            print(f"Engine loaded, memory: {len(_engine.memory.knowledge)} entries")
        except Exception as e:
            print(f"Engine init error: {e}")
            _engine = None
    return _engine

def get_learner():
    global _learner
    if _learner is None:
        try:
            from self_learning import SelfLearningEngine
            _learner = SelfLearningEngine(memory_path=os.path.join(BASE, "Alking_Memory"))
        except Exception as e:
            print(f"Learner init error: {e}")
            _learner = None
    return _learner

def get_admin_db():
    global _admin_db
    if _admin_db is None:
        try:
            from admin_db import AdminDB
            _admin_db = AdminDB()
            print("Admin DB initialized")
        except Exception as e:
            print(f"Admin DB init error: {e}")
            _admin_db = None
    return _admin_db

def get_admin_core():
    from admin_core import get_admin_core as _get_core
    admin_db_instance = get_admin_db()
    if admin_db_instance and admin_db_instance.conn:
        return _get_core(shared_conn=admin_db_instance)
    return _get_core()

def get_kb_manager():
    global _kb_manager
    if _kb_manager is None:
        try:
            from knowledge_base import KnowledgeBaseManager
            _kb_manager = KnowledgeBaseManager()
            print("Knowledge Base initialized")
        except Exception as e:
            print(f"KB init error: {e}")
            _kb_manager = None
    return _kb_manager

def get_kaggle():
    global _kaggle
    if _kaggle is None:
        try:
            _kaggle = KaggleSearch()
            if _kaggle.is_available():
                print("Kaggle API initialized - Dynamic learning enabled")
            else:
                print("Kaggle API not available - check credentials")
        except Exception as e:
            print(f"Kaggle init error: {e}")
            _kaggle = None
    return _kaggle

def verify_admin_password(password: str) -> bool:
    return _auth_manager.verify_password(password)

if os.path.exists(os.path.join(FRONTEND, "css")):
    app.mount("/css", StaticFiles(directory=os.path.join(FRONTEND, "css")))
if os.path.exists(os.path.join(FRONTEND, "js")):
    app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND, "js")))
if os.path.exists(UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR))

class Msg(BaseModel):
    message: str
    username: str = "anonymous"
    stream: bool = False

@app.get("/about")
async def about_page():
    return FileResponse(os.path.join(BASE, "templates", "about.html"))

@app.get("/")
async def home():
    return FileResponse(os.path.join(FRONTEND, "index.html"))

@app.get("/api/config")
async def api_config():
    return {
        "supabaseUrl": os.getenv("SUPABASE_URL", ""),
        "supabaseAnonKey": os.getenv("SUPABASE_ANON_KEY", ""),
    }

@app.get("/api/keep-alive")
async def keep_alive():
    return {"status": "alive", "timestamp": datetime.now().isoformat()}

@app.get("/stats")
async def stats():
    engine = get_engine()
    kb = get_kb_manager()
    try:
        db_count = engine.db.count() if engine and engine.db else 0
    except:
        db_count = 0
    return {
        "memory_entries": db_count,
        "image_memory": len(engine.memory.image_memory) if engine else 0,
        "audio_memory": len(engine.memory.audio_memory) if engine else 0,
        "knowledge_base": kb.get_stats() if kb else {},
        "status": "ready",
        "database": "SQLite"
    }

# ===== Kaggle Background Task =====
def background_kaggle_search(query: str, keywords: str, db_instance, kaggle_search):
    """Background task to search Kaggle and store knowledge."""
    try:
        print(f"[Kaggle BG] Searching for: {keywords}")
        
        # Search notebooks
        notebooks = kaggle_search.search_notebooks(keywords, max_results=3)
        
        # Search datasets
        datasets = kaggle_search.search_datasets(keywords, max_results=2)
        
        if not notebooks and not datasets:
            print(f"[Kaggle BG] No results found for: {keywords}")
            return
        
        # Extract code snippets from top notebook
        if notebooks:
            top_nb = notebooks[0]
            snippets = kaggle_search.extract_code_snippets(top_nb['url'])
            
            # Store each notebook as knowledge
            for nb in notebooks:
                content = f"Notebook: {nb['title']}\nAuthor: {nb['author']}\nLanguage: {nb.get('language', 'N/A')}\nVotes: {nb['votes']}"
                if snippets:
                    content += f"\n\nCode snippets:\n" + "\n".join(snippets[:3])
                
                if db_instance:
                    try:
                        db_instance.add_knowledge(
                            query=keywords,
                            source=nb['url'],
                            title=nb['title'],
                            content=content,
                            tags=keywords,
                            importance=nb.get('votes', 1)
                        )
                        print(f"[Kaggle BG] Stored notebook: {nb['title']}")
                    except Exception as e:
                        print(f"[Kaggle BG] Error storing notebook: {e}")
        
        # Store datasets as knowledge
        for ds in datasets:
            content = f"Dataset: {ds['title']}\nAuthor: {ds['author']}\nVotes: {ds['votes']}"
            
            if db_instance:
                try:
                    db_instance.add_knowledge(
                        query=keywords,
                        source=ds['url'],
                        title=ds['title'],
                        content=content,
                        tags=keywords,
                        importance=ds.get('votes', 1)
                    )
                    print(f"[Kaggle BG] Stored dataset: {ds['title']}")
                except Exception as e:
                    print(f"[Kaggle BG] Error storing dataset: {e}")
        
        print(f"[Kaggle BG] Search completed for: {keywords}")
        
    except Exception as e:
        print(f"[Kaggle BG] Error: {e}")

@app.post("/chat")
async def chat(m: Msg, background_tasks: BackgroundTasks):
    import traceback
    start_time = time.time()
    
    if not m.message or not m.message.strip():
        return {"response": "الرجاء إدخال رسالة", "provider": "empty"}
    
    try:
        engine = get_engine()
        learner = get_learner()
        kb = get_kb_manager()
        
        if not engine:
            return {"response": "⚠️ النظام غير جاهز حالياً. يرجى المحاولة لاحقاً.", "provider": "error"}
        
        print(f"[CHAT] Query: {m.message[:50]}...")
        
        # Check existing knowledge first
        db_instance = get_db()
        kaggle_context = ""
        kaggle_search_triggered = False
        
        if db_instance:
            try:
                db_instance.init_knowledge_base()
                existing_knowledge = db_instance.search_knowledge(m.message, limit=3)
                if existing_knowledge:
                    kaggle_context = "\n📚 **معلومات ذات صلة من قاعدة المعرفة:**\n"
                    for item in existing_knowledge:
                        kaggle_context += f"- {item['title']}: {item['content'][:200]}\n"
                    print(f"[Kaggle] Found {len(existing_knowledge)} existing knowledge entries")
            except:
                pass
        
        # Trigger async Kaggle search in background
        kaggle_search = get_kaggle()
        if kaggle_search and kaggle_search.is_available():
            keywords = kaggle_search.extract_keywords(m.message)
            if keywords:
                kaggle_search_triggered = True
                keywords_str = ", ".join(kaggle_search.extract_keywords(m.message)) if kaggle_search else ""
                background_tasks.add_task(
                    background_kaggle_search,
                    query=m.message,
                    keywords=keywords_str,
                    db_instance=db_instance,
                    kaggle_search=kaggle_search
                )
                print(f"[Kaggle] Background search triggered for: {keywords}")
        
        # Build full message with existing knowledge context
        kb_context = kb.get_context_for_prompt() if kb else ""

        universal_domains = {
            "peace": ["سلام", "حرب", "صراع", "نزاع", "سلم", "peace", "war", "conflict", "violence", "عنف", "عدالة", "مساواة", "مؤشر السلام", "حقوق", "tolerance", "تسامح"],
            "science": ["علم", "science", "فيزياء", "chemistry", "biology", "رياضيات", "math", "فلك", "astronomy", "كيمياء", "فيزياء", "طب", "medical"],
            "history": ["تاريخ", "history", "حضارة", "civilization", " empire", "مملكة", "warrior", "ملوك", "古代", "medieval"],
            "tech": ["تقنية", "technology", "كمبيوتر", "computer", "ذكاء", "ai", " artificial", "برمجة", "programming", "software", "hardware"],
            "geo": ["جغرافيا", "geography", "دولة", "country", "عاصمة", "capital", "خريطة", "map", "قارة", "continent", "بحر", "sea", "جبل", "mountain"]
        }
        
        msg_lower = m.message.lower()
        matched_domains = []
        for domain, keywords in universal_domains.items():
            if any(kw in msg_lower for kw in keywords):
                matched_domains.append(domain)
        
        universal_context = ""
        if db_instance and matched_domains:
            for domain in matched_domains[:2]:
                try:
                    domain_knowledge = db_instance.search_knowledge(domain, limit=3)
                    if domain_knowledge:
                        domain_labels = {"peace": "السلام", "science": "العلوم", "history": "التاريخ", "tech": "التقنية", "geo": "الجغرافيا"}
                        universal_context += f"\n📚 **معلومات {domain_labels.get(domain, domain)}:**\n"
                        for item in domain_knowledge:
                            universal_context += f"- {item['title']}: {item['content'][:200]}\n"
                        print(f"[Universal] Found {len(domain_knowledge)} {domain} entries")
                except:
                    pass
        
        combined_context = kaggle_context
        if universal_context:
            combined_context = universal_context + ("\n" + kaggle_context if kaggle_context else "")

        full_message = f"{kb_context}\n{combined_context}\n\nالسؤال: {m.message}" if kb_context or combined_context else m.message
        
        # Check if streaming is requested
        if m.stream:
            async def event_stream():
                full_response = ""
                provider_used = "fallback"
                import asyncio
                loop = asyncio.get_event_loop()
                def sync_stream():
                    nonlocal full_response, provider_used
                    for chunk, prov in engine.get_response_stream(full_message):
                        full_response += chunk
                        provider_used = prov
                    return full_response, provider_used
                full_response, provider_used = await loop.run_in_executor(None, sync_stream)
                response_text = full_response if full_response.strip() else "⚠️ عذراً، لم أتلقى رداً واضحاً."
                response_time = time.time() - start_time
                # Try to save to DB
                try:
                    db_inst = get_db()
                    if db_inst:
                        db_inst.add_chat(
                            username=m.username,
                            user_message=m.message,
                            ai_response=response_text,
                            model=provider_used,
                            api_provider=provider_used,
                            response_time=response_time
                        )
                except Exception as e:
                    print(f"[DB ERROR] Failed to save streaming chat: {e}")
                    
                yield f"data: {json.dumps({'response': response_text, 'provider': provider_used, 'response_time': round(response_time, 3), 'kaggle_search': kaggle_search_triggered})}\n\n"
                yield f"data: [DONE]\n\n"
            
            return StreamingResponse(event_stream(), media_type="text/event-stream",
                                      headers={"Cache-Control": "no-cache", "Connection": "keep-alive"})
        
        # Non-streaming response (existing behavior)
        r, p = engine.get_response(full_message)
        
        if not r or r.strip() == "":
            r = "⚠️ عذراً، لم أتلقى رداً واضحاً. هل يمكنك إعادة الصياغة؟"
        
        response_time = time.time() - start_time
        
        # Save to unified chat_history table
        db_instance = get_db()
        print(f"[DB] Saving chat for user: {m.username}, message: {m.message[:30]}...")
        if db_instance:
            try:
                chat_id = db_instance.add_chat(
                    username=m.username,
                    user_message=m.message,
                    ai_response=r,
                    model=p,
                    api_provider=p,
                    response_time=response_time
                )
                print(f"[DB] Chat saved ID={chat_id} for user {m.username} (Provider={p})")
            except Exception as e:
                print(f"[DATABASE ERROR] Critical failure saving chat: {e}")
        
        return JSONResponse(content={
            "response": r,
            "provider": p,
            "response_time": round(response_time, 3),
            "kaggle_search": kaggle_search_triggered
        })
    except asyncio.TimeoutError:
        print(f"[TIMEOUT] Request timeout for: {m.message[:50]}...")
        return JSONResponse(content={"response": "⏳ جاري التفكير... يرجى الانتظار قليلاً وإعادة المحاولة.", "provider": "timeout"})
    except Exception as e:
        err = traceback.format_exc()
        print(f"[ERROR] {str(e)[:200]}")
        return JSONResponse(content={"response": "👑 عذراً، واجهتني مشكلة تقنية. يرجى المحاولة مرة أخرى، وأنا جاهز للمساعدة!", "provider": "error"})

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...), message: str = Form(""), username: str = Form("anonymous")):
    start_time = time.time()
    image_url = None
    try:
        raw_bytes = await file.read()
        print(f"[Analyze] Received file: {file.filename}, size: {len(raw_bytes)} bytes, content_type: {file.content_type}")

        if not raw_bytes or len(raw_bytes) == 0:
            return JSONResponse(status_code=400, content={"response": "⚠️ الملف فارغ أو لم يتم استلامه بشكل صحيح.", "image_url": None, "provider": "error"})

        if len(raw_bytes) > 10 * 1024 * 1024:
            return JSONResponse(status_code=400, content={"response": "⚠️ الصورة كبيرة جداً. الحد الأقصى 10MB.", "image_url": None, "provider": "error"})

        try:
            img = Image.open(io.BytesIO(raw_bytes))
            img.verify()
            img = Image.open(io.BytesIO(raw_bytes))
            if img.mode not in ('RGB', 'RGBA', 'L'):
                img = img.convert('RGB')
        except Exception as e:
            print(f"[Analyze] PIL open error: {e}")
            return JSONResponse(status_code=400, content={"response": "⚠️ الملف ليس صورة صالحة. تأكد من رفع ملف صورة (JPEG, PNG, GIF).", "image_url": None, "provider": "error"})

        width, height = img.size
        print(f"[Analyze] Image valid: {width}x{height}, mode={img.mode}")

        compressed = compress_image(raw_bytes)
        if not compressed:
            print("[Analyze] Compression failed, using original bytes")
            compressed = raw_bytes

        safe_name = str(file.filename) if file.filename else 'image'
        filename = f"img_{int(time.time())}_{re.sub(r'[^a-zA-Z0-9._-]', '_', safe_name)}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        save_img = img.copy()
        save_img.thumbnail((1920, 1920), Image.LANCZOS)
        save_img.save(filepath, format='JPEG', quality=88, optimize=True)
        image_url = f"/uploads/{filename}"
        print(f"[Analyze] Image saved: {image_url}")

        vision_prompt = message.strip() if message.strip() else "قم بتحليل هذه الصورة باللغة العربية. صف ما تراه بالتفصيل."

        # Try Qwen local vision first, then Gemini API, then engine fallback
        ai_analysis = qwen_vision_analyze(compressed, vision_prompt)
        provider_used = "qwen-vision"

        if not ai_analysis:
            ai_analysis = gemini_vision_analyze(compressed, vision_prompt)
            provider_used = "gemini-vision"

        if not ai_analysis:
            engine = get_engine()
            if engine:
                try:
                    ai_analysis, p = engine.get_response(vision_prompt)
                    provider_used = p
                except Exception as e:
                    print(f"[Analyze] Engine fallback error: {e}")

        result_text = f"👑 **رؤية الملك - تحليل الصورة**\n"
        result_text += f"━━━━━━━━━━━━━━━━━━━━━━\n"
        result_text += f"📐 الأبعاد: {width} × {height} بكسل\n"

        if ai_analysis:
            result_text += f"\n🔍 **التحليل:**\n{ai_analysis}"
        else:
            result_text += "\n⚠️ تعذر تحليل محتوى الصورة حالياً. تأكد من إعداد GEMINI_API_KEY."

        kb = get_kb_manager()
        if ai_analysis and len(ai_analysis) > 20 and kb:
            try:
                kb.add_knowledge(f"[IMAGE] {message or filename}", f"وصف الصورة: {ai_analysis[:300]}", importance=3)
            except:
                pass

        response_time = time.time() - start_time

        try:
            core = get_admin_core()
            if core and core.is_postgres:
                cur = core._cursor()
                cur.execute("""
                    INSERT INTO api_usage (api_name, request_count, total_time, last_used)
                    VALUES (%s, 1, %s, NOW())
                    ON CONFLICT (api_name) DO UPDATE SET
                        request_count = api_usage.request_count + 1,
                        total_time = api_usage.total_time + %s,
                        last_used = NOW()
                """, (f"vision-{provider_used}", response_time, response_time))
                core._conn.commit()
                cur.close()
        except Exception as e:
            print(f"[AdminCore] Vision event log error: {e}")
        try:
            db_instance = get_db()
            if db_instance:
                db_instance.add_chat(username, f"[IMAGE] {message or filename}", result_text[:500], provider_used)
                print(f"[DB] Vision chat saved to chat_history")
        except Exception as e:
            print(f"[CRITICAL] Database vision save FAILED: {e}")

        print(f"[Analyze] Done: {response_time:.2f}s, analysis={'OK' if ai_analysis else 'FAILED'}")
        return JSONResponse(content={
            "response": result_text,
            "image_url": image_url,
            "provider": provider_used,
            "response_time": round(response_time, 3)
        })

    except Exception as e:
        err = traceback.format_exc()
        print(f"[Analyze] Fatal error: {e}\n{err[:300]}")
        return JSONResponse(status_code=500, content={
            "response": "⚠️ حدث خطأ أثناء تحليل الصورة. تأكد من أن الملف صورة صالحة.",
            "image_url": image_url,
            "provider": "error"
        })

@app.post("/generate-image")
async def create_image(prompt: str = Form(""), username: str = Form("anonymous")):
    if not prompt or not prompt.strip():
        return {"response": "⚠️ الرجاء كتابة وصف للصورة التي تريد生成ها.", "provider": "error"}
    try:
        start_time = time.time()
        image_url = generate_image(prompt.strip())
        if image_url:
            response_text = f"🎨 **تم إنشاء الصورة بنجاح!**\n\n📝 **الوصف:** {prompt}\n\n⬇️ يمكنك النقر على الصورة لرؤيتها بالحجم الكامل."
            admin_db = get_admin_db()
            if admin_db:
                try:
                    admin_db.add_conversation(username, f"[DRAW] {prompt}", response_text[:500], "image-generation", time.time()-start_time)
                except:
                    pass
            return {
                "response": response_text,
                "image_url": image_url,
                "provider": "image-generation"
            }
        return {"response": "⚠️ تعذر إنشاء الصورة حالياً. حاول مرة أخرى لاحقاً.", "provider": "error"}
    except Exception as e:
        print(f"Generate error: {e}")
        return {"response": "⚠️ حدث خطأ أثناء إنشاء الصورة.", "provider": "error"}

@app.post("/register")
async def register_v1(request: Request):
    print("[Register v1] /register called")
    return await register(request)

@app.post("/api/register")
async def register_api(request: Request):
    print("[Register API] /api/register called")
    return await register(request)

@app.post("/auth/register")
async def register(request: Request):
    import traceback
    try:
        data = await request.json()
        username = data.get("username", "").strip()
        password = data.get("password", "")
        
        print(f"[Register] Attempting: {username}")
        
        if not username or len(username) < 3:
            return JSONResponse(content={"success": False, "error": "اسم المستخدم 3 أحرف على الأقل"}, status_code=400)
        if not password or len(password) < 4:
            return JSONResponse(content={"success": False, "error": "كلمة المرور 4 أحرف على الأقل"}, status_code=400)
        if len(username) > 30:
            return JSONResponse(content={"success": False, "error": "اسم المستخدم طويل جداً"}, status_code=400)
        if username.lower() == RASHID_USERNAME.lower():
            return JSONResponse(content={"success": False, "error": "هذا الاسم محجوز"}, status_code=400)
        
        db = get_db()
        if not db or not db.conn:
            print("[Register] DB connection failed")
            return JSONResponse(content={"success": False, "error": "قاعدة البيانات غير متصلة"}, status_code=500)
        
        print(f"[Register] DB OK, is_postgres={db.is_postgres}")
        
        try:
            existing = db.get_user(username)
        except Exception as e:
            print(f"[Register] get_user error: {e}")
            existing = None
        
        if existing:
            return JSONResponse(content={"success": False, "error": "اسم المستخدم موجود"}, status_code=400)
        
        pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_id = db.create_user(username, pw_hash, "user")
        
        if user_id:
            print(f"[Register] SUCCESS: {username} (ID: {user_id})")
            return JSONResponse(content={"success": True, "message": "تم إنشاء الحساب بنجاح!"})
        else:
            print("[Register] FAILED: create_user returned 0")
            return JSONResponse(content={"success": False, "error": "فشل في إنشاء الحساب"}, status_code=500)
            
    except Exception as e:
        print(f"[Register] Error: {e}")
        print(traceback.format_exc())
        return JSONResponse(content={"success": False, "error": f"خطأ: {str(e)}"}, status_code=500)

@app.post("/auth/login")
async def auth_login(request: Request, response: Response):
    client_ip = _auth_manager._get_client_ip(request)
    
    if _auth_manager.is_ip_blocked(client_ip):
        remaining = max(0, int(_auth_manager.blocked_ips.get(client_ip, 0) - time.time()))
        return JSONResponse(status_code=429, content={"success": False, "error": f"تم حظر IP. انتظر {remaining} ثانية.", "blocked": True})
    
    try:
        body = await request.json()
        username = body.get("username", "").strip()
        password = body.get("password", "")
    except:
        return JSONResponse(status_code=400, content={"success": False, "error": "طلب غير صالح"})
    
    if not username or not password:
        return JSONResponse(status_code=400, content={"success": False, "error": "أدخل اسم المستخدم وكلمة المرور"})
    
    if username.lower() == RASHID_USERNAME.lower():
        if not _auth_manager.verify_password(password):
            is_banned = _auth_manager.record_failed_attempt(client_ip)
            remaining = _auth_manager.get_remaining_attempts(client_ip)
            if is_banned:
                return JSONResponse(status_code=429, content={"success": False, "error": "تم حظر IP.", "blocked": True})
            return JSONResponse(status_code=401, content={"success": False, "error": f"بيانات خاطئة. المحاولات المتبقية: {remaining}"})
        
        _auth_manager.clear_failed_attempts(client_ip)
        session_token = _auth_manager.create_session()
        print(f"[Login] Created session for Rashid, token={session_token[:20]}...")
        response.set_cookie(key="king_session", value=session_token, httponly=True, max_age=86400, samesite="lax")
        return JSONResponse(content={"success": True, "username": RASHID_USERNAME, "isAdmin": True, "message": "مرحباً بك يا الملك"})
    
    db = get_db()
    user = None
    if db and db.conn:
        try:
            db.init_users_table()
            user = db.get_user(username)
        except Exception as e:
            print(f"[Login] Error getting user: {e}")
    
    password_ok = False
    if user and user.get("password_hash"):
        try:
            password_ok = bcrypt.checkpw(password.encode('utf-8'), user["password_hash"].encode('utf-8'))
        except:
            password_ok = False
    
    if user and password_ok:
        _auth_manager.clear_failed_attempts(client_ip)
        role = user.get("role", "user")
        session_token = _auth_manager.create_session_user(username, role)
        response.set_cookie(key="king_session", value=session_token, httponly=True, max_age=86400, samesite="lax")
        return JSONResponse(content={"success": True, "username": username, "isAdmin": username.lower() == RASHID_USERNAME.lower()})
    
    return JSONResponse(status_code=401, content={"success": False, "error": "بيانات خاطئة"})

@app.post("/auth/logout")
async def auth_logout(request: Request, session_token: Optional[str] = Cookie(None)):
    if session_token:
        _auth_manager.destroy_session(session_token)
    response = JSONResponse(content={"success": True})
    response.delete_cookie("king_session")
    return response

@app.get("/auth/status")
async def auth_status(session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    print(f"[AuthStatus] session_token={session_token[:20] if session_token else None}, username={username}")
    if username:
        return JSONResponse(content={
            "authenticated": True,
            "username": username,
            "isAdmin": username.lower() == RASHID_USERNAME.lower()
        })
    return JSONResponse(content={"authenticated": False})

def _safe_val(row, idx, fallback=None):
    if not row: return fallback
    try: return row[idx] if hasattr(row, '__getitem__') else fallback
    except: return fallback

@app.get("/api/admin/stats")
async def admin_stats(session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    print(f"[AdminStats API] session_token={session_token[:20] if session_token else None}, username={username}, expected={RASHID_USERNAME}")
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    
    db = get_db()
    stats = {"users_count": 0, "messages_count": 0, "knowledge_size": 0, "db_type": "unknown"}
    
    if not db or not db.conn:
        return JSONResponse(content=stats)
    
    try:
        cur = db.conn.cursor()
        cur.execute("SELECT COUNT(*) FROM users")
        stats["users_count"] = _safe_val(cur.fetchone(), 0)
        cur.execute("SELECT COUNT(*) FROM chat_history")
        stats["messages_count"] = _safe_val(cur.fetchone(), 0)
        cur.execute("SELECT COUNT(*) FROM knowledge_base")
        stats["knowledge_size"] = _safe_val(cur.fetchone(), 0)
        stats["db_type"] = "PostgreSQL" if db.is_postgres else "SQLite"
        cur.close()
    except Exception as e:
        print(f"[AdminStats] Error: {e}")
    
    return JSONResponse(content=stats)


@app.get("/api/settings/stats")
async def settings_stats(session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    print(f"[Stats API] session_token={session_token[:20] if session_token else None}, username={username}, expected={RASHID_USERNAME}")
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    
    db = get_db()
    stats = {"total_messages": 0, "total_users": 0, "kb_size": 0, "total_api_calls": 0, "avg_response_time": 0.0}
    if not db:
        stats["db_connected"] = False
        return JSONResponse(content=stats)
    
    try:
        db.init_knowledge_base()
        cur = db.conn.cursor()
        
        try:
            cur.execute("SELECT COUNT(*) FROM chat_history")
            stats["total_messages"] = _safe_val(cur.fetchone(), 0)
        except Exception as e:
            print(f"[Stats] chat_history query error: {e}")
        
        try:
            cur.execute("SELECT COUNT(DISTINCT username) FROM chat_history")
            stats["total_users"] = _safe_val(cur.fetchone(), 0)
        except Exception as e:
            print(f"[Stats] users query error: {e}")
        
        try:
            cur.execute("SELECT COUNT(*) FROM knowledge_base")
            stats["kb_size"] = _safe_val(cur.fetchone(), 0)
        except Exception as e:
            print(f"[Stats] knowledge_base query error: {e}")
            try:
                db.conn.rollback()
            except:
                pass
        
        cur.close()
        stats["db_connected"] = True
    except Exception as e:
        print(f"[Settings] Stats error: {e}")
        stats["db_connected"] = False
    
    return JSONResponse(content=stats)

@app.get("/api/settings/chats")
async def settings_chats(limit: int = 20, offset: int = 0, search: str = "", session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    print(f"[Chats API] session_token={session_token[:20] if session_token else None}, username={username}, expected={RASHID_USERNAME}")
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    
    db = get_db()
    result = {"chats": [], "total": 0}
    if not db or not db.conn:
        return JSONResponse(content=result)
    
    try:
        cur = db.conn.cursor()
        if search:
            sp = f"%{search}%"
            if db.is_postgres:
                cur.execute("SELECT COUNT(*) FROM chat_history WHERE user_message ILIKE %s OR ai_response ILIKE %s", (sp, sp))
            else:
                cur.execute("SELECT COUNT(*) FROM chat_history WHERE user_message LIKE ? OR ai_response LIKE ?", (sp, sp))
        else:
            cur.execute("SELECT COUNT(*) FROM chat_history")
        result["total"] = _safe_val(cur.fetchone(), 0)
        
        if search:
            sp = f"%{search}%"
            if db.is_postgres:
                cur.execute("SELECT id, username, user_message, ai_response, model, api_provider, response_time, timestamp FROM chat_history WHERE user_message ILIKE %s OR ai_response ILIKE %s ORDER BY id DESC LIMIT %s OFFSET %s", (sp, sp, limit, offset))
            else:
                cur.execute("SELECT id, username, user_message, ai_response, model, api_provider, response_time, timestamp FROM chat_history WHERE user_message LIKE ? OR ai_response LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?", (sp, sp, limit, offset))
        else:
            if db.is_postgres:
                cur.execute("SELECT id, username, user_message, ai_response, model, api_provider, response_time, timestamp FROM chat_history ORDER BY id DESC LIMIT %s OFFSET %s", (limit, offset))
            else:
                cur.execute("SELECT id, username, user_message, ai_response, model, api_provider, response_time, timestamp FROM chat_history ORDER BY id DESC LIMIT ? OFFSET ?", (limit, offset))
        
        for r in cur.fetchall():
            result["chats"].append({
                "id": _safe_val(r, 0),
                "username": _safe_val(r, 1, "مستخدم"),
                "user_message": _safe_val(r, 2, ""),
                "ai_response": _safe_val(r, 3, ""),
                "model": _safe_val(r, 4, ""),
                "api_provider": _safe_val(r, 5, ""),
                "response_time": _safe_val(r, 6, 0),
                "timestamp": str(_safe_val(r, 7, ""))
            })
        cur.close()
    except Exception as e:
        print(f"[Settings] Chats error: {e}")
    return JSONResponse(content=result)

@app.get("/api/settings/kaggle")
async def settings_kaggle(session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    print(f"[Kaggle API] session_token={session_token[:20] if session_token else None}, username={username}, expected={RASHID_USERNAME}")
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    return {
        "last_sync": _kaggle_sync_state.get("last_sync"),
        "notebooks_synced": _kaggle_sync_state.get("notebooks_synced", 0),
        "datasets_synced": _kaggle_sync_state.get("datasets_synced", 0),
        "algorithms_ingested": _kaggle_sync_state.get("algorithms_ingested", 0),
        "training_phase": _kaggle_sync_state.get("training_phase", "idle"),
        "self_corrections": _kaggle_sync_state.get("self_corrections", 0),
        "kaggle_available": get_kaggle().is_available() if get_kaggle() else False
    }

@app.get("/api/settings/db-health")
async def settings_db_health(session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    print(f"[DBHealth API] session_token={session_token[:20] if session_token else None}, username={username}, expected={RASHID_USERNAME}")
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    db = get_db()
    if not db or not db.conn:
        return {"connected": False}
    return {"connected": True, "db_type": "PostgreSQL" if db.is_postgres else "SQLite"}

@app.post("/api/admin/inject-universal")
async def inject_universal_knowledge(session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    
    db = get_db()
    if not db:
        return JSONResponse(content={"success": False, "error": "قاعدة البيانات غير متوفرة"})
    
    db.init_knowledge_base()
    injected_count = 0
    
    universal_knowledge = [
        {"query": "science", "title": "الفيزياء - Physics", "content": "الفيزياء دراسة المادة والطاقة والتفاعلات بينهما. تشمل المجالات: الميكانيكا، الكهرومغناطيسية، الفيزياء الذرية، الفيزياء النووية.", "tags": "science,physics,فيزياء", "importance": 5},
        {"query": "science", "title": "الكيمياء - Chemistry", "content": "الكيمياء علم دراسة المادة وتكوينها وبنيتها وخواصها والتحولات التي تطرأ عليها. تشمل: الكيمياء العضوية وغير العضوية والفيزيائية.", "tags": "science,chemistry,كيمياء", "importance": 5},
        {"query": "science", "title": "الرياضيات - Mathematics", "content": "الرياضيات علم دراسة الأعداد والبنيات والفضاء والتغيير. تشمل: الجبر، الهندسة، التحليل، نظرية الأعداد، الإحصاء.", "tags": "science,math,رياضيات", "importance": 5},
        {"query": "science", "title": "الطب والعلوم الطبية", "content": "الطب علم تشخيص الأمراض وعلاجها والوقاية منها. يشمل: الطب البشري، طب الأسنان، الطب البيطري، الصيدلة.", "tags": "science,medicine,طب", "importance": 5},
        {"query": "history", "title": "التاريخ العالمي", "content": "التاريخ دراسة الماضي البشري والحضارات. يشمل: العصور القديمة، medieval، الحديث والمعاصر. طرق الدراسة: الآثار، الوثائق، الروايات.", "tags": "history,تاريخ,حضارة", "importance": 5},
        {"query": "history", "title": "الحضارات القديمة", "content": "الحضارات القديمة: المصرية، اليونانية، الرومانية، الصينية، الهندية، بلاد ما بين النهرين.推动了التقدم الإنساني.", "tags": "history,civilization,حضارة", "importance": 5},
        {"query": "tech", "title": "الذكاء الاصطناعي", "content": "الذكاء الاصطناعي (AI) مجال في علوم الحاسوب يهدف إلى إنشاء آلات ذكية. يشمل: التعلم الآلي، الشبكات العصبية، معالجة اللغة الطبيعية.", "tags": "tech,ai,ذكاء اصطناعي", "importance": 5},
        {"query": "tech", "title": "البرمجة وتطوير البرمجيات", "content": "البرمجة كتابة أوامر للحاسوب بلغة مفهومة. لغات البرمجة: Python, JavaScript, Java, C++, Ruby. منهجيات: Agile, Scrum.", "tags": "tech,programming,برمجة", "importance": 5},
        {"query": "geo", "title": "الجغرافيا العامة", "content": "الجغرافيا دراسة سطح الأرض ومناخها ومواردها وتوزيع السكان. تشمل: الجغرافيا الطبيعية (جبال، أنهار، صحارى) والجغرافيا البشرية.", "tags": "geography,جغرافيا", "importance": 5},
        {"query": "geo", "title": "القارات والدول", "content": "القارات السبع: آسيا، أفريقيا، أمريكا الشمالية، أمريكا الجنوبية، القارة القطبية الجنوبية، أوروبا، أستراليا. 每个قارة特点是.", "tags": "geography,continent,قارة", "importance": 5},
        {"query": "peace", "title": "مؤشر السلام العالمي", "content": "مؤشر السلام العالمي (GFP) يقيس مستوى السلام في countries. يعتمد على: غياب العنف، militarization، safety. Denmark و Iceland من most peaceful.", "tags": "peace,سلام,سلم", "importance": 5},
        {"query": "peace", "title": "التسامح والتعايش", "content": "التسامح والاحترام المتبادل أساس السلام المجتمعي. يتطلب:_dialogue، understanding،acceptance. education مفتاح لـ tolerance.", "tags": "peace,tolerance,تسامح", "importance": 5},
    ]
    
    for item in universal_knowledge:
        try:
            db.add_knowledge(
                query=item["query"],
                source="KING2 Universal Knowledge Base",
                title=item["title"],
                content=item["content"],
                tags=item["tags"],
                importance=item["importance"]
            )
            injected_count += 1
        except Exception as e:
            print(f"[Inject] Error adding {item['title']}: {e}")
    
    return JSONResponse(content={"success": True, "injected": injected_count, "total": len(universal_knowledge)})

@app.get("/api/admin/knowledge/recent")
async def get_recent_knowledge(session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    
    db = get_db()
    if not db:
        return JSONResponse(content={"knowledge": []})
    
    try:
        db.init_knowledge_base()
        cur = db.conn.cursor()
        
        if db.is_postgres:
            cur.execute("""
                SELECT id, title, source, query, tags, created_at 
                FROM knowledge_base 
                ORDER BY id DESC LIMIT 10
            """)
        else:
            cur.execute("""
                SELECT id, title, source, query, tags, created_at 
                FROM knowledge_base 
                ORDER BY id DESC LIMIT 10
            """)
        
        results = []
        for row in cur.fetchall():
            if db.is_postgres:
                results.append({
                    "id": row["id"],
                    "title": row["title"],
                    "source": row["source"],
                    "query": row["query"],
                    "tags": row["tags"],
                    "created_at": str(row["created_at"])
                })
            else:
                results.append({
                    "id": row[0],
                    "title": row[1],
                    "source": row[2],
                    "query": row[3],
                    "tags": row[4],
                    "created_at": row[5]
                })
        
        cur.close()
        return JSONResponse(content={"knowledge": results, "count": len(results)})
    except Exception as e:
        print(f"[RecentKnowledge] Error: {e}")
        return JSONResponse(content={"knowledge": [], "error": str(e)})


_kaggle_sync_state = {
    "syncing": False,
    "progress": 0,
    "message": "",
    "last_sync": None,
    "notebooks_synced": 0,
    "datasets_synced": 0,
    "algorithms_ingested": 0,
    "training_phase": "idle",
    "self_corrections": 0
}

_peace_injection_state = {
    "injecting": False,
    "total": 0,
    "text_entries": 0,
    "csv_entries": 0,
    "errors": [],
    "last_injection": None,
    "status": "idle"
}

# ================================================================
# OLD ROUTES - Redirect to home
# ================================================================

@app.get("/admin")
@app.get("/admin_king")
@app.get("/admin/dashboard")
@app.get("/admin/conversations")
async def old_routes_redirect():
    return HTMLResponse("<script>window.location.href='/';</script>")

@app.post("/admin/auth")
async def old_admin_login(request: Request):
    return JSONResponse(status_code=404, content={"error": "تم تعطيل المسار القديم. استخدم /auth/login"})

# ================================================================
# VIDEO EDITOR API (King Montage Engine)
# ================================================================

_video_editor_instance = None

def get_ve():
    global _video_editor_instance
    if _video_editor_instance is None:
        ve = get_video_editor()
        if ve:
            _video_editor_instance = ve
    return _video_editor_instance

@app.post("/api/video/create-project")
async def video_create_project(name: str = Form(""), session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    print(f"[VideoCreate API] session_token={session_token[:20] if session_token else None}, username={username}, expected={RASHID_USERNAME}")
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    
    ve = get_ve()
    if not ve:
        return JSONResponse(content={"error": "محرر الفيديو غير متوفر"})
    
    project = ve.create_project(name)
    return JSONResponse(content={"success": True, "project": project})

@app.post("/api/video/add-video")
async def video_add_video(file: UploadFile = File(...), session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    print(f"[VideoAdd API] session_token={session_token[:20] if session_token else None}, username={username}, expected={RASHID_USERNAME}")
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    
    temp_path = os.path.join(TEMP_DIR, f"upload_{int(time.time())}_{file.filename}")
    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    ve = get_ve()
    if not ve:
        return JSONResponse(content={"error": "محرر الفيديو غير متوفر"})
    
    result = ve.add_video(temp_path)
    return JSONResponse(content={"success": True, "video": result})

@app.get("/api/video/status")
async def video_status(session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    print(f"[VideoStatus API] session_token={session_token[:20] if session_token else None}, username={username}, expected={RASHID_USERNAME}")
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    
    ve = get_ve()
    if not ve:
        return JSONResponse(content={"status": "unavailable"})
    
    return JSONResponse(content=ve.get_project_status())

@app.post("/api/video/detect-scenes")
async def video_detect_scenes(video_path: str = Form(""), session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    print(f"[VideoDetect API] session_token={session_token[:20] if session_token else None}, username={username}, expected={RASHID_USERNAME}")
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    
    from video_editor import SceneDetector
    detector = SceneDetector()
    scenes = detector.detect_scenes(video_path)
    return JSONResponse(content={"scenes": scenes, "count": len(scenes)})

@app.post("/api/video/generate-montage")
async def video_generate_montage(videos: str = Form(""), music: str = Form(""), session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    print(f"[VideoMontage API] session_token={session_token[:20] if session_token else None}, username={username}, expected={RASHID_USERNAME}")
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    
    try:
        video_paths = videos.split(",") if videos else []
        music_path = music if music else None
        
        from video_editor import SmartMontageEngine
        engine = SmartMontageEngine()
        montage_map = engine.generate_montage_map(video_paths, music_path)
        
        return JSONResponse(content={"success": True, "montage": montage_map})
    except Exception as e:
        print(f"[MontageGen] Error: {e}")
        return JSONResponse(content={"success": False, "error": str(e)})

@app.get("/api/video/export-edl")
async def video_export_edl(session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    print(f"[VideoEDL API] session_token={session_token[:20] if session_token else None}, username={username}, expected={RASHID_USERNAME}")
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    
    return JSONResponse(content={"edl": "Export ready - use generate-montage first"})

# ================================================================
# SUPABASE AUTH
# ================================================================

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

@app.get("/auth/callback")
async def auth_callback_page():
    html_path = os.path.join(FRONTEND, "auth-callback.html")
    if os.path.exists(html_path):
        return FileResponse(html_path)
    return HTMLResponse("<script>window.location.href='/';</script>")

@app.post("/auth/supabase")
async def auth_supabase(request: Request, response: Response):
    try:
        body = await request.json()
        access_token = body.get("access_token", "")
        if not access_token:
            return JSONResponse(status_code=400, content={"success": False, "error": "No token"})
        user_resp = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"Authorization": f"Bearer {access_token}", "apikey": SUPABASE_SERVICE_KEY},
            timeout=10,
        )
        if user_resp.status_code != 200:
            return JSONResponse(status_code=401, content={"success": False, "error": "Invalid token"})
        user_data = user_resp.json()
        email = user_data.get("email", "")
        user_id = user_data.get("id", "")
        name = user_data.get("user_metadata", {}).get("full_name", email.split("@")[0] if email else "user")
        username = email.split("@")[0] if email else f"user_{user_id[:8]}"
        username = re.sub(r"[^a-zA-Z0-9_-]", "", username)[:30]
        if not username:
            username = f"user_{user_id[:8]}"
        sup = get_supabase()
        user = None
        if sup and sup.available:
            if email:
                user = sup.get_user(username) or sup.get_user_by_email(email)
            else:
                user = sup.get_user(username)
            if not user:
                import hashlib
                temp_pw = hashlib.sha256(f"supabase:{user_id}:{secrets.token_hex(8)}".encode()).hexdigest()
                pw_hash = bcrypt.hashpw(temp_pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                sup.create_user(username, pw_hash, "user")
        if user:
            username = user.get("username", username)
        session_token = _auth_manager.create_session_user(username, "user")
        resp = JSONResponse(content={"success": True, "username": username})
        resp.set_cookie(key="king_session", value=session_token, httponly=True, max_age=86400, samesite="lax")
        return resp
    except Exception as e:
        print(f"[SupabaseAuth] Error: {e}")
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

# ================================================================
# GOOGLE & GITHUB OAUTH (Direct, for server-side)
# ================================================================

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
_oauth_base = os.getenv("OAUTH_REDIRECT_BASE", "")
if not _oauth_base:
    _oauth_base = os.getenv("RENDER_EXTERNAL_URL", "")
if not _oauth_base:
    _oauth_base = os.getenv("NEXTAUTH_URL", "http://localhost:5000")
OAUTH_REDIRECT_BASE = _oauth_base.rstrip("/")

@app.get("/auth/google")
async def google_login(request: Request):
    if not GOOGLE_CLIENT_ID:
        return HTMLResponse("<script>alert('Google OAuth غير مُعد');window.location.href='/';</script>")
    redirect_uri = f"{OAUTH_REDIRECT_BASE}/auth/google/callback"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    from urllib.parse import urlencode
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url)

@app.get("/auth/google/callback")
async def google_callback(request: Request, response: Response, code: str = ""):
    if not code:
        code = request.query_params.get("code", "")
    if not code:
        return HTMLResponse("<script>alert('فشل تسجيل الدخول بـ Google');window.location.href='/';</script>")
    try:
        redirect_uri = f"{OAUTH_REDIRECT_BASE}/auth/google/callback"
        token_resp = requests.post("https://oauth2.googleapis.com/token", data={
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }, timeout=10)
        if token_resp.status_code != 200:
            print(f"[Google OAuth] Token error: {token_resp.text}")
            return HTMLResponse("<script>alert('فشل الحصول على رمز الدخول');window.location.href='/';</script>")
        access_token = token_resp.json().get("access_token")
        user_resp = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={
            "Authorization": f"Bearer {access_token}"
        }, timeout=10)
        if user_resp.status_code != 200:
            return HTMLResponse("<script>alert('فشل الحصول على معلومات المستخدم');window.location.href='/';</script>")
        user_data = user_resp.json()
        email = user_data.get("email", "")
        name = user_data.get("name", email.split("@")[0])
        return _handle_oauth_user(response, "google", email, name)
    except Exception as e:
        print(f"[Google OAuth] Error: {e}")
        return HTMLResponse(f"<script>alert('خطأ: {str(e)}');window.location.href='/';</script>")

@app.get("/auth/github")
async def github_login(request: Request):
    if not GITHUB_CLIENT_ID:
        return HTMLResponse("<script>alert('GitHub OAuth غير مُعد');window.location.href='/';</script>")
    redirect_uri = f"{OAUTH_REDIRECT_BASE}/auth/github/callback"
    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": "read:user user:email",
    }
    from urllib.parse import urlencode
    url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    return RedirectResponse(url)

@app.get("/auth/github/callback")
async def github_callback(request: Request, response: Response, code: str = ""):
    if not code:
        code = request.query_params.get("code", "")
    if not code:
        return HTMLResponse("<script>alert('فشل تسجيل الدخول بـ GitHub');window.location.href='/';</script>")
    try:
        redirect_uri = f"{OAUTH_REDIRECT_BASE}/auth/github/callback"
        token_resp = requests.post("https://github.com/login/oauth/access_token", data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": redirect_uri,
        }, headers={"Accept": "application/json"}, timeout=10)
        if token_resp.status_code != 200:
            print(f"[GitHub OAuth] Token error: {token_resp.text}")
            return HTMLResponse("<script>alert('فشل الحصول على رمز الدخول');window.location.href='/';</script>")
        access_token = token_resp.json().get("access_token")
        user_resp = requests.get("https://api.github.com/user", headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }, timeout=10)
        if user_resp.status_code != 200:
            return HTMLResponse("<script>alert('فشل الحصول على معلومات المستخدم');window.location.href='/';</script>")
        user_data = user_resp.json()
        login = user_data.get("login", "")
        email = user_data.get("email", "")
        if not email:
            emails_resp = requests.get("https://api.github.com/user/emails", headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            }, timeout=10)
            if emails_resp.status_code == 200:
                emails = emails_resp.json()
                for em in emails:
                    if em.get("primary") and em.get("verified"):
                        email = em.get("email", "")
                        break
                if not email and emails:
                    email = emails[0].get("email", "")
        name = user_data.get("name", login)
        return _handle_oauth_user(response, "github", email or f"{login}@github.user", name)
    except Exception as e:
        print(f"[GitHub OAuth] Error: {e}")
        return HTMLResponse(f"<script>alert('خطأ: {str(e)}');window.location.href='/';</script>")

def _handle_oauth_user(response: Response, provider: str, email: str, name: str):
    username = email.split("@")[0]
    username = re.sub(r"[^a-zA-Z0-9_-]", "", username)[:30]
    if not username:
        username = f"{provider}_user"
    db = get_db()
    user = None
    if db and db.conn:
        try:
            db.init_users_table()
            user = db.get_user(username)
        except:
            pass
    if not user:
        import hashlib
        temp_pw = hashlib.sha256(f"{provider}:{email}:{secrets.token_hex(8)}".encode()).hexdigest()
        pw_hash = bcrypt.hashpw(temp_pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        if db and db.conn:
            try:
                db.create_user(username, pw_hash, "user")
                user = {"username": username, "role": "user"}
            except Exception as e:
                print(f"[OAuth] create_user error: {e}")
    if user:
        session_token = _auth_manager.create_session_user(username, user.get("role", "user"))
        response = RedirectResponse(url="/")
        response.set_cookie(key="king_session", value=session_token, httponly=True, max_age=86400, samesite="lax")
        return response
    return HTMLResponse("<script>alert('فشل إنشاء الحساب');window.location.href='/';</script>")


if __name__ == "__main__":
    import logging
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    import sys
    port = int(os.environ.get('PORT', 5000))
    print("=" * 50)
    print("  KING2 AI Platform v2.0 - Ready")
    print("=" * 50)
    print(f"  Server: http://localhost:{port}")
    print(f"  Dashboard: http://localhost:{port}/admin_king")
    print("  Login: Use ADMIN_USERNAME / ADMIN_PASSWORD env vars")
    print("=" * 50)
    sys.stdout.flush()
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="error")