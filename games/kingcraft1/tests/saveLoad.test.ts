import { describe, expect, it } from "vitest";
import { CHUNK_VOLUME, SAVE_FORMAT_VERSION } from "../src/config";
import { B } from "../src/content/blocks";
import { Rng } from "../src/core/rng";
import { ContainerStore } from "../src/gameplay/containers";
import { Inventory } from "../src/gameplay/inventory";
import { PlayerStats } from "../src/player/stats";
import { MemoryBackend } from "../src/save/db";
import {
  Autosaver,
  SaveError,
  buildSave,
  decodeChunks,
  fromBase64,
  loadWorld,
  migrate,
  rleDecode,
  rleEncode,
  saveWorld,
  slotKey,
  toBase64,
  type SaveInput
} from "../src/save/saveLoad";
import { World } from "../src/voxels/world";

function input(world: World, extra: Partial<SaveInput> = {}): SaveInput {
  return {
    seed: world.seedInt,
    mode: "survival",
    time: world.time,
    player: { x: 1.5, y: 70, z: -2.5, yaw: 0.5, pitch: -0.2, respawn: null },
    stats: new PlayerStats().toJSON(),
    inventory: new Inventory().toJSON(),
    containers: [],
    entities: [],
    chunks: world.modifiedChunkData(),
    ...extra
  };
}

describe("RLE + base64", () => {
  it("round-trips random arrays of varied run lengths", () => {
    const rng = new Rng(77);
    for (let trial = 0; trial < 40; trial++) {
      const length = 1 + rng.nextInt(3000);
      const bytes = new Uint8Array(length);
      let i = 0;
      while (i < length) {
        const run = 1 + rng.nextInt(trial % 2 === 0 ? 4 : 600);
        bytes.fill(rng.nextInt(256), i, Math.min(length, i + run));
        i += run;
      }
      expect(rleDecode(fromBase64(toBase64(rleEncode(bytes))), length)).toEqual(bytes);
    }
  });

  it("compresses a mostly uniform chunk well", () => {
    const blocks = new Uint8Array(CHUNK_VOLUME);
    blocks.fill(B.STONE, 0, CHUNK_VOLUME / 2);
    expect(rleEncode(blocks).length).toBeLessThan(CHUNK_VOLUME / 50);
  });

  it("rejects corrupt data", () => {
    expect(() => rleDecode(Uint8Array.from([3, 1]), 2)).toThrow(SaveError);
    expect(() => rleDecode(Uint8Array.from([1, 1]), 2)).toThrow(SaveError);
    expect(() => rleDecode(Uint8Array.from([1]), 1)).toThrow(SaveError);
    expect(() => fromBase64("%%%")).toThrow(SaveError);
  });
});

describe("world round-trip", () => {
  it("restores exactly the blocks of three edited chunks", async () => {
    const world = new World(4242);
    const edits: [number, number, number, number][] = [
      [2, 60, 3, B.GLASS],
      [20, 61, 4, B.CHEST],
      [-5, 62, -7, B.TORCH]
    ];
    for (const [x, y, z, id] of edits) {
      world.ensureChunk(Math.floor(x / 16), Math.floor(z / 16));
      world.setBlock(x, y, z, id);
    }
    world.unloadChunk(1, 0);
    const backend = new MemoryBackend();
    const key = slotKey(world.seedInt, "survival");
    await saveWorld(backend, key, buildSave(input(world)));

    const loaded = await loadWorld(backend, key);
    expect(loaded).not.toBeNull();
    const fresh = new World(loaded?.seed ?? 0);
    for (const [k, blocks] of decodeChunks(loaded!)) fresh.storedChunks.set(k, blocks);
    expect(fresh.storedChunks.size).toBe(3);
    for (const [x, y, z, id] of edits) {
      fresh.ensureChunk(Math.floor(x / 16), Math.floor(z / 16));
      expect(fresh.getBlock(x, y, z)).toBe(id);
    }
    for (const [k, blocks] of world.modifiedChunkData()) {
      const [cx, cz] = k.split(",").map(Number);
      expect(fresh.getChunkIfLoaded(cx, cz)?.blocks).toEqual(blocks);
    }
  });

  it("round-trips player, inventory, stats and containers", async () => {
    const world = new World(9);
    const inventory = new Inventory();
    inventory.add({ item: "dirt", count: 40 });
    inventory.add({ item: "stone_pickaxe", count: 1 });
    inventory.damage(1, 7);
    inventory.selectedIndex = 1;
    const stats = new PlayerStats();
    stats.health = 11;
    stats.hunger = 14;
    const containers = new ContainerStore();
    containers.open("chest", 4, 65, 4).slots[2] = { item: "coal", count: 9 };
    const respawn = { x: 10.5, y: 66, z: 3.5 };
    const save = buildSave(
      input(world, {
        time: 12345,
        player: { x: 3, y: 66, z: 4, yaw: 1, pitch: 0.3, respawn },
        inventory: inventory.toJSON(),
        stats: stats.toJSON(),
        containers: containers.toJSON()
      })
    );
    const backend = new MemoryBackend();
    await saveWorld(backend, "slot", save);
    const loaded = await loadWorld(backend, "slot");
    expect(loaded?.time).toBe(12345);
    expect(loaded?.player).toEqual({ x: 3, y: 66, z: 4, yaw: 1, pitch: 0.3, respawn });
    expect(Inventory.fromJSON(loaded?.inventory as never).toJSON()).toEqual(inventory.toJSON());
    expect(PlayerStats.fromJSON(loaded?.stats).toJSON()).toEqual(stats.toJSON());
    expect(ContainerStore.fromJSON(loaded?.containers).toJSON()).toEqual(containers.toJSON());
  });

  it("returns null for a missing slot", async () => {
    expect(await loadWorld(new MemoryBackend(), "nothing")).toBeNull();
  });
});

describe("schema and migration", () => {
  it("rejects unknown versions and malformed saves cleanly", async () => {
    expect(() => migrate({ version: 99, seed: 1 })).toThrow(/Unsupported save version/);
    expect(() => migrate(null)).toThrow(SaveError);
    expect(() => migrate({ version: 1, seed: "x" })).toThrow(SaveError);
    expect(() => migrate({ version: 1, seed: 1, player: { x: 0 } })).toThrow(SaveError);
    const backend = new MemoryBackend();
    await backend.put("bad", "{oops");
    await expect(loadWorld(backend, "bad")).rejects.toThrow(SaveError);
  });

  it("drops bad chunk keys and defaults optional fields", () => {
    const save = migrate({ version: 1, seed: 5, player: { x: 0, y: 70, z: 0 }, chunks: { "1,2": "AQE=", "../x": "AQE=" } });
    expect(Object.keys(save.chunks)).toEqual(["1,2"]);
    expect(save.mode).toBe("survival");
    expect(save.player.respawn).toBeNull();
  });

  it("has a stable key set with no timestamps and deterministic output", () => {
    const world = new World(3);
    world.ensureChunk(0, 0);
    world.setBlock(1, 70, 1, B.GLASS);
    const a = buildSave(input(world));
    const b = buildSave(input(world));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(Object.keys(a).sort()).toEqual(
      ["chunks", "containers", "entities", "inventory", "mode", "player", "seed", "stats", "time", "version"].sort()
    );
    expect(a.version).toBe(SAVE_FORMAT_VERSION);
    expect(JSON.stringify(a)).not.toMatch(/date|timestamp|savedAt/i);
  });
});

describe("Autosaver", () => {
  it("saves once per interval and not while a save is running", async () => {
    let saves = 0;
    let release: () => void = () => undefined;
    const saver = new Autosaver(60, () => {
      saves++;
      return new Promise<void>((resolve) => (release = resolve));
    });
    expect(saver.tick(30)).toBe(false);
    expect(saver.tick(31)).toBe(true);
    expect(saver.tick(61)).toBe(false);
    release();
    await Promise.resolve();
    await Promise.resolve();
    expect(saver.tick(61)).toBe(true);
    expect(saves).toBe(2);
  });
});
