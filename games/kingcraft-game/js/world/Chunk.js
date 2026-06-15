import * as THREE from "three";
import { CHUNK_SIZE, WORLD_HEIGHT } from "../utils/Constants.js";
import { AIR, isTransparent, tileForFace, blockLightLevel } from "./BlockData.js";
import { getUV } from "../blocks/BlockTexture.js";

const S = CHUNK_SIZE;

const FACES = [
  { dir: [ 1, 0, 0], name: "side", na: 0, aa: 1, ba: 2,
    verts: (n,a0,a1,b0,b1) => { const x=n+1; return [[x,a0,b0],[x,a1,b0],[x,a1,b1],[x,a0,b1]]; } },
  { dir: [-1, 0, 0], name: "side", na: 0, aa: 1, ba: 2,
    verts: (n,a0,a1,b0,b1) => { const x=n; return [[x,a0,b1],[x,a1,b1],[x,a1,b0],[x,a0,b0]]; } },
  { dir: [ 0, 1, 0], name: "top", na: 1, aa: 2, ba: 0,
    verts: (n,a0,a1,b0,b1) => { const y=n+1; return [[b0,y,a1],[b1,y,a1],[b1,y,a0],[b0,y,a0]]; } },
  { dir: [ 0,-1, 0], name: "bottom", na: 1, aa: 2, ba: 0,
    verts: (n,a0,a1,b0,b1) => { const y=n; return [[b0,y,a0],[b1,y,a0],[b1,y,a1],[b0,y,a1]]; } },
  { dir: [ 0, 0, 1], name: "side", na: 2, aa: 0, ba: 1,
    verts: (n,a0,a1,b0,b1) => { const z=n+1; return [[a1,b0,z],[a1,b1,z],[a0,b1,z],[a0,b0,z]]; } },
  { dir: [ 0, 0,-1], name: "side", na: 2, aa: 0, ba: 1,
    verts: (n,a0,a1,b0,b1) => { const z=n; return [[a0,b0,z],[a0,b1,z],[a1,b1,z],[a1,b0,z]]; } },
];

function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }

export class Chunk {
  constructor(cx, cz) {
    this.cx = cx;
    this.cz = cz;
    this.blocks = new Uint8Array(S * S * WORLD_HEIGHT);
    this.light = new Uint8Array(S * S * WORLD_HEIGHT);
    this.mesh = null;
    this.transparentMesh = null;
    this.dirty = true;
    this.generated = false;
  }

  static idx(x, y, z) { return (y * S + z) * S + x; }

  inBounds(x, y, z) {
    return x >= 0 && x < S && z >= 0 && z < S && y >= 0 && y < WORLD_HEIGHT;
  }

  get(x, y, z) {
    if (!this.inBounds(x, y, z)) return AIR;
    return this.blocks[Chunk.idx(x, y, z)];
  }

  set(x, y, z, id) {
    if (!this.inBounds(x, y, z)) return;
    this.blocks[Chunk.idx(x, y, z)] = id;
    this.dirty = true;
  }

  getLight(x, y, z) {
    if (!this.inBounds(x, y, z)) return 15;
    return this.light[Chunk.idx(x, y, z)] & 0x0F;
  }

  setSunlight(x, y, z, level) {
    if (!this.inBounds(x, y, z)) return;
    const idx = Chunk.idx(x, y, z);
    this.light[idx] = (this.light[idx] & 0xF0) | clamp(level, 0, 15);
  }

  getSunlight(x, y, z) {
    if (!this.inBounds(x, y, z)) return 15;
    return this.light[Chunk.idx(x, y, z)] & 0x0F;
  }

  setBlockLight(x, y, z, level) {
    if (!this.inBounds(x, y, z)) return;
    const idx = Chunk.idx(x, y, z);
    this.light[idx] = (this.light[idx] & 0x0F) | (clamp(level, 0, 15) << 4);
  }

  getBlockLight(x, y, z) {
    if (!this.inBounds(x, y, z)) return 0;
    return (this.light[Chunk.idx(x, y, z)] >> 4) & 0x0F;
  }

  clearBlockLight() {
    const light = this.light;
    for (let i = 0; i < light.length; i++) {
      light[i] = light[i] & 0x0F;
    }
  }

  propagateBlockLight() {
    this.clearBlockLight();
    const blocks = this.blocks;
    const light = this.light;
    const S2 = S * S;

    const dirs = [
      [ 1, 0, 0], [-1, 0, 0],
      [ 0, 1, 0], [ 0,-1, 0],
      [ 0, 0, 1], [ 0, 0,-1],
    ];

    const queue = [];

    for (let i = 0; i < blocks.length; i++) {
      const bl = blockLightLevel(blocks[i]);
      if (bl > 0) {
        const y = Math.floor(i / S2);
        const r = i % S2;
        const z = Math.floor(r / S);
        const x = r % S;
        light[i] = (light[i] & 0x0F) | (bl << 4);
        queue.push([x, y, z, bl]);
      }
    }

    let head = 0;
    while (head < queue.length) {
      const [x, y, z, level] = queue[head++];
      if (level <= 1) continue;
      const nextLevel = level - 1;

      for (const [dx, dy, dz] of dirs) {
        const nx = x + dx, ny = y + dy, nz = z + dz;
        if (!this.inBounds(nx, ny, nz)) continue;
        const ni = Chunk.idx(nx, ny, nz);
        if (blocks[ni] !== AIR && !isTransparent(blocks[ni])) continue;
        const existing = (light[ni] >> 4) & 0x0F;
        if (nextLevel > existing) {
          light[ni] = (light[ni] & 0x0F) | (nextLevel << 4);
          queue.push([nx, ny, nz, nextLevel]);
        }
      }
    }
  }

  computeSunlight() {
    const blocks = this.blocks;
    const light = this.light;
    for (let x = 0; x < S; x++) {
      for (let z = 0; z < S; z++) {
        let level = 15;
        for (let y = WORLD_HEIGHT - 1; y >= 0; y--) {
          const idx = Chunk.idx(x, y, z);
          if (level > 0) {
            light[idx] = (light[idx] & 0xF0) | level;
          }
          if (blocks[idx] !== AIR && !isTransparent(blocks[idx])) {
            level = 0;
          } else if (level > 0) {
            level--;
          }
        }
      }
    }
  }

  rebuildLight() {
    const blocks = this.blocks;
    for (let x = 0; x < S; x++) {
      for (let z = 0; z < S; z++) {
        let level = 15;
        for (let y = WORLD_HEIGHT - 1; y >= 0; y--) {
          const idx = Chunk.idx(x, y, z);
          const blockId = blocks[idx];
          if (blockId !== AIR && !isTransparent(blockId)) {
            this.setSunlight(x, y, z, 0);
            level = 0;
          } else {
            this.setSunlight(x, y, z, level);
            if (level > 0) level--;
          }
        }
      }
    }
  }

  _faceLight(na, aa, ba, n, a0, a1, b0, b1, dir) {
    let totalSun = 0, totalBlock = 0, count = 0;
    const stepA = Math.max(1, Math.floor((a1 - a0) / 3));
    const stepB = Math.max(1, Math.floor((b1 - b0) / 3));
    for (let da = 0; da < a1 - a0; da += stepA) {
      for (let db = 0; db < b1 - b0; db += stepB) {
        const coords = [0, 0, 0];
        coords[na] = n + (dir[na] > 0 ? 1 : 0);
        coords[aa] = a0 + da;
        coords[ba] = b0 + db;
        const [fx, fy, fz] = coords;
        if (fy >= 0 && fy < WORLD_HEIGHT && fx >= 0 && fx < S && fz >= 0 && fz < S) {
          const li = this.light[Chunk.idx(fx, fy, fz)];
          totalSun += li & 0x0F;
          totalBlock += (li >> 4) & 0x0F;
          count++;
        }
      }
    }
    const sun = count > 0 ? totalSun / count / 15 : 0;
    const blk = count > 0 ? totalBlock / count / 15 : 0;
    return Math.max(sun, blk);
  }

  buildMesh(world, material, transparentMaterial) {
    const opaque = { pos: [], norm: [], uv: [], col: [], idx: [] };
    const trans  = { pos: [], norm: [], uv: [], col: [], idx: [] };

    const baseX = this.cx * S;
    const baseZ = this.cz * S;
    const blocks = this.blocks;
    const light = this.light;

    for (let fi = 0; fi < 6; fi++) {
      const face = FACES[fi];
      const dir = face.dir;
      const na = face.na;
      const aa = face.aa;
      const ba = face.ba;

      const dimA = aa === 1 ? WORLD_HEIGHT : S;
      const dimB = ba === 1 ? WORLD_HEIGHT : S;
      const numSlices = na === 1 ? WORLD_HEIGHT : S;

      for (let n = 0; n < numSlices; n++) {
        const mask = new Array(dimA);
        for (let a = 0; a < dimA; a++) {
          const row = new Array(dimB);
          for (let b = 0; b < dimB; b++) {
            const coords = [0, 0, 0];
            coords[na] = n; coords[aa] = a; coords[ba] = b;
            const [x, y, z] = coords;

            const id = blocks[Chunk.idx(x, y, z)];
            if (id === AIR) { row[b] = null; continue; }

            const nx = x + dir[0], ny = y + dir[1], nz = z + dir[2];

            let neighbor;
            if (ny < 0 || ny >= WORLD_HEIGHT) {
              neighbor = AIR;
            } else if (nx < 0 || nx >= S || nz < 0 || nz >= S) {
              neighbor = world.getBlock(baseX + nx, ny, baseZ + nz);
            } else {
              neighbor = blocks[(ny * S + nz) * S + nx];
            }

            const isTrans = isTransparent(id);
            let visible = false;
            if (isTrans) {
              if (neighbor !== id) visible = true;
            } else if (isTransparent(neighbor)) {
              visible = true;
            }

            if (visible) {
              row[b] = { tile: tileForFace(id, face.name), transparent: isTrans };
            } else {
              row[b] = null;
            }
          }
          mask[a] = row;
        }

        for (let a = 0; a < dimA; a++) {
          for (let b = 0; b < dimB; b++) {
            const cell = mask[a][b];
            if (cell === null) continue;

            let width = 1;
            while (b + width < dimB) {
              const next = mask[a][b + width];
              if (next === null || next.tile !== cell.tile || next.transparent !== cell.transparent) break;
              width++;
            }

            let height = 1;
            for (let da = 1; a + da < dimA; da++) {
              let ok = true;
              for (let db = 0; db < width; db++) {
                const next = mask[a + da][b + db];
                if (next === null || next.tile !== cell.tile || next.transparent !== cell.transparent) {
                  ok = false; break;
                }
              }
              if (ok) height++;
              else break;
            }

            for (let da = 0; da < height; da++) {
              for (let db = 0; db < width; db++) {
                mask[a + da][b + db] = null;
              }
            }

            const tgt = cell.transparent ? trans : opaque;
            const uv = getUV(cell.tile);
            const verts = face.verts(n, a, a + height, b, b + width);
            const baseIdx = tgt.pos.length / 3;
            const l = this._faceLight(na, aa, ba, n, a, a + height, b, b + width, dir);

            tgt.pos.push(...verts[0], ...verts[1], ...verts[2], ...verts[3]);
            tgt.norm.push(dir[0], dir[1], dir[2], dir[0], dir[1], dir[2], dir[0], dir[1], dir[2], dir[0], dir[1], dir[2]);
            tgt.uv.push(uv.u0, uv.v0, uv.u1, uv.v0, uv.u1, uv.v1, uv.u0, uv.v1);
            tgt.col.push(l, l, l, l, l, l, l, l, l, l, l, l);
            tgt.idx.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
          }
        }
      }
    }

    this.disposeMesh();

    if (opaque.pos.length) {
      this.mesh = this.makeMesh(opaque, material);
      this.mesh.position.set(baseX, 0, baseZ);
    }
    if (trans.pos.length) {
      this.transparentMesh = this.makeMesh(trans, transparentMaterial);
      this.transparentMesh.position.set(baseX, 0, baseZ);
    }
    this.dirty = false;
  }

  makeMesh(data, material) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(data.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(data.norm, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(data.uv, 2));
    g.setAttribute("color", new THREE.Float32BufferAttribute(data.col, 3));
    g.setIndex(data.idx);
    const mesh = new THREE.Mesh(g, material);
    mesh.frustumCulled = true;
    return mesh;
  }

  disposeMesh() {
    if (this.mesh) { this.mesh.geometry.dispose(); this.mesh = null; }
    if (this.transparentMesh) { this.transparentMesh.geometry.dispose(); this.transparentMesh = null; }
  }
}
