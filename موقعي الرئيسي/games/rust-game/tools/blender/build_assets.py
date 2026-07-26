"""Alking.ai — Blender asset pipeline for the Rust-style survival game.

Generates the whole model batch procedurally and exports one GLB per model
straight into the Godot project. Re-runnable: it always rebuilds from an
empty scene, so it never depends on a saved .blend file.

    blender --background --factory-startup --python tools/blender/build_assets.py

Conventions
-----------
* Built in Blender's Z-up space; the glTF exporter converts to Godot's
  Y-up. So local Z here becomes local Y (height) in Godot, and a detail
  placed on the Blender -Y face lands on the Godot +Z face.
* Building pieces are centred on the origin, matching Godot's BoxMesh so
  they drop straight into the existing `Game.BUILDING_TYPES` sizes.
* Everything that sits on the ground (deployables, resource nodes) has
  its origin at the base instead.
* Flat Principled BSDF colours only, no textures — matches the game's
  low-poly look and keeps the weak target GPU happy.
"""

import math
import os
import sys

import bpy

# --------------------------------------------------------------------------
# Output location
# --------------------------------------------------------------------------

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
OUT_ROOT = os.path.join(PROJECT_ROOT, "godot", "assets", "models")

# --------------------------------------------------------------------------
# Palette: (r, g, b, metallic, roughness)
# --------------------------------------------------------------------------

PALETTE = {
    "wood":        (0.55, 0.37, 0.21, 0.0, 0.85),
    "wood_dark":   (0.34, 0.22, 0.13, 0.0, 0.9),
    "wood_light":  (0.70, 0.52, 0.32, 0.0, 0.8),
    "stone":       (0.52, 0.52, 0.50, 0.0, 0.95),
    "stone_dark":  (0.36, 0.36, 0.35, 0.0, 0.95),
    "metal":       (0.60, 0.63, 0.66, 0.85, 0.35),
    "metal_dark":  (0.32, 0.34, 0.36, 0.8, 0.45),
    "rust":        (0.45, 0.26, 0.16, 0.55, 0.7),
    "concrete":    (0.68, 0.68, 0.65, 0.0, 0.9),
    "iron_ore":    (0.50, 0.53, 0.57, 0.45, 0.6),
    "sulfur_ore":  (0.90, 0.78, 0.18, 0.1, 0.55),
    "leather":     (0.42, 0.28, 0.18, 0.0, 0.8),
    "ember":       (1.00, 0.42, 0.08, 0.0, 0.5),
    "glass":       (0.55, 0.72, 0.80, 0.0, 0.15),
}

EMISSIVE = {"ember"}

_materials = {}


def mat(name):
    """Principled BSDF material from the palette, cached per scene rebuild."""
    if name in _materials:
        return _materials[name]
    r, g, b, metallic, rough = PALETTE[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (r, g, b, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = rough
    if name in EMISSIVE:
        bsdf.inputs["Emission Color"].default_value = (r, g, b, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 1.5
    _materials[name] = m
    return m


# --------------------------------------------------------------------------
# Primitive helpers
# --------------------------------------------------------------------------

def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials):
        for item in list(block):
            if item.users == 0:
                block.remove(item)
    _materials.clear()


def _finish(obj, material, rot=None):
    if rot:
        obj.rotation_euler = rot
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    else:
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat(material))
    return obj


def box(sx, sy, sz, x=0.0, y=0.0, z=0.0, material="wood", rot=None):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, y, z))
    obj = bpy.context.active_object
    obj.scale = (sx, sy, sz)
    return _finish(obj, material, rot)


def cyl(radius, depth, x=0.0, y=0.0, z=0.0, material="metal", verts=12, rot=None):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=verts, radius=radius, depth=depth, location=(x, y, z))
    return _finish(bpy.context.active_object, material, rot)


def cone(r1, r2, depth, x=0.0, y=0.0, z=0.0, material="metal", verts=12, rot=None):
    bpy.ops.mesh.primitive_cone_add(
        vertices=verts, radius1=r1, radius2=r2, depth=depth, location=(x, y, z))
    return _finish(bpy.context.active_object, material, rot)


def rock(radius, x=0.0, y=0.0, z=0.0, material="stone", seed=0):
    """Low-poly irregular boulder: an icosphere squashed and jittered."""
    import random
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=radius, location=(x, y, z))
    obj = bpy.context.active_object
    rng = random.Random(seed)
    for v in obj.data.vertices:
        v.co.x *= 1.0 + rng.uniform(-0.22, 0.22)
        v.co.y *= 1.0 + rng.uniform(-0.22, 0.22)
        v.co.z *= 1.0 + rng.uniform(-0.28, 0.14)
    return _finish(obj, material)


def export(name, category, origin_at_base=False):
    """Join everything in the scene and write one GLB."""
    objs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if not objs:
        raise RuntimeError("nothing to export for %s" % name)

    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1:
        bpy.ops.object.join()
    obj = bpy.context.active_object
    obj.name = name

    # Re-origin: centred for building pieces, on the floor for deployables
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    if origin_at_base:
        lowest = min((obj.matrix_world @ v.co).z for v in obj.data.vertices)
        obj.location.z -= lowest
        bpy.context.scene.cursor.location = (obj.location.x, obj.location.y, 0.0)
        bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
        bpy.context.scene.cursor.location = (0.0, 0.0, 0.0)
    obj.location = (0.0, 0.0, 0.0)

    out_dir = os.path.join(OUT_ROOT, category)
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, name + ".glb")

    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
    )
    dims = obj.dimensions
    print("  [ok] %-22s %6d B  blender-dims %.2f x %.2f x %.2f"
          % (name + ".glb", os.path.getsize(path), dims.x, dims.y, dims.z))
    return path


# ==========================================================================
# BUILDING PIECES  (centred on origin, Godot grid = 3 m)
# ==========================================================================

GRID = 3.0
WALL_T = 0.2


def build_foundation():
    box(GRID, GRID, 0.16, z=0.0, material="stone")
    box(GRID * 0.94, GRID * 0.94, 0.06, z=0.09, material="stone_dark")
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(0.22, 0.22, 0.2, x=sx * 1.36, y=sy * 1.36, z=-0.02, material="stone_dark")
    export("foundation", "building")


def build_wall():
    box(GRID, WALL_T, GRID, material="wood")
    # Vertical planks on the outward (-Y) face
    for i in range(4):
        x = -1.125 + i * 0.75
        box(0.68, 0.06, GRID * 0.96, x=x, y=-WALL_T / 2 - 0.02, material="wood_light")
    # Cross braces
    box(GRID * 0.98, 0.07, 0.16, z=1.2, y=-WALL_T / 2 - 0.03, material="wood_dark")
    box(GRID * 0.98, 0.07, 0.16, z=-1.2, y=-WALL_T / 2 - 0.03, material="wood_dark")
    export("wall", "building")


def _framed_opening(hole_w, hole_h, hole_z, name):
    """Wall built from posts and a lintel, leaving a rectangular opening."""
    side_w = (GRID - hole_w) / 2.0
    bottom = hole_z - hole_h / 2.0
    top = hole_z + hole_h / 2.0
    for sx in (-1, 1):
        box(side_w, WALL_T, GRID,
            x=sx * (hole_w / 2.0 + side_w / 2.0), material="wood")
    if top < GRID / 2.0:
        h = GRID / 2.0 - top
        box(hole_w, WALL_T, h, z=top + h / 2.0, material="wood")
    if bottom > -GRID / 2.0:
        h = bottom + GRID / 2.0
        box(hole_w, WALL_T, h, z=-GRID / 2.0 + h / 2.0, material="wood")
    # Frame trim around the opening
    box(hole_w + 0.16, WALL_T + 0.08, 0.1, z=top + 0.05, material="wood_dark")
    for sx in (-1, 1):
        box(0.1, WALL_T + 0.08, hole_h,
            x=sx * (hole_w / 2.0 + 0.05), z=hole_z, material="wood_dark")
    export(name, "building")


def build_doorway():
    _framed_opening(1.2, 2.1, -GRID / 2.0 + 1.05, "doorway")


def build_window_wall():
    _framed_opening(1.3, 1.1, 0.25, "window_wall")


def build_ceiling():
    box(GRID, GRID, 0.14, material="wood")
    for i in range(3):
        y = -1.0 + i * 1.0
        box(GRID * 0.98, 0.14, 0.12, y=y, z=-0.12, material="wood_dark")
    export("ceiling", "building")


def build_stairs():
    steps = 8
    rise = GRID / steps
    run = GRID / steps
    for i in range(steps):
        depth = GRID - i * run
        box(GRID, depth, rise * 0.9,
            y=GRID / 2.0 - depth / 2.0,
            z=-GRID / 2.0 + rise * i + rise / 2.0,
            material="wood" if i % 2 == 0 else "wood_light")
    export("stairs", "building")


def build_wooden_door():
    box(0.9, 0.1, 2.1, material="wood")
    for i in range(3):
        box(0.8, 0.04, 0.58, y=-0.07, z=-0.7 + i * 0.7, material="wood_light")
    for sz in (-1, 1):
        box(0.12, 0.16, 0.1, x=-0.42, y=0.0, z=sz * 0.8, material="metal_dark")
    cyl(0.05, 0.14, x=0.32, y=-0.1, z=0.0, material="metal", rot=(math.pi / 2, 0, 0))
    export("wooden_door", "building")


def build_tool_cupboard():
    box(1.0, 0.8, 1.5, z=0.75, material="wood")
    box(1.06, 0.06, 0.1, y=-0.4, z=1.45, material="wood_dark")
    # Twin doors with handles
    for sx in (-1, 1):
        box(0.46, 0.05, 1.2, x=sx * 0.25, y=-0.42, z=0.75, material="wood_light")
        cyl(0.03, 0.12, x=sx * 0.06, y=-0.47, z=0.75, material="metal", rot=(math.pi / 2, 0, 0))
    box(1.04, 0.84, 0.14, z=1.57, material="stone")
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(0.1, 0.1, 0.16, x=sx * 0.44, y=sy * 0.34, z=0.08, material="metal_dark")
    export("tool_cupboard", "building", origin_at_base=True)


# ==========================================================================
# TOOLS & WEAPONS  (origin at the grip, held ~1 m long)
# ==========================================================================

def build_rock():
    rock(0.16, seed=7, material="stone")
    export("rock", "tools", origin_at_base=True)


def _handle(length=0.9, radius=0.035, material="wood"):
    cyl(radius, length, z=length / 2.0, material=material, verts=8)


def build_stone_hatchet():
    _handle(0.85)
    box(0.05, 0.16, 0.1, z=0.8, material="leather")
    box(0.06, 0.3, 0.22, y=0.1, z=0.82, material="stone")
    box(0.03, 0.12, 0.24, y=0.26, z=0.82, material="stone_dark")
    export("stone_hatchet", "tools", origin_at_base=True)


def build_stone_pickaxe():
    _handle(0.95)
    box(0.05, 0.14, 0.1, z=0.88, material="leather")
    box(0.05, 0.62, 0.09, z=0.92, material="stone", rot=(0.18, 0, 0))
    for sy in (-1, 1):
        cone(0.07, 0.0, 0.2, y=sy * 0.36, z=0.9 + sy * 0.06,
             material="stone_dark", verts=6, rot=(sy * math.pi / 2, 0, 0))
    export("stone_pickaxe", "tools", origin_at_base=True)


def build_metal_hatchet():
    _handle(0.85, material="wood_dark")
    cyl(0.045, 0.12, z=0.78, material="rust", verts=8)
    box(0.05, 0.26, 0.24, y=0.09, z=0.84, material="metal")
    box(0.025, 0.1, 0.3, y=0.23, z=0.84, material="metal_dark")
    export("metal_hatchet", "tools", origin_at_base=True)


def build_metal_pickaxe():
    _handle(0.95, material="wood_dark")
    cyl(0.045, 0.12, z=0.86, material="rust", verts=8)
    box(0.045, 0.7, 0.08, z=0.94, material="metal", rot=(0.2, 0, 0))
    for sy in (-1, 1):
        cone(0.06, 0.0, 0.24, y=sy * 0.4, z=0.92 + sy * 0.07,
             material="metal_dark", verts=6, rot=(sy * math.pi / 2, 0, 0))
    export("metal_pickaxe", "tools", origin_at_base=True)


def build_drill():
    # Body + grip
    box(0.16, 0.34, 0.2, z=0.62, material="rust")
    box(0.13, 0.16, 0.34, y=0.08, z=0.4, material="metal_dark")
    cyl(0.05, 0.16, z=0.62, y=-0.2, material="metal", verts=10, rot=(math.pi / 2, 0, 0))
    # Auger bit
    cyl(0.035, 0.5, y=-0.5, z=0.62, material="metal", verts=10, rot=(math.pi / 2, 0, 0))
    for i in range(5):
        box(0.14, 0.05, 0.03, y=-0.35 - i * 0.09, z=0.62,
            material="metal_dark", rot=(0, 0, i * 0.7))
    cone(0.06, 0.0, 0.16, y=-0.8, z=0.62, material="metal_dark", verts=8,
         rot=(-math.pi / 2, 0, 0))
    # Motor housing
    cyl(0.09, 0.22, y=0.16, z=0.62, material="metal_dark", verts=10, rot=(math.pi / 2, 0, 0))
    export("drill", "tools", origin_at_base=True)


def build_bow():
    for sz in (-1, 1):
        box(0.04, 0.06, 0.5, y=0.08, z=sz * 0.3, material="wood_dark",
            rot=(sz * 0.35, 0, 0))
    box(0.05, 0.09, 0.3, y=0.02, material="wood")
    box(0.012, 0.012, 1.1, y=-0.12, material="wood_light")
    export("bow", "tools", origin_at_base=True)


# ==========================================================================
# DEPLOYABLES  (origin at base)
# ==========================================================================

def build_workbench_t1():
    box(1.6, 0.9, 0.1, z=0.85, material="wood_light")
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(0.12, 0.12, 0.8, x=sx * 0.7, y=sy * 0.36, z=0.4, material="wood_dark")
    box(1.5, 0.8, 0.06, z=0.35, material="wood")
    # Tools scattered on the top
    box(0.3, 0.12, 0.06, x=-0.45, y=0.2, z=0.93, material="metal_dark")
    cyl(0.07, 0.14, x=0.5, y=-0.15, z=0.97, material="rust", verts=10)
    box(0.22, 0.22, 0.1, x=0.1, y=0.25, z=0.95, material="metal")
    export("workbench_t1", "deployables", origin_at_base=True)


def build_research_table():
    box(1.2, 0.8, 0.1, z=0.8, material="wood")
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(0.1, 0.1, 0.76, x=sx * 0.5, y=sy * 0.3, z=0.38, material="wood_dark")
    # Glass hood over the research plate
    box(0.6, 0.5, 0.04, z=0.87, material="metal_dark")
    box(0.52, 0.42, 0.3, z=1.03, material="glass")
    cyl(0.06, 0.2, x=0.45, y=0.0, z=0.95, material="rust", verts=10)
    export("research_table", "deployables", origin_at_base=True)


def build_furnace():
    cone(0.62, 0.38, 1.3, z=0.65, material="stone", verts=10)
    cyl(0.4, 0.14, z=1.34, material="stone_dark", verts=10)
    box(0.34, 0.16, 0.36, y=-0.5, z=0.34, material="metal_dark")
    box(0.26, 0.06, 0.28, y=-0.57, z=0.34, material="ember")
    for i in range(3):
        cyl(0.44 - i * 0.03, 0.05, z=0.35 + i * 0.35, material="metal_dark", verts=10)
    export("furnace", "deployables", origin_at_base=True)


def _crate(w, d, h, material_body, material_trim):
    box(w, d, h, z=h / 2.0, material=material_body)
    for sz in (0.12, 0.88):
        box(w * 1.02, d * 1.02, h * 0.08, z=h * sz, material=material_trim)
    for sx in (-1, 1):
        box(w * 0.06, d * 1.03, h * 0.9, x=sx * w * 0.44, z=h / 2.0, material=material_trim)
    box(w * 0.2, d * 0.06, h * 0.12, y=-d / 2.0 - 0.01, z=h * 0.62, material="metal_dark")


def build_storage_box():
    _crate(0.9, 0.6, 0.6, "wood", "wood_dark")
    export("storage_box", "deployables", origin_at_base=True)


def build_large_box():
    _crate(1.4, 0.8, 1.0, "wood_dark", "metal_dark")
    export("large_box", "deployables", origin_at_base=True)


# ==========================================================================
# RESOURCE NODES  (origin at base)
# ==========================================================================

def _node_cluster(material, accent, seed):
    rock(0.85, z=0.45, material=material, seed=seed)
    rock(0.45, x=0.6, y=0.3, z=0.25, material=material, seed=seed + 1)
    rock(0.38, x=-0.55, y=-0.35, z=0.22, material=material, seed=seed + 2)
    for i in range(5):
        a = i * 1.257 + seed
        box(0.16, 0.16, 0.16,
            x=math.cos(a) * 0.5, y=math.sin(a) * 0.5, z=0.55 + (i % 3) * 0.16,
            material=accent, rot=(a, a * 0.5, 0))


def build_stone_node():
    _node_cluster("stone", "stone_dark", seed=11)
    export("stone_node", "resources", origin_at_base=True)


def build_metal_node():
    _node_cluster("stone_dark", "iron_ore", seed=23)
    export("metal_node", "resources", origin_at_base=True)


def build_sulfur_node():
    _node_cluster("stone_dark", "sulfur_ore", seed=37)
    export("sulfur_node", "resources", origin_at_base=True)


# ==========================================================================
# Driver
# ==========================================================================

BUILDERS = [
    build_foundation, build_wall, build_doorway, build_window_wall,
    build_ceiling, build_stairs, build_wooden_door, build_tool_cupboard,
    build_rock, build_stone_hatchet, build_stone_pickaxe,
    build_metal_hatchet, build_metal_pickaxe, build_drill, build_bow,
    build_workbench_t1, build_research_table, build_furnace,
    build_storage_box, build_large_box,
    build_stone_node, build_metal_node, build_sulfur_node,
]


def main():
    print("=" * 68)
    print("Building asset batch -> %s" % OUT_ROOT)
    print("=" * 68)
    failed = []
    for fn in BUILDERS:
        clear_scene()
        try:
            fn()
        except Exception as exc:  # keep going so one bad model can't stop the run
            failed.append((fn.__name__, str(exc)))
            print("  [FAIL] %s: %s" % (fn.__name__, exc))
    print("-" * 68)
    print("Done: %d/%d models exported" % (len(BUILDERS) - len(failed), len(BUILDERS)))
    if failed:
        for name, err in failed:
            print("  FAILED %s -> %s" % (name, err))
        sys.exit(1)


if __name__ == "__main__":
    main()
