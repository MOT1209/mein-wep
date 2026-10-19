import { describe, expect, it } from "vitest";
import { ChunkStreamer, chunkCoord, spiralOffsets, type StreamRenderer } from "../src/render/streaming";
import { World } from "../src/voxels/world";

class StubRenderer implements StreamRenderer {
  readonly dirty: string[] = [];
  readonly disposed: string[] = [];

  markDirty(cx: number, cz: number): void {
    this.dirty.push(`${cx},${cz}`);
  }

  dispose(cx: number, cz: number): void {
    this.disposed.push(`${cx},${cz}`);
  }

  reset(): void {
    this.dirty.length = 0;
    this.disposed.length = 0;
  }
}

class RecordingWorld extends World {
  readonly loadOrder: string[] = [];

  override ensureChunk(cx: number, cz: number) {
    if (!this.isChunkLoaded(cx, cz)) this.loadOrder.push(`${cx},${cz}`);
    return super.ensureChunk(cx, cz);
  }
}

function ring(cx: number, cz: number): number {
  return Math.max(Math.abs(cx), Math.abs(cz));
}

describe("spiralOffsets", () => {
  it("covers the full square once, ring by ring", () => {
    const offsets = spiralOffsets(3);
    expect(offsets).toHaveLength(49);
    expect(new Set(offsets.map(([x, z]) => `${x},${z}`)).size).toBe(49);
    expect(offsets[0]).toEqual([0, 0]);
    for (let i = 1; i < offsets.length; i++) {
      expect(ring(...offsets[i])).toBeGreaterThanOrEqual(ring(...offsets[i - 1]));
    }
  });

  it("maps world coordinates to chunk coordinates with floor semantics", () => {
    expect(chunkCoord(0, 16)).toBe(0);
    expect(chunkCoord(15.9, 16)).toBe(0);
    expect(chunkCoord(16, 16)).toBe(1);
    expect(chunkCoord(-0.1, 16)).toBe(-1);
    expect(chunkCoord(-16, 16)).toBe(-1);
    expect(chunkCoord(-16.1, 16)).toBe(-2);
  });
});

describe("ChunkStreamer", () => {
  it("loads near-first in spiral order with a per-update budget", () => {
    const world = new RecordingWorld(7);
    const renderer = new StubRenderer();
    const streamer = new ChunkStreamer(world, renderer, { renderDistance: 1, loadsPerUpdate: 3 });

    const first = streamer.update(8, 8);
    expect(first.loadedLastUpdate).toBe(3);
    expect(world.loadOrder).toEqual(spiralOffsets(1).slice(0, 3).map(([x, z]) => `${x},${z}`));
    expect(first.pending).toBe(6);

    streamer.update(8, 8);
    streamer.update(8, 8);
    const done = streamer.update(8, 8);
    expect(done.loadedLastUpdate).toBe(0);
    expect(done.pending).toBe(0);
    expect(done.loaded).toBe(9);
    expect(done.loadedTotal).toBe(9);
    expect(world.loadOrder[0]).toBe("0,0");
  });

  it("marks the new chunk and its loaded neighbours dirty", () => {
    const world = new World(11);
    world.ensureChunk(1, 0);
    world.ensureChunk(0, -1);
    const renderer = new StubRenderer();
    const streamer = new ChunkStreamer(world, renderer, { renderDistance: 0 });

    streamer.update(0, 0);
    expect(renderer.dirty).toContain("0,0");
    expect(renderer.dirty).toContain("1,0");
    expect(renderer.dirty).toContain("0,-1");
    expect(renderer.dirty).not.toContain("-1,0");
    expect(renderer.dirty).not.toContain("0,1");
  });

  it("unloads only chunks past renderDistance plus margin", () => {
    const world = new World(3);
    const renderer = new StubRenderer();
    const streamer = new ChunkStreamer(world, renderer, { renderDistance: 1, unloadMargin: 1 });
    streamer.loadAllNow(0, 0);
    expect(world.loadedChunkCount).toBe(9);

    renderer.reset();
    const nearMove = streamer.update(16 + 1, 0);
    expect(nearMove.unloadedLastUpdate).toBe(0);
    expect(renderer.disposed).toHaveLength(0);

    renderer.reset();
    const farMove = streamer.update(16 * 2 + 1, 0);
    expect(farMove.centerCx).toBe(2);
    expect(farMove.unloadedLastUpdate).toBe(3);
    expect(renderer.disposed.sort()).toEqual(["-1,-1", "-1,0", "-1,1"]);
    expect(world.isChunkLoaded(-1, 0)).toBe(false);
    expect(world.isChunkLoaded(0, 0)).toBe(true);
    expect(renderer.dirty).toContain("0,0");
    expect(farMove.unloadedTotal).toBe(3);
  });

  it("keeps counters consistent with the world", () => {
    const world = new World(5);
    const renderer = new StubRenderer();
    const streamer = new ChunkStreamer(world, renderer, { renderDistance: 2, loadsPerUpdate: 4 });
    let stats = streamer.update(-20, 40);
    for (let i = 0; i < 10 && stats.pending > 0; i++) stats = streamer.update(-20, 40);
    expect(stats.pending).toBe(0);
    expect(stats.loaded).toBe(world.loadedChunkCount);
    expect(stats.loaded).toBe(25);
    expect(stats.centerCx).toBe(-2);
    expect(stats.centerCz).toBe(2);
    expect(stats.loadedTotal - stats.unloadedTotal).toBe(stats.loaded);
  });
});
