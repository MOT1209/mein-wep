# World Generation System

> **Reference:** Minecraft Wiki (worldgen noise, biome system), Misode (worldgen JSON schema)  
> **Algorithm:** Multi-octave 3D noise (OpenSimplex2S / FastNoise2)

---

## 1. Generation Pipeline

### 1.1 Overview

```
STEP 0: SEED
  - 64-bit seed from user input or random
  - All noise functions derived from seed (split by domain)
       ↓
STEP 1: BIOME GRID (2D, 1:4 scale)
  - Temperature, humidity, continentalness, erosion, weirdness
  - Voronoi-based biome border blending
  - Biome map at 1 block per 4×4 area (64×64 chunks)
       ↓
STEP 2: TERRAIN HEIGHTMAP (2D)
  - Continentalness noise → land vs ocean
  - Erosion noise → flat vs mountainous
  - Peaks/valleys noise → ridge lines
  - Height = base_height + variation × noise_value
       ↓
STEP 3: 3D SURFACE DENSITY
  - 3D noise fills blocks below heightmap
  - Stone: Y < gravel_level
  - Deepslate: Y < deepslate_level (-8)
  - Dirt/Grass: Y > surface level
  - Sand/Gravel: Beach/dry area surface
       ↓
STEP 4: CAVES & CARVERS (3D)
  - Cheese caves: Cellular noise threshold
  - Spaghetti caves: Ridge noise tunnels
  - Noise caves: Combined 3D noise
  - Aquifers: Water/lava pockets
       ↓
STEP 5: ORES (3D veining)
  - Each ore type has noise-based distribution
  - Vein parameters: size, frequency, min_y, max_y
  - Random offset for natural variation
       ↓
STEP 6: SURFACE FEATURES
  - Trees: Placed on grass blocks with spacing
  - Grass/Flowers: Random scatter per biome
  - Boulders: Rock formations
  - Fallen logs: On forest floors
       ↓
STEP 7: FLUID PLACEMENT
  - Water below sea level
  - Lava in deep caves (Y < -32)
  - Lake/pond features
       ↓
STEP 8: STRUCTURES
  - Village, dungeon, temple, outpost
  - Check valid biome + location constraints
  - NBT/Jigsaw structure placement
       ↓
STEP 9: LIGHTING
  - Sky light propagation (top-down)
  - Block light from sources
  - Initial light spread
```

### 1.2 Noise Configuration

```json
{
  "noise_settings": {
    "bedrock_roof": { "min_y": -64, "max_y": -60 },
    "bedrock_floor": { "min_y": -64, "max_y": -64 },
    "sea_level": 63,
    "deepslate_level": 0,
    "noise": {
      "height": {
        "type": "open_simplex2s",
        "octaves": 6,
        "frequency": 0.0015,
        "amplitude": 64.0,
        "lacunarity": 2.0,
        "gain": 0.5
      },
      "continentalness": {
        "type": "open_simplex2s",
        "octaves": 4,
        "frequency": 0.0005,
        "amplitude": 1.0
      },
      "erosion": {
        "type": "open_simplex2s",
        "octaves": 4,
        "frequency": 0.001,
        "amplitude": 1.0
      },
      "temperature": {
        "type": "open_simplex2s",
        "octaves": 3,
        "frequency": 0.0008,
        "amplitude": 1.0
      },
      "humidity": {
        "type": "open_simplex2s",
        "octaves": 3,
        "frequency": 0.0008,
        "amplitude": 1.0
      },
      "weirdness": {
        "type": "open_simplex2s",
        "octaves": 2,
        "frequency": 0.002,
        "amplitude": 1.0
      },
      "caves": {
        "type": "cellular",
        "frequency": 0.008,
        "jitter": 0.5,
        "threshold": 0.08
      },
      "spaghetti_caves": {
        "type": "open_simplex2s",
        "octaves": 3,
        "frequency": 0.005,
        "threshold": 0.12
      }
    }
  }
}
```

---

## 2. Biome System

### 2.1 Biome JSON Definition

```json
{
  "biome_id": "kingcraft:dark_forest",
  "temperature": 0.7,
  "downfall": 0.8,
  "has_precipitation": true,
  "effects": {
    "sky_color": "#1a1a2e",
    "fog_color": "#1a1a2e",
    "water_color": "#3f76e4",
    "water_fog_color": "#3f76e4",
    "grass_color": "#2d5a27",
    "foliage_color": "#1a4f1a",
    "ambient_sound": "ambient.dark_forest.loop",
    "mood_sound": {
      "sound": "ambient.dark_forest.mood",
      "tick_delay": 600,
      "block_search_extent": 8,
      "offset": 2.0
    },
    "additions_sound": {
      "sound": "ambient.dark_forest.additions",
      "tick_chance": 0.005
    },
    "music": {
      "sound": "music.dark_forest",
      "min_delay": 12000,
      "max_delay": 24000,
      "replace_current_music": false
    },
    "particle": {
      "probability": 0.001,
      "options": {
        "type": "minecraft:mycelium",
        "count": 1
      }
    }
  },
  "carvers": [
    {
      "carver": "cave",
      "config": "kingcraft:cave_config",
      "step": "air",
      "probability": 0.15
    }
  ],
  "features": [
    ["dark_oak_trees"],
    ["grass_forest"],
    ["rose_bush"],
    ["lilac"],
    ["peony"],
    ["mushrooms_forest"],
    ["fallen_logs"],
    ["boulders"]
  ],
  "creature_spawns": {
    "passive": [
      { "entity": "minecraft:wolf", "weight": 5, "min_group": 4, "max_group": 4 },
      { "entity": "minecraft:bat", "weight": 10, "min_group": 8, "max_group": 8 }
    ],
    "hostile": [
      { "entity": "minecraft:zombie", "weight": 100, "min_group": 4, "max_group": 4 },
      { "entity": "minecraft:skeleton", "weight": 100, "min_group": 4, "max_group": 4 },
      { "entity": "minecraft:spider", "weight": 100, "min_group": 4, "max_group": 4 },
      { "entity": "minecraft:creeper", "weight": 100, "min_group": 4, "max_group": 4 },
      { "entity": "minecraft:witch", "weight": 10, "min_group": 1, "max_group": 1 },
      { "entity": "minecraft:enderman", "weight": 1, "min_group": 1, "max_group": 4 }
    ]
  }
}
```

---

## 3. Structure Definitions

### 3.1 Structure JSON

```json
{
  "structure_id": "kingcraft:desert_temple",
  "type": "jigsaw",
  "biomes": ["minecraft:desert"],
  "adapt_noise": true,
  "spacing": 12,
  "separation": 8,
  "terrain_adaptation": "beard_box",
  "start_height": {
    "absolute": 0
  },
  "step": "underground_structures",
  "start_pool": "kingcraft:desert_temple/start",
  "size": 7,
  "max_distance_from_center": 80,
  "overrides": {
    "loot_tables": {
      "chest": "kingcraft:chests/desert_temple"
    }
  }
}
```

### 3.2 Structure Template Pool

```json
{
  "name": "kingcraft:desert_temple/start",
  "fallback": "minecraft:empty",
  "elements": [
    {
      "weight": 1,
      "element": {
        "location": "kingcraft:desert_temple/main",
        "processors": "kingcraft:desert_temple_processor",
        "projection": "rigid",
        "element_type": "minecraft:single_pool_element"
      }
    }
  ]
}
```

### 3.3 Structure List

| Structure | Biome | Type | Loot Tier | Spacing | Features |
|-----------|-------|------|-----------|---------|----------|
| Village (Plains) | Plains | Jigsaw | Common | 32 blocks | Houses, farms, blacksmith |
| Village (Desert) | Desert | Jigsaw | Common | 32 blocks | Sandstone buildings |
| Village (Savanna) | Savanna | Jigsaw | Common | 32 blocks | Acacia structures |
| Village (Taiga) | Taiga | Jigsaw | Common | 32 blocks | Spruce buildings |
| Village (Snow) | Snow | Jigsaw | Common | 32 blocks | Igloo variants |
| Desert Temple | Desert | Jigsaw | Uncommon | 12 chunks | Traps, chest |
| Jungle Temple | Jungle | Jigsaw | Uncommon | 12 chunks | Puzzles, chest |
| Ocean Monument | Ocean | Jigsaw | Epic | 16 chunks | Elder Guardian |
| Woodland Mansion | Dark Forest | Jigsaw | Rare | 48 chunks | Illagers, loot |
| Pillager Outpost | Plains/Desert | Jigsaw | Common | 8 chunks | Crossbow, banner |
| Nether Fortress | Nether | Jigsaw | Rare | 8 chunks | Blaze, wither skele |
| Bastion Remnant | Crimson | Jigsaw | Epic | 8 chunks | Piglin, gold |
| End City | End | Jigsaw | Legendary | 12 chunks | Elytra, shulker |
| Abandoned Mineshaft | Any | Cave | Common | 4 chunks | Rails, chest, cobweb |
| Shipwreck | Ocean | Surface | Common | 8 chunks | Chest, map |
| Ocean Ruin | Ocean | Surface | Common | 8 chunks | Treasure |
| Igloo | Snow | Surface | Common | 8 chunks | Basement |
| Swamp Hut | Swamp | Surface | Common | 8 chunks | Witch |
| Desert Well | Desert | Surface | Common | 16 chunks | Water |
| Fossil | Any | Underground | Common | 16 chunks | Bone blocks |
| Ruined Portal | Any | Surface | Common | 16 chunks | Gold blocks |
| Ancient City | Deep Dark | Underground | Legendary | 32 chunks | Warden, Swift Sneak |
| Trail Ruins | Jungle/Taiga | Underground | Uncommon | 16 chunks | Archaeology |
| Outpost (KingCraft) | Any | Surface | Common | 8 chunks | Guard tower |
| Bandit Camp | Any | Surface | Common | 10 chunks | Tents, loot |
| Scientist Lab | Wasteland | Surface | Rare | 16 chunks | Tech loot |
| Abandoned Bunker | Any | Underground | Rare | 20 chunks | Military loot |

---

## 4. Ore Generation

```json
{
  "configured_feature": {
    "type": "ore",
    "config": {
      "targets": [
        {
          "target": {
            "predicate_type": "block_match",
            "block": "minecraft:stone"
          },
          "state": {
            "Name": "minecraft:iron_ore"
          }
        },
        {
          "target": {
            "predicate_type": "block_match",
            "block": "minecraft:deepslate"
          },
          "state": {
            "Name": "minecraft:deepslate_iron_ore"
          }
        }
      ],
      "size": 9,
      "discard_chance_on_air_exposure": 0.0
    }
  }
}
```

### Ore Distribution

| Ore | Min Y | Max Y | Frequency | Vein Size | Common Per Chunk |
|-----|-------|-------|-----------|-----------|-----------------|
| Coal | 0 | 256 | High | 17 | 20 |
| Iron | -64 | 72 | Medium | 9 | 10 |
| Copper | -16 | 112 | Medium | 10 | 8 |
| Gold | -64 | 32 | Low | 9 | 2 |
| Lapis | -32 | 32 | Low | 7 | 1 |
| Redstone | -64 | 16 | Medium | 8 | 8 |
| Diamond | -64 | 16 | Very Low | 4 | 1 |
| Emerald | -16 | 256 (mountains) | Very Low | 3 | 0.5 |
| Silver | -32 | 48 | Medium | 8 | 4 |
| Tin | -16 | 64 | Medium | 10 | 6 |
| Uranium | -64 | -16 | Low | 3 | 1 |
| Titanium | -64 | -32 | Very Low | 3 | 0.5 |
| Sulfur | 0 | 32 | Medium | 12 | 8 |
| Saltpeter | 0 | 48 | Medium | 10 | 6 |
| Ruby | -64 | -16 | Very Low | 2 | 0.3 |
| Sapphire | -64 | -16 | Very Low | 2 | 0.3 |
| Platinum | -64 | -32 | Very Low | 2 | 0.25 |
| Aluminum | -16 | 64 | Medium | 12 | 5 |

---

## 5. World Generation JSON (Misode-style datapack)

```json
{
  "type": "minecraft:overworld",
  "generator": {
    "type": "minecraft:noise",
    "settings": "kingcraft:overworld_noise",
    "biome_source": {
      "type": "minecraft:multi_noise",
      "preset": "minecraft:overworld",
      "seed": 0
    }
  }
}
```

---

*End of World Generation Document*

Next: [Multiplayer System →](./07-MULTIPLAYER.md)
