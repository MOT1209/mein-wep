extends Node3D
## يغطي أرضية المزرعة بحشيش ثلاثي الأبعاد كثيف عبر MultiMeshInstance3D (draw call واحد لكل
## نوع)، بدل الاعتماد فقط على نسيج الأرضية المسطّح. يستخدم نفس مناطق الاستبعاد
## المستخدمة في nature_scatter.gd (المزرعة/المباني) لتفادي تكرار المنطق مع اختلاف الكثافة.
##
## المصدر: عشبتا grass_tuft_a/b.glb (محوَّلتان من Grass.blend عبر blender-mcp، راجع
## assets/CREDITS.md). كل عشبة أساسها عند الأصل، طولها الحقيقي قبل القياس ~3.37 وحدة.

const GRASS_MESH_PATHS: Array[String] = [
	"res://assets/models/nature/grass_extra/grass_tuft_a.glb",
	"res://assets/models/nature/grass_extra/grass_tuft_b.glb",
]

const BLADES_PER_MESH: int = 1800
const SCALE_MIN: float = 0.05
const SCALE_MAX: float = 0.09
const SCATTER_SEED: int = 20260723

const GROUND_HALF_EXTENT: float = 40.0
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


func _ready() -> void:
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = SCATTER_SEED

	for mesh_path in GRASS_MESH_PATHS:
		var mesh: Mesh = _extract_mesh(mesh_path)
		if mesh == null:
			continue
		_spawn_multimesh(mesh, rng)


func _extract_mesh(scene_path: String) -> Mesh:
	var packed: PackedScene = load(scene_path)
	if packed == null:
		return null
	var instance: Node = packed.instantiate()
	var mesh_instance: MeshInstance3D = _find_mesh_instance(instance)
	var mesh: Mesh = mesh_instance.mesh if mesh_instance else null
	instance.queue_free()
	return mesh


func _find_mesh_instance(node: Node) -> MeshInstance3D:
	if node is MeshInstance3D:
		return node
	for child in node.get_children():
		var found: MeshInstance3D = _find_mesh_instance(child)
		if found:
			return found
	return null


func _spawn_multimesh(mesh: Mesh, rng: RandomNumberGenerator) -> void:
	if mesh.get_surface_count() > 0:
		var mat: StandardMaterial3D = mesh.surface_get_material(0) as StandardMaterial3D
		if mat:
			mat = mat.duplicate()
			mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
			mat.alpha_scissor_threshold = 0.5
			mat.cull_mode = BaseMaterial3D.CULL_DISABLED
			mesh.surface_set_material(0, mat)

	var multimesh: MultiMesh = MultiMesh.new()
	multimesh.transform_format = MultiMesh.TRANSFORM_3D
	multimesh.mesh = mesh
	multimesh.instance_count = BLADES_PER_MESH

	var mmi: MultiMeshInstance3D = MultiMeshInstance3D.new()
	mmi.multimesh = multimesh
	add_child(mmi)

	var placed: int = 0
	var attempts: int = 0
	while placed < BLADES_PER_MESH and attempts < BLADES_PER_MESH * 10:
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

		var scale: float = rng.randf_range(SCALE_MIN, SCALE_MAX)
		var basis: Basis = Basis.IDENTITY.rotated(Vector3.UP, rng.randf_range(0, TAU)).scaled(Vector3.ONE * scale)
		var transform: Transform3D = Transform3D(basis, Vector3(x, 0, z))
		multimesh.set_instance_transform(placed, transform)
		placed += 1

	multimesh.instance_count = placed
	multimesh.visible_instance_count = placed
