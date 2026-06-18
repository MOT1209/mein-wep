import os
from datetime import datetime
from typing import List, Dict, Optional

from dotenv import load_dotenv
load_dotenv()

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False
import sqlite3

class Database:
    def __init__(self, db_url=None):
        if db_url is None:
            db_url = os.environ.get('DATABASE_URL')
        
        print(f"[Database] DATABASE_URL present: {bool(db_url)}")
        print(f"[Database] psycopg2 available: {HAS_PSYCOPG2}")
        
        if db_url and HAS_PSYCOPG2:
            try:
                if 'sslmode' not in db_url:
                    db_url += '?sslmode=require'
                self.conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor, sslmode='require')
                self.is_postgres = True
                print("[Database] PostgreSQL connected!")
            except Exception as e:
                print(f"[Database] PostgreSQL FAILED: {e} — using SQLite")
                self.conn = None
                self.is_postgres = False
        else:
            self.is_postgres = False
            self.conn = None
        
        if not self.conn:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            db_path = os.path.join(base_dir, "chat_history.db")
            self.conn = sqlite3.connect(db_path, check_same_thread=False)
            print(f"[Database] SQLite at: {db_path}")
        
        self._init_table()
    
    def _init_table(self):
        cursor = self.conn.cursor()
        if self.is_postgres:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chat_history (
                    id SERIAL PRIMARY KEY,
                    username TEXT DEFAULT 'anonymous',
                    user_message TEXT NOT NULL,
                    ai_response TEXT NOT NULL,
                    model TEXT,
                    api_provider TEXT,
                    response_time REAL,
                    timestamp TIMESTAMP DEFAULT NOW()
                )
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chat_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT DEFAULT 'anonymous',
                    user_message TEXT NOT NULL,
                    ai_response TEXT NOT NULL,
                    model TEXT,
                    api_provider TEXT,
                    response_time REAL,
                    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
        
        if self.is_postgres:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT NOW(),
                    last_login TIMESTAMP,
                    is_active INTEGER DEFAULT 1
                )
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'user',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    last_login TEXT,
                    is_active INTEGER DEFAULT 1
                )
            """)
        
        self.conn.commit()
        
        # Migration: Add missing columns to existing tables (one by one to avoid transaction issues)
        cursor = self.conn.cursor()
        if self.is_postgres:
            migrations = [
                "ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS api_provider TEXT",
                "ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS response_time REAL",
                "ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS importance INTEGER DEFAULT 1",
                "ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS is_verified INTEGER DEFAULT 0",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP"
            ]
            for sql in migrations:
                try:
                    cursor.execute(sql)
                    self.conn.commit()
                except Exception as e:
                    try:
                        self.conn.rollback()
                    except:
                        pass
                    print(f"[Migration] {sql[:50]}... : {str(e)[:60]}")
        else:
            # SQLite doesn't support ADD COLUMN IF NOT EXISTS easily
            columns = [info[1] for info in cursor.execute("PRAGMA table_info(chat_history)").fetchall()]
            if "api_provider" not in columns:
                cursor.execute("ALTER TABLE chat_history ADD COLUMN api_provider TEXT")
            if "response_time" not in columns:
                cursor.execute("ALTER TABLE chat_history ADD COLUMN response_time REAL")
            
            kb_cols = [info[1] for info in cursor.execute("PRAGMA table_info(knowledge_base)").fetchall()]
            if "importance" not in kb_cols:
                cursor.execute("ALTER TABLE knowledge_base ADD COLUMN importance INTEGER DEFAULT 1")
            if "is_verified" not in kb_cols:
                cursor.execute("ALTER TABLE knowledge_base ADD COLUMN is_verified INTEGER DEFAULT 0")
            
            user_cols = [info[1] for info in cursor.execute("PRAGMA table_info(users)").fetchall()]
            if "password_hash" not in user_cols:
                cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
            if "role" not in user_cols:
                cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'")
            if "is_active" not in user_cols:
                cursor.execute("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1")
            if "created_at" not in user_cols:
                cursor.execute("ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP")
            if "last_login" not in user_cols:
                cursor.execute("ALTER TABLE users ADD COLUMN last_login TEXT")
            
            self.conn.commit()
            
        cursor.close()
        print("Database initialized and migrated successfully")
    
    def add_chat(self, username: str, user_message: str, ai_response: str, model: str, api_provider: str = "", response_time: float = 0.0) -> int:
        try:
            cursor = self.conn.cursor()
            
            if self.is_postgres:
                cursor.execute("""
                    INSERT INTO chat_history (username, user_message, ai_response, model, api_provider, response_time)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (username, user_message, ai_response, model, api_provider, response_time))
                result = cursor.fetchone()
                self.conn.commit()
                cursor.close()
                return result['id'] if result else 0
            else:
                cursor.execute("""
                    INSERT INTO chat_history (username, user_message, ai_response, model, api_provider, response_time)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (username, user_message, ai_response, model, api_provider, response_time))
                self.conn.commit()
                result = cursor.lastrowid or 0
                cursor.close()
                return result
        except Exception as e:
            print(f"[DATABASE ERROR] Failed to add chat: {e}")
            try:
                self.conn.rollback()
            except:
                pass
            return 0
    
    def get_total_count(self) -> int:
        cursor = self.conn.cursor()
        if self.is_postgres:
            cursor.execute("SELECT COUNT(*) FROM chat_history")
            result = cursor.fetchone()
            return result['count'] if result else 0
        else:
            cursor.execute("SELECT COUNT(*) FROM chat_history")
            result = cursor.fetchone()
            return result[0] if result else 0

    def get_chats(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        cursor = self.conn.cursor()
        
        if self.is_postgres:
            cursor.execute("""
                SELECT id, username, user_message, ai_response, model, api_provider, response_time, timestamp
                FROM chat_history
                ORDER BY id DESC
                LIMIT %s OFFSET %s
            """, (limit, offset))
            return [dict(row) for row in cursor.fetchall()]
        else:
            cursor.execute("""
                SELECT id, username, user_message, ai_response, model, api_provider, response_time, timestamp
                FROM chat_history
                ORDER BY id DESC
                LIMIT ? OFFSET ?
            """, (limit, offset))
            rows = cursor.fetchall()
            return [
                {"id": r[0], "username": r[1], "user_message": r[2], "ai_response": r[3], "model": r[4], 
                 "api_provider": r[5], "response_time": r[6], "timestamp": r[7]}
                for r in rows
            ]
    
    def search(self, query: str, limit: int = 50) -> List[Dict]:
        cursor = self.conn.cursor()
        search_pattern = f"%{query}%"
        
        if self.is_postgres:
            cursor.execute("""
                SELECT id, username, user_message, ai_response, model, timestamp
                FROM chat_history
                WHERE user_message ILIKE %s OR ai_response ILIKE %s
                ORDER BY id DESC
                LIMIT %s
            """, (search_pattern, search_pattern, limit))
        else:
            cursor.execute("""
                SELECT id, username, user_message, ai_response, model, timestamp
                FROM chat_history
                WHERE user_message LIKE ? OR ai_response LIKE ?
                ORDER BY id DESC
                LIMIT ?
            """, (search_pattern, search_pattern, limit))
        
        return [dict(row) for row in cursor.fetchall()]
    
    def count(self) -> int:
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM chat_history")
        return cursor.fetchone()['count'] if self.is_postgres else cursor.fetchone()[0]
    
    def clear(self, days: int = 30) -> int:
        cursor = self.conn.cursor()
        
        if self.is_postgres:
            cursor.execute("""
                DELETE FROM chat_history
                WHERE timestamp < NOW() - INTERVAL '%s days'
            """, (days,))
        else:
            cursor.execute("""
                DELETE FROM chat_history
                WHERE timestamp < datetime('now', '-' || ? || ' days')
            """, (days,))
        
        self.conn.commit()
        return cursor.rowcount
    
    def close(self):
        self.conn.close()
    
    def init_knowledge_base(self):
        """Initialize the knowledge_base table for Kaggle-extracted knowledge."""
        cursor = self.conn.cursor()
        if self.is_postgres:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS knowledge_base (
                    id SERIAL PRIMARY KEY,
                    query TEXT NOT NULL,
                    source TEXT,
                    title TEXT,
                    content TEXT NOT NULL,
                    tags TEXT,
                    importance INTEGER DEFAULT 1,
                    is_verified INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_knowledge_query ON knowledge_base(query)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON knowledge_base(tags)
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS knowledge_base (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    query TEXT NOT NULL,
                    source TEXT,
                    title TEXT,
                    content TEXT NOT NULL,
                    tags TEXT,
                    importance INTEGER DEFAULT 1,
                    is_verified INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_knowledge_query ON knowledge_base(query)
            """)
        self.conn.commit()
        cursor.close()
        print("Knowledge base table initialized")
    
    def add_knowledge(self, query: str, source: str, title: str, content: str, tags: str = "", importance: int = 1, is_verified: int = 0) -> int:
        """Add knowledge extracted from Kaggle to the database."""
        cursor = self.conn.cursor()
        
        if self.is_postgres:
            cursor.execute("""
                INSERT INTO knowledge_base (query, source, title, content, tags, importance, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (query, source, title, content, tags, importance, is_verified))
            result = cursor.fetchone()
            self.conn.commit()
            cursor.close()
            return result['id'] if result else 0
        else:
            cursor.execute("""
                INSERT INTO knowledge_base (query, source, title, content, tags, importance, is_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (query, source, title, content, tags, importance, is_verified))
            self.conn.commit()
            result = cursor.lastrowid or 0
            cursor.close()
            return result
    
    def search_knowledge(self, query: str, limit: int = 5) -> List[Dict]:
        """Search for existing knowledge in the database."""
        cursor = self.conn.cursor()
        search_pattern = f"%{query}%"
        
        if self.is_postgres:
            cursor.execute("""
                SELECT id, query, source, title, content, tags, importance, is_verified, created_at
                FROM knowledge_base
                WHERE query ILIKE %s OR content ILIKE %s OR tags ILIKE %s
                ORDER BY is_verified DESC, importance DESC, created_at DESC
                LIMIT %s
            """, (search_pattern, search_pattern, search_pattern, limit))
        else:
            cursor.execute("""
                SELECT id, query, source, title, content, tags, importance, is_verified, created_at
                FROM knowledge_base
                WHERE query LIKE ? OR content LIKE ? OR tags LIKE ?
                ORDER BY is_verified DESC, importance DESC, created_at DESC
                LIMIT ?
            """, (search_pattern, search_pattern, search_pattern, limit))
        
        results = []
        for row in cursor.fetchall():
            if self.is_postgres:
                results.append(dict(row))
            else:
                results.append({
                    "id": row[0],
                    "query": row[1],
                    "source": row[2],
                    "title": row[3],
                    "content": row[4],
                    "tags": row[5],
                    "importance": row[6],
                    "is_verified": row[7],
                    "created_at": row[8]
                })
        
        cursor.close()
        return results
    
    def get_knowledge_stats(self) -> Dict:
        cursor = self.conn.cursor()
        
        if self.is_postgres:
            cursor.execute("SELECT COUNT(*) as count FROM knowledge_base")
            total = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(DISTINCT source) as count FROM knowledge_base")
            sources = cursor.fetchone()['count']
        else:
            cursor.execute("SELECT COUNT(*) FROM knowledge_base")
            total = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(DISTINCT source) FROM knowledge_base")
            sources = cursor.fetchone()[0]
        
        cursor.close()
        return {
            "total_entries": total,
            "unique_sources": sources
        }
    
    def init_users_table(self):
        cursor = self.conn.cursor()
        if self.is_postgres:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT NOW(),
                    last_login TIMESTAMP,
                    is_active INTEGER DEFAULT 1
                )
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'user',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    last_login TEXT,
                    is_active INTEGER DEFAULT 1
                )
            """)
        self.conn.commit()
        cursor.close()
    
    def create_user(self, username: str, password_hash: str, role: str = "user") -> int:
        cursor = self.conn.cursor()
        try:
            if self.is_postgres:
                cursor.execute("""
                    INSERT INTO users (username, password_hash, role)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (username) DO UPDATE SET
                        password_hash = %s,
                        role = %s
                    RETURNING id
                """, (username, password_hash, role, password_hash, role))
                result = cursor.fetchone()
                self.conn.commit()
                cursor.close()
                return result['id'] if result else 0
            else:
                cursor.execute("""
                    INSERT OR REPLACE INTO users (username, password_hash, role)
                    VALUES (?, ?, ?)
                """, (username, password_hash, role))
                self.conn.commit()
                result = cursor.lastrowid or 0
                cursor.close()
                return result
        except Exception as e:
            print(f"[DATABASE ERROR] Failed to create user: {e}")
            self.conn.rollback()
            cursor.close()
            return 0
    
    def get_user(self, username: str) -> Optional[Dict]:
        cursor = self.conn.cursor()
        try:
            if self.is_postgres:
                cursor.execute("""
                    SELECT id, username, password_hash, role, created_at, last_login, is_active
                    FROM users WHERE username = %s
                """, (username,))
                row = cursor.fetchone()
                cursor.close()
                return dict(row) if row else None
            else:
                cursor.execute("""
                    SELECT id, username, password_hash, role, created_at, last_login, is_active
                    FROM users WHERE username = ?
                """, (username,))
                row = cursor.fetchone()
                cursor.close()
                if row:
                    return {
                        "id": row[0], "username": row[1], "password_hash": row[2],
                        "role": row[3], "created_at": row[4], "last_login": row[5], "is_active": row[6]
                    }
                return None
        except Exception as e:
            print(f"[DATABASE ERROR] Failed to get user: {e}")
            try:
                self.conn.rollback()
            except:
                pass
            cursor.close()
            return None
    
    def update_user_login(self, username: str):
        cursor = self.conn.cursor()
        try:
            if self.is_postgres:
                cursor.execute("""
                    UPDATE users SET last_login = NOW() WHERE username = %s
                """, (username,))
            else:
                cursor.execute("""
                    UPDATE users SET last_login = datetime('now') WHERE username = ?
                """, (username,))
            self.conn.commit()
            cursor.close()
        except Exception as e:
            print(f"[DATABASE ERROR] Failed to update login: {e}")
            cursor.close()