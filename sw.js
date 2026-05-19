const CACHE_NAME = 'fromliten-v7';
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
    './Rashid-app/index.html',
    './Rashid-app/style.css',
    './Rashid-app/script.js',
    './images/logo.png'
];

// Install Event - Cache Files
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force activation
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
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

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    return response;
                })
                .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./offline.html')))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200 || response.type === 'opaque') return response;
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            });
        })
    );
});
