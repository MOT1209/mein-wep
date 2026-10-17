import * as THREE from "three";
import { DEFAULT_RENDER_DISTANCE, QUALITY_PRESETS } from "./config";
import { World } from "./voxels/world";
import { ChunkRenderer } from "./render/chunkRenderer";
import { createChunkMaterials } from "./render/materials";
import { buildAtlasTexture } from "./render/textures";

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Block World requires ${selector} in index.html`);
  return element;
}

const canvas = requiredElement<HTMLCanvasElement>("#game-canvas");
const uiRoot = requiredElement<HTMLDivElement>("#ui-root");

const quality = QUALITY_PRESETS.medium;
const params = new URLSearchParams(window.location.search);
const seedParam = params.get("seed");
const requestedSeed = seedParam === null ? Number.NaN : Number(seedParam);
const seed = Number.isSafeInteger(requestedSeed) ? requestedSeed >>> 0 : 271828;
const world = new World(seed);
const spawn = world.findSpawn();
const centerChunkX = Math.floor(spawn.x / 16);
const centerChunkZ = Math.floor(spawn.z / 16);

for (let dz = -1; dz <= 1; dz++) {
  for (let dx = -1; dx <= 1; dx++) {
    world.ensureChunk(centerChunkX + dx, centerChunkZ + dz);
  }
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ac5e6);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  (DEFAULT_RENDER_DISTANCE + 2) * 16
);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.pixelRatioCap));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x9ac5e6);

const atlas = buildAtlasTexture();
const materials = createChunkMaterials(atlas, "medium");
const chunkRenderer = new ChunkRenderer(scene, world, { atlas, materials });
const target = new THREE.Vector3(spawn.x, spawn.y, spawn.z);
let yaw = 0.68;
let pitch = 0.42;
let radius = 26;
let dragging = false;
let lastPointerX = 0;
let lastPointerY = 0;
let frame = 0;
let disposed = false;

function updateCamera(): void {
  const horizontal = Math.cos(pitch) * radius;
  camera.position.set(
    target.x + Math.sin(yaw) * horizontal,
    target.y + Math.sin(pitch) * radius,
    target.z + Math.cos(yaw) * horizontal
  );
  camera.lookAt(target);
  camera.updateMatrixWorld();
}

function resize(): void {
  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function onPointerDown(event: PointerEvent): void {
  dragging = true;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging) return;
  yaw -= (event.clientX - lastPointerX) * 0.006;
  pitch = THREE.MathUtils.clamp(pitch + (event.clientY - lastPointerY) * 0.004, 0.08, 1.25);
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  updateCamera();
}

function onPointerUp(): void {
  dragging = false;
}

function onWheel(event: WheelEvent): void {
  radius = THREE.MathUtils.clamp(radius * Math.exp(event.deltaY * 0.001), 8, 72);
  updateCamera();
  event.preventDefault();
}

const status = document.createElement("section");
status.className = "bw-panel";
status.setAttribute("role", "status");
status.style.cssText =
  "position:absolute;left:16px;top:16px;padding:12px 16px;pointer-events:none;font:14px/1.5 var(--ui-font);";
const title = document.createElement("strong");
title.textContent = "Block World";
title.style.cssText = "display:block;font-size:16px;letter-spacing:.04em";
const details = document.createElement("span");
details.textContent = `Seed ${seed} · ${world.loadedChunkCount} chunks · drag to orbit, scroll to zoom`;
details.style.cssText = "color:#b9c7d4";
status.append(title, details);
uiRoot.append(status);

updateCamera();
chunkRenderer.update(centerChunkX, centerChunkZ);

function animate(): void {
  if (disposed) return;
  frame = window.requestAnimationFrame(animate);
  chunkRenderer.update(centerChunkX, centerChunkZ);
  chunkRenderer.rebuildBudgeted(4);
  for (const material of [materials.terrain, materials.water, materials.plants]) {
    material.uniforms.uDay.value = world.dayFactor;
    material.uniforms.uCameraPosition.value.copy(camera.position);
  }
  renderer.render(scene, camera);
}

function dispose(): void {
  if (disposed) return;
  disposed = true;
  window.cancelAnimationFrame(frame);
  window.removeEventListener("resize", resize);
  canvas.removeEventListener("pointerdown", onPointerDown);
  canvas.removeEventListener("pointermove", onPointerMove);
  canvas.removeEventListener("pointerup", onPointerUp);
  canvas.removeEventListener("pointercancel", onPointerUp);
  canvas.removeEventListener("wheel", onWheel);
  for (const chunk of world.chunks.values()) chunkRenderer.dispose(chunk.cx, chunk.cz);
  materials.terrain.dispose();
  materials.water.dispose();
  materials.plants.dispose();
  atlas.dispose();
  renderer.dispose();
}

window.addEventListener("resize", resize);
canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("pointercancel", onPointerUp);
canvas.addEventListener("wheel", onWheel, { passive: false });
window.addEventListener("pagehide", dispose, { once: true });
frame = window.requestAnimationFrame(animate);
