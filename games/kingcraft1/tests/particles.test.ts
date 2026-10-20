import { describe, expect, it } from "vitest";
import { B } from "../src/content/blocks";
import { Rng } from "../src/core/rng";
import { BREAK_PARTICLES_MAX, BREAK_PARTICLES_MIN, PARTICLE_LIFE_MAX, ParticleSystem } from "../src/render/particles";
import { MapWorld } from "./helpers/mapWorld";

describe("ParticleSystem", () => {
  it("spawns 8-12 particles per break burst with the given colours", () => {
    const system = new ParticleSystem(500);
    const rng = new Rng(3);
    for (let i = 0; i < 30; i++) {
      const before = system.particles.length;
      const n = system.burst(0.5, 5.5, 0.5, [0x112233, 0x445566], rng);
      expect(n).toBeGreaterThanOrEqual(BREAK_PARTICLES_MIN);
      expect(n).toBeLessThanOrEqual(BREAK_PARTICLES_MAX);
      expect(system.particles.length - before).toBe(n);
    }
    expect(system.particles.every((p) => p.color === 0x112233 || p.color === 0x445566)).toBe(true);
  });

  it("never exceeds the cap and keeps the newest particles", () => {
    const system = new ParticleSystem(20);
    const rng = new Rng(1);
    for (let i = 0; i < 10; i++) system.burst(0, 0, 0, [i], rng, 10);
    expect(system.particles.length).toBe(20);
    expect(system.particles[system.particles.length - 1].color).toBe(9);
    system.setCap(5);
    expect(system.particles.length).toBe(5);
    expect(new ParticleSystem(0).burst(0, 0, 0, [1], rng)).toBe(0);
  });

  it("falls under gravity, rests on solid ground and expires", () => {
    const world = new MapWorld(2, B.STONE);
    const system = new ParticleSystem(100);
    system.burst(0.5, 3.5, 0.5, [1], new Rng(9), 10);
    let lowest = Number.POSITIVE_INFINITY;
    let rested = 0;
    for (let i = 0; i < 26; i++) {
      system.step(1 / 60, world);
      for (const p of system.particles) {
        expect(p.y - p.size / 2).toBeGreaterThanOrEqual(3 - 1e-9);
        lowest = Math.min(lowest, p.y);
        if (p.vy === 0) rested++;
      }
    }
    expect(system.particles.length).toBe(10);
    expect(rested).toBeGreaterThan(0);
    expect(lowest).toBeLessThan(3.5);
    for (let i = 0; i < Math.ceil(PARTICLE_LIFE_MAX * 60); i++) system.step(1 / 60, world);
    expect(system.particles).toHaveLength(0);
  });

  it("ignores empty colour lists", () => {
    expect(new ParticleSystem(10).burst(0, 0, 0, [], new Rng(1))).toBe(0);
  });
});

describe("perf panel and sound recipes", () => {
  it("averages frame times and formats panel lines", async () => {
    const { FrameTimer, perfLines } = await import("../src/render/perfPanel");
    const timer = new FrameTimer(3);
    for (const ms of [10, 20, 30, 40, Number.NaN, -1]) timer.add(ms);
    expect(timer.average).toBe(30);
    expect(timer.worst).toBe(40);
    const lines = perfLines(timer, { calls: 12, triangles: 3400, geometries: 50, textures: 3 }, { loaded: 9, pending: 0, loadedTotal: 11, unloadedTotal: 2 }, 4, 7);
    expect(lines.join("\n")).toContain("Draw calls 12");
    expect(lines.join("\n")).toContain("+11 -2");
  });

  it("gives every sound kind at least one voice and varies by material", async () => {
    const { voicesFor } = await import("../src/audio/sfx");
    for (const kind of ["dig", "break", "place", "step", "hurt", "craft", "eat", "pickup"] as const) {
      const voices = voicesFor(kind, "stone");
      expect(voices.length).toBeGreaterThan(0);
      for (const v of voices) {
        expect(v.duration).toBeGreaterThan(0);
        expect(v.gain).toBeGreaterThan(0);
        expect(v.gain).toBeLessThanOrEqual(1);
      }
    }
    const stone = voicesFor("break", "stone")[0];
    const sand = voicesFor("break", "sand")[0];
    expect(stone.type === "noise" && sand.type === "noise" && stone.frequency !== sand.frequency).toBe(true);
  });

  it("produces a cloud mask with both clouds and gaps, deterministic per seed", async () => {
    const { cloudMask } = await import("../src/render/clouds");
    const a = cloudMask(64, 5);
    const covered = a.reduce((sum, v) => sum + v, 0) / a.length;
    expect(covered).toBeGreaterThan(0.05);
    expect(covered).toBeLessThan(0.8);
    expect(cloudMask(64, 5)).toEqual(a);
    expect(cloudMask(64, 6)).not.toEqual(a);
  });
});
