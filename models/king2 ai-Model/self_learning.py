import json
import os
from datetime import datetime
from collections import Counter
import re


class SelfLearningEngine:
    def __init__(self, memory_path=None):
        if memory_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            memory_path = os.path.join(base_dir, "Alking_Memory")
        self.memory_path = memory_path
        self.config = None
        self.knowledge = []
        self.image_memory = []
        self.audio_memory = []
        self.prompts = []
        self._load_all()

    def _load_all(self):
        if not os.path.exists(self.memory_path):
            print(f"Memory path does not exist: {self.memory_path}")
            return
            
        # Load config
        config_path = os.path.join(self.memory_path, "memory_config.json")
        if os.path.exists(config_path):
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    self.config = json.load(f)
            except Exception as e:
                print(f"Error loading config: {e}")

        # Load text knowledge
        text_path = os.path.join(self.memory_path, "text", "heavy_memory.json")
        if os.path.exists(text_path):
            try:
                with open(text_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.knowledge = data.get("knowledge", [])
            except Exception as e:
                print(f"Error loading knowledge: {e}")

        # Load image memory
        img_path = os.path.join(self.memory_path, "images", "image_memory.json")
        if os.path.exists(img_path):
            try:
                with open(img_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.image_memory = data.get("images", [])
            except Exception as e:
                print(f"Error loading images: {e}")

        # Load audio memory
        audio_path = os.path.join(self.memory_path, "audio", "audio_memory.json")
        if os.path.exists(audio_path):
            try:
                with open(audio_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.audio_memory = data.get("audio_transcripts", [])
            except Exception as e:
                print(f"Error loading audio: {e}")

        # Load prompts
        prompt_path = os.path.join(self.memory_path, "prompts", "prompts.json")
        if os.path.exists(prompt_path):
            try:
                with open(prompt_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.prompts = data.get("prompts", [])
            except Exception as e:
                print(f"Error loading prompts: {e}")

    def _save_all(self):
        # Save text knowledge
        text_path = os.path.join(self.memory_path, "text", "knowledge.json")
        with open(text_path, "w", encoding="utf-8") as f:
            json.dump({"knowledge": self.knowledge, "stats": {"total_entries": len(self.knowledge), "last_updated": datetime.now().isoformat()}}, f, ensure_ascii=False, indent=2)

        # Save image memory
        img_path = os.path.join(self.memory_path, "images", "image_memory.json")
        with open(img_path, "w", encoding="utf-8") as f:
            json.dump({"images": self.image_memory, "stats": {"last_updated": datetime.now().isoformat()}}, f, ensure_ascii=False, indent=2)

        # Save audio memory
        audio_path = os.path.join(self.memory_path, "audio", "audio_memory.json")
        with open(audio_path, "w", encoding="utf-8") as f:
            json.dump({"audio_transcripts": self.audio_memory, "stats": {"last_updated": datetime.now().isoformat()}}, f, ensure_ascii=False, indent=2)

        # Save prompts
        prompt_path = os.path.join(self.memory_path, "prompts", "prompts.json")
        with open(prompt_path, "w", encoding="utf-8") as f:
            json.dump({"prompts": self.prompts, "stats": {"last_updated": datetime.now().isoformat()}}, f, ensure_ascii=False, indent=2)

    def _extract_keywords(self, text):
        # Remove punctuation and split
        words = re.findall(r'[\w]+', text)
        # Filter short words
        keywords = [w for w in words if len(w) > 2]
        return keywords

    def _calculate_similarity(self, q1, q2):
        words1 = set(self._extract_keywords(q1))
        words2 = set(self._extract_keywords(q2))
        if not words1 or not words2:
            return 0
        intersection = words1 & words2
        union = words1 | words2
        return len(intersection) / len(union)

    def search_knowledge(self, query, threshold=0.3):
        best_match = None
        best_score = 0
        
        # Fast search: only check first 1000 entries for speed
        search_limit = min(len(self.knowledge), 1000)
        
        # Get keywords from query for quick matching
        query_words = set(self._extract_keywords(query.lower()))
        if not query_words:
            return None, 0
        
        # Quick scan through knowledge base
        for item in self.knowledge[:search_limit]:
            try:
                question = item.get("question", "").lower()
                if not question:
                    continue
                    
                # Simple keyword overlap check (fast)
                question_words = set(self._extract_keywords(question))
                if not question_words:
                    continue
                    
                intersection = query_words & question_words
                if len(intersection) >= 2:
                    score = len(intersection) / max(len(question_words), 1)
                    if score > best_score and score >= threshold:
                        best_score = score
                        best_match = item
            except:
                continue
        
        return best_match, best_score

    def learn_from_conversation(self, user_message, ai_response):
        if self.config is None or not self.config.get("learning", {}).get("enabled", True):
            return

        # Check if already exists
        existing, score = self.search_knowledge(user_message)
        if existing and score > 0.5:
            existing["usage_count"] += 1
            return

        # Add new knowledge
        new_entry = {
            "id": len(self.knowledge) + 1,
            "question": user_message,
            "answer": ai_response,
            "category": self._auto_categorize(user_message),
            "tags": self._extract_keywords(user_message)[:5],
            "created_at": datetime.now().isoformat(),
            "usage_count": 1,
            "rating": 0
        }
        self.knowledge.append(new_entry)
        self._save_all()

    def _auto_categorize(self, text):
        categories = {
            "تقنية": ["ذكاء اصطناعي", "برمجة", "كمبيوتر", "برمجة", "كود", "برمج", "برمج", "تقنية"],
            "برمجة": ["كود", "برمجة", "بايثون", "جافا", "html", "css", "javascript", "python", "java"],
            "تاريخ": ["تاريخ", "ملك", "حكم", "حضارة", " WAR", "ثورة", "عصور"],
            "تعليم": ["شرح", "تعلم", "تعليم", "دراس", "مدرس", "طلاب", "امتحان"],
            "ترجمة": ["ترجم", "translate", "معنى", "كلمه", "معنى"],
            "كتابة": ["اكتب", "قصة", "مقال", "نص", "شعر"],
            "نصائح": ["نصيحة", "افضل", "طريقه", "كيف", "نصيحه"]
        }

        text_lower = text.lower()
        for cat, keywords in categories.items():
            if any(kw in text_lower for kw in keywords):
                return cat
        return "عام"

    def update_rating(self, question, rating):
        entry, score = self.search_knowledge(question)
        if entry:
            entry["rating"] = rating
            if rating >= 4:
                entry["usage_count"] += 2
            elif rating <= 2:
                entry["usage_count"] = max(0, entry["usage_count"] - 1)
            self._save_all()

    def improve_from_feedback(self, question, user_feedback):
        if self.config is None or not self.config.get("self_training", {}).get("enabled", True):
            return

        entry, score = self.search_knowledge(question)
        if entry:
            if "تحسين" in user_feedback.lower():
                entry["rating"] = min(5, entry.get("rating", 3) + 1)
            self._save_all()

    def get_stats(self):
        return {
            "total_knowledge": len(self.knowledge),
            "total_images": len(self.image_memory),
            "total_audio": len(self.audio_memory),
            "total_prompts": len(self.prompts),
            "categories": ["جغرافيا", "تاريخ", "علوم", "طب", "عام"]
        }

    def suggest_improvements(self):
        suggestions = []
        # Find low-rated entries
        low_rated = [k for k in self.knowledge if k.get("rating", 0) <= 2]
        if low_rated:
            suggestions.append(f"هناك {len(low_rated)} أسئلة تحتاج تحسين")

        # Find unused knowledge
        unused = [k for k in self.knowledge if k.get("usage_count", 0) == 0]
        if unused:
            suggestions.append(f"هناك {len(unused)} معلومات لم تُستخدم")

        return suggestions

    def self_train(self):
        if self.config is None or not self.config.get("self_training", {}).get("enabled", True):
            return

        improvements = []

        # Update config with training date
        self.config["stats"]["last_self_training"] = datetime.now().isoformat()
        self.config["stats"]["total_conversations_learned"] += 1

        # Save config
        config_path = os.path.join(self.memory_path, "memory_config.json")
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(self.config, f, ensure_ascii=False, indent=2)

        return improvements

    def generate_new_knowledge(self):
        # Generate potential new Q&A pairs based on patterns
        new_pairs = []
        for item in self.knowledge:
            tags = item.get("tags", [])
            if len(tags) >= 3:
                new_question = f"ما معنى {' أو '.join(tags[:2])}؟"
                new_pairs.append({
                    "suggested_question": new_question,
                    "based_on": item["question"],
                    "tags": tags[:2]
                })
        return new_pairs[:5]

    def reset_learning(self):
        self.knowledge = []
        self._save_all()
        return "تم مسح كل البيانات التعليمية" if not self.config.get("self_training", {}).get("enabled", True) else None