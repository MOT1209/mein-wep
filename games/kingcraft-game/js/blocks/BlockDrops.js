// نَقْع البلوكات: عناصر متساقطة (mesh صغير + فيزياء) تُلتقط بالمشي عليها.
import * as THREE from "three";
import { itemIcon } from "../items/Items.js";

const GEO = new THREE.BoxGeometry(0.28, 0.28, 0.28);
const PICKUP_DIST = 1.4;
const DESPAWN = 30; // ثانية
const _texCache = {};

function itemTexture(id) {
  if (_texCache[id]) return _texCache[id];
  const tex = new THREE.CanvasTexture(itemIcon(id, 32));
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  _texCache[id] = tex;
  return tex;
}

class ItemEntity {
  constructor(world, x, y, z, id, count) {
    this.world = world;
    this.id = id;
    this.count = count;
    this.pos = new THREE.Vector3(x + 0.5, y + 0.3, z + 0.5);
    this.vel = new THREE.Vector3((Math.random() - 0.5) * 1.5, 2.5, (Math.random() - 0.5) * 1.5);
    this.age = 0;
    this.pickupDelay = 0.4; // تأخير قبل الالتقاط

    const mat = new THREE.MeshLambertMaterial({ map: itemTexture(id), transparent: true, alphaTest: 0.4 });
    this.mesh = new THREE.Mesh(GEO, mat);
    this.mesh.position.copy(this.pos);
  }

  update(dt) {
    this.age += dt;
    this.pickupDelay -= dt;

    // جاذبية
    this.vel.y -= 22 * dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.pos.z += this.vel.z * dt;

    // اصطدام أرضي بسيط
    const fy = Math.floor(this.pos.y - 0.14);
    if (this.world.isSolidAt(this.pos.x, fy, this.pos.z) && this.vel.y < 0) {
      this.pos.y = fy + 1 + 0.14;
      this.vel.y = 0;
      this.vel.x *= 0.6; this.vel.z *= 0.6;
    }

    // دوران + تمايل
    this.mesh.rotation.y += dt * 1.6;
    const bob = Math.sin(this.age * 3) * 0.06;
    this.mesh.position.set(this.pos.x, this.pos.y + bob, this.pos.z);
  }
}

export class DropManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.entities = [];
  }

  spawn(x, y, z, id, count = 1) {
    if (!id) return;
    const e = new ItemEntity(this.world, x, y, z, id, count);
    this.scene.add(e.mesh);
    this.entities.push(e);
  }

  update(dt, player, inventory) {
    const px = player.pos.x, py = player.pos.y + 0.9, pz = player.pos.z;
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      e.update(dt);

      let remove = false;
      // التقاط
      if (e.pickupDelay <= 0) {
        const dx = e.pos.x - px, dy = e.pos.y - py, dz = e.pos.z - pz;
        if (dx * dx + dy * dy + dz * dz < PICKUP_DIST * PICKUP_DIST) {
          const remainder = inventory.addItem(e.id, e.count);
          if (remainder === 0) remove = true;
          else e.count = remainder;
        }
      }
      if (e.age > DESPAWN) remove = true;

      if (remove) {
        this.scene.remove(e.mesh);
        e.mesh.material.dispose();
        this.entities.splice(i, 1);
      }
    }
  }
}
