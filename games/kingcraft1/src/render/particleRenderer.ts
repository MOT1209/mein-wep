import * as THREE from "three";
import { ATLAS_TILES_PER_ROW, ATLAS_TILE_PIXELS } from "../config";
import { blockById } from "../content/blocks";
import { FACE_PZ } from "../voxels/mesher";
import type { Particle } from "./particles";
import { TILE_INDEX, atlasTileOf } from "./textures";

const SAMPLE_POINTS: readonly (readonly [number, number])[] = [
  [3, 3],
  [12, 4],
  [7, 8],
  [4, 12],
  [11, 11],
  [8, 2]
];

export class BlockColors {
  private readonly cache = new Map<number, number[]>();
  private readonly ctx: CanvasRenderingContext2D | null;

  constructor(atlas: HTMLCanvasElement) {
    this.ctx = atlas.getContext("2d", { willReadFrequently: true });
  }

  colorsFor(blockId: number): number[] {
    const cached = this.cache.get(blockId);
    if (cached) return cached;
    const def = blockById(blockId);
    const named = def.particleTile ? TILE_INDEX[def.particleTile] : undefined;
    const tile = named ?? atlasTileOf(blockId, FACE_PZ);
    const sx = (tile % ATLAS_TILES_PER_ROW) * ATLAS_TILE_PIXELS;
    const sy = (ATLAS_TILES_PER_ROW - 1 - Math.floor(tile / ATLAS_TILES_PER_ROW)) * ATLAS_TILE_PIXELS;
    const colors: number[] = [];
    if (this.ctx) {
      const data = this.ctx.getImageData(sx, sy, ATLAS_TILE_PIXELS, ATLAS_TILE_PIXELS).data;
      for (const [px, py] of SAMPLE_POINTS) {
        const i = (py * ATLAS_TILE_PIXELS + px) * 4;
        if (data[i + 3] < 128) continue;
        colors.push((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
      }
    }
    if (colors.length === 0) colors.push(0x888888);
    this.cache.set(blockId, colors);
    return colors;
  }
}

export class ParticleRenderer {
  private readonly mesh: THREE.InstancedMesh;
  private readonly matrix = new THREE.Matrix4();
  private readonly color = new THREE.Color();
  private readonly quaternion = new THREE.Quaternion();
  private readonly position = new THREE.Vector3();
  private readonly scale = new THREE.Vector3();

  constructor(
    private readonly scene: THREE.Scene,
    private readonly capacity: number
  ) {
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, Math.max(1, capacity));
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    scene.add(this.mesh);
  }

  sync(particles: readonly Particle[], brightness: number): void {
    const count = Math.min(particles.length, this.capacity);
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const fade = Math.min(1, p.life / (p.maxLife * 0.4));
      this.position.set(p.x, p.y, p.z);
      this.scale.setScalar(p.size * fade);
      this.matrix.compose(this.position, this.quaternion, this.scale);
      this.mesh.setMatrixAt(i, this.matrix);
      this.mesh.setColorAt(i, this.color.setHex(p.color).multiplyScalar(brightness));
    }
    this.mesh.count = count;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  dispose(): void {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.mesh.dispose();
  }
}
