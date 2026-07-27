extends Control
## Inventory + Crafting screen (Rust-style, built in code): crafting tab
## with category filter / detail panel / craft queue-less instant crafting,
## inventory tab with 30 slots and 6-slot belt assignment.

const IconFactory := preload("res://scripts/icon_factory.gd")

const RARITY_COLORS := {
	"common": Color(0.75, 0.75, 0.75),
	"rare": Color(0.39, 0.71, 0.96),
	"elite": Color(1.0, 0.72, 0.3),
}

var selected_category := "common"
var selected_item := ""
var craft_qty := 1

var _tab_craft_btn: Button
var _tab_inv_btn: Button
var _craft_pane: HBoxContainer
var _inv_pane: VBoxContainer
var _craft_grid: GridContainer
var _detail_box: VBoxContainer
var _inv_grid: GridContainer
var _slot_label: Label
var _belt_row: HBoxContainer


## Blurs and darkens whatever is behind the panel, instead of flatly
## covering it — the world stays readable but recedes.
const BACKDROP_SHADER := "
shader_type canvas_item;
uniform sampler2D screen_tex : hint_screen_texture, filter_linear_mipmap;
uniform float blur : hint_range(0.0, 5.0) = 2.6;
uniform vec3 tint : source_color = vec3(0.04, 0.04, 0.05);
uniform float darkness : hint_range(0.0, 1.0) = 0.55;
void fragment() {
	vec3 c = textureLod(screen_tex, SCREEN_UV, blur).rgb;
	COLOR = vec4(mix(c, tint, darkness), 1.0);
}
"

const SCREEN_MARGIN := 44.0
## Compact icon tiles; the item's name lives in the tooltip and in the
## detail panel, which keeps the grid readable at any resolution.
const SLOT_SIZE := Vector2(80, 80)
const BELT_SLOT_SIZE := Vector2(64, 64)
const PANEL_MIN := Vector2(900, 540)


func _ready() -> void:
	visible = false
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP

	var backdrop := ColorRect.new()
	backdrop.set_anchors_preset(Control.PRESET_FULL_RECT)
	var shader := Shader.new()
	shader.code = BACKDROP_SHADER
	var mat := ShaderMaterial.new()
	mat.shader = shader
	backdrop.material = mat
	add_child(backdrop)

	# Keeps the panel clear of every screen edge, including the stats
	# readout pinned to the top-right corner.
	var margins := MarginContainer.new()
	margins.set_anchors_preset(Control.PRESET_FULL_RECT)
	for side in ["left", "right", "top", "bottom"]:
		margins.add_theme_constant_override("margin_" + side, int(SCREEN_MARGIN))
	add_child(margins)

	var center := CenterContainer.new()
	margins.add_child(center)

	var panel := PanelContainer.new()
	panel.custom_minimum_size = PANEL_MIN
	_style_window(panel)
	center.add_child(panel)

	var pad := MarginContainer.new()
	for side in ["left", "right", "top", "bottom"]:
		pad.add_theme_constant_override("margin_" + side, 16)
	panel.add_child(pad)

	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 10)
	pad.add_child(root)

	# Tabs
	var tabs := HBoxContainer.new()
	tabs.add_theme_constant_override("separation", 8)
	_tab_inv_btn = Button.new()
	_tab_inv_btn.text = "INVENTORY"
	_tab_inv_btn.custom_minimum_size = Vector2(160, 36)
	_tab_inv_btn.pressed.connect(_show_tab.bind("inventory"))
	tabs.add_child(_tab_inv_btn)
	_tab_craft_btn = Button.new()
	_tab_craft_btn.text = "CRAFTING"
	_tab_craft_btn.custom_minimum_size = Vector2(160, 36)
	_tab_craft_btn.pressed.connect(_show_tab.bind("crafting"))
	tabs.add_child(_tab_craft_btn)
	root.add_child(tabs)

	_build_craft_pane(root)
	_build_inv_pane(root)

	var footer := Label.new()
	footer.text = "[E / ESC] CLOSE     [LMB] SELECT     Right-click belt slot to clear"
	footer.add_theme_font_size_override("font_size", 12)
	footer.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
	root.add_child(footer)

	Game.inventory_changed.connect(_on_inventory_changed)


func _style_window(panel: PanelContainer) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.06, 0.06, 0.07, 0.88)
	sb.border_color = Color(0.8, 0.36, 0.17, 0.9)
	sb.set_border_width_all(2)
	sb.set_corner_radius_all(8)
	panel.add_theme_stylebox_override("panel", sb)


## Compact icon tile. `corner` is a short overlay (a stack count); the full
## name goes in the tooltip so the grid stays uncluttered.
func _make_slot(id: String, corner: String, tooltip: String) -> Button:
	var b := Button.new()
	b.custom_minimum_size = SLOT_SIZE
	b.icon = IconFactory.get_icon(id)
	b.expand_icon = true
	b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
	b.vertical_icon_alignment = VERTICAL_ALIGNMENT_CENTER
	b.tooltip_text = tooltip
	if corner != "":
		var lab := Label.new()
		lab.text = corner
		lab.add_theme_font_size_override("font_size", 11)
		lab.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.9))
		lab.add_theme_constant_override("outline_size", 4)
		lab.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
		lab.grow_horizontal = Control.GROW_DIRECTION_BEGIN
		lab.grow_vertical = Control.GROW_DIRECTION_BEGIN
		lab.offset_right = -4
		lab.offset_bottom = -2
		lab.mouse_filter = Control.MOUSE_FILTER_IGNORE
		b.add_child(lab)
	return b


func _build_craft_pane(root: VBoxContainer) -> void:
	_craft_pane = HBoxContainer.new()
	_craft_pane.add_theme_constant_override("separation", 10)
	_craft_pane.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(_craft_pane)

	# Category sidebar
	var cats := VBoxContainer.new()
	cats.custom_minimum_size = Vector2(150, 0)
	for cat in Game.CATEGORIES:
		var b := Button.new()
		b.text = cat.to_upper()
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.pressed.connect(_on_category.bind(cat))
		cats.add_child(b)
	_craft_pane.add_child(cats)

	# Craftable item grid
	var scroll := ScrollContainer.new()
	scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_craft_grid = GridContainer.new()
	_craft_grid.columns = 6
	_craft_grid.add_theme_constant_override("h_separation", 6)
	_craft_grid.add_theme_constant_override("v_separation", 6)
	_craft_grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(_craft_grid)
	_craft_pane.add_child(scroll)

	# Detail panel
	var detail_panel := PanelContainer.new()
	detail_panel.custom_minimum_size = Vector2(280, 0)
	_detail_box = VBoxContainer.new()
	_detail_box.add_theme_constant_override("separation", 6)
	detail_panel.add_child(_detail_box)
	_craft_pane.add_child(detail_panel)


func _build_inv_pane(root: VBoxContainer) -> void:
	_inv_pane = VBoxContainer.new()
	_inv_pane.add_theme_constant_override("separation", 10)
	_inv_pane.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(_inv_pane)

	var hint := Label.new()
	hint.text = "Click an item to equip it into the selected belt slot. Armour is worn."
	hint.add_theme_font_size_override("font_size", 13)
	_inv_pane.add_child(hint)

	# Space is finite now, so how much is left has to be on screen
	_slot_label = Label.new()
	_slot_label.add_theme_font_size_override("font_size", 13)
	_inv_pane.add_child(_slot_label)

	_inv_grid = GridContainer.new()
	_inv_grid.columns = 8
	_inv_grid.add_theme_constant_override("h_separation", 6)
	_inv_grid.add_theme_constant_override("v_separation", 6)
	_inv_pane.add_child(_inv_grid)

	var belt_label := Label.new()
	belt_label.text = "BELT"
	_inv_pane.add_child(belt_label)

	_belt_row = HBoxContainer.new()
	_belt_row.add_theme_constant_override("separation", 6)
	_inv_pane.add_child(_belt_row)

	_inv_pane.visible = false


func open() -> void:
	visible = true
	Game.set_ui("inventory")
	_show_tab("crafting")


func close() -> void:
	visible = false
	Game.set_ui("")


func _show_tab(tab: String) -> void:
	_craft_pane.visible = tab == "crafting"
	_inv_pane.visible = tab == "inventory"
	_tab_craft_btn.disabled = tab == "crafting"
	_tab_inv_btn.disabled = tab == "inventory"
	if tab == "crafting":
		_refresh_craft_grid()
		_refresh_detail()
	else:
		_refresh_inventory()


func _on_category(cat: String) -> void:
	selected_category = cat
	_refresh_craft_grid()


func _on_inventory_changed() -> void:
	if not visible:
		return
	if _craft_pane.visible:
		_refresh_detail()
	if _inv_pane.visible:
		_refresh_inventory()


# ==================== CRAFTING ====================

func _refresh_craft_grid() -> void:
	for c in _craft_grid.get_children():
		c.queue_free()
	for id in Game.ITEMS:
		var item: Dictionary = Game.ITEMS[id]
		if not item.has("recipe"):
			continue
		if selected_category != "common" and item.category != selected_category:
			continue
		var b := _make_slot(id, "", "%s\n%s" % [item.name, item.desc])
		b.self_modulate = RARITY_COLORS.get(item.get("rarity", "common"), Color.WHITE)
		b.pressed.connect(_on_craft_item_selected.bind(id))
		_craft_grid.add_child(b)


func _on_craft_item_selected(id: String) -> void:
	selected_item = id
	craft_qty = 1
	_refresh_detail()


func _refresh_detail() -> void:
	for c in _detail_box.get_children():
		c.queue_free()
	if selected_item == "" or not Game.ITEMS.has(selected_item):
		var empty := Label.new()
		empty.text = "Select an item to craft"
		empty.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
		_detail_box.add_child(empty)
		return

	var item: Dictionary = Game.ITEMS[selected_item]

	var title := Label.new()
	title.text = item.name
	title.add_theme_font_size_override("font_size", 20)
	title.add_theme_color_override("font_color", RARITY_COLORS.get(item.get("rarity", "common"), Color.WHITE))
	_detail_box.add_child(title)

	var desc := Label.new()
	desc.text = item.desc
	desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	desc.custom_minimum_size = Vector2(260, 0)
	desc.add_theme_font_size_override("font_size", 13)
	_detail_box.add_child(desc)

	var can_craft := true
	var bench := Game.required_workbench(selected_item)
	if bench > 0:
		var bench_line := Label.new()
		bench_line.text = "Requires Workbench Level %d" % bench
		bench_line.add_theme_font_size_override("font_size", 13)
		if Game.workbench_level < bench:
			can_craft = false
			bench_line.add_theme_color_override("font_color", Color(0.9, 0.35, 0.35))
		else:
			bench_line.add_theme_color_override("font_color", Color(0.4, 0.85, 0.4))
		_detail_box.add_child(bench_line)

	for res in item.recipe:
		var needed: int = int(item.recipe[res]) * craft_qty
		var have := Game.get_count(res)
		var line := Label.new()
		var res_name: String = Game.ITEMS[res].name if Game.ITEMS.has(res) else res
		line.text = "%d x %s   (have %d)" % [needed, res_name, have]
		line.add_theme_font_size_override("font_size", 13)
		if have < needed:
			can_craft = false
			line.add_theme_color_override("font_color", Color(0.9, 0.35, 0.35))
		_detail_box.add_child(line)

	var qty_row := HBoxContainer.new()
	qty_row.add_theme_constant_override("separation", 8)
	var minus := Button.new()
	minus.text = "-"
	minus.custom_minimum_size = Vector2(36, 32)
	minus.pressed.connect(func():
		craft_qty = maxi(1, craft_qty - 1)
		_refresh_detail())
	qty_row.add_child(minus)
	var qty_label := Label.new()
	qty_label.text = str(craft_qty)
	qty_label.custom_minimum_size = Vector2(40, 0)
	qty_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	qty_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	qty_row.add_child(qty_label)
	var plus := Button.new()
	plus.text = "+"
	plus.custom_minimum_size = Vector2(36, 32)
	plus.pressed.connect(func():
		craft_qty += 1
		_refresh_detail())
	qty_row.add_child(plus)
	_detail_box.add_child(qty_row)

	var craft_btn := Button.new()
	craft_btn.text = "CRAFT" if Game.workbench_level >= bench else "LOCKED"
	craft_btn.custom_minimum_size = Vector2(120, 40)
	craft_btn.disabled = not can_craft
	craft_btn.pressed.connect(func():
		Game.craft(selected_item, craft_qty)
		_refresh_detail())
	_detail_box.add_child(craft_btn)


# ==================== INVENTORY ====================

func _refresh_inventory() -> void:
	for c in _inv_grid.get_children():
		c.queue_free()
	var used := Game.slots_used()
	_slot_label.text = "%d / %d slots used" % [used, Game.INVENTORY_SLOTS]
	_slot_label.add_theme_color_override("font_color",
		Color(0.95, 0.5, 0.35) if used >= Game.INVENTORY_SLOTS else Color(0.7, 0.75, 0.8))
	var shown := 0
	for id in Game.inventory:
		if shown >= Game.INVENTORY_SLOTS:
			break
		var count := Game.get_count(id)
		if count <= 0:
			continue
		var item: Dictionary = Game.ITEMS.get(id, {})
		var hint: String = item.get("desc", "")
		hint += "\n%d per slot — using %d" % [
			Game.stack_size(id), Game.slots_used_by(id, count)]
		if Game.ARMOUR.has(id):
			hint += "\n[Worn — click to take off]" if Game.is_worn(id) else "\n[Click to wear]"
		var b := _make_slot(id, str(count), "%s\n%s" % [item.get("name", id), hint])
		b.self_modulate = RARITY_COLORS.get(item.get("rarity", "common"), Color.WHITE)
		if id in Game.belt:
			b.self_modulate = Color(1.3, 1.1, 0.5)
		if Game.is_worn(id):
			b.self_modulate = Color(0.6, 1.4, 0.7)
		b.pressed.connect(_on_inventory_item.bind(id))
		_inv_grid.add_child(b)
		shown += 1
	_refresh_belt()


func _on_inventory_item(id: String) -> void:
	# Armour is worn, not held: clicking a piece puts it on or takes it off,
	# and it never touches the belt.
	if Game.ARMOUR.has(id):
		Game.wear(id)
		Sfx.play("ui_click")
		_refresh_inventory()
		return
	Game.belt[Game.selected_belt_slot] = id
	Game.belt_changed.emit()
	Sfx.play("ui_click")
	_refresh_inventory()


func _refresh_belt() -> void:
	for c in _belt_row.get_children():
		c.queue_free()
	for i in 6:
		var b := Button.new()
		var id = Game.belt[i]
		b.custom_minimum_size = BELT_SLOT_SIZE
		b.tooltip_text = "Belt slot %d" % (i + 1)
		if id is String and Game.ITEMS.has(id):
			b.icon = IconFactory.get_icon(id)
			b.expand_icon = true
			b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
			b.vertical_icon_alignment = VERTICAL_ALIGNMENT_CENTER
			b.tooltip_text = "%d — %s" % [i + 1, Game.ITEMS[id].name]
		else:
			b.text = str(i + 1)
			b.add_theme_font_size_override("font_size", 12)
		if Game.selected_belt_slot == i:
			b.self_modulate = Color(1.5, 1.3, 0.6)
		b.pressed.connect(func():
			Game.selected_belt_slot = i
			Game.belt_changed.emit()
			_refresh_inventory())
		b.gui_input.connect(func(event: InputEvent):
			if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_RIGHT:
				Game.belt[i] = null
				Game.belt_changed.emit()
				_refresh_inventory())
		_belt_row.add_child(b)
