"""Inspect every exported GLB's own JSON chunk.

The Blender glTF exporter reports success even when it silently drops
materials it cannot represent, so the exported file is checked directly
rather than trusting the exporter's exit code.

    python tools/blender/verify_glb.py
"""

import json
import os
import struct
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..",
                    "godot", "assets", "models")


def read_gltf_json(path):
    with open(path, "rb") as fh:
        data = fh.read()
    magic, _version, _length = struct.unpack("<4sII", data[:12])
    if magic != b"glTF":
        raise ValueError("not a GLB file")
    chunk_len, chunk_type = struct.unpack("<II", data[12:20])
    if chunk_type != 0x4E4F534A:
        raise ValueError("first chunk is not JSON")
    return json.loads(data[20:20 + chunk_len])


def main():
    problems = []
    total = 0
    for category in sorted(os.listdir(ROOT)):
        cat_dir = os.path.join(ROOT, category)
        if not os.path.isdir(cat_dir):
            continue
        print("[%s]" % category)
        for name in sorted(os.listdir(cat_dir)):
            if not name.endswith(".glb"):
                continue
            total += 1
            path = os.path.join(cat_dir, name)
            g = read_gltf_json(path)
            meshes = g.get("meshes", [])
            materials = g.get("materials", [])
            prims = sum(len(m.get("primitives", [])) for m in meshes)
            verts = len(g.get("accessors", []))

            if not meshes:
                problems.append("%s/%s has no meshes" % (category, name))
            if not materials:
                problems.append("%s/%s has no materials" % (category, name))
            # External texture references would break once the file moves
            for img in g.get("images", []):
                if "uri" in img:
                    problems.append("%s/%s references external image %s"
                                    % (category, name, img["uri"]))
            for m in materials:
                pbr = m.get("pbrMetallicRoughness", {})
                if "baseColorFactor" not in pbr and "baseColorTexture" not in pbr:
                    problems.append("%s/%s material '%s' has no base colour"
                                    % (category, name, m.get("name", "?")))

            print("  %-22s meshes=%d prims=%d mats=%-2d accessors=%d"
                  % (name, len(meshes), prims, len(materials), verts))

    print("-" * 62)
    if problems:
        print("PROBLEMS (%d):" % len(problems))
        for p in problems:
            print("  - " + p)
        sys.exit(1)
    print("All %d GLB files verified: meshes present, materials embedded, "
          "no external texture references." % total)


if __name__ == "__main__":
    main()
