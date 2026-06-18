import requests, json, sys

BASE = 'https://alking-ai-king2-f4rr.vercel.app'

results = {}

print('=' * 60)
print('KING2 SITE TEST - اختبار المنصة')
print('=' * 60)

# 1. Config endpoint
print('\n[1/5] GET /api/config')
try:
    r = requests.get(f'{BASE}/api/config', timeout=15)
    results['config'] = {'status': r.status_code}
    if r.status_code == 200:
        data = r.json()
        print(f'  Supabase URL: {data.get("supabaseUrl", "N/A")[:40]}...')
        print(f'  Anon Key: {data.get("supabaseAnonKey", "N/A")[:20]}...')
except Exception as e:
    results['config'] = {'error': str(e)}
    print(f'  ERROR: {e}')

# 2. Keep-alive
print('\n[2/5] GET /api/keep-alive')
try:
    r = requests.get(f'{BASE}/api/keep-alive', timeout=15)
    results['keep_alive'] = {'status': r.status_code}
    if r.status_code == 200:
        data = r.json()
        print(f'  Status: {data["status"]}')
        print(f'  Time: {data["timestamp"]}')
except Exception as e:
    results['keep_alive'] = {'error': str(e)}
    print(f'  ERROR: {e}')

# 3. Chat (non-streaming)
print('\n[3/5] POST /chat (non-streaming)')
try:
    r = requests.post(f'{BASE}/chat', json={
        'message': 'السلام عليكم! من أنت؟',
        'username': 'test',
        'stream': False
    }, timeout=60)
    results['chat'] = {'status': r.status_code}
    if r.status_code == 200:
        data = r.json()
        print(f'  Response: {data.get("response", "N/A")[:200]}')
        print(f'  Provider: {data.get("provider", "N/A")}')
        print(f'  Time: {data.get("response_time", "?")}s')
        if data.get('kaggle_search'):
            print('  Kaggle search: triggered')
except Exception as e:
    results['chat'] = {'error': str(e)}
    print(f'  ERROR: {e}')

# 4. Auth status
print('\n[4/5] GET /auth/status')
try:
    r = requests.get(f'{BASE}/auth/status', timeout=15)
    results['auth'] = {'status': r.status_code}
    if r.status_code == 200:
        data = r.json()
        print(f'  Authenticated: {data.get("authenticated")}')
        print(f'  Username: {data.get("username", "N/A")}')
        print(f'  IsAdmin: {data.get("isAdmin")}')
except Exception as e:
    results['auth'] = {'error': str(e)}
    print(f'  ERROR: {e}')

# 5. Stats (needs auth - will fail)
print('\n[5/5] GET /stats')
try:
    r = requests.get(f'{BASE}/stats', timeout=15)
    results['stats'] = {'status': r.status_code}
    if r.status_code == 200:
        data = r.json()
        print(f'  Memory entries: {data.get("memory_entries", "?")}')
        print(f'  Image memory: {data.get("image_memory", "?")}')
        print(f'  Audio memory: {data.get("audio_memory", "?")}')
        print(f'  Status: {data.get("status", "?")}')
except Exception as e:
    results['stats'] = {'error': str(e)}
    print(f'  ERROR: {e}')

# Summary
print('\n' + '=' * 60)
print('SUMMARY - ملخص الاختبار')
print('=' * 60)
for name, result in results.items():
    status = result.get('status', 'FAIL')
    error = result.get('error', '')
    if error:
        print(f'  ❌ {name}: {error}')
    elif status == 200:
        print(f'  ✅ {name}: OK (200)')
    else:
        print(f'  ⚠️  {name}: HTTP {status}')
print('=' * 60)
