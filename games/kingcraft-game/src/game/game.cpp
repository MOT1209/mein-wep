#include "game/game.h"
#include "game/player.h"
#include "world/chunk.h"
#include "world/world_gen.h"
#include "world/block_registry.h"
#include "world/mesh_gen.h"
#include "render/renderer.h"
#include <GLFW/glfw3.h>
#include <iostream>
#include <chrono>

Game::Game() = default;
Game::~Game() = default;

bool Game::init(int width, int height, const char* title, uint64_t seed) {
    std::cout << "[Game] Initializing...\n";
    
    // Create renderer
    renderer.reset(Renderer::create());
    if (!renderer->init(width, height, title)) {
        std::cerr << "[Game] Failed to init renderer\n";
        return false;
    }
    
    // Init block registry
    block_registry.init();
    
    // Init world generator
    world_gen = std::make_unique<WorldGenerator>(seed);
    
    // Init player — will be positioned after world gen
    player = Player();
    player.setGameMode(GameMode::CREATIVE);
    
    // Initial chunk load
    int pcx = ChunkManager::toChunkPos((int)player.getPosition().x);
    int pcz = ChunkManager::toChunkPos((int)player.getPosition().z);
    
    std::cout << "[Game] Generating initial chunks...\n";
    world.updateViewDistance(pcx, pcz, 8);  // start with 8 chunk view
    
    // Generate chunks
    world.forEachLoaded([&](Chunk& chunk) {
        world_gen->generate(chunk);
    });
    
    // Build initial meshes
    world.forEachLoaded([&](Chunk& chunk) {
        auto mesh = std::make_unique<MeshData>(
            MeshGenerator::generateChunkMesh(chunk, block_registry)
        );
        chunk.setMesh(std::move(mesh));
    });
    
    // Position player at surface
    int spawn_y = 63;  // fallback
    for (int y = CHUNK_SIZE_Y - 1; y >= 0; y--) {
        BlockID b = world.getWorldBlock(0, y, 0);
        if (b != BLOCK_AIR && b != BLOCK_WATER) {
            spawn_y = y + 2;
            break;
        }
    }
    player.setPosition({0.5f, (float)spawn_y, 0.5f});
    
    // Set mouse grab
    renderer->setMouseGrabbed(true);
    
    running = true;
    std::cout << "[Game] Initialized successfully!\n";
    return true;
}

void Game::run() {
    auto last_time = std::chrono::high_resolution_clock::now();
    double accumulator = 0.0;
    const double fixed_dt = 1.0 / 60.0;
    
    std::cout << "[Game] Entering main loop...\n";
    
    while (running && !renderer->shouldClose()) {
        auto current_time = std::chrono::high_resolution_clock::now();
        double delta_time = std::chrono::duration<double>(current_time - last_time).count();
        last_time = current_time;
        
        // Cap delta time
        if (delta_time > 0.1) delta_time = 0.1;
        
        // Handle events
        renderer->pollEvents();
        handleEvents();
        
        // Fixed timestep
        accumulator += delta_time;
        int steps = 0;
        while (accumulator >= fixed_dt && steps < 4) {
            update((float)fixed_dt);
            accumulator -= fixed_dt;
            steps++;
        }
        
        // Render
        render();
    }
    
    shutdown();
}

void Game::shutdown() {
    running = false;
    if (renderer) renderer->shutdown();
    renderer.reset();
    std::cout << "[Game] Shutdown complete.\n";
}

void Game::handleEvents() {
    // ESC to exit
    if (renderer->isKeyPressed(GLFW_KEY_ESCAPE)) {
        running = false;
        return;
    }
    
    // Movement keys
    input.w = renderer->isKeyPressed(GLFW_KEY_W);
    input.s = renderer->isKeyPressed(GLFW_KEY_S);
    input.a = renderer->isKeyPressed(GLFW_KEY_A);
    input.d = renderer->isKeyPressed(GLFW_KEY_D);
    input.space = renderer->isKeyPressed(GLFW_KEY_SPACE);
    input.shift = renderer->isKeyPressed(GLFW_KEY_LEFT_SHIFT);
    
    // Mouse clicks (edge triggered)
    bool left = renderer->isMouseButtonPressed(GLFW_MOUSE_BUTTON_LEFT);
    bool right = renderer->isMouseButtonPressed(GLFW_MOUSE_BUTTON_RIGHT);
    
    input.left_clicked = left && !input.left_click;
    input.right_clicked = right && !input.right_click;
    input.left_click = left;
    input.right_click = right;
    
    // Mouse movement (for camera)
    double mx, my;
    renderer->getMousePos(mx, my);
    double dx = mx - input.mouse_x;
    double dy = my - input.mouse_y;
    input.mouse_x = mx;
    input.mouse_y = my;
    
    // Apply mouse to player rotation
    float sensitivity = 0.15f;
    player.setRotation(
        player.getYaw() + (float)(dx * sensitivity),
        std::max(-89.0f, std::min(89.0f, player.getPitch() - (float)(dy * sensitivity)))
    );
    
    // Number keys for hotbar
    for (int i = 0; i < 9; i++) {
        if (renderer->isKeyPressed(GLFW_KEY_1 + i)) {
            player.setSelectedSlot(i);
        }
    }
}

void Game::update(float delta_time) {
    // Update player
    player.handleInput(input.w, input.s, input.a, input.d, input.space, input.shift);
    player.update(delta_time, world);
    
    // Handle clicks
    if (input.left_clicked) {
        player.clickBlock(world, true);  // break
    }
    if (input.right_clicked) {
        player.clickBlock(world, false);  // place
    }
    
    // Update time of day
    time_of_day += delta_time * (1.0f / 1200.0f);  // full day = 20 min
    if (time_of_day > 1.0f) time_of_day -= 1.0f;
    renderer->setTimeOfDay(0.5f);  // noon for testing
    
    // Update chunks based on player position
    updateChunks();
    
    // Rebuild dirty meshes
    rebuildChunkMeshes();
}

void Game::updateChunks() {
    Vec3f pos = player.getPosition();
    int pcx = ChunkManager::toChunkPos((int)pos.x);
    int pcz = ChunkManager::toChunkPos((int)pos.z);
    
    // Load/unload chunks
    world.updateViewDistance(pcx, pcz, 8);
    
    // Generate new chunks
    world.forEachLoaded([&](Chunk& chunk) {
        if (!chunk.isLoaded()) return;
        // Check if this chunk needs generation (all air)
        if (chunk.getBlock(0, 63, 0) == BLOCK_AIR && chunk.getBlock(16, 63, 16) == BLOCK_AIR) {
            world_gen->generate(chunk);
        }
    });
}

void Game::rebuildChunkMeshes() {
    // For each dirty chunk, rebuild mesh
    world.forEachLoaded([&](Chunk& chunk) {
        if (chunk.isDirty() && chunk.isLoaded()) {
            auto mesh = std::make_unique<MeshData>(
                MeshGenerator::generateChunkMesh(chunk, block_registry)
            );
            chunk.setMesh(std::move(mesh));
        }
    });
}

void Game::render() {
    renderer->beginFrame();
    
    // Set camera
    Vec3f pos = player.getPosition();
    pos.y += 1.6f;  // eye height
    renderer->setCamera(pos, player.getFront(), player.getUp());
    
    // Draw chunks
    world.forEachLoaded([&](Chunk& chunk) {
        if (chunk.getMesh() && !chunk.getMesh()->isEmpty()) {
            renderer->drawChunk(chunk, block_registry);
        }
    });
    
    // Draw selection wireframe
    const auto& target = player.getTargetBlock();
    if (target.hit) {
        Vec3f min{(float)target.block_pos.x, (float)target.block_pos.y, (float)target.block_pos.z};
        Vec3f max{(float)(target.block_pos.x + 1), (float)(target.block_pos.y + 1), (float)(target.block_pos.z + 1)};
        renderer->drawWireframeBox(min, max, {0.0f, 0.0f, 0.0f}, 2.0f);
    }
    
    renderer->endFrame();
}
