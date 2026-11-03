# Testing and acceptance — Block World

## Automated gates

```bash
npm ci
npm run check        # tsc --noEmit + vitest run + vite build
```

`npm run check` must be green before any commit. As of 2026-10-20: 24 test files, 269 tests,
build OK.

| Suite | What it proves |
| ----- | -------------- |
| `world`, `mesher`, `chunkRenderer`, `textures`, `dayNight` | Chunk storage, lighting, meshing, atlas, sky colours, edited chunks survive unload |
| `streaming` | Spiral load order, per-update budget, neighbour remesh, unload only past the margin |
| `controller`, `physics` | Walk/run/swim/fly speeds, jump apex, wall stops, pitch clamp, collision and raycast |
| `inputState` | Key mapping, double-tap sprint, fly toggle, hotbar, mouse buttons, analog stick, look scale |
| `mining`, `place` | Break times and tier gate, drops and magnet pickup, placement rules in all six directions |
| `inventory`, `crafting`, `uiSlots` | Stack rules, click/split/merge/shift-move, 2×2 vs 3×3 recipes |
| `furnace`, `farming` | Smelting state machine, containers JSON, doors, beds, farmland moisture, crop growth, saplings |
| `ai`, `spawning` | AI decision table, combat, loot, despawn, spawn ring, caps, light and biome rules |
| `stats` | Fall damage, drowning, hunger, regeneration, eating, death, respawn, JSON |
| `settings` | Quality detection, clamping, persistence with broken storage, touch mode, HUD scale |
| `saveLoad` | RLE/base64 round-trip, migration and rejection, stable schema, autosaver |
| `particles` | Particle cap, gravity, ground rest, expiry; perf panel; sound recipes; cloud mask |
| `i18n` | No missing/extra keys, Arabic script everywhere in `ar`, matching placeholders, encyclopedia coverage |
| `integration` | Seeded world → 600 ticks of walking → mine → pick up → place → chest → save → load into a fresh world → exact blocks, inventory, stats, containers, time; runs in about 2–3 s |

## Acceptance checklist

Legend: **A** = covered by automated tests, **H** = checked in headless Chromium on the built game
(SwiftShader software rendering, so frame rates are meaningless there), **M** = still needs a manual
check by a person on real hardware.

### Desktop (1280×720)

| Check | Status |
| ----- | ------ |
| Menu shows Play; click locks the pointer; Esc pauses | H (Esc release is native and cannot be scripted headless) — M |
| WASD walk, Space jump, Shift sneak, Ctrl / double-W sprint | A + H |
| Mouse look turns the camera | H (synthetic mouse events) — M for real mouse feel |
| Left mouse breaks blocks with a progress bar; drops are collected | A + H |
| Right mouse places blocks; torches need support; seeds need farmland | A + H (placing) |
| Wheel and 1–9 select hotbar slots | A + H |
| E opens the inventory; click, right-click, shift-click, drag-and-drop | A + H |
| 2×2 crafting in the inventory, 3×3 at a crafting table | A + H (table opens a 3×3 grid) |
| Chest stores items; furnace smelts and lights up | A + H |
| Door opens and closes | A + H |
| Bed sets the spawn point; sleeping skips the night | A — M |
| Creatures spawn by day (passive) and night (hostile) and render | A + H |
| Hostiles hurt the player; death screen; respawn | A + H |
| Fall damage, drowning, hunger, eating | A — M |
| Crops grow on wet farmland; saplings grow | A — M (takes minutes of play) |
| F3 shows position, biome, light, time, chunks, perf | H |
| J opens the encyclopedia; search works in English and Arabic | A + H |
| Sounds play for dig, break, place, steps, hurt, eat, craft | H (sounds are scheduled) — M (listen on speakers) |
| Clouds and break particles appear | H |

### Mobile (375×667, touch)

| Check | Status |
| ----- | ------ |
| Touch controls appear on Play; joystick moves; drag looks | H (device emulation) — M on a real phone |
| Tap places, long-press breaks; Break/Place/Jump/Sneak/Down buttons | H (partial) — M |
| Hotbar slots are tappable; Bag opens the inventory; Close button | H |
| Inventory and settings fit 375 px with no horizontal page scroll | H |
| Multi-touch (move and look at the same time) | M |
| Frame rate on a mid-range phone | M |

### Save and settings

| Check | Status |
| ----- | ------ |
| Save now, reload: position, view, blocks, chest contents, hotbar restored | A + H |
| Autosave every 60 s and on tab hide | A (autosaver) — M (real tab switch) |
| New world deletes the save after confirmation | M |
| Settings (view distance, quality, sound, HUD size, touch, language) persist | A + H |
| Corrupt save starts a fresh world with a message | A |

### Language

| Check | Status |
| ----- | ------ |
| Arabic browser locale switches the UI to Arabic with RTL | A + H |
| Hotbar and slot grids keep 1–9 order in RTL | H |
| Arabic wording reads naturally | M (needs a native reviewer) |

## How the headless browser checks were run

The game was built with `npm run build`, served from `dist/` with a static server and driven
with Playwright in Chromium (`--use-gl=swiftshader`). Mouse look and mouse buttons were sent as
synthetic `MouseEvent`s because Playwright's mouse emits large `movementX` jumps under pointer
lock. WebAudio calls were counted by wrapping `AudioContext.prototype` methods. These scripts are
not part of the repository; the automated suite above is the regression gate.
