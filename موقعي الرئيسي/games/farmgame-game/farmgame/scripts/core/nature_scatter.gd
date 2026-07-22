extends Node3D
## يوزّع عناصر بيئية حول محيط المزرعة بمواقع عشوائية ثابتة
##
## المصدر الأساسي: Quaternius' Stylized Nature MegaKit (CC0, عبر Godot Asset Store) - مقاييسه
## الحقيقية مُتحقَّق منها (سكربت AABB headless) فجاءت واقعية مباشرة (أشجار 7-9 أمتار) فلا تحتاج
## تكبيراً كبيراً، على عكس Nature Kit القديم. عنصران فقط (الجذع وكومة الحطب) لا يزالان من
## Nature Kit القديم لعدم وجود بديل مكافئ في المجموعة الجديدة، فيحتاجان معامل تكبير + إصلاح
## المعدنية (PropMaterialFix) كما في farm_fence.gd.

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

const LEGACY_KIT_PREFIX: String = "res://assets/models/nature/"

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
		if prop_path.begins_with(LEGACY_KIT_PREFIX):
			PropMaterialFix.remove_metallic(prop)
		placed += 1
