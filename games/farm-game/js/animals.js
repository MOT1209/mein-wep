var GAME = GAME || {};
GAME.animals = {
  list: [],
  scene: null,
  penBounds: { minX: 11, maxX: 22, minZ: -18, maxZ: -6 },

  types: {
    chicken: { name: 'Chicken', product: 'Egg', price: 15, cost: 50, color: 0xf5f5f0, bodyR: 0.25, speed: 2.0 },
    cow:     { name: 'Cow',     product: 'Milk', price: 30, cost: 200, color: 0x8B6914, bodyR: 0.7, speed: 0.8 },
    sheep:   { name: 'Sheep',   product: 'Wool', price: 25, cost: 150, color: 0xE8E8E8, bodyR: 0.6, speed: 1.2 }
  },

  init: function(scene) {
    this.scene = scene;
  },

  createAnimal: function(type) {
    var t = this.types[type];
    if (!t) return null;
    var x = this.penBounds.minX + Math.random() * (this.penBounds.maxX - this.penBounds.minX);
    var z = this.penBounds.minZ + Math.random() * (this.penBounds.maxZ - this.penBounds.minZ);
    return this._spawn(type, x, z);
  },

  _spawn: function(type, x, z) {
    var t = this.types[type];
    var group = new THREE.Group();

    if (type === 'chicken') {
      var bodyMat = new THREE.MeshLambertMaterial({ color: t.color });
      var body = new THREE.Mesh(new THREE.SphereGeometry(t.bodyR, 8, 8), bodyMat);
      body.position.y = t.bodyR;
      body.scale.set(1, 0.8, 0.9);
      body.castShadow = true; group.add(body);
      var head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshLambertMaterial({ color: 0xffcc00 }));
      head.position.set(0.2, t.bodyR + 0.1, 0); group.add(head);
      var beak = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), new THREE.MeshLambertMaterial({ color: 0xff6600 }));
      beak.position.set(0.32, t.bodyR + 0.08, 0); beak.rotation.x = 0.3; group.add(beak);
      var comb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
      comb.position.set(0.12, t.bodyR + 0.2, 0); comb.scale.set(1.5, 1, 1); group.add(comb);
      for (var i = 0; i < 2; i++) {
        var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12), new THREE.MeshLambertMaterial({ color: 0xff6600 }));
        leg.position.set((i === 0 ? -0.08 : 0.08), 0.06, 0); group.add(leg);
      }
    } else if (type === 'cow') {
      var bodyMat = new THREE.MeshLambertMaterial({ color: t.color });
      var body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.7), bodyMat);
      body.position.y = 0.5; body.castShadow = true; group.add(body);
      var patchMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      var patch = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.2), patchMat);
      patch.position.set(0.3, 0.7, 0.3); group.add(patch);
      var head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.35), new THREE.MeshLambertMaterial({ color: 0xffddcc }));
      head.position.set(0.7, 0.45, 0); group.add(head);
      for (var i = 0; i < 2; i++) {
        var horn = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), new THREE.MeshLambertMaterial({ color: 0xdddddd }));
        horn.position.set(0.85, 0.65, (i === 0 ? -0.15 : 0.15));
        horn.rotation.x = (i === 0 ? 0.4 : -0.4); group.add(horn);
      }
      for (var i = 0; i < 4; i++) {
        var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.35), new THREE.MeshLambertMaterial({ color: 0xffffff }));
        leg.position.set((i < 2 ? -0.35 : 0.35), 0.175, (i % 2 === 0 ? -0.25 : 0.25)); group.add(leg);
      }
    } else if (type === 'sheep') {
      var bodyMat = new THREE.MeshLambertMaterial({ color: 0xE8E8E8 });
      var body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.7), bodyMat);
      body.position.y = 0.45; body.castShadow = true; group.add(body);
      var woolMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
      var wool = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), woolMat);
      wool.position.y = 0.7; wool.scale.set(1.2, 0.8, 1.0); group.add(wool);
      var head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.25), new THREE.MeshLambertMaterial({ color: 0xddccbb }));
      head.position.set(0.55, 0.4, 0); group.add(head);
      for (var i = 0; i < 4; i++) {
        var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3), new THREE.MeshLambertMaterial({ color: 0x333333 }));
        leg.position.set((i < 2 ? -0.3 : 0.3), 0.15, (i % 2 === 0 ? -0.25 : 0.25)); group.add(leg);
      }
    }

    group.position.set(x, 0, z);
    var angle = Math.random() * Math.PI * 2;
    group.rotation.y = angle;
    this.scene.add(group);

    var animal = {
      type: type,
      mesh: group,
      x: x, z: z,
      angle: angle,
      hunger: 100,
      happiness: 50,
      productTimer: 0,
      productReady: false,
      hasProduct: false,
      targetX: x,
      targetZ: z,
      wanderTimer: 2 + Math.random() * 3,
      idleTimer: 0,
      isIdle: false,
      bobPhase: Math.random() * Math.PI * 2
    };
    this.list.push(animal);
    return animal;
  },

  feed: function(x, z) {
    var nearest = null, minDist = 4;
    for (var i = 0; i < this.list.length; i++) {
      var a = this.list[i];
      var dx = x - a.x, dz = z - a.z;
      var dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) { minDist = dist; nearest = a; }
    }
    if (nearest) {
      nearest.hunger = Math.min(100, nearest.hunger + 40);
      nearest.happiness = Math.min(100, nearest.happiness + 15);
      GAME.ui.showNotification('🍽️ Fed the ' + nearest.type + '!', 'success');
      return true;
    }
    return false;
  },

  collect: function(x, z) {
    var nearest = null, minDist = 3;
    for (var i = 0; i < this.list.length; i++) {
      var a = this.list[i];
      if (!a.hasProduct) continue;
      var dx = x - a.x, dz = z - a.z;
      var dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) { minDist = dist; nearest = a; }
    }
    if (nearest) {
      var t = this.types[nearest.type];
      GAME.game.state.money += t.price;
      nearest.hasProduct = false;
      nearest.productTimer = 0;
      GAME.ui.showNotification('🐔 Collected ' + t.product + '! +$' + t.price, 'success');
      return true;
    }
    return false;
  },

  buy: function(type) {
    if (GAME.animals.list.length >= 12) {
      GAME.ui.showNotification('❌ Pen is full!', 'error'); return false;
    }
    var t = this.types[type];
    if (!t) return false;
    if (GAME.game.state.money < t.cost) {
      GAME.ui.showNotification('❌ Not enough money! $' + t.cost, 'error'); return false;
    }
    GAME.game.state.money -= t.cost;
    this.createAnimal(type);
    GAME.ui.showNotification('🐑 Bought a ' + type + '!', 'success');
    return true;
  },

  update: function(delta) {
    for (var i = 0; i < this.list.length; i++) {
      var a = this.list[i];
      a.hunger -= delta * 0.5;
      if (a.hunger < 0) a.hunger = 0;
      a.happiness -= delta * 0.1;
      if (a.happiness < 0) a.happiness = 0;
      a.productTimer += delta;
      if (a.hunger > 60 && a.productTimer > 15 && !a.hasProduct) {
        a.hasProduct = true;
      }
      a.wanderTimer -= delta;
      if (a.wanderTimer <= 0) {
        if (a.isIdle) {
          a.targetX = this.penBounds.minX + Math.random() * (this.penBounds.maxX - this.penBounds.minX);
          a.targetZ = this.penBounds.minZ + Math.random() * (this.penBounds.maxZ - this.penBounds.minZ);
          a.wanderTimer = 2 + Math.random() * 4;
          a.isIdle = false;
        } else {
          a.wanderTimer = 1 + Math.random() * 2;
          a.isIdle = true;
        }
      }
      if (!a.isIdle) {
        var dx = a.targetX - a.x;
        var dz = a.targetZ - a.z;
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.3) {
          var speed = GAME.animals.types[a.type].speed * delta;
          a.x += (dx / dist) * speed;
          a.z += (dz / dist) * speed;
          a.angle = Math.atan2(dx, dz);
          a.bobPhase += delta * 4;
          a.mesh.position.y = Math.abs(Math.sin(a.bobPhase)) * 0.03;
        }
      }
      a.mesh.position.x = a.x;
      a.mesh.position.z = a.z;
      a.mesh.rotation.y = a.angle;
      if (a.hasProduct) {
        if (a._prodIndicator) {
          a._prodIndicator.position.y = 1.0 + Math.sin(Date.now() * 0.003) * 0.05;
        } else if (this.scene) {
          var icons = { chicken: '🥚', cow: '🥛', sheep: '🧶' };
          var canvas = document.createElement('canvas');
          canvas.width = 64; canvas.height = 64;
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0, 0, 64, 64);
          ctx.font = '42px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(icons[a.type] || '⭐', 32, 36);
          var tex = new THREE.CanvasTexture(canvas);
          var spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
          var sprite = new THREE.Sprite(spriteMat);
          sprite.position.set(a.x, 1.0, a.z);
          sprite.scale.set(0.6, 0.6, 1);
          this.scene.add(sprite);
          a._prodIndicator = sprite;
        }
      } else if (a._prodIndicator) {
        this.scene.remove(a._prodIndicator);
        a._prodIndicator.material.map = null;
        a._prodIndicator.material.dispose();
        a._prodIndicator = null;
      }
    }
  }
};
