# Multiplayer System

---

## 1. Network Protocol

### 1.1 Protocol Stack

```
APPLICATION LAYER: Game Messages (Block, Entity, Chat, etc.)
TRANSPORT LAYER:    Reliable UDP (custom)
SESSION LAYER:      Connection management, encryption
NETWORK LAYER:      IP/UDP packets
```

### 1.2 Connection Flow

```
CLIENT                                     SERVER
  │                                           │
  │  ──► Connection Request ──────────────►   │
  │                                           │
  │  ◄── Challenge + Public Key ────────────  │
  │                                           │
  │  ──► Auth Token + Proof ──────────────►   │
  │       (SteamID / Username / Password)      │
  │                                           │
  │  ◄── Auth Response ────────────────────   │
  │       (Success + PlayerID + World Seed)    │
  │                                           │
  │  ──► World Request ──────────────────►    │
  │       (Chunk coordinates in range)         │
  │                                           │
  │  ◄── Chunk Data Stream ────────────────   │
  │       (Compressed chunk NBT)               │
  │                                           │
  │  ──► Ready ─────────────────────────►     │
  │                                           │
  │  ◄── Game Start ──────────────────────    │
  │                                           │
  │  ──► Game Loop (Input + Position) ───►    │
  │  ◄── Game Loop (State + Entities) ─────   │
```

### 1.3 Message IDs

| ID | Message | Direction | Channel | Reliability |
|----|---------|-----------|---------|-------------|
| 0x01 | ConnectionRequest | C→S | 0 | Reliable |
| 0x02 | ConnectionChallenge | S→C | 0 | Reliable |
| 0x03 | Authentication | C→S | 0 | Reliable |
| 0x04 | AuthResponse | S→C | 0 | Reliable |
| 0x05 | Disconnect | C↔S | 0 | Reliable |
| 0x10 | PlayerInput | C→S | 2 | Unreliable |
| 0x11 | PlayerState | S→C | 2 | Unreliable |
| 0x12 | PlayerPosition | C→S | 2 | Unreliable |
| 0x13 | PlayerPositionCorrection | S→C | 2 | Unreliable |
| 0x20 | BlockPlace | C→S | 3 | Reliable |
| 0x21 | BlockBreak | C→S | 3 | Reliable |
| 0x22 | BlockUpdate | S→C | 3 | Reliable |
| 0x23 | BlockEntityUpdate | S→C | 3 | Reliable |
| 0x30 | EntitySpawn | S→C | 1 | Reliable |
| 0x31 | EntityDespawn | S→C | 1 | Reliable |
| 0x32 | EntityUpdate | S→C | 1 | Unreliable |
| 0x33 | EntityDamage | S→C | 1 | Reliable |
| 0x40 | InventoryAction | C→S | 1 | Reliable |
| 0x41 | InventoryUpdate | S→C | 1 | Reliable |
| 0x42 | ContainerOpen | S→C | 1 | Reliable |
| 0x50 | ChatMessage | C↔S | 4 | Reliable |
| 0x51 | Command | C→S | 4 | Reliable |
| 0x60 | ChunkRequest | C→S | 7 | Reliable |
| 0x61 | ChunkData | S→C | 7 | Reliable |
| 0x62 | ChunkUnload | S→C | 7 | Reliable |
| 0x70 | SoundEffect | S→C | 6 | Unreliable |
| 0x71 | ParticleEffect | S→C | 6 | Unreliable |
| 0x80 | TimeUpdate | S→C | 6 | Reliable |
| 0x81 | WeatherUpdate | S→C | 6 | Reliable |
| 0x90 | RPC | C↔S | 6 | Reliable |

---

## 2. Server Architecture

### 2.1 Server Hierarchy

```
┌──────────────────────────────────────────────────┐
│              MASTER SERVER                        │
│  - Server browser list                           │
│  - Authentication proxy                          │
│  - Global ban list                               │
│  - Cross-server chat                             │
└──────────────────┬───────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼───┐    ┌───▼───┐    ┌───▼───┐
│GAME   │    │GAME   │    │GAME   │  (Multiple shards)
│SERVER │    │SERVER │    │SERVER │
│01     │    │02     │    │03     │
└───┬───┘    └───┬───┘    └───┬───┘
    │              │              │
    └──────────────┼──────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│              DATABASE SERVER                      │
│  - Player data (PostgreSQL)                      │
│  - World data (Region files on disk)              │
│  - Clan data                                     │
│  - Economy data                                  │
└──────────────────────────────────────────────────┘
```

### 2.2 Server Sharding

```
SHARD SIZE: 1024×1024 chunks (≈ 512km²)
Each shard tracks its own entities, players, chunks
Cross-shard: Optimized handoff for border crossing

SHARD MANAGEMENT:
- Lightweight heartbeat (1s interval)
- Entity transfer protocol at borders
- Shared database for persistence
- Global chat server for cross-shard communication
```

---

## 3. Anti-Cheat System

### 3.1 Server-Side Validation

```cpp
struct AntiCheatConfig {
    // Movement
    float max_player_speed = 8.0f;        // m/s
    float max_fall_speed = 40.0f;          // m/s (terminal velocity)
    float max_jump_velocity = 8.5f;        // m/s
    float max_acceleration = 20.0f;        // m/s²
    float reach_distance = 5.0f;           // block interaction range
    float entity_reach = 3.5f;             // entity interaction range
    
    // Combat
    float max_attack_rate = 20.0f;         // attacks per second
    float max_projectile_rate = 10.0f;     // projectiles per second
    float max_damage_per_tick = 100.0f;    // max damage in one tick
    
    // Inventory
    int max_actions_per_second = 30;        // inventory operations
    int max_items_per_action = 64;          // item stack size check
    
    // Network
    int max_packets_per_second = 100;      // prevent flooding
    int max_packet_size = 1024 * 512;       // max 512KB packet
};

ANTI_CHEAT_ACTIONS:
- Detection level 1: Warning (log)
- Detection level 2: Correction (server overrides)
- Detection level 3: Kick + freeze
- Detection level 4: Ban (temporary/permanent)

DETECTION SYSTEMS:
1. Movement: Position delta check, speed check, noclip detection
2. Reach: Block interaction distance validation
3. Auto-clicker: Attack interval pattern analysis
4. Kill aura: Attack angle validation
5. X-ray: Block selection validation (server-side block data)
6. ESP: Entity position validation against line-of-sight
7. Fly: Vertical movement analysis
8. Speed: Horizontal velocity analysis
9. No-fall: Fall damage distance validation
10. Timer: Game speed ratio monitoring
```

---

## 4. Network Optimization

### 4.1 Bandwidth Budget

| Category | Per Second | Per Player (50 players) | Notes |
|----------|-----------|------------------------|-------|
| World Data | 50 KB/s | 1 KB/s | New chunks only |
| Entity Updates | 500 KB/s | 10 KB/s | 10 updates/sec × 100 entities |
| Player State | 100 KB/s | 2 KB/s | 20 updates/sec × 1 player |
| Inventory | 50 KB/s | 1 KB/s | Delta updates only |
| Chat/Events | 10 KB/s | 0.2 KB/s | Text data |
| Voice Chat | 400 KB/s | 8 KB/s | 64 kbps Opus |
| **Total** | **1.1 MB/s** | **22.2 KB/s** | |

### 4.2 Compression Strategies

```
- Region-based interest management
- Delta compression for entity updates
- Run-length encoding for chunk data
- LZ4 for single packets
- Zstd for bulk transfers (chunks)
- Arithmetic encoding for block IDs
- Bit-packing for block states
```

---

*End of Multiplayer System Document*

Next: [Database Schema →](./08-DATABASE.md)
