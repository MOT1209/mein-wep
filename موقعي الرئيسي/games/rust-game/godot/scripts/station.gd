extends StaticBody3D
## Placeable utility station: campfire (cooks raw meat, gives warm light)
## or furnace (smelts metal ore into fragments). Placed by equipping the
## crafted item and clicking on the ground; interact with LMB.

var station_type := "campfire"


func setup(t: String) -> void:
	station_type = t
	collision_layer = 2
	collision_mask = 0
	if t == "campfire":
		_build_campfire()
	else:
		_build_furnace()


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

	# Warm light
	var light := OmniLight3D.new()
	light.light_color = Color(1.0, 0.6, 0.25)
	light.omni_range = 8.0
	light.light_energy = 1.6
	light.position.y = 0.9
	add_child(light)

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

	_add_collision(0.55, 0.6)


func _build_furnace() -> void:
	# Stone chimney body
	var body_mi := MeshInstance3D.new()
	var body_mesh := CylinderMesh.new()
	body_mesh.top_radius = 0.35
	body_mesh.bottom_radius = 0.6
	body_mesh.height = 1.4
	var stone_mat := StandardMaterial3D.new()
	stone_mat.albedo_color = Color8(96, 96, 96)
	stone_mat.roughness = 1.0
	body_mesh.material = stone_mat
	body_mi.mesh = body_mesh
	body_mi.position.y = 0.7
	add_child(body_mi)

	# Glowing opening
	var mouth := MeshInstance3D.new()
	var mouth_mesh := BoxMesh.new()
	mouth_mesh.size = Vector3(0.3, 0.35, 0.15)
	var glow_mat := StandardMaterial3D.new()
	glow_mat.albedo_color = Color(1.0, 0.35, 0.05)
	glow_mat.emission_enabled = true
	glow_mat.emission = Color(1.0, 0.3, 0.02)
	glow_mat.emission_energy_multiplier = 1.6
	mouth_mesh.material = glow_mat
	mouth.mesh = mouth_mesh
	mouth.position = Vector3(0, 0.35, 0.5)
	add_child(mouth)

	var light := OmniLight3D.new()
	light.light_color = Color(1.0, 0.45, 0.15)
	light.omni_range = 5.0
	light.light_energy = 0.9
	light.position = Vector3(0, 0.5, 0.7)
	add_child(light)

	_add_collision(0.65, 1.4)


func _add_collision(radius: float, height: float) -> void:
	var cs := CollisionShape3D.new()
	var shape := CylinderShape3D.new()
	shape.radius = radius
	shape.height = height
	cs.shape = shape
	cs.position.y = height / 2.0
	add_child(cs)


func interact_station() -> void:
	if station_type == "campfire":
		_cook()
	else:
		_smelt()


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


## Furnace: 1 wood per 2 metal ore -> metal fragments.
func _smelt() -> void:
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
	Game.notify("Smelted %d ore into fragments" % can_smelt)
	Sfx.play("upgrade")
