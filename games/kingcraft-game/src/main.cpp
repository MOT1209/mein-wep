// ============================================================
// KingCraft — Main Entry Point
// ============================================================
// Voxel-based survival/crafting/building game
// Inspired by Minecraft & Rust
// ============================================================

#include "game/game.h"
#include <iostream>
#include <cstdlib>
#include <memory>

int main(int argc, char* argv[]) {
    std::cout << "========================================\n";
    std::cout << "  KingCraft v0.1.0\n";
    std::cout << "  Voxel Survival Game\n";
    std::cout << "========================================\n\n";
    
    // Parse seed from command line
    uint64_t seed = 0;
    if (argc > 1) {
        seed = std::stoull(argv[1]);
        std::cout << "[Main] Using seed: " << seed << "\n";
    } else {
        seed = (uint64_t)time(nullptr);
        std::cout << "[Main] Random seed: " << seed << "\n";
    }
    
    // Create and run game on the heap — the Game object embeds the ECS
    // (EntityManager ~tens of MB) by value, which overflows the 1 MB Windows
    // stack if allocated as a local. Heap allocation keeps main's frame tiny.
    auto game = std::make_unique<Game>();
    if (!game->init(1280, 720, "KingCraft v0.1.0", seed)) {
        std::cerr << "[Main] Failed to initialize game!\n";
        return 1;
    }
    
    std::cout << "\n[Main] === Controls ===\n";
    std::cout << "  WASD    - Move\n";
    std::cout << "  Space   - Jump\n";
    std::cout << "  Shift   - Sprint\n";
    std::cout << "  Mouse   - Look around\n";
    std::cout << "  Left Clk- Break block\n";
    std::cout << "  Right Clk- Place block\n";
    std::cout << "  1-9     - Hotbar selection\n";
    std::cout << "  ESC     - Exit\n\n";
    
    game->run();
    
    std::cout << "\n[Main] Goodbye!\n";
    return 0;
}
