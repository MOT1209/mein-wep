import { fuelSeconds, stackSizeOf, type ItemStack } from "../content/items";
import { smeltingFor } from "../content/recipes";

export const FURNACE_INPUT = 0;
export const FURNACE_FUEL = 1;
export const FURNACE_OUTPUT = 2;
const MAX_STEP_SECONDS = 0.5;

export interface FurnaceState {
  kind: "furnace";
  slots: (ItemStack | null)[];
  burnLeft: number;
  burnTotal: number;
  progress: number;
}

export function createFurnace(): FurnaceState {
  return { kind: "furnace", slots: [null, null, null], burnLeft: 0, burnTotal: 0, progress: 0 };
}

export function isLit(state: FurnaceState): boolean {
  return state.burnLeft > 0;
}

export function canSmelt(state: FurnaceState): boolean {
  const input = state.slots[FURNACE_INPUT];
  if (!input) return false;
  const recipe = smeltingFor(input.item);
  if (!recipe) return false;
  const output = state.slots[FURNACE_OUTPUT];
  if (!output) return true;
  return output.item === recipe.output && output.count + recipe.count <= stackSizeOf(output.item);
}

export function smeltSeconds(state: FurnaceState): number {
  const input = state.slots[FURNACE_INPUT];
  return input ? (smeltingFor(input.item)?.seconds ?? 0) : 0;
}

function take(slots: (ItemStack | null)[], index: number): void {
  const stack = slots[index];
  if (!stack) return;
  slots[index] = stack.count > 1 ? { item: stack.item, count: stack.count - 1 } : null;
}

function step(state: FurnaceState, dt: number): void {
  const smeltable = canSmelt(state);
  if (state.burnLeft <= 0 && smeltable) {
    const fuel = state.slots[FURNACE_FUEL];
    const seconds = fuel ? fuelSeconds(fuel.item) : 0;
    if (seconds > 0) {
      take(state.slots, FURNACE_FUEL);
      state.burnLeft = seconds;
      state.burnTotal = seconds;
    }
  }
  if (state.burnLeft <= 0) {
    state.progress = Math.max(0, state.progress - dt * 2);
    return;
  }
  state.burnLeft = Math.max(0, state.burnLeft - dt);
  if (!smeltable) {
    state.progress = 0;
    return;
  }
  state.progress += dt;
  const input = state.slots[FURNACE_INPUT];
  const recipe = input ? smeltingFor(input.item) : undefined;
  if (!recipe || state.progress < recipe.seconds) return;
  state.progress = 0;
  take(state.slots, FURNACE_INPUT);
  const output = state.slots[FURNACE_OUTPUT];
  state.slots[FURNACE_OUTPUT] = output
    ? { item: output.item, count: output.count + recipe.count }
    : { item: recipe.output, count: recipe.count };
}

export function furnaceTick(state: FurnaceState, dt: number): { lit: boolean; changed: boolean } {
  const before = isLit(state);
  let remaining = Math.max(0, dt);
  while (remaining > 1e-9) {
    const slice = Math.min(remaining, MAX_STEP_SECONDS);
    step(state, slice);
    remaining -= slice;
  }
  const lit = isLit(state);
  return { lit, changed: lit !== before };
}

export function furnaceAccepts(index: number, stack: ItemStack): boolean {
  if (index === FURNACE_FUEL) return fuelSeconds(stack.item) > 0;
  if (index === FURNACE_OUTPUT) return false;
  return smeltingFor(stack.item) !== undefined;
}

export function furnaceProgress(state: FurnaceState): { lit: boolean; fuel: number; smelt: number } {
  const fuel = state.burnTotal > 0 ? Math.round((state.burnLeft / state.burnTotal) * 100) : 0;
  const total = smeltSeconds(state);
  const smelt = total > 0 ? Math.round((state.progress / total) * 100) : 0;
  return { lit: isLit(state), fuel, smelt };
}
