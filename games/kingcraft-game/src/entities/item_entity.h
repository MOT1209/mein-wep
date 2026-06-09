#ifndef KINGCRAFT_ITEM_ENTITY_H
#define KINGCRAFT_ITEM_ENTITY_H

#include "ecs/ecs.h"
#include "ecs/components.h"

// ============================================================
// ITEM ENTITY — كائنات العناصر على الأرض
// ============================================================
namespace ItemEntitySystem {

// إنشاء عنصر على الأرض
Entity spawnItemDrop(EntityManager& ecs, const Vec3f& position, 
                     ItemID item_id, int count = 1);

// تحديث العناصر (التقاط، عمر)
void update(EntityManager& ecs, EntityManager& player_ecs, float delta_time);

// التقاط العنصر من قبل اللاعب
void pickupItem(EntityManager& ecs, Entity item_entity, Entity player_entity);

} // namespace ItemEntitySystem

#endif // KINGCRAFT_ITEM_ENTITY_H
