# خطة تنفيذ لعبة KingCraft — خطوة بخطوة

> **الهدف:** بناء لعبة كاملة قابلة للتشغيل  
> **المنهجية:** Agile / MVP → Alpha → Beta → Release  
> **اللغة:** C++ (محرك) + Lua (مطوري محتوى)

---

## 🎯 المراحل الكبرى

```
المسار التنفيذي للعبة كاملة:

┌───────────────────────────────────────────────────────────────────┐
│  Phase 0: MVP     │  3 شهور  │  لعبة قابلة للتشغيل بـ 10 بلوكات  │
├───────────────────────────────────────────────────────────────────┤
│  Phase 1: Single  │  3 شهور  │  لعبة بقاء كاملة للاعب واحد       │
├───────────────────────────────────────────────────────────────────┤
│  Phase 2: Multi   │  4 شهور  │  طور متعدد اللاعبين (حتى 50)      │
├───────────────────────────────────────────────────────────────────┤
│  Phase 3: Systems │  4 شهور  │  جميع الأنظمة المتقدمة            │
├───────────────────────────────────────────────────────────────────┤
│  Phase 4: Content │  4 شهور  │  محتوى كامل + تلميع              │
├───────────────────────────────────────────────────────────────────┤
│  Phase 5: Launch  │  2 شهور  │  إصدار + نشر                      │
└───────────────────────────────────────────────────────────────────┘
  المجموع: 20 شهر ← 24 شهر مع الصيانة
```

---

## 🔧 Phase 0: MVP — الحد الأدنى القابل للتشغيل (شهور 1-3)

> **الناتج:** لعبة بسيطة: عالم مكعبات، تنقل، بناء، تكسير

### الشهر 1 — محرك الفوكسيل الأساسي

```
الأسبوع 1-2: إعداد بيئة التطوير
├── تثبيت Vulkan SDK / DirectX 12
├── إعداد CMakeLists.txt للمشروع
├── إنشاء نافذة GLFW/SDL2
├── حلقة اللعبة (Game Loop) الأساسية
└── نظام إدارة الذاكرة (Memory Allocator)

الأسبوع 3-4: عرض الفوكسيل (Voxel Rendering)
├── تعريف هيكل Chunk (32×32×32 في البداية)
├── تخزين Block ID (uint16 لكل فوكسل)
├── Greedy Meshing Algorithm
├── عرض المكعبات (diffuse فقط، لا إضاءة)
├── كاميرا أساسية (حركة WASD + فأرة)
└── تحديث الـ Mesh عند تغيير بلوك
```

**🔑 الكود الأساسي لمحرك الفوكسيل:**

```cpp
// chunk.h — الهيكل الأساسي للـ Chunk
struct Chunk {
    static constexpr int SIZE_X = 32;
    static constexpr int SIZE_Y = 32;  // مبسطة في البداية
    static constexpr int SIZE_Z = 32;
    
    uint16_t blocks[SIZE_X * SIZE_Y * SIZE_Z];  // Block IDs
    bool dirty = true;  // يحتاج إعادة بناء Mesh
    
    uint16_t& get(int x, int y, int z) {
        return blocks[(y * SIZE_Z + z) * SIZE_X + x];
    }
    
    void set(int x, int y, int z, uint16_t block_id) {
        get(x, y, z) = block_id;
        dirty = true;
    }
};

// greedy_mesh.h — دالة التجميع
struct MeshData {
    struct Vertex {
        float x, y, z;      // position
        float u, v;          // UV
        float nx, ny, nz;    // normal
        float ao;             // ambient occlusion
        uint32_t texture;    // texture index
    };
    std::vector<Vertex> vertices;
    std::vector<uint32_t> indices;
    
    void clear() { vertices.clear(); indices.clear(); }
};

MeshData greedyMesh(const Chunk& chunk);
```

### الشهر 2 — الأنظمة الأساسية

```
الأسبوع 5-6: نظام البلوكات والعناصر
├── Block Registry (JSON-based)
├── Item Registry
├── 15 بلوك أساسي (تراب، حجر، خشب، رمل، etc.)
├── 10 عنصر أساسي (خامات، أدوات، أسلحة بسيطة)
└── Tool System (تأثير الأدوات على سرعة التعدين)

الأسبوع 7-8: تفاعل اللاعب مع العالم
├── Block Picking (Raycast من الكاميرا)
├── وضع بلوك (Right-click)
├── تكسير بلوك (Left-click مع Animation تكسير)
├── Inventory أساسي (شريط أدوات + 9 خانات)
├── Drop Item على الأرض
├── Pickup Item
└── نظام الـ Block Drops
```

**🔑 الكود الأساسي لـ Block Picking:**

```cpp
// raycast.h — اختيار البلوك
struct RaycastHit {
    glm::ivec3 block_pos;
    glm::ivec3 face_normal;  // أي وجه أصبنا
    float distance;
    bool hit = false;
};

RaycastHit raycastBlocks(
    const glm::vec3& origin, 
    const glm::vec3& direction, 
    float max_distance,
    const std::function<bool(int,int,int)>& is_solid
) {
    // DDA Algorithm (Digital Differential Analyzer)
    float t = 0.0f;
    float dt_x = 1.0f / std::abs(direction.x);
    float dt_y = 1.0f / std::abs(direction.y);
    float dt_z = 1.0f / std::abs(direction.z);
    
    int step_x = (direction.x > 0) ? 1 : -1;
    int step_y = (direction.y > 0) ? 1 : -1;
    int step_z = (direction.z > 0) ? 1 : -1;
    
    int x = (int)std::floor(origin.x);
    int y = (int)std::floor(origin.y);
    int z = (int)std::floor(origin.z);
    
    // ... المسير عبر المكعبات
}
```

### الشهر 3 — التوليد الإجرائي + الإضاءة

```
الأسبوع 9-10: توليد العالم
├── FastNoise2 / OpenSimplex2
├── 2D Heightmap Noise
├── توزيع البلوكات (Stone → Dirt → Grass)
├── Sea Level (Y=63)
├── Trees (نوع واحد: Oak)
└── Caves أساسية (3D Noise threshold)

الأسبوع 11-12: الإضاءة + التحميل الديناميكي
├── Sky Light Propagation (من الأعلى للأسفل)
├── Block Light (Torches تعطي ضوء)
├── إضاءة بسيطة في الـ Shader
├── Chunk Loading/Unloading حسب موقع اللاعب
├── Async Chunk Generation
└── Chunk Saving/Loading (Region Files)
```

**✅ Deliverable Phase 0: لعبة قابلة للتشغيل!**
- `./KingCraft` تفتح نافذة
- عالم لانهائي متولد عشوائياً
- تمشي وتطير وتكسر وتحط بلوكات
- 15+ بلوك، 10+ أداة
- إضاءة نهار/ليل

---

## 🎮 Phase 1: اللعب الفردي الكامل (شهور 4-6)

### الشهر 4 — البقاء على قيد الحياة

```
الأسبوع 13-14: إحصائيات اللاعب
├── Health (0-100 HP)
├── Hunger (0-20 Food Level)
├── Oxygen (underwater)
├── Death + Respawn
└── Damage System (سقوط، غرق، نار، كائنات)

الأسبوع 15-16: الطعام والشراب
├── Food Items (تفاح، خبز، لحم)
├── Cooking (Campfire, Furnace)
├── Crop Farming (قمح، جزر، بطاطا)
├── Bone Meal Mechanic
├── Animal Breeding
└── Fishing
```

### الشهر 5 — الكائنات والذكاء الاصطناعي

```
الأسبوع 17-18: ECS + الكائنات المسالمة
├── Entity Component System (EnTT)
├── Component: Transform, Health, AI
├── كائنات: بقرة، خنزير، دجاجة، خروف
├── Spawning Algorithm
├── Animal AI (Wander, Flee)
└── Entity Drops

الأسبوع 19-20: الكائنات العدائية
├── Zombie (Melee AI, Break Doors)
├── Skeleton (Ranged AI, Strafe)
├── Spider (Climb AI)
├── Creeper (Explode AI)
├── Pathfinding (A*)
└── Combat System (Melee + Ranged)
```

### الشهر 6 — الصياغة والتطوير

```
الأسبوع 21-22: أنظمة الصياغة
├── Crafting Table (3×3 Grid)
├── Furnace + Smelting
├── Anvil + Repair
├── Enchanting Table
├── Brewing Stand
└── Recipe Registry (JSON)

الأسبوع 23-24: المحتوى + التلميع
├── 50+ Block Types
├── 80+ Item Types
├── 10+ Mob Types
├── Day/Night Cycle كامل
├── Weather (Rain, Snow, Thunder)
├── UI أساسي (Inventory, Crafting, Health)
└── Sound Effects (FMOD)
```

**✅ Deliverable Phase 1: لعبة بقاء كاملة للاعب واحد!**
- كل ميكانيكيات Minecraft الأساسية
- عالم حيوي مع كائنات
- 50+ بلوك، 80+ أداة/عنصر
- نظام ليلي/نهاري وطقس

---

## 🌐 Phase 2: تعدد اللاعبين (شهور 7-10)

### الشهر 7 — أساسيات الشبكة

```
الأسبوع 25-26: بروتوكول الشبكة
├── UDP Networking Layer
├── Connection Management
├── Serialization (Bit Packing)
├── Client-Server Architecture
└── Basic Anti-Cheat (Speed Check)

الأسبوع 27-28: مزامنة العالم
├── Player Position Replication
├── Block Change Replication
├── Entity Replication
├── Inventory Sync
├── Chunk Streaming عبر الشبكة
└── Delta Compression
```

### الشهر 8 — الصوت والدردشة

```
الأسبوع 29-30: الصوت
├── 3D Positional Audio
├── Block Sounds (Break/Place/Step)
├── Mob Sounds
├── Music System (Day/Night)
└── Voice Chat (Opus Codec)

الأسبوع 31-32: الأنظمة الاجتماعية
├── Chat System (/g, /c, /w, /l)
├── Friends List
├── Player List (Tab)
├── Commands System
└── Permissions System
```

### الشهر 9 — العشائر والاقتصاد

```
الأسبوع 33-34: Clan System
├── Create/Disband Clan
├── Ranks (Leader, Officer, Member, Recruit)
├── Clan Base + TC
├── Clan Bank
└── Clan Perks

الأسبوع 35-36: الاقتصاد
├── Currency System (Scrap)
├── Player Trading (/trade)
├── Market (Server Shop)
├── Vault + Safe
└── Economy Database
```

### الشهر 10 — الـ Raiding والكهرباء

```
الأسبوع 37-38: Raiding System
├── Tool Cupboard (Building Privilege)
├── Code Locks + Key Locks
├── Lock Picking (Minigame)
├── Explosives (C4, Rocket, Grenade)
├── Raid Window
└── Building Upgrades (Wood→Stone→Metal→Armored)

الأسبوع 39-40: Electricity
├── Wire System (Placement + Connection)
├── Power Generation (Solar, Wind, Generator)
├── Power Storage (Batteries)
├── Logic Gates (AND, OR, XOR, Memory Cell)
├── Auto Turrets
├── Radar + Siren
└── Computer (Lua Scripting)
```

**✅ Deliverable Phase 2: لعبة متعددة اللاعبين (حتى 100 لاعب)!**

---

## ⚙️ Phase 3: الأنظمة المتقدمة (شهور 11-14)

### الشهر 11 — المركبات

```
الأسبوع 41-42: Vehicle Physics
├── Vehicle ECS Components
├── Wheel Collision
├── Engine + Fuel System
├── Horse Riding
└── Boat Physics

الأسبوع 43-44: Vehicle Types
├── Car, Truck, ATV
├── Helicopter, Mini-copter
├── Motorboat, Submarine
├── Train + Rails
├── Vehicle Storage + Locks
└── Vehicle Damage + Repair
```

### الشهر 12 — الأشجار والزراعة المتقدمة

```
الأسبوع 45-46: Tree System
├── 10+ Tree Types
├── Custom Tree Generation (NBT Structures)
├── Falling Leaves Particles
├── Tree Growth (Sapling → Tree)
└── Stripped Logs

الأسبوع 47-48: Farming + Seasons
├── 15+ Crop Types
├── Greenhouse Mechanics
├── Composter + Bonemeal
├── Season System (Spring, Summer, Autumn, Winter)
├── Temperature System
└── Seasonal Effects (Crops, Animals, Water Freeze)
```

### الشهر 13 — التقدم والمهارات

```
الأسبوع 49-50: Skill System
├── 12 Skill Trees (Mining, Woodcutting, Building, Combat, etc.)
├── XP Gain per Action
├── Level Unlocks
├── Skill Perks
└── UI for Skills

الأسبوع 51-52: Quest System
├── Quest Types (Gathering, Crafting, Hunting, Exploration)
├── Quest Chain (Multi-part)
├── Daily/Weekly Quests
├── Achievements
├── Quest Rewards
└── Quest UI
```

### الشهر 14 — AI المتقدم + الزنزانات

```
الأسبوع 53-54: Advanced AI
├── Boss AI (Phase System)
├── NPC AI (Villager Schedules)
├── Guard AI (Patrol Paths)
├── Pack AI (Wolf Pack)
├── Ambush AI (Creeper, Spider)
└── Flocking AI (Birds, Fish)

الأسبوع 55-56: Dungeons + Structures
├── Jigsaw Structure System
├── 5 Dungeon Types (Crypt, Temple, Citadel, Sanctum, Labyrinth)
├── 10+ Structure Types (Village, Outpost, Lab, Bunker)
├── Dungeon Loot Tables
├── Boss Encounters
└── Dungeon Generation (Room-based)
```

**✅ Deliverable Phase 3: لعبة كاملة بكل الأنظمة المتقدمة!**

---

## 🎨 Phase 4: المحتوى والتلميع (شهور 15-18)

### الشهر 15 — المحتوى البصري

```
الأسبوع 57-58: PBR Rendering
├── Physically Based Shading
├── Normal Maps
├── Roughness/Metalness Maps
├── Emissive Maps
└── Texture Atlas Optimization

الأسبوع 59-60: الجرافيكس المتقدم
├── Dynamic Lighting
├── Shadows (CSM)
├── Volumetric Clouds
├── Water Shader (Reflection + Refraction)
├── Post-processing (Bloom, SSAO, TAA)
└── Fog System
```

### الشهر 16 — التلميع الصوتي

```
الأسبوع 61-62: SFX Overhaul
├── 500+ Sound Effects
├── Procedural Tool Sounds
├── Footstep System (per block type)
├── Reverb Zones
└── Occlusion System

الأسبوع 63-64: Music + Voice
├── Dynamic Music System (per biome, per situation)
├── Ambient Soundscapes
├── Voice Chat Overhaul
└── Audio Settings (Equalizer)
```

### الشهر 17 — Modding API

```
الأسبوع 65-66: Lua API
├── Sandboxed Lua Runtime
├── Block/Item Registration API
├── Event System API
├── Command Registration API
├── UI API
└── Storage API

الأسبوع 67-68: Mod Tools
├── Content Pack System (JSON-only mods)
├── Steam Workshop Integration
├── Mod Manager UI
├── Mod Dependency System
└── Mod Documentation
```

### الشهر 18 — التلميع النهائي

```
الأسبوع 69-70: Optimization
├── Multi-threaded Chunk Loading
├── GPU-driven Rendering
├── Memory Optimization
├── Network Bandwidth Optimization
└── Load Testing (200 players)

الأسبوع 71-72: UI/UX
├── Customizable HUD
├── Radial Menus
├── World Map
├── Settings (Video, Audio, Controls, Keybinds)
├── Accessibility (Color Blind Mode, Subtitles)
└── Controller Support
```

**✅ Deliverable Phase 4: لعبة جاهزة للإصدار!**

---

## 🚀 Phase 5: الإصدار (شهور 19-20)

### الشهر 19 — البنية التحتية

```
الأسبوع 73-74: Server Infrastructure
├── Master Server
├── Server Browser
├── Automated Backups
├── Anti-Cheat Finalization
└── Analytics + Monitoring

الأسبوع 75-76: Community Features
├── Community Guidelines
├── Report System
├── Moderation Tools
├── Server Hosting Documentation
└── Modding Documentation
```

### الشهر 20 — الإطلاق

```
الأسبوع 77-78: Beta Testing
├── Closed Beta (1000 players)
├── Bug Tracking
├── Performance Reports
├── Feedback Collection
└── Final Bug Fixes

الأسبوع 79-80: Launch
├── Steam Early Access Release
├── Windows Build
├── Server Hosting Partners
├── Community Launch Events
├── First Patch (Week 1 Hotfixes)
└── Post-Launch Roadmap Announcement
```

---

## 🗺️ خريطة التبعيات (ما يبني على ماذا)

```
Phase 0 (MVP)
  └── محرك الفوكسيل
       ├── Phase 1 (Single Player)
       │    ├── أنظمة البقاء
       │    ├── الكائنات والـ AI
       │    └── الصياغة والتطوير
       │         └── Phase 2 (Multiplayer)
       │              ├── الشبكة
       │              ├── العشائر والاقتصاد
       │              └── الـ Raiding والكهرباء
       │                   └── Phase 3 (Advanced)
       │                        ├── المركبات
       │                        ├── الزراعة والفصول
       │                        ├── المهارات والكوستات
       │                        └── الزنزانات والبوسات
       │                             └── Phase 4 (Polish)
       │                                  ├── الجرافيكس المتقدم
       │                                  ├── الصوت المتقدم
       │                                  ├── Modding API
       │                                  └── التلميع النهائي
       │                                       └── Phase 5 (Launch)
       │                                            └── الإصدار
```

---

## 📋 قائمة المهام التفصيلية — ابدأ من هنا

### ✅ المهمة الأولى: إعداد بيئة التطوير

```bash
# 1. تثبيت الأدوات الأساسية
sudo apt install build-essential cmake git vulkan-tools
# أو على Windows: تثبيت Visual Studio 2022 + Vulkan SDK

# 2. تجهيز المجلدات
mkdir -p KingCraft/src
mkdir -p KingCraft/assets
mkdir -p KingCraft/shaders

# 3. Clone المكتبات المساعدة
cd KingCraft
git submodule add https://github.com/glfw/glfw.git libs/glfw
git submodule add https://github.com/g-truc/glm.git libs/glm
git submodule add https://github.com/nothings/stb.git libs/stb
git submodule add https://github.com/Auburn/FastNoise2.git libs/fastnoise
```

### ✅ المهمة الثانية: إنشاء النافذة وحلقة اللعبة

```cpp
// main.cpp — أبسط بداية
#include <GLFW/glfw3.h>
#include <iostream>

int main() {
    glfwInit();
    GLFWwindow* window = glfwCreateWindow(1280, 720, "KingCraft", NULL, NULL);
    glfwMakeContextCurrent(window);
    
    double last_time = glfwGetTime();
    
    while (!glfwWindowShouldClose(window)) {
        double current_time = glfwGetTime();
        double delta_time = current_time - last_time;
        last_time = current_time;
        
        // تحديث اللعبة
        // update(delta_time);
        
        // الرسم
        // render();
        
        glfwSwapBuffers(window);
        glfwPollEvents();
    }
    
    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}
```

### ✅ المهمة الثالثة: تخزين الفوكسيل

```cpp
// ابدأ بـ 16×16×16 Chunk (بسيط)
struct SimpleChunk {
    uint16_t blocks[16 * 16 * 16];
    
    uint16_t& get(int x, int y, int z) {
        return blocks[(y * 16 + z) * 16 + x];
    }
};
```

### ✅ المهمة الرابعة: عرض أول مكعب

```cpp
// أبسط طريقة: عرض مكعب واحد في وسط الشاشة
// استخدم shader triangle بسيط
// أرسل vertex buffer لمكعب واحد (8 vertices, 12 triangles)
// لون المكعب حسب Block ID
```

---

## 🎯 نصيحة للبدء

**ابدأ صغيراً جداً.** لا تحاول بناء كل الأنظمة مرة واحدة.

الترتيب الصحيح للبدء:

1. ✅ **نافذة + Game Loop** ← يوم واحد
2. ✅ **Chunk واحد + عرض مكعبات** ← 3 أيام
3. ✅ **Greedy Meshing** ← أسبوع
4. ✅ **كاميرا + حركة** ← يومان
5. ✅ **Block Picking (Raycast)** ← يومان
6. ✅ **وضع وتكسير بلوكات** ← 3 أيام
7. ✅ **عالم لا نهائي (Chunk Loading)** ← أسبوع
8. ✅ **توليد عالم بسيط** ← أسبوع

بعد 3-4 أسابيع فقط سيكون لديك أساس لعبة كامل.  
من هناك، كل شيء يبنى فوق هذا الأساس.

---

**هل تريد أن نبدأ معاً؟ أخبرني بأي مرحلة تريد البدء فيها وسأكتب لك الكود الكامل خطوة بخطوة.** 🚀
