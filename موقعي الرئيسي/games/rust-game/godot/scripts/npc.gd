extends CharacterBody3D
## Hostile NPC (wolf / bear). Simple chase-and-melee AI clamped to the
## terrain height, with damage flash, loot drop and shrink-out death.

var npc_type := "wolf"
var health := 50.0
var world: Node3D
var _attack_cd := 0.0
var _dead := false
var _mat: StandardMaterial3D


func setup(t: String, w: Node3D) -> void:
	npc_type = t
	world = w
	health = 120.0 if t == "bear" else 50.0
	collision_layer = 8
	collision_mask = 0

	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(0.8, 1.4, 0.4)
	_mat = StandardMaterial3D.new()
	_mat.albedo_color = Color8(93, 64, 55) if t == "wolf" else Color8(62, 39, 35)
	box.material = _mat
	mi.mesh = box
	mi.position.y = 0.7
	add_child(mi)

	var cs := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(0.8, 1.4, 0.4)
	cs.shape = shape
	cs.position.y = 0.7
	add_child(cs)


func _physics_process(delta: float) -> void:
	if _dead or world == null or world.player == null or not world.started:
		return
	_attack_cd = maxf(0.0, _attack_cd - delta)

	var player: Node3D = world.player
	var dist := position.distance_to(player.position)
	var aggro_range := 18.0
	var attack_range := 2.5

	if dist < aggro_range:
		var target := Vector3(player.position.x, position.y, player.position.z)
		if not target.is_equal_approx(position):
			look_at(target, Vector3.UP)
		if dist > attack_range - 1.0:
			var dir := (player.position - position)
			dir.y = 0.0
			dir = dir.normalized()
			var speed := 3.0 if npc_type == "bear" else 5.0
			position += dir * speed * delta
		if dist < attack_range and _attack_cd <= 0.0:
			Game.stats.health -= 20.0 if npc_type == "bear" else 12.0
			_attack_cd = 1.2
			Sfx.play("hit")

	# Stay glued to the terrain
	position.y = world.terrain_height(position.x, position.z)


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


func _die() -> void:
	_dead = true
	var loot := {"cloth": 10, "leather": 5} if npc_type == "wolf" else {"cloth": 15, "leather": 10}
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
