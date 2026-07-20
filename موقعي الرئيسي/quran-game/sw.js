// Quran App Service Worker - Offline Support
const CACHE_NAME = 'quran-game-v1';
const STATIC_ASSETS = [
    '/quran-game/',
    '/quran-game/index.html',
    '/quran-game/css/style.css',
    '/quran-game/js/app.js',
    '/quran-game/offline.html'
];

// API Cache Configuration
const API_CACHE_NAME = 'quran-api-cache-v3';
const API_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const AUDIO_CACHE_NAME = 'quran-audio-cache-v1';
const MAX_AUDIO_CACHE_SIZE = 50; // Max 50 audio files cached

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(err => console.error('[SW] Cache failed:', err))
    );
    self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME && name !== API_CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Smart caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests (alquran.cloud) - Stale while revalidate
    if (url.hostname.includes('alquran.cloud')) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // Handle audio files - Cache first with size limit
    if (url.hostname.includes('mp3quran.net') || request.url.endsWith('.mp3')) {
        event.respondWith(cacheFirstWithLimit(request, AUDIO_CACHE_NAME, MAX_AUDIO_CACHE_SIZE));
        return;
    }

    // Handle static assets - Cache first
    event.respondWith(cacheFirst(request));
});

// ==================== Caching Strategies ====================

// Cache First - For static assets
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/quran-game/offline.html');
        }
        return new Response('Offline', { status: 503 });
    }
}

// Stale While Revalidate - For API calls (show cache, update in background)
async function staleWhileRevalidate(request) {
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            const headers = new Headers(responseToCache.headers);
            headers.append('sw-cache-timestamp', Date.now().toString());
            
            const responseWithTimestamp = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
            });
            
            cache.put(request, responseWithTimestamp);
        }
        return networkResponse;
    }).catch(() => null);

    // Return cached response if available, otherwise wait for network
    if (cachedResponse) {
        // Check if cache is still valid
        const timestamp = cachedResponse.headers.get('sw-cache-timestamp');
        if (timestamp && (Date.now() - parseInt(timestamp)) < API_CACHE_DURATION) {
            console.log('[SW] Serving from cache:', request.url);
            return cachedResponse;
        }
    }

    return fetchPromise || new Response(
        JSON.stringify({ error: 'Offline mode - No cached data available' }),
        { headers: { 'Content-Type': 'application/json' } }
    );
}

// Cache First with Size Limit - For audio files
async function cacheFirstWithLimit(request, cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Check cache size and evict if needed
            const keys = await cache.keys();
            if (keys.length >= maxSize) {
                // Remove oldest entry
                await cache.delete(keys[0]);
                console.log('[SW] Evicted oldest audio from cache');
            }
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return new Response('Audio offline', { status: 503 });
    }
}

// Background Sync for bookmarks
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-bookmarks') {
        event.waitUntil(syncBookmarks());
    }
});

async function syncBookmarks() {
    // This would sync bookmarks with a server if available
    console.log('[SW] Syncing bookmarks...');
}

// Push Notifications (for prayer times, optional)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data?.text() || 'Notification from Quran App',
        icon: '/quran-game/icons/icon-192x192.png',
        badge: '/quran-game/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: '/quran-game/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('Quran App', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
