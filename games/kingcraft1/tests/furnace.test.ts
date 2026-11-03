import { describe, expect, it } from "vitest";
import { B } from "../src/content/blocks";
import { ContainerStore } from "../src/gameplay/containers";
import {
  FURNACE_FUEL,
  FURNACE_INPUT,
  FURNACE_OUTPUT,
  createFurnace,
  furnaceAccepts,
  furnaceTick,
  isLit
} from "../src/gameplay/furnace";
import { breakUnsupported, interact, type InteractWorld } from "../src/gameplay/interactive";
import { MapWorld } from "./helpers/mapWorld";

class TimedWorld extends MapWorld implements InteractWorld {
  isNight = false;
  mornings = 0;

  skipToMorning(): void {
    this.mornings++;
    this.isNight = false;
  }
}

describe("furnace", () => {
  it("lights from fuel, smelts one item per recipe time and goes out", () => {
    const furnace = createFurnace();
    furnace.slots[FURNACE_INPUT] = { item: "raw_ferrite", count: 2 };
    furnace.slots[FURNACE_FUEL] = { item: "stick", count: 1 };
    const first = furnaceTick(furnace, 0.1);
    expect(first).toEqual({ lit: true, changed: true });
    expect(furnace.slots[FURNACE_FUEL]).toBeNull();
    furnaceTick(furnace, 4.8);
    expect(furnace.slots[FURNACE_OUTPUT]).toBeNull();
    const out = furnaceTick(furnace, 1);
    expect(out).toEqual({ lit: false, changed: true });
    expect(furnace.slots[FURNACE_OUTPUT]).toBeNull();
    expect(furnace.progress).toBeLessThan(5);
  });

  it("produces output with enough fuel and keeps leftovers", () => {
    const furnace = createFurnace();
    furnace.slots[FURNACE_INPUT] = { item: "raw_ferrite", count: 2 };
    furnace.slots[FURNACE_FUEL] = { item: "coal", count: 1 };
    furnaceTick(furnace, 10.05);
    expect(furnace.slots[FURNACE_OUTPUT]).toEqual({ item: "ferrite_ingot", count: 1 });
    expect(furnace.slots[FURNACE_INPUT]).toEqual({ item: "raw_ferrite", count: 1 });
    furnaceTick(furnace, 10.05);
    expect(furnace.slots[FURNACE_OUTPUT]).toEqual({ item: "ferrite_ingot", count: 2 });
    expect(furnace.slots[FURNACE_INPUT]).toBeNull();
    expect(isLit(furnace)).toBe(true);
  });

  it("does not burn fuel without something to smelt", () => {
    const furnace = createFurnace();
    furnace.slots[FURNACE_INPUT] = { item: "dirt", count: 1 };
    furnace.slots[FURNACE_FUEL] = { item: "coal", count: 3 };
    expect(furnaceTick(furnace, 5).lit).toBe(false);
    expect(furnace.slots[FURNACE_FUEL]?.count).toBe(3);
  });

  it("stops when the output slot holds a different item", () => {
    const furnace = createFurnace();
    furnace.slots[FURNACE_INPUT] = { item: "sand", count: 1 };
    furnace.slots[FURNACE_FUEL] = { item: "coal", count: 1 };
    furnace.slots[FURNACE_OUTPUT] = { item: "stone", count: 1 };
    furnaceTick(furnace, 20);
    expect(furnace.slots[FURNACE_INPUT]).toEqual({ item: "sand", count: 1 });
    expect(furnace.slots[FURNACE_FUEL]?.count).toBe(1);
  });

  it("only accepts fuel in the fuel slot and nothing in the output slot", () => {
    expect(furnaceAccepts(FURNACE_FUEL, { item: "coal", count: 1 })).toBe(true);
    expect(furnaceAccepts(FURNACE_FUEL, { item: "dirt", count: 1 })).toBe(false);
    expect(furnaceAccepts(FURNACE_OUTPUT, { item: "coal", count: 1 })).toBe(false);
    expect(furnaceAccepts(FURNACE_INPUT, { item: "sand", count: 1 })).toBe(true);
    expect(furnaceAccepts(FURNACE_INPUT, { item: "dirt", count: 1 })).toBe(false);
  });
});

describe("containers", () => {
  it("round-trips chests and furnaces through JSON", () => {
    const store = new ContainerStore();
    const chest = store.open("chest", 1, 2, 3);
    chest.slots[0] = { item: "dirt", count: 12 };
    chest.slots[26] = { item: "wood_pickaxe", count: 1, durability: 30 };
    const furnace = store.open("furnace", -4, 10, 7);
    furnace.slots[FURNACE_INPUT] = { item: "sand", count: 3 };
    if (furnace.kind === "furnace") {
      furnace.burnLeft = 12;
      furnace.burnTotal = 80;
      furnace.progress = 4;
    }
    const json = JSON.parse(JSON.stringify(store.toJSON()));
    const restored = ContainerStore.fromJSON(json);
    expect(restored.toJSON()).toEqual(store.toJSON());
    expect(restored.get(1, 2, 3)?.slots[26]).toEqual({ item: "wood_pickaxe", count: 1, durability: 30 });
  });

  it("ignores malformed save entries", () => {
    const restored = ContainerStore.fromJSON([
      { key: "bad", state: { kind: "chest", slots: [] } },
      { key: "1,1,1", state: { kind: "oven" } },
      { key: "2,2,2", state: { kind: "chest", slots: [{ item: 5, count: 1 }, { item: "dirt", count: -1 }] } }
    ]);
    expect(restored.size).toBe(1);
    expect(restored.get(2, 2, 2)?.slots.every((s) => s === null)).toBe(true);
  });

  it("returns contents when a container is removed", () => {
    const store = new ContainerStore();
    store.open("chest", 0, 1, 0).slots[3] = { item: "coal", count: 5 };
    expect(store.remove(0, 1, 0)).toEqual([{ item: "coal", count: 5 }]);
    expect(store.get(0, 1, 0)).toBeUndefined();
  });
});

describe("interaction", () => {
  it("toggles doors", () => {
    const world = new TimedWorld(0);
    world.setBlock(0, 1, 0, B.DOOR_CLOSED);
    expect(interact(world, new ContainerStore(), { x: 0, y: 1, z: 0 })).toEqual({ kind: "door", open: true });
    expect(world.getBlock(0, 1, 0)).toBe(B.DOOR_OPEN);
    interact(world, new ContainerStore(), { x: 0, y: 1, z: 0 });
    expect(world.getBlock(0, 1, 0)).toBe(B.DOOR_CLOSED);
  });

  it("refuses to sleep by day and skips the night otherwise", () => {
    const world = new TimedWorld(0);
    world.setBlock(2, 1, 2, B.BED);
    expect(interact(world, new ContainerStore(), { x: 2, y: 1, z: 2 })).toMatchObject({ kind: "bed", slept: false });
    expect(world.mornings).toBe(0);
    world.isNight = true;
    expect(interact(world, new ContainerStore(), { x: 2, y: 1, z: 2 })).toMatchObject({
      kind: "bed",
      slept: true,
      spawn: { x: 2.5, y: 2, z: 2.5 }
    });
    expect(world.mornings).toBe(1);
  });

  it("opens the matching container and the crafting table", () => {
    const world = new TimedWorld(0);
    const store = new ContainerStore();
    world.setBlock(0, 1, 0, B.CHEST);
    world.setBlock(1, 1, 0, B.FURNACE_LIT);
    world.setBlock(2, 1, 0, B.CRAFTING_TABLE);
    expect(interact(world, store, { x: 0, y: 1, z: 0 })).toMatchObject({ kind: "container", state: { kind: "chest" } });
    expect(interact(world, store, { x: 1, y: 1, z: 0 })).toMatchObject({ kind: "container", state: { kind: "furnace" } });
    expect(interact(world, store, { x: 2, y: 1, z: 0 })).toEqual({ kind: "crafting" });
    expect(interact(world, store, { x: 3, y: 0, z: 0 })).toBeNull();
  });

  it("breaks torches and crops that lose their support", () => {
    const world = new TimedWorld(0);
    world.setBlock(0, 1, 0, B.TORCH);
    world.setBlock(0, 0, 0, B.AIR);
    expect(breakUnsupported(world, 0, 0, 0)).toEqual([{ x: 0, y: 1, z: 0, id: B.TORCH }]);
    world.setBlock(1, 0, 0, B.DIRT);
    world.setBlock(1, 1, 0, B.WHEAT_2);
    expect(breakUnsupported(world, 1, 0, 0)).toEqual([{ x: 1, y: 1, z: 0, id: B.WHEAT_2 }]);
    world.setBlock(2, 1, 0, B.STONE);
    expect(breakUnsupported(world, 2, 0, 0)).toEqual([]);
  });
});
