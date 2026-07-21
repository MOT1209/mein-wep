extends StaticBody3D
## قطعة أرض واحدة في شبكة المزرعة: حرث -> غراسة -> نمو -> حصاد

const CropScene: PackedScene = preload("res://scenes/entities/crop.tscn")

enum State { EMPTY, TILLED, PLANTED }

@onready var mesh_instance: MeshInstance3D = $MeshInstance3D

var state: State = State.EMPTY
var planted_crop: Node3D = null
var seed_to_plant: String = "wheat_seed"
var crop_id_to_plant: String = "wheat"


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
	if not InventorySystem.has_item(seed_to_plant, 1):
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
			mesh_instance.material_override = null
		State.TILLED, State.PLANTED:
			var mat: StandardMaterial3D = StandardMaterial3D.new()
			mat.albedo_color = Color(0.36, 0.24, 0.14)
			mesh_instance.material_override = mat
