extends CharacterBody3D
const ModelRegistry := preload("res://scripts/model_registry.gd")
## World creatures and monument guards. Hostile melee (wolf/bear):
## chase-and-bite. Hostile ranged (scientist): holds its post, shoots on
## sight and forces doors to follow you home. Passive (deer): wanders and
## flees from the player, drops meat when hunted.
## Damage flash, loot drop and shrink-out death for all types.

## `aggro` is how far it notices you; `range` and `ranged` turn the attack
## into gunfire. `leash` keeps a guard near the post it spawned on, so
## monuments stay dangerous without the whole map following you home.
const TYPES := {
	"wolf": {"health": 50.0, "speed": 5.0, "damage": 12.0, "hostile": true,
		"color": Color8(93, 64, 55), "size": Vector3(0.8, 1.4, 0.4),
		"aggro": 18.0, "cooldown": 1.2, "hunts": true, "packs": true},
	"bear": {"health": 120.0, "speed": 3.0, "damage": 20.0, "hostile": true,
		"color": Color8(62, 39, 35), "size": Vector3(1.1, 1.6, 0.6),
		"aggro": 18.0, "cooldown": 1.2, "hunts": true},
	"deer": {"health": 40.0, "speed": 7.0, "damage": 0.0, "hostile": false,
		"color": Color8(193, 154, 107), "size": Vector3(0.5, 1.1, 0.9), "prey": true},
	# Short-sighted and short-tempered: a boar will not cross the map for
	# you the way a wolf does, but walk into one and it commits. That gap
	# between the deer you hunt and the wolf that hunts you is the point.
	"boar": {"health": 80.0, "speed": 4.5, "damage": 15.0, "hostile": true,
		"color": Color8(96, 74, 58), "size": Vector3(0.6, 1.0, 1.1),
		"aggro": 11.0, "cooldown": 1.4},
	# Small game. A rabbit is fast and worth almost nothing; a chicken is
	# slow and lays as it wanders. Both are day-one food, and both are what
	# a wolf goes for when you are not the nearest warm thing.
	"rabbit": {"health": 18.0, "speed": 8.5, "damage": 0.0, "hostile": false,
		"color": Color8(198, 180, 160), "size": Vector3(0.3, 0.35, 0.5), "prey": true},
	"chicken": {"health": 15.0, "speed": 3.2, "damage": 0.0, "hostile": false,
		"color": Color8(245, 240, 230), "size": Vector3(0.28, 0.45, 0.4), "prey": true},
	"scientist": {"health": 90.0, "speed": 4.0, "damage": 13.0, "hostile": true,
		"color": Color8(38, 84, 124), "size": Vector3(0.6, 1.8, 0.4),
		"aggro": 45.0, "cooldown": 1.3, "ranged": true, "range": 45.0,
		"standoff": 12.0, "leash": 65.0, "opens_doors": true, "accuracy": 0.8},
}

const LOOT := {
	"wolf": {"cloth": 10, "leather": 5, "raw_meat": 2, "bone": 2},
	"bear": {"cloth": 15, "leather": 10, "raw_meat": 4, "bone": 6},
	"deer": {"raw_meat": 3, "leather": 2, "cloth": 2, "bone": 2, "antlers": 1},
	# The best meat in the game, and it fights back for it.
	"boar": {"raw_meat": 6, "leather": 4, "cloth": 3, "bone": 3, "tusks": 1},
	"rabbit": {"raw_meat": 1, "leather": 1, "bone": 1},
	"chicken": {"raw_meat": 1, "feather": 4, "egg": 1, "bone": 1},
	"scientist": {"scrap": 15, "frag": 25, "ammo_rifle": 5, "cloth": 5},
}

## How hard a guard works on a door that is in its way.
const DOOR_DAMAGE := 8.0

## How far a predator will look for something smaller once the sun is down.
const PREDATION_RANGE := 40.0
## How close another of its own kind has to be to count as pack, and what
## having one alongside is worth. A lone wolf is a nuisance; three of them
## working the same clearing is the reason to be indoors after dark.
const PACK_RADIUS := 14.0
const PACK_BONUS := 0.35
const PACK_MAX := 2

var npc_type := "wolf"
var health := 50.0
var world: Node3D
## Where this creature was put down. Guards come back to it.
var home := Vector3.ZERO
var _cfg: Dictionary
var _attack_cd := 0.0
var _dead := false
var _visual: Node3D  # Blender model, when one exists for this species
var _mat: StandardMaterial3D  # only set by the primitive fallback
var _wander_dir := Vector3.ZERO
## How far a posted guard may drift from where it stands, in metres.
const PATROL_RADIUS := 6.0

var _wander_timer := 0.0
## Seconds left held in a bear trap. Nothing moves while this is running.
var _snared := 0.0


func setup(t: String, w: Node3D) -> void:
	npc_type = t
	world = w
	_cfg = TYPES[t]
	health = _cfg.health
	collision_layer = 8
	# Structures and world props only. This was 0, and every creature moved
	# by assigning position directly, so wolves and bears walked straight
	# through walls and a base offered no protection at all.
	#
	# Terrain is deliberately left out: height is snapped every frame in
	# _physics_process, and having the body also collide with the terrain
	# trimesh made creatures grind to a halt against their own footing.
	collision_mask = 2 | 4

	_visual = ModelRegistry.spawn("npc_" + t)
	if _visual != null:
		add_child(_visual)
	else:
		_build_fallback_visual()

	var cs := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = _cfg.size
	cs.shape = shape
	cs.position.y = _cfg.size.y * 0.5
	add_child(cs)


## Flat-coloured body + head block (+ rifle for a guard), used only when
## this species' Blender model is missing. Kept as a safety net rather than
## a hard dependency, same as every other system in ModelRegistry.
func _build_fallback_visual() -> void:
	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = _cfg.size
	_mat = StandardMaterial3D.new()
	_mat.albedo_color = _cfg.color
	box.material = _mat
	mi.mesh = box
	mi.position.y = _cfg.size.y * 0.5
	add_child(mi)

	var head := MeshInstance3D.new()
	var head_mesh := BoxMesh.new()
	head_mesh.size = Vector3(_cfg.size.x * 0.5, _cfg.size.x * 0.5, _cfg.size.x * 0.5)
	head_mesh.material = _mat
	head.mesh = head_mesh
	head.position = Vector3(0, _cfg.size.y * 0.95, -_cfg.size.z * 0.55)
	add_child(head)

	if _cfg.get("ranged", false):
		var rifle := MeshInstance3D.new()
		var rifle_mesh := BoxMesh.new()
		rifle_mesh.size = Vector3(0.08, 0.12, 0.9)
		var rifle_mat := StandardMaterial3D.new()
		rifle_mat.albedo_color = Color8(40, 36, 34)
		rifle_mat.metallic = 0.6
		rifle_mesh.material = rifle_mat
		rifle.mesh = rifle_mesh
		rifle.position = Vector3(_cfg.size.x * 0.6, _cfg.size.y * 0.62, -0.35)
		add_child(rifle)


func _ready() -> void:
	if home == Vector3.ZERO:
		home = position


func _physics_process(delta: float) -> void:
	if _dead or world == null or world.player == null:
		return
	# Before the game starts the world still moves — the main menu looks out
	# over it, and a settlement where nothing walks is a photograph. But
	# nothing hunts a player who has not started playing: everything falls
	# back to wandering.
	if not world.started:
		# A posted guard keeps its post: patrolling drifts around home, where
		# free wandering walked them off the monument they are there to
		# protect while the player sat in the menu.
		if float(_cfg.get("leash", 0.0)) > 0.0:
			_patrol(delta)
		else:
			_passive_ai(world.player, 999.0, delta)
		position.y = world.ground_height_at(position.x, position.z)
		return
	_attack_cd = maxf(0.0, _attack_cd - delta)

	# Held in a trap: it can still be shot, it just cannot go anywhere, and
	# the jaws keep working on it the whole time.
	if _snared > 0.0:
		_snared -= delta
		npc_take_damage(Game.BARRICADE_DPS * 0.4 * delta, false)
		return

	var player: Node3D = world.player
	var dist := position.distance_to(player.position)

	if _cfg.hostile:
		_hostile_ai(player, dist, delta)
	else:
		_passive_ai(player, dist, delta)

	# Stay glued to the ground — including a base's floor, which creatures
	# step onto rather than wade through
	position.y = world.ground_height_at(position.x, position.z)
	_bleed_on_barricades(delta)


## Barbed wire and steel plate. Anything that pushes into a barricade pays
## for it every second it stays there, which is what turns a ring of them
## into a perimeter rather than a fence.
func _bleed_on_barricades(delta: float) -> void:
	for b in world.barricades:
		if not is_instance_valid(b):
			continue
		if position.distance_to(b.position) > Game.BARRICADE_RADIUS:
			continue
		npc_take_damage(Game.BARRICADE_DPS * delta)
		return


func _hostile_ai(player: Node3D, dist: float, delta: float) -> void:
	# A guard that has strayed too far from its post walks back instead of
	# chasing you across the map.
	var leash := float(_cfg.get("leash", 0.0))
	if leash > 0.0 and position.distance_to(home) > leash:
		var back := home - position
		back.y = 0.0
		if back.length() > 1.0:
			_face(home)
			_walk(back.normalized(), _cfg.speed)
			return

	if dist >= float(_cfg.get("aggro", 18.0)):
		# Out of reach of the player. After dark a predator goes looking for
		# whatever else is out there instead of standing around.
		if _cfg.get("hunts", false) and world.is_night():
			var quarry := _nearest_prey()
			if quarry != null:
				_hunt(quarry)
				return
		if leash > 0.0:
			_patrol(delta)
		return

	_face(player.position)
	if _cfg.get("ranged", false):
		_ranged_attack(player, dist)
	else:
		_melee_attack(player, dist)


## Damage this creature deals right now. A pack animal with its own kind
## alongside hits harder for each of them, up to a cap — being surrounded is
## the danger, not any one bite.
func attack_damage() -> float:
	var base := float(_cfg.damage)
	if not _cfg.get("packs", false) or world == null:
		return base
	var mates := 0
	for c in world.get_children():
		if c == self or not c.has_method("is_prey"):
			continue
		if c.npc_type == npc_type and c.is_alive() \
				and position.distance_to(c.position) < PACK_RADIUS:
			mates += 1
			if mates >= PACK_MAX:
				break
	return base * (1.0 + PACK_BONUS * float(mates))


func _melee_attack(player: Node3D, dist: float) -> void:
	if dist > 1.5:
		var dir := (player.position - position)
		dir.y = 0.0
		_walk(dir.normalized(), _cfg.speed)
	if dist < 2.5 and _attack_cd <= 0.0:
		Game.hurt(attack_damage())
		_attack_cd = float(_cfg.get("cooldown", 1.2))
		Sfx.play("hit")


func is_prey() -> bool:
	return bool(_cfg.get("prey", false))


func is_alive() -> bool:
	return not _dead


## What turrets and traps shoot at. A defence that could not tell a wolf
## from a chicken would be out of ammunition by the second night.
func is_hostile() -> bool:
	return bool(_cfg.get("hostile", false))


## Caught in a bear trap: pinned in place until the jaws are worked open,
## and bleeding the whole time.
func snare(seconds: float) -> void:
	_snared = maxf(_snared, seconds)


## The nearest smaller thing worth running down. Only ever called at night,
## and only by something that hunts.
func _nearest_prey() -> Node3D:
	var best: Node3D = null
	var best_d := PREDATION_RANGE
	for c in world.get_children():
		if c == self or not c.has_method("is_prey"):
			continue
		if not c.is_prey() or not c.is_alive():
			continue
		var d: float = position.distance_to(c.position)
		if d < best_d:
			best_d = d
			best = c
	return best


## Run down and kill something that is not the player. This is what keeps
## the deer population honest without the player ever touching it.
func _hunt(quarry: Node3D) -> void:
	var dist := position.distance_to(quarry.position)
	_face(quarry.position)
	if dist > 1.5:
		var dir := (quarry.position - position)
		dir.y = 0.0
		if dir.length() > 0.01:
			_walk(dir.normalized(), _cfg.speed)
	if dist < 2.5 and _attack_cd <= 0.0:
		quarry.npc_take_damage(attack_damage(), false)
		_attack_cd = float(_cfg.get("cooldown", 1.2))


## Shoots whenever it can see you. When a wall is in the way it closes in
## instead, which is what walks it into your doorway.
func _ranged_attack(player: Node3D, dist: float) -> void:
	var clear := _can_see(player)
	if clear and dist <= float(_cfg.range):
		if dist < float(_cfg.get("standoff", 12.0)) * 0.6:
			# Too close for a rifle: back off to a comfortable firing distance
			var away := (position - player.position)
			away.y = 0.0
			_walk(away.normalized(), _cfg.speed * 0.7)
		if _attack_cd <= 0.0:
			_fire_at(player)
		return

	var dir := (player.position - position)
	dir.y = 0.0
	if dir.length() > 1.0:
		_walk(dir.normalized(), _cfg.speed)


## Guards miss, and they miss more the further out you are. Three of them
## landing every shot kills a full-health player in about three seconds,
## which would make the only source of high quality metal unapproachable.
func hit_chance(dist: float) -> float:
	var falloff := clampf(dist / float(_cfg.get("range", 45.0)), 0.0, 1.0)
	return float(_cfg.get("accuracy", 0.8)) * lerpf(1.0, 0.3, falloff)


func _fire_at(player: Node3D) -> void:
	_attack_cd = float(_cfg.get("cooldown", 1.3))
	var target := player.global_position + Vector3.UP * 1.0
	Sfx.play("explosion")
	if randf() > hit_chance(position.distance_to(player.position)):
		# A visible miss: the round goes wide, so being shot at still reads
		var wide := Vector3(randf_range(-1.5, 1.5), randf_range(-0.5, 1.5),
			randf_range(-1.5, 1.5))
		_tracer(_eye(), target + wide)
		return
	Game.hurt(float(_cfg.damage))
	_tracer(_eye(), target)


## Structures and world props block a shot. Terrain deliberately does not:
## creatures never collide with it (see setup), so a hill they are standing
## on must not be able to eat their own bullets.
func _can_see(player: Node3D) -> bool:
	var space := get_world_3d().direct_space_state
	if space == null:
		return true
	var query := PhysicsRayQueryParameters3D.create(
		_eye(), player.global_position + Vector3.UP * 1.0, 2 | 4, [get_rid()])
	return space.intersect_ray(query).is_empty()


func _eye() -> Vector3:
	return global_position + Vector3.UP * (float(_cfg.size.y) * 0.85)


## A thin line that fades out where the shot went, so being shot at from
## the treeline reads as gunfire and not as damage out of nowhere.
func _tracer(from: Vector3, to: Vector3) -> void:
	var span := from.distance_to(to)
	if span < 0.1 or world == null:
		return
	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(0.03, 0.03, span)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(1.0, 0.85, 0.4)
	mat.emission_enabled = true
	mat.emission = Color(1.0, 0.8, 0.3)
	mat.emission_energy_multiplier = 2.0
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	box.material = mat
	mi.mesh = box
	world.add_child(mi)
	mi.global_position = (from + to) * 0.5
	if not from.is_equal_approx(to):
		mi.look_at(to, Vector3.UP)
	var tw := mi.create_tween()
	tw.tween_property(mat, "albedo_color:a", 0.0, 0.12)
	tw.tween_callback(mi.queue_free)


## Guards drift around their post while nothing is happening — and only
## around it. The leash is sized for a chase and is far too loose to describe
## standing somewhere, so patrolling gets a tether of its own.
func _patrol(delta: float) -> void:
	_wander_timer -= delta
	var out := position - home
	out.y = 0.0
	if out.length() > PATROL_RADIUS:
		# Already too far: turn round now rather than at the end of the burst
		_wander_dir = -out.normalized()
		_wander_timer = maxf(_wander_timer, 1.0)
	elif _wander_timer <= 0.0:
		_wander_timer = randf_range(3.0, 7.0)
		if randf() < 0.4:
			_wander_dir = Vector3.ZERO
		else:
			var ang := randf() * TAU
			_wander_dir = Vector3(cos(ang), 0, sin(ang))
	if _wander_dir != Vector3.ZERO:
		_face(position + _wander_dir)
		_walk(_wander_dir, 1.6)


func _passive_ai(player: Node3D, dist: float, delta: float) -> void:
	if dist < 12.0:
		# Flee straight away from the player
		var away := (position - player.position)
		away.y = 0.0
		if away.length() > 0.01:
			away = away.normalized()
			_face(position + away)
			_walk(away, _cfg.speed)
		return
	# Calm wandering
	_wander_timer -= delta
	if _wander_timer <= 0.0:
		_wander_timer = randf_range(2.5, 6.0)
		if randf() < 0.35:
			_wander_dir = Vector3.ZERO  # graze for a while
		else:
			var ang := randf() * TAU
			_wander_dir = Vector3(cos(ang), 0, sin(ang))
	if _wander_dir != Vector3.ZERO:
		_face(position + _wander_dir)
		_walk(_wander_dir, 1.3)
		# Keep them inside the world
		position.x = clampf(position.x, -190.0, 190.0)
		position.z = clampf(position.z, -190.0, 190.0)


## Horizontal movement that respects collision, so walls actually stop a
## creature instead of it sliding through them.
func _walk(dir: Vector3, speed: float) -> void:
	velocity = Vector3(dir.x * speed, 0.0, dir.z * speed)
	move_and_slide()
	if _cfg.get("opens_doors", false):
		_force_doors()


## A door the guard has just walked into. An unlocked one it simply opens
## and follows you through; a locked one it has to break, which is the
## entire reason to spend metal on a lock.
func _force_doors() -> void:
	for i in get_slide_collision_count():
		var col: Object = get_slide_collision(i).get_collider()
		if col == null or not col.has_method("npc_open_door") or not col.is_door:
			continue
		if col.npc_open_door():
			return
		if _attack_cd <= 0.0:
			_attack_cd = float(_cfg.get("cooldown", 1.2))
			col.attack_lock(DOOR_DAMAGE, global_position)
			Sfx.play("hit")
		return


func _face(target: Vector3) -> void:
	var flat := Vector3(target.x, position.y, target.z)
	if not flat.is_equal_approx(position):
		look_at(flat, Vector3.UP)


## A brief red flash on taking damage. The fallback box shares one material
## it can flip emission on directly; a modelled creature has several meshes
## with their own baked colours, so it gets a temporary tint override instead.
func _flash_hit() -> void:
	if _mat != null:
		_mat.emission_enabled = true
		_mat.emission = Color(1, 0, 0)
		_mat.emission_energy_multiplier = 0.5
		var t := get_tree().create_timer(0.1)
		t.timeout.connect(func():
			if is_instance_valid(self):
				_mat.emission_enabled = false)
	elif _visual != null:
		ModelRegistry.tint(_visual, Color(1, 0, 0), 0.0, 0.6)
		var t := get_tree().create_timer(0.1)
		t.timeout.connect(func():
			if is_instance_valid(self):
				ModelRegistry.clear_tint(_visual))


## `credit_player` is false when something other than the player landed the
## blow — a wolf running down a deer, a turret covering a doorway. The kill
## still counts against the population, but nobody's pockets fill up with a
## carcass they were nowhere near.
func npc_take_damage(amount: float, credit_player: bool = true) -> void:
	if _dead:
		return
	health -= amount
	_flash_hit()
	if health <= 0.0:
		_die(credit_player)
	elif not _cfg.hostile:
		# A wounded deer panics: sprint away immediately
		_wander_timer = 0.0


func _die(credit_player: bool = true) -> void:
	_dead = true
	if credit_player:
		var loot: Dictionary = LOOT[npc_type]
		var total := 0
		for id in loot:
			Game.add_item(id, loot[id])
			total += int(loot[id])
		Game.notify("%s killed! +%d resources" % [npc_type.capitalize(), total],
			Color(0.9, 0.3, 0.3))
		Game.activity.emit("hunt", 1)

	# Everything that dies out here leaves a gap in the population, and the
	# world fills it again in its own time — slower the harder that species
	# has been worked lately. Guards come back to their post; wild animals
	# come back somewhere near where the last one lived.
	if world != null and world.has_method("queue_npc_respawn"):
		world.note_take(npc_type)
		world.queue_npc_respawn(npc_type, home)
	collision_layer = 0
	var tw := create_tween()
	tw.set_parallel(true)
	tw.tween_property(self, "scale", Vector3(0.05, 0.05, 0.05), 0.6)
	tw.tween_property(self, "position:y", position.y - 0.5, 0.6)
	tw.chain().tween_callback(queue_free)
