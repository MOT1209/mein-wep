import asyncio
import sys
import os
import codecs

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

VERCEL_URL = 'https://rashid-wep.vercel.app'

async def http_status(url):
    """Return HTTP status code using raw TCP (no external deps)."""
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
    except Exception:
        return 0

async def run_test():
    passed = 0
    failed = 0

    # Test 1: Games page loads
    print("\n[Games Page]")
    status = await http_status(f"{VERCEL_URL}/games/")
    if status == 200:
        print(f"  ✅ PASS: {status}")
        passed += 1
    else:
        print(f"  ❌ FAIL: expected 200, got {status}")
        failed += 1

    # Test 2: Farm Game loads
    print("\n[Farm Game]")
    status = await http_status(f"{VERCEL_URL}/games/farm-game/")
    if status == 200:
        print(f"  ✅ PASS: {status}")
        passed += 1
    else:
        print(f"  ❌ FAIL: expected 200, got {status}")
        failed += 1

    # Test 3: Kingcraft Game loads
    print("\n[Kingcraft Game]")
    status = await http_status(f"{VERCEL_URL}/games/kingcraft-game/")
    if status == 200:
        print(f"  ✅ PASS: {status}")
        passed += 1
    else:
        print(f"  ❌ FAIL: expected 200, got {status}")
        failed += 1

    # Test 4: Rust Game loads
    print("\n[Rust Game]")
    status = await http_status(f"{VERCEL_URL}/games/rust-game/")
    if status == 200:
        print(f"  ✅ PASS: {status}")
        passed += 1
    else:
        print(f"  ❌ FAIL: expected 200, got {status}")
        failed += 1

    # Test 5: Farm Empire rewrite -> Farm Game
    print("\n[Farm Empire Rewrite]")
    status = await http_status(f"{VERCEL_URL}/games/farm-empire/")
    if status == 200:
        print(f"  ✅ PASS: {status}")
        passed += 1
    else:
        print(f"  ❌ FAIL: expected 200, got {status}")
        failed += 1

    # Test 6: Rust Construction rewrite -> Rust Game
    print("\n[Rust Construction Rewrite]")
    status = await http_status(f"{VERCEL_URL}/games/rust-construction/")
    if status == 200:
        print(f"  ✅ PASS: {status}")
        passed += 1
    else:
        print(f"  ❌ FAIL: expected 200, got {status}")
        failed += 1

    # Summary
    total = passed + failed
    print(f"\n{'='*40}")
    print(f"[STATS] {passed}/{total} passed, {failed} failed")
    if failed > 0:
        print("[FAIL] SOME TESTS FAILED")
    else:
        print("[PASS] ALL GAMES TESTS PASSED!")
    print(f"{'='*40}")

    return failed == 0

if __name__ == "__main__":
    asyncio.run(run_test())
