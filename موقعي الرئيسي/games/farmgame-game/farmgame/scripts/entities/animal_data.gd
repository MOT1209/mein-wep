class_name AnimalData
extends RefCounted
## يحمّل ويخزن مؤقتاً بيانات الحيوانات من data/animals.json

const DATA_PATH: String = "res://data/animals.json"

static var _cache: Dictionary = {}


static func get_animal(animal_id: String) -> Dictionary:
	_ensure_loaded()
	return _cache.get(animal_id, {})


static func get_all() -> Dictionary:
	_ensure_loaded()
	return _cache


static func get_animal_ids() -> Array[String]:
	_ensure_loaded()
	var ids: Array[String] = []
	for animal_id: String in _cache:
		ids.append(animal_id)
	return ids


static func _ensure_loaded() -> void:
	if not _cache.is_empty():
		return

	var file: FileAccess = FileAccess.open(DATA_PATH, FileAccess.READ)
	if file == null:
		push_error("AnimalData: تعذر فتح %s" % DATA_PATH)
		return

	var text: String = file.get_as_text()
	file.close()

	var parsed = JSON.parse_string(text)
	if parsed is Dictionary:
		_cache = parsed
