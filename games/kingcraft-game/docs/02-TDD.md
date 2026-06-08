# Technical Design Document (TDD)

> **Version:** 1.0  
> **Engine:** KingCraft Custom Engine  
> **Platform:** PC (Vulkan/Metal/DirectX 12)  
> **Language:** C++20 / Rust (Rendering), Lua/Python (Modding)

---

## Table of Contents
1. [Engine Architecture](#1-engine-architecture)
2. [ECS Architecture](#2-ecs-architecture)
3. [Rendering Pipeline](#3-rendering-pipeline)
4. [Physics System](#4-physics-system)
5. [World Storage & Chunk System](#5-world-storage--chunk-system)
6. [Network System](#6-network-system)
7. [Audio System](#7-audio-system)
8. [Plugin/Modding API](#8-pluginmodding-api)
9. [Memory Management](#9-memory-management)
10. [Performance Targets](#10-performance-targets)

---

## 1. Engine Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        KINGCRAFT ENGINE                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     APPLICATION LAYER                        │   │
│  │  Game State Manager │ Session Manager │ Console │ Debug UI │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      GAME LOGIC LAYER                        │   │
│  │  ECS World │ Chunk Manager │ Block Registry │ Item Registry │   │
│  │  Recipe Manager │ Loot System │ AI System │ Quest Manager  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     ENGINE SERVICES                          │   │
│  │  Physics │ Audio │ Network │ Input │ Asset Manager │ UI     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     RENDERING LAYER                          │   │
│  │  Vulkan Renderer │ Mesh Pass │ Voxel Pass │ Post-Process   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     PLATFORM LAYER                           │   │
│  │  Window Manager │ File I/O │ Thread Pool │ Memory Allocator │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Module Dependencies

```
kingcraft.core          →  Core types, math, logging, memory
kingcraft.platform      →  Window, input, file system
kingcraft.graphics      →  Vulkan/DX12 renderer
kingcraft.assets        →  Asset loading, texture compression
kingcraft.world         →  Chunks, blocks, world storage
kingcraft.ecs           →  Entity-Component-System
kingcraft.physics       →  Collision, fluids, structural integrity
kingcraft.network       →  UDP/TCP, replication, RPC
kingcraft.gameplay      →  Game logic, crafting, combat, AI
kingcraft.audio         →  FMOD/Wwise integration
kingcraft.ui            →  Immediate mode GUI / React-style UI
kingcraft.scripting     →  Lua/Python runtime
kingcraft.mods          →  Mod loading and sandboxing
```

### 1.3 Threading Model

```
MAIN THREAD (Game Logic)
├── ECS System Updates (20 tps)
├── Chunk Generation Requests
├── Network State Processing
└── Console/Command Processing

RENDER THREAD (Graphics)
├── Frame Buffer Management
├── GPU Command Buffer Recording
└── Swap Chain Presentation

WORKER THREAD POOL (8–16 threads)
├── Chunk Mesh Generation
├── Chunk Serialization/Deserialization
├── Pathfinding Calculations
├── AI Task Processing
├── World Generation
├── Physics Broadphase
└── Network Packet Compression

ASYNC I/O THREADS (2–4 threads)
├── Texture Loading
├── Model Loading
├── Region File Reads/Writes
└── Audio Stream Loading
```

---

## 2. ECS Architecture

### 2.1 Entity-Component-System Design

The ECS is based on the **EnTT** pattern (header-only, cache-friendly).

```
Entity = uint64_t ID
  - Version (8 bits)  → for ID recycling
  - Index   (56 bits) → entity index

Component = Plain old data (POD) structures
  - Position, Velocity, Health, Inventory, etc.
  - Stored in contiguous arrays (SoA or AoS)

System = Function operating on components
  - PhysicsSystem: Position + Velocity + Collider
  - RenderSystem: Position + Mesh + Material
  - AISystem: Position + AIBrain + Health
```

### 2.2 Component Definitions

```cpp
// Core Components
struct TransformComponent {
    glm::dvec3 position;     // 64-bit for large worlds
    glm::dquat rotation;
    glm::dvec3 scale;
};

struct VelocityComponent {
    glm::dvec3 linear;
    glm::dvec3 angular;
};

struct HealthComponent {
    float current;
    float max;
    float armor;
    float regen_rate;
    uint64_t last_damage_tick;
};

struct InventoryComponent {
    std::array<ItemStack, 40> slots;  // 36 main + 4 hotbar
};

struct AIBrainComponent {
    uint32_t current_task;
    uint64_t target_entity;
    std::vector<glm::ivec3> path;
    float aggro_range;
    float flee_range;
};

struct NetworkComponent {
    uint32_t network_id;
    bool dirty;               // needs replication
    float last_sync_time;
};

struct PlayerComponent {
    std::string username;
    uint64_t steam_id;
    uint32_t clan_id;
    float hunger, thirst, temperature, stamina;
};

struct RenderableComponent {
    uint32_t mesh_id;
    uint32_t material_id;
    bool visible;
    float render_distance;
};
```

### 2.3 System Pipeline

```
1. PRE_UPDATE
   - NetworkSystem::ReceivePackets
   - InputSystem::ProcessInput
   
2. FIXED_UPDATE (20 tps)
   - PhysicsSystem::Step
   - MovementSystem::Update
   - CombatSystem::ProcessHits
   - BlockInteractionSystem
   - FluidSystem::Simulate
   - AISystem::Update
   - QuestSystem::CheckProgress
   - WeatherSystem::Update

3. UPDATE (variable)
   - AnimationSystem::Tick
   - ParticleSystem::Update
   - SoundSystem::Update
   - UISystem::Update

4. LATE_UPDATE
   - NetworkSystem::SendUpdates
   - ChunkSystem::GenerateMeshes
   - ChunkSystem::SaveChunks

5. RENDER (separate thread)
   - FrustumCullingSystem
   - ChunkRenderSystem
   - EntityRenderSystem
   - ParticleRenderSystem
   - UIRenderSystem
```

---

## 3. Rendering Pipeline

### 3.1 Render Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RENDER GRAPH                                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌──────────────────┐       │
│  │  Depth Pre- │ → │  Opaque     │ → │  Alpha-Test     │       │
│  │  Pass       │    │  Geometry   │    │  Geometry       │       │
│  └─────────────┘    └─────────────┘    └──────────────────┘       │
│                            ↓                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     VOXEL RENDER PASS                         │   │
│  │  - Indirect draw (GPU culling)                               │   │
│  │  - Greedy mesh + baked AO textures                           │   │
│  │  - Tri-planar texturing                                      │   │
│  │  - Animated blocks (lava, water)                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            ↓                                        │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────────────┐       │
│  │  Transparent │ → │  Water      │ → │  Entity          │       │
│  │  Pass        │    │  Pass       │    │  Pass            │       │
│  └─────────────┘    └─────────────┘    └──────────────────┘       │
│                            ↓                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     LIGHTING PASS                             │   │
│  │  - Deferred shading                                          │   │
│  │  - Directional light (sun/moon)                              │   │
│  │  - Point lights (torches, lamps)                             │   │
│  │  - Ambient occlusion (SSAO)                                  │   │
│  │  - Shadow mapping (CSM)                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            ↓                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  POST-PROCESSING                             │   │
│  │  - Tone mapping (HDR → LDR)                                 │   │
│  │  - Bloom                                                   │   │
│  │  - Volumetric fog                                           │   │
│  │  - Depth of field                                           │   │
│  │  - Color grading                                            │   │
│  │  - Anti-aliasing (TAA/FXAA)                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Voxel Rendering Techniques

```
GREEDY MESHING:
- Combines adjacent same-type faces into single quads
- Reduces vertex count by 80–95%
- Rebuild mesh when any block in chunk changes
- Async rebuild on worker threads

BAKED AMBIENT OCCLUSION:
- Pre-compute AO for each visible face corner
- 4-bit AO value per corner (0–3 dark)
- Packed into vertex data (4×2 bits = 8 bits)

TEXTURE ATLASING:
- All block textures packed into 4096×4096 atlas
- UV coordinates baked into mesh data
- Supports animated textures (lava, water) via frame index

TRIPLANAR TEXTURING:
- Projects texture from 3 axes based on face normal
- Eliminates texture stretching on non-cardinal surfaces
- Blends between axes for smooth transitions

LOD SYSTEM:
- LOD 0: Full resolution (near chunks)
- LOD 1: 2×2 block merging (medium distance)
- LOD 2: 4×4 block merging (far distance)
- LOD 3: 8×8 block merging (horizon)
- LOD transition with vertex morphing
```

### 3.3 Chunk Mesh Format

```cpp
struct ChunkMesh {
    // Opaque geometry (greedy-meshed)
    struct OpaqueBatch {
        uint32_t vertex_offset;
        uint32_t index_offset;
        uint32_t index_count;
        uint32_t texture_index;
    };
    
    // Transparent geometry (individual quads, sorted)
    struct TransparentVertex {
        glm::vec3 position;
        glm::vec2 uv;
        uint32_t texture_index;
        float ao;
    };
    
    std::vector<OpaqueBatch> opaque_batches;
    std::vector<TransparentVertex> transparent_vertices;
    std::vector<uint32_t> transparent_indices;
    bool needs_rebuild;
};
```

---

## 4. Physics System

### 4.1 Physics Pipeline

```
BROAD PHASE (each tick):
- Sweep and Prune (SAP) along each axis
- Spatial hash grid for entity-entity collisions
- Octree for block-ray intersections

NARROW PHASE:
- AABB vs AABB for entities
- AABB vs block grid for terrain
- Ray-AABB for block selection/picking
- Sphere-AABB for explosion damage

RESOLUTION:
- Position correction
- Velocity resolution
- Friction application
- Resting contact detection

CONSTRAINTS:
- Block collision (voxel grid)
- Entity ground contact
- Fluid buoyancy
- Ladder climbing
- Vehicle suspension
- Rope/cable physics (for electricity wires)
```

### 4.2 Collision Shapes

| Shape | Use Case | Complexity |
|-------|----------|------------|
| AABB | Block collision, entities | O(1) |
| Block Grid | Terrain collision | O(chunk) |
| Ray | Block selection, bullets | O(log n) |
| Sphere | Explosion radius, area damage | O(n) |
| Capsule | Player/entity hitbox | O(1) |
| Convex Hull | Vehicles, complex entities | O(6 faces) |

### 4.3 Fluid Physics

```
FLUID SIMULATION (optimized cellular automata):

Each tick (every 2nd tick = 10 tps):
1. Calculate pressure from fluid level differences
2. Apply flow to adjacent blocks (down first, then horizontal)
3. Equalize levels between adjacent fluid blocks
4. Check for source block replenishment
5. Apply buoyancy to entities in fluid
6. Check for interactions:
   - Water + Lava → Cobblestone/Obsidian
   - Water + flowing Lava → Stone
   - Water on Soul Sand → Bubble column
   - Water on Campfire → Extinguish

OPTIMIZATIONS:
- Only simulate "active" fluid blocks (edges of fluid bodies)
- Batch updates per chunk
- Flag dirty chunks for mesh rebuild
- Limit flow iterations per tick (max 8 blocks spread/tick)
```

### 4.4 Structural Integrity

```
STRUCTURAL INTEGRITY SYSTEM:

- Each block has a structural load value
- Blocks check distance to nearest "ground" or structural support
- Max unsupported distance:
  - Wood: 4 blocks horizontal, 8 blocks vertical
  - Stone: 8 blocks horizontal, 16 blocks vertical
  - Metal: 12 blocks horizontal, 24 blocks vertical
  - Reinforced: 16 blocks horizontal, 32 blocks vertical

- If block exceeds max unsupported distance:
  1. Warning visual (crack effect)
  2. After 30 seconds, block breaks and drops as item
  3. Chain reaction if support blocks break

- Structural integrity check:
  - Runs on block placement, block removal, and explosion
  - BFS/DFS from each block to find nearest ground support
  - Only checks within loaded chunks
```

---

## 5. World Storage & Chunk System

### 5.1 Chunk Data Structure

```
CHUNK: 32×384×32 blocks (X×Y×Z)

Sub-chunk: 32×16×32 blocks (each)
- 24 sub-chunks per chunk (384/16 = 24)
- Each sub-chunk stores:
  - Block IDs:    uint16[16384] = 32 KB
  - Block States: uint16[16384] = 32 KB  
  - Light Data:   uint8[16384]  = 16 KB (packed sky+block light)
  
- Raw sub-chunk: 80 KB
- Compressed sub-chunk: 2–15 KB (RLE + LZ4/Zstd)
- Total chunk: ~360 KB compressed → 15–60 KB
```

### 5.2 Region File Format

Inspired by Minecraft's Anvil format but improved:

```
REGION FILE (.kcadata):
- Contains 16×16 chunks (32×32 region = 512×512 blocks)
- Header: 4 KB (4096 entries × 1 byte)
  - 16×16 chunk offset table: 2 bytes per chunk (relative offset)
  - 16×16 chunk size table: 2 bytes per chunk (compressed size)
  
- Data section:
  - Chunk data stored sequentially
  - Each chunk: [4-byte CRC32][4-byte uncompressed size][N-byte compressed data]
  - Compression: Zstd (level 3) for fast decompression

- Chunk status flags:
  0x00 = Empty (not generated)
  0x01 = Generated
  0x02 = Loaded in memory
  0x04 = Modified (needs save)
  0x08 = Pending generation

FILE NAMING: r.{region_x}.{region_z}.kcadata
REGION SIZE: 512×512 blocks × full height
MAX FILE SIZE: ~500 MB (compressed)
```

### 5.3 Chunk Lifecycle

```
UNLOADED → LOADING → LOADED → SAVING → UNLOADING → UNLOADED

↓

UNLOADED:
  - No data in memory
  - Region file may exist on disk

LOADING:
  - Async read from region file
  - If not on disk: trigger world generation
  - Decompression on worker thread

LOADED:
  - Full chunk data in memory
  - Block changes tracked with dirty flags
  - Mesh generation queued if dirty

SAVING:
  - Compress chunk data on worker thread
  - Write to region file
  - Update region header

UNLOADING:
  - Write if dirty
  - Clear mesh data
  - Remove from active chunk list

LOAD DISTANCE:
  - Near: 4 chunks (64m) → full simulation + meshing
  - Mid: 12 chunks (192m) → simulation + LOD meshing
  - Far: 32 chunks (512m) → no simulation, LOD only
  - Horizon: 64 chunks (1024m) → minimal LOD impostors
```

### 5.4 Chunk Loading Strategies

```
PRIORITY QUEUE:
1. View-dependent: nearest chunks to player highest priority
2. Streaming: distance-based load/unload radius
3. Pre-generation: opposite to movement direction

MULTI-THREADED PIPELINE:
  MAIN THREAD:    Issue load request, update chunk states
  WORKER THREADS: Decompress/compress, mesh generation, world gen
  ASYNC I/O:      Region file reads/writes

LOAD LIMITS:
  - Max 32 chunks loading per tick (to prevent lag spikes)
  - Max 8 chunks saving per tick
  - Mesh generation limited to 4 per worker per tick
  - Prioritize player's current chunk
```

---

## 6. Network System

### 6.1 Network Architecture

```
┌─────────────┐         ┌─────────────────┐         ┌─────────────┐
│   CLIENT    │ ◄─UDP──►│   GAME SERVER   │◄──UDP──►│   CLIENT    │
│   (Player)  │         │  (Authority)    │         │   (Player)  │
└─────────────┘         └────────┬────────┘         └─────────────┘
                                 │
                                 ├──DB──►[Database Server]
                                 ├──API──►[Web Server / REST]
                                 └──Log──►[Analytics Server]

PROTOCOL:
- Transport: UDP (RakNet/ENet-like custom layer)
- Reliability: Per-message reliability flags
- Ordering: Channel-based ordering (8 channels)
- Sequencing: Message sequence numbers with ACK
- Encryption: AES-256-GCM per connection
- Compression: LZ4 per-packet, Zstd for bulk sync
```

### 6.2 Network Channels

| Channel | Reliability | Ordering | Use |
|---------|-------------|----------|-----|
| 0 (Critical) | Reliable+Seq | Ordered | Entity spawn, inventory changes |
| 1 (State) | Reliable | Ordered | Health, position corrections |
| 2 (Movement) | Unreliable | Unordered | Player input, movement prediction |
| 3 (Blocks) | Reliable | Ordered | Block place/break |
| 4 (Chat) | Reliable | Ordered | Chat messages, commands |
| 5 (Voice) | Unreliable | Unordered | Voice chat (Opus codec) |
| 6 (Events) | Reliable | Ordered | Game events, quest updates |
| 7 (Bulk) | Reliable+Seq | Ordered | World sync, initial join data |

### 6.3 Packet Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PACKET FORMAT                                │
├─────────────────────────────────────────────────────────────────────┤
│ Bit 0-15:   Packet ID (0–65535)                                     │
│ Bit 16-23:  Channel ID (0–7)                                        │
│ Bit 24-31:  Flags (Reliable, Seq, Ack, Compressed)                  │
│ Bit 32-47:  Sequence Number (wraps at 65535)                        │
│ Bit 48-63:  Ack Number (last received seq)                          │
│ Bit 64-79:  Fragment ID (for fragmented packets)                    │
│ Bit 80-95:  Length (payload size)                                   │
│ Bit 96+:    Payload (encrypted + optionally compressed)             │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.4 Server Authority & Anti-Cheat

```
SERVER AUTHORITY:
  - All block changes: server validates and applies
  - Player position: client sends input → server simulates → correction
  - Combat damage: server calculates damage based on server-side state
  - Item drops: server creates/destroys items
  - Crafting: server validates recipes and ingredients
  
ANTI-CHEAT MEASURES:
  1. Server-side simulation: Client is always corrected
  2. Position validation: Max speed check, no-clip detection
  3. Block interaction validation: Must be within reach distance
  4. Combat validation: Must face target, within weapon range
  5. Inventory validation: Server tracks every inventory operation
  6. Rate limiting: Max actions per second enforced
  7. Inconsistency detection: Mismatched client/server state = kick
  8. CRC checksums: Game file integrity check on join
  9. Packet replay protection: Sequence numbers prevent replay
  10. Floating-point determinism: Lockstep-compatible math

CLIENT PREDICTION:
  - Client simulates player movement immediately
  - Server sends authoritative position every 5 ticks (250ms)
  - Client reconciles on mismatch (snap or lerp)
  - Entity interpolation: Render previous + current state with lerp
```

### 6.5 Network Replication System

```
ENTITY REPLICATION:
  - Each entity has a NetworkId (uint32)
  - Entities are replicated to clients based on distance
  - Relevancy: Only entities within client's view distance are sent
  - Interest management: 2D grid-based (chunks)

REPLICATION FREQUENCY:
  - Player: 20 updates/sec (position, rotation, state)
  - Mob: 10 updates/sec (position, health, AI state)
  - Projectile: 20 updates/sec (position, velocity)
  - Item drop: 5 updates/sec (position)
  - Block entity: On change only (inventory, state)

DELTA COMPRESSION:
  - First sync: Full entity state
  - Subsequent updates: Only changed fields
  - World sync: Region-based, only newly loaded chunks
  - Entity spawn: Full state once, then deltas
```

---

## 7. Audio System

### 7.1 Audio Architecture

```
AUDIO ENGINE: FMOD Studio (licensable) or Steam Audio (free)

CHANNELS:
  - Master: 0 dB
  - SFX: -6 dB
  - Music: -12 dB
  - Voice: -3 dB
  - Ambient: -9 dB
  - UI: -3 dB

3D AUDIO:
  - HRTF-based spatialization
  - Occlusion: Blocks between listener and source muffle sound
  - Reverb zones: Based on biome/enclosed space
  - Doppler shift: For fast-moving entities
  - Distance model: Logarithmic rolloff (min=1m, max=50m)
```

---

## 8. Plugin/Modding API

### 8.1 Modding Architecture

```
MOD TYPES:
  1. Content Packs (.kcpack):
     - JSON-defined blocks, items, recipes, loot tables
     - No code execution, pure data
  
  2. Script Mods (.kcsmod):
     - Lua 5.4 scripts
     - Full API access to ECS, world, events
     - Sandboxed with resource limits
  
  3. Native Mods (.kcmmod):
     - Compiled DLL/SO (C++/Rust)
     - Full engine access
     - Steam Workshop integration

MOD LOADING:
  1. Load manifest.json
  2. Validate dependencies
  3. Load assets (textures, models, sounds)
  4. Register blocks/items/entities
  5. Execute init scripts
  6. Hook into game events
```

### 8.2 Lua API Example

```lua
-- Register a custom block
kingcraft.blocks.register({
    id = "my_mod:super_ore",
    hardness = 3.0,
    resistance = 6.0,
    tool_type = "pickaxe",
    min_tier = 3,
    drops = "my_mod:super_ingot",
    textures = {
        all = "my_mod:textures/blocks/super_ore.png"
    }
})

-- Register a recipe
kingcraft.recipes.register({
    type = "shaped",
    pattern = {"###", "#X#", "###"},
    key = {
        ["#"] = { item = "kingcraft:iron_ingot" },
        ["X"] = { item = "kingcraft:diamond" }
    },
    result = { item = "my_mod:super_ingot", count = 2 }
})

-- Listen to events
kingcraft.events.on("player_block_break", function(player, block_pos, block_id)
    if block_id == "my_mod:super_ore" then
        kingcraft.particles.spawn(block_pos, "explosion", 10)
        kingcraft.sound.play("my_mod:super_explosion", block_pos)
    end
end)

-- Create a custom entity
local my_npc = kingcraft.entities.create("kingcraft:npc", {x=100, y=64, z=200})
my_npc:set_component("health", {current=100, max=100})
my_npc:set_component("ai_brain", {
    task = "guard",
    patrol_points = {{x=100, y=64, z=200}, {x=110, y=64, z=200}}
})
```

---

## 9. Memory Management

### 9.1 Memory Budget (PC Target: 16 GB RAM)

| System | Memory Budget | Notes |
|--------|--------------|-------|
| World Data | 2–4 GB | Based on view distance |
| Textures | 1 GB | Atlas + mipmaps |
| Meshes | 512 MB | Chunk + entity meshes |
| Audio | 256 MB | Sound banks |
| Game State | 512 MB | ECS, items, entities |
| Network | 256 MB | Packet buffers |
| UI | 128 MB | Fonts, UI textures |
| Runtime | 1 GB | Stack, heap, overhead |
| **Total** | **~6–8 GB** | Below 16 GB target |

### 9.2 Memory Optimization Strategies

```
- Custom allocators:
  - Stack allocator for per-frame data (particles, debug draw)
  - Pool allocator for entities, components
  - Slab allocator for chunk data
  - Free list for block entities (variable size)

- Memory-mapped I/O:
  - Region files mmap'd for fast block reads
  - OS handles page cache automatically

- Reference counting:
  - Shared textures between chunk faces
  - Shared materials between entities

- Streaming:
  - Distance-based asset streaming
  - LOD0 textures only for near chunks
  - Remote (unloaded) chunks in compressed form only
```

---

## 10. Performance Targets

### 10.1 Frame Budget (60 FPS = 16.67ms)

| System | Budget (ms) | Notes |
|--------|-------------|-------|
| Physics | 2.0 | 32×32 world area |
| AI | 1.0 | Max 200 active entities |
| Network | 1.0 | Receive + process + send |
| World Gen | 0.5 | Async, but budget for requests |
| Chunk Meshing | 2.0 | Async on workers |
| Game Logic | 1.0 | Crafting, inventory, etc. |
| **Total Game** | **7.5** | |
| Render | 6.0 | Draw calls, shading |
| Post-Process | 2.0 | Bloom, fog, AA |
| **Total Render** | **8.0** | |
| **Total Frame** | **15.5** | Leaves 1ms headroom |

### 10.2 Chunk Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Chunk Load (disk) | <5ms | Async, compressed |
| Chunk Generate | <50ms | Full terrain + features |
| Chunk Mesh Gen | <20ms | Greedy meshing |
| Chunk Save | <10ms | Compress + write |
| Block Update | <0.01ms | Single block change |
| Chunk Lighting | <15ms | Flood fill |

### 10.3 Scalability Targets

| Metric | Minimum | Recommended | Optimal |
|--------|---------|-------------|---------|
| RAM | 8 GB | 16 GB | 32 GB |
| GPU | GTX 1060 | RTX 2070 | RTX 4080 |
| CPU | 4 cores | 8 cores | 16 cores |
| VRAM | 2 GB | 6 GB | 12 GB |
| View Distance | 8 chunks | 16 chunks | 32 chunks |
| Players | 50 | 100 | 200 |
| Entities | 500 | 1000 | 2000 |

---

*End of Technical Design Document*

Next: [Block System →](./03-BLOCKS.md)
