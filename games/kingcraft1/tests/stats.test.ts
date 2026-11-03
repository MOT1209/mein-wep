import { describe, expect, it } from "vitest";
import { FALL_DAMAGE_THRESHOLD, MAX_AIR, MAX_HEALTH, MAX_HUNGER, RESPAWN_HEALTH } from "../src/config";
import {
  DROWN_DAMAGE,
  PlayerStats,
  REGEN_INTERVAL_SECONDS,
  STARVE_INTERVAL_SECONDS,
  fallDamage,
  takeAllItems,
  type StatsContext
} from "../src/player/stats";

const GROUND: StatsContext = { y: 10, onGround: true, inWater: false, headInWater: false, flying: false, moving: false, sprinting: false };

function fall(stats: PlayerStats, from: number, to: number, context: Partial<StatsContext> = {}) {
  stats.tick(0.05, { ...GROUND, y: from, onGround: false, ...context });
  stats.tick(0.05, { ...GROUND, y: (from + to) / 2, onGround: false, ...context });
  return stats.tick(0.05, { ...GROUND, y: to, ...context });
}

describe("fall damage", () => {
  it("is zero up to the threshold and grows per block beyond it", () => {
    expect(fallDamage(FALL_DAMAGE_THRESHOLD)).toBe(0);
    expect(fallDamage(3)).toBe(0);
    expect(fallDamage(4)).toBe(1);
    expect(fallDamage(6)).toBe(3);
    expect(fallDamage(23.5)).toBe(20);
  });

  it("applies on landing from the peak height", () => {
    const stats = new PlayerStats();
    expect(fall(stats, 20, 10)).toEqual([{ amount: 7, source: "fall", died: false }]);
    expect(stats.health).toBe(MAX_HEALTH - 7);
  });

  it("is cancelled by water or flight", () => {
    const wet = new PlayerStats();
    fall(wet, 30, 10, { inWater: true });
    expect(wet.health).toBe(MAX_HEALTH);
    const flyer = new PlayerStats();
    fall(flyer, 30, 10, { flying: true });
    expect(flyer.health).toBe(MAX_HEALTH);
  });
});

describe("air and drowning", () => {
  it("loses air underwater, then takes drowning damage every second", () => {
    const stats = new PlayerStats();
    const under = { ...GROUND, inWater: true, headInWater: true };
    stats.tick(MAX_AIR, under);
    expect(stats.air).toBe(0);
    expect(stats.health).toBe(MAX_HEALTH);
    const hits = stats.tick(3, under);
    expect(hits.map((h) => h.source)).toEqual(["drown", "drown", "drown"]);
    expect(stats.health).toBe(MAX_HEALTH - 3 * DROWN_DAMAGE);
  });

  it("refills air quickly at the surface", () => {
    const stats = new PlayerStats();
    stats.air = 0;
    stats.tick(1, GROUND);
    expect(stats.air).toBeGreaterThan(0);
    stats.tick(5, GROUND);
    expect(stats.air).toBe(MAX_AIR);
  });
});

describe("hunger, starvation and regeneration", () => {
  it("drains saturation before hunger as exhaustion builds up", () => {
    const stats = new PlayerStats();
    stats.addExhaustion(4 * 5);
    expect(stats.saturation).toBe(0);
    expect(stats.hunger).toBe(MAX_HUNGER);
    stats.addExhaustion(8);
    expect(stats.hunger).toBe(MAX_HUNGER - 2);
  });

  it("sprinting costs more than walking", () => {
    const walk = new PlayerStats();
    const sprint = new PlayerStats();
    walk.tick(10, { ...GROUND, moving: true });
    sprint.tick(10, { ...GROUND, moving: true, sprinting: true });
    expect(sprint.exhaustion).toBeGreaterThan(walk.exhaustion);
  });

  it("starves at zero hunger on an interval", () => {
    const stats = new PlayerStats();
    stats.hunger = 0;
    stats.saturation = 0;
    stats.tick(STARVE_INTERVAL_SECONDS * 2 + 0.1, GROUND);
    expect(stats.health).toBe(MAX_HEALTH - 2);
  });

  it("regenerates only above the hunger threshold", () => {
    const fed = new PlayerStats();
    fed.health = 10;
    fed.tick(REGEN_INTERVAL_SECONDS * 2 + 0.1, GROUND);
    expect(fed.health).toBe(12);
    const peckish = new PlayerStats();
    peckish.health = 10;
    peckish.hunger = 17;
    peckish.saturation = 0;
    peckish.tick(REGEN_INTERVAL_SECONDS * 3, GROUND);
    expect(peckish.health).toBe(10);
  });
});

describe("eating", () => {
  it("adds food value, clamps hunger and caps saturation at hunger", () => {
    const stats = new PlayerStats();
    stats.hunger = 15;
    stats.saturation = 0;
    expect(stats.eat("cooked_meat")).toBe(true);
    expect(stats.hunger).toBe(MAX_HUNGER);
    expect(stats.saturation).toBeLessThanOrEqual(stats.hunger);
    expect(stats.saturation).toBeCloseTo(6.4, 6);
  });

  it("refuses at full hunger and for non-food", () => {
    const stats = new PlayerStats();
    expect(stats.eat("bread")).toBe(false);
    stats.hunger = 10;
    expect(stats.eat("dirt")).toBe(false);
    expect(stats.hunger).toBe(10);
  });
});

describe("death and respawn", () => {
  it("dies at zero health, ignores further damage and drops the inventory", () => {
    const stats = new PlayerStats();
    expect(stats.damage(MAX_HEALTH, "mob")).toEqual({ amount: MAX_HEALTH, source: "mob", died: true });
    expect(stats.dead).toBe(true);
    expect(stats.damage(5, "mob").amount).toBe(0);
    expect(stats.tick(5, { ...GROUND, headInWater: true })).toEqual([]);
    const inventory = { slots: [{ item: "dirt", count: 3 }, null, { item: "wood_pickaxe", count: 1, durability: 9 }] };
    expect(takeAllItems(inventory)).toEqual([
      { item: "dirt", count: 3 },
      { item: "wood_pickaxe", count: 1, durability: 9 }
    ]);
    expect(inventory.slots).toEqual([null, null, null]);
  });

  it("kills instantly below the world", () => {
    const stats = new PlayerStats();
    expect(stats.tick(0.05, { ...GROUND, y: -40, onGround: false })[0]).toMatchObject({ source: "void", died: true });
  });

  it("respawns with fresh stats", () => {
    const stats = new PlayerStats();
    stats.damage(MAX_HEALTH, "fall");
    stats.hunger = 2;
    stats.air = 0;
    stats.respawn();
    expect(stats.health).toBe(RESPAWN_HEALTH);
    expect(stats.hunger).toBe(MAX_HUNGER);
    expect(stats.air).toBe(MAX_AIR);
    expect(stats.dead).toBe(false);
  });

  it("round-trips through JSON and sanitises bad values", () => {
    const stats = new PlayerStats();
    stats.health = 13;
    stats.hunger = 9;
    stats.saturation = 2;
    expect(PlayerStats.fromJSON(JSON.parse(JSON.stringify(stats.toJSON()))).toJSON()).toEqual(stats.toJSON());
    const cleaned = PlayerStats.fromJSON({ health: "x", hunger: 999, saturation: 50, air: -3 });
    expect(cleaned.health).toBe(MAX_HEALTH);
    expect(cleaned.hunger).toBe(MAX_HUNGER);
    expect(cleaned.saturation).toBe(MAX_HUNGER);
    expect(cleaned.air).toBe(0);
    expect(PlayerStats.fromJSON({ health: 0 }).health).toBe(RESPAWN_HEALTH);
  });
});
