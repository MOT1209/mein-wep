extends Node3D
## محصول مزروع في التربة: ينمو بمرور الأيام ويمكن حصاده عند النضج
##
## نماذج كل مرحلة نمو تُحمَّل ديناميكياً حسب crop_id بدل تثبيتها بالمشهد، حتى يدعم أي عدد من
## المحاصيل بمراحل بصرية مختلفة (القمح مرحلتان، الذرة 4، الجزر/اليقطين/اللفت مرحلة واحدة فقط).

const STAGE_MODELS: Dictionary = {
	"wheat": [
		"res://assets/models/crops/crops_wheatStageA.glb",
		"res://assets/models/crops/crops_wheatStageB.glb",
	],
	"corn": [
		"res://assets/models/crops/crops_cornStageA.glb",
		"res://assets/models/crops/crops_cornStageB.glb",
		"res://assets/models/crops/crops_cornStageC.glb",
		"res://assets/models/crops/crops_cornStageD.glb",
	],
	"carrot": ["res://assets/models/crops/crop_carrot.glb"],
	"pumpkin": ["res://assets/models/crops/crop_pumpkin.glb"],
	"turnip": ["res://assets/models/crops/crop_turnip.glb"],
}

## معامل تكبير خاص بكل محصول - نماذج Nature Kit أصغر من الحجم الواقعي مقارنة بشخصية اللاعب
## (1.8 وحدة)؛ القيم محسوبة بعد قياس الحجم الفعلي عبر سكربت AABB headless، وليست تخميناً
const CROP_SCALES: Dictionary = {
	"wheat": 1.8,
	"corn": 1.8,
	"carrot": 0.7,
	"pumpkin": 1.5,
	"turnip": 0.7,
}

var crop_id: String = "wheat"
var crop_info: Dictionary = {}
var growth_stage: int = 0
var days_planted: int = 0
var is_ripe: bool = false

var _stage_nodes: Array[Node3D] = []


func _ready() -> void:
	crop_info = CropData.get_crop(crop_id)
	_recalculate_growth_state()
	EventBus.day_changed.connect(_on_day_changed)
	_spawn_stage_models()
	_update_visual()


func _recalculate_growth_state() -> void:
	var total_stages: int = crop_info.get("growth_stages", 5)
	var days_to_mature: int = crop_info.get("days_to_mature", 10)
	var days_per_stage: float = float(days_to_mature) / float(total_stages)
	growth_stage = clampi(int(float(days_planted) / days_per_stage), 0, total_stages - 1)
	is_ripe = days_planted >= days_to_mature


func _spawn_stage_models() -> void:
	var model_paths: Array = STAGE_MODELS.get(crop_id, STAGE_MODELS["wheat"])
	for path: String in model_paths:
		var scene: PackedScene = load(path)
		var instance: Node3D = scene.instantiate()
		add_child(instance)
		instance.visible = false
		PropMaterialFix.remove_metallic(instance)
		_stage_nodes.append(instance)


func _on_day_changed(_day: int, _day_of_week: int) -> void:
	if is_ripe:
		return

	days_planted += 1
	var old_stage: int = growth_stage
	_recalculate_growth_state()

	if growth_stage != old_stage:
		EventBus.crop_growth_stage_changed.emit(self, growth_stage)
		_update_visual()

	if is_ripe:
		EventBus.crop_ready_to_harvest.emit(self)


func _update_visual() -> void:
	if _stage_nodes.is_empty():
		return

	var total_stages: int = maxi(crop_info.get("growth_stages", 5), 1)
	var visual_count: int = _stage_nodes.size()
	var bucket_size: float = float(total_stages) / float(visual_count)
	var active_index: int = clampi(int(float(growth_stage) / bucket_size), 0, visual_count - 1)

	for i in range(visual_count):
		_stage_nodes[i].visible = (i == active_index)

	var bucket_start: int = int(float(active_index) * bucket_size)
	var bucket_stage_count: int = maxi(int(ceil(bucket_size)), 1)
	var phase_index: int = growth_stage - bucket_start
	var scale_ratio: float = 0.4 + 0.6 * (float(phase_index) / float(maxi(bucket_stage_count - 1, 1)))
	var crop_scale: float = CROP_SCALES.get(crop_id, 1.0)
	_stage_nodes[active_index].scale = Vector3.ONE * scale_ratio * crop_scale


func interact(_player: Node) -> void:
	if not is_ripe:
		return

	var yield_item: String = crop_info.get("yield_item", crop_id)
	InventorySystem.add_item(yield_item, 1)
	EventBus.crop_harvested.emit(self, 1)
	queue_free()
