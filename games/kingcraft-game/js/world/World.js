import * as THREE from "three";
import { CHUNK_SIZE, WORLD_HEIGHT, RENDER_DISTANCE } from "../utils/Constants.js";
import { AIR, isSolid, isLiquid } from "./BlockData.js";
const WATER_ID = 10;
const WATER_LEVELS = [57, 58, 59, 60, 61, 62, 63]; // water_1 through water_7
function isWater(id) { return id === WATER_ID || (id >= 57 && id <= 63); }
import { Chunk } from "./Chunk.js";
import { TerrainGen } from "./TerrainGen.js";
import { buildAtlas } from "../blocks/BlockTexture.js";
import { saveChunk, loadChunk } from "../utils/SaveLoad.js";

const S = CHUNK_SIZE;

export class World {
  constructor(scene, seed = 20260610) {
    this.scene = scene;
    this.chunks = new Map();
    this.seed = seed;
    this.gen = new TerrainGen(seed);
    this.renderDistance = RENDER_DISTANCE;

    const atlas = buildAtlas();
    this.material = new THREE.MeshLambertMaterial({
      map: atlas, vertexColors: true,
    });
    this.transparentMaterial = new THREE.MeshLambertMaterial({
      map: atlas, vertexColors: true, transparent: true, alphaTest: 0.1,
      opacity: 0.85, side: THREE.DoubleSide, depthWrite: false,
    });

    this._meshQueue = [];
    this._meshQueueDirty = false;
    this._inQueue = new Set();
    this._lastCX = null;
    this._lastCZ = null;
    this._toUnload = [];

    this._worker = null;
    this._pendingChunks = new Map();

    this._waterQueue = [];
    this._waterTimer = 0;
  }

  key(cx, cz) { return cx + "," + cz; }
  getChunk(cx, cz) { return this.chunks.get(this.key(cx, cz)); }

  _initWorker() {
    if (this._worker) return;
    const url = new URL("../workers/terrain.worker.js", import.meta.url);
    this._worker = new Worker(url, { type: "module" });
    this._worker.onmessage = (e) => this._onWorkerMessage(e);
    this._worker.postMessage({ type: "init", seed: this.seed });
  }

  _onWorkerMessage(e) {
    const { type, cx, cz, blocks, crossBorder } = e.data;
    if (type !== "chunkGenerated") return;
    const k = this.key(cx, cz);
    const c = this.chunks.get(k);
    if (!c) return;
    this._pendingChunks.delete(k);

    c.blocks.set(blocks);
    c.computeSunlight();
    c.propagateBlockLight();
    c.generated = true;
    c.dirty = true;
    if (!this._inQueue.has(c)) {
      this._inQueue.add(c);
      this._meshQueue.push(c);
      this._meshQueueDirty = true;
    }

    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let lx = 0; lx < S; lx++) {
        for (let lz = 0; lz < S; lz++) {
          const id = c.blocks[Chunk.idx(lx, y, lz)];
          if (id === WATER_ID || (id >= 57 && id <= 63)) {
            this._waterQueue.push({ x: cx * S + lx, y, z: cz * S + lz });
          }
        }
      }
    }

    if (crossBorder) {
      for (const { wx, wy, wz, id } of crossBorder) {
        const nk = this.key(Math.floor(wx / S), Math.floor(wz / S));
        const nc = this.chunks.get(nk);
        if (nc && wy >= 0 && wy < 64) {
          const nlx = wx - Math.floor(wx / S) * S;
          const nlz = wz - Math.floor(wz / S) * S;
          if (nc.inBounds(nlx, wy, nlz)) {
            nc.blocks[Chunk.idx(nlx, wy, nlz)] = id;
            nc.dirty = true;
          }
        }
      }
    }

    this.queueRebuild(cx - 1, cz);
    this.queueRebuild(cx + 1, cz);
    this.queueRebuild(cx, cz - 1);
    this.queueRebuild(cx, cz + 1);
  }

  ensureChunk(cx, cz) {
    const k = this.key(cx, cz);
    let c = this.chunks.get(k);
    if (!c) {
      c = new Chunk(cx, cz);
      this.chunks.set(k, c);

      this._initWorker();
      this._pendingChunks.set(k, c);
      this._worker.postMessage({ type: "generateChunk", cx, cz, size: S });

      loadChunk(cx, cz).then(saved => {
        if (saved && this.chunks.has(k)) {
          c.blocks = saved;
          c.computeSunlight();
          c.propagateBlockLight();
          c.generated = true;
          c.dirty = true;
          this._pendingChunks.delete(k);
          if (!this._inQueue.has(c)) {
            this._inQueue.add(c);
            this._meshQueue.push(c);
            this._meshQueueDirty = true;
          }
          for (let y = 0; y < WORLD_HEIGHT; y++) {
            for (let lx = 0; lx < S; lx++) {
              for (let lz = 0; lz < S; lz++) {
                const id = c.blocks[Chunk.idx(lx, y, lz)];
                if (id === WATER_ID || (id >= 57 && id <= 63)) {
                  this._waterQueue.push({ x: cx * S + lx, y, z: cz * S + lz });
                }
              }
            }
          }
        }
      });
    }
    return c;
  }

  getBlock(x, y, z) {
    if (y < 0 || y >= WORLD_HEIGHT) return AIR;
    const cx = Math.floor(x / S), cz = Math.floor(z / S);
    const c = this.getChunk(cx, cz);
    if (!c) return AIR;
    const lx = x - cx * S, lz = z - cz * S;
    return c.blocks[Chunk.idx(lx, y, lz)];
  }

  setBlock(x, y, z, id) {
    if (y < 0 || y >= WORLD_HEIGHT) return;
    const cx = Math.floor(x / S), cz = Math.floor(z / S);
    const c = this.ensureChunk(cx, cz);
    const lx = x - cx * S, lz = z - cz * S;
    c.set(lx, y, lz, id);
    c.rebuildLight();
    c.propagateBlockLight();

    if (isWater(id)) {
      this._waterQueue.push({ x, y, z });
    }

    this.queueRebuild(cx, cz);
    if (lx === 0) this.queueRebuild(cx - 1, cz);
    if (lx === S - 1) this.queueRebuild(cx + 1, cz);
    if (lz === 0) this.queueRebuild(cx, cz - 1);
    if (lz === S - 1) this.queueRebuild(cx, cz + 1);
  }

  queueRebuild(cx, cz) {
    const c = this.getChunk(cx, cz);
    if (c && !this._inQueue.has(c)) {
      c.dirty = true;
      this._inQueue.add(c);
      this._meshQueue.push(c);
      this._meshQueueDirty = true;
    }
  }

  isSolidAt(x, y, z) {
    return isSolid(this.getBlock(Math.floor(x), Math.floor(y), Math.floor(z)));
  }

  isLiquidAt(x, y, z) {
    return isLiquid(this.getBlock(Math.floor(x), Math.floor(y), Math.floor(z)));
  }

  _batchSet(changes) {
    const rebuilt = new Set();
    for (const { x, y, z, id } of changes) {
      const cx = Math.floor(x / S), cz = Math.floor(z / S);
      const c = this.getChunk(cx, cz);
      if (!c) continue;
      const lx = x - cx * S, lz = z - cz * S;
      c.blocks[Chunk.idx(lx, y, lz)] = id;
      c.dirty = true;
      rebuilt.add(this.key(cx, cz));
    }
    for (const k of rebuilt) {
      const [cx, cz] = k.split(",").map(Number);
      this.queueRebuild(cx, cz);
      const c = this.getChunk(cx, cz);
      if (c) { c.rebuildLight(); c.propagateBlockLight(); }
    }
  }

  _waterLevel(blockId) {
    if (blockId === WATER_ID) return 0;
    if (blockId >= 57 && blockId <= 63) return blockId - 56;
    return -1;
  }

  _processWater(budget) {
    for (let i = 0; i < budget && this._waterQueue.length > 0; i++) {
      const { x, y, z } = this._waterQueue.shift();
      const block = this.getBlock(x, y, z);
      const level = this._waterLevel(block);
      if (level < 0) continue;

      // 1. Try to flow down
      const below = this.getBlock(x, y - 1, z);
      if (below === AIR) {
        const changes = [{ x, y, z, id: AIR }];
        if (level === 0) {
          changes.push({ x, y: y - 1, z, id: WATER_ID });
        } else {
          changes.push({ x, y: y - 1, z, id: WATER_LEVELS[level - 1] });
        }
        this._batchSet(changes);
        this._waterQueue.push({ x, y: y - 1, z });
        continue;
      }
      if (isWater(below) || level >= 7) continue;

      // 2. No water above → evaporate (unless source)
      if (level > 0) {
        const above = this.getBlock(x, y + 1, z);
        if (!isWater(above)) {
          this._batchSet([{ x, y, z, id: AIR }]);
          continue;
        }
      }

      // 3. Spread horizontally (one random direction)
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      const sd = dirs[Math.floor(Math.random() * 4)];
      const nx = x + sd[0], nz = z + sd[1];
      const neighbor = this.getBlock(nx, y, nz);
      if (neighbor === AIR && !isWater(this.getBlock(nx, y - 1, nz))) {
        const newLevel = level + 1;
        if (newLevel <= 7) {
          const id = newLevel === 0 ? WATER_ID : WATER_LEVELS[newLevel - 1];
          const changes = [{ x, y, z, id: AIR }];
          if (level > 0 || Math.random() < 0.3) {
            changes.push({ x: nx, y, z: nz, id });
          }
          this._batchSet(changes);
          if (newLevel < 7) {
            this._waterQueue.push({ x: nx, y, z: nz });
          }
        }
      } else if (isWater(neighbor)) {
        this._waterQueue.push({ x: nx, y, z: nz });
      }
    }
  }

  update(playerPos) {
    const pcx = Math.floor(playerPos.x / S);
    const pcz = Math.floor(playerPos.z / S);
    const R = this.renderDistance;

    if (pcx !== this._lastCX || pcz !== this._lastCZ) {
      this._lastCX = pcx;
      this._lastCZ = pcz;

      for (let dz = -R; dz <= R; dz++) {
        for (let dx = -R; dx <= R; dx++) {
          if (dx * dx + dz * dz > (R + 0.5) * (R + 0.5)) continue;
          this.ensureChunk(pcx + dx, pcz + dz);
        }
      }

      this._toUnload = [];
      for (const [k, c] of this.chunks) {
        if (Math.abs(c.cx - pcx) > R + 1 || Math.abs(c.cz - pcz) > R + 1) {
          this._toUnload.push(c);
        }
      }
    }

    this._waterTimer += 1;
    if (this._waterTimer >= 3) {
      this._waterTimer = 0;
      this._processWater(30);
    }

    let unloadB = 2;
    while (unloadB-- > 0 && this._toUnload.length) {
      const c = this._toUnload.pop();
      saveChunk(c.cx, c.cz, c.blocks);
      if (c.mesh) this.scene.remove(c.mesh);
      if (c.transparentMesh) this.scene.remove(c.transparentMesh);
      c.disposeMesh();
      this.chunks.delete(this.key(c.cx, c.cz));
    }

    if (this._meshQueue.length) {
      if (this._meshQueueDirty) {
        this._meshQueue.sort((a, b) => {
          const da = (a.cx - pcx) ** 2 + (a.cz - pcz) ** 2;
          const db = (b.cx - pcx) ** 2 + (b.cz - pcz) ** 2;
          return da - db;
        });
        this._meshQueueDirty = false;
      }
      let budget = 3;
      while (budget-- > 0 && this._meshQueue.length) {
        const c = this._meshQueue.shift();
        this._inQueue.delete(c);
        if (!this.chunks.has(this.key(c.cx, c.cz))) continue;
        if (!c.dirty) continue;
        if (!c.generated) {
          this._meshQueue.push(c);
          this._meshQueueDirty = true;
          this._inQueue.add(c);
          continue;
        }
        const hadOpaque = c.mesh, hadTrans = c.transparentMesh;
        c.dirty = false;
        c.buildMesh(this, this.material, this.transparentMaterial);
        if (hadOpaque) this.scene.remove(hadOpaque);
        if (hadTrans) this.scene.remove(hadTrans);
        if (c.mesh) this.scene.add(c.mesh);
        if (c.transparentMesh) this.scene.add(c.transparentMesh);
      }
    }
  }

  spawnHeight(x, z) {
    const cx = Math.floor(x / S), cz = Math.floor(z / S);
    this.ensureChunk(cx, cz);
    for (let y = WORLD_HEIGHT - 1; y > 0; y--) {
      if (isSolid(this.getBlock(x, y, z))) {
        let top = y + 1;
        while (top < WORLD_HEIGHT - 1 && !isSolid(this.getBlock(x, top, z)) && this.getBlock(x, top, z) !== AIR) {
          top++;
        }
        return top;
      }
    }
    return WORLD_HEIGHT / 2;
  }
}
