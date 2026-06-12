// طبقة حفظ متوافقة مع نظام العوالم
import * as WM from "./WorldManager.js";

let _worldId = null;

export function setWorldId(id) { _worldId = id; }
export function getWorldId() { return _worldId; }

export async function saveChunk(cx, cz, blocks) {
  if (!_worldId) return false;
  return WM.saveChunk(_worldId, cx, cz, blocks);
}

export async function loadChunk(cx, cz) {
  if (!_worldId) return null;
  return WM.loadChunk(_worldId, cx, cz);
}

export async function hasChunk(cx, cz) {
  if (!_worldId) return false;
  return WM.hasChunk(_worldId, cx, cz);
}

export function saveGame(player, inventory, health, world, drops) {
  if (!_worldId) return false;
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
    WM.savePlayerData(_worldId, data);
    return true;
  } catch (e) {
    return false;
  }
}

export async function loadGame() {
  if (!_worldId) return null;
  try {
    return await WM.loadPlayerData(_worldId);
  } catch (e) {
    return null;
  }
}

export function deleteSave() {
  // no-op: world saves are managed per-world
}
