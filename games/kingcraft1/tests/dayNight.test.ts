import { describe, expect, it } from "vitest";
import { MIN_DAY_FACTOR, skyColors } from "../src/render/sky";

function luma(rgb: [number, number, number]): number {
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

describe("skyColors", () => {
  it("keeps every channel within unit range", () => {
    for (const day of [0.08, 0.2, 0.35, 0.5, 0.65, 0.85, 1]) {
      const sky = skyColors(day);
      for (const channel of [...sky.top, ...sky.horizon, ...sky.fog, sky.sunIntensity]) {
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(1);
      }
    }
  });

  it("brightens monotonically from night to noon", () => {
    const samples = [MIN_DAY_FACTOR, 0.25, 0.5, 0.75, 1];
    let previousLuma = -1;
    let previousSun = -1;
    for (const day of samples) {
      const sky = skyColors(day);
      expect(luma(sky.top)).toBeGreaterThan(previousLuma);
      expect(sky.sunIntensity).toBeGreaterThan(previousSun);
      previousLuma = luma(sky.top);
      previousSun = sky.sunIntensity;
    }
  });

  it("clamps the day factor at both ends", () => {
    expect(skyColors(-3)).toEqual(skyColors(MIN_DAY_FACTOR));
    expect(skyColors(0)).toEqual(skyColors(MIN_DAY_FACTOR));
    expect(skyColors(5)).toEqual(skyColors(1));
  });

  it("is continuous around the dusk midpoint", () => {
    const mid = skyColors(0.5);
    const before = skyColors(0.499);
    const after = skyColors(0.501);
    for (let i = 0; i < 3; i++) {
      expect(Math.abs(mid.top[i] - before.top[i])).toBeLessThan(0.05);
      expect(Math.abs(mid.top[i] - after.top[i])).toBeLessThan(0.05);
      expect(Math.abs(mid.horizon[i] - before.horizon[i])).toBeLessThan(0.05);
      expect(Math.abs(mid.fog[i] - before.fog[i])).toBeLessThan(0.05);
      expect(Math.abs(mid.fog[i] - after.fog[i])).toBeLessThan(0.05);
    }
    expect(Math.abs(mid.sunIntensity - before.sunIntensity)).toBeLessThan(0.05);
    expect(Math.abs(mid.sunIntensity - after.sunIntensity)).toBeLessThan(0.05);
  });

  it("keeps daytime fog and horizon brighter than night tones", () => {
    expect(luma(skyColors(1).fog)).toBeGreaterThan(luma(skyColors(MIN_DAY_FACTOR).fog));
    expect(luma(skyColors(0.75).horizon)).toBeGreaterThan(luma(skyColors(MIN_DAY_FACTOR).horizon));
  });
});
