extends Control
## On-screen controls for touchscreens: a virtual joystick on the left, an
## action pad on the right, and drag-to-look everywhere else.
##
## Nothing here talks to the player directly. The joystick and buttons feed
## the same input actions the keyboard and mouse use (`Input.action_press`
## with a strength), so the player controller stays unaware that touch
## exists — one movement code path for every device.
##
## Multi-touch is tracked per finger index so you can steer, look and press
## a button at the same time.

const STICK_RADIUS := 92.0
const KNOB_RADIUS := 38.0
const STICK_MARGIN := Vector2(120.0, 130.0)
const DEAD_ZONE := 0.18
const LOOK_SENSITIVITY := 0.0032

## Right-hand pad: action name, caption, and grid slot (column, row).
const PAD_BUTTONS := [
	{"action": "attack", "label": "HIT", "col": 1, "row": 1, "big": true},
	{"action": "jump", "label": "JUMP", "col": 0, "row": 1, "big": false},
	{"action": "interact", "label": "USE", "col": 1, "row": 0, "big": false},
	{"action": "inventory", "label": "BAG", "col": 0, "row": 0, "big": false},
]

const BTN_SIZE := 76.0
const BTN_BIG_SIZE := 104.0
const BTN_GAP := 16.0
const PAD_MARGIN := Vector2(150.0, 140.0)

var player: CharacterBody3D

var _stick_centre := Vector2.ZERO
var _stick_vector := Vector2.ZERO
var _stick_finger := -1
var _look_finger := -1
var _look_last := Vector2.ZERO
var _pressed_actions: Dictionary = {}   # finger index -> action name
var _button_rects: Array = []           # [{rect, action, label, size}]


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	visible = Game.touch_ui
	set_process_input(true)
	get_viewport().size_changed.connect(_layout)
	_layout()


func _layout() -> void:
	var vp := get_viewport_rect().size
	_stick_centre = Vector2(STICK_MARGIN.x, vp.y - STICK_MARGIN.y)

	_button_rects.clear()
	for spec in PAD_BUTTONS:
		var diameter: float = BTN_BIG_SIZE if spec.big else BTN_SIZE
		# Grid grows up and left from the bottom-right corner
		var cx: float = vp.x - PAD_MARGIN.x + float(spec.col) * (BTN_SIZE + BTN_GAP)
		var cy: float = vp.y - PAD_MARGIN.y - float(spec.row) * (BTN_SIZE + BTN_GAP)
		_button_rects.append({
			"rect": Rect2(Vector2(cx, cy) - Vector2(diameter, diameter) * 0.5,
				Vector2(diameter, diameter)),
			"action": spec.action,
			"label": spec.label,
			"size": diameter,
		})
	queue_redraw()


func set_enabled(on: bool) -> void:
	visible = on
	if not on:
		_release_all()
	queue_redraw()


# ==================== INPUT ====================

func _input(event: InputEvent) -> void:
	if not visible:
		return

	if event is InputEventScreenTouch:
		if event.pressed:
			_on_press(event.index, event.position)
		else:
			_on_release(event.index)
		get_viewport().set_input_as_handled()
	elif event is InputEventScreenDrag:
		_on_drag(event.index, event.position, event.relative)
		get_viewport().set_input_as_handled()


func _on_press(index: int, pos: Vector2) -> void:
	# A menu is open: let the normal UI handle the touch
	if Game.ui_open != "":
		return

	for entry in _button_rects:
		if entry.rect.has_point(pos):
			Input.action_press(entry.action)
			_pressed_actions[index] = entry.action
			queue_redraw()
			return

	if _stick_finger == -1 and pos.distance_to(_stick_centre) <= STICK_RADIUS * 1.6:
		_stick_finger = index
		_update_stick(pos)
		return

	if _look_finger == -1:
		_look_finger = index
		_look_last = pos


func _on_drag(index: int, pos: Vector2, relative: Vector2) -> void:
	if index == _stick_finger:
		_update_stick(pos)
	elif index == _look_finger and player != null:
		player.apply_look(relative / LOOK_SENSITIVITY * 0.001)
		_look_last = pos


func _on_release(index: int) -> void:
	if _pressed_actions.has(index):
		Input.action_release(_pressed_actions[index])
		_pressed_actions.erase(index)
		queue_redraw()
	if index == _stick_finger:
		_stick_finger = -1
		_stick_vector = Vector2.ZERO
		_apply_move_actions()
		queue_redraw()
	if index == _look_finger:
		_look_finger = -1


func _release_all() -> void:
	for index in _pressed_actions:
		Input.action_release(_pressed_actions[index])
	_pressed_actions.clear()
	_stick_finger = -1
	_look_finger = -1
	_stick_vector = Vector2.ZERO
	_apply_move_actions()


func _update_stick(pos: Vector2) -> void:
	var offset := pos - _stick_centre
	if offset.length() > STICK_RADIUS:
		offset = offset.normalized() * STICK_RADIUS
	_stick_vector = offset / STICK_RADIUS
	_apply_move_actions()
	queue_redraw()


## Feeds the analog stick into the same actions the keyboard drives, so
## partial deflection gives partial speed.
func _apply_move_actions() -> void:
	var v := _stick_vector
	if v.length() < DEAD_ZONE:
		v = Vector2.ZERO
	_set_axis("move_right", "move_left", v.x)
	_set_axis("move_back", "move_forward", v.y)


func _set_axis(positive: String, negative: String, value: float) -> void:
	if value > 0.0:
		Input.action_release(negative)
		Input.action_press(positive, absf(value))
	elif value < 0.0:
		Input.action_release(positive)
		Input.action_press(negative, absf(value))
	else:
		Input.action_release(positive)
		Input.action_release(negative)


# ==================== DRAWING ====================

func _draw() -> void:
	if not visible:
		return

	# Joystick: outer ring, then the knob at its current deflection
	draw_circle(_stick_centre, STICK_RADIUS, Color(0, 0, 0, 0.28))
	draw_arc(_stick_centre, STICK_RADIUS, 0.0, TAU, 48, Color(1, 1, 1, 0.28), 3.0, true)
	var knob := _stick_centre + _stick_vector * STICK_RADIUS
	draw_circle(knob, KNOB_RADIUS, Color(0.85, 0.42, 0.18, 0.55))
	draw_arc(knob, KNOB_RADIUS, 0.0, TAU, 32, Color(1, 1, 1, 0.65), 2.0, true)

	var font := ThemeDB.fallback_font
	var font_size := 15
	for entry in _button_rects:
		var centre: Vector2 = entry.rect.get_center()
		var radius: float = entry.size * 0.5
		var held: bool = entry.action in _pressed_actions.values()
		draw_circle(centre, radius, Color(0, 0, 0, 0.42) if not held else Color(0.85, 0.42, 0.18, 0.5))
		draw_arc(centre, radius, 0.0, TAU, 40, Color(1, 1, 1, 0.35), 2.0, true)
		var text: String = entry.label
		var width := font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size).x
		draw_string(font, centre + Vector2(-width * 0.5, font_size * 0.4), text,
			HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, Color(1, 1, 1, 0.9))
