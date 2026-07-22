extends Node3D
## يبني سياجاً مربعاً حول محيط شبكة المزرعة، بفتحة بوابة على الحافة المواجهة للاعب

const FenceSimple: PackedScene = preload("res://assets/models/nature/fence_simple.glb")
const FenceCorner: PackedScene = preload("res://assets/models/nature/fence_corner.glb")
const FenceGate: PackedScene = preload("res://assets/models/nature/fence_gate.glb")

## يجب أن تطابق هذه القيم إعدادات farm_manager.gd حتى يحيط السياج بالشبكة فعلياً
@export var grid_width: int = 5
@export var grid_height: int = 5
@export var tile_spacing: float = 2.0
@export var margin: float = 2.0


func _ready() -> void:
	var farm_half_x: float = (grid_width - 1) * tile_spacing * 0.5 + tile_spacing * 0.5
	var farm_half_z: float = (grid_height - 1) * tile_spacing * 0.5 + tile_spacing * 0.5
	var half_extent: float = ceilf(maxf(farm_half_x, farm_half_z) + margin)

	# الحواف الشمالية والجنوبية (على طول X)، البوابة على الحافة الجنوبية المواجهة لنقطة ظهور اللاعب
	_build_edge(Vector3(0, 0, -half_extent), Vector3.RIGHT, half_extent, false)
	_build_edge(Vector3(0, 0, half_extent), Vector3.RIGHT, half_extent, true)

	# الحواف الشرقية والغربية (على طول Z)
	_build_edge(Vector3(-half_extent, 0, 0), Vector3.BACK, half_extent, false, true)
	_build_edge(Vector3(half_extent, 0, 0), Vector3.BACK, half_extent, false, true)

	_place_corner(Vector3(-half_extent, 0, -half_extent), 0)
	_place_corner(Vector3(half_extent, 0, -half_extent), 1)
	_place_corner(Vector3(half_extent, 0, half_extent), 2)
	_place_corner(Vector3(-half_extent, 0, half_extent), 3)


func _build_edge(center: Vector3, direction: Vector3, half_extent: float, has_gate: bool, rotate_segments: bool = false) -> void:
	var span: int = int(half_extent) * 2 - 1
	var start: float = -float(span - 1) / 2.0

	for i in range(span):
		var offset: float = start + i
		var is_gate_segment: bool = has_gate and i == span / 2
		var segment_scene: PackedScene = FenceGate if is_gate_segment else FenceSimple
		var segment: Node3D = segment_scene.instantiate()
		add_child(segment)
		segment.position = center + direction * offset
		if rotate_segments:
			segment.rotate_y(PI / 2.0)


func _place_corner(pos: Vector3, rotation_steps: int) -> void:
	var corner: Node3D = FenceCorner.instantiate()
	add_child(corner)
	corner.position = pos
	corner.rotate_y(rotation_steps * PI / 2.0)
