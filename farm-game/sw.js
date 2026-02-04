// Farm Game Service Worker
const CACHE_NAME = 'farm-game-v1';
const STATIC_ASSETS = [
    '/farm-game/',
    '/farm-game/index.html',
    '/farm-game/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
    console.log('[Farm Game SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Farm Game SW] Caching assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(err => console.error('[Farm Game SW] Cache failed:', err))
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    console.log('[Farm Game SW] Activating...');
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

// Fetch Event - Cache first for static, network for API
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
                    // Return offline message for navigation requests
                    if (event.request.mode === 'navigate') {
                        return new Response(
                            `<!DOCTYPE html>
                            <html>
                            <head><title>Offline - Farm Game</title></head>
                            <body style="text-align:center;font-family:sans-serif;padding:50px;background:#87CEEB;">
                                <h1>🚜 أنت في وضع عدم الاتصال</h1>
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