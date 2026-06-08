# Block System — Complete Registry

> **Reference:** Minecraft Wiki (block properties), Misode (registries, JSON schemas)  
> **Total Blocks:** 512+ (with room for mod expansion)  
> **ID Range:** 0–1023 (reserving 512–1023 for mods/dynamic registration)

---

## Table of Contents
1. [Block Registry Schema](#1-block-registry-schema)
2. [Block Properties Reference](#2-block-properties-reference)
3. [Complete Block ID Table](#3-complete-block-id-table)
4. [Block State Definitions](#4-block-state-definitions)
5. [Block Tags](#5-block-tags)
6. [Block Loot Tables](#6-block-loot-tables)
7. [Block Sounds](#7-block-sounds)
8. [Full JSON Examples](#8-full-json-examples)

---

## 1. Block Registry Schema

```json
{
  "$schema": "https://kingcraft.game/schemas/block_schema.json",
  "type": "object",
  "required": [
    "block_id", "numeric_id", "hardness", "resistance",
    "material", "tool_type", "min_tier", "drops"
  ],
  "properties": {
    "block_id": {
      "type": "string",
      "pattern": "^[a-z_]+:[a-z_]+$",
      "description": "Namespaced block ID (mod_id:block_name)"
    },
    "numeric_id": {
      "type": "integer",
      "minimum": 0,
      "maximum": 1023,
      "description": "Numeric registry ID for network/disk compression"
    },
    "hardness": {
      "type": "number",
      "minimum": 0.0,
      "description": "Time to break in seconds (hand mining)"
    },
    "resistance": {
      "type": "number",
      "minimum": 0.0,
      "description": "Explosion resistance (blast_resistance in Minecraft)"
    },
    "material": {
      "type": "string",
      "enum": [
        "stone", "dirt", "wood", "plant", "metal", "glass",
        "cloth", "sand", "snow", "ice", "lava", "water",
        "organic", "crystal", "electric", "composite", "bedrock"
      ]
    },
    "tool_type": {
      "type": "string",
      "enum": ["pickaxe", "axe", "shovel", "hoe", "shears", "none"]
    },
    "min_tier": {
      "type": "integer",
      "minimum": 0,
      "maximum": 8,
      "description": "Minimum tool tier to drop items (0=any, 1=wood, 2=stone, 3=iron, 4=diamond, 5=netherite, 6=titanium)"
    },
    "luminance": {
      "type": "integer",
      "minimum": 0,
      "maximum": 15,
      "default": 0
    },
    "opacity": {
      "type": "integer",
      "minimum": 0,
      "maximum": 15,
      "default": 15,
      "description": "How much light this block absorbs (15 = opaque)"
    },
    "collision_shape": {
      "type": "string",
      "enum": ["full_block", "slab", "stair", "fence", "wall", "door", "none", "custom"],
      "default": "full_block"
    },
    "is_cube": {
      "type": "boolean",
      "default": true
    },
    "occludes": {
      "type": "boolean",
      "default": true,
      "description": "Does this block hide adjacent faces?"
    },
    "flammable": {
      "type": "boolean",
      "default": false
    },
    "fire_spread_speed": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "default": 0
    },
    "fire_burn_rate": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "default": 0
    },
    "requires_tool": {
      "type": "boolean",
      "default": false
    },
    "drops": {
      "type": "string",
      "description": "Item ID of dropped item"
    },
    "drop_count": {
      "type": "object",
      "properties": {
        "min": { "type": "integer", "default": 1 },
        "max": { "type": "integer", "default": 1 }
      }
    },
    "xp_drop": {
      "type": "object",
      "properties": {
        "min": { "type": "integer", "default": 0 },
        "max": { "type": "integer", "default": 0 }
      }
    },
    "sound_type": {
      "type": "string",
      "enum": [
        "stone", "wood", "gravel", "grass", "sand", "snow",
        "metal", "glass", "cloth", "lantern", "stem", "nether_wood",
        "nether_ore", "soul_sand", "bamboo", "scaffolding", "roots",
        "moss", "coral", "copper", "deepslate", "dripstone", "pointed_dripstone",
        "rooted_dirt", "nylium", "wart", "shroomlight", "cave_vines",
        "powder_snow", "big_dripleaf", "small_dripleaf", "suspicious_sand",
        "suspicious_gravel", "decorated_pot"
      ]
    },
    "push_reaction": {
      "type": "string",
      "enum": ["normal", "destroy", "block", "push_only", "ignore"],
      "default": "normal"
    },
    "max_stack_size": {
      "type": "integer",
      "minimum": 1,
      "maximum": 64,
      "default": 64
    },
    "block_entity": {
      "type": "boolean",
      "default": false
    },
    "block_entity_type": {
      "type": "string",
      "description": "Type of block entity if block_entity is true"
    },
    "states": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "type": { "type": "string", "enum": ["bool", "int", "enum"] },
          "values": { "type": "array" },
          "default": { }
        }
      },
      "description": "Block states (like Minecraft blockstates)"
    },
    "variants": {
      "type": "object",
      "description": "Variant definitions for rendering (like Minecraft model variants)"
    }
  }
}
```

---

## 2. Block Properties Reference

### 2.1 Hardness Scale

| Hardness | Example | Mining Time (Hand) | Mining Time (Iron Pick) |
|----------|---------|-------------------|------------------------|
| 0.2 | Leaves, Grass | 0.1s | Instant |
| 0.5 | Dirt, Sand | 0.25s | Instant |
| 0.6 | Grass Block | 0.3s | Instant |
| 1.0 | Wood Planks | 0.5s | 0.25s |
| 1.5 | Stone | 0.75s | 0.15s |
| 2.0 | Brick, Log | 1.0s | 0.35s |
| 3.0 | Iron Ore, Obsidian | 1.5s | 0.75s |
| 5.0 | Diamond Block | 2.5s | 1.25s |
| 10.0 | Ancient Debris | 5.0s | 2.5s |
| 25.0 | Reinforced Metal | 12.5s | 6.25s |
| 50.0 | Obsidian | 25.0s | 12.5s |
| ∞ | Bedrock | ∞ | ∞ |

### 2.2 Mining Speed Formula

```
mine_time = hardness × 1.5 ÷ mining_speed

Where mining_speed:
  - Hand:          1.0 (plus 5× penalty if no correct tool)
  - Wood Tool:     2.0
  - Stone Tool:    4.0
  - Bronze Tool:   5.0
  - Iron Tool:     6.0
  - Gold Tool:     12.0
  - Steel Tool:    7.0
  - Diamond Tool:  8.0
  - Netherite Tool: 9.0
  - Titanium Tool: 10.0

Efficiency enchantment: +0.1 per level (additive to mining_speed)
Haste effect: +0.2 per level
```

### 2.3 Explosion Resistance

| Resistance | Block | C4 Needed | Rocket Needed |
|------------|-------|-----------|---------------|
| 0 | Leaves, Glass | 0 | 0 |
| 0.5 | Dirt, Sand | 0 | 0 |
| 3.0 | Wood Planks | 1 | 2 |
| 6.0 | Stone | 1 | 2 |
| 10.0 | Metal | 2 | 3 |
| 30.0 | Reinforced Stone | 4 | 6 |
| 120.0 | Reinforced Metal | 8 | 12 |
| 600.0 | Armored | 15 | 20 |
| 1200.0 | Obsidian | 20 | 30 |
| 18M | Bedrock | ∞ | ∞ |

### 2.4 Light Levels

| Level | Brightness | Examples |
|-------|-----------|----------|
| 15 | Full light | Sunlight, Glowstone, Sea Lantern |
| 14 | Very bright | Jack o'Lantern, Redstone Lamp (lit) |
| 13 | Bright | Shroomlight |
| 12 | | Beacon |
| 11 | | End Rod |
| 10 | Moderate | Torch |
| 9 | | Campfire (lit) |
| 8 | | Furnace (lit), Soul Torch |
| 7 | Dim | Brown Mushroom |
| 6 | | Redstone Torch (lit) |
| 5 | Very dim | Candle (1 candle) |
| 4 | | |
| 3 | | |
| 2 | | |
| 1 | Minimal | |
| 0 | Pitch black | Void |

---

## 3. Complete Block ID Table

### 3.1 Natural Blocks (ID 1–71)

| ID | Block | Namespaced ID | Hardness | Resistance | Tool | Min Tier | Luminance | Opacity | Drops |
|----|-------|---------------|----------|------------|------|----------|-----------|--------|-------|
| 1 | Stone | minecraft:stone | 1.5 | 6.0 | Pickaxe | 0 | 0 | 15 | Cobblestone |
| 2 | Granite | minecraft:granite | 1.5 | 6.0 | Pickaxe | 0 | 0 | 15 | Granite |
| 3 | Diorite | minecraft:diorite | 1.5 | 6.0 | Pickaxe | 0 | 0 | 15 | Diorite |
| 4 | Andesite | minecraft:andesite | 1.5 | 6.0 | Pickaxe | 0 | 0 | 15 | Andesite |
| 5 | Deepslate | minecraft:deepslate | 3.0 | 6.0 | Pickaxe | 0 | 0 | 15 | Cobbled Deepslate |
| 6 | Tuff | minecraft:tuff | 1.5 | 6.0 | Pickaxe | 0 | 0 | 15 | Tuff |
| 7 | Calcite | minecraft:calcite | 0.75 | 0.75 | Pickaxe | 0 | 0 | 15 | Calcite |
| 8 | Dirt | minecraft:dirt | 0.5 | 0.5 | Shovel | 0 | 0 | 15 | Dirt |
| 9 | Grass Block | minecraft:grass_block | 0.6 | 0.6 | Shovel | 0 | 0 | 15 | Dirt |
| 10 | Podzol | minecraft:podzol | 0.5 | 0.5 | Shovel | 0 | 0 | 15 | Podzol |
| 11 | Mycelium | minecraft:mycelium | 0.6 | 0.6 | Shovel | 0 | 0 | 15 | Dirt |
| 12 | Coarse Dirt | minecraft:coarse_dirt | 0.5 | 0.5 | Shovel | 0 | 0 | 15 | Coarse Dirt |
| 13 | Rooted Dirt | minecraft:rooted_dirt | 0.5 | 0.5 | Shovel | 0 | 0 | 15 | Rooted Dirt |
| 14 | Mud | minecraft:mud | 0.5 | 0.5 | Shovel | 0 | 0 | 15 | Mud |
| 15 | Clay | minecraft:clay | 0.6 | 0.6 | Shovel | 0 | 0 | 15 | Clay Balls ×4 |
| 16 | Gravel | minecraft:gravel | 0.6 | 0.6 | Shovel | 0 | 0 | 15 | Gravel (10% Flint) |
| 17 | Sand | minecraft:sand | 0.5 | 0.5 | Shovel | 0 | 0 | 15 | Sand |
| 18 | Red Sand | minecraft:red_sand | 0.5 | 0.5 | Shovel | 0 | 0 | 15 | Red Sand |
| 19 | Sandstone | minecraft:sandstone | 0.8 | 0.8 | Pickaxe | 0 | 0 | 15 | Sandstone |
| 20 | Red Sandstone | minecraft:red_sandstone | 0.8 | 0.8 | Pickaxe | 0 | 0 | 15 | Red Sandstone |
| 21 | Soul Sand | minecraft:soul_sand | 0.5 | 0.5 | Shovel | 0 | 0 | 15 | Soul Sand |
| 22 | Soul Soil | minecraft:soul_soil | 0.5 | 0.5 | Shovel | 0 | 0 | 15 | Soul Soil |
| 23 | Netherrack | minecraft:netherrack | 0.4 | 0.4 | Pickaxe | 0 | 0 | 15 | Netherrack |
| 24 | Basalt | minecraft:basalt | 1.25 | 4.2 | Pickaxe | 0 | 0 | 15 | Basalt |
| 25 | Blackstone | minecraft:blackstone | 1.5 | 6.0 | Pickaxe | 0 | 0 | 15 | Blackstone |
| 26 | End Stone | minecraft:end_stone | 3.0 | 9.0 | Pickaxe | 0 | 0 | 15 | End Stone |
| 27 | Ice | minecraft:ice | 0.5 | 0.5 | Pickaxe | 0 | 3 | 3 | Nothing (slippery) |
| 28 | Packed Ice | minecraft:packed_ice | 0.5 | 0.5 | Pickaxe | 0 | 0 | 15 | Packed Ice |
| 29 | Blue Ice | minecraft:blue_ice | 0.5 | 0.5 | Pickaxe | 0 | 0 | 15 | Blue Ice |
| 30 | Snow Block | minecraft:snow_block | 0.2 | 0.2 | Shovel | 0 | 0 | 15 | Snowball ×4 |
| 31 | Powder Snow | minecraft:powder_snow | 0.25 | 0.25 | Bucket | 0 | 0 | 0 | Nothing |
| 32 | Moss Block | minecraft:moss_block | 0.1 | 0.1 | Hoe/Axe | 0 | 0 | 15 | Moss Block |
| 33 | Dripstone Block | minecraft:dripstone_block | 1.5 | 1.0 | Pickaxe | 0 | 0 | 15 | Dripstone Block |
| 34 | Pointed Dripstone | minecraft:pointed_dripstone | 1.5 | 1.0 | Pickaxe | 0 | 0 | 3 | Pointed Dripstone |
| 35 | Bedrock | minecraft:bedrock | ∞ | 18,000,000 | None | — | 0 | 15 | Nothing |
| 36 | Cobblestone | minecraft:cobblestone | 2.0 | 6.0 | Pickaxe | 0 | 0 | 15 | Cobblestone |
| 37 | Mossy Cobblestone | minecraft:mossy_cobblestone | 2.0 | 6.0 | Pickaxe | 0 | 0 | 15 | Mossy Cobblestone |
| 38 | Obsidian | minecraft:obsidian | 50.0 | 1200.0 | Pickaxe | 4 | 0 | 15 | Obsidian |
| 39 | Crying Obsidian | minecraft:crying_obsidian | 50.0 | 1200.0 | Pickaxe | 4 | 0 | 15 | Crying Obsidian |
| 40 | Glowstone | minecraft:glowstone | 0.3 | 0.3 | Pickaxe | 0 | 15 | 15 | Glowstone Dust ×2-4 |

### 3.2 Ores (ID 41–71)

| ID | Block | Namespaced ID | Hardness | Resistance | Tool | Min Tier | XP | Drops |
|----|-------|---------------|----------|------------|------|----------|-----|-------|
| 41 | Coal Ore | minecraft:coal_ore | 3.0 | 3.0 | Pickaxe | 0 | 0–2 | Coal |
| 42 | Deepslate Coal Ore | minecraft:deepslate_coal_ore | 4.5 | 4.5 | Pickaxe | 0 | 0–2 | Coal |
| 43 | Iron Ore | minecraft:iron_ore | 3.0 | 3.0 | Pickaxe | 2 | 0 | Raw Iron |
| 44 | Deepslate Iron Ore | minecraft:deepslate_iron_ore | 4.5 | 4.5 | Pickaxe | 2 | 0 | Raw Iron |
| 45 | Copper Ore | minecraft:copper_ore | 3.0 | 3.0 | Pickaxe | 2 | 0 | Raw Copper |
| 46 | Deepslate Copper Ore | minecraft:deepslate_copper_ore | 4.5 | 4.5 | Pickaxe | 2 | 0 | Raw Copper |
| 47 | Gold Ore | minecraft:gold_ore | 3.0 | 3.0 | Pickaxe | 3 | 0 | Raw Gold |
| 48 | Deepslate Gold Ore | minecraft:deepslate_gold_ore | 4.5 | 4.5 | Pickaxe | 3 | 0 | Raw Gold |
| 49 | Lapis Lazuli Ore | minecraft:lapis_ore | 3.0 | 3.0 | Pickaxe | 2 | 2–5 | Lapis Lazuli ×4-9 |
| 50 | Deepslate Lapis Ore | minecraft:deepslate_lapis_ore | 4.5 | 4.5 | Pickaxe | 2 | 2–5 | Lapis Lazuli ×4-9 |
| 51 | Redstone Ore | minecraft:redstone_ore | 3.0 | 3.0 | Pickaxe | 3 | 1–5 | Redstone ×4-5 |
| 52 | Deepslate Redstone Ore | minecraft:deepslate_redstone_ore | 4.5 | 4.5 | Pickaxe | 3 | 1–5 | Redstone ×4-5 |
| 53 | Diamond Ore | minecraft:diamond_ore | 3.0 | 3.0 | Pickaxe | 3 | 3–7 | Diamond |
| 54 | Deepslate Diamond Ore | minecraft:deepslate_diamond_ore | 4.5 | 4.5 | Pickaxe | 3 | 3–7 | Diamond |
| 55 | Emerald Ore | minecraft:emerald_ore | 3.0 | 3.0 | Pickaxe | 3 | 3–11 | Emerald |
| 56 | Deepslate Emerald Ore | minecraft:deepslate_emerald_ore | 4.5 | 4.5 | Pickaxe | 3 | 3–11 | Emerald |
| 57 | Nether Quartz Ore | minecraft:nether_quartz_ore | 3.0 | 3.0 | Pickaxe | 0 | 2–5 | Nether Quartz |
| 58 | Nether Gold Ore | minecraft:nether_gold_ore | 3.0 | 3.0 | Pickaxe | 0 | 0 | Gold Nugget ×2-6 |
| 59 | Ancient Debris | minecraft:ancient_debris | 30.0 | 1200.0 | Pickaxe | 4 | 0 | Ancient Debris |
| 60 | Silver Ore | kingcraft:silver_ore | 3.0 | 3.0 | Pickaxe | 2 | 0 | Raw Silver |
| 61 | Deepslate Silver Ore | kingcraft:deepslate_silver_ore | 4.5 | 4.5 | Pickaxe | 2 | 0 | Raw Silver |
| 62 | Tin Ore | kingcraft:tin_ore | 3.0 | 3.0 | Pickaxe | 2 | 0 | Raw Tin |
| 63 | Deepslate Tin Ore | kingcraft:deepslate_tin_ore | 4.5 | 4.5 | Pickaxe | 2 | 0 | Raw Tin |
| 64 | Uranium Ore | kingcraft:uranium_ore | 5.0 | 5.0 | Pickaxe | 3 | 0 | Raw Uranium |
| 65 | Titanium Ore | kingcraft:titanium_ore | 8.0 | 8.0 | Pickaxe | 3 | 0 | Raw Titanium |
| 66 | Sulfur Ore | kingcraft:sulfur_ore | 2.0 | 2.0 | Pickaxe | 0 | 0 | Sulfur |
| 67 | Saltpeter Ore | kingcraft:saltpeter_ore | 2.0 | 2.0 | Pickaxe | 0 | 0 | Saltpeter |
| 68 | Ruby Ore | kingcraft:ruby_ore | 4.0 | 4.0 | Pickaxe | 3 | 5–10 | Ruby |
| 69 | Sapphire Ore | kingcraft:sapphire_ore | 4.0 | 4.0 | Pickaxe | 3 | 5–10 | Sapphire |
| 70 | Platinum Ore | kingcraft:platinum_ore | 4.0 | 4.0 | Pickaxe | 3 | 0 | Raw Platinum |
| 71 | Aluminum Ore | kingcraft:aluminum_ore | 3.0 | 3.0 | Pickaxe | 2 | 0 | Raw Aluminum |

### 3.3 Wood & Vegetation (ID 72–127)

| ID | Block | Namespaced ID | Hardness | Resistance | Tool | Flammable | Luminance | Drops |
|----|-------|---------------|----------|------------|------|-----------|-----------|-------|
| 72 | Oak Log | minecraft:oak_log | 2.0 | 2.0 | Axe | Yes | 0 | Oak Log |
| 73 | Spruce Log | minecraft:spruce_log | 2.0 | 2.0 | Axe | Yes | 0 | Spruce Log |
| 74 | Birch Log | minecraft:birch_log | 2.0 | 2.0 | Axe | Yes | 0 | Birch Log |
| 75 | Jungle Log | minecraft:jungle_log | 2.0 | 2.0 | Axe | Yes | 0 | Jungle Log |
| 76 | Acacia Log | minecraft:acacia_log | 2.0 | 2.0 | Axe | Yes | 0 | Acacia Log |
| 77 | Dark Oak Log | minecraft:dark_oak_log | 2.0 | 2.0 | Axe | Yes | 0 | Dark Oak Log |
| 78 | Mangrove Log | minecraft:mangrove_log | 2.0 | 2.0 | Axe | Yes | 0 | Mangrove Log |
| 79 | Cherry Log | minecraft:cherry_log | 2.0 | 2.0 | Axe | Yes | 0 | Cherry Log |
| 80 | Crimson Stem | minecraft:crimson_stem | 2.0 | 2.0 | Axe | No | 0 | Crimson Stem |
| 81 | Warped Stem | minecraft:warped_stem | 2.0 | 2.0 | Axe | No | 0 | Warped Stem |
| 82 | Oak Leaves | minecraft:oak_leaves | 0.2 | 0.2 | Shears/Hoe | Yes | 0 | Leaves/Sapling |
| 83 | Spruce Leaves | minecraft:spruce_leaves | 0.2 | 0.2 | Shears/Hoe | Yes | 0 | Leaves/Sapling |
| 84 | Birch Leaves | minecraft:birch_leaves | 0.2 | 0.2 | Shears/Hoe | Yes | 0 | Leaves/Sapling |
| 85 | Jungle Leaves | minecraft:jungle_leaves | 0.2 | 0.2 | Shears/Hoe | Yes | 0 | Leaves/Sapling |
| 86 | Acacia Leaves | minecraft:acacia_leaves | 0.2 | 0.2 | Shears/Hoe | Yes | 0 | Leaves/Sapling |
| 87 | Dark Oak Leaves | minecraft:dark_oak_leaves | 0.2 | 0.2 | Shears/Hoe | Yes | 0 | Leaves/Sapling |
| 88 | Mangrove Leaves | minecraft:mangrove_leaves | 0.2 | 0.2 | Shears/Hoe | Yes | 0 | Leaves/Sapling |
| 89 | Cherry Leaves | minecraft:cherry_leaves | 0.2 | 0.2 | Shears/Hoe | Yes | 0 | Leaves/Pink Petals |
| 90 | Azalea Leaves | minecraft:azalea_leaves | 0.2 | 0.2 | Shears/Hoe | Yes | 0 | Leaves/Azalea |
| 91 | Flowering Azalea | minecraft:flowering_azalea_leaves | 0.2 | 0.2 | Shears/Hoe | Yes | 0 | Leaves/Flowering Azalea |
| 92 | Oak Sapling | minecraft:oak_sapling | 0.0 | 0.0 | None | No | 0 | Sapling |
| 93 | Spruce Sapling | minecraft:spruce_sapling | 0.0 | 0.0 | None | No | 0 | Sapling |
| 94 | Birch Sapling | minecraft:birch_sapling | 0.0 | 0.0 | None | No | 0 | Sapling |
| 95 | Jungle Sapling | minecraft:jungle_sapling | 0.0 | 0.0 | None | No | 0 | Sapling |
| 96 | Acacia Sapling | minecraft:acacia_sapling | 0.0 | 0.0 | None | No | 0 | Sapling |
| 97 | Dark Oak Sapling | minecraft:dark_oak_sapling | 0.0 | 0.0 | None | No | 0 | Sapling |
| 98 | Grass | minecraft:grass | 0.0 | 0.0 | None | No | 0 | Wheat Seeds |
| 99 | Tall Grass | minecraft:tall_grass | 0.0 | 0.0 | None | No | 0 | Wheat Seeds |
| 100 | Fern | minecraft:fern | 0.0 | 0.0 | None | No | 0 | Nothing |
| 101 | Large Fern | minecraft:large_fern | 0.0 | 0.0 | None | No | 0 | Nothing |
| 102 | Dead Bush | minecraft:dead_bush | 0.0 | 0.0 | None | No | 0 | Stick |
| 103 | Dandelion | minecraft:dandelion | 0.0 | 0.0 | None | No | 0 | Dandelion |
| 104 | Poppy | minecraft:poppy | 0.0 | 0.0 | None | No | 0 | Poppy |
| 105 | Blue Orchid | minecraft:blue_orchid | 0.0 | 0.0 | None | No | 0 | Blue Orchid |
| 106 | Allium | minecraft:allium | 0.0 | 0.0 | None | No | 0 | Allium |
| 107 | Azure Bluet | minecraft:azure_bluet | 0.0 | 0.0 | None | No | 0 | Azure Bluet |
| 108 | Red Tulip | minecraft:red_tulip | 0.0 | 0.0 | None | No | 0 | Red Tulip |
| 109 | Orange Tulip | minecraft:orange_tulip | 0.0 | 0.0 | None | No | 0 | Orange Tulip |
| 110 | White Tulip | minecraft:white_tulip | 0.0 | 0.0 | None | No | 0 | White Tulip |
| 111 | Pink Tulip | minecraft:pink_tulip | 0.0 | 0.0 | None | No | 0 | Pink Tulip |
| 112 | Oxeye Daisy | minecraft:oxeye_daisy | 0.0 | 0.0 | None | No | 0 | Oxeye Daisy |
| 113 | Cornflower | minecraft:cornflower | 0.0 | 0.0 | None | No | 0 | Cornflower |
| 114 | Lily of the Valley | minecraft:lily_of_the_valley | 0.0 | 0.0 | None | No | 0 | Lily of the Valley |
| 115 | Wither Rose | minecraft:wither_rose | 0.0 | 0.0 | None | No | 0 | Wither Rose |
| 116 | Sunflower | minecraft:sunflower | 0.0 | 0.0 | None | No | 0 | Sunflower |
| 117 | Lilac | minecraft:lilac | 0.0 | 0.0 | None | No | 0 | Lilac |
| 118 | Rose Bush | minecraft:rose_bush | 0.0 | 0.0 | None | No | 0 | Rose Bush |
| 119 | Peony | minecraft:peony | 0.0 | 0.0 | None | No | 0 | Peony |
| 120 | Pink Petals | minecraft:pink_petals | 0.0 | 0.0 | None | No | 0 | Pink Petals |
| 121 | Spore Blossom | minecraft:spore_blossom | 0.0 | 0.0 | None | No | 0 | Spore Blossom |
| 122 | Sweet Berry Bush | minecraft:sweet_berry_bush | 0.0 | 0.0 | None | No | 0 | Sweet Berries |
| 123 | Sea Pickle | minecraft:sea_pickle | 0.0 | 0.0 | None | No | 6–15 | Sea Pickle ×1-4 |
| 124 | Kelp | minecraft:kelp | 0.0 | 0.0 | None | No | 0 | Kelp |
| 125 | Dried Kelp Block | minecraft:dried_kelp_block | 0.5 | 0.5 | Hoe | No | 0 | Dried Kelp ×9 |
| 126 | Bamboo | minecraft:bamboo | 1.0 | 1.0 | Axe/Sword | No | 0 | Bamboo |
| 127 | Cactus | minecraft:cactus | 0.4 | 0.4 | None | No | 0 | Cactus |

### 3.4 Building Blocks (ID 128–255)

| ID | Block | Namespaced ID | Hardness | Resistance | Tool | Notes |
|----|-------|---------------|----------|------------|------|-------|
| 128 | Oak Planks | minecraft:oak_planks | 2.0 | 3.0 | Axe | |
| 129 | Spruce Planks | minecraft:spruce_planks | 2.0 | 3.0 | Axe | |
| 130 | Birch Planks | minecraft:birch_planks | 2.0 | 3.0 | Axe | |
| 131 | Jungle Planks | minecraft:jungle_planks | 2.0 | 3.0 | Axe | |
| 132 | Acacia Planks | minecraft:acacia_planks | 2.0 | 3.0 | Axe | |
| 133 | Dark Oak Planks | minecraft:dark_oak_planks | 2.0 | 3.0 | Axe | |
| 134 | Mangrove Planks | minecraft:mangrove_planks | 2.0 | 3.0 | Axe | |
| 135 | Cherry Planks | minecraft:cherry_planks | 2.0 | 3.0 | Axe | |
| 136 | Crimson Planks | minecraft:crimson_planks | 2.0 | 3.0 | Axe | |
| 137 | Warped Planks | minecraft:warped_planks | 2.0 | 3.0 | Axe | |
| 138 | Oak Stairs | minecraft:oak_stairs | 2.0 | 3.0 | Axe | State: facing, half, waterlogged |
| 139 | Spruce Stairs | minecraft:spruce_stairs | 2.0 | 3.0 | Axe | |
| 140 | Stone Stairs | kingcraft:stone_stairs | 1.5 | 6.0 | Pickaxe | |
| 141 | Cobblestone Stairs | minecraft:cobblestone_stairs | 2.0 | 6.0 | Pickaxe | |
| 142 | Stone Bricks | minecraft:stone_bricks | 1.5 | 6.0 | Pickaxe | |
| 143 | Cracked Stone Bricks | minecraft:cracked_stone_bricks | 1.5 | 6.0 | Pickaxe | |
| 144 | Mossy Stone Bricks | minecraft:mossy_stone_bricks | 1.5 | 6.0 | Pickaxe | |
| 145 | Chiseled Stone Bricks | minecraft:chiseled_stone_bricks | 1.5 | 6.0 | Pickaxe | |
| 146 | Brick Block | minecraft:bricks | 2.0 | 6.0 | Pickaxe | |
| 147 | Brick Stairs | minecraft:brick_stairs | 2.0 | 6.0 | Pickaxe | |
| 148 | Stone Brick Slab | minecraft:stone_brick_slab | 2.0 | 6.0 | Pickaxe | State: type (top/bottom/double), waterlogged |
| 149 | Cobblestone Slab | minecraft:cobblestone_slab | 2.0 | 6.0 | Pickaxe | |
| 150 | Oak Slab | minecraft:oak_slab | 2.0 | 3.0 | Axe | |
| 151 | Sandstone Slab | minecraft:sandstone_slab | 2.0 | 6.0 | Pickaxe | |
| 152 | Smooth Stone | minecraft:smooth_stone | 2.0 | 6.0 | Pickaxe | |
| 153 | Smooth Sandstone | minecraft:smooth_sandstone | 2.0 | 6.0 | Pickaxe | |
| 154 | Chiseled Sandstone | minecraft:chiseled_sandstone | 0.8 | 0.8 | Pickaxe | |
| 155 | Cut Sandstone | minecraft:cut_sandstone | 0.8 | 0.8 | Pickaxe | |
| 156 | Smooth Quartz Block | minecraft:smooth_quartz | 2.0 | 6.0 | Pickaxe | |
| 157 | Chiseled Quartz Block | minecraft:chiseled_quartz | 2.0 | 6.0 | Pickaxe | |
| 158 | Quartz Pillar | minecraft:quartz_pillar | 2.0 | 6.0 | Pickaxe | State: axis |
| 159 | Quartz Bricks | minecraft:quartz_bricks | 2.0 | 6.0 | Pickaxe | |
| 160 | Stone Brick Wall | minecraft:stone_brick_wall | 2.0 | 6.0 | Pickaxe | State: up, north, south, east, west, waterlogged |
| 161 | Cobblestone Wall | minecraft:cobblestone_wall | 2.0 | 6.0 | Pickaxe | |
| 162 | Oak Fence | minecraft:oak_fence | 2.0 | 3.0 | Axe | State: north, south, east, west, waterlogged |
| 163 | Nether Brick Fence | minecraft:nether_brick_fence | 2.0 | 6.0 | Pickaxe | |
| 164 | Oak Fence Gate | minecraft:oak_fence_gate | 2.0 | 3.0 | Axe | State: facing, open, powered, in_wall |
| 165 | Oak Door | minecraft:oak_door | 3.0 | 3.0 | Axe | State: facing, half, hinge, open, powered |
| 166 | Iron Door | minecraft:iron_door | 5.0 | 5.0 | Pickaxe | Same states, redstone opens |
| 167 | Oak Trapdoor | minecraft:oak_trapdoor | 3.0 | 3.0 | Axe | State: facing, half, open, powered, waterlogged |
| 168 | Iron Trapdoor | minecraft:iron_trapdoor | 5.0 | 5.0 | Pickaxe | |
| 169 | Glass | minecraft:glass | 0.3 | 0.3 | None | 0 | 0 | 0 | Nothing |
| 170 | White Stained Glass | minecraft:white_stained_glass | 0.3 | 0.3 | None | 0 | 0 | 0 | Nothing |
| 171 | Glass Pane | minecraft:glass_pane | 0.3 | 0.3 | None | State: north, south, east, west, waterlogged |
| 172 | Iron Bars | minecraft:iron_bars | 5.0 | 6.0 | Pickaxe | Same states as pane |
| 173 | Concrete | kingcraft:concrete | 3.0 | 9.0 | Pickaxe | Available in 16 colors |
| 174 | Reinforced Concrete | kingcraft:reinforced_concrete | 10.0 | 120.0 | Pickaxe | 4 | Requires tier 5 tool |
| 175 | Concrete Stairs | kingcraft:concrete_stairs | 3.0 | 9.0 | Pickaxe | |
| 176 | Concrete Slab | kingcraft:concrete_slab | 3.0 | 9.0 | Pickaxe | |
| 177 | Sheet Metal | kingcraft:sheet_metal | 4.0 | 10.0 | Pickaxe | 2 | |
| 178 | Sheet Metal Stairs | kingcraft:sheet_metal_stairs | 4.0 | 10.0 | Pickaxe | |
| 179 | Armored Wall | kingcraft:armored_wall | 25.0 | 600.0 | Pickaxe | 6 | Requires titanium tool |
| 180 | Reinforced Glass | kingcraft:reinforced_glass | 2.0 | 10.0 | Pickaxe | 2 | Bulletproof |
| 181 | Chain Link Fence | kingcraft:chain_link_fence | 2.0 | 2.0 | Pickaxe | State: north, south, east, west |
| 182 | Mesh Floor | kingcraft:mesh_floor | 3.0 | 6.0 | Pickaxe | Walk-through floor |
| 183 | Mining Quarry | kingcraft:mining_quarry | 5.0 | 10.0 | Pickaxe | Block entity, automated mining |

### 3.5 Functional Blocks (ID 256–319)

| ID | Block | Namespaced ID | Hardness | Resistance | Tool | Block Entity | Description |
|----|-------|---------------|----------|------------|------|-------------|-------------|
| 256 | Crafting Table | minecraft:crafting_table | 2.5 | 2.5 | Axe | No | 3×3 crafting |
| 257 | Furnace | minecraft:furnace | 3.5 | 3.5 | Pickaxe | Yes | Smelting |
| 258 | Blast Furnace | minecraft:blast_furnace | 3.5 | 3.5 | Pickaxe | Yes | Ore smelting ×2 |
| 259 | Smoker | minecraft:smoker | 3.5 | 3.5 | Pickaxe | Yes | Fast cooking |
| 260 | Campfire | minecraft:campfire | 2.0 | 2.0 | Axe | Yes | Cooking, light (15 lit) |
| 261 | Soul Campfire | minecraft:soul_campfire | 2.0 | 2.0 | Axe | Yes | Blue light (10 lit) |
| 262 | Chest | minecraft:chest | 2.5 | 2.5 | Axe | Yes | 27 slots |
| 263 | Trapped Chest | minecraft:trapped_chest | 2.5 | 2.5 | Axe | Yes | Redstone output |
| 264 | Ender Chest | minecraft:ender_chest | 22.5 | 600.0 | Pickaxe | Yes | Per-player inventory |
| 265 | Barrel | minecraft:barrel | 2.5 | 2.5 | Axe | Yes | 27 slots, no chest tax |
| 266 | Shulker Box | minecraft:shulker_box | 2.0 | 2.0 | Pickaxe | Yes | 27 portable slots |
| 267 | Anvil | minecraft:anvil | 5.0 | 1200.0 | Pickaxe | Yes | Repair, rename, enchant |
| 268 | Grindstone | minecraft:grindstone | 2.0 | 6.0 | Pickaxe | No | Repair, disenchant |
| 269 | Enchanting Table | minecraft:enchanting_table | 5.0 | 1200.0 | Pickaxe | Yes | Enchant items |
| 270 | Brewing Stand | minecraft:brewing_stand | 0.5 | 0.5 | Pickaxe | Yes | Brew potions |
| 271 | Cauldron | minecraft:cauldron | 2.0 | 2.0 | Pickaxe | Yes | Water level, potions |
| 272 | Hopper | minecraft:hopper | 3.0 | 4.8 | Pickaxe | Yes | Item transport |
| 273 | Dispenser | minecraft:dispenser | 3.5 | 3.5 | Pickaxe | Yes | Eject items |
| 274 | Dropper | minecraft:dropper | 3.5 | 3.5 | Pickaxe | Yes | Drop items |
| 275 | Piston | minecraft:piston | 1.5 | 1.5 | Pickaxe | No | Push blocks |
| 276 | Sticky Piston | minecraft:sticky_piston | 1.5 | 1.5 | Pickaxe | No | Push + pull |
| 277 | Observer | minecraft:observer | 2.0 | 2.0 | Pickaxe | No | Block update detector |
| 278 | Lever | minecraft:lever | 0.5 | 0.5 | Pickaxe | No | Toggle redstone |
| 279 | Button (Stone) | minecraft:stone_button | 0.5 | 0.5 | Pickaxe | No | Momentary signal |
| 280 | Button (Wood) | minecraft:oak_button | 0.5 | 0.5 | Axe | No | Momentary |
| 281 | Pressure Plate | minecraft:stone_pressure_plate | 0.5 | 0.5 | Pickaxe | No | Entity weight |
| 282 | Weighted Plate | minecraft:light_weighted_pressure_plate | 0.5 | 0.5 | Pickaxe | No | Item count |
| 283 | Lectern | minecraft:lectern | 2.0 | 2.0 | Axe | Yes | Read books, redstone |
| 284 | Composter | minecraft:composter | 0.6 | 0.6 | Axe | Yes | Bonemeal production |
| 285 | Jukebox | minecraft:jukebox | 2.0 | 6.0 | Axe | Yes | Play music discs |
| 286 | Note Block | minecraft:note_block | 0.8 | 0.8 | Axe | No | Musical instrument |
| 287 | Daylight Detector | minecraft:daylight_detector | 0.2 | 0.2 | Pickaxe | No | Light sensor |
| 288 | Target Block | minecraft:target | 0.5 | 0.5 | Pickaxe | No | Redstone on hit |
| 289 | Honey Block | minecraft:honey_block | 0.0 | 0.0 | None | No | Slow fall, stick |
| 290 | Honeycomb Block | minecraft:honeycomb_block | 0.6 | 0.6 | Axe | No | Decoration |
| 291 | Beehive | minecraft:beehive | 0.6 | 0.6 | Axe | Yes | Bee storage |
| 292 | Bee Nest | minecraft:bee_nest | 0.6 | 0.6 | Axe | Yes | Natural bees |
| 293 | Spawner | minecraft:spawner | 5.0 | 5.0 | Pickaxe | Yes | Mob spawner |
| 294 | Beacon | minecraft:beacon | 3.0 | 3.0 | Pickaxe | Yes | Buff beam |
| 295 | Conduit | minecraft:conduit | 3.0 | 3.0 | Pickaxe | Yes | Water buff |
| 296 | Lodestone | minecraft:lodestone | 3.5 | 3.5 | Pickaxe | Yes | Compass point |
| 297 | Respawn Anchor | minecraft:respawn_anchor | 10.0 | 10.0 | Pickaxe | Yes | Set nether spawn |
| 298 | Bell | minecraft:bell | 5.0 | 5.0 | Pickaxe | Yes | Ring, raid alert |
| 299 | Lantern | minecraft:lantern | 3.5 | 3.5 | Pickaxe | No | Hanging light (15) |
| 300 | Soul Lantern | minecraft:soul_lantern | 3.5 | 3.5 | Pickaxe | No | Blue light (10) |
| 301 | Chain | minecraft:chain | 5.0 | 6.0 | Pickaxe | No | Decorative hanging |
| 302 | Campfire (KingCraft) | kingcraft:large_campfire | 2.0 | 2.0 | Axe | Yes | 4-slot cooking, light (15) |

### 3.6 Technology & Electricity Blocks (ID 320–383)

| ID | Block | Namespaced ID | Hardness | Resistance | Tool | Block Entity | Description |
|----|-------|---------------|----------|------------|------|-------------|-------------|
| 320 | Wire | kingcraft:wire | 0.1 | 0.1 | Pickaxe | No | Electrical wire |
| 321 | Heavy Wire | kingcraft:heavy_wire | 0.2 | 0.2 | Pickaxe | No | High capacity wire |
| 322 | Solar Panel | kingcraft:solar_panel | 2.0 | 3.0 | Pickaxe | Yes | +20 power (day) |
| 323 | Wind Turbine | kingcraft:wind_turbine | 3.0 | 3.0 | Pickaxe | Yes | +10-40 power |
| 324 | Generator | kingcraft:generator | 3.0 | 4.0 | Pickaxe | Yes | +50 power (fuel) |
| 325 | Battery | kingcraft:battery | 2.0 | 3.0 | Pickaxe | Yes | Stores 10,000 power |
| 326 | Small Battery | kingcraft:small_battery | 1.0 | 2.0 | Pickaxe | Yes | Stores 1,000 power |
| 327 | Switch | kingcraft:switch | 0.5 | 0.5 | Pickaxe | No | On/Off toggle |
| 328 | Button (Electric) | kingcraft:electric_button | 0.5 | 0.5 | Pickaxe | No | Momentary pulse |
| 329 | Pressure Pad | kingcraft:pressure_pad | 0.5 | 0.5 | Pickaxe | No | Entity-triggered |
| 330 | Timer | kingcraft:timer | 1.0 | 1.0 | Pickaxe | Yes | Configurable delay |
| 331 | Splitter | kingcraft:splitter | 1.0 | 1.0 | Pickaxe | No | 1-in 3-out |
| 332 | Combiner | kingcraft:combiner | 1.0 | 1.0 | Pickaxe | No | 3-in 1-out |
| 333 | Blocker | kingcraft:blocker | 1.0 | 1.0 | Pickaxe | No | Block/pass signal |
| 334 | Counter | kingcraft:counter | 1.0 | 1.0 | Pickaxe | Yes | Counts pulses |
| 335 | AND Gate | kingcraft:and_gate | 1.0 | 1.0 | Pickaxe | No | Logic AND |
| 336 | OR Gate | kingcraft:or_gate | 1.0 | 1.0 | Pickaxe | No | Logic OR |
| 337 | XOR Gate | kingcraft:xor_gate | 1.0 | 1.0 | Pickaxe | No | Logic XOR |
| 338 | Memory Cell | kingcraft:memory_cell | 1.0 | 1.0 | Pickaxe | Yes | RS NOR latch |
| 339 | Lamp | kingcraft:lamp | 0.3 | 0.3 | Pickaxe | No | Light (15, when powered) |
| 340 | Ceiling Light | kingcraft:ceiling_light | 0.3 | 0.3 | Pickaxe | No | Area light (15) |
| 341 | Door Controller | kingcraft:door_controller | 2.0 | 3.0 | Pickaxe | No | Electric door opener |
| 342 | Auto Turret | kingcraft:auto_turret | 5.0 | 10.0 | Pickaxe | Yes | Smart targeting |
| 343 | Shotgun Turret | kingcraft:shotgun_turret | 5.0 | 10.0 | Pickaxe | Yes | Close range |
| 344 | Rocket Turret | kingcraft:rocket_turret | 5.0 | 10.0 | Pickaxe | Yes | Explosive |
| 345 | Radar | kingcraft:radar | 2.0 | 3.0 | Pickaxe | Yes | Entity detection |
| 346 | Siren | kingcraft:siren | 1.0 | 2.0 | Pickaxe | Yes | Audible alarm |
| 347 | Pump | kingcraft:pump | 2.0 | 3.0 | Pickaxe | Yes | Fluid transport |
| 348 | Conveyor Belt | kingcraft:conveyor_belt | 1.0 | 2.0 | Pickaxe | Yes | Item transport |
| 349 | Industrial Furnace | kingcraft:industrial_furnace | 5.0 | 10.0 | Pickaxe | Yes | 6-slot smelting |
| 350 | Recycler | kingcraft:recycler | 3.0 | 5.0 | Pickaxe | Yes | Recycle items to scrap |
| 351 | Repair Bench | kingcraft:repair_bench | 3.0 | 5.0 | Pickaxe | Yes | Repair items |
| 352 | Workbench (Tech) | kingcraft:tech_workbench | 3.0 | 4.0 | Pickaxe | Yes | Advanced crafting |
| 353 | Chemistry Station | kingcraft:chemistry_station | 3.0 | 4.0 | Pickaxe | Yes | 4×4 grid |
| 354 | Computer | kingcraft:computer | 2.0 | 3.0 | Pickaxe | Yes | Lua scripting |
| 355 | Charging Station | kingcraft:charging_station | 2.0 | 3.0 | Pickaxe | Yes | Recharge batteries |
| 356 | Mining Drill | kingcraft:mining_drill | 5.0 | 10.0 | Pickaxe | Yes | Auto-mining |
| 357 | Quarry | kingcraft:quarry | 10.0 | 15.0 | Pickaxe | Yes | Large-scale mining |
| 358 | Refinery | kingcraft:refinery | 5.0 | 10.0 | Pickaxe | Yes | Oil processing |
| 359 | Research Table | kingcraft:research_table | 3.0 | 4.0 | Pickaxe | Yes | Blueprint research |
| 360 | Vault | kingcraft:vault | 25.0 | 600.0 | Pickaxe | Yes | Clan storage (54 slots) |
| 361 | Safe | kingcraft:safe | 10.0 | 120.0 | Pickaxe | Yes | Personal storage |
| 362 | Locker | kingcraft:locker | 3.0 | 5.0 | Pickaxe | Yes | Quick respawn gear |
| 363 | Drop Box | kingcraft:drop_box | 3.0 | 5.0 | Pickaxe | Yes | Anonymous transfer |

### 3.7 Fluid Blocks (ID 384–391)

| ID | Block | Namespaced ID | Hardness | Resistance | Luminance | Viscosity | Drops |
|----|-------|---------------|----------|------------|-----------|-----------|-------|
| 384 | Water | minecraft:water | 100.0 | 100.0 | 1 (flowing)/0 | 1000 | Nothing (bucket) |
| 385 | Flowing Water | minecraft:flowing_water | 100.0 | 100.0 | 0 | 1000 | Nothing |
| 386 | Lava | minecraft:lava | 100.0 | 100.0 | 15 | 4000 | Nothing (bucket) |
| 387 | Flowing Lava | minecraft:flowing_lava | 100.0 | 100.0 | 15 | 4000 | Nothing |
| 388 | Oil | kingcraft:oil | 100.0 | 100.0 | 0 | 2000 | Nothing (bucket) |
| 389 | Flowing Oil | kingcraft:flowing_oil | 100.0 | 100.0 | 0 | 2000 | Nothing |
| 390 | Acid | kingcraft:acid | 100.0 | 100.0 | 0 | 800 | Nothing (bucket) |
| 391 | Flowing Acid | kingcraft:flowing_acid | 100.0 | 100.0 | 1 | 800 | Nothing |

### 3.8 Decorative & Misc Blocks (ID 392–511)

| ID | Block | Namespaced ID | Hardness | Resistance | Tool | Description |
|----|-------|---------------|----------|------------|------|-------------|
| 392 | Torch | minecraft:torch | 0.0 | 0.0 | None | Light (14) |
| 393 | Soul Torch | minecraft:soul_torch | 0.0 | 0.0 | None | Blue light (10) |
| 394 | Redstone Torch | minecraft:redstone_torch | 0.0 | 0.0 | None | Redstone source |
| 395 | End Rod | minecraft:end_rod | 0.0 | 0.0 | None | Light (11), decor |
| 396 | Candle | minecraft:candle | 0.1 | 0.1 | None | Light (3-12 per count) |
| 397 | Chandelier | kingcraft:chandelier | 0.5 | 0.5 | Pickaxe | Light (15), hanging |
| 398 | Bookshelf | minecraft:bookshelf | 1.5 | 1.5 | Axe | Enchanting + decor |
| 399 | Ladder | minecraft:ladder | 0.4 | 0.4 | Axe | Climbable |
| 400 | Scaffolding | minecraft:scaffolding | 1.0 | 1.0 | Axe | Temporary platform |
| 401 | Painting | minecraft:painting | 0.0 | 0.0 | None | Entity, decor |
| 402 | Item Frame | minecraft:item_frame | 0.0 | 0.0 | None | Entity, display item |
| 403 | Glow Item Frame | minecraft:glow_item_frame | 0.0 | 0.0 | None | Glowing display |
| 404 | Armor Stand | minecraft:armor_stand | 0.0 | 0.0 | None | Entity, display armor |
| 405 | Flower Pot | minecraft:flower_pot | 0.0 | 0.0 | Pickaxe | Plant display |
| 406 | Skull | minecraft:skeleton_skull | 1.0 | 1.0 | Pickaxe | 5 variants |
| 407 | Banner | minecraft:white_banner | 1.0 | 1.0 | Axe | 16 colors, patterns |
| 408 | Shield | minecraft:shield | 5.0 | 5.0 | Axe | Entity (wall mount) |
| 409 | Carved Pumpkin | minecraft:carved_pumpkin | 1.0 | 1.0 | Axe | Wearable, golem |
| 410 | Jack o'Lantern | minecraft:jack_o_lantern | 1.0 | 1.0 | Axe | Light (15) |
| 411 | Hay Bale | minecraft:hay_block | 0.5 | 0.5 | Hoe | Fall damage reduce |
| 412 | Target | minecraft:target | 0.5 | 0.5 | Pickaxe | Redstone signal on hit |
| 413 | Slime Block | minecraft:slime_block | 0.0 | 0.0 | None | Bounce, sticky |
| 414 | Honey Block | minecraft:honey_block | 0.0 | 0.0 | None | Slow fall, sticky |
| 415 | Sponge | minecraft:sponge | 0.6 | 0.6 | Hoe | Water absorb |
| 416 | Wet Sponge | minecraft:wet_sponge | 0.6 | 0.6 | Hoe | Drip water |
| 417 | Amethyst Block | minecraft:amethyst_block | 1.5 | 1.5 | Pickaxe | Decor |
| 418 | Budding Amethyst | minecraft:budding_amethyst | 1.5 | 1.5 | Pickaxe | Grow crystals |
| 419 | Amethyst Cluster | minecraft:amethyst_cluster | 1.5 | 1.5 | Pickaxe | Light (5) |
| 420 | Tinted Glass | minecraft:tinted_glass | 0.3 | 0.3 | None | Blocks light |
| 421 | Mud Bricks | minecraft:mud_bricks | 1.5 | 3.0 | Pickaxe | Decor |
| 422 | Packed Mud | minecraft:packed_mud | 1.0 | 1.0 | Pickaxe | Decor |
| 423 | Decorated Pot | minecraft:decorated_pot | 0.0 | 0.0 | Pickaxe | Block entity, sherds |
| 424 | Calibrated Sculk Sensor | minecraft:calibrated_sculk_sensor | 1.5 | 3.0 | Hoe | Redstone frequency |
| 425 | Sculk | minecraft:sculk | 0.2 | 0.2 | Hoe | XP storage |
| 426 | Sculk Vein | minecraft:sculk_vein | 0.2 | 0.2 | Hoe | Spreads |
| 427 | Sculk Catalyst | minecraft:sculk_catalyst | 0.2 | 0.2 | Hoe | Spreads sculk |
| 428 | Sculk Shrieker | minecraft:sculk_shrieker | 1.5 | 3.0 | Hoe | Summons Warden |
| 429 | Sculk Sensor | minecraft:sculk_sensor | 1.5 | 3.0 | Hoe | Vibration detection |
| 430 | Reinforced Deepslate | minecraft:reinforced_deepslate | 55.0 | 1200.0 | Pickaxe | 4 | Warden room |
| 431 | TNT | minecraft:tnt | 0.0 | 0.0 | None | Explosive (4/15/4) |
| 432 | C4 | kingcraft:c4 | 0.0 | 0.0 | None | Placeable explosive |

### 3.9 Reserved IDs (512–1023)

| Range | Purpose |
|-------|---------|
| 512–767 | Modded blocks (Content Packs) |
| 768–1023 | Dynamic blocks (script registration) |

---

## 4. Block State Definitions

Block states define variant data for each block. Format inspired by Minecraft's blockstate JSON but unified:

### 4.1 Common Block States

```json
{
  "kingcraft:oak_stairs": {
    "states": [
      { "name": "facing",    "type": "enum", "values": ["north","south","east","west"],           "default": "north" },
      { "name": "half",      "type": "enum", "values": ["top","bottom"],                          "default": "bottom" },
      { "name": "shape",     "type": "enum", "values": ["straight","inner_left","inner_right","outer_left","outer_right"], "default": "straight" },
      { "name": "waterlogged", "type": "bool",                                                   "default": false }
    ],
    "state_count": 4,
    "state_combinations": 4 × 2 × 5 × 2 = 80
  }
}
```

### 4.2 Block State Index Calculation

```
For blocks with states, the block state is packed into uint16:

state_index = 0
for each state in block.states (in order):
    state_index = state_index × state.cardinality + state.current_value
    
Example: Wooden Stairs
  facing=SOUTH(1), half=TOP(1), shape=OUTER_LEFT(3), waterlogged=false(0)
  state_index = (((0×4+1)×2+1)×5+3)×2+0 = 66
```

### 4.3 State Definitions by Block Type

**SLABS:**
```
type:         enum ["top", "bottom", "double"]  (default: bottom)
waterlogged:  bool                               (default: false)
```

**STAIRS:**
```
facing:       enum ["north","south","east","west"]  (default: north)
half:         enum ["top","bottom"]                  (default: bottom)
shape:        enum ["straight","inner_left","inner_right","outer_left","outer_right"] (default: straight)
waterlogged:  bool                                   (default: false)
```

**FENCES:**
```
north:        bool (default: false)
south:        bool (default: false)
east:         bool (default: false)
west:         bool (default: false)
waterlogged:  bool (default: false)
```

**DOORS:**
```
facing:       enum ["north","south","east","west"]  (default: north)
half:         enum ["upper","lower"]                 (default: lower)
hinge:        enum ["left","right"]                  (default: left)
open:         bool                                   (default: false)
powered:      bool                                   (default: false)
```

**FARMLAND:**
```
moisture:     int (0–7)    (default: 0)
```

**CROPS:**
```
age:          int (0–7)    (default: 0)
```

**REDSTONE WIRE:**
```
north:        enum ["up","side","none"]  (default: none)
south:        enum ["up","side","none"]  (default: none)
east:         enum ["up","side","none"]  (default: none)
west:         enum ["up","side","none"]  (default: none)
power:        int (0–15)                 (default: 0)
```

**ELECTRIC WIRE:**
```
connection:   int (0–15)  bitmask of connected directions
power:        int (0–180) voltage
```

**FURNACE:**
```
facing:       enum ["north","south","east","west"]  (default: north)
lit:          bool                                   (default: false)
```

**CHEST:**
```
facing:       enum ["north","south","east","west"]  (default: north)
type:         enum ["single","left","right"]          (default: single)
waterlogged:  bool                                   (default: false)
```

---

## 5. Block Tags

```json
{
  "blocks/mineable/pickaxe": [
    "minecraft:stone", "minecraft:cobblestone", "minecraft:iron_ore",
    "minecraft:gold_ore", "minecraft:diamond_ore", "minecraft:obsidian",
    "kingcraft:silver_ore", "kingcraft:titanium_ore", "minecraft:furnace",
    "minecraft:chest", "kingcraft:reinforced_concrete", "kingcraft:vault"
  ],
  "blocks/mineable/axe": [
    "minecraft:oak_log", "minecraft:oak_planks", "minecraft:oak_stairs",
    "minecraft:oak_fence", "minecraft:oak_door", "minecraft:crafting_table",
    "minecraft:barrel", "minecraft:lectern", "minecraft:beehive"
  ],
  "blocks/mineable/shovel": [
    "minecraft:dirt", "minecraft:grass_block", "minecraft:sand",
    "minecraft:gravel", "minecraft:clay", "minecraft:snow_block",
    "minecraft:soul_sand", "minecraft:mud"
  ],
  "blocks/mineable/hoe": [
    "minecraft:oak_leaves", "minecraft:spruce_leaves", "minecraft:nether_wart_block",
    "minecraft:hay_block", "minecraft:dried_kelp_block", "minecraft:sculk",
    "minecraft:moss_block"
  ],
  "blocks/needs_stone_tool": [
    "minecraft:iron_ore", "minecraft:copper_ore", "minecraft:lapis_ore",
    "minecraft:redstone_ore", "kingcraft:silver_ore", "kingcraft:tin_ore"
  ],
  "blocks/needs_iron_tool": [
    "minecraft:diamond_ore", "minecraft:gold_ore", "minecraft:emerald_ore",
    "kingcraft:uranium_ore", "kingcraft:titanium_ore"
  ],
  "blocks/needs_diamond_tool": [
    "minecraft:obsidian", "minecraft:ancient_debris",
    "minecraft:crying_obsidian", "kingcraft:armored_wall"
  ],
  "blocks/needs_titanium_tool": [
    "kingcraft:armored_wall", "kingcraft:vault"
  ],
  "blocks/dirt_like": [
    "minecraft:dirt", "minecraft:grass_block", "minecraft:podzol",
    "minecraft:coarse_dirt", "minecraft:rooted_dirt", "minecraft:mud",
    "minecraft:mycelium"
  ],
  "blocks/logs": [
    "minecraft:oak_log", "minecraft:spruce_log", "minecraft:birch_log",
    "minecraft:jungle_log", "minecraft:acacia_log", "minecraft:dark_oak_log",
    "minecraft:mangrove_log", "minecraft:cherry_log",
    "minecraft:crimson_stem", "minecraft:warped_stem"
  ],
  "blocks/planks": [
    "minecraft:oak_planks", "minecraft:spruce_planks", "minecraft:birch_planks",
    "minecraft:jungle_planks", "minecraft:acacia_planks", "minecraft:dark_oak_planks",
    "minecraft:mangrove_planks", "minecraft:cherry_planks",
    "minecraft:crimson_planks", "minecraft:warped_planks"
  ],
  "blocks/leaves": [
    "minecraft:oak_leaves", "minecraft:spruce_leaves", "minecraft:birch_leaves",
    "minecraft:jungle_leaves", "minecraft:acacia_leaves", "minecraft:dark_oak_leaves",
    "minecraft:mangrove_leaves", "minecraft:cherry_leaves",
    "minecraft:azalea_leaves", "minecraft:flowering_azalea_leaves"
  ],
  "blocks/saplings": [
    "minecraft:oak_sapling", "minecraft:spruce_sapling", "minecraft:birch_sapling",
    "minecraft:jungle_sapling", "minecraft:acacia_sapling", "minecraft:dark_oak_sapling",
    "minecraft:cherry_sapling"
  ],
  "blocks/flowers": [
    "minecraft:dandelion", "minecraft:poppy", "minecraft:blue_orchid",
    "minecraft:allium", "minecraft:azure_bluet",
    "minecraft:red_tulip", "minecraft:orange_tulip", "minecraft:white_tulip",
    "minecraft:pink_tulip", "minecraft:oxeye_daisy", "minecraft:cornflower",
    "minecraft:lily_of_the_valley", "minecraft:wither_rose"
  ],
  "blocks/needs_water": [
    "minecraft:farmland", "minecraft:kelp", "minecraft:sea_pickle",
    "minecraft:coral", "minecraft:coral_fan", "minecraft:coral_block"
  ],
  "blocks/electrical": [
    "kingcraft:wire", "kingcraft:heavy_wire", "kingcraft:solar_panel",
    "kingcraft:wind_turbine", "kingcraft:generator", "kingcraft:battery",
    "kingcraft:small_battery", "kingcraft:switch", "kingcraft:auto_turret",
    "kingcraft:radar", "kingcraft:siren", "kingcraft:computer"
  ],
  "blocks/raiding_targets": [
    "minecraft:chest", "minecraft:barrel", "kingcraft:vault",
    "kingcraft:safe", "kingcraft:locker", "minecraft:shulker_box",
    "minecraft:furnace", "minecraft:blast_furnace", "minecraft:smoker",
    "kingcraft:generator", "kingcraft:battery"
  ],
  "blocks/tool_cupboard_blocks": [
    "kingcraft:tool_cupboard", "kingcraft:reinforced_concrete",
    "kingcraft:armored_wall", "kingcraft:vault",
    "minecraft:obsidian", "kingcraft:reinforced_glass"
  ]
}
```

---

## 6. Block Loot Tables

```json
{
  "type": "block",
  "blocks": ["minecraft:coal_ore", "minecraft:deepslate_coal_ore"],
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "item",
          "item": "minecraft:coal",
          "count": {
            "min": 1,
            "max": 1
          },
          "functions": [
            {
              "function": "fortune_multiplier",
              "fortune_formula": {
                "type": "ore",
                "max_extra": 4
              }
            }
          ]
        }
      ],
      "conditions": [
        {
          "condition": "match_tool",
          "predicate": {
            "tool_type": "pickaxe",
            "min_tier": 0
          }
        }
      ]
    },
    {
      "rolls": 1,
      "entries": [
        {
          "type": "item",
          "item": "minecraft:cobblestone",
          "count": 1
        }
      ],
      "conditions": [
        {
          "condition": "match_tool",
          "predicate": {
            "tool_type": "none"
          }
        }
      ]
    }
  ]
}
```

---

## 7. Block Sounds

```json
{
  "minecraft:stone": {
    "break": "block.stone.break",
    "step": "block.stone.step",
    "place": "block.stone.place",
    "hit": "block.stone.hit",
    "fall": "block.stone.fall"
  },
  "minecraft:wood": {
    "break": "block.wood.break",
    "step": "block.wood.step",
    "place": "block.wood.place",
    "hit": "block.wood.hit",
    "fall": "block.wood.fall"
  },
  "minecraft:metal": {
    "break": "block.metal.break",
    "step": "block.metal.step",
    "place": "block.metal.place",
    "hit": "block.metal.hit",
    "fall": "block.metal.fall"
  },
  "minecraft:glass": {
    "break": "block.glass.break",
    "step": "block.glass.step",
    "place": "block.glass.place",
    "hit": "block.glass.hit",
    "fall": "block.glass.fall"
  },
  "minecraft:grass": {
    "break": "block.grass.break",
    "step": "block.grass.step",
    "place": "block.grass.place",
    "hit": "block.grass.hit",
    "fall": "block.grass.fall"
  }
}
```

---

## 8. Full JSON Examples

### Example 1: Ore Block

```json
{
  "block_id": "kingcraft:titanium_ore",
  "numeric_id": 65,
  "hardness": 8.0,
  "resistance": 8.0,
  "material": "stone",
  "tool_type": "pickaxe",
  "min_tier": 3,
  "requires_tool": true,
  "luminance": 0,
  "opacity": 15,
  "is_cube": true,
  "collision_shape": "full_block",
  "occludes": true,
  "flammable": false,
  "drops": {
    "item": "kingcraft:raw_titanium",
    "min_count": 1,
    "max_count": 1
  },
  "xp_drop": {
    "min": 2,
    "max": 6
  },
  "sound_type": "stone",
  "push_reaction": "normal",
  "map_color": "#4A6B8C",
  "states": [],
  "variants": {
    "model": "kingcraft:block/titanium_ore"
  }
}
```

### Example 2: Door Block

```json
{
  "block_id": "minecraft:oak_door",
  "numeric_id": 165,
  "hardness": 3.0,
  "resistance": 3.0,
  "material": "wood",
  "tool_type": "axe",
  "min_tier": 0,
  "requires_tool": false,
  "luminance": 0,
  "opacity": 0,
  "is_cube": false,
  "collision_shape": "custom",
  "occludes": false,
  "flammable": true,
  "fire_spread_speed": 5,
  "fire_burn_rate": 20,
  "drops": {
    "item": "minecraft:oak_door",
    "min_count": 1,
    "max_count": 1
  },
  "xp_drop": null,
  "sound_type": "wood",
  "push_reaction": "destroy",
  "map_color": "#8B6B3E",
  "states": [
    { "name": "facing",  "type": "enum", "values": ["north","south","east","west"], "default": "north" },
    { "name": "half",    "type": "enum", "values": ["lower","upper"],               "default": "lower" },
    { "name": "hinge",   "type": "enum", "values": ["left","right"],                "default": "left" },
    { "name": "open",    "type": "bool",                                           "default": false },
    { "name": "powered", "type": "bool",                                           "default": false }
  ],
  "variants": {
    "model": "minecraft:block/oak_door"
  }
}
```

### Example 3: Electric Turret (with block entity)

```json
{
  "block_id": "kingcraft:auto_turret",
  "numeric_id": 342,
  "hardness": 5.0,
  "resistance": 10.0,
  "material": "metal",
  "tool_type": "pickaxe",
  "min_tier": 2,
  "requires_tool": true,
  "luminance": 2,
  "opacity": 0,
  "is_cube": false,
  "collision_shape": "custom",
  "occludes": false,
  "flammable": false,
  "drops": {
    "item": "kingcraft:auto_turret",
    "min_count": 1,
    "max_count": 1
  },
  "xp_drop": null,
  "sound_type": "metal",
  "push_reaction": "block",
  "map_color": "#4A4A4A",
  "block_entity": true,
  "block_entity_type": "kingcraft:turret",
  "states": [
    { "name": "facing",  "type": "enum", "values": ["north","south","east","west","up","down"], "default": "north" },
    { "name": "powered", "type": "bool",                                                         "default": false },
    { "name": "active",  "type": "bool",                                                         "default": false }
  ],
  "variants": {
    "model": "kingcraft:block/auto_turret"
  }
}
```

---

*End of Block System Document*

Next: [Item System →](./04-ITEMS.md)
