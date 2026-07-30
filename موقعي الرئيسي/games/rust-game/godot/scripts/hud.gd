extends CanvasLayer
## In-game HUD + menu screens, all built in code: stat bars, resource
## counters, crosshair, hotbar, toasts, build info, blueprint indicator,
## blueprint selector, start screen and pause menu. Hosts the inventory UI.

const InventoryUiScript := preload("res://scripts/inventory_ui.gd")
const MapUiScript := preload("res://scripts/map_ui.gd")
const IconFactory := preload("res://scripts/icon_factory.gd")

const TouchControlsScript := preload("res://scripts/touch_controls.gd")
const SettingsUiScript := preload("res://scripts/settings_ui.gd")

const HOTBAR_SLOT_SIZE := Vector2(64, 64)
const HOTBAR_ICON_SIZE := Vector2(34, 34)
const HOTBAR_BOTTOM_MARGIN := 24.0

const HUD_MARGIN := 16.0
const STAT_ROW_HEIGHT := 18.0
const STAT_NAME_WIDTH := 96.0   # fits "Temperature", the longest stat name
const STAT_BAR_WIDTH := 120.0
const STAT_VALUE_WIDTH := 34.0
const RES_NAME_WIDTH := 92.0    # fits "Metal Ore"
const RES_COUNT_WIDTH := 52.0

## Resources shown in the top-right readout.
const TRACKED_RESOURCES := ["wood", "stone", "iron"]

const BAR_DEFS := [
	["health", Color(0.91, 0.3, 0.24)],
	["hunger", Color(0.9, 0.49, 0.13)],
	["thirst", Color(0.2, 0.6, 0.86)],
	["temperature", Color(0.55, 0.82, 0.95)],
	["radiation", Color(0.18, 0.8, 0.44)],
]

var world: Node3D

var _bar_fills: Dictionary = {}   # stat name -> {bar: ProgressBar, value: Label}
var _res_counts: Dictionary = {}  # resource id -> Label
var _toast_label: Label
var _toast_left := 0.0
var _bp_label: Label
var _info_panel: PanelContainer
var _info_tier: Label
var _info_health: Label
var _armour_label: Label
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
var map_ui: Control
var _compass_label: Label
var touch_controls: Control
var settings_ui: Control


func _ready() -> void:
	layer = 1
	# The HUD drives the pause menu, so it must keep running while paused
	process_mode = Node.PROCESS_MODE_ALWAYS
	_build_overlays()
	_build_stats_panel()
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

	map_ui = MapUiScript.new()
	map_ui.name = "MapUi"
	add_child(map_ui)
	_build_compass()

	Game.detect_touch_ui()
	touch_controls = TouchControlsScript.new()
	touch_controls.name = "TouchControls"
	add_child(touch_controls)

	# Built after the pause menu, because it reads it to know where BACK
	# should return to
	settings_ui = SettingsUiScript.new()
	settings_ui.name = "SettingsUi"
	settings_ui.hud = self
	add_child(settings_ui)

	# The engine inherits the editor's locale, so on an Arabic install every
	# container and anchor in the HUD mirrors itself: right-anchored panels
	# jump to the left edge and each row reverses. The interface text is
	# English, so pin the whole tree to left-to-right.
	force_ltr(self)

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
	elif event.is_action_pressed("toggle_touch_ui"):
		# F8 previews the on-screen controls on a desktop
		set_touch_ui(not Game.touch_ui)
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("map"):
		map_ui.toggle()
		get_viewport().set_input_as_handled()


func set_touch_ui(on: bool) -> void:
	Game.touch_ui = on
	touch_controls.set_enabled(on)
	Game.set_ui(Game.ui_open)   # re-apply mouse capture for the new mode
	Game.notify("Touch controls %s" % ("ON" if on else "OFF"), Color(0.2, 0.6, 0.9))


# ==================== BUILDERS ====================

## Recursively pins a UI subtree to left-to-right layout.
static func force_ltr(node: Node) -> void:
	if node is Control:
		(node as Control).layout_direction = Control.LAYOUT_DIRECTION_LTR
	for child in node.get_children():
		force_ltr(child)


func _label(text: String, size: int = 14, color := Color.WHITE) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l


## A heading readout pinned to the top centre. Four hundred metres of
## identical forest is unnavigable without one, and it costs a label.
func _build_compass() -> void:
	var holder := MarginContainer.new()
	holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	holder.add_theme_constant_override("margin_top", int(HUD_MARGIN) - 6)
	holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(holder)

	var panel := PanelContainer.new()
	panel.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	panel.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	style_panel(panel)
	holder.add_child(panel)

	_compass_label = _label("N", 16, Color(0.9, 0.92, 0.95))
	_compass_label.custom_minimum_size = Vector2(64, 0)
	_compass_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	panel.add_child(_compass_label)


## Top-right column: survival stats over the resource readout.
##
## Anchored to the right edge and grown leftwards (GROW_DIRECTION_BEGIN)
## so a long line can never push its own right edge off-screen — which is
## exactly what the old fixed-width, right-anchored label did once the
## resource counts grew past four digits.
func _build_stats_panel() -> void:
	# Laid out by a full-rect MarginContainer with shrink-end size flags
	# rather than anchor offsets plus a grow direction. Containers place
	# their child deterministically, whereas the anchor route depends on
	# grow direction resolving against the layout direction and quietly
	# hung the panel off the right edge of the screen.
	var holder := MarginContainer.new()
	holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	holder.add_theme_constant_override("margin_right", int(HUD_MARGIN))
	holder.add_theme_constant_override("margin_top", int(HUD_MARGIN))
	holder.add_theme_constant_override("margin_left", int(HUD_MARGIN))
	holder.add_theme_constant_override("margin_bottom", int(HUD_MARGIN))
	holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(holder)

	var column := VBoxContainer.new()
	column.size_flags_horizontal = Control.SIZE_SHRINK_END
	column.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	column.add_theme_constant_override("separation", 8)
	column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	holder.add_child(column)

	# --- Survival stats
	var stats_panel := PanelContainer.new()
	stats_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	style_panel(stats_panel)
	var rows := VBoxContainer.new()
	rows.add_theme_constant_override("separation", 5)
	rows.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stats_panel.add_child(rows)
	column.add_child(stats_panel)

	for def in BAR_DEFS:
		var stat_name: String = def[0]
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 8)
		row.mouse_filter = Control.MOUSE_FILTER_IGNORE

		# Fixed name column, wide enough for the longest stat ("Temperature")
		var name_lab := _label(stat_name.capitalize(), 13, Color(0.88, 0.88, 0.88))
		name_lab.custom_minimum_size = Vector2(STAT_NAME_WIDTH, STAT_ROW_HEIGHT)
		name_lab.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		row.add_child(name_lab)

		var bar := ProgressBar.new()
		bar.min_value = 0.0
		bar.max_value = 100.0
		bar.value = 100.0
		bar.show_percentage = false
		bar.custom_minimum_size = Vector2(STAT_BAR_WIDTH, STAT_ROW_HEIGHT)
		bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_style_progress_bar(bar, def[1])
		row.add_child(bar)

		# Numeric readout, right-aligned so the digits stay put as they change
		var value_lab := _label("100", 13, Color.WHITE)
		value_lab.custom_minimum_size = Vector2(STAT_VALUE_WIDTH, STAT_ROW_HEIGHT)
		value_lab.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		value_lab.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		row.add_child(value_lab)

		rows.add_child(row)
		_bar_fills[stat_name] = {"bar": bar, "value": value_lab}

	# What you are wearing, right under the bars it protects. Hidden while
	# you have nothing on, so a bare-handed start stays uncluttered.
	_armour_label = _label("", 13, Color(0.55, 0.85, 0.95))
	_armour_label.visible = false
	rows.add_child(_armour_label)

	# --- Resource readout, one line per resource so nothing is ever clipped
	var res_panel := PanelContainer.new()
	res_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	style_panel(res_panel)
	var res_rows := VBoxContainer.new()
	res_rows.add_theme_constant_override("separation", 3)
	res_rows.mouse_filter = Control.MOUSE_FILTER_IGNORE
	res_panel.add_child(res_rows)
	column.add_child(res_panel)

	for res_id in TRACKED_RESOURCES:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 8)
		row.mouse_filter = Control.MOUSE_FILTER_IGNORE

		var icon := TextureRect.new()
		icon.texture = IconFactory.get_icon(res_id)
		# EXPAND_IGNORE_SIZE or the 256px source art becomes this control's
		# minimum size and blows the whole panel open.
		icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon.custom_minimum_size = Vector2(20, 20)
		icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
		row.add_child(icon)

		var name_lab := _label(Game.ITEMS[res_id].name, 13, Color(0.85, 0.85, 0.85))
		name_lab.custom_minimum_size = Vector2(RES_NAME_WIDTH, 18)
		name_lab.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		row.add_child(name_lab)

		var count_lab := _label("0", 13, Color.WHITE)
		count_lab.custom_minimum_size = Vector2(RES_COUNT_WIDTH, 18)
		count_lab.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		count_lab.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		row.add_child(count_lab)

		res_rows.add_child(row)
		_res_counts[res_id] = count_lab


## Edge-anchoring helpers.
##
## Every one of these pins a control to a screen edge with a zero-size
## anchor and lets it grow *away* from that edge. Godot forces a control's
## size up to its content's minimum size, so the older pattern of "anchor
## to an edge, then set a fixed size" silently pushed long strings past
## the screen edge once the content outgrew the guessed width.

func _anchor_top_center(c: Control, y: float) -> void:
	c.anchor_left = 0.5
	c.anchor_right = 0.5
	c.anchor_top = 0.0
	c.anchor_bottom = 0.0
	c.offset_left = 0.0
	c.offset_right = 0.0
	c.offset_top = y
	c.offset_bottom = y
	c.grow_horizontal = Control.GROW_DIRECTION_BOTH
	c.grow_vertical = Control.GROW_DIRECTION_END


func _anchor_bottom_center(c: Control, up: float) -> void:
	c.anchor_left = 0.5
	c.anchor_right = 0.5
	c.anchor_top = 1.0
	c.anchor_bottom = 1.0
	c.offset_left = 0.0
	c.offset_right = 0.0
	c.offset_top = -up
	c.offset_bottom = -up
	c.grow_horizontal = Control.GROW_DIRECTION_BOTH
	c.grow_vertical = Control.GROW_DIRECTION_BEGIN


func _anchor_bottom_right(c: Control, up: float) -> void:
	c.anchor_left = 1.0
	c.anchor_right = 1.0
	c.anchor_top = 1.0
	c.anchor_bottom = 1.0
	c.offset_left = -HUD_MARGIN
	c.offset_right = -HUD_MARGIN
	c.offset_top = -up
	c.offset_bottom = -up
	c.grow_horizontal = Control.GROW_DIRECTION_BEGIN
	c.grow_vertical = Control.GROW_DIRECTION_BEGIN


func _anchor_center_right(c: Control) -> void:
	c.anchor_left = 1.0
	c.anchor_right = 1.0
	c.anchor_top = 0.5
	c.anchor_bottom = 0.5
	c.offset_left = -HUD_MARGIN
	c.offset_right = -HUD_MARGIN
	c.offset_top = 0.0
	c.offset_bottom = 0.0
	c.grow_horizontal = Control.GROW_DIRECTION_BEGIN
	c.grow_vertical = Control.GROW_DIRECTION_BOTH


func _style_progress_bar(bar: ProgressBar, color: Color) -> void:
	var bg := StyleBoxFlat.new()
	bg.bg_color = Color(0, 0, 0, 0.55)
	bg.set_corner_radius_all(3)
	bar.add_theme_stylebox_override("background", bg)
	var fg := StyleBoxFlat.new()
	fg.bg_color = color
	fg.set_corner_radius_all(3)
	bar.add_theme_stylebox_override("fill", fg)


func _build_crosshair() -> void:
	var c := ColorRect.new()
	c.color = Color(1, 1, 1, 0.8)
	c.anchor_left = 0.5
	c.anchor_right = 0.5
	c.anchor_top = 0.5
	c.anchor_bottom = 0.5
	c.offset_left = 0.0
	c.offset_right = 0.0
	c.offset_top = 0.0
	c.offset_bottom = 0.0
	c.grow_horizontal = Control.GROW_DIRECTION_BOTH
	c.grow_vertical = Control.GROW_DIRECTION_BOTH
	c.custom_minimum_size = Vector2(4, 4)
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

	for i in Game.BELT_SLOTS:
		var slot := PanelContainer.new()
		slot.custom_minimum_size = HOTBAR_SLOT_SIZE
		slot.mouse_filter = Control.MOUSE_FILTER_IGNORE

		# The slot number sits in the corner rather than on its own row, so
		# the icon gets almost the whole 64px tile.
		var stack := Control.new()
		stack.mouse_filter = Control.MOUSE_FILTER_IGNORE

		var icon := TextureRect.new()
		icon.set_anchors_preset(Control.PRESET_FULL_RECT)
		icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon.custom_minimum_size = HOTBAR_ICON_SIZE
		icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
		stack.add_child(icon)

		# These sit in a plain Control, not a container, so their width is
		# pinned explicitly rather than left to a deferred re-layout when
		# the text changes.
		var num := _label(str(i + 1), 10, Color(1, 1, 1, 0.55))
		num.set_anchors_preset(Control.PRESET_TOP_LEFT)
		num.custom_minimum_size = Vector2(14, 12)
		num.mouse_filter = Control.MOUSE_FILTER_IGNORE
		stack.add_child(num)

		var count_lab := _label("", 10, Color(1, 1, 1, 0.9))
		count_lab.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
		count_lab.grow_horizontal = Control.GROW_DIRECTION_BEGIN
		count_lab.grow_vertical = Control.GROW_DIRECTION_BEGIN
		count_lab.custom_minimum_size = Vector2(30, 12)
		count_lab.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		count_lab.mouse_filter = Control.MOUSE_FILTER_IGNORE
		stack.add_child(count_lab)

		# Condition bar along the bottom of the tile. Only ever shown for
		# things that wear out, so the hotbar stays quiet for materials.
		var wear := ProgressBar.new()
		wear.show_percentage = false
		wear.min_value = 0.0
		wear.max_value = 1.0
		wear.custom_minimum_size = Vector2(0, 4)
		wear.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
		wear.grow_vertical = Control.GROW_DIRECTION_BEGIN
		wear.mouse_filter = Control.MOUSE_FILTER_IGNORE
		wear.visible = false
		_style_progress_bar(wear, Color(0.45, 0.8, 0.45))
		stack.add_child(wear)

		slot.add_child(stack)
		bar.add_child(slot)
		_hotbar_slots.append({"panel": slot, "icon": icon, "name": count_lab, "wear": wear})


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
			slot.panel.tooltip_text = Game.ITEMS[id].name
			var count := Game.get_count(id)
			slot.name.text = str(count) if count > 1 else ""
			# Condition, and the colour it is going: green while it has life
			# in it, amber once it is past the point where it still works
			# properly, red when the next few swings are the last ones.
			var wears: bool = Game.has_durability(id) and count > 0
			slot.wear.visible = wears
			if wears:
				var frac := Game.durability_fraction(id)
				slot.wear.value = frac
				slot.panel.tooltip_text = "%s — %d/%d" % [Game.ITEMS[id].name,
					Game.durability(id), Game.max_durability(id)]
				var col := Color(0.45, 0.8, 0.45)
				if frac < 0.12:
					col = Color(0.9, 0.3, 0.3)
				elif frac < Game.WORN_THRESHOLD:
					col = Color(0.95, 0.7, 0.3)
				_style_progress_bar(slot.wear, col)
		else:
			slot.icon.texture = null
			slot.panel.tooltip_text = ""
			slot.name.text = ""
			slot.wear.visible = false


func _build_toast() -> void:
	_toast_label = _label("", 16)
	_anchor_top_center(_toast_label, 90.0)
	_toast_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_toast_label.visible = false
	add_child(_toast_label)


func _build_blueprint_indicator() -> void:
	_bp_label = _label("", 15, Color(1, 0.84, 0))
	_anchor_top_center(_bp_label, 56.0)
	_bp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(_bp_label)


func _build_info_panel() -> void:
	_info_panel = PanelContainer.new()
	_anchor_center_right(_info_panel)
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
	_anchor_bottom_center(_hint_label, 118.0)
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
	_anchor_bottom_right(_priv_label, 120.0)
	_priv_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_priv_label.visible = false
	add_child(_priv_label)

	_bench_label = _label("", 13, Color(1.0, 0.72, 0.3))
	_anchor_bottom_right(_bench_label, 142.0)
	_bench_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_bench_label.visible = false
	add_child(_bench_label)

	_cold_label = _label("FREEZING — find a fire", 16, Color(0.6, 0.85, 1.0))
	_anchor_top_center(_cold_label, 118.0)
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
	var controls := Button.new()
	controls.text = "CONTROLS & CAMERA"
	controls.custom_minimum_size = Vector2(220, 44)
	controls.pressed.connect(func(): settings_ui.open())
	v.add_child(controls)
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
		"W A S D  Move   |   SHIFT  Sprint   |   SPACE  Jump   |   V  Camera (1st/3rd)\n" +
		"LMB  Action   |   RMB / Q  Build Menu   |   E  Inventory   |   F  Drink\n" +
		"R  Rotate   |   G  Cancel Build   |   H  Upgrade / Repair   |   M  Map\n" +
		"1-6  Hotbar   |   ESC  Pause   |   F8  Touch Controls",
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
		"settings":
			settings_ui.close()
		"blueprint":
			close_blueprint_menu()
		"map":
			map_ui.close()
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
	for res_id in _res_counts:
		_res_counts[res_id].text = str(Game.get_count(res_id))


func update_build_info(s: Node3D, soft_side: bool = false) -> void:
	if s == null:
		_info_panel.visible = false
		return
	_info_tier.text = "%s (%d%% stability)" % [
		Game.BUILDING_TIERS[s.tier].name, roundi(s.stability)]
	# Which face you are on decides what a hit is worth, so it has to be
	# readable before you swing rather than after.
	if soft_side:
		_info_health.text = "HP: %d / %d   ·   SOFT SIDE x%.0f" % [
			roundi(s.health), roundi(s.max_health), Game.SOFT_SIDE_MULT]
		_info_health.add_theme_color_override("font_color", Color(0.95, 0.5, 0.35))
	else:
		_info_health.text = "HP: %d / %d" % [roundi(s.health), roundi(s.max_health)]
		_info_health.add_theme_color_override("font_color", Color.WHITE)
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
	elif s.is_locked():
		_info_status.text = "%s fitted" % Game.LOCKS[s.lock_type].name
		_info_status.add_theme_color_override("font_color", Color(0.4, 0.85, 0.4))
	elif s.is_door:
		_info_status.text = "No lock — anything hostile can walk in"
		_info_status.add_theme_color_override("font_color", Color(0.95, 0.75, 0.35))
	else:
		_info_status.text = ""
	_info_panel.visible = true


func _process(delta: float) -> void:
	# Stat bars and their numeric readouts
	for key in _bar_fills:
		var v: float = clampf(float(Game.stats[key]), 0.0, 100.0)
		var entry: Dictionary = _bar_fills[key]
		entry.bar.value = v
		entry.value.text = str(roundi(v))

	# Compass
	if world != null and world.player != null:
		_compass_label.text = MapUiScript.heading_of(world.player.rotation.y)

	# Worn protection
	var protect := Game.armour_protection()
	var rads := Game.radiation_protection()
	_armour_label.visible = protect > 0.0 or rads > 0.0
	if _armour_label.visible:
		var parts := ["Armour %d%%" % roundi(protect * 100.0)]
		if rads > 0.0:
			parts.append("rads -%d%%" % roundi(rads * 100.0))
		_armour_label.text = "  ".join(parts)

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

	# Freezing warning, raised well before the damage threshold so there is
	# time to actually go and light a fire
	var cold := float(Game.stats.temperature) < 40.0
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

	# Contextual hint. What the interact button would do comes first: it is
	# about a thing in front of you right now, which beats any advice about
	# what you are holding.
	var hint := ""
	if world != null and world.player != null and Game.ui_open == "":
		var tool: String = Game.active_tool()
		var reach: String = ""
		if world.interaction != null:
			reach = world.interaction.prompt()
		if reach != "":
			hint = reach
		elif world.player.in_water:
			hint = "Press F to drink"
		elif Game.CONSUMABLES.has(tool) and Game.get_count(tool) > 0:
			hint = "Click to consume %s" % Game.ITEMS[tool].name
		elif Game.DEVICES.has(tool) and Game.get_count(tool) > 0:
			hint = "Click on the ground to place the %s" % Game.ITEMS[tool].name
		elif tool == "wire_tool":
			hint = ("Aim at the other device and press C"
				if world.player.wiring_from != null
				else "Aim at a device and press C to start a wire")
		elif tool == "repair_tool" and Game.get_count(tool) > 0:
			hint = "Click a wall to repair it, or click at a workbench to service your gear"
		elif tool == "binoculars" and Game.get_count(tool) > 0:
			hint = "Click to put them down" if world.player.glassing else "Click to glass the treeline"
		elif tool == "hammer" or tool == "jackhammer":
			hint = "H to repair or upgrade   ·   X to demolish"
		elif Game.DEPLOYABLES.has(tool) and Game.get_count(tool) > 0:
			hint = "Click on the ground to place the %s" % Game.ITEMS[tool].name
	_hint_label.text = hint
	_hint_label.visible = hint != ""
