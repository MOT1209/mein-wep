extends Node
## Weather: clear, overcast, rain and storm, drifting between one another.
##
## Built as a gameplay system rather than a backdrop, because weather that only
## looks different is a screensaver. Rain drops the temperature the survival
## stats already read, storms drive the wind the turbines already generate
## from, and a downpour cuts how far you can see — so the same system that
## makes the main menu live is the one that decides whether tonight is a good
## night to be out.
##
## Nothing here owns the sky's colour or the sun's angle: the day/night cycle
## in world.gd does that. Weather multiplies what the clock has already
## decided, which is why a storm at noon is still brighter than a clear night.

## `fog` is density, `light` scales the sun, `rain` is particle strength,
## `wind` feeds the turbines, and `cloud` dims the sky itself.
const STATES := {
	"clear": {"name": "Clear", "fog": 0.0018, "light": 1.0, "rain": 0.0,
		"wind": 0.3, "cloud": 0.0, "chill": 0.0},
	"overcast": {"name": "Overcast", "fog": 0.006, "light": 0.62, "rain": 0.0,
		"wind": 0.55, "cloud": 0.55, "chill": 6.0},
	"rain": {"name": "Rain", "fog": 0.013, "light": 0.42, "rain": 0.7,
		"wind": 0.7, "cloud": 0.8, "chill": 18.0},
	"storm": {"name": "Thunderstorm", "fog": 0.02, "light": 0.28, "rain": 1.0,
		"wind": 1.0, "cloud": 1.0, "chill": 26.0, "lightning": true},
}

## Which states can follow which. Weather does not jump from clear to a
## thunderstorm — it builds, which is what makes a darkening sky worth reading.
const NEXT := {
	"clear": ["clear", "overcast"],
	"overcast": ["clear", "overcast", "rain"],
	"rain": ["overcast", "rain", "storm"],
	"storm": ["rain", "storm"],
}

## Seconds a state holds before the next roll, and how long the blend takes.
const HOLD_MIN := 180.0
const HOLD_MAX := 300.0
const BLEND_TIME := 22.0

## Lightning: how often it can strike during a storm, and how long the flash
## and the gap before the thunder are.
const STRIKE_MIN := 7.0
const STRIKE_MAX := 26.0
const FLASH_TIME := 0.22
const THUNDER_DELAY := Vector2(0.6, 3.4)

const RAIN_PARTICLES := 900
const RAIN_AREA := 26.0

var world: Node3D

var state := "clear"
var previous := "clear"
## 0..1 through the blend from `previous` into `state`.
var blend := 1.0
var _hold_left := 0.0

var _rain: CPUParticles3D
var _flash: OmniLight3D
var _flash_left := 0.0
var _strike_left := 0.0
var _thunder_left := -1.0


func _ready() -> void:
	_hold_left = randf_range(HOLD_MIN, HOLD_MAX)
	_strike_left = randf_range(STRIKE_MIN, STRIKE_MAX)


func setup(w: Node3D) -> void:
	world = w
	_build_rain()
	_build_flash()


# ==================== BLENDED READINGS ====================

## Any weather value, blended across the current transition. Everything else
## reads the world through this, so a change is always a fade and never a cut.
func value(key: String) -> float:
	var from: float = float(STATES[previous].get(key, 0.0))
	var to: float = float(STATES[state].get(key, 0.0))
	return lerpf(from, to, blend)


func state_name() -> String:
	return str(STATES[state].name)


## True while it is raining hard enough to matter — for wet ground, for the
## sound of it, and for anything that should not be lit outdoors.
func is_wet() -> bool:
	return value("rain") > 0.15


func is_storming() -> bool:
	return bool(STATES[state].get("lightning", false)) and blend > 0.5


## How much colder the weather is making it. Added to the world's own night
## chill, so a storm at night is genuinely dangerous and a clear day is not.
func chill() -> float:
	return value("chill")


## Wind, 0..1. The turbines read this; so does the leaf litter.
func wind() -> float:
	return value("wind")


# ==================== TICK ====================

func _process(delta: float) -> void:
	if world == null:
		return

	if blend < 1.0:
		blend = minf(1.0, blend + delta / BLEND_TIME)

	_hold_left -= delta
	if _hold_left <= 0.0:
		_roll_next()

	_update_sky()
	_update_rain()
	_update_lightning(delta)


## Picks what comes next from what is happening now, so the sky builds towards
## a storm and eases out of one instead of flicking between extremes.
func _roll_next() -> void:
	var options: Array = NEXT.get(state, ["clear"])
	var pick := str(options[randi() % options.size()])
	_hold_left = randf_range(HOLD_MIN, HOLD_MAX)
	if pick == state:
		return
	previous = state
	state = pick
	blend = 0.0
	if world.started:
		Game.notify("The weather is turning: %s" % state_name(), Color(0.7, 0.8, 0.9))


## Fog, sun strength and sky brightness, all multiplied onto whatever the
## day/night cycle has already set this frame.
func _update_sky() -> void:
	if world.env == null:
		return
	world.env.fog_density = value("fog")
	var dim := 1.0 - value("cloud") * 0.75
	world.env.background_energy_multiplier *= dim
	world.env.ambient_light_energy *= lerpf(1.0, 0.55, value("cloud"))
	if world.sun != null:
		world.sun.light_energy *= value("light")
		# An overcast sun is a cooler, flatter light as well as a dimmer one
		world.sun.light_color = world.sun.light_color.lerp(
			Color(0.78, 0.82, 0.9), value("cloud") * 0.6)


# ==================== RAIN ====================

## A block of falling particles that follows the camera. Rain over the whole
## 400m map would be hundreds of thousands of particles for weather nobody can
## see past thirty metres.
func _build_rain() -> void:
	_rain = CPUParticles3D.new()
	_rain.name = "Rain"
	_rain.amount = RAIN_PARTICLES
	_rain.lifetime = 1.1
	_rain.emitting = false
	_rain.local_coords = false
	_rain.emission_shape = CPUParticles3D.EMISSION_SHAPE_BOX
	_rain.emission_box_extents = Vector3(RAIN_AREA, 0.5, RAIN_AREA)
	_rain.direction = Vector3(0, -1, 0)
	_rain.spread = 3.0
	_rain.initial_velocity_min = 16.0
	_rain.initial_velocity_max = 22.0
	_rain.gravity = Vector3(0, -30.0, 0)
	_rain.damping_min = 0.0
	_rain.damping_max = 0.0

	# A stretched sliver rather than a dot: a raindrop at speed is a streak
	var drop := BoxMesh.new()
	drop.size = Vector3(0.015, 0.42, 0.015)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.66, 0.74, 0.86, 0.5)
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	drop.material = mat
	_rain.mesh = drop
	_rain.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	world.add_child(_rain)


func _update_rain() -> void:
	if _rain == null:
		return
	var strength := value("rain")
	_rain.emitting = strength > 0.02
	if not _rain.emitting:
		return
	# CPUParticles3D has no amount_ratio — that is a GPU-particles property, and
	# assigning it here failed silently at run time. The count itself is what
	# scales, so a drizzle is genuinely fewer drops than a downpour.
	var want := maxi(1, int(RAIN_PARTICLES * clampf(strength, 0.0, 1.0)))
	if _rain.amount != want:
		_rain.amount = want
	# Slanted by the wind, so a storm's rain comes at you rather than down
	var lean := wind() * 7.0
	_rain.gravity = Vector3(lean, -30.0, lean * 0.4)
	# Kept above whatever the view is: the player in game, the rig in the menu
	var focus := _focus_point()
	_rain.global_position = focus + Vector3(0, 14.0, 0)


## What the rain should fall on: the player once the game is running, and the
## menu camera before that.
func _focus_point() -> Vector3:
	var cam := world.get_viewport().get_camera_3d()
	if cam != null:
		return cam.global_position
	if world.player != null:
		return world.player.global_position
	return Vector3.ZERO


# ==================== LIGHTNING ====================

func _build_flash() -> void:
	_flash = OmniLight3D.new()
	_flash.name = "LightningFlash"
	_flash.light_color = Color(0.85, 0.92, 1.0)
	_flash.omni_range = 220.0
	_flash.light_energy = 0.0
	_flash.visible = false
	world.add_child(_flash)


func _update_lightning(delta: float) -> void:
	# The flash itself, fading out over a fifth of a second
	if _flash_left > 0.0:
		_flash_left = maxf(0.0, _flash_left - delta)
		var t := _flash_left / FLASH_TIME
		_flash.light_energy = 14.0 * t * t
		_flash.visible = _flash_left > 0.0
		if world.env != null:
			world.env.background_energy_multiplier += 2.2 * t

	# Thunder arrives after the light, by however far away the strike was
	if _thunder_left > 0.0:
		_thunder_left -= delta
		if _thunder_left <= 0.0:
			Sfx.play("thunder")
			if world.player != null and world.player.has_method("shake_camera"):
				world.player.shake_camera(0.012, 0.7, 9.0)

	if not is_storming():
		return
	_strike_left -= delta
	if _strike_left > 0.0:
		return
	_strike_left = randf_range(STRIKE_MIN, STRIKE_MAX)
	strike()


## One bolt, somewhere out past the edge of what you can see. Public so the
## menu's event director can call for one on cue.
func strike() -> void:
	var focus := _focus_point()
	var angle := randf() * TAU
	var away := randf_range(60.0, 180.0)
	_flash.global_position = focus + Vector3(
		cos(angle) * away, randf_range(40.0, 90.0), sin(angle) * away)
	_flash_left = FLASH_TIME
	_flash.visible = true
	# Sound lags the light by the distance, which is what makes it read as far
	_thunder_left = lerpf(THUNDER_DELAY.x, THUNDER_DELAY.y,
		clampf(away / 180.0, 0.0, 1.0))
