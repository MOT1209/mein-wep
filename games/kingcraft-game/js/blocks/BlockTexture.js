// رسم أنسجة البلوكات بكسل-آرت برمجياً (بدون صور خارجية) ودمجها في أطلس واحد.
import * as THREE from "three";

const TILE = 16;           // دقة البلاطة الواحدة بالبكسل
const ATLAS_COLS = 8;      // عدد الأعمدة في الأطلس

// قائمة البلاطات المعرّفة. الترتيب يحدد موقعها في الأطلس.
const TILE_NAMES = [
  "grass_top", "grass_side", "dirt", "stone", "sand",
  "wood_top", "wood_side", "leaves", "planks", "cobble",
  "snow", "water", "glass",
  // المرحلة 2
  "coal_ore", "iron_ore", "gold_ore", "diamond_ore",
  "furnace_top", "furnace_side", "furnace_front",
  "table_top", "table_side",
  "iron_block", "gold_block", "diamond_block",
];

// مولّد عشوائي بسيط ثابت لكل بلاطة (لنمط متّسق)
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

// تظليل لون بنسبة معينة
function shade(hex, amt) {
  const r = Math.max(0, Math.min(255, ((hex >> 16) & 255) + amt));
  const g = Math.max(0, Math.min(255, ((hex >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (hex & 255) + amt));
  return `rgb(${r|0},${g|0},${b|0})`;
}

// يرسم بلاطة بنمط نويز نقطي حول لون أساسي
function drawNoisy(ctx, ox, oy, base, spread, seed) {
  const rand = rng(seed);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const amt = Math.floor((rand() - 0.5) * spread);
      ctx.fillStyle = shade(base, amt);
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

// خام: قاعدة حجر + بقع لون الخام
function drawOre(ctx, ox, oy, oreColor, seed) {
  drawNoisy(ctx, ox, oy, 0x888888, 28, 33);
  const rand = rng(seed);
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(rand() * (TILE - 2));
    const y = Math.floor(rand() * (TILE - 2));
    const s = 1 + Math.floor(rand() * 2);
    ctx.fillStyle = shade(oreColor, Math.floor((rand() - 0.5) * 30));
    ctx.fillRect(ox + x, oy + y, s, s);
  }
}

const TILE_DRAW = {
  grass_top: (ctx, ox, oy) => drawNoisy(ctx, ox, oy, 0x5a9c3c, 36, 11),
  dirt:      (ctx, ox, oy) => drawNoisy(ctx, ox, oy, 0x8a5a36, 30, 22),
  stone:     (ctx, ox, oy) => drawNoisy(ctx, ox, oy, 0x888888, 28, 33),
  sand:      (ctx, ox, oy) => drawNoisy(ctx, ox, oy, 0xe0d49a, 22, 44),
  cobble:    (ctx, ox, oy) => drawNoisy(ctx, ox, oy, 0x7d7d7d, 44, 77),
  planks:    (ctx, ox, oy) => {
    drawNoisy(ctx, ox, oy, 0xb1844c, 18, 55);
    ctx.fillStyle = shade(0xb1844c, -40);
    for (let y = 0; y < TILE; y += 4) ctx.fillRect(ox, oy + y, TILE, 1);
    ctx.fillRect(ox + 7, oy, 1, TILE);
  },
  snow:      (ctx, ox, oy) => drawNoisy(ctx, ox, oy, 0xf3f7fb, 12, 66),
  leaves:    (ctx, ox, oy) => drawNoisy(ctx, ox, oy, 0x3f7d2e, 40, 88),
  water:     (ctx, ox, oy) => drawNoisy(ctx, ox, oy, 0x3a6ea8, 16, 99),
  glass:     (ctx, ox, oy) => {
    ctx.clearRect(ox, oy, TILE, TILE);
    ctx.strokeStyle = "rgba(210,235,250,0.9)";
    ctx.strokeRect(ox + 0.5, oy + 0.5, TILE - 1, TILE - 1);
    ctx.fillStyle = "rgba(180,220,245,0.25)";
    ctx.fillRect(ox + 2, oy + 2, 4, 4);
  },
  wood_top:  (ctx, ox, oy) => {
    drawNoisy(ctx, ox, oy, 0xb6975a, 16, 111);
    ctx.fillStyle = shade(0xb6975a, -38);
    ctx.beginPath();
    ctx.arc(ox + 8, oy + 8, 5, 0, Math.PI * 2);
    ctx.stroke();
  },
  wood_side: (ctx, ox, oy) => {
    drawNoisy(ctx, ox, oy, 0x6b5230, 20, 122);
    ctx.fillStyle = shade(0x6b5230, 26);
    for (let x = 1; x < TILE; x += 5) ctx.fillRect(ox + x, oy, 1, TILE);
  },
  grass_side: (ctx, ox, oy) => {
    drawNoisy(ctx, ox, oy, 0x8a5a36, 30, 22);   // تراب
    // شريط العشب العلوي
    for (let x = 0; x < TILE; x++) {
      const h = 3 + Math.floor(rng(x + 7)() * 3);
      ctx.fillStyle = shade(0x5a9c3c, Math.floor((rng(x * 3)() - 0.5) * 30));
      ctx.fillRect(ox + x, oy, 1, h);
    }
  },

  // ===== المرحلة 2 =====
  coal_ore:    (ctx, ox, oy) => drawOre(ctx, ox, oy, 0x2b2b2b, 201),
  iron_ore:    (ctx, ox, oy) => drawOre(ctx, ox, oy, 0xd8a884, 202),
  gold_ore:    (ctx, ox, oy) => drawOre(ctx, ox, oy, 0xf6cb3a, 203),
  diamond_ore: (ctx, ox, oy) => drawOre(ctx, ox, oy, 0x4fe6e0, 204),

  iron_block:    (ctx, ox, oy) => drawNoisy(ctx, ox, oy, 0xd6d6d6, 14, 211),
  gold_block:    (ctx, ox, oy) => drawNoisy(ctx, ox, oy, 0xf6cb3a, 16, 212),
  diamond_block: (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x4fe6e0, 18, 213); ctx.fillStyle = "#bff7f5"; ctx.fillRect(ox+5, oy+5, 2, 2); ctx.fillRect(ox+10, oy+9, 2, 2); },

  furnace_top: (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x7d7d7d, 30, 221); ctx.fillStyle = "#555"; ctx.fillRect(ox+5, oy+5, 6, 6); },
  furnace_side: (ctx, ox, oy) => drawNoisy(ctx, ox, oy, 0x7d7d7d, 30, 222),
  furnace_front: (ctx, ox, oy) => {
    drawNoisy(ctx, ox, oy, 0x7d7d7d, 26, 223);
    ctx.fillStyle = "#222"; ctx.fillRect(ox+4, oy+7, 8, 6);          // فتحة
    ctx.fillStyle = "#3a3a3a"; ctx.fillRect(ox+5, oy+3, 6, 2);       // شبكة علوية
  },

  table_top: (ctx, ox, oy) => {
    drawNoisy(ctx, ox, oy, 0xb1844c, 16, 231);
    ctx.strokeStyle = shade(0xb1844c, -50);
    ctx.strokeRect(ox+0.5, oy+0.5, TILE-1, TILE-1);
    ctx.beginPath(); ctx.moveTo(ox+TILE/2, oy); ctx.lineTo(ox+TILE/2, oy+TILE);
    ctx.moveTo(ox, oy+TILE/2); ctx.lineTo(ox+TILE, oy+TILE/2); ctx.stroke();
  },
  table_side: (ctx, ox, oy) => {
    drawNoisy(ctx, ox, oy, 0x9a7038, 18, 232);
    ctx.fillStyle = shade(0x9a7038, 30);
    ctx.fillRect(ox+2, oy+2, 5, 5); ctx.fillRect(ox+9, oy+2, 5, 5);
  },
};

let _atlasTexture = null;
const _uv = {};      // name -> {u0,v0,u1,v1}
const _tileCanvas = {}; // name -> canvas (للأيقونات)

export function buildAtlas() {
  if (_atlasTexture) return _atlasTexture;

  const rows = Math.ceil(TILE_NAMES.length / ATLAS_COLS);
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_COLS * TILE;
  canvas.height = rows * TILE;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  TILE_NAMES.forEach((name, i) => {
    const col = i % ATLAS_COLS;
    const row = Math.floor(i / ATLAS_COLS);
    const ox = col * TILE;
    const oy = row * TILE;
    (TILE_DRAW[name] || TILE_DRAW.stone)(ctx, ox, oy);

    // هامش UV صغير لتفادي التسرّب بين البلاطات
    const pad = 0.5 / canvas.width;
    const padY = 0.5 / canvas.height;
    _uv[name] = {
      u0: col / ATLAS_COLS + pad,
      u1: (col + 1) / ATLAS_COLS - pad,
      v0: 1 - (row + 1) / rows + padY,
      v1: 1 - row / rows - padY,
    };

    // نسخة منفصلة للأيقونة
    const tc = document.createElement("canvas");
    tc.width = TILE; tc.height = TILE;
    tc.getContext("2d").drawImage(canvas, ox, oy, TILE, TILE, 0, 0, TILE, TILE);
    _tileCanvas[name] = tc;
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  _atlasTexture = tex;
  return tex;
}

export function getUV(tileName) {
  return _uv[tileName] || _uv.stone;
}

export function getTileCanvas(tileName) {
  return _tileCanvas[tileName] || _tileCanvas.stone;
}
