extends Node
## فسيولوجيا اللاعب: الجوع، الطاقة، الصحة

const MAX_STAT: float = 100.0
const HUNGER_DECAY_PER_HOUR: float = 3.0
const ENERGY_DECAY_PER_HOUR: float = 4.0
const LOW_STAT_HEALTH_DAMAGE_PER_HOUR: float = 5.0

var hunger: float = MAX_STAT
var energy: float = MAX_STAT
var health: float = MAX_STAT


func _ready() -> void:
	EventBus.hour_changed.connect(_on_hour_changed)


func _on_hour_changed(_hour: int) -> void:
	hunger = clampf(hunger - HUNGER_DECAY_PER_HOUR, 0.0, MAX_STAT)
	energy = clampf(energy - ENERGY_DECAY_PER_HOUR, 0.0, MAX_STAT)

	if hunger <= 0.0 or energy <= 0.0:
		health = clampf(health - LOW_STAT_HEALTH_DAMAGE_PER_HOUR, 0.0, MAX_STAT)

	EventBus.player_stats_changed.emit("hunger", hunger)
	EventBus.player_stats_changed.emit("energy", energy)
	EventBus.player_stats_changed.emit("health", health)

	if energy <= 0.0:
		EventBus.player_energy_depleted.emit()


func eat(restore_amount: float) -> void:
	hunger = clampf(hunger + restore_amount, 0.0, MAX_STAT)
	EventBus.player_stats_changed.emit("hunger", hunger)


func spend_energy(amount: float) -> void:
	energy = clampf(energy - amount, 0.0, MAX_STAT)
	EventBus.player_stats_changed.emit("energy", energy)


func rest(restore_amount: float) -> void:
	energy = clampf(energy + restore_amount, 0.0, MAX_STAT)
	EventBus.player_stats_changed.emit("energy", energy)
