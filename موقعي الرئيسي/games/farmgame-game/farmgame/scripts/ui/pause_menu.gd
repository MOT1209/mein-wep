extends Control
## قائمة الإيقاف المؤقت: استئناف، حفظ، تحميل من ملف الحفظ

signal resume_requested

@onready var status_label: Label = $Panel/MarginContainer/VBoxContainer/StatusLabel
@onready var load_button: Button = $Panel/MarginContainer/VBoxContainer/LoadButton
@onready var resume_button: Button = $Panel/MarginContainer/VBoxContainer/ResumeButton
@onready var save_button: Button = $Panel/MarginContainer/VBoxContainer/SaveButton


func _ready() -> void:
	visible = false
	resume_button.pressed.connect(func() -> void: resume_requested.emit())
	save_button.pressed.connect(GameManager.save_game)
	load_button.pressed.connect(GameManager.load_game)
	EventBus.game_saved.connect(_on_game_saved)
	EventBus.game_loaded.connect(_on_game_loaded)


func open() -> void:
	status_label.text = ""
	load_button.disabled = not GameManager.has_save_file()
	visible = true


func close() -> void:
	visible = false


func _on_game_saved() -> void:
	status_label.text = "Game saved."
	load_button.disabled = not GameManager.has_save_file()


func _on_game_loaded() -> void:
	status_label.text = "Game loaded."
