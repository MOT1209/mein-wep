extends Node
## النظام الاقتصادي: يدير مال اللاعب وعمليات البيع/الشراء

const STARTING_MONEY: int = 500

var money: int = STARTING_MONEY


func add_money(amount: int) -> void:
	if amount <= 0:
		return
	money += amount
	EventBus.money_changed.emit(money)


func spend_money(amount: int) -> bool:
	if amount <= 0 or amount > money:
		return false
	money -= amount
	EventBus.money_changed.emit(money)
	return true


func can_afford(amount: int) -> bool:
	return money >= amount


func sell_item(item_id: String, quantity: int, unit_price: int) -> bool:
	if not InventorySystem.remove_item(item_id, quantity):
		return false
	add_money(unit_price * quantity)
	return true


func buy_item(item_id: String, quantity: int, unit_price: int) -> bool:
	var total_cost: int = unit_price * quantity
	if not spend_money(total_cost):
		return false
	InventorySystem.add_item(item_id, quantity)
	return true


func get_save_data() -> Dictionary:
	return {"money": money}


func load_save_data(data: Dictionary) -> void:
	money = data.get("money", STARTING_MONEY)
