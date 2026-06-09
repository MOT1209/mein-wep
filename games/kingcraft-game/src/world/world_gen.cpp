#include "world/world_gen.h"
#include "world/block_registry.h"
#include <cmath>
#include <random>
#include <cstring>
#include <algorithm>

// ============================================================
// SIMPLE NOISE FUNCTIONS
// ============================================================

static float lerp(float a, float b, float t) { return a + (b - a) * t; }
static float smoothstep(float t) { return t * t * (3 - 2 * t); }

static float hash(float x, float z) {
    float n = std::sin(x * 127.1f + z * 311.7f) * 43758.5453f;
    return n - std::floor(n);
}

static float hash(float x, float y, float z) {
    float n = std::sin(x * 127.1f + y * 311.7f + z * 74.7f) * 43758.5453f;
    return n - std::floor(n);
}

static float gradientNoise2D(float x, float z) {
    int ix = (int)std::floor(x);
    int iz = (int)std::floor(z);
    float fx = x - ix;
    float fz = z - iz;
    fx = smoothstep(fx);
    fz = smoothstep(fz);
    
    float v00 = hash(ix, iz);
    float v10 = hash(ix + 1, iz);
    float v01 = hash(ix, iz + 1);
    float v11 = hash(ix + 1, iz + 1);
    
    return lerp(lerp(v00, v10, fx), lerp(v01, v11, fx), fz);
}

static float gradientNoise3D(float x, float y, float z) {
    int ix = (int)std::floor(x);
    int iy = (int)std::floor(y);
    int iz = (int)std::floor(z);
    float fx = x - ix;
    float fy = y - iy;
    float fz = z - iz;
    fx = smoothstep(fx);
    fy = smoothstep(fy);
    fz = smoothstep(fz);
    
    float v000 = hash(ix, iy, iz);
    float v100 = hash(ix+1, iy, iz);
    float v010 = hash(ix, iy+1, iz);
    float v110 = hash(ix+1, iy+1, iz);
    float v001 = hash(ix, iy, iz+1);
    float v101 = hash(ix+1, iy, iz+1);
    float v011 = hash(ix, iy+1, iz+1);
    float v111 = hash(ix+1, iy+1, iz+1);
    
    return lerp(
        lerp(lerp(v000, v100, fx), lerp(v010, v110, fx), fy),
        lerp(lerp(v001, v101, fx), lerp(v011, v111, fx), fy),
        fz
    );
}

// ============================================================
// NOISE WRAPPERS
// ============================================================
static float applySeed2D(float x, float z, uint64_t seed) {
    x += (seed & 0xFFFF) * 1000.0f;
    z += ((seed >> 16) & 0xFFFF) * 1000.0f;
    return x + z * 0.001f; // dummy, real offset applied below
}

// نطبق الـ seed بطريقة مختلفة لكل نوع noise
static void seedOffset2D(float& x, float& z, uint64_t seed, float mult = 1.0f) {
    x += (seed & 0xFFFF) * 1000.0f * mult;
    z += ((seed >> 16) & 0xFFFF) * 1000.0f * mult;
}

static void seedOffset3D(float& x, float& y, float& z, uint64_t seed, float mult = 1.0f) {
    x += (seed & 0xFFFF) * 1000.0f * mult;
    y += ((seed >> 8) & 0xFFFF) * 1000.0f * mult;
    z += ((seed >> 16) & 0xFFFF) * 1000.0f * mult;
}

// ============================================================
// WORLD GENERATOR
// ============================================================
WorldGenerator::WorldGenerator(uint64_t seed) : seed(seed) {}

float WorldGenerator::noise2D(float x, float z, float freq, int octaves) const {
    float value = 0;
    float amplitude = 1;
    float max_value = 0;
    float lacunarity = 2.0f;
    float gain = 0.5f;
    
    seedOffset2D(x, z, seed);
    
    for (int i = 0; i < octaves; i++) {
        float nx = x * freq;
        float nz = z * freq;
        value += gradientNoise2D(nx, nz) * amplitude;
        max_value += amplitude;
        amplitude *= gain;
        freq *= lacunarity;
    }
    
    return value / max_value;
}

float WorldGenerator::noise3D(float x, float y, float z, float freq, int octaves) const {
    float value = 0;
    float amplitude = 1;
    float max_value = 0;
    float lacunarity = 2.0f;
    float gain = 0.5f;
    
    seedOffset3D(x, y, z, seed);
    
    for (int i = 0; i < octaves; i++) {
        float nx = x * freq;
        float ny = y * freq;
        float nz = z * freq;
        value += gradientNoise3D(nx, ny, nz) * amplitude;
        max_value += amplitude;
        amplitude *= gain;
        freq *= lacunarity;
    }
    
    return value / max_value;
}

// ============================================================
// BIOME SYSTEM
// ============================================================
// نحدد البيئة بناءً على:
// - درجة الحرارة (Temperature): 0 (بارد) → 1 (حار)
// - الرطوبة (Humidity): 0 (جاف) → 1 (رطب)
// - الارتفاع (Elevation): منخفض → مرتفع
//
// خريطة البيئات:
//   بارد/جاف      → SNOWY_TUNDRA
//   بارد/رطب      → TAIGA
//   معتدل/جاف     → PLAINS
//   معتدل/رطب     → FOREST
//   حار/جاف       → DESERT / SAVANNA
//   حار/رطب       → JUNGLE / SWAMP
//   مرتفع         → MOUNTAINS
//   قرب الماء     → BEACH / RIVER / OCEAN

float WorldGenerator::getTemperature(int wx, int wz) {
    // Temperature noise بتردد منخفض للتغيرات الكبيرة
    float temp = noise2D(wx, wz, 0.0004f, 4);
    // Temperature decreases with height (6°C per 1000 blocks)
    // For our 128-block world, this is minor but noticeable
    return std::max(0.0f, std::min(1.0f, temp));
}

float WorldGenerator::getHumidity(int wx, int wz) {
    return std::max(0.0f, std::min(1.0f, noise2D(wx, wz, 0.0005f, 4)));
}

BiomeType WorldGenerator::getBiome(int wx, int wz) {
    float temp = getTemperature(wx, wz);
    float humid = getHumidity(wx, wz);
    
    // Continentalness for ocean/land
    float continent = noise2D(wx, wz, 0.001f, 4);
    
    // Ocean
    if (continent < 0.38f) {
        return BiomeType::OCEAN;
    }
    
    // River detection
    float river = noise2D(wx + 5000, wz + 5000, 0.002f, 2);
    if (river > 0.62f && continent < 0.48f) {
        return BiomeType::RIVER;
    }
    
    // Near water → beach
    if (continent < 0.42f) {
        return BiomeType::BEACH;
    }
    
    // Temperature and humidity based biomes
    if (temp < 0.25f) {
        // Cold
        if (humid > 0.45f) {
            return BiomeType::TAIGA;         // بارد ورطب: غابة ثلجية
        } else {
            return BiomeType::SNOWY_TUNDRA;  // بارد وجاف: تندرا
        }
    } else if (temp < 0.45f) {
        // Cool
        if (humid > 0.5f) {
            return BiomeType::FOREST;
        } else {
            return BiomeType::PLAINS;
        }
    } else if (temp < 0.65f) {
        // Temperate
        if (humid > 0.55f) {
            // Swamp detection (flat areas with high humidity)
            float flatness = noise2D(wx, wz, 0.001f, 3);
            if (humid > 0.75f && flatness < 0.45f) {
                return BiomeType::SWAMP;
            }
            return BiomeType::FOREST;
        } else if (humid < 0.3f) {
            return BiomeType::SAVANNA;
        } else {
            return BiomeType::PLAINS;
        }
    } else {
        // Hot
        if (humid > 0.6f) {
            return BiomeType::JUNGLE;
        } else if (humid > 0.3f) {
            return BiomeType::SAVANNA;
        } else {
            return BiomeType::DESERT;
        }
    }
}

BiomeType WorldGenerator::getBiomeWithHeight(int wx, int wz, int height) {
    BiomeType biome = getBiome(wx, wz);
    
    // Mountain detection (high elevation overrides other biomes)
    if (height > 90) {
        return BiomeType::MOUNTAINS;
    }
    
    return biome;
}

// ============================================================
// HEIGHT MAP
// ============================================================
int WorldGenerator::getHeightAt(int wx, int wz) {
    const int SEA_LEVEL = 63;
    
    // Continentalness
    float continent = noise2D(wx, wz, 0.001f, 4);
    
    // Erosion (makes mountains)
    float erosion = noise2D(wx + 100, wz + 200, 0.002f, 3);
    
    // Detail noise
    float detail = noise2D(wx, wz, 0.01f, 3);
    
    // Biome-specific base height
    BiomeType biome = getBiome(wx, wz);
    
    float base = SEA_LEVEL;
    
    switch (biome) {
        case BiomeType::OCEAN:
            base = SEA_LEVEL - 15.0f - (noise2D(wx, wz, 0.003f, 2)) * 15.0f;
            return (int)std::round(base);
            
        case BiomeType::RIVER:
            base = SEA_LEVEL - 4.0f - noise2D(wx, wz, 0.005f, 2) * 3.0f;
            return (int)std::round(base);
            
        case BiomeType::BEACH:
            base = SEA_LEVEL + 1.0f + noise2D(wx, wz, 0.01f, 2) * 2.0f;
            return (int)std::round(base);
            
        case BiomeType::DESERT:
            base = SEA_LEVEL + 2.0f + (continent - 0.4f) * 15.0f;
            base += (detail - 0.5f) * 2.0f;
            break;
            
        case BiomeType::PLAINS:
            base = SEA_LEVEL + (continent - 0.4f) * 15.0f;
            base += (detail - 0.5f) * 1.5f;
            break;
            
        case BiomeType::FOREST:
            base = SEA_LEVEL + 2.0f + (continent - 0.4f) * 20.0f;
            base += (detail - 0.5f) * 3.0f;
            break;
            
        case BiomeType::TAIGA:
            base = SEA_LEVEL + 2.0f + (continent - 0.4f) * 15.0f;
            base += (detail - 0.5f) * 2.0f;
            break;
            
        case BiomeType::SNOWY_TUNDRA:
            base = SEA_LEVEL + 1.0f + (continent - 0.4f) * 10.0f;
            base += (detail - 0.5f) * 1.0f;
            break;
            
        case BiomeType::JUNGLE:
            base = SEA_LEVEL + 3.0f + (continent - 0.4f) * 25.0f;
            base += (detail - 0.5f) * 4.0f;
            break;
            
        case BiomeType::SWAMP:
            base = SEA_LEVEL + (detail - 0.5f) * 3.0f;
            break;
            
        case BiomeType::SAVANNA:
            base = SEA_LEVEL + 3.0f + (continent - 0.4f) * 15.0f;
            base += (detail - 0.5f) * 1.0f;
            break;
            
        default:
            base = SEA_LEVEL + (continent - 0.4f) * 20.0f;
            break;
    }
    
    // Mountains: steep terrain
    if (erosion > 0.55f) {
        base += (erosion - 0.55f) * 120.0f;
    }
    
    // Valleys
    if (erosion < 0.42f && biome != BiomeType::RIVER && biome != BiomeType::OCEAN) {
        base -= (0.42f - erosion) * 15.0f;
    }
    
    return (int)std::round(base);
}

// ============================================================
// CHUNK GENERATION
// ============================================================
void WorldGenerator::generate(Chunk& chunk) {
    int cx = chunk.getCX();
    int cz = chunk.getCZ();
    
    // Mark generated immediately
    chunk.setGenerated(true);
    
    // توليد كل بلوك في الـ Chunk
    for (int x = 0; x < CHUNK_SIZE_X; x++) {
        for (int z = 0; z < CHUNK_SIZE_Z; z++) {
            int wx = cx * CHUNK_SIZE_X + x;
            int wz = cz * CHUNK_SIZE_Z + z;
            
            int height = getHeightAt(wx, wz);
            chunk.setHeight(x, z, height);
            
            BiomeType biome = getBiomeWithHeight(wx, wz, height);
            
            for (int y = 0; y < CHUNK_SIZE_Y; y++) {
                BlockID block = BLOCK_AIR;
                BlockState state = 0;
                
                if (y == 0) {
                    // Bedrock at bottom
                    block = BLOCK_BEDROCK;
                } else if (y < height - 4) {
                    // Stone
                    block = BLOCK_STONE;
                } else if (y < height) {
                    // Dirt/stone mix near surface
                    if (y > height - 4) {
                        // Biome-specific sub-surface
                        if (biome == BiomeType::DESERT && y > height - 2) {
                            block = BLOCK_SANDSTONE;
                        } else if (biome == BiomeType::SNOWY_TUNDRA && y > height - 3) {
                            block = BLOCK_DIRT;  // frozen dirt
                        } else if (biome == BiomeType::TAIGA && y > height - 3) {
                            block = BLOCK_DIRT;
                        } else if (y > height - 3) {
                            block = BLOCK_DIRT;
                        } else {
                            block = BLOCK_STONE;
                        }
                    } else {
                        block = BLOCK_STONE;
                    }
                } else if (y == height) {
                    // Surface block — حسب البيئة
                    switch (biome) {
                        case BiomeType::DESERT:
                            block = BLOCK_SAND;
                            break;
                        case BiomeType::BEACH:
                            block = BLOCK_SAND;
                            break;
                        case BiomeType::SNOWY_TUNDRA:
                            block = BLOCK_SNOW;
                            break;
                        case BiomeType::TAIGA:
                            block = BLOCK_GRASS;
                            break;
                        case BiomeType::JUNGLE:
                            block = BLOCK_GRASS;
                            break;
                        case BiomeType::SWAMP:
                            block = BLOCK_GRASS;
                            break;
                        case BiomeType::SAVANNA:
                            block = BLOCK_GRASS;
                            break;
                        default:
                            block = BLOCK_GRASS;
                            break;
                    }
                } else if (y <= 63 && y > height) {
                    // Water column
                    if (biome == BiomeType::SNOWY_TUNDRA && y == height + 1) {
                        block = BLOCK_ICE;  // frozen surface water
                    } else if (biome == BiomeType::TAIGA && y == height + 1 && height > 60) {
                        block = BLOCK_ICE;
                    } else {
                        block = BLOCK_WATER;
                    }
                }
                
                if (block != BLOCK_AIR) {
                    chunk.setBlock(x, y, z, block, state);
                }
            }
        }
    }
    
    // تزيين الـ Chunk (نباتات، أشجار، هياكل)
    decorateChunk(chunk);
    generateCaves(chunk);
    generateOres(chunk);
}

// ============================================================
// DECORATION: TREES, PLANTS, STRUCTURES
// ============================================================
void WorldGenerator::decorateChunk(Chunk& chunk) {
    generateTrees(chunk);
    generateFlowers(chunk);
    generateCacti(chunk);
    generateDeadBushes(chunk);
    generateStructures(chunk);
}

void WorldGenerator::generateTrees(Chunk& chunk) {
    int cx = chunk.getCX();
    int cz = chunk.getCZ();
    std::mt19937 rng(seed + cx * 10000 + cz);
    
    // Pre-compute biome for a central position in the chunk
    int mid_wx = cx * CHUNK_SIZE_X + CHUNK_SIZE_X / 2;
    int mid_wz = cz * CHUNK_SIZE_Z + CHUNK_SIZE_Z / 2;
    BiomeType biome = getBiomeWithHeight(mid_wx, mid_wz, getHeightAt(mid_wx, mid_wz));
    
    // Tree density per biome
    int tree_density = 0;
    int min_spacing = 6;
    bool spruce = false;
    
    switch (biome) {
        case BiomeType::FOREST:
            tree_density = 12;   // 12% per 6x6 cell
            min_spacing = 5;
            break;
        case BiomeType::TAIGA:
            tree_density = 10;
            min_spacing = 5;
            spruce = true;
            break;
        case BiomeType::JUNGLE:
            tree_density = 15;
            min_spacing = 5;
            break;
        case BiomeType::SWAMP:
            tree_density = 8;
            min_spacing = 6;
            break;
        case BiomeType::SAVANNA:
            tree_density = 3;
            min_spacing = 8;
            break;
        case BiomeType::PLAINS:
            tree_density = 4;
            min_spacing = 7;
            break;
        default:
            return;  // No trees in desert, snowy, ocean, beach
    }
    
    // Generate trees on a grid
    int cell_size = min_spacing;
    for (int x = cell_size / 2; x < CHUNK_SIZE_X - cell_size / 2; x += cell_size) {
        for (int z = cell_size / 2; z < CHUNK_SIZE_Z - cell_size / 2; z += cell_size) {
            if ((rng() % 100) >= tree_density) continue;
            
            int wx = cx * CHUNK_SIZE_X + x;
            int wz = cz * CHUNK_SIZE_Z + z;
            int height = chunk.getHeight(x, z);
            
            // Check surface
            BlockID surface = chunk.getBlock(x, height, z);
            if (surface != BLOCK_GRASS || height <= 63 || height >= CHUNK_SIZE_Y - 10) continue;
            
            if (spruce) {
                // === SPRUCE TREE (tall, cone-shaped) ===
                int trunk_height = 5 + (rng() % 4);  // 5-8
                for (int ty = 1; ty <= trunk_height; ty++) {
                    if (height + ty < CHUNK_SIZE_Y)
                        chunk.setBlock(x, height + ty, z, BLOCK_SPRUCE_WOOD, 0);
                }
                
                // Leaves: multiple layers getting smaller toward top
                for (int ly = 0; ly < trunk_height - 1; ly++) {
                    int radius = ly < trunk_height / 2 ? 2 : (ly == trunk_height - 2 ? 1 : 0);
                    if (radius == 0) {
                        // Top: single block
                        int top_y = height + trunk_height + 1;
                        if (top_y < CHUNK_SIZE_Y && chunk.getBlock(x, top_y, z) == BLOCK_AIR)
                            chunk.setBlock(x, top_y, z, BLOCK_SPRUCE_LEAVES, 0);
                        continue;
                    }
                    int ly_off = height + trunk_height - ly;
                    for (int lx = -radius; lx <= radius; lx++) {
                        for (int lz = -radius; lz <= radius; lz++) {
                            if (std::abs(lx) == radius && std::abs(lz) == radius && (rng() % 2)) continue;
                            int bx = x + lx, bz = z + lz, by = ly_off;
                            if (bx >= 0 && bx < CHUNK_SIZE_X && bz >= 0 && bz < CHUNK_SIZE_Z && by < CHUNK_SIZE_Y) {
                                if (chunk.getBlock(bx, by, bz) == BLOCK_AIR)
                                    chunk.setBlock(bx, by, bz, BLOCK_SPRUCE_LEAVES, 0);
                            }
                        }
                    }
                }
            } else {
                // === OAK TREE (round canopy) ===
                int trunk_height = 4 + (rng() % 3);  // 4-6
                for (int ty = 1; ty <= trunk_height; ty++) {
                    if (height + ty < CHUNK_SIZE_Y)
                        chunk.setBlock(x, height + ty, z, BLOCK_WOOD, 0);
                }
                
                // Leaves (diamond shape)
                int leaf_base = height + trunk_height - 2;
                for (int ly = 0; ly < 3; ly++) {
                    int radius = 2 - ly;
                    for (int lx = -radius; lx <= radius; lx++) {
                        for (int lz = -radius; lz <= radius; lz++) {
                            if (lx*lx + lz*lz <= radius*radius + 1) {
                                int bx = x + lx, bz = z + lz, by = leaf_base + ly;
                                if (bx >= 0 && bx < CHUNK_SIZE_X && bz >= 0 && bz < CHUNK_SIZE_Z && by < CHUNK_SIZE_Y) {
                                    if (chunk.getBlock(bx, by, bz) == BLOCK_AIR)
                                        chunk.setBlock(bx, by, bz, BLOCK_LEAVES, 0);
                                }
                            }
                        }
                    }
                }
                // Top leaf
                int top_y = leaf_base + 3;
                if (top_y < CHUNK_SIZE_Y && chunk.getBlock(x, top_y, z) == BLOCK_AIR)
                    chunk.setBlock(x, top_y, z, BLOCK_LEAVES, 0);
            }
        }
    }
}

void WorldGenerator::generateFlowers(Chunk& chunk) {
    int cx = chunk.getCX();
    int cz = chunk.getCZ();
    std::mt19937 rng(seed + cx * 5000 + cz * 7000);
    
    int mid_wx = cx * CHUNK_SIZE_X + CHUNK_SIZE_X / 2;
    int mid_wz = cz * CHUNK_SIZE_Z + CHUNK_SIZE_Z / 2;
    BiomeType biome = getBiomeWithHeight(mid_wx, mid_wz, getHeightAt(mid_wx, mid_wz));
    
    // Flowers only in certain biomes
    int flower_chance = 0;
    int grass_chance = 0;
    
    switch (biome) {
        case BiomeType::PLAINS:
            flower_chance = 5;   // 5% per block
            grass_chance = 15;
            break;
        case BiomeType::FOREST:
            flower_chance = 3;
            grass_chance = 8;
            break;
        case BiomeType::JUNGLE:
            flower_chance = 2;
            grass_chance = 20;
            break;
        case BiomeType::SWAMP:
            flower_chance = 1;
            grass_chance = 5;
            break;
        default:
            return;  // No flowers in other biomes
    }
    
    for (int x = 0; x < CHUNK_SIZE_X; x++) {
        for (int z = 0; z < CHUNK_SIZE_Z; z++) {
            int height = chunk.getHeight(x, z);
            if (height <= 0 || height >= CHUNK_SIZE_Y) continue;
            
            BlockID surface = chunk.getBlock(x, height, z);
            if (surface != BLOCK_GRASS) continue;
            
            // Check if there's space above
            BlockID above = chunk.getBlock(x, height + 1, z);
            if (above != BLOCK_AIR) continue;
            
            int chance = rng() % 100;
            if (chance < flower_chance) {
                // Place a flower
                int flower_type = rng() % 2;  // 0 = poppy, 1 = dandelion
                uint16_t state = BlockStateHelper::setVariant(0, flower_type);
                chunk.setBlock(x, height + 1, z, BLOCK_FLOWER, state);
            } else if (chance < flower_chance + grass_chance) {
                // Place tall grass
                uint16_t state = BlockStateHelper::setVariant(0, rng() % 2);
                chunk.setBlock(x, height + 1, z, BLOCK_TALL_GRASS, state);
            }
        }
    }
}

void WorldGenerator::generateCacti(Chunk& chunk) {
    int cx = chunk.getCX();
    int cz = chunk.getCZ();
    std::mt19937 rng(seed + cx * 3000 + cz * 5000);
    
    int mid_wx = cx * CHUNK_SIZE_X + CHUNK_SIZE_X / 2;
    int mid_wz = cz * CHUNK_SIZE_Z + CHUNK_SIZE_Z / 2;
    BiomeType biome = getBiomeWithHeight(mid_wx, mid_wz, getHeightAt(mid_wx, mid_wz));
    
    if (biome != BiomeType::DESERT) return;
    
    // Cacti in desert (3% per block)
    for (int x = 2; x < CHUNK_SIZE_X - 2; x++) {
        for (int z = 2; z < CHUNK_SIZE_Z - 2; z++) {
            int height = chunk.getHeight(x, z);
            if (height <= 0 || height >= CHUNK_SIZE_Y) continue;
            if (chunk.getBlock(x, height, z) != BLOCK_SAND) continue;
            if (chunk.getBlock(x, height + 1, z) != BLOCK_AIR) continue;
            if ((rng() % 100) >= 3) continue;
            
            // Cactus grows 1-3 blocks tall
            int cactus_height = 1 + (rng() % 3);
            for (int cy = 1; cy <= cactus_height; cy++) {
                if (height + cy < CHUNK_SIZE_Y)
                    chunk.setBlock(x, height + cy, z, BLOCK_CACTUS, 0);
            }
        }
    }
}

void WorldGenerator::generateDeadBushes(Chunk& chunk) {
    int cx = chunk.getCX();
    int cz = chunk.getCZ();
    std::mt19937 rng(seed + cx * 9000 + cz * 11000);
    
    int mid_wx = cx * CHUNK_SIZE_X + CHUNK_SIZE_X / 2;
    int mid_wz = cz * CHUNK_SIZE_Z + CHUNK_SIZE_Z / 2;
    BiomeType biome = getBiomeWithHeight(mid_wx, mid_wz, getHeightAt(mid_wx, mid_wz));
    
    if (biome != BiomeType::DESERT) return;
    
    // Dead bushes in desert (4% per block)
    for (int x = 0; x < CHUNK_SIZE_X; x++) {
        for (int z = 0; z < CHUNK_SIZE_Z; z++) {
            int height = chunk.getHeight(x, z);
            if (height <= 0 || height >= CHUNK_SIZE_Y) continue;
            if (chunk.getBlock(x, height, z) != BLOCK_SAND) continue;
            if (chunk.getBlock(x, height + 1, z) != BLOCK_AIR) continue;
            if ((rng() % 100) >= 4) continue;
            
            chunk.setBlock(x, height + 1, z, BLOCK_DEAD_BUSH, 0);
        }
    }
}

// ============================================================
// CAVES
// ============================================================
void WorldGenerator::generateCaves(Chunk& chunk) {
    int cx = chunk.getCX();
    int cz = chunk.getCZ();
    
    for (int x = 0; x < CHUNK_SIZE_X; x++) {
        for (int z = 0; z < CHUNK_SIZE_Z; z++) {
            for (int y = 5; y < 50; y++) {
                int wx = cx * CHUNK_SIZE_X + x;
                int wz = cz * CHUNK_SIZE_Z + z;
                
                float cave_noise = noise3D(wx, y, wz, 0.008f, 2);
                
                if (cave_noise < 0.15f) {
                    BlockID current = chunk.getBlock(x, y, z);
                    if (current == BLOCK_STONE || current == BLOCK_DIRT) {
                        chunk.setBlock(x, y, z, BLOCK_AIR, 0);
                    }
                }
            }
        }
    }
}

// ============================================================
// ORES
// ============================================================
float WorldGenerator::cellularNoise(float x, float z, float freq) const {
    (void)x; (void)z; (void)freq;
    return 0.0f;
}

void WorldGenerator::generateOres(Chunk& chunk) {
    int cx = chunk.getCX();
    int cz = chunk.getCZ();
    std::mt19937 rng(seed + cx * 3333 + cz * 4444);
    
    // Coal ore (common, all heights)
    for (int i = 0; i < 10; i++) {
        int ox = rng() % CHUNK_SIZE_X;
        int oz = rng() % CHUNK_SIZE_Z;
        int oy = (rng() % 100) + 10;
        
        if (chunk.getBlock(ox, oy, oz) == BLOCK_STONE) {
            chunk.setBlock(ox, oy, oz, BLOCK_COBBLESTONE, 0);  // placeholder for coal ore
        }
    }
    
    // Iron ore (mid depths)
    for (int i = 0; i < 5; i++) {
        int ox = rng() % CHUNK_SIZE_X;
        int oz = rng() % CHUNK_SIZE_Z;
        int oy = (rng() % 40) + 5;
        
        if (chunk.getBlock(ox, oy, oz) == BLOCK_STONE) {
            chunk.setBlock(ox, oy, oz, BLOCK_COBBLESTONE, 0);  // placeholder for iron ore
        }
    }
    
    // Gold ore (deep, rare)
    for (int i = 0; i < 2; i++) {
        int ox = rng() % CHUNK_SIZE_X;
        int oz = rng() % CHUNK_SIZE_Z;
        int oy = (rng() % 20) + 5;
        
        if (chunk.getBlock(ox, oy, oz) == BLOCK_STONE) {
            chunk.setBlock(ox, oy, oz, BLOCK_COBBLESTONE, 0);  // placeholder for gold ore
        }
    }
}

// ============================================================
// STRUCTURES
// ============================================================
void WorldGenerator::generateStructures(Chunk& chunk) {
    int cx = chunk.getCX();
    int cz = chunk.getCZ();
    std::mt19937 rng(seed + cx * 7777 + cz * 8888);
    
    int mid_wx = cx * CHUNK_SIZE_X + CHUNK_SIZE_X / 2;
    int mid_wz = cz * CHUNK_SIZE_Z + CHUNK_SIZE_Z / 2;
    int mid_height = chunk.getHeight(CHUNK_SIZE_X / 2, CHUNK_SIZE_Z / 2);
    BiomeType biome = getBiomeWithHeight(mid_wx, mid_wz, mid_height);
    
    // Low chance for a structure per chunk
    if ((rng() % 100) >= 5) return;  // 5% chance
    
    // Simple well in desert or plains
    if (biome == BiomeType::DESERT || biome == BiomeType::PLAINS) {
        // Find a flat area near center of chunk
        int cx_off = CHUNK_SIZE_X / 2 - 2 + (rng() % 5);
        int cz_off = CHUNK_SIZE_Z / 2 - 2 + (rng() % 5);
        
        // Check if area is flat enough
        int base_h = chunk.getHeight(cx_off, cz_off);
        bool flat = true;
        for (int dx = 0; dx < 5 && flat; dx++) {
            for (int dz = 0; dz < 5 && flat; dz++) {
                int h = chunk.getHeight(cx_off + dx, cz_off + dz);
                if (std::abs(h - base_h) > 1) flat = false;
            }
        }
        if (!flat) return;
        
        // Build a small well structure
        // Outer ring of stone bricks (we'll use stone as placeholder)
        for (int dx = 0; dx < 5; dx++) {
            for (int dz = 0; dz < 5; dz++) {
                if ((dx == 0 || dx == 4 || dz == 0 || dz == 4) && 
                    !(dx == 0 && dz == 0) && !(dx == 0 && dz == 4) &&
                    !(dx == 4 && dz == 0) && !(dx == 4 && dz == 4)) {
                    int h = chunk.getHeight(cx_off + dx, cz_off + dz);
                    if (h < CHUNK_SIZE_Y) {
                        chunk.setBlock(cx_off + dx, h, cz_off + dz, BLOCK_COBBLESTONE, 0);
                        if (h + 1 < CHUNK_SIZE_Y)
                            chunk.setBlock(cx_off + dx, h + 1, cz_off + dz, BLOCK_COBBLESTONE, 0);
                    }
                }
            }
        }
        // Water in center
        if (base_h - 1 >= 0)
            chunk.setBlock(cx_off + 2, base_h - 1, cz_off + 2, BLOCK_WATER, 0);
    }
}
