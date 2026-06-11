// توليد التضاريس: ارتفاع السطح، الكهوف البسيطة، الأشجار، طبقات الكتل.
import { Noise } from "../utils/Noise.js";
import { WORLD_HEIGHT, SEA_LEVEL } from "../utils/Constants.js";

const GRASS = 1, DIRT = 2, STONE = 3, SAND = 4, WOOD = 5, LEAVES = 6, SNOW = 9, WATER = 10, AIR = 0;
const COAL_ORE = 12, IRON_ORE = 13, GOLD_ORE = 14, DIAMOND_ORE = 15;

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

export class TerrainGen {
  constructor(seed = 20260610) {
    this.height = new Noise(seed);
    this.detail = new Noise(seed + 1);
    this.tree = new Noise(seed + 2);
    this.biome = new Noise(seed + 3);
  }

  // ارتفاع السطح عند (x,z)
  surfaceHeight(x, z) {
    const continental = this.height.fbm(x * 0.006, z * 0.006, 4) * 22;
    const hills = this.detail.fbm(x * 0.02, z * 0.02, 3) * 8;
    return Math.floor(SEA_LEVEL + continental + hills);
  }

  // 0=صحراء 1=سهل 2=جبل ثلجي
  biomeAt(x, z) {
    const b = this.biome.fbm(x * 0.004, z * 0.004, 2);
    if (b < -0.25) return 0;
    if (b > 0.32) return 2;
    return 1;
  }

  // يملأ مصفوفة كتل القطعة. blocks: Uint8Array مفهرسة عبر idx(x,y,z)
  generateChunk(cx, cz, size, setBlock) {
    for (let lx = 0; lx < size; lx++) {
      for (let lz = 0; lz < size; lz++) {
        const wx = cx * size + lx;
        const wz = cz * size + lz;
        const h = this.surfaceHeight(wx, wz);
        const biome = this.biomeAt(wx, wz);

        for (let y = 0; y <= Math.max(h, SEA_LEVEL); y++) {
          if (y >= WORLD_HEIGHT) break;
          let block = AIR;

          if (y === 0) {
            block = STONE;
          } else if (y < h - 3) {
            block = pickOre(wx, y, wz);
          } else if (y < h) {
            block = biome === 0 ? SAND : DIRT;
          } else if (y === h) {
            // كتلة السطح
            if (biome === 0) block = SAND;
            else if (biome === 2 && y > SEA_LEVEL + 16) block = SNOW;
            else block = h < SEA_LEVEL ? SAND : GRASS;
          } else if (y <= SEA_LEVEL) {
            block = WATER;
          }

          if (block !== AIR) setBlock(lx, y, lz, block);
        }

        // الأشجار (فوق العشب، فوق سطح البحر، بكثافة منخفضة)
        if (biome === 1 && h > SEA_LEVEL && h + 6 < WORLD_HEIGHT) {
          const t = this.tree.perlin2(wx * 0.9, wz * 0.9);
          // hash موضعي شبه عشوائي لتفادي الصفوف
          const hash = (Math.sin(wx * 12.9898 + wz * 78.233) * 43758.5453) % 1;
          if (t > 0.34 && Math.abs(hash) > 0.92) {
            this.placeTree(lx, h + 1, lz, size, setBlock);
          }
        }
      }
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
          // نضع الأوراق فقط داخل القطعة (تبسيط الحدود)
          if (x >= 0 && x < size && z >= 0 && z < size && y < WORLD_HEIGHT) {
            setBlock(x, y, z, LEAVES);
          }
        }
      }
    }
  }
}
