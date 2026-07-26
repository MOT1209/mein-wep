"""
SEO Enhancement Script — adds BreadcrumbList schema to all pages.
Run: python tools/add_breadcrumbs.py
"""
import sys, codecs, json, os, re

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

PROJECT = r"C:\Users\aihmo\alle folder von code\موقعي الرئيسي"
VERCEL = "https://rashid-wep.vercel.app"

# Page definitions: (file_path, breadcrumb_items)
# Each item is (name, url_path)
PAGES = {
    # Static pages
    "index.html": [
        ("Home", "/"),
    ],
    "about.html": [
        ("Home", "/"),
        ("About", "/about.html"),
    ],
    "contact.html": [
        ("Home", "/"),
        ("Contact", "/contact.html"),
    ],
    "privacy.html": [
        ("Home", "/"),
        ("Privacy", "/privacy.html"),
    ],
    "terms.html": [
        ("Home", "/"),
        ("Terms", "/terms.html"),
    ],
    "downloads.html": [
        ("Home", "/"),
        ("Downloads", "/downloads.html"),
    ],
    "learning.html": [
        ("Home", "/"),
        ("Learning", "/learning.html"),
    ],
    "devos.html": [
        ("Home", "/"),
        ("DevOS", "/devos.html"),
    ],
    "icon-generator.html": [
        ("Home", "/"),
        ("Icon Generator", "/icon-generator.html"),
    ],
    "llms.txt": None,  # skip
    "robots.txt": None,  # skip
}

# Blog index
PAGES["blog/index.html"] = [
    ("Home", "/"),
    ("Blog", "/blog/"),
]

# Games
PAGES["games/index.html"] = [
    ("Home", "/"),
    ("Games", "/games/"),
]

GAMES = {
    "games/farm-game/index.html": ("Farm Game 3D", "/games/farm-game/"),
    "games/kingcraft-game/index.html": ("KingCraft 3D", "/games/kingcraft-game/"),
    "games/rust-game/index.html": ("Rust Construction", "/games/rust-game/"),
}

# Apps
PAGES["apps/index.html"] = [
    ("Home", "/"),
    ("Apps", "/apps/"),
]

APPS = {
    "apps/calculator-app/index.html": ("Smart Vault", "/apps/calculator-app/"),
    "apps/quran-app/index.html": ("Quran Reader", "/apps/quran-app/"),
    "apps/quiz-app/index.html": ("Quiz Master", "/apps/quiz-app/"),
    "apps/maarifah-web/index.html": ("Maarifah Web", "/apps/maarifah-web/"),
}

# Vault
VAULT = {
    "vault/code/index.html": ("Vault / Code", "/vault/code/"),
    "vault/prompts/index.html": ("Vault / Prompts", "/vault/prompts/"),
    "vault/docs/index.html": ("Vault / Docs", "/vault/docs/"),
    "vault/media/index.html": ("Vault / Media", "/vault/media/"),
    "vault/archive/index.html": ("Vault / Archive", "/vault/archive/"),
    "vault/api/index.html": ("Vault / API", "/vault/api/"),
}

# Blog posts — read from posts.json for titles
BLOG_POSTS_DATA = {}
posts_json_path = os.path.join(PROJECT, "blog", "posts.json")
if os.path.exists(posts_json_path):
    with open(posts_json_path, encoding="utf-8") as f:
        for p in json.load(f):
            BLOG_POSTS_DATA[p["id"]] = p["title"]

def build_breadcrumb(items):
    """Build BreadcrumbList JSON-LD from (name, url) pairs."""
    item_list = []
    pos = 1
    for name, url_path in items:
        full_url = f"{VERCEL}{url_path}"
        item_list.append({
            "@type": "ListItem",
            "position": pos,
            "name": name,
            "item": full_url,
        })
        pos += 1
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": item_list,
    }

def inject_schema(filepath, schema):
    """Insert BreadcrumbList JSON-LD before </head> if not already present."""
    full = os.path.join(PROJECT, filepath)
    if not os.path.exists(full):
        print(f"  SKIP {filepath} — not found")
        return False

    with open(full, encoding="utf-8") as f:
        html = f.read()

    # Skip if already has BreadcrumbList
    if '"BreadcrumbList"' in html:
        print(f"  SKIP {filepath} — already has BreadcrumbList")
        return False

    json_ld = f'<script type="application/ld+json">\n{json.dumps(schema, indent=2, ensure_ascii=False)}\n</script>'

    new_html = html.replace("</head>", f"{json_ld}\n</head>")
    if new_html == html:
        print(f"  FAIL {filepath} — </head> not found")
        return False

    with open(full, "w", encoding="utf-8") as f:
        f.write(new_html)
    print(f"  [OK] {filepath}")
    return True

# --- Build list of all pages to process ---
all_pages = {}
all_pages.update(PAGES)

# Static pages with single-item breadcrumbs
for path, crumbs in PAGES.items():
    if crumbs is not None:
        all_pages[path] = crumbs

# Blog posts
for blog_file in os.listdir(os.path.join(PROJECT, "blog")):
    if not blog_file.endswith(".html") or blog_file == "index.html":
        continue
    post_id = blog_file.replace(".html", "")
    title = BLOG_POSTS_DATA.get(post_id, post_id.replace("-", " ").title())
    all_pages[f"blog/{blog_file}"] = [
        ("Home", "/"),
        ("Blog", "/blog/"),
        (title, f"/blog/{blog_file}"),
    ]

# Games
for path, (name, url) in GAMES.items():
    all_pages[path] = [
        ("Home", "/"),
        ("Games", "/games/"),
        (name, url),
    ]

# Apps
for path, (name, url) in APPS.items():
    all_pages[path] = [
        ("Home", "/"),
        ("Apps", "/apps/"),
        (name, url),
    ]

# Vault
for path, (name, url) in VAULT.items():
    all_pages[path] = [
        ("Home", "/"),
        ("Vault", "/vault/"),
        (name, url),
    ]

# Model page
model_path = "models/Rashid-Model/index.html"
if os.path.exists(os.path.join(PROJECT, model_path)):
    all_pages[model_path] = [
        ("Home", "/"),
        ("Rashid AI Model", "/models/Rashid-Model/"),
    ]

# Admin
admin_path = "admin/login.html"
if os.path.exists(os.path.join(PROJECT, admin_path)):
    all_pages[admin_path] = [
        ("Home", "/"),
        ("Admin", "/admin/login.html"),
    ]

# --- Process ---
print("Adding BreadcrumbList schema to pages...")
count = 0
for path, crumbs in sorted(all_pages.items()):
    if crumbs is None:
        continue
    schema = build_breadcrumb(crumbs)
    if inject_schema(path, schema):
        count += 1

print(f"\n[OK] {count} pages updated with BreadcrumbList.")
