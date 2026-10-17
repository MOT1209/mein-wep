import { describe, expect, it } from "vitest";
import { PLAYER_HEIGHT, PLAYER_WIDTH, STEP_HEIGHT } from "../src/config";
import { B } from "../src/content/blocks";
import { moveWithCollision, overlapsSolid, type VoxelSource } from "../src/physics/collision";
import { isTargetable, raycastLine, raycastVoxel } from "../src/physics/raycast";
import { FACE_NX, FACE_NY, FACE_NZ, FACE_PX, FACE_PY, FACE_PZ } from "../src/voxels/mesher";

class TestWorld implements VoxelSource {
  private readonly blocks = new Map<string, number>();

  set(x: number, y: number, z: number, id: number): void {
    this.blocks.set(`${x},${y},${z}`, id);
  }

  getBlock(x: number, y: number, z: number): number {
    if (y < 0) return B.STONE;
    return this.blocks.get(`${x},${y},${z}`) ?? B.AIR;
  }
}

describe("collision", () => {
  it("stops horizontal movement at a wall face", () => {
    const world = new TestWorld();
    world.set(2, 0, 0, B.STONE);
    const res = moveWithCollision(world, 1.5, 0, 0.5, 2, 0, 0);
    expect(res.x).toBeCloseTo(2 - PLAYER_WIDTH / 2, 5);
    expect(res.hitWall).toBe(true);
    expect(res.onGround).toBe(true);
  });

  it("steps up onto a one block ledge when step height allows it", () => {
    const world = new TestWorld();
    world.set(2, 0, 0, B.STONE);
    const res = moveWithCollision(world, 1.5, 0, 0.5, 0.8, -0.2, 0, { stepHeight: 1.05 });
    expect(res.x).toBeGreaterThan(2);
    expect(res.y).toBeCloseTo(1, 5);
    expect(res.onGround).toBe(true);
    expect(res.hitWall).toBe(false);
  });

  it("does not step onto a full block with the default step height", () => {
    const world = new TestWorld();
    world.set(2, 0, 0, B.STONE);
    const res = moveWithCollision(world, 1.5, 0, 0.5, 2, 0, 0, { stepHeight: STEP_HEIGHT });
    expect(res.x).toBeCloseTo(1.7, 5);
    expect(res.y).toBeCloseTo(0, 5);
    expect(res.hitWall).toBe(true);
  });

  it("lands on the surface and reports onGround", () => {
    const world = new TestWorld();
    const res = moveWithCollision(world, 0.5, 3, 0.5, 0, -5, 0);
    expect(res.y).toBeCloseTo(0, 5);
    expect(res.onGround).toBe(true);
  });

  it("stops upward motion at a ceiling", () => {
    const world = new TestWorld();
    world.set(0, 3, 0, B.STONE);
    const res = moveWithCollision(world, 0.5, 0, 0.5, 0, 2, 0);
    expect(res.y).toBeCloseTo(3 - PLAYER_HEIGHT, 5);
    expect(res.hitCeiling).toBe(true);
  });

  it("does not report ground contact while airborne", () => {
    const world = new TestWorld();
    const res = moveWithCollision(world, 0.5, 4, 0.5, 0.4, 0, 0);
    expect(res.onGround).toBe(false);
    expect(res.x).toBeCloseTo(0.9, 5);
  });

  it("detects water overlap", () => {
    const world = new TestWorld();
    world.set(0, 0, 0, B.WATER);
    world.set(0, 1, 0, B.WATER);
    const res = moveWithCollision(world, 0.5, 0, 0.5, 0, 0, 0);
    expect(res.inWater).toBe(true);
    const dry = moveWithCollision(new TestWorld(), 0.5, 0, 0.5, 0, 0, 0);
    expect(dry.inWater).toBe(false);
  });

  it("reports overlapping solid volumes", () => {
    const world = new TestWorld();
    expect(overlapsSolid(world, 0.5, 0, 0.5, PLAYER_WIDTH, PLAYER_HEIGHT)).toBe(false);
    world.set(0, 1, 0, B.STONE);
    expect(overlapsSolid(world, 0.5, 0, 0.5, PLAYER_WIDTH, PLAYER_HEIGHT)).toBe(true);
  });
});

describe("raycast", () => {
  it("hits the nearest targetable block and reports entry face and distance", () => {
    const world = new TestWorld();
    world.set(4, 0, 0, B.STONE);
    world.set(2, 0, 0, B.GLASS);
    const hit = raycastVoxel(world, 0.5, 0.5, 0.5, 1, 0, 0, 10);
    expect(hit).not.toBeNull();
    expect(hit?.x).toBe(2);
    expect(hit?.id).toBe(B.GLASS);
    expect(hit?.face).toBe(FACE_NX);
    expect(hit?.distance).toBeCloseTo(1.5, 5);
  });

  it("reports the correct face from all six directions", () => {
    const world = new TestWorld();
    world.set(3, 3, 3, B.STONE);
    const cx = 3.5;
    const cy = 3.5;
    const cz = 3.5;
    const origins: Array<[number, number, number]> = [
      [cx - 3, cy, cz],
      [cx + 3, cy, cz],
      [cx, cy - 3, cz],
      [cx, cy + 3, cz],
      [cx, cy, cz - 3],
      [cx, cy, cz + 3]
    ];
    const dirs: Array<[number, number, number]> = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1]
    ];
    const faces = [FACE_NX, FACE_PX, FACE_NY, FACE_PY, FACE_NZ, FACE_PZ];
    for (let i = 0; i < origins.length; i++) {
      const [ox, oy, oz] = origins[i];
      const [dx, dy, dz] = dirs[i];
      const hit = raycastVoxel(world, ox, oy, oz, dx, dy, dz, 10);
      expect(hit?.x, `case ${i}`).toBe(3);
      expect(hit?.y, `case ${i}`).toBe(3);
      expect(hit?.z, `case ${i}`).toBe(3);
      expect(hit?.face, `case ${i}`).toBe(faces[i]);
    }
  });

  it("respects the maximum distance", () => {
    const world = new TestWorld();
    world.set(2, 0, 0, B.STONE);
    expect(raycastVoxel(world, 0.5, 0.5, 0.5, 1, 0, 0, 1)).toBeNull();
    expect(raycastVoxel(world, 0.5, 0.5, 0.5, 1, 0, 0, 1.49)).toBeNull();
    expect(raycastVoxel(world, 0.5, 0.5, 0.5, 1, 0, 0, 1.5)).not.toBeNull();
  });

  it("passes through liquids", () => {
    const world = new TestWorld();
    world.set(2, 0, 0, B.WATER);
    world.set(3, 0, 0, B.STONE);
    const hit = raycastVoxel(world, 0.5, 0.5, 0.5, 1, 0, 0, 10);
    expect(hit?.x).toBe(3);
    expect(hit?.id).toBe(B.STONE);
    expect(hit?.distance).toBeCloseTo(2.5, 5);
  });

  it("returns null in an empty world", () => {
    expect(raycastVoxel(new TestWorld(), 0.5, 0.5, 0.5, 1, 0, 0, 32)).toBeNull();
  });

  it("treats non-solid glass as targetable and liquids and air as not", () => {
    const world = new TestWorld();
    world.set(1, 0, 0, B.GLASS);
    const hit = raycastVoxel(world, 0.5, 0.5, 0.5, 1, 0, 0, 4);
    expect(hit?.id).toBe(B.GLASS);
    expect(isTargetable(B.GLASS)).toBe(true);
    expect(isTargetable(B.WATER)).toBe(false);
    expect(isTargetable(B.AIR)).toBe(false);
  });

  it("reports line of sight blocking", () => {
    const world = new TestWorld();
    const from = { x: 0.5, y: 0.5, z: 0.5 };
    const to = { x: 5.5, y: 0.5, z: 0.5 };
    expect(raycastLine(world, from, to)).toBe(true);
    world.set(3, 0, 0, B.STONE);
    expect(raycastLine(world, from, to)).toBe(false);
  });
});
