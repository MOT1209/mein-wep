# Development Roadmap — 24-Month Plan

> **Team Size:** 15–25 developers  
> **Engine:** Custom C++20  
> **Platform:** PC (Windows/macOS/Linux) → Console (TBD)

---

## Team Structure

| Role | Count | Responsibilities |
|------|-------|-----------------|
| Engine/Graphics | 4 | Renderer, GPU optimization, shaders |
| World/Chunk | 3 | World gen, chunk system, region files |
| Gameplay | 4 | Blocks, items, crafting, combat |
| AI | 2 | Mob AI, pathfinding, NPCs |
| Network | 2 | Multiplayer, replication, anti-cheat |
| Audio | 1 | Sound engine, mixing, spatial audio |
| UI/UX | 2 | HUD, inventory, menus, settings |
| Tools/Editor | 1 | World editor, modding tools |
| QA/Testing | 2 | Automated tests, performance benchmarks |
| Producer/PM | 1 | Roadmap, milestones, coordination |
| **Total** | **22** | |

---

## Milestones

### Phase 0: Prototype (Months 1–3)

```
M0.1 — Voxel Engine Core (Month 1)
  ✓ Chunk system (32×384×32)
  ✓ Block storage (6 bytes/voxel)
  ✓ Greedy meshing
  ✓ Basic world generation (flat terrain)
  ✓ Block placement/removal
  ✓ Camera & player movement

M0.2 — Basic Gameplay (Month 2)
  ✓ Block registry (50+ blocks)
  ✓ Item registry (resources, tools)
  ✓ Crafting table (3×3 grid)
  ✓ Inventory system
  ✓ Tool system (pickaxe, axe, shovel)
  ✓ Block drops & loot

M0.3 — World Generation (Month 3)
  ✓ Multi-noise terrain generation
  ✓ Biome system (10 biomes)
  ✓ Cave generation
  ✓ Tree generation (5 types)
  ✓ Surface features (grass, flowers)
  ✓ Initial lighting (sky light)

DELIVERABLE: Playable tech demo with infinite world
```

### Phase 1: Core Gameplay (Months 4–8)

```
M1.1 — Survival Systems (Month 4)
  ✓ Health, hunger, thirst
  ✓ Environmental damage (fall, drowning, fire)
  ✓ Death & respawn
  ✓ Day/night cycle
  ✓ Weather system (rain, snow, thunderstorms)
  ✓ Furnace & smelting

M1.2 — Entities & AI (Month 5)
  ✓ ECS architecture
  ✓ Entity spawning system
  ✓ Passive mobs (cow, pig, chicken, sheep)
  ✓ Hostile mobs (zombie, skeleton, spider, creeper)
  ✓ Basic A* pathfinding
  ✓ Mob drops & loot tables

M1.3 — Farming & Advanced Mechanics (Month 6)
  ✓ Farming system (tilling, planting, growing)
  ✓ Crop types (wheat, carrot, potato, beetroot)
  ✓ Animal breeding
  ✓ Fishing system
  ✓ Enchanting system
  ✓ Potion brewing

M1.4 — Multiplayer Foundation (Month 7)
  ✓ UDP networking (reliable/unreliable)
  ✓ Client-server architecture
  ✓ Player replication
  ✓ Block change replication
  ✓ Entity replication
  ✓ Basic anti-cheat (speed, reach, noclip)

M1.5 — Polish & Optimization (Month 8)
  ✓ Chunk loading optimization
  ✓ Occlusion culling
  ✓ LOD system
  ✓ Audio system (FMOD)
  ✓ Particle system
  ✓ UI system

DELIVERABLE: Alpha 0.1 — Full survival game, 4-player LAN
```

### Phase 2: Advanced Features (Months 9–14)

```
M2.1 — Electricity & Technology (Month 9)
  ✓ Wire system
  ✓ Generators, solar panels, wind turbines
  ✓ Batteries, switches, logic gates
  ✓ Auto turrets
  ✓ Radar, siren, timer
  ✓ Programmable computer (Lua)

M2.2 — Raiding & Building (Month 10)
  ✓ Tool cupboard & building privilege
  ✓ Code locks, key locks, lock picking
  ✓ Explosives (C4, rockets, grenades)
  ✓ Building upgrades (wood→stone→metal→armored)
  ✓ Structural integrity system
  ✓ Doors, garages, window bars

M2.3 — Advanced Multiplayer (Month 11)
  ✓ Server sharding
  ✓ 100+ player support
  ✓ Voice chat (proximity-based)
  ✓ Clan system
  ✓ Economy & market
  ✓ Admin tools & moderation

M2.4 — Vehicles (Month 12)
  ✓ Horse riding
  ✓ Boats & rafts
  ✓ Car, truck, ATV
  ✓ Helicopter, mini-copter
  ✓ Vehicle physics & fuel system
  ✓ Vehicle storage & locks

M2.5 — Progression System (Month 13)
  ✓ Skill trees (12 categories)
  ✓ XP & leveling
  ✓ Perk system
  ✓ Blueprint system (research)
  ✓ Quest system
  ✓ Achievements

M2.6 — World Content Expansion (Month 14)
  ✓ 20+ biomes
  ✓ 10+ dungeon types
  ✓ 10+ structure types
  ✓ 5 bosses
  ✓ NPCs with trading
  ✓ 500+ total blocks

DELIVERABLE: Beta 0.5 — Full game, 100+ player servers
```

### Phase 3: Polish & Launch (Months 15–20)

```
M3.1 — Visual Overhaul (Month 15)
  ✓ PBR rendering pipeline
  ✓ Dynamic lighting
  ✓ Volumetric clouds
  ✓ Water shader (reflection, refraction)
  ✓ Shadow mapping (CSM)
  ✓ Post-processing (bloom, SSAO, TAA)

M3.2 — Audio Overhaul (Month 16)
  ✓ 3D spatial audio (HRTF)
  ✓ Procedural audio for tools/combat
  ✓ Dynamic music system
  ✓ Ambient soundscapes
  ✓ Voice chat (Opus codec)

M3.3 — Modding API (Month 17)
  ✓ Lua scripting API
  ✓ Content pack system
  ✓ Steam Workshop integration
  ✓ Block/item/recipe registration API
  ✓ Custom entity API

M3.4 — Performance Optimization (Month 18)
  ✓ Multi-threaded chunk loading
  ✓ GPU-driven rendering
  ✓ Memory optimization (< 8GB RAM)
  ✓ Network bandwidth optimization
  ✓ Load testing (200 players)

M3.5 — UI/UX Overhaul (Month 19)
  ✓ Customizable HUD
  ✓ Radial menus
  ✓ Map system
  ✓ Settings menu (video, audio, controls)
  ✓ Keybinding customization
  ✓ Accessibility options

M3.6 — Server Infrastructure (Month 20)
  ✓ Master server
  ✓ Server browser
  ✓ Server marketplace
  ✓ Anti-cheat improvements
  ✓ Automated backups
  ✓ Analytics & monitoring

DELIVERABLE: Release Candidate 1.0
```

### Phase 4: Launch & Post-Launch (Months 21–24)

```
M4.1 — Launch Preparation (Month 21)
  ✓ Public beta testing
  ✓ Bug fixing & stability
  ✓ Server hosting documentation
  ✓ Community guidelines
  ✓ Modding documentation

M4.2 — Official Launch (Month 22)
  ✓ Steam Early Access launch
  ✓ Windows support
  ✓ Server hosting partners
  ✓ Community events

M4.3 — Post-Launch Support (Month 23)
  ✓ Bug fixes & hotfixes
  ✓ Quality of life improvements
  ✓ Performance patches
  ✓ Community feedback integration

M4.4 — First Major Update (Month 24)
  ✓ New biome: Volcanic
  ✓ New boss: Fire Elemental
  ✓ New vehicle: Submarine
  ✓ New blocks: 25+
  ✓ New items: 50+
  ✓ Steam achievements
  ✓ Linux & macOS support

DELIVERABLE: Full 1.0 Release on Steam
```

---

## 24-Month Timeline Summary

```
Month │ Phase                    │ Major Milestones
──────┼──────────────────────────┼──────────────────────────────────
  1   │ Prototype                │ Voxel engine, chunks, meshing
  2   │ Prototype                │ Blocks, items, crafting, inventory
  3   │ Prototype                │ World generation, biomes, caves
  4   │ Core Gameplay            │ Survival systems, day/night
  5   │ Core Gameplay            │ Entities, AI, pathfinding
  6   │ Core Gameplay            │ Farming, enchanting, potions
  7   │ Core Gameplay            │ Multiplayer networking
  8   │ Core Gameplay            │ Polish, optimization, audio
  9   │ Advanced Features        │ Electricity & technology
 10   │ Advanced Features        │ Raiding & advanced building
 11   │ Advanced Features        │ Clans, economy, voice chat
 12   │ Advanced Features        │ Vehicles
 13   │ Advanced Features        │ Progression & skills
 14   │ Advanced Features        │ Content expansion
 15   │ Polish & Launch          │ Visual overhaul (PBR)
 16   │ Polish & Launch          │ Audio overhaul
 17   │ Polish & Launch          │ Modding API
 18   │ Polish & Launch          │ Performance optimization
 19   │ Polish & Launch          │ UI/UX overhaul
 20   │ Polish & Launch          │ Server infrastructure
 21   │ Launch                   │ Beta testing, bug fixing
 22   │ Launch                   │ Steam Early Access
 23   │ Post-Launch              │ Support & hotfixes
 24   │ Post-Launch              │ Major update 1.0
```

---

## Budget Estimate

| Category | Cost (Monthly) | 24-Month Total |
|----------|---------------|----------------|
| Developer Salaries (22 people) | $330,000 | $7,920,000 |
| Office/Remote Infrastructure | $15,000 | $360,000 |
| Server Infrastructure | $10,000 | $240,000 |
| Software Licenses (FMOD, etc.) | $5,000 | $120,000 |
| QA & Testing | $10,000 | $240,000 |
| Marketing & Community | $20,000 | $480,000 |
| Legal & Accounting | $5,000 | $120,000 |
| **Total** | **$395,000** | **$9,480,000** |

---

*End of Development Roadmap Document*

Next: [ECS Architecture →](./11-ECS.md)
