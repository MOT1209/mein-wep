import * as THREE from "three";
import { World } from "./world/World.js";
import { Player } from "./player/Player.js";
import { Hotbar } from "./ui/Hotbar.js";
import { InventoryUI } from "./ui/InventoryUI.js";
import { raycastVoxel } from "./utils/Raycast.js";
import { AIR, getBlock, blockDrop, blockByName } from "./world/BlockData.js";
import { Inventory } from "./player/Inventory.js";
import { DropManager } from "./blocks/BlockDrops.js";
import { FurnaceManager } from "./crafting/Furnace.js";
import { getItem, isPlaceable, placeBlockId } from "./items/Items.js";
import { getTool, BLOCK_TOOL } from "./player/Tools.js";
import { HealthSystem } from "./player/Health.js";
import { SoundManager } from "./utils/SoundManager.js";
import { EXHAUSTION_PER_BREAK } from "./utils/Constants.js";
import { saveGame, loadGame, setWorldId } from "./utils/SaveLoad.js";
import * as WM from "./utils/WorldManager.js";
import { EntityManager } from "./entities/EntityManager.js";
import { FarmingSystem, isCropSeed, getCropInfo } from "./world/Farming.js";
import { MenuSystem } from "./ui/MenuSystem.js";
import { DebugTools } from "./game/DebugTools.js";

// ===== Three.js =====
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("game"), antialias: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

// ===== الأنظمة =====
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
const farming = new FarmingSystem(world);
const menu = new MenuSystem();
const debugTools = new DebugTools(scene, world, entityManager, player, renderer);

entityManager._onAttack = (damage) => { health.takeDamage(damage); updateHUD(); };
entityManager._onDrop = (x, y, z, dropList) => { for (const d of dropList) drops.spawn(x, y, z, d.id, d.count); };
entityManager._onMobHurt = () => sound.playMobHurt();
entityManager._onMobDeath = () => sound.playMobDeath();
player.sound = sound;
player.health = health;
player._yaw = 0;
player._pitch = 0;

// ===== الـ UI =====
const ui = new InventoryUI(inventory);
ui.onClose = () => {
  document.getElementById("crosshair").classList.remove("hidden");
  if (menu.allHidden()) requestAnimationFrame(() => { document.getElementById("game").requestPointerLock().catch(() => {}); });
};
const closeUI = () => { const pp = player.pos; ui.close(pp, drops); };
menu.closeUICallback = closeUI;

// ===== HUD =====
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
  renderStatBar(document.getElementById("health-bar"), health.health, 20, "❤", "🖤");
  renderStatBar(document.getElementById("food-bar"), health.food, 20, "🍗", "💧");
}

health.onChange = updateHUD;
health.onDeath = () => {
  document.getElementById("death-screen").classList.remove("hidden");
  sound.playDeath();
  document.exitPointerLock();
};

menu.onRespawn = () => {
  health.reset();
  player.spawn();
  entityManager.clear();
  highlight.visible = false;
  crackBox.visible = false;
  crackMat.opacity = 0;
  document.getElementById("death-screen").classList.add("hidden");
  updateHUD();
};

// ===== حفظ تلقائي =====
let _saveTimer = 0;
let _gameStarted = false;

function doSave() {
  if (!_gameStarted || !menu.currentWorld) return;
  saveGame(player, inventory, health, world, drops);
  const w = menu.currentWorld;
  w.lastPlayed = Date.now();
  WM.updateWorld(w);
}
menu.saveCallback = doSave;

// ===== توليد العوالم =====
(async function initWorlds() {
  const worlds = await WM.listWorlds();
  if (worlds.length === 0) {
    const w = await WM.createWorld("My World");
    if (w) menu.currentWorld = w;
  }
  const legacy = localStorage.getItem("kc-save");
  if (legacy && worlds.length === 0) {
    const migrated = await WM.migrateLegacySave();
    if (migrated) menu.currentWorld = migrated;
  }
  menu.renderWorldList();
})();

// ===== صندوق التحديد + الكراك =====
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

// ===== النظر =====
let yaw = 0, pitch = 0, started = false;
let SENS = 0.0022;
let _lastMouseX = null, _lastMouseY = null;

function applySettingsToScene(s) {
  SENS = 0.0022 * (s.sensitivity / 10);
  if (world) world.renderDistance = s.renderDistance;
  camera.fov = s.fov;
  camera.updateProjectionMatrix();
  scene.background.setHSL(0.58, 0.4, 0.6 * s.brightness);
}
const initSettings = WM.loadSettings();
applySettingsToScene(initSettings);

// ===== مساعدة =====
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

function dropFurnace(pos) {
  const s = furnaces.get(pos[0], pos[1], pos[2]);
  for (const stack of [s.input, s.fuel, s.output]) {
    if (stack) drops.spawn(pos[0], pos[1], pos[2], stack.id, stack.count);
  }
  furnaces.remove(pos[0], pos[1], pos[2]);
}

// ===== التعدين =====
let mineDown = false, miningKey = null, miningProgress = 0;

function resetMining() { miningKey = null; miningProgress = 0; crackBox.visible = false; crackMat.opacity = 0; }

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
  const prevCrack = Math.floor((miningProgress - dt / breakTime(id, tool)) / 0.25);
  const nowCrack = Math.floor(miningProgress / 0.25);
  if (nowCrack > prevCrack && nowCrack < 4) sound.playDig();
  if (miningProgress >= 1) {
    if (canDrop(id, tool)) { const d = blockDrop(id); if (d) drops.spawn(hit.block[0], hit.block[1], hit.block[2], d, 1); }
    if (getBlock(id).name === "furnace") dropFurnace(hit.block);
    farming.onBlockBreak(hit.block[0], hit.block[1], hit.block[2]);
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

// ===== الفأرة =====
document.getElementById("game").addEventListener("mousedown", (e) => {
  if ((!_gameStarted && !started) || ui.isOpen) return;
  if (e.button === 0) {
    const eo = eyeOrigin();
    const hitEntity = entityManager.getEntityAt(eo.x, eo.y, eo.z, lastDir, 5);
    if (hitEntity) {
      sound.playSwing();
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

document.getElementById("game").addEventListener("mouseup", (e) => { if (e.button === 0) { mineDown = false; resetMining(); } });
document.getElementById("game").addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("blur", () => { mineDown = false; resetMining(); });

function rightClick() {
  const hit = raycastVoxel(world, eyeOrigin(), lastDir);
  if (!hit) return;
  const id = world.getBlock(hit.block[0], hit.block[1], hit.block[2]);
  const name = getBlock(id).name;
  if (name === "crafting_table") { openUI("table"); return; }
  if (name === "furnace") { openUI("furnace", furnaces.get(hit.block[0], hit.block[1], hit.block[2])); return; }
  if (name === "enchanting_table") { openUI("enchant"); return; }
  const sel = inventory.selectedStack;
  if (!sel) return;
  const it = getItem(sel.id);
  if (it && it.food != null && health.food < 20) { health.eat(it.food, it.saturation); inventory.consumeSelected(1); sound.playEat(); updateHUD(); return; }
  const tool = sel.id ? getTool(sel.id) : null;
  if (tool && tool.kind === "hoe") {
    const [bx, by, bz] = hit.block;
    if (farming.till(bx, by, bz)) {
      sound.playPlace();
      const invIdx = inventory.selectedSlot;
      const stack = inventory.hotbar[invIdx];
      if (stack && stack.durability != null) { stack.durability -= 1; if (stack.durability <= 0) inventory.hotbar[invIdx] = null; }
      return;
    }
  }
  if (isCropSeed(sel.id)) {
    const [px, py, pz] = hit.place;
    if (!intersectsPlayer(px, py, pz) && farming.plant(px, py, pz, sel.id)) { inventory.consumeSelected(1); sound.playPlace(); return; }
  }
  const cropInfo = getCropInfo(id);
  if (cropInfo && cropInfo.stage >= 2) {
    const d2 = farming.harvest(hit.block[0], hit.block[1], hit.block[2]);
    if (d2) { for (const d of d2) drops.spawn(hit.block[0] + 0.5, hit.block[1] + 0.5, hit.block[2] + 0.5, d.id, d.count); sound.playBreak(); return; }
  }
  if (isPlaceable(sel.id)) {
    const [px, py, pz] = hit.place;
    if (!intersectsPlayer(px, py, pz)) { world.setBlock(px, py, pz, placeBlockId(sel.id)); inventory.consumeSelected(1); sound.playPlace(); }
  }
}

function openUI(mode, furnaceState = null) {
  resetMining(); mineDown = false;
  document.getElementById("crosshair").classList.add("hidden");
  document.exitPointerLock();
  ui.open(mode, furnaceState);
}

// ===== تشغيل اللعبة =====
menu.onStartGame = (worldData) => {
  menu.currentWorld = worldData;
  setWorldId(worldData.id);
  world.update(new THREE.Vector3(0, 0, 0));
  updateHUD();
  loadGame().then(data => {
    if (data) {
      player.pos.set(data.player.x, data.player.y, data.player.z);
      player.vel.set(0, 0, 0);
      yaw = data.player.yaw || 0;
      pitch = data.player.pitch || 0;
      player._yaw = yaw; player._pitch = pitch;
      player.flying = data.player.flying || false;
      player.thirdPerson = data.player.thirdPerson || false;
      player.bedPos = data.player.bedPos || null;
      if (data.inventory) {
        for (let i = 0; i < data.inventory.length && i < inventory.slots.length; i++) {
          inventory.slots[i] = data.inventory[i] ? { id: data.inventory[i].id, count: data.inventory[i].count, dur: data.inventory[i].dur } : null;
        }
        if (data.armor) {
          for (let i = 0; i < data.armor.length && i < inventory.armor.length; i++) {
            inventory.armor[i] = data.armor[i] ? { id: data.armor[i].id, count: data.armor[i].count, dur: data.armor[i].dur } : null;
          }
        }
        inventory.selectedHotbar = data.selectedHotbar || 0;
        inventory.offhand = data.offhand ? { id: data.offhand.id, count: data.offhand.count, dur: data.offhand.dur } : null;
      }
      health.health = data.player.health ?? 20;
      health.food = data.player.food ?? 20;
      health.saturation = data.player.saturation ?? 20;
      health.setArmor(inventory.getArmorValue());
      updateHUD();
    } else {
      player.spawn();
      inventory.giveStarter();
    }
    lastDir = player.applyCamera(yaw, pitch);
    _gameStarted = true;
    menu.gameStarted = true;
    menu.hideAll();
    document.getElementById("crosshair").classList.remove("hidden");
    document.getElementById("hud").classList.remove("hidden");
    document.getElementById("debug").classList.remove("hidden");
    const p = document.getElementById("game").requestPointerLock();
    if (p && p.catch) p.catch(() => { started = true; });
    if (document.pointerLockElement !== document.getElementById("game")) started = true;
  }).catch((err) => {
    console.warn("KingCraft: فشل تحميل السيف, بدء عالم جديد", err);
    player.spawn();
    inventory.giveStarter();
    lastDir = player.applyCamera(yaw, pitch);
    _gameStarted = true;
    menu.gameStarted = true;
    menu.hideAll();
    document.getElementById("crosshair").classList.remove("hidden");
    document.getElementById("hud").classList.remove("hidden");
    document.getElementById("debug").classList.remove("hidden");
    const p = document.getElementById("game").requestPointerLock();
    if (p && p.catch) p.catch(() => { started = true; });
    if (document.pointerLockElement !== document.getElementById("game")) started = true;
  });
};

// ===== الصوت خطوات + SWIM =====
let _stepTimer = 0.3;

// ===== الأوامر =====
function runCommand(cmd) {
  const parts = cmd.trim().split(/\s+/);
  const c = parts[0].toLowerCase();
  const args = parts.slice(1);
  try {
    switch (c) {
      case "gamemode": case "gm":
        const mode = args[0];
        if (mode === "creative" || mode === "1" || mode === "c") { player.flying = true; _gameStarted = true; }
        else if (mode === "survival" || mode === "0" || mode === "s") { player.flying = false; }
        else if (mode === "spectator" || mode === "3" || mode === "sp") { player.flying = true; player.thirdPerson = true; }
        break;
      case "give": if (args.length >= 1) inventory.addItem(args[0], parseInt(args[1]) || 1); break;
      case "tp": case "teleport":
        if (args.length >= 3) { player.pos.set(parseFloat(args[0]) + 0.5, parseFloat(args[1]), parseFloat(args[2]) + 0.5); player.vel.set(0, 0, 0); }
        break;
      case "time":
        if (args[0] === "day") entityManager._time = 0;
        else if (args[0] === "night") entityManager._time = entityManager._dayLength * 0.6;
        else if (args[0] === "noon") entityManager._time = entityManager._dayLength * 0.25;
        else if (args[0] === "midnight") entityManager._time = entityManager._dayLength * 0.85;
        break;
      case "weather":
        if (args[0] === "clear") SKY.setHex(0x7ec0ee);
        else if (args[0] === "rain") SKY.setHex(0x4a6b8a);
        else if (args[0] === "thunder") SKY.setHex(0x2a3a4a);
        break;
      case "kill": if (args[0] === "@p" || !args[0]) health.takeDamage(100); else if (args[0] === "@e") { for (const e of entityManager.entities) e.alive = false; } break;
      case "summon": if (args.length >= 1) entityManager.spawnMob(args[0], player.pos.x, player.pos.y, player.pos.z); break;
      case "seed": document.getElementById("debug").textContent += "\nSeed: " + world.seed; break;
      case "spawn": player.spawn(); break;
      case "save-all": case "save": doSave(); break;
      case "fill":
        if (args.length >= 7) {
          const [x1, y1, z1, x2, y2, z2, block] = args;
          const minX = Math.min(parseInt(x1), parseInt(x2)), maxX = Math.max(parseInt(x1), parseInt(x2));
          const minY = Math.min(parseInt(y1), parseInt(y2)), maxY = Math.max(parseInt(y1), parseInt(y2));
          const minZ = Math.min(parseInt(z1), parseInt(z2)), maxZ = Math.max(parseInt(z1), parseInt(z2));
          const bid = typeof block === "string" ? (blockByName(block)?.id || parseInt(block)) : parseInt(block);
          for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) for (let z = minZ; z <= maxZ; z++) world.setBlock(x, y, z, bid);
        }
        break;
    }
  } catch (err) { console.warn("KingCraft: أمر غير صالح:", err); }
}

function chatSend() {
  const input = document.getElementById("chat-input").querySelector("input");
  const text = input.value.trim();
  document.getElementById("chat-input").classList.add("hidden");
  if (text.startsWith("/")) runCommand(text.slice(1));
  document.getElementById("game").requestPointerLock().catch(() => {});
}

// ===== لوحة المفاتيح =====
window.addEventListener("keydown", (e) => {
  if (e.code === "F3") { debugTools.f3Held = true; player._f3Held = true; e.preventDefault(); }
  if (!_gameStarted) return;

  const chatInput = document.getElementById("chat-input");
  if (!chatInput.classList.contains("hidden")) {
    if (e.code === "Enter") { chatSend(); return; }
    if (e.code === "Escape") { chatInput.classList.add("hidden"); document.getElementById("game").requestPointerLock().catch(() => {}); return; }
    return;
  }

  if (debugTools.f3Held) {
    e.preventDefault();
    if (e.code === "KeyA") { world.update(player.pos); }
    else if (e.code === "KeyB") debugTools.toggleHitboxes();
    else if (e.code === "KeyC") debugTools.copyCoords();
    else if (e.code === "KeyF" && !ui.isOpen) { world.renderDistance = Math.min(world.renderDistance + 1, 12); }
    else if (e.code === "KeyG") debugTools.toggleChunkBorders();
    else if (e.code === "KeyH") debugTools.showAdvancedTooltips = !debugTools.showAdvancedTooltips;
    else if (e.code === "KeyD") { document.querySelector(".chat-msgs").innerHTML = ""; }
    else if (e.code === "KeyQ") debugTools.showF3Help();
    else if (e.code === "KeyT") debugTools.rebuildAllChunks();
    else if (e.code === "Escape") menu.openPause();
    else if (e.code === "F3") { if (!e.repeat) document.getElementById("debug").classList.toggle("hidden"); }
    return;
  }

  if (e.code === "F3" && !e.repeat) { e.preventDefault(); document.getElementById("debug").classList.toggle("hidden"); return; }

  if (e.code === "KeyE") { if (ui.isOpen) closeUI(); else openUI("inventory"); }
  else if (e.code === "Escape" && ui.isOpen) closeUI();
  else if (e.code === "Escape" && menu.settingsPanel.classList.contains("open")) { menu._saveSettings(); menu.settingsPanel.classList.remove("open"); menu.settingsPanel.classList.add("hidden"); }
  else if (e.code === "Escape" && menu.pauseMenu.classList.contains("hidden") === false) menu.closePause();
  else if (e.code === "Escape" && !menu.pauseMenu.classList.contains("hidden") === false && !_gameStarted) { if (!menu.worldSelect.classList.contains("hidden")) menu.showScreen(menu.menu); }
  else if (e.code === "Escape" && !menu.worldCreate.classList.contains("hidden")) { menu.showScreen(menu.worldSelect); menu.renderWorldList(); }
  else if (e.code === "Escape") { if (_gameStarted && !health.dead) menu.openPause(); }

  if (e.code === "KeyQ" && !ui.isOpen) {
    const sel = inventory.selectedStack;
    if (sel && sel.count > 0) { const pp = player.pos; drops.spawn(Math.floor(pp.x), Math.floor(pp.y), Math.floor(pp.z), sel.id, 1); inventory.consumeSelected(1); }
  }
  if (e.code === "KeyF" && !ui.isOpen && !e.repeat) {
    const h = inventory.selectedHotbar;
    const main = inventory.slots[h];
    inventory.slots[h] = inventory.offhand ? { id: inventory.offhand.id, count: inventory.offhand.count, dur: inventory.offhand.dur } : null;
    inventory.offhand = main ? { id: main.id, count: main.count, dur: main.dur } : null;
    inventory._changed();
  }
  if (e.code === "KeyT" && !ui.isOpen) {
    document.exitPointerLock();
    chatInput.classList.remove("hidden");
    chatInput.querySelector("input").value = "";
    chatInput.querySelector("input").focus();
  }
  if (e.code === "F2") { e.preventDefault(); debugTools.takeScreenshot(); }
  if (e.code === "F5") { e.preventDefault(); player.thirdPerson = !player.thirdPerson; }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "F3") { debugTools.f3Held = false; player._f3Held = false; }
});

document.getElementById("game").addEventListener("mousemove", (e) => {
  if (document.pointerLockElement === document.getElementById("game")) {
    if (!started) return;
    yaw -= e.movementX * SENS;
    pitch -= e.movementY * SENS;
    player._yaw = yaw; player._pitch = pitch;
  } else if (_gameStarted) {
    if (_lastMouseX === null) { _lastMouseX = e.clientX; _lastMouseY = e.clientY; return; }
    const dx = e.clientX - _lastMouseX, dy = e.clientY - _lastMouseY;
    _lastMouseX = e.clientX; _lastMouseY = e.clientY;
    yaw -= dx * SENS; pitch -= dy * SENS;
    player._yaw = yaw; player._pitch = pitch;
  } else return;
  const lim = Math.PI / 2 - 0.01;
  pitch = Math.max(-lim, Math.min(lim, pitch));
});

document.addEventListener("pointerlockchange", () => {
  started = document.pointerLockElement === document.getElementById("game");
  if (!started) { _lastMouseX = null; _lastMouseY = null; }
});

// ===== حلقة اللعبة =====
let last = performance.now();
let frames = 0, fpsTime = 0, fps = 0, debugTimer = 0;

function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (_gameStarted) {
    furnaces.tick(dt);
    farming.tick(dt);
    health.setArmor(inventory.getArmorValue());
    health.tick(dt);
    _saveTimer += dt;
    if (_saveTimer >= 30) { _saveTimer = 0; doSave(); menu.currentWorld.playTime += 30; WM.updateWorld(menu.currentWorld); }
  }

  if (menu.allHidden() && !menu.paused) {
    const playing = !ui.isOpen && !health.dead;
    if (playing) {
      player.update(dt, yaw);
      lastDir = player.applyCamera(yaw, pitch);
      if (player.inWater && !player._wasInWater) sound.playSplash();
      if (player.inWater) {
        if (Math.abs(player.vel.x) > 0.05 || Math.abs(player.vel.z) > 0.05) {
          _stepTimer += dt;
          if (_stepTimer >= 0.6) { _stepTimer = 0; sound.playSplash(); }
        } else _stepTimer = 0.6;
      } else if (player.onGround && (Math.abs(player.vel.x) > 0.05 || Math.abs(player.vel.z) > 0.05) && !player.flying) {
        _stepTimer += dt;
        const stepInterval = player.keys["ControlLeft"] ? 0.35 : 0.5;
        if (_stepTimer >= stepInterval) { _stepTimer = 0; sound.playStep(); }
      } else _stepTimer = 0.3;
      if (player.onGround && !player._prevOnGround && player._fallDist > 0.5) sound.playLand();
      updateMining(dt);
      drops.update(dt, player, inventory);
      entityManager.update(dt, player.pos);
    } else {
      lastDir = player.applyCamera(yaw, pitch);
      ui.tickFurnace();
    }
    world.update(player.pos);
    debugTools.updateChunkBorders(player.pos);
    debugTools.updateHitboxes();

    const hit = playing ? raycastVoxel(world, eyeOrigin(), lastDir) : null;
    if (hit) { highlight.visible = true; highlight.position.set(hit.block[0] + 0.5, hit.block[1] + 0.5, hit.block[2] + 0.5); }
    else highlight.visible = false;

    frames++; debugTimer += dt;
    if (debugTimer >= 0.5) {
      fps = Math.round(frames / debugTimer);
      frames = 0; debugTimer = 0;
      const tooltipId = hit ? world.getBlock(hit.block[0], hit.block[1], hit.block[2]) : 0;
      const tooltipName = tooltipId ? (getItem(tooltipId)?.name || `ID:${tooltipId}`) : "";
      document.getElementById("debug").textContent =
        `KingCraft v0.4\nFPS: ${fps}\nXYZ: ${player.pos.x.toFixed(1)} ${player.pos.y.toFixed(1)} ${player.pos.z.toFixed(1)}\nchunks: ${world.chunks.size} • drops: ${drops.entities.length} • mobs: ${entityManager.entities.length}` +
        (player.flying ? "\n[طيران]" : "") + (player.sneaking ? "\n[زحف]" : "") + (menu.paused ? "\n§c⏸ PAUSED" : "") +
        (debugTools.showAdvancedTooltips && tooltipName ? `\n[${tooltipName}]` : "");
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ===== تغيير الحجم =====
window.addEventListener("resize", () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });

// ===== PWA =====
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    if ("caches" in window) { const names = await caches.keys(); await Promise.all(names.map((n) => caches.delete(n))); }
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
    navigator.serviceWorker.register("sw.js").catch((err) => { console.warn("KingCraft: فشل تسجيل Service Worker", err); });
  });
}
