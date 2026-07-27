extends SceneTree
## Plays the game the way a new player would and reports friction.
##
## The smoke test proves each system works in isolation. This asks the
## questions a player asks: can I actually reach the next tier from
## nothing? Is anything I collect useless? Will I survive a night?
##
##   godot --headless --path . --script res://tests/playtest.gd

var frame := 0
var world: Node3D
var game
var findings: Array = []


func _initialize() -> void:
	var scene: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(scene)
	world = scene


func _process(_delta: float) -> bool:
	frame += 1
	if frame == 6:
		_run()
		return true
	return false


func _note(kind: String, msg: String) -> void:
	findings.append({"kind": kind, "msg": msg})
	print("  [%s] %s" % [kind, msg])


func _section(title: String) -> void:
	print("")
	print("=== %s ===" % title)


# What the world hands you without crafting anything.
func _world_sources() -> Dictionary:
	return {
		"wood": "chop a tree",
		"stone": "hit a rock node",
		"iron": "hit a metal node",
		"sulfur_ore": "hit a sulfur node",
		"sulfur": "smelt sulfur ore in a furnace",
		"scrap": "smash a barrel or a monument crate",
		"lgf": "smash a barrel",
		"frag": "loot a monument crate, or smelt ore in a furnace",
		"charcoal": "burn wood in a furnace",
		"berries": "harvest a bush",
		"cloth": "kill an animal",
		"leather": "kill an animal",
		"raw_meat": "hunt a deer, wolf or bear",
		"cooked_meat": "cook raw meat on a campfire",
		"oil": "drill an ore node",
		"gear_comp": "research bench",
		"pipe": "research bench",
		"spring": "research bench",
		"sewing": "research bench",
		"hqm": "loot a monument crate, out in the radiation",
	}


func _run() -> void:
	game = root.get_node("/root/Game")
	world.started = true
	game.set_ui("")

	print("")
	print("############ PLAYTEST REPORT ############")

	_audit_start()
	_audit_reachability()
	_audit_dead_items()
	_audit_survival()
	_audit_progression_costs()
	_audit_monument_run()
	_audit_controls()

	_section("SUMMARY")
	var counts := {}
	for f in findings:
		counts[f.kind] = int(counts.get(f.kind, 0)) + 1
	for kind in counts:
		print("  %s: %d" % [kind, counts[kind]])
	print("  total findings: %d" % findings.size())
	print("############ END REPORT ############")


func _audit_start() -> void:
	_section("FRESH START")
	game.reset_state()
	var total := 0
	var listed := []
	for id in game.inventory:
		var n: int = game.get_count(id)
		if n > 0:
			total += n
			listed.append("%s x%d" % [id, n])
	print("  starting inventory: %s" % ", ".join(listed))
	if total > 200:
		_note("BALANCE", "A new player starts with %d items (wood 2000, stone 1000, frag 500, hqm 100). "
			% total + "Nothing early costs anything, so gathering, the furnace and the whole "
			+ "tier-1 loop are skippable. This reads like leftover debug stock.")
	if game.get_count("hqm") > 0:
		_note("BALANCE", "High Quality Metal is handed out at spawn but has no source anywhere "
			+ "in the world, so once spent it can never be replaced.")
	# What can you do on turn one?
	var starting_tools := []
	for slot in game.belt:
		if slot is String:
			starting_tools.append(slot)
	print("  belt: %s" % str(starting_tools))
	if not ("stone_hatchet" in starting_tools or "stone_pickaxe" in starting_tools):
		print("  (bare hands gather at 1x - the intended slow start)")


## Fixed-point walk: start from what the world gives, keep crafting until
## nothing new becomes reachable.
func _audit_reachability() -> void:
	_section("PROGRESSION REACHABILITY")
	var sources := _world_sources()
	var have := {}
	for id in sources:
		if str(sources[id]).begins_with("no source"):
			continue
		have[id] = true

	var changed := true
	var steps := 0
	while changed and steps < 40:
		changed = false
		steps += 1
		for id in game.ITEMS:
			if have.has(id):
				continue
			var item: Dictionary = game.ITEMS[id]
			if not item.has("recipe"):
				continue
			var ok := true
			for res in item.recipe:
				if not have.has(res):
					ok = false
					break
			if ok:
				have[id] = true
				changed = true

	var unreachable := []
	for id in game.ITEMS:
		if not have.has(id):
			unreachable.append(id)
	if unreachable.is_empty():
		print("  every item is reachable from a bare-handed start")
	else:
		for id in unreachable:
			var item: Dictionary = game.ITEMS[id]
			if item.has("recipe"):
				var missing := []
				for res in item.recipe:
					if not have.has(res):
						missing.append(res)
				_note("BLOCKER", "'%s' can never be crafted - missing %s"
					% [item.name, str(missing)])
			else:
				_note("BLOCKER", "'%s' has no recipe and no source in the world"
					% item.name)


## Anything you can collect but can never spend is busywork.
func _audit_dead_items() -> void:
	_section("DEAD ITEMS")
	var consumed := {}
	for id in game.ITEMS:
		var item: Dictionary = game.ITEMS[id]
		if item.has("recipe"):
			for res in item.recipe:
				consumed[res] = true
	for tier in game.BUILDING_TIERS:
		for res in game.BUILDING_TIERS[tier].cost:
			consumed[res] = true
	for res in game.UPKEEP_MATERIALS:
		consumed[res] = true

	var used_directly := {}
	for id in game.CONSUMABLES:
		used_directly[id] = true
	for id in game.DEPLOYABLES:
		used_directly[id] = true
	for id in game.EXPLOSIVES:
		used_directly[id] = true
	# Spent on a door, where they decide whether a guard can follow you in
	for id in game.LOCKS:
		used_directly[id] = true
	# Things whose effect lives in code rather than in a recipe: the torch
	# lights the player, the launcher fires rockets, doors get placed.
	for id in ["building_plan", "hammer", "rocket_launcher", "wooden_door", "door", "torch"]:
		used_directly[id] = true
	for id in game.WEAPONS:
		used_directly[id] = true
		var ammo := str(game.WEAPONS[id].get("ammo", ""))
		if ammo != "":
			used_directly[ammo] = true
	# Consumed by a station rather than by a recipe: the furnace refines
	# crude oil and smelts ore, the campfire cooks, the bench researches.
	var station_script = load("res://scripts/station.gd")
	for recipe in station_script.SMELTING:
		used_directly[str(recipe.input)] = true
	for id in ["raw_meat", "scrap"]:
		used_directly[id] = true
	# Worn rather than spent
	for id in game.ARMOUR:
		used_directly[id] = true
	# Tools that change gathering rates
	var node_script = load("res://scripts/resource_node.gd")
	for node_type in node_script.TOOL_YIELD:
		for tool_id in node_script.TOOL_YIELD[node_type]:
			used_directly[tool_id] = true

	var dead := []
	for id in game.ITEMS:
		if consumed.has(id) or used_directly.has(id):
			continue
		dead.append(id)
	if dead.is_empty():
		print("  every item is either an ingredient or does something")
	else:
		for id in dead:
			_note("DEAD-END", "'%s' can be obtained but nothing consumes or uses it"
				% game.ITEMS[id].name)


func _audit_survival() -> void:
	_section("SURVIVING THE FIRST NIGHT")
	game.reset_state()
	game.stats.health = 100.0
	game.stats.hunger = 100.0
	game.stats.thirst = 100.0
	game.stats.temperature = 100.0
	world.player.position = Vector3(0, world.terrain_height(0, 0) + 2.0, 0)

	# Fast-forward a full day with no fire and no food, sampling the stats
	var step := 1.0
	var elapsed := 0.0
	var first_hurt := -1.0
	var died_at := -1.0
	world._sun_elevation = -1.0   # hold it at deep night: worst case
	while elapsed < game.DAY_LENGTH:
		world._update_stations(step)
		game.stats.hunger = maxf(0.0, game.stats.hunger - 0.05 * step)
		game.stats.thirst = maxf(0.0, game.stats.thirst - 0.08 * step)
		if game.stats.temperature < world.FREEZING_POINT:
			game.stats.health -= (world.FREEZING_POINT - game.stats.temperature) * 0.06 * step
		if game.stats.hunger <= 0.0 or game.stats.thirst <= 0.0:
			game.stats.health -= 2.0 * step
		if game.stats.health < 100.0 and first_hurt < 0.0:
			first_hurt = elapsed
		if game.stats.health <= 0.0 and died_at < 0.0:
			died_at = elapsed
			break
		elapsed += step

	print("  exposed all night, no fire: first damage at %.0fs, death at %.0fs (day = %.0fs)"
		% [first_hurt, died_at, game.DAY_LENGTH])
	if died_at > 0.0 and died_at < 120.0:
		_note("BALANCE", "Freezing kills a fresh player in %.0f seconds with no warning "
			% died_at + "and no starting fire - brutal for the first minute of a new game.")
	elif died_at < 0.0:
		_note("BALANCE", "A player can stand outside all night with no fire and never die - "
			+ "the temperature system has no teeth.")

	# How long does a campfire buy you?
	var fire = world._spawn_station("campfire", world.player.position + Vector3(1, 0, 0))
	game.stats.temperature = 10.0
	for i in 60:
		world._update_stations(0.5)
	print("  30s beside a campfire recovers warmth to %.0f/100" % game.stats.temperature)
	if game.stats.temperature < 60.0:
		_note("BALANCE", "A campfire barely warms you (%.0f after 30s) - the counter to "
			% game.stats.temperature + "freezing is too weak to rely on.")
	fire.queue_free()

	# Is drinking actually available?
	var lake_found := false
	for gx in range(-190, 190, 6):
		for gz in range(-190, 190, 6):
			if world.terrain_height(float(gx), float(gz)) < world.WATER_LEVEL - 0.4:
				lake_found = true
				break
		if lake_found:
			break
	if not lake_found:
		_note("BLOCKER", "No lake exists on the generated map, so thirst can never be refilled.")
	else:
		print("  drinkable water exists on the map (press F while standing in it)")


func _audit_progression_costs() -> void:
	_section("COST OF THE FIRST WORKBENCH")
	game.reset_state()
	game.inventory.clear()
	game.inventory_changed.emit()

	var bench: Dictionary = game.ITEMS["workbench_t1"].recipe
	var parts := []
	for res in bench:
		parts.append("%d %s" % [bench[res], res])
	print("  workbench_t1 costs %s" % ", ".join(parts))

	# Frag is the gate: you need a furnace first, which needs low grade fuel
	var furnace: Dictionary = game.ITEMS["furnace"].recipe
	var fparts := []
	for res in furnace:
		fparts.append("%d %s" % [furnace[res], res])
	print("  ...and frag needs a furnace, which costs %s" % ", ".join(fparts))
	print("  ...and low grade fuel only drops from barrels (2 per hit, 3 hits per barrel)")
	var barrels_needed: int = ceili(float(furnace.get("lgf", 0)) / 6.0)
	print("  => roughly %d barrels must be found before the first workbench"
		% barrels_needed)
	if barrels_needed > 3:
		_note("PACING", "The first workbench is gated behind ~%d barrels of low grade fuel, "
			% barrels_needed + "which spawn randomly - progression can stall on bad luck.")

	# Sanity: can the tier chain actually be paid for?
	game.workbench_level = 2
	# One charge needs 50 gunpowder, and each gunpowder costs 20 sulfur and
	# 30 charcoal, so stock enough for the whole chain in one go.
	game.inventory = {"sulfur": 2000, "charcoal": 2000, "lgf": 100, "frag": 1000,
		"cloth": 100, "gunpowder": 0, "explosives": 0}
	game.inventory_changed.emit()
	var made_powder: bool = game.craft("gunpowder", 50)
	var made_explosives := false
	if made_powder:
		made_explosives = game.craft("explosives", 1)
	print("  raid chain from smelted sulfur: gunpowder=%s explosives=%s"
		% [str(made_powder), str(made_explosives)])
	if not (made_powder and made_explosives):
		_note("BLOCKER", "The sulfur to explosives chain cannot be completed even with "
			+ "plenty of inputs.")


## The monument holds the only high quality metal on the map, and it is
## guarded and irradiated. If the fight is unwinnable the tier-3 half of the
## crafting tree is decoration; if it is free, the radiation is theatre.
func _audit_monument_run() -> void:
	_section("THE MONUMENT RUN")
	var npc_script = load("res://scripts/npc.gd")
	var sci: Dictionary = npc_script.TYPES["scientist"]
	var guards: int = world.GUARDS_PER_MONUMENT

	# Averaged over the approach: full range down to the crate
	var probe = npc_script.new()
	probe.setup("scientist", world)
	var hit_avg := 0.0
	for step in 5:
		hit_avg += probe.hit_chance(float(sci.range) * (float(step) + 0.5) / 5.0)
	hit_avg /= 5.0
	probe.free()

	var dps: float = guards * float(sci.damage) * hit_avg / float(sci.cooldown)
	var ttk: float = 100.0 / dps
	print("  %d guards, %.0f damage a shot, %.0f%% of shots land on approach"
		% [guards, float(sci.damage), hit_avg * 100.0])
	print("  => %.1f damage a second, %.0fs of standing in the open before you die" % [dps, ttk])
	if ttk < 5.0:
		_note("BALANCE", "Guards kill a full-health player in %.0fs, which is not "
			% ttk + "enough time to shoot back or run. The monument is a wall, "
			+ "and everything gated behind high quality metal is unreachable.")
	elif ttk > 60.0:
		_note("BALANCE", "Guards need %.0fs to kill you, so the monument is free "
			% ttk + "loot and the radiation is the only real cost.")

	# The same fight in the best gear the crafting tree can produce
	var best: Dictionary = {}
	for id in game.ARMOUR:
		var slot := str(game.ARMOUR[id].slot)
		if not best.has(slot) or float(game.ARMOUR[id].protect) > float(game.ARMOUR[best[slot]].protect):
			best[slot] = id
	var worn_backup: Dictionary = game.worn
	game.worn = best
	var geared_ttk: float = ttk / maxf(0.05, 1.0 - game.armour_protection())
	var rad_shield: float = game.radiation_protection()
	print("  in the best armour (%d%% soaked): %.0fs instead of %.0fs"
		% [roundi(game.armour_protection() * 100.0), geared_ttk, ttk])
	game.worn = worn_backup
	if geared_ttk < ttk * 1.2:
		_note("BALANCE", "A full set of armour only buys %.0fs over going bare, "
			% (geared_ttk - ttk) + "so there is no reason to craft any of it.")

	# Radiation runs on its own clock while the shooting happens
	var rad_fill: float = 100.0 / 2.0
	print("  radiation fills in %.0fs inside the %.0fm zone (%.0fs in a hazmat suit), "
		% [rad_fill, game.RAD_ZONE_RADIUS, rad_fill / maxf(0.05, 1.0 - rad_shield)]
		+ "then costs 2 hp/s")
	if rad_fill > ttk:
		print("  (the guards, not the radiation, are what stop you)")

	var weapons_in_reach := []
	for id in game.WEAPONS:
		if float(game.WEAPONS[id].range) >= float(sci.range):
			weapons_in_reach.append(id)
	if weapons_in_reach.is_empty():
		_note("BALANCE", "No weapon reaches as far as a guard's rifle (%.0fm), so "
			% float(sci.range) + "there is no way to fight one on even terms.")
	else:
		print("  weapons that can answer at their range: %s" % str(weapons_in_reach))


func _audit_controls() -> void:
	_section("CONTROLS A PLAYER WILL REACH FOR")
	var expected := {
		"move_forward": "walk", "move_back": "walk", "move_left": "walk",
		"move_right": "walk", "jump": "jump", "attack": "hit / gather",
		"build_menu": "open the build wheel", "inventory": "inventory",
		"blueprint": "blueprint menu", "rotate_piece": "rotate a piece",
		"hammer_action": "upgrade / repair", "cancel_build": "cancel building",
		"toggle_view": "first / third person", "pause": "pause",
		"interact": "drink",
	}
	for action in expected:
		if not InputMap.has_action(action):
			_note("BLOCKER", "No input action bound for '%s' (%s)" % [action, expected[action]])
	for i in range(1, 7):
		if not InputMap.has_action("slot_%d" % i):
			_note("BLOCKER", "Hotbar slot %d has no key bound" % i)
	print("  %d actions checked" % (expected.size() + 6))

	# Sprint is advertised on the start screen? Check it is discoverable.
	var has_sprint := InputMap.has_action("sprint")
	if not has_sprint:
		_note("DISCOVERABILITY", "Sprint is hardwired to the Shift key inside player.gd "
			+ "instead of an input action, so it cannot be rebound and never appears "
			+ "in the controls list on the start screen.")
