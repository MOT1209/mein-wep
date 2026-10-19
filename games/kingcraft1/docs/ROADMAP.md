# Roadmap — Block World

Status legend: **done** · **partial** · **planned** · **blocked** · **not started**

Statuses in this file reflect verified, implemented, test-covered work only.
It is updated phase-by-phase as work lands and is verified.

## Phase 1 — Foundation

| Item | Status |
| ---- | ------ |
| Repository audit, engine decision (`docs/BASELINE_AUDIT.md`) | done |
| Vite + TypeScript strict + Vitest scaffold | done |
| Renderer, camera, sky, day/night baseline | partial (renderer, sky colours, fog and day-night loop done; camera is a fixed view at spawn, no player camera yet) |
| Desktop controls (pointer lock, WASD, jump) | not started |
| Touch controls (joystick, look pad, buttons) | not started |
| Debug overlay (FPS, position, chunk stats) | partial (FPS, position and loaded-chunk count; no mesh stats) |

## Phase 2 — Voxel engine

| Item | Status |
| ---- | ------ |
| Chunk storage (16×16×96, `Uint8Array`) | done |
| World container with cross-chunk access | done |
| Face-culled chunk mesher with AO + light | in progress (culling + light done; AO pending) |
| Texture atlas (procedural, original) | done |
| Collision + raycast targeting | done |
| Block break / place with validation | not started |
| Chunk load/unload streaming | partial (load/unload primitives exist; no radius streaming yet) |
| in-memory lighting (sky + block light flood fill) | done |

## Phase 3 — World generation

| Item | Status |
| ---- | ------ |
| Seeded deterministic generation | done |
| Terrain height, oceans, beaches | done |
| Biomes (plains, forest, desert, mountains, taiga snow) | done |
| Caves (3D noise) | done |
| Ore distribution by depth | done |
| Trees, vegetation, decorations | done |
| Surface structures (ruins, camps) | partial (camps + boulders done; ruins and buried loot pending) |

## Phase 4 — Gameplay loop

| Item | Status |
| ---- | ------ |
| Item model + stack semantics | partial (defs + canonical ItemStack done; dedicated item tests pending) |
| Inventory + hotbar with validated operations | done |
| Item drops with physics + pickup | not started |
| Tools, tiers, durability, mining speed/tier gates | not started |
| Crafting (2×2 + 3×3 shaped/shapeless), recipe registry | partial (matcher + registry done and tested; UI integration pending) |
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
| Particles (block break), clouds, fog | partial (distance fog in the terrain shader; no particles or clouds) |
| Localization EN + AR with RTL layout | not started |
| Encyclopedia (searchable, data-driven) | not started |
| Performance instrumentation + presets | not started |

## Phase 12 — Release preparation

| Item | Status |
| ---- | ------ |
| Automated test suite | in progress (voxel, render, gameplay and physics suites green; grows per phase) |
| Production build (`npm run build`) | done |
| Acceptance checklist (`docs/TESTING.md`) | not started |
| Native packaging (desktop/mobile stores) | blocked — requires native toolchains not present in this environment |
