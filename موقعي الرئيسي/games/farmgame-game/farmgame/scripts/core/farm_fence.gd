extends Node3D
## يبني سياجاً مربعاً حول محيط شبكة المزرعة، بفتحة بوابة على الحافة المواجهة للاعب
##
## قطع السياج الأصلية من Nature Kit صغيرة جداً (ارتفاع 0.345 وحدة فقط، بعرض وحدة واحدة)
## مقارنة بشخصية اللاعب الواقعية (1.8 وحدة). FENCE_SCALE يكبّرها لارتفاع سياج معقول،
## و MODULE_SIZE يعكس هذا التكبير في تباعد القطع حتى تستمر بالتراصف حافة بحافة بدون تراكب.
##
## تم تحديثه ليتتبع حجم شبكة المزرعة تلقائياً (12×12)

const FenceSimple: PackedScene = preload("res://assets/models/nature/fence_simple.glb")
const FenceCorner: PackedScene = preload("res://assets/models/nature/fence_corner.glb")
const FenceGate: PackedScene = preload("res://assets/models/nature/fence_gate.glb")

const FENCE_SCALE: float = 3.3
const MODULE_SIZE: float = 1.0 * FENCE_SCALE

## يجب أن تطابق هذه القيم إعدادات farm_manager.gd حتى يحيط السياج بالشبكة فعلياً
@export var grid_width: int = 12
@export var grid_height: int = 12
@export var tile_spacing: float = 2.0
@export var margin: float = 2.0


func _ready() -> void:
	var farm_half_x: float = (grid_width - 1) * tile_spacing * 0.5 + tile_spacing * 0.5
	var farm_half_z: float = (grid_height - 1) * tile_spacing * 0.5 + tile_spacing * 0.5
	var min_half_extent: float = maxf(farm_half_x, farm_half_z) + margin
	var modules_per_side: int = int(ceil(min_half_extent / MODULE_SIZE))
	var half_extent: float = modules_per_side * MODULE_SIZE

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
	var span: int = int(half_extent / MODULE_SIZE) * 2 - 1
	var start: float = -float(span - 1) / 2.0 * MODULE_SIZE

	for i in range(span):
		var offset: float = start + i * MODULE_SIZE
		var is_gate_segment: bool = has_gate and i == span / 2
		var segment_scene: PackedScene = FenceGate if is_gate_segment else FenceSimple
		var segment: Node3D = segment_scene.instantiate()
		add_child(segment)
		segment.position = center + direction * offset
		segment.scale = Vector3.ONE * FENCE_SCALE
		if rotate_segments:
			segment.rotate_y(PI / 2.0)
		PropMaterialFix.remove_metallic(segment)

		## إضافة تصادم لكل قطعة سياج (ما عدا البوابة)
		if not is_gate_segment:
			var static_body: StaticBody3D = StaticBody3D.new()
			static_body.name = "FenceCollision"
			add_child(static_body)
			static_body.position = segment.position
			static_body.rotation = segment.rotation

			var col: CollisionShape3D = CollisionShape3D.new()
			col.shape = BoxShape3D.new()
			col.shape.size = Vector3(3.3, 2.5, 0.5)
			col.position = Vector3(0, 1.25, 0)
			static_body.add_child(col)


func _place_corner(pos: Vector3, rotation_steps: int) -> void:
	var corner: Node3D = FenceCorner.instantiate()
	add_child(corner)
	corner.position = pos
	corner.scale = Vector3.ONE * FENCE_SCALE
	corner.rotate_y(rotation_steps * PI / 2.0)
	PropMaterialFix.remove_metallic(corner)

	## إضافة تصادم لقطعة الزاوية
	var static_body: StaticBody3D = StaticBody3D.new()
	static_body.name = "FenceCornerCollision"
	add_child(static_body)
	static_body.position = pos
	static_body.rotation.y = rotation_steps * PI / 2.0

	var col: CollisionShape3D = CollisionShape3D.new()
	col.shape = BoxShape3D.new()
	col.shape.size = Vector3(3.3, 2.5, 3.3)
	col.position = Vector3(0, 1.25, 0)
	static_body.add_child(col)
