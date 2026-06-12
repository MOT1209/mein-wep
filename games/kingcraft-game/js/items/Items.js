// سجل العناصر الموحّد: يربط البلوكات (قابلة للوضع) + المواد + الأدوات.
// كل عنصر يُعرّف بمعرّف نصّي (id). الكومة في المخزون = { id, count }.
import { BLOCKS, blockByName } from "../world/BlockData.js";
import { TOOLS } from "../player/Tools.js";
import { getTileCanvas } from "../blocks/BlockTexture.js";

export const ITEMS = {};

// ===== أيقونات المواد (رسم بكسل-آرت بسيط) =====
function px(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }

const MATERIAL_ICONS = {
  stick: (ctx, s) => { px(ctx, s*0.45, s*0.2, s*0.12, s*0.6, "#8a5a2b"); px(ctx, s*0.45, s*0.2, s*0.06, s*0.6, "#a96f38"); },
  coal:  (ctx, s) => { px(ctx, s*0.25, s*0.3, s*0.5, s*0.45, "#2b2b2b"); px(ctx, s*0.35, s*0.4, s*0.15, s*0.15, "#555"); },
  charcoal: (ctx, s) => { px(ctx, s*0.25, s*0.3, s*0.5, s*0.45, "#3a352f"); px(ctx, s*0.35, s*0.4, s*0.15, s*0.15, "#5a544c"); },
  iron_ingot: (ctx, s) => { px(ctx, s*0.22, s*0.42, s*0.56, s*0.22, "#d8d8d8"); px(ctx, s*0.27, s*0.44, s*0.46, s*0.06, "#f2f2f2"); },
  gold_ingot: (ctx, s) => { px(ctx, s*0.22, s*0.42, s*0.56, s*0.22, "#f6cb3a"); px(ctx, s*0.27, s*0.44, s*0.46, s*0.06, "#fff09a"); },
  diamond: (ctx, s) => {
    ctx.fillStyle = "#4fe6e0";
    ctx.beginPath();
    ctx.moveTo(s*0.5, s*0.2); ctx.lineTo(s*0.78, s*0.45); ctx.lineTo(s*0.5, s*0.8); ctx.lineTo(s*0.22, s*0.45);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#bff7f5"; px(ctx, s*0.42, s*0.33, s*0.1, s*0.1, "#bff7f5");
  },
  // ===== Drops المخلوقات =====
  rotten_flesh: (ctx, s) => { px(ctx, s*0.2, s*0.3, s*0.6, s*0.45, "#6f8a3f"); px(ctx, s*0.3, s*0.35, s*0.4, s*0.15, "#8aaa4f"); },
  bone: (ctx, s) => { px(ctx, s*0.46, s*0.2, s*0.1, s*0.6, "#e8e0d0"); px(ctx, s*0.36, s*0.2, s*0.1, s*0.12, "#e8e0d0"); px(ctx, s*0.56, s*0.2, s*0.1, s*0.12, "#e8e0d0"); },
  arrow: (ctx, s) => { px(ctx, s*0.46, s*0.25, s*0.08, s*0.5, "#8a6f3f"); px(ctx, s*0.35, s*0.22, s*0.3, s*0.08, "#c0c0c0"); px(ctx, s*0.45, s*0.72, s*0.1, s*0.12, "#d0d0d0"); },
  gunpowder: (ctx, s) => { px(ctx, s*0.25, s*0.35, s*0.5, s*0.35, "#4a4a4a"); px(ctx, s*0.3, s*0.4, s*0.08, s*0.08, "#2a2a2a"); px(ctx, s*0.55, s*0.45, s*0.08, s*0.08, "#2a2a2a"); },
  string: (ctx, s) => { px(ctx, s*0.35, s*0.15, s*0.3, s*0.7, "#d8d8d8"); px(ctx, s*0.3, s*0.2, s*0.4, s*0.08, "#e8e8e8"); },
  spider_eye: (ctx, s) => { px(ctx, s*0.25, s*0.35, s*0.5, s*0.4, "#cc2222"); px(ctx, s*0.42, s*0.42, s*0.16, s*0.16, "#1a1a1a"); },
  leather: (ctx, s) => { px(ctx, s*0.25, s*0.35, s*0.5, s*0.4, "#a06030"); px(ctx, s*0.3, s*0.38, s*0.4, s*0.2, "#b07040"); },
  feather: (ctx, s) => { px(ctx, s*0.35, s*0.25, s*0.2, s*0.5, "#e8e8e8"); px(ctx, s*0.55, s*0.3, s*0.2, s*0.3, "#e8e8e8"); px(ctx, s*0.5, s*0.3, s*0.1, s*0.04, "#d0d0d0"); },
  white_wool: (ctx, s) => { px(ctx, s*0.2, s*0.3, s*0.6, s*0.5, "#f0f0f0"); px(ctx, s*0.25, s*0.35, s*0.1, s*0.1, "#e0e0e0"); px(ctx, s*0.5, s*0.35, s*0.15, s*0.1, "#e0e0e0"); },
  ender_pearl: (ctx, s) => { px(ctx, s*0.3, s*0.3, s*0.4, s*0.4, "#1a5a3a"); px(ctx, s*0.22, s*0.22, s*0.56, s*0.56, "#2a7a4a", 0.3); ctx.fillStyle = "#2a7a4a"; ctx.beginPath(); ctx.ellipse(s*0.5, s*0.5, s*0.28, s*0.28, 0, 0, Math.PI*2); ctx.fill(); },
  redstone_dust: (ctx, s) => { px(ctx, s*0.3, s*0.42, s*0.4, s*0.16, "#cc0000"); px(ctx, s*0.35, s*0.38, s*0.08, s*0.08, "#ff2222"); px(ctx, s*0.55, s*0.44, s*0.1, s*0.1, "#ff2222"); },
  slimeball: (ctx, s) => { ctx.fillStyle = "#6fc96f"; ctx.beginPath(); ctx.ellipse(s*0.5, s*0.5, s*0.3, s*0.3, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = "#8fe98f"; px(ctx, s*0.35, s*0.35, s*0.1, s*0.1, "#8fe98f"); },
  // محاصيل
  wheat_seeds: (ctx, s) => { px(ctx, s*0.3, s*0.5, s*0.4, s*0.3, "#8a6a2a"); px(ctx, s*0.35, s*0.4, s*0.3, s*0.15, "#a08030"); px(ctx, s*0.45, s*0.2, s*0.1, s*0.25, "#8a6a2a"); },
  wheat: (ctx, s) => { px(ctx, s*0.2, s*0.4, s*0.6, s*0.4, "#c0a040"); px(ctx, s*0.25, s*0.5, s*0.5, s*0.15, "#d0b050"); px(ctx, s*0.45, s*0.15, s*0.1, s*0.3, "#8a7a3a"); },
};

// أيقونات الدروع (أشكال مبسطة)
function drawArmor(ctx, s, color, type) {
  if (type === "helmet") {
    px(ctx, s*0.2, s*0.2, s*0.6, s*0.35, color);
    px(ctx, s*0.35, s*0.15, s*0.3, s*0.1, color);
  } else if (type === "chestplate") {
    px(ctx, s*0.18, s*0.25, s*0.64, s*0.5, color);
    px(ctx, s*0.1, s*0.35, s*0.1, s*0.25, color);
    px(ctx, s*0.8, s*0.35, s*0.1, s*0.25, color);
  } else if (type === "leggings") {
    px(ctx, s*0.22, s*0.2, s*0.56, s*0.35, color);
    px(ctx, s*0.22, s*0.55, s*0.2, s*0.3, color);
    px(ctx, s*0.58, s*0.55, s*0.2, s*0.3, color);
  } else if (type === "boots") {
    px(ctx, s*0.2, s*0.2, s*0.22, s*0.4, color);
    px(ctx, s*0.58, s*0.2, s*0.22, s*0.4, color);
    px(ctx, s*0.15, s*0.55, s*0.3, s*0.2, color);
    px(ctx, s*0.55, s*0.55, s*0.3, s*0.2, color);
  }
}

const ARMOR_MATERIALS = [
  { name: "leather", color: "#a06030", tier: 1, points: [1, 3, 2, 1] },
  { name: "iron", color: "#c0c0c0", tier: 2, points: [2, 6, 5, 2] },
  { name: "golden", color: "#f6cb3a", tier: 3, points: [2, 5, 3, 1] },
  { name: "diamond", color: "#4fe6e0", tier: 4, points: [3, 8, 6, 3] },
];

const TIER_COLOR = ["#fff", "#9c6b3f", "#9a9a9a", "#d8d8d8", "#4fe6e0"]; // index = tier

function drawTool(ctx, s, kind, tier) {
  const c = TIER_COLOR[tier] || "#bbb";
  // المقبض (عصا)
  px(ctx, s*0.46, s*0.35, s*0.1, s*0.5, "#8a5a2b");
  ctx.fillStyle = c;
  if (kind === "pickaxe") { px(ctx, s*0.22, s*0.22, s*0.56, s*0.1, c); px(ctx, s*0.22, s*0.22, s*0.1, s*0.12, c); px(ctx, s*0.68, s*0.22, s*0.1, s*0.12, c); }
  else if (kind === "axe") { px(ctx, s*0.5, s*0.18, s*0.26, s*0.26, c); }
  else if (kind === "shovel") { px(ctx, s*0.4, s*0.16, s*0.22, s*0.22, c); }
  else if (kind === "hoe") { px(ctx, s*0.4, s*0.16, s*0.22, s*0.18, c); px(ctx, s*0.36, s*0.32, s*0.3, s*0.06, c); }
  else if (kind === "sword") { px(ctx, s*0.46, s*0.14, s*0.1, s*0.5, c); px(ctx, s*0.38, s*0.62, s*0.26, s*0.08, "#7a5230"); }
}

// ===== التسجيل =====
function register(item) { ITEMS[item.id] = item; }

// بلوكات قابلة للوضع (نتخطى الهواء والماء)
for (const b of BLOCKS) {
  if (b.id === 0 || b.name === "water") continue;
  register({ id: b.name, label: b.label || b.name, maxStack: 64, placeable: true, blockId: b.id });
}

// مواد
const materials = [
  ["stick", "عصا"], ["coal", "فحم"], ["charcoal", "فحم نباتي"],
  ["iron_ingot", "سبيكة حديد"], ["gold_ingot", "سبيكة ذهب"], ["diamond", "ألماس"],
  // Drops مخلوقات
  ["rotten_flesh", "لحم فاسد"], ["bone", "عظم"], ["arrow", "سهم"],
  ["gunpowder", "بارود"], ["string", "خيط"], ["spider_eye", "عين عنكبوت"],
  ["leather", "جلد"], ["feather", "ريشة"], ["white_wool", "صوف أبيض"],
  ["ender_pearl", "لؤلؤة إندر"], ["redstone_dust", "غبار ريدستون"], ["slimeball", "كرة سلايم"],
  // محاصيل
  ["wheat_seeds", "بذور قمح"], ["wheat", "قمح"],
];

// أطعمة
const FOOD_ICONS = {
  apple: (ctx, s) => { px(ctx, s*0.2, s*0.3, s*0.6, s*0.5, "#e03030"); px(ctx, s*0.25, s*0.25, s*0.12, s*0.12, "#5a3a10"); px(ctx, s*0.4, s*0.5, s*0.15, s*0.08, "#7a2a1a"); },
  bread: (ctx, s) => { px(ctx, s*0.15, s*0.35, s*0.7, s*0.5, "#dba54b"); px(ctx, s*0.2, s*0.4, s*0.6, s*0.15, "#c4923a"); },
  cooked_beef: (ctx, s) => { px(ctx, s*0.2, s*0.3, s*0.6, s*0.45, "#7a5230"); px(ctx, s*0.25, s*0.35, s*0.5, s*0.2, "#9a6a3a"); },
  beef: (ctx, s) => { px(ctx, s*0.2, s*0.35, s*0.6, s*0.4, "#c04040"); px(ctx, s*0.25, s*0.4, s*0.5, s*0.15, "#d05050"); },
  mutton: (ctx, s) => { px(ctx, s*0.2, s*0.35, s*0.6, s*0.4, "#d06060"); px(ctx, s*0.25, s*0.4, s*0.5, s*0.15, "#e07070"); },
  cooked_mutton: (ctx, s) => { px(ctx, s*0.2, s*0.35, s*0.6, s*0.4, "#704030"); px(ctx, s*0.25, s*0.4, s*0.5, s*0.15, "#906050"); },
  chicken: (ctx, s) => { px(ctx, s*0.2, s*0.3, s*0.6, s*0.5, "#e0c080"); px(ctx, s*0.3, s*0.35, s*0.4, s*0.15, "#f0d090"); },
  cooked_chicken: (ctx, s) => { px(ctx, s*0.2, s*0.3, s*0.6, s*0.5, "#b09060"); px(ctx, s*0.3, s*0.35, s*0.4, s*0.15, "#d0a070"); },
  porkchop: (ctx, s) => { px(ctx, s*0.25, s*0.35, s*0.5, s*0.4, "#e09080"); px(ctx, s*0.3, s*0.4, s*0.4, s*0.15, "#f0a090"); },
  cooked_porkchop: (ctx, s) => { px(ctx, s*0.25, s*0.35, s*0.5, s*0.4, "#b07060"); px(ctx, s*0.3, s*0.4, s*0.4, s*0.15, "#c08070"); },
  baked_potato: (ctx, s) => { px(ctx, s*0.25, s*0.3, s*0.5, s*0.5, "#9a7a4a"); px(ctx, s*0.3, s*0.35, s*0.4, s*0.3, "#b09060"); px(ctx, s*0.35, s*0.5, s*0.3, s*0.1, "#c0a070"); },
  carrot: (ctx, s) => { px(ctx, s*0.3, s*0.2, s*0.4, s*0.6, "#e06020"); px(ctx, s*0.35, s*0.25, s*0.3, s*0.5, "#f08040"); px(ctx, s*0.42, s*0.1, s*0.16, s*0.12, "#3a7a2a"); },
  potato: (ctx, s) => { px(ctx, s*0.25, s*0.3, s*0.5, s*0.5, "#8a6a3a"); px(ctx, s*0.3, s*0.35, s*0.4, s*0.3, "#a08050"); px(ctx, s*0.35, s*0.5, s*0.3, s*0.1, "#c0a060"); },
};

const foods = [
  ["apple", "تفاحة"], ["bread", "خبز"],
  ["carrot", "جزر"], ["potato", "بطاطس نيئة"], ["baked_potato", "بطاطس مشوية"],
  ["cooked_beef", "لحم مشوي"], ["cooked_porkchop", "خنزير مشوي"],
  ["cooked_chicken", "دجاج مشوي"], ["cooked_mutton", "خروف مشوي"],
  ["beef", "لحم بقري نيء"], ["porkchop", "خنزير نيء"],
  ["chicken", "دجاج نيء"], ["mutton", "خروف نيء"],
];
const FOOD_VALS = {
  apple: 4, bread: 5,
  carrot: 3, potato: 1, baked_potato: 5,
  cooked_beef: 8, cooked_porkchop: 8, cooked_chicken: 6, cooked_mutton: 6,
  beef: 3, porkchop: 3, chicken: 2, mutton: 2,
};
const SAT_VALS = {
  apple: 2.4, bread: 6,
  carrot: 3.6, potato: 0.6, baked_potato: 6,
  cooked_beef: 12.8, cooked_porkchop: 12.8, cooked_chicken: 7.2, cooked_mutton: 9.6,
  beef: 1.8, porkchop: 1.8, chicken: 1.2, mutton: 1.2,
};
for (const [id, label] of foods) {
  register({ id, label, maxStack: 64, placeable: false, draw: FOOD_ICONS[id], food: FOOD_VALS[id], saturation: SAT_VALS[id] });
}
for (const [id, label] of materials) {
  register({ id, label, maxStack: 64, placeable: false, draw: MATERIAL_ICONS[id] });
}

// أدوات
for (const key in TOOLS) {
  if (key === "fist") continue;
  const t = TOOLS[key];
  register({ id: t.id, label: t.label, maxStack: 1, placeable: false, tool: t.id, kind: t.kind, tier: t.tier, damage: t.damage || 1 });
}

// دروع
const ARMOR_PARTS = ["helmet", "chestplate", "leggings", "boots"];
const ARMOR_LABELS = { helmet: "خوذة", chestplate: "صندوق", leggings: "بنطلون", boots: "حذاء" };
for (const am of ARMOR_MATERIALS) {
  for (let i = 0; i < ARMOR_PARTS.length; i++) {
    const part = ARMOR_PARTS[i];
    const id = am.name + "_" + part;
    const label = ARMOR_LABELS[part] + " " + (am.name === "golden" ? "ذهبي" : am.name === "leather" ? "جلدي" : am.name === "iron" ? "حديدي" : "ألماسي");
    register({
      id, label, maxStack: 1, placeable: false,
      armor: { material: am.name, part, points: am.points[i], tier: am.tier },
      draw: (ctx, s) => drawArmor(ctx, s, am.color, part),
    });
  }
}

export function getItem(id) { return ITEMS[id] || null; }
export function isPlaceable(id) { const it = ITEMS[id]; return !!(it && it.placeable); }
export function placeBlockId(id) { const it = ITEMS[id]; return it && it.placeable ? it.blockId : 0; }

// أيقونة العنصر كـ canvas (مخزّنة مؤقتاً)
const _iconCache = {};
export function itemIcon(id, size = 32) {
  const key = id + "@" + size;
  if (_iconCache[key]) return _iconCache[key];
  const it = ITEMS[id];
  const cv = document.createElement("canvas");
  cv.width = size; cv.height = size;
  const ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  if (it && it.placeable) {
    const b = blockByName(id);
    const tile = b && b.tiles ? (b.tiles.side || b.tiles.top) : (b ? b.tile : null);
    const src = tile ? getTileCanvas(tile) : null;
    if (src) ctx.drawImage(src, 0, 0, size, size);
  } else if (it && it.draw) {
    it.draw(ctx, size);
  } else if (it && it.tool) {
    drawTool(ctx, size, it.kind, it.tier);
  }
  _iconCache[key] = cv;
  return cv;
}
