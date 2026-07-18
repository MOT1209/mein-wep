// Farm Game Service Worker
const CACHE_NAME = 'farm-game-v2_5_0';
const STATIC_ASSETS = [
    '/games/farm-game/',
    '/games/farm-game/index.html',
    '/games/farm-game/manifest.json',
    '/games/farm-game/css/style.css',
    '/games/farm-game/js/collision.js',
    '/games/farm-game/js/state.js',
    '/games/farm-game/js/world.js',
    '/games/farm-game/js/player.js',
    '/games/farm-game/js/camera.js',
    '/games/farm-game/js/audio.js',
    '/games/farm-game/js/animals.js',
    '/games/farm-game/js/weather.js',
    '/games/farm-game/js/quests.js',
    '/games/farm-game/js/ui.js',
    '/games/farm-game/js/save.js',
    '/games/farm-game/js/aiAgent.js',
    '/games/farm-game/js/main.js',
    '/games/farm-game/js/lib/three.min.js'
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
                            <head><title>Offline - Farm Game 3D</title></head>
                            <body style="text-align:center;font-family:system-ui,sans-serif;padding:60px 20px;background:#2d5a27;color:#fff;">
                                <h1 style="font-size:64px;margin-bottom:16px;">🌾</h1>
                                <h2 style="font-weight:400;">You're offline</h2>
                                <p style="opacity:0.7;margin-top:8px;">Connect to the internet to play Farm World</p>
                            </body>
                            </html>`,
                            { headers: { 'Content-Type': 'text/html' } }
                        );
                    }
                });
        })
    );
});