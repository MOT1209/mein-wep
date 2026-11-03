import { describe, expect, it } from "vitest";
import { creatureById } from "../src/content/creatures";
import { Rng } from "../src/core/rng";
import { AGGRO_RADIUS, applyDecision, decide, desiredSpeed, isAggressive, meleeRange, type Perception } from "../src/entities/ai";
import { EntityManager, rayBox, type EntityWorld, type PlayerTarget } from "../src/entities/manager";
import type { AiState, Entity } from "../src/entities/types";
import { MapWorld } from "./helpers/mapWorld";

function entityOf(id: string, state: AiState = "idle"): Entity {
  const manager = new EntityManager(new Rng(1));
  const entity = manager.create(creatureById(id), 0.5, 1, 0.5);
  entity.state = state;
  return entity;
}

function sees(distance: number, overrides: Partial<Perception> = {}): Perception {
  return { distance, canSee: true, light: 15, isNight: false, playerAlive: true, ...overrides };
}

class ArenaWorld extends MapWorld implements EntityWorld {
  isNight = false;
  getSkyLight(): number {
    return 15;
  }
  getBlockLight(): number {
    return 0;
  }
  getBiome(): number {
    return 2;
  }
  highestSolidY(): number {
    return this.floorY;
  }
  isBlockLoaded(): boolean {
    return true;
  }
}

describe("AI decisions (table-driven)", () => {
  const cases: { name: string; id: string; state: AiState; perception: Perception; hurt?: boolean; provoked?: boolean; expected: AiState }[] = [
    { name: "hostile chases in range at night", id: "shadewisp", state: "idle", perception: sees(10, { isNight: true }), expected: "approach" },
    { name: "hostile chases in the dark by day", id: "shadewisp", state: "idle", perception: sees(10, { light: 3 }), expected: "approach" },
    { name: "hostile ignores the player in daylight", id: "shadewisp", state: "idle", perception: sees(5), expected: "idle" },
    { name: "hostile ignores the player out of aggro range", id: "shadewisp", state: "idle", perception: sees(AGGRO_RADIUS + 1, { isNight: true }), expected: "idle" },
    { name: "hostile ignores an unseen player", id: "shadewisp", state: "idle", perception: sees(8, { isNight: true, canSee: false }), expected: "idle" },
    { name: "melee hostile attacks when adjacent", id: "shadewisp", state: "approach", perception: sees(1, { isNight: true }), expected: "attack" },
    { name: "ranged hostile attacks within its range", id: "rattler", state: "approach", perception: sees(12, { isNight: true }), expected: "attack" },
    { name: "hostile ignores a dead player", id: "rattler", state: "idle", perception: sees(5, { isNight: true, playerAlive: false }), expected: "idle" },
    { name: "passive flees when hurt", id: "bramblehog", state: "wander", perception: sees(4), hurt: true, expected: "flee" },
    { name: "passive does not chase", id: "bramblehog", state: "idle", perception: sees(2, { isNight: true }), expected: "idle" },
    { name: "neutral stays calm until provoked", id: "cave_crawler", state: "idle", perception: sees(3, { light: 0 }), expected: "idle" },
    { name: "neutral retaliates when provoked", id: "cave_crawler", state: "idle", perception: sees(3), provoked: true, expected: "approach" },
    { name: "chaser gives up and idles when the player escapes", id: "shadewisp", state: "approach", perception: sees(45, { isNight: true }), expected: "idle" }
  ];

  for (const c of cases) {
    it(c.name, () => {
      const entity = entityOf(c.id, c.state);
      if (c.hurt) entity.hurtTime = 0.4;
      if (c.provoked) entity.provoked = 10;
      entity.stateDuration = 100;
      expect(decide(entity, c.perception, new Rng(3)).state).toBe(c.expected);
    });
  }

  it("alternates idle and wander with bounded headings and durations", () => {
    const rng = new Rng(17);
    const entity = entityOf("woolback");
    for (let i = 0; i < 50; i++) {
      entity.stateTime = entity.stateDuration + 0.01;
      const before = entity.state;
      const decision = decide(entity, sees(30), rng);
      applyDecision(entity, decision);
      expect(entity.state).not.toBe(before);
      if (entity.state === "wander") {
        expect(entity.heading).toBeGreaterThanOrEqual(-Math.PI);
        expect(entity.heading).toBeLessThanOrEqual(Math.PI);
        expect(entity.stateDuration).toBeGreaterThanOrEqual(2);
        expect(entity.stateDuration).toBeLessThanOrEqual(5);
      }
    }
  });

  it("only hostiles and provoked neutrals are aggressive", () => {
    expect(isAggressive(creatureById("woolback"), sees(1, { isNight: true }), true)).toBe(false);
    expect(isAggressive(creatureById("cave_crawler"), sees(1), false)).toBe(false);
    expect(isAggressive(creatureById("cave_crawler"), sees(1), true)).toBe(true);
  });

  it("moves faster when fleeing than when wandering and stands still when idle", () => {
    const entity = entityOf("bramblehog", "wander");
    const wander = desiredSpeed(entity);
    entity.state = "flee";
    expect(desiredSpeed(entity)).toBeGreaterThan(wander);
    entity.state = "idle";
    expect(desiredSpeed(entity)).toBe(0);
    expect(meleeRange(creatureById("bramblehog"))).toBeGreaterThan(1);
  });
});

describe("EntityManager combat", () => {
  const player = (x: number, z: number): PlayerTarget => ({ x, y: 1, z, alive: true, eyeHeight: 1.62 });

  it("knocks back, provokes and kills with loot", () => {
    const manager = new EntityManager(new Rng(4));
    manager.spawningEnabled = false;
    const world = new ArenaWorld(0);
    const hog = manager.create(creatureById("bramblehog"), 5.5, 1, 0.5);
    manager.damage(hog, 4, 0.5, 0.5);
    expect(hog.health).toBe(creatureById("bramblehog").health - 4);
    expect(hog.vx).toBeGreaterThan(0);
    expect(hog.provoked).toBeGreaterThan(0);
    const loot: string[] = [];
    manager.damage(hog, 100, 0.5, 0.5);
    hog.hurtTime = 0;
    manager.damage(hog, 100, 0.5, 0.5);
    manager.tick(world, player(0.5, 0.5), 0.05, { dropLoot: (stack) => loot.push(stack.item) });
    expect(manager.entities).toHaveLength(0);
    expect(loot).toContain("raw_meat");
  });

  it("ignores repeated hits during the invulnerability window", () => {
    const manager = new EntityManager(new Rng(4));
    const hog = manager.create(creatureById("bramblehog"), 5.5, 1, 0.5);
    manager.damage(hog, 2, 0, 0);
    manager.damage(hog, 2, 0, 0);
    expect(hog.health).toBe(creatureById("bramblehog").health - 2);
  });

  it("lets an adjacent hostile damage the player at night with a cooldown", () => {
    const manager = new EntityManager(new Rng(5));
    manager.spawningEnabled = false;
    const world = new ArenaWorld(0);
    world.isNight = true;
    manager.create(creatureById("shadewisp"), 1.2, 1, 0.5);
    const hits: number[] = [];
    for (let i = 0; i < 40; i++) {
      manager.tick(world, player(0.5, 0.5), 0.05, { damagePlayer: (amount) => hits.push(amount) });
    }
    expect(hits.length).toBeGreaterThanOrEqual(1);
    expect(hits.length).toBeLessThanOrEqual(3);
    expect(hits[0]).toBe(creatureById("shadewisp").damage);
  });

  it("finds entities along a ray and not behind it", () => {
    const manager = new EntityManager(new Rng(1));
    const hog = manager.create(creatureById("bramblehog"), 0.5, 1, -4.5);
    const hit = manager.raycast({ x: 0.5, y: 1.6, z: 0.5 }, { x: 0, y: 0, z: -1 }, 6);
    expect(hit?.entity).toBe(hog);
    expect(hit?.distance).toBeCloseTo(5 - hog.def.size.w / 2, 6);
    expect(manager.raycast({ x: 0.5, y: 1.6, z: 0.5 }, { x: 0, y: 0, z: 1 }, 6)).toBeNull();
    expect(rayBox({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 2, -1, -1, 3, 1, 1)).toBe(2);
  });

  it("round-trips entities through save JSON", () => {
    const manager = new EntityManager(new Rng(1));
    manager.create(creatureById("woolback"), 3, 40, -2).health = 6;
    const copy = new EntityManager(new Rng(2));
    copy.load(JSON.parse(JSON.stringify(manager.toJSON())));
    expect(copy.toJSON()).toEqual(manager.toJSON());
    copy.load([{ type: "nope", x: 0, y: 0, z: 0 }, { type: "woolback", x: "a" }]);
    expect(copy.entities).toHaveLength(0);
  });

  it("burns daylight-sensitive hostiles under open sky", () => {
    const manager = new EntityManager(new Rng(1));
    manager.spawningEnabled = false;
    const world = new ArenaWorld(0);
    const wisp = manager.create(creatureById("shadewisp"), 0.5, 1, 0.5);
    const start = wisp.health;
    for (let i = 0; i < 25; i++) manager.tick(world, player(10.5, 10.5), 0.1);
    expect(wisp.health).toBeLessThan(start);
  });
});
