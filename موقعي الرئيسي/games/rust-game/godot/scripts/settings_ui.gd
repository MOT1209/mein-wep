extends Control
## The settings screen: every control and camera tunable, plus the touch
## layout.
##
## The rows are generated from `Game.SETTINGS_RANGE` and `SETTINGS_DEFAULTS`
## rather than listed here, so a new setting appears on this screen the moment
## it exists and a slider can never be built with a range the clamp disagrees
## with. Labels and help text are the only per-setting knowledge in this file.

## Order the rows appear in, grouped under headings. Anything in the settings
## table but missing from here still gets a row, appended under "Other" — so
## forgetting to list a new setting makes it ugly rather than invisible.
const GROUPS := [
	{"title": "CAMERA", "keys": [
		"look_sensitivity", "camera_damping", "camera_acceleration",
		"invert_look_y", "fov", "shake_intensity"]},
	{"title": "GYROSCOPE", "keys": [
		"gyro_enabled", "gyro_only", "gyro_sensitivity", "gyro_dead_zone"]},
	{"title": "TOUCH CONTROLS", "keys": [
		"button_scale", "tap_tolerance", "left_handed", "haptics",
		"haptic_strength", "button_tooltips"]},
	{"title": "ACCESSIBILITY", "keys": ["toggle_stance"]},
]

## What each row is called, and the one line of help under it. Kept apart from
## the ranges so wording can change without touching behaviour.
const LABELS := {
	"look_sensitivity": ["Look sensitivity", "How far the view turns per centimetre of drag."],
	"camera_damping": ["Camera smoothing", "Low is heavy and smooth. High is immediate."],
	"camera_acceleration": ["Camera acceleration", "Eases the view in and out of motion."],
	"invert_look_y": ["Invert vertical look", "Drag down to look up."],
	"fov": ["Field of view", "Wider sees more; narrower reads distance better."],
	"shake_intensity": ["Screen shake", "Set to zero to turn impacts and blasts still."],
	"gyro_enabled": ["Use gyroscope", "Tilt the device to aim. Off unless you want it."],
	"gyro_only": ["Gyroscope only", "Stops the camera zone reading drags at all."],
	"gyro_sensitivity": ["Gyro sensitivity", "How much view rotation per degree of tilt."],
	"gyro_dead_zone": ["Gyro dead zone", "Ignores tilt smaller than this, against drift."],
	"button_scale": ["Button size", "Scales every on-screen button at once."],
	"tap_tolerance": ["Tap tolerance", "How long a touch may last and still be a tap."],
	"left_handed": ["Left-handed layout", "Swaps the movement stick and the camera zone."],
	"haptics": ["Vibration", "Buzz on presses, hits and landings."],
	"haptic_strength": ["Vibration strength", "How hard, when vibration is on."],
	"button_tooltips": ["Name buttons on hold", "A teaching aid. Off during normal play."],
	"toggle_stance": ["Tap to crouch", "Stance keys toggle instead of needing to be held."],
}

const ROW_WIDTH := 460.0
const PANEL_MIN := Vector2(720, 540)

var hud: CanvasLayer
var player: CharacterBody3D

## Live controls, keyed by setting, so an external change can refresh them.
var _rows: Dictionary = {}
var _scroll: ScrollContainer


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	visible = false
	_build()
	Game.settings_changed.connect(_refresh)


func _build() -> void:
	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0.78)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(dim)

	var centre := CenterContainer.new()
	centre.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(centre)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = PANEL_MIN
	if hud != null and hud.has_method("style_panel"):
		hud.style_panel(panel)
	centre.add_child(panel)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 10)
	panel.add_child(column)

	var title := Label.new()
	title.text = "CONTROLS & CAMERA"
	title.add_theme_font_size_override("font_size", 22)
	title.add_theme_color_override("font_color", Color(1, 0.84, 0))
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	column.add_child(title)

	_scroll = ScrollContainer.new()
	_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_scroll.custom_minimum_size = Vector2(ROW_WIDTH + 200.0, 380.0)
	column.add_child(_scroll)

	var rows := VBoxContainer.new()
	rows.add_theme_constant_override("separation", 8)
	rows.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_scroll.add_child(rows)

	var placed := {}
	for group in GROUPS:
		_add_heading(rows, str(group.title))
		for key in group.keys:
			if Game.SETTINGS_DEFAULTS.has(key):
				_add_row(rows, str(key))
				placed[str(key)] = true
		if str(group.title) == "GYROSCOPE":
			_add_action(rows, "RECALIBRATE GYRO",
				"Hold the device still and press. Corrects sensor drift.",
				func():
					if player != null:
						player.recalibrate_gyro()
					Game.notify("Gyroscope recalibrated", Color(0.7, 0.85, 1.0)))
		if str(group.title) == "TOUCH CONTROLS":
			_add_action(rows, "RESET BUTTON LAYOUT",
				"Puts every moved or resized button back where it started.",
				func():
					Game.reset_touch_layout()
					Game.notify("Button layout reset", Color(0.8, 0.85, 0.9)))

	# Anything the groups forgot still gets a row rather than vanishing
	var missed := []
	for key in Game.SETTINGS_DEFAULTS:
		if not placed.has(str(key)):
			missed.append(str(key))
	if not missed.is_empty():
		_add_heading(rows, "OTHER")
		for key in missed:
			_add_row(rows, key)

	var buttons := HBoxContainer.new()
	buttons.add_theme_constant_override("separation", 10)
	buttons.alignment = BoxContainer.ALIGNMENT_CENTER
	column.add_child(buttons)

	var reset := Button.new()
	reset.text = "RESET ALL"
	reset.custom_minimum_size = Vector2(200, 42)
	reset.pressed.connect(func():
		Game.reset_settings()
		Game.reset_touch_layout()
		Game.notify("Settings reset to defaults", Color(0.8, 0.85, 0.9)))
	buttons.add_child(reset)

	var back := Button.new()
	back.text = "BACK"
	back.custom_minimum_size = Vector2(200, 42)
	back.pressed.connect(close)
	buttons.add_child(back)


func _add_heading(parent: VBoxContainer, text: String) -> void:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", 15)
	l.add_theme_color_override("font_color", Color(0.95, 0.6, 0.25))
	parent.add_child(l)


func _add_action(parent: VBoxContainer, text: String, help: String,
		on_press: Callable) -> void:
	var row := VBoxContainer.new()
	row.add_theme_constant_override("separation", 2)
	var b := Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(ROW_WIDTH, 38)
	b.pressed.connect(on_press)
	row.add_child(b)
	row.add_child(_help_label(help))
	parent.add_child(row)


func _help_label(text: String) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", 11)
	l.add_theme_color_override("font_color", Color(0.62, 0.66, 0.72))
	return l


## One row per setting: a slider for anything with a range, a checkbox for
## everything else. Which it is comes from the settings tables, never from a
## list kept here.
func _add_row(parent: VBoxContainer, key: String) -> void:
	var info: Array = LABELS.get(key, [key.capitalize(), ""])
	var block := VBoxContainer.new()
	block.add_theme_constant_override("separation", 2)

	if Game.SETTINGS_RANGE.has(key):
		var span: Array = Game.SETTINGS_RANGE[key]
		var line := HBoxContainer.new()
		line.add_theme_constant_override("separation", 10)

		var name_label := Label.new()
		name_label.text = str(info[0])
		name_label.custom_minimum_size = Vector2(190, 0)
		name_label.add_theme_font_size_override("font_size", 13)
		line.add_child(name_label)

		var slider := HSlider.new()
		slider.min_value = float(span[0])
		slider.max_value = float(span[1])
		slider.step = _step_for(key, float(span[0]), float(span[1]))
		slider.value = float(Game.setting(key))
		slider.custom_minimum_size = Vector2(ROW_WIDTH - 260.0, 22)
		slider.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		line.add_child(slider)

		var value_label := Label.new()
		value_label.custom_minimum_size = Vector2(58, 0)
		value_label.add_theme_font_size_override("font_size", 13)
		value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		value_label.text = _format(key, float(Game.setting(key)))
		line.add_child(value_label)

		slider.value_changed.connect(func(v: float):
			Game.set_setting(key, v)
			value_label.text = _format(key, v))
		_rows[key] = {"slider": slider, "value": value_label}
		block.add_child(line)
	else:
		var check := CheckBox.new()
		check.text = str(info[0])
		check.button_pressed = bool(Game.setting(key))
		check.toggled.connect(func(on: bool): Game.set_setting(key, on))
		_rows[key] = {"check": check}
		block.add_child(check)

	if str(info[1]) != "":
		block.add_child(_help_label(str(info[1])))
	parent.add_child(block)


## A step fine enough to feel continuous but coarse enough that the readout
## does not jitter: a hundred notches across whatever the range is.
func _step_for(key: String, low: float, high: float) -> float:
	if key == "fov":
		return 1.0
	return maxf(0.001, snappedf((high - low) / 100.0, 0.001))


## Degrees for the field of view, milliseconds for the tap window, a
## multiplier for the rest — whichever unit the player actually thinks in.
func _format(key: String, value: float) -> String:
	match key:
		"fov":
			return "%d°" % roundi(value)
		"tap_tolerance":
			return "%dms" % roundi(value * 1000.0)
		"look_sensitivity", "gyro_sensitivity", "button_scale":
			return "%.2fx" % value
	return "%.2f" % value


## Pulls every control back in line with the settings, for when something else
## changed them — a reset, or a loaded save.
func _refresh() -> void:
	for key in _rows:
		var row: Dictionary = _rows[key]
		if row.has("slider"):
			var slider: HSlider = row.slider
			var want := float(Game.setting(key))
			if not is_equal_approx(slider.value, want):
				# set_value_no_signal, or refreshing would write back the
				# value it just read and fight whatever set it.
				slider.set_value_no_signal(want)
			row.value.text = _format(str(key), want)
		elif row.has("check"):
			var check: CheckBox = row.check
			check.set_pressed_no_signal(bool(Game.setting(key)))


func open() -> void:
	_refresh()
	visible = true
	Game.set_ui("settings")


func close() -> void:
	visible = false
	Game.set_ui("pause" if hud != null and hud._pause_menu.visible else "")
