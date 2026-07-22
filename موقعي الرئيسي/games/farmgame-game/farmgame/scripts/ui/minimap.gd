extends Control
## خريطة مصغرة: تعرض المزرعة من أعلى

@onready var minimap_texture: TextureRect = $MinimapTexture
@onready var player_dot: ColorRect = $PlayerDot

var minimap_size: Vector2 = Vector2(150, 150)
var world_size: Vector2 = Vector2(100, 100)
var player_position: Vector2 = Vector2.ZERO


func _ready() -> void:
	EventBus.player_moved.connect(_on_player_moved)
	_create_minimap_background()


func _create_minimap_background() -> void:
	## إنشاء خلفية الخريطة
	var bg: ColorRect = ColorRect.new()
	bg.color = Color(0.2, 0.3, 0.2, 0.8)
	bg.custom_minimum_size = minimap_size
	bg.size = minimap_size
	add_child(bg)

	## إنشاء منطقة المزرعة
	var farm_area: ColorRect = ColorRect.new()
	farm_area.color = Color(0.4, 0.3, 0.2, 0.6)
	farm_area.position = Vector2(minimap_size.x * 0.35, minimap_size.y * 0.35)
	farm_area.size = Vector2(minimap_size.x * 0.3, minimap_size.y * 0.3)
	add_child(farm_area)

	## إعادة استخدام نقطة اللاعب الموجودة بالمشهد (وليس إنشاء ثانية) ورفعها فوق الخلفية
	player_dot.color = Color(1.0, 0.0, 0.0)
	player_dot.size = Vector2(6, 6)
	player_dot.position = minimap_size * 0.5 - Vector2(3, 3)
	move_child(player_dot, get_child_count() - 1)


func _on_player_moved(position: Vector3) -> void:
	## تحويل موقع اللاعب في العالم لموقع على الخريطة
	var normalized_x: float = (position.x + world_size.x * 0.5) / world_size.x
	var normalized_z: float = (position.z + world_size.y * 0.5) / world_size.y

	player_position = Vector2(
		normalized_x * minimap_size.x,
		normalized_z * minimap_size.y
	)

	if player_dot:
		player_dot.position = player_position - Vector2(3, 3)


func add_building_marker(position: Vector3, color: Color) -> void:
	var marker: ColorRect = ColorRect.new()
	marker.color = color
	marker.size = Vector2(8, 8)

	var normalized_x: float = (position.x + world_size.x * 0.5) / world_size.x
	var normalized_z: float = (position.z + world_size.y * 0.5) / world_size.y

	marker.position = Vector2(
		normalized_x * minimap_size.x - 4,
		normalized_z * minimap_size.y - 4
	)
	add_child(marker)


func add_animal_marker(position: Vector3, color: Color) -> void:
	var marker: ColorRect = ColorRect.new()
	marker.color = color
	marker.size = Vector2(4, 4)

	var normalized_x: float = (position.x + world_size.x * 0.5) / world_size.x
	var normalized_z: float = (position.z + world_size.y * 0.5) / world_size.y

	marker.position = Vector2(
		normalized_x * minimap_size.x - 2,
		normalized_z * minimap_size.y - 2
	)
	add_child(marker)
