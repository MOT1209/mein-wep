import os
import json
import re
import time
import requests
from database import Database

BASE = os.path.dirname(os.path.abspath(__file__))

QURAN_API = "https://api.alquran.cloud/v1/quran/ar"
QURAN_SOURCE_URL = "https://api.alquran.cloud/v1/quran/ar"

HADITH_EDITIONS = {
    "ara-bukhari": {"name": "صحيح البخاري", "author": "محمد بن إسماعيل البخاري", "grade": "صحيح"},
    "ara-muslim": {"name": "صحيح مسلم", "author": "مسلم بن الحجاج", "grade": "صحيح"},
    "ara-abudawud": {"name": "سنن أبي داود", "author": "أبو داود السجستاني", "grade": "صحيح"},
    "ara-nasai": {"name": "سنن النسائي", "author": "أحمد بن شعيب النسائي", "grade": "صحيح"},
    "ara-tirmidhi": {"name": "جامع الترمذي", "author": "محمد بن عيسى الترمذي", "grade": "حسن"},
    "ara-ibnmajah": {"name": "سنن ابن ماجه", "author": "محمد بن يزيد ابن ماجه", "grade": "صحيح"}
}
MAX_HADITH_PER_BOOK = 100
HADITH_BASE_URL = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions"

CHUNK_SIZE = 800
OVERLAP = 100

def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=OVERLAP):
    if len(text) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        if end < len(text):
            break_point = text.rfind(' ', start + chunk_size - 100, end + 50)
            if break_point > start:
                end = break_point
        chunks.append(text[start:end])
        start = end - overlap
        if start < 0:
            start = 0
    return chunks

def fetch_quran():
    print("[Quran] Fetching from alquran.cloud API...")
    resp = requests.get(QURAN_API, timeout=60)
    if resp.status_code != 200:
        print(f"[Quran] FAILED: HTTP {resp.status_code}")
        return []
    data = resp.json()
    surahs = data.get("data", {}).get("surahs", [])
    print(f"[Quran] Got {len(surahs)} surahs")
    entries = []
    for surah in surahs:
        surah_num = surah.get("number", 0)
        surah_name = surah.get("name", "")
        english_name = surah.get("englishName", "")
        ayahs = surah.get("ayahs", [])
        for ayah in ayahs:
            ayah_num = ayah.get("numberInSurah", 0)
            text = ayah.get("text", "").strip()
            if not text:
                continue
            title = f"القرآن الكريم - سورة {surah_name} ({surah_num}) آية {ayah_num}"
            query_str = f"سورة {surah_name} آية {ayah_num} قرآن"
            content = f"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n{text}\n\nسورة {surah_name} - الآية {ayah_num}"
            tags = f"Quran,قرآن,سورة {surah_name},آية {ayah_num},is_verified:true,mushaf"
            entries.append({
                "query": query_str,
                "source": QURAN_SOURCE_URL,
                "title": title,
                "content": content,
                "tags": tags,
                "importance": 10,
                "is_verified": 1
            })
    print(f"[Quran] Prepared {len(entries)} ayah entries")
    return entries

def fetch_hadith(edition_key):
    edition_info = HADITH_EDITIONS[edition_key]
    url = f"{HADITH_BASE_URL}/{edition_key}.min.json"
    print(f"[Hadith] Fetching {edition_info['name']} ({edition_key})...")
    resp = requests.get(url, timeout=120)
    if resp.status_code != 200:
        print(f"[Hadith] FAILED {edition_key}: HTTP {resp.status_code}")
        return []
    data = resp.json()
    hadiths = data.get("hadiths", [])
    metadata = data.get("metadata", {})
    sections = metadata.get("sections", {})
    print(f"[Hadith] {edition_info['name']}: {len(hadiths)} hadiths, {len(sections)} sections")
    entries = []
    for hi, h in enumerate(hadiths):
        if hi >= MAX_HADITH_PER_BOOK:
            break
        text = h.get("text", "").strip()
        hadith_num = h.get("hadithnumber", 0)
        if not text:
            continue
        section_id = str(h.get("chapter", "0"))
        section_name = sections.get(section_id, f"القسم {section_id}")
        full_text = f"{text}\n\n[الراوي: {edition_info['author']} - {edition_info['name']} - حديث رقم {hadith_num}]"
        chunks = chunk_text(full_text)
        for ci, chunk in enumerate(chunks):
            title = f"{edition_info['name']} - حديث {hadith_num}"
            if len(chunks) > 1:
                title += f" (الجزء {ci+1})"
            query_str = f"حديث {edition_info['name']} رقم {hadith_num}"
            tags = (f"Hadith,حديث,{edition_info['name']},{edition_info['author']},"
                    f"grade:{edition_info['grade']},is_verified:true,hadith-api,"
                    f"hadithnumber:{hadith_num},section:{section_name}")
            entries.append({
                "query": query_str,
                "source": f"https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/{edition_key}.min.json",
                "title": title,
                "content": chunk,
                "tags": tags,
                "importance": 9 if edition_info['grade'] == 'صحيح' else 8,
                "is_verified": 1
            })
    print(f"[Hadith] {edition_info['name']}: {len(entries)} chunk entries")
    return entries

def fetch_all_data(db=None):
    all_entries = []
    print("=" * 60)
    print("  Islamic Knowledge Extraction System")
    print("=" * 60)

    quran_entries = fetch_quran()
    all_entries.extend(quran_entries)
    if db and quran_entries:
        c, _ = inject_into_db(db, quran_entries, label="Quran")
        all_entries.clear()

    for edition_key in HADITH_EDITIONS:
        hadith_entries = fetch_hadith(edition_key)
        if db and hadith_entries:
            c, _ = inject_into_db(db, hadith_entries, label=HADITH_EDITIONS[edition_key]["name"])
            hadith_entries.clear()
        all_entries.extend(hadith_entries)

    print(f"\nTotal entries processed: {len(all_entries)}")
    return all_entries

def inject_into_db(db, entries, label=""):
    db.init_knowledge_base()
    count = 0
    errors = 0
    batch_size = 200
    prefix = f"[{label}] " if label else ""
    for i, entry in enumerate(entries):
        try:
            db.add_knowledge(
                query=entry["query"],
                source=entry["source"],
                title=entry["title"],
                content=entry["content"],
                tags=entry["tags"],
                importance=entry["importance"],
                is_verified=entry.get("is_verified", 1)
            )
            count += 1
            if count % batch_size == 0:
                db.conn.commit()
        except Exception as e:
            errors += 1
    db.conn.commit()
    print(f"  {prefix}Injected {count} entries" + (f", {errors} errors" if errors else ""))
    return count, errors

def verify_injection(db):
    db.init_knowledge_base()
    stats = db.get_knowledge_stats()
    verified_count = 0
    quran_count = 0
    hadith_count = 0
    try:
        cursor = db.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM knowledge_base WHERE is_verified = 1")
        row = cursor.fetchone()
        verified_count = row[0] if row else 0
        cursor.execute("SELECT COUNT(*) FROM knowledge_base WHERE tags LIKE '%Quran%' OR tags LIKE '%قرآن%'")
        row = cursor.fetchone()
        quran_count = row[0] if row else 0
        cursor.execute("SELECT COUNT(*) FROM knowledge_base WHERE tags LIKE '%Hadith%' OR tags LIKE '%حديث%'")
        row = cursor.fetchone()
        hadith_count = row[0] if row else 0
        cursor.close()
    except Exception as e:
        print(f"[Verify] Error: {e}")
    return {
        "total_kb_entries": stats.get("total_entries", 0),
        "verified_entries": verified_count,
        "quran_entries": quran_count,
        "hadith_entries": hadith_count
    }

def add_app_endpoint_to_app():
    app_path = os.path.join(BASE, "app.py")
    if not os.path.exists(app_path):
        print("[App] app.py not found")
        return

    with open(app_path, "r", encoding="utf-8") as f:
        content = f.read()

    islamic_endpoint = '''
@app.get("/admin_king/api/islamic-stats")
async def api_islamic_stats(session_token: Optional[str] = Cookie(None)):
    username = _auth_manager.validate_session(session_token)
    if username != RASHID_USERNAME:
        return JSONResponse(status_code=403, content={"error": "غير مصرح"})
    try:
        db_instance = get_db()
        if not db_instance:
            return {"connected": False, "error": "قاعدة البيانات غير متوفرة"}
        result = verify_injection(db_instance) if 'verify_injection' in dir() else {}
        cursor = db_instance.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM knowledge_base WHERE is_verified = 1")
        row = cursor.fetchone()
        verified = row[0] if row else 0
        cursor.execute("SELECT COUNT(*) FROM knowledge_base WHERE tags LIKE '%Quran%' OR tags LIKE '%قرآن%'")
        row = cursor.fetchone()
        quran = row[0] if row else 0
        cursor.execute("SELECT COUNT(*) FROM knowledge_base WHERE tags LIKE '%Hadith%' OR tags LIKE '%حديث%'")
        row = cursor.fetchone()
        hadith = row[0] if row else 0
        cursor.close()
        return {"connected": True, "total_kb_entries": verified, "verified_entries": verified, "quran_entries": quran, "hadith_entries": hadith}
    except Exception as e:
        return {"connected": False, "error": str(e)}
'''

    if "/admin_king/api/islamic-stats" not in content:
        insert_pos = content.find("# ================================================================\n\n@app.get(\"/admin_king\"")
        if insert_pos > 0:
            content = content[:insert_pos] + islamic_endpoint + "\n" + content[insert_pos:]
            with open(app_path, "w", encoding="utf-8") as f:
                f.write(content)
            print("[App] Added /admin_king/api/islamic-stats endpoint")
        else:
            print("[App] Could not find insertion point")
    else:
        print("[App] Endpoint already exists")

if __name__ == "__main__":
    print("[1] Connecting to database...")
    db = Database()

    print("\n[2] Extracting and injecting data (streaming)...")
    entry_count, error_count = 0, 0
    db.init_knowledge_base()
    db.conn.commit()

    quran_entries = fetch_quran()
    if quran_entries:
        c, e = inject_into_db(db, quran_entries, label="Quran")
        entry_count += c
        error_count += e

    for edition_key in HADITH_EDITIONS:
        book_name = HADITH_EDITIONS[edition_key]["name"]
        hadith_entries = fetch_hadith(edition_key)
        if hadith_entries:
            c, e = inject_into_db(db, hadith_entries, label=book_name)
            entry_count += c
            error_count += e

    print(f"\n[3] Total: {entry_count} entries injected, {error_count} errors")

    print("\n[4] Verifying injection...")
    stats = verify_injection(db)
    print(f"  Total KB entries: {stats['total_kb_entries']}")
    print(f"  Verified entries: {stats['verified_entries']}")
    print(f"  Quran entries: {stats['quran_entries']}")
    print(f"  Hadith entries: {stats['hadith_entries']}")

    print("\n[5] Adding API endpoint to app.py...")
    add_app_endpoint_to_app()

    print("\n" + "=" * 60)
    print("  Islamic Knowledge Injection Complete!")
    print("=" * 60)
