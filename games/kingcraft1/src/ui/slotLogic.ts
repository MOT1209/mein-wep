import { HOTBAR_SIZE } from "../config";
import { stackSizeOf, toolStats, type ItemStack } from "../content/items";
import { craft, matchRecipe } from "../gameplay/crafting";

export type MouseButtonKind = "left" | "right";

export interface SlotPair {
  slot: ItemStack | null;
  cursor: ItemStack | null;
}

export interface GridLayout {
  left: number;
  top: number;
  columns: number;
  rows: number;
  size: number;
  gap: number;
}

export function maxStack(item: string): number {
  return toolStats(item) ? 1 : Math.max(1, stackSizeOf(item));
}

function copy(stack: ItemStack | null, count?: number): ItemStack | null {
  if (!stack) return null;
  const next = count ?? stack.count;
  if (next <= 0) return null;
  const out: ItemStack = { item: stack.item, count: next };
  if (stack.durability !== undefined) out.durability = stack.durability;
  return out;
}

export function canMerge(a: ItemStack, b: ItemStack): boolean {
  return a.item === b.item && a.durability === b.durability && maxStack(a.item) > 1;
}

export function screenToSlot(x: number, y: number, layout: GridLayout): number {
  const stride = layout.size + layout.gap;
  const lx = x - layout.left;
  const ly = y - layout.top;
  if (lx < 0 || ly < 0) return -1;
  const col = Math.floor(lx / stride);
  const row = Math.floor(ly / stride);
  if (col >= layout.columns || row >= layout.rows) return -1;
  if (lx - col * stride >= layout.size || ly - row * stride >= layout.size) return -1;
  return row * layout.columns + col;
}

export function clickSlot(slot: ItemStack | null, cursor: ItemStack | null, button: MouseButtonKind): SlotPair {
  if (button === "left") {
    if (!cursor) return { slot: null, cursor: copy(slot) };
    if (!slot) return { slot: copy(cursor), cursor: null };
    if (canMerge(slot, cursor)) {
      const space = maxStack(slot.item) - slot.count;
      const moved = Math.min(space, cursor.count);
      return { slot: copy(slot, slot.count + moved), cursor: copy(cursor, cursor.count - moved) };
    }
    return { slot: copy(cursor), cursor: copy(slot) };
  }
  if (!cursor) {
    if (!slot) return { slot: null, cursor: null };
    const taken = Math.ceil(slot.count / 2);
    return { slot: copy(slot, slot.count - taken), cursor: copy(slot, taken) };
  }
  if (!slot) return { slot: copy(cursor, 1), cursor: copy(cursor, cursor.count - 1) };
  if (canMerge(slot, cursor) && slot.count < maxStack(slot.item)) {
    return { slot: copy(slot, slot.count + 1), cursor: copy(cursor, cursor.count - 1) };
  }
  return { slot: copy(slot), cursor: copy(cursor) };
}

export function insertInto(slots: (ItemStack | null)[], stack: ItemStack, from: number, to: number): ItemStack | null {
  let left: ItemStack | null = copy(stack);
  for (let i = from; i < to && left; i++) {
    const slot = slots[i];
    if (slot && canMerge(slot, left)) {
      const moved = Math.min(maxStack(slot.item) - slot.count, left.count);
      if (moved <= 0) continue;
      slots[i] = copy(slot, slot.count + moved);
      left = copy(left, left.count - moved);
    }
  }
  for (let i = from; i < to && left; i++) {
    if (slots[i]) continue;
    const placed = Math.min(maxStack(left.item), left.count);
    slots[i] = copy(left, placed);
    left = copy(left, left.count - placed);
  }
  return left;
}

export function quickMove(slots: (ItemStack | null)[], index: number): boolean {
  const stack = slots[index];
  if (!stack) return false;
  const inHotbar = index < HOTBAR_SIZE;
  const leftover = inHotbar ? insertInto(slots, stack, HOTBAR_SIZE, slots.length) : insertInto(slots, stack, 0, HOTBAR_SIZE);
  if (leftover && leftover.count === stack.count) return false;
  slots[index] = leftover;
  return true;
}

export function craftPreview(grid: (ItemStack | null)[], size: 2 | 3): ItemStack | null {
  const recipe = matchRecipe(grid, size);
  if (!recipe) return null;
  if (recipe.station === "table" && size === 2) return null;
  return { item: recipe.result.item, count: recipe.result.count };
}

export function takeCraft(
  grid: (ItemStack | null)[],
  size: 2 | 3,
  cursor: ItemStack | null
): { grid: (ItemStack | null)[]; cursor: ItemStack | null } | null {
  const preview = craftPreview(grid, size);
  if (!preview) return null;
  if (cursor && (!canMerge(cursor, preview) || cursor.count + preview.count > maxStack(cursor.item))) return null;
  const result = craft(grid, size, false);
  const made = result.output[0];
  if (!made) return null;
  const next = cursor ? copy(cursor, cursor.count + made.count) : copy(made);
  return { grid: result.remaining, cursor: next };
}

export function craftAllInto(
  grid: (ItemStack | null)[],
  size: 2 | 3,
  slots: (ItemStack | null)[]
): { grid: (ItemStack | null)[]; crafted: number } {
  let current = grid.map((cell) => copy(cell));
  let crafted = 0;
  for (let guard = 0; guard < 64; guard++) {
    const preview = craftPreview(current, size);
    if (!preview) break;
    const trial = slots.map((slot) => copy(slot));
    if (insertInto(trial, preview, 0, trial.length)) break;
    const result = craft(current, size, false);
    if (result.output.length === 0) break;
    for (const out of result.output) insertInto(slots, out, 0, slots.length);
    current = result.remaining;
    crafted += preview.count;
  }
  return { grid: current, crafted };
}
