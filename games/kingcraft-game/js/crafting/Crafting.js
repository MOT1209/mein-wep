// مطابقة وصفات التصنيع: تدعم الأشكال (shaped) مع القصّ والانعكاس الأفقي، والوصفات بلا شكل (shapeless).
import { RECIPES } from "./Recipes.js";

// يحوّل شبكة مسطّحة (size×size) إلى مصفوفة ثنائية مقصوصة من الفراغ.
function trim(grid2d) {
  let rows = grid2d.filter((r) => r.some((c) => c));
  if (rows.length === 0) return [];
  // قصّ الأعمدة الفارغة من الجانبين
  let minC = Infinity, maxC = -1;
  for (const r of rows) {
    for (let c = 0; c < r.length; c++) if (r[c]) { minC = Math.min(minC, c); maxC = Math.max(maxC, c); }
  }
  return rows.map((r) => r.slice(minC, maxC + 1));
}

function flatTo2D(flat, size) {
  const g = [];
  for (let r = 0; r < size; r++) g.push(flat.slice(r * size, r * size + size).map((s) => (s ? s.id : null)));
  return g;
}

function shapeEquals(a, b) {
  if (a.length !== b.length) return false;
  for (let r = 0; r < a.length; r++) {
    if (a[r].length !== b[r].length) return false;
    for (let c = 0; c < a[r].length; c++) {
      if ((a[r][c] || null) !== (b[r][c] || null)) return false;
    }
  }
  return true;
}

function mirror(shape) { return shape.map((r) => [...r].reverse()); }

function matchShapeless(grid2d, ids) {
  const have = {};
  for (const r of grid2d) for (const c of r) if (c) have[c] = (have[c] || 0) + 1;
  const need = {};
  for (const id of ids) need[id] = (need[id] || 0) + 1;
  const keysH = Object.keys(have), keysN = Object.keys(need);
  if (keysH.length !== keysN.length) return false;
  for (const k of keysN) if (have[k] !== need[k]) return false;
  return true;
}

// flat: مصفوفة الخانات {id,count}|null بطول size*size
export function matchRecipe(flat, size) {
  const grid = flatTo2D(flat, size);
  const trimmed = trim(grid);

  for (const recipe of RECIPES) {
    if (recipe.shapeless) {
      if (matchShapeless(grid, recipe.shapeless)) return recipe.out;
    } else {
      const rs = trim(recipe.shape.map((r) => r.map((c) => c || null)));
      if (shapeEquals(trimmed, rs) || shapeEquals(trimmed, mirror(rs))) return recipe.out;
    }
  }
  return null;
}
