const KEY = "kc-save";
const DB_NAME = "kc-world";
const DB_VERSION = 1;
const STORE = "chunks";

let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror = () => { _db = null; reject(req.error); };
  });
}

export async function saveChunk(cx, cz, blocks) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blocks, cx + "," + cz);
    return new Promise((resolve) => { tx.oncomplete = () => resolve(true); tx.onerror = () => resolve(false); });
  } catch (e) {
    return false;
  }
}

export async function loadChunk(cx, cz) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(cx + "," + cz);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

export async function hasChunk(cx, cz) {
  const data = await loadChunk(cx, cz);
  return data !== null;
}

export function saveGame(player, inventory, health, world, drops) {
  try {
    const data = {
      version: 1,
      time: Date.now(),
      player: {
        x: player.pos.x,
        y: player.pos.y,
        z: player.pos.z,
        yaw: window._kcYaw || 0,
        pitch: window._kcPitch || 0,
        health: health ? health.health : 20,
        food: health ? health.food : 20,
        saturation: health ? health.saturation : 20,
        flying: player.flying,
        thirdPerson: player.thirdPerson,
      },
      inventory: inventory.slots.map(s => s ? { id: s.id, count: s.count, dur: s.dur } : null),
      armor: inventory.armor.map(s => s ? { id: s.id, count: s.count, dur: s.dur } : null),
      offhand: inventory.offhand ? { id: inventory.offhand.id, count: inventory.offhand.count, dur: inventory.offhand.dur } : null,
      selectedHotbar: inventory.selectedHotbar,
    };
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version < 1 || !data.player || !data.inventory) return null;
    return data;
  } catch (e) {
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(KEY);
}
