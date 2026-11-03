import { B, blockById } from "../content/blocks";
import type { ItemStack } from "../content/items";
import type { ContainerState, ContainerStore } from "./containers";
import { supportFailure } from "./place";

export interface InteractWorld {
  getBlock(x: number, y: number, z: number): number;
  setBlock(x: number, y: number, z: number, id: number): boolean;
  readonly isNight: boolean;
  skipToMorning(): void;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export type InteractResult =
  | { kind: "door"; open: boolean }
  | { kind: "crafting" }
  | { kind: "container"; state: ContainerState; at: Position }
  | { kind: "bed"; slept: boolean; spawn: Position };

export function interact(world: InteractWorld, containers: ContainerStore, at: Position): InteractResult | null {
  const id = world.getBlock(at.x, at.y, at.z);
  const def = blockById(id);
  switch (def.interactive) {
    case "door": {
      const open = id === B.DOOR_CLOSED;
      world.setBlock(at.x, at.y, at.z, open ? B.DOOR_OPEN : B.DOOR_CLOSED);
      return { kind: "door", open };
    }
    case "crafting":
      return { kind: "crafting" };
    case "chest":
      return { kind: "container", state: containers.open("chest", at.x, at.y, at.z), at };
    case "furnace":
      return { kind: "container", state: containers.open("furnace", at.x, at.y, at.z), at };
    case "bed": {
      const spawn = { x: at.x + 0.5, y: at.y + 1, z: at.z + 0.5 };
      if (!world.isNight) return { kind: "bed", slept: false, spawn };
      world.skipToMorning();
      return { kind: "bed", slept: true, spawn };
    }
    default:
      return null;
  }
}

export interface BrokenSupport {
  x: number;
  y: number;
  z: number;
  id: number;
}

export function breakUnsupported(world: InteractWorld, x: number, y: number, z: number): BrokenSupport[] {
  const broken: BrokenSupport[] = [];
  let yy = y + 1;
  for (let guard = 0; guard < 8; guard++, yy++) {
    const id = world.getBlock(x, yy, z);
    const def = blockById(id);
    if (!def.needsSupport && !def.plantedOn) break;
    if (!supportFailure(world, { x, y: yy, z }, id)) break;
    world.setBlock(x, yy, z, B.AIR);
    broken.push({ x, y: yy, z, id });
  }
  return broken;
}

export function containerContents(containers: ContainerStore, x: number, y: number, z: number): ItemStack[] {
  return containers.remove(x, y, z);
}
