#ifndef KINGCRAFT_RENDERER_H
#define KINGCRAFT_RENDERER_H

#include "core/types.h"
#include "world/chunk.h"
#include "world/block_registry.h"
#include "game/items.h"
#include <array>
#include <string>

// ============================================================
// FRUSTUM — هرم الرؤية (Frustum Culling)
// ============================================================
struct Plane {
    float nx, ny, nz, d;  // normal + distance
    
    float distance(const Vec3f& point) const {
        return nx * point.x + ny * point.y + nz * point.z + d;
    }
};

struct Frustum {
    Plane planes[6];  // left, right, bottom, top, near, far
    
    // Check if a box is inside the frustum
    bool isBoxVisible(const Vec3f& min, const Vec3f& max) const {
        for (int i = 0; i < 6; i++) {
            const Plane& p = planes[i];
            
            // Find the point of the box closest to the plane (p-n vertex)
            float px = p.nx > 0 ? max.x : min.x;
            float py = p.ny > 0 ? max.y : min.y;
            float pz = p.nz > 0 ? max.z : min.z;
            
            // If the closest point is outside the plane, box is invisible
            if (p.distance({px, py, pz}) < 0) return false;
        }
        return true;
    }
    
    // Extract frustum from view-projection matrix
    static Frustum fromMatrix(const float* m);  // m = 16 floats, column-major
};

// ============================================================
// RENDERER INTERFACE
// ============================================================
class Renderer {
public:
    Renderer() = default;
    virtual ~Renderer() = default;
    
    Renderer(const Renderer&) = delete;
    Renderer& operator=(const Renderer&) = delete;
    
    // === INIT ===
    virtual bool init(int width, int height, const char* title) = 0;
    virtual void shutdown() = 0;
    
    // === FRAME ===
    virtual void beginFrame() = 0;
    virtual void endFrame() = 0;
    
    // === CAMERA ===
    virtual void setCamera(const Vec3f& pos, const Vec3f& front, const Vec3f& up) = 0;
    virtual void setProjection(float fov, float aspect, float near, float far) = 0;
    virtual const Frustum& getFrustum() const = 0;  // current frustum for culling
    
    // === DRAW ===
    virtual void drawChunk(const Chunk& chunk, const BlockRegistry& registry) = 0;
    virtual void drawMesh(const MeshData& mesh, const Vec3f& position) = 0;
    
    // === WIREFRAME ===
    virtual void drawWireframeBox(const Vec3f& min, const Vec3f& max, 
                                   const Vec3f& color, float line_width) = 0;
    
    // === LIGHTING ===
    virtual void setSunDirection(const Vec3f& dir) = 0;
    virtual void setTimeOfDay(float t) = 0;
    
    // === WINDOW ===
    virtual bool shouldClose() = 0;
    virtual void pollEvents() = 0;
    virtual int getWidth() const = 0;
    virtual int getHeight() const = 0;
    
    // === INPUT ===
    virtual bool isKeyPressed(int key) const = 0;
    virtual bool isMouseButtonPressed(int btn) const = 0;
    virtual void getMousePos(double& x, double& y) const = 0;
    virtual void setMouseGrabbed(bool grabbed) = 0;
    
    // === STATS ===
    virtual int getDrawCalls() const = 0;
    virtual int getChunksVisible() const = 0;
    virtual int getChunksTotal() const = 0;
    
    // === UI ===
    // رسم الواجهة: hotbar (9 slots), health (0-20), hunger (0-20), selected slot, break progress
    virtual void drawUI(const ItemStack hotbar[9], int selected_slot,
                        float health, float hunger, float break_progress) = 0;
    
    // === FACTORY ===
    static Renderer* create();
};

#endif // KINGCRAFT_RENDERER_H
