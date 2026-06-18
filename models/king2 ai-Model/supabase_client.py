import os, requests, json, time, secrets, bcrypt, re
from datetime import datetime
from typing import Optional

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

class SupabaseClient:
    def __init__(self):
        self.url = SUPABASE_URL.rstrip("/")
        self.anon_key = SUPABASE_ANON_KEY
        self.service_key = SUPABASE_SERVICE_KEY
        self.available = bool(self.url and self.service_key)
        self.conn = self if self.available else None
        self.is_postgres = self.available
        self.cursor_factory = None

    def _headers(self, use_service=True):
        key = self.service_key if use_service else self.anon_key
        return {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    def _api(self, path):
        return f"{self.url}/rest/v1/{path}"

    def _init_table(self):
        try:
            r = requests.post(f"{self.url}/rest/v1/rpc/", json={"query": ""}, headers=self._headers(), timeout=5)
        except:
            pass

    def cursor(self):
        return self

    def execute(self, *args, **kwargs):
        return None

    def fetchall(self):
        return []

    def fetchone(self):
        return None

    def commit(self):
        pass

    def rollback(self):
        pass

    def close(self):
        pass

    def init_users_table(self):
        pass

    def init_knowledge_base(self):
        pass

    def init_conversations_table(self):
        pass

    def init_video_table(self):
        pass

    def add_knowledge(self, *args, **kwargs):
        return True

    def search_knowledge(self, *args, **kwargs):
        return []

    def get_knowledge(self, *args, **kwargs):
        return []

    def add_chat(self, *args, **kwargs):
        pass

    def get_user(self, username: str) -> Optional[dict]:
        if not self.available:
            return None
        try:
            r = requests.get(
                self._api("users"),
                params={"username": f"eq.{username}", "limit": "1"},
                headers=self._headers(),
                timeout=10,
            )
            if r.status_code == 200 and r.json():
                return r.json()[0]
        except Exception as e:
            print(f"[Supabase] get_user error: {e}")
        return None

    def get_user_by_email(self, email: str) -> Optional[dict]:
        if not self.available:
            return None
        try:
            r = requests.get(
                self._api("users"),
                params={"email": f"eq.{email}", "limit": "1"},
                headers=self._headers(),
                timeout=10,
            )
            if r.status_code == 200 and r.json():
                return r.json()[0]
        except Exception as e:
            print(f"[Supabase] get_user_by_email error: {e}")
        return None

    def create_user(self, username: str, password_hash: str, role: str = "user") -> Optional[int]:
        if not self.available:
            return None
        try:
            data = {
                "username": username,
                "password_hash": password_hash,
                "role": role,
                "is_active": True,
                "created_at": datetime.utcnow().isoformat(),
            }
            r = requests.post(self._api("users"), json=data, headers=self._headers(), timeout=10)
            if r.status_code in (200, 201):
                result = r.json()
                return result[0].get("id") if isinstance(result, list) else result.get("id")
        except Exception as e:
            print(f"[Supabase] create_user error: {e}")
        return None

    def create_oauth_user(self, username: str, email: str, provider: str) -> Optional[dict]:
        if not self.available:
            return None
        try:
            import hashlib
            temp_pw = hashlib.sha256(f"{provider}:{email}:{secrets.token_hex(8)}".encode()).hexdigest()
            pw_hash = bcrypt.hashpw(temp_pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            data = {
                "username": username,
                "email": email,
                "password_hash": pw_hash,
                "role": "user",
                "is_active": True,
                "created_at": datetime.utcnow().isoformat(),
            }
            r = requests.post(self._api("users"), json=data, headers=self._headers(), timeout=10)
            if r.status_code in (200, 201):
                result = r.json()
                if isinstance(result, list) and result:
                    return result[0]
                return result
        except Exception as e:
            print(f"[Supabase] create_oauth_user error: {e}")
        return None

    def update_user(self, username: str, data: dict) -> bool:
        if not self.available:
            return False
        try:
            r = requests.patch(
                self._api("users"),
                params={"username": f"eq.{username}"},
                json=data,
                headers=self._headers(),
                timeout=10,
            )
            return r.status_code in (200, 204)
        except:
            return False

    def save_message(self, username: str, message: str, role: str = "user"):
        if not self.available:
            return
        try:
            data = {
                "username": username,
                "message": message,
                "role": role,
                "created_at": datetime.utcnow().isoformat(),
            }
            requests.post(
                f"{self.url}/rest/v1/rpc/save_message" if False else self._api("chat_history"),
                json=data,
                headers=self._headers(),
                timeout=5,
            )
        except:
            pass

    def get_chat_history(self, username: str, limit: int = 50) -> list:
        if not self.available:
            return []
        try:
            r = requests.get(
                self._api("chat_history"),
                params={"username": f"eq.{username}", "order": "created_at.desc", "limit": str(limit)},
                headers=self._headers(),
                timeout=10,
            )
            if r.status_code == 200:
                return r.json()
        except:
            pass
        return []

    def delete_user(self, username: str) -> bool:
        if not self.available:
            return False
        try:
            r = requests.delete(
                self._api("users"),
                params={"username": f"eq.{username}"},
                headers=self._headers(),
                timeout=10,
            )
            return r.status_code in (200, 204)
        except:
            return False

    def get_stats(self) -> dict:
        stats = {"users": 0, "messages": 0}
        if not self.available:
            return stats
        try:
            r = requests.get(self._api("users"), headers=self._headers(), timeout=10)
            if r.status_code == 200:
                stats["users"] = len(r.json())
        except:
            pass
        try:
            r = requests.get(self._api("chat_history"), headers=self._headers(), timeout=10)
            if r.status_code == 200:
                stats["messages"] = len(r.json())
        except:
            pass
        return stats


_supabase = None

def get_supabase():
    global _supabase
    if _supabase is None:
        _supabase = SupabaseClient()
    return _supabase
