import { describe, expect, it } from "vitest";
import { B } from "../src/content/blocks";
import { Inventory } from "../src/gameplay/inventory";
import { PlayerStats } from "../src/player/stats";
import { ChunkEncoder, buildSave, decodeChunks, type SaveInput } from "../src/save/saveLoad";
import { World } from "../src/voxels/world";

// Well above the terrain but below the world ceiling (96), so setBlock actually changes the cell.
const Y = 90;

function localIndex(x: number, y: number, z: number): number {
  return (y * 16 + z) * 16 + x;
}

function payload(world: World): SaveInput {
  return {
    seed: world.seedInt,
    mode: "survival",
    time: world.time,
    player: { x: 0.5, y: 70, z: 0.5, yaw: 0, pitch: 0, respawn: null },
    stats: new PlayerStats().toJSON(),
    inventory: new Inventory().toJSON(),
    containers: [],
    entities: [],
    chunks: world.modifiedChunkData()
  };
}

function saveWith(world: World, encoder: ChunkEncoder) {
  return buildSave(payload(world), (key, blocks) => encoder.encode(key, world.chunkRevision(key), blocks));
}

describe("chunk revisions", () => {
  it("starts at zero and changes only for the edited chunk", () => {
    const world = new World(5);
    world.ensureChunk(0, 0);
    world.ensureChunk(1, 0);
    expect(world.chunkRevision("0,0")).toBe(0);
    expect(world.setBlock(3, Y, 3, B.STONE)).toBe(true);
    expect(world.chunkRevision("0,0")).toBe(1);
    expect(world.chunkRevision("1,0")).toBe(0);
  });
});

describe("ChunkEncoder", () => {
  it("encodes a chunk once while its revision is unchanged", () => {
    const world = new World(5);
    world.ensureChunk(0, 0);
    world.setBlock(3, Y, 3, B.STONE);
    const encoder = new ChunkEncoder();

    const first = saveWith(world, encoder);
    const second = saveWith(world, encoder);

    expect(encoder.encodedCount).toBe(1);
    expect(second.chunks["0,0"]).toBe(first.chunks["0,0"]);
    expect(decodeChunks(first).get("0,0")).toEqual(world.getChunkIfLoaded(0, 0)?.blocks);
  });

  it("re-encodes a chunk after it is edited again", () => {
    const world = new World(5);
    world.ensureChunk(0, 0);
    world.setBlock(3, Y, 3, B.STONE);
    const encoder = new ChunkEncoder();
    const first = saveWith(world, encoder);

    world.setBlock(4, Y, 4, B.PLANKS);
    const second = saveWith(world, encoder);

    expect(encoder.encodedCount).toBe(2);
    expect(second.chunks["0,0"]).not.toBe(first.chunks["0,0"]);
    const decoded = decodeChunks(second).get("0,0");
    expect(decoded).toEqual(world.getChunkIfLoaded(0, 0)?.blocks);
    expect(decoded?.[localIndex(4, Y, 4)]).toBe(B.PLANKS);
    expect(decoded?.[localIndex(3, Y, 3)]).toBe(B.STONE);
  });

  it("keeps the cached text for chunks that stay unchanged while another changes", () => {
    const world = new World(5);
    world.ensureChunk(0, 0);
    world.ensureChunk(1, 0);
    world.setBlock(3, Y, 3, B.STONE);
    world.setBlock(20, Y, 3, B.STONE);
    const encoder = new ChunkEncoder();
    const first = saveWith(world, encoder);

    world.setBlock(4, Y, 4, B.PLANKS);
    const second = saveWith(world, encoder);

    expect(encoder.encodedCount).toBe(3);
    expect(second.chunks["1,0"]).toBe(first.chunks["1,0"]);
  });

  it("drops cached text for chunks the world no longer holds", () => {
    const world = new World(5);
    world.ensureChunk(0, 0);
    world.setBlock(3, Y, 3, B.STONE);
    const encoder = new ChunkEncoder();
    saveWith(world, encoder);
    expect(encoder.encodedCount).toBe(1);

    encoder.retain([]);
    saveWith(world, encoder);
    expect(encoder.encodedCount).toBe(2);
  });
});
