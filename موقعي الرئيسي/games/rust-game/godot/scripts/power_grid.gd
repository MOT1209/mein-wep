extends Node
## The base's electrical system: wires, circuits and who gets fed.
##
## A wire joins two devices. Everything reachable from one another through
## wires is one circuit, and a circuit is solved as a single bus: add up what
## the generators, panels and turbines on it are making, add up what the
## turrets and traps on it want, and hand power out until it runs out.
##
## Gates — switches and motion sensors — are the exception. A gate that is
## closed does not pass power along, so everything wired behind it is dark.
## That is what turns a heap of turrets into something you can arm before you
## log off and disarm before you walk through your own front door.
##
## Batteries take the surplus and give it back when there is a shortfall,
## which is the only reason a solar-only base survives its first night.

## Devices are fed in ascending order of draw when a circuit is short, so a
## brown-out costs you the turret before it costs you the alarm that tells
## you why the turret stopped.
var world: Node3D
## Every wire, as an unordered pair of device node references.
var wires: Array = []

var _tick := 0.0


func _process(delta: float) -> void:
	if world == null or not world.started:
		return
	_tick += delta
	if _tick < Game.POWER_TICK:
		return
	solve(_tick)
	_tick = 0.0


# ==================== WIRING ====================

## Is there already a wire between these two?
func connected(a: Node, b: Node) -> bool:
	for w in wires:
		if (w[0] == a and w[1] == b) or (w[0] == b and w[1] == a):
			return true
	return false


## Runs a wire. Refuses a duplicate, a device joined to itself, and anything
## further apart than a wire will reach.
func connect_devices(a: Node, b: Node) -> bool:
	if a == null or b == null or a == b:
		return false
	if connected(a, b):
		Game.notify("Already wired together", Color(1.0, 0.63, 0.0))
		return false
	if a.global_position.distance_to(b.global_position) > Game.WIRE_RANGE:
		Game.notify("Too far apart to wire", Color(0.9, 0.3, 0.3))
		return false
	wires.append([a, b])
	_draw_wire(a, b)
	Game.notify("Wired %s to %s" % [a.label(), b.label()])
	Sfx.play("build")
	return true


## Drops every wire touching a device. Called when one is destroyed, so a
## blown turret does not leave its circuit holding a reference to nothing.
func disconnect_device(node: Node) -> void:
	var kept := []
	for w in wires:
		if w[0] != node and w[1] != node:
			kept.append(w)
			continue
		# Take the drawn line down with the wire it belongs to
		if w.size() > 2 and is_instance_valid(w[2]):
			w[2].queue_free()
	wires = kept


## A thin line between two devices so a base's wiring is visible rather than
## something you have to remember.
func _draw_wire(a: Node, b: Node) -> void:
	var from: Vector3 = a.global_position + Vector3.UP * 0.4
	var to: Vector3 = b.global_position + Vector3.UP * 0.4
	var span := from.distance_to(to)
	if span < 0.05:
		return
	var mi := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(0.05, 0.05, span)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.85, 0.25, 0.2)
	mat.roughness = 0.7
	box.material = mat
	mi.mesh = box
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	world.add_child(mi)
	mi.global_position = (from + to) * 0.5
	if not from.is_equal_approx(to):
		mi.look_at(to, Vector3.UP)
	# Kept on the wire itself so tearing the wire out takes the line with it
	wires[wires.size() - 1].append(mi)


# ==================== SOLVING ====================

## Everything on the grid: deployed devices plus the stations that want
## feeding (the powered recyclers).
func _nodes() -> Array:
	var out := []
	for d in world.devices:
		if is_instance_valid(d):
			out.append(d)
	for s in world.stations:
		if is_instance_valid(s) and s.power_draw() > 0.0:
			out.append(s)
	return out


## Neighbours of `node` that power may flow on to. A closed gate conducts
## nothing, so the search reaches it — that is how a sensor gets fed by the
## generator in front of it — and then stops there.
func _neighbours(node: Node, all: Dictionary) -> Array:
	var out := []
	if node.has_method("passes_power") and not node.passes_power():
		return out
	for w in wires:
		var other: Node = null
		if w[0] == node:
			other = w[1]
		elif w[1] == node:
			other = w[0]
		if other != null and is_instance_valid(other) and all.has(other):
			out.append(other)
	return out


## Splits the grid into circuits. A gate that is closed is reachable but
## does not conduct, so the search stops at it instead of crossing it.
func circuits() -> Array:
	var all := {}
	for n in _nodes():
		all[n] = true

	var seen := {}
	var out := []
	for start in all:
		if seen.has(start):
			continue
		var group := []
		var queue := [start]
		seen[start] = true
		while not queue.is_empty():
			var node: Node = queue.pop_front()
			group.append(node)
			for other in _neighbours(node, all):
				if seen.has(other):
					continue
				seen[other] = true
				queue.append(other)
		out.append(group)
	return out


## One pass over every circuit. `delta` is how much time this tick covers,
## which is what generators burn fuel over and batteries charge across.
func solve(delta: float) -> void:
	for group in circuits():
		_solve_circuit(group, delta)


func _solve_circuit(group: Array, delta: float) -> void:
	var supply := 0.0
	var batteries := []
	var loads := []

	for node in group:
		if node.has_method("power_output"):
			supply += node.power_output(delta)
		if node.has_method("is_battery") and node.is_battery():
			batteries.append(node)
			continue
		var draw: float = node.power_draw()
		if draw > 0.0:
			loads.append(node)

	# Smallest loads first: a shortfall should cost you the turret before it
	# costs you the alarm that tells you the turret has stopped.
	loads.sort_custom(func(a, b): return a.power_draw() < b.power_draw())

	var demand := 0.0
	for node in loads:
		demand += node.power_draw()

	# Batteries cover a shortfall and bank a surplus, in that order
	if demand > supply:
		for b in batteries:
			if supply >= demand:
				break
			supply += b.discharge(demand - supply, delta)

	var remaining := supply
	for node in loads:
		var draw: float = node.power_draw()
		var on := remaining >= draw
		if on:
			remaining -= draw
		node.set_powered(on)

	for b in batteries:
		if remaining <= 0.0:
			b.set_powered(false)
			continue
		remaining -= b.charge(remaining, delta)
		b.set_powered(true)


## Total generation and total draw on the circuit a device belongs to, for
## the HUD readout. Returns [supply, demand].
func circuit_reading(node: Node) -> Array:
	for group in circuits():
		if not (node in group):
			continue
		var supply := 0.0
		var demand := 0.0
		for other in group:
			if other.has_method("rated_output"):
				supply += other.rated_output()
			demand += other.power_draw()
		return [supply, demand]
	return [0.0, 0.0]
