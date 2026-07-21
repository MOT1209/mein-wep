extends Node3D
## محصول مزروع في التربة: ينمو بمرور الأيام ويمكن حصاده عند النضج

@onready var mesh_instance: MeshInstance3D = $MeshInstance3D

var crop_id: String = "wheat"
var crop_info: Dictionary = {}
var growth_stage: int = 0
var days_planted: int = 0
var is_ripe: bool = false


func _ready() -> void:
	crop_info = CropData.get_crop(crop_id)
	EventBus.day_changed.connect(_on_day_changed)
	_update_visual()


func _on_day_changed(_day: int, _day_of_week: int) -> void:
	if is_ripe:
		return

	days_planted += 1
	var total_stages: int = crop_info.get("growth_stages", 5)
	var days_to_mature: int = crop_info.get("days_to_mature", 10)
	var days_per_stage: float = float(days_to_mature) / float(total_stages)
	var new_stage: int = clampi(int(float(days_planted) / days_per_stage), 0, total_stages - 1)

	if new_stage != growth_stage:
		growth_stage = new_stage
		EventBus.crop_growth_stage_changed.emit(self, growth_stage)
		_update_visual()

	if days_planted >= days_to_mature:
		is_ripe = true
		EventBus.crop_ready_to_harvest.emit(self)


func _update_visual() -> void:
	if mesh_instance == null:
		return
	var total_stages: int = maxi(crop_info.get("growth_stages", 5), 1)
	var scale_ratio: float = 0.2 + (0.8 * float(growth_stage) / float(total_stages - 1) if total_stages > 1 else 1.0)
	mesh_instance.scale = Vector3.ONE * scale_ratio


func interact(_player: Node) -> void:
	if not is_ripe:
		return

	var yield_item: String = crop_info.get("yield_item", crop_id)
	InventorySystem.add_item(yield_item, 1)
	EventBus.crop_harvested.emit(self, 1)
	queue_free()
