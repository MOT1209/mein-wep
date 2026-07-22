extends Node3D
## يدير حظيرة الحيوانات ويوزّعها في منطقة مخصصة

const AnimalScene: PackedScene = preload("res://scenes/entities/animal.tscn")

## أمام باب مبنى الحظيرة (المبنى نفسه عند 18,-8 في building_manager.gd ويمتد حتى z=-4)
## حتى لا تولد الحيوانات داخل جدران المبنى
@export var barn_center: Vector3 = Vector3(18.0, 0.0, 0.0)
@export var barn_radius: float = 4.0
@export var max_animals: int = 20

var animals: Array = []


func _ready() -> void:
	add_to_group("animal_barn")
	EventBus.animal_product_ready.connect(_on_animal_product_ready)


func buy_animal(animal_id: String) -> bool:
	if animals.size() >= max_animals:
		return false

	var animal_info: Dictionary = AnimalData.get_animal(animal_id)
	if animal_info.is_empty():
		return false

	var cost: int = animal_info.get("cost", 0)
	if not EconomySystem.can_afford(cost):
		return false

	EconomySystem.spend_money(cost)

	var animal: Node3D = AnimalScene.instantiate()
	animal.animal_id = animal_id
	add_child(animal)

	## وضع الحيوان في موقع عشوائي داخل الحظيرة، وتثبيت مركز تجوّله عليها
	var angle: float = randf() * TAU
	var distance: float = randf() * barn_radius * 0.8
	animal.global_position = barn_center + Vector3(cos(angle) * distance, 0, sin(angle) * distance)
	animal.home_position = barn_center

	animals.append(animal)
	EventBus.money_changed.emit(EconomySystem.money)
	return true


func get_animals_info() -> Array[Dictionary]:
	var info: Array[Dictionary] = []
	for animal in animals:
		info.append(animal.get_info())
	return info


func get_animal_count() -> int:
	return animals.size()


func feed_all_animals() -> void:
	for animal in animals:
		animal.feed()


func collect_all_products() -> int:
	var collected: int = 0
	for animal in animals:
		if animal.collect_product():
			collected += 1
	return collected


func _on_animal_product_ready(animal: Node, product_type: String) -> void:
	## يمكن إضافة إشعار هنا
	pass
