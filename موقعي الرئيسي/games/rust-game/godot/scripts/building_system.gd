extends Node3D
## Building system: ghost preview with grid snap, placement validation
## (support / Tool Cupboard rules), tier upgrade and repair. Port of the
## Three.js building functions.

var world: Node3D
var player: CharacterBody3D

var _ghost: MeshInstance3D
var _ghost_type := ""
var _ghost_mat: StandardMaterial3D
var _ghost_valid := false
var _ghost_pos := Vector3.ZERO
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
	var hit: Dictionary = player._camera_ray(Game.BUILD_DISTANCE, 1 | 2)
	if hit.is_empty():
		_ghost.visible = false
		_ghost_valid = false
		return

	var point: Vector3 = hit.position
	var snap_x := roundf(point.x / 3.0) * 3.0
	var snap_z := roundf(point.z / 3.0) * 3.0
	var target_y: float = bt.y

	_ghost_base = null
	var collider: Object = hit.collider
	if collider != null and collider.has_method("toggle_door"):
		_ghost_base = collider
		if bp == "ceiling":
			target_y = collider.position.y + 3.0
		elif bp == "wall" or bp == "doorway":
			target_y = collider.position.y

	_ghost_pos = Vector3(snap_x, target_y, snap_z)
	_ghost.position = _ghost_pos
	_ghost.rotation.y = Game.blueprint_rotation
	_ghost.visible = true

	_ghost_valid = can_build_here(_ghost_pos, bp)
	_ghost_mat.albedo_color = Color(0, 1, 0, 0.4) if _ghost_valid else Color(1, 0, 0, 0.4)


func can_build_here(pos: Vector3, type: String) -> bool:
	var bt: Dictionary = Game.BUILDING_TYPES[type]
	var pos2 := Vector2(pos.x, pos.z)

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
			var d := pos2.distance_to(Vector2(s.position.x, s.position.z))
			if d < 0.5 and (s.build_type == "foundation" or s.build_type == "ceiling"):
				has_foundation = true
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
	s.base_rot = Game.blueprint_rotation
	s.rotation.y = s.base_rot
	world.add_child(s)
	world.register_structure(s)

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
