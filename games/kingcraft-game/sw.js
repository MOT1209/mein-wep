// Service Worker — تخزين مؤقت للأصول المحلية (لا يخزّن CDN لتفادي مشاكل التحديث)
const CACHE = "kingcraft-v1";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./css/main.css",
  "./css/hud.css",
  "./css/menu.css",
  "./js/main.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // مرّر طلبات CDN مباشرة للشبكة
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
