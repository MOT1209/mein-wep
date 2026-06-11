// 2D Simplex/Perlin-style noise — تنفيذ مستقل بدون مكتبات خارجية.
// مبني على gradient noise مع seed قابل للضبط.

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a, b, t) { return a + t * (b - a); }

export class Noise {
  constructor(seed = 1337) {
    // بناء جدول التبديل (permutation) من البذرة
    this.p = new Uint8Array(512);
    const perm = new Uint8Array(256);
    for (let i = 0; i < 256; i++) perm[i] = i;

    let s = seed >>> 0;
    const rand = () => {
      // xorshift32
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };

    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = perm[i]; perm[i] = perm[j]; perm[j] = t;
    }
    for (let i = 0; i < 512; i++) this.p[i] = perm[i & 255];
  }

  grad(hash, x, y) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
  }

  // قيمة بين -1 و 1 تقريباً
  perlin2(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const p = this.p;
    const a = p[X] + Y;
    const b = p[X + 1] + Y;
    return lerp(
      lerp(this.grad(p[a], x, y),     this.grad(p[b], x - 1, y), u),
      lerp(this.grad(p[a + 1], x, y - 1), this.grad(p[b + 1], x - 1, y - 1), u),
      v
    ) * 0.5;
  }

  // fractal Brownian motion — يجمع عدة طبقات
  fbm(x, y, octaves = 4, lacunarity = 2, gain = 0.5) {
    let amp = 1, freq = 1, sum = 0, norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * this.perlin2(x * freq, y * freq);
      norm += amp;
      amp *= gain;
      freq *= lacunarity;
    }
    return sum / norm;
  }
}
