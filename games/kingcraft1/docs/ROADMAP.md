# Roadmap — Block World

Status legend: **done** · **partial** · **planned** · **blocked** · **not started**

Statuses in this file reflect verified, implemented, test-covered work only.
It is updated phase-by-phase as work lands and is verified.

## Phase 1 — Foundation

| Item | Status |
| ---- | ------ |
| Repository audit, engine decision (`docs/BASELINE_AUDIT.md`) | done |
| Vite + TypeScript strict + Vitest scaffold | done |
| Renderer, camera, sky, day/night baseline | done (first-person camera follows the player controller) |
| Desktop controls (pointer lock, WASD, jump) | done (pointer lock, WASD/arrows, jump, sneak, sprint, fly, hotbar keys, mouse look; Esc release is native and not verifiable headless) |
| Touch controls (joystick, look pad, buttons) | done (verified in browser touch emulation at 375×667; not yet on a real phone, multi-touch untested) |
| Debug overlay (FPS, position, chunk stats) | done (FPS, position, movement mode, loaded/pending chunks, hotbar slot) |

## Phase 2 — Voxel engine

| Item | Status |
| ---- | ------ |
| Chunk storage (16×16×96, `Uint8Array`) | done |
| World container with cross-chunk access | done |
| Face-culled chunk mesher with AO + light | in progress (culling + light done; AO pending) |
| Texture atlas (procedural, original) | done |
| Collision + raycast targeting | done |
| Block break / place with validation | done |
| Chunk load/unload streaming | done (spiral radius streaming, neighbour remesh, unload past margin) |
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
| Item drops with physics + pickup | done (gravity, merge, magnet, pickup, despawn) |
| Tools, tiers, durability, mining speed/tier gates | done |
| Crafting (2×2 + 3×3 shaped/shapeless), recipe registry | done (2×2 in the inventory, 3×3 at a crafting table; table recipes refused in 2×2) |
| Furnace processing with fuel + progress | done |
| Chest storage with per-block state persistence | done |

## Phase 5 — Survival

| Item | Status |
| ---- | ------ |
| Health, damage, fall damage, drowning | done (mob damage and death verified in browser; fall and drowning unit-tested only) |
| Hunger, food values, eating, regeneration | done (unit-tested; eating not exercised in browser) |
| Day/night cycle driving spawns and light | done |
| Passive animals with wander/flee AI | done |
| Hostile creatures with chase/attack AI | done (ranged attacks hit instantly with line of sight; no projectile is drawn) |
| Respawn, death screen, difficulty rules | partial (respawn + death screen done; no difficulty settings) |

## Phase 6 — Production and building

| Item | Status |
| ---- | ------ |
| Farming (tilled soil, crop stages, water requirement, harvest) | done (unit-tested; growth not exercised in browser) |
| Growth boost item | done (ground_bone) |
| Functional blocks (torch, door, chest, furnace, workbench, bed) | done (bed sets spawn and skips night; fume vent and lantern have no interaction) |
| Building placement rules (doors rotate, torches need support) | partial (support, soil and player-overlap rules done; doors are single blocks without orientation) |

## Phase 7 — Exploration

| Item | Status |
| ---- | ------ |
| Ruins, camps, buried loot chests | not started |
| Rare ores + gems by depth | not started |
| Exploration rewards + encyclopedia entries | not started |

## Phase 8 — Persistence

| Item | Status |
| ---- | ------ |
| Versioned world saves (IndexedDB) | done (in-memory fallback when IndexedDB is unavailable) |
| Modified-chunk delta storage | done (RLE + base64; edits also survive chunk unload within a session) |
| Player, inventory, container state | done (plus stats, time, creatures) |
| Autosave + safe teardown + quicksave | done (60 s autosave, save on hide/pagehide, Save now button) |
| Migration path for future versions | done (version switch; only v1 exists) |

## Phase 9 — Mobile and desktop UX

| Item | Status |
| ---- | ------ |
| Separate desktop/touch input modules | done |
| Responsive HUD scaling, safe-area insets | done |
| Touch-friendly inventory interactions | partial (tap pick/place, Close button and 32 px slots on small screens; no touch equivalent of shift-click) |
| Quality presets for mobile | done (auto-detect + manual override saved in localStorage) |

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
| Automated test suite | in progress (21 files, 249 tests green; grows per phase) |
| Production build (`npm run build`) | done |
| Acceptance checklist (`docs/TESTING.md`) | not started |
| Native packaging (desktop/mobile stores) | blocked — requires native toolchains not present in this environment |
