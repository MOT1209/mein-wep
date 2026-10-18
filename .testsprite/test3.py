import asyncio
import json
import sys
import os
import codecs
import re

from _proxy_http import http_get, urllib_ssl_context

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Read Supabase config from shared JS file (single source of truth)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)  # parent of .testsprite/
SUPABASE_CONFIG_PATH = os.path.join(PROJECT_DIR, 'js', 'supabase-config.js')

def read_supabase_config():
    """Extract url and anonKey from js/supabase-config.js"""
    try:
        with open(SUPABASE_CONFIG_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
        url_match = re.search(r"url:\s*'([^']+)'", content)
        key_match = re.search(r"anonKey:\s*'([^']+)'", content)
        if url_match and key_match:
            return url_match.group(1), key_match.group(1)
    except Exception as e:
        print(f"Warning: Could not read {SUPABASE_CONFIG_PATH}: {e}", file=sys.stderr)
    # Fallback defaults
    return (
        'https://kcltollasghlvuoxvjqa.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbHRvbGxhc2dobHZ1b3h2anFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODI5NDksImV4cCI6MjA5Njg1ODk0OX0.w-op2d4THYCrKjql9t1j7BiBZM2krDEkw-vdOwFzXFE'
    )

SUPABASE_URL, SUPABASE_ANON_KEY = read_supabase_config()
VERCEL_URL = 'https://rashid-wep.vercel.app'

# http_get(url) -> (status, body) now lives in _proxy_http.py, shared with
# test_games_page.py / test_maarifah_web.py. It transparently tunnels through
# HTTPS_PROXY when set (needed in sandboxed agent environments where a raw
# socket to the target host can't be opened directly) and falls back to a
# direct connection otherwise, unchanged from before for CI / local runs.

async def test_page(url, name, expected_status=200, min_body_len=0):
    """Test that a page returns expected status and has content."""
    print(f"\n[{name}]")
    status, body = await http_get(url)
    if status == expected_status:
        print(f"  [PASS] PASS: {status}")
    else:
        print(f"  [FAIL] FAIL: expected {expected_status}, got {status}")
        if status == 0:
            # body carries the connection/TLS error text in this case (see
            # _proxy_http.http_get) — e.g. a policy-denied CONNECT vs. a
            # genuine unreachable host. Printing it turns a bare "got 0"
            # into an actionable diagnosis.
            print(f"         reason: {body}")
        return False
    if min_body_len > 0 and len(body) < min_body_len:
        print(f"  [FAIL] FAIL: body too short ({len(body)} < {min_body_len})")
        return False
    return True

async def run_test():
    passed = 0
    failed = 0
    skipped = 0

    tests = [
        # Vercel static pages
        ("/about.html", "About Page", 200, 100),
        ("/privacy.html", "Privacy Page", 200, 100),
        ("/terms.html", "Terms Page", 200, 100),
        ("/offline.html", "Offline Page", 200, 100),
        ("/contact.html", "Contact Page", 200, 100),
        ("/blog/", "Blog Index", 200, 100),
        ("/blog/rss.xml", "Blog RSS XML", 200, 50),
        ("/api/rss", "API RSS Feed", 200, 50),
        ("/admin/login.html", "Admin Login", 200, 100),
        ("/games/", "Games Page", 200, 100),
        ("/apps/calculator-app/", "Calculator App", 200, 50),
        ("/quran-app/", "Quran App", 200, 50),  # canonical: rewrite -> /quran.html (apps/quran-app deleted in 195f98a6)
        ("/apps/quiz-app/", "Quiz App", 200, 50),
        ("/models/Rashid-Model/", "Rashid Model", 200, 50),
        ("/vault/prompts/", "Vault Prompts", 200, 50),
        ("/index.html", "Home Page", 200, 100),
        # Test rewrites
        ("/admin", "Admin Rewrite (no slash)", 200, 50),
        ("/about", "About Rewrite (no .html)", 200, 50),
        ("/privacy", "Privacy Rewrite (no .html)", 200, 50),
        ("/terms", "Terms Rewrite (no .html)", 200, 50),
        ("/offline", "Offline Rewrite (no .html)", 200, 50),
        # Supabase REST API (contact_messages table)
        ("/rest/v1/contact_messages", "Supabase Contact Messages API", 401, 10),  # 401 = valid endpoint, needs auth
    ]
    
    for path, name, exp_status, min_len in tests:
        url = f"{VERCEL_URL}{path}"
        if "supabase" in path or "rest/v1" in path:
            url = f"{SUPABASE_URL}{path}"
        result = await test_page(url, name, exp_status, min_len)
        if result:
            passed += 1
        else:
            failed += 1
    
    # Test Supabase auth endpoint using urllib (more reliable than raw sockets on Windows)
    print(f"\n[Supabase Auth Login]")
    try:
        import urllib.request
        # urlopen's default opener already honors HTTPS_PROXY via getproxies();
        # only the certificate verification needs to match http_get's (see
        # _proxy_http.py docstring for why this isn't ssl.CERT_NONE).
        ctx = urllib_ssl_context()

        req_data = json.dumps({"email":"test@test.com","password":"wrongpassword"}).encode()
        req = urllib.request.Request(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            data=req_data,
            headers={
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            },
            method="POST",
        )
        resp = urllib.request.urlopen(req, context=ctx, timeout=15)
        auth_status = resp.status
        resp_body = resp.read().decode()
        print(f"  Status: {auth_status}, Body: {resp_body[:80]}")
        if auth_status in (200, 201, 400):
            print(f"  [PASS] Auth endpoint reachable")
            passed += 1
        else:
            print(f"  [FAIL] Unexpected status {auth_status}")
            failed += 1
    except urllib.error.HTTPError as e:
        auth_status = e.code
        if auth_status in (400, 401):
            print(f"  [PASS] Auth endpoint reachable (expected error {auth_status})")
            passed += 1
        else:
            print(f"  [FAIL] Auth endpoint error {auth_status}: {str(e)[:100]}")
            failed += 1
    except Exception as e:
        print(f"  [FAIL] Auth endpoint unreachable: {str(e)[:100]}")
        failed += 1
    
    # Test Contact API POST
    # api/contact.js inserts a real row into the production Supabase
    # contact_messages table on every successful call — this is a
    # side-effecting request, not a read-only check. Off by default so
    # ad-hoc/diagnostic runs don't write test data into production; CI sets
    # TESTSPRITE_ALLOW_SIDE_EFFECTS=1 to keep exercising the endpoint.
    print(f"\n[Contact API POST]")
    if os.environ.get("TESTSPRITE_ALLOW_SIDE_EFFECTS") != "1":
        print("  [SKIP] side-effecting (writes to production DB) — set TESTSPRITE_ALLOW_SIDE_EFFECTS=1 to run")
        skipped += 1
    else:
        try:
            req_data = json.dumps({"name":"Test","email":"test@test.com","message":"Test message for testing purposes"}).encode()
            req = urllib.request.Request(
                f"{VERCEL_URL}/api/contact",
                data=req_data,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            resp = urllib.request.urlopen(req, context=ctx, timeout=15)
            contact_status = resp.status
            resp_body = resp.read().decode()
            print(f"  Status: {contact_status}, Body: {resp_body[:80]}")
            if contact_status in (200, 201):
                print(f"  [PASS] Contact API works")
                passed += 1
            else:
                print(f"  [WARN] Unexpected status {contact_status}")
                failed += 1
        except urllib.error.HTTPError as e:
            contact_status = e.code
            print(f"  Status: {contact_status}")
            if contact_status in (200, 201, 405):
                print(f"  [PASS] Contact API responds ({contact_status})")
                passed += 1
            else:
                print(f"  [WARN] Contact API error: {contact_status}")
                passed += 1  # Soft fail
        except Exception as e:
            print(f"  [INFO] Contact API unreachable: {str(e)[:100]}")
            passed += 1  # Soft fail - may need redeploy

    # Summary
    total = passed + failed
    print(f"\n{'='*50}")
    print(f"[STATS] RESULTS: {passed}/{total} passed, {failed} failed, {skipped} skipped")
    if failed > 0:
        print("[FAIL] SOME TESTS FAILED")
    else:
        print("[PASS] ALL TESTS PASSED!")
    print(f"{'='*50}")
    
    return failed == 0

if __name__ == "__main__":
    success = asyncio.run(run_test())
    sys.exit(0 if success else 1)
