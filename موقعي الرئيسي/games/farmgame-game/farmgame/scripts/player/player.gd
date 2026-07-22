extends CharacterBody3D
## الشخصية الرئيسية: حركة WASD، جاذبية، والتفاعل مع المحاصيل عبر Raycast
## تم إضافة particles للحركة

const SPEED: float = 5.0
const JUMP_VELOCITY: float = 4.5
const MOUSE_SENSITIVITY: float = 0.003
const INTERACTION_ENERGY_COST: float = 2.0

@onready var camera_pivot: Node3D = $CameraPivot
@onready var camera_arm: Node3D = $CameraPivot/CameraArm
@onready var interaction_ray: RayCast3D = $CameraPivot/CameraArm/Camera3D/InteractionRay
@onready var stats: Node = $PlayerStats
@onready var animation_player: AnimationPlayer = $CharacterModel.get_node_or_null("AnimationPlayer") as AnimationPlayer

var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")
var _dust_particles: GPUParticles3D = null
var _is_moving: bool = false


func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	_create_dust_particles()


func _create_dust_particles() -> void:
	_dust_particles = GPUParticles3D.new()
	_dust_particles.name = "DustParticles"
	add_child(_dust_particles)

	## إعداد material الجسيمات
	var material: ParticleProcessMaterial = ParticleProcessMaterial.new()
	material.direction = Vector3(0, 1, 0)
	material.spread = 45.0
	material.initial_velocity_min = 0.5
	material.initial_velocity_max = 1.0
	material.gravity = Vector3(0, -2.0, 0)
	material.scale_min = 0.1
	material.scale_max = 0.2
	material.color = Color(0.7, 0.6, 0.5)

	## إعداد draw pass
	var draw_mesh: QuadMesh = QuadMesh.new()
	draw_mesh.size = Vector2(0.1, 0.1)
	var draw_material: StandardMaterial3D = StandardMaterial3D.new()
	draw_material.albedo_color = Color(0.7, 0.6, 0.5)
	draw_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	draw_material.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	draw_mesh.material = draw_material
	_dust_particles.draw_pass_1 = draw_mesh

	## إعداد ParticleProcessMaterial
	_dust_particles.process_material = material
	_dust_particles.amount = 8
	_dust_particles.lifetime = 0.5
	_dust_particles.one_shot = false
	_dust_particles.emitting = false
	_dust_particles.position = Vector3(0, 0.1, 0)


func _unhandled_input(event: InputEvent) -> void:
	if Input.mouse_mode != Input.MOUSE_MODE_CAPTURED:
		return

	if event is InputEventMouseMotion:
		rotate_y(-event.relative.x * MOUSE_SENSITIVITY)
		camera_pivot.rotate_x(-event.relative.y * MOUSE_SENSITIVITY)
		camera_pivot.rotation.x = clampf(camera_pivot.rotation.x, deg_to_rad(-80), deg_to_rad(80))

	if event.is_action_pressed("interact"):
		_try_interact()

	if event.is_action_pressed("cycle_seed"):
		InventorySystem.cycle_selected_seed()


func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y -= gravity * delta

	var menu_open: bool = Input.mouse_mode != Input.MOUSE_MODE_CAPTURED

	if not menu_open and Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = JUMP_VELOCITY

	var input_dir: Vector2 = Vector2.ZERO if menu_open else Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var direction: Vector3 = (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()

	if direction:
		velocity.x = direction.x * SPEED
		velocity.z = direction.z * SPEED
	else:
		velocity.x = move_toward(velocity.x, 0, SPEED)
		velocity.z = move_toward(velocity.z, 0, SPEED)

	_is_moving = direction != Vector3.ZERO

	## تشغيل/إيقاف particles الحركة
	if _dust_particles:
		_dust_particles.emitting = _is_moving and is_on_floor()

	_update_animation(_is_moving)

	move_and_slide()
	EventBus.player_moved.emit(global_position)


func _update_animation(is_moving: bool) -> void:
	if animation_player == null:
		return
	var target_animation: String = "walk" if is_moving else "idle"
	if animation_player.current_animation != target_animation:
		animation_player.play(target_animation)


func _try_interact() -> void:
	if not interaction_ray.is_colliding():
		return

	var target: Object = interaction_ray.get_collider()
	if target and target.has_method("interact"):
		target.interact(self)
		stats.spend_energy(INTERACTION_ENERGY_COST)
		_create_interaction_effect(target.global_position)


func _create_interaction_effect(position: Vector3) -> void:
	## إنشاء تأثير بصرية عند التفاعل
	var effect: GPUParticles3D = GPUParticles3D.new()
	effect.position = position
	effect.position.y += 0.5
	get_parent().add_child(effect)

	## إعداد material الجسيمات
	var material: ParticleProcessMaterial = ParticleProcessMaterial.new()
	material.direction = Vector3(0, 1, 0)
	material.spread = 180.0
	material.initial_velocity_min = 1.0
	material.initial_velocity_max = 2.0
	material.gravity = Vector3(0, -5.0, 0)
	material.scale_min = 0.05
	material.scale_max = 0.1
	material.color = Color(1.0, 0.9, 0.3)

	## إعداد draw pass
	var draw_mesh: QuadMesh = QuadMesh.new()
	draw_mesh.size = Vector2(0.05, 0.05)
	var draw_material: StandardMaterial3D = StandardMaterial3D.new()
	draw_material.albedo_color = Color(1.0, 0.9, 0.3)
	draw_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	draw_material.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	draw_mesh.material = draw_material
	effect.draw_pass_1 = draw_mesh

	effect.process_material = material
	effect.amount = 12
	effect.lifetime = 0.3
	effect.one_shot = true
	effect.emitting = true

	## حذف التأثير بعد انتهاءه
	await get_tree().create_timer(0.5).timeout
	effect.queue_free()
