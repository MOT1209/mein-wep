extends StaticBody3D
## A placed building piece (foundation, wall, doorway, ceiling, tool
## cupboard or door). Holds tier/health, supports upgrade/repair coloring
## and door open/close.

const ModelRegistry := preload("res://scripts/model_registry.gd")

## The walkable hole a doorway leaves in itself. Wide and tall enough for the
## 0.9 x 2.1 door piece that fills it.
const DOOR_GAP_W := 1.1
const DOOR_GAP_H := 2.2

var build_type := "foundation"
var tier := "twig"
var health := 10.0
var max_health := 10.0
var is_door := false
var is_open := false
var base_rot := 0.0
var decaying := false
## Tool Cupboards only: materials stocked to pay this base's upkeep.
var upkeep: Dictionary = {}
## Doors only: the installed lock ("" when the door swings freely) and the
## punishment that lock has left in it.
var lock_type := ""
var lock_health := 0.0
## Which way the builder was facing this piece from when they placed it.
## Flattened, world space; Vector3.ZERO means no weak face was recorded.
var soft_normal := Vector3.ZERO
## How well held up this piece is, 0-100. Foundations anchor at 100 and
## everything above loses a step per level. At 0 the piece falls down.
var stability := 100.0
## World clock reading when it went up. Demolition is only offered for a
## while after that — see Game.DEMOLISH_WINDOW.
var placed_at := 0.0

var _visual: Node3D          # Blender model, when one exists for this piece
var _visual_path := ""       # which model `_visual` was instanced from
var _fallback_mat: StandardMaterial3D  # only used by the primitive fallback
var _lock_visual: Node3D     # the padlock hanging on a locked door
var closed_pos := Vector3.ZERO  # where a door sits when shut — its hinge line


func _ready() -> void:
	# Placement and load both set position before adding the piece to the
	# tree, so this is the shut position for the rest of the piece's life.
	closed_pos = position


func setup(type: String) -> void:
	build_type = type
	var bt: Dictionary = Game.BUILDING_TYPES[type]
	is_door = bt.is_door
	collision_layer = Game.LAYER_FLOOR if type in Game.FLOOR_TYPES else 2
	collision_mask = 0

	_visual_path = ModelRegistry.model_for(type, "twig")
	_visual = ModelRegistry.spawn_path(_visual_path)
	if _visual != null:
		add_child(_visual)
	else:
		_visual_path = ""
		_build_fallback_visual(bt)

	# Collision always comes from the declared grid size, never the mesh, so
	# swapping a model can never shift a placed structure's hitbox.
	_build_collision(bt)

	apply_tier("twig")


## The primitive stand-in used by every piece with no Blender model yet. A
## box for almost everything; the triangle and the roof get the same solid
## the collision is built from, so what you see is what you walk into.
func _build_fallback_visual(bt: Dictionary) -> void:
	_fallback_mat = StandardMaterial3D.new()
	_fallback_mat.roughness = 0.8
	var mi := MeshInstance3D.new()
	var shape := str(bt.get("shape", "box"))
	if shape == "box":
		var box := BoxMesh.new()
		box.size = bt.size
		box.material = _fallback_mat
		mi.mesh = box
	else:
		mi.mesh = _solid_mesh(shape, bt.size, _fallback_mat)
	add_child(mi)
	_visual = mi


## One solid box per piece — except a doorway, which is a frame, and the
## triangle and roof, which are convex solids. The doorway used to get the
## same full 3x3 box as a wall, so the opening you can see through was solid
## to walk into: nothing, not even the owner, could get through their own door.
func _build_collision(bt: Dictionary) -> void:
	var size: Vector3 = bt.size
	var shape := str(bt.get("shape", "box"))
	if shape != "box":
		_add_convex(_hull_points(shape, size))
		return
	if build_type != "doorway":
		_add_box(size, Vector3.ZERO)
		return
	var post := (size.x - DOOR_GAP_W) * 0.5
	var lintel := size.y - DOOR_GAP_H
	_add_box(Vector3(post, size.y, size.z), Vector3((size.x - post) * -0.5, 0.0, 0.0))
	_add_box(Vector3(post, size.y, size.z), Vector3((size.x - post) * 0.5, 0.0, 0.0))
	_add_box(Vector3(size.x, lintel, size.z), Vector3(0.0, (size.y - lintel) * 0.5, 0.0))


func _add_box(size: Vector3, offset: Vector3) -> void:
	var cs := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = size
	cs.shape = shape
	cs.position = offset
	add_child(cs)


func _add_convex(points: PackedVector3Array) -> void:
	var cs := CollisionShape3D.new()
	var shape := ConvexPolygonShape3D.new()
	shape.points = points
	cs.shape = shape
	add_child(cs)


## Corner points of a non-box piece, centred on the origin like every other
## collision solid here.
##
## "triangle" is a 3x3 tile cut along the diagonal that runs from its -x/-z
## corner to its +x/+z one, leaving the half on the +x side; four of them
## rotated in 90° steps tile a full square, which is what makes hexagonal
## and angled bases possible on a square grid.
##
## "wedge" is a roof: flat underneath, rising from the -z edge to a ridge
## along +z, so rain-shedding pitched roofs sit on top of 3m walls.
static func _hull_points(shape: String, size: Vector3) -> PackedVector3Array:
	var hx := size.x * 0.5
	var hy := size.y * 0.5
	var hz := size.z * 0.5
	if shape == "triangle":
		return PackedVector3Array([
			Vector3(-hx, -hy, -hz), Vector3(hx, -hy, -hz), Vector3(hx, -hy, hz),
			Vector3(-hx, hy, -hz), Vector3(hx, hy, -hz), Vector3(hx, hy, hz)])
	# wedge
	return PackedVector3Array([
		Vector3(-hx, -hy, -hz), Vector3(hx, -hy, -hz),
		Vector3(hx, -hy, hz), Vector3(-hx, -hy, hz),
		Vector3(-hx, hy, hz), Vector3(hx, hy, hz)])


## Which corners of `_hull_points` form each triangle of the surface. Indices
## only — the corners themselves depend on the piece's size, the faces joining
## them do not. Winding is not trusted here: `_solid_mesh` turns any face it
## finds pointing inwards, so these only have to name the right three corners.
static func _hull_faces(shape: String) -> Array:
	if shape == "triangle":
		# 0,1,2 = bottom face; 3,4,5 = the same corners on top
		return [[0, 2, 1], [3, 4, 5],
			[0, 1, 4], [0, 4, 3],
			[1, 2, 5], [1, 5, 4],
			[2, 0, 3], [2, 3, 5]]
	# wedge: 0-3 base quad (-z,-z,+z,+z), 4-5 the ridge above the +z edge
	return [[0, 2, 1], [0, 3, 2],
		[3, 5, 4], [3, 2, 5],
		[0, 1, 5], [0, 5, 4],
		[0, 4, 3], [1, 2, 5]]


## Flat-shaded mesh built from the same corners the collision hull uses.
##
## Winding is fixed here rather than trusted from the face table: a solid is
## convex and its faces all point away from its centre, so any triangle
## found facing inwards is simply turned round. Getting one wrong by hand
## would leave a hole in the piece that is only visible from one side.
static func _solid_mesh(shape: String, size: Vector3, mat: StandardMaterial3D) -> ArrayMesh:
	var points := _hull_points(shape, size)
	var middle := Vector3.ZERO
	for p in points:
		middle += p
	middle /= float(points.size())

	var verts := PackedVector3Array()
	var normals := PackedVector3Array()
	for face in _hull_faces(shape):
		var a: Vector3 = points[face[0]]
		var b: Vector3 = points[face[1]]
		var c: Vector3 = points[face[2]]
		var n := (b - a).cross(c - a)
		if n.length() < 0.0001:
			continue
		n = n.normalized()
		if n.dot((a + b + c) / 3.0 - middle) < 0.0:
			var swap := b
			b = c
			c = swap
			n = -n
		verts.append_array(PackedVector3Array([a, b, c]))
		for i in 3:
			normals.append(n)
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = verts
	arrays[Mesh.ARRAY_NORMAL] = normals
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	mesh.surface_set_material(0, mat)
	return mesh


func apply_tier(t: String) -> void:
	if not Game.BUILDING_TIERS.has(t):
		t = "twig"
	tier = t
	var td: Dictionary = Game.BUILDING_TIERS[t]
	max_health = float(td.health)
	health = max_health

	if _fallback_mat != null:
		_fallback_mat.albedo_color = td.color
		return

	# Some pieces earn a model of their own once upgraded — coursed stone,
	# a riveted steel door — instead of the wooden one under a grey wash.
	_swap_visual(ModelRegistry.model_for(build_type, t))

	if t == "wood" or ModelRegistry.keeps_own_materials(build_type, t):
		# The model on screen is already painted for this tier: planks and
		# hinges for wood, rubble and rivets for stone and metal.
		ModelRegistry.clear_tint(_visual)
	else:
		ModelRegistry.tint(_visual, td.color, float(td.metallic), float(td.roughness))


## Replaces the piece's mesh in place. Collision is never rebuilt — it comes
## from `Game.BUILDING_TYPES`, so a taller or wider model can't move a placed
## structure's hitbox out from under the base it is holding up.
func _swap_visual(path: String) -> void:
	if path == "" or path == _visual_path:
		return
	var next := ModelRegistry.spawn_path(path)
	if next == null:
		return
	if is_instance_valid(_visual):
		remove_child(_visual)
		_visual.queue_free()
	_visual = next
	_visual_path = path
	add_child(_visual)


## Whether the player may work this door right now. A key or code lock
## always opens for the owner; a keycard lock wants the card in hand, so it
## is the one lock that can shut you out of your own base.
func player_may_open() -> bool:
	if not is_locked():
		return true
	var needs := str(Game.LOCKS[lock_type].get("needs", ""))
	return needs == "" or Game.get_count(needs) > 0


func toggle_door() -> void:
	if not player_may_open():
		Game.notify("%s — you need a %s"
			% [Game.LOCKS[lock_type].name, Game.ITEMS["keycard"].name], Color(0.9, 0.3, 0.3))
		return
	set_door_state(not is_open)
	Sfx.play("door")


## Doors hinge on their edge, not their middle. Rotating about the centre
## left half the leaf standing in the opening, so an open door still blocked
## the doorway it belongs to — for the owner as much as for anything else.
func set_door_state(open: bool) -> void:
	is_open = open
	position = closed_pos
	rotation.y = base_rot

	# A garage door has no hinge: it runs up into its own lintel. Nothing can
	# body-block it from the far side the way a swinging leaf can be, which
	# is most of what the metal buys you.
	if build_type in Game.LIFTING_DOORS:
		if open:
			position.y += float(Game.BUILDING_TYPES[build_type].size.y)
		return

	rotation.y = base_rot + (PI / 2.0 if open else 0.0)
	if open:
		var w: float = Game.BUILDING_TYPES[build_type].size.x
		position += Vector3(-w * 0.5, 0.0, w * 0.5).rotated(Vector3.UP, base_rot)


# ==================== LOCKS ====================

func is_locked() -> bool:
	return lock_type != ""


## Fits a lock from the player's hand. Doors only, one lock each.
func install_lock(id: String) -> bool:
	if not is_door or not Game.LOCKS.has(id):
		return false
	if is_locked():
		return false
	lock_type = id
	lock_health = float(Game.LOCKS[id].strength)
	_show_lock()
	return true


## What a hostile gets when it tries the handle. The owner uses toggle_door
## and is never refused; anything else has to get through the lock first.
func npc_open_door() -> bool:
	if not is_door or is_locked():
		return false
	if not is_open:
		toggle_door()
	return true


## A hostile working on the lock itself. A key lock eventually pops, which
## leaves the door usable again; a code lock has nothing to break, so the
## blow lands on the door instead.
func attack_lock(amount: float, from: Vector3 = Vector3.INF) -> void:
	if not is_locked():
		return
	if lock_health <= 0.0:
		take_hit(amount, from)
		return
	lock_health -= amount
	if lock_health <= 0.0:
		Game.notify("%s broken open!" % Game.LOCKS[lock_type].name, Color(0.9, 0.3, 0.3))
		_remove_lock()
		Sfx.play("hit")


func _remove_lock() -> void:
	lock_type = ""
	lock_health = 0.0
	if is_instance_valid(_lock_visual):
		_lock_visual.queue_free()
	_lock_visual = null


## Small padlock block on the door face. The code lock has a model; the key
## lock falls back to a dull grey box, same as every other piece does.
func _show_lock() -> void:
	if is_instance_valid(_lock_visual):
		_lock_visual.queue_free()
	var node: Node3D = ModelRegistry.spawn(lock_type)
	if node == null:
		var mi := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = Vector3(0.16, 0.22, 0.08)
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color8(84, 110, 122)
		mat.metallic = 0.7
		mat.roughness = 0.35
		box.material = mat
		mi.mesh = box
		node = mi
	node.position = Vector3(0.3, 0.1, 0.12)
	add_child(node)
	_lock_visual = node


## Is `from` standing on this piece's weak face? Pieces with no recorded
## builder — old saves, test fixtures — have no weak side at all.
func is_soft_side(from: Vector3) -> bool:
	if soft_normal == Vector3.ZERO:
		return false
	var dir := from - global_position
	dir.y = 0.0
	if dir.length() < 0.01:
		return false
	return dir.normalized().dot(soft_normal) > 0.0


func damage_multiplier(from: Vector3) -> float:
	return Game.SOFT_SIDE_MULT if is_soft_side(from) else 1.0


## Melee and bullet damage. `from` is where the blow came from, so the soft
## side can double it; leave it out and the piece takes the raw amount.
func take_hit(amount: float, from: Vector3 = Vector3.INF) -> float:
	var applied := amount
	if from != Vector3.INF:
		applied *= damage_multiplier(from)
	health -= applied
	if health <= 0.0:
		_destroy()
	return applied


## Explosive damage, reduced by the tier's blast resistance and doubled
## when the charge was planted against the weak face.
func take_blast(raw_damage: float, origin: Vector3 = Vector3.INF) -> float:
	var resist := float(Game.BUILDING_TIERS[tier].get("blast_resist", 1.0))
	var applied := raw_damage * resist
	if origin != Vector3.INF:
		applied *= damage_multiplier(origin)
	health -= applied
	if health <= 0.0:
		_destroy()
	return applied


## One decay tick, as a fraction of this piece's maximum health.
func apply_decay(fraction: float) -> void:
	decaying = true
	health -= max_health * fraction
	if health <= 0.0:
		_destroy()


## Tool Cupboard: spend stocked materials to cover `cost` upkeep points.
## Returns false when the cupboard has run dry.
func pay_upkeep(cost: int) -> bool:
	var remaining := cost
	for res in Game.UPKEEP_MATERIALS:
		if remaining <= 0:
			break
		var have := int(upkeep.get(res, 0))
		if have <= 0:
			continue
		var spend: int = mini(have, remaining)
		upkeep[res] = have - spend
		remaining -= spend
	return remaining <= 0


## Interacting with a Tool Cupboard stocks it from your inventory.
func deposit_upkeep() -> void:
	var moved := 0
	for res in Game.UPKEEP_MATERIALS:
		var count := Game.get_count(res)
		if count > 0:
			upkeep[res] = int(upkeep.get(res, 0)) + count
			Game.remove_item(res, count)
			moved += count
	if moved > 0:
		Game.notify("Stocked %d upkeep materials" % moved)
		Sfx.play("door")
	else:
		Game.notify("No upkeep materials to stock", Color(1.0, 0.63, 0.0))


func upkeep_total() -> int:
	var total := 0
	for res in upkeep:
		total += int(upkeep[res])
	return total


# ==================== DEMOLITION ====================

## Everything that was spent climbing to this piece's current tier. Upgrades
## only ever go one step at a time, so the total is the sum of every tier's
## cost up to this one — no need to record the history as it happens.
func invested_materials() -> Dictionary:
	var total := {}
	var idx := Game.TIER_ORDER.find(tier)
	for i in range(1, idx + 1):
		var cost: Dictionary = Game.BUILDING_TIERS[Game.TIER_ORDER[i]].cost
		for res in cost:
			total[res] = int(total.get(res, 0)) + int(cost[res])
	return total


## What tearing this piece down hands back: half of what went into it.
func salvage_value() -> Dictionary:
	var spent := invested_materials()
	var refund := {}
	for res in spent:
		var units := floori(float(spent[res]) * Game.SALVAGE_FRACTION)
		if units > 0:
			refund[res] = units
	return refund


## A piece is only cleanly removable for a while after it goes up. Past that
## it has to be knocked down, so nobody salvages their way into a base.
func can_demolish(now: float) -> bool:
	return now - placed_at <= Game.DEMOLISH_WINDOW


## Falls down because nothing is holding it up any more. Same end as being
## destroyed; named apart so the reason is readable at the call site.
func free_collapsed() -> void:
	_destroy()


func _destroy() -> void:
	var world := get_parent()
	if world != null and world.has_method("unregister_structure"):
		world.unregister_structure(self)
	if build_type == "tool_cupboard":
		Game.tool_cupboards.erase(Vector2(position.x, position.z))
	queue_free()
