extends Control
## لوحة التصنيع: تعرض الوصفات المتاحة وتتيح بدء التصنيع

@onready var recipe_list: VBoxContainer = $Panel/MarginContainer/VBoxContainer/ScrollContainer/RecipeList
@onready var station_label: Label = $Panel/MarginContainer/VBoxContainer/StationLabel
@onready var close_button: Button = $Panel/MarginContainer/VBoxContainer/CloseButton

var current_station: Node = null


func _ready() -> void:
	visible = false
	close_button.pressed.connect(close)


func open(station: Node) -> void:
	current_station = station
	refresh()
	visible = true
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	TimeSystem.pause()


func close() -> void:
	visible = false
	current_station = null
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	TimeSystem.resume()


func refresh() -> void:
	if current_station == null:
		return

	station_label.text = str(current_station.get("station_name")) if current_station.get("station_name") else "Craft Station"

	for child in recipe_list.get_children():
		child.queue_free()

	var station_type: String = str(current_station.get("station_type")) if current_station.get("station_type") else ""
	var recipes: Dictionary = RecipeData.get_recipes_by_station(station_type)
	for recipe_id: String in recipes:
		var recipe: Dictionary = recipes[recipe_id]
		recipe_list.add_child(_build_recipe_row(recipe_id, recipe))


func _build_recipe_row(recipe_id: String, recipe: Dictionary) -> Control:
	var row: HBoxContainer = HBoxContainer.new()

	## اسم الوصفة
	var name_label: Label = Label.new()
	name_label.text = recipe.get("name", "")
	name_label.custom_minimum_size = Vector2(120, 0)
	row.add_child(name_label)

	## المدخلات
	var inputs_label: Label = Label.new()
	var inputs_text: String = ""
	var inputs: Dictionary = recipe.get("inputs", {})
	for item_id: String in inputs:
		var quantity: int = inputs[item_id]
		if not inputs_text.is_empty():
			inputs_text += " + "
		inputs_text += "%dx %s" % [quantity, CropData.get_display_name(item_id)]
	inputs_label.text = inputs_text
	inputs_label.custom_minimum_size = Vector2(150, 0)
	row.add_child(inputs_label)

	## زر التصنيع
	var craft_button: Button = Button.new()
	var can_craft: bool = RecipeData.can_craft(recipe_id)
	craft_button.text = "Craft"
	craft_button.disabled = not can_craft
	craft_button.pressed.connect(func() -> void:
		if current_station and current_station.has_method("start_craft"):
			current_station.start_craft(recipe_id)
			refresh()
	)
	row.add_child(craft_button)

	## سعر البيع
	var price_label: Label = Label.new()
	price_label.text = "$%d" % recipe.get("sell_price", 0)
	row.add_child(price_label)

	return row
