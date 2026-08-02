// ثوابت اللعبة العامة
export const CHUNK_SIZE = 16;        // عرض/عمق القطعة
export const WORLD_HEIGHT = 64;      // أقصى ارتفاع للعالم
export const SEA_LEVEL = 28;         // مستوى سطح البحر التقريبي

export const RENDER_DISTANCE = 4;    // عدد القطع حول اللاعب (نصف القطر)

export const GRAVITY = 28;           // وحدة/ث²
export const JUMP_SPEED = 9.2;       // سرعة القفز
export const WALK_SPEED = 4.8;       // سرعة المشي
export const RUN_SPEED = 8.0;        // سرعة الجري
export const FLY_SPEED = 14.0;       // سرعة الطيران (وضع الإبداع)

// أبعاد صندوق اللاعب (AABB)
export const PLAYER_WIDTH = 0.6;
export const PLAYER_HEIGHT = 1.8;
export const PLAYER_EYE = 1.62;      // ارتفاع العين من القدم

export const REACH = 6;              // مدى الوصول للكسر/الوضع بالبلوكات

// الصحة والجوع
export const MAX_HEALTH = 20;
export const MAX_FOOD = 20;
export const MAX_SATURATION = 20;
export const FALL_DAMAGE_THRESHOLD = 3;  // أقل من 3 بلوكات = لا ضرر
export const FALL_DAMAGE_PER_BLOCK = 1;  // 1 قلب لكل بلوكة بعد العتبة
export const STARVATION_DAMAGE = 1;      // ضرر الجوع كل 4 ثوانٍ
export const STARVATION_INTERVAL = 4;    // ثوانٍ بين ضرر الجوع
export const HEAL_RATE = 0.5;            // قلوب/ثانية عند الشبع
export const HEAL_THRESHOLD = 18;        // الطعام يجب أن يكون ≥18 للشفاء
export const EXHAUSTION_PER_JUMP = 0.2;
export const EXHAUSTION_PER_BREAK = 0.1;
export const EXHAUSTION_PER_SPRINT = 0.05;  // لكل متر
