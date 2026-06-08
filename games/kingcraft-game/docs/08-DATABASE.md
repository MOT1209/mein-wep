# Database Schema

> **Primary DB:** PostgreSQL (player/clan/economy data)  
> **World Storage:** Custom Region File Format (see §5.3 of TDD)  
> **Cache:** Redis (session cache, temporary data)

---

## 1. PostgreSQL Schema

### 1.1 Players

```sql
CREATE TABLE players (
    player_id           BIGSERIAL PRIMARY KEY,
    steam_id            VARCHAR(64) UNIQUE NOT NULL,
    username            VARCHAR(32) NOT NULL,
    display_name        VARCHAR(64),
    email               VARCHAR(128),
    password_hash       VARCHAR(256),        -- bcrypt, for non-Steam auth
    auth_type           VARCHAR(16) DEFAULT 'steam', -- 'steam', 'email', 'mojang'
    
    -- Profile
    first_join          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_join           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_disconnect     TIMESTAMP WITH TIME ZONE,
    total_playtime      BIGINT DEFAULT 0,    -- seconds
    
    -- Stats
    deaths              BIGINT DEFAULT 0,
    kills               BIGINT DEFAULT 0,
    blocks_broken       BIGINT DEFAULT 0,
    blocks_placed       BIGINT DEFAULT 0,
    mobs_killed         BIGINT DEFAULT 0,
    items_crafted       BIGINT DEFAULT 0,
    
    -- Status
    is_banned           BOOLEAN DEFAULT FALSE,
    ban_reason          TEXT,
    ban_expires         TIMESTAMP WITH TIME ZONE,
    is_muted            BOOLEAN DEFAULT FALSE,
    mute_expires        TIMESTAMP WITH TIME ZONE,
    
    -- Preferences
    language            VARCHAR(8) DEFAULT 'en',
    render_distance     INTEGER DEFAULT 12,
    view_bobbing        BOOLEAN DEFAULT TRUE,
    sensitivity         REAL DEFAULT 0.5,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_players_steam_id ON players(steam_id);
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_last_join ON players(last_join);
```

### 1.2 Player Inventory Data

```sql
CREATE TABLE player_inventories (
    inventory_id        BIGSERIAL PRIMARY KEY,
    player_id           BIGINT REFERENCES players(player_id) ON DELETE CASCADE,
    
    -- Main Inventory (36 slots)
    inventory_data      BYTEA NOT NULL,      -- Compressed binary: [slot][item_id][count][components]
    
    -- Hotbar (9 slots) — stored as part of inventory_data
    -- Offhand (1 slot)
    
    -- Armor (4 slots)
    armor_data          BYTEA,
    
    -- Ender Chest (27 slots)
    ender_chest_data    BYTEA,
    
    -- Quick slots (recently used)
    quick_bar_data      BYTEA,
    
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_player_inventories_player ON player_inventories(player_id);
```

### 1.3 Player Data (Persistent State)

```sql
CREATE TABLE player_data (
    data_id             BIGSERIAL PRIMARY KEY,
    player_id           BIGINT REFERENCES players(player_id) ON DELETE CASCADE,
    
    -- Position
    world_id            VARCHAR(64) NOT NULL DEFAULT 'overworld',
    pos_x               DOUBLE PRECISION NOT NULL,
    pos_y               DOUBLE PRECISION NOT NULL,
    pos_z               DOUBLE PRECISION NOT NULL,
    rotation_yaw        REAL NOT NULL DEFAULT 0,
    rotation_pitch      REAL NOT NULL DEFAULT 0,
    
    -- Health & Stats
    health              REAL NOT NULL DEFAULT 20.0,
    max_health          REAL NOT NULL DEFAULT 20.0,
    hunger              INTEGER NOT NULL DEFAULT 20,
    saturation          REAL NOT NULL DEFAULT 5.0,
    thirst              INTEGER NOT NULL DEFAULT 20,
    stamina             REAL NOT NULL DEFAULT 100.0,
    experience          REAL NOT NULL DEFAULT 0.0,
    
    -- Status Effects
    active_effects      JSONB,               -- [{id, amplifier, duration, ambient}]
    
    -- Skills
    skills_data         JSONB,               -- {mining: {level, xp}, woodcutting: {level, xp}, ...}
    
    -- Quests
    completed_quests    INTEGER[],
    active_quests       JSONB,               -- [{quest_id, progress, stage}]
    
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_player_data_player ON player_data(player_id);
```

### 1.4 Clans

```sql
CREATE TABLE clans (
    clan_id             BIGSERIAL PRIMARY KEY,
    name                VARCHAR(32) UNIQUE NOT NULL,
    tag                 VARCHAR(6) UNIQUE NOT NULL,
    description         TEXT,
    
    -- Leader
    leader_id           BIGINT REFERENCES players(player_id) ON DELETE SET NULL,
    
    -- Stats
    level               INTEGER DEFAULT 1,
    xp                  BIGINT DEFAULT 0,
    member_count        INTEGER DEFAULT 1,
    
    -- Base
    base_world          VARCHAR(64),
    base_pos_x          DOUBLE PRECISION,
    base_pos_y          DOUBLE PRECISION,
    base_pos_z          DOUBLE PRECISION,
    
    -- Perks
    perks_data          JSONB DEFAULT '{}',
    
    -- MOTD
    motd                TEXT,
    
    -- Visual
    banner_data         JSONB,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    disbanded_at        TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_clans_name ON clans(name);
CREATE INDEX idx_clans_tag ON clans(tag);
CREATE INDEX idx_clans_leader ON clans(leader_id);
```

### 1.5 Clan Members

```sql
CREATE TABLE clan_members (
    member_id           BIGSERIAL PRIMARY KEY,
    clan_id             BIGINT REFERENCES clans(clan_id) ON DELETE CASCADE,
    player_id           BIGINT REFERENCES players(player_id) ON DELETE CASCADE,
    rank                VARCHAR(16) NOT NULL DEFAULT 'member', -- 'leader', 'officer', 'member', 'recruit'
    
    joined_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contributions       BIGINT DEFAULT 0,    -- resources contributed
    
    UNIQUE(clan_id, player_id)
);

CREATE INDEX idx_clan_members_clan ON clan_members(clan_id);
CREATE INDEX idx_clan_members_player ON clan_members(player_id);
```

### 1.6 Economy

```sql
CREATE TABLE economy_accounts (
    account_id          BIGSERIAL PRIMARY KEY,
    player_id           BIGINT REFERENCES players(player_id) ON DELETE CASCADE,
    balance             BIGINT DEFAULT 0,    -- in scrap/coins
    bank_balance        BIGINT DEFAULT 0,    -- in vault (safe from looting)
    
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_economy_player ON economy_accounts(player_id);

CREATE TABLE economy_transactions (
    transaction_id      BIGSERIAL PRIMARY KEY,
    from_player         BIGINT REFERENCES players(player_id),
    to_player           BIGINT REFERENCES players(player_id),
    amount              BIGINT NOT NULL,
    currency_type       VARCHAR(16) DEFAULT 'scrap',
    transaction_type    VARCHAR(32) NOT NULL,  -- 'trade', 'market', 'tax', 'reward'
    description         TEXT,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_from ON economy_transactions(from_player);
CREATE INDEX idx_transactions_to ON economy_transactions(to_player);
CREATE INDEX idx_transactions_time ON economy_transactions(created_at);
```

### 1.7 Market Listings

```sql
CREATE TABLE market_listings (
    listing_id          BIGSERIAL PRIMARY KEY,
    seller_id           BIGINT REFERENCES players(player_id) ON DELETE CASCADE,
    item_id             VARCHAR(64) NOT NULL,
    item_count          INTEGER NOT NULL,
    item_components     BYTEA,               -- item damage, enchantments, etc.
    price_per_unit      BIGINT NOT NULL,
    currency_type       VARCHAR(16) DEFAULT 'scrap',
    quantity_available  INTEGER NOT NULL,
    
    -- Status
    is_active           BOOLEAN DEFAULT TRUE,
    sold_count          INTEGER DEFAULT 0,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at          TIMESTAMP WITH TIME ZONE,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_market_listings_active ON market_listings(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_market_listings_seller ON market_listings(seller_id);
CREATE INDEX idx_market_listings_item ON market_listings(item_id);
```

### 1.8 Quests

```sql
CREATE TABLE quest_progress (
    progress_id         BIGSERIAL PRIMARY KEY,
    player_id           BIGINT REFERENCES players(player_id) ON DELETE CASCADE,
    quest_id            VARCHAR(64) NOT NULL,
    status              VARCHAR(16) DEFAULT 'active',  -- 'active', 'completed', 'failed', 'claimed'
    progress_data       JSONB,               -- {killed: {zombie: 5}, collected: {iron: 10}}
    stage               INTEGER DEFAULT 0,
    started_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at        TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(player_id, quest_id)
);

CREATE INDEX idx_quest_progress_player ON quest_progress(player_id);
CREATE INDEX idx_quest_progress_status ON quest_progress(status);
```

### 1.9 Server Config

```sql
CREATE TABLE server_config (
    config_key          VARCHAR(64) PRIMARY KEY,
    config_value        TEXT NOT NULL,
    config_type         VARCHAR(32) DEFAULT 'string',  -- 'string', 'int', 'float', 'bool', 'json'
    description         TEXT,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Examples:
-- pvp_enabled = true
-- grief_prevention = true
-- raid_window_hours = 2
-- day_cycle_minutes = 20
-- max_clan_members = 10
```

### 1.10 Bans & Moderation

```sql
CREATE TABLE bans (
    ban_id              BIGSERIAL PRIMARY KEY,
    player_id           BIGINT REFERENCES players(player_id) ON DELETE SET NULL,
    banned_by           BIGINT REFERENCES players(player_id),
    steam_id            VARCHAR(64),
    ip_address          INET,
    reason              TEXT NOT NULL,
    evidence            TEXT,
    ban_type            VARCHAR(16) DEFAULT 'temporary',  -- 'temporary', 'permanent', 'ip'
    expires_at          TIMESTAMP WITH TIME ZONE,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bans_player ON bans(player_id);
CREATE INDEX idx_bans_ip ON bans(ip_address);

CREATE TABLE player_reports (
    report_id           BIGSERIAL PRIMARY KEY,
    reporter_id         BIGINT REFERENCES players(player_id),
    reported_id         BIGINT REFERENCES players(player_id),
    reason              TEXT NOT NULL,
    evidence_data       JSONB,               -- {logs, screenshots, replay_data}
    status              VARCHAR(16) DEFAULT 'pending', -- 'pending', 'investigating', 'resolved'
    resolved_by         BIGINT REFERENCES players(player_id),
    resolution_note     TEXT,
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at         TIMESTAMP WITH TIME ZONE
);
```

---

## 2. Redis Cache Schema

```yaml
# Session Cache (15 min TTL)
session:{player_id}:
  steam_id: "76561198000000000"
  username: "PlayerName"
  ip: "192.168.1.1"
  server_id: "eu-01"
  last_seen: 1234567890

# Player Position Cache (60s TTL)
pos:{player_id}:
  x: 123.5
  y: 64.0
  z: -456.2
  world: "overworld"

# Server Status (30s TTL)
server:{server_id}:
  name: "KingCraft EU #1"
  ip: "192.168.1.100:28015"
  players: 45
  max_players: 100
  tick_rate: 20
  uptime: 12345
  map_seed: -1234567890
  
# Economy Lock (distributed lock, 5s TTL)
lock:transaction:{player_id}: {player_id}
lock:market:{listing_id}: {listing_id}

# Chat Cooldown (3s TTL)
cooldown:chat:{player_id}: 1

# Rate Limits (1s sliding window)
ratelimit:block_place:{player_id}: 10
ratelimit:inventory_click:{player_id}: 30
```

---

## 3. Region File Schema (World Storage)

See [Technical Design Document §5.2](./02-TDD.md) for region file format details.

### 3.1 File Format Summary

```
File: r.{region_x}.{region_z}.kcadata

HEADER (4 KB):
  [0..4095]  Chunk offset table: 256 entries × 16 bits each
             - Entries 0..255 = chunks in region
             - Each entry = offset in 4KB sectors from file start
  [4096..8191] Chunk size table: 256 entries × 16 bits each
             - Size in 4KB sectors

DATA (variable):
  [sector_offset..sector_offset+size]
  Each chunk:
    [0..3]    CRC32 checksum (little-endian)
    [4..7]    Uncompressed size (little-endian)
    [8..N]    Compressed chunk data (Zstd level 3)
    [N..N+?]  Padding to 4KB boundary
```

### 3.2 Chunk Data Format (after decompression)

```
[0..1]    Data version (uint16) = 1
[2..3]    Flags (uint16):
          - Bit 0: Has block data
          - Bit 1: Has block entities
          - Bit 2: Has entities
          - Bit 3: Has heightmap
          - Bit 4–15: Reserved

[4..N]    Block data (24 sub-chunks × 16KB raw = 384KB raw)
          For each sub-chunk at Y section -4 to 19:
            [0..1]    Non-air block count (uint16)
            [2..N]    Palette (varint):
                      - Palette size (varint)
                      - For each entry: block ID (varint) + default state
            [N..N+1]  Data length (uint16)
            [N+2..]   Indices:
                      - Bits per block: ceil(log2(palette_size))
                      - Packed array of 4096 indices

[N..M]    Block entities:
          [0..1]    Count (uint16)
          For each:
            [0..1]  Packed position (x:5+z:5+y:8 = 18 bits)
            [2..N]  Block entity type ID (varint)
            [N..]   NBT data (compressed)

[M..O]    Heightmaps:
          [0..3]    Motion blocking heightmap (1024×int16 = 2048 bytes)
          [4..7]    World surface heightmap (1024×int16 = 2048 bytes)

[O..P]    Entities (if flagged):
          [0..1]    Count (uint16)
          For each:
            Entity data in standard format
```

---

*End of Database Schema Document*

Next: [API Design →](./09-API.md)
