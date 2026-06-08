# Game Design Document (GDD)

> **Version:** 1.0  
> **Author:** KingCraft Design Team  
> **Last Updated:** 2026-06-08

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Core Game Loop](#2-core-game-loop)
3. [World & Voxel System](#3-world--voxel-system)
4. [Block System](#4-block-system)
5. [Item System](#5-item-system)
6. [Tool & Weapon System](#6-tool--weapon-system)
7. [Crafting & Furnace System](#7-crafting--furnace-system)
8. [Inventory & Container System](#8-inventory--container-system)
9. [Loot System](#9-loot-system)
10. [Mob & Entity System](#10-mob--entity-system)
11. [Farming System](#11-farming-system)
12. [Tree & Vegetation System](#12-tree--vegetation-system)
13. [Biome System](#13-biome-system)
14. [Weather & Season System](#14-weather--season-system)
15. [Water Simulation](#15-water-simulation)
16. [Building System](#16-building-system)
17. [Electricity System](#17-electricity-system)
18. [Vehicle System](#18-vehicle-system)
19. [Multiplayer & Social Systems](#19-multiplayer--social-systems)
20. [Clan System](#20-clan-system)
21. [Raiding System](#21-raiding-system)
22. [Progression & Skill System](#22-progression--skill-system)
23. [Quest System](#23-quest-system)
24. [Economy & Trading](#24-economy--trading)
25. [Procedural World Generation](#25-procedural-world-generation)
26. [Cave & Dungeon System](#26-cave--dungeon-system)
27. [AI System](#27-ai-system)
28. [Combat System](#28-combat-system)
29. [Day/Night Cycle](#29-daynight-cycle)

---

## 1. Executive Summary

KingCraft is a voxel-based multiplayer survival game that combines the deep building and exploration of Minecraft with the PvP/raiding intensity of Rust. Players spawn in a procedurally generated world and must gather resources, craft tools, build bases, form clans, and survive against both environmental threats and other players.

### 1.1 Core Differentiators

- **Voxel Physics:** Destructible terrain, structural integrity, fluid simulation
- **Rust-Style Raiding:** Explosives, doors, code locks, TC (Tool Cupboard) mechanics
- **Electricity System:** Wiring, generators, traps, automated defenses (inspired by Rust)
- **Seasons & Weather:** Dynamic environmental challenges affecting gameplay
- **Progression Trees:** Skill-based progression replacing experience levels
- **ECS Architecture:** High-performance engine capable of infinite worlds

### 1.2 Target Metrics

| Metric | Target |
|--------|--------|
| View Distance | 32+ chunks (512m) |
| Block Types | 512+ |
| Item Types | 1024+ |
| Entities per Chunk | 64+ |
| Max Players per Server | 200 |
| Tick Rate | 20 TPS (50ms) |
| World Size | Effectively infinite (64-bit) |
| Chunk Size | 32×384×32 blocks |
| Region File Size | 512×512×384 blocks |

---

## 2. Core Game Loop

```
┌─────────────────────────────────────────────────────────┐
│                    CORE GAME LOOP                        │
│                                                          │
│  Spawn → Gather Resources → Craft Tools → Build Base     │
│    ↑                                      ↓              │
│    ├── Explore → Dungeon → Loot ←─────────┤             │
│    ├── Farm → Cook → Eat ←────────────────┤             │
│    ├── Raid → PvP → Defend ←─────────────┤              │
│    └── Quest → Skill Up → Unlock ←───────┘              │
│                                                          │
│  Threats:  Hunger │ Cold │ Hostile Mobs │ Other Players  │
└─────────────────────────────────────────────────────────┘
```

### 2.1 Player States

| State | Description |
|-------|-------------|
| Health | 0–100 HP. Death at 0. |
| Hunger | 0–100. Affects health regen and stamina |
| Thirst | 0–100. Dehydration causes damage |
| Temperature | -50°C to +80°C. Affected by biome, weather, clothing |
| Stamina | 0–100. Sprinting, attacking, jumping consume stamina |
| Exposure | 0–100%. Rain/snow/wind increases; shelter decreases |
| Radiation | 0–100%. Certain biomes/zones; requires hazmat gear |

---

## 3. World & Voxel System

The world is composed of 3D voxels (blocks) arranged in chunks. Each voxel occupies a 1m×1m×1m volume.

### 3.1 World Dimensions

| Dimension | Type | Height | Build Limit | Description |
|-----------|------|--------|-------------|-------------|
| Overworld | Surface | 384 blocks | Y=-64 to Y=320 | Main game world |
| Nether | Hell | 256 blocks | Y=0 to Y=256 | High-risk, high-reward |
| Void | Space | 256 blocks | Y=0 to Y=256 | Zero-gravity, space stations |

### 3.2 Chunk System

| Property | Value | Notes |
|----------|-------|-------|
| Chunk Width | 32 blocks | X-axis |
| Chunk Depth | 32 blocks | Z-axis |
| Chunk Height | 384 blocks | Y-axis (-64 to 320) |
| Total Blocks per Chunk | 393,216 | 32×32×384 |
| Sub-Chunk Size | 32×32×16 | 16,384 blocks per sub-chunk |

### 3.3 Voxel Data Format

Each voxel stores:

| Field | Type | Size | Description |
|-------|------|------|-------------|
| Block ID | uint16 | 2 bytes | Registry ID (0–512) |
| Block State | uint16 | 2 bytes | Bit-packed state flags |
| Light Sky | uint8 | 1 byte | Sky light level (0–15) |
| Light Block | uint8 | 1 byte | Block light level (0–15) |
| **Total** | | **6 bytes/voxel** | |

**Compression:** Each sub-chunk (16,384 blocks) = 98,304 bytes raw → 2–8 KB compressed using run-length encoding + deflate.

### 3.4 Block State Bit Packing

Block states encode up to 16 boolean flags or 4×4-bit values:

```
Bit 0-3:   Rotation / Facing (0-15)
Bit 4-7:   Variant (0-15)
Bit 8:     Waterlogged
Bit 9:     Lit (furnace, redstone lamp)
Bit 10:    Powered (redstone)
Bit 11:    Locked
Bit 12-15: Custom state (per block type)
```

---

## 4. Block System

See [Block System Document](./03-BLOCKS.md) for complete block registry.

### 4.1 Block Categories

| Category | Count | Examples |
|----------|-------|----------|
| Natural | 48+ | Stone, dirt, sand, gravel, ores |
| Building | 96+ | Wood planks, stone bricks, concrete, glass |
| Vegetation | 32+ | Grass, flowers, tall grass, vines |
| Fluids | 4 | Water, lava, oil, acid |
| Decoration | 64+ | Stairs, slabs, fences, walls, doors |
| Redstone/Electrical | 48+ | Wire, generator, battery, trap |
| Functional | 32+ | Furnace, crafting table, chest, furnace |
| Technology | 48+ | Solar panel, pump, turret, radar |
| Unobtainable | 16+ | Bedrock, barrier, command block |

### 4.2 Block Properties (from Minecraft Wiki Analysis)

Every block has these properties, based on the Minecraft registry:

```json
{
  "block_id": "kingcraft:stone",
  "numeric_id": 1,
  "hardness": 1.5,
  "resistance": 6.0,
  "blast_resistance": 6.0,
  "destroy_time": 0.75,
  "explosion_resistance": 6.0,
  "friction": 0.6,
  "velocity_multiplier": 1.0,
  "jump_velocity_multiplier": 1.0,
  "map_color": "#808080",
  "flammable": false,
  "fire_spread_speed": 0,
  "fire_burn_rate": 0,
  "requires_tool": true,
  "tool_type": "pickaxe",
  "min_tier": 0,
  "luminance": 0,
  "opacity": 15,
  "is_cube": true,
  "collision_shape": "full_block",
  "outline_shape": "full_block",
  "occludes": true,
  "block_entity": false,
  "drops": "kingcraft:cobblestone",
  "xp_drop_min": 0,
  "xp_drop_max": 0,
  "sound_type": "stone",
  "push_reaction": "push_only",
  "oxidizable": false,
  "sculk": false,
  "layer": "solid",
  "max_stack_size": 64
}
```

### 4.3 Block Hardness Table (Reference: Minecraft Wiki)

| Block | Hardness | Resistance | Tool | Tool Tier | Drop |
|-------|----------|------------|------|-----------|------|
| Stone | 1.5 | 6.0 | Pickaxe | Wood+ | Cobblestone |
| Dirt | 0.5 | 0.5 | Shovel | Any | Dirt |
| Grass Block | 0.6 | 0.6 | Shovel | Any | Dirt |
| Sand | 0.5 | 0.5 | Shovel | Any | Sand |
| Gravel | 0.6 | 0.6 | Shovel | Any | Gravel (flint chance) |
| Wood Log | 2.0 | 2.0 | Axe | Any | Log |
| Wood Planks | 2.0 | 3.0 | Axe | Any | Planks |
| Cobblestone | 2.0 | 6.0 | Pickaxe | Wood+ | Cobblestone |
| Iron Ore | 3.0 | 3.0 | Pickaxe | Stone+ | Iron Ore |
| Gold Ore | 3.0 | 3.0 | Pickaxe | Iron+ | Gold Ore |
| Diamond Ore | 3.0 | 3.0 | Pickaxe | Iron+ | Diamond Ore |
| Obsidian | 50.0 | 1200.0 | Pickaxe | Diamond+ | Obsidian |
| Bedrock | ∞ | 18,000,000 | None | None | — |
| Leaves | 0.2 | 0.2 | Shears | Any | Leaves/Sapling |
| Glass | 0.3 | 0.3 | — | None | Nothing |
| Water | 100.0 | 100.0 | Bucket | — | Water Bucket |

### 4.4 Tool Mining Speed

| Tool | Material | Speed Multiplier | Efficiency Level |
|------|----------|------------------|-----------------|
| Hand | — | 1× (slowed) | — |
| Wood | All | 2× | 0 |
| Stone | All | 4× | 1 |
| Iron | All | 6× | 2 |
| Gold | All | 12× (low durability) | 3 |
| Diamond | All | 8× | 3 |
| Netherite | All | 10× | 4 |
| Titanium | All | 12× | 5 |

### 4.5 Block Tags (like Minecraft block tags)

```json
{
  "tags": {
    "mineable/pickaxe": ["stone", "cobblestone", "iron_ore", ...],
    "mineable/axe": ["oak_log", "oak_planks", ...],
    "mineable/shovel": ["dirt", "sand", "gravel", ...],
    "needs_stone_tool": ["iron_ore", "lapis_ore", ...],
    "needs_iron_tool": ["diamond_ore", "gold_ore", ...],
    "needs_diamond_tool": ["obsidian", "ancient_debris", ...],
    "dirt_like": ["dirt", "grass_block", "podzol", ...],
    "logs": ["oak_log", "spruce_log", ...],
    "planks": ["oak_planks", "spruce_planks", ...],
    "walls": ["cobblestone_wall", "stone_brick_wall", ...],
    "fences": ["oak_fence", "nether_brick_fence", ...],
    "doors": ["oak_door", "iron_door", ...],
    "trapdoors": ["oak_trapdoor", "iron_trapdoor", ...]
  }
}
```

---

## 5. Item System

See [Item System Document](./04-ITEMS.md) for complete item registry.

### 5.1 Item Categories

| Category | Examples |
|----------|----------|
| Resource | Iron ingot, wood plank, stone, diamond |
| Tool | Pickaxe, axe, shovel, hoe, fishing rod |
| Weapon | Sword, bow, crossbow, spear, gun |
| Armor | Helmet, chestplate, leggings, boots |
| Food | Apple, cooked meat, bread, soup |
| Potion | Healing, strength, speed, invisibility |
| Block | Full blocks, slabs, stairs, walls (as items) |
| Component | Redstone dust, gear, circuit board, wire |
| ammo | Arrow, bullet, rocket, grenade |
| Decoration | Banner, painting, armor stand |

### 5.2 Item Components (Data Components)

Inspired by Minecraft's data component system (1.20.5+):

```json
{
  "item_id": "kingcraft:diamond_sword",
  "components": {
    "minecraft:max_stack_size": 1,
    "minecraft:durability": 1561,
    "minecraft:damage": 7,
    "minecraft:enchantments": [],
    "minecraft:attributes": [
      {
        "id": "attack_damage",
        "base": 7.0,
        "operation": "add"
      },
      {
        "id": "attack_speed",
        "base": 1.6,
        "operation": "add"
      }
    ],
    "minecraft:rarity": "rare",
    "minecraft:repair_cost": 0,
    "minecraft:food": null,
    "minecraft:tool": {
      "rules": [
        {
          "blocks": "mineable/pickaxe",
          "speed": 8.0,
          "correct_for_drops": true
        }
      ]
    }
  }
}
```

---

## 6. Tool & Weapon System

### 6.1 Tool Tiers

| Tier | Material | Durability | Speed | Enchantability | Damage |
|------|----------|------------|-------|----------------|--------|
| 0 | Wood | 60 | 2.0× | 15 | 2–4 |
| 1 | Stone | 132 | 4.0× | 5 | 3–5 |
| 2 | Bronze | 200 | 5.0× | 10 | 4–6 |
| 3 | Iron | 251 | 6.0× | 14 | 5–7 |
| 4 | Gold | 33 | 12.0× | 22 | 2–4 |
| 5 | Steel | 500 | 7.0× | 10 | 6–8 |
| 6 | Diamond | 1562 | 8.0× | 10 | 7–9 |
| 7 | Netherite | 2032 | 9.0× | 15 | 8–10 |
| 8 | Titanium | 4000 | 10.0× | 8 | 9–12 |

### 6.2 Weapon Types

| Weapon | Damage | Speed | Range | Special |
|--------|--------|-------|-------|---------|
| Fist | 1 | 4.0 | 3 | None |
| Sword | 4–10 | 1.6 | 3 | Sweep attack |
| Spear | 5–12 | 1.1 | 5 | Throwable |
| Axe | 3–9 | 1.0 | 3 | Shield disable |
| Bow | 2–15 | — | 50+ | Charged shot |
| Crossbow | 6–11 | — | 40+ | Piercing |
| Gun (Pistol) | 8 | — | 30 | Semi-auto |
| Gun (Rifle) | 25 | — | 80 | Sniper |
| Gun (Shotgun) | 5×8 pellets | — | 15 | Spread |
| Rocket Launcher | 100 | — | 60 | AoE explosion |
| Grenade | 80 | — | Throw | AoE, fuse delay |

---

## 7. Crafting & Furnace System

### 7.1 Crafting Types

| Type | Grid | Description |
|------|------|-------------|
| Crafting Table | 3×3 | Full grid crafting |
| Player Inventory | 2×2 | Quick crafting |
| Furnace | 1 input + 1 fuel | Smelting |
| Blast Furnace | 1 input + 1 fuel | Ore doubling |
| Smoker | 1 input + 1 fuel | Fast cooking |
| Campfire | 4 input | Outdoor cooking |
| Assembly Table | 3×3 components | Advanced technology |
| Chemistry Station | 4×4 | Potions, alloys |

### 7.2 Recipe Format

```json
{
  "type": "shaped",
  "group": "planks",
  "category": "building",
  "pattern": [
    "#",
    "#"
  ],
  "key": {
    "#": {
      "item": "kingcraft:oak_log",
      "count": 1
    }
  },
  "result": {
    "item": "kingcraft:oak_planks",
    "count": 8
  },
  "experience": 0.15,
  "cooking_time": 0
}
```

### 7.3 Furnace Properties

| Property | Value |
|----------|-------|
| Fuel Slots | 1 |
| Input Slots | 1 |
| Output Slots | 1 |
| Max Fuel Time | 12 hours (in-game) |
| Smelting Speed | 8 seconds per item |
| Experience Per Item | Varies (0.1–2.0) |

**Fuel Efficiency Table:**

| Fuel | Burn Time (seconds) | Items Smelted |
|------|--------------------|---------------|
| Coal/Charcoal | 80 | 8 |
| Wood Plank | 15 | 1.5 |
| Wood Log | 30 | 3 |
| Lava Bucket | 1000 | 100 |
| Blaze Rod | 120 | 12 |
| Uranium Rod | 6000 | 600 |

---

## 8. Inventory & Container System

### 8.1 Inventory Types

| Container | Slots | Stack Size | Description |
|-----------|-------|------------|-------------|
| Player Inventory | 36+4+1 | 64 | Main + hotbar + offhand |
| Chest | 27 | 64 | Basic storage |
| Large Chest | 54 | 64 | Double chest |
| Barrel | 27 | 64 | Single-block chest alternative |
| Shulker Box | 27 | 64 | Portable storage |
| Furnace | 3 | 64 | Input+fuel+output |
| Workbench | 9 | 64 | Crafting grid |
| Vault | 54 | 999 | Clan vault (high security) |
| Safe | 27 | 64 | Code-locked personal safe |
| Locker | 18 | 64 | Quick-access respawn gear |
| Drop Box | 1 | 64 | Anonymous item transfer |

### 8.2 Inventory Actions (Network Protocol)

```
CLICK_LEFT          → Pick up / place half stack
CLICK_RIGHT         → Place one item / interact
SHIFT + CLICK       → Quick move to container
DOUBLE_CLICK        → Collect all same type
DRAG_CREATE         → Distribute evenly
NUMBER_KEY          → Swap hotbar slot
DROP_KEY            → Drop item
CTRL + DROP_KEY     → Drop full stack
```

---

## 9. Loot System

### 9.1 Loot Table Format

```json
{
  "type": "minecraft:chest",
  "pools": [
    {
      "rolls": {
        "min": 2,
        "max": 4
      },
      "entries": [
        {
          "type": "item",
          "item": "kingcraft:iron_ingot",
          "weight": 10,
          "count": {
            "min": 1,
            "max": 3
          }
        },
        {
          "type": "item",
          "item": "kingcraft:diamond",
          "weight": 1,
          "count": {
            "min": 1,
            "max": 2
          }
        },
        {
          "type": "loot_table",
          "name": "kingcraft:chests/rare_treasure"
        }
      ],
      "conditions": [
        {
          "condition": "random_chance",
          "chance": 0.5
        }
      ]
    }
  ]
}
```

### 9.2 Loot Contexts

| Context | Description |
|---------|-------------|
| Chest | Natural chest loot |
| Block Drop | Block mining drops |
| Entity Drop | Mob/animal drops |
| Fishing | Fishing loot |
| Archaeologist | Dig site loot |
| Boss | Boss kill rewards |
| Dungeon | Dungeon completion |
| Gift | Trading/post-event |

---

## 10. Mob & Entity System

See [Entity System Document](./05-ENTITIES.md) for complete entity registry.

### 10.1 Entity Categories

#### Passive Mobs
Cow, Pig, Chicken, Sheep, Rabbit, Deer, Fox, Wolf, Cat, Horse, Donkey, Llama, Goat, Bee, Squid, Dolphin, Butterfly

#### Neutral Mobs
Cave Spider, Enderman, Wolf (wild), Polar Bear, Llama (wild), Bee (provoked)

#### Hostile Mobs
Zombie, Skeleton, Creeper, Spider, Witch, Husk, Stray, Drowned, Phantom, Slime, Magma Cube, Blaze, Ghast, Piglin, Piglin Brute, Hoglin, Zoglin

#### Bosses
Ender Dragon, Wither, Elder Guardian, Raid Captain, Titan (KingCraft unique), Void Leviathan

#### NPCs
Villager, Wandering Trader, Blacksmith, Armorer, Farmer, Librarian, Cleric, Toolsmith, Weaponsmith, Butcher, Cartographer, Leatherworker, Mason, Shepherd, Fletcher, Fisherman

### 10.2 Entity Properties

```json
{
  "entity_id": "kingcraft:zombie",
  "numeric_id": 50,
  "type": "hostile",
  "health": 20.0,
  "armor": 2.0,
  "speed": 0.23,
  "attack_damage": 3.0,
  "attack_speed": 1.0,
  "knockback_resistance": 0.0,
  "follow_range": 35,
  "experience_drop": 5,
  "loot_table": "entities/zombie",
  "spawn_conditions": {
    "light_level": 0,
    "min_y": 0,
    "max_y": 256,
    "biomes": ["overworld"],
    "can_spawn_on": ["stone", "grass_block", "dirt"],
    "spawn_weight": 100,
    "min_group_size": 1,
    "max_group_size": 4
  },
  "behavior": {
    "ai_tasks": [
      "melee_attack",
      "pursue_target",
      "wander",
      "look_at_player",
      "break_doors",
      "sun_burn"
    ],
    "target_priority": [
      "player",
      "villager",
      "iron_golem"
    ]
  }
}
```

### 10.3 Block Entities

| Block Entity | Description | Data Stored |
|-------------|-------------|-------------|
| Chest | Item storage | Inventory NBT |
| Furnace | Smelting | Progress, fuel, input, output |
| Beacon | Buff field | Primary, secondary powers |
| Sign | Text display | 4 lines of text |
| Skull | Head display | Skin data, rotation |
| Campfire | Cooking | Items cooking, time |
| Jukebox | Music | Record item |
| Hopper | Item transport | Inventory, cooldown |
| Dispenser | Item ejection | Inventory |
| Spawner | Mob spawning | Entity type, delay, range |
| Bell | Village alert | Ringing state |
| Decorated Pot | Decoration | Pattern, sherds |
| Generator | Power | Fuel, output rate |
| Battery | Power storage | Charge level |
| Turret | Defense | Ammo, target, rotation |
| Computer | Logic | Programs, I/O |

---

## 11. Farming System

### 11.1 Crop Stages

Each crop has 8 growth stages (0–7). Inspired by Minecraft's crop system but extended.

```json
{
  "crop_id": "kingcraft:wheat",
  "stages": 8,
  "growth_time": {
    "base": 4800,
    "min": 2400,
    "max": 7200
  },
  "light_required": 9,
  "hydrated": true,
  "bone_meal_usable": true,
  "drops": {
    "stage_7": {
      "item": "kingcraft:wheat",
      "count": 1
    },
    "bonus_drop": {
      "item": "kingcraft:wheat_seeds",
      "min_count": 0,
      "max_count": 3
    }
  },
  "plantable_on": ["farmland"]
}
```

### 11.2 Crop List

| Crop | Growth Time | Yield | Uses |
|------|-------------|-------|------|
| Wheat | 4–12 min | Wheat + Seeds | Bread, animal feed |
| Carrot | 4–8 min | 1–4 Carrots | Food, breeding |
| Potato | 4–8 min | 1–4 Potatoes | Food, poisoned chance |
| Beetroot | 4–8 min | 1 Beetroot + Seeds | Food, dye |
| Melon | 10–20 min | 3–7 Melon Slices | Food |
| Pumpkin | 10–20 min | 1 Pumpkin | Decoration, pie |
| Sugarcane | 2–4 min | 1 Sugarcane | Paper, sugar |
| Bamboo | 1–2 min | 1 Bamboo | Scaffolding, fuel |
| Cocoa | 4–8 min | 2–3 Cocoa Beans | Cookies, dye |
| Nether Wart | 10–20 min | 2–4 Wart | Potions |
| Magic Berries | 8–15 min | 1–3 Berries | Potions, food |
| Coffee | 12–20 min | 1–3 Beans | Speed buff |
| Cotton | 6–12 min | 1–2 Cotton | Cloth, bandages |
| Tobacco | 10–18 min | 1–2 Leaves | Debuff/poison |

---

## 12. Tree & Vegetation System

### 12.1 Tree Types

| Tree | Height | Wood Color | Biome | Special |
|------|--------|------------|-------|---------|
| Oak | 5–12 | Brown | Plains, Forest | Apple drop chance |
| Spruce | 6–18 | Dark Brown | Taiga, Mountain | Tall variety |
| Birch | 5–8 | White/Black | Forest | Stripped texture |
| Jungle | 8–30 | Brown | Jungle | Giant variant |
| Acacia | 6–10 | Orange | Savanna | Flat canopy |
| Dark Oak | 6–14 | Dark Brown | Dark Forest | 2×2 trunk |
| Palm | 4–8 | Tan | Beach, Desert | Coconuts |
| Cherry | 4–7 | Pink | Cherry Grove | Pink petals |
| Mangrove | 6–15 | Red/Brown | Swamp | Roots, water roots |
| Mushroom | 3–7 | Tan | Mushroom Fields | Giant fungus |
| Crimson | 4–10 | Red | Nether | Nether wood |
| Warped | 4–10 | Cyan | Nether | Warped wood |
| Dead | 3–6 | Gray | Desert, Wasteland | No leaves |
| Willow | 5–12 | Gray/Brown | Swamp | Hanging leaves |
| Redwood | 10–50 | Red/Brown | Taiga, Mountain | Massive |

---

## 13. Biome System

### 13.1 Biome Properties

```json
{
  "biome_id": "kingcraft:taiga",
  "temperature": 0.25,
  "downfall": 0.8,
  "precipitation": "snow",
  "base_height": 0.2,
  "height_variation": 0.4,
  "sky_color": "#87CEEB",
  "fog_color": "#C0D8FF",
  "water_color": "#3F76E4",
  "grass_color": "#80B497",
  "foliage_color": "#60A17B",
  "music": "music.taiga",
  "additions_sound": "ambient.taiga.additions",
  "mob_spawns": {
    "passive": ["wolf", "fox", "rabbit", "bear"],
    "hostile": ["zombie", "skeleton", "spider", "creeper", "stray", "husk"]
  },
  "features": [
    "spruce_trees",
    "berry_bushes",
    "large_ferns",
    "sweet_berry_bushes"
  ],
  "carvers": ["cave", "ravine"]
}
```

### 13.2 Biome List

| # | Biome | Temp | Downfall | Precipitation |
|---|-------|------|----------|---------------|
| 1 | Plains | 0.8 | 0.4 | Rain |
| 2 | Desert | 2.0 | 0.0 | None |
| 3 | Forest | 0.7 | 0.8 | Rain |
| 4 | Taiga | 0.25 | 0.8 | Snow |
| 5 | Swamp | 0.8 | 0.9 | Rain |
| 6 | Jungle | 0.95 | 0.9 | Rain |
| 7 | Savannah | 2.0 | 0.0 | None |
| 8 | Ocean | 0.5 | 0.5 | Rain |
| 9 | Deep Ocean | 0.5 | 0.5 | Rain |
| 10 | Cold Ocean | 0.25 | 0.5 | Snow |
| 11 | Frozen Ocean | 0.0 | 0.5 | Snow |
| 12 | Mountains | 0.2 | 0.3 | Snow |
| 13 | Tundra | 0.0 | 0.5 | Snow |
| 14 | Badlands | 2.0 | 0.0 | None |
| 15 | Mushroom Fields | 0.9 | 1.0 | Rain |
| 16 | Dark Forest | 0.7 | 0.8 | Rain |
| 17 | Cherry Grove | 0.7 | 0.8 | Rain |
| 18 | Meadow | 0.5 | 0.8 | Rain |
| 19 | Wasteland | 1.5 | 0.1 | None |
| 20 | Volcanic | 2.0 | 0.2 | None |
| 21 | Crystal Caverns | 0.5 | 0.0 | None |
| 22 | Crimson Forest | 2.0 | 0.0 | None (Nether) |
| 23 | Warped Forest | 2.0 | 0.0 | None (Nether) |
| 24 | Soul Sand Valley | 2.0 | 0.0 | None (Nether) |
| 25 | Basalt Deltas | 2.0 | 0.0 | None (Nether) |

---

## 14. Weather & Season System

### 14.1 Weather States

| State | Duration | Effects |
|-------|----------|---------|
| Clear | 5–20 min | Normal gameplay |
| Rain | 3–15 min | Hydrates crops, extinguishes fire, reduced visibility |
| Thunderstorm | 1–5 min | Lightning, mobs spawn anytime, increased fog |
| Snow | 5–20 min | Snow accumulation, freezing damage without insulation |
| Fog | 2–10 min | Reduced view distance, hostile mobs spawn closer |
| Sandstorm | 2–8 min (Desert) | Damage over time, reduced visibility, movement penalty |
| Acid Rain | 1–3 min (Wasteland) | Damage to exposed players, blocks take damage |
| Wind Storm | 2–5 min | Knockback, item damage, tree damage |
| Hail | 1–3 min | Damage to crops, damage to exposed players |

### 14.2 Season System

| Season | Duration (in-game days) | Temperature Modifier | Precipitation | Effects |
|--------|------------------------|---------------------|---------------|---------|
| Spring | 15 | +5°C (warming) | Rain common | Crops grow faster, animals breed |
| Summer | 15 | +10°C | Rare | Crops grow fastest, dehydration faster |
| Autumn | 15 | 0°C | Rain common | Harvest bonus, leaves fall |
| Winter | 15 | -15°C | Snow | Crops stop, water freezes, hunger depletes faster |

### 14.3 Seasonal Effects on Gameplay

- **Crop Growth:** Spring = 1.5×, Summer = 2.0×, Autumn = 1.0×, Winter = 0.0× (outdoor)
- **Water Freeze:** Below 0°C, surface water becomes ice
- **Animal Behavior:** Animals migrate/breed in spring, hibernate in winter
- **Player Stats:** Cold biomes in winter require thermal armor or shelter
- **Day Length:** Summer days longer, winter nights longer

---

## 15. Water Simulation

### 15.1 Fluid Properties

| Property | Water | Lava | Oil | Acid |
|----------|-------|------|-----|------|
| Viscosity | 1000 | 4000 | 2000 | 800 |
| Spread Speed | 4 blocks/sec | 1 block/sec | 2 blocks/sec | 5 blocks/sec |
| Source Block | Yes | Yes | Yes | No |
| Flow Distance | 8 blocks | 4 blocks | 6 blocks | 3 blocks |
| Boat Float | Yes | No (burns) | Yes | No (damages) |
| Player Damage | Drowning | 4/sec | None | 2/sec |
| Extinguishes Fire | Yes | No | No | No |
| Light Attenuation | 3 | 15 | 1 | 1 |
| Freezable | Yes (0°C) | No | No | No |
| Evaporates | No | No | No | Yes |

### 15.2 Water Simulation Algorithm

1. **Source blocks** generate infinite water
2. **Flow blocks** spread to adjacent blocks with lower water level
3. **Water level** decreases by 1 per block traveled (out of 8)
4. **Update order:** From source outward using BFS
5. **Optimization:** Only simulate in loaded chunks, use chunk border sync
6. **Flowing water** can push entities (0.5–2.0 m/s depending on depth)
7. **Waterlogging:** 45 block types can be waterlogged (stairs, slabs, fences, etc.)

---

## 16. Building System

### 16.1 Building Mechanics

| Feature | Description |
|---------|-------------|
| Block Placement | Click to place, look at face for adjacency |
| Rotation | R key cycles rotation (Y-axis) |
| Orientation | Sneak + R for X/Z axis orientation |
| Preview | Ghost block shows placement |
| Building Snap | Blocks snap to 1m grid automatically |
| Half Blocks | Slabs can be top/bottom/double |
| Stairs | 8 orientations + upside down |
| Walls | Connect to adjacent walls automatically |
| Fences/Gates | Connect to adjacent fences, open/close |
| Doors | Double doors auto-connect |
| Glass Panes | Connect edges, full frame |
| Iron Bars | Connect edges like glass panes |
| Scaffolding | Climbable, extends upward/downward |

### 16.2 Building Permissions (Tool Cupboard)

```
TC (Tool Cupboard) Placement:
- Must be placed on a foundation
- Protects 50m radius from center
- Must be authorized with Codelock

Authorization:
- By default, placing player is authorized
- Can add/remove players via code lock GUI
- Authorized players can build/place/remove in radius

Building Block:
- Unauthorized players cannot:
  - Place or break blocks
  - Open containers
  - Use workstations
  - Place TC or locks
- Building privilege decays after auth period ends
```

---

## 17. Electricity System

### 17.1 Electrical Components

| Component | Function | Power Usage | Description |
|-----------|----------|-------------|-------------|
| Wire | Conducts power | 0 | Links components |
| Solar Panel | Generates power | +20/sun | Daytime only |
| Wind Turbine | Generates power | +10–40 | Wind dependent |
| Generator | Generates power | +50/fuel | Burns fuel |
| Battery | Stores power | — | Stores up to 10,000 |
| Small Battery | Stores power | — | Stores up to 1,000 |
| Switch | Toggles circuit | 0 | On/Off manually |
| Button | Pulse power | 0 | Momentary |
| Pressure Pad | Pulse on step | 0 | Entity-triggered |
| Timer | Delayed pulse | 1/tick | Configurable delay |
| Splitter | Splits circuit | 0 | 1 input → 3 outputs |
| Combiner | Combines circuits | 0 | 3 inputs → 1 output |
| Blocker | Blocks/forwards signal | 1/tick | Block/Pass toggle |
| Counter | Counts pulses | 2/tick | Configurable |
| AND Gate | Logic AND | 0 | Needs both inputs |
| OR Gate | Logic OR | 0 | Needs either input |
| XOR Gate | Logic XOR | 0 | Only one input |
| Lamp | Light | 5 | Illumination |
| Ceiling Light | Light | 10 | Area illumination |
| Door Controller | Opens door | 3/use | Electric door |
| Turret | Defense | 20/shot | Targets enemies |
| Auto Turret | Defense | 10/idle, 50/active | Smart targeting |
| Radar | Detection | 15 | Detects entities |
| Siren | Alarm | 15 | Audible alert |
| Pump | Transfers fluid | 10 | Water/oil/lava |
| Industrial Conveyor | Transfers items | 5 | Belt system |
| Computer | Programmable | 20 | Lua scripting |
| Charging Station | Charges tools | 30 | Recharges batteries |

### 17.2 Electrical Grid

```
Power Generation → Power Distribution → Power Consumption

Circuit Rules:
- Voltage: 0–180 units
- Wire max capacity: 100 units (default wire)
- Heavy Wire max: 300 units
- Loss over distance: 1 unit per 10 blocks
- Batteries charge/discharge at 25 units/tick
- Turrets require minimum 50 units to operate
- Circuits can be split but total draw must ≤ supply
```

### 17.3 Wire Connection System

```
WIRE_PLACEMENT:
- Start at component output node
- Run wire along surfaces (ceilings, walls, floors)
- Max wire length: 50m between nodes
- Wire can pass through ceilings/floors via wire passthrough
- Right-click to connect wire to component input
- Wire cutters to disconnect

WIRE COLORS:
- Red: Power (hot)
- Black: Ground/Return
- Blue: Data/Sensor
- White: Circuit control
```

---

## 18. Vehicle System

### 18.1 Vehicle Types

| Vehicle | Speed | Health | Seats | Fuel | Description |
|---------|-------|--------|-------|------|-------------|
| Horse | 8–14 m/s | 30 | 1 | Food | Mount, steered |
| Boat | 6–8 m/s | 20 | 2 | None | Water travel |
| Raft | 4–6 m/s | 15 | 4 | None | Larger boat |
| Small Car | 12–20 m/s | 200 | 2 | Gasoline | Fast land travel |
| Truck | 8–14 m/s | 500 | 4 | Diesel | Cargo transport |
| ATV | 10–18 m/s | 150 | 2 | Gasoline | Off-road |
| Helicopter | 8–25 m/s | 300 | 4 | Jet Fuel | Air travel |
| Hang Glider | 4–10 m/s | 10 | 1 | None | Slow fall / glide |
| Motorboat | 10–20 m/s | 100 | 2 | Gasoline | Fast water travel |
| Submarine | 4–8 m/s | 150 | 2 | Battery | Underwater |
| Train | 15–30 m/s | 1000 | 8+ | Coal/Electric | Rail-based |
| Hot Air Balloon | 2–4 m/s | 50 | 4 | Fire | Slow aerial |
| Mini-copter | 6–14 m/s | 100 | 1 | Jet Fuel | Single-person |
| Dune Buggy | 14–22 m/s | 80 | 2 | Gasoline | Desert vehicle |

### 18.2 Vehicle Mechanics

```
CONTROLS:
- WASD: Movement
- Space: Brake/reverse
- Shift: Boost (fuel consuming)
- E: Enter/exit
- L: Lights on/off
- H: Horn

VEHICLE PHYSICS:
- Weight-based handling
- Fuel consumption proportional to speed
- Damage on collision (based on relative velocity)
- Repair with scrap metal + tools
- Storage compartment in larger vehicles
- Lock with code lock
- Vehicles persist when logged off
```

---

## 19. Multiplayer & Social Systems

See [Multiplayer System Document](./07-MULTIPLAYER.md) for network details.

### 19.1 Server Types

| Type | Description | Max Players |
|------|-------------|-------------|
| Solo | Single-player, local world | 1 |
| LAN | Local network co-op | 8 |
| Small Server | Dedicated server | 50 |
| Medium Server | Dedicated server | 100 |
| Large Server | Sharded server | 200+ |
| Mega Server | Multi-shard cluster | 2000+ |

### 19.2 Social Features

| Feature | Description |
|---------|-------------|
| Chat | Global, Local (/l), Clan (/c), Whisper (/w) |
| Voice Chat | Proximity-based (3D positional audio) |
| Friends List | Social tab with online status |
| Player List | Tab key shows all players |
| Map | Shared map markers (clan only) |
| Mail | In-game mail system |
| Report | Report griefing/cheating |
| Ignore | Mute specific players |
| Emote | /wave, /point, /dance, /salute |

---

## 20. Clan System

### 20.1 Clan Features

| Feature | Description |
|---------|-------------|
| Create Clan | /clan create [name] [tag] |
| Invite | /clan invite [player] |
| Kick | /clan kick [player] |
| Promote/Demote | /clan promote [player] |
| Leave | /clan leave |
| Clan Chat | /c [message] |
| Clan Base | Shared TC, shared building privilege |
| Clan Bank | Shared vault (54 slots) |
| Clan Level | XP-based leveling (max 10) |
| Clan Perks | Level-based bonuses (see below) |

### 20.2 Clan Permissions

```
LEADER:       Full control, invite/kick/promote, bank access, TC auth
OFFICER:      Invite/kick members, bank access, build privileges
MEMBER:       Build privileges, bank deposit, use clan base
RECRUIT:      Build privileges only, no bank access
```

### 20.3 Clan Levels & Perks

| Level | XP Required | Perk |
|-------|-------------|------|
| 1 | 0 | Basic clan base |
| 2 | 1000 | +1 member slot (max 5) |
| 3 | 3000 | Clan vault (27 slots) |
| 4 | 6000 | +5% resource gather rate |
| 5 | 10000 | +2 member slots (max 7) |
| 6 | 15000 | Clan motd, clan map |
| 7 | 21000 | +10% crafting speed |
| 8 | 28000 | +3 member slots (max 10) |
| 9 | 36000 | Clan banner customization |
| 10 | 50000 | Clan teleport (30min cooldown) |

---

## 21. Raiding System

### 21.1 Raiding Mechanics

```
Raiding Rules (Rust-inspired):
- Raiding is ALWAYS allowed (no safe zones)
- Building privilege prevents block placement/removal by enemies
- Destroy TC to gain building privilege
- Explosives break blocks (blast resistance matters)
- Doors can be lock-picked or blown up
- Code locks can be cracked (minigame)
- Containers can be broken to access contents
- Loot dropped on death unless in secure storage

Raiding Windows:
- Active raiding: 2-hour window after first block break
- During window: No building privilege decay
- After window: Privilege decay resumes
```

### 21.2 Explosives

| Explosive | Damage | Radius | Cost | Craftable | Description |
|-----------|--------|--------|------|-----------|-------------|
| F1 Grenade | 80 | 4m | Gunpowder+Metal | Yes | Thrown explosive |
| C4 Charge | 250 | 6m | Explosives+Cloth | Yes | Stick to walls, timed |
| Rocket | 150 | 5m | Gunpowder+Pipe | Yes | Fired from launcher |
| Satchel Charge | 200 | 5m | Gunpowder+Canvas | Yes | Throw, short fuse |
| Beancan Grenade | 40 | 3m | Gunpowder+Can | Yes | Cheap, unreliable |
| Explosive Bullet | 50 | 3m | Explosives+Shell | No | Ammo for explosive rifle |
| C4 (Military) | 350 | 8m | — | No | Loot-only, high damage |

### 21.3 Building Defense Rating

| Material | Explosive Resistance | C4 to Destroy |
|----------|---------------------|---------------|
| Wood | 200 | 2 |
| Stone | 600 | 4 |
| Metal | 1200 | 8 |
| Armored | 3000 | 15 |
| Reinforced Glass | 100 | 1 |
| Sheet Metal Door | 400 | 2 |
| Armored Door | 1000 | 4 |
| Garage Door | 600 | 2 |
| Window Bars | 200 | 1 |

---

## 22. Progression & Skill System

### 22.1 Skill Categories

| Skill Tree | Skills | Max Level | Unlocks |
|------------|--------|-----------|---------|
| Mining | Excavation, Detection, Vein Mining | 100 | Better ores, faster mining |
| Woodcutting | Forestry, Lumberjack, Arborist | 100 | Better wood, faster chopping |
| Building | Architecture, Reinforcement, Elevation | 100 | Advanced building parts |
| Combat | Melee, Ranged, Defense, Archery | 100 | Weapon perks, combos |
| Crafting | Smithing, Engineering, Chemistry | 100 | Advanced recipes |
| Farming | Agriculture, Animal Husbandry, Botany | 100 | Crop boosts, rare plants |
| Cooking | Chef, Brewing, Preserving | 100 | Better food bonuses |
| Fishing | Angler, Deep Sea, Trapping | 50 | Rare fish, special loot |
| Exploration | Cartography, Orientation, Archaeology | 50 | Map reveals, treasure |
| Technology | Electronics, Programming, Robotics | 100 | Advanced electrical |
| Medicine | First Aid, Surgery, Pharmacology | 50 | Better healing, antidotes |
| Survival | Adaptation, Resilience, Tracking | 100 | Temp resist, tracking |

### 22.2 Skill Progression

```
XP GAIN:
- Every action grants XP in relevant skill
- Mining stone = Mining XP
- Crafting tools = Crafting XP
- Killing mobs = Combat XP

FORMULA:
XP_to_next_level = 100 × (current_level + 1) × 1.5^current_level

SKILL PERKS (example - Mining):
Level 5:  +10% mining speed
Level 10: Unlock iron detection
Level 25: +1 extra ore (vein chance)
Level 50: Double ore chance
Level 75: Auto-smelt mined ores
Level 100: Titanium mining unlock
```

---

## 23. Quest System

### 23.1 Quest Types

| Type | Description | Examples |
|------|-------------|----------|
| Tutorial | Teach mechanics | "Craft a Wooden Pickaxe" |
| Gathering | Collect resources | "Mine 50 Iron Ore" |
| Crafting | Create items | "Craft an Iron Sword" |
| Building | Construct buildings | "Build a 3×3 House" |
| Exploration | Travel to locations | "Find the Desert Temple" |
| Hunting | Kill specific mobs | "Kill 10 Zombies" |
| Boss | Defeat bosses | "Defeat the Ender Dragon" |
| Dungeon | Clear dungeons | "Clear the Crypt of the Damned" |
| Delivery | Transport items | "Delicate Crate to Outpost" |
| Escort | Protect NPCs | "Escort the Merchant" |
| Daily | Repeatable | "Collect 500 Wood" |
| Weekly | High reward | "Raise 10 Clan Levels" |
| Chain | Multi-part story | "The Ancient Mystery (part 1-8)" |
| Achievement | Permanent unlocks | "Visit All Biomes" |

### 22.2 Quest Format

```json
{
  "quest_id": "kingcraft:first_pickaxe",
  "type": "tutorial",
  "title": "Your First Tool",
  "description": "Craft a wooden pickaxe to start your journey.",
  "requirements": [
    {
      "type": "craft",
      "item": "kingcraft:wooden_pickaxe",
      "count": 1
    }
  ],
  "rewards": [
    {
      "type": "item",
      "item": "kingcraft:bread",
      "count": 5
    },
    {
      "type": "xp",
      "amount": 100,
      "skill": "mining"
    },
    {
      "type": "unlock",
      "recipe": "kingcraft:stone_pickaxe"
    }
  ],
  "prerequisites": [],
  "repeatable": false
}
```

---

## 24. Economy & Trading

### 24.1 Currency System

| Currency | Type | Value | Source |
|----------|------|-------|--------|
| Gold Coin | Item | 100g gold | Smelting gold ore |
| Silver Coin | Item | 10g silver | Smelting silver ore |
| Copper Coin | Item | 1g copper | Smelting copper ore |
| Token | Digital | Variable | Quest rewards |
| Scrap | Item | 1 scrap | Recycling items |
| Voucher | Item | Variable | Trader exchange |

### 24.2 Trading Mechanics

```
PLAYER-TO-PLAYER TRADING:
- /trade [player] or right-click with trade item
- 2×9 grid: left is your offer, right is theirs
- Both must confirm (double confirmation)
- Trade cancelled if either party moves away

NPC MERCHANT TRADING:
- Right-click villager/npc
- Buy/Sell tabs
- Prices fluctuate based on supply/demand
- Reputation system affects prices

MARKET (Server Shop):
- /market to browse
- List items for sale (listing fee)
- Buy listings instantly
- Mail system delivers purchases
- Market tax: 5% of sale price
```

---

## 25. Procedural World Generation

See [World Generation Document](./06-WORLDGEN.md) for detailed generation pipeline.

### 25.1 Generation Pipeline

```
1. SEED INPUT (64-bit integer)
       ↓
2. BIOME MAP (2D noise, 1:4 scale) 
   - Temperature, humidity, height noises
   - Voronoi cell blending for biome borders
       ↓
3. TERRAIN HEIGHTMAP (2D noise)
   - Continentalness, erosion, peaks/valleys
   - Ridge noise for mountain chains
       ↓
4. 3D SURFACE GENERATION
   - Block-by-block population from heightmap
   - Stone, dirt, grass, sand, gravel layers
       ↓
5. CAVE & CARVER PASS
   - 3D noise-based cave systems
   - Cheese caves, spaghetti caves, aquifers
       ↓
6. ORE VEIN GENERATION
   - Per-ore noise placement
   - Vein thickness & depth parameters
       ↓
7. SURFACE FEATURES
   - Trees, grass, flowers, mushrooms
   - Boulders, fallen logs, rock formations
       ↓
8. STRUCTURE PLACEMENT
   - Villages, dungeons, temples, ruins
   - Spacing checks, biome filtering
       ↓
9. FLUID SIMULATION
   - Water/lava placement in aquifers
   - Initial fluid spread
       ↓
10. LIGHTING CALCULATION
    - Sky light propagation
    - Block light from sources
```

---

## 26. Cave & Dungeon System

### 26.1 Cave Types

| Cave Type | Biome | Depth | Size | Features |
|-----------|-------|-------|------|----------|
| Standard Cave | All | 0–64 | Small-Medium | Ores, water pools |
| Deep Cave | All | -32–0 | Medium | Dense ore, lava |
| Crystal Cave | Underground | -64– -32 | Large | Crystals, glowing |
| Lava Cave | Nether/Volcanic | Any | Large | Lava rivers |
| Ice Cave | Taiga/Tundra | 0–32 | Medium | Blue ice, packed ice |
| Mushroom Cave | Underground | -32–0 | Large | Glowing mushrooms |
| Fossil Cave | Any | -64–0 | Medium | Bone blocks, difficult |
| Slime Cave | Swamp | 0–32 | Medium | Slime spawner |
| Amethyst Cave | Any | -64–32 | Medium | Amethyst geodes |
| Abandoned Mineshaft | Any | -32–64 | Massive | Rails, cobwebs |

### 26.2 Dungeon Types

| Dungeon | Difficulty | Floors | Boss | Loot Tier |
|---------|-----------|--------|------|-----------|
| Crypt of Bones | Easy | 1-2 | Skeleton Lord | Common |
| Sunken Temple | Medium | 2-3 | Drowned Captain | Uncommon |
| Flame Citadel | Hard | 3-4 | Fire Elemental | Rare |
| Frozen Throne | Hard | 2-3 | Ice Queen | Rare |
| Void Sanctum | Very Hard | 4-5 | Void Leviathan | Epic |
| Crystal Labyrinth | Very Hard | 3-4 | Crystal Golem | Epic |
| Ender Fortress | Legendary | 5-6 | Ender Warden | Legendary |
| Titan Arena | Legendary | 1 | Titan | Mythic |

---

## 27. AI System

### 27.1 AI Behavior Types

| Type | Description | Examples |
|------|-------------|----------|
| Passive | Flees from threats | Cow, Sheep, Rabbit |
| Neutral | Ignores unless provoked | Bee, Wolf |
| Hostile | Actively attacks | Zombie, Skeleton |
| Territorial | Attacks if too close | Bear, Polar Bear |
| Pack | Hunts in groups | Wolf pack |
| Ambush | Hides then attacks | Creeper, Spider |
| Ranged | Attacks from distance | Skeleton, Golem |
| Boss | Complex attack patterns | Ender Dragon, Titan |
| NPC | Interactive AI | Villager, Trader |
| Guard | Patrols area | Iron Golem, Guard |
| Flying | Aerial movement | Bat, Ghast, Phantom |
| Swimming | Aquatic movement | Fish, Dolphin, Drowned |
| Climbing | Can climb walls | Spider, Cave Spider |
| Burrowing | Digs through terrain | Silverfish, Worm |

### 27.2 AI Task System

```
Each entity runs a priority-based AI task system:

HIGH PRIORITY:
  1. PANIC (health < 20%, fire damage, explosion threat)
  2. COMBAT (target in range)
  3. FLEE (predator nearby, entity-specific threats)

MEDIUM PRIORITY:
  4. EAT (hunger system for animals)
  5. DRINK (thirst system)
  6. SLEEP (nighttime for diurnal creatures)
  7. SOCIAL (mate, pack, herd behavior)
  8. PATROL (guards, NPCs)

LOW PRIORITY:
  9. WANDER (random movement)
  10. IDLE (standing, looking around)
  11. ANIMATION (random sounds, movements)
```

### 27.3 Pathfinding

```
- A* with hierarchical pathfinding
- Chunk-based navigation mesh generation
- Dynamic obstacle avoidance (players, blocks)
- Jump calculation for gaps up to 2 blocks
- Swimming pathfinding in fluids
- Ladder/climbing pathfinding
- Path caching (60 second TTL)
- Entity crowding avoidance
```

---

## 28. Combat System

### 28.1 Combat Mechanics

```
MELEE:
- Attack speed: Each weapon has unique speed
- Sweep: Sword hits multiple targets
- Critical hit: Jumping while attacking
- Block/Shield: Right-click to block (reduces damage)
- Backstab: +50% damage from behind
- Knockback: Based on weapon and enchantments

RANGED:
- Bow: Draw for increased damage (0.5s–3.5s charge)
- Projectile drop: Gravity applied to arrows
- Headshot: 2× damage multiplier (humanoid targets)
- Spread: RNG cone for rapid fire
- Reload: Guns require reloading after magazine empty

COMBAT STATUS EFFECTS:
- Stun: Movement disabled for 1-3 seconds
- Bleeding: Damage over time (2/sec for 5 seconds)
- Poison: Damage over time + slowed
- Burning: 3/sec damage for 5 seconds
- Slowed: Movement speed reduced 50%
- Silenced: Cannot use abilities/chat for duration
```

### 28.2 Armor System

| Armor Set | Head | Chest | Legs | Feet | Total | Protection |
|-----------|------|-------|------|------|-------|------------|
| Leather | 1 | 3 | 2 | 1 | 7 | 28% |
| Bronze | 2 | 5 | 4 | 2 | 13 | 42% |
| Iron | 2 | 6 | 5 | 2 | 15 | 48% |
| Chainmail | 2 | 5 | 4 | 1 | 12 | 40% |
| Steel | 3 | 8 | 6 | 3 | 20 | 60% |
| Diamond | 3 | 8 | 6 | 3 | 20 | 64% |
| Netherite | 3 | 8 | 6 | 3 | 20 | 68% |
| Hazmat | 1 | 2 | 2 | 1 | 6 | Radiation only |
| Titanium | 4 | 10 | 8 | 4 | 26 | 75% |

---

## 29. Day/Night Cycle

### 29.1 Cycle Parameters

| Parameter | Day | Night |
|-----------|-----|-------|
| Duration | 15 minutes real-time | 5 minutes real-time |
| Sky Light | 15 (full) → 4 (dusk) | 4 (dusk) → 0 (midnight) → 4 (dawn) |
| Mob Spawns | None (unless underground) | Full surface spawns |
| Player Visibility | Full | Reduced (need light source) |
| Temperature | +5°C modifier | -5°C modifier |

### 29.2 Cycle Timings

```
DAWN:     06:00–07:00  (Sky light: 4→12)
MORNING:  07:00–12:00  (Sky light: 12→15)
MIDDAY:   12:00–13:00  (Sky light: 15)
AFTERNOON:13:00–18:00  (Sky light: 15→12)
DUSK:     18:00–19:00  (Sky light: 12→4)
NIGHT:    19:00–06:00  (Sky light: 4→0→4)
MIDNIGHT: 00:00–01:00  (Sky light: 0)

Time Speed: 1 in-game minute = 0.83 real seconds
Full day cycle: 20 minutes real time
```

---

*End of Game Design Document*

Next: [Technical Design Document →](./02-TDD.md)
