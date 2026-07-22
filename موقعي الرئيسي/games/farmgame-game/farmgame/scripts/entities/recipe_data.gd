class_name RecipeData
extends RefCounted
## يحمّل ويخزن مؤقتاً بيانات الوصفات من data/recipes.json

const DATA_PATH: String = "res://data/recipes.json"

static var _cache: Dictionary = {}


static func get_recipe(recipe_id: String) -> Dictionary:
	_ensure_loaded()
	return _cache.get(recipe_id, {})


static func get_all() -> Dictionary:
	_ensure_loaded()
	return _cache


static func get_recipes_by_station(station: String) -> Dictionary:
	_ensure_loaded()
	var station_recipes: Dictionary = {}
	for recipe_id: String in _cache:
		var recipe: Dictionary = _cache[recipe_id]
		if recipe.get("station", "") == station:
			station_recipes[recipe_id] = recipe
	return station_recipes


static func can_craft(recipe_id: String) -> bool:
	_ensure_loaded()
	var recipe: Dictionary = _cache.get(recipe_id, {})
	if recipe.is_empty():
		return false

	var inputs: Dictionary = recipe.get("inputs", {})
	for item_id: String in inputs:
		var required: int = inputs[item_id]
		if not InventorySystem.has_item(item_id, required):
			return false
	return true


static func _ensure_loaded() -> void:
	if not _cache.is_empty():
		return

	var file: FileAccess = FileAccess.open(DATA_PATH, FileAccess.READ)
	if file == null:
		push_error("RecipeData: تعذر فتح %s" % DATA_PATH)
		return

	var text: String = file.get_as_text()
	file.close()

	var parsed = JSON.parse_string(text)
	if parsed is Dictionary:
		_cache = parsed
