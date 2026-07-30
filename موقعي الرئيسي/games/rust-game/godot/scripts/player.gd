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
var flashlight: SpotLight3D
var third_person := false
var looking_at_structure: Node3D = null
var in_water := false

## What binoculars pull the field of view down to. A narrower cone is a longer
## look. The everyday value is no longer a constant — it is the player's own
## `fov` setting, narrowed further by stance and by aiming.
const FOV_GLASSED := 22.0
## Seconds of flashlight burn that cost one point of its cell.
const FLASHLIGHT_DRAIN_INTERVAL := 2.0

var glassing := false
var on_ladder := false
## The device the wire tool is holding one end of, if any.
var wiring_from: Object = null

## How much narrower the view goes when aiming down the sights.
const ADS_FOV_SCALE := 0.62
## Downward speed a landing has to beat before it is felt. Ordinary jumping
## lands well under this, so hopping about does not rattle the camera.
const LAND_SHAKE_SPEED := -12.0
## Radians per second of phone rotation, per unit of gyro sensitivity.
const GYRO_SCALE := 1.0
## Below this much sensor motion the phone counts as being held still, and
## the drift bias is re-learned.
const GYRO_STILL_THRESHOLD := 0.02
const GYRO_SETTLE_TIME := 0.4

## Which way the player has asked the view to point. The transform eases
## towards these rather than being set from the input directly.
var _yaw_target := 0.0
var _pitch_target := 0.0
var _yaw_vel := 0.0
var _pitch_vel := 0.0

## Impact shake
var _shake_amount := 0.0
var _shake_duration := 0.0
var _shake_left := 0.0
var _shake_frequency := 22.0

## Field of view blend
var _fov_from := 75.0
var _fov_to := 75.0
var _fov_elapsed := 0.0

## Gyroscope drift compensation
var _gyro_bias := Vector3.ZERO
var _gyro_settled := 0.0

## Current stance, one of Game.STANCE_*. Movement, the collision capsule, the
## camera height and weapon spread all read this. Spelled as a literal rather
## than through the autoload, because a member initialiser runs before there
## is any guarantee the autoload has registered.
var stance := "stand"
## True while aiming down the sights.
var aiming := false
## True while the breath is being held: steadier aim, quieter, and it burns
## the same oxygen that diving does.
var holding_breath := false

var _step_distance := 0.0
var _drink_cd := 0.0
var _weapon_cd := 0.0
var _flashlight_timer := 0.0
## Stamina bookkeeping: how long since any was spent, and whether sprinting is
## locked out until the bar has recovered a usable amount.
var _stamina_idle := 0.0
var _sprint_locked := false

## Movement tuning
const SLIDE_SPEED := 13.5
const SLIDE_TIME := 0.65
## A slide has to be started from a run, or it is just a crouch with extra
## steps. This is the fraction of walking speed you must already be doing.
const SLIDE_MIN_SPEED := 0.9
const VAULT_MAX_HEIGHT := 1.35
const VAULT_REACH := 1.2
const SWIM_SPEED := 5.0
const DIVE_SPEED := 4.0
## Oxygen, in seconds of held breath before it starts costing health.
const OXYGEN_DRAIN := 8.0
const OXYGEN_REFILL := 26.0
const DROWN_DAMAGE := 6.0
## Leaning: how far the view rolls and shifts, and how long it takes.
const LEAN_ANGLE := 0.28
const LEAN_OFFSET := 0.42
const LEAN_TIME := 0.16

var _body_cs: CollisionShape3D
var _capsule: CapsuleShape3D
## Capsule height and eye height, eased so a stance change reads as the body
## dropping rather than the camera teleporting.
var _height_now := 1.8
var _eye_now := 1.6
var _slide_left := 0.0
var _slide_dir := Vector3.ZERO
## Jumps used since last touching the ground, for the double jump.
var _jumps_used := 0
## Sideways lean, -1 left to +1 right, and where it is easing to.
var _lean := 0.0
var _lean_target := 0.0

## Weapon state: rounds still to send in a queued burst, and the reload timer.
var _burst_left := 0
var _burst_weapon := ""
var _reload_left := 0.0
var _reload_weapon := ""
## Where in a melee combo the last swing was, and when it landed.
var _combo_step := 0
var _combo_at := -99.0
## The last charge thrown, for the quick-throw gesture.
var _last_grenade := ""


func _ready() -> void:
	collision_layer = 16
	collision_mask = 7 | Game.LAYER_FLOOR  # terrain, structures, resources, floors

	# Kept as members: the capsule shrinks and grows with the stance, so
	# crouching really does make a smaller target rather than only looking
	# like one.
	_body_cs = CollisionShape3D.new()
	_capsule = CapsuleShape3D.new()
	_capsule.radius = 0.4
	_capsule.height = 1.8
	_body_cs.shape = _capsule
	_body_cs.position.y = 0.9
	add_child(_body_cs)

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
	camera.fov = float(Game.setting("fov"))
	spring.add_child(camera)
	_fov_from = camera.fov
	_fov_to = camera.fov
	recalibrate_gyro()

	torch_light = OmniLight3D.new()
	torch_light.light_color = Color(1.0, 0.62, 0.28)
	torch_light.omni_range = 9.0
	torch_light.light_energy = 1.8
	torch_light.position = Vector3(0, 1.5, 0)
	torch_light.visible = false
	add_child(torch_light)

	# A torch throws light in every direction and announces you for it. The
	# flashlight is a cone pointed where you look: further, tighter, and only
	# visible to whatever is in front of you.
	flashlight = SpotLight3D.new()
	flashlight.light_color = Color(0.92, 0.95, 1.0)
	flashlight.spot_range = 34.0
	flashlight.spot_angle = 22.0
	flashlight.spot_angle_attenuation = 0.6
	flashlight.light_energy = 4.0
	flashlight.visible = false
	head.add_child(flashlight)

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

	# Hold-to-crouch: letting go stands you back up. Skipped when the player
	# has asked for the stance controls to toggle instead, which is the
	# accessibility option for hands that cannot hold a key down.
	if event.is_action_released("crouch") and not bool(Game.setting("toggle_stance")):
		if stance == Game.STANCE_CROUCH:
			set_stance(Game.STANCE_STAND)
		return

	# Held actions that end when the key comes up
	if event.is_action_released("hold_breath"):
		set_holding_breath(false)
		return
	if event.is_action_released("lean_left") or event.is_action_released("lean_right"):
		set_lean(0.0)
		return

	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		apply_look(event.relative)
	elif event.is_action_pressed("attack"):
		_primary_action()
	elif event.is_action_pressed("build_menu"):
		if Game.active_tool() == "building_plan":
			hud.open_blueprint_menu()
	elif event.is_action_pressed("interact"):
		# Drinking wins while you are standing in water — it is the one
		# interaction with no object to target.
		if not _try_drink():
			interact()
	elif event.is_action_pressed("blueprint"):
		hud.open_blueprint_menu()
	elif event.is_action_pressed("rotate_piece"):
		# One key, two jobs, decided by whether you are building: rotate the
		# piece if there is one on the crosshair, otherwise reload. Both are
		# what a player pressing R means in the moment they press it.
		if Game.selected_blueprint != "":
			Game.blueprint_rotation = fmod(Game.blueprint_rotation + PI / 2.0, TAU)
			Game.notify("Rotated %d°" % roundi(rad_to_deg(Game.blueprint_rotation)), Color(1.0, 0.63, 0.0))
		else:
			start_reload()
	elif event.is_action_pressed("cancel_build"):
		if Game.selected_blueprint != "":
			Game.selected_blueprint = ""
			Game.notify("Build mode cancelled", Color(1.0, 0.63, 0.0))
	elif event.is_action_pressed("hammer_action"):
		_hammer_action()
	elif event.is_action_pressed("demolish"):
		_demolish_action()
	elif event.is_action_pressed("wire_connect"):
		_wire_action()
	elif event.is_action_pressed("toggle_view"):
		_toggle_view()
	elif event.is_action_pressed("crouch"):
		toggle_stance(Game.STANCE_CROUCH)
	elif event.is_action_pressed("prone"):
		toggle_stance(Game.STANCE_PRONE)
	elif event.is_action_pressed("aim"):
		toggle_aiming()
	elif event.is_action_pressed("melee"):
		melee_strike()
	elif event.is_action_pressed("fire_mode"):
		Game.cycle_fire_mode(Game.active_tool())
	elif event.is_action_pressed("hold_breath"):
		set_holding_breath(true)
	elif event.is_action_pressed("inspect"):
		inspect_held()
	elif event.is_action_pressed("throw_grenade"):
		_throw_last_grenade()
	elif event.is_action_pressed("lean_left"):
		set_lean(-1.0)
	elif event.is_action_pressed("lean_right"):
		set_lean(1.0)
	else:
		for i in Game.BELT_SLOTS:
			if event.is_action_pressed("slot_%d" % (i + 1)):
				Game.selected_belt_slot = i
				Game.belt_changed.emit()
				break


## Rotate the view by a pixel delta. Shared by mouse look and the touch
## look-drag, so both paths obey the same sensitivity, inversion and clamp.
##
## The delta lands on a *target* rather than on the transform: the camera then
## eases towards it, which is what turns a finger dragged across glass in
## jerky steps into a pan. Nothing here moves the head directly.
func apply_look(rel: Vector2) -> void:
	var sens: float = MOUSE_SENS * float(Game.setting("look_sensitivity"))
	_yaw_target -= rel.x * sens
	var pitch_delta: float = rel.y * sens
	if bool(Game.setting("invert_look_y")):
		pitch_delta = -pitch_delta
	_pitch_target = clampf(_pitch_target - pitch_delta, -PI / 2.0, PI / 2.0)


## Whether a finger on the camera zone should turn the view at all. In
## gyro-only mode it must not: the point of that mode is that the phone is
## the aim, and a stray thumb would fight it.
func touch_look_enabled() -> bool:
	return not (bool(Game.setting("gyro_enabled")) and bool(Game.setting("gyro_only")))


# ==================== STANCE & MOVEMENT ====================

## How fast this stance moves, before the water and the slide have their say.
## Sprinting is standing-only: you cannot run while crouched or prone, which
## is the whole trade the stances are built on.
func movement_speed() -> float:
	var base := SPEED
	if stance == Game.STANCE_SWIM:
		base = SWIM_SPEED
	elif stance == Game.STANCE_STAND and is_sprinting():
		base = SPRINT_SPEED
	var factor := float(Game.stance_data(stance).speed)
	# Aiming plants your feet. Half speed is what stops ADS being free.
	if aiming:
		factor *= 0.5
	return base * factor


## Sprinting, and whether there is anything left to sprint on. Held down at
## zero it simply stops working rather than stuttering, and it will not start
## again until there is a real amount back in the bar.
func is_sprinting() -> bool:
	if not Input.is_action_pressed("sprint") or stance != Game.STANCE_STAND:
		return false
	if aiming or in_water:
		return false
	if Vector2(velocity.x, velocity.z).length() < 0.5:
		return false
	if _sprint_locked:
		return float(Game.stats.stamina) >= Game.STAMINA_SPRINT_FLOOR
	return float(Game.stats.stamina) > 0.0


## Spends stamina on running and gives it back once you stop. The delay before
## it starts coming back is what makes a sprint a decision rather than a
## rhythm you hold down.
func _update_stamina(delta: float) -> void:
	var spending := is_sprinting()
	if spending:
		Game.stats.stamina = maxf(0.0,
			float(Game.stats.stamina) - Game.STAMINA_SPRINT_DRAIN * delta)
		_stamina_idle = 0.0
		if Game.stats.stamina <= 0.0:
			_sprint_locked = true
	else:
		_stamina_idle += delta
		if _stamina_idle >= Game.STAMINA_REGEN_DELAY:
			Game.stats.stamina = minf(100.0,
				float(Game.stats.stamina) + Game.STAMINA_REGEN * delta)
	if _sprint_locked and float(Game.stats.stamina) >= Game.STAMINA_SPRINT_FLOOR:
		_sprint_locked = false


## Takes a one-off cost, if there is enough. Returns false when there is not,
## which is the caller's cue not to do the thing.
func spend_stamina(amount: float) -> bool:
	if float(Game.stats.stamina) < amount:
		return false
	Game.stats.stamina = maxf(0.0, float(Game.stats.stamina) - amount)
	_stamina_idle = 0.0
	return true


## Is there room to grow back up to `height` where we are standing? Checked
## before any stance change that makes the capsule taller, so standing up
## under a low ceiling simply does not happen rather than launching the
## player through it.
func has_headroom(height: float) -> bool:
	var space := get_world_3d().direct_space_state
	if space == null:
		return true
	var from := global_position + Vector3.UP * 0.15
	var to := global_position + Vector3.UP * (height + 0.05)
	var query := PhysicsRayQueryParameters3D.create(
		from, to, 1 | 2 | Game.LAYER_FLOOR, [get_rid()])
	return space.intersect_ray(query).is_empty()


## Moves to a stance, or refuses. Swimming is not chosen — it is imposed by
## being in water — so it cannot be entered or left by hand.
func set_stance(next: String, announce: bool = true) -> bool:
	if next == stance:
		return true
	if not Game.STANCES.has(next):
		return false
	if stance == Game.STANCE_SWIM and next != Game.STANCE_STAND:
		return false

	var target_height := float(Game.stance_data(next).height)
	if target_height > float(Game.stance_data(stance).height) \
			and not has_headroom(target_height):
		if announce:
			Game.notify("No room to stand up here", Color(1.0, 0.63, 0.0))
		return false

	stance = next
	if announce:
		Game.notify(str(Game.stance_data(next).name), Color(0.7, 0.8, 0.9))
	Game.haptic(0.5)
	return true


## What a stance button does: into the stance if you are not in it, back to
## standing if you are. This is the tap-to-action path, used by the touch
## buttons always and by the keys when the accessibility toggle is on.
func toggle_stance(which: String) -> bool:
	if stance == which:
		return set_stance(Game.STANCE_STAND)
	# Running into a crouch is a slide, not a crouch
	if which == Game.STANCE_CROUCH and try_slide():
		return true
	return set_stance(which)


## Eases the collision capsule and the eye height towards the current stance.
## A full stand-to-prone takes STANCE_BLEND_TIME; a smaller change is quicker.
func _update_stance_shape(delta: float) -> void:
	var data := Game.stance_data(stance)
	var span := float(Game.stance_data(Game.STANCE_STAND).height) \
		- float(Game.stance_data(Game.STANCE_PRONE).height)
	var step := span / Game.STANCE_BLEND_TIME * delta

	_height_now = move_toward(_height_now, float(data.height), step)
	_eye_now = move_toward(_eye_now, float(data.eye), step)

	# Centred on the height the capsule actually took, not the height we asked
	# for: a capsule refuses to be shorter than twice its radius, and using
	# the requested value left the shape hanging below its own centre.
	_capsule.height = maxf(_capsule.radius * 2.0, _height_now)
	_body_cs.position.y = _capsule.height * 0.5
	head.position.y = _eye_now


## Water decides for itself. Wading in puts you in the swim stance and wading
## out takes you back to standing, so there is no way to be prone in a lake.
func _update_swimming() -> void:
	if in_water and stance != Game.STANCE_SWIM:
		stance = Game.STANCE_SWIM
		_slide_left = 0.0
		Game.notify("Swimming", Color(0.4, 0.7, 0.95))
	elif not in_water and stance == Game.STANCE_SWIM:
		stance = Game.STANCE_STAND


## True when the head is actually under the surface — which is what costs
## oxygen, rather than merely standing in the shallows.
func is_submerged() -> bool:
	return in_water and head.global_position.y < world.WATER_LEVEL


## Breath. Runs down while the head is under and refills fast above it; at
## zero the player starts drowning. Held breath while aiming spends it too,
## which is what stops "hold breath" being a free steadying.
func _update_oxygen(delta: float) -> void:
	var spending := is_submerged() or holding_breath
	if spending:
		Game.stats.oxygen = maxf(0.0, float(Game.stats.oxygen) - OXYGEN_DRAIN * delta)
		if Game.stats.oxygen <= 0.0:
			Game.stats.health -= DROWN_DAMAGE * delta
			if is_submerged():
				shake_camera(0.02, 0.4, 12.0)
	else:
		Game.stats.oxygen = minf(100.0, float(Game.stats.oxygen) + OXYGEN_REFILL * delta)
	if holding_breath and Game.stats.oxygen <= 0.0:
		holding_breath = false


## Dives from the surface. Only means anything while swimming, and it is the
## only way down: swimming alone floats you.
func try_dive() -> bool:
	if stance != Game.STANCE_SWIM:
		return false
	velocity.y = -DIVE_SPEED
	Game.haptic(0.4)
	return true


## Slides, if there is enough speed behind it. Returns false when the
## conditions are not there, so the caller can fall back to a plain crouch.
func try_slide() -> bool:
	if _slide_left > 0.0 or not is_on_floor() or stance != Game.STANCE_STAND:
		return false
	var flat := Vector2(velocity.x, velocity.z)
	if flat.length() < SPEED * SLIDE_MIN_SPEED:
		return false
	if not set_stance(Game.STANCE_CROUCH, false):
		return false
	_slide_left = SLIDE_TIME
	_slide_dir = Vector3(flat.x, 0.0, flat.y).normalized()
	Game.notify("Slide", Color(0.8, 0.85, 0.95))
	Game.haptic(0.7)
	Sfx.play("step")
	return true


## Hops a waist-high obstacle. Looks for something solid within reach at shin
## height with clear air above it, then throws the player up and over with an
## impulse sized to clear whatever it found — physics does the arc, so there
## is no animation to desynchronise from the collision.
func try_vault() -> bool:
	if stance == Game.STANCE_SWIM or not is_on_floor():
		return false
	var space := get_world_3d().direct_space_state
	if space == null:
		return false

	var forward := -global_transform.basis.z
	forward.y = 0.0
	if forward.length() < 0.01:
		return false
	forward = forward.normalized()

	# Something at shin height, within reach
	var low_from := global_position + Vector3.UP * 0.35
	var low := space.intersect_ray(PhysicsRayQueryParameters3D.create(
		low_from, low_from + forward * VAULT_REACH, 1 | 2 | Game.LAYER_FLOOR, [get_rid()]))
	if low.is_empty():
		return false

	# ...and nothing at chest height, or it is a wall and not a ledge
	var high_from := global_position + Vector3.UP * (VAULT_MAX_HEIGHT + 0.25)
	var high := space.intersect_ray(PhysicsRayQueryParameters3D.create(
		high_from, high_from + forward * (VAULT_REACH + 0.2),
		1 | 2 | Game.LAYER_FLOOR, [get_rid()]))
	if not high.is_empty():
		return false

	# Find the top of what we are climbing, by looking down onto it
	var over: Vector3 = low.position + forward * 0.35 + Vector3.UP * (VAULT_MAX_HEIGHT + 0.5)
	var top := space.intersect_ray(PhysicsRayQueryParameters3D.create(
		over, over - Vector3.UP * (VAULT_MAX_HEIGHT + 1.0),
		1 | 2 | Game.LAYER_FLOOR, [get_rid()]))
	var ledge: float = float(top.position.y) if not top.is_empty() else \
		global_position.y + VAULT_MAX_HEIGHT
	var rise: float = ledge - global_position.y
	if rise > VAULT_MAX_HEIGHT or rise < 0.15:
		return false

	# Just enough upward speed to clear the ledge, plus a shove forwards
	velocity.y = sqrt(2.0 * GRAVITY * (rise + 0.35))
	velocity.x = forward.x * SPEED * 0.9
	velocity.z = forward.z * SPEED * 0.9
	_jumps_used = 1
	Game.notify("Vault", Color(0.8, 0.9, 0.8))
	Game.haptic(0.6)
	Sfx.play("step")
	return true


## Jump, vault, or double jump — in that order of preference, because a
## player pressing jump at a waist-high wall means "get over it".
func try_jump() -> bool:
	if stance == Game.STANCE_SWIM:
		velocity.y = SWIM_SPEED * 0.6
		return true
	if on_ladder:
		velocity.y = JUMP_VELOCITY
		on_ladder = false
		return true
	if is_on_floor():
		if try_vault():
			return true
		# Crouched or prone, jump stands you up instead of leaving the ground
		if stance != Game.STANCE_STAND:
			return set_stance(Game.STANCE_STAND)
		if not spend_stamina(Game.STAMINA_JUMP_COST):
			return false
		velocity.y = JUMP_VELOCITY
		_jumps_used = 1
		Game.haptic(0.35)
		return true
	if Game.double_jump_unlocked and _jumps_used < 2:
		velocity.y = JUMP_VELOCITY * 0.85
		_jumps_used += 1
		Game.haptic(0.45)
		Sfx.play("step")
		return true
	return false


## Sideways peek. Rolls the camera and shifts it off the shoulder, which is
## enough to see round a doorway without stepping into it.
func set_lean(amount: float) -> void:
	_lean_target = clampf(amount, -1.0, 1.0)


func _update_lean(delta: float) -> void:
	_lean = move_toward(_lean, _lean_target, delta / LEAN_TIME)
	head.rotation.z = -_lean * LEAN_ANGLE
	head.position.x = _lean * LEAN_OFFSET


# ==================== CAMERA ====================

## Eases the view towards where the player has asked it to point, blends the
## field of view, and lays any impact shake on top.
func _update_camera(delta: float) -> void:
	_apply_gyro(delta)

	var damping: float = float(Game.setting("camera_damping"))
	if bool(Game.setting("camera_acceleration")):
		# A critically damped spring: it starts and stops smoothly and never
		# overshoots, which is what "acceleration" has to mean for a camera.
		# Anything that overshoots a crosshair is unusable.
		var stiffness: float = lerpf(90.0, 900.0, damping)
		var yaw := _spring(rotation.y, _yaw_target, _yaw_vel, delta, stiffness)
		rotation.y = yaw[0]
		_yaw_vel = yaw[1]
		var pitch := _spring(head.rotation.x, _pitch_target, _pitch_vel, delta, stiffness)
		head.rotation.x = clampf(pitch[0], -PI / 2.0, PI / 2.0)
		_pitch_vel = pitch[1]
	else:
		# Plain exponential ease. Frame-rate independent, so a phone dropping
		# to 30 fps feels the same as one holding 60.
		var rate: float = lerpf(6.0, 40.0, damping)
		var t: float = 1.0 - exp(-rate * delta)
		rotation.y = lerpf(rotation.y, _yaw_target, t)
		head.rotation.x = clampf(lerpf(head.rotation.x, _pitch_target, t),
			-PI / 2.0, PI / 2.0)
		_yaw_vel = 0.0
		_pitch_vel = 0.0

	_update_shake(delta)
	_update_fov(delta)


## One step of a critically damped spring. Returns [position, velocity].
func _spring(current: float, target: float, vel: float, delta: float,
		stiffness: float) -> Array:
	var accel: float = (target - current) * stiffness - vel * 2.0 * sqrt(stiffness)
	vel += accel * delta
	return [current + vel * delta, vel]


## Kicks the camera. `intensity` is in radians of swing at full strength,
## scaled by the player's own preference so someone who cannot tolerate it
## can turn it off entirely without losing the hit feedback elsewhere.
func shake_camera(intensity: float, duration: float = 0.35,
		frequency: float = 22.0) -> void:
	var scaled: float = intensity * float(Game.setting("shake_intensity"))
	if scaled <= 0.0 or duration <= 0.0:
		return
	# A bigger shake is never cut short by a smaller one already running
	if scaled * duration < _shake_amount * _shake_left:
		return
	_shake_amount = scaled
	_shake_duration = duration
	_shake_left = duration
	_shake_frequency = frequency


func _update_shake(delta: float) -> void:
	if _shake_left <= 0.0:
		if camera.rotation != Vector3.ZERO:
			camera.rotation = Vector3.ZERO
		return
	_shake_left = maxf(0.0, _shake_left - delta)
	# Fades out over its life so it settles instead of stopping dead
	var fade: float = _shake_left / maxf(0.0001, _shake_duration)
	var amp: float = _shake_amount * fade * fade
	var t: float = (_shake_duration - _shake_left) * _shake_frequency
	camera.rotation = Vector3(
		sin(t * 1.7) * amp,
		sin(t * 1.1 + 1.3) * amp,
		sin(t * 2.3 + 2.7) * amp * 0.6)


## Where the field of view wants to be: the player's own setting, narrowed by
## the stance they are in and again by aiming or glassing.
func target_fov() -> float:
	if glassing:
		return FOV_GLASSED
	var base: float = float(Game.setting("fov"))
	base += float(Game.stance_data(stance).fov)
	if aiming:
		base *= ADS_FOV_SCALE
		# A scope divides on top of that, so a 2.5x sight really is two and a
		# half times the reach of the naked sights.
		var zoom: float = Game.scope_zoom(Game.active_tool())
		if zoom > 1.0:
			base /= zoom
	return base


## Blends over a fixed time rather than at a fixed rate, so a 4-degree crouch
## dip and a 40-degree scope zoom both take the same third of a second.
func _update_fov(delta: float) -> void:
	var want := target_fov()
	if not is_equal_approx(want, _fov_to):
		_fov_from = camera.fov
		_fov_to = want
		_fov_elapsed = 0.0
	if _fov_elapsed >= Game.FOV_BLEND_TIME:
		camera.fov = _fov_to
		return
	_fov_elapsed = minf(Game.FOV_BLEND_TIME, _fov_elapsed + delta)
	var t: float = _fov_elapsed / Game.FOV_BLEND_TIME
	# Ease in and out, so the zoom does not start or stop with a jerk
	camera.fov = lerpf(_fov_from, _fov_to, t * t * (3.0 - 2.0 * t))


# ==================== GYROSCOPE ====================

## Records what the sensor reads while the phone is being held still, and
## subtracts it from then on. Every gyroscope drifts; without this the view
## creeps sideways on its own with nobody touching it.
func recalibrate_gyro() -> void:
	_gyro_bias = Input.get_gyroscope()
	_gyro_settled = 0.0


## Turns phone rotation into view rotation, when the player has asked for it.
## Off by default, and by default only while aiming — a gyroscope is a
## precision tool for the moment you are already holding still, not a way to
## walk around.
func _apply_gyro(delta: float) -> void:
	if not bool(Game.setting("gyro_enabled")):
		return
	if not (aiming or bool(Game.setting("gyro_only"))):
		return

	var raw := Input.get_gyroscope()
	if raw == Vector3.ZERO:
		return  # no sensor on this device

	# Re-learn the bias whenever the phone has been still for a moment, which
	# is the auto-recentring the player never has to think about.
	var motion := (raw - _gyro_bias).length()
	if motion < GYRO_STILL_THRESHOLD:
		_gyro_settled += delta
		if _gyro_settled > GYRO_SETTLE_TIME:
			_gyro_bias = _gyro_bias.lerp(raw, 0.05)
	else:
		_gyro_settled = 0.0

	var rate := raw - _gyro_bias
	var dead: float = float(Game.setting("gyro_dead_zone"))
	var sens: float = float(Game.setting("gyro_sensitivity")) * GYRO_SCALE

	# Landscape phone: rotating about the device's Y axis turns the view, and
	# about its X axis raises and lowers it.
	var yaw_rate: float = 0.0 if absf(rate.y) < dead else rate.y
	var pitch_rate: float = 0.0 if absf(rate.x) < dead else rate.x
	if bool(Game.setting("invert_look_y")):
		pitch_rate = -pitch_rate

	_yaw_target += yaw_rate * sens * delta
	_pitch_target = clampf(_pitch_target + pitch_rate * sens * delta,
		-PI / 2.0, PI / 2.0)


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

	_update_swimming()
	_update_stance_shape(delta)
	_update_stamina(delta)
	_update_oxygen(delta)
	_update_lean(delta)

	# A ladder suspends gravity while you are against it: hold forward to go
	# up, back to come down, jump to push off. It is the only way to reach a
	# second storey without giving raiders a staircase to walk up.
	on_ladder = Game.ui_open == "" and _ladder_in_reach()
	var wants_jump := Game.ui_open == "" and Input.is_action_just_pressed("jump")

	if stance == Game.STANCE_SWIM:
		# Swimming holds you at the surface unless you deliberately go down
		if wants_jump:
			try_jump()
		elif velocity.y < 0.0:
			velocity.y = move_toward(velocity.y, 0.0, GRAVITY * 0.5 * delta)
		else:
			velocity.y -= GRAVITY * 0.12 * delta
	elif wants_jump:
		try_jump()
	elif on_ladder:
		velocity.y = Input.get_axis("move_back", "move_forward") * Game.LADDER_CLIMB_SPEED
	elif not is_on_floor():
		velocity.y -= GRAVITY * delta

	var input_dir := Vector2.ZERO
	if Game.ui_open == "":
		input_dir = Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var dir := (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()

	var speed := movement_speed()

	if _slide_left > 0.0:
		# A slide carries you: the input is ignored and the momentum bleeds
		# away, which is what makes it a commitment rather than a fast crouch.
		_slide_left = maxf(0.0, _slide_left - delta)
		var t: float = _slide_left / SLIDE_TIME
		var carry: float = lerpf(speed, SLIDE_SPEED, t * t)
		velocity.x = _slide_dir.x * carry
		velocity.z = _slide_dir.z * carry
		if _slide_left <= 0.0 and not Input.is_action_pressed("crouch") \
				and not bool(Game.setting("toggle_stance")):
			set_stance(Game.STANCE_STAND)
	elif dir != Vector3.ZERO:
		velocity.x = dir.x * speed
		velocity.z = dir.z * speed
	else:
		velocity.x = move_toward(velocity.x, 0.0, SPEED * 10.0 * delta)
		velocity.z = move_toward(velocity.z, 0.0, SPEED * 10.0 * delta)

	# How hard the ground was coming up at us, read before the collision
	# resolves it away
	var falling := velocity.y
	var was_airborne := not is_on_floor()

	move_and_slide()

	# Landing: a hard drop shakes the view in proportion to the fall. Below
	# the threshold nothing happens, so ordinary hopping about is quiet.
	if was_airborne and is_on_floor() and falling < LAND_SHAKE_SPEED:
		var force: float = clampf((-falling - -LAND_SHAKE_SPEED) / 20.0, 0.0, 1.0)
		shake_camera(0.035 * force, 0.28, 30.0)
		Game.haptic(force)
	if is_on_floor():
		_jumps_used = 0

	# Footsteps
	if is_on_floor():
		_step_distance += Vector2(velocity.x, velocity.z).length() * delta
		if _step_distance > 2.4:
			_step_distance = 0.0
			Sfx.play("step")

	_update_camera(delta)
	_update_weapon(delta)
	_update_lights(delta)
	_inspect_structures()


## Torch and flashlight both live in the belt: whichever is selected is the
## one that is lit. The flashlight runs its cell down while it burns, so it
## is a resource rather than a free floodlight.
func _update_lights(delta: float) -> void:
	var tool := Game.active_tool()

	torch_light.visible = tool == "torch" and Game.get_count("torch") > 0
	if torch_light.visible:
		torch_light.light_energy = 1.7 + sin(world.clock * 9.0) * 0.25

	var lit := tool == "flashlight" and Game.get_count("flashlight") > 0
	flashlight.visible = lit
	if lit:
		_flashlight_timer += delta
		if _flashlight_timer >= FLASHLIGHT_DRAIN_INTERVAL:
			_flashlight_timer = 0.0
			Game.wear_tool("flashlight")
		# The beam browns out as the cell goes, so running dry is visible
		# before the light dies rather than only after.
		flashlight.light_energy = 1.2 + 2.8 * Game.durability_fraction("flashlight")
	else:
		_flashlight_timer = 0.0

	# Glassing only holds while the binoculars are the thing in your hands
	if glassing and tool != "binoculars":
		glassing = false


## Is there a ladder close enough to be hanging off? Checked against the
## ladder's own span so stepping off the top lets go of it.
func _ladder_in_reach() -> bool:
	if world == null:
		return false
	var size: Vector3 = Game.BUILDING_TYPES["ladder"].size
	for s in world.structures:
		if not is_instance_valid(s) or s.build_type != "ladder":
			continue
		var flat := Vector2(s.position.x - global_position.x, s.position.z - global_position.z)
		if flat.length() > Game.LADDER_REACH:
			continue
		var foot: float = s.position.y - size.y * 0.5
		if global_position.y >= foot - 0.5 and global_position.y <= foot + size.y:
			return true
	return false


## Keeps the HUD build-info panel in sync with whatever structure is in view.
func _inspect_structures() -> void:
	looking_at_structure = null
	if hud == null:
		return
	var hit := _camera_ray(Game.INTERACT_DISTANCE, 2 | Game.LAYER_FLOOR)
	if not hit.is_empty() and hit.collider.has_method("toggle_door"):
		looking_at_structure = hit.collider
	var soft: bool = (looking_at_structure != null
		and looking_at_structure.is_soft_side(global_position))
	hud.update_build_info(looking_at_structure, soft)


func _camera_ray(dist: float, mask: int) -> Dictionary:
	return _ray_along(-camera.global_transform.basis.z, dist, mask)


## The same cast with the direction spelled out, so a shotgun can throw a
## handful of them into a cone instead of one down the crosshair.
func _ray_along(dir: Vector3, dist: float, mask: int) -> Dictionary:
	var from := camera.global_position
	var query := PhysicsRayQueryParameters3D.create(from, from + dir * dist, mask, [get_rid()])
	return get_world_3d().direct_space_state.intersect_ray(query)


func _try_drink() -> bool:
	if not in_water or _drink_cd > 0.0:
		return false
	_drink_cd = 0.8
	Game.stats.thirst = clampf(Game.stats.thirst + 35.0, 0.0, 100.0)
	Game.notify("You drank from the lake")
	Sfx.play("drink")
	return true


## The universal interact button, in its three flavours. The work of deciding
## what is being interacted with lives in world.interaction, so the keyboard
## and the touch button both come through here and get the same answer.
func interact() -> bool:
	if world == null or world.interaction == null:
		return false
	return world.interaction.interact_tap()


func interact_hold() -> bool:
	if world == null or world.interaction == null:
		return false
	return world.interaction.interact_hold()


func interact_double() -> bool:
	if world == null or world.interaction == null:
		return false
	return world.interaction.interact_double()


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

	# 2b. Devices (generators, turrets, traps, sensors): also placed on ground
	if Game.DEVICES.has(tool):
		var spot := _camera_ray(Game.BUILD_DISTANCE, 1 | Game.LAYER_FLOOR)
		if not spot.is_empty():
			world.place_device(tool, spot.position)
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

	# 5. Binoculars: hold the view down the glass until you put them away
	if tool == "binoculars":
		_toggle_glassing()
		return

	# 6. Repair tool: a wall if you are aiming at one, otherwise the most
	# worn thing you are carrying — which needs a workbench to work on.
	if tool == "repair_tool":
		_use_repair_tool()
		return

	# 7. Weapons swing or fire; bare hands fall through to the gather ray
	if Game.WEAPONS.has(tool):
		_use_weapon(tool)
		return

	# 4. Interact ray: structures (2) + resources (4) + NPCs (8)
	var hit := _camera_ray(Game.INTERACT_DISTANCE, 2 | 4 | 8 | Game.LAYER_FLOOR)
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
		obj.take_hit(1.0, global_position)
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
		if not Game.spend_tool_fuel(tool):
			return
		var colors := {
			"tree": Color(0.45, 0.3, 0.15), "rock": Color(0.6, 0.6, 0.6),
			"iron": Color(0.65, 0.7, 0.75), "sulfur": Color(0.95, 0.85, 0.3),
			"barrel": Color(0.1, 0.5, 0.8), "crate": Color(1.0, 0.65, 0.0),
			"bush": Color(0.8, 0.2, 0.3),
		}
		_spawn_hit_particles(hit.position, colors.get(obj.res_type, Color.WHITE))
		obj.hit_harvest(tool, hit.position)
		# Charged after the swing, so the blow that breaks the tool still lands
		Game.wear_tool(tool)


## Binoculars pull the view in rather than firing anything, so they get
## their own toggle instead of an entry in WEAPONS.
func _toggle_glassing() -> void:
	if Game.get_count("binoculars") <= 0:
		return
	glassing = not glassing
	if glassing:
		if not Game.wear_tool("binoculars"):
			glassing = false
			return
		Game.notify("Glassing the treeline", Color(0.6, 0.8, 1.0))


## Aim it at a wall and it puts health back; aim it at nothing and it works
## on whatever you are carrying that is closest to breaking. The second use
## needs a workbench nearby, so a rifle is repaired at home and not mid-raid.
func _use_repair_tool() -> void:
	if Game.get_count("repair_tool") <= 0:
		return
	var hit := _camera_ray(Game.INTERACT_DISTANCE, 2 | Game.LAYER_FLOOR)
	if not hit.is_empty() and hit.collider.has_method("take_hit"):
		var s: Object = hit.collider
		if s.health >= s.max_health:
			Game.notify("Nothing to repair there", Color(1.0, 0.63, 0.0))
			return
		# A building piece is repaired against its tier's cost; a device has
		# no tier, so it is patched up for a share of its own build recipe.
		if s.has_method("toggle_door"):
			world.building.repair_structure(s)
		else:
			_repair_device(s)
		Game.wear_tool("repair_tool")
		return

	if Game.workbench_level < 1:
		Game.notify("Stand at a workbench to service your gear", Color(1.0, 0.63, 0.0))
		return
	var worst := _most_worn_item()
	if worst == "":
		Game.notify("Everything you carry is in good condition", Color(1.0, 0.63, 0.0))
		return
	if Game.repair_tool_item(worst):
		Game.wear_tool("repair_tool")


## Patches a shot-up turret or generator back together, for a tenth of what
## it took to build. Half the point of a defence is that it survives the
## first raid it turns away.
func _repair_device(d: Object) -> void:
	var recipe: Dictionary = Game.ITEMS.get(d.device_type, {}).get("recipe", {})
	var cost := {}
	for res in recipe:
		var units := ceili(float(recipe[res]) * 0.1)
		if units > 0:
			cost[res] = units
	if not Game.can_afford(cost):
		Game.notify("Not enough materials to repair that", Color(0.9, 0.3, 0.3))
		return
	Game.consume(cost)
	d.health = minf(d.max_health, d.health + d.max_health * 0.25)
	Game.notify("Repaired %s" % d.label())
	Sfx.play("build")


## The carried tool or weapon with the least life left in it, ignoring the
## repair tool itself so it never spends its last use on itself.
func _most_worn_item() -> String:
	var worst := ""
	var worst_frac := 1.0
	for id in Game.inventory:
		if id == "repair_tool" or not Game.has_durability(id):
			continue
		if Game.get_count(id) <= 0:
			continue
		var frac := Game.durability_fraction(id)
		if frac < worst_frac:
			worst_frac = frac
			worst = id
	return worst


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
## A trigger pull. What it does depends on the fire mode: one shot, a burst
## queued up to be sent over the next few frames, or the start of automatic
## fire that keeps going while the button is held.
func _use_weapon(id: String) -> void:
	if _reload_left > 0.0:
		return
	if not Game.is_ranged(id):
		_fire_shot(id)
		return
	if Game.rounds_loaded(id) <= 0:
		if _weapon_cd <= 0.0:
			Game.notify("Empty — reload", Color(0.9, 0.3, 0.3))
			Sfx.play("hit")
			_weapon_cd = 0.35
		return
	match Game.fire_mode(id):
		"burst":
			_burst_left = Game.BURST_ROUNDS
			_burst_weapon = id
		_:
			_fire_shot(id)


## One round leaving the weapon. Everything about where it goes is decided
## here: the weapon's own sway, tightened by the stance you are in, by aiming
## and by a held breath — which is what makes lying still worth being unable
## to move.
func _fire_shot(id: String) -> void:
	var data: Dictionary = Game.WEAPONS[id]
	if _weapon_cd > 0.0:
		return
	_weapon_cd = float(data.cooldown)

	var ranged := Game.is_ranged(id)
	if ranged and not Game.spend_round(id):
		return

	Sfx.play("hit" if not ranged else "explosion")

	# One shot down the crosshair for everything but a shotgun, which throws
	# its pellets into a cone: all of them land at contact range, almost none
	# of them past it.
	var pellets := int(data.get("pellets", 1))
	var pellet_spread := float(data.get("spread", 0.0))
	# A blunt machete and a rifle with a shot-out barrel both still work —
	# they just stop being worth what they cost to keep.
	var condition := Game.condition_multiplier(id)

	var right := camera.global_transform.basis.x
	var up := camera.global_transform.basis.y
	# Where the weapon is actually pointing this shot, as against where the
	# crosshair is
	var sway := Game.weapon_spread(id, stance, aiming, holding_breath)
	var aim := -camera.global_transform.basis.z
	if sway > 0.0:
		aim = (aim + right * randf_range(-sway, sway)
			+ up * randf_range(-sway, sway)).normalized()

	for i in pellets:
		var dir := aim
		if pellet_spread > 0.0 and i > 0:
			dir = (aim + right * randf_range(-pellet_spread, pellet_spread)
				+ up * randf_range(-pellet_spread, pellet_spread)).normalized()
		_hit_with(id, data, _ray_along(dir, float(data.range), 2 | 4 | 8 | Game.LAYER_FLOOR),
			condition)

	if ranged:
		_apply_recoil(id, sway)
	Game.wear_tool(id)


## Kicks the muzzle up and shakes the view. Aiming and a steady stance cut it
## the same way they cut the spread, so a braced shot is followed by a second
## one you can actually place.
## `_id` is unused: everything that differs between weapons is already in
## their sway, which is what the kick is computed from.
func _apply_recoil(_id: String, sway: float) -> void:
	var kick: float = sway * 1.6 + 0.004
	_pitch_target = clampf(_pitch_target + kick, -PI / 2.0, PI / 2.0)
	_yaw_target += randf_range(-kick, kick) * 0.6
	shake_camera(kick * 1.2, 0.16, 34.0)
	Game.haptic(0.35 if aiming else 0.55)


## Automatic fire, queued bursts and the reload timer. Held-down fire lives
## here rather than in the input handler because "still holding" is a state,
## not an event.
func _update_weapon(delta: float) -> void:
	if _reload_left > 0.0:
		_reload_left = maxf(0.0, _reload_left - delta)
		if _reload_left <= 0.0:
			Game.reload_weapon(_reload_weapon)
			_reload_weapon = ""
		return

	if _burst_left > 0 and _weapon_cd <= 0.0:
		if Game.rounds_loaded(_burst_weapon) > 0:
			_fire_shot(_burst_weapon)
			_burst_left -= 1
		else:
			_burst_left = 0
		return

	if Game.ui_open != "" or not Input.is_action_pressed("attack"):
		return
	var held := Game.active_tool()
	if not Game.is_ranged(held) or Game.fire_mode(held) != "auto":
		return
	if Game.rounds_loaded(held) > 0:
		_fire_shot(held)


## Starts a reload. The weapon is out of action for its own reload time, which
## is what makes running dry in the open a mistake rather than an inconvenience.
func start_reload() -> bool:
	var id := Game.active_tool()
	if not Game.is_ranged(id):
		Game.notify("Nothing to reload", Color(1.0, 0.63, 0.0))
		return false
	if _reload_left > 0.0:
		return false
	if Game.rounds_loaded(id) >= Game.magazine_size(id):
		Game.notify("%s is already loaded" % Game.ITEMS[id].name, Color(1.0, 0.63, 0.0))
		return false
	if Game.get_count(str(Game.WEAPONS[id].ammo)) <= 0:
		Game.notify("Out of %s" % Game.ITEMS[str(Game.WEAPONS[id].ammo)].name,
			Color(0.9, 0.3, 0.3))
		return false
	_reload_weapon = id
	_reload_left = float(Game.WEAPONS[id].get("reload_time", 2.0))
	_burst_left = 0
	Game.notify("Reloading…", Color(0.8, 0.8, 0.85))
	Game.haptic(0.4)
	return true


## Aiming down the sights. Narrows the view, tightens the shot, halves your
## speed and — if the sight is a scope — magnifies by whatever level it is set
## to. Cannot be done while sprinting, because bracing and running are
## opposites.
func set_aiming(on: bool) -> void:
	if on == aiming:
		return
	if on and stance == Game.STANCE_SWIM:
		return
	aiming = on
	Game.haptic(0.25)


func toggle_aiming() -> void:
	set_aiming(not aiming)


## Holding your breath. Steadies the weapon and quietens you, and spends the
## same oxygen a dive does — so it is a few seconds of steadiness, not a
## permanent upgrade.
func set_holding_breath(on: bool) -> void:
	if on and float(Game.stats.oxygen) <= 5.0:
		Game.notify("No breath left to hold", Color(1.0, 0.63, 0.0))
		return
	if holding_breath == on:
		return
	holding_breath = on
	if on:
		Game.notify("Holding breath", Color(0.7, 0.85, 1.0))


## The melee button: a bash with whatever is in your hands. Held down it
## chains into a combo, each swing landing harder than the last.
func melee_strike() -> bool:
	if _weapon_cd > 0.0 or _reload_left > 0.0:
		return false
	var held := Game.active_tool()
	# A real melee weapon swings as itself; anything else is a bash
	if Game.WEAPONS.has(held) and not Game.is_ranged(held):
		_fire_shot(held)
		_advance_combo()
		return true

	_weapon_cd = Game.MELEE_BASH_COOLDOWN
	var step := _advance_combo()
	var damage: float = Game.MELEE_BASH_DAMAGE * (1.0 + Game.MELEE_COMBO_GAIN * float(step))
	var hit := _camera_ray(Game.MELEE_BASH_RANGE, 2 | 4 | 8 | Game.LAYER_FLOOR)
	Sfx.play("hit")
	Game.haptic(0.5 + 0.15 * float(step))
	shake_camera(0.012 * (1.0 + float(step)), 0.14, 30.0)
	if hit.is_empty():
		return true
	var obj: Object = hit.collider
	if obj.has_method("npc_take_damage"):
		obj.npc_take_damage(damage)
		_spawn_hit_particles(hit.position, Color(0.8, 0.2, 0.2))
	elif obj.has_method("take_hit"):
		obj.take_hit(damage * 0.3, global_position)
		_spawn_hit_particles(hit.position, Color(0.85, 0.8, 0.6))
	elif obj.has_method("hit_harvest"):
		obj.hit_harvest("", hit.position)
	return true


## Moves the combo along, or restarts it if the chain was left too long.
## Returns which step of the chain this swing is, counting from zero.
func _advance_combo() -> int:
	var now: float = world.clock if world != null else 0.0
	if now - _combo_at > Game.MELEE_COMBO_WINDOW:
		_combo_step = 0
	else:
		_combo_step = (_combo_step + 1) % Game.MELEE_COMBO_STEPS
	_combo_at = now
	return _combo_step


## Reads out what you are holding. Long-pressed on the inspect button, and it
## is the only place the magazine, the fire mode and the condition are all
## visible at once.
func inspect_held() -> void:
	var id := Game.active_tool()
	if id == "":
		Game.notify("Empty hands", Color(1.0, 0.63, 0.0))
		return
	Game.notify(Game.weapon_summary(id), Color(0.8, 0.88, 1.0))


## Applies one shot's worth of damage to whatever it landed on.
func _hit_with(id: String, data: Dictionary, hit: Dictionary, condition: float = 1.0) -> void:
	if hit.is_empty():
		return
	var obj: Object = hit.collider
	var damage := float(data.damage) * condition
	if obj.has_method("npc_take_damage"):
		obj.npc_take_damage(damage)
		_spawn_hit_particles(hit.position, Color(0.8, 0.2, 0.2))
	elif obj.has_method("take_hit"):
		# Bullets chip structures far more slowly than explosives
		obj.take_hit(damage * 0.25, global_position)
		_spawn_hit_particles(hit.position, Color(0.9, 0.85, 0.6))
	elif obj.has_method("hit_harvest"):
		obj.hit_harvest(id, hit.position)
		_spawn_hit_particles(hit.position, Color(0.7, 0.7, 0.7))


## Satchel charges stick to whatever you are aiming at; grenades get lobbed.
func _use_explosive(id: String) -> void:
	if Game.get_count(id) <= 0:
		return
	var data: Dictionary = Game.EXPLOSIVES[id]
	var forward := -camera.global_transform.basis.z

	if data.mode == "place":
		var hit := _camera_ray(Game.INTERACT_DISTANCE, 1 | 2 | Game.LAYER_FLOOR)
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

	_last_grenade = id
	_consume_from_belt(id)
	Sfx.play("build")


## Quick throw: sends the last thing you threw, wherever it is in your pockets,
## without having to find it on the belt first. Double-tapping the screen runs
## this — the whole point is that it costs no time.
func _throw_last_grenade() -> bool:
	var id := _last_grenade
	# Nothing thrown yet this life: fall back to whatever you are holding, and
	# failing that the cheapest thing you have.
	if id == "" or Game.get_count(id) <= 0:
		id = ""
		var held := Game.active_tool()
		if Game.EXPLOSIVES.has(held) and Game.get_count(held) > 0:
			id = held
		else:
			for candidate in Game.EXPLOSIVES:
				if str(Game.EXPLOSIVES[candidate].mode) == "throw" \
						and Game.get_count(candidate) > 0:
					id = candidate
					break
	if id == "":
		Game.notify("Nothing to throw", Color(1.0, 0.63, 0.0))
		return false
	_use_explosive(id)
	return true


## The arc a thrown charge would follow from where you are aiming now, as a
## list of world points. Stepped with the same gravity and speed the explosive
## itself uses, so the line is a prediction and not a decoration.
func grenade_arc(id: String, steps: int = 26, step: float = 0.09) -> PackedVector3Array:
	var out := PackedVector3Array()
	if not Game.EXPLOSIVES.has(id):
		return out
	var data: Dictionary = Game.EXPLOSIVES[id]
	if str(data.mode) != "throw":
		return out
	var forward := -camera.global_transform.basis.z
	var pos := camera.global_position + forward * 0.8
	var vel := forward * float(data.speed) + Vector3.UP * 2.0
	var gravity := float(data.get("gravity", 14.0))
	var space := get_world_3d().direct_space_state

	out.append(pos)
	for i in steps:
		var next := pos + vel * step
		vel.y -= gravity * step
		# Stop the line where the throw would actually land
		if space != null:
			var hit := space.intersect_ray(PhysicsRayQueryParameters3D.create(
				pos, next, 1 | 2 | Game.LAYER_FLOOR, [get_rid()]))
			if not hit.is_empty():
				out.append(hit.position)
				break
		out.append(next)
		pos = next
	return out


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


## Runs a wire between two devices. The first press picks up the end you are
## aiming at, the second drops it on another — the same two-step every real
## wiring job is, and it is why the wire tool is the cheapest thing in the
## electricity tree.
func _wire_action() -> void:
	if Game.active_tool() != "wire_tool":
		Game.notify("Hold the Wire Tool to run wiring", Color(1.0, 0.63, 0.0))
		return
	var hit := _camera_ray(Game.INTERACT_DISTANCE * 2.0, 2)
	var target: Object = hit.collider if not hit.is_empty() else null
	if target == null or not target.has_method("power_draw"):
		Game.notify("Aim at a device", Color(1.0, 0.63, 0.0))
		return

	if wiring_from == null or not is_instance_valid(wiring_from):
		wiring_from = target
		Game.notify("Wire from %s — aim at the other end" % target.label(),
			Color(0.6, 0.8, 1.0))
		return
	if target == wiring_from:
		wiring_from = null
		Game.notify("Wiring cancelled", Color(1.0, 0.63, 0.0))
		return
	world.power.connect_devices(wiring_from, target)
	wiring_from = null


## Takes a piece back down deliberately, returning half of what went into
## it. The hammer does it to anything you put up recently; a jackhammer will
## chew through the old ones too, which is what makes it worth its metal.
func _demolish_action() -> void:
	var tool := Game.active_tool()
	if tool != "hammer" and tool != "jackhammer":
		Game.notify("Requires Hammer or Jackhammer", Color(0.9, 0.3, 0.3))
		return
	if looking_at_structure == null:
		Game.notify("Aim at a piece to demolish it", Color(1.0, 0.63, 0.0))
		return
	var s := looking_at_structure
	if tool == "jackhammer":
		if not Game.spend_tool_fuel(tool):
			return
		# A jackhammer does not ask how old the wall is, only how much of it
		# is left. It gets no salvage for the trouble.
		s.take_hit(180.0, global_position)
		Game.wear_tool(tool)
		Sfx.play("hit")
		_spawn_hit_particles(s.global_position, Color(0.75, 0.72, 0.68))
		return
	world.building.demolish_structure(s)
