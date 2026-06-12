// مدير العوالم: تخزين عوالم متعددة + حفظ/تحميل لكل عالم
const DB_NAME = "kc-world";
const DB_VERSION = 2;
const STORE_CHUNKS = "chunks";
const STORE_WORLDS = "worlds";
const STORE_SAVES = "saves";

let _db = null;
let _currentWorld = null;

const LEGACY_KEY = "kc-save";

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_CHUNKS))
        db.createObjectStore(STORE_CHUNKS);
      if (!db.objectStoreNames.contains(STORE_WORLDS))
        db.createObjectStore(STORE_WORLDS, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE_SAVES))
        db.createObjectStore(STORE_SAVES);
    };
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror = () => { _db = null; reject(req.error); };
  });
}

// ===== CRUD العوالم =====
export async function listWorlds() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_WORLDS, "readonly");
    const req = tx.objectStore(STORE_WORLDS).getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) { return []; }
}

export async function getWorld(id) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_WORLDS, "readonly");
    const req = tx.objectStore(STORE_WORLDS).get(id);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) { return null; }
}

export async function createWorld(name, seed, gameMode, difficulty) {
  try {
    const world = {
      id: "w_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      name: name || "My World",
      seed: seed || Math.floor(Math.random() * 2147483647).toString(),
      gameMode: gameMode || "survival",
      difficulty: difficulty || "normal",
      created: Date.now(),
      lastPlayed: Date.now(),
      playTime: 0,
    };
    const db = await openDB();
    const tx = db.transaction(STORE_WORLDS, "readwrite");
    tx.objectStore(STORE_WORLDS).put(world);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(world);
      tx.onerror = () => resolve(null);
    });
  } catch (e) { return null; }
}

export async function deleteWorld(id) {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_WORLDS, STORE_SAVES, STORE_CHUNKS], "readwrite");
    tx.objectStore(STORE_WORLDS).delete(id);
    tx.objectStore(STORE_SAVES).delete("player_" + id);
    // delete all chunks for this world
    const chunkStore = tx.objectStore(STORE_CHUNKS);
    const prefix = id + ",";
    const cursorReq = chunkStore.openCursor();
    cursorReq.onsuccess = (ev) => {
      const cursor = ev.target.result;
      if (cursor) {
        if (cursor.key.startsWith(prefix)) chunkStore.delete(cursor.key);
        cursor.continue();
      }
    };
    return new Promise((resolve) => { tx.oncomplete = () => resolve(true); tx.onerror = () => resolve(false); });
  } catch (e) { return false; }
}

export async function updateWorld(world) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_WORLDS, "readwrite");
    tx.objectStore(STORE_WORLDS).put(world);
    return new Promise((resolve) => { tx.oncomplete = () => resolve(true); tx.onerror = () => resolve(false); });
  } catch (e) { return false; }
}

// ===== حفظ/تحميل حالة اللاعب لكل عالم =====
export async function savePlayerData(worldId, data) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SAVES, "readwrite");
    tx.objectStore(STORE_SAVES).put(JSON.stringify(data), "player_" + worldId);
    return new Promise((resolve) => { tx.oncomplete = () => resolve(true); tx.onerror = () => resolve(false); });
  } catch (e) { return false; }
}

export async function loadPlayerData(worldId) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SAVES, "readonly");
      const req = tx.objectStore(STORE_SAVES).get("player_" + worldId);
      req.onsuccess = () => {
        const raw = req.result;
        resolve(raw ? JSON.parse(raw) : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) { return null; }
}

// ===== بلوكات (chunks) مع مفتاح العالم =====
export async function saveChunk(worldId, cx, cz, blocks) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CHUNKS, "readwrite");
    tx.objectStore(STORE_CHUNKS).put(blocks, worldId + "," + cx + "," + cz);
    return new Promise((resolve) => { tx.oncomplete = () => resolve(true); tx.onerror = () => resolve(false); });
  } catch (e) { return false; }
}

export async function loadChunk(worldId, cx, cz) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_CHUNKS, "readonly");
      const req = tx.objectStore(STORE_CHUNKS).get(worldId + "," + cx + "," + cz);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) { return null; }
}

export async function hasChunk(worldId, cx, cz) {
  const data = await loadChunk(worldId, cx, cz);
  return data !== null;
}

// ===== العالم الحالي =====
export function getCurrentWorld() { return _currentWorld; }
export function setCurrentWorld(w) { _currentWorld = w; }

// ===== ترقية من النظام القديم =====
export async function migrateLegacySave() {
  const legacyRaw = localStorage.getItem(LEGACY_KEY);
  if (!legacyRaw) return null;
  // read legacy chunk keys
  const db = await openDB();
  // create default world
  const world = await createWorld("My World");
  if (!world) return null;
  // copy legacy data
  await savePlayerData(world.id, JSON.parse(legacyRaw));
  // migrate chunks
  const prefixLen = "default,".length;
  const tx = db.transaction(STORE_CHUNKS, "readwrite");
  const store = tx.objectStore(STORE_CHUNKS);
  // check if there are legacy keys (no comma)
  const checkReq = store.openCursor();
  const toMigrate = [];
  await new Promise((resolve) => {
    checkReq.onsuccess = (ev) => {
      const cursor = ev.target.result;
      if (cursor) {
        const key = cursor.key;
        if (typeof key === "string" && !key.includes(",")) {
          toMigrate.push({ key, value: cursor.value });
        }
        cursor.continue();
      } else resolve();
    };
    checkReq.onerror = () => resolve();
  });
  for (const { key, value } of toMigrate) {
    store.delete(key);
    store.put(value, world.id + "," + key);
  }
  // remove legacy save
  localStorage.removeItem(LEGACY_KEY);
  return world;
}

// ===== إعدادات اللعبة (عامة) =====
const SETTINGS_KEY = "kc-settings";

const DEFAULT_SETTINGS = {
  masterVolume: 50,
  sfxVolume: 80,
  musicVolume: 50,
  sensitivity: 50,
  renderDistance: 8,
  fov: 80,
  brightness: 1.0,
  autoJump: true,
  invertY: false,
  language: "ar",
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch (e) { return { ...DEFAULT_SETTINGS }; }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (e) { return false; }
}

// ===== التأكد من وجود عالم افتراضي =====
export async function ensureDefaultWorld() {
  const worlds = await listWorlds();
  if (worlds.length > 0) return worlds[0];
  // try legacy migration
  const migrated = await migrateLegacySave();
  if (migrated) return migrated;
  return createWorld("My World");
}
