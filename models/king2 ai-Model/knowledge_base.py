import json
import os
from datetime import datetime
from typing import Dict, List, Optional

PEACE_KNOWLEDGE = [
    {
        "question": "ما هو تعريف السلام",
        "answer": """السلام ليس مجرد غياب الحرب (سلام سلبي)، بل هو تحقيق العدالة والمساواة واستقرار المؤسسات (سلام إيجابي). السلام مفهوم متكامل يشمل:
- السلام السلبي: غياب العنف المباشر والحروب والنزاعات المسلحة.
- السلام الإيجابي: وجود العدالة الاجتماعية، المساواة، احترام حقوق الإنسان، استقرار المؤسسات، والتعاون الدولي.
السلام الإيجابي هو الأساس لبناء مجتمعات مزدهرة ومستدامة."""
    },
    {
        "question": "ما هي أركان السلام",
        "answer": """السلام يعتمد على 8 ركائز أساسية (مؤشر السلام الإيجابي):
1. حكومة جيدة: مؤسسات حكومية فعالة وشفافة وخاضعة للمساءلة.
2. بيئة عمل قوية: اقتصاد منتج يخلق فرص عمل ويعزز الازدهار.
3. توزيع عادل للموارد: عدالة في توزيع الثروة والفرص والخدمات.
4. قبول حقوق الآخرين: التسامح واحترام الاختلافات.
5. مستويات منخفضة من الفساد: مؤسسات نزيهة وخالية من الفساد.
6. رأس مال بشري مرتفع: تعليم جيد ورعاية صحية متطورة.
7. تدفق حر للمعلومات: صحافة حرة وإعلام مستقل.
8. علاقات جيدة مع الجوار: تعاون إقليمي وعلاقات دبلوماسية إيجابية.
هذه الركائز تقاس عبر مؤشر السلام الإيجابي (Positive Peace Index)."""
    },
    {
        "question": "ما هو اليوم العالمي للسلام",
        "answer": """21 سبتمبر من كل عام هو اليوم الدولي للسلام (International Day of Peace). أقرته الجمعية العامة للأمم المتحدة في عام 1981. شعاره الدائم: "إحياء اليوم الدولي للسلام". يشجع على وقف إطلاق النار العالمي واللاعنف."""
    },
    {
        "question": "ما هو منظور السلام في الثقافة العربية والإسلامية",
        "answer": """في الثقافة الإسلامية: تحية الإسلام هي 'السلام عليكم' - نشر السلام بين الناس. السلام اسم من أسماء الله الحسنى. قال النبي محمد ﷺ: 'أفشوا السلام بينكم'. الصلح (المصالحة) هو أساس حل النزاعات في الفقه الإسلامي. قال تعالى: 'وَالصُّلْحُ خَيْرٌ' (سورة النساء، آية 128).
في الثقافة العربية: السلام مرتبط بالأمان والطمأنينة. العفو والتسامح قيمتان أساسيتان. المصالحة القبلية والعشائرية تقليد عريق لحل النزاعات.
السلام ليس مجرد غياب الحرب، بل هو حالة من الأمان والطمأنينة والعدالة."""
    },
    {
        "question": "ما هو مؤشر السلام العالمي",
        "answer": """مؤشر السلام العالمي (GPI) يصدر عن معهد الاقتصاد والسلام (IEP) سنوياً منذ 2007. يغطي 163 دولة. يعتمد على 23 مؤشراً في 3 مجالات: مستوى الأمن والسلامة، النزاعات المستمرة، درجة التسلح. مجموع الدرجات من 1 (الأكثر سلاماً) إلى 5 (الأقل سلاماً). الدول الأكثر سلاماً: آيسلندا، نيوزيلندا، الدنمارك."""
    }
]

class KnowledgeBaseManager:
    def __init__(self, kb_path=None):
        if kb_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            kb_path = os.path.join(base_dir, "knowledge_base.json")
        self.kb_path = kb_path
        self.data = self._load()
        self._inject_peace_knowledge()
    
    def _inject_peace_knowledge(self):
        for item in PEACE_KNOWLEDGE:
            exists = any(k.get("question", "").startswith(item["question"][:20]) for k in self.data["knowledge"])
            if not exists:
                entry = {
                    "id": len(self.data["knowledge"]) + 1,
                    "question": item["question"],
                    "answer": item["answer"],
                    "category": "peace",
                    "importance": 9,
                    "created_at": datetime.now().isoformat(),
                    "usage_count": 0
                }
                self.data["knowledge"].append(entry)
                if "peace" not in self.data["categories"]:
                    self.data["categories"]["peace"] = []
                self.data["categories"]["peace"].append(entry["id"])
                self.data["metadata"]["total_entries"] = len(self.data["knowledge"])
        self._save()
    
    def _load(self) -> Dict:
        if os.path.exists(self.kb_path):
            try:
                with open(self.kb_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading knowledge base: {e}")
        
        return {
            "knowledge": [],
            "metadata": {
                "version": "1.0",
                "created_at": datetime.now().isoformat(),
                "last_updated": datetime.now().isoformat(),
                "total_entries": 0
            },
            "categories": {
                "general": [],
                "medical": [],
                "technical": [],
                "science": [],
                "education": [],
                "other": []
            }
        }
    
    def _save(self):
        try:
            with open(self.kb_path, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving knowledge base: {e}")
    
    def _detect_category(self, text: str) -> str:
        text_lower = text.lower()
        
        medical_keywords = ["طبي", "مرض", "علاج", " doctor", "medical", "health", "symptom"]
        technical_keywords = ["كود", "برمجة", "code", "programming", "computer", "software"]
        science_keywords = ["علم", "فيزياء", "كيمياء", "biology", "physics", "science"]
        education_keywords = ["تعليم", "دراسة", "school", "university", "learn", "education"]
        
        for keyword in medical_keywords:
            if keyword in text_lower:
                return "medical"
        for keyword in technical_keywords:
            if keyword in text_lower:
                return "technical"
        for keyword in science_keywords:
            if keyword in text_lower:
                return "science"
        for keyword in education_keywords:
            if keyword in text_lower:
                return "education"
        
        return "general"
    
    def add_knowledge(self, question: str, answer: str, importance: int = 5) -> bool:
        if len(question) < 5 or len(answer) < 10:
            return False
        
        category = self._detect_category(question)
        
        entry = {
            "id": len(self.data["knowledge"]) + 1,
            "question": question[:500],
            "answer": answer[:2000],
            "category": category,
            "importance": importance,
            "created_at": datetime.now().isoformat(),
            "usage_count": 0
        }
        
        self.data["knowledge"].append(entry)
        self.data["categories"][category].append(entry["id"])
        self.data["metadata"]["total_entries"] = len(self.data["knowledge"])
        self.data["metadata"]["last_updated"] = datetime.now().isoformat()
        
        self._save()
        return True
    
    def search(self, query: str, limit: int = 5) -> List[Dict]:
        query_lower = query.lower()
        results = []
        
        for entry in self.data["knowledge"]:
            if query_lower in entry["question"].lower() or query_lower in entry["answer"].lower():
                results.append(entry)
                entry["usage_count"] = (entry.get("usage_count") or 0) + 1
        
        if results:
            self._save()
        
        return results[:limit]
    
    def get_context_for_prompt(self) -> str:
        recent = self.data["knowledge"][-10:] if len(self.data["knowledge"]) >= 10 else self.data["knowledge"]
        
        if not recent:
            return ""
        
        context = "\nذاكرة KING2 السابقة:\n"
        for entry in recent:
            context += f"- س: {entry['question']}\n  ج: {entry['answer'][:200]}\n"
        
        return context
    
    def get_stats(self) -> Dict:
        return {
            "total_entries": len(self.data["knowledge"]),
            "categories": {cat: len(ids) for cat, ids in self.data["categories"].items()},
            "last_updated": self.data["metadata"]["last_updated"]
        }
    
    def clear_knowledge(self) -> bool:
        self.data["knowledge"] = []
        for cat in self.data["categories"]:
            self.data["categories"][cat] = []
        self.data["metadata"]["total_entries"] = 0
        self.data["metadata"]["last_updated"] = datetime.now().isoformat()
        self._save()
        return True