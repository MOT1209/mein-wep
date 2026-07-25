# Third-Party Asset Credits

Everything in the "CC0" sections below is public domain equivalent — attribution is not required, but credited here for reference and future license audits. **The "Non-CC0" section further down breaks that pattern** and must be checked before this repo (or a build of it) is ever made public/commercial.

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

## 3D Models — Original

- **House, Barn, Silo, Well** (`assets/models/buildings/house.glb`, `barn.glb`, `silo.glb`, `well.glb`) — original from-scratch low-poly models, built via live Blender MCP control to replace the runtime-generated primitive meshes (`BoxMesh`/`CylinderMesh`/`PrismMesh`/`TorusMesh`) previously in `scripts/core/building_manager.gd`. No license caveat — not sourced from any third-party kit. Flat Principled BSDF materials only, no textures. Collision shapes in `building_manager.gd` and the barn's `OmniLight3D` were kept unchanged; only the visual mesh was replaced.

Checked: 2026-07-24.

## 3D Models — Non-CC0 (verify before public/commercial release)

These are the first non-CC0 art in the project. Unlike everything above, they must **not** be assumed freely redistributable — the note under each entry says what's actually known.

- **Sheep** (`assets/models/animals/sheep/`) — [thefree3dmodels.com](https://www.thefree3dmodels.com/), uploaded by "umar6419". No formal license text; the only accompanying note is an informal "share is love, subscribe to my YouTube channel (youtube.com/umar6419)" attribution ask. Treat as free-to-use-with-credit, not CC0. Original OBJ shipped with no `usemtl` directive (would import with no material at all) and an `.mtl` pointing at missing `images/sheep.tif` / `images/eye_a3.tif` files that weren't in the archive — fixed by writing a new single-material `sheep.mtl` pointing at the archive's actual `SHEEP.JPG` and inserting the missing `usemtl` line before the face data.
- **Duck** (`assets/models/animals/duck/`, from `Bird_v1_L2` TurboSquid product #12249) — TurboSquid Royalty-Free 3D Model License. TurboSquid's standard RF terms list "computer games" as a permitted use, so shipping this compiled into the game is fine; redistributing the raw `.obj`/`.mtl`/`.jpg` source files themselves is the restricted part, which matters if this repo (or these loose files) is ever made public — confirm the exact license page for this product ID first if that happens.
- **Cat**, **Marco Polo Sheep**, **Spider Monkey** (`assets/models/animals/cat/`, `marco_polo_sheep/`, `spider_monkey/`; TurboSquid products #12221, #13574, #12958) — same TurboSquid Royalty-Free license family and same caveat as Duck above. Used as single-instance decorative wildlife/pet (see `scripts/core/wildlife_scatter.gd`), not bred/multiplied, both because of poly cost and to keep footprint minimal.
- **Spider** (`assets/models/animals/spider/spider.fbx`) — source undocumented; the archive it came from (`31-spider.zip`) contained only the model files, no readme/license text. Verify the source before any public/commercial use.
- Bump/normal maps that shipped alongside Cat and Spider Monkey were **not** copied in or wired up — Godot's OBJ importer doesn't map MTL bump maps to a normal texture automatically, so these ship diffuse-only for now.
- A second TurboSquid Bird (#12248) is used as a second decorative bird (`assets/models/animals/bird_decor/`), same license note as above.
- **Grass tufts** (`assets/models/nature/grass_extra/grass_tuft_a.glb`, `grass_tuft_b.glb`, converted from `24-grass.rar` → `Grass.blend` via live Blender MCP control) — source undocumented, the archive contained only the `.blend` and two texture JPGs, no readme/license text. Treat like Spider above: verify before any public/commercial use. Used as a dense ground-cover layer via `scripts/core/grass_field.gd` (two `MultiMeshInstance3D`s, ~1800 blades each, alpha-scissor material) — not the sparse `nature_scatter.gd` prop set, since at that low density the two extra tufts were invisible against the 80x80 textured ground.

**Skipped this pass** (present in the original downloads, not integrated — no tooling available on this machine to convert them):
- `34-cat3d.rar` (`33eqw.skp`) — SketchUp file, no SketchUp/Blender-with-importer installed.
- `51-grass.rar` (`Grass.c4d`) — Cinema 4D file, no converter available.

Checked: 2026-07-23.
