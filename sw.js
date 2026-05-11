const CACHE_NAME = 'rashid-portfolio-v5';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './css/admin.css',
    './css/app-mode.css',
    './css/mobile-improvements.css',
    './js/script.js',
    './js/rashid-ai-v2.js',
    './js/supabase-config.js',
    './Rashid-app/index.html',
    './Rashid-app/style.css',
    './Rashid-app/script.js',
    './images/logo.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'
];

// Install Event - Cache Files
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force activation
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching updated assets');
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

// Fetch Event - Network First, then Cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});
