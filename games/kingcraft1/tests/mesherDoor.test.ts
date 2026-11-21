import { describe, expect, it } from "vitest";
import { B } from "../src/content/blocks";
import { Chunk, localIndex } from "../src/voxels/chunk";
import { buildChunkMesh, type MeshSource } from "../src/voxels/mesher";

const Y = 20;

function source(blocks: Record<string, number>): MeshSource {
  return {
    getBlock: (x, y, z) => blocks[`${x},${y},${z}`] ?? 0,
    getSkyLight: () => 15,
    getBlockLight: () => 0
  };
}

function doorOnly(id: number): Chunk {
  const chunk = new Chunk(0, 0);
  chunk.blocks[localIndex(3, Y, 3)] = id;
  return chunk;
}

function bounds(mesh: ReturnType<typeof buildChunkMesh>) {
  const p = mesh.opaque.positions;
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < p.length; i += 3) {
    minX = Math.min(minX, p[i]);
    maxX = Math.max(maxX, p[i]);
    minZ = Math.min(minZ, p[i + 2]);
    maxZ = Math.max(maxZ, p[i + 2]);
  }
  return { minX, maxX, minZ, maxZ };
}

const wallAlongX = { [`2,${Y},3`]: B.PLANKS, [`4,${Y},3`]: B.PLANKS };
const wallAlongZ = { [`3,${Y},2`]: B.PLANKS, [`3,${Y},4`]: B.PLANKS };

describe("door geometry", () => {
  it("renders a closed door as a thin leaf spanning the wall it sits in", () => {
    const mesh = buildChunkMesh(source(wallAlongX), doorOnly(B.DOOR_CLOSED), () => 0);
    const b = bounds(mesh);
    expect(b.minX).toBeCloseTo(3);
    expect(b.maxX).toBeCloseTo(4);
    expect(b.maxZ - b.minZ).toBeCloseTo(0.1875);
    expect((b.minZ + b.maxZ) / 2).toBeCloseTo(3.5);
  });

  it("turns the leaf with a wall that runs the other way", () => {
    const mesh = buildChunkMesh(source(wallAlongZ), doorOnly(B.DOOR_CLOSED), () => 0);
    const b = bounds(mesh);
    expect(b.minZ).toBeCloseTo(3);
    expect(b.maxZ).toBeCloseTo(4);
    expect(b.maxX - b.minX).toBeCloseTo(0.1875);
    expect((b.minX + b.maxX) / 2).toBeCloseTo(3.5);
  });

  it("renders an open door as a leaf turned out of the doorway", () => {
    const mesh = buildChunkMesh(source(wallAlongX), doorOnly(B.DOOR_OPEN), () => 0);
    const b = bounds(mesh);
    expect(b.minX).toBeCloseTo(3);
    expect(b.maxX - b.minX).toBeCloseTo(0.1875);
    expect(b.minZ).toBeCloseTo(3);
    expect(b.maxZ).toBeCloseTo(4);
  });

  it("still emits six faces so the leaf is not hollow", () => {
    const mesh = buildChunkMesh(source(wallAlongX), doorOnly(B.DOOR_CLOSED), () => 0);
    expect(mesh.opaque.indices.length).toBe(6 * 6);
  });
});
