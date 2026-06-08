# Performance & Memory Budget

---

## 1. Memory Budget Analysis

### 1.1 Total Memory Breakdown (16 GB System)

| Category | Budget | % Total | Details |
|----------|--------|---------|---------|
| World Data | 3.5 GB | 22% | Chunks, block data, lighting |
| Textures | 1.2 GB | 7.5% | Atlas, mipmaps, normal maps |
| Meshes | 512 MB | 3% | Chunk meshes, entity meshes |
| Audio | 256 MB | 1.5% | Sound banks, streaming |
| Game State | 768 MB | 4.5% | ECS, entities, items |
| Network | 256 MB | 1.5% | Packet buffers, connections |
| UI | 128 MB | 0.75% | Fonts, UI textures |
| OS/Runtime | 2 GB | 12.5% | OS, drivers, engine runtime |
| **Total Active** | **~8.6 GB** | **54%** | |
| **Headroom** | **~7.4 GB** | **46%** | For OS, other apps, spikes |

### 1.2 Per-Chunk Memory Cost

```
RAW CHUNK DATA:
  Block IDs:     32 × 384 × 32 × 2 bytes     = 786,432  (768 KB)
  Block States:  32 × 384 × 32 × 2 bytes     = 786,432  (768 KB)
  Light Data:    32 × 384 × 32 × 1 byte       = 393,216  (384 KB)
  Heightmap:     32 × 32 × 2 bytes            = 2,048    (2 KB)
  ─────────────────────────────────────────────────────────
  Total Raw:                                  = 1,968,128 (~1.9 MB)

COMPRESSED CHUNK DATA (in memory):
  Using RLE + palette encoding:
  Average compression ratio: 8:1
  Average compressed size: ~240 KB

CHUNK MESH DATA:
  Opaque vertices: ~2000 vertices × 32 bytes  = 64 KB
  Transparent vertices: ~500 vertices × 32    = 16 KB
  Indices: ~7500 × 4 bytes                    = 30 KB
  ─────────────────────────────────────────────────────────
  Total Mesh:                                 ~110 KB per chunk

TOTAL PER CHUNK (loaded + meshed): ~350 KB

MEMORY FOR 32 CHUNK VIEW DISTANCE:
  Loaded chunks: (32 × 2 + 1)² = 4225 chunks
  Memory: 4225 × 350 KB ≈ 1.48 GB

MEMORY FOR 16 CHUNK VIEW DISTANCE (recommended):
  Loaded chunks: (16 × 2 + 1)² = 1089 chunks
  Memory: 1089 × 350 KB ≈ 381 MB

MEMORY FOR 8 CHUNK VIEW DISTANCE (minimum):
  Loaded chunks: (8 × 2 + 1)² = 289 chunks  
  Memory: 289 × 350 KB ≈ 101 MB
```

### 1.3 Entity Memory Cost

```
COMPONENT ARRAYS (per archetype chunk of 8192 entities):
  Position:     8192 × 24 bytes  = 196,608  (192 KB)
  Velocity:     8192 × 24 bytes  = 196,608  (192 KB)
  Health:       8192 × 28 bytes  = 229,376  (224 KB)
  AIBrain:      8192 × 48 bytes  = 393,216  (384 KB)
  Network:      8192 × 12 bytes  = 98,304   (96 KB)
  
  Total per archetype chunk: ~1.1 MB

ACTIVE ENTITIES: 2000 max on server
  × ~200 bytes per entity (avg) ≈ 400 KB total entity data
```

### 1.4 Texture Memory

```
BLOCK TEXTURE ATLAS:
  Resolution: 4096 × 4096 × 4 bytes (RGBA)  = 67.1 MB
  Mip chain (11 levels): × 1.33               = 89.2 MB
  Normal map atlas: 4096 × 4096 × 4           = 67.1 MB
  PBR map atlas: 4096 × 4096 × 4              = 67.1 MB
  ─────────────────────────────────────────────────────
  Total Block Textures:                       ~224 MB

ENTITY TEXTURES:
  Mob/player atlases (2048 × 2048 × 6 atlases) = 96 MB
  Item icons (1024 × 1024 atlas)               = 16 MB
  UI textures (2048 × 2048)                   = 16 MB

ENVIRONMENT TEXTURES:
  Skybox (cubemap 6 × 1024 × 1024)           = 24 MB
  Cloud textures                              = 8 MB
  Water/fluid textures                        = 16 MB

TOTAL TEXTURES: ~400 MB (compressed) → ~1.2 GB (uncompressed in VRAM)
```

---

## 2. Performance Budget

### 2.1 CPU Frame Budget (60 FPS = 16.67ms)

```
┌────────────────────────────────────────────────────────────┐
│                 CPU FRAME BUDGET (16.67ms)                  │
├────────────────────────────────────────────────────────────┤
│ Game Logic (Main Thread):                                   │
│   Physics & Movement:          1.5ms                        │
│   AI System:                   1.0ms                        │
│   Block Updates:               0.5ms                        │
│   Entity System:               0.5ms                        │
│   Crafting/Inventory:          0.3ms                        │
│   Network Processing:          1.0ms                        │
│   Chunk Management:            0.5ms                        │
│   Fluid Simulation:            0.3ms                        │
│   Weather/Lighting:            0.2ms                        │
│   ──────────────────────                                    │
│   Total Game Logic:           ~5.8ms                        │
│                                                              │
│ Render Thread:                                                │
│   Frustum Culling:             0.3ms                        │
│   Draw Call Dispatch:          0.5ms                        │
│   G-Buffer Pass:               2.0ms                        │
│   Shadow Pass:                 1.0ms                        │
│   Lighting Pass:               1.5ms                        │
│   Transparent Pass:            0.5ms                        │
│   Water Pass:                  0.3ms                        │
│   Post-Processing:             1.5ms                        │
│   UI Pass:                     0.3ms                        │
│   ──────────────────────                                    │
│   Total Render:               ~7.9ms                        │
│                                                              │
│ Other:                                                       │
│   GPU Wait/Submission:         1.0ms                        │
│   Thread Sync Overhead:        0.5ms                        │
│   ──────────────────────                                    │
│   Total Other:               ~1.5ms                         │
│                                                              │
│ TOTAL:                       ~15.2ms                        │
│ HEADROOM:                    ~1.5ms (9%)                   │
└────────────────────────────────────────────────────────────┘
```

### 2.2 Thread Utilization

```
┌──────────────────────────────────────────────────────────┐
│                    CPU THREAD UTILIZATION                │
├────────────┬────────┬────────┬────────┬──────────────────┤
│ Thread     │ Budget │ Actual │ % Util │ Notes            │
├────────────┼────────┼────────┼────────┼──────────────────┤
│ Main       │ 16.67ms│ 5.8ms  │ 35%    │ Game logic       │
│ Render     │ 16.67ms│ 7.9ms  │ 47%    │ Draw calls       │
│ Worker 1   │ 16.67ms│ 8.0ms  │ 48%    │ Chunk meshing    │
│ Worker 2   │ 16.67ms│ 7.0ms  │ 42%    │ World gen        │
│ Worker 3   │ 16.67ms│ 5.0ms  │ 30%    │ AI + pathfinding  │
│ Worker 4   │ 16.67ms│ 4.0ms  │ 24%    │ Decompression    │
│ Worker 5   │ 16.67ms│ 3.0ms  │ 18%    │ Io + file access │
│ Audio      │ 16.67ms│ 2.0ms  │ 12%    │ Audio mixing     │
│ Network    │ 16.67ms│ 3.0ms  │ 18%    │ Net I/O          │
└────────────┴────────┴────────┴────────┴──────────────────┘
```

### 2.3 Network Bandwidth

```
┌──────────────────────────────────────────────────────────┐
│              NETWORK BANDWIDTH PER PLAYER                │
├────────────────────────┬──────────┬──────────────────────┤
│ Stream                 │ Bandwidth│ Notes                │
├────────────────────────┼──────────┼──────────────────────┤
│ Player Input           │ 2 KB/s   │ 20 packets/s         │
│ Player State           │ 2 KB/s   │ 20 packets/s (delta) │
│ Entity Updates         │ 8 KB/s   │ 10-20 entities       │
│ Block Updates          │ 4 KB/s   │ On change events     │
│ Chunk Sync             │ 1 KB/s   │ New chunks only      │
│ Audio (Voice)          │ 8 KB/s   │ Opus 64 kbps         │
│ Audio (World)          │ 2 KB/s   │ Positional sounds    │
│ Misc (Chat, Events)    │ 1 KB/s   │                      │
├────────────────────────┼──────────┼──────────────────────┤
│ TOTAL DOWNLOAD         │ 28 KB/s  │ ~16 Mbps for 50      │
│ TOTAL UPLOAD           │ 8 KB/s   │ ~3 Mbps for 50      │
└────────────────────────┴──────────┴──────────────────────┘

SERVER BANDWIDTH (100 players):
  Download: 100 × 8 KB/s = 800 KB/s (6.4 Mbps)
  Upload:   100 × 28 KB/s = 2.8 MB/s (22.4 Mbps)
  Total:    3.6 MB/s (28.8 Mbps)
```

---

## 3. Optimization Strategies

### 3.1 CPU Optimizations

```
1. CHUNK SYSTEM:
   - Async chunk meshing on worker threads
   - Dirty flags: only rebuild changed chunks
   - LOD system: far chunks use less detailed geometry
   - Region file format: memory-mapped I/O
   - Cache-friendly AoS → SoA conversion

2. ECS:
   - Archetype-based component storage (cache-friendly)
   - System batching: process all entities of same archetype together
   - Component tags: empty components for filtering (no data)
   - Entity recycling: reuse IDs to prevent fragmentation

3. AI:
   - Stagger AI updates: 20% of entities per tick
   - Path caching: reuse paths for 60 seconds
   - LOD AI: far entities skip expensive pathfinding
   - Simplified physics for distant entities

4. NETWORK:
   - Delta compression: only send changed data
   - Interest management: only relevant entities per player
   - Packet coalescing: batch small messages
   - UDP with NACK-based reliability (not TCP)
```

### 3.2 GPU Optimizations

```
1. CHUNK RENDERING:
   - Indirect draw (GPU culling of invisible faces)
   - Greedy meshing: 95% vertex reduction
   - LOD system: lower polygon count at distance
   - Atlas-based texturing: single bind per pass

2. LIGHTING:
   - Tiled deferred shading: 256 lights in one pass
   - SSAO instead of ray-traced AO
   - Pre-computed sky light (baked per chunk)
   - Shadow cache: reuse shadow maps when possible

3. MEMORY:
   - Texture streaming: load lower mips first
   - Mesh pooling: reuse vertex/index buffers
   - GPU scratch buffers for dynamic data
   - Bindless resources (Vulkan descriptor indexing)

4. SHADERS:
   - Early-Z: depth pre-pass reduces overdraw
   - Shader LOD: simpler shaders for distant objects
   - Wavefront/Warp utilization: minimize divergence
```

### 3.3 Memory Optimizations

```
1. BLOCK DATA:
   - Palette encoding: store only used block types per sub-chunk
   - Run-length encoding: compress identical adjacent blocks
   - Bit-packing: states packed into uint16
   - Light data stored per sub-chunk (not per block if uniform)

2. ASSET STREAMING:
   - Load textures based on distance (LOD0 near, LOD3 far)
   - Unload unused textures after 30 seconds
   - Audio streaming for music, cache for SFX
   - Model LOD switching based on screen size

3. ALLOCATOR STRATEGY:
   - Per-frame stack allocator (1 MB): particles, debug data
   - Chunk slab allocator: fixed-size blocks for chunk data
   - Entity pool allocator: pre-allocated entity slots
   - Free list for block entities (variable size)
```

---

## 4. Best Practices for Million-Block Worlds

### 4.1 Large World Management

```
1. REGIONALIZATION:
   - Split world into 512×512 block regions
   - Only load regions near players (view distance based)
   - Unload regions far from any player after 5 minutes
   - Background pre-generation of potential travel areas

2. PERSISTENCE:
   - Async chunk saving (write-behind cache)
   - Save queue: max 16 chunks per second (avoid IO spike)
   - Delta saves: only changed chunks written
   - Crash recovery: write-ahead log for block changes

3. CHUNK GENERATION:
   - Pre-generate chunks in direction of player movement
   - Priority queue: nearest chunks first
   - Generate up to 32 chunks per second on worker threads
   - Cache generated chunks to prevent regeneration on edge cases

4. MILLION-BLOCK OPTIMIZATIONS:
   - View distance caps: 32 chunks max (512m radius)
   - Entitiy caps: max 200 entities per player view
   - Total entity limit: 2000 per server
   - Block entity limit: 5000 per server (prevent lag machines)
```

### 4.2 Server Scaling

```
HORIZONTAL SCALING:
  - World shards: split world into 1024×1024 chunk regions
  - Each shard runs on separate server
  - Cross-shard entity transfer protocol
  - Global chat via master server
  - 200 players per shard max

VERTICAL SCALING:
  - More CPU cores → more worker threads for chunk gen
  - More RAM → larger view distances
  - SSD storage → faster chunk load/save
  - 10 Gbps NIC → handle 200+ players
```

### 4.3 Client Configuration Tiers

| Setting | Low | Medium | High | Ultra |
|---------|-----|--------|------|-------|
| View Distance | 8 chunks | 16 chunks | 24 chunks | 32 chunks |
| Render Scale | 75% | 100% | 100% | 100% |
| Shadows | Off | 1024×1024 | 2048×2048 | 4096×4096 |
| Shadow Cascades | 2 | 3 | 4 | 4 |
| Anti-Aliasing | FXAA | TAA Low | TAA High | TAA Ultra |
| Volumetric Fog | Off | Low | Medium | High |
| SSAO | Off | Low | Medium | High |
| Bloom | Off | Low | High | High |
| Texture Quality | 512×512 | 1024×1024 | 2048×2048 | 4096×4096 |
| Particles | 25% | 50% | 75% | 100% |
| Foliage Density | 25% | 50% | 75% | 100% |
| Water Quality | Low | Medium | High | Ultra |
| **Target FPS** | **60** | **60** | **60** | **45-60** |
| **VRAM** | **2 GB** | **4 GB** | **8 GB** | **12 GB** |

---

*End of Performance & Memory Budget Document*
