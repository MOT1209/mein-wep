# Block World — Multi-Agent Construction Plan

Purpose: this file lets fresh coding agents (Claude Code, opencode, Codex, etc.) execute
the remaining work **cold**, one step at a time, in parallel where safe.
Read the whole header once. Then execute only the assigned step.

Project root: `C:\Users\aihmo\Downloads\kingcraft1` (Windows / PowerShell 5.1).
A synced copy lives in the `mein-wep` repo at `games/kingcraft1/`. It is excluded from the
portfolio deploy until a `vite build` output is published instead of the raw source.
Docs of record: `docs/MASTER_PROMPT.md`, `docs/BASELINE_AUDIT.md`, `docs/ROADMAP.md`.

---

## 1. Hard rules (binding for every agent)

1. **No code comments.** None, anywhere, in any file.
2. **TypeScript strict** (`noUnusedLocals`, `noUnusedParameters`). No `any`, no `@ts-ignore`.
3. **Never copy Minecraft** code, assets, textures, names, or branding. Everything original.
4. **Naming and IDs are locked**: block IDs 0–83 in `src/content/blocks.ts` are append-only.
   `src/config.ts` constants are append-only (you may add, never change existing values).
5. **Honesty rule**: `docs/ROADMAP.md` is the single source of truth. Update a row to
   `done`/`partial` **only after** its tests/verification actually pass. Never claim unverified work.
6. **File ownership**: each step owns the files it lists. Do not edit files owned by other
   steps. Hub files (`src/game.ts`, `src/main.ts`, `src/config.ts`, `docs/ROADMAP.md`,
   `plan.md`) follow the special rules in section 6.
7. **Tests are deterministic** (seeded RNG, no network, no timers where avoidable).
   Logic that can be tested headless must have tests before the step is done.
8. **Commits**: one commit per step, conventional style (examples in each step).
   Never commit with failing typecheck or failing tests in the files you touched.
   Do not run `git push` unless asked.
9. **Do not run the full test suite repeatedly** — it is slow (~60s+ per file on this
   machine). Run `npm run typecheck` plus the specific test files you touched.
   Use a 600000 ms timeout for npm/npx commands in this environment.
10. Report format when done: files changed, exact commands run, observed results, blockers.

Verification commands (PowerShell):

```powershell
npm run typecheck                 # tsc --noEmit
npx vitest run tests/<file>.test.ts   # targeted tests (slow, be patient)
npm run build                     # vite build (wave ends only)
```

## 2. Verified current state (trust this, verify with the commands)

Verified on 2026-10-19 in the `mein-wep` copy: `npx tsc --noEmit` clean, `npx vitest run`
269/269 across 24 files (including `tests/integration.test.ts`), `npm run build` succeeds. Headless Chromium checks on the built page
(desktop 1280×720 and touch emulation 375×667) are listed in each step's commit body.

- **Done: S1–S20.** Engine (S1–S10), mining/placing/drops (S11), HUD, inventory, pause (S12),
  furnace, chest, doors, bed, farming (S13), creatures (S14), survival stats and respawn (S15),
  touch controls and settings (S16), IndexedDB saves (S17), synthesized audio, particles,
  clouds and perf panel (S18), English/Arabic with RTL and the encyclopedia (S19).
- **S20**: end-to-end integration test, `npm run check` green, `docs/TESTING.md` acceptance
  checklist (automated / headless-verified / manual-pending), ROADMAP truth pass.
- **Not started: S21** (documentation set and CHANGELOG).
- **Gaps inside done steps** (also in `docs/ROADMAP.md`): mesher AO; chunk generation on the main
  thread; doors have no orientation; fume vent and lantern have no interaction; ranged creatures
  hit instantly (no projectile); no difficulty settings; no touch shift-click; real phones and
  multi-touch not tested; fall damage, drowning, eating, crop growth and beds verified by unit
  tests only, not in the browser; audio not listened to on speakers; Arabic not reviewed by a
  native editor. Language changes reload the page (UI is built once per load).
- **API drift from the original step text**: `ChunkStreamer.update(px, pz)` (no `nowMs`);
  `loadAllNow(px, pz, radius?)`. `MoveInput` uses booleans for `jump/sneak/sprint/fly`. Pure
  logic lives next to DOM glue: `src/input/inputState.ts`, `src/ui/slotLogic.ts`,
  `src/ui/settings.ts`. `Game.update(FrameInput)` runs player physics per frame with real dt;
  `Game.tick()` runs world time, furnaces and random ticks at 20 Hz. `World` keeps edited
  chunks in `storedChunks` on unload and re-applies them on load (S17 found that edits were
  lost on unload). Saves use slot `world:<seed>:<mode>`. Creative mode has an all-items palette
  (not in the original plan; creative had nothing to place). `?time=0..1` sets the start time.
- **Mesher API (unchanged)**: `buildChunkMesh(source, chunk, tileOf)` returns
  `{ opaque, water, plants }` with chunk-local positions, UVs in tile units over 16, and
  `sky`/`block` vertex attributes as `light/15` of the adjacent cell (plants: own cell).
  Face order `FACE_PX=0, FACE_NX=1, FACE_PY=2, FACE_NY=3, FACE_PZ=4, FACE_NZ=5`.
- **Atlas convention (critical)**: mesher computes `v = (row + lv)/16` with row = `(tile/16)|0`.
  `src/render/textures.ts` MUST draw tile index `i` into the canvas row-flipped:
  `x = (i % 16) * 16`, `y = (15 - ((i/16)|0)) * 16` (canvas is y-down, three.js flipY default).
- **Perf facts (relative only)**: this machine's Vitest is instrumented and 10–20× slower than a
  real browser. Worldgen ~21–31 ms/chunk, lighting ~46 ms/chunk in Vitest. Do not "optimize"
  against Vitest numbers; only fix algorithmic blowups. Sky-light BFS seeding is the dominant
  cost and is architecturally standard (MC-style); deeper optimization is deferred, not a bug.

## 3. Estimates (agent-hours, ±50%)

| Wave | Steps | Agent-hours |
|------|-------|-------------|
| 0 | S1 | 0.5 |
| 1 | S2–S6 | 13 |
| 2 | S7–S11 | 16 |
| 3 | S12–S16 | 22 |
| 4 | S17–S19 | 12 |
| 5 | S20–S21 | 6.5 |
| **Total** | | **~70 agent-hours** |

With 3–4 agents running parallel waves this compresses to roughly 20–30 wall-clock hours of
agent runtime, plus manual browser checks after renderer/UI steps. (This supersedes the earlier
"35–45 h" verbal estimate, which under-counted UI/polish.)

---

## 4. Wave map (dependency order)

```
WAVE 0  S1 (serial, unblocks everything)
WAVE 1  S2, S4, S5, S6   (parallel: render, physics, inventory, crafting)
            S3 depends on S2 (can start after S2's TileOf interface exists)
WAVE 2  S7, S9 (parallel after S3/S4).  S8 after S7.  S10 after S9.  S11 after S4+S5+S7.
WAVE 3  S12 after S11+S5+S7.  S13 after S11+S5.  S14 after S9+S4.
            S15 after S9+S12.  S16 after S10+S12.
WAVE 4  S17 after S11+S13+S15.  S18 after S7+S11.  S19 after S12.
WAVE 5  S20 after all.  S21 last.
```

Rules for parallel dispatch:
- Never run two steps at the same time if one lists the other as a dependency.
- Steps in the same wave are parallel-safe: their file sets are disjoint.
- Hub files (`src/game.ts`, `src/main.ts`): only the owning step edits them inside a wave.
  If a non-owner step needs a one-line registration, it must batch that edit at wave end
  and coordinate so only one agent touches the hub file at a time.
- After each wave: run `npm run typecheck`, full `npx vitest run`, `npm run build` once, fix
  fallout, then commit remaining changes.

---

## 5. Steps

Each step: Goal / Context / Owned files / Tasks / Acceptance / Verify / Depends / Parallel-safe / Commit.

### S1 — Verify mesher tests and commit the voxels milestone (0.5 h)

- **Context**: see section 2. `tests/mesher.test.ts` has the FakeSource fix applied but unrun.
- **Owned files**: `tests/mesher.test.ts`, `docs/ROADMAP.md`, `src/config.ts` (verify only).
- **Tasks**:
  1. Run `npx vitest run tests/mesher.test.ts` (timeout 600000).
  2. If failures remain, fix **test expectations or FakeSource only if the test is provably
     wrong**; if the mesher itself is wrong, fix `src/voxels/mesher.ts` minimally and say so in
     the report. Do not weaken assertions to force green.
  3. Run `npm run typecheck`.
  4. Commit: `git add src tests docs/config edits` + commit message
     `feat(voxels): chunk mesher with per-face light and water/plant batches`.
- **Acceptance**: 14/14 mesher tests pass; typecheck clean; mesher + config + ROADMAP committed.
- **Depends**: nothing. **Parallel-safe**: no (runs first, alone).

### S2 — Procedural texture atlas + tile registry (2.5 h)

- **Goal**: `src/render/textures.ts` builds a 256×256 canvas atlas, 16×16 tiles of 16 px.
- **Context**: tile names come from `BlockDef.tiles` in `src/content/blocks.ts` (values like
  `"grass_top"`, `"stone"`, ...). A registry maps tile name → index. Mesher UVs are tile-unit
  and assume the **row-flip drawing rule** from section 2 — follow it exactly or every texture
  renders upside down.
- **Owned files**: `src/render/textures.ts`, `tests/textures.test.ts` (no other render files).
- **Tasks**:
  1. `export const TILE_INDEX: Record<string, number>` built from an ordered list of painter
     entries (`{ name, draw(ctx, px, py) }`), each painting deterministic original 16×16 pixel art
     with the shared palette (write a small internal palette; e.g. grass greens, stone grays,
     sand, wood browns, water blues, ores as colored speckles on stone, glass/ice translucent
     light tints, torch, furnace faces, door faces, crops stages, wool colors, flowers, etc.).
     Include **every** tile name referenced in `blocks.ts` — enumerate them from the file.
  2. Painter helpers allowed: `fillRect`, deterministic speckle via `Rng` from `src/core/rng.ts`.
  3. `export function buildAtlasCanvas(): HTMLCanvasElement` (draw all painters, row-flipped),
     `export function atlasTileOf(blockId, face): number` (maps `def.tiles` + face → tile index;
     "cross" blocks return their `all` tile; missing name → console-free fallback tile 0).
  4. `export function buildAtlasTexture(): THREE.CanvasTexture` with `magFilter: NearestFilter`,
     `minFilter: NearestFilter` (no mip bleed).
- **Frozen interface (S3 codes against this; do not deviate)**: `TILE_INDEX: Record<string, number>`;
  `paintAtlas(ctx: AtlasCtx): void` where `AtlasCtx` is a structural subset of
  `CanvasRenderingContext2D` (fillStyle + fillRect + clearRect); `buildAtlasCanvas(): HTMLCanvasElement`;
  `atlasTileOf(blockId: number, face: number): number` (face values are mesher `FACE_*`; PY→top,
  NY→bottom, NZ→front when defined else side; unknown name → tile 0);
  `buildAtlasTexture(): THREE.CanvasTexture`. Module top level must not reference `document`
  (node-import safe); canvases are created lazily inside the `build*` functions only.
- **Acceptance tests** (`tests/textures.test.ts`, headless: use a canvas stub or pure data test):
  1. Every tile name referenced by any `BlockDef` exists in `TILE_INDEX` (iterate all blocks).
  2. `TILE_INDEX` values are unique, `0 <= index < 256`.
  3. `atlasTileOf` returns the right tile for a known block+face (e.g. GRASS top ≠ bottom).
- **Verify**: `npm run typecheck` + `npx vitest run tests/textures.test.ts`.
- **Depends**: S1. **Parallel-safe with**: S4, S5, S6. **Commit**: `feat(render): procedural texture atlas and tile registry`.

### S3 — Chunk renderer: THREE meshes + terrain shader (3 h)

- **Goal**: turn `ChunkMeshData` into three.js meshes with correct lighting and shading.
- **Context**: mesher API and attribute layout in section 2. Codes only against S2's frozen
  interface — never edit `src/render/textures.ts` (S2 owns it, possibly in flight). This step
  owns the shader; **strongest available agent** recommended.
- **Owned files**: `src/render/materials.ts`, `src/render/chunkRenderer.ts`, `tests/chunkRenderer.test.ts`.
- **Tasks**:
  1. `materials.ts`: three `ShaderMaterial`s (terrain / water / plants) sharing one vertex
     shader. Vertex: `attribute float sky; attribute float block; varying vSky, vBlock, vShade,
     vUv;` compute `vShade` from normal: `n.y>0.5 ? 1.0 : n.y<-0.5 ? 0.5 : (abs(n.z)>0.5 ? 0.8 : 0.6)`.
     Fragment: `vec4 tex = texture2D(uAtlas, vUv); vec3 light = max(uDay * vSky, vBlock) * vShade;
     gl_FragColor = vec4(tex.rgb * max(light, uMinLight), tex.a);` plus distance fog to `uFogColor`
     (use `QUALITY_PRESETS.*.fogDensity`, `FOG_START_FACTOR`). Water: `transparent: true`,
     `depthWrite: false`, slight alpha (`uWaterAlpha ≈ 0.75`). Plants: `DoubleSide`,
     `alphaTest ≈ 0.5`, no depthWrite change.
  2. `chunkRenderer.ts`: `class ChunkRenderer { constructor(scene, world); update(cx, cz);
     markDirty(cx, cz); rebuildBudgeted(budgetMs); dispose(cx, cz); }`. For each chunk build
     `buildChunkMesh(world, chunk, atlasTileOf)`, create three `BufferGeometry`s (+ `sky`/`block`
     attrs), set `mesh.position.set(cx*16, 0, cz*16)`, add to scene, dispose old on rebuild.
     Rebuild loop must respect a per-frame time budget and chamfer by distance (near first).
  3. Keep an injectable clock (default `performance.now`) so budget logic is testable headless.
- **Acceptance tests**: geometry packing (attribute counts match MeshArrays lengths), dirty
  queue order (near-before-far), `dispose(cx,cz)` removes meshes and frees geometry (mock scene
  counts children), budget stops after first chunk that exceeds budget.
- **Verify**: `npm run typecheck` + `npx vitest run tests/chunkRenderer.test.ts`.
- **Depends**: S2. **Parallel-safe with**: nothing in wave 1 after S2 ships (S7 waits on this).
- **Commit**: `feat(render): chunk meshes with terrain, water and plant materials`.

### S4 — Physics: voxel collision + raycast targeting (3 h)

- **Goal**: headless-testable movement math and block targeting.
- **Context**: `World.getBlock/columnHeight` API (section 2). Player dims in `src/config.ts`
  (`PLAYER_WIDTH`, `PLAYER_HEIGHT`, `STEP_HEIGHT`, gravity/speeds constants). Pure functions,
  no three.js.
- **Owned files**: `src/physics/collision.ts`, `src/physics/raycast.ts`, `tests/physics.test.ts`.
- **Tasks**:
  1. `collision.ts`: swept-AABB against voxels with per-axis resolution (move X, resolve; Y;
     Z), `stepUp` support (`STEP_HEIGHT`), returns `{ x, y, z, onGround, hitCeiling, hitWall,
     inWater }`. Solid = `def.solid`; liquids non-solid but detectable.
  2. `raycast.ts`: Amanatides–Woo voxel DDA, `raycastVoxel(world, origin, dir, maxDist)`
     returns first non-air/non-liquid hit `{ x, y, z, id, face, distance }` (faces use mesher
     `FACE_*` values) or null. Also `raycastLine` for entity line-of-sight (returns whether
     clear) — used later by AI.
- **Acceptance tests**: walking into a wall stops at wall face; step-up over one block works;
  landing sets `onGround`; ceiling stops upward motion; raycast hits nearest block and reports
  the correct face from all 6 directions; maxDist respected; hit through glass allowed (glass
  non-solid? — use `opaque` for targeting: raytargets any block with `def.solid ||
  id !== AIR`, liquids skipped: define once and test both).
- **Verify**: `npm run typecheck` + `npx vitest run tests/physics.test.ts`.
- **Depends**: S1. **Parallel-safe with**: S2, S5, S6. **Commit**: `feat(physics): voxel collision, step-up and DDA raycast`.

### S5 — Inventory, hotbar and stacks (2 h)

- **Goal**: pure-logic inventory with validated operations.
- **Context**: `INVENTORY_SLOT_COUNT`, `HOTBAR_SIZE`, `DEFAULT_STACK_SIZE`, `TOOL_STACK_SIZE`
  in `src/config.ts`; item defs in `src/content/items.ts` (check its exact shape first).
- **Owned files**: `src/gameplay/inventory.ts`, `tests/inventory.test.ts`.
- **Tasks**: `class Inventory` with `slots: (ItemStack|null)[]`, `hotbarIndex`, methods:
  `add(stack): remainder`, `removeAt(i, n)`, `swap(a, b)`, `split(i)`, `moveTo(a, b)` merge-aware,
  `count(item)`, `consume(item, n): boolean`, `selected()` getters/setters, tool durability field
  (`durability?`), `toJSON()/fromJSON()` for save (S17 will call these). Respect stack sizes
  (`stackSize` from item def; tools = 1). Immutability: never mutate input stacks, return new ones.
- **Acceptance tests**: merge to 64 then overflow; partial pickup; split halves; swap; consume
  across two partial stacks; durability decrements; JSON round-trip equality.
- **Verify**: `npm run typecheck` + `npx vitest run tests/inventory.test.ts`.
- **Depends**: S1. **Parallel-safe with**: S2, S4, S6. **Commit**: `feat(gameplay): inventory, hotbar and stack operations`.

### S6 — Crafting matcher (2×2 / 3×3, shaped + shapeless) (2 h)

- **Goal**: recipe matching engine over existing recipe data.
- **Context**: `src/content/recipes.ts` already defines recipes (read its exact schema first:
  shaped grids vs shapeless). Output: `ItemStack`.
- **Owned files**: `src/gameplay/crafting.ts`, `tests/crafting.test.ts`.
- **Tasks**: `matchRecipe(grid: (ItemStack|null)[], size: 2|3): Recipe | null` — normalize grid
  (trim empty rows/cols), try shaped (with all offsets) then shapeless (multiset compare);
  `craft(grid, size, craftAll)` consuming inputs and returning output stacks; expose
  `recipesFor(item)` and `availableRecipes(inv)` for UI later.
- **Acceptance tests**: shaped match at offset; mirrored NOT required (one orientation only);
  wrong shape fails; shapeless order-independent; empty grid null; craftAll consumes correctly.
- **Verify**: `npm run typecheck` + `npx vitest run tests/crafting.test.ts`.
- **Depends**: S1 (reads recipes.ts). **Parallel-safe with**: S2, S4, S5.
- **Commit**: `feat(gameplay): shaped and shapeless crafting matcher`.

### S7 — Game bootstrap: scene, camera, sky, day-night, main loop (3.5 h)

- **Goal**: first playable view: world renders, sun moves, fog matches time.
- **Context**: S3 `ChunkRenderer`, `World` time API (`advanceTime`, `dayFactor` internals —
  read `src/voxels/world.ts` for exact accessors; `DAY_TICKS` exported). `index.html` exists.
- **Owned files**: `src/game.ts`, `src/main.ts`, `src/render/sky.ts`, `src/render/loop.ts`,
  `index.html` (script tag only), `tests/dayNight.test.ts` (pure color math only).
- **Tasks**:
  1. `sky.ts`: pure `skyColors(dayFactor): { top, horizon, fog, sunIntensity }` gradient
     (original palette), sun/moon billboard optional v1; expose shader uniforms update.
  2. `loop.ts`: fixed-timestep accumulator (`TICK_MS`) + render call; FPS counter data.
  3. `game.ts`: create renderer (antialias from quality preset, pixelRatio cap), perspective
     camera, scene, `ChunkRenderer`, sky dome (or background color), fog; own the player
     position placeholder `(spawn from world.findSpawn())`; per-frame: `world.advanceTime`,
     update uniforms (`uDay = max(dayFactor, 0.08)`, fog), `chunkRenderer.rebuildBudgeted(4)`,
     render. Expose `game.tick()` and `game.render()` separately for testability.
  4. `main.ts`: instantiate on DOMContentLoaded, resize handler, minimal F3 text overlay
     (FPS, position, chunks loaded) into a `<div>`; pointer-lock controls come in S10.
- **Acceptance**: `npm run dev` shows terrain, moving sun, no console errors; `phase` colors
  t at dawn/noon/dusk/night behave per `dayFactor`; dayNight tests for `skyColors` monotonicity.
- **Verify**: `npm run typecheck` + `npx vitest run tests/dayNight.test.ts` + manual `npm run dev`.
- **Depends**: S3. **Parallel-safe with**: S9 (different files), S10 not yet.
- **Commit**: `feat(render): game bootstrap with sky, fog and day-night loop`.

### S8 — Chunk streaming manager (2.5 h)

- **Goal**: load/rebuild/unload chunks around the player with budgets.
- **Context**: `World.ensureChunk/unloadChunk/getChunkIfLoaded`, `CHUNK_UNLOAD_MARGIN`,
  `DEFAULT_RENDER_DISTANCE`, `QUALITY_PRESETS`. `ChunkRenderer` (S3) rebuild queue;
  note the known gap: when a neighbor chunk loads, the border mesh must rebuild.
- **Owned files**: `src/render/streaming.ts`, `tests/streaming.test.ts`.
- **Tasks**: `class ChunkStreamer` with `update(px, pz, nowMs)`: spiral order relative to
  player, load N chunks/frame; after `ensureChunk`, call `renderer.markDirty(cx,cz)` and the
  4 neighbors; unload beyond `renderDistance + CHUNK_UNLOAD_MARGIN` (world.unloadChunk +
  renderer.dispose); light in `world.ensureChunk` already runs; expose counters for F3.
- **Acceptance tests** (headless with stub renderer + real `World` small radius): loads in
  spiral near-first; neighbor marking; unload only past margin; counters correct.
- **Verify**: `npm run typecheck` + `npx vitest run tests/streaming.test.ts`.
- **Depends**: S7. **Commit**: `feat(render): budgeted chunk streaming with neighbor remeshing`.

### S9 — Player controller (walk/jump/swim/fly + camera) (3 h)

- **Goal**: physical movement decoupled from input.
- **Context**: S4 collision API; config speeds (`WALK_SPEED`, `RUN_SPEED`, `FLY_SPEED`,
  `JUMP_VELOCITY`, `SWIM_SPEED`, `GRAVITY`, `TERMINAL_VELOCITY`, `WATER_DRAG`, `AIR_DRAG`,
  `PLAYER_EYE_HEIGHT`, creative flag from game state).
- **Owned files**: `src/player/controller.ts`, `tests/controller.test.ts`.
- **Tasks**: `class PlayerController { state: { position, velocity, yaw, pitch, onGround,
  inWater, flying, sprinting }; move(input: MoveInput, dt): void; look(dyaw, dpitch); }` where
  `MoveInput = { forward, strafe, jump, sneak, sprint, fly }` normalized floats. Include
  head-bob? No. Include spawn/respawn helper, camera eye position getter.
- **Acceptance tests**: accelerate to WALK_SPEED under AIR_DRAG cap; jump apex ≈ v²/2g;
  swimming caps at SWIM_SPEED; flying ignores gravity; pitch clamped ±89°; yaw wraps.
- **Verify**: `npm run typecheck` + `npx vitest run tests/controller.test.ts`.
- **Depends**: S4. **Parallel-safe with**: S7. **Commit**: `feat(player): movement controller with swim, fly and camera`.

### S10 — Desktop input (pointer lock, keys, mouse) (2 h)

- **Goal**: feed `MoveInput` + look deltas from keyboard/mouse.
- **Context**: S9 `MoveInput`; browser APIs only (`requestPointerLock`, `keydown/up`,
  `mousemove`). Design a thin `InputState` object S16 (touch) will also produce.
- **Owned files**: `src/input/inputState.ts`, `src/input/desktop.ts`.
- **Tasks**: `InputState` type + `attachDesktop(canvas, state): detachFn` with pointer lock on
  click, Esc unlock, WASD, Space jump, Shift sneak/sprint (config choice: Shift = sneak,
  double-W sprint), F = fly toggle (creative), 1–9 hotbar select, F3 debug, E inventory (fires
  a callback the UI step wires later — keep callbacks in a `HudEvents` object).
- **Acceptance**: manual browser check (pointer lock, movement, no scroll while locked).
  Typecheck only; logic is thin glue (document manual verification honestly in the commit body).
- **Verify**: `npm run typecheck` + manual `npm run dev`.
- **Depends**: S9. **Commit**: `feat(input): desktop pointer-lock keyboard and mouse controls`.

### S11 — Mining, placing, drops and interaction (4 h)

- **Goal**: the core break/place loop with tool tiers and drops.
- **Context**: S4 `raycastVoxel`, S5 inventory, `World.setBlock` (relights automatically),
  `BlockDef.hardness/tool/tier/drops`, `PLAYER_REACH`/`CREATIVE_REACH`. Ticking: game loop
  provides `world.advanceTime` ticks (S7); this step defines a per-tick `interactionTick(dt)`.
- **Owned files**: `src/gameplay/mining.ts`, `src/gameplay/place.ts`, `src/gameplay/drops.ts`,
  `tests/mining.test.ts`, `tests/place.test.ts`.
- **Tasks**:
  1. `mining.ts`: target from raycast; progress accumulates `dt / breakTime(id, heldItem)`
     (hardness, tool tier > 1 gate → slow/blocked: e.g. wrong tier → 0 progress with a
     failure ping), instant in creative; on completion `world.setBlock(air)` + drop item
     (tool durability −1, tool break at 0).
  2. `drops.ts`: resolve `def.drops` (self/item list with min/max/chance via seeded Rng),
     spawn `ItemDrop { id, count, x,y,z, vy }` entities list with simple gravity + merge +
     pickup radius (`ITEM_PICKUP_RADIUS`), despawn timer (`ITEM_DROP_DESPAWN_SECONDS`).
  3. `place.ts`: place rules — target block face +1 offset, collision with player AABB
     (S4) forbidden, `replaceable` (water/grass) replaced, `needsSupport` requires solid below
     (torch/farmland/sapling/crop), `plantedOn` list respected, door/orientation state swap
     (place `DOOR_CLOSED`, right-click toggles), bucket fills/places water (no flow).
- **Acceptance tests**: break times ordered (stone > dirt), tier gate blocks (wood pick vs
  ferrite ore), wrong tool slow (axe vs stone), drop table RNG bounds; place offset correct in
  all 6 faces, support rules reject float torches, replaceable grass replaced with torch.
- **Verify**: `npm run typecheck` + `npx vitest run tests/mining.test.ts tests/place.test.ts`.
- **Depends**: S4, S5, S7. **Commit**: `feat(gameplay): mining, placing, drops and interaction rules`.

### S12 — HUD, hotbar, inventory screen, pause (4 h)

- **Goal**: playable UI loop on desktop.
- **Context**: S5 inventory, S7 game, S10 input callbacks (`HudEvents`), S11 drops/target.
  DOM/CSS overlay is fine (no framework); keep it testable where pure (slot math).
- **Owned files**: `src/ui/hud.ts`, `src/ui/inventoryScreen.ts`, `src/ui/pauseMenu.ts`,
  `src/ui/hud.css` (or injected styles), `tests/uiSlots.test.ts`.
- **Tasks**: crosshair; hotbar (9 slots, selection, item icons from the atlas via canvas
  `drawImage` crop); health/hunger/air bars (values from S15 when available, defaults now);
  F3 debug panel (FPS, coords, biome, chunks, light level at feet, day time); inventory
  screen (27+9 grid, click/drag/drop, crafting 2×2, shift-click fast move); pause (Esc) with
  resume/settings placeholder; wire `HudEvents` to S10.
- **Acceptance**: test pure `screenToSlot(x,y)` math + drag/drop slot transitions in
  `uiSlots.test.ts`; manual check: open/close, drag item, craft planks, place from hotbar.
- **Verify**: `npm run typecheck` + `npx vitest run tests/uiSlots.test.ts` + manual.
- **Depends**: S11, S5, S7. **Commit**: `feat(ui): HUD, hotbar, inventory screen and pause`.

### S13 — Functional blocks: furnace, chest, door, bed, workbench, farming (5 h)

- **Goal**: container state + tick machines + crop growth.
- **Context**: `InteractionKind` in blocks.ts (`crafting/furnace/chest/door/bed/fume/lantern`),
  `B.FURNACE(_LIT)`, `B.CHEST`, `B.DOOR_*`, `B.BED`, `B.WHEAT_*`, `FARMLAND(_WET)`,
  `growth` field on crops, `SAVE`-friendly state (S17 will serialize). World time ticks from
  S7. Smelting recipes: check `recipes.ts` for a smelting section; if absent, add smelting
  entries to recipes.ts (append-only) as part of this step.
- **Owned files**: `src/gameplay/furnace.ts`, `src/gameplay/containers.ts`,
  `src/gameplay/farming.ts`, `src/gameplay/interactive.ts`, `src/content/recipes.ts`
  (append smelting if missing), `tests/furnace.test.ts`, `tests/farming.test.ts`.
- **Tasks**:
  1. `furnace.ts`: state machine (input/fuel/output, burn/progress ticks, lit block swap
     `FURNACE` <-> `FURNACE_LIT`, `lightEmit` diff via `World.setBlock`), JSON state.
  2. `containers.ts`: `ContainerStore` keyed by chunk+local index: chest 27 slots, furnace
     state, bed occupancy; `open/close/get/put` with inventory merge semantics; JSON dump for
     save.
  3. `interactive.ts`: right-click dispatch — door toggle, bed → `skipToMorning` when night +
     clear weather, craft gate (use 3×3 crafting screen for CRAFTING_TABLE — extend S12 UI),
     lantern/fume behavior per defs.
  4. `farming.ts`: crop tick — FARMLAND wet state near water (scan radius 4), growth stages
     `WHEAT_0..3` via seeded RNG probability per tick, bonemeal-style "growth boost item"
     (check items.ts for the boost item name), harvest → drops (wheat + seeds), sapling →
     tree growth over N ticks (reuse worldgen tree writer if exported, else factor it).
- **Acceptance tests**: smelting consumes fuel/turns progress/lit swap; chest serialization
  round-trip; dry farmland stops growth; wet farmland advances stages deterministically under
  seeded RNG; harvest gives correct drops; bed refuses by day.
- **Verify**: `npm run typecheck` + `npx vitest run tests/furnace.test.ts tests/farming.test.ts`.
- **Depends**: S11, S5. **Commit**: `feat(gameplay): furnace, chest, doors, bed and farming state`.

### S14 — Creatures: AI, spawning, simple models, combat (6 h)

- **Goal**: living world with passive and hostile mobs.
- **Context**: `src/content/creatures.ts` defs (read shape), `MAX_ENTITIES`,
  `HOSTILE_CAP_NIGHT`, `PASSIVE_CAP`, biome/light from World, S4 `raycastLine`, S9 player
  state, S11 drops. Keep models as colored boxes (no external assets).
- **Owned files**: `src/entities/types.ts`, `src/entities/ai.ts`, `src/entities/spawning.ts`,
  `src/entities/manager.ts`, `src/render/entityRenderer.ts`, `tests/ai.test.ts`,
  `tests/spawning.test.ts`.
- **Tasks**:
  1. `ai.ts`: FSM (idle/wander/flee/approach/attack/despawn) with per-spec numbers
     (speed, aggro radius, damage, health); fleeing when hurt; hostile chase at night or in
     dark (`light < 8`); attack cooldown; knockback; uses `raycastLine` for LOS.
  2. `spawning.ts`: rules — passive during day on grass in light, hostile at night/dark,
     caps from config, spawn distance ring around player (24–48 blocks), despawn far/at day,
     seeded RNG; biome-restricted species from creature defs.
  3. `manager.ts`: entity list, tick(dt) with budget, damage application to player (S15 hooks
     via callback), item drops from creature loot tables, entity save JSON.
  4. `entityRenderer.ts`: instanced or simple `BoxGeometry` groups colored per species with
     a walk bob; frustum-culled by distance; no shadows v1.
- **Acceptance tests**: FSM transitions table-driven (flee fires when hurt, chase in range,
  wander picks bounded headings); spawner respects caps + light + ring; despawn logic.
- **Verify**: `npm run typecheck` + `npx vitest run tests/ai.test.ts tests/spawning.test.ts`.
- **Depends**: S9, S4. **Commit**: `feat(entities): creature AI, spawning rules and simple rendering`.

### S15 — Survival stats: health, hunger, air, damage, death (3 h)

- **Goal**: survival pressures and respawn.
- **Context**: `MAX_HEALTH`, `MAX_HUNGER`, `MAX_AIR`, `FALL_DAMAGE_THRESHOLD`,
  `FALL_DAMAGE_PER_BLOCK`, `RESPAWN_HEALTH`, food values in `items.ts`, S14 damage callback,
  S12 HUD bars.
- **Owned files**: `src/player/stats.ts`, `src/ui/deathScreen.ts`, `tests/stats.test.ts`.
- **Tasks**: `class PlayerStats` — health/hunger/air; fall damage on landing (track fall
  distance from S9 vertical velocity), drowning countdown underwater (resets above), starvation
  at 0 hunger, regeneration when hunger > 17 and health < max (slow tick), eating
  (`eat(itemId)` applies food value, refuses at full hunger unless buff), damage sources
  (mobs, fall, drown, starve), death → drop inventory + death screen → respawn at
  `world.findSpawn()` or bed; JSON for save.
- **Acceptance tests**: fall damage thresholds; drowning ticks; regen only above hunger
  threshold; eating consumes item and clamps; death drops inventory; respawn resets.
- **Verify**: `npm run typecheck` + `npx vitest run tests/stats.test.ts`.
- **Depends**: S9, S12 (bars). **Commit**: `feat(player): health, hunger, air, damage and respawn`.

### S16 — Touch input + responsive HUD + quality presets (4 h)

- **Goal**: mobile-playable.
- **Context**: S10 `InputState`, S12 HUD, `QUALITY_PRESETS`, `MIN/MAX_RENDER_DISTANCE`.
  Touch detection (`pointer: coarse` + touch events).
- **Owned files**: `src/input/touch.ts`, `src/ui/responsive.ts`, `src/ui/settings.ts`,
  `tests/settings.test.ts`.
- **Tasks**: left virtual joystick (move), right look drag area, buttons (jump, sneak, fly,
  break, place, inventory), tap = break/place with reach preview, safe-area insets CSS,
  HUD scale factor, quality auto-select by `navigator.hardwareConcurrency`/UA with manual
  override persisted (localStorage), render-distance slider wired to streaming (S8).
- **Acceptance**: `settings.ts` pure logic tested (preset selection, clamping, persistence
  via injected storage); manual check via browser device emulation (document honestly).
- **Verify**: `npm run typecheck` + `npx vitest run tests/settings.test.ts` + manual emulation.
- **Depends**: S10, S12. **Commit**: `feat(ui): touch controls, responsive HUD and quality settings`.

### S17 — Persistence: versioned IndexedDB saves (4 h)

- **Goal**: worlds survive reloads.
- **Context**: `SAVE_FORMAT_VERSION=1`, `World.getModifiedChunks/applySavedBlocks`,
  `AUTOSAVE_INTERVAL_SECONDS`, JSON serializers from S5/S13/S14/S15. Load order:
  create World(seed) → applySavedBlocks per chunk → relight happens on ensure — verify this
  in world.ts before writing the loader; if you find a gap, fix it minimally and note it.
- **Owned files**: `src/save/db.ts`, `src/save/saveLoad.ts`, `tests/saveLoad.test.ts`.
- **Tasks**:
  1. `db.ts`: tiny promise wrapper over IndexedDB with a `MemoryBackend` implementing the same
     interface for tests (and for environments without IDB).
  2. `saveLoad.ts`: schema `{ version, seed, time, player: {pos,yaw,pitch,stats,inventory},
     containers, entities, chunks: { "cx,cz": base64(Uint8Array) } }` (RLE-compress chunk
     arrays before base64 — simple RLE in this file); `saveWorld(world, gameState, db)`,
     `loadWorld(db)`, `migrate(save)` switch on version; autosave timer + `quicksave()`.
  3. Wire save/load entry points into `game.ts` (batch this edit; hub-file rule).
- **Acceptance tests** (MemoryBackend): round-trip world with 3 edited chunks restores exact
  blocks; version mismatch rejected cleanly; RLE round-trip property test on random arrays;
  player+inventory+container round-trip; save schema stable-key check (no timestamps).
- **Verify**: `npm run typecheck` + `npx vitest run tests/saveLoad.test.ts`.
- **Depends**: S11, S13, S15. **Commit**: `feat(save): versioned IndexedDB world persistence`.

### S18 — Audio, particles, clouds and perf panel (4 h)

- **Goal**: game feel.
- **Context**: `MaterialKind`/`soundGroup` on block defs, `QUALITY_PRESETS.particles/clouds`,
  S7 loop, S11 break/place events. All audio synthesized with WebAudio (no assets).
- **Owned files**: `src/audio/sfx.ts`, `src/render/particles.ts`, `src/render/clouds.ts`,
  `src/render/perfPanel.ts`, `tests/particles.test.ts`.
- **Tasks**: SFX recipes per material (dig/place/step/hurt/craft/eat) using oscillators +
  noise + envelopes, respecting a global volume/mute; particle system (break: 8–12 colored
  cubes from `particleTile`, gravity, life; footstep dust optional) with preset cap values;
  flat cloud layer at y≈80 (procedural, quality-gated); F3 performance panel (frame ms,
  draw calls, geometry counts, chunk counters from S8).
- **Acceptance**: `particles.ts` physics testable headless (spawn/step/expire counts under
  cap); manual audio check (documented honestly).
- **Verify**: `npm run typecheck` + `npx vitest run tests/particles.test.ts` + manual.
- **Depends**: S7, S11. **Commit**: `feat(audio): synthesized SFX, break particles and clouds`.

### S19 — Localization EN/AR with RTL + encyclopedia (4 h)

- **Goal**: bilingual UI + searchable data-driven encyclopedia.
- **Context**: `src/content/locales.ts` (check current shape), all UI strings from S12/S13/
  S15/S16 must route through it; RTL layout for Arabic; encyclopedia entries built from
  block/item/creature defs plus `docs/CONTENT_RESEARCH.md` flavor text (original writing!).
- **Owned files**: `src/ui/i18n.ts`, `src/ui/encyclopedia.ts`, `src/content/locales.ts`
  (expand), `tests/i18n.test.ts`.
- **Tasks**: `t(key, params)` with en/ar dictionaries, `setLocale`, `document.dir` switch;
  full Arabic translations for all UI keys (original translations, no machine-literal ugliness);
  encyclopedia screen: categories (blocks/items/creatures/recipes), search box, entry detail
  with recipe display, keyboard/touch navigation; every def must resolve an entry (fallback to
  def name).
- **Acceptance tests**: no missing key across locales (iterate all keys); encyclopedia builds
  entry per def with stable ids; Arabic strings are non-empty and RTL flag flips.
- **Verify**: `npm run typecheck` + `npx vitest run tests/i18n.test.ts` + manual Arabic check.
- **Depends**: S12. **Commit**: `feat(ui): English and Arabic localization with encyclopedia`.

### S20 — Hardening: integration tests, build, acceptance pass (4 h)

- **Goal**: prove the game end-to-end headless and ship a production build.
- **Context**: everything. This step may touch any production file for fixes, plus new tests.
- **Owned files**: `tests/integration.test.ts`, `docs/TESTING.md`, any fix in existing files.
- **Tasks**:
  1. Headless integration test: fixed seed → generate world → find spawn → simulate 600
     ticks of player walk with collision → break/place a block → save → load → assert world,
     inventory, time equal. Must run under ~5 s (keep radius small).
  2. `npm run check` (`typecheck + test + build`) must be green; fix what fails.
  3. Write `docs/TESTING.md` acceptance checklist (desktop manual pass list, mobile list,
     save/reload, day-night, mining tiers, crafting, furnace, mobs, death/respawn).
  4. Fill `docs/ROADMAP.md` truth pass: every row reflects verified reality only.
- **Acceptance**: integration test green; `npm run check` green; docs written.
- **Depends**: all previous. **Commit**: `test: end-to-end integration suite and acceptance docs`.

### S21 — Documentation completion + CHANGELOG (2.5 h)

- **Goal**: finish the doc set promised in the master prompt.
- **Owned files**: `docs/ARCHITECTURE.md`, `docs/GAMEPLAY_GUIDE.md`,
  `docs/BLOCKS_AND_ITEMS.md`, `docs/CRAFTING_RECIPES.md`, `docs/WORLD_GENERATION.md`,
  `docs/CONTROLS.md`, `docs/SAVE_SYSTEM.md`, `docs/PERFORMANCE.md`, `CHANGELOG.md`,
  `README.md` (root, concise), `docs/ROADMAP.md` (final status).
- **Tasks**: write each doc from the actual code (no aspiration — describe what exists);
  CHANGELOG follows the real commits; README: what it is, how to run, controls summary,
  test/build commands; ROADMAP final pass with honest `partial/blocked` markers for anything
  unfinished (native packaging stays `blocked`).
- **Acceptance**: docs match code (spot-check API names); no doc claims an unimplemented feature.
- **Depends**: S20. **Commit**: `docs: complete project documentation and changelog`.

---

## 6. Hub-file rules (avoid merge pain)

- `src/config.ts`: append-only. Any step may add constants at the end. Never reorder/edit.
- `src/game.ts`, `src/main.ts`: owned by S7 in wave 2. Later steps (S12 S15 S16 S17 S18 S19)
  need small registrations there — do them as the **last edit of your wave**, one agent at a
  time, or hand the one-line wiring to the next wave's owner and leave a `tasks.md` note.
- `docs/ROADMAP.md`: same rule — update only at wave end, one agent at a time.
- `plan.md`: if a premise turns out false (API differs, file missing), fix the plan file itself
  in the same commit that fixes reality. Plans that lie are worse than no plan.

## 7. Anti-patterns (reviewers reject these)

- Marking ROADMAP rows done without a passing test or verified manual check.
- Weakening a test's assertions to force green instead of fixing the cause.
- Touching files outside the step's ownership; opportunistic refactors.
- Adding npm dependencies without a stated reason and a note in the commit body.
- Using Vitest timings to justify micro-optimizations (see section 2, perf facts).
- Copying Minecraft visual identity; palette and shapes must stay original.
- "TODO" stubs left in `src/` without a corresponding ROADMAP row and plan step.

## 8. Suggested agent dispatch prompt (copy-paste)

```
You are working in C:\Users\aihmo\Downloads\kingcraft1 (Windows PowerShell).
Read plan.md at the project root. Execute STEP <ID> only, completely, following:
- the Hard Rules (section 1), especially: no comments, strict TS, file ownership, honesty rule
- the owning files list of that step; do not edit anything else (hub-file rules section 6)
- verification: npm run typecheck plus the step's targeted vitest files (timeout 600000 ms)
When done: commit with the step's message, then report: files changed, commands run,
observed results, blockers, and any plan.md corrections you made.
If the step is already done in the working tree, verify and commit it instead.
```

## 9. First dispatch pair (Wave 0 + Wave 1), ready to paste

Run these two agents **in parallel**. They are file-disjoint and both safe to start now.
After both finish, the human/orchestrator runs once: `npm run check` (typecheck + full tests + build).

### Agent A prompt (S1 then S2)

```
You are a coding agent working in C:\Users\aihmo\Downloads\kingcraft1 (Windows, PowerShell 5.1). The repo is a TypeScript voxel game (Block World) built with Vite + Three.js + Vitest.

Read plan.md at the project root first; its sections 1 and 2 are binding. Then execute this step exactly as written there:

STEP S2 — Procedural texture atlas + tile registry
(S1 is already done and committed as 309b765; skip it.)

Hard rules that apply to everything:
- No code comments anywhere. TypeScript strict. No any, no @ts-ignore.
- Never copy Minecraft code/assets/names. All pixel art must be original.
- Only edit files owned by this step: src/render/textures.ts and tests/textures.test.ts, plus the single ROADMAP row for the atlas. If the step truly needs a new constant, src/config.ts is append-only. Do not touch any other file, especially src/game.ts, src/main.ts, src/voxels/*.
- If a test fails, fix the real cause; never weaken assertions to force green.
- Use a 600000 ms timeout for npm/npx commands. Vitest on this machine is slow (~60 s per file); be patient, do not add fake timeouts.
- Commit: "feat(render): procedural texture atlas and tile registry". No git push. If git reports index.lock, wait 5 s and retry.
- Update docs/ROADMAP.md only for work whose verification actually passed: set "Texture atlas (procedural, original)" to done only after S2 tests pass.

S2 critical details: follow the atlas row-flip rule exactly (draw tile index i at canvas x=(i%16)*16, y=(15-((i/16)|0))*16, because the mesher emits v=(row+lv)/16 and three.js flipY is default). Enumerate EVERY tile name referenced by src/content/blocks.ts and register a painter for each; the acceptance test must iterate all BlockDefs and fail on any unregistered name.

Verification: `npm run typecheck`, then `npx vitest run tests/textures.test.ts`.

Final report: files changed, exact commands run, observed results, blockers, and any plan.md corrections you made.
```

### Agent B prompt (S4 then S5)

```
You are a coding agent working in C:\Users\aihmo\Downloads\kingcraft1 (Windows, PowerShell 5.1). The repo is a TypeScript voxel game (Block World) built with Vite + Three.js + Vitest.

Read plan.md at the project root first; its sections 1 and 2 are binding. Then execute these two steps in order, exactly as written there:

STEP S4 — Physics: voxel collision + raycast targeting
STEP S5 — Inventory, hotbar and stacks

Hard rules that apply to everything:
- No code comments anywhere. TypeScript strict. No any, no @ts-ignore.
- Only edit files owned by these steps: src/physics/collision.ts, src/physics/raycast.ts, tests/physics.test.ts (S4); src/gameplay/inventory.ts, tests/inventory.test.ts (S5). Do not touch src/voxels/*, src/render/*, src/content/*, src/game.ts, src/main.ts, docs/ROADMAP.md, src/config.ts.
- If a test fails, fix the real cause; never weaken assertions to force green.
- Use a 600000 ms timeout for npm/npx commands. Vitest on this machine is slow (~60 s per file); be patient.
- Commits: one per step — "feat(physics): voxel collision, step-up and DDA raycast", then "feat(gameplay): inventory, hotbar and stack operations". No git push. If git reports index.lock, wait 5 s and retry.

Read before coding: src/config.ts (player dims and speed constants), src/voxels/world.ts (getBlock signature and return conventions), src/voxels/mesher.ts (FACE_PX..FACE_NZ constants — raycast hit faces must use these same values), src/content/items.ts (exact item def shape for Inventory). Tests must be deterministic and headless: S4 uses a small in-memory fake world, S5 uses inventory/item data only.

Verification per step: `npm run typecheck`, then `npx vitest run tests/physics.test.ts` (S4) and `npx vitest run tests/inventory.test.ts` (S5).

Final report: files changed, exact commands run, observed results, blockers, and any plan.md corrections you made.
```

Coordination notes:
- Both agents may commit to the same repo; commits are small and local. The lock-retry rule above handles overlap.
- Do not run the full `npx vitest run` inside the agents; run `npm run check` once after both complete and hand any fallout back to the owning agent.
- If an agent discovers a wrong premise (missing API, different schema), it must fix plan.md in the same commit — plans that lie are worse than no plan.

## 10. Render-lane pair (S2 + S3), ready to paste

Both can start now **in parallel** because S2's frozen interface (section 4, "### S2") is
published above. If S3 reaches verification before `src/render/textures.ts` exists, its prompt
tells it to wait (bounded) for the S2 agent instead of guessing.

### Agent S2 prompt

```
You are a coding agent working in C:\Users\aihmo\Downloads\kingcraft1 (Windows, PowerShell 5.1). The repo is a TypeScript voxel game (Block World) built with Vite + Three.js + Vitest.

Read plan.md at the project root first; its sections 1 and 2 are binding. Then execute STEP S2 exactly as written in plan.md (the "### S2 — Procedural texture atlas + tile registry" block).

Hard rules:
- No code comments anywhere. TypeScript strict. No any, no @ts-ignore.
- Never copy Minecraft code/assets/names. Pixel art must be original and deterministic.
- Only edit: src/render/textures.ts and tests/textures.test.ts, plus the single ROADMAP row for the atlas. Do NOT touch src/game.ts, src/main.ts, src/voxels/*, src/render/materials.ts, src/render/chunkRenderer.ts — another agent is creating those in parallel.
- If a test fails, fix the real cause; never weaken assertions to force green.
- Use a 600000 ms timeout for npm/npx commands. Vitest on this machine is slow; be patient.
- Commit: "feat(render): procedural texture atlas and tile registry". No git push. If git reports index.lock, wait 5 s and retry.

Frozen interface (S3 is coded against this — do NOT deviate):
- export const TILE_INDEX: Record<string, number>
- export function paintAtlas(ctx: AtlasCtx): void   // AtlasCtx = structural subset of CanvasRenderingContext2D: fillStyle + fillRect + clearRect
- export function buildAtlasCanvas(): HTMLCanvasElement
- export function atlasTileOf(blockId: number, face: number): number   // face = mesher FACE_PX..FACE_NZ; PY→top, NY→bottom, NZ→front when defined else side; unknown name → tile 0
- export function buildAtlasTexture(): THREE.CanvasTexture
- Module top level must not touch `document` (importing must be safe in node tests); canvases are created lazily inside build* functions only.

Critical drawing rule: draw tile index i at canvas pixel x=(i%16)*16, y=(15-((i/16)|0))*16 (row flip, because the mesher emits v=(row+lv)/16 and three.js flipY is default). Exactly 256x256 canvas, 16px tiles. Speckle via Rng from src/core/rng.ts (deterministic).

Enumerate EVERY tile name referenced by BlockDef.tiles in src/content/blocks.ts (read the whole file) and register a painter for each. The acceptance test must iterate all BlockDefs and fail if any referenced tile name is unregistered.

Tests (tests/textures.test.ts) are headless: never call buildAtlasCanvas/buildAtlasTexture in tests (no DOM in vitest node env). Test: TILE_INDEX completeness/uniqueness/range; atlasTileOf for known block+face pairs (e.g. GRASS top ≠ bottom); painter output through a stub AtlasCtx (record fillRect calls; assert each registered tile actually paints something).

Verification: `npm run typecheck`, then `npx vitest run tests/textures.test.ts`. Update the "Texture atlas" ROADMAP row to done ONLY if tests pass.

Final report: files changed, exact commands run, observed results, blockers, and any plan.md corrections you made.
```

### Agent S3 prompt

```
You are a coding agent working in C:\Users\aihmo\Downloads\kingcraft1 (Windows, PowerShell 5.1). The repo is a TypeScript voxel game (Block World) built with Vite + Three.js + Vitest.

Read plan.md at the project root first; its sections 1 and 2 are binding. Then execute STEP S3 exactly as written in plan.md (the "### S3 — Chunk renderer: THREE meshes + terrain shader" block).

Hard rules:
- No code comments anywhere. TypeScript strict. No any, no @ts-ignore.
- Only edit: src/render/materials.ts, src/render/chunkRenderer.ts, tests/chunkRenderer.test.ts, plus a clearly-matching ROADMAP row if one exists (if unsure, touch none and say so in your report). Do NOT edit src/render/textures.ts (another agent owns it), src/voxels/*, src/config.ts, src/game.ts, src/main.ts.
- If a test fails, fix the real cause; never weaken assertions to force green.
- Use a 600000 ms timeout for npm/npx commands. Vitest is slow on this machine; be patient.
- Commit: "feat(render): chunk meshes with terrain, water and plant materials". No git push. If git reports index.lock, wait 5 s and retry.

Frozen interface consumed from src/render/textures.ts (owned by the S2 agent):
- atlasTileOf(blockId: number, face: number): number
- buildAtlasTexture(): THREE.CanvasTexture
- TILE_INDEX: Record<string, number>
Code against these names/signatures exactly. If the file does not exist yet, S2 is still running: write ALL your code first against the interface, and only when you need to run typecheck/tests, wait for the file with this bounded loop:
  $deadline = (Get-Date).AddMinutes(30); while (-not (Test-Path "src/render/textures.ts") -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 20 }
If it still does not exist after 30 minutes, stop and report the blocker instead of guessing.

Implementation requirements (full details in plan.md S3):
- materials.ts: three ShaderMaterials (terrain/water/plants) sharing one vertex shader. Vertex attributes `sky` and `block` (floats from MeshArrays); shade from normal: n.y>0.5→1.0, n.y<-0.5→0.5, abs(n.z)>0.5→0.8 else 0.6. Fragment: tex color * max(uDay*vSky, vBlock) * vShade with floor uMinLight, distance fog to uFogColor driven by QUALITY_PRESETS[*].fogDensity and FOG_START_FACTOR from src/config.ts. Water: transparent true, depthWrite false, uWaterAlpha ~0.75. Plants: DoubleSide, alphaTest ~0.5.
- chunkRenderer.ts: class ChunkRenderer { constructor(scene, world); update(cx, cz); markDirty(cx, cz); rebuildBudgeted(budgetMs); dispose(cx, cz); } using buildChunkMesh(world, chunk, atlasTileOf) from src/voxels/mesher.ts; positions are chunk-local so set mesh.position.set(cx*16, 0, cz*16). Dispose old geometry on rebuild; process dirty queue nearest-first; per-frame time budget via an injectable clock (default performance.now).
- Tests headless: real THREE.BufferGeometry/ShaderMaterial/Mesh work in node; use a mock scene counting children on add/remove; a real World or small fake MeshSource; no WebGLRenderer anywhere. Cover: attribute counts match MeshArrays lengths; near-before-far dirty order; dispose removes meshes; budget stops after first over-budget chunk.

Verification: `npm run typecheck`, then `npx vitest run tests/chunkRenderer.test.ts`.

Final report: files changed, exact commands run, observed results, blockers, and any plan.md corrections you made.
```
