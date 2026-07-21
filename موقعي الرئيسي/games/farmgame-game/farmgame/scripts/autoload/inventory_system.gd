extends Node
## نظام المخزون: يدير الأشياء التي يحملها اللاعب

const MAX_SLOTS: int = 30
const STARTING_ITEMS: Dictionary = {"wheat_seed": 10}

# item_id -> quantity
var items: Dictionary = {}


func _ready() -> void:
	for item_id: String in STARTING_ITEMS:
		items[item_id] = STARTING_ITEMS[item_id]


func add_item(item_id: String, quantity: int = 1) -> bool:
	if quantity <= 0:
		return false

	if not items.has(item_id) and items.size() >= MAX_SLOTS:
		EventBus.inventory_full.emit()
		return false

	items[item_id] = items.get(item_id, 0) + quantity
	EventBus.item_added.emit(item_id, quantity)
	return true


func remove_item(item_id: String, quantity: int = 1) -> bool:
	if not items.has(item_id) or items[item_id] < quantity:
		return false

	items[item_id] -= quantity
	if items[item_id] <= 0:
		items.erase(item_id)

	EventBus.item_removed.emit(item_id, quantity)
	return true


func get_quantity(item_id: String) -> int:
	return items.get(item_id, 0)


func has_item(item_id: String, quantity: int = 1) -> bool:
	return get_quantity(item_id) >= quantity


func get_save_data() -> Dictionary:
	return {"items": items.duplicate()}


func load_save_data(data: Dictionary) -> void:
	items = data.get("items", {}).duplicate()
