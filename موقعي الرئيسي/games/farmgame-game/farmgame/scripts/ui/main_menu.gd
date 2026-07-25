extends Control
## قائمة البداية: لعبة جديدة / متابعة / خروج

const MainScenePath: String = "res://scenes/main/main_scene.tscn"

@onready var continue_button: Button = $Panel/MarginContainer/VBoxContainer/ContinueButton


func _ready() -> void:
	continue_button.disabled = not GameManager.has_save_file()
	$Panel/MarginContainer/VBoxContainer/NewGameButton.pressed.connect(_on_new_game_pressed)
	continue_button.pressed.connect(_on_continue_pressed)
	$Panel/MarginContainer/VBoxContainer/QuitButton.pressed.connect(_on_quit_pressed)


func _on_new_game_pressed() -> void:
	GameManager.pending_load = false
	get_tree().change_scene_to_file(MainScenePath)


func _on_continue_pressed() -> void:
	GameManager.pending_load = true
	get_tree().change_scene_to_file(MainScenePath)


func _on_quit_pressed() -> void:
	get_tree().quit()
