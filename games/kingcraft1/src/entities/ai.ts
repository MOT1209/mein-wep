import type { CreatureDef } from "../content/creatures";
import type { Rng } from "../core/rng";
import type { AiState, Entity } from "./types";

export const AGGRO_RADIUS = 32;
export const LOSE_INTEREST_RADIUS = 40;
export const DARK_LIGHT_THRESHOLD = 8;
export const MELEE_COOLDOWN_SECONDS = 1;
export const DEFAULT_FLEE_RADIUS = 6;
export const WANDER_SPEED_FACTOR = 0.55;
export const FLEE_SPEED_FACTOR = 1.45;

export interface Perception {
  distance: number;
  canSee: boolean;
  light: number;
  isNight: boolean;
  playerAlive: boolean;
}

export interface Decision {
  state: AiState;
  heading?: number;
  duration?: number;
}

export function meleeRange(def: CreatureDef): number {
  return 1.1 + def.size.w / 2;
}

export function isAggressive(def: CreatureDef, perception: Perception, provoked: boolean): boolean {
  if (def.damage <= 0 && !def.ranged) return false;
  if (def.category === "hostile") return perception.isNight || perception.light < DARK_LIGHT_THRESHOLD;
  if (def.category === "neutral") return provoked;
  return false;
}

export function attackRange(def: CreatureDef): number {
  return def.ranged ? def.ranged.range : meleeRange(def);
}

export function decide(entity: Entity, perception: Perception, rng: Rng): Decision {
  const def = entity.def;
  const provoked = entity.provoked > 0;
  const hurt = entity.hurtTime > 0;

  if (perception.playerAlive && isAggressive(def, perception, provoked)) {
    const chasing = entity.state === "approach" || entity.state === "attack";
    const radius = chasing ? LOSE_INTEREST_RADIUS : AGGRO_RADIUS;
    if (perception.distance <= radius && (perception.canSee || chasing)) {
      const inRange = perception.distance <= attackRange(def) && perception.canSee;
      return { state: inRange ? "attack" : "approach" };
    }
  }

  if (def.category === "passive" && perception.playerAlive) {
    const fleeRadius = def.fleeRadius ?? DEFAULT_FLEE_RADIUS;
    if (hurt || (entity.state === "flee" && entity.stateTime < 3 && perception.distance < fleeRadius * 2)) {
      return { state: "flee", duration: 3 };
    }
  }

  if (entity.state === "flee" || entity.state === "approach" || entity.state === "attack") {
    return { state: "idle", duration: rng.range(1, 3) };
  }
  if (entity.stateTime < entity.stateDuration) return { state: entity.state };
  if (entity.state === "idle") {
    return { state: "wander", heading: rng.range(-Math.PI, Math.PI), duration: rng.range(2, 5) };
  }
  return { state: "idle", duration: rng.range(1, 4) };
}

export function applyDecision(entity: Entity, decision: Decision): void {
  if (decision.state !== entity.state) {
    entity.state = decision.state;
    entity.stateTime = 0;
  }
  if (decision.heading !== undefined) entity.heading = decision.heading;
  if (decision.duration !== undefined) entity.stateDuration = decision.duration;
}

export function desiredSpeed(entity: Entity): number {
  const def = entity.def;
  switch (entity.state) {
    case "wander":
      return def.speed * WANDER_SPEED_FACTOR;
    case "flee":
      return def.speed * FLEE_SPEED_FACTOR;
    case "approach":
      return def.hostileSpeed;
    case "attack":
      return def.ranged ? 0 : def.hostileSpeed * 0.5;
    default:
      return 0;
  }
}
