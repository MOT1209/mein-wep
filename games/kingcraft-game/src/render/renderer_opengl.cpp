#include "render/renderer.h"
#include "render/shader.h"

// ============================================================
// OpenGL Renderer Implementation
// ============================================================
#ifdef KC_OPENGL

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

private:
    GLFWwindow* window = nullptr;
    int win_width = 1280, win_height = 720;
    
    Shader shader;
    
    // Matrices
    glm::mat4 view = glm::mat4(1.0f);
    glm::mat4 projection = glm::mat4(1.0f);
    
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
    
    // Load OpenGL functions (glad)
    if (!gladLoadGL(glfwGetProcAddress)) {
        std::cerr << "[OGL] Failed to load GLAD\n";
        return false;
    }
    
    std::cout << "[OGL] OpenGL " << GLVersion.major << "." << GLVersion.minor << "\n";
    
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

void OpenGLRenderer::setTimeOfDay(float t) {
    // t: 0 = midnight, 0.5 = noon, 1 = midnight
    float sun_angle = t * 2.0f * 3.14159f;
    sun_dir = Vec3f(std::cos(sun_angle) * 0.5f, 
                    std::sin(sun_angle) * 0.8f - 0.2f, 
                    std::sin(sun_angle) * 0.3f);
    sun_dir = sun_dir.normalized();
    
    // Adjust colors based on time
    float day_factor = std::max(0.0f, sun_dir.y + 0.1f) / 1.1f;
    sun_color = Vec3f(1.0f, 0.85f + day_factor * 0.15f, 0.7f + day_factor * 0.3f);
    ambient_color = Vec3f(0.1f + day_factor * 0.4f, 0.1f + day_factor * 0.45f, 0.15f + day_factor * 0.45f);
}

void OpenGLRenderer::drawChunk(const Chunk& chunk, const BlockRegistry& registry) {
    const MeshData* mesh = chunk.getMesh();
    if (!mesh || mesh->isEmpty()) return;
    
    glm::mat4 model = glm::translate(glm::mat4(1.0f), 
        glm::vec3(chunk.getCX() * CHUNK_SIZE_X, 0.0f, chunk.getCZ() * CHUNK_SIZE_Z));
    shader.setMat4("uModel", glm::value_ptr(model));
    
    // Upload mesh to GPU
    uploadMesh(*mesh);
    
    // Draw
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

void OpenGLRenderer::generateTextureAtlas() {
    glGenTextures(1, &texture_array);
    glBindTexture(GL_TEXTURE_2D_ARRAY, texture_array);
    
    // Create 32x32 texture array with 16x16 pixels each = 512x512 total
    int layers = atlas_size * atlas_size;
    glTexStorage3D(GL_TEXTURE_2D_ARRAY, 4, GL_RGBA8, texture_size * atlas_size, texture_size * atlas_size, 1);
    
    // Upload simple colored textures (placeholder)
    // اللون حسب رقم البلوك
    std::vector<uint8_t> pixels(texture_size * texture_size * 4);
    for (int layer = 0; layer < layers; layer++) {
        // Generate colored texture for each block
        int r = (layer * 37) % 256;
        int g = (layer * 71) % 256;
        int b = (layer * 113) % 256;
        
        for (int p = 0; p < texture_size * texture_size; p++) {
            // Simple noise/detail
            int noise = ((p * 7 + layer * 13) % 16) - 8;
            pixels[p * 4 + 0] = (uint8_t)std::max(0, std::min(255, r + noise));
            pixels[p * 4 + 1] = (uint8_t)std::max(0, std::min(255, g + noise));
            pixels[p * 4 + 2] = (uint8_t)std::max(0, std::min(255, b + noise));
            pixels[p * 4 + 3] = 255;
        }
        
        glTexSubImage3D(GL_TEXTURE_2D_ARRAY, 0, 0, 0, layer, 
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

#endif // KC_OPENGL
