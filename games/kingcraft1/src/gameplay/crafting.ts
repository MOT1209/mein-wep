import { CRAFTING_RECIPES } from "../content/recipes";
import type { CraftingRecipe, ShapedRecipe, ShapelessRecipe } from "../content/recipes";
import { stackSizeOf, type ItemStack } from "../content/items";

export type { ItemStack };

export type Recipe = CraftingRecipe;

export interface CraftResult {
  output: ItemStack[];
  remaining: (ItemStack | null)[];
}

interface CroppedGrid {
  width: number;
  height: number;
  cells: (ItemStack | null)[];
}

interface PatternShape {
  width: number;
  height: number;
  rows: string[];
}

function isFilled(cell: ItemStack | null | undefined): cell is ItemStack {
  return !!cell && cell.count > 0;
}

function cropGrid(grid: (ItemStack | null)[], size: 2 | 3): CroppedGrid | null {
  let minX: number = size;
  let minY: number = size;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFilled(grid[y * size + x])) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0 || maxY < 0) return null;
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const cells: (ItemStack | null)[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[(y + minY) * size + (x + minX)];
      cells.push(isFilled(cell) ? cell : null);
    }
  }
  return { width, height, cells };
}

function patternShape(pattern: string[]): PatternShape | null {
  let width = 0;
  for (const row of pattern) {
    if (row.length > width) width = row.length;
  }
  if (width === 0) return null;
  let minX = width;
  let minY = pattern.length;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < pattern.length; y++) {
    const row = pattern[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== " ") {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0 || maxY < 0) return null;
  const rows: string[] = [];
  for (let y = minY; y <= maxY; y++) {
    const row = pattern[y];
    let trimmed = "";
    for (let x = minX; x <= maxX; x++) {
      trimmed += x < row.length ? row[x] : " ";
    }
    rows.push(trimmed);
  }
  return { width: maxX - minX + 1, height: maxY - minY + 1, rows };
}

function shapedMatches(recipe: ShapedRecipe, grid: CroppedGrid): boolean {
  const shape = patternShape(recipe.pattern);
  if (!shape || shape.width !== grid.width || shape.height !== grid.height) return false;
  for (let y = 0; y < shape.height; y++) {
    for (let x = 0; x < shape.width; x++) {
      const cell = grid.cells[y * grid.width + x];
      const symbol = shape.rows[y][x];
      if (symbol === " ") {
        if (isFilled(cell)) return false;
      } else {
        const required = recipe.key[symbol];
        if (!required || !cell || cell.item !== required) return false;
      }
    }
  }
  return true;
}

function shapelessMatches(recipe: ShapelessRecipe, grid: CroppedGrid): boolean {
  const pool = new Map<string, number>();
  let filled = 0;
  for (const cell of grid.cells) {
    if (!isFilled(cell)) continue;
    filled++;
    pool.set(cell.item, (pool.get(cell.item) ?? 0) + 1);
  }
  if (filled !== recipe.ingredients.length) return false;
  for (const ingredient of recipe.ingredients) {
    const available = pool.get(ingredient) ?? 0;
    if (available <= 0) return false;
    pool.set(ingredient, available - 1);
  }
  return true;
}

export function matchRecipe(grid: (ItemStack | null)[], size: 2 | 3): CraftingRecipe | null {
  const cropped = cropGrid(grid, size);
  if (!cropped) return null;
  for (const recipe of CRAFTING_RECIPES) {
    if (recipe.type === "shaped" && shapedMatches(recipe, cropped)) return recipe;
  }
  for (const recipe of CRAFTING_RECIPES) {
    if (recipe.type === "shapeless" && shapelessMatches(recipe, cropped)) return recipe;
  }
  return null;
}

function appendOutput(output: ItemStack[], item: string, count: number): void {
  const limit = Math.max(1, stackSizeOf(item));
  let left = count;
  while (left > 0) {
    const last = output.length > 0 ? output[output.length - 1] : undefined;
    if (last && last.item === item && last.count < limit) {
      const taken = Math.min(limit - last.count, left);
      last.count += taken;
      left -= taken;
    } else {
      const taken = Math.min(limit, left);
      output.push({ item, count: taken });
      left -= taken;
    }
  }
}

export function craft(grid: (ItemStack | null)[], size: 2 | 3, craftAll: boolean): CraftResult {
  const total = size * size;
  const remaining: (ItemStack | null)[] = [];
  for (let i = 0; i < total; i++) {
    const cell = grid[i];
    remaining.push(isFilled(cell) ? { item: cell.item, count: cell.count } : null);
  }
  const output: ItemStack[] = [];
  while (true) {
    const recipe = matchRecipe(remaining, size);
    if (!recipe) break;
    for (let i = 0; i < total; i++) {
      const cell = remaining[i];
      if (!cell) continue;
      cell.count -= 1;
      if (cell.count <= 0) remaining[i] = null;
    }
    appendOutput(output, recipe.result.item, recipe.result.count);
    if (!craftAll) break;
  }
  return { output, remaining };
}

export function recipesFor(item: string): CraftingRecipe[] {
  return CRAFTING_RECIPES.filter((recipe) => recipe.result.item === item);
}

export function availableRecipes(inv: { slots: readonly (ItemStack | null)[] }): CraftingRecipe[] {
  const pool = new Map<string, number>();
  for (const slot of inv.slots) {
    if (!slot || slot.count <= 0) continue;
    pool.set(slot.item, (pool.get(slot.item) ?? 0) + slot.count);
  }
  return CRAFTING_RECIPES.filter((recipe) => canCraftFrom(recipe, pool));
}

function canCraftFrom(recipe: CraftingRecipe, pool: Map<string, number>): boolean {
  const needed = new Map<string, number>();
  if (recipe.type === "shaped") {
    for (const row of recipe.pattern) {
      for (const symbol of row) {
        if (symbol === " ") continue;
        const item = recipe.key[symbol];
        if (!item) return false;
        needed.set(item, (needed.get(item) ?? 0) + 1);
      }
    }
    if (needed.size === 0) return false;
  } else {
    for (const ingredient of recipe.ingredients) {
      needed.set(ingredient, (needed.get(ingredient) ?? 0) + 1);
    }
    if (needed.size === 0) return false;
  }
  for (const [item, count] of needed) {
    if ((pool.get(item) ?? 0) < count) return false;
  }
  return true;
}
