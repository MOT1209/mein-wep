import * as THREE from "three";
import { CHUNK_SX, CHUNK_SZ, PLAYER_EYE_HEIGHT, QUALITY_PRESETS, type QualityLevel } from "./config";
import { ChunkRenderer } from "./render/chunkRenderer";
import { createChunkMaterials, type ChunkMaterials } from "./render/materials";
import { buildAtlasTexture } from "./render/textures";
import { MIN_DAY_FACTOR, skyColors } from "./render/sky";
import { World } from "./voxels/world";

const CAMERA_FOV = 70;
const NEAR_PLANE = 0.1;
const REBUILD_BUDGET_MS = 4;

export interface GameOptions {
  quality?: QualityLevel;
  renderDistance?: number;
}

export class Game {
  readonly world: World;
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly materials: ChunkMaterials;
  readonly chunkRenderer: ChunkRenderer;
  readonly playerPosition: THREE.Vector3;
  private readonly atlas: THREE.Texture;
  private readonly background = new THREE.Color();
  private readonly centerCx: number;
  private readonly centerCz: number;

  constructor(canvas: HTMLCanvasElement, world: World, options: GameOptions = {}) {
    const quality = options.quality ?? "medium";
    const preset = QUALITY_PRESETS[quality];
    const renderDistance = options.renderDistance ?? preset.renderDistance;
    const spawn = world.findSpawn();
    this.world = world;
    this.playerPosition = new THREE.Vector3(spawn.x, spawn.y, spawn.z);
    this.centerCx = Math.floor(spawn.x / CHUNK_SX);
    this.centerCz = Math.floor(spawn.z / CHUNK_SZ);

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
    this.camera.position.set(spawn.x, spawn.y + PLAYER_EYE_HEIGHT - 0.02, spawn.z);
    this.camera.lookAt(spawn.x + 24, spawn.y - 8, spawn.z + 24);

    this.atlas = buildAtlasTexture();
    this.materials = createChunkMaterials(this.atlas, quality);
    for (const material of [this.materials.terrain, this.materials.water, this.materials.plants]) {
      material.uniforms.uFogDistance.value = renderDistance * 16;
    }
    this.chunkRenderer = new ChunkRenderer(this.scene, world, {
      atlas: this.atlas,
      materials: this.materials
    });
    this.chunkRenderer.update(this.centerCx, this.centerCz);
    this.applySky();
  }

  tick(): void {
    this.world.advanceTime(1);
  }

  render(): void {
    this.applySky();
    this.chunkRenderer.update(this.centerCx, this.centerCz);
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
