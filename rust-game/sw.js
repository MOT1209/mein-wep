// Rust Game Service Worker
const CACHE_NAME = 'rust-game-v1';
const STATIC_ASSETS = [
    '/rust-game/',
    '/rust-game/index.html',
    '/rust-game/css/style.css',
    '/rust-game/css/building.css',
    '/rust-game/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
    console.log('[Rust Game SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Rust Game SW] Caching assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(err => console.error('[Rust Game SW] Cache failed:', err))
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    console.log('[Rust Game SW] Activating...');
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
                            <html>
                            <head><title>Offline - Rust Survival</title></head>
                            <body style="text-align:center;font-family:sans-serif;padding:50px;background:#1a1a1a;color:#fff;">
                                <h1>☢️ أنت في وضع عدم الاتصال</h1>
                                <p>Offline Mode - Please check your connection</p>
                            </body>
                            </html>`,
                            { headers: { 'Content-Type': 'text/html' } }
                        );
                    }
                });
        })
    );
});