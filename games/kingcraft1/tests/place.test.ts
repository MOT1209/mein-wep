import { describe, expect, it } from "vitest";
import { B } from "../src/content/blocks";
import { overlapsPlayer, placementCell, tryPlace, tryUseItem } from "../src/gameplay/place";
import { FACE_NX, FACE_NY, FACE_NZ, FACE_PX, FACE_PY, FACE_PZ } from "../src/voxels/mesher";
import { MapWorld } from "./helpers/mapWorld";

const FAR_PLAYER = { x: 50.5, y: 1, z: 50.5 };

describe("placement cell", () => {
  it("offsets by the hit face in all six directions", () => {
    const base = { x: 5, y: 5, z: 5, id: B.STONE };
    expect(placementCell({ ...base, face: FACE_PX })).toEqual({ x: 6, y: 5, z: 5 });
    expect(placementCell({ ...base, face: FACE_NX })).toEqual({ x: 4, y: 5, z: 5 });
    expect(placementCell({ ...base, face: FACE_PY })).toEqual({ x: 5, y: 6, z: 5 });
    expect(placementCell({ ...base, face: FACE_NY })).toEqual({ x: 5, y: 4, z: 5 });
    expect(placementCell({ ...base, face: FACE_PZ })).toEqual({ x: 5, y: 5, z: 6 });
    expect(placementCell({ ...base, face: FACE_NZ })).toEqual({ x: 5, y: 5, z: 4 });
  });

  it("targets a replaceable block itself instead of its neighbour", () => {
    expect(placementCell({ x: 2, y: 1, z: 2, id: B.TALL_GRASS, face: FACE_PY })).toEqual({ x: 2, y: 1, z: 2 });
  });
});

describe("tryPlace", () => {
  it("places a block on top of the floor", () => {
    const world = new MapWorld(0);
    const result = tryPlace(world, { x: 0, y: 0, z: 0, id: B.STONE, face: FACE_PY }, "cobblestone", FAR_PLAYER);
    expect(result).toMatchObject({ ok: true, x: 0, y: 1, z: 0, blockId: B.COBBLESTONE });
    expect(world.getBlock(0, 1, 0)).toBe(B.COBBLESTONE);
  });

  it("rejects non-block items and occupied cells", () => {
    const world = new MapWorld(0);
    world.setBlock(0, 1, 0, B.STONE);
    expect(tryPlace(world, { x: 0, y: 0, z: 0, id: B.STONE, face: FACE_PY }, "stick", FAR_PLAYER)).toEqual({
      ok: false,
      reason: "not-placeable"
    });
    expect(tryPlace(world, { x: 0, y: 0, z: 0, id: B.STONE, face: FACE_PY }, "dirt", FAR_PLAYER)).toEqual({
      ok: false,
      reason: "occupied"
    });
  });

  it("refuses solid blocks inside the player but allows torches there", () => {
    const world = new MapWorld(0);
    const player = { x: 0.5, y: 1, z: 0.5 };
    const hit = { x: 0, y: 0, z: 0, id: B.STONE, face: FACE_PY };
    expect(overlapsPlayer({ x: 0, y: 1, z: 0 }, player)).toBe(true);
    expect(tryPlace(world, hit, "dirt", player)).toEqual({ ok: false, reason: "player" });
    expect(tryPlace(world, hit, "torch", player).ok).toBe(true);
  });

  it("rejects a floating torch on the side of a wall", () => {
    const world = new MapWorld(0);
    world.setBlock(0, 3, 0, B.STONE);
    expect(tryPlace(world, { x: 0, y: 3, z: 0, id: B.STONE, face: FACE_PX }, "torch", FAR_PLAYER)).toEqual({
      ok: false,
      reason: "no-support"
    });
  });

  it("replaces tall grass with a torch", () => {
    const world = new MapWorld(0);
    world.setBlock(3, 1, 3, B.TALL_GRASS);
    const result = tryPlace(world, { x: 3, y: 1, z: 3, id: B.TALL_GRASS, face: FACE_PY }, "torch", FAR_PLAYER);
    expect(result).toMatchObject({ ok: true, x: 3, y: 1, z: 3, blockId: B.TORCH });
    expect(world.getBlock(3, 1, 3)).toBe(B.TORCH);
  });

  it("plants seeds only on farmland and saplings only on their soils", () => {
    const world = new MapWorld(0, B.STONE);
    const onStone = { x: 0, y: 0, z: 0, id: B.STONE, face: FACE_PY };
    expect(tryPlace(world, onStone, "seeds", FAR_PLAYER)).toEqual({ ok: false, reason: "wrong-soil" });
    expect(tryPlace(world, onStone, "sapling_sable", FAR_PLAYER)).toEqual({ ok: false, reason: "wrong-soil" });
    world.setBlock(0, 0, 0, B.FARMLAND_WET);
    expect(tryPlace(world, { ...onStone, id: B.FARMLAND_WET }, "seeds", FAR_PLAYER)).toMatchObject({
      ok: true,
      blockId: B.WHEAT_0
    });
    world.setBlock(2, 0, 0, B.GRASS);
    expect(tryPlace(world, { x: 2, y: 0, z: 0, id: B.GRASS, face: FACE_PY }, "sapling_sable", FAR_PLAYER).ok).toBe(true);
  });

  it("empties a water bucket into a cell and returns the bucket", () => {
    const world = new MapWorld(0);
    const result = tryPlace(world, { x: 0, y: 0, z: 0, id: B.STONE, face: FACE_PY }, "water_bucket", FAR_PLAYER);
    expect(result).toMatchObject({ ok: true, blockId: B.WATER, give: { item: "bucket", count: 1 } });
    expect(world.getBlock(0, 1, 0)).toBe(B.WATER);
  });

  it("refuses to place outside the world height", () => {
    const world = new MapWorld(0);
    expect(tryPlace(world, { x: 0, y: 95, z: 0, id: B.STONE, face: FACE_PY }, "dirt", FAR_PLAYER)).toEqual({
      ok: false,
      reason: "out-of-world"
    });
  });
});

describe("tryUseItem", () => {
  it("tills grass and dirt with a hoe when the block above is open", () => {
    const world = new MapWorld(0, B.GRASS);
    const result = tryUseItem(world, { x: 0, y: 0, z: 0, id: B.GRASS, face: FACE_PY }, "wood_hoe");
    expect(result).toMatchObject({ ok: true, wear: 1 });
    expect(world.getBlock(0, 0, 0)).toBe(B.FARMLAND);
    world.setBlock(1, 1, 0, B.STONE);
    expect(tryUseItem(world, { x: 1, y: 0, z: 0, id: B.GRASS, face: FACE_PY }, "wood_hoe").ok).toBe(false);
  });

  it("fills an empty bucket from water next to the hit face", () => {
    const world = new MapWorld(0);
    world.setBlock(0, 1, 0, B.WATER);
    const result = tryUseItem(world, { x: 0, y: 0, z: 0, id: B.STONE, face: FACE_PY }, "bucket");
    expect(result).toMatchObject({ ok: true, consume: true, give: { item: "water_bucket", count: 1 } });
    expect(world.getBlock(0, 1, 0)).toBe(B.AIR);
  });
});
