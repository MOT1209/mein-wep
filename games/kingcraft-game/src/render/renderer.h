#ifndef KINGCRAFT_RENDERER_H
#define KINGCRAFT_RENDERER_H

#include "core/types.h"
#include "world/chunk.h"
#include "world/block_registry.h"

// ============================================================
// RENDERER INTERFACE — كل ما يحتاجه الريندرر
// ============================================================
class Renderer {
public:
    Renderer() = default;
    virtual ~Renderer() = default;
    
    // منع النسخ
    Renderer(const Renderer&) = delete;
    Renderer& operator=(const Renderer&) = delete;
    
    // التهيئة
    virtual bool init(int width, int height, const char* title) = 0;
    virtual void shutdown() = 0;
    
    // الإطار
    virtual void beginFrame() = 0;
    virtual void endFrame() = 0;
    
    // الكاميرا
    virtual void setCamera(const Vec3f& pos, const Vec3f& front, const Vec3f& up) = 0;
    virtual void setProjection(float fov, float aspect, float near, float far) = 0;
    
    // الرسم
    virtual void drawChunk(const Chunk& chunk, const BlockRegistry& registry) = 0;
    virtual void drawMesh(const MeshData& mesh, const Vec3f& position) = 0;
    
    // Wireframe — صندوق أبيض حول البلوك المحدد
    virtual void drawWireframeBox(const Vec3f& min, const Vec3f& max, 
                                   const Vec3f& color, float line_width) = 0;
    
    // الإضاءة
    virtual void setSunDirection(const Vec3f& dir) = 0;
    virtual void setTimeOfDay(float t) = 0;  // 0-1
    
    // النافذة
    virtual bool shouldClose() = 0;
    virtual void pollEvents() = 0;
    virtual int getWidth() const = 0;
    virtual int getHeight() const = 0;
    
    // الإدخال (أو نضعه في نظام منفصل)
    virtual bool isKeyPressed(int key) const = 0;
    virtual bool isMouseButtonPressed(int btn) const = 0;
    virtual void getMousePos(double& x, double& y) const = 0;
    virtual void setMouseGrabbed(bool grabbed) = 0;
    
    // صنع الريندرر المناسب
    static Renderer* create();
};

#endif // KINGCRAFT_RENDERER_H
