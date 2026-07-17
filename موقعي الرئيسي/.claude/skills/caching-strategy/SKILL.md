---
name: caching-strategy
description: Implement comprehensive caching — browser cache, CDN, service worker, API caching
triggers:
  - caching strategy
  - browser cache
  - CDN caching
  - service worker cache
  - Cache-Control headers
  - performance optimization
---

# Caching Strategy Skill

## Overview
Implement comprehensive caching for Rashid's portfolio to maximize performance and minimize load times.

## Caching Layers

### 1. Browser Cache (HTTP Headers)
```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/css/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/js/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)\\.html",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, must-revalidate" }
      ]
    }
  ]
}
```

### 2. Service Worker Cache
```javascript
// sw.js
const CACHE_NAME = 'rashid-portfolio-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/offline.html'
];

// Install: Precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Fetch: Cache-first for static, Network-first for dynamic
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return caches.match(request);
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  });
  return cached || fetchPromise;
}
```

### 3. API Response Caching
```javascript
// In-memory cache for API responses
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function cachedFetch(url, options = {}) {
  const cacheKey = `${url}${JSON.stringify(options)}`;
  const cached = apiCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await fetch(url, options);
  const data = await response.json();

  apiCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

## Cache Strategy by Content Type

| Content Type | Strategy | TTL | Notes |
|--------------|----------|-----|-------|
| HTML pages | No-cache | 0 | Always fresh |
| CSS/JS bundles | Immutable | 1 year | Hash in filename |
| Images | Cache-first | 1 year | WebP format |
| Fonts | Cache-first | 1 year | Preload critical |
| API data | Stale-while-revalidate | 5 min | Background update |
| Dynamic API | Network-first | 0 | No caching |

## Rules
- Static assets: immutable with versioned filenames
- HTML: no-cache, must-revalidate
- Images: cache-first with lazy loading
- API responses: stale-while-revalidate (5 min)
- Service worker: precache critical assets
- Cache size limit: 50MB maximum
- Always provide offline fallback
