extends Node
## نظام المخزون: يدير الأشياء التي يحملها اللاعب

const MAX_SLOTS: int = 30
const STARTING_ITEMS: Dictionary = {"wheat_seed": 10}

# item_id -> quantity
var items: Dictionary = {}

## seed_id للبذرة النشطة حالياً للزراعة؛ فارغ إذا ما فيه بذور مملوكة
var selected_seed_id: String = ""


func _ready() -> void:
	for item_id: String in STARTING_ITEMS:
		items[item_id] = STARTING_ITEMS[item_id]
	_ensure_valid_selection()


func add_item(item_id: String, quantity: int = 1) -> bool:
	if quantity <= 0:
		return false

	if not items.has(item_id) and items.size() >= MAX_SLOTS:
		EventBus.inventory_full.emit()
		return false

	items[item_id] = items.get(item_id, 0) + quantity
	EventBus.item_added.emit(item_id, quantity)

	if selected_seed_id == "":
		_ensure_valid_selection()
	return true


func remove_item(item_id: String, quantity: int = 1) -> bool:
	if not items.has(item_id) or items[item_id] < quantity:
		return false

	items[item_id] -= quantity
	if items[item_id] <= 0:
		items.erase(item_id)

	EventBus.item_removed.emit(item_id, quantity)

	if item_id == selected_seed_id and not has_item(selected_seed_id, 1):
		_ensure_valid_selection()
	return true


func get_quantity(item_id: String) -> int:
	return items.get(item_id, 0)


func has_item(item_id: String, quantity: int = 1) -> bool:
	return get_quantity(item_id) >= quantity


## يرجّع كل seed_id مملوك حالياً (بحث عبر بيانات المحاصيل، ليس افتراضاً على اسم الصنف)
func get_owned_seed_ids() -> Array[String]:
	var owned: Array[String] = []
	var all_crops: Dictionary = CropData.get_all()
	for crop_id: String in all_crops:
		var seed_id: String = all_crops[crop_id].get("seed_id", "")
		if seed_id != "" and has_item(seed_id, 1):
			owned.append(seed_id)
	return owned


## يبدّل البذرة النشطة لأقرب بذرة مملوكة تالية (يُستدعى من مفتاح cycle_seed)
func cycle_selected_seed() -> void:
	var owned: Array[String] = get_owned_seed_ids()
	if owned.is_empty():
		selected_seed_id = ""
		EventBus.selected_seed_changed.emit(selected_seed_id)
		return

	var current_index: int = owned.find(selected_seed_id)
	selected_seed_id = owned[(current_index + 1) % owned.size()]
	EventBus.selected_seed_changed.emit(selected_seed_id)


func _ensure_valid_selection() -> void:
	if selected_seed_id != "" and has_item(selected_seed_id, 1):
		return

	var owned: Array[String] = get_owned_seed_ids()
	selected_seed_id = owned[0] if not owned.is_empty() else ""
	EventBus.selected_seed_changed.emit(selected_seed_id)


func get_save_data() -> Dictionary:
	return {"items": items.duplicate(), "selected_seed_id": selected_seed_id}


func load_save_data(data: Dictionary) -> void:
	items = data.get("items", {}).duplicate()
	selected_seed_id = data.get("selected_seed_id", "")
	_ensure_valid_selection()
