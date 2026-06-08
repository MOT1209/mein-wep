# ECS Architecture — Entity-Component-System Design

---

## 1. ECS Overview

KingCraft uses a high-performance Entity-Component-System architecture based on the **EnTT** pattern with archetype-like storage for cache efficiency.

### 1.1 Core Concepts

```
ENTITY = uint64_t handle
  - Bit 0-55: Index (56 bits) → 72 quadrillion entities
  - Bit 56-63: Version (8 bits) → entity ID recycling
  
COMPONENT = Plain-old-data struct
  - Position, Velocity, Health, Inventory, etc.
  - Stored in contiguous arrays (SoA per component type)
  
SYSTEM = Pure function operating on component slices
  - PhysicsSystem: Position + Velocity → update positions
  - RenderSystem: Position + Mesh → queue draw calls
  - AISystem: Position + AIBrain → compute next action
  
ARCHETYPE = Unique combination of component types
  - Player: [Transform, Velocity, Health, Inventory, PlayerTag, Network, Renderable]
  - Zombie: [Transform, Velocity, Health, AIBrain, MobTag, Renderable]
  - Item: [Transform, ItemStack, Renderable]
  - Projectile: [Transform, Velocity, Projectile, Renderable]
```

---

## 2. Component Definitions

### 2.1 Transform Components

```cpp
// World position (64-bit for large worlds)
struct Position {
    double x, y, z;                // 24 bytes
};

// Rotation (quaternion)
struct Rotation {
    double x, y, z, w;             // 32 bytes
};

// Velocity (linear + angular)
struct Velocity {
    double x, y, z;                // linear velocity (24 bytes)
    double ax, ay, az;             // angular velocity (24 bytes)
};

// Scale (uniform)
struct Scale {
    double x, y, z;                // 24 bytes
};
```

### 2.2 Gameplay Components

```cpp
struct Health {
    float current;                 // 4 bytes
    float max;                     // 4 bytes
    float armor;                   // 4 bytes
    float regen_rate;              // HP per second (4 bytes)
    uint64_t last_damage_time;     // timestamp (8 bytes)
    uint32_t damage_source;        // entity ID of last attacker (4 bytes)
    // Total: 28 bytes
};

struct Hunger {
    float food_level;              // 0-20 (4 bytes)
    float saturation;              // 0-20 (4 bytes)
    float exhaustion;              // 0-4 (4 bytes)
    // Total: 12 bytes
};

struct Thirst {
    float water_level;             // 0-20 (4 bytes)
    float saturation;              // 0-20 (4 bytes)
    // Total: 8 bytes
};

struct Stamina {
    float current;                 // 0-100 (4 bytes)
    float max;                     // 100 (4 bytes)
    float regen_rate;              // per second (4 bytes)
    // Total: 12 bytes
};

struct Inventory {
    // Stored as pointer to dynamic array
    ItemStack* slots;              // 8 bytes (64-bit pointer)
    uint16_t slot_count;           // 2 bytes
    uint16_t hotbar_start;         // 2 bytes
    uint16_t armor_start;          // 2 bytes
    uint16_t offhand_slot;         // 2 bytes
    // Total: 16 bytes + dynamic allocation
};

struct Equipment {
    uint32_t mainhand;             // item ID (4 bytes)
    uint32_t offhand;              // item ID (4 bytes)
    uint32_t helmet;               // item ID (4 bytes)
    uint32_t chestplate;           // item ID (4 bytes)
    uint32_t leggings;             // item ID (4 bytes)
    uint32_t boots;                // item ID (4 bytes)
    // Total: 24 bytes
};
```

### 2.3 AI Components

```cpp
struct AIBrain {
    uint16_t current_task;         // AI task enum (2 bytes)
    uint16_t task_priority;        // 0-255 (2 bytes)
    uint32_t target_entity;        // entity to attack/follow (4 bytes)
    double target_x, target_y, target_z;  // target position (24 bytes)
    uint32_t path_index;           // current path node index (4 bytes)
    float aggro_range;             // detection range (4 bytes)
    float flee_range;              // flee trigger range (4 bytes)
    uint32_t state_timer;          // ticks in current state (4 bytes)
    // Total: 48 bytes
};

struct Pathfinding {
    uint32_t* path_nodes;          // dynamic array (8 bytes)
    uint16_t path_length;          // (2 bytes)
    uint16_t path_index;           // (2 bytes)
    uint32_t last_recalc;          // tick of last path recalc (4 bytes)
    // Total: 16 bytes + dynamic
};
```

### 2.4 Network Components

```cpp
struct NetworkSync {
    uint32_t network_id;           // replicated entity ID (4 bytes)
    uint8_t update_rate;           // updates per second (1 byte)
    uint8_t relevance_radius;      // in chunks (1 byte)
    uint16_t dirty_flags;          // which fields changed (2 bytes)
    float last_sync_time;          // for throttling (4 bytes)
    // Total: 12 bytes
};
```

### 2.5 Physics Components

```cpp
struct Collider {
    AABB bounding_box;             // min/max (24 bytes)
    // Total: 24 bytes
};

struct RigidBody {
    double mass;                   // (8 bytes)
    double friction;               // (8 bytes)
    double restitution;            // bounciness (8 bytes)
    bool is_static;                // (1 byte)
    bool is_kinematic;             // (1 byte)
    // Total: 26 bytes
};
```

### 2.6 Render Components

```cpp
struct MeshRenderer {
    uint32_t mesh_id;              // index into mesh cache (4 bytes)
    uint32_t material_id;          // index into material cache (4 bytes)
    uint16_t render_layer;         // opaque, transparent, overlay (2 bytes)
    bool visible;                  // (1 byte)
    float render_distance;         // (4 bytes)
    // Total: 15 bytes
};
```

---

## 3. System Pipeline

```cpp
enum class SystemPhase {
    PRE_UPDATE,     // Network receive, input processing
    FIXED_UPDATE,   // Physics, AI, gameplay (20 tps)
    UPDATE,         // Animation, particles, effects
    LATE_UPDATE,    // Network send, chunk management
    RENDER          // Draw calls (separate thread)
};

struct System {
    const char* name;
    SystemPhase phase;
    void (*update)(double delta_time, EntityRegistry& registry);
    uint32_t priority;  // lower = earlier
};
```

### 3.1 System Order

```
PRE_UPDATE (priority order):
  1. NetworkReceiveSystem    — Receive & queue incoming packets
  2. InputSystem             — Process player input (keyboard/mouse)
  3. CommandSystem           — Execute console commands

FIXED_UPDATE (20 tps):
  1. MovementSystem          — Apply velocity to position
  2. PhysicsSystem            — Collision detection & resolution
  3. GravitySystem            — Apply gravity to entities
  4. FluidSystem              — Fluid simulation (tick)
  5. BlockPhysicsSystem       — Sand/gravel fall, waterlogging
  6. AISystem                 — Entity AI decision making
  7. CombatSystem             — Damage processing, death checks
  8. HungerThirstSystem       — Hunger/thirst depletion
  9. HealthRegenSystem        — Health regeneration
  10. WeatherSystem           — Weather state machine
  11. SeasonSystem            — Seasonal changes
  12. CropGrowthSystem        — Plant growth updates
  13. TreeGrowthSystem        — Sapling → tree growth
  14. FurnaceSystem           — Furnace/brewing progress
  15. SpawningSystem          — Mob spawning
  16. DespawnSystem           — Entity despawn timer
  17. ChunkLoadSystem         — Chunk loading/unloading
  18. LightingSystem          — Block light updates
  19. NetworkServerSystem     — Process incoming game messages
  20. NetworkReplicateSystem  — Mark dirty entities for sync

UPDATE (variable):
  1. AnimationSystem          — Skeletal animation, block animation
  2. ParticleSystem           — Particle spawning & updating
  3. SoundSystem              — Sound events & positioning
  4. QuestSystem             — Quest progress tracking
  5. AchievementSystem        — Achievement checking
  6. SkillSystem              — Skill XP tracking

LATE_UPDATE:
  1. ChunkMeshSystem         — Queue rebuilds for dirty chunks
  2. NetworkSendSystem        — Serialize & send pending packets
  3. ChunkSaveSystem          — Async save of modified chunks
  4. ProfilerSystem          — Performance metrics
```

---

## 4. Memory Layout

```
ENTITY COMPONENT STORAGE (Archetype-based):

Archetype: Player (Position, Velocity, Health, Inventory, PlayerTag)

Position[]    [p0][p1][p2][p3][p4]...  (contiguous array)
Velocity[]    [v0][v1][v2][v3][v4]...  (contiguous array)
Health[]      [h0][h1][h2][h3][h4]...  (contiguous array)
Inventory[]   [i0][i1][i2][i3][i4]...  (contiguous array)
PlayerTag[]   [t0][t1][t2][t3][t4]...  (contiguous array)

EntityID[]    [e0][e1][e2][e3][e4]...  (maps to component index)

ARCHETYPE CHUNK SIZE: 8192 entities (fixed)
When chunk is full → new chunk allocated
When chunk is half-empty → merge with other half-empty chunks
```

---

*End of ECS Architecture Document*

Next: [Rendering Pipeline →](./12-RENDERING.md)
