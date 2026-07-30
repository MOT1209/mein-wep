"""Render every exported GLB into a soft 2D inventory icon (PNG, alpha).

Re-imports the shipped GLB files, frames each one in an orthographic
three-quarter view, lights it with a soft three-point rig and renders it
on a transparent background straight into the Godot project.

    blender --background --factory-startup --python tools/blender/render_icons.py

Cycles on CPU is used deliberately: EEVEE needs a GL context that does not
exist in background mode, while Workbench cannot do soft shadows or the
ambient occlusion that makes these read as rounded objects rather than
flat silhouettes.
"""

import math
import os
import sys

import bpy
from mathutils import Vector

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
MODELS = os.path.join(PROJECT_ROOT, "godot", "assets", "models")
OUT_DIR = os.path.join(PROJECT_ROOT, "godot", "assets", "icons")

RESOLUTION = 256
SAMPLES = 40

# Only these get icons; big world pieces and NPCs never show in a slot.
SKIP_CATEGORIES = {"building", "creatures", "roadside"}

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ONLY = set(ARGS) if ARGS else set()


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.lights,
                  bpy.data.cameras, bpy.data.images):
        for item in list(block):
            if item.users == 0:
                try:
                    block.remove(item)
                except Exception:
                    pass


def _find_node(node_tree, type_name):
    for node in node_tree.nodes:
        if node.type == type_name:
            return node
    return None


def setup_world():
    """Neutral grey ambient so nothing renders pitch black.

    The background node is located by type: enabling `use_nodes` does not
    reliably produce a node literally named "Background" across Blender
    versions.
    """
    world = bpy.data.worlds.new("IconWorld")
    world.use_nodes = True
    tree = world.node_tree
    bg = _find_node(tree, "BACKGROUND")
    if bg is None:
        bg = tree.nodes.new("ShaderNodeBackground")
        out = _find_node(tree, "OUTPUT_WORLD")
        if out is None:
            out = tree.nodes.new("ShaderNodeOutputWorld")
        tree.links.new(bg.outputs[0], out.inputs[0])
    bg.inputs["Color"].default_value = (0.32, 0.34, 0.40, 1.0)
    bg.inputs["Strength"].default_value = 0.35
    bpy.context.scene.world = world


def add_light(name, location, energy, size, color=(1.0, 1.0, 1.0)):
    data = bpy.data.lights.new(name, type="AREA")
    data.energy = energy
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    # Aim each lamp at the origin
    direction = Vector((0.0, 0.0, 0.0)) - Vector(location)
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return obj


## Energies are tuned against the "Standard" view transform, which does no
## highlight roll-off — too much power and the palette colours clip to
## white instead of reading as wood, stone and steel.
def setup_lighting():
    add_light("Key", (2.6, -3.0, 3.4), 130.0, 4.0, (1.0, 0.96, 0.9))
    add_light("Fill", (-3.2, -1.6, 1.2), 45.0, 5.0, (0.8, 0.86, 1.0))
    add_light("Rim", (0.4, 3.4, 2.6), 70.0, 3.0, (1.0, 0.95, 0.85))


def frame_object(objs):
    """Orthographic three-quarter camera scaled to the object's bounds."""
    corners = []
    for obj in objs:
        for corner in obj.bound_box:
            corners.append(obj.matrix_world @ Vector(corner))
    lo = Vector((min(c.x for c in corners), min(c.y for c in corners),
                 min(c.z for c in corners)))
    hi = Vector((max(c.x for c in corners), max(c.y for c in corners),
                 max(c.z for c in corners)))
    centre = (lo + hi) * 0.5
    radius = max((hi - lo).length * 0.5, 0.05)

    cam_data = bpy.data.cameras.new("IconCam")
    cam_data.type = "ORTHO"
    # A little headroom so nothing touches the icon border
    cam_data.ortho_scale = radius * 2.1
    cam = bpy.data.objects.new("IconCam", cam_data)
    bpy.context.collection.objects.link(cam)

    # Classic three-quarter view: 55 deg above, 35 deg around
    elev = math.radians(32.0)
    azim = math.radians(-35.0)
    dist = radius * 6.0 + 2.0
    cam.location = centre + Vector((
        math.sin(azim) * math.cos(elev),
        -math.cos(azim) * math.cos(elev),
        math.sin(elev),
    )) * dist
    direction = centre - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam


def configure_render(path):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.render.film_transparent = True
    scene.render.resolution_x = RESOLUTION
    scene.render.resolution_y = RESOLUTION
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = path
    scene.view_settings.view_transform = "Standard"


def collect_models():
    found = []
    for category in sorted(os.listdir(MODELS)):
        cat_dir = os.path.join(MODELS, category)
        if not os.path.isdir(cat_dir) or category in SKIP_CATEGORIES:
            continue
        for name in sorted(os.listdir(cat_dir)):
            if not name.endswith(".glb"):
                continue
            item_id = name[:-4]
            if ONLY and item_id not in ONLY:
                continue
            found.append((item_id, os.path.join(cat_dir, name)))
    return found


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    targets = collect_models()
    print("Rendering %d icons at %dpx -> %s" % (len(targets), RESOLUTION, OUT_DIR))

    done = 0
    for item_id, path in targets:
        clear_scene()
        before = set(bpy.context.scene.objects)
        bpy.ops.import_scene.gltf(filepath=path)
        objs = [o for o in bpy.context.scene.objects
                if o not in before and o.type == "MESH"]
        if not objs:
            print("  [skip] %s imported nothing" % item_id)
            continue

        setup_world()
        setup_lighting()
        frame_object(objs)
        out = os.path.join(OUT_DIR, item_id + ".png")
        configure_render(out)
        bpy.ops.render.render(write_still=True)
        size = os.path.getsize(out) if os.path.exists(out) else 0
        print("  [ok] %-22s %6d B" % (item_id + ".png", size))
        done += 1

    print("Rendered %d/%d icons" % (done, len(targets)))


if __name__ == "__main__":
    main()
