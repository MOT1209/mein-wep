import { describe, expect, it } from "vitest";
import { B } from "../src/content/blocks";
import { Chunk } from "../src/voxels/chunk";
import { buildChunkMesh, vertexOcclusion, type MeshSource, type TileOf } from "../src/voxels/mesher";

class FlatSource implements MeshSource {
  blocks = new Map<string, number>();
  getBlock(x: number, y: number, z: number): number {
    return this.blocks.get(`${x},${y},${z}`) ?? 0;
  }
  getSkyLight(): number {
    return 15;
  }
  getBlockLight(): number {
    return 0;
  }
}

const tile: TileOf = () => 1;

describe("ambient occlusion", () => {
  it("darkens a vertex with each solid neighbour and worst when both sides are solid", () => {
    expect(vertexOcclusion(false, false, false)).toBe(1);
    expect(vertexOcclusion(true, false, false)).toBe(0.82);
    expect(vertexOcclusion(true, false, true)).toBe(0.66);
    expect(vertexOcclusion(true, true, false)).toBe(0.5);
    expect(vertexOcclusion(true, true, true)).toBe(0.5);
  });

  it("leaves an isolated block fully open", () => {
    const chunk = new Chunk(0, 0);
    chunk.setBlockRaw(8, 40, 8, B.STONE);
    const mesh = buildChunkMesh(new FlatSource(), chunk, tile);
    expect(mesh.opaque.ao.length).toBe(mesh.opaque.positions.length / 3);
    for (const value of mesh.opaque.ao) expect(value).toBe(1);
  });

  it("darkens the ground face beside a wall block", () => {
    const chunk = new Chunk(0, 0);
    chunk.setBlockRaw(8, 40, 8, B.STONE);
    const source = new FlatSource();
    source.blocks.set("9,41,8", B.STONE);
    const mesh = buildChunkMesh(source, chunk, tile);
    let dark = 0;
    let top = 0;
    for (let v = 0; v < mesh.opaque.positions.length / 3; v++) {
      if (mesh.opaque.normals[v * 3 + 1] !== 1) continue;
      top++;
      if (mesh.opaque.ao[v] < 1) dark++;
    }
    expect(top).toBe(4);
    expect(dark).toBe(2);
  });

  it("keeps plants unoccluded", () => {
    const chunk = new Chunk(0, 0);
    chunk.setBlockRaw(4, 40, 4, B.TALL_GRASS);
    const mesh = buildChunkMesh(new FlatSource(), chunk, tile);
    for (const value of mesh.plants.ao) expect(value).toBe(1);
  });
});
