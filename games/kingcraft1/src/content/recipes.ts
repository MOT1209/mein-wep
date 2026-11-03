export interface ShapedRecipe {
  type: "shaped";
  id: string;
  pattern: string[];
  key: Record<string, string>;
  result: { item: string; count: number };
  station: "hand" | "table";
}

export interface ShapelessRecipe {
  type: "shapeless";
  id: string;
  ingredients: string[];
  result: { item: string; count: number };
  station: "hand" | "table";
}

export interface SmeltingRecipe {
  input: string;
  output: string;
  count: number;
  seconds: number;
}

export type CraftingRecipe = ShapedRecipe | ShapelessRecipe;

const recipes: CraftingRecipe[] = [];
let recipeCounter = 0;

function shaped(
  pattern: string[],
  key: Record<string, string>,
  result: string,
  count = 1,
  station: "hand" | "table" = "table"
): ShapedRecipe {
  const r: ShapedRecipe = {
    type: "shaped",
    id: `r${recipeCounter++}`,
    pattern,
    key,
    result: { item: result, count },
    station
  };
  recipes.push(r);
  return r;
}

function shapeless(ingredients: string[], result: string, count = 1, station: "hand" | "table" = "hand"): ShapelessRecipe {
  const r: ShapelessRecipe = {
    type: "shapeless",
    id: `r${recipeCounter++}`,
    ingredients,
    result: { item: result, count },
    station
  };
  recipes.push(r);
  return r;
}

for (const log of ["log", "log_pine", "log_dune"]) {
  shapeless([log], "planks", 4, "hand");
}

shaped(["P", "P"], { P: "planks" }, "stick", 4, "hand");
shaped(["PP", "PP"], { P: "planks" }, "crafting_table", 1, "hand");
shaped(["CCC", "C C", "CCC"], { C: "cobblestone" }, "furnace", 1);
shaped(["PPP", "P P", "PPP"], { P: "planks" }, "chest", 1);
shaped(["P P", "PPP", "P P"], { P: "planks" }, "door_closed", 3);
shaped(["C", "S"], { C: "coal", S: "stick" }, "torch", 4);
shaped(["C", "S"], { C: "charcoal", S: "stick" }, "torch", 4);
shaped([" S ", "SCS", "SSS"], { S: "stick", C: "coal" }, "campfire", 1);
shaped(["WWW", "PPP"], { W: "wool", P: "planks" }, "bed", 1);

shaped(["BB", "BB"], { B: "brick" }, "bricks", 1);
shaped(["SS", "SS"], { S: "stone" }, "stone_bricks", 4);
shaped(["SS", "SS"], { S: "sandstone" }, "sandstone_bricks", 4);
shaped(["SS", "SS"], { S: "understone" }, "understone_bricks", 4);
shaped(["SS", "SS"], { S: "emberstone" }, "emberstone_bricks", 4);
shaped(["SS", "SS"], { S: "rustrock" }, "rustrock_bricks", 4);
shapeless(["cobblestone", "tall_grass"], "mossy_stone", 1);

shaped([" D ", "DGD", " D "], { D: "ember_dust", G: "glass" }, "emberlight", 1);
shaped(["I I", " T ", "I I"], { I: "ferrite_ingot", T: "torch" }, "ferro_lantern", 1);

const TOOL_SHAPES: Record<string, { pattern: string[]; station: "hand" | "table" }> = {
  pickaxe: { pattern: ["MMM", " S ", " S "], station: "table" },
  axe: { pattern: ["MM ", "MS ", " S "], station: "table" },
  shovel: { pattern: [" M ", " S ", " S "], station: "hand" },
  hoe: { pattern: ["MM ", " S ", " S "], station: "table" },
  sword: { pattern: [" M ", " M ", " S "], station: "hand" }
};

const TIER_MATERIALS: Record<string, string> = {
  wood: "planks",
  stone: "cobblestone",
  ferrite: "ferrite_ingot",
  aurum: "aurum_ingot",
  aetherite: "aetherite_gem"
};

for (const [tierName, material] of Object.entries(TIER_MATERIALS)) {
  for (const [kind, shape] of Object.entries(TOOL_SHAPES)) {
    shaped(shape.pattern, { M: material, S: "stick" }, `${tierName}_${kind}`, 1, shape.station);
  }
}

shaped(["I ", " I"], { I: "ferrite_ingot" }, "ferrite_shears", 1);

shaped(["S T", "S T", "S T"], { S: "stick", T: "string" }, "bow", 1);
shaped(["F", "S", "H"], { F: "feather", S: "stick", H: "stone_shard" }, "arrow", 4);

const ARMOR_SHAPES: Record<string, string[]> = {
  head: ["MMM", "M M"],
  chest: ["M M", "MMM", "MMM"],
  legs: ["MMM", "M M", "M M"],
  feet: ["M M", "M M"]
};

const ARMOR_MATERIALS: Record<string, string> = {
  leather: "leather",
  ferrite: "ferrite_ingot",
  aurum: "aurum_ingot",
  aetherite: "aetherite_gem"
};

for (const [matName, material] of Object.entries(ARMOR_MATERIALS)) {
  for (const [slot, pattern] of Object.entries(ARMOR_SHAPES)) {
    shaped(pattern, { M: material }, `${matName}_${slot}`, 1);
  }
}

shapeless(["string", "leather"], "name_tag", 1);
shapeless(["bone"], "ground_bone", 3, "hand");
shaped(["WWW"], { W: "wheat" }, "bread", 1, "hand");
shapeless(["wool", "flower_red"], "wool_red", 1);
shapeless(["wool", "flower_blue"], "wool_blue", 1);
shapeless(["wool", "flower_yellow"], "wool_yellow", 1);
shaped(["I I", " I "], { I: "ferrite_ingot" }, "bucket", 1);

shaped(["CCC", "CCC", "CCC"], { C: "coal" }, "coal_block", 1);
shapeless(["coal_block"], "coal", 9);
shaped(["III", "III", "III"], { I: "ferrite_ingot" }, "ferrite_block", 1);
shapeless(["ferrite_block"], "ferrite_ingot", 9);
shaped(["III", "III", "III"], { I: "aurum_ingot" }, "aurum_block", 1);
shapeless(["aurum_block"], "aurum_ingot", 9);
shaped(["III", "III", "III"], { I: "copper_ingot" }, "copper_block", 1);
shapeless(["copper_block"], "copper_ingot", 9);
shaped(["GGG", "GGG", "GGG"], { G: "aetherite_gem" }, "crystal_block", 1);
shapeless(["crystal_block"], "aetherite_gem", 9);

export const CRAFTING_RECIPES: readonly CraftingRecipe[] = recipes;

export const SMELTING_RECIPES: readonly SmeltingRecipe[] = [
  { input: "raw_ferrite", output: "ferrite_ingot", count: 1, seconds: 10 },
  { input: "raw_copper", output: "copper_ingot", count: 1, seconds: 10 },
  { input: "raw_aurum", output: "aurum_ingot", count: 1, seconds: 10 },
  { input: "sand", output: "glass", count: 1, seconds: 10 },
  { input: "clay_ball", output: "brick", count: 1, seconds: 10 },
  { input: "cobblestone", output: "stone", count: 1, seconds: 10 },
  { input: "cobbled_understone", output: "understone", count: 1, seconds: 10 },
  { input: "raw_meat", output: "cooked_meat", count: 1, seconds: 12 },
  { input: "log", output: "charcoal", count: 1, seconds: 12 },
  { input: "log_pine", output: "charcoal", count: 1, seconds: 12 },
  { input: "log_dune", output: "charcoal", count: 1, seconds: 12 }
];

export function smeltingFor(input: string): SmeltingRecipe | undefined {
  return SMELTING_RECIPES.find((r) => r.input === input);
}

export interface RecipeGrid {
  id: string | null;
  count: number;
}

export function matchCrafting(grid: (RecipeGrid | null)[], station: "hand" | "table"): CraftingRecipe | null {
  const size = 3;
  const cells: (RecipeGrid | null)[] = new Array(size * size).fill(null);
  for (let i = 0; i < size * size; i++) cells[i] = grid[i] ?? null;

  let minX = size;
  let minY = size;
  let maxX = -1;
  let maxY = -1;
  let filled = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (cells[y * size + x]) {
        filled++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (filled === 0) return null;
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  for (const recipe of CRAFTING_RECIPES) {
    if (recipe.station === "table" && station === "hand") continue;
    if (recipe.type === "shaped") {
      const rw = recipe.pattern[0].length;
      const rh = recipe.pattern.length;
      if (rw !== width || rh !== height) continue;
      let ok = true;
      for (let y = 0; y < size && ok; y++) {
        for (let x = 0; x < size && ok; x++) {
          const cell = cells[y * size + x];
          const px = x - minX;
          const py = y - minY;
          const inPattern = px >= 0 && px < rw && py >= 0 && py < rh;
          if (inPattern) {
            const ch = recipe.pattern[py][px];
            if (ch === " ") {
              if (cell) ok = false;
            } else {
              const required = recipe.key[ch];
              if (!cell || cell.id !== required) ok = false;
            }
          } else if (cell) {
            ok = false;
          }
        }
      }
      if (ok) return recipe;
    } else {
      const needed = [...recipe.ingredients];
      if (needed.length !== filled) continue;
      if (station === "hand" && filled > 4) continue;
      let ok = true;
      for (let y = 0; y < size && ok; y++) {
        for (let x = 0; x < size && ok; x++) {
          const cell = cells[y * size + x];
          if (!cell) continue;
          const idx = needed.indexOf(cell.id as string);
          if (idx === -1) {
            ok = false;
          } else {
            needed.splice(idx, 1);
          }
        }
      }
      if (ok && needed.length === 0) return recipe;
    }
  }
  return null;
}
