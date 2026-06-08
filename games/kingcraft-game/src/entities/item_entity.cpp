#include "entities/item_entity.h"
#include <iostream>
#include <cmath>

namespace ItemEntitySystem {

Entity spawnItemDrop(EntityManager& ecs, const Vec3f& position,
                     ItemID item_id, int count) {
    Entity e = ecs.createEntity();
    
    Position pos;
    pos.pos = position;
    pos.prev_pos = position;
    ecs.addComponent(e, pos);
    
    Velocity vel;
    vel.vel = {(float)(std::rand() % 4 - 2), 5.0f, (float)(std::rand() % 4 - 2)};
    vel.gravity_scale = 1.0f;
    ecs.addComponent(e, vel);
    
    Collision col;
    col.half_extents = {0.2f, 0.2f, 0.2f};
    col.is_trigger = true;
    ecs.addComponent(e, col);
    
    ItemDrop drop;
    drop.item_id = item_id;
    drop.count = count;
    drop.lifetime = 300.0f;
    drop.pickup_timer = 0.5f;
    drop.can_pickup = false;
    ecs.addComponent(e, drop);
    
    Renderable render;
    render.type = Renderable::Type::ITEM;
    render.model_id = 0;
    render.texture_id = item_id;
    render.scale = 0.5f;
    render.billboard = true;
    ecs.addComponent(e, render);
    
    DespawnTimer timer;
    timer.lifetime = 300.0f;
    ecs.addComponent(e, timer);
    
    return e;
}

void update(EntityManager& ecs, EntityManager& player_ecs, float delta_time) {
    (void)player_ecs;
    
    ecs.each<Position, ItemDrop>([delta_time](Entity e, Position& pos, ItemDrop& drop) {
        // Floating animation
        pos.pos.y += std::sin(drop.lifetime * 2.0f) * 0.002f;
        
        // Enable pickup after timer
        if (!drop.can_pickup) {
            drop.pickup_timer -= delta_time;
            if (drop.pickup_timer <= 0) {
                drop.can_pickup = true;
            }
        }
    });
    
    // Check for nearby players to pick up
    // (This would be done in the game loop with proper player position)
}

void pickupItem(EntityManager& ecs, Entity item_entity, Entity player_entity) {
    auto* drop = ecs.getComponent<ItemDrop>(item_entity);
    auto* player_inv = ecs.getComponent<PlayerControlled>(player_entity);
    
    if (!drop || !player_inv) return;
    
    std::cout << "[Item] Picked up " << drop->count << "x item " << drop->item_id << "\n";
    
    ecs.destroyEntity(item_entity);
}

} // namespace ItemEntitySystem
