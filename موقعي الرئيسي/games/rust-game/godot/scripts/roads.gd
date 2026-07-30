extends Node3D
## Roads, and the leftovers of whoever built them.
##
## The world had nothing man-made in it but two towers: everywhere looked the
## same, so there was no reason to walk in one direction over another. A road
## fixes that on its own — it is a line across the map that says "things are
## this way", and putting the wrecks and the houses on it means the loot is
## somewhere you can decide to go rather than somewhere you stumble over.
##
## The road follows the terrain rather than cutting into it: the terrain mesh
## is generated once from a static height function, so the honest way to lay a
## road on it is to sample that function per vertex and float the surface a few
## centimetres above the ground.

const ROAD_WIDTH := 7.0
## How often the strip is sampled along its length. Short enough to follow a
## hill, long enough not to build a mesh the size of the terrain. Half a
## terrain quad, so the strip tracks the ground the player actually walks on
## rather than cutting the corner off every rise.
const ROAD_STEP := 1.6
## Lifted this far off the ground.
##
## Seven centimetres was not enough for two reasons, and both showed. The
## terrain is drawn as flat quads 3.3m across while the road samples the smooth
## height function it was built from, so on a rise the ground rendered *above*
## the road and tore jagged holes through it. And 7cm is inside the shadow
## bias, so the terrain cast its own shadow onto the road lying on it and the
## whole surface came out near-black. Clearing both costs a float small enough
## that nobody standing on it can tell.
const ROAD_LIFT := 0.3
## Dashes down the middle.
const LINE_WIDTH := 0.32
const DASH_LENGTH := 2.6
const DASH_GAP := 3.4

## Roadside content, per kilometre of road, near enough.
const WRECKS_PER_SEGMENT := 0.55
const HOUSES_PER_SEGMENT := 0.35
const SIGNS_PER_SEGMENT := 0.3
const BARRELS_PER_SEGMENT := 0.9

## How far off the centre line the buildings sit, and the wrecks.
const HOUSE_OFFSET := Vector2(9.0, 16.0)
const WRECK_OFFSET := 2.4

var world: Node3D

## The centre line, in order. Used by the map and by anything that wants to
## know whether it is near a road.
var waypoints: PackedVector2Array = PackedVector2Array()
## Where the roadside props went, so the map can draw them and tests can find
## them: [{kind, pos}]
var landmarks: Array = []


## Lays out the network and builds everything on it. Called once, from the
## world's own setup, before the resource scatter so the scatter can avoid it.
func generate(monuments: Array) -> void:
	waypoints = _plan_route(monuments)
	if waypoints.size() < 2:
		return
	_build_surface()
	_place_roadside()


## A route that is worth walking: out from the spawn, past each monument, and
## back round. Monuments are where the good loot is, so the road going there
## is what makes it a road and not decoration.
func _plan_route(monuments: Array) -> PackedVector2Array:
	var out := PackedVector2Array()
	var edge: float = Game.WORLD_SIZE * 0.36
	out.append(Vector2(0.0, -edge))
	# Bend towards each monument in turn, without running straight over it
	for m in monuments:
		var to_m: Vector2 = m
		var approach := to_m + to_m.normalized() * -14.0
		out.append(approach)
	out.append(Vector2(edge, edge * 0.4))
	out.append(Vector2(-edge * 0.6, edge))
	out.append(Vector2(-edge, 0.0))
	out.append(out[0])
	return out


# ==================== SURFACE ====================

## One mesh for the whole road, built as a strip of quads that follows the
## ground. Built as a single surface rather than a node per segment: a hundred
## MeshInstances would cost a hundred draw calls for something the player walks
## over without looking at.
func _build_surface() -> void:
	var verts := PackedVector3Array()
	var normals := PackedVector3Array()
	var colors := PackedColorArray()
	var line_verts := PackedVector3Array()

	var dash_run := 0.0
	for i in waypoints.size() - 1:
		var a: Vector2 = waypoints[i]
		var b: Vector2 = waypoints[i + 1]
		var span := a.distance_to(b)
		if span < 0.5:
			continue
		var steps := maxi(1, int(span / ROAD_STEP))
		var dir := (b - a) / span
		var side := Vector2(-dir.y, dir.x) * (ROAD_WIDTH * 0.5)

		for s in steps:
			var t0 := float(s) / float(steps)
			var t1 := float(s + 1) / float(steps)
			var p0 := a.lerp(b, t0)
			var p1 := a.lerp(b, t1)
			_quad(verts, normals, colors,
				p0 - side, p0 + side, p1 + side, p1 - side)

			# Centre dashes, measured along the road so they stay even
			var seg_len := span / float(steps)
			var before := dash_run
			dash_run += seg_len
			if fmod(before, DASH_LENGTH + DASH_GAP) < DASH_LENGTH:
				var narrow := Vector2(-dir.y, dir.x) * (LINE_WIDTH * 0.5)
				_quad(line_verts, null, null,
					p0 - narrow, p0 + narrow, p1 + narrow, p1 - narrow, 0.02)

	_add_surface("RoadSurface", verts, normals, colors, "asphalt")
	_add_surface("RoadLines", line_verts, null, null, "line")


## Two triangles between four corners, each corner dropped onto the terrain.
func _quad(verts: PackedVector3Array, normals, colors,
		c0: Vector2, c1: Vector2, c2: Vector2, c3: Vector2,
		extra_lift: float = 0.0) -> void:
	var lift := ROAD_LIFT + extra_lift
	var v0 := Vector3(c0.x, road_height(c0) + lift, c0.y)
	var v1 := Vector3(c1.x, road_height(c1) + lift, c1.y)
	var v2 := Vector3(c2.x, road_height(c2) + lift, c2.y)
	var v3 := Vector3(c3.x, road_height(c3) + lift, c3.y)
	verts.append_array(PackedVector3Array([v0, v1, v2, v0, v2, v3]))
	if normals != null:
		var n := (v1 - v0).cross(v3 - v0).normalized()
		if n.y < 0.0:
			n = -n
		for i in 6:
			normals.append(n)
	if colors != null:
		# A little patchiness so a long road is not one flat sheet
		var wear := Color(1, 1, 1).lerp(Color(1.5, 1.5, 1.55),
			absf(sin(c0.x * 0.17) * cos(c0.y * 0.13)))
		for i in 6:
			colors.append(wear)


func _add_surface(node_name: String, verts: PackedVector3Array,
		normals, colors, kind: String) -> void:
	if verts.is_empty():
		return
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = verts
	if normals != null:
		arrays[Mesh.ARRAY_NORMAL] = normals
	if colors != null:
		arrays[Mesh.ARRAY_COLOR] = colors
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)

	var mat := StandardMaterial3D.new()
	if kind == "asphalt":
		mat.albedo_color = Color8(68, 69, 74)
		mat.roughness = 0.92
		mat.vertex_color_use_as_albedo = colors != null
	else:
		mat.albedo_color = Color8(210, 199, 158)
		mat.roughness = 0.8
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mesh.surface_set_material(0, mat)

	var mi := MeshInstance3D.new()
	mi.name = node_name
	mi.mesh = mesh
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(mi)


# ==================== WHAT IS ON IT ====================

## Wrecks on the tarmac, houses and signs beside it, barrels in the ditch.
## Densities are per segment rather than absolute, so a longer route is a
## busier one and the numbers stay readable.
func _place_roadside() -> void:
	for i in waypoints.size() - 1:
		var a: Vector2 = waypoints[i]
		var b: Vector2 = waypoints[i + 1]
		var span := a.distance_to(b)
		if span < 12.0:
			continue
		var dir := (b - a) / span
		var side := Vector2(-dir.y, dir.x)

		_scatter_along(a, b, dir, side, WRECKS_PER_SEGMENT, "wreck")
		_scatter_along(a, b, dir, side, HOUSES_PER_SEGMENT, "house")
		_scatter_along(a, b, dir, side, SIGNS_PER_SEGMENT, "sign")
		_scatter_along(a, b, dir, side, BARRELS_PER_SEGMENT, "barrel")


func _scatter_along(a: Vector2, b: Vector2, dir: Vector2, side: Vector2,
		density: float, kind: String) -> void:
	var count := int(round(density * maxf(1.0, a.distance_to(b) / 90.0)))
	for i in count:
		# Kept off the very ends so nothing lands in a corner of the route
		var t := randf_range(0.12, 0.88)
		var at := a.lerp(b, t)
		match kind:
			"wreck":
				_spawn_wreck(at + side * randf_range(-WRECK_OFFSET, WRECK_OFFSET),
					dir)
			"house":
				var sign_ := 1.0 if randf() < 0.5 else -1.0
				_spawn_building(at + side * sign_
					* randf_range(HOUSE_OFFSET.x, HOUSE_OFFSET.y), dir, sign_)
			"sign":
				var sside := 1.0 if randf() < 0.5 else -1.0
				_spawn_prop("road_sign",
					at + side * sside * randf_range(5.0, 6.5), dir)
			"barrel":
				world.spawn_resource("barrel", _on_ground(
					at + side * (1.0 if randf() < 0.5 else -1.0)
					* randf_range(4.6, 8.0)))


## Height of the road surface at a point: the ground, except where the route
## crosses water, where it rides above it as a causeway. Tarmac laid on the
## lake bed was what the first pass produced, and underwater asphalt reads as a
## bug rather than as a road.
const CAUSEWAY_CLEARANCE := 0.35


func road_height(at: Vector2) -> float:
	return maxf(world.terrain_height(at.x, at.y),
		world.WATER_LEVEL + CAUSEWAY_CLEARANCE)


func _on_ground(at: Vector2) -> Vector3:
	return Vector3(at.x, road_height(at), at.y)


## A wreck is a harvestable, not scenery: it is the reason to walk the road.
func _spawn_wreck(at: Vector2, dir: Vector2) -> void:
	var node: StaticBody3D = world.spawn_resource("car_wreck", _on_ground(at))
	if node != null:
		# Roughly along the road, shunted off the line as if it stopped badly
		node.rotation.y = -dir.angle() + randf_range(-0.5, 0.5)
	landmarks.append({"kind": "wreck", "pos": at})


## Houses are scenery you can walk into and shoot through, so they are static
## bodies on the terrain layer with a box each. A real interior would want the
## building system's collision, and these are not built pieces.
func _spawn_building(at: Vector2, dir: Vector2, facing: float) -> void:
	var kind: String = ["house_small", "house_ruin", "shed"][randi() % 3]
	var node := _spawn_prop(kind, at, dir)
	if node != null:
		# Face the road, whichever side of it the house is on
		node.rotation.y = -dir.angle() + (0.0 if facing > 0.0 else PI) \
			+ randf_range(-0.12, 0.12)
	landmarks.append({"kind": kind, "pos": at})


## A modelled prop with a collision box around it. Terrain layer, because the
## player and the creatures should both walk into it.
func _spawn_prop(id: String, at: Vector2, dir: Vector2) -> StaticBody3D:
	var ModelRegistry = load("res://scripts/model_registry.gd")
	var model: Node3D = ModelRegistry.spawn(id)
	if model == null:
		return null
	var body := StaticBody3D.new()
	body.name = id.capitalize()
	body.collision_layer = 1
	body.collision_mask = 0
	body.add_child(model)

	# Collision from the model's own bounds, which is right for scenery: these
	# are not grid pieces and have no declared size to read.
	var bounds := _model_bounds(model)
	if bounds.size != Vector3.ZERO:
		var cs := CollisionShape3D.new()
		var shape := BoxShape3D.new()
		shape.size = bounds.size
		cs.shape = shape
		cs.position = bounds.get_center()
		body.add_child(cs)

	body.position = _on_ground(at)
	body.rotation.y = -dir.angle()
	add_child(body)
	return body


func _model_bounds(node: Node3D) -> AABB:
	var out := AABB()
	var first := true
	for child in _descendants(node):
		if not (child is GeometryInstance3D):
			continue
		var gi := child as GeometryInstance3D
		var box := gi.transform * gi.get_aabb()
		if first:
			out = box
			first = false
		else:
			out = out.merge(box)
	return out


func _descendants(node: Node) -> Array:
	var out := []
	for c in node.get_children():
		out.append(c)
		out.append_array(_descendants(c))
	return out


# ==================== QUERIES ====================

## How far a point is from the nearest stretch of road. Used to keep the
## resource scatter off the tarmac and to draw the road on the map.
func distance_to_road(at: Vector2) -> float:
	if waypoints.size() < 2:
		return INF
	var best := INF
	for i in waypoints.size() - 1:
		best = minf(best, _distance_to_segment(at, waypoints[i], waypoints[i + 1]))
	return best


func on_road(at: Vector2) -> bool:
	return distance_to_road(at) <= ROAD_WIDTH * 0.5


static func _distance_to_segment(p: Vector2, a: Vector2, b: Vector2) -> float:
	var ab := b - a
	var len_sq := ab.length_squared()
	if len_sq < 0.0001:
		return p.distance_to(a)
	var t := clampf((p - a).dot(ab) / len_sq, 0.0, 1.0)
	return p.distance_to(a + ab * t)
