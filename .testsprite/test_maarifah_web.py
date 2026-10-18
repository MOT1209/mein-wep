import asyncio
import sys
import os
import codecs

from _proxy_http import http_status

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

VERCEL_URL = 'https://rashid-wep.vercel.app'

# http_status(url) -> int now lives in _proxy_http.py, shared with test3.py /
# test_games_page.py. Tunnels through HTTPS_PROXY when set, otherwise
# connects directly as before.

async def run_test():
    passed = 0
    failed = 0

    # Test 1: Maarifah surface (OKF doc — no web app build is committed; /apps/maarifah-web/ never existed)
    print("\n[Maarifah OKF Doc]")
    status = await http_status(f"{VERCEL_URL}/okf/maarifah-web.md")
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

    # Test 3: Quran App loads (canonical rewrite -> /quran.html)
    print("\n[Quran App]")
    status = await http_status(f"{VERCEL_URL}/quran-app/")
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
