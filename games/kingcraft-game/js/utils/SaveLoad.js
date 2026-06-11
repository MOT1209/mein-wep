const KEY = "kc-save";

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
