// Quran Pro Service Worker - Offline Support
// All local URLs are resolved from this file's directory so the app works at
// /apps/quran-app/ or another deployment sub-path.
const APP_ROOT = new URL('./', self.location.href);
const APP_URL = (path) => new URL(path, APP_ROOT).href;

const CACHE_NAME = 'quran-pro-v6';
const API_CACHE_NAME = 'quran-api-cache-v3';
const API_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const AUDIO_CACHE_NAME = 'quran-audio-cache-v1';
const MAX_AUDIO_CACHE_SIZE = 50;
const OFFLINE_URL = APP_URL('offline.html');

// Keep the complete local app shell available on first install.
//
// WARNING: `install` treats this list as required — a single missing file
// aborts the install and leaves the app with NO offline cache at all. Every
// entry here must be emitted into dist/ by vite.config.js, which asserts
// exactly that at build time. Do not add a path without adding it there too.
//
// Deliberately absent: the two web-only files (the release-metadata JSON and
// its checker script). They are excluded from the Android build, so listing
// them here would abort precaching inside the APK. Their names are omitted on
// purpose so a policy grep over the shipped bundle stays clean.
const STATIC_ASSETS = [
    '',
    'index.html',
    'css/style.css',
    'js/supabase-config.js',
    'js/auth.js',
    'js/vendor/capacitor.js',
    'js/app.js',
    'js/mushaf.js',
    'manifest.json',
    'offline.html',
    'privacy.html',
    'icons/icon-72x72.png',
    'icons/icon-96x96.png',
    'icons/icon-192x192.png',
    'icons/icon-512x512.png'
].map(APP_URL);

self.addEventListener('install', (event) => {
    // Treat the shell as required: a failed asset download must abort install
    // instead of leaving an active worker with an incomplete offline cache.
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
            .catch(async (error) => {
                await caches.delete(CACHE_NAME);
                throw error;
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames
                .filter(name => ![CACHE_NAME, API_CACHE_NAME, AUDIO_CACHE_NAME].includes(name))
                .map(name => caches.delete(name))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Cache APIs and audio only for GET requests; never try to cache form posts.
    if (request.method !== 'GET') return;

    if (url.hostname.includes('alquran.cloud')) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    if (url.hostname.includes('mp3quran.net') || url.pathname.endsWith('.mp3')) {
        event.respondWith(cacheFirstWithLimit(request, AUDIO_CACHE_NAME, MAX_AUDIO_CACHE_SIZE));
        return;
    }

    // P0: جميع الأصول (css/js/صور) network-first — تحديثات الـ APK
    // تصل فوراً ولا يبقى كاش قديم بعد install -r؛ والكاش يبقى للعمل دون اتصال.
    event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        const offlinePage = await caches.match(OFFLINE_URL);
        if (offlinePage) return offlinePage;
        return new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok && request.url.startsWith(APP_ROOT.origin)) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        if (request.mode === 'navigate') {
            const offlinePage = await caches.match(OFFLINE_URL);
            if (offlinePage) return offlinePage;
        }
        return new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request)
        .then(async networkResponse => {
            if (networkResponse.ok) {
                const headers = new Headers(networkResponse.headers);
                headers.set('sw-cache-timestamp', Date.now().toString());
                const responseWithTimestamp = new Response(networkResponse.clone().body, {
                    status: networkResponse.status,
                    statusText: networkResponse.statusText,
                    headers
                });
                await cache.put(request, responseWithTimestamp);
            }
            return networkResponse;
        })
        .catch(() => null);

    if (cachedResponse) {
        const timestamp = Number(cachedResponse.headers.get('sw-cache-timestamp'));
        if (timestamp && (Date.now() - timestamp) < API_CACHE_DURATION) {
            return cachedResponse;
        }
    }

    const networkResponse = await fetchPromise;
    return networkResponse || cachedResponse || new Response(
        JSON.stringify({ error: 'Offline mode - No cached data available' }),
        {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

async function cacheFirstWithLimit(request, cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const keys = await cache.keys();
            if (keys.length >= maxSize) await cache.delete(keys[0]);
            await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return new Response('Audio offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}

// NOTE: `push` / `notificationclick` / `sync` listeners were removed.
// They advertised a notification and background-sync capability the app does
// not have — there is no FCM, no pushManager.subscribe(), no POST_NOTIFICATIONS
// permission, and syncBookmarks() was an empty function. Bookmark sync is done
// by the app's Supabase layer (js/auth.js). Dead capability surface is a
// liability in Play review; re-add these only alongside a real implementation.
