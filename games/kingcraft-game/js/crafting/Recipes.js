// وصفات التصنيع. الأشكال تستخدم معرّفات العناصر النصّية، و null للخانة الفارغة.
// الوصفة: { out:{id,count}, shape:[[...]] }  أو  { out, shapeless:[ids...] }

const T = "stick"; // اختصار

export const RECIPES = [
  // ===== أساسيات (تُصنع في 2×2) =====
  { out: { id: "planks", count: 4 }, shapeless: ["wood"] },
  { out: { id: "stick", count: 4 }, shape: [["planks"], ["planks"]] },
  { out: { id: "crafting_table", count: 1 }, shape: [["planks", "planks"], ["planks", "planks"]] },

  // ===== تتطلب طاولة (3×3) =====
  { out: { id: "furnace", count: 1 }, shape: [
    ["cobble", "cobble", "cobble"],
    ["cobble", null, "cobble"],
    ["cobble", "cobble", "cobble"],
  ] },

  // كتل التخزين
  { out: { id: "iron_block", count: 1 },    shape: full3("iron_ingot") },
  { out: { id: "gold_block", count: 1 },    shape: full3("gold_ingot") },
  { out: { id: "diamond_block", count: 1 }, shape: full3("diamond") },
  // فكّ الكتل
  { out: { id: "iron_ingot", count: 9 }, shapeless: ["iron_block"] },
  { out: { id: "gold_ingot", count: 9 }, shapeless: ["gold_block"] },
  { out: { id: "diamond", count: 9 },    shapeless: ["diamond_block"] },

  { out: { id: "bread", count: 2 }, shapeless: ["wheat", "wheat", "wheat"] },
];

// ===== دروع =====
const ARMOR_RECIPES = [
  [["leather", "leather", "leather"], ["leather", null, "leather"]],   // helmet (5)
  [[null, "leather", null], ["leather", "leather", "leather"], ["leather", "leather", "leather"]], // chestplate (8)
  [["leather", "leather", "leather"], ["leather", null, "leather"], ["leather", null, "leather"]], // leggings (7)
  [["leather", null, "leather"], ["leather", null, "leather"]], // boots (4)
];
const ARMOR_PART_NAMES = ["helmet", "chestplate", "leggings", "boots"];
const ARMOR_MATERIAL_MAP = [
  ["leather", "leather"],
  ["iron_ingot", "iron"],
  ["gold_ingot", "golden"],
  ["diamond", "diamond"],
];
for (const [mat, prefix] of ARMOR_MATERIAL_MAP) {
  for (let i = 0; i < ARMOR_PART_NAMES.length; i++) {
    const shape = ARMOR_RECIPES[i].map(r => r.map(c => c === "leather" ? mat : null));
    RECIPES.push({ out: { id: prefix + "_" + ARMOR_PART_NAMES[i], count: 1 }, shape });
  }
}

// أشكال الأدوات لكل مادة
const TOOL_MATERIALS = [
  ["planks", "wooden"],
  ["cobble", "stone"],
  ["iron_ingot", "iron"],
  ["gold_ingot", "golden"],
  ["diamond", "diamond"],
];

for (const [m, prefix] of TOOL_MATERIALS) {
  RECIPES.push({ out: { id: prefix + "_pickaxe", count: 1 }, shape: [[m, m, m], [null, T, null], [null, T, null]] });
  RECIPES.push({ out: { id: prefix + "_axe", count: 1 },     shape: [[m, m, null], [m, T, null], [null, T, null]] });
  RECIPES.push({ out: { id: prefix + "_shovel", count: 1 },  shape: [[m], [T], [T]] });
  RECIPES.push({ out: { id: prefix + "_hoe", count: 1 },     shape: [[m, m, null], [null, T, null], [null, T, null]] });
  RECIPES.push({ out: { id: prefix + "_sword", count: 1 },   shape: [[m], [m], [T]] });
}

function full3(id) {
  return [[id, id, id], [id, id, id], [id, id, id]];
}
