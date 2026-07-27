extends StaticBody3D
## A deployed station: campfire, furnace, workbench, research table or a
## storage box. Model-backed types come from the Blender batch via
## ModelRegistry; the campfire stays procedural because its fire, light and
## ember particles are generated, not modelled.

const ModelRegistry := preload("res://scripts/model_registry.gd")

## Everything a storage box will accept.
const STASHABLE := [
	"wood", "stone", "iron", "sulfur", "hqm", "frag", "lgf", "cloth",
	"leather", "scrap", "oil", "berries", "raw_meat", "cooked_meat",
]

## Research table output pool: components with no other source in the world.
const RESEARCH_OUTPUTS := ["gear_comp", "pipe", "spring", "sewing"]
const RESEARCH_COST := 25

## Crude oil refined per unit of low grade fuel.
const OIL_PER_FUEL := 5

var station_type := "campfire"
var stored: Dictionary = {}


func setup(t: String) -> void:
	station_type = t
	collision_layer = 2
	collision_mask = 0

	var model := ModelRegistry.spawn(t)
	if model != null:
		add_child(model)
		if t == "workbench_t2":
			# Same mesh as tier 1, recoloured so the upgrade reads at a glance
			ModelRegistry.tint(model, Color8(120, 134, 145), 0.7, 0.4)
		_add_collision_for(t)
		if t == "furnace":
			_add_fire_light(Vector3(0, 0.4, 0.6), 5.0, 0.9)
	elif t == "campfire":
		_build_campfire()
	else:
		_build_placeholder()


func _add_collision_for(t: String) -> void:
	# Footprints roughly match the Blender models' base dimensions
	var sizes := {
		"furnace": Vector3(1.2, 1.4, 1.25),
		"workbench_t1": Vector3(1.6, 1.05, 0.9),
		"workbench_t2": Vector3(1.6, 1.05, 0.9),
		"research_table": Vector3(1.2, 1.2, 0.8),
		"storage_box": Vector3(0.92, 0.6, 0.64),
		"large_box": Vector3(1.43, 1.0, 0.85),
	}
	var size: Vector3 = sizes.get(t, Vector3(1, 1, 1))
	var cs := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = size
	cs.shape = shape
	cs.position.y = size.y * 0.5
	add_child(cs)


func _add_fire_light(offset: Vector3, range_: float, energy: float) -> void:
	var light := OmniLight3D.new()
	light.light_color = Color(1.0, 0.55, 0.2)
	light.omni_range = range_
	light.light_energy = energy
	light.position = offset
	add_child(light)


func _build_placeholder() -> void:
	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(1, 1, 1)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color8(150, 120, 90)
	box.material = mat
	mi.mesh = box
	mi.position.y = 0.5
	add_child(mi)
	_add_collision_for(station_type)


func _build_campfire() -> void:
	# Crossed logs
	var log_mesh := CylinderMesh.new()
	log_mesh.top_radius = 0.07
	log_mesh.bottom_radius = 0.07
	log_mesh.height = 0.8
	var log_mat := StandardMaterial3D.new()
	log_mat.albedo_color = Color8(78, 52, 46)
	log_mesh.material = log_mat
	for angle in [0.0, PI / 3.0, -PI / 3.0]:
		var log_mi := MeshInstance3D.new()
		log_mi.mesh = log_mesh
		log_mi.rotation = Vector3(PI / 2.0, angle, 0)
		log_mi.position.y = 0.09
		add_child(log_mi)

	# Flame cone
	var flame := MeshInstance3D.new()
	var cone := CylinderMesh.new()
	cone.top_radius = 0.0
	cone.bottom_radius = 0.2
	cone.height = 0.55
	var flame_mat := StandardMaterial3D.new()
	flame_mat.albedo_color = Color(1.0, 0.5, 0.1)
	flame_mat.emission_enabled = true
	flame_mat.emission = Color(1.0, 0.45, 0.05)
	flame_mat.emission_energy_multiplier = 2.0
	cone.material = flame_mat
	flame.mesh = cone
	flame.position.y = 0.4
	add_child(flame)

	_add_fire_light(Vector3(0, 0.9, 0), 8.0, 1.6)

	# Rising embers
	var embers := CPUParticles3D.new()
	embers.amount = 10
	embers.lifetime = 1.4
	embers.direction = Vector3(0, 1, 0)
	embers.initial_velocity_min = 0.4
	embers.initial_velocity_max = 0.9
	embers.gravity = Vector3(0, 0.4, 0)
	embers.spread = 12.0
	var ember_mesh := BoxMesh.new()
	ember_mesh.size = Vector3(0.04, 0.04, 0.04)
	var ember_mat := StandardMaterial3D.new()
	ember_mat.albedo_color = Color(1.0, 0.55, 0.1)
	ember_mat.emission_enabled = true
	ember_mat.emission = Color(1.0, 0.5, 0.05)
	ember_mat.emission_energy_multiplier = 2.0
	ember_mesh.material = ember_mat
	embers.mesh = ember_mesh
	embers.position.y = 0.4
	add_child(embers)

	var cs := CollisionShape3D.new()
	var shape := CylinderShape3D.new()
	shape.radius = 0.55
	shape.height = 0.6
	cs.shape = shape
	cs.position.y = 0.3
	add_child(cs)


## Heat contribution for the temperature system, 0 when this isn't a fire.
func warmth() -> float:
	return float(Game.DEPLOYABLES.get(station_type, {}).get("warmth", 0.0))


## Crafting tier this station grants while the player is nearby.
func workbench_level() -> int:
	return int(Game.DEPLOYABLES.get(station_type, {}).get("workbench", 0))


func interact_station() -> void:
	match station_type:
		"campfire":
			_cook()
		"furnace":
			_smelt()
		"research_table":
			_research()
		"storage_box", "large_box":
			_use_storage()
		"workbench_t1", "workbench_t2":
			Game.notify("Workbench Level %d — craft nearby to use it" % workbench_level())
		_:
			pass


## Campfire: 2 wood per raw meat -> cooked meat.
func _cook() -> void:
	var raw := Game.get_count("raw_meat")
	if raw <= 0:
		Game.notify("No raw meat to cook", Color(1.0, 0.63, 0.0))
		return
	var can_cook := mini(raw, floori(Game.get_count("wood") / 2.0))
	if can_cook <= 0:
		Game.notify("Need 2 wood per meat", Color(0.9, 0.3, 0.3))
		return
	Game.remove_item("raw_meat", can_cook)
	Game.remove_item("wood", can_cook * 2)
	Game.add_item("cooked_meat", can_cook)
	Game.notify("Cooked %d meat" % can_cook)
	Sfx.play("harvest")


## Furnace: refines crude oil into low grade fuel first (the only
## renewable source of it), then smelts metal ore into fragments.
func _smelt() -> void:
	var oil := Game.get_count("oil")
	if oil >= OIL_PER_FUEL:
		var fuel_made := floori(float(oil) / float(OIL_PER_FUEL))
		Game.remove_item("oil", fuel_made * OIL_PER_FUEL)
		Game.add_item("lgf", fuel_made)
		Game.notify("Refined %d crude oil into %d low grade fuel"
			% [fuel_made * OIL_PER_FUEL, fuel_made])
		Sfx.play("upgrade")
		return

	var ore := Game.get_count("iron")
	if ore <= 0:
		Game.notify("No metal ore to smelt", Color(1.0, 0.63, 0.0))
		return
	var can_smelt := mini(ore, Game.get_count("wood") * 2)
	if can_smelt <= 0:
		Game.notify("Need wood as fuel", Color(0.9, 0.3, 0.3))
		return
	var fuel := ceili(float(can_smelt) / 2.0)
	Game.remove_item("iron", can_smelt)
	Game.remove_item("wood", fuel)
	Game.add_item("frag", can_smelt)
	# Burnt fuel leaves charcoal behind, which gunpowder needs
	Game.add_item("charcoal", fuel)
	Game.notify("Smelted %d ore (+%d charcoal)" % [can_smelt, fuel])
	Sfx.play("upgrade")


## Research table: the only source of mechanical components in the world.
func _research() -> void:
	if Game.get_count("scrap") < RESEARCH_COST:
		Game.notify("Research needs %d scrap" % RESEARCH_COST, Color(0.9, 0.3, 0.3))
		return
	Game.remove_item("scrap", RESEARCH_COST)
	var out: String = RESEARCH_OUTPUTS[randi() % RESEARCH_OUTPUTS.size()]
	Game.add_item(out, 1)
	Game.notify("Researched: %s" % Game.ITEMS[out].name)
	Sfx.play("upgrade")


## No container UI yet: interacting stashes every raw resource you carry,
## and interacting again with nothing to stash takes it all back out.
func _use_storage() -> void:
	var moved := 0
	for id in STASHABLE:
		var count := Game.get_count(id)
		if count > 0:
			stored[id] = int(stored.get(id, 0)) + count
			Game.remove_item(id, count)
			moved += count
	if moved > 0:
		Game.notify("Stashed %d items" % moved)
		Sfx.play("door")
		return

	var taken := 0
	for id in stored.keys():
		var amount := int(stored[id])
		if amount > 0:
			Game.add_item(id, amount)
			taken += amount
	stored.clear()
	if taken > 0:
		Game.notify("Took %d items back" % taken)
		Sfx.play("door")
	else:
		Game.notify("Box is empty", Color(1.0, 0.63, 0.0))
