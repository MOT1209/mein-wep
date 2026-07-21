extends Node
## نظام الوقت: يدير الساعة، الأيام، الفصول والدورة الزمنية الكاملة

const MINUTES_PER_HOUR: int = 60
const HOURS_PER_DAY: int = 24
const DAYS_PER_SEASON: int = 28
const SEASONS: Array[String] = ["Spring", "Summer", "Fall", "Winter"]

## كم ثانية واقعية = دقيقة داخل اللعبة
@export var real_seconds_per_game_minute: float = 0.7

var current_minute: int = 0
var current_hour: int = 6
var current_day: int = 1
var current_day_of_week: int = 1
var current_season_index: int = 0
var current_year: int = 1

var _minute_timer: float = 0.0
var is_paused: bool = false

var current_season: String:
	get: return SEASONS[current_season_index]

var is_night: bool:
	get: return current_hour >= 20 or current_hour < 6


func _process(delta: float) -> void:
	if is_paused:
		return

	_minute_timer += delta
	if _minute_timer >= real_seconds_per_game_minute:
		_minute_timer = 0.0
		_advance_minute()


func _advance_minute() -> void:
	current_minute += 1
	if current_minute >= MINUTES_PER_HOUR:
		current_minute = 0
		_advance_hour()


func _advance_hour() -> void:
	current_hour += 1
	EventBus.hour_changed.emit(current_hour)
	if current_hour >= HOURS_PER_DAY:
		current_hour = 0
		_advance_day()


func _advance_day() -> void:
	current_day += 1
	current_day_of_week = (current_day_of_week % 7) + 1
	EventBus.day_changed.emit(current_day, current_day_of_week)

	if current_day > DAYS_PER_SEASON:
		current_day = 1
		_advance_season()


func _advance_season() -> void:
	current_season_index += 1
	if current_season_index >= SEASONS.size():
		current_season_index = 0
		current_year += 1
		EventBus.year_changed.emit(current_year)
	EventBus.season_changed.emit(current_season)


func get_time_string() -> String:
	return "%02d:%02d" % [current_hour, current_minute]


func pause() -> void:
	is_paused = true


func resume() -> void:
	is_paused = false


func get_save_data() -> Dictionary:
	return {
		"current_minute": current_minute,
		"current_hour": current_hour,
		"current_day": current_day,
		"current_day_of_week": current_day_of_week,
		"current_season_index": current_season_index,
		"current_year": current_year,
	}


func load_save_data(data: Dictionary) -> void:
	current_minute = data.get("current_minute", 0)
	current_hour = data.get("current_hour", 6)
	current_day = data.get("current_day", 1)
	current_day_of_week = data.get("current_day_of_week", 1)
	current_season_index = data.get("current_season_index", 0)
	current_year = data.get("current_year", 1)
