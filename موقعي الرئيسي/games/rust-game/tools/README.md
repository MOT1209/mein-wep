# Alking.ai — Asset Pipeline

Blender generates every 3D model procedurally from Python and exports it
straight into the Godot project. No `.blend` files are kept: the scripts
*are* the source of truth, so a model change is a code change.

## Commands

```bash
BLENDER="C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"

# 1. Build the whole model batch -> godot/assets/models/**.glb
"$BLENDER" --background --factory-startup --python tools/blender/build_assets.py

# 2. Check the exported GLB files' own JSON (meshes, embedded materials)
"$BLENDER" --background --factory-startup --python tools/blender/verify_glb.py

# 3. Render a contact sheet for visual review -> tools/blender/preview.png
"$BLENDER" --background --factory-startup --python tools/blender/preview_assets.py
```

After adding **new** binary assets, Godot needs one editor import pass
before `load()` can see them (close any open editor on the project first):

```bash
GODOT="C:/Users/aihmo/Godot/Godot_v4.7.1-stable_win64.exe"
"$GODOT" --headless --editor --path godot   # kill once the log prints loading_editor_layout
"$GODOT" --headless --path godot --script res://tests/smoke_test.gd
```

## Adding a model

1. Write a `build_*()` function in `build_assets.py` using the `box` /
   `cyl` / `cone` / `rock` helpers and a colour from `PALETTE`.
2. Add it to the `BUILDERS` list.
3. Register the exported path in `godot/scripts/model_registry.gd`.
4. Re-run steps 1–3 above, then the import pass and the smoke test.

Nothing else needs to change: `structure.gd`, `resource_node.gd` and
`station.gd` all pull their visuals from `ModelRegistry`, and each falls
back to its old primitive if a model is missing.

## Conventions

| Topic | Rule |
|---|---|
| Axes | Build Z-up in Blender; the glTF exporter converts to Godot's Y-up. Blender `-Y` face becomes Godot `+Z` face. |
| Origin | Building pieces are centred (drop-in for Godot's `BoxMesh`); anything standing on the ground uses `origin_at_base=True`. |
| Scale | 3 m building grid, 1.8 m player. Building piece dimensions must match `Game.BUILDING_TYPES`. |
| Materials | Flat Principled BSDF from `PALETTE`, no textures. |
| Collision | Never taken from the mesh — Godot builds it from the declared grid size, so swapping a model can't move a hitbox. |

### Export gotchas that already bit us

- Alpha must be set on the Principled BSDF **`Alpha`** input; putting it
  in the 4th component of `Base Color` exports fully opaque.
- `material.show_transparency` does not exist in Blender 5.2.
- A shader graph the exporter cannot represent is dropped **silently** —
  hence `verify_glb.py`, which reads the GLB's own JSON rather than
  trusting the exporter's exit code.
