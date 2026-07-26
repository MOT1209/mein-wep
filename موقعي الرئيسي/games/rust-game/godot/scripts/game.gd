extends Node
## Autoload "Game" — global state: item database, inventory, belt, stats,
## building data and UI-open bookkeeping. Direct port of the Three.js game's
## CONFIG / state / ITEMS_DATA / BUILDING_* tables.

signal inventory_changed
signal belt_changed
signal toast(msg: String, color: Color)

const WORLD_SIZE := 400.0
const DAY_LENGTH := 800.0
const RAD_ZONE_RADIUS := 25.0
const TC_RADIUS := 25.0
const INTERACT_DISTANCE := 5.0
const BUILD_DISTANCE := 10.0

const TIER_ORDER := ["twig", "wood", "stone", "metal", "hqm"]

const BUILDING_TIERS := {
	"twig": {"name": "Twig", "health": 10, "color": Color8(215, 204, 200), "cost": {}},
	"wood": {"name": "Wood", "health": 250, "color": Color8(141, 110, 99), "cost": {"wood": 300}},
	"stone": {"name": "Stone", "health": 500, "color": Color8(176, 190, 197), "cost": {"stone": 300}},
	"metal": {"name": "Sheet Metal", "health": 1000, "color": Color8(144, 164, 174), "cost": {"frag": 200}},
	"hqm": {"name": "Armored", "health": 2000, "color": Color8(236, 239, 241), "cost": {"hqm": 50}},
}

const BUILDING_TYPES := {
	"foundation": {"name": "Foundation", "size": Vector3(3, 0.2, 3), "y": 0.1, "requires_support": false, "is_door": false},
	"wall": {"name": "Wall", "size": Vector3(3, 3, 0.2), "y": 1.5, "requires_support": true, "is_door": false},
	"doorway": {"name": "Doorway", "size": Vector3(3, 3, 0.2), "y": 1.5, "requires_support": true, "is_door": false},
	"ceiling": {"name": "Ceiling", "size": Vector3(3, 0.2, 3), "y": 3.0, "requires_support": true, "is_door": false},
	"tool_cupboard": {"name": "Tool Cupboard", "size": Vector3(1, 1.8, 0.8), "y": 0.9, "requires_support": true, "is_door": false},
	"wooden_door": {"name": "Door", "size": Vector3(0.9, 2.1, 0.1), "y": 1.05, "requires_support": false, "is_door": true},
}

const ITEMS := {
	"wood": {"name": "Wood", "category": "resources", "color": "8d6e63", "rarity": "common", "desc": "Harvested from trees. Used for base building and fuel."},
	"stone": {"name": "Stone", "category": "resources", "color": "b0bec5", "rarity": "common", "desc": "Raw stone for primitive tools and base stabilization."},
	"iron": {"name": "Metal Ore", "category": "resources", "color": "90a4ae", "rarity": "common", "desc": "Raw iron ore. Smelt this to get metal fragments."},
	"sulfur": {"name": "Sulfur Ore", "category": "resources", "color": "fff176", "rarity": "common", "desc": "Volatile ore used in explosives and gunpowder."},
	"hqm": {"name": "High Quality Metal", "category": "resources", "color": "eceff1", "rarity": "elite", "desc": "Rare refined metal for modular weapons and armor."},
	"frag": {"name": "Metal Fragments", "category": "resources", "color": "ef5350", "rarity": "rare", "desc": "Refined iron used for most mid-tier items."},
	"lgf": {"name": "Low Grade Fuel", "category": "resources", "color": "e53935", "rarity": "common", "desc": "Tallow and cloth mix. Powering your survival."},
	"cloth": {"name": "Cloth", "category": "resources", "color": "f5f5f5", "rarity": "common", "desc": "Fibers from hemp plants. Used for clothing and meds."},
	"leather": {"name": "Leather", "category": "resources", "color": "795548", "rarity": "rare", "desc": "High-durability animal skin."},
	"scrap": {"name": "Scrap", "category": "items", "color": "d1c4e9", "rarity": "rare", "desc": "Essential material for unlocking higher technology."},
	"gear_comp": {"name": "Gears", "category": "items", "color": "bdbdbd", "rarity": "rare", "desc": "Rusty mechanical parts for machinery."},
	"pipe": {"name": "Metal Pipe", "category": "items", "color": "90a4ae", "rarity": "rare", "desc": "Sturdy pipe used for firearms barrels."},
	"spring": {"name": "Spring", "category": "items", "color": "cfd8dc", "rarity": "rare", "desc": "Tension spring for automatic weapons."},
	"sewing": {"name": "Sewing Kit", "category": "items", "color": "bdbdbd", "rarity": "common", "desc": "Required for advanced clothing."},
	"stone_hatchet": {"name": "Stone Hatchet", "category": "tools", "color": "bcaae1", "rarity": "common", "recipe": {"wood": 200, "stone": 100}, "desc": "Primitive tool for wood harvesting."},
	"stone_pickaxe": {"name": "Stone Pickaxe", "category": "tools", "color": "bcaae1", "rarity": "common", "recipe": {"wood": 200, "stone": 100}, "desc": "Slow but effective for basic mining."},
	"hammer": {"name": "Building Hammer", "category": "tools", "color": "1e88e5", "rarity": "common", "recipe": {"wood": 100}, "desc": "Construct and upgrade your base."},
	"torch": {"name": "Torch", "category": "tools", "color": "fb8c00", "rarity": "common", "recipe": {"wood": 50, "lgf": 1}, "desc": "Provides light and subtle heat."},
	"spear": {"name": "Wooden Spear", "category": "weapons", "color": "8d6e63", "rarity": "common", "recipe": {"wood": 300}, "desc": "Cheap long-range melee option."},
	"machete": {"name": "Machete", "category": "weapons", "color": "90a4ae", "rarity": "rare", "recipe": {"iron": 100}, "desc": "Standard industrial blade."},
	"bow": {"name": "Hunting Bow", "category": "weapons", "color": "8d6e63", "rarity": "common", "recipe": {"wood": 200, "cloth": 50}, "desc": "Silent and deadly ranged tool."},
	"pistol": {"name": "Semi-Pistol", "category": "weapons", "color": "546e7a", "rarity": "rare", "recipe": {"iron": 150, "pipe": 1}, "desc": "P250 clone. Fast firing sidearm."},
	"ak47": {"name": "Assault Rifle", "category": "weapons", "color": "6d4c41", "rarity": "elite", "recipe": {"hqm": 50, "wood": 200, "scrap": 50, "pipe": 1}, "desc": "The king of Rust weapons. High recoil, high reward."},
	"furnace": {"name": "Furnace", "category": "items", "color": "ff7043", "rarity": "rare", "recipe": {"stone": 200, "wood": 100, "lgf": 10}, "desc": "Smelts ores into metal/sulfur using wood."},
	"campfire": {"name": "Campfire", "category": "items", "color": "ffab40", "rarity": "common", "recipe": {"wood": 100}, "desc": "Useful for light and cooking meat."},
	"building_plan": {"name": "Building Plan", "category": "tools", "color": "64b5f6", "rarity": "common", "recipe": {"wood": 20}, "desc": "Select building pieces to place."},
	"door": {"name": "Wood Door", "category": "construction", "color": "8d6e63", "rarity": "common", "recipe": {"wood": 300}, "desc": "Access point with minimal security."},
	"lock": {"name": "Key Lock", "category": "construction", "color": "546e7a", "rarity": "common", "recipe": {"iron": 100}, "desc": "Basic protection for your base."},
	"bandage": {"name": "Bandage", "category": "medical", "color": "e57373", "rarity": "common", "recipe": {"cloth": 2}, "desc": "Stops bleeding immediately."},
	"syringe": {"name": "Medical Syringe", "category": "medical", "color": "ef5350", "rarity": "rare", "recipe": {"iron": 20, "scrap": 5, "cloth": 10}, "desc": "Instant adrenaline-boosted recovery."},
	"wooden_door": {"name": "Wooden Door", "category": "construction", "color": "5d4037", "rarity": "common", "recipe": {"wood": 300}, "desc": "Fits into doorways."},
	"codelock": {"name": "Code Lock", "category": "items", "color": "78909c", "rarity": "rare", "recipe": {"frag": 100}, "desc": "Secure your doors with a 4-digit code."},
	"berries": {"name": "Berries", "category": "resources", "color": "e57399", "rarity": "common", "desc": "Wild berries. Eat to restore hunger."},
	"raw_meat": {"name": "Raw Meat", "category": "resources", "color": "ef9a9a", "rarity": "common", "desc": "Hunted meat. Cook it at a campfire before eating."},
	"cooked_meat": {"name": "Cooked Meat", "category": "resources", "color": "a1887f", "rarity": "common", "desc": "A proper meal. Restores a lot of hunger."},
}

## Items that can be consumed with LMB while equipped in the belt.
const CONSUMABLES := {
	"berries": {"hunger": 25.0},
	"raw_meat": {"hunger": 5.0, "health": -5.0},
	"cooked_meat": {"hunger": 40.0, "health": 5.0},
	"bandage": {"health": 15.0},
	"syringe": {"health": 50.0},
}

const CATEGORIES := ["common", "construction", "items", "resources", "tools", "medical", "weapons"]

var inventory: Dictionary = {}
var belt: Array = ["building_plan", "hammer", null, null, null, null]
var selected_belt_slot: int = 0
var stats: Dictionary = {"health": 100.0, "hunger": 100.0, "thirst": 100.0, "radiation": 0.0}
var day_time: float = 300.0
var tool_cupboards: Array = []  # Array of Vector2 (x, z)
var selected_blueprint: String = ""
var blueprint_rotation: float = 0.0
var ui_open: String = "start"


func _ready() -> void:
	reset_state()


func reset_state() -> void:
	inventory = {
		"wood": 2000, "stone": 1000, "frag": 500, "hqm": 100,
		"building_plan": 1, "hammer": 1,
	}
	belt = ["building_plan", "hammer", null, null, null, null]
	selected_belt_slot = 0
	stats = {"health": 100.0, "hunger": 100.0, "thirst": 100.0, "radiation": 0.0}
	day_time = 300.0
	tool_cupboards = []
	selected_blueprint = ""
	blueprint_rotation = 0.0


func get_count(id: String) -> int:
	return int(inventory.get(id, 0))


func add_item(id: String, count: int) -> void:
	inventory[id] = get_count(id) + count
	inventory_changed.emit()


func remove_item(id: String, count: int) -> void:
	inventory[id] = maxi(0, get_count(id) - count)
	inventory_changed.emit()


func active_tool() -> String:
	var t = belt[selected_belt_slot]
	return t if t is String else ""


func can_afford(cost: Dictionary) -> bool:
	for res in cost:
		if get_count(res) < int(cost[res]):
			return false
	return true


func consume(cost: Dictionary) -> void:
	for res in cost:
		inventory[res] = get_count(res) - int(cost[res])
	inventory_changed.emit()


func craft(id: String, qty: int) -> bool:
	var item: Dictionary = ITEMS.get(id, {})
	if not item.has("recipe"):
		return false
	var total := {}
	for res in item.recipe:
		total[res] = int(item.recipe[res]) * qty
	if not can_afford(total):
		notify("Not enough resources", Color(0.9, 0.3, 0.3))
		return false
	consume(total)
	add_item(id, qty)
	notify("Crafted %s x%d" % [item.name, qty])
	_sfx("upgrade")
	return true


## Resolved by path instead of naming the Sfx autoload directly: a direct
## reference makes this script's compilation depend on another autoload,
## which fails whenever scripts are compiled before every autoload has
## registered (as happens for `godot --script` tool scripts).
func _sfx(clip: String) -> void:
	var s := get_node_or_null("/root/Sfx")
	if s != null:
		s.play(clip)


func consume_item(id: String) -> bool:
	if not CONSUMABLES.has(id) or get_count(id) <= 0:
		return false
	var c: Dictionary = CONSUMABLES[id]
	remove_item(id, 1)
	stats.health = clampf(stats.health + float(c.get("health", 0.0)), 1.0, 100.0)
	stats.hunger = clampf(stats.hunger + float(c.get("hunger", 0.0)), 0.0, 100.0)
	stats.thirst = clampf(stats.thirst + float(c.get("thirst", 0.0)), 0.0, 100.0)
	if get_count(id) <= 0:
		for i in belt.size():
			if belt[i] == id:
				belt[i] = null
		belt_changed.emit()
	notify("Consumed %s" % ITEMS[id].name)
	_sfx("eat")
	return true


func notify(msg: String, color: Color = Color(0.3, 0.8, 0.3)) -> void:
	toast.emit(msg, color)


func set_ui(name_: String) -> void:
	ui_open = name_
	if name_ == "":
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	else:
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func has_building_privilege(pos: Vector3) -> bool:
	for tc in tool_cupboards:
		if Vector2(pos.x, pos.z).distance_to(tc) < TC_RADIUS:
			return true
	return false
