// قطعة العالم (Chunk): تخزّن الكتل وتبني الميش بحذف الأوجه المخفية (face culling).
import * as THREE from "three";
import { CHUNK_SIZE, WORLD_HEIGHT } from "../utils/Constants.js";
import { AIR, isTransparent, tileForFace } from "./BlockData.js";
import { getUV } from "../blocks/BlockTexture.js";

const S = CHUNK_SIZE;

// تعريف الأوجه الستة: الاتجاه، الإزاحة، الزوايا الأربع، اسم الوجه، والإضاءة
const FACES = [
  { dir: [ 1, 0, 0], name: "side", cx:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]], light: 0.8 },
  { dir: [-1, 0, 0], name: "side", cx:[[0,0,1],[0,1,1],[0,1,0],[0,0,0]], light: 0.8 },
  { dir: [ 0, 1, 0], name: "top",  cx:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]], light: 1.0 },
  { dir: [ 0,-1, 0], name: "bottom", cx:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]], light: 0.5 },
  { dir: [ 0, 0, 1], name: "side", cx:[[1,0,1],[1,1,1],[0,1,1],[0,0,1]], light: 0.9 },
  { dir: [ 0, 0,-1], name: "side", cx:[[0,0,0],[0,1,0],[1,1,0],[1,0,0]], light: 0.7 },
];

export class Chunk {
  constructor(cx, cz) {
    this.cx = cx;
    this.cz = cz;
    this.blocks = new Uint8Array(S * S * WORLD_HEIGHT);
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

  // يبني هندسة الميش. world يوفّر getBlock عبر حدود القطع.
  buildMesh(world, material, transparentMaterial) {
    const opaque = { pos: [], norm: [], uv: [], col: [], idx: [] };
    const trans  = { pos: [], norm: [], uv: [], col: [], idx: [] };

    const baseX = this.cx * S;
    const baseZ = this.cz * S;
    const blocks = this.blocks;
    const stride = S * S;

    for (let y = 0; y < WORLD_HEIGHT; y++) {
      const yOff = y * stride;
      for (let z = 0; z < S; z++) {
        const zOff = yOff + z * S;
        for (let x = 0; x < S; x++) {
          const id = blocks[zOff + x];
          if (id === AIR) continue;
          const tgt = isTransparent(id) ? trans : opaque;

          for (let fi = 0; fi < 6; fi++) {
            const face = FACES[fi];
            const nx = x + face.dir[0];
            const ny = y + face.dir[1];
            const nz = z + face.dir[2];

            let neighbor;
            if (ny < 0 || ny >= WORLD_HEIGHT) {
              neighbor = AIR;
            } else if (nx < 0 || nx >= S || nz < 0 || nz >= S) {
              neighbor = world.getBlock(baseX + nx, ny, baseZ + nz);
            } else {
              neighbor = blocks[(ny * S + nz) * S + nx];
            }

            if (tgt === trans) {
              if (neighbor === id) continue;
              // وجه شفاف: يظهر إذا كان المجاور غير شفاف (صلب) أو شفاف مختلف
            } else if (!isTransparent(neighbor)) {
              continue;
            }

            this.addFace(tgt, x, y, z, face, id);
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

  addFace(target, x, y, z, face, id) {
    const tile = tileForFace(id, face.name);
    const uv = getUV(tile);
    const base = target.pos.length / 3;
    const l = face.light;
    const dir = face.dir;
    const corners = face.cx;

    target.pos.push(
      x + corners[0][0], y + corners[0][1], z + corners[0][2],
      x + corners[1][0], y + corners[1][1], z + corners[1][2],
      x + corners[2][0], y + corners[2][1], z + corners[2][2],
      x + corners[3][0], y + corners[3][1], z + corners[3][2],
    );
    target.norm.push(dir[0], dir[1], dir[2], dir[0], dir[1], dir[2], dir[0], dir[1], dir[2], dir[0], dir[1], dir[2]);
    target.uv.push(uv.u0, uv.v0, uv.u0, uv.v1, uv.u1, uv.v1, uv.u1, uv.v0);
    target.col.push(l, l, l, l, l, l, l, l, l, l, l, l);
    target.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
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
