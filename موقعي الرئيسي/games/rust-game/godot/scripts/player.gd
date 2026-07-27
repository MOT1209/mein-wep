extends CharacterBody3D
## First/third-person player controller: mouse look, movement + sprint +
## jump, water slowdown, footsteps, torch light, interaction raycasts
## (harvest / attack / doors / hammer / stations), consumables, drinking
## from lakes, belt slots and building-plan input.

const SPEED := 7.0
const SPRINT_SPEED := 10.5
const JUMP_VELOCITY := 9.5
const GRAVITY := 26.0
const MOUSE_SENS := 0.002

var world: Node3D
var hud: CanvasLayer
var head: Node3D
var spring: SpringArm3D
var camera: Camera3D
var body_visual: Node3D
var torch_light: OmniLight3D
var third_person := false
var looking_at_structure: Node3D = null
var in_water := false

var _step_distance := 0.0
var _drink_cd := 0.0
var _weapon_cd := 0.0


func _ready() -> void:
	collision_layer = 16
	collision_mask = 7  # terrain + structures + resources

	var cs := CollisionShape3D.new()
	var cap := CapsuleShape3D.new()
	cap.radius = 0.4
	cap.height = 1.8
	cs.shape = cap
	cs.position.y = 0.9
	add_child(cs)

	head = Node3D.new()
	head.position = Vector3(0, 1.6, 0)
	add_child(head)

	spring = SpringArm3D.new()
	spring.spring_length = 0.0
	spring.collision_mask = 3
	head.add_child(spring)
	spring.add_excluded_object(get_rid())

	camera = Camera3D.new()
	camera.current = true
	camera.far = 2000.0
	spring.add_child(camera)

	torch_light = OmniLight3D.new()
	torch_light.light_color = Color(1.0, 0.62, 0.28)
	torch_light.omni_range = 9.0
	torch_light.light_energy = 1.8
	torch_light.position = Vector3(0, 1.5, 0)
	torch_light.visible = false
	add_child(torch_light)

	_build_visual()


func _build_visual() -> void:
	# Blocky survivor body, visible only in third person
	body_visual = Node3D.new()
	add_child(body_visual)

	var torso := MeshInstance3D.new()
	var torso_mesh := BoxMesh.new()
	torso_mesh.size = Vector3(0.6, 0.8, 0.3)
	var torso_mat := StandardMaterial3D.new()
	torso_mat.albedo_color = Color8(139, 50, 44)
	torso_mesh.material = torso_mat
	torso.mesh = torso_mesh
	torso.position.y = 1.25
	body_visual.add_child(torso)

	var head_mi := MeshInstance3D.new()
	var head_mesh := BoxMesh.new()
	head_mesh.size = Vector3(0.3, 0.35, 0.3)
	var head_mat := StandardMaterial3D.new()
	head_mat.albedo_color = Color8(255, 219, 172)
	head_mesh.material = head_mat
	head_mi.mesh = head_mesh
	head_mi.position.y = 1.85
	body_visual.add_child(head_mi)

	var leg_mesh := BoxMesh.new()
	leg_mesh.size = Vector3(0.25, 0.8, 0.25)
	var leg_mat := StandardMaterial3D.new()
	leg_mat.albedo_color = Color8(34, 34, 34)
	leg_mesh.material = leg_mat
	for lx in [-0.15, 0.15]:
		var leg := MeshInstance3D.new()
		leg.mesh = leg_mesh
		leg.position = Vector3(lx, 0.4, 0)
		body_visual.add_child(leg)

	body_visual.visible = false


func _unhandled_input(event: InputEvent) -> void:
	# ESC/pause is handled by the HUD, which keeps running while paused.
	if event.is_action_pressed("inventory"):
		if hud != null and Game.ui_open in ["", "inventory"]:
			hud.toggle_inventory()
		return

	if Game.ui_open != "":
		return

	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		apply_look(event.relative)
	elif event.is_action_pressed("attack"):
		_primary_action()
	elif event.is_action_pressed("build_menu"):
		if Game.active_tool() == "building_plan":
			hud.open_blueprint_menu()
	elif event.is_action_pressed("interact"):
		_try_drink()
	elif event.is_action_pressed("blueprint"):
		hud.open_blueprint_menu()
	elif event.is_action_pressed("rotate_piece"):
		if Game.selected_blueprint != "":
			Game.blueprint_rotation = fmod(Game.blueprint_rotation + PI / 2.0, TAU)
			Game.notify("Rotated %d°" % roundi(rad_to_deg(Game.blueprint_rotation)), Color(1.0, 0.63, 0.0))
	elif event.is_action_pressed("cancel_build"):
		if Game.selected_blueprint != "":
			Game.selected_blueprint = ""
			Game.notify("Build mode cancelled", Color(1.0, 0.63, 0.0))
	elif event.is_action_pressed("hammer_action"):
		_hammer_action()
	elif event.is_action_pressed("toggle_view"):
		_toggle_view()
	else:
		for i in 6:
			if event.is_action_pressed("slot_%d" % (i + 1)):
				Game.selected_belt_slot = i
				Game.belt_changed.emit()
				break


## Rotate the view by a pixel delta. Shared by mouse look and the touch
## look-drag, so both paths obey the same sensitivity and pitch clamp.
func apply_look(rel: Vector2) -> void:
	rotate_y(-rel.x * MOUSE_SENS)
	head.rotate_x(-rel.y * MOUSE_SENS)
	head.rotation.x = clampf(head.rotation.x, -PI / 2.0, PI / 2.0)


func _toggle_view() -> void:
	third_person = not third_person
	spring.spring_length = 5.0 if third_person else 0.0
	spring.position = Vector3(0, 0.4, 0) if third_person else Vector3.ZERO
	body_visual.visible = third_person
	Game.notify("View: %s" % ("THIRD" if third_person else "FIRST"), Color(0.2, 0.6, 0.9))


func _physics_process(delta: float) -> void:
	_drink_cd = maxf(0.0, _drink_cd - delta)
	_weapon_cd = maxf(0.0, _weapon_cd - delta)
	in_water = world.is_in_water(global_position)

	if not is_on_floor():
		velocity.y -= GRAVITY * delta
	elif Game.ui_open == "" and Input.is_action_just_pressed("jump"):
		velocity.y = JUMP_VELOCITY

	var input_dir := Vector2.ZERO
	if Game.ui_open == "":
		input_dir = Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var dir := (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()

	var speed := SPEED
	if Input.is_action_pressed("sprint") and not in_water:
		speed = SPRINT_SPEED
	if in_water:
		speed *= 0.55

	if dir != Vector3.ZERO:
		velocity.x = dir.x * speed
		velocity.z = dir.z * speed
	else:
		velocity.x = move_toward(velocity.x, 0.0, SPEED * 10.0 * delta)
		velocity.z = move_toward(velocity.z, 0.0, SPEED * 10.0 * delta)

	move_and_slide()

	# Footsteps
	if is_on_floor():
		_step_distance += Vector2(velocity.x, velocity.z).length() * delta
		if _step_distance > 2.4:
			_step_distance = 0.0
			Sfx.play("step")

	# Torch: hold it in the belt to light your way at night
	torch_light.visible = Game.active_tool() == "torch" and Game.get_count("torch") > 0
	if torch_light.visible:
		torch_light.light_energy = 1.7 + sin(world.clock * 9.0) * 0.25

	_inspect_structures()


## Keeps the HUD build-info panel in sync with whatever structure is in view.
func _inspect_structures() -> void:
	looking_at_structure = null
	if hud == null:
		return
	var hit := _camera_ray(Game.INTERACT_DISTANCE, 2)
	if not hit.is_empty() and hit.collider.has_method("toggle_door"):
		looking_at_structure = hit.collider
	hud.update_build_info(looking_at_structure)


func _camera_ray(dist: float, mask: int) -> Dictionary:
	var from := camera.global_position
	var to := from + (-camera.global_transform.basis.z) * dist
	var query := PhysicsRayQueryParameters3D.create(from, to, mask, [get_rid()])
	return get_world_3d().direct_space_state.intersect_ray(query)


func _try_drink() -> void:
	if not in_water or _drink_cd > 0.0:
		return
	_drink_cd = 0.8
	Game.stats.thirst = clampf(Game.stats.thirst + 35.0, 0.0, 100.0)
	Game.notify("You drank from the lake")
	Sfx.play("drink")


func _primary_action() -> void:
	var tool := Game.active_tool()

	# 1. Building Plan: place selected piece
	if tool == "building_plan":
		if Game.selected_blueprint != "":
			world.building.place_structure()
		else:
			Game.notify("Right Click to select piece", Color(1.0, 0.63, 0.0))
		return

	# 2. Deployables (campfire, furnace, workbench, boxes...): place on ground
	if Game.DEPLOYABLES.has(tool):
		var ground_hit := _camera_ray(Game.BUILD_DISTANCE, 1)
		if not ground_hit.is_empty():
			world.place_station(tool, ground_hit.position)
		else:
			Game.notify("Aim at the ground to place", Color(1.0, 0.63, 0.0))
		return

	# 3. Consumables: eat / use
	if Game.CONSUMABLES.has(tool):
		Game.consume_item(tool)
		return

	# 4. Raiding gear
	if Game.EXPLOSIVES.has(tool):
		_use_explosive(tool)
		return
	if tool == "rocket_launcher":
		_fire_rocket()
		return

	# 5. Weapons swing or fire; bare hands fall through to the gather ray
	if Game.WEAPONS.has(tool):
		_use_weapon(tool)
		return

	# 4. Interact ray: structures (2) + resources (4) + NPCs (8)
	var hit := _camera_ray(Game.INTERACT_DISTANCE, 2 | 4 | 8)
	if hit.is_empty():
		return
	var obj: Object = hit.collider

	# Campfire / furnace interaction
	if obj.has_method("interact_station"):
		obj.interact_station()
		return

	# Doors toggle open/closed, or take the lock you are holding
	if obj.has_method("toggle_door"):
		if obj.is_door:
			if Game.LOCKS.has(tool):
				_install_lock(obj, tool)
			else:
				obj.toggle_door()
			return
		# Tool Cupboard: stock it with upkeep materials
		if obj.build_type == "tool_cupboard" and tool != "hammer":
			obj.deposit_upkeep()
			return
		# Hammer: repair or upgrade
		if tool == "hammer":
			if obj.health < obj.max_health:
				world.building.repair_structure(obj)
			else:
				world.building.upgrade_structure(obj)
			return
		# Bare fist on a structure chips it
		obj.take_hit(1.0)
		Sfx.play("hit")
		return

	# Bare-handed strike
	if obj.has_method("npc_take_damage"):
		obj.npc_take_damage(Game.FIST_DAMAGE)
		Sfx.play("hit")
		_spawn_hit_particles(hit.position, Color(0.8, 0.2, 0.2))
		return

	# Resource harvest
	if obj.has_method("hit_harvest"):
		var colors := {
			"tree": Color(0.45, 0.3, 0.15), "rock": Color(0.6, 0.6, 0.6),
			"iron": Color(0.65, 0.7, 0.75), "sulfur": Color(0.95, 0.85, 0.3),
			"barrel": Color(0.1, 0.5, 0.8), "crate": Color(1.0, 0.65, 0.0),
			"bush": Color(0.8, 0.2, 0.3),
		}
		_spawn_hit_particles(hit.position, colors.get(obj.res_type, Color.WHITE))
		obj.hit_harvest(tool)


## One-shot burst of tiny cubes at the impact point.
func _spawn_hit_particles(pos: Vector3, color: Color) -> void:
	var parts := CPUParticles3D.new()
	parts.one_shot = true
	parts.emitting = true
	parts.amount = 8
	parts.lifetime = 0.5
	parts.explosiveness = 1.0
	parts.direction = Vector3(0, 1, 0)
	parts.spread = 60.0
	parts.initial_velocity_min = 1.5
	parts.initial_velocity_max = 3.0
	parts.gravity = Vector3(0, -9.0, 0)
	var m := BoxMesh.new()
	m.size = Vector3(0.07, 0.07, 0.07)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	m.material = mat
	parts.mesh = m
	world.add_child(parts)
	parts.global_position = pos
	var t := get_tree().create_timer(1.2)
	t.timeout.connect(func():
		if is_instance_valid(parts):
			parts.queue_free())


## Fits the held lock onto the door you are aiming at. Locked doors still
## open for you — the point is that nothing hostile can follow you through.
func _install_lock(door: Node3D, id: String) -> void:
	var label: String = Game.LOCKS[id].name
	if door.is_locked():
		Game.notify("That door already has a lock", Color(1.0, 0.63, 0.0))
		return
	if Game.get_count(id) <= 0:
		Game.notify("Craft a %s first" % label, Color(0.9, 0.3, 0.3))
		return
	if not door.install_lock(id):
		return
	_consume_from_belt(id)
	Game.notify("%s installed" % label)
	Sfx.play("build")


## Swings a melee weapon or fires a ranged one. Ranged weapons spend a
## round and reach much further; both hit creatures and structures.
func _use_weapon(id: String) -> void:
	var data: Dictionary = Game.WEAPONS[id]
	if _weapon_cd > 0.0:
		return
	_weapon_cd = float(data.cooldown)

	var ammo := str(data.get("ammo", ""))
	if ammo != "":
		if Game.get_count(ammo) <= 0:
			Game.notify("Out of %s" % Game.ITEMS[ammo].name, Color(0.9, 0.3, 0.3))
			return
		Game.remove_item(ammo, 1)

	var hit := _camera_ray(float(data.range), 2 | 4 | 8)
	Sfx.play("hit" if ammo == "" else "explosion")
	if hit.is_empty():
		return

	var obj: Object = hit.collider
	var damage := float(data.damage)
	if obj.has_method("npc_take_damage"):
		obj.npc_take_damage(damage)
		_spawn_hit_particles(hit.position, Color(0.8, 0.2, 0.2))
	elif obj.has_method("take_hit"):
		# Bullets chip structures far more slowly than explosives
		obj.take_hit(damage * 0.25)
		_spawn_hit_particles(hit.position, Color(0.9, 0.85, 0.6))
	elif obj.has_method("hit_harvest"):
		obj.hit_harvest(id)
		_spawn_hit_particles(hit.position, Color(0.7, 0.7, 0.7))


## Satchel charges stick to whatever you are aiming at; grenades get lobbed.
func _use_explosive(id: String) -> void:
	if Game.get_count(id) <= 0:
		return
	var data: Dictionary = Game.EXPLOSIVES[id]
	var forward := -camera.global_transform.basis.z

	if data.mode == "place":
		var hit := _camera_ray(Game.INTERACT_DISTANCE, 1 | 2)
		if hit.is_empty():
			Game.notify("Aim at a wall to plant the charge", Color(1.0, 0.63, 0.0))
			return
		# Sit slightly proud of the surface so the charge is visible
		world.spawn_explosive(id, hit.position + hit.normal * 0.15)
		Game.notify("Charge planted — %ds" % int(data.fuse), Color(1.0, 0.4, 0.2))
	else:
		var start := camera.global_position + forward * 0.8
		world.spawn_explosive(id, start, forward * float(data.speed) + Vector3.UP * 2.0)
		Game.notify("%s thrown" % Game.ITEMS[id].name, Color(1.0, 0.63, 0.0))

	_consume_from_belt(id)
	Sfx.play("build")


func _fire_rocket() -> void:
	if Game.get_count("rocket") <= 0:
		Game.notify("Out of rockets", Color(0.9, 0.3, 0.3))
		return
	var data: Dictionary = Game.EXPLOSIVES["rocket"]
	var forward := -camera.global_transform.basis.z
	world.spawn_explosive("rocket", camera.global_position + forward * 1.2,
		forward * float(data.speed))
	Game.remove_item("rocket", 1)
	Game.notify("Rocket away", Color(1.0, 0.4, 0.2))
	Sfx.play("explosion")


## Spends one of an item and clears the belt slot when the stack runs out.
func _consume_from_belt(id: String) -> void:
	Game.remove_item(id, 1)
	if Game.get_count(id) <= 0:
		for i in Game.belt.size():
			if Game.belt[i] == id:
				Game.belt[i] = null
		Game.belt_changed.emit()


func _hammer_action() -> void:
	if Game.active_tool() != "hammer":
		Game.notify("Requires Hammer", Color(0.9, 0.3, 0.3))
		return
	if looking_at_structure == null:
		return
	var s := looking_at_structure
	if s.health < s.max_health:
		world.building.repair_structure(s)
	else:
		world.building.upgrade_structure(s)
