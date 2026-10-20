# Architecture

Block World is a browser game written in strict TypeScript with Three.js for rendering, built with
Vite and tested with Vitest. There is no game framework and no external asset: textures, icons,
sounds and clouds are generated in code.

## Layers

```
main.ts            boot, UI wiring, game loop, save/load, settings
  └─ game.ts       one session: world, player, inventory, creatures, systems, renderers
       ├─ voxels/      chunks, world container, terrain generation, lighting, meshing
       ├─ physics/     AABB collision and voxel raycasts
       ├─ player/      movement controller and survival stats
       ├─ gameplay/    mining, placing, drops, inventory, crafting, furnace, containers,
       │               farming, block interaction
       ├─ entities/    creature types, AI decisions, spawning rules, entity manager
       ├─ render/      chunk meshes, streaming, materials, sky, clouds, particles, drops,
       │               creature models, perf counters, game loop
       ├─ audio/       synthesized sound effects
       └─ save/        storage backends and the save format
input/             keyboard, mouse and touch → InputState → MoveInput
ui/                HUD, inventory, pause, death, settings, encyclopedia, i18n, icons
content/           data: blocks, items, recipes, creatures, locales (EN/AR)
core/              seeded RNG, hashing, noise
```

Rules the code follows:

- **Pure logic is separate from the DOM and WebGL.** Everything under `voxels/`, `physics/`,
  `player/`, `gameplay/`, `entities/`, `save/saveLoad.ts`, `render/particles.ts`,
  `render/streaming.ts`, `input/inputState.ts`, `ui/slotLogic.ts`, `ui/settings.ts` and
  `ui/encyclopedia.ts` (entry building) runs in Node, which is how the 269 tests run without a
  browser. DOM and Three.js code is thin glue around it.
- **Content is data.** Block ids 0–83 in `content/blocks.ts` are append-only; constants in
  `config.ts` are append-only.
- **Determinism.** World generation, drops, spawning, crop growth and AI use seeded `Rng`
  instances, so tests can assert exact results.
- **No comments in source files** (a project rule from `plan.md`); names and tests carry intent.

## The frame

`GameLoop` (`render/loop.ts`) calls two handlers:

- `tick()` at a fixed 20 Hz: world time, furnaces (and their lit block swap), random block ticks.
- `render()` once per animation frame, where `main.ts`:
  1. turns `InputState` into a `FrameInput` (movement, look deltas, attack, uses, hotbar slot);
  2. calls `Game.update(input)`: player look and movement with real `dt`, survival stats,
     chunk streaming, target raycast, creatures, mining/placing/using, drops, particles, footsteps;
  3. calls `Game.render()`: sky and fog, chunk mesh rebuilds within budget, drops, creatures,
     particles, clouds, then Three.js;
  4. updates the HUD, open screens and the F3 panel, and ticks the autosaver.

Game state changes flow out through `Game.events` (`onMining`, `onPlaceFailed`, `onInteract`,
`onPlayerDamaged`, `onDeath`, `onSound`); `main.ts` turns them into toasts, screens and sounds.

## World data

- `World` owns loaded `Chunk`s in a map plus `storedChunks` (player-edited blocks of chunks that
  were unloaded). `ensureChunk` generates, re-applies stored edits and lights a chunk.
- `World.setBlock` updates heights, sky light and block light and marks nearby meshes dirty.
- `ChunkStreamer` loads chunks in a spiral around the player and unloads them past the view
  distance plus a margin; `ChunkRenderer` rebuilds dirty meshes nearest-first within a time budget.

## UI and input

- `InputState` is the single input model; desktop (`attachDesktop`) and touch (`attachTouch`)
  both write into it. `toMoveInput` merges keys and the analog joystick.
- Screens (`InventoryScreen`, `PauseMenu`, `DeathScreen`, `SettingsPanel`,
  `EncyclopediaScreen`) are plain DOM with injected CSS. `main.ts` tracks which one is open.
- All visible text goes through `ui/i18n.ts` (`tr`, `trItem`, …) backed by `content/locales.ts`.
  Arabic switches the document to right-to-left; slot grids stay left-to-right.

## Tests

See `TESTING.md`. `npm run check` runs the type checker, all tests and a production build.
