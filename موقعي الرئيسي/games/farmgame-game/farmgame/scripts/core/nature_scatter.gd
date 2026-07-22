extends Node3D
## يوزّع عناصر بيENVية حول محيط المزرعة بمواقع عشوائية ثابتة
##
## المصدر الأساسي: Quaternius' Stylized Nature MegaKit (CC0, عبر Godot Asset Store) - مقاييسه
## الحقيقية مُتحقَّق منها (سكربت AABB headless) فجاءت واقعية مباشرة (أشجار 7-9 أمتار) فلا تحتاج
## تكبيراً كبيراً، على عكس Nature Kit القديم. عنصران فقط (الجذع وكومة الحطب) لا يزالان من
## Nature Kit القديم لعدم وجود بديل مكافئ في المجموعة الجديدة، فيحتاجان معامل تكبير + إصلاح
## المعدنية (PropMaterialFix) كما في farm_fence.gd.
##
## تم تحديثه لاستبعاد منطقة المزرعة الموسعة (12×12) والمباني الجديدة

const PROP_SCALES: Dictionary = {
	"res://assets/models/megakit/CommonTree_1.gltf": 1.0,
	"res://assets/models/megakit/CommonTree_2.gltf": 1.0,
	"res://assets/models/megakit/CommonTree_3.gltf": 1.0,
	"res://assets/models/megakit/Bush_Common.gltf": 0.65,
	"res://assets/models/megakit/Grass_Common_Short.gltf": 0.4,
	"res://assets/models/megakit/Grass_Common_Tall.gltf": 0.45,
	"res://assets/models/megakit/Mushroom_Common.gltf": 0.8,
	"res://assets/models/megakit/Pebble_Round_1.gltf": 1.4,
	"res://assets/models/megakit/Pebble_Square_1.gltf": 1.4,
	"res://assets/models/megakit/Flower_3_Single.gltf": 0.25,
	"res://assets/models/megakit/Clover_1.gltf": 0.26,
	"res://assets/models/nature/stump_round.glb": 2.5,
	"res://assets/models/nature/log_stack.glb": 2.5,
}

## حجم التصادم لكل نبات (العرض، الارتفاع، العمق)
const PROP_COLLISION_SIZES: Dictionary = {
	"res://assets/models/megakit/CommonTree_1.gltf": Vector3(1.5, 8.0, 1.5),
	"res://assets/models/megakit/CommonTree_2.gltf": Vector3(1.5, 8.0, 1.5),
	"res://assets/models/megakit/CommonTree_3.gltf": Vector3(1.5, 8.0, 1.5),
	"res://assets/models/megakit/Bush_Common.gltf": Vector3(1.5, 1.5, 1.5),
	"res://assets/models/megakit/Pebble_Round_1.gltf": Vector3(1.5, 1.0, 1.5),
	"res://assets/models/megakit/Pebble_Square_1.gltf": Vector3(1.5, 1.0, 1.5),
	"res://assets/models/nature/stump_round.glb": Vector3(1.5, 1.5, 1.5),
	"res://assets/models/nature/log_stack.glb": Vector3(1.5, 1.0, 1.5),
}

const LEGACY_KIT_PREFIX: String = "res://assets/models/nature/"

const PROP_COUNT: int = 180
const SCATTER_SEED: int = 20260721
const GROUND_HALF_EXTENT: float = 45.0
const FARM_CLEARANCE: float = 14.0
const WINDMILL_CENTER: Vector2 = Vector2(-15.38, -16.53)
const WINDMILL_CLEARANCE: float = 6.0
const WINDMILL2_CENTER: Vector2 = Vector2(-2.81, -15.0)
const WINDMILL2_CLEARANCE: float = 6.0
const BARN_CENTER: Vector2 = Vector2(18.0, -8.0)
const BARN_CLEARANCE: float = 5.0
const HOUSE_CENTER: Vector2 = Vector2(-18.0, 8.0)
const HOUSE_CLEARANCE: float = 5.0
const SILO_CENTER: Vector2 = Vector2(18.0, 8.0)
const SILO_CLEARANCE: float = 4.0
const WELL_CENTER: Vector2 = Vector2(-18.0, -8.0)
const WELL_CLEARANCE: float = 3.0

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
		if Vector2(x, z).distance_to(WINDMILL2_CENTER) < WINDMILL2_CLEARANCE:
			continue
		if Vector2(x, z).distance_to(BARN_CENTER) < BARN_CLEARANCE:
			continue
		if Vector2(x, z).distance_to(HOUSE_CENTER) < HOUSE_CLEARANCE:
			continue
		if Vector2(x, z).distance_to(SILO_CENTER) < SILO_CLEARANCE:
			continue
		if Vector2(x, z).distance_to(WELL_CENTER) < WELL_CLEARANCE:
			continue

		var prop_path: String = _prop_paths[rng.randi_range(0, _prop_paths.size() - 1)]
		var prop_scene: PackedScene = load(prop_path)
		var prop: Node3D = prop_scene.instantiate()
		add_child(prop)
		prop.position = Vector3(x, 0, z)
		prop.rotate_y(rng.randf_range(0, TAU))
		prop.scale = Vector3.ONE * float(PROP_SCALES[prop_path])
		if prop_path.begins_with(LEGACY_KIT_PREFIX):
			PropMaterialFix.remove_metallic(prop)

		## إضافة تصادم للعناصر الكبيرة
		if PROP_COLLISION_SIZES.has(prop_path):
			var static_body: StaticBody3D = StaticBody3D.new()
			static_body.name = "NatureCollision"
			add_child(static_body)
			static_body.position = prop.position
			static_body.rotation = prop.rotation

			var col_size: Vector3 = PROP_COLLISION_SIZES[prop_path]
			var col: CollisionShape3D = CollisionShape3D.new()
			col.shape = BoxShape3D.new()
			col.shape.size = col_size
			col.position = Vector3(0, col_size.y * 0.5, 0)
			static_body.add_child(col)

		placed += 1
