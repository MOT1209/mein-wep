"""
SEO Schema Injector — adds JSON-LD structured data to game and app pages.
Run from project root: python tools/inject_schemas.py
"""
import json
import os
import sys
import codecs

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

PROJECT = r"C:\Users\aihmo\alle folder von code\موقعي الرئيسي"
VERCEL = "https://rashid-wep.vercel.app"

PAGES = {
    # Games
    "games/farm-game/index.html": {
        "@type": "Game",
        "name": "Farm Game 3D",
        "description": "3D Farm Game — Grow crops, raise animals, and build your dream farm in this immersive browser-based simulation.",
        "applicationCategory": "Simulation",
        "browserRequirements": "Requires WebGL support",
        "operatingSystem": "Any (Browser)",
    },
    "games/kingcraft-game/index.html": {
        "@type": "Game",
        "name": "KingCraft 3D",
        "description": "Build and explore a 3D world in this creative sandbox game. Craft tools, build structures, and survive.",
        "applicationCategory": "Simulation",
        "browserRequirements": "Requires WebGL support",
        "operatingSystem": "Any (Browser)",
    },
    "games/rust-game/index.html": {
        "@type": "Game",
        "name": "Rust Construction 3D",
        "description": "3D building and construction game. Design and assemble structures in a rust-themed environment.",
        "applicationCategory": "Simulation",
        "browserRequirements": "Requires WebGL support",
        "operatingSystem": "Any (Browser)",
    },
    # Apps
    "apps/calculator-app/index.html": {
        "@type": "WebApplication",
        "name": "Smart Vault / Calculator",
        "description": "الخزنة الذكية — آلة حاسبة مع خزنة سرية. إخفاء الملفات والصور والبيانات خلف واجهة حاسبة.",
        "applicationCategory": "Utility",
        "operatingSystem": "Any (Browser)",
    },
    "apps/quran-app/index.html": {
        "@type": "WebApplication",
        "name": "Quran Reader",
        "description": "Digital Quran reader with multi-recitation support. Read and listen to the Holy Quran in your browser.",
        "applicationCategory": "Reference",
        "operatingSystem": "Any (Browser)",
    },
    "apps/quiz-app/index.html": {
        "@type": "WebApplication",
        "name": "Quiz Master",
        "description": "Interactive quiz platform. Create, share, and take quizzes on various topics.",
        "applicationCategory": "Entertainment",
        "operatingSystem": "Any (Browser)",
    },
    "apps/maarifah-web/index.html": {
        "@type": "WebApplication",
        "name": "Maarifah Web",
        "description": "Knowledge platform for learning and discovery. Access curated educational content and resources.",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Any (Browser)",
    },
}

def make_schema(page_path, info):
    """Build JSON-LD schema block for a page."""
    url_path = "/" + page_path.replace("\\", "/").replace("index.html", "")
    schema = {
        "@context": "https://schema.org",
        "@type": info["@type"],
        "name": info["name"],
        "description": info["description"],
        "url": f"{VERCEL}{url_path}",
        "author": {
            "@type": "Person",
            "name": "Rashid",
            "alternateName": "MOT1209",
            "url": VERCEL
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        }
    }
    if info["@type"] == "Game":
        schema["applicationCategory"] = info["applicationCategory"]
        schema["browserRequirements"] = info["browserRequirements"]
        schema["operatingSystem"] = info["operatingSystem"]
    else:
        schema["applicationCategory"] = info["applicationCategory"]
        schema["operatingSystem"] = info["operatingSystem"]
    return schema

def inject_schema(html_path, schema):
    """Insert JSON-LD before </head> if not already present."""
    full = os.path.join(PROJECT, html_path)
    if not os.path.exists(full):
        print(f"  SKIP {html_path} — not found")
        return False
    
    with open(full, encoding="utf-8") as f:
        html = f.read()
    
    # Skip if already has schema
    if f'"@type": "{schema["@type"]}"' in html:
        print(f"  SKIP {html_path} — already has {schema['@type']} schema")
        return False
    
    json_ld = f'<script type="application/ld+json">\n{json.dumps(schema, indent=2, ensure_ascii=False)}\n</script>'
    
    # Insert before </head>
    new_html = html.replace("</head>", f"{json_ld}\n</head>")
    if new_html == html:
        print(f"  FAIL {html_path} — </head> not found")
        return False
    
    with open(full, "w", encoding="utf-8") as f:
        f.write(new_html)
    print(f"  [OK]  {html_path} — added {schema['@type']} schema")
    return True

if __name__ == "__main__":
    print("[ Injecting SEO schemas...")
    count = 0
    for path, info in PAGES.items():
        schema = make_schema(path, info)
        if inject_schema(path, schema):
            count += 1
    print(f"\n[OK] {count} pages updated.")
