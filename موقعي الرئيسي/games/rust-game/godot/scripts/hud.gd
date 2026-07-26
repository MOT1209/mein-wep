extends CanvasLayer
## In-game HUD + menu screens, all built in code: stat bars, resource
## counters, crosshair, hotbar, toasts, build info, blueprint indicator,
## blueprint selector, start screen and pause menu. Hosts the inventory UI.

const InventoryUiScript := preload("res://scripts/inventory_ui.gd")

const BAR_DEFS := [
	["health", Color(0.91, 0.3, 0.24)],
	["hunger", Color(0.9, 0.49, 0.13)],
	["thirst", Color(0.2, 0.6, 0.86)],
	["radiation", Color(0.18, 0.8, 0.44)],
]

var world: Node3D

var _bar_fills: Dictionary = {}
var _res_label: Label
var _toast_label: Label
var _toast_left := 0.0
var _bp_label: Label
var _info_panel: PanelContainer
var _info_tier: Label
var _info_health: Label
var _info_upgrade: Label
var _priv_label: Label
var _hotbar_slots: Array = []
var _start_screen: Control
var _pause_menu: Control
var _bp_menu: Control
var inventory_ui: Control


func _ready() -> void:
	layer = 1
	_build_bars()
	_build_resources()
	_build_crosshair()
	_build_hotbar()
	_build_toast()
	_build_blueprint_indicator()
	_build_info_panel()
	_build_privilege_label()
	_build_blueprint_menu()
	_build_pause_menu()
	_build_start_screen()

	inventory_ui = InventoryUiScript.new()
	add_child(inventory_ui)

	Game.toast.connect(_on_toast)
	Game.inventory_changed.connect(_refresh_resources)
	_refresh_resources()


# ==================== BUILDERS ====================

func _label(text: String, size: int = 14, color := Color.WHITE) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l


func _build_bars() -> void:
	var box := VBoxContainer.new()
	box.position = Vector2(16, 16)
	box.add_theme_constant_override("separation", 6)
	box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(box)
	for def in BAR_DEFS:
		var row := Control.new()
		row.custom_minimum_size = Vector2(210, 20)
		row.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var bg := ColorRect.new()
		bg.color = Color(0, 0, 0, 0.55)
		bg.size = Vector2(210, 20)
		bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
		row.add_child(bg)
		var fill := ColorRect.new()
		fill.color = def[1]
		fill.position = Vector2(2, 2)
		fill.size = Vector2(206, 16)
		fill.mouse_filter = Control.MOUSE_FILTER_IGNORE
		row.add_child(fill)
		var lab := _label(str(def[0]).capitalize(), 12)
		lab.position = Vector2(8, 1)
		row.add_child(lab)
		box.add_child(row)
		_bar_fills[def[0]] = fill


func _build_resources() -> void:
	_res_label = _label("", 16)
	_res_label.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	_res_label.position = Vector2(-320, 16)
	_res_label.size = Vector2(300, 24)
	_res_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	add_child(_res_label)


func _build_crosshair() -> void:
	var c := ColorRect.new()
	c.color = Color(1, 1, 1, 0.8)
	c.set_anchors_preset(Control.PRESET_CENTER)
	c.position = Vector2(-2, -2)
	c.size = Vector2(4, 4)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(c)


func _build_hotbar() -> void:
	var box := HBoxContainer.new()
	box.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	box.position = Vector2(-240, -76)
	box.add_theme_constant_override("separation", 8)
	box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(box)
	for i in 6:
		var panel := PanelContainer.new()
		panel.custom_minimum_size = Vector2(72, 56)
		panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var lab := _label("%d" % (i + 1), 11)
		lab.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lab.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		lab.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		panel.add_child(lab)
		box.add_child(panel)
		_hotbar_slots.append([panel, lab])


func _build_toast() -> void:
	_toast_label = _label("", 16)
	_toast_label.set_anchors_preset(Control.PRESET_CENTER_TOP)
	_toast_label.position = Vector2(-250, 90)
	_toast_label.size = Vector2(500, 26)
	_toast_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_toast_label.visible = false
	add_child(_toast_label)


func _build_blueprint_indicator() -> void:
	_bp_label = _label("", 15, Color(1, 0.84, 0))
	_bp_label.set_anchors_preset(Control.PRESET_CENTER_TOP)
	_bp_label.position = Vector2(-300, 56)
	_bp_label.size = Vector2(600, 24)
	_bp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(_bp_label)


func _build_info_panel() -> void:
	_info_panel = PanelContainer.new()
	_info_panel.set_anchors_preset(Control.PRESET_CENTER_RIGHT)
	_info_panel.position = Vector2(-280, -50)
	_info_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var v := VBoxContainer.new()
	_info_tier = _label("", 14)
	_info_health = _label("", 14)
	_info_upgrade = _label("", 13, Color(0.8, 0.8, 0.8))
	v.add_child(_info_tier)
	v.add_child(_info_health)
	v.add_child(_info_upgrade)
	_info_panel.add_child(v)
	_info_panel.visible = false
	add_child(_info_panel)


func _build_privilege_label() -> void:
	_priv_label = _label("BUILDING PRIVILEGE", 13, Color(0.18, 0.8, 0.44))
	_priv_label.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	_priv_label.position = Vector2(-220, -120)
	_priv_label.size = Vector2(200, 20)
	_priv_label.visible = false
	add_child(_priv_label)


func _dim_screen() -> ColorRect:
	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0.75)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	return dim


func _build_blueprint_menu() -> void:
	_bp_menu = Control.new()
	_bp_menu.set_anchors_preset(Control.PRESET_FULL_RECT)
	_bp_menu.visible = false
	_bp_menu.add_child(_dim_screen())
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 12)
	var title := _label("SELECT BLUEPRINT", 22, Color(1, 0.84, 0))
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(title)
	var grid := GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation", 10)
	grid.add_theme_constant_override("v_separation", 10)
	for type in Game.BUILDING_TYPES:
		var b := Button.new()
		b.text = Game.BUILDING_TYPES[type].name
		b.custom_minimum_size = Vector2(170, 60)
		b.pressed.connect(_on_blueprint_chosen.bind(type))
		grid.add_child(b)
	v.add_child(grid)
	var hint := _label("Q / RMB to close — piece follows your crosshair", 13, Color(0.7, 0.7, 0.7))
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(hint)
	center.add_child(v)
	_bp_menu.add_child(center)
	add_child(_bp_menu)


func _build_pause_menu() -> void:
	_pause_menu = Control.new()
	_pause_menu.set_anchors_preset(Control.PRESET_FULL_RECT)
	_pause_menu.visible = false
	_pause_menu.add_child(_dim_screen())
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 10)
	var title := _label("PAUSED", 26)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(title)
	var resume := Button.new()
	resume.text = "RESUME"
	resume.custom_minimum_size = Vector2(220, 44)
	resume.pressed.connect(func(): close_pause())
	v.add_child(resume)
	var save := Button.new()
	save.text = "SAVE GAME"
	save.custom_minimum_size = Vector2(220, 44)
	save.pressed.connect(func(): world.save_game())
	v.add_child(save)
	var quit := Button.new()
	quit.text = "SAVE & QUIT"
	quit.custom_minimum_size = Vector2(220, 44)
	quit.pressed.connect(func():
		world.save_game()
		get_tree().quit())
	v.add_child(quit)
	center.add_child(v)
	_pause_menu.add_child(center)
	add_child(_pause_menu)


func _build_start_screen() -> void:
	_start_screen = Control.new()
	_start_screen.set_anchors_preset(Control.PRESET_FULL_RECT)
	_start_screen.visible = false
	var dim := _dim_screen()
	dim.color = Color(0.04, 0.04, 0.05, 0.92)
	_start_screen.add_child(dim)
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 14)
	var title := _label("RUST SURVIVAL 3D", 40, Color(0.8, 0.36, 0.17))
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(title)
	var controls := _label(
		"W A S D  Move   |   SPACE  Jump   |   V  Camera (1st/3rd)\n" +
		"LMB  Action   |   RMB / Q  Build Menu   |   E  Inventory\n" +
		"R  Rotate   |   G  Cancel Build   |   H  Upgrade / Repair\n" +
		"1-6  Hotbar   |   ESC  Pause",
		16, Color(0.85, 0.85, 0.85))
	controls.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(controls)
	var start := Button.new()
	start.text = "START SURVIVAL"
	start.custom_minimum_size = Vector2(260, 52)
	start.pressed.connect(_on_start_pressed)
	v.add_child(start)
	var ver := _label("Godot Edition 1.0 — ported from the web version", 12, Color(0.5, 0.5, 0.5))
	ver.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(ver)
	center.add_child(v)
	_start_screen.add_child(center)
	add_child(_start_screen)


# ==================== STATE / FLOW ====================

func show_start_screen() -> void:
	_start_screen.visible = true
	Game.set_ui("start")


func _on_start_pressed() -> void:
	_start_screen.visible = false
	world.started = true
	Game.set_ui("")
	Sfx.play("ui_click")


func handle_escape() -> void:
	match Game.ui_open:
		"":
			_pause_menu.visible = true
			Game.set_ui("pause")
		"pause":
			close_pause()
		"inventory":
			toggle_inventory()
		"blueprint":
			close_blueprint_menu()
		"start":
			pass


func close_pause() -> void:
	_pause_menu.visible = false
	Game.set_ui("")


func toggle_inventory() -> void:
	if Game.ui_open == "inventory":
		inventory_ui.close()
	elif Game.ui_open == "":
		inventory_ui.open()


func open_blueprint_menu() -> void:
	if Game.ui_open == "blueprint":
		close_blueprint_menu()
		return
	if Game.ui_open != "":
		return
	_bp_menu.visible = true
	Game.set_ui("blueprint")


func close_blueprint_menu() -> void:
	_bp_menu.visible = false
	Game.set_ui("")


func _on_blueprint_chosen(type: String) -> void:
	Game.selected_blueprint = type
	close_blueprint_menu()
	Sfx.play("ui_click")


# ==================== UPDATES ====================

func _on_toast(msg: String, color: Color) -> void:
	_toast_label.text = msg
	_toast_label.add_theme_color_override("font_color", color)
	_toast_label.visible = true
	_toast_left = 2.0


func _refresh_resources() -> void:
	_res_label.text = "Wood: %d   Stone: %d   Metal Ore: %d" % [
		Game.get_count("wood"), Game.get_count("stone"), Game.get_count("iron")]


func update_build_info(s: Node3D) -> void:
	if s == null:
		_info_panel.visible = false
		return
	var stability := maxi(20, 100 - floori((s.position.y - 0.1) * 10.0))
	_info_tier.text = "%s (%d%%)" % [Game.BUILDING_TIERS[s.tier].name, stability]
	_info_health.text = "HP: %d / %d" % [roundi(s.health), roundi(s.max_health)]
	var idx := Game.TIER_ORDER.find(s.tier)
	if idx >= 0 and idx < Game.TIER_ORDER.size() - 1:
		var next: String = Game.TIER_ORDER[idx + 1]
		var cost: Dictionary = Game.BUILDING_TIERS[next].cost
		var parts := []
		for res in cost:
			parts.append("%s (%d)" % [res, cost[res]])
		_info_upgrade.text = "Upgrade -> %s: %s" % [Game.BUILDING_TIERS[next].name, ", ".join(parts)]
	else:
		_info_upgrade.text = "MAX TIER"
	_info_panel.visible = true


func _process(delta: float) -> void:
	# Stat bars
	for key in _bar_fills:
		var v: float = clampf(float(Game.stats[key]), 0.0, 100.0)
		_bar_fills[key].size.x = 206.0 * v / 100.0

	# Toast fade
	if _toast_left > 0.0:
		_toast_left -= delta
		if _toast_left <= 0.0:
			_toast_label.visible = false

	# Blueprint indicator
	if Game.selected_blueprint != "":
		_bp_label.text = "Selected: %s | Angle: %d°  (R rotate, G cancel)" % [
			Game.BUILDING_TYPES[Game.selected_blueprint].name,
			roundi(rad_to_deg(Game.blueprint_rotation))]
		_bp_label.visible = true
	else:
		_bp_label.visible = false

	# Hotbar
	for i in _hotbar_slots.size():
		var panel: PanelContainer = _hotbar_slots[i][0]
		var lab: Label = _hotbar_slots[i][1]
		var id = Game.belt[i]
		if id is String and Game.ITEMS.has(id):
			lab.text = "%d\n%s" % [i + 1, Game.ITEMS[id].name]
		else:
			lab.text = "%d\n-" % (i + 1)
		panel.self_modulate = Color(1.6, 1.3, 0.6) if Game.selected_belt_slot == i else Color.WHITE

	# Building privilege indicator
	if world != null and world.player != null:
		_priv_label.visible = Game.has_building_privilege(world.player.position)
