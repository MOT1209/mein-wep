# KingCraft — Game Design & Technical Documentation

> **Project Codename:** KingCraft  
> **Genre:** Voxel-Based Survival / Crafting / Building / PvP  
> **Inspirations:** Minecraft (voxel systems, block states, registries), Rust (electricity, raiding, clans)  
> **Target Engine:** Custom C++/Rust Engine with Vulkan/Metal Backend  
> **Platforms:** PC (Windows, macOS, Linux), Console (TBD)  
> **Target Audience:** 14+ (mature survival sandbox with PvP)

---

## Document Index

| # | Document | Description |
|---|----------|-------------|
| 01 | [Game Design Document](./01-GDD.md) | Core game design, mechanics, systems overview |
| 02 | [Technical Design Document](./02-TDD.md) | Engine architecture, system design patterns |
| 03 | [Block System](./03-BLOCKS.md) | Complete block registry, properties, states, JSON schemas |
| 04 | [Item System](./04-ITEMS.md) | Item registry, components, tool/weapon definitions |
| 05 | [Entity System](./05-ENTITIES.md) | Mobs, animals, NPCs, bosses, block entities |
| 06 | [World Generation](./06-WORLDGEN.md) | Procedural generation, biomes, caves, structures |
| 07 | [Multiplayer System](./07-MULTIPLAYER.md) | Network protocol, server authority, anti-cheat |
| 08 | [Database Schema](./08-DATABASE.md) | SQLite/PostgreSQL schemas for persistence |
| 09 | [API Design](./09-API.md) | Plugin API, modding interface, REST endpoints |
| 10 | [Development Roadmap](./10-ROADMAP.md) | 24-month development plan, milestones |
| 11 | [ECS Architecture](./11-ECS.md) | Entity-Component-System architecture details |
| 12 | [Rendering Pipeline](./12-RENDERING.md) | Render graph, voxel rendering, lighting |
| 13 | [Physics System](./13-PHYSICS.md) | Block physics, collision, fluid dynamics |
| 14 | [Performance & Memory Budget](./14-PERFORMANCE.md) | Optimization strategies, memory estimates |

---

## Reference Sources

This document is built upon analysis of:
1. **Minecraft Wiki** — Block properties, game mechanics, data components, registries
2. **Misode's Tools** — Datapack structure, worldgen JSON schemas, registry system

All IDs, properties, and structures follow Minecraft's proven patterns with intentional improvements for performance, scalability, and modern gameplay.

---

## Design Philosophy

- **Data-Driven:** Every block, item, entity, and recipe is defined in JSON — no hardcoded game logic
- **Registry-First:** All game content uses a unified registry system with integer IDs + namespaced string keys
- **Deterministic Generation:** Same seed always produces the same world for multiplayer consistency
- **Server Authority:** All game state is server-authoritative; client is a thin renderer with prediction
- **ECS Architecture:** All runtime entities use Entity-Component-System for cache-friendly performance
- **Horizontal Scalability:** World can be split across multiple server shards/regions
