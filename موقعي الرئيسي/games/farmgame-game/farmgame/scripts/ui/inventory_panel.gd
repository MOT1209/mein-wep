extends Control
## لوحة المخزون: تعرض كل الأصناف التي يحملها اللاعب وكمياتها

@onready var item_list: VBoxContainer = $Panel/MarginContainer/VBoxContainer/ScrollContainer/ItemList


func _ready() -> void:
	visible = false
	EventBus.item_added.connect(_on_inventory_changed)
	EventBus.item_removed.connect(_on_inventory_changed)


func open() -> void:
	refresh()
	visible = true


func close() -> void:
	visible = false


func _on_inventory_changed(_item_id: String, _quantity: int) -> void:
	if visible:
		refresh()


func refresh() -> void:
	for child in item_list.get_children():
		child.queue_free()

	if InventorySystem.items.is_empty():
		var empty_label: Label = Label.new()
		empty_label.text = "Inventory is empty"
		item_list.add_child(empty_label)
		return

	for item_id: String in InventorySystem.items:
		var row: HBoxContainer = HBoxContainer.new()

		var name_label: Label = Label.new()
		name_label.text = CropData.get_display_name(item_id)
		name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(name_label)

		var qty_label: Label = Label.new()
		qty_label.text = "x%d" % InventorySystem.items[item_id]
		row.add_child(qty_label)

		item_list.add_child(row)
