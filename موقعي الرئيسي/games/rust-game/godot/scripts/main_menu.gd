extends Control
## The main menu: a window onto the world rather than a picture in front of it.
##
## The old start screen was a 92%-opaque black sheet over a world that was
## already built and rendering behind it. So the "living portal" this is meant
## to be costs almost nothing to make real: take the sheet away, put a camera
## on a slow rig looking out over the settlement, and let the game's own
## day/night cycle, weather, wildlife and turbines be the backdrop. Nothing
## here is a set piece built for the menu — it is the map you are about to
## play on, running.
##
## The camera pans ten degrees each way over eight seconds and rides up and
## down a centimetre either side of its height, which is enough to stop the
## frame reading as a still without anyone noticing why.

const PAN_DEGREES := 10.0
const PAN_PERIOD := 8.0
## Height drift, in metres. Ten centimetres, as if the rig were breathing.
const BREATH := 0.1
const BREATH_PERIOD := 5.5

## Where the rig sits and what it looks at. Chosen to put the road, a couple of
## roadside buildings and the treeline in one frame.
const RIG_HEIGHT := 11.0
const RIG_BACK := 34.0

## Logo pulse
const LOGO_PULSE_PERIOD := 5.0

## Panel look
const PANEL_WIDTH := 268.0
const BUTTON_HEIGHT := 46.0
const HOVER_SCALE := 1.10
const HOVER_FADE := 0.3

## News cards rotate on this cadence.
const NEWS_PERIOD := 10.0

## The buttons, in order. Only entries that actually do something are here:
## a Store or a Battle Pass button in a game with no storefront and no season
## would be a lie told in the most prominent place in the product.
const ENTRIES := [
	{"id": "play", "label": "Continue Play", "glyph": "▶"},
	{"id": "controls", "label": "Controls & Camera", "glyph": "◎"},
	{"id": "guide", "label": "Guide", "glyph": "❖"},
	{"id": "credits", "label": "Credits", "glyph": "✎"},
	{"id": "exit", "label": "Exit", "glyph": "⏻"},
]

var hud: CanvasLayer
var world: Node3D

var _rig: Node3D
var _camera: Camera3D
var _saved_camera: Camera3D
var _clock := 0.0
var _logo: Label
var _buttons: Array = []
var _status: Label
var _weather_label: Label
var _news: Label
var _news_index := 0
var _news_left := 0.0
var _news_cards: Array = []


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	visible = false
	_news_cards = _load_news()
	_build()


# ==================== THE VIEW ====================

## A camera on its own node, so panning it cannot disturb the player's own
## camera or their spawn position. Swapped in when the menu opens and handed
## straight back when the game starts.
func _make_rig() -> void:
	if _rig != null:
		return
	_rig = Node3D.new()
	_rig.name = "MenuCameraRig"
	world.add_child(_rig)

	_camera = Camera3D.new()
	_camera.far = 2000.0
	_camera.fov = 58.0
	# Shallow depth of field: the settlement is sharp, the hills behind it are
	# not, which is what puts the eye where the menu wants it.
	_camera.attributes = CameraAttributesPractical.new()
	var attrs: CameraAttributesPractical = _camera.attributes
	attrs.dof_blur_far_enabled = true
	attrs.dof_blur_far_distance = 70.0
	attrs.dof_blur_far_transition = 40.0
	attrs.dof_blur_amount = 0.06
	_rig.add_child(_camera)

	_aim_rig()


## Points the rig at a stretch of road with something built on it, falling back
## to the spawn area on a map where the roads failed to generate.
func _aim_rig() -> void:
	var focus := Vector3.ZERO
	if world.roads != null and not world.roads.landmarks.is_empty():
		var pick: Dictionary = world.roads.landmarks[
			randi() % world.roads.landmarks.size()]
		var at: Vector2 = pick.pos
		focus = Vector3(at.x, world.terrain_height(at.x, at.y), at.y)

	# Stand back from it, up a bit, and look down at the ground it stands on
	var away := Vector3(cos(randf() * TAU), 0.0, sin(randf() * TAU)) * RIG_BACK
	var eye := focus + away + Vector3(0, RIG_HEIGHT, 0)
	_rig.global_position = eye
	_rig.look_at(focus + Vector3(0, 1.5, 0), Vector3.UP)
	_rig.rotation.z = 0.0


func _process(delta: float) -> void:
	if not visible:
		return
	_clock += delta
	_animate_view()
	_animate_logo()
	_animate_news(delta)
	_refresh_status()


## The pan and the breath. Both are sine waves rather than tweens so they never
## end, never restart, and never need to be told to loop.
func _animate_view() -> void:
	if _rig == null or _camera == null:
		return
	var pan := sin(_clock * TAU / PAN_PERIOD) * deg_to_rad(PAN_DEGREES)
	_camera.rotation.y = pan
	_camera.position.y = sin(_clock * TAU / BREATH_PERIOD) * BREATH
	# A touch of counter-roll, so the pan reads as a head turn and not a turret
	_camera.rotation.z = -pan * 0.04


func _animate_logo() -> void:
	if _logo == null:
		return
	var pulse := 0.5 + 0.5 * sin(_clock * TAU / LOGO_PULSE_PERIOD)
	# The glow answers the sky: at night it is the brightest thing on screen,
	# at noon it is nearly flat.
	var night: float = 1.0
	if world != null:
		night = clampf(1.0 - world.sun_strength(), 0.25, 1.0)
	_logo.add_theme_color_override("font_color",
		Color(0.62, 0.86, 0.95).lerp(Color(0.95, 0.99, 1.0), pulse * night))


# ==================== UI ====================

func _build() -> void:
	# A thin vignette rather than a blackout: the world behind has to be seen
	var veil := ColorRect.new()
	veil.color = Color(0.02, 0.03, 0.04, 0.28)
	veil.set_anchors_preset(Control.PRESET_FULL_RECT)
	veil.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(veil)

	_build_logo()
	_build_panel()
	_build_status()
	_build_news()


func _build_logo() -> void:
	var holder := MarginContainer.new()
	holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	holder.add_theme_constant_override("margin_left", 40)
	holder.add_theme_constant_override("margin_top", 34)
	holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(holder)

	var column := VBoxContainer.new()
	column.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	column.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	holder.add_child(column)

	_logo = Label.new()
	_logo.text = "RUST SURVIVAL"
	_logo.add_theme_font_size_override("font_size", 52)
	_logo.mouse_filter = Control.MOUSE_FILTER_IGNORE
	column.add_child(_logo)

	var sub := Label.new()
	sub.text = "GODOT EDITION"
	sub.add_theme_font_size_override("font_size", 15)
	sub.add_theme_color_override("font_color", Color(0.75, 0.78, 0.82, 0.8))
	sub.mouse_filter = Control.MOUSE_FILTER_IGNORE
	column.add_child(sub)

	# Scales up into place on load rather than appearing finished
	column.scale = Vector2(0.86, 0.86)
	column.modulate.a = 0.0
	var tw := create_tween()
	tw.set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN_OUT)
	tw.parallel().tween_property(column, "scale", Vector2.ONE, 0.8)
	tw.parallel().tween_property(column, "modulate:a", 1.0, 0.8)


## The left-hand column. A glass panel and a stack of buttons, each of which
## grows and brightens under the pointer and compresses when pressed.
func _build_panel() -> void:
	var holder := MarginContainer.new()
	holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	holder.add_theme_constant_override("margin_left", 40)
	add_child(holder)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(PANEL_WIDTH, 0)
	panel.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	panel.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_glass(panel, Color(0.06, 0.07, 0.08, 0.55))
	holder.add_child(panel)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 6)
	panel.add_child(column)

	for entry in ENTRIES:
		var b := Button.new()
		b.text = "  %s   %s" % [str(entry.glyph), str(entry.label)]
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.custom_minimum_size = Vector2(PANEL_WIDTH - 20.0, BUTTON_HEIGHT)
		b.focus_mode = Control.FOCUS_NONE
		b.add_theme_font_size_override("font_size", 16)
		_style_button(b, false)
		b.pressed.connect(_on_entry.bind(str(entry.id), b))
		b.mouse_entered.connect(_on_hover.bind(b, true))
		b.mouse_exited.connect(_on_hover.bind(b, false))
		column.add_child(b)
		_buttons.append(b)


func _glass(panel: PanelContainer, tint: Color) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = tint
	sb.set_corner_radius_all(24)
	sb.set_border_width_all(1)
	sb.border_color = Color(1, 1, 1, 0.14)
	sb.set_content_margin_all(14)
	sb.shadow_color = Color(0, 0, 0, 0.45)
	sb.shadow_size = 10
	panel.add_theme_stylebox_override("panel", sb)


func _style_button(b: Button, lit: bool) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.176, 0.176, 0.176, 0.85) if not lit \
		else Color(0.278, 0.278, 0.278, 0.95)
	sb.set_corner_radius_all(14)
	sb.set_content_margin_all(8)
	if lit:
		sb.set_border_width_all(1)
		sb.border_color = Color(0.55, 0.8, 0.9, 0.6)
	b.add_theme_stylebox_override("normal", sb)
	b.add_theme_stylebox_override("hover", sb)
	b.add_theme_stylebox_override("pressed", sb)


## Grows and brightens under the pointer. The pivot is set to the button's own
## middle first, or it would grow out of its top-left corner and drift.
func _on_hover(b: Button, entering: bool) -> void:
	b.pivot_offset = b.size * 0.5
	_style_button(b, entering)
	var tw := create_tween()
	tw.set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tw.tween_property(b, "scale",
		Vector2(HOVER_SCALE, HOVER_SCALE) if entering else Vector2.ONE, HOVER_FADE)
	if entering:
		Sfx.play("ui_click")


func _on_entry(id: String, b: Button) -> void:
	# Compresses and springs back, so a press is felt as well as heard
	b.pivot_offset = b.size * 0.5
	var tw := create_tween()
	tw.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_property(b, "scale", Vector2(0.94, 0.94), 0.08)
	tw.tween_property(b, "scale", Vector2.ONE, 0.16)
	Sfx.play("ui_click")

	match id:
		"play":
			hud.start_game()
		"controls":
			hud.settings_ui.open()
		"guide":
			hud.show_guide()
		"credits":
			hud.show_credits()
		"exit":
			world.save_game()
			get_tree().quit()


## Bottom left: what is true about this build and this world, and nothing that
## is not. No ping, no region, no server: there is no server.
func _build_status() -> void:
	var holder := MarginContainer.new()
	holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	holder.add_theme_constant_override("margin_left", 40)
	holder.add_theme_constant_override("margin_bottom", 30)
	holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(holder)

	var panel := PanelContainer.new()
	panel.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	panel.size_flags_vertical = Control.SIZE_SHRINK_END
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_glass(panel, Color(0.05, 0.06, 0.07, 0.5))
	holder.add_child(panel)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 3)
	column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(column)

	_status = Label.new()
	_status.add_theme_font_size_override("font_size", 13)
	_status.add_theme_color_override("font_color", Color(0.78, 0.82, 0.86))
	_status.mouse_filter = Control.MOUSE_FILTER_IGNORE
	column.add_child(_status)

	_weather_label = Label.new()
	_weather_label.add_theme_font_size_override("font_size", 13)
	_weather_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	column.add_child(_weather_label)


func _refresh_status() -> void:
	if _status == null or world == null:
		return
	var save_line := "New world"
	if FileAccess.file_exists(world.SAVE_PATH):
		save_line = "Save found — %d structures" % world.structures.size()
	_status.text = "%s   ·   %s" % [_version(), save_line]

	if _weather_label != null and world.weather != null:
		var hour := int(Game.day_time / Game.DAY_LENGTH * 24.0)
		_weather_label.text = "%s   ·   %02d:00   ·   wind %d%%" % [
			world.weather.state_name(), hour,
			roundi(world.wind_strength() * 100.0)]
		# Colour-coded the way the spec asks, against something real: how
		# survivable it is out there right now.
		var harsh: float = world.weather.chill() / 26.0
		_weather_label.add_theme_color_override("font_color",
			Color(0.45, 0.85, 0.5).lerp(Color(0.95, 0.45, 0.35), harsh))


## Read from the project settings rather than from a file beside the project:
## res:// cannot climb above the project root, so the version has to be
## somewhere Godot itself already knows about.
func _version() -> String:
	var v = ProjectSettings.get_setting("application/config/version", "")
	return "v%s" % str(v) if str(v) != "" else "v1.0"


## Bottom centre: a rotating card of what has actually changed, read from a
## file in the repository rather than typed in here — so it is patch notes and
## not decoration.
func _build_news() -> void:
	var holder := MarginContainer.new()
	holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	holder.add_theme_constant_override("margin_bottom", 30)
	holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(holder)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(520, 0)
	panel.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	panel.size_flags_vertical = Control.SIZE_SHRINK_END
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_glass(panel, Color(0.05, 0.06, 0.07, 0.5))
	holder.add_child(panel)

	_news = Label.new()
	_news.add_theme_font_size_override("font_size", 14)
	_news.add_theme_color_override("font_color", Color(0.86, 0.88, 0.92))
	_news.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_news.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_news.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(_news)
	_news_left = 0.0


## The news file, one card per line. Missing or empty is fine — the panel then
## has nothing to say and says nothing.
func _load_news() -> Array:
	var out := []
	var f := FileAccess.open("res://news.txt", FileAccess.READ)
	if f == null:
		return out
	while not f.eof_reached():
		var line := f.get_line().strip_edges()
		if line != "" and not line.begins_with("#"):
			out.append(line)
	f.close()
	return out


func _animate_news(delta: float) -> void:
	if _news == null or _news_cards.is_empty():
		if _news != null:
			_news.text = ""
		return
	_news_left -= delta
	if _news_left > 0.0:
		return
	_news_left = NEWS_PERIOD
	_news.text = str(_news_cards[_news_index % _news_cards.size()])
	_news_index += 1
	# Slides up into place as it changes
	_news.modulate.a = 0.0
	_news.position.y += 8.0
	var tw := create_tween()
	tw.parallel().tween_property(_news, "modulate:a", 1.0, 0.45)
	tw.parallel().tween_property(_news, "position:y", _news.position.y - 8.0, 0.45)


# ==================== OPEN / CLOSE ====================

func open() -> void:
	_make_rig()
	_aim_rig()
	_clock = 0.0
	_news_left = 0.0
	# Take the view, remembering whose it was — but never remembering our own
	# camera as the one to give it back to. Opening the menu twice used to
	# record the menu camera as the thing to restore, so starting the game left
	# the player looking through the rig.
	var holder := world.get_viewport().get_camera_3d()
	if holder != null and holder != _camera:
		_saved_camera = holder
	if _camera != null:
		_camera.current = true
	visible = true
	Game.set_ui("start")


func close() -> void:
	visible = false
	# Hand the view straight back to whoever had it
	if _saved_camera != null and is_instance_valid(_saved_camera):
		_saved_camera.current = true
	elif world.player != null:
		world.player.camera.current = true
