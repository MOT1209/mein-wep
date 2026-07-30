extends SceneTree
## Measures every deployed piece and device against the box the game gives it.
##
## The Blender batch prints the dimensions it exported, but that is the model
## before Godot imports it and before the game places it. What matters is
## where the mesh ends up relative to the collision the player actually shoots
## at: a turret whose body floats above its own hitbox looks fine in a preview
## render and is unshootable in the game.
##
## Reports, per piece: whether it got a model at all, the visual bounds, the
## declared collision box, and how far outside it the mesh reaches.
##
##   godot --headless --path . --script res://tests/model_fit.gd

## How far a mesh may reach past its collision box before it is worth saying
## so. The project builds detail proud of the declared size on purpose — trim,
## footings, rails — so a small overhang is the house style, not a defect.
const TOLERANCE := 0.12

var frame := 0
var world: Node3D
var _save_backup := ""
var _had_save := false


func _initialize() -> void:
	if FileAccess.file_exists("user://rust_save.json"):
		_had_save = true
		var f := FileAccess.open("user://rust_save.json", FileAccess.READ)
		_save_backup = f.get_as_text()
		f.close()
		DirAccess.remove_absolute("user://rust_save.json")
	var scene: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(scene)
	world = scene


func _process(_delta: float) -> bool:
	frame += 1
	if frame < 4:
		return false
	_run()
	if _had_save:
		var rf := FileAccess.open("user://rust_save.json", FileAccess.WRITE)
		rf.store_string(_save_backup)
		rf.close()
	else:
		DirAccess.remove_absolute("user://rust_save.json")
	return true


## Union of every drawn mesh's AABB under `node`, in `node`'s own space.
##
## Meshes only, deliberately. A Light3D is a VisualInstance3D too, and its
## AABB is a cube the size of its range — every device carries a status lamp
## with a 3 m range, so counting lights reported all fourteen of them as a
## 6 x 6 x 6 box and called every one of them floating.
func _visual_bounds(node: Node3D) -> AABB:
	var out := AABB()
	var first := true
	for child in _all_descendants(node):
		if not (child is GeometryInstance3D):
			continue
		var vi := child as GeometryInstance3D
		var local := node.global_transform.affine_inverse() * vi.global_transform
		var box := local * vi.get_aabb()
		if first:
			out = box
			first = false
		else:
			out = out.merge(box)
	return out


func _all_descendants(node: Node) -> Array:
	var out := []
	for c in node.get_children():
		out.append(c)
		out.append_array(_all_descendants(c))
	return out


## True when this node's visual came from a GLB rather than a primitive the
## script drew for itself. An imported model always brings child nodes under
## an empty; a fallback is a bare MeshInstance3D holding a BoxMesh.
func _is_modelled(node: Node3D) -> bool:
	for c in node.get_children():
		if c is MeshInstance3D:
			var mesh := (c as MeshInstance3D).mesh
			if mesh is BoxMesh or mesh is ArrayMesh:
				continue
		if c is Node3D and not (c is CollisionShape3D) and not (c is Light3D) \
				and not (c is MeshInstance3D):
			return true
	return false


func _report(label: String, node: Node3D, size: Vector3, modelled: bool) -> void:
	var bounds := _visual_bounds(node)
	# The collision box the game declares, centred the way the piece places it
	var half := size * 0.5
	var over := Vector3(
		maxf(bounds.position.x * -1.0 - half.x, bounds.end.x - half.x),
		0.0,
		maxf(bounds.position.z * -1.0 - half.z, bounds.end.z - half.z))
	var verdict := "ok"
	if not modelled:
		verdict = "NO MODEL"
	elif over.x > TOLERANCE or over.z > TOLERANCE:
		verdict = "WIDE by %.2f" % maxf(over.x, over.z)
	print("  %-22s %-9s model=%-3s visual %.2f x %.2f x %.2f   box %.2f x %.2f x %.2f"
		% [label, verdict, "yes" if modelled else "NO",
			bounds.size.x, bounds.size.y, bounds.size.z,
			size.x, size.y, size.z])


func _run() -> void:
	print("")
	print("######## MODEL FIT REPORT ########")
	print("-- building pieces (visual bounds vs declared collision) --")
	# Loaded here rather than preloaded at the top: a tool script run with
	# --script is compiled before the autoloads register, and a parse-time
	# preload of a script that touches them cannot be instantiated.
	var StructureScript = load("res://scripts/structure.gd")
	for type in Game.BUILDING_TYPES:
		var s: StaticBody3D = StructureScript.new()
		s.setup(type)
		s.position = Vector3(0, 40, 0)
		world.add_child(s)
		_report(type, s, Game.BUILDING_TYPES[type].size, _is_modelled(s))
		s.free()

	print("-- devices --")
	for type in Game.DEVICES:
		var d: Node3D = world._spawn_device(type, Vector3(0, 60, 0))
		_report(type, d, Game.DEVICES[type].size, _is_modelled(d))
		world.remove_device(d)

	# A device's mesh must overlap the collision box vertically, or shots
	# aimed at what you can see pass under or over what you can hit.
	print("-- vertical overlap: is the mesh inside the box it is shot through? --")
	var floating := []
	for type in Game.DEVICES:
		var d: Node3D = world._spawn_device(type, Vector3(0, 60, 0))
		var bounds := _visual_bounds(d)
		var box_top: float = float(Game.DEVICES[type].size.y)
		# Devices sit their collision from y=0 to size.y above the base
		var mesh_low: float = bounds.position.y
		var mesh_high: float = bounds.end.y
		var overlap: float = minf(mesh_high, box_top) - maxf(mesh_low, 0.0)
		var share: float = 0.0 if bounds.size.y <= 0.0 else overlap / bounds.size.y
		if share < 0.5:
			floating.append("%s (%.0f%% inside)" % [type, share * 100.0])
		print("  %-22s mesh y %.2f..%.2f   box y 0.00..%.2f   inside %.0f%%"
			% [type, mesh_low, mesh_high, box_top, share * 100.0])
		world.remove_device(d)

	print("----------------------------------")
	if floating.is_empty():
		print("every device's mesh sits inside the box it is shot through")
	else:
		print("FLOATING: %s" % str(floating))
	print("######## END REPORT ########")
