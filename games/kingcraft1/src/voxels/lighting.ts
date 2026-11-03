import { CHUNK_SX, CHUNK_SY, CHUNK_SZ, MAX_LIGHT_LEVEL } from "../config";
import { lightEmitOf, lightFilterOf } from "../content/blocks";
import { Chunk, localIndex } from "./chunk";

export interface LightWorld {
  getBlock(x: number, y: number, z: number): number;
  getSkyLight(x: number, y: number, z: number): number;
  setSkyLight(x: number, y: number, z: number, value: number): void;
  getBlockLight(x: number, y: number, z: number): number;
  setBlockLight(x: number, y: number, z: number, value: number): void;
  getChunkIfLoaded(cx: number, cz: number): Chunk | undefined;
}

const DIRS: number[][] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1]
];

type Getter = (x: number, y: number, z: number) => number;
type Setter = (x: number, y: number, z: number, value: number) => void;

function processDark(get: Getter, set: Setter, queue: number[], addQueue: number[]): void {
  let i = 0;
  while (i < queue.length) {
    const x = queue[i++];
    const y = queue[i++];
    const z = queue[i++];
    const value = queue[i++];
    for (const d of DIRS) {
      const nx = x + d[0];
      const ny = y + d[1];
      const nz = z + d[2];
      const nv = get(nx, ny, nz);
      if (nv === 0) continue;
      if (nv < value) {
        set(nx, ny, nz, 0);
        queue.push(nx, ny, nz, nv);
      } else {
        addQueue.push(nx, ny, nz, nv);
      }
    }
  }
  queue.length = 0;
}

function processAdd(world: LightWorld, get: Getter, set: Setter, queue: number[]): void {
  let i = 0;
  while (i < queue.length) {
    const x = queue[i++];
    const y = queue[i++];
    const z = queue[i++];
    const value = queue[i++];
    if (get(x, y, z) !== value) continue;
    if (value <= 1) continue;
    for (const d of DIRS) {
      const nx = x + d[0];
      const ny = y + d[1];
      const nz = z + d[2];
      if (ny < 0 || ny >= CHUNK_SY) continue;
      const id = world.getBlock(nx, ny, nz);
      const cost = Math.max(1, lightFilterOf(id));
      const nv = value - cost;
      if (nv <= 0) continue;
      if (get(nx, ny, nz) < nv) {
        set(nx, ny, nz, nv);
        queue.push(nx, ny, nz, nv);
      }
    }
  }
  queue.length = 0;
}

function fillSkyColumn(chunk: Chunk, x: number, z: number): void {
  let level = MAX_LIGHT_LEVEL;
  for (let y = CHUNK_SY - 1; y >= 0; y--) {
    const id = chunk.blocks[localIndex(x, y, z)];
    const filter = lightFilterOf(id);
    if (filter >= 15) level = 0;
    else level = Math.max(0, level - filter);
    chunk.skyLight[localIndex(x, y, z)] = level;
  }
  chunk.recomputeHeight(x, z);
}

function neighborColumnHeight(world: LightWorld, chunk: Chunk, wx: number, wz: number, dx: number, dz: number): number {
  const nx = wx + dx;
  const nz = wz + dz;
  const ncx = chunk.cx + dx;
  const ncz = chunk.cz + dz;
  const nchunk = world.getChunkIfLoaded(ncx, ncz);
  if (!nchunk) return CHUNK_SY - 1;
  const lx = ((nx % CHUNK_SX) + CHUNK_SX) % CHUNK_SX;
  const lz = ((nz % CHUNK_SZ) + CHUNK_SZ) % CHUNK_SZ;
  return nchunk.columnHeight(lx, lz);
}

export function initChunkLighting(world: LightWorld, chunk: Chunk): void {
  const skyAdd: number[] = [];
  const blockAdd: number[] = [];

  for (let z = 0; z < CHUNK_SZ; z++) {
    for (let x = 0; x < CHUNK_SX; x++) {
      fillSkyColumn(chunk, x, z);
    }
  }

  for (let z = 0; z < CHUNK_SZ; z++) {
    for (let x = 0; x < CHUNK_SX; x++) {
      const wx = chunk.cx * CHUNK_SX + x;
      const wz = chunk.cz * CHUNK_SZ + z;
      let band = chunk.columnHeight(x, z);
      for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nh = neighborColumnHeight(world, chunk, wx, wz, d[0], d[1]);
        if (nh > band) band = nh;
      }
      if (band >= CHUNK_SY - 1) band = CHUNK_SY - 2;
      for (let y = 1; y <= band; y++) {
        const idx = localIndex(x, y, z);
        if (chunk.skyLight[idx] > 0) {
          skyAdd.push(wx, y, wz, chunk.skyLight[idx]);
        }
      }
    }
  }

  for (let y = 0; y < CHUNK_SY; y++) {
    for (let z = 0; z < CHUNK_SZ; z++) {
      for (let x = 0; x < CHUNK_SX; x++) {
        const id = chunk.blocks[localIndex(x, y, z)];
        const emit = lightEmitOf(id);
        if (emit > 0) {
          const idx = localIndex(x, y, z);
          chunk.blockLight[idx] = emit;
          blockAdd.push(chunk.cx * CHUNK_SX + x, y, chunk.cz * CHUNK_SZ + z, emit);
        }
      }
    }
  }

  seedBorders(world, chunk, skyAdd, blockAdd);

  processAdd(world, (x, y, z) => world.getSkyLight(x, y, z), (x, y, z, v) => world.setSkyLight(x, y, z, v), skyAdd);
  processAdd(
    world,
    (x, y, z) => world.getBlockLight(x, y, z),
    (x, y, z, v) => world.setBlockLight(x, y, z, v),
    blockAdd
  );
}

function seedBorders(world: LightWorld, chunk: Chunk, skyAdd: number[], blockAdd: number[]): void {
  const pushSide = (lx: number, lz: number) => {
    const wx = chunk.cx * CHUNK_SX + lx;
    const wz = chunk.cz * CHUNK_SZ + lz;
    for (let y = 0; y < CHUNK_SY; y++) {
      const idx = localIndex(lx, y, lz);
      const s = chunk.skyLight[idx];
      if (s > 0) skyAdd.push(wx, y, wz, s);
      const b = chunk.blockLight[idx];
      if (b > 0) blockAdd.push(wx, y, wz, b);
    }
  };
  for (let i = 0; i < CHUNK_SX; i++) {
    pushSide(i, 0);
    pushSide(i, CHUNK_SZ - 1);
  }
  for (let i = 0; i < CHUNK_SZ; i++) {
    pushSide(0, i);
    pushSide(CHUNK_SX - 1, i);
  }

  const neighborSide = (ncx: number, ncz: number, pick: (i: number) => { lx: number; lz: number }) => {
    const nchunk = world.getChunkIfLoaded(ncx, ncz);
    if (!nchunk) return;
    for (let i = 0; i < CHUNK_SX; i++) {
      const { lx, lz } = pick(i);
      const wx = ncx * CHUNK_SX + lx;
      const wz = ncz * CHUNK_SZ + lz;
      for (let y = 0; y < CHUNK_SY; y++) {
        const idx = localIndex(lx, y, lz);
        const s = nchunk.skyLight[idx];
        if (s > 0) skyAdd.push(wx, y, wz, s);
        const b = nchunk.blockLight[idx];
        if (b > 0) blockAdd.push(wx, y, wz, b);
      }
    }
  };

  neighborSide(chunk.cx - 1, chunk.cz, (i) => ({ lx: CHUNK_SX - 1, lz: i }));
  neighborSide(chunk.cx + 1, chunk.cz, (i) => ({ lx: 0, lz: i }));
  neighborSide(chunk.cx, chunk.cz - 1, (i) => ({ lx: i, lz: CHUNK_SZ - 1 }));
  neighborSide(chunk.cx, chunk.cz + 1, (i) => ({ lx: i, lz: 0 }));
}

export function updateSkyColumn(world: LightWorld, x: number, z: number): void {
  const remove: number[] = [];
  const add: number[] = [];
  const prev = new Int16Array(CHUNK_SY);
  for (let y = 0; y < CHUNK_SY; y++) prev[y] = world.getSkyLight(x, y, z);

  let level = MAX_LIGHT_LEVEL;
  for (let y = CHUNK_SY - 1; y >= 0; y--) {
    const id = world.getBlock(x, y, z);
    const filter = lightFilterOf(id);
    if (filter >= 15) level = 0;
    else level = Math.max(0, level - filter);
    const old = prev[y];
    if (old !== level) {
      world.setSkyLight(x, y, z, level);
      if (level < old) remove.push(x, y, z, old);
    }
    if (old < level) add.push(x, y, z, level);
  }

  for (let y = 0; y < CHUNK_SY; y++) {
    for (const d of DIRS) {
      const nx = x + d[0];
      const ny = y + d[1];
      const nz = z + d[2];
      if (ny < 0 || ny >= CHUNK_SY) continue;
      const nv = world.getSkyLight(nx, ny, nz);
      if (nv > 0) add.push(nx, ny, nz, nv);
    }
  }

  const get = (ix: number, iy: number, iz: number) => world.getSkyLight(ix, iy, iz);
  const set = (ix: number, iy: number, iz: number, v: number) => world.setSkyLight(ix, iy, iz, v);
  processDark(get, set, remove, add);
  processAdd(world, get, set, add);
}

export function applyBlockLightChange(world: LightWorld, x: number, y: number, z: number, newEmit: number): void {
  const remove: number[] = [];
  const add: number[] = [];
  const old = world.getBlockLight(x, y, z);
  if (old > 0) {
    world.setBlockLight(x, y, z, 0);
    remove.push(x, y, z, old);
  }
  if (newEmit > 0) {
    world.setBlockLight(x, y, z, newEmit);
    add.push(x, y, z, newEmit);
  }
  for (const d of DIRS) {
    const nx = x + d[0];
    const ny = y + d[1];
    const nz = z + d[2];
    if (ny < 0 || ny >= CHUNK_SY) continue;
    const nv = world.getBlockLight(nx, ny, nz);
    if (nv > 0) add.push(nx, ny, nz, nv);
  }
  const get = (ix: number, iy: number, iz: number) => world.getBlockLight(ix, iy, iz);
  const set = (ix: number, iy: number, iz: number, v: number) => world.setBlockLight(ix, iy, iz, v);
  processDark(get, set, remove, add);
  processAdd(world, get, set, add);
}
