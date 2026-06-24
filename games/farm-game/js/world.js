var GAME = GAME || {};
GAME.world = {
  scene: null,
  objects: [],

  init: function(scene) {
    this.scene = scene;
    if (GAME.collision) GAME.collision.clear();
    this.createSky();
    this.createGround();
    this.createPlayerHouse();
    this.createBarn();
    this.createMarket();
    this.createFarmPlots();
    this.createTrees();
    this.createFences();
    this.createPond();
    this.createFlowers();
    this.createAnimalPens();
    this.createFeedingTrough();
    this.createDirtPath();
    this.createScarecrow();
    this.createWell();
  },

  createSky: function() {
    var s = this.scene;
    s.background = new THREE.Color(0x87CEEB);
    s.fog = new THREE.Fog(0x87CEEB, 70, 110);

    var hemi = new THREE.HemisphereLight(0x87CEEB, 0x7ec850, 0.6);
    s.add(hemi);
    var sun = new THREE.DirectionalLight(0xffeedd, 1.0);
    sun.position.set(30, 40, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 100;
    s.add(sun);
    var amb = new THREE.AmbientLight(0x404060, 0.3);
    s.add(amb);
  },

  createGround: function() {
    var geo = new THREE.PlaneGeometry(120, 120, 60, 60);
    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), z = pos.getY(i);
      var dist = Math.sqrt(x * x + z * z);
      var h = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 0.15;
      if (dist < 8) h = 0;
      pos.setZ(i, h);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    var mat = new THREE.MeshLambertMaterial({ color: 0x7ec850 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.objects.push(mesh);
  },

  createBuilding: function(x, z, w, d, wallColor, roofColor, height) {
    if (!height) height = 3;
    var group = new THREE.Group();
    var wallMat = new THREE.MeshLambertMaterial({ color: wallColor });
    var wall = new THREE.Mesh(new THREE.BoxGeometry(w, height, d), wallMat);
    wall.position.y = height / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);
    var roofMat = new THREE.MeshLambertMaterial({ color: roofColor });
    var roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.7, 1.8, 4), roofMat);
    roof.position.y = height + 0.9;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    group.position.set(x, 0, z);
    this.scene.add(group);
    this.objects.push(group);
    var hw = w / 2, hd = d / 2;
    GAME.collision.addBox([x - hw - 0.3, 0, z - hd - 0.3], [x + hw + 0.3, height + 2, z + hd + 0.3]);
    return group;
  },

  createPlayerHouse: function() {
    this.createBuilding(-15, -15, 7, 5.5, 0xd4a574, 0x8b4513, 2.8);
    var doorMat = new THREE.MeshLambertMaterial({ color: 0x5d3a1a });
    var door = new THREE.Mesh(new THREE.BoxGeometry(1, 1.8, 0.1), doorMat);
    door.position.set(-15, 0.9, -12.3);
    this.scene.add(door); this.objects.push(door);
    var winMat = new THREE.MeshLambertMaterial({ color: 0x88ccff });
    var win1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), winMat);
    win1.position.set(-16.5, 1.6, -12.3); this.scene.add(win1); this.objects.push(win1);
    var win2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), winMat);
    win2.position.set(-13.5, 1.6, -12.3); this.scene.add(win2); this.objects.push(win2);
  },

  createBarn: function() {
    this.createBuilding(16, -12, 8, 6, 0xa83232, 0x5c1a1a, 3.5);
    var doorMat = new THREE.MeshLambertMaterial({ color: 0x4a2800 });
    var door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.1), doorMat);
    door.position.set(16, 1.1, -8.7);
    this.scene.add(door); this.objects.push(door);
  },

  createMarket: function() {
    var group = new THREE.Group();
    var postMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    var roofMat = new THREE.MeshLambertMaterial({ color: 0xe67e22 });
    for (var i = -2; i <= 2; i += 2) {
      for (var j = -2; j <= 2; j += 2) {
        var post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.5), postMat);
        post.position.set(i, 1.25, j);
        post.castShadow = true;
        group.add(post);
      }
    }
    var roof = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 5), roofMat);
    roof.position.y = 2.6; roof.castShadow = true; roof.receiveShadow = true;
    group.add(roof);
    var clothMat = new THREE.MeshLambertMaterial({ color: 0xffdd77, transparent: true, opacity: 0.3 });
    for (var s = 0; s < 4; s++) {
      var side = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.8), clothMat);
      var angle = (s / 4) * Math.PI * 2;
      side.position.set(Math.sin(angle) * 2.3, 2.2, Math.cos(angle) * 2.3);
      side.rotation.y = -angle;
      group.add(side);
    }
    var counter = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 0.8), new THREE.MeshLambertMaterial({ color: 0x8B7355 }));
    counter.position.set(0, 0.4, 0.5);
    group.add(counter);
    group.position.set(0, 0, -22);
    this.scene.add(group); this.objects.push(group);
    GAME.collision.addBox([-3, 0, -25], [3, 3, -19]);
  },

  createFarmPlots: function() {
    var dirtMat = new THREE.MeshLambertMaterial({ color: 0x5d3a1a });
    var edgeMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
    var plotsPerRow = 6;
    var spacing = 2.8;
    var startX = -(plotsPerRow - 1) * spacing / 2;
    var startZ = 2;
    for (var row = 0; row < 6; row++) {
      for (var col = 0; col < plotsPerRow; col++) {
        var px = startX + col * spacing;
        var pz = startZ + row * spacing;
        var dirt = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 2.4), dirtMat);
        dirt.position.set(px, 0.05, pz);
        dirt.receiveShadow = true;
        this.scene.add(dirt); this.objects.push(dirt);
        var edge = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 2.6), edgeMat);
        edge.position.set(px, 0.025, pz);
        this.scene.add(edge); this.objects.push(edge);
      }
    }
    var fenceMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    var fw = (plotsPerRow) * spacing / 2 + 2.2;
    var fd = (6) * spacing / 2 + 2.2;
    var fx = startX, fz = startZ;
    var bounds = [
      { x: fx - fw, z: fz - fd - 1.2, w: 0.1, d: fd * 2 + 2.4 },
      { x: fx + fw, z: fz - fd - 1.2, w: 0.1, d: fd * 2 + 2.4 },
      { x: fx - fw, z: fz - fd - 1.2, w: fw * 2 + 0.1, d: 0.1 },
      { x: fx - fw, z: fz + fd + 1.2, w: fw * 2 + 0.1, d: 0.1 }
    ];
    for (var b = 0; b < bounds.length; b++) {
      var f = new THREE.Mesh(new THREE.BoxGeometry(bounds[b].w, 0.6, bounds[b].d), fenceMat);
      f.position.set(bounds[b].x, 0.3, bounds[b].z);
      f.castShadow = true;
      this.scene.add(f); this.objects.push(f);
    }
  },

  createTrees: function() {
    var trunkColors = [0x8B5A2B, 0x6b4423, 0x5d3a1a, 0x7a4a2a];
    var leafColors = [0x3a7d2c, 0x2d6b1e, 0x4a8c3f, 0x5a9a4a, 0x228B22];
    var treeTypes = [
      // [positions]
      [-25, -25], [22, -28], [26, 5], [-28, 8], [-22, 22], [20, 20],
      [30, -15], [-30, -5], [-8, -28], [10, -30], [-35, 18], [35, -22],
      [-20, -8], [24, -5], [15, -32], [-32, -2], [-5, 25], [28, -20],
      // Extra trees for more forest feel
      [-27, -20], [27, -18], [-25, 10], [30, 18], [18, -26], [-18, -30],
      [30, -28], [-30, 28], [10, 28], [-10, 28]
    ];
    for (var i = 0; i < treeTypes.length; i++) {
      var group = new THREE.Group();
      var trunkMat = new THREE.MeshLambertMaterial({ color: trunkColors[Math.floor(Math.random() * trunkColors.length)] });
      var trunkH = 1.5 + Math.random() * 1.2;
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, trunkH), trunkMat);
      trunk.position.y = trunkH / 2;
      trunk.castShadow = true;
      group.add(trunk);
      
      // Random tree shape: round (sphere) or cone (pine)
      var isPine = Math.random() < 0.2;
      var leafMat = new THREE.MeshLambertMaterial({ color: leafColors[Math.floor(Math.random() * leafColors.length)] });
      if (isPine) {
        // Pine tree shape with stacked cones
        var cone1 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.8, 6), leafMat);
        cone1.position.y = trunkH + 0.4; cone1.castShadow = true; group.add(cone1);
        var cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.7, 6), leafMat);
        cone2.position.y = trunkH + 0.9; cone2.castShadow = true; group.add(cone2);
        var cone3 = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 6), leafMat);
        cone3.position.y = trunkH + 1.3; cone3.castShadow = true; group.add(cone3);
      } else {
        // Round tree - one or two spheres
        var leafR = 0.8 + Math.random() * 0.8;
        var leaf = new THREE.Mesh(new THREE.SphereGeometry(leafR, 6, 6), leafMat);
        leaf.position.y = trunkH + 0.2 + Math.random() * 0.5;
        leaf.scale.y = 0.85;
        leaf.castShadow = true;
        group.add(leaf);
        if (Math.random() < 0.4) {
          var leaf2 = new THREE.Mesh(new THREE.SphereGeometry(leafR * 0.7, 6, 6), leafMat);
          leaf2.position.set(0.5 + Math.random() * 0.3, trunkH + 0.1, 0.4 + Math.random() * 0.3);
          leaf2.castShadow = true;
          group.add(leaf2);
        }
      }
      group.position.set(treeTypes[i][0], 0, treeTypes[i][1]);
      group.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(group);
      this.objects.push(group);
    }
  },

  createFences: function() {
    var fenceMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    var postsMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
    var fenceSegments = [
      { x1: -30, z1: 10, x2: -10, z2: 10 },
      { x1: -30, z1: -8, x2: -10, z2: -8 },
      { x1: 10, z1: -10, x2: 28, z2: -10 },
      { x1: 10, z1: -30, x2: 28, z2: -30 },
      { x1: -10, z1: 12, x2: -10, z2: 28 },
      { x1: 12, z1: 10, x2: 12, z2: 28 }
    ];
    for (var s = 0; s < fenceSegments.length; s++) {
      var seg = fenceSegments[s];
      var mx = (seg.x1 + seg.x2) / 2, mz = (seg.z1 + seg.z2) / 2;
      var dx = seg.x2 - seg.x1, dz = seg.z2 - seg.z1;
      var len = Math.sqrt(dx * dx + dz * dz);
      var angle = Math.atan2(dx, dz);
      var rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, len), fenceMat);
      rail.position.set(mx, 0.4, mz);
      rail.rotation.y = angle;
      rail.castShadow = true;
      this.scene.add(rail); this.objects.push(rail);
      var steps = Math.floor(len / 2);
      for (var p = 0; p <= steps; p++) {
        var t = steps > 0 ? p / steps : 0.5;
        var px = seg.x1 + t * dx, pz = seg.z1 + t * dz;
        var post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), postsMat);
        post.position.set(px, 0.45, pz);
        post.castShadow = true;
        this.scene.add(post); this.objects.push(post);
      }
    }
  },

  createPond: function() {
    var waterMat = new THREE.MeshLambertMaterial({ color: 0x4a90d9, transparent: true, opacity: 0.7 });
    var water = new THREE.Mesh(new THREE.CircleGeometry(4, 24), waterMat);
    water.position.set(-10, 0.02, -27);
    water.rotation.x = -Math.PI / 2;
    water.receiveShadow = true;
    this.scene.add(water); this.objects.push(water);
    var rockMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    var rockPos = [[-13, -29], [-7, -29], [-8, -24], [-13, -25], [-11, -31], [-8, -27]];
    for (var i = 0; i < rockPos.length; i++) {
      var rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.4), rockMat);
      rock.position.set(rockPos[i][0], 0.1, rockPos[i][1]);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      this.scene.add(rock); this.objects.push(rock);
    }
    GAME.collision.addBox([-14, 0, -31], [-6, 1, -23]);
  },

  createFlowers: function() {
    var colors = [0xff6b6b, 0xffd93d, 0xff8a5c, 0xc084fc, 0xf472b6];
    for (var i = 0; i < 120; i++) {
      var x = (Math.random() - 0.5) * 100;
      var z = (Math.random() - 0.5) * 100;
      if (Math.abs(x) < 35 && Math.abs(z) < 35) continue;
      if (Math.abs(x - (-10)) < 5 && Math.abs(z - (-27)) < 5) continue;
      var col = colors[Math.floor(Math.random() * colors.length)];
      var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3), new THREE.MeshLambertMaterial({ color: 0x3a7d2c }));
      stem.position.set(x, 0.15, z);
      this.scene.add(stem); this.objects.push(stem);
      var head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 4, 4), new THREE.MeshLambertMaterial({ color: col }));
      head.position.set(x, 0.35, z);
      this.scene.add(head); this.objects.push(head);
    }
  },

  createAnimalPens: function() {
    var fenceMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    var postsMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
    var minX = 10, maxX = 23, minZ = -19, maxZ = -5;
    var edges = [
      { x1: minX, z1: minZ, x2: maxX, z2: minZ },
      { x1: maxX, z1: minZ, x2: maxX, z2: maxZ },
      { x1: maxX, z1: maxZ, x2: minX, z2: maxZ },
      { x1: minX, z1: maxZ, x2: minX, z2: minZ }
    ];
    for (var e = 0; e < edges.length; e++) {
      var seg = edges[e];
      var mx = (seg.x1 + seg.x2) / 2, mz = (seg.z1 + seg.z2) / 2;
      var dx = seg.x2 - seg.x1, dz = seg.z2 - seg.z1;
      var len = Math.sqrt(dx * dx + dz * dz);
      var angle = Math.atan2(dx, dz);
      var rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, len), fenceMat);
      rail.position.set(mx, 0.4, mz);
      rail.rotation.y = angle;
      rail.castShadow = true;
      this.scene.add(rail); this.objects.push(rail);
      var steps = Math.floor(len / 1.5);
      for (var p = 0; p <= steps; p++) {
        var t = steps > 0 ? p / steps : 0.5;
        var px = seg.x1 + t * dx, pz = seg.z1 + t * dz;
        var post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), postsMat);
        post.position.set(px, 0.45, pz);
        this.scene.add(post); this.objects.push(post);
      }
    }
    var coopMat = new THREE.MeshLambertMaterial({ color: 0xcc6644 });
    var coop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 1.2), coopMat);
    coop.position.set(11.5, 0.5, -6.5);
    coop.castShadow = true;
    this.scene.add(coop); this.objects.push(coop);
    var coopRoof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.5, 4), new THREE.MeshLambertMaterial({ color: 0x993311 }));
    coopRoof.position.set(11.5, 1.25, -6.5);
    coopRoof.rotation.y = Math.PI / 4;
    coopRoof.castShadow = true;
    this.scene.add(coopRoof); this.objects.push(coopRoof);
  },

  createDirtPath: function() {
    var mat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    var segments = [
      { x: -10, z: -19, w: 1.0, d: 10, a: 0 },
      { x: 0, z: -16, w: 1.0, d: 14, a: 0.15 },
      { x: 16, z: -9, w: 1.2, d: 2, a: 0 },
    ];
    for (var i = 0; i < segments.length; i++) {
      var s = segments[i];
      var path = new THREE.Mesh(new THREE.PlaneGeometry(s.w, s.d), mat);
      path.rotation.x = -Math.PI / 2;
      path.position.set(s.x, 0.03, s.z);
      path.rotation.z = s.a;
      path.receiveShadow = true;
      this.scene.add(path);
      this.objects.push(path);
    }
  },

  createScarecrow: function() {
    var group = new THREE.Group();
    var postMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
    var post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.0), postMat);
    post.position.y = 1.0;
    post.castShadow = true;
    group.add(post);
    var cross = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4), postMat);
    cross.position.y = 1.6;
    cross.rotation.z = Math.PI / 2;
    cross.castShadow = true;
    group.add(cross);
    var bodyMat = new THREE.MeshLambertMaterial({ color: 0xcc6644 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.15), bodyMat);
    body.position.set(0, 1.4, 0);
    group.add(body);
    var headMat = new THREE.MeshLambertMaterial({ color: 0xd4a574 });
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), headMat);
    head.position.set(0, 1.85, 0.05);
    head.scale.set(1, 0.9, 0.8);
    group.add(head);
    var hatMat = new THREE.MeshLambertMaterial({ color: 0x5d3a1a });
    var hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06), hatMat);
    hatBrim.position.set(0, 2.0, 0);
    group.add(hatBrim);
    var hatTop = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.35, 6), hatMat);
    hatTop.position.set(0, 2.2, 0);
    group.add(hatTop);
    group.position.set(-2, 0, 8);
    this.scene.add(group);
    this.objects.push(group);
  },

  createWell: function() {
    var group = new THREE.Group();
    var stoneMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    var woodMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * Math.PI * 2;
      var stone = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), stoneMat);
      stone.position.set(Math.sin(angle) * 0.6, 0.4, Math.cos(angle) * 0.6);
      stone.castShadow = true;
      group.add(stone);
    }
    var post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.5), woodMat);
    post1.position.set(-0.7, 0.75, 0);
    group.add(post1);
    var post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.5), woodMat);
    post2.position.set(0.7, 0.75, 0);
    group.add(post2);
    var beam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6), woodMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.set(0, 1.4, 0);
    group.add(beam);
    var ropeMat = new THREE.MeshBasicMaterial({ color: 0x5d3a1a });
    var rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9), ropeMat);
    rope.position.set(0, 0.95, 0);
    group.add(rope);
    var bucketMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
    var bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.2), bucketMat);
    bucket.position.set(0, 0.5, 0);
    bucket.castShadow = true;
    group.add(bucket);
    group.position.set(-12, 0, -20);
    this.scene.add(group);
    this.objects.push(group);
  },

  createFeedingTrough: function() {
    var troughMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    var trough = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 1.2), troughMat);
    trough.position.set(16, 0.15, -12);
    trough.receiveShadow = true;
    this.scene.add(trough); this.objects.push(trough);
    var fillMat = new THREE.MeshLambertMaterial({ color: 0x5d3a1a });
    var fill = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 1.1), fillMat);
    fill.position.set(16, 0.25, -12);
    this.scene.add(fill); this.objects.push(fill);
    var hayBaleMat = new THREE.MeshLambertMaterial({ color: 0xdaa520 });
    var hay1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.6), hayBaleMat);
    hay1.position.set(14, 0.2, -17);
    hay1.castShadow = true;
    this.scene.add(hay1); this.objects.push(hay1);
    var hay2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.6), hayBaleMat);
    hay2.position.set(14.8, 0.4, -16.5);
    hay2.rotation.y = 0.5;
    hay2.castShadow = true;
    this.scene.add(hay2); this.objects.push(hay2);
  }
};
