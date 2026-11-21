import { ATLAS_TILES_PER_ROW, CHUNK_SX, CHUNK_SY, CHUNK_SZ, MAX_LIGHT_LEVEL } from "../config";
import { B, blockById, isLiquid, isSolidBlock } from "../content/blocks";
import { Chunk, localIndex } from "./chunk";

export const FACE_PX = 0;
export const FACE_NX = 1;
export const FACE_PY = 2;
export const FACE_NY = 3;
export const FACE_PZ = 4;
export const FACE_NZ = 5;

export type TileOf = (blockId: number, face: number) => number;

export interface MeshSource {
  getBlock(x: number, y: number, z: number): number;
  getSkyLight(x: number, y: number, z: number): number;
  getBlockLight(x: number, y: number, z: number): number;
}

export interface MeshArrays {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  sky: Float32Array;
  block: Float32Array;
  ao: Float32Array;
  indices: Uint32Array;
}

export interface ChunkMeshData {
  opaque: MeshArrays;
  water: MeshArrays;
  plants: MeshArrays;
}

interface MeshBatch {
  positions: number[];
  normals: number[];
  uvs: number[];
  sky: number[];
  block: number[];
  ao: number[];
  indices: number[];
}

const FACE_DIRS: readonly (readonly [number, number, number])[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1]
];

const FACE_CORNERS: readonly (readonly (readonly [number, number, number])[])[] = [
  [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]],
  [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]],
  [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]],
  [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
  [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
  [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]]
];

const FACE_UVS: readonly (readonly (readonly [number, number])[])[] = [
  [[0, 0], [0, 1], [1, 1], [1, 0]],
  [[0, 0], [0, 1], [1, 1], [1, 0]],
  [[0, 0], [1, 0], [1, 1], [0, 1]],
  [[0, 0], [1, 0], [1, 1], [0, 1]],
  [[0, 0], [1, 0], [1, 1], [0, 1]],
  [[0, 0], [1, 0], [1, 1], [0, 1]]
];

const PLANT_NORMAL: readonly [number, number, number] = [0, 1, 0];
const ONE: readonly number[] = [1, 1, 1, 1];

const PLANT_QUAD_A: readonly (readonly [number, number, number])[] = [
  [0, 0, 0],
  [0, 1, 0],
  [1, 1, 1],
  [1, 0, 1]
];

const PLANT_QUAD_B: readonly (readonly [number, number, number])[] = [
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, 1]
];

const PLANT_UVS: readonly (readonly [number, number])[] = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 0]
];

function createBatch(): MeshBatch {
  return { positions: [], normals: [], uvs: [], sky: [], block: [], ao: [], indices: [] };
}

export function vertexOcclusion(side1: boolean, side2: boolean, corner: boolean): number {
  if (side1 && side2) return 0.5;
  const total = (side1 ? 1 : 0) + (side2 ? 1 : 0) + (corner ? 1 : 0);
  if (total === 0) return 1;
  if (total === 1) return 0.82;
  if (total === 2) return 0.66;
  return 0.5;
}

function toMeshArrays(batch: MeshBatch): MeshArrays {
  return {
    positions: new Float32Array(batch.positions),
    normals: new Float32Array(batch.normals),
    uvs: new Float32Array(batch.uvs),
    sky: new Float32Array(batch.sky),
    block: new Float32Array(batch.block),
    ao: new Float32Array(batch.ao),
    indices: new Uint32Array(batch.indices)
  };
}

function pushQuad(
  batch: MeshBatch,
  corners: readonly (readonly [number, number, number])[],
  uvs: readonly (readonly [number, number])[],
  normal: readonly [number, number, number],
  tile: number,
  sky: number,
  block: number,
  ao: readonly number[],
  lx: number,
  ly: number,
  lz: number
): void {
  const tx = tile % ATLAS_TILES_PER_ROW;
  const ty = (tile / ATLAS_TILES_PER_ROW) | 0;
  const base = batch.positions.length / 3;
  for (let i = 0; i < 4; i++) {
    batch.positions.push(lx + corners[i][0], ly + corners[i][1], lz + corners[i][2]);
    batch.normals.push(normal[0], normal[1], normal[2]);
    batch.uvs.push((tx + uvs[i][0]) / ATLAS_TILES_PER_ROW, (ty + uvs[i][1]) / ATLAS_TILES_PER_ROW);
    batch.sky.push(sky);
    batch.block.push(block);
    batch.ao.push(ao[i]);
  }
  batch.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

const AO_SCRATCH: number[] = [1, 1, 1, 1];

function solidAt(source: MeshSource, x: number, y: number, z: number): boolean {
  return blockById(source.getBlock(x, y, z)).opaque;
}

function faceOcclusion(
  source: MeshSource,
  face: number,
  wx: number,
  y: number,
  wz: number,
  corners: readonly (readonly [number, number, number])[]
): number[] {
  const dir = FACE_DIRS[face];
  const axis = dir[0] !== 0 ? 0 : dir[1] !== 0 ? 1 : 2;
  const ta: number = axis === 0 ? 1 : 0;
  const tb: number = axis === 2 ? 1 : 2;
  const bx = wx + dir[0];
  const by = y + dir[1];
  const bz = wz + dir[2];
  for (let i = 0; i < 4; i++) {
    const sa = corners[i][ta] === 0 ? -1 : 1;
    const sb = corners[i][tb] === 0 ? -1 : 1;
    const ax = ta === 0 ? bx + sa : bx;
    const ay = ta === 1 ? by + sa : by;
    const az = ta === 2 ? bz + sa : bz;
    const cx = tb === 0 ? bx + sb : bx;
    const cy = tb === 1 ? by + sb : by;
    const cz = tb === 2 ? bz + sb : bz;
    AO_SCRATCH[i] = vertexOcclusion(
      solidAt(source, ax, ay, az),
      solidAt(source, cx, cy, cz),
      solidAt(source,
        bx + (ta === 0 ? sa : 0) + (tb === 0 ? sb : 0),
        by + (ta === 1 ? sa : 0) + (tb === 1 ? sb : 0),
        bz + (ta === 2 ? sa : 0) + (tb === 2 ? sb : 0)
      )
    );
  }
  return AO_SCRATCH;
}

function addCubeFace(
  batch: MeshBatch,
  source: MeshSource,
  face: number,
  tile: number,
  sky: number,
  block: number,
  wx: number,
  y: number,
  wz: number,
  lx: number,
  ly: number,
  lz: number
): void {
  const ao = faceOcclusion(source, face, wx, y, wz, FACE_CORNERS[face]);
  pushQuad(batch, FACE_CORNERS[face], FACE_UVS[face], FACE_DIRS[face], tile, sky, block, ao, lx, ly, lz);
}

const DOOR_THICKNESS = 0.1875;

/** A door leaf spans the wall it sits in; the wall is inferred from the solid blocks beside it. */
function doorSpansX(source: MeshSource, wx: number, y: number, wz: number): boolean {
  const wallX = isSolidBlock(source.getBlock(wx - 1, y, wz)) && isSolidBlock(source.getBlock(wx + 1, y, wz));
  if (wallX) return true;
  const wallZ = isSolidBlock(source.getBlock(wx, y, wz - 1)) && isSolidBlock(source.getBlock(wx, y, wz + 1));
  return !wallZ;
}

function doorBox(open: boolean, spanX: boolean): readonly [number, number, number, number, number, number] {
  const t = DOOR_THICKNESS;
  if (!open) {
    return spanX ? [0, 0, 0.5 - t / 2, 1, 1, 0.5 + t / 2] : [0.5 - t / 2, 0, 0, 0.5 + t / 2, 1, 1];
  }
  return spanX ? [0, 0, 0, t, 1, 1] : [0, 0, 0, 1, 1, t];
}

function addBox(
  batch: MeshBatch,
  source: MeshSource,
  box: readonly [number, number, number, number, number, number],
  tileOfFace: (face: number) => number,
  wx: number,
  y: number,
  wz: number,
  lx: number,
  ly: number,
  lz: number
): void {
  const [x0, y0, z0, x1, y1, z1] = box;
  for (let face = 0; face < 6; face++) {
    const dir = FACE_DIRS[face];
    const sky = source.getSkyLight(wx + dir[0], y + dir[1], wz + dir[2]) / MAX_LIGHT_LEVEL;
    const block = source.getBlockLight(wx + dir[0], y + dir[1], wz + dir[2]) / MAX_LIGHT_LEVEL;
    const corners = FACE_CORNERS[face].map(
      ([px, py, pz]) => [px ? x1 : x0, py ? y1 : y0, pz ? z1 : z0] as [number, number, number]
    );
    pushQuad(batch, corners, FACE_UVS[face], dir, tileOfFace(face), sky, block, ONE, lx, ly, lz);
  }
}

function addPlant(
  batch: MeshBatch,
  tile: number,
  sky: number,
  block: number,
  lx: number,
  ly: number,
  lz: number
): void {
  pushQuad(batch, PLANT_QUAD_A, PLANT_UVS, PLANT_NORMAL, tile, sky, block, ONE, lx, ly, lz);
  pushQuad(batch, PLANT_QUAD_B, PLANT_UVS, PLANT_NORMAL, tile, sky, block, ONE, lx, ly, lz);
}

export function buildChunkMesh(source: MeshSource, chunk: Chunk, tileOf: TileOf): ChunkMeshData {
  const opaque = createBatch();
  const water = createBatch();
  const plants = createBatch();
  const originX = chunk.cx * CHUNK_SX;
  const originZ = chunk.cz * CHUNK_SZ;

  for (let y = 0; y < CHUNK_SY; y++) {
    for (let z = 0; z < CHUNK_SZ; z++) {
      for (let x = 0; x < CHUNK_SX; x++) {
        const id = chunk.blocks[localIndex(x, y, z)];
        if (id === 0) continue;
        const def = blockById(id);
        const wx = originX + x;
        const wz = originZ + z;

        if (id === B.DOOR_CLOSED || id === B.DOOR_OPEN) {
          const spanX = doorSpansX(source, wx, y, wz);
          addBox(
            opaque,
            source,
            doorBox(id === B.DOOR_OPEN, spanX),
            (face) => tileOf(id, face),
            wx,
            y,
            wz,
            x,
            y,
            z
          );
          continue;
        }

        if (def.render === "cross") {
          const sky = source.getSkyLight(wx, y, wz) / MAX_LIGHT_LEVEL;
          const blockLight = source.getBlockLight(wx, y, wz) / MAX_LIGHT_LEVEL;
          addPlant(plants, tileOf(id, FACE_PY), sky, blockLight, x, y, z);
          continue;
        }

        const batch = def.render === "liquid" ? water : opaque;
        for (let face = 0; face < 6; face++) {
          const dir = FACE_DIRS[face];
          const nx = wx + dir[0];
          const ny = y + dir[1];
          const nz = wz + dir[2];
          const neighbor = source.getBlock(nx, ny, nz);
          if (neighbor !== 0) {
            const neighborDef = blockById(neighbor);
            if (neighborDef.opaque) continue;
            if (def.render === "liquid" && isLiquid(neighbor)) continue;
            if (def.render === "cube" && neighbor === id) continue;
            if (def.render === "liquid" && neighborDef.render === "cross") continue;
          }
          const sky = source.getSkyLight(nx, ny, nz) / MAX_LIGHT_LEVEL;
          const blockLight = source.getBlockLight(nx, ny, nz) / MAX_LIGHT_LEVEL;
          addCubeFace(batch, source, face, tileOf(id, face), sky, blockLight, wx, y, wz, x, y, z);
        }
      }
    }
  }

  return {
    opaque: toMeshArrays(opaque),
    water: toMeshArrays(water),
    plants: toMeshArrays(plants)
  };
}
