// Quiz App Service Worker
// غيّر هذا الوسم عند أي تعديل على الأصول لإبطال الكاش القديم.
// مفصول عمداً عن رقم إصدار التطبيق (version.json) الذي يخص إصدار الـ APK.
const CACHE_NAME = 'quiz-app-cache-2';
const STATIC_ASSETS = [
    '/apps/quiz-app/',
    '/apps/quiz-app/index.html',
    '/apps/quiz-app/css/style.css',
    '/apps/quiz-app/js/script.js',
    '/apps/quiz-app/js/ads.js',
    '/apps/quiz-app/js/vendor/capacitor.js',
    '/apps/quiz-app/js/vendor/admob.js',
    '/apps/quiz-app/icons/icon-192.png',
    '/apps/quiz-app/icons/icon-512.png',
    '/apps/quiz-app/manifest.json',
    '/js/app-controls.js'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        // إضافة كل أصل على حدة: ملف مفقود واحد لا يُفشل التثبيت بالكامل
        // (على عكس cache.addAll التي ترفض الدفعة كلها عند أي 404)
        caches.open(CACHE_NAME).then(cache =>
            Promise.all(STATIC_ASSETS.map(url =>
                cache.add(url).catch(err =>
                    console.warn('[Quiz SW] تعذّر تخزين', url, err)
                )
            ))
        )
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch Event
const OFFLINE_PAGE = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><title>Offline - اسألني</title></head>
<body style="text-align:center;font-family:sans-serif;padding:50px;background:#0a0a0a;color:#fff;">
    <h1>🧠 أنت في وضع عدم الاتصال</h1>
    <p>Offline Mode - تحتاج إنترنت لتحميل الأسئلة</p>
</body>
</html>`;

self.addEventListener('fetch', (event) => {
    const req = event.request;

    // نتعامل مع طلبات GET فقط؛ ما عداها يمر مباشرة إلى الشبكة
    if (req.method !== 'GET') return;

    event.respondWith(
        caches.match(req).then(cached => {
            if (cached) return cached;

            return fetch(req)
                .then(networkResponse => {
                    // نخزّن فقط استجابات same-origin الناجحة (لا opaque، ولا أخطاء)
                    const cacheable =
                        networkResponse &&
                        networkResponse.status === 200 &&
                        networkResponse.type === 'basic';

                    if (cacheable) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
                    }
                    return networkResponse;
                })
                .catch(() => {
                    if (req.mode === 'navigate') {
                        return new Response(OFFLINE_PAGE, {
                            status: 503,
                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                        });
                    }
                    // لا نعيد undefined أبداً — respondWith يرفضها بـ TypeError
                    return new Response('', { status: 504, statusText: 'Offline' });
                });
        })
    );
});