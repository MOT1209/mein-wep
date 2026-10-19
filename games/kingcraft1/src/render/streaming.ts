import { CHUNK_SX, CHUNK_SZ, CHUNK_UNLOAD_MARGIN, DEFAULT_RENDER_DISTANCE } from "../config";

export interface StreamWorld {
  readonly chunks: {
    readonly size: number;
    values(): IterableIterator<{ readonly cx: number; readonly cz: number }>;
  };
  isChunkLoaded(cx: number, cz: number): boolean;
  ensureChunk(cx: number, cz: number): unknown;
  unloadChunk(cx: number, cz: number): unknown;
}

export interface StreamRenderer {
  markDirty(cx: number, cz: number): void;
  dispose(cx: number, cz: number): void;
}

export interface ChunkStreamerOptions {
  renderDistance?: number;
  unloadMargin?: number;
  loadsPerUpdate?: number;
}

export interface StreamStats {
  centerCx: number;
  centerCz: number;
  loaded: number;
  pending: number;
  loadedLastUpdate: number;
  unloadedLastUpdate: number;
  loadedTotal: number;
  unloadedTotal: number;
}

const NEIGHBORS: readonly (readonly [number, number])[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1]
];

export function spiralOffsets(radius: number): [number, number][] {
  const offsets: [number, number][] = [[0, 0]];
  for (let ring = 1; ring <= radius; ring++) {
    for (let dx = -ring; dx <= ring; dx++) offsets.push([dx, -ring]);
    for (let dz = -ring + 1; dz <= ring; dz++) offsets.push([ring, dz]);
    for (let dx = ring - 1; dx >= -ring; dx--) offsets.push([dx, ring]);
    for (let dz = ring - 1; dz > -ring; dz--) offsets.push([-ring, dz]);
  }
  return offsets;
}

export function chunkCoord(worldCoord: number, size: number): number {
  return Math.floor(worldCoord / size);
}

export class ChunkStreamer {
  readonly renderDistance: number;
  readonly unloadMargin: number;
  readonly loadsPerUpdate: number;
  private readonly offsets: [number, number][];
  private readonly counters: StreamStats = {
    centerCx: 0,
    centerCz: 0,
    loaded: 0,
    pending: 0,
    loadedLastUpdate: 0,
    unloadedLastUpdate: 0,
    loadedTotal: 0,
    unloadedTotal: 0
  };

  constructor(
    private readonly world: StreamWorld,
    private readonly renderer: StreamRenderer,
    options: ChunkStreamerOptions = {}
  ) {
    this.renderDistance = Math.max(0, Math.floor(options.renderDistance ?? DEFAULT_RENDER_DISTANCE));
    this.unloadMargin = Math.max(0, Math.floor(options.unloadMargin ?? CHUNK_UNLOAD_MARGIN));
    this.loadsPerUpdate = Math.max(1, Math.floor(options.loadsPerUpdate ?? 2));
    this.offsets = spiralOffsets(this.renderDistance);
  }

  get stats(): Readonly<StreamStats> {
    return this.counters;
  }

  update(px: number, pz: number): Readonly<StreamStats> {
    const cx = chunkCoord(px, CHUNK_SX);
    const cz = chunkCoord(pz, CHUNK_SZ);
    this.counters.centerCx = cx;
    this.counters.centerCz = cz;
    this.counters.unloadedLastUpdate = this.unloadFar(cx, cz);
    this.counters.loadedLastUpdate = this.loadNear(cx, cz);
    this.counters.loaded = this.countLoaded();
    this.counters.pending = this.countPending(cx, cz);
    return this.counters;
  }

  loadAllNow(px: number, pz: number): number {
    const cx = chunkCoord(px, CHUNK_SX);
    const cz = chunkCoord(pz, CHUNK_SZ);
    let loads = 0;
    for (const [dx, dz] of this.offsets) {
      if (this.load(cx + dx, cz + dz)) loads++;
    }
    this.counters.loaded = this.countLoaded();
    this.counters.pending = 0;
    return loads;
  }

  private loadNear(cx: number, cz: number): number {
    let loads = 0;
    for (const [dx, dz] of this.offsets) {
      if (loads >= this.loadsPerUpdate) break;
      if (this.load(cx + dx, cz + dz)) loads++;
    }
    return loads;
  }

  private load(cx: number, cz: number): boolean {
    if (this.world.isChunkLoaded(cx, cz)) return false;
    this.world.ensureChunk(cx, cz);
    this.renderer.markDirty(cx, cz);
    for (const [nx, nz] of NEIGHBORS) {
      if (this.world.isChunkLoaded(cx + nx, cz + nz)) this.renderer.markDirty(cx + nx, cz + nz);
    }
    this.counters.loadedTotal++;
    return true;
  }

  private unloadFar(cx: number, cz: number): number {
    const limit = this.renderDistance + this.unloadMargin;
    const far: [number, number][] = [];
    for (const chunk of this.world.chunks.values()) {
      if (Math.max(Math.abs(chunk.cx - cx), Math.abs(chunk.cz - cz)) > limit) far.push([chunk.cx, chunk.cz]);
    }
    for (const [fx, fz] of far) {
      this.world.unloadChunk(fx, fz);
      this.renderer.dispose(fx, fz);
      for (const [nx, nz] of NEIGHBORS) {
        if (this.world.isChunkLoaded(fx + nx, fz + nz)) this.renderer.markDirty(fx + nx, fz + nz);
      }
    }
    this.counters.unloadedTotal += far.length;
    return far.length;
  }

  private countLoaded(): number {
    return this.world.chunks.size;
  }

  private countPending(cx: number, cz: number): number {
    let pending = 0;
    for (const [dx, dz] of this.offsets) {
      if (!this.world.isChunkLoaded(cx + dx, cz + dz)) pending++;
    }
    return pending;
  }
}
