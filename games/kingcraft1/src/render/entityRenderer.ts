import * as THREE from "three";
import type { CreatureDef } from "../content/creatures";
import type { Entity } from "../entities/types";

export interface LightProbe {
  getSkyLight(x: number, y: number, z: number): number;
  getBlockLight(x: number, y: number, z: number): number;
}

interface Model {
  group: THREE.Group;
  legs: THREE.Object3D[];
  materials: THREE.MeshBasicMaterial[];
  colors: THREE.Color[];
}

const HURT_TINT = new THREE.Color(1, 0.25, 0.2);
const sharedBox = new THREE.BoxGeometry(1, 1, 1);

function part(
  group: THREE.Object3D,
  color: number,
  sx: number,
  sy: number,
  sz: number,
  x: number,
  y: number,
  z: number,
  materials: THREE.MeshBasicMaterial[],
  colors: THREE.Color[]
): THREE.Mesh {
  const material = new THREE.MeshBasicMaterial({ color });
  materials.push(material);
  colors.push(new THREE.Color(color));
  const mesh = new THREE.Mesh(sharedBox, material);
  mesh.scale.set(sx, sy, sz);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function leg(group: THREE.Group, color: number, w: number, h: number, x: number, z: number, top: number, materials: THREE.MeshBasicMaterial[], colors: THREE.Color[]): THREE.Object3D {
  const pivot = new THREE.Object3D();
  pivot.position.set(x, top, z);
  group.add(pivot);
  part(pivot, color, w, h, w, 0, -h / 2, 0, materials, colors);
  return pivot;
}

function buildModel(def: CreatureDef): Model {
  const group = new THREE.Group();
  const materials: THREE.MeshBasicMaterial[] = [];
  const colors: THREE.Color[] = [];
  const legs: THREE.Object3D[] = [];
  const { w, h } = def.size;
  const c = def.colors;
  switch (def.model) {
    case "quadruped": {
      const legH = h * 0.38;
      part(group, c.body, w * 0.8, h * 0.42, w * 1.25, 0, legH + h * 0.21, 0, materials, colors);
      part(group, c.head, w * 0.55, h * 0.4, w * 0.5, 0, legH + h * 0.42, w * 0.78, materials, colors);
      part(group, c.accent, w * 0.3, h * 0.12, w * 0.12, 0, legH + h * 0.33, w * 1.06, materials, colors);
      for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        legs.push(leg(group, c.legs, w * 0.22, legH, lx * w * 0.26, lz * w * 0.42, legH, materials, colors));
      }
      break;
    }
    case "bird": {
      const legH = h * 0.25;
      part(group, c.body, w * 0.7, h * 0.45, w * 0.9, 0, legH + h * 0.22, 0, materials, colors);
      part(group, c.head, w * 0.45, h * 0.35, w * 0.45, 0, legH + h * 0.55, w * 0.35, materials, colors);
      part(group, c.accent, w * 0.18, h * 0.1, w * 0.25, 0, legH + h * 0.5, w * 0.65, materials, colors);
      for (const lx of [-1, 1]) legs.push(leg(group, c.legs, w * 0.1, legH, lx * w * 0.16, 0, legH, materials, colors));
      break;
    }
    case "wisp": {
      part(group, c.body, w * 0.8, h * 0.6, w * 0.8, 0, h * 0.5, 0, materials, colors);
      part(group, c.head, w * 0.45, h * 0.3, w * 0.45, 0, h * 0.95, 0, materials, colors);
      part(group, c.accent, w * 0.3, h * 0.25, w * 0.3, 0, h * 0.12, 0, materials, colors);
      break;
    }
    case "crawler": {
      part(group, c.body, w, h * 0.5, w * 1.2, 0, h * 0.45, 0, materials, colors);
      part(group, c.head, w * 0.6, h * 0.45, w * 0.45, 0, h * 0.5, w * 0.75, materials, colors);
      for (const lx of [-1, 1]) {
        for (const lz of [-1, 0, 1]) legs.push(leg(group, c.legs, w * 0.12, h * 0.35, lx * w * 0.55, lz * w * 0.4, h * 0.35, materials, colors));
      }
      break;
    }
    default: {
      const legH = h * 0.45;
      part(group, c.body, w * 0.75, h * 0.35, w * 0.4, 0, legH + h * 0.18, 0, materials, colors);
      part(group, c.head, w * 0.6, h * 0.22, w * 0.55, 0, legH + h * 0.46, 0, materials, colors);
      for (const lx of [-1, 1]) {
        legs.push(leg(group, c.legs, w * 0.22, legH, lx * w * 0.2, 0, legH, materials, colors));
        legs.push(leg(group, c.accent, w * 0.16, h * 0.32, lx * w * 0.48, 0, legH + h * 0.34, materials, colors));
      }
    }
  }
  return { group, legs, materials, colors };
}

export class EntityRenderer {
  private readonly models = new Map<Entity, Model>();

  constructor(
    private readonly scene: THREE.Scene,
    private readonly lights: LightProbe
  ) {}

  sync(entities: readonly Entity[], camera: THREE.Vector3, maxDistance: number, dayFactor: number, timeSeconds: number): void {
    const alive = new Set(entities);
    for (const [entity, model] of this.models) {
      if (alive.has(entity)) continue;
      this.scene.remove(model.group);
      for (const material of model.materials) material.dispose();
      this.models.delete(entity);
    }
    for (const entity of entities) {
      let model = this.models.get(entity);
      if (!model) {
        model = buildModel(entity.def);
        this.models.set(entity, model);
        this.scene.add(model.group);
      }
      const dx = entity.x - camera.x;
      const dz = entity.z - camera.z;
      model.group.visible = dx * dx + dz * dz <= maxDistance * maxDistance;
      if (!model.group.visible) continue;
      const bob = entity.def.model === "wisp" ? Math.sin(timeSeconds * 2.5 + entity.id) * 0.08 : 0;
      model.group.position.set(entity.x, entity.y + bob, entity.z);
      model.group.rotation.y = entity.yaw;
      const swing = Math.sin(entity.walkPhase) * 0.6;
      model.legs.forEach((legPivot, index) => {
        legPivot.rotation.x = index % 2 === 0 ? swing : -swing;
      });
      const bx = Math.floor(entity.x);
      const by = Math.floor(entity.y + entity.def.size.h * 0.5);
      const bz = Math.floor(entity.z);
      const light = Math.max(this.lights.getSkyLight(bx, by, bz) / 15 * dayFactor, this.lights.getBlockLight(bx, by, bz) / 15);
      const brightness = 0.25 + 0.75 * light;
      const hurt = entity.hurtTime > 0;
      model.materials.forEach((material, index) => {
        material.color.copy(model.colors[index]).multiplyScalar(brightness);
        if (hurt) material.color.lerp(HURT_TINT, 0.55);
      });
    }
  }

  dispose(): void {
    for (const model of this.models.values()) {
      this.scene.remove(model.group);
      for (const material of model.materials) material.dispose();
    }
    this.models.clear();
  }
}
