// نقطة الدخول: تهيئة Three.js، العالم، اللاعب، المخزون، التصنيع، الأفران، وحلقة اللعبة.
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
import { EXHAUSTION_PER_BREAK, WORLD_HEIGHT } from "./utils/Constants.js";
import { saveGame, loadGame } from "./utils/SaveLoad.js";
import { EntityManager } from "./entities/EntityManager.js";
import { FarmingSystem, isCropSeed, getCropInfo } from "./world/Farming.js";

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
const farming = new FarmingSystem(world);
entityManager._onAttack = (damage) => {
  health.takeDamage(damage);
  updateHUD();
};
entityManager._onDrop = (x, y, z, dropList) => {
  for (const d of dropList) drops.spawn(x, y, z, d.id, d.count);
};
entityManager._onMobHurt = () => sound.playMobHurt();
entityManager._onMobDeath = () => sound.playMobDeath();
player.sound = sound;

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

// مؤقت صوت الخطوات
let _stepTimer = 0.3;

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
let _lastMouseX = null, _lastMouseY = null;

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement === canvas) {
    if (!started) return;
    yaw -= e.movementX * SENS;
    pitch -= e.movementY * SENS;
  } else if (gameStarted) {
    if (_lastMouseX === null) { _lastMouseX = e.clientX; _lastMouseY = e.clientY; return; }
    const dx = e.clientX - _lastMouseX;
    const dy = e.clientY - _lastMouseY;
    _lastMouseX = e.clientX;
    _lastMouseY = e.clientY;
    yaw -= dx * SENS;
    pitch -= dy * SENS;
  } else {
    return;
  }
  const lim = Math.PI / 2 - 0.01;
  pitch = Math.max(-lim, Math.min(lim, pitch));
});
document.addEventListener("pointerlockchange", () => {
  started = document.pointerLockElement === canvas;
  if (!started) { _lastMouseX = null; _lastMouseY = null; }
});

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

  // صوت حفر أثناء التقدم (كل 25%)
  const prevCrack = Math.floor((miningProgress - dt / breakTime(id, tool)) / 0.25);
  const nowCrack = Math.floor(miningProgress / 0.25);
  if (nowCrack > prevCrack && nowCrack < 4) {
    sound.playDig();
  }

  if (miningProgress >= 1) {
    if (canDrop(id, tool)) {
      const d = blockDrop(id);
      if (d) drops.spawn(hit.block[0], hit.block[1], hit.block[2], d, 1);
    }
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
  if ((!gameStarted && !started) || ui.isOpen) return;
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
  if (name === "enchanting_table") { openUI("enchant"); return; }

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

  // حرث بالأداة (hoe)
  const tool = sel.id ? getTool(sel.id) : null;
  if (tool && tool.kind === "hoe") {
    const [bx, by, bz] = hit.block;
    if (farming.till(bx, by, bz)) {
      sound.playPlace();
      const invIdx = inventory.selectedSlot;
      const stack = inventory.hotbar[invIdx];
      if (stack && stack.durability != null) {
        stack.durability -= 1;
        if (stack.durability <= 0) inventory.hotbar[invIdx] = null;
      }
      return;
    }
  }

  // غرس بذور
  if (isCropSeed(sel.id)) {
    const [px, py, pz] = hit.place;
    if (!intersectsPlayer(px, py, pz)) {
      const placed = farming.plant(px, py, pz, sel.id);
      if (placed) {
        inventory.consumeSelected(1);
        sound.playPlace();
        return;
      }
    }
  }

  // حصاد المحصول الناضج
  const cropInfo = getCropInfo(id);
  if (cropInfo && cropInfo.stage >= 2) {
    const drops2 = farming.harvest(hit.block[0], hit.block[1], hit.block[2]);
    if (drops2) {
      for (const d of drops2) drops.spawn(hit.block[0] + 0.5, hit.block[1] + 0.5, hit.block[2] + 0.5, d.id, d.count);
      sound.playBreak();
      return;
    }
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

// Chat input
const chatInput = document.getElementById("chat-input");

// ===== أدوات F3 المساعدة =====
let _f3Held = false;
let _showHitboxes = false;
let _showChunkBorders = false;
let _showAdvancedTooltips = false;
let _chunkBorderLines = null;
let _hitboxLines = null;
let _paused = false;

function showHitboxes(show) {
  if (_hitboxLines) { scene.remove(_hitboxLines); _hitboxLines.geometry.dispose(); }
  if (!show) { _hitboxLines = null; return; }
  const g = new THREE.BufferGeometry();
  const pos = []; const idx = [];
  let off = 0;
  for (const e of entityManager.entities) {
    if (!e.alive) continue;
    const hw = 0.3, hh = e.h || 0.9;
    const [x, y, z] = [e.pos.x, e.pos.y, e.pos.z];
    const corners = [
      [x-hw, y, z-hw], [x+hw, y, z-hw], [x+hw, y, z+hw], [x-hw, y, z+hw],
      [x-hw, y+hh, z-hw], [x+hw, y+hh, z-hw], [x+hw, y+hh, z+hw], [x-hw, y+hh, z+hw],
    ];
    for (const c of corners) { pos.push(c[0], c[1], c[2]); }
    const edges = [0,1, 1,2, 2,3, 3,0, 4,5, 5,6, 6,7, 7,4, 0,4, 1,5, 2,6, 3,7];
    for (const e of edges) idx.push(off + e);
    off += 8;
  }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  _hitboxLines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.6 }));
  _hitboxLines.visible = true;
  scene.add(_hitboxLines);
}

function showChunkBorders(show, playerPos) {
  if (_chunkBorderLines) { scene.remove(_chunkBorderLines); _chunkBorderLines.geometry.dispose(); }
  if (!show) { _chunkBorderLines = null; return; }
  const g = new THREE.BufferGeometry();
  const pos = [];
  const S = 16;
  const R = world.renderDistance;
  const pcx = Math.floor(playerPos.x / S) * S;
  const pcz = Math.floor(playerPos.z / S) * S;
  for (let dz = -R; dz <= R; dz++) {
    for (let dx = -R; dx <= R; dx++) {
      const x = pcx + dx * S, z = pcz + dz * S;
      pos.push(x, 0, z, x+S, 0, z);
      pos.push(x+S, 0, z, x+S, 0, z+S);
      pos.push(x+S, 0, z+S, x, 0, z+S);
      pos.push(x, 0, z+S, x, 0, z);
      pos.push(x, WORLD_HEIGHT, z, x+S, WORLD_HEIGHT, z);
      pos.push(x+S, WORLD_HEIGHT, z, x+S, WORLD_HEIGHT, z+S);
      pos.push(x+S, WORLD_HEIGHT, z+S, x, WORLD_HEIGHT, z+S);
      pos.push(x, WORLD_HEIGHT, z+S, x, WORLD_HEIGHT, z);
    }
  }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  _chunkBorderLines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 }));
  _chunkBorderLines.visible = true;
  scene.add(_chunkBorderLines);
}

function showF3Help() {
  const lines = [
    "§e=== F3 Shortcuts ===",
    "F3        : Toggle debug",
    "F3 + A    : Reload chunks",
    "F3 + B    : Toggle hitboxes",
    "F3 + C    : Copy coordinates",
    "F3 + D    : Clear chat",
    "F3 + Esc  : Pause",
    "F3 + F    : Increase render distance",
    "F3 + G    : Toggle chunk borders",
    "F3 + H    : Toggle advanced tooltips",
    "F3 + Q    : Show this help",
    "F3 + T    : Rebuild all chunks",
  ];
  // Show in chat area
  const msgEl = chatInput.querySelector(".chat-msgs");
  msgEl.innerHTML = lines.map(l => `<div style="color:#fff;font:13px monospace;padding:2px 4px">${l}</div>`).join("");
  setTimeout(() => { if (!chatInput.classList.contains("hidden")) msgEl.innerHTML = ""; }, 5000);
}

function rebuildAllChunks() {
  const keys = [...world.chunks.keys()];
  for (const k of keys) {
    const c = world.chunks.get(k);
    if (c) { c.dirty = true; world._inQueue.add(c); world._meshQueue.push(c); }
  }
}

function chatSend() {
  const input = chatInput.querySelector("input");
  const text = input.value.trim();
  chatInput.classList.add("hidden");
  if (text.startsWith("/")) { runCommand(text.slice(1)); }
  else if (text) { /* normal chat — no server to send to */ }
  canvas.requestPointerLock().catch(() => {});
}

function runCommand(cmd) {
  const parts = cmd.trim().split(/\s+/);
  const c = parts[0].toLowerCase();
  const args = parts.slice(1);

  try {
    switch (c) {
      case "gamemode": case "gm":
        const mode = args[0];
        if (mode === "creative" || mode === "1" || mode === "c") { player.flying = true; gameStarted = true; }
        else if (mode === "survival" || mode === "0" || mode === "s") { player.flying = false; }
        else if (mode === "spectator" || mode === "3" || mode === "sp") { player.flying = true; player.thirdPerson = true; }
        break;
      case "give":
        if (args.length < 1) break;
        const count = parseInt(args[1]) || 1;
        inventory.addItem(args[0], count);
        break;
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
      case "kill":
        if (args[0] === "@p" || !args[0]) health.takeDamage(100);
        else if (args[0] === "@e") { for (const e of entityManager.entities) e.alive = false; }
        break;
      case "summon":
        if (args.length >= 1) { entityManager.spawnMob(args[0], player.pos.x, player.pos.y, player.pos.z); }
        break;
      case "difficulty": case "diff":
        const d = args[0];
        if (d === "peaceful" || d === "0") { /* no hostile mobs */ }
        else if (d === "easy" || d === "1") { /* lower damage */ }
        else if (d === "normal" || d === "2") { /* normal */ }
        else if (d === "hard" || d === "3") { /* higher damage */ }
        break;
      case "seed":
        debug.textContent += "\nSeed: " + world.seed;
        break;
      case "spawn":
        player.spawn();
        break;
      case "save-all": case "save":
        saveGame(player, inventory, health, world, drops);
        break;
      case "fill":
        if (args.length >= 7) {
          const [x1, y1, z1, x2, y2, z2, block] = args;
          const minX = Math.min(parseInt(x1), parseInt(x2));
          const maxX = Math.max(parseInt(x1), parseInt(x2));
          const minY = Math.min(parseInt(y1), parseInt(y2));
          const maxY = Math.max(parseInt(y1), parseInt(y2));
          const minZ = Math.min(parseInt(z1), parseInt(z2));
          const maxZ = Math.max(parseInt(z1), parseInt(z2));
          const id = typeof block === "string" ? (blockByName(block)?.id || parseInt(block)) : parseInt(block);
          for (let y = minY; y <= maxY; y++)
            for (let x = minX; x <= maxX; x++)
              for (let z = minZ; z <= maxZ; z++)
                world.setBlock(x, y, z, id);
        }
        break;
    }
  } catch (err) { /* command error — ignore */ }
}

// ===== لوحة المفاتيح: المخزون + التحكمات =====
window.addEventListener("keydown", (e) => {
  // تتبع مفتاح F3 (حتى لو اللعبة ما بدأت)
  if (e.code === "F3") { _f3Held = true; window._kcF3Held = true; e.preventDefault(); }
  if (!gameStarted) return;

  // Chat open — special handling
  if (!chatInput.classList.contains("hidden")) {
    if (e.code === "Enter") { chatSend(); return; }
    if (e.code === "Escape") { chatInput.classList.add("hidden"); canvas.requestPointerLock().catch(() => {}); return; }
    return;
  }

  // ===== F3 + ? — اختصارات التصحيح (تسبق التحكمات العادية) =====
  if (_f3Held) {
    e.preventDefault();
    if (e.code === "KeyA") { world.update(player.pos); }
    else if (e.code === "KeyB") { _showHitboxes = !_showHitboxes; showHitboxes(_showHitboxes); }
    else if (e.code === "KeyC") { navigator.clipboard.writeText(`XYZ: ${player.pos.x.toFixed(2)} / ${player.pos.y.toFixed(2)} / ${player.pos.z.toFixed(2)}`).catch(() => {}); }
    else if (e.code === "KeyF" && !ui.isOpen) { world.renderDistance = Math.min(world.renderDistance + 1, 12); }
    else if (e.code === "KeyG") { _showChunkBorders = !_showChunkBorders; showChunkBorders(_showChunkBorders, player.pos); }
    else if (e.code === "KeyH") { _showAdvancedTooltips = !_showAdvancedTooltips; }
    else if (e.code === "KeyD") { document.querySelector(".chat-msgs").innerHTML = ""; }
    else if (e.code === "KeyQ") { showF3Help(); }
    else if (e.code === "KeyT") { rebuildAllChunks(); }
    else if (e.code === "Escape") { _paused = !_paused; }
    else if (e.code === "F3") { if (!e.repeat) debug.classList.toggle("hidden"); }
    return; // أي مفتاح مع F3 لا ينفّذ التحكمات العادية
  }

  // ===== التحكمات العادية =====
  if (e.code === "F3" && !e.repeat) { e.preventDefault(); debug.classList.toggle("hidden"); return; }

  if (e.code === "KeyE") {
    if (ui.isOpen) ui.close();
    else openUI("inventory");
  } else if (e.code === "Escape" && ui.isOpen) {
    ui.close();
  } else if (e.code === "Escape" && settingsPanel.classList.contains("open")) {
    closeSettings();
  } else if (e.code === "Escape" && modalComing.classList.contains("open")) {
    modalComing.classList.remove("open");
  } else if (e.code === "Escape" && modalExit.classList.contains("open")) {
    modalExit.classList.remove("open");
  }

  // Q — إسقاط العنصر
  if (e.code === "KeyQ" && !ui.isOpen) {
    const sel = inventory.selectedStack;
    if (sel && sel.count > 0) {
      const pp = player.pos;
      drops.spawn(Math.floor(pp.x), Math.floor(pp.y), Math.floor(pp.z), sel.id, 1);
      inventory.consumeSelected(1);
    }
  }

  // F — تبديل اليد الثانية
  if (e.code === "KeyF" && !ui.isOpen && !e.repeat) {
    const h = inventory.selectedHotbar;
    const main = inventory.slots[h];
    inventory.slots[h] = inventory.offhand ? { id: inventory.offhand.id, count: inventory.offhand.count, dur: inventory.offhand.dur } : null;
    inventory.offhand = main ? { id: main.id, count: main.count, dur: main.dur } : null;
    inventory._changed();
  }

  // T — شات
  if (e.code === "KeyT" && !ui.isOpen) {
    document.exitPointerLock();
    chatInput.classList.remove("hidden");
    chatInput.querySelector("input").value = "";
    chatInput.querySelector("input").focus();
  }

  // F2 — تصوير
  if (e.code === "F2") {
    e.preventDefault();
    const link = document.createElement("a");
    link.download = "kingcraft-" + Date.now() + ".png";
    link.href = renderer.domElement.toDataURL("image/png");
    link.click();
  }

  // F5 — تبديل المنظور
  if (e.code === "F5") {
    e.preventDefault();
    player.thirdPerson = !player.thirdPerson;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "F3") { _f3Held = false; window._kcF3Held = false; }
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
        inventory.offhand = saveData.offhand ? { id: saveData.offhand.id, count: saveData.offhand.count, dur: saveData.offhand.dur } : null;
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
    if (p && p.catch) p.catch(() => { started = true; });
    if (document.pointerLockElement !== canvas) started = true;
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
  if (gameStarted && document.pointerLockElement !== canvas) canvas.requestPointerLock().catch(() => {});
  else if (!started && menuHidden() && !ui.isOpen) canvas.requestPointerLock().catch(() => {});
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
    farming.tick(dt);
    health.setArmor(inventory.getArmorValue());
    health.tick(dt);
    autoSave(dt);
  }

  if (menuHidden() && !_paused) {
    const playing = !ui.isOpen && !health.dead;
    if (playing) {
      player.update(dt, yaw);
      lastDir = player.applyCamera(yaw, pitch);
      window._kcYaw = yaw;
      window._kcPitch = pitch;

      // صوت الخطوات
      if (player.onGround && (Math.abs(player.vel.x) > 0.05 || Math.abs(player.vel.z) > 0.05) && !player.flying) {
        _stepTimer += dt;
        const stepInterval = player.keys["ControlLeft"] ? 0.35 : 0.5;
        if (_stepTimer >= stepInterval) {
          _stepTimer = 0;
          sound.playStep();
        }
      } else {
        _stepTimer = 0.3;
      }

      // صوت الهبوط
      if (player.onGround && !player._prevOnGround && player._fallDist > 0.5) {
        sound.playLand();
      }

      updateMining(dt);
      drops.update(dt, player, inventory);
      entityManager.update(dt, player.pos);
    } else {
      lastDir = player.applyCamera(yaw, pitch);
      ui.tickFurnace();
    }
    world.update(player.pos);

    // تحديث حدود الأراضي وصناديق الاصطدام إن كانت ظاهرة
    if (_showChunkBorders && _chunkBorderLines) showChunkBorders(true, player.pos);
    if (_showHitboxes && _hitboxLines) showHitboxes(true);

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
      const tooltipId = hit ? world.getBlock(hit.block[0], hit.block[1], hit.block[2]) : 0;
      const tooltipName = tooltipId ? (getItem(tooltipId)?.name || `ID:${tooltipId}`) : "";
      debug.textContent =
        `KingCraft v0.4\n` +
        `FPS: ${fps}\n` +
        `XYZ: ${player.pos.x.toFixed(1)} ${player.pos.y.toFixed(1)} ${player.pos.z.toFixed(1)}\n` +
        `chunks: ${world.chunks.size} • drops: ${drops.entities.length} • mobs: ${entityManager.entities.length}` +
        (player.flying ? "\n[طيران]" : "") +
        (player.sneaking ? "\n[زحف]" : "") +
        (_paused ? "\n§c⏸ PAUSED" : "") +
        (_showAdvancedTooltips && tooltipName ? `\n[${tooltipName}]` : "");
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
