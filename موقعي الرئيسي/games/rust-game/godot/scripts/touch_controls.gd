extends Control
## On-screen controls for touchscreens.
##
## The screen is divided into zones rather than covered in buttons: a movement
## stick under the left thumb, a camera drag area under the right, clusters of
## buttons around each thumb, and one interact button at the bottom middle.
## Which buttons exist at any moment is decided by what the player is holding
## and doing, because eighteen permanent buttons on a phone is a wall, not an
## interface.
##
## Nothing here reaches into the player's movement. The stick feeds the same
## input actions the keyboard drives (`Input.action_press` with a strength) so
## there is one movement code path for every device; the buttons either drive
## an action the same way or call a named method on the player.
##
## Multi-touch is tracked per finger, so steering, looking and pressing are
## all possible at once — and each finger is classified into a tap, a hold, a
## double tap or a swipe by the recogniser below.

## Movement stick
const STICK_RADIUS := 92.0
const KNOB_RADIUS := 38.0
const STICK_MARGIN := Vector2(120.0, 130.0)
const DEAD_ZONE := 0.18

## Look. The divisor turns a pixel drag into the same units a mouse delta
## arrives in, so the player's sensitivity setting means the same thing on a
## phone as it does on a desk.
const LOOK_DIVISOR := 3.2

## Buttons are never smaller than this across, whatever the scale setting says
## — below about this a thumb cannot reliably find them.
const MIN_BUTTON := 50.0
const BTN_SIZE := 74.0
const BTN_BIG_SIZE := 104.0
const BTN_GAP := 14.0

## A press must move less than this to still count as a tap rather than a drag.
const TAP_SLOP := 22.0
## How long a finger must stay down to become a hold.
const HOLD_TIME := 0.35
## Two taps inside this window and this distance are a double tap.
const DOUBLE_TAP_TIME := 0.28
const DOUBLE_TAP_SLOP := 90.0
## A vertical drag on a button past this many pixels is a swipe.
const SWIPE_THRESHOLD := 38.0

## Where the camera zone starts, as a fraction of screen width. The left of
## that belongs to the stick and the movement cluster.
const CAMERA_ZONE_START := 0.42

## The whole button set, in declaration order.
##
## `cluster` places it: "combat" grows up-left from the bottom-right corner,
## "move" grows up-right from above the stick, "centre" is the bottom middle,
## "corner" is the top right. `col`/`row` are slots within the cluster.
##
## A button reacts to any of `press`, `tap`, `hold`, `double` and `swipe`.
## `press` holds an input action down for as long as the finger is down — the
## only correct way to drive automatic fire or a lean. The rest call a method
## on the player once. `when` names a context test below; absent means always.
const BUTTONS := [
	# --- Combat, right thumb
	{"id": "fire", "label": "FIRE", "cluster": "combat", "col": 0, "row": 0,
		"size": "big", "press": "attack"},
	{"id": "aim", "label": "ADS", "cluster": "combat", "col": 1, "row": 0,
		"tap": "toggle_aiming", "when": "has_weapon"},
	{"id": "reload", "label": "RELOAD", "cluster": "combat", "col": 1, "row": 1,
		"tap": "start_reload", "when": "has_gun"},
	{"id": "fire_mode", "label": "MODE", "cluster": "combat", "col": 2, "row": 1,
		"tap": "cycle_fire_mode_held", "when": "has_modes"},
	{"id": "scope", "label": "ZOOM", "cluster": "combat", "col": 2, "row": 0,
		"tap": "cycle_scope_held", "swipe": "cycle_scope_held", "when": "has_scope"},
	{"id": "melee", "label": "BASH", "cluster": "combat", "col": 0, "row": 1,
		"tap": "melee_strike", "hold": "melee_strike"},
	{"id": "breath", "label": "HOLD", "cluster": "combat", "col": 2, "row": 2,
		"press_call": "set_holding_breath", "when": "is_aiming"},
	{"id": "grenade", "label": "NADE", "cluster": "combat", "col": 1, "row": 2,
		"tap": "throw_held_grenade", "when": "has_grenade"},
	{"id": "inspect", "label": "INFO", "cluster": "combat", "col": 0, "row": 2,
		"hold": "inspect_held"},

	# --- Movement, left thumb
	{"id": "jump", "label": "JUMP", "cluster": "move", "col": 0, "row": 0,
		"size": "big", "tap": "try_jump"},
	{"id": "crouch", "label": "CROUCH", "cluster": "move", "col": 1, "row": 0,
		"tap": "touch_crouch", "when": "on_land"},
	{"id": "prone", "label": "PRONE", "cluster": "move", "col": 1, "row": 1,
		"tap": "touch_prone", "when": "on_land"},
	{"id": "dive", "label": "DIVE", "cluster": "move", "col": 1, "row": 0,
		"tap": "try_dive", "when": "swimming"},
	{"id": "lean_left", "label": "<", "cluster": "move", "col": 0, "row": 1,
		"press_lean": -1.0, "when": "is_aiming"},
	{"id": "lean_right", "label": ">", "cluster": "move", "col": 0, "row": 2,
		"press_lean": 1.0, "when": "is_aiming"},

	# --- Context and mode
	{"id": "interact", "label": "USE", "cluster": "centre", "col": 0, "row": 0,
		"size": "big", "tap": "touch_interact", "hold": "touch_interact_hold",
		"double": "touch_interact_fast"},
	{"id": "inventory", "label": "BAG", "cluster": "corner", "col": 0, "row": 0,
		"tap": "touch_inventory"},
	{"id": "build", "label": "BUILD", "cluster": "corner", "col": 1, "row": 0,
		"tap": "touch_build_mode"},
]

var player: CharacterBody3D

var _stick_centre := Vector2.ZERO
var _stick_vector := Vector2.ZERO
var _stick_finger := -1
## finger index -> touch record
var _touches: Dictionary = {}
## Buttons currently laid out: [{rect, spec, size}]
var _button_rects: Array = []
## Actions this layer is holding down, so they can all be released at once.
var _held_actions: Dictionary = {}
var _last_tap_at := -99.0
var _last_tap_pos := Vector2.ZERO
## Button whose name is being shown, and for how much longer.
var _tooltip := ""
var _tooltip_left := 0.0


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	visible = Game.touch_ui
	set_process_input(true)
	set_process(true)
	get_viewport().size_changed.connect(_layout)
	Game.settings_changed.connect(_layout)
	Game.belt_changed.connect(_layout)
	Game.inventory_changed.connect(_layout)
	_layout()


# ==================== LAYOUT ====================

## Is this button worth showing right now? Context is what keeps the screen
## from being a wall of controls the player has to read round.
func _context_ok(spec: Dictionary) -> bool:
	var need := str(spec.get("when", ""))
	if need == "":
		return true
	if player == null:
		return false
	var held := Game.active_tool()
	match need:
		"has_weapon":
			return Game.WEAPONS.has(held)
		"has_gun":
			return Game.is_ranged(held)
		"has_modes":
			return Game.is_ranged(held) and Game.fire_mode_list(held).size() > 1
		"has_scope":
			return Game.scope_list(held).size() > 1
		"is_aiming":
			return player.aiming
		"has_grenade":
			for id in Game.EXPLOSIVES:
				if str(Game.EXPLOSIVES[id].mode) == "throw" and Game.get_count(id) > 0:
					return true
			return false
		"swimming":
			return player.stance == Game.STANCE_SWIM
		"on_land":
			return player.stance != Game.STANCE_SWIM
	return true


## Which way round the screen is. Mirroring swaps the stick and the camera
## zone rather than only moving buttons, so a left-handed layout is actually
## left-handed.
func _mirrored() -> bool:
	return bool(Game.setting("left_handed"))


func camera_zone_start() -> float:
	var vp := get_viewport_rect().size
	return 0.0 if _mirrored() else vp.x * CAMERA_ZONE_START


func camera_zone_end() -> float:
	var vp := get_viewport_rect().size
	return vp.x * (1.0 - CAMERA_ZONE_START) if _mirrored() else vp.x


## True when a point belongs to the camera drag area — right of the divide (or
## left of it when mirrored) and not on top of a button.
func in_camera_zone(pos: Vector2) -> bool:
	if pos.x < camera_zone_start() or pos.x > camera_zone_end():
		return false
	for entry in _button_rects:
		if entry.rect.has_point(pos):
			return false
	return true


func _layout() -> void:
	var vp := get_viewport_rect().size
	var stick_x: float = vp.x - STICK_MARGIN.x if _mirrored() else STICK_MARGIN.x
	_stick_centre = Vector2(stick_x, vp.y - STICK_MARGIN.y)

	var scale: float = float(Game.setting("button_scale"))
	_button_rects.clear()
	for spec in BUTTONS:
		if not _context_ok(spec):
			continue
		var over := Game.button_override(str(spec.id))
		var base: float = BTN_BIG_SIZE if str(spec.get("size", "")) == "big" else BTN_SIZE
		var diameter: float = maxf(MIN_BUTTON,
			base * scale * float(over.get("scale", 1.0)))
		var centre := _cluster_slot(str(spec.cluster), int(spec.col), int(spec.row),
			vp, scale)
		var off = over.get("offset", [0.0, 0.0])
		if off is Array and off.size() == 2:
			centre += Vector2(float(off[0]), float(off[1]))
		_button_rects.append({
			"rect": Rect2(centre - Vector2(diameter, diameter) * 0.5,
				Vector2(diameter, diameter)),
			"spec": spec,
			"size": diameter,
		})
	queue_redraw()


## Where a slot in a cluster sits on screen. Each cluster grows away from the
## edge it is anchored to, so adding a button never pushes one off-screen.
##
## The grid step is the *largest* button plus a gap, not the ordinary one:
## a 104px button in an 88px grid overlaps its neighbours, which is a control
## a thumb cannot reliably pick out. And it scales with the button scale, or
## making the buttons bigger would pile them on top of each other.
func _cluster_slot(cluster: String, col: int, row: int, vp: Vector2,
		scale: float) -> Vector2:
	var unit: float = maxf(MIN_BUTTON, BTN_BIG_SIZE * scale)
	var step: float = unit + BTN_GAP * scale
	# Enough room between the screen edge and the first slot for half a button
	var edge: float = unit * 0.5 + 22.0 * scale
	var mirror: float = -1.0 if _mirrored() else 1.0
	match cluster:
		"combat":
			var x: float = vp.x - edge if not _mirrored() else edge
			return Vector2(x - float(col) * step * mirror,
				vp.y - edge - float(row) * step)
		"move":
			# Stacked above the movement stick rather than beside it, so the
			# thumb that steers is never covering the thumb that jumps.
			var mx: float = edge if not _mirrored() else vp.x - edge
			var stick_top: float = vp.y - STICK_MARGIN.y - STICK_RADIUS - unit * 0.6
			return Vector2(mx + float(col) * step * mirror,
				stick_top - float(row) * step)
		"centre":
			return Vector2(vp.x * 0.5, vp.y - edge)
		"corner":
			return Vector2(vp.x - edge - float(col) * step, edge)
	return Vector2(vp.x * 0.5, vp.y * 0.5)


func set_enabled(on: bool) -> void:
	visible = on
	if not on:
		_release_all()
	_layout()


# ==================== GESTURE RECOGNISER ====================

func _input(event: InputEvent) -> void:
	if not visible:
		return
	if event is InputEventScreenTouch:
		if event.pressed:
			_on_press(event.index, event.position)
		else:
			_on_release(event.index, event.position)
		get_viewport().set_input_as_handled()
	elif event is InputEventScreenDrag:
		_on_drag(event.index, event.position, event.relative)
		get_viewport().set_input_as_handled()


func _now() -> float:
	return float(Time.get_ticks_msec()) / 1000.0


func _on_press(index: int, pos: Vector2) -> void:
	# A menu is open: let the normal UI have the touch
	if Game.ui_open != "":
		return

	var record := {
		"start": pos, "pos": pos, "at": _now(),
		"button": null, "moved": 0.0, "held": false, "swiped": false,
	}

	for entry in _button_rects:
		if entry.rect.has_point(pos):
			record.button = entry
			_begin_button(entry)
			_touches[index] = record
			queue_redraw()
			return

	# Movement stick, if the finger landed near it
	if _stick_finger == -1 and pos.distance_to(_stick_centre) <= STICK_RADIUS * 1.6:
		_stick_finger = index
		_touches[index] = record
		_update_stick(pos)
		return

	_touches[index] = record


func _on_drag(index: int, pos: Vector2, relative: Vector2) -> void:
	if not _touches.has(index):
		return
	var record: Dictionary = _touches[index]
	record.moved += relative.length()
	record.pos = pos

	if index == _stick_finger:
		_update_stick(pos)
		return

	var entry = record.button
	if entry != null:
		# A vertical drag on a button that wants one is a swipe, not a miss
		var spec: Dictionary = entry.spec
		if spec.has("swipe") and not record.swiped \
				and absf(pos.y - record.start.y) > SWIPE_THRESHOLD:
			record.swiped = true
			_call_player(str(spec.swipe))
			Game.haptic(0.4)
		return

	# Camera drag. Gyro-only mode turns this off entirely.
	if in_camera_zone(record.start) and player != null and player.touch_look_enabled():
		player.apply_look(relative / LOOK_DIVISOR)


func _on_release(index: int, pos: Vector2) -> void:
	if not _touches.has(index):
		if index == _stick_finger:
			_stick_finger = -1
		return
	var record: Dictionary = _touches[index]
	_touches.erase(index)

	if index == _stick_finger:
		_stick_finger = -1
		_stick_vector = Vector2.ZERO
		_apply_move_actions()
		queue_redraw()
		return

	var entry = record.button
	if entry != null:
		_end_button(entry, record)
		queue_redraw()
		return

	# A tap in the camera zone that went nowhere: a double one is a quick throw
	var tap_limit: float = float(Game.setting("tap_tolerance")) + TAP_SLOP / 400.0
	var was_tap: bool = record.moved < TAP_SLOP and (_now() - record.at) < tap_limit
	if was_tap and in_camera_zone(record.start):
		if _now() - _last_tap_at < DOUBLE_TAP_TIME \
				and pos.distance_to(_last_tap_pos) < DOUBLE_TAP_SLOP:
			_last_tap_at = -99.0
			_call_player("throw_held_grenade")
			Game.haptic(0.8)
		else:
			_last_tap_at = _now()
			_last_tap_pos = pos


## Anything a button holds down starts here, so an automatic weapon fires for
## as long as the finger is on the trigger.
func _begin_button(entry: Dictionary) -> void:
	var spec: Dictionary = entry.spec
	Game.haptic(1.0 if str(spec.get("size", "")) == "big" else 0.6)
	if spec.has("press"):
		Input.action_press(str(spec.press))
		_held_actions[str(spec.press)] = true
	if spec.has("press_call") and player != null:
		player.call(str(spec.press_call), true)
	if spec.has("press_lean") and player != null:
		player.set_lean(float(spec.press_lean))


func _end_button(entry: Dictionary, record: Dictionary) -> void:
	var spec: Dictionary = entry.spec
	if spec.has("press"):
		Input.action_release(str(spec.press))
		_held_actions.erase(str(spec.press))
	if spec.has("press_call") and player != null:
		player.call(str(spec.press_call), false)
	if spec.has("press_lean") and player != null:
		player.set_lean(0.0)

	if record.swiped:
		return

	var down: float = _now() - float(record.at)
	var moved_far: bool = float(record.moved) >= TAP_SLOP
	if moved_far:
		return

	# A hold that has already fired needs no tap on release
	if bool(record.held):
		return

	if down >= HOLD_TIME and spec.has("hold"):
		_call_player(str(spec.hold))
		return
	if spec.has("tap"):
		_call_player(str(spec.tap))


## Holds are recognised while the finger is still down, so the action happens
## when the player feels it rather than when they let go.
func _process(delta: float) -> void:
	if _tooltip_left > 0.0:
		_tooltip_left = maxf(0.0, _tooltip_left - delta)
		if _tooltip_left <= 0.0:
			_tooltip = ""
			queue_redraw()
	if not visible or _touches.is_empty():
		return
	for index in _touches:
		var record: Dictionary = _touches[index]
		if record.button == null or bool(record.held) or bool(record.swiped):
			continue
		if float(record.moved) >= TAP_SLOP:
			continue
		if _now() - float(record.at) < HOLD_TIME:
			continue
		var spec: Dictionary = record.button.spec
		if spec.has("hold"):
			record.held = true
			_call_player(str(spec.hold))
			Game.haptic(0.9)
		elif bool(Game.setting("button_tooltips")):
			# Nothing to hold: name the button instead. A teaching aid, which
			# is why it is off unless asked for.
			record.held = true
			_tooltip = str(spec.label)
			_tooltip_left = 1.4
			queue_redraw()


## Calls a named method on the player, or on this layer for the handful of
## touch-only actions. Missing methods are ignored rather than crashing the
## input layer, which must never be the thing that takes the game down.
func _call_player(method: String) -> void:
	if has_method(method):
		call(method)
		return
	if player != null and player.has_method(method):
		player.call(method)


func _release_all() -> void:
	for action in _held_actions:
		Input.action_release(action)
	_held_actions.clear()
	if player != null:
		player.set_lean(0.0)
		player.set_holding_breath(false)
	_touches.clear()
	_stick_finger = -1
	_stick_vector = Vector2.ZERO
	_apply_move_actions()


# ==================== TOUCH-ONLY ACTIONS ====================

## The stance buttons always toggle, whatever the keyboard is set to do: there
## is no such thing as holding a button on a phone while also steering.
func touch_crouch() -> void:
	if player != null:
		player.toggle_stance(Game.STANCE_CROUCH)


func touch_prone() -> void:
	if player != null:
		player.toggle_stance(Game.STANCE_PRONE)


func touch_inventory() -> void:
	var hud := get_parent()
	if hud != null and hud.has_method("toggle_inventory"):
		hud.toggle_inventory()


func touch_build_mode() -> void:
	var hud := get_parent()
	if hud != null and hud.has_method("open_blueprint_menu"):
		hud.open_blueprint_menu()


func touch_interact() -> void:
	Input.action_press("interact")
	# Released next frame: the interact path reads a press, not a hold
	get_tree().create_timer(0.05).timeout.connect(func():
		Input.action_release("interact"))


func touch_interact_hold() -> void:
	touch_interact()


func touch_interact_fast() -> void:
	touch_interact()


func cycle_fire_mode_held() -> void:
	Game.cycle_fire_mode(Game.active_tool())


func cycle_scope_held() -> void:
	Game.cycle_scope(Game.active_tool())


func throw_held_grenade() -> void:
	if player != null:
		player._throw_last_grenade()


# ==================== STICK ====================

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
	var font_size := 14
	var held_ids := {}
	for index in _touches:
		var entry = _touches[index].button
		if entry != null:
			held_ids[str(entry.spec.id)] = true

	for entry in _button_rects:
		var centre: Vector2 = entry.rect.get_center()
		var radius: float = entry.size * 0.5
		var down: bool = held_ids.has(str(entry.spec.id))
		draw_circle(centre, radius,
			Color(0.85, 0.42, 0.18, 0.5) if down else Color(0, 0, 0, 0.42))
		draw_arc(centre, radius, 0.0, TAU, 40, Color(1, 1, 1, 0.35), 2.0, true)
		var text: String = str(entry.spec.label)
		var width := font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size).x
		draw_string(font, centre + Vector2(-width * 0.5, font_size * 0.4), text,
			HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, Color(1, 1, 1, 0.9))

	if _tooltip != "":
		var vp := get_viewport_rect().size
		var tw := font.get_string_size(_tooltip, HORIZONTAL_ALIGNMENT_LEFT, -1, 20).x
		draw_string(font, Vector2(vp.x * 0.5 - tw * 0.5, vp.y * 0.5), _tooltip,
			HORIZONTAL_ALIGNMENT_LEFT, -1, 20, Color(1, 0.95, 0.7, 0.95))
