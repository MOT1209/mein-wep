#include "game/player.h"
#include "world/chunk.h"
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
    float speed_val = shift ? sprint_speed : speed;
    is_sprinting = shift;
    
    Vec3f move_dir{0, 0, 0};
    
    if (w) move_dir = move_dir + front;
    if (s) move_dir = move_dir - front;
    if (a) move_dir = move_dir - right;
    if (d) move_dir = move_dir + right;
    
    if (move_dir.length() > 0) {
        move_dir = move_dir.normalized();
        velocity.x = move_dir.x * speed_val;
        velocity.z = move_dir.z * speed_val;
    } else {
        // Friction
        velocity.x *= 0.8f;
        velocity.z *= 0.8f;
    }
    
    if (space && on_ground) {
        velocity.y = jump_velocity;
        on_ground = false;
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
                if (block != BLOCK_AIR && block != BLOCK_WATER && block != BLOCK_LEAVES) {
                    return true;  // collision
                }
            }
        }
    }
    
    return false;
}

void Player::clickBlock(ChunkManager& world, bool left_click) {
    if (!target.hit) return;
    
    if (left_click) {
        // Break block
        if (gamemode == GameMode::CREATIVE) {
            world.setWorldBlock(target.block_pos.x, target.block_pos.y, target.block_pos.z, BLOCK_AIR);
        } else {
            // Survival: start/continue breaking
            auto* chunk = world.getChunk(
                ChunkManager::toChunkPos(target.block_pos.x),
                ChunkManager::toChunkPos(target.block_pos.z)
            );
            if (chunk) {
                world.setWorldBlock(target.block_pos.x, target.block_pos.y, target.block_pos.z, BLOCK_AIR);
            }
        }
    } else {
        // Place block
        if (gamemode == GameMode::CREATIVE) {
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
                
                if (place_pos.y >= 0 && place_pos.y < CHUNK_SIZE_Y) {
                    if (world.getWorldBlock(place_pos.x, place_pos.y, place_pos.z) == BLOCK_AIR) {
                        world.setWorldBlock(place_pos.x, place_pos.y, place_pos.z, BLOCK_STONE);
                    }
                }
            }
        }
    }
}

RaycastHit Player::raycast(ChunkManager& world, float max_dist) {
    RaycastHit result;
    
    Vec3f origin = position;
    origin.y += 1.6f;  // eye height
    Vec3f dir = front;
    
    // DDA (Digital Differential Analyzer) algorithm
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
    
    // Check first block (origin might be inside a block)
    BlockID start_block = world.getWorldBlock(current.x, current.y, current.z);
    if (start_block != BLOCK_AIR && start_block != BLOCK_WATER) {
        result.block_pos = current;
        result.hit = true;
        result.distance = 0;
        result.hit_point = origin;
        result.face = Direction::UP;  // default
        return result;
    }
    
    int face_out = 0;  // 0=x, 1=y, 2=z, negative = opposite
    
    for (int i = 0; i < 64; i++) {  // max 64 steps
        if (tMax.x < tMax.y) {
            if (tMax.x < tMax.z) {
                t = tMax.x;
                tMax.x += tDelta.x;
                current.x += step.x;
                face_out = step.x > 0 ? 0 : -0;  // EAST / WEST
            } else {
                t = tMax.z;
                tMax.z += tDelta.z;
                current.z += step.z;
                face_out = step.z > 0 ? 2 : -2;  // SOUTH / NORTH
            }
        } else {
            if (tMax.y < tMax.z) {
                t = tMax.y;
                tMax.y += tDelta.y;
                current.y += step.y;
                face_out = step.y > 0 ? 1 : -1;  // UP / DOWN
            } else {
                t = tMax.z;
                tMax.z += tDelta.z;
                current.z += step.z;
                face_out = step.z > 0 ? 2 : -2;  // SOUTH / NORTH
            }
        }
        
        if (t > max_dist) break;
        
        if (current.y < 0 || current.y >= CHUNK_SIZE_Y) continue;
        
        BlockID block = world.getWorldBlock(current.x, current.y, current.z);
        if (block != BLOCK_AIR && block != BLOCK_WATER && block != BLOCK_LEAVES) {
            result.block_pos = current;
            result.hit = true;
            result.distance = t;
            result.hit_point = origin + dir * t;
            
            // Convert face_out to Direction enum
            switch (face_out) {
                case 0:  result.face = Direction::EAST;  break;
                case -0: result.face = Direction::WEST;  break;
                case 1:  result.face = Direction::UP;    break;
                case -1: result.face = Direction::DOWN;  break;
                case 2:  result.face = Direction::SOUTH; break;
                case -2: result.face = Direction::NORTH; break;
            }
            
            return result;
        }
    }
    
    return result;
}

void Player::damage(float amount) {
    health = std::max(0.0f, health - amount);
    if (health <= 0) {
        // TODO: Die & respawn
        std::cout << "[Player] Died!\n";
    }
}

void Player::heal(float amount) {
    health = std::min(max_health, health + amount);
}

bool Player::addItem(ItemID id, int count) {
    // Try to stack first
    for (int i = 0; i < 36; i++) {
        if (inventory[i].item_id == id && inventory[i].count < 64) {
            int add = std::min(count, 64 - inventory[i].count);
            inventory[i].count += add;
            count -= add;
            if (count == 0) return true;
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
        // TODO: Spawn item entity in world
    }
}
