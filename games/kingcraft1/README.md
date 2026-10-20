# Block World

An original voxel sandbox survival game that runs in the browser: explore a seeded world, mine
and build, craft tools, smelt ore, farm, fight creatures at night, and keep your world between
visits. Desktop and touch screens, English and Arabic (right-to-left). All textures, icons,
sounds and clouds are generated in code — there are no asset files.

Built with TypeScript, Three.js and Vite.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
```

URL options: `?seed=123`, `?mode=creative`, `?time=0.75` (see `docs/CONTROLS.md`).

## Controls (desktop)

WASD move · Space jump · Shift sneak · Ctrl or double-W sprint · mouse look · left click break ·
right click place/use · 1–9 or wheel hotbar · E inventory · J encyclopedia · F fly (creative) ·
F3 debug · Esc pause. Touch devices get a joystick and buttons automatically.

## Check and build

```bash
npm run check        # type check + 269 tests + production build
npm run build        # output in dist/
```

## Documentation

| Document | Contents |
| -------- | -------- |
| `docs/GAMEPLAY_GUIDE.md` | How to play, what exists today |
| `docs/CONTROLS.md` | Keyboard, mouse, touch and URL options |
| `docs/BLOCKS_AND_ITEMS.md` | Every block, item and creature (generated from the data) |
| `docs/CRAFTING_RECIPES.md` | Crafting, smelting and fuel tables (generated) |
| `docs/WORLD_GENERATION.md` | Terrain, biomes, caves, ores, structures |
| `docs/SAVE_SYSTEM.md` | Save format, autosave, migrations |
| `docs/PERFORMANCE.md` | Quality presets, frame budgets, known limits |
| `docs/ARCHITECTURE.md` | Code layout and the frame |
| `docs/TESTING.md` | Test suites and the acceptance checklist |
| `docs/ROADMAP.md` | Status of every feature, including what is partial or missing |
| `CHANGELOG.md` | Changes by commit |

## Status

Playable on desktop and touch. Not yet checked on real phones or with real speakers, and the
Arabic text has not been reviewed by a native editor. Partial or missing features are listed in
`docs/ROADMAP.md`.
