class_name PropMaterialFix
extends RefCounted
## بعض حزم Kenney (Nature Kit) تُصدَّر بـ metallicFactor=1 خطأً على مواد غير معدنية،
## فتظهر لامعة/بلون خاطئ. يصفّر هذا القيمة على كل مادة StandardMaterial3D داخل الشجرة.

static func remove_metallic(node: Node) -> void:
	if node is MeshInstance3D:
		var mesh_instance: MeshInstance3D = node
		var mesh: Mesh = mesh_instance.mesh
		if mesh:
			for surface_idx in range(mesh.get_surface_count()):
				var mat: Material = mesh_instance.get_active_material(surface_idx)
				if mat is StandardMaterial3D and mat.metallic != 0.0:
					var fixed_mat: StandardMaterial3D = mat.duplicate()
					fixed_mat.metallic = 0.0
					mesh_instance.set_surface_override_material(surface_idx, fixed_mat)

	for child in node.get_children():
		remove_metallic(child)
