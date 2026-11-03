import {
  FALL_DAMAGE_PER_BLOCK,
  FALL_DAMAGE_THRESHOLD,
  MAX_AIR,
  MAX_HEALTH,
  MAX_HUNGER,
  RESPAWN_HEALTH
} from "../config";
import { foodValue } from "../content/items";

export type DamageSource = "mob" | "fall" | "drown" | "starve" | "void";

export const AIR_LOSS_PER_SECOND = 1;
export const AIR_REFILL_PER_SECOND = 5;
export const DROWN_DAMAGE = 2;
export const DROWN_INTERVAL_SECONDS = 1;
export const STARVE_DAMAGE = 1;
export const STARVE_INTERVAL_SECONDS = 4;
export const REGEN_HUNGER_THRESHOLD = 17;
export const REGEN_INTERVAL_SECONDS = 4;
export const REGEN_EXHAUSTION = 3;
export const EXHAUSTION_PER_HUNGER = 4;
export const BASE_EXHAUSTION_PER_SECOND = 0.01;
export const MOVE_EXHAUSTION_PER_SECOND = 0.05;
export const SPRINT_EXHAUSTION_PER_SECOND = 0.2;
export const STARTING_SATURATION = 5;
export const VOID_Y = -16;

export interface StatsContext {
  y: number;
  onGround: boolean;
  inWater: boolean;
  headInWater: boolean;
  flying: boolean;
  moving: boolean;
  sprinting: boolean;
}

export interface StatsSave {
  health: number;
  hunger: number;
  saturation: number;
  air: number;
  exhaustion: number;
}

export interface DamageEvent {
  amount: number;
  source: DamageSource;
  died: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function finite(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function fallDamage(distance: number): number {
  if (distance <= FALL_DAMAGE_THRESHOLD) return 0;
  return Math.ceil((distance - FALL_DAMAGE_THRESHOLD) * FALL_DAMAGE_PER_BLOCK);
}

export class PlayerStats {
  health = MAX_HEALTH;
  hunger = MAX_HUNGER;
  saturation = STARTING_SATURATION;
  air = MAX_AIR;
  exhaustion = 0;
  lastDamage: DamageSource | null = null;
  private peakY: number | null = null;
  private drownTimer = 0;
  private starveTimer = 0;
  private regenTimer = 0;

  get dead(): boolean {
    return this.health <= 0;
  }

  damage(amount: number, source: DamageSource): DamageEvent {
    if (this.dead || amount <= 0) return { amount: 0, source, died: false };
    this.health = Math.max(0, this.health - amount);
    this.lastDamage = source;
    return { amount, source, died: this.dead };
  }

  heal(amount: number): void {
    if (this.dead) return;
    this.health = clamp(this.health + amount, 0, MAX_HEALTH);
  }

  canEat(item: string): boolean {
    return !this.dead && foodValue(item) !== undefined && this.hunger < MAX_HUNGER;
  }

  eat(item: string): boolean {
    const food = foodValue(item);
    if (!food || !this.canEat(item)) return false;
    this.hunger = clamp(this.hunger + food.hunger, 0, MAX_HUNGER);
    this.saturation = clamp(this.saturation + food.saturation, 0, this.hunger);
    return true;
  }

  addExhaustion(amount: number): void {
    this.exhaustion += amount;
    while (this.exhaustion >= EXHAUSTION_PER_HUNGER) {
      this.exhaustion -= EXHAUSTION_PER_HUNGER;
      if (this.saturation > 0) this.saturation = Math.max(0, this.saturation - 1);
      else this.hunger = Math.max(0, this.hunger - 1);
    }
  }

  tick(dt: number, ctx: StatsContext): DamageEvent[] {
    const events: DamageEvent[] = [];
    if (this.dead || dt <= 0) return events;
    const push = (event: DamageEvent): void => {
      if (event.amount > 0) events.push(event);
    };

    if (ctx.y < VOID_Y) {
      push(this.damage(this.health, "void"));
      return events;
    }

    if (ctx.flying || ctx.inWater) {
      this.peakY = null;
    } else if (ctx.onGround) {
      if (this.peakY !== null) push(this.damage(fallDamage(this.peakY - ctx.y), "fall"));
      this.peakY = null;
    } else {
      this.peakY = this.peakY === null ? ctx.y : Math.max(this.peakY, ctx.y);
    }

    if (ctx.headInWater) {
      const breathless = Math.max(0, dt - this.air / AIR_LOSS_PER_SECOND);
      this.air = Math.max(0, this.air - AIR_LOSS_PER_SECOND * dt);
      if (breathless > 0) {
        this.drownTimer += breathless;
        while (this.drownTimer >= DROWN_INTERVAL_SECONDS && !this.dead) {
          this.drownTimer -= DROWN_INTERVAL_SECONDS;
          push(this.damage(DROWN_DAMAGE, "drown"));
        }
      }
    } else {
      this.air = Math.min(MAX_AIR, this.air + AIR_REFILL_PER_SECOND * dt);
      this.drownTimer = 0;
    }

    let rate = BASE_EXHAUSTION_PER_SECOND;
    if (ctx.moving) rate += ctx.sprinting ? SPRINT_EXHAUSTION_PER_SECOND : MOVE_EXHAUSTION_PER_SECOND;
    this.addExhaustion(rate * dt);

    if (this.hunger <= 0) {
      this.starveTimer += dt;
      while (this.starveTimer >= STARVE_INTERVAL_SECONDS && !this.dead) {
        this.starveTimer -= STARVE_INTERVAL_SECONDS;
        push(this.damage(STARVE_DAMAGE, "starve"));
      }
    } else {
      this.starveTimer = 0;
    }

    if (this.hunger > REGEN_HUNGER_THRESHOLD && this.health < MAX_HEALTH && !this.dead) {
      this.regenTimer += dt;
      while (this.regenTimer >= REGEN_INTERVAL_SECONDS && this.health < MAX_HEALTH) {
        this.regenTimer -= REGEN_INTERVAL_SECONDS;
        this.heal(1);
        this.addExhaustion(REGEN_EXHAUSTION);
      }
    } else {
      this.regenTimer = 0;
    }
    return events;
  }

  respawn(): void {
    this.health = RESPAWN_HEALTH;
    this.hunger = MAX_HUNGER;
    this.saturation = STARTING_SATURATION;
    this.air = MAX_AIR;
    this.exhaustion = 0;
    this.lastDamage = null;
    this.peakY = null;
    this.drownTimer = 0;
    this.starveTimer = 0;
    this.regenTimer = 0;
  }

  toJSON(): StatsSave {
    return {
      health: this.health,
      hunger: this.hunger,
      saturation: this.saturation,
      air: this.air,
      exhaustion: this.exhaustion
    };
  }

  static fromJSON(raw: unknown): PlayerStats {
    const stats = new PlayerStats();
    if (!raw || typeof raw !== "object") return stats;
    const save = raw as Partial<StatsSave>;
    stats.health = clamp(finite(save.health, MAX_HEALTH), 0, MAX_HEALTH);
    if (stats.health <= 0) stats.health = RESPAWN_HEALTH;
    stats.hunger = clamp(finite(save.hunger, MAX_HUNGER), 0, MAX_HUNGER);
    stats.saturation = clamp(finite(save.saturation, STARTING_SATURATION), 0, stats.hunger);
    stats.air = clamp(finite(save.air, MAX_AIR), 0, MAX_AIR);
    stats.exhaustion = clamp(finite(save.exhaustion, 0), 0, EXHAUSTION_PER_HUNGER);
    return stats;
  }
}

export interface DroppedInventory {
  slots: ({ item: string; count: number; durability?: number } | null)[];
}

export function takeAllItems(inventory: DroppedInventory): { item: string; count: number; durability?: number }[] {
  const out: { item: string; count: number; durability?: number }[] = [];
  for (let i = 0; i < inventory.slots.length; i++) {
    const slot = inventory.slots[i];
    if (!slot) continue;
    out.push(slot);
    inventory.slots[i] = null;
  }
  return out;
}
