import * as THREE from "three";
import { ATLAS_TILE_PIXELS, ATLAS_TILES_PER_ROW } from "../config";
import { blockById } from "../content/blocks";
import { Rng } from "../core/rng";
import { FACE_NY, FACE_NZ, FACE_PY } from "../voxels/mesher";

export interface AtlasCtx {
  fillStyle: string | CanvasGradient | CanvasPattern;
  fillRect(x: number, y: number, w: number, h: number): void;
  clearRect(x: number, y: number, w: number, h: number): void;
}

type Painter = (ctx: AtlasCtx, px: number, py: number) => void;

interface PainterEntry {
  readonly name: string;
  readonly draw: Painter;
}

const TILE = ATLAS_TILE_PIXELS;

const RIVETS: readonly (readonly [number, number])[] = [
  [2, 2],
  [13, 2],
  [2, 13],
  [13, 13]
];

function seedOf(name: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rngOf(name: string): Rng {
  return new Rng(seedOf(name));
}

function fill(ctx: AtlasCtx, px: number, py: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(px, py, TILE, TILE);
}

function rect(ctx: AtlasCtx, px: number, py: number, x: number, y: number, w: number, h: number, color: string): void {
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(TILE, x + w);
  const y1 = Math.min(TILE, y + h);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = color;
  ctx.fillRect(px + x0, py + y0, x1 - x0, y1 - y0);
}

function dot(ctx: AtlasCtx, px: number, py: number, x: number, y: number, color: string): void {
  rect(ctx, px, py, x, y, 1, 1, color);
}

function speckle(ctx: AtlasCtx, px: number, py: number, rng: Rng, shades: readonly string[], count: number): void {
  for (let i = 0; i < count; i++) dot(ctx, px, py, rng.nextInt(TILE), rng.nextInt(TILE), rng.pick(shades));
}

function scatter(ctx: AtlasCtx, px: number, py: number, rng: Rng, shades: readonly string[], density: number): void {
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      if (rng.next() < density) dot(ctx, px, py, x, y, rng.pick(shades));
    }
  }
}

function noiseEntry(name: string, base: string, shades: readonly string[], density: number): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, base);
      scatter(ctx, px, py, rngOf(name), shades, density);
    }
  };
}

function brickEntry(name: string, mortar: string, brick: string, edge: string, light: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, mortar);
      const rng = rngOf(name);
      for (let row = 0; row < 4; row++) {
        const y = row * 4;
        const offset = row % 2 === 0 ? 0 : -4;
        for (let bx = offset; bx < TILE; bx += 8) {
          rect(ctx, px, py, bx, y, 7, 3, brick);
          rect(ctx, px, py, bx, y + 2, 7, 1, edge);
          if (rng.chance(0.5)) rect(ctx, px, py, bx, y, 7, 1, light);
        }
      }
    }
  };
}

function cobbleEntry(name: string, mortar: string, shades: readonly string[]): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, mortar);
      const rng = rngOf(name);
      for (let row = 0; row < 4; row++) {
        const y = row * 4;
        const offset = row % 2 === 0 ? 0 : -3;
        for (let bx = offset; bx < TILE + 1; bx += 7) {
          const w = 5 + rng.nextInt(2);
          rect(ctx, px, py, bx, y, w, 3, rng.pick(shades));
          rect(ctx, px, py, bx, y, w, 1, rng.pick(shades));
        }
      }
    }
  };
}

function oreEntry(
  name: string,
  base: string,
  stoneShades: readonly string[],
  oreDark: string,
  oreMid: string,
  oreLight: string
): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, base);
      const rng = rngOf(name);
      scatter(ctx, px, py, rng, stoneShades, 0.28);
      const spots = 4 + rng.nextInt(3);
      for (let i = 0; i < spots; i++) {
        const ox = 1 + rng.nextInt(11);
        const oy = 1 + rng.nextInt(11);
        const w = 2 + rng.nextInt(2);
        const h = 2 + rng.nextInt(2);
        rect(ctx, px, py, ox, oy, w, h, oreDark);
        rect(ctx, px, py, ox, oy, w, 1, oreMid);
        if (rng.chance(0.5)) dot(ctx, px, py, ox, oy, oreLight);
      }
    }
  };
}

function edgeEntry(
  name: string,
  soil: string,
  soilShades: readonly string[],
  cover: string,
  coverDark: string,
  coverLight: string
): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, soil);
      const rng = rngOf(name);
      scatter(ctx, px, py, rng, soilShades, 0.35);
      for (let x = 0; x < TILE; x++) {
        const depth = 3 + rng.nextInt(3);
        rect(ctx, px, py, x, 0, 1, depth, cover);
        dot(ctx, px, py, x, depth, coverDark);
        if (rng.chance(0.3)) dot(ctx, px, py, x, 1, coverLight);
      }
    }
  };
}

function plankEntry(name: string, base: string, seam: string, grain: string, light: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, base);
      const rng = rngOf(name);
      for (let board = 0; board < 4; board++) {
        const y = board * 4;
        rect(ctx, px, py, 0, y + 3, TILE, 1, seam);
        for (let i = 0; i < 3; i++) {
          const x = rng.nextInt(TILE - 3);
          rect(ctx, px, py, x, y + rng.nextInt(3), 2 + rng.nextInt(3), 1, rng.chance(0.5) ? grain : light);
        }
      }
    }
  };
}

function logSideEntry(name: string, base: string, dark: string, light: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, base);
      const rng = rngOf(name);
      for (let x = 0; x < TILE; x++) {
        const r = rng.next();
        if (r < 0.3) {
          rect(ctx, px, py, x, rng.nextInt(8), 1, 6 + rng.nextInt(10), dark);
        } else if (r < 0.55) {
          rect(ctx, px, py, x, rng.nextInt(10), 1, 4 + rng.nextInt(8), light);
        }
      }
      rect(ctx, px, py, 0, 0, 1, TILE, dark);
      rect(ctx, px, py, TILE - 1, 0, 1, TILE, light);
    }
  };
}

function logTopEntry(name: string, ring: string, ringAlt: string, core: string, bark: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, bark);
      for (let y = 0; y < TILE; y++) {
        for (let x = 0; x < TILE; x++) {
          const dx = x - 7.5;
          const dy = y - 7.5;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d <= 6.5) {
            if (d < 1.5) dot(ctx, px, py, x, y, core);
            else dot(ctx, px, py, x, y, Math.floor(d) % 2 === 0 ? ring : ringAlt);
          }
        }
      }
    }
  };
}

function woolEntry(name: string, base: string, shade: string, fleck: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, base);
      const rng = rngOf(name);
      for (let y = 0; y < TILE; y += 2) {
        for (let x = (y / 2) % 2; x < TILE; x += 2) {
          if (rng.chance(0.75)) rect(ctx, px, py, x, y, 2, 2, shade);
        }
      }
      speckle(ctx, px, py, rng, [fleck], 8);
    }
  };
}

function metalEntry(name: string, base: string, light: string, dark: string, patina?: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, base);
      const rng = rngOf(name);
      for (let y = 0; y < TILE; y += 2) {
        rect(ctx, px, py, 0, y, TILE, 1, rng.chance(0.5) ? light : dark);
      }
      for (const [rx, ry] of RIVETS) {
        dot(ctx, px, py, rx, ry, light);
        dot(ctx, px, py, rx + 1, ry, dark);
      }
      if (patina) speckle(ctx, px, py, rng, [patina], 10);
    }
  };
}

function glassEntry(name: string, tint: string, edge: string, glare: string, mark?: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, tint);
      rect(ctx, px, py, 0, 0, TILE, 1, edge);
      rect(ctx, px, py, 0, TILE - 1, TILE, 1, edge);
      rect(ctx, px, py, 0, 0, 1, TILE, edge);
      rect(ctx, px, py, TILE - 1, 0, 1, TILE, edge);
      rect(ctx, px, py, 2, 2, 1, 5, glare);
      rect(ctx, px, py, 3, 2, 1, 3, glare);
      rect(ctx, px, py, 11, 9, 1, 4, glare);
      if (mark) {
        dot(ctx, px, py, 11, 3, mark);
        dot(ctx, px, py, 10, 3, mark);
        dot(ctx, px, py, 12, 3, mark);
        dot(ctx, px, py, 11, 2, mark);
        dot(ctx, px, py, 11, 4, mark);
        dot(ctx, px, py, 4, 11, mark);
        dot(ctx, px, py, 3, 11, mark);
        dot(ctx, px, py, 5, 11, mark);
      }
    }
  };
}

function waterEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, "#3a6ea8");
      const rng = rngOf(name);
      for (let i = 0; i < 10; i++) {
        const y = rng.nextInt(TILE);
        const x = rng.nextInt(TILE - 6);
        rect(ctx, px, py, x, y, 4 + rng.nextInt(4), 1, rng.chance(0.5) ? "#4a80bc" : "#2e5c90");
      }
      for (let i = 0; i < 6; i++) dot(ctx, px, py, rng.nextInt(TILE), rng.nextInt(TILE), "#5a90cc");
    }
  };
}

function gravelEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, "#8a8378");
      const rng = rngOf(name);
      for (let i = 0; i < 24; i++) {
        const x = rng.nextInt(TILE);
        const y = rng.nextInt(TILE);
        rect(ctx, px, py, x, y, 1 + rng.nextInt(2), 1 + rng.nextInt(2), rng.pick(["#9a938a", "#6e675e", "#7d766d", "#a49c92"]));
      }
    }
  };
}

function sandstoneSideEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, "#d8c890");
      rect(ctx, px, py, 0, 2, TILE, 1, "#d0bc7e");
      rect(ctx, px, py, 0, 5, TILE, 2, "#e0d0a0");
      rect(ctx, px, py, 0, 9, TILE, 1, "#cbb878");
      rect(ctx, px, py, 0, 12, TILE, 2, "#d5c488");
      speckle(ctx, px, py, rngOf(name), ["#efe4b8"], 12);
    }
  };
}

function bedrockEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, "#3a3a3e");
      const rng = rngOf(name);
      for (let i = 0; i < 16; i++) {
        rect(ctx, px, py, rng.nextInt(14), rng.nextInt(14), 2 + rng.nextInt(2), 2 + rng.nextInt(2), rng.pick(["#2a2a2e", "#4a4a50", "#323236", "#444448"]));
      }
    }
  };
}

function iceEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, "#a8d4f0");
      const rng = rngOf(name);
      for (let i = 0; i < 9; i++) {
        rect(ctx, px, py, rng.nextInt(8), rng.nextInt(TILE), 4 + rng.nextInt(6), 1, rng.chance(0.5) ? "#c2e4f8" : "#8fc0e0");
      }
      speckle(ctx, px, py, rng, ["#e0f2fc"], 8);
    }
  };
}

function glowcrystalEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, "#1f9a90");
      const rng = rngOf(name);
      for (let i = 0; i < 5; i++) {
        rect(ctx, px, py, 1 + rng.nextInt(10), 1 + rng.nextInt(10), 3 + rng.nextInt(4), 3 + rng.nextInt(4), rng.pick(["#2ab5a8", "#188a80", "#35c8ba"]));
      }
      speckle(ctx, px, py, rng, ["#8af0e4", "#d0fff8"], 10);
    }
  };
}

function crystalBlockEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      const rng = rngOf(name);
      for (let y = 0; y < TILE; y++) {
        for (let x = 0; x < TILE; x++) {
          const band = (x * 2 + y) % 7;
          const color = band < 1 ? "#c8bef8" : band < 3 ? "#8a7ad0" : band < 5 ? "#6a5ab0" : "#5a4a9a";
          dot(ctx, px, py, x, y, color);
        }
      }
      speckle(ctx, px, py, rng, ["#e0d8ff"], 8);
    }
  };
}

function aurumBlockEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      const rng = rngOf(name);
      for (let y = 0; y < TILE; y++) {
        for (let x = 0; x < TILE; x++) {
          const band = (x + y) % 6;
          const color = band < 1 ? "#f0d060" : band < 3 ? "#d4af37" : band < 5 ? "#b89028" : "#c9a430";
          dot(ctx, px, py, x, y, color);
        }
      }
      speckle(ctx, px, py, rng, ["#ffe890"], 6);
    }
  };
}

function emberlightEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, "#ff9a30");
      const rng = rngOf(name);
      scatter(ctx, px, py, rng, ["#ffb45a", "#ff8a20", "#ffd070"], 0.5);
      rect(ctx, px, py, 4, 4, 8, 8, "#ffd060");
      rect(ctx, px, py, 6, 6, 4, 4, "#fff0c0");
    }
  };
}

function mossyStoneEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, "#55585a");
      const rng = rngOf(name);
      for (let row = 0; row < 4; row++) {
        const y = row * 4;
        const offset = row % 2 === 0 ? 0 : -4;
        for (let bx = offset; bx < TILE; bx += 8) {
          rect(ctx, px, py, bx, y, 7, 3, rng.chance(0.5) ? "#7d7d7b" : "#787876");
          rect(ctx, px, py, bx, y + 2, 7, 1, "#686866");
        }
      }
      for (let i = 0; i < 9; i++) {
        rect(ctx, px, py, rng.nextInt(12), rng.nextInt(12), 2 + rng.nextInt(3), 2 + rng.nextInt(2), rng.pick(["#4a8a34", "#3f7a2c", "#5a9a44"]));
      }
    }
  };
}

function emberstoneEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, "#4a2e22");
      const rng = rngOf(name);
      scatter(ctx, px, py, rng, ["#5a3830", "#3a2218", "#63382c"], 0.4);
      for (let i = 0; i < 6; i++) {
        let cx = rng.nextInt(TILE);
        let cy = rng.nextInt(TILE);
        const len = 4 + rng.nextInt(5);
        for (let s = 0; s < len; s++) {
          dot(ctx, px, py, cx, cy, rng.chance(0.5) ? "#ff7a2f" : "#ffb45a");
          cx += rng.nextInt(3) - 1;
          cy += rng.nextInt(2);
        }
      }
    }
  };
}

function emberstoneBricksEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, "#5a3226");
      const rng = rngOf(name);
      for (let row = 0; row < 4; row++) {
        const y = row * 4;
        const offset = row % 2 === 0 ? 0 : -4;
        for (let bx = offset; bx < TILE; bx += 8) {
          rect(ctx, px, py, bx, y, 7, 3, rng.chance(0.5) ? "#6a3c2c" : "#5f3628");
          rect(ctx, px, py, bx, y + 2, 7, 1, "#3f2418");
        }
      }
      for (let i = 0; i < 4; i++) {
        let cx = rng.nextInt(TILE);
        let cy = rng.nextInt(TILE);
        const len = 3 + rng.nextInt(4);
        for (let s = 0; s < len; s++) {
          dot(ctx, px, py, cx, cy, rng.chance(0.5) ? "#ff7a2f" : "#ffb45a");
          cx += rng.nextInt(3) - 1;
          cy += rng.nextInt(2);
        }
      }
    }
  };
}

function farmlandEntry(name: string, base: string, line: string, light: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, base);
      for (const y of [2, 6, 10, 14]) rect(ctx, px, py, 0, y, TILE, 1, line);
      speckle(ctx, px, py, rngOf(name), [light], 18);
    }
  };
}

function furnaceFrontEntry(name: string, lit: boolean): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, "#6a6a6e");
      const rng = rngOf(name);
      scatter(ctx, px, py, rng, ["#5f5f63", "#757579"], 0.3);
      rect(ctx, px, py, 4, 5, 8, 8, "#2e2e32");
      rect(ctx, px, py, 5, 4, 6, 1, "#2e2e32");
      if (lit) {
        rect(ctx, px, py, 5, 9, 6, 4, "#ff7a20");
        rect(ctx, px, py, 6, 8, 4, 4, "#ff9a30");
        rect(ctx, px, py, 7, 10, 2, 3, "#ffd060");
        dot(ctx, px, py, 8, 11, "#fff0b0");
        dot(ctx, px, py, 5, 8, "#ffb45a");
        dot(ctx, px, py, 10, 8, "#ffb45a");
      } else {
        for (let y = 7; y < 13; y += 2) rect(ctx, px, py, 5, y, 6, 1, "#1f1f23");
      }
    }
  };
}

function cactusSideEntry(name: string): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      fill(ctx, px, py, "#4a9a3a");
      const rng = rngOf(name);
      for (let x = 2; x < TILE; x += 4) rect(ctx, px, py, x, 0, 1, TILE, "#3a7e2c");
      for (let x = 0; x < TILE; x++) {
        if (rng.chance(0.25)) dot(ctx, px, py, x, rng.nextInt(TILE), "#e8e0a0");
      }
    }
  };
}

function wheatEntry(name: string, stage: number): PainterEntry {
  return {
    name,
    draw(ctx, px, py) {
      const rng = rngOf(name);
      const stalk = stage === 3 ? "#b08830" : stage === 2 ? "#7aa83c" : "#5aa03c";
      const head = stage === 3 ? "#d8b040" : "#8ab040";
      const count = 3 + stage;
      for (let i = 0; i < count; i++) {
        const x = 2 + i * 3 + rng.nextInt(2);
        const h = 3 + stage * 3 + rng.nextInt(3);
        const y = TILE - h;
        rect(ctx, px, py, x, y, 1, h, stalk);
        if (stage >= 2) {
          rect(ctx, px, py, x - 1, y, 3, 2, head);
          if (stage === 3) dot(ctx, px, py, x, y - 1, head);
        }
      }
    }
  };
}

function flowerPainter(petal: string, petalLight: string, center: string): Painter {
  return (ctx, px, py) => {
    rect(ctx, px, py, 7, 8, 2, 8, "#3f7a2c");
    rect(ctx, px, py, 5, 10, 2, 1, "#3f7a2c");
    rect(ctx, px, py, 9, 12, 2, 1, "#3f7a2c");
    rect(ctx, px, py, 5, 3, 6, 5, petal);
    rect(ctx, px, py, 6, 2, 4, 7, petal);
    rect(ctx, px, py, 6, 4, 2, 2, petalLight);
    rect(ctx, px, py, 7, 5, 2, 2, center);
  };
}

function mushroomPainter(cap: string, capLight: string, spot: string, stem: string): Painter {
  return (ctx, px, py) => {
    rect(ctx, px, py, 7, 9, 2, 7, stem);
    rect(ctx, px, py, 4, 5, 8, 4, cap);
    rect(ctx, px, py, 5, 4, 6, 1, cap);
    rect(ctx, px, py, 5, 5, 3, 1, capLight);
    dot(ctx, px, py, 6, 6, spot);
    dot(ctx, px, py, 9, 6, spot);
    dot(ctx, px, py, 8, 7, spot);
  };
}

function saplingPainter(trunk: string, canopy: string, canopyDark: string, pine: boolean): Painter {
  return (ctx, px, py) => {
    rect(ctx, px, py, 7, 9, 2, 7, trunk);
    if (pine) {
      rect(ctx, px, py, 7, 1, 2, 2, canopy);
      rect(ctx, px, py, 6, 3, 4, 2, canopy);
      rect(ctx, px, py, 5, 5, 6, 2, canopy);
      rect(ctx, px, py, 4, 7, 8, 3, canopy);
      dot(ctx, px, py, 6, 4, canopyDark);
      dot(ctx, px, py, 9, 6, canopyDark);
      dot(ctx, px, py, 5, 8, canopyDark);
    } else {
      rect(ctx, px, py, 5, 3, 6, 1, canopy);
      rect(ctx, px, py, 4, 4, 8, 2, canopy);
      rect(ctx, px, py, 3, 6, 10, 4, canopy);
      rect(ctx, px, py, 5, 10, 6, 1, canopy);
      dot(ctx, px, py, 6, 5, canopyDark);
      dot(ctx, px, py, 9, 6, canopyDark);
      dot(ctx, px, py, 5, 8, canopyDark);
      dot(ctx, px, py, 10, 7, canopyDark);
    }
  };
}

function dewberryPainter(berries: boolean): Painter {
  return (ctx, px, py) => {
    rect(ctx, px, py, 3, 6, 10, 5, "#3f7a2c");
    rect(ctx, px, py, 5, 4, 6, 2, "#4a8e30");
    rect(ctx, px, py, 4, 11, 8, 2, "#356a24");
    if (berries) {
      dot(ctx, px, py, 5, 7, "#4060d0");
      dot(ctx, px, py, 6, 7, "#4060d0");
      dot(ctx, px, py, 9, 8, "#6080f0");
      dot(ctx, px, py, 10, 8, "#6080f0");
      dot(ctx, px, py, 7, 10, "#4060d0");
      dot(ctx, px, py, 8, 10, "#7090ff");
    } else {
      rect(ctx, px, py, 6, 6, 1, 2, "#7a5a34");
      rect(ctx, px, py, 9, 7, 1, 2, "#7a5a34");
      dot(ctx, px, py, 7, 9, "#8a6a44");
    }
  };
}

function iciclePainter(ctx: AtlasCtx, px: number, py: number): void {
  rect(ctx, px, py, 5, 0, 6, 2, "#d0ecfa");
  rect(ctx, px, py, 6, 2, 4, 3, "#d0ecfa");
  rect(ctx, px, py, 7, 5, 2, 5, "#d0ecfa");
  rect(ctx, px, py, 7, 10, 1, 3, "#d0ecfa");
  rect(ctx, px, py, 6, 2, 1, 4, "#ffffff");
  rect(ctx, px, py, 9, 1, 1, 4, "#a8d0e8");
}

function cactusTopPainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#3f8a30");
  rect(ctx, px, py, 1, 1, 14, 14, "#4a9a3a");
  rect(ctx, px, py, 3, 3, 10, 10, "#56a844");
  rect(ctx, px, py, 6, 6, 4, 4, "#66b854");
  dot(ctx, px, py, 7, 7, "#8ad078");
}

function tallGrassPainter(ctx: AtlasCtx, px: number, py: number): void {
  const blades: readonly (readonly [number, number, string])[] = [
    [3, 9, "#4a8e30"],
    [5, 12, "#5aa03c"],
    [7, 10, "#3f7a2c"],
    [8, 13, "#5aa03c"],
    [10, 11, "#4a8e30"],
    [12, 8, "#3f7a2c"]
  ];
  for (const [x, h, c] of blades) rect(ctx, px, py, x, TILE - h, 1, h, c);
}

function deadBushPainter(ctx: AtlasCtx, px: number, py: number): void {
  rect(ctx, px, py, 7, 10, 1, 6, "#7a5a34");
  rect(ctx, px, py, 3, 8, 1, 4, "#6a4c2a");
  rect(ctx, px, py, 11, 7, 1, 5, "#6a4c2a");
  rect(ctx, px, py, 5, 5, 1, 4, "#7a5a34");
  rect(ctx, px, py, 9, 4, 1, 5, "#7a5a34");
  rect(ctx, px, py, 6, 4, 1, 3, "#8a6a44");
  rect(ctx, px, py, 10, 5, 1, 3, "#8a6a44");
}

function torchPainter(ctx: AtlasCtx, px: number, py: number): void {
  rect(ctx, px, py, 7, 7, 2, 9, "#7a5a34");
  rect(ctx, px, py, 7, 7, 1, 9, "#8a6a44");
  rect(ctx, px, py, 6, 3, 4, 4, "#ff9a30");
  rect(ctx, px, py, 7, 2, 2, 3, "#ffd060");
  rect(ctx, px, py, 7, 1, 2, 1, "#fff0b0");
  dot(ctx, px, py, 6, 4, "#ffc860");
  dot(ctx, px, py, 9, 4, "#ff7a20");
}

function glowshroomPainter(ctx: AtlasCtx, px: number, py: number): void {
  rect(ctx, px, py, 7, 8, 2, 8, "#9adfd8");
  rect(ctx, px, py, 4, 4, 8, 4, "#5ec4d4");
  rect(ctx, px, py, 5, 3, 6, 1, "#5ec4d4");
  rect(ctx, px, py, 5, 5, 6, 2, "#7ad8e4");
  dot(ctx, px, py, 6, 5, "#c8f6ff");
  dot(ctx, px, py, 9, 6, "#c8f6ff");
  dot(ctx, px, py, 7, 6, "#e6fbff");
  dot(ctx, px, py, 7, 12, "#7ad8e4");
}

function furnaceTopPainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#5f5f63");
  rect(ctx, px, py, 1, 1, 14, 14, "#4a4a4e");
  rect(ctx, px, py, 2, 2, 12, 12, "#5a5a5e");
  rect(ctx, px, py, 6, 6, 4, 4, "#3a3a3e");
}

function furnaceSidePainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#6a6a6e");
  rect(ctx, px, py, 0, 0, TILE, 1, "#5a5a5e");
  rect(ctx, px, py, 0, 5, TILE, 1, "#565656");
  rect(ctx, px, py, 0, 10, TILE, 1, "#565656");
  rect(ctx, px, py, 3, 3, 10, 2, "#4a4a4e");
  rect(ctx, px, py, 3, 12, 10, 2, "#4a4a4e");
}

function craftingTableTopPainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#b08c54");
  rect(ctx, px, py, 0, 5, TILE, 1, "#6e4f2e");
  rect(ctx, px, py, 0, 10, TILE, 1, "#6e4f2e");
  rect(ctx, px, py, 5, 0, 1, TILE, "#6e4f2e");
  rect(ctx, px, py, 10, 0, 1, TILE, "#6e4f2e");
  rect(ctx, px, py, 1, 1, 3, 3, "#c0a070");
  rect(ctx, px, py, 11, 11, 4, 4, "#9a7a48");
}

function craftingTableSidePainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#a8804c");
  rect(ctx, px, py, 0, 5, TILE, 1, "#8a6839");
  rect(ctx, px, py, 0, 11, TILE, 1, "#8a6839");
  rect(ctx, px, py, 2, 6, 12, 6, "#7a5a34");
  rect(ctx, px, py, 3, 7, 10, 1, "#b0b0b8");
  rect(ctx, px, py, 12, 6, 2, 3, "#6e4f2e");
}

function craftingTableFrontPainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#b08c54");
  rect(ctx, px, py, 0, 5, TILE, 1, "#8a6839");
  rect(ctx, px, py, 0, 11, TILE, 1, "#8a6839");
  rect(ctx, px, py, 2, 3, 5, 4, "#9a7a48");
  rect(ctx, px, py, 9, 3, 5, 4, "#9a7a48");
  rect(ctx, px, py, 2, 3, 5, 1, "#6e4f2e");
  rect(ctx, px, py, 9, 3, 5, 1, "#6e4f2e");
  dot(ctx, px, py, 4, 5, "#d8c070");
  dot(ctx, px, py, 11, 5, "#d8c070");
}

function chestTopPainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#a8804c");
  rect(ctx, px, py, 0, 0, TILE, 1, "#6e4f2e");
  rect(ctx, px, py, 0, TILE - 1, TILE, 1, "#6e4f2e");
  rect(ctx, px, py, 0, 0, 1, TILE, "#6e4f2e");
  rect(ctx, px, py, TILE - 1, 0, 1, TILE, "#6e4f2e");
  rect(ctx, px, py, 0, 7, TILE, 1, "#8a6839");
  rect(ctx, px, py, 1, 1, 3, 1, "#c8a06a");
}

function chestSidePainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#a8804c");
  rect(ctx, px, py, 0, 5, TILE, 1, "#8a6839");
  rect(ctx, px, py, 0, 11, TILE, 1, "#8a6839");
  rect(ctx, px, py, 0, 7, TILE, 3, "#5a4a3a");
  dot(ctx, px, py, 2, 8, "#8a7a60");
  dot(ctx, px, py, 13, 8, "#8a7a60");
}

function chestFrontPainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#a8804c");
  rect(ctx, px, py, 0, 5, TILE, 1, "#8a6839");
  rect(ctx, px, py, 0, 11, TILE, 1, "#8a6839");
  rect(ctx, px, py, 0, 7, TILE, 3, "#5a4a3a");
  dot(ctx, px, py, 2, 8, "#8a7a60");
  dot(ctx, px, py, 13, 8, "#8a7a60");
  rect(ctx, px, py, 6, 6, 4, 5, "#c8a840");
  rect(ctx, px, py, 7, 9, 2, 2, "#3a2a14");
}

function bedTopPainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#c03040");
  rect(ctx, px, py, 0, 0, TILE, 4, "#f0f0e8");
  rect(ctx, px, py, 0, 3, TILE, 1, "#d0d0c8");
  rect(ctx, px, py, 0, 4, TILE, 1, "#a02838");
  for (const x of [4, 8, 12]) rect(ctx, px, py, x, 5, 1, 11, "#b02838");
}

function bedSidePainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#c03040");
  rect(ctx, px, py, 0, 0, TILE, 2, "#f0f0e8");
  rect(ctx, px, py, 0, 12, TILE, 1, "#a02838");
  rect(ctx, px, py, 0, 13, TILE, 3, "#6e4f2e");
  rect(ctx, px, py, 1, 13, 2, 3, "#5a3f24");
  rect(ctx, px, py, 13, 13, 2, 3, "#5a3f24");
}

function doorPainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#8a6a3e");
  rect(ctx, px, py, 5, 0, 1, TILE, "#6e4f2e");
  rect(ctx, px, py, 10, 0, 1, TILE, "#6e4f2e");
  rect(ctx, px, py, 0, 3, TILE, 2, "#6e4f2e");
  rect(ctx, px, py, 0, 11, TILE, 2, "#6e4f2e");
  rect(ctx, px, py, 11, 7, 2, 2, "#c8a840");
  rect(ctx, px, py, 1, 0, 4, 1, "#a88858");
}

function fumeVentPainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#5a5a5e");
  rect(ctx, px, py, 1, 1, 14, 14, "#6a6a70");
  for (const y of [4, 7, 10]) rect(ctx, px, py, 3, y, 10, 2, "#2a2a2e");
  dot(ctx, px, py, 1, 1, "#8a8a90");
  dot(ctx, px, py, 14, 1, "#8a8a90");
  dot(ctx, px, py, 1, 14, "#8a8a90");
  dot(ctx, px, py, 14, 14, "#8a8a90");
}

function ferroLanternPainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#3f3f46");
  rect(ctx, px, py, 0, 0, TILE, 2, "#6a6a70");
  rect(ctx, px, py, 0, TILE - 2, TILE, 2, "#6a6a70");
  rect(ctx, px, py, 0, 0, 2, TILE, "#6a6a70");
  rect(ctx, px, py, TILE - 2, 0, 2, TILE, "#6a6a70");
  rect(ctx, px, py, 2, 2, 12, 12, "#ffd070");
  rect(ctx, px, py, 4, 4, 8, 8, "#ffe8a0");
  rect(ctx, px, py, 7, 0, 2, TILE, "#5a5a60");
  rect(ctx, px, py, 0, 7, TILE, 2, "#5a5a60");
  dot(ctx, px, py, 2, 2, "#8a8a90");
  dot(ctx, px, py, 13, 13, "#8a8a90");
}

function campfireTopPainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#2e1f14");
  const rng = rngOf("campfire_top");
  for (let i = 0; i < 14; i++) dot(ctx, px, py, rng.nextInt(TILE), rng.nextInt(TILE), rng.pick(["#ff7a2f", "#ffb45a", "#ff5a10"]));
  rect(ctx, px, py, 2, 6, 12, 3, "#6e4f2e");
  rect(ctx, px, py, 6, 2, 3, 12, "#6e4f2e");
  rect(ctx, px, py, 2, 6, 12, 1, "#8a6a3e");
  rect(ctx, px, py, 6, 2, 1, 12, "#8a6a3e");
}

function campfireSidePainter(ctx: AtlasCtx, px: number, py: number): void {
  fill(ctx, px, py, "#3a2a1c");
  rect(ctx, px, py, 1, 10, 14, 3, "#6e4f2e");
  rect(ctx, px, py, 2, 13, 12, 3, "#5a3f24");
  rect(ctx, px, py, 1, 10, 14, 1, "#8a6a3e");
  rect(ctx, px, py, 3, 9, 10, 1, "#ff7a2f");
  rect(ctx, px, py, 4, 4, 8, 5, "#ff9a30");
  rect(ctx, px, py, 6, 2, 4, 4, "#ffd060");
  rect(ctx, px, py, 7, 1, 2, 2, "#fff0b0");
  dot(ctx, px, py, 5, 9, "#ffb45a");
  dot(ctx, px, py, 10, 9, "#ffb45a");
}

function buildIndex(entries: readonly PainterEntry[]): Record<string, number> {
  const index: Record<string, number> = {};
  for (let i = 0; i < entries.length; i++) index[entries[i].name] = i;
  return index;
}

const PAINTERS: readonly PainterEntry[] = [
  { name: "air", draw: () => {} },
  noiseEntry("stone", "#7a7a78", ["#6e6e6c", "#878785", "#747472"], 0.35),
  noiseEntry("grass_top", "#5d9b3a", ["#528f32", "#6bb044", "#4c8630"], 0.4),
  noiseEntry("dirt", "#8a6247", ["#75523a", "#966e50", "#6b4a34"], 0.35),
  edgeEntry("grass_side", "#8a6247", ["#75523a", "#966e50"], "#5d9b3a", "#4a8030", "#6bb044"),
  cobbleEntry("cobblestone", "#4f4f4f", ["#8a8a88", "#7b7b79", "#969694"]),
  noiseEntry("sand", "#dbcf98", ["#d0c288", "#e4d9a8", "#c8b87c"], 0.3),
  noiseEntry("sandstone_top", "#d8c890", ["#d0bc82", "#e2d29c"], 0.25),
  sandstoneSideEntry("sandstone_side"),
  gravelEntry("gravel"),
  waterEntry("water"),
  logTopEntry("log_top", "#a3814f", "#8f6f42", "#6e5433", "#6b4a2c"),
  logSideEntry("log_side", "#6e4f2e", "#5a3f24", "#7d5c38"),
  noiseEntry("leaves", "#3f8f2f", ["#2f7a24", "#4fa03c", "#27661e"], 0.5),
  plankEntry("planks", "#b08c54", "#8a6a3e", "#a07c48", "#c0a06a"),
  glassEntry("glass", "#d4ecf6", "#a8c8dc", "#ffffff"),
  oreEntry("coal_ore", "#7a7a78", ["#6e6e6c", "#878785"], "#2e2e30", "#44444a", "#6a6a70"),
  oreEntry("copper_ore", "#7a7a78", ["#6e6e6c", "#878785"], "#b06a3a", "#c88450", "#e0a070"),
  oreEntry("ferrite_ore", "#7a7a78", ["#6e6e6c", "#878785"], "#8a939d", "#b0b8c0", "#d8e0e8"),
  oreEntry("aurum_ore", "#7a7a78", ["#6e6e6c", "#878785"], "#b89028", "#d4af37", "#ffe890"),
  oreEntry("aetherite_ore", "#7a7a78", ["#6e6e6c", "#878785"], "#2ab5a8", "#5ad8c8", "#d0fff4"),
  oreEntry("ember_ore", "#7a7a78", ["#6e6e6c", "#878785"], "#ff6a1f", "#ff9a30", "#ffe0a0"),
  bedrockEntry("bedrock"),
  noiseEntry("snow", "#f2f6fa", ["#e4ecf4", "#ffffff"], 0.3),
  edgeEntry("snow_grass_side", "#8a6247", ["#75523a", "#966e50"], "#f2f6fa", "#d8e4ee", "#ffffff"),
  iceEntry("ice"),
  noiseEntry("permafrost", "#7a8a96", ["#6a7a86", "#8a9aa6", "#728290"], 0.3),
  glassEntry("frostglass", "#dcebf6", "#b0cfe0", "#ffffff", "#a8c8dc"),
  glowcrystalEntry("glowcrystal"),
  { name: "icicle", draw: iciclePainter },
  { name: "cactus_top", draw: cactusTopPainter },
  cactusSideEntry("cactus_side"),
  { name: "tall_grass", draw: tallGrassPainter },
  { name: "flower_red", draw: flowerPainter("#d83a3a", "#f06050", "#f0d040") },
  { name: "flower_yellow", draw: flowerPainter("#f0c832", "#ffe070", "#c07820") },
  { name: "flower_blue", draw: flowerPainter("#3a6ad8", "#6090f0", "#f0e040") },
  { name: "mushroom_red", draw: mushroomPainter("#d83a3a", "#f06050", "#f0f0e8", "#e8dcc8") },
  { name: "mushroom_brown", draw: mushroomPainter("#8a5a3a", "#a07048", "#6a4428", "#d8c8a8") },
  { name: "dead_bush", draw: deadBushPainter },
  { name: "torch", draw: torchPainter },
  { name: "crafting_table_top", draw: craftingTableTopPainter },
  { name: "crafting_table_side", draw: craftingTableSidePainter },
  { name: "crafting_table_front", draw: craftingTableFrontPainter },
  { name: "furnace_top", draw: furnaceTopPainter },
  { name: "furnace_side", draw: furnaceSidePainter },
  furnaceFrontEntry("furnace_front", false),
  furnaceFrontEntry("furnace_front_lit", true),
  { name: "chest_top", draw: chestTopPainter },
  { name: "chest_side", draw: chestSidePainter },
  { name: "chest_front", draw: chestFrontPainter },
  { name: "bed_top", draw: bedTopPainter },
  { name: "bed_side", draw: bedSidePainter },
  { name: "door", draw: doorPainter },
  brickEntry("bricks", "#8a7a70", "#9e4a3a", "#7a3428", "#b05848"),
  brickEntry("stone_bricks", "#55585a", "#7d7d7b", "#686866", "#8a8a88"),
  mossyStoneEntry("mossy_stone"),
  brickEntry("sandstone_bricks", "#b8a878", "#d0c090", "#bcaa7c", "#e0d2a4"),
  emberstoneEntry("emberstone"),
  emberstoneBricksEntry("emberstone_bricks"),
  noiseEntry("rustrock", "#7a5040", ["#8f6050", "#634030", "#a06848"], 0.4),
  brickEntry("rustrock_bricks", "#5a3828", "#8a5a48", "#6a4232", "#a07058"),
  emberlightEntry("emberlight"),
  noiseEntry("understone", "#4a4452", ["#3a3442", "#5a5464", "#524c5c"], 0.35),
  brickEntry("understone_bricks", "#38323f", "#524c5c", "#443e4c", "#5e5870"),
  { name: "fume_vent", draw: fumeVentPainter },
  farmlandEntry("farmland", "#5a3e28", "#422e1c", "#6a4c32"),
  farmlandEntry("farmland_wet", "#42301c", "#2e2012", "#5a4430"),
  wheatEntry("wheat_0", 0),
  wheatEntry("wheat_1", 1),
  wheatEntry("wheat_2", 2),
  wheatEntry("wheat_3", 3),
  logTopEntry("log_pine_top", "#8a6a48", "#75583a", "#5a4428", "#4e3824"),
  logSideEntry("log_pine_side", "#4e3824", "#3e2c1a", "#5e4830"),
  noiseEntry("leaves_pine", "#2a6a4a", ["#1e5538", "#358058", "#225e42"], 0.5),
  logTopEntry("log_dune_top", "#c8a868", "#b89858", "#9a7c40", "#a88848"),
  logSideEntry("log_dune_side", "#a88848", "#987838", "#b89858"),
  noiseEntry("leaves_dune", "#7a9a3a", ["#6a8a2e", "#8aaa48", "#5e7e28"], 0.5),
  noiseEntry("clay", "#a8a098", ["#b8b0a8", "#989088", "#b0a8a0"], 0.25),
  noiseEntry("voidrock", "#1e1a28", ["#141020", "#2a2438", "#4a3a6a"], 0.35),
  woolEntry("wool_white", "#f0f0ec", "#e4e4e0", "#ffffff"),
  woolEntry("wool_red", "#c03040", "#b02838", "#d04050"),
  woolEntry("wool_blue", "#3050c0", "#2844a8", "#4060d0"),
  woolEntry("wool_yellow", "#e0c030", "#d0b028", "#f0d040"),
  { name: "ferro_lantern", draw: ferroLanternPainter },
  { name: "campfire_top", draw: campfireTopPainter },
  { name: "campfire_side", draw: campfireSidePainter },
  { name: "glowshroom", draw: glowshroomPainter },
  crystalBlockEntry("crystal_block"),
  aurumBlockEntry("aurum_block"),
  metalEntry("ferrite_block", "#9aa3ad", "#c0c8d0", "#7a838d"),
  metalEntry("copper_block", "#b06a3a", "#c88450", "#905830", "#6a9a80"),
  noiseEntry("coal_block", "#2a2a2c", ["#3a3a40", "#1e1e22", "#333338"], 0.5),
  { name: "sapling_sable", draw: saplingPainter("#6e4f2e", "#4a9a3a", "#3a7e2c", false) },
  { name: "sapling_pine", draw: saplingPainter("#4e3824", "#2a6a4a", "#1e5538", true) },
  { name: "sapling_dune", draw: saplingPainter("#a88848", "#7a9a3a", "#6a8a2e", false) },
  { name: "dewberry_full", draw: dewberryPainter(true) },
  { name: "dewberry_empty", draw: dewberryPainter(false) }
];

export const TILE_INDEX: Record<string, number> = buildIndex(PAINTERS);

export function paintAtlas(ctx: AtlasCtx): void {
  for (let i = 0; i < PAINTERS.length; i++) {
    const x = (i % ATLAS_TILES_PER_ROW) * TILE;
    const y = (ATLAS_TILES_PER_ROW - 1 - Math.floor(i / ATLAS_TILES_PER_ROW)) * TILE;
    ctx.clearRect(x, y, TILE, TILE);
    PAINTERS[i].draw(ctx, x, y);
  }
}

export function buildAtlasCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_TILES_PER_ROW * TILE;
  canvas.height = ATLAS_TILES_PER_ROW * TILE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to acquire 2D context for atlas canvas");
  ctx.imageSmoothingEnabled = false;
  paintAtlas(ctx);
  return canvas;
}

export function atlasTileOf(blockId: number, face: number): number {
  const def = blockById(blockId);
  if (!def) return 0;
  const tiles = def.tiles;
  let name: string | undefined;
  if (def.render === "cross") {
    name = tiles.all;
  } else if (face === FACE_PY) {
    name = tiles.top ?? tiles.all ?? tiles.side ?? tiles.front;
  } else if (face === FACE_NY) {
    name = tiles.bottom ?? tiles.all ?? tiles.side ?? tiles.front;
  } else if (face === FACE_NZ) {
    name = tiles.front ?? tiles.side ?? tiles.all;
  } else {
    name = tiles.side ?? tiles.all ?? tiles.front;
  }
  if (name === undefined) return 0;
  const index = TILE_INDEX[name];
  return index === undefined ? 0 : index;
}

export function buildAtlasTexture(): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(buildAtlasCanvas());
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}
