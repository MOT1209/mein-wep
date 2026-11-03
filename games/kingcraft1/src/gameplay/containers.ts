import type { ItemStack } from "../content/items";
import { createFurnace, type FurnaceState } from "./furnace";

export const CHEST_SLOTS = 27;

export interface ChestState {
  kind: "chest";
  slots: (ItemStack | null)[];
}

export type ContainerState = ChestState | FurnaceState;
export type ContainerKind = ContainerState["kind"];

export interface ContainerSaveEntry {
  key: string;
  state: ContainerState;
}

function cleanStack(raw: unknown): ItemStack | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as { item?: unknown; count?: unknown; durability?: unknown };
  if (typeof value.item !== "string" || typeof value.count !== "number" || value.count <= 0) return null;
  const stack: ItemStack = { item: value.item, count: Math.floor(value.count) };
  if (typeof value.durability === "number") stack.durability = value.durability;
  return stack;
}

function cleanSlots(raw: unknown, size: number): (ItemStack | null)[] {
  const list = Array.isArray(raw) ? raw : [];
  const out: (ItemStack | null)[] = [];
  for (let i = 0; i < size; i++) out.push(cleanStack(list[i]));
  return out;
}

function finite(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

export function containerKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

export function createContainer(kind: ContainerKind): ContainerState {
  if (kind === "furnace") return createFurnace();
  return { kind: "chest", slots: new Array<ItemStack | null>(CHEST_SLOTS).fill(null) };
}

export class ContainerStore {
  private readonly states = new Map<string, ContainerState>();

  get size(): number {
    return this.states.size;
  }

  get(x: number, y: number, z: number): ContainerState | undefined {
    return this.states.get(containerKey(x, y, z));
  }

  open(kind: ContainerKind, x: number, y: number, z: number): ContainerState {
    const key = containerKey(x, y, z);
    const existing = this.states.get(key);
    if (existing && existing.kind === kind) return existing;
    const created = createContainer(kind);
    this.states.set(key, created);
    return created;
  }

  remove(x: number, y: number, z: number): ItemStack[] {
    const key = containerKey(x, y, z);
    const state = this.states.get(key);
    if (!state) return [];
    this.states.delete(key);
    return state.slots.filter((slot): slot is ItemStack => slot !== null);
  }

  *furnaces(): IterableIterator<[number, number, number, FurnaceState]> {
    for (const [key, state] of this.states) {
      if (state.kind !== "furnace") continue;
      const [x, y, z] = key.split(",").map(Number);
      yield [x, y, z, state];
    }
  }

  toJSON(): ContainerSaveEntry[] {
    return [...this.states.entries()]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, state]) => ({ key, state: JSON.parse(JSON.stringify(state)) as ContainerState }));
  }

  static fromJSON(entries: unknown): ContainerStore {
    const store = new ContainerStore();
    if (!Array.isArray(entries)) return store;
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") continue;
      const { key, state } = entry as { key?: unknown; state?: unknown };
      if (typeof key !== "string" || !/^-?\d+,-?\d+,-?\d+$/.test(key) || !state || typeof state !== "object") continue;
      const raw = state as Record<string, unknown>;
      if (raw.kind === "chest") {
        store.states.set(key, { kind: "chest", slots: cleanSlots(raw.slots, CHEST_SLOTS) });
      } else if (raw.kind === "furnace") {
        store.states.set(key, {
          kind: "furnace",
          slots: cleanSlots(raw.slots, 3),
          burnLeft: finite(raw.burnLeft),
          burnTotal: finite(raw.burnTotal),
          progress: finite(raw.progress)
        });
      }
    }
    return store;
  }
}
