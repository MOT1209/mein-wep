extends SceneTree
## Headless smoke test: boots the main scene, then exercises crafting,
## building placement/upgrade/repair, harvesting, NPC damage, doors and
## save/load. Run with:
##   godot --headless --path . --script res://tests/smoke_test.gd

var frame := 0
var world: Node3D


func _initialize() -> void:
	var scene: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(scene)
	world = scene


func _process(_delta: float) -> bool:
	frame += 1
	if frame == 5:
		_run_tests()
		return true
	return false


func _check(ok: bool, test_name: String) -> void:
	print(("PASS: " if ok else "FAIL: ") + test_name)


func _run_tests() -> void:
	var game = root.get_node("/root/Game")
	world.started = true
	game.set_ui("")

	# --- Crafting
	var wood_before: int = game.get_count("wood")
	_check(game.craft("hammer", 2), "craft 2 hammers succeeds")
	_check(game.get_count("wood") == wood_before - 200, "craft consumed 200 wood")
	_check(game.get_count("hammer") == 3, "hammer count is now 3")
	_check(not game.craft("ak47", 99), "unaffordable craft rejected")

	# --- Building placement rules
	var b = world.building
	_check(b.can_build_here(Vector3(3, 0.1, 3), "foundation"), "foundation placeable on open ground")
	_check(not b.can_build_here(Vector3(3, 1.5, 3), "wall"), "wall rejected without foundation")

	var StructureScript = load("res://scripts/structure.gd")
	var foundation = StructureScript.new()
	foundation.setup("foundation")
	foundation.position = Vector3(3, 0.1, 3)
	world.add_child(foundation)
	world.register_structure(foundation)
	_check(b.can_build_here(Vector3(3, 1.5, 3), "wall"), "wall allowed on foundation")

	# --- Upgrade & repair
	b.upgrade_structure(foundation)
	_check(foundation.tier == "wood" and foundation.max_health == 250.0, "upgrade twig -> wood")
	foundation.health = 100.0
	b.repair_structure(foundation)
	_check(foundation.health == 125.0, "repair adds 10% of max health")

	# --- Tool cupboard radius rule
	game.tool_cupboards.append(Vector2(0, 0))
	_check(not b.can_build_here(Vector3(3, 0.9, 3), "tool_cupboard"), "TC rejected inside another TC radius")
	var far_foundation = StructureScript.new()
	far_foundation.setup("foundation")
	far_foundation.position = Vector3(60, 0.1, 60)
	world.add_child(far_foundation)
	world.register_structure(far_foundation)
	_check(b.can_build_here(Vector3(60, 0.9, 60), "tool_cupboard"), "TC allowed far away on a foundation")
	game.tool_cupboards.clear()
	world.unregister_structure(far_foundation)
	far_foundation.queue_free()

	# --- Door
	var doorway = StructureScript.new()
	doorway.setup("doorway")
	doorway.position = Vector3(3, 1.5, 3)
	world.add_child(doorway)
	world.register_structure(doorway)
	_check(b.can_build_here(Vector3(3, 1.05, 3), "wooden_door"), "door allowed on doorway")
	var door = StructureScript.new()
	door.setup("wooden_door")
	door.position = Vector3(3, 1.05, 3)
	world.add_child(door)
	world.register_structure(door)
	door.toggle_door()
	_check(door.is_open and absf(door.rotation.y - PI / 2.0) < 0.01, "door opens 90 degrees")

	# --- Harvest a resource node
	var res_node: Node = null
	for c in world.get_children():
		if c.has_method("hit_harvest") and c.res_type == "tree":
			res_node = c
			break
	_check(res_node != null, "found a tree to harvest")
	if res_node != null:
		var w0: int = game.get_count("wood")
		res_node.hit_harvest()
		_check(game.get_count("wood") == w0 + 12, "tree hit yields 12 wood")
		res_node.hit_harvest()
		res_node.hit_harvest()
		res_node.hit_harvest()
		_check(world.respawn_queue.size() == 1, "depleted tree queued for respawn")

	# --- NPC damage & loot
	var npc: Node = null
	for c in world.get_children():
		if c.has_method("npc_take_damage"):
			npc = c
			break
	_check(npc != null, "found an NPC")
	if npc != null:
		var cloth0: int = game.get_count("cloth")
		npc.npc_take_damage(500.0)
		_check(game.get_count("cloth") > cloth0, "dead NPC dropped loot")

	# --- Terrain determinism
	_check(absf(world.terrain_height(50.0, 50.0) - world.terrain_height(50.0, 50.0)) < 0.0001,
		"terrain height is deterministic")
	_check(absf(world.terrain_height(0.0, 0.0)) < 0.0001, "spawn area is flattened to 0")

	# --- Save / load round trip
	world.save_game()
	_check(FileAccess.file_exists("user://rust_save.json"), "save file written")
	var f := FileAccess.open("user://rust_save.json", FileAccess.READ)
	var data = JSON.parse_string(f.get_as_text())
	f.close()
	_check(data is Dictionary and data.structures.size() == 3, "save contains 3 structures")
	_check(int(data.player.inventory.hammer) == 3, "save contains crafted hammers")

	# Clean up the save so a normal launch starts fresh
	DirAccess.remove_absolute("user://rust_save.json")
	print("SMOKE TEST DONE")
