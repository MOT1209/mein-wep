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

## What the stock panel lists: the ones the spec asks for, mapped onto the ids
## this game actually uses. "Metal Ore" is `iron` here, and food is the cooked
## meat the survival system already counts.
const RESOURCES := ["wood", "stone", "iron", "sulfur", "scrap", "cloth",
	"leather", "cooked_meat"]

## The buttons, in order. Only entries that actually do something are here:
## a Store or a Battle Pass button in a game with no storefront and no season
## would be a lie told in the most prominent place in the product.
## `real` marks an entry that opens something this build actually has. The
## rest are on the roadmap, and pressing one says so in as many words rather
## than opening an empty screen dressed up as a feature — a button that
## pretends is worse than one that admits.
const ENTRIES := [
	{"id": "continue", "label": "Continue", "glyph": "▶",
		"desc": "Return to your world", "real": true},
	{"id": "play", "label": "Play", "glyph": "✦",
		"desc": "Start over on a fresh map", "real": true},
	{"id": "servers", "label": "Servers", "glyph": "⇄",
		"desc": "Single-player build — no servers", "real": false},
	{"id": "character", "label": "Character", "glyph": "☗",
		"desc": "Loadout, armour and condition", "real": true},
	{"id": "inventory", "label": "Inventory", "glyph": "▣",
		"desc": "What you are carrying", "real": true},
	{"id": "guide", "label": "Crafting Guide", "glyph": "❖",
		"desc": "Controls and how to survive", "real": true},
	{"id": "battle_pass", "label": "Battle Pass", "glyph": "★",
		"desc": "No seasons in this build", "real": false},
	{"id": "events", "label": "Events", "glyph": "◈",
		"desc": "Weather and daily missions", "real": true},
	{"id": "store", "label": "Store", "glyph": "⬤",
		"desc": "No storefront in this build", "real": false},
	{"id": "controls", "label": "Settings", "glyph": "◎",
		"desc": "Controls, camera and touch", "real": true},
	{"id": "credits", "label": "Credits", "glyph": "✎",
		"desc": "Who and what built this", "real": true},
	{"id": "exit", "label": "Exit", "glyph": "⏻",
		"desc": "Save and quit", "real": true},
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
var _compass: Label
var _conditions: Label
var _vitals: Dictionary = {}
var _resource_labels: Dictionary = {}
var _mission_box: VBoxContainer
var _mission_signature := ""


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
	_refresh_live()


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
		Game.ACCENT_DIM.lerp(Game.ACCENT, pulse * night))


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
	_build_compass()
	_build_vitals()
	_build_resources()
	_build_missions()
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
	sub.add_theme_color_override("font_color", Game.TEXT_DIM)
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
		b.tooltip_text = str(entry.get("desc", ""))
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.custom_minimum_size = Vector2(PANEL_WIDTH - 20.0, BUTTON_HEIGHT)
		b.focus_mode = Control.FOCUS_NONE
		b.add_theme_font_size_override("font_size", 15)
		_style_button(b, false)
		# Greyed rather than hidden: the roadmap is visible, and pressing one
		# tells you plainly that it is not built yet.
		if not bool(entry.get("real", true)):
			b.modulate.a = 0.45
		b.pressed.connect(_on_entry.bind(str(entry.id), b))
		b.mouse_entered.connect(_on_hover.bind(b, true))
		b.mouse_exited.connect(_on_hover.bind(b, false))
		column.add_child(b)
		_buttons.append(b)


## Every plate on this screen comes from the same place, so the whole product
## re-skins from Game's theme block rather than from colour literals scattered
## through the menu.
func _glass(panel: PanelContainer, _tint: Color = Color.TRANSPARENT) -> void:
	panel.add_theme_stylebox_override("panel", Game.glass_box())


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
		"continue", "play":
			hud.start_game()
		"controls":
			hud.settings_ui.open()
		"guide":
			hud.show_guide()
		"credits":
			hud.show_credits()
		"character", "inventory":
			# Both open the one screen that holds a loadout and what is worn
			hud.start_game()
			hud.toggle_inventory()
		"events":
			var lines := "Weather: %s

" % world.weather.state_name()
			for mission in world.missions.active:
				lines += "%s — %d / %d%s
" % [mission.name, mission.progress,
					mission.target, "  ✔" if mission.done else ""]
			Game.notify(lines.strip_edges(), Game.ACCENT)
		"exit":
			world.save_game()
			get_tree().quit()
		_:
			# Servers, Battle Pass, Store: named on the roadmap, not built.
			Game.notify("%s is not in this build" % _label_of(id),
				Color(1.0, 0.63, 0.0))


func _label_of(id: String) -> String:
	for entry in ENTRIES:
		if str(entry.id) == id:
			return str(entry.label)
	return id


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
	_status.add_theme_color_override("font_color", Game.TEXT_DIM)
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
	_news.add_theme_color_override("font_color", Game.TEXT)
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

## Top centre: heading, clock, weather, temperature and wind. Every figure is
## read live from a system that already runs — the compass from the rig's own
## yaw, the rest from the day/night clock, the weather and the survival stats.
func _build_compass() -> void:
	var holder := MarginContainer.new()
	holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	holder.add_theme_constant_override("margin_top", 26)
	holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(holder)

	var panel := PanelContainer.new()
	panel.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	panel.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_glass(panel)
	holder.add_child(panel)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 4)
	column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(column)

	_compass = Label.new()
	_compass.add_theme_font_size_override("font_size", 22)
	_compass.add_theme_color_override("font_color", Game.ACCENT)
	_compass.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_compass.custom_minimum_size = Vector2(230, 0)
	_compass.mouse_filter = Control.MOUSE_FILTER_IGNORE
	column.add_child(_compass)

	_conditions = Label.new()
	_conditions.add_theme_font_size_override("font_size", 12)
	_conditions.add_theme_color_override("font_color", Game.TEXT_DIM)
	_conditions.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_conditions.mouse_filter = Control.MOUSE_FILTER_IGNORE
	column.add_child(_conditions)


## Right side: the survival bars, built from the same BAR_DEFS the in-game HUD
## uses — so the menu can never show a stat the HUD does not, or miss one it
## has, however either changes.
func _build_vitals() -> void:
	var holder := MarginContainer.new()
	holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	holder.add_theme_constant_override("margin_right", 40)
	holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(holder)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(240, 0)
	panel.size_flags_horizontal = Control.SIZE_SHRINK_END
	panel.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_glass(panel)
	holder.add_child(panel)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 5)
	column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(column)
	column.add_child(_heading("CONDITION"))

	for def in hud.BAR_DEFS:
		var stat := str(def[0])
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 8)
		row.mouse_filter = Control.MOUSE_FILTER_IGNORE

		var name_label := Label.new()
		name_label.text = stat.capitalize()
		name_label.custom_minimum_size = Vector2(88, 0)
		name_label.add_theme_font_size_override("font_size", 11)
		name_label.add_theme_color_override("font_color", Game.TEXT_DIM)
		row.add_child(name_label)

		var bar := ProgressBar.new()
		bar.show_percentage = false
		bar.custom_minimum_size = Vector2(84, 10)
		bar.max_value = 100.0
		hud._style_progress_bar(bar, def[1])
		row.add_child(bar)

		var value := Label.new()
		value.custom_minimum_size = Vector2(34, 0)
		value.add_theme_font_size_override("font_size", 11)
		value.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		value.add_theme_color_override("font_color", Game.TEXT)
		row.add_child(value)

		column.add_child(row)
		_vitals[stat] = {"bar": bar, "value": value, "colour": def[1]}


## Top right: what you are carrying, live.
func _build_resources() -> void:
	var holder := MarginContainer.new()
	holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	holder.add_theme_constant_override("margin_right", 40)
	holder.add_theme_constant_override("margin_top", 34)
	holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(holder)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(240, 0)
	panel.size_flags_horizontal = Control.SIZE_SHRINK_END
	panel.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_glass(panel)
	holder.add_child(panel)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 3)
	column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(column)
	column.add_child(_heading("STOCK"))

	for id in RESOURCES:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 8)
		row.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var name_label := Label.new()
		name_label.text = str(Game.ITEMS.get(id, {}).get("name", id))
		name_label.custom_minimum_size = Vector2(148, 0)
		name_label.add_theme_font_size_override("font_size", 11)
		name_label.add_theme_color_override("font_color", Game.TEXT_DIM)
		row.add_child(name_label)
		var count := Label.new()
		count.custom_minimum_size = Vector2(58, 0)
		count.add_theme_font_size_override("font_size", 11)
		count.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		count.add_theme_color_override("font_color", Game.TEXT)
		row.add_child(count)
		column.add_child(row)
		_resource_labels[id] = count


## Bottom right: the day's three jobs and how they are going.
func _build_missions() -> void:
	var holder := MarginContainer.new()
	holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	holder.add_theme_constant_override("margin_right", 40)
	holder.add_theme_constant_override("margin_bottom", 30)
	holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(holder)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(290, 0)
	panel.size_flags_horizontal = Control.SIZE_SHRINK_END
	panel.size_flags_vertical = Control.SIZE_SHRINK_END
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_glass(panel)
	holder.add_child(panel)

	_mission_box = VBoxContainer.new()
	_mission_box.add_theme_constant_override("separation", 5)
	_mission_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(_mission_box)


func _heading(text: String) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", 12)
	l.add_theme_color_override("font_color", Game.ACCENT)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l


## Everything on screen that changes, refreshed once a frame.
func _refresh_live() -> void:
	if _compass != null and _camera != null and _rig != null:
		var MapUi = load("res://scripts/map_ui.gd")
		var heading: float = _rig.rotation.y + _camera.rotation.y
		_compass.text = MapUi.heading_of(heading)
	if _conditions != null and world.weather != null:
		var hour := int(Game.day_time / Game.DAY_LENGTH * 24.0)
		var minute := int(fmod(Game.day_time / Game.DAY_LENGTH * 1440.0, 60.0))
		# The temperature stat is a 0-100 comfort reading, so it is mapped to
		# something that reads as degrees rather than shown as a percentage.
		_conditions.text = "%02d:%02d   \u00b7   %s   \u00b7   %d\u00b0   \u00b7   wind %d%%" % [
			hour, minute, world.weather.state_name(),
			roundi(float(Game.stats.temperature) * 0.4 - 10.0),
			roundi(world.wind_strength() * 100.0)]

	for stat in _vitals:
		var row: Dictionary = _vitals[stat]
		var v: float = clampf(float(Game.stats.get(stat, 0.0)), 0.0, 100.0)
		row.bar.value = v
		row.value.text = "%d%%" % roundi(v)
		# The colour answers the reading: any bar in trouble goes red, and for
		# radiation "trouble" is the bar being full rather than empty.
		var danger: float = v / 100.0 if stat == "radiation" else 1.0 - v / 100.0
		hud._style_progress_bar(row.bar,
			Color(row.colour).lerp(Color(0.92, 0.28, 0.22),
				clampf((danger - 0.6) * 2.5, 0.0, 1.0)))

	for id in _resource_labels:
		_resource_labels[id].text = str(Game.get_count(id))

	_refresh_missions()


## Rebuilt only when something actually moved, because tearing down and
## recreating six controls every frame for a panel that changes once a minute
## is the kind of thing that costs a phone its frame rate.
func _refresh_missions() -> void:
	if _mission_box == null or world.missions == null:
		return
	var signature := "%d|%d" % [world.missions.day, world.missions.done_count()]
	for m in world.missions.active:
		signature += "|%d" % int(m.progress)
	if signature == _mission_signature:
		return
	_mission_signature = signature

	for c in _mission_box.get_children():
		c.queue_free()
	# Pinned again after rebuilding: the HUD pins the tree to left-to-right
	# once at startup, and anything created later — like these rows — would
	# otherwise mirror itself on an Arabic install.
	_mission_box.add_child(_heading("DAILY   %d / %d DONE" % [
		world.missions.done_count(), world.missions.active.size()]))

	for m in world.missions.active:
		var line := Label.new()
		var reward := []
		for res in m.reward:
			reward.append("%d %s" % [int(m.reward[res]),
				Game.ITEMS.get(res, {}).get("name", res)])
		line.text = "%s%s  -  %s" % ["[done] " if m.done else "", str(m.name),
			" / ".join(reward)]
		line.add_theme_font_size_override("font_size", 11)
		line.add_theme_color_override("font_color",
			Game.ACCENT if m.done else Game.TEXT_DIM)
		line.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_mission_box.add_child(line)

		var bar := ProgressBar.new()
		bar.show_percentage = false
		bar.max_value = maxf(1.0, float(m.target))
		bar.value = float(m.progress)
		bar.custom_minimum_size = Vector2(0, 8)
		hud._style_progress_bar(bar, Game.ACCENT if m.done else Game.ACCENT_DIM)
		_mission_box.add_child(bar)

	hud.force_ltr(_mission_box)
