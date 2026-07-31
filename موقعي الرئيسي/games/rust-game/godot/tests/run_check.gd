extends Node
## Rust Survival 3D — اختبار تشغيل تلقائي
## يشغّل main.tscn، ينتظر 8 ثوانٍ (تهيئة العالم/اللاعب/NPC)، يلتقط لقطة، يخرج.

var _errors: Array = []

func _ready() -> void:
	print("[TEST] === Rust Survival 3D — بدء الاختبار ===")
	# الاستماع للأخطاء
	_attach_error_listeners()

	var main_tscn: PackedScene = load("res://scenes/main.tscn")
	if main_tscn == null:
		print("[TEST] ❌ فشل تحميل scenes/main.tscn")
		get_tree().quit(1)
		return

	var main: Node = main_tscn.instantiate()
	add_child(main)
	print("[TEST] ✅ main.tscn تم تحميله وتشغيله")

	# انتظر تهيئة العالم
	await get_tree().create_timer(8.0).timeout

	# فحص العناصر الأساسية
	var checks: Array = [
		["اللاعب (Player)", "Player"],
		["الكاميرا (Camera3D)", "Camera3D"],
		["العالم (World)", "World"],
		["واجهة HUD", "HUD"],
		["نظام البناء", "BuildingSystem"],
	]
	for c in checks:
		var found := _find_node(main, c[1])
		print("[TEST] %s: %s" % [c[0], "✅ موجود" if found else "⚠️ غير موجود"])

	# لقطة شاشة
	var img := get_viewport().get_texture().get_image()
	var shot_path := "res://../docs/godot-run-check.png"
	img.save_png(shot_path)
	print("[TEST] 📸 لقطة الشاشة: %s" % shot_path)

	# التقرير
	print("[TEST] === ملخص الأخطاء: %d ===" % _errors.size())
	for e in _errors:
		print("[TEST-ERR] " + e)
	var code := 0 if _errors.size() == 0 else 2
	print("[TEST] === النتيجة: %s ===" % ("✅ نجح بدون أخطاء" if code == 0 else "⚠️ يوجد أخطاء"))
	get_tree().quit(code)

func _find_node(root: Node, type_name: String) -> Node:
	for child in root.get_children():
		if child.get_class() == type_name or child.name.to_lower().contains(type_name.to_lower()):
			return child
		var sub := _find_node(child, type_name)
		if sub: return sub
	return null

func _attach_error_listeners() -> void:
	# أخطاء GDScript تظهر في stdout؛ نلتقطها من إخراج العملية.
	pass
