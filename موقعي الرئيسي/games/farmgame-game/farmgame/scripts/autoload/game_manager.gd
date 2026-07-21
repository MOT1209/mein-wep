extends Node
## المنسق الرئيسي للعبة - نقطة الدخول لحفظ/تحميل حالة اللعبة الكاملة

const SAVE_PATH: String = "user://savegame.json"

var is_game_running: bool = false


func _ready() -> void:
	is_game_running = true


func save_game() -> void:
	var save_data: Dictionary = {
		"time": TimeSystem.get_save_data(),
		"economy": EconomySystem.get_save_data(),
		"inventory": InventorySystem.get_save_data(),
	}

	var file: FileAccess = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		push_error("GameManager: تعذر فتح ملف الحفظ للكتابة")
		return

	file.store_string(JSON.stringify(save_data, "\t"))
	file.close()
	EventBus.game_saved.emit()


func load_game() -> bool:
	if not FileAccess.file_exists(SAVE_PATH):
		return false

	var file: FileAccess = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		push_error("GameManager: تعذر فتح ملف الحفظ للقراءة")
		return false

	var text: String = file.get_as_text()
	file.close()

	var parsed = JSON.parse_string(text)
	if parsed == null or not (parsed is Dictionary):
		push_error("GameManager: ملف الحفظ تالف")
		return false

	var save_data: Dictionary = parsed
	TimeSystem.load_save_data(save_data.get("time", {}))
	EconomySystem.load_save_data(save_data.get("economy", {}))
	InventorySystem.load_save_data(save_data.get("inventory", {}))

	EventBus.game_loaded.emit()
	return true


func has_save_file() -> bool:
	return FileAccess.file_exists(SAVE_PATH)
