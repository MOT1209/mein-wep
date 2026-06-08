# Physics System

---

## 1. Physics Pipeline

### 1.1 Broad Phase

```
SPATIAL HASH GRID:
  - Cell size: 4 blocks (4m)
  - Each entity tracked in its current cell(s)
  - Only test collisions between entities in same or adjacent cells
  - Cell updates when entity moves to new cell
  
CHUNK-BASED TERRAIN:
  - Terrain collision uses direct chunk lookup (no broad phase needed)
  - Block position from entity position: floor(entity.pos / block_size)
  - O(1) lookup per block position

BROAD PHASE BUDGET: <0.1ms per tick
```

### 1.2 Narrow Phase

```
ENTITY vs TERRAIN:
  - For each axis (X, Y, Z) independently:
    1. Find all blocks overlapping entity AABB
    2. For each overlapping block:
       a. Check if block is solid (collision shape not 'none')
       b. Calculate penetration depth
       c. Push entity out of block (position correction)
       d. Zero velocity in that axis
  - Iterate 3 times for stability (sequential impulse)

ENTITY vs ENTITY:
  - AABB overlap test
  - If overlapping:
    1. Calculate MTV (minimum translation vector)
    2. Apply position correction to both entities (mass-weighted)
    3. Apply restitution impulse
  
RAY vs TERRAIN:
  - DDA (Digital Differential Analyzer) ray marching
  - Step through blocks along ray
  - Check each block for intersection
  - Return first non-air block hit
  - Max steps: 64 (for performance)

NARROW PHASE BUDGET: <1.0ms per tick
```

### 1.3 Resolution

```
POSITION CORRECTION:
  - Correct overlap by pushing entities apart
  - Mass-weighted: heavier entity moves less
  - Friction applied based on contact surface
  
VELOCITY RESOLUTION:
  - Normal velocity zeroed for ground contacts
  - Tangential velocity preserved (sliding)
  - Restitution applied to bounce velocity
  - Damping applied per-axis: 0.8 (horizontal), 0.9 (vertical)
```

---

## 2. Collision Shapes

### 2.1 Block Collision Shapes

```cpp
enum class BlockShape {
    FULL_BLOCK,      // 1×1×1 cube (most blocks)
    SLAB_BOTTOM,     // 1×0.5×1 bottom half
    SLAB_TOP,        // 1×0.5×1 top half
    STAIR,           // Complex stair shape (8 variants)
    FENCE_POST,      // 0.25×1×0.25 post
    FENCE_RAIL,      // 0.25×0.25×1 rail (4 directions)
    WALL_POST,       // 1×1×1 with 0.25×0.5×1 arms
    DOOR_LOWER,      // Thin 0.1875×1×1 (closed) or 0.1875×1×0.1875 (open)
    DOOR_UPPER,      // Same as lower, links to lower
    PANE,            // Thin 0.0625×1×1 glass/iron bar
    NONE,            // No collision (air, water, plants)
    CUSTOM           // Per-block entity collision
};
```

### 2.2 Entity Collision Shapes

```cpp
struct CapsuleCollider {
    float radius;             // 0.3 (player)
    float height;             // 1.8 (player standing)
    float half_height;        // 0.9 (center to top/bottom)
};

struct BoxCollider {
    Vec3 half_extents;        // 0.3 × 0.975 × 0.3 (player)
};

struct SphereCollider {
    float radius;             // projectiles, small mobs
};

struct MeshCollider {
    // Complex hull for vehicles
    // Convex decomposition of vehicle mesh
    std::vector<Vec3> hull_vertices;
    std::vector<uint32_t> hull_indices;
};
```

---

## 3. Fluid Physics

### 3.1 Fluid Simulation Model

```
Simplified 2D cellular automata (height-field) with 3D source concept:

For each fluid block:
  1. If source block: level stays at 8 (max)
  2. If not source and no adjacent source: decays by 1 per tick
  3. Flow to adjacent/5 horizontal + downward direction
  4. Equalize: distribute level difference to neighbors
  5. Pressure: if level > neighbor, flow to neighbor

FLUID PROPERTIES:
  Water:    
    - Viscosity: 5 ticks per spread
    - Max flow: 8 blocks from source
    - Source block: infinite (level 8)
    
  Lava:     
    - Viscosity: 30 ticks per spread (slow)
    - Max flow: 4 blocks from source
    - Source block: infinite
    
  Oil:      
    - Viscosity: 15 ticks per spread
    - Max flow: 6 blocks from source

Update frequency: 10 tps (every other game tick)
Batch updates: 512 fluid blocks per tick max
```

### 3.2 Fluid-Entity Interaction

```
BUOYANCY:
  - Entities in fluid receive upward force
  - Buoyancy force = fluid_density × volume_displaced × gravity
  - Water density: 1.0 (player floats at surface)
  - Lava density: 2.0 (player floats higher, takes damage)
  - Oil density: 0.8 (player partially submerged)

DRAG:
  - Fluid applies drag to entity movement
  - Water drag: 0.8 × velocity per tick
  - Lava drag: 0.9 × velocity per tick (thick)
  - Oil drag: 0.85 × velocity per tick

DROWNING:
  - Player underwater: air supply = 15 seconds
  - Air decreases while head in fluid block
  - Air replenishes ~1s after head exits fluid
  - At 0 air: 2 damage per second
```

---

## 4. Projectile Physics

### 4.1 Ballistics

```cpp
struct ProjectilePhysics {
    double drag_coefficient;     // 0.01 (bullet) to 0.1 (arrow)
    double gravity_scale;        // 1.0 (normal) to 0.0 (laser)
    double initial_speed;        // m/s
    bool pierces;                // goes through entities
    bool penetrates;             // goes through thin blocks
    bool explodes_on_impact;     // rocket/grenade
    float explosion_radius;      // AoE damage radius
    float lifetime;              // seconds before despawn
};
```

### 4.2 Collision with Terrain

```
PROJECTILE VS BLOCK:
  - DDA ray step through blocks
  - Check if block is solid at each step
  - On hit:
    - If penetrates: continue with reduced speed (50%)
    - If not: stop, trigger explosion if explosive
    - If arrow: stick in block (1 min despawn)

PROJECTILE VS ENTITY:
  - Sphere vs entity capsule/collider test
  - On hit:
    - Apply damage to entity
    - If pierces: continue through entity (reduced damage 50%)
    - If not: stop at entity
```

---

## 5. Structural Integrity

### 5.1 Support Calculation

```
SUPPORT CHECK (runs on block place/remove/explosion):

For each block within 16 blocks of change:
  1. BFS upward from nearest ground/support:
     - Start: blocks resting on solid ground or structural support
     - Distance max: horizontal 12, vertical 32 (varies by material)
     - Material multiplier: wood=1.0, stone=1.5, metal=2.0, reinforced=3.0
     
  2. If block exceeds max unsupported distance:
     - Mark as unstable (visual crack effect)
     - Start 30-second timer
     - If timer expires without support: block breaks, drops item
     - Chain reaction: neighbors also checked

  3. Structural strength:
     - Each block has load capacity
     - Load = sum of weights of blocks above
     - If load > capacity: block cracks, eventually breaks
```

---

*End of Physics System Document*

Next: [Performance & Memory Budget →](./14-PERFORMANCE.md)
