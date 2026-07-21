extends DirectionalLight3D
## يدوّر الشمس ويغيّر شدة/لون الضوء حسب ساعة TimeSystem

const DAY_COLOR: Color = Color(1.0, 0.95, 0.85)
const NIGHT_COLOR: Color = Color(0.25, 0.3, 0.5)
const DAY_ENERGY: float = 1.2
const NIGHT_ENERGY: float = 0.15

const DAY_START_HOUR: int = 6
const DAY_END_HOUR: int = 20
const MIN_DAY_ELEVATION_DEG: float = 15.0
const MAX_DAY_ELEVATION_DEG: float = 90.0
const NIGHT_ROTATION_DEG: float = 100.0


func _ready() -> void:
	EventBus.hour_changed.connect(_on_hour_changed)
	_update_light(TimeSystem.current_hour)


func _on_hour_changed(hour: int) -> void:
	_update_light(hour)


func _update_light(hour: int) -> void:
	var is_night: bool = hour >= DAY_END_HOUR or hour < DAY_START_HOUR

	if is_night:
		## أثناء الليل يبقى الضوء تحت الأفق تقريباً؛ الإضاءة المحيطة تتكفل بالرؤية
		rotation_degrees.x = NIGHT_ROTATION_DEG
	else:
		var day_length: float = float(DAY_END_HOUR - DAY_START_HOUR)
		var day_progress: float = float(hour - DAY_START_HOUR) / day_length
		## حد أدنى للارتفاع حتى لا تصبح الشمس أفقية تماماً عند الشروق/الغروب (إضاءة صفرية)
		var elevation: float = MIN_DAY_ELEVATION_DEG + (MAX_DAY_ELEVATION_DEG - MIN_DAY_ELEVATION_DEG) * sin(PI * day_progress)
		rotation_degrees.x = -elevation

	light_color = NIGHT_COLOR if is_night else DAY_COLOR
	light_energy = NIGHT_ENERGY if is_night else DAY_ENERGY
