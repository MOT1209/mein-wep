extends StaticBody3D
## A placed building piece (foundation, wall, doorway, ceiling, tool
## cupboard or door). Holds tier/health, supports upgrade/repair coloring
## and door open/close.

var build_type := "foundation"
var tier := "twig"
var health := 10.0
var max_health := 10.0
var is_door := false
var is_open := false
var base_rot := 0.0

var _mat: StandardMaterial3D


func setup(type: String) -> void:
	build_type = type
	var bt: Dictionary = Game.BUILDING_TYPES[type]
	is_door = bt.is_door
	collision_layer = 2
	collision_mask = 0

	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = bt.size
	_mat = StandardMaterial3D.new()
	_mat.roughness = 0.8
	box.material = _mat
	mi.mesh = box
	add_child(mi)

	var cs := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = bt.size
	cs.shape = shape
	add_child(cs)

	apply_tier("twig")


func apply_tier(t: String) -> void:
	if not Game.BUILDING_TIERS.has(t):
		t = "twig"
	tier = t
	var td: Dictionary = Game.BUILDING_TIERS[t]
	max_health = float(td.health)
	health = max_health
	_mat.albedo_color = td.color


func toggle_door() -> void:
	is_open = not is_open
	rotation.y = base_rot + (PI / 2.0 if is_open else 0.0)
	Sfx.play("door")


## Bare-fist damage (punching structures, like the JS version).
func take_hit(amount: float) -> void:
	health -= amount
	if health <= 0.0:
		var world := get_parent()
		if world != null and world.has_method("unregister_structure"):
			world.unregister_structure(self)
		if build_type == "tool_cupboard":
			Game.tool_cupboards.erase(Vector2(position.x, position.z))
		queue_free()
