import { GRAVITY } from "../config";
import { isSolidBlock } from "../content/blocks";
import type { Rng } from "../core/rng";

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: number;
  size: number;
}

export interface ParticleWorld {
  getBlock(x: number, y: number, z: number): number;
}

export const BREAK_PARTICLES_MIN = 8;
export const BREAK_PARTICLES_MAX = 12;
export const PARTICLE_LIFE_MIN = 0.45;
export const PARTICLE_LIFE_MAX = 0.9;
export const PARTICLE_DRAG = 0.9;

export class ParticleSystem {
  readonly particles: Particle[] = [];

  constructor(public cap: number) {}

  burst(x: number, y: number, z: number, colors: readonly number[], rng: Rng, count?: number): number {
    if (colors.length === 0 || this.cap <= 0) return 0;
    const wanted = count ?? rng.intRange(BREAK_PARTICLES_MIN, BREAK_PARTICLES_MAX);
    let spawned = 0;
    for (let i = 0; i < wanted; i++) {
      if (this.particles.length >= this.cap) this.particles.shift();
      const life = rng.range(PARTICLE_LIFE_MIN, PARTICLE_LIFE_MAX);
      this.particles.push({
        x: x + rng.range(-0.35, 0.35),
        y: y + rng.range(-0.35, 0.35),
        z: z + rng.range(-0.35, 0.35),
        vx: rng.range(-2, 2),
        vy: rng.range(1.5, 4.5),
        vz: rng.range(-2, 2),
        life,
        maxLife: life,
        color: colors[rng.nextInt(colors.length)],
        size: rng.range(0.07, 0.13)
      });
      spawned++;
    }
    return spawned;
  }

  step(dt: number, world: ParticleWorld | null = null): void {
    const drag = Math.pow(PARTICLE_DRAG, dt * 20);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += GRAVITY * 0.6 * dt;
      p.vx *= drag;
      p.vz *= drag;
      const ny = p.y + p.vy * dt;
      if (world && p.vy < 0 && isSolidBlock(world.getBlock(Math.floor(p.x), Math.floor(ny - p.size / 2), Math.floor(p.z)))) {
        p.y = Math.floor(ny - p.size / 2) + 1 + p.size / 2;
        p.vy = 0;
        p.vx *= 0.5;
        p.vz *= 0.5;
      } else {
        p.y = ny;
      }
      p.x += p.vx * dt;
      p.z += p.vz * dt;
    }
  }

  setCap(cap: number): void {
    this.cap = Math.max(0, Math.floor(cap));
    if (this.particles.length > this.cap) this.particles.splice(0, this.particles.length - this.cap);
  }

  clear(): void {
    this.particles.length = 0;
  }
}
