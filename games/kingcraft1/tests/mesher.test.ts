import { describe, expect, it } from "vitest";
import { CHUNK_SX, CHUNK_SY, CHUNK_SZ } from "../src/config";
import { B } from "../src/content/blocks";
import { Chunk } from "../src/voxels/chunk";
import { buildChunkMesh, FACE_PX, MeshArrays, MeshSource, TileOf } from "../src/voxels/mesher";

class FakeSource implements MeshSource {
  blocks = new Map<string, number>();
  sky = new Map<string, number>();
  block = new Map<string, number>();
  chunk: Chunk | null;

  constructor(chunk: Chunk | null = null) {
    this.chunk = chunk;
  }

  key(x: number, y: number, z: number): string {
    return `${x},${y},${z}`;
  }

  getBlock(x: number, y: number, z: number): number {
    if (this.chunk) {
      const own = this.chunk.getBlock(x, y, z);
      if (own !== 0) return own;
    }
    return this.blocks.get(this.key(x, y, z)) ?? 0;
  }

  getSkyLight(x: number, y: number, z: number): number {
    return this.sky.get(this.key(x, y, z)) ?? 15;
  }

  getBlockLight(x: number, y: number, z: number): number {
    return this.block.get(this.key(x, y, z)) ?? 0;
  }
}

const tileByFace: TileOf = (_id, face) => face;
const visibleTile: TileOf = () => 5;

function quadCount(mesh: MeshArrays): number {
  return mesh.indices.length / 6;
}

function vertexCount(mesh: MeshArrays): number {
  return mesh.positions.length / 3;
}

function place(chunk: Chunk, x: number, y: number, z: number, id: number): void {
  chunk.setBlockRaw(x, y, z, id);
}

describe("buildChunkMesh", () => {
  it("renders all six faces for an isolated opaque block", () => {
    const chunk = new Chunk(0, 0);
    place(chunk, 8, 40, 8, B.STONE);
    const mesh = buildChunkMesh(new FakeSource(chunk), chunk, tileByFace);
    expect(quadCount(mesh.opaque)).toBe(6);
    expect(vertexCount(mesh.opaque)).toBe(24);
    expect(quadCount(mesh.water)).toBe(0);
    expect(quadCount(mesh.plants)).toBe(0);
  });

  it("culls shared faces between adjacent opaque blocks", () => {
    const chunk = new Chunk(0, 0);
    place(chunk, 8, 40, 8, B.STONE);
    place(chunk, 8, 41, 8, B.STONE);
    const mesh = buildChunkMesh(new FakeSource(chunk), chunk, tileByFace);
    expect(quadCount(mesh.opaque)).toBe(10);
  });

  it("renders nothing for a fully buried block", () => {
    const chunk = new Chunk(0, 0);
    const source = new FakeSource();
    place(chunk, 8, 40, 8, B.STONE);
    source.blocks.set(source.key(9, 40, 8), B.STONE);
    source.blocks.set(source.key(7, 40, 8), B.STONE);
    source.blocks.set(source.key(8, 41, 8), B.STONE);
    source.blocks.set(source.key(8, 39, 8), B.STONE);
    source.blocks.set(source.key(8, 40, 9), B.STONE);
    source.blocks.set(source.key(8, 40, 7), B.STONE);
    const mesh = buildChunkMesh(source, chunk, tileByFace);
    expect(quadCount(mesh.opaque)).toBe(0);
  });

  it("culls border faces only when the neighboring chunk has an opaque block", () => {
    const chunk = new Chunk(0, 0);
    place(chunk, 15, 40, 8, B.STONE);
    const source = new FakeSource();
    expect(quadCount(buildChunkMesh(source, chunk, tileByFace).opaque)).toBe(6);
    source.blocks.set(source.key(16, 40, 8), B.STONE);
    expect(quadCount(buildChunkMesh(source, chunk, tileByFace).opaque)).toBe(5);
  });

  it("renders cross blocks as two plant quads in the plant batch", () => {
    const chunk = new Chunk(0, 0);
    place(chunk, 4, 40, 4, B.TALL_GRASS);
    const mesh = buildChunkMesh(new FakeSource(chunk), chunk, tileByFace);
    expect(quadCount(mesh.plants)).toBe(2);
    expect(vertexCount(mesh.plants)).toBe(8);
    expect(quadCount(mesh.opaque)).toBe(0);
    for (let i = 1; i < mesh.plants.normals.length; i += 3) {
      expect(mesh.plants.normals[i]).toBe(1);
    }
  });

  it("renders six water faces for an isolated water block", () => {
    const chunk = new Chunk(0, 0);
    place(chunk, 5, 10, 5, B.WATER);
    const mesh = buildChunkMesh(new FakeSource(chunk), chunk, tileByFace);
    expect(quadCount(mesh.water)).toBe(6);
    expect(quadCount(mesh.opaque)).toBe(0);
  });

  it("culls water faces between adjacent water blocks", () => {
    const chunk = new Chunk(0, 0);
    place(chunk, 5, 10, 5, B.WATER);
    place(chunk, 6, 10, 5, B.WATER);
    const mesh = buildChunkMesh(new FakeSource(chunk), chunk, tileByFace);
    expect(quadCount(mesh.water)).toBe(10);
  });

  it("culls water against solid neighbors and keeps opaque faces against water", () => {
    const chunk = new Chunk(0, 0);
    place(chunk, 5, 39, 5, B.STONE);
    place(chunk, 5, 40, 5, B.WATER);
    const mesh = buildChunkMesh(new FakeSource(chunk), chunk, tileByFace);
    expect(quadCount(mesh.water)).toBe(5);
    expect(quadCount(mesh.opaque)).toBe(6);
  });

  it("culls faces between identical non-opaque cubes", () => {
    const chunk = new Chunk(0, 0);
    place(chunk, 5, 40, 5, B.GLASS);
    const mesh = buildChunkMesh(new FakeSource(chunk), chunk, tileByFace);
    expect(quadCount(mesh.opaque)).toBe(6);
    place(chunk, 6, 40, 5, B.GLASS);
    const pair = buildChunkMesh(new FakeSource(chunk), chunk, tileByFace);
    expect(quadCount(pair.opaque)).toBe(10);
  });

  it("keeps non-identical non-opaque neighbors visible", () => {
    const chunk = new Chunk(0, 0);
    place(chunk, 5, 40, 5, B.GLASS);
    place(chunk, 6, 40, 5, B.ICE);
    const mesh = buildChunkMesh(new FakeSource(chunk), chunk, tileByFace);
    expect(quadCount(mesh.opaque)).toBe(12);
  });

  it("samples per-face sky and block light from the adjacent cell", () => {
    const chunk = new Chunk(0, 0);
    place(chunk, 8, 40, 8, B.STONE);
    const source = new FakeSource();
    source.sky.set(source.key(8, 41, 8), 7);
    source.block.set(source.key(9, 40, 8), 9);
    const mesh = buildChunkMesh(source, chunk, tileByFace);
    let topVerts = 0;
    let eastVerts = 0;
    for (let v = 0; v < vertexCount(mesh.opaque); v++) {
      const ny = mesh.opaque.normals[v * 3 + 1];
      const nx = mesh.opaque.normals[v * 3];
      if (ny === 1) {
        topVerts++;
        expect(mesh.opaque.sky[v]).toBeCloseTo(7 / 15, 6);
      }
      if (nx === 1) {
        eastVerts++;
        expect(mesh.opaque.block[v]).toBeCloseTo(9 / 15, 6);
      }
      if (ny !== 1 && nx !== 1) {
        expect(mesh.opaque.sky[v]).toBe(1);
        expect(mesh.opaque.block[v]).toBe(0);
      }
    }
    expect(topVerts).toBe(4);
    expect(eastVerts).toBe(4);
  });

  it("maps uvs into the resolved atlas tile", () => {
    const chunk = new Chunk(0, 0);
    place(chunk, 8, 40, 8, B.STONE);
    const tiles: TileOf = (_id, face) => (face === FACE_PX ? 20 : 5);
    const mesh = buildChunkMesh(new FakeSource(chunk), chunk, tiles);
    for (let v = 0; v < vertexCount(mesh.opaque); v++) {
      const u = mesh.opaque.uvs[v * 2];
      const w = mesh.opaque.uvs[v * 2 + 1];
      if (mesh.opaque.normals[v * 3] === 1) {
        expect(u).toBeGreaterThanOrEqual(4 / 16);
        expect(u).toBeLessThanOrEqual(5 / 16);
        expect(w).toBeGreaterThanOrEqual(1 / 16);
        expect(w).toBeLessThanOrEqual(2 / 16);
      } else {
        expect(u).toBeGreaterThanOrEqual(5 / 16);
        expect(u).toBeLessThanOrEqual(6 / 16);
        expect(w).toBeGreaterThanOrEqual(0);
        expect(w).toBeLessThanOrEqual(1 / 16);
      }
    }
  });

  it("keeps plant uvs inside a single tile", () => {
    const chunk = new Chunk(0, 0);
    place(chunk, 4, 40, 4, B.TALL_GRASS);
    const mesh = buildChunkMesh(new FakeSource(chunk), chunk, visibleTile);
    for (let i = 0; i < mesh.plants.uvs.length; i += 2) {
      const u = mesh.plants.uvs[i];
      const w = mesh.plants.uvs[i + 1];
      expect(u).toBeGreaterThanOrEqual(5 / 16);
      expect(u).toBeLessThanOrEqual(6 / 16);
      expect(w).toBeGreaterThanOrEqual(0);
      expect(w).toBeLessThanOrEqual(1 / 16);
    }
  });

  it("emits chunk-local positions", () => {
    const chunk = new Chunk(2, 3);
    place(chunk, 15, 40, 15, B.STONE);
    const mesh = buildChunkMesh(new FakeSource(chunk), chunk, tileByFace);
    const positions = mesh.opaque.positions;
    let maxX = 0;
    let maxZ = 0;
    let maxY = 0;
    for (let i = 0; i < positions.length; i += 3) {
      expect(positions[i]).toBeGreaterThanOrEqual(0);
      expect(positions[i + 2]).toBeGreaterThanOrEqual(0);
      expect(positions[i + 1]).toBeGreaterThanOrEqual(0);
      maxX = Math.max(maxX, positions[i]);
      maxZ = Math.max(maxZ, positions[i + 2]);
      maxY = Math.max(maxY, positions[i + 1]);
    }
    expect(maxX).toBeLessThanOrEqual(CHUNK_SX);
    expect(maxZ).toBeLessThanOrEqual(CHUNK_SZ);
    expect(maxY).toBeLessThanOrEqual(CHUNK_SY);
    expect(maxX).toBe(16);
  });
});
