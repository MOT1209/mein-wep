extends Control
## يعرض معلومات تفصيلية عند المرور على العناصر

@onready var tooltip_label: Label = $Panel/TooltipLabel
@onready var panel: PanelContainer = $Panel

var is_visible: bool = false


func _ready() -> void:
	visible = false
	panel.visible = false


func show_tooltip(text: String, position: Vector2) -> void:
	tooltip_label.text = text
	panel.position = position + Vector2(10, 10)
	visible = true
	panel.visible = true
	is_visible = true


func hide_tooltip() -> void:
	visible = false
	panel.visible = false
	is_visible = false


func show_crop_info(crop_data: Dictionary, position: Vector2) -> void:
	var text: String = ""
	text += "Name: %s\n" % crop_data.get("name", "")
	text += "Growth: %d days\n" % crop_data.get("days_to_mature", 0)
	text += "Sell Price: $%d\n" % crop_data.get("sell_price", 0)
	text += "Season: %s" % crop_data.get("season", "")
	show_tooltip(text, position)


func show_animal_info(animal_info: Dictionary, position: Vector2) -> void:
	var text: String = ""
	text += "Name: %s\n" % animal_info.get("animal_name", "")
	text += "Hunger: %.0f%%\n" % animal_info.get("hunger", 0)
	text += "Happiness: %.0f%%\n" % animal_info.get("happiness", 0)
	text += "Product: %s\n" % animal_info.get("product_name", "")
	text += "Feed Cost: $%d" % animal_info.get("feed_cost", 0)
	show_tooltip(text, position)


func show_item_info(item_id: String, quantity: int, position: Vector2) -> void:
	var text: String = ""
	text += "Item: %s\n" % CropData.get_display_name(item_id)
	text += "Quantity: %d" % quantity
	show_tooltip(text, position)
