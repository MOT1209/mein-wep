import sqlite3
import os
from datetime import datetime

class KnowledgeDB:
    def __init__(self, db_path=None):
        if db_path is None:
            db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "king2_core.db")
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self.conn.execute("PRAGMA cache_size = -64000")
        self.conn.execute("PRAGMA temp_store = MEMORY")
        self._init_table()
    
    def _init_table(self):
        try:
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS knowledge (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content TEXT NOT NULL,
                    category TEXT,
                    source TEXT,
                    timestamp TEXT
                )
            """)
            self.conn.commit()
        except Exception as e:
            print(f"Table init error: {e}")
        
    def search(self, query, limit=5):
        """Fast search using LIKE (more reliable for mixed content)"""
        if not query.strip():
            return None, 0
            
        cursor = self.conn.cursor()
        
        # Use LIKE for reliable search
        search_term = f'%{query}%'
        
        try:
            cursor.execute("""
                SELECT id, content, category, source, timestamp
                FROM knowledge
                WHERE content LIKE ? OR category LIKE ?
                LIMIT ?
            """, (search_term, search_term, limit))
            
            results = cursor.fetchall()
            
            if results:
                row = results[0]
                content = row[1]
                
                # Parse content to extract Q and A
                if '\nA: ' in content:
                    parts = content.split('\nA: ', 1)
                    question = parts[0].replace('Q: ', '').strip()
                    answer = parts[1].strip() if len(parts) > 1 else content
                else:
                    question = content[:100]
                    answer = content
                
                return {
                    "question": question,
                    "answer": answer,
                    "category": row[2],
                    "source": row[3]
                }, 0.7
                
        except Exception as e:
            print(f"Search error: {str(e)[:50]}")
                
        return None, 0
    
    def add_entry(self, content, category="general", source="user"):
        """Add new entry to database"""
        cursor = self.conn.cursor()
        timestamp = datetime.now().isoformat()
        
        cursor.execute(
            "INSERT INTO knowledge (content, category, source, timestamp) VALUES (?, ?, ?, ?)",
            (content, category, source, timestamp)
        )
        self.conn.commit()
        
        return cursor.lastrowid
    
    def count(self):
        """Get total count"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM knowledge")
        return cursor.fetchone()[0]
    
    def close(self):
        self.conn.close()