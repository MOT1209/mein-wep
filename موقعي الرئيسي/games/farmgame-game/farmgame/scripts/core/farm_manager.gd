extends Node3D
## يبني شبكة حقول المزرعة عند بدء التشغيل
## تم توسيعه من 5×5 إلى 12×12 لدعم مزرعة أكبر

const FarmTileScene: PackedScene = preload("res://scenes/entities/farm_tile.tscn")

@export var grid_width: int = 12
@export var grid_height: int = 12
@export var tile_spacing: float = 2.0

var tiles: Array = []


func _ready() -> void:
	_generate_grid()


func _generate_grid() -> void:
	var offset_x: float = (grid_width - 1) * tile_spacing * 0.5
	var offset_z: float = (grid_height - 1) * tile_spacing * 0.5

	for x in range(grid_width):
		for z in range(grid_height):
			var tile: StaticBody3D = FarmTileScene.instantiate()
			add_child(tile)
			tile.position = Vector3(
				(x * tile_spacing) - offset_x,
				0,
				(z * tile_spacing) - offset_z
			)
			tiles.append(tile)


func get_grid_size() -> Vector2i:
	return Vector2i(grid_width, grid_height)
