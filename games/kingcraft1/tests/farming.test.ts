import { describe, expect, it } from "vitest";
import { B } from "../src/content/blocks";
import { Rng } from "../src/core/rng";
import { rollDrops } from "../src/gameplay/drops";
import {
  advanceCrop,
  applyGrowthBoost,
  cropTick,
  growTree,
  hasWaterNear,
  randomTick,
  updateFarmland
} from "../src/gameplay/farming";
import { MapWorld } from "./helpers/mapWorld";

function plot(wet: boolean): MapWorld {
  const world = new MapWorld(0, B.DIRT);
  world.setBlock(0, 0, 0, wet ? B.FARMLAND_WET : B.FARMLAND);
  world.setBlock(0, 1, 0, B.WHEAT_0);
  if (wet) world.setBlock(3, 0, 0, B.WATER);
  return world;
}

describe("farmland moisture", () => {
  it("detects water within four blocks on the same level or one above", () => {
    const world = new MapWorld(0, B.DIRT);
    world.setBlock(4, 0, -4, B.WATER);
    expect(hasWaterNear(world, 0, 0, 0)).toBe(true);
    expect(hasWaterNear(world, 1, 0, -1)).toBe(true);
    expect(hasWaterNear(world, 0, 0, 1)).toBe(false);
    expect(hasWaterNear(world, -1, 0, 0)).toBe(false);
  });

  it("wets and dries farmland and turns it to dirt when covered", () => {
    const world = new MapWorld(0, B.DIRT);
    world.setBlock(0, 0, 0, B.FARMLAND);
    world.setBlock(2, 0, 0, B.WATER);
    expect(updateFarmland(world, 0, 0, 0)).toBe(B.FARMLAND_WET);
    world.setBlock(2, 0, 0, B.DIRT);
    expect(updateFarmland(world, 0, 0, 0)).toBe(B.FARMLAND);
    world.setBlock(0, 1, 0, B.STONE);
    expect(updateFarmland(world, 0, 0, 0)).toBe(B.DIRT);
  });
});

describe("crop growth", () => {
  it("does not grow on dry farmland", () => {
    const world = plot(false);
    const rng = new Rng(1);
    for (let i = 0; i < 200; i++) cropTick(world, 0, 1, 0, rng);
    expect(world.getBlock(0, 1, 0)).toBe(B.WHEAT_0);
  });

  it("advances stages deterministically on wet farmland", () => {
    const stagesFor = (seed: number): number[] => {
      const world = plot(true);
      const rng = new Rng(seed);
      const seen: number[] = [];
      for (let i = 0; i < 12; i++) {
        cropTick(world, 0, 1, 0, rng);
        seen.push(world.getBlock(0, 1, 0));
      }
      return seen;
    };
    const run = stagesFor(99);
    expect(run).toEqual(stagesFor(99));
    expect(run[run.length - 1]).toBe(B.WHEAT_3);
    for (let i = 1; i < run.length; i++) expect(run[i]).toBeGreaterThanOrEqual(run[i - 1]);
  });

  it("stops at the last stage", () => {
    const world = plot(true);
    world.setBlock(0, 1, 0, B.WHEAT_3);
    expect(advanceCrop(world, 0, 1, 0)).toBe(false);
  });

  it("harvests ripe wheat into wheat plus seeds and unripe wheat into seeds", () => {
    const rng = new Rng(5);
    for (let i = 0; i < 50; i++) {
      const ripe = rollDrops(B.WHEAT_3, rng);
      expect(ripe.find((s) => s.item === "wheat")?.count).toBe(1);
      const seeds = ripe.find((s) => s.item === "seeds")?.count ?? 0;
      expect(seeds).toBeGreaterThanOrEqual(1);
      expect(seeds).toBeLessThanOrEqual(3);
      expect(rollDrops(B.WHEAT_1, rng)).toEqual([{ item: "seeds", count: 1 }]);
    }
  });

  it("boosts crops by one or two stages", () => {
    const world = plot(true);
    expect(applyGrowthBoost(world, 0, 1, 0, new Rng(3))).toBe(true);
    expect(world.getBlock(0, 1, 0)).toBeGreaterThan(B.WHEAT_0);
    expect(world.getBlock(0, 1, 0)).toBeLessThanOrEqual(B.WHEAT_2);
    expect(applyGrowthBoost(world, 5, 5, 5, new Rng(3))).toBe(false);
  });
});

describe("saplings and random ticks", () => {
  it("grows a sapling into a tree when there is room", () => {
    const world = new MapWorld(0, B.GRASS);
    world.setBlock(0, 1, 0, B.SAPLING_PINE);
    expect(growTree(world, 0, 1, 0, new Rng(8))).toBe(true);
    expect(world.getBlock(0, 1, 0)).toBe(B.LOG_PINE);
    expect(world.getBlock(0, 2, 0)).toBe(B.LOG_PINE);
    expect([...world.blocks.values()].filter((id) => id === B.LEAVES_PINE).length).toBeGreaterThan(5);
  });

  it("refuses to grow under a ceiling", () => {
    const world = new MapWorld(0, B.GRASS);
    world.setBlock(0, 1, 0, B.SAPLING_SABLE);
    world.setBlock(0, 3, 0, B.STONE);
    expect(growTree(world, 0, 1, 0, new Rng(8))).toBe(false);
    expect(world.getBlock(0, 1, 0)).toBe(B.SAPLING_SABLE);
  });

  it("dispatches random ticks to farmland and crops", () => {
    const world = plot(true);
    world.setBlock(0, 0, 0, B.FARMLAND);
    randomTick(world, 0, 0, 0, new Rng(1));
    expect(world.getBlock(0, 0, 0)).toBe(B.FARMLAND_WET);
    const rng = new Rng(2);
    for (let i = 0; i < 30; i++) randomTick(world, 0, 1, 0, rng);
    expect(world.getBlock(0, 1, 0)).toBe(B.WHEAT_3);
  });
});
