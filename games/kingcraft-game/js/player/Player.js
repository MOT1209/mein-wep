// اللاعب: الحركة، الجاذبية، التصادم AABB مع الكتل، القفز، الجري، الانحناء، الطيران.
import * as THREE from "three";
import {
  GRAVITY, JUMP_SPEED, WALK_SPEED, RUN_SPEED, FLY_SPEED,
  PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_EYE, WORLD_HEIGHT,
  EXHAUSTION_PER_JUMP, EXHAUSTION_PER_SPRINT,
} from "../utils/Constants.js";

const HALF = PLAYER_WIDTH / 2;
const SNEAK_HEIGHT = 1.5;
const SNEAK_SPEED = 1.2;

export class Player {
  constructor(world, camera) {
    this.world = world;
    this.camera = camera;
    this.pos = new THREE.Vector3(0, WORLD_HEIGHT, 0);
    this.vel = new THREE.Vector3();
    this.onGround = false;
    this._fallDist = 0;
    this.flying = false;
    this.sneaking = false;
    this.thirdPerson = false;
    this._height = PLAYER_HEIGHT;
    this._eye = PLAYER_EYE;

    this.keys = {};
    this._lastSpace = 0;

    this._bindInput();
  }

  _bindInput() {
    window.addEventListener("keydown", (e) => {
      const k = e.code;
      this.keys[k] = true;
      if (k === "KeyV") this.thirdPerson = !this.thirdPerson;
      if (k === "Space") {
        const now = performance.now();
        const dbl = now - this._lastSpace < 280;
        this._lastSpace = now;
        // تفعيل الطيران فقط عند الضغط المزدوج ونحن في الهواء أو نطير مسبقاً
        if (dbl && (!this.onGround || this.flying)) this.flying = !this.flying;
      }
    });
    window.addEventListener("keyup", (e) => { this.keys[e.code] = false; });
  }

  spawn() {
    const y = this.world.spawnHeight(0, 0);
    this.pos.set(0.5, y + 0.2, 0.5);
    this.vel.set(0, 0, 0);
    this._height = PLAYER_HEIGHT;
    this._eye = PLAYER_EYE;
    this._fallDist = 0;
  }

  _collides(px, py, pz, h) {
    const minX = Math.floor(px - HALF), maxX = Math.floor(px + HALF);
    const minY = Math.floor(py),        maxY = Math.floor(py + (h || this._height));
    const minZ = Math.floor(pz - HALF), maxZ = Math.floor(pz + HALF);
    for (let x = minX; x <= maxX; x++)
      for (let y = minY; y <= maxY; y++)
        for (let z = minZ; z <= maxZ; z++)
          if (this.world.isSolidAt(x, y, z)) return true;
    return false;
  }

  update(dt, yaw) {
    dt = Math.min(dt, 0.05);
    const startY = this.pos.y;

    this.sneaking = this.keys["ShiftLeft"] && !this.flying && this.onGround;

    const targetH = this.sneaking ? SNEAK_HEIGHT : PLAYER_HEIGHT;
    if (targetH > this._height && this._collides(this.pos.x, this.pos.y, this.pos.z, targetH)) {
      // عائق بالأعلى — ابق منحنياً
    } else {
      this._height = targetH;
    }
    this._eye = Math.min(this._height - 0.08, PLAYER_EYE);

    const run = this.keys["ControlLeft"] && !this.sneaking;
    const baseSpeed = this.flying ? FLY_SPEED : (this.sneaking ? SNEAK_SPEED : (run ? RUN_SPEED : WALK_SPEED));

    let fx = 0, fz = 0;
    if (this.keys["KeyW"]) fz += 1;
    if (this.keys["KeyS"]) fz -= 1;
    if (this.keys["KeyA"]) fx -= 1;
    if (this.keys["KeyD"]) fx += 1;
    const len = Math.hypot(fx, fz) || 1;
    fx /= len; fz /= len;

    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    const moveX = (fx * cos + fz * sin) * baseSpeed;
    const moveZ = (-fx * sin + fz * cos) * baseSpeed;

    if (this.flying) {
      this.vel.x = moveX;
      this.vel.z = moveZ;
      this.vel.y = 0;
      if (this.keys["Space"])               this.vel.y = FLY_SPEED;
      if (this.keys["ShiftLeft"])           this.vel.y = -FLY_SPEED;
    } else {
      this.vel.x = moveX;
      this.vel.z = moveZ;
      this.vel.y -= GRAVITY * dt;
      if (this.keys["Space"] && this.onGround) {
        this.vel.y = JUMP_SPEED;
        this.onGround = false;
        if (this.health) this.health.addExhaustion(EXHAUSTION_PER_JUMP);
      }
    }

    this._moveAxis("x", this.vel.x * dt);
    this._moveAxis("z", this.vel.z * dt);
    this._moveAxis("y", this.vel.y * dt);

    if (!this.flying) {
      const dy = startY - this.pos.y;
      if (dy > 0 && !this.onGround) {
        this._fallDist += dy;
      }
      if (this.onGround && this._fallDist > 0 && this.vel.y >= 0) {
        if (this.health) this.health.fallDamage(this._fallDist);
        this._fallDist = 0;
      }
    } else {
      this._fallDist = 0;
    }

    if (this.onGround && run && (Math.abs(this.vel.x) > 0.1 || Math.abs(this.vel.z) > 0.1)) {
      if (this.health) this.health.addExhaustion(EXHAUSTION_PER_SPRINT * (Math.abs(this.vel.x) + Math.abs(this.vel.z)) * dt);
    }

    if (this.pos.y < -10) {
      if (this.health) this.health.takeDamage(20);
      if (!this.health || this.health.dead) this.spawn();
    }

  }

  _moveAxis(axis, amount) {
    if (amount === 0) return;
    const p = this.pos;
    const old = p[axis];
    p[axis] += amount;

    if (this._collides(p.x, p.y, p.z)) {
      p[axis] = old;
      if (axis === "y") {
        if (amount < 0 && this.world.isSolidAt(p.x, p.y - 0.001, p.z)) this.onGround = true;
        this.vel.y = 0;
      }
    } else if (axis === "y" && amount < 0) {
      this.onGround = false;
    }
  }

  applyCamera(yaw, pitch) {
    const eye = new THREE.Vector3(this.pos.x, this.pos.y + this._eye, this.pos.z);
    const dir = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch)
    ).normalize();

    if (this.thirdPerson) {
      const back = eye.clone().addScaledVector(dir, -4.5);
      back.y += 0.4;
      this.camera.position.copy(back);
    } else {
      this.camera.position.copy(eye);
    }
    const look = eye.clone().add(dir);
    this.camera.lookAt(look);
    return dir;
  }

  get height() { return this._height; }
  get eye() { return this._eye; }
}
