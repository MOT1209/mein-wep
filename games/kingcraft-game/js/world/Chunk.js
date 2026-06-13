import * as THREE from "three";
import { CHUNK_SIZE, WORLD_HEIGHT } from "../utils/Constants.js";
import { AIR, isTransparent, tileForFace } from "./BlockData.js";
import { getUV } from "../blocks/BlockTexture.js";

const S = CHUNK_SIZE;

const FACES = [
  { dir: [ 1, 0, 0], name: "side",    light: 0.8, u: 1, v: 2, w: 0 },
  { dir: [-1, 0, 0], name: "side",    light: 0.8, u: 1, v: 2, w: 0 },
  { dir: [ 0, 1, 0], name: "top",     light: 1.0, u: 0, v: 2, w: 1 },
  { dir: [ 0,-1, 0], name: "bottom",  light: 0.5, u: 0, v: 2, w: 1 },
  { dir: [ 0, 0, 1], name: "side",    light: 0.9, u: 0, v: 2, w: 1 },
  { dir: [ 0, 0,-1], name: "side",    light: 0.7, u: 0, v: 2, w: 1 },
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

  _neighborId(world, baseX, baseZ, nx, ny, nz) {
    if (ny < 0 || ny >= WORLD_HEIGHT) return AIR;
    if (nx >= 0 && nx < S && nz >= 0 && nz < S) {
      return this.blocks[(ny * S + nz) * S + nx];
    }
    return world.getBlock(baseX + nx, ny, baseZ + nz);
  }

  _shouldShowFace(world, baseX, baseZ, x, y, z, nx, ny, nz, id, tgtTrans) {
    const neighbor = this._neighborId(world, baseX, baseZ, nx, ny, nz);
    if (tgtTrans) {
      return neighbor !== id;
    }
    return isTransparent(neighbor);
  }

  buildMesh(world, material, transparentMaterial) {
    const opaque = { pos: [], norm: [], uv: [], col: [], idx: [] };
    const trans  = { pos: [], norm: [], uv: [], col: [], idx: [] };

    const baseX = this.cx * S;
    const baseZ = this.cz * S;
    const blocks = this.blocks;

    for (let fi = 0; fi < 6; fi++) {
      const face = FACES[fi];
      const [dx, dy, dz] = face.dir;
      const uAxis = face.u;
      const vAxis = face.v;
      const wAxis = face.w;

      const du = uAxis === 0 ? 1 : 0;
      const dv = vAxis === 0 ? 1 : 0;
      const dw = wAxis === 0 ? 1 : 0;

      const uSize = du === 1 ? S : (dv === 1 ? S : (dw === 1 ? S : 1));
      const vSize = du === 1 ? S : (dv === 1 ? S : (dw === 1 ? S : 1));
      const wSize = du === 1 ? WORLD_HEIGHT : (dv === 1 ? WORLD_HEIGHT : S);

      const mask = new Int8Array(uSize * vSize);

      const cornerOff = [
        [0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1],
      ];

      for (let ww = 0; ww < wSize; ww++) {
        let maskCount = 0;
        for (let v = 0; v < vSize; v++) {
          for (let u = 0; u < uSize; u++) {
            const coords = [0, 0, 0];
            coords[uAxis] = u;
            coords[vAxis] = v;
            coords[wAxis] = dy === 1 ? ww : (dy === -1 ? ww : (dx === 1 ? ww : (dx === -1 ? ww : (dz === 1 ? ww : ww))));
            const x = coords[0], y = coords[1], z = coords[2];

            if (x >= S || y >= WORLD_HEIGHT || z >= S) { mask[u + v * uSize] = 0; continue; }

            const id = blocks[(y * S + z) * S + x];
            if (id === AIR) { mask[u + v * uSize] = 0; continue; }

            const nx = x + dx, ny = y + dy, nz = z + dz;
            const tgtTrans = isTransparent(id);

            if (!this._shouldShowFace(world, baseX, baseZ, x, y, z, nx, ny, nz, id, tgtTrans)) {
              mask[u + v * uSize] = 0;
              continue;
            }

            mask[u + v * uSize] = tgtTrans ? -(id + 1) : (id + 1);
            maskCount++;
          }
        }

        if (maskCount === 0) continue;

        for (let v = 0; v < vSize; v++) {
          for (let u = 0; u < uSize; ) {
            const val = mask[u + v * uSize];
            if (val === 0) { u++; continue; }

            const uv_id = val > 0 ? val - 1 : -(val + 1);
            const isTrans = val < 0;

            let maxW = uSize;
            for (let uu = u + 1; uu < uSize; uu++) {
              if (mask[uu + v * uSize] !== val) { maxW = uu; break; }
            }

            let maxH = v + 1;
            for (let vv = v + 1; vv < vSize; vv++) {
              let rowOk = true;
              for (let uu = u; uu < maxW; uu++) {
                if (mask[uu + vv * uSize] !== val) { rowOk = false; break; }
              }
              if (!rowOk) break;
              maxH = vv + 1;
            }

            for (let vv = v; vv < maxH; vv++) {
              for (let uu = u; uu < maxW; uu++) {
                mask[uu + vv * uSize] = 0;
              }
            }

            const tgt = isTrans ? trans : opaque;
            const tile = tileForFace(uv_id, face.name);
            const uvData = getUV(tile);
            const l = face.light;

            const wPos = dx === 1 ? ww + 1 : (dx === -1 ? ww : (dy === 1 ? ww + 1 : (dy === -1 ? ww : (dz === 1 ? ww + 1 : ww))));

            const p0 = [0, 0, 0], p1 = [0, 0, 0], p2 = [0, 0, 0], p3 = [0, 0, 0];
            p0[uAxis] = u;     p0[vAxis] = v;     p0[wAxis] = wPos;
            p1[uAxis] = u + maxW; p1[vAxis] = v;     p1[wAxis] = wPos;
            p2[uAxis] = u + maxW; p2[vAxis] = v + maxH; p2[wAxis] = wPos;
            p3[uAxis] = u;     p3[vAxis] = v + maxH; p3[wAxis] = wPos;

            const base = tgt.pos.length / 3;
            tgt.pos.push(
              p0[0], p0[1], p0[2],
              p1[0], p1[1], p1[2],
              p2[0], p2[1], p2[2],
              p3[0], p3[1], p3[2],
            );
            tgt.norm.push(dx, dy, dz, dx, dy, dz, dx, dy, dz, dx, dy, dz);

            const u0 = uvData.u0, v0 = uvData.v0;
            const u1 = uvData.u1, v1 = uvData.v1;
            const duv = (u1 - u0) / S;
            const dvv = (v1 - v0) / S;

            tgt.uv.push(
              u0 + u * duv, v0 + (vSize - v - maxH) * dvv,
              u0 + (u + maxW) * duv, v0 + (vSize - v - maxH) * dvv,
              u0 + (u + maxW) * duv, v0 + (vSize - v) * dvv,
              u0 + u * duv, v0 + (vSize - v) * dvv,
            );
            tgt.col.push(l, l, l, l, l, l, l, l, l, l, l, l);
            tgt.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);

            u = maxW;
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
    const corners = face.cx;

    target.pos.push(
      x + corners[0][0], y + corners[0][1], z + corners[0][2],
      x + corners[1][0], y + corners[1][1], z + corners[1][2],
      x + corners[2][0], y + corners[2][1], z + corners[2][2],
      x + corners[3][0], y + corners[3][1], z + corners[3][2],
    );
    target.norm.push(l, l, l, l, l, l, l, l, l, l, l, l);
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
