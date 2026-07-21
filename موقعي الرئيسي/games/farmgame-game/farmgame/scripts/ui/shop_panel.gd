extends Control
## لوحة المتجر: شراء بذور وبيع محاصيل مقابل نقود، مبنية على data/crops.json

@onready var shop_list: VBoxContainer = $Panel/MarginContainer/VBoxContainer/ScrollContainer/ShopList
@onready var money_label: Label = $Panel/MarginContainer/VBoxContainer/MoneyLabel


func _ready() -> void:
	visible = false
	EventBus.money_changed.connect(_on_state_changed)
	EventBus.item_added.connect(_on_item_changed)
	EventBus.item_removed.connect(_on_item_changed)


func open() -> void:
	refresh()
	visible = true


func close() -> void:
	visible = false


func _on_state_changed(_value) -> void:
	if visible:
		refresh()


func _on_item_changed(_item_id: String, _quantity: int) -> void:
	if visible:
		refresh()


func refresh() -> void:
	money_label.text = "Money: $%d" % EconomySystem.money

	for child in shop_list.get_children():
		child.queue_free()

	var crops: Dictionary = CropData.get_all()
	for crop_id: String in crops:
		shop_list.add_child(_build_row(crops[crop_id]))


func _build_row(info: Dictionary) -> Control:
	var row: HBoxContainer = HBoxContainer.new()

	var name_label: Label = Label.new()
	name_label.text = info.get("name", "")
	name_label.custom_minimum_size = Vector2(110, 0)
	row.add_child(name_label)

	var seed_id: String = info.get("seed_id", "")
	var seed_cost: int = info.get("seed_cost", 0)
	var buy_button: Button = Button.new()
	buy_button.text = "Buy Seed ($%d)" % seed_cost
	buy_button.disabled = not EconomySystem.can_afford(seed_cost)
	buy_button.pressed.connect(func() -> void:
		EconomySystem.buy_item(seed_id, 1, seed_cost)
		refresh()
	)
	row.add_child(buy_button)

	var yield_item: String = info.get("yield_item", "")
	var sell_price: int = info.get("sell_price", 0)
	var sell_button: Button = Button.new()
	sell_button.text = "Sell 1 ($%d)" % sell_price
	sell_button.disabled = not InventorySystem.has_item(yield_item, 1)
	sell_button.pressed.connect(func() -> void:
		EconomySystem.sell_item(yield_item, 1, sell_price)
		refresh()
	)
	row.add_child(sell_button)

	return row
