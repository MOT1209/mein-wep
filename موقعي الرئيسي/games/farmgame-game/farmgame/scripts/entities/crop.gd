extends Node3D
## محصول مزروع في التربة: ينمو بمرور الأيام ويمكن حصاده عند النضج

@onready var stage_a: Node3D = $StageA
@onready var stage_b: Node3D = $StageB

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
	if stage_a == null or stage_b == null:
		return

	var total_stages: int = maxi(crop_info.get("growth_stages", 5), 1)
	var midpoint: int = maxi(int(ceil(total_stages / 2.0)), 1)
	var use_stage_b: bool = growth_stage >= midpoint

	stage_a.visible = not use_stage_b
	stage_b.visible = use_stage_b

	var active: Node3D = stage_b if use_stage_b else stage_a
	var phase_stage_count: int = (total_stages - midpoint) if use_stage_b else midpoint
	var phase_index: int = (growth_stage - midpoint) if use_stage_b else growth_stage
	var scale_ratio: float = 0.4 + 0.6 * (float(phase_index) / float(maxi(phase_stage_count - 1, 1)))
	active.scale = Vector3.ONE * scale_ratio


func interact(_player: Node) -> void:
	if not is_ripe:
		return

	var yield_item: String = crop_info.get("yield_item", crop_id)
	InventorySystem.add_item(yield_item, 1)
	EventBus.crop_harvested.emit(self, 1)
	queue_free()
