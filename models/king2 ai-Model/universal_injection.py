"""
Universal Knowledge Ingestion Script
حقن المصفوفة الكونية للمعرفة في KING2
"""

import os
import json
import requests
import csv
import io
import time
from database import Database

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SOURCES = {
    "factbook": {
        "url": "https://raw.githubusercontent.com/factbook/factbook.json",
        "query": "geography",
        "tags": "جغرافيا,سياسة,دولة,عاصمة"
    },
    "owid_war_peace": {
        "url": "https://raw.githubusercontent.com/owid/owid-datasets/master/datasets/War%20and%20peace%20-%20OWID/War%20and%20peace%20-%20OWID.csv",
        "query": "history",
        "tags": "تاريخ,حرب,سلم,نزاع"
    },
    "awesome_datasets": {
        "url": "https://raw.githubusercontent.com/awesomedata/awesome-public-datasets/master/README.md",
        "query": "science",
        "tags": "علوم,بيانات,إحصاء"
    }
}

def inject_factbook(db):
    print("[FactBook] Fetching geographical data...")
    try:
        resp = requests.get(SOURCES["factbook"]["url"], timeout=30)
        data = resp.json()
        
        count = 0
        for country_code, country_data in list(data.items())[:50]:
            if isinstance(country_data, dict):
                name = country_data.get("name", {}).get("common", country_code)
                capital = country_data.get("capital", {}).get("common", "غير معروف") if isinstance(country_data.get("capital"), dict) else "غير معروف"
                region = country_data.get("region", "غير محدد")
                subregion = country_data.get("subregion", "")
                
                content = f"الدولة: {name}\nالعاصمة: {capital}\nالمنطقة: {region}\nالمنطقة الفرعية: {subregion}"
                
                db.add_knowledge(
                    query="geography",
                    source="factbook.github.io",
                    title=f"معلومات جغرافية - {name}",
                    content=content,
                    tags="جغرافيا,دولة,عاصمة",
                    importance=7
                )
                count += 1
        
        print(f"[FactBook] Injected {count} country entries")
        return count
    except Exception as e:
        print(f"[FactBook] Error: {e}")
        return 0

def inject_owid_war_peace(db):
    print("[OWID] Fetching war and peace data...")
    try:
        resp = requests.get(SOURCES["owid_war_peace"]["url"], timeout=30)
        content = resp.text
        
        reader = csv.DictReader(io.StringIO(content))
        count = 0
        for row in list(reader)[:30]:
            entity = row.get("Entity", "")
            year = row.get("Year", "")
            deaths = row.get("Deaths in conflicts (OWID)", "0")
            
            if entity and entity != "World":
                db.add_knowledge(
                    query="history",
                    source="ourworldindata.org",
                    title=f"War & Peace - {entity} ({year})",
                    content=f"الكيان: {entity}\nالسنة: {year}\nالوفيات في النزاعات: {deaths}",
                    tags="تاريخ,حرب,سلم,إحصاء",
                    importance=6
                )
                count += 1
        
        print(f"[OWID] Injected {count} war/peace entries")
        return count
    except Exception as e:
        print(f"[OWID] Error: {e}")
        return 0

def inject_awesome_datasets(db):
    print("[AwesomeDatasets] Fetching science datasets...")
    try:
        resp = requests.get(SOURCES["awesome_datasets"]["url"], timeout=30)
        md_content = resp.text
        
        count = 0
        sections = md_content.split("## ")
        
        for section in sections[1:]:
            lines = section.split("\n")
            title = lines[0].strip() if lines else "Unknown"
            desc = ""
            
            for line in lines[1:]:
                if line.strip() and not line.strip().startswith("-"):
                    desc += line.strip() + " "
                if len(desc) > 300:
                    break
            
            if title and len(title) < 100:
                db.add_knowledge(
                    query="science",
                    source="github.com/awesomedata",
                    title=f"مجموعة بيانات - {title}",
                    content=desc[:500] if desc else f"قاعدة بيانات: {title}",
                    tags="علوم,بيانات,مصدر",
                    importance=5
                )
                count += 1
            
            if count >= 20:
                break
        
        print(f"[AwesomeDatasets] Injected {count} dataset entries")
        return count
    except Exception as e:
        print(f"[AwesomeDatasets] Error: {e}")
        return 0

def inject_universal_knowledge(db):
    print("=" * 50)
    print("🚀 بدء حقن المصفوفة الكونية للمعرفة")
    print("=" * 50)
    
    db.init_knowledge_base()
    
    total = 0
    total += inject_factbook(db)
    total += inject_owid_war_peace(db)
    total += inject_awesome_datasets(db)
    
    print("=" * 50)
    print(f"✅ تم حقن {total} معلومات في قاعدة المعرفة")
    print("=" * 50)
    
    return {"total": total, "sources": len(SOURCES)}

def get_recent_knowledge(db, limit=10):
    try:
        db.init_knowledge_base()
        cursor = db.conn.cursor()
        
        if db.is_postgres:
            cursor.execute("""
                SELECT title, source, query, tags, created_at 
                FROM knowledge_base 
                ORDER BY id DESC LIMIT %s
            """, (limit,))
        else:
            cursor.execute("""
                SELECT title, source, query, tags, created_at 
                FROM knowledge_base 
                ORDER BY id DESC LIMIT ?
            """, (limit,))
        
        results = []
        for row in cursor.fetchall():
            if db.is_postgres:
                results.append({
                    "title": row["title"],
                    "source": row["source"],
                    "query": row["query"],
                    "tags": row["tags"],
                    "created_at": str(row["created_at"])
                })
            else:
                results.append({
                    "title": row[0],
                    "source": row[1],
                    "query": row[2],
                    "tags": row[3],
                    "created_at": row[4]
                })
        
        cursor.close()
        return results
    except Exception as e:
        print(f"[GetRecent] Error: {e}")
        return []

if __name__ == "__main__":
    db = Database()
    result = inject_universal_knowledge(db)
    print(f"Result: {result}")
    
    recent = get_recent_knowledge(db)
    print("\n📚 آخر 10 معلومات:")
    for item in recent:
        print(f"  - {item['title'][:50]}...")