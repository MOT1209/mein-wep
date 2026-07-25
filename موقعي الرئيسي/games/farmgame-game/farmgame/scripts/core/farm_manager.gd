extends Node3D
## يبني شبكة حقول المزرعة عند بدء التشغيل
## تم توسيعه من 5×5 إلى 12×12 لدعم مزرعة أكبر

const FarmTileScene: PackedScene = preload("res://scenes/entities/farm_tile.tscn")

@export var grid_width: int = 12
@export var grid_height: int = 12
@export var tile_spacing: float = 2.0

var tiles: Array = []


func _ready() -> void:
	add_to_group("farm_manager")
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
			tile.grid_position = Vector2i(x, z)
			tiles.append(tile)


func get_grid_size() -> Vector2i:
	return Vector2i(grid_width, grid_height)


func get_save_data() -> Dictionary:
	var tile_data: Array = []
	for tile in tiles:
		tile_data.append(tile.get_save_data())
	return {"tiles": tile_data}


func load_save_data(data: Dictionary) -> void:
	var tile_data: Array = data.get("tiles", [])
	for entry: Dictionary in tile_data:
		var pos: Dictionary = entry.get("grid_position", {})
		var gx: int = pos.get("x", -1)
		var gz: int = pos.get("y", -1)
		var tile: Node = _find_tile(gx, gz)
		if tile:
			tile.load_save_data(entry)


func _find_tile(x: int, z: int) -> Node:
	for tile in tiles:
		if tile.grid_position == Vector2i(x, z):
			return tile
	return null
