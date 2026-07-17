import os
import csv
import io
import requests
from database import Database

BASE = os.path.dirname(os.path.abspath(__file__))

PEACE_KNOWLEDGE = [
    {
        "query": "ما هو تعريف السلام",
        "source": "peace-expert-system",
        "title": "تعريف السلام - مفهوم شامل",
        "content": """تعريف السلام: السلام ليس مجرد غياب الحرب (سلام سلبي)، بل هو تحقيق العدالة والمساواة واستقرار المؤسسات (سلام إيجابي).

السلام مفهوم متكامل يشمل:
- السلام السلبي: غياب العنف المباشر والحروب والنزاعات المسلحة.
- السلام الإيجابي: وجود العدالة الاجتماعية، المساواة، احترام حقوق الإنسان، استقرار المؤسسات، والتعاون الدولي.

السلام الإيجابي هو الأساس لبناء مجتمعات مزدهرة ومستدامة.""",
        "tags": "Peace_Expert,تعريف السلام,سلام إيجابي,سلام سلبي,ثقافة السلام",
        "importance": 10
    },
    {
        "query": "ما هي أركان السلام",
        "source": "peace-expert-system",
        "title": "أركان السلام الثمانية",
        "content": """أركان السلام (مؤشر السلام الإيجابي): يعتمد السلام على 8 ركائز أساسية:

1. حكومة جيدة (Well-Functioning Government): مؤسسات حكومية فعالة وشفافة وخاضعة للمساءلة.
2. بيئة عمل قوية (Sound Business Environment): اقتصاد منتج يخلق فرص عمل ويعزز الازدهار.
3. توزيع عادل للموارد (Equitable Distribution of Resources): عدالة في توزيع الثروة والفرص والخدمات.
4. قبول حقوق الآخرين (Acceptance of the Rights of Others): التسامح واحترام الاختلافات الثقافية والدينية والعرقية.
5. مستويات منخفضة من الفساد (Low Levels of Corruption): مؤسسات نزيهة وخالية من الفساد.
6. رأس مال بشري مرتفع (High Levels of Human Capital): تعليم جيد ورعاية صحية متطورة.
7. تدفق حر للمعلومات (Free Flow of Information): صحافة حرة وإعلام مستقل.
8. علاقات جيدة مع الجوار (Good Relations with Neighbours): تعاون إقليمي وعلاقات دبلوماسية إيجابية.

هذه الركائز تقاس عبر مؤشر السلام الإيجابي (Positive Peace Index) الصادر عن معهد الاقتصاد والسلام.""",
        "tags": "Peace_Expert,أركان السلام,سلام إيجابي,مؤشر السلام,Positive Peace",
        "importance": 10
    },
    {
        "query": "ما هو اليوم العالمي للسلام",
        "source": "peace-expert-system",
        "title": "اليوم الدولي للسلام - 21 سبتمبر",
        "content": """اليوم العالمي للسلام: 21 سبتمبر من كل عام هو اليوم الدولي للسلام (International Day of Peace).

- أقرته الجمعية العامة للأمم المتحدة في عام 1981.
- يُحتفل به سنوياً في 21 سبتمبر.
-主題 سنوي يختلف كل عام لتركيز الجهود العالمية.
- يشجع على وقف إطلاق النار العالمي واللاعنف.
- يُحتفى به في جميع أنحاء العالم بفعاليات تثقيفية وتوعوية.
- شعاره الدائم: "إحياء اليوم الدولي للسلام".""",
        "tags": "Peace_Expert,اليوم العالمي للسلام,21 سبتمبر,الأمم المتحدة,سلام",
        "importance": 8
    },
    {
        "query": "ما هو منظور السلام في الثقافة العربية والإسلامية",
        "source": "peace-expert-system",
        "title": "السلام في الثقافة العربية والإسلامية",
        "content": """المنظور الثقافي للسلام: السلام هو أصل التحية العربية والإسلامية ويرتبط بالصلح والأمان.

في الثقافة الإسلامية:
- تحية الإسلام هي "السلام عليكم" - نشر السلام بين الناس.
- السلام اسم من أسماء الله الحسنى.
- قال النبي محمد ﷺ: "أفشوا السلام بينكم".
- الصلح (المصالحة) هو أساس حل النزاعات في الفقه الإسلامي.
- قال تعالى: "وَالصُّلْحُ خَيْرٌ" (سورة النساء، آية 128).

في الثقافة العربية:
- السلام مرتبط بالأمان والطمأنينة.
- العفو والتسامح قيمتان أساسيتان في الثقافة العربية.
- المصالحة القبلية والعشائرية تقليد عريق لحل النزاعات.
- الضيافة والأمان traditions تعكس قيم السلام في المجتمع العربي.

السلام في الثقافة العربية والإسلامية ليس مجرد غياب الحرب، بل هو حالة من الأمان والطمأنينة والعدالة.""",
        "tags": "Peace_Expert,السلام في الإسلام,التحية الإسلامية,ثقافة السلام,صلح",
        "importance": 9
    },
    {
        "query": "ما هو مؤشر السلام العالمي",
        "source": "peace-expert-system",
        "title": "مؤشر السلام العالمي (Global Peace Index - GPI)",
        "content": """مؤشر السلام العالمي (GPI) هو المؤشر الرائد عالمياً لقياس مستوى السلام في الدول.

يصدر عن معهد الاقتصاد والسلام (Institute for Economics & Peace - IEP) سنوياً منذ 2007.

يغطي المؤشر 163 دولة مستقلة تمثل 99.7% من سكان العالم.

يعتمد على 23 مؤشراً نوعياً وكمياً مقسمة على 3 مجالات:
1. مستوى الأمن والسلامة المجتمعية (Societal Safety and Security)
2. النزاعات الداخلية والخارجية المستمرة (Ongoing Domestic and International Conflict)
3. درجة التسلح والعسكرة (Militarisation)

مجموع الدرجات: من 1 (الأكثر سلاماً) إلى 5 (الأقل سلاماً).

الدول الأكثر سلاماً عادة: آيسلندا، نيوزيلندا، الدنمارك، البرتغال، سلوفينيا.
الدول الأقل سلاماً عادة: أفغانستان، اليمن، سوريا، جنوب السودان، العراق.

المؤشر يصدر كل عام في يونيو.""",
        "tags": "Peace_Expert,مؤشر السلام,GPI,معهد الاقتصاد والسلام,IEP",
        "importance": 9
    },
    {
        "query": "السلام سلبي إيجابي",
        "source": "peace-expert-system",
        "title": "السلام السلبي مقابل السلام الإيجابي",
        "content": """الفرق بين السلام السلبي والسلام الإيجابي:

السلام السلبي (Negative Peace):
- تعريف: غياب العنف المباشر والحرب والصراع المسلح.
- أمثلة: اتفاقيات وقف إطلاق النار، الهدن.
- التحديات: قد يستمر الظلم والفساد والقمع تحت غطاء "السلام".
- القياس: يُقاس عبر مؤشر السلام العالمي (GPI).

السلام الإيجابي (Positive Peace):
- تعريف: وجود العدالة الاجتماعية، المساواة، المؤسسات القوية، احترام حقوق الإنسان.
- أمثلة: مجتمعات تتسم بالعدالة والمساواة والازدهار.
- المزايا: يخلق بيئة مستدامة للتنمية والاستقرار.
- القياس: يُقاس عبر مؤشر السلام الإيجابي (PPI) ب 8 ركائز.

العلاقة بينهما: السلام الإيجابي يمنع انزلاق المجتمعات إلى النزاعات، بينما السلام السلبي يوقف النزاعات القائمة. الهدف النهائي هو تحقيق السلام الإيجابي المستدام.""",
        "tags": "Peace_Expert,سلام سلبي,سلام إيجابي,Negative Peace,Positive Peace",
        "importance": 9
    }
]

def download_csv_summary(url, label):
    try:
        resp = requests.get(url, timeout=30)
        if resp.status_code != 200:
            return None, f"فشل تحميل {label}: HTTP {resp.status_code}"
        content = resp.text
        lines = content.strip().split('\n')
        if len(lines) < 2:
            return None, f"ملف {label} فارغ"
        reader = csv.DictReader(io.StringIO(content))
        rows = list(reader)
        return rows, content
    except Exception as e:
        return None, f"خطأ في تحميل {label}: {e}"

CSV_SOURCES = [
    {
        "url": "https://raw.githubusercontent.com/datasets/global-peace-index/master/data/global-peace-index.csv",
        "label": "Global Peace Index Rankings",
        "query_tag": "gpi rankings",
        "source_name": "global-peace-index-iwfspy"
    },
    {
        "url": "https://raw.githubusercontent.com/owid/owid-datasets/master/datasets/War%20and%20peace%20-%20OWID/War%20and%20peace%20-%20OWID.csv",
        "label": "War and Peace - OWID",
        "query_tag": "war and peace data",
        "source_name": "war-peace-owid"
    }
]

def inject_peace_knowledge(db=None):
    if db is None:
        db = Database()
    db.init_knowledge_base()

    total = 0
    stats = {"text_entries": 0, "csv_entries": 0, "errors": []}

    for item in PEACE_KNOWLEDGE:
        try:
            db.add_knowledge(
                query=item["query"],
                source=item["source"],
                title=item["title"],
                content=item["content"],
                tags=item["tags"],
                importance=item["importance"]
            )
            total += 1
            stats["text_entries"] += 1
        except Exception as e:
            stats["errors"].append(f"فشل إدخال {item['title']}: {e}")

    for csv_src in CSV_SOURCES:
        try:
            rows, raw_or_err = download_csv_summary(csv_src["url"], csv_src["label"])
            if rows is None:
                stats["errors"].append(raw_or_err)
                continue

            total_countries = len(set(r.get("Country", r.get("country", r.get("Entity", ""))) for r in rows if r.get("Country", r.get("country", r.get("Entity", "")))))
            years = sorted(set(r.get("year", r.get("Year", "")) for r in rows if r.get("year", r.get("Year", ""))))
            year_range = f"{years[0]}-{years[-1]}" if years else "غير محدد"

            summary_content = f"""مصدر البيانات: {csv_src['label']}
رابط البيانات: {csv_src['url']}

ملخص إحصائي:
- عدد الدول: {total_countries}
- السنوات المتوفرة: {year_range}
- عدد السجلات: {len(rows)}

أبرز المؤشرات في هذا المصدر:"""

            if rows:
                sample = rows[0]
                indicators = [k for k in sample.keys() if k.lower() not in ('country', 'geocode', 'year', '')]
                for ind in indicators[:15]:
                    summary_content += f"\n  - {ind}"

            if csv_src["query_tag"] == "gpi rankings":
                top_peaceful = []
                least_peaceful = []
                try:
                    for col in ["2017 score[1]", "Score", "score"]:
                        if col in rows[0]:
                            valid = [r for r in rows if r.get(col, "").strip()]
                            valid.sort(key=lambda r: float(r[col]))
                            for r in valid[:5]:
                                c = r.get("Country", r.get("country", r.get("Entity", "")))
                                if c: top_peaceful.append(c)
                            for r in valid[-5:]:
                                c = r.get("Country", r.get("country", r.get("Entity", "")))
                                if c: least_peaceful.append(c)
                            break
                except:
                    pass

                if top_peaceful:
                    summary_content += f"\n\nالدول الأكثر سلاماً: {', '.join(top_peaceful[:5])}"
                if least_peaceful:
                    summary_content += f"\nالدول الأقل سلاماً: {', '.join(least_peaceful[-5:])}"

            if csv_src["query_tag"] == "war and peace data":
                try:
                    for score_col in ["Score", "score", "Overall Score", "peace_index"]:
                        if score_col in rows[0]:
                            valid = [(r.get("Entity", r.get("Country", r.get("country", ""))), r.get(score_col, "")) for r in rows if r.get(score_col, "").strip()]
                            valid.sort(key=lambda x: float(x[1]))
                            top5 = [p[0] for p in valid[:5] if p[0]]
                            bottom5 = [p[0] for p in valid[-5:] if p[0]]
                            if top5:
                                summary_content += f"\n\nالدول الأكثر سلاماً: {', '.join(top5)}"
                            if bottom5:
                                summary_content += f"\nالدول الأقل سلاماً: {', '.join(bottom5)}"
                            break
                except:
                    pass

            db.add_knowledge(
                query=csv_src["query_tag"],
                source=csv_src["source_name"],
                title=f"تحليل بيانات {csv_src['label']}",
                content=summary_content,
                tags=f"Peace_Expert,بيانات,إحصائيات,{csv_src['query_tag']}",
                importance=8
            )
            total += 1
            stats["csv_entries"] += 1

        except Exception as e:
            stats["errors"].append(f"فشل معالجة {csv_src['label']}: {e}")

    stats["total"] = total
    return stats

def verify_injection(db=None):
    if db is None:
        db = Database()
    db.init_knowledge_base()
    results = db.search_knowledge("Peace_Expert", limit=100)
    tag_count = len(results)
    all_entries = db.get_knowledge_stats()
    return {
        "total_kb_entries": all_entries.get("total_entries", 0),
        "unique_sources": all_entries.get("unique_sources", 0),
        "peace_tagged_entries": tag_count,
        "peace_entries": [{"title": r["title"], "tags": r["tags"], "importance": r["importance"]} for r in results[:20]]
    }

if __name__ == "__main__":
    print("=" * 60)
    print("  KING2 Peace Knowledge Injection System")
    print("=" * 60)
    db = Database()
    print("\n[1] Injecting peace knowledge...")
    stats = inject_peace_knowledge(db)
    print(f"  Total entries added: {stats['total']}")
    print(f"  Text knowledge: {stats['text_entries']}")
    print(f"  CSV summaries: {stats['csv_entries']}")
    if stats["errors"]:
        print(f"  Errors ({len(stats['errors'])}):")
        for e in stats["errors"]:
            print(f"    - {e}")
    print("\n[2] Verifying injection...")
    verification = verify_injection(db)
    print(f"  Total KB entries: {verification['total_kb_entries']}")
    print(f"  Peace-tagged entries: {verification['peace_tagged_entries']}")
    print("\n[3] Peace knowledge entries:")
    for entry in verification["peace_entries"][:10]:
        print(f"  - {entry['title']} (importance: {entry['importance']})")
    print("\n" + "=" * 60)
    print("  Injection completed successfully!")
    print("=" * 60)
