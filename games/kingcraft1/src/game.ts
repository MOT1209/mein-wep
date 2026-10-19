import * as THREE from "three";
import { CHUNK_SX, CHUNK_SY, CHUNK_SZ, CREATIVE_REACH, PLAYER_REACH, QUALITY_PRESETS, TICK_MS, type QualityLevel } from "./config";
import { B } from "./content/blocks";
import { itemById } from "./content/items";
import { Rng } from "./core/rng";
import { ContainerStore } from "./gameplay/containers";
import { DropManager, rollDrops } from "./gameplay/drops";
import { applyGrowthBoost, randomTick } from "./gameplay/farming";
import { furnaceTick } from "./gameplay/furnace";
import { breakUnsupported, interact, type InteractResult, type Position } from "./gameplay/interactive";
import { Inventory } from "./gameplay/inventory";
import { MiningState, type MiningEvent } from "./gameplay/mining";
import { tryPlace, tryUseItem, type PlaceFailure } from "./gameplay/place";
import { raycastVoxel, type RayHit } from "./physics/raycast";
import { PlayerController, type MoveInput } from "./player/controller";
import { ChunkRenderer } from "./render/chunkRenderer";
import { DropRenderer, type IconSource } from "./render/dropRenderer";
import { createChunkMaterials, type ChunkMaterials } from "./render/materials";
import { buildAtlasTexture } from "./render/textures";
import { MIN_DAY_FACTOR, skyColors } from "./render/sky";
import { ChunkStreamer, type StreamStats } from "./render/streaming";
import { World } from "./voxels/world";

const CAMERA_FOV = 70;
const NEAR_PLANE = 0.1;
const REBUILD_BUDGET_MS = 4;
const SPAWN_RADIUS = 1;
const MAX_FRAME_SECONDS = 0.25;
const RANDOM_TICKS_PER_CHUNK = 6;

export type GameMode = "survival" | "creative";

export interface GameOptions {
  quality?: QualityLevel;
  renderDistance?: number;
  mode?: GameMode;
  clock?: () => number;
}

export interface FrameInput {
  move: MoveInput;
  dyaw: number;
  dpitch: number;
  attack: boolean;
  uses: number;
  hotbarSlot: number;
  active: boolean;
}

export interface GameEvents {
  onMining?(event: MiningEvent): void;
  onPlaceFailed?(reason: PlaceFailure): void;
  onInteract?(result: InteractResult): void;
}

export class Game {
  readonly world: World;
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly materials: ChunkMaterials;
  readonly chunkRenderer: ChunkRenderer;
  readonly player: PlayerController;
  readonly streamer: ChunkStreamer;
  readonly playerPosition = new THREE.Vector3();
  readonly mode: GameMode;
  readonly inventory = new Inventory();
  readonly mining = new MiningState();
  readonly drops = new DropManager();
  containers = new ContainerStore();
  respawnPoint: Position | null = null;
  readonly events: GameEvents = {};
  target: RayHit | null = null;
  private dropRenderer: DropRenderer | null = null;
  private readonly rng: Rng;
  private readonly selection: THREE.LineSegments;
  private readonly atlas: THREE.Texture;
  private readonly background = new THREE.Color();
  private readonly clock: () => number;
  private lastFrame: number;

  constructor(canvas: HTMLCanvasElement, world: World, options: GameOptions = {}) {
    const quality = options.quality ?? "medium";
    const preset = QUALITY_PRESETS[quality];
    const renderDistance = options.renderDistance ?? preset.renderDistance;
    const spawn = world.findSpawn();
    this.world = world;
    this.clock = options.clock ?? (() => performance.now());
    this.lastFrame = this.clock();
    this.mode = options.mode ?? "survival";
    this.rng = new Rng(world.seedInt ^ 0x5eed);
    this.player = new PlayerController(world, spawn, { canFly: this.mode === "creative" });

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, preset.pixelRatioCap));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = this.background;

    this.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      NEAR_PLANE,
      (renderDistance + 2) * 16
    );
    this.camera.rotation.order = "YXZ";
    this.selection = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004)),
      new THREE.LineBasicMaterial({ color: 0x101418, transparent: true, opacity: 0.7 })
    );
    this.selection.visible = false;
    this.scene.add(this.selection);

    this.atlas = buildAtlasTexture();
    this.materials = createChunkMaterials(this.atlas, quality);
    for (const material of [this.materials.terrain, this.materials.water, this.materials.plants]) {
      material.uniforms.uFogDistance.value = renderDistance * 16;
    }
    this.chunkRenderer = new ChunkRenderer(this.scene, world, {
      atlas: this.atlas,
      materials: this.materials
    });
    this.streamer = new ChunkStreamer(world, this.chunkRenderer, { renderDistance });
    this.streamer.loadAllNow(spawn.x, spawn.z, SPAWN_RADIUS);
    this.syncCamera();
    this.chunkRenderer.update(this.chunkX, this.chunkZ);
    this.applySky();
  }

  get streamStats(): Readonly<StreamStats> {
    return this.streamer.stats;
  }

  get atlasCanvas(): HTMLCanvasElement {
    return this.atlas.image as HTMLCanvasElement;
  }

  attachIcons(icons: IconSource): void {
    this.dropRenderer?.dispose();
    this.dropRenderer = new DropRenderer(this.scene, icons);
  }

  get creative(): boolean {
    return this.mode === "creative";
  }

  update(input: FrameInput): void {
    const now = this.clock();
    const dt = Math.min(Math.max((now - this.lastFrame) / 1000, 0), MAX_FRAME_SECONDS);
    this.lastFrame = now;
    this.inventory.selectedIndex = input.hotbarSlot;
    if (input.active) {
      this.player.look(input.dyaw, input.dpitch);
      this.player.move(input.move, dt);
    }
    const { x, y, z } = this.player.state.position;
    this.streamer.update(x, z);
    this.syncCamera();
    this.updateTarget();
    if (input.active) this.interact(input, dt);
    else this.mining.reset();
    this.drops.tick(this.world, dt, { x, y, z }, (stack) => this.inventory.add(stack));
  }

  private updateTarget(): void {
    const eye = this.player.eyePosition();
    const dir = this.player.lookDirection();
    const reach = this.creative ? CREATIVE_REACH : PLAYER_REACH;
    this.target = raycastVoxel(this.world, eye.x, eye.y, eye.z, dir.x, dir.y, dir.z, reach);
    this.selection.visible = this.target !== null;
    if (this.target) this.selection.position.set(this.target.x + 0.5, this.target.y + 0.5, this.target.z + 0.5);
  }

  private interact(input: FrameInput, dt: number): void {
    const held = this.inventory.selected?.item ?? null;
    if (input.attack) {
      const event = this.mining.tick(this.world, this.target, held, dt, this.creative);
      if (event) this.onMiningEvent(event);
    } else {
      this.mining.reset();
    }
    for (let i = 0; i < input.uses && this.target; i++) this.use(this.target, input.move.sneak);
  }

  private onMiningEvent(event: MiningEvent): void {
    this.events.onMining?.(event);
    if (event.kind !== "broken") return;
    if (event.harvest) this.dropBlock(event.id, event);
    for (const stack of this.containers.remove(event.x, event.y, event.z)) {
      this.drops.spawn(stack, event.x + 0.5, event.y + 0.5, event.z + 0.5);
    }
    for (const fallen of breakUnsupported(this.world, event.x, event.y, event.z)) {
      if (!this.creative) this.dropBlock(fallen.id, fallen);
    }
    if (event.wear > 0) this.inventory.damage(this.inventory.selectedIndex, event.wear);
  }

  private dropBlock(id: number, at: Position): void {
    for (const stack of rollDrops(id, this.rng)) this.drops.spawn(stack, at.x + 0.5, at.y + 0.5, at.z + 0.5);
  }

  private use(hit: RayHit, sneaking: boolean): void {
    if (!sneaking) {
      const result = interact(this.world, this.containers, hit);
      if (result) {
        if (result.kind === "bed") this.respawnPoint = result.spawn;
        this.events.onInteract?.(result);
        return;
      }
    }
    const slot = this.inventory.selectedIndex;
    const held = this.inventory.selected;
    if (!held) return;
    if (itemById(held.item)?.useAction === "bone_meal") {
      if (applyGrowthBoost(this.world, hit.x, hit.y, hit.z, this.rng) && !this.creative) this.inventory.removeAt(slot, 1);
      return;
    }
    const used = tryUseItem(this.world, hit, held.item);
    if (used.ok) {
      if (used.wear > 0 && !this.creative) this.inventory.damage(slot, used.wear);
      if (used.consume && !this.creative) this.inventory.removeAt(slot, 1);
      if (used.give) this.giveOrDrop(used.give);
      return;
    }
    const placed = tryPlace(this.world, hit, held.item, this.player.state.position);
    if (!placed.ok) {
      this.events.onPlaceFailed?.(placed.reason);
      return;
    }
    if (!this.creative) {
      this.inventory.removeAt(slot, 1);
      if (placed.give) this.giveOrDrop(placed.give);
    }
  }

  private giveOrDrop(stack: { item: string; count: number }): void {
    const leftover = this.inventory.add(stack);
    if (!leftover) return;
    const { x, y, z } = this.player.state.position;
    this.drops.spawn(leftover, x, y + 1, z);
  }

  tick(): void {
    this.world.advanceTime(1);
    const dt = TICK_MS / 1000;
    for (const [x, y, z, furnace] of this.containers.furnaces()) {
      const result = furnaceTick(furnace, dt);
      if (!result.changed) continue;
      const id = this.world.getBlock(x, y, z);
      if (id === B.FURNACE || id === B.FURNACE_LIT) this.world.setBlock(x, y, z, result.lit ? B.FURNACE_LIT : B.FURNACE);
    }
    for (const chunk of this.world.chunks.values()) {
      for (let i = 0; i < RANDOM_TICKS_PER_CHUNK; i++) {
        const x = chunk.cx * CHUNK_SX + this.rng.nextInt(CHUNK_SX);
        const z = chunk.cz * CHUNK_SZ + this.rng.nextInt(CHUNK_SZ);
        const y = 1 + this.rng.nextInt(CHUNK_SY - 2);
        randomTick(this.world, x, y, z, this.rng);
      }
    }
  }

  render(): void {
    this.applySky();
    this.chunkRenderer.update(this.chunkX, this.chunkZ);
    this.chunkRenderer.rebuildBudgeted(REBUILD_BUDGET_MS);
    this.dropRenderer?.sync(this.drops.drops, this.clock() / 1000);
    this.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  dispose(): void {
    this.dropRenderer?.dispose();
    for (const chunk of this.world.chunks.values()) {
      this.chunkRenderer.dispose(chunk.cx, chunk.cz);
    }
    this.materials.terrain.dispose();
    this.materials.water.dispose();
    this.materials.plants.dispose();
    this.atlas.dispose();
    this.renderer.dispose();
  }

  private get chunkX(): number {
    return Math.floor(this.player.state.position.x / CHUNK_SX);
  }

  private get chunkZ(): number {
    return Math.floor(this.player.state.position.z / CHUNK_SZ);
  }

  private syncCamera(): void {
    const { position, yaw, pitch } = this.player.state;
    const eye = this.player.eyePosition();
    this.playerPosition.set(position.x, position.y, position.z);
    this.camera.position.set(eye.x, eye.y, eye.z);
    this.camera.rotation.set(pitch, yaw, 0);
  }

  private applySky(): void {
    const day = Math.max(this.world.dayFactor, MIN_DAY_FACTOR);
    const sky = skyColors(day);
    this.background.setRGB(sky.horizon[0], sky.horizon[1], sky.horizon[2]);
    for (const material of [this.materials.terrain, this.materials.water, this.materials.plants]) {
      material.uniforms.uDay.value = day;
      material.uniforms.uFogColor.value.setRGB(sky.fog[0], sky.fog[1], sky.fog[2]);
      material.uniforms.uCameraPosition.value.copy(this.camera.position);
    }
  }
}
