// Quran App Service Worker - Offline Support
const CACHE_NAME = 'quran-app-v2';
const STATIC_ASSETS = [
    '/apps/quran-app/',
    '/apps/quran-app/index.html',
    '/apps/quran-app/css/style.css',
    '/apps/quran-app/js/app.js',
    '/apps/quran-app/js/quran-data.js'
];

// API Cache Configuration
const API_CACHE_NAME = 'quran-api-cache-v2';
const API_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

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

// Fetch Event - Network first, then cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests
    if (url.hostname.includes('alquran.cloud')) {
        event.respondWith(handleAPIRequest(request));
        return;
    }

    // Handle static assets
    event.respondWith(
        caches.match(request).then(response => {
            if (response) {
                return response;
            }
            return fetch(request)
                .then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    return networkResponse;
                })
                .catch(() => {
                    // Return offline fallback
                    return new Response(
                        '<h1 style="text-align:center;font-family:sans-serif;padding:50px;">أنت في وضع عدم الاتصال<br>Offline Mode</h1>',
                        { headers: { 'Content-Type': 'text/html' } }
                    );
                });
        })
    );
});

// Handle API requests with smart caching
async function handleAPIRequest(request) {
    const cache = await caches.open(API_CACHE_NAME);
    
    // Try network first
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            // Store with timestamp
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
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            // Check if cache is still valid
            const timestamp = cachedResponse.headers.get('sw-cache-timestamp');
            if (timestamp && (Date.now() - parseInt(timestamp)) < API_CACHE_DURATION) {
                console.log('[SW] Serving from cache:', request.url);
                return cachedResponse;
            }
        }
        // Return offline error
        return new Response(
            JSON.stringify({ error: 'Offline mode - No cached data available' }),
            { headers: { 'Content-Type': 'application/json' } }
        );
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
        icon: '/apps/quran-app/images/icon-192x192.png',
        badge: '/apps/quran-app/images/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: '/apps/quran-app/'
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
