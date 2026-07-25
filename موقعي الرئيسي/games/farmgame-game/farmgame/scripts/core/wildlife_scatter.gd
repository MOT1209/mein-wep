extends Node3D
## يضع عدداً صغيراً من الحيوانات البرية/الزينة كنسخة واحدة لكل نوع - وليس نظام توزيع عشوائي كبير
## مثل nature_scatter.gd، لأن هذه ليست عناصر متكررة بل حيوانات فردية مميزة (قطة المزرعة، كبش
## بري، عنكبوت، إلخ). بلا interact() وبلا تصادم - زينة بصرية بحتة، لا آلية لعبية مرتبطة بها.
##
## مصادر هذه النماذج ليست CC0 (خلافاً لبقية أصول المشروع) - راجع assets/CREDITS.md قبل أي
## نشر علني/تجاري للمستودع.

const WildlifeEntry := {
	"model": "",
	"position": Vector3.ZERO,
	"scale": 1.0,
	"needs_zup_fix": false,
	"yaw_degrees": 0.0,
}

## نماذج TurboSquid (Z-up بوحدة سم) تحتاج تدوير -90° حول X + تصغير 0.01 (نفس تحقق animal.gd)؛
## spider.fbx يُفترض أن مستورد FBX في Godot يحوّل المحاور تلقائياً، فتُترك بلا تدوير يدوي
const WILDLIFE: Array[Dictionary] = [
	{
		"model": "res://assets/models/animals/cat/cat.obj",
		"position": Vector3(-21.5, 0, 11.5),
		"scale": 0.01,
		"needs_zup_fix": true,
		"yaw_degrees": 30.0,
	},
	{
		"model": "res://assets/models/animals/marco_polo_sheep/marco_polo_sheep.obj",
		"position": Vector3(35.0, 0, -35.0),
		"scale": 0.01,
		"needs_zup_fix": true,
		"yaw_degrees": 200.0,
	},
	{
		"model": "res://assets/models/animals/spider_monkey/spider_monkey.obj",
		"position": Vector3(-35.0, 0, -35.0),
		"scale": 0.01,
		"needs_zup_fix": true,
		"yaw_degrees": 100.0,
	},
	{
		"model": "res://assets/models/animals/bird_decor/bird_decor.obj",
		"position": Vector3(-30.0, 0, 30.0),
		"scale": 0.01,
		"needs_zup_fix": true,
		"yaw_degrees": 300.0,
	},
	{
		"model": "res://assets/models/animals/spider/spider.fbx",
		"position": Vector3(30.0, 0, 30.0),
		"scale": 1.0,
		"needs_zup_fix": false,
		"yaw_degrees": 0.0,
	},
]


func _ready() -> void:
	for entry: Dictionary in WILDLIFE:
		var resource: Resource = load(entry["model"])
		var visual: Node3D

		if resource is PackedScene:
			visual = resource.instantiate()
		else:
			var mesh_instance: MeshInstance3D = MeshInstance3D.new()
			mesh_instance.mesh = resource
			visual = mesh_instance

		add_child(visual)
		visual.position = entry["position"]
		## تعيين الدوران دفعة واحدة (X ثم Y) بدل rotate_y() منفصلة - استدعاء rotate_y بعد تدوير X
		## يدور حول محور Y المحلي (المائل حالياً) لا العمودي العالمي، فينتج دحرجة خاطئة لا التفافاً
		var tilt_x: float = -90.0 if entry["needs_zup_fix"] else 0.0
		visual.rotation_degrees = Vector3(tilt_x, entry["yaw_degrees"], 0.0)
		visual.scale = Vector3.ONE * float(entry["scale"])
