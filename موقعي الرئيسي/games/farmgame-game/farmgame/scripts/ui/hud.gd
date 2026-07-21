extends Control
## واجهة اللعبة الرئيسية: الوقت، اليوم، الفصل، المال، الطاقة والجوع

@onready var time_label: Label = $TopBar/TimeLabel
@onready var day_label: Label = $TopBar/DayLabel
@onready var money_label: Label = $TopBar/MoneyLabel
@onready var energy_bar: ProgressBar = $BottomBar/EnergyBar
@onready var hunger_bar: ProgressBar = $BottomBar/HungerBar


func _ready() -> void:
	EventBus.hour_changed.connect(_on_hour_changed)
	EventBus.day_changed.connect(_on_day_changed)
	EventBus.season_changed.connect(_on_season_changed)
	EventBus.money_changed.connect(_on_money_changed)
	EventBus.player_stats_changed.connect(_on_player_stats_changed)

	_on_hour_changed(TimeSystem.current_hour)
	_on_day_changed(TimeSystem.current_day, TimeSystem.current_day_of_week)
	_on_money_changed(EconomySystem.money)


func _on_hour_changed(_hour: int) -> void:
	time_label.text = TimeSystem.get_time_string()


func _on_day_changed(day: int, _day_of_week: int) -> void:
	day_label.text = "%s - Day %d" % [TimeSystem.current_season, day]


func _on_season_changed(_season: String) -> void:
	day_label.text = "%s - Day %d" % [TimeSystem.current_season, TimeSystem.current_day]


func _on_money_changed(new_amount: int) -> void:
	money_label.text = "$%d" % new_amount


func _on_player_stats_changed(stat_name: String, value: float) -> void:
	if stat_name == "energy":
		energy_bar.value = value
	elif stat_name == "hunger":
		hunger_bar.value = value
