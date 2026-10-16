import { CHUNK_SX, CHUNK_SY, CHUNK_SZ, SEA_LEVEL } from "../config";
import { B } from "../content/blocks";
import { Perlin, clamp, smoothstep } from "../core/noise";
import { Rng, hash2i, hash3i, hashFloat2, hashFloat3 } from "../core/rng";
import { BIOME, biomeById } from "./biomes";
import { Chunk, localIndex } from "./chunk";

const MOUNTAIN_OFFSET = 15;
const TEMP_OFFSET = 77;
const HUMID_OFFSET = 31;
const CAVE_OFFSET = 601;
const CAVE2_OFFSET = 733;
const UNDERSTONE_OFFSET = 909;

export class WorldGenerator {
  readonly seedInt: number;
  private pHeight: Perlin;
  private pDetail: Perlin;
  private pRidge: Perlin;
  private pMountMask: Perlin;
  private pTemp: Perlin;
  private pHumid: Perlin;
  private pCave: Perlin;
  private pCave2: Perlin;
  private pUnderstone: Perlin;

  constructor(seedInt: number) {
    this.seedInt = seedInt >>> 0;
    this.pHeight = new Perlin(this.seedInt + 1);
    this.pDetail = new Perlin(this.seedInt + 2);
    this.pRidge = new Perlin(this.seedInt + 3);
    this.pMountMask = new Perlin(this.seedInt + MOUNTAIN_OFFSET);
    this.pTemp = new Perlin(this.seedInt + TEMP_OFFSET);
    this.pHumid = new Perlin(this.seedInt + HUMID_OFFSET);
    this.pCave = new Perlin(this.seedInt + CAVE_OFFSET);
    this.pCave2 = new Perlin(this.seedInt + CAVE2_OFFSET);
    this.pUnderstone = new Perlin(this.seedInt + UNDERSTONE_OFFSET);
  }

  mountainMaskAt(wx: number, wz: number): number {
    return smoothstep(0.12, 0.52, this.pMountMask.fbm2(wx * 0.0008 + MOUNTAIN_OFFSET, wz * 0.0008 + MOUNTAIN_OFFSET, 2));
  }

  temperatureAt(wx: number, wz: number, height: number): number {
    return (
      this.pTemp.noise2(wx * 0.0011, wz * 0.0011) * 0.75 +
      this.pTemp.noise2(wx * 0.004 + TEMP_OFFSET, wz * 0.004 + TEMP_OFFSET) * 0.25 -
      (height - SEA_LEVEL) * 0.007
    );
  }

  humidityAt(wx: number, wz: number): number {
    return this.pHumid.noise2(wx * 0.0013 + HUMID_OFFSET, wz * 0.0013 + HUMID_OFFSET);
  }

  columnHeight(wx: number, wz: number): number {
    const continent = this.pHeight.fbm2(wx * 0.0016, wz * 0.0016, 4);
    const ridge = this.pRidge.ridged2(wx * 0.0045, wz * 0.0045, 3);
    const mask = this.mountainMaskAt(wx, wz);
    const detail = this.pDetail.fbm2(wx * 0.02, wz * 0.02, 3);
    const h = SEA_LEVEL + continent * 12 + mask * (ridge * 34 - 4) + detail * 2.5;
    return clamp(Math.round(h), 3, CHUNK_SY - 12);
  }

  biomeAtColumn(wx: number, wz: number, height: number): number {
    if (height < SEA_LEVEL - 1) return BIOME.OCEAN;
    if (height <= SEA_LEVEL + 1) return BIOME.BEACH;
    const mask = this.mountainMaskAt(wx, wz);
    if (height > SEA_LEVEL + 26 || (mask > 0.3 && height > SEA_LEVEL + 12)) return BIOME.MOUNTAINS;
    const temp = this.temperatureAt(wx, wz, height);
    const humid = this.humidityAt(wx, wz);
    if (temp > 0.18 && humid < 0.15) return BIOME.DESERT;
    if (temp < -0.25) return BIOME.SNOW_TAIGA;
    if (humid > 0.05) return BIOME.FOREST;
    return BIOME.PLAINS;
  }

  generateChunk(chunk: Chunk): void {
    const heights = new Int16Array(CHUNK_SX * CHUNK_SZ);
    const biomes = new Uint8Array(CHUNK_SX * CHUNK_SZ);

    for (let z = 0; z < CHUNK_SZ; z++) {
      for (let x = 0; x < CHUNK_SX; x++) {
        const wx = chunk.cx * CHUNK_SX + x;
        const wz = chunk.cz * CHUNK_SZ + z;
        const h = this.columnHeight(wx, wz);
        heights[z * CHUNK_SX + x] = h;
        const biome = this.biomeAtColumn(wx, wz, h);
        biomes[z * CHUNK_SX + x] = biome;
        chunk.setBiome(x, z, biome);
        this.fillColumn(chunk, x, z, wx, wz, h, biome);
      }
    }

    this.placeOreVeins(chunk, heights);
    this.decorateCaves(chunk, biomes, heights);
    this.decorateSurface(chunk, biomes, heights);
    this.placeStructures(chunk, biomes, heights);

    chunk.blocks[localIndex(0, 0, 0)] = B.BEDROCK;
    chunk.generated = true;
    chunk.recomputeAllHeights();
    chunk.modified = false;
  }

  private fillColumn(chunk: Chunk, x: number, z: number, wx: number, wz: number, h: number, biomeId: number): void {
    const biome = biomeById(biomeId);
    const underwater = h <= SEA_LEVEL;
    const deepOcean = h < SEA_LEVEL - 7;
    chunk.setBlockRaw(x, 0, z, B.BEDROCK);

    for (let y = 1; y <= h; y++) {
      let block: number;
      if (y === h) {
        block = deepOcean && biomeId === BIOME.OCEAN ? (hashFloat2(wx, wz, this.seedInt) < 0.5 ? B.GRAVEL : B.SAND) : biome.topBlock;
      } else if (y >= h - biome.fillerDepth) {
        block = biome.fillerBlock;
      } else if (y > 1 && biomeId === BIOME.DESERT && y > h - 6) {
        block = B.SANDSTONE;
      } else {
        block = this.understoneTop(wx, wz) > y ? B.UNDERSTONE : B.STONE;
      }
      if (this.shouldCarve(wx, y, wz, h, underwater)) {
        block = B.AIR;
      }
      if (block !== B.AIR) {
        chunk.setBlockRaw(x, y, z, block);
      }
    }

    if (h < SEA_LEVEL) {
      for (let y = h + 1; y <= SEA_LEVEL; y++) {
        chunk.setBlockRaw(x, y, z, B.WATER);
      }
    }

    if (biome.snow && !underwater && h + 1 < CHUNK_SY && this.shouldSnowCap(biomeId, h)) {
      const above = chunk.getBlock(x, h + 1, z);
      if (above === B.AIR && !this.shouldCarve(wx, h + 1, wz, h, underwater)) {
        chunk.setBlockRaw(x, h + 1, z, B.SNOW_BLOCK);
      }
    }
  }

  private shouldSnowCap(biomeId: number, h: number): boolean {
    return biomeId === BIOME.MOUNTAINS && h > SEA_LEVEL + 16;
  }

  private understoneTop(wx: number, wz: number): number {
    return 15 + Math.round(this.pUnderstone.fbm2(wx * 0.01, wz * 0.01, 2) * 7);
  }

  private shouldCarve(wx: number, y: number, wz: number, h: number, underwater: boolean): boolean {
    if (y <= 1) return false;
    if (underwater && y > h - 5) return false;
    const n1 = this.pCave.noise3(wx * 0.05, y * 0.075, wz * 0.05);
    if (n1 > 0.6) return true;
    if (y < 40) {
      const n2 = this.pCave2.noise3(wx * 0.085, y * 0.11, wz * 0.085);
      if (n2 > 0.72) return true;
    }
    return false;
  }

  private placeOreVeins(chunk: Chunk, heights: Int16Array): void {
    const rng = new Rng(hash2i(chunk.cx, chunk.cz, this.seedInt ^ 0x5eed));
    const veins: { ore: number; count: number; minY: number; maxY: number; size: number }[] = [
      { ore: B.COAL_ORE, count: 10, minY: 6, maxY: 58, size: 8 },
      { ore: B.COPPER_ORE, count: 6, minY: 6, maxY: 46, size: 7 },
      { ore: B.FERRITE_ORE, count: 5, minY: 4, maxY: 40, size: 6 },
      { ore: B.EMBER_ORE, count: 3, minY: 4, maxY: 30, size: 5 },
      { ore: B.AURUM_ORE, count: 2, minY: 2, maxY: 24, size: 5 },
      { ore: B.AETHERITE_ORE, count: 1, minY: 2, maxY: 15, size: 4 }
    ];

    for (const vein of veins) {
      for (let v = 0; v < vein.count; v++) {
        const x = rng.nextInt(CHUNK_SX);
        const z = rng.nextInt(CHUNK_SZ);
        const surface = heights[z * CHUNK_SX + x];
        const y = rng.intRange(Math.min(vein.minY, surface - 1), Math.min(vein.maxY, Math.max(vein.minY, surface - 2)));
        let cx = x;
        let cy = y;
        let cz = z;
        const size = rng.intRange(Math.max(2, vein.size - 3), vein.size);
        for (let i = 0; i < size; i++) {
          if (cy > 1 && cy < CHUNK_SY) {
            const id = chunk.getBlock(cx, cy, cz);
            if (id === B.STONE || id === B.UNDERSTONE) {
              chunk.setBlockRaw(cx, cy, cz, vein.ore);
            }
          }
          const dir = rng.nextInt(6);
          if (dir === 0 && cx < CHUNK_SX - 1) cx++;
          else if (dir === 1 && cx > 0) cx--;
          else if (dir === 2) cy++;
          else if (dir === 3) cy--;
          else if (dir === 4 && cz < CHUNK_SZ - 1) cz++;
          else if (dir === 5 && cz > 0) cz--;
        }
      }
    }
  }

  private decorateCaves(chunk: Chunk, biomes: Uint8Array, heights: Int16Array): void {
    for (let z = 0; z < CHUNK_SZ; z++) {
      for (let x = 0; x < CHUNK_SX; x++) {
        const surface = heights[z * CHUNK_SX + x];
        const biomeId = biomes[z * CHUNK_SX + x];
        const biome = biomeById(biomeId);
        const wx = chunk.cx * CHUNK_SX + x;
        const wz = chunk.cz * CHUNK_SZ + z;
        const maxY = Math.min(surface - 2, 52);
        for (let y = 2; y <= maxY; y++) {
          if (chunk.getBlock(x, y, z) !== B.AIR) continue;
          const below = chunk.getBlock(x, y - 1, z);
          const above = chunk.getBlock(x, y + 1, z);
          if (below === B.AIR || above !== B.AIR) continue;
          const r = hashFloat3(wx, y, wz, this.seedInt ^ 0xca11);
          const solidBelow = below === B.STONE || below === B.UNDERSTONE || below === B.DIRT || below === B.SAND;
          if (!solidBelow) continue;
          if (r < 0.012) {
            chunk.setBlockRaw(x, y, z, B.GLOWSHROOM);
          } else if (r < 0.016 && y < 30 && below === B.UNDERSTONE) {
            chunk.setBlockRaw(x, y, z, B.GLOWCRYSTAL);
          } else if (r < 0.02 && y < 22 && below === B.UNDERSTONE) {
            chunk.setBlockRaw(x, y, z, B.FUME_VENT);
          } else if (r < 0.05 && biome.snow && above === B.AIR) {
            chunk.setBlockRaw(x, y, z, B.ICICLE);
          }
        }
      }
    }
  }

  private decorateSurface(chunk: Chunk, biomes: Uint8Array, heights: Int16Array): void {
    for (let z = 0; z < CHUNK_SZ; z++) {
      for (let x = 0; x < CHUNK_SX; x++) {
        const h = heights[z * CHUNK_SX + x];
        const biome = biomeById(biomes[z * CHUNK_SX + x]);
        const wx = chunk.cx * CHUNK_SX + x;
        const wz = chunk.cz * CHUNK_SZ + z;
        const top = chunk.getBlock(x, h, z);
        const above = chunk.getBlock(x, h + 1, z);
        if (above !== B.AIR || top === B.WATER || top === B.AIR) continue;
        const r = hashFloat3(wx, 9871, wz, this.seedInt);

        if (top === B.GRASS || top === B.SNOW_GRASS) {
          if (r < biome.grassDensity) {
            chunk.setBlockRaw(x, h + 1, z, B.TALL_GRASS);
          } else if (r < biome.grassDensity + biome.flowerDensity) {
            const pick = hash3i(wx, 555, wz, this.seedInt) % 3;
            chunk.setBlockRaw(x, h + 1, z, pick === 0 ? B.FLOWER_RED : pick === 1 ? B.FLOWER_YELLOW : B.FLOWER_BLUE);
          } else if (r < biome.grassDensity + biome.flowerDensity + 0.004) {
            chunk.setBlockRaw(x, h + 1, z, B.DEWBERRY_FULL);
          }
        } else if (top === B.SAND && biome.id === BIOME.DESERT) {
          if (r < biome.cactusDensity) {
            const height = 1 + (hash3i(wx, 999, wz, this.seedInt) % 3);
            for (let i = 1; i <= height && h + i < CHUNK_SY; i++) {
              chunk.setBlockRaw(x, h + i, z, B.CACTUS);
            }
          } else if (r < biome.cactusDensity + 0.003) {
            chunk.setBlockRaw(x, h + 1, z, B.DEAD_BUSH);
          }
        }
      }
    }
    this.placeTrees(chunk, biomes, heights);
  }

  private placeTrees(chunk: Chunk, biomes: Uint8Array, heights: Int16Array): void {
    const rng = new Rng(hash2i(chunk.cx, chunk.cz, this.seedInt ^ 0x7ee5));
    const centerBiome = biomeById(biomes[(CHUNK_SZ / 2) * CHUNK_SX + CHUNK_SX / 2]);
    let attempts = centerBiome.treeAttempts;
    if (attempts === 0) return;

    for (let i = 0; i < attempts; i++) {
      const x = rng.intRange(3, CHUNK_SX - 4);
      const z = rng.intRange(3, CHUNK_SZ - 4);
      const h = heights[z * CHUNK_SX + x];
      const biome = biomeById(biomes[z * CHUNK_SX + x]);
      if (biome.tree === "none") continue;
      const top = chunk.getBlock(x, h, z);
      const above = chunk.getBlock(x, h + 1, z);
      const validTop = top === biome.topBlock || (biome.tree === "pine" && (top === B.STONE || top === B.SNOW_GRASS || top === B.PERMAFROST));
      if (!validTop || above !== B.AIR) continue;
      if (biome.treeAttempts > 4 && !rng.chance(0.85)) continue;
      if (biome.tree === "sable") this.placeSableTree(chunk, x, h + 1, z, rng);
      else if (biome.tree === "pine") this.placePineTree(chunk, x, h + 1, z, rng);
      else if (biome.tree === "dune") this.placeDuneTree(chunk, x, h + 1, z, rng);
    }
  }

  private setIfReplaceable(chunk: Chunk, x: number, y: number, z: number, id: number): void {
    if (x < 0 || x >= CHUNK_SX || z < 0 || z >= CHUNK_SZ || y < 0 || y >= CHUNK_SY) return;
    const cur = chunk.getBlock(x, y, z);
    if (cur === B.AIR || cur === B.LEAVES || cur === B.LEAVES_PINE || cur === B.LEAVES_DUNE || cur === B.TALL_GRASS) {
      chunk.setBlockRaw(x, y, z, id);
    }
  }

  private placeSableTree(chunk: Chunk, x: number, base: number, z: number, rng: Rng): void {
    const trunk = rng.intRange(4, 5);
    for (let i = 0; i < trunk; i++) this.setIfReplaceable(chunk, x, base + i, z, B.LOG);
    const top = base + trunk;
    const layers: { dy: number; r: number }[] = [
      { dy: -1, r: 2 },
      { dy: 0, r: 2 },
      { dy: 1, r: 1 },
      { dy: 2, r: 1 }
    ];
    for (const layer of layers) {
      for (let dx = -layer.r; dx <= layer.r; dx++) {
        for (let dz = -layer.r; dz <= layer.r; dz++) {
          if (dx === 0 && dz === 0 && layer.dy <= 1) continue;
          if (Math.abs(dx) === layer.r && Math.abs(dz) === layer.r && layer.r > 1) continue;
          this.setIfReplaceable(chunk, x + dx, top + layer.dy, z + dz, B.LEAVES);
        }
      }
    }
    this.setIfReplaceable(chunk, x, top + 2, z, B.LEAVES);
  }

  private placePineTree(chunk: Chunk, x: number, base: number, z: number, rng: Rng): void {
    const trunk = rng.intRange(6, 9);
    for (let i = 0; i < trunk; i++) this.setIfReplaceable(chunk, x, base + i, z, B.LOG_PINE);
    const top = base + trunk - 1;
    let r = 0;
    for (let y = top + 1; y >= base + 1; y--) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (dx === 0 && dz === 0 && y <= top) continue;
          if (Math.abs(dx) + Math.abs(dz) > r + 1) continue;
          this.setIfReplaceable(chunk, x + dx, y, z + dz, B.LEAVES_PINE);
        }
      }
      r = (r + 1) % 3;
    }
    this.setIfReplaceable(chunk, x, top + 1, z, B.LEAVES_PINE);
  }

  private placeDuneTree(chunk: Chunk, x: number, base: number, z: number, rng: Rng): void {
    const trunk = rng.intRange(3, 4);
    for (let i = 0; i < trunk; i++) this.setIfReplaceable(chunk, x, base + i, z, B.LOG_DUNE);
    const top = base + trunk;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
        this.setIfReplaceable(chunk, x + dx, top, z + dz, B.LEAVES_DUNE);
      }
    }
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        this.setIfReplaceable(chunk, x + dx, top + 1, z + dz, B.LEAVES_DUNE);
      }
    }
    this.setIfReplaceable(chunk, x, top + 2, z, B.LEAVES_DUNE);
  }

  private placeStructures(chunk: Chunk, biomes: Uint8Array, heights: Int16Array): void {
    const rng = new Rng(hash2i(chunk.cx, chunk.cz, this.seedInt ^ 0x571c));
    const centerBiome = biomeById(biomes[(CHUNK_SZ / 2) * CHUNK_SX + CHUNK_SX / 2]);

    if (rng.chance(centerBiome.boulderChance)) {
      const x = rng.intRange(2, CHUNK_SX - 3);
      const z = rng.intRange(2, CHUNK_SZ - 3);
      const h = heights[z * CHUNK_SX + x];
      const count = rng.intRange(3, 7);
      for (let i = 0; i < count; i++) {
        const bx = x + rng.intRange(-2, 2);
        const bz = z + rng.intRange(-2, 2);
        const by = h + rng.intRange(0, 1);
        if (bx < 0 || bx >= CHUNK_SX || bz < 0 || bz >= CHUNK_SZ) continue;
        if (chunk.getBlock(bx, by, bz) !== B.AIR) continue;
        chunk.setBlockRaw(bx, by, bz, rng.chance(0.6) ? B.MOSSY_STONE : B.STONE);
      }
    }

    if (rng.chance(centerBiome.campChance)) {
      const x = rng.intRange(4, CHUNK_SX - 5);
      const z = rng.intRange(4, CHUNK_SZ - 5);
      const h = heights[z * CHUNK_SX + x];
      let flat = true;
      let maxH = h;
      let minH = h;
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          const nh = heights[(z + dz) * CHUNK_SX + (x + dx)];
          if (nh > maxH) maxH = nh;
          if (nh < minH) minH = nh;
        }
      }
      if (maxH - minH > 2) flat = false;
      if (flat) {
        for (let dx = -2; dx <= 2 && flat; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            const nh = heights[(z + dz) * CHUNK_SX + (x + dx)];
            if (chunk.getBlock(x + dx, nh, z + dz) === B.WATER) {
              flat = false;
              break;
            }
            const top = Math.min(SEA_LEVEL + 2, CHUNK_SY - 1);
            for (let wy = nh + 1; wy <= top; wy++) {
              if (chunk.getBlock(x + dx, wy, z + dz) === B.WATER) {
                flat = false;
                break;
              }
            }
            if (!flat) break;
          }
        }
      }
      if (flat) {
        const groundY = maxH;
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            const cur = chunk.getBlock(x + dx, groundY, z + dz);
            if (cur !== B.WATER && cur !== B.BEDROCK) {
              chunk.setBlockRaw(x + dx, groundY, z + dz, B.PLANKS);
            }
            for (let dy = 1; dy <= 3; dy++) {
              const above = chunk.getBlock(x + dx, groundY + dy, z + dz);
              if (above !== B.AIR && above !== B.PLANKS && above !== B.WATER) {
                chunk.setBlockRaw(x + dx, groundY + dy, z + dz, B.AIR);
              }
            }
          }
        }
        chunk.setBlockRaw(x, groundY + 1, z, B.CAMPFIRE);
        chunk.setBlockRaw(x + 1, groundY + 1, z, B.LOG);
        chunk.setBlockRaw(x - 1, groundY + 1, z, B.LOG);
        chunk.setBlockRaw(x + 2, groundY + 1, z + 2, B.CHEST);
      }
    }
  }
}
