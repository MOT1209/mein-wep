#include "world/world_gen.h"
#include "world/block_registry.h"
#include <cmath>
#include <random>
#include <cstring>
#include <algorithm>

// ============================================================
// SIMPLE NOISE FUNCTIONS
// ============================================================
// نستخدم noise بسيط (سنستبدله بـ FastNoise لاحقاً)

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
// WORLD GENERATOR
// ============================================================
WorldGenerator::WorldGenerator(uint64_t seed) : seed(seed) {}

float WorldGenerator::noise2D(float x, float z, float freq, int octaves) const {
    float value = 0;
    float amplitude = 1;
    float max_value = 0;
    float lacunarity = 2.0f;
    float gain = 0.5f;
    
    // Apply seed offset
    x += (seed & 0xFFFF) * 1000.0f;
    z += ((seed >> 16) & 0xFFFF) * 1000.0f;
    
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
    
    x += (seed & 0xFFFF) * 1000.0f;
    z += ((seed >> 16) & 0xFFFF) * 1000.0f;
    y += ((seed >> 8) & 0xFFFF) * 1000.0f;
    
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

int WorldGenerator::getHeightAt(int wx, int wz) {
    const int SEA_LEVEL = 63;
    
    // Continentalness
    float continent = noise2D(wx, wz, 0.001f, 4);
    
    // Erosion (makes mountains)
    float erosion = noise2D(wx, wz, 0.002f, 3);
    
    // Detail noise
    float detail = noise2D(wx, wz, 0.01f, 2);
    
    // Base height: 40-100 blocks
    float base = SEA_LEVEL + (continent - 0.5f) * 40.0f;
    
    // Mountains
    if (erosion > 0.55f) {
        base += (erosion - 0.55f) * 100.0f;
    }
    
    // Valleys
    if (erosion < 0.45f) {
        base -= (0.45f - erosion) * 20.0f;
    }
    
    // Detail variation
    base += (detail - 0.5f) * 3.0f;
    
    // Ocean
    if (continent < 0.4f) {
        base = SEA_LEVEL - (0.4f - continent) * 30.0f;
    }
    
    return (int)std::round(base);
}

float WorldGenerator::getTemperature(int wx, int wz) {
    return noise2D(wx, wz, 0.0005f, 3);
}

float WorldGenerator::getHumidity(int wx, int wz) {
    return noise2D(wx, wz, 0.0005f, 3);
}

void WorldGenerator::generate(Chunk& chunk) {
    int cx = chunk.getCX();
    int cz = chunk.getCZ();
    
    // توليد كل بلوك في الـ Chunk
    for (int x = 0; x < CHUNK_SIZE_X; x++) {
        for (int z = 0; z < CHUNK_SIZE_Z; z++) {
            int wx = cx * CHUNK_SIZE_X + x;
            int wz = cz * CHUNK_SIZE_Z + z;
            
            int height = getHeightAt(wx, wz);
            chunk.setHeight(x, z, height);
            
            float temp = getTemperature(wx, wz);
            float humid = getHumidity(wx, wz);
            
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
                        block = BLOCK_DIRT;
                    } else {
                        block = BLOCK_STONE;
                    }
                } else if (y == height) {
                    // Surface block
                    if (height <= 63) {
                        // Below sea level → sand or gravel
                        block = BLOCK_SAND;
                    } else {
                        // Above sea level
                        if (temp > 0.6f && humid < 0.3f) {
                            // Hot and dry → sand
                            block = BLOCK_SAND;
                        } else {
                            // Normal → grass
                            block = BLOCK_GRASS;
                        }
                    }
                } else if (y <= 63 && y > height) {
                    // Water column
                    block = BLOCK_WATER;
                    if (height < 58) {
                        // Deep water → gravel bottom
                        if (y == height + 1) block = BLOCK_DIRT;
                    }
                }
                
                if (block != BLOCK_AIR) {
                    chunk.setBlock(x, y, z, block, state);
                }
            }
        }
    }
    
    // توليد الأشجار
    generateTrees(chunk);
    generateFlowers(chunk);
    generateCaves(chunk);
    generateOres(chunk);
}

void WorldGenerator::generateTrees(Chunk& chunk) {
    int cx = chunk.getCX();
    int cz = chunk.getCZ();
    std::mt19937 rng(seed + cx * 10000 + cz);
    
    // أشجار أقل: 1-3 أشجار لكل Chunk على مسافات متباعدة
    // نستخدم شبكة 6×6 وفرصة 8%
    for (int x = 4; x < CHUNK_SIZE_X - 4; x += 6) {
        for (int z = 4; z < CHUNK_SIZE_Z - 4; z += 6) {
            if ((rng() % 100) < 8) {  // 8% chance per 6x6 cell
                int wx = cx * CHUNK_SIZE_X + x;
                int wz = cz * CHUNK_SIZE_Z + z;
                int height = chunk.getHeight(x, z);
                
                // Only place trees on grass
                if (chunk.getBlock(x, height, z) == BLOCK_GRASS && height > 63) {
                    // Trunk (4-6 blocks tall)
                    int trunk_height = 4 + (rng() % 3);
                    for (int ty = 1; ty <= trunk_height; ty++) {
                        if (height + ty < CHUNK_SIZE_Y) {
                            chunk.setBlock(x, height + ty, z, BLOCK_WOOD, 0);
                        }
                    }
                    
                    // Leaves (diamond shape)
                    int leaf_base = height + trunk_height - 2;
                    for (int ly = 0; ly < 3; ly++) {
                        int radius = 2 - ly;
                        for (int lx = -radius; lx <= radius; lx++) {
                            for (int lz = -radius; lz <= radius; lz++) {
                                if (lx*lx + lz*lz <= radius*radius + 1) {
                                    int bx = x + lx;
                                    int bz = z + lz;
                                    int by = leaf_base + ly;
                                    if (bx >= 0 && bx < CHUNK_SIZE_X &&
                                        bz >= 0 && bz < CHUNK_SIZE_Z &&
                                        by < CHUNK_SIZE_Y &&
                                        chunk.getBlock(bx, by, bz) == BLOCK_AIR) {
                                        chunk.setBlock(bx, by, bz, BLOCK_LEAVES, 0);
                                    }
                                }
                            }
                        }
                    }
                    // Top leaf
                    int top_y = leaf_base + 3;
                    if (top_y < CHUNK_SIZE_Y && chunk.getBlock(x, top_y, z) == BLOCK_AIR) {
                        chunk.setBlock(x, top_y, z, BLOCK_LEAVES, 0);
                    }
                }
            }
        }
    }
}

void WorldGenerator::generateFlowers(Chunk& chunk) {
    // توليد أزهار وعشب على السطح
    int cx = chunk.getCX();
    int cz = chunk.getCZ();
    std::mt19937 rng(seed + cx * 5000 + cz * 7000);
    
    for (int x = 0; x < CHUNK_SIZE_X; x++) {
        for (int z = 0; z < CHUNK_SIZE_Z; z++) {
            int height = chunk.getHeight(x, z);
            if (height < 0 || height >= CHUNK_SIZE_Y) continue;
            
            if (chunk.getBlock(x, height, z) == BLOCK_GRASS && height > 63) {
                if ((rng() % 100) < 3) {  // 3% for tall grass
                    // TODO: Place tall grass (will be a plant block)
                }
            }
        }
    }
}

void WorldGenerator::generateCaves(Chunk& chunk) {
    int cx = chunk.getCX();
    int cz = chunk.getCZ();
    
    // Simple cave generation using 3D noise
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

float WorldGenerator::cellularNoise(float x, float z, float freq) const {
    (void)x; (void)z; (void)freq;
    // TODO: Cellular noise for villages/structures
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
            chunk.setBlock(ox, oy, oz, BLOCK_COBBLESTONE, 0);  // placeholder for coal
        }
    }
    
    // Iron ore (mid depths)
    for (int i = 0; i < 5; i++) {
        int ox = rng() % CHUNK_SIZE_X;
        int oz = rng() % CHUNK_SIZE_Z;
        int oy = (rng() % 40) + 5;
        
        if (chunk.getBlock(ox, oy, oz) == BLOCK_STONE) {
            chunk.setBlock(ox, oy, oz, BLOCK_COBBLESTONE, 0);  // placeholder for iron
        }
    }
}
