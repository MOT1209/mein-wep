import { CHUNK_SY } from "../config";
import { B, blockById, isSolidBlock } from "../content/blocks";
import type { Rng } from "../core/rng";

export const FARMLAND_WATER_RADIUS = 4;
export const CROP_GROWTH_CHANCE = 0.6;
export const SAPLING_GROWTH_CHANCE = 0.25;
export const BERRY_REGROW_CHANCE = 0.3;

export interface FarmWorld {
  getBlock(x: number, y: number, z: number): number;
  setBlock(x: number, y: number, z: number, id: number): boolean;
}

interface TreeKind {
  log: number;
  leaves: number;
  shape: "round" | "cone" | "flat";
  minTrunk: number;
  maxTrunk: number;
}

const TREES: Readonly<Record<string, TreeKind>> = {
  tree_sable: { log: B.LOG, leaves: B.LEAVES, shape: "round", minTrunk: 4, maxTrunk: 5 },
  tree_pine: { log: B.LOG_PINE, leaves: B.LEAVES_PINE, shape: "cone", minTrunk: 6, maxTrunk: 8 },
  tree_dune: { log: B.LOG_DUNE, leaves: B.LEAVES_DUNE, shape: "flat", minTrunk: 3, maxTrunk: 4 }
};

export function isCrop(id: number): boolean {
  const growth = blockById(id).growth;
  return growth !== undefined && growth.crop === "wheat";
}

export function hasWaterNear(world: FarmWorld, x: number, y: number, z: number, radius = FARMLAND_WATER_RADIUS): boolean {
  for (let dy = 0; dy <= 1; dy++) {
    for (let dz = -radius; dz <= radius; dz++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (world.getBlock(x + dx, y + dy, z + dz) === B.WATER) return true;
      }
    }
  }
  return false;
}

export function updateFarmland(world: FarmWorld, x: number, y: number, z: number): number {
  const id = world.getBlock(x, y, z);
  if (id !== B.FARMLAND && id !== B.FARMLAND_WET) return id;
  if (isSolidBlock(world.getBlock(x, y + 1, z))) {
    world.setBlock(x, y, z, B.DIRT);
    return B.DIRT;
  }
  const next = hasWaterNear(world, x, y, z) ? B.FARMLAND_WET : B.FARMLAND;
  if (next !== id) world.setBlock(x, y, z, next);
  return next;
}

export function advanceCrop(world: FarmWorld, x: number, y: number, z: number, stages = 1): boolean {
  let id = world.getBlock(x, y, z);
  let grew = false;
  for (let i = 0; i < stages; i++) {
    const next = blockById(id).growth?.next;
    if (next === null || next === undefined) break;
    id = next;
    grew = true;
  }
  if (grew) world.setBlock(x, y, z, id);
  return grew;
}

export function cropTick(world: FarmWorld, x: number, y: number, z: number, rng: Rng): boolean {
  if (!isCrop(world.getBlock(x, y, z))) return false;
  if (world.getBlock(x, y - 1, z) !== B.FARMLAND_WET) return false;
  if (rng.next() >= CROP_GROWTH_CHANCE) return false;
  return advanceCrop(world, x, y, z);
}

function setIfOpen(world: FarmWorld, x: number, y: number, z: number, id: number): void {
  if (y < 1 || y >= CHUNK_SY) return;
  const current = world.getBlock(x, y, z);
  if (current === B.AIR || current === B.TALL_GRASS || blockById(current).render === "cross") world.setBlock(x, y, z, id);
}

export function growTree(world: FarmWorld, x: number, y: number, z: number, rng: Rng): boolean {
  const sapling = blockById(world.getBlock(x, y, z));
  const kind = sapling.saplingOf ? TREES[sapling.saplingOf] : undefined;
  if (!kind) return false;
  const trunk = rng.intRange(kind.minTrunk, kind.maxTrunk);
  if (y + trunk + 3 >= CHUNK_SY) return false;
  for (let i = 1; i <= trunk + 1; i++) {
    const id = world.getBlock(x, y + i, z);
    if (id !== B.AIR && blockById(id).render !== "cross") return false;
  }
  world.setBlock(x, y, z, kind.log);
  for (let i = 1; i < trunk; i++) world.setBlock(x, y + i, z, kind.log);
  const top = y + trunk;
  if (kind.shape === "round") {
    for (let dy = -2; dy <= 1; dy++) {
      const r = dy <= -1 ? 2 : 1;
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (r === 2 && Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
          setIfOpen(world, x + dx, top + dy, z + dz, kind.leaves);
        }
      }
    }
  } else if (kind.shape === "cone") {
    let r = 0;
    for (let yy = top; yy >= y + 2; yy--) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (Math.abs(dx) + Math.abs(dz) > r + 1) continue;
          setIfOpen(world, x + dx, yy, z + dz, kind.leaves);
        }
      }
      r = (r + 1) % 3;
    }
  } else {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
        setIfOpen(world, x + dx, top, z + dz, kind.leaves);
      }
    }
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) setIfOpen(world, x + dx, top + 1, z + dz, kind.leaves);
    }
  }
  setIfOpen(world, x, top + 1, z, kind.leaves);
  return true;
}

export function applyGrowthBoost(world: FarmWorld, x: number, y: number, z: number, rng: Rng): boolean {
  const id = world.getBlock(x, y, z);
  if (isCrop(id) || id === B.DEWBERRY_EMPTY) return advanceCrop(world, x, y, z, rng.intRange(1, 2));
  if (blockById(id).saplingOf) return rng.next() < 0.45 ? growTree(world, x, y, z, rng) : true;
  return false;
}

export function randomTick(world: FarmWorld, x: number, y: number, z: number, rng: Rng): void {
  const id = world.getBlock(x, y, z);
  if (id === B.FARMLAND || id === B.FARMLAND_WET) {
    updateFarmland(world, x, y, z);
    return;
  }
  if (isCrop(id)) {
    cropTick(world, x, y, z, rng);
    return;
  }
  if (id === B.DEWBERRY_EMPTY) {
    if (rng.next() < BERRY_REGROW_CHANCE) advanceCrop(world, x, y, z);
    return;
  }
  if (blockById(id).saplingOf && rng.next() < SAPLING_GROWTH_CHANCE) growTree(world, x, y, z, rng);
}
