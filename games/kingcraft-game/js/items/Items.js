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
};

const TIER_COLOR = ["#fff", "#9c6b3f", "#9a9a9a", "#d8d8d8", "#4fe6e0"]; // index = tier

function drawTool(ctx, s, kind, tier) {
  const c = TIER_COLOR[tier] || "#bbb";
  // المقبض (عصا)
  px(ctx, s*0.46, s*0.35, s*0.1, s*0.5, "#8a5a2b");
  ctx.fillStyle = c;
  if (kind === "pickaxe") { px(ctx, s*0.22, s*0.22, s*0.56, s*0.1, c); px(ctx, s*0.22, s*0.22, s*0.1, s*0.12, c); px(ctx, s*0.68, s*0.22, s*0.1, s*0.12, c); }
  else if (kind === "axe") { px(ctx, s*0.5, s*0.18, s*0.26, s*0.26, c); }
  else if (kind === "shovel") { px(ctx, s*0.4, s*0.16, s*0.22, s*0.22, c); }
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
];

// أطعمة
const FOOD_ICONS = {
  apple: (ctx, s) => { px(ctx, s*0.2, s*0.3, s*0.6, s*0.5, "#e03030"); px(ctx, s*0.25, s*0.25, s*0.12, s*0.12, "#5a3a10"); px(ctx, s*0.4, s*0.5, s*0.15, s*0.08, "#7a2a1a"); },
  bread: (ctx, s) => { px(ctx, s*0.15, s*0.35, s*0.7, s*0.5, "#dba54b"); px(ctx, s*0.2, s*0.4, s*0.6, s*0.15, "#c4923a"); },
  cooked_beef: (ctx, s) => { px(ctx, s*0.2, s*0.3, s*0.6, s*0.45, "#7a5230"); px(ctx, s*0.25, s*0.35, s*0.5, s*0.2, "#9a6a3a"); },
};

const foods = [
  ["apple", "تفاحة"], ["bread", "خبز"], ["cooked_beef", "لحم مشوي"],
];
for (const [id, label] of foods) {
  register({ id, label, maxStack: 64, placeable: false, draw: FOOD_ICONS[id], food: id === "apple" ? 4 : id === "bread" ? 5 : 8, saturation: id === "apple" ? 2.4 : id === "bread" ? 6 : 12.8 });
}
for (const [id, label] of materials) {
  register({ id, label, maxStack: 64, placeable: false, draw: MATERIAL_ICONS[id] });
}

// أدوات
for (const key in TOOLS) {
  if (key === "fist") continue;
  const t = TOOLS[key];
  register({ id: t.id, label: t.label, maxStack: 1, placeable: false, tool: t.id, kind: t.kind, tier: t.tier });
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
