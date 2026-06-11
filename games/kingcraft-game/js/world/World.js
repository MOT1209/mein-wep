// إدارة العالم: القطع، التحميل/التفريغ حول اللاعب، القراءة/الكتابة بإحداثيات عالمية.
import * as THREE from "three";
import { CHUNK_SIZE, WORLD_HEIGHT, RENDER_DISTANCE } from "../utils/Constants.js";
import { AIR, isSolid } from "./BlockData.js";
import { Chunk } from "./Chunk.js";
import { TerrainGen } from "./TerrainGen.js";
import { buildAtlas } from "../blocks/BlockTexture.js";

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
    this._inQueue = new Set();
    this._lastCX = null;
    this._lastCZ = null;
    this._toUnload = [];
  }

  key(cx, cz) { return cx + "," + cz; }
  getChunk(cx, cz) { return this.chunks.get(this.key(cx, cz)); }

  ensureChunk(cx, cz) {
    const k = this.key(cx, cz);
    let c = this.chunks.get(k);
    if (!c) {
      c = new Chunk(cx, cz);
      this.chunks.set(k, c);
      this.gen.generateChunk(cx, cz, S, (lx, ly, lz, id) => {
        if (ly < 0 || ly >= WORLD_HEIGHT) return;
        if (c.inBounds(lx, ly, lz)) {
          c.blocks[Chunk.idx(lx, ly, lz)] = id;
          return;
        }
        const wx = cx * S + lx;
        const wz = cz * S + lz;
        const ncx = Math.floor(wx / S);
        const ncz = Math.floor(wz / S);
        const nc = this.chunks.get(this.key(ncx, ncz));
        if (nc) {
          const nlx = wx - ncx * S;
          const nlz = wz - ncz * S;
          if (nc.inBounds(nlx, ly, nlz)) nc.blocks[Chunk.idx(nlx, ly, nlz)] = id;
        }
      });
      c.generated = true;
      if (!this._inQueue.has(c)) {
        this._inQueue.add(c);
        this._meshQueue.push(c);
      }
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
    }
  }

  isSolidAt(x, y, z) {
    return isSolid(this.getBlock(Math.floor(x), Math.floor(y), Math.floor(z)));
  }

  update(playerPos) {
    const pcx = Math.floor(playerPos.x / S);
    const pcz = Math.floor(playerPos.z / S);
    const R = this.renderDistance;

    // فقط نعيد حساب القطع المطلوبة إذا تغير موضع القطعة
    if (pcx !== this._lastCX || pcz !== this._lastCZ) {
      this._lastCX = pcx;
      this._lastCZ = pcz;

      // توليد القطع ضمن المدى
      for (let dz = -R; dz <= R; dz++) {
        for (let dx = -R; dx <= R; dx++) {
          if (dx * dx + dz * dz > (R + 0.5) * (R + 0.5)) continue;
          this.ensureChunk(pcx + dx, pcz + dz);
        }
      }

      // تجهيز قائمة القطع البعيدة للتفريغ التدريجي
      this._toUnload = [];
      for (const [k, c] of this.chunks) {
        if (Math.abs(c.cx - pcx) > R + 1 || Math.abs(c.cz - pcz) > R + 1) {
          this._toUnload.push(c);
        }
      }
    }

    // تفريغ تدريجي (قطعتين لكل إطار عشان ما نجمّد)
    let unloadB = 2;
    while (unloadB-- > 0 && this._toUnload.length) {
      const c = this._toUnload.pop();
      if (c.mesh) this.scene.remove(c.mesh);
      if (c.transparentMesh) this.scene.remove(c.transparentMesh);
      c.disposeMesh();
      this.chunks.delete(this.key(c.cx, c.cz));
    }

    // بناء الميشات (الأقرب للاعب أولاً)
    if (this._meshQueue.length) {
      this._meshQueue.sort((a, b) => {
        const da = (a.cx - pcx) ** 2 + (a.cz - pcz) ** 2;
        const db = (b.cx - pcx) ** 2 + (b.cz - pcz) ** 2;
        return da - db;
      });
      let budget = 3;
      while (budget-- > 0 && this._meshQueue.length) {
        const c = this._meshQueue.shift();
        this._inQueue.delete(c);
        if (!this.chunks.has(this.key(c.cx, c.cz))) continue;
        if (!c.dirty) continue;
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
      if (isSolid(this.getBlock(x, y, z))) return y + 1;
    }
    return WORLD_HEIGHT / 2;
  }
}
