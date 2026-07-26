extends SceneTree
## Renders every item icon into one contact sheet PNG for visual review.
##   godot --headless --path . --script res://tests/icon_sheet.gd

const CELL := 40
const COLS := 9


func _initialize() -> void:
	# Loaded at runtime, not preloaded: in --script mode a parse-time
	# preload chain is compiled before the autoloads finish registering.
	var IconFactory = load("res://scripts/icon_factory.gd")
	var ids := Game.ITEMS.keys()
	var rows := ceili(float(ids.size()) / float(COLS))
	var sheet := Image.create(COLS * CELL, rows * CELL, false, Image.FORMAT_RGBA8)
	sheet.fill(Color(0.12, 0.12, 0.14, 1.0))

	for i in ids.size():
		var img: Image = IconFactory.make_image(ids[i])
		var ox := (i % COLS) * CELL + 4
		var oy := (i / COLS) * CELL + 4
		sheet.blit_rect(img, Rect2i(0, 0, img.get_width(), img.get_height()), Vector2i(ox, oy))

	var out := "user://icon_sheet.png"
	sheet.save_png(out)
	print("Wrote %s (%d icons, %dx%d)" % [
		ProjectSettings.globalize_path(out), ids.size(), sheet.get_width(), sheet.get_height()])
	quit()
