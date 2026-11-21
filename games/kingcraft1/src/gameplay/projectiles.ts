import { GRAVITY } from "../config";
import { isSolidBlock } from "../content/blocks";

export const PROJECTILE_GRAVITY_SCALE = 0.3;
export const PROJECTILE_LIFETIME_SECONDS = 5;
export const PROJECTILE_MAX_STEP = 0.25;

export interface Projectile {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  damage: number;
  life: number;
}

export interface ProjectileWorld {
  getBlock(x: number, y: number, z: number): number;
}

export interface ProjectileHit {
  x: number;
  y: number;
  z: number;
  blocked: boolean;
}

export type SegmentHook = (from: Projectile, dir: { x: number; y: number; z: number }, distance: number) => boolean;

export class ProjectileManager {
  readonly list: Projectile[] = [];

  get count(): number {
    return this.list.length;
  }

  shoot(origin: { x: number; y: number; z: number }, dir: { x: number; y: number; z: number }, speed: number, damage: number): Projectile {
    const length = Math.hypot(dir.x, dir.y, dir.z) || 1;
    const projectile: Projectile = {
      x: origin.x,
      y: origin.y,
      z: origin.z,
      vx: (dir.x / length) * speed,
      vy: (dir.y / length) * speed,
      vz: (dir.z / length) * speed,
      damage,
      life: PROJECTILE_LIFETIME_SECONDS
    };
    this.list.push(projectile);
    return projectile;
  }

  tick(world: ProjectileWorld, dt: number, onSegment: SegmentHook): ProjectileHit[] {
    const hits: ProjectileHit[] = [];
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.list.splice(i, 1);
        continue;
      }
      p.vy += GRAVITY * PROJECTILE_GRAVITY_SCALE * dt;
      let remaining = Math.hypot(p.vx, p.vy, p.vz) * dt;
      const length = Math.hypot(p.vx, p.vy, p.vz) || 1;
      const dir = { x: p.vx / length, y: p.vy / length, z: p.vz / length };
      let hit: ProjectileHit | null = null;
      while (remaining > 0 && !hit) {
        const step = Math.min(PROJECTILE_MAX_STEP, remaining);
        remaining -= step;
        if (onSegment(p, dir, step)) {
          hit = { x: p.x, y: p.y, z: p.z, blocked: false };
          break;
        }
        p.x += dir.x * step;
        p.y += dir.y * step;
        p.z += dir.z * step;
        if (isSolidBlock(world.getBlock(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)))) {
          hit = { x: p.x, y: p.y, z: p.z, blocked: true };
        }
      }
      if (hit) {
        hits.push(hit);
        this.list.splice(i, 1);
      }
    }
    return hits;
  }

  clear(): void {
    this.list.length = 0;
  }
}
