extends CharacterBody3D
## World creatures. Hostile (wolf/bear): chase-and-melee. Passive (deer):
## wanders and flees from the player, drops meat when hunted.
## Damage flash, loot drop and shrink-out death for all types.

const TYPES := {
	"wolf": {"health": 50.0, "speed": 5.0, "damage": 12.0, "hostile": true,
		"color": Color8(93, 64, 55), "size": Vector3(0.8, 1.4, 0.4)},
	"bear": {"health": 120.0, "speed": 3.0, "damage": 20.0, "hostile": true,
		"color": Color8(62, 39, 35), "size": Vector3(1.1, 1.6, 0.6)},
	"deer": {"health": 40.0, "speed": 7.0, "damage": 0.0, "hostile": false,
		"color": Color8(193, 154, 107), "size": Vector3(0.5, 1.1, 0.9)},
}

const LOOT := {
	"wolf": {"cloth": 10, "leather": 5, "raw_meat": 2},
	"bear": {"cloth": 15, "leather": 10, "raw_meat": 4},
	"deer": {"raw_meat": 3, "leather": 2, "cloth": 2},
}

var npc_type := "wolf"
var health := 50.0
var world: Node3D
var _cfg: Dictionary
var _attack_cd := 0.0
var _dead := false
var _mat: StandardMaterial3D
var _wander_dir := Vector3.ZERO
var _wander_timer := 0.0


func setup(t: String, w: Node3D) -> void:
	npc_type = t
	world = w
	_cfg = TYPES[t]
	health = _cfg.health
	collision_layer = 8
	collision_mask = 0

	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = _cfg.size
	_mat = StandardMaterial3D.new()
	_mat.albedo_color = _cfg.color
	box.material = _mat
	mi.mesh = box
	mi.position.y = _cfg.size.y * 0.5
	add_child(mi)

	# Small head block so creatures read as animals, not crates
	var head := MeshInstance3D.new()
	var head_mesh := BoxMesh.new()
	head_mesh.size = Vector3(_cfg.size.x * 0.5, _cfg.size.x * 0.5, _cfg.size.x * 0.5)
	head_mesh.material = _mat
	head.mesh = head_mesh
	head.position = Vector3(0, _cfg.size.y * 0.95, -_cfg.size.z * 0.55)
	add_child(head)

	var cs := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = _cfg.size
	cs.shape = shape
	cs.position.y = _cfg.size.y * 0.5
	add_child(cs)


func _physics_process(delta: float) -> void:
	if _dead or world == null or world.player == null or not world.started:
		return
	_attack_cd = maxf(0.0, _attack_cd - delta)

	var player: Node3D = world.player
	var dist := position.distance_to(player.position)

	if _cfg.hostile:
		_hostile_ai(player, dist, delta)
	else:
		_passive_ai(player, dist, delta)

	# Stay glued to the terrain
	position.y = world.terrain_height(position.x, position.z)


func _hostile_ai(player: Node3D, dist: float, delta: float) -> void:
	if dist >= 18.0:
		return
	_face(player.position)
	if dist > 1.5:
		var dir := (player.position - position)
		dir.y = 0.0
		position += dir.normalized() * _cfg.speed * delta
	if dist < 2.5 and _attack_cd <= 0.0:
		Game.stats.health -= _cfg.damage
		_attack_cd = 1.2
		Sfx.play("hit")


func _passive_ai(player: Node3D, dist: float, delta: float) -> void:
	if dist < 12.0:
		# Flee straight away from the player
		var away := (position - player.position)
		away.y = 0.0
		if away.length() > 0.01:
			away = away.normalized()
			_face(position + away)
			position += away * _cfg.speed * delta
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
		position += _wander_dir * 1.3 * delta
		# Keep them inside the world
		position.x = clampf(position.x, -190.0, 190.0)
		position.z = clampf(position.z, -190.0, 190.0)


func _face(target: Vector3) -> void:
	var flat := Vector3(target.x, position.y, target.z)
	if not flat.is_equal_approx(position):
		look_at(flat, Vector3.UP)


func npc_take_damage(amount: float) -> void:
	if _dead:
		return
	health -= amount
	_mat.emission_enabled = true
	_mat.emission = Color(1, 0, 0)
	_mat.emission_energy_multiplier = 0.5
	var t := get_tree().create_timer(0.1)
	t.timeout.connect(func():
		if is_instance_valid(self):
			_mat.emission_enabled = false)
	if health <= 0.0:
		_die()
	elif not _cfg.hostile:
		# A wounded deer panics: sprint away immediately
		_wander_timer = 0.0


func _die() -> void:
	_dead = true
	var loot: Dictionary = LOOT[npc_type]
	var total := 0
	for id in loot:
		Game.add_item(id, loot[id])
		total += int(loot[id])
	Game.notify("%s killed! +%d resources" % [npc_type.capitalize(), total], Color(0.9, 0.3, 0.3))
	collision_layer = 0
	var tw := create_tween()
	tw.set_parallel(true)
	tw.tween_property(self, "scale", Vector3(0.05, 0.05, 0.05), 0.6)
	tw.tween_property(self, "position:y", position.y - 0.5, 0.6)
	tw.chain().tween_callback(queue_free)
