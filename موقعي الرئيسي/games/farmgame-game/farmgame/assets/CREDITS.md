# Third-Party Asset Credits

All assets below are CC0 (public domain equivalent) — attribution is not required, but credited here for reference and future license audits.

## Textures

- **Grass001** — [ambientCG](https://ambientcg.com/view?id=Grass001), CC0. Used for: `assets/textures/ground/`, `assets/materials/grass_ground.tres`, `assets/materials/grass_tile.tres`.
- **Ground048** — [ambientCG](https://ambientcg.com/view?id=Ground048), CC0. Used for: `assets/textures/soil/`, `assets/materials/soil_tilled.tres`.

Only the Color/NormalGL/Roughness maps were kept (AO, Displacement, and other maps from the original download were discarded — not used by this project's renderer/art style).

## 3D Models

- **Nature Kit (2.1)** — [Kenney](https://kenney.nl/assets/nature-kit), CC0. Used for: `assets/models/crops/crops_wheatStageA.glb`, `crops_wheatStageB.glb`, `assets/models/nature/*.glb` (trees, rocks, bushes, flowers, mushroom, stump, fence), and `assets/models/paths/*.glb` (path tiles).
- **Mini Characters (1.0)** — [Kenney](https://kenney.nl/assets/mini-characters), CC0. Used for: `assets/models/characters/character-male-a.glb` (player model + animations).
- **Fantasy Town Kit (2.0)** — [Kenney](https://kenney.nl/assets/fantasy-town-kit), CC0. Used for: `assets/models/buildings/windmill.glb`.
- **Stylized Nature MegaKit (Standard 1.0)** — [Quaternius](https://quaternius.com/), CC0, via the [official Godot Asset Store](https://store.godotengine.org/asset/quaternius/stylized-nature-megakit/). Used for: `assets/models/megakit/*` (trees, bush, grass, mushroom, pebbles, flower, clover) — this is the primary nature/scatter asset source now; the older Nature Kit trees/rocks/bushes/flowers/mushroom were replaced by this kit (properly scaled and correctly-colored out of the box). Nature Kit's `stump_round`/`log_stack` are still used (no MegaKit equivalent picked).

Note: Nature Kit's glTF materials ship with `metallicFactor: 1` baked in (should be 0 for these matte low-poly materials — a known export quirk in this specific kit, not present in Mini Characters/Fantasy Town/MegaKit). Worked around at runtime via `scripts/utils/prop_material_fix.gd`, which zeroes `metallic` on every Nature-Kit-sourced instance after spawning — the source `.glb` files themselves are untouched.

Checked: 2026-07-22.
