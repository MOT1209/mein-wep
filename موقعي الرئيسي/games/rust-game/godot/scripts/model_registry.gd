extends Object
## Single source of truth mapping content ids to the GLB models produced by
## `tools/blender/build_assets.py`. Every system (building, resources,
## deployables) asks here instead of hardcoding paths, so a new Blender
## batch only ever needs entries added to this table.
##
## Models are looked up with `load()` rather than `preload()` so a missing
## file degrades to the old procedural placeholder instead of breaking the
## whole script at parse time.

const MODELS := {
	# Building pieces — centred on origin, matching Game.BUILDING_TYPES sizes
	"foundation": "res://assets/models/building/foundation.glb",
	"wall": "res://assets/models/building/wall.glb",
	"doorway": "res://assets/models/building/doorway.glb",
	"window_wall": "res://assets/models/building/window_wall.glb",
	"ceiling": "res://assets/models/building/ceiling.glb",
	"stairs": "res://assets/models/building/stairs.glb",
	"wooden_door": "res://assets/models/building/wooden_door.glb",
	"tool_cupboard": "res://assets/models/building/tool_cupboard.glb",

	# Deployables — origin at the base
	"furnace": "res://assets/models/deployables/furnace.glb",
	"workbench_t1": "res://assets/models/deployables/workbench_t1.glb",
	"workbench_t2": "res://assets/models/deployables/workbench_t1.glb",
	"research_table": "res://assets/models/deployables/research_table.glb",
	"storage_box": "res://assets/models/deployables/storage_box.glb",
	"large_box": "res://assets/models/deployables/large_box.glb",

	# Harvestable resource nodes — origin at the base
	"rock": "res://assets/models/resources/stone_node.glb",
	"iron": "res://assets/models/resources/metal_node.glb",
	"sulfur": "res://assets/models/resources/sulfur_node.glb",

	# Held tools and weapons — origin at the grip
	"rock_tool": "res://assets/models/tools/rock.glb",
	"stone_hatchet": "res://assets/models/tools/stone_hatchet.glb",
	"stone_pickaxe": "res://assets/models/tools/stone_pickaxe.glb",
	"metal_hatchet": "res://assets/models/tools/metal_hatchet.glb",
	"metal_pickaxe": "res://assets/models/tools/metal_pickaxe.glb",
	"drill": "res://assets/models/tools/drill.glb",
	"bow": "res://assets/models/tools/bow.glb",

	# Raiding gear
	"c4": "res://assets/models/explosives/c4.glb",
	"grenade": "res://assets/models/explosives/grenade.glb",
	"rocket": "res://assets/models/explosives/rocket.glb",
	"rocket_launcher": "res://assets/models/explosives/rocket_launcher.glb",
}

static var _cache: Dictionary = {}


static func has_model(id: String) -> bool:
	return MODELS.has(id) and ResourceLoader.exists(MODELS[id])


## Instantiated copy of the model, or null when the id has no usable model.
static func spawn(id: String) -> Node3D:
	var packed := _packed(id)
	if packed == null:
		return null
	return packed.instantiate()


static func _packed(id: String) -> PackedScene:
	if _cache.has(id):
		return _cache[id]
	var packed: PackedScene = null
	if MODELS.has(id):
		var path: String = MODELS[id]
		if ResourceLoader.exists(path):
			var res := load(path)
			if res is PackedScene:
				packed = res
			else:
				push_warning("ModelRegistry: %s did not load as a PackedScene" % path)
		else:
			push_warning("ModelRegistry: missing model %s" % path)
	_cache[id] = packed
	return packed


## Paints every mesh in an instantiated model with one flat material.
## Used for building tiers, where a stone wall should read as solid stone
## rather than keeping the wooden model's own per-part colours.
static func tint(node: Node, color: Color, metallic := 0.0, roughness := 0.85) -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = metallic
	mat.roughness = roughness
	_apply_override(node, mat)


## Restores each mesh's own material, as authored in Blender.
static func clear_tint(node: Node) -> void:
	_apply_override(node, null)


static func _apply_override(node: Node, mat: StandardMaterial3D) -> void:
	if node is MeshInstance3D:
		(node as MeshInstance3D).material_override = mat
	for child in node.get_children():
		_apply_override(child, mat)
