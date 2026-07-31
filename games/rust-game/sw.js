// Rust Game Service Worker
const CACHE_NAME = 'rust-game-v2';
const STATIC_ASSETS = [
    '/games/rust-game/',
    '/games/rust-game/index.html',
    '/games/rust-game/css/style.css',
    '/games/rust-game/css/building.css',
    '/games/rust-game/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(err => console.error('[Rust Game SW] Cache failed:', err))
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
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Navigation requests: network-first so updates are never stuck in cache
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                    return networkResponse;
                })
                .catch(() =>
                    caches.match(request).then(cached =>
                        cached ||
                        new Response(
                            `<!DOCTYPE html>
                            <html>
                            <head><title>Offline - Rust Survival</title></head>
                            <body style="text-align:center;font-family:sans-serif;padding:50px;background:#1a1a1a;color:#fff;">
                                <h1>☢️ أنت في وضع عدم الاتصال</h1>
                                <p>Offline Mode - Please check your connection</p>
                            </body>
                            </html>`,
                            { headers: { 'Content-Type': 'text/html' } }
                        )
                    )
                )
        );
        return;
    }

    // Static assets: cache-first, then network (runtime caching)
    event.respondWith(
        caches.match(request).then(response => {
            if (response) {
                return response;
            }
            return fetch(request)
                .then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    return networkResponse;
                })
                .catch(() => new Response('', { status: 408, statusText: 'Offline' }));
        })
    );
});