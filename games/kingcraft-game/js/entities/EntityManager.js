import { Mob, MOB_TYPES } from "./Mob.js";
import { createMobMesh } from "./MobRenderer.js";

const HOSTILE_TYPES = ["zombie", "skeleton", "creeper", "spider"];
const PASSIVE_TYPES = ["cow", "sheep", "chicken", "pig"];
const MAX_HOSTILE = 12;
const MAX_PASSIVE = 8;
const SPAWN_INTERVAL = 3;
const SPAWN_RANGE_MIN = 24;
const SPAWN_RANGE_MAX = 48;
const DESPAWN_RANGE = 128;

export class EntityManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.entities = [];
    this._spawnTimer = 0;
    this._time = 0;
    this._dayLength = 1200;
    this._onAttack = null;
    this._onDrop = null;
  }

  get isNight() {
    const t = this._time % this._dayLength;
    return t > this._dayLength * 0.6;
  }

  addEntity(mob) {
    mob.world = this.world;
    mob.mesh = createMobMesh(mob.type);
    mob.mesh.position.set(mob.pos.x, mob.pos.y, mob.pos.z);
    this.scene.add(mob.mesh);
    this.entities.push(mob);
    return mob;
  }

  spawnMob(type, x, y, z) {
    const mob = new Mob(x, y, z, type, this.world);
    this.addEntity(mob);
    return mob;
  }

  get countHostile() { return this.entities.filter(e => e.hostile && e.alive).length; }
  get countPassive() { return this.entities.filter(e => !e.hostile && e.alive).length; }

  spawnNearby(playerPos) {
    const hostileCount = this.countHostile;
    const passiveCount = this.countPassive;

    const attempts = 8;
    for (let i = 0; i < attempts; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = SPAWN_RANGE_MIN + Math.random() * (SPAWN_RANGE_MAX - SPAWN_RANGE_MIN);
      const sx = playerPos.x + Math.sin(angle) * dist;
      const sz = playerPos.z + Math.cos(angle) * dist;
      const sy = this.world.spawnHeight(Math.floor(sx), Math.floor(sz));
      if (this.isNight && hostileCount < MAX_HOSTILE) {
        const type = HOSTILE_TYPES[Math.floor(Math.random() * HOSTILE_TYPES.length)];
        this.spawnMob(type, sx, sy + 0.1, sz);
        return;
      }
      if (!this.isNight && passiveCount < MAX_PASSIVE) {
        const type = PASSIVE_TYPES[Math.floor(Math.random() * PASSIVE_TYPES.length)];
        this.spawnMob(type, sx, sy + 0.1, sz);
        return;
      }
    }
  }

  update(dt, playerPos) {
    this._time = (this._time + dt) % (this._dayLength * 2);

    this._spawnTimer += dt;
    if (this._spawnTimer >= SPAWN_INTERVAL) {
      this._spawnTimer = 0;
      this.spawnNearby(playerPos);
    }

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];

      if (!e.alive) {
        this.removeEntity(i);
        continue;
      }

      const dx = playerPos.x - e.pos.x;
      const dz = playerPos.z - e.pos.z;
      if (Math.hypot(dx, dz) > DESPAWN_RANGE) {
        this.removeEntity(i);
        continue;
      }

      if (e.mesh) {
        e.mesh.rotation.y = -e.yaw;
      }

      const result = e.update(dt, playerPos);

      if (result && result.attack && this._onAttack) {
        this._onAttack(result.damage, result.mob);
      }
    }
  }

  removeEntity(index) {
    const e = this.entities[index];
    if (e.mesh) {
      this.scene.remove(e.mesh);
    }
    this.entities.splice(index, 1);
  }

  attackEntity(mob, damage) {
    const drops = mob.getDropTable();
    const wasAlive = mob.alive;
    mob.takeDamage(damage);
    if (wasAlive && mob.alive && this._onMobHurt) {
      this._onMobHurt();
    }
    if (!mob.alive && wasAlive) {
      if (this._onMobDeath) this._onMobDeath();
      if (drops.length && this._onDrop) {
        this._onDrop(mob.pos.x, mob.pos.y, mob.pos.z, drops);
      }
    }
  }

  getEntityAt(ox, oy, oz, dir, range) {
    let best = null;
    let bestDist = range + 1;
    for (const e of this.entities) {
      if (!e.alive) continue;
      const dx = e.pos.x - ox;
      const dy = e.pos.y + e.h * 0.5 - oy;
      const dz = e.pos.z - oz;
      const t = dx * dir.x + dy * dir.y + dz * dir.z;
      if (t < 0 || t > range) continue;
      const close = { x: ox + dir.x * t, y: oy + dir.y * t, z: oz + dir.z * t };
      const ex = e.pos.x - close.x;
      const ey = e.pos.y + e.h * 0.5 - close.y;
      const ez = e.pos.z - close.z;
      const perp = Math.hypot(ex, ey, ez);
      if (perp < 0.5 && t < bestDist) {
        best = e;
        bestDist = t;
      }
    }
    return best;
  }

  clear() {
    for (const e of this.entities) {
      if (e.mesh) this.scene.remove(e.mesh);
    }
    this.entities = [];
  }
}
