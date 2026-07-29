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

	# Creatures — origin at the base
	"npc_wolf": "res://assets/models/creatures/wolf.glb",
	"npc_bear": "res://assets/models/creatures/bear.glb",
	"npc_deer": "res://assets/models/creatures/deer.glb",
	"npc_boar": "res://assets/models/creatures/boar.glb",
	"npc_scientist": "res://assets/models/creatures/scientist.glb",

	# Deployables — origin at the base
	"furnace": "res://assets/models/deployables/furnace.glb",
	"workbench_t1": "res://assets/models/deployables/workbench_t1.glb",
	"workbench_t2": "res://assets/models/deployables/workbench_t1.glb",
	"research_table": "res://assets/models/deployables/research_table.glb",
	"storage_box": "res://assets/models/deployables/storage_box.glb",
	"large_box": "res://assets/models/deployables/large_box.glb",

	# Harvestable resource nodes — origin at the base. Prefixed because the
	# mined item shares the raw id ("sulfur" the ore chunk vs the boulder).
	"node_rock": "res://assets/models/resources/stone_node.glb",
	"node_iron": "res://assets/models/resources/metal_node.glb",
	"node_sulfur": "res://assets/models/resources/sulfur_node.glb",

	# Held tools and weapons — origin at the grip
	"rock_tool": "res://assets/models/tools/rock.glb",
	"stone_hatchet": "res://assets/models/tools/stone_hatchet.glb",
	"stone_pickaxe": "res://assets/models/tools/stone_pickaxe.glb",
	"metal_hatchet": "res://assets/models/tools/metal_hatchet.glb",
	"metal_pickaxe": "res://assets/models/tools/metal_pickaxe.glb",
	"drill": "res://assets/models/tools/drill.glb",
	"bow": "res://assets/models/tools/bow.glb",
	"torch": "res://assets/models/tools/torch.glb",
	"spear": "res://assets/models/tools/spear.glb",

	# Inventory items — also usable in-hand and dropped in the world
	"machete": "res://assets/models/items/machete.glb",
	"ak47": "res://assets/models/items/ak47.glb",
	"pipe_shotgun": "res://assets/models/items/pipe_shotgun.glb",
	"pistol": "res://assets/models/items/pistol.glb",
	"building_plan": "res://assets/models/items/building_plan.glb",
	"hammer": "res://assets/models/items/hammer.glb",
	"wood": "res://assets/models/items/wood.glb",
	"stone": "res://assets/models/items/stone.glb",
	"sulfur": "res://assets/models/items/sulfur.glb",
	"bandage": "res://assets/models/items/bandage.glb",
	"codelock": "res://assets/models/items/codelock.glb",
	"frag": "res://assets/models/items/frag.glb",
	"scrap": "res://assets/models/items/scrap.glb",
	"cloth": "res://assets/models/items/cloth.glb",

	# Raiding gear
	"c4": "res://assets/models/explosives/c4.glb",
	"grenade": "res://assets/models/explosives/grenade.glb",
	"rocket": "res://assets/models/explosives/rocket.glb",
	"rocket_launcher": "res://assets/models/explosives/rocket_launcher.glb",
}

## Building pieces that get a model of their own once they are upgraded far
## enough, instead of only being repainted. A stone wall is coursed rubble,
## not planks with a grey tint, and a metal door is the one a raider has to
## bring explosives for — both should look like what they cost.
##
## Tiers not listed here fall back to the base model plus `tint`, which is
## still the right answer for twig and for the top tiers, where the shape
## does not change so much as the material.
const TIER_MODELS := {
	"wall": {
		"stone": "res://assets/models/building/stone_wall.glb",
		"concrete": "res://assets/models/building/stone_wall.glb",
	},
	"foundation": {
		"stone": "res://assets/models/building/stone_foundation.glb",
		"concrete": "res://assets/models/building/stone_foundation.glb",
	},
	"wooden_door": {
		"metal": "res://assets/models/building/metal_door.glb",
		"hqm": "res://assets/models/building/metal_door.glb",
	},
}

## The tier each of those models was actually painted for. At that tier the
## model keeps its own materials; a tier above reuses the same shape under
## the tier's flat colour — so concrete still reads as concrete poured over
## stone coursing, and an armoured door as brighter steel, instead of every
## upper tier collapsing into one identical look.
const TIER_MODEL_NATIVE := {
	"wall": "stone",
	"foundation": "stone",
	"wooden_door": "metal",
}

static var _cache: Dictionary = {}


static func has_model(id: String) -> bool:
	return MODELS.has(id) and ResourceLoader.exists(MODELS[id])


## Model path for a building piece at a given tier: the tier's own model
## when one exists and is on disk, otherwise the piece's base model. Empty
## when the piece has no model at all.
static func model_for(id: String, tier: String) -> String:
	if TIER_MODELS.has(id):
		var path: String = TIER_MODELS[id].get(tier, "")
		if path != "" and ResourceLoader.exists(path):
			return path
	return MODELS.get(id, "")


## True when the model shown at this tier was painted for it and should keep
## its own materials rather than being flattened to the tier colour.
static func keeps_own_materials(id: String, tier: String) -> bool:
	return TIER_MODEL_NATIVE.get(id, "") == tier and model_for(id, tier) != MODELS.get(id, "")


## Instantiated copy of a specific model path, for callers that resolved the
## path themselves via `model_for`.
static func spawn_path(path: String) -> Node3D:
	var packed := _packed_path(path)
	if packed == null:
		return null
	return packed.instantiate()


## Instantiated copy of the model, or null when the id has no usable model.
static func spawn(id: String) -> Node3D:
	var packed := _packed(id)
	if packed == null:
		return null
	return packed.instantiate()


static func _packed(id: String) -> PackedScene:
	if not MODELS.has(id):
		return null
	return _packed_path(MODELS[id])


## Loads and caches one model path. Keyed by path rather than by id so a
## tier model shared by two pieces is only ever loaded once.
static func _packed_path(path: String) -> PackedScene:
	if path == "":
		return null
	if _cache.has(path):
		return _cache[path]
	var packed: PackedScene = null
	if ResourceLoader.exists(path):
		var res := load(path)
		if res is PackedScene:
			packed = res
		else:
			push_warning("ModelRegistry: %s did not load as a PackedScene" % path)
	else:
		push_warning("ModelRegistry: missing model %s" % path)
	_cache[path] = packed
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
