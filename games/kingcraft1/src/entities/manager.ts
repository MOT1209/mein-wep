import { GRAVITY, TERMINAL_VELOCITY } from "../config";
import { CREATURES, type CreatureDef } from "../content/creatures";
import type { ItemStack } from "../content/items";
import type { Rng } from "../core/rng";
import { moveWithCollision, type VoxelSource } from "../physics/collision";
import { raycastLine } from "../physics/raycast";
import { MELEE_COOLDOWN_SECONDS, applyDecision, decide, desiredSpeed, type Perception } from "./ai";
import { countEntities, effectiveLight, shouldDespawn, spawnAttempt, type SpawnWorld } from "./spawning";
import { isFlyer, type Entity, type EntitySave, type Vec3 } from "./types";

export const SPAWN_INTERVAL_SECONDS = 0.5;
export const HURT_SECONDS = 0.5;
export const PROVOKED_SECONDS = 20;
export const KNOCKBACK_SPEED = 6;
export const KNOCKBACK_LIFT = 4;
export const JUMP_SPEED = 7.5;
export const AI_BUDGET_PER_TICK = 48;
export const BURN_DAMAGE_PER_SECOND = 1;

export interface EntityWorld extends SpawnWorld, VoxelSource {
  readonly isNight: boolean;
}

export interface PlayerTarget extends Vec3 {
  alive: boolean;
  eyeHeight: number;
}

export interface EntityHooks {
  damagePlayer?(amount: number, source: Entity, knockX: number, knockZ: number): void;
  dropLoot?(stack: ItemStack, x: number, y: number, z: number): void;
}

function lootFor(def: CreatureDef, rng: Rng): ItemStack[] {
  const out: ItemStack[] = [];
  for (const drop of def.drops) {
    if (drop.chance !== undefined && rng.next() >= drop.chance) continue;
    const count = rng.intRange(drop.min, drop.max);
    if (count > 0) out.push({ item: drop.item, count });
  }
  return out;
}

export class EntityManager {
  readonly entities: Entity[] = [];
  private nextId = 1;
  private spawnTimer = 0;
  private aiCursor = 0;
  spawningEnabled = true;

  constructor(private readonly rng: Rng) {}

  create(def: CreatureDef, x: number, y: number, z: number): Entity {
    const entity: Entity = {
      id: this.nextId++,
      def,
      x,
      y,
      z,
      vx: 0,
      vy: 0,
      vz: 0,
      yaw: this.rng.range(-Math.PI, Math.PI),
      health: def.health,
      state: "idle",
      stateTime: 0,
      stateDuration: this.rng.range(0.5, 2),
      heading: 0,
      attackCooldown: 0,
      hurtTime: 0,
      provoked: 0,
      onGround: false,
      age: 0,
      walkPhase: 0,
      burnTimer: 0
    };
    this.entities.push(entity);
    return entity;
  }

  tick(world: EntityWorld, player: PlayerTarget, dt: number, hooks: EntityHooks = {}): void {
    this.spawnTimer += dt;
    if (this.spawningEnabled && this.spawnTimer >= SPAWN_INTERVAL_SECONDS) {
      this.spawnTimer = 0;
      const candidate = spawnAttempt(world, player, world.isNight, countEntities(this.entities), this.rng);
      if (candidate) this.create(candidate.def, candidate.x, candidate.y, candidate.z);
    }
    const count = this.entities.length;
    const thinkers = new Set<Entity>();
    for (let i = 0; i < Math.min(count, AI_BUDGET_PER_TICK); i++) thinkers.add(this.entities[(this.aiCursor + i) % count]);
    this.aiCursor = count > 0 ? (this.aiCursor + AI_BUDGET_PER_TICK) % count : 0;

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      if (shouldDespawn(entity, player, world.isNight)) {
        this.entities.splice(i, 1);
        continue;
      }
      if (!world.isBlockLoaded(Math.floor(entity.x), Math.floor(entity.z))) continue;
      this.update(world, entity, player, dt, thinkers.has(entity), hooks);
      if (entity.health <= 0) this.kill(i, hooks);
    }
  }

  damage(entity: Entity, amount: number, fromX: number, fromZ: number): void {
    if (entity.health <= 0 || entity.hurtTime > HURT_SECONDS * 0.5) return;
    entity.health -= amount;
    entity.hurtTime = HURT_SECONDS;
    entity.provoked = PROVOKED_SECONDS;
    const dx = entity.x - fromX;
    const dz = entity.z - fromZ;
    const len = Math.hypot(dx, dz) || 1;
    entity.vx = (dx / len) * KNOCKBACK_SPEED;
    entity.vz = (dz / len) * KNOCKBACK_SPEED;
    entity.vy = Math.max(entity.vy, KNOCKBACK_LIFT);
  }

  raycast(origin: Vec3, dir: Vec3, maxDistance: number): { entity: Entity; distance: number } | null {
    let best: { entity: Entity; distance: number } | null = null;
    for (const entity of this.entities) {
      const hw = entity.def.size.w / 2;
      const t = rayBox(origin, dir, entity.x - hw, entity.y, entity.z - hw, entity.x + hw, entity.y + entity.def.size.h, entity.z + hw);
      if (t === null || t > maxDistance) continue;
      if (!best || t < best.distance) best = { entity, distance: t };
    }
    return best;
  }

  clear(): void {
    this.entities.length = 0;
  }

  toJSON(): EntitySave[] {
    return this.entities.map((e) => ({ type: e.def.id, x: e.x, y: e.y, z: e.z, yaw: e.yaw, health: e.health }));
  }

  load(saves: unknown): void {
    this.clear();
    if (!Array.isArray(saves)) return;
    for (const raw of saves) {
      if (!raw || typeof raw !== "object") continue;
      const save = raw as Partial<EntitySave>;
      const def = CREATURES.find((c) => c.id === save.type);
      if (!def || ![save.x, save.y, save.z].every((v) => typeof v === "number" && Number.isFinite(v))) continue;
      const entity = this.create(def, save.x as number, save.y as number, save.z as number);
      if (typeof save.yaw === "number") entity.yaw = save.yaw;
      if (typeof save.health === "number" && save.health > 0) entity.health = Math.min(def.health, save.health);
    }
  }

  private kill(index: number, hooks: EntityHooks): void {
    const [entity] = this.entities.splice(index, 1);
    for (const stack of lootFor(entity.def, this.rng)) hooks.dropLoot?.(stack, entity.x, entity.y + 0.5, entity.z);
  }

  private update(world: EntityWorld, entity: Entity, player: PlayerTarget, dt: number, think: boolean, hooks: EntityHooks): void {
    const def = entity.def;
    entity.age += dt;
    entity.stateTime += dt;
    entity.hurtTime = Math.max(0, entity.hurtTime - dt);
    entity.provoked = Math.max(0, entity.provoked - dt);
    entity.attackCooldown = Math.max(0, entity.attackCooldown - dt);

    const dx = player.x - entity.x;
    const dz = player.z - entity.z;
    const distance = Math.hypot(dx, player.y - entity.y, dz);
    if (think) {
      const bx = Math.floor(entity.x);
      const by = Math.floor(entity.y + def.size.h * 0.5);
      const bz = Math.floor(entity.z);
      const eye = { x: entity.x, y: entity.y + def.size.h * 0.85, z: entity.z };
      const target = { x: player.x, y: player.y + player.eyeHeight, z: player.z };
      const perception: Perception = {
        distance,
        canSee: distance < 40 && raycastLine(world, eye, target),
        light: effectiveLight(world, bx, by, bz, world.isNight),
        isNight: world.isNight,
        playerAlive: player.alive
      };
      applyDecision(entity, decide(entity, perception, this.rng));
    }

    if (def.burnsInDaylight && !world.isNight) {
      const head = world.getSkyLight(Math.floor(entity.x), Math.floor(entity.y + def.size.h), Math.floor(entity.z));
      if (head >= 15) {
        entity.burnTimer += dt;
        if (entity.burnTimer >= 1) {
          entity.burnTimer -= 1;
          entity.health -= BURN_DAMAGE_PER_SECOND;
          entity.hurtTime = HURT_SECONDS;
        }
      }
    }

    let heading = entity.heading;
    if (entity.state === "approach" || entity.state === "attack") heading = Math.atan2(dx, dz);
    if (entity.state === "flee") heading = Math.atan2(-dx, -dz);
    const speed = desiredSpeed(entity);
    const knocked = entity.hurtTime > HURT_SECONDS * 0.6;
    if (!knocked) {
      const blend = Math.min(1, dt * 8);
      entity.vx += (Math.sin(heading) * speed - entity.vx) * blend;
      entity.vz += (Math.cos(heading) * speed - entity.vz) * blend;
    }
    if (speed > 0) entity.yaw = heading;

    if (isFlyer(def)) {
      const targetY = entity.state === "approach" || entity.state === "attack" ? player.y + 1 : world.highestSolidY(Math.floor(entity.x), Math.floor(entity.z)) + 3;
      entity.vy += (Math.sign(targetY - entity.y) * Math.min(2, Math.abs(targetY - entity.y)) - entity.vy) * Math.min(1, dt * 3);
    } else {
      entity.vy = Math.max(TERMINAL_VELOCITY, entity.vy + GRAVITY * dt);
    }

    const result = moveWithCollision(world, entity.x, entity.y, entity.z, entity.vx * dt, entity.vy * dt, entity.vz * dt, {
      width: def.size.w,
      height: def.size.h,
      stepHeight: entity.onGround ? 0.55 : 0
    });
    if (result.hitWall && result.onGround && speed > 0 && !isFlyer(def)) entity.vy = JUMP_SPEED;
    else if (result.onGround && entity.vy < 0) entity.vy = 0;
    if (result.hitCeiling && entity.vy > 0) entity.vy = 0;
    if (result.inWater && !isFlyer(def)) entity.vy = Math.max(entity.vy, 1.5);
    const moved = Math.hypot(result.x - entity.x, result.z - entity.z);
    entity.walkPhase += moved * 2.4;
    entity.x = result.x;
    entity.y = result.y;
    entity.z = result.z;
    entity.onGround = result.onGround;

    if (entity.state === "attack" && entity.attackCooldown <= 0 && player.alive) {
      entity.attackCooldown = def.ranged ? def.ranged.cooldown : MELEE_COOLDOWN_SECONDS;
      const amount = def.ranged ? def.ranged.damage : def.damage;
      const len = Math.hypot(dx, dz) || 1;
      if (amount > 0) hooks.damagePlayer?.(amount, entity, dx / len, dz / len);
    }
  }
}

export function rayBox(
  o: Vec3,
  d: Vec3,
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number
): number | null {
  let tMin = 0;
  let tMax = Number.POSITIVE_INFINITY;
  const axes: [number, number, number, number][] = [
    [o.x, d.x, minX, maxX],
    [o.y, d.y, minY, maxY],
    [o.z, d.z, minZ, maxZ]
  ];
  for (const [origin, dir, lo, hi] of axes) {
    if (Math.abs(dir) < 1e-12) {
      if (origin < lo || origin > hi) return null;
      continue;
    }
    let t1 = (lo - origin) / dir;
    let t2 = (hi - origin) / dir;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return null;
  }
  return tMin;
}
