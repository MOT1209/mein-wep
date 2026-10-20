import {
  AIR_CONTROL,
  AIR_DRAG,
  FLY_SPEED,
  GRAVITY,
  GROUND_FRICTION,
  JUMP_VELOCITY,
  MAX_PLAYER_STEP_SECONDS,
  PLAYER_EYE_HEIGHT,
  RUN_SPEED,
  SNEAK_SPEED_FACTOR,
  STEP_HEIGHT,
  SWIM_SPEED,
  TERMINAL_VELOCITY,
  TICKS_PER_SECOND,
  WALK_SPEED,
  WATER_DRAG,
  WATER_GRAVITY_FACTOR
} from "../config";
import { moveWithCollision, type VoxelSource } from "../physics/collision";

export interface MoveInput {
  forward: number;
  strafe: number;
  jump: boolean;
  sneak: boolean;
  sprint: boolean;
  fly: boolean;
}

export interface PlayerWorld extends VoxelSource {
  isBlockLoaded?(x: number, z: number): boolean;
}

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export interface PlayerState {
  position: Vec3Like;
  velocity: Vec3Like;
  yaw: number;
  pitch: number;
  onGround: boolean;
  inWater: boolean;
  flying: boolean;
  sprinting: boolean;
}

export interface PlayerControllerOptions {
  canFly?: boolean;
}

export const MAX_PITCH = (89 * Math.PI) / 180;
const EPS = 1e-6;
const TWO_PI = Math.PI * 2;

export const IDLE_INPUT: Readonly<MoveInput> = {
  forward: 0,
  strafe: 0,
  jump: false,
  sneak: false,
  sprint: false,
  fly: false
};

export function wrapYaw(yaw: number): number {
  const wrapped = (((yaw + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI;
  return wrapped - Math.PI;
}

export function clampPitch(pitch: number): number {
  return Math.min(MAX_PITCH, Math.max(-MAX_PITCH, pitch));
}

function approach(current: number, target: number, keep: number, dt: number): number {
  const blend = 1 - Math.pow(keep, dt * TICKS_PER_SECOND);
  return current + (target - current) * blend;
}

export class PlayerController {
  readonly state: PlayerState;
  canFly: boolean;

  constructor(
    private readonly world: PlayerWorld,
    spawn: Vec3Like,
    options: PlayerControllerOptions = {}
  ) {
    this.canFly = options.canFly ?? false;
    this.state = {
      position: { x: spawn.x, y: spawn.y, z: spawn.z },
      velocity: { x: 0, y: 0, z: 0 },
      yaw: 0,
      pitch: 0,
      onGround: false,
      inWater: false,
      flying: false,
      sprinting: false
    };
  }

  spawnAt(point: Vec3Like): void {
    const { position, velocity } = this.state;
    position.x = point.x;
    position.y = point.y;
    position.z = point.z;
    velocity.x = 0;
    velocity.y = 0;
    velocity.z = 0;
    this.state.onGround = false;
    this.state.inWater = false;
    this.state.flying = false;
    this.state.sprinting = false;
  }

  look(dyaw: number, dpitch: number): void {
    this.state.yaw = wrapYaw(this.state.yaw + dyaw);
    this.state.pitch = clampPitch(this.state.pitch + dpitch);
  }

  eyePosition(): Vec3Like {
    const { x, y, z } = this.state.position;
    return { x, y: y + PLAYER_EYE_HEIGHT, z };
  }

  lookDirection(): Vec3Like {
    const { yaw, pitch } = this.state;
    const cosPitch = Math.cos(pitch);
    return { x: -Math.sin(yaw) * cosPitch, y: Math.sin(pitch), z: -Math.cos(yaw) * cosPitch };
  }

  move(input: MoveInput, dt: number): void {
    if (!(dt > 0)) return;
    let remaining = dt;
    while (remaining > EPS) {
      const step = Math.min(remaining, MAX_PLAYER_STEP_SECONDS);
      this.step(input, step);
      remaining -= step;
    }
  }

  private step(input: MoveInput, dt: number): void {
    const state = this.state;
    const { position, velocity } = state;
    if (this.world.isBlockLoaded && !this.world.isBlockLoaded(Math.floor(position.x), Math.floor(position.z))) {
      velocity.x = 0;
      velocity.y = 0;
      velocity.z = 0;
      return;
    }

    state.flying = this.canFly && input.fly;
    let forward = input.forward;
    let strafe = input.strafe;
    const length = Math.hypot(forward, strafe);
    if (length > 1) {
      forward /= length;
      strafe /= length;
    }
    state.sprinting = input.sprint && forward > 0 && !input.sneak && !state.inWater;

    let speed = WALK_SPEED;
    if (state.flying) speed = FLY_SPEED;
    else if (state.inWater) speed = SWIM_SPEED;
    else if (state.sprinting) speed = RUN_SPEED;
    if (input.sneak && !state.flying) speed *= SNEAK_SPEED_FACTOR;

    const sin = Math.sin(state.yaw);
    const cos = Math.cos(state.yaw);
    const targetX = (-sin * forward + cos * strafe) * speed;
    const targetZ = (-cos * forward - sin * strafe) * speed;

    let keep = AIR_CONTROL;
    if (state.flying || state.onGround) keep = GROUND_FRICTION;
    else if (state.inWater) keep = WATER_DRAG;
    velocity.x = approach(velocity.x, targetX, keep, dt);
    velocity.z = approach(velocity.z, targetZ, keep, dt);

    if (state.flying) {
      const lift = (input.jump ? 1 : 0) - (input.sneak ? 1 : 0);
      velocity.y = approach(velocity.y, lift * FLY_SPEED, GROUND_FRICTION, dt);
    } else if (state.inWater) {
      velocity.y += GRAVITY * WATER_GRAVITY_FACTOR * dt;
      if (input.jump) velocity.y = approach(velocity.y, SWIM_SPEED, WATER_DRAG, dt);
      velocity.y *= Math.pow(WATER_DRAG, dt * TICKS_PER_SECOND);
      velocity.y = Math.min(SWIM_SPEED, Math.max(-SWIM_SPEED, velocity.y));
    } else {
      if (input.jump && state.onGround) {
        velocity.y = JUMP_VELOCITY;
        state.onGround = false;
      }
      velocity.y += GRAVITY * dt;
      velocity.y *= Math.pow(AIR_DRAG, dt * TICKS_PER_SECOND);
      velocity.y = Math.max(TERMINAL_VELOCITY, velocity.y);
    }

    const dx = velocity.x * dt;
    const dy = velocity.y * dt;
    const dz = velocity.z * dt;
    const result = moveWithCollision(this.world, position.x, position.y, position.z, dx, dy, dz, {
      stepHeight: state.onGround && !state.flying ? STEP_HEIGHT : 0
    });

    if (Math.abs(result.x - position.x) + EPS < Math.abs(dx)) velocity.x = 0;
    if (Math.abs(result.z - position.z) + EPS < Math.abs(dz)) velocity.z = 0;
    if ((result.onGround && velocity.y < 0) || (result.hitCeiling && velocity.y > 0)) velocity.y = 0;

    position.x = result.x;
    position.y = result.y;
    position.z = result.z;
    state.onGround = result.onGround;
    state.inWater = result.inWater;
  }
}
