extends CharacterBody3D
## الشخصية الرئيسية: حركة WASD، جاذبية، والتفاعل مع المحاصيل عبر Raycast

const SPEED: float = 5.0
const JUMP_VELOCITY: float = 4.5
const MOUSE_SENSITIVITY: float = 0.003
const INTERACTION_ENERGY_COST: float = 2.0

@onready var camera_pivot: Node3D = $CameraPivot
@onready var camera: Camera3D = $CameraPivot/Camera3D
@onready var interaction_ray: RayCast3D = $CameraPivot/Camera3D/InteractionRay
@onready var stats: Node = $PlayerStats
@onready var animation_player: AnimationPlayer = $CharacterModel/AnimationPlayer

var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")


func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


func _unhandled_input(event: InputEvent) -> void:
	if Input.mouse_mode != Input.MOUSE_MODE_CAPTURED:
		return

	if event is InputEventMouseMotion:
		rotate_y(-event.relative.x * MOUSE_SENSITIVITY)
		camera_pivot.rotate_x(-event.relative.y * MOUSE_SENSITIVITY)
		camera_pivot.rotation.x = clampf(camera_pivot.rotation.x, deg_to_rad(-80), deg_to_rad(80))

	if event.is_action_pressed("interact"):
		_try_interact()


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

	_update_animation(direction != Vector3.ZERO)

	move_and_slide()
	EventBus.player_moved.emit(global_position)


func _update_animation(is_moving: bool) -> void:
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
