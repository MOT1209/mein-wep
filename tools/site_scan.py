import asyncio
import sys
import codecs

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

VERCEL_URL = 'https://rashid-wep.vercel.app'

async def http_status(url):
    import ssl
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        host = url.split('/')[2]
        path = '/' + '/'.join(url.split('/')[3:])
        reader, writer = await asyncio.open_connection(host, 443, ssl=ctx)
        request = f"GET {path} HTTP/1.1\r\nHost: {host}\r\nUser-Agent: Mozilla/5.0\r\nConnection: close\r\n\r\n"
        writer.write(request.encode())
        await writer.drain()
        response = b""
        while True:
            chunk = await reader.read(4096)
            if not chunk:
                break
            response += chunk
        writer.close()
        await writer.wait_closed()
        status_line = response.split(b'\r\n')[0].decode()
        return int(status_line.split(' ')[1])
    except:
        return 0

async def scan():
    passed, failed = 0, 0

    pages = [
        # Main pages
        "/", "/index.html",
        "/about.html", "/about",
        "/privacy.html", "/privacy",
        "/terms.html", "/terms",
        "/offline.html", "/offline",
        "/contact.html",
        # Admin
        "/admin/login.html", "/admin",
        # Blog
        "/blog/", "/blog/rss.xml",
        "/api/rss",
        # Games
        "/games/",
        "/games/farm-game/",
        "/games/kingcraft-game/",
        "/games/rust-game/",
        "/games/farm-empire/",
        "/games/rust-construction/",
        # Apps
        "/apps/calculator-app/",
        "/apps/quran-app/",
        "/apps/quiz-app/",
        "/apps/maarifah-web/",
        "/apps/calculator-vault/",
        "/apps/quiz-master/",
        "/apps/quran-pro/",
        # Models
        "/models/Rashid-Model/",
        # Vault
        "/vault/prompts/",
        # Downloads
        "/downloads/",
        # Sitemap & SEO
        "/sitemap.xml",
        "/robots.txt",
        "/llms.txt",
    ]

    print(f"🔍 Scanning {len(pages)} URLs on {VERCEL_URL}...")
    print("="*55)

    for path in pages:
        url = f"{VERCEL_URL}{path}"
        status = await http_status(url)
        icon = "✅" if status == 200 else "❌"
        print(f"  {icon} {status:3d}  {path}")
        if status == 200:
            passed += 1
        else:
            failed += 1

    print("="*55)
    print(f"📊 {passed}/{passed+failed} ناجح • {failed} فاشل")
    if failed == 0:
        print("🎉 الموقع كامل سليم!")
    else:
        print(f"⚠️  {failed} رابط/صفحة تحتاج إصلاح!")
    print("="*55)
    return failed

asyncio.run(scan())
