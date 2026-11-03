import { describe, expect, it } from "vitest";
import { HOTBAR_SIZE, INVENTORY_SLOT_COUNT } from "../src/config";
import { Inventory, type InventorySave, type ItemStack } from "../src/gameplay/inventory";
import { maxDurability } from "../src/content/items";

describe("Inventory", () => {
  it("starts empty with a full slot count and the hotbar at zero", () => {
    const inv = new Inventory();
    expect(inv.slots).toHaveLength(INVENTORY_SLOT_COUNT);
    expect(inv.slots.every((slot) => slot === null)).toBe(true);
    expect(inv.hotbarIndex).toBe(0);
    expect(inv.selected).toBeNull();
    expect(inv.count("cobblestone")).toBe(0);
  });

  it("clamps the selected hotbar index to the hotbar range", () => {
    const inv = new Inventory();
    inv.add({ item: "stick", count: 4 });
    expect(inv.selected).toEqual({ item: "stick", count: 4 });
    inv.selectedIndex = 3;
    expect(inv.selectedIndex).toBe(3);
    expect(inv.selected).toBeNull();
    inv.selectedIndex = 99;
    expect(inv.selectedIndex).toBe(HOTBAR_SIZE - 1);
    inv.selectedIndex = -4;
    expect(inv.selectedIndex).toBe(0);
    expect(inv.selected).toEqual({ item: "stick", count: 4 });
  });

  it("merges into partial stacks up to the stack size, then fills empty slots", () => {
    const inv = new Inventory();
    expect(inv.add({ item: "cobblestone", count: 50 })).toBeNull();
    expect(inv.add({ item: "cobblestone", count: 30 })).toBeNull();
    expect(inv.slots[0]).toEqual({ item: "cobblestone", count: 64 });
    expect(inv.slots[1]).toEqual({ item: "cobblestone", count: 16 });
    expect(inv.count("cobblestone")).toBe(80);
  });

  it("tops up an existing partial stack on partial pickup", () => {
    const inv = new Inventory();
    inv.add({ item: "stick", count: 60 });
    expect(inv.add({ item: "stick", count: 4 })).toBeNull();
    expect(inv.slots[0]).toEqual({ item: "stick", count: 64 });
    expect(inv.slots[1]).toBeNull();
    expect(inv.count("stick")).toBe(64);
  });

  it("returns leftover items when the inventory is full", () => {
    const inv = new Inventory();
    const capacity = INVENTORY_SLOT_COUNT * 64;
    expect(inv.add({ item: "cobblestone", count: capacity })).toBeNull();
    expect(inv.count("cobblestone")).toBe(capacity);
    const remainder = inv.add({ item: "cobblestone", count: 10 });
    expect(remainder).toEqual({ item: "cobblestone", count: 10 });
    expect(inv.count("cobblestone")).toBe(capacity);
    expect(inv.slots.every((slot) => slot?.count === 64)).toBe(true);
  });

  it("never mutates stacks passed to add or removeAt", () => {
    const inv = new Inventory();
    const input: ItemStack = { item: "cobblestone", count: 70 };
    inv.add(input);
    expect(input).toEqual({ item: "cobblestone", count: 70 });
    expect(inv.slots[0]).not.toBe(input);
    const removed = inv.removeAt(1, 3);
    expect(removed?.count).toBe(3);
    if (removed) removed.count = 999;
    expect(inv.slots[1]).toEqual({ item: "cobblestone", count: 3 });
  });

  it("places tools one per slot and fills in their durability", () => {
    const inv = new Inventory();
    expect(inv.add({ item: "wood_pickaxe", count: 3 })).toBeNull();
    expect(inv.slots[0]).toEqual({ item: "wood_pickaxe", count: 1, durability: maxDurability("wood_pickaxe") });
    expect(inv.slots[1]?.count).toBe(1);
    expect(inv.slots[2]?.count).toBe(1);
    expect(inv.slots[3]).toBeNull();
    expect(inv.count("wood_pickaxe")).toBe(3);
    const full = new Inventory();
    const remainder = full.add({ item: "wood_pickaxe", count: INVENTORY_SLOT_COUNT + 1 });
    expect(remainder).toEqual({ item: "wood_pickaxe", count: 1, durability: maxDurability("wood_pickaxe") });
    expect(full.count("wood_pickaxe")).toBe(INVENTORY_SLOT_COUNT);
  });

  it("splits half of a stack into the first free slot", () => {
    const inv = new Inventory();
    inv.add({ item: "stick", count: 16 });
    const created = inv.split(0);
    expect(created).toEqual({ item: "stick", count: 8 });
    expect(inv.slots[0]).toEqual({ item: "stick", count: 8 });
    expect(inv.slots[1]).toEqual({ item: "stick", count: 8 });
    expect(inv.count("stick")).toBe(16);
  });

  it("refuses to split single items or when no slot is free", () => {
    const inv = new Inventory();
    inv.add({ item: "bucket", count: 1 });
    expect(inv.split(0)).toBeNull();
    const packed = new Inventory();
    packed.slots[0] = { item: "cobblestone", count: 2 };
    for (let i = 1; i < INVENTORY_SLOT_COUNT; i++) {
      packed.slots[i] = { item: "stick", count: 1 };
    }
    expect(packed.split(0)).toBeNull();
    expect(packed.slots[0]).toEqual({ item: "cobblestone", count: 2 });
  });

  it("swaps two slots and rejects invalid indices", () => {
    const inv = new Inventory();
    inv.add({ item: "stick", count: 4 });
    inv.add({ item: "cobblestone", count: 2 });
    expect(inv.swap(0, 1)).toBe(true);
    expect(inv.slots[0]).toEqual({ item: "cobblestone", count: 2 });
    expect(inv.slots[1]).toEqual({ item: "stick", count: 4 });
    expect(inv.swap(1, 1)).toBe(false);
    expect(inv.swap(1, INVENTORY_SLOT_COUNT)).toBe(false);
    expect(inv.swap(-1, 0)).toBe(false);
    expect(inv.slots[1]).toEqual({ item: "stick", count: 4 });
  });

  it("moves stacks with merge awareness", () => {
    const inv = new Inventory();
    inv.slots[0] = { item: "stick", count: 10 };
    inv.slots[1] = { item: "stick", count: 60 };
    expect(inv.moveTo(0, 1)).toBe(true);
    expect(inv.slots[0]).toEqual({ item: "stick", count: 6 });
    expect(inv.slots[1]).toEqual({ item: "stick", count: 64 });
    expect(inv.moveTo(0, 2)).toBe(true);
    expect(inv.slots[0]).toBeNull();
    expect(inv.slots[2]).toEqual({ item: "stick", count: 6 });
    inv.slots[3] = { item: "cobblestone", count: 1 };
    expect(inv.moveTo(2, 3)).toBe(false);
    expect(inv.slots[2]).toEqual({ item: "stick", count: 6 });
    expect(inv.slots[3]).toEqual({ item: "cobblestone", count: 1 });
    expect(inv.moveTo(4, 5)).toBe(false);
  });

  it("removes from a slot and reports what was taken", () => {
    const inv = new Inventory();
    inv.add({ item: "cobblestone", count: 10 });
    expect(inv.removeAt(0, 4)).toEqual({ item: "cobblestone", count: 4 });
    expect(inv.slots[0]).toEqual({ item: "cobblestone", count: 6 });
    expect(inv.removeAt(0, 999)).toEqual({ item: "cobblestone", count: 6 });
    expect(inv.slots[0]).toBeNull();
    expect(inv.removeAt(0, 1)).toBeNull();
    expect(inv.removeAt(INVENTORY_SLOT_COUNT, 1)).toBeNull();
    expect(inv.removeAt(-1, 1)).toBeNull();
  });

  it("consumes across two partial stacks atomically", () => {
    const inv = new Inventory();
    inv.slots[0] = { item: "stick", count: 3 };
    inv.slots[5] = { item: "stick", count: 5 };
    expect(inv.consume("stick", 6)).toBe(true);
    expect(inv.slots[0]).toBeNull();
    expect(inv.slots[5]).toEqual({ item: "stick", count: 2 });
    const snapshot = JSON.stringify(inv.toJSON());
    expect(inv.consume("stick", 3)).toBe(false);
    expect(inv.consume("cobblestone", 1)).toBe(false);
    expect(JSON.stringify(inv.toJSON())).toBe(snapshot);
    expect(inv.consume("stick", 2)).toBe(true);
    expect(inv.slots[5]).toBeNull();
    expect(inv.consume("stick", 6)).toBe(false);
  });

  it("decrements tool durability and clears the slot when a tool breaks", () => {
    const inv = new Inventory();
    inv.add({ item: "wood_pickaxe", count: 1 });
    const max = maxDurability("wood_pickaxe");
    expect(inv.slots[0]?.durability).toBe(max);
    expect(inv.damage(0)).toBe(false);
    expect(inv.slots[0]?.durability).toBe(max - 1);
    expect(inv.damage(0, max)).toBe(true);
    expect(inv.slots[0]).toBeNull();
    expect(inv.damage(0)).toBe(false);
    expect(inv.damage(INVENTORY_SLOT_COUNT, 1)).toBe(false);
  });

  it("ignores damage on non-durable stacks", () => {
    const inv = new Inventory();
    inv.add({ item: "cobblestone", count: 2 });
    expect(inv.damage(0, 10)).toBe(false);
    expect(inv.slots[0]).toEqual({ item: "cobblestone", count: 2 });
  });

  it("round-trips through plain JSON without losing state", () => {
    const inv = new Inventory();
    inv.add({ item: "cobblestone", count: 70 });
    inv.add({ item: "stick", count: 20 });
    inv.add({ item: "wood_pickaxe", count: 1 });
    inv.damage(3, 5);
    inv.selectedIndex = 2;
    const parsed = JSON.parse(JSON.stringify(inv.toJSON())) as InventorySave;
    const restored = Inventory.fromJSON(parsed);
    expect(restored.toJSON()).toEqual(inv.toJSON());
    expect(restored.selectedIndex).toBe(2);
    expect(restored.slots[3]?.durability).toBe(maxDurability("wood_pickaxe") - 5);
    expect(restored.count("cobblestone")).toBe(70);
    expect(restored.count("stick")).toBe(20);
  });

  it("sanitizes malformed save data", () => {
    const restored = Inventory.fromJSON({ slots: [], hotbarIndex: 999 });
    expect(restored.slots).toHaveLength(INVENTORY_SLOT_COUNT);
    expect(restored.slots.every((slot) => slot === null)).toBe(true);
    expect(restored.hotbarIndex).toBe(HOTBAR_SIZE - 1);
    const negative = Inventory.fromJSON({ slots: [{ item: "stick", count: -3 }], hotbarIndex: -1 });
    expect(negative.slots[0]).toBeNull();
    expect(negative.hotbarIndex).toBe(0);
  });
});
