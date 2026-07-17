import os
import requests
import json
from urllib.parse import quote
from dotenv import load_dotenv

# Load .env - check multiple paths for local and production
env_paths = [
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
    os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"),
    ".env"
]
for env_path in env_paths:
    if os.path.exists(env_path):
        load_dotenv(env_path)
        break


class APIManager:
    def __init__(self):
        self.pixabay_key = os.getenv("PIXABAY_API_KEY", "")
        self.youtube_key = os.getenv("YOUTUBE_API_KEY", "")
        self.google_search_key = os.getenv("GOOGLE_SEARCH_API_KEY", "")
        self.google_cx_id = os.getenv("GOOGLE_SEARCH_ENGINE_ID", "")
        self.kaggle_username = os.getenv("KAGGLE_USERNAME", "alking77")
        self.kaggle_key = os.getenv("KAGGLE_KEY", "")
        
        self._kaggle_session = None
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "KING2-AI/1.0"})
    
    def _get_kaggle_session(self):
        if self._kaggle_session is None:
            self._kaggle_session = requests.Session()
            self._kaggle_session.headers.update({"Authorization": f"Token {self.kaggle_key}"})
        return self._kaggle_session
    
    # ==================== PIXABAY (Images) ====================
    def search_images(self, query, limit=5):
        if not self.pixabay_key:
            return {
                "status": "error",
                "message": "PIXABAY_API_KEY غير موجود في .env",
                "results": []
            }
        
        # Pixabay requires per_page between 3 and 200
        if limit < 3:
            limit = 3
        
        try:
            url = "https://pixabay.com/api/"
            params = {
                "key": self.pixabay_key,
                "q": query,
                "per_page": limit,
                "image_type": "photo",
                "orientation": "horizontal"
            }
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                results = []
                for img in data.get("hits", []):
                    results.append({
                        "id": img.get("id"),
                        "url": img.get("largeImageURL"),
                        "thumb": img.get("previewURL"),
                        "description": img.get("tags", ""),
                        "author": img.get("user", ""),
                        "download_url": img.get("imageURL")
                    })
                return {"status": "success", "results": results, "source": "pixabay"}
            else:
                return {"status": "error", "message": f"Error: {response.status_code}", "results": []}
        except Exception as e:
            return {"status": "error", "message": str(e), "results": []}
    
    def get_random_image(self, query=""):
        if not self.pixabay_key:
            return {"status": "error", "message": "PIXABAY_API_KEY غير موجود"}
        
        try:
            url = "https://pixabay.com/api/"
            params = {
                "key": self.pixabay_key,
                "q": query if query else "nature",
                "per_page": 1,
                "image_type": "photo"
            }
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                hits = data.get("hits", [])
                if hits:
                    img = hits[0]
                    return {
                        "status": "success",
                        "url": img.get("largeImageURL"),
                        "description": img.get("tags", ""),
                        "author": img.get("user", "")
                    }
            return {"status": "error", "message": "لم يتم العثور على صورة"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    # ==================== YOUTUBE (Videos) ====================
    def search_youtube(self, query, limit=5):
        if not self.youtube_key or self.youtube_key == "your_youtube_key_here":
            return {
                "status": "error",
                "message": "YOUTUBE_API_KEY غير موجود في .env",
                "results": []
            }
        
        try:
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet",
                "q": query,
                "maxResults": limit,
                "type": "video",
                "key": self.youtube_key
            }
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                results = []
                for item in data.get("items", []):
                    video_id = item.get("id", {}).get("videoId")
                    snippet = item.get("snippet", {})
                    results.append({
                        "id": video_id,
                        "title": snippet.get("title", ""),
                        "description": snippet.get("description", "")[:200],
                        "channel": snippet.get("channelTitle", ""),
                        "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url"),
                        "url": f"https://www.youtube.com/watch?v={video_id}",
                        "embed_url": f"https://www.youtube.com/embed/{video_id}"
                    })
                return {"status": "success", "results": results, "source": "youtube"}
            else:
                return {"status": "error", "message": f"Error: {response.status_code}", "results": []}
        except Exception as e:
            return {"status": "error", "message": str(e), "results": []}
    
    def get_video_info(self, video_id):
        if not self.youtube_key:
            return {"status": "error", "message": "YOUTUBE_API_KEY غير موجود"}
        
        try:
            url = "https://www.googleapis.com/youtube/v3/videos"
            params = {
                "part": "snippet,statistics",
                "id": video_id,
                "key": self.youtube_key
            }
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("items"):
                    item = data["items"][0]
                    return {
                        "status": "success",
                        "title": item["snippet"]["title"],
                        "description": item["snippet"]["description"],
                        "views": item["statistics"].get("viewCount", "0"),
                        "likes": item["statistics"].get("likeCount", "0")
                    }
            return {"status": "error", "message": "الفيديو غير موجود"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    # ==================== GOOGLE / DUCKDUCKGO SEARCH ====================
    def search_google(self, query, limit=5):
        # Try Google Custom Search first
        if self.google_search_key and self.google_cx_id:
            try:
                url = "https://www.googleapis.com/customsearch/v1"
                params = {
                    "key": self.google_search_key,
                    "cx": self.google_cx_id,
                    "q": query,
                    "num": limit
                }
                
                response = self.session.get(url, params=params, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    results = []
                    for item in data.get("items", []):
                        results.append({
                            "title": item.get("title", ""),
                            "link": item.get("link", ""),
                            "snippet": item.get("snippet", "")[:200]
                        })
                    if results:
                        return {"status": "success", "results": results, "source": "google"}
            except:
                pass
        
        # Fallback to DuckDuckGo (free, no API key needed)
        return self._search_duckduckgo(query, limit)
    
    def _search_duckduckgo(self, query, limit=5):
        """Search using DuckDuckGo HTML API (free, no key needed)"""
        try:
            url = "https://html.duckduckgo.com/html/"
            params = {"q": query, "b": limit}
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.text, "html.parser")
                results = []
                
                for result in soup.select(".result"):
                    title_elem = result.select_one(".result__title")
                    link_elem = result.select_one(".result__url")
                    snippet_elem = result.select_one(".result__snippet")
                    
                    if title_elem and link_elem:
                        link = link_elem.get("href", "")
                        if link.startswith("//"):
                            link = "https:" + link
                        results.append({
                            "title": title_elem.get_text(strip=True),
                            "link": link,
                            "snippet": snippet_elem.get_text(strip=True) if snippet_elem else ""
                        })
                        if len(results) >= limit:
                            break
                
                if results:
                    return {"status": "success", "results": results, "source": "duckduckgo"}
            
            return {"status": "error", "message": "DuckDuckGo search failed", "results": []}
        except Exception as e:
            return {"status": "error", "message": str(e), "results": []}
    
    # ==================== WIKIPEDIA (Information) ====================
    def get_wikipedia_summary(self, query):
        try:
            url = "https://ar.wikipedia.org/api/rest_v1/page/summary/" + quote(query)
            
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "status": "success",
                    "title": data.get("title", ""),
                    "extract": data.get("extract", ""),
                    "url": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
                    "image": data.get("thumbnail", {}).get("source", ""),
                    "source": "wikipedia"
                }
            else:
                # Try English Wikipedia
                url_en = "https://en.wikipedia.org/api/rest_v1/page/summary/" + quote(query)
                response = self.session.get(url_en, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "status": "success",
                        "title": data.get("title", ""),
                        "extract": data.get("extract", ""),
                        "url": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
                        "image": data.get("thumbnail", {}).get("source", ""),
                        "source": "wikipedia"
                    }
                return {"status": "error", "message": "لم يتم العثور على نتائج", "results": []}
        except Exception as e:
            return {"status": "error", "message": str(e), "results": []}
    
    def search_wikipedia(self, query, limit=3):
        try:
            url = "https://ar.wikipedia.org/w/api.php"
            params = {
                "action": "opensearch",
                "search": query,
                "limit": limit,
                "namespace": 0,
                "format": "json"
            }
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                results = []
                titles = data[1] if len(data) > 1 else []
                descriptions = data[2] if len(data) > 2 else []
                urls = data[3] if len(data) > 3 else []
                
                for i in range(len(titles)):
                    results.append({
                        "title": titles[i],
                        "description": descriptions[i][:200] if i < len(descriptions) else "",
                        "url": urls[i] if i < len(urls) else ""
                    })
                
                return {"status": "success", "results": results, "source": "wikipedia"}
            return {"status": "error", "message": "Error", "results": []}
        except Exception as e:
            return {"status": "error", "message": str(e), "results": []}
    
    # ==================== KAGGLE (Datasets) ====================
    def search_kaggle(self, query, limit=5):
        if not self.kaggle_key:
            return {
                "status": "error",
                "message": "KAGGLE_KEY غير موجود في .env",
                "results": []
            }
        
        try:
            session = self._get_kaggle_session()
            url = f"https://www.kaggle.com/api/v1/datasets/list?search={query}&sort_by=hottest&page=1"
            
            response = session.get(url, timeout=30, verify=True)

            if response.status_code == 200:
                datasets = response.json()
                results = []
                for ds in datasets[:limit]:
                    results.append({
                        "ref": ds.get("ref", ""),
                        "title": ds.get("title", ""),
                        "subtitle": ds.get("subtitle", ""),
                        "size": ds.get("size", ""),
                        "downloads": ds.get("downloadCount", 0),
                        "votes": ds.get("voteCount", 0),
                        "url": f"https://www.kaggle.com/datasets/{ds.get('ref', '')}"
                    })
                return {"status": "success", "results": results, "source": "kaggle"}
            else:
                return {"status": "error", "message": f"Error: {response.status_code}", "results": []}
        except Exception as e:
            return {"status": "error", "message": str(e), "results": []}
    
    def get_kaggle_dataset_info(self, ref):
        if not self.kaggle_key:
            return {"status": "error", "message": "KAGGLE_KEY غير موجود"}
        
        try:
            session = self._get_kaggle_session()
            url = f"https://www.kaggle.com/api/v1/datasets/view/{ref}"
            
            response = session.get(url, timeout=30, verify=True)

            if response.status_code == 200:
                data = response.json()
                return {
                    "status": "success",
                    "title": data.get("title", ""),
                    "description": data.get("description", ""),
                    "size": data.get("size", ""),
                    "files": [f.get("name", "") for f in data.get("files", [])],
                    "source": "kaggle"
                }
            return {"status": "error", "message": "Dataset غير موجود"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    # ==================== UTILITY FUNCTIONS ====================
    def detect_service_needed(self, message):
        """اكتشاف أي خدمة مطلوبة بناءً على رسالة المستخدم"""
        message_lower = message.lower()
        
        # Only detect if EXPLICITLY requested (photos, videos, search)
        keywords = {
            "pixabay": ["أرني صور", "عرض صور", "صور لـ", "صور من", "show me images", "get photos"],
            "youtube": ["فيديو", "يوتيوب", "مقطع فيديو", "اعرض فيديو", "watch video", "youtube video"],
            "google": ["ابحث في google", "search on google", "جرب google"],
            "kaggle": ["数据集", "kaggle dataset", "download data"]
        }
        
        for service, phrases in keywords.items():
            for phrase in phrases:
                if phrase in message_lower:
                    return service
        
        # Don't trigger Wikipedia automatically for normal questions
        return None
    
    def format_images_response(self, images_data):
        """تنسيق صور لعرضها في المحادثة"""
        if images_data.get("status") != "success":
            return f"❌ {images_data.get('message', 'خطأ في جلب الصور')}"
        
        results = images_data.get("results", [])
        if not results:
            return "لم يتم العثور على صور"
        
        response = "📸 **نتائج الصور:**\n\n"
        for img in results[:5]:
            response += f"• {img.get('description', 'صورة')[:50]} - by {img.get('author', 'غير معروف')}\n"
            response += f"![{img.get('description', 'image')}]({img.get('url', '')})\n\n"
        
        return response
    
    def format_videos_response(self, videos_data):
        """تنسيق فيديوهات لعرضها في المحادثة"""
        if videos_data.get("status") != "success":
            return f"❌ {videos_data.get('message', 'خطأ في جلب الفيديوهات')}"
        
        results = videos_data.get("results", [])
        if not results:
            return "لم يتم العثور على فيديوهات"
        
        response = "🎬 **نتائج اليوتيوب:**\n\n"
        for vid in results[:5]:
            response += f"• **{vid.get('title', 'فيديو')}**\n"
            response += f"  📺 {vid.get('channel', 'قناة')}\n"
            response += f"  🔗 {vid.get('url', '')}\n\n"
        
        return response
    
    def format_wikipedia_response(self, wiki_data):
        """تنسيق معلومات Wikipedia للعرض"""
        if wiki_data.get("status") != "success":
            return f"❌ {wiki_data.get('message', 'خطأ في جلب المعلومات')}"
        
        response = f"📚 **معلومات من Wikipedia:**\n\n"
        response += f"**{wiki_data.get('title', '')}**\n\n"
        response += f"{wiki_data.get('extract', '')[:500]}...\n\n"
        if wiki_data.get('url'):
            response += f"[المصدر]({wiki_data.get('url', '')})"
        
        return response
    
    def format_kaggle_response(self, kaggle_data):
        """تنسيق بيانات Kaggle للعرض"""
        if kaggle_data.get("status") != "success":
            return f"❌ {kaggle_data.get('message', 'خطأ في جلب البيانات')}"
        
        results = kaggle_data.get("results", [])
        if not results:
            return "لم يتم العثور على datasets"
        
        response = "📊 **نتائج Kaggle:**\n\n"
        for ds in results[:5]:
            response += f"• **{ds.get('title', '')}**\n"
            response += f"  📁 {ds.get('subtitle', '')[:50]}\n"
            response += f"  ⬇️ {ds.get('downloads', 0)} تحميل\n"
            response += f"  🔗 {ds.get('url', '')}\n\n"
        
        return response
    
    def get_api_status(self):
        """الحصول على حالة جميع الـ APIs"""
        status = {
            "pixabay": "✅ مفعل" if self.pixabay_key else "❌ يحتاج مفتاح",
            "youtube": "✅ مفعل" if self.youtube_key and self.youtube_key != "your_youtube_key_here" else "❌ يحتاج مفتاح YouTube",
            "google_search": "✅ مفعل" if self.google_search_key else "❌ يحتاج مفتاح",
            "kaggle": "✅ مفعل" if self.kaggle_key else "❌ يحتاج مفتاح",
            "wikipedia": "✅ مفعل (مجاني)"
        }
        return status


# Singleton instance
api_manager = APIManager()