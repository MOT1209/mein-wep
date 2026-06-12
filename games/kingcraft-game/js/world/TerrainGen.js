// توليد التضاريس: ارتفاع السطح، الكهوف، البايومز، الأشجار، الزينة.
import { Noise } from "../utils/Noise.js";
import { WORLD_HEIGHT, SEA_LEVEL } from "../utils/Constants.js";

const AIR = 0;
const GRASS = 1, DIRT = 2, STONE = 3, SAND = 4, WOOD = 5, LEAVES = 6, SNOW = 9, WATER = 10;
const COAL_ORE = 12, IRON_ORE = 13, GOLD_ORE = 14, DIAMOND_ORE = 15;
// المرحلة 4
const GRAVEL = 21, GRANITE = 22, DIORITE = 23, ANDESITE = 24, MUD = 25, PODZOL = 26;
const CLAY = 27, SANDSTONE = 28, ICE = 29, SNOW_BLOCK = 30, PACKED_ICE = 31;
const MOSSY_COBBLE = 32, OBSIDIAN = 33;
const RED_FLOWER = 37, YELLOW_FLOWER = 38, BROWN_MUSHROOM = 39, RED_MUSHROOM = 40;
const DEAD_BUSH = 41, TALL_GRASS = 42, CACTUS = 43, VINE = 44;

function caveNoise(noise, x, y, z) {
  const s = 0.04;
  return noise.fbm3(x * s, y * s, z * s, 3);
}

// hash شبه عشوائي ثابت من إحداثيات العالم -> 0..1
function hash3(x, y, z) {
  let n = x * 374761393 + y * 668265263 + z * 1274126177;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967296;
}

function pickOre(x, y, z) {
  const r = hash3(x, y, z);
  if (y < 14 && r < 0.010) return DIAMOND_ORE;
  if (y < 28 && r < 0.020) return GOLD_ORE;
  if (r < 0.055) return IRON_ORE;
  if (r < 0.110) return COAL_ORE;
  return STONE;
}

function pickStone(x, y, z) {
  const r = hash3(x + 1000, y, z + 1000);
  if (r < 0.08) return GRANITE;
  if (r < 0.18) return DIORITE;
  if (r < 0.28) return ANDESITE;
  return STONE;
}

// ===== تعريفات البايومز =====
const BIOMES = [
  { id: 0, name: "desert",  surface: SAND,  subSurface: SANDSTONE, treeFreq: 0,   decoration: "cactus" },
  { id: 1, name: "plains",  surface: GRASS, subSurface: DIRT,     treeFreq: 0.03, decoration: "tall_grass" },
  { id: 2, name: "snowy",   surface: SNOW,  subSurface: DIRT,     treeFreq: 0,    decoration: "none" },
  { id: 3, name: "forest",  surface: GRASS, subSurface: DIRT,     treeFreq: 0.20, decoration: "flowers" },
  { id: 4, name: "swamp",   surface: GRASS, subSurface: MUD,      treeFreq: 0.06, decoration: "mushroom" },
  { id: 5, name: "taiga",   surface: PODZOL,subSurface: DIRT,     treeFreq: 0.10, decoration: "mushroom" },
];

export class TerrainGen {
  constructor(seed = 20260610) {
    this.height = new Noise(seed);
    this.detail = new Noise(seed + 1);
    this.tree = new Noise(seed + 2);
    this.biomeNoise = new Noise(seed + 3);
    this.caveNoise3D = new Noise(seed + 4);
    this.deco = new Noise(seed + 5);
  }

  surfaceHeight(x, z) {
    const continental = this.height.fbm(x * 0.006, z * 0.006, 4) * 22;
    const hills = this.detail.fbm(x * 0.02, z * 0.02, 3) * 8;
    return Math.floor(SEA_LEVEL + continental + hills);
  }

  biomeAt(x, z) {
    const b = this.biomeNoise.fbm(x * 0.004, z * 0.004, 2);
    const temp = this.biomeNoise.fbm(x * 0.003 + 500, z * 0.003, 2);
    if (temp > 0.25) return 0;        // desert
    if (b > 0.38) return 2;            // snowy mountains
    if (b > 0.22) return 5;            // taiga
    if (temp < -0.15) return 4;        // swamp
    const r = this.tree.perlin2(x * 0.015, z * 0.015);
    if (r > 0.12) return 3;            // forest
    return 1;                          // plains
  }

  isCave(x, y, z) {
    if (y < 5 || y > SEA_LEVEL - 3) return false;
    const n = caveNoise(this.caveNoise3D, x, y, z);
    // قيمة العتبة: كلما تعمقنا زادت فرصة الكهوف
    const threshold = 0.18 + (SEA_LEVEL - y) / SEA_LEVEL * 0.15;
    return n < -0.15 && n > -0.15 - threshold;
  }

  generateChunk(cx, cz, size, setBlock) {
    for (let lx = 0; lx < size; lx++) {
      for (let lz = 0; lz < size; lz++) {
        const wx = cx * size + lx;
        const wz = cz * size + lz;
        const h = this.surfaceHeight(wx, wz);
        const biome = this.biomeAt(wx, wz);
        const bio = BIOMES[biome];

        for (let y = 0; y <= Math.max(h, SEA_LEVEL); y++) {
          if (y >= WORLD_HEIGHT) break;
          let block = AIR;

          // الكهوف: نقطع الصخر إذا كان شرط الكهف محققاً
          const isCaveBlock = this.isCave(wx, y, wz);
          if (isCaveBlock && y < h - 1 && y > 2) {
            // فرصة لظهور mossy cobble في أرضية الكهف
            if (y === Math.floor(this.surfaceHeight(wx, wz) * 0.5) || hash3(wx, y, wz) < 0.02) {
              block = MOSSY_COBBLE;
            }
            // فرصة لظهور حصى في الكهوف
            if (hash3(wx + 200, y, wz + 300) < 0.03) {
              block = GRAVEL;
            }
            if (block === AIR) continue;
            setBlock(lx, y, lz, block);
            continue;
          }

          if (y === 0) {
            block = pickStone(wx, y, wz);
          } else if (y < h - 4) {
            // صخر مع عروق
            if (hash3(wx, y, wz) < 0.004) {
              const vein = hash3(wx + 50, y, wz + 50);
              if (vein < 0.25) block = GRAVEL;
              else if (vein < 0.5) block = GRANITE;
              else if (vein < 0.75) block = DIORITE;
              else block = ANDESITE;
            } else {
              block = pickOre(wx, y, wz);
            }
          } else if (y < h) {
            if (biome === 0) {
              block = y < h - 2 ? SANDSTONE : SAND;
            } else if (biome === 2) {
              block = DIRT;
            } else if (biome === 4) {
              block = MUD;
            } else if (biome === 5) {
              block = DIRT;
            } else {
              block = DIRT;
            }
          } else if (y === h) {
            if (biome === 0) block = h < SEA_LEVEL + 2 ? SAND : SAND;
            else if (biome === 2) block = y > SEA_LEVEL + 12 ? SNOW : (h < SEA_LEVEL ? SAND : GRASS);
            else if (biome === 4) block = h < SEA_LEVEL + 1 ? GRASS : GRASS;
            else if (biome === 5) block = PODZOL;
            else block = h < SEA_LEVEL ? SAND : GRASS;
          } else if (y <= SEA_LEVEL && h <= SEA_LEVEL) {
            block = WATER;
          }

          if (block !== AIR) setBlock(lx, y, lz, block);
        }

        // ===== زينة السطح =====
        if (h > SEA_LEVEL && h + 6 < WORLD_HEIGHT) {
          this.placeDecoration(lx, h + 1, lz, wx, wz, biome, bio, size, setBlock);
        }
      }
    }
  }

  placeDecoration(lx, baseY, lz, wx, wz, biome, bio, size, setBlock) {
    const hash = (Math.sin(wx * 12.9898 + wz * 78.233) * 43758.5453) % 1;

    // أشجار
    if (biome !== 0 && biome !== 2) {
      const t = this.tree.perlin2(wx * 0.9, wz * 0.9);
      const threshold = BIOMES[biome].treeFreq;
      if (t > 0.38 && Math.abs(hash) > 1 - threshold) {
        if (biome === 5) {
          this.placeSpruceTree(lx, baseY, lz, size, setBlock);
        } else {
          this.placeTree(lx, baseY, lz, size, setBlock);
        }
        return;
      }
    }

    // زهور / عشب / فطر / صبار
    const decoType = bio.decoration;
    const r2 = Math.abs(hash);
    if (decoType === "tall_grass" && r2 > 0.94) {
      setBlock(lx, baseY, lz, TALL_GRASS);
    } else if (decoType === "flowers" && r2 > 0.92) {
      setBlock(lx, baseY, lz, r2 > 0.96 ? RED_FLOWER : YELLOW_FLOWER);
    } else if (decoType === "cactus" && r2 > 0.93 && biome === 0) {
      this.placeCactus(lx, baseY, lz, size, setBlock);
    } else if (decoType === "mushroom" && r2 > 0.95) {
      if (biome === 4) {
        // مستنقع: فطر بني + كرمة على الأشجار
        setBlock(lx, baseY, lz, r2 > 0.97 ? RED_MUSHROOM : BROWN_MUSHROOM);
      } else {
        setBlock(lx, baseY, lz, BROWN_MUSHROOM);
      }
    } else if (biome === 0 && r2 > 0.90 && r2 < 0.92) {
      setBlock(lx, baseY, lz, DEAD_BUSH);
    } else if (biome === 1 && r2 > 0.96) {
      setBlock(lx, baseY, lz, TALL_GRASS);
    }
  }

  placeTree(lx, baseY, lz, size, setBlock) {
    const trunk = 4 + (Math.abs(Math.floor(baseY * 7)) % 2);
    for (let i = 0; i < trunk; i++) setBlock(lx, baseY + i, lz, WOOD);

    const topY = baseY + trunk;
    for (let dy = -2; dy <= 1; dy++) {
      const r = dy <= -1 ? 2 : 1;
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (dx === 0 && dz === 0 && dy < 1) continue;
          if (Math.abs(dx) === r && Math.abs(dz) === r && dy > -1) continue;
          const x = lx + dx, z = lz + dz, y = topY + dy;
          if (y < WORLD_HEIGHT && y >= 0) setBlock(x, y, z, LEAVES);
        }
      }
    }
  }

  placeSpruceTree(lx, baseY, lz, size, setBlock) {
    const trunk = 5 + (Math.abs(Math.floor(baseY * 13)) % 3);
    for (let i = 0; i < trunk; i++) setBlock(lx, baseY + i, lz, WOOD);

    const topY = baseY + trunk;
    // هرمي (أضيق كلما ارتفعنا)
    for (let dy = -3; dy <= 0; dy++) {
      const r = dy <= -2 ? 1 : (dy === -1 ? 2 : 1);
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (dx === 0 && dz === 0) continue;
          const x = lx + dx, z = lz + dz, y = topY + dy;
          if (y < WORLD_HEIGHT && y >= 0) setBlock(x, y, z, LEAVES);
        }
      }
    }
  }

  placeCactus(lx, baseY, lz, size, setBlock) {
    const h = 2 + (Math.abs(Math.floor(baseY * 11)) % 2);
    for (let i = 0; i < h; i++) {
      const y = baseY + i;
      if (y < WORLD_HEIGHT) setBlock(lx, y, lz, CACTUS);
    }
  }
}
