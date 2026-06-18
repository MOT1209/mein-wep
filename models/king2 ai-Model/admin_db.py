import os
from datetime import datetime
from typing import List, Dict, Optional

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False
    import sqlite3

class AdminDB:
    def __init__(self, db_path=None):
        db_url = os.environ.get('DATABASE_URL')
        
        print(f"[AdminDB] DATABASE_URL present: {bool(db_url)}")
        print(f"[AdminDB] psycopg2 available: {HAS_PSYCOPG2}")
        
        if db_url and HAS_PSYCOPG2:
            try:
                if 'sslmode' not in db_url:
                    db_url += '?sslmode=require'
                self.conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor, sslmode='require')
                self.is_postgres = True
                print("[AdminDB] PostgreSQL connected!")
            except Exception as e:
                print(f"[AdminDB] PostgreSQL FAILED: {e} — using SQLite")
                self.is_postgres = False
                self.conn = None
        else:
            self.is_postgres = False
            self.conn = None
        
        if not self.conn:
            if db_path is None:
                base_dir = os.path.dirname(os.path.abspath(__file__))
                db_path = os.path.join(base_dir, "admin_data.db")
            self.db_path = db_path
            self.conn = sqlite3.connect(db_path, check_same_thread=False)
            print(f"[AdminDB] SQLite at: {db_path}")
        
        self._init_tables()
    
    def _init_tables(self):
        cursor = self.conn.cursor()
        if self.is_postgres:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id SERIAL PRIMARY KEY,
                    username TEXT DEFAULT 'anonymous',
                    user_message TEXT NOT NULL,
                    ai_response TEXT NOT NULL,
                    api_provider TEXT,
                    response_time REAL,
                    timestamp TIMESTAMP DEFAULT NOW()
                )
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS api_usage (
                    id SERIAL PRIMARY KEY,
                    api_name TEXT NOT NULL UNIQUE,
                    request_count INTEGER DEFAULT 0,
                    total_time REAL DEFAULT 0,
                    last_used TIMESTAMP DEFAULT NOW()
                )
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username TEXT UNIQUE,
                    first_seen TIMESTAMP DEFAULT NOW(),
                    last_seen TIMESTAMP DEFAULT NOW(),
                    message_count INTEGER DEFAULT 0
                )
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS site_stats (
                    key_name TEXT PRIMARY KEY,
                    int_value INTEGER DEFAULT 0,
                    text_value TEXT,
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            cursor.execute("""
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
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT DEFAULT 'anonymous',
                    user_message TEXT NOT NULL,
                    ai_response TEXT NOT NULL,
                    api_provider TEXT,
                    response_time REAL,
                    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS api_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    api_name TEXT NOT NULL,
                    request_count INTEGER DEFAULT 0,
                    total_time REAL DEFAULT 0,
                    last_used TEXT
                )
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    first_seen TEXT,
                    last_seen TEXT,
                    message_count INTEGER DEFAULT 0
                )
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS site_stats (
                    id SERIAL PRIMARY KEY,
                    key_name TEXT UNIQUE NOT NULL,
                    int_value INTEGER DEFAULT 0,
                    text_value TEXT,
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            cursor.execute("""
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
        
        self.conn.commit()
        cursor.close()
    
    def add_conversation(self, username: str, user_message: str, ai_response: str, 
                        api_provider: str, response_time: float) -> int:
        cursor = self.conn.cursor()
        
        if self.is_postgres:
            cursor.execute("""
                INSERT INTO conversations (username, user_message, ai_response, api_provider, response_time)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (username, user_message, ai_response, api_provider, response_time))
            result = cursor.fetchone()
            self.conn.commit()
            chat_id = result['id'] if result else 0
            
            cursor.execute("""
                INSERT INTO users (username, first_seen, last_seen, message_count)
                VALUES (%s, NOW(), NOW(), 1)
                ON CONFLICT (username) DO UPDATE SET 
                    message_count = users.message_count + 1,
                    last_seen = NOW()
            """, (username,))
            self.conn.commit()
            
            cursor.execute("""
                INSERT INTO api_usage (api_name, request_count, total_time, last_used)
                VALUES (%s, 1, %s, NOW())
                ON CONFLICT (api_name) DO UPDATE SET
                    request_count = api_usage.request_count + 1,
                    total_time = api_usage.total_time + %s,
                    last_used = NOW()
            """, (api_provider, response_time, response_time))
            self.conn.commit()
            
            cursor.close()
            return chat_id
        else:
            cursor.execute("""
                INSERT INTO conversations (username, user_message, ai_response, api_provider, response_time)
                VALUES (?, ?, ?, ?, ?)
            """, (username, user_message, ai_response, api_provider, response_time))
            self.conn.commit()
            
            cursor.execute("""
                INSERT INTO users (username, first_seen, last_seen, message_count)
                VALUES (?, datetime('now'), datetime('now'), 1)
                ON CONFLICT(username) DO UPDATE SET 
                    message_count = message_count + 1,
                    last_seen = datetime('now')
            """, (username,))
            self.conn.commit()
            
            cursor.execute("""
                INSERT INTO api_usage (api_name, request_count, total_time, last_used)
                VALUES (?, 1, ?, datetime('now'))
                ON CONFLICT(api_name) DO UPDATE SET
                    request_count = request_count + 1,
                    total_time = total_time + ?,
                    last_used = datetime('now')
            """, (api_provider, response_time, response_time))
            self.conn.commit()
            
            result = cursor.lastrowid
            cursor.close()
            return result
    
    def get_conversations(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        cursor = self.conn.cursor()
        
        if self.is_postgres:
            cursor.execute("""
                SELECT id, username, user_message, ai_response, api_provider, response_time, timestamp
                FROM conversations
                ORDER BY id DESC
                LIMIT %s OFFSET %s
            """, (limit, offset))
            return [dict(row) for row in cursor.fetchall()]
        else:
            cursor.execute("""
                SELECT id, username, user_message, ai_response, api_provider, response_time, timestamp
                FROM conversations
                ORDER BY id DESC
                LIMIT ? OFFSET ?
            """, (limit, offset))
            
            return [
                {
                    "id": row[0],
                    "username": row[1],
                    "user_message": row[2],
                    "ai_response": row[3],
                    "api_provider": row[4],
                    "response_time": row[5],
                    "timestamp": row[6]
                }
                for row in cursor.fetchall()
            ]
    
    def get_stats(self) -> Dict:
        cursor = self.conn.cursor()
        
        if self.is_postgres:
            cursor.execute("SELECT COUNT(*) FROM conversations")
            total_conversations = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(DISTINCT username) FROM users")
            total_users = cursor.fetchone()['count']
            
            cursor.execute("SELECT api_name, request_count, total_time FROM api_usage ORDER BY request_count DESC")
            api_stats = [{"api_name": row['api_name'], "requests": row['request_count'], "total_time": row['total_time']} for row in cursor.fetchall()]
            
            cursor.execute("SELECT AVG(response_time) FROM conversations")
            avg_response_time = cursor.fetchone()['avg'] or 0
            
            cursor.execute("""
                SELECT api_provider, COUNT(*) as count 
                FROM conversations 
                GROUP BY api_provider 
                ORDER BY count DESC
            """)
            top_apis = [{"provider": row['api_provider'], "count": row['count']} for row in cursor.fetchall()]
            
            cursor.execute("""
                SELECT DATE(timestamp) as date, COUNT(*) as count
                FROM conversations
                GROUP BY DATE(timestamp)
                ORDER BY date DESC
                LIMIT 7
            """)
            daily_stats = [{"date": str(row['date']), "count": row['count']} for row in cursor.fetchall()]
        else:
            cursor.execute("SELECT COUNT(*) FROM conversations")
            total_conversations = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(DISTINCT username) FROM users")
            total_users = cursor.fetchone()[0]
            
            cursor.execute("SELECT api_name, request_count, total_time FROM api_usage ORDER BY request_count DESC")
            api_stats = [
                {"api_name": row[0], "requests": row[1], "total_time": row[2]}
                for row in cursor.fetchall()
            ]
            
            cursor.execute("SELECT AVG(response_time) FROM conversations")
            avg_response_time = cursor.fetchone()[0] or 0
            
            cursor.execute("""
                SELECT api_provider, COUNT(*) as count 
                FROM conversations 
                GROUP BY api_provider 
                ORDER BY count DESC
            """)
            top_apis = [{"provider": row[0], "count": row[1]} for row in cursor.fetchall()]
            
            cursor.execute("""
                SELECT DATE(timestamp) as date, COUNT(*) as count
                FROM conversations
                GROUP BY DATE(timestamp)
                ORDER BY date DESC
                LIMIT 7
            """)
            daily_stats = [{"date": row[0], "count": row[1]} for row in cursor.fetchall()]
        
        return {
            "total_conversations": total_conversations,
            "total_users": total_users,
            "api_stats": api_stats,
            "avg_response_time": round(avg_response_time, 3),
            "top_apis": top_apis,
            "daily_stats": daily_stats
        }
    
    def save_kaggle_stats(self, algorithms_ingested: int, self_corrections: int, notebooks_synced: int, datasets_synced: int, training_phase: str = "completed", message: str = "") -> None:
        cursor = self.conn.cursor()
        stats = {
            "algorithms_ingested": algorithms_ingested,
            "self_corrections": self_corrections,
            "notebooks_synced": notebooks_synced,
            "datasets_synced": datasets_synced,
            "training_phase": training_phase,
        }
        if self.is_postgres:
            for key, value in stats.items():
                cursor.execute("""
                    INSERT INTO site_stats (key_name, int_value, text_value, updated_at)
                    VALUES (%s, %s, NULL, NOW())
                    ON CONFLICT (key_name) DO UPDATE SET
                        int_value = %s,
                        updated_at = NOW()
                """, (key, value, value))
            self.conn.commit()
        else:
            for key, value in stats.items():
                cursor.execute("""
                    INSERT OR REPLACE INTO site_stats (key_name, int_value, updated_at)
                    VALUES (?, ?, datetime('now'))
                """, (key, value))
            self.conn.commit()
        cursor.close()
    
    def get_kaggle_stats(self) -> Dict:
        defaults = {
            "algorithms_ingested": 0,
            "self_corrections": 0,
            "notebooks_synced": 0,
            "datasets_synced": 0,
            "training_phase": "idle",
        }
        cursor = self.conn.cursor()
        result = dict(defaults)
        if self.is_postgres:
            cursor.execute("SELECT key_name, int_value, text_value FROM site_stats")
            for row in cursor.fetchall():
                val = row['int_value']
                if row['key_name'] in defaults:
                    result[row['key_name']] = val
        else:
            cursor.execute("SELECT key_name, int_value FROM site_stats")
            for row in cursor.fetchall():
                if row[0] in defaults:
                    result[row[0]] = row[1]
        cursor.close()
        return result
    
    def add_kaggle_sync_log(self, algorithms_ingested: int, self_corrections: int, notebooks_synced: int, datasets_synced: int, status: str, message: str, duration_seconds: float) -> None:
        cursor = self.conn.cursor()
        if self.is_postgres:
            cursor.execute("""
                INSERT INTO kaggle_sync_logs (topics_processed, algorithms_ingested, datasets_synced, self_corrections, status, message, duration_seconds)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (notebooks_synced, algorithms_ingested, datasets_synced, self_corrections, status, message, duration_seconds))
            self.conn.commit()
        else:
            cursor.execute("""
                INSERT INTO kaggle_sync_logs (topics_processed, algorithms_ingested, datasets_synced, self_corrections, status, message, duration_seconds)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (notebooks_synced, algorithms_ingested, datasets_synced, self_corrections, status, message, duration_seconds))
            self.conn.commit()
        cursor.close()
    
    def get_kaggle_sync_logs(self, limit_count: int = 20) -> List[Dict]:
        cursor = self.conn.cursor()
        if self.is_postgres:
            cursor.execute("""
                SELECT id, sync_date, topics_processed, algorithms_ingested, datasets_synced,
                       self_corrections, status, message, duration_seconds
                FROM kaggle_sync_logs
                ORDER BY sync_date DESC
                LIMIT %s
            """, (limit_count,))
            rows = cursor.fetchall()
            return [
                {
                    "id": r['id'],
                    "sync_date": str(r['sync_date']),
                    "topics_processed": r['topics_processed'],
                    "algorithms_ingested": r['algorithms_ingested'],
                    "datasets_synced": r['datasets_synced'],
                    "self_corrections": r['self_corrections'],
                    "status": r['status'],
                    "message": r['message'],
                    "duration_seconds": r['duration_seconds']
                }
                for r in rows
            ]
        else:
            cursor.execute("""
                SELECT id, sync_date, topics_processed, algorithms_ingested, datasets_synced,
                       self_corrections, status, message, duration_seconds
                FROM kaggle_sync_logs
                ORDER BY sync_date DESC
                LIMIT ?
            """, (limit_count,))
            rows = cursor.fetchall()
            return [
                {
                    "id": r[0],
                    "sync_date": str(r[1]),
                    "topics_processed": r[2],
                    "algorithms_ingested": r[3],
                    "datasets_synced": r[4],
                    "self_corrections": r[5],
                    "status": r[6],
                    "message": r[7],
                    "duration_seconds": r[8]
                }
                for r in rows
            ]
    
    def search_conversations(self, query: str, limit: int = 50) -> List[Dict]:
        cursor = self.conn.cursor()
        search_pattern = f"%{query}%"
        
        if self.is_postgres:
            cursor.execute("""
                SELECT id, username, user_message, ai_response, api_provider, response_time, timestamp
                FROM conversations
                WHERE user_message ILIKE %s OR ai_response ILIKE %s
                ORDER BY id DESC
                LIMIT %s
            """, (search_pattern, search_pattern, limit))
            return [dict(row) for row in cursor.fetchall()]
        else:
            cursor.execute("""
                SELECT id, username, user_message, ai_response, api_provider, response_time, timestamp
                FROM conversations
                WHERE user_message LIKE ? OR ai_response LIKE ?
                ORDER BY id DESC
                LIMIT ?
            """, (search_pattern, search_pattern, limit))
            
            return [
                {
                    "id": row[0],
                    "username": row[1],
                    "user_message": row[2],
                    "ai_response": row[3],
                    "api_provider": row[4],
                    "response_time": row[5],
                    "timestamp": row[6]
                }
                for row in cursor.fetchall()
            ]
    
    def get_hourly_activity(self) -> List[Dict]:
        cursor = self.conn.cursor()
        if self.is_postgres:
            cursor.execute("""
                SELECT EXTRACT(HOUR FROM timestamp)::int as hour, COUNT(*) as count
                FROM conversations
                GROUP BY hour
                ORDER BY hour
            """)
            return [{"hour": int(row['hour']), "count": row['count']} for row in cursor.fetchall()]
        else:
            cursor.execute("""
                SELECT CAST(strftime('%H', timestamp) AS INTEGER) as hour, COUNT(*) as count
                FROM conversations
                GROUP BY hour
                ORDER BY hour
            """)
            return [{"hour": row[0], "count": row[1]} for row in cursor.fetchall()]

    def get_api_calls_total(self) -> int:
        cursor = self.conn.cursor()
        if self.is_postgres:
            cursor.execute("SELECT COALESCE(SUM(request_count), 0) FROM api_usage")
            return cursor.fetchone()['coalesce']
        else:
            cursor.execute("SELECT COALESCE(SUM(request_count), 0) FROM api_usage")
            return cursor.fetchone()[0]

    def clear_old_conversations(self, days: int = 30) -> int:
        cursor = self.conn.cursor()
        
        if self.is_postgres:
            cursor.execute("""
                DELETE FROM conversations
                WHERE timestamp < NOW() - INTERVAL '%s days'
            """, (days,))
        else:
            cursor.execute("""
                DELETE FROM conversations
                WHERE timestamp < datetime('now', '-' || ? || ' days')
            """, (days,))
        
        self.conn.commit()
        return cursor.rowcount
    
    def close(self):
        self.conn.close()