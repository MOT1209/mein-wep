extends Control
## The map screen (M) and the compass strip.
##
## The terrain is a static, unseeded function, so the map image is the same
## on every run and every world: it gets rendered once into a texture at
## startup and never again. Only the markers move.

const WorldScript := preload("res://scripts/world.gd")

## Pixels across the rendered map. The world is 400m, so this is 2m a pixel.
const MAP_PIXELS := 200

var world: Node3D

var _texture: ImageTexture
var _map_rect: TextureRect
var _markers: Control
var _panel: PanelContainer


## Builds itself on entering the tree; `world` is handed over afterwards,
## the same way the HUD gets its own reference.
func _ready() -> void:
	visible = false
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP

	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0.72)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(dim)

	var centre := CenterContainer.new()
	centre.set_anchors_preset(Control.PRESET_FULL_RECT)
	centre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(centre)

	_panel = PanelContainer.new()
	centre.add_child(_panel)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 8)
	_panel.add_child(column)

	var title := Label.new()
	title.text = "MAP"
	title.add_theme_font_size_override("font_size", 20)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	column.add_child(title)

	# The map image and its markers share one square, so marker positions
	# are just the map's own pixel coordinates.
	var frame := Control.new()
	frame.custom_minimum_size = Vector2(MAP_PIXELS * 2, MAP_PIXELS * 2)
	column.add_child(frame)

	_map_rect = TextureRect.new()
	_map_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	_map_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_map_rect.stretch_mode = TextureRect.STRETCH_SCALE
	_map_rect.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	frame.add_child(_map_rect)

	_markers = Control.new()
	_markers.set_anchors_preset(Control.PRESET_FULL_RECT)
	_markers.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_markers.draw.connect(_draw_markers)
	frame.add_child(_markers)

	var legend := Label.new()
	legend.text = "you · radiation · bed · cupboard · your bag       M to close"
	legend.add_theme_font_size_override("font_size", 12)
	legend.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	column.add_child(legend)

	_render_terrain()


## Draws the whole world once. terrain_height and _terrain_color are static
## and unseeded, so this image is correct for the life of the project.
func _render_terrain() -> void:
	var img := Image.create(MAP_PIXELS, MAP_PIXELS, false, Image.FORMAT_RGB8)
	var span := Game.WORLD_SIZE
	for py in MAP_PIXELS:
		for px in MAP_PIXELS:
			var wx := (float(px) / MAP_PIXELS - 0.5) * span
			var wz := (float(py) / MAP_PIXELS - 0.5) * span
			var h: float = WorldScript.terrain_height(wx, wz)
			var c: Color = WorldScript._terrain_color(h)
			if h < WorldScript.WATER_LEVEL:
				c = Color(0.16, 0.32, 0.48)
			# A touch of shading so hills read as hills
			var north: float = WorldScript.terrain_height(wx, wz - 2.0)
			c = c.lightened(clampf((h - north) * 0.08, -0.25, 0.25))
			img.set_pixel(px, py, c)
	_texture = ImageTexture.create_from_image(img)
	_map_rect.texture = _texture


## World position to a point inside the drawn square.
func world_to_map(pos: Vector3) -> Vector2:
	var square := _markers.size
	if square.x <= 0.0:
		square = Vector2(MAP_PIXELS * 2, MAP_PIXELS * 2)
	return Vector2(
		(pos.x / Game.WORLD_SIZE + 0.5) * square.x,
		(pos.z / Game.WORLD_SIZE + 0.5) * square.y)


func _draw_markers() -> void:
	if world == null:
		return

	for zone in world.rad_zones:
		var p := world_to_map(Vector3(zone.x, 0, zone.y))
		var r: float = Game.RAD_ZONE_RADIUS / Game.WORLD_SIZE * _markers.size.x
		_markers.draw_circle(p, r, Color(0.95, 0.85, 0.2, 0.22))
		_markers.draw_arc(p, r, 0.0, TAU, 24, Color(0.95, 0.85, 0.2, 0.7), 1.5)

	for st in world.stations:
		if not is_instance_valid(st):
			continue
		if st.station_type == "sleeping_bag":
			_dot(st.position, Color(0.55, 0.85, 0.4), 5.0)
	for tc in Game.tool_cupboards:
		_dot(Vector3(tc.x, 0, tc.y), Color(0.4, 0.7, 0.95), 4.0)

	# The bag you are trying to get back to is the whole reason for a map
	for bag in world.bags:
		if is_instance_valid(bag) and not bag.is_empty():
			_dot(bag.position, Color(1.0, 0.65, 0.2), 6.0)

	if world.player != null:
		var me := world_to_map(world.player.position)
		_markers.draw_circle(me, 5.0, Color(1, 1, 1))
		# A stub pointing the way you are facing
		var facing: Vector3 = -world.player.global_transform.basis.z
		_markers.draw_line(me,
			me + Vector2(facing.x, facing.z).normalized() * 14.0,
			Color(1, 1, 1), 2.0)


func _dot(pos: Vector3, color: Color, radius: float) -> void:
	var p := world_to_map(pos)
	_markers.draw_circle(p, radius, color)
	_markers.draw_arc(p, radius, 0.0, TAU, 16, Color(0, 0, 0, 0.6), 1.0)


func open() -> void:
	visible = true
	_markers.queue_redraw()
	Game.set_ui("map")


func close() -> void:
	visible = false
	Game.set_ui("")


func toggle() -> void:
	if visible:
		close()
	elif Game.ui_open == "":
		open()


func _process(_delta: float) -> void:
	if visible:
		_markers.queue_redraw()


## Heading text for the compass strip: which way the player is looking.
static func heading_of(yaw: float) -> String:
	var deg := fmod(rad_to_deg(-yaw) + 360.0, 360.0)
	var points := ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
	return points[int(round(deg / 45.0)) % 8]
