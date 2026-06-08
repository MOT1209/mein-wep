#ifndef KINGCRAFT_TYPES_H
#define KINGCRAFT_TYPES_H

#include <cstdint>
#include <string>
#include <vector>
#include <array>
#include <functional>

// ============================================================
// MATH TYPES
// ============================================================
struct Vec3f {
    float x, y, z;
    Vec3f() : x(0), y(0), z(0) {}
    Vec3f(float x, float y, float z) : x(x), y(y), z(z) {}
    
    Vec3f operator+(const Vec3f& o) const { return {x+o.x, y+o.y, z+o.z}; }
    Vec3f operator-(const Vec3f& o) const { return {x-o.x, y-o.y, z-o.z}; }
    Vec3f operator*(float s) const { return {x*s, y*s, z*s}; }
    Vec3f operator/(float s) const { return {x/s, y/s, z/s}; }
    
    float length() const;
    Vec3f normalized() const;
    float dot(const Vec3f& o) const { return x*o.x + y*o.y + z*o.z; }
    Vec3f cross(const Vec3f& o) const { return {y*o.z - z*o.y, z*o.x - x*o.z, x*o.y - y*o.x}; }
};

struct Vec3i {
    int x, y, z;
    Vec3i() : x(0), y(0), z(0) {}
    Vec3i(int x, int y, int z) : x(x), y(y), z(z) {}
    
    Vec3i operator+(const Vec3i& o) const { return {x+o.x, y+o.y, z+o.z}; }
    Vec3i operator-(const Vec3i& o) const { return {x-o.x, y-o.y, z-o.z}; }
    bool operator==(const Vec3i& o) const { return x==o.x && y==o.y && z==o.z; }
    bool operator!=(const Vec3i& o) const { return !(*this == o); }
    
    // For use as hash key
    uint64_t hash() const {
        return ((uint64_t)(uint32_t)x) | ((uint64_t)(uint32_t)y << 21) | ((uint64_t)(uint32_t)z << 42);
    }
};

struct Vec4f {
    float x, y, z, w;
    Vec4f() : x(0), y(0), z(0), w(1) {}
    Vec4f(float x, float y, float z, float w) : x(x), y(y), z(z), w(w) {}
};

// ============================================================
// BLOCK / ITEM TYPES
// ============================================================
using BlockID = uint16_t;
using ItemID = uint16_t;
using BlockState = uint16_t;

// Special block IDs
constexpr BlockID BLOCK_AIR = 0;
constexpr BlockID BLOCK_STONE = 1;
constexpr BlockID BLOCK_DIRT = 2;
constexpr BlockID BLOCK_GRASS = 3;
constexpr BlockID BLOCK_SAND = 4;
constexpr BlockID BLOCK_WATER = 5;
constexpr BlockID BLOCK_WOOD = 6;
constexpr BlockID BLOCK_PLANKS = 7;
constexpr BlockID BLOCK_LEAVES = 8;
constexpr BlockID BLOCK_COBBLESTONE = 9;
constexpr BlockID BLOCK_BEDROCK = 10;
constexpr BlockID BLOCK_MAX = 255;

// Block state bit packing
enum BlockStateBits : uint16_t {
    STATE_ROTATION_BITS = 0x000F,    // 0-3: rotation/facing
    STATE_VARIANT_BITS  = 0x00F0,    // 4-7: variant
    STATE_WATERLOGGED   = 0x0100,    // 8: waterlogged
    STATE_LIT           = 0x0200,    // 9: lit (furnace, lamp)
    STATE_POWERED       = 0x0400,    // 10: powered (redstone)
    STATE_LOCKED        = 0x0800,    // 11: locked
    STATE_CUSTOM_BITS   = 0xF000,    // 12-15: custom
};

// ============================================================
// CHUNK TYPES
// ============================================================
constexpr int CHUNK_SIZE_X = 32;
constexpr int CHUNK_SIZE_Y = 128;  // will expand to 384 later
constexpr int CHUNK_SIZE_Z = 32;
constexpr int CHUNK_BLOCKS = CHUNK_SIZE_X * CHUNK_SIZE_Y * CHUNK_SIZE_Z;
constexpr int CHUNK_VOLUME = CHUNK_SIZE_X * CHUNK_SIZE_Z; // for heightmap

struct ChunkPos {
    int x, z;
    ChunkPos() : x(0), z(0) {}
    ChunkPos(int x, int z) : x(x), z(z) {}
    bool operator==(const ChunkPos& o) const { return x==o.x && z==o.z; }
    bool operator!=(const ChunkPos& o) const { return !(*this == o); }
    
    uint64_t hash() const {
        return ((uint64_t)(uint32_t)x) | ((uint64_t)(uint32_t)z << 32);
    }
};

// ============================================================
// MESH TYPES
// ============================================================
struct Vertex {
    float px, py, pz;      // position
    float nx, ny, nz;      // normal
    float u, v;            // UV
    float ao;              // ambient occlusion (0-1)
    uint32_t texture;       // texture atlas index
};

struct MeshData {
    std::vector<Vertex> vertices;
    std::vector<uint32_t> indices;
    
    void clear() { vertices.clear(); indices.clear(); }
    bool isEmpty() const { return vertices.empty(); }
};

// ============================================================
// GAME ENUMS
// ============================================================
enum class GameMode { SURVIVAL, CREATIVE, SPECTATOR };
enum class Weather { CLEAR, RAIN, SNOW, THUNDER };
enum class Direction { NORTH, SOUTH, EAST, WEST, UP, DOWN };

// ============================================================
// RAYCAST RESULT
// ============================================================
struct RaycastHit {
    Vec3i block_pos;        // position of hit block
    Direction face;         // which face was hit
    Vec3f hit_point;        // exact hit point
    float distance;         // distance from origin
    bool hit = false;       // did we hit anything?
};

// ============================================================
// ITEM STACK
// ============================================================
struct ItemStack {
    ItemID item_id = 0;     // 0 = empty
    int count = 0;
    uint16_t durability = 0;
    uint16_t meta = 0;      // additional metadata
    
    bool isEmpty() const { return item_id == 0 || count <= 0; }
    void clear() { item_id = 0; count = 0; durability = 0; meta = 0; }
};

// ============================================================
// BLOCK PROPERTIES
// ============================================================
struct BlockProperties {
    std::string name_id;     // e.g., "minecraft:stone"
    uint16_t numeric_id = 0;
    float hardness = 1.0f;
    float resistance = 1.0f;
    float luminance = 0.0f;
    float opacity = 1.0f;    // 0=transparent, 1=opaque
    bool is_solid = true;
    bool is_transparent = false;
    bool is_fluid = false;
    bool is_plant = false;
    bool requires_tool = false;
    std::string tool_type;   // "pickaxe", "axe", "shovel", ""
    int min_tier = 0;
    std::string drop_item;   // item ID to drop when broken
    int drop_min = 1;
    int drop_max = 1;
    int xp_min = 0;
    int xp_max = 0;
    std::string sound;       // sound type
    uint32_t top_tex = 0;    // texture atlas indices
    uint32_t side_tex = 0;
    uint32_t bottom_tex = 0;
};

#endif // KINGCRAFT_TYPES_H
