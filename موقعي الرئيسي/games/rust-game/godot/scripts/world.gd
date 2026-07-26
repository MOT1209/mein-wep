extends Node3D
## Main world: procedural terrain (FBM noise + vertex colors), resource
## scatter, monuments/radiation zones, NPC spawning, day/night cycle,
## respawn queue, autosave and save/load. Port of the Three.js engine body.

const ResourceNodeScript := preload("res://scripts/resource_node.gd")
const NpcScript := preload("res://scripts/npc.gd")
const PlayerScript := preload("res://scripts/player.gd")
const StructureScript := preload("res://scripts/structure.gd")
const BuildingSystemScript := preload("res://scripts/building_system.gd")
const HudScript := preload("res://scripts/hud.gd")

const SAVE_PATH := "user://rust_save.json"
const TREE_COUNT := 70
const ROCK_COUNT := 40
const SULFUR_COUNT := 25
const BARREL_COUNT := 30
const NPC_COUNT := 5
const RESPAWN_DELAY := 30.0
const TERRAIN_SEGMENTS := 120

var sun: DirectionalLight3D
var env: Environment
var player: CharacterBody3D
var building: Node3D
var hud: CanvasLayer
var started := false

var rad_zones: Array = []       # Array of Vector2 (x, z)
var structures: Array = []      # placed structure nodes
var respawn_queue: Array = []   # {type, pos, at}
var clock := 0.0
var _respawn_timer := 0.0
var _autosave_timer := 0.0


func _ready() -> void:
	randomize()
	_setup_environment()
	_build_terrain()
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

	hud = HudScript.new()
	hud.name = "HUD"
	add_child(hud)
	hud.world = self
	player.hud = hud

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
	if y < 0.5:
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


func _setup_environment() -> void:
	env = Environment.new()
	var sky := Sky.new()
	var sky_mat := ProceduralSkyMaterial.new()
	sky_mat.sky_top_color = Color(0.35, 0.55, 0.85)
	sky_mat.sky_horizon_color = Color(0.7, 0.8, 0.9)
	sky_mat.ground_bottom_color = Color(0.2, 0.25, 0.2)
	sky_mat.ground_horizon_color = Color(0.65, 0.75, 0.85)
	sky.sky_material = sky_mat
	env.background_mode = Environment.BG_SKY
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = 0.6
	env.fog_enabled = true
	env.fog_light_color = Color(0.53, 0.8, 0.92)
	env.fog_density = 0.002
	env.tonemap_mode = Environment.TONE_MAPPER_ACES
	env.tonemap_exposure = 1.1
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)

	sun = DirectionalLight3D.new()
	sun.name = "Sun"
	sun.shadow_enabled = true
	sun.directional_shadow_max_distance = 150.0
	add_child(sun)


# ==================== SPAWNING ====================

func _rand_pos(margin: float) -> Vector3:
	var x := (randf() - 0.5) * (Game.WORLD_SIZE - margin)
	var z := (randf() - 0.5) * (Game.WORLD_SIZE - margin)
	return Vector3(x, terrain_height(x, z), z)


func _scatter_resources() -> void:
	for i in TREE_COUNT:
		spawn_resource("tree", _rand_pos(40.0))
	for i in ROCK_COUNT:
		spawn_resource("iron" if randf() > 0.7 else "rock", _rand_pos(40.0))
	for i in SULFUR_COUNT:
		spawn_resource("sulfur", _rand_pos(40.0))
	for i in BARREL_COUNT:
		spawn_resource("barrel", _rand_pos(60.0))


func spawn_resource(type: String, pos: Vector3) -> void:
	var node: StaticBody3D = ResourceNodeScript.new()
	node.setup(type)
	node.position = pos
	node.depleted.connect(_on_resource_depleted)
	add_child(node)


func _on_resource_depleted(type: String, pos: Vector3) -> void:
	respawn_queue.append({"type": type, "pos": pos, "at": clock + RESPAWN_DELAY})


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


func _spawn_npcs() -> void:
	for i in NPC_COUNT:
		var pos := _rand_pos(0.0)
		# Keep hostiles away from the spawn area
		if Vector2(pos.x, pos.z).length() < 30.0:
			pos.x += 60.0
		spawn_npc("wolf" if randf() > 0.3 else "bear", pos)


func spawn_npc(type: String, pos: Vector3) -> void:
	var npc: CharacterBody3D = NpcScript.new()
	npc.setup(type, self)
	npc.position = pos
	add_child(npc)


func _create_player() -> void:
	player = PlayerScript.new()
	player.name = "Player"
	player.world = self
	add_child(player)
	player.position = Vector3(0, terrain_height(0, 0) + 2.0, 0)


# ==================== MAIN LOOP ====================

func _process(delta: float) -> void:
	clock += delta
	_update_day_night(delta)

	if not started:
		return

	# Survival stats (same rates as the JS version)
	Game.stats.hunger = maxf(0.0, Game.stats.hunger - 0.05 * delta)
	Game.stats.thirst = maxf(0.0, Game.stats.thirst - 0.08 * delta)

	var in_rad := false
	for z in rad_zones:
		if Vector2(player.position.x, player.position.z).distance_to(z) < Game.RAD_ZONE_RADIUS:
			in_rad = true
			break
	if in_rad:
		Game.stats.radiation = minf(100.0, Game.stats.radiation + 2.0 * delta)
	else:
		Game.stats.radiation = maxf(0.0, Game.stats.radiation - 1.0 * delta)

	if Game.stats.hunger <= 0.0 or Game.stats.thirst <= 0.0 or Game.stats.radiation >= 100.0:
		Game.stats.health -= 2.0 * delta

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

	# Autosave every 60s
	_autosave_timer += delta
	if _autosave_timer >= 60.0:
		_autosave_timer = 0.0
		save_game()


func _update_day_night(delta: float) -> void:
	if started:
		Game.day_time = fmod(Game.day_time + delta, Game.DAY_LENGTH)
	var p := Game.day_time / Game.DAY_LENGTH
	var a := p * TAU
	var sun_pos := Vector3(cos(a) * 100.0, sin(a) * 100.0, 20.0)
	sun.look_at_from_position(sun_pos, Vector3.ZERO, Vector3(0, 0, 1))
	sun.light_energy = maxf(0.0, sin(a) * 1.5)
	env.ambient_light_energy = maxf(0.15, sin(a) * 0.8)
	env.background_energy_multiplier = clampf(sin(a) + 0.2, 0.05, 1.0)


func _on_player_death() -> void:
	Game.stats.health = 100.0
	Game.stats.hunger = 100.0
	Game.stats.thirst = 100.0
	Game.stats.radiation = 0.0
	player.position = Vector3(0, terrain_height(0, 0) + 2.0, 0)
	player.velocity = Vector3.ZERO
	Game.notify("You died! Respawning...", Color(0.9, 0.3, 0.3))
	Sfx.play("hit")


func register_structure(s: Node3D) -> void:
	structures.append(s)


func unregister_structure(s: Node3D) -> void:
	structures.erase(s)


# ==================== SAVE / LOAD ====================

func save_game() -> void:
	var data := {
		"version": 1,
		"player": {
			"pos": [player.position.x, player.position.y, player.position.z],
			"yaw": player.rotation.y,
			"stats": Game.stats,
			"inventory": Game.inventory,
			"belt": Game.belt,
		},
		"time": Game.day_time,
		"structures": [],
	}
	for s in structures:
		if not is_instance_valid(s):
			continue
		data.structures.append({
			"type": s.build_type,
			"pos": [s.position.x, s.position.y, s.position.z],
			"rot": s.base_rot,
			"tier": s.tier,
			"health": s.health,
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
	if p.has("belt") and p.belt is Array and p.belt.size() == 6:
		Game.belt = p.belt
	Game.day_time = float(parsed.get("time", Game.day_time))

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
		add_child(s)
		s.apply_tier(str(sd.get("tier", "twig")))
		s.health = float(sd.get("health", s.max_health))
		structures.append(s)
		if type == "tool_cupboard":
			Game.tool_cupboards.append(Vector2(s.position.x, s.position.z))


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		if started and player != null:
			save_game()
