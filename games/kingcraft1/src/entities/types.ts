import type { CreatureDef } from "../content/creatures";

export type AiState = "idle" | "wander" | "flee" | "approach" | "attack";

export interface Entity {
  id: number;
  def: CreatureDef;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  health: number;
  state: AiState;
  stateTime: number;
  stateDuration: number;
  heading: number;
  attackCooldown: number;
  hurtTime: number;
  provoked: number;
  onGround: boolean;
  age: number;
  walkPhase: number;
  burnTimer: number;
}

export interface EntitySave {
  type: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  health: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export function isFlyer(def: CreatureDef): boolean {
  return def.model === "wisp";
}
