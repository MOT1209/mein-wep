extends StaticBody3D
## A harvestable world resource (tree, rock, iron, sulfur, barrel, crate).
## Builds its own procedural visuals + collision. Yields items per hit,
## emits `depleted` when destroyed so the world can schedule a respawn.

const ModelRegistry := preload("res://scripts/model_registry.gd")

signal depleted(type: String, pos: Vector3)

var res_type := "tree"
var health := 4


func setup(t: String) -> void:
	res_type = t
	collision_layer = 4
	collision_mask = 0
	match t:
		"tree":
			health = 4
			_build_tree()
		"rock":
			health = 5
			_build_ore_node(Color8(117, 117, 117), 0.0)
		"iron":
			health = 5
			_build_ore_node(Color8(144, 164, 174), 0.4)
		"sulfur":
			health = 5
			_build_ore_node(Color8(253, 216, 53), 0.0, Color8(68, 68, 0))
		"barrel":
			health = 3
			_build_barrel()
		"crate":
			health = 3
			_build_crate()
		"bush":
			health = 3
			_build_bush()
		"hemp":
			health = 2
			_build_plant(Color8(124, 179, 66), 1.1, 5, Color8(90, 140, 50))
		"corn":
			health = 2
			_build_plant(Color8(139, 195, 74), 1.6, 4, Color8(253, 216, 53))
		"pumpkin":
			health = 2
			_build_gourd(Color8(251, 140, 0))
		"mushroom":
			health = 1
			_build_mushroom()
		"herbs":
			health = 2
			_build_plant(Color8(102, 187, 106), 0.55, 7, Color8(129, 199, 132))
		"clay_deposit":
			health = 5
			_build_deposit(Color8(161, 114, 90))
		"sand_deposit":
			health = 5
			_build_deposit(Color8(227, 217, 168))
		"salt_deposit":
			health = 4
			_build_deposit(Color8(236, 239, 241), 0.35)
		"fish":
			health = 2
			_build_fish()


func _build_tree() -> void:
	var trunk := MeshInstance3D.new()
	var trunk_mesh := CylinderMesh.new()
	trunk_mesh.top_radius = 0.15
	trunk_mesh.bottom_radius = 0.4
	trunk_mesh.height = 3.0
	var trunk_mat := StandardMaterial3D.new()
	trunk_mat.albedo_color = Color8(78, 52, 46)
	trunk_mat.roughness = 0.9
	trunk_mesh.material = trunk_mat
	trunk.mesh = trunk_mesh
	trunk.position.y = 1.5
	add_child(trunk)

	# Slight per-tree hue variation so the forest isn't uniform
	var leaf_mat := StandardMaterial3D.new()
	leaf_mat.albedo_color = Color8(46, 125, 50).lerp(Color8(85, 139, 47), randf())
	leaf_mat.roughness = 0.8

	if randf() < 0.5:
		# Pine: stacked cones
		for j in 3:
			var cone_mi := MeshInstance3D.new()
			var cone := CylinderMesh.new()
			cone.top_radius = 0.0
			cone.bottom_radius = 1.3 - j * 0.32
			cone.height = 1.5
			cone.radial_segments = 8
			cone.material = leaf_mat
			cone_mi.mesh = cone
			cone_mi.position.y = 2.3 + j * 1.0
			add_child(cone_mi)
	else:
		# Leafy: blobby clusters
		for j in 3:
			var cluster := MeshInstance3D.new()
			var sphere := SphereMesh.new()
			sphere.radius = 1.2 - j * 0.2
			sphere.height = (1.2 - j * 0.2) * 2.0
			sphere.radial_segments = 7
			sphere.rings = 4
			sphere.material = leaf_mat
			cluster.mesh = sphere
			cluster.position = Vector3((randf() - 0.5) * 0.5, 2.5 + j * 0.8, (randf() - 0.5) * 0.5)
			add_child(cluster)

	var cs := CollisionShape3D.new()
	var shape := CylinderShape3D.new()
	shape.radius = 0.5
	shape.height = 3.0
	cs.shape = shape
	cs.position.y = 1.5
	add_child(cs)

	# Size variation (uniform, so collision scales along)
	scale = Vector3.ONE * randf_range(0.85, 1.35)


## Blender-built ore cluster when available, otherwise the old boulder.
func _build_ore_node(color: Color, metallic: float, emission := Color.BLACK) -> void:
	var model := ModelRegistry.spawn("node_" + res_type)
	if model == null:
		_build_boulder(color, metallic, emission)
		return
	model.rotation.y = randf() * TAU
	var s := randf_range(0.85, 1.2)
	model.scale = Vector3(s, s, s)
	add_child(model)

	var cs := CollisionShape3D.new()
	var shape := SphereShape3D.new()
	shape.radius = 0.9 * s
	cs.shape = shape
	cs.position.y = 0.7 * s
	add_child(cs)


func _build_boulder(color: Color, metallic: float, emission := Color.BLACK) -> void:
	var mi := MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = 1.2
	sphere.height = 2.4
	sphere.radial_segments = 6
	sphere.rings = 3
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.95
	mat.metallic = metallic
	if emission != Color.BLACK:
		mat.emission_enabled = true
		mat.emission = emission
		mat.emission_energy_multiplier = 0.3
	sphere.material = mat
	mi.mesh = sphere
	var s := 0.6 + randf()
	mi.scale = Vector3(s, s * 0.8, s)
	mi.rotation = Vector3(randf(), randf(), randf())
	mi.position.y = 0.3
	add_child(mi)

	var cs := CollisionShape3D.new()
	var shape := SphereShape3D.new()
	shape.radius = 1.0 * s
	cs.shape = shape
	cs.position.y = 0.3
	add_child(cs)


func _build_barrel() -> void:
	var mi := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.4
	cyl.bottom_radius = 0.4
	cyl.height = 1.2
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color8(2, 119, 189)
	mat.metallic = 0.6
	mat.roughness = 0.4
	cyl.material = mat
	mi.mesh = cyl
	mi.position.y = 0.6
	add_child(mi)

	var cs := CollisionShape3D.new()
	var shape := CylinderShape3D.new()
	shape.radius = 0.45
	shape.height = 1.2
	cs.shape = shape
	cs.position.y = 0.6
	add_child(cs)


func _build_crate() -> void:
	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(1.2, 1.0, 1.2)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color8(255, 160, 0)
	box.material = mat
	mi.mesh = box
	mi.position.y = 0.5
	add_child(mi)

	var cs := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(1.2, 1.0, 1.2)
	cs.shape = shape
	cs.position.y = 0.5
	add_child(cs)


func _build_bush() -> void:
	var bush_mat := StandardMaterial3D.new()
	bush_mat.albedo_color = Color8(56, 110, 45)
	bush_mat.roughness = 0.9
	var body := MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = 0.6
	sphere.height = 0.9
	sphere.radial_segments = 7
	sphere.rings = 4
	sphere.material = bush_mat
	body.mesh = sphere
	body.position.y = 0.4
	add_child(body)

	# Red berries dotted around the bush
	var berry_mat := StandardMaterial3D.new()
	berry_mat.albedo_color = Color8(211, 47, 47)
	berry_mat.emission_enabled = true
	berry_mat.emission = Color8(120, 10, 10)
	berry_mat.emission_energy_multiplier = 0.4
	var berry_mesh := SphereMesh.new()
	berry_mesh.radius = 0.06
	berry_mesh.height = 0.12
	berry_mesh.radial_segments = 5
	berry_mesh.rings = 3
	berry_mesh.material = berry_mat
	for i in 7:
		var b := MeshInstance3D.new()
		b.mesh = berry_mesh
		var ang := randf() * TAU
		b.position = Vector3(cos(ang) * 0.5, 0.35 + randf() * 0.35, sin(ang) * 0.5)
		add_child(b)

	var cs := CollisionShape3D.new()
	var shape := SphereShape3D.new()
	shape.radius = 0.6
	cs.shape = shape
	cs.position.y = 0.4
	add_child(cs)


## A stand of stalks: a few blades fanned out of one root, topped with
## whatever the plant is worth picking for. Shared by hemp, corn and herbs
## because the difference between them is colour and height, not shape.
func _build_plant(stalk_col: Color, height: float, blades: int, crop_col: Color) -> void:
	var stalk_mat := StandardMaterial3D.new()
	stalk_mat.albedo_color = stalk_col
	stalk_mat.roughness = 0.95
	stalk_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	var crop_mat := StandardMaterial3D.new()
	crop_mat.albedo_color = crop_col
	crop_mat.roughness = 0.85

	for i in blades:
		var blade := MeshInstance3D.new()
		var quad := BoxMesh.new()
		quad.size = Vector3(0.07, height, 0.02)
		quad.material = stalk_mat
		blade.mesh = quad
		var ang := TAU * float(i) / float(blades) + randf() * 0.4
		blade.position = Vector3(cos(ang) * 0.12, height * 0.5, sin(ang) * 0.12)
		blade.rotation = Vector3(randf_range(-0.25, 0.25), ang, randf_range(-0.25, 0.25))
		add_child(blade)

	# The pickable part, sat at the top where it reads from a distance
	var crop := MeshInstance3D.new()
	var head := SphereMesh.new()
	head.radius = 0.11
	head.height = 0.3
	head.radial_segments = 6
	head.rings = 3
	head.material = crop_mat
	crop.mesh = head
	crop.position.y = height * 0.92
	add_child(crop)

	_add_cylinder_collision(0.35, height)
	scale = Vector3.ONE * randf_range(0.85, 1.2)


## A pumpkin sitting on the dirt: one squashed sphere and a stub of stalk.
func _build_gourd(color: Color) -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.8
	var body := MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = 0.42
	sphere.height = 0.62
	sphere.radial_segments = 8
	sphere.rings = 5
	sphere.material = mat
	body.mesh = sphere
	body.position.y = 0.3
	add_child(body)

	var stalk_mat := StandardMaterial3D.new()
	stalk_mat.albedo_color = Color8(85, 107, 47)
	var stalk := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.05
	cyl.bottom_radius = 0.07
	cyl.height = 0.18
	cyl.material = stalk_mat
	stalk.mesh = cyl
	stalk.position.y = 0.62
	add_child(stalk)

	_add_sphere_collision(0.45, 0.3)


func _build_mushroom() -> void:
	var stem_mat := StandardMaterial3D.new()
	stem_mat.albedo_color = Color8(239, 235, 222)
	var cap_mat := StandardMaterial3D.new()
	cap_mat.albedo_color = Color8(141, 110, 99).lerp(Color8(198, 64, 56), randf())
	cap_mat.roughness = 0.85

	var stem := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.05
	cyl.bottom_radius = 0.07
	cyl.height = 0.26
	cyl.material = stem_mat
	stem.mesh = cyl
	stem.position.y = 0.13
	add_child(stem)

	var cap := MeshInstance3D.new()
	var dome := SphereMesh.new()
	dome.radius = 0.18
	dome.height = 0.2
	dome.radial_segments = 8
	dome.rings = 3
	dome.is_hemisphere = true
	dome.material = cap_mat
	cap.mesh = dome
	cap.position.y = 0.26
	add_child(cap)

	_add_sphere_collision(0.25, 0.18)
	scale = Vector3.ONE * randf_range(0.8, 1.3)


## A worked patch of ground: a low mound you dig rather than swing at.
func _build_deposit(color: Color, height := 0.5) -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 1.0
	var mound := MeshInstance3D.new()
	var dome := SphereMesh.new()
	dome.radius = 1.0
	dome.height = height * 2.0
	dome.radial_segments = 7
	dome.rings = 3
	dome.is_hemisphere = true
	dome.material = mat
	mound.mesh = dome
	add_child(mound)

	# A few loose lumps around the edge so it reads as dug, not moulded
	for i in 4:
		var lump := MeshInstance3D.new()
		var chunk := BoxMesh.new()
		var s := randf_range(0.12, 0.24)
		chunk.size = Vector3(s, s * 0.7, s)
		chunk.material = mat
		lump.mesh = chunk
		var ang := randf() * TAU
		lump.position = Vector3(cos(ang) * randf_range(0.7, 1.1), s * 0.35,
			sin(ang) * randf_range(0.7, 1.1))
		lump.rotation.y = randf() * TAU
		add_child(lump)

	_add_sphere_collision(1.0, height * 0.5)


## A fish holding station in the shallows: a flattened body and a tail.
func _build_fish() -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color8(120, 144, 156)
	mat.metallic = 0.3
	mat.roughness = 0.35

	var body := MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = 0.22
	sphere.height = 0.3
	sphere.radial_segments = 7
	sphere.rings = 4
	sphere.material = mat
	body.mesh = sphere
	body.scale = Vector3(0.55, 1.0, 1.9)
	body.position.y = 0.2
	add_child(body)

	var tail := MeshInstance3D.new()
	var fin := BoxMesh.new()
	fin.size = Vector3(0.03, 0.26, 0.22)
	fin.material = mat
	tail.mesh = fin
	tail.position = Vector3(0, 0.2, 0.5)
	add_child(tail)

	_add_sphere_collision(0.4, 0.2)
	rotation.y = randf() * TAU


func _add_sphere_collision(radius: float, y: float) -> void:
	var cs := CollisionShape3D.new()
	var shape := SphereShape3D.new()
	shape.radius = radius
	cs.shape = shape
	cs.position.y = y
	add_child(cs)


func _add_cylinder_collision(radius: float, height: float) -> void:
	var cs := CollisionShape3D.new()
	var shape := CylinderShape3D.new()
	shape.radius = radius
	shape.height = height
	cs.shape = shape
	cs.position.y = height * 0.5
	add_child(cs)


## Yield and damage multiplier per (node type, equipped tool). The right
## tool gathers more per swing and breaks the node sooner; the drill is the
## only thing that brings up crude oil.
const TOOL_YIELD := {
	"tree": {"stone_hatchet": 2, "metal_hatchet": 3, "machete": 2, "chainsaw": 6},
	"rock": {"stone_pickaxe": 2, "metal_pickaxe": 3, "drill": 4, "jackhammer": 6},
	"iron": {"stone_pickaxe": 2, "metal_pickaxe": 3, "drill": 4, "jackhammer": 5},
	"sulfur": {"stone_pickaxe": 2, "metal_pickaxe": 3, "drill": 4, "jackhammer": 5},
	"clay_deposit": {"stone_pickaxe": 2, "metal_pickaxe": 3, "drill": 4, "jackhammer": 4},
	"sand_deposit": {"stone_pickaxe": 2, "metal_pickaxe": 3, "drill": 4, "jackhammer": 4},
	"salt_deposit": {"stone_pickaxe": 2, "metal_pickaxe": 3, "drill": 3},
	# A blade takes a hemp stand down in one pass; bare hands strip it slowly
	"hemp": {"machete": 3, "stone_hatchet": 2, "metal_hatchet": 3},
}

const OIL_PER_DRILL_HIT := 3

## What each node type gives per swing. The types that appear in TOOL_YIELD
## scale with the tool; the rest hand over the same amount however you hit
## them. Monument crates are the only high quality metal in the world.
const YIELDS := {
	"tree": {"wood": 12, "resin": 1},
	"rock": {"stone": 10},
	"iron": {"iron": 8},
	"sulfur": {"sulfur_ore": 8},
	"barrel": {"scrap": 3, "lgf": 2},
	"crate": {"scrap": 5, "frag": 5, "hqm": 2},
	"bush": {"berries": 5},
	"hemp": {"hemp": 8},
	"corn": {"corn": 3},
	"pumpkin": {"pumpkin": 2},
	"mushroom": {"mushroom": 2},
	"herbs": {"herbs": 4},
	# Digging turns up fill alongside whatever you came for
	"clay_deposit": {"clay": 6, "dirt": 4},
	"sand_deposit": {"sand": 8, "dirt": 3},
	"salt_deposit": {"salt": 6},
	"fish": {"raw_fish": 2, "scales": 3},
}

## The marked spot that appears on an ore node or a tree after the first
## swing. Landing on it doubles that swing and moves the mark somewhere
## else, which turns mindless clicking into aiming. The drill is exempt,
## the same way Rust's tier-3 tools ignore it.
const SWEET_SPOT_MULT := 2.0
const SWEET_SPOT_RADIUS := 0.55
const SWEET_SPOT_TYPES := ["tree", "rock", "iron", "sulfur",
	"clay_deposit", "sand_deposit", "salt_deposit"]

var _sweet_pos := Vector3.INF   # world space; INF means none showing
var _sweet_marker: MeshInstance3D


## Where the bonus spot currently sits, or Vector3.INF when there is none.
func sweet_spot() -> Vector3:
	return _sweet_pos


## Did a hit at `at` land on the mark? Always false when none is showing.
func is_sweet_hit(at: Vector3) -> bool:
	if _sweet_pos == Vector3.INF or at == Vector3.INF:
		return false
	return at.distance_to(_sweet_pos) <= SWEET_SPOT_RADIUS


## Called by the player on LMB hit. Grants resources scaled by the equipped
## tool and by whether the swing found the marked spot, plays feedback, and
## destroys the node when depleted.
func hit_harvest(tool_id: String = "", at: Vector3 = Vector3.INF) -> void:
	var mult: int = int(TOOL_YIELD.get(res_type, {}).get(tool_id, 1))
	# A worn-out head bites less deeply. Never below one, so a nearly dead
	# pick is slow rather than useless.
	var condition := Game.condition_multiplier(tool_id)
	if condition < 1.0:
		mult = maxi(1, int(round(float(mult) * condition)))
	var bonus := false
	if SWEET_SPOT_TYPES.has(res_type):
		if tool_id == "drill":
			# A drill chews the whole node; there is nothing to aim at
			bonus = true
		elif is_sweet_hit(at):
			bonus = true
		_place_sweet_spot()
	if bonus:
		mult = int(round(float(mult) * SWEET_SPOT_MULT))

	# What this swing would produce. Only the ore types scale with the tool;
	# a barrel gives up the same scrap however you hit it.
	var payload := {}
	var per_swing: int = mult if TOOL_YIELD.has(res_type) else 1
	for id in YIELDS.get(res_type, {}):
		payload[id] = int(YIELDS[res_type][id]) * per_swing
	if tool_id == "drill" and TOOL_YIELD.has(res_type):
		payload["oil"] = int(payload.get("oil", 0)) + OIL_PER_DRILL_HIT

	# A swing with nowhere to put the result leaves the node alone, rather
	# than spending it into a full inventory.
	var fits := false
	for id in payload:
		if Game.room_for(id) > 0:
			fits = true
			break
	if not fits and not payload.is_empty():
		Game.notify("Your pockets are full", Color(1.0, 0.63, 0.0))
		return

	if bonus:
		Game.notify("Sweet spot! x%.0f" % SWEET_SPOT_MULT, Color(1.0, 0.85, 0.35))
	health -= mult
	for id in payload:
		Game.add_item(id, payload[id])
	Sfx.play("harvest")

	if health <= 0:
		_hide_marker()

	# Small bounce feedback
	var tw := create_tween()
	tw.tween_property(self, "position:y", position.y + 0.05, 0.05)
	tw.tween_property(self, "position:y", position.y, 0.05)

	if health <= 0:
		depleted.emit(res_type, position)
		queue_free()


## Moves the mark to a new point on the node's own collision surface, so it
## lands on the rock rather than in the air beside it whatever size the
## scatter rolled this one.
func _place_sweet_spot() -> void:
	var local := Vector3(0.0, 1.0, 0.0)
	for c in get_children():
		if not (c is CollisionShape3D):
			continue
		var cs := c as CollisionShape3D
		if cs.shape is SphereShape3D:
			var r: float = (cs.shape as SphereShape3D).radius
			var dir := Vector3(randf_range(-1.0, 1.0), randf_range(-0.2, 0.8),
				randf_range(-1.0, 1.0)).normalized()
			local = cs.position + dir * r
		elif cs.shape is CylinderShape3D:
			var cyl := cs.shape as CylinderShape3D
			var ang := randf() * TAU
			local = cs.position + Vector3(cos(ang) * cyl.radius,
				randf_range(-cyl.height * 0.3, cyl.height * 0.3), sin(ang) * cyl.radius)
		break
	_sweet_pos = to_global(local)
	_show_marker(local)


func _show_marker(local: Vector3) -> void:
	if _sweet_marker == null:
		_sweet_marker = MeshInstance3D.new()
		var m := SphereMesh.new()
		m.radius = 0.13
		m.height = 0.26
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color(1.0, 0.85, 0.3)
		mat.emission_enabled = true
		mat.emission = Color(1.0, 0.8, 0.2)
		mat.emission_energy_multiplier = 3.0
		mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		m.material = mat
		_sweet_marker.mesh = m
		add_child(_sweet_marker)
	_sweet_marker.position = local
	_sweet_marker.visible = true


func _hide_marker() -> void:
	_sweet_pos = Vector3.INF
	if is_instance_valid(_sweet_marker):
		_sweet_marker.visible = false
