extends StaticBody3D
## A placed building piece (foundation, wall, doorway, ceiling, tool
## cupboard or door). Holds tier/health, supports upgrade/repair coloring
## and door open/close.

const ModelRegistry := preload("res://scripts/model_registry.gd")

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

var _visual: Node3D          # Blender model, when one exists for this piece
var _fallback_mat: StandardMaterial3D  # only used by the primitive fallback


func setup(type: String) -> void:
	build_type = type
	var bt: Dictionary = Game.BUILDING_TYPES[type]
	is_door = bt.is_door
	collision_layer = 2
	collision_mask = 0

	_visual = ModelRegistry.spawn(type)
	if _visual != null:
		add_child(_visual)
	else:
		# No model for this piece yet: fall back to the primitive block
		var mi := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = bt.size
		_fallback_mat = StandardMaterial3D.new()
		_fallback_mat.roughness = 0.8
		box.material = _fallback_mat
		mi.mesh = box
		add_child(mi)
		_visual = mi

	# Collision always comes from the declared grid size, never the mesh, so
	# swapping a model can never shift a placed structure's hitbox.
	var cs := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = bt.size
	cs.shape = shape
	add_child(cs)

	apply_tier("twig")


func apply_tier(t: String) -> void:
	if not Game.BUILDING_TIERS.has(t):
		t = "twig"
	tier = t
	var td: Dictionary = Game.BUILDING_TIERS[t]
	max_health = float(td.health)
	health = max_health
	if _fallback_mat != null:
		_fallback_mat.albedo_color = td.color
	elif t == "wood":
		# Wood keeps the model's own painted materials (planks, trim, hinges)
		ModelRegistry.clear_tint(_visual)
	else:
		ModelRegistry.tint(_visual, td.color, float(td.metallic), float(td.roughness))


func toggle_door() -> void:
	is_open = not is_open
	rotation.y = base_rot + (PI / 2.0 if is_open else 0.0)
	Sfx.play("door")


## Bare-fist damage (punching structures, like the JS version).
func take_hit(amount: float) -> void:
	health -= amount
	if health <= 0.0:
		_destroy()


## Explosive damage, reduced by the tier's blast resistance.
func take_blast(raw_damage: float) -> float:
	var resist := float(Game.BUILDING_TIERS[tier].get("blast_resist", 1.0))
	var applied := raw_damage * resist
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


func _destroy() -> void:
	var world := get_parent()
	if world != null and world.has_method("unregister_structure"):
		world.unregister_structure(self)
	if build_type == "tool_cupboard":
		Game.tool_cupboards.erase(Vector2(position.x, position.z))
	queue_free()
