extends StaticBody3D
## قطعة أرض واحدة في شبكة المزرعة: حرث -> غراسة -> نمو -> حصاد

const CropScene: PackedScene = preload("res://scenes/entities/crop.tscn")
const GrassMaterial: Material = preload("res://assets/materials/grass_tile.tres")
const SoilMaterial: Material = preload("res://assets/materials/soil_tilled.tres")

enum State { EMPTY, TILLED, PLANTED }

@onready var mesh_instance: MeshInstance3D = $MeshInstance3D

var state: State = State.EMPTY
var planted_crop: Node3D = null


func _ready() -> void:
	_update_visual()


func interact(player: Node) -> void:
	match state:
		State.EMPTY:
			_till()
		State.TILLED:
			_plant()
		State.PLANTED:
			if planted_crop and is_instance_valid(planted_crop):
				planted_crop.interact(player)


func _till() -> void:
	state = State.TILLED
	_update_visual()


func _plant() -> void:
	var seed_to_plant: String = InventorySystem.selected_seed_id
	if seed_to_plant == "" or not InventorySystem.has_item(seed_to_plant, 1):
		return

	var crop_id_to_plant: String = CropData.get_crop_id_by_seed(seed_to_plant)
	if crop_id_to_plant == "":
		return

	InventorySystem.remove_item(seed_to_plant, 1)

	planted_crop = CropScene.instantiate()
	planted_crop.crop_id = crop_id_to_plant
	add_child(planted_crop)
	planted_crop.position = Vector3(0, 0.05, 0)

	planted_crop.tree_exited.connect(_on_crop_removed)

	state = State.PLANTED
	EventBus.crop_planted.emit(planted_crop, Vector2i.ZERO)
	_update_visual()


func _on_crop_removed() -> void:
	planted_crop = null
	state = State.TILLED
	_update_visual()


func _update_visual() -> void:
	if mesh_instance == null:
		return
	match state:
		State.EMPTY:
			mesh_instance.material_override = GrassMaterial
		State.TILLED, State.PLANTED:
			mesh_instance.material_override = SoilMaterial
