#include "ai/ai_system.h"
#include <cmath>
#include <cstdlib>
#include <algorithm>
#include <iostream>

namespace AISystem {

float distance(const Vec3f& a, const Vec3f& b) {
    float dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
    return std::sqrt(dx*dx + dy*dy + dz*dz);
}

EntityID findNearestPlayer(EntityManager& ecs, const Vec3f& from_pos, float max_range) {
    EntityID nearest = INVALID_ENTITY;
    float nearest_dist = max_range;
    
    ecs.each<Position, PlayerControlled>([&](Entity e, const Position& pos, const PlayerControlled&) {
        float d = distance(from_pos, pos.pos);
        if (d < nearest_dist) {
            nearest_dist = d;
            nearest = e.id;
        }
    });
    
    return nearest;
}

void update(EntityManager& ecs, float delta_time) {
    ecs.each<Position, Velocity, AIComponent, Health>([&](Entity e, Position& pos, Velocity& vel, AIComponent& ai, Health& hp) {
        if (!hp.isAlive()) return;
        
        ai.state_timer += delta_time;
        ai.attack_cooldown = std::max(0.0f, ai.attack_cooldown - delta_time);
        ai.path_recalc_timer += delta_time;
        
        // Find target if none
        if (ai.target == INVALID_ENTITY || !ecs.isValid({ai.target, 0})) {
            ai.target = findNearestPlayer(ecs, pos.pos, ai.aggro_range);
        }
        
        // Check if current target is still in range
        if (ai.target != INVALID_ENTITY) {
            Entity target_entity = {ai.target, 0};
            auto* target_pos = ecs.getComponent<Position>(target_entity);
            if (!target_pos) {
                ai.target = INVALID_ENTITY;
            } else {
                float d = distance(pos.pos, target_pos->pos);
                
                if (d > ai.aggro_range * 1.5f) {
                    ai.target = INVALID_ENTITY;
                    ai.state = AIComponent::State::WANDER;
                } else if (d <= ai.attack_range) {
                    ai.state = AIComponent::State::ATTACK;
                } else {
                    ai.state = AIComponent::State::CHASE;
                }
            }
        } else {
            // No target → wander
            if (ai.state != AIComponent::State::WANDER) {
                ai.state = AIComponent::State::WANDER;
                ai.state_timer = 0;
            }
        }
        
        // State logic
        switch (ai.state) {
            case AIComponent::State::IDLE: {
                vel.vel = {0, vel.vel.y, 0};
                if (ai.state_timer > 2.0f) {
                    ai.state = AIComponent::State::WANDER;
                    ai.state_timer = 0;
                }
                break;
            }
            
            case AIComponent::State::WANDER: {
                // Pick random direction every 3-5 seconds
                if (ai.state_timer > 3.0f + (std::rand() % 3)) {
                    ai.move_target.x = (int)(pos.pos.x + (std::rand() % 21 - 10));
                    ai.move_target.z = (int)(pos.pos.z + (std::rand() % 21 - 10));
                    ai.state_timer = 0;
                }
                
                Vec3f target_dir{
                    (float)ai.move_target.x - pos.pos.x,
                    0,
                    (float)ai.move_target.z - pos.pos.z
                };
                float len = std::sqrt(target_dir.x*target_dir.x + target_dir.z*target_dir.z);
                if (len > 0.5f) {
                    target_dir = {target_dir.x / len, 0, target_dir.z / len};
                    vel.vel.x = target_dir.x * ai.move_speed;
                    vel.vel.z = target_dir.z * ai.move_speed;
                    pos.rot_yaw = std::atan2(target_dir.x, target_dir.z) * 180.0f / 3.14159f;
                } else {
                    vel.vel = {0, vel.vel.y, 0};
                }
                break;
            }
            
            case AIComponent::State::CHASE: {
                Entity target_entity = {ai.target, 0};
                auto* target_pos = ecs.getComponent<Position>(target_entity);
                if (!target_pos) break;
                
                Vec3f dir = target_pos->pos - pos.pos;
                float len = std::sqrt(dir.x*dir.x + dir.z*dir.z);
                if (len > 0.1f) {
                    dir = {dir.x / len, 0, dir.z / len};
                    vel.vel.x = dir.x * ai.move_speed * 1.3f;  // 30% faster when chasing
                    vel.vel.z = dir.z * ai.move_speed * 1.3f;
                    pos.rot_yaw = std::atan2(dir.x, dir.z) * 180.0f / 3.14159f;
                }
                break;
            }
            
            case AIComponent::State::ATTACK: {
                vel.vel = {0, vel.vel.y, 0};
                
                if (ai.attack_cooldown <= 0) {
                    Entity target_entity = {ai.target, 0};
                    auto* target_hp = ecs.getComponent<Health>(target_entity);
                    if (target_hp && target_hp->isAlive()) {
                        target_hp->current = std::max(0.0f, target_hp->current - ai.attack_damage);
                        std::cout << "[AI] Entity " << e.id << " attacked for " << ai.attack_damage << " damage!\n";
                    }
                    ai.attack_cooldown = 1.5f;  // attack every 1.5 seconds
                }
                
                // Face target
                Entity target_entity = {ai.target, 0};
                auto* target_pos = ecs.getComponent<Position>(target_entity);
                if (target_pos) {
                    Vec3f dir = target_pos->pos - pos.pos;
                    pos.rot_yaw = std::atan2(dir.x, dir.z) * 180.0f / 3.14159f;
                }
                break;
            }
            
            default: break;
        }
    });
    
    // Update positions from velocities
    ecs.each<Position, Velocity>([delta_time](Entity e, Position& pos, Velocity& vel) {
        pos.prev_pos = pos.pos;
        
        // Apply gravity
        if (!vel.on_ground) {
            vel.vel.y += -20.0f * vel.gravity_scale * delta_time;
        }
        
        // Move
        pos.pos.x += vel.vel.x * delta_time;
        pos.pos.y += vel.vel.y * delta_time;
        pos.pos.z += vel.vel.z * delta_time;
        
        // Ground check (simple: y < 63 = ground level for now)
        if (pos.pos.y <= 63.0f) {
            pos.pos.y = 63.0f;
            vel.vel.y = 0;
            vel.on_ground = true;
        } else {
            vel.on_ground = false;
        }
        
        // Friction
        vel.vel.x *= 0.9f;
        vel.vel.z *= 0.9f;
    });
    
    // Despawn timer
    ecs.each<DespawnTimer>([delta_time](Entity e, DespawnTimer& timer) {
        timer.elapsed += delta_time;
    });
}

Entity spawnMob(EntityManager& ecs, MobInfo::Type type, const Vec3f& position) {
    Entity e = ecs.createEntity();
    
    Position pos;
    pos.pos = position;
    ecs.addComponent(e, pos);
    
    Velocity vel;
    ecs.addComponent(e, vel);
    
    Collision col;
    col.half_extents = {0.4f, 0.8f, 0.4f};
    ecs.addComponent(e, col);
    
    Health hp;
    AIComponent ai;
    MobInfo mob;
    mob.type = type;
    
    switch (type) {
        case MobInfo::Type::ZOMBIE:
            hp.current = hp.max = 20.0f;
            ai.attack_damage = 3.0f;
            ai.move_speed = 2.5f;
            ai.aggro_range = 16.0f;
            ai.attack_range = 1.5f;
            mob.name_id = "minecraft:zombie";
            mob.xp_drop = 5.0f;
            break;
            
        case MobInfo::Type::SKELETON:
            hp.current = hp.max = 20.0f;
            ai.attack_damage = 4.0f;
            ai.move_speed = 3.0f;
            ai.aggro_range = 20.0f;
            ai.attack_range = 15.0f;  // ranged
            mob.name_id = "minecraft:skeleton";
            mob.xp_drop = 5.0f;
            break;
            
        case MobInfo::Type::COW:
            hp.current = hp.max = 10.0f;
            ai.move_speed = 2.0f;
            ai.aggro_range = 0;  // passive
            ai.attack_damage = 0;
            mob.name_id = "minecraft:cow";
            mob.xp_drop = 1.0f;
            break;
            
        case MobInfo::Type::SHEEP:
            hp.current = hp.max = 8.0f;
            ai.move_speed = 2.0f;
            ai.aggro_range = 0;
            ai.attack_damage = 0;
            mob.name_id = "minecraft:sheep";
            mob.xp_drop = 1.0f;
            break;
            
        case MobInfo::Type::CREEPER:
            hp.current = hp.max = 20.0f;
            ai.attack_damage = 49.0f;  // big boom
            ai.move_speed = 2.0f;
            ai.aggro_range = 14.0f;
            ai.attack_range = 2.5f;
            mob.name_id = "minecraft:creeper";
            mob.xp_drop = 5.0f;
            break;
            
        default:
            hp.current = hp.max = 20.0f;
            ai.move_speed = 2.0f;
            mob.name_id = "minecraft:mob";
            break;
    }
    
    ecs.addComponent(e, hp);
    ecs.addComponent(e, ai);
    ecs.addComponent(e, mob);
    
    Renderable render;
    render.type = Renderable::Type::ENTITY;
    render.texture_id = (uint32_t)type + 100;  // 100+ for mob textures
    ecs.addComponent(e, render);
    
    DespawnTimer despawn;
    despawn.lifetime = 600.0f;  // 10 minutes
    ecs.addComponent(e, despawn);
    
    return e;
}

} // namespace AISystem
