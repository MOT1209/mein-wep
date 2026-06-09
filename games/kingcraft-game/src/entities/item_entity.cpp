#include "entities/item_entity.h"
#include <iostream>
#include <cmath>
#include <cstdlib>

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

void update(EntityManager& ecs, EntityManager& player_ecs, float dt) {
    (void)player_ecs;
    
    ecs.each<Position, ItemDrop>([dt](Entity, Position& pos, ItemDrop& drop) {
        // Floating animation
        (void)drop;
        static float time = 0;
        time += dt;
        pos.pos.y += std::sin(time * 2.0f) * 0.002f;
        
        // Enable pickup after timer
        if (!drop.can_pickup) {
            drop.pickup_timer -= dt;
            if (drop.pickup_timer <= 0) {
                drop.can_pickup = true;
            }
        }
    });
    
    // Check for nearby players to pick up
    // (This would be done in the game loop with proper player position)
}

void pickupItem(EntityManager& ecs, Entity item_entity, Entity) {
    auto* drop = ecs.getComponent<ItemDrop>(item_entity);
    if (!drop) return;
    
    std::cout << "[Item] Picked up " << drop->count << "x item " << drop->item_id << "\n";
    
    ecs.destroyEntity(item_entity);
}

} // namespace ItemEntitySystem
