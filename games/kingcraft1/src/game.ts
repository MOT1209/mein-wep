import * as THREE from "three";
import { CHUNK_SX, CHUNK_SZ, QUALITY_PRESETS, type QualityLevel } from "./config";
import { PlayerController, type MoveInput } from "./player/controller";
import { ChunkRenderer } from "./render/chunkRenderer";
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

export interface GameOptions {
  quality?: QualityLevel;
  renderDistance?: number;
  canFly?: boolean;
  clock?: () => number;
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
    this.player = new PlayerController(world, spawn, { canFly: options.canFly ?? true });

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

  update(input: MoveInput, dyaw: number, dpitch: number, active: boolean): void {
    const now = this.clock();
    const dt = Math.min(Math.max((now - this.lastFrame) / 1000, 0), MAX_FRAME_SECONDS);
    this.lastFrame = now;
    if (active) {
      this.player.look(dyaw, dpitch);
      this.player.move(input, dt);
    }
    const { x, z } = this.player.state.position;
    this.streamer.update(x, z);
    this.syncCamera();
  }

  tick(): void {
    this.world.advanceTime(1);
  }

  render(): void {
    this.applySky();
    this.chunkRenderer.update(this.chunkX, this.chunkZ);
    this.chunkRenderer.rebuildBudgeted(REBUILD_BUDGET_MS);
    this.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  dispose(): void {
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
