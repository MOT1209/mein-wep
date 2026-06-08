#include "ecs/ecs.h"

// EntityManager::clear is defined here to avoid including ecs.h in every cpp
void EntityManager::clear() {
    for (auto& pool : pools) {
        if (pool) pool->clear();
    }
    for (auto& entry : entities) {
        entry.valid = false;
        entry.mask.reset();
    }
    free_list.clear();
    next_id = 0;
}
