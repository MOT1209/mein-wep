extends Node3D
## Building system: ghost preview with grid snap, placement validation
## (support / Tool Cupboard rules), tier upgrade and repair. Port of the
## Three.js building functions.

## Real Rust never centres a wall on a foundation tile: it snaps to one of
## the tile's four edge sockets, so the wall closes off one side instead of
## splitting the tile in half. These three share that edge-snap behaviour;
## a door is edge-snapped too but inherits its position from the doorway
## it fills rather than computing an offset of its own.
const EDGE_TYPES := ["wall", "doorway", "window_wall"]

var world: Node3D
var player: CharacterBody3D

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
		var box := BoxMesh.new()
		box.size = bt.size
		_ghost_mat = StandardMaterial3D.new()
		_ghost_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		_ghost_mat.albedo_color = Color(0, 1, 0, 0.4)
		_ghost_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		box.material = _ghost_mat
		_ghost.mesh = box
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

	if bp == "wooden_door":
		# A door has no tile of its own: it fills whatever doorway it is
		# aimed at, at that doorway's exact position and orientation.
		if _ghost_base == null or _ghost_base.build_type != "doorway":
			_ghost.visible = false
			_ghost_valid = false
			return
		_ghost_pos = _ghost_base.position
		_ghost_rot = _ghost_base.base_rot
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
		_ghost_pos = Vector3(snap_x, target_y, snap_z)
		_ghost_rot = Game.blueprint_rotation

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
			if s.build_type != "foundation" and s.build_type != "ceiling":
				continue
			var spos := Vector2(s.position.x, s.position.z)
			for sp in support_points:
				if spos.distance_to(sp) < 0.5:
					has_foundation = true
					break
			if has_foundation:
				break
		if not has_foundation and type != "foundation":
			return false

	# 3. Doors need a doorway at the same snap point
	if type == "wooden_door":
		var on_doorway := false
		for s in world.structures:
			if not is_instance_valid(s):
				continue
			var d2 := pos2.distance_to(Vector2(s.position.x, s.position.z))
			if d2 < 0.5 and s.build_type == "doorway":
				on_doorway = true
				break
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
	var s: StaticBody3D = preload("res://scripts/structure.gd").new()
	s.setup(bp)
	s.position = _ghost_pos
	s.base_rot = _ghost_rot
	s.rotation.y = s.base_rot
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

	# Grow-in placement animation
	s.scale = Vector3(0.1, 0.1, 0.1)
	var tw := s.create_tween()
	tw.tween_property(s, "scale", Vector3.ONE, 0.15)

	Sfx.play("build")


func upgrade_structure(s: Node3D) -> void:
	var idx := Game.TIER_ORDER.find(s.tier)
	if idx < 0 or idx >= Game.TIER_ORDER.size() - 1:
		return
	var next_tier: String = Game.TIER_ORDER[idx + 1]
	var cost: Dictionary = Game.BUILDING_TIERS[next_tier].cost
	if not Game.can_afford(cost):
		Game.notify("Not enough resources to upgrade", Color(0.9, 0.3, 0.3))
		return
	Game.consume(cost)
	s.apply_tier(next_tier)
	Game.notify("Upgraded to %s" % Game.BUILDING_TIERS[next_tier].name)
	Sfx.play("upgrade")


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
