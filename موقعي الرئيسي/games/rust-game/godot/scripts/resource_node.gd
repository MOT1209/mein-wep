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


## Yield and damage multiplier per (node type, equipped tool). The right
## tool gathers more per swing and breaks the node sooner; the drill is the
## only thing that brings up crude oil.
const TOOL_YIELD := {
	"tree": {"stone_hatchet": 2, "metal_hatchet": 3, "machete": 2},
	"rock": {"stone_pickaxe": 2, "metal_pickaxe": 3, "drill": 4},
	"iron": {"stone_pickaxe": 2, "metal_pickaxe": 3, "drill": 4},
	"sulfur": {"stone_pickaxe": 2, "metal_pickaxe": 3, "drill": 4},
}

const OIL_PER_DRILL_HIT := 3


## Called by the player on LMB hit. Grants resources scaled by the equipped
## tool, plays feedback, and destroys the node when depleted.
func hit_harvest(tool_id: String = "") -> void:
	var mult: int = int(TOOL_YIELD.get(res_type, {}).get(tool_id, 1))
	health -= mult
	match res_type:
		"tree":
			Game.add_item("wood", 12 * mult)
		"rock":
			Game.add_item("stone", 10 * mult)
		"iron":
			Game.add_item("iron", 8 * mult)
		"sulfur":
			Game.add_item("sulfur", 8 * mult)
		"barrel":
			Game.add_item("scrap", 3)
			Game.add_item("lgf", 2)
		"crate":
			Game.add_item("scrap", 5)
			Game.add_item("frag", 5)
		"bush":
			Game.add_item("berries", 5)
	if tool_id == "drill" and TOOL_YIELD.has(res_type):
		Game.add_item("oil", OIL_PER_DRILL_HIT)
	Sfx.play("harvest")

	# Small bounce feedback
	var tw := create_tween()
	tw.tween_property(self, "position:y", position.y + 0.05, 0.05)
	tw.tween_property(self, "position:y", position.y, 0.05)

	if health <= 0:
		depleted.emit(res_type, position)
		queue_free()
