// نقطة الدخول: تهيئة Three.js، العالم، اللاعب، المخزون، التصنيع، الأفران، وحلقة اللعبة.
import * as THREE from "three";
import { World } from "./world/World.js";
import { Player } from "./player/Player.js";
import { Hotbar } from "./ui/Hotbar.js";
import { InventoryUI } from "./ui/InventoryUI.js";
import { raycastVoxel } from "./utils/Raycast.js";
import { AIR, getBlock, blockDrop } from "./world/BlockData.js";
import { Inventory } from "./player/Inventory.js";
import { DropManager } from "./blocks/BlockDrops.js";
import { FurnaceManager } from "./crafting/Furnace.js";
import { getItem, isPlaceable, placeBlockId } from "./items/Items.js";
import { getTool, BLOCK_TOOL } from "./player/Tools.js";
import { HealthSystem } from "./player/Health.js";
import { SoundManager } from "./utils/SoundManager.js";
import { EXHAUSTION_PER_BREAK } from "./utils/Constants.js";
import { saveGame, loadGame } from "./utils/SaveLoad.js";
import { EntityManager } from "./entities/EntityManager.js";

const canvas = document.getElementById("game");
const menu = document.getElementById("menu");
const crosshair = document.getElementById("crosshair");
const hud = document.getElementById("hud");
const debug = document.getElementById("debug");
const menuHidden = () => menu.classList.contains("hidden");

// ===== Three.js =====
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const SKY = new THREE.Color(0x7ec0ee);
scene.background = SKY;
scene.fog = new THREE.Fog(SKY, 40, 90);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const sun = new THREE.DirectionalLight(0xffffff, 1.1);
sun.position.set(0.6, 1, 0.4);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xb8d0e8, 0.7));

// ===== العالم واللاعب والأنظمة =====
const world = new World(scene);
const player = new Player(world, camera);
const inventory = new Inventory();
const drops = new DropManager(scene, world);
drops.onPickup = () => sound.playPickup();
const furnaces = new FurnaceManager();
const hotbar = new Hotbar(document.getElementById("hotbar"), inventory);
const health = new HealthSystem();
const sound = new SoundManager();
const entityManager = new EntityManager(scene, world);
entityManager._onAttack = (damage) => {
  health.takeDamage(damage);
  updateHUD();
};
entityManager._onDrop = (x, y, z, dropList) => {
  for (const d of dropList) drops.spawn(x, y, z, d.id, d.count);
};

function renderStatBar(el, value, max, fullChar, emptyChar) {
  el.innerHTML = "";
  for (let i = 0; i < max; i += 2) {
    const n = Math.min(2, max - i);
    const filled = Math.min(n, value - i);
    const s = document.createElement("span");
    s.className = "stat-icon";
    s.textContent = filled >= 2 ? fullChar : filled >= 1 ? fullChar.slice(0, 1) + emptyChar.slice(1) : emptyChar;
    el.appendChild(s);
  }
}

function updateHUD() {
  renderStatBar(document.getElementById("health-bar"), health.health, 20, "❤️", "🖤");
  renderStatBar(document.getElementById("food-bar"), health.food, 20, "🍗", "💧");
}

health.onChange = updateHUD;
health.onDeath = () => {
  document.getElementById("death-screen").classList.remove("hidden");
  sound.playDeath();
  document.exitPointerLock();
};

const saveData = loadGame();

player.health = health;
window._kcYaw = 0;
window._kcPitch = 0;

// حفظ تلقائي كل 30 ثانية
let _saveTimer = 0;

function autoSave(dt) {
  if (!gameStarted) return;
  _saveTimer += dt;
  if (_saveTimer >= 30) {
    _saveTimer = 0;
    saveGame(player, inventory, health, world, drops);
  }
}

const ui = new InventoryUI(inventory);
ui.onClose = () => {
  crosshair.classList.remove("hidden");
  if (menuHidden()) requestAnimationFrame(() => { canvas.requestPointerLock().catch(() => {}); });
};

// ===== صندوق التحديد + تراكب التكسير =====
const highlight = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(1.001, 1.001, 1.001)),
  new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 })
);
highlight.visible = false;
scene.add(highlight);

const crackMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false });
const crackBox = new THREE.Mesh(new THREE.BoxGeometry(1.03, 1.03, 1.03), crackMat);
crackBox.visible = false;
scene.add(crackBox);

// ===== التحكم بالنظر =====
let yaw = 0, pitch = 0, started = false, gameStarted = false;
let SENS = 0.0022;

document.addEventListener("mousemove", (e) => {
  if (!started) return;
  yaw -= e.movementX * SENS;
  pitch -= e.movementY * SENS;
  const lim = Math.PI / 2 - 0.01;
  pitch = Math.max(-lim, Math.min(lim, pitch));
});
document.addEventListener("pointerlockchange", () => { started = document.pointerLockElement === canvas; });

// ===== أدوات مساعدة =====
let lastDir = new THREE.Vector3();
const _eyeOrigin = new THREE.Vector3();
function eyeOrigin() { return _eyeOrigin.set(player.pos.x, player.pos.y + player.eye, player.pos.z); }

function intersectsPlayer(bx, by, bz) {
  const minX = player.pos.x - 0.3, maxX = player.pos.x + 0.3;
  const minZ = player.pos.z - 0.3, maxZ = player.pos.z + 0.3;
  const minY = player.pos.y, maxY = player.pos.y + player.height;
  return (bx + 1 > minX && bx < maxX && by + 1 > minY && by < maxY && bz + 1 > minZ && bz < maxZ);
}

function heldTool() {
  const s = inventory.selectedStack;
  if (s) { const it = getItem(s.id); if (it && it.tool) return getTool(it.tool); }
  return getTool("fist");
}

function breakTime(id, tool) {
  const b = getBlock(id);
  const info = BLOCK_TOOL[b.name];
  const correct = !info || info.kind === "any" || tool.kind === info.kind;
  const speed = correct ? tool.speed : 1;
  const mult = correct ? 1.5 : 5;
  return Math.max(0.05, (b.hardness || 1) * mult / speed);
}

function canDrop(id, tool) {
  const b = getBlock(id);
  const info = BLOCK_TOOL[b.name];
  if (!info || info.kind === "any") return true;
  if (tool.kind !== info.kind) return false;
  return tool.tier >= (info.minTier || 0);
}

function damageTool() {
  const s = inventory.selectedStack;
  if (!s) return;
  const it = getItem(s.id);
  if (!it || !it.tool) return;
  const t = getTool(it.tool);
  if (t.durability === Infinity) return;
  s.dur = (s.dur == null ? t.durability : s.dur) - 1;
  if (s.dur <= 0) inventory.consumeSelected(1);
  inventory._changed();
}

// ===== التعدين (كسر مستمر بالضغط) =====
let mineDown = false, miningKey = null, miningProgress = 0;

function resetMining() {
  miningKey = null; miningProgress = 0;
  crackBox.visible = false; crackMat.opacity = 0;
}

function updateMining(dt) {
  if (!mineDown) { resetMining(); return; }
  const hit = raycastVoxel(world, eyeOrigin(), lastDir);
  if (!hit) { resetMining(); return; }
  const id = world.getBlock(hit.block[0], hit.block[1], hit.block[2]);
  if (id === AIR || getBlock(id).liquid) { resetMining(); return; }

  const key = hit.block.join(",");
  if (key !== miningKey) { miningKey = key; miningProgress = 0; }

  const tool = heldTool();
  miningProgress += dt / breakTime(id, tool);

  if (miningProgress >= 1) {
    if (canDrop(id, tool)) {
      const d = blockDrop(id);
      if (d) drops.spawn(hit.block[0], hit.block[1], hit.block[2], d, 1);
    }
    if (getBlock(id).name === "furnace") dropFurnace(hit.block);
    world.setBlock(hit.block[0], hit.block[1], hit.block[2], AIR);
    damageTool();
    health.addExhaustion(EXHAUSTION_PER_BREAK);
    sound.playBreak();
    resetMining();
    return;
  }

  crackBox.position.set(hit.block[0] + 0.5, hit.block[1] + 0.5, hit.block[2] + 0.5);
  crackBox.visible = true;
  crackMat.opacity = 0.15 + miningProgress * 0.55;
}

function dropFurnace(pos) {
  const s = furnaces.get(pos[0], pos[1], pos[2]);
  for (const stack of [s.input, s.fuel, s.output]) {
    if (stack) drops.spawn(pos[0], pos[1], pos[2], stack.id, stack.count);
  }
  furnaces.remove(pos[0], pos[1], pos[2]);
}

// ===== فتح/إغلاق الواجهات =====
function openUI(mode, furnaceState = null) {
  resetMining(); mineDown = false;
  crosshair.classList.add("hidden");
  document.exitPointerLock();
  ui.open(mode, furnaceState);
}

// ===== الفأرة =====
canvas.addEventListener("mousedown", (e) => {
  if (!started || ui.isOpen) return;
  if (e.button === 0) {
    const eo = eyeOrigin();
    const hitEntity = entityManager.getEntityAt(eo.x, eo.y, eo.z, lastDir, 5);
    if (hitEntity) {
      const sel = inventory.selectedStack;
      const it = sel ? getItem(sel.id) : null;
      const dmg = (it && it.damage) ? it.damage : 1;
      entityManager.attackEntity(hitEntity, dmg);
      if (it && it.tool && getTool(it.tool).durability < Infinity) {
        sel.dur = (sel.dur == null ? getTool(it.tool).durability : sel.dur) - 1;
        if (sel.dur <= 0) inventory.consumeSelected(1);
        inventory._changed();
      }
      return;
    }
    mineDown = true;
    return;
  }
  if (e.button === 2) rightClick();
});
canvas.addEventListener("mouseup", (e) => { if (e.button === 0) { mineDown = false; resetMining(); } });
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("blur", () => { mineDown = false; resetMining(); });

function rightClick() {
  const hit = raycastVoxel(world, eyeOrigin(), lastDir);
  if (!hit) return;
  const id = world.getBlock(hit.block[0], hit.block[1], hit.block[2]);
  const name = getBlock(id).name;

  if (name === "crafting_table") { openUI("table"); return; }
  if (name === "furnace") { openUI("furnace", furnaces.get(hit.block[0], hit.block[1], hit.block[2])); return; }

  const sel = inventory.selectedStack;
  if (!sel) return;

  // أكل الطعام
  const it = getItem(sel.id);
  if (it && it.food != null && health.food < 20) {
    health.eat(it.food, it.saturation);
    inventory.consumeSelected(1);
    sound.playEat();
    updateHUD();
    return;
  }

  if (isPlaceable(sel.id)) {
    const [px, py, pz] = hit.place;
    if (!intersectsPlayer(px, py, pz)) {
      world.setBlock(px, py, pz, placeBlockId(sel.id));
      inventory.consumeSelected(1);
      sound.playPlace();
    }
  }
}

// ===== لوحة المفاتيح: المخزون =====
window.addEventListener("keydown", (e) => {
  if (!gameStarted) return;
  if (e.code === "KeyE") {
    if (ui.isOpen) ui.close();
    else openUI("inventory");
  } else if (e.code === "Escape" && ui.isOpen) {
    ui.close();
  } else if (e.code === "Escape" && settingsPanel.classList.contains("open")) {
    settingsPanel.classList.remove("open");
  } else if (e.code === "Escape" && modalComing.classList.contains("open")) {
    modalComing.classList.remove("open");
  } else if (e.code === "Escape" && modalExit.classList.contains("open")) {
    modalExit.classList.remove("open");
  }
});

// ===== إعادة الحياة =====
document.getElementById("btn-respawn").addEventListener("click", () => {
  health.reset();
  player.spawn();
  entityManager.clear();
  highlight.visible = false;
  crackBox.visible = false;
  crackMat.opacity = 0;
  document.getElementById("death-screen").classList.add("hidden");
  updateHUD();
});

function startGame() {
  try {
    world.update(new THREE.Vector3(0, 0, 0));
    updateHUD();

    if (saveData) {
      player.pos.set(saveData.player.x, saveData.player.y, saveData.player.z);
      player.vel.set(0, 0, 0);
      yaw = saveData.player.yaw || 0;
      pitch = saveData.player.pitch || 0;
      player.flying = saveData.player.flying || false;
      player.thirdPerson = saveData.player.thirdPerson || false;
      if (saveData.inventory) {
        for (let i = 0; i < saveData.inventory.length && i < inventory.slots.length; i++) {
          inventory.slots[i] = saveData.inventory[i] ? { id: saveData.inventory[i].id, count: saveData.inventory[i].count, dur: saveData.inventory[i].dur } : null;
        }
        if (saveData.armor) {
          for (let i = 0; i < saveData.armor.length && i < inventory.armor.length; i++) {
            inventory.armor[i] = saveData.armor[i] ? { id: saveData.armor[i].id, count: saveData.armor[i].count, dur: saveData.armor[i].dur } : null;
          }
        }
        inventory.selectedHotbar = saveData.selectedHotbar || 0;
      }
      health.health = saveData.player.health ?? 20;
      health.food = saveData.player.food ?? 20;
      health.saturation = saveData.player.saturation ?? 20;
      health.setArmor(inventory.getArmorValue());
      updateHUD();
    } else {
      player.spawn();
      inventory.giveStarter();
    }
    lastDir = player.applyCamera(yaw, pitch);
    gameStarted = true;
    menu.classList.add("hidden");
    crosshair.classList.remove("hidden");
    hud.classList.remove("hidden");
    debug.classList.remove("hidden");
    const p = canvas.requestPointerLock();
    if (p && p.catch) p.catch(() => {});
  } catch (err) {
    if (window.kcError) window.kcError("فشل بدء اللعبة: " + (err && err.stack ? err.stack : err));
    else alert("خطأ: " + err);
  }
}

// ===== زر اللعب =====
document.getElementById("btn-play").addEventListener("click", startGame);

// ===== الإعدادات =====
const settingsPanel = document.getElementById("settings-panel");
const volSlider = document.getElementById("vol-slider");
const sensSlider = document.getElementById("sens-slider");

document.getElementById("btn-settings").addEventListener("click", () => {
  volSlider.value = Math.round(sound._volume * 100);
  sensSlider.value = Math.round((SENS / 0.0022) * 10);
  settingsPanel.classList.add("open");
});

function closeSettings() {
  sound._volume = parseInt(volSlider.value) / 100;
  SENS = 0.0022 * (parseInt(sensSlider.value) / 10);
  settingsPanel.classList.remove("open");
}

document.getElementById("btn-back-menu").addEventListener("click", closeSettings);
settingsPanel.addEventListener("click", (e) => {
  if (e.target === settingsPanel) closeSettings();
});

// ===== ماركت بليس (قريباً) =====
const modalComing = document.getElementById("modal-coming");
document.getElementById("btn-marketplace").addEventListener("click", () => {
  modalComing.classList.add("open");
});
document.getElementById("btn-close-coming").addEventListener("click", () => {
  modalComing.classList.remove("open");
});
modalComing.addEventListener("click", (e) => {
  if (e.target === modalComing) modalComing.classList.remove("open");
});

// ===== خروج =====
const modalExit = document.getElementById("modal-exit");
document.getElementById("btn-exit").addEventListener("click", () => {
  modalExit.classList.add("open");
});
document.getElementById("btn-confirm-exit").addEventListener("click", () => {
  window.close();
});
document.getElementById("btn-cancel-exit").addEventListener("click", () => {
  modalExit.classList.remove("open");
});
modalExit.addEventListener("click", (e) => {
  if (e.target === modalExit) modalExit.classList.remove("open");
});

canvas.addEventListener("click", () => {
  if (!started && menuHidden() && !ui.isOpen) canvas.requestPointerLock().catch(() => {});
});

// ===== حلقة اللعبة =====
let last = performance.now();
let frames = 0, fpsTime = 0, fps = 0;
let debugTimer = 0;

function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (gameStarted) {
    furnaces.tick(dt);
    health.setArmor(inventory.getArmorValue());
    health.tick(dt);
    autoSave(dt);
  }

  if (menuHidden()) {
    const playing = !ui.isOpen && !health.dead;
    if (playing) {
      player.update(dt, yaw);
      lastDir = player.applyCamera(yaw, pitch);
      window._kcYaw = yaw;
      window._kcPitch = pitch;
      updateMining(dt);
      drops.update(dt, player, inventory);
      entityManager.update(dt, player.pos);
    } else {
      lastDir = player.applyCamera(yaw, pitch);
      ui.tickFurnace();
    }
    world.update(player.pos);

    const hit = playing ? raycastVoxel(world, eyeOrigin(), lastDir) : null;
    if (hit) {
      highlight.visible = true;
      highlight.position.set(hit.block[0] + 0.5, hit.block[1] + 0.5, hit.block[2] + 0.5);
    } else {
      highlight.visible = false;
    }

    frames++; debugTimer += dt;
    if (debugTimer >= 0.5) {
      fps = Math.round(frames / debugTimer);
      frames = 0; debugTimer = 0;
      debug.textContent =
        `KingCraft v0.4\n` +
        `FPS: ${fps}\n` +
        `XYZ: ${player.pos.x.toFixed(1)} ${player.pos.y.toFixed(1)} ${player.pos.z.toFixed(1)}\n` +
        `chunks: ${world.chunks.size} • drops: ${drops.entities.length} • mobs: ${entityManager.entities.length}` +
        (player.flying ? "\n[طيران]" : "") +
        (player.sneaking ? "\n[زحف]" : "");
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ===== تغيير الحجم =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== PWA =====
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    // امسح كل التخزين المؤقت أولاً عشان نتأكد من تحميل أحدث الملفات
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
