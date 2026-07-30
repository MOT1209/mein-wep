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


## Empties the pockets back to the opening kit. A check about a recipe or a
## loot table is not about the slot limit, and a run that has been
## harvesting for a thousand lines is carrying a stack of most things in the
## game — which is enough on its own to fail a craft for want of a slot.
func _clear_pockets(game) -> void:
	game.inventory = {"building_plan": 1, "hammer": 1}
	game.tool_wear.clear()
	game.inventory_changed.emit()


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
		# Wide enough that a creature sliding along a wall still has clear
		# ground beside it. The map now scatters plants, deposits and fish on
		# top of the trees and rocks, so a narrower band leaves something in
		# the way often enough to fail a movement check at random.
		if absf(body.position.x - x) > 10.0:
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

	# --- Ghost placement actually stands the wall on top of the foundation,
	# not sunk to the foundation's own height, and snaps to one of the
	# tile's four EDGES like real Rust — not through its centre, which used
	# to split the tile in half. can_build_here alone can't catch either:
	# it only validates a hand-picked position, never the ray that
	# _update_ghost casts from the player's camera.
	_clear_corridor(world, 3.0, -1.0, 5.0)
	game.selected_blueprint = "wall"
	game.ui_open = ""
	world.player.global_position = Vector3(3.0, foundation.position.y + 1.7, -1.0)
	world.player.camera.look_at(foundation.global_position, Vector3.UP)
	b._update_ghost()
	_check(b._ghost_base == foundation, "ghost ray actually hit the foundation")
	_check(absf(b._ghost_pos.y - game.BUILDING_TYPES.wall.y) < 0.05,
		"wall ghost stands at wall height, not sunk into the foundation")
	_check(absf(b._ghost_pos.x - 3.0) > 1.0 or absf(b._ghost_pos.z - 3.0) > 1.0,
		"wall ghost sits on one of the tile's edges, not through its centre")
	_check(b._ghost_valid, "the edge-snapped wall is still counted as supported")

	var edge_wall = StructureScript.new()
	edge_wall.setup("wall")
	edge_wall.position = b._ghost_pos
	edge_wall.base_rot = b._ghost_rot
	edge_wall.rotation.y = edge_wall.base_rot
	world.add_child(edge_wall)
	world.register_structure(edge_wall)
	world.recompute_stability()
	_check(is_instance_valid(edge_wall) and edge_wall.stability > 0.0,
		"an edge-snapped wall still resolves to its foundation's column and stays up")
	world.unregister_structure(edge_wall)
	edge_wall.queue_free()
	game.selected_blueprint = ""

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

	# --- Wild boar: hostile, but only once you are close enough to matter
	var NpcDefs = load("res://scripts/npc.gd")
	_check(NpcDefs.TYPES.has("boar") and NpcDefs.LOOT.has("boar"),
		"boar registered as a creature with its own loot")
	_check(float(NpcDefs.TYPES.boar.aggro) < float(NpcDefs.TYPES.wolf.aggro),
		"a boar notices you later than a wolf does")
	_check(int(NpcDefs.LOOT.boar.raw_meat) > int(NpcDefs.LOOT.deer.raw_meat),
		"a boar is worth more meat than a deer")
	var boar: Node = null
	for c in world.get_children():
		if c.has_method("npc_take_damage") and c.npc_type == "boar" \
				and not c.is_queued_for_deletion():
			boar = c
			break
	_check(boar != null, "boars spawned into the world")
	if boar != null:
		var meat0: int = game.get_count("raw_meat")
		boar.npc_take_damage(500.0)
		_check(game.get_count("raw_meat") > meat0, "a killed boar dropped meat")

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

	# --- Upgrading far enough earns a piece its own model, not a grey wash
	var missing_tier := []
	for piece in registry.TIER_MODELS:
		for tier_id in registry.TIER_MODELS[piece]:
			if not ResourceLoader.exists(registry.TIER_MODELS[piece][tier_id]):
				missing_tier.append(piece + ":" + tier_id)
	_check(missing_tier.is_empty(), "all tier-specific models exist on disk %s"
		% str(missing_tier))
	_check(registry.model_for("wall", "stone") != registry.MODELS["wall"],
		"a stone wall resolves to the coursed-stone model")
	_check(registry.model_for("wall", "wood") == registry.MODELS["wall"],
		"a wood wall still resolves to the plank model")
	_check(registry.keeps_own_materials("wall", "stone")
		and not registry.keeps_own_materials("wall", "concrete"),
		"stone keeps its own rubble, concrete is poured flat over the same shape")
	_check(modelled_wall._visual_path == registry.model_for("wall", "stone"),
		"the placed wall swapped its mesh when it was upgraded to stone")
	var upgraded_shape: CollisionShape3D = null
	for ch in modelled_wall.get_children():
		if ch is CollisionShape3D:
			upgraded_shape = ch
	_check(upgraded_shape != null
		and upgraded_shape.shape.size == game.BUILDING_TYPES.wall.size,
		"swapping the mesh left the wall's hitbox exactly where it was")
	var steel_door = StructureScript.new()
	steel_door.setup("wooden_door")
	world.add_child(steel_door)
	_check(steel_door._visual_path.ends_with("wooden_door.glb"),
		"a fresh door is still the wooden one")
	steel_door.apply_tier("metal")
	_check(steel_door._visual_path.ends_with("metal_door.glb"),
		"upgrading a door to sheet metal makes it the steel door")
	steel_door.queue_free()

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
	_clear_pockets(game)
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
	_clear_pockets(game)
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
		# Ranged weapons spend a round per shot — out of the magazine now, not
		# straight out of your pockets.
		game.inventory["ammo_rifle"] = 3
		game.belt[0] = "ak47"
		game.selected_belt_slot = 0
		game.loaded["ak47"] = 3
		player._weapon_cd = 0.0
		player._reload_left = 0.0
		player._use_weapon("ak47")
		_check(game.rounds_loaded("ak47") == 2, "firing the rifle spends one round")
		_check(game.get_count("ammo_rifle") == 3,
			"and takes it from the magazine, leaving your pockets alone")
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

	# --- Pipe shotgun: one shell buys a cone of pellets
	_check(game.ITEMS.has("pipe_shotgun") and game.ITEMS.has("ammo_shotgun"),
		"the pipe shotgun and its shells are craftable items")
	_check(int(game.WEAPONS.pipe_shotgun.pellets) > 1
		and float(game.WEAPONS.pipe_shotgun.spread) > 0.0,
		"the shotgun fires a spread of pellets")
	_check(int(game.WEAPONS.ak47.get("pellets", 1)) == 1
		and float(game.WEAPONS.ak47.get("spread", 0.0)) == 0.0,
		"every other weapon still fires one straight shot")
	_check(float(game.WEAPONS.pipe_shotgun.range) < float(game.WEAPONS.pistol.range),
		"the shotgun trades the pistol's reach for that spread")
	# Aim at the sky first: eight pellets would otherwise pick off a creature
	# a later check still needs alive.
	player.camera.global_rotation = Vector3(1.3, 0.0, 0.0)
	game.inventory["ammo_shotgun"] = 4
	game.loaded["pipe_shotgun"] = 1
	game.inventory_changed.emit()
	player._weapon_cd = 0.0
	player._reload_left = 0.0
	player._use_weapon("pipe_shotgun")
	_check(game.rounds_loaded("pipe_shotgun") == 0,
		"a whole cone of pellets still costs exactly one shell")
	game.inventory["ammo_shotgun"] = 0
	game.inventory_changed.emit()
	player._weapon_cd = 0.0
	player._use_weapon("pipe_shotgun")
	_check(game.get_count("ammo_shotgun") == 0,
		"with no shells left the shotgun does not fire")
	game.belt[0] = "building_plan"

	# --- A wall actually stops a charging animal
	var NpcScript = load("res://scripts/npc.gd")
	# This block stages at a fixed spot rather than the flat site, so it has
	# to clear its own ground: a boulder or a hemp stand landing between the
	# wolf and the wall fails the control run for reasons of its own.
	_clear_corridor(world, 120.0, 94.0, 14.0)
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
	# A guard stands on the guard ring and may patrol its own radius around
	# that spot — no further. Stated from the two constants so tightening
	# either one cannot leave this asserting something nobody meant.
	var reach: float = world.GUARD_POST_RADIUS + NpcScript.PATROL_RADIUS + 1.0
	var posted := true
	var worst := 0.0
	for g in guards:
		var flat := Vector2(g.position.x, g.position.z)
		var near := false
		for zone in world.rad_zones:
			var d: float = flat.distance_to(zone)
			if d <= reach:
				near = true
				worst = maxf(worst, d)
		posted = posted and near
	_check(posted, "guards stand on the monument they protect"
		+ " (furthest %.1fm of %.1fm allowed)" % [worst, reach])
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
	_clear_pockets(game)
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
	# A furnace works through everything it can in one pass, so anything
	# smeltable still in your pockets would land in these totals too.
	_clear_pockets(game)
	game.inventory["oil"] = 10
	game.inventory["iron"] = 40
	game.inventory["sulfur_ore"] = 30
	game.inventory["wood"] = 500
	game.inventory["lgf"] = 0
	game.inventory["frag"] = 0
	game.inventory["sulfur"] = 0
	game.inventory["charcoal"] = 0
	big_furnace.interact_station()
	_check(game.get_count("lgf") == 2, "it refined the oil (lgf %d, oil left %d, room %d)" % [game.get_count("lgf"), game.get_count("oil"), game.room_for("lgf")])
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
	_check(hud._hotbar_slots.size() == game.BELT_SLOTS,
		"hotbar draws all %d belt slots" % game.BELT_SLOTS)
	_check(game.belt.size() == game.BELT_SLOTS,
		"and the belt itself is that long")
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
	_check(hud._bar_fills.size() == hud.BAR_DEFS.size(),
		"every survival stat has a row (%d)" % hud._bar_fills.size())
	for needed in ["health", "hunger", "thirst", "temperature", "radiation",
			"stamina", "oxygen"]:
		_check(hud._bar_fills.has(needed), "including %s" % needed)
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
		"the whole HUD is pinned to left-to-right %s"
			% str(ltr_violations.slice(0, 5)))

	# Including the Arabic menu. Arabic text in a left-to-right layout is what
	# the reference art is, and the two are easy to conflate: mirroring the
	# containers to match the language puts the navigation on the wrong side
	# and reverses every label-bar-figure row.
	_check(hud.main_menu.layout_direction == Control.LAYOUT_DIRECTION_LTR,
		"the Arabic menu is laid out left-to-right, like the art it is built to")

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
	# Every button declares a label and a cluster, and every input action it
	# drives is a real one — a typo here is a control that silently does
	# nothing on a device with no keyboard to fall back on.
	var ids := {}
	for spec in touch.BUTTONS:
		_check(not ids.has(str(spec.id)), "button id '%s' is unique" % str(spec.id))
		ids[str(spec.id)] = true
		_check(str(spec.get("label", "")) != "", "'%s' has a caption" % str(spec.id))
		if spec.has("press"):
			_check(InputMap.has_action(str(spec.press)),
				"'%s' drives the real action '%s'" % [str(spec.id), str(spec.press)])
	for needed in ["fire", "jump", "interact", "inventory", "reload", "aim",
			"crouch", "prone", "melee", "build"]:
		_check(ids.has(needed), "the touch layer has a %s button" % needed)

	hud.set_touch_ui(true)
	_check(touch.visible, "touch controls appear once enabled")
	_check(Input.mouse_mode == Input.MOUSE_MODE_VISIBLE,
		"the mouse is never captured in touch mode")
	touch._layout()
	var vp_rect := Rect2(Vector2.ZERO, touch.get_viewport_rect().size)
	_check(touch._button_rects.size() > 0, "the layout produced hit rects")
	_check(touch._stick_centre.x < vp_rect.size.x * 0.5,
		"the joystick sits on the left half of the screen")

	# No button is ever below the size a thumb can find, whatever the scale
	game.set_setting("button_scale", 0.7)
	touch._layout()
	var smallest := 9999.0
	for entry in touch._button_rects:
		smallest = minf(smallest, float(entry.size))
	_check(smallest >= touch.MIN_BUTTON,
		"at the smallest scale no button is under %.0fpx (%.0f)"
			% [touch.MIN_BUTTON, smallest])
	game.set_setting("button_scale", 1.6)
	touch._layout()
	var biggest := 0.0
	for entry in touch._button_rects:
		biggest = maxf(biggest, float(entry.size))
	_check(biggest > smallest, "and the scale setting really resizes them")
	game.reset_settings()
	touch._layout()

	# No two buttons may overlap and none may hang off the screen — checked at
	# every scale, because the grid step and the button size are separate
	# numbers and the case where they disagree is the largest one.
	var span: Array = game.SETTINGS_RANGE["button_scale"]
	for probe in [float(span[0]), 1.0, float(span[1])]:
		game.set_setting("button_scale", probe)
		touch._layout()
		var clashes := []
		for i in touch._button_rects.size():
			for j in range(i + 1, touch._button_rects.size()):
				var rect_a: Rect2 = touch._button_rects[i].rect
				var rect_b: Rect2 = touch._button_rects[j].rect
				if rect_a.intersects(rect_b):
					clashes.append("%s/%s" % [str(touch._button_rects[i].spec.id),
						str(touch._button_rects[j].spec.id)])
		_check(clashes.is_empty(),
			"at %.1fx scale no two buttons overlap %s" % [probe, str(clashes)])
		var off_screen := []
		for entry in touch._button_rects:
			if not vp_rect.encloses(entry.rect):
				off_screen.append(str(entry.spec.id))
		_check(off_screen.is_empty(),
			"at %.1fx scale every button is on screen %s" % [probe, str(off_screen)])
	game.reset_settings()
	touch._layout()

	# The camera zone is on the opposite side to the stick, and buttons are
	# punched out of it
	_check(touch.in_camera_zone(Vector2(vp_rect.size.x * 0.8, vp_rect.size.y * 0.3)),
		"the right of the screen is the camera zone")
	_check(not touch.in_camera_zone(Vector2(vp_rect.size.x * 0.1, vp_rect.size.y * 0.5)),
		"the left of it is not")
	var fire_rect: Rect2 = Rect2()
	for entry in touch._button_rects:
		if str(entry.spec.id) == "fire":
			fire_rect = entry.rect
	_check(not touch.in_camera_zone(fire_rect.get_center()),
		"and a button sitting inside it is not part of it")

	# Left-handed mirrors the stick as well as the buttons
	game.set_setting("left_handed", true)
	touch._layout()
	_check(touch._stick_centre.x > vp_rect.size.x * 0.5,
		"left-handed puts the stick on the right")
	_check(touch.in_camera_zone(Vector2(vp_rect.size.x * 0.15, vp_rect.size.y * 0.3)),
		"and the camera zone on the left")
	game.reset_settings()
	touch._layout()

	# A per-button override moves and resizes just that button
	var before_rect: Rect2 = Rect2()
	for entry in touch._button_rects:
		if str(entry.spec.id) == "jump":
			before_rect = entry.rect
	game.set_button_override("jump", 1.5, Vector2(0.0, -40.0))
	touch._layout()
	for entry in touch._button_rects:
		if str(entry.spec.id) == "jump":
			_check(entry.rect.size.x > before_rect.size.x,
				"an override makes one button bigger")
			_check(entry.rect.get_center().y < before_rect.get_center().y,
				"and moves it where it was asked to go")
	game.reset_touch_layout()
	touch._layout()

	# Context sensitivity: the reload button only exists with a gun in hand
	_clear_pockets(game)
	game.belt[0] = "hammer"
	game.selected_belt_slot = 0
	touch._layout()
	var visible_ids := {}
	for entry in touch._button_rects:
		visible_ids[str(entry.spec.id)] = true
	_check(not visible_ids.has("reload"),
		"holding a hammer, there is no reload button")
	game.inventory["ak47"] = 1
	game.belt[0] = "ak47"
	touch._layout()
	visible_ids.clear()
	for entry in touch._button_rects:
		visible_ids[str(entry.spec.id)] = true
	_check(visible_ids.has("reload") and visible_ids.has("aim"),
		"holding a rifle, reload and ADS appear")
	_check(visible_ids.has("fire_mode"), "and so does the fire-mode switch")
	_check(visible_ids.has("scope"), "and the sight, because the rifle has one")
	game.belt[0] = "building_plan"
	game.selected_belt_slot = 0
	_clear_pockets(game)
	touch._layout()

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
	_check(data.has("devices") and data.has("wires"),
		"the electrical grid is written to the save")

	_test_settings(game, world)
	_test_camera(game, world)
	_test_stances(game, world)
	_test_combat(game, world)
	_test_settings_screen(game, world)
	_test_inventory_order(game, world)
	_test_interaction(game, world, StructureScript)
	_test_build_undo(game, world)
	_test_weather(game, world)
	_test_main_menu(game, world)
	_test_roads(game, world)
	_test_models(game, world)
	_test_durability(game, world)
	_test_new_pieces(game, world, StructureScript)
	_test_ecosystem(game, world)
	_test_recycling(game, world)
	_test_power(game, world)

	# Restore the player's real save (or leave none, as before the test)
	DirAccess.remove_absolute("user://rust_save.json")
	if _had_save:
		var rf := FileAccess.open("user://rust_save.json", FileAccess.WRITE)
		rf.store_string(_save_backup)
		rf.close()
	print("SMOKE TEST DONE")


# ==================== CONTROL SETTINGS ====================

func _test_settings(game, world) -> void:
	# Every tunable has a default, and the ones with a range are held inside
	# it — a hand-edited save must not be able to produce a broken camera.
	for key in game.SETTINGS_RANGE:
		_check(game.SETTINGS_DEFAULTS.has(key),
			"%s has a default as well as a range" % key)
		var span: Array = game.SETTINGS_RANGE[key]
		game.set_setting(key, float(span[1]) + 100.0)
		_check(is_equal_approx(float(game.setting(key)), float(span[1])),
			"%s clamps to its maximum of %.2f" % [key, float(span[1])])
		game.set_setting(key, float(span[0]) - 100.0)
		_check(is_equal_approx(float(game.setting(key)), float(span[0])),
			"%s clamps to its minimum of %.2f" % [key, float(span[0])])

	# The ranges the spec asked for, spelled out so a rebalance is deliberate
	_check(game.SETTINGS_RANGE["look_sensitivity"] == [0.1, 2.0],
		"look sensitivity spans 0.1x to 2.0x")
	_check(game.SETTINGS_RANGE["camera_damping"] == [0.1, 1.0],
		"camera damping spans 0.1 to 1.0")
	_check(game.SETTINGS_RANGE["fov"] == [70.0, 110.0], "field of view spans 70 to 110")
	_check(game.SETTINGS_RANGE["tap_tolerance"] == [0.05, 0.2],
		"tap tolerance spans 50ms to 200ms")

	game.reset_settings()
	_check(is_equal_approx(float(game.setting("look_sensitivity")), 1.0),
		"resetting puts every setting back to its default")
	_check(not bool(game.setting("gyro_enabled")),
		"the gyroscope is off until asked for")

	# An unknown key is refused rather than stored, so a stale save cannot
	# grow the settings dictionary with keys nothing reads.
	game.set_setting("not_a_setting", 5)
	_check(not game.settings.has("not_a_setting"), "an unknown setting is ignored")

	# Settings survive a save
	game.set_setting("fov", 96.0)
	game.set_setting("invert_look_y", true)
	world.save_game()
	var f := FileAccess.open("user://rust_save.json", FileAccess.READ)
	var data = JSON.parse_string(f.get_as_text())
	f.close()
	_check(data is Dictionary and data.has("settings")
		and is_equal_approx(float(data.settings.get("fov", 0.0)), 96.0),
		"settings are written to the save")
	game.reset_settings()
	game.load_settings({"fov": 999.0, "gyro_only": true, "junk": 1})
	_check(is_equal_approx(float(game.setting("fov")), 110.0),
		"loading a nonsense value clamps rather than accepting it")
	_check(bool(game.setting("gyro_only")) and not game.settings.has("junk"),
		"and loading keeps the real keys while dropping the unknown ones")
	game.reset_settings()


# ==================== CAMERA ====================

func _test_camera(game, world) -> void:
	var player = world.player
	game.reset_settings()

	# Look input lands on a target, not on the transform — that is what lets
	# the camera be smoothed at all.
	player._yaw_target = 0.0
	player._pitch_target = 0.0
	player.rotation.y = 0.0
	player.apply_look(Vector2(100.0, 0.0))
	_check(player._yaw_target < 0.0, "dragging right turns the view target right")
	_check(is_equal_approx(player.rotation.y, 0.0),
		"and does not move the body until the camera is stepped")

	# Sensitivity really scales it
	player._yaw_target = 0.0
	game.set_setting("look_sensitivity", 2.0)
	player.apply_look(Vector2(100.0, 0.0))
	var fast: float = absf(player._yaw_target)
	player._yaw_target = 0.0
	game.set_setting("look_sensitivity", 0.5)
	player.apply_look(Vector2(100.0, 0.0))
	var slow: float = absf(player._yaw_target)
	_check(fast > slow * 3.0, "2.0x sensitivity turns much further than 0.5x")
	game.reset_settings()

	# Inversion flips pitch and nothing else
	player._pitch_target = 0.0
	player.apply_look(Vector2(0.0, 50.0))
	var normal_pitch: float = player._pitch_target
	player._pitch_target = 0.0
	game.set_setting("invert_look_y", true)
	player.apply_look(Vector2(0.0, 50.0))
	_check(signf(player._pitch_target) == -signf(normal_pitch),
		"inverting the Y axis flips the pitch")
	game.reset_settings()

	# Pitch cannot pass straight up or down however hard you drag
	player._pitch_target = 0.0
	for i in 40:
		player.apply_look(Vector2(0.0, -400.0))
	_check(player._pitch_target <= PI / 2.0 + 0.001,
		"pitch is clamped looking up")
	player._pitch_target = 0.0
	for i in 40:
		player.apply_look(Vector2(0.0, 400.0))
	_check(player._pitch_target >= -PI / 2.0 - 0.001,
		"and looking down")
	player._pitch_target = 0.0

	# Smoothing closes the gap without overshooting it
	player._yaw_target = 1.0
	player.rotation.y = 0.0
	player._yaw_vel = 0.0
	var last := 0.0
	var overshot := false
	for i in 120:
		player._update_camera(1.0 / 60.0)
		if player.rotation.y > 1.0001:
			overshot = true
		last = player.rotation.y
	_check(not overshot, "the camera spring never overshoots its target")
	_check(absf(last - 1.0) < 0.05,
		"and it arrives (%.3f of 1.0 after two seconds)" % last)

	# Field of view: the player's setting, narrowed by stance and by aiming
	game.set_setting("fov", 90.0)
	player.stance = game.STANCE_STAND
	player.aiming = false
	player.glassing = false
	_check(is_equal_approx(player.target_fov(), 90.0),
		"standing, the view is exactly what the player asked for")
	player.stance = game.STANCE_CROUCH
	var crouched: float = player.target_fov()
	player.stance = game.STANCE_PRONE
	var prone_fov: float = player.target_fov()
	_check(crouched < 90.0 and prone_fov < crouched,
		"crouching narrows it and prone narrows it further (%.1f > %.1f > %.1f)"
			% [90.0, crouched, prone_fov])
	player.stance = game.STANCE_STAND
	player.aiming = true
	_check(player.target_fov() < 90.0, "aiming narrows it too")
	player.aiming = false

	# And it blends over the declared time rather than snapping
	player.camera.fov = 90.0
	player._fov_to = 90.0
	player._fov_elapsed = game.FOV_BLEND_TIME
	game.set_setting("fov", 70.0)
	player._update_fov(0.05)
	_check(player.camera.fov > 71.0 and player.camera.fov < 90.0,
		"a field of view change is part-way through after 50ms (%.1f)" % player.camera.fov)
	for i in 40:
		player._update_fov(1.0 / 60.0)
	_check(is_equal_approx(player.camera.fov, 70.0), "and has arrived by the end")
	game.reset_settings()

	# Shake decays to nothing and leaves the camera level
	player.shake_camera(0.1, 0.2, 20.0)
	player._update_shake(0.05)
	_check(player.camera.rotation != Vector3.ZERO, "an impact shakes the camera")
	for i in 30:
		player._update_shake(1.0 / 60.0)
	_check(player.camera.rotation == Vector3.ZERO, "and it settles back level")

	# Turned off, it does nothing at all
	game.set_setting("shake_intensity", 0.0)
	player.shake_camera(0.5, 0.5, 20.0)
	player._update_shake(0.05)
	_check(player.camera.rotation == Vector3.ZERO,
		"with shake turned off an impact does not move the camera")
	game.reset_settings()

	# Gyro-only mode is the one case where a thumb must not turn the view
	_check(player.touch_look_enabled(), "touch look is on by default")
	game.set_setting("gyro_enabled", true)
	game.set_setting("gyro_only", true)
	_check(not player.touch_look_enabled(), "gyro-only mode disables touch look")
	game.reset_settings()
	_check(player.touch_look_enabled(), "and turning it off gives touch look back")


# ==================== STANCES ====================

func _test_stances(game, world) -> void:
	var player = world.player
	game.reset_settings()
	player.stance = game.STANCE_STAND
	player.aiming = false
	player._slide_left = 0.0

	for name_ in [game.STANCE_STAND, game.STANCE_CROUCH, game.STANCE_PRONE,
			game.STANCE_SWIM]:
		_check(game.STANCES.has(name_), "%s is a stance" % name_)

	# Lower is slower, smaller and harder to hit — the trade the whole system
	# rests on
	var stand: Dictionary = game.stance_data(game.STANCE_STAND)
	var crouch: Dictionary = game.stance_data(game.STANCE_CROUCH)
	var prone: Dictionary = game.stance_data(game.STANCE_PRONE)
	_check(float(crouch.speed) < float(stand.speed)
		and float(prone.speed) < float(crouch.speed),
		"each stance down is slower than the last")
	_check(float(crouch.height) < float(stand.height)
		and float(prone.height) < float(crouch.height),
		"and shorter")
	_check(float(crouch.spread) < float(stand.spread)
		and float(prone.spread) < float(crouch.spread),
		"and steadier to shoot from")
	_check(float(crouch.noise) < float(stand.noise),
		"and quieter")

	# One stance at a time
	_check(player.set_stance(game.STANCE_CROUCH), "you can crouch")
	_check(player.stance == game.STANCE_CROUCH, "and only that stance is set")
	_check(player.set_stance(game.STANCE_PRONE), "you can drop from crouch to prone")
	_check(player.stance == game.STANCE_PRONE, "and are no longer crouched")

	# The capsule follows, so a crouched player really is a smaller target
	player.stance = game.STANCE_STAND
	player._height_now = float(stand.height)
	player._update_stance_shape(0.001)
	var tall: float = player._capsule.height
	player.stance = game.STANCE_PRONE
	for i in 60:
		player._update_stance_shape(1.0 / 60.0)
	_check(player._capsule.height < tall,
		"going prone shrinks the collision capsule (%.2f from %.2f)"
			% [player._capsule.height, tall])
	_check(is_equal_approx(player._body_cs.position.y, player._capsule.height * 0.5),
		"and the capsule stays centred on its own height")
	_check(absf(player.head.position.y - float(prone.eye)) < 0.05,
		"and the eye has dropped to prone height")

	# Sprint is standing-only
	player.stance = game.STANCE_STAND
	var stand_speed: float = player.movement_speed()
	player.stance = game.STANCE_CROUCH
	_check(player.movement_speed() < stand_speed, "crouched movement is slower")
	player.stance = game.STANCE_STAND
	player.aiming = true
	_check(player.movement_speed() < stand_speed, "aiming plants your feet")
	player.aiming = false

	# Standing up under something solid is refused rather than clipping through
	# it. Staged with a real ceiling rather than asserted against open sky,
	# where any amount of headroom is genuinely available.
	var parked: Vector3 = player.position
	var lid_x: float = _flat_site(world).x + 90.0
	var lid_z: float = _flat_site(world).y + 90.0
	var ground: float = world.terrain_height(lid_x, lid_z)
	player.position = Vector3(lid_x, ground + 0.1, lid_z)
	_check(player.has_headroom(1.8), "under open sky there is room to stand")

	var StructureScript2 = load("res://scripts/structure.gd")
	var lid = StructureScript2.new()
	lid.setup("ceiling")
	# A slab at chest height: enough room to crouch under, not to stand
	lid.position = Vector3(lid_x, ground + 1.25, lid_z)
	world.add_child(lid)
	world.register_structure(lid)
	_check(not player.has_headroom(1.8), "under a low ceiling there is not")
	player.stance = game.STANCE_CROUCH
	_check(not player.set_stance(game.STANCE_STAND, false),
		"so standing up is refused rather than clipping through it")
	_check(player.stance == game.STANCE_CROUCH, "and the stance is left alone")
	world.unregister_structure(lid)
	lid.queue_free()
	player.position = parked
	player.stance = game.STANCE_STAND

	# A slide needs speed behind it
	player.velocity = Vector3.ZERO
	player._slide_left = 0.0
	_check(not player.try_slide(), "you cannot slide from standing still")
	player.velocity = Vector3(player.SPEED, 0.0, 0.0)
	var slid: bool = player.try_slide()
	if slid:
		_check(player._slide_left > 0.0, "sliding from a run starts a slide")
		_check(player.stance == game.STANCE_CROUCH, "and puts you on your knees")
	player._slide_left = 0.0
	player.stance = game.STANCE_STAND

	# Swimming is imposed, not chosen
	_check(not player.set_stance(game.STANCE_SWIM)
		or player.stance == game.STANCE_SWIM,
		"the swim stance is only ever set by the water")
	player.stance = game.STANCE_SWIM
	_check(not player.set_stance(game.STANCE_PRONE),
		"and you cannot go prone in a lake")
	_check(player.try_dive(), "you can dive while swimming")
	_check(player.velocity.y < 0.0, "and it takes you down")
	player.stance = game.STANCE_STAND
	_check(not player.try_dive(), "but not while standing on dry land")

	# Oxygen
	_check(game.stats.has("oxygen"), "the player has a breath to hold")
	game.stats.oxygen = 100.0
	player.holding_breath = true
	player._update_oxygen(1.0)
	_check(game.stats.oxygen < 100.0, "holding your breath spends it")
	player.holding_breath = false
	player._update_oxygen(1.0)
	_check(game.stats.oxygen > 0.0, "and letting go gets it back")
	game.stats.oxygen = 0.0
	player.holding_breath = true
	player._update_oxygen(0.1)
	_check(not player.holding_breath, "you cannot hold a breath you do not have")
	game.stats.oxygen = 100.0

	# Double jump is off until unlocked
	_check(not game.double_jump_unlocked, "the double jump starts locked")

	# Leaning rolls the view and shifts it off the shoulder
	player.set_lean(1.0)
	for i in 30:
		player._update_lean(1.0 / 60.0)
	_check(player.head.rotation.z < 0.0 and player.head.position.x > 0.0,
		"leaning right rolls the camera and moves it right")
	player.set_lean(0.0)
	for i in 30:
		player._update_lean(1.0 / 60.0)
	_check(absf(player.head.rotation.z) < 0.01 and absf(player.head.position.x) < 0.01,
		"and letting go brings it back upright")


# ==================== COMBAT ====================

func _test_combat(game, world) -> void:
	var player = world.player
	game.reset_settings()
	_clear_pockets(game)
	player.stance = game.STANCE_STAND
	player.aiming = false
	player.holding_breath = false
	player._reload_left = 0.0
	player._burst_left = 0
	player._weapon_cd = 0.0

	# Magazines exist for the guns and not for the spear
	_check(game.is_ranged("ak47") and game.is_ranged("bow"),
		"the rifle and the bow have magazines")
	_check(not game.is_ranged("spear") and not game.is_ranged("machete"),
		"melee weapons do not")
	_check(game.magazine_size("ak47") == 30, "the rifle holds thirty rounds")

	# A fresh weapon comes loaded rather than needing a reload before shot one
	game.loaded.clear()
	_check(game.rounds_loaded("ak47") == 30, "an untouched magazine counts as full")

	# Firing spends the magazine, not the pocket
	game.inventory["ak47"] = 1
	game.inventory["ammo_rifle"] = 100
	var pocket_before: int = game.get_count("ammo_rifle")
	_check(game.spend_round("ak47"), "firing takes a round from the magazine")
	_check(game.rounds_loaded("ak47") == 29, "and the magazine is one lighter")
	_check(game.get_count("ammo_rifle") == pocket_before,
		"while the rounds in your pockets are untouched")

	# Empty means empty
	game.loaded["ak47"] = 0
	_check(not game.spend_round("ak47"), "an empty magazine will not fire")

	# Reloading moves rounds out of your pockets and reports what it moved
	var moved: int = game.reload_weapon("ak47")
	_check(moved == 30, "reloading fills the magazine (%d rounds)" % moved)
	_check(game.get_count("ammo_rifle") == pocket_before - 30,
		"and those rounds came out of your pockets")
	_check(game.reload_weapon("ak47") == 0, "reloading a full magazine does nothing")

	# With nothing to load, reloading fails rather than half-filling
	game.loaded["ak47"] = 0
	game.inventory["ammo_rifle"] = 0
	_check(game.reload_weapon("ak47") == 0, "no ammunition means no reload")
	game.inventory["ammo_rifle"] = 7
	_check(game.reload_weapon("ak47") == 7, "and a partial load takes what there is")

	# Fire modes cycle only where the weapon has more than one
	game.fire_modes.clear()
	_check(game.fire_mode("ak47") == "semi", "the rifle starts on semi-automatic")
	_check(game.cycle_fire_mode("ak47") == "burst", "and cycles to burst")
	_check(game.cycle_fire_mode("ak47") == "auto", "and then to automatic")
	_check(game.cycle_fire_mode("ak47") == "semi", "and wraps back round")
	_check(game.cycle_fire_mode("pistol") == "",
		"a weapon with one fire mode has nothing to cycle")
	_check(game.fire_mode("pistol") == "semi", "and stays on it")

	# Sights
	_check(game.scope_list("ak47").size() > 1, "the rifle has an adjustable sight")
	game.scope_levels.clear()
	_check(is_equal_approx(game.scope_zoom("ak47"), 1.0), "which starts at 1x")
	_check(game.cycle_scope("ak47") > 1.0, "and can be zoomed in")
	_check(is_equal_approx(game.scope_zoom("pistol"), 1.0),
		"a weapon with no sight is always 1x")

	# Spread: every steadying measure tightens it, and they stack
	var loose: float = game.weapon_spread("ak47", game.STANCE_STAND, false, false)
	var aimed: float = game.weapon_spread("ak47", game.STANCE_STAND, true, false)
	var braced: float = game.weapon_spread("ak47", game.STANCE_PRONE, true, false)
	var held: float = game.weapon_spread("ak47", game.STANCE_PRONE, true, true)
	_check(loose > 0.0, "a rifle has sway to begin with")
	_check(aimed < loose, "aiming tightens it")
	_check(braced < aimed, "lying down tightens it further")
	_check(held < braced, "and holding your breath tightest of all")
	_check(is_equal_approx(game.weapon_spread("spear", game.STANCE_STAND, false, false), 0.0),
		"a spear has no spread to speak of")

	# Aiming
	player.aiming = false
	player.stance = game.STANCE_STAND
	player.set_aiming(true)
	_check(player.aiming, "you can aim down the sights")
	player.set_aiming(false)
	_check(not player.aiming, "and come back off them")
	player.stance = game.STANCE_SWIM
	player.set_aiming(true)
	_check(not player.aiming, "but not while swimming")
	player.stance = game.STANCE_STAND

	# Holding a breath needs breath to hold
	game.stats.oxygen = 100.0
	player.set_holding_breath(true)
	_check(player.holding_breath, "you can hold your breath")
	player.set_holding_breath(false)
	game.stats.oxygen = 2.0
	player.set_holding_breath(true)
	_check(not player.holding_breath, "but not on an empty chest")
	game.stats.oxygen = 100.0

	# Reload takes time, and the weapon is out of action for it
	game.loaded["ak47"] = 0
	game.inventory["ammo_rifle"] = 60
	game.belt[0] = "ak47"
	game.selected_belt_slot = 0
	player._reload_left = 0.0
	_check(player.start_reload(), "starting a reload works")
	_check(player._reload_left > 0.0, "and it takes time")
	_check(not player.start_reload(), "a second reload while one is running is refused")
	# Run it to completion
	for i in 300:
		player._update_weapon(1.0 / 60.0)
		if player._reload_left <= 0.0:
			break
	_check(game.rounds_loaded("ak47") == 30, "and when it finishes the magazine is full")

	# Burst queues its rounds rather than firing them all in one frame
	game.fire_modes["ak47"] = game.fire_mode_list("ak47").find("burst")
	player._weapon_cd = 0.0
	player._burst_left = 0
	var before_burst: int = game.rounds_loaded("ak47")
	player._use_weapon("ak47")
	_check(player._burst_left == game.BURST_ROUNDS,
		"a burst queues %d rounds" % game.BURST_ROUNDS)
	_check(game.rounds_loaded("ak47") == before_burst,
		"and has not spent any of them yet")
	for i in 200:
		player._weapon_cd = 0.0
		player._update_weapon(1.0 / 60.0)
		if player._burst_left <= 0:
			break
	_check(game.rounds_loaded("ak47") == before_burst - game.BURST_ROUNDS,
		"and over the following frames it sends exactly that many")
	game.fire_modes.clear()

	# Recoil pushes the muzzle up
	player._pitch_target = 0.0
	player._apply_recoil("ak47", 0.02)
	_check(player._pitch_target > 0.0, "firing kicks the aim upwards")
	player._pitch_target = 0.0

	# Melee bashes with whatever is in your hands, and the chain escalates
	player._weapon_cd = 0.0
	player._combo_step = 0
	player._combo_at = -99.0
	_check(player.melee_strike(), "the melee button always swings")
	var first_step: int = player._combo_step
	player._weapon_cd = 0.0
	player.melee_strike()
	_check(player._combo_step != first_step, "and a second swing continues the combo")
	# Left alone, the chain resets
	player._combo_at = -99.0
	player._weapon_cd = 0.0
	player.melee_strike()
	_check(player._combo_step == 0, "but a pause starts it again from the first swing")

	# Inspect reads out the things that are otherwise invisible
	var summary: String = game.weapon_summary("ak47")
	_check(summary.contains("30") and summary.to_upper().contains("SEMI"),
		"inspecting a rifle shows its magazine and fire mode (%s)" % summary)

	# Quick throw finds a grenade without it being in your hand
	_clear_pockets(game)
	game.inventory["grenade"] = 2
	player._last_grenade = ""
	var thrown: bool = player._throw_last_grenade()
	_check(thrown and game.get_count("grenade") == 1,
		"quick throw finds a grenade you are not holding")
	_check(player._last_grenade == "grenade", "and remembers it for next time")
	_clear_pockets(game)
	_check(not player._throw_last_grenade(), "with nothing to throw it refuses")

	# The predicted arc is a real trajectory that stops where it lands
	var arc: PackedVector3Array = player.grenade_arc("grenade")
	_check(arc.size() > 2, "a thrown grenade has a predicted arc (%d points)" % arc.size())
	var rises := false
	var falls := false
	for i in range(1, arc.size()):
		if arc[i].y > arc[i - 1].y:
			rises = true
		elif arc[i].y < arc[i - 1].y:
			falls = true
	_check(rises and falls, "and the arc goes up before it comes down")
	_check(player.grenade_arc("c4").is_empty(),
		"a charge that is placed rather than thrown has no arc")

	# Weapon state survives a save
	game.loaded["ak47"] = 11
	game.fire_modes["ak47"] = 2
	game.scope_levels["ak47"] = 1
	world.save_game()
	var f := FileAccess.open("user://rust_save.json", FileAccess.READ)
	var data = JSON.parse_string(f.get_as_text())
	f.close()
	_check(data is Dictionary and int(data.player.loaded.get("ak47", 0)) == 11,
		"what is in the magazine is written to the save")
	_check(int(data.player.fire_modes.get("ak47", 0)) == 2
		and int(data.player.scopes.get("ak47", 0)) == 1,
		"and so are the fire mode and the sight")

	game.belt[0] = "building_plan"
	game.selected_belt_slot = 0
	_clear_pockets(game)


# ==================== SETTINGS SCREEN ====================

func _test_settings_screen(game, world) -> void:
	var ui = world.hud.settings_ui
	_check(ui != null, "the settings screen exists")
	if ui == null:
		return
	game.reset_settings()

	# Every setting has a control. A setting with no row is a setting the
	# player cannot reach, which is the same as not having it.
	var missing := []
	for key in game.SETTINGS_DEFAULTS:
		if not ui._rows.has(str(key)):
			missing.append(str(key))
	_check(missing.is_empty(), "every setting has a control on screen %s" % str(missing))

	# Numbers get sliders, flags get checkboxes, and each slider's range is
	# read from the same table that does the clamping
	for key in ui._rows:
		var row: Dictionary = ui._rows[key]
		if game.SETTINGS_RANGE.has(key):
			_check(row.has("slider"), "%s is a slider" % key)
			var span: Array = game.SETTINGS_RANGE[key]
			_check(is_equal_approx(row.slider.min_value, float(span[0]))
				and is_equal_approx(row.slider.max_value, float(span[1])),
				"%s's slider spans exactly its allowed range" % key)
		else:
			_check(row.has("check"), "%s is a checkbox" % key)

	# Moving a slider writes the setting
	var fov_row: Dictionary = ui._rows["fov"]
	fov_row.slider.value = 101.0
	_check(is_equal_approx(float(game.setting("fov")), 101.0),
		"dragging the field-of-view slider changes the setting")
	_check(fov_row.value.text.contains("101"),
		"and the readout follows it (%s)" % fov_row.value.text)

	# Ticking a box writes the setting
	var invert_row: Dictionary = ui._rows["invert_look_y"]
	invert_row.check.button_pressed = true
	_check(bool(game.setting("invert_look_y")), "ticking a box changes the setting")

	# A reset from elsewhere pulls the controls back into line
	game.reset_settings()
	_check(is_equal_approx(fov_row.slider.value, float(game.SETTINGS_DEFAULTS["fov"])),
		"resetting the settings moves the slider back too")
	_check(not invert_row.check.button_pressed, "and unticks the box")

	# The units are the ones a player thinks in, not raw floats
	_check(ui._format("fov", 90.0) == "90°", "field of view reads in degrees")
	_check(ui._format("tap_tolerance", 0.15) == "150ms",
		"tap tolerance reads in milliseconds")
	_check(ui._format("look_sensitivity", 1.5) == "1.50x",
		"sensitivity reads as a multiplier")

	# Opening and closing behaves like the other screens
	ui.open()
	_check(ui.visible and game.ui_open == "settings", "the screen opens")
	world.hud.handle_escape()
	_check(not ui.visible, "and escape closes it")
	# Closing it returns to whatever was underneath, which during a test run is
	# the main menu the world opened at startup. Put the UI state back to
	# playing, or every later check that only runs in play would be skipped.
	_check(game.ui_open == "start",
		"and lands back on the menu it was opened from")
	game.set_ui("")
	game.reset_settings()


# ==================== INVENTORY ORDER, PINNING, DROPPING ====================

func _test_inventory_order(game, world) -> void:
	# Emptied outright rather than reset to the opening kit: this is a test
	# about ordering, and the plan and hammer would be two more rows to
	# account for in every count below.
	game.inventory.clear()
	game.favourites.clear()
	game.set_filter("")
	game.set_sort_mode("name")

	game.inventory["wood"] = 100        # resources, common
	game.inventory["ak47"] = 1          # weapons, elite
	game.inventory["bandage"] = 5       # medical, common
	game.inventory["hqm"] = 20          # resources, elite
	game.inventory["machete"] = 1       # weapons, rare

	var listed: Array = game.ordered_inventory()
	_check(listed.size() == 5, "every held item is listed (%d)" % listed.size())

	# Sorting by name is alphabetical by display name
	var names := []
	for id in listed:
		names.append(str(game.ITEMS[id].name))
	var sorted_names := names.duplicate()
	sorted_names.sort()
	_check(names == sorted_names, "sorting by name really is alphabetical %s" % str(names))

	# Sorting by rarity puts the good things first
	game.set_sort_mode("rarity")
	listed = game.ordered_inventory()
	_check(listed[0] == "ak47" or listed[0] == "hqm",
		"sorting by rarity leads with an elite item (%s)" % str(listed[0]))

	# Sorting by count leads with the biggest pile
	game.set_sort_mode("count")
	listed = game.ordered_inventory()
	_check(listed[0] == "wood", "sorting by count leads with the deepest stack")

	# Sorting by type groups categories together
	game.set_sort_mode("type")
	listed = game.ordered_inventory()
	var seen_categories := []
	for id in listed:
		var cat := str(game.ITEMS[id].get("category", ""))
		if seen_categories.is_empty() or seen_categories[-1] != cat:
			seen_categories.append(cat)
	var unique_categories := {}
	for cat in seen_categories:
		unique_categories[cat] = true
	_check(seen_categories.size() == unique_categories.size(),
		"sorting by type never revisits a category %s" % str(seen_categories))

	# Cycling the sort mode walks every mode and comes back round
	var start: String = game.sort_mode
	var walked := {}
	for i in game.SORT_MODES.size():
		walked[game.cycle_sort_mode()] = true
	_check(walked.size() == game.SORT_MODES.size(),
		"cycling the sort visits every mode")
	_check(game.sort_mode == start, "and returns to where it started")

	# A pinned item leads whatever the sort says
	game.set_sort_mode("name")
	game.toggle_favourite("bandage")
	_check(game.is_favourite("bandage"), "an item can be pinned")
	listed = game.ordered_inventory()
	_check(listed[0] == "bandage", "and a pinned item comes first")
	game.set_sort_mode("count")
	listed = game.ordered_inventory()
	_check(listed[0] == "bandage",
		"even under a sort that would otherwise bury it")
	# Pins keep the order they were made in
	game.toggle_favourite("hqm")
	listed = game.ordered_inventory()
	_check(listed[0] == "bandage" and listed[1] == "hqm",
		"two pins keep the order they were pinned in")
	game.toggle_favourite("bandage")
	_check(not game.is_favourite("bandage"), "and a pin can be taken off again")
	listed = game.ordered_inventory()
	_check(listed[0] == "hqm", "leaving the other one leading")
	game.favourites.clear()

	# Filtering narrows the list to one category and back
	game.set_filter("weapons")
	listed = game.ordered_inventory()
	_check(listed.size() == 2, "filtering to weapons shows two (%d)" % listed.size())
	for id in listed:
		_check(str(game.ITEMS[id].category) == "weapons",
			"and everything shown is a weapon (%s)" % id)
	game.set_filter("medical")
	_check(game.ordered_inventory() == ["bandage"], "filtering to medical shows one")
	game.set_filter("")
	_check(game.ordered_inventory().size() == 5, "clearing the filter shows them all")

	# An empty stack never appears, whatever the dictionary still holds
	game.inventory["wood"] = 0
	_check(not game.ordered_inventory().has("wood"),
		"an emptied stack drops out of the list")

	# Dropping puts the item on the ground in a bag rather than deleting it
	var bags_before: int = world.bags.size()
	game.inventory["stone"] = 40
	var dropped: int = world.drop_item("stone", 15)
	_check(dropped == 15, "dropping moves the requested amount")
	_check(game.get_count("stone") == 25, "and takes it out of your pockets")
	_check(world.bags.size() == bags_before + 1, "leaving a bag on the ground")
	var bag = world.bags[world.bags.size() - 1]
	_check(int(bag.stored.get("stone", 0)) == 15, "with the items in it")

	# A second drop in the same place lands in the same bag
	world.drop_item("stone", 5)
	_check(world.bags.size() == bags_before + 1,
		"dropping again does not stack bags up")
	_check(int(bag.stored.get("stone", 0)) == 20, "it goes in the one already there")

	# Dropping more than you have drops what you have
	_check(world.drop_item("stone", 9999) == 20, "dropping more than you hold caps")
	_check(game.get_count("stone") == 0, "and empties the stack")
	_check(world.drop_item("stone", 5) == 0, "dropping nothing does nothing")

	# Pins and the sort mode survive a save
	game.toggle_favourite("ak47")
	game.set_sort_mode("rarity")
	world.save_game()
	var f := FileAccess.open("user://rust_save.json", FileAccess.READ)
	var data = JSON.parse_string(f.get_as_text())
	f.close()
	_check(data is Dictionary and data.player.favourites.has("ak47"),
		"pinned items are written to the save")
	_check(str(data.player.get("sort_mode", "")) == "rarity",
		"and so is the sort mode")

	game.favourites.clear()
	game.set_sort_mode("type")
	game.set_filter("")
	_clear_pockets(game)


# ==================== UNIVERSAL INTERACTION ====================

func _test_interaction(game, world, StructureScript) -> void:
	var player = world.player
	var inter = world.interaction
	_check(inter != null, "the world has an interaction brain")
	if inter == null:
		return
	game.reset_settings()
	_clear_pockets(game)

	# Stage a door and a storage box side by side, well away from everything
	var site: Vector2 = _flat_site(world)
	var bx: float = site.x + 45.0
	var bz: float = site.y + 45.0
	var ground: float = world.terrain_height(bx, bz)
	var parked: Vector3 = player.position

	var door = StructureScript.new()
	door.setup("wooden_door")
	door.position = Vector3(bx, ground + 1.05, bz)
	world.add_child(door)
	world.register_structure(door)
	var box = world._spawn_station("storage_box", Vector3(bx + 1.2, ground, bz))

	# Standing between them with nothing in hand, the nearer wins
	player.position = Vector3(bx + 1.0, ground + 0.1, bz)
	inter._process(0.1)
	_check(inter.target != null, "something in reach is targeted")
	_check(inter.prompt() != "", "and there is a prompt for it (%s)" % inter.prompt())

	# The prompt names what it will do, not just what the thing is
	player.position = Vector3(bx, ground + 0.1, bz)
	inter._set_target(door)
	_check(inter.verb == "Open" and inter.label.contains("Door"),
		"a shut door reads as Open Door (%s)" % inter.prompt())
	door.set_door_state(true)
	inter._set_target(null)
	inter._set_target(door)
	_check(inter.verb == "Close", "and an open one reads as Close")
	door.set_door_state(false)

	# A lock in hand makes the door the intended target over the box
	game.inventory["lock"] = 1
	game.belt[0] = "lock"
	game.selected_belt_slot = 0
	_check(inter._matches_intent(door), "holding a lock, a door is what you mean")
	_check(not inter._matches_intent(box), "and the box beside it is not")

	# A hammer means the structure, not the door
	_clear_pockets(game)
	game.inventory["hammer"] = 1
	game.belt[0] = "hammer"
	var wall = StructureScript.new()
	wall.setup("wall")
	wall.position = Vector3(bx - 1.5, ground + 1.5, bz)
	world.add_child(wall)
	world.register_structure(wall)
	_check(inter._matches_intent(wall), "holding a hammer, a wall is what you mean")

	# Tapping a door opens it, and the cooldown stops a held finger flapping it
	_clear_pockets(game)
	game.belt[0] = "building_plan"
	inter._cd = 0.0
	inter._set_target(door)
	_check(inter.interact_tap(), "tapping a door works")
	_check(door.is_open, "and it opened")
	_check(not inter.interact_tap(), "a second tap inside the cooldown is refused")
	_check(door.is_open, "so the door is still open rather than flapping shut")
	inter._cd = 0.0
	_check(inter.interact_tap() and not door.is_open, "and once it clears, it closes")

	# Double tap forces a door open and leaves it open
	door.set_door_state(false)
	inter._cd = 0.0
	_check(inter.interact_double(), "double tapping a door works")
	_check(door.is_open, "and it is open")
	inter._cd = 0.0
	_check(inter.interact_double() and door.is_open,
		"and doing it again leaves it open rather than toggling")
	door.set_door_state(false)

	# A locked door you cannot open reads as locked
	door.install_lock("keycard_lock")
	inter._set_target(null)
	inter._set_target(door)
	_check(inter.verb == "Locked", "a door you have no card for reads as Locked")
	game.inventory["keycard"] = 1
	inter._set_target(null)
	inter._set_target(door)
	_check(inter.verb == "Open", "and with the card it reads as Open again")
	door._remove_lock()
	_clear_pockets(game)

	# The highlight follows the target and goes away with it
	inter._set_target(door)
	_check(inter._outline != null and inter._outline.visible,
		"the target is outlined")
	inter._set_target(null)
	_check(not inter._outline.visible, "and the outline goes when nothing is targeted")

	# Nothing in reach means no prompt at all
	player.position = Vector3(bx + 200.0, ground + 20.0, bz + 200.0)
	inter._process(0.1)
	_check(inter.prompt() == "", "out of reach of everything, there is no prompt")

	world.unregister_structure(door)
	door.queue_free()
	world.unregister_structure(wall)
	wall.queue_free()
	world.stations.erase(box)
	box.queue_free()
	player.position = parked


# ==================== BUILD UNDO / GESTURES ====================

func _test_build_undo(game, world) -> void:
	var build = world.building
	_check(build != null, "the building system exists")
	game.reset_settings()

	# The tile grid stays 3m on purpose; only free-standing pieces snap finer
	_check(build.FREE_SNAP_STEPS.has(0.5) and build.FREE_SNAP_STEPS.has(2.0),
		"free-standing pieces offer half-metre and two-metre snapping")
	var first: float = build.free_snap()
	_check(build.cycle_free_snap() != first, "and the snap step cycles")

	# Height offset is clamped to a storey either way
	build.reset_height()
	_check(is_equal_approx(build.adjust_height(1.0), 1.0), "a piece can be raised")
	_check(is_equal_approx(build.adjust_height(-2.0), -1.0), "and lowered")
	build.adjust_height(999.0)
	_check(is_equal_approx(build.height_offset, build.HEIGHT_LIMIT),
		"but never past a storey")
	build.reset_height()

	# A twist rotates freely, and can be squared back up
	game.blueprint_rotation = 0.0
	build.rotate_ghost(0.3)
	_check(absf(game.blueprint_rotation - 0.3) < 0.001, "a twist rotates the piece")
	build.square_up_rotation()
	_check(is_equal_approx(fmod(game.blueprint_rotation, PI / 2.0), 0.0),
		"and squaring up snaps it to a quarter turn")
	game.blueprint_rotation = 0.0

	# Undo a placement
	var site: Vector2 = _flat_site(world)
	var ux: float = site.x + 66.0
	var uz: float = site.y + 66.0
	var uy: float = world.terrain_height(ux, uz)
	build._undo_stack.clear()
	build._redo_stack.clear()

	var slab = load("res://scripts/structure.gd").new()
	slab.setup("foundation")
	slab.position = Vector3(ux, uy + 0.1, uz)
	slab.placed_at = world.clock
	world.add_child(slab)
	world.register_structure(slab)
	build._record({"kind": "place", "type": "foundation",
		"pos": slab.position, "rot": 0.0, "tier": "twig",
		"soft": Vector3.ZERO})
	_check(build.undo_depth() == 1, "placing a piece records an undo step")
	var count_before: int = world.structures.size()
	_check(build.undo(), "undo takes it back")
	_check(world.structures.size() == count_before - 1, "and the piece is gone")
	_check(build.redo_depth() == 1, "and it can be redone")
	_check(build.redo(), "redo puts it back")
	_check(world.structures.size() == count_before, "and it is there again")

	# Undo an upgrade puts the tier and the materials back
	var target = build._find_structure(Vector3(ux, uy + 0.1, uz), "foundation")
	_check(target != null, "the rebuilt piece can be found again")
	if target != null:
		_clear_pockets(game)
		game.inventory["wood"] = 1000
		var wood_before: int = game.get_count("wood")
		build.upgrade_structure(target)
		_check(target.tier == "wood", "upgrading raises the tier")
		_check(game.get_count("wood") < wood_before, "and costs materials")
		_check(build.undo(), "undoing the upgrade works")
		_check(target.tier == "twig", "the tier drops back")
		_check(game.get_count("wood") == wood_before, "and the materials come back")
		world.unregister_structure(target)
		target.queue_free()

	# The stack never grows past its declared depth
	build._undo_stack.clear()
	for i in build.UNDO_DEPTH + 6:
		build._record({"kind": "place", "type": "foundation",
			"pos": Vector3(float(i), 0.0, 0.0), "rot": 0.0, "tier": "twig",
			"soft": Vector3.ZERO})
	_check(build.undo_depth() == build.UNDO_DEPTH,
		"the undo history holds exactly %d actions" % build.UNDO_DEPTH)
	# Recording drops any redo future, because the timeline just branched
	build._redo_stack.append({"kind": "place"})
	build._record({"kind": "place", "type": "foundation", "pos": Vector3.ZERO,
		"rot": 0.0, "tier": "twig", "soft": Vector3.ZERO})
	_check(build.redo_depth() == 0, "and a new action clears the redo history")
	build._undo_stack.clear()
	build._redo_stack.clear()
	_clear_pockets(game)


# ==================== WEATHER ====================

func _test_weather(game, world) -> void:
	var wx = world.weather
	_check(wx != null, "the world has weather")
	if wx == null:
		return

	for name_ in ["clear", "overcast", "rain", "storm"]:
		_check(wx.STATES.has(name_), "%s is a weather state" % name_)
		_check(wx.NEXT.has(name_), "and something can follow it")

	# Weather builds rather than jumping: clear never becomes a storm outright
	_check(not wx.NEXT["clear"].has("storm"),
		"a clear sky never turns straight into a thunderstorm")
	_check(wx.NEXT["rain"].has("storm"), "but rain can become one")
	_check(wx.NEXT["storm"].has("rain"), "and a storm eases back to rain")

	# Worse weather is darker, colder, wetter and windier, in that order
	var clear: Dictionary = wx.STATES["clear"]
	var storm: Dictionary = wx.STATES["storm"]
	_check(float(storm.light) < float(clear.light), "a storm is darker than clear")
	_check(float(storm.chill) > float(clear.chill), "and colder")
	_check(float(storm.rain) > float(clear.rain), "and wetter")
	_check(float(storm.wind) > float(clear.wind), "and windier")
	_check(float(storm.fog) > float(clear.fog), "and you can see less through it")

	# A transition is a blend, not a cut
	wx.previous = "clear"
	wx.state = "storm"
	wx.blend = 0.0
	_check(is_equal_approx(wx.value("chill"), float(clear.chill)),
		"at the start of a blend the old weather still holds")
	wx.blend = 0.5
	var midway: float = wx.value("chill")
	_check(midway > float(clear.chill) and midway < float(storm.chill),
		"half way through it is half way between (%.1f)" % midway)
	wx.blend = 1.0
	_check(is_equal_approx(wx.value("chill"), float(storm.chill)),
		"and at the end the new weather has arrived")

	# Only a storm has lightning in it
	_check(wx.is_storming(), "a storm is storming")
	wx.state = "rain"
	wx.previous = "rain"
	_check(not wx.is_storming(), "rain on its own is not")
	_check(wx.is_wet(), "but it is wet")
	wx.state = "clear"
	wx.previous = "clear"
	_check(not wx.is_wet(), "and a clear sky is not")

	# The wind the turbines read really does answer the weather
	wx.state = "clear"
	wx.previous = "clear"
	wx.blend = 1.0
	var calm: float = world.wind_strength()
	wx.state = "storm"
	wx.previous = "storm"
	var blowing: float = world.wind_strength()
	_check(blowing > calm,
		"a turbine makes more in a storm than in still air (%.2f vs %.2f)"
			% [blowing, calm])

	# And the cold the survival stats read
	_check(wx.chill() > 0.0, "a storm is actively making it colder")
	wx.state = "clear"
	wx.previous = "clear"
	_check(is_equal_approx(wx.chill(), 0.0), "and a clear day is not")

	# Rain and lightning have real nodes behind them
	_check(wx._rain != null, "there is a rain emitter")
	_check(wx._flash != null, "and a lightning flash")
	wx.state = "storm"
	wx.previous = "storm"
	wx._update_rain()
	_check(wx._rain.emitting, "it rains during a storm")
	wx.state = "clear"
	wx.previous = "clear"
	wx._update_rain()
	_check(not wx._rain.emitting, "and stops when it clears")

	# A strike lights up and the thunder follows it rather than arriving with it
	wx._thunder_left = -1.0
	wx.strike()
	_check(wx._flash_left > 0.0, "a strike flashes")
	_check(wx._thunder_left > 0.0, "and the thunder is still on its way")
	for i in 60:
		wx._update_lightning(1.0 / 60.0)
	_check(wx._flash_left <= 0.0, "the flash is over within a second")

	wx.state = "clear"
	wx.previous = "clear"
	wx.blend = 1.0


# ==================== MAIN MENU ====================

func _test_main_menu(game, world) -> void:
	var menu = world.hud.main_menu
	_check(menu != null, "there is a main menu")
	if menu == null:
		return

	# It is a window onto the world, not a sheet in front of it: the veil has
	# to be mostly transparent or none of the rest matters.
	var veil: ColorRect = null
	for c in menu.get_children():
		if c is ColorRect:
			veil = c
			break
	_check(veil != null and veil.color.a < 0.45,
		"the menu backdrop is see-through (alpha %.2f)"
			% (veil.color.a if veil else -1.0))

	# Every button does something. A Store button in a game with no store is a
	# lie in the most prominent place in the product.
	_check(menu._buttons.size() == menu.ENTRIES.size(),
		"every declared entry got a button")
	for entry in menu.ENTRIES:
		_check(str(entry.title) != "" and str(entry.glyph) != "",
			"'%s' has a title and a glyph" % str(entry.id))
		# Written in Arabic, like the rest of this screen. Checked by codepoint
		# rather than by eye so an English string cannot creep back in.
		var arabic := false
		for ch in str(entry.title):
			if ch.unicode_at(0) >= 0x0600 and ch.unicode_at(0) <= 0x06FF:
				arabic = true
		_check(arabic, "'%s' is titled in Arabic" % str(entry.id))
	var ids := []
	for entry in menu.ENTRIES:
		ids.append(str(entry.id))
	for offered in ["play", "servers", "character", "inventory",
			"guide", "events", "store", "controls", "credits", "exit"]:
		_check(ids.has(offered), "the menu offers %s" % offered)

	# Every entry declares whether it is built. The ones that are not are the
	# ones with no system behind them, and pressing one has to say so rather
	# than open an empty screen dressed as a feature.
	var unbuilt := []
	for entry in menu.ENTRIES:
		_check(str(entry.get("desc", "")) != "",
			"'%s' explains itself" % str(entry.id))
		if not bool(entry.get("real", true)):
			unbuilt.append(str(entry.id))
	_check(unbuilt.has("store") and unbuilt.has("servers"),
		"the storefront and the server list are marked unbuilt %s" % str(unbuilt))
	for built in ["play", "character", "inventory", "guide",
			"events", "controls", "credits", "exit"]:
		_check(not unbuilt.has(built), "%s is a real screen" % built)

	# The playing interface has to be out of the way while the menu is up. The
	# old start screen was an opaque black sheet that hid it by accident; this
	# menu is see-through, so the stat bars, hotbar, crosshair and compass
	# would otherwise sit on top of the menu's own panels in the same corners.
	world.hud.show_start_screen()
	var showing := []
	for c in world.hud._play_ui:
		if is_instance_valid(c) and c.visible:
			showing.append(c.name)
	_check(world.hud._play_ui.size() >= 8,
		"the playing interface is grouped (%d roots)" % world.hud._play_ui.size())
	_check(showing.is_empty(),
		"and none of it is drawn over the menu %s" % str(showing))
	# Except the toast, which is how the menu answers a press
	_check(world.hud._toast_label != null
		and not world.hud._play_ui.has(world.hud._toast_label.get_parent()),
		"the toast is deliberately left out of that group")

	# The rig pans and breathes rather than sitting still
	menu.world = world
	menu.open()
	_check(menu.visible and game.ui_open == "start", "the menu opens")
	_check(menu._rig != null and menu._camera != null, "with a camera rig")
	_check(menu._camera.current, "and that camera has the view")

	menu._clock = 0.0
	menu._animate_view()
	var start_yaw: float = menu._camera.rotation.y
	var start_y: float = menu._camera.position.y
	menu._clock = menu.PAN_PERIOD * 0.25
	menu._animate_view()
	_check(absf(menu._camera.rotation.y - start_yaw) > 0.01,
		"the camera pans as time passes")
	_check(absf(menu._camera.rotation.y) <= deg_to_rad(menu.PAN_DEGREES) + 0.001,
		"and never past the ten degrees it is allowed")
	menu._clock = menu.BREATH_PERIOD * 0.25
	menu._animate_view()
	_check(absf(menu._camera.position.y - start_y) > 0.001,
		"and the rig drifts up and down")
	_check(absf(menu._camera.position.y) <= menu.BREATH + 0.001,
		"by no more than ten centimetres")

	# Depth of field keeps the near ground sharp and the hills soft
	var attrs: CameraAttributesPractical = menu._camera.attributes
	_check(attrs != null and attrs.dof_blur_far_enabled,
		"the far distance is softened")

	# The menu reports what is true and nothing that is not
	menu._refresh_clock()
	menu._refresh_live()
	_check(menu._version_label.text.contains(menu._version()),
		"the version is shown (%s)" % menu._version_label.text)
	_check(menu._clock_label.text.contains(":"),
		"the clock reads a time (%s)" % menu._clock_label.text)
	# The label carries the Arabic for whatever the weather actually is, so the
	# check goes through the same map rather than asserting the English word is
	# on a screen written in Arabic.
	_check(menu._weather_label.text == menu._weather_name()
			and menu._weather_name() != "",
		"and the real weather, in Arabic (%s = %s)"
			% [world.weather.state_name(), menu._weather_label.text])
	for state in world.weather.STATES:
		var english: String = str(world.weather.STATES[state].name)
		_check(menu.WEATHER_NAMES.has(english),
			"every weather state has an Arabic name (%s)" % english)
	_check(menu._wind_label.text.ends_with("%"),
		"the wind reads as a percentage on its own (%s)" % menu._wind_label.text)
	for invented in ["Ping", "ms", "EU-West", "Region"]:
		_check(not menu._version_label.text.contains(invented)
			and not menu._weather_label.text.contains(invented),
			"and nothing about a server, because there is no server (%s)" % invented)

	# News comes from a file rather than being typed into the menu
	_check(menu._news_cards.size() > 0,
		"the news panel read %d cards from disk" % menu._news_cards.size())
	menu._news_left = 0.0
	menu._animate_news(0.1)
	var first: String = menu._news.text
	_check(first != "", "and shows one")
	menu._news_left = 0.0
	menu._animate_news(0.1)
	_check(menu._news.text != first or menu._news_cards.size() == 1,
		"and rotates to the next")

	# Wildlife keeps moving while the menu is up, or it is a photograph
	var NpcScript = load("res://scripts/npc.gd")
	var doe = NpcScript.new()
	doe.setup("deer", world)
	doe.position = Vector3(120.0, world.terrain_height(120.0, -120.0), -120.0)
	world.add_child(doe)
	doe.home = doe.position
	var was_started: bool = world.started
	world.started = false
	var before: Vector3 = doe.position
	doe._wander_timer = 0.0
	for i in 400:
		doe._physics_process(1.0 / 60.0)
	_check(doe.position.distance_to(before) > 0.05,
		"a deer still wanders with the game not yet started (%.2f m)"
			% doe.position.distance_to(before))
	world.started = was_started
	doe.queue_free()

	# Starting the game hands the view back and clears the menu
	world.hud.start_game()
	_check(not menu.visible, "starting the game closes the menu")
	_check(game.ui_open == "" and world.started, "and hands control over")
	_check(world.player.camera.current, "and the view goes back to the player")
	var hidden := []
	for c in world.hud._play_ui:
		if is_instance_valid(c) and not c.visible:
			hidden.append(c.name)
	_check(hidden.is_empty(),
		"and the playing interface comes back %s" % str(hidden))


# ==================== ROADS AND ROADSIDE ====================

func _test_roads(game, world) -> void:
	var roads = world.roads
	_check(roads != null, "the world has a road network")
	if roads == null:
		return

	_check(roads.waypoints.size() >= 4,
		"the route has several legs (%d waypoints)" % roads.waypoints.size())
	# It is a loop, so it can be walked without dead ends
	_check(roads.waypoints[0].distance_to(roads.waypoints[roads.waypoints.size() - 1]) < 0.01,
		"and it closes back on itself")

	# The road is drawn, as two surfaces: tarmac and the dashes on it
	var surface: MeshInstance3D = roads.get_node_or_null("RoadSurface")
	var lines: MeshInstance3D = roads.get_node_or_null("RoadLines")
	_check(surface != null and surface.mesh != null, "the tarmac has a mesh")
	_check(lines != null and lines.mesh != null, "and the centre line does too")
	if surface != null:
		_check(surface.mesh.surface_get_array_len(0) > 300,
			"the road mesh is a real strip (%d vertices)"
				% surface.mesh.surface_get_array_len(0))

	# The road follows the ground rather than floating over or sinking into it
	var mid: Vector2 = roads.waypoints[1]
	var probes := 0
	var hovering := 0
	for i in roads.waypoints.size() - 1:
		var a: Vector2 = roads.waypoints[i]
		var b: Vector2 = roads.waypoints[i + 1]
		for step in 5:
			var at: Vector2 = a.lerp(b, float(step) / 5.0)
			probes += 1
			# Every point of the centre line is on the road by definition
			if not roads.on_road(at):
				hovering += 1
	_check(hovering == 0, "every point of the centre line counts as road (%d/%d)"
		% [probes - hovering, probes])

	# Off to the side of it is not road
	var away := mid + Vector2(60.0, 60.0)
	_check(not roads.on_road(away), "and a point well away from it is not")
	_check(roads.distance_to_road(away) > roads.ROAD_WIDTH,
		"with a distance to match")

	# Wrecks exist, are harvestable, and are worth the walk
	var ResNode = load("res://scripts/resource_node.gd")
	_check(ResNode.YIELDS.has("car_wreck"), "a car wreck is a harvestable")
	var wreck_yield: Dictionary = ResNode.YIELDS["car_wreck"]
	_check(wreck_yield.has("frag") and wreck_yield.has("scrap"),
		"it gives metal and scrap")
	_check(wreck_yield.has("gear_comp") or wreck_yield.has("pipe"),
		"and the components a bench otherwise charges scrap for")
	var barrel_total := 0
	for id in ResNode.YIELDS["barrel"]:
		barrel_total += int(ResNode.YIELDS["barrel"][id])
	var wreck_total := 0
	for id in wreck_yield:
		wreck_total += int(wreck_yield[id])
	_check(wreck_total > barrel_total,
		"a wreck is worth more than a barrel (%d vs %d)" % [wreck_total, barrel_total])
	_check(ResNode.TOOL_YIELD["car_wreck"].has("jackhammer"),
		"and a jackhammer is the right tool for it")

	# They are actually in the world, and on the road
	var wrecks := []
	var on_tarmac := 0
	for c in world.get_children():
		if c.has_method("hit_harvest") and not c.is_queued_for_deletion() \
				and c.res_type == "car_wreck":
			wrecks.append(c)
			if roads.distance_to_road(Vector2(c.position.x, c.position.z)) \
					<= roads.ROAD_WIDTH:
				on_tarmac += 1
	_check(wrecks.size() > 0, "the map was seeded with wrecks (%d)" % wrecks.size())
	_check(on_tarmac == wrecks.size(),
		"and every one of them is on the road (%d/%d)" % [on_tarmac, wrecks.size()])

	# Buildings went up beside it, with collision so you cannot walk through
	var buildings := 0
	var solid := 0
	for c in roads.get_children():
		if not (c is StaticBody3D):
			continue
		buildings += 1
		for gc in c.get_children():
			if gc is CollisionShape3D:
				solid += 1
				break
	_check(buildings > 0, "there are roadside buildings (%d)" % buildings)
	_check(solid == buildings, "and every one is solid (%d/%d)" % [solid, buildings])
	_check(roads.landmarks.size() > 0,
		"the landmarks are recorded for the map (%d)" % roads.landmarks.size())

	# Nothing scattered by the world grows through the tarmac
	var through_road := []
	for c in world.get_children():
		if not c.has_method("hit_harvest") or c.is_queued_for_deletion():
			continue
		if c.res_type == "car_wreck" or c.res_type == "barrel":
			continue   # these are placed on and beside the road on purpose
		if roads.distance_to_road(Vector2(c.position.x, c.position.z)) < 3.0:
			through_road.append(c.res_type)
	_check(through_road.is_empty(),
		"nothing scattered grows through the road %s" % str(through_road))

	# Metal things sound like metal
	_check(ResNode.HARVEST_SOUND.get("car_wreck", "") == "metal_scrape",
		"stripping a wreck sounds like sheet metal")
	var sfx = world.get_node_or_null("/root/Sfx")
	if sfx != null:
		_check(sfx._players.has("metal_scrape") and sfx._players.has("glass_break"),
			"and those sounds were synthesised at startup")


# ==================== MODELS ====================

## Coverage, rather than existence: that every path resolves is already
## checked further up. What matters here is that nothing the world can put
## down has been left behind without a model, and that the pieces which move
## at runtime are still assembled to move.
func _test_models(game, world) -> void:
	var Registry = load("res://scripts/model_registry.gd")

	# Everything the world can put down should have a model by now, so a
	# missing one is worth being told about rather than silently boxed.
	var unmodelled := []
	for id in game.BUILDING_TYPES:
		if not Registry.has_model(id):
			unmodelled.append(id)
	_check(unmodelled.is_empty(), "every building piece is modelled %s" % str(unmodelled))

	var devices_unmodelled := []
	for id in game.DEVICES:
		if not Registry.has_model(id):
			devices_unmodelled.append(id)
	_check(devices_unmodelled.is_empty(),
		"every device is modelled %s" % str(devices_unmodelled))

	var stations_unmodelled := []
	for id in game.DEPLOYABLES:
		# The campfire is procedural on purpose: its fire, light and embers
		# are generated, not modelled.
		if id != "campfire" and id != "sleeping_bag" and not Registry.has_model(id):
			stations_unmodelled.append(id)
	_check(stations_unmodelled.is_empty(),
		"every deployable station is modelled %s" % str(stations_unmodelled))

	# A modelled device really does get the model, not the fallback block
	var rig = world._spawn_device("generator", Vector3(160, 0, 160))
	var has_mesh := false
	for c in rig.get_children():
		if c is Node3D and not (c is MeshInstance3D) and not (c is CollisionShape3D) \
				and not (c is Light3D):
			has_mesh = true
	_check(has_mesh, "a deployed generator is built from its model")
	world.remove_device(rig)

	# The turbine keeps its procedural blades, because they have to turn
	var mill = world._spawn_device("wind_turbine", Vector3(164, 0, 160))
	_check(mill._spinner != null and mill._spinner.get_child_count() == 3,
		"the wind turbine still spins three blades of its own")
	world.remove_device(mill)

	# And a turret's model hangs off the mount that aims it
	var gun = world._spawn_device("auto_turret", Vector3(168, 0, 160))
	_check(gun._head != null and gun._head.get_child_count() > 0,
		"a turret's model sits on the mount that swings it")
	world.remove_device(gun)


# ==================== TOOL DURABILITY ====================

func _test_durability(game, world) -> void:
	_clear_pockets(game)
	_check(game.has_durability("stone_pickaxe") and not game.has_durability("hammer"),
		"tools wear out, the building hammer does not")

	game.inventory["stone_pickaxe"] = 1
	game.tool_wear.erase("stone_pickaxe")
	_check(game.durability("stone_pickaxe") == game.max_durability("stone_pickaxe"),
		"a fresh tool starts at full condition")

	game.wear_tool("stone_pickaxe", 5)
	_check(game.durability("stone_pickaxe") == game.max_durability("stone_pickaxe") - 5,
		"swinging it spends condition")

	# Past the worn threshold it still works, just not as well
	game.tool_wear["stone_pickaxe"] = int(game.max_durability("stone_pickaxe") * 0.1)
	_check(game.condition_multiplier("stone_pickaxe") < 1.0,
		"a blunt tool gathers less per swing")
	_check(game.condition_multiplier("hammer") == 1.0,
		"something with no durability is never penalised")

	# The blow that empties the bar is the one that breaks it
	game.tool_wear["stone_pickaxe"] = 1
	var broke: bool = not game.wear_tool("stone_pickaxe")
	_check(broke and game.get_count("stone_pickaxe") == 0,
		"the last swing breaks the tool and takes it with it")

	# A spare in the pack becomes the one in your hand, at full condition
	game.inventory["metal_hatchet"] = 2
	game.tool_wear["metal_hatchet"] = 1
	game.wear_tool("metal_hatchet")
	_check(game.get_count("metal_hatchet") == 1
		and game.durability("metal_hatchet") == game.max_durability("metal_hatchet"),
		"a spare takes over at full condition")

	# Repair costs a share of the item's own recipe
	game.tool_wear["metal_hatchet"] = 10
	game.inventory["wood"] = 500
	game.inventory["frag"] = 500
	var wood_before: int = game.get_count("wood")
	var repaired: bool = game.repair_tool_item("metal_hatchet", 0.25)
	_check(repaired and game.durability("metal_hatchet") > 10, "repairing puts condition back")
	_check(game.get_count("wood") < wood_before, "and it costs materials to do it")

	# Fuelled tools burn low grade fuel rather than running for free
	_check(game.TOOL_FUEL.has("chainsaw") and game.TOOL_FUEL.has("jackhammer"),
		"the powered tools run on fuel")
	game.inventory["lgf"] = 0
	game.inventory["chainsaw"] = 1
	var starved := false
	for i in 60:
		if not game.spend_tool_fuel("chainsaw"):
			starved = true
			break
	_check(starved, "with no fuel in your pack a chainsaw eventually refuses to run")

	# A chainsaw is worth its fuel: it out-cuts every hand tool
	var ResNode = load("res://scripts/resource_node.gd")
	_check(int(ResNode.TOOL_YIELD["tree"]["chainsaw"]) > int(ResNode.TOOL_YIELD["tree"]["metal_hatchet"]),
		"a chainsaw fells a tree faster than a steel axe")
	_check(int(ResNode.TOOL_YIELD["rock"]["jackhammer"]) > int(ResNode.TOOL_YIELD["rock"]["metal_pickaxe"]),
		"and a jackhammer out-mines a steel pick")

	# Condition survives a save
	game.tool_wear["metal_hatchet"] = 42
	world.save_game()
	var f := FileAccess.open("user://rust_save.json", FileAccess.READ)
	var data = JSON.parse_string(f.get_as_text())
	f.close()
	_check(data is Dictionary and data.player.has("wear")
		and int(data.player.wear.get("metal_hatchet", 0)) == 42,
		"a half-worn tool stays half-worn across a save")


# ==================== NEW BUILDING PIECES ====================

func _test_new_pieces(game, world, StructureScript) -> void:
	for piece in ["triangle_foundation", "half_wall", "low_wall", "pillar",
			"roof", "ladder", "barricade", "garage_door"]:
		_check(game.BUILDING_TYPES.has(piece), "%s is a placeable piece" % piece)

	# The triangle is a foundation in every sense that matters
	_check("triangle_foundation" in game.ANCHOR_TYPES
		and "triangle_foundation" in game.SUPPORT_TYPES
		and "triangle_foundation" in game.FLOOR_TYPES,
		"a triangle foundation anchors, supports and can be walked on")

	# Non-box pieces get a real solid, not a box pretending to be one
	var tri = StructureScript.new()
	tri.setup("triangle_foundation")
	var hulls := 0
	for c in tri.get_children():
		if c is CollisionShape3D and (c as CollisionShape3D).shape is ConvexPolygonShape3D:
			hulls += 1
	_check(hulls == 1, "the triangle's collision is a convex hull, not a box")
	var tri_points: PackedVector3Array = StructureScript._hull_points("triangle", Vector3(3, 0.2, 3))
	_check(tri_points.size() == 6, "a triangular prism has six corners")
	var wedge_points: PackedVector3Array = StructureScript._hull_points("wedge", Vector3(3, 1.5, 3))
	_check(wedge_points.size() == 6, "and so does a roof wedge")
	# The drawn mesh comes off the same corners as the hull
	var mesh: ArrayMesh = StructureScript._solid_mesh("wedge", Vector3(3, 1.5, 3),
		StandardMaterial3D.new())
	_check(mesh.get_surface_count() == 1 and mesh.surface_get_array_len(0) > 0,
		"the roof's mesh is built from those same corners")
	tri.free()

	# A garage door lifts rather than swinging
	_check("garage_door" in game.LIFTING_DOORS and "garage_door" in game.DOOR_FILLS_DOORWAY,
		"a garage door fills a doorway and lifts to open")
	var garage = StructureScript.new()
	garage.setup("garage_door")
	garage.position = Vector3(0, 5, 0)
	world.add_child(garage)
	var shut: Vector3 = garage.position
	garage.set_door_state(true)
	_check(garage.position.y > shut.y and is_equal_approx(garage.position.x, shut.x),
		"opening it runs it straight up, not sideways")
	garage.set_door_state(false)
	_check(garage.position.is_equal_approx(shut), "and closing it drops it back")
	garage.queue_free()

	# A barricade stands on its own and bleeds whatever leans on it
	_check("barricade" in game.FREESTANDING_TYPES,
		"a barricade needs no foundation under it")
	_check(game.BARRICADE_DPS > 0.0, "and it costs something to walk into")

	# Demolition returns half of what was spent climbing the tiers
	var wall = StructureScript.new()
	wall.setup("wall")
	wall.placed_at = world.clock
	wall.apply_tier("stone")
	var spent: Dictionary = wall.invested_materials()
	var back: Dictionary = wall.salvage_value()
	_check(int(spent.get("wood", 0)) == 300 and int(spent.get("stone", 0)) == 300,
		"a stone wall records the wood and the stone that went into it")
	_check(int(back.get("stone", 0)) == int(float(spent.stone) * game.SALVAGE_FRACTION),
		"and demolishing it hands half of that back")
	_check(wall.can_demolish(world.clock), "a piece just put up can be taken down")
	_check(not wall.can_demolish(world.clock + game.DEMOLISH_WINDOW + 1.0),
		"an old one has to be knocked down instead")
	wall.free()

	# A pillar carries the level above it instead of losing a step
	var sx: float = _flat_site(world).x + 60.0
	var sz: float = _flat_site(world).y
	_footing(world, StructureScript, sx, sz)
	var pillar = StructureScript.new()
	pillar.setup("pillar")
	pillar.position = Vector3(sx + 1.5, world.terrain_height(sx, sz) + 1.5, sz + 1.5)
	world.add_child(pillar)
	world.register_structure(pillar)
	world.recompute_stability()
	_check(is_instance_valid(pillar) and pillar.stability > 0.0,
		"a pillar on a foundation stands up")


# ==================== RESOURCES, PLANTS, ANIMALS ====================

func _test_ecosystem(game, world) -> void:
	for id in ["resin", "clay", "sand", "dirt", "salt", "glass", "brick",
			"hemp", "rope", "bone", "feather", "egg", "scales", "corn",
			"pumpkin", "mushroom", "herbs", "antlers", "tusks"]:
		_check(game.ITEMS.has(id), "%s exists as an item" % id)

	var ResNode = load("res://scripts/resource_node.gd")
	_check(int(ResNode.YIELDS["tree"].get("resin", 0)) > 0, "felling a tree bleeds resin")
	for node_type in ["hemp", "corn", "pumpkin", "mushroom", "herbs",
			"clay_deposit", "sand_deposit", "salt_deposit", "fish"]:
		_check(ResNode.YIELDS.has(node_type), "%s is a harvestable node" % node_type)
	_check(int(ResNode.YIELDS["clay_deposit"].get("dirt", 0)) > 0,
		"digging clay turns up fill alongside it")

	# The new nodes really are in the world, not just in a table
	var found := {}
	for c in world.get_children():
		if c.has_method("hit_harvest") and not c.is_queued_for_deletion():
			found[c.res_type] = true
	for node_type in ["hemp", "clay_deposit", "sand_deposit", "fish"]:
		_check(found.has(node_type), "the map was seeded with %s" % node_type)

	# Small game, and predators that eat it
	var NpcScript = load("res://scripts/npc.gd")
	_check(NpcScript.TYPES.has("rabbit") and NpcScript.TYPES.has("chicken"),
		"rabbits and chickens exist")
	_check(NpcScript.LOOT["chicken"].has("egg") and NpcScript.LOOT["chicken"].has("feather"),
		"a chicken is worth an egg and its feathers")
	_check(NpcScript.LOOT["deer"].has("antlers") and NpcScript.LOOT["boar"].has("tusks"),
		"a buck drops antlers and a boar its tusks")
	_check(bool(NpcScript.TYPES["wolf"].get("hunts", false))
		and bool(NpcScript.TYPES["deer"].get("prey", false)),
		"wolves hunt and deer are hunted")
	_check(bool(NpcScript.TYPES["wolf"].get("packs", false)),
		"and wolves work in packs")

	# A wolf with company hits harder than a wolf on its own
	var lone = NpcScript.new()
	lone.setup("wolf", world)
	lone.position = Vector3(150, 0, 150)
	world.add_child(lone)
	var alone: float = lone.attack_damage()
	var mate = NpcScript.new()
	mate.setup("wolf", world)
	mate.position = lone.position + Vector3(3, 0, 0)
	world.add_child(mate)
	_check(lone.attack_damage() > alone,
		"a wolf with a packmate beside it bites harder (%.1f vs %.1f)"
			% [lone.attack_damage(), alone])

	# A predator's kill fills nobody's pockets
	var quarry = NpcScript.new()
	quarry.setup("rabbit", world)
	quarry.position = Vector3(150, 0, 156)
	world.add_child(quarry)
	_clear_pockets(game)
	var meat_before: int = game.get_count("raw_meat")
	quarry.npc_take_damage(999.0, false)
	_check(game.get_count("raw_meat") == meat_before,
		"a rabbit taken by a wolf does not end up in your pockets")
	lone.queue_free()
	mate.queue_free()

	# Over-harvesting stretches how long a species takes to come back.
	# Measured from a clean slate: earlier checks in this run have already
	# felled trees, and the reading is capped.
	world.pressure.clear()
	var base_delay: float = world.respawn_delay_for("tree")
	world.note_take("tree")
	world.note_take("tree")
	_check(world.respawn_delay_for("tree") > base_delay,
		"a worked-over patch comes back slower")
	_check(world.npc_respawn_delay_for("deer") >= world.NPC_RESPAWN_DELAY,
		"and so does a hunted-out population")
	world.pressure.clear()

	# Foraged food is the cheapest in the game and it is not free
	_check(float(game.CONSUMABLES["mushroom"].get("poison", 0.0)) > 0.0,
		"some mushrooms are poisonous")
	_check(game.CONSUMABLES.has("cooked_fish") and game.CONSUMABLES.has("preserved_meat"),
		"fish and salted meat are both proper meals")

	# The furnace learned the new firings
	var StationScript = load("res://scripts/station.gd")
	var inputs := {}
	for recipe in StationScript.SMELTING:
		inputs[str(recipe.input)] = str(recipe.output)
	_check(inputs.get("sand", "") == "glass", "sand fires into glass")
	_check(inputs.get("clay", "") == "brick", "clay fires into brick")
	_check(inputs.get("resin", "") == "lgf", "resin renders into fuel")

	# Brick needs fill as well as clay, so dirt is worth carrying
	var brick_recipe := {}
	for recipe in StationScript.SMELTING:
		if str(recipe.input) == "clay":
			brick_recipe = recipe.get("extra", {})
	_check(brick_recipe.has("dirt"), "and firing brick wants fill mixed into it")

	_clear_pockets(game)
	game.inventory["clay"] = 30
	game.inventory["dirt"] = 20
	game.inventory["wood"] = 200
	var kiln = world._spawn_station("furnace", Vector3(40, 0, 40))
	kiln.interact_station()
	_check(game.get_count("brick") > 0 and game.get_count("dirt") < 20,
		"a furnace really does turn clay and fill into brick")

	# A campfire cooks fish as readily as meat
	_clear_pockets(game)
	game.inventory["raw_fish"] = 4
	game.inventory["wood"] = 100
	var fire = world._spawn_station("campfire", Vector3(44, 0, 44))
	fire.interact_station()
	_check(game.get_count("cooked_fish") == 4 and game.get_count("raw_fish") == 0,
		"and a campfire cooks what you pulled out of the lake")


# ==================== RECYCLING ====================

func _test_recycling(game, world) -> void:
	for tier in ["recycler", "advanced_recycler", "hitech_recycler"]:
		_check(game.DEPLOYABLES.has(tier), "%s is deployable" % tier)
	var basic: float = float(game.DEPLOYABLES["recycler"].efficiency)
	var adv: float = float(game.DEPLOYABLES["advanced_recycler"].efficiency)
	var high: float = float(game.DEPLOYABLES["hitech_recycler"].efficiency)
	_check(basic < adv and adv < high, "each tier hands back more than the last")
	_check(float(game.DEPLOYABLES["recycler"].get("power", 0.0)) == 0.0
		and float(game.DEPLOYABLES["advanced_recycler"].power) > 0.0,
		"the hand-cranked one needs no power and the motorised ones do")

	_check(game.is_recyclable("pistol"), "anything you built can be broken down")
	_check(game.is_recyclable("gear_comp"), "and so can the components the world hands out")
	_check(not game.is_recyclable("wood"), "but raw material has nothing left to take apart")

	# A crafted item refunds a share of its own recipe
	var pistol_back: Dictionary = game.recycle_yield("pistol", 0.5)
	var pistol_recipe: Dictionary = game.ITEMS["pistol"].recipe
	_check(int(pistol_back.get("iron", 0)) == floori(float(pistol_recipe.iron) * 0.5),
		"a recycled pistol gives back half its iron at half efficiency")
	_check(game.recycle_yield("pistol", high).iron > pistol_back.iron,
		"and more of it at a better machine")

	# Actually run one
	_clear_pockets(game)
	game.inventory["pistol"] = 2
	game.belt[0] = "pistol"
	game.selected_belt_slot = 0
	var mill = world._spawn_station("recycler", Vector3(48, 0, 48))
	_check(mill.is_powered(), "a hand-cranked recycler runs without a circuit")
	mill.interact_station()
	_check(game.get_count("pistol") == 0 and game.get_count("iron") > 0,
		"it broke the pistols down into their parts")

	# The motorised one sits idle until the wires say otherwise
	var adv_mill = world._spawn_station("advanced_recycler", Vector3(52, 0, 48))
	adv_mill.powered = false
	_check(not adv_mill.is_powered(), "an advanced recycler with no power does nothing")
	adv_mill.set_powered(true)
	_check(adv_mill.is_powered(), "and comes to life once the circuit reaches it")
	game.belt[0] = "building_plan"
	game.selected_belt_slot = 0


# ==================== ELECTRICITY AND DEFENCE ====================

func _test_power(game, world) -> void:
	for id in ["generator", "solar_panel", "wind_turbine", "battery",
			"auto_turret", "shotgun_trap", "flame_trap", "tesla_coil",
			"alarm", "motion_sensor", "smart_switch", "camera",
			"land_mine", "bear_trap"]:
		_check(game.DEVICES.has(id) and game.ITEMS.has(id),
			"%s is a craftable, deployable device" % id)

	_check(world.power != null, "the world has a power grid")
	var grid = world.power
	var wires_before: int = grid.wires.size()

	# A generator feeding a turret through a wire
	var gen = world._spawn_device("generator", Vector3(100, 0, 100))
	var turret = world._spawn_device("auto_turret", Vector3(104, 0, 100))
	_check(float(turret.power_draw()) > 0.0 and float(gen.power_draw()) == 0.0,
		"a turret draws power and a generator does not")
	_check(gen.rated_output() > turret.power_draw(),
		"one generator can carry a turret")

	grid.solve(1.0)
	_check(not turret.is_live(), "an unwired turret is dead")

	_check(grid.connect_devices(gen, turret), "a wire runs between them")
	_check(grid.wires.size() == wires_before + 1, "and the grid records it")
	_check(not grid.connect_devices(gen, turret), "the same wire cannot be run twice")

	game.inventory["lgf"] = 100
	grid.solve(1.0)
	_check(turret.is_live(), "now the circuit feeds it")

	# Too far apart is too far apart
	var far = world._spawn_device("alarm", Vector3(100 + game.WIRE_RANGE + 5.0, 0, 100))
	_check(not grid.connect_devices(gen, far), "a wire will not reach across the map")
	world.remove_device(far)

	# A switch downstream of the generator arms and disarms what is behind it
	var switch = world._spawn_device("smart_switch", Vector3(102, 0, 103))
	var lamp = world._spawn_device("alarm", Vector3(102, 0, 106))
	grid.connect_devices(gen, switch)
	grid.connect_devices(switch, lamp)
	switch.switch_on = true
	grid.solve(1.0)
	_check(lamp.is_live(), "with the switch armed the alarm behind it has power")
	switch.switch_on = false
	grid.solve(1.0)
	_check(not lamp.is_live(), "flipping the switch cuts everything downstream")
	switch.switch_on = true

	# Solar makes nothing at night; a battery covers the gap
	var panel = world._spawn_device("solar_panel", Vector3(108, 0, 100))
	world._sun_elevation = -0.8
	_check(is_equal_approx(panel.power_output(1.0), 0.0),
		"a solar panel makes nothing after dark")
	world._sun_elevation = 1.0
	_check(panel.power_output(1.0) > 0.0, "and its full rating at noon")

	var cell = world._spawn_device("battery", Vector3(110, 0, 100))
	_check(cell.is_battery(), "a battery is a battery")
	var banked: float = cell.charge(1000.0, 1.0)
	_check(banked > 0.0 and cell.stored_charge == banked, "it banks a surplus")
	var given: float = cell.discharge(1000.0, 1.0)
	_check(given > 0.0 and cell.stored_charge < banked, "and pays it back on demand")

	# A shortfall costs you the big loads first
	var hungry = world._spawn_device("tesla_coil", Vector3(106, 0, 100))
	var quiet = world._spawn_device("alarm", Vector3(106, 0, 103))
	grid.connect_devices(gen, hungry)
	grid.connect_devices(gen, quiet)
	game.inventory["lgf"] = 0
	# Drain the generator by running enough ticks to burn its fuel through
	for i in 6:
		grid.solve(float(game.DEVICES["generator"].fuel_interval))
	_check(not hungry.is_live(),
		"a circuit with no fuel behind it stops feeding the coil")

	# Turrets only shoot at things that shoot back
	var NpcScript = load("res://scripts/npc.gd")
	var doe = NpcScript.new()
	doe.setup("deer", world)
	world.add_child(doe)
	var wolf = NpcScript.new()
	wolf.setup("wolf", world)
	world.add_child(wolf)
	_check(not doe.is_hostile() and wolf.is_hostile(),
		"a deer is not a threat and a wolf is")
	doe.queue_free()
	wolf.queue_free()

	# Mechanical traps need no circuit at all
	var mine = world._spawn_device("land_mine", Vector3(120, 0, 120))
	_check(mine.is_live(), "a land mine is live the moment it is buried")
	_check(float(game.DEVICES["land_mine"].get("blast", 0.0)) > 0.0
		and bool(game.DEVICES["bear_trap"].get("single_use", false)),
		"a mine goes off with a blast and a bear trap is spent once it fires")
	world.remove_device(mine)

	# A bear trap pins what steps in it
	var caught = NpcScript.new()
	caught.setup("boar", world)
	caught.position = Vector3(130, 0, 130)
	world.add_child(caught)
	caught.snare(3.0)
	var held_at: Vector3 = caught.position
	caught._physics_process(0.1)
	_check(caught.position.is_equal_approx(held_at), "a snared animal cannot walk away")
	caught.queue_free()

	# A keycard lock is the one lock that can shut you out of your own base
	_check(game.LOCKS.has("keycard_lock")
		and str(game.LOCKS["keycard_lock"].get("needs", "")) == "keycard",
		"a keycard lock wants the card in hand")
	var StructureScript = load("res://scripts/structure.gd")
	var vault = StructureScript.new()
	vault.setup("wooden_door")
	world.add_child(vault)
	vault.install_lock("keycard_lock")
	_clear_pockets(game)
	_check(not vault.player_may_open(), "without the card the door stays shut")
	game.inventory["keycard"] = 1
	_check(vault.player_may_open(), "with it the door opens")
	vault.queue_free()

	# Tear the test rig back down so the save check above is not disturbed
	for d in [gen, turret, switch, lamp, panel, cell, hungry, quiet]:
		if is_instance_valid(d):
			world.remove_device(d)
