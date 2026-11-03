export interface SkyColors {
  top: [number, number, number];
  horizon: [number, number, number];
  fog: [number, number, number];
  sunIntensity: number;
}

export const MIN_DAY_FACTOR = 0.08;

const NIGHT: SkyColors = {
  top: [0.03, 0.04, 0.1],
  horizon: [0.07, 0.08, 0.16],
  fog: [0.05, 0.06, 0.12],
  sunIntensity: 0.05
};

const DUSK: SkyColors = {
  top: [0.32, 0.28, 0.44],
  horizon: [0.86, 0.54, 0.32],
  fog: [0.52, 0.42, 0.46],
  sunIntensity: 0.35
};

const NOON: SkyColors = {
  top: [0.36, 0.58, 0.88],
  horizon: [0.74, 0.86, 0.96],
  fog: [0.62, 0.76, 0.92],
  sunIntensity: 1
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mixRgb(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function blend(a: SkyColors, b: SkyColors, t: number): SkyColors {
  return {
    top: mixRgb(a.top, b.top, t),
    horizon: mixRgb(a.horizon, b.horizon, t),
    fog: mixRgb(a.fog, b.fog, t),
    sunIntensity: lerp(a.sunIntensity, b.sunIntensity, t)
  };
}

export function skyColors(dayFactor: number): SkyColors {
  const d = Math.min(1, Math.max(MIN_DAY_FACTOR, dayFactor));
  if (d <= 0.5) {
    return blend(NIGHT, DUSK, (d - MIN_DAY_FACTOR) / (0.5 - MIN_DAY_FACTOR));
  }
  return blend(DUSK, NOON, (d - 0.5) / 0.5);
}
