import { ATLAS_TILES_PER_ROW, CHUNK_SX, CHUNK_SY, CHUNK_SZ, MAX_LIGHT_LEVEL } from "../config";
import { blockById, isLiquid } from "../content/blocks";
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
  return { positions: [], normals: [], uvs: [], sky: [], block: [], indices: [] };
}

function toMeshArrays(batch: MeshBatch): MeshArrays {
  return {
    positions: new Float32Array(batch.positions),
    normals: new Float32Array(batch.normals),
    uvs: new Float32Array(batch.uvs),
    sky: new Float32Array(batch.sky),
    block: new Float32Array(batch.block),
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
  }
  batch.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

function addCubeFace(
  batch: MeshBatch,
  face: number,
  tile: number,
  sky: number,
  block: number,
  lx: number,
  ly: number,
  lz: number
): void {
  pushQuad(batch, FACE_CORNERS[face], FACE_UVS[face], FACE_DIRS[face], tile, sky, block, lx, ly, lz);
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
  pushQuad(batch, PLANT_QUAD_A, PLANT_UVS, PLANT_NORMAL, tile, sky, block, lx, ly, lz);
  pushQuad(batch, PLANT_QUAD_B, PLANT_UVS, PLANT_NORMAL, tile, sky, block, lx, ly, lz);
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
          addCubeFace(batch, face, tileOf(id, face), sky, blockLight, x, y, z);
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
