import * as THREE from "three";
import { CHUNK_SX, CHUNK_SZ } from "../config";
import { Chunk } from "../voxels/chunk";
import { buildChunkMesh, type MeshArrays, type MeshSource } from "../voxels/mesher";
import { atlasTileOf, buildAtlasTexture } from "./textures";
import { createChunkMaterials, type ChunkMaterials } from "./materials";

export interface ChunkScene {
  add(...objects: THREE.Object3D[]): unknown;
  remove(...objects: THREE.Object3D[]): unknown;
}

export interface ChunkWorld extends MeshSource {
  readonly chunks: { values(): IterableIterator<Chunk> };
  getChunkIfLoaded(cx: number, cz: number): Chunk | undefined;
}

export interface ChunkRendererOptions {
  atlas?: THREE.Texture;
  materials?: ChunkMaterials;
  clock?: () => number;
}

interface RenderedChunk {
  readonly meshes: THREE.Mesh[];
}

interface DirtyChunk {
  readonly cx: number;
  readonly cz: number;
  readonly sequence: number;
}

function createGeometry(arrays: MeshArrays): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(arrays.positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(arrays.normals, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(arrays.uvs, 2));
  geometry.setAttribute("sky", new THREE.BufferAttribute(arrays.sky, 1));
  geometry.setAttribute("block", new THREE.BufferAttribute(arrays.block, 1));
  geometry.setIndex(new THREE.BufferAttribute(arrays.indices, 1));
  return geometry;
}

export class ChunkRenderer {
  private readonly chunks = new Map<string, RenderedChunk>();
  private readonly dirty = new Map<string, DirtyChunk>();
  private readonly materials: ChunkMaterials;
  private readonly clock: () => number;
  private centerX = 0;
  private centerZ = 0;
  private sequence = 0;

  constructor(
    private readonly scene: ChunkScene,
    private readonly world: ChunkWorld,
    options: ChunkRendererOptions = {}
  ) {
    const atlas = options.atlas ?? buildAtlasTexture();
    this.materials = options.materials ?? createChunkMaterials(atlas);
    this.clock = options.clock ?? (() => performance.now());
  }

  update(cx: number, cz: number): void {
    this.centerX = cx;
    this.centerZ = cz;
    for (const chunk of this.world.chunks.values()) {
      if (chunk.meshDirty || !this.chunks.has(this.key(chunk.cx, chunk.cz))) {
        this.markDirty(chunk.cx, chunk.cz);
      }
    }
    this.sortDirty();
  }

  markDirty(cx: number, cz: number): void {
    const key = this.key(cx, cz);
    if (!this.dirty.has(key)) this.dirty.set(key, { cx, cz, sequence: this.sequence++ });
  }

  rebuildBudgeted(budgetMs: number): number {
    const start = this.clock();
    let rebuilt = 0;
    while (this.dirty.size > 0) {
      const [key, target] = this.nextDirty();
      this.dirty.delete(key);
      const chunk = this.world.getChunkIfLoaded(target.cx, target.cz);
      if (!chunk) {
        this.dispose(target.cx, target.cz);
      } else {
        this.rebuild(chunk);
        rebuilt++;
      }
      if (this.clock() - start > budgetMs) break;
    }
    return rebuilt;
  }

  dispose(cx: number, cz: number): void {
    const key = this.key(cx, cz);
    this.dirty.delete(key);
    const rendered = this.chunks.get(key);
    if (!rendered) return;
    for (const mesh of rendered.meshes) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
    }
    this.chunks.delete(key);
  }

  private rebuild(chunk: Chunk): void {
    const key = this.key(chunk.cx, chunk.cz);
    const meshData = buildChunkMesh(this.world, chunk, atlasTileOf);
    const batches = [
      { arrays: meshData.opaque, material: this.materials.terrain },
      { arrays: meshData.water, material: this.materials.water },
      { arrays: meshData.plants, material: this.materials.plants }
    ];
    const meshes: THREE.Mesh[] = [];
    for (const batch of batches) {
      if (batch.arrays.indices.length === 0) continue;
      const mesh = new THREE.Mesh(createGeometry(batch.arrays), batch.material);
      mesh.position.set(chunk.cx * CHUNK_SX, 0, chunk.cz * CHUNK_SZ);
      mesh.userData.chunkX = chunk.cx;
      mesh.userData.chunkZ = chunk.cz;
      meshes.push(mesh);
    }
    this.disposeRendered(key);
    for (const mesh of meshes) this.scene.add(mesh);
    this.chunks.set(key, { meshes });
    chunk.meshDirty = false;
  }

  private disposeRendered(key: string): void {
    const rendered = this.chunks.get(key);
    if (!rendered) return;
    for (const mesh of rendered.meshes) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
    }
  }

  private nextDirty(): [string, DirtyChunk] {
    this.sortDirty();
    const first = this.dirty.entries().next();
    if (first.done) throw new Error("Dirty chunk queue unexpectedly empty");
    return first.value;
  }

  private sortDirty(): void {
    const sorted = [...this.dirty.entries()].sort(([, left], [, right]) =>
      this.distance(left) - this.distance(right) || left.sequence - right.sequence
    );
    this.dirty.clear();
    for (const [key, target] of sorted) this.dirty.set(key, target);
  }

  private distance(chunk: DirtyChunk): number {
    const dx = Math.abs(chunk.cx - this.centerX);
    const dz = Math.abs(chunk.cz - this.centerZ);
    return Math.max(dx, dz) + Math.min(dx, dz) / 2;
  }

  private key(cx: number, cz: number): string {
    return `${cx},${cz}`;
  }
}
