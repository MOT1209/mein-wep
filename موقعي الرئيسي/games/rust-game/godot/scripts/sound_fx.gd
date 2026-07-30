extends Node
## Autoload "Sfx" — procedural sound effects, ported from the WebAudio SoundFX
## object. Each clip is synthesized once at startup into an AudioStreamWAV
## (noise burst + decaying tones), so the project needs no audio files.

const MIX_RATE := 22050

var _players: Dictionary = {}


func _ready() -> void:
	# UI sounds must still play while the tree is paused
	process_mode = Node.PROCESS_MODE_ALWAYS
	_register("harvest", _gen(0.15, 0.12, [[200.0, 0.08]]))
	_register("build", _gen(0.25, 0.18, [[80.0, 0.2], [120.0, 0.1]]))
	_register("hit", _gen(0.1, 0.1, [[300.0, 0.06]]))
	_register("upgrade", _gen(0.25, 0.0, [[400.0, 0.12], [600.0, 0.08]]))
	_register("ui_click", _gen(0.06, 0.0, [[800.0, 0.05]]))
	_register("door", _gen(0.18, 0.1, [[150.0, 0.1]]))
	_register("step", _gen(0.07, 0.05, []))
	_register("eat", _gen(0.2, 0.05, [[220.0, 0.08], [180.0, 0.06]]))
	_register("drink", _gen(0.25, 0.03, [[350.0, 0.06], [250.0, 0.05]]))
	_register("explosion", _gen(0.8, 0.5, [[55.0, 0.35], [80.0, 0.2]]))
	# Stripping a car sounds like neither chopping wood nor mining stone: a
	# scrape of sheet metal with a ring left in it afterwards.
	_register("metal_scrape", _gen(0.32, 0.22, [[520.0, 0.1], [780.0, 0.06]]))
	# Glass out of a window frame: a bright top with nothing underneath it.
	_register("glass_break", _gen(0.28, 0.16, [[1400.0, 0.09], [2100.0, 0.05]]))
	# Thunder is a roll, not a crack: long, low, and mostly noise.
	_register("thunder", _gen(1.6, 0.42, [[38.0, 0.3], [26.0, 0.22]]))
	_register("rain_start", _gen(0.9, 0.3, [[900.0, 0.05]]))


func _register(sfx_name: String, stream: AudioStreamWAV) -> void:
	var p := AudioStreamPlayer.new()
	p.stream = stream
	p.volume_db = -6.0
	add_child(p)
	_players[sfx_name] = p


func play(sfx_name: String) -> void:
	var p: AudioStreamPlayer = _players.get(sfx_name)
	if p != null:
		# Slight pitch variation keeps repeated sounds (footsteps) organic
		p.pitch_scale = randf_range(0.9, 1.1) if sfx_name == "step" else 1.0
		p.play()


func _gen(duration: float, noise_vol: float, tones: Array) -> AudioStreamWAV:
	var n := int(duration * MIX_RATE)
	var data := PackedByteArray()
	data.resize(n * 2)
	for i in n:
		var t := float(i) / MIX_RATE
		var fade := pow(1.0 - float(i) / float(n), 2.0)
		var s := (randf() * 2.0 - 1.0) * noise_vol * fade
		for tone in tones:
			s += sin(TAU * tone[0] * t) * tone[1] * exp(-t * 10.0)
		s = clampf(s, -1.0, 1.0)
		data.encode_s16(i * 2, int(s * 32000.0))
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = MIX_RATE
	wav.stereo = false
	wav.data = data
	return wav
