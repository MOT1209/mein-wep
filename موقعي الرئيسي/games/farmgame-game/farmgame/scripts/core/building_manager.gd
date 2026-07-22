extends Node3D
## يدير المباني في عالم المزرعة
## ينشئ مباني باستخدام أشكال بسيطة (primitives) لأننا لا نملك نماذج مباني جاهزة

const BUILDING_SCALE: float = 1.0
const CraftStationScene: PackedScene = preload("res://scenes/entities/craft_station.tscn")

## المحطات الأربع تغطي كل أنواع station في data/recipes.json
const CRAFT_STATIONS: Array[Dictionary] = [
	{"type": "oven", "name": "Oven", "position": Vector3(-13.0, 0.0, 4.0)},
	{"type": "juicer", "name": "Juicer", "position": Vector3(-13.0, 0.0, 7.0)},
	{"type": "cheese_maker", "name": "Cheese Maker", "position": Vector3(-13.0, 0.0, 10.0)},
	{"type": "crafting_table", "name": "Crafting Table", "position": Vector3(-13.0, 0.0, 13.0)},
]

## ألوان المباني
const BARN_COLOR: Color = Color(0.6, 0.2, 0.2)
const HOUSE_COLOR: Color = Color(0.8, 0.7, 0.5)
const SILO_COLOR: Color = Color(0.5, 0.5, 0.5)
const WELL_COLOR: Color = Color(0.4, 0.4, 0.4)
const ROOF_COLOR: Color = Color(0.4, 0.15, 0.1)
const WOOD_COLOR: Color = Color(0.5, 0.35, 0.2)


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

	## جسم المبنى
	var body: MeshInstance3D = MeshInstance3D.new()
	body.mesh = BoxMesh.new()
	body.mesh.size = Vector3(6.0, 4.0, 8.0)
	body.position = Vector3(0, 2.0, 0)
	barn.add_child(body)

	var body_mat: StandardMaterial3D = StandardMaterial3D.new()
	body_mat.albedo_color = BARN_COLOR
	body_mat.roughness = 0.8
	body.material_override = body_mat

	## التصادم
	var body_static: StaticBody3D = StaticBody3D.new()
	body_static.name = "BarnCollision"
	barn.add_child(body_static)

	var body_col: CollisionShape3D = CollisionShape3D.new()
	body_col.shape = BoxShape3D.new()
	body_col.shape.size = Vector3(6.0, 4.0, 8.0)
	body_col.position = Vector3(0, 2.0, 0)
	body_static.add_child(body_col)

	## السقف
	var roof: MeshInstance3D = MeshInstance3D.new()
	roof.mesh = PrismMesh.new()
	roof.mesh.size = Vector3(7.0, 3.0, 9.0)
	roof.position = Vector3(0, 5.5, 0)
	barn.add_child(roof)

	var roof_mat: StandardMaterial3D = StandardMaterial3D.new()
	roof_mat.albedo_color = ROOF_COLOR
	roof_mat.roughness = 0.7
	roof.material_override = roof_mat

	## الباب
	var door: MeshInstance3D = MeshInstance3D.new()
	door.mesh = BoxMesh.new()
	door.mesh.size = Vector3(2.0, 3.0, 0.2)
	door.position = Vector3(0, 1.5, 4.1)
	barn.add_child(door)

	var door_mat: StandardMaterial3D = StandardMaterial3D.new()
	door_mat.albedo_color = WOOD_COLOR
	door_mat.roughness = 0.9
	door.material_override = door_mat

	## النافذة
	var window1: MeshInstance3D = MeshInstance3D.new()
	window1.mesh = BoxMesh.new()
	window1.mesh.size = Vector3(1.5, 1.5, 0.2)
	window1.position = Vector3(2.5, 2.5, 4.1)
	barn.add_child(window1)

	var window_mat: StandardMaterial3D = StandardMaterial3D.new()
	window_mat.albedo_color = Color(0.6, 0.8, 1.0)
	window_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	window_mat.albedo_color.a = 0.7
	window1.material_override = window_mat

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

	## جسم المبنى
	var body: MeshInstance3D = MeshInstance3D.new()
	body.mesh = BoxMesh.new()
	body.mesh.size = Vector3(5.0, 3.5, 6.0)
	body.position = Vector3(0, 1.75, 0)
	house.add_child(body)

	var body_mat: StandardMaterial3D = StandardMaterial3D.new()
	body_mat.albedo_color = HOUSE_COLOR
	body_mat.roughness = 0.7
	body.material_override = body_mat

	## التصادم
	var body_static: StaticBody3D = StaticBody3D.new()
	body_static.name = "HouseCollision"
	house.add_child(body_static)

	var body_col: CollisionShape3D = CollisionShape3D.new()
	body_col.shape = BoxShape3D.new()
	body_col.shape.size = Vector3(5.0, 3.5, 6.0)
	body_col.position = Vector3(0, 1.75, 0)
	body_static.add_child(body_col)

	## السقف
	var roof: MeshInstance3D = MeshInstance3D.new()
	roof.mesh = PrismMesh.new()
	roof.mesh.size = Vector3(6.0, 2.5, 7.0)
	roof.position = Vector3(0, 4.75, 0)
	house.add_child(roof)

	var roof_mat: StandardMaterial3D = StandardMaterial3D.new()
	roof_mat.albedo_color = ROOF_COLOR
	roof_mat.roughness = 0.7
	roof.material_override = roof_mat

	## الباب
	var door: MeshInstance3D = MeshInstance3D.new()
	door.mesh = BoxMesh.new()
	door.mesh.size = Vector3(1.2, 2.5, 0.2)
	door.position = Vector3(0, 1.25, 3.1)
	house.add_child(door)

	var door_mat: StandardMaterial3D = StandardMaterial3D.new()
	door_mat.albedo_color = WOOD_COLOR
	door_mat.roughness = 0.9
	door.material_override = door_mat

	## النوافذ (2 نافذة)
	for i in range(2):
		var window1: MeshInstance3D = MeshInstance3D.new()
		window1.mesh = BoxMesh.new()
		window1.mesh.size = Vector3(1.0, 1.0, 0.2)
		window1.position = Vector3(-1.5 + i * 3.0, 2.0, 3.1)
		house.add_child(window1)

		var window_mat: StandardMaterial3D = StandardMaterial3D.new()
		window_mat.albedo_color = Color(0.6, 0.8, 1.0)
		window_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		window_mat.albedo_color.a = 0.7
		window1.material_override = window_mat

	## المدخنة
	var chimney: MeshInstance3D = MeshInstance3D.new()
	chimney.mesh = CylinderMesh.new()
	chimney.mesh.top_radius = 0.3
	chimney.mesh.bottom_radius = 0.4
	chimney.mesh.height = 2.0
	chimney.position = Vector3(1.5, 5.5, -1.0)
	house.add_child(chimney)

	var chimney_mat: StandardMaterial3D = StandardMaterial3D.new()
	chimney_mat.albedo_color = Color(0.4, 0.35, 0.3)
	chimney_mat.roughness = 0.9
	chimney.material_override = chimney_mat


func _create_silo() -> void:
	var silo: Node3D = Node3D.new()
	silo.name = "Silo"
	add_child(silo)
	silo.position = Vector3(18.0, 0.0, 8.0)

	## الهيكل الأسطواني
	var body: MeshInstance3D = MeshInstance3D.new()
	body.mesh = CylinderMesh.new()
	body.mesh.top_radius = 2.0
	body.mesh.bottom_radius = 2.0
	body.mesh.height = 8.0
	body.position = Vector3(0, 4.0, 0)
	silo.add_child(body)

	var body_mat: StandardMaterial3D = StandardMaterial3D.new()
	body_mat.albedo_color = SILO_COLOR
	body_mat.roughness = 0.6
	body.material_override = body_mat

	## التصادم (أسطوانة تقريبها بـ BoxShape3D)
	var body_static: StaticBody3D = StaticBody3D.new()
	body_static.name = "SiloCollision"
	silo.add_child(body_static)

	var body_col: CollisionShape3D = CollisionShape3D.new()
	body_col.shape = CylinderShape3D.new()
	body_col.shape.radius = 2.0
	body_col.shape.height = 8.0
	body_col.position = Vector3(0, 4.0, 0)
	body_static.add_child(body_col)

	## السقف المخروطي
	var roof: MeshInstance3D = MeshInstance3D.new()
	roof.mesh = CylinderMesh.new()
	roof.mesh.top_radius = 0.0
	roof.mesh.bottom_radius = 2.2
	roof.mesh.height = 2.0
	roof.position = Vector3(0, 9.0, 0)
	silo.add_child(roof)

	var roof_mat: StandardMaterial3D = StandardMaterial3D.new()
	roof_mat.albedo_color = ROOF_COLOR
	roof_mat.roughness = 0.7
	roof.material_override = roof_mat

	## الشريط الحديدي
	var band: MeshInstance3D = MeshInstance3D.new()
	band.mesh = TorusMesh.new()
	band.mesh.inner_radius = 2.05
	band.mesh.outer_radius = 2.15
	band.position = Vector3(0, 3.0, 0)
	silo.add_child(band)

	var band_mat: StandardMaterial3D = StandardMaterial3D.new()
	band_mat.albedo_color = Color(0.3, 0.3, 0.3)
	band_mat.metallic = 0.8
	band_mat.roughness = 0.3
	band.material_override = band_mat


func _create_well() -> void:
	var well: Node3D = Node3D.new()
	well.name = "Well"
	add_child(well)
	well.position = Vector3(-18.0, 0.0, -8.0)

	## القاعدة الحجرية
	var base: MeshInstance3D = MeshInstance3D.new()
	base.mesh = CylinderMesh.new()
	base.mesh.top_radius = 1.2
	base.mesh.bottom_radius = 1.4
	base.mesh.height = 1.5
	base.position = Vector3(0, 0.75, 0)
	well.add_child(base)

	var base_mat: StandardMaterial3D = StandardMaterial3D.new()
	base_mat.albedo_color = WELL_COLOR
	base_mat.roughness = 0.9
	base.material_override = base_mat

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

	## العمود الخشبي
	var pole1: MeshInstance3D = MeshInstance3D.new()
	pole1.mesh = CylinderMesh.new()
	pole1.mesh.top_radius = 0.1
	pole1.mesh.bottom_radius = 0.12
	pole1.mesh.height = 3.0
	pole1.position = Vector3(-0.8, 3.0, 0)
	well.add_child(pole1)

	var pole_mat: StandardMaterial3D = StandardMaterial3D.new()
	pole_mat.albedo_color = WOOD_COLOR
	pole_mat.roughness = 0.9
	pole1.material_override = pole_mat

	## العمود الثاني
	var pole2: MeshInstance3D = MeshInstance3D.new()
	pole2.mesh = CylinderMesh.new()
	pole2.mesh.top_radius = 0.1
	pole2.mesh.bottom_radius = 0.12
	pole2.mesh.height = 3.0
	pole2.position = Vector3(0.8, 3.0, 0)
	well.add_child(pole2)
	pole2.material_override = pole_mat

	## السقف
	var roof: MeshInstance3D = MeshInstance3D.new()
	roof.mesh = PrismMesh.new()
	roof.mesh.size = Vector3(2.5, 1.0, 2.0)
	roof.position = Vector3(0, 4.8, 0)
	well.add_child(roof)

	var roof_mat: StandardMaterial3D = StandardMaterial3D.new()
	roof_mat.albedo_color = ROOF_COLOR
	roof_mat.roughness = 0.7
	roof.material_override = roof_mat

	## الدلو
	var bucket: MeshInstance3D = MeshInstance3D.new()
	bucket.mesh = CylinderMesh.new()
	bucket.mesh.top_radius = 0.15
	bucket.mesh.bottom_radius = 0.12
	bucket.mesh.height = 0.25
	bucket.position = Vector3(0, 2.5, 0)
	well.add_child(bucket)

	var bucket_mat: StandardMaterial3D = StandardMaterial3D.new()
	bucket_mat.albedo_color = Color(0.4, 0.3, 0.2)
	bucket_mat.metallic = 0.5
	bucket_mat.roughness = 0.5
	bucket.material_override = bucket_mat


func get_building_positions() -> Dictionary:
	return {
		"barn": Vector3(18.0, 0.0, -8.0),
		"house": Vector3(-18.0, 0.0, 8.0),
		"silo": Vector3(18.0, 0.0, 8.0),
		"well": Vector3(-18.0, 0.0, -8.0),
	}
