#ifndef KINGCRAFT_MESH_GEN_H
#define KINGCRAFT_MESH_GEN_H

#include "core/types.h"
#include "world/chunk.h"
#include "world/block_registry.h"

// ============================================================
// GREEDY MESHING GENERATOR
// ============================================================
namespace MeshGenerator {
    
    // Greedy meshing — يدمج الوجوه المتجاورة
    MeshData generateChunkMesh(const Chunk& chunk, const BlockRegistry& registry);
    
    // Greedy meshing مع جيران الـ Chunk (لحدود صحيحة)
    MeshData generateChunkMeshWithNeighbors(
        const Chunk& chunk, const BlockRegistry& registry,
        const Chunk* neighbor_px, const Chunk* neighbor_nx,
        const Chunk* neighbor_pz, const Chunk* neighbor_nz);
    
    // Simple meshing (naive) — كل بلوك = 6 وجوه
    MeshData generateSimpleMesh(const Chunk& chunk, const BlockRegistry& registry);
    
    // Cross quad meshing (للنباتات)
    MeshData generateCrossMesh(const Chunk& chunk, const BlockRegistry& registry);
}

#endif // KINGCRAFT_MESH_GEN_H
