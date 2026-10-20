# Performance

Source: `src/config.ts` (`QUALITY_PRESETS`), `src/render/*`, `src/ui/settings.ts`.

## Quality presets

| Preset | View distance (chunks) | Pixel ratio cap | Particles | Clouds | Fog density |
| ------ | ---------------------- | --------------- | --------- | ------ | ----------- |
| low | 4 | 1 | 60 | no | 1.35 |
| medium | 6 | 1.5 | 160 | yes | 1.0 |
| high | 9 | 2 | 320 | yes | 0.85 |

The preset is chosen automatically from CPU cores, device memory and pointer type (touch devices
get low or medium) and can be changed in Settings. View distance can be set separately (2–12) and
rebuilds the chunk streamer and fog immediately. Antialiasing is fixed when the page loads.

## Budgets in the frame

- Chunk generation: at most 2 chunks per frame, nearest first (`ChunkStreamer`).
- Chunk meshing: up to 4 ms per frame, nearest dirty chunk first (`ChunkRenderer.rebuildBudgeted`).
- Creature AI: up to 48 creatures think per tick; the others keep moving with their last decision.
- Random block ticks (crops, farmland, saplings): 6 per loaded chunk per game tick.
- Particles: one instanced mesh, capped by the preset.
- Game logic (world time, furnaces, random ticks) runs at a fixed 20 ticks per second; player
  movement, creatures and drops update every frame with real delta time.

## Measuring

Press **F3**. The panel shows FPS, average and worst frame time over the last 60 frames, draw
calls, triangles, live geometries and textures, chunk load/unload totals, creature and particle
counts, and the current quality.

## Known limits

- Chunk generation and lighting run on the main thread. On slow devices this can cause short
  stutters while moving into new terrain. A Web Worker has not been added because no real-device
  profile has shown it to be the bottleneck yet.
- The terrain mesher has no ambient occlusion.
- No numbers from real phones or GPUs have been recorded yet; headless test runs use software
  rendering and their frame rates are not meaningful.
