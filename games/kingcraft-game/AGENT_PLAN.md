# KingCraft Agent Plan — خطة الوكلاء

> **الإصدار**: v0.2.0  
> **الحالة**: التصميم مكتمل، المحرك الأساسي يعمل، الآن نبني المحتوى والميزات

---

## 🏗️ الهيكل الحالي (Phase 0 — ✅ مكتمل)

```
src/
├── core/    types.h + types.cpp       ← أنواع البيانات الأساسية
├── world/   block_registry, chunk, world_gen, mesh_gen  ← عالم فوكسل كامل
├── render/  renderer, shader          ← OpenGL 3.3 مع Greedy Meshing
├── game/    game, player              ← حلقة اللعبة + لاعب بتصادم
└── main.cpp                           ← نقطة الدخول
```

---

## 📋 المهام للوكلاء

### 🤖 Agent 1 — **Greedy Meshing + LOD** ⬅️ نحن هنا
**الملفات**: `src/world/mesh_gen.cpp`, `src/world/mesh_gen.h`  
**المهام**:
- [x] Greedy meshing للوجوه الموجبة والسالبة
- [x] دعم جيران الـ Chunk (لحدود صحيحة)
- [x] Wireframe box للبلوك المحدد
- [ ] **LOD system**: Meshing منخفض التفاصيل للمسافات البعيدة (دمج 2×2×2)
- [ ] **AO (Ambient Occlusion)**: حساب AO للوجوه (خوارزمية سريعة)
- [ ] **Transparency sort**: ترتيب الوجوه الشفافة

### 🤖 Agent 2 — **Terrain Generation + Biomes** 
**الملفات**: `src/world/world_gen.cpp`, `src/world/world_gen.h`  
**المهام**:
- [x] توليد أساسي (تضاريس + أشجار + كهوف + خامات)
- [x] كثافة أشجار معدلة (1-3 لكل Chunk)
- [ ] **Biome system**: غابة، صحراء، ثلوج، سهول
- [ ] **3D Noise متقدم**: FastNoise أو خوارزمية أفضل
- [ ] **Structures**: منازل صغيرة، قرى، معابد
- [ ] **Flora**: زهور، عشب طويل، صبار

### 🤖 Agent 3 — **Player + Survival + Inventory** 
**الملفات**: `src/game/player.cpp`, `src/game/player.h`, `src/game/game.cpp`  
**المهام**:
- [x] حركة + تصادم + Raycast
- [x] مخزون 36 خانة
- [x] كسر ووضع بلوك
- [ ] **Survival system**: جوع، عطش، O₂، حرارة
- [ ] **Sprint + Jump stamina**
- [ ] **Item drops**: بلوك يتحول إلىアイテム عند كسره
- [ ] **Block breaking animation**: تكسير متدرج
- [ ] **Crafting 3×3**: شبكة تصنيع

### 🤖 Agent 4 — **ECS + Mob AI** 
**الملفات الجديدة**: `src/ecs/`, `src/ai/`  
**المهام**:
- [ ] **ECS Core**: Entity Manager + Component Pools + Systems
- [ ] **Components**: Position, Health, AI, Render, Collision
- [ ] **Systems**: Movement, AI, Combat, Physics
- [ ] **Zombie**: AI بسيط (يتجه نحو اللاعب)
- [ ] **Skeleton**: AI (يطلق سهام)
- [ ] **Cow/Sheep**: AI (يتجول عشوائياً)
- [ ] **Mob spawning**: توليد الكائنات في الليل

### 🤖 Agent 5 — **Network Multiplayer** 
**الملفات الجديدة**: `src/network/`  
**المهام**:
- [ ] **UDP protocol**: Custom reliable UDP
- [ ] **Server**: Dedicated server (headless)
- [ ] **Client**: Connect + sync
- [ ] **Chunk sync**: إرسال الـ Chunks للعملاء
- [ ] **Entity sync**: مزامنة الكائنات
- [ ] **Anti-cheat**: بسيط (server-authoritative)

### 🤖 Agent 6 — **Crafting + Furnace + Inventory UI** 
**الملفات الجديدة**: `src/game/crafting.cpp`, `src/game/furnace.cpp`  
**المهام**:
- [ ] **Crafting recipes**: JSON-based recipes
- [ ] **Crafting table**: 3×3 grid
- [ ] **Furnace**: صهر المعادن + طهي الطعام
- [ ] **Inventory UI**: شبكة + سحب وإفلات
- [ ] **Hotbar rendering**: عرض الشريط السفلي

### 🤖 Agent 7 — **Sound + Music** 
**الملفات الجديدة**: `src/audio/`  
**المهام**:
- [ ] **Sound engine**: OpenAL أو SDL Audio
- [ ] **Block sounds**: صوت كسر ووضع لكل بلوك
- [ ] **Ambient sounds**: رياح، ماء، كهوف
- [ ] **Music**: موسيقى هادئة عشوائية
- [ ] **Mob sounds**: أصوات الزومبي والسكيليتون

### 🤖 Agent 8 — **Electricity + Redstone** 
**الملفات الجديدة**: `src/game/electricity.cpp`  
**المهام**:
- [ ] **Wire system**: توصيل الأسلاك
- [ ] **Power sources**: مولدات، ألواح شمسية
- [ ] **Logic gates**: AND, OR, NOT, XOR
- [ ] **Machines**: أبواب، مصابيح، مضخات
- [ ] **Computer**: Lua programmable computer

### 🤖 Agent 9 — **Bosses + Dungeons + Raiding** 
**الملفات الجديدة**: `src/entities/bosses/`, `src/worldgen/dungeons.cpp`  
**المهام**:
- [ ] **Boss AI**: Titan Golem, Ender King, Void Dragon
- [ ] **Dungeon generation**: غرف + ممرات + صناديق كنز
- [ ] **Raiding**: Rust-style raiding with explosives
- [ ] **Tool Cupboard**: منطقة آمنة للقاعدة
- [ ] **Code locks**: أقبال رقمية

### 🤖 Agent 10 — **Optimization + Polish** 
**الملفات**: جميع الملفات  
**المهام**:
- [ ] **Frustum culling**: عدم رسم الـ Chunks خارج الكاميرا
- [ ] **Threaded mesh gen**: توليد الـ Meshes في خيوط منفصلة
- [ ] **Memory optimization**: تجزئة الذاكرة
- [ ] **GL error checking**: التحقق من أخطاء OpenGL
- [ ] **Crash handler**: معالجة الأعطال + حفظ تلقائي
- [ ] **FPS counter**: عرض الإطارات في الثانية

---

## 🔄 كيفية استخدام الوكلاء

### الطريقة 1: تشغيل وكيل واحد

```
1. اقرأ الملفات المطلوبة (types.h لفهم الهياكل)
2. اطّلع على الكود الموجود
3. نفذ المهمة المحددة
4. اختبر الكود (CMake + build)
```

### الطريقة 2: وكلاء متوازون (للمهام المستقلة)

```
الوكيل أ → Agent 4 (ECS + Mob AI)    ← مستقل تماماً
الوكيل ب → Agent 5 (Network)         ← مستقل (يحتاج ECS لاحقاً)
الوكيل ج → Agent 6 (Crafting UI)     ← مستقل
```

### الطريقة 3: تسلسلي (للمهام المعتمدة)

```
1. Agent 4 (ECS) ← أولاً لأن كل شيء يحتاجه
2. Agent 5 (Network) ← يعتمد على ECS للمزامنة
3. Agent 3 (Survival) ← يعتمد على ECS للكائنات
```

---

## 📐 معايير الكود

```cpp
// التسمية: camelCase للمتغيرات, PascalCase للكلاسات
class PlayerManager { ... };  // كلاس
int playerCount;              // متغير
void updatePlayer();          // دالة

// التعليقات: عربي + إنجليزي
// التعداد: enum class
// المؤشرات: unique_ptr / raw pointer حسب الملكية
// التضمين: includes محلياً في .cpp عند الإمكان
```

## 🧪 اختبار

```
cd build && cmake .. && make -j4 && ./bin/KingCraft [seed]
```

---

> **ملاحظة**: كل وكيل يجب أن يقرأ `src/core/types.h` أولاً ليفهم الهياكل المشتركة.  
> الملفات الجديدة تُضاف إلى `CMakeLists.txt` تحت `set(..._SRC)` المناسب.
