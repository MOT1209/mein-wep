import { describe, expect, it } from "vitest";
import { HOSTILE_CAP_NIGHT, MAX_ENTITIES, PASSIVE_CAP } from "../src/config";
import { B } from "../src/content/blocks";
import { creatureById } from "../src/content/creatures";
import { Rng } from "../src/core/rng";
import { EntityManager } from "../src/entities/manager";
import {
  SPAWN_RING_MAX,
  SPAWN_RING_MIN,
  canSpawnAt,
  effectiveLight,
  shouldDespawn,
  spawnAttempt,
  type SpawnWorld
} from "../src/entities/spawning";
import { BIOME } from "../src/voxels/biomes";

class FlatSpawnWorld implements SpawnWorld {
  sky = 15;
  block = 0;
  biome: number = BIOME.PLAINS;
  loaded = true;
  getBlock(_x: number, y: number): number {
    return y <= 40 ? B.GRASS : B.AIR;
  }
  getSkyLight(): number {
    return this.sky;
  }
  getBlockLight(): number {
    return this.block;
  }
  getBiome(): number {
    return this.biome;
  }
  highestSolidY(): number {
    return 40;
  }
  isBlockLoaded(): boolean {
    return this.loaded;
  }
}

const PLAYER = { x: 0, y: 41, z: 0 };
const EMPTY = { passive: 0, hostile: 0, total: 0 };

function attempts(world: SpawnWorld, isNight: boolean, counts = EMPTY, seed = 1, n = 400) {
  const rng = new Rng(seed);
  const out = [];
  for (let i = 0; i < n; i++) {
    const candidate = spawnAttempt(world, PLAYER, isNight, counts, rng);
    if (candidate) out.push(candidate);
  }
  return out;
}

describe("spawn rules", () => {
  it("spawns only within the 24-48 block ring around the player", () => {
    const spawned = attempts(new FlatSpawnWorld(), false);
    expect(spawned.length).toBeGreaterThan(0);
    for (const c of spawned) {
      const d = Math.hypot(c.x - PLAYER.x, c.z - PLAYER.z);
      expect(d).toBeGreaterThanOrEqual(SPAWN_RING_MIN - 1);
      expect(d).toBeLessThanOrEqual(SPAWN_RING_MAX + 1);
      expect(c.y).toBe(41);
    }
  });

  it("spawns passives by day on lit grass and no hostiles there", () => {
    const spawned = attempts(new FlatSpawnWorld(), false);
    expect(spawned.every((c) => c.def.category !== "hostile")).toBe(true);
    expect(spawned.some((c) => c.def.category === "passive")).toBe(true);
  });

  it("spawns hostiles at night and no passives", () => {
    const spawned = attempts(new FlatSpawnWorld(), true);
    expect(spawned.some((c) => c.def.category === "hostile")).toBe(true);
    expect(spawned.every((c) => c.def.category !== "passive")).toBe(true);
  });

  it("respects light limits: a torch-lit area blocks hostiles", () => {
    const world = new FlatSpawnWorld();
    world.block = 14;
    expect(attempts(world, true).filter((c) => c.def.category === "hostile")).toHaveLength(0);
    expect(effectiveLight(world, 0, 41, 0, true)).toBe(14);
  });

  it("respects biome lists", () => {
    const world = new FlatSpawnWorld();
    world.biome = BIOME.DESERT;
    expect(canSpawnAt(world, creatureById("woolback"), 30, 41, 0, false)).toBe(false);
    world.biome = BIOME.PLAINS;
    expect(canSpawnAt(world, creatureById("woolback"), 30, 41, 0, false)).toBe(true);
  });

  it("respects caps per category and the global entity cap", () => {
    const world = new FlatSpawnWorld();
    expect(attempts(world, false, { passive: PASSIVE_CAP, hostile: 0, total: PASSIVE_CAP })).toHaveLength(0);
    expect(attempts(world, true, { passive: 0, hostile: HOSTILE_CAP_NIGHT, total: HOSTILE_CAP_NIGHT })).toHaveLength(0);
    expect(attempts(world, false, { passive: 0, hostile: 0, total: MAX_ENTITIES })).toHaveLength(0);
  });

  it("never spawns into unloaded chunks", () => {
    const world = new FlatSpawnWorld();
    world.loaded = false;
    expect(attempts(world, true)).toHaveLength(0);
  });

  it("is deterministic for a seed", () => {
    const a = attempts(new FlatSpawnWorld(), true, EMPTY, 9).map((c) => `${c.def.id}@${c.x},${c.z}`);
    const b = attempts(new FlatSpawnWorld(), true, EMPTY, 9).map((c) => `${c.def.id}@${c.x},${c.z}`);
    expect(a).toEqual(b);
  });
});

describe("despawn rules", () => {
  it("despawns far entities and daytime hostiles that are not close", () => {
    const manager = new EntityManager(new Rng(1));
    const far = manager.create(creatureById("woolback"), 100, 41, 0);
    const near = manager.create(creatureById("woolback"), 10, 41, 0);
    const hostileNear = manager.create(creatureById("shadewisp"), 10, 41, 0);
    const hostileMid = manager.create(creatureById("shadewisp"), 30, 41, 0);
    expect(shouldDespawn(far, PLAYER, false)).toBe(true);
    expect(shouldDespawn(near, PLAYER, false)).toBe(false);
    expect(shouldDespawn(hostileNear, PLAYER, false)).toBe(false);
    expect(shouldDespawn(hostileMid, PLAYER, false)).toBe(true);
    expect(shouldDespawn(hostileMid, PLAYER, true)).toBe(false);
  });
});
