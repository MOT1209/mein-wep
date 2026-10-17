import { DEFAULT_STACK_SIZE, HOTBAR_SIZE, INVENTORY_SLOT_COUNT, TOOL_STACK_SIZE } from "../config";
import { itemById, maxDurability, type ItemStack } from "../content/items";

export type { ItemStack };

export interface InventorySave {
  slots: (ItemStack | null)[];
  hotbarIndex: number;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

function stackSizeFor(item: string): number {
  const def = itemById(item);
  if (!def) return DEFAULT_STACK_SIZE;
  if (def.tool) return TOOL_STACK_SIZE;
  return def.stackSize;
}

function makeStack(item: string, count: number, durability?: number): ItemStack {
  const max = maxDurability(item);
  if (max <= 0) return { item, count };
  const value = durability === undefined ? max : clamp(durability, 1, max);
  return { item, count, durability: value };
}

function copyStack(stack: ItemStack): ItemStack {
  return makeStack(stack.item, stack.count, stack.durability);
}

export class Inventory {
  slots: (ItemStack | null)[];
  hotbarIndex: number;

  constructor() {
    this.slots = new Array<ItemStack | null>(INVENTORY_SLOT_COUNT).fill(null);
    this.hotbarIndex = 0;
  }

  get selected(): ItemStack | null {
    return this.slots[this.hotbarIndex] ?? null;
  }

  get selectedIndex(): number {
    return this.hotbarIndex;
  }

  set selectedIndex(index: number) {
    this.hotbarIndex = clamp(index, 0, HOTBAR_SIZE - 1);
  }

  add(stack: ItemStack): ItemStack | null {
    if (!Number.isFinite(stack.count) || stack.count <= 0) return null;
    const size = stackSizeFor(stack.item);
    const durable = maxDurability(stack.item) > 0;
    let remaining = Math.floor(stack.count);
    if (!durable) {
      for (let i = 0; i < this.slots.length && remaining > 0; i++) {
        const slot = this.slots[i];
        if (!slot || slot.item !== stack.item) continue;
        const space = size - slot.count;
        if (space <= 0) continue;
        const moved = Math.min(space, remaining);
        this.slots[i] = { item: slot.item, count: slot.count + moved };
        remaining -= moved;
      }
    }
    for (let i = 0; i < this.slots.length && remaining > 0; i++) {
      if (this.slots[i] !== null) continue;
      const placed = Math.min(size, remaining);
      this.slots[i] = makeStack(stack.item, placed, stack.durability);
      remaining -= placed;
    }
    if (remaining <= 0) return null;
    return makeStack(stack.item, remaining, stack.durability);
  }

  removeAt(index: number, count: number): ItemStack | null {
    const slot = this.stackAt(index);
    if (!slot || !Number.isFinite(count) || count <= 0) return null;
    const taken = Math.min(Math.floor(count), slot.count);
    if (taken <= 0) return null;
    this.slots[index] = taken === slot.count ? null : makeStack(slot.item, slot.count - taken, slot.durability);
    return makeStack(slot.item, taken, slot.durability);
  }

  swap(a: number, b: number): boolean {
    if (!this.inBounds(a) || !this.inBounds(b) || a === b) return false;
    const temp = this.slots[a];
    this.slots[a] = this.slots[b];
    this.slots[b] = temp;
    return true;
  }

  split(index: number): ItemStack | null {
    const slot = this.stackAt(index);
    if (!slot || slot.count < 2) return null;
    let free = -1;
    for (let i = 0; i < this.slots.length; i++) {
      if (i !== index && this.slots[i] === null) {
        free = i;
        break;
      }
    }
    if (free < 0) return null;
    const moved = Math.floor(slot.count / 2);
    const created = makeStack(slot.item, moved, slot.durability);
    this.slots[index] = makeStack(slot.item, slot.count - moved, slot.durability);
    this.slots[free] = created;
    return created;
  }

  moveTo(from: number, to: number): boolean {
    if (!this.inBounds(from) || !this.inBounds(to) || from === to) return false;
    const source = this.slots[from];
    if (!source) return false;
    const target = this.slots[to];
    if (!target) {
      this.slots[to] = copyStack(source);
      this.slots[from] = null;
      return true;
    }
    if (target.item !== source.item) return false;
    const space = stackSizeFor(target.item) - target.count;
    if (space <= 0) return false;
    const moved = Math.min(space, source.count);
    this.slots[to] = makeStack(target.item, target.count + moved, target.durability);
    this.slots[from] = moved === source.count ? null : makeStack(source.item, source.count - moved, source.durability);
    return true;
  }

  count(item: string): number {
    let total = 0;
    for (const slot of this.slots) {
      if (slot && slot.item === item) total += slot.count;
    }
    return total;
  }

  consume(item: string, count: number): boolean {
    if (!Number.isFinite(count)) return false;
    const needed = Math.floor(count);
    if (needed <= 0) return true;
    if (this.count(item) < needed) return false;
    let remaining = needed;
    for (let i = 0; i < this.slots.length && remaining > 0; i++) {
      const slot = this.slots[i];
      if (!slot || slot.item !== item) continue;
      const taken = Math.min(slot.count, remaining);
      this.slots[i] = taken === slot.count ? null : makeStack(slot.item, slot.count - taken, slot.durability);
      remaining -= taken;
    }
    return true;
  }

  damage(index: number, amount = 1): boolean {
    const slot = this.stackAt(index);
    if (!slot || !Number.isFinite(amount) || amount <= 0) return false;
    const max = maxDurability(slot.item);
    if (max <= 0) return false;
    const next = (slot.durability ?? max) - Math.floor(amount);
    if (next <= 0) {
      this.slots[index] = null;
      return true;
    }
    this.slots[index] = { item: slot.item, count: slot.count, durability: next };
    return false;
  }

  toJSON(): InventorySave {
    return {
      slots: this.slots.map((slot) => (slot ? copyStack(slot) : null)),
      hotbarIndex: this.hotbarIndex
    };
  }

  static fromJSON(data: InventorySave): Inventory {
    const inventory = new Inventory();
    const rawSlots = Array.isArray(data?.slots) ? data.slots : [];
    for (let i = 0; i < inventory.slots.length; i++) {
      const raw = rawSlots[i];
      if (!raw || typeof raw.item !== "string" || typeof raw.count !== "number") continue;
      const count = Math.min(Math.floor(raw.count), stackSizeFor(raw.item));
      if (count <= 0) continue;
      const durability = typeof raw.durability === "number" ? raw.durability : undefined;
      inventory.slots[i] = makeStack(raw.item, count, durability);
    }
    inventory.hotbarIndex = clamp(data?.hotbarIndex ?? 0, 0, HOTBAR_SIZE - 1);
    return inventory;
  }

  private stackAt(index: number): ItemStack | null {
    if (!this.inBounds(index)) return null;
    return this.slots[index];
  }

  private inBounds(index: number): boolean {
    return Number.isInteger(index) && index >= 0 && index < this.slots.length;
  }
}
