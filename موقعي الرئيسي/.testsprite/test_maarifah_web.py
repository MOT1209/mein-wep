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

    # Test 1: Maarifah Web loads
    print("\n[Maarifah Web Page]")
    status = await http_status(f"{VERCEL_URL}/apps/maarifah-web/")
    if status == 200:
        print(f"  ✅ PASS: {status}")
        passed += 1
    else:
        print(f"  ❌ FAIL: expected 200, got {status}")
        failed += 1

    # Test 2: Calculator App loads
    print("\n[Calculator App]")
    status = await http_status(f"{VERCEL_URL}/apps/calculator-app/")
    if status == 200:
        print(f"  ✅ PASS: {status}")
        passed += 1
    else:
        print(f"  ❌ FAIL: expected 200, got {status}")
        failed += 1

    # Test 3: Quran App loads
    print("\n[Quran App]")
    status = await http_status(f"{VERCEL_URL}/apps/quran-app/")
    if status == 200:
        print(f"  ✅ PASS: {status}")
        passed += 1
    else:
        print(f"  ❌ FAIL: expected 200, got {status}")
        failed += 1

    # Test 4: Quiz App loads
    print("\n[Quiz App]")
    status = await http_status(f"{VERCEL_URL}/apps/quiz-app/")
    if status == 200:
        print(f"  ✅ PASS: {status}")
        passed += 1
    else:
        print(f"  ❌ FAIL: expected 200, got {status}")
        failed += 1

    # Test 5: Calculator Vault rewrite
    print("\n[Calculator Vault Rewrite]")
    status = await http_status(f"{VERCEL_URL}/apps/calculator-vault/")
    if status == 200:
        print(f"  ✅ PASS: {status}")
        passed += 1
    else:
        print(f"  ❌ FAIL: expected 200, got {status}")
        failed += 1

    # Test 6: Quiz Master rewrite
    print("\n[Quiz Master Rewrite]")
    status = await http_status(f"{VERCEL_URL}/apps/quiz-master/")
    if status == 200:
        print(f"  ✅ PASS: {status}")
        passed += 1
    else:
        print(f"  ❌ FAIL: expected 200, got {status}")
        failed += 1

    # Test 7: Quran Pro rewrite
    print("\n[Quran Pro Rewrite]")
    status = await http_status(f"{VERCEL_URL}/apps/quran-pro/")
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
        print("[PASS] ALL MAARIFAH TESTS PASSED!")
    print(f"{'='*40}")

    return failed == 0

if __name__ == "__main__":
    asyncio.run(run_test())
