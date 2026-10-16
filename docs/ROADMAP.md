# Roadmap — Block World

Status legend: **done** · **partial** · **planned** · **blocked** · **not started**

Statuses in this file reflect verified, implemented, test-covered work only.
It is updated phase-by-phase as work lands and is verified.

## Phase 1 — Foundation

| Item | Status |
| ---- | ------ |
| Repository audit, engine decision (`docs/BASELINE_AUDIT.md`) | done |
| Vite + TypeScript strict + Vitest scaffold | done |
| Renderer, camera, sky, day/night baseline | not started |
| Desktop controls (pointer lock, WASD, jump) | not started |
| Touch controls (joystick, look pad, buttons) | not started |
| Debug overlay (FPS, position, chunk stats) | not started |

## Phase 2 — Voxel engine

| Item | Status |
| ---- | ------ |
| Chunk storage (16×16×96, `Uint8Array`) | not started |
| World container with cross-chunk access | not started |
| Face-culled chunk mesher with AO + light | not started |
| Texture atlas (procedural, original) | not started |
| Collision + raycast targeting | not started |
| Block break / place with validation | not started |
| Chunk load/unload streaming | not started |
| in-memory lighting (sky + block light flood fill) | not started |

## Phase 3 — World generation

| Item | Status |
| ---- | ------ |
| Seeded deterministic generation | not started |
| Terrain height, oceans, beaches | not started |
| Biomes (plains, forest, desert, mountains, taiga snow) | not started |
| Caves (3D noise) | not started |
| Ore distribution by depth | not started |
| Trees, vegetation, decorations | not started |
| Surface structures (ruins, camps) | not started |

## Phase 4 — Gameplay loop

| Item | Status |
| ---- | ------ |
| Item model + stack semantics | not started |
| Inventory + hotbar with validated operations | not started |
| Item drops with physics + pickup | not started |
| Tools, tiers, durability, mining speed/tier gates | not started |
| Crafting (2×2 + 3×3 shaped/shapeless), recipe registry | not started |
| Furnace processing with fuel + progress | not started |
| Chest storage with per-block state persistence | not started |

## Phase 5 — Survival

| Item | Status |
| ---- | ------ |
| Health, damage, fall damage, drowning | not started |
| Hunger, food values, eating, regeneration | not started |
| Day/night cycle driving spawns and light | not started |
| Passive animals with wander/flee AI | not started |
| Hostile creatures with chase/attack AI | not started |
| Respawn, death screen, difficulty rules | not started |

## Phase 6 — Production and building

| Item | Status |
| ---- | ------ |
| Farming (tilled soil, crop stages, water requirement, harvest) | not started |
| Growth boost item | not started |
| Functional blocks (torch, door, chest, furnace, workbench, bed) | not started |
| Building placement rules (doors rotate, torches need support) | not started |

## Phase 7 — Exploration

| Item | Status |
| ---- | ------ |
| Ruins, camps, buried loot chests | not started |
| Rare ores + gems by depth | not started |
| Exploration rewards + encyclopedia entries | not started |

## Phase 8 — Persistence

| Item | Status |
| ---- | ------ |
| Versioned world saves (IndexedDB) | not started |
| Modified-chunk delta storage | not started |
| Player, inventory, container state | not started |
| Autosave + safe teardown + quicksave | not started |
| Migration path for future versions | not started |

## Phase 9 — Mobile and desktop UX

| Item | Status |
| ---- | ------ |
| Separate desktop/touch input modules | not started |
| Responsive HUD scaling, safe-area insets | not started |
| Touch-friendly inventory interactions | not started |
| Quality presets for mobile | not started |

## Phase 10 — Research and content expansion

| Item | Status |
| ---- | ------ |
| Verified content research log | in progress (`docs/CONTENT_RESEARCH.md`) |
| REA assessment | done (`docs/REA_INTEGRATION.md`) |
| Original content expansion from research translation | in progress |

## Phase 11 — Quality and polish

| Item | Status |
| ---- | ------ |
| Synthesized SFX (dig/place/step/hurt/craft/eat) | not started |
| Particles (block break), clouds, fog | not started |
| Localization EN + AR with RTL layout | not started |
| Encyclopedia (searchable, data-driven) | not started |
| Performance instrumentation + presets | not started |

## Phase 12 — Release preparation

| Item | Status |
| ---- | ------ |
| Automated test suite | not started |
| Production build (`npm run build`) | not started |
| Acceptance checklist (`docs/TESTING.md`) | not started |
| Native packaging (desktop/mobile stores) | blocked — requires native toolchains not present in this environment |
