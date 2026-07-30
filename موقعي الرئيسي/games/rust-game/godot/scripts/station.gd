extends StaticBody3D
## A deployed station: campfire, furnace, workbench, research table or a
## storage box. Model-backed types come from the Blender batch via
## ModelRegistry; the campfire stays procedural because its fire, light and
## ember particles are generated, not modelled.

const ModelRegistry := preload("res://scripts/model_registry.gd")

## Everything a storage box will accept: raw materials, not gear. Read off
## the item table rather than listed by hand, so a new resource is stashable
## the moment it exists instead of silently refusing to go in a box.
static func stashable() -> Array:
	var out := []
	for id in Game.ITEMS:
		if str(Game.ITEMS[id].get("category", "")) == "resources" or id == "scrap":
			out.append(id)
	return out

## Research table output pool: components with no other source in the world.
const RESEARCH_OUTPUTS := ["gear_comp", "pipe", "spring", "sewing"]
const RESEARCH_COST := 25

## Crude oil refined per unit of low grade fuel.
const OIL_PER_FUEL := 5

## Everything a furnace knows how to turn into something else, in the order
## it works through them. `per` is how many units of input make one unit of
## output; `wood` is the wood burnt per unit of input, and burnt wood leaves
## charcoal behind. Refining oil needs no fire, so it costs no wood.
##
## `extra` is a second ingredient consumed alongside the main one, per batch
## — a brick is fired clay held together with fill, not clay alone.
const SMELTING := [
	{"input": "oil", "output": "lgf", "per": OIL_PER_FUEL, "wood": 0.0,
		"verb": "Refined %d crude oil into %d low grade fuel"},
	{"input": "resin", "output": "lgf", "per": 3, "wood": 0.0,
		"verb": "Rendered %d resin into %d low grade fuel"},
	{"input": "iron", "output": "frag", "per": 1, "wood": 0.5,
		"verb": "Smelted %d metal ore into %d fragments"},
	{"input": "sulfur_ore", "output": "sulfur", "per": 1, "wood": 0.5,
		"verb": "Smelted %d sulfur ore into %d sulfur"},
	{"input": "sand", "output": "glass", "per": 4, "wood": 1.0,
		"verb": "Fired %d sand into %d glass"},
	{"input": "clay", "output": "brick", "per": 3, "wood": 0.6, "extra": {"dirt": 2},
		"verb": "Fired %d clay into %d brick"},
]

var station_type := "campfire"
var stored: Dictionary = {}
## Set by the power grid each time it solves. Only meaningful for stations
## that draw power at all.
var powered := false


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
		"sleeping_bag": Vector3(1.9, 0.22, 0.9),
		"recycler": Vector3(1.1, 1.6, 1.0),
		"advanced_recycler": Vector3(1.3, 1.7, 1.1),
		"hitech_recycler": Vector3(1.5, 1.8, 1.2),
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
		"recycler", "advanced_recycler", "hitech_recycler":
			_recycle()
		"sleeping_bag":
			Game.notify("You will respawn here")
		"workbench_t1", "workbench_t2":
			Game.notify("Workbench Level %d — craft nearby to use it" % workbench_level())
		_:
			pass


## Campfire: 2 wood per raw item -> its cooked form. Meat and fish both go
## on the same fire, so a lakeside camp feeds you as well as a hunt does.
const COOKING := {"raw_meat": "cooked_meat", "raw_fish": "cooked_fish"}
const WOOD_PER_COOK := 2


func _cook() -> void:
	var done := []
	var total := 0
	var had_raw := false
	for raw_id in COOKING:
		var raw := Game.get_count(raw_id)
		if raw <= 0:
			continue
		had_raw = true
		var cooked_id := str(COOKING[raw_id])
		var can_cook := mini(raw, floori(float(Game.get_count("wood")) / float(WOOD_PER_COOK)))
		can_cook = mini(can_cook, Game.room_for(cooked_id))
		if can_cook <= 0:
			continue
		Game.remove_item(raw_id, can_cook)
		Game.remove_item("wood", can_cook * WOOD_PER_COOK)
		Game.add_item(cooked_id, can_cook)
		done.append("%d %s" % [can_cook, Game.ITEMS[cooked_id].name])
		total += can_cook

	if total > 0:
		Game.notify("Cooked " + " · ".join(done))
		Sfx.play("harvest")
	elif had_raw:
		Game.notify("Need %d wood per item" % WOOD_PER_COOK, Color(0.9, 0.3, 0.3))
	else:
		Game.notify("Nothing raw to cook", Color(1.0, 0.63, 0.0))


## Furnace: works through every recipe it can afford in one go. It used to
## stop at the first match, so a stack of crude oil in your pockets meant
## the furnace would never touch your ore.
func _smelt() -> void:
	var done := []
	var charcoal := 0
	var short_on_wood := false

	for recipe in SMELTING:
		var have: int = Game.get_count(recipe.input)
		var batches: int = floori(float(have) / float(recipe.per))
		if batches <= 0:
			continue
		var wood_each: float = float(recipe.wood) * float(recipe.per)
		if wood_each > 0.0:
			var affordable: int = floori(float(Game.get_count("wood")) / wood_each)
			if affordable <= 0:
				short_on_wood = true
				continue
			batches = mini(batches, affordable)
		# Never burn ore the player has no room to carry away
		batches = mini(batches, Game.room_for(str(recipe.output)))
		# A second ingredient caps the run as hard as the first one does
		var extra: Dictionary = recipe.get("extra", {})
		for res in extra:
			batches = mini(batches, floori(float(Game.get_count(res)) / float(extra[res])))
		if batches <= 0:
			continue
		var used: int = batches * int(recipe.per)
		var burnt: int = ceili(float(used) * float(recipe.wood))
		Game.remove_item(recipe.input, used)
		for res in extra:
			Game.remove_item(res, batches * int(extra[res]))
		if burnt > 0:
			Game.remove_item("wood", burnt)
			# Burnt fuel leaves charcoal behind, which gunpowder needs
			charcoal += burnt
		Game.add_item(recipe.output, batches)
		Game.activity.emit("smelt", used)
		done.append(str(recipe.verb) % [used, batches])

	if charcoal > 0:
		Game.add_item("charcoal", charcoal)

	if done.is_empty():
		if short_on_wood:
			Game.notify("Need wood as fuel", Color(0.9, 0.3, 0.3))
		else:
			Game.notify("Nothing here the furnace can process", Color(1.0, 0.63, 0.0))
		return

	if charcoal > 0:
		done.append("+%d charcoal" % charcoal)
	Game.notify(" · ".join(done))
	Sfx.play("upgrade")


# ==================== RECYCLING ====================

## Units of electricity this station needs to run, 0 when it needs none.
func power_draw() -> float:
	return float(Game.DEPLOYABLES.get(station_type, {}).get("power", 0.0))


## Share of an item's build cost this machine hands back.
func efficiency() -> float:
	return float(Game.DEPLOYABLES.get(station_type, {}).get("efficiency", 0.0))


## Whether the grid is currently feeding this station. A machine that needs
## no power is always on; one that does is only on while the wires say so.
func is_powered() -> bool:
	if power_draw() <= 0.0:
		return true
	return powered


## Called by the power grid each time it solves.
func set_powered(on: bool) -> void:
	powered = on


func label() -> String:
	return str(Game.ITEMS.get(station_type, {}).get("name", station_type))


## Breaks down whatever is in the selected belt slot — one stack at a time,
## on purpose. A recycler that ate everything in your pockets the moment you
## touched it would be a trap rather than a machine.
func _recycle() -> void:
	if not is_powered():
		Game.notify("%s has no power" % Game.ITEMS[station_type].name, Color(0.9, 0.3, 0.3))
		return

	var id := Game.active_tool()
	if id == "":
		Game.notify("Hold what you want recycled in your belt", Color(1.0, 0.63, 0.0))
		return
	if not Game.is_recyclable(id):
		Game.notify("%s cannot be broken down" % Game.ITEMS.get(id, {}).get("name", id),
			Color(1.0, 0.63, 0.0))
		return

	var per_unit := Game.recycle_yield(id, efficiency())
	if per_unit.is_empty():
		Game.notify("Nothing worth recovering from that", Color(1.0, 0.63, 0.0))
		return

	# Only process as many as the pockets can hold the output of, so a run
	# never destroys a stack and hands back nothing.
	var have := Game.get_count(id)
	var batch := have
	for res in per_unit:
		batch = mini(batch, floori(float(Game.room_for(res)) / float(per_unit[res])))
	if batch <= 0:
		Game.notify("No room for what that would give back", Color(1.0, 0.63, 0.0))
		return

	Game.remove_item(id, batch)
	var parts := []
	for res in per_unit:
		var units: int = int(per_unit[res]) * batch
		Game.add_item(res, units)
		parts.append("%d %s" % [units, Game.ITEMS[res].name])

	# The belt slot is empty now if that was the last one
	if Game.get_count(id) <= 0:
		for i in Game.belt.size():
			if Game.belt[i] == id:
				Game.belt[i] = null
		Game.belt_changed.emit()

	Game.notify("Recycled %d %s → %s"
		% [batch, Game.ITEMS[id].name, " · ".join(parts)])
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
func capacity() -> int:
	return int(Game.BOX_SLOTS.get(station_type, 12))


## Boxes hold a fixed number of slots, so a base is somewhere to put things
## rather than an infinite pocket. Deposits stop at the lid; withdrawals
## stop at what you can carry, and whatever does not move stays put.
func _use_storage() -> void:
	var moved := 0
	var refused := 0
	for id in stashable():
		var count := Game.get_count(id)
		if count <= 0:
			continue
		var room: int = Game.room_in(stored, capacity(), id)
		var put: int = mini(count, room)
		if put > 0:
			stored[id] = int(stored.get(id, 0)) + put
			Game.remove_item(id, put)
			moved += put
		refused += count - put
	if moved > 0:
		if refused > 0:
			Game.notify("Stashed %d items — the box is full (%d/%d slots)"
				% [moved, Game.slots_for(stored), capacity()], Color(1.0, 0.63, 0.0))
		else:
			Game.notify("Stashed %d items (%d/%d slots)"
				% [moved, Game.slots_for(stored), capacity()])
		Sfx.play("door")
		return

	var taken := 0
	var stuck := 0
	for id in stored.keys():
		var amount := int(stored[id])
		if amount <= 0:
			stored.erase(id)
			continue
		var accepted := Game.add_item(id, amount)
		taken += accepted
		if accepted < amount:
			stored[id] = amount - accepted
			stuck += amount - accepted
		else:
			stored.erase(id)
	if taken > 0:
		if stuck > 0:
			Game.notify("Took %d items — %d left, no room to carry them"
				% [taken, stuck], Color(1.0, 0.63, 0.0))
		else:
			Game.notify("Took %d items back" % taken)
		Sfx.play("door")
	elif refused > 0:
		Game.notify("The box is full (%d/%d slots)"
			% [Game.slots_for(stored), capacity()], Color(1.0, 0.63, 0.0))
	else:
		Game.notify("Box is empty", Color(1.0, 0.63, 0.0))
