# MASTER_PROMPT.md — Block World

This file preserves the project's master directive. The full prompt text is maintained by
the project owner; this file records its operative requirements so any agent session can
re-orient quickly.

## Mission

Build **Block World**: an original 3D voxel sandbox game — survival, building, exploration
and crafting — as a real, playable, tested product with professional documentation.
Do not copy Minecraft code, assets, branding or protected content.

## Required systems

1. Editable block-based world, seeded procedural terrain and biomes.
2. Resource gathering, mining, ore distribution.
3. Blocks, items, tools, weapons, armour with tiers and durability.
4. Inventory, hotbar, containers, validated atomic item operations.
5. Data-driven crafting, crafting stations, furnace processing with fuel.
6. Survival: health, hunger, damage, day/night cycle, respawn, difficulty.
7. Farming: soil, crops, water requirement, growth by world time, harvest.
8. Creatures: passive, neutral, hostile, with modular AI and spawn rules.
9. Exploration: caves, structures, loot, rare discoveries.
10. Lighting, weather, audio, particles.
11. Game modes: survival, creative, peaceful; world creation and management.
12. Separate mobile and desktop control schemes and responsive UI.
13. Versioned save system with validation, recovery and migrations.
14. Searchable in-game encyclopedia; EN + AR localization with RTL support.
15. Automated tests; honest reporting of implemented / partial / planned / blocked items.

## Execution rules (operative summary)

- Inspect the repository before changing it; preserve user work.
- Prefer modular, data-driven systems; keep changes testable and reviewable.
- Never invent successful tests, builds or research findings.
- Use REA only within its documented capabilities and only with authorization; it is
  not required for this project (see `docs/REA_INTEGRATION.md`).
- Document findings with date + source.
- Continue to the next logical task when safe; report blockers honestly.

## Phase plan

See `docs/ROADMAP.md` for the live status table (single source of truth).
