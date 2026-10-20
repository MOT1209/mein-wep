import { ATLAS_TILES_PER_ROW, ATLAS_TILE_PIXELS } from "../config";
import { hashInt } from "../core/rng";
import { blockIdOfItem, isBlockItem, itemById, toolStats } from "../content/items";
import { atlasTileOf } from "../render/textures";
import { FACE_PZ } from "../voxels/mesher";

export const ICON_PIXELS = 32;

const TIER_COLORS: Readonly<Record<number, string>> = {
  1: "#a8793f",
  2: "#8d8f93",
  3: "#cfc8bd",
  4: "#e6b93c",
  5: "#4fd2c4"
};

const MATERIAL_COLORS: readonly (readonly [string, string])[] = [
  ["ferrite", "#cfc8bd"],
  ["copper", "#d0814a"],
  ["aurum", "#e6b93c"],
  ["aetherite", "#4fd2c4"],
  ["ember", "#e2553a"],
  ["coal", "#2c2c30"],
  ["charcoal", "#3a3330"],
  ["clay", "#a9b0bd"],
  ["brick", "#a5533a"],
  ["bone", "#e8e2cf"],
  ["leather", "#8a5a34"],
  ["string", "#eeeeee"],
  ["feather", "#f4f4f0"],
  ["wheat", "#d9bf55"],
  ["seeds", "#7aa83f"],
  ["apple", "#d23b32"],
  ["bread", "#c48a43"],
  ["dewberry", "#6a4fc2"],
  ["meat", "#c25a4f"],
  ["stone", "#8d8f93"],
  ["stick", "#8a6236"],
  ["bucket", "#b9bec6"]
];

type Painter = (ctx: CanvasRenderingContext2D, color: string) => void;

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x * 2, y * 2, w * 2, h * 2);
}

function shade(hex: string, factor: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((value >> 16) & 255) * factor));
  const g = Math.min(255, Math.round(((value >> 8) & 255) * factor));
  const b = Math.min(255, Math.round((value & 255) * factor));
  return `rgb(${r},${g},${b})`;
}

function handle(ctx: CanvasRenderingContext2D, from: number): void {
  for (let i = from; i < 14; i++) px(ctx, 14 - i, i + 1, 2, 1, "#7a5430");
}

const TOOL_PAINTERS: Readonly<Record<string, Painter>> = {
  pickaxe: (ctx, c) => {
    handle(ctx, 3);
    for (let i = 0; i < 9; i++) px(ctx, 4 + i, 2 + Math.abs(4 - i) * 0.5, 1, 2, c);
    px(ctx, 9, 3, 3, 2, shade(c, 0.8));
  },
  axe: (ctx, c) => {
    handle(ctx, 3);
    px(ctx, 6, 1, 5, 5, c);
    px(ctx, 5, 2, 2, 3, shade(c, 1.15));
  },
  shovel: (ctx, c) => {
    handle(ctx, 5);
    px(ctx, 9, 1, 5, 5, c);
    px(ctx, 10, 2, 3, 3, shade(c, 1.15));
  },
  hoe: (ctx, c) => {
    handle(ctx, 3);
    px(ctx, 6, 2, 6, 2, c);
    px(ctx, 6, 4, 2, 2, shade(c, 0.8));
  },
  sword: (ctx, c) => {
    for (let i = 0; i < 10; i++) px(ctx, 4 + i, 11 - i, 2, 2, i < 2 ? "#7a5430" : c);
    px(ctx, 3, 9, 5, 2, shade(c, 0.7));
  },
  shears: (ctx, c) => {
    px(ctx, 3, 3, 4, 8, c);
    px(ctx, 9, 3, 4, 8, shade(c, 0.85));
    px(ctx, 3, 11, 4, 3, "#a03a32");
    px(ctx, 9, 11, 4, 3, "#a03a32");
  }
};

function materialColor(item: string): string {
  for (const [key, color] of MATERIAL_COLORS) if (item.includes(key)) return color;
  const h = hashInt(item.length * 131 + item.charCodeAt(0) * 7 + item.charCodeAt(item.length - 1));
  return `hsl(${h % 360},45%,55%)`;
}

function paintMaterial(ctx: CanvasRenderingContext2D, item: string): void {
  const c = materialColor(item);
  const def = itemById(item);
  if (item === "stick") {
    handle(ctx, 1);
    return;
  }
  if (item.endsWith("bucket")) {
    px(ctx, 3, 4, 10, 9, c);
    px(ctx, 4, 12, 8, 2, shade(c, 0.8));
    if (item === "water_bucket") px(ctx, 4, 5, 8, 3, "#3a74d0");
    return;
  }
  if (item.endsWith("_ingot") || item === "brick") {
    px(ctx, 2, 6, 12, 5, c);
    px(ctx, 3, 5, 10, 1, shade(c, 1.2));
    px(ctx, 2, 10, 12, 1, shade(c, 0.7));
    return;
  }
  if (item.endsWith("_gem") || item.endsWith("_dust")) {
    for (let i = 0; i < 6; i++) px(ctx, 8 - i, 3 + i, i * 2, 1, c);
    for (let i = 0; i < 6; i++) px(ctx, 3 + i, 9 + i, 10 - i * 2, 1, shade(c, 0.75));
    return;
  }
  if (item === "seeds") {
    for (const [x, y] of [[4, 5], [9, 4], [6, 9], [11, 9], [8, 12]]) px(ctx, x, y, 2, 2, c);
    return;
  }
  if (item === "wheat") {
    for (let i = 0; i < 3; i++) px(ctx, 4 + i * 3, 2, 2, 12, i === 1 ? c : shade(c, 0.85));
    return;
  }
  if (def?.kind === "food") {
    px(ctx, 4, 4, 8, 9, c);
    px(ctx, 3, 6, 10, 5, c);
    px(ctx, 5, 5, 3, 2, shade(c, 1.3));
    return;
  }
  px(ctx, 3, 4, 10, 9, c);
  px(ctx, 4, 3, 8, 11, c);
  px(ctx, 5, 5, 3, 2, shade(c, 1.25));
  px(ctx, 4, 11, 8, 2, shade(c, 0.7));
}

export class IconFactory {
  private readonly canvases = new Map<string, HTMLCanvasElement>();
  private readonly urls = new Map<string, string>();

  constructor(private readonly atlas: HTMLCanvasElement) {}

  canvasFor(item: string): HTMLCanvasElement {
    const cached = this.canvases.get(item);
    if (cached) return cached;
    const canvas = document.createElement("canvas");
    canvas.width = ICON_PIXELS;
    canvas.height = ICON_PIXELS;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      this.paint(ctx, item);
    }
    this.canvases.set(item, canvas);
    return canvas;
  }

  urlFor(item: string): string {
    const cached = this.urls.get(item);
    if (cached) return cached;
    const url = this.canvasFor(item).toDataURL();
    this.urls.set(item, url);
    return url;
  }

  private paint(ctx: CanvasRenderingContext2D, item: string): void {
    const blockId = isBlockItem(item) ? blockIdOfItem(item) : -1;
    if (blockId > 0) {
      const tile = atlasTileOf(blockId, FACE_PZ);
      const sx = (tile % ATLAS_TILES_PER_ROW) * ATLAS_TILE_PIXELS;
      const sy = (ATLAS_TILES_PER_ROW - 1 - Math.floor(tile / ATLAS_TILES_PER_ROW)) * ATLAS_TILE_PIXELS;
      ctx.drawImage(this.atlas, sx, sy, ATLAS_TILE_PIXELS, ATLAS_TILE_PIXELS, 0, 0, ICON_PIXELS, ICON_PIXELS);
      return;
    }
    const tool = toolStats(item);
    if (tool) {
      const painter = TOOL_PAINTERS[tool.kind];
      if (painter) {
        painter(ctx, TIER_COLORS[tool.tier] ?? "#cccccc");
        return;
      }
    }
    paintMaterial(ctx, item);
  }
}
