const CACHE_NAME = 'Rashid-v8';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './offline.html',
    './vault/docs/index.html',
    './vault/api/index.html',
    './css/style.css',
    './css/admin.css',
    './css/app-mode.css',
    './css/mobile-improvements.css',
    './js/script.js',
    './js/rashid-ai-v2.js',
    './js/supabase-config.js',
    './src/js/main.js',
    './src/js/modules/admin-content.js',
    './src/js/utils/dom.js',
    './src/js/services/supabase.js',
    './src/js/modules/animations.js',
    './src/js/modules/mobile.js',
    './src/js/modules/navbar.js',
    './src/js/modules/projects.js',
    './src/js/modules/settings.js',
    './src/js/modules/theme.js',
    './src/js/modules/translations.js',
    './models/Rashid-app/index.html',
    './models/Rashid-app/style.css',
    './models/Rashid-app/script.js',
    './images/logo.png'
];

// Install Event - Cache Files
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force activation
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // Cache files individually so one missing file won't abort the whole install
            const results = await Promise.allSettled(
                ASSETS_TO_CACHE.map(url => cache.add(url))
            );
            results.forEach((result, i) => {
                if (result.status === 'rejected') {
                    console.warn('[SW] Failed to cache:', ASSETS_TO_CACHE[i], result.reason);
                }
            });
        })
    );
});

// Activate Event - Cleanup Old Caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // Use ignoreSearch so versioned URLs (?v=1.x) always match their cached entry
    const cacheOptions = { ignoreSearch: true };

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                    return response;
                })
                .catch(() =>
                    caches.match(event.request, cacheOptions)
                        .then((cached) => cached || caches.match('./offline.html', cacheOptions))
                )
        );
        return;
    }

    event.respondWith(
        caches.match(event.request, cacheOptions).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200 || response.type === 'opaque') return response;
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            }).catch(() => {
                // Return nothing gracefully if network fails and no cache
                return new Response('', { status: 408, statusText: 'Network timeout' });
            });
        })
    );
});
