var GAME = GAME || {};

// ============================================================
// 🌍 Farm Game — World Generator v3.0 (Terrain + Grass + Wind)
// ============================================================
GAME.world = {
  scene: null,
  objects: [],
  windTime: 0,
  windStrength: 0.4,
  grassInst: null,
  grassPhases: null,
  treeGroups: [],

  init: function(scene) {
    this.scene = scene;
    if (GAME.collision) GAME.collision.clear();
    var steps = ['createSky', 'createTerrain', 'createPlayerHouse', 'createBarn',
      'createMarket', 'createFarmPlots', 'createTrees', 'createFences', 'createPond',
      'createFlowers', 'createAnimalPens', 'createFeedingTrough', 'createDirtPath',
      'createScarecrow', 'createWell', 'createGrass', 'createBushes', 'createClouds',
      'createCloudShadows', 'createAmbientParticles'];
    for (var i = 0; i < steps.length; i++) {
      try { this[steps[i]](); }
      catch (e) { console.error('[FarmGame] world.' + steps[i] + ' failed:', e.message); }
    }
  },

  // ---- Height function for terrain ----
  _getHeight: function(x, z) {
    // Flat centre 40x40 للعب السلس
    var dist = Math.sqrt(x * x + z * z);
    if (dist < 20) return 0;
    var blend = Math.min(1, (dist - 20) / 20);

    // Multi-octave layered noise (sin/cos pseudo-noise)
    var h = 0;
    h += Math.sin(x * 0.025 + z * 0.018) * 0.7;
    h += Math.sin(x * 0.050 - z * 0.035) * 0.4;
    h += Math.cos(x * 0.080 + z * 0.060) * 0.25;
    h += Math.sin(x * 0.015 + z * 0.028) * 0.5;
    // تلال جهة الغابة
    if (x > 25 || x < -25 || z > 25 || z < -25) {
      h += Math.sin(x * 0.040) * Math.cos(z * 0.035) * 0.6;
    }
    // منخفض قرب البركة
    var pondDist = Math.sqrt((x + 10) * (x + 10) + (z + 27) * (z + 27));
    if (pondDist < 6) h -= (1 - pondDist / 6) * 0.5;

    return h * blend;
  },

  // ---- Terrain colour based on height ----
  _terrainColor: function(h, x, z) {
    var r, g, b;
    if (h < -0.3) {
      // Low — near water, dark rich soil
      r = 0.30; g = 0.42; b = 0.20;
    } else if (h < 0.2) {
      // Normal grass
      var t = (h + 0.3) / 0.5;
      r = 0.30 + t * 0.18;
      g = 0.42 + t * 0.32;
      b = 0.20 + t * 0.10;
    } else if (h < 0.8) {
      // Higher — lighter grass
      var t = (h - 0.2) / 0.6;
      r = 0.48 + t * 0.10;
      g = 0.74 + t * 0.05;
      b = 0.30 + t * 0.05;
    } else {
      // Peaks — rocky brown
      r = 0.55; g = 0.52; b = 0.35;
    }
    // Random micro-variation
    var v = 0.92 + (Math.sin(x * 3.7 + z * 5.1) * 0.08);
    return { r: r * v, g: g * v, b: b * v };
  },

  // ============================================================
  // 🌄 Sky (unchanged from v2 — dynamic day/night shader)
  // ============================================================
  createSky: function() {
    var s = this.scene;
    s.background = null;

    var skyGeo = new THREE.SphereGeometry(180, 20, 10);
    var skyMat = new THREE.ShaderMaterial({
      uniforms: {
        uTopColor:     { value: new THREE.Color(0x0055bb) },
        uHorizonColor: { value: new THREE.Color(0x87CEEB) }
      },
      vertexShader: [
        'varying vec3 vWorldPos;',
        'void main() {',
        '  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uTopColor;',
        'uniform vec3 uHorizonColor;',
        'varying vec3 vWorldPos;',
        'void main() {',
        '  float h = clamp(normalize(vWorldPos).y, 0.0, 1.0);',
        '  h = h * h * (3.0 - 2.0 * h);',
        '  gl_FragColor = vec4(mix(uHorizonColor, uTopColor, h), 1.0);',
        '}'
      ].join('\n'),
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false
    });
    var sky = new THREE.Mesh(skyGeo, skyMat);
    sky.renderOrder = -1;
    s.add(sky);
    this.sky = sky;
    this.skyMat = skyMat;

    s.fog = new THREE.Fog(0x87CEEB, 70, 120);

    var hemi = new THREE.HemisphereLight(0x87CEEB, 0x7ec850, 0.6);
    s.add(hemi);
    this.hemiLight = hemi;

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
    sun.shadow.bias = -0.0005;
    s.add(sun);
    this.sunLight = sun;

    var amb = new THREE.AmbientLight(0x404060, 0.3);
    s.add(amb);
    this.ambLight = amb;

    // Sun sprite
    var sunCv = document.createElement('canvas'); sunCv.width = sunCv.height = 128;
    var sc = sunCv.getContext('2d');
    var sg = sc.createRadialGradient(64,64,0, 64,64,64);
    sg.addColorStop(0,    'rgba(255,255,200,1)');
    sg.addColorStop(0.25, 'rgba(255,230,100,0.9)');
    sg.addColorStop(0.6,  'rgba(255,160,50,0.35)');
    sg.addColorStop(1,    'rgba(255,100,0,0)');
    sc.fillStyle = sg; sc.fillRect(0,0,128,128);
    this.sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(sunCv),
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    this.sunSprite.scale.set(24, 24, 1);
    s.add(this.sunSprite);

    // Moon sprite
    var moonCv = document.createElement('canvas'); moonCv.width = moonCv.height = 128;
    var mc = moonCv.getContext('2d');
    var mg = mc.createRadialGradient(64,64,0, 64,64,64);
    mg.addColorStop(0,    'rgba(230,240,255,1)');
    mg.addColorStop(0.35, 'rgba(180,210,255,0.7)');
    mg.addColorStop(0.7,  'rgba(100,150,255,0.2)');
    mg.addColorStop(1,    'rgba(50,80,200,0)');
    mc.fillStyle = mg; mc.fillRect(0,0,128,128);
    this.moonSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(moonCv),
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    this.moonSprite.scale.set(14, 14, 1);
    s.add(this.moonSprite);

    // Stars
    var starCount = 600;
    var sGeo = new THREE.BufferGeometry();
    var sPos = new Float32Array(starCount * 3);
    for (var i = 0; i < starCount; i++) {
      var theta = Math.random() * Math.PI * 2;
      var phi   = Math.acos(2 * Math.random() - 1);
      var r = 160;
      sPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      sPos[i*3+1] = Math.abs(r * Math.cos(phi)) + 20;
      sPos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
    }
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    this.stars = new THREE.Points(sGeo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.6, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    s.add(this.stars);
  },

  // ============================================================
  // 🏔️ Enhanced Terrain — height + vertex colors + grass blend
  // ============================================================
  createTerrain: function() {
    var geo = new THREE.PlaneGeometry(120, 120, 80, 80);
    var pos = geo.attributes.position;
    var colors = new Float32Array(pos.count * 3);

    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), z = pos.getY(i);
      var h = this._getHeight(x, z);
      pos.setZ(i, h);
      var c = this._terrainColor(h, x, z);
      colors[i*3]   = c.r;
      colors[i*3+1] = c.g;
      colors[i*3+2] = c.b;
    }

    pos.needsUpdate = true;
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    var mat = new THREE.MeshLambertMaterial({
      vertexColors: true,
      flatShading: false
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.objects.push(mesh);
    this.terrainMesh = mesh;
  },

  // ============================================================
  // 🏠 Buildings
  // ============================================================
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

    // 🚪 Door step
    var stepMat = new THREE.MeshLambertMaterial({ color: 0x8a7a6a });
    var step = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.6), stepMat);
    step.position.set(-15, 0.08, -11.95);
    this.scene.add(step); this.objects.push(step);

    // 🚪 Door
    var doorMat = new THREE.MeshLambertMaterial({ color: 0x5d3a1a });
    var door = new THREE.Mesh(new THREE.BoxGeometry(1, 1.8, 0.1), doorMat);
    door.position.set(-15, 0.9, -12.3);
    this.scene.add(door); this.objects.push(door);

    // 🪟 Door frame
    var frameMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
    var fL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.9, 0.06), frameMat);
    fL.position.set(-15.52, 0.95, -12.33); this.scene.add(fL); this.objects.push(fL);
    var fR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.9, 0.06), frameMat);
    fR.position.set(-14.48, 0.95, -12.33); this.scene.add(fR); this.objects.push(fR);
    var fT = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.06, 0.06), frameMat);
    fT.position.set(-15, 1.85, -12.33); this.scene.add(fT); this.objects.push(fT);

    // 🪟 Windows with frame
    var winGlowMat = new THREE.MeshLambertMaterial({ color: 0x88ccff });
    var winFrameMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
    var winPositions = [[-16.5, 1.6, -12.3], [-13.5, 1.6, -12.3]];
    for (var wi = 0; wi < winPositions.length; wi++) {
      var wp = winPositions[wi];
      var wg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), winGlowMat);
      wg.position.set(wp[0], wp[1], wp[2]); this.scene.add(wg); this.objects.push(wg);
      // Cross frame
      var wf = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.12), winFrameMat);
      wf.position.set(wp[0], wp[1], wp[2] - 0.02); this.scene.add(wf); this.objects.push(wf);
      var wfv = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.85, 0.12), winFrameMat);
      wfv.position.set(wp[0], wp[1], wp[2] - 0.02); this.scene.add(wfv); this.objects.push(wfv);
    }

    // 🏠 Window interior glow (night)
    var glowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44, transparent: true, opacity: 0.15
    });
    var glow = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.5), glowMat);
    glow.position.set(-15, 1.2, -12.1);
    this.scene.add(glow); this.objects.push(glow);
    this.houseGlow = glow;

    // 🏭 Chimney
    var chimMat = new THREE.MeshLambertMaterial({ color: 0xaa5533 });
    var chimney = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.5), chimMat);
    chimney.position.set(-14.5, 2.6, -13.8);
    chimney.castShadow = true;
    this.scene.add(chimney); this.objects.push(chimney);
    // Chimney cap
    var capMat = new THREE.MeshLambertMaterial({ color: 0x664422 });
    var cap = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), capMat);
    cap.position.set(-14.5, 3.35, -13.8);
    this.scene.add(cap); this.objects.push(cap);

    // 💨 Smoke particles
    var smokeCount = 25;
    var sPos = new Float32Array(smokeCount * 3);
    this.smokeVelocities = new Float32Array(smokeCount);
    for (var si = 0; si < smokeCount; si++) {
      sPos[si*3]   = -14.5 + (Math.random() - 0.5) * 0.25;
      sPos[si*3+1] = 3.0 + Math.random() * 2.5;
      sPos[si*3+2] = -13.8 + (Math.random() - 0.5) * 0.25;
      this.smokeVelocities[si] = 0.1 + Math.random() * 0.2;
    }
    var sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    var sMat = new THREE.PointsMaterial({
      color: 0xcccccc, transparent: true, opacity: 0.25,
      size: 0.18, blending: THREE.AdditiveBlending, depthWrite: false
    });
    this.smokeParticles = new THREE.Points(sGeo, sMat);
    this.scene.add(this.smokeParticles);
    this.objects.push(this.smokeParticles);

    // 🌸 Garden fence around house
    var gfMat = new THREE.MeshLambertMaterial({ color: 0x7a6a5a });
    var gardenBounds = [
      { x1: -19, z1: -18, x2: -11, z2: -18 },
      { x1: -19, z1: -12, x2: -11, z2: -12 },
      { x1: -19, z1: -18, x2: -19, z2: -12 },
      { x1: -11, z1: -18, x2: -11, z2: -12 }
    ];
    for (var gb = 0; gb < gardenBounds.length; gb++) {
      var g = gardenBounds[gb];
      var gmx = (g.x1 + g.x2) / 2, gmz = (g.z1 + g.z2) / 2;
      var gdx = g.x2 - g.x1, gdz = g.z2 - g.z1;
      var glen = Math.sqrt(gdx*gdx + gdz*gdz);
      var gang = Math.atan2(gdx, gdz);
      var gRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, glen), gfMat);
      gRail.position.set(gmx, 0.15, gmz);
      gRail.rotation.y = gang;
      this.scene.add(gRail); this.objects.push(gRail);
      var gSteps = Math.floor(glen / 1.2);
      for (var gp = 0; gp <= gSteps; gp++) {
        var gt = gSteps > 0 ? gp / gSteps : 0.5;
        var gPost = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), gfMat);
        gPost.position.set(g.x1 + gt*gdx, 0.2, g.z1 + gt*gdz);
        this.scene.add(gPost); this.objects.push(gPost);
      }
    }
  },

  createBarn: function() {
    this.createBuilding(16, -12, 8, 6, 0xa83232, 0x5c1a1a, 3.5);

    // 🚪 Barn double doors
    var doorMat = new THREE.MeshLambertMaterial({ color: 0x4a2800 });
    var door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.1), doorMat);
    door.position.set(16, 1.1, -8.7);
    this.scene.add(door); this.objects.push(door);
    // Door hardware
    var hwMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    var handle = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), hwMat);
    handle.position.set(16.3, 0.9, -8.75); this.scene.add(handle); this.objects.push(handle);

    // 🌾 Hay loft door
    var loftMat = new THREE.MeshLambertMaterial({ color: 0x3a1a0a });
    var loft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.08), loftMat);
    loft.position.set(16, 3.2, -8.65);
    this.scene.add(loft); this.objects.push(loft);
    var loftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.10), doorMat);
    loftFrame.position.set(15.38, 3.2, -8.66); this.scene.add(loftFrame); this.objects.push(loftFrame);
    loftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.10), doorMat);
    loftFrame.position.set(16.62, 3.2, -8.66); this.scene.add(loftFrame); this.objects.push(loftFrame);

    // 🏠 Weather vane on roof
    var vaneMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), vaneMat);
    pole.position.set(16, 4.8, -12); this.scene.add(pole); this.objects.push(pole);
    var arrow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.05), vaneMat);
    arrow.position.set(16, 5.1, -12); this.scene.add(arrow); this.objects.push(arrow);
    var tail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.02), vaneMat);
    tail.position.set(15.85, 5.1, -12); this.scene.add(tail); this.objects.push(tail);
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
    var roof = new THREE.Mesh(new THREE.BoxGeometry(5, 0.15, 5), roofMat);
    roof.position.y = 2.6; roof.castShadow = true; roof.receiveShadow = true;
    group.add(roof);

    // 🎨 Striped awning
    var stripeColors = [0xe67e22, 0xffd700, 0xe67e22, 0xffd700, 0xe67e22];
    for (var st = 0; st < stripeColors.length; st++) {
      var strip = new THREE.Mesh(
        new THREE.PlaneGeometry(4.8, 0.3),
        new THREE.MeshLambertMaterial({ color: stripeColors[st], transparent: true, opacity: 0.35 })
      );
      strip.position.set(0, 2.6 - st * 0.31, -2.5);
      strip.rotation.x = -0.15;
      group.add(strip);
    }

    // Cloth side drops
    var clothMat = new THREE.MeshLambertMaterial({ color: 0xffdd77, transparent: true, opacity: 0.25 });
    for (var s = 0; s < 4; s++) {
      var side = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.8), clothMat);
      var angle = (s / 4) * Math.PI * 2;
      side.position.set(Math.sin(angle) * 2.3, 2.2, Math.cos(angle) * 2.3);
      side.rotation.y = -angle;
      group.add(side);
    }

    // 🪑 Counter + goods
    var counter = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 0.8), new THREE.MeshLambertMaterial({ color: 0x8B7355 }));
    counter.position.set(0, 0.4, 0.5);
    group.add(counter);
    // Crates / goods
    var crateMat = new THREE.MeshLambertMaterial({ color: 0x7a6a4a });
    var crate = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), crateMat);
    crate.position.set(0, 0.65, 0.9); group.add(crate);
    var appleMat = new THREE.MeshLambertMaterial({ color: 0xcc3333 });
    for (var a = 0; a < 3; a++) {
      var apple = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), appleMat);
      apple.position.set(-0.1 + a * 0.1, 0.82, 0.9); group.add(apple);
    }

    group.position.set(0, 0, -22);
    this.scene.add(group); this.objects.push(group);
    GAME.collision.addBox([-3, 0, -25], [3, 3, -19]);
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
    var plotCount = 6 * plotsPerRow;
    var _d = new THREE.Object3D();
    var dirtInst = new THREE.InstancedMesh(new THREE.BoxGeometry(2.4, 0.15, 2.4), dirtMat, plotCount);
    var edgeInst = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 0.05, 2.6), edgeMat, plotCount);
    dirtInst.receiveShadow = true;
    var pIdx = 0;
    for (var row = 0; row < 6; row++) {
      for (var col = 0; col < plotsPerRow; col++) {
        var px = startX + col * spacing;
        var pz = startZ + row * spacing;
        _d.position.set(px, 0.05, pz); _d.updateMatrix(); dirtInst.setMatrixAt(pIdx, _d.matrix);
        _d.position.set(px, 0.025, pz); _d.updateMatrix(); edgeInst.setMatrixAt(pIdx, _d.matrix);
        pIdx++;
      }
    }
    dirtInst.instanceMatrix.needsUpdate = true;
    edgeInst.instanceMatrix.needsUpdate = true;
    this.scene.add(dirtInst); this.objects.push(dirtInst);
    this.scene.add(edgeInst); this.objects.push(edgeInst);

    // Fence around plots
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

  // ============================================================
  // 🌳 Trees v2 — more varieties + wind support
  // ============================================================
  createTrees: function() {
    var trunkColors = [0x8B5A2B, 0x6b4423, 0x5d3a1a, 0x7a4a2a];
    var leafColors = [0x3a7d2c, 0x2d6b1e, 0x4a8c3f, 0x5a9a4a, 0x228B22,
                      0x6aB84a, 0x3d8c37, 0x5ca050];
    var autumnColors = [0xc94c2c, 0xd4743a, 0xe8a040, 0xbf5b2a];

    // Positions — many more trees spread across the world
    var positions = [
      // Original trees
      [-25, -25], [22, -28], [26, 5], [-28, 8], [-22, 22], [20, 20],
      [30, -15], [-30, -5], [-8, -28], [10, -30], [-35, 18], [35, -22],
      [-20, -8], [24, -5], [15, -32], [-32, -2], [-5, 25], [28, -20],
      [-27, -20], [27, -18], [-25, 10], [30, 18], [18, -26], [-18, -30],
      [30, -28], [-30, 28], [10, 28], [-10, 28],
      // 🌳 New trees (more density at edges)
      [-33, -25], [33, -25], [-33, 25], [33, 25],
      [-28, -32], [28, -32], [-35, -8], [35, -8],
      [-38, 10], [38, 10], [-15, 32], [15, 32],
      [-5, -32], [5, -32], [-28, 15], [28, 15],
      [-18, 28], [18, 28], [-24, -28], [24, -28],
      [-30, -15], [30, -15], [-22, -18], [22, -18],
      [35, 5], [-35, 5], [10, -22], [-10, -22],
      [8, 25], [-8, 25], [32, -10], [-32, -10]
    ];

    for (var i = 0; i < positions.length; i++) {
      var group = new THREE.Group();
      var trunkMat = new THREE.MeshLambertMaterial({ color: trunkColors[Math.floor(Math.random() * trunkColors.length)] });
      var trunkH = 1.5 + Math.random() * 1.5;
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.22, trunkH), trunkMat);
      trunk.position.y = trunkH / 2;
      trunk.castShadow = true;
      group.add(trunk);

      var isAutumn = Math.random() < 0.12;
      var pal = isAutumn ? autumnColors : leafColors;
      var leafMat = new THREE.MeshLambertMaterial({ color: pal[Math.floor(Math.random() * pal.length)] });

      // 🌲 4 tree types
      var type = Math.floor(Math.random() * 4);

      // Store wind phase and trunk height for animation
      group.userData = { windPhase: Math.random() * Math.PI * 2, trunkH: trunkH, type: type };

      if (type === 0) {
        // Round tree (original)
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
      } else if (type === 1) {
        // Pine (original)
        var cone1 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.9, 6), leafMat);
        cone1.position.y = trunkH + 0.4; cone1.castShadow = true; group.add(cone1);
        var cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.8, 6), leafMat);
        cone2.position.y = trunkH + 1.0; cone2.castShadow = true; group.add(cone2);
        var cone3 = new THREE.Mesh(new THREE.ConeGeometry(0.50, 0.7, 6), leafMat);
        cone3.position.y = trunkH + 1.5; cone3.castShadow = true; group.add(cone3);
      } else if (type === 2) {
        // 🌳 Oak/bushy — wide canopy, short trunk
        var crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 0), leafMat);
        crown.position.y = trunkH + 0.6;
        crown.castShadow = true;
        group.add(crown);
        // Small extra puffs
        for (var p = 0; p < 3; p++) {
          var puff = new THREE.Mesh(new THREE.SphereGeometry(0.4 + Math.random()*0.3, 5, 5), leafMat);
          puff.position.set(
            (Math.random() - 0.5) * 1.4,
            trunkH + 0.2 + Math.random() * 0.8,
            (Math.random() - 0.5) * 1.4
          );
          puff.castShadow = true;
          group.add(puff);
        }
      } else {
        // 🌴 Palm-like — tall trunk, small crown at top
        var trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, trunkH * 1.2), trunkMat);
        trunk2.position.y = trunkH * 0.6;
        trunk2.castShadow = true;
        group.remove(trunk);
        group.add(trunk2);
        var crown2 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 5, 5), leafMat);
        crown2.position.y = trunkH * 1.2 + 0.2;
        crown2.scale.set(1.5, 0.6, 1.5);
        crown2.castShadow = true;
        group.add(crown2);
        // Fronds (small cones sticking out)
        for (var f = 0; f < 5; f++) {
          var fa = (f / 5) * Math.PI * 2 + Math.random() * 0.3;
          var frond = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 4), leafMat);
          frond.position.set(Math.sin(fa) * 0.5, trunkH * 1.2, Math.cos(fa) * 0.5);
          frond.rotation.z = Math.sin(fa) * 0.5;
          frond.rotation.x = Math.cos(fa) * 0.5;
          frond.castShadow = true;
          group.add(frond);
        }
      }

      group.position.set(positions[i][0], 0, positions[i][1]);
      group.rotation.y = Math.random() * Math.PI * 2;
      // Random scale variation
      var s = 0.7 + Math.random() * 0.6;
      group.scale.set(s, s, s);
      this.scene.add(group);
      this.objects.push(group);
      this.treeGroups.push(group);
    }
  },

  // ============================================================
  // 🌿 Grass Field — InstancedMesh blades with wind phase
  // ============================================================
  createGrass: function() {
    // Generate positions for grass tufts
    var count = 3000;
    var positions = [];
    var colors = [];
    var phases = [];

    for (var i = 0; i < count; i++) {
      var x = (Math.random() - 0.5) * 90;
      var z = (Math.random() - 0.5) * 90;

      // Avoid: buildings area, farm plots, pond, animal pens, paths
      if (Math.abs(x + 15) < 5 && Math.abs(z + 15) < 5) continue; // House
      if (Math.abs(x - 16) < 5 && Math.abs(z + 12) < 5) continue; // Barn
      if (Math.abs(x) < 9 && Math.abs(z - 10) < 10) continue; // Farm plots
      if (Math.abs(x - 0) < 5 && Math.abs(z + 22) < 5) continue; // Market
      if (Math.abs(x + 10) < 6 && Math.abs(z + 27) < 6) continue; // Pond
      if (Math.abs(x - 16) < 6 && Math.abs(z + 7) < 10) continue; // Animal pens
      if (Math.abs(x + 12) < 3 && Math.abs(z + 20) < 3) continue; // Well
      // Paths
      if (Math.abs(x + 10) < 2 && Math.abs(z + 10) < 10) continue;
      if (Math.abs(x - 16) < 2 && Math.abs(z + 8) < 4) continue;

      // Height check — don't place on steep terrain
      var h = this._getHeight(x, z);
      if (Math.abs(h) > 1.2) continue;

      positions.push([x, z]);
      colors.push([
        0.30 + Math.random() * 0.40,
        0.55 + Math.random() * 0.30,
        0.15 + Math.random() * 0.20
      ]);
      phases.push(Math.random() * Math.PI * 2);
    }

    var n = positions.length;
    if (n === 0) return;

    // Grass blade geometry: thin triangle
    var bladeGeo = new THREE.BufferGeometry();
    var verts = new Float32Array([
      -0.03, 0, 0,
       0.03, 0, 0,
       0,    0.35, 0,
      // Second face for thickness
       0.03, 0, 0.02,
      -0.03, 0, 0.02,
       0,    0.35, 0.02
    ]);
    bladeGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    bladeGeo.computeVertexNormals();

    var bladeMat = new THREE.MeshLambertMaterial({ vertexColors: false });
    this.grassInst = new THREE.InstancedMesh(bladeGeo, bladeMat, n);
    this.grassInst.castShadow = true;

    var _d = new THREE.Object3D();
    var _c = new THREE.Color();
    this.grassColors = new Float32Array(n * 3);

    for (var j = 0; j < n; j++) {
      var p = positions[j];
      var clr = colors[j];
      _d.position.set(p[0], 0.05, p[1]);
      _d.scale.set(1, 0.6 + Math.random() * 0.6, 1);
      _d.rotation.y = Math.random() * Math.PI * 2;
      _d.updateMatrix();
      this.grassInst.setMatrixAt(j, _d.matrix);
      this.grassColors[j*3]   = clr[0];
      this.grassColors[j*3+1] = clr[1];
      this.grassColors[j*3+2] = clr[2];
    }

    this.grassInst.instanceMatrix.needsUpdate = true;
    this.scene.add(this.grassInst);
    this.objects.push(this.grassInst);
    this.grassPhases = phases;
    this.grassPositions = positions;

    // Also add scattered small grass tufts (ConeGeometry) for variety
    var tuftGeo = new THREE.ConeGeometry(0.15, 0.25, 4);
    var tuftCount = Math.min(n / 3, 800);
    this.grassTufts = new THREE.InstancedMesh(tuftGeo, new THREE.MeshLambertMaterial({ color: 0x5a9a4a }), tuftCount);
    var tIdx = 0;
    for (var k = 0; k < positions.length && tIdx < tuftCount; k += 3) {
      var tp = positions[k];
      _d.position.set(tp[0], 0.05, tp[1]);
      _d.scale.set(1, 0.3 + Math.random() * 0.5, 1);
      _d.rotation.y = Math.random() * Math.PI * 2;
      _d.updateMatrix();
      this.grassTufts.setMatrixAt(tIdx, _d.matrix);
      tIdx++;
    }
    this.grassTufts.instanceMatrix.needsUpdate = true;
    this.grassTufts.castShadow = true;
    this.scene.add(this.grassTufts);
    this.objects.push(this.grassTufts);
  },

  // ============================================================
  // 🌿 Bushes — decorative shrubbery
  // ============================================================
  createBushes: function() {
    var bushMat = new THREE.MeshLambertMaterial({ color: 0x3a7d2c });
    var bushPositions = [
      [-12, -18], [-18, -12], [12, -18], [18, -12],
      [6, 18], [-6, 18], [0, 18], [-14, 18],
      [14, 18], [-20, -2], [20, -2], [-22, 5],
      [22, 5], [-8, -5], [8, -5]
    ];
    for (var i = 0; i < bushPositions.length; i++) {
      var bush = new THREE.Mesh(
        new THREE.SphereGeometry(0.4 + Math.random() * 0.3, 5, 5),
        new THREE.MeshLambertMaterial({
          color: 0x2d6b1e + Math.floor(Math.random() * 0x307020)
        })
      );
      bush.position.set(bushPositions[i][0], 0.2, bushPositions[i][1]);
      bush.scale.set(1, 0.4 + Math.random() * 0.3, 1);
      bush.castShadow = true;
      this.scene.add(bush);
      this.objects.push(bush);
    }
  },

  // ============================================================
  // 🌸 Flowers (v2 — richer colors, more density)
  // ============================================================
  createFlowers: function() {
    var colors = [0xff6b6b, 0xffd93d, 0xff8a5c, 0xc084fc, 0xf472b6, 0x60a5fa, 0x34d399, 0xfb923c];
    var spots = [];
    for (var i = 0; i < 200; i++) {
      var x = (Math.random() - 0.5) * 90;
      var z = (Math.random() - 0.5) * 90;
      // Keep away from buildings/farm area
      if (Math.abs(x) < 10 && Math.abs(z) < 22) continue;
      if (Math.abs(x - (-10)) < 5 && Math.abs(z - (-27)) < 5) continue;
      if (Math.abs(x - 16) < 7 && Math.abs(z + 10) < 10) continue;
      spots.push([x, z, colors[Math.floor(Math.random() * colors.length)]]);
    }
    var n = spots.length;
    if (n === 0) return;
    var _d = new THREE.Object3D();
    var stems = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.3),
      new THREE.MeshLambertMaterial({ color: 0x3a7d2c }), n);
    var heads = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.12, 5, 5),
      new THREE.MeshLambertMaterial({ color: 0xffffff }), n);
    var _c = new THREE.Color();
    for (var j = 0; j < n; j++) {
      var s = spots[j];
      _d.position.set(s[0], 0.15, s[1]); _d.updateMatrix(); stems.setMatrixAt(j, _d.matrix);
      _d.position.set(s[0], 0.38, s[1]); _d.updateMatrix(); heads.setMatrixAt(j, _d.matrix);
      heads.setColorAt(j, _c.setHex(s[2]));
    }
    stems.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
    if (heads.instanceColor) heads.instanceColor.needsUpdate = true;
    this.scene.add(stems); this.objects.push(stems);
    this.scene.add(heads); this.objects.push(heads);
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

  // ============================================================
  // 💧 Water v3 — ShaderMaterial pond with animated waves + fresnel
  // ============================================================
  createPond: function() {
    var wGeo = new THREE.CircleGeometry(4.5, 48);

    var waterVertShader = [
      'uniform float uTime;',
      'varying vec2  vUv;',
      'varying float vHeight;',
      'void main() {',
      '  vUv = uv;',
      '  vec3 pos = position;',
      '  float wave1 = sin(pos.x * 0.6 + uTime * 1.2) * 0.08;',
      '  float wave2 = cos(pos.y * 0.8 + uTime * 0.9) * 0.06;',
      '  float wave3 = sin((pos.x + pos.y) * 0.35 + uTime * 0.5) * 0.04;',
      '  float dist  = length(pos.xy) / 4.5;',
      '  float shoreWave = (1.0 - dist) * sin(dist * 8.0 + uTime * 0.6) * 0.03;',
      '  pos.z += wave1 + wave2 + wave3 + shoreWave;',
      '  vHeight = pos.z;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);',
      '}'
    ].join('\n');

    var waterFragShader = [
      'uniform vec3  uDeep;',
      'uniform vec3  uShallow;',
      'uniform vec3  uFoam;',
      'uniform float uTime;',
      'varying vec2  vUv;',
      'varying float vHeight;',
      'void main() {',
      '  float depth = smoothstep(-0.15, 0.15, vHeight);',
      '  vec3 col = mix(uDeep, uShallow, depth);',
      '  // Foam ring near shore',
      '  float d = distance(vUv, vec2(0.5, 0.5));',
      '  float foam = smoothstep(0.50, 0.42, abs(vUv.x - 0.5)) * 0.2;',
      '  foam += smoothstep(0.50, 0.42, abs(vUv.y - 0.5)) * 0.2;',
      '  col = mix(col, uFoam, foam * 0.5);',
      '  // Specular glint',
      '  float glint = pow(max(0.0, sin(vUv.x * 40.0 + uTime) * sin(vUv.y * 40.0 + uTime * 0.7)), 6.0);',
      '  col += vec3(1.0, 0.95, 0.8) * glint * 0.15;',
      '  // Edge foam',
      '  float edge = smoothstep(0.5, 0.45, d);',
      '  col = mix(col, uFoam, edge * 0.6);',
      '  gl_FragColor = vec4(col, 0.75);',
      '}'
    ].join('\n');

    var waterMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uDeep:    { value: new THREE.Color(0x1a5276) },
        uShallow: { value: new THREE.Color(0x48c9b0) },
        uFoam:    { value: new THREE.Color(0xd4eaf7) }
      },
      vertexShader:   waterVertShader,
      fragmentShader: waterFragShader,
      transparent: true,
      side: THREE.DoubleSide
    });
    var water = new THREE.Mesh(wGeo, waterMat);
    water.position.set(-10, 0.02, -27);
    water.rotation.x = -Math.PI / 2;
    water.receiveShadow = true;
    this.scene.add(water); this.objects.push(water);
    this.pondMesh = water;
    this.pondMat = waterMat;

    // Rocks around pond — bigger, more natural
    var rockMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    var rockPos = [
      [-13.5, -29.5], [-6.5, -29.5], [-7.5, -24], [-13.5, -24.5],
      [-11.5, -31.5], [-7.5, -27.5], [-14, -27], [-6, -27],
      [-12, -23], [-8.5, -31]
    ];
    for (var i = 0; i < rockPos.length; i++) {
      var rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.5),
        new THREE.MeshLambertMaterial({
          color: 0x777777 + Math.floor(Math.random() * 0x444444)
        })
      );
      rock.position.set(rockPos[i][0], 0.08, rockPos[i][1]);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      this.scene.add(rock); this.objects.push(rock);
    }

    // 🌿 Water plants
    var plantMat = new THREE.MeshLambertMaterial({ color: 0x2d8a4e });
    for (var k = 0; k < 6; k++) {
      var angle = (k / 6) * Math.PI * 2 + Math.random() * 0.5;
      var dist = 3.0 + Math.random() * 1.5;
      var plant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.5), plantMat);
      plant.position.set(
        -10 + Math.sin(angle) * dist,
        0.2,
        -27 + Math.cos(angle) * dist
      );
      plant.rotation.z = (Math.random() - 0.5) * 0.3;
      plant.rotation.x = (Math.random() - 0.5) * 0.3;
      this.scene.add(plant); this.objects.push(plant);
    }

    GAME.collision.addBox([-14, 0, -31], [-6, 1, -23]);
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
  },

  // ============================================================
  // ☁️ Clouds — drifting sphere groups
  // ============================================================
  createClouds: function() {
    var cloudMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55
    });
    this.clouds = [];
    var cloudCount = 14;
    for (var i = 0; i < cloudCount; i++) {
      var group = new THREE.Group();
      var numPuffs = 3 + Math.floor(Math.random() * 6);
      for (var j = 0; j < numPuffs; j++) {
        var puff = new THREE.Mesh(
          new THREE.SphereGeometry(0.8 + Math.random() * 2.2, 6, 5),
          cloudMat
        );
        puff.position.set(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 3
        );
        puff.scale.set(1, 0.35 + Math.random() * 0.25, 0.6 + Math.random() * 0.4);
        puff.castShadow = false;
        group.add(puff);
      }
      group.position.set(
        (Math.random() - 0.5) * 240,
        16 + Math.random() * 14,
        (Math.random() - 0.5) * 200 - 30
      );
      var spd = 0.12 + Math.random() * 0.25;
      group.userData = {
        speed: spd,
        baseX: group.position.x
      };
      this.scene.add(group);
      this.objects.push(group);
      this.clouds.push(group);
    }
  },

  // ============================================================
  // 🌑 Cloud shadows — dark patches drifting on ground
  // ============================================================
  createCloudShadows: function() {
    var shadowCount = 6;
    this.cloudShadows = [];
    var can = document.createElement('canvas'); can.width = 128; can.height = 128;
    var ctx = can.getContext('2d');
    var grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0,    'rgba(0,0,0,0.12)');
    grd.addColorStop(0.4,  'rgba(0,0,0,0.08)');
    grd.addColorStop(0.8,  'rgba(0,0,0,0.02)');
    grd.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, 128, 128);
    var tex = new THREE.CanvasTexture(can);
    var shadowMat = new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false,
      blending: THREE.MultiplyBlending
    });
    for (var si = 0; si < shadowCount; si++) {
      var spr = new THREE.Sprite(shadowMat.clone());
      var size = 15 + Math.random() * 20;
      spr.scale.set(size, size, 1);
      spr.position.set(
        (Math.random() - 0.5) * 120,
        0.5,
        (Math.random() - 0.5) * 120
      );
      spr.userData = {
        speed: 0.08 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2
      };
      this.scene.add(spr);
      this.objects.push(spr);
      this.cloudShadows.push(spr);
    }
  },

  // ============================================================
  // ✨ Ambient particles — dust motes (day) / fireflies (night)
  // ============================================================
  createAmbientParticles: function() {
    var count = 120;
    var positions = new Float32Array(count * 3);
    var sizes = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 60;
      positions[i*3+1] = 0.5 + Math.random() * 2.5;
      positions[i*3+2] = (Math.random() - 0.5) * 60;
      sizes[i] = 0.04 + Math.random() * 0.08;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    var mat = new THREE.PointsMaterial({
      color: 0xffdd88,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.ambientParticles = new THREE.Points(geo, mat);
    this.scene.add(this.ambientParticles);
    this.objects.push(this.ambientParticles);
    this.ambientParticleMat = mat;
    this.ambientParticlePositions = positions;
  },

  // ============================================================
  // 🌬️ Wind animation — trees sway + clouds drift + water waves
  // ============================================================
  updateWind: function(delta) {
    this.windTime += delta * 0.6;

    // 🌲 Tree sway
    var windAmp = this.windStrength * (0.5 + 0.5 * Math.sin(this.windTime * 0.3));
    for (var i = 0; i < this.treeGroups.length; i++) {
      var tree = this.treeGroups[i];
      var phase = tree.userData.windPhase || 0;
      var sway = Math.sin(this.windTime * 0.8 + phase) * windAmp * 0.04;
      tree.rotation.z = sway;
      tree.rotation.x = Math.sin(this.windTime * 0.6 + phase + 1.5) * windAmp * 0.02;
    }

    // ☁️ Cloud drift
    if (this.clouds) {
      for (var ci = 0; ci < this.clouds.length; ci++) {
        var c = this.clouds[ci];
        c.position.x += c.userData.speed * delta * 0.5;
        if (c.position.x > 140) c.position.x = -140;
      }
    }

    // 🌑 Cloud shadows move with wind
    if (this.cloudShadows) {
      for (var csi = 0; csi < this.cloudShadows.length; csi++) {
        var sh = this.cloudShadows[csi];
        sh.position.x += sh.userData.speed * delta * 0.5;
        if (sh.position.x > 70) sh.position.x = -70;
      }
    }

    // ✨ Ambient particles (dust/fireflies)
    if (this.ambientParticles) {
      var ap = this.ambientParticlePositions;
      for (var pi = 0; pi < ap.length; pi += 3) {
        ap[pi]   += Math.sin(this.windTime * 0.3 + pi) * 0.002;
        ap[pi+1] += Math.sin(this.windTime * 0.5 + pi * 1.5) * 0.001;
        ap[pi+2] += Math.cos(this.windTime * 0.4 + pi) * 0.002;
        if (ap[pi] > 35) ap[pi] = -35;
        if (ap[pi] < -35) ap[pi] = 35;
        if (ap[pi+1] > 3.5) ap[pi+1] = 0.5;
        if (ap[pi+1] < 0.3) ap[pi+1] = 2.5;
        if (ap[pi+2] > 35) ap[pi+2] = -35;
        if (ap[pi+2] < -35) ap[pi+2] = 35;
      }
      this.ambientParticles.geometry.attributes.position.needsUpdate = true;
    }

    // ⭐ Star twinkle
    if (this.stars && this.stars.geometry.attributes.position) {
      var sPos = this.stars.geometry.attributes.position;
      if (!this._starPhases) {
        this._starPhases = new Float32Array(sPos.count);
        for (var si = 0; si < sPos.count; si++) this._starPhases[si] = Math.random() * Math.PI * 2;
      }
      if (!this.stars.geometry.attributes.size) {
        var sz = new Float32Array(sPos.count);
        for (var si = 0; si < sPos.count; si++) sz[si] = 0.3 + Math.random() * 0.6;
        this.stars.geometry.setAttribute('size', new THREE.BufferAttribute(sz, 1));
      }
      var szAttr = this.stars.geometry.attributes.size;
      for (var si = 0; si < szAttr.count; si++) {
        var twinkle = 0.5 + 0.5 * Math.sin(this.windTime * 2.0 + this._starPhases[si]);
        szAttr.array[si] = (0.3 + Math.random() * 0.1) * twinkle;
      }
      szAttr.needsUpdate = true;
    }

    // 💧 Water shader animated
    if (this.pondMesh && this.pondMat && this.pondMat.uniforms) {
      this.pondMat.uniforms.uTime.value = this.windTime * 2.0;
    }

    // 🏠 Window glow pulsing
    if (this.houseGlow) {
      var pulse = 0.12 + Math.sin(this.windTime * 0.5) * 0.05;
      this.houseGlow.material.opacity = pulse;
    }

    // 💨 Chimney smoke
    if (this.smokeParticles) {
      var sPos = this.smokeParticles.geometry.attributes.position;
      for (var si = 0; si < sPos.count; si++) {
        var sx = sPos.getX(si) + Math.sin(this.windTime * 2.0 + si * 0.7) * 0.002;
        var sy = sPos.getY(si) + delta * (0.08 + this.smokeVelocities[si] * 0.15);
        var sz = sPos.getZ(si) + Math.cos(this.windTime * 1.8 + si * 0.5) * 0.002;
        if (sy > 6.0) {
          sx = -14.5 + (Math.random() - 0.5) * 0.2;
          sy = 3.0 + Math.random() * 0.3;
          sz = -13.8 + (Math.random() - 0.5) * 0.2;
        }
        sPos.setXYZ(si, sx, sy, sz);
      }
      sPos.needsUpdate = true;
    }
  },

  // ============================================================
  // 💡 Day/Night lighting (unchanged from v2)
  // ============================================================
  updateLighting: function(time) {
    if (!this.skyMat) return;

    var kf = [
      { t:  0,  top:0x020208, hor:0x080818, fog:0x05050f, sC:0x3344aa, sI:0.04, aI:0.03, hS:0x0d1425, hG:0x030303, hI:0.10 },
      { t:  4.5,top:0x0a0a25, hor:0x0f1030, fog:0x08081a, sC:0x3355bb, sI:0.04, aI:0.03, hS:0x0d1425, hG:0x030303, hI:0.10 },
      { t:  5.5,top:0x1a2255, hor:0xff7733, fog:0xff9944, sC:0xff8800, sI:0.25, aI:0.08, hS:0x2233aa, hG:0x220e00, hI:0.25 },
      { t:  7,  top:0x1a66cc, hor:0x88bbff, fog:0x99ccff, sC:0xffd090, sI:0.75, aI:0.20, hS:0x55aadd, hG:0x3d6020, hI:0.50 },
      { t: 12,  top:0x004fbb, hor:0x44aaff, fog:0x87ceeb, sC:0xffffff, sI:1.00, aI:0.30, hS:0x87ceeb, hG:0x7ec850, hI:0.65 },
      { t: 17,  top:0x0d4499, hor:0x66aaff, fog:0x88bbdd, sC:0xffe0aa, sI:0.85, aI:0.25, hS:0x77aabb, hG:0x508030, hI:0.55 },
      { t: 19,  top:0x110022, hor:0xff5500, fog:0xff6622, sC:0xff4400, sI:0.30, aI:0.08, hS:0x220033, hG:0x110500, hI:0.18 },
      { t: 21,  top:0x020208, hor:0x080818, fog:0x05050f, sC:0x3344aa, sI:0.04, aI:0.03, hS:0x0d1425, hG:0x030303, hI:0.10 },
      { t: 24,  top:0x020208, hor:0x080818, fog:0x05050f, sC:0x3344aa, sI:0.04, aI:0.03, hS:0x0d1425, hG:0x030303, hI:0.10 }
    ];

    var k0 = kf[0], k1 = kf[1];
    for (var i = 0; i < kf.length - 1; i++) {
      if (time >= kf[i].t && time <= kf[i+1].t) { k0 = kf[i]; k1 = kf[i+1]; break; }
    }
    var f = (k1.t === k0.t) ? 0 : (time - k0.t) / (k1.t - k0.t);
    f = f * f * (3 - 2 * f);

    var _t = new THREE.Color();
    function ln(a, b) { return a + (b - a) * f; }

    this.skyMat.uniforms.uTopColor.value.setHex(k0.top).lerp(_t.setHex(k1.top), f);
    this.skyMat.uniforms.uHorizonColor.value.setHex(k0.hor).lerp(_t.setHex(k1.hor), f);

    if (this.scene.fog) this.scene.fog.color.setHex(k0.fog).lerp(_t.setHex(k1.fog), f);

    var sunAngle = ((time - 6) / 12) * Math.PI;
    var sX = Math.cos(sunAngle) * 90;
    var sY = Math.max(-40, Math.sin(sunAngle) * 75 + 5);

    if (this.sunLight) {
      this.sunLight.color.setHex(k0.sC).lerp(_t.setHex(k1.sC), f);
      this.sunLight.intensity = ln(k0.sI, k1.sI);
      this.sunLight.position.set(sX, Math.max(5, sY), -20);
    }
    if (this.ambLight)  this.ambLight.intensity = ln(k0.aI, k1.aI);
    if (this.hemiLight) {
      this.hemiLight.color.setHex(k0.hS).lerp(_t.setHex(k1.hS), f);
      this.hemiLight.groundColor.setHex(k0.hG).lerp(_t.setHex(k1.hG), f);
      this.hemiLight.intensity = ln(k0.hI, k1.hI);
    }

    if (this.sunSprite) {
      this.sunSprite.position.set(sX, sY, -60);
      var sOp = (time >= 5 && time <= 19) ? Math.min(1, Math.min((time-5)/1.5, (19-time)/1.5)) : 0;
      this.sunSprite.material.opacity = sOp;
    }

    var mAngle = sunAngle + Math.PI;
    var mX = Math.cos(mAngle) * 90;
    var mY = Math.max(-40, Math.sin(mAngle) * 75 + 5);
    if (this.moonSprite) {
      this.moonSprite.position.set(mX, mY, -60);
      var mOp = 0;
      if (time >= 21 || time <= 3)       mOp = 1;
      else if (time > 19 && time < 21)   mOp = (time - 19) / 2;
      else if (time > 3  && time < 5)    mOp = 1 - (time - 3) / 2;
      this.moonSprite.material.opacity = Math.min(1, Math.max(0, mOp)) * 0.9;
    }

    if (this.stars) {
      var stOp = 0;
      if (time >= 21 || time <= 4)      stOp = 0.9;
      else if (time > 19 && time < 21)  stOp = (time - 19) / 2 * 0.9;
      else if (time > 4  && time < 6)   stOp = Math.max(0, (1 - (time - 4) / 2) * 0.9);
      this.stars.material.opacity = stOp;
    }

    // ضوء النوافذ ليلاً
    if (this.houseGlow) {
      var isNight = (time >= 20 || time <= 5);
      this.houseGlow.material.opacity = isNight ? 0.15 : 0;
    }

    // ✨ Ambient particles: dust (day) → fireflies (night)
    if (this.ambientParticleMat) {
      var isNight = (time >= 19.5 || time <= 5.5);
      var isDusk = (time >= 18 && time < 19.5) || (time > 5 && time <= 6.5);
      if (isNight) {
        // Firefly mode — green glow, pulsing
        this.ambientParticleMat.color.setHex(0x88ff66);
        this.ambientParticleMat.opacity = 0.35 + Math.sin(this.windTime * 1.5) * 0.15;
        this.ambientParticleMat.size = 0.08;
      } else if (isDusk) {
        // Golden dust
        this.ambientParticleMat.color.setHex(0xffaa44);
        this.ambientParticleMat.opacity = 0.3;
        this.ambientParticleMat.size = 0.05;
      } else {
        // Day — faint dust motes
        this.ambientParticleMat.color.setHex(0xffffcc);
        this.ambientParticleMat.opacity = 0.12;
        this.ambientParticleMat.size = 0.04;
      }
    }
  }
};
