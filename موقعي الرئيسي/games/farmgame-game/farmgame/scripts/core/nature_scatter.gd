extends Node3D
## يوزّع عناصر بيئية (أشجار/صخور/شجيرات) حول محيط المزرعة بمواقع عشوائية ثابتة
##
## نماذج Nature Kit مصمَّمة بحجم أصغر بكثير من تناسب شخصية اللاعب الواقعية (1.8 وحدة طولاً) -
## مثلاً السياج ارتفاعه الأصلي 0.345 فقط والشجرة 1.2-1.7. لذا كل نموذج له معامل تكبير مستقل
## بدل استخدام حجمه الافتراضي، حتى يبدو العالم متناسباً مع حجم اللاعب الحقيقي.

const PROP_SCALES: Dictionary = {
	"res://assets/models/nature/tree_default.glb": 3.2,
	"res://assets/models/nature/tree_oak.glb": 3.2,
	"res://assets/models/nature/tree_pineTallA_detailed.glb": 3.2,
	"res://assets/models/nature/rock_largeA.glb": 3.0,
	"res://assets/models/nature/rock_smallA.glb": 2.2,
	"res://assets/models/nature/rock_tallA.glb": 3.0,
	"res://assets/models/nature/plant_bushLarge.glb": 3.5,
	"res://assets/models/nature/flower_yellowA.glb": 2.0,
	"res://assets/models/nature/flower_purpleA.glb": 2.0,
	"res://assets/models/nature/flower_redA.glb": 2.0,
	"res://assets/models/nature/mushroom_red.glb": 2.0,
	"res://assets/models/nature/stump_round.glb": 2.5,
	"res://assets/models/nature/log_stack.glb": 2.5,
}

const PROP_COUNT: int = 140
const SCATTER_SEED: int = 20260721
const GROUND_HALF_EXTENT: float = 37.0
const FARM_CLEARANCE: float = 6.0
const WINDMILL_CENTER: Vector2 = Vector2(-20.0, -15.0)
const WINDMILL_CLEARANCE: float = 6.0

var _prop_paths: Array = PROP_SCALES.keys()


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

		var prop_path: String = _prop_paths[rng.randi_range(0, _prop_paths.size() - 1)]
		var prop_scene: PackedScene = load(prop_path)
		var prop: Node3D = prop_scene.instantiate()
		add_child(prop)
		prop.position = Vector3(x, 0, z)
		prop.rotate_y(rng.randf_range(0, TAU))
		prop.scale = Vector3.ONE * float(PROP_SCALES[prop_path])
		PropMaterialFix.remove_metallic(prop)
		placed += 1
