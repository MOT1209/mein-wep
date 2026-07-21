extends DirectionalLight3D
## يدوّر الشمس ويغيّر شدة/لون الضوء حسب ساعة TimeSystem

const DAY_COLOR: Color = Color(1.0, 0.95, 0.85)
const NIGHT_COLOR: Color = Color(0.25, 0.3, 0.5)
const DAY_ENERGY: float = 1.2
const NIGHT_ENERGY: float = 0.15


func _ready() -> void:
	EventBus.hour_changed.connect(_on_hour_changed)
	_update_light(TimeSystem.current_hour)


func _on_hour_changed(hour: int) -> void:
	_update_light(hour)


func _update_light(hour: int) -> void:
	var day_progress: float = float(hour) / 24.0
	rotation_degrees.x = -90.0 + (day_progress * 360.0)

	var is_night: bool = hour >= 20 or hour < 6
	light_color = NIGHT_COLOR if is_night else DAY_COLOR
	light_energy = NIGHT_ENERGY if is_night else DAY_ENERGY
