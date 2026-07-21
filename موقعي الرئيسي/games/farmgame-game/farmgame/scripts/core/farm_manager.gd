extends Node3D
## يبني شبكة حقول المزرعة عند بدء التشغيل

const FarmTileScene: PackedScene = preload("res://scenes/entities/farm_tile.tscn")

@export var grid_width: int = 5
@export var grid_height: int = 5
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
