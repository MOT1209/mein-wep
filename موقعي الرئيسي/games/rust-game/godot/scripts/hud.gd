extends CanvasLayer
## In-game HUD + menu screens, all built in code: stat bars, resource
## counters, crosshair, hotbar, toasts, build info, blueprint indicator,
## blueprint selector, start screen and pause menu. Hosts the inventory UI.

const InventoryUiScript := preload("res://scripts/inventory_ui.gd")
const IconFactory := preload("res://scripts/icon_factory.gd")

const HOTBAR_SLOT_SIZE := Vector2(78, 78)
const HOTBAR_BOTTOM_MARGIN := 28.0

const BAR_DEFS := [
	["health", Color(0.91, 0.3, 0.24)],
	["hunger", Color(0.9, 0.49, 0.13)],
	["thirst", Color(0.2, 0.6, 0.86)],
	["temperature", Color(0.55, 0.82, 0.95)],
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
var _info_status: Label
var _priv_label: Label
var _bench_label: Label
var _cold_label: Label
var _hotbar_slots: Array = []
var _start_screen: Control
var _pause_menu: Control
var _bp_menu: Control
var _hint_label: Label
var _rad_overlay: ColorRect
var _damage_flash: ColorRect
var _last_health := 100.0
var inventory_ui: Control


func _ready() -> void:
	layer = 1
	# The HUD drives the pause menu, so it must keep running while paused
	process_mode = Node.PROCESS_MODE_ALWAYS
	_build_overlays()
	_build_bars()
	_build_resources()
	_build_crosshair()
	_build_hotbar()
	_build_toast()
	_build_blueprint_indicator()
	_build_info_panel()
	_build_privilege_label()
	_build_hint_label()
	_build_blueprint_menu()
	_build_pause_menu()
	_build_start_screen()

	inventory_ui = InventoryUiScript.new()
	add_child(inventory_ui)

	Game.toast.connect(_on_toast)
	Game.inventory_changed.connect(_refresh_resources)
	Game.inventory_changed.connect(_refresh_hotbar)
	Game.belt_changed.connect(_refresh_hotbar)
	_refresh_resources()
	_refresh_hotbar()


## ESC is owned by the HUD (not the player) so it still works while the
## scene tree is paused.
func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("pause") or event.is_action_pressed("ui_cancel"):
		handle_escape()
		get_viewport().set_input_as_handled()


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
	var bar := HBoxContainer.new()
	# True bottom-centre: a zero-size anchor point at the bottom middle that
	# the row grows out of symmetrically, so it stays centred at any window
	# size and whatever the slots end up measuring.
	bar.anchor_left = 0.5
	bar.anchor_right = 0.5
	bar.anchor_top = 1.0
	bar.anchor_bottom = 1.0
	bar.offset_left = 0.0
	bar.offset_right = 0.0
	bar.offset_top = -HOTBAR_BOTTOM_MARGIN
	bar.offset_bottom = -HOTBAR_BOTTOM_MARGIN
	bar.grow_horizontal = Control.GROW_DIRECTION_BOTH
	bar.grow_vertical = Control.GROW_DIRECTION_BEGIN
	bar.add_theme_constant_override("separation", 8)
	bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bar)

	for i in 6:
		var slot := PanelContainer.new()
		slot.custom_minimum_size = HOTBAR_SLOT_SIZE
		slot.mouse_filter = Control.MOUSE_FILTER_IGNORE

		var v := VBoxContainer.new()
		v.alignment = BoxContainer.ALIGNMENT_CENTER
		v.add_theme_constant_override("separation", 2)
		v.mouse_filter = Control.MOUSE_FILTER_IGNORE

		var num := _label(str(i + 1), 10, Color(1, 1, 1, 0.5))
		num.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER

		var icon := TextureRect.new()
		icon.custom_minimum_size = Vector2(32, 32)
		icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		icon.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		icon.mouse_filter = Control.MOUSE_FILTER_IGNORE

		var name_lab := _label("", 10, Color(0.86, 0.86, 0.86))
		name_lab.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		name_lab.clip_text = true

		v.add_child(num)
		v.add_child(icon)
		v.add_child(name_lab)
		slot.add_child(v)
		bar.add_child(slot)
		_hotbar_slots.append({"panel": slot, "icon": icon, "name": name_lab})


## Semi-transparent slot plate; the selected slot gets a bright rust border.
func _style_slot(panel: PanelContainer, selected: bool) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.10, 0.09, 0.09, 0.62) if selected else Color(0.03, 0.03, 0.04, 0.45)
	sb.border_color = Color(0.95, 0.55, 0.2, 0.95) if selected else Color(1, 1, 1, 0.16)
	sb.set_border_width_all(3 if selected else 1)
	sb.set_corner_radius_all(6)
	sb.set_content_margin_all(4)
	panel.add_theme_stylebox_override("panel", sb)


## Redrawn only when the belt or inventory actually changes, never per frame.
func _refresh_hotbar() -> void:
	for i in _hotbar_slots.size():
		var slot: Dictionary = _hotbar_slots[i]
		_style_slot(slot.panel, Game.selected_belt_slot == i)
		var id = Game.belt[i]
		if id is String and Game.ITEMS.has(id):
			slot.icon.texture = IconFactory.get_icon(id)
			var count := Game.get_count(id)
			slot.name.text = "%s%s" % [Game.ITEMS[id].name, (" x%d" % count) if count > 1 else ""]
		else:
			slot.icon.texture = null
			slot.name.text = "—"


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
	_info_status = _label("", 13, Color(0.95, 0.5, 0.35))
	v.add_child(_info_tier)
	v.add_child(_info_health)
	v.add_child(_info_upgrade)
	v.add_child(_info_status)
	_info_panel.add_child(v)
	_info_panel.visible = false
	style_panel(_info_panel)
	add_child(_info_panel)


func _build_overlays() -> void:
	# Radiation vignette (green edges closing in as radiation rises)
	_rad_overlay = ColorRect.new()
	_rad_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	_rad_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var shader := Shader.new()
	shader.code = "
shader_type canvas_item;
uniform float strength = 0.0;
void fragment() {
	float d = distance(UV, vec2(0.5));
	COLOR = vec4(0.15, 0.68, 0.38, smoothstep(0.3, 0.75, d) * strength);
}
"
	var mat := ShaderMaterial.new()
	mat.shader = shader
	_rad_overlay.material = mat
	add_child(_rad_overlay)

	# Red flash when taking damage
	_damage_flash = ColorRect.new()
	_damage_flash.set_anchors_preset(Control.PRESET_FULL_RECT)
	_damage_flash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_damage_flash.color = Color(0.8, 0.0, 0.0, 0.0)
	add_child(_damage_flash)


func _build_hint_label() -> void:
	_hint_label = _label("", 15, Color(1, 1, 1, 0.9))
	_hint_label.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	_hint_label.position = Vector2(-250, -110)
	_hint_label.size = Vector2(500, 22)
	_hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_hint_label.visible = false
	add_child(_hint_label)


## Dark panel with a rust-orange border, applied to HUD panels.
func style_panel(panel: PanelContainer) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.07, 0.07, 0.08, 0.9)
	sb.border_color = Color(0.8, 0.36, 0.17, 0.85)
	sb.set_border_width_all(2)
	sb.set_corner_radius_all(5)
	sb.set_content_margin_all(8)
	panel.add_theme_stylebox_override("panel", sb)


func _build_privilege_label() -> void:
	_priv_label = _label("BUILDING PRIVILEGE", 13, Color(0.18, 0.8, 0.44))
	_priv_label.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	_priv_label.position = Vector2(-220, -120)
	_priv_label.size = Vector2(200, 20)
	_priv_label.visible = false
	add_child(_priv_label)

	_bench_label = _label("", 13, Color(1.0, 0.72, 0.3))
	_bench_label.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	_bench_label.position = Vector2(-220, -142)
	_bench_label.size = Vector2(200, 20)
	_bench_label.visible = false
	add_child(_bench_label)

	_cold_label = _label("FREEZING — find a fire", 16, Color(0.6, 0.85, 1.0))
	_cold_label.set_anchors_preset(Control.PRESET_CENTER_TOP)
	_cold_label.position = Vector2(-200, 118)
	_cold_label.size = Vector2(400, 22)
	_cold_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_cold_label.visible = false
	add_child(_cold_label)


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
	get_tree().paused = false
	world.started = true
	Game.set_ui("")
	Sfx.play("ui_click")


func handle_escape() -> void:
	match Game.ui_open:
		"":
			open_pause()
		"pause":
			close_pause()
		"inventory":
			toggle_inventory()
		"blueprint":
			close_blueprint_menu()
		"start":
			pass


func open_pause() -> void:
	_pause_menu.visible = true
	Game.set_ui("pause")
	get_tree().paused = true


func close_pause() -> void:
	get_tree().paused = false
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

	# Decay / upkeep state
	if s.build_type == "tool_cupboard":
		var stocked: int = s.upkeep_total()
		_info_status.text = "Upkeep stocked: %d" % stocked
		_info_status.add_theme_color_override("font_color",
			Color(0.4, 0.85, 0.4) if stocked > 0 else Color(0.95, 0.5, 0.35))
	elif s.decaying:
		_info_status.text = "DECAYING — no upkeep"
		_info_status.add_theme_color_override("font_color", Color(0.95, 0.5, 0.35))
	else:
		_info_status.text = ""
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

	# Building privilege / workbench indicators
	if world != null and world.player != null:
		_priv_label.visible = Game.has_building_privilege(world.player.position)
	if Game.workbench_level > 0:
		_bench_label.text = "WORKBENCH LEVEL %d" % Game.workbench_level
		_bench_label.visible = true
	else:
		_bench_label.visible = false

	# Freezing warning
	var cold := float(Game.stats.temperature) < 25.0
	_cold_label.visible = cold
	if cold:
		_cold_label.modulate.a = 0.55 + 0.45 * sin(Time.get_ticks_msec() * 0.006)

	# Radiation vignette strength
	_rad_overlay.material.set_shader_parameter("strength",
		clampf(float(Game.stats.radiation) / 110.0, 0.0, 1.0))

	# Damage flash: triggers on any health drop, then fades out
	var hp := float(Game.stats.health)
	if hp < _last_health - 0.5:
		_damage_flash.color.a = 0.35
	_last_health = hp
	if _damage_flash.color.a > 0.0:
		_damage_flash.color.a = maxf(0.0, _damage_flash.color.a - 1.2 * delta)

	# Contextual hint (drinking / eating / placing stations)
	var hint := ""
	if world != null and world.player != null and Game.ui_open == "":
		var tool: String = Game.active_tool()
		if world.player.in_water:
			hint = "Press F to drink"
		elif Game.CONSUMABLES.has(tool) and Game.get_count(tool) > 0:
			hint = "Click to consume %s" % Game.ITEMS[tool].name
		elif (tool == "campfire" or tool == "furnace") and Game.get_count(tool) > 0:
			hint = "Click on the ground to place the %s" % tool
	_hint_label.text = hint
	_hint_label.visible = hint != ""
