extends Control
## The main menu, built to the reference art: Arabic, right-to-left, with an
## orange-accented glass plate in each region of a living 3D scene.
##
## It is a window onto the world rather than a picture in front of it. The old
## start screen was a 92%-opaque black sheet over a world that was already
## rendering behind it, so the "living portal" costs almost nothing to make
## real: take the sheet away, put a camera on a slow rig looking down the road,
## and let the day/night cycle, the weather and the wildlife be the backdrop.
##
## Every figure on screen is read from a system that already runs. Nothing is
## typed in: the compass comes from the rig's own yaw, the clock and weather
## from the world, the bars from the survival stats, the stock from the
## inventory, the jobs from the mission tracker, and the level from experience
## the player actually earned.

const PAN_DEGREES := 10.0
const PAN_PERIOD := 8.0
## Height drift, in metres — as if the rig were breathing.
const BREATH := 0.1
const BREATH_PERIOD := 5.5
## A slow push in and out, on a longer period than the pan so the two never
## line up into one obvious loop.
const ZOOM_PERIOD := 17.0
const ZOOM_DEGREES := 3.0
const BASE_FOV := 58.0

const RIG_HEIGHT := 9.0
const RIG_BACK := 30.0

const LOGO_PULSE_PERIOD := 5.0
const NEWS_PERIOD := 10.0

const PANEL_WIDTH := 296.0
const BUTTON_HEIGHT := 56.0
const HOVER_SCALE := 1.04
const HOVER_FADE := 0.22
const EDGE := 24.0

## The compass ribbon: how far either side of the heading it reaches, and how
## far apart the ticks are.
const COMPASS_SPAN := 65.0
const COMPASS_STEP := 15.0

## Navigation, in the reference's order. `real` marks an entry with a system
## behind it; the rest are named on the roadmap and say so when pressed rather
## than opening an empty screen dressed up as a feature.
const ENTRIES := [
	{"id": "play", "glyph": "▶", "title": "لعب",
		"desc": "ابدأ لعبة جديدة أو تابع عالمك", "real": true},
	{"id": "servers", "glyph": "≡", "title": "السيرفرات",
		"desc": "نسخة فردية — لا سيرفرات بعد", "real": false},
	{"id": "character", "glyph": "☗", "title": "الشخصية",
		"desc": "عتادك ودروعك وحالتك", "real": true},
	{"id": "inventory", "glyph": "▣", "title": "المخزون",
		"desc": "إدارة العناصر والأدوات", "real": true},
	{"id": "guide", "glyph": "❖", "title": "الدليل",
		"desc": "تعلّم أساسيات اللعبة", "real": true},
	{"id": "store", "glyph": "⬤", "title": "المتجر",
		"desc": "لا متجر في هذا البناء", "real": false},
	{"id": "events", "glyph": "★", "title": "التحديات",
		"desc": "المهام والمكافآت", "real": true},
	{"id": "controls", "glyph": "◎", "title": "الإعدادات",
		"desc": "خيارات اللعبة والتحكم", "real": true},
	{"id": "credits", "glyph": "✎", "title": "الاعتمادات",
		"desc": "من بنى هذا وكيف", "real": true},
	{"id": "exit", "glyph": "⏻", "title": "خروج",
		"desc": "حفظ وإنهاء اللعبة", "real": true},
]

## The Arabic each survival bar is labelled by. Built against hud.BAR_DEFS so
## the menu can never show a stat the HUD does not, or miss one it has; a stat
## with no translation here simply keeps its own name.
const BAR_NAMES := {
	"health": "الصحة", "hunger": "الجوع", "thirst": "العطش",
	"temperature": "الحرارة", "radiation": "الإشعاع",
	"stamina": "الطاقة", "oxygen": "الأكسجين",
}

const RESOURCES := [
	{"id": "wood", "label": "الخشب"},
	{"id": "stone", "label": "الحجر"},
	{"id": "iron", "label": "خام المعدن"},
	{"id": "scrap", "label": "سكراب"},
	{"id": "cloth", "label": "قماش"},
]

var hud: CanvasLayer
var world: Node3D

var _rig: Node3D
var _camera: Camera3D
var _saved_camera: Camera3D
var _clock := 0.0
var _font: Font

var _logo: Label
var _buttons: Array = []
var _clock_label: Label
var _weather_label: Label
var _compass_box: HBoxContainer
var _compass_signature := ""
var _level_label: Label
var _xp_label: Label
var _xp_bar: ProgressBar
var _vitals: Dictionary = {}
var _resource_labels: Dictionary = {}
var _mission_box: VBoxContainer
var _mission_signature := ""
var _news: Label
var _news_index := 0
var _news_left := 0.0
var _news_cards: Array = []
var _version_label: Label


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	visible = false
	# Godot's bundled font carries no Arabic glyphs, so this whole interface
	# would render as empty boxes. A system font is asked for by name instead,
	# which keeps the project's rule of shipping no binary assets.
	var sys := SystemFont.new()
	sys.font_names = PackedStringArray(["Segoe UI", "Tahoma", "Arial"])
	sys.allow_system_fallback = true
	_font = sys
	_news_cards = _load_news()
	_build()


## The HUD pins its whole tree left-to-right at startup, because the rest of
## the interface is English and would mirror itself on an Arabic install. This
## menu is Arabic and wants exactly the opposite, so it asks for it back.
func apply_rtl() -> void:
	_set_direction(self, Control.LAYOUT_DIRECTION_RTL)


func _set_direction(node: Node, dir: int) -> void:
	if node is Control:
		(node as Control).layout_direction = dir
	for c in node.get_children():
		_set_direction(c, dir)


# ==================== THE VIEW ====================

## A camera on its own node, so panning it cannot disturb the player's camera
## or their spawn. Swapped in when the menu opens, handed back on start.
func _make_rig() -> void:
	if _rig != null:
		return
	_rig = Node3D.new()
	_rig.name = "MenuCameraRig"
	world.add_child(_rig)

	_camera = Camera3D.new()
	_camera.far = 2000.0
	_camera.fov = BASE_FOV
	# Shallow depth of field: the road is sharp, the hills behind it are not,
	# which is what puts the eye where the frame wants it.
	_camera.attributes = CameraAttributesPractical.new()
	var attrs: CameraAttributesPractical = _camera.attributes
	attrs.dof_blur_far_enabled = true
	attrs.dof_blur_far_distance = 70.0
	attrs.dof_blur_far_transition = 40.0
	attrs.dof_blur_amount = 0.06
	_rig.add_child(_camera)
	_aim_rig()


## Frames a highway running away into the distance, which is the composition
## the reference uses and the one this map can reliably produce anywhere along
## its route. Falls back to a landmark, then to the spawn area.
func _aim_rig() -> void:
	var focus := Vector3.ZERO
	var along := Vector2(0, 1)
	var roads = world.roads
	if roads != null and roads.waypoints.size() > 2:
		var i: int = randi() % (int(roads.waypoints.size()) - 1)
		var a: Vector2 = roads.waypoints[i]
		var b: Vector2 = roads.waypoints[i + 1]
		if a.distance_to(b) > 1.0:
			along = (b - a).normalized()
		var at: Vector2 = a.lerp(b, 0.2)
		focus = Vector3(at.x, world.terrain_height(at.x, at.y), at.y)
	elif roads != null and not roads.landmarks.is_empty():
		var pick: Dictionary = roads.landmarks[randi() % roads.landmarks.size()]
		var at2: Vector2 = pick.pos
		focus = Vector3(at2.x, world.terrain_height(at2.x, at2.y), at2.y)

	# Stand back down the road from that point and look along it
	var behind := Vector3(-along.x, 0.0, -along.y) * RIG_BACK
	_rig.global_position = focus + behind + Vector3(0, RIG_HEIGHT, 0)
	_rig.look_at(focus + Vector3(0, 1.0, 0), Vector3.UP)
	_rig.rotation.z = 0.0


func _process(delta: float) -> void:
	if not visible:
		return
	_clock += delta
	_animate_view()
	_animate_logo()
	_animate_news(delta)
	_refresh_live()


## The pan, the breath and the push. All sine waves rather than tweens, so they
## never end, never restart and never need to be told to loop.
func _animate_view() -> void:
	if _rig == null or _camera == null:
		return
	var pan := sin(_clock * TAU / PAN_PERIOD) * deg_to_rad(PAN_DEGREES)
	_camera.rotation.y = pan
	# A touch of counter-roll, so the pan reads as a head turn and not a turret
	_camera.rotation.z = -pan * 0.04
	_camera.position.y = sin(_clock * TAU / BREATH_PERIOD) * BREATH
	_camera.fov = BASE_FOV + sin(_clock * TAU / ZOOM_PERIOD) * ZOOM_DEGREES


func _animate_logo() -> void:
	if _logo == null:
		return
	var pulse := 0.5 + 0.5 * sin(_clock * TAU / LOGO_PULSE_PERIOD)
	# The glow answers the sky: at night it is the brightest thing on screen,
	# at noon it is nearly flat.
	var night := 1.0
	if world != null:
		night = clampf(1.0 - world.sun_strength(), 0.3, 1.0)
	_logo.add_theme_color_override("font_color",
		Color(0.94, 0.95, 0.97).lerp(Game.ACCENT, pulse * night * 0.6))


# ==================== BUILDING BLOCKS ====================

func _label(text: String, size: int, colour: Color,
		align := HORIZONTAL_ALIGNMENT_RIGHT) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_override("font", _font)
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", colour)
	l.horizontal_alignment = align
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l


## Every plate on this screen comes from here, so the whole product re-skins
## from one function rather than from colour literals scattered through the UI.
func _plate() -> PanelContainer:
	var panel := PanelContainer.new()
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.055, 0.06, 0.07, 0.82)
	sb.set_corner_radius_all(Game.CORNER)
	sb.set_border_width_all(1)
	sb.border_color = Color(Game.ACCENT.r, Game.ACCENT.g, Game.ACCENT.b, 0.55)
	sb.set_content_margin_all(12)
	sb.shadow_color = Color(0, 0, 0, 0.5)
	sb.shadow_size = 10
	panel.add_theme_stylebox_override("panel", sb)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return panel


## Pins a control into one region of the screen. Each region gets its own full
## rect margin container, so regions can never push each other around the way
## they would if they shared one container.
func _anchor(node: Control, h: int, v: int) -> void:
	var holder := MarginContainer.new()
	holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	for side in ["left", "right", "top", "bottom"]:
		holder.add_theme_constant_override("margin_" + side, int(EDGE))
	holder.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(holder)
	node.size_flags_horizontal = h
	node.size_flags_vertical = v
	holder.add_child(node)


func _bar(colour: Color, height: int = 12) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.show_percentage = false
	bar.max_value = 100.0
	bar.custom_minimum_size = Vector2(120, height)
	bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_paint_bar(bar, colour)
	return bar


func _paint_bar(bar: ProgressBar, colour: Color) -> void:
	var bg := StyleBoxFlat.new()
	bg.bg_color = Color(0, 0, 0, 0.55)
	bg.set_corner_radius_all(4)
	bar.add_theme_stylebox_override("background", bg)
	var fill := StyleBoxFlat.new()
	fill.bg_color = colour
	fill.set_corner_radius_all(4)
	bar.add_theme_stylebox_override("fill", fill)


# ==================== LAYOUT ====================

func _build() -> void:
	# A thin vignette rather than a blackout: the world behind has to be seen
	var veil := ColorRect.new()
	veil.color = Color(0.02, 0.025, 0.03, 0.30)
	veil.set_anchors_preset(Control.PRESET_FULL_RECT)
	veil.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(veil)

	_build_logo_and_clock()
	_build_compass()
	_build_side_column()
	_build_nav()
	_build_missions()
	_build_news()


## The three right-hand plates share one column rather than each claiming the
## same edge of the screen: anchored separately they would all resolve to the
## same middle and stack on top of one another.
func _build_side_column() -> void:
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 10)
	column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_anchor(column, Control.SIZE_SHRINK_END, Control.SIZE_SHRINK_BEGIN)
	_build_profile(column)
	_build_vitals(column)
	_build_resources(column)


## Top right (the leading edge, reading right to left): the logo plate, and the
## time-and-weather widget beside it.
func _build_logo_and_clock() -> void:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 14)
	row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_anchor(row, Control.SIZE_SHRINK_BEGIN, Control.SIZE_SHRINK_BEGIN)

	var logo_plate := _plate()
	var logo_col := VBoxContainer.new()
	logo_col.add_theme_constant_override("separation", 0)
	logo_col.mouse_filter = Control.MOUSE_FILTER_IGNORE
	logo_plate.add_child(logo_col)
	_logo = _label("RUST", 50, Color(0.94, 0.95, 0.97), HORIZONTAL_ALIGNMENT_CENTER)
	logo_col.add_child(_logo)
	logo_col.add_child(_label("SURVIVAL 3D", 18, Game.ACCENT,
		HORIZONTAL_ALIGNMENT_CENTER))
	row.add_child(logo_plate)

	var clock_plate := _plate()
	var clock_col := VBoxContainer.new()
	clock_col.add_theme_constant_override("separation", 4)
	clock_col.mouse_filter = Control.MOUSE_FILTER_IGNORE
	clock_plate.add_child(clock_col)
	_clock_label = _label("00:00", 22, Game.ACCENT, HORIZONTAL_ALIGNMENT_CENTER)
	clock_col.add_child(_clock_label)
	_weather_label = _label("", 13, Game.TEXT_DIM, HORIZONTAL_ALIGNMENT_CENTER)
	clock_col.add_child(_weather_label)
	row.add_child(clock_plate)


## Top centre: a strip of headings sliding past the middle, the way the
## reference draws it — not one letter, but the degrees either side of where
## the camera is actually pointing.
func _build_compass() -> void:
	var plate := _plate()
	plate.custom_minimum_size = Vector2(420, 0)
	_anchor(plate, Control.SIZE_SHRINK_CENTER, Control.SIZE_SHRINK_BEGIN)
	_compass_box = HBoxContainer.new()
	_compass_box.alignment = BoxContainer.ALIGNMENT_CENTER
	_compass_box.add_theme_constant_override("separation", 10)
	_compass_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	plate.add_child(_compass_box)


## Who you are and how far you have got. The level and the bar are real
## experience, earned from the same reports the missions read.
func _build_profile(into: VBoxContainer) -> void:
	var plate := _plate()
	into.add_child(plate)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	plate.add_child(row)

	# Portrait: a plate with an initial rather than a rendered head, because
	# there is no character model worth framing yet and a blank box is honest.
	var portrait := PanelContainer.new()
	portrait.custom_minimum_size = Vector2(60, 60)
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.10, 0.11, 0.13, 0.95)
	sb.set_corner_radius_all(Game.CORNER_SMALL)
	sb.set_border_width_all(1)
	sb.border_color = Game.ACCENT
	portrait.add_theme_stylebox_override("panel", sb)
	portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var initial := _label("S", 28, Game.ACCENT, HORIZONTAL_ALIGNMENT_CENTER)
	initial.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	portrait.add_child(initial)
	row.add_child(portrait)

	var text := VBoxContainer.new()
	text.add_theme_constant_override("separation", 2)
	text.mouse_filter = Control.MOUSE_FILTER_IGNORE
	text.add_child(_label("Survivor", 19, Color(0.94, 0.95, 0.97)))
	_level_label = _label("", 13, Game.ACCENT)
	text.add_child(_level_label)
	_xp_bar = _bar(Game.ACCENT, 8)
	_xp_bar.custom_minimum_size = Vector2(180, 8)
	text.add_child(_xp_bar)
	_xp_label = _label("", 11, Game.TEXT_DIM)
	text.add_child(_xp_label)
	row.add_child(text)


## Under the profile: the survival bars, each a row of label, bar and figure.
func _build_vitals(into: VBoxContainer) -> void:
	var plate := _plate()
	plate.custom_minimum_size = Vector2(310, 0)
	into.add_child(plate)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 6)
	column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	plate.add_child(column)

	for def in hud.BAR_DEFS:
		var stat := str(def[0])
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 10)
		row.mouse_filter = Control.MOUSE_FILTER_IGNORE

		var name_label := _label(str(BAR_NAMES.get(stat, stat.capitalize())),
			14, Game.TEXT)
		name_label.custom_minimum_size = Vector2(72, 0)
		row.add_child(name_label)

		var bar := _bar(def[1])
		bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(bar)

		var value := _label("", 14, Color(0.94, 0.95, 0.97),
			HORIZONTAL_ALIGNMENT_LEFT)
		value.custom_minimum_size = Vector2(40, 0)
		row.add_child(value)

		column.add_child(row)
		_vitals[stat] = {"bar": bar, "value": value, "colour": def[1]}


## Under the bars: what you are carrying, live.
func _build_resources(into: VBoxContainer) -> void:
	var plate := _plate()
	plate.custom_minimum_size = Vector2(310, 0)
	into.add_child(plate)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 5)
	column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	plate.add_child(column)
	column.add_child(_label("الموارد الحالية", 14, Game.ACCENT))

	for def in RESOURCES:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 10)
		row.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var name_label := _label(str(def.label), 14, Game.TEXT)
		name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(name_label)
		var count := _label("0", 16, Color(0.94, 0.95, 0.97),
			HORIZONTAL_ALIGNMENT_LEFT)
		count.custom_minimum_size = Vector2(62, 0)
		row.add_child(count)
		column.add_child(row)
		_resource_labels[str(def.id)] = count


## The navigation column. Each entry is an icon, a title and the line of
## description the reference puts under it.
func _build_nav() -> void:
	var plate := _plate()
	plate.custom_minimum_size = Vector2(PANEL_WIDTH, 0)
	_anchor(plate, Control.SIZE_SHRINK_BEGIN, Control.SIZE_SHRINK_CENTER)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 4)
	plate.add_child(column)

	for entry in ENTRIES:
		var b := Button.new()
		b.custom_minimum_size = Vector2(PANEL_WIDTH - 24.0, BUTTON_HEIGHT)
		b.focus_mode = Control.FOCUS_NONE
		_style_button(b, false)

		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 12)
		row.set_anchors_preset(Control.PRESET_FULL_RECT)
		row.mouse_filter = Control.MOUSE_FILTER_IGNORE

		var glyph := _label(str(entry.glyph), 21, Game.ACCENT,
			HORIZONTAL_ALIGNMENT_CENTER)
		glyph.custom_minimum_size = Vector2(32, 0)
		glyph.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		row.add_child(glyph)

		var text := VBoxContainer.new()
		text.add_theme_constant_override("separation", 0)
		text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		text.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		text.mouse_filter = Control.MOUSE_FILTER_IGNORE
		text.add_child(_label(str(entry.title), 17, Color(0.94, 0.95, 0.97)))
		text.add_child(_label(str(entry.desc), 11, Game.TEXT_DIM))
		row.add_child(text)

		b.add_child(row)
		# Greyed rather than hidden: the roadmap stays visible, and pressing one
		# says plainly that it is not built yet.
		if not bool(entry.get("real", true)):
			b.modulate.a = 0.5
		b.pressed.connect(_on_entry.bind(str(entry.id), b))
		b.mouse_entered.connect(_on_hover.bind(b, true))
		b.mouse_exited.connect(_on_hover.bind(b, false))
		column.add_child(b)
		_buttons.append(b)


func _style_button(b: Button, lit: bool) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.115, 0.125, 0.14, 0.92) if lit \
		else Color(0.075, 0.08, 0.09, 0.78)
	sb.set_corner_radius_all(Game.CORNER_SMALL)
	sb.set_content_margin_all(8)
	sb.set_border_width_all(1)
	sb.border_color = Game.ACCENT if lit else Color(1, 1, 1, 0.07)
	if lit:
		sb.shadow_color = Color(Game.ACCENT.r, Game.ACCENT.g, Game.ACCENT.b, 0.30)
		sb.shadow_size = 8
	for state in ["normal", "hover", "pressed"]:
		b.add_theme_stylebox_override(state, sb)


## Grows and brightens under the pointer. The pivot is set to the button's own
## middle first, or it would grow out of its corner and drift.
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
	tw.tween_property(b, "scale", Vector2(0.96, 0.96), 0.07)
	tw.tween_property(b, "scale", Vector2.ONE, 0.14)
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
		"character", "inventory":
			# Both open the one screen that holds a loadout and what is worn
			hud.start_game()
			hud.toggle_inventory()
		"events":
			var lines := "الطقس: %s\n\n" % world.weather.state_name()
			for m in world.missions.active:
				lines += "%s — %d / %d\n" % [m.name, int(m.progress), int(m.target)]
			Game.notify(lines.strip_edges(), Game.ACCENT)
		"exit":
			world.save_game()
			get_tree().quit()
		_:
			# Servers and Store: named on the roadmap, not built.
			Game.notify("%s غير متاح في هذا البناء" % _title_of(id),
				Color(1.0, 0.63, 0.0))


func _title_of(id: String) -> String:
	for entry in ENTRIES:
		if str(entry.id) == id:
			return str(entry.title)
	return id


## The day's jobs, with a fraction and a bar each.
func _build_missions() -> void:
	var plate := _plate()
	plate.custom_minimum_size = Vector2(330, 0)
	_anchor(plate, Control.SIZE_SHRINK_END, Control.SIZE_SHRINK_END)
	_mission_box = VBoxContainer.new()
	_mission_box.add_theme_constant_override("separation", 4)
	_mission_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	plate.add_child(_mission_box)


## The changelog, read from a file in the repository so it is the real one
## rather than filler typed into the interface.
func _build_news() -> void:
	var plate := _plate()
	plate.custom_minimum_size = Vector2(350, 0)
	_anchor(plate, Control.SIZE_SHRINK_BEGIN, Control.SIZE_SHRINK_END)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 4)
	column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	plate.add_child(column)
	column.add_child(_label("أخبار اللعبة", 15, Game.ACCENT))
	_version_label = _label("", 12, Game.TEXT_DIM)
	column.add_child(_version_label)
	_news = _label("", 13, Game.TEXT)
	_news.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_news.custom_minimum_size = Vector2(320, 44)
	column.add_child(_news)


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
		return
	_news_left -= delta
	if _news_left > 0.0:
		return
	_news_left = NEWS_PERIOD
	_news.text = str(_news_cards[_news_index % _news_cards.size()])
	_news_index += 1
	_news.modulate.a = 0.0
	create_tween().tween_property(_news, "modulate:a", 1.0, 0.45)


# ==================== LIVE READINGS ====================

func _refresh_live() -> void:
	if world == null:
		return
	_refresh_compass()
	_refresh_clock()
	_refresh_profile()
	_refresh_vitals()
	for id in _resource_labels:
		_resource_labels[id].text = str(Game.get_count(id))
	_refresh_missions()
	if _version_label != null:
		_version_label.text = "الإصدار %s" % _version()


## The ribbon: ticks either side of where the camera is pointing, with the one
## nearest the middle picked out in the accent. Rebuilt only when a reading
## actually changed — recreating ten labels a frame is how a phone loses its
## frame rate.
func _refresh_compass() -> void:
	if _compass_box == null or _camera == null or _rig == null:
		return
	var MapUi = load("res://scripts/map_ui.gd")
	var heading: float = fmod(rad_to_deg(-(_rig.rotation.y + _camera.rotation.y))
		+ 360.0, 360.0)

	var wanted := []
	var first := snappedf(heading - COMPASS_SPAN, COMPASS_STEP)
	var steps := int(COMPASS_SPAN * 2.0 / COMPASS_STEP) + 1
	for i in steps:
		var deg := fmod(first + float(i) * COMPASS_STEP + 360.0, 360.0)
		var off := absf(rad_to_deg(angle_difference(
			deg_to_rad(deg), deg_to_rad(heading))))
		# Cardinal and inter-cardinal points get their name, the rest a number
		var text := str(int(round(deg)))
		if int(round(deg)) % 45 == 0:
			text = MapUi.heading_of(-deg_to_rad(deg))
		wanted.append({"text": text, "lit": off < COMPASS_STEP * 0.5})

	var signature := ""
	for w in wanted:
		signature += "%s%s|" % [w.text, "*" if w.lit else ""]
	if signature == _compass_signature:
		return
	_compass_signature = signature

	for c in _compass_box.get_children():
		c.queue_free()
	for w in wanted:
		var l := _label(str(w.text), 18 if w.lit else 13,
			Game.ACCENT if w.lit else Game.TEXT_DIM, HORIZONTAL_ALIGNMENT_CENTER)
		l.custom_minimum_size = Vector2(38, 24)
		_compass_box.add_child(l)
	# Headings are numbers and Latin letters: this one strip reads left to right
	# even on an Arabic screen, or 330 would be drawn to the right of 345.
	hud.force_ltr(_compass_box)


func _refresh_clock() -> void:
	if _clock_label == null:
		return
	var hour := int(Game.day_time / Game.DAY_LENGTH * 24.0)
	var minute := int(fmod(Game.day_time / Game.DAY_LENGTH * 1440.0, 60.0))
	_clock_label.text = "%02d:%02d" % [hour, minute]
	if _weather_label != null and world.weather != null:
		_weather_label.text = "%s · رياح %d%%" % [
			world.weather.state_name(), roundi(world.wind_strength() * 100.0)]
		# Colour-coded against something real: how survivable it is out there.
		var harsh: float = clampf(world.weather.chill() / 26.0, 0.0, 1.0)
		_weather_label.add_theme_color_override("font_color",
			Color(0.45, 0.85, 0.5).lerp(Color(0.95, 0.45, 0.35), harsh))


func _refresh_profile() -> void:
	if _level_label == null:
		return
	_level_label.text = "المستوى %d" % Game.level
	_xp_bar.value = Game.level_progress() * 100.0
	_xp_label.text = "%d / %d XP" % [Game.xp, Game.xp_to_next(Game.level)]


func _refresh_vitals() -> void:
	for stat in _vitals:
		var row: Dictionary = _vitals[stat]
		var v: float = clampf(float(Game.stats.get(stat, 0.0)), 0.0, 100.0)
		row.bar.value = v
		row.value.text = "%d" % roundi(v)
		# The colour answers the reading: any bar in trouble goes red, and for
		# radiation "trouble" is the bar being full rather than empty.
		var danger: float = v / 100.0 if stat == "radiation" else 1.0 - v / 100.0
		_paint_bar(row.bar, Color(row.colour).lerp(Color(0.92, 0.28, 0.22),
			clampf((danger - 0.6) * 2.5, 0.0, 1.0)))


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
	_mission_box.add_child(_label("المهام اليومية", 15, Game.ACCENT))

	for m in world.missions.active:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 8)
		row.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var name_label := _label(str(m.name), 13,
			Game.ACCENT if m.done else Game.TEXT)
		name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(name_label)
		var frac := _label("%d / %d" % [int(m.progress), int(m.target)], 13,
			Game.TEXT_DIM, HORIZONTAL_ALIGNMENT_LEFT)
		frac.custom_minimum_size = Vector2(66, 0)
		row.add_child(frac)
		_mission_box.add_child(row)

		var bar := _bar(Game.ACCENT if m.done else Game.ACCENT_DIM, 7)
		bar.max_value = maxf(1.0, float(m.target))
		bar.value = float(m.progress)
		_mission_box.add_child(bar)

	# Pointed the right way again after every rebuild: the HUD only pins its
	# tree once, at startup, so rows created later would face the wrong way.
	_set_direction(_mission_box, Control.LAYOUT_DIRECTION_RTL)


## Read from the project settings rather than a file beside the project: res://
## cannot climb above the project root, so the version has to be somewhere
## Godot itself already knows about.
func _version() -> String:
	var v = ProjectSettings.get_setting("application/config/version", "")
	return str(v) if str(v) != "" else "1.0"


# ==================== OPEN / CLOSE ====================

func open() -> void:
	_make_rig()
	_aim_rig()
	_clock = 0.0
	_news_left = 0.0
	_mission_signature = ""
	_compass_signature = ""
	# Take the view, remembering whose it was — but never remembering our own
	# camera as the one to give it back to. Opening the menu twice used to
	# record the rig as the thing to restore, so starting the game left the
	# player looking through it.
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
