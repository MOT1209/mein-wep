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

## Upgrade path: twig -> wood -> stone -> sheet metal -> concrete -> armored.
const TIER_ORDER := ["twig", "wood", "stone", "metal", "concrete", "hqm"]

## `blast_resist` scales incoming explosive damage — it is the whole reason
## to spend resources climbing the tiers.
const BUILDING_TIERS := {
	"twig": {"name": "Twig", "health": 10, "color": Color8(215, 204, 200), "cost": {},
		"metallic": 0.0, "roughness": 0.95, "blast_resist": 1.0},
	"wood": {"name": "Wood", "health": 250, "color": Color8(141, 110, 99), "cost": {"wood": 300},
		"metallic": 0.0, "roughness": 0.85, "blast_resist": 0.9},
	"stone": {"name": "Stone", "health": 500, "color": Color8(150, 150, 145), "cost": {"stone": 300},
		"metallic": 0.0, "roughness": 0.95, "blast_resist": 0.7},
	"metal": {"name": "Sheet Metal", "health": 1000, "color": Color8(144, 164, 174), "cost": {"frag": 200},
		"metallic": 0.8, "roughness": 0.4, "blast_resist": 0.55},
	"concrete": {"name": "Concrete", "health": 1500, "color": Color8(178, 176, 168), "cost": {"stone": 500, "frag": 100},
		"metallic": 0.0, "roughness": 0.9, "blast_resist": 0.45},
	"hqm": {"name": "Armored", "health": 2000, "color": Color8(226, 230, 234), "cost": {"hqm": 50},
		"metallic": 0.9, "roughness": 0.25, "blast_resist": 0.3},
}

## Weapons you can actually swing or fire. Anything with `ammo` is ranged
## and spends a round per shot; everything else is melee and reaches only
## as far as `range`. Bare fists stay at FIST_DAMAGE.
const FIST_DAMAGE := 15.0

## `pellets` and `spread` turn one trigger pull into a cone of shots: a
## shotgun that lands everything at contact range and almost nothing past
## it. Both default to a single straight shot, so every other weapon here
## behaves exactly as it always has.
## `mag` is how many rounds the weapon holds before it has to be reloaded out
## of your pockets; `modes` are the fire modes it can be cycled through;
## `sway` is how wide it shoots before stance, aiming and a held breath have
## their say. A weapon with no `ammo` is melee and has none of these.
##
## `scope` lists the magnifications the sight can be switched between, so a
## rifle can be aimed at a doorway or at a ridgeline with the same weapon.
const WEAPONS := {
	"spear": {"damage": 35.0, "range": 3.6, "cooldown": 0.9},
	"machete": {"damage": 30.0, "range": 2.6, "cooldown": 0.5},
	"bow": {"damage": 50.0, "range": 60.0, "cooldown": 1.1, "ammo": "arrow",
		"mag": 1, "modes": ["semi"], "reload_time": 1.0, "sway": 0.006},
	"pipe_shotgun": {"damage": 14.0, "range": 22.0, "cooldown": 1.1,
		"ammo": "ammo_shotgun", "pellets": 8, "spread": 0.06,
		"mag": 1, "modes": ["semi"], "reload_time": 1.5, "sway": 0.02},
	"pistol": {"damage": 40.0, "range": 80.0, "cooldown": 0.35, "ammo": "ammo_pistol",
		"mag": 12, "modes": ["semi"], "reload_time": 1.9, "sway": 0.011},
	"ak47": {"damage": 55.0, "range": 130.0, "cooldown": 0.12, "ammo": "ammo_rifle",
		"mag": 30, "modes": ["semi", "burst", "auto"], "reload_time": 2.7,
		"sway": 0.017, "scope": [1.0, 2.5]},
}

## Rounds a burst sends per trigger pull.
const BURST_ROUNDS := 3

## What a bare-handed bash with a rifle in your hands is worth. The melee
## button always does something, whatever you are holding — but it is never
## the equal of the actual melee weapon.
const MELEE_BASH_DAMAGE := 18.0
const MELEE_BASH_RANGE := 2.2
const MELEE_BASH_COOLDOWN := 0.7
## A held melee button swings a combo: each hit in the chain lands harder than
## the last, which is the reward for committing to standing still and swinging.
const MELEE_COMBO_STEPS := 3
const MELEE_COMBO_GAIN := 0.35
## How long after a swing the chain still counts as continuing.
const MELEE_COMBO_WINDOW := 1.1

## How much aiming and a held breath tighten the shot.
const ADS_SPREAD_SCALE := 0.45
const BREATH_SPREAD_SCALE := 0.5

## How many uses a tool or weapon has in it before it breaks. Nothing you
## carry lasts forever, which is what keeps a mining run tied to the cost of
## the pick that made it and stops one good hatchet from being the last one
## you ever need. Anything absent from this table never wears out — the
## building plan, the hammer, thrown gear.
##
## Swinging at a resource node, hitting something with a weapon, or firing a
## round each spend one point; a chainsaw and a jackhammer spend one per
## swing too but do several swings' worth of work for it.
const TOOL_DURABILITY := {
	"stone_hatchet": 120, "stone_pickaxe": 120,
	"metal_hatchet": 400, "metal_pickaxe": 400,
	"chainsaw": 350, "jackhammer": 350, "drill": 300,
	"repair_tool": 250, "flashlight": 600, "binoculars": 900,
	"torch": 400,
	"spear": 90, "machete": 220, "bow": 300,
	"pipe_shotgun": 120, "pistol": 400, "ak47": 600, "rocket_launcher": 120,
}

## A worn tool still works, but not as well: below this fraction of its
## durability it gathers and hits at reduced effect, so a blunt pick is felt
## before it snaps rather than only at the moment it does.
const WORN_THRESHOLD := 0.25
const WORN_PENALTY := 0.5

## Repairing at a workbench costs this fraction of the item's own recipe per
## full bar restored, so keeping a rifle alive is cheaper than building the
## next one but never free.
const REPAIR_COST_FRACTION := 0.2

## Tools that burn fuel while they run. Low grade fuel per use.
const TOOL_FUEL := {"chainsaw": 0.2, "jackhammer": 0.2, "drill": 0.15}

## Wearable protection, one item per `slot`. `protect` is the fraction of
## incoming damage it soaks; `rads` is the fraction of radiation it keeps
## out. Guards hit for 13 a shot and the monument is irradiated, so this is
## the gear answer to both.
const ARMOUR := {
	"wood_armour": {"slot": "chest", "protect": 0.12, "rads": 0.0},
	"road_vest": {"slot": "chest", "protect": 0.25, "rads": 0.05},
	"metal_facemask": {"slot": "head", "protect": 0.20, "rads": 0.0},
	"hazmat": {"slot": "suit", "protect": 0.08, "rads": 0.75},
}

## The most damage armour may ever soak, however much you stack.
const ARMOUR_CAP := 0.6

## Door locks. Installed on a door with the lock in hand; the owner always
## walks through, but a hostile cannot open a locked door. `strength` is how
## much punishment the lock itself takes before it gives way — a code lock
## has no keyhole to break, so an attacker has to bring the whole door down.
## `needs` is an item that has to be on you before the door will open at
## all. A keycard lock has no keyhole to break and no code to be watched
## being typed in — but lose the card and you are outside your own base.
const LOCKS := {
	"lock": {"name": "Key Lock", "strength": 100.0},
	"codelock": {"name": "Code Lock", "strength": 0.0},
	"keycard_lock": {"name": "Keycard Lock", "strength": 0.0, "needs": "keycard"},
}

## Raiding gear. `mode` is how it gets deployed: stuck to a wall, thrown,
## or fired from a launcher. `impact` blows on first contact.
const EXPLOSIVES := {
	"c4": {"damage": 550.0, "radius": 4.5, "fuse": 6.0, "mode": "place"},
	"grenade": {"damage": 110.0, "radius": 4.0, "fuse": 3.5, "mode": "throw",
		"gravity": 14.0, "speed": 15.0},
	"rocket": {"damage": 350.0, "radius": 5.0, "fuse": 8.0, "mode": "fire",
		"gravity": 1.5, "speed": 32.0, "impact": true},
}

## Every piece has a weak face: the one the builder was standing on. Hits
## landing there count double, so a raider either gets inside the base or
## pays twice for the same wall — the reason Rust players care which way
## round a wall goes up.
## Physics layers: 1 terrain, 2 structures, 4 resources, 8 creatures,
## 16 player, 32 floors.
##
## Floors sit on their own layer because creatures pin their height to the
## ground every frame instead of falling onto things. A foundation is a
## 20cm slab at ground level, so on the structure layer it caught every
## creature by the shins: nothing could set foot in a base, and the guards
## that force doors could never reach one. Floors are stepped onto, not
## walked into.
const LAYER_FLOOR := 32
const FLOOR_TYPES := ["foundation", "triangle_foundation", "ceiling"]

## Pieces something else can be built on top of. A foundation or a triangle
## carries the storey above it from the ground; a ceiling carries the one
## above that.
const SUPPORT_TYPES := ["foundation", "triangle_foundation", "ceiling"]

## Pieces that anchor a column at full stability because they sit on the
## earth themselves. Everything else is only as well held up as what it
## stands on.
const ANCHOR_TYPES := ["foundation", "triangle_foundation"]

## Pieces that belong to no column at all: they stand on the ground on their
## own and nothing is ever stacked on them, so the stability sweep leaves
## them alone rather than collapsing them for having no footing.
const FREESTANDING_TYPES := ["barricade"]

const SOFT_SIDE_MULT := 2.0

## Stability: a foundation anchors its column at 100 and each piece stacked
## above it loses this much. At zero a piece has nothing holding it up and
## falls — which is what makes blowing the foundation out from under a base
## worth more than chewing through its walls one at a time.
const STABILITY_DROP := 25.0

## Decay: unprotected structures rot away; a stocked Tool Cupboard stops it.
const DECAY_INTERVAL := 10.0
const DECAY_UNPROTECTED := 0.015   # fraction of max health per tick
const DECAY_UNPAID := 0.008
const UPKEEP_MATERIALS := ["wood", "stone", "frag"]

## `shape` names the collision solid when a plain box will not do:
## "triangle" is half a tile split along its diagonal, "wedge" is a roof
## slope. Absent means a box of `size`, which is what almost everything is.
const BUILDING_TYPES := {
	"foundation": {"name": "Foundation", "size": Vector3(3, 0.2, 3), "y": 0.1, "requires_support": false, "is_door": false},
	"triangle_foundation": {"name": "Triangle Foundation", "size": Vector3(3, 0.2, 3), "y": 0.1, "requires_support": false, "is_door": false, "shape": "triangle"},
	"wall": {"name": "Wall", "size": Vector3(3, 3, 0.2), "y": 1.5, "requires_support": true, "is_door": false},
	"half_wall": {"name": "Half Wall", "size": Vector3(3, 1.5, 0.2), "y": 0.75, "requires_support": true, "is_door": false},
	"low_wall": {"name": "Low Wall", "size": Vector3(3, 0.9, 0.2), "y": 0.45, "requires_support": true, "is_door": false},
	"doorway": {"name": "Doorway", "size": Vector3(3, 3, 0.2), "y": 1.5, "requires_support": true, "is_door": false},
	"window_wall": {"name": "Window Wall", "size": Vector3(3, 3, 0.2), "y": 1.5, "requires_support": true, "is_door": false},
	"ceiling": {"name": "Ceiling", "size": Vector3(3, 0.2, 3), "y": 3.0, "requires_support": true, "is_door": false},
	"roof": {"name": "Sloped Roof", "size": Vector3(3, 1.5, 3), "y": 3.75, "requires_support": true, "is_door": false, "shape": "wedge"},
	"stairs": {"name": "Stairs", "size": Vector3(3, 3, 3), "y": 1.5, "requires_support": true, "is_door": false},
	"pillar": {"name": "Pillar", "size": Vector3(0.5, 3, 0.5), "y": 1.5, "requires_support": true, "is_door": false},
	"ladder": {"name": "Ladder", "size": Vector3(1.0, 3, 0.16), "y": 1.5, "requires_support": true, "is_door": false},
	"barricade": {"name": "Barricade", "size": Vector3(3, 1.4, 0.5), "y": 0.7, "requires_support": false, "is_door": false},
	"tool_cupboard": {"name": "Tool Cupboard", "size": Vector3(1, 1.8, 0.8), "y": 0.9, "requires_support": true, "is_door": false},
	"wooden_door": {"name": "Door", "size": Vector3(0.9, 2.1, 0.1), "y": 1.05, "requires_support": false, "is_door": true},
	"garage_door": {"name": "Garage Door", "size": Vector3(2.6, 2.6, 0.16), "y": 1.3, "requires_support": false, "is_door": true},
}

## Doors, and what fills each doorway. A garage door lifts into its own
## lintel instead of swinging, so it cannot be blocked from the far side and
## it seals the whole opening — which is what makes it worth the metal.
const DOOR_FILLS_DOORWAY := ["wooden_door", "garage_door"]
const LIFTING_DOORS := ["garage_door"]

## Barricades are the one piece that hurts whatever walks into it. Anything
## that shares the barricade's space takes this much per second.
const BARRICADE_DPS := 14.0
const BARRICADE_RADIUS := 2.0

## Ladders are climbed rather than collided with: standing this close to one
## and pushing forward carries you up it.
const LADDER_REACH := 1.6
const LADDER_CLIMB_SPEED := 4.0

## What demolishing a piece hands back, as a fraction of everything that was
## spent upgrading it. Half, so tearing down and rebuilding elsewhere is a
## real option and never a free one.
const SALVAGE_FRACTION := 0.5
## A piece can only be taken down cleanly while it is still fresh — after
## this many seconds it has to be knocked down like anything else, so a
## raider can never salvage their way into someone's base.
const DEMOLISH_WINDOW := 600.0

## Items that are placed into the world instead of being held. `warmth`
## marks a heat source for the temperature system; `workbench` is the
## crafting tier the station grants while the player stands near it.
const DEPLOYABLES := {
	"campfire": {"warmth": 1.0, "workbench": 0},
	"furnace": {"warmth": 0.8, "workbench": 0},
	"workbench_t1": {"warmth": 0.0, "workbench": 1},
	"workbench_t2": {"warmth": 0.0, "workbench": 2},
	"research_table": {"warmth": 0.0, "workbench": 0},
	"storage_box": {"warmth": 0.0, "workbench": 0},
	"large_box": {"warmth": 0.0, "workbench": 0},
	"sleeping_bag": {"warmth": 0.15, "workbench": 0},
	# Recyclers. `efficiency` is the share of an item's build cost that comes
	# back out of it; the better machines want electricity for the privilege.
	"recycler": {"warmth": 0.0, "workbench": 0, "efficiency": 0.4},
	"advanced_recycler": {"warmth": 0.0, "workbench": 0, "efficiency": 0.6, "power": 6.0},
	"hitech_recycler": {"warmth": 0.0, "workbench": 1, "efficiency": 0.8, "power": 14.0},
}

## What a recycler gets back out of things the world hands you rather than
## things you built: components, trophies and offcuts have no recipe to read
## a refund off, so their breakdown is written down here. Per unit.
const RECYCLE_RAW := {
	"gear_comp": {"frag": 20, "scrap": 5},
	"pipe": {"frag": 15, "scrap": 3},
	"spring": {"frag": 18, "scrap": 4},
	"sewing": {"cloth": 8, "scrap": 2},
	"antlers": {"bone": 4, "scrap": 2},
	"tusks": {"bone": 3, "scrap": 2},
	"scales": {"resin": 1},
	"bone": {"scrap": 1},
}

const WARMTH_RADIUS := 8.0
const WORKBENCH_RADIUS := 6.0

# ==================== ELECTRICITY & DEFENCE ====================

## Everything that is deployed and then acts on its own.
##
## `output` is power produced, `power` is power drawn to run. A device with
## neither is mechanical: a bear trap does not care whether the base has
## electricity, which is exactly why it is the first defence anyone builds.
##
## `gate` marks a device that passes power on rather than consuming it — a
## switch or a sensor. Everything downstream of a closed gate is dark, which
## is what turns a pile of turrets into a system you can arm and disarm.
##
## `hold` is how long a trap pins whatever it catches; `chain` is how many
## targets an arc jumps between; `blast` is an explosion radius.
const DEVICES := {
	# --- Generation ---
	"generator": {"name": "Fuel Generator", "output": 40.0, "fuel": "lgf",
		"fuel_interval": 12.0, "size": Vector3(1.3, 1.0, 0.9)},
	"solar_panel": {"name": "Solar Panel", "output": 14.0, "solar": true,
		"size": Vector3(1.6, 0.2, 1.0)},
	"wind_turbine": {"name": "Wind Turbine", "output": 12.0, "wind": true,
		"size": Vector3(0.5, 4.0, 0.5)},
	"battery": {"name": "Battery", "capacity": 400.0, "rate": 24.0,
		"size": Vector3(0.9, 0.8, 0.7)},

	# --- Active defence ---
	"auto_turret": {"name": "Auto Turret", "power": 12.0, "damage": 16.0,
		"range": 30.0, "cooldown": 0.5, "ammo": "ammo_rifle",
		"size": Vector3(0.7, 1.3, 0.7)},
	"shotgun_trap": {"name": "Shotgun Trap", "power": 2.0, "damage": 55.0,
		"range": 4.5, "cooldown": 2.5, "ammo": "ammo_shotgun",
		"size": Vector3(0.4, 0.5, 0.5)},
	"flame_trap": {"name": "Flame Turret", "power": 3.0, "damage": 22.0,
		"range": 5.0, "cooldown": 0.4, "ammo": "lgf", "ammo_chance": 0.15,
		"size": Vector3(0.5, 0.7, 0.5)},
	"tesla_coil": {"name": "Tesla Coil", "power": 10.0, "damage": 18.0,
		"range": 6.5, "cooldown": 1.0, "chain": 3, "size": Vector3(0.5, 1.8, 0.5)},

	# --- Detection and control ---
	"alarm": {"name": "Alarm", "power": 1.0, "range": 20.0, "cooldown": 10.0,
		"size": Vector3(0.4, 0.4, 0.3)},
	"motion_sensor": {"name": "Motion Sensor", "power": 1.0, "range": 15.0,
		"gate": true, "size": Vector3(0.3, 0.3, 0.25)},
	"smart_switch": {"name": "Smart Switch", "gate": true, "manual": true,
		"size": Vector3(0.35, 0.45, 0.2)},
	# Tall enough to cover the arm as well as the body: a camera mounted on a
	# 30 cm box would hang above its own hitbox and could not be shot off.
	"camera": {"name": "CCTV Camera", "power": 2.0, "range": 45.0,
		"size": Vector3(0.3, 0.5, 0.5)},

	# --- Mechanical traps, no wiring needed ---
	"land_mine": {"name": "Land Mine", "damage": 130.0, "range": 2.0,
		"blast": 4.5, "single_use": true, "size": Vector3(0.4, 0.12, 0.4)},
	"bear_trap": {"name": "Bear Trap", "damage": 45.0, "range": 1.7,
		"hold": 5.0, "single_use": true, "size": Vector3(0.7, 0.2, 0.7)},
}

## How often the grid re-solves. Power is a state of the base, not something
## that has to be exact frame to frame.
const POWER_TICK := 1.0
## How far a wire will reach between two devices.
const WIRE_RANGE := 18.0
## Wind is a slow swell rather than a constant, so a turbine-only base has
## quiet spells a battery has to cover.
const WIND_PERIOD := 90.0
const WIND_FLOOR := 0.25

## What you can carry, in slots — the same 30 the inventory screen draws.
## Resources pile deep into one slot, but a tool or a weapon takes a slot to
## itself, so a full kit and a mining run compete for the same space. This
## is what gives a base, a storage box and a raid something to be about.
## Raised from 30 when the world learned to hand out resin, clay, sand,
## salt, hemp, four crops and a handful of animal parts: a working kit plus
## one node of everything came to 31 slots, so a normal gathering run ended
## with the player sorting their pockets instead of playing.
const INVENTORY_SLOTS := 36
## Sized against what the world actually gives: a tree is 48 wood and a
## wall costs 300, so a slot holding 250 is a couple of pieces' worth. Deep
## enough that a mining run is not interrupted every minute, shallow enough
## that carrying a spread of materials and a working kit at the same time
## fills you up — which is the moment a storage box starts to matter.
const STACK_BY_CATEGORY := {
	"resources": 250,
	"ammo": 200,
	"items": 100,
	"construction": 50,
	"medical": 20,
	"tools": 1,
	"weapons": 1,
	"attire": 1,
}
const STACK_DEFAULT := 100

## Items whose category is about where they sit in the crafting screen
## rather than how you carry them. Scrap is filed under "items" but you
## haul it by the thousand like any other raw material.
const STACK_OVERRIDES := {"scrap": 250}

## Slots each container holds. The large box has to hold more than a player
## does or there is no point emptying your pockets into one — which is the
## entire reason a base is somewhere you come back to.
const BOX_SLOTS := {"storage_box": 12, "large_box": 48}

const ITEMS := {
	"wood": {"name": "Wood", "category": "resources", "color": "8d6e63", "rarity": "common", "desc": "Harvested from trees. Used for base building and fuel."},
	"stone": {"name": "Stone", "category": "resources", "color": "b0bec5", "rarity": "common", "desc": "Raw stone for primitive tools and base stabilization."},
	"iron": {"name": "Metal Ore", "category": "resources", "color": "90a4ae", "rarity": "common", "desc": "Raw iron ore. Smelt this to get metal fragments."},
	"sulfur_ore": {"name": "Sulfur Ore", "category": "resources", "color": "fdd835", "rarity": "common", "desc": "Raw ore. Smelt it in a furnace to get usable sulfur."},
	"sulfur": {"name": "Sulfur", "category": "resources", "color": "fff176", "rarity": "common", "desc": "Refined from ore in a furnace. The base of gunpowder and every explosive."},
	"hqm": {"name": "High Quality Metal", "category": "resources", "color": "eceff1", "rarity": "elite", "desc": "Rare refined metal. Only found in monument crates, out in the radiation."},
	"arrow": {"name": "Arrow", "category": "ammo", "color": "a1887f", "rarity": "common", "recipe": {"wood": 25, "stone": 10, "feather": 2}, "desc": "Cheap ammunition for the hunting bow. Fletched, or it goes where it likes."},
	"ammo_pistol": {"name": "Pistol Ammo", "category": "ammo", "color": "c9a227", "rarity": "common", "recipe": {"gunpowder": 10, "frag": 5}, "workbench": 1, "desc": "Rounds for the semi-pistol."},
	"ammo_rifle": {"name": "Rifle Ammo", "category": "ammo", "color": "e0a52a", "rarity": "rare", "recipe": {"gunpowder": 15, "frag": 10}, "workbench": 2, "desc": "Rounds for the assault rifle."},
	"ammo_shotgun": {"name": "Handmade Shell", "category": "ammo", "color": "b5651d", "rarity": "common", "recipe": {"gunpowder": 12, "frag": 8}, "workbench": 1, "desc": "A pipe-full of scrap and powder. Devastating up close, useless at range."},
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
	"bow": {"name": "Hunting Bow", "category": "weapons", "color": "8d6e63", "rarity": "common", "recipe": {"wood": 200, "cloth": 50, "leather": 20, "sewing": 1}, "desc": "Silent and deadly. Fires arrows."},
	"pipe_shotgun": {"name": "Pipe Shotgun", "category": "weapons", "color": "8d6e63", "rarity": "common", "recipe": {"pipe": 2, "wood": 100, "frag": 75}, "workbench": 1, "desc": "A pipe, a stock and a lot of nerve. Eight pellets at once — get close."},
	"pistol": {"name": "Semi-Pistol", "category": "weapons", "color": "546e7a", "rarity": "rare", "recipe": {"iron": 150, "pipe": 1, "spring": 1}, "workbench": 1, "desc": "P250 clone. Fast firing sidearm."},
	"ak47": {"name": "Assault Rifle", "category": "weapons", "color": "6d4c41", "rarity": "elite", "recipe": {"hqm": 50, "wood": 200, "scrap": 50, "pipe": 1, "spring": 2}, "workbench": 2, "desc": "The king of Rust weapons. High recoil, high reward."},
	"furnace": {"name": "Furnace", "category": "items", "color": "ff7043", "rarity": "rare", "recipe": {"stone": 200, "wood": 100, "lgf": 10}, "desc": "Smelts ores into metal/sulfur using wood."},
	"campfire": {"name": "Campfire", "category": "items", "color": "ffab40", "rarity": "common", "recipe": {"wood": 100}, "desc": "Useful for light and cooking meat."},
	"sleeping_bag": {"name": "Sleeping Bag", "category": "items", "color": "6d4c41", "rarity": "common", "recipe": {"cloth": 30}, "desc": "Place one and you respawn at it instead of on the shore. The first thing to build after a shelter."},
	"building_plan": {"name": "Building Plan", "category": "tools", "color": "64b5f6", "rarity": "common", "recipe": {"wood": 20}, "desc": "Select building pieces to place."},
	"door": {"name": "Wood Door", "category": "construction", "color": "8d6e63", "rarity": "common", "recipe": {"wood": 300}, "desc": "Access point with minimal security."},
	"lock": {"name": "Key Lock", "category": "construction", "color": "546e7a", "rarity": "common", "recipe": {"iron": 100}, "desc": "Basic protection for your base."},
	"bandage": {"name": "Bandage", "category": "medical", "color": "e57373", "rarity": "common", "recipe": {"cloth": 2}, "desc": "Stops bleeding immediately."},
	"syringe": {"name": "Medical Syringe", "category": "medical", "color": "ef5350", "rarity": "rare", "recipe": {"iron": 20, "scrap": 5, "cloth": 10}, "desc": "Instant adrenaline-boosted recovery."},
	"wood_armour": {"name": "Wooden Chestplate", "category": "attire", "color": "8d6e63", "rarity": "common", "recipe": {"wood": 250, "leather": 15}, "desc": "Planks and straps. Soaks 12% of what hits you."},
	"road_vest": {"name": "Road Sign Vest", "category": "attire", "color": "b0bec5", "rarity": "rare", "recipe": {"frag": 150, "leather": 20, "sewing": 1}, "workbench": 1, "desc": "Bolted road signs. Soaks 25% and takes the edge off radiation."},
	"metal_facemask": {"name": "Metal Facemask", "category": "attire", "color": "90a4ae", "rarity": "rare", "recipe": {"frag": 200, "cloth": 20}, "workbench": 1, "desc": "Soaks 20% of incoming damage. Ugly, effective."},
	"hazmat": {"name": "Hazmat Suit", "category": "attire", "color": "fff176", "rarity": "elite", "recipe": {"cloth": 100, "leather": 30, "sewing": 2, "frag": 50}, "workbench": 1, "desc": "Keeps 75% of the radiation out. The only sane way to loot a monument."},
	"wooden_door": {"name": "Wooden Door", "category": "construction", "color": "5d4037", "rarity": "common", "recipe": {"wood": 300}, "desc": "Fits into doorways."},
	"codelock": {"name": "Code Lock", "category": "items", "color": "78909c", "rarity": "rare", "recipe": {"frag": 100}, "desc": "Secure your doors with a 4-digit code."},
	"keycard_lock": {"name": "Keycard Lock", "category": "items", "color": "4dd0e1", "rarity": "elite", "recipe": {"frag": 150, "gear_comp": 1, "glass": 5}, "workbench": 2, "desc": "Opens for a card and nothing else. No code to watch someone type in."},
	"keycard": {"name": "Keycard", "category": "items", "color": "26c6da", "rarity": "rare", "recipe": {"frag": 25, "glass": 2}, "workbench": 1, "desc": "Hand one to somebody you trust with the whole base. There is no half measure."},
	"wire_tool": {"name": "Wire Tool", "category": "tools", "color": "ef5350", "rarity": "common", "recipe": {"frag": 40, "rope": 2}, "workbench": 1, "desc": "Run a wire between two devices. Aim, press C, aim at the other, press C again."},
	"generator": {"name": "Fuel Generator", "category": "items", "color": "455a64", "rarity": "rare", "recipe": {"frag": 350, "gear_comp": 2, "pipe": 2}, "workbench": 1, "desc": "Forty units of power for a steady drink of low grade fuel. Loud, and it never stops being loud."},
	"solar_panel": {"name": "Solar Panel", "category": "items", "color": "1e88e5", "rarity": "rare", "recipe": {"frag": 200, "glass": 30, "gear_comp": 1}, "workbench": 1, "desc": "Free power while the sun is up, and nothing at all once it is down."},
	"wind_turbine": {"name": "Wind Turbine", "category": "items", "color": "cfd8dc", "rarity": "rare", "recipe": {"frag": 300, "gear_comp": 2, "spring": 1}, "workbench": 1, "desc": "Turns day and night, when the wind is in. Audible from a long way off."},
	"battery": {"name": "Battery", "category": "items", "color": "8d6e63", "rarity": "rare", "recipe": {"frag": 150, "scrap": 40, "glass": 10}, "workbench": 1, "desc": "Banks a surplus and pays it back through the night. What makes solar worth building."},
	"auto_turret": {"name": "Auto Turret", "category": "items", "color": "37474f", "rarity": "elite", "recipe": {"frag": 500, "gear_comp": 3, "spring": 2, "hqm": 20}, "workbench": 2, "desc": "Tracks and fires on its own, on rifle ammo and twelve units of power. The only thing that guards a base while you sleep."},
	"shotgun_trap": {"name": "Shotgun Trap", "category": "items", "color": "6d4c41", "rarity": "rare", "recipe": {"frag": 250, "pipe": 2, "spring": 1}, "workbench": 1, "desc": "One barrel covering one doorway. Whatever comes through takes all of it."},
	"flame_trap": {"name": "Flame Turret", "category": "items", "color": "e64a19", "rarity": "rare", "recipe": {"frag": 200, "pipe": 2, "lgf": 25}, "workbench": 1, "desc": "Fills a corridor with fire for as long as there is fuel in it."},
	"tesla_coil": {"name": "Tesla Coil", "category": "items", "color": "b3e5fc", "rarity": "elite", "recipe": {"hqm": 25, "frag": 300, "gear_comp": 2, "glass": 15}, "workbench": 2, "desc": "Arcs to everything in the room at once. Hungry, and worth it in a stairwell."},
	"alarm": {"name": "Alarm", "category": "items", "color": "e53935", "rarity": "common", "recipe": {"frag": 80, "gear_comp": 1}, "workbench": 1, "desc": "Tells you something is in the base. Knowing early is most of surviving it."},
	"motion_sensor": {"name": "Motion Sensor", "category": "items", "color": "9575cd", "rarity": "rare", "recipe": {"frag": 120, "gear_comp": 1, "glass": 5}, "workbench": 1, "desc": "Passes power on only while something is moving in front of it. Wire your turrets behind one."},
	"smart_switch": {"name": "Smart Switch", "category": "items", "color": "66bb6a", "rarity": "common", "recipe": {"frag": 60, "scrap": 10}, "workbench": 1, "desc": "Arms and disarms everything downstream of it. Interact to flip."},
	"camera": {"name": "CCTV Camera", "category": "items", "color": "263238", "rarity": "rare", "recipe": {"frag": 100, "glass": 10, "gear_comp": 1}, "workbench": 1, "desc": "Interact to see what it sees, at night as well as by day."},
	"land_mine": {"name": "Land Mine", "category": "items", "color": "5d4037", "rarity": "rare", "recipe": {"explosives": 4, "frag": 60, "spring": 1}, "workbench": 2, "desc": "Buried and forgotten until it is not. Goes off once."},
	"bear_trap": {"name": "Bear Trap", "category": "items", "color": "78909c", "rarity": "common", "recipe": {"frag": 150, "spring": 1}, "workbench": 1, "desc": "Jaws and a spring. Holds whatever steps in it long enough for you to arrive."},
	"oil": {"name": "Crude Oil", "category": "resources", "color": "37474f", "rarity": "rare", "desc": "Drilled from the ground. Refines into low grade fuel."},
	"charcoal": {"name": "Charcoal", "category": "resources", "color": "424242", "rarity": "common", "desc": "Left behind by a burning furnace. Feeds gunpowder."},
	"gunpowder": {"name": "Gun Powder", "category": "ammo", "color": "616161", "rarity": "common", "recipe": {"sulfur": 20, "charcoal": 30}, "workbench": 1, "desc": "Sulfur and charcoal. The base of every explosive."},
	"explosives": {"name": "Explosives", "category": "ammo", "color": "c9a227", "rarity": "elite", "recipe": {"gunpowder": 50, "lgf": 3, "sulfur": 10, "frag": 10}, "workbench": 2, "desc": "Unstable compound used in raiding charges."},
	"c4": {"name": "Timed Explosive Charge", "category": "weapons", "color": "c8a870", "rarity": "elite", "recipe": {"explosives": 20, "cloth": 5, "frag": 10}, "workbench": 2, "desc": "Sticks to a wall and levels it. The classic raid tool."},
	"grenade": {"name": "F1 Grenade", "category": "weapons", "color": "47522f", "rarity": "rare", "recipe": {"gunpowder": 30, "frag": 25}, "workbench": 1, "desc": "Thrown fragmentation charge. Mind the blast radius."},
	"rocket": {"name": "Rocket", "category": "ammo", "color": "b71c1c", "rarity": "elite", "recipe": {"explosives": 10, "pipe": 2, "frag": 100}, "workbench": 2, "desc": "Ammunition for the launcher. Detonates on impact."},
	"rocket_launcher": {"name": "Rocket Launcher", "category": "weapons", "color": "47522f", "rarity": "elite", "recipe": {"frag": 500, "pipe": 4, "gear_comp": 2}, "workbench": 2, "desc": "Fires rockets at fortifications from a safe distance."},
	"metal_hatchet": {"name": "Hatchet", "category": "tools", "color": "90a4ae", "rarity": "rare", "recipe": {"wood": 100, "frag": 125}, "workbench": 1, "desc": "Steel head. Fells trees far faster than stone."},
	"metal_pickaxe": {"name": "Pickaxe", "category": "tools", "color": "90a4ae", "rarity": "rare", "recipe": {"wood": 100, "frag": 125}, "workbench": 1, "desc": "Steel head. Breaks ore nodes far faster than stone."},
	"drill": {"name": "Mining Drill", "category": "tools", "color": "8d6e63", "rarity": "elite", "recipe": {"frag": 250, "gear_comp": 2, "hqm": 10}, "workbench": 2, "desc": "Motorised auger. Extracts crude oil and tears through ore."},
	"chainsaw": {"name": "Chainsaw", "category": "tools", "color": "ff7043", "rarity": "elite", "recipe": {"frag": 300, "gear_comp": 2, "spring": 1, "lgf": 20}, "workbench": 2, "desc": "Fells a tree in a handful of pulls. Burns fuel and can be heard across the valley."},
	"jackhammer": {"name": "Jackhammer", "category": "tools", "color": "90a4ae", "rarity": "elite", "recipe": {"frag": 350, "gear_comp": 3, "hqm": 5, "pipe": 2}, "workbench": 2, "desc": "Breaks stone and tears down structures far faster than a hammer."},
	"repair_tool": {"name": "Repair Tool", "category": "tools", "color": "4db6ac", "rarity": "rare", "recipe": {"frag": 100, "gear_comp": 1, "scrap": 20}, "workbench": 1, "desc": "Restores condition to a worn tool or a damaged wall, for a share of what it cost to make."},
	"binoculars": {"name": "Binoculars", "category": "tools", "color": "37474f", "rarity": "rare", "recipe": {"frag": 50, "scrap": 20, "sewing": 1}, "workbench": 1, "desc": "Hold to glass the treeline. Spots what is out there before it spots you."},
	"flashlight": {"name": "Flashlight", "category": "tools", "color": "fdd835", "rarity": "common", "recipe": {"frag": 40, "scrap": 10}, "workbench": 1, "desc": "A tight beam that does not give you away the way a torch does. Drains its cell as it burns."},
	"workbench_t1": {"name": "Workbench Level 1", "category": "items", "color": "a1887f", "rarity": "common", "recipe": {"wood": 500, "stone": 100, "frag": 50}, "desc": "Unlocks tier 1 crafting while you stand near it."},
	"workbench_t2": {"name": "Workbench Level 2", "category": "items", "color": "78909c", "rarity": "rare", "recipe": {"frag": 500, "scrap": 250, "wood": 500}, "workbench": 1, "desc": "Unlocks tier 2 crafting while you stand near it."},
	"research_table": {"name": "Research Table", "category": "items", "color": "8d6e63", "rarity": "common", "recipe": {"wood": 200, "frag": 75, "scrap": 50}, "desc": "Study components to progress your tech tree."},
	"recycler": {"name": "Recycler", "category": "items", "color": "78909c", "rarity": "common", "recipe": {"frag": 200, "brick": 20, "gear_comp": 1}, "desc": "Hand-cranked. Breaks anything you built back down into two fifths of what it cost."},
	"advanced_recycler": {"name": "Advanced Recycler", "category": "items", "color": "546e7a", "rarity": "rare", "recipe": {"frag": 400, "brick": 40, "gear_comp": 3, "spring": 1}, "workbench": 1, "desc": "Motorised, and it wants feeding — six units of power for three fifths back."},
	"hitech_recycler": {"name": "High-Tech Recycler", "category": "items", "color": "b0bec5", "rarity": "elite", "recipe": {"hqm": 30, "frag": 500, "gear_comp": 5, "glass": 20, "spring": 2}, "workbench": 2, "desc": "Four fifths back, and a workbench with it. Fourteen units of power is the price."},
	"storage_box": {"name": "Wood Storage Box", "category": "construction", "color": "8d6e63", "rarity": "common", "recipe": {"wood": 100}, "desc": "Small container. Interact to stash your resources."},
	"large_box": {"name": "Large Wood Box", "category": "construction", "color": "5d4037", "rarity": "common", "recipe": {"wood": 250, "frag": 20}, "workbench": 1, "desc": "Large container with more capacity."},
	"resin": {"name": "Tree Resin", "category": "resources", "color": "d98d2b", "rarity": "common", "desc": "Sap bled from a felled trunk. Burns hot and glues what nails will not hold."},
	"clay": {"name": "Clay", "category": "resources", "color": "a1725a", "rarity": "common", "desc": "Dug from a riverbank. Fires into brick."},
	"sand": {"name": "Sand", "category": "resources", "color": "e3d9a8", "rarity": "common", "desc": "Fires into glass. The reason a lakeshore is worth walking."},
	"dirt": {"name": "Dirt", "category": "resources", "color": "6d5844", "rarity": "common", "desc": "Fill. Mixed with clay it makes a brick that holds its shape."},
	"salt": {"name": "Salt", "category": "resources", "color": "eceff1", "rarity": "common", "desc": "Scraped from a dry flat. Keeps meat edible far longer than a fire does."},
	"glass": {"name": "Glass", "category": "resources", "color": "b3e5fc", "rarity": "rare", "desc": "Fired from sand. Lenses, panels and anything that has to see."},
	"brick": {"name": "Brick", "category": "resources", "color": "8d4a3a", "rarity": "common", "desc": "Fired clay and fill. Cheap mass for furnaces and machinery."},
	"hemp": {"name": "Hemp Fiber", "category": "resources", "color": "9ccc65", "rarity": "common", "desc": "Stripped from a hemp plant. Spun into cloth or laid into rope."},
	"rope": {"name": "Rope", "category": "items", "color": "c8a165", "rarity": "common", "recipe": {"hemp": 20}, "desc": "Laid hemp. Holds a bow, a trap and half the machinery in a base together."},
	"bone": {"name": "Bone", "category": "resources", "color": "e8e0d0", "rarity": "common", "desc": "Stripped from a big carcass. Blades, arrowheads and glue."},
	"feather": {"name": "Feather", "category": "resources", "color": "f5f5f5", "rarity": "common", "desc": "Fletching. An arrow without one goes where it likes."},
	"egg": {"name": "Egg", "category": "resources", "color": "fff8e1", "rarity": "common", "desc": "Laid by a chicken you did not have to kill. Eat it raw if you must."},
	"scales": {"name": "Fish Scales", "category": "resources", "color": "b0bec5", "rarity": "common", "desc": "Boils down into a glue the old bows were made with."},
	"antlers": {"name": "Antlers", "category": "resources", "color": "c8b28a", "rarity": "common", "desc": "Off a big buck. Grinds down into bone, and a recycler pays for the rest."},
	"tusks": {"name": "Boar Tusks", "category": "resources", "color": "efe4c9", "rarity": "common", "desc": "What the boar was trying to put through you. Worth taking off it."},
	"corn": {"name": "Corn", "category": "resources", "color": "fdd835", "rarity": "common", "desc": "Field corn. Filling, and it keeps."},
	"pumpkin": {"name": "Pumpkin", "category": "resources", "color": "fb8c00", "rarity": "common", "desc": "A meal on its own. Heavy to carry for what it gives."},
	"mushroom": {"name": "Mushroom", "category": "resources", "color": "bcaaa4", "rarity": "common", "desc": "Some of these are food. You find out which by eating one."},
	"herbs": {"name": "Herbs", "category": "resources", "color": "66bb6a", "rarity": "common", "desc": "Bitter leaves that close a wound faster than cloth alone."},
	"preserved_meat": {"name": "Salted Meat", "category": "resources", "color": "c49a6c", "rarity": "common", "recipe": {"cooked_meat": 1, "salt": 5}, "desc": "Salted down. Feeds you properly and does not turn."},
	"herbal_salve": {"name": "Herbal Salve", "category": "medical", "color": "81c784", "rarity": "common", "recipe": {"herbs": 8, "cloth": 4, "resin": 2}, "desc": "Crushed herbs bound in resin. Slower than a syringe, cheaper than everything."},
	"berries": {"name": "Berries", "category": "resources", "color": "e57399", "rarity": "common", "desc": "Wild berries. Eat to restore hunger."},
	"raw_meat": {"name": "Raw Meat", "category": "resources", "color": "ef9a9a", "rarity": "common", "desc": "Hunted meat. Cook it at a campfire before eating."},
	"cooked_meat": {"name": "Cooked Meat", "category": "resources", "color": "a1887f", "rarity": "common", "desc": "A proper meal. Restores a lot of hunger."},
	"raw_fish": {"name": "Raw Fish", "category": "resources", "color": "90a4ae", "rarity": "common", "desc": "Pulled from the shallows. Cook it unless you enjoy being ill."},
	"cooked_fish": {"name": "Cooked Fish", "category": "resources", "color": "d7a86e", "rarity": "common", "desc": "The lake's answer to hunting. Quieter, and nothing bites back."},
}

## Items that can be consumed with LMB while equipped in the belt.
## `poison` is the chance a bite turns on you. Only the mushroom carries it:
## foraging is the cheapest food in the game and this is what it costs.
const CONSUMABLES := {
	"berries": {"hunger": 25.0},
	"raw_meat": {"hunger": 5.0, "health": -5.0},
	"cooked_meat": {"hunger": 40.0, "health": 5.0},
	"preserved_meat": {"hunger": 55.0, "health": 8.0},
	"corn": {"hunger": 30.0},
	"pumpkin": {"hunger": 45.0},
	"mushroom": {"hunger": 15.0, "health": 5.0, "poison": 0.35},
	"egg": {"hunger": 12.0},
	"raw_fish": {"hunger": 8.0, "health": -3.0},
	"cooked_fish": {"hunger": 35.0, "health": 4.0},
	"bandage": {"health": 15.0},
	"herbal_salve": {"health": 28.0},
	"syringe": {"health": 50.0},
}

## What a bad mushroom does: hunger back out and a real bite of health.
const POISON_DAMAGE := 22.0
const POISON_HUNGER := 15.0

const CATEGORIES := ["common", "construction", "items", "resources", "tools", "medical", "weapons", "attire"]

# ==================== STANCE ====================

## How the player is carrying themselves. One of these at a time and never
## two, which is what keeps crouch, prone and swimming from fighting each
## other over the collision shape.
##
## `speed` scales movement, `height` is the collision capsule, `eye` is where
## the camera sits inside it, and `fov` shifts the field of view: hunkering
## down narrows what you can see, which is the cost of the smaller target.
## `spread` scales weapon inaccuracy — lying down is how you hit anything at
## range, and it is the reason to accept being unable to move.
const STANCE_STAND := "stand"
const STANCE_CROUCH := "crouch"
const STANCE_PRONE := "prone"
const STANCE_SWIM := "swim"

const STANCES := {
	"stand":  {"name": "Standing", "speed": 1.0, "height": 1.8, "eye": 1.6,
		"fov": 0.0, "spread": 1.0, "noise": 1.0},
	"crouch": {"name": "Crouched", "speed": 0.45, "height": 1.1, "eye": 0.95,
		"fov": -4.0, "spread": 0.6, "noise": 0.35},
	# 0.9 rather than lower because the body is a capsule and a capsule can
	# never be shorter than twice its radius — asking for 0.5 got silently
	# clamped to 0.8 while the rest of the maths still believed 0.5, which put
	# the collision shape and its own centre out of step.
	"prone":  {"name": "Prone", "speed": 0.18, "height": 0.9, "eye": 0.45,
		"fov": -7.0, "spread": 0.3, "noise": 0.1},
	"swim":   {"name": "Swimming", "speed": 0.55, "height": 1.2, "eye": 1.0,
		"fov": 0.0, "spread": 1.6, "noise": 1.2},
}

## Seconds a stance change takes, so the camera rises and drops rather than
## teleporting between eye heights.
const STANCE_BLEND_TIME := 0.18


func stance_data(stance: String) -> Dictionary:
	return STANCES.get(stance, STANCES[STANCE_STAND])


# ==================== CONTROL & CAMERA SETTINGS ====================

## Everything a player can tune about how the game reads their input, with
## the range each value is held inside. A phone is held differently by every
## pair of hands, so none of these are constants — they are saved with the
## game and clamped on the way in, because a settings file that has been
## edited by hand must not be able to produce an unplayable camera.
##
## `damping` is how much of the gap to the target the camera closes each
## frame: low is heavy and smooth, high is immediate. `tap_tolerance` is how
## long a touch may last and still count as a tap rather than a hold.
const SETTINGS_RANGE := {
	"look_sensitivity": [0.1, 2.0],
	"camera_damping": [0.1, 1.0],
	"shake_intensity": [0.0, 2.0],
	"gyro_sensitivity": [0.1, 2.0],
	"gyro_dead_zone": [0.0, 0.2],
	"fov": [70.0, 110.0],
	"tap_tolerance": [0.05, 0.2],
	"haptic_strength": [0.0, 1.0],
	"button_scale": [0.7, 1.6],
}

const SETTINGS_DEFAULTS := {
	"look_sensitivity": 1.0,
	"camera_damping": 0.45,
	"camera_acceleration": true,
	"shake_intensity": 1.0,
	"invert_look_y": false,
	# Gyroscope is off by default: most players never want it, and the ones
	# who do want it only while aiming.
	"gyro_enabled": false,
	"gyro_only": false,
	"gyro_sensitivity": 1.0,
	"gyro_dead_zone": 0.02,
	"fov": 75.0,
	"tap_tolerance": 0.12,
	"haptics": true,
	"haptic_strength": 0.6,
	# Accessibility: hold-to-crouch is the default because it is what a
	# shooter player expects, but holding a thumb down for a whole firefight
	# is exactly what some hands cannot do.
	"toggle_stance": false,
	"button_scale": 1.0,
}

## Seconds the field of view takes to reach a new value. Long enough to read
## as a movement rather than a jump cut, short enough not to fight the player.
const FOV_BLEND_TIME := 0.3

var settings: Dictionary = SETTINGS_DEFAULTS.duplicate(true)

signal settings_changed


func setting(key: String) -> Variant:
	return settings.get(key, SETTINGS_DEFAULTS.get(key))


## Writes a setting, holding numbers inside their declared range. Anything
## with no range is stored as given — the booleans.
func set_setting(key: String, value: Variant) -> void:
	if not SETTINGS_DEFAULTS.has(key):
		return
	if SETTINGS_RANGE.has(key):
		var span: Array = SETTINGS_RANGE[key]
		value = clampf(float(value), float(span[0]), float(span[1]))
	settings[key] = value
	settings_changed.emit()


func reset_settings() -> void:
	settings = SETTINGS_DEFAULTS.duplicate(true)
	settings_changed.emit()


## Loads a saved settings block, dropping keys that no longer exist and
## clamping the ones that do.
func load_settings(saved: Dictionary) -> void:
	settings = SETTINGS_DEFAULTS.duplicate(true)
	for key in saved:
		if SETTINGS_DEFAULTS.has(key):
			set_setting(str(key), saved[key])


## One short buzz, at the strength the player asked for. Silent on desktop,
## and silent when they have turned it off.
func haptic(scale: float = 1.0) -> void:
	if not bool(setting("haptics")) or not touch_ui:
		return
	var strength := float(setting("haptic_strength")) * scale
	if strength <= 0.0:
		return
	Input.vibrate_handheld(int(clampf(strength, 0.0, 1.0) * 40.0) + 10)


## Quick-slot count. Ten, because a survival kit is a weapon, a tool for wood,
## one for stone, a building plan, a hammer, food, meds, a torch and two spare
## — six was always one row short of what the game asks you to carry.
const BELT_SLOTS := 10


## A fresh belt: the opening kit in the first two slots, the rest empty.
static func empty_belt() -> Array:
	var out: Array = ["building_plan", "hammer"]
	while out.size() < BELT_SLOTS:
		out.append(null)
	return out


var inventory: Dictionary = {}
var belt: Array = empty_belt()
var selected_belt_slot: int = 0
## What is being worn, keyed by ARMOUR slot ("head" / "chest" / "suit").
var worn: Dictionary = {}
## Uses left on the tool of each id you are currently holding. Absent means
## "untouched", which counts as full — so a freshly crafted tool needs no
## bookkeeping until the first time it is swung.
var tool_wear: Dictionary = {}
var stats: Dictionary = {
	"health": 100.0, "hunger": 100.0, "thirst": 100.0,
	"temperature": 100.0, "radiation": 0.0, "oxygen": 100.0,
}
## Earned, not bought: off until the game says otherwise, which is what the
## spec's "if unlocked" means in practice.
var double_jump_unlocked := false
## Highest workbench tier the player is currently standing next to.
var workbench_level: int = 0
var day_time: float = 300.0
var tool_cupboards: Array = []  # Array of Vector2 (x, z)
var selected_blueprint: String = ""
var blueprint_rotation: float = 0.0
var ui_open: String = "start"


func _ready() -> void:
	reset_state()


## Strips the player back to the opening kit without touching the world or
## the clock. Death uses this after the bag has taken the real loadout.
func reset_loadout() -> void:
	inventory = {"building_plan": 1, "hammer": 1}
	belt = empty_belt()
	selected_belt_slot = 0
	worn = {}
	tool_wear = {}
	selected_blueprint = ""
	inventory_changed.emit()
	belt_changed.emit()


func reset_state() -> void:
	# A real survival opening: the plan and the hammer so building is
	# always possible, and nothing else. Everything past that is earned.
	inventory = {"building_plan": 1, "hammer": 1}
	belt = empty_belt()
	selected_belt_slot = 0
	worn = {}
	tool_wear = {}
	stats = {
		"health": 100.0, "hunger": 100.0, "thirst": 100.0,
		"temperature": 100.0, "radiation": 0.0, "oxygen": 100.0,
	}
	workbench_level = 0
	day_time = 300.0
	tool_cupboards = []
	selected_blueprint = ""
	blueprint_rotation = 0.0


func get_count(id: String) -> int:
	return int(inventory.get(id, 0))


# ==================== ARMOUR ====================

## Puts an armour piece on, swapping out whatever held that slot. The piece
## stays in the inventory while worn — it is equipment, not a consumable.
func wear(id: String) -> bool:
	if not ARMOUR.has(id) or get_count(id) <= 0:
		return false
	var slot := str(ARMOUR[id].slot)
	if worn.get(slot, "") == id:
		worn.erase(slot)          # clicking what you are wearing takes it off
	else:
		worn[slot] = id
	inventory_changed.emit()
	return true


func is_worn(id: String) -> bool:
	return worn.values().has(id)


## Damage soaked by everything worn, capped so no stack makes you immune.
func armour_protection() -> float:
	var total := 0.0
	for slot in worn:
		total += float(ARMOUR[worn[slot]].protect)
	return minf(total, ARMOUR_CAP)


func radiation_protection() -> float:
	var total := 0.0
	for slot in worn:
		total += float(ARMOUR[worn[slot]].rads)
	return minf(total, 0.95)


## The one way anything hostile takes health off the player: a guard's
## rifle, a wolf's teeth, a blast. Starvation, thirst, cold and radiation
## bypass it deliberately — armour is not a diet.
func hurt(amount: float) -> float:
	var applied := amount * (1.0 - armour_protection())
	stats.health -= applied
	return applied


# ==================== DURABILITY ====================

func has_durability(id: String) -> bool:
	return TOOL_DURABILITY.has(id)


func max_durability(id: String) -> int:
	return int(TOOL_DURABILITY.get(id, 0))


## Uses left on the one you are holding. Anything with no durability at all
## reports 0 — callers should ask `has_durability` first.
func durability(id: String) -> int:
	if not has_durability(id):
		return 0
	return int(tool_wear.get(id, max_durability(id)))


## 0..1, for the HUD bar and for the worn-tool penalty.
func durability_fraction(id: String) -> float:
	if not has_durability(id):
		return 1.0
	return clampf(float(durability(id)) / float(max_durability(id)), 0.0, 1.0)


## How effective this tool is right now. A tool near the end of its life
## still swings, it just stops being worth swinging.
func condition_multiplier(id: String) -> float:
	if not has_durability(id):
		return 1.0
	return WORN_PENALTY if durability_fraction(id) < WORN_THRESHOLD else 1.0


## Spends one use (or `amount`). Returns false when the tool broke on this
## use — the caller has already had its effect, the next swing is the one
## that finds an empty hand.
##
## Fuelled tools also burn low grade fuel; running dry stops them dead
## without costing durability, so a chainsaw with no fuel is idle, not lost.
func wear_tool(id: String, amount: int = 1) -> bool:
	if not has_durability(id) or get_count(id) <= 0:
		return true
	var left := durability(id) - amount
	if left > 0:
		tool_wear[id] = left
		inventory_changed.emit()
		return true

	# It gave out. One of them is gone; if you carry a spare, that spare is
	# now the one in your hand, at full condition.
	remove_item(id, 1)
	tool_wear.erase(id)
	var label := str(ITEMS.get(id, {}).get("name", id))
	if get_count(id) > 0:
		notify("%s broke — switching to your spare" % label, Color(1.0, 0.63, 0.0))
	else:
		notify("%s broke" % label, Color(0.9, 0.3, 0.3))
		for i in belt.size():
			if belt[i] == id:
				belt[i] = null
		belt_changed.emit()
	_sfx("hit")
	return false


## True when the tool has the fuel this use needs, spending it if so.
func spend_tool_fuel(id: String) -> bool:
	if not TOOL_FUEL.has(id):
		return true
	var per := float(TOOL_FUEL[id])
	# Fuel is whole units, so the cost is paid probabilistically: a 0.2/use
	# tool burns one low grade fuel every five swings on average rather than
	# needing fractional stacks the inventory cannot represent.
	if randf() >= per:
		return true
	if get_count("lgf") <= 0:
		notify("%s is out of fuel" % ITEMS.get(id, {}).get("name", id), Color(1.0, 0.63, 0.0))
		return false
	remove_item("lgf", 1)
	return true


## Puts condition back into a tool. `fraction` is how much of the full bar
## one repair restores; the materials come out of the item's own recipe.
## Returns false when there is nothing to repair or nothing to repair it with.
func repair_tool_item(id: String, fraction: float = 0.25) -> bool:
	if not has_durability(id) or get_count(id) <= 0:
		return false
	if durability(id) >= max_durability(id):
		notify("%s is in perfect condition" % ITEMS.get(id, {}).get("name", id),
			Color(1.0, 0.63, 0.0))
		return false
	var recipe: Dictionary = ITEMS.get(id, {}).get("recipe", {})
	var cost := {}
	for res in recipe:
		var units := ceili(float(recipe[res]) * REPAIR_COST_FRACTION * (fraction / 0.25))
		if units > 0:
			cost[res] = units
	if not can_afford(cost):
		notify("Not enough materials to repair", Color(0.9, 0.3, 0.3))
		return false
	consume(cost)
	tool_wear[id] = mini(max_durability(id),
		durability(id) + ceili(float(max_durability(id)) * fraction))
	notify("Repaired %s" % ITEMS.get(id, {}).get("name", id))
	_sfx("upgrade")
	inventory_changed.emit()
	return true


# ==================== CAPACITY ====================

func stack_size(id: String) -> int:
	if STACK_OVERRIDES.has(id):
		return int(STACK_OVERRIDES[id])
	var cat := str(ITEMS.get(id, {}).get("category", "items"))
	return int(STACK_BY_CATEGORY.get(cat, STACK_DEFAULT))


func slots_used_by(id: String, count: int) -> int:
	if count <= 0:
		return 0
	return ceili(float(count) / float(stack_size(id)))


## How many slots a set of contents occupies. Shared by the inventory,
## storage boxes and death bags so they all count space the same way.
func slots_for(contents: Dictionary) -> int:
	var n := 0
	for id in contents:
		n += slots_used_by(id, int(contents[id]))
	return n


## How much more of `id` will fit: the room left in the part-filled stack
## plus whole stacks for every free slot.
func room_in(contents: Dictionary, limit: int, id: String) -> int:
	var stack := stack_size(id)
	var have := int(contents.get(id, 0))
	var open := (stack - (have % stack)) % stack
	return open + maxi(0, limit - slots_for(contents)) * stack


func slots_used() -> int:
	return slots_for(inventory)


func room_for(id: String) -> int:
	return room_in(inventory, INVENTORY_SLOTS, id)


## Takes in what fits and returns how much that was. Anything turned away
## is the caller's problem to leave where it came from — never dropped
## quietly, or a full inventory would eat a monument crate.
func add_item(id: String, count: int) -> int:
	if count <= 0:
		return 0
	var accepted := mini(count, room_for(id))
	if accepted > 0:
		# Picking one up with none in hand means the next swing is with a
		# fresh one, so whatever the last one had left dies with it.
		if get_count(id) <= 0 and has_durability(id):
			tool_wear.erase(id)
		inventory[id] = get_count(id) + accepted
		inventory_changed.emit()
	if accepted < count:
		notify("Pockets full — %d %s left behind"
			% [count - accepted, ITEMS.get(id, {}).get("name", id)],
			Color(1.0, 0.63, 0.0))
	return accepted


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


# ==================== WEAPONS: MAGAZINES & FIRE MODES ====================

## Rounds sitting in the weapon itself, keyed by weapon id. Absent means the
## magazine has never been touched, which counts as full — a weapon you just
## crafted comes loaded, because making the player reload it before the first
## shot teaches them nothing.
var loaded: Dictionary = {}
## Which entry of the weapon's `modes` list is selected, keyed by weapon id.
var fire_modes: Dictionary = {}
## Which magnification of its `scope` list a weapon is set to.
var scope_levels: Dictionary = {}


func magazine_size(id: String) -> int:
	return int(WEAPONS.get(id, {}).get("mag", 0))


## True for anything that has a magazine at all — the guns and the bow, not
## the spear.
func is_ranged(id: String) -> bool:
	return WEAPONS.has(id) and str(WEAPONS[id].get("ammo", "")) != ""


func rounds_loaded(id: String) -> int:
	if not is_ranged(id):
		return 0
	return int(loaded.get(id, magazine_size(id)))


## Spends one round. Returns false when the magazine is empty, which is the
## caller's cue to tell the player to reload rather than to fire.
func spend_round(id: String) -> bool:
	var left := rounds_loaded(id)
	if left <= 0:
		return false
	loaded[id] = left - 1
	inventory_changed.emit()
	return true


## Tops the magazine up from your pockets. Returns how many rounds went in, so
## zero means there was either nothing to load or nowhere to put it.
func reload_weapon(id: String) -> int:
	if not is_ranged(id):
		return 0
	var ammo := str(WEAPONS[id].ammo)
	var room := magazine_size(id) - rounds_loaded(id)
	if room <= 0:
		notify("%s is already loaded" % ITEMS.get(id, {}).get("name", id),
			Color(1.0, 0.63, 0.0))
		return 0
	var have := get_count(ammo)
	if have <= 0:
		notify("Out of %s" % ITEMS.get(ammo, {}).get("name", ammo), Color(0.9, 0.3, 0.3))
		return 0
	var moved: int = mini(room, have)
	remove_item(ammo, moved)
	loaded[id] = rounds_loaded(id) + moved
	notify("Reloaded — %d/%d" % [rounds_loaded(id), magazine_size(id)])
	_sfx("door")
	return moved


func fire_mode_list(id: String) -> Array:
	var modes = WEAPONS.get(id, {}).get("modes", [])
	return modes if modes is Array and not modes.is_empty() else ["semi"]


func fire_mode(id: String) -> String:
	var modes := fire_mode_list(id)
	var idx: int = int(fire_modes.get(id, 0)) % modes.size()
	return str(modes[idx])


## Steps to the next fire mode this weapon supports. Returns the new one, or
## an empty string when the weapon has only one and there is nothing to cycle.
func cycle_fire_mode(id: String) -> String:
	var modes := fire_mode_list(id)
	if modes.size() < 2:
		notify("%s has one fire mode" % ITEMS.get(id, {}).get("name", id),
			Color(1.0, 0.63, 0.0))
		return ""
	fire_modes[id] = (int(fire_modes.get(id, 0)) + 1) % modes.size()
	var now := fire_mode(id)
	notify("Fire mode: %s" % now.to_upper(), Color(0.85, 0.85, 0.4))
	_sfx("upgrade")
	return now


func scope_list(id: String) -> Array:
	var levels = WEAPONS.get(id, {}).get("scope", [])
	return levels if levels is Array else []


func scope_zoom(id: String) -> float:
	var levels := scope_list(id)
	if levels.is_empty():
		return 1.0
	var idx: int = int(scope_levels.get(id, 0)) % levels.size()
	return float(levels[idx])


## Steps the sight to its next magnification. Swiping the scope button runs
## this; a weapon with no scope says so rather than silently doing nothing.
func cycle_scope(id: String) -> float:
	var levels := scope_list(id)
	if levels.size() < 2:
		notify("No adjustable sight on that", Color(1.0, 0.63, 0.0))
		return 1.0
	scope_levels[id] = (int(scope_levels.get(id, 0)) + 1) % levels.size()
	var zoom := scope_zoom(id)
	notify("Sight: %.1fx" % zoom, Color(0.7, 0.85, 1.0))
	return zoom


## How wide this weapon shoots right now: its own sway, tightened by the
## stance, by aiming and by a held breath. This is the number that makes lying
## down and holding still worth the vulnerability.
func weapon_spread(id: String, stance: String, aiming: bool, breath: bool) -> float:
	var sway := float(WEAPONS.get(id, {}).get("sway", 0.0))
	if sway <= 0.0:
		return 0.0
	sway *= float(stance_data(stance).spread)
	if aiming:
		sway *= ADS_SPREAD_SCALE
	if breath:
		sway *= BREATH_SPREAD_SCALE
	return sway


## A readable line about what you are holding, for the inspect button.
func weapon_summary(id: String) -> String:
	var item: Dictionary = ITEMS.get(id, {})
	var parts := [str(item.get("name", id))]
	if WEAPONS.has(id):
		var w: Dictionary = WEAPONS[id]
		parts.append("%.0f dmg" % float(w.damage))
		parts.append("%.0fm" % float(w.range))
		if is_ranged(id):
			parts.append("%d/%d" % [rounds_loaded(id), magazine_size(id)])
			parts.append(fire_mode(id).to_upper())
			if scope_list(id).size() > 1:
				parts.append("%.1fx" % scope_zoom(id))
	if has_durability(id):
		parts.append("cond %d%%" % roundi(durability_fraction(id) * 100.0))
	return " · ".join(parts)


# ==================== RECYCLING ====================

## Can this be broken back down at all? Anything you built can be, plus the
## odds and ends the world hands out with no recipe behind them. Raw
## materials cannot — there is nothing left to take apart.
func is_recyclable(id: String) -> bool:
	return ITEMS.get(id, {}).has("recipe") or RECYCLE_RAW.has(id)


## What one unit of `id` gives back at this machine's efficiency. A crafted
## item refunds a share of its own recipe, so the table never has to be kept
## in step with the crafting one by hand.
func recycle_yield(id: String, efficiency: float) -> Dictionary:
	var source: Dictionary = ITEMS.get(id, {}).get("recipe", RECYCLE_RAW.get(id, {}))
	var out := {}
	for res in source:
		var units := floori(float(source[res]) * efficiency)
		if units > 0:
			out[res] = units
	return out


## Workbench tier an item needs before it can be crafted (0 = anywhere).
func required_workbench(id: String) -> int:
	return int(ITEMS.get(id, {}).get("workbench", 0))


func craft(id: String, qty: int) -> bool:
	var item: Dictionary = ITEMS.get(id, {})
	if not item.has("recipe"):
		return false
	var bench := required_workbench(id)
	if bench > workbench_level:
		notify("Requires Workbench Level %d" % bench, Color(0.9, 0.3, 0.3))
		return false
	var total := {}
	for res in item.recipe:
		total[res] = int(item.recipe[res]) * qty
	if not can_afford(total):
		notify("Not enough resources", Color(0.9, 0.3, 0.3))
		return false
	# Check the shelf before spending the materials, or a full inventory
	# eats the cost and hands back nothing.
	if room_for(id) < qty:
		notify("No room for %s — free up a slot first" % item.name, Color(1.0, 0.63, 0.0))
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

	# Foraged food is free and sometimes it is free for a reason.
	if randf() < float(c.get("poison", 0.0)):
		stats.health = maxf(1.0, stats.health - POISON_DAMAGE)
		stats.hunger = maxf(0.0, stats.hunger - POISON_HUNGER)
		notify("That one was poisonous", Color(0.6, 0.85, 0.3))
		_sfx("hit")
		if get_count(id) <= 0:
			for i in belt.size():
				if belt[i] == id:
					belt[i] = null
			belt_changed.emit()
		return true

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


## True on phones/tablets, or when the on-screen controls are forced on for
## testing. Capturing the mouse makes no sense in either case.
var touch_ui := false


func detect_touch_ui() -> void:
	touch_ui = DisplayServer.is_touchscreen_available() or OS.has_feature("mobile")


func set_ui(name_: String) -> void:
	ui_open = name_
	if name_ == "" and not touch_ui:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	else:
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE


func has_building_privilege(pos: Vector3) -> bool:
	for tc in tool_cupboards:
		if Vector2(pos.x, pos.z).distance_to(tc) < TC_RADIUS:
			return true
	return false
