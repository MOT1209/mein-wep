// Denkmalen service worker.
// Served from /denkmalen/sw.js, so its scope is /denkmalen/ — matching basePath.
//
// Bump CACHE_VERSION whenever the shell or strategies below change; the old
// caches are dropped on activate.
const CACHE_VERSION = 'v1'
const SHELL_CACHE = `denkmalen-shell-${CACHE_VERSION}`
const ASSET_CACHE = `denkmalen-assets-${CACHE_VERSION}`

const BASE = '/denkmalen'

// The static export emits the whole app as one page, so the shell is small.
// Hashed _next/static assets are cached lazily on first use instead of being
// listed here, since their filenames change every build.
const SHELL_URLS = [
  `${BASE}/`,
  `${BASE}/manifest.json`,
  `${BASE}/favicon.svg`,
  `${BASE}/icons/icon-192.png`,
  `${BASE}/icons/icon-512.png`,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // A single missing URL would reject addAll and abort the whole install,
      // so failures are tolerated per-URL and retried on first fetch.
      .then((cache) =>
        Promise.all(
          SHELL_URLS.map((url) =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
          )
        )
      )
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('denkmalen-') && key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// Cache-first: hashed build assets are immutable, so a hit is always correct.
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(ASSET_CACHE)
    cache.put(request, response.clone())
  }
  return response
}

// Network-first: keeps navigations fresh online, falls back to the cached
// shell when the network is gone (the offline case this game is built for).
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (err) {
    const cached = (await caches.match(request)) || (await caches.match(`${BASE}/`))
    if (cached) return cached
    throw err
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Never touch cross-origin traffic (Supabase, Gemini, socket.io transports):
  // those are either live-only or authenticated, and stale replies would be wrong.
  if (url.origin !== self.location.origin) return
  if (!url.pathname.startsWith(BASE)) return

  // The AI judge and any other API route must stay live — a cached verdict
  // would be replayed for a different drawing.
  if (url.pathname.startsWith(`${BASE}/api/`)) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  if (url.pathname.startsWith(`${BASE}/_next/static/`) || url.pathname.startsWith(`${BASE}/icons/`)) {
    event.respondWith(cacheFirst(request))
    return
  }

  event.respondWith(networkFirst(request))
})
