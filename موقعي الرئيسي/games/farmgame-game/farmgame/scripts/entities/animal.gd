extends StaticBody3D
## حيوان مزرعة: يتحرك عشوائياً حول موقع حظيرته، يتغذى، ينتج منتجات
## الجذر StaticBody3D حتى يلتقطه InteractionRay الخاص باللاعب (نفس نمط farm_tile)

## نماذج حقيقية اختيارية لبعض الأنواع (بديل عن صندوق _create_procedural_visual الإجرائي)؛
## الأنواع غير المذكورة هنا تستمر بالصندوق الإجرائي كما كانت (chicken/cow/pig)
const MODEL_PATHS: Dictionary = {
	"sheep": "res://assets/models/animals/sheep/sheep.obj",
	"duck": "res://assets/models/animals/duck/duck.obj",
}

## sheep.obj مصدره thefree3dmodels.com بوحدة أمتار وY-up (مطابق لـ Godot) فلا يحتاج تصغيراً؛
## duck.obj مصدره TurboSquid #12249 مُصدَّر من 3ds Max بوحدة سم (قياس مباشر لصندوق الحدود:
## ارتفاع 54.77 وحدة خام) فيحتاج القسمة على 100
const MODEL_SCALES: Dictionary = {
	"sheep": 1.0,
	"duck": 0.01,
}

## نماذج 3ds Max/TurboSquid هذه مُصدَّرة Z-up (تحقّقنا: كل صندوق حدودها يبدأ من Z=0 تقريباً وليس Y)
## بعكس Y-up الافتراضي في Godot، فتحتاج تدوير -90° حول X لتقف منتصبة
const MODEL_NEEDS_ZUP_FIX: Dictionary = {
	"duck": true,
}

var animal_id: String = "chicken"
var animal_info: Dictionary = {}
var hunger: float = 100.0
var happiness: float = 100.0
var days_since_last_product: int = 0
var is_product_ready: bool = false

## مركز منطقة التجول - يضبطه barn_animal.gd بعد وضع الحيوان في الحظيرة
var home_position: Vector3 = Vector3.ZERO

var _move_timer: float = 0.0
var _move_interval: float = 3.0
var _target_position: Vector3 = Vector3.ZERO
var _body: MeshInstance3D = null
var _product_indicator: MeshInstance3D = null


func _ready() -> void:
	animal_info = AnimalData.get_animal(animal_id)
	EventBus.day_changed.connect(_on_day_changed)
	_create_visuals()
	_create_product_indicator()
	_update_visual()


func _physics_process(delta: float) -> void:
	_move_timer += delta
	if _move_timer >= _move_interval:
		_move_timer = 0.0
		_pick_new_target()

	## الحركة نحو الهدف
	var direction: Vector3 = (_target_position - global_position)
	direction.y = 0.0
	if direction.length() > 0.5:
		var move_speed: float = 2.0 * delta
		global_position += direction.normalized() * move_speed
		## تدوير الحيوان نحو الاتجاه
		if direction.length_squared() > 0.01:
			look_at(global_position + direction, Vector3.UP)


func _create_visuals() -> void:
	var size: Vector3 = Vector3(animal_info.get("size", [0.5, 0.5, 0.5])[0],
		animal_info.get("size", [0.5, 0.5, 0.5])[1],
		animal_info.get("size", [0.5, 0.5, 0.5])[2])

	## التصادم على الجذر مباشرة حتى يصل إليه الـ raycast (مشترك بين النموذج الحقيقي والصندوق الإجرائي)
	var col: CollisionShape3D = CollisionShape3D.new()
	col.shape = CapsuleShape3D.new()
	col.shape.radius = maxf(size.x, size.z) * 0.6
	col.shape.height = maxf(size.y * 1.5, size.y + 0.4)
	col.position = Vector3(0, size.y * 0.5, 0)
	add_child(col)

	if MODEL_PATHS.has(animal_id):
		_create_model_visual()
	else:
		_create_procedural_visual(size)


func _create_model_visual() -> void:
	var path: String = MODEL_PATHS[animal_id]
	var resource: Resource = load(path)
	var visual: Node3D

	if resource is PackedScene:
		visual = resource.instantiate()
	else:
		var mesh_instance: MeshInstance3D = MeshInstance3D.new()
		mesh_instance.mesh = resource
		visual = mesh_instance

	if MODEL_NEEDS_ZUP_FIX.get(animal_id, false):
		visual.rotation_degrees.x = -90.0
	visual.scale = Vector3.ONE * float(MODEL_SCALES.get(animal_id, 1.0))
	add_child(visual)


func _create_procedural_visual(size: Vector3) -> void:
	var color: Color = Color(animal_info.get("color", [0.8, 0.8, 0.8])[0],
		animal_info.get("color", [0.8, 0.8, 0.8])[1],
		animal_info.get("color", [0.8, 0.8, 0.8])[2])

	## الجسم
	_body = MeshInstance3D.new()
	_body.mesh = BoxMesh.new()
	_body.mesh.size = size
	_body.position = Vector3(0, size.y * 0.5, 0)
	add_child(_body)

	var mat: StandardMaterial3D = StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.8
	_body.material_override = mat

	## الرأس (كبيّة أصغر)
	var head: MeshInstance3D = MeshInstance3D.new()
	head.mesh = BoxMesh.new()
	head.mesh.size = size * 0.5
	head.position = Vector3(0, size.y * 0.7, size.z * 0.4)
	add_child(head)

	var head_mat: StandardMaterial3D = StandardMaterial3D.new()
	head_mat.albedo_color = color.darkened(0.1)
	head_mat.roughness = 0.8
	head.material_override = head_mat

	## العيون
	for i in range(2):
		var eye: MeshInstance3D = MeshInstance3D.new()
		eye.mesh = SphereMesh.new()
		eye.mesh.radius = 0.05
		eye.mesh.height = 0.1
		eye.position = Vector3(-0.1 + i * 0.2, size.y * 0.8, size.z * 0.6)
		add_child(eye)

		var eye_mat: StandardMaterial3D = StandardMaterial3D.new()
		eye_mat.albedo_color = Color(0.1, 0.1, 0.1)
		eye.material_override = eye_mat

	## الأرجل (4 أرجل)
	for i in range(4):
		var leg: MeshInstance3D = MeshInstance3D.new()
		leg.mesh = CylinderMesh.new()
		leg.mesh.top_radius = 0.05
		leg.mesh.bottom_radius = 0.06
		leg.mesh.height = size.y * 0.4
		leg.position = Vector3(-size.x * 0.3 + i * size.x * 0.2, size.y * 0.2, -size.z * 0.3 + i * size.z * 0.2)
		add_child(leg)

		var leg_mat: StandardMaterial3D = StandardMaterial3D.new()
		leg_mat.albedo_color = color.darkened(0.2)
		leg_mat.roughness = 0.9
		leg.material_override = leg_mat


func _create_product_indicator() -> void:
	_product_indicator = MeshInstance3D.new()
	_product_indicator.mesh = SphereMesh.new()
	_product_indicator.mesh.radius = 0.15
	_product_indicator.mesh.height = 0.3
	_product_indicator.position = Vector3(0, animal_info.get("size", [0.5, 0.5, 0.5])[1] * 1.2, 0)
	_product_indicator.visible = false
	add_child(_product_indicator)

	var mat: StandardMaterial3D = StandardMaterial3D.new()
	mat.albedo_color = Color(1.0, 0.8, 0.0)
	mat.emission_enabled = true
	mat.emission = Color(1.0, 0.8, 0.0)
	mat.emission_energy_multiplier = 0.5
	_product_indicator.material_override = mat


func _update_visual() -> void:
	if _product_indicator:
		_product_indicator.visible = is_product_ready


func _pick_new_target() -> void:
	## التجول داخل منطقة محدودة حول الحظيرة (وليس نقطة أصل العالم)
	var random_offset: Vector3 = Vector3(
		randf_range(-4.0, 4.0),
		0.0,
		randf_range(-4.0, 4.0)
	)
	_target_position = home_position + random_offset


func _on_day_changed(_day: int, _day_of_week: int) -> void:
	## تحديث الجوع
	hunger = clampf(hunger - animal_info.get("hunger_decay_per_day", 20.0), 0.0, 100.0)

	## تحديث السعادة
	happiness = clampf(happiness - animal_info.get("happiness_decay_per_day", 10.0), 0.0, 100.0)

	## إذا الحيوان جائع، السعة تنخفض أسرع
	if hunger <= 0.0:
		happiness = clampf(happiness - 10.0, 0.0, 100.0)

	## تحديث الإنتاج
	days_since_last_product += 1
	if days_since_last_product >= animal_info.get("production_days", 2) and hunger > 20.0:
		is_product_ready = true
		_update_visual()
		EventBus.animal_product_ready.emit(self, animal_info.get("product", ""))


## نقطة دخول تفاعل اللاعب (نفس نمط farm_tile): جمع المنتج إن كان جاهزاً، وإلا إطعام الحيوان
func interact(_player: Node) -> void:
	if is_product_ready:
		collect_product()
	else:
		feed()


func feed() -> void:
	var feed_cost: int = animal_info.get("feed_cost", 5)
	if EconomySystem.can_afford(feed_cost):
		EconomySystem.spend_money(feed_cost)
		hunger = clampf(hunger + 40.0, 0.0, 100.0)
		happiness = clampf(happiness + 10.0, 0.0, 100.0)
		EventBus.animal_hunger_changed.emit(self, hunger)
		EventBus.animal_happiness_changed.emit(self, happiness)


func collect_product() -> bool:
	if not is_product_ready:
		return false

	var product_id: String = animal_info.get("product", "")
	InventorySystem.add_item(product_id, 1)
	is_product_ready = false
	days_since_last_product = 0
	_update_visual()
	return true


func get_info() -> Dictionary:
	return {
		"animal_id": animal_id,
		"animal_name": animal_info.get("name", ""),
		"hunger": hunger,
		"happiness": happiness,
		"is_product_ready": is_product_ready,
		"product_name": animal_info.get("product_name", ""),
		"feed_cost": animal_info.get("feed_cost", 5),
	}
