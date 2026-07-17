// Calculator Vault Service Worker
const CACHE_NAME = 'calculator-app-v3';
const STATIC_ASSETS = [
    '/apps/calculator-app/',
    '/apps/calculator-app/index.html',
    '/apps/calculator-app/css/style.css',
    '/apps/calculator-app/js/app.js',
    '/apps/calculator-app/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
    console.log('[Vault SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Vault SW] Caching assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(err => console.error('[Vault SW] Cache failed:', err))
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    console.log('[Vault SW] Activating...');
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
                            <head><title>Offline - الخزنة الذكية</title></head>
                            <body style="text-align:center;font-family:sans-serif;padding:50px;background:#0f172a;color:#fff;">
                                <h1>🔒 أنت في وضع عدم الاتصال</h1>
                                <p>Offline Mode - الخزنة تعمل بدون إنترنت</p>
                            </body>
                            </html>`,
                            { headers: { 'Content-Type': 'text/html' } }
                        );
                    }
                });
        })
    );
});