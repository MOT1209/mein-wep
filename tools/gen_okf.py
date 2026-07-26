"""
Generate OKF (Open Knowledge Format) bundle for the portfolio site.
Run: python tools/gen_okf.py
"""
import sys, codecs, json, os

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

PROJECT = r"C:\Users\aihmo\alle folder von code\موقعي الرئيسي"
VERCEL = 'https://rashid-wep.vercel.app'
OKF_DIR = os.path.join(PROJECT, 'okf')
os.makedirs(OKF_DIR, exist_ok=True)

# Load blog posts
with open(os.path.join(PROJECT, 'blog', 'posts.json'), encoding='utf-8') as f:
    posts = json.load(f)

# Map blog files
blog_map = {}
for fname in os.listdir(os.path.join(PROJECT, 'blog')):
    if fname.endswith('.html') and fname != 'index.html':
        post_id = fname.replace('.html', '')
        blog_map[post_id] = fname

concepts = []

# 1. Home
concepts.append({
    'type': 'WebSite', 'title': 'Rashid - Full-Stack Developer & AI Engineer',
    'description': 'Portfolio and projects of Rashid (MOT1209) — full-stack developer and AI engineer.',
    'resource': VERCEL + '/',
    'tags': ['portfolio', 'web development', 'AI', 'three.js', 'supabase'],
    'body': 'Rashid is a full-stack developer and AI engineer building web platforms, AI tools, and 3D games. '
            'Includes apps (Smart Vault, Quran Reader, Quiz Master, Maarifah Web), games (Farm Game, KingCraft, Rust Construction), AI models, vault resources, and a technical blog.'
})

# 2. About
concepts.append({
    'type': 'Profile', 'title': 'About Rashid',
    'description': 'About Rashid (MOT1209) — skills, expertise, and background in development and AI.',
    'resource': VERCEL + '/about.html',
    'tags': ['about', 'profile', 'developer'],
    'body': 'Full-stack developer and AI engineer skilled in JavaScript, TypeScript, Python, React, Next.js, Three.js, Supabase, PostgreSQL, and AI integration. Creator of multiple open-source projects.'
})

# 3. Contact
concepts.append({
    'type': 'ContactPage', 'title': 'Contact Rashid',
    'description': 'Get in touch for collaboration, project inquiries, or freelance work.',
    'resource': VERCEL + '/contact.html',
    'tags': ['contact', 'freelance', 'collaboration'],
    'body': 'Contact for web development, AI integration, and 3D game dev projects. Email at zwnt45602@gmail.com.'
})

# 4. Blog index
concepts.append({
    'type': 'Blog', 'title': 'Blog — Articles by Rashid',
    'description': 'Articles about web development, AI, game dev, CSS, and software architecture.',
    'resource': VERCEL + '/blog/',
    'tags': ['blog', 'articles', 'tutorials'],
    'body': '8 articles covering game AI agents, PWA development, KingCraft 3D, CSS design systems, LLM fine-tuning, Flutter architecture, portfolio optimization, and Supabase integration.'
})

# 5-12. Blog posts
for p in posts:
    pid = p['id']
    fname = blog_map.get(pid, pid + '.html')
    cat_str = ', '.join(p.get('categories', []))
    concepts.append({
        'type': 'Article',
        'title': p['title'],
        'description': p.get('description', ''),
        'resource': VERCEL + '/blog/' + fname,
        'tags': [c.lower().replace(' ', '-') for c in p.get('categories', [])],
        'body': p.get('description', '') + ' (' + str(p.get('readTime', 5)) + ' min read, published ' + p.get('date', '') + '). Categories: ' + cat_str + '.'
    })

# 13. Games index
concepts.append({
    'type': 'Collection', 'title': 'Games Collection',
    'description': '3D browser-based games built with Three.js.',
    'resource': VERCEL + '/games/',
    'tags': ['games', 'three.js', '3d', 'webgl'],
    'body': 'Three 3D browser games: Farm Game (simulation), KingCraft (sandbox), Rust Construction (building).'
})

# 14-16. Individual games
for gname, gpath, gtag, gdesc in [
    ('Farm Game 3D', '/games/farm-game/', 'farm-game', '3D farming simulation with crops, animals, and farm building.'),
    ('KingCraft 3D', '/games/kingcraft-game/', 'kingcraft-game', 'Creative 3D sandbox game with building, crafting, and exploration.'),
    ('Rust Construction', '/games/rust-game/', 'rust-game', '3D construction game with structural design and assembly.'),
]:
    concepts.append({
        'type': 'Game', 'title': gname,
        'description': gdesc,
        'resource': VERCEL + gpath,
        'tags': ['game', gtag, 'three.js', '3d', 'webgl'],
        'body': gdesc
    })

# 17. Apps index
concepts.append({
    'type': 'Collection', 'title': 'Apps Collection',
    'description': 'Web applications: Smart Vault, Quran Reader, Quiz Master, Maarifah Web.',
    'resource': VERCEL + '/apps/',
    'tags': ['apps', 'web applications', 'pwa'],
    'body': 'Four web applications built with vanilla JavaScript, HTML, and CSS.'
})

# 18-21. Individual apps
for aname, apath, atag, adesc in [
    ('Smart Vault', '/apps/calculator-app/', 'calculator', 'Stealth calculator app with hidden vault for files, images, and data.'),
    ('Quran Reader', '/apps/quran-app/', 'quran', 'Digital Quran reader with multi-recitation support.'),
    ('Quiz Master', '/apps/quiz-app/', 'quiz', 'Interactive quiz creation and taking platform.'),
    ('Maarifah Web', '/apps/maarifah-web/', 'maarifah', 'Knowledge platform for learning and discovery.'),
]:
    concepts.append({
        'type': 'WebApplication', 'title': aname,
        'description': adesc,
        'resource': VERCEL + apath,
        'tags': ['app', atag, 'web application', 'pwa'],
        'body': adesc
    })

# 22. Downloads
concepts.append({
    'type': 'Collection', 'title': 'Downloads',
    'description': 'APK downloads and resources for Rashid projects.',
    'resource': VERCEL + '/downloads.html',
    'tags': ['downloads', 'apk', 'resources'],
    'body': 'Downloadable APKs and resources for Rashid projects including KingCraft.'
})

# 23. AI Model
concepts.append({
    'type': 'SoftwareSourceCode', 'title': 'Rashid AI Model',
    'description': 'Custom AI model — Rashid Model for conversational AI and code generation.',
    'resource': VERCEL + '/models/Rashid-Model/',
    'tags': ['AI', 'model', 'machine-learning'],
    'body': 'Custom AI model for conversational AI and code generation tasks. Built with modern ML techniques.'
})

# 24. Vault
concepts.append({
    'type': 'Collection', 'title': 'Vault',
    'description': 'Resource vault with prompts, code snippets, docs, media, archive, and API references.',
    'resource': VERCEL + '/vault/prompts/',
    'tags': ['vault', 'resources', 'prompts', 'code'],
    'body': 'A resource vault with: AI prompts, reusable code snippets, documentation, media assets, archives, and API references for developers.'
})

# 25. Privacy
concepts.append({
    'type': 'WebPage', 'title': 'Privacy Policy',
    'description': 'Privacy policy for Rashid portfolio and services.',
    'resource': VERCEL + '/privacy.html',
    'tags': ['legal', 'privacy'],
    'body': 'Privacy policy covering data collection, cookies, and user rights for the portfolio site.'
})

# 26. Terms
concepts.append({
    'type': 'WebPage', 'title': 'Terms of Service',
    'description': 'Terms of service for using Rashid projects and services.',
    'resource': VERCEL + '/terms.html',
    'tags': ['legal', 'terms'],
    'body': 'Terms of service for the portfolio site and its associated applications and games.'
})

# Write concept files
written = []
for c in concepts:
    resource_path = c['resource']
    # Extract slug from resource URL
    slug_part = resource_path.rstrip('/').rsplit('/', 1)[-1]
    if not slug_part or slug_part == 'https:' or slug_part == VERCEL.replace('https://', ''):
        slug_part = 'home'
    slug = slug_part.replace('.html', '')
    if not slug:
        slug = 'home'
    
    fm = {k: v for k, v in c.items() if k != 'body'}
    body = c['body']
    
    md = '---\n' + json.dumps(fm, ensure_ascii=False, indent=2) + '\n---\n\n'
    md += '# ' + c['title'] + '\n\n' + body + '\n'
    
    # Cross-links
    links = []
    for other in concepts:
        if other['resource'] != c['resource']:
            links.append('- [' + other['title'] + '](' + other['resource'] + ')')
    if links:
        md += '\n## Related\n\n' + '\n'.join(links[:5]) + '\n'
    
    fpath = os.path.join(OKF_DIR, slug + '.md')
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(md)
    written.append((slug, c['title'], c['type']))
    print('  [OK] okf/' + slug + '.md')

# Write index.md
idx = '---\ntype: Index\ntitle: Rashid Portfolio — OKF Knowledge Bundle\ndescription: Complete knowledge bundle for the portfolio site.\nresource: https://rashid-wep.vercel.app/\ntags: [portfolio, knowledge-base, AI-agent]\n---\n\n'
idx += '# Rashid Portfolio — Knowledge Bundle\n\n'
idx += 'This bundle contains all pages from [rashid-wep.vercel.app](https://rashid-wep.vercel.app).\n\n'
idx += '## Contents\n\n'
for slug, title, ctype in written:
    idx += '- [' + title + '](' + slug + '.md) — `' + ctype + '`\n'

idx += '\n## Tags Index\n\n'
tag_map = {}
for c in concepts:
    for t in c.get('tags', []):
        tag_map.setdefault(t, []).append(c['title'])
for t in sorted(tag_map.keys()):
    idx += '- **' + t + '**: ' + ', '.join(tag_map[t]) + '\n'

with open(os.path.join(OKF_DIR, 'index.md'), 'w', encoding='utf-8') as f:
    f.write(idx)
print('  [OK] okf/index.md (' + str(len(written)) + ' files indexed)')

print('\n[OK] OKF bundle: ' + str(len(written)+1) + ' files created in /okf/')
