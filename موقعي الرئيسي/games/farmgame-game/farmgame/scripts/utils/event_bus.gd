extends Node
## نظام الأحداث المركزي - يربط جميع أنظمة اللعبة ببعضها دون تبعيات مباشرة

# -- إشارات الوقت --
signal hour_changed(hour: int)
signal day_changed(day: int, day_of_week: int)
signal season_changed(season: String)
signal year_changed(year: int)

# -- إشارات اللاعب --
signal player_stats_changed(stat_name: String, value: float)
signal player_energy_depleted
signal player_moved(position: Vector3)

# -- إشارات المحاصيل --
signal crop_planted(crop: Node, grid_position: Vector2i)
signal crop_growth_stage_changed(crop: Node, stage: int)
signal crop_ready_to_harvest(crop: Node)
signal crop_harvested(crop: Node, yield_amount: int)
signal crop_died(crop: Node)

# -- إشارات الحيوانات --
signal animal_hunger_changed(animal: Node, hunger: float)
signal animal_product_ready(animal: Node, product_type: String)
signal animal_happiness_changed(animal: Node, happiness: float)

# -- إشارات الاقتصاد والمخزون --
signal money_changed(new_amount: int)
signal item_added(item_id: String, quantity: int)
signal item_removed(item_id: String, quantity: int)
signal inventory_full

# -- إشارات عامة --
signal tool_used(tool_type: String, target: Node)
signal game_saved
signal game_loaded
