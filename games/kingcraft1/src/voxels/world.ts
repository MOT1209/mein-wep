import { CHUNK_SX, CHUNK_SY, CHUNK_SZ, DAY_LENGTH_SECONDS, SEA_LEVEL, TICKS_PER_SECOND } from "../config";
import { B, lightEmitOf } from "../content/blocks";
import { clamp } from "../core/noise";
import { Chunk, chunkKey, localIndex } from "./chunk";
import { BIOME } from "./biomes";
import { LightWorld, applyBlockLightChange, initChunkLighting, updateSkyColumn } from "./lighting";
import { WorldGenerator } from "./worldgen";

export const DAY_TICKS = DAY_LENGTH_SECONDS * TICKS_PER_SECOND;

export interface SpawnPoint {
  x: number;
  y: number;
  z: number;
}

export class World implements LightWorld {
  readonly seedInt: number;
  readonly generator: WorldGenerator;
  readonly chunks = new Map<string, Chunk>();
  readonly storedChunks = new Map<string, Uint8Array>();
  time = 0;

  private readonly cacheKeys = new Float64Array(16).fill(Number.NaN);
  private readonly cacheChunks = new Array<Chunk | undefined>(16).fill(undefined);

  constructor(seedInt: number, generator?: WorldGenerator) {
    this.seedInt = seedInt >>> 0;
    this.generator = generator ?? new WorldGenerator(this.seedInt);
  }

  private chunkAt(cx: number, cz: number): Chunk | undefined {
    const slot = ((cx * 31 + cz) & 15) >>> 0;
    const key = cx * 100000 + cz;
    if (this.cacheKeys[slot] === key) return this.cacheChunks[slot];
    const chunk = this.chunks.get(chunkKey(cx, cz));
    this.cacheKeys[slot] = key;
    this.cacheChunks[slot] = chunk;
    return chunk;
  }

  private invalidateChunkCache(): void {
    this.cacheKeys.fill(Number.NaN);
    this.cacheChunks.fill(undefined);
  }

  get loadedChunkCount(): number {
    return this.chunks.size;
  }

  isChunkLoaded(cx: number, cz: number): boolean {
    return this.chunks.has(chunkKey(cx, cz));
  }

  getChunkIfLoaded(cx: number, cz: number): Chunk | undefined {
    return this.chunkAt(cx, cz);
  }

  ensureChunk(cx: number, cz: number): Chunk {
    const key = chunkKey(cx, cz);
    const existing = this.chunks.get(key);
    if (existing) return existing;
    const chunk = new Chunk(cx, cz);
    this.generator.generateChunk(chunk);
    const stored = this.storedChunks.get(key);
    if (stored && stored.length === chunk.blocks.length) {
      chunk.blocks.set(stored);
      chunk.modified = true;
      chunk.recomputeAllHeights();
    }
    this.chunks.set(key, chunk);
    this.invalidateChunkCache();
    initChunkLighting(this, chunk);
    return chunk;
  }

  unloadChunk(cx: number, cz: number): Chunk | undefined {
    const key = chunkKey(cx, cz);
    const chunk = this.chunks.get(key);
    if (chunk) {
      if (chunk.modified) this.storedChunks.set(key, chunk.blocks.slice());
      this.chunks.delete(key);
      this.invalidateChunkCache();
    }
    return chunk;
  }

  getBlock(x: number, y: number, z: number): number {
    if (y < 0) return B.BEDROCK;
    if (y >= CHUNK_SY) return B.AIR;
    const cx = Math.floor(x / CHUNK_SX);
    const cz = Math.floor(z / CHUNK_SZ);
    const chunk = this.chunkAt(cx, cz);
    if (!chunk) return B.AIR;
    return chunk.blocks[localIndex(x - cx * CHUNK_SX, y, z - cz * CHUNK_SZ)];
  }

  isBlockLoaded(x: number, z: number): boolean {
    return this.isChunkLoaded(Math.floor(x / CHUNK_SX), Math.floor(z / CHUNK_SZ));
  }

  setBlock(x: number, y: number, z: number, id: number): boolean {
    if (y < 1 || y >= CHUNK_SY) return false;
    const cx = Math.floor(x / CHUNK_SX);
    const cz = Math.floor(z / CHUNK_SZ);
    const chunk = this.chunkAt(cx, cz);
    if (!chunk) return false;
    const lx = x - cx * CHUNK_SX;
    const lz = z - cz * CHUNK_SZ;
    const old = chunk.blocks[localIndex(lx, y, lz)];
    if (old === id) return false;
    chunk.setBlockRaw(lx, y, lz, id);
    chunk.recomputeHeight(lx, lz);
    this.markMeshArea(x, z);
    updateSkyColumn(this, x, z);
    applyBlockLightChange(this, x, y, z, lightEmitOf(id));
    return true;
  }

  private markMeshArea(x: number, z: number): void {
    const cx = Math.floor(x / CHUNK_SX);
    const cz = Math.floor(z / CHUNK_SZ);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const ox = dx === 0 ? 0 : dx === 1 ? (cx + 1) * CHUNK_SX - x : x - (cx * CHUNK_SX - 1);
        const oz = dz === 0 ? 0 : dz === 1 ? (cz + 1) * CHUNK_SZ - z : z - (cz * CHUNK_SZ - 1);
        if (ox * ox + oz * oz > 15 * 15) continue;
        const chunk = this.getChunkIfLoaded(cx + dx, cz + dz);
        if (chunk) chunk.meshDirty = true;
      }
    }
  }

  getSkyLight(x: number, y: number, z: number): number {
    if (y >= CHUNK_SY) return 15;
    if (y < 0) return 0;
    const cx = Math.floor(x / CHUNK_SX);
    const cz = Math.floor(z / CHUNK_SZ);
    const chunk = this.chunkAt(cx, cz);
    if (!chunk) return 0;
    return chunk.skyLight[localIndex(x - cx * CHUNK_SX, y, z - cz * CHUNK_SZ)];
  }

  setSkyLight(x: number, y: number, z: number, value: number): void {
    if (y < 0 || y >= CHUNK_SY) return;
    const cx = Math.floor(x / CHUNK_SX);
    const cz = Math.floor(z / CHUNK_SZ);
    const chunk = this.chunkAt(cx, cz);
    if (!chunk) return;
    chunk.setSky(x - cx * CHUNK_SX, y, z - cz * CHUNK_SZ, value);
  }

  getBlockLight(x: number, y: number, z: number): number {
    if (y < 0 || y >= CHUNK_SY) return 0;
    const cx = Math.floor(x / CHUNK_SX);
    const cz = Math.floor(z / CHUNK_SZ);
    const chunk = this.chunkAt(cx, cz);
    if (!chunk) return 0;
    return chunk.blockLight[localIndex(x - cx * CHUNK_SX, y, z - cz * CHUNK_SZ)];
  }

  setBlockLight(x: number, y: number, z: number, value: number): void {
    if (y < 0 || y >= CHUNK_SY) return;
    const cx = Math.floor(x / CHUNK_SX);
    const cz = Math.floor(z / CHUNK_SZ);
    const chunk = this.chunkAt(cx, cz);
    if (!chunk) return;
    chunk.setBlockLight(x - cx * CHUNK_SX, y, z - cz * CHUNK_SZ, value);
  }

  relightChunk(chunk: Chunk): void {
    chunk.skyLight.fill(0);
    chunk.blockLight.fill(0);
    initChunkLighting(this, chunk);
  }

  applySavedBlocks(cx: number, cz: number, blocks: Uint8Array): void {
    const chunk = this.ensureChunk(cx, cz);
    chunk.blocks.set(blocks);
    chunk.modified = true;
    chunk.recomputeAllHeights();
    this.relightChunk(chunk);
    chunk.meshDirty = true;
  }

  getBiome(x: number, z: number): number {
    const cx = Math.floor(x / CHUNK_SX);
    const cz = Math.floor(z / CHUNK_SZ);
    const chunk = this.getChunkIfLoaded(cx, cz);
    if (chunk) return chunk.getBiome(x - cx * CHUNK_SX, z - cz * CHUNK_SZ);
    const h = this.generator.columnHeight(x, z);
    return this.generator.biomeAtColumn(x, z, h);
  }

  columnHeight(x: number, z: number): number {
    const cx = Math.floor(x / CHUNK_SX);
    const cz = Math.floor(z / CHUNK_SZ);
    const chunk = this.getChunkIfLoaded(cx, cz);
    if (chunk) return chunk.columnHeight(x - cx * CHUNK_SX, z - cz * CHUNK_SZ);
    return this.generator.columnHeight(x, z);
  }

  highestSolidY(x: number, z: number): number {
    const cx = Math.floor(x / CHUNK_SX);
    const cz = Math.floor(z / CHUNK_SZ);
    const chunk = this.getChunkIfLoaded(cx, cz);
    if (chunk) return chunk.topSolidY(x - cx * CHUNK_SX, z - cz * CHUNK_SZ);
    return this.generator.columnHeight(x, z);
  }

  findSpawn(): SpawnPoint {
    const offsets: [number, number][] = [[0, 0]];
    for (let r = 0; r <= 48; r += 8) {
      for (const [ox, oz] of offsets) {
        const x = ox;
        const z = oz;
        const h = this.generator.columnHeight(x, z);
        const biome = this.generator.biomeAtColumn(x, z, h);
        if (biome === BIOME.OCEAN || h <= SEA_LEVEL + 1) continue;
        return { x: x + 0.5, y: h + 1.02, z: z + 0.5 };
      }
      offsets.length = 0;
      offsets.push(
        [r, 0],
        [-r, 0],
        [0, r],
        [0, -r],
        [r, r],
        [-r, r],
        [r, -r],
        [-r, -r]
      );
    }
    return { x: 0.5, y: SEA_LEVEL + 2, z: 0.5 };
  }

  advanceTime(ticks: number): void {
    this.time += ticks;
  }

  get dayFraction(): number {
    const t = this.time % DAY_TICKS;
    return (t < 0 ? t + DAY_TICKS : t) / DAY_TICKS;
  }

  get dayFactor(): number {
    return clamp(0.5 + 0.75 * Math.sin(this.dayFraction * Math.PI * 2), 0.08, 1);
  }

  get isNight(): boolean {
    return this.dayFraction > 0.5;
  }

  setTimeOfDay(fraction: number): void {
    const clamped = clamp(fraction, 0, 0.999);
    this.time = Math.floor(this.time / DAY_TICKS) * DAY_TICKS + Math.floor(clamped * DAY_TICKS);
  }

  skipToMorning(): void {
    this.time = (Math.floor(this.time / DAY_TICKS) + 1) * DAY_TICKS;
  }

  modifiedChunkData(): Map<string, Uint8Array> {
    const out = new Map(this.storedChunks);
    for (const chunk of this.getModifiedChunks()) out.set(chunkKey(chunk.cx, chunk.cz), chunk.blocks);
    return out;
  }

  getModifiedChunks(): Chunk[] {
    const out: Chunk[] = [];
    for (const chunk of this.chunks.values()) {
      if (chunk.modified) out.push(chunk);
    }
    return out;
  }
}
