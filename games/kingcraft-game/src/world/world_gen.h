#ifndef KINGCRAFT_WORLD_GEN_H
#define KINGCRAFT_WORLD_GEN_H

#include "core/types.h"
#include "world/chunk.h"

// ============================================================
// WORLD GENERATOR — توليد العالم الإجرائي
// ============================================================
class WorldGenerator {
public:
    WorldGenerator(uint64_t seed);
    ~WorldGenerator() = default;
    
    // توليد Chunk كامل
    void generate(Chunk& chunk);
    
    // دوال مساعدة للـ Terrain
    int getHeightAt(int wx, int wz);         // ارتفاع التضاريس
    float getTemperature(int wx, int wz);     // درجة الحرارة (0-1)
    float getHumidity(int wx, int wz);        // الرطوبة (0-1)
    
    // توليد الميزات
    void generateTrees(Chunk& chunk);
    void generateFlowers(Chunk& chunk);
    void generateCaves(Chunk& chunk);
    void generateOres(Chunk& chunk);
    
    // Seed
    uint64_t getSeed() const { return seed; }

private:
    uint64_t seed;
    
    // دوال الـ Noise الداخلية
    float noise2D(float x, float z, float freq, int octaves) const;
    float noise3D(float x, float y, float z, float freq, int octaves) const;
    float cellularNoise(float x, float z, float freq) const;
};

#endif // KINGCRAFT_WORLD_GEN_H
