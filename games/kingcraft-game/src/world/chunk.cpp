#include "world/chunk.h"
#include <cstring>
#include <algorithm>

// ============================================================
// CHUNK
// ============================================================
Chunk::Chunk(int cx, int cz) : cx(cx), cz(cz) {
    blocks.resize(CHUNK_BLOCKS, 0);       // all air
    states.resize(CHUNK_BLOCKS, 0);
    sky_light.resize(CHUNK_BLOCKS, 0);
    block_light.resize(CHUNK_BLOCKS, 0);
    heightmap.resize(CHUNK_VOLUME, 0);
}

BlockID Chunk::getBlock(int x, int y, int z) const {
    if (!inBounds(x, y, z)) return BLOCK_AIR;
    return blocks[index(x, y, z)];
}

BlockState Chunk::getState(int x, int y, int z) const {
    if (!inBounds(x, y, z)) return 0;
    return states[index(x, y, z)];
}

void Chunk::setBlock(int x, int y, int z, BlockID id, BlockState state) {
    if (!inBounds(x, y, z)) return;
    int idx = index(x, y, z);
    blocks[idx] = id;
    states[idx] = state;
    dirty = true;
    
    // Update heightmap
    if (id != BLOCK_AIR && id != BLOCK_WATER) {
        if (y > heightmap[x * CHUNK_SIZE_Z + z]) {
            heightmap[x * CHUNK_SIZE_Z + z] = (int16_t)y;
        }
    } else if (id == BLOCK_AIR) {
        // Might need to recalculate heightmap if we removed top block
        if (y >= heightmap[x * CHUNK_SIZE_Z + z]) {
            // Mark for recalculation
            heightmap[x * CHUNK_SIZE_Z + z] = -1;
        }
    }
}

uint8_t Chunk::getSkyLight(int x, int y, int z) const {
    if (!inBounds(x, y, z)) return 15;
    return sky_light[index(x, y, z)];
}

uint8_t Chunk::getBlockLight(int x, int y, int z) const {
    if (!inBounds(x, y, z)) return 0;
    return block_light[index(x, y, z)];
}

void Chunk::setSkyLight(int x, int y, int z, uint8_t level) {
    if (!inBounds(x, y, z)) return;
    sky_light[index(x, y, z)] = std::min((uint8_t)15, level);
}

void Chunk::setBlockLight(int x, int y, int z, uint8_t level) {
    if (!inBounds(x, y, z)) return;
    block_light[index(x, y, z)] = std::min((uint8_t)15, level);
}

int Chunk::getHeight(int x, int z) const {
    if (x < 0 || x >= CHUNK_SIZE_X || z < 0 || z >= CHUNK_SIZE_Z) return 0;
    int h = heightmap[x * CHUNK_SIZE_Z + z];
    if (h < 0) {
        // Recalculate
        for (int y = CHUNK_SIZE_Y - 1; y >= 0; y--) {
            if (blocks[index(x, y, z)] != BLOCK_AIR) {
                const_cast<Chunk*>(this)->heightmap[x * CHUNK_SIZE_Z + z] = (int16_t)y;
                return y;
            }
        }
        return 0;
    }
    return h;
}

void Chunk::setHeight(int x, int z, int h) {
    if (x < 0 || x >= CHUNK_SIZE_X || z < 0 || z >= CHUNK_SIZE_Z) return;
    heightmap[x * CHUNK_SIZE_Z + z] = (int16_t)h;
}

// ============================================================
// CHUNK MANAGER
// ============================================================
ChunkManager::ChunkManager() = default;
ChunkManager::~ChunkManager() = default;

Chunk* ChunkManager::getChunk(int cx, int cz) {
    uint64_t key = ChunkPos(cx, cz).hash();
    auto it = chunks.find(key);
    return (it != chunks.end()) ? it->second.get() : nullptr;
}

const Chunk* ChunkManager::getChunk(int cx, int cz) const {
    uint64_t key = ChunkPos(cx, cz).hash();
    auto it = chunks.find(key);
    return (it != chunks.end()) ? it->second.get() : nullptr;
}

Chunk* ChunkManager::getOrCreateChunk(int cx, int cz) {
    uint64_t key = ChunkPos(cx, cz).hash();
    auto it = chunks.find(key);
    if (it != chunks.end()) return it->second.get();
    
    auto chunk = std::make_unique<Chunk>(cx, cz);
    Chunk* ptr = chunk.get();
    chunks[key] = std::move(chunk);
    return ptr;
}

BlockID ChunkManager::getWorldBlock(int wx, int wy, int wz) {
    int cx = toChunkPos(wx);
    int cz = toChunkPos(wz);
    int bx = toBlockInChunk(wx);
    int bz = toBlockInChunk(wz);
    
    auto* chunk = getChunk(cx, cz);
    if (!chunk) return BLOCK_AIR;
    return chunk->getBlock(bx, wy, bz);
}

void ChunkManager::setWorldBlock(int wx, int wy, int wz, BlockID id, BlockState state) {
    if (wy < 0 || wy >= CHUNK_SIZE_Y) return;
    
    int cx = toChunkPos(wx);
    int cz = toChunkPos(wz);
    int bx = toBlockInChunk(wx);
    int bz = toBlockInChunk(wz);
    
    auto* chunk = getOrCreateChunk(cx, cz);
    chunk->setBlock(bx, wy, bz, id, state);
}

void ChunkManager::updateViewDistance(int player_cx, int player_cz, int view_dist) {
    view_distance = view_dist;
    
    // Load chunks within range
    for (int dx = -view_dist; dx <= view_dist; dx++) {
        for (int dz = -view_dist; dz <= view_dist; dz++) {
            int cx = player_cx + dx;
            int cz = player_cz + dz;
            if (!getChunk(cx, cz)) {
                loadChunk(cx, cz);
            }
        }
    }
    
    // Unload chunks outside range (with margin)
    std::vector<uint64_t> to_remove;
    for (auto& [key, chunk] : chunks) {
        int dx = chunk->getCX() - player_cx;
        int dz = chunk->getCZ() - player_cz;
        if (std::abs(dx) > view_dist + 2 || std::abs(dz) > view_dist + 2) {
            to_remove.push_back(key);
        }
    }
    for (auto key : to_remove) {
        chunks.erase(key);
    }
}

void ChunkManager::loadChunk(int cx, int cz) {
    auto* chunk = getOrCreateChunk(cx, cz);
    chunk->setLoaded(true);
}

void ChunkManager::unloadChunk(int cx, int cz) {
    uint64_t key = ChunkPos(cx, cz).hash();
    chunks.erase(key);
}

void ChunkManager::saveChunk(int cx, int cz) {
    // TODO: Save to region file
}

void ChunkManager::forEachLoaded(const std::function<void(Chunk&)>& func) {
    for (auto& [key, chunk] : chunks) {
        if (chunk->isLoaded()) func(*chunk);
    }
}

void ChunkManager::forEachLoaded(const std::function<void(const Chunk&)>& func) const {
    for (const auto& [key, chunk] : chunks) {
        if (chunk->isLoaded()) func(*chunk);
    }
}

void ChunkManager::rebuildMesh(int cx, int cz) {
    auto* chunk = getChunk(cx, cz);
    if (!chunk || !chunk->isLoaded()) return;
    
    chunk->markDirty();
}

void ChunkManager::rebuildAllMeshes() {
    for (auto& [key, chunk] : chunks) {
        if (chunk->isLoaded()) chunk->markDirty();
    }
}

void ChunkManager::clear() {
    chunks.clear();
}

int ChunkManager::toChunkPos(int world_pos) {
    return (int)std::floor((float)world_pos / CHUNK_SIZE_X);
}

int ChunkManager::toBlockInChunk(int world_pos) {
    int r = world_pos % CHUNK_SIZE_X;
    if (r < 0) r += CHUNK_SIZE_X;
    return r;
}
