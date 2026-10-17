import * as THREE from "three";
import { afterEach, describe, expect, it } from "vitest";
import { B } from "../src/content/blocks";
import { Chunk } from "../src/voxels/chunk";
import { buildChunkMesh } from "../src/voxels/mesher";
import { ChunkRenderer } from "../src/render/chunkRenderer";
import { createChunkMaterials } from "../src/render/materials";

class TestScene extends THREE.Scene {
  readonly additions: THREE.Object3D[] = [];

  override add(...objects: THREE.Object3D[]): this {
    this.additions.push(...objects);
    return super.add(...objects);
  }
}

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

const atlas = new THREE.Texture();
const tileOf = (): number => 0;
const renderOptions = { atlas, clock: () => 0 };

function meshesIn(scene: THREE.Scene): THREE.Mesh[] {
  return scene.children.filter((child): child is THREE.Mesh => child instanceof THREE.Mesh);
}

afterEach(() => {
  atlas.dispose();
});

describe("ChunkRenderer", () => {
  it("packs every mesh attribute with the source array vertex count", () => {
    const scene = new TestScene();
    const world = new TestWorld();
    const chunk = world.addChunk(0, 0);
    const expected = buildChunkMesh(world, chunk, tileOf);
    const renderer = new ChunkRenderer(scene, world, renderOptions);

    renderer.update(0, 0);
    renderer.rebuildBudgeted(100);

    const [mesh] = meshesIn(scene);
    expect(mesh).toBeDefined();
    const arrays = expected.opaque;
    expect(mesh.geometry.getAttribute("position").count).toBe(arrays.positions.length / 3);
    expect(mesh.geometry.getAttribute("normal").count).toBe(arrays.normals.length / 3);
    expect(mesh.geometry.getAttribute("uv").count).toBe(arrays.uvs.length / 2);
    expect(mesh.geometry.getAttribute("sky").count).toBe(arrays.sky.length);
    expect(mesh.geometry.getAttribute("block").count).toBe(arrays.block.length);
    expect(mesh.geometry.getIndex()?.count).toBe(arrays.indices.length);
    expect(mesh.position.toArray()).toEqual([0, 0, 0]);
  });

  it("rebuilds queued chunks nearest to the current chunk first", () => {
    const scene = new TestScene();
    const world = new TestWorld();
    world.addChunk(0, 0);
    world.addChunk(1, 0);
    world.addChunk(5, 0);
    const renderer = new ChunkRenderer(scene, world, renderOptions);

    renderer.update(0, 0);
    renderer.markDirty(5, 0);
    renderer.markDirty(1, 0);
    renderer.rebuildBudgeted(100);

    expect(scene.additions.map((object) => object.position.x)).toEqual([0, 16, 80]);
  });

  it("removes meshes and disposes their geometries when a chunk is disposed", () => {
    const scene = new TestScene();
    const world = new TestWorld();
    world.addChunk(2, -1);
    const renderer = new ChunkRenderer(scene, world, renderOptions);

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
    const scene = new TestScene();
    const world = new TestWorld();
    world.addChunk(0, 0);
    world.addChunk(1, 0);
    world.addChunk(2, 0);
    const times = [0, 8, 20, 21];
    const renderer = new ChunkRenderer(scene, world, {
      atlas,
      clock: () => times.shift() ?? 21
    });

    renderer.update(0, 0);
    renderer.markDirty(1, 0);
    renderer.markDirty(2, 0);
    renderer.rebuildBudgeted(5);

    expect(scene.additions.map((object) => object.position.x)).toEqual([0]);
  });

  it("configures water transparency and plant alpha clipping with the shared vertex shader", () => {
    const materials = createChunkMaterials(atlas);

    expect(materials.terrain.vertexShader).toBe(materials.water.vertexShader);
    expect(materials.terrain.vertexShader).toBe(materials.plants.vertexShader);
    expect(materials.water.transparent).toBe(true);
    expect(materials.water.depthWrite).toBe(false);
    expect(materials.water.uniforms.uWaterAlpha.value).toBeCloseTo(0.75);
    expect(materials.plants.side).toBe(THREE.DoubleSide);
    expect(materials.plants.alphaTest).toBeCloseTo(0.5);
    materials.terrain.dispose();
    materials.water.dispose();
    materials.plants.dispose();
  });
});
