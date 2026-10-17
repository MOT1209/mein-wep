import { describe, expect, it } from "vitest";
import { ATLAS_TILE_COUNT, ATLAS_TILE_PIXELS, ATLAS_TILES_PER_ROW } from "../src/config";
import { BLOCKS, B } from "../src/content/blocks";
import { FACE_NX, FACE_NY, FACE_NZ, FACE_PX, FACE_PY, FACE_PZ } from "../src/voxels/mesher";
import { atlasTileOf, paintAtlas, TILE_INDEX, type AtlasCtx } from "../src/render/textures";

interface Fill {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

interface Clear {
  x: number;
  y: number;
  w: number;
  h: number;
}

class RecordingCtx implements AtlasCtx {
  fillStyle: string | CanvasGradient | CanvasPattern = "#000000";
  readonly fills: Fill[] = [];
  readonly clears: Clear[] = [];

  fillRect(x: number, y: number, w: number, h: number): void {
    this.fills.push({ x, y, w, h, color: String(this.fillStyle) });
  }

  clearRect(x: number, y: number, w: number, h: number): void {
    this.clears.push({ x, y, w, h });
  }
}

function cellOf(fill: Fill): number {
  const col = Math.floor(fill.x / ATLAS_TILE_PIXELS);
  const row = Math.floor(fill.y / ATLAS_TILE_PIXELS);
  return (ATLAS_TILES_PER_ROW - 1 - row) * ATLAS_TILES_PER_ROW + col;
}

describe("tile registry", () => {
  it("registers every tile name referenced by blocks", () => {
    const missing: string[] = [];
    for (const def of BLOCKS) {
      if (!def) continue;
      const names = [def.tiles.all, def.tiles.top, def.tiles.bottom, def.tiles.side, def.tiles.front, def.particleTile];
      for (const name of names) {
        if (name !== undefined && TILE_INDEX[name] === undefined) missing.push(`${def.name}:${name}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("assigns unique contiguous indices with air first", () => {
    const values = Object.values(TILE_INDEX);
    expect(new Set(values).size).toBe(values.length);
    const sorted = [...values].sort((a, b) => a - b);
    expect(sorted).toEqual(values.map((_, i) => i));
    for (const v of values) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(ATLAS_TILE_COUNT);
    }
    expect(TILE_INDEX.air).toBe(0);
  });
});

describe("atlasTileOf", () => {
  it("selects top, bottom, and side tiles per face", () => {
    const grassTop = TILE_INDEX.grass_top;
    const dirt = TILE_INDEX.dirt;
    const side = TILE_INDEX.grass_side;
    expect(atlasTileOf(B.GRASS, FACE_PY)).toBe(grassTop);
    expect(atlasTileOf(B.GRASS, FACE_NY)).toBe(dirt);
    expect(atlasTileOf(B.GRASS, FACE_PX)).toBe(side);
    expect(atlasTileOf(B.GRASS, FACE_NX)).toBe(side);
    expect(atlasTileOf(B.GRASS, FACE_PZ)).toBe(side);
    expect(atlasTileOf(B.GRASS, FACE_NZ)).toBe(side);
    expect(grassTop).not.toBe(dirt);
  });

  it("selects the front tile only on the negative Z face", () => {
    expect(atlasTileOf(B.CRAFTING_TABLE, FACE_NZ)).toBe(TILE_INDEX.crafting_table_front);
    expect(atlasTileOf(B.CRAFTING_TABLE, FACE_PZ)).toBe(TILE_INDEX.crafting_table_side);
    expect(atlasTileOf(B.FURNACE_LIT, FACE_NZ)).toBe(TILE_INDEX.furnace_front_lit);
    expect(atlasTileOf(B.FURNACE, FACE_NZ)).toBe(TILE_INDEX.furnace_front);
  });

  it("uses the single tile for cross-rendered blocks on every face", () => {
    const expected = TILE_INDEX.tall_grass;
    for (const face of [FACE_PX, FACE_NX, FACE_PY, FACE_NY, FACE_PZ, FACE_NZ]) {
      expect(atlasTileOf(B.TALL_GRASS, face)).toBe(expected);
    }
  });

  it("handles unknown block ids and face indices", () => {
    expect(atlasTileOf(999, FACE_PY)).toBe(0);
    expect(atlasTileOf(B.AIR, FACE_PY)).toBe(0);
    expect(atlasTileOf(B.GRASS, 42)).toBe(TILE_INDEX.grass_side);
  });
});

describe("paintAtlas", () => {
  it("clears and paints exactly one cell per registered tile", () => {
    const ctx = new RecordingCtx();
    paintAtlas(ctx);
    const count = Object.keys(TILE_INDEX).length;
    expect(ctx.clears).toHaveLength(count);
    expect(ctx.clears[0]).toEqual({ x: 0, y: (ATLAS_TILES_PER_ROW - 1) * ATLAS_TILE_PIXELS, w: ATLAS_TILE_PIXELS, h: ATLAS_TILE_PIXELS });
    for (const clear of ctx.clears) {
      expect(clear.w).toBe(ATLAS_TILE_PIXELS);
      expect(clear.h).toBe(ATLAS_TILE_PIXELS);
    }
  });

  it("paints every tile except air, and keeps air empty", () => {
    const ctx = new RecordingCtx();
    paintAtlas(ctx);
    const byCell = new Map<number, number>();
    for (const f of ctx.fills) {
      expect(f.x).toBeGreaterThanOrEqual(0);
      expect(f.y).toBeGreaterThanOrEqual(0);
      expect(f.x + f.w).toBeLessThanOrEqual(ATLAS_TILES_PER_ROW * ATLAS_TILE_PIXELS);
      expect(f.y + f.h).toBeLessThanOrEqual(ATLAS_TILES_PER_ROW * ATLAS_TILE_PIXELS);
      const cell = cellOf(f);
      byCell.set(cell, (byCell.get(cell) ?? 0) + 1);
    }
    for (const [name, index] of Object.entries(TILE_INDEX)) {
      const painted = byCell.get(index) ?? 0;
      if (name === "air") expect(painted).toBe(0);
      else expect(painted).toBeGreaterThan(0);
    }
  });

  it("is deterministic across runs", () => {
    const a = new RecordingCtx();
    const b = new RecordingCtx();
    paintAtlas(a);
    paintAtlas(b);
    expect(b.fills).toEqual(a.fills);
    expect(b.clears).toEqual(a.clears);
  });
});
