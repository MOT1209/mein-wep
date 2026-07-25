extends Node3D
## جذر المشهد الرئيسي: يطبّق تحميل الحفظ إذا طُلب ذلك من قائمة البداية
## يعمل بعد جاهزية كل الأبناء (بما فيها FarmManager)، حسب ترتيب _ready في Godot

func _ready() -> void:
	if GameManager.pending_load:
		GameManager.pending_load = false
		GameManager.load_game()
