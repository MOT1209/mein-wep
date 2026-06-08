# Entity System — Complete Registry

---

## 1. Entity Types

### 1.1 Mob Entities (Passive)

| ID | Entity | Health | Speed | Spawn Weight | Drops |
|----|--------|--------|-------|-------------|-------|
| 1 | Cow | 10 | 0.15 | 8 | Beef, Leather |
| 2 | Pig | 10 | 0.15 | 10 | Porkchop |
| 3 | Chicken | 4 | 0.15 | 10 | Chicken, Feather, Egg |
| 4 | Sheep | 8 | 0.15 | 8 | Mutton, Wool |
| 5 | Rabbit | 3 | 0.25 | 5 | Rabbit, Rabbit Hide |
| 6 | Deer | 15 | 0.20 | 5 | Venison, Leather |
| 7 | Fox | 10 | 0.30 | 4 | Fox Fur |
| 8 | Wolf | 8 | 0.25 | 4 | — (tameable) |
| 9 | Cat | 10 | 0.30 | 3 | — (tameable) |
| 10 | Horse | 15–30 | 0.15–0.40 | 3 | Leather (tameable) |
| 11 | Donkey | 15 | 0.15 | 2 | Leather (tameable, chest) |
| 12 | Goat | 10 | 0.20 | 4 | Goat Horn, Mutton |
| 13 | Bee | 10 | 0.30 | 3 | Honey, Honeycomb |
| 14 | Squid | 10 | 0.15 | 4 | Ink Sac |
| 15 | Dolphin | 10 | 0.30 | 1 | — |
| 16 | Fish (Cod) | 3 | — | 10 | Raw Cod |
| 17 | Fish (Salmon) | 3 | — | 8 | Raw Salmon |
| 18 | Fish (Tropical) | 3 | — | 5 | Tropical Fish |
| 19 | Fish (Puffer) | 3 | — | 2 | Pufferfish |
| 20 | Turtle | 10 | 0.10 | 2 | Scute |
| 21 | Armadillo | 12 | 0.12 | 3 | Armadillo Scute |
| 22 | Butterfly | 2 | 0.40 | 5 | — |
| 23 | Ostrich | 12 | 0.35 | 3 | Feather, Meat |
| 24 | Bear | 30 | 0.20 | 2 | Bear Fur, Meat (aggressive) |
| 25 | Moose | 25 | 0.18 | 2 | Moose Meat, Leather |

### 1.2 Mob Entities (Hostile)

| ID | Entity | Health | Damage | Speed | XP | Spawn Conditions |
|----|--------|--------|--------|-------|-----|-----------------|
| 30 | Zombie | 20 | 3 | 0.23 | 5 | Light 0, all biomes |
| 31 | Husk | 20 | 3 | 0.23 | 5 | Light 0, desert |
| 32 | Drowned | 20 | 3 | 0.23 | 5 | Light 0, ocean/river |
| 33 | Skeleton | 20 | 2 (range) | 0.25 | 5 | Light 0, all biomes |
| 34 | Stray | 20 | 2 (range) | 0.25 | 5 | Light 0, frozen |
| 35 | Creeper | 20 | 43 (expl.) | 0.20 | 5 | Light 0, all biomes |
| 36 | Spider | 16 | 2 | 0.30 | 5 | Light 0, all biomes |
| 37 | Cave Spider | 12 | 2 (poison) | 0.30 | 5 | Light 0, caves |
| 38 | Witch | 26 | 3 (magic) | 0.26 | 5 | Light 0, swamps |
| 39 | Enderman | 40 | 7 | 0.30 | 5 | Light 0, all biomes |
| 40 | Phantom | 20 | 2 | 0.20 | 5 | Night sky, sleepless |
| 41 | Slime (small) | 1 | 0 | 0.30 | 1 | Light 0, swamp |
| 42 | Slime (medium) | 4 | 2 | 0.30 | 2 | Light 0, swamp |
| 43 | Slime (large) | 16 | 4 | 0.30 | 4 | Light 0, swamp |
| 44 | Magma Cube | 16 | 6 | 0.30 | 4 | Nether |
| 45 | Blaze | 20 | 5 (fire) | 0.25 | 10 | Nether fortress |
| 46 | Ghast | 10 | 6 (fireball) | 0.15 | 5 | Nether |
| 47 | Hoglin | 40 | 6 | 0.30 | 5 | Crimson forest |
| 48 | Zoglin | 40 | 6 | 0.30 | 5 | Crimson forest (zombified) |
| 49 | Piglin | 16 | 5 | 0.25 | 5 | Nether (neutral → hostile) |
| 50 | Piglin Brute | 50 | 7 | 0.25 | 20 | Bastion remnant |
| 51 | Wither Skeleton | 20 | 4 (wither) | 0.25 | 5 | Nether fortress |
| 52 | Silverfish | 8 | 1 | 0.25 | 5 | Infested blocks |
| 53 | Vex | 14 | 5 | 0.35 | 3 | Evoker summon |
| 54 | Vindicator | 24 | 7 | 0.25 | 5 | Woodland mansion |
| 55 | Evoker | 24 | 5 (magic) | 0.25 | 10 | Woodland mansion |
| 56 | Ravager | 100 | 12 | 0.35 | 20 | Raid |
| 57 | Pillager | 24 | 4 (range) | 0.25 | 5 | Patrol/outpost |
| 58 | Warden | 250 | 15 | 0.25 | 20 | Deep dark |
| 59 | Wolf (wild) | 8 | 2 | 0.25 | 3 | Forest/taiga |
| 60 | Polar Bear | 30 | 6 | 0.20 | 3 | Frozen (aggressive if cub) |

### 1.3 Boss Entities

| ID | Entity | Health | Damage | Phase Count | Special Mechanics | Loot Tier |
|----|--------|--------|--------|-------------|-------------------|-----------|
| 70 | Ender Dragon | 200 | 6–15 | 2 | Perch, healing crystals, ender acid | Legendary |
| 71 | Wither | 300 | 5–12 | 3 | Dash attack, wither skulls, wither effect | Legendary |
| 72 | Elder Guardian | 80 | 8 | 1 | Mining fatigue, laser, spikes | Epic |
| 73 | Raid Captain | 40 | 6 | 1 | Leads raid waves, banner drop | Epic |
| 74 | Titan (Golem) | 500 | 20 | 4 | Ground slam, laser, meteor, rage mode | Mythic |
| 75 | Void Leviathan | 1000 | 25 | 5 | Void beams, tentacle slam, singularity | Mythic |
| 76 | Ice Queen | 200 | 12 | 3 | Ice spikes, freeze ray, blizzard | Legendary |
| 77 | Fire Elemental | 150 | 15 | 3 | Fire storm, meteor shower, eruptions | Legendary |
| 78 | Crystal Golem | 250 | 18 | 3 | Crystal shards, reflect, heal from crystals | Epic |

### 1.4 NPC Entities

| ID | Entity | Profession | Trades | Special |
|----|--------|-----------|--------|---------|
| 80 | Villager (Plains) | Varies | 5–10 | Level up by trading |
| 81 | Villager (Desert) | Varies | 5–10 | |
| 82 | Villager (Savanna) | Varies | 5–10 | |
| 83 | Villager (Snow) | Varies | 5–10 | |
| 84 | Villager (Swamp) | Varies | 5–10 | |
| 85 | Villager (Taiga) | Varies | 5–10 | |
| 86 | Villager (Jungle) | Varies | 5–10 | |
| 87 | Wandering Trader | — | 6 | Random trades, despawns |
| 88 | Blacksmith | Weapons/Armor | 5 | Repair, gear |
| 89 | Merchant | All | 10 | General store |
| 90 | Guard | — | 0 | Protects area |
| 91 | Innkeeper | Food/Rooms | 5 | Rest, food |
| 92 | Quest Giver | — | 0 | Gives quests |
| 93 | Healer | Potions | 5 | Heals, cures |
| 94 | Trader (Outpost) | Scrap | 8 | Buys/sells scrap |

### 1.5 Vehicle Entities

| ID | Entity | Health | Max Speed | Seats | Storage |
|----|--------|--------|-----------|-------|---------|
| 100 | Horse (mount) | 15–30 | 14 | 1 | Saddle |
| 101 | Boat | 20 | 8 | 2 | 0 |
| 102 | Raft | 15 | 6 | 4 | Small |
| 103 | Small Car | 200 | 20 | 2 | 18 slots |
| 104 | Truck | 500 | 14 | 4 | 36 slots |
| 105 | ATV | 150 | 18 | 2 | 6 slots |
| 106 | Helicopter | 300 | 25 | 4 | 18 slots |
| 107 | Motorboat | 100 | 20 | 2 | 9 slots |
| 108 | Submarine | 150 | 8 | 2 | 18 slots |
| 109 | Train Cart | 1000 | 30 | 8 | 27 slots |
| 110 | Hot Air Balloon | 50 | 4 | 4 | 9 slots |
| 111 | Mini-copter | 100 | 14 | 1 | 3 slots |
| 112 | Dune Buggy | 80 | 22 | 2 | 9 slots |
| 113 | Snowmobile | 100 | 20 | 2 | 9 slots |

### 1.6 Projectile Entities

| ID | Entity | Damage | Speed | Gravity | Lifetime | Pierces |
|----|--------|--------|-------|---------|----------|---------|
| 120 | Arrow | 2–10 | 3.0 | Yes | 60s | 0 |
| 121 | Spectral Arrow | 2–10 | 3.0 | Yes | 60s | 0 |
| 122 | Tipped Arrow | 2–10 | 3.0 | Yes | 60s | 0 |
| 123 | Trident | 8 | 2.5 | Yes | 60s | 0 |
| 124 | Fireball (Ghast) | 6 | 1.0 | Partial | 30s | 0 |
| 125 | Fire Charge | 5 | 1.5 | Yes | 10s | 0 |
| 126 | Bullet (Pistol) | 8 | 8.0 | Slight | 5s | 1 |
| 127 | Bullet (Rifle) | 25 | 15.0 | Slight | 8s | 2 |
| 128 | Bullet (SMG) | 6 | 8.0 | Slight | 4s | 0 |
| 129 | Shell (Shotgun) | 5×8 | 6.0 | High | 3s | 0 |
| 130 | Rocket | 100 | 3.0 | Yes | 10s | 0 (explodes) |
| 131 | Grenade | 80 | 0.6 (throw) | Yes | 5s fuse | 0 (explodes) |
| 132 | Ender Pearl | 0 | 1.5 | Yes | — | 0 (teleports) |
| 133 | Snowball | 0 | 1.5 | Yes | — | 0 |
| 134 | Egg | 0 | 1.5 | Yes | — | 0 (chance chicken) |
| 135 | Experience Bottle | 0 | 0.5 | Yes | — | 0 (splash XP) |
| 136 | Potion (Splash) | 0 | 0.5 | Yes | — | 0 (splash effect) |
| 137 | Potion (Lingering) | 0 | 0.5 | Yes | — | 0 (area effect) |

---

## 2. Entity JSON Schema

```json
{
  "entity_id": "kingcraft:zombie",
  "type": "hostile",
  "category": "monster",
  "dimension": "overworld",
  "health": {
    "base": 20.0,
    "difficulty_mult": 1.5
  },
  "attributes": {
    "movement_speed": 0.23,
    "attack_damage": 3.0,
    "attack_speed": 1.0,
    "armor": 2.0,
    "armor_toughness": 0.0,
    "knockback_resistance": 0.0,
    "follow_range": 35.0,
    "step_height": 0.6
  },
  "eye_height": 1.74,
  "width": 0.6,
  "height": 1.95,
  "experience": {
    "min": 5,
    "max": 5
  },
  "equipment": {
    "hand_drop_chance": 0.085,
    "armor_drop_chance": 0.085,
    "mainhand": [
      { "item": "minecraft:iron_sword", "weight": 1 },
      { "item": "minecraft:stone_sword", "weight": 3 },
      { "item": "minecraft:air", "weight": 6 }
    ]
  },
  "drops": [
    {
      "item": "minecraft:rotten_flesh",
      "min_count": 0,
      "max_count": 2,
      "chance": 0.5
    },
    {
      "item": "minecraft:iron_ingot",
      "min_count": 1,
      "max_count": 1,
      "chance": 0.01
    },
    {
      "item": "minecraft:carrot",
      "min_count": 1,
      "max_count": 1,
      "chance": 0.01
    },
    {
      "item": "minecraft:potato",
      "min_count": 1,
      "max_count": 1,
      "chance": 0.01
    }
  ],
  "spawn": {
    "conditions": {
      "light_level": { "min": 0, "max": 0 },
      "min_height": 0,
      "max_height": 320,
      "biomes": "#overworld_except_mushroom",
      "block_whitelist": ["#dirt_like", "stone", "smooth_stone"]
    },
    "weight": 100,
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
    "targets": ["player", "villager", "iron_golem"],
    "sun_burn": true,
    "can_break_doors": true,
    "doors_to_break": ["#wooden_doors"]
  },
  "sounds": {
    "ambient": "entity.zombie.ambient",
    "hurt": "entity.zombie.hurt",
    "death": "entity.zombie.death",
    "step": "entity.zombie.step"
  }
}
```

---

## 3. Block Entity Definitions

| Block Entity | ID | Data Stored | Sync Method |
|-------------|-----|-------------|-------------|
| Chest | chest | Inventory (27 slots), CustomName, Lock | On change |
| Barrel | barrel | Inventory (27 slots), CustomName | On change |
| Shulker Box | shulker_box | Inventory (27 slots), Color | On change |
| Furnace | furnace | Inventory (3 slots), BurnTime, CookTime, FuelTime | Per tick (progress) |
| Blast Furnace | blast_furnace | Same as furnace | Per tick |
| Smoker | smoker | Same as furnace | Per tick |
| Hopper | hopper | Inventory (5 slots), Cooldown, Lock, Enabled | Per tick |
| Dispenser | dispenser | Inventory (9 slots) | On activate |
| Dropper | dropper | Inventory (9 slots) | On activate |
| Brewing Stand | brewing_stand | Inventory (4+1+1 slots), FuelTime | Per tick |
| Beacon | beacon | Primary/Secondary powers, Levels | On change |
| Campfire | campfire | Inventory (4 slots), Lit, SignalFire | On change |
| Lectern | lectern | Book, Page, RedstoneOutput | On page turn |
| Jukebox | jukebox | Record (Item), IsPlaying | On insert |
| Beehive | beehive | Bees (List), HoneyLevel | On change |
| Spawner | spawner | EntityType, Delay, MinSpawnDelay, MaxSpawnDelay, SpawnCount, SpawnRange, MaxNearbyEntities | On change |
| Bell | bell | Ringing, RingTicks | On ring |
| Decorated Pot | decorated_pot | Sherds | On place |
| Skull | skull | Owner (UUID, Name, Properties), Rotation | On change |
| Sign | sign | Text (4 lines), Color, Glowing | On change |
| Conduit | conduit | Target (UUID), Active | Per tick |
| Generator | generator | Fuel, BurnTime, EnergyOutput, EnergyStored | Per tick |
| Battery | battery | EnergyStored, MaxEnergy | Per tick |
| Solar Panel | solar_panel | EnergyOutput, IsDaytime | Per tick |
| Wind Turbine | wind_turbine | EnergyOutput, WindSpeed | Per tick |
| Auto Turret | turret | Ammo, Target (UUID), Rotation, Mode | Per tick |
| Radar | radar | DetectedEntities, Mode | Per tick |
| Siren | siren | Active, SoundProfile | On activate |
| Timer | timer | Delay, Remaining, Outputting | Per tick |
| Counter | counter | Count, Target | Per tick |
| Computer | computer | Program (Lua code), IO, State | Per tick |
| Hopper (Tech) | tech_hopper | Filter, Speed, Lock | Per tick |
| Vault | vault | Inventory (54 slots), ClanID, AuthPlayers | On change |
| Safe | safe | Inventory (27 slots), CodeLock | On change (authenticated) |
| Locker | locker | Inventory (18 slots), PlayerID | On change |
| Drop Box | drop_box | Inventory (1 slot) | On insert |
| Quarry | quarry | Progress, Fuel, Output | Per tick |
| Recycler | recycler | Input, Output, Progress | Per tick |
| Repair Bench | repair_bench | Input, Output, Material | On change |
| Research Table | research_table | Blueprint, Progress | Per tick |

---

## 4. Entity Spawning Rules

```json
{
  "dimensions": {
    "overworld": {
      "categories": {
        "passive": {
          "max_count": 100,
          "tick_rate": 400,
          "spawn_range": 24
        },
        "hostile": {
          "max_count": 70,
          "tick_rate": 1,
          "spawn_range": 24
        },
        "water": {
          "max_count": 15,
          "tick_rate": 400,
          "spawn_range": 24
        },
        "ambient": {
          "max_count": 15,
          "tick_rate": 400,
          "spawn_range": 24
        }
      },
      "total_entities": 200
    },
    "nether": {
      "categories": {
        "hostile": {
          "max_count": 80,
          "tick_rate": 1,
          "spawn_range": 24
        }
      },
      "total_entities": 100
    }
  }
}
```

---

*End of Entity System Document*

Next: [World Generation →](./06-WORLDGEN.md)
