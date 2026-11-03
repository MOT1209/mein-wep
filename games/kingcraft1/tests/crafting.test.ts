import { describe, expect, it } from "vitest";
import { availableRecipes, craft, matchRecipe, recipesFor } from "../src/gameplay/crafting";
import type { ItemStack } from "../src/gameplay/crafting";

function emptyGrid(size: 2 | 3): (ItemStack | null)[] {
  return new Array<ItemStack | null>(size * size).fill(null);
}

function place(grid: (ItemStack | null)[], size: 2 | 3, x: number, y: number, item: string, count = 1): void {
  grid[y * size + x] = { item, count };
}

function fromPattern(rows: string[], key: Record<string, string>): (ItemStack | null)[] {
  const grid = emptyGrid(3);
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const symbol = rows[y][x];
      if (symbol !== " ") place(grid, 3, x, y, key[symbol]);
    }
  }
  return grid;
}

describe("matchRecipe", () => {
  it("matches a shaped recipe at an offset", () => {
    const grid = emptyGrid(3);
    place(grid, 3, 2, 0, "planks");
    place(grid, 3, 2, 1, "planks");
    const recipe = matchRecipe(grid, 3);
    expect(recipe).not.toBeNull();
    expect(recipe?.type).toBe("shaped");
    expect(recipe?.result).toEqual({ item: "stick", count: 4 });
  });

  it("matches a 2x2 pattern in a 2x2 grid", () => {
    const grid = emptyGrid(2);
    place(grid, 2, 0, 0, "planks");
    place(grid, 2, 1, 0, "planks");
    place(grid, 2, 0, 1, "planks");
    place(grid, 2, 1, 1, "planks");
    expect(matchRecipe(grid, 2)?.result).toEqual({ item: "crafting_table", count: 1 });
  });

  it("matches the furnace ring in a 3x3 grid", () => {
    const grid = emptyGrid(3);
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (x === 1 && y === 1) continue;
        place(grid, 3, x, y, "cobblestone");
      }
    }
    expect(matchRecipe(grid, 3)?.result).toEqual({ item: "furnace", count: 1 });
  });

  it("does not match a mirrored pattern", () => {
    const key: Record<string, string> = { M: "planks", S: "stick" };
    const axe = ["MM ", "MS ", " S "];
    const mirrored = axe.map((row) => row.split("").reverse().join(""));
    expect(matchRecipe(fromPattern(axe, key), 3)?.result.item).toBe("wood_axe");
    expect(matchRecipe(fromPattern(mirrored, key), 3)).toBeNull();
  });

  it("fails on a wrong shape", () => {
    const grid = emptyGrid(3);
    place(grid, 3, 0, 0, "planks");
    place(grid, 3, 1, 0, "planks");
    place(grid, 3, 1, 1, "planks");
    place(grid, 3, 0, 1, "stick");
    place(grid, 3, 2, 2, "stick");
    expect(matchRecipe(grid, 3)).toBeNull();
  });

  it("returns null for an empty grid", () => {
    expect(matchRecipe(emptyGrid(2), 2)).toBeNull();
    expect(matchRecipe(emptyGrid(3), 3)).toBeNull();
  });

  it("matches shapeless recipes independently of order and stack counts", () => {
    const first = emptyGrid(2);
    place(first, 2, 0, 0, "cobblestone", 64);
    place(first, 2, 1, 1, "tall_grass", 7);
    const second = emptyGrid(2);
    place(second, 2, 1, 0, "tall_grass");
    place(second, 2, 0, 1, "cobblestone");
    expect(matchRecipe(first, 2)?.result).toEqual({ item: "mossy_stone", count: 1 });
    expect(matchRecipe(second, 2)?.result).toEqual({ item: "mossy_stone", count: 1 });
  });

  it("does not match an impossible arrangement of recipe items", () => {
    const grid = emptyGrid(3);
    place(grid, 3, 0, 0, "coal");
    place(grid, 3, 1, 1, "stick");
    expect(matchRecipe(grid, 3)).toBeNull();
  });
});

describe("craft", () => {
  it("craftAll consumes inputs repeatedly", () => {
    const grid = emptyGrid(2);
    place(grid, 2, 0, 0, "log", 3);
    const result = craft(grid, 2, true);
    expect(result.output).toEqual([{ item: "planks", count: 12 }]);
    expect(result.remaining).toEqual([null, null, null, null]);
    expect(grid[0]).toEqual({ item: "log", count: 3 });
  });

  it("splits output across stacks of the item stack size", () => {
    const grid = emptyGrid(2);
    place(grid, 2, 0, 0, "log", 20);
    const result = craft(grid, 2, true);
    expect(result.output).toEqual([
      { item: "planks", count: 64 },
      { item: "planks", count: 16 }
    ]);
    expect(result.remaining[0]).toBeNull();
  });

  it("returns leftovers after a single craft", () => {
    const grid = emptyGrid(3);
    place(grid, 3, 0, 0, "coal", 3);
    place(grid, 3, 0, 1, "stick", 1);
    const result = craft(grid, 3, false);
    expect(result.output).toEqual([{ item: "torch", count: 4 }]);
    expect(result.remaining[0]).toEqual({ item: "coal", count: 2 });
    expect(result.remaining[3]).toBeNull();
  });

  it("stops craftAll when ingredients run out", () => {
    const grid = emptyGrid(3);
    place(grid, 3, 0, 0, "coal", 3);
    place(grid, 3, 0, 1, "stick", 1);
    const result = craft(grid, 3, true);
    expect(result.output).toEqual([{ item: "torch", count: 4 }]);
    expect(result.remaining[0]).toEqual({ item: "coal", count: 2 });
    expect(result.remaining[3]).toBeNull();
  });

  it("keeps non-stackable results in separate stacks", () => {
    const grid = emptyGrid(3);
    place(grid, 3, 0, 0, "wool", 2);
    place(grid, 3, 1, 0, "wool", 2);
    place(grid, 3, 2, 0, "wool", 2);
    place(grid, 3, 0, 1, "planks", 2);
    place(grid, 3, 1, 1, "planks", 2);
    place(grid, 3, 2, 1, "planks", 2);
    const result = craft(grid, 3, true);
    expect(result.output).toEqual([
      { item: "bed", count: 1 },
      { item: "bed", count: 1 }
    ]);
  });

  it("returns an empty result when nothing matches", () => {
    const grid = emptyGrid(2);
    place(grid, 2, 0, 0, "dirt");
    const result = craft(grid, 2, true);
    expect(result.output).toEqual([]);
    expect(result.remaining[0]).toEqual({ item: "dirt", count: 1 });
  });
});

describe("recipe queries", () => {
  it("finds recipes by output item", () => {
    const sticks = recipesFor("stick");
    expect(sticks.length).toBe(1);
    expect(sticks[0].type).toBe("shaped");
    expect(recipesFor("planks").length).toBe(3);
    expect(recipesFor("unobtainium").length).toBe(0);
  });

  it("lists recipes craftable from an inventory's slots", () => {
    const inv = {
      slots: [
        { item: "planks", count: 4 },
        { item: "stick", count: 1 },
        null
      ]
    };
    const ids = availableRecipes(inv).map((recipe) => recipe.result.item);
    expect(ids).toContain("stick");
    expect(ids).toContain("crafting_table");
    expect(ids).toContain("wood_sword");
    expect(ids).not.toContain("chest");
    expect(ids).not.toContain("wood_pickaxe");
    expect(ids).not.toContain("furnace");
  });
});
