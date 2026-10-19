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
# test_maarifah_web.py. Tunnels through HTTPS_PROXY when set, otherwise
# connects directly as before.

async def run_test():
    passed = 0
    failed = 0

    # Test 1: Games page loads
    print("\n[Games Page]")
    status = await http_status(f"{VERCEL_URL}/king-studio/games/")  # /games/ permanently redirects here
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
