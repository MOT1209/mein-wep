import { CHUNK_SY, PLAYER_HEIGHT, PLAYER_WIDTH } from "../config";
import { B, CROP_BLOCKS, REPLACEABLE_ON_PLACE, blockById, isSolidBlock } from "../content/blocks";
import { blockIdOfItem, isBlockItem, toolStats, type ItemStack } from "../content/items";
import { FACE_NX, FACE_NY, FACE_NZ, FACE_PX, FACE_PY, FACE_PZ } from "../voxels/mesher";

export interface PlaceWorld {
  getBlock(x: number, y: number, z: number): number;
  setBlock(x: number, y: number, z: number, id: number): boolean;
}

export interface PlaceHit {
  x: number;
  y: number;
  z: number;
  id: number;
  face: number;
}

export interface PlayerBox {
  x: number;
  y: number;
  z: number;
}

export interface Cell {
  x: number;
  y: number;
  z: number;
}

export type PlaceFailure = "not-placeable" | "occupied" | "no-support" | "wrong-soil" | "player" | "out-of-world";

export type PlaceResult =
  | { ok: true; x: number; y: number; z: number; blockId: number; give: ItemStack | null }
  | { ok: false; reason: PlaceFailure };

export type UseResult =
  | { ok: true; x: number; y: number; z: number; consume: boolean; give: ItemStack | null; wear: number }
  | { ok: false };

export const FACE_OFFSETS: Readonly<Record<number, readonly [number, number, number]>> = {
  [FACE_PX]: [1, 0, 0],
  [FACE_NX]: [-1, 0, 0],
  [FACE_PY]: [0, 1, 0],
  [FACE_NY]: [0, -1, 0],
  [FACE_PZ]: [0, 0, 1],
  [FACE_NZ]: [0, 0, -1]
};

const SOIL_ALIASES: Readonly<Record<string, string>> = { farmland_wet: "farmland" };

export function placedBlockFor(item: string): number {
  if (item === "seeds") return B.WHEAT_0;
  if (item === "water_bucket") return B.WATER;
  if (!isBlockItem(item)) return -1;
  return blockIdOfItem(item);
}

export function isReplaceable(id: number): boolean {
  return REPLACEABLE_ON_PLACE.has(id);
}

export function placementCell(hit: PlaceHit): Cell {
  if (hit.id !== B.AIR && isReplaceable(hit.id)) return { x: hit.x, y: hit.y, z: hit.z };
  const [dx, dy, dz] = FACE_OFFSETS[hit.face] ?? [0, 1, 0];
  return { x: hit.x + dx, y: hit.y + dy, z: hit.z + dz };
}

export function overlapsPlayer(cell: Cell, player: PlayerBox): boolean {
  const hw = PLAYER_WIDTH / 2;
  return (
    cell.x < player.x + hw &&
    cell.x + 1 > player.x - hw &&
    cell.z < player.z + hw &&
    cell.z + 1 > player.z - hw &&
    cell.y < player.y + PLAYER_HEIGHT &&
    cell.y + 1 > player.y
  );
}

function soilName(id: number): string {
  const name = blockById(id).name;
  return SOIL_ALIASES[name] ?? name;
}

export function supportFailure(world: PlaceWorld, cell: Cell, blockId: number): PlaceFailure | null {
  const def = blockById(blockId);
  const below = world.getBlock(cell.x, cell.y - 1, cell.z);
  if (CROP_BLOCKS.has(blockId) && blockId !== B.DEWBERRY_EMPTY) {
    return below === B.FARMLAND || below === B.FARMLAND_WET ? null : "wrong-soil";
  }
  if (def.plantedOn) return def.plantedOn.includes(soilName(below)) ? null : "wrong-soil";
  if (def.needsSupport && !isSolidBlock(below)) return "no-support";
  return null;
}

export function tryPlace(world: PlaceWorld, hit: PlaceHit, item: string, player: PlayerBox): PlaceResult {
  const blockId = placedBlockFor(item);
  if (blockId < 0 || blockId === B.AIR) return { ok: false, reason: "not-placeable" };
  const cell = placementCell(hit);
  if (cell.y < 1 || cell.y >= CHUNK_SY) return { ok: false, reason: "out-of-world" };
  if (!isReplaceable(world.getBlock(cell.x, cell.y, cell.z))) return { ok: false, reason: "occupied" };
  const support = supportFailure(world, cell, blockId);
  if (support) return { ok: false, reason: support };
  if (isSolidBlock(blockId) && overlapsPlayer(cell, player)) return { ok: false, reason: "player" };
  world.setBlock(cell.x, cell.y, cell.z, blockId);
  const give = item === "water_bucket" ? { item: "bucket", count: 1 } : null;
  return { ok: true, x: cell.x, y: cell.y, z: cell.z, blockId, give };
}

export function tryUseItem(world: PlaceWorld, hit: PlaceHit, item: string): UseResult {
  if (toolStats(item)?.kind === "hoe") {
    const above = world.getBlock(hit.x, hit.y + 1, hit.z);
    if ((hit.id === B.GRASS || hit.id === B.DIRT) && !isSolidBlock(above)) {
      world.setBlock(hit.x, hit.y, hit.z, B.FARMLAND);
      return { ok: true, x: hit.x, y: hit.y, z: hit.z, consume: false, give: null, wear: 1 };
    }
    return { ok: false };
  }
  if (item === "bucket") {
    const cell = placementCell(hit);
    if (world.getBlock(cell.x, cell.y, cell.z) !== B.WATER) return { ok: false };
    world.setBlock(cell.x, cell.y, cell.z, B.AIR);
    return { ok: true, ...cell, consume: true, give: { item: "water_bucket", count: 1 }, wear: 0 };
  }
  return { ok: false };
}
