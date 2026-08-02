import { GRAVITY, WORLD_HEIGHT } from "../utils/Constants.js";

export class Entity {
  constructor(x, y, z, w = 0.6, h = 1.8) {
    this.pos = { x, y, z };
    this.vel = { x: 0, y: 0, z: 0 };
    this.w = w;
    this.h = h;
    this.half = w / 2;
    this.onGround = false;
    this.health = 20;
    this.maxHealth = 20;
    this.alive = true;
    this.world = null;
    this.mesh = null;
    this.yaw = 0;
  }

  isSolidAt(x, y, z) {
    return this.world && this.world.isSolidAt(Math.floor(x), Math.floor(y), Math.floor(z));
  }

  collides(px, py, pz) {
    const minX = Math.floor(px - this.half), maxX = Math.floor(px + this.half);
    const minY = Math.floor(py), maxY = Math.floor(py + this.h);
    const minZ = Math.floor(pz - this.half), maxZ = Math.floor(pz + this.half);
    for (let x = minX; x <= maxX; x++)
      for (let y = minY; y <= maxY; y++)
        for (let z = minZ; z <= maxZ; z++)
          if (this.isSolidAt(x, y, z)) return true;
    return false;
  }

  moveAxis(axis, amount) {
    if (amount === 0) return;
    const p = this.pos;
    const old = p[axis];
    p[axis] += amount;
    if (this.collides(p.x, p.y, p.z)) {
      p[axis] = old;
      if (axis === "y") {
        if (amount < 0 && this.isSolidAt(p.x, p.y - 0.001, p.z)) this.onGround = true;
        this.vel.y = 0;
      }
    } else if (axis === "y" && amount < 0) {
      this.onGround = false;
    }
  }

  applyGravity(dt) {
    if (!this.world) return;
    this.vel.y -= GRAVITY * dt;
  }

  move(dt) {
    this.moveAxis("x", this.vel.x * dt);
    this.moveAxis("z", this.vel.z * dt);
    this.moveAxis("y", this.vel.y * dt);
    if (this.pos.y < -10) this.alive = false;
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  }

  updateMesh() {
    if (this.mesh) {
      this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    }
  }

  getDropTable() {
    return [];
  }
}
