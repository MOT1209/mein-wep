// Quiz App Service Worker
const CACHE_NAME = 'quiz-app-v1';
const STATIC_ASSETS = [
    '/quiz-app/',
    '/quiz-app/index.html',
    '/quiz-app/css/style.css',
    '/quiz-app/js/script.js',
    '/quiz-app/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
    console.log('[Quiz SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Quiz SW] Caching assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(err => console.error('[Quiz SW] Cache failed:', err))
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    console.log('[Quiz SW] Activating...');
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
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request)
                .then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    return networkResponse;
                })
                .catch(() => {
                    if (event.request.mode === 'navigate') {
                        return new Response(
                            `<!DOCTYPE html>
                            <html dir="rtl">
                            <head><title>Offline - اسألني</title></head>
                            <body style="text-align:center;font-family:sans-serif;padding:50px;background:#0a0a0a;color:#fff;">
                                <h1>🧠 أنت في وضع عدم الاتصال</h1>
                                <p>Offline Mode - تحتاج إنترنت لتحميل الأسئلة</p>
                            </body>
                            </html>`,
                            { headers: { 'Content-Type': 'text/html' } }
                        );
                    }
                });
        })
    );
});