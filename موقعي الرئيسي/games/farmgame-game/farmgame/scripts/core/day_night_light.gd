extends DirectionalLight3D
## يدوّر الشمس، يغيّر شدة/لون الضوء حسب ساعة TimeSystem
## يحدّث السماء (ProceduralSkyMaterial) والإضاءة المحيطة ديناميكياً
## يدير ظهور/اختفاء القمر

const DAY_COLOR: Color = Color(1.0, 0.95, 0.85)
const NIGHT_COLOR: Color = Color(0.25, 0.3, 0.5)
const DAY_ENERGY: float = 1.2
const NIGHT_ENERGY: float = 0.15

const DAY_START_HOUR: int = 6
const DAY_END_HOUR: int = 20
const TRANSITION_HOURS: int = 2  ## مدة الشروق/الغروب: نفس النافذة للشمس والسماء معاً
const MIN_DAY_ELEVATION_DEG: float = 15.0
const MAX_DAY_ELEVATION_DEG: float = 90.0
const NIGHT_ROTATION_DEG: float = 100.0

## ألوان السماء عند نقاط زمنية مختلفة (Night→Sunrise→Day→Sunset→Night)
const SKY_NIGHT: Color = Color(0.15, 0.2, 0.3)
const SKY_SUNRISE: Color = Color(0.95, 0.65, 0.4)
const SKY_DAY: Color = Color(0.38, 0.58, 0.92)
const SKY_SUNSET: Color = Color(1.0, 0.6, 0.3)

const AMBIENT_DAY: float = 1.0
const AMBIENT_NIGHT: float = 0.25

var _sky_material: ProceduralSkyMaterial = null
var _world_environment: WorldEnvironment = null
var _moon: DirectionalLight3D = null


func _ready() -> void:
	EventBus.hour_changed.connect(_on_hour_changed)
	_initialize_sky()
	_initialize_moon()
	_update_light(TimeSystem.current_hour)


func _initialize_sky() -> void:
	_world_environment = get_tree().get_first_node_in_group("world_env") as WorldEnvironment
	if _world_environment == null:
		_world_environment = get_parent().get_node("WorldEnvironment") as WorldEnvironment

	if _world_environment == null or _world_environment.environment == null:
		return

	_sky_material = _world_environment.environment.sky.sky_material as ProceduralSkyMaterial
	if _sky_material == null:
		_sky_material = ProceduralSkyMaterial.new()
		var new_sky = Sky.new()
		new_sky.sky_material = _sky_material
		_world_environment.environment.sky = new_sky


func _initialize_moon() -> void:
	## البحث عن عقدة القمر (Moon) إن وجدت، أو إنشاء واحدة
	_moon = get_parent().get_node_or_null("Moon") as DirectionalLight3D
	if _moon == null:
		_moon = DirectionalLight3D.new()
		_moon.name = "Moon"
		_moon.transform = transform
		_moon.rotation_degrees.x = -NIGHT_ROTATION_DEG + 180.0  ## عكس الشمس
		_moon.light_energy = 0.08
		_moon.shadow_enabled = false
		get_parent().add_child.call_deferred(_moon)


func _on_hour_changed(hour: int) -> void:
	_update_light(hour)


func _update_light(hour: int) -> void:
	## day_factor موحّد (0=ليل تام، 1=نهار تام) يتحكم بسطوع الشمس ولون السماء والإضاءة المحيطة
	## معاً بنفس النوافذ الزمنية (6-8 شروق، 20-22 غروب) لمنع أي تعارض بينها (مثلاً: شمس
	## ساطعة فوق سماء ليلية قاتمة عند حافة الساعة)
	var day_factor: float = _calculate_day_factor(hour)
	var is_full_night: bool = day_factor <= 0.0

	## تحديث الشمس: القوس الحركي فقط أثناء النهار الفعلي (6-20)، تحت الأفق ليلاً
	if hour >= DAY_START_HOUR and hour < DAY_END_HOUR:
		var day_length: float = float(DAY_END_HOUR - DAY_START_HOUR)
		var day_progress: float = float(hour - DAY_START_HOUR) / day_length
		var elevation: float = MIN_DAY_ELEVATION_DEG + (MAX_DAY_ELEVATION_DEG - MIN_DAY_ELEVATION_DEG) * sin(PI * day_progress)
		rotation_degrees.x = -elevation
	else:
		rotation_degrees.x = NIGHT_ROTATION_DEG

	light_color = NIGHT_COLOR.lerp(DAY_COLOR, day_factor)
	light_energy = lerp(NIGHT_ENERGY, DAY_ENERGY, day_factor)

	_update_sky(hour, day_factor)
	_update_moon(is_full_night)


## يحسب عامل النهار (0=ليل تام، 1=نهار تام) مع انتقال سلس على مدى TRANSITION_HOURS
## عند كل من الشروق والغروب - نفس النافذة الزمنية التي تستخدمها _update_sky بالضبط
func _calculate_day_factor(hour: int) -> float:
	var dusk_end: int = DAY_END_HOUR + TRANSITION_HOURS
	if hour < DAY_START_HOUR or hour >= dusk_end:
		return 0.0
	elif hour < DAY_START_HOUR + TRANSITION_HOURS:
		return float(hour - DAY_START_HOUR) / float(TRANSITION_HOURS)
	elif hour < DAY_END_HOUR:
		return 1.0
	else:
		return 1.0 - float(hour - DAY_END_HOUR) / float(TRANSITION_HOURS)


func _update_sky(hour: int, day_factor: float) -> void:
	if _sky_material == null or _world_environment == null or _world_environment.environment == null:
		return

	var sky_color: Color = SKY_DAY
	var dawn_end: int = DAY_START_HOUR + TRANSITION_HOURS
	var dusk_end: int = DAY_END_HOUR + TRANSITION_HOURS

	## لون السماء: يمر بذروة دافئة (شروق/غروب) في منتصف كل نافذة انتقال، بنفس حدود day_factor
	if hour < DAY_START_HOUR or hour >= dusk_end:
		sky_color = SKY_NIGHT
	elif hour < dawn_end:
		var t: float = float(hour - DAY_START_HOUR) / float(TRANSITION_HOURS)
		sky_color = SKY_NIGHT.lerp(SKY_SUNRISE, t * 2.0) if t < 0.5 else SKY_SUNRISE.lerp(SKY_DAY, (t - 0.5) * 2.0)
	elif hour < DAY_END_HOUR:
		sky_color = SKY_DAY
	else:
		var t: float = float(hour - DAY_END_HOUR) / float(TRANSITION_HOURS)
		sky_color = SKY_DAY.lerp(SKY_SUNSET, t * 2.0) if t < 0.5 else SKY_SUNSET.lerp(SKY_NIGHT, (t - 0.5) * 2.0)

	_sky_material.sky_top_color = sky_color
	_sky_material.sky_horizon_color = sky_color.lightened(0.3)  ## أفق أفتح قليلاً
	_sky_material.ground_horizon_color = sky_color.darkened(0.2)
	_sky_material.ground_bottom_color = sky_color.darkened(0.4)

	_world_environment.environment.ambient_light_energy = lerp(AMBIENT_NIGHT, AMBIENT_DAY, day_factor)


func _update_moon(is_full_night: bool) -> void:
	if _moon == null:
		return

	_moon.visible = is_full_night
	_moon.light_energy = 0.08 if is_full_night else 0.0
