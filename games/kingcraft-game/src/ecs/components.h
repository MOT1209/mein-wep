#ifndef KINGCRAFT_COMPONENTS_H
#define KINGCRAFT_COMPONENTS_H

#include "core/types.h"
#include "ecs/ecs.h"
#include <string>

// ============================================================
// COMPONENTS — كل المكونات التي تحتاجها الكائنات
// ============================================================

// === POSITION ===
struct Position {
    Vec3f pos{0, 0, 0};
    Vec3f prev_pos{0, 0, 0};     // للـ interpolation
    float rot_yaw = 0;            // Y-axis rotation (degrees)
    float rot_pitch = 0;          // X-axis rotation (degrees)
};

// === VELOCITY ===
struct Velocity {
    Vec3f vel{0, 0, 0};
    float gravity_scale = 1.0f;
    bool on_ground = false;
};

// === RENDER ===
struct Renderable {
    enum class Type { BLOCK, ENTITY, ITEM, PARTICLE };
    Type type = Type::ENTITY;
    uint32_t model_id = 0;         // index into model cache
    uint32_t texture_id = 0;       // texture atlas index
    float scale = 1.0f;
    bool visible = true;
    bool billboard = false;         // face camera (for items)
};

// === HEALTH ===
struct Health {
    float current = 20.0f;
    float max = 20.0f;
    float armor = 0.0f;
    bool invulnerable = false;
    float death_time = 0.0f;       // time since death (0 = alive)
    
    bool isAlive() const { return current > 0 && death_time == 0; }
    float getPercent() const { return current / max; }
};

// === AI ===
struct AIComponent {
    enum class State { IDLE, WANDER, CHASE, ATTACK, FLEE, GUARD };
    State state = State::IDLE;
    float state_timer = 0.0f;
    float aggro_range = 10.0f;
    float attack_range = 2.0f;
    float attack_cooldown = 0.0f;
    float attack_damage = 3.0f;
    float move_speed = 3.0f;
    EntityID target = INVALID_ENTITY;
    
    // Pathfinding
    Vec3i move_target{0, 0, 0};
    float path_recalc_timer = 0.0f;
};

// === COLLISION ===
struct Collision {
    Vec3f half_extents{0.5f, 0.5f, 0.5f};  // box half-size
    bool is_trigger = false;                 // trigger = no physics push
    uint16_t group = 1;                      // collision group
    uint16_t mask = 0xFFFF;                  // what groups to collide with
};

// === ITEM DROP ===
struct ItemDrop {
    ItemID item_id = 0;
    int count = 1;
    float lifetime = 300.0f;       // 5 minutes
    float pickup_timer = 0.5f;     // half second before pickable
    bool can_pickup = false;
};

// === PLAYER CONTROLLED ===
struct PlayerControlled {
    EntityID player_entity = INVALID_ENTITY;
    std::string name;
    float reach_distance = 5.0f;
    int selected_slot = 0;
    ItemStack inventory[36];
};

// === DESPAWN TIMER ===
struct DespawnTimer {
    float lifetime = 300.0f;       // seconds until despawn
    float elapsed = 0.0f;
};

// === MOB INFO ===
struct MobInfo {
    enum class Type { ZOMBIE, SKELETON, COW, SHEEP, CHICKEN, PIG, CREEPER };
    Type type = Type::ZOMBIE;
    std::string name_id;
    float xp_drop = 5.0f;
};

// === PROJECTILE ===
struct Projectile {
    EntityID owner = INVALID_ENTITY;
    float damage = 5.0f;
    float speed = 20.0f;
    float lifetime = 5.0f;
    bool piercing = false;
};

#endif // KINGCRAFT_COMPONENTS_H
