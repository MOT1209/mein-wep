"""Render a contact sheet of every exported GLB for visual review.

Re-imports the shipped GLB files (not the build-time scene) so what gets
rendered is exactly what Godot will load.

    blender --background --factory-startup --python tools/blender/preview_assets.py

Pass a category to review one batch close up:

    blender --background --factory-startup --python tools/blender/preview_assets.py -- explosives
"""

import math
import os
import sys

import bpy

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
MODELS = os.path.join(PROJECT_ROOT, "godot", "assets", "models")

# Anything after a bare "--" belongs to this script, not to Blender
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ONLY = ARGS[0] if ARGS else ""
OUT_PNG = os.path.join(SCRIPT_DIR, "preview_%s.png" % (ONLY or "all"))

COLS = 3 if ONLY else 6
SPACING = 1.6 if ONLY else 4.0


def clear():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def main():
    clear()

    paths = []
    for category in sorted(os.listdir(MODELS)):
        if ONLY and category != ONLY:
            continue
        cat = os.path.join(MODELS, category)
        if os.path.isdir(cat):
            for name in sorted(os.listdir(cat)):
                if name.endswith(".glb"):
                    paths.append(os.path.join(cat, name))

    placed = 0
    for path in paths:
        before = set(bpy.context.scene.objects)
        bpy.ops.import_scene.gltf(filepath=path)
        new = [o for o in bpy.context.scene.objects if o not in before and o.type == "MESH"]
        if not new:
            print("  [warn] nothing imported from %s" % path)
            continue
        col = placed % COLS
        row = placed // COLS
        for obj in new:
            obj.location.x += col * SPACING - (COLS - 1) * SPACING / 2.0
            obj.location.y += -row * SPACING
            # Drop each model onto a common floor line so they read as a row
            low = min((obj.matrix_world @ v.co).z for v in obj.data.vertices)
            obj.location.z -= low
        placed += 1

    rows = math.ceil(placed / COLS)

    # Aim the camera at the middle of the grid, then back it off along the
    # view direction so the framing holds for any batch size.
    tilt = math.radians(64)
    view_dir = (0.0, math.sin(tilt), -math.cos(tilt))
    target = (0.0, -(rows - 1) * SPACING / 2.0, SPACING * 0.15)
    distance = 30.0
    bpy.ops.object.camera_add(location=(
        target[0] - view_dir[0] * distance,
        target[1] - view_dir[1] * distance,
        target[2] - view_dir[2] * distance,
    ))
    cam = bpy.context.active_object
    cam.rotation_euler = (tilt, 0, 0)
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = max(COLS, rows) * SPACING * 1.25 + SPACING
    bpy.context.scene.camera = cam

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    scene.display.shading.show_shadows = True
    scene.render.resolution_x = 1400
    scene.render.resolution_y = 900
    scene.render.filepath = OUT_PNG
    bpy.ops.render.render(write_still=True)
    print("Rendered %d models -> %s" % (placed, OUT_PNG))


if __name__ == "__main__":
    main()
