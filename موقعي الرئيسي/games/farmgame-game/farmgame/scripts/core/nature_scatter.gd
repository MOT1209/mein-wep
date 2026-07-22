extends Node3D
## يوزّع عناصر بيئية (أشجار/صخور/شجيرات) حول محيط المزرعة بمواقع عشوائية ثابتة

const PROP_SCENES: Array[PackedScene] = [
	preload("res://assets/models/nature/tree_default.glb"),
	preload("res://assets/models/nature/tree_oak.glb"),
	preload("res://assets/models/nature/tree_pineTallA_detailed.glb"),
	preload("res://assets/models/nature/rock_largeA.glb"),
	preload("res://assets/models/nature/rock_smallA.glb"),
	preload("res://assets/models/nature/rock_tallA.glb"),
	preload("res://assets/models/nature/plant_bushLarge.glb"),
	preload("res://assets/models/nature/flower_yellowA.glb"),
	preload("res://assets/models/nature/flower_purpleA.glb"),
	preload("res://assets/models/nature/flower_redA.glb"),
	preload("res://assets/models/nature/mushroom_red.glb"),
	preload("res://assets/models/nature/stump_round.glb"),
	preload("res://assets/models/nature/log_stack.glb"),
]

const PROP_COUNT: int = 140
const SCATTER_SEED: int = 20260721
const GROUND_HALF_EXTENT: float = 37.0
const FARM_CLEARANCE: float = 6.0
const WINDMILL_CENTER: Vector2 = Vector2(-20.0, -15.0)
const WINDMILL_CLEARANCE: float = 6.0


func _ready() -> void:
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = SCATTER_SEED

	var placed: int = 0
	var attempts: int = 0
	while placed < PROP_COUNT and attempts < PROP_COUNT * 10:
		attempts += 1
		var x: float = rng.randf_range(-GROUND_HALF_EXTENT, GROUND_HALF_EXTENT)
		var z: float = rng.randf_range(-GROUND_HALF_EXTENT, GROUND_HALF_EXTENT)
		if absf(x) < FARM_CLEARANCE and absf(z) < FARM_CLEARANCE:
			continue
		if Vector2(x, z).distance_to(WINDMILL_CENTER) < WINDMILL_CLEARANCE:
			continue

		var prop_scene: PackedScene = PROP_SCENES[rng.randi_range(0, PROP_SCENES.size() - 1)]
		var prop: Node3D = prop_scene.instantiate()
		add_child(prop)
		prop.position = Vector3(x, 0, z)
		prop.rotate_y(rng.randf_range(0, TAU))
		PropMaterialFix.remove_metallic(prop)
		placed += 1
