import { CHUNK_SX, CHUNK_SY, CHUNK_SZ, CHUNK_VOLUME } from "../config";
import { blockById } from "../content/blocks";

export function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

export function parseChunkKey(key: string): { cx: number; cz: number } {
  const comma = key.indexOf(",");
  return { cx: Number(key.slice(0, comma)), cz: Number(key.slice(comma + 1)) };
}

export function localIndex(x: number, y: number, z: number): number {
  return (y * CHUNK_SZ + z) * CHUNK_SX + x;
}

export function inChunkBounds(x: number, y: number, z: number): boolean {
  return x >= 0 && x < CHUNK_SX && y >= 0 && y < CHUNK_SY && z >= 0 && z < CHUNK_SZ;
}

export class Chunk {
  readonly cx: number;
  readonly cz: number;
  readonly blocks: Uint8Array;
  readonly skyLight: Uint8Array;
  readonly blockLight: Uint8Array;
  readonly biomes: Uint8Array;
  readonly heightMap: Uint8Array;
  generated = false;
  modified = false;
  meshDirty = true;
  lightDirty = true;
  entitiesLoaded = false;

  constructor(cx: number, cz: number) {
    this.cx = cx;
    this.cz = cz;
    this.blocks = new Uint8Array(CHUNK_VOLUME);
    this.skyLight = new Uint8Array(CHUNK_VOLUME);
    this.blockLight = new Uint8Array(CHUNK_VOLUME);
    this.biomes = new Uint8Array(CHUNK_SX * CHUNK_SZ);
    this.heightMap = new Uint8Array(CHUNK_SX * CHUNK_SZ);
  }

  getBlock(x: number, y: number, z: number): number {
    if (!inChunkBounds(x, y, z)) return 0;
    return this.blocks[localIndex(x, y, z)];
  }

  setBlockRaw(x: number, y: number, z: number, id: number): void {
    if (!inChunkBounds(x, y, z)) return;
    this.blocks[localIndex(x, y, z)] = id;
    this.modified = true;
  }

  getSky(x: number, y: number, z: number): number {
    if (y >= CHUNK_SY) return 15;
    if (!inChunkBounds(x, y, z)) return 0;
    return this.skyLight[localIndex(x, y, z)];
  }

  setSky(x: number, y: number, z: number, value: number): void {
    if (!inChunkBounds(x, y, z)) return;
    this.skyLight[localIndex(x, y, z)] = value;
  }

  getBlockLight(x: number, y: number, z: number): number {
    if (!inChunkBounds(x, y, z)) return 0;
    return this.blockLight[localIndex(x, y, z)];
  }

  setBlockLight(x: number, y: number, z: number, value: number): void {
    if (!inChunkBounds(x, y, z)) return;
    this.blockLight[localIndex(x, y, z)] = value;
  }

  getBiome(x: number, z: number): number {
    return this.biomes[z * CHUNK_SX + x];
  }

  setBiome(x: number, z: number, id: number): void {
    this.biomes[z * CHUNK_SX + x] = id;
  }

  columnHeight(x: number, z: number): number {
    return this.heightMap[z * CHUNK_SX + x];
  }

  recomputeHeight(x: number, z: number): number {
    for (let y = CHUNK_SY - 1; y >= 0; y--) {
      if (this.blocks[localIndex(x, y, z)] !== 0) {
        this.heightMap[z * CHUNK_SX + x] = y;
        return y;
      }
    }
    this.heightMap[z * CHUNK_SX + x] = 0;
    return 0;
  }

  recomputeAllHeights(): void {
    for (let z = 0; z < CHUNK_SZ; z++) {
      for (let x = 0; x < CHUNK_SX; x++) {
        this.recomputeHeight(x, z);
      }
    }
  }

  topSolidY(x: number, z: number): number {
    for (let y = CHUNK_SY - 1; y >= 0; y--) {
      const id = this.blocks[localIndex(x, y, z)];
      if (id !== 0 && blockById(id).solid) return y;
    }
    return -1;
  }

  forEachBlock(visit: (id: number, x: number, y: number, z: number) => void): void {
    for (let y = 0; y < CHUNK_SY; y++) {
      for (let z = 0; z < CHUNK_SZ; z++) {
        for (let x = 0; x < CHUNK_SX; x++) {
          const id = this.blocks[localIndex(x, y, z)];
          visit(id, x, y, z);
        }
      }
    }
  }
}
