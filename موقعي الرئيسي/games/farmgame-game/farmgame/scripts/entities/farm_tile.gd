extends StaticBody3D
## قطعة أرض واحدة في شبكة المزرعة: حرث -> غراسة -> نمو -> حصاد
## تم إضافة particles للحرث والغرس

const CropScene: PackedScene = preload("res://scenes/entities/crop.tscn")
const GrassMaterial: Material = preload("res://assets/materials/grass_tile.tres")
const SoilMaterial: Material = preload("res://assets/materials/soil_tilled.tres")

enum State { EMPTY, TILLED, PLANTED }

@onready var mesh_instance: MeshInstance3D = $MeshInstance3D

var state: State = State.EMPTY
var planted_crop: Node3D = null


func _ready() -> void:
	_update_visual()


func interact(player: Node) -> void:
	match state:
		State.EMPTY:
			_till()
		State.TILLED:
			_plant()
		State.PLANTED:
			if planted_crop and is_instance_valid(planted_crop):
				planted_crop.interact(player)


func _till() -> void:
	state = State.TILLED
	_update_visual()
	_create_till_particles()


func _plant() -> void:
	var seed_to_plant: String = InventorySystem.selected_seed_id
	if seed_to_plant == "" or not InventorySystem.has_item(seed_to_plant, 1):
		return

	var crop_id_to_plant: String = CropData.get_crop_id_by_seed(seed_to_plant)
	if crop_id_to_plant == "":
		return

	InventorySystem.remove_item(seed_to_plant, 1)

	planted_crop = CropScene.instantiate()
	planted_crop.crop_id = crop_id_to_plant
	add_child(planted_crop)
	planted_crop.position = Vector3(0, 0.05, 0)

	planted_crop.tree_exited.connect(_on_crop_removed)

	state = State.PLANTED
	EventBus.crop_planted.emit(planted_crop, Vector2i.ZERO)
	_update_visual()
	_create_plant_particles()


func _on_crop_removed() -> void:
	planted_crop = null
	state = State.TILLED
	_update_visual()
	_create_harvest_particles()


func _update_visual() -> void:
	if mesh_instance == null:
		return
	match state:
		State.EMPTY:
			mesh_instance.material_override = GrassMaterial
		State.TILLED, State.PLANTED:
			mesh_instance.material_override = SoilMaterial


func _create_till_particles() -> void:
	var particles: GPUParticles3D = GPUParticles3D.new()
	particles.position = Vector3(0, 0.2, 0)
	add_child(particles)

	## إعداد material الجسيمات
	var material: ParticleProcessMaterial = ParticleProcessMaterial.new()
	material.direction = Vector3(0, 1, 0)
	material.spread = 60.0
	material.initial_velocity_min = 1.0
	material.initial_velocity_max = 2.0
	material.gravity = Vector3(0, -5.0, 0)
	material.scale_min = 0.05
	material.scale_max = 0.1
	material.color = Color(0.5, 0.35, 0.2)

	## إعداد draw pass
	var draw_mesh: QuadMesh = QuadMesh.new()
	draw_mesh.size = Vector2(0.08, 0.08)
	var draw_material: StandardMaterial3D = StandardMaterial3D.new()
	draw_material.albedo_color = Color(0.5, 0.35, 0.2)
	draw_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	draw_material.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	draw_mesh.material = draw_material
	particles.draw_pass_1 = draw_mesh

	particles.process_material = material
	particles.amount = 15
	particles.lifetime = 0.4
	particles.one_shot = true
	particles.emitting = true

	## حذف الجسيمات بعد انتهاءها
	await get_tree().create_timer(0.6).timeout
	if is_instance_valid(particles):
		particles.queue_free()


func _create_plant_particles() -> void:
	var particles: GPUParticles3D = GPUParticles3D.new()
	particles.position = Vector3(0, 0.3, 0)
	add_child(particles)

	## إعداد material الجسيمات
	var material: ParticleProcessMaterial = ParticleProcessMaterial.new()
	material.direction = Vector3(0, 1, 0)
	material.spread = 45.0
	material.initial_velocity_min = 0.5
	material.initial_velocity_max = 1.0
	material.gravity = Vector3(0, -3.0, 0)
	material.scale_min = 0.03
	material.scale_max = 0.06
	material.color = Color(0.3, 0.7, 0.3)

	## إعداد draw pass
	var draw_mesh: QuadMesh = QuadMesh.new()
	draw_mesh.size = Vector2(0.05, 0.05)
	var draw_material: StandardMaterial3D = StandardMaterial3D.new()
	draw_material.albedo_color = Color(0.3, 0.7, 0.3)
	draw_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	draw_material.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	draw_mesh.material = draw_material
	particles.draw_pass_1 = draw_mesh

	particles.process_material = material
	particles.amount = 10
	particles.lifetime = 0.3
	particles.one_shot = true
	particles.emitting = true

	## حذف الجسيمات بعد انتهاءها
	await get_tree().create_timer(0.5).timeout
	if is_instance_valid(particles):
		particles.queue_free()


func _create_harvest_particles() -> void:
	var particles: GPUParticles3D = GPUParticles3D.new()
	particles.position = Vector3(0, 0.5, 0)
	add_child(particles)

	## إعداد material الجسيمات
	var material: ParticleProcessMaterial = ParticleProcessMaterial.new()
	material.direction = Vector3(0, 1, 0)
	material.spread = 180.0
	material.initial_velocity_min = 1.5
	material.initial_velocity_max = 3.0
	material.gravity = Vector3(0, -5.0, 0)
	material.scale_min = 0.05
	material.scale_max = 0.1
	material.color = Color(1.0, 0.9, 0.3)

	## إعداد draw pass
	var draw_mesh: QuadMesh = QuadMesh.new()
	draw_mesh.size = Vector2(0.06, 0.06)
	var draw_material: StandardMaterial3D = StandardMaterial3D.new()
	draw_material.albedo_color = Color(1.0, 0.9, 0.3)
	draw_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	draw_material.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	draw_mesh.material = draw_material
	particles.draw_pass_1 = draw_mesh

	particles.process_material = material
	particles.amount = 20
	particles.lifetime = 0.4
	particles.one_shot = true
	particles.emitting = true

	## حذف الجسيمات بعد انتهاءها
	await get_tree().create_timer(0.6).timeout
	if is_instance_valid(particles):
		particles.queue_free()
