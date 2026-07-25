extends Node3D
## يدير المباني في عالم المزرعة
## ينشئ مباني باستخدام نماذج .glb مصممة خصيصاً (Blender)، مع صناديق تصادم بسيطة مطابقة لحجمها

const BUILDING_SCALE: float = 1.0
const CraftStationScene: PackedScene = preload("res://scenes/entities/craft_station.tscn")

const HouseModel: PackedScene = preload("res://assets/models/buildings/house.glb")
const BarnModel: PackedScene = preload("res://assets/models/buildings/barn.glb")
const SiloModel: PackedScene = preload("res://assets/models/buildings/silo.glb")
const WellModel: PackedScene = preload("res://assets/models/buildings/well.glb")

## المحطات الأربع تغطي كل أنواع station في data/recipes.json
const CRAFT_STATIONS: Array[Dictionary] = [
	{"type": "oven", "name": "Oven", "position": Vector3(-13.0, 0.0, 4.0)},
	{"type": "juicer", "name": "Juicer", "position": Vector3(-13.0, 0.0, 7.0)},
	{"type": "cheese_maker", "name": "Cheese Maker", "position": Vector3(-13.0, 0.0, 10.0)},
	{"type": "crafting_table", "name": "Crafting Table", "position": Vector3(-13.0, 0.0, 13.0)},
]


func _ready() -> void:
	_create_barn()
	_create_house()
	_create_silo()
	_create_well()
	_create_craft_stations()


func _create_craft_stations() -> void:
	for station_data: Dictionary in CRAFT_STATIONS:
		var station: Node3D = CraftStationScene.instantiate()
		station.station_type = station_data["type"]
		station.station_name = station_data["name"]
		add_child(station)
		station.position = station_data["position"]


func _create_barn() -> void:
	var barn: Node3D = Node3D.new()
	barn.name = "Barn"
	add_child(barn)
	barn.position = Vector3(18.0, 0.0, -8.0)

	## النموذج المرئي
	var model: Node3D = BarnModel.instantiate()
	barn.add_child(model)

	## التصادم
	var body_static: StaticBody3D = StaticBody3D.new()
	body_static.name = "BarnCollision"
	barn.add_child(body_static)

	var body_col: CollisionShape3D = CollisionShape3D.new()
	body_col.shape = BoxShape3D.new()
	body_col.shape.size = Vector3(6.0, 4.0, 8.0)
	body_col.position = Vector3(0, 2.0, 0)
	body_static.add_child(body_col)

	## الإضاءة
	var light: OmniLight3D = OmniLight3D.new()
	light.position = Vector3(0, 4.0, 5.0)
	light.light_color = Color(1.0, 0.9, 0.7)
	light.light_energy = 0.5
	light.omni_range = 8.0
	barn.add_child(light)


func _create_house() -> void:
	var house: Node3D = Node3D.new()
	house.name = "House"
	add_child(house)
	house.position = Vector3(-18.0, 0.0, 8.0)

	## النموذج المرئي
	var model: Node3D = HouseModel.instantiate()
	house.add_child(model)

	## التصادم
	var body_static: StaticBody3D = StaticBody3D.new()
	body_static.name = "HouseCollision"
	house.add_child(body_static)

	var body_col: CollisionShape3D = CollisionShape3D.new()
	body_col.shape = BoxShape3D.new()
	body_col.shape.size = Vector3(5.0, 3.5, 6.0)
	body_col.position = Vector3(0, 1.75, 0)
	body_static.add_child(body_col)


func _create_silo() -> void:
	var silo: Node3D = Node3D.new()
	silo.name = "Silo"
	add_child(silo)
	silo.position = Vector3(18.0, 0.0, 8.0)

	## النموذج المرئي
	var model: Node3D = SiloModel.instantiate()
	silo.add_child(model)

	## التصادم (أسطوانة تقريبها بـ CylinderShape3D)
	var body_static: StaticBody3D = StaticBody3D.new()
	body_static.name = "SiloCollision"
	silo.add_child(body_static)

	var body_col: CollisionShape3D = CollisionShape3D.new()
	body_col.shape = CylinderShape3D.new()
	body_col.shape.radius = 2.0
	body_col.shape.height = 8.0
	body_col.position = Vector3(0, 4.0, 0)
	body_static.add_child(body_col)


func _create_well() -> void:
	var well: Node3D = Node3D.new()
	well.name = "Well"
	add_child(well)
	well.position = Vector3(-18.0, 0.0, -8.0)

	## النموذج المرئي
	var model: Node3D = WellModel.instantiate()
	well.add_child(model)

	## التصادم (القاعدة الحجرية)
	var base_static: StaticBody3D = StaticBody3D.new()
	base_static.name = "WellCollision"
	well.add_child(base_static)

	var base_col: CollisionShape3D = CollisionShape3D.new()
	base_col.shape = CylinderShape3D.new()
	base_col.shape.radius = 1.4
	base_col.shape.height = 1.5
	base_col.position = Vector3(0, 0.75, 0)
	base_static.add_child(base_col)


func get_building_positions() -> Dictionary:
	return {
		"barn": Vector3(18.0, 0.0, -8.0),
		"house": Vector3(-18.0, 0.0, 8.0),
		"silo": Vector3(18.0, 0.0, 8.0),
		"well": Vector3(-18.0, 0.0, -8.0),
	}
