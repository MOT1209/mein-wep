import os
import io
import re
import time
import base64
from datetime import datetime
from typing import Dict, List, Optional

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False
    import sqlite3

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


ENGINEERING_SOURCES = [
    {"name": "LLMDataHub", "url": "https://api.github.com/repos/Zjh-819/LLMDataHub", "description": "تنظيم بيانات النماذج اللغوية", "category": "data"},
    {"name": "BigCode-StarCoder", "url": "https://api.github.com/repos/bigcode-project/starcoder", "description": "خوارزميات كتابة الأكواد المتقدمة", "category": "code"},
    {"name": "Build-Your-Own-X", "url": "https://api.github.com/repos/codecrafters-io/build-your-own-x", "description": "بناء الأنظمة من الصفر", "category": "systems"},
    {"name": "OSS-Research-Data", "url": "https://api.github.com/repos/sboysel/awesome-oss-research-data", "description": "بحث OSS والميتا-بيانات", "category": "research"},
    {"name": "GHTorrent", "url": "https://api.github.com/repos/ghtorrent/ghtorrent.org", "description": "تطور المشاريع البرمجية عالمياً", "category": "evolution"},
    {"name": "Awesome-Python", "url": "https://api.github.com/repos/vinta/awesome-python", "description": "معايير بايثون العالمية", "category": "python"},
    {"name": "Awesome-Go", "url": "https://api.github.com/repos/avelino/awesome-go", "description": "معايير Go العالمية", "category": "go"},
]


class AdminCore:
    """Clean admin engine — reads ALL data directly from PostgreSQL. No memory caching."""

    def __init__(self, shared_conn=None):
        self._shared_conn = shared_conn
        # Handle both raw connections and AdminDB wrappers
        if shared_conn and hasattr(shared_conn, 'conn'):
            # It's an AdminDB wrapper — extract the real connection
            self._conn = shared_conn.conn
            self.is_postgres = getattr(shared_conn, 'is_postgres', False)
        else:
            self._conn = shared_conn
            self.is_postgres = getattr(shared_conn, 'is_postgres', False) if shared_conn else False
        if not self._conn:
            self._connect()

    def _connect(self):
        if self._shared_conn:
            self._conn = self._shared_conn
            self.is_postgres = getattr(self._shared_conn, 'is_postgres', False)
            print(f"[AdminCore] Using shared connection (PostgreSQL={self.is_postgres})")
            return
        db_url = os.environ.get('DATABASE_URL')
        if db_url and HAS_PSYCOPG2:
            try:
                url = db_url
                if 'sslmode' not in url:
                    url += '?sslmode=require'
                self._conn = psycopg2.connect(url, cursor_factory=RealDictCursor, sslmode='require')
                self.is_postgres = True
                print("[AdminCore] Connected to PostgreSQL successfully!")
            except Exception as e:
                print(f"[AdminCore] PostgreSQL connection FAILED: {e}")
                self._conn = None
        if not self._conn:
            base = os.path.dirname(os.path.abspath(__file__))
            db_path = os.path.join(base, "king2_admin.db")
            self._conn = sqlite3.connect(db_path, check_same_thread=False)
            self.is_postgres = False
            print(f"[AdminCore] Falling back to SQLite at: {db_path}")
            self._init_sqlite_tables()

    def _init_sqlite_tables(self):
        c = self._conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS site_stats (
                key_name TEXT PRIMARY KEY,
                int_value INTEGER DEFAULT 0,
                text_value TEXT,
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS kaggle_sync_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sync_date TEXT DEFAULT (datetime('now')),
                topics_processed INTEGER DEFAULT 0,
                algorithms_ingested INTEGER DEFAULT 0,
                datasets_synced INTEGER DEFAULT 0,
                self_corrections INTEGER DEFAULT 0,
                status TEXT DEFAULT 'unknown',
                message TEXT,
                duration_seconds REAL DEFAULT 0
            )
        """)
        self._conn.commit()
        c.close()

    def _cursor(self):
        return self._conn.cursor()

    # ─── GitHub Engineering Sources Ingestion ─────────────────────────────────

    def get_sources_status(self) -> Dict:
        """Returns ingestion status for all engineering sources."""
        sources = []
        for src in ENGINEERING_SOURCES:
            sources.append({
                "name": src["name"],
                "description": src["description"],
                "category": src["category"],
                "status": "pending",
                "ingested": False,
                "files_count": 0,
            })
        if self.is_postgres:
            cur = self._cursor()
            cur.execute("SELECT key_name, int_value, text_value FROM site_stats WHERE key_name LIKE 'source_%'")
            for row in cur.fetchall():
                name = row['key_name'].replace('source_', '')
                for s in sources:
                    if s["name"] == name:
                        s["status"] = "ingested"
                        s["ingested"] = True
                        s["files_count"] = row['int_value']
                        break
            cur.close()
        else:
            cur = self._cursor()
            cur.execute("SELECT key_name, int_value FROM site_stats WHERE key_name LIKE 'source_%'")
            for row in cur.fetchall():
                name = row[0].replace('source_', '')
                for s in sources:
                    if s["name"] == name:
                        s["status"] = "ingested"
                        s["ingested"] = True
                        s["files_count"] = row[1]
                        break
            cur.close()
        total = sum(s.get("files_count", 0) for s in sources)
        ingested_count = sum(1 for s in sources if s.get("ingested"))
        return {
            "sources": sources,
            "total_files": total,
            "total_sources": len(sources),
            "ingested_sources": ingested_count,
            "pending_sources": len(sources) - ingested_count,
        }

    def ingest_github_source(self, source: Dict) -> Dict:
        """Ingest README and key files from a GitHub repo."""
        name = source["name"]
        repo_api = source["url"]
        result = {"name": name, "files_processed": 0, "chunks_ingested": 0, "errors": [], "status": "failed"}

        if not HAS_REQUESTS:
            result["errors"].append("requests library not available")
            return result

        try:
            headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "KING2-AI/1.0"}
            time.sleep(0.5)

            repo_resp = requests.get(repo_api, headers=headers, timeout=15)
            if repo_resp.status_code != 200:
                result["errors"].append(f"GitHub API error: {repo_resp.status_code}")
                return result

            repo_data = repo_resp.json()
            result["repo_stars"] = repo_data.get("stargazers_count", 0)
            result["repo_description"] = repo_data.get("description", "") or source["description"]

            readme_urls = [
                f"https://api.github.com/repos/{source['name']}/readme",
                f"https://raw.githubusercontent.com/{source['name']}/HEAD/README.md",
                f"https://raw.githubusercontent.com/{source['name']}/master/README.md",
            ]

            readme_content = None
            for url in readme_urls:
                try:
                    hdrs = {"User-Agent": "KING2-AI/1.0"}
                    if "api.github" in url:
                        hdrs["Accept"] = "application/vnd.github.v3.raw"
                    rr = requests.get(url, headers=hdrs, timeout=15)
                    if rr.status_code == 200 and len(rr.text) > 50:
                        readme_content = rr.text
                        result["readme_source"] = url.split("/")[-1]
                        break
                except Exception:
                    pass

            if not readme_content:
                readme_content = f"# {name}\n\n{source['description']}\n\nRepository: {repo_api}\n\nStars: {result.get('repo_stars', 0)}\n\n{source.get('description', '')}"

            chunks = self._chunk_text(readme_content, chunk_size=800, overlap=100)
            result["chunks_ingested"] = len(chunks)

            self._save_ingestion_to_db(name, readme_content[:5000], chunks, source)

            cur = self._cursor()
            count_val = len(chunks)
            if self.is_postgres:
                cur.execute("""
                    INSERT INTO site_stats (key_name, int_value, text_value, updated_at)
                    VALUES (%s, %s, %s, NOW())
                    ON CONFLICT (key_name) DO UPDATE SET
                        int_value = %s, text_value = %s, updated_at = NOW()
                """, (f"source_{name}", count_val, f"ingested_{datetime.now().isoformat()}", count_val, f"ingested_{datetime.now().isoformat()}"))
                self._conn.commit()
            else:
                cur.execute("""
                    INSERT OR REPLACE INTO site_stats (key_name, int_value, text_value, updated_at)
                    VALUES (?, ?, ?, datetime('now'))
                """, (f"source_{name}", count_val, f"ingested_{datetime.now().isoformat()}"))
                self._conn.commit()
            cur.close()

            result["files_processed"] = 1
            result["status"] = "success"
            print(f"[AdminCore] Ingested {name}: {len(chunks)} chunks")

        except Exception as e:
            result["errors"].append(str(e)[:200])
            print(f"[AdminCore] Ingest error for {name}: {e}")

        return result

    def _chunk_text(self, text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
        text = re.sub(r'\r\n', '\n', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            start += chunk_size - overlap
        return chunks

    def _save_ingestion_to_db(self, source_name: str, summary: str, chunks: List[str], source_meta: Dict):
        """Save ingested content to chat_history table."""
        try:
            cur = self._cursor()
            kb_table = "knowledge_base" if self._table_exists("knowledge_base") else "chat_history"

            if kb_table == "knowledge_base":
                for i, chunk in enumerate(chunks):
                    if self.is_postgres:
                        cur.execute("""
                            INSERT INTO knowledge_base (title, content, source, importance, created_at)
                            VALUES (%s, %s, %s, %s, NOW())
                        """, (f"[{source_meta['category'].upper()}] {source_name} — Part {i+1}", chunk[:500], f"github:{source_name}", 7))
                    else:
                        cur.execute("""
                            INSERT INTO knowledge_base (title, content, source, importance, created_at)
                            VALUES (?, ?, ?, ?, datetime('now'))
                        """, (f"[{source_meta['category'].upper()}] {source_name} — Part {i+1}", chunk[:500], f"github:{source_name}", 7))
                    self._conn.commit()
            else:
                for i, chunk in enumerate(chunks[:10]):
                    if self.is_postgres:
                        cur.execute("""
                            INSERT INTO chat_history (username, user_message, ai_response, model, timestamp)
                            VALUES (%s, %s, %s, %s, NOW())
                        """, ("king2-engine", f"[INGEST] {source_name} — {chunk[:100]}", chunk[:500], f"github:{source_name}"))
                    else:
                        cur.execute("""
                            INSERT INTO chat_history (username, user_message, ai_response, model, timestamp)
                            VALUES (?, ?, ?, ?, datetime('now'))
                        """, ("king2-engine", f"[INGEST] {source_name} — {chunk[:100]}", chunk[:500], f"github:{source_name}"))
                    self._conn.commit()
            cur.close()
        except Exception as e:
            print(f"[AdminCore] _save_ingestion_to_db error: {e}")

    def _table_exists(self, table_name: str) -> bool:
        try:
            cur = self._cursor()
            if self.is_postgres:
                cur.execute("""
                    SELECT 1 FROM information_schema.tables
                    WHERE table_name = %s AND table_schema = 'public'
                """, (table_name,))
            else:
                cur.execute(
                    "SELECT 1 FROM sqlite_master WHERE type='table' AND name = ?",
                    (table_name,)
                )
            exists = cur.fetchone() is not None
            cur.close()
            return exists
        except Exception:
            return False

    def ingest_all_sources(self) -> List[Dict]:
        results = []
        for src in ENGINEERING_SOURCES:
            print(f"[AdminCore] Ingesting {src['name']}...")
            result = self.ingest_github_source(src)
            results.append(result)
            time.sleep(1)
        return results

    def check_db_health(self) -> Dict:
        health = {"connected": False, "db_type": "None", "tables": [], "error": None}
        try:
            cur = self._cursor()
            if self.is_postgres:
                cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
                health["tables"] = [r['table_name'] for r in cur.fetchall()]
                cur.execute("SELECT 1")
                health["connected"] = True
                health["db_type"] = "PostgreSQL"
            else:
                cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
                health["tables"] = [r[0] for r in cur.fetchall()]
                cur.execute("SELECT 1")
                health["connected"] = True
                health["db_type"] = "SQLite"
            cur.close()
        except Exception as e:
            health["error"] = str(e)
            print(f"[AdminCore] check_db_health error: {e}")
            try:
                self._conn.rollback()
            except:
                pass
        return health

    def _ensure_tables(self):
        cur = self._cursor()
        if self.is_postgres:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS chat_history (
                    id SERIAL PRIMARY KEY,
                    username TEXT DEFAULT 'anonymous',
                    user_message TEXT NOT NULL,
                    ai_response TEXT NOT NULL,
                    model TEXT,
                    timestamp TIMESTAMP DEFAULT NOW()
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS knowledge_base (
                    id SERIAL PRIMARY KEY,
                    query TEXT NOT NULL,
                    source TEXT,
                    title TEXT,
                    content TEXT NOT NULL,
                    tags TEXT,
                    importance INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS api_usage (
                    id SERIAL PRIMARY KEY,
                    api_name TEXT NOT NULL,
                    request_count INTEGER DEFAULT 0,
                    total_time REAL DEFAULT 0,
                    last_used TIMESTAMP DEFAULT NOW()
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS site_stats (
                    key_name TEXT PRIMARY KEY,
                    int_value INTEGER DEFAULT 0,
                    text_value TEXT,
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS kaggle_sync_logs (
                    id SERIAL PRIMARY KEY,
                    sync_date TIMESTAMP DEFAULT NOW(),
                    topics_processed INTEGER DEFAULT 0,
                    algorithms_ingested INTEGER DEFAULT 0,
                    datasets_synced INTEGER DEFAULT 0,
                    self_corrections INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'unknown',
                    message TEXT,
                    duration_seconds REAL DEFAULT 0
                )
            """)
        else:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS chat_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT DEFAULT 'anonymous',
                    user_message TEXT NOT NULL,
                    ai_response TEXT NOT NULL,
                    model TEXT,
                    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS knowledge_base (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    query TEXT NOT NULL,
                    source TEXT,
                    title TEXT,
                    content TEXT NOT NULL,
                    tags TEXT,
                    importance INTEGER DEFAULT 1,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS api_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    api_name TEXT NOT NULL UNIQUE,
                    request_count INTEGER DEFAULT 0,
                    total_time REAL DEFAULT 0,
                    last_used TEXT
                )
            """)
        self._conn.commit()
        cur.close()

    def close(self):
        if self._conn:
            self._conn.close()
            self._conn = None


# ─── Singleton instance ────────────────────────────────────────────────────────

_core_instance: Optional[AdminCore] = None


def get_admin_core(shared_conn=None) -> Optional[AdminCore]:
    global _core_instance
    if _core_instance is None or shared_conn is not None:
        try:
            _core_instance = AdminCore(shared_conn=shared_conn)
            _core_instance._ensure_tables()
            print("[AdminCore] Initialized successfully")
        except Exception as e:
            print(f"[AdminCore] Init failed: {e}")
            _core_instance = None
    return _core_instance
