import * as THREE from "three";
import type { ItemDrop } from "../gameplay/drops";

export interface IconSource {
  canvasFor(item: string): HTMLCanvasElement;
}

const DROP_SCALE = 0.32;
const BOB_HEIGHT = 0.08;

export class DropRenderer {
  private readonly sprites = new Map<ItemDrop, THREE.Sprite>();
  private readonly materials = new Map<string, THREE.SpriteMaterial>();

  constructor(
    private readonly scene: THREE.Scene,
    private readonly icons: IconSource
  ) {}

  sync(drops: readonly ItemDrop[], timeSeconds: number): void {
    const alive = new Set(drops);
    for (const [drop, sprite] of this.sprites) {
      if (alive.has(drop)) continue;
      this.scene.remove(sprite);
      this.sprites.delete(drop);
    }
    for (const drop of drops) {
      let sprite = this.sprites.get(drop);
      if (!sprite) {
        sprite = new THREE.Sprite(this.material(drop.item));
        sprite.scale.setScalar(DROP_SCALE);
        this.scene.add(sprite);
        this.sprites.set(drop, sprite);
      }
      const bob = Math.sin(timeSeconds * 3 + drop.x * 1.7 + drop.z) * BOB_HEIGHT;
      sprite.position.set(drop.x, drop.y + 0.05 + bob, drop.z);
    }
  }

  dispose(): void {
    for (const sprite of this.sprites.values()) this.scene.remove(sprite);
    this.sprites.clear();
    for (const material of this.materials.values()) {
      material.map?.dispose();
      material.dispose();
    }
    this.materials.clear();
  }

  private material(item: string): THREE.SpriteMaterial {
    const cached = this.materials.get(item);
    if (cached) return cached;
    const texture = new THREE.CanvasTexture(this.icons.canvasFor(item));
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.1 });
    this.materials.set(item, material);
    return material;
  }
}
