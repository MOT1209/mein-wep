#include "render/renderer.h"
#include "render/shader.h"

// ============================================================
// OpenGL Renderer Implementation
// ============================================================
#ifdef KC_OPENGL

#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>
#include <glad/gl.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <cstdlib>
#include <iostream>
#include <vector>
#include <unordered_map>

class OpenGLRenderer : public Renderer {
public:
    OpenGLRenderer() = default;
    ~OpenGLRenderer() override { shutdown(); }
    
    bool init(int width, int height, const char* title) override;
    void shutdown() override;
    
    void beginFrame() override;
    void endFrame() override;
    
    void setCamera(const Vec3f& pos, const Vec3f& front, const Vec3f& up) override;
    void setProjection(float fov, float aspect, float near, float far) override;
    
    void drawChunk(const Chunk& chunk, const BlockRegistry& registry) override;
    void drawMesh(const MeshData& mesh, const Vec3f& position) override;
    
    const Frustum& getFrustum() const override { return current_frustum; }
    
    void setSunDirection(const Vec3f& dir) override { sun_dir = dir; }
    void setTimeOfDay(float t) override;
    
    bool shouldClose() override;
    void pollEvents() override;
    
    int getWidth() const override { return win_width; }
    int getHeight() const override { return win_height; }
    
    bool isKeyPressed(int key) const override;
    bool isMouseButtonPressed(int btn) const override;
    void getMousePos(double& x, double& y) const override;
    void drawWireframeBox(const Vec3f& min, const Vec3f& max, 
                           const Vec3f& color, float line_width) override;
    void setMouseGrabbed(bool grabbed) override;
    
    int getDrawCalls() const override { return draw_calls; }
    int getChunksVisible() const override { return chunks_visible; }
    int getChunksTotal() const override { return chunks_total; }
    
    void drawUI(const ItemStack hotbar[9], int selected_slot,
                float health, float hunger, float break_progress) override;

private:
    GLFWwindow* window = nullptr;
    int win_width = 1280, win_height = 720;
    
    Shader shader;
    
    // Matrices
    glm::mat4 view = glm::mat4(1.0f);
    glm::mat4 projection = glm::mat4(1.0f);
    glm::mat4 viewProj = glm::mat4(1.0f);
    Frustum current_frustum;
    
    // Statistics
    int draw_calls = 0;
    int chunks_visible = 0;
    int chunks_total = 0;
    
    // Lights
    Vec3f sun_dir{0.5f, -0.8f, 0.3f};
    Vec3f sun_color{1.0f, 0.95f, 0.85f};
    Vec3f ambient_color{0.3f, 0.35f, 0.4f};
    
    // VAO for block vertices (we use the same VAO for all chunks)
    unsigned int vao = 0;
    unsigned int vbo = 0;
    unsigned int ebo = 0;
    
    // Texture atlas
    unsigned int texture_array = 0;
    int texture_size = 16;  // 16x16 pixels per block face
    int atlas_size = 32;    // 32x32 textures in atlas (1024x1024 total)
    
    void generateTextureAtlas();
    void setupBuffers();
    void uploadMesh(const MeshData& mesh);
    void updateFrustum();
};

// ============================================================
// IMPLEMENTATION
// ============================================================
Renderer* Renderer::create() {
    return new OpenGLRenderer();
}

bool OpenGLRenderer::init(int width, int height, const char* title) {
    win_width = width;
    win_height = height;
    
    // Initialize GLFW
    if (!glfwInit()) {
        std::cerr << "[OGL] Failed to initialize GLFW\n";
        return false;
    }
    
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    
    window = glfwCreateWindow(width, height, title, nullptr, nullptr);
    if (!window) {
        std::cerr << "[OGL] Failed to create window\n";
        glfwTerminate();
        return false;
    }
    
    glfwMakeContextCurrent(window);
    
    // Load runtime GL functions (GL 1.2+: shaders, VAOs, VBOs)
    if (!gladLoadGL(glfwGetProcAddress)) {
        std::cerr << "[OGL] Failed to load GL functions\n";
        return false;
    }
    
    std::cout << "[OGL] OpenGL " << glGetString(GL_VERSION) << "\n";
    
    // Setup shader
    if (!shader.load("shaders/vertex.glsl", "shaders/fragment.glsl")) {
        std::cerr << "[OGL] Failed to load shaders\n";
        return false;
    }
    
    // Setup OpenGL state
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_CULL_FACE);
    glCullFace(GL_BACK);
    glFrontFace(GL_CCW);
    glClearColor(0.6f, 0.7f, 0.85f, 1.0f);
    
    // Generate textures
    generateTextureAtlas();
    
    // Setup buffers
    setupBuffers();
    
    // Set projection
    setProjection(70.0f, (float)width / (float)height, 0.1f, 500.0f);
    
    std::cout << "[OGL] Renderer initialized\n";
    return true;
}

void OpenGLRenderer::shutdown() {
    if (vao) glDeleteVertexArrays(1, &vao);
    if (vbo) glDeleteBuffers(1, &vbo);
    if (ebo) glDeleteBuffers(1, &ebo);
    if (texture_array) glDeleteTextures(1, &texture_array);
    
    if (window) {
        glfwDestroyWindow(window);
        glfwTerminate();
        window = nullptr;
    }
}

void OpenGLRenderer::beginFrame() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    shader.use();
    
    // Update frustum
    updateFrustum();
    
    // Reset statistics
    draw_calls = 0;
    chunks_visible = 0;
    chunks_total = 0;
    
    // Set common uniforms
    shader.setMat4("uView", glm::value_ptr(view));
    shader.setMat4("uProjection", glm::value_ptr(projection));
    shader.setVec3("uSunDir", sun_dir.x, sun_dir.y, sun_dir.z);
    shader.setVec3("uSunColor", sun_color.x, sun_color.y, sun_color.z);
    shader.setVec3("uAmbientColor", ambient_color.x, ambient_color.y, ambient_color.z);
    shader.setFloat("uTime", (float)glfwGetTime());
    
    // Bind texture
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D_ARRAY, texture_array);
    shader.setInt("uTextureArray", 0);
}

void OpenGLRenderer::endFrame() {
    shader.unuse();
    glfwSwapBuffers(window);
}

void OpenGLRenderer::setCamera(const Vec3f& pos, const Vec3f& front, const Vec3f& up) {
    glm::vec3 eye(pos.x, pos.y, pos.z);
    glm::vec3 center(pos.x + front.x, pos.y + front.y, pos.z + front.z);
    glm::vec3 up_v(up.x, up.y, up.z);
    view = glm::lookAt(eye, center, up_v);
}

void OpenGLRenderer::setProjection(float fov, float aspect, float near, float far) {
    projection = glm::perspective(glm::radians(fov), aspect, near, far);
}

// ============================================================
// FRUSTUM CULLING
// ============================================================
Frustum Frustum::fromMatrix(const float* m) {
    Frustum f;
    
    // Extract planes from view-projection matrix
    // Left: m3 + m0, Right: m3 - m0
    // Bottom: m3 + m1, Top: m3 - m1
    // Near: m3 + m2, Far: m3 - m2
    
    auto extractPlane = [&](int row, float sign) -> Plane {
        Plane p;
        p.nx = m[0*4+3] + sign * m[0*4+row];
        p.ny = m[1*4+3] + sign * m[1*4+row];
        p.nz = m[2*4+3] + sign * m[2*4+row];
        p.d  = m[3*4+3] + sign * m[3*4+row];
        // Normalize
        float len = std::sqrt(p.nx*p.nx + p.ny*p.ny + p.nz*p.nz);
        if (len > 0.0001f) {
            p.nx /= len; p.ny /= len; p.nz /= len; p.d /= len;
        }
        return p;
    };
    
    f.planes[0] = extractPlane(0, 1.0f);   // left
    f.planes[1] = extractPlane(0, -1.0f);  // right
    f.planes[2] = extractPlane(1, 1.0f);   // bottom
    f.planes[3] = extractPlane(1, -1.0f);  // top
    f.planes[4] = extractPlane(2, 1.0f);   // near
    f.planes[5] = extractPlane(2, -1.0f);  // far
    
    return f;
}

void OpenGLRenderer::updateFrustum() {
    viewProj = projection * view;
    current_frustum = Frustum::fromMatrix(glm::value_ptr(viewProj));
}

// ============================================================
// TIME OF DAY
// ============================================================
void OpenGLRenderer::setTimeOfDay(float t) {
    float sun_angle = t * 2.0f * 3.14159f;
    sun_dir = Vec3f(std::cos(sun_angle) * 0.5f, 
                    std::sin(sun_angle) * 0.8f - 0.2f, 
                    std::sin(sun_angle) * 0.3f);
    sun_dir = sun_dir.normalized();
    
    float day_factor = std::max(0.0f, sun_dir.y + 0.1f) / 1.1f;
    sun_color = Vec3f(1.0f, 0.85f + day_factor * 0.15f, 0.7f + day_factor * 0.3f);
    ambient_color = Vec3f(0.1f + day_factor * 0.4f, 0.1f + day_factor * 0.45f, 0.15f + day_factor * 0.45f);
}

// ============================================================
// DRAW
// ============================================================
void OpenGLRenderer::drawChunk(const Chunk& chunk, const BlockRegistry& registry) {
    chunks_total++;
    const MeshData* mesh = chunk.getMesh();
    if (!mesh || mesh->isEmpty()) return;
    
    // Frustum culling: check chunk AABB
    Vec3f min{(float)(chunk.getCX() * CHUNK_SIZE_X), 0.0f, (float)(chunk.getCZ() * CHUNK_SIZE_Z)};
    Vec3f max{(float)((chunk.getCX() + 1) * CHUNK_SIZE_X), (float)CHUNK_SIZE_Y, (float)((chunk.getCZ() + 1) * CHUNK_SIZE_Z)};
    
    if (!current_frustum.isBoxVisible(min, max)) return;
    
    chunks_visible++;
    draw_calls++;
    
    glm::mat4 model = glm::translate(glm::mat4(1.0f), 
        glm::vec3(chunk.getCX() * CHUNK_SIZE_X, 0.0f, chunk.getCZ() * CHUNK_SIZE_Z));
    shader.setMat4("uModel", glm::value_ptr(model));
    
    uploadMesh(*mesh);
    
    glBindVertexArray(vao);
    glDrawElements(GL_TRIANGLES, (int)mesh->indices.size(), GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);
}

void OpenGLRenderer::drawMesh(const MeshData& mesh, const Vec3f& position) {
    if (mesh.isEmpty()) return;
    
    glm::mat4 model = glm::translate(glm::mat4(1.0f), glm::vec3(position.x, position.y, position.z));
    shader.setMat4("uModel", glm::value_ptr(model));
    
    uploadMesh(mesh);
    
    glBindVertexArray(vao);
    glDrawElements(GL_TRIANGLES, (int)mesh.indices.size(), GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);
}

bool OpenGLRenderer::shouldClose() {
    return window ? glfwWindowShouldClose(window) : true;
}

void OpenGLRenderer::pollEvents() {
    glfwPollEvents();
}

bool OpenGLRenderer::isKeyPressed(int key) const {
    if (!window) return false;
    return glfwGetKey(window, key) == GLFW_PRESS;
}

bool OpenGLRenderer::isMouseButtonPressed(int btn) const {
    if (!window) return false;
    return glfwGetMouseButton(window, btn) == GLFW_PRESS;
}

void OpenGLRenderer::getMousePos(double& x, double& y) const {
    if (window) glfwGetCursorPos(window, &x, &y);
}

void OpenGLRenderer::setMouseGrabbed(bool grabbed) {
    if (!window) return;
    glfwSetInputMode(window, GLFW_CURSOR, grabbed ? GLFW_CURSOR_DISABLED : GLFW_CURSOR_NORMAL);
}

void OpenGLRenderer::drawWireframeBox(const Vec3f& min, const Vec3f& max,
                                       const Vec3f& color, float line_width) {
    // 12 edges of a cube
    float verts[] = {
        min.x, min.y, min.z,  max.x, min.y, min.z,
        min.x, min.y, min.z,  min.x, max.y, min.z,
        min.x, min.y, min.z,  min.x, min.y, max.z,
        max.x, min.y, min.z,  max.x, max.y, min.z,
        max.x, min.y, min.z,  max.x, min.y, max.z,
        min.x, max.y, min.z,  max.x, max.y, min.z,
        min.x, max.y, min.z,  min.x, max.y, max.z,
        max.x, max.y, min.z,  max.x, max.y, max.z,
        min.x, min.y, max.z,  max.x, min.y, max.z,
        min.x, min.y, max.z,  min.x, max.y, max.z,
        max.x, min.y, max.z,  max.x, max.y, max.z,
        min.x, max.y, max.z,  max.x, max.y, max.z
    };
    
    // Save state
    glDisable(GL_DEPTH_TEST);
    glLineWidth(line_width);
    
    // Use shader
    shader.setMat4("uModel", glm::value_ptr(glm::mat4(1.0f)));
    
    // Simple line drawing via immediate-like method
    // We use the same VAO but with GL_LINES
    unsigned int wire_vbo = 0;
    glGenBuffers(1, &wire_vbo);
    glBindBuffer(GL_ARRAY_BUFFER, wire_vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(verts), verts, GL_DYNAMIC_DRAW);
    
    glBindVertexArray(vao);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);
    glDisableVertexAttribArray(1);  // disable normal
    glDisableVertexAttribArray(2);  // disable uv
    glDisableVertexAttribArray(3);  // disable ao
    glDisableVertexAttribArray(4);  // disable tex
    
    glDrawArrays(GL_LINES, 0, 24);
    
    glDeleteBuffers(1, &wire_vbo);
    
    // Restore state
    glEnable(GL_DEPTH_TEST);
    
    // Re-setup vertex attributes for normal mesh drawing
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)0);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(6 * sizeof(float)));
    glEnableVertexAttribArray(2);
    glVertexAttribPointer(3, 1, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(8 * sizeof(float)));
    glEnableVertexAttribArray(3);
    glVertexAttribIPointer(4, 1, GL_UNSIGNED_INT, sizeof(Vertex), (void*)(9 * sizeof(float)));
    glEnableVertexAttribArray(4);
}

// ============================================================
// PROCEDURAL TEXTURE GENERATION
// توليد القوام إجرائياً — يشبه Minecraft
// ============================================================

// Simple 2D value noise
static float texNoise(int x, int y, int seed) {
    int n = x * 374761393 + y * 668265263 + seed * 1274126177;
    n = (n ^ (n >> 13)) * 1274126177;
    n = n ^ (n >> 16);
    return (float)(n & 0x7fffffff) / (float)0x7fffffff;
}

static float texFbm(float x, float y, int seed, int octaves = 3) {
    float val = 0, amp = 0.5f, freq = 1.0f;
    for (int i = 0; i < octaves; i++) {
        int ix = (int)(x * freq);
        int iy = (int)(y * freq);
        float fx = x * freq - ix;
        float fy = y * freq - iy;
        fx = fx * fx * (3 - 2 * fx);
        fy = fy * fy * (3 - 2 * fy);
        
        float v00 = texNoise(ix, iy, seed + i);
        float v10 = texNoise(ix+1, iy, seed + i);
        float v01 = texNoise(ix, iy+1, seed + i);
        float v11 = texNoise(ix+1, iy+1, seed + i);
        
        float vx0 = v00 + (v10 - v00) * fx;
        float vx1 = v01 + (v11 - v01) * fx;
        val += (vx0 + (vx1 - vx0) * fy) * amp;
        
        amp *= 0.5f;
        freq *= 2.0f;
    }
    return val;
}

// Generate a single 16x16 texture and write to pixels (RGBA)
static void makeTex(uint8_t* pixels, int texId) {
    const int S = 16;  // texture size
    for (int y = 0; y < S; y++) {
        for (int x = 0; x < S; x++) {
            int i = (y * S + x) * 4;
            float fx = (float)x / S;
            float fy = (float)y / S;
            
            int r = 128, g = 128, b = 128;  // default gray
            
            switch (texId) {
                case 0: // Stone top — gray with speckles
                case 1: { // Stone side
                    float n = texFbm(fx * 8, fy * 8, 42);
                    r = (int)(140 + n * 40);
                    g = (int)(130 + n * 35);
                    b = (int)(120 + n * 30);
                    // Specks
                    if (texNoise(x, y, 7) > 0.92f) { r += 30; g += 20; }
                    if (texNoise(x, y, 99) > 0.93f) { r -= 20; g -= 15; b -= 10; }
                    break;
                }
                case 2: { // Dirt — brown with noise
                    float n = texFbm(fx * 6, fy * 6, 1);
                    r = (int)(120 + n * 30);
                    g = (int)(90 + n * 25);
                    b = (int)(55 + n * 20);
                    // Dark spots
                    if (texNoise(x*3, y*3, 5) > 0.85f) { r -= 15; g -= 10; }
                    break;
                }
                case 3: { // Grass top — green with variation
                    float n = texFbm(fx * 8, fy * 8, 3);
                    r = (int)(80 + n * 30);
                    g = (int)(140 + n * 40);
                    b = (int)(50 + n * 25);
                    // Grass speckles
                    if (texNoise(x, y, 33) > 0.85f) { g += 20; r += 5; }
                    break;
                }
                case 4: { // Grass side — green top, dirt bottom
                    float n = texFbm(fx * 6, fy * 8, 4);
                    if (fy > 0.3f) {
                        // Dirt bottom
                        r = (int)(120 + n * 25);
                        g = (int)(90 + n * 20);
                        b = (int)(55 + n * 15);
                    } else {
                        // Green top
                        float t = fy / 0.3f;  // 0 at bottom, 1 at top
                        r = (int)(120 + n * 25 - (120 - 80) * t);
                        g = (int)(90 + n * 20 + (140 - 90) * t);
                        b = (int)(55 + n * 15 - (55 - 50) * t);
                    }
                    break;
                }
                case 5: { // Sand — tan with noise
                    float n = texFbm(fx * 8, fy * 8, 5);
                    r = (int)(210 + n * 25);
                    g = (int)(195 + n * 20);
                    b = (int)(140 + n * 20);
                    // Sandy specks
                    if (texNoise(x*2, y*2, 55) > 0.9f) { r += 15; g += 10; }
                    break;
                }
                case 7: { // Oak log top — rings
                    float cx = fx - 0.5f, cy = fy - 0.5f;
                    float dist = std::sqrt(cx*cx + cy*cy) * 7;
                    int ring = (int)(dist * 2) % 4;
                    float n = texNoise(x, y, 7) * 20;
                    r = (int)(130 + n + (ring < 2 ? 20 : -10));
                    g = (int)(100 + n + (ring < 2 ? 15 : -8));
                    b = (int)(60 + n + (ring < 2 ? 10 : -5));
                    break;
                }
                case 8: { // Oak log side — vertical bark lines
                    float n = texFbm(fx * 4, fy * 12, 8);
                    float stripe = std::abs(std::sin(fy * 3.14159f * 8)) * 20;
                    r = (int)(140 + n * 25 - stripe);
                    g = (int)(115 + n * 20 - stripe);
                    b = (int)(70 + n * 15 - stripe);
                    break;
                }
                case 9: { // Oak planks
                    float n = texNoise(x, y, 9) * 15;
                    // Horizontal plank lines
                    float line = std::abs(std::sin(fy * 3.14159f * 4)) > 0.85f ? -20 : 0;
                    r = (int)(160 + n + line);
                    g = (int)(130 + n + line);
                    b = (int)(80 + n + line);
                    break;
                }
                case 10: { // Oak leaves — dark green with holes
                    float n = texFbm(fx * 10, fy * 10, 10);
                    if (n < 0.3f) {
                        // Hole (transparent-like, use very dark)
                        r = 0; g = 48; b = 0;
                    } else {
                        r = (int)(40 + n * 40);
                        g = (int)(100 + n * 50);
                        b = (int)(25 + n * 25);
                    }
                    break;
                }
                case 11: { // Cobblestone
                    float n = texFbm(fx * 6, fy * 6, 11);
                    r = (int)(130 + n * 30);
                    g = (int)(120 + n * 25);
                    b = (int)(110 + n * 20);
                    // Cobble patterns
                    int gx = (int)(fx * 4);
                    int gy = (int)(fy * 4);
                    if ((gx + gy) % 3 == 1) {
                        // Mortar lines
                        float lx = std::abs(fx * 4 - gx - 0.5f);
                        float ly = std::abs(fy * 4 - gy - 0.5f);
                        if (lx > 0.35f || ly > 0.35f) {
                            r -= 20; g -= 15; b -= 10;
                        }
                    }
                    break;
                }
                case 12: { // Bedrock — very dark with cracks
                    float n = texFbm(fx * 5, fy * 5, 12);
                    r = (int)(60 + n * 30);
                    g = (int)(55 + n * 25);
                    b = (int)(50 + n * 20);
                    // Cracks
                    if (texNoise(x*3, y*3, 121) > 0.95f) { r += 30; g += 25; b += 20; }
                    break;
                }
                case 13: { // Snow — white with slight blue
                    float n = texFbm(fx * 8, fy * 8, 13);
                    r = (int)(230 + n * 15);
                    g = (int)(235 + n * 12);
                    b = (int)(245 + n * 8);
                    // Sparkle
                    if (texNoise(x, y, 131) > 0.95f) { r += 15; g += 15; b += 20; }
                    break;
                }
                case 14: { // Ice — light blue translucent
                    float n = texFbm(fx * 6, fy * 6, 14);
                    r = (int)(140 + n * 20);
                    g = (int)(180 + n * 20);
                    b = (int)(220 + n * 25);
                    break;
                }
                case 15: { // Sandstone
                    float n = texFbm(fx * 5, fy * 5, 15);
                    r = (int)(200 + n * 25);
                    g = (int)(185 + n * 20);
                    b = (int)(140 + n * 15);
                    // Sandy speckles
                    if (texNoise(x, y, 151) > 0.85f) { r += 20; g += 15; }
                    break;
                }
                case 16: { // Cactus — green with spine dots
                    float n = texFbm(fx * 6, fy * 8, 16);
                    r = (int)(40 + n * 20);
                    g = (int)(100 + n * 30);
                    b = (int)(30 + n * 15);
                    // Spine dot pattern
                    int dx = (int)(fx * 8) % 2;
                    int dy = (int)(fy * 8) % 2;
                    if (dx == 0 && dy == 0 && texNoise(x, y, 161) > 0.7f) { 
                        r += 20; g += 25; 
                    }
                    break;
                }
                case 18: { // Dead bush — brown
                    float n = texFbm(fx * 8, fy * 8, 18);
                    r = (int)(110 + n * 25);
                    g = (int)(85 + n * 20);
                    b = (int)(45 + n * 15);
                    break;
                }
                case 19: { // Flower — pink/yellow
                    float n = texFbm(fx * 8, fy * 8, 19);
                    r = (int)(200 + n * 30);
                    g = (int)(100 + n * 30);
                    b = (int)(160 + n * 30);
                    break;
                }
                case 20: { // Tall grass — green (also used for wheat young)
                    float n = texFbm(fx * 8, fy * 8, 20);
                    r = (int)(70 + n * 25);
                    g = (int)(130 + n * 35);
                    b = (int)(40 + n * 20);
                    break;
                }
                case 26: { // Wheat crop — green/yellow based on growth
                    float n = texFbm(fx * 6, fy * 6, 26);
                    r = (int)(160 + n * 30);  // golden
                    g = (int)(140 + n * 25);
                    b = (int)(40 + n * 20);
                    break;
                }
                case 27: { // Wheat mature — golden
                    float n = texFbm(fx * 6, fy * 6, 27);
                    r = (int)(200 + n * 30);  // more golden
                    g = (int)(175 + n * 25);
                    b = (int)(50 + n * 20);
                    break;
                }
                case 21: { // Coarse dirt — coarse brown
                    float n = texFbm(fx * 5, fy * 5, 21);
                    r = (int)(110 + n * 35);
                    g = (int)(80 + n * 30);
                    b = (int)(50 + n * 20);
                    // Gravel chunks
                    if (texNoise(x*2, y*2, 211) > 0.88f) { r += 25; g += 20; b += 10; }
                    break;
                }
                case 22: { // Podzol top — light brown with needles
                    float n = texFbm(fx * 6, fy * 6, 22);
                    r = (int)(140 + n * 25);
                    g = (int)(100 + n * 20);
                    b = (int)(50 + n * 15);
                    // Pine needle pattern
                    if (texNoise(x, y, 221) > 0.85f) { 
                        r -= 10; g -= 5; 
                    }
                    break;
                }
                case 23: { // Spruce log top — darker rings
                    float cx = fx - 0.5f, cy = fy - 0.5f;
                    float dist = std::sqrt(cx*cx + cy*cy) * 7;
                    int ring = (int)(dist * 2) % 4;
                    float n = texNoise(x, y, 23) * 15;
                    r = (int)(100 + n + (ring < 2 ? 15 : -15));
                    g = (int)(75 + n + (ring < 2 ? 12 : -10));
                    b = (int)(40 + n + (ring < 2 ? 8 : -8));
                    break;
                }
                case 24: { // Spruce log side — dark bark
                    float n = texFbm(fx * 4, fy * 12, 24);
                    float stripe = std::abs(std::sin(fy * 3.14159f * 6)) * 25;
                    r = (int)(90 + n * 20 - stripe);
                    g = (int)(70 + n * 15 - stripe);
                    b = (int)(40 + n * 10 - stripe);
                    break;
                }
                case 25: { // Spruce leaves — very dark green
                    float n = texFbm(fx * 10, fy * 10, 25);
                    if (n < 0.25f) {
                        r = 0; g = 30; b = 0;
                    } else {
                        r = (int)(25 + n * 30);
                        g = (int)(70 + n * 40);
                        b = (int)(15 + n * 20);
                    }
                    break;
                }
                case 31: { // Water — blue
                    float n = texFbm(fx * 6, fy * 6, 31);
                    r = (int)(50 + n * 20);
                    g = (int)(70 + n * 25);
                    b = (int)(180 + n * 40);
                    break;
                }
                default: { // Default — colored noise based on ID
                    float n = texFbm(fx * 6, fy * 6, texId * 17);
                    r = (int)(((texId * 37) % 200) + n * 40);
                    g = (int)(((texId * 71) % 200) + n * 35);
                    b = (int)(((texId * 113) % 200) + n * 30);
                    break;
                }
            }
            
            pixels[i + 0] = (uint8_t)std::max(0, std::min(255, r));
            pixels[i + 1] = (uint8_t)std::max(0, std::min(255, g));
            pixels[i + 2] = (uint8_t)std::max(0, std::min(255, b));
            pixels[i + 3] = 255;
        }
    }
}

void OpenGLRenderer::generateTextureAtlas() {
    glGenTextures(1, &texture_array);
    glBindTexture(GL_TEXTURE_2D_ARRAY, texture_array);
    
    // Create texture array: each layer = 16x16, one layer per block type
    int max_tex_needed = 32;  // textures 0-31 are used
    glTexStorage3D(GL_TEXTURE_2D_ARRAY, 4, GL_RGBA8, 
                   texture_size, texture_size, max_tex_needed);
    
    // Generate procedural textures for all required indices
    std::vector<uint8_t> pixels(texture_size * texture_size * 4);
    for (int idx = 0; idx < max_tex_needed; idx++) {
        makeTex(pixels.data(), idx);
        glTexSubImage3D(GL_TEXTURE_2D_ARRAY, 0, 0, 0, idx,
                        texture_size, texture_size, 1, GL_RGBA, GL_UNSIGNED_BYTE, pixels.data());
    }
    
    glTexParameteri(GL_TEXTURE_2D_ARRAY, GL_TEXTURE_MIN_FILTER, GL_NEAREST_MIPMAP_NEAREST);
    glTexParameteri(GL_TEXTURE_2D_ARRAY, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D_ARRAY, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D_ARRAY, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glGenerateMipmap(GL_TEXTURE_2D_ARRAY);
}

void OpenGLRenderer::setupBuffers() {
    glGenVertexArrays(1, &vao);
    glGenBuffers(1, &vbo);
    glGenBuffers(1, &ebo);
    
    glBindVertexArray(vao);
    
    // We'll upload data each frame (for now)
    // VBO
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    
    // Position (3 floats)
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)0);
    glEnableVertexAttribArray(0);
    
    // Normal (3 floats)
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);
    
    // UV (2 floats)
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(6 * sizeof(float)));
    glEnableVertexAttribArray(2);
    
    // AO (1 float)
    glVertexAttribPointer(3, 1, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(8 * sizeof(float)));
    glEnableVertexAttribArray(3);
    
    // Texture (1 uint)
    glVertexAttribIPointer(4, 1, GL_UNSIGNED_INT, sizeof(Vertex), (void*)(9 * sizeof(float)));
    glEnableVertexAttribArray(4);
    
    // EBO
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
    
    glBindVertexArray(0);
}

void OpenGLRenderer::uploadMesh(const MeshData& mesh) {
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, 
                 mesh.vertices.size() * sizeof(Vertex), 
                 mesh.vertices.data(), 
                 GL_DYNAMIC_DRAW);
    
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, 
                 mesh.indices.size() * sizeof(uint32_t), 
                 mesh.indices.data(), 
                 GL_DYNAMIC_DRAW);
}

// ============================================================
// UI DRAWING — واجهة المستخدم
// ============================================================
void OpenGLRenderer::drawUI(const ItemStack hotbar[9], int selected_slot,
                             float health, float hunger, float break_progress) {
    // Save state
    GLboolean prev_depth_test = glIsEnabled(GL_DEPTH_TEST);
    GLboolean prev_cull_face = glIsEnabled(GL_CULL_FACE);
    GLboolean prev_blend = glIsEnabled(GL_BLEND);
    
    glDisable(GL_DEPTH_TEST);
    glDisable(GL_CULL_FACE);
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    
    // Orthographic projection
    float w = (float)win_width;
    float h = (float)win_height;
    // Use simple ortho: left=0, right=w, bottom=0, top=h
    float ortho[16] = {
        2.0f/w, 0, 0, 0,
        0, 2.0f/h, 0, 0,
        0, 0, -2.0f/1000.0f, 0,
        -1, -1, -1, 1
    };
    
    shader.setMat4("uProjection", ortho);
    shader.setMat4("uView", glm::value_ptr(glm::mat4(1.0f)));
    shader.setMat4("uModel", glm::value_ptr(glm::mat4(1.0f)));
    shader.setVec3("uSunDir", 0, 0, 0);
    shader.setVec3("uSunColor", 1, 1, 1);
    shader.setVec3("uAmbientColor", 1, 1, 1);
    shader.setFloat("uTime", 0);
    
    // Use a simple VBO for UI quads
    auto drawQuad = [&](float x, float y, float qw, float qh, float r, float g, float b, float a) {
        float verts[] = {
            x,   y,   0,  r, g, b, 0, 0, 0, 0,
            x+qw, y,   0,  r, g, b, 0, 0, 0, 0,
            x+qw, y+qh, 0,  r, g, b, 0, 0, 0, 0,
            x,   y+qh, 0,  r, g, b, 0, 0, 0, 0
        };
        unsigned int idx[] = {0, 1, 2, 0, 2, 3};
        
        unsigned int ui_vbo = 0, ui_ebo = 0;
        glGenBuffers(1, &ui_vbo);
        glGenBuffers(1, &ui_ebo);
        
        glBindBuffer(GL_ARRAY_BUFFER, ui_vbo);
        glBufferData(GL_ARRAY_BUFFER, sizeof(verts), verts, GL_DYNAMIC_DRAW);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ui_ebo);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(idx), idx, GL_DYNAMIC_DRAW);
        
        glBindVertexArray(vao);
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 10 * sizeof(float), (void*)0);
        glEnableVertexAttribArray(0);
        glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 10 * sizeof(float), (void*)(3 * sizeof(float)));
        glEnableVertexAttribArray(1);
        glDisableVertexAttribArray(2);
        glDisableVertexAttribArray(3);
        glDisableVertexAttribArray(4);
        
        glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
        
        glDeleteBuffers(1, &ui_vbo);
        glDeleteBuffers(1, &ui_ebo);
    };
    
    auto drawLine = [&](float x1, float y1, float x2, float y2, float r, float g, float b, float a) {
        float verts[] = {
            x1, y1, 0,  r, g, b,
            x2, y2, 0,  r, g, b
        };
        unsigned int ui_vbo = 0;
        glGenBuffers(1, &ui_vbo);
        glBindBuffer(GL_ARRAY_BUFFER, ui_vbo);
        glBufferData(GL_ARRAY_BUFFER, sizeof(verts), verts, GL_DYNAMIC_DRAW);
        
        glBindVertexArray(vao);
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)0);
        glEnableVertexAttribArray(0);
        glDisableVertexAttribArray(1);
        glDisableVertexAttribArray(2);
        glDisableVertexAttribArray(3);
        glDisableVertexAttribArray(4);
        
        glDrawArrays(GL_LINES, 0, 2);
        glDeleteBuffers(1, &ui_vbo);
    };
    
    // === 1. CROSSHAIR (تصويب) ===
    float cx = w / 2.0f;
    float cy = h / 2.0f;
    float cs = 10.0f;
    float cw = 2.0f;
    drawLine(cx - cs, cy, cx - cw, cy, 1, 1, 1, 0.8f);
    drawLine(cx + cw, cy, cx + cs, cy, 1, 1, 1, 0.8f);
    drawLine(cx, cy - cs, cx, cy - cw, 1, 1, 1, 0.8f);
    drawLine(cx, cy + cw, cx, cy + cs, 1, 1, 1, 0.8f);
    
    // === 2. HOTBAR (الشريط السفلي) ===
    float slot_size = 40.0f;
    float gap = 4.0f;
    float hotbar_w = 9.0f * slot_size + 8.0f * gap;
    float hotbar_x = (w - hotbar_w) / 2.0f;
    float hotbar_y = 20.0f;
    
    // Background
    drawQuad(hotbar_x - 4, hotbar_y - 4, hotbar_w + 8, slot_size + 8, 0.1f, 0.1f, 0.1f, 0.7f);
    
    for (int i = 0; i < 9; i++) {
        float sx = hotbar_x + i * (slot_size + gap);
        float sy = hotbar_y;
        
        // Slot background
        if (i == selected_slot) {
            // Selected slot: white border
            drawQuad(sx - 2, sy - 2, slot_size + 4, slot_size + 4, 1.0f, 1.0f, 1.0f, 0.9f);
        }
        float bg = (i == selected_slot) ? 0.3f : 0.2f;
        drawQuad(sx, sy, slot_size, slot_size, bg, bg, bg, 0.85f);
        
        // Item in slot
        if (hotbar[i].item_id != 0 && hotbar[i].count > 0) {
            // Color based on item type
            float ir = 0.5f, ig = 0.5f, ib = 0.5f;
            uint16_t id = hotbar[i].item_id;
            
            // Generate color from item ID for visual distinction
            ir = ((id * 37) % 256) / 255.0f;
            ig = ((id * 71) % 256) / 255.0f;
            ib = ((id * 113) % 256) / 255.0f;
            
            float pad = 4.0f;
            drawQuad(sx + pad, sy + pad, slot_size - 2*pad, slot_size - 2*pad, ir, ig, ib, 0.9f);
            
            // Draw count as simple vertical indicator at top-right of slot
            int count = hotbar[i].count;
            if (count > 1) {
                // Small bar at top-right for count
                float bar_h = std::min((float)count / 64.0f * slot_size, slot_size * 0.8f);
                drawQuad(sx + slot_size - 6, sy + slot_size - bar_h - 2, 4, bar_h, 1.0f, 1.0f, 0.3f, 0.7f);
            }
        }
    }
    
    // === 3. HEALTH (صحة) ===
    float bar_x = 20.0f;
    float bar_y = 20.0f;
    float heart_size = 16.0f;
    float heart_gap = 2.0f;
    int hearts = 10;  // 20 HP = 10 hearts
    
    for (int i = 0; i < hearts; i++) {
        float hx = bar_x + i * (heart_size + heart_gap);
        float hy = bar_y;
        float hp_val = health - (float)(i * 2);
        
        if (hp_val >= 2.0f) {
            // Full heart
            drawQuad(hx, hy, heart_size, heart_size, 1.0f, 0.1f, 0.1f, 0.9f);
        } else if (hp_val >= 1.0f) {
            // Half heart
            drawQuad(hx, hy, heart_size / 2.0f, heart_size, 1.0f, 0.1f, 0.1f, 0.9f);
            drawQuad(hx + heart_size / 2.0f, hy, heart_size / 2.0f, heart_size, 0.2f, 0.2f, 0.2f, 0.7f);
        } else {
            // Empty heart
            drawQuad(hx, hy, heart_size, heart_size, 0.2f, 0.2f, 0.2f, 0.7f);
        }
        
        // Heart outline
        drawLine(hx, hy, hx + heart_size, hy, 0.5f, 0.0f, 0.0f, 0.5f);
        drawLine(hx + heart_size, hy, hx + heart_size, hy + heart_size, 0.5f, 0.0f, 0.0f, 0.5f);
        drawLine(hx + heart_size, hy + heart_size, hx, hy + heart_size, 0.5f, 0.0f, 0.0f, 0.5f);
        drawLine(hx, hy + heart_size, hx, hy, 0.5f, 0.0f, 0.0f, 0.5f);
    }
    
    // === 4. HUNGER (جوع) ===
    float hunger_y = bar_y + heart_size + 4.0f;
    for (int i = 0; i < hearts; i++) {
        float hx = bar_x + i * (heart_size + heart_gap);
        float hy = hunger_y;
        float hunger_val = hunger - (float)(i * 2);
        
        if (hunger_val >= 2.0f) {
            drawQuad(hx, hy, heart_size, heart_size, 1.0f, 0.8f, 0.2f, 0.9f);  // gold
        } else if (hunger_val >= 1.0f) {
            drawQuad(hx, hy, heart_size / 2.0f, heart_size, 1.0f, 0.8f, 0.2f, 0.9f);
            drawQuad(hx + heart_size / 2.0f, hy, heart_size / 2.0f, heart_size, 0.2f, 0.2f, 0.2f, 0.7f);
        } else {
            drawQuad(hx, hy, heart_size, heart_size, 0.2f, 0.2f, 0.2f, 0.7f);
        }
        
        drawLine(hx, hy, hx + heart_size, hy, 0.6f, 0.5f, 0.1f, 0.5f);
        drawLine(hx + heart_size, hy, hx + heart_size, hy + heart_size, 0.6f, 0.5f, 0.1f, 0.5f);
        drawLine(hx + heart_size, hy + heart_size, hx, hy + heart_size, 0.6f, 0.5f, 0.1f, 0.5f);
        drawLine(hx, hy + heart_size, hx, hy, 0.6f, 0.5f, 0.1f, 0.5f);
    }
    
    // === 5. BREAK PROGRESS (تقدم الكسر) ===
    if (break_progress > 0.0f) {
        // Draw white arc at bottom of screen — simple bar instead
        float bw = 100.0f;
        float bh = 6.0f;
        float bx = (w - bw) / 2.0f;
        float by = hotbar_y + slot_size + 16.0f;
        
        // Background
        drawQuad(bx, by, bw, bh, 0.1f, 0.1f, 0.1f, 0.6f);
        // Progress
        drawQuad(bx, by, bw * break_progress, bh, 1.0f, 1.0f, 1.0f, 0.8f);
    }
    
    // === Restore VAO state for mesh drawing ===
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)0);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(6 * sizeof(float)));
    glEnableVertexAttribArray(2);
    glVertexAttribPointer(3, 1, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)(8 * sizeof(float)));
    glEnableVertexAttribArray(3);
    glVertexAttribIPointer(4, 1, GL_UNSIGNED_INT, sizeof(Vertex), (void*)(9 * sizeof(float)));
    glEnableVertexAttribArray(4);
    
    // Restore state
    if (prev_depth_test) glEnable(GL_DEPTH_TEST); else glDisable(GL_DEPTH_TEST);
    if (prev_cull_face) glEnable(GL_CULL_FACE); else glDisable(GL_CULL_FACE);
    if (!prev_blend) glDisable(GL_BLEND);
}

#endif // KC_OPENGL
