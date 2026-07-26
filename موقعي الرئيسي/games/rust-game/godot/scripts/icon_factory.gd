extends Object
## Generates simple pictogram icons for items at runtime, so the UI has
## real icons without shipping any image assets. One shape per item
## category, tinted with the item's own colour, with a dark outline so it
## reads on any background. Textures are cached per item id.

const SIZE := 32
const OUTLINE := Color(0.05, 0.05, 0.06, 0.9)

static var _cache: Dictionary = {}


static func get_icon(item_id: String) -> ImageTexture:
	if _cache.has(item_id):
		return _cache[item_id]
	var tex := ImageTexture.create_from_image(make_image(item_id))
	_cache[item_id] = tex
	return tex


## Exposed separately from get_icon so the pixels can be inspected without
## going through the rendering server.
static func make_image(item_id: String) -> Image:
	var item: Dictionary = Game.ITEMS.get(item_id, {})
	return _draw(_shape_for(str(item.get("category", "items"))), _color_of(item))


static func _color_of(item: Dictionary) -> Color:
	var hex := str(item.get("color", "cccccc"))
	if Color.html_is_valid(hex):
		return Color.html(hex)
	return Color(0.8, 0.8, 0.8)


static func _shape_for(category: String) -> String:
	match category:
		"tools": return "tool"
		"weapons": return "blade"
		"medical": return "cross"
		"construction": return "frame"
		"resources": return "gem"
		_: return "diamond"


static func _draw(shape: String, color: Color) -> Image:
	var img := Image.create(SIZE, SIZE, false, Image.FORMAT_RGBA8)
	img.fill(Color(0, 0, 0, 0))
	var c := SIZE * 0.5 - 0.5
	var r := SIZE * 0.36
	for y in SIZE:
		for x in SIZE:
			var fx := float(x) - c
			var fy := float(y) - c
			if _inside(shape, fx, fy, r):
				# Vertical gradient: lighter at the top, darker at the bottom
				var t := float(y) / float(SIZE)
				img.set_pixel(x, y, color.lightened(0.25 - t * 0.45))
			elif _inside(shape, fx, fy, r + 1.6):
				img.set_pixel(x, y, OUTLINE)
	return img


static func _inside(shape: String, fx: float, fy: float, r: float) -> bool:
	match shape:
		"gem":
			return sqrt(fx * fx + fy * fy) <= r
		"diamond":
			return absf(fx) + absf(fy) <= r * 1.3
		"cross":
			return (absf(fx) <= r * 0.34 and absf(fy) <= r) \
				or (absf(fy) <= r * 0.34 and absf(fx) <= r)
		"frame":
			var m := maxf(absf(fx), absf(fy))
			return m <= r and m >= r * 0.6
		"blade":
			# Triangle with the apex at the top
			return fy >= -r and fy <= r * 0.75 and absf(fx) <= (fy + r) * 0.42
		"tool":
			# Hammer: wide head on top of a narrow handle
			var head := fy <= -r * 0.3 and fy >= -r * 0.95 and absf(fx) <= r * 0.85
			var handle := absf(fx) <= r * 0.2 and fy > -r * 0.3 and fy <= r * 0.95
			return head or handle
	return false
