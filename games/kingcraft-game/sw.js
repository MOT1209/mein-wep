// Service Worker — تخزين مؤقت للأصول المحلية (لا يخزّن CDN لتفادي مشاكل التحديث)
const CACHE = "kingcraft-v3";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./css/main.css",
  "./css/hud.css",
  "./css/menu.css",
  "./css/inventory.css",
  "./css/health.css",
  "./js/main.js",
  "./js/utils/Constants.js",
  "./js/utils/Noise.js",
  "./js/utils/Raycast.js",
  "./js/player/Player.js",
  "./js/player/Inventory.js",
  "./js/player/Tools.js",
  "./js/blocks/BlockTexture.js",
  "./js/blocks/BlockDrops.js",
  "./js/items/Items.js",
  "./js/world/BlockData.js",
  "./js/world/Chunk.js",
  "./js/world/TerrainGen.js",
  "./js/world/World.js",
  "./js/crafting/Recipes.js",
  "./js/crafting/Crafting.js",
  "./js/crafting/Furnace.js",
  "./js/crafting/Smelting.js",
  "./js/ui/Hotbar.js",
  "./js/ui/InventoryUI.js",
  "./js/player/Health.js",
  "./js/utils/SoundManager.js",
  "./js/utils/SaveLoad.js",
  "./icons/icon-48.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
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
