extends Node
## Captures the running game to a PNG and quits, so a change to the interface
## can be looked at instead of only reasoned about.
##
## Headless runs cannot do this — Godot's dummy renderer draws nothing, so a
## capture comes back blank. This has to run in a real window, which is why it
## is a node inside the game rather than a `--script` tool.
##
## Usage:
##     godot --path . -- --shot=res_or_abs_path.png [--shot-frames=90]
##
## Frames rather than seconds because the first frames of a boot are where the
## terrain, the roads and the scatter land; a capture taken before they settle
## photographs a half-built world and proves nothing.

const DEFAULT_FRAMES := 90

var path := ""
var frames := DEFAULT_FRAMES
## Prints where every visible Control actually ended up. A panel in the wrong
## corner is far quicker to explain from its rect than from the picture.
var dump := false
var _left := 0


## Reads the flags and returns whether a capture was asked for at all, so the
## caller can skip building this node in an ordinary run.
static func wanted() -> Dictionary:
	var out := {"path": "", "frames": DEFAULT_FRAMES, "dump": false, "seed": 0}
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--shot="):
			out.path = arg.substr(7)
		elif arg.begins_with("--shot-frames="):
			out.frames = maxi(1, int(arg.substr(14)))
		elif arg == "--shot-dump":
			out.dump = true
		elif arg.begins_with("--shot-seed="):
			# A fixed world, so two captures can actually be compared. Without
			# it every run scatters a different map and picks a different
			# stretch of road, and no before-and-after means anything.
			out.seed = maxi(1, int(arg.substr(12)))
	return out


## Walks the Control tree printing each node's rect, skipping anything hidden
## or too small to be worth a line.
func _dump(node: Node, depth: int) -> void:
	if node is Control:
		var c := node as Control
		if c.is_visible_in_tree() and c.size.x > 1.0 and c.size.y > 1.0:
			print("%s%s %s  pos %.0f,%.0f  size %.0fx%.0f  hflag %d vflag %d"
				% ["  ".repeat(depth), c.get_class(), c.name,
					c.global_position.x, c.global_position.y, c.size.x, c.size.y,
					c.size_flags_horizontal, c.size_flags_vertical])
	for child in node.get_children():
		_dump(child, depth + 1)


func _ready() -> void:
	_left = frames


func _process(_delta: float) -> void:
	_left -= 1
	if _left > 0:
		return
	set_process(false)
	# One more frame after the wait, drawn and finished, or the capture can
	# catch the viewport mid-draw
	await RenderingServer.frame_post_draw

	if dump:
		_dump(get_tree().root, 0)

	var image := get_viewport().get_texture().get_image()
	var err := image.save_png(path)
	if err != OK:
		push_error("screenshot: could not write %s (%d)" % [path, err])
	else:
		print("screenshot: wrote %s (%dx%d)"
			% [path, image.get_width(), image.get_height()])
	get_tree().quit(0 if err == OK else 1)
