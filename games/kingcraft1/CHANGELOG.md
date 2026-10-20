# Changelog

Entries follow the commits in the `mein-wep` repository (`games/kingcraft1/`). Dates are commit
dates. The game has not had a tagged release yet.

## Unreleased — 2026-10-20

### Added

- **Testing**: end-to-end integration test (generate → walk → mine → place → save → load);
  `docs/TESTING.md` acceptance checklist. (`7565e6d`)
- **Localization**: English and Arabic for every UI string, right-to-left layout for Arabic,
  language setting; searchable encyclopedia of blocks, items, creatures and recipes generated
  from the game data. (`64b7a1c`)
- **Audio and effects**: synthesized WebAudio sound effects per material, break particles,
  cloud layer, F3 performance panel, sound volume setting. (`fdf981f`)
- **Saves**: versioned IndexedDB persistence with autosave, Save now and New world; edited
  chunks now survive being unloaded. (`9083c9a`)
- **Touch and settings**: virtual joystick and buttons, responsive HUD, quality presets with
  auto-detection, settings panel saved in the browser. (`d7ca8e9`)
- **Survival**: health, food, air, fall damage, drowning, starvation, regeneration, eating,
  death screen and respawn. (`e7dc825`)
- **Creatures**: eight creature types with AI, spawning by light, biome and time, box models,
  melee and ranged combat, loot. (`492cb9d`)
- **Functional blocks**: furnace smelting, chests, doors, beds, farming and sapling growth,
  creative item palette. (`2995558`)
- **Interface**: hotbar, inventory screen with crafting, pause menu, item icons, toasts, F3
  details, dropped items drawn as sprites. (`26588c8`)
- **Mining and building**: tool tiers and break times, drops with pickup, placement rules,
  hoe and bucket use, survival/creative modes. (`dd7b7e1`)
- **Input**: pointer-lock mouse look and keyboard controls. (`1f23e07`)
- **Player**: walk, sprint, sneak, jump, swim and fly with collision and a first-person camera.
  (`f9db450`)
- **Streaming**: chunks load in a spiral around the player and unload behind. (`ad0d318`)

### Fixed

- Player edits disappeared when a chunk was unloaded and loaded again. (`9083c9a`)
- A long frame could count the whole frame as drowning time. (`e7dc825`)
- Hotbar slots could not be tapped on touch screens; the inventory overflowed a 375 px screen.
  (`d7ca8e9`)
- Typing E or digits into the encyclopedia search triggered game keys. (`64b7a1c`)

## 2026-10-16 to 2026-10-17 — engine foundation

Imported into `mein-wep` from the original project (`1bdd2b4`, `082c11c`, `16542ef`):
seeded terrain and biome generation, caves, ores, trees, lighting, chunk mesher, procedural
texture atlas, chunk renderer and materials, collision and raycasts, inventory and crafting
matcher, game bootstrap with sky, fog and day/night.
