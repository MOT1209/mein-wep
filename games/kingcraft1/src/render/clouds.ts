import * as THREE from "three";
import { hash2i } from "../core/rng";

export const CLOUD_HEIGHT = 84;
export const CLOUD_TEXTURE_SIZE = 128;
export const CLOUD_CELL_BLOCKS = 6;
export const CLOUD_DRIFT_PER_SECOND = 0.6;

export function cloudMask(size: number, seed: number): Uint8Array {
  const mask = new Uint8Array(size * size);
  const value = (x: number, y: number, scale: number): number => {
    const gx = Math.floor(x / scale);
    const gy = Math.floor(y / scale);
    const fx = x / scale - gx;
    const fy = y / scale - gy;
    const cells = size / scale;
    const at = (cx: number, cy: number): number => hash2i(((cx % cells) + cells) % cells, ((cy % cells) + cells) % cells, seed) / 4294967296;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const top = at(gx, gy) + (at(gx + 1, gy) - at(gx, gy)) * sx;
    const bottom = at(gx, gy + 1) + (at(gx + 1, gy + 1) - at(gx, gy + 1)) * sx;
    return top + (bottom - top) * sy;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = value(x, y, 16) * 0.6 + value(x, y, 8) * 0.3 + value(x, y, 4) * 0.1;
      mask[y * size + x] = n > 0.56 ? 1 : 0;
    }
  }
  return mask;
}

export class CloudLayer {
  readonly mesh: THREE.Mesh;
  private readonly texture: THREE.CanvasTexture;
  private readonly material: THREE.MeshBasicMaterial;
  private readonly span: number;

  constructor(scene: THREE.Scene, seed: number, viewDistanceBlocks: number) {
    const canvas = document.createElement("canvas");
    canvas.width = CLOUD_TEXTURE_SIZE;
    canvas.height = CLOUD_TEXTURE_SIZE;
    const ctx = canvas.getContext("2d");
    const mask = cloudMask(CLOUD_TEXTURE_SIZE, seed);
    if (ctx) {
      const image = ctx.createImageData(CLOUD_TEXTURE_SIZE, CLOUD_TEXTURE_SIZE);
      for (let i = 0; i < mask.length; i++) {
        image.data[i * 4] = 255;
        image.data[i * 4 + 1] = 255;
        image.data[i * 4 + 2] = 255;
        image.data[i * 4 + 3] = mask[i] ? 215 : 0;
      }
      ctx.putImageData(image, 0, 0);
    }
    this.texture = new THREE.CanvasTexture(canvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;
    this.span = Math.max(256, viewDistanceBlocks * 3);
    const repeats = this.span / (CLOUD_TEXTURE_SIZE * CLOUD_CELL_BLOCKS);
    this.texture.repeat.set(repeats, repeats);
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(this.span, this.span), this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.renderOrder = 2;
    scene.add(this.mesh);
  }

  update(cameraX: number, cameraZ: number, timeSeconds: number, brightness: number): void {
    this.mesh.position.set(cameraX, CLOUD_HEIGHT, cameraZ);
    const world = CLOUD_TEXTURE_SIZE * CLOUD_CELL_BLOCKS;
    const drift = timeSeconds * CLOUD_DRIFT_PER_SECOND;
    this.texture.offset.set((cameraX + drift) / world, -cameraZ / world);
    this.material.color.setScalar(Math.max(0.25, brightness));
  }

  setVisible(visible: boolean): void {
    this.mesh.visible = visible;
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
