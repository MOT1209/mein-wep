extends Node3D
## A live explosive: a satchel charge stuck to a wall, a thrown grenade or
## a fired rocket. Handles its own flight, fuse and blast.
##
## Blast damage is applied through the structure's tier resistance, which
## is what makes upgrading a base worth the resources.

const ModelRegistry := preload("res://scripts/model_registry.gd")

var explosive_id := "c4"
var world: Node3D
var velocity := Vector3.ZERO
var gravity := 0.0

var _fuse := 0.0
var _spent := false


func setup(id: String, w: Node3D) -> void:
	explosive_id = id
	world = w
	var data: Dictionary = Game.EXPLOSIVES[id]
	_fuse = float(data.fuse)
	gravity = float(data.get("gravity", 0.0))

	var model := ModelRegistry.spawn(id)
	if model != null:
		add_child(model)
	else:
		var mi := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = Vector3(0.25, 0.25, 0.25)
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color8(200, 60, 40)
		box.material = mat
		mi.mesh = box
		add_child(mi)

	# Blinking arming light so a live charge is obvious
	var light := OmniLight3D.new()
	light.name = "FuseLight"
	light.light_color = Color(1.0, 0.25, 0.15)
	light.omni_range = 4.0
	light.light_energy = 1.5
	light.position.y = 0.3
	add_child(light)


func _physics_process(delta: float) -> void:
	if _spent:
		return

	if velocity != Vector3.ZERO:
		velocity.y -= gravity * delta
		var from := global_position
		var to := from + velocity * delta
		var query := PhysicsRayQueryParameters3D.create(from, to, 1 | 2 | 4 | 8)
		var hit := get_world_3d().direct_space_state.intersect_ray(query)
		if not hit.is_empty():
			global_position = hit.position
			var data: Dictionary = Game.EXPLOSIVES[explosive_id]
			if bool(data.get("impact", false)):
				_detonate()
				return
			# Bouncy things (grenades) settle where they land
			velocity = Vector3.ZERO
		else:
			global_position = to
			look_at(to + velocity, Vector3.UP)

	_fuse -= delta
	var light: OmniLight3D = get_node_or_null("FuseLight")
	if light != null:
		# Blink faster as the fuse runs out
		light.light_energy = 1.2 + 1.2 * sin(_fuse * (14.0 - minf(_fuse, 6.0)))
	if _fuse <= 0.0:
		_detonate()


func _detonate() -> void:
	if _spent:
		return
	_spent = true
	var data: Dictionary = Game.EXPLOSIVES[explosive_id]
	var damage := float(data.damage)
	var radius := float(data.radius)
	var origin := global_position

	world.apply_explosion(origin, damage, radius)
	_spawn_blast_vfx(origin, radius)
	Sfx.play("explosion")
	queue_free()


func _spawn_blast_vfx(origin: Vector3, radius: float) -> void:
	var parts := CPUParticles3D.new()
	parts.one_shot = true
	parts.emitting = true
	parts.amount = 48
	parts.lifetime = 0.9
	parts.explosiveness = 1.0
	parts.spread = 180.0
	parts.initial_velocity_min = radius * 1.5
	parts.initial_velocity_max = radius * 3.5
	parts.gravity = Vector3(0, -6.0, 0)
	var m := BoxMesh.new()
	m.size = Vector3(0.2, 0.2, 0.2)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(1.0, 0.55, 0.15)
	mat.emission_enabled = true
	mat.emission = Color(1.0, 0.4, 0.05)
	mat.emission_energy_multiplier = 3.0
	m.material = mat
	parts.mesh = m
	world.add_child(parts)
	parts.global_position = origin

	var flash := OmniLight3D.new()
	flash.light_color = Color(1.0, 0.6, 0.25)
	flash.omni_range = radius * 3.0
	flash.light_energy = 8.0
	world.add_child(flash)
	flash.global_position = origin

	var tw := world.create_tween()
	tw.tween_property(flash, "light_energy", 0.0, 0.5)
	tw.tween_callback(flash.queue_free)

	var t := world.get_tree().create_timer(1.8)
	t.timeout.connect(func():
		if is_instance_valid(parts):
			parts.queue_free())
