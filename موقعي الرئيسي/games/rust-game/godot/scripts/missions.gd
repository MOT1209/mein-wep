extends Node
## Daily missions: three jobs drawn each in-game day, with a reward for each.
##
## Written as a counter that other systems push into rather than as something
## that watches them. `record()` is called from the six places where the thing
## it counts actually happens, which means a mission can never drift out of
## step with the game — there is no polling and nothing to miss.
##
## The point of them is direction. A survival map with no objectives is a place
## you wander; three small jobs a day is enough to make you choose a heading
## without ever telling you what to do.

## What can be asked of you. `kind` is the counter the mission reads, `target`
## the range a roll picks from, and `reward` what it pays. Every one of these
## is something the game already tracks the moment it happens.
const POOL := [
	{"id": "gather_wood", "kind": "harvest_wood", "name": "اجمع الخشب",
		"target": [200, 500], "reward": {"scrap": 15}},
	{"id": "gather_stone", "kind": "harvest_stone", "name": "اجمع الحجر",
		"target": [150, 400], "reward": {"scrap": 15}},
	{"id": "build", "kind": "build", "name": "ابنِ قطعًا",
		"target": [4, 10], "reward": {"wood": 300}},
	{"id": "craft", "kind": "craft", "name": "اصنع أدوات",
		"target": [3, 8], "reward": {"scrap": 20}},
	{"id": "hunt", "kind": "hunt", "name": "اصطد حيوانات",
		"target": [2, 5], "reward": {"cloth": 60}},
	{"id": "strip", "kind": "wreck", "name": "فكّك سيارات محطمة",
		"target": [1, 3], "reward": {"frag": 80}},
	{"id": "monument", "kind": "monument", "name": "زُر نصبًا",
		"target": [1, 1], "reward": {"scrap": 40}},
	{"id": "smelt", "kind": "smelt", "name": "اصهر الخام",
		"target": [20, 60], "reward": {"lgf": 25}},
	{"id": "survive", "kind": "survive_day", "name": "انجُ يومًا كاملًا",
		"target": [1, 1], "reward": {"scrap": 50}},
]

const DAILY_COUNT := 3
## How close to a monument counts as visiting it.
const MONUMENT_RADIUS := 30.0

signal missions_changed

var world: Node3D

## The live set: [{id, kind, name, target, progress, reward, done, claimed}]
var active: Array = []
## Which in-game day the set was drawn for, so a new day draws a new set.
var day := -1


func setup(w: Node3D) -> void:
	world = w
	# Systems report what the player did through one signal on Game, so nothing
	# in the game has to know that missions exist in order to advance them.
	Game.activity.connect(record)
	if active.is_empty():
		roll(current_day())


## Which day it is, counting from the world clock rather than from real time —
## a daily in a game with a 800-second day should turn over with the game's
## sun and not with the player's calendar.
func current_day() -> int:
	if world == null:
		return 0
	return int(world.clock / Game.DAY_LENGTH)


## Draws a fresh set, without repeating a mission inside one day.
func roll(for_day: int) -> void:
	day = for_day
	active.clear()
	var bag := POOL.duplicate()
	bag.shuffle()
	for i in mini(DAILY_COUNT, bag.size()):
		var spec: Dictionary = bag[i]
		var span: Array = spec.target
		active.append({
			"id": str(spec.id),
			"kind": str(spec.kind),
			"name": str(spec.name),
			"target": randi_range(int(span[0]), int(span[1])),
			"progress": 0,
			"reward": spec.reward.duplicate(),
			"done": false,
			"claimed": false,
		})
	missions_changed.emit()


func _process(_delta: float) -> void:
	if world == null or not world.started:
		return
	if current_day() != day:
		roll(current_day())
	_check_monument()


## Counts something towards whatever missions are watching for it. Safe to call
## from anywhere and for anything — a kind nobody is tracking today costs one
## comparison and does nothing.
func record(kind: String, amount: int = 1) -> void:
	if amount <= 0:
		return
	var changed := false
	for m in active:
		if m.done or str(m.kind) != kind:
			continue
		m.progress = mini(int(m.target), int(m.progress) + amount)
		changed = true
		if int(m.progress) >= int(m.target):
			m.done = true
			_pay(m)
	if changed:
		missions_changed.emit()


## Pays out the moment the job is finished, rather than making the player come
## back and press a button for something they have already earned.
func _pay(m: Dictionary) -> void:
	var parts := []
	for res in m.reward:
		var got := Game.add_item(str(res), int(m.reward[res]))
		if got > 0:
			parts.append("%d %s" % [got, Game.ITEMS.get(res, {}).get("name", res)])
	m.claimed = true
	if parts.is_empty():
		Game.notify("Mission complete: %s — no room for the reward" % m.name,
			Color(1.0, 0.63, 0.0))
	else:
		Game.notify("Mission complete: %s   +%s" % [m.name, " · ".join(parts)],
			Game.ACCENT)
	Sfx.play("upgrade")


## Standing inside a monument's radiation ring counts as visiting it.
func _check_monument() -> void:
	if world.player == null:
		return
	var at := Vector2(world.player.global_position.x, world.player.global_position.z)
	for zone in world.rad_zones:
		if at.distance_to(zone) < MONUMENT_RADIUS:
			record("monument")
			return


func done_count() -> int:
	var n := 0
	for m in active:
		if m.done:
			n += 1
	return n


## 0..1 across the whole day's set, for a single readout of how the day is
## going.
func overall() -> float:
	if active.is_empty():
		return 0.0
	var total := 0.0
	# Each mission counts the same regardless of how big its own target is
	for m in active:
		total += clampf(float(m.progress) / maxf(1.0, float(m.target)), 0.0, 1.0)
	return total / float(active.size())


## Saved so a day's progress survives a reload rather than resetting whenever
## the player closes the game.
func to_save() -> Dictionary:
	return {"day": day, "active": active}


func from_save(data: Dictionary) -> void:
	if not (data.get("active", []) is Array):
		return
	var restored := []
	for m in data.active:
		if not (m is Dictionary) or not m.has("kind"):
			continue
		restored.append({
			"id": str(m.get("id", "")),
			"kind": str(m.get("kind", "")),
			"name": str(m.get("name", "")),
			"target": maxi(1, int(m.get("target", 1))),
			"progress": maxi(0, int(m.get("progress", 0))),
			"reward": m.get("reward", {}) if m.get("reward", {}) is Dictionary else {},
			"done": bool(m.get("done", false)),
			"claimed": bool(m.get("claimed", false)),
		})
	if restored.is_empty():
		return
	active = restored
	day = int(data.get("day", 0))
	missions_changed.emit()
