#include "game/player.h"
#include "world/chunk.h"
#include "world/block_registry.h"
#include "game/items.h"
#include <cmath>
#include <algorithm>
#include <iostream>

Player::Player() {
    recalcVectors();
}

void Player::recalcVectors() {
    float yaw_rad = yaw * 3.14159f / 180.0f;
    float pitch_rad = pitch * 3.14159f / 180.0f;
    
    front.x = std::cos(yaw_rad) * std::cos(pitch_rad);
    front.y = std::sin(pitch_rad);
    front.z = std::sin(yaw_rad) * std::cos(pitch_rad);
    front = front.normalized();
    
    right = front.cross({0, 1, 0}).normalized();
    up = right.cross(front).normalized();
}

void Player::handleInput(bool w, bool s, bool a, bool d, bool space, bool shift) {
    float speed_val = (shift && isSurvival()) ? sprint_speed : speed;
    is_sprinting = shift;
    
    Vec3f move_dir{0, 0, 0};
    
    if (w) move_dir = move_dir + front;
    if (s) move_dir = move_dir - front;
    if (a) move_dir = move_dir - right;
    if (d) move_dir = move_dir + right;
    
    move_dir.y = 0;  // No vertical movement from WASD
    
    if (move_dir.length() > 0) {
        move_dir = move_dir.normalized();
        velocity.x = move_dir.x * speed_val;
        velocity.z = move_dir.z * speed_val;
        
        // Exhaustion from walking/sprinting
        if (isSurvival()) {
            applyExhaustion(shift ? 0.1f : 0.01f);
        }
    } else {
        // Friction
        velocity.x *= 0.8f;
        velocity.z *= 0.8f;
    }
    
    if (space && on_ground) {
        velocity.y = jump_velocity;
        on_ground = false;
        if (isSurvival()) applyExhaustion(0.2f);  // jumping costs exhaustion
    }
}

void Player::update(float delta_time, ChunkManager& world) {
    // Apply gravity
    if (!on_ground) {
        velocity.y += gravity * delta_time;
    }
    
    // Cap vertical velocity
    velocity.y = std::max(velocity.y, -40.0f);  // terminal velocity
    
    // Apply physics
    applyPhysics(delta_time, world);
    
    // Raycast for block targeting
    if (gamemode == GameMode::CREATIVE || gamemode == GameMode::SURVIVAL) {
        target = raycast(world, reach_distance);
    }
    
    // Survival: hunger healing
    if (isSurvival() && health < max_health && hunger > 17.0f) {
        // Natural regeneration when hunger ≥ 18 (90%)
        static float regen_timer = 0;
        regen_timer += delta_time;
        if (regen_timer >= 4.0f) {  // every 4 seconds
            heal(1.0f);
            hunger -= 1.0f;         // costs 1 hunger point
            regen_timer = 0;
        }
    }
    
    // Survival: hunger damage
    if (isSurvival() && hunger <= 0) {
        static float starve_timer = 0;
        starve_timer += delta_time;
        if (starve_timer >= 4.0f) {
            damage(1.0f);
            starve_timer = 0;
        }
    }
    
    // Recalculate rotation vectors
    recalcVectors();
}

void Player::applyPhysics(float delta_time, ChunkManager& world) {
    // Move on each axis independently with collision
    Vec3f new_pos = position;
    Vec3f vel = velocity;
    
    // X axis
    new_pos.x += vel.x * delta_time;
    if (checkCollision(new_pos, world)) {
        new_pos.x = position.x;
        vel.x = 0;
    }
    
    // Y axis
    new_pos.y += vel.y * delta_time;
    if (checkCollision(new_pos, world)) {
        if (vel.y < 0) on_ground = true;
        new_pos.y = position.y;
        vel.y = 0;
    }
    
    // Z axis
    new_pos.z += vel.z * delta_time;
    if (checkCollision(new_pos, world)) {
        new_pos.z = position.z;
        vel.z = 0;
    }
    
    position = new_pos;
    velocity = vel;
    
    // Survival: on ground + sprinting = apply exhaustion
    if (on_ground && is_sprinting && isSurvival()) {
        applyExhaustion(0.005f);
    }
    
    // In creative mode, we can fly
    if (gamemode == GameMode::CREATIVE) {
        on_ground = true;
    }
}

bool Player::checkCollision(const Vec3f& pos, ChunkManager& world) const {
    // Player bounding box: ±0.3 wide, 0 to 1.8 tall
    float half_width = 0.3f;
    float height = 1.8f;
    
    int min_x = (int)std::floor(pos.x - half_width);
    int max_x = (int)std::floor(pos.x + half_width);
    int min_y = (int)std::floor(pos.y);
    int max_y = (int)std::floor(pos.y + height);
    int min_z = (int)std::floor(pos.z - half_width);
    int max_z = (int)std::floor(pos.z + half_width);
    
    for (int x = min_x; x <= max_x; x++) {
        for (int y = min_y; y <= max_y; y++) {
            for (int z = min_z; z <= max_z; z++) {
                if (y < 0 || y >= CHUNK_SIZE_Y) continue;
                
                BlockID block = world.getWorldBlock(x, y, z);
                if (block != BLOCK_AIR && block != BLOCK_WATER && block != BLOCK_LEAVES
                    && block != BLOCK_TALL_GRASS && block != BLOCK_FLOWER && block != BLOCK_DEAD_BUSH) {
                    return true;  // collision
                }
            }
        }
    }
    
    return false;
}

// ============================================================
// BLOCK INTERACTION
// ============================================================
void Player::clickBlock(ChunkManager& world, bool left_click) {
    if (!target.hit) return;
    
    if (left_click) {
        // === LEFT CLICK: BREAK BLOCK ===
        if (gamemode == GameMode::CREATIVE) {
            // Instant break in creative
            dropItems(world, target.block_pos, 
                world.getWorldBlock(target.block_pos.x, target.block_pos.y, target.block_pos.z));
            world.setWorldBlock(target.block_pos.x, target.block_pos.y, target.block_pos.z, BLOCK_AIR);
            break_progress = 0;
        } else if (gamemode == GameMode::SURVIVAL) {
            breakBlock(world);
        }
    } else {
        // === RIGHT CLICK: PLACE BLOCK ===
        Vec3i place_pos = target.block_pos;
        switch (target.face) {
            case Direction::NORTH: place_pos.z--; break;
            case Direction::SOUTH: place_pos.z++; break;
            case Direction::EAST:  place_pos.x++; break;
            case Direction::WEST:  place_pos.x--; break;
            case Direction::UP:    place_pos.y++; break;
            case Direction::DOWN:  place_pos.y--; break;
        }
        
        // Don't place inside player
        Vec3f player_center = position;
        player_center.y += 0.9f;
        
        if (std::abs(place_pos.x + 0.5f - player_center.x) > 0.6f ||
            std::abs(place_pos.y + 0.5f - player_center.y) > 1.0f ||
            std::abs(place_pos.z + 0.5f - player_center.z) > 0.6f) {
            
            if (place_pos.y < 0 || place_pos.y >= CHUNK_SIZE_Y) return;
            if (world.getWorldBlock(place_pos.x, place_pos.y, place_pos.z) != BLOCK_AIR) return;
            
            if (gamemode == GameMode::CREATIVE) {
                world.setWorldBlock(place_pos.x, place_pos.y, place_pos.z, BLOCK_STONE);
            } else if (gamemode == GameMode::SURVIVAL) {
                // Use held item to place a block
                ItemStack& held = inventory[selected_slot];
                if (held.isEmpty()) return;
                
                auto* item_prop = ItemRegistry::instance().get(held.item_id);
                if (!item_prop) return;
                
                // Check if item can place a block
                if (item_prop->place_block != 0) {
                    world.setWorldBlock(place_pos.x, place_pos.y, place_pos.z, item_prop->place_block);
                    removeItem(selected_slot, 1);
                    applyExhaustion(0.1f);
                } else {
                    // Generic block items: try to convert item ID to block ID
                    BlockID place_block = 0;
                    
                    // === Farming: Hoe till dirt/grass ===
                    if (Items::getToolType(held.item_id) == ToolType::HOE) {
                        BlockID clicked_block = world.getWorldBlock(target.block_pos.x, target.block_pos.y, target.block_pos.z);
                        if (clicked_block == BLOCK_DIRT || clicked_block == BLOCK_GRASS) {
                            // Till the dirt
                            world.setWorldBlock(target.block_pos.x, target.block_pos.y, target.block_pos.z, BLOCK_FARMLAND);
                            // Damage hoe
                            auto* held_prop = ItemRegistry::instance().get(held.item_id);
                            if (held_prop && held_prop->max_damage > 0) {
                                held.durability++;
                                if (held.durability >= held_prop->max_damage) {
                                    removeItem(selected_slot, 1);  // hoe broke
                                }
                            }
                            applyExhaustion(0.1f);
                            return;  // done, don't place a block
                        }
                    }
                    
                    // === Farming: Plant seeds on farmland ===
                    if (held.item_id == ITEM_WHEAT_SEEDS) {
                        BlockID target_block = world.getWorldBlock(place_pos.x, place_pos.y, place_pos.z);
                        // Check if clicking ON TOP of farmland
                        BlockID below = world.getWorldBlock(place_pos.x, place_pos.y - 1, place_pos.z);
                        if (target_block == BLOCK_AIR && below == BLOCK_FARMLAND) {
                            world.setWorldBlock(place_pos.x, place_pos.y, place_pos.z, BLOCK_WHEAT_CROP);
                            removeItem(selected_slot, 1);
                            applyExhaustion(0.05f);
                            return;
                        }
                    }
                    
                    // === Regular block placement ===
                    if (held.item_id == ITEM_COBBLESTONE)       place_block = BLOCK_COBBLESTONE;
                    else if (held.item_id == ITEM_DIRT)        place_block = BLOCK_DIRT;
                    else if (held.item_id == ITEM_SAND)        place_block = BLOCK_SAND;
                    else if (held.item_id == ITEM_WOOD_PLANK)  place_block = BLOCK_PLANKS;
                    else if (held.item_id == ITEM_SANDSTONE)   place_block = BLOCK_SANDSTONE;
                    else if (held.item_id == ITEM_STONE)       place_block = BLOCK_STONE;
                    
                    if (place_block != 0) {
                        world.setWorldBlock(place_pos.x, place_pos.y, place_pos.z, place_block);
                        removeItem(selected_slot, 1);
                        applyExhaustion(0.1f);
                    }
                }
            }
        }
    }
}

void Player::breakBlock(ChunkManager& world) {
    // Check if we're still looking at the same block
    if (target.block_pos != breaking_block) {
        // Started a new block
        breaking_block = target.block_pos;
        break_progress = 0;
        
        // Calculate break time
        BlockID block = world.getWorldBlock(target.block_pos.x, target.block_pos.y, target.block_pos.z);
        auto* bp = BlockRegistry::instance().get(block);
        if (!bp) { break_progress = 1.0f; return; }  // instant
        
        float hardness = bp->hardness;
        if (hardness <= 0) { break_progress = 1.0f; return; }  // instant (plants, etc.)
        
        // Tool speed
        ItemStack& held = inventory[selected_slot];
        float speed = Items::getMiningSpeed(held.item_id, block);
        
        // Correct tool bonus
        if (Items::isCorrectTool(held.item_id, block)) {
            speed *= 2.0f;  // efficiency bonus for correct tool
        } else if (bp->requires_tool) {
            speed *= 0.2f;  // wrong tool = 5x slower
        }
        
        // Base break time: hardness × 1.5 / speed (seconds)
        break_time_needed = hardness * 1.5f / speed;
        if (break_time_needed < 0.05f) break_time_needed = 0.05f;  // minimum 50ms
    }
    
    // Advance break progress
    // In a real game, this would be called each frame while holding left click
    // For now, we simulate a single click = instant break for common blocks
    // In future: integrate with held input
    float speed_mult = 1.0f;
    
    // Check if we have correct tool
    BlockID block = world.getWorldBlock(target.block_pos.x, target.block_pos.y, target.block_pos.z);
    ItemStack& held = inventory[selected_slot];
    auto* held_prop = ItemRegistry::instance().get(held.item_id);
    if (Items::isCorrectTool(held.item_id, block)) {
        speed_mult = Items::getMiningSpeed(held.item_id, block);
        // Tool durability cost
        if (held_prop && held_prop->max_damage > 0 && held.durability < held_prop->max_damage) {
            held.durability++;
            applyExhaustion(0.025f);
        }
    }
    
    break_progress += speed_mult * 0.25f;  // 4 per second base
    
    if (break_progress >= break_time_needed) {
        // Block broken
        dropItems(world, target.block_pos, block);
        world.setWorldBlock(target.block_pos.x, target.block_pos.y, target.block_pos.z, BLOCK_AIR);
        applyExhaustion(0.05f);
        break_progress = 0;
        breaking_block = {0, -1, 0};
    }
}

void Player::dropItems(ChunkManager& world, const Vec3i& block_pos, BlockID block) {
    // Handle wheat crop specially: check growth stage
    if (block == BLOCK_WHEAT_CROP) {
        BlockState state = world.getWorldBlockState(block_pos.x, block_pos.y, block_pos.z);
        if (state >= 7) {
            // Fully grown: drop wheat + seeds
            addItem(ITEM_WHEAT, 1);
            int seed_count = 1 + (rand() % 3);  // 1-3 seeds
            addItem(ITEM_WHEAT_SEEDS, seed_count);
        } else {
            // Not fully grown: drop 1 seed
            addItem(ITEM_WHEAT_SEEDS, 1);
        }
        return;
    }
    
    ItemID drop = Items::getBlockDrop(block);
    int count = Items::getDropCount(block);
    
    if (drop != 0 && count > 0) {
        // Try to add to inventory first
        if (!addItem(drop, count)) {
            // Inventory full — drop on ground (as item entity)
            std::cout << "[Player] Dropped " << count << "x item " << drop << " at "
                      << block_pos.x << "," << block_pos.y << "," << block_pos.z << "\n";
        }
    }
}

// ============================================================
// RAYCAST (DDA algorithm)
// ============================================================
RaycastHit Player::raycast(ChunkManager& world, float max_dist) {
    RaycastHit result;
    
    Vec3f origin = position;
    origin.y += 1.6f;  // eye height
    Vec3f dir = front;
    
    float t = 0.0f;
    
    auto sign = [](float x) { return x > 0 ? 1 : (x < 0 ? -1 : 0); };
    
    Vec3i current{
        (int)std::floor(origin.x),
        (int)std::floor(origin.y),
        (int)std::floor(origin.z)
    };
    
    Vec3i step{sign(dir.x), sign(dir.y), sign(dir.z)};
    
    Vec3f tDelta{
        std::abs(1.0f / dir.x),
        std::abs(1.0f / dir.y),
        std::abs(1.0f / dir.z)
    };
    
    Vec3f tMax{
        (dir.x > 0 ? (current.x + 1.0f - origin.x) : (origin.x - current.x)) / std::abs(dir.x),
        (dir.y > 0 ? (current.y + 1.0f - origin.y) : (origin.y - current.y)) / std::abs(dir.y),
        (dir.z > 0 ? (current.z + 1.0f - origin.z) : (origin.z - current.z)) / std::abs(dir.z)
    };
    
    // Check first block
    BlockID start_block = world.getWorldBlock(current.x, current.y, current.z);
    if (start_block != BLOCK_AIR && start_block != BLOCK_WATER
        && start_block != BLOCK_TALL_GRASS && start_block != BLOCK_FLOWER && start_block != BLOCK_DEAD_BUSH) {
        result.block_pos = current;
        result.hit = true;
        result.distance = 0;
        result.hit_point = origin;
        result.face = Direction::UP;
        return result;
    }
    
    int face_out = 0;
    
    for (int i = 0; i < 64; i++) {
        if (tMax.x < tMax.y) {
            if (tMax.x < tMax.z) {
                t = tMax.x;
                tMax.x += tDelta.x;
                current.x += step.x;
                face_out = 0;
            } else {
                t = tMax.z;
                tMax.z += tDelta.z;
                current.z += step.z;
                face_out = step.z > 0 ? 2 : -2;
            }
        } else {
            if (tMax.y < tMax.z) {
                t = tMax.y;
                tMax.y += tDelta.y;
                current.y += step.y;
                face_out = step.y > 0 ? 1 : -1;
            } else {
                t = tMax.z;
                tMax.z += tDelta.z;
                current.z += step.z;
                face_out = step.z > 0 ? 2 : -2;
            }
        }
        
        if (t > max_dist) break;
        if (current.y < 0 || current.y >= CHUNK_SIZE_Y) continue;
        
        BlockID block = world.getWorldBlock(current.x, current.y, current.z);
        if (block != BLOCK_AIR && block != BLOCK_WATER
            && block != BLOCK_TALL_GRASS && block != BLOCK_FLOWER && block != BLOCK_DEAD_BUSH
            && block != BLOCK_LEAVES) {
            result.block_pos = current;
            result.hit = true;
            result.distance = t;
            result.hit_point = origin + dir * t;
            
            switch (face_out) {
                case 0:  result.face = step.x > 0 ? Direction::EAST : Direction::WEST;  break;
                case 1:  result.face = step.y > 0 ? Direction::UP : Direction::DOWN;  break;
                case 2:  result.face = step.z > 0 ? Direction::SOUTH : Direction::NORTH;  break;
            }
            
            return result;
        }
    }
    
    return result;
}

// ============================================================
// SURVIVAL STATS
// ============================================================
void Player::damage(float amount) {
    health = std::max(0.0f, health - amount);
    if (health <= 0) {
        std::cout << "[Player] Died! Respawning...\n";
        health = max_health;
        hunger = max_hunger;
        position = {0, 80, 0};  // respawn at origin
    }
}

void Player::heal(float amount) {
    health = std::min(max_health, health + amount);
}

void Player::eat(ItemID food) {
    if (!isSurvival()) return;
    if (hunger >= max_hunger) return;  // can't eat when full
    
    // Find food in hotbar first, then inventory
    int slot = -1;
    for (int i = 0; i < 36; i++) {
        if (inventory[i].item_id == food && !inventory[i].isEmpty()) {
            slot = i;
            break;
        }
    }
    if (slot < 0) return;
    
    float restore = Items::getFoodRestore(food);
    if (restore <= 0) return;  // not food
    
    // Apply food effects
    hunger = std::min(max_hunger, hunger + restore);
    
    // Saturation is 1.5x to 2x the food value
    auto* prop = ItemRegistry::instance().get(food);
    if (prop) {
        saturation = std::min(hunger, saturation + prop->saturation);
    }
    
    removeItem(slot, 1);
    std::cout << "[Player] Ate " << food << ", hunger=" << hunger << "\n";
}

void Player::addXp(float amount) {
    xp += amount;
    while (xp >= xp_to_next) {
        xp -= xp_to_next;
        level++;
        xp_to_next = 7.0f + level * 2.0f;  // increasing XP per level
        std::cout << "[Player] Level up! Now level " << level << "\n";
    }
}

void Player::applyExhaustion(float amount) {
    if (!isSurvival()) return;
    
    exhaustion += amount;
    
    // Every 4 exhaustion = 1 point of saturation lost
    while (exhaustion >= 4.0f) {
        exhaustion -= 4.0f;
        
        if (saturation > 0) {
            saturation = std::max(0.0f, saturation - 1.0f);
        } else if (hunger > 0) {
            hunger = std::max(0.0f, hunger - 1.0f);
        }
        // If both are 0, player takes starvation damage (handled in update)
    }
}

// ============================================================
// INVENTORY
// ============================================================
bool Player::addItem(ItemID id, int count) {
    // Try to stack first
    for (int i = 0; i < 36; i++) {
        if (inventory[i].item_id == id && inventory[i].count < 64) {
            int add = std::min(count, 64 - inventory[i].count);
            inventory[i].count += add;
            count -= add;
            if (count <= 0) return true;
        }
    }
    
    // Find empty slot
    for (int i = 0; i < 36; i++) {
        if (inventory[i].isEmpty()) {
            inventory[i].item_id = id;
            inventory[i].count = std::min(count, 64);
            return true;
        }
    }
    
    return false;  // inventory full
}

bool Player::removeItem(int slot, int count) {
    if (slot < 0 || slot >= 36) return false;
    if (inventory[slot].count < count) return false;
    
    inventory[slot].count -= count;
    if (inventory[slot].count <= 0) {
        inventory[slot].clear();
    }
    return true;
}

void Player::dropItem(int slot, int count) {
    if (removeItem(slot, count)) {
        // TODO: Spawn item entity
        std::cout << "[Player] Dropped item\n";
    }
}

bool Player::hasItems(ItemID id, int count) const {
    int total = 0;
    for (int i = 0; i < 36; i++) {
        if (inventory[i].item_id == id) total += inventory[i].count;
    }
    return total >= count;
}

int Player::countItem(ItemID id) const {
    int total = 0;
    for (int i = 0; i < 36; i++) {
        if (inventory[i].item_id == id) total += inventory[i].count;
    }
    return total;
}
