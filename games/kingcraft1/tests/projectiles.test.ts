import { describe, expect, it } from "vitest";
import { B } from "../src/content/blocks";
import { Rng } from "../src/core/rng";
import { campChestLoot } from "../src/gameplay/loot";
import { ProjectileManager, PROJECTILE_LIFETIME_SECONDS } from "../src/gameplay/projectiles";

const AIR = { getBlock: (): number => B.AIR };
const GROUND = { getBlock: (_x: number, y: number): number => (y <= 60 ? B.STONE : B.AIR) };

describe("arrows", () => {
  it("flies forward with drop and expires after its lifetime", () => {
    const arrows = new ProjectileManager();
    const arrow = arrows.shoot({ x: 0, y: 80, z: 0 }, { x: 0, y: 0, z: 1 }, 34, 5);
    arrows.tick(AIR, 0.1, () => false);
    expect(arrow.z).toBeGreaterThan(3);
    expect(arrow.vy).toBeLessThan(0);
    for (let i = 0; i < 60; i++) arrows.tick(AIR, 0.1, () => false);
    expect(arrows.count).toBe(0);
    expect(PROJECTILE_LIFETIME_SECONDS).toBeGreaterThan(1);
  });

  it("stops on a solid block and reports the impact point", () => {
    const arrows = new ProjectileManager();
    arrows.shoot({ x: 0.5, y: 70, z: 0.5 }, { x: 0, y: -1, z: 0 }, 34, 5);
    let hits = arrows.tick(GROUND, 0.1, () => false);
    for (let i = 0; i < 20 && hits.length === 0; i++) hits = arrows.tick(GROUND, 0.1, () => false);
    expect(hits).toHaveLength(1);
    expect(hits[0].blocked).toBe(true);
    expect(hits[0].y).toBeGreaterThan(60);
    expect(arrows.count).toBe(0);
  });

  it("consumes the arrow when the segment hook hits an entity", () => {
    const arrows = new ProjectileManager();
    arrows.shoot({ x: 0, y: 80, z: 0 }, { x: 0, y: 0, z: 1 }, 34, 5);
    let segments = 0;
    const hits = arrows.tick(AIR, 0.1, () => {
      segments++;
      return segments === 2;
    });
    expect(hits).toHaveLength(1);
    expect(hits[0].blocked).toBe(false);
    expect(arrows.count).toBe(0);
  });
});

describe("camp chest loot", () => {
  it("is deterministic for a seed and never empty", () => {
    const first = campChestLoot(new Rng(7));
    const second = campChestLoot(new Rng(7));
    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThan(0);
    for (const stack of first) expect(stack.count).toBeGreaterThan(0);
  });
});
