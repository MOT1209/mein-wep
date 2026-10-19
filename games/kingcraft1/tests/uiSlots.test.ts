import { describe, expect, it } from "vitest";
import {
  clickSlot,
  craftAllInto,
  craftPreview,
  insertInto,
  quickMove,
  screenToSlot,
  takeCraft,
  type GridLayout
} from "../src/ui/slotLogic";

const GRID: GridLayout = { left: 100, top: 50, columns: 9, rows: 4, size: 40, gap: 4 };

describe("screenToSlot", () => {
  it("maps points inside cells to row-major indices", () => {
    expect(screenToSlot(100, 50, GRID)).toBe(0);
    expect(screenToSlot(139, 89, GRID)).toBe(0);
    expect(screenToSlot(144, 50, GRID)).toBe(1);
    expect(screenToSlot(100 + 8 * 44 + 5, 50 + 3 * 44 + 5, GRID)).toBe(35);
    expect(screenToSlot(100, 50 + 44, GRID)).toBe(9);
  });

  it("returns -1 for gaps and outside the grid", () => {
    expect(screenToSlot(141, 60, GRID)).toBe(-1);
    expect(screenToSlot(99, 60, GRID)).toBe(-1);
    expect(screenToSlot(100 + 9 * 44, 60, GRID)).toBe(-1);
    expect(screenToSlot(110, 50 + 4 * 44, GRID)).toBe(-1);
  });
});

describe("clickSlot", () => {
  it("picks up, puts down and swaps with the left button", () => {
    const dirt = { item: "dirt", count: 5 };
    const stone = { item: "stone", count: 2 };
    expect(clickSlot(dirt, null, "left")).toEqual({ slot: null, cursor: dirt });
    expect(clickSlot(null, dirt, "left")).toEqual({ slot: dirt, cursor: null });
    expect(clickSlot(dirt, stone, "left")).toEqual({ slot: stone, cursor: dirt });
  });

  it("merges same items up to the stack size", () => {
    expect(clickSlot({ item: "dirt", count: 60 }, { item: "dirt", count: 10 }, "left")).toEqual({
      slot: { item: "dirt", count: 64 },
      cursor: { item: "dirt", count: 6 }
    });
  });

  it("takes half or places one with the right button", () => {
    expect(clickSlot({ item: "dirt", count: 5 }, null, "right")).toEqual({
      slot: { item: "dirt", count: 2 },
      cursor: { item: "dirt", count: 3 }
    });
    expect(clickSlot(null, { item: "dirt", count: 3 }, "right")).toEqual({
      slot: { item: "dirt", count: 1 },
      cursor: { item: "dirt", count: 2 }
    });
    expect(clickSlot({ item: "dirt", count: 1 }, { item: "dirt", count: 1 }, "right")).toEqual({
      slot: { item: "dirt", count: 2 },
      cursor: null
    });
  });

  it("never stacks tools", () => {
    const pick = { item: "wood_pickaxe", count: 1, durability: 60 };
    expect(clickSlot(pick, { ...pick }, "left")).toEqual({ slot: pick, cursor: pick });
  });
});

describe("quick move and insert", () => {
  it("moves between hotbar and main inventory", () => {
    const slots = new Array(45).fill(null);
    slots[0] = { item: "dirt", count: 10 };
    expect(quickMove(slots, 0)).toBe(true);
    expect(slots[0]).toBeNull();
    expect(slots[9]).toEqual({ item: "dirt", count: 10 });
    expect(quickMove(slots, 9)).toBe(true);
    expect(slots[0]).toEqual({ item: "dirt", count: 10 });
  });

  it("fills partial stacks before empty slots and reports leftovers", () => {
    const slots = [{ item: "dirt", count: 60 }, null];
    expect(insertInto(slots, { item: "dirt", count: 70 }, 0, 2)).toEqual({ item: "dirt", count: 2 });
    expect(slots).toEqual([
      { item: "dirt", count: 64 },
      { item: "dirt", count: 64 }
    ]);
  });
});

describe("crafting from the grid", () => {
  it("crafts planks from a log in the 2x2 grid", () => {
    const grid = [{ item: "log", count: 2 }, null, null, null];
    expect(craftPreview(grid, 2)).toEqual({ item: "planks", count: 4 });
    const taken = takeCraft(grid, 2, null);
    expect(taken?.cursor).toEqual({ item: "planks", count: 4 });
    expect(taken?.grid[0]).toEqual({ item: "log", count: 1 });
    const again = takeCraft(taken?.grid ?? [], 2, taken?.cursor ?? null);
    expect(again?.cursor).toEqual({ item: "planks", count: 8 });
    expect(again?.grid[0]).toBeNull();
  });

  it("refuses table recipes in the 2x2 grid but allows them on a table", () => {
    const torch2 = [{ item: "coal", count: 1 }, null, { item: "stick", count: 1 }, null];
    expect(craftPreview(torch2, 2)).toBeNull();
    expect(takeCraft(torch2, 2, null)).toBeNull();
    const torch3 = [{ item: "coal", count: 1 }, null, null, { item: "stick", count: 1 }, null, null, null, null, null];
    expect(craftPreview(torch3, 3)).toEqual({ item: "torch", count: 4 });
  });

  it("crafts a furnace on the 3x3 table grid", () => {
    const grid3 = [
      { item: "cobblestone", count: 1 },
      { item: "cobblestone", count: 1 },
      { item: "cobblestone", count: 1 },
      { item: "cobblestone", count: 1 },
      null,
      { item: "cobblestone", count: 1 },
      { item: "cobblestone", count: 1 },
      { item: "cobblestone", count: 1 },
      { item: "cobblestone", count: 1 }
    ];
    expect(craftPreview(grid3, 3)?.item).toBe("furnace");
  });

  it("shift-crafts everything into the inventory", () => {
    const slots = new Array(45).fill(null);
    const { grid, crafted } = craftAllInto([{ item: "log", count: 3 }, null, null, null], 2, slots);
    expect(crafted).toBe(12);
    expect(grid[0]).toBeNull();
    expect(slots[0]).toEqual({ item: "planks", count: 12 });
  });
});
