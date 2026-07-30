extends Node3D
## Main world: procedural terrain (FBM noise + vertex colors), water lakes,
## dense grass layer, resource scatter, monuments/radiation zones, NPC
## spawning, day/night cycle with sun+moon, respawn queue, autosave and
## save/load. Port + expansion of the Three.js engine body.

const ResourceNodeScript := preload("res://scripts/resource_node.gd")
const NpcScript := preload("res://scripts/npc.gd")
const PlayerScript := preload("res://scripts/player.gd")
const StructureScript := preload("res://scripts/structure.gd")
const StationScript := preload("res://scripts/station.gd")
const ExplosiveScript := preload("res://scripts/explosive.gd")
const BuildingSystemScript := preload("res://scripts/building_system.gd")
const HudScript := preload("res://scripts/hud.gd")
const LootBagScript := preload("res://scripts/loot_bag.gd")
const DeviceScript := preload("res://scripts/device.gd")
const PowerGridScript := preload("res://scripts/power_grid.gd")

const SAVE_PATH := "user://rust_save.json"
const TREE_COUNT := 70
const ROCK_COUNT := 40
const SULFUR_COUNT := 25
const BARREL_COUNT := 30
const BUSH_COUNT := 25
const WOLFBEAR_COUNT := 5
const DEER_COUNT := 6
const BOAR_COUNT := 4
const RABBIT_COUNT := 8
const CHICKEN_COUNT := 6
const HEMP_COUNT := 30
const CORN_COUNT := 12
const PUMPKIN_COUNT := 8
const MUSHROOM_COUNT := 18
const HERB_COUNT := 16
const CLAY_COUNT := 14
const SAND_COUNT := 14
const SALT_COUNT := 8
const FISH_COUNT := 18
const RESPAWN_DELAY := 30.0

## Over-harvesting. Every tree felled and every animal shot adds a point of
## pressure against that type; the point bleeds off on its own. While the
## reading is high, everything of that type comes back slower — so stripping
## one valley bare pushes you into the next one rather than letting you farm
## the same clearing forever.
const PRESSURE_PER_TAKE := 1.0
const PRESSURE_DECAY := 0.03      # points per second
const PRESSURE_CAP := 8.0
## Extra seconds of respawn delay per point of pressure.
const RESPAWN_PER_PRESSURE := 14.0
const NPC_RESPAWN_PER_PRESSURE := 45.0
const GUARDS_PER_MONUMENT := 3
const GUARD_POST_RADIUS := 9.0
const NPC_RESPAWN_DELAY := 180.0
const TERRAIN_SEGMENTS := 120
const WATER_LEVEL := -2.0
const GRASS_COUNT := 2500

# How much of a blast reaches creatures and the thrower themselves
const NPC_BLAST_SCALE := 0.35
const PLAYER_BLAST_SCALE := 0.12

# Temperature model
const FREEZING_POINT := 20.0
const NIGHT_CHILL := 85.0
const WATER_CHILL := 35.0
const WARMTH_RATE := 5.0

const WATER_SHADER := "
shader_type spatial;
render_mode cull_disabled;
uniform vec4 water_color : source_color = vec4(0.08, 0.32, 0.45, 0.72);
void vertex() {
	VERTEX.y += sin(TIME * 1.2 + VERTEX.x * 0.35) * 0.08
		+ cos(TIME * 0.9 + VERTEX.z * 0.3) * 0.08;
}
void fragment() {
	ALBEDO = water_color.rgb;
	ALPHA = water_color.a;
	ROUGHNESS = 0.12;
	SPECULAR = 0.6;
	NORMAL_MAP = vec3(
		0.5 + 0.08 * sin(TIME * 1.1 + UV.x * 90.0),
		0.5 + 0.08 * cos(TIME * 1.4 + UV.y * 90.0),
		1.0);
}
"

var sun: DirectionalLight3D
var moon: DirectionalLight3D
var env: Environment
var player: CharacterBody3D
var building: Node3D
var hud: CanvasLayer
var started := false

var rad_zones: Array = []       # Array of Vector2 (x, z)
var structures: Array = []      # placed structure nodes
## Barricades, kept apart from the rest so every creature does not have to
## walk the whole structure list every frame looking for one.
var barricades: Array = []
var stations: Array = []        # placed campfire/furnace nodes
var devices: Array = []         # placed generators, turrets, traps, sensors
var power: Node                 # the electrical grid solver
var respawn_queue: Array = []   # {type, pos, at}
## type -> how hard it has been harvested lately. See PRESSURE_PER_TAKE.
var pressure: Dictionary = {}
var npc_respawn_queue: Array = []  # {type, pos, at} — monument guards
var bags: Array = []            # loot bags left where the player died
var _stability_pass := false    # guards against re-entering the sweep
var clock := 0.0
var _sun_elevation := 1.0   # sin of the sun angle; drives night-time cold
var _respawn_timer := 0.0
var _autosave_timer := 0.0
var _decay_timer := 0.0


func _ready() -> void:
	randomize()
	_setup_environment()
	_build_terrain()
	_build_water()
	_build_grass()
	_scatter_resources()
	_create_monument(40.0, -40.0)
	_create_monument(-60.0, 50.0)
	_create_player()
	_spawn_npcs()

	building = BuildingSystemScript.new()
	building.name = "BuildingSystem"
	add_child(building)
	building.world = self
	building.player = player

	power = PowerGridScript.new()
	power.name = "PowerGrid"
	add_child(power)
	power.world = self

	hud = HudScript.new()
	hud.name = "HUD"
	add_child(hud)
	hud.world = self
	hud.map_ui.world = self
	player.hud = hud
	hud.touch_controls.player = player

	load_game()
	hud.show_start_screen()


# ==================== TERRAIN ====================

static func _hash2(xi: int, zi: int) -> float:
	var h: int = (xi * 374761393 + zi * 668265263) & 0xFFFFFFFF
	h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
	h = h ^ (h >> 16)
	return float(h) / 4294967295.0 * 2.0 - 1.0


static func _smooth_noise(x: float, z: float) -> float:
	var ix := floori(x)
	var iz := floori(z)
	var fx := x - float(ix)
	var fz := z - float(iz)
	var sx := fx * fx * (3.0 - 2.0 * fx)
	var sz := fz * fz * (3.0 - 2.0 * fz)
	var v00 := _hash2(ix, iz)
	var v10 := _hash2(ix + 1, iz)
	var v01 := _hash2(ix, iz + 1)
	var v11 := _hash2(ix + 1, iz + 1)
	var v0 := v00 + (v10 - v00) * sx
	var v1 := v01 + (v11 - v01) * sx
	return v0 + (v1 - v0) * sz


static func _fbm(x: float, z: float, octaves: int) -> float:
	var value := 0.0
	var amplitude := 1.0
	var frequency := 1.0
	var max_val := 0.0
	for i in octaves:
		value += amplitude * _smooth_noise(x * frequency, z * frequency)
		max_val += amplitude
		amplitude *= 0.5
		frequency *= 2.0
	return value / max_val


static func terrain_height(x: float, z: float) -> float:
	var h1 := _fbm(x * 0.015, z * 0.015, 4) * 8.0
	var h2 := _fbm(x * 0.04, z * 0.04, 3) * 3.0
	var h3 := sin(x * 0.02) * cos(z * 0.025) * 1.5
	var base := h1 + h2 + h3
	# Flatten near origin (spawn area)
	var dist := sqrt(x * x + z * z)
	var blend := minf(1.0, dist / 15.0)
	return base * maxf(0.0, blend * blend * (3.0 - 2.0 * blend))


static func _terrain_color(y: float) -> Color:
	if y < WATER_LEVEL + 0.6:
		# Sandy lake shore / bed
		return Color(0.76, 0.7, 0.5)
	elif y < 0.5:
		var norm_y := (y + 4.0) / 16.0
		return Color(0.6, 0.5 + norm_y * 0.2, 0.2)
	elif y < 3.0:
		var t := (y - 0.5) / 2.5
		return Color(0.2 + t * 0.3, 0.5 + t * 0.15, 0.1 + t * 0.1)
	else:
		var t2 := minf(1.0, (y - 3.0) / 5.0)
		return Color(0.4 + t2 * 0.3, 0.35 + t2 * 0.25, 0.2 + t2 * 0.2)


func _build_terrain() -> void:
	var seg := TERRAIN_SEGMENTS
	var size := Game.WORLD_SIZE
	var step := size / float(seg)
	var half := size * 0.5

	var verts := PackedVector3Array()
	var normals := PackedVector3Array()
	var colors := PackedColorArray()
	var indices := PackedInt32Array()

	for iz in seg + 1:
		for ix in seg + 1:
			var x := -half + float(ix) * step
			var z := -half + float(iz) * step
			var y := terrain_height(x, z)
			verts.append(Vector3(x, y, z))
			colors.append(_terrain_color(y))
			# Normal from central differences of the height function
			var e := step
			var nx := terrain_height(x - e, z) - terrain_height(x + e, z)
			var nz := terrain_height(x, z - e) - terrain_height(x, z + e)
			normals.append(Vector3(nx, 2.0 * e, nz).normalized())

	for iz in seg:
		for ix in seg:
			var i00 := iz * (seg + 1) + ix
			var i10 := i00 + 1
			var i01 := i00 + (seg + 1)
			var i11 := i01 + 1
			indices.append_array(PackedInt32Array([i00, i10, i01, i10, i11, i01]))

	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = verts
	arrays[Mesh.ARRAY_NORMAL] = normals
	arrays[Mesh.ARRAY_COLOR] = colors
	arrays[Mesh.ARRAY_INDEX] = indices
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)

	var mat := StandardMaterial3D.new()
	mat.vertex_color_use_as_albedo = true
	mat.roughness = 0.9
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mesh.surface_set_material(0, mat)

	var mi := MeshInstance3D.new()
	mi.name = "TerrainMesh"
	mi.mesh = mesh

	var body := StaticBody3D.new()
	body.name = "Terrain"
	body.collision_layer = 1
	body.collision_mask = 0
	var cs := CollisionShape3D.new()
	cs.shape = mesh.create_trimesh_shape()
	body.add_child(cs)
	body.add_child(mi)
	add_child(body)


func _build_water() -> void:
	var plane := PlaneMesh.new()
	plane.size = Vector2(Game.WORLD_SIZE, Game.WORLD_SIZE)
	plane.subdivide_width = 60
	plane.subdivide_depth = 60
	var shader := Shader.new()
	shader.code = WATER_SHADER
	var mat := ShaderMaterial.new()
	mat.shader = shader
	var mi := MeshInstance3D.new()
	mi.name = "Water"
	mi.mesh = plane
	mi.material_override = mat
	mi.position.y = WATER_LEVEL
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(mi)


## True once the sun is low enough that predators start working. Read off
## the same elevation the lighting uses, so "night" means what it looks like.
func is_night() -> bool:
	return _sun_elevation < 0.05


func is_in_water(pos: Vector3) -> bool:
	return terrain_height(pos.x, pos.z) < WATER_LEVEL - 0.15 and pos.y < WATER_LEVEL + 1.2


func _build_grass() -> void:
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.mesh = _make_grass_tuft_mesh()
	mm.instance_count = GRASS_COUNT
	var placed := 0
	var tries := 0
	while placed < GRASS_COUNT and tries < GRASS_COUNT * 12:
		tries += 1
		var x := (randf() - 0.5) * (Game.WORLD_SIZE - 20.0)
		var z := (randf() - 0.5) * (Game.WORLD_SIZE - 20.0)
		var y := terrain_height(x, z)
		if y < 0.3 or y > 3.0:
			continue
		var tuft_basis := Basis(Vector3.UP, randf() * TAU).scaled(Vector3.ONE * randf_range(0.7, 1.5))
		mm.set_instance_transform(placed, Transform3D(tuft_basis, Vector3(x, y, z)))
		placed += 1
	# Park any unplaced instances far underground
	for i in range(placed, GRASS_COUNT):
		mm.set_instance_transform(i, Transform3D(Basis().scaled(Vector3.ONE * 0.001), Vector3(0, -50, 0)))

	var mmi := MultiMeshInstance3D.new()
	mmi.name = "GrassField"
	mmi.multimesh = mm
	mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(mmi)


func _make_grass_tuft_mesh() -> ArrayMesh:
	# Two crossed triangle blades, vertex-colored dark->light green
	var verts := PackedVector3Array()
	var colors := PackedColorArray()
	var normals := PackedVector3Array()
	var indices := PackedInt32Array()
	var base_col := Color(0.14, 0.32, 0.09)
	var tip_col := Color(0.38, 0.62, 0.18)
	var idx := 0
	for ang in [0.0, PI / 2.0]:
		var right := Vector3(cos(ang), 0, sin(ang))
		verts.append(right * -0.2)
		verts.append(right * 0.2)
		verts.append(Vector3(0, 0.55, 0))
		colors.append(base_col)
		colors.append(base_col)
		colors.append(tip_col)
		for i in 3:
			normals.append(Vector3.UP)
		indices.append_array(PackedInt32Array([idx, idx + 1, idx + 2]))
		idx += 3
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = verts
	arrays[Mesh.ARRAY_NORMAL] = normals
	arrays[Mesh.ARRAY_COLOR] = colors
	arrays[Mesh.ARRAY_INDEX] = indices
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	var mat := StandardMaterial3D.new()
	mat.vertex_color_use_as_albedo = true
	mat.roughness = 1.0
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mesh.surface_set_material(0, mat)
	return mesh


## Sky, sun and moon are authored as real nodes in main.tscn so the editor
## viewport shows the lit world too; they are only built here if missing.
func _setup_environment() -> void:
	var we: WorldEnvironment = get_node_or_null("WorldEnvironment")
	if we == null:
		we = WorldEnvironment.new()
		we.name = "WorldEnvironment"
		add_child(we)
	if we.environment == null:
		we.environment = _default_environment()
	env = we.environment

	sun = get_node_or_null("Sun")
	if sun == null:
		sun = DirectionalLight3D.new()
		sun.name = "Sun"
		sun.shadow_enabled = true
		sun.directional_shadow_max_distance = 150.0
		add_child(sun)

	moon = get_node_or_null("Moon")
	if moon == null:
		moon = DirectionalLight3D.new()
		moon.name = "Moon"
		moon.light_color = Color(0.55, 0.65, 0.95)
		moon.shadow_enabled = false
		add_child(moon)


func _default_environment() -> Environment:
	var e := Environment.new()
	var sky := Sky.new()
	var sky_mat := ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color(0.35, 0.55, 0.85)
	sky_mat.sky_horizon_color = Color(0.7, 0.8, 0.9)
	sky_mat.ground_bottom_color = Color(0.2, 0.25, 0.2)
	sky_mat.ground_horizon_color = Color(0.65, 0.75, 0.85)
	sky.sky_material = sky_mat
	e.background_mode = Environment.BG_SKY
	e.sky = sky
	e.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	e.ambient_light_energy = 0.6
	e.fog_enabled = true
	e.fog_light_color = Color(0.53, 0.8, 0.92)
	e.fog_density = 0.002
	e.tonemap_mode = Environment.TONE_MAPPER_ACES
	e.tonemap_exposure = 1.1
	return e


# ==================== SPAWNING ====================

func _rand_pos(margin: float) -> Vector3:
	var x := (randf() - 0.5) * (Game.WORLD_SIZE - margin)
	var z := (randf() - 0.5) * (Game.WORLD_SIZE - margin)
	return Vector3(x, terrain_height(x, z), z)


## Random position guaranteed to be on dry land (not in a lake).
func _rand_pos_land(margin: float) -> Vector3:
	for i in 30:
		var p := _rand_pos(margin)
		if p.y > WATER_LEVEL + 0.5:
			return p
	return Vector3(10.0, terrain_height(10.0, 10.0), 10.0)


## Somewhere in the shallows: standing water a fish could hold in, or the
## wet ground beside it where clay and sand collect. Falls back to dry land
## when a map rolls with almost no water on it.
func _rand_pos_wet(margin: float, below_water: bool) -> Vector3:
	for i in 60:
		var p := _rand_pos(margin)
		if below_water and p.y < WATER_LEVEL - 0.4 and p.y > WATER_LEVEL - 3.0:
			return Vector3(p.x, WATER_LEVEL - 0.35, p.z)
		if not below_water and p.y > WATER_LEVEL and p.y < WATER_LEVEL + 1.6:
			return p
	return _rand_pos_land(margin)


func _scatter_resources() -> void:
	for i in TREE_COUNT:
		spawn_resource("tree", _rand_pos_land(40.0))
	for i in ROCK_COUNT:
		spawn_resource("iron" if randf() > 0.7 else "rock", _rand_pos_land(40.0))
	for i in SULFUR_COUNT:
		spawn_resource("sulfur", _rand_pos_land(40.0))
	for i in BARREL_COUNT:
		spawn_resource("barrel", _rand_pos_land(60.0))
	for i in BUSH_COUNT:
		spawn_resource("bush", _rand_pos_land(40.0))

	# Plants: the cheap end of the economy, and the only cloth you get
	# without killing something for it.
	for i in HEMP_COUNT:
		spawn_resource("hemp", _rand_pos_land(30.0))
	for i in CORN_COUNT:
		spawn_resource("corn", _rand_pos_land(30.0))
	for i in PUMPKIN_COUNT:
		spawn_resource("pumpkin", _rand_pos_land(30.0))
	for i in MUSHROOM_COUNT:
		spawn_resource("mushroom", _rand_pos_land(20.0))
	for i in HERB_COUNT:
		spawn_resource("herbs", _rand_pos_land(20.0))

	# Ground materials collect where the water has worked the soil, so a
	# lakeshore is worth walking rather than just worth drinking from.
	for i in CLAY_COUNT:
		spawn_resource("clay_deposit", _rand_pos_wet(40.0, false))
	for i in SAND_COUNT:
		spawn_resource("sand_deposit", _rand_pos_wet(40.0, false))
	for i in SALT_COUNT:
		spawn_resource("salt_deposit", _rand_pos_land(60.0))
	for i in FISH_COUNT:
		spawn_resource("fish", _rand_pos_wet(40.0, true))


func spawn_resource(type: String, pos: Vector3) -> void:
	var node: StaticBody3D = ResourceNodeScript.new()
	node.setup(type)
	node.position = pos
	node.depleted.connect(_on_resource_depleted)
	add_child(node)


func _on_resource_depleted(type: String, pos: Vector3) -> void:
	note_take(type)
	respawn_queue.append({"type": type, "pos": pos, "at": clock + respawn_delay_for(type)})


# ==================== POPULATION PRESSURE ====================

## Records that one more of `type` has been taken out of the world.
func note_take(type: String) -> void:
	pressure[type] = minf(PRESSURE_CAP, float(pressure.get(type, 0.0)) + PRESSURE_PER_TAKE)


func pressure_on(type: String) -> float:
	return float(pressure.get(type, 0.0))


## How long this type takes to come back right now. A patch nobody has
## touched refills at the base rate; one that has been stripped takes its
## time about it.
func respawn_delay_for(type: String) -> float:
	return RESPAWN_DELAY + pressure_on(type) * RESPAWN_PER_PRESSURE


func npc_respawn_delay_for(type: String) -> float:
	return NPC_RESPAWN_DELAY + pressure_on(type) * NPC_RESPAWN_PER_PRESSURE


## Everything recovers if it is left alone.
func _relieve_pressure(delta: float) -> void:
	for type in pressure.keys():
		var left := float(pressure[type]) - PRESSURE_DECAY * delta
		if left <= 0.0:
			pressure.erase(type)
		else:
			pressure[type] = left


func _create_monument(x: float, z: float) -> void:
	var y := terrain_height(x, z)
	var tower := StaticBody3D.new()
	tower.collision_layer = 1
	tower.collision_mask = 0
	var mi := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 4.0
	cyl.bottom_radius = 5.0
	cyl.height = 20.0
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color8(69, 90, 100)
	cyl.material = mat
	mi.mesh = cyl
	mi.position.y = 10.0
	tower.add_child(mi)
	var cs := CollisionShape3D.new()
	var shape := CylinderShape3D.new()
	shape.radius = 5.0
	shape.height = 20.0
	cs.shape = shape
	cs.position.y = 10.0
	tower.add_child(cs)
	tower.position = Vector3(x, y, z)
	add_child(tower)

	rad_zones.append(Vector2(x, z))
	spawn_resource("crate", Vector3(x + 2.0, terrain_height(x + 2.0, z), z))

	# The crate is the only high quality metal in the world, so it is worth
	# posting guards on it. They are the reason to bring a real weapon.
	for i in GUARDS_PER_MONUMENT:
		var ang := TAU * float(i) / float(GUARDS_PER_MONUMENT)
		var gx := x + cos(ang) * GUARD_POST_RADIUS
		var gz := z + sin(ang) * GUARD_POST_RADIUS
		spawn_npc("scientist", Vector3(gx, terrain_height(gx, gz), gz))


func _spawn_npcs() -> void:
	for i in WOLFBEAR_COUNT:
		var pos := _rand_pos_land(0.0)
		# Keep hostiles away from the spawn area
		if Vector2(pos.x, pos.z).length() < 30.0:
			pos.x += 60.0
		spawn_npc("wolf" if randf() > 0.3 else "bear", pos)
	for i in DEER_COUNT:
		spawn_npc("deer", _rand_pos_land(40.0))
	# Boars sit between the two: worth hunting for the meat, dangerous to
	# hunt badly, and only aggressive once you are close enough to matter.
	for i in BOAR_COUNT:
		spawn_npc("boar", _rand_pos_land(35.0))
	# Small game: the food you can take on day one with nothing but a rock,
	# and what a wolf eats when you are not the closest thing worth chasing.
	for i in RABBIT_COUNT:
		spawn_npc("rabbit", _rand_pos_land(20.0))
	for i in CHICKEN_COUNT:
		spawn_npc("chicken", _rand_pos_land(20.0))


func spawn_npc(type: String, pos: Vector3) -> void:
	var npc: CharacterBody3D = NpcScript.new()
	npc.setup(type, self)
	npc.position = pos
	npc.home = pos
	add_child(npc)


## A killed guard leaves its post empty for a while, then it is filled
## again — otherwise clearing a monument once would clear it forever.
func queue_npc_respawn(type: String, pos: Vector3) -> void:
	npc_respawn_queue.append({"type": type, "pos": pos,
		"at": clock + npc_respawn_delay_for(type)})


func _create_player() -> void:
	player = PlayerScript.new()
	player.name = "Player"
	player.world = self
	add_child(player)
	player.position = Vector3(0, terrain_height(0, 0) + 2.0, 0)


# ==================== STATIONS (campfire / furnace) ====================

func place_station(type: String, pos: Vector3) -> void:
	var label: String = Game.ITEMS.get(type, {}).get("name", type)
	if Game.get_count(type) <= 0:
		Game.notify("Craft a %s first" % label, Color(0.9, 0.3, 0.3))
		return
	Game.remove_item(type, 1)
	_spawn_station(type, pos)
	Game.notify("Placed %s" % label)
	Sfx.play("build")


## One pass over the deployed stations each frame, feeding both the
## temperature system and the workbench crafting gate.
func _update_stations(delta: float) -> void:
	var best_warmth := 0.0
	var bench := 0
	for st in stations:
		if not is_instance_valid(st):
			continue
		var dist: float = st.position.distance_to(player.position)
		var w: float = st.warmth()
		if w > 0.0 and dist < Game.WARMTH_RADIUS:
			# Closer to the fire is warmer
			best_warmth = maxf(best_warmth, w * (1.0 - dist / Game.WARMTH_RADIUS))
		if dist < Game.WORKBENCH_RADIUS:
			bench = maxi(bench, st.workbench_level())
	Game.workbench_level = bench

	# Night and water pull warmth down; fires push it back up
	var target := 100.0 - clampf(0.55 - _sun_elevation, 0.0, 1.0) * NIGHT_CHILL
	if player.in_water:
		target -= WATER_CHILL
	if best_warmth > 0.0:
		target = maxf(target, 55.0 + best_warmth * 45.0)
	Game.stats.temperature = move_toward(
		Game.stats.temperature, clampf(target, 0.0, 100.0), WARMTH_RATE * delta)


# ==================== DEVICES & POWER ====================

## How much of its rating a solar panel makes right now: nothing before dawn,
## everything at noon.
func sun_strength() -> float:
	return clampf(_sun_elevation, 0.0, 1.0)


## Wind comes in slow swells rather than blowing at one speed forever, so a
## turbine-only base has quiet spells that a battery has to cover.
func wind_strength() -> float:
	var swell := 0.5 + 0.5 * sin(clock * TAU / Game.WIND_PERIOD)
	return clampf(Game.WIND_FLOOR + (1.0 - Game.WIND_FLOOR) * swell, 0.0, 1.0)


func place_device(type: String, pos: Vector3) -> void:
	var label: String = Game.ITEMS.get(type, {}).get("name", type)
	if Game.get_count(type) <= 0:
		Game.notify("Craft a %s first" % label, Color(0.9, 0.3, 0.3))
		return
	Game.remove_item(type, 1)
	_spawn_device(type, pos)
	Game.notify("Placed %s" % label)
	Sfx.play("build")


func _spawn_device(type: String, pos: Vector3) -> Node3D:
	var d: StaticBody3D = DeviceScript.new()
	d.setup(type, self)
	d.position = pos
	add_child(d)
	devices.append(d)
	return d


## Takes a device off the grid and out of the world — a spent mine, a turret
## somebody blew off its mount.
func remove_device(d: Node3D) -> void:
	devices.erase(d)
	if power != null:
		power.disconnect_device(d)
	d.queue_free()


func _spawn_station(type: String, pos: Vector3) -> Node3D:
	var s: StaticBody3D = StationScript.new()
	s.setup(type)
	s.position = pos
	add_child(s)
	stations.append(s)
	return s


# ==================== MAIN LOOP ====================

func _process(delta: float) -> void:
	clock += delta
	_update_day_night(delta)

	if not started:
		return

	# Survival stats (same rates as the JS version)
	Game.stats.hunger = maxf(0.0, Game.stats.hunger - 0.05 * delta)
	Game.stats.thirst = maxf(0.0, Game.stats.thirst - 0.08 * delta)
	_update_stations(delta)
	_relieve_pressure(delta)

	var in_rad := false
	for z in rad_zones:
		if Vector2(player.position.x, player.position.z).distance_to(z) < Game.RAD_ZONE_RADIUS:
			in_rad = true
			break
	if in_rad:
		# A hazmat suit is the difference between looting a monument and
		# sprinting out of it with a timer running.
		var shielded := 1.0 - Game.radiation_protection()
		Game.stats.radiation = minf(100.0, Game.stats.radiation + 2.0 * delta * shielded)
	else:
		Game.stats.radiation = maxf(0.0, Game.stats.radiation - 1.0 * delta)

	if Game.stats.hunger <= 0.0 or Game.stats.thirst <= 0.0 or Game.stats.radiation >= 100.0:
		Game.stats.health -= 2.0 * delta
	# Hypothermia: the colder you get past the threshold, the faster it hurts
	if Game.stats.temperature < FREEZING_POINT:
		Game.stats.health -= (FREEZING_POINT - Game.stats.temperature) * 0.06 * delta

	if Game.stats.health <= 0.0:
		_on_player_death()

	# Respawn harvested resources
	_respawn_timer += delta
	if _respawn_timer >= 5.0:
		_respawn_timer = 0.0
		var remaining := []
		for r in respawn_queue:
			if clock >= r.at:
				spawn_resource(r.type, r.pos)
			else:
				remaining.append(r)
		respawn_queue = remaining

		var still_waiting := []
		for n in npc_respawn_queue:
			if clock >= n.at:
				spawn_npc(n.type, n.pos)
			else:
				still_waiting.append(n)
		npc_respawn_queue = still_waiting

		# Bags rot, so a long-running world does not fill up with them
		var live_bags := []
		for bag in bags:
			if not is_instance_valid(bag):
				continue
			if clock >= bag.expires_at or bag.is_empty():
				bag.queue_free()
			else:
				live_bags.append(bag)
		bags = live_bags

	# Base decay / Tool Cupboard upkeep
	_decay_timer += delta
	if _decay_timer >= Game.DECAY_INTERVAL:
		_decay_timer = 0.0
		tick_decay()

	# Autosave every 60s
	_autosave_timer += delta
	if _autosave_timer >= 60.0:
		_autosave_timer = 0.0
		save_game()


func _update_day_night(_delta: float) -> void:
	if started:
		Game.day_time = fmod(Game.day_time + _delta, Game.DAY_LENGTH)
	var p := Game.day_time / Game.DAY_LENGTH
	var a := p * TAU
	var elev := sin(a)
	_sun_elevation = elev

	var sun_pos := Vector3(cos(a) * 100.0, sin(a) * 100.0, 20.0)
	sun.look_at_from_position(sun_pos, Vector3.ZERO, Vector3(0, 0, 1))
	sun.light_energy = maxf(0.0, elev * 1.5)
	# Warm golden light near the horizon, white at noon
	var warmth := clampf(1.0 - elev * 1.8, 0.0, 1.0)
	sun.light_color = Color(1.0, 1.0, 0.95).lerp(Color(1.0, 0.55, 0.3), warmth)

	moon.look_at_from_position(-sun_pos + Vector3(0, 0, -40.0), Vector3.ZERO, Vector3(0, 0, 1))
	moon.light_energy = maxf(0.0, -elev) * 0.3

	var night := clampf(0.5 - elev, 0.0, 1.0)
	env.fog_light_color = Color(0.53, 0.8, 0.92).lerp(Color(0.03, 0.04, 0.08), night)
	env.ambient_light_energy = maxf(0.12, elev * 0.8)
	env.background_energy_multiplier = clampf(elev + 0.25, 0.06, 1.0)


## Dying costs everything you were carrying. It stays in a bag where you
## fell, which is what makes armour, locks, a base and the whole monument
## run worth anything — before this, nothing you owned was ever at risk.
func _on_player_death() -> void:
	var fell_at := player.position
	var dropped := drop_everything(fell_at)

	Game.stats.health = 100.0
	Game.stats.hunger = 100.0
	Game.stats.thirst = 100.0
	Game.stats.temperature = 100.0
	Game.stats.radiation = 0.0
	Game.stats.oxygen = 100.0

	var bed := nearest_sleeping_bag(fell_at)
	if bed != null:
		player.position = bed.position + Vector3(0, 1.5, 0)
	else:
		player.position = Vector3(0, terrain_height(0, 0) + 2.0, 0)
	player.velocity = Vector3.ZERO

	if dropped > 0:
		Game.notify("You died — %d items left in a bag where you fell" % dropped,
			Color(0.9, 0.3, 0.3))
	else:
		Game.notify("You died! Respawning...", Color(0.9, 0.3, 0.3))
	Sfx.play("hit")


## Moves the whole loadout into a bag at `pos` and hands back the opening
## kit, so a death never leaves the player unable to build their way back.
## Returns how many items went into the bag.
func drop_everything(pos: Vector3) -> int:
	var carried: Dictionary = Game.inventory.duplicate()
	var total := 0
	for id in carried:
		total += int(carried[id])
	if total <= 0:
		Game.reset_loadout()
		return 0

	var bag: StaticBody3D = LootBagScript.new()
	bag.setup(carried, Game.worn, Game.belt, clock)
	bag.position = Vector3(pos.x, terrain_height(pos.x, pos.z), pos.z)
	add_child(bag)
	bags.append(bag)

	Game.reset_loadout()
	return total


func nearest_sleeping_bag(from: Vector3) -> Node3D:
	var best: Node3D = null
	var best_d := INF
	for st in stations:
		if not is_instance_valid(st) or st.station_type != "sleeping_bag":
			continue
		var d: float = st.position.distance_to(from)
		if d < best_d:
			best_d = d
			best = st
	return best


# ==================== EXPLOSIVES & DECAY ====================

func spawn_explosive(id: String, pos: Vector3, vel: Vector3 = Vector3.ZERO) -> Node3D:
	var e: Node3D = ExplosiveScript.new()
	e.setup(id, self)
	add_child(e)
	e.global_position = pos
	e.velocity = vel
	return e


## A blast at `origin`: structures take damage through their tier's blast
## resistance, creatures and the player take a scaled share. Everything
## falls off with distance. Returns the total damage dealt to structures.
func apply_explosion(origin: Vector3, damage: float, radius: float) -> float:
	var dealt := 0.0
	for s in structures.duplicate():
		if not is_instance_valid(s):
			continue
		var d: float = s.position.distance_to(origin)
		if d > radius:
			continue
		dealt += s.take_blast(damage * clampf(1.0 - d / radius, 0.15, 1.0), origin)

	# Turrets and traps go up with the wall they were bolted to
	for d in devices.duplicate():
		if not is_instance_valid(d):
			continue
		var dd: float = d.position.distance_to(origin)
		if dd <= radius:
			dealt += d.take_blast(damage * clampf(1.0 - dd / radius, 0.15, 1.0), origin)

	for child in get_children():
		if child.has_method("npc_take_damage"):
			var dn: float = child.position.distance_to(origin)
			if dn <= radius:
				child.npc_take_damage(
					damage * clampf(1.0 - dn / radius, 0.1, 1.0) * NPC_BLAST_SCALE)

	if player != null:
		var dp := player.position.distance_to(origin)
		if dp <= radius:
			Game.hurt(damage * clampf(1.0 - dp / radius, 0.0, 1.0) * PLAYER_BLAST_SCALE)
		# A blast is felt further than it is survived: the camera kicks well
		# outside the damage radius, which is what tells you a raid has
		# started somewhere behind you.
		var felt: float = radius * 4.0
		if dp <= felt and player.has_method("shake_camera"):
			player.shake_camera(0.05 * clampf(1.0 - dp / felt, 0.0, 1.0), 0.5, 26.0)
	return dealt


## Structures outside every Tool Cupboard rot away. Inside one, they are
## safe for as long as the cupboard has upkeep materials stocked.
func tick_decay() -> void:
	var tcs: Array = []
	for s in structures:
		if is_instance_valid(s) and s.build_type == "tool_cupboard":
			tcs.append(s)

	var groups: Dictionary = {}
	var orphans: Array = []
	for s in structures:
		if not is_instance_valid(s) or s.build_type == "tool_cupboard":
			continue
		var tc := _tc_covering(s.position, tcs)
		if tc == null:
			orphans.append(s)
		else:
			var key := tc.get_instance_id()
			if not groups.has(key):
				groups[key] = []
			groups[key].append(s)

	for s in orphans:
		s.apply_decay(Game.DECAY_UNPROTECTED)

	for tc in tcs:
		var group: Array = groups.get(tc.get_instance_id(), [])
		# Bigger bases cost more to maintain
		var cost: int = maxi(1, ceili(group.size() / 4.0))
		if tc.pay_upkeep(cost):
			for s in group:
				s.decaying = false
			tc.decaying = false
		else:
			for s in group:
				s.apply_decay(Game.DECAY_UNPAID)
			tc.apply_decay(Game.DECAY_UNPAID)


func _tc_covering(pos: Vector3, tcs: Array) -> Node3D:
	var flat := Vector2(pos.x, pos.z)
	for tc in tcs:
		if flat.distance_to(Vector2(tc.position.x, tc.position.z)) < Game.TC_RADIUS:
			return tc
	return null


func register_structure(s: Node3D) -> void:
	structures.append(s)
	if s.build_type == "barricade":
		barricades.append(s)


func unregister_structure(s: Node3D) -> void:
	structures.erase(s)
	barricades.erase(s)
	# Whatever that piece was holding up may have nothing under it now
	recompute_stability()


## Height of whatever a creature is standing on at this point: the terrain,
## or the top of a floor piece laid over it. Creatures pin their height
## rather than falling, so without this they wade through a base's floor
## instead of walking on it.
func ground_height_at(x: float, z: float) -> float:
	var h := terrain_height(x, z)
	for s in structures:
		if not is_instance_valid(s) or not (s.build_type in Game.FLOOR_TYPES):
			continue
		if absf(s.position.x - x) > 1.5 or absf(s.position.z - z) > 1.5:
			continue
		var top: float = s.position.y + float(Game.BUILDING_TYPES[s.build_type].size.y) * 0.5
		# Only what can be stepped onto — a roof two storeys up is not a floor
		if top > h and top < h + 1.5:
			h = top
	return h


# ==================== STABILITY ====================

## A wall/doorway/window/door sits 1.5m off its tile's centre, on whichever
## edge was nearest a foundation when it was placed (see building_system.gd).
## Plain rounding would land it in the empty gap between two tiles, so it
## has to resolve to whichever neighbouring tile actually carries it.
const _EDGE_TYPES := ["wall", "half_wall", "low_wall", "doorway", "window_wall",
	"ladder", "wooden_door", "garage_door"]


## Which 3m cell a piece stands in. Pieces "at the same point" are within
## half a metre of each other, so rounding to the grid groups a column.
## `founded_cells` are the cells that hold a foundation or ceiling — an edge
## piece resolves to whichever of its two neighbouring cells is one of
## those, defaulting to the first if neither (or both) qualify.
func _cell_of(s: Node3D, founded_cells: Dictionary) -> Vector2i:
	# A pillar stands on the corner where up to four tiles meet, so plain
	# rounding drops it into whichever one happens to be nearest — often an
	# empty one, and the pillar then falls down on a base it is holding up.
	# It belongs to whichever of the four is actually carrying it.
	if s.build_type == "pillar":
		var corners: Array[Vector2i] = []
		for ox in [-1.5, 1.5]:
			for oz in [-1.5, 1.5]:
				corners.append(Vector2i(roundi((s.position.x + ox) / 3.0),
					roundi((s.position.z + oz) / 3.0)))
		for c in corners:
			if founded_cells.has(c):
				return c
		return corners[0]

	if not (s.build_type in _EDGE_TYPES):
		return Vector2i(roundi(s.position.x / 3.0), roundi(s.position.z / 3.0))

	# base_rot and closed_pos (not rotation.y / position) because an open
	# door's swing changes both, and it must still resolve to the same
	# tile its doorway does.
	var p: Vector3 = s.closed_pos if s.is_door else s.position
	var candidates: Array[Vector2i] = []
	if absf(s.base_rot - PI / 2.0) < 0.1:
		var cz := roundi(p.z / 3.0)
		candidates = [Vector2i(roundi((p.x - 1.5) / 3.0), cz),
			Vector2i(roundi((p.x + 1.5) / 3.0), cz)]
	else:
		var cx := roundi(p.x / 3.0)
		candidates = [Vector2i(cx, roundi((p.z - 1.5) / 3.0)),
			Vector2i(cx, roundi((p.z + 1.5) / 3.0))]
	for c in candidates:
		if founded_cells.has(c):
			return c
	return candidates[0]


## Scores every piece: a foundation anchors its column, and each piece
## above the one below it loses a step. Nothing beneath it means nothing
## holding it up.
func _score_stability() -> void:
	var founded_cells := {}
	for s in structures:
		if is_instance_valid(s) and (s.build_type in Game.SUPPORT_TYPES):
			founded_cells[Vector2i(roundi(s.position.x / 3.0), roundi(s.position.z / 3.0))] = true

	var columns: Dictionary = {}
	for s in structures:
		if not is_instance_valid(s):
			continue
		# Free-standing pieces carry nothing and are carried by nothing, so
		# they are simply always up.
		s.stability = 100.0 if (s.build_type in Game.ANCHOR_TYPES
			or s.build_type in Game.FREESTANDING_TYPES) else 0.0
		var cell := _cell_of(s, founded_cells)
		if not columns.has(cell):
			columns[cell] = []
		columns[cell].append(s)

	for cell in columns:
		var column: Array = columns[cell]
		column.sort_custom(func(a, b): return a.position.y < b.position.y)
		# The step is per level, not per piece: a doorway and the door in it
		# stand at the same height and must not tax each other.
		var carried := 0.0
		var last_y := -INF
		# A pillar on the level below is a load path straight down to the
		# footing, so the level above it starts again at full instead of
		# losing its step. That is the whole reason to spend on pillars when
		# a base goes up rather than out.
		var braced_below := false
		for s in column:
			if s.build_type in Game.ANCHOR_TYPES:
				carried = 100.0
				last_y = s.position.y
				braced_below = false
				continue
			if s.position.y > last_y + 0.5:
				carried = 100.0 if braced_below else maxf(0.0, carried - Game.STABILITY_DROP)
				last_y = s.position.y
				braced_below = false
			if s.build_type == "pillar":
				braced_below = true
			if not (s.build_type in Game.FREESTANDING_TYPES):
				s.stability = carried

		# A door hangs on its doorway, not on the floor below it
		for s in column:
			if not s.is_door:
				continue
			var framed := false
			for other in column:
				if other.build_type == "doorway" and other.stability > 0.0:
					framed = true
					break
			if not framed:
				s.stability = 0.0


## Rescores the whole map and drops anything left with nothing under it.
## Returns how many pieces fell. Re-entrant calls are ignored: destroying a
## collapsed piece unregisters it, which would otherwise call straight back
## in here in the middle of the sweep.
func recompute_stability() -> int:
	if _stability_pass:
		return 0
	_stability_pass = true
	var collapsed := 0
	# Each round can pull the support out from under the round above it
	for _round in 8:
		_score_stability()
		var doomed := []
		for s in structures:
			if is_instance_valid(s) and s.stability <= 0.0:
				doomed.append(s)
		if doomed.is_empty():
			break
		for s in doomed:
			collapsed += 1
			s.free_collapsed()
	_stability_pass = false

	if collapsed > 0 and started:
		Game.notify("%d pieces collapsed — nothing holding them up" % collapsed,
			Color(0.95, 0.5, 0.35))
		Sfx.play("hit")
	return collapsed


# ==================== SAVE / LOAD ====================

func save_game() -> void:
	var data := {
		"version": 2,
		"player": {
			"pos": [player.position.x, player.position.y, player.position.z],
			"yaw": player.rotation.y,
			"stats": Game.stats,
			"inventory": Game.inventory,
			"belt": Game.belt,
			"worn": Game.worn,
			"wear": Game.tool_wear,
			"loaded": Game.loaded,
			"fire_modes": Game.fire_modes,
			"scopes": Game.scope_levels,
		},
		"time": Game.day_time,
		"settings": Game.settings,
		"touch_layout": Game.touch_layout,
		"structures": [],
		"stations": [],
		"bags": [],
		"devices": [],
		"wires": [],
	}

	# Devices first, because the wires are stored as indices into this list
	var live_devices := []
	for d in devices:
		if is_instance_valid(d):
			live_devices.append(d)
	for d in live_devices:
		data.devices.append({
			"type": d.device_type,
			"pos": [d.position.x, d.position.y, d.position.z],
			"on": d.switch_on,
			"charge": d.stored_charge,
		})
	if power != null:
		for w in power.wires:
			var ia := live_devices.find(w[0])
			var ib := live_devices.find(w[1])
			if ia >= 0 and ib >= 0:
				data.wires.append([ia, ib])
	for bag in bags:
		if not is_instance_valid(bag) or bag.is_empty():
			continue
		data.bags.append({
			"pos": [bag.position.x, bag.position.y, bag.position.z],
			"stored": bag.stored,
			"worn": bag.worn,
			"belt": bag.belt,
			# Stored as time remaining: the clock restarts on every load
			"left": maxf(0.0, bag.expires_at - clock),
		})
	for s in structures:
		if not is_instance_valid(s):
			continue
		data.structures.append({
			"type": s.build_type,
			"pos": [s.position.x, s.position.y, s.position.z],
			"rot": s.base_rot,
			"tier": s.tier,
			"health": s.health,
			"upkeep": s.upkeep,
			"lock": s.lock_type,
			"lock_health": s.lock_health,
			"soft": [s.soft_normal.x, s.soft_normal.z],
			# Stored as age, because the world clock restarts on every load
			"age": maxf(0.0, clock - s.placed_at),
		})
	for st in stations:
		if not is_instance_valid(st):
			continue
		data.stations.append({
			"type": st.station_type,
			"pos": [st.position.x, st.position.y, st.position.z],
			"stored": st.stored,
		})
	var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(data))
		f.close()
		Game.notify("Game Saved")


func load_game() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var f := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if f == null:
		return
	var parsed = JSON.parse_string(f.get_as_text())
	f.close()
	if not (parsed is Dictionary):
		return

	var p: Dictionary = parsed.get("player", {})
	if p.has("pos") and p.pos is Array and p.pos.size() == 3:
		player.position = Vector3(float(p.pos[0]), float(p.pos[1]), float(p.pos[2]))
	if p.has("yaw"):
		player.rotation.y = float(p.yaw)
	if p.has("stats") and p.stats is Dictionary:
		for k in Game.stats:
			Game.stats[k] = float(p.stats.get(k, Game.stats[k]))
	if p.has("inventory") and p.inventory is Dictionary:
		Game.inventory = {}
		for k in p.inventory:
			Game.inventory[k] = int(p.inventory[k])
		Game.inventory_changed.emit()
	if p.has("belt") and p.belt is Array and p.belt.size() == Game.BELT_SLOTS:
		Game.belt = p.belt
	if p.has("worn") and p.worn is Dictionary:
		Game.worn = {}
		for slot in p.worn:
			var piece := str(p.worn[slot])
			# Only re-equip pieces that still exist and still fit that slot
			if Game.ARMOUR.has(piece) and str(Game.ARMOUR[piece].slot) == str(slot):
				Game.worn[slot] = piece
	# A weapon keeps what was in its magazine, the mode it was set to and the
	# magnification its sight was on. Each is clamped to what the weapon can
	# actually hold, so a rebalance never leaves a rifle with 40 rounds in a
	# 30-round magazine.
	if p.has("loaded") and p.loaded is Dictionary:
		Game.loaded = {}
		for id in p.loaded:
			if Game.is_ranged(str(id)):
				Game.loaded[str(id)] = clampi(
					int(p.loaded[id]), 0, Game.magazine_size(str(id)))
	if p.has("fire_modes") and p.fire_modes is Dictionary:
		Game.fire_modes = {}
		for id in p.fire_modes:
			var modes := Game.fire_mode_list(str(id))
			if Game.WEAPONS.has(str(id)):
				Game.fire_modes[str(id)] = clampi(
					int(p.fire_modes[id]), 0, modes.size() - 1)
	if p.has("scopes") and p.scopes is Dictionary:
		Game.scope_levels = {}
		for id in p.scopes:
			var levels := Game.scope_list(str(id))
			if levels.size() > 1:
				Game.scope_levels[str(id)] = clampi(
					int(p.scopes[id]), 0, levels.size() - 1)

	if p.has("wear") and p.wear is Dictionary:
		Game.tool_wear = {}
		for id in p.wear:
			# Only for things that still wear out, and never above the
			# maximum a rebalance may since have lowered.
			if Game.has_durability(str(id)):
				Game.tool_wear[str(id)] = clampi(
					int(p.wear[id]), 0, Game.max_durability(str(id)))
	Game.day_time = float(parsed.get("time", Game.day_time))
	var saved_settings = parsed.get("settings", {})
	if saved_settings is Dictionary:
		Game.load_settings(saved_settings)
	var saved_layout = parsed.get("touch_layout", {})
	if saved_layout is Dictionary:
		Game.load_touch_layout(saved_layout)

	for sd in parsed.get("structures", []):
		if not (sd is Dictionary):
			continue
		var type := str(sd.get("type", "foundation"))
		if not Game.BUILDING_TYPES.has(type):
			type = "foundation"
		var s: StaticBody3D = StructureScript.new()
		s.setup(type)
		var sp: Array = sd.get("pos", [0, 0, 0])
		s.position = Vector3(float(sp[0]), float(sp[1]), float(sp[2]))
		s.base_rot = float(sd.get("rot", 0.0))
		s.rotation.y = s.base_rot
		s.placed_at = clock - float(sd.get("age", Game.DEMOLISH_WINDOW))
		add_child(s)
		s.apply_tier(str(sd.get("tier", "twig")))
		s.health = float(sd.get("health", s.max_health))
		var saved_upkeep = sd.get("upkeep", {})
		if saved_upkeep is Dictionary:
			for k in saved_upkeep:
				s.upkeep[k] = int(saved_upkeep[k])
		var saved_soft = sd.get("soft", [])
		if saved_soft is Array and saved_soft.size() == 2:
			s.soft_normal = Vector3(float(saved_soft[0]), 0.0, float(saved_soft[1]))
		var saved_lock := str(sd.get("lock", ""))
		if saved_lock != "" and s.install_lock(saved_lock):
			# A half-broken lock stays half-broken across a reload
			s.lock_health = float(sd.get("lock_health", s.lock_health))
		register_structure(s)
		if type == "tool_cupboard":
			Game.tool_cupboards.append(Vector2(s.position.x, s.position.z))

	# Score the rebuilt base in one pass rather than per piece as it loads
	recompute_stability()

	for bd in parsed.get("bags", []):
		if not (bd is Dictionary):
			continue
		var bp: Array = bd.get("pos", [0, 0, 0])
		var contents = bd.get("stored", {})
		var bag_worn = bd.get("worn", {})
		var bag_belt = bd.get("belt", [])
		var bag: StaticBody3D = LootBagScript.new()
		bag.setup(contents if contents is Dictionary else {},
			bag_worn if bag_worn is Dictionary else {},
			bag_belt if bag_belt is Array else [], clock)
		bag.expires_at = clock + float(bd.get("left", bag.LIFETIME))
		bag.position = Vector3(float(bp[0]), float(bp[1]), float(bp[2]))
		add_child(bag)
		bags.append(bag)

	for st in parsed.get("stations", []):
		if not (st is Dictionary):
			continue
		var st_type := str(st.get("type", "campfire"))
		var st_pos: Array = st.get("pos", [0, 0, 0])
		var node := _spawn_station(st_type,
			Vector3(float(st_pos[0]), float(st_pos[1]), float(st_pos[2])))
		var contents = st.get("stored", {})
		if contents is Dictionary:
			for k in contents:
				node.stored[k] = int(contents[k])

	# Devices, then the wires between them by the index they were saved at
	var restored := []
	for dd in parsed.get("devices", []):
		if not (dd is Dictionary):
			continue
		var dtype := str(dd.get("type", ""))
		if not Game.DEVICES.has(dtype):
			continue
		var dp: Array = dd.get("pos", [0, 0, 0])
		var node := _spawn_device(dtype,
			Vector3(float(dp[0]), float(dp[1]), float(dp[2])))
		node.switch_on = bool(dd.get("on", true))
		node.stored_charge = float(dd.get("charge", 0.0))
		restored.append(node)

	if power != null:
		for pair in parsed.get("wires", []):
			if not (pair is Array) or pair.size() != 2:
				continue
			var ia := int(pair[0])
			var ib := int(pair[1])
			if ia < 0 or ib < 0 or ia >= restored.size() or ib >= restored.size():
				continue
			# Straight into the list: the range check was already passed when
			# the wire was first run, and the two ends have not moved.
			power.wires.append([restored[ia], restored[ib]])
			power._draw_wire(restored[ia], restored[ib])


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		if started and player != null:
			save_game()
