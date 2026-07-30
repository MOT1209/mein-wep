extends StaticBody3D
## A deployed device: a generator, a panel, a battery, a turret, a trap, a
## sensor, a switch or a camera. One script for all of them because what
## separates them is a row in Game.DEVICES, not a different shape of object.
##
## Three kinds live here:
##   * producers  — `output`, feeding the circuit they are wired into
##   * consumers  — `power`, doing nothing at all until the circuit feeds them
##   * mechanical — neither, because a bear trap does not need electricity
##
## Everything that shoots or bites finds its target the same way: the nearest
## hostile creature inside its radius. Passive animals are left alone, so a
## turret does not empty a magazine into the deer outside the door.

const ModelRegistry := preload("res://scripts/model_registry.gd")

## How much punishment a deployed device takes before it comes off its
## mount. Deliberately less than a stone wall: the answer to a turret is to
## shoot it, not to bring a rocket for it.
const DEVICE_HEALTH := 250.0

var device_type := "generator"
var world: Node3D
## Set by the power grid every tick. A producer or a mechanical trap ignores
## it; a consumer does nothing without it.
var powered := false
## Switches: flipped by hand. Sensors: true while something is moving in
## front of them. Both gate everything wired downstream.
var switch_on := true
var detecting := false
## Charge banked, for batteries only.
var stored_charge := 0.0
## Ammunition loaded into a turret or trap, by item id.
var loaded := 0
## Devices are as raidable as the walls around them — a turret you cannot
## shoot off its mount would make a base unbreakable, which is the one thing
## a base must never be.
var health := DEVICE_HEALTH
var max_health := DEVICE_HEALTH

var _cfg: Dictionary = {}
var _cooldown := 0.0
var _fuel_timer := 0.0
var _head: Node3D            # the part of a turret that tracks
var _lamp: OmniLight3D       # status light, so a dead circuit is visible
var _spinner: Node3D         # turbine blades


func setup(type: String, w: Node3D) -> void:
	device_type = type
	world = w
	_cfg = Game.DEVICES[type]
	collision_layer = 2
	collision_mask = 0
	_build_visual()
	_add_collision()


func label() -> String:
	return str(_cfg.get("name", device_type))


# ==================== POWER ====================

func power_draw() -> float:
	return float(_cfg.get("power", 0.0))


## What this device is rated to make when conditions are perfect. Used for
## the HUD readout, where "what the base could make" is the useful number.
func rated_output() -> float:
	return float(_cfg.get("output", 0.0))


## What it actually makes this tick. A panel makes nothing at night and a
## turbine makes nothing in a lull; a generator makes its full rating right
## up until the fuel runs out.
func power_output(delta: float) -> float:
	var rated := rated_output()
	if rated <= 0.0:
		return 0.0
	if _cfg.get("solar", false):
		return rated * world.sun_strength()
	if _cfg.get("wind", false):
		return rated * world.wind_strength()
	if _cfg.has("fuel"):
		return rated if _burn_fuel(delta) else 0.0
	return rated


## Generators drink low grade fuel out of the player's own supply at a
## steady rate. Running one is a standing cost, which is what makes solar
## and wind worth the components they take.
func _burn_fuel(delta: float) -> bool:
	_fuel_timer += delta
	if _fuel_timer < float(_cfg.get("fuel_interval", 12.0)):
		return true
	_fuel_timer = 0.0
	var fuel := str(_cfg.fuel)
	if Game.get_count(fuel) <= 0:
		if powered:
			Game.notify("%s is out of fuel" % label(), Color(1.0, 0.63, 0.0))
		return false
	Game.remove_item(fuel, 1)
	return true


func is_battery() -> bool:
	return _cfg.has("capacity")


## Takes up to `available` units of surplus for this tick and returns how
## much it actually took.
func charge(available: float, delta: float) -> float:
	if not is_battery():
		return 0.0
	var room: float = float(_cfg.capacity) - stored_charge
	var taken: float = minf(minf(available, float(_cfg.rate) * delta), room)
	stored_charge += taken
	return taken


## Gives back up to `needed` units, spending banked charge to do it.
func discharge(needed: float, delta: float) -> float:
	if not is_battery():
		return 0.0
	var given: float = minf(minf(needed, float(_cfg.rate) * delta), stored_charge)
	stored_charge -= given
	return given


func charge_fraction() -> float:
	if not is_battery():
		return 0.0
	return clampf(stored_charge / float(_cfg.capacity), 0.0, 1.0)


## Does power flow through this device to whatever is wired behind it? Only
## gates ever say no: a switch that is off, or a sensor with nothing moving
## in front of it.
func passes_power() -> bool:
	if not _cfg.get("gate", false):
		return true
	if _cfg.get("manual", false):
		return switch_on
	return detecting and powered


func set_powered(on: bool) -> void:
	if powered == on:
		return
	powered = on
	_update_lamp()


## True when this device is able to act: mechanical traps always, powered
## devices only while the circuit is feeding them.
func is_live() -> bool:
	return powered if power_draw() > 0.0 else true


# ==================== BEHAVIOUR ====================

func _process(delta: float) -> void:
	if world == null or not world.started:
		return
	_cooldown = maxf(0.0, _cooldown - delta)
	if _spinner != null:
		_spinner.rotate_z(world.wind_strength() * 6.0 * delta)

	if not is_live():
		return

	match device_type:
		"motion_sensor":
			_sense()
		"alarm":
			_watch()
		"smart_switch", "battery", "generator", "solar_panel", "wind_turbine", "camera":
			pass
		_:
			_engage(delta)


## The nearest hostile creature inside `range`, or null. Passive animals are
## deliberately ignored — a turret that shoots rabbits is a turret with no
## ammunition when something that matters turns up.
func _nearest_hostile(radius: float) -> Node3D:
	var best: Node3D = null
	var best_d := radius
	for c in world.get_children():
		if not c.has_method("npc_take_damage") or not c.has_method("is_alive"):
			continue
		if not c.is_alive() or not c.is_hostile():
			continue
		var d: float = global_position.distance_to(c.global_position)
		if d < best_d:
			best_d = d
			best = c
	return best


## Turrets, traps and coils. Everything here waits for something hostile to
## come inside its radius and then spends its cooldown on it.
func _engage(_delta: float) -> void:
	if _cooldown > 0.0:
		return
	var radius := float(_cfg.get("range", 5.0))
	var target := _nearest_hostile(radius)
	if target == null:
		return
	if _head != null:
		_face_target(target)

	if not _spend_ammo():
		# Dry. Sit on the cooldown anyway rather than re-scanning the whole
		# world every frame for a target it cannot shoot at.
		_cooldown = float(_cfg.get("cooldown", 1.0))
		return
	_cooldown = float(_cfg.get("cooldown", 1.0))

	var damage := float(_cfg.get("damage", 0.0))
	target.npc_take_damage(damage, false)
	_shot_effect(target)

	# A coil arcs on to whatever else is standing close to the first target
	var chain := int(_cfg.get("chain", 0))
	if chain > 1:
		var jumped := 1
		for c in world.get_children():
			if jumped >= chain:
				break
			if c == target or not c.has_method("npc_take_damage") or not c.has_method("is_alive"):
				continue
			if not c.is_alive() or not c.is_hostile():
				continue
			if target.global_position.distance_to(c.global_position) > radius:
				continue
			c.npc_take_damage(damage * 0.6, false)
			_shot_effect(c)
			jumped += 1

	# A mine or a bear trap is a one-shot: it goes off and it is gone
	if _cfg.get("single_use", false):
		_fire_once(target)


## Mines take everything around them with the blast; a bear trap holds what
## stepped in it long enough for you to get there. Both are then spent.
func _fire_once(target: Node3D) -> void:
	var blast := float(_cfg.get("blast", 0.0))
	if blast > 0.0:
		world.apply_explosion(global_position, float(_cfg.get("damage", 0.0)), blast)
	var hold := float(_cfg.get("hold", 0.0))
	if hold > 0.0 and target.has_method("snare"):
		target.snare(hold)
	Game.notify("%s triggered" % label(), Color(1.0, 0.5, 0.2))
	world.remove_device(self)


## Turrets and traps run on real ammunition out of your stores, so a
## defence is something you keep supplied rather than something you build
## once. `ammo_chance` covers a flame turret, which sips fuel per burst
## rather than spending a whole unit on every lick of flame.
func _spend_ammo() -> bool:
	var ammo := str(_cfg.get("ammo", ""))
	if ammo == "":
		return true
	if randf() >= float(_cfg.get("ammo_chance", 1.0)):
		return true
	if Game.get_count(ammo) <= 0:
		return false
	Game.remove_item(ammo, 1)
	return true


## A sensor passes power on while something hostile is in front of it, which
## is what lets a corridor of turrets sit dark until it is needed.
func _sense() -> void:
	detecting = _nearest_hostile(float(_cfg.get("range", 15.0))) != null


func _watch() -> void:
	if _cooldown > 0.0:
		return
	if _nearest_hostile(float(_cfg.get("range", 20.0))) == null:
		return
	_cooldown = float(_cfg.get("cooldown", 10.0))
	Game.notify("%s: something is in the base" % label(), Color(0.95, 0.35, 0.3))
	Sfx.play("hit")


func _face_target(target: Node3D) -> void:
	var flat := Vector3(target.global_position.x, _head.global_position.y,
		target.global_position.z)
	if not flat.is_equal_approx(_head.global_position):
		_head.look_at(flat, Vector3.UP)


## A tracer for anything that shoots, a flash for anything that arcs.
func _shot_effect(target: Node3D) -> void:
	var from := global_position + Vector3.UP * float(_cfg.get("size", Vector3.ONE).y)
	var to: Vector3 = target.global_position + Vector3.UP * 0.8
	var span := from.distance_to(to)
	if span < 0.05 or world == null:
		return
	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(0.05, 0.05, span)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = _beam_colour()
	mat.emission_enabled = true
	mat.emission = mat.albedo_color
	mat.emission_energy_multiplier = 2.5
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	box.material = mat
	mi.mesh = box
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	world.add_child(mi)
	mi.global_position = (from + to) * 0.5
	if not from.is_equal_approx(to):
		mi.look_at(to, Vector3.UP)
	var tw := mi.create_tween()
	tw.tween_property(mat, "albedo_color:a", 0.0, 0.15)
	tw.tween_callback(mi.queue_free)
	Sfx.play("explosion" if device_type != "tesla_coil" else "upgrade")


func _beam_colour() -> Color:
	match device_type:
		"flame_trap":
			return Color(1.0, 0.5, 0.1)
		"tesla_coil":
			return Color(0.6, 0.85, 1.0)
		_:
			return Color(1.0, 0.85, 0.4)


# ==================== TAKING DAMAGE ====================

## Bullets and melee. Same signature as a building piece, so the player's
## existing hit path reaches a turret without knowing what a turret is.
func take_hit(amount: float, _from: Vector3 = Vector3.INF) -> float:
	health -= amount
	if health <= 0.0:
		_wreck()
	return amount


## Explosives. A device has no tier to resist a blast with, so it takes the
## charge as it comes — which is why they are cheap to knock out and why a
## base still needs walls in front of them.
func take_blast(raw_damage: float, _origin: Vector3 = Vector3.INF) -> float:
	return take_hit(raw_damage)


func _wreck() -> void:
	Game.notify("%s destroyed" % label(), Color(0.9, 0.3, 0.3))
	Sfx.play("explosion")
	world.remove_device(self)


# ==================== INTERACTION ====================

## What interacting with this device does. A switch flips, a camera reports
## what it can see, a battery reads out its charge, and everything else
## reports whether its circuit is feeding it.
func interact_station() -> void:
	if device_type == "smart_switch":
		switch_on = not switch_on
		_update_lamp()
		Game.notify("%s %s" % [label(), "armed" if switch_on else "disarmed"],
			Color(0.4, 0.85, 0.4) if switch_on else Color(1.0, 0.63, 0.0))
		Sfx.play("door")
		return

	if device_type == "camera":
		_report_view()
		return

	if is_battery():
		Game.notify("%s at %d%%" % [label(), roundi(charge_fraction() * 100.0)])
		return

	var reading: Array = world.power.circuit_reading(self)
	Game.notify("%s — circuit making %d, drawing %d%s"
		% [label(), roundi(reading[0]), roundi(reading[1]),
			"" if is_live() else " (unpowered)"],
		Color(0.4, 0.85, 0.4) if is_live() else Color(0.9, 0.3, 0.3))


## The camera's whole job: telling you what is out there without having to
## walk out and look. Works as well at night as by day, which is the point.
func _report_view() -> void:
	var radius := float(_cfg.get("range", 45.0))
	var seen := {}
	for c in world.get_children():
		if not c.has_method("is_alive") or not c.is_alive():
			continue
		if global_position.distance_to(c.global_position) > radius:
			continue
		seen[c.npc_type] = int(seen.get(c.npc_type, 0)) + 1
	if seen.is_empty():
		Game.notify("%s: nothing moving" % label(), Color(0.6, 0.8, 0.6))
		return
	var parts := []
	for type in seen:
		parts.append("%d %s" % [seen[type], type])
	Game.notify("%s sees %s" % [label(), " · ".join(parts)], Color(1.0, 0.63, 0.0))


# ==================== VISUALS ====================

func _build_visual() -> void:
	var size: Vector3 = _cfg.get("size", Vector3.ONE)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color.html(str(Game.ITEMS.get(device_type, {}).get("color", "8d8d8d")))
	mat.metallic = 0.55
	mat.roughness = 0.45

	# A Blender model when there is one, the primitive block when there is
	# not. Either way the collision below comes from Game.DEVICES, so the
	# model can never move a deployed device's hitbox.
	var model := ModelRegistry.spawn(device_type)

	# The part that moves, so what a device is doing is readable at a glance.
	# A modelled turret goes under the mount and swings bodily, which is what
	# the model is built for: it stops at the mount and has no barrel of its
	# own. The block fallback gets a barrel drawn for it.
	if _cfg.has("damage") and not _cfg.get("single_use", false):
		_head = Node3D.new()
		add_child(_head)
		if model != null:
			_head.add_child(model)
		else:
			_head.position.y = size.y * 0.7
			var barrel := MeshInstance3D.new()
			var tube := BoxMesh.new()
			tube.size = Vector3(size.x * 0.3, size.x * 0.3, size.z * 1.3)
			tube.material = mat
			barrel.mesh = tube
			barrel.position.z = -size.z * 0.5
			_head.add_child(barrel)
	elif model != null:
		add_child(model)

	if model == null:
		var body := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = Vector3(size.x, size.y * 0.55, size.z)
		box.material = mat
		body.mesh = box
		body.position.y = size.y * 0.275
		add_child(body)

	# Blades always stay procedural: the model ends at the hub because this
	# is the part that has to keep turning.
	if _cfg.get("wind", false):
		_spinner = Node3D.new()
		# On the modelled mast the hub is a specific place; on the fallback
		# block it is just near the top.
		if model != null:
			_spinner.position = Vector3(0.0, 3.5, 0.34)
		else:
			_spinner.position.y = size.y * 0.9
		add_child(_spinner)
		var blade_mat := StandardMaterial3D.new()
		blade_mat.albedo_color = Color8(236, 239, 241)
		for i in 3:
			var blade := MeshInstance3D.new()
			var plank := BoxMesh.new()
			plank.size = Vector3(0.12, 1.5, 0.04)
			plank.material = blade_mat
			blade.mesh = plank
			blade.rotation.z = TAU * float(i) / 3.0
			blade.position = Vector3(sin(blade.rotation.z) * -0.75,
				cos(blade.rotation.z) * 0.75, 0.1)
			_spinner.add_child(blade)

	_lamp = OmniLight3D.new()
	_lamp.omni_range = 3.0
	_lamp.light_energy = 0.6
	_lamp.position.y = size.y * 0.8
	add_child(_lamp)
	_update_lamp()


## Green when it is fed and armed, red when it is not, off for anything that
## has no opinion — you can read a base's power state by walking through it.
func _update_lamp() -> void:
	if _lamp == null:
		return
	if power_draw() <= 0.0 and not _cfg.get("manual", false):
		_lamp.visible = false
		return
	var live: bool = is_live() and (not bool(_cfg.get("manual", false)) or switch_on)
	_lamp.visible = true
	_lamp.light_color = Color(0.3, 1.0, 0.4) if live else Color(1.0, 0.25, 0.2)


func _add_collision() -> void:
	var size: Vector3 = _cfg.get("size", Vector3.ONE)
	var cs := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = size
	cs.shape = shape
	cs.position.y = size.y * 0.5
	add_child(cs)
