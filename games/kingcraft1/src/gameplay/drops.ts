import {
  DROP_MAGNET_RADIUS,
  DROP_MAGNET_SPEED,
  GRAVITY,
  ITEM_DROP_DESPAWN_SECONDS,
  ITEM_PICKUP_RADIUS,
  PLAYER_HEIGHT,
  TERMINAL_VELOCITY
} from "../config";
import { blockById, isSolidBlock } from "../content/blocks";
import { itemById, itemForBlock, maxDurability, stackSizeOf, type ItemStack } from "../content/items";
import type { Rng } from "../core/rng";

export const DROP_PICKUP_DELAY_SECONDS = 0.4;
export const DROP_MERGE_RADIUS = 0.75;
export const DROP_HALF_SIZE = 0.125;

export interface ItemDrop {
  item: string;
  count: number;
  durability?: number;
  x: number;
  y: number;
  z: number;
  vy: number;
  age: number;
  pickupDelay: number;
}

export interface DropWorld {
  getBlock(x: number, y: number, z: number): number;
}

export interface Collector {
  x: number;
  y: number;
  z: number;
}

export function rollDrops(blockId: number, rng: Rng): ItemStack[] {
  const def = blockById(blockId);
  if (def.drops === "none") return [];
  if (def.drops === "self") {
    const item = itemForBlock(blockId);
    return item ? [{ item, count: 1 }] : [];
  }
  const out: ItemStack[] = [];
  for (const drop of def.drops) {
    if (drop.chance !== undefined && rng.next() >= drop.chance) continue;
    const count = rng.intRange(drop.min, drop.max);
    if (count > 0 && itemById(drop.item)) out.push({ item: drop.item, count });
  }
  return out;
}

export class DropManager {
  readonly drops: ItemDrop[] = [];

  spawn(stack: ItemStack, x: number, y: number, z: number, vy = 2.5, pickupDelay = DROP_PICKUP_DELAY_SECONDS): void {
    if (stack.count <= 0) return;
    const drop: ItemDrop = { item: stack.item, count: stack.count, x, y, z, vy, age: 0, pickupDelay };
    if (stack.durability !== undefined) drop.durability = stack.durability;
    this.drops.push(drop);
  }

  tick(world: DropWorld, dt: number, player: Collector | null, collect: (stack: ItemStack) => ItemStack | null): void {
    for (const drop of this.drops) {
      drop.age += dt;
      drop.pickupDelay = Math.max(0, drop.pickupDelay - dt);
      if (player && drop.pickupDelay <= 0 && this.attract(drop, player, dt)) continue;
      this.fall(world, drop, dt);
    }
    this.merge();
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      if (drop.age >= ITEM_DROP_DESPAWN_SECONDS) {
        this.drops.splice(i, 1);
        continue;
      }
      if (!player || drop.pickupDelay > 0) continue;
      const dx = drop.x - player.x;
      const dy = drop.y - (player.y + PLAYER_HEIGHT / 2);
      const dz = drop.z - player.z;
      if (dx * dx + dy * dy + dz * dz > ITEM_PICKUP_RADIUS * ITEM_PICKUP_RADIUS) continue;
      const stack: ItemStack = { item: drop.item, count: drop.count };
      if (drop.durability !== undefined) stack.durability = drop.durability;
      const leftover = collect(stack);
      if (!leftover) this.drops.splice(i, 1);
      else drop.count = leftover.count;
    }
  }

  clear(): void {
    this.drops.length = 0;
  }

  private attract(drop: ItemDrop, player: Collector, dt: number): boolean {
    const dx = player.x - drop.x;
    const dy = player.y + PLAYER_HEIGHT / 2 - drop.y;
    const dz = player.z - drop.z;
    const dist = Math.hypot(dx, dy, dz);
    if (dist > DROP_MAGNET_RADIUS || dist < 1e-6) return false;
    const step = Math.min(dist, DROP_MAGNET_SPEED * dt) / dist;
    drop.x += dx * step;
    drop.y += dy * step;
    drop.z += dz * step;
    drop.vy = 0;
    return true;
  }

  private fall(world: DropWorld, drop: ItemDrop, dt: number): void {
    drop.vy = Math.max(TERMINAL_VELOCITY, drop.vy + GRAVITY * dt);
    const next = drop.y + drop.vy * dt;
    const below = Math.floor(next - DROP_HALF_SIZE);
    if (drop.vy <= 0 && isSolidBlock(world.getBlock(Math.floor(drop.x), below, Math.floor(drop.z)))) {
      drop.y = below + 1 + DROP_HALF_SIZE;
      drop.vy = 0;
      return;
    }
    drop.y = next;
  }

  private merge(): void {
    for (let i = 0; i < this.drops.length; i++) {
      const a = this.drops[i];
      if (maxDurability(a.item) > 0) continue;
      for (let j = this.drops.length - 1; j > i; j--) {
        const b = this.drops[j];
        if (b.item !== a.item) continue;
        if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) > DROP_MERGE_RADIUS) continue;
        const space = stackSizeOf(a.item) - a.count;
        if (space <= 0) break;
        const moved = Math.min(space, b.count);
        a.count += moved;
        a.age = Math.min(a.age, b.age);
        b.count -= moved;
        if (b.count <= 0) this.drops.splice(j, 1);
      }
    }
  }
}
