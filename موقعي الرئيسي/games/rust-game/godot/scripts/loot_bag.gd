extends StaticBody3D
## Everything you were carrying when you died, lying where you fell.
##
## The method is called `interact_station` on purpose: the player's existing
## interact ray already looks for that name (player.gd), so a bag is
## lootable without the player knowing bags exist.

## How long a bag lies there before it rots away. Long enough to run back
## across the map, short enough that the world does not fill with them.
const LIFETIME := 1200.0

var stored: Dictionary = {}
## Whatever was worn at the time, so a corpse run gets your armour back.
var worn: Dictionary = {}
var belt: Array = []
## World clock reading at which this bag disappears.
var expires_at := 0.0

var _mat: StandardMaterial3D


func setup(contents: Dictionary, worn_pieces: Dictionary, belt_layout: Array,
		clock: float) -> void:
	stored = contents.duplicate()
	worn = worn_pieces.duplicate()
	belt = belt_layout.duplicate()
	expires_at = clock + LIFETIME
	collision_layer = 2
	collision_mask = 0

	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(0.7, 0.45, 0.5)
	_mat = StandardMaterial3D.new()
	_mat.albedo_color = Color8(120, 92, 60)
	_mat.roughness = 0.9
	# A dropped pack has to be findable from a distance, in the dark, after
	# a panicked run back. It glows for the same reason a waypoint would.
	_mat.emission_enabled = true
	_mat.emission = Color(0.9, 0.65, 0.2)
	_mat.emission_energy_multiplier = 0.5
	box.material = _mat
	mi.mesh = box
	mi.position.y = 0.225
	add_child(mi)

	var cs := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(0.7, 0.45, 0.5)
	cs.shape = shape
	cs.position.y = 0.225
	add_child(cs)


func total() -> int:
	var n := 0
	for id in stored:
		n += int(stored[id])
	return n


func is_empty() -> bool:
	return total() <= 0 and worn.is_empty()


## Take back what fits. Anything that does not fit stays in the bag, so a
## full inventory can never make your gear vanish.
func interact_station() -> void:
	if is_empty():
		Game.notify("The bag is empty", Color(1.0, 0.63, 0.0))
		return

	var taken := 0
	var left_behind := 0
	for id in stored.keys():
		var amount := int(stored[id])
		if amount <= 0:
			stored.erase(id)
			continue
		var accepted := Game.add_item(id, amount)
		taken += accepted
		if accepted < amount:
			stored[id] = amount - accepted
			left_behind += amount - accepted
		else:
			stored.erase(id)

	# Armour goes straight back on, but only what actually came home
	for slot in worn.keys():
		var piece := str(worn[slot])
		if Game.get_count(piece) > 0:
			Game.worn[slot] = piece
			worn.erase(slot)
	# ...and so does the belt layout, for slots whose item survived the trip
	for i in mini(belt.size(), Game.belt.size()):
		var id = belt[i]
		if id is String and Game.get_count(id) > 0 and Game.belt[i] == null:
			Game.belt[i] = id
	Game.belt_changed.emit()
	Game.inventory_changed.emit()

	Sfx.play("door")
	if left_behind > 0:
		Game.notify("Recovered %d items — %d left in the bag, no room"
			% [taken, left_behind], Color(1.0, 0.63, 0.0))
		return
	Game.notify("Recovered %d items" % taken)
	if is_empty():
		queue_free()
