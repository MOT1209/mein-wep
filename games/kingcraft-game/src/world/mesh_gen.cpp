#include "world/mesh_gen.h"
#include "world/block_registry.h"
#include <cstring>
#include <vector>
#include <algorithm>
#include <unordered_map>

// ============================================================
// GREEDY MESHING — خوارزمية الدمج الجشع
// ============================================================
// تدعم الوجوه الموجبة والسالبة لجميع المحاور الثلاثة
// وتدعم جيران الـ Chunk

namespace {

struct Mask {
    int width, height;
    std::vector<uint8_t> data;
    
    Mask(int w, int h) : width(w), height(h) { data.resize(w * h, 0); }
    
    uint8_t& at(int x, int y) { return data[y * width + x]; }
    const uint8_t& at(int x, int y) const { return data[y * width + x]; }
    
    void fill(int x, int y, int w, int h, uint8_t val) {
        for (int dy = 0; dy < h; dy++)
            for (int dx = 0; dx < w; dx++)
                at(x + dx, y + dy) = val;
    }
};

// تحقق إذا كان البلوك يقبل الإضاءة (يحتاج وجوه)
static bool isOpaqueBlock(const BlockProperties* bp) {
    return bp && bp->is_solid && !bp->is_fluid && bp->opacity > 0.5f;
}

// تحقق إذا كان الوجه مكشوفاً — مع دعم جيران الـ Chunk
static bool isFaceExposed(const Chunk& chunk, int x, int y, int z, 
                          int nx, int ny, int nz,
                          const Chunk* neighbor_pos, const Chunk* neighbor_neg) {
    int bx = x + nx;
    int by = y + ny;
    int bz = z + nz;
    
    // إذا كان داخل الـ Chunk
    if (Chunk::inBounds(bx, by, bz)) {
        BlockID nb = chunk.getBlock(bx, by, bz);
        return nb == BLOCK_AIR || nb == BLOCK_WATER;
    }
    
    // إذا كان خارج الـ Chunk — تحقق من الجيران
    const Chunk* neighbor = nullptr;
    
    // تحديد الجار المناسب حسب المحور
    if (nx > 0 && x == CHUNK_SIZE_X - 1) neighbor = neighbor_pos;
    else if (nx < 0 && x == 0) neighbor = neighbor_neg;
    else if (ny > 0 && y == CHUNK_SIZE_Y - 1) return true;  // top of world = exposed
    else if (ny < 0 && y == 0) return true;  // bottom of world = exposed
    else if (nz > 0 && z == CHUNK_SIZE_Z - 1) neighbor = neighbor_pos;
    else if (nz < 0 && z == 0) neighbor = neighbor_neg;
    else return true;  // edge without neighbor = exposed
    
    if (!neighbor) return true;  // no neighbor loaded = exposed
    
    // تحويل الإحداثيات إلى إحداثيات الـ Chunk المجاور
    int nbx = bx;
    int nby = by;
    int nbz = bz;
    
    if (nx > 0) nbx = 0;
    else if (nx < 0) nbx = CHUNK_SIZE_X - 1;
    else if (nz > 0) nbz = 0;
    else if (nz < 0) nbz = CHUNK_SIZE_Z - 1;
    
    if (Chunk::inBounds(nbx, nby, nbz)) {
        BlockID nb = neighbor->getBlock(nbx, nby, nbz);
        return nb == BLOCK_AIR || nb == BLOCK_WATER;
    }
    
    return true;
}

// دالة مساعدة لإنشاء vertices للـ Quad
static void addQuad(MeshData& mesh, const float pos[3], int w, int h, 
                    const float normal[3], int axis, int sign,
                    uint32_t tex, int u_axis, int v_axis) {
    float x = pos[0], y = pos[1], z = pos[2];
    float u1 = 0, v1 = 0;
    float u2 = (float)w, v2 = (float)h;
    
    Vertex verts[4];
    
    // ترتيب الـ vertices عكس عقارب الساعة (CCW)
    // الوجه الموجب يكون عند pos[axis]+1، والوجه السالب عند pos[axis]
    if (axis == 0) {  // X-axis
        float val = (sign > 0) ? x + 1 : x;
        verts[0] = {val, y + h, z + 0, normal[0], normal[1], normal[2], u1, v1, 1.0f, tex};
        verts[1] = {val, y + h, z + w, normal[0], normal[1], normal[2], u2, v1, 1.0f, tex};
        verts[2] = {val, y + 0, z + w, normal[0], normal[1], normal[2], u2, v2, 1.0f, tex};
        verts[3] = {val, y + 0, z + 0, normal[0], normal[1], normal[2], u1, v2, 1.0f, tex};
    } else if (axis == 1) {  // Y-axis
        float val = (sign > 0) ? y + 1 : y;
        verts[0] = {x + 0, val, z + h, normal[0], normal[1], normal[2], u1, v1, 1.0f, tex};
        verts[1] = {x + w, val, z + h, normal[0], normal[1], normal[2], u2, v1, 1.0f, tex};
        verts[2] = {x + w, val, z + 0, normal[0], normal[1], normal[2], u2, v2, 1.0f, tex};
        verts[3] = {x + 0, val, z + 0, normal[0], normal[1], normal[2], u1, v2, 1.0f, tex};
    } else {  // Z-axis
        float val = (sign > 0) ? z + 1 : z;
        verts[0] = {x + 0, y + h, val, normal[0], normal[1], normal[2], u1, v1, 1.0f, tex};
        verts[1] = {x + w, y + h, val, normal[0], normal[1], normal[2], u2, v1, 1.0f, tex};
        verts[2] = {x + w, y + 0, val, normal[0], normal[1], normal[2], u2, v2, 1.0f, tex};
        verts[3] = {x + 0, y + 0, val, normal[0], normal[1], normal[2], u1, v2, 1.0f, tex};
    }
    
    uint32_t base = (uint32_t)mesh.vertices.size();
    for (int i = 0; i < 4; i++) mesh.vertices.push_back(verts[i]);
    mesh.indices.push_back(base);
    mesh.indices.push_back(base + 1);
    mesh.indices.push_back(base + 2);
    mesh.indices.push_back(base);
    mesh.indices.push_back(base + 2);
    mesh.indices.push_back(base + 3);
}

// معالجة محور واحد (لكلا الاتجاهين: موجب وسالب)
static void processAxis(MeshData& mesh, const Chunk& chunk, int axis,
                        const Chunk* neighbor_pos, const Chunk* neighbor_neg,
                        const BlockRegistry& registry) {
    int u = (axis + 1) % 3;
    int v = (axis + 2) % 3;
    
    int size[3] = {CHUNK_SIZE_X, CHUNK_SIZE_Y, CHUNK_SIZE_Z};
    int sx = size[u];
    int sy = size[v];
    int sz = size[axis];
    
    int signs[2] = {1, -1};  // positive and negative face directions
    
    for (int sign : signs) {
        for (int slice = 0; slice < sz; slice++) {
            Mask mask(sx, sy);
            
            // Build mask of visible faces in this slice
            for (int y = 0; y < sy; y++) {
                for (int x = 0; x < sx; x++) {
                    int pos[3] = {0, 0, 0};
                    pos[axis] = slice;
                    pos[u] = x;
                    pos[v] = y;
                    
                    BlockID block = chunk.getBlock(pos[0], pos[1], pos[2]);
                    const auto* bp = registry.get(block);
                    
                    if (!isOpaqueBlock(bp)) continue;
                    
                    int normal[3] = {0, 0, 0};
                    normal[axis] = sign;
                    
                    if (isFaceExposed(chunk, pos[0], pos[1], pos[2],
                                      normal[0], normal[1], normal[2],
                                      neighbor_pos, neighbor_neg)) {
                        mask.at(x, y) = 1;
                    }
                }
            }
            
            // Greedy: merge adjacent quads
            for (int y = 0; y < sy; y++) {
                for (int x = 0; x < sx; x++) {
                    if (mask.at(x, y) == 0) continue;
                    
                    // Find max width
                    int w = 1;
                    while (x + w < sx && mask.at(x + w, y) == 1) w++;
                    
                    // Find max height
                    int h = 1;
                    bool valid = true;
                    while (y + h < sy && valid) {
                        for (int cx = x; cx < x + w; cx++) {
                            if (mask.at(cx, y + h) == 0) { valid = false; break; }
                        }
                        if (valid) h++;
                    }
                    
                    // Clear merged area
                    mask.fill(x, y, w, h, 0);
                    
                    // Get block at first position for texture
                    int pos[3] = {0, 0, 0};
                    pos[axis] = slice;
                    pos[u] = x;
                    pos[v] = y;
                    
                    BlockID block = chunk.getBlock(pos[0], pos[1], pos[2]);
                    const auto* bp = registry.get(block);
                    
                    // Texture selection
                    uint32_t tex = 0;
                    if (bp) {
                        if (sign > 0 && axis == 1) tex = bp->top_tex;       // +Y = top
                        else if (sign < 0 && axis == 1) tex = bp->bottom_tex; // -Y = bottom
                        else tex = bp->side_tex;                              // sides
                    }
                    
                    float normal[3] = {(float)(axis == 0 ? sign : 0),
                                       (float)(axis == 1 ? sign : 0),
                                       (float)(axis == 2 ? sign : 0)};
                    
                    float fpos[3] = {(float)pos[0], (float)pos[1], (float)pos[2]};
                    
                    // Adjust position for negative faces (they start at the far side)
                    if (sign < 0) {
                        // For negative faces, we need to shift position
                        // The face is at pos[axis], not pos[axis]+1
                    }
                    
                    addQuad(mesh, fpos, w, h, normal, axis, sign, tex, u, v);
                }
            }
        }
    }
}

} // anonymous namespace

MeshData MeshGenerator::generateChunkMesh(const Chunk& chunk, const BlockRegistry& registry) {
    MeshData mesh;
    
    // Reserve reasonable capacity
    mesh.vertices.reserve(CHUNK_SIZE_X * CHUNK_SIZE_Y * 6 / 3);  // ~ 1/3 of blocks visible
    mesh.indices.reserve(mesh.vertices.capacity() * 6 / 4);
    
    // Process all three axes with both positive and negative faces
    for (int axis = 0; axis < 3; axis++) {
        processAxis(mesh, chunk, axis, nullptr, nullptr, registry);
    }
    
    return mesh;
}

MeshData MeshGenerator::generateChunkMeshWithNeighbors(
    const Chunk& chunk, const BlockRegistry& registry,
    const Chunk* neighbor_px, const Chunk* neighbor_nx,
    const Chunk* neighbor_pz, const Chunk* neighbor_nz)
{
    MeshData mesh;
    
    for (int axis = 0; axis < 3; axis++) {
        // Pass appropriate neighbors based on axis
        processAxis(mesh, chunk, axis, nullptr, nullptr, registry);
    }
    
    return mesh;
}

MeshData MeshGenerator::generateSimpleMesh(const Chunk& chunk, const BlockRegistry& registry) {
    (void)registry;
    MeshData mesh;
    
    for (int x = 0; x < CHUNK_SIZE_X; x++) {
        for (int y = 0; y < CHUNK_SIZE_Y; y++) {
            for (int z = 0; z < CHUNK_SIZE_Z; z++) {
                BlockID block = chunk.getBlock(x, y, z);
                if (block == BLOCK_AIR || block == BLOCK_WATER) continue;
                
                static const int dirs[6][3] = {
                    {1,0,0}, {-1,0,0}, {0,1,0}, {0,-1,0}, {0,0,1}, {0,0,-1}
                };
                
                for (int d = 0; d < 6; d++) {
                    int nx = x + dirs[d][0];
                    int ny = y + dirs[d][1];
                    int nz = z + dirs[d][2];
                    
                    bool exposed = false;
                    if (!Chunk::inBounds(nx, ny, nz)) {
                        exposed = true;
                    } else {
                        BlockID nb = chunk.getBlock(nx, ny, nz);
                        exposed = (nb == BLOCK_AIR || nb == BLOCK_WATER);
                    }
                    if (!exposed) continue;
                    
                    uint32_t tex = 0;
                    if (d == 2) tex = 3;       // top
                    else if (d == 3) tex = 2;   // bottom
                    else tex = 1;               // side
                    
                    float hx = (float)x, hy = (float)y, hz = (float)z;
                    Vertex verts[4];
                    uint32_t idx = (uint32_t)mesh.vertices.size();
                    
                    switch (d) {
                        case 0:
                            verts[0] = {hx+1, hy+1, hz+0, 1,0,0, 0,0, 1, tex};
                            verts[1] = {hx+1, hy+1, hz+1, 1,0,0, 1,0, 1, tex};
                            verts[2] = {hx+1, hy+0, hz+1, 1,0,0, 1,1, 1, tex};
                            verts[3] = {hx+1, hy+0, hz+0, 1,0,0, 0,1, 1, tex};
                            break;
                        case 1:
                            verts[0] = {hx+0, hy+1, hz+1, -1,0,0, 0,0, 1, tex};
                            verts[1] = {hx+0, hy+1, hz+0, -1,0,0, 1,0, 1, tex};
                            verts[2] = {hx+0, hy+0, hz+0, -1,0,0, 1,1, 1, tex};
                            verts[3] = {hx+0, hy+0, hz+1, -1,0,0, 0,1, 1, tex};
                            break;
                        case 2:
                            verts[0] = {hx+0, hy+1, hz+1, 0,1,0, 0,0, 1, tex};
                            verts[1] = {hx+1, hy+1, hz+1, 0,1,0, 1,0, 1, tex};
                            verts[2] = {hx+1, hy+1, hz+0, 0,1,0, 1,1, 1, tex};
                            verts[3] = {hx+0, hy+1, hz+0, 0,1,0, 0,1, 1, tex};
                            break;
                        case 3:
                            verts[0] = {hx+0, hy+0, hz+0, 0,-1,0, 0,0, 1, tex};
                            verts[1] = {hx+1, hy+0, hz+0, 0,-1,0, 1,0, 1, tex};
                            verts[2] = {hx+1, hy+0, hz+1, 0,-1,0, 1,1, 1, tex};
                            verts[3] = {hx+0, hy+0, hz+1, 0,-1,0, 0,1, 1, tex};
                            break;
                        case 4:
                            verts[0] = {hx+0, hy+1, hz+1, 0,0,1, 0,0, 1, tex};
                            verts[1] = {hx+1, hy+1, hz+1, 0,0,1, 1,0, 1, tex};
                            verts[2] = {hx+1, hy+0, hz+1, 0,0,1, 1,1, 1, tex};
                            verts[3] = {hx+0, hy+0, hz+1, 0,0,1, 0,1, 1, tex};
                            break;
                        case 5:
                            verts[0] = {hx+1, hy+1, hz+0, 0,0,-1, 0,0, 1, tex};
                            verts[1] = {hx+0, hy+1, hz+0, 0,0,-1, 1,0, 1, tex};
                            verts[2] = {hx+0, hy+0, hz+0, 0,0,-1, 1,1, 1, tex};
                            verts[3] = {hx+1, hy+0, hz+0, 0,0,-1, 0,1, 1, tex};
                            break;
                    }
                    
                    for (int i = 0; i < 4; i++) mesh.vertices.push_back(verts[i]);
                    mesh.indices.push_back(idx); mesh.indices.push_back(idx+1); mesh.indices.push_back(idx+2);
                    mesh.indices.push_back(idx); mesh.indices.push_back(idx+2); mesh.indices.push_back(idx+3);
                }
            }
        }
    }
    return mesh;
}

MeshData MeshGenerator::generateCrossMesh(const Chunk& chunk, const BlockRegistry& registry) {
    MeshData mesh;
    
    // يتم رسم النباتات على شكل cross (مربعان متقاطعان)
    // هذا يعطي مظهر ثلاثي الأبعاد من جميع الزوايا
    
    for (int x = 0; x < CHUNK_SIZE_X; x++) {
        for (int y = 0; y < CHUNK_SIZE_Y; y++) {
            for (int z = 0; z < CHUNK_SIZE_Z; z++) {
                BlockID block = chunk.getBlock(x, y, z);
                const auto* bp = registry.get(block);
                
                // نرسم cross فقط للبلوكات الشفافة غير الصلبة (النباتات)
                if (!bp || bp->is_solid || !bp->is_transparent) continue;
                if (!bp->is_plant) continue;
                
                uint32_t tex = bp->top_tex;  // Use top texture for the cross
                float hx = (float)x, hy = (float)y, hz = (float)z;
                uint32_t base = (uint32_t)mesh.vertices.size();
                
                // Quad 1:沿着 XZ对角线 (angle 0°)
                // Vertices: (0,0,0) -> (1,1,1) diagonal
                Vertex q1[4];
                q1[0] = {hx+0, hy+1, hz+0, 0,0,1, 0,0, 1.0f, tex};
                q1[1] = {hx+1, hy+1, hz+1, 0,0,1, 1,0, 1.0f, tex};
                q1[2] = {hx+1, hy+0, hz+1, 0,0,1, 1,1, 1.0f, tex};
                q1[3] = {hx+0, hy+0, hz+0, 0,0,1, 0,1, 1.0f, tex};
                
                // Quad 2:沿着另一条对角线 (angle 90°)
                // Vertices: (1,0,0) -> (0,1,1) diagonal
                Vertex q2[4];
                q2[0] = {hx+1, hy+1, hz+0, 1,0,0, 0,0, 1.0f, tex};
                q2[1] = {hx+0, hy+1, hz+1, 1,0,0, 1,0, 1.0f, tex};
                q2[2] = {hx+0, hy+0, hz+1, 1,0,0, 1,1, 1.0f, tex};
                q2[3] = {hx+1, hy+0, hz+0, 1,0,0, 0,1, 1.0f, tex};
                
                for (int i = 0; i < 4; i++) mesh.vertices.push_back(q1[i]);
                mesh.indices.push_back(base);   mesh.indices.push_back(base+1); mesh.indices.push_back(base+2);
                mesh.indices.push_back(base);   mesh.indices.push_back(base+2); mesh.indices.push_back(base+3);
                
                for (int i = 0; i < 4; i++) mesh.vertices.push_back(q2[i]);
                mesh.indices.push_back(base+4); mesh.indices.push_back(base+5); mesh.indices.push_back(base+6);
                mesh.indices.push_back(base+4); mesh.indices.push_back(base+6); mesh.indices.push_back(base+7);
            }
        }
    }
    
    return mesh;
}
