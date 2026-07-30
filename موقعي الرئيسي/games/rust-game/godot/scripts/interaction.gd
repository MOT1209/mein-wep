extends Node
## The universal interact button's brain: works out the one thing the player
## means, says what it is, and does it.
##
## One button has to cover doors, boxes, furnaces, recyclers, generators,
## switches, cupboards, loot bags and every harvestable in the world. Guessing
## wrongly is worse than having no button at all — opening a door when the
## player meant to loot the crate behind it is the kind of thing that loses a
## fight — so candidates are scored rather than taken first-found.
##
## Three scores decide it: whether it is under the crosshair, how close it is,
## and whether it matches what the player is holding. That last one is the
## interesting one. A hammer means you are thinking about the wall, not the
## door in it; a wire tool means you want the generator, not the box beside it.

## How far the crosshair ray reaches, and how far the proximity sweep goes for
## things you are standing next to but not looking straight at.
const REACH := 5.0
const PROXIMITY := 3.2

## Scoring weights. The crosshair dominates — if you are looking at something,
## that is what you meant.
const SCORE_CROSSHAIR := 1000.0
const SCORE_INTENT := 260.0
## Falls off with distance so the nearer of two equal candidates wins.
const SCORE_DISTANCE := 60.0

## Interacting again with the same thing is refused for this long, which is
## what stops a held finger toggling a door open and shut every frame.
const COOLDOWN := 0.35

var world: Node3D
var player: CharacterBody3D

## What the button would act on right now, and how to describe it.
var target: Object = null
var label := ""
var verb := ""

var _cd := 0.0
var _outline: MeshInstance3D
var _outlined: Object = null


func _process(delta: float) -> void:
	_cd = maxf(0.0, _cd - delta)
	if world == null or player == null or not world.started:
		_set_target(null)
		return
	if Game.ui_open != "":
		_set_target(null)
		return
	_set_target(_best_candidate())


# ==================== FINDING THE TARGET ====================

## Everything worth considering, scored, best first.
func _best_candidate() -> Object:
	var best: Object = null
	var best_score := -INF

	# Whatever the crosshair is on, which is almost always the answer
	var hit: Dictionary = player._camera_ray(REACH, 2 | 4 | Game.LAYER_FLOOR)
	if not hit.is_empty():
		var looked: Object = hit.collider
		if _is_interactable(looked):
			best = looked
			best_score = SCORE_CROSSHAIR + _score_of(looked)

	# Then things within arm's reach that the crosshair missed
	for candidate in _nearby():
		if candidate == best:
			continue
		var score := _score_of(candidate)
		if score > best_score:
			best_score = score
			best = candidate
	return best


## Deployed things close enough to touch. Read from the world's own lists
## rather than by sweeping physics, because these are exactly the lists the
## world already keeps.
func _nearby() -> Array:
	var out := []
	var here: Vector3 = player.global_position
	for group in [world.stations, world.devices, world.bags, world.structures]:
		for node in group:
			if not is_instance_valid(node):
				continue
			if here.distance_to(node.global_position) > PROXIMITY:
				continue
			if _is_interactable(node):
				out.append(node)
	return out


func _is_interactable(node: Object) -> bool:
	if node == null or not is_instance_valid(node):
		return false
	return node.has_method("interact_station") or node.has_method("toggle_door") \
		or node.has_method("hit_harvest")


## Closer is better, and matching what you are holding is better still.
func _score_of(node: Object) -> float:
	var distance: float = player.global_position.distance_to(node.global_position)
	var score: float = SCORE_DISTANCE * (1.0 - clampf(distance / REACH, 0.0, 1.0))
	if _matches_intent(node):
		score += SCORE_INTENT
	return score


## Does this target match the tool in the player's hand? This is what makes
## one button feel like it is reading your mind rather than guessing.
func _matches_intent(node: Object) -> bool:
	var held := Game.active_tool()
	if held == "":
		return false

	# A repair tool or a hammer means you are thinking about the structure
	if held == "hammer" or held == "repair_tool" or held == "jackhammer":
		if node.has_method("take_hit") and not node.has_method("hit_harvest"):
			return node.health < node.max_health or held != "repair_tool"

	# A lock in hand means the door, not whatever is behind it
	if Game.LOCKS.has(held):
		return node.has_method("toggle_door") and node.is_door

	# A wire tool means the wiring
	if held == "wire_tool":
		return "device_type" in node

	# Upkeep materials mean the cupboard
	if held in Game.UPKEEP_MATERIALS:
		return node.has_method("toggle_door") and node.build_type == "tool_cupboard"

	# A gathering tool means the node it gathers
	var ResNode = load("res://scripts/resource_node.gd")
	if node.has_method("hit_harvest") and ResNode.TOOL_YIELD.has(node.res_type):
		return ResNode.TOOL_YIELD[node.res_type].has(held)
	return false


func _set_target(node: Object) -> void:
	if node == target:
		_place_outline()
		return
	target = node
	if node == null:
		label = ""
		verb = ""
	else:
		label = _label_for(node)
		verb = _verb_for(node)
	_place_outline()


## What to call the thing, for the on-screen prompt.
func _label_for(node: Object) -> String:
	if node.has_method("hit_harvest"):
		return str(node.res_type).replace("_", " ").capitalize()
	if node.has_method("toggle_door"):
		return str(Game.BUILDING_TYPES[node.build_type].name)
	# Tested by property, not by method: station.gd also has power_draw() for
	# the powered recyclers, so a method check calls a station a device and
	# then falls over reading device_type off it.
	if "device_type" in node:
		return str(node.label())
	if node.has_method("total") and node.has_method("is_empty"):
		return "Loot Bag"
	if "station_type" in node:
		return str(Game.ITEMS.get(node.station_type, {}).get("name", node.station_type))
	return "Object"


## What the button will do to it, in the player's words.
func _verb_for(node: Object) -> String:
	var held := Game.active_tool()
	if node.has_method("hit_harvest"):
		return "Harvest"
	if node.has_method("toggle_door"):
		if node.is_door:
			if node.is_locked() and not node.player_may_open():
				return "Locked"
			return "Close" if node.is_open else "Open"
		if node.build_type == "tool_cupboard":
			return "Stock"
		if held == "hammer" or held == "repair_tool":
			return "Repair" if node.health < node.max_health else "Upgrade"
		return "Hit"
	if node.has_method("total") and node.has_method("is_empty"):
		return "Loot"
	if "device_type" in node:
		return "Use"
	if "station_type" in node:
		match str(node.station_type):
			"campfire":
				return "Cook"
			"furnace":
				return "Smelt"
			"research_table":
				return "Research"
			"storage_box", "large_box":
				return "Open"
			"recycler", "advanced_recycler", "hitech_recycler":
				return "Recycle"
			"sleeping_bag":
				return "Set Spawn"
		return "Use"
	return "Use"


## The prompt the HUD shows, or an empty string when there is nothing in reach.
func prompt() -> String:
	if target == null:
		return ""
	return "%s %s" % [verb, label]


# ==================== DOING IT ====================

## A tap: the immediate action. Doors open, boxes open, furnaces run.
func interact_tap() -> bool:
	if target == null or _cd > 0.0:
		return false
	_cd = COOLDOWN
	var node := target

	if node.has_method("interact_station"):
		node.interact_station()
		Game.haptic(0.5)
		return true

	if node.has_method("toggle_door"):
		if node.is_door:
			var held := Game.active_tool()
			if Game.LOCKS.has(held):
				player._install_lock(node, held)
			else:
				node.toggle_door()
			Game.haptic(0.5)
			return true
		if node.build_type == "tool_cupboard":
			node.deposit_upkeep()
			Game.haptic(0.6)
			return true
		# A structure with a hammer in hand: repair it, or upgrade it
		var tool := Game.active_tool()
		if tool == "hammer" or tool == "repair_tool":
			if node.health < node.max_health:
				world.building.repair_structure(node)
			else:
				world.building.upgrade_structure(node)
			Game.haptic(0.6)
			return true
		return false

	if node.has_method("hit_harvest"):
		node.hit_harvest(Game.active_tool(), node.global_position)
		Game.haptic(0.4)
		return true
	return false


## A hold: the longer job. On a structure that is the upgrade rather than the
## repair; on a bag it empties the whole thing rather than one stack.
func interact_hold() -> bool:
	if target == null or _cd > 0.0:
		return false
	var node := target
	if node.has_method("toggle_door") and not node.is_door:
		var tool := Game.active_tool()
		if tool == "hammer" or tool == "jackhammer":
			_cd = COOLDOWN
			world.building.upgrade_structure(node)
			Game.haptic(0.9)
			return true
	return interact_tap()


## A double tap: the shortcut. On a door it forces it open and leaves it open,
## which is what you want when you are running through your own base.
func interact_double() -> bool:
	if target == null:
		return false
	var node := target
	if node.has_method("toggle_door") and node.is_door:
		_cd = 0.0
		if not node.player_may_open():
			return false
		node.set_door_state(true)
		Sfx.play("door")
		Game.haptic(0.7)
		return true
	return interact_tap()


# ==================== HIGHLIGHT ====================

## A wireframe box around whatever is targeted. Drawn as its own mesh rather
## than by tinting the target, because tinting replaces the model's materials
## and a highlight has to be able to go away again cleanly.
func _place_outline() -> void:
	if target == null:
		if _outline != null:
			_outline.visible = false
		_outlined = null
		return

	if _outline == null:
		_outline = MeshInstance3D.new()
		_outline.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		var mat := StandardMaterial3D.new()
		mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		mat.albedo_color = Color(1.0, 0.85, 0.35, 0.9)
		mat.emission_enabled = true
		mat.emission = Color(1.0, 0.8, 0.3)
		mat.emission_energy_multiplier = 2.0
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		_outline.material_override = mat
		world.add_child(_outline)

	if target != _outlined:
		_outline.mesh = _wire_box(_bounds_of(target))
		_outlined = target
	_outline.global_position = target.global_position
	_outline.visible = true


## The size of box to draw round a target, in its own space.
func _bounds_of(node: Object) -> Vector3:
	var size := Vector3(1.0, 1.0, 1.0)
	if node.has_method("toggle_door") and Game.BUILDING_TYPES.has(node.build_type):
		size = Game.BUILDING_TYPES[node.build_type].size
	elif "device_type" in node and Game.DEVICES.has(node.device_type):
		size = Game.DEVICES[node.device_type].size
	# Slightly proud of the object so the lines do not sit inside its faces
	return size + Vector3(0.12, 0.12, 0.12)


## Twelve edges of a box as a line mesh.
static func _wire_box(size: Vector3) -> ArrayMesh:
	var h := size * 0.5
	var corners := [
		Vector3(-h.x, -h.y, -h.z), Vector3(h.x, -h.y, -h.z),
		Vector3(h.x, -h.y, h.z), Vector3(-h.x, -h.y, h.z),
		Vector3(-h.x, h.y, -h.z), Vector3(h.x, h.y, -h.z),
		Vector3(h.x, h.y, h.z), Vector3(-h.x, h.y, h.z),
	]
	var edges := [[0, 1], [1, 2], [2, 3], [3, 0],
		[4, 5], [5, 6], [6, 7], [7, 4],
		[0, 4], [1, 5], [2, 6], [3, 7]]
	var verts := PackedVector3Array()
	for edge in edges:
		verts.append(corners[edge[0]])
		verts.append(corners[edge[1]])
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = verts
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_LINES, arrays)
	return mesh
