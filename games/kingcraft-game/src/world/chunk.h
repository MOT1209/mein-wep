#ifndef KINGCRAFT_CHUNK_H
#define KINGCRAFT_CHUNK_H

#include "core/types.h"
#include <vector>
#include <atomic>
#include <memory>

// ============================================================
// CHUNK DATA — الهيكل الأساسي للـ Chunk
// ============================================================
class Chunk {
public:
    Chunk() = default;
    Chunk(int cx, int cz);
    ~Chunk() = default;
    
    // لا يمكن نسخ Chunk (ثقيل)
    Chunk(const Chunk&) = delete;
    Chunk& operator=(const Chunk&) = delete;
    Chunk(Chunk&&) = default;
    Chunk& operator=(Chunk&&) = default;
    
    // الوصول إلى البلوكات
    BlockID getBlock(int x, int y, int z) const;
    BlockState getState(int x, int y, int z) const;
    void setBlock(int x, int y, int z, BlockID id, BlockState state = 0);
    
    // إضاءة
    uint8_t getSkyLight(int x, int y, int z) const;
    uint8_t getBlockLight(int x, int y, int z) const;
    void setSkyLight(int x, int y, int z, uint8_t level);
    void setBlockLight(int x, int y, int z, uint8_t level);
    
    // Heightmap
    int getHeight(int x, int z) const;
    void setHeight(int x, int z, int h);
    
    // Mesh
    const MeshData* getMesh() const { return mesh.get(); }
    MeshData* getMesh() { return mesh.get(); }
    void setMesh(std::unique_ptr<MeshData> m) { mesh = std::move(m); dirty = false; }
    void markDirty() { dirty = true; }
    bool isDirty() const { return dirty; }
    
    // حالة التحميل
    bool isLoaded() const { return loaded; }
    void setLoaded(bool v) { loaded = v; }
    
    // الإحداثيات
    int getCX() const { return cx; }
    int getCZ() const { return cz; }
    ChunkPos getPos() const { return {cx, cz}; }
    
    // التحقق من الحدود
    static bool inBounds(int x, int y, int z) {
        return x >= 0 && x < CHUNK_SIZE_X &&
               y >= 0 && y < CHUNK_SIZE_Y &&
               z >= 0 && z < CHUNK_SIZE_Z;
    }
    
    // مؤشر خطي
    static int index(int x, int y, int z) {
        return (y * CHUNK_SIZE_Z + z) * CHUNK_SIZE_X + x;
    }

private:
    int cx = 0, cz = 0;
    bool loaded = false;
    std::atomic<bool> dirty{true};
    
    // Block data
    std::vector<BlockID> blocks;      // [CHUNK_BLOCKS]
    std::vector<BlockState> states;   // [CHUNK_BLOCKS]
    
    // Light data: packed sky+block in one byte each
    std::vector<uint8_t> sky_light;   // [CHUNK_BLOCKS]
    std::vector<uint8_t> block_light; // [CHUNK_BLOCKS]
    
    // Heightmap
    std::vector<int16_t> heightmap;   // [CHUNK_VOLUME]
    
    // Mesh
    std::unique_ptr<MeshData> mesh;
};

// ============================================================
// CHUNK MANAGER
// ============================================================
class ChunkManager {
public:
    ChunkManager();
    ~ChunkManager();
    
    // الحصول على Chunk
    Chunk* getChunk(int cx, int cz);
    const Chunk* getChunk(int cx, int cz) const;
    Chunk* getOrCreateChunk(int cx, int cz);
    
    // الحصول على بلوك في إحداثيات العالم
    BlockID getWorldBlock(int wx, int wy, int wz);
    void setWorldBlock(int wx, int wy, int wz, BlockID id, BlockState state = 0);
    
    // تحميل/تفريغ الـ Chunks
    void updateViewDistance(int player_cx, int player_cz, int view_dist);
    void loadChunk(int cx, int cz);
    void unloadChunk(int cx, int cz);
    void saveChunk(int cx, int cz);
    
    // التكرار على الـ Chunks المحملة
    void forEachLoaded(const std::function<void(Chunk&)>& func);
    void forEachLoaded(const std::function<void(const Chunk&)>& func) const;
    
    // Mesh rebuilding
    void rebuildMesh(int cx, int cz);
    void rebuildAllMeshes();
    
    // حالة
    int loadedCount() const { return (int)chunks.size(); }
    void clear();
    
    // Chunk position from world position
    static int toChunkPos(int world_pos);
    static int toBlockInChunk(int world_pos);

private:
    std::unordered_map<uint64_t, std::unique_ptr<Chunk>> chunks;
    int view_distance = 10;
};

#endif // KINGCRAFT_CHUNK_H
