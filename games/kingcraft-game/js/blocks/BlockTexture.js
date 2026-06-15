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
  // المرحلة 4: بايومز + كهوف
  "gravel", "granite", "diorite", "andesite",
  "mud", "podzol_top", "podzol_side", "clay",
  "sandstone", "ice", "snow_block", "packed_ice",
  "mossy_cobble", "obsidian", "brick", "bookshelf_side",
  "sponge", "red_flower", "yellow_flower",
  "brown_mushroom", "red_mushroom", "dead_bush", "tall_grass",
  "cactus", "cactus_top", "vine",

  // المرحلة 5: زراعة
  "farmland",
  "wheat0", "wheat1", "wheat2",
  "carrots0", "carrots1", "carrots2",
  "potatoes0", "potatoes1", "potatoes2",

  // المرحلة 5: طاولة سحر
  "enchanting_table",

  // المرحلة 6: مشاعل
  "torch",
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

  // ===== المرحلة 4: بايومز + كهوف =====
  gravel:  (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x7d7d7d, 38, 301); const r=rng(301); for(let i=0;i<6;i++){ctx.fillStyle=shade(0x4a4a4a,Math.floor((r()-0.5)*40));ctx.fillRect(ox+Math.floor(r()*14),oy+Math.floor(r()*14),2,2);} },
  granite: (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x8a6a6a, 22, 302); const r=rng(302); for(let i=0;i<4;i++){ctx.fillStyle=shade(0x6a4e4e,Math.floor((r()-0.5)*30));ctx.fillRect(ox+Math.floor(r()*12)+2,oy+Math.floor(r()*12)+2,3,3);} },
  diorite: (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0xc8c8c8, 16, 303); const r=rng(303); for(let i=0;i<8;i++){ctx.fillStyle=shade(0x2a2a2a,Math.floor((r()-0.5)*30));ctx.fillRect(ox+Math.floor(r()*14),oy+Math.floor(r()*14),1,1);} },
  andesite:(ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x76767a, 18, 304); const r=rng(304); for(let i=0;i<5;i++){ctx.fillStyle=shade(0x5a5a5e,Math.floor((r()-0.5)*20));ctx.fillRect(ox+Math.floor(r()*12)+2,oy+Math.floor(r()*12)+2,2,2);} },
  mud:     (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x4a3a2a, 26, 305); const r=rng(305); for(let i=0;i<8;i++){ctx.fillStyle=shade(0x3a2a1a,Math.floor((r()-0.5)*20));ctx.fillRect(ox+Math.floor(r()*14),oy+Math.floor(r()*14),2,2);} },
  clay:    (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x96a0a0, 14, 306); ctx.fillStyle=shade(0x7a8484,10);ctx.fillRect(ox+2,oy+2,12,12); },
  sandstone:(ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0xc8b878, 20, 307); ctx.fillStyle="#b0a060";ctx.fillRect(ox+1,oy+1,2,2);ctx.fillRect(ox+10,oy+12,3,3);ctx.fillRect(ox+5,oy+5,1,1); },
  ice:     (ctx, ox, oy) => { ctx.fillStyle="rgba(150,200,240,0.6)";ctx.fillRect(ox,oy,TILE,TILE); ctx.strokeStyle="rgba(180,220,255,0.3)";ctx.strokeRect(ox+2,oy+2,TILE-4,TILE-4); },
  snow_block:(ctx, ox, oy) => drawNoisy(ctx, ox, oy, 0xeef2f6, 8, 308),
  packed_ice:(ctx, ox, oy) => { ctx.fillStyle="rgba(160,210,250,0.7)";ctx.fillRect(ox,oy,TILE,TILE); ctx.fillStyle="rgba(200,235,255,0.3)";ctx.fillRect(ox+4,oy+4,4,4);ctx.fillRect(ox+10,oy+10,3,3); },

  podzol_top: (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x4a6a2a, 24, 309); const r=rng(309); for(let i=0;i<6;i++){ctx.fillStyle=shade(0x3a5a1a,Math.floor((r()-0.5)*20));ctx.fillRect(ox+Math.floor(r()*14),oy+Math.floor(r()*14),2,2);} },
  podzol_side: (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x6a5a3a, 22, 310); for(let x=0;x<TILE;x++){const h=2+Math.floor(rng(x+310)()*2);ctx.fillStyle=shade(0x4a6a2a,Math.floor((rng(x*3)()-0.5)*20));ctx.fillRect(ox+x,oy,1,h);} },

  mossy_cobble: (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x7d7d7d, 30, 311); const r=rng(311); for(let i=0;i<12;i++){ctx.fillStyle=shade(0x5a9c3c,Math.floor((r()-0.5)*30));ctx.fillRect(ox+Math.floor(r()*14),oy+Math.floor(r()*14),2,2);} },
  obsidian: (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x1a0a2e, 24, 312); const r=rng(312); for(let i=0;i<4;i++){const x=Math.floor(r()*12)+2;const y=Math.floor(r()*12)+2;ctx.fillStyle=shade(0x3a1a5e,Math.floor((r()-0.5)*20));ctx.fillRect(ox+x,oy+y,2,2);} },
  brick:    (ctx, ox, oy) => { const r=rng(313); ctx.fillStyle=shade(0xa04020,10);ctx.fillRect(ox,oy,TILE,TILE); ctx.fillStyle=shade(0x7a2a10,-10);for(let x=0;x<TILE;x+=8){ctx.fillRect(ox+x,oy,1,TILE);}for(let y=0;y<TILE;y+=4){const off=(Math.floor(y/4)%2)*4;ctx.fillRect(ox+off,oy+y,TILE-off,1);} },
  bookshelf_side: (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x8a6a3a, 18, 314); ctx.fillStyle=shade(0x6a4a1a,20);ctx.fillRect(ox+2,oy+2,12,4);ctx.fillRect(ox+2,oy+10,12,4); ctx.fillStyle=shade(0x9a7a4a,10);ctx.fillRect(ox+2,oy+6,12,4); },
  sponge:   (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0xa0a030, 30, 315); const r=rng(315); for(let i=0;i<20;i++){ctx.fillStyle=shade(0x808020,Math.floor((r()-0.5)*30));ctx.fillRect(ox+Math.floor(r()*14),oy+Math.floor(r()*14),2,2);} },

  red_flower: (ctx, ox, oy) => { ctx.clearRect(ox,oy,TILE,TILE); ctx.fillStyle="#30a030";ctx.fillRect(ox+7,oy+10,2,6); for(let i=0;i<4;i++){const a=i*Math.PI/4;ctx.fillStyle="#e03030";ctx.fillRect(ox+7+Math.floor(Math.sin(a)*4),oy+6+Math.floor(Math.cos(a)*4),4,4);} },
  yellow_flower: (ctx, ox, oy) => { ctx.clearRect(ox,oy,TILE,TILE); ctx.fillStyle="#30a030";ctx.fillRect(ox+7,oy+10,2,6); for(let i=0;i<4;i++){const a=i*Math.PI/4;ctx.fillStyle="#f0d020";ctx.fillRect(ox+7+Math.floor(Math.sin(a)*4),oy+6+Math.floor(Math.cos(a)*4),4,4);} },
  brown_mushroom: (ctx, ox, oy) => { ctx.clearRect(ox,oy,TILE,TILE); ctx.fillStyle="#c0a060";ctx.fillRect(ox+7,oy+10,2,5); ctx.fillStyle="#8a6030";ctx.fillRect(ox+4,oy+6,8,5);ctx.fillRect(ox+3,oy+8,10,2); },
  red_mushroom: (ctx, ox, oy) => { ctx.clearRect(ox,oy,TILE,TILE); ctx.fillStyle="#c0a060";ctx.fillRect(ox+7,oy+10,2,5); ctx.fillStyle="#e03030";ctx.fillRect(ox+4,oy+6,8,5);ctx.fillRect(ox+3,oy+8,10,2);ctx.fillStyle="#fff";ctx.fillRect(ox+5,oy+7,2,1);ctx.fillRect(ox+9,oy+8,2,1); },
  dead_bush: (ctx, ox, oy) => { ctx.clearRect(ox,oy,TILE,TILE); ctx.fillStyle="#6a5a30";ctx.fillRect(ox+7,oy+10,2,6); ctx.fillStyle="#8a7a40";ctx.fillRect(ox+5,oy+4,2,8);ctx.fillRect(ox+9,oy+3,2,8);ctx.fillRect(ox+3,oy+6,2,6); },
  tall_grass: (ctx, ox, oy) => { ctx.clearRect(ox,oy,TILE,TILE); ctx.fillStyle="#3a7a20";ctx.fillRect(ox+7,oy+10,2,6); ctx.fillStyle="#4a9a2a";ctx.fillRect(ox+5,oy+2,2,10);ctx.fillRect(ox+9,oy+4,2,8);ctx.fillRect(ox+3,oy+6,2,6);ctx.fillRect(ox+11,oy+8,2,4); },
  vine:     (ctx, ox, oy) => { ctx.clearRect(ox,oy,TILE,TILE); ctx.fillStyle="rgba(40,120,20,0.6)";ctx.fillRect(ox+3,oy,10,TILE); const r=rng(316);for(let i=0;i<6;i++){ctx.fillStyle=shade(0x2a7a1a,Math.floor((r()-0.5)*20));ctx.fillRect(ox+Math.floor(r()*12)+2,oy+Math.floor(r()*14),3,3);} },
  cactus:   (ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x2a7a2a, 22, 317); ctx.fillStyle=shade(0x1a5a1a,10);ctx.fillRect(ox,oy,1,TILE);ctx.fillRect(ox+TILE-1,oy,1,TILE);ctx.fillRect(ox,oy,TILE,1);ctx.fillRect(oy,oy+TILE-1,TILE,1);ctx.fillStyle="#3a9a3a";ctx.fillRect(ox+3,oy+2,2,2);ctx.fillRect(ox+11,oy+6,2,2);ctx.fillRect(ox+5,oy+11,2,2); },
  cactus_top:(ctx, ox, oy) => { drawNoisy(ctx, ox, oy, 0x2a7a2a, 22, 318); ctx.fillStyle=shade(0x1a5a1a,10);ctx.fillRect(ox,oy,TILE,1);ctx.fillRect(ox,oy+TILE-1,TILE,1);ctx.fillRect(ox,oy,1,TILE);ctx.fillRect(ox+TILE-1,oy,1,TILE);ctx.fillStyle="#3a9a3a";ctx.fillRect(ox+6,oy+4,4,3); },

  // ===== المرحلة 5: زراعة =====
  farmland: (ctx, ox, oy) => {
    drawNoisy(ctx, ox, oy, 0x6a4a2a, 28, 401);
    ctx.fillStyle = shade(0x5a3a1a, 10);
    for (let x = 0; x < TILE; x += 3) {
      ctx.fillRect(ox + x, oy + 2, 1, 12);
    }
    ctx.fillStyle = shade(0x7a5a3a, 5);
    ctx.fillRect(ox, oy, TILE, 2);
  },
  wheat0: (ctx, ox, oy) => {
    ctx.clearRect(ox, oy, TILE, TILE);
    ctx.fillStyle = "#5a8a2a";
    ctx.fillRect(ox + 7, oy + 10, 2, 4);
    ctx.fillStyle = "#4a7a1a";
    ctx.fillRect(ox + 6, oy + 8, 4, 3);
  },
  wheat1: (ctx, ox, oy) => {
    ctx.clearRect(ox, oy, TILE, TILE);
    ctx.fillStyle = "#5a8a2a";
    ctx.fillRect(ox + 7, oy + 8, 2, 6);
    ctx.fillStyle = "#6a9a3a";
    ctx.fillRect(ox + 5, oy + 4, 6, 5);
    ctx.fillStyle = "#8aba5a";
    ctx.fillRect(ox + 6, oy + 3, 4, 3);
  },
  wheat2: (ctx, ox, oy) => {
    ctx.clearRect(ox, oy, TILE, TILE);
    ctx.fillStyle = "#5a8a2a";
    ctx.fillRect(ox + 7, oy + 6, 2, 8);
    ctx.fillStyle = "#8aba5a";
    ctx.fillRect(ox + 3, oy + 2, 10, 6);
    ctx.fillStyle = "#d0b040";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(ox + 4 + i * 4, oy + 3 + (i % 2) * 2, 2, 2);
    }
  },
  carrots0: (ctx, ox, oy) => {
    ctx.clearRect(ox, oy, TILE, TILE);
    ctx.fillStyle = "#3a7a2a";
    ctx.fillRect(ox + 7, oy + 10, 2, 4);
    ctx.fillStyle = "#2a6a1a";
    ctx.fillRect(ox + 6, oy + 8, 4, 3);
  },
  carrots1: (ctx, ox, oy) => {
    ctx.clearRect(ox, oy, TILE, TILE);
    ctx.fillStyle = "#3a7a2a";
    ctx.fillRect(ox + 7, oy + 8, 2, 6);
    ctx.fillStyle = "#4a9a3a";
    ctx.fillRect(ox + 4, oy + 4, 8, 5);
    ctx.fillStyle = "#e06020";
    ctx.fillRect(ox + 5, oy + 12, 2, 2);
    ctx.fillRect(ox + 9, oy + 11, 2, 2);
  },
  carrots2: (ctx, ox, oy) => {
    ctx.clearRect(ox, oy, TILE, TILE);
    ctx.fillStyle = "#3a7a2a";
    ctx.fillRect(ox + 7, oy + 4, 2, 8);
    ctx.fillStyle = "#4a9a3a";
    ctx.fillRect(ox + 2, oy + 2, 12, 5);
    ctx.fillStyle = "#e06020";
    ctx.fillRect(ox + 4, oy + 10, 3, 4);
    ctx.fillRect(ox + 9, oy + 11, 3, 4);
    ctx.fillStyle = "#f08040";
    ctx.fillRect(ox + 5, oy + 11, 1, 1);
    ctx.fillRect(ox + 10, oy + 12, 1, 1);
  },
  potatoes0: (ctx, ox, oy) => {
    ctx.clearRect(ox, oy, TILE, TILE);
    ctx.fillStyle = "#4a7a2a";
    ctx.fillRect(ox + 7, oy + 10, 2, 4);
    ctx.fillStyle = "#3a6a1a";
    ctx.fillRect(ox + 6, oy + 8, 4, 3);
  },
  potatoes1: (ctx, ox, oy) => {
    ctx.clearRect(ox, oy, TILE, TILE);
    ctx.fillStyle = "#4a7a2a";
    ctx.fillRect(ox + 7, oy + 6, 2, 8);
    ctx.fillStyle = "#5a9a3a";
    ctx.fillRect(ox + 3, oy + 3, 10, 5);
    ctx.fillStyle = "#8a6a3a";
    ctx.fillRect(ox + 4, oy + 12, 3, 2);
    ctx.fillRect(ox + 9, oy + 11, 3, 2);
  },
  potatoes2: (ctx, ox, oy) => {
    ctx.clearRect(ox, oy, TILE, TILE);
    ctx.fillStyle = "#4a7a2a";
    ctx.fillRect(ox + 7, oy + 4, 2, 8);
    ctx.fillStyle = "#5a9a3a";
    ctx.fillRect(ox + 1, oy + 1, 14, 5);
    ctx.fillStyle = "#8a6a3a";
    ctx.fillRect(ox + 3, oy + 6, 4, 3);
    ctx.fillRect(ox + 9, oy + 7, 4, 3);
    ctx.fillStyle = "#a08050";
    ctx.fillRect(ox + 4, oy + 7, 1, 1);
    ctx.fillRect(ox + 10, oy + 8, 1, 1);
  },

  torch: (ctx, ox, oy) => {
    ctx.clearRect(ox, oy, TILE, TILE);
    ctx.fillStyle = "#8a6a3a";
    ctx.fillRect(ox + 6, oy + 9, 4, 6);
    ctx.fillStyle = "#6a4a2a";
    ctx.fillRect(ox + 7, oy + 10, 2, 5);
    ctx.fillStyle = "#f0d020";
    ctx.beginPath();
    ctx.ellipse(ox + 8, oy + 7, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fcf8a0";
    ctx.beginPath();
    ctx.ellipse(ox + 8, oy + 6, 2, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff8010";
    ctx.beginPath();
    ctx.ellipse(ox + 8, oy + 8, 1, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  enchanting_table: (ctx, ox, oy) => {
    // قاعدة حجرية
    drawNoisy(ctx, ox, oy, 0x6a4a3a, 22, 501);
    // حافة خشبية
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(ox, oy, TILE, 2);
    ctx.fillRect(ox, oy + TILE - 2, TILE, 2);
    ctx.fillRect(ox, oy, 2, TILE);
    ctx.fillRect(ox + TILE - 2, oy, 2, TILE);
    // كتاب في المنتصف
    ctx.fillStyle = "#c04040";
    ctx.fillRect(ox + 5, oy + 5, 6, 6);
    ctx.fillStyle = "#e06060";
    ctx.fillRect(ox + 5, oy + 5, 3, 3);
    ctx.fillRect(ox + 8, oy + 8, 3, 3);
    // زخرفة ذهبية
    ctx.fillStyle = "#f6cb3a";
    ctx.fillRect(ox + 3, oy + 3, 1, 1);
    ctx.fillRect(ox + TILE - 4, oy + 3, 1, 1);
    ctx.fillRect(ox + 3, oy + TILE - 4, 1, 1);
    ctx.fillRect(ox + TILE - 4, oy + TILE - 4, 1, 1);
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
