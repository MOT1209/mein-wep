#include "game/game.h"
#include "game/player.h"
#include "game/items.h"
#include "game/crafting.h"
#include "world/chunk.h"
#include "world/world_gen.h"
#include "world/block_registry.h"
#include "world/mesh_gen.h"
#include "render/renderer.h"
#include "ai/ai_system.h"
#include "entities/item_entity.h"
#include <GLFW/glfw3.h>
#include <iostream>
#include <chrono>
#include <cmath>
#include <functional>

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
    BlockRegistry::instance().init();
    
    // Init item registry + crafting
    ItemRegistry::instance().init();
    CraftingManager::instance().init();
    
    // Init ECS
    initECS();
    
    // Init world generator
    world_gen = std::make_unique<WorldGenerator>(seed);
    
    // Init player
    player = Player();
    player.setPosition({0, 100, 0});
    player.setGameMode(GameMode::CREATIVE);
    
    // Initial chunk load
    int pcx = ChunkManager::toChunkPos((int)player.getPosition().x);
    int pcz = ChunkManager::toChunkPos((int)player.getPosition().z);
    
    std::cout << "[Game] Generating initial chunks...\n";
    world.updateViewDistance(pcx, pcz, 8);
    
    // Generate chunks
    world.forEachLoaded([&](Chunk& chunk) {
        world_gen->generate(chunk);
    });
    
    // Build initial meshes
    world.forEachLoaded([&](Chunk& chunk) {
        auto mesh = std::make_unique<MeshData>(
            MeshGenerator::generateChunkMesh(chunk, BlockRegistry::instance())
        );
        chunk.setMesh(std::move(mesh));
    });
    
    // Position player at surface
    int spawn_y = 63;
    for (int y = CHUNK_SIZE_Y - 1; y >= 0; y--) {
        BlockID b = world.getWorldBlock(0, y, 0);
        if (b != BLOCK_AIR && b != BLOCK_WATER) {
            spawn_y = y + 2;
            break;
        }
    }
    player.setPosition({0.5f, (float)spawn_y, 0.5f});
    
    // Give starting items for survival
    player.addItem(ITEM_STONE_PICKAXE, 1);
    player.addItem(ITEM_STONE_AXE, 1);
    player.addItem(ITEM_STONE_SHOVEL, 1);
    player.addItem(ITEM_STONE_SWORD, 1);
    player.addItem(ITEM_COBBLESTONE, 32);
    player.addItem(ITEM_WOOD_PLANK, 32);
    player.addItem(ITEM_APPLE, 8);
    player.addItem(ITEM_WHEAT_SEEDS, 8);
    player.addItem(ITEM_WOODEN_HOE, 1);
    player.addItem(ITEM_STONE, 16);
    
    // Spawn some test mobs
    AISystem::spawnMob(ecs, MobInfo::Type::ZOMBIE, {5.0f, (float)spawn_y, 5.0f});
    AISystem::spawnMob(ecs, MobInfo::Type::COW, {8.0f, (float)spawn_y, 8.0f});
    AISystem::spawnMob(ecs, MobInfo::Type::CREEPER, {-5.0f, (float)spawn_y, -5.0f});
    
    std::cout << "[Game] Spawned " << ecs.entityCount() << " entities\n";
    
    // Set mouse grab
    renderer->setMouseGrabbed(true);
    
    running = true;
    std::cout << "[Game] Initialized successfully!\n";
    return true;
}

void Game::processInput() {
    // Toggle game mode with F1
    static bool f1_pressed = false;
    bool f1 = renderer->isKeyPressed(GLFW_KEY_F1);
    if (f1 && !f1_pressed) {
        if (player.getGameMode() == GameMode::CREATIVE)
            player.setGameMode(GameMode::SURVIVAL);
        else
            player.setGameMode(GameMode::CREATIVE);
        std::cout << "[Game] Mode: " << (player.getGameMode() == GameMode::SURVIVAL ? "SURVIVAL" : "CREATIVE") << "\n";
    }
    f1_pressed = f1;
    
    // Eat food with F key (first food item in hotbar)
    static bool f_pressed = false;
    bool f_key = renderer->isKeyPressed(GLFW_KEY_F);
    if (f_key && !f_pressed) {
        player.eat(ITEM_APPLE);
    }
    f_pressed = f_key;
}

void Game::initECS() {
    // Register all component types (done automatically on first use)
    std::cout << "[ECS] Ready\n";
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
        
        if (delta_time > 0.1) delta_time = 0.1;
        
        renderer->pollEvents();
        handleEvents();
        
        accumulator += delta_time;
        int steps = 0;
        while (accumulator >= fixed_dt && steps < 4) {
            update((float)fixed_dt);
            accumulator -= fixed_dt;
            steps++;
        }
        
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
    if (renderer->isKeyPressed(GLFW_KEY_ESCAPE)) {
        running = false;
        return;
    }
    
    input.w = renderer->isKeyPressed(GLFW_KEY_W);
    input.s = renderer->isKeyPressed(GLFW_KEY_S);
    input.a = renderer->isKeyPressed(GLFW_KEY_A);
    input.d = renderer->isKeyPressed(GLFW_KEY_D);
    input.space = renderer->isKeyPressed(GLFW_KEY_SPACE);
    input.shift = renderer->isKeyPressed(GLFW_KEY_LEFT_SHIFT);
    
    bool left = renderer->isMouseButtonPressed(GLFW_MOUSE_BUTTON_LEFT);
    bool right = renderer->isMouseButtonPressed(GLFW_MOUSE_BUTTON_RIGHT);
    
    input.left_clicked = left && !input.left_click;
    input.right_clicked = right && !input.right_click;
    input.left_click = left;
    input.right_click = right;
    
    double mx, my;
    renderer->getMousePos(mx, my);
    double dx = mx - input.mouse_x;
    double dy = my - input.mouse_y;
    input.mouse_x = mx;
    input.mouse_y = my;
    
    float sensitivity = 0.15f;
    player.setRotation(
        player.getYaw() + (float)(dx * sensitivity),
        std::max(-89.0f, std::min(89.0f, player.getPitch() - (float)(dy * sensitivity)))
    );
    
    for (int i = 0; i < 9; i++) {
        if (renderer->isKeyPressed(GLFW_KEY_1 + i)) {
            player.setSelectedSlot(i);
        }
    }
}

void Game::update(float delta_time) {
    // Process special input (hotkeys)
    processInput();
    
    // Update player
    player.handleInput(input.w, input.s, input.a, input.d, input.space, input.shift);
    player.update(delta_time, world);
    
    // Handle clicks (hold for left click in survival)
    if (input.left_clicked || input.left_click) {
        player.clickBlock(world, true);
    }
    if (input.right_clicked) {
        player.clickBlock(world, false);
    }
    
    // Update time of day
    time_of_day += delta_time * (1.0f / 1200.0f);  // 20 min full cycle
    if (time_of_day > 1.0f) time_of_day -= 1.0f;
    renderer->setTimeOfDay(time_of_day);
    
    // Update ECS + crops
    updateECS(delta_time);
    tickCrops(delta_time);
    
    // Update chunks
    updateChunks();
    
    // Rebuild dirty meshes
    rebuildChunkMeshes();
    
    // Spawn mobs periodically
    mob_spawn_timer += delta_time;
    if (mob_spawn_timer > 10.0f) {
        spawnMobs();
        mob_spawn_timer = 0;
    }
}

void Game::updateECS(float delta_time) {
    // Update AI
    AISystem::update(ecs, delta_time);
    
    // Update item entities
    ItemEntitySystem::update(ecs, ecs, delta_time);
    
    // Remove dead/expired entities
    std::vector<Entity> to_remove;
    ecs.each<Health>([](Entity, Health& hp) {
        if (!hp.isAlive() && hp.death_time == 0) {
            hp.death_time = 1.0f;
        }
    });
    
    // Dead entities: mark for removal after death_time expires
    ecs.each<Health>([&to_remove](Entity e, Health& hp) {
        if (!hp.isAlive() && hp.death_time > 0) {
            hp.death_time -= 0.016f;  // ~1 frame
            if (hp.death_time <= 0) {
                to_remove.push_back(e);
            }
        }
    });
    
    // Expired entities (DespawnTimer is updated by AISystem)
    ecs.each<DespawnTimer>([&to_remove](Entity e, DespawnTimer& timer) {
        if (timer.elapsed >= timer.lifetime) {
            to_remove.push_back(e);
        }
    });
    
    for (auto e : to_remove) {
        ecs.destroyEntity(e);
    }
}

void Game::tickCrops(float dt) {
    // Scan loaded chunks for wheat crops and advance growth
    static float timer = 0;
    timer += dt;
    if (timer < 5.0f) return;  // every 5 seconds
    timer = 0;
    
    world.forEachLoaded([&](Chunk& chunk) {
        if (!chunk.isLoaded()) return;
        
        int cx = chunk.getCX() * CHUNK_SIZE_X;
        int cz = chunk.getCZ() * CHUNK_SIZE_Z;
        
        for (int x = 0; x < CHUNK_SIZE_X; x++) {
            for (int z = 0; z < CHUNK_SIZE_Z; z++) {
                for (int y = 0; y < CHUNK_SIZE_Y; y++) {
                    BlockID block = chunk.getBlock(x, y, z);
                    if (block != BLOCK_WHEAT_CROP) continue;
                    
                    BlockState state = chunk.getState(x, y, z);
                    if (state >= 7) continue;  // fully grown
                    
                    // Check light: need block above to be air/transparent
                    if (y + 1 < CHUNK_SIZE_Y) {
                        BlockID above = chunk.getBlock(x, y + 1, z);
                        auto* above_prop = BlockRegistry::instance().get(above);
                        if (above_prop && above_prop->opacity > 0.5f) continue;  // blocked
                    }
                    
                    // Check farmland below
                    if (y > 0) {
                        BlockID below = chunk.getBlock(x, y - 1, z);
                        if (below != BLOCK_FARMLAND) continue;
                    }
                    
                    // Advance growth with randomness
                    if (rand() % 3 == 0) {  // 33% chance per tick
                        chunk.setBlock(x, y, z, block, state + 1);
                        chunk.markDirty();
                    }
                }
            }
        }
    });
}

void Game::spawnMobs() {
    Vec3f player_pos = player.getPosition();
    int spawn_count = 0;
    
    // Spawn zombies at night
    if (time_of_day > 0.4f && time_of_day < 0.9f) {
        for (int i = 0; i < 3; i++) {
            float angle = (float)(std::rand() % 360) * 3.14159f / 180.0f;
            float dist = 15.0f + (float)(std::rand() % 20);
            Vec3f spawn_pos(
                player_pos.x + (float)std::cos(angle) * dist,
                64.0f,
                player_pos.z + (float)std::sin(angle) * dist
            );
            
            // Check if spawn position is solid
            BlockID ground = world.getWorldBlock((int)spawn_pos.x, 63, (int)spawn_pos.z);
            if (ground != BLOCK_AIR) {
                AISystem::spawnMob(ecs, MobInfo::Type::ZOMBIE, spawn_pos);
                spawn_count++;
            }
        }
    }
    
    if (spawn_count > 0) {
        std::cout << "[Game] Spawned " << spawn_count << " mobs\n";
    }
}

void Game::updateChunks() {
    Vec3f pos = player.getPosition();
    int pcx = ChunkManager::toChunkPos((int)pos.x);
    int pcz = ChunkManager::toChunkPos((int)pos.z);
    
    world.updateViewDistance(pcx, pcz, 8);
    
    world.forEachLoaded([&](Chunk& chunk) {
        if (!chunk.isLoaded() || chunk.isGenerated()) return;
        world_gen->generate(chunk);
    });
}

void Game::rebuildChunkMeshes() {
    world.forEachLoaded([&](Chunk& chunk) {
        if (chunk.isDirty() && chunk.isLoaded()) {
            // Generate opaque mesh (greedy) + transparent mesh (cross quads)
            MeshData opaque = MeshGenerator::generateChunkMesh(chunk, BlockRegistry::instance());
            MeshData cross = MeshGenerator::generateCrossMesh(chunk, BlockRegistry::instance());
            
            // Merge cross vertices/indices into opaque mesh
            uint32_t vertex_offset = (uint32_t)opaque.vertices.size();
            for (const auto& v : cross.vertices) opaque.vertices.push_back(v);
            for (uint32_t idx : cross.indices) opaque.indices.push_back(idx + vertex_offset);
            
            auto mesh = std::make_unique<MeshData>(std::move(opaque));
            chunk.setMesh(std::move(mesh));
        }
    });
}

void Game::render() {
    renderer->beginFrame();
    
    Vec3f pos = player.getPosition();
    pos.y += 1.6f;
    renderer->setCamera(pos, player.getFront(), player.getUp());
    
    // Draw chunks
    world.forEachLoaded([&](Chunk& chunk) {
        if (chunk.getMesh() && !chunk.getMesh()->isEmpty()) {
            renderer->drawChunk(chunk, BlockRegistry::instance());
        }
    });
    
    // Draw selection wireframe
    const auto& target = player.getTargetBlock();
    if (target.hit) {
        Vec3f min{(float)target.block_pos.x, (float)target.block_pos.y, (float)target.block_pos.z};
        Vec3f max{(float)(target.block_pos.x + 1), (float)(target.block_pos.y + 1), (float)(target.block_pos.z + 1)};
        renderer->drawWireframeBox(min, max, {0.0f, 0.0f, 0.0f}, 2.0f);
    }
    
    // === UI Overlay (واجهة المستخدم) ===
    {
        ItemStack hotbar[9];
        player.getHotbar(hotbar);
        renderer->drawUI(hotbar, player.getSelectedSlot(),
                         player.getHealth(), player.getHunger(),
                         player.getBreakProgress());
    }
    
    // FPS counter in title bar (every 30 frames)
    static int frame_count = 0;
    static float fps_timer = 0;
    static float fps = 0;
    frame_count++;
    fps_timer += 0.016f;  // ~1/60
    if (fps_timer >= 1.0f) {
        fps = (float)frame_count / fps_timer;
        frame_count = 0;
        fps_timer = 0;
        
        // Update window title with stats
        char title[256];
        std::snprintf(title, sizeof(title),
            "KingCraft | FPS: %.0f | Chunks: %d/%d | Mode: %s | HP: %.0f | Hunger: %.0f",
            fps,
            renderer->getChunksVisible(), renderer->getChunksTotal(),
            player.getGameMode() == GameMode::SURVIVAL ? "S" : "C",
            player.getHealth(), player.getHunger());
        glfwSetWindowTitle(glfwGetCurrentContext(), title);
    }
    
    renderer->endFrame();
}
