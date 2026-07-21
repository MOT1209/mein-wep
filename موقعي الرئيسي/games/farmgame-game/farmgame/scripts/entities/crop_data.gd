class_name CropData
extends RefCounted
## يحمّل ويخزن مؤقتاً بيانات المحاصيل من data/crops.json

const DATA_PATH: String = "res://data/crops.json"

static var _cache: Dictionary = {}


static func get_crop(crop_id: String) -> Dictionary:
	_ensure_loaded()
	return _cache.get(crop_id, {})


static func _ensure_loaded() -> void:
	if not _cache.is_empty():
		return

	var file: FileAccess = FileAccess.open(DATA_PATH, FileAccess.READ)
	if file == null:
		push_error("CropData: تعذر فتح %s" % DATA_PATH)
		return

	var text: String = file.get_as_text()
	file.close()

	var parsed = JSON.parse_string(text)
	if parsed is Dictionary:
		_cache = parsed
