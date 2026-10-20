import { describe, expect, it } from "vitest";
import { PLAYER_REACH, TICK_MS } from "../src/config";
import { B } from "../src/content/blocks";
import { Rng } from "../src/core/rng";
import { ContainerStore } from "../src/gameplay/containers";
import { DropManager, rollDrops } from "../src/gameplay/drops";
import { Inventory } from "../src/gameplay/inventory";
import { MiningState } from "../src/gameplay/mining";
import { tryPlace } from "../src/gameplay/place";
import { raycastVoxel } from "../src/physics/raycast";
import { IDLE_INPUT, PlayerController } from "../src/player/controller";
import { PlayerStats } from "../src/player/stats";
import { ChunkStreamer } from "../src/render/streaming";
import { MemoryBackend } from "../src/save/db";
import { buildSave, decodeChunks, loadWorld, saveWorld, slotKey } from "../src/save/saveLoad";
import { World } from "../src/voxels/world";

const SEED = 20261019;
const DT = TICK_MS / 1000;
const noRenderer = { markDirty: (): void => undefined, dispose: (): void => undefined };

describe("end-to-end: generate, walk, mine, place, save, load", () => {
  it("restores the exact world, inventory and time after a play session", async () => {
    const started = Date.now();
    const world = new World(SEED);
    const spawn = world.findSpawn();
    const streamer = new ChunkStreamer(world, noRenderer, { renderDistance: 1, loadsPerUpdate: 3 });
    streamer.loadAllNow(spawn.x, spawn.z);
    const player = new PlayerController(world, spawn);
    const inventory = new Inventory();
    const stats = new PlayerStats();
    const drops = new DropManager();
    const mining = new MiningState();
    const rng = new Rng(SEED);

    for (let i = 0; i < 60; i++) player.move(IDLE_INPUT, DT);
    expect(player.state.onGround).toBe(true);
    const start = { ...player.state.position };

    player.look(0.7, 0);
    for (let tick = 0; tick < 600; tick++) {
      player.move({ ...IDLE_INPUT, forward: 1, jump: tick % 40 === 0 }, DT);
      world.advanceTime(1);
      streamer.update(player.state.position.x, player.state.position.z);
      stats.tick(DT, {
        y: player.state.position.y,
        onGround: player.state.onGround,
        inWater: player.state.inWater,
        headInWater: false,
        flying: false,
        moving: true,
        sprinting: false
      });
      expect(Number.isFinite(player.state.position.y)).toBe(true);
    }
    const walked = Math.hypot(player.state.position.x - start.x, player.state.position.z - start.z);
    expect(walked).toBeGreaterThan(5);
    expect(world.loadedChunkCount).toBeGreaterThanOrEqual(9);
    expect(stats.dead).toBe(false);

    for (let i = 0; i < 40; i++) player.move(IDLE_INPUT, DT);
    player.look(0, -1.2);
    const eye = player.eyePosition();
    const dir = player.lookDirection();
    const target = raycastVoxel(world, eye.x, eye.y, eye.z, dir.x, dir.y, dir.z, PLAYER_REACH);
    expect(target).not.toBeNull();
    if (!target) return;

    let broken = null;
    for (let i = 0; i < 400 && !broken; i++) {
      const event = mining.tick(world, target, "stone_pickaxe", DT, false);
      expect(event?.kind).not.toBe("blocked");
      if (event?.kind === "broken") broken = event;
    }
    expect(broken).not.toBeNull();
    expect(broken?.harvest).toBe(true);
    expect(world.getBlock(target.x, target.y, target.z)).toBe(B.AIR);
    for (const stack of rollDrops(broken!.id, rng)) drops.spawn(stack, target.x + 0.5, target.y + 0.5, target.z + 0.5);
    for (let i = 0; i < 120 && drops.drops.length > 0; i++) {
      drops.tick(world, DT, player.state.position, (stack) => inventory.add(stack));
    }
    expect(drops.drops).toHaveLength(0);
    expect(inventory.slots.some((s) => s !== null)).toBe(true);

    inventory.add({ item: "cobblestone", count: 5 });
    inventory.selectedIndex = inventory.slots.findIndex((s) => s?.item === "cobblestone");
    const below = { ...target, y: target.y - 1, id: world.getBlock(target.x, target.y - 1, target.z), face: 2 };
    const placed = tryPlace(world, below, "cobblestone", player.state.position);
    expect(placed.ok).toBe(true);
    if (placed.ok) inventory.removeAt(inventory.selectedIndex, 1);
    expect(world.getBlock(target.x, target.y, target.z)).toBe(B.COBBLESTONE);

    const containers = new ContainerStore();
    containers.open("chest", target.x, target.y + 3, target.z).slots[0] = { item: "coal", count: 3 };

    const backend = new MemoryBackend();
    const key = slotKey(SEED, "survival");
    const { position, yaw, pitch } = player.state;
    await saveWorld(
      backend,
      key,
      buildSave({
        seed: world.seedInt,
        mode: "survival",
        time: world.time,
        player: { x: position.x, y: position.y, z: position.z, yaw, pitch, respawn: null },
        stats: stats.toJSON(),
        inventory: inventory.toJSON(),
        containers: containers.toJSON(),
        entities: [],
        chunks: world.modifiedChunkData()
      })
    );

    const loaded = await loadWorld(backend, key);
    expect(loaded).not.toBeNull();
    if (!loaded) return;
    const restored = new World(loaded.seed);
    for (const [chunkKey, blocks] of decodeChunks(loaded)) restored.storedChunks.set(chunkKey, blocks);
    restored.time = loaded.time;
    new ChunkStreamer(restored, noRenderer, { renderDistance: 1 }).loadAllNow(loaded.player.x, loaded.player.z);

    expect(restored.time).toBe(world.time);
    expect(restored.getBlock(target.x, target.y, target.z)).toBe(B.COBBLESTONE);
    for (const [chunkKey, blocks] of world.modifiedChunkData()) {
      const [cx, cz] = chunkKey.split(",").map(Number);
      restored.ensureChunk(cx, cz);
      expect(restored.getChunkIfLoaded(cx, cz)?.blocks).toEqual(blocks);
    }
    expect(Inventory.fromJSON(loaded.inventory as never).toJSON()).toEqual(inventory.toJSON());
    expect(PlayerStats.fromJSON(loaded.stats).toJSON()).toEqual(stats.toJSON());
    expect(ContainerStore.fromJSON(loaded.containers).toJSON()).toEqual(containers.toJSON());
    expect(loaded.player).toMatchObject({ x: position.x, y: position.y, z: position.z });

    const resumed = new PlayerController(restored, loaded.player);
    for (let i = 0; i < 20; i++) resumed.move(IDLE_INPUT, DT);
    expect(Math.abs(resumed.state.position.y - position.y)).toBeLessThan(0.01);
    expect(Date.now() - started).toBeLessThan(5000);
  });
});
