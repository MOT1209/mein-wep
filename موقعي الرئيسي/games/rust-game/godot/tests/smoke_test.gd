extends SceneTree
## Headless smoke test: boots the main scene, then exercises crafting,
## building placement/upgrade/repair, harvesting, NPC damage, doors and
## save/load. Run with:
##   godot --headless --path . --script res://tests/smoke_test.gd

## Margin the HUD is expected to keep from the screen edges.
const HUD_MARGIN_EXPECTED := 16.0

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
	if frame == 2:
		# Force the widest text the HUD will ever show, then let the
		# containers re-sort over the following frames before measuring.
		var g = root.get_node("/root/Game")
		for res_id in ["wood", "stone", "iron"]:
			g.inventory[res_id] = 999999
		g.inventory_changed.emit()
	if frame == 8:
		_run_tests()
		return true
	return false


func _check(ok: bool, test_name: String) -> void:
	print(("PASS: " if ok else "FAIL: ") + test_name)


## Puts a foundation under a staged piece. Stability is real now: a wall
## registered with nothing below it falls down like any other, so fixtures
## have to obey the same rule the building system enforces at placement.
func _footing(w: Node3D, script_ref, x: float, z: float) -> Node3D:
	var f = script_ref.new()
	f.setup("foundation")
	f.position = Vector3(x, w.terrain_height(x, z) + 0.1, z)
	w.add_child(f)
	w.register_structure(f)
	return f


## Is `local` (in the structure's own space) inside any of its collision
## boxes? Lets a geometry check run without waiting on the physics server.
func _covers(s: Node3D, local: Vector3) -> bool:
	for c in s.get_children():
		if not (c is CollisionShape3D):
			continue
		var box := (c as CollisionShape3D).shape as BoxShape3D
		if box == null:
			continue
		var p: Vector3 = local - (c as CollisionShape3D).position
		if absf(p.x) <= box.size.x * 0.5 and absf(p.y) <= box.size.y * 0.5 \
				and absf(p.z) <= box.size.z * 0.5:
			return true
	return false


## The flattest north-south strip on the map, as (x, z) of its near end.
## terrain_height is a static, unseeded function, so this picks the same
## place on every run.
func _flat_site(w: Node3D) -> Vector2:
	var best := Vector2(0, 0)
	var best_spread := INF
	for x in range(-150, 175, 25):
		for z in range(-150, 175, 25):
			# Monuments bring a tower on the terrain layer and their own
			# guards, neither of which belongs in a staged scene.
			var too_close := false
			for zone in w.rad_zones:
				if Vector2(float(x), float(z)).distance_to(zone) < 45.0:
					too_close = true
			if too_close:
				continue
			var lo := INF
			var hi := -INF
			for step in 7:
				var h: float = w.terrain_height(float(x), float(z) + float(step) * 4.0)
				lo = minf(lo, h)
				hi = maxf(hi, h)
			if hi - lo < best_spread:
				best_spread = hi - lo
				best = Vector2(float(x), float(z))
	return best


## Takes the scenery out of the staged corridor. Trees and rocks sit on the
## layer that blocks a line of sight, and one of them landing in the way
## would fail a test that has nothing to do with them. The layer is cleared
## rather than the node freed, because queue_free only lands at the end of
## the frame and these checks all run inside one.
func _clear_corridor(w: Node3D, x: float, z: float, length: float) -> void:
	for c in w.get_children():
		if not (c is CollisionObject3D) or c is CharacterBody3D:
			continue
		var body := c as CollisionObject3D
		if body.collision_layer & (2 | 4) == 0:
			continue
		var dz: float = body.position.z - z
		if dz < -4.0 or dz > length:
			continue
		if absf(body.position.x - x) > 6.0:
			continue
		body.collision_layer = 0


func _run_tests() -> void:
	var game = root.get_node("/root/Game")
	world.started = true
	game.set_ui("")

	# A fresh game now starts with almost nothing, so stock the materials
	# these mechanic checks need rather than relying on the opening loadout.
	# Kept inside the slot limit on purpose: 30 slots is the rule under test
	# further down, and a fixture that ignores it would break every add.
	for res in ["wood", "stone", "frag", "iron", "cloth", "scrap"]:
		game.inventory[res] = 500
	game.inventory["wood"] = 750   # the upgrade and repair checks below spend it
	game.inventory_changed.emit()

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
	# Skips the monument guards: they spawn first, and they have their own
	# checks further down that a kill here would rob of a live subject.
	var npc: Node = null
	for c in world.get_children():
		if c.has_method("npc_take_damage") and c.npc_type != "scientist":
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
		# First swing on an untouched node: no mark is showing yet
		tree2.hit_harvest("metal_hatchet")
		_check(game.get_count("wood") == w0 + 36, "metal hatchet yields 3x wood per swing")

		# --- Sweet spot
		# Kept alive on purpose: a doubled swing would otherwise fell the
		# tree before the sequence below finishes.
		tree2.health = 99
		_check(tree2.sweet_spot() != Vector3.INF, "the first swing puts a mark on the node")
		var mark: Vector3 = tree2.sweet_spot()
		_check(tree2.is_sweet_hit(mark), "a swing landing on the mark counts")
		_check(not tree2.is_sweet_hit(mark + Vector3(3, 0, 0)),
			"a swing well away from it does not")
		var w1: int = game.get_count("wood")
		tree2.hit_harvest("metal_hatchet", mark)
		_check(game.get_count("wood") == w1 + 72, "hitting the mark doubles that swing")
		_check(tree2.sweet_spot() != mark, "and the mark moves, so it cannot be farmed")
		# Aimed well away from wherever the mark landed this time — the new
		# spot is random, so re-using the old one is not a reliable miss.
		var w2: int = game.get_count("wood")
		tree2.hit_harvest("metal_hatchet", tree2.sweet_spot() + Vector3(5, 0, 0))
		_check(game.get_count("wood") == w2 + 36, "a swing away from the mark is worth nothing extra")
	if ore2 != null:
		var iron0: int = game.get_count("iron")
		var oil0: int = game.get_count("oil")
		ore2.hit_harvest("drill")
		# The drill chews the whole node, so it never has to find the mark —
		# it always swings as if it had. The node's total is unchanged either
		# way: the bonus takes health off just as fast as it gives ore.
		_check(game.get_count("iron") == iron0 + 64,
			"the drill never has to aim (4x tool, doubled)")
		_check(game.get_count("oil") == oil0 + 3, "drill is the source of crude oil")

	# --- Workbench tier gating
	game.workbench_level = 0
	game.inventory["wood"] = 750
	game.inventory["frag"] = 750
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
	game.inventory["gunpowder"] = 200
	game.inventory["lgf"] = 50
	game.inventory["frag"] = 500
	_check(game.craft("explosives", 2), "gunpowder chains up into explosives")
	game.inventory["explosives"] = 100
	game.inventory["cloth"] = 50
	_check(game.craft("c4", 1), "explosives make a satchel charge")
	_check(game.required_workbench("c4") == 2, "C4 is gated behind workbench 2")

	# --- Blast damage scales with the tier's resistance
	_footing(world, StructureScript, 200, 200)
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
	_footing(world, StructureScript, 210, 210)
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

	_footing(world, StructureScript, 300, 300)
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

	# --- A fresh save really is a survival start
	var fresh = load("res://scripts/game.gd").new()
	fresh.reset_state()
	var handout := 0
	for id in fresh.inventory:
		if id not in ["building_plan", "hammer"]:
			handout += int(fresh.inventory[id])
	_check(handout == 0, "a new game hands out no free resources (%d)" % handout)
	_check(int(fresh.inventory.get("hammer", 0)) == 1, "you still start with a hammer")
	fresh.free()

	# --- High quality metal has a source now
	var monument_crate: Node = null
	for c in world.get_children():
		if c.is_queued_for_deletion() or not c.has_method("hit_harvest"):
			continue
		if c.res_type == "crate":
			monument_crate = c
			break
	_check(monument_crate != null, "monument crates exist in the world")
	if monument_crate != null:
		var hqm0: int = game.get_count("hqm")
		monument_crate.hit_harvest("")
		_check(game.get_count("hqm") > hqm0, "a monument crate yields high quality metal")
	# Earlier checks spent the stock, so top up everything the rifle needs
	game.inventory["hqm"] = 100
	game.inventory["pipe"] = 10
	game.inventory["spring"] = 10
	game.inventory["scrap"] = 250
	game.inventory["wood"] = 750
	game.workbench_level = 2
	_check(game.craft("ak47", 1), "the assault rifle is now craftable")

	# --- Weapons actually do something
	_check(game.WEAPONS.has("bow") and game.WEAPONS.has("ak47"), "weapons have combat stats")
	var player = world.player
	var victim: Node = null
	for c in world.get_children():
		if c.has_method("npc_take_damage") and not c.is_queued_for_deletion():
			victim = c
			break
	_check(victim != null, "found a creature to shoot")
	if victim != null:
		# Ranged weapons spend a round per shot
		game.inventory["ammo_rifle"] = 3
		game.belt[0] = "ak47"
		game.selected_belt_slot = 0
		player._weapon_cd = 0.0
		player._use_weapon("ak47")
		_check(game.get_count("ammo_rifle") == 2, "firing the rifle spends one round")
		player._weapon_cd = 0.0
		game.inventory["ammo_rifle"] = 0
		player._use_weapon("ak47")
		_check(game.get_count("ammo_rifle") == 0, "with no ammo the rifle does not fire")
		# Melee weapons need no ammo and hit harder than fists
		player._weapon_cd = 0.0
		var ammo_left: int = game.get_count("ammo_rifle")
		player._use_weapon("machete")
		_check(game.get_count("ammo_rifle") == ammo_left,
			"the machete swings without spending ammo")
		_check(float(game.WEAPONS["machete"].damage) > game.FIST_DAMAGE,
			"a weapon beats bare hands")
	_check(float(game.WEAPONS["ak47"].range) > float(game.WEAPONS["machete"].range),
		"ranged weapons reach further than melee")
	game.belt[0] = "building_plan"

	# --- A wall actually stops a charging animal
	var NpcScript = load("res://scripts/npc.gd")
	_footing(world, StructureScript, 120, 100)
	var blocker = StructureScript.new()
	blocker.setup("wall")
	blocker.position = Vector3(120, 2, 100)
	world.add_child(blocker)
	world.register_structure(blocker)
	blocker.apply_tier("stone")
	player.position = Vector3(120, 2, 96)     # player behind the wall
	var hunter = NpcScript.new()
	hunter.setup("wolf", world)
	world.add_child(hunter)
	hunter.position = Vector3(120, 2, 102)    # wolf just outside the wall
	_check(hunter.collision_mask & 2 != 0, "creatures collide with structures")

	# Run long enough that an unblocked wolf would be well past the wall,
	# otherwise the check passes even when collision is broken.
	var start_z: float = hunter.position.z
	for i in 240:
		hunter._physics_process(0.05)
	var blocked_z: float = hunter.position.z
	_check(blocked_z < start_z, "the wolf charged towards the player")
	_check(blocked_z > blocker.position.z,
		"the wall stopped it (wolf z=%.1f, wall z=%.1f)" % [blocked_z, blocker.position.z])

	# Control run: with the wall gone it must actually get through, which
	# proves the previous result came from the wall and not from the wolf
	# being too slow to reach it. The layer is cleared rather than the node
	# freed, because queue_free only takes effect at the end of the frame
	# and the body would still be blocking during this loop.
	blocker.collision_layer = 0
	world.unregister_structure(blocker)
	hunter.position = Vector3(120, 2, 102)
	for i in 240:
		hunter._physics_process(0.05)
	_check(hunter.position.z < blocker.position.z,
		"without the wall it reaches the player side (z=%.1f)" % hunter.position.z)
	hunter.queue_free()
	blocker.queue_free()

	# --- A doorway is a frame, not a slab
	# It used to get a wall's full 3x3 collision box, so the opening you can
	# see through was solid: nobody could walk through their own door.
	#
	# Everything below is staged on level ground with the scenery cleared
	# out of the way: creatures snap to the terrain each frame, so on a
	# slope a wall ends up above or below whatever it should be blocking,
	# and a stray tree would block a line of sight the test is measuring.
	# Each piece sits on its own patch of ground, the way the building
	# system places it — a guard is only a hand's width shorter than a
	# doorway is tall, so putting the frame on someone else's ground level
	# is enough to catch it on the lintel.
	var site := _flat_site(world)
	var sx: float = site.x
	var sz: float = site.y
	var y_player: float = world.terrain_height(sx, sz + 4.0)
	var y_gate: float = world.terrain_height(sx, sz + 8.0)
	var y_walker: float = world.terrain_height(sx, sz + 12.0)
	var y_cover: float = world.terrain_height(sx, sz + 16.0)
	var y_sniper: float = world.terrain_height(sx, sz + 20.0)
	_clear_corridor(world, sx, sz, 26.0)

	_footing(world, StructureScript, sx, sz + 8.0)
	var gate = StructureScript.new()
	gate.setup("doorway")
	gate.position = Vector3(sx, y_gate + 1.5, sz + 8.0)
	world.add_child(gate)
	world.register_structure(gate)
	var solid_wall = StructureScript.new()
	solid_wall.setup("wall")

	# Knee height in the middle of the piece: clear on a doorway, solid on a wall
	var knee := Vector3(0.0, -0.5, 0.0)
	_check(not _covers(gate, knee), "the middle of a doorway is walkable")
	_check(_covers(solid_wall, knee), "the middle of a wall is not")
	_check(_covers(gate, Vector3(1.2, -0.5, 0.0)), "the doorway still has posts")
	_check(_covers(gate, Vector3(0.0, 1.2, 0.0)), "and a lintel above the opening")
	solid_wall.queue_free()

	# End to end: a creature that a wall stopped walks straight through this
	player.position = Vector3(sx, y_player, sz + 4.0)
	var walker = NpcScript.new()
	walker.setup("wolf", world)
	world.add_child(walker)
	walker.position = Vector3(sx, y_walker, sz + 12.0)
	walker.home = walker.position
	for i in 300:
		walker._physics_process(0.05)
	_check(walker.position.z < gate.position.z,
		"a creature gets through the opening (z=%.1f, doorway z=%.1f)"
		% [walker.position.z, gate.position.z])
	walker.queue_free()

	# --- Monument guards
	var guards := []
	for c in world.get_children():
		if c.has_method("npc_take_damage") and c.npc_type == "scientist":
			guards.append(c)
	var expected_guards: int = world.GUARDS_PER_MONUMENT * world.rad_zones.size()
	_check(guards.size() == expected_guards,
		"every monument is staffed (%d guards, %d monuments)"
		% [guards.size(), world.rad_zones.size()])
	var posted := true
	for g in guards:
		var flat := Vector2(g.position.x, g.position.z)
		var near := false
		for zone in world.rad_zones:
			if flat.distance_to(zone) <= world.GUARD_POST_RADIUS + 1.0:
				near = true
		posted = posted and near
	_check(posted, "guards stand on the monument they protect")
	_check(float(game.WEAPONS["bow"].range) >= 45.0,
		"a bow outranges the guards' rifles, so they can be fought")

	# --- Guards shoot on sight, and a wall stops the bullet
	# The staged corridor runs down x = sx: player at sz+4, guard at sz+20,
	# the doorway between them (its opening is clear at eye height).
	for g in guards:
		g.position = Vector3(300, 0, 300)   # keep the real ones out of this
	var sniper = NpcScript.new()
	sniper.setup("scientist", world)
	world.add_child(sniper)
	sniper.position = Vector3(sx, y_sniper, sz + 20.0)
	sniper.home = sniper.position          # spawn_npc does this for real guards
	player.position = Vector3(sx, y_player, sz + 4.0)
	game.stats.health = 100.0
	seed(20260727)   # guards miss on a dice roll; keep the run repeatable
	for i in 120:
		sniper._physics_process(0.1)
	var open_ground_hp: float = game.stats.health
	_check(open_ground_hp < 100.0,
		"a guard shoots the player from 16m (hp=%.0f)" % open_ground_hp)
	_check(sniper.hit_chance(4.0) > sniper.hit_chance(40.0),
		"and hits less often the further out you are (%.2f near, %.2f far)"
		% [sniper.hit_chance(4.0), sniper.hit_chance(40.0)])
	_check(sniper.hit_chance(4.0) < 1.0, "even point blank is not a certainty")

	_footing(world, StructureScript, sx, sz + 16.0)
	var cover = StructureScript.new()
	cover.setup("wall")
	cover.position = Vector3(sx, y_cover + 1.5, sz + 16.0)
	world.add_child(cover)
	world.register_structure(cover)
	cover.apply_tier("stone")
	sniper.position = Vector3(sx, y_sniper, sz + 20.0)
	sniper._attack_cd = 0.0
	game.stats.health = 100.0
	for i in 10:
		sniper._physics_process(0.1)
	_check(game.stats.health == 100.0, "a wall between them stops the shots")

	# --- Doors, and what a lock is actually for
	var front_door = StructureScript.new()
	front_door.setup("wooden_door")
	front_door.position = Vector3(sx, y_gate + 1.05, sz + 8.0)   # fills the doorway
	world.add_child(front_door)
	world.register_structure(front_door)
	front_door.apply_tier("wood")
	_check(not front_door.is_locked(), "a fresh door has no lock")
	_check(front_door.npc_open_door(), "anything hostile can open an unlocked door")
	_check(front_door.is_open, "the door swung open")
	_check(absf(front_door.position.x - sx) > 0.4,
		"an open door swings clear of the opening instead of standing in it")
	front_door.toggle_door()
	_check(front_door.position.is_equal_approx(Vector3(sx, y_gate + 1.05, sz + 8.0)),
		"and comes back to its own hinge line when shut")

	game.inventory["lock"] = 1
	game.belt[0] = "lock"
	game.selected_belt_slot = 0
	player._install_lock(front_door, "lock")
	_check(front_door.is_locked() and front_door.lock_type == "lock", "the held key lock goes on the door")
	_check(game.get_count("lock") == 0, "installing spent the lock")
	_check(not front_door.npc_open_door(), "a locked door refuses a hostile")
	_check(front_door.npc_open_door() == false and not front_door.is_open, "and stays shut")
	front_door.toggle_door()
	_check(front_door.is_open, "the owner still walks through their own locked door")
	front_door.toggle_door()

	# A key lock is a padlock: break it and the door works again
	var door_hp: float = front_door.health
	front_door.attack_lock(float(game.LOCKS["lock"].strength))
	_check(not front_door.is_locked(), "a key lock can be broken open")
	_check(front_door.health == door_hp, "breaking the lock left the door itself intact")

	# A code lock has no keyhole, so the door has to come down instead
	game.inventory["codelock"] = 1
	game.belt[0] = "codelock"
	player._install_lock(front_door, "codelock")
	_check(front_door.lock_type == "codelock", "a code lock replaces the broken one")
	front_door.attack_lock(60.0)
	_check(front_door.is_locked(), "a code lock cannot be picked")
	_check(front_door.health < door_hp, "the blows land on the door instead (hp=%.0f)" % front_door.health)
	game.belt[0] = "building_plan"

	# A guard forces the unlocked door and walks in after you
	var raider = NpcScript.new()
	raider.setup("scientist", world)
	world.add_child(raider)
	raider.position = Vector3(sx, y_walker, sz + 12.0)
	raider.home = raider.position
	player.position = Vector3(sx, y_player, sz + 4.0)   # behind the door, out of sight
	front_door._remove_lock()
	front_door.set_door_state(false)
	for i in 500:
		raider._physics_process(0.05)
	_check(front_door.is_open, "a guard opens an unlocked door to get at you")

	# Locked, the same approach gets it nowhere
	front_door.set_door_state(false)
	front_door.install_lock("codelock")
	front_door.health = front_door.max_health
	raider.position = Vector3(sx, y_walker, sz + 12.0)
	raider._attack_cd = 0.0
	for i in 500:
		raider._physics_process(0.05)
	_check(not front_door.is_open, "a locked door keeps it out")
	_check(front_door.health < front_door.max_health,
		"so it works on the door instead (hp=%.0f/%.0f)" % [front_door.health, front_door.max_health])
	raider.queue_free()
	sniper.queue_free()

	# --- Guards are renewable, and worth the ammunition
	var queued_before: int = world.npc_respawn_queue.size()
	var scrap_before: int = game.get_count("scrap")
	var rifle_ammo_before: int = game.get_count("ammo_rifle")
	if not guards.is_empty():
		guards[0].npc_take_damage(500.0)
		_check(world.npc_respawn_queue.size() == queued_before + 1,
			"a dead guard is queued to be replaced")
		_check(game.get_count("scrap") > scrap_before, "guards drop scrap")
		_check(game.get_count("ammo_rifle") > rifle_ammo_before,
			"and rifle ammo, which is otherwise a tier-2 craft")

	# --- Soft side: which way round you build a wall matters
	_footing(world, StructureScript, sx, sz + 24.0)
	var raid_wall = StructureScript.new()
	raid_wall.setup("wall")
	raid_wall.position = Vector3(sx, y_cover + 1.5, sz + 24.0)
	world.add_child(raid_wall)
	world.register_structure(raid_wall)
	raid_wall.apply_tier("stone")
	var inside := Vector3(sx, y_cover, sz + 25.0)    # the builder's side
	var outside := Vector3(sx, y_cover, sz + 23.0)
	raid_wall.soft_normal = (inside - raid_wall.position).normalized()
	raid_wall.soft_normal.y = 0.0
	raid_wall.soft_normal = raid_wall.soft_normal.normalized()

	_check(raid_wall.is_soft_side(inside), "the side the builder stood on is the weak one")
	_check(not raid_wall.is_soft_side(outside), "the far side is not")
	raid_wall.health = raid_wall.max_health
	var hard_dealt: float = raid_wall.take_hit(50.0, outside)
	var soft_dealt: float = raid_wall.take_hit(50.0, inside)
	_check(hard_dealt == 50.0, "a hit from outside lands for face value")
	_check(soft_dealt == 50.0 * game.SOFT_SIDE_MULT,
		"the same hit from inside lands for %.0fx (%.0f vs %.0f)"
		% [game.SOFT_SIDE_MULT, soft_dealt, hard_dealt])

	raid_wall.health = raid_wall.max_health
	var hard_blast: float = raid_wall.take_blast(200.0, outside)
	raid_wall.health = raid_wall.max_health
	var soft_blast: float = raid_wall.take_blast(200.0, inside)
	_check(soft_blast > hard_blast, "a charge on the weak face is worth more explosive")
	_check(hard_blast < 200.0, "and the tier's blast resistance still applies")

	var no_builder = StructureScript.new()
	no_builder.setup("wall")
	world.add_child(no_builder)
	_check(not no_builder.is_soft_side(inside),
		"a piece with no recorded builder has no weak face at all")
	_check(no_builder.take_hit(10.0, inside) == 10.0, "so it takes hits at face value")
	no_builder.queue_free()
	raid_wall.health = raid_wall.max_health

	# --- Armour
	game.worn = {}
	_check(game.armour_protection() == 0.0, "a bare player soaks nothing")
	game.stats.health = 100.0
	game.hurt(20.0)
	_check(game.stats.health == 80.0, "unarmoured damage lands in full")

	game.inventory["road_vest"] = 1
	_check(game.wear("road_vest"), "a crafted vest can be worn")
	_check(game.is_worn("road_vest"), "and reads as worn")
	_check(game.get_count("road_vest") == 1, "wearing it does not consume it")
	_check(absf(game.armour_protection() - 0.25) < 0.001, "the vest soaks 25%")
	game.stats.health = 100.0
	game.hurt(20.0)
	_check(absf(game.stats.health - 85.0) < 0.001, "so 20 damage arrives as 15")

	game.inventory["metal_facemask"] = 1
	game.wear("metal_facemask")
	_check(absf(game.armour_protection() - 0.45) < 0.001,
		"a second piece in a different slot stacks (%.2f)" % game.armour_protection())
	game.inventory["wood_armour"] = 1
	game.wear("wood_armour")
	_check(game.worn.get("chest", "") == "wood_armour",
		"a second chest piece replaces the first rather than stacking")
	_check(not game.is_worn("road_vest"), "the vest came off")
	game.wear("wood_armour")
	_check(not game.is_worn("wood_armour"), "clicking it again takes it off")

	# The cap: nothing makes you immune
	game.worn = {"chest": "road_vest", "head": "metal_facemask", "suit": "hazmat"}
	_check(game.armour_protection() <= game.ARMOUR_CAP, "stacked armour is capped")

	# Radiation is the monument's other weapon, and the hazmat is its answer
	_check(game.radiation_protection() > 0.5, "a hazmat suit keeps most radiation out")
	# Measured standing in an actual monument zone — the staged corridor is
	# deliberately far from one, so this has to go to the radiation.
	var zone: Vector2 = world.rad_zones[0]
	var parked: Vector3 = player.position
	player.position = Vector3(zone.x, world.terrain_height(zone.x, zone.y), zone.y)
	game.worn = {}
	game.stats.radiation = 0.0
	world._process(1.0)
	var bare_rads: float = game.stats.radiation
	_check(bare_rads > 0.0, "standing in a monument's radiation builds it up")
	game.worn = {"suit": "hazmat"}
	game.stats.radiation = 0.0
	world._process(1.0)
	_check(game.stats.radiation < bare_rads,
		"and the suit slows it right down (%.2f suited vs %.2f bare)"
		% [game.stats.radiation, bare_rads])
	game.worn = {}
	game.stats.radiation = 0.0
	player.position = parked

	# --- Furnace: one interaction, everything it can process
	var big_furnace = world._spawn_station("furnace", Vector3(-20, 0, -20))
	game.inventory["oil"] = 10
	game.inventory["iron"] = 40
	game.inventory["sulfur_ore"] = 30
	game.inventory["wood"] = 500
	game.inventory["lgf"] = 0
	game.inventory["frag"] = 0
	game.inventory["sulfur"] = 0
	game.inventory["charcoal"] = 0
	big_furnace.interact_station()
	_check(game.get_count("lgf") == 2, "it refined the oil")
	_check(game.get_count("frag") == 40, "and smelted the metal ore in the same pass")
	_check(game.get_count("sulfur") == 30, "and the sulfur ore, which used to have no step")
	_check(game.get_count("charcoal") == 35, "burnt wood left charcoal behind")
	_check(game.get_count("oil") == 0 and game.get_count("sulfur_ore") == 0,
		"every input was consumed")

	# Sulfur is a smelted product now, not something a node hands you
	var sulfur_node: Node = null
	for c in world.get_children():
		if c.has_method("hit_harvest") and not c.is_queued_for_deletion() \
				and c.res_type == "sulfur":
			sulfur_node = c
			break
	if sulfur_node != null:
		var raw0: int = game.get_count("sulfur_ore")
		var refined0: int = game.get_count("sulfur")
		sulfur_node.hit_harvest("stone_pickaxe")
		_check(game.get_count("sulfur_ore") > raw0, "a sulfur node yields ore")
		_check(game.get_count("sulfur") == refined0, "and no usable sulfur on its own")

	# --- Map and compass
	var map = world.hud.map_ui
	_check(map != null and map.world == world, "the map knows the world it is drawing")
	_check(map._texture != null and map._texture.get_width() == map.MAP_PIXELS,
		"the terrain is rendered once into a %dpx texture" % map.MAP_PIXELS)
	# The terrain function is static and unseeded, so the same spot on the
	# map must be the same colour on every run
	var map_img: Image = map._texture.get_image()
	var deep := map_img.get_pixel(map.MAP_PIXELS / 2, map.MAP_PIXELS / 2)
	_check(deep.a > 0.0 and (deep.r + deep.g + deep.b) > 0.0,
		"the map has actual terrain on it, not a blank square")

	# Corners of the world land in corners of the map
	var top_left: Vector2 = map.world_to_map(
		Vector3(-Game.WORLD_SIZE * 0.5, 0, -Game.WORLD_SIZE * 0.5))
	var bottom_right: Vector2 = map.world_to_map(
		Vector3(Game.WORLD_SIZE * 0.5, 0, Game.WORLD_SIZE * 0.5))
	var middle: Vector2 = map.world_to_map(Vector3.ZERO)
	_check(top_left.x < middle.x and top_left.y < middle.y,
		"the west-north corner maps above and left of the centre")
	_check(bottom_right.x > middle.x and bottom_right.y > middle.y,
		"and the east-south corner below and right of it")

	_check(InputMap.has_action("map"), "the map has a key of its own")
	_check(not map.visible, "it starts closed")
	map.toggle()
	_check(map.visible and game.ui_open == "map", "M opens it and claims the UI")
	world.hud.handle_escape()
	_check(not map.visible and game.ui_open == "", "and ESC puts it away")

	# Compass headings, measured the way the player's yaw runs
	_check(map.heading_of(0.0) == "N", "facing forward reads north")
	_check(map.heading_of(deg_to_rad(-90.0)) == "E", "a quarter turn right is east")
	_check(map.heading_of(deg_to_rad(180.0)) == "S", "half a turn is south")
	_check(map.heading_of(deg_to_rad(90.0)) == "W", "a quarter turn left is west")

	# --- Carrying capacity
	var stashed: Dictionary = game.inventory.duplicate()
	var stashed_worn: Dictionary = game.worn.duplicate()
	game.inventory = {}
	game.worn = {}
	_check(game.slots_used() == 0, "an empty inventory uses no slots")
	game.inventory["wood"] = game.stack_size("wood")
	_check(game.slots_used() == 1, "a full stack of wood is one slot")
	game.inventory["wood"] = game.stack_size("wood") + 1
	_check(game.slots_used() == 2, "one over spills into a second")
	_check(game.stack_size("ak47") == 1, "a rifle takes a slot to itself")
	_check(game.stack_size("scrap") == game.stack_size("wood"),
		"scrap hauls like a raw material, whatever tab it sits in")

	# Fill it right up and the world stops handing you things
	game.inventory = {}
	for i in game.INVENTORY_SLOTS:
		game.inventory["filler_%d" % i] = 1
	_check(game.slots_used() == game.INVENTORY_SLOTS, "the inventory is full")
	_check(game.room_for("wood") == 0, "with no room for anything new")
	_check(game.add_item("wood", 500) == 0, "and add_item takes nothing in")
	_check(game.get_count("wood") == 0, "so nothing appeared out of nowhere")

	# A swing with nowhere to put the result leaves the node standing
	var full_tree: Node = null
	for c in world.get_children():
		if c.has_method("hit_harvest") and not c.is_queued_for_deletion() \
				and c.res_type == "tree":
			full_tree = c
			break
	if full_tree != null:
		var tree_hp: int = full_tree.health
		full_tree.hit_harvest("stone_hatchet", Vector3.INF)
		_check(full_tree.health == tree_hp,
			"a full inventory does not spend the tree it cannot carry")

	# Crafting must not eat the materials and hand back nothing
	game.inventory = {}
	for i in game.INVENTORY_SLOTS - 1:
		game.inventory["filler_%d" % i] = 1
	game.inventory["wood"] = game.stack_size("wood")   # exactly the last slot
	_check(game.slots_used() == game.INVENTORY_SLOTS, "one slot of wood, none spare")
	var wood_kept: int = game.get_count("wood")
	_check(not game.craft("hammer", 1), "a craft with no room to land is refused")
	_check(game.get_count("wood") == wood_kept, "and the wood is still there")

	# Boxes hold a fixed amount, and what will not fit stays with you
	game.inventory = {}
	game.inventory["wood"] = 5000    # 20 slots
	var box = world._spawn_station("storage_box", Vector3(-26, 0, -26))
	_check(box.capacity() == game.BOX_SLOTS["storage_box"],
		"a storage box holds %d slots" % box.capacity())
	box.interact_station()
	_check(game.slots_for(box.stored) <= box.capacity(),
		"the box never takes more than it holds (%d/%d)"
		% [game.slots_for(box.stored), box.capacity()])
	_check(game.get_count("wood") > 0, "and the overflow stays in your pockets")
	var in_box: int = int(box.stored.get("wood", 0))
	var carried_wood: int = game.get_count("wood")
	_check(in_box + carried_wood == 5000, "nothing went missing in between")

	game.inventory = stashed
	game.worn = stashed_worn
	game.inventory_changed.emit()

	# --- Stability: a base stands on its foundations, and falls with them
	var tower_x := sx + 12.0
	var tower_z := sz + 8.0
	var footing = _footing(world, StructureScript, tower_x, tower_z)
	var ground: float = world.terrain_height(tower_x, tower_z)
	var tower_wall = StructureScript.new()
	tower_wall.setup("wall")
	tower_wall.position = Vector3(tower_x, ground + 1.5, tower_z)
	world.add_child(tower_wall)
	world.register_structure(tower_wall)
	var tower_roof = StructureScript.new()
	tower_roof.setup("ceiling")
	tower_roof.position = Vector3(tower_x, ground + 3.0, tower_z)
	world.add_child(tower_roof)
	world.register_structure(tower_roof)

	world.recompute_stability()
	_check(footing.stability == 100.0, "a foundation anchors its column at 100")
	_check(tower_wall.stability == 100.0 - game.STABILITY_DROP,
		"the wall on it loses a step (%d)" % roundi(tower_wall.stability))
	_check(tower_roof.stability < tower_wall.stability,
		"and the ceiling above that loses another (%d)" % roundi(tower_roof.stability))
	_check(tower_roof.stability > 0.0, "but a two-storey column still stands")

	# The HUD has to be reading this and not a number made up from height
	world.hud.update_build_info(tower_wall, false)
	_check(str(roundi(tower_wall.stability)) in world.hud._info_tier.text,
		"the build panel shows the real stability (%s)" % world.hud._info_tier.text)

	# Blow the footing out and the whole column comes down with it
	var standing_before: int = world.structures.size()
	footing.take_hit(99999.0)
	_check(not is_instance_valid(tower_wall) or tower_wall.is_queued_for_deletion(),
		"destroying the foundation drops the wall on it")
	_check(not is_instance_valid(tower_roof) or tower_roof.is_queued_for_deletion(),
		"and everything the wall was holding up")
	_check(world.structures.size() == standing_before - 3,
		"three pieces left the world, not one")

	# A column that never had a foundation was never standing to begin with
	var orphan = StructureScript.new()
	orphan.setup("wall")
	orphan.position = Vector3(sx - 30.0, world.terrain_height(sx - 30.0, sz) + 1.5, sz)
	world.add_child(orphan)
	world.register_structure(orphan)
	world.recompute_stability()
	_check(not is_instance_valid(orphan) or orphan.is_queued_for_deletion(),
		"a wall with nothing under it falls down")

	# --- Dying costs you what you were carrying
	game.reset_loadout()
	game.inventory["hqm"] = 40
	game.inventory["ak47"] = 1
	game.inventory["road_vest"] = 1
	game.wear("road_vest")
	game.belt[2] = "ak47"
	var carried_before: int = game.get_count("hqm")
	var died_at := Vector3(sx, y_player, sz + 4.0)
	player.position = died_at
	game.stats.health = 0.0
	world._on_player_death()

	_check(game.get_count("hqm") == 0, "the loot you were carrying is gone from your pockets")
	_check(game.get_count("ak47") == 0, "and so is the rifle")
	_check(game.worn.is_empty(), "the armour came off with it")
	_check(game.get_count("hammer") == 1 and game.get_count("building_plan") == 1,
		"but you respawn able to build your way back")
	_check(game.stats.health == 100.0, "and at full health")

	var bag: Node = null
	for c in world.get_children():
		if c.has_method("interact_station") and c.has_method("is_empty"):
			bag = c
	_check(bag != null, "a bag was left where you fell")
	if bag != null:
		_check(bag.position.distance_to(died_at) < 3.0,
			"at the spot you died, not at the spawn")
		_check(int(bag.stored.get("hqm", 0)) == carried_before,
			"holding everything you had")
		_check(str(bag.worn.get("chest", "")) == "road_vest", "including the armour")
		bag.interact_station()
		_check(game.get_count("hqm") == carried_before, "looting it gives the lot back")
		_check(game.is_worn("road_vest"), "and puts the armour back on")
		_check(game.belt.has("ak47"), "and restores the belt slot it was in")

	# A sleeping bag is what turns a death into a walk rather than a restart
	_check(game.DEPLOYABLES.has("sleeping_bag"), "a sleeping bag is placeable")
	var bed_pos := Vector3(sx + 4.0, world.terrain_height(sx + 4.0, sz), sz)
	var bed = world._spawn_station("sleeping_bag", bed_pos)
	_check(world.nearest_sleeping_bag(died_at) == bed, "the world can find your bed")
	player.position = died_at
	game.stats.health = 0.0
	world._on_player_death()
	_check(player.position.distance_to(bed_pos) < 3.0,
		"you wake up at your bed, not on the shore")
	_check(player.position.distance_to(Vector3.ZERO) > 3.0, "which is not the world origin")

	# Death with empty pockets leaves no litter
	var bags_before: int = world.bags.size()
	game.reset_loadout()
	game.inventory = {}
	world._on_player_death()
	_check(world.bags.size() == bags_before, "an empty death drops no bag")

	# --- Crude oil is no longer a dead end
	var refinery = world._spawn_station("furnace", Vector3(-14, 0, -14))
	game.inventory["oil"] = 20
	game.inventory["iron"] = 0
	var lgf0: int = game.get_count("lgf")
	refinery.interact_station()
	_check(game.get_count("lgf") > lgf0, "a furnace refines crude oil into low grade fuel")
	_check(game.get_count("oil") == 0, "the oil was consumed")

	# --- Sprint is a rebindable action, not a hardcoded key
	_check(InputMap.has_action("sprint"), "sprint is a real input action")

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
	_check(icon is Texture2D and icon.get_width() >= 32, "items resolve to a texture")
	_check(icon_factory.get_icon("hammer") == icon, "icons are cached per item")

	# Blender-rendered PNGs are preferred over the generated pictograms
	_check(icon_factory.has_rendered_icon("hammer"), "hammer has a rendered icon")
	_check(icon.get_width() == 256, "rendered icons come through at 256px")
	var rendered_missing := []
	for expected in ["ak47", "machete", "building_plan", "wood", "stone",
			"sulfur", "bandage", "codelock", "rocket_launcher", "stone_pickaxe"]:
		if not icon_factory.has_rendered_icon(expected):
			rendered_missing.append(expected)
	_check(rendered_missing.is_empty(),
		"every item named in the icon batch was rendered %s" % str(rendered_missing))

	# Items with no model still fall back to a drawn pictogram
	_check(not icon_factory.has_rendered_icon("berries"), "berries has no render yet")
	var fallback = icon_factory.get_icon("berries")
	_check(fallback is ImageTexture and fallback.get_width() == 32,
		"unrendered items fall back to a 32px pictogram")
	var icon_img: Image = icon_factory.make_image("berries")
	var opaque := 0
	for iy in 32:
		for ix in 32:
			if icon_img.get_pixel(ix, iy).a > 0.5:
				opaque += 1
	_check(opaque > 60, "the pictogram fallback still draws a shape (%d px)" % opaque)

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

	# --- Stats panel: every label must fit its slot and stay on screen.
	# The six-digit resource counts were primed several frames ago so the
	# containers have already re-laid out at their widest.
	_check(hud._bar_fills.size() == 5, "all five survival stats have a row")
	hud._process(0.016)

	var clipped := []
	var stack: Array = [hud]
	while not stack.is_empty():
		var node = stack.pop_back()
		for child in node.get_children():
			stack.append(child)
		if not (node is Label):
			continue
		var lab: Label = node
		if lab.text == "" or not lab.is_visible_in_tree():
			continue
		var needed: float = lab.get_minimum_size().x
		if lab.size.x + 0.5 < needed:
			clipped.append("%s('%s') %.0f < %.0f" % [lab.name, lab.text, lab.size.x, needed])
	_check(clipped.is_empty(), "no HUD label is narrower than its own text %s" % str(clipped))

	# Screen-position assertions are useless here (headless renders into a
	# tiny dummy window), so assert the invariant that actually prevents
	# overflow instead: every edge-anchored HUD control must grow AWAY from
	# the edge it is pinned to, never across it.
	var bad_growth := []
	for child in hud.get_children():
		if not (child is Control):
			continue
		var c: Control = child
		if not is_equal_approx(c.anchor_left, c.anchor_right):
			continue   # stretched full width, nothing to overflow
		var expected := Control.GROW_DIRECTION_BOTH
		if is_equal_approx(c.anchor_left, 1.0):
			expected = Control.GROW_DIRECTION_BEGIN
		elif is_equal_approx(c.anchor_left, 0.0):
			expected = Control.GROW_DIRECTION_END
		if c.grow_horizontal != expected:
			bad_growth.append("%s anchor=%.1f grow=%d expected=%d"
				% [c.name, c.anchor_left, c.grow_horizontal, expected])
	_check(bad_growth.is_empty(),
		"every edge-anchored HUD control grows away from its edge %s" % str(bad_growth))

	# bar -> row -> rows -> stats panel -> right-hand column
	var stats_col: Control = hud._bar_fills["health"].bar \
		.get_parent().get_parent().get_parent().get_parent()
	_check(stats_col.size_flags_horizontal == Control.SIZE_SHRINK_END,
		"stats column hugs the right side of its container")
	_check(stats_col.size_flags_vertical == Control.SIZE_SHRINK_BEGIN,
		"stats column hugs the top of its container")
	var stats_wrap: Control = stats_col.get_parent()
	_check(stats_wrap is MarginContainer, "stats column is placed by a MarginContainer")
	_check(stats_wrap.get_theme_constant("margin_right") == int(HUD_MARGIN_EXPECTED)
		and stats_wrap.get_theme_constant("margin_top") == int(HUD_MARGIN_EXPECTED),
		"stats panel keeps its margin from the top-right corner")
	_check(is_equal_approx(stats_wrap.anchor_right, 1.0)
		and is_equal_approx(stats_wrap.anchor_bottom, 1.0),
		"the stats wrapper covers the whole screen, so the margin is honoured")
	_check(hud._bar_fills["temperature"].bar is ProgressBar,
		"stats use real ProgressBar nodes")
	_check(hud._bar_fills["health"].value.text == str(roundi(float(game.stats.health))),
		"each stat shows its numeric value")

	# --- Responsive display settings
	_check(str(ProjectSettings.get_setting("display/window/stretch/mode")) == "canvas_items",
		"stretch mode is canvas_items so the UI scales with the window")
	_check(str(ProjectSettings.get_setting("display/window/stretch/aspect")) == "expand",
		"stretch aspect is expand so wider screens gain view, not bars")

	# --- Layout direction. An Arabic Godot install mirrors every container
	# and anchor unless the UI pins itself, which put the right-anchored
	# stats panel on the left edge with its rows reversed.
	var ltr_violations := []
	var ltr_stack: Array = [hud]
	while not ltr_stack.is_empty():
		var n = ltr_stack.pop_back()
		for c in n.get_children():
			ltr_stack.append(c)
		if n is Control and (n as Control).layout_direction != Control.LAYOUT_DIRECTION_LTR:
			# Children added later inherit from their parent, so only the
			# nodes built up front must be pinned.
			ltr_violations.append(n.name)
	_check(ltr_violations.is_empty(),
		"the whole HUD is pinned to left-to-right %s" % str(ltr_violations.slice(0, 5)))

	# --- Compact slot sizing, measured after layout rather than trusted
	# from the setting: a 256px source icon silently became the minimum
	# size of its TextureRect and blew the panels open.
	_check(hud.HOTBAR_SLOT_SIZE == Vector2(64, 64), "hotbar slots are configured 64x64")
	var slot_rect: Vector2 = hud._hotbar_slots[0].panel.size
	_check(slot_rect.x <= 66.0 and slot_rect.y <= 66.0,
		"a hotbar slot really renders at %.0fx%.0f" % [slot_rect.x, slot_rect.y])
	var hb_icon: TextureRect = hud._hotbar_slots[0].icon
	_check(hb_icon.expand_mode == TextureRect.EXPAND_IGNORE_SIZE,
		"hotbar icons ignore their source resolution")
	_check(hb_icon.size.x <= 66.0,
		"the hotbar icon really renders at %.0fpx, not its 256px source" % hb_icon.size.x)
	var res_icon: TextureRect = null
	for c in hud._res_counts["wood"].get_parent().get_children():
		if c is TextureRect:
			res_icon = c
	_check(res_icon != null and res_icon.expand_mode == TextureRect.EXPAND_IGNORE_SIZE,
		"resource icons ignore their source resolution")
	_check(res_icon != null and res_icon.size.x <= 24.0,
		"a resource icon really renders at %.0fpx" % (res_icon.size.x if res_icon else -1.0))
	_check(hud.inventory_ui.SLOT_SIZE == Vector2(80, 80), "inventory tiles are 80x80")
	_check(hud.inventory_ui.BELT_SLOT_SIZE == Vector2(64, 64), "belt tiles match the hotbar")

	# --- Touch controls
	var touch = hud.touch_controls
	_check(touch != null, "touch control layer exists")
	_check(not touch.visible or game.touch_ui,
		"touch controls stay hidden unless a touchscreen was detected")
	var actions := []
	for spec in touch.PAD_BUTTONS:
		actions.append(spec.action)
	for needed in ["attack", "jump", "interact", "inventory"]:
		_check(needed in actions, "touch pad has a %s button" % needed)
		_check(InputMap.has_action(needed), "'%s' is a real input action" % needed)

	hud.set_touch_ui(true)
	_check(touch.visible, "touch controls appear once enabled")
	_check(Input.mouse_mode == Input.MOUSE_MODE_VISIBLE,
		"the mouse is never captured in touch mode")
	touch._layout()
	_check(touch._button_rects.size() == touch.PAD_BUTTONS.size(),
		"every pad button got a hit rect")
	var vp_rect := Rect2(Vector2.ZERO, touch.get_viewport_rect().size)
	var stick_ok: bool = touch._stick_centre.x < vp_rect.size.x * 0.5
	_check(stick_ok, "the joystick sits on the left half of the screen")
	var pad_right := true
	for entry in touch._button_rects:
		if entry.rect.get_center().x < vp_rect.size.x * 0.5:
			pad_right = false
	_check(pad_right, "the action pad sits on the right half of the screen")

	# Deflecting the stick drives the same actions the keyboard uses
	touch._update_stick(touch._stick_centre + Vector2(touch.STICK_RADIUS, 0))
	_check(Input.is_action_pressed("move_right") and not Input.is_action_pressed("move_left"),
		"pushing the stick right presses move_right")
	_check(Input.get_action_strength("move_right") > 0.9, "full deflection gives full strength")
	touch._update_stick(touch._stick_centre + Vector2(0, -touch.STICK_RADIUS))
	_check(Input.is_action_pressed("move_forward"), "pushing the stick up presses move_forward")
	touch._update_stick(touch._stick_centre)
	_check(not Input.is_action_pressed("move_right")
		and not Input.is_action_pressed("move_forward"),
		"centring the stick releases the movement actions")
	hud.set_touch_ui(false)
	_check(not touch.visible, "touch controls hide again when disabled")

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
	var saved_lock = null
	for entry in data.structures:
		if str(entry.get("lock", "")) == "codelock":
			saved_lock = entry
	_check(saved_lock != null and saved_lock.has("lock_health"),
		"a fitted lock survives the save")
	# Asserted against live state rather than a number fixed earlier in the
	# run: dying now empties your pockets, and the save must follow that.
	_check(int(data.player.inventory.get("hammer", 0)) == game.get_count("hammer"),
		"save matches the inventory the player actually has")
	_check(data.player.has("worn"), "worn armour is persisted")
	var live_bags := 0
	for left_behind in world.bags:
		if is_instance_valid(left_behind) and not left_behind.is_empty():
			live_bags += 1
	_check(data.bags.size() == live_bags,
		"death bags are written to the save (%d)" % live_bags)
	if live_bags > 0:
		_check(data.bags[0].has("stored") and data.bags[0].has("left"),
			"with their contents and the time they have left")
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
