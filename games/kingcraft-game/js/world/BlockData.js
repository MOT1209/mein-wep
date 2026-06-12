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

  // ===== بلوكات المرحلة 4: بايومز + كهوف =====
  { id: 21, name: "gravel",     label: "حصى",    hardness: 0.6, tile: "gravel" },
  { id: 22, name: "granite",    label: "جرانيت",  hardness: 1.5, tile: "granite" },
  { id: 23, name: "diorite",    label: "ديوريت",  hardness: 1.5, tile: "diorite" },
  { id: 24, name: "andesite",   label: "أنديزيت", hardness: 1.5, tile: "andesite" },
  { id: 25, name: "mud",        label: "طين",     hardness: 0.4, tile: "mud" },
  { id: 26, name: "podzol",     label: "بودزول",  hardness: 0.6, tiles: { top: "podzol_top", bottom: "dirt", side: "podzol_side" } },
  { id: 27, name: "clay",       label: "صلصال",   hardness: 0.6, tile: "clay" },
  { id: 28, name: "sandstone",  label: "حجر رملي", hardness: 0.8, tile: "sandstone" },
  { id: 29, name: "ice",        label: "جليد",    hardness: 0.5, tile: "ice", transparent: true },
  { id: 30, name: "snow_block", label: "كتلة ثلج", hardness: 0.4, tile: "snow_block" },
  { id: 31, name: "packed_ice", label: "جليد مضغوط", hardness: 0.5, tile: "packed_ice" },
  { id: 32, name: "mossy_cobble", label: "حصى مطحلب", hardness: 2.0, tile: "mossy_cobble" },
  { id: 33, name: "obsidian",   label: "سبج",     hardness: 50, tile: "obsidian" },
  { id: 34, name: "brick",      label: "طوب",     hardness: 2.0, tile: "brick" },
  { id: 35, name: "bookshelf",  label: "مكتبة",   hardness: 1.5, tiles: { top: "planks", bottom: "planks", side: "bookshelf_side" } },
  { id: 36, name: "sponge",     label: "إسفنجة",  hardness: 0.6, tile: "sponge" },
  { id: 37, name: "red_flower", label: "زهرة حمراء", hardness: 0, tile: "red_flower", transparent: true, solid: false },
  { id: 38, name: "yellow_flower", label: "زهرة صفراء", hardness: 0, tile: "yellow_flower", transparent: true, solid: false },
  { id: 39, name: "brown_mushroom", label: "فطر بني", hardness: 0, tile: "brown_mushroom", transparent: true, solid: false },
  { id: 40, name: "red_mushroom", label: "فطر أحمر", hardness: 0, tile: "red_mushroom", transparent: true, solid: false },
  { id: 41, name: "dead_bush",  label: "شجيرة ميتة", hardness: 0, tile: "dead_bush", transparent: true, solid: false },
  { id: 42, name: "tall_grass", label: "عشب طويل", hardness: 0, tile: "tall_grass", transparent: true, solid: false },
  { id: 43, name: "cactus",     label: "صبار",    hardness: 0.4, tiles: { top: "cactus_top", bottom: "cactus_top", side: "cactus" }, transparent: true },
  { id: 44, name: "vine",       label: "نبات متسلق", hardness: 0.2, tile: "vine", transparent: true, solid: false },

  // ===== بلوكات المرحلة 5: زراعة + إنهانت =====
  { id: 45, name: "farmland",   label: "أرض مزروعة", hardness: 0.6, tile: "farmland", transparent: false },
  { id: 46, name: "wheat0",     label: "قمح (بذرة)",  hardness: 0, tile: "wheat0", transparent: true, solid: false },
  { id: 47, name: "wheat1",     label: "قمح (نمو)",   hardness: 0, tile: "wheat1", transparent: true, solid: false },
  { id: 48, name: "wheat2",     label: "قمح (ناضج)",  hardness: 0, tile: "wheat2", transparent: true, solid: false },
  { id: 49, name: "carrots0",   label: "جزر (بذرة)",  hardness: 0, tile: "carrots0", transparent: true, solid: false },
  { id: 50, name: "carrots1",   label: "جزر (نمو)",   hardness: 0, tile: "carrots1", transparent: true, solid: false },
  { id: 51, name: "carrots2",   label: "جزر (ناضج)",  hardness: 0, tile: "carrots2", transparent: true, solid: false },
  { id: 52, name: "potatoes0",  label: "بطاطس (بذرة)", hardness: 0, tile: "potatoes0", transparent: true, solid: false },
  { id: 53, name: "potatoes1",  label: "بطاطس (نمو)",  hardness: 0, tile: "potatoes1", transparent: true, solid: false },
  { id: 54, name: "potatoes2",  label: "بطاطس (ناضج)", hardness: 0, tile: "potatoes2", transparent: true, solid: false },

  { id: 55, name: "enchanting_table", label: "طاولة سحر", hardness: 5.0, tile: "enchanting_table", transparent: false },
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
  if (b.name === "leaves") {
    const r = Math.random();
    if (r < 0.05) return "apple";
    if (r < 0.15) return "stick";
    return null;
  }
  if (b.name === "tall_grass") {
    return Math.random() < 0.2 ? "wheat_seeds" : null;
  }
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


