#ifndef KINGCRAFT_AI_SYSTEM_H
#define KINGCRAFT_AI_SYSTEM_H

#include "ecs/ecs.h"
#include "ecs/components.h"

// ============================================================
// AI SYSTEM — نظام الذكاء الاصطناعي للكائنات
// ============================================================
namespace AISystem {

// تحديث AI لجميع الكائنات
void update(EntityManager& ecs, float delta_time);

// توليد كائن (Zombie, Skeleton, Cow, Sheep)
Entity spawnMob(EntityManager& ecs, MobInfo::Type type, const Vec3f& position);

// العثور على أقرب لاعب (أو كيان مع PlayerControlled)
EntityID findNearestPlayer(EntityManager& ecs, const Vec3f& from_pos, float max_range);

// المسافة بين كيانين
float distance(const Vec3f& a, const Vec3f& b);

} // namespace AISystem

#endif // KINGCRAFT_AI_SYSTEM_H
