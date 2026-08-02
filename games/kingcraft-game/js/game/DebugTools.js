import * as THREE from "three";
import { WORLD_HEIGHT } from "../utils/Constants.js";

export class DebugTools {
  constructor(scene, world, entityManager, player, renderer) {
    this.scene = scene;
    this.world = world;
    this.entityManager = entityManager;
    this.player = player;
    this.renderer = renderer;

    this.showHitboxes = false;
    this.showChunkBorders = false;
    this.showAdvancedTooltips = false;
    this.f3Held = false;
    this.chunkBorderLines = null;
    this.hitboxLines = null;
    this.lastEntityCount = -1;
    this.lastChunkBorderPos = null;
    this.paused = false;
  }

  buildHitboxGeometry() {
    const g = new THREE.BufferGeometry();
    const pos = []; const idx = [];
    let off = 0;
    for (const e of this.entityManager.entities) {
      if (!e.alive) continue;
      const hw = 0.3, hh = e.h || 0.9;
      const [x, y, z] = [e.pos.x, e.pos.y, e.pos.z];
      const corners = [
        [x-hw, y, z-hw], [x+hw, y, z-hw], [x+hw, y, z+hw], [x-hw, y, z+hw],
        [x-hw, y+hh, z-hw], [x+hw, y+hh, z-hw], [x+hw, y+hh, z+hw], [x-hw, y+hh, z+hw],
      ];
      for (const c of corners) pos.push(c[0], c[1], c[2]);
      const edges = [0,1, 1,2, 2,3, 3,0, 4,5, 5,6, 6,7, 7,4, 0,4, 1,5, 2,6, 3,7];
      for (const e of edges) idx.push(off + e);
      off += 8;
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    return g;
  }

  toggleHitboxes() {
    this.showHitboxes = !this.showHitboxes;
    if (!this.showHitboxes) {
      if (this.hitboxLines) { this.scene.remove(this.hitboxLines); this.hitboxLines.geometry.dispose(); this.hitboxLines = null; }
      this.lastEntityCount = -1;
      return;
    }
  }

  updateHitboxes() {
    if (!this.showHitboxes) return;
    const cnt = this.entityManager.entities.filter(e => e.alive).length;
    if (this.hitboxLines && cnt === this.lastEntityCount) return;
    this.lastEntityCount = cnt;
    if (this.hitboxLines) { this.scene.remove(this.hitboxLines); this.hitboxLines.geometry.dispose(); }
    if (cnt === 0) { this.hitboxLines = null; return; }
    this.hitboxLines = new THREE.LineSegments(this.buildHitboxGeometry(), new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.6 }));
    this.scene.add(this.hitboxLines);
  }

  buildChunkBorderGeometry(playerPos) {
    const g = new THREE.BufferGeometry();
    const pos = [];
    const S = 16;
    const R = this.world.renderDistance;
    const pcx = Math.floor(playerPos.x / S) * S;
    const pcz = Math.floor(playerPos.z / S) * S;
    for (let dz = -R; dz <= R; dz++) {
      for (let dx = -R; dx <= R; dx++) {
        const x = pcx + dx * S, z = pcz + dz * S;
        pos.push(x, 0, z, x+S, 0, z, x+S, 0, z, x+S, 0, z+S, x+S, 0, z+S, x, 0, z+S, x, 0, z+S, x, 0, z);
        pos.push(x, WORLD_HEIGHT, z, x+S, WORLD_HEIGHT, z, x+S, WORLD_HEIGHT, z, x+S, WORLD_HEIGHT, z+S, x+S, WORLD_HEIGHT, z+S, x, WORLD_HEIGHT, z+S, x, WORLD_HEIGHT, z+S, x, WORLD_HEIGHT, z);
      }
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }

  toggleChunkBorders() {
    this.showChunkBorders = !this.showChunkBorders;
    if (!this.showChunkBorders) {
      if (this.chunkBorderLines) { this.scene.remove(this.chunkBorderLines); this.chunkBorderLines.geometry.dispose(); this.chunkBorderLines = null; }
      this.lastChunkBorderPos = null;
    }
  }

  updateChunkBorders(playerPos) {
    if (!this.showChunkBorders) return;
    const key = Math.floor(playerPos.x / 16) + "," + Math.floor(playerPos.z / 16);
    if (this.chunkBorderLines && key === this.lastChunkBorderPos) return;
    this.lastChunkBorderPos = key;
    if (this.chunkBorderLines) { this.scene.remove(this.chunkBorderLines); this.chunkBorderLines.geometry.dispose(); }
    this.chunkBorderLines = new THREE.LineSegments(this.buildChunkBorderGeometry(playerPos), new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 }));
    this.scene.add(this.chunkBorderLines);
  }

  rebuildAllChunks() {
    const keys = [...this.world.chunks.keys()];
    for (const k of keys) {
      const c = this.world.chunks.get(k);
      if (c) { c.dirty = true; this.world._inQueue.add(c); this.world._meshQueue.push(c); }
    }
  }

  showF3Help() {
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
    const msgEl = document.getElementById("chat-input").querySelector(".chat-msgs");
    msgEl.innerHTML = lines.map(l => `<div style="color:#fff;font:13px monospace;padding:2px 4px">${l}</div>`).join("");
    setTimeout(() => { if (!document.getElementById("chat-input").classList.contains("hidden")) msgEl.innerHTML = ""; }, 5000);
  }

  copyCoords() {
    const p = this.player.pos;
    navigator.clipboard.writeText(`XYZ: ${p.x.toFixed(2)} / ${p.y.toFixed(2)} / ${p.z.toFixed(2)}`).catch(() => {});
  }

  takeScreenshot() {
    const link = document.createElement("a");
    link.download = "kingcraft-" + Date.now() + ".png";
    link.href = this.renderer.domElement.toDataURL("image/png");
    link.click();
  }
}
