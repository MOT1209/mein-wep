extends Node3D
## Building system: ghost preview with grid snap, placement validation
## (support / Tool Cupboard rules), tier upgrade and repair. Port of the
## Three.js building functions.

## Real Rust never centres a wall on a foundation tile: it snaps to one of
## the tile's four edge sockets, so the wall closes off one side instead of
## splitting the tile in half. These three share that edge-snap behaviour;
## a door is edge-snapped too but inherits its position from the doorway
## it fills rather than computing an offset of its own.
const EDGE_TYPES := ["wall", "half_wall", "low_wall", "doorway", "window_wall", "ladder"]

## Pieces that stand on the ground wherever you aim rather than on a tile:
## they carry nothing and nothing is carried on them, so pinning them to a
## fixed height would only float them off a slope.
const GROUND_TYPES := ["barricade"]

const StructureScript := preload("res://scripts/structure.gd")

## How many building actions can be taken back. Ten, which is about one
## room's worth of mistakes.
const UNDO_DEPTH := 10

## Free-standing pieces are the only ones that snap finer than the tile grid.
##
## The tile grid is 3m because the pieces are 3m: the support checks, the
## stability columns and the edge sockets are all addressed by 3m cell, so
## offering a 0.5m snap for a wall would let two of them share a cell and put
## the whole structural model out of step with what is on screen. A barricade
## carries nothing and is carried by nothing, so it is free to sit anywhere.
const FREE_SNAP_STEPS := [0.5, 1.0, 2.0]

var world: Node3D
var player: CharacterBody3D

## Actions that can be undone, oldest first: {"kind", "type", "pos", "rot",
## "tier", "soft"}. Only placements and demolitions go in — an upgrade is
## recorded as the tier it was raised from.
var _undo_stack: Array = []
var _redo_stack: Array = []
## Which of FREE_SNAP_STEPS a free-standing piece snaps to.
var free_snap_index := 1
## Manual height offset on the ghost, in metres. Pinching raises and lowers a
## piece for the cases the automatic height gets wrong — a wall on a slope, a
## barricade on a step.
var height_offset := 0.0
const HEIGHT_LIMIT := 3.0


## Raises or lowers the piece being placed, within a storey either way.
func adjust_height(delta_metres: float) -> float:
	height_offset = clampf(height_offset + delta_metres, -HEIGHT_LIMIT, HEIGHT_LIMIT)
	return height_offset


func reset_height() -> void:
	height_offset = 0.0

var _ghost: MeshInstance3D
var _ghost_type := ""
var _ghost_mat: StandardMaterial3D
var _ghost_valid := false
var _ghost_pos := Vector3.ZERO
var _ghost_rot := 0.0
var _ghost_base: Node3D = null  # structure the ray hit, if any


func _process(_delta: float) -> void:
	_update_ghost()


func _update_ghost() -> void:
	var active := Game.active_tool()
	if active != "building_plan" or Game.selected_blueprint == "" or Game.ui_open != "":
		if _ghost != null:
			_ghost.visible = false
		return

	var bp := Game.selected_blueprint
	var bt: Dictionary = Game.BUILDING_TYPES[bp]

	if _ghost == null or _ghost_type != bp:
		if _ghost != null:
			_ghost.queue_free()
		_ghost = MeshInstance3D.new()
		_ghost_mat = StandardMaterial3D.new()
		_ghost_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		_ghost_mat.albedo_color = Color(0, 1, 0, 0.4)
		_ghost_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		# The preview is built from the same solid the piece will be, so a
		# triangle previews as a triangle and a roof as a slope — you can
		# tell which way round it is going before you commit to it.
		var shape := str(bt.get("shape", "box"))
		if shape == "box":
			var box := BoxMesh.new()
			box.size = bt.size
			box.material = _ghost_mat
			_ghost.mesh = box
		else:
			_ghost.mesh = StructureScript._solid_mesh(shape, bt.size, _ghost_mat)
		_ghost.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		add_child(_ghost)
		_ghost_type = bp

	# Ray against terrain (1) + structures (2)
	var hit: Dictionary = player._camera_ray(Game.BUILD_DISTANCE, 1 | 2 | Game.LAYER_FLOOR)
	if hit.is_empty():
		_ghost.visible = false
		_ghost_valid = false
		return

	var point: Vector3 = hit.position
	var collider: Object = hit.collider
	_ghost_base = collider if (collider != null and collider.has_method("toggle_door")) else null

	var support_points: Array[Vector2] = []

	if bp in Game.DOOR_FILLS_DOORWAY:
		# A door has no tile of its own: it fills whatever doorway it is
		# aimed at, at that doorway's exact position and orientation.
		if _ghost_base == null or _ghost_base.build_type != "doorway":
			_ghost.visible = false
			_ghost_valid = false
			return
		_ghost_pos = _ghost_base.position
		_ghost_rot = _ghost_base.base_rot
	elif bp in GROUND_TYPES:
		# Free-standing: it goes where you are aiming, standing on whatever
		# the ground is doing there rather than on a tile — snapped to a step
		# the player chooses, since nothing structural depends on where it is.
		var step: float = free_snap()
		_ghost_pos = Vector3(
			snappedf(point.x, step), point.y + bt.size.y * 0.5, snappedf(point.z, step))
		_ghost_rot = Game.blueprint_rotation
	elif bp == "pillar":
		# Pillars go on tile corners, not tile centres — one pillar braces
		# the up-to-four tiles that meet there.
		var cx := roundf((point.x - 1.5) / 3.0) * 3.0 + 1.5
		var cz := roundf((point.z - 1.5) / 3.0) * 3.0 + 1.5
		var pillar_y: float = bt.y
		if _ghost_base != null and _ghost_base.build_type == "ceiling":
			pillar_y = _ghost_base.position.y + bt.y
		_ghost_pos = Vector3(cx, pillar_y, cz)
		_ghost_rot = 0.0
		for ox in [-1.5, 1.5]:
			for oz in [-1.5, 1.5]:
				support_points.append(Vector2(cx + ox, cz + oz))
	elif bp in EDGE_TYPES:
		var tile_x := roundf(point.x / 3.0) * 3.0
		var tile_z := roundf(point.z / 3.0) * 3.0
		var local_x := point.x - tile_x
		var local_z := point.z - tile_z
		var target_y: float = bt.y
		if _ghost_base != null and _ghost_base.build_type == "ceiling":
			target_y = _ghost_base.position.y + bt.y

		if absf(local_x) >= absf(local_z):
			var sx := 1.0 if local_x >= 0.0 else -1.0
			_ghost_pos = Vector3(tile_x + 1.5 * sx, target_y, tile_z)
			_ghost_rot = PI / 2.0
			support_points = [Vector2(tile_x, tile_z), Vector2(tile_x + 3.0 * sx, tile_z)]
		else:
			var sz := 1.0 if local_z >= 0.0 else -1.0
			_ghost_pos = Vector3(tile_x, target_y, tile_z + 1.5 * sz)
			_ghost_rot = 0.0
			support_points = [Vector2(tile_x, tile_z), Vector2(tile_x, tile_z + 3.0 * sz)]
	else:
		var snap_x := roundf(point.x / 3.0) * 3.0
		var snap_z := roundf(point.z / 3.0) * 3.0
		var target_y: float = bt.y
		if _ghost_base != null and bp == "ceiling":
			target_y = _ghost_base.position.y + 3.0
		elif _ghost_base != null and bp == "roof" and _ghost_base.build_type == "ceiling":
			# A pitched roof caps the storey: it sits straight on the ceiling
			# slab rather than a wall's height above it.
			target_y = _ghost_base.position.y + 0.1 + bt.size.y * 0.5
		_ghost_pos = Vector3(snap_x, target_y, snap_z)
		_ghost_rot = Game.blueprint_rotation

	# Whatever the automatic height worked out, the player can override it
	_ghost_pos.y += height_offset
	_ghost.position = _ghost_pos
	_ghost.rotation.y = _ghost_rot
	_ghost.visible = true

	_ghost_valid = can_build_here(_ghost_pos, bp, support_points)
	_ghost_mat.albedo_color = Color(0, 1, 0, 0.4) if _ghost_valid else Color(1, 0, 0, 0.4)


## `support_points` are the tile centres that must have a foundation/ceiling
## for this placement to stand — one for a centred piece (defaults to the
## piece's own position), two for an edge piece that could be held up by
## either of the tiles sharing that edge.
func can_build_here(pos: Vector3, type: String, support_points: Array[Vector2] = []) -> bool:
	var bt: Dictionary = Game.BUILDING_TYPES[type]
	var pos2 := Vector2(pos.x, pos.z)
	if support_points.is_empty():
		support_points = [pos2]

	# 1. Tool Cupboard overlap check
	if type == "tool_cupboard":
		for tc in Game.tool_cupboards:
			if pos2.distance_to(tc) < Game.TC_RADIUS:
				return false

	# 2. Stability / support check
	if bt.requires_support:
		var has_foundation := false
		for s in world.structures:
			if not is_instance_valid(s):
				continue
			if not (s.build_type in Game.SUPPORT_TYPES):
				continue
			var spos := Vector2(s.position.x, s.position.z)
			for sp in support_points:
				if spos.distance_to(sp) < 0.5:
					has_foundation = true
					break
			if has_foundation:
				break
		if not has_foundation and not (type in Game.ANCHOR_TYPES):
			return false

	# 3. Doors need an empty doorway at the same snap point — one leaf each,
	# or a second door could be hung through the first and both would swing.
	if type in Game.DOOR_FILLS_DOORWAY:
		var on_doorway := false
		for s in world.structures:
			if not is_instance_valid(s):
				continue
			if pos2.distance_to(Vector2(s.closed_pos.x, s.closed_pos.z)) >= 0.5:
				continue
			if s.build_type == "doorway":
				on_doorway = true
			elif s.is_door:
				return false
		if not on_doorway:
			return false

	return true


func place_structure() -> void:
	if Game.selected_blueprint == "":
		return
	if _ghost == null or not _ghost.visible:
		return
	if not _ghost_valid:
		Game.notify("Cannot build here: Invalid Support", Color(0.9, 0.3, 0.3))
		return

	var bp := Game.selected_blueprint
	var s: StaticBody3D = StructureScript.new()
	s.setup(bp)
	s.position = _ghost_pos
	s.base_rot = _ghost_rot
	s.rotation.y = s.base_rot
	s.placed_at = world.clock
	# The face you are standing on becomes the weak one, so which way round
	# you raise a wall decides whether a raider has to get inside first.
	if world.player != null:
		var to_builder: Vector3 = world.player.global_position - s.position
		to_builder.y = 0.0
		if to_builder.length() > 0.01:
			s.soft_normal = to_builder.normalized()
	world.add_child(s)
	world.register_structure(s)
	world.recompute_stability()

	if bp == "tool_cupboard":
		Game.tool_cupboards.append(Vector2(_ghost_pos.x, _ghost_pos.z))

	_record({
		"kind": "place", "type": bp, "pos": _ghost_pos, "rot": _ghost_rot,
		"tier": s.tier, "soft": s.soft_normal,
	})
	Game.activity.emit("build", 1)

	# Grow-in placement animation
	s.scale = Vector3(0.1, 0.1, 0.1)
	var tw := s.create_tween()
	tw.tween_property(s, "scale", Vector3.ONE, 0.15)

	Sfx.play("build")


# ==================== SNAPPING, ROTATION, UNDO ====================

func free_snap() -> float:
	return float(FREE_SNAP_STEPS[free_snap_index % FREE_SNAP_STEPS.size()])


## Steps to the next snap spacing for free-standing pieces.
func cycle_free_snap() -> float:
	free_snap_index = (free_snap_index + 1) % FREE_SNAP_STEPS.size()
	Game.notify("Snap: %.1fm" % free_snap(), Color(0.7, 0.85, 1.0))
	return free_snap()


## Turns the piece by an arbitrary angle — what a two-finger twist produces,
## as against the 90-degree steps the R key gives. Edge-snapped pieces ignore
## it, because their rotation comes from which edge of the tile they are on.
func rotate_ghost(radians: float) -> void:
	Game.blueprint_rotation = fmod(Game.blueprint_rotation + radians + TAU, TAU)


## Snaps the current rotation to the nearest quarter turn, so a twist can be
## tidied up rather than left slightly off square.
func square_up_rotation() -> void:
	Game.blueprint_rotation = snappedf(Game.blueprint_rotation, PI / 2.0)


## Records something that can be taken back. Kept to UNDO_DEPTH, and any redo
## history is dropped because the timeline has just branched.
func _record(action: Dictionary) -> void:
	_undo_stack.append(action)
	while _undo_stack.size() > UNDO_DEPTH:
		_undo_stack.pop_front()
	_redo_stack.clear()


func undo_depth() -> int:
	return _undo_stack.size()


func redo_depth() -> int:
	return _redo_stack.size()


## Takes back the last building action: a placement is removed, a demolition
## is rebuilt, an upgrade is dropped back a tier. Materials are returned or
## charged so undoing is free of profit either way.
func undo() -> bool:
	if _undo_stack.is_empty():
		Game.notify("Nothing to undo", Color(1.0, 0.63, 0.0))
		return false
	var action: Dictionary = _undo_stack.pop_back()
	match str(action.kind):
		"place":
			var s := _find_structure(action.pos, str(action.type))
			if s == null:
				Game.notify("That piece is already gone", Color(1.0, 0.63, 0.0))
				return false
			var back: Dictionary = s.salvage_value()
			for res in back:
				Game.add_item(res, int(back[res]))
			s.free_collapsed()
			_redo_stack.append(action)
		"upgrade":
			var up := _find_structure(action.pos, str(action.type))
			if up == null:
				return false
			var cost: Dictionary = Game.BUILDING_TIERS[str(action.to)].cost
			for res in cost:
				Game.add_item(res, int(cost[res]))
			up.apply_tier(str(action.from))
			_redo_stack.append(action)
	Game.notify("Undone", Color(0.8, 0.85, 0.9))
	Game.haptic(0.5)
	world.recompute_stability()
	return true


## Puts back what undo took away.
func redo() -> bool:
	if _redo_stack.is_empty():
		Game.notify("Nothing to redo", Color(1.0, 0.63, 0.0))
		return false
	var action: Dictionary = _redo_stack.pop_back()
	match str(action.kind):
		"place":
			var s: StaticBody3D = StructureScript.new()
			s.setup(str(action.type))
			s.position = action.pos
			s.base_rot = float(action.rot)
			s.rotation.y = s.base_rot
			s.placed_at = world.clock
			world.add_child(s)
			world.register_structure(s)
			s.apply_tier(str(action.get("tier", "twig")))
			var soft = action.get("soft", Vector3.ZERO)
			if soft is Vector3:
				s.soft_normal = soft
			_undo_stack.append(action)
		"upgrade":
			var up := _find_structure(action.pos, str(action.type))
			if up == null:
				return false
			var cost: Dictionary = Game.BUILDING_TIERS[str(action.to)].cost
			if not Game.can_afford(cost):
				Game.notify("Not enough resources to redo that", Color(0.9, 0.3, 0.3))
				return false
			Game.consume(cost)
			up.apply_tier(str(action.to))
			_undo_stack.append(action)
	Game.notify("Redone", Color(0.8, 0.85, 0.9))
	world.recompute_stability()
	return true


## The structure of this type standing at this point, if one still is.
func _find_structure(pos: Vector3, type: String) -> Node3D:
	for s in world.structures:
		if not is_instance_valid(s) or s.build_type != type:
			continue
		if s.closed_pos.distance_to(pos) < 0.4:
			return s
	return null


func upgrade_structure(s: Node3D) -> void:
	var idx := Game.TIER_ORDER.find(s.tier)
	if idx < 0 or idx >= Game.TIER_ORDER.size() - 1:
		return
	var next_tier: String = Game.TIER_ORDER[idx + 1]
	var cost: Dictionary = Game.BUILDING_TIERS[next_tier].cost
	if not Game.can_afford(cost):
		Game.notify("Not enough resources to upgrade", Color(0.9, 0.3, 0.3))
		return
	var was: String = s.tier
	Game.consume(cost)
	s.apply_tier(next_tier)
	_record({
		"kind": "upgrade", "type": s.build_type, "pos": s.closed_pos,
		"from": was, "to": next_tier,
	})
	Game.notify("Upgraded to %s" % Game.BUILDING_TIERS[next_tier].name)
	Sfx.play("upgrade")


## Takes a piece down on purpose and hands back half of what was spent
## upgrading it. Only works inside the demolition window and only where you
## have building privilege, so this is a builder's undo and never a way into
## somebody else's base.
func demolish_structure(s: Node3D) -> void:
	if not Game.has_building_privilege(s.position) and not Game.tool_cupboards.is_empty():
		Game.notify("You lack building privilege here", Color(0.9, 0.3, 0.3))
		return
	if not s.can_demolish(world.clock):
		Game.notify("Too old to demolish — knock it down instead", Color(1.0, 0.63, 0.0))
		return

	var refund: Dictionary = s.salvage_value()
	var label: String = Game.BUILDING_TYPES[s.build_type].name
	var recovered := 0
	for res in refund:
		recovered += Game.add_item(res, int(refund[res]))

	# A Tool Cupboard hands its stock back too, or demolishing one would
	# quietly eat everything stored in it.
	if s.build_type == "tool_cupboard":
		for res in s.upkeep:
			recovered += Game.add_item(res, int(s.upkeep[res]))
		s.upkeep.clear()

	s.free_collapsed()
	if recovered > 0:
		Game.notify("Demolished %s — recovered %d materials" % [label, recovered])
	else:
		Game.notify("Demolished %s" % label)
	Sfx.play("hit")


func repair_structure(s: Node3D) -> void:
	if s.health >= s.max_health:
		return
	var cost: Dictionary = Game.BUILDING_TIERS[s.tier].cost
	if s.tier != "twig":
		var repair_cost := {}
		for res in cost:
			repair_cost[res] = ceili(float(cost[res]) * 0.1)
		if not Game.can_afford(repair_cost):
			Game.notify("Not enough resources to repair", Color(0.9, 0.3, 0.3))
			return
		Game.consume(repair_cost)
	s.health = minf(s.max_health, s.health + s.max_health * 0.1)
	Game.notify("Repaired")
	Sfx.play("build")
