import { blockById } from "../content/blocks";
import { toolStats } from "../content/items";

export const HAND_SECONDS_PER_HARDNESS = 1.5;
export const WRONG_TOOL_SECONDS_PER_HARDNESS = 5;

export interface MiningWorld {
  getBlock(x: number, y: number, z: number): number;
  setBlock(x: number, y: number, z: number, id: number): boolean;
}

export interface MiningTarget {
  x: number;
  y: number;
  z: number;
  id: number;
}

export type MiningEvent =
  | { kind: "broken"; x: number; y: number; z: number; id: number; harvest: boolean; wear: number }
  | { kind: "blocked"; x: number; y: number; z: number; id: number };

export type MineVerdict = "fast" | "slow" | "blocked" | "unbreakable";

export function mineVerdict(blockId: number, heldItem: string | null): MineVerdict {
  const def = blockById(blockId);
  if (def.hardness < 0) return "unbreakable";
  const tool = heldItem ? toolStats(heldItem) : undefined;
  const rightKind = !!tool && def.tool !== null && tool.kind === def.tool;
  if (rightKind && tool.tier < def.tier) return "blocked";
  if (rightKind) return "fast";
  return "slow";
}

export function canHarvest(blockId: number, heldItem: string | null): boolean {
  const def = blockById(blockId);
  if (def.tier <= 0) return true;
  return mineVerdict(blockId, heldItem) === "fast";
}

export function breakTime(blockId: number, heldItem: string | null): number {
  const def = blockById(blockId);
  const verdict = mineVerdict(blockId, heldItem);
  if (verdict === "unbreakable" || verdict === "blocked") return Number.POSITIVE_INFINITY;
  if (def.hardness === 0) return 0;
  if (verdict === "fast") {
    const efficiency = toolStats(heldItem ?? "")?.efficiency ?? 1;
    return (def.hardness * HAND_SECONDS_PER_HARDNESS) / efficiency;
  }
  const perHardness = canHarvest(blockId, heldItem) ? HAND_SECONDS_PER_HARDNESS : WRONG_TOOL_SECONDS_PER_HARDNESS;
  return def.hardness * perHardness;
}

export function toolWear(blockId: number, heldItem: string | null): number {
  if (!heldItem || !toolStats(heldItem)) return 0;
  return blockById(blockId).hardness > 0 ? 1 : 0;
}

export class MiningState {
  target: MiningTarget | null = null;
  progress = 0;
  blocked = false;

  reset(): void {
    this.target = null;
    this.progress = 0;
    this.blocked = false;
  }

  tick(
    world: MiningWorld,
    hit: MiningTarget | null,
    heldItem: string | null,
    dt: number,
    creative: boolean
  ): MiningEvent | null {
    if (!hit) {
      this.reset();
      return null;
    }
    const id = world.getBlock(hit.x, hit.y, hit.z);
    const sameTarget =
      this.target !== null &&
      this.target.x === hit.x &&
      this.target.y === hit.y &&
      this.target.z === hit.z &&
      this.target.id === id;
    if (!sameTarget) {
      this.target = { x: hit.x, y: hit.y, z: hit.z, id };
      this.progress = 0;
      this.blocked = false;
    }

    const time = creative && blockById(id).hardness >= 0 ? 0 : breakTime(id, heldItem);
    if (!Number.isFinite(time)) {
      const first = !this.blocked;
      this.blocked = true;
      return first ? { kind: "blocked", x: hit.x, y: hit.y, z: hit.z, id } : null;
    }
    this.progress = time <= 0 ? 1 : this.progress + dt / time;
    if (this.progress < 1) return null;

    world.setBlock(hit.x, hit.y, hit.z, 0);
    this.reset();
    return {
      kind: "broken",
      x: hit.x,
      y: hit.y,
      z: hit.z,
      id,
      harvest: !creative && canHarvest(id, heldItem),
      wear: creative ? 0 : toolWear(id, heldItem)
    };
  }
}
