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

	# --- Blender model batch wired through ModelRegistry
	var registry = load("res://scripts/model_registry.gd")
	var missing := []
	for mid in registry.MODELS:
		if not registry.has_model(mid):
			missing.append(mid)
	_check(missing.is_empty(), "all %d registered models exist on disk %s"
		% [registry.MODELS.size(), str(missing)])
	var sample = registry.spawn("wall")
	_check(sample is Node3D, "ModelRegistry instantiates a model")
	if sample != null:
		var meshes := 0
		var stack: Array = [sample]
		while not stack.is_empty():
			var n = stack.pop_back()
			if n is MeshInstance3D:
				meshes += 1
			for ch in n.get_children():
				stack.append(ch)
		_check(meshes > 0, "instantiated model carries mesh data")
		sample.free()
	_check(registry.spawn("no_such_model") == null, "unknown model id spawns nothing")

	# --- Building pieces now use those models, collision still grid-sized
	var modelled_wall = StructureScript.new()
	modelled_wall.setup("wall")
	world.add_child(modelled_wall)
	_check(modelled_wall._fallback_mat == null, "wall uses the Blender model, not the box fallback")
	var wall_shape: CollisionShape3D = null
	for ch in modelled_wall.get_children():
		if ch is CollisionShape3D:
			wall_shape = ch
	_check(wall_shape != null and wall_shape.shape.size == game.BUILDING_TYPES.wall.size,
		"wall collision still matches the declared grid size")
	modelled_wall.apply_tier("stone")
	_check(modelled_wall.tier == "stone", "modelled piece still upgrades tiers")
	_check(game.BUILDING_TYPES.has("stairs") and game.BUILDING_TYPES.has("window_wall"),
		"stairs and window wall added as buildable pieces")
	_check(game.TIER_ORDER == ["twig", "wood", "stone", "metal", "concrete", "hqm"],
		"concrete sits between sheet metal and armored")

	# --- Tool-specific gathering rates
	var tree2: Node = null
	var ore2: Node = null
	for c in world.get_children():
		if c.is_queued_for_deletion() or not c.has_method("hit_harvest"):
			continue
		if tree2 == null and c.res_type == "tree":
			tree2 = c
		elif ore2 == null and c.res_type == "iron":
			ore2 = c
	if tree2 != null:
		var w0: int = game.get_count("wood")
		tree2.hit_harvest("metal_hatchet")
		_check(game.get_count("wood") == w0 + 36, "metal hatchet yields 3x wood per swing")
	if ore2 != null:
		var iron0: int = game.get_count("iron")
		var oil0: int = game.get_count("oil")
		ore2.hit_harvest("drill")
		_check(game.get_count("iron") == iron0 + 32, "drill yields 4x metal ore per swing")
		_check(game.get_count("oil") == oil0 + 3, "drill is the source of crude oil")

	# --- Workbench tier gating
	game.workbench_level = 0
	game.inventory["wood"] = 2000
	game.inventory["frag"] = 2000
	_check(game.required_workbench("metal_hatchet") == 1, "hatchet is a tier 1 recipe")
	_check(not game.craft("metal_hatchet", 1), "tier 1 recipe blocked with no workbench")
	var bench = world._spawn_station("workbench_t1", world.player.position + Vector3(2, 0, 0))
	_check(bench.workbench_level() == 1, "workbench_t1 station reports tier 1")
	world._update_stations(0.1)
	_check(game.workbench_level == 1, "standing near the bench raises the crafting tier")
	_check(game.craft("metal_hatchet", 1), "tier 1 recipe unlocked at the workbench")

	# --- Temperature survival stat
	_check(game.stats.has("temperature"), "temperature is a tracked survival stat")
	game.stats.temperature = 100.0
	world._sun_elevation = -1.0
	world.player.in_water = false
	for i in 40:
		world._update_stations(0.5)
	_check(game.stats.temperature < 50.0,
		"night drains body warmth (%.0f)" % game.stats.temperature)
	var fire = world._spawn_station("campfire", world.player.position + Vector3(1, 0, 0))
	_check(fire.warmth() > 0.0, "campfire registers as a heat source")
	for i in 40:
		world._update_stations(0.5)
	_check(game.stats.temperature > 90.0,
		"a nearby fire warms you back up (%.0f)" % game.stats.temperature)

	# --- Storage box
	var stash = world._spawn_station("storage_box", Vector3(6, 0, -6))
	game.inventory["wood"] = 500
	stash._use_storage()
	_check(game.get_count("wood") == 0, "storage box takes resources in")
	_check(int(stash.stored.get("wood", 0)) == 500, "storage box holds what it took")
	stash._use_storage()
	_check(game.get_count("wood") == 500, "interacting again withdraws everything")
	_check(stash.stored.is_empty(), "box is empty after withdrawal")

	# --- Research table is the only component source
	var research = world._spawn_station("research_table", Vector3(-6, 0, 6))
	game.inventory["scrap"] = 100
	var comps_before: int = (game.get_count("gear_comp") + game.get_count("pipe")
		+ game.get_count("spring") + game.get_count("sewing"))
	research.interact_station()
	_check(game.get_count("scrap") == 75, "research consumes 25 scrap")
	var comps_after: int = (game.get_count("gear_comp") + game.get_count("pipe")
		+ game.get_count("spring") + game.get_count("sewing"))
	_check(comps_after == comps_before + 1, "research yields one component")

	# --- Explosive crafting chain gives sulfur a purpose
	game.workbench_level = 2
	game.inventory["sulfur"] = 200
	game.inventory["charcoal"] = 200
	_check(game.craft("gunpowder", 2), "sulfur + charcoal makes gunpowder")
	_check(game.get_count("sulfur") == 160 and game.get_count("charcoal") == 140,
		"gunpowder consumed the right inputs")
	game.inventory["gunpowder"] = 500
	game.inventory["lgf"] = 50
	game.inventory["frag"] = 500
	_check(game.craft("explosives", 2), "gunpowder chains up into explosives")
	game.inventory["explosives"] = 100
	game.inventory["cloth"] = 50
	_check(game.craft("c4", 1), "explosives make a satchel charge")
	_check(game.required_workbench("c4") == 2, "C4 is gated behind workbench 2")

	# --- Blast damage scales with the tier's resistance
	var blast_targets := {}
	for t in ["wood", "stone", "metal", "hqm"]:
		var piece = StructureScript.new()
		piece.setup("wall")
		piece.position = Vector3(200, 5, 200)   # away from the rest of the base
		world.add_child(piece)
		world.register_structure(piece)
		piece.apply_tier(t)
		blast_targets[t] = piece
	var wood_dealt: float = blast_targets["wood"].take_blast(100.0)
	var stone_dealt: float = blast_targets["stone"].take_blast(100.0)
	var metal_dealt: float = blast_targets["metal"].take_blast(100.0)
	var hqm_dealt: float = blast_targets["hqm"].take_blast(100.0)
	_check(wood_dealt > stone_dealt and stone_dealt > metal_dealt and metal_dealt > hqm_dealt,
		"each tier absorbs more of the blast (%.0f/%.0f/%.0f/%.0f)"
		% [wood_dealt, stone_dealt, metal_dealt, hqm_dealt])
	_check(is_equal_approx(hqm_dealt, 30.0), "armored takes 30%% of raw blast damage")

	# One C4 flattens twig, but an armored wall shrugs it off
	var twig_wall = StructureScript.new()
	twig_wall.setup("wall")
	twig_wall.position = Vector3(210, 5, 210)
	world.add_child(twig_wall)
	world.register_structure(twig_wall)
	var c4_data: Dictionary = game.EXPLOSIVES["c4"]
	world.apply_explosion(twig_wall.position, float(c4_data.damage), float(c4_data.radius))
	_check(not is_instance_valid(twig_wall) or twig_wall.is_queued_for_deletion(),
		"one charge destroys a twig wall")
	var armored = blast_targets["hqm"]
	var hp_before: float = armored.health
	world.apply_explosion(armored.position, float(c4_data.damage), float(c4_data.radius))
	_check(is_instance_valid(armored) and not armored.is_queued_for_deletion(),
		"an armored wall survives a single charge")
	_check(armored.health < hp_before, "the armored wall still took damage")

	# --- Explosives are live objects with a fuse
	var live = world.spawn_explosive("grenade", Vector3(150, 10, 150), Vector3(0, 0, 0))
	_check(live != null and live.explosive_id == "grenade", "grenade spawns as a live object")
	_check(live._fuse > 0.0, "live grenade is counting down")
	live.queue_free()

	# --- Decay and Tool Cupboard upkeep
	for s in world.structures.duplicate():
		if is_instance_valid(s):
			world.unregister_structure(s)
			s.queue_free()
	game.tool_cupboards.clear()

	var lone = StructureScript.new()
	lone.setup("wall")
	lone.position = Vector3(300, 2, 300)
	world.add_child(lone)
	world.register_structure(lone)
	lone.apply_tier("wood")
	var lone_hp: float = lone.health
	world.tick_decay()
	_check(lone.health < lone_hp, "an unprotected wall decays")
	_check(lone.decaying, "decaying structures are flagged for the HUD")

	var tc = StructureScript.new()
	tc.setup("tool_cupboard")
	tc.position = Vector3(300, 2, 300)
	world.add_child(tc)
	world.register_structure(tc)
	tc.apply_tier("wood")
	_check(tc.upkeep_total() == 0, "a fresh cupboard is empty")
	world.tick_decay()
	_check(lone.decaying, "a cupboard with no materials does not stop decay")

	game.inventory["wood"] = 400
	tc.deposit_upkeep()
	_check(tc.upkeep_total() >= 400, "stocking the cupboard moves materials in")
	_check(game.get_count("wood") == 0, "the materials left the player's inventory")
	var stocked_before: int = tc.upkeep_total()
	var protected_hp: float = lone.health
	world.tick_decay()
	_check(is_equal_approx(lone.health, protected_hp),
		"a stocked cupboard stops decay entirely")
	_check(not lone.decaying, "protected structures clear the decaying flag")
	_check(tc.upkeep_total() < stocked_before, "upkeep is consumed while it protects")

	# --- Scene-authored environment & lighting (visible in the editor too)
	var we = world.get_node_or_null("WorldEnvironment")
	_check(we != null, "main.tscn contains a WorldEnvironment node")
	if we != null:
		var e: Environment = we.environment
		_check(e != null and e.background_mode == Environment.BG_SKY, "background mode is Sky")
		_check(e != null and e.sky != null and e.sky.sky_material is ProceduralSkyMaterial,
			"sky uses ProceduralSkyMaterial")
		_check(e != null and e.ambient_light_source == Environment.AMBIENT_SOURCE_SKY,
			"ambient light comes from the sky")
		_check(e != null and e.tonemap_mode == Environment.TONE_MAPPER_ACES, "ACES tonemapping set")
	var sun_node = world.get_node_or_null("Sun")
	_check(sun_node is DirectionalLight3D and sun_node.shadow_enabled,
		"Sun is a DirectionalLight3D with shadows enabled")
	_check(world.get_node_or_null("Moon") is DirectionalLight3D, "Moon light node exists")
	_check(world.sun == sun_node, "world.gd drives the scene's own Sun node")

	# --- Item icons
	var icon_factory = load("res://scripts/icon_factory.gd")
	var icon = icon_factory.get_icon("hammer")
	_check(icon is ImageTexture and icon.get_width() == 32 and icon.get_height() == 32,
		"item icons are generated at 32x32")
	_check(icon_factory.get_icon("hammer") == icon, "icons are cached per item")
	var icon_img: Image = icon_factory.make_image("hammer")
	var opaque := 0
	for iy in 32:
		for ix in 32:
			if icon_img.get_pixel(ix, iy).a > 0.5:
				opaque += 1
	_check(opaque > 60, "generated icon actually draws a shape (%d px)" % opaque)

	# --- Hotbar layout
	var hud = world.hud
	_check(hud._hotbar_slots.size() == 6, "hotbar has 6 slots")
	var bar: Control = hud._hotbar_slots[0].panel.get_parent()
	_check(bar is HBoxContainer, "hotbar slots are laid out in an HBoxContainer")
	_check(bar.anchor_left == 0.5 and bar.anchor_right == 0.5
		and bar.anchor_top == 1.0 and bar.anchor_bottom == 1.0, "hotbar anchored to bottom centre")
	_check(bar.grow_horizontal == Control.GROW_DIRECTION_BOTH, "hotbar grows out symmetrically")
	_check(bar.offset_bottom < 0.0, "hotbar lifted off the bottom edge")
	# Measured on the laid-out screen, not just from the anchor settings
	var vp_size: Vector2 = root.get_visible_rect().size
	var bar_rect: Rect2 = bar.get_global_rect()
	_check(bar_rect.size.x > 400.0, "hotbar row has real width (%d px)" % int(bar_rect.size.x))
	_check(absf(bar_rect.get_center().x - vp_size.x * 0.5) < 2.0,
		"hotbar is horizontally centred on screen")
	_check(bar_rect.end.y < vp_size.y and bar_rect.end.y > vp_size.y - 60.0,
		"hotbar sits just above the bottom edge")
	var slot_style = hud._hotbar_slots[0].panel.get_theme_stylebox("panel")
	_check(slot_style is StyleBoxFlat and slot_style.bg_color.a < 1.0,
		"hotbar slots have semi-transparent backgrounds")
	_check(hud._hotbar_slots[0].icon.texture != null, "equipped belt item shows an icon")

	# --- Pause menu
	_check(not hud._pause_menu.visible, "pause menu hidden by default")
	_check(not paused, "scene tree not paused during play")
	hud.handle_escape()
	_check(hud._pause_menu.visible, "ESC opens the pause menu")
	_check(paused, "ESC actually pauses the scene tree")
	_check(game.ui_open == "pause", "UI state switches to 'pause'")
	hud.handle_escape()
	_check(not hud._pause_menu.visible, "ESC again closes the pause menu")
	_check(not paused, "closing the pause menu resumes the tree")

	# --- Save / load round trip
	world.save_game()
	_check(FileAccess.file_exists("user://rust_save.json"), "save file written")
	var f := FileAccess.open("user://rust_save.json", FileAccess.READ)
	var data = JSON.parse_string(f.get_as_text())
	f.close()
	_check(data is Dictionary and data.structures.size() == world.structures.size(),
		"save contains all %d structures" % world.structures.size())
	var saved_tc = null
	for entry in data.structures:
		if entry.type == "tool_cupboard":
			saved_tc = entry
	_check(saved_tc != null and saved_tc.has("upkeep"), "cupboard upkeep is persisted")
	_check(int(data.player.inventory.hammer) == 3, "save contains crafted hammers")
	_check(data.stations.size() == world.stations.size(),
		"save contains all %d deployed stations" % world.stations.size())
	var saved_box = null
	for entry in data.stations:
		if entry.type == "storage_box":
			saved_box = entry
	_check(saved_box != null and saved_box.has("stored"), "storage box contents are persisted")

	# Restore the player's real save (or leave none, as before the test)
	DirAccess.remove_absolute("user://rust_save.json")
	if _had_save:
		var rf := FileAccess.open("user://rust_save.json", FileAccess.WRITE)
		rf.store_string(_save_backup)
		rf.close()
	print("SMOKE TEST DONE")
