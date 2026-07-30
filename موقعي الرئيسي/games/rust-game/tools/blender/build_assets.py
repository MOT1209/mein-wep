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
import random
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
    "explosive":   (0.78, 0.66, 0.42, 0.0, 0.7),
    "olive":       (0.28, 0.32, 0.19, 0.1, 0.65),
    "wire_red":    (0.72, 0.14, 0.12, 0.0, 0.5),
    "warning":     (0.92, 0.72, 0.10, 0.0, 0.5),
    "paper":       (0.86, 0.83, 0.72, 0.0, 0.85),
    "blueprint":   (0.20, 0.42, 0.62, 0.0, 0.7),
    "gauze":       (0.94, 0.93, 0.90, 0.0, 0.9),
    "medical":     (0.78, 0.16, 0.16, 0.0, 0.6),
    "fabric":      (0.72, 0.68, 0.58, 0.0, 0.9),
    "gunmetal":    (0.22, 0.23, 0.25, 0.75, 0.35),
    "brass":       (0.72, 0.55, 0.22, 0.8, 0.3),
    "bark":        (0.42, 0.29, 0.17, 0.0, 0.95),
    # Hand-made gear: the bindings and wear that separate a survival tool
    # from a clean factory one.
    "rope":        (0.72, 0.62, 0.42, 0.0, 0.95),
    "char":        (0.12, 0.10, 0.09, 0.0, 0.95),
    "flame":       (1.00, 0.62, 0.16, 0.0, 0.4),
    "steel_worn":  (0.46, 0.48, 0.51, 0.8, 0.5),
    "mud":         (0.30, 0.24, 0.16, 0.0, 0.95),
    # Creatures — matched to npc.gd's TYPES colours so the model reads as
    # the same animal the old flat-coloured box stood in for.
    "wolf_fur":       (0.365, 0.251, 0.216, 0.0, 0.9),
    "wolf_fur_dark":  (0.20, 0.14, 0.12, 0.0, 0.9),
    "bear_fur":       (0.243, 0.153, 0.137, 0.0, 0.95),
    "bear_fur_dark":  (0.14, 0.09, 0.08, 0.0, 0.95),
    "deer_hide":      (0.757, 0.604, 0.420, 0.0, 0.85),
    "deer_hide_dark": (0.55, 0.42, 0.28, 0.0, 0.85),
    "boar_hide":      (0.376, 0.290, 0.227, 0.0, 0.95),
    "boar_hide_dark": (0.22, 0.17, 0.13, 0.0, 0.95),
    "bristle":        (0.16, 0.13, 0.11, 0.0, 1.0),
    "tusk":           (0.88, 0.85, 0.74, 0.0, 0.55),
    "antler":         (0.80, 0.76, 0.66, 0.0, 0.7),
    "hoof":           (0.20, 0.18, 0.16, 0.0, 0.6),
    "eye":            (0.05, 0.04, 0.04, 0.0, 0.25),
    "suit":           (0.149, 0.329, 0.486, 0.0, 0.55),
    "suit_dark":      (0.09, 0.20, 0.30, 0.0, 0.6),
    # Small game, matched to npc.gd's TYPES colours like the rest
    "rabbit_fur":       (0.776, 0.706, 0.627, 0.0, 0.9),
    "rabbit_fur_dark":  (0.55, 0.48, 0.41, 0.0, 0.9),
    "hen_feather":      (0.961, 0.941, 0.902, 0.0, 0.85),
    "hen_feather_dark": (0.78, 0.75, 0.70, 0.0, 0.85),
    "comb":             (0.80, 0.18, 0.16, 0.0, 0.6),
    "beak":             (0.90, 0.72, 0.25, 0.0, 0.6),
    # Machinery: the salvaged-electrical look of a wired base
    "solar":         (0.07, 0.11, 0.26, 0.35, 0.18),
    "solar_cell":    (0.11, 0.17, 0.36, 0.35, 0.22),
    "plastic_black": (0.10, 0.10, 0.11, 0.0, 0.45),
    "plastic_white": (0.86, 0.86, 0.84, 0.0, 0.5),
    "copper":        (0.72, 0.42, 0.20, 0.85, 0.3),
    "orange_paint":  (0.86, 0.36, 0.06, 0.0, 0.5),
    "led_green":     (0.25, 0.95, 0.35, 0.0, 0.3),
    "led_red":       (0.95, 0.20, 0.15, 0.0, 0.3),
    "arc":           (0.62, 0.86, 1.00, 0.0, 0.2),
}

## Anything here glows: fire, and the status lights that tell you at a glance
## whether a circuit is feeding the thing in front of you.
EMISSIVE = {"ember", "flame", "led_green", "led_red", "arc"}

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
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=radius, location=(x, y, z))
    obj = bpy.context.active_object
    rng = random.Random(seed)
    for v in obj.data.vertices:
        v.co.x *= 1.0 + rng.uniform(-0.22, 0.22)
        v.co.y *= 1.0 + rng.uniform(-0.22, 0.22)
        v.co.z *= 1.0 + rng.uniform(-0.28, 0.14)
    return _finish(obj, material)


# --------------------------------------------------------------------------
# Hand-made detail: the three things that separate a survival tool from a
# clean primitive — a binding that holds it together, a struck stone edge,
# and the marks of use.
# --------------------------------------------------------------------------

def wrap(start, end, radius, material="rope", turns=5, axis="z", pos=(0.0, 0.0)):
    """Cord coiled around a shaft, as a stack of short fat rings.

    `start`/`end` run along the shaft's own axis; `axis` says which world
    axis that is, so the same call binds an upright axe handle or a
    shotgun's horizontal barrel. `pos` gives the two remaining coordinates
    in XYZ order — (x, y) for a Z shaft, (x, z) for a Y shaft, (y, z) for X.
    """
    span = end - start
    if turns < 1 or span <= 0.0:
        return
    pitch = span / turns
    rot = {"z": None, "y": (math.pi / 2, 0, 0), "x": (0, math.pi / 2, 0)}[axis]
    for i in range(turns):
        along = start + pitch * (i + 0.5)
        at = {"z": (pos[0], pos[1], along),
              "y": (pos[0], along, pos[1]),
              "x": (along, pos[0], pos[1])}[axis]
        cyl(radius * 1.22, pitch * 0.72, x=at[0], y=at[1], z=at[2],
            material=material, verts=8, rot=rot)


def knapped(w, l, h, x=0.0, y=0.0, z=0.0, material="stone",
            chip="stone_dark", flakes=4, seed=0, rot=None):
    """A struck stone head: a core block with flakes broken off its edge,
    so the cutting edge reads as chipped rather than sawn."""
    box(w, l, h, x=x, y=y, z=z, material=material, rot=rot)
    rng = random.Random(seed)
    for i in range(flakes):
        t = (i + 0.5) / flakes - 0.5
        box(w * rng.uniform(0.5, 0.9), l * rng.uniform(0.14, 0.26), h * 0.36,
            x=x, y=y + l * 0.42, z=z + h * t * 1.5,
            material=chip, rot=(rng.uniform(-0.4, 0.4), 0, rng.uniform(-0.3, 0.3)))


def wear(w, h, x=0.0, y=0.0, z=0.0, count=4, seed=0, material="metal_dark",
         thickness=0.005, normal="y", rot=None):
    """Gouges scattered across one flat face — the marks a steel head picks
    up from every rock it has been swung into. `normal` is the axis the
    face points down, so `w` spans whichever of X/Y is left over."""
    rng = random.Random(seed)
    for _ in range(count):
        gw = w * rng.uniform(0.25, 0.65)
        gh = h * rng.uniform(0.05, 0.12)
        ow = rng.uniform(-0.3, 0.3) * w
        oz = rng.uniform(-0.4, 0.4) * h
        if normal == "x":
            box(thickness, gw, gh, x=x, y=y + ow, z=z + oz, material=material, rot=rot)
        else:
            box(gw, thickness, gh, x=x + ow, y=y, z=z + oz, material=material, rot=rot)


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
    """Plank deck laid over joists on stone footings — you can see what is
    holding the floor up, which is the point once stability can drop it."""
    box(GRID, GRID, 0.1, z=-0.03, material="stone")
    # Joists running under the deck
    for i in range(4):
        box(GRID * 0.98, 0.14, 0.09, y=-1.1 + i * 0.73, z=0.03,
            material="wood_dark")
    # Deck boards with visible gaps between them
    for i in range(7):
        box(GRID * 0.97, 0.36, 0.07, y=-1.29 + i * 0.43, z=0.095,
            material="wood" if i % 2 == 0 else "wood_light")
    # Corner footings
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(0.26, 0.26, 0.22, x=sx * 1.34, y=sy * 1.34, z=-0.04,
                material="stone_dark")
    export("foundation", "building")


def build_wall():
    """Salvaged boards nailed across a frame: staggered heights, knots and
    nail heads, and a top rail that has taken the weather."""
    box(GRID, WALL_T, GRID, material="wood_dark")
    face = -WALL_T / 2 - 0.02
    rng = random.Random(4)
    for i in range(6):
        x = -1.25 + i * 0.5
        h = GRID * rng.uniform(0.9, 0.98)
        box(0.44, 0.06, h, x=x, y=face, z=(GRID - h) * 0.5 * rng.choice((-1, 1)),
            material="wood" if i % 2 == 0 else "wood_light")
        # Knot in the grain
        box(0.07, 0.02, 0.07, x=x + rng.uniform(-0.12, 0.12), y=face - 0.03,
            z=rng.uniform(-1.2, 1.2), material="wood_dark")
        # Nails, top and bottom
        for nz in (1.2, -1.2):
            box(0.035, 0.02, 0.035, x=x, y=face - 0.04, z=nz, material="metal_dark")
    # Rails the boards are nailed to
    box(GRID * 0.98, 0.08, 0.18, z=1.24, y=face - 0.02, material="wood_dark")
    box(GRID * 0.98, 0.08, 0.16, z=-1.26, y=face - 0.02, material="wood_dark")
    export("wall", "building")


def build_stone_wall():
    """Stone-tier wall: mortared rubble courses, no planks in sight."""
    box(GRID, WALL_T, GRID, material="stone_dark")
    rng = random.Random(12)
    for course in range(6):
        z = -1.25 + course * 0.5
        # Offset every other course so the joints stagger like real coursing
        offset = 0.0 if course % 2 == 0 else 0.24
        for i in range(6):
            x = -1.2 + i * 0.48 + offset
            if x > 1.3:
                continue
            rock(rng.uniform(0.2, 0.28), x=x, y=-WALL_T / 2 - 0.03,
                 z=z + rng.uniform(-0.03, 0.03),
                 material="stone" if (i + course) % 3 else "stone_dark",
                 seed=course * 10 + i)
    box(GRID * 0.99, WALL_T + 0.1, 0.14, z=1.42, material="stone_dark")
    export("stone_wall", "building")


def build_stone_foundation():
    """Stone-tier foundation: a slab on a rubble plinth."""
    box(GRID, GRID, 0.12, z=-0.02, material="stone_dark")
    box(GRID * 0.96, GRID * 0.96, 0.08, z=0.08, material="stone")
    rng = random.Random(21)
    for i in range(10):
        a = i * (math.tau / 10.0)
        rock(rng.uniform(0.16, 0.24), x=math.cos(a) * 1.36,
             y=math.sin(a) * 1.36, z=-0.02, material="stone_dark", seed=i)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(0.3, 0.3, 0.2, x=sx * 1.32, y=sy * 1.32, z=-0.05,
                material="concrete")
    export("stone_foundation", "building")


def build_metal_door():
    """Sheet-metal door: riveted plate, rust streaks, a viewing slit and
    the heavy hinges that make it worth blowing up rather than picking."""
    box(0.9, 0.1, 2.1, material="metal_dark")
    box(0.84, 0.05, 2.02, y=-0.06, material="steel_worn")
    # Reinforcing bands
    for bz in (-0.72, 0.0, 0.72):
        box(0.88, 0.05, 0.16, y=-0.085, z=bz, material="metal_dark")
        for sx in (-1, 1):
            box(0.05, 0.03, 0.05, x=sx * 0.34, y=-0.11, z=bz, material="rust")
    # Rivets down both edges
    for i in range(9):
        for sx in (-1, 1):
            box(0.04, 0.03, 0.04, x=sx * 0.38, y=-0.09, z=-0.9 + i * 0.225,
                material="metal")
    # Viewing slit
    box(0.34, 0.06, 0.09, y=-0.09, z=0.62, material="char")
    box(0.38, 0.03, 0.13, y=-0.11, z=0.62, material="metal_dark")
    wear(0.8, 1.9, y=-0.09, count=7, seed=57, material="rust", thickness=0.012)
    # Hinges and handle
    for sz in (-1, 1):
        box(0.16, 0.2, 0.14, x=-0.42, z=sz * 0.82, material="rust")
    cyl(0.05, 0.16, x=0.32, y=-0.12, material="steel_worn",
        rot=(math.pi / 2, 0, 0))
    export("metal_door", "building")


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


def build_triangle_foundation():
    """Half a tile, cut on the diagonal. The deck boards run the short way
    and each one is shorter than the last, which is how a real triangular
    deck is laid and makes the cut read from above without a texture.

    Godot fills the half on its +X side of the diagonal. Blender -Y is
    Godot +Z, so that same half is `y >= -x` here: a board at x spans from
    y = -x up to the +Y edge.
    """
    half = GRID / 2.0
    # Joists following the hypotenuse, under the deck
    for i in range(4):
        x = -half + 0.45 + i * 0.72
        length = half + x
        if length <= 0.1:
            continue
        box(0.13, length * 0.96, 0.09, x=x, y=(half - x) / 2.0, z=0.03,
            material="wood_dark")
    # Deck boards, each cut to the diagonal
    for i in range(7):
        x = -half + 0.28 + i * 0.42
        length = half + x
        if length <= 0.1:
            continue
        box(0.36, length, 0.07, x=x, y=(half - x) / 2.0, z=0.095,
            material="wood" if i % 2 == 0 else "wood_light")
    # Rim beam along the cut face, so the hypotenuse is a built edge
    box(0.16, GRID * 1.36, 0.16, z=0.04, rot=(0, 0, -math.pi / 4),
        material="wood_dark")
    # Footings on the three corners that exist
    for cx, cy in ((half - 0.2, half - 0.2), (half - 0.2, -half + 0.2),
                   (-half + 0.2, half - 0.2)):
        box(0.24, 0.24, 0.22, x=cx, y=cy, z=-0.04, material="stone_dark")
    export("triangle_foundation", "building")


def _board_wall(height, name, rails=True):
    """A wall of salvaged boards at an arbitrary height — the full wall's
    construction, scaled down for the half and low variants."""
    box(GRID, WALL_T, height, material="wood_dark")
    face = -WALL_T / 2 - 0.02
    rng = random.Random(int(height * 100))
    for i in range(6):
        x = -1.25 + i * 0.5
        h = height * rng.uniform(0.88, 0.97)
        box(0.44, 0.06, h, x=x, y=face, z=(height - h) * 0.5 * rng.choice((-1, 1)),
            material="wood" if i % 2 == 0 else "wood_light")
        box(0.035, 0.02, 0.035, x=x, y=face - 0.04,
            z=height * 0.32, material="metal_dark")
    if rails:
        box(GRID * 0.98, 0.08, 0.14, z=height / 2.0 - 0.1, y=face - 0.02,
            material="wood_dark")
    # Capping rail across the top: a wall you can see over wants a finished
    # edge to lean on rather than a sawn-off stack of planks. Kept to the
    # same 8 cm proud of the declared thickness that every other piece sits
    # at, so a half wall is no fatter than a full one.
    box(GRID * 0.99, WALL_T + 0.06, 0.12, z=height / 2.0 + 0.02,
        material="wood_dark")
    export(name, "building")


def build_half_wall():
    _board_wall(1.5, "half_wall")


def build_low_wall():
    _board_wall(0.9, "low_wall", rails=False)


def build_pillar():
    """Squared post on a stone pad with a bracket cap — it has to look like
    it is carrying something, because that is exactly what it does."""
    box(0.34, 0.34, GRID * 0.9, z=0.02, material="wood")
    # Grain: two darker faces so the post is not one flat colour
    for sy in (-1, 1):
        box(0.3, 0.03, GRID * 0.86, y=sy * 0.175, material="wood_dark")
    # Iron straps at three heights
    for z in (-1.1, 0.0, 1.1):
        box(0.38, 0.38, 0.07, z=z, material="metal_dark")
    # Stone pad at the foot and a bracket cap at the head
    box(0.5, 0.5, 0.16, z=-GRID / 2.0 + 0.08, material="stone")
    box(0.46, 0.46, 0.12, z=GRID / 2.0 - 0.06, material="wood_dark")
    for sx in (-1, 1):
        box(0.08, 0.3, 0.34, x=sx * 0.2, z=GRID / 2.0 - 0.3, material="metal_dark")
    export("pillar", "building")


def build_roof():
    """Pitched roof: rafters under overlapping shingle courses, climbing to a
    capped ridge. Godot slopes it up towards +Z, and Blender -Y is Godot +Z,
    so the ridge sits at -Y here and the eaves at +Y."""
    half = GRID / 2.0
    rise = 1.5
    # Everything on a pitched roof is laid along the slope, not along the
    # floor, so it is measured that way: a board of the slope's own length,
    # centred on the slope's midpoint and tilted to its angle, spans exactly
    # the wedge's rise and no more. Laying them out by floor position instead
    # made the model half again as tall as the 1.5 m piece it stands for.
    slope = math.hypot(GRID, rise)
    angle = math.atan2(rise, GRID)
    cos_t = GRID / slope
    sin_t = rise / slope

    # Rafters running up the slope
    for i in range(5):
        box(0.1, slope * 0.94, 0.1, x=-1.2 + i * 0.6, rot=(angle, 0, 0),
            material="wood_dark")
    # Shingle courses, each overlapping the one below. The outermost courses
    # stop half their own length short of the ends, so the run of them
    # finishes flush with the wedge instead of overhanging it.
    courses = 7
    clen = slope / courses * 1.15
    smax = slope / 2.0 - clen / 2.0
    for i in range(courses):
        s = (-1.0 + 2.0 * i / (courses - 1)) * smax
        box(GRID * 0.99, clen, 0.06, y=-s * cos_t, z=s * sin_t,
            rot=(angle, 0, 0),
            material="wood" if i % 2 == 0 else "wood_light")
    # Ridge cap and a gutter board at the eaves
    box(GRID * 0.99, 0.18, 0.11, y=-half + 0.07, z=rise / 2.0 - 0.06,
        material="wood_dark")
    box(GRID * 0.99, 0.12, 0.14, y=half - 0.05, z=-rise / 2.0 + 0.07,
        material="wood_dark")
    export("roof", "building")


def build_ladder():
    """Two rails and round rungs, braced off the wall it is pinned to."""
    for sx in (-1, 1):
        box(0.1, 0.1, GRID, x=sx * 0.4, material="wood")
    for i in range(9):
        cyl(0.035, 0.78, z=-GRID / 2.0 + 0.24 + i * 0.32,
            material="wood_light", verts=8, rot=(0, math.pi / 2, 0))
    # Stand-off brackets that hold it clear of the wall face
    for z in (-1.2, 0.0, 1.2):
        for sx in (-1, 1):
            box(0.06, 0.12, 0.06, x=sx * 0.4, y=0.05, z=z, material="metal_dark")
    export("ladder", "building")


def build_barricade():
    """Timber frame, crossed planks and coiled barbed wire. The wire is what
    it is for, so it has to be the thing you notice."""
    # Frame: two uprights and a top rail
    for sx in (-1, 1):
        box(0.14, 0.4, 1.3, x=sx * 1.4, material="wood_dark")
    box(GRID * 0.99, 0.16, 0.14, z=0.58, material="wood_dark")
    # Crossed planks
    for sign in (-1, 1):
        box(GRID * 1.02, 0.09, 0.28, z=-0.1,
            rot=(0, sign * 0.42, 0), material="wood")
    # Angled props at the back so it stands into a charge
    for sx in (-1, 1):
        box(0.1, 0.7, 0.1, x=sx * 1.1, y=0.18, z=-0.4,
            rot=(0.7, 0, 0), material="wood_dark")
    # Barbed wire: coils along the top with barbs struck through them
    rng = random.Random(9)
    for i in range(11):
        x = -1.35 + i * 0.27
        cyl(0.11, 0.05, x=x, z=0.66, material="metal_dark", verts=8,
            rot=(0, math.pi / 2, 0))
        for j in range(2):
            a = rng.uniform(0, math.pi)
            box(0.015, 0.11, 0.015, x=x, z=0.66,
                rot=(a, 0, rng.uniform(-0.5, 0.5)), material="steel_worn")
    export("barricade", "building", origin_at_base=False)


def build_garage_door():
    """Rolling slat door on a lift track: the slats and the chain drive are
    the whole reason it reads as something that goes up, not sideways."""
    span = 2.6
    slats = 7
    for i in range(slats):
        z = -span / 2.0 + span / slats * (i + 0.5)
        box(span * 0.98, 0.1, span / slats * 0.86, z=z,
            material="metal" if i % 2 == 0 else "steel_worn")
        # Ribbed pressing across each slat
        box(span * 0.9, 0.04, span / slats * 0.3, y=-0.06, z=z,
            material="metal_dark")
    # Vertical tracks the slats run in
    for sx in (-1, 1):
        box(0.1, 0.22, span, x=sx * (span / 2.0 - 0.02), material="metal_dark")
    # Chain drive and sprocket up one side
    cyl(0.11, 0.06, x=-span / 2.0 + 0.06, z=span / 2.0 - 0.12,
        material="steel_worn", verts=10, rot=(0, math.pi / 2, 0))
    for i in range(8):
        box(0.03, 0.03, 0.07, x=-span / 2.0 + 0.06, y=-0.1,
            z=span / 2.0 - 0.2 - i * 0.16, material="metal_dark")
    # Handle across the bottom slat
    box(0.5, 0.07, 0.07, y=-0.1, z=-span / 2.0 + 0.14, material="metal_dark")
    export("garage_door", "building")


# ==========================================================================
# TOOLS & WEAPONS  (origin at the grip, held ~1 m long)
# ==========================================================================

def build_rock():
    rock(0.16, seed=7, material="stone")
    export("rock", "tools", origin_at_base=True)


def _handle(length=0.9, radius=0.035, material="wood", dark="wood_dark",
            segments=5, taper=0.86):
    """Shaft stacked from alternating segments so it reads as grain rather
    than one flat cylinder, thinning towards the head."""
    seg = length / segments
    for i in range(segments):
        t = i / max(segments - 1, 1)
        cyl(radius * (1.0 - (1.0 - taper) * t), seg * 1.04,
            z=seg * (i + 0.5), material=material if i % 2 == 0 else dark,
            verts=8)


def build_stone_hatchet():
    """Struck stone bound to a rope-wrapped shaft with a leather thong."""
    _handle(0.85)
    wrap(0.05, 0.34, 0.035, material="rope", turns=7)
    box(0.05, 0.16, 0.1, z=0.8, material="leather")
    knapped(0.06, 0.3, 0.22, y=0.1, z=0.82, flakes=4, seed=3)
    box(0.03, 0.12, 0.24, y=0.26, z=0.82, material="stone_dark")
    # Lashing that actually holds the head to the shaft
    wrap(0.71, 0.93, 0.048, material="leather", turns=4)
    export("stone_hatchet", "tools", origin_at_base=True)


def build_stone_pickaxe():
    _handle(0.95)
    wrap(0.05, 0.36, 0.035, material="rope", turns=7)
    box(0.05, 0.14, 0.1, z=0.88, material="leather")
    knapped(0.05, 0.62, 0.09, z=0.92, flakes=5, seed=5, rot=(0.18, 0, 0))
    for sy in (-1, 1):
        cone(0.07, 0.0, 0.2, y=sy * 0.36, z=0.9 + sy * 0.06,
             material="stone_dark", verts=6, rot=(sy * math.pi / 2, 0, 0))
    wrap(0.8, 0.98, 0.046, material="leather", turns=3)
    export("stone_pickaxe", "tools", origin_at_base=True)


def build_metal_hatchet():
    _handle(0.85, material="wood_dark", dark="wood")
    wrap(0.05, 0.3, 0.035, material="leather", turns=6)
    cyl(0.045, 0.12, z=0.78, material="rust", verts=8)
    box(0.05, 0.26, 0.24, y=0.09, z=0.84, material="steel_worn")
    wear(0.22, 0.22, x=0.026, y=0.09, z=0.84, count=4, seed=17, normal="x")
    box(0.025, 0.1, 0.3, y=0.23, z=0.84, material="metal_dark")
    export("metal_hatchet", "tools", origin_at_base=True)


def build_metal_pickaxe():
    """Worn steel head, scratched from use, wedged onto a wooden shaft."""
    _handle(0.95, material="wood_dark", dark="wood")
    wrap(0.05, 0.34, 0.035, material="leather", turns=7)
    cyl(0.045, 0.12, z=0.86, material="rust", verts=8)
    box(0.045, 0.7, 0.08, z=0.94, material="steel_worn", rot=(0.2, 0, 0))
    wear(0.6, 0.08, x=0.024, z=0.94, count=6, seed=23, normal="x",
         rot=(0.2, 0, 0))
    # Asymmetric ends: one point for rock, one chisel for prying
    cone(0.06, 0.0, 0.28, y=-0.4, z=0.85, material="metal_dark", verts=6,
         rot=(-math.pi / 2, 0, 0))
    box(0.04, 0.16, 0.11, y=0.42, z=1.02, material="metal_dark",
        rot=(0.2, 0, 0))
    export("metal_pickaxe", "tools", origin_at_base=True)


def build_torch():
    """Burning branch: charred head, oiled rag binding and a live flame.

    The flame is emissive so it reads as a light source in the inventory
    icon, matching the torch light `player.gd` already turns on when this
    is the active belt item.
    """
    _handle(0.62, 0.03, material="wood_dark", dark="char", segments=4, taper=1.0)
    wrap(0.06, 0.24, 0.03, material="rope", turns=5)
    # Oil-soaked rag bundled at the head
    box(0.1, 0.1, 0.16, z=0.66, material="fabric")
    wrap(0.58, 0.74, 0.06, material="leather", turns=3)
    cyl(0.055, 0.1, z=0.78, material="char", verts=8)
    # Flame: two nested cones plus an ember core
    cone(0.09, 0.0, 0.26, z=0.94, material="flame", verts=8)
    cone(0.05, 0.0, 0.16, z=0.89, material="ember", verts=6)
    export("torch", "tools", origin_at_base=True)


def build_spear():
    """Fire-hardened shaft, knapped stone point, leather bindings."""
    _handle(1.7, 0.028, material="wood", dark="wood_light", segments=7,
            taper=0.92)
    wrap(0.5, 0.78, 0.027, material="rope", turns=7)
    # Socket the point sits in
    cyl(0.038, 0.1, z=1.7, material="char", verts=8)
    knapped(0.035, 0.09, 0.3, z=1.88, flakes=4, seed=9)
    cone(0.05, 0.0, 0.16, z=2.09, material="stone_dark", verts=6)
    wrap(1.66, 1.82, 0.04, material="leather", turns=3)
    export("spear", "tools", origin_at_base=True)


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


def build_chainsaw():
    """Two-stroke body, wrap handle and a toothed bar. The chain is what you
    are buying, so the bar runs long and the teeth are individually cut."""
    # Engine body and pull-start cover
    box(0.2, 0.34, 0.24, z=0.62, material="orange_paint")
    cyl(0.1, 0.1, x=0.11, z=0.62, material="plastic_black", verts=12,
        rot=(0, math.pi / 2, 0))
    cyl(0.03, 0.03, x=0.17, z=0.62, material="metal_dark", verts=8,
        rot=(0, math.pi / 2, 0))
    # Fuel cap and air filter
    cyl(0.04, 0.04, y=0.14, z=0.76, material="plastic_black", verts=8)
    box(0.14, 0.1, 0.1, y=0.16, z=0.66, material="plastic_black")
    # Wrap handle over the top, and the rear grip with its trigger
    box(0.24, 0.04, 0.04, z=0.82, material="plastic_black")
    for sx in (-1, 1):
        box(0.04, 0.04, 0.18, x=sx * 0.1, z=0.73, material="plastic_black")
    box(0.09, 0.2, 0.07, y=0.24, z=0.56, material="plastic_black")
    box(0.05, 0.06, 0.02, y=0.19, z=0.52, material="metal_dark")
    # Hand guard
    box(0.22, 0.03, 0.03, y=-0.13, z=0.8, rot=(0.4, 0, 0),
        material="plastic_black")
    # Cutting bar, with a rounded nose
    box(0.04, 0.62, 0.1, y=-0.5, z=0.62, material="steel_worn")
    cyl(0.05, 0.038, y=-0.8, z=0.62, material="steel_worn", verts=10,
        rot=(0, math.pi / 2, 0))
    # Chain teeth along both edges of the bar
    for i in range(11):
        y = -0.24 - i * 0.052
        for sz in (-1, 1):
            box(0.05, 0.028, 0.026, y=y, z=0.62 + sz * 0.06,
                rot=(0, 0, 0.3 * sz), material="gunmetal")
    # Sprocket cover where the chain drives
    box(0.06, 0.12, 0.14, y=-0.2, z=0.6, material="orange_paint")
    export("chainsaw", "tools", origin_at_base=True)


def build_jackhammer():
    """Pneumatic breaker: twin grips, a body under pressure and a chisel bit
    that has been driven into a lot of concrete."""
    # Body and its cooling ribs
    cyl(0.09, 0.5, z=0.72, material="warning", verts=12)
    for i in range(4):
        cyl(0.1, 0.03, z=0.56 + i * 0.11, material="metal_dark", verts=12)
    # Air line coupling and hose stub
    cyl(0.035, 0.12, x=0.1, z=0.92, material="metal_dark", verts=8,
        rot=(0, math.pi / 2, 0))
    cyl(0.028, 0.18, x=0.2, z=0.88, material="char", verts=8,
        rot=(0, 0.7, 0))
    # T-bar grips with a throttle lever between them
    box(0.44, 0.05, 0.05, z=1.0, material="metal_dark")
    for sx in (-1, 1):
        cyl(0.035, 0.14, x=sx * 0.2, z=1.0, material="plastic_black", verts=10,
            rot=(0, math.pi / 2, 0))
    box(0.1, 0.04, 0.03, y=-0.06, z=0.96, material="steel_worn")
    # Chuck and the chisel bit
    cyl(0.07, 0.1, z=0.44, material="metal_dark", verts=10)
    cyl(0.045, 0.34, z=0.26, material="steel_worn", verts=8)
    box(0.09, 0.03, 0.14, z=0.06, material="gunmetal")
    wear(0.08, 0.12, z=0.1, count=5, seed=6, normal="y", material="metal_dark")
    export("jackhammer", "tools", origin_at_base=True)


def build_repair_tool():
    """Part gun, part soldering iron: a nozzle, a spool of filler and a gauge
    that tells you what condition you are putting back."""
    # Grip and body
    box(0.09, 0.14, 0.22, y=0.1, z=0.5, material="plastic_black")
    box(0.13, 0.3, 0.16, z=0.7, material="metal")
    # Filler spool on the side
    cyl(0.09, 0.05, x=0.1, z=0.72, material="copper", verts=14,
        rot=(0, math.pi / 2, 0))
    cyl(0.03, 0.06, x=0.12, z=0.72, material="metal_dark", verts=8,
        rot=(0, math.pi / 2, 0))
    # Gauge on top
    cyl(0.045, 0.03, z=0.8, material="glass", verts=12)
    box(0.03, 0.01, 0.01, z=0.82, rot=(0, 0, 0.6), material="medical")
    # Nozzle out the front with a hot tip
    cyl(0.035, 0.18, y=-0.22, z=0.7, material="steel_worn", verts=10,
        rot=(math.pi / 2, 0, 0))
    cone(0.035, 0.012, 0.1, y=-0.35, z=0.7, material="ember", verts=8,
         rot=(-math.pi / 2, 0, 0))
    # Trigger
    box(0.04, 0.05, 0.02, y=0.03, z=0.56, material="metal_dark")
    export("repair_tool", "tools", origin_at_base=True)


def build_binoculars():
    """Twin barrels bridged by a focus wheel, with a neck strap."""
    for sx in (-1, 1):
        cyl(0.055, 0.24, x=sx * 0.065, z=0.6, material="plastic_black",
            verts=12, rot=(math.pi / 2, 0, 0))
        # Objective and eyepiece glass
        cyl(0.05, 0.02, x=sx * 0.065, y=-0.13, z=0.6, material="glass",
            verts=12, rot=(math.pi / 2, 0, 0))
        cyl(0.035, 0.05, x=sx * 0.065, y=0.14, z=0.6, material="leather",
            verts=10, rot=(math.pi / 2, 0, 0))
        # Rubber armour ring
        cyl(0.06, 0.05, x=sx * 0.065, y=-0.04, z=0.6, material="char", verts=12,
            rot=(math.pi / 2, 0, 0))
    # Bridge and the focus wheel between the barrels
    box(0.08, 0.1, 0.05, z=0.6, material="plastic_black")
    cyl(0.03, 0.07, z=0.6, material="metal_dark", verts=10,
        rot=(0, math.pi / 2, 0))
    # Strap lugs and a length of strap looping down
    for sx in (-1, 1):
        box(0.02, 0.03, 0.03, x=sx * 0.12, y=0.06, z=0.64,
            material="metal_dark")
    for i in range(5):
        box(0.02, 0.02, 0.09, x=-0.12 + i * 0.06, y=0.08,
            z=0.5 - abs(i - 2) * 0.03, rot=(0, 0.4 * (i - 2), 0),
            material="fabric")
    export("binoculars", "tools", origin_at_base=True)


def build_flashlight():
    """Barrel, reflector head and a thumb switch. A tight beam, not a torch."""
    cyl(0.035, 0.34, z=0.55, material="metal_dark", verts=12)
    # Knurled grip rings
    for i in range(5):
        cyl(0.038, 0.025, z=0.44 + i * 0.05, material="steel_worn", verts=12)
    # Reflector head and lens
    cone(0.07, 0.04, 0.12, z=0.78, material="metal", verts=14)
    cyl(0.066, 0.02, z=0.84, material="glass", verts=14)
    cone(0.055, 0.015, 0.07, z=0.79, material="led_green", verts=12)
    # Tail cap and thumb switch
    cyl(0.036, 0.05, z=0.36, material="plastic_black", verts=12)
    box(0.03, 0.02, 0.04, y=-0.035, z=0.5, material="orange_paint")
    export("flashlight", "tools", origin_at_base=True)


def build_wire_tool():
    """A spool of insulated wire on a pistol frame, with strippers in the jaw."""
    box(0.07, 0.1, 0.2, y=0.06, z=0.5, material="plastic_black")
    box(0.1, 0.22, 0.1, z=0.66, material="wire_red")
    # The spool, wound in visible turns
    cyl(0.1, 0.06, x=0.09, z=0.66, material="plastic_black", verts=14,
        rot=(0, math.pi / 2, 0))
    for i in range(4):
        cyl(0.09 - i * 0.018, 0.04, x=0.1, z=0.66, material="copper", verts=14,
            rot=(0, math.pi / 2, 0))
    # Jaw out the front: two stripper blades
    for sz in (-1, 1):
        box(0.03, 0.16, 0.02, y=-0.2, z=0.66 + sz * 0.03,
            rot=(sz * 0.12, 0, 0), material="steel_worn")
    # A run of wire trailing out of the jaw
    for i in range(4):
        box(0.015, 0.09, 0.015, y=-0.3 - i * 0.06,
            z=0.66 - i * 0.04, rot=(0.4, 0, 0), material="wire_red")
    box(0.04, 0.05, 0.02, y=0.0, z=0.56, material="metal_dark")
    export("wire_tool", "tools", origin_at_base=True)


def build_bow():
    """Recurve limbs built from three shortening segments each, a bound
    riser and a nocked arrow, so the silhouette reads as a hunting bow
    rather than a bent stick."""
    box(0.05, 0.09, 0.34, y=0.02, material="wood")
    wrap(-0.11, 0.11, 0.05, material="leather", turns=5, pos=(0.0, 0.02))
    for sz in (-1, 1):
        box(0.038, 0.07, 0.26, y=0.07, z=sz * 0.28, material="wood_dark",
            rot=(sz * 0.3, 0, 0))
        box(0.032, 0.055, 0.22, y=0.11, z=sz * 0.5, material="wood_dark",
            rot=(sz * 0.1, 0, 0))
        box(0.026, 0.045, 0.17, y=0.07, z=sz * 0.66, material="wood_light",
            rot=(-sz * 0.45, 0, 0))
        box(0.022, 0.032, 0.04, z=sz * 0.75, material="bark")
    # String, taut between the nocks
    box(0.01, 0.01, 1.5, y=-0.03, material="wood_light")
    # Arrow resting on the shelf, off to one side of the riser
    cyl(0.008, 0.7, x=0.045, y=0.16, material="wood_light", verts=6,
        rot=(math.pi / 2, 0, 0))
    cone(0.018, 0.0, 0.08, x=0.045, y=0.55, material="stone_dark", verts=5,
         rot=(-math.pi / 2, 0, 0))
    for i in range(3):
        box(0.003, 0.07, 0.04, x=0.045, y=-0.13, material="fabric",
            rot=(0, i * 1.05, 0))
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


def _recycler(w, d, h, body, trim, hopper_material, tier):
    """Shared recycler shell: a hopper you drop things into, a drum that turns
    them over, and an output chute. The tier shows in what it is built from
    and in how much machinery is bolted to the outside of it."""
    box(w, d, h * 0.82, z=h * 0.41, material=body)
    # Angled hopper mouth on top
    box(w * 0.9, d * 0.82, h * 0.16, z=h * 0.9, material=hopper_material)
    box(w * 0.74, d * 0.66, h * 0.1, z=h * 0.97, material="metal_dark")
    # Output chute at the front, where the fragments come out
    box(w * 0.5, d * 0.16, h * 0.2, y=-d / 2.0 - 0.04, z=h * 0.22,
        material="metal_dark")
    box(w * 0.44, d * 0.1, h * 0.04, y=-d / 2.0 - 0.09, z=h * 0.14,
        material=trim)
    # Corner ribs
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(0.07, 0.07, h * 0.8, x=sx * (w / 2.0 - 0.04),
                y=sy * (d / 2.0 - 0.04), z=h * 0.4, material=trim)
    if tier >= 1:
        # A motor and a belt drive: the reason it wants electricity
        cyl(h * 0.13, w * 0.16, x=w / 2.0 - 0.02, z=h * 0.5,
            material="metal_dark", verts=10, rot=(0, math.pi / 2, 0))
        box(0.03, d * 0.5, h * 0.3, x=w / 2.0 - 0.02, z=h * 0.5,
            material="char")
        box(0.14, 0.1, 0.1, x=-w / 2.0 + 0.06, y=-d / 2.0 + 0.02, z=h * 0.66,
            material="led_green")
    if tier >= 2:
        # Sorting bank and a glass inspection port
        for i in range(3):
            box(w * 0.2, 0.05, h * 0.22, x=-w * 0.28 + i * w * 0.28,
                y=-d / 2.0 - 0.03, z=h * 0.56, material="glass")
        box(w * 0.86, d * 0.2, h * 0.1, z=h * 1.03, material="metal")
        cyl(0.05, h * 0.34, x=-w / 2.0 + 0.1, y=d / 2.0 - 0.1, z=h * 1.12,
            material="copper", verts=8)


def build_recycler():
    """Hand-cranked: a barrel drum, a wooden hopper and a handle you turn."""
    _recycler(1.0, 0.9, 1.5, "rust", "metal_dark", "wood", tier=0)
    # The crank, which is the whole story of the tier-0 machine
    cyl(0.04, 0.4, x=0.56, z=0.85, material="metal_dark", verts=8,
        rot=(0, math.pi / 2, 0))
    box(0.06, 0.06, 0.26, x=0.74, z=0.72, material="wood")
    export("recycler", "deployables", origin_at_base=True)


def build_advanced_recycler():
    _recycler(1.2, 1.0, 1.6, "metal_dark", "metal", "steel_worn", tier=1)
    export("advanced_recycler", "deployables", origin_at_base=True)


def build_hitech_recycler():
    _recycler(1.4, 1.1, 1.7, "metal", "concrete", "steel_worn", tier=2)
    export("hitech_recycler", "deployables", origin_at_base=True)


# ==========================================================================
# ELECTRICAL DEVICES & TRAPS  (origin at base)
#
# Sizes match Game.DEVICES, remembering that a Godot size (X, Y, Z) is a
# Blender box(X, Z, Y) — Blender's Z is height and its -Y is Godot's +Z.
#
# Two devices deliberately model only their static half: the wind turbine's
# blades and every turret's barrel are spun and aimed at runtime by
# device.gd, so the model stops where the moving part starts.
# ==========================================================================

def _status_lamp(x, y, z, size=0.05):
    """The little light that says whether the circuit is feeding this thing.
    Modelled green; device.gd recolours the real light beside it."""
    box(size, size * 0.5, size, x=x, y=y, z=z, material="led_green")


def build_generator():
    """Engine block, fuel tank and an exhaust that has been running hot."""
    box(1.24, 0.84, 0.5, z=0.3, material="metal_dark")
    # Engine block and its cooling fins
    box(0.7, 0.6, 0.34, x=-0.2, z=0.68, material="steel_worn")
    for i in range(5):
        box(0.62, 0.04, 0.28, x=-0.2, y=-0.24 + i * 0.12, z=0.7,
            material="metal_dark")
    # Fuel tank
    cyl(0.19, 0.6, x=0.42, z=0.7, material="rust", verts=12,
        rot=(0, math.pi / 2, 0))
    cyl(0.06, 0.08, x=0.42, z=0.92, material="metal_dark", verts=8)
    # Exhaust, charred at the tip
    cyl(0.05, 0.4, x=-0.5, y=0.3, z=0.96, material="metal_dark", verts=8)
    cyl(0.06, 0.1, x=-0.5, y=0.3, z=1.18, material="char", verts=8)
    # Pull-start and terminals
    cyl(0.11, 0.06, x=0.02, y=-0.44, z=0.68, material="metal", verts=10,
        rot=(math.pi / 2, 0, 0))
    for sx in (-1, 1):
        box(0.06, 0.06, 0.08, x=sx * 0.2, y=-0.44, z=0.4, material="copper")
    # Skid feet
    for sx in (-1, 1):
        box(0.12, 0.8, 0.1, x=sx * 0.54, z=0.05, material="metal_dark")
    _status_lamp(0.0, -0.44, 0.52)
    export("generator", "devices", origin_at_base=True)


def build_solar_panel():
    """A cell array on a shallow tilted frame. Flat, because it has to fit
    inside a 20 cm tall box and still read as a panel from standing height."""
    tilt = 0.2
    box(1.5, 0.9, 0.05, z=0.13, rot=(tilt, 0, 0), material="solar")
    # Cell grid, slightly proud of the backing
    for i in range(4):
        for j in range(2):
            box(0.33, 0.38, 0.02, x=-0.55 + i * 0.37, y=-0.21 + j * 0.42,
                z=0.16 + (-0.21 + j * 0.42) * -tilt, rot=(tilt, 0, 0),
                material="solar_cell")
    # Aluminium edge frame
    for sx in (-1, 1):
        box(0.05, 0.92, 0.07, x=sx * 0.75, z=0.13, rot=(tilt, 0, 0),
            material="metal")
    # Mounting rails and a junction box underneath
    for sy in (-1, 1):
        box(1.2, 0.07, 0.07, y=sy * 0.34, z=0.04, material="metal_dark")
    box(0.2, 0.14, 0.08, x=0.5, y=0.3, z=0.05, material="plastic_black")
    export("solar_panel", "devices", origin_at_base=True)


def build_wind_turbine():
    """Mast, guy wires and nacelle only — device.gd spins the blades, so the
    model stops at the hub the blades bolt onto."""
    cyl(0.11, 3.4, z=1.7, material="metal", verts=10)
    # Taper: a wider collar at the foot
    cyl(0.17, 0.3, z=0.15, material="metal_dark", verts=10)
    box(0.6, 0.6, 0.08, z=0.04, material="concrete")
    # Weld bands up the mast
    for i in range(4):
        cyl(0.125, 0.05, z=0.6 + i * 0.7, material="steel_worn", verts=10)
    # Guy wires out to three ground anchors
    for i in range(3):
        a = i * math.tau / 3.0
        box(0.02, 0.02, 1.5, x=math.cos(a) * 0.35, y=math.sin(a) * 0.35,
            z=0.85, rot=(math.sin(a) * -0.42, math.cos(a) * 0.42, 0),
            material="steel_worn")
        box(0.1, 0.1, 0.1, x=math.cos(a) * 0.62, y=math.sin(a) * 0.62,
            z=0.05, material="metal_dark")
    # Nacelle and the hub the blades turn on
    box(0.24, 0.5, 0.24, z=3.5, material="plastic_white")
    cone(0.13, 0.05, 0.2, y=-0.32, z=3.5, material="metal_dark", verts=10,
         rot=(math.pi / 2, 0, 0))
    # Tail vane, so it reads as something that faces into the wind
    box(0.02, 0.3, 0.26, y=0.36, z=3.56, material="plastic_white")
    _status_lamp(0.0, -0.2, 3.66)
    export("wind_turbine", "devices", origin_at_base=True)


def build_battery():
    """Salvaged cell bank in a crate, with the terminals you clip onto."""
    box(0.84, 0.64, 0.5, z=0.3, material="plastic_black")
    box(0.86, 0.66, 0.07, z=0.58, material="metal_dark")
    # Cells visible through the open top
    for i in range(3):
        cyl(0.11, 0.42, x=-0.26 + i * 0.26, z=0.33, material="rust", verts=10)
    # Terminals, one copper and one worn
    for sx, m in ((-1, "copper"), (1, "steel_worn")):
        cyl(0.05, 0.1, x=sx * 0.24, y=-0.2, z=0.66, material=m, verts=8)
    # Charge gauge on the front
    box(0.34, 0.04, 0.1, y=-0.33, z=0.36, material="metal_dark")
    box(0.2, 0.03, 0.05, x=-0.05, y=-0.36, z=0.36, material="led_green")
    # Carry handles
    for sx in (-1, 1):
        box(0.05, 0.16, 0.05, x=sx * 0.43, z=0.44, material="metal_dark")
    export("battery", "devices", origin_at_base=True)


def build_auto_turret():
    """Tripod and armoured housing. No barrel: device.gd aims that, so the
    model ends at the mount it swings on."""
    # Tripod legs splayed off a hub
    for i in range(3):
        a = i * math.tau / 3.0
        box(0.07, 0.07, 0.62, x=math.cos(a) * 0.17, y=math.sin(a) * 0.17,
            z=0.3, rot=(math.sin(a) * 0.32, math.cos(a) * -0.32, 0),
            material="metal_dark")
        box(0.11, 0.11, 0.04, x=math.cos(a) * 0.28, y=math.sin(a) * 0.28,
            z=0.02, material="steel_worn")
    cyl(0.13, 0.12, z=0.64, material="metal_dark", verts=10)
    # Armoured housing
    box(0.4, 0.34, 0.34, z=0.88, material="gunmetal")
    box(0.44, 0.06, 0.3, y=-0.18, z=0.88, material="steel_worn")
    # Optics behind a glass port, and the ammunition drum on the side
    box(0.12, 0.04, 0.09, y=-0.22, z=0.95, material="glass")
    cyl(0.1, 0.14, x=0.24, z=0.9, material="metal_dark", verts=10,
        rot=(0, math.pi / 2, 0))
    # Wear on the housing: it has been shot at before
    wear(0.34, 0.28, y=-0.19, z=0.88, count=5, seed=3, normal="y",
         material="steel_worn")
    _status_lamp(-0.16, -0.19, 1.02)
    export("auto_turret", "devices", origin_at_base=True)


def build_shotgun_trap():
    """A sawn-off barrel in a wall bracket over a tripwire plate."""
    box(0.34, 0.34, 0.14, z=0.07, material="metal_dark")
    # Bracket and the breech it clamps
    box(0.16, 0.3, 0.26, z=0.27, material="wood_dark")
    cyl(0.055, 0.42, y=-0.12, z=0.34, material="gunmetal", verts=10,
        rot=(math.pi / 2, 0, 0))
    cyl(0.075, 0.12, y=0.1, z=0.34, material="steel_worn", verts=10,
        rot=(math.pi / 2, 0, 0))
    # Shells in a clip on the side
    for i in range(3):
        cyl(0.026, 0.11, x=0.12, y=0.02 + i * 0.06, z=0.2,
            material="brass", verts=8, rot=(math.pi / 2, 0, 0))
    # Trigger linkage down to the pressure plate
    box(0.02, 0.02, 0.2, x=-0.09, y=0.06, z=0.2, material="steel_worn")
    box(0.26, 0.26, 0.03, z=0.15, material="steel_worn")
    _status_lamp(0.1, -0.14, 0.44, size=0.04)
    export("shotgun_trap", "devices", origin_at_base=True)


def build_flame_trap():
    """Fuel bottle, valve and a nozzle with a pilot flame at the tip."""
    box(0.36, 0.36, 0.1, z=0.05, material="metal_dark")
    # Fuel bottle
    cyl(0.13, 0.4, y=0.06, z=0.3, material="rust", verts=12)
    cyl(0.05, 0.07, y=0.06, z=0.53, material="metal_dark", verts=8)
    # Valve wheel
    cyl(0.07, 0.03, y=0.06, z=0.42, material="brass", verts=10,
        rot=(0, math.pi / 2, 0))
    # Nozzle out the front, angled slightly down a corridor
    cyl(0.035, 0.26, y=-0.16, z=0.44, material="gunmetal", verts=8,
        rot=(math.pi / 2 - 0.16, 0, 0))
    cone(0.055, 0.03, 0.08, y=-0.28, z=0.42, material="char", verts=8,
         rot=(math.pi / 2 - 0.16, 0, 0))
    # Pilot flame
    cone(0.03, 0.0, 0.09, y=-0.33, z=0.43, material="flame", verts=6,
         rot=(math.pi / 2 - 0.16, 0, 0))
    # Feed line from bottle to nozzle
    box(0.02, 0.16, 0.02, y=-0.06, z=0.46, material="copper")
    _status_lamp(0.13, -0.1, 0.2, size=0.04)
    export("flame_trap", "devices", origin_at_base=True)


def build_tesla_coil():
    """Wound secondary on a crate base, topped with a toroid and an arc gap."""
    box(0.42, 0.42, 0.16, z=0.08, material="wood_dark")
    box(0.34, 0.34, 0.05, z=0.18, material="plastic_black")
    # Secondary winding: stacked copper rings up a former
    cyl(0.09, 1.0, z=0.72, material="plastic_white", verts=12)
    for i in range(13):
        cyl(0.105, 0.05, z=0.28 + i * 0.075, material="copper", verts=12)
    # Toroid and the electrode above it
    cyl(0.19, 0.09, z=1.28, material="metal", verts=14)
    cyl(0.02, 0.16, z=1.4, material="steel_worn", verts=6)
    box(0.05, 0.05, 0.05, z=1.5, material="arc")
    # Primary coil turns around the base of the former
    for i in range(3):
        cyl(0.16 - i * 0.015, 0.03, z=0.26 + i * 0.05, material="copper", verts=14)
    # Earth strap
    box(0.03, 0.14, 0.03, y=0.2, z=0.2, material="copper")
    _status_lamp(0.16, -0.16, 0.24, size=0.045)
    export("tesla_coil", "devices", origin_at_base=True)


def build_alarm():
    """A bell housing and a strobe on a wall plate."""
    box(0.3, 0.1, 0.3, z=0.15, material="plastic_black")
    # Bell dome
    cyl(0.12, 0.09, y=-0.11, z=0.19, material="medical", verts=14,
        rot=(math.pi / 2, 0, 0))
    cyl(0.03, 0.05, y=-0.17, z=0.19, material="metal_dark", verts=8,
        rot=(math.pi / 2, 0, 0))
    # Strobe lens under it
    box(0.1, 0.06, 0.05, y=-0.09, z=0.05, material="led_red")
    # Mounting screws
    for sx in (-1, 1):
        for sz in (0.04, 0.26):
            box(0.02, 0.03, 0.02, x=sx * 0.12, y=-0.06, z=sz,
                material="metal_dark")
    export("alarm", "devices", origin_at_base=True)


def build_motion_sensor():
    """Fresnel lens in a small white housing, aimed slightly down."""
    box(0.22, 0.14, 0.16, z=0.14, material="plastic_white")
    # Lens
    box(0.16, 0.04, 0.1, y=-0.09, z=0.13, rot=(0.2, 0, 0),
        material="plastic_black")
    for i in range(3):
        box(0.15, 0.01, 0.02, y=-0.11, z=0.1 + i * 0.03, rot=(0.2, 0, 0),
            material="plastic_white")
    # Wall bracket
    box(0.06, 0.06, 0.1, z=0.05, material="plastic_white")
    box(0.14, 0.1, 0.03, z=0.01, material="plastic_black")
    _status_lamp(0.06, -0.08, 0.2, size=0.03)
    export("motion_sensor", "devices", origin_at_base=True)


def build_smart_switch():
    """A toggle in a weatherproof box — the thing you flip on your way out."""
    box(0.26, 0.14, 0.3, z=0.17, material="plastic_white")
    box(0.2, 0.03, 0.22, y=-0.08, z=0.18, material="plastic_black")
    # The lever itself, thrown up
    box(0.05, 0.05, 0.11, y=-0.11, z=0.22, rot=(-0.4, 0, 0),
        material="orange_paint")
    # Cable glands top and bottom
    for sz in (0.03, 0.33):
        cyl(0.03, 0.05, z=sz, material="metal_dark", verts=8)
    _status_lamp(0.07, -0.09, 0.09, size=0.035)
    export("smart_switch", "devices", origin_at_base=True)


def build_camera():
    """Boxy body, lens hood and a wall arm."""
    box(0.16, 0.34, 0.16, z=0.38, material="plastic_black")
    # Lens hood and glass
    cyl(0.07, 0.1, y=-0.21, z=0.38, material="metal_dark", verts=12,
        rot=(math.pi / 2, 0, 0))
    cyl(0.055, 0.02, y=-0.26, z=0.38, material="glass", verts=12,
        rot=(math.pi / 2, 0, 0))
    # Infrared ring, so it reads as something that sees in the dark
    for i in range(6):
        a = i * math.tau / 6.0
        box(0.02, 0.01, 0.02, x=math.cos(a) * 0.055, y=-0.265,
            z=0.38 + math.sin(a) * 0.055, material="led_red")
    # Arm and wall plate
    box(0.05, 0.05, 0.24, y=0.1, z=0.22, rot=(0.5, 0, 0),
        material="metal_dark")
    box(0.14, 0.14, 0.03, y=0.18, z=0.02, material="metal_dark")
    _status_lamp(0.07, -0.14, 0.47, size=0.03)
    export("camera", "devices", origin_at_base=True)


def build_land_mine():
    """A pressure plate over a shallow charge, half buried in loose dirt."""
    cyl(0.18, 0.07, z=0.035, material="olive", verts=12)
    # Pressure plate with its spider legs
    cyl(0.11, 0.03, z=0.08, material="metal_dark", verts=10)
    for i in range(4):
        a = i * math.tau / 4.0 + 0.4
        box(0.02, 0.11, 0.015, x=math.cos(a) * 0.11, y=math.sin(a) * 0.11,
            z=0.075, rot=(0, 0, a), material="steel_worn")
    # Arming ring, pulled
    cyl(0.025, 0.012, x=0.14, z=0.08, material="brass", verts=8)
    # Dirt kicked up around the rim so it reads as buried, not dropped
    rng = random.Random(21)
    for i in range(7):
        a = rng.uniform(0, math.tau)
        r = rng.uniform(0.16, 0.22)
        rock(rng.uniform(0.025, 0.05), x=math.cos(a) * r, y=math.sin(a) * r,
             z=0.02, material="mud", seed=i)
    export("land_mine", "devices", origin_at_base=True)


def build_bear_trap():
    """Sprung jaws open around a pressure pan, on a staked base plate."""
    box(0.3, 0.3, 0.03, z=0.015, material="steel_worn")
    # The two jaws, thrown open and toothed
    for sy in (-1, 1):
        box(0.34, 0.05, 0.05, y=sy * 0.15, z=0.11, rot=(sy * -0.9, 0, 0),
            material="metal_dark")
        for i in range(5):
            box(0.025, 0.03, 0.08, x=-0.13 + i * 0.065, y=sy * 0.2, z=0.15,
                rot=(sy * -0.9, 0, 0), material="steel_worn")
    # Coil springs either side
    for sx in (-1, 1):
        cyl(0.055, 0.05, x=sx * 0.19, z=0.05, material="rust", verts=10,
            rot=(0, math.pi / 2, 0))
        box(0.09, 0.03, 0.03, x=sx * 0.24, z=0.05, material="steel_worn")
    # Pressure pan in the middle
    box(0.13, 0.13, 0.02, z=0.04, material="metal_dark")
    # Anchor chain running off one corner
    for i in range(4):
        cyl(0.022, 0.012, x=-0.14 + i * -0.05, y=0.16, z=0.02,
            material="metal_dark", verts=6, rot=(0, math.pi / 2, 0))
    box(0.05, 0.05, 0.1, x=-0.32, y=0.16, z=0.03, material="metal_dark")
    export("bear_trap", "devices", origin_at_base=True)


# ==========================================================================
# CREATURES  (origin at base — feet on the ground, like the deployables)
# ==========================================================================

def _leg(x, y, h, r, material, foot=None):
    """Upper limb plus a slightly splayed lower leg, so the animal stands on
    something instead of ending in a floating stump."""
    cyl(r, h * 0.62, x=x, y=y, z=h * 0.69, material=material, verts=6)
    cyl(r * 0.78, h * 0.46, x=x, y=y, z=h * 0.23, material=material, verts=6)
    if foot:
        box(r * 2.3, r * 3.0, h * 0.1, x=x, y=y + r * 0.4, z=h * 0.05,
            material=foot)


def _quadruped(name, body_dims, leg_h, head_dims, snout_dims, ear_size,
               tail, tail_tilt, fur, fur_dark, extra=None,
               hump=0.0, foot=None, bands=3, ear_kind="cone", neck=0.5,
               eye="eye"):
    """A low-poly quadruped: four jointed legs, a body with shoulder and
    haunch masses, a neck, a head with snout, jaw, eyes and ears, and a
    tail. Shared by the wolf, bear, deer and boar — the same skeleton at
    different proportions, with `hump`, `foot` and `ear_kind` carrying the
    differences that actually read at a distance.
    """
    body_w, body_l, body_h = body_dims
    head_w, head_l, head_h = head_dims
    snout_w, snout_l, snout_h = snout_dims
    tail_l, tail_r = tail

    body_z = leg_h + body_h / 2.0
    box(body_w, body_l, body_h, z=body_z, material=fur)
    # Belly, in shadow
    box(body_w * 0.96, body_l * 0.66, body_h * 0.3,
        z=leg_h + body_h * 0.18, material=fur_dark)
    # Shoulder and haunch: the two masses that make a quadruped read as an
    # animal rather than a crate on legs
    box(body_w * 1.06, body_l * 0.3, body_h * 0.86,
        y=body_l * 0.3, z=body_z + body_h * 0.06, material=fur)
    box(body_w * 1.1, body_l * 0.34, body_h * 0.92,
        y=-body_l * 0.28, z=body_z + body_h * 0.02, material=fur)
    if hump > 0.0:
        box(body_w * 0.82, body_l * 0.34, body_h * hump,
            y=body_l * 0.22, z=body_z + body_h * (0.5 + hump * 0.4),
            material=fur)
    # Flank banding — cheap fur variation along the side
    for i in range(bands):
        t = (i + 0.5) / bands - 0.5
        box(body_w * 1.04, body_l * 0.07, body_h * 0.5,
            y=body_l * t * 0.9, z=body_z, material=fur_dark)

    leg_r = min(body_w, body_h) * 0.11
    for sx in (-1, 1):
        for sy in (-1, 1):
            _leg(sx * (body_w / 2.0 - leg_r * 1.3), sy * (body_l / 2.0 - leg_r * 1.6),
                 leg_h, leg_r, fur_dark, foot)

    # Neck bridging body to head, so the head is not stuck straight on
    neck_y = body_l / 2.0 + head_l * 0.06
    neck_z = body_z + body_h * 0.14
    box(head_w * 1.15, head_l * neck, head_h * 0.9,
        y=neck_y, z=neck_z, material=fur)

    head_y = body_l / 2.0 + head_l * 0.32
    head_z = body_z + body_h * 0.2
    box(head_w, head_l, head_h, y=head_y, z=head_z, material=fur)
    snout_y = head_y + head_l / 2.0 + snout_l * 0.35
    box(snout_w, snout_l, snout_h, y=snout_y,
        z=head_z - head_h * 0.18, material=fur_dark)
    # Lower jaw, set back and under the snout
    box(snout_w * 0.86, snout_l * 0.82, snout_h * 0.4,
        y=snout_y - snout_l * 0.08, z=head_z - head_h * 0.18 - snout_h * 0.42,
        material=fur_dark)
    # Nose
    box(snout_w * 0.5, snout_l * 0.22, snout_h * 0.42,
        y=snout_y + snout_l * 0.42, z=head_z - head_h * 0.14,
        material="char")

    for sx in (-1, 1):
        box(head_w * 0.16, head_l * 0.14, head_h * 0.16,
            x=sx * head_w * 0.42, y=head_y + head_l * 0.22,
            z=head_z + head_h * 0.16, material=eye)
        if ear_kind == "cone":
            cone(ear_size * 0.55, 0.0, ear_size, x=sx * head_w * 0.28,
                 y=head_y - head_l * 0.15,
                 z=head_z + head_h / 2.0 + ear_size * 0.4,
                 material=fur, verts=4)
        else:
            box(ear_size * 0.9, ear_size * 0.4, ear_size * 0.8,
                x=sx * head_w * 0.34, y=head_y - head_l * 0.12,
                z=head_z + head_h / 2.0 + ear_size * 0.3, material=fur_dark)

    cyl(tail_r, tail_l,
        y=-(body_l / 2.0 + tail_l * 0.4 * math.cos(tail_tilt)),
        z=body_z + tail_l * 0.4 * math.sin(tail_tilt) + body_h * 0.1,
        material=fur_dark, verts=6, rot=(tail_tilt, 0, 0))

    if extra:
        extra(body_z, head_y, head_z)


def build_wolf():
    """Lean chest, long ears, heavy brush tail."""
    def ruff(body_z, head_y, head_z):
        # Neck ruff — the wolf's most recognisable outline after the tail
        neck_y = 0.7 / 2.0 + 0.01
        box(0.3, 0.1, 0.3, y=neck_y, z=head_z - 0.02, material="wolf_fur_dark")
        for i in range(5):
            a = i * 1.25
            box(0.06, 0.05, 0.15, x=math.cos(a) * 0.15, y=neck_y,
                z=head_z - 0.02 + math.sin(a) * 0.13,
                material="wolf_fur", rot=(0, 0, a))

    _quadruped("wolf", body_dims=(0.32, 0.7, 0.36), leg_h=0.42,
               head_dims=(0.22, 0.26, 0.24), snout_dims=(0.14, 0.18, 0.14),
               ear_size=0.14, tail=(0.36, 0.055), tail_tilt=-0.5,
               fur="wolf_fur", fur_dark="wolf_fur_dark", bands=4,
               foot="wolf_fur_dark", extra=ruff)
    export("wolf", "creatures", origin_at_base=True)


def build_bear():
    """Shoulder hump, broad paws, heavy low-slung head."""
    def claws(body_z, head_y, head_z):
        for sx in (-1, 1):
            for sy in (-1, 1):
                for i in (-1, 0, 1):
                    cone(0.016, 0.0, 0.06,
                         x=sx * 0.19 + i * 0.028,
                         y=sy * 0.445, z=0.03,
                         material="tusk", verts=4,
                         rot=(-sy * math.pi / 2.4, 0, 0))

    _quadruped("bear", body_dims=(0.5, 0.95, 0.55), leg_h=0.45,
               head_dims=(0.32, 0.34, 0.3), snout_dims=(0.2, 0.22, 0.17),
               ear_size=0.11, tail=(0.14, 0.05), tail_tilt=-0.2,
               fur="bear_fur", fur_dark="bear_fur_dark", hump=0.5,
               ear_kind="box", foot="bear_fur_dark", bands=4, neck=0.62,
               extra=claws)
    export("bear", "creatures", origin_at_base=True)


def build_deer():
    def antlers(body_z, head_y, head_z):
        for sx in (-1, 1):
            # Main beam, sweeping up and out
            cyl(0.025, 0.32, x=sx * 0.08, y=head_y - 0.05, z=head_z + 0.28,
                material="antler", verts=5, rot=(0.35, 0, sx * 0.4))
            # Three tines off it
            cyl(0.02, 0.17, x=sx * 0.17, y=head_y - 0.02, z=head_z + 0.42,
                material="antler", verts=5, rot=(0.1, 0, sx * 0.9))
            cyl(0.016, 0.13, x=sx * 0.13, y=head_y + 0.05, z=head_z + 0.34,
                material="antler", verts=5, rot=(-0.5, 0, sx * 0.7))
            cyl(0.014, 0.11, x=sx * 0.2, y=head_y - 0.09, z=head_z + 0.5,
                material="antler", verts=5, rot=(0.4, 0, sx * 1.2))

    _quadruped("deer", body_dims=(0.26, 0.62, 0.32), leg_h=0.55,
               head_dims=(0.16, 0.22, 0.2), snout_dims=(0.09, 0.15, 0.1),
               ear_size=0.12, tail=(0.14, 0.035), tail_tilt=0.4,
               fur="deer_hide", fur_dark="deer_hide_dark", bands=2,
               foot="hoof", neck=0.75, extra=antlers)
    export("deer", "creatures", origin_at_base=True)


def build_boar():
    """Wild boar: humped back sloping to short legs, disc snout, tusks, a
    bristle crest along the spine and dried mud on the flanks."""
    def tusks_and_crest(body_z, head_y, head_z):
        # Snout tip, from the same arithmetic _quadruped uses:
        # snout_y = head_y + head_l/2 + snout_l*0.35, snout_z = head_z - head_h*0.18
        snout_y = head_y + 0.3 / 2.0 + 0.2 * 0.35
        snout_z = head_z - 0.26 * 0.18
        # Flat disc snout, the boar's signature
        cyl(0.085, 0.05, y=snout_y + 0.11, z=snout_z, material="boar_hide_dark",
            verts=10, rot=(math.pi / 2, 0, 0))
        for sx in (-1, 1):
            cone(0.022, 0.006, 0.13,
                 x=sx * 0.07, y=snout_y + 0.02, z=snout_z - 0.02,
                 material="tusk", verts=5, rot=(-1.1, 0, sx * 0.35))
        # Bristle crest from skull to shoulders
        for i in range(7):
            box(0.03, 0.05, 0.1 - i * 0.008, y=0.34 - i * 0.09,
                z=body_z + 0.24 + (0.05 if i < 3 else 0.0),
                material="bristle", rot=(0.25, 0, 0))
        # Caked mud
        for i, (mx, my) in enumerate([(0.19, 0.1), (-0.19, -0.12), (0.19, -0.2)]):
            box(0.03, 0.16, 0.12, x=mx, y=my, z=body_z - 0.06,
                material="mud", rot=(0, 0, i * 0.4))

    _quadruped("boar", body_dims=(0.34, 0.72, 0.4), leg_h=0.3,
               head_dims=(0.24, 0.3, 0.26), snout_dims=(0.16, 0.2, 0.14),
               ear_size=0.1, tail=(0.16, 0.025), tail_tilt=0.9,
               fur="boar_hide", fur_dark="boar_hide_dark", hump=0.55,
               ear_kind="box", foot="hoof", bands=3, neck=0.4,
               extra=tusks_and_crest)
    export("boar", "creatures", origin_at_base=True)


def build_scientist():
    """Monument guard: a boxy hazmat-suited figure with a slung rifle,
    matching npc.gd's blue suit colour and forward (+Y) facing."""
    hip = 0.9
    shoulder = 1.45
    for sx in (-1, 1):
        box(0.14, 0.16, hip, x=sx * 0.11, z=hip / 2.0, material="suit_dark")
    box(0.36, 0.24, shoulder - hip, z=(hip + shoulder) / 2.0, material="suit")
    box(0.38, 0.05, 0.06, z=shoulder - 0.12, y=-0.13, material="suit_dark")
    arm_h = 0.5
    for sx in (-1, 1):
        box(0.09, 0.11, arm_h, x=sx * 0.24, z=shoulder - arm_h / 2.0 - 0.03,
            material="suit")
    head_z = shoulder + 0.16
    box(0.22, 0.22, 0.24, z=head_z, material="suit")
    box(0.16, 0.06, 0.14, y=0.13, z=head_z - 0.02, material="glass")
    # Rifle at the hip, barrel forward (+Y)
    cyl(0.02, 0.75, x=0.22, y=0.18, z=shoulder - 0.05, material="gunmetal",
        verts=8, rot=(math.pi / 2, 0, 0))
    box(0.05, 0.16, 0.07, x=0.22, y=-0.1, z=shoulder - 0.05, material="metal_dark")
    box(0.03, 0.05, 0.14, x=0.22, y=0.05, z=shoulder - 0.16, material="metal_dark")
    export("scientist", "creatures", origin_at_base=True)


def build_rabbit():
    """Small, crouched, and all ears — the ears are the only part of a rabbit
    that reads at the distance you first spot one from."""
    def scut(body_z, head_y, head_z):
        # The white tail flash you actually see when it bolts
        rock(0.055, y=-0.19, z=body_z + 0.02, material="hen_feather", seed=3)
        # Haunches bunched for a spring
        for sx in (-1, 1):
            rock(0.075, x=sx * 0.085, y=-0.09, z=body_z - 0.02,
                 material="rabbit_fur", seed=10 + sx)

    _quadruped("rabbit", body_dims=(0.19, 0.3, 0.16), leg_h=0.1,
               head_dims=(0.12, 0.13, 0.12), snout_dims=(0.075, 0.08, 0.07),
               ear_size=0.19, tail=(0.06, 0.045), tail_tilt=0.9,
               fur="rabbit_fur", fur_dark="rabbit_fur_dark", bands=2,
               neck=0.3, extra=scut)
    export("rabbit", "creatures", origin_at_base=True)


def build_chicken():
    """A bird, so it gets its own build rather than the quadruped skeleton:
    two legs, a plump body, folded wings and a combed head."""
    body_z = 0.2
    # Body and the fold of the wings against it
    box(0.2, 0.3, 0.2, z=body_z, material="hen_feather")
    box(0.19, 0.2, 0.12, y=-0.02, z=body_z - 0.06, material="hen_feather_dark")
    for sx in (-1, 1):
        box(0.04, 0.22, 0.13, x=sx * 0.105, y=-0.01, z=body_z,
            material="hen_feather")
        box(0.035, 0.1, 0.06, x=sx * 0.11, y=-0.1, z=body_z - 0.04,
            material="hen_feather_dark")
    # Breast
    rock(0.1, y=0.13, z=body_z - 0.01, material="hen_feather", seed=5)

    # Tail: three fanned feathers, the give-away silhouette
    for i, ang in enumerate((-0.5, 0.0, 0.5)):
        box(0.02, 0.06, 0.17, x=ang * 0.09, y=-0.19, z=body_z + 0.11,
            rot=(-0.7, 0, ang), material="hen_feather_dark")

    # Neck and head
    neck_z = body_z + 0.14
    box(0.09, 0.09, 0.14, y=0.11, z=neck_z, material="hen_feather")
    head_z = neck_z + 0.11
    box(0.09, 0.1, 0.09, y=0.14, z=head_z, material="hen_feather")
    # Comb along the crown and the wattle under the beak
    for i in range(3):
        box(0.02, 0.03, 0.05, y=0.12 + i * 0.03, z=head_z + 0.06,
            material="comb")
    box(0.03, 0.03, 0.05, y=0.17, z=head_z - 0.07, material="comb")
    # Beak and eyes
    cone(0.03, 0.0, 0.07, y=0.21, z=head_z, material="beak", verts=6,
         rot=(-math.pi / 2, 0, 0))
    for sx in (-1, 1):
        box(0.015, 0.015, 0.015, x=sx * 0.042, y=0.17, z=head_z + 0.02,
            material="eye")

    # Two scaly legs with splayed toes
    for sx in (-1, 1):
        cyl(0.018, 0.12, x=sx * 0.055, y=0.01, z=0.06, material="beak", verts=6)
        for toe in (-0.35, 0.0, 0.35):
            box(0.015, 0.06, 0.012, x=sx * 0.055 + math.sin(toe) * 0.03,
                y=0.05, z=0.008, rot=(0, 0, toe), material="beak")
    export("chicken", "creatures", origin_at_base=True)


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
# EXPLOSIVES  (origin at base; raiding gear)
# ==========================================================================

def build_c4():
    """Timed explosive charge: a strapped bundle of sticks with a timer."""
    for i in range(4):
        cyl(0.055, 0.34, x=-0.09 + (i % 2) * 0.18, y=-0.05 + (i // 2) * 0.11,
            z=0.17, material="explosive", verts=10)
    # Duct-tape straps
    for z in (0.08, 0.26):
        box(0.34, 0.28, 0.045, z=z, material="olive")
    # Timer box and wiring
    box(0.15, 0.09, 0.11, y=-0.16, z=0.28, material="metal_dark")
    box(0.09, 0.02, 0.05, y=-0.21, z=0.29, material="warning")
    cyl(0.012, 0.22, x=0.08, y=-0.1, z=0.33, material="wire_red", verts=6,
        rot=(0, math.pi / 2, 0.5))
    export("c4", "explosives", origin_at_base=True)


def build_grenade():
    """F1-style fragmentation grenade."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.075,
                                         location=(0, 0, 0.09))
    obj = bpy.context.active_object
    obj.scale = (1.0, 1.0, 1.2)
    _finish(obj, "olive")
    cyl(0.032, 0.05, z=0.19, material="metal_dark", verts=10)
    box(0.022, 0.09, 0.012, y=0.035, z=0.185, material="metal")
    cyl(0.018, 0.012, y=0.02, z=0.215, material="metal", verts=8)
    export("grenade", "explosives", origin_at_base=True)


def build_rocket():
    """Warhead, body and tail fins, laid along -Y so it flies nose-first."""
    cone(0.06, 0.0, 0.18, y=-0.3, z=0.06, material="wire_red", verts=10,
         rot=(-math.pi / 2, 0, 0))
    cyl(0.06, 0.26, y=-0.08, z=0.06, material="explosive", verts=10,
        rot=(math.pi / 2, 0, 0))
    cyl(0.045, 0.22, y=0.16, z=0.06, material="metal_dark", verts=10,
        rot=(math.pi / 2, 0, 0))
    for i in range(3):
        box(0.012, 0.12, 0.1, y=0.22, z=0.06, material="metal",
            rot=(0, i * 2.09, 0))
    export("rocket", "explosives", origin_at_base=True)


def build_rocket_launcher():
    """Shoulder tube with grip, trigger and iron sight."""
    cyl(0.085, 1.1, y=-0.1, z=0.5, material="olive", verts=12,
        rot=(math.pi / 2, 0, 0))
    cone(0.11, 0.085, 0.16, y=0.4, z=0.5, material="metal_dark", verts=12,
         rot=(math.pi / 2, 0, 0))
    # Grip and trigger guard
    box(0.07, 0.1, 0.26, y=0.02, z=0.32, material="wood_dark", rot=(0.25, 0, 0))
    box(0.05, 0.16, 0.03, y=0.06, z=0.24, material="metal_dark")
    # Fore grip
    box(0.06, 0.09, 0.2, y=-0.36, z=0.36, material="wood_dark")
    # Sight
    box(0.03, 0.06, 0.09, y=-0.2, z=0.62, material="metal")
    box(0.03, 0.03, 0.06, y=0.18, z=0.6, material="metal")
    export("rocket_launcher", "explosives", origin_at_base=True)


# ==========================================================================
# ITEMS  (inventory subjects: rendered to 2D icons and usable in-world)
# ==========================================================================

def build_machete():
    _handle(0.32, 0.032, material="wood_dark")
    box(0.03, 0.075, 0.1, z=0.3, material="leather")
    box(0.016, 0.1, 0.62, y=0.012, z=0.66, material="metal")
    box(0.018, 0.03, 0.6, y=-0.04, z=0.65, material="metal_dark")
    cone(0.05, 0.0, 0.14, y=0.01, z=1.0, material="metal", verts=4,
         rot=(math.pi / 2, 0, 0))
    export("machete", "items", origin_at_base=True)


def build_ak47():
    # Receiver, barrel, magazine, stock and grip, laid along Y
    box(0.06, 0.46, 0.11, y=0.02, z=0.42, material="gunmetal")
    cyl(0.018, 0.46, y=-0.44, z=0.44, material="metal_dark", verts=10,
        rot=(math.pi / 2, 0, 0))
    box(0.05, 0.1, 0.06, y=-0.3, z=0.5, material="wood_dark")
    # Curved magazine
    for i in range(4):
        box(0.045, 0.09, 0.07, y=0.06 + i * 0.015, z=0.31 - i * 0.06,
            material="gunmetal", rot=(i * 0.16, 0, 0))
    box(0.05, 0.1, 0.16, y=0.2, z=0.31, material="wood_dark", rot=(-0.3, 0, 0))
    box(0.05, 0.34, 0.1, y=0.4, z=0.38, material="wood", rot=(0.12, 0, 0))
    box(0.03, 0.05, 0.06, y=-0.2, z=0.52, material="metal_dark")
    export("ak47", "items", origin_at_base=True)


def build_building_plan():
    """A rolled blueprint with a band around it."""
    cyl(0.09, 0.5, z=0.09, material="paper", verts=14, rot=(0, math.pi / 2, 0))
    cyl(0.093, 0.06, x=-0.1, z=0.09, material="blueprint", verts=14,
        rot=(0, math.pi / 2, 0))
    cyl(0.093, 0.06, x=0.12, z=0.09, material="blueprint", verts=14,
        rot=(0, math.pi / 2, 0))
    # A sheet peeling off the roll
    box(0.42, 0.3, 0.006, y=0.14, z=0.16, material="blueprint", rot=(0.25, 0, 0))
    export("building_plan", "items", origin_at_base=True)


def build_hammer():
    """Heavy framing hammer: worn steel head, banded collar, wrapped grip."""
    _handle(0.62, 0.028, material="wood", dark="wood_dark")
    wrap(0.04, 0.27, 0.028, material="leather", turns=7)
    box(0.045, 0.09, 0.06, z=0.58, material="leather")
    cyl(0.072, 0.035, z=0.605, material="metal_dark", verts=10)
    box(0.07, 0.12, 0.13, z=0.67, material="steel_worn")
    cyl(0.062, 0.11, y=-0.1, z=0.67, material="steel_worn", verts=10,
        rot=(math.pi / 2, 0, 0))
    wear(0.11, 0.13, x=0.036, z=0.67, count=5, seed=31, normal="x")
    # Claw
    for sx in (-1, 1):
        box(0.022, 0.16, 0.05, x=sx * 0.03, y=0.13, z=0.69,
            material="metal_dark", rot=(-0.55, 0, 0))
    export("hammer", "items", origin_at_base=True)


def build_pipe_shotgun():
    """Improvised scattergun: a rusted pipe wired to a rough wooden stock.
    Muzzle points -Y, matching the AK so both read the same way in hand."""
    cyl(0.032, 0.95, y=-0.34, z=0.42, material="rust", verts=10,
        rot=(math.pi / 2, 0, 0))
    cyl(0.04, 0.09, y=-0.79, z=0.42, material="metal_dark", verts=10,
        rot=(math.pi / 2, 0, 0))
    # Breech and hinge — a break-action built out of scrap
    box(0.075, 0.17, 0.1, y=0.16, z=0.42, material="metal_dark")
    cyl(0.026, 0.09, x=0.0, y=0.07, z=0.37, material="steel_worn", verts=8,
        rot=(0, math.pi / 2, 0))
    # Stock, dropping back and down
    box(0.06, 0.34, 0.1, y=0.4, z=0.4, material="wood_dark", rot=(-0.16, 0, 0))
    box(0.058, 0.13, 0.17, y=0.6, z=0.33, material="wood")
    box(0.05, 0.22, 0.065, y=-0.12, z=0.37, material="wood_dark")
    # Wire lashing holding barrel to fore-end
    wrap(-0.2, -0.02, 0.05, material="metal_dark", turns=4, axis="y",
         pos=(0.0, 0.4))
    # Hammer and trigger
    box(0.018, 0.04, 0.055, y=0.26, z=0.48, material="metal_dark",
        rot=(0.35, 0, 0))
    box(0.014, 0.022, 0.045, y=0.2, z=0.35, material="metal_dark")
    box(0.016, 0.1, 0.014, y=0.24, z=0.325, material="steel_worn")
    export("pipe_shotgun", "items", origin_at_base=True)


def build_pistol():
    """Worn revolver: six-chamber cylinder, wooden grip, exposed hammer."""
    cyl(0.018, 0.3, y=-0.26, z=0.2, material="steel_worn", verts=10,
        rot=(math.pi / 2, 0, 0))
    box(0.026, 0.3, 0.022, y=-0.26, z=0.218, material="metal_dark")
    box(0.032, 0.2, 0.075, y=-0.03, z=0.195, material="steel_worn")
    wear(0.16, 0.07, x=0.017, y=-0.03, z=0.195, count=4, seed=41, normal="x")
    # Cylinder, six chambers bored around it
    cyl(0.05, 0.1, y=-0.05, z=0.19, material="metal_dark", verts=12,
        rot=(math.pi / 2, 0, 0))
    for i in range(6):
        a = i * math.pi / 3.0
        cyl(0.012, 0.104, x=math.cos(a) * 0.032, y=-0.05,
            z=0.19 + math.sin(a) * 0.032, material="gunmetal", verts=6,
            rot=(math.pi / 2, 0, 0))
    # Hammer, trigger and guard
    box(0.018, 0.038, 0.05, y=0.08, z=0.235, material="metal_dark",
        rot=(-0.35, 0, 0))
    box(0.013, 0.022, 0.04, y=0.04, z=0.145, material="metal_dark")
    box(0.015, 0.08, 0.013, y=0.045, z=0.122, material="steel_worn")
    box(0.015, 0.013, 0.035, y=0.085, z=0.138, material="steel_worn")
    # Raked wooden grip
    box(0.038, 0.09, 0.19, y=0.11, z=0.09, material="wood_dark",
        rot=(-0.35, 0, 0))
    box(0.043, 0.05, 0.07, y=0.14, z=0.14, material="wood")
    export("pistol", "items", origin_at_base=True)


def build_wood():
    """Stacked logs with visible end grain."""
    for i, (x, z) in enumerate([(-0.14, 0.13), (0.14, 0.13), (0.0, 0.35)]):
        cyl(0.13, 0.56, x=x, z=z, material="bark", verts=12,
            rot=(0, math.pi / 2, 0))
        for sy in (-1, 1):
            cyl(0.105, 0.02, x=x + sy * 0.285, z=z, material="wood_light",
                verts=12, rot=(0, math.pi / 2, 0))
    export("wood", "items", origin_at_base=True)


def build_stone():
    rock(0.26, z=0.24, material="stone", seed=101)
    rock(0.17, x=0.28, y=0.1, z=0.15, material="stone_dark", seed=102)
    rock(0.14, x=-0.26, y=-0.09, z=0.13, material="stone", seed=103)
    export("stone", "items", origin_at_base=True)


def build_sulfur():
    rock(0.24, z=0.22, material="stone_dark", seed=201)
    for i in range(6):
        a = i * 1.047 + 0.4
        box(0.11, 0.11, 0.15,
            x=math.cos(a) * 0.19, y=math.sin(a) * 0.19, z=0.26 + (i % 3) * 0.08,
            material="sulfur_ore", rot=(a * 0.7, a, 0))
    export("sulfur", "items", origin_at_base=True)


def build_bandage():
    cyl(0.16, 0.2, z=0.16, material="gauze", verts=16, rot=(0, math.pi / 2, 0))
    cyl(0.05, 0.21, z=0.16, material="fabric", verts=12, rot=(0, math.pi / 2, 0))
    # Loose tail
    box(0.2, 0.18, 0.012, x=0.02, y=0.2, z=0.05, material="gauze", rot=(0.1, 0, 0))
    box(0.09, 0.026, 0.014, y=0.2, z=0.06, material="medical")
    box(0.026, 0.09, 0.014, y=0.2, z=0.06, material="medical")
    export("bandage", "items", origin_at_base=True)


def build_codelock():
    box(0.3, 0.12, 0.42, z=0.21, material="metal_dark")
    box(0.24, 0.03, 0.34, y=-0.07, z=0.22, material="gunmetal")
    # Keypad
    for r in range(4):
        for c in range(3):
            box(0.05, 0.02, 0.05,
                x=-0.07 + c * 0.07, y=-0.09, z=0.35 - r * 0.075,
                material="warning" if (r == 0 and c == 1) else "metal")
    box(0.1, 0.05, 0.06, x=0.0, y=0.05, z=0.44, material="brass")
    export("codelock", "items", origin_at_base=True)


def build_frag():
    """A heap of torn metal fragments."""
    for i in range(9):
        a = i * 0.7
        box(0.16, 0.11, 0.035,
            x=math.cos(a) * 0.14 * (1 + i % 2), y=math.sin(a) * 0.12,
            z=0.03 + (i % 3) * 0.05,
            material="metal" if i % 2 == 0 else "metal_dark",
            rot=(a * 0.5, a * 0.8, a))
    export("frag", "items", origin_at_base=True)


def build_scrap():
    for i in range(6):
        a = i * 1.05
        cyl(0.035, 0.26, x=math.cos(a) * 0.13, y=math.sin(a) * 0.11,
            z=0.05 + (i % 3) * 0.055, material="rust", verts=6,
            rot=(math.pi / 2 + a * 0.4, a, a * 0.3))
    box(0.22, 0.18, 0.03, z=0.02, material="metal_dark", rot=(0, 0, 0.5))
    export("scrap", "items", origin_at_base=True)


def build_cloth():
    for i in range(3):
        box(0.42 - i * 0.04, 0.32 - i * 0.03, 0.05,
            z=0.03 + i * 0.055, material="fabric" if i % 2 == 0 else "wood_light",
            rot=(0, 0, i * 0.12))
    box(0.44, 0.06, 0.02, z=0.2, material="leather")
    export("cloth", "items", origin_at_base=True)


# ==========================================================================
# Driver
# ==========================================================================

BUILDERS = [
    build_foundation, build_wall, build_doorway, build_window_wall,
    build_ceiling, build_stairs, build_wooden_door, build_tool_cupboard,
    build_stone_foundation, build_stone_wall, build_metal_door,
    build_triangle_foundation, build_half_wall, build_low_wall,
    build_pillar, build_roof, build_ladder, build_barricade,
    build_garage_door,
    build_rock, build_stone_hatchet, build_stone_pickaxe,
    build_metal_hatchet, build_metal_pickaxe, build_drill, build_bow,
    build_torch, build_spear,
    build_chainsaw, build_jackhammer, build_repair_tool,
    build_binoculars, build_flashlight, build_wire_tool,
    build_workbench_t1, build_research_table, build_furnace,
    build_storage_box, build_large_box,
    build_recycler, build_advanced_recycler, build_hitech_recycler,
    build_generator, build_solar_panel, build_wind_turbine, build_battery,
    build_auto_turret, build_shotgun_trap, build_flame_trap,
    build_tesla_coil, build_alarm, build_motion_sensor,
    build_smart_switch, build_camera, build_land_mine, build_bear_trap,
    build_wolf, build_bear, build_deer, build_boar, build_scientist,
    build_rabbit, build_chicken,
    build_stone_node, build_metal_node, build_sulfur_node,
    build_c4, build_grenade, build_rocket, build_rocket_launcher,
    build_machete, build_ak47, build_pipe_shotgun, build_pistol,
    build_building_plan, build_hammer,
    build_wood, build_stone, build_sulfur, build_bandage,
    build_codelock, build_frag, build_scrap, build_cloth,
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
