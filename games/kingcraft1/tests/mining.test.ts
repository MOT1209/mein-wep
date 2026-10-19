import { describe, expect, it } from "vitest";
import { B } from "../src/content/blocks";
import { Rng } from "../src/core/rng";
import { DropManager, rollDrops } from "../src/gameplay/drops";
import { MiningState, breakTime, canHarvest, mineVerdict, toolWear } from "../src/gameplay/mining";
import { MapWorld } from "./helpers/mapWorld";

describe("break times and tool rules", () => {
  it("orders break times by hardness: stone takes longer than dirt", () => {
    expect(breakTime(B.STONE, null)).toBeGreaterThan(breakTime(B.DIRT, null));
    expect(breakTime(B.STONE, "wood_pickaxe")).toBeGreaterThan(breakTime(B.DIRT, "wood_shovel"));
  });

  it("speeds up with the right tool and better efficiency", () => {
    const hand = breakTime(B.DIRT, null);
    const wood = breakTime(B.DIRT, "wood_shovel");
    const stone = breakTime(B.DIRT, "stone_shovel");
    expect(wood).toBeLessThan(hand);
    expect(stone).toBeLessThan(wood);
  });

  it("blocks a pickaxe below the ore's tier", () => {
    expect(mineVerdict(B.FERRITE_ORE, "wood_pickaxe")).toBe("blocked");
    expect(breakTime(B.FERRITE_ORE, "wood_pickaxe")).toBe(Number.POSITIVE_INFINITY);
    expect(mineVerdict(B.FERRITE_ORE, "stone_pickaxe")).toBe("fast");
    expect(canHarvest(B.FERRITE_ORE, "stone_pickaxe")).toBe(true);
  });

  it("makes the wrong tool slow and drop nothing from tiered blocks", () => {
    expect(mineVerdict(B.STONE, "ferrite_axe")).toBe("slow");
    expect(breakTime(B.STONE, "ferrite_axe")).toBeGreaterThan(breakTime(B.STONE, "wood_pickaxe"));
    expect(canHarvest(B.STONE, "ferrite_axe")).toBe(false);
    expect(canHarvest(B.STONE, null)).toBe(false);
    expect(canHarvest(B.DIRT, null)).toBe(true);
  });

  it("never breaks bedrock or water", () => {
    expect(mineVerdict(B.BEDROCK, "aetherite_pickaxe")).toBe("unbreakable");
    expect(breakTime(B.WATER, null)).toBe(Number.POSITIVE_INFINITY);
  });

  it("wears tools only when a tool breaks a block with hardness", () => {
    expect(toolWear(B.STONE, "wood_pickaxe")).toBe(1);
    expect(toolWear(B.STONE, null)).toBe(0);
    expect(toolWear(B.TALL_GRASS, "wood_pickaxe")).toBe(1);
    expect(toolWear(B.STONE, "planks")).toBe(0);
  });
});

describe("MiningState", () => {
  it("accumulates progress over ticks and breaks the block", () => {
    const world = new MapWorld(0);
    world.setBlock(0, 1, 0, B.DIRT);
    const mining = new MiningState();
    const hit = { x: 0, y: 1, z: 0, id: B.DIRT };
    const total = breakTime(B.DIRT, null);
    expect(mining.tick(world, hit, null, total / 2, false)).toBeNull();
    expect(mining.progress).toBeCloseTo(0.5, 6);
    const done = mining.tick(world, hit, null, total / 2 + 1e-6, false);
    expect(done).toMatchObject({ kind: "broken", id: B.DIRT, harvest: true, wear: 0 });
    expect(world.getBlock(0, 1, 0)).toBe(B.AIR);
  });

  it("resets progress when the target changes", () => {
    const world = new MapWorld(0);
    world.setBlock(0, 1, 0, B.DIRT);
    world.setBlock(1, 1, 0, B.DIRT);
    const mining = new MiningState();
    mining.tick(world, { x: 0, y: 1, z: 0, id: B.DIRT }, null, 0.3, false);
    mining.tick(world, { x: 1, y: 1, z: 0, id: B.DIRT }, null, 0.1, false);
    expect(mining.progress).toBeCloseTo(0.1 / breakTime(B.DIRT, null), 6);
    mining.tick(world, null, null, 0.1, false);
    expect(mining.progress).toBe(0);
  });

  it("pings once when blocked and never breaks", () => {
    const world = new MapWorld(0);
    world.setBlock(0, 1, 0, B.FERRITE_ORE);
    const mining = new MiningState();
    const hit = { x: 0, y: 1, z: 0, id: B.FERRITE_ORE };
    expect(mining.tick(world, hit, "wood_pickaxe", 1, false)).toMatchObject({ kind: "blocked" });
    expect(mining.tick(world, hit, "wood_pickaxe", 100, false)).toBeNull();
    expect(world.getBlock(0, 1, 0)).toBe(B.FERRITE_ORE);
  });

  it("breaks instantly in creative without drops or wear", () => {
    const world = new MapWorld(0);
    world.setBlock(0, 1, 0, B.STONE);
    const event = new MiningState().tick(world, { x: 0, y: 1, z: 0, id: B.STONE }, "wood_pickaxe", 0.001, true);
    expect(event).toMatchObject({ kind: "broken", harvest: false, wear: 0 });
  });
});

describe("drops", () => {
  it("resolves self, explicit and none drop tables", () => {
    const rng = new Rng(1);
    expect(rollDrops(B.DIRT, rng)).toEqual([{ item: "dirt", count: 1 }]);
    expect(rollDrops(B.STONE, rng)).toEqual([{ item: "cobblestone", count: 1 }]);
    expect(rollDrops(B.GLASS, rng)).toEqual([]);
  });

  it("keeps random counts within each entry's bounds", () => {
    const rng = new Rng(42);
    const counts = new Set<number>();
    for (let i = 0; i < 300; i++) {
      for (const stack of rollDrops(B.COPPER_ORE, rng)) {
        expect(stack.item).toBe("raw_copper");
        counts.add(stack.count);
      }
    }
    expect([...counts].sort()).toEqual([2, 3]);
  });

  it("is deterministic for a seed and honours chance", () => {
    const a = new Rng(7);
    const b = new Rng(7);
    let seen = 0;
    for (let i = 0; i < 400; i++) {
      const left = rollDrops(B.LEAVES, a);
      expect(left).toEqual(rollDrops(B.LEAVES, b));
      seen += left.length;
    }
    expect(seen).toBeGreaterThan(0);
    expect(seen).toBeLessThan(400);
  });

  it("falls to the ground, merges and is picked up after the delay", () => {
    const world = new MapWorld(0);
    const drops = new DropManager();
    drops.spawn({ item: "dirt", count: 2 }, 0.5, 3, 0.5);
    drops.spawn({ item: "dirt", count: 3 }, 0.6, 3, 0.5);
    const collected: string[] = [];
    for (let i = 0; i < 60; i++) drops.tick(world, 1 / 60, null, () => null);
    expect(drops.drops).toHaveLength(1);
    expect(drops.drops[0].count).toBe(5);
    expect(drops.drops[0].y).toBeCloseTo(1.125, 6);
    drops.tick(world, 1 / 60, { x: 0.5, y: 1, z: 0.5 }, (stack) => {
      collected.push(`${stack.item}x${stack.count}`);
      return null;
    });
    expect(collected).toEqual(["dirtx5"]);
    expect(drops.drops).toHaveLength(0);
  });

  it("keeps leftovers when the inventory is full and despawns old drops", () => {
    const world = new MapWorld(0);
    const drops = new DropManager();
    drops.spawn({ item: "dirt", count: 5 }, 0.5, 1.2, 0.5, 0, 0);
    drops.tick(world, 0.01, { x: 0.5, y: 1, z: 0.5 }, (stack) => ({ item: stack.item, count: 2 }));
    expect(drops.drops[0].count).toBe(2);
    drops.tick(world, 400, null, () => null);
    expect(drops.drops).toHaveLength(0);
  });
});
