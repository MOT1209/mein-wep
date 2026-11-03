import { describe, expect, it } from "vitest";
import { CHUNK_SX, CHUNK_SZ, CHUNK_SY, SEA_LEVEL } from "../src/config";
import { B, lightFilterOf } from "../src/content/blocks";
import { DAY_TICKS, World } from "../src/voxels/world";
import { localIndex } from "../src/voxels/chunk";
import { BIOME } from "../src/voxels/biomes";

function forEachChunkIn(radius: number, visit: (cx: number, cz: number) => boolean): void {
  for (let cx = -radius; cx <= radius; cx++) {
    for (let cz = -radius; cz <= radius; cz++) {
      if (visit(cx, cz)) return;
    }
  }
}

describe("world generation", () => {
  it("places bedrock at the bottom and terrain below the surface", () => {
    const world = new World(12345);
    const chunk = world.ensureChunk(0, 0);
    expect(chunk.blocks[localIndex(0, 0, 0)]).toBe(B.BEDROCK);
    const h = chunk.columnHeight(4, 4);
    expect(h).toBeGreaterThan(1);
    expect(world.getBlock(4, h, 4)).not.toBe(B.AIR);
    expect(world.getBlock(4, CHUNK_SY - 1, 4)).toBe(B.AIR);
  });

  it("fills ocean columns with water up to sea level", () => {
    const world = new World(777);
    let found = false;
    for (let wx = -640; wx <= 640 && !found; wx += 32) {
      for (let wz = -640; wz <= 640; wz += 32) {
        const h = world.generator.columnHeight(wx, wz);
        if (h >= SEA_LEVEL - 3) continue;
        if (world.generator.biomeAtColumn(wx, wz, h) !== BIOME.OCEAN) continue;
        const cx = Math.floor(wx / CHUNK_SX);
        const cz = Math.floor(wz / CHUNK_SZ);
        const chunk = world.ensureChunk(cx, cz);
        const lx = wx - cx * CHUNK_SX;
        const lz = wz - cz * CHUNK_SZ;
        expect(chunk.getBlock(lx, SEA_LEVEL, lz)).toBe(B.WATER);
        expect(chunk.getBlock(lx, h, lz)).not.toBe(B.AIR);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("carves caves below the surface somewhere", () => {
    const world = new World(4242);
    let found = false;
    forEachChunkIn(3, (cx, cz) => {
      const chunk = world.ensureChunk(cx, cz);
      for (let z = 0; z < 16 && !found; z++) {
        for (let x = 0; x < 16; x++) {
          const h = chunk.columnHeight(x, z);
          for (let y = 2; y < h - 3; y++) {
            const id = chunk.getBlock(x, y, z);
            if (id === B.AIR && chunk.getBlock(x, y + 1, z) !== B.AIR) {
              found = true;
              break;
            }
          }
          if (found) break;
          if (h > 0) break;
        }
      }
      return found;
    });
    expect(found).toBe(true);
  });

  it("spreads sky light above the surface and darkness deep underground", () => {
    const world = new World(99);
    world.ensureChunk(0, 0);
    const h = world.columnHeight(8, 8);
    expect(world.getSkyLight(8, Math.min(h + 1, CHUNK_SY - 1), 8)).toBe(15);
    expect(world.getSkyLight(8, 2, 8)).toBe(0);
  });

  it("darkens a covered cell and restores sky light on removal", () => {
    const world = new World(5);
    world.ensureChunk(0, 0);
    let x = -1;
    let z = -1;
    let h = -1;
    for (let cz = 0; cz < 16 && x < 0; cz++) {
      for (let cx = 0; cx < 16; cx++) {
        const hh = world.columnHeight(cx, cz);
        if (hh >= CHUNK_SY - 4) continue;
        if (lightFilterOf(world.getBlock(cx, hh, cz)) >= 15) {
          x = cx;
          z = cz;
          h = hh;
          break;
        }
      }
    }
    expect(x).toBeGreaterThanOrEqual(0);
    const y = h + 1;
    expect(world.getSkyLight(x, y, z)).toBe(15);
    expect(world.getSkyLight(x, y + 1, z)).toBe(15);
    world.setBlock(x, y, z, B.STONE);
    expect(world.getSkyLight(x, y, z)).toBeLessThan(15);
    expect(world.getSkyLight(x, y + 1, z)).toBe(15);
    world.setBlock(x, y, z, B.AIR);
    expect(world.getSkyLight(x, y, z)).toBe(15);
  });

  it("lights torches and removes their light when broken", () => {
    const world = new World(6);
    world.ensureChunk(0, 0);
    const h = world.columnHeight(8, 8);
    const y = h + 1;
    world.setBlock(8, y, 8, B.TORCH);
    expect(world.getBlockLight(8, y, 8)).toBe(14);
    expect(world.getBlockLight(8, y + 1, 8)).toBe(13);
    world.setBlock(8, y, 8, B.AIR);
    expect(world.getBlockLight(8, y, 8)).toBe(0);
    expect(world.getBlockLight(8, y + 1, 8)).toBe(0);
  });

  it("finds a spawn above sea level with headroom", () => {
    const world = new World(31337);
    const spawn = world.findSpawn();
    expect(spawn.y).toBeGreaterThan(SEA_LEVEL);
    expect(world.getBlock(Math.floor(spawn.x), Math.floor(spawn.y), Math.floor(spawn.z))).toBe(B.AIR);
    expect(world.getBlock(Math.floor(spawn.x), Math.floor(spawn.y) + 1, Math.floor(spawn.z))).toBe(B.AIR);
  });

  it("advances time through a day cycle", () => {
    const world = new World(1);
    expect(world.dayFraction).toBe(0);
    world.advanceTime(DAY_TICKS / 4);
    expect(world.dayFactor).toBeGreaterThan(0.9);
    expect(world.isNight).toBe(false);
    world.advanceTime(DAY_TICKS / 4);
    expect(world.dayFactor).toBeGreaterThan(0.3);
    expect(world.dayFactor).toBeLessThan(0.7);
    expect(world.isNight).toBe(false);
    world.advanceTime(DAY_TICKS / 4);
    expect(world.isNight).toBe(true);
    expect(world.dayFactor).toBeLessThan(0.2);
    world.skipToMorning();
    expect(world.dayFraction).toBe(0);
    expect(world.time).toBe(DAY_TICKS);
  });

  it("tracks modified chunks only after player edits", () => {
    const world = new World(8);
    world.ensureChunk(0, 0);
    expect(world.getModifiedChunks().length).toBe(0);
    const h = world.columnHeight(3, 3);
    world.setBlock(3, h + 1, 3, B.STONE);
    expect(world.getModifiedChunks().length).toBe(1);
  });
});

describe("edited chunks across unload", () => {
  it("keeps player edits when a chunk is unloaded and loaded again", () => {
    const world = new World(1234);
    world.ensureChunk(0, 0);
    world.setBlock(3, 70, 3, B.GLASS);
    world.unloadChunk(0, 0);
    expect(world.isChunkLoaded(0, 0)).toBe(false);
    expect(world.storedChunks.has("0,0")).toBe(true);
    world.ensureChunk(0, 0);
    expect(world.getBlock(3, 70, 3)).toBe(B.GLASS);
    expect(world.getChunkIfLoaded(0, 0)?.modified).toBe(true);
    expect(world.modifiedChunkData().has("0,0")).toBe(true);
  });

  it("does not store untouched chunks", () => {
    const world = new World(1234);
    world.ensureChunk(1, 1);
    world.unloadChunk(1, 1);
    expect(world.storedChunks.size).toBe(0);
    expect(world.modifiedChunkData().size).toBe(0);
  });
});
