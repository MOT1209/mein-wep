#ifndef KINGCRAFT_GAME_H
#define KINGCRAFT_GAME_H

#include "core/types.h"
#include "world/chunk.h"
#include "world/world_gen.h"
#include "world/block_registry.h"
#include "world/mesh_gen.h"
#include "render/renderer.h"
#include "game/player.h"
#include "game/items.h"
#include "game/crafting.h"
#include "ecs/ecs.h"
#include "ecs/components.h"

// ============================================================
// GAME — الحلقة الرئيسية
// ============================================================
class Game {
public:
    Game();
    ~Game();
    
    bool init(int width, int height, const char* title, uint64_t seed);
    void run();       // الحلقة الرئيسية
    void shutdown();
    
    // الوصول
    Renderer* getRenderer() { return renderer.get(); }
    Player* getPlayer() { return &player; }
    ChunkManager* getWorld() { return &world; }
    WorldGenerator* getWorldGen() { return world_gen.get(); }
    EntityManager* getECS() { return &ecs; }

private:
    std::unique_ptr<Renderer> renderer;
    Player player;
    ChunkManager world;
    std::unique_ptr<WorldGenerator> world_gen;
    // ECS
    EntityManager ecs;
    float mob_spawn_timer = 0.0f;
    
    float time_of_day = 0.0f;  // 0-1
    Weather weather = Weather::CLEAR;
    float weather_timer = 0.0f;
    
    bool running = false;
    
    // Input state
    struct {
        bool w = false, s = false, a = false, d = false;
        bool space = false, shift = false;
        bool left_click = false, right_click = false;
        bool left_clicked = false, right_clicked = false;  // edge-triggered
        double mouse_x = 0, mouse_y = 0;
    } input;
    
    void handleEvents();
    void update(float delta_time);
    void render();
    
    void initECS();
    void updateECS(float delta_time);
    void spawnMobs();
    void processInput();
    void updateChunks();
    void tickCrops(float dt);
    void rebuildChunkMeshes();
};

#endif // KINGCRAFT_GAME_H
