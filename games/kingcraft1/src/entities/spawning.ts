import { CHUNK_SY, HOSTILE_CAP_NIGHT, MAX_ENTITIES, PASSIVE_CAP } from "../config";
import { isLiquid, isSolidBlock } from "../content/blocks";
import { CREATURES, type CreatureDef } from "../content/creatures";
import type { Rng } from "../core/rng";
import { BIOMES } from "../voxels/biomes";
import type { Entity, Vec3 } from "./types";

export const SPAWN_RING_MIN = 24;
export const SPAWN_RING_MAX = 48;
export const DESPAWN_DISTANCE = 72;
export const DAY_HOSTILE_DESPAWN_DISTANCE = 24;
export const NIGHT_SKY_DIMMING = 11;

export interface SpawnWorld {
  getBlock(x: number, y: number, z: number): number;
  getSkyLight(x: number, y: number, z: number): number;
  getBlockLight(x: number, y: number, z: number): number;
  getBiome(x: number, z: number): number;
  highestSolidY(x: number, z: number): number;
  isBlockLoaded(x: number, z: number): boolean;
}

export interface SpawnCounts {
  passive: number;
  hostile: number;
  total: number;
}

export interface SpawnCandidate {
  def: CreatureDef;
  x: number;
  y: number;
  z: number;
}

export function effectiveLight(world: SpawnWorld, x: number, y: number, z: number, isNight: boolean): number {
  const sky = world.getSkyLight(x, y, z);
  return Math.max(world.getBlockLight(x, y, z), isNight ? Math.max(0, sky - NIGHT_SKY_DIMMING) : sky);
}

export function countEntities(entities: readonly Entity[]): SpawnCounts {
  let passive = 0;
  let hostile = 0;
  for (const entity of entities) {
    if (entity.def.category === "hostile") hostile++;
    else passive++;
  }
  return { passive, hostile, total: entities.length };
}

function biomeName(world: SpawnWorld, x: number, z: number): string {
  return BIOMES[world.getBiome(x, z)]?.name ?? "";
}

export function hasRoom(world: SpawnWorld, def: CreatureDef, x: number, y: number, z: number): boolean {
  const height = Math.ceil(def.size.h);
  for (let dy = 0; dy < height; dy++) {
    const id = world.getBlock(x, y + dy, z);
    if (isSolidBlock(id) || isLiquid(id)) return false;
  }
  return isSolidBlock(world.getBlock(x, y - 1, z));
}

export function canSpawnAt(world: SpawnWorld, def: CreatureDef, x: number, y: number, z: number, isNight: boolean): boolean {
  if (y < def.minY || y > def.maxY) return false;
  if (!def.spawnBiome.includes("*") && !def.spawnBiome.includes(biomeName(world, x, z))) return false;
  if (!hasRoom(world, def, x, y, z)) return false;
  return effectiveLight(world, x, y, z, isNight) <= def.spawnLightMax;
}

function pickSpot(world: SpawnWorld, player: Vec3, rng: Rng, underground: boolean): Vec3 | null {
  const angle = rng.range(0, Math.PI * 2);
  const radius = rng.range(SPAWN_RING_MIN, SPAWN_RING_MAX);
  const x = Math.floor(player.x + Math.cos(angle) * radius);
  const z = Math.floor(player.z + Math.sin(angle) * radius);
  if (!world.isBlockLoaded(x, z)) return null;
  const surface = world.highestSolidY(x, z) + 1;
  if (!underground) return { x, y: surface, z };
  const top = Math.min(surface - 4, CHUNK_SY - 2);
  if (top <= 4) return null;
  for (let tries = 0; tries < 6; tries++) {
    const y = rng.intRange(4, top);
    if (!isSolidBlock(world.getBlock(x, y, z)) && isSolidBlock(world.getBlock(x, y - 1, z))) return { x, y, z };
  }
  return null;
}

export function spawnAttempt(
  world: SpawnWorld,
  player: Vec3,
  isNight: boolean,
  counts: SpawnCounts,
  rng: Rng,
  roster: readonly CreatureDef[] = CREATURES
): SpawnCandidate | null {
  if (counts.total >= MAX_ENTITIES) return null;
  const hostileRoom = counts.hostile < HOSTILE_CAP_NIGHT;
  const passiveRoom = counts.passive < PASSIVE_CAP;
  const pool = roster.filter((def) => (def.category === "hostile" ? hostileRoom : passiveRoom));
  if (pool.length === 0) return null;
  const def = pool[rng.nextInt(pool.length)];
  const underground = def.spawnUnderground && (!def.spawnSurface || rng.next() < 0.5);
  const spot = pickSpot(world, player, rng, underground);
  if (!spot) return null;
  if (def.category === "passive" && isNight) return null;
  if (!canSpawnAt(world, def, spot.x, spot.y, spot.z, isNight)) return null;
  return { def, x: spot.x + 0.5, y: spot.y, z: spot.z + 0.5 };
}

export function shouldDespawn(entity: Entity, player: Vec3, isNight: boolean): boolean {
  const distance = Math.hypot(entity.x - player.x, entity.z - player.z);
  if (distance > DESPAWN_DISTANCE) return true;
  return entity.def.category === "hostile" && !isNight && distance > DAY_HOSTILE_DESPAWN_DISTANCE;
}
