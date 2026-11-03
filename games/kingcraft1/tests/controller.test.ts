import { describe, expect, it } from "vitest";
import { B } from "../src/content/blocks";
import {
  FLY_SPEED,
  GRAVITY,
  JUMP_VELOCITY,
  PLAYER_EYE_HEIGHT,
  RUN_SPEED,
  SWIM_SPEED,
  WALK_SPEED
} from "../src/config";
import {
  IDLE_INPUT,
  MAX_PITCH,
  PlayerController,
  clampPitch,
  wrapYaw,
  type MoveInput,
  type PlayerWorld
} from "../src/player/controller";

const FLOOR_TOP = 10;
const DT = 1 / 60;

function flatWorld(): PlayerWorld {
  return { getBlock: (_x, y) => (y < FLOOR_TOP ? B.STONE : B.AIR) };
}

function poolWorld(): PlayerWorld {
  return { getBlock: (_x, y) => (y < 2 ? B.STONE : y < 60 ? B.WATER : B.AIR) };
}

function input(overrides: Partial<MoveInput>): MoveInput {
  return { ...IDLE_INPUT, ...overrides };
}

function run(player: PlayerController, move: MoveInput, seconds: number, each?: () => void): void {
  const steps = Math.round(seconds / DT);
  for (let i = 0; i < steps; i++) {
    player.move(move, DT);
    each?.();
  }
}

function horizontalSpeed(player: PlayerController): number {
  return Math.hypot(player.state.velocity.x, player.state.velocity.z);
}

function settle(player: PlayerController): void {
  run(player, IDLE_INPUT, 1);
}

describe("PlayerController", () => {
  it("lands on the floor and stays there", () => {
    const player = new PlayerController(flatWorld(), { x: 0.5, y: FLOOR_TOP + 3, z: 0.5 });
    settle(player);
    expect(player.state.onGround).toBe(true);
    expect(player.state.position.y).toBeCloseTo(FLOOR_TOP, 6);
    expect(player.state.velocity.y).toBe(0);
  });

  it("accelerates to WALK_SPEED without overshooting", () => {
    const player = new PlayerController(flatWorld(), { x: 0.5, y: FLOOR_TOP, z: 0.5 });
    settle(player);
    let peak = 0;
    run(player, input({ forward: 1 }), 2, () => {
      peak = Math.max(peak, horizontalSpeed(player));
    });
    expect(horizontalSpeed(player)).toBeCloseTo(WALK_SPEED, 2);
    expect(peak).toBeLessThanOrEqual(WALK_SPEED + 1e-9);
    expect(player.state.position.z).toBeLessThan(0);
  });

  it("sprints at RUN_SPEED and normalises diagonal input", () => {
    const player = new PlayerController(flatWorld(), { x: 0.5, y: FLOOR_TOP, z: 0.5 });
    settle(player);
    run(player, input({ forward: 1, strafe: 1, sprint: true }), 2);
    expect(player.state.sprinting).toBe(true);
    expect(horizontalSpeed(player)).toBeCloseTo(RUN_SPEED, 2);
  });

  it("follows yaw: yaw +90 degrees walks toward -X", () => {
    const player = new PlayerController(flatWorld(), { x: 0.5, y: FLOOR_TOP, z: 0.5 });
    settle(player);
    player.look(Math.PI / 2, 0);
    run(player, input({ forward: 1 }), 1);
    expect(player.state.position.x).toBeLessThan(-2);
    expect(Math.abs(player.state.position.z - 0.5)).toBeLessThan(1e-6);
  });

  it("jumps to an apex close to v^2 / 2g", () => {
    const player = new PlayerController(flatWorld(), { x: 0.5, y: FLOOR_TOP, z: 0.5 });
    settle(player);
    let apex = 0;
    player.move(input({ jump: true }), DT);
    run(player, IDLE_INPUT, 1.5, () => {
      apex = Math.max(apex, player.state.position.y - FLOOR_TOP);
    });
    const ideal = (JUMP_VELOCITY * JUMP_VELOCITY) / (2 * -GRAVITY);
    expect(apex).toBeGreaterThan(ideal * 0.9);
    expect(apex).toBeLessThan(ideal * 1.05);
    expect(player.state.onGround).toBe(true);
  });

  it("cannot jump while airborne", () => {
    const player = new PlayerController(flatWorld(), { x: 0.5, y: FLOOR_TOP + 20, z: 0.5 });
    player.move(input({ jump: true }), DT);
    expect(player.state.velocity.y).toBeLessThan(0);
  });

  it("caps swimming speed at SWIM_SPEED in every axis", () => {
    const player = new PlayerController(poolWorld(), { x: 0.5, y: 30, z: 0.5 });
    let peakH = 0;
    let peakV = 0;
    run(player, input({ forward: 1, sprint: true }), 2, () => {
      peakH = Math.max(peakH, horizontalSpeed(player));
      peakV = Math.max(peakV, Math.abs(player.state.velocity.y));
    });
    expect(player.state.inWater).toBe(true);
    expect(player.state.sprinting).toBe(false);
    expect(peakH).toBeLessThanOrEqual(SWIM_SPEED + 1e-9);
    expect(peakV).toBeLessThanOrEqual(SWIM_SPEED + 1e-9);
    const before = player.state.position.y;
    run(player, input({ jump: true }), 1);
    expect(player.state.position.y).toBeGreaterThan(before);
  });

  it("flying ignores gravity and moves at FLY_SPEED only when allowed", () => {
    const grounded = new PlayerController(flatWorld(), { x: 0.5, y: 40, z: 0.5 });
    grounded.move(input({ fly: true }), DT);
    expect(grounded.state.flying).toBe(false);

    const flyer = new PlayerController(flatWorld(), { x: 0.5, y: 40, z: 0.5 }, { canFly: true });
    run(flyer, input({ fly: true }), 1);
    expect(flyer.state.flying).toBe(true);
    expect(flyer.state.position.y).toBeCloseTo(40, 6);
    run(flyer, input({ fly: true, forward: 1 }), 2);
    expect(horizontalSpeed(flyer)).toBeCloseTo(FLY_SPEED, 2);
    run(flyer, input({ fly: true, jump: true }), 1);
    expect(flyer.state.position.y).toBeGreaterThan(45);
  });

  it("stops at walls instead of passing through", () => {
    const world: PlayerWorld = {
      getBlock: (_x, y, z) => (y < FLOOR_TOP || (z <= -3 && y < FLOOR_TOP + 4) ? B.STONE : B.AIR)
    };
    const player = new PlayerController(world, { x: 0.5, y: FLOOR_TOP, z: 0.5 });
    settle(player);
    run(player, input({ forward: 1 }), 3);
    expect(player.state.position.z).toBeCloseTo(-2 + 0.3, 6);
    expect(player.state.velocity.z).toBe(0);
  });

  it("freezes while the player's chunk is not loaded", () => {
    const world: PlayerWorld = { getBlock: () => B.AIR, isBlockLoaded: () => false };
    const player = new PlayerController(world, { x: 0.5, y: 50, z: 0.5 });
    run(player, input({ forward: 1 }), 1);
    expect(player.state.position).toEqual({ x: 0.5, y: 50, z: 0.5 });
  });

  it("clamps pitch to +-89 degrees and wraps yaw", () => {
    const player = new PlayerController(flatWorld(), { x: 0, y: FLOOR_TOP, z: 0 });
    player.look(0, 10);
    expect(player.state.pitch).toBe(MAX_PITCH);
    player.look(0, -20);
    expect(player.state.pitch).toBe(-MAX_PITCH);
    player.look(Math.PI * 3, 0);
    expect(player.state.yaw).toBeCloseTo(-Math.PI, 9);
    expect(wrapYaw(Math.PI / 2 + Math.PI * 4)).toBeCloseTo(Math.PI / 2, 9);
    expect(wrapYaw(-Math.PI / 2 - Math.PI * 2)).toBeCloseTo(-Math.PI / 2, 9);
    expect(clampPitch(0.5)).toBe(0.5);
  });

  it("reports eye position and look direction for the camera", () => {
    const player = new PlayerController(flatWorld(), { x: 2, y: FLOOR_TOP, z: 3 });
    expect(player.eyePosition()).toEqual({ x: 2, y: FLOOR_TOP + PLAYER_EYE_HEIGHT, z: 3 });
    const dir = player.lookDirection();
    expect(dir.x).toBeCloseTo(0, 9);
    expect(dir.y).toBeCloseTo(0, 9);
    expect(dir.z).toBeCloseTo(-1, 9);
  });

  it("respawns with zeroed motion", () => {
    const player = new PlayerController(flatWorld(), { x: 0.5, y: FLOOR_TOP + 10, z: 0.5 });
    run(player, IDLE_INPUT, 0.3);
    player.spawnAt({ x: 5, y: FLOOR_TOP, z: 5 });
    expect(player.state.position).toEqual({ x: 5, y: FLOOR_TOP, z: 5 });
    expect(player.state.velocity).toEqual({ x: 0, y: 0, z: 0 });
  });
});
