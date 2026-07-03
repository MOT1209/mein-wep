const CACHE_NAME = 'Rashid-v14';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './offline.html',
    './about.html',
    './contact.html',
    './privacy.html',
    './terms.html',
    './vault/docs/index.html',
    './vault/api/index.html',
    './css/style.css',
    './css/admin.css',
    './css/app-mode.css',
    './js/script.js',
    './js/rashid-ai-v2.js',
    './js/supabase-config.js',
    './js/pwa-installer.js',
    './js/admin.js',
    './src/js/main.js',
    './src/js/utils/cache.js',
    './src/js/utils/dom.js',
    './src/js/utils/thumbnails.js',
    './src/js/services/supabase.js',
    './src/js/services/analytics.js',
    './src/js/modules/admin-content.js',
    './src/js/modules/animations.js',
    './src/js/modules/github.js',
    './src/js/modules/mobile.js',
    './src/js/modules/navbar.js',
    './src/js/modules/projects.js',
    './src/js/modules/settings.js',
    './src/js/modules/supabase.js',
    './src/js/modules/theme.js',
    './src/js/modules/translations.js',
    './src/js/modules/enhancements.js',
    './src/js/modules/updates.js',
    './src/js/modules/statistics.js',
    './src/js/modules/vault.js',
    './src/vault/prompts.js',
    './src/vault/images.js',
    './src/vault/codes.js',
    './src/vault/media.js',
    './models/Rashid-Model/index.html',
    './images/logo.webp',
    './images/avatar.webp',
    './images/profile.webp'
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
                    caches.match(event.request)
                        .then((cached) => cached || caches.match('./offline.html'))
                )
        );
        return;
    }

    // For JS/CSS: always fetch fresh, then cache
    const url = new URL(event.request.url);
    if (/\.(js|css)(\?|$)/.test(url.pathname)) {
        event.respondWith(
            fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                }
                return response;
            }).catch(() => caches.match(event.request))
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
            }).catch(() => {
                return new Response('', { status: 408, statusText: 'Network timeout' });
            });
        })
    );
});

