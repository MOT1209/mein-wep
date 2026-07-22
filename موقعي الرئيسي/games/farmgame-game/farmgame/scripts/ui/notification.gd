extends Control
## يعرض إشعارات للمستخدم (بيع، شراء، أحداث، تحذيرات)

@onready var notification_list: VBoxContainer = $NotificationList

var notifications: Array = []
var max_notifications: int = 5


func _ready() -> void:
	EventBus.money_changed.connect(_on_money_changed)
	EventBus.item_added.connect(_on_item_added)
	EventBus.item_removed.connect(_on_item_removed)
	EventBus.season_changed.connect(_on_season_changed)
	EventBus.animal_product_ready.connect(_on_animal_product_ready)


func _on_money_changed(new_amount: int) -> void:
	show_notification("Money: $%d" % new_amount, Color(1.0, 0.9, 0.3))


func _on_item_added(item_id: String, quantity: int) -> void:
	show_notification("+%d %s" % [quantity, CropData.get_display_name(item_id)], Color(0.3, 0.8, 0.3))


func _on_item_removed(item_id: String, quantity: int) -> void:
	show_notification("-%d %s" % [quantity, CropData.get_display_name(item_id)], Color(0.8, 0.3, 0.3))


func _on_season_changed(season: String) -> void:
	show_notification("Season: %s" % season, Color(0.5, 0.8, 1.0))


func _on_animal_product_ready(animal: Node, product_type: String) -> void:
	show_notification("Product ready: %s" % product_type, Color(1.0, 0.6, 0.2))


func show_notification(text: String, color: Color = Color.WHITE) -> void:
	var notification: Label = Label.new()
	notification.text = text
	notification.add_theme_color_override("font_color", color)
	notification.add_theme_font_size_override("font_size", 14)
	notification.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER

	notification_list.add_child(notification)
	notifications.append(notification)

	## حذف الإشعارات القديمة
	if notifications.size() > max_notifications:
		var old_notification: Label = notifications.pop_front()
		old_notification.queue_free()

	## إخفاء الإشعار بعد 3 ثواني
	var timer: Timer = Timer.new()
	timer.wait_time = 3.0
	timer.one_shot = true
	timer.timeout.connect(func() -> void:
		if notification and notification.is_inside_tree():
			notification.queue_free()
			notifications.erase(notification)
	)
	add_child(timer)
	timer.start()
