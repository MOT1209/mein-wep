import { Rng } from "./rng";

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const GRAD3 = new Int8Array([
  1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
]);

export class Perlin {
  private perm = new Uint8Array(512);

  constructor(seed: number) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    const rng = new Rng(seed);
    for (let i = 255; i > 0; i--) {
      const j = rng.nextInt(i + 1);
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  noise2(x: number, y: number): number {
    const xf = Math.floor(x);
    const yf = Math.floor(y);
    const xi = xf & 255;
    const yi = yf & 255;
    const xr = x - xf;
    const yr = y - yf;
    const u = fade(xr);
    const v = fade(yr);
    const p = this.perm;
    const aa = p[p[xi] + yi];
    const ab = p[p[xi] + yi + 1];
    const ba = p[p[xi + 1] + yi];
    const bb = p[p[xi + 1] + yi + 1];
    const g1 = this.grad2(aa, xr, yr);
    const g2 = this.grad2(ba, xr - 1, yr);
    const g3 = this.grad2(ab, xr, yr - 1);
    const g4 = this.grad2(bb, xr - 1, yr - 1);
    return lerp(lerp(g1, g2, u), lerp(g3, g4, u), v);
  }

  noise3(x: number, y: number, z: number): number {
    const xf = Math.floor(x);
    const yf = Math.floor(y);
    const zf = Math.floor(z);
    const xi = xf & 255;
    const yi = yf & 255;
    const zi = zf & 255;
    const xr = x - xf;
    const yr = y - yf;
    const zr = z - zf;
    const u = fade(xr);
    const v = fade(yr);
    const w = fade(zr);
    const p = this.perm;
    const aaa = p[p[p[xi] + yi] + zi];
    const aba = p[p[p[xi] + yi + 1] + zi];
    const aab = p[p[p[xi] + yi] + zi + 1];
    const abb = p[p[p[xi] + yi + 1] + zi + 1];
    const baa = p[p[p[xi + 1] + yi] + zi];
    const bba = p[p[p[xi + 1] + yi + 1] + zi];
    const bab = p[p[p[xi + 1] + yi] + zi + 1];
    const bbb = p[p[p[xi + 1] + yi + 1] + zi + 1];
    const g1 = this.grad3(aaa, xr, yr, zr);
    const g2 = this.grad3(baa, xr - 1, yr, zr);
    const g3 = this.grad3(aba, xr, yr - 1, zr);
    const g4 = this.grad3(bba, xr - 1, yr - 1, zr);
    const g5 = this.grad3(aab, xr, yr, zr - 1);
    const g6 = this.grad3(bab, xr - 1, yr, zr - 1);
    const g7 = this.grad3(abb, xr, yr - 1, zr - 1);
    const g8 = this.grad3(bbb, xr - 1, yr - 1, zr - 1);
    const x1 = lerp(g1, g2, u);
    const x2 = lerp(g3, g4, u);
    const x3 = lerp(g5, g6, u);
    const x4 = lerp(g7, g8, u);
    const y1 = lerp(x1, x2, v);
    const y2 = lerp(x3, x4, v);
    return lerp(y1, y2, w);
  }

  fbm2(x: number, y: number, octaves: number, lacunarity = 2, persistence = 0.5): number {
    let sum = 0;
    let amp = 1;
    let freq = 1;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += this.noise2(x * freq, y * freq) * amp;
      norm += amp;
      amp *= persistence;
      freq *= lacunarity;
    }
    return sum / norm;
  }

  fbm3(x: number, y: number, z: number, octaves: number, lacunarity = 2, persistence = 0.5): number {
    let sum = 0;
    let amp = 1;
    let freq = 1;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += this.noise3(x * freq, y * freq, z * freq) * amp;
      norm += amp;
      amp *= persistence;
      freq *= lacunarity;
    }
    return sum / norm;
  }

  ridged2(x: number, y: number, octaves: number): number {
    let sum = 0;
    let amp = 1;
    let freq = 1;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
      const n = 1 - Math.abs(this.noise2(x * freq, y * freq));
      sum += n * n * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum / norm;
  }

  private grad2(hash: number, x: number, y: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  private grad3(hash: number, x: number, y: number, z: number): number {
    const i = (hash % 12) * 3;
    return GRAD3[i] * x + GRAD3[i + 1] * y + GRAD3[i + 2] * z;
  }
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
