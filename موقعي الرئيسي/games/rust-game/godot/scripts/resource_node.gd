extends StaticBody3D
## A harvestable world resource (tree, rock, iron, sulfur, barrel, crate).
## Builds its own procedural visuals + collision. Yields items per hit,
## emits `depleted` when destroyed so the world can schedule a respawn.

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
			_build_boulder(Color8(117, 117, 117), 0.0)
		"iron":
			health = 5
			_build_boulder(Color8(144, 164, 174), 0.4)
		"sulfur":
			health = 5
			_build_boulder(Color8(253, 216, 53), 0.0, Color8(68, 68, 0))
		"barrel":
			health = 3
			_build_barrel()
		"crate":
			health = 3
			_build_crate()


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

	var leaf_mat := StandardMaterial3D.new()
	leaf_mat.albedo_color = Color8(46, 125, 50)
	leaf_mat.roughness = 0.8
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


## Called by the player on LMB hit. Grants resources, plays feedback,
## destroys the node when depleted.
func hit_harvest() -> void:
	health -= 1
	match res_type:
		"tree":
			Game.add_item("wood", 12)
		"rock":
			Game.add_item("stone", 10)
		"iron":
			Game.add_item("iron", 8)
		"sulfur":
			Game.add_item("sulfur", 8)
		"barrel":
			Game.add_item("scrap", 3)
			Game.add_item("lgf", 2)
		"crate":
			Game.add_item("scrap", 5)
			Game.add_item("frag", 5)
	Sfx.play("harvest")

	# Small bounce feedback
	var tw := create_tween()
	tw.tween_property(self, "position:y", position.y + 0.05, 0.05)
	tw.tween_property(self, "position:y", position.y, 0.05)

	if health <= 0:
		depleted.emit(res_type, position)
		queue_free()
