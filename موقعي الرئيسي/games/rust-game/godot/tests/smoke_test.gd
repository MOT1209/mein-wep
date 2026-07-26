extends SceneTree
## Headless smoke test: boots the main scene, then exercises crafting,
## building placement/upgrade/repair, harvesting, NPC damage, doors and
## save/load. Run with:
##   godot --headless --path . --script res://tests/smoke_test.gd

var frame := 0
var world: Node3D
var _save_backup := ""
var _had_save := false


func _initialize() -> void:
	# Preserve any real player save while the test runs
	if FileAccess.file_exists("user://rust_save.json"):
		_had_save = true
		var f := FileAccess.open("user://rust_save.json", FileAccess.READ)
		_save_backup = f.get_as_text()
		f.close()
		DirAccess.remove_absolute("user://rust_save.json")
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

	# --- Consumables
	game.add_item("berries", 3)
	game.stats.hunger = 50.0
	_check(game.consume_item("berries"), "eating berries succeeds")
	_check(absf(float(game.stats.hunger) - 75.0) < 0.01, "berries restored 25 hunger")
	_check(game.get_count("berries") == 2, "one berry portion consumed")
	_check(not game.consume_item("wood"), "non-consumable rejected")

	# --- Furnace smelting
	var furnace = world._spawn_station("furnace", Vector3(8, 0, 8))
	game.inventory["iron"] = 10
	var frag0: int = game.get_count("frag")
	furnace.interact_station()
	_check(game.get_count("frag") == frag0 + 10, "furnace smelted 10 ore into frag")
	_check(game.get_count("iron") == 0, "furnace consumed the ore")

	# --- Campfire cooking (earlier NPC kills may have dropped meat too)
	var campfire = world._spawn_station("campfire", Vector3(10, 0, 8))
	game.add_item("raw_meat", 4)
	var raw_before: int = game.get_count("raw_meat")
	var cooked_before: int = game.get_count("cooked_meat")
	campfire.interact_station()
	_check(game.get_count("cooked_meat") == cooked_before + raw_before, "campfire cooked all raw meat")
	_check(game.get_count("raw_meat") == 0, "campfire consumed raw meat")

	# --- Berry bush harvest
	var bush: Node = null
	for c in world.get_children():
		if c.has_method("hit_harvest") and c.res_type == "bush":
			bush = c
			break
	_check(bush != null, "found a berry bush")
	if bush != null:
		var berries0: int = game.get_count("berries")
		bush.hit_harvest()
		_check(game.get_count("berries") == berries0 + 5, "bush yields 5 berries")

	# --- Deer drops meat
	var deer: Node = null
	for c in world.get_children():
		if c.has_method("npc_take_damage") and c.npc_type == "deer":
			deer = c
			break
	_check(deer != null, "found a deer")
	if deer != null:
		var meat0: int = game.get_count("raw_meat")
		deer.npc_take_damage(500.0)
		_check(game.get_count("raw_meat") == meat0 + 3, "hunted deer dropped raw meat")

	# --- Water: find a lake and verify the drink check
	var water_pos := Vector3.ZERO
	var found_water := false
	for gx in range(-190, 190, 7):
		for gz in range(-190, 190, 7):
			var h = world.terrain_height(float(gx), float(gz))
			if h < world.WATER_LEVEL - 0.4:
				water_pos = Vector3(float(gx), h, float(gz))
				found_water = true
				break
		if found_water:
			break
	_check(found_water, "map contains at least one lake")
	if found_water:
		_check(world.is_in_water(water_pos), "is_in_water true inside the lake")
	_check(not world.is_in_water(Vector3(0, 0, 0)), "is_in_water false at spawn")

	# --- Save / load round trip
	world.save_game()
	_check(FileAccess.file_exists("user://rust_save.json"), "save file written")
	var f := FileAccess.open("user://rust_save.json", FileAccess.READ)
	var data = JSON.parse_string(f.get_as_text())
	f.close()
	_check(data is Dictionary and data.structures.size() == 3, "save contains 3 structures")
	_check(int(data.player.inventory.hammer) == 3, "save contains crafted hammers")
	_check(data.stations.size() == 2, "save contains 2 stations")

	# Restore the player's real save (or leave none, as before the test)
	DirAccess.remove_absolute("user://rust_save.json")
	if _had_save:
		var rf := FileAccess.open("user://rust_save.json", FileAccess.WRITE)
		rf.store_string(_save_backup)
		rf.close()
	print("SMOKE TEST DONE")
