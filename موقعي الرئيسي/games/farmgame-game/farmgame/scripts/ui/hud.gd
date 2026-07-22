extends Control
## واجهة اللعبة الرئيسية: الوقت، اليوم، الفصل، المال، الطاقة والجوع
## تم إضافة: خريطة مصغرة، tooltips، إشعارات، لوحة تصنيع

@onready var time_label: Label = $TopBar/TimeLabel
@onready var day_label: Label = $TopBar/DayLabel
@onready var money_label: Label = $TopBar/MoneyLabel
@onready var seed_label: Label = $TopBar/SeedLabel
@onready var energy_bar: ProgressBar = $BottomBar/EnergyBar
@onready var hunger_bar: ProgressBar = $BottomBar/HungerBar
@onready var inventory_panel: Control = $InventoryPanel
@onready var shop_panel: Control = $ShopPanel
@onready var pause_menu: Control = $PauseMenu
@onready var minimap: Control = $Minimap
@onready var tooltip: Control = $Tooltip
@onready var notification: Control = $Notification
@onready var craft_panel: Control = $CraftPanel


func _ready() -> void:
	add_to_group("hud")
	EventBus.hour_changed.connect(_on_hour_changed)
	EventBus.day_changed.connect(_on_day_changed)
	EventBus.season_changed.connect(_on_season_changed)
	EventBus.money_changed.connect(_on_money_changed)
	EventBus.player_stats_changed.connect(_on_player_stats_changed)
	EventBus.selected_seed_changed.connect(_on_selected_seed_changed)
	pause_menu.resume_requested.connect(_close_all_menus)

	_on_hour_changed(TimeSystem.current_hour)
	_on_day_changed(TimeSystem.current_day, TimeSystem.current_day_of_week)
	_on_money_changed(EconomySystem.money)
	_on_selected_seed_changed(InventorySystem.selected_seed_id)


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("toggle_inventory"):
		_toggle_menu(inventory_panel)
	elif event.is_action_pressed("toggle_shop"):
		_toggle_menu(shop_panel)
	elif event.is_action_pressed("ui_cancel"):
		if inventory_panel.visible or shop_panel.visible or craft_panel.visible:
			_close_all_menus()
		else:
			_toggle_menu(pause_menu)


func _toggle_menu(menu: Control) -> void:
	if menu.visible:
		_close_all_menus()
		return

	_close_all_menus()
	menu.open()
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	TimeSystem.pause()


func _close_all_menus() -> void:
	inventory_panel.close()
	shop_panel.close()
	pause_menu.close()
	craft_panel.close()
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	TimeSystem.resume()


func open_craft_panel(station: Node) -> void:
	_close_all_menus()
	craft_panel.open(station)
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	TimeSystem.pause()


func _on_hour_changed(_hour: int) -> void:
	time_label.text = TimeSystem.get_time_string()


func _on_day_changed(day: int, _day_of_week: int) -> void:
	day_label.text = "%s - Day %d" % [TimeSystem.current_season, day]


func _on_season_changed(_season: String) -> void:
	day_label.text = "%s - Day %d" % [TimeSystem.current_season, TimeSystem.current_day]


func _on_money_changed(new_amount: int) -> void:
	money_label.text = "$%d" % new_amount


func _on_player_stats_changed(stat_name: String, value: float) -> void:
	if stat_name == "energy":
		energy_bar.value = value
	elif stat_name == "hunger":
		hunger_bar.value = value


func _on_selected_seed_changed(seed_id: String) -> void:
	seed_label.text = "Seed: %s" % (CropData.get_display_name(seed_id) if seed_id != "" else "-")
