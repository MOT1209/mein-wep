import { Entity } from "./Entity.js";

export const MOB_TYPES = {
  zombie: {
    health: 20, w: 0.6, h: 1.95, speed: 2.2, damage: 3,
    hostile: true, detectionRange: 16, attackRange: 2.5, attackCooldown: 1.0,
    drops: [{ id: "rotten_flesh", count: [0, 2], chance: 1 }],
  },
  skeleton: {
    health: 20, w: 0.6, h: 1.99, speed: 2.1, damage: 2,
    hostile: true, detectionRange: 16, attackRange: 3.5, attackCooldown: 1.5,
    drops: [{ id: "bone", count: [0, 2], chance: 1 }, { id: "arrow", count: [0, 2], chance: 0.5 }],
  },
  creeper: {
    health: 20, w: 0.6, h: 1.7, speed: 1.8, damage: 15,
    hostile: true, detectionRange: 12, attackRange: 2.5, attackCooldown: 2.5,
    drops: [{ id: "gunpowder", count: [0, 2], chance: 1 }],
  },
  spider: {
    health: 16, w: 1.4, h: 0.9, speed: 2.7, damage: 2,
    hostile: true, detectionRange: 14, attackRange: 2.5, attackCooldown: 1.0,
    drops: [{ id: "string", count: [0, 2], chance: 1 }, { id: "spider_eye", count: [0, 1], chance: 0.33 }],
  },
  cow: {
    health: 10, w: 0.9, h: 1.4, speed: 1.5, damage: 0,
    hostile: false, detectionRange: 0, attackRange: 0, attackCooldown: 0,
    drops: [{ id: "beef", count: [1, 3], chance: 1 }, { id: "leather", count: [0, 2], chance: 1 }],
  },
  sheep: {
    health: 8, w: 0.9, h: 1.3, speed: 1.5, damage: 0,
    hostile: false, detectionRange: 0, attackRange: 0, attackCooldown: 0,
    drops: [{ id: "mutton", count: [1, 2], chance: 1 }, { id: "white_wool", count: [1, 1], chance: 1 }],
  },
  chicken: {
    health: 4, w: 0.4, h: 0.7, speed: 1.8, damage: 0,
    hostile: false, detectionRange: 0, attackRange: 0, attackCooldown: 0,
    drops: [{ id: "chicken", count: [1, 1], chance: 1 }, { id: "feather", count: [0, 2], chance: 1 }],
  },
  pig: {
    health: 10, w: 0.9, h: 0.9, speed: 1.5, damage: 0,
    hostile: false, detectionRange: 0, attackRange: 0, attackCooldown: 0,
    drops: [{ id: "porkchop", count: [1, 3], chance: 1 }],
  },
};

export class Mob extends Entity {
  constructor(x, y, z, typeName, world) {
    const def = MOB_TYPES[typeName];
    super(x, y, z, def.w, def.h);
    this.type = typeName;
    this.world = world;
    this.health = def.health;
    this.maxHealth = def.health;
    this.speed = def.speed;
    this.attackDamage = def.damage;
    this.hostile = def.hostile;
    this.detectionRange = def.detectionRange;
    this.attackRange = def.attackRange;
    this.attackCooldownMax = def.attackCooldown;
    this.attackTimer = 0;
    this.target = null;
    this.wanderAngle = 0;
    this.wanderTimer = 0;
    this._hurtFlash = 0;
    this._idleTimer = 0;
    this._drops = def.drops;
  }

  takeDamage(amount) {
    super.takeDamage(amount);
    this._hurtFlash = 0.15;
  }

  update(dt, playerPos) {
    if (!this.alive) return;

    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this._hurtFlash = Math.max(0, this._hurtFlash - dt);
    this._idleTimer += dt;

    const dx = playerPos.x - this.pos.x;
    const dz = playerPos.z - this.pos.z;
    const dist = Math.hypot(dx, dz);

    if (this.hostile) {
      if (dist < this.detectionRange) {
        this.target = playerPos;
        this._idleTimer = 0;
      } else if (this._idleTimer > 3) {
        this.target = null;
      }
    }

    if (this.target) {
      const tdx = this.target.x - this.pos.x;
      const tdz = this.target.z - this.pos.z;
      const tDist = Math.hypot(tdx, tdz);
      this.yaw = Math.atan2(-tdx, -tdz);

      if (tDist > this.attackRange) {
        const norm = this.speed / Math.max(tDist, 0.5);
        this.vel.x = tdx * norm;
        this.vel.z = tdz * norm;

        if (this.onGround) {
          const step = Math.floor(this.pos.y);
          const aheadX = Math.floor(this.pos.x + this.vel.x * 0.5 / this.speed);
          const aheadZ = Math.floor(this.pos.z + this.vel.z * 0.5 / this.speed);
          if (this.isSolidAt(aheadX, step + 2, aheadZ) && !this.isSolidAt(aheadX, step + 1, aheadZ)) {
            this.vel.y = 7;
            this.onGround = false;
          }
        }
      } else {
        this.vel.x = 0;
        this.vel.z = 0;
        if (this.hostile && this.attackTimer <= 0) {
          this.attackTimer = this.attackCooldownMax;
          return { attack: true, damage: this.attackDamage, mob: this };
        }
      }
    } else {
      if (this._idleTimer > 3) {
        this.wanderTimer += dt;
        if (this.wanderTimer > 2 + Math.random() * 2) {
          this.wanderTimer = 0;
          this.wanderAngle = Math.random() * Math.PI * 2;
        }
        this.vel.x = Math.sin(this.wanderAngle) * this.speed * 0.3;
        this.vel.z = Math.cos(this.wanderAngle) * this.speed * 0.3;
        this.yaw = this.wanderAngle;
      }
    }

    this.applyGravity(dt);
    this.move(dt);
    this.updateMesh();
    return null;
  }

  getDropTable() {
    return this._drops.map(d => ({
      id: d.id,
      count: d.count[0] + Math.floor(Math.random() * (d.count[1] - d.count[0] + 1)),
      chance: d.chance,
    })).filter(d => Math.random() < d.chance);
  }
}
