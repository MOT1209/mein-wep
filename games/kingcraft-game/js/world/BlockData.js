// تعريف البلوكات: المعرّف، الاسم، الصلابة، الأنسجة، والنَقْع عند الكسر.
// كل بلوك يحدد بلاطات نسيج: tiles {top,bottom,side} أو tile واحد لكل الأوجه.

export const AIR = 0;

// قائمة البلوكات. الترتيب = المعرّف.
export const BLOCKS = [
  { id: 0, name: "air", solid: false },
  { id: 1, name: "grass",   label: "عشب",   hardness: 0.6, tiles: { top: "grass_top", bottom: "dirt", side: "grass_side" }, drops: "dirt" },
  { id: 2, name: "dirt",    label: "تراب",  hardness: 0.5, tile: "dirt" },
  { id: 3, name: "stone",   label: "حجر",   hardness: 1.5, tile: "stone", drops: "cobble" },
  { id: 4, name: "sand",    label: "رمل",   hardness: 0.5, tile: "sand" },
  { id: 5, name: "wood",    label: "جذع",   hardness: 2.0, tiles: { top: "wood_top", bottom: "wood_top", side: "wood_side" } },
  { id: 6, name: "leaves",  label: "أوراق", hardness: 0.2, tile: "leaves", transparent: true },
  { id: 7, name: "planks",  label: "ألواح", hardness: 2.0, tile: "planks" },
  { id: 8, name: "cobble",  label: "حصى",   hardness: 2.0, tile: "cobble" },
  { id: 9, name: "snow",    label: "ثلج",   hardness: 0.4, tile: "snow" },
  { id: 10, name: "water",  label: "ماء",   hardness: 100, tile: "water", transparent: true, liquid: true },
  { id: 11, name: "glass",  label: "زجاج",  hardness: 0.3, tile: "glass", transparent: true },

  // ===== بلوكات المرحلة 2 =====
  { id: 12, name: "coal_ore",    label: "خام فحم",   hardness: 3.0, tile: "coal_ore",    drops: "coal" },
  { id: 13, name: "iron_ore",    label: "خام حديد",  hardness: 3.0, tile: "iron_ore" },
  { id: 14, name: "gold_ore",    label: "خام ذهب",   hardness: 3.0, tile: "gold_ore" },
  { id: 15, name: "diamond_ore", label: "خام ألماس", hardness: 3.0, tile: "diamond_ore", drops: "diamond" },
  { id: 16, name: "furnace",     label: "فرن",        hardness: 3.5, tiles: { top: "furnace_top", bottom: "furnace_top", side: "furnace_side", front: "furnace_front" } },
  { id: 17, name: "crafting_table", label: "طاولة تصنيع", hardness: 2.5, tiles: { top: "table_top", bottom: "planks", side: "table_side" } },
  { id: 18, name: "iron_block",    label: "كتلة حديد", hardness: 5.0, tile: "iron_block" },
  { id: 19, name: "gold_block",    label: "كتلة ذهب",  hardness: 3.0, tile: "gold_block" },
  { id: 20, name: "diamond_block", label: "كتلة ألماس", hardness: 5.0, tile: "diamond_block" },
];

const byId = BLOCKS;
const _byName = {};
for (const b of BLOCKS) _byName[b.name] = b;

// جداول بحث سريعة (بدون استدعاء دوال)
const _transparent = new Array(32).fill(false);
const _liquid = new Array(32).fill(false);
const _solid = new Array(32).fill(true);
_transparent[AIR] = true; // الهواء شفاف دائماً
_solid[AIR] = false;
for (const b of BLOCKS) {
  if (b.id === AIR) continue;
  if (b.transparent) _transparent[b.id] = true;
  if (b.liquid) { _liquid[b.id] = true; _solid[b.id] = false; }
  if (b.solid === false) _solid[b.id] = false;
}

export function getBlock(id) { return byId[id] || byId[0]; }
export function blockByName(name) { return _byName[name]; }
export function blockId(name) { const b = _byName[name]; return b ? b.id : 0; }
export function isSolid(id) { return _solid[id] === true; }
export function isTransparent(id) { return _transparent[id] === true; }
export function isLiquid(id) { return _liquid[id] === true; }

// ما يسقط عند كسر البلوك (item id نصّي)
export function blockDrop(id) {
  const b = getBlock(id);
  if (b.drops) return b.drops;
  return b.name;
}

// الأوجه: نعيد اسم البلاطة المناسبة (top/bottom/side/front)
export function tileForFace(id, face) {
  const b = getBlock(id);
  if (b.tile) return b.tile;
  if (b.tiles) {
    if (face === "top") return b.tiles.top;
    if (face === "bottom") return b.tiles.bottom;
    if (face === "front" && b.tiles.front) return b.tiles.front;
    return b.tiles.side;
  }
  return "stone";
}

// البلوكات المتاحة افتراضياً في الهاتبار (وضع البناء/الاختبار)
export const HOTBAR_BLOCKS = [1, 2, 3, 4, 5, 7, 8, 16, 17];
