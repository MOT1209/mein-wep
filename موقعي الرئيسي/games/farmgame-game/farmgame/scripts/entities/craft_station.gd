extends StaticBody3D
## محطة تصنيع: تحوّل المدخلات لمنتجات عالية القيمة
## الجذر StaticBody3D حتى يلتقطه InteractionRay الخاص باللاعب (نفس نمط farm_tile)

var station_type: String = "oven"
var station_name: String = "Oven"
var is_crafting: bool = false
var current_recipe: String = ""
var craft_progress: float = 0.0
var craft_time: float = 0.0

var _body: MeshInstance3D = null
var _progress_indicator: MeshInstance3D = null


func _ready() -> void:
	_create_visuals()
	_create_progress_indicator()


func _process(delta: float) -> void:
	if not is_crafting:
		return

	craft_progress += delta
	if craft_progress >= craft_time:
		_complete_craft()

	## تحديث مؤشر التقدم
	if _progress_indicator:
		var progress_ratio: float = craft_progress / craft_time
		_progress_indicator.scale.y = 0.1 + 0.9 * progress_ratio
		_progress_indicator.position.y = 2.0 + progress_ratio * 0.5


func _create_visuals() -> void:
	## BaseType
	_body = MeshInstance3D.new()
	_body.mesh = BoxMesh.new()
	_body.mesh.size = Vector3(1.5, 1.0, 1.5)
	_body.position = Vector3(0, 0.5, 0)
	add_child(_body)

	var mat: StandardMaterial3D = StandardMaterial3D.new()
	mat.albedo_color = Color(0.4, 0.35, 0.3)
	mat.roughness = 0.9
	_body.material_override = mat

	## Top (oven door or juicer spout)
	var top: MeshInstance3D = MeshInstance3D.new()
	top.mesh = BoxMesh.new()
	top.mesh.size = Vector3(1.2, 0.8, 0.2)
	top.position = Vector3(0, 1.0, 0.7)
	add_child(top)

	var top_mat: StandardMaterial3D = StandardMaterial3D.new()
	top_mat.albedo_color = Color(0.3, 0.3, 0.3)
	top_mat.metallic = 0.5
	top_mat.roughness = 0.5
	top.material_override = top_mat

	## التصادم على الجذر مباشرة حتى يصل إليه الـ raycast
	var col: CollisionShape3D = CollisionShape3D.new()
	col.shape = BoxShape3D.new()
	col.shape.size = Vector3(1.5, 1.8, 1.5)
	col.position = Vector3(0, 0.9, 0)
	add_child(col)


func _create_progress_indicator() -> void:
	_progress_indicator = MeshInstance3D.new()
	_progress_indicator.mesh = CylinderMesh.new()
	_progress_indicator.mesh.top_radius = 0.2
	_progress_indicator.mesh.bottom_radius = 0.2
	_progress_indicator.mesh.height = 0.1
	_progress_indicator.position = Vector3(0, 2.0, 0)
	_progress_indicator.visible = false
	add_child(_progress_indicator)

	var mat: StandardMaterial3D = StandardMaterial3D.new()
	mat.albedo_color = Color(0.0, 1.0, 0.0)
	mat.emission_enabled = true
	mat.emission = Color(0.0, 1.0, 0.0)
	mat.emission_energy_multiplier = 0.5
	_progress_indicator.material_override = mat


## نقطة دخول تفاعل اللاعب: تفتح لوحة التصنيع الخاصة بهذه المحطة عبر الـ HUD
func interact(_player: Node) -> void:
	var hud: Node = get_tree().get_first_node_in_group("hud")
	if hud and hud.has_method("open_craft_panel"):
		hud.open_craft_panel(self)


func start_craft(recipe_id: String) -> bool:
	if is_crafting:
		return false

	var recipe: Dictionary = RecipeData.get_recipe(recipe_id)
	if recipe.is_empty():
		return false

	## التحقق من المدخلات
	var inputs: Dictionary = recipe.get("inputs", {})
	for item_id: String in inputs:
		var required: int = inputs[item_id]
		if not InventorySystem.has_item(item_id, required):
			return false

	## إزالة المدخلات
	for item_id: String in inputs:
		var required: int = inputs[item_id]
		InventorySystem.remove_item(item_id, required)

	## بدء التصنيع
	current_recipe = recipe_id
	craft_time = recipe.get("craft_time", 5.0)
	craft_progress = 0.0
	is_crafting = true
	_progress_indicator.visible = true

	return true


func _complete_craft() -> void:
	var recipe: Dictionary = RecipeData.get_recipe(current_recipe)
	var outputs: Dictionary = recipe.get("output", {})

	## إضافة المخرجات
	for item_id: String in outputs:
		var quantity: int = outputs[item_id]
		InventorySystem.add_item(item_id, quantity)

	is_crafting = false
	current_recipe = ""
	craft_progress = 0.0
	_progress_indicator.visible = false

	EventBus.tool_used.emit("crafting", self)


func get_info() -> Dictionary:
	return {
		"station_type": station_type,
		"station_name": station_name,
		"is_crafting": is_crafting,
		"current_recipe": current_recipe,
		"craft_progress": craft_progress,
		"craft_time": craft_time,
	}
