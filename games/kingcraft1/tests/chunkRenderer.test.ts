import * as THREE from "three";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { B } from "../src/content/blocks";
import { Chunk } from "../src/voxels/chunk";
import { buildChunkMesh } from "../src/voxels/mesher";
import { ChunkRenderer } from "../src/render/chunkRenderer";
import { createChunkMaterials, type ChunkMaterials } from "../src/render/materials";

class TestWorld {
  readonly chunks = new Map<string, Chunk>();

  addChunk(cx: number, cz: number): Chunk {
    const chunk = new Chunk(cx, cz);
    chunk.setBlockRaw(1, 1, 1, B.STONE);
    this.chunks.set(`${cx},${cz}`, chunk);
    return chunk;
  }

  getChunkIfLoaded(cx: number, cz: number): Chunk | undefined {
    return this.chunks.get(`${cx},${cz}`);
  }

  getBlock(x: number, y: number, z: number): number {
    const cx = Math.floor(x / 16);
    const cz = Math.floor(z / 16);
    const chunk = this.getChunkIfLoaded(cx, cz);
    return chunk?.getBlock(x - cx * 16, y, z - cz * 16) ?? B.AIR;
  }

  getSkyLight(): number {
    return 15;
  }

  getBlockLight(): number {
    return 0;
  }
}

let atlas: THREE.Texture;
let materials: ChunkMaterials;
const tileOf = (): number => 0;

function renderOptions() {
  return { atlas, materials, clock: () => 0 };
}

function meshesIn(scene: THREE.Scene): THREE.Mesh[] {
  return scene.children.filter((child): child is THREE.Mesh => child instanceof THREE.Mesh);
}

beforeEach(() => {
  atlas = new THREE.Texture();
  materials = createChunkMaterials(atlas);
});

afterEach(() => {
  materials.terrain.dispose();
  materials.water.dispose();
  materials.plants.dispose();
  atlas.dispose();
});

describe("ChunkRenderer", () => {
  it("packs terrain, water, and plant batches with matching geometry attributes", () => {
    const scene = new THREE.Scene();
    const world = new TestWorld();
    const chunk = world.addChunk(0, 0);
    chunk.setBlockRaw(4, 1, 1, B.WATER);
    chunk.setBlockRaw(7, 1, 1, B.TALL_GRASS);
    const expected = buildChunkMesh(world, chunk, tileOf);
    const renderer = new ChunkRenderer(scene, world, renderOptions());

    renderer.update(0, 0);
    renderer.rebuildBudgeted(100);

    const meshes = meshesIn(scene);
    const batches = [
      { arrays: expected.opaque, material: materials.terrain },
      { arrays: expected.water, material: materials.water },
      { arrays: expected.plants, material: materials.plants }
    ];

    expect(expected.opaque.indices.length).toBeGreaterThan(0);
    expect(expected.water.indices.length).toBeGreaterThan(0);
    expect(expected.plants.indices.length).toBeGreaterThan(0);
    expect(meshes).toHaveLength(batches.length);
    for (const [index, { arrays, material }] of batches.entries()) {
      const mesh = meshes[index];
      expect(mesh.geometry.getAttribute("position").count).toBe(arrays.positions.length / 3);
      expect(mesh.geometry.getAttribute("normal").count).toBe(arrays.normals.length / 3);
      expect(mesh.geometry.getAttribute("uv").count).toBe(arrays.uvs.length / 2);
      expect(mesh.geometry.getAttribute("sky").count).toBe(arrays.sky.length);
      expect(mesh.geometry.getAttribute("block").count).toBe(arrays.block.length);
      expect(mesh.geometry.getIndex()?.count).toBe(arrays.indices.length);
      expect(mesh.material).toBe(material);
      expect(mesh.position.toArray()).toEqual([0, 0, 0]);
    }
  });

  it("rebuilds queued chunks nearest to the current chunk first", () => {
    const scene = new THREE.Scene();
    const world = new TestWorld();
    world.addChunk(0, 0);
    world.addChunk(1, 0);
    world.addChunk(5, 0);
    const renderer = new ChunkRenderer(scene, world, renderOptions());

    renderer.update(0, 0);
    renderer.markDirty(5, 0);
    renderer.markDirty(1, 0);
    renderer.rebuildBudgeted(100);

    expect(meshesIn(scene).map((mesh) => mesh.userData.chunkX)).toEqual([0, 1, 5]);
  });

  it("removes meshes and disposes their geometries when a chunk is disposed", () => {
    const scene = new THREE.Scene();
    const world = new TestWorld();
    world.addChunk(2, -1);
    const renderer = new ChunkRenderer(scene, world, renderOptions());

    renderer.markDirty(2, -1);
    renderer.rebuildBudgeted(100);
    const meshes = meshesIn(scene);
    const disposedGeometries = new Set<THREE.BufferGeometry>();
    for (const mesh of meshes) {
      mesh.geometry.addEventListener("dispose", () => disposedGeometries.add(mesh.geometry));
    }

    renderer.dispose(2, -1);

    expect(meshesIn(scene)).toHaveLength(0);
    expect(disposedGeometries.size).toBe(meshes.length);
  });

  it("finishes the first chunk that overruns the time budget and leaves later work queued", () => {
    const scene = new THREE.Scene();
    const world = new TestWorld();
    world.addChunk(0, 0);
    world.addChunk(1, 0);
    world.addChunk(2, 0);
    const times = [0, 8, 10, 18, 20, 28];
    const renderer = new ChunkRenderer(scene, world, {
      ...renderOptions(),
      clock: () => times.shift() ?? 28
    });

    renderer.update(0, 0);
    renderer.markDirty(1, 0);
    renderer.markDirty(2, 0);
    expect(renderer.rebuildBudgeted(5)).toBe(1);
    expect(meshesIn(scene).map((mesh) => mesh.userData.chunkX)).toEqual([0]);
    expect(renderer.rebuildBudgeted(5)).toBe(1);
    expect(meshesIn(scene).map((mesh) => mesh.userData.chunkX)).toEqual([0, 1]);
    expect(renderer.rebuildBudgeted(5)).toBe(1);
    expect(meshesIn(scene).map((mesh) => mesh.userData.chunkX)).toEqual([0, 1, 2]);
  });

  it("configures water transparency and plant alpha clipping with the shared vertex shader", () => {
    expect(materials.terrain.vertexShader).toBe(materials.water.vertexShader);
    expect(materials.terrain.vertexShader).toBe(materials.plants.vertexShader);
    expect(materials.water.transparent).toBe(true);
    expect(materials.water.depthWrite).toBe(false);
    expect(materials.water.uniforms.uWaterAlpha.value).toBeCloseTo(0.75);
    expect(materials.plants.side).toBe(THREE.DoubleSide);
    expect(materials.plants.alphaTest).toBeCloseTo(0.5);
  });
});
