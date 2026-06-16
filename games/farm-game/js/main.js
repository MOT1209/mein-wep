var GAME = GAME || {};

GAME.game = {
  scene: null,
  renderer: null,
  clock: null,
  isRunning: false,
  isPaused: false,
  isShopOpen: false,

  state: {
    health: 100,
    energy: 100,
    money: 200,
    day: 1,
    time: 6,
    inventory: { wheat: 0, tomato: 0, carrot: 0 },
    selectedTool: 0,
    plots: [],
    timeScale: 60
  },

  init: function() {
    var self = this;
    GAME.ui.init();

    this.scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.body.prepend(renderer.domElement);
    this.renderer = renderer;

    GAME.camera.init();
    GAME.world.init(this.scene);
    GAME.player.init(this.scene);
    GAME.animals.init(this.scene);
    GAME.weather.init(this.scene);
    GAME.audio.init();

    var self = this;
    this._autoSave = setInterval(function() { self.saveGame(); }, 30000);

    GAME.ui.hideLoading();
    GAME.ui.showMenu();
    this.clock = new THREE.Clock();
    this.isRunning = true;

    this.initPlots();
    this.animate();
  },

  initPlots: function() {
    var plots = [];
    var rows = 6, cols = 6;
    var spacing = 2.8;
    var startX = -(cols - 1) * spacing / 2;
    var startZ = 2;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        plots.push({
          row: r, col: c,
          x: startX + c * spacing,
          z: startZ + r * spacing,
          state: 'empty',
          crop: null,
          growth: 0,
          watered: false,
          mesh: null
        });
      }
    }
    this.state.plots = plots;
  },

  startNew: function() {
    this.state = {
      health: 100, energy: 100, money: 200,
      day: 1, time: 6,
      inventory: { wheat: 0, tomato: 0, carrot: 0 },
      selectedTool: 0,
      plots: [],
      timeScale: 60
    };
    this.initPlots();
    this.selectTool(0);
    GAME.ui.hideMenu();
    GAME.ui.showNotification('🌾 Welcome to your new farm!', 'success');
  },

  loadGame: function() {
    try {
      var saved = localStorage.getItem('farmGameSave');
      if (saved) {
        var data = JSON.parse(saved);
        this.state.health = data.health || 100;
        this.state.energy = data.energy || 100;
        this.state.money = data.money || 200;
        this.state.day = data.day || 1;
        this.state.time = data.time || 6;
        this.state.inventory = data.inventory || { wheat: 0, tomato: 0, carrot: 0 };
        this.selectTool(this.state.selectedTool || 0);
        GAME.ui.hideMenu();
        GAME.ui.showNotification('🌾 Welcome back, farmer!', 'success');
      } else {
        this.startNew();
      }
    } catch (e) {
      console.warn('Save corrupted, starting new game');
      this.startNew();
    }
  },

  saveGame: function() {
    try {
      var data = {
        health: this.state.health,
        energy: this.state.energy,
        money: this.state.money,
        day: this.state.day,
        time: this.state.time,
        inventory: this.state.inventory,
        selectedTool: this.state.selectedTool
      };
      localStorage.setItem('farmGameSave', JSON.stringify(data));
      GAME.ui.showNotification('💾 Game saved!', 'success');
    } catch (e) {
      GAME.ui.showNotification('❌ Save failed!', 'error');
    }
  },

  quitToMenu: function() {
    this.isPaused = false;
    document.getElementById('pause-menu').classList.add('hidden');
    document.getElementById('hud').style.opacity = '0';
    GAME.ui.showMenu();
  },

  togglePause: function() {
    this.isPaused = !this.isPaused;
    var el = document.getElementById('pause-menu');
    if (el) {
      el.classList.toggle('hidden', !this.isPaused);
    }
  },

  selectTool: function(index) {
    this.state.selectedTool = index;
    var slots = document.querySelectorAll('.tool-slot');
    for (var i = 0; i < slots.length; i++) {
      slots[i].classList.toggle('active', i === index);
    }
  },

  interact: function() {
    var p = GAME.player.mesh.position;
    var distToMarket = Math.sqrt(p.x * p.x + (p.z + 22) * (p.z + 22));
    if (distToMarket < 5) {
      toggleShop();
      GAME.audio.play('chime');
      return;
    }
    var distToHouse = Math.sqrt((p.x + 15) * (p.x + 15) + (p.z + 15) * (p.z + 15));
    if (distToHouse < 4) {
      this.sleep();
      GAME.audio.play('chime');
      return;
    }
    var distToTrough = Math.sqrt((p.x - 16) * (p.x - 16) + (p.z + 12) * (p.z + 12));
    if (distToTrough < 4) {
      if (GAME.animals) {
        var fed = GAME.animals.feed(p.x, p.z);
        if (fed) GAME.audio.play('chime');
      }
      return;
    }
    if (GAME.animals) {
      var collected = GAME.animals.collect(p.x, p.z);
      if (collected) { GAME.audio.play('coin'); return; }
    }
    GAME.ui.showInteractionHint(null);
  },

  doAction: function() {
    var p = GAME.player.mesh.position;
    var distToTrough = Math.sqrt((p.x - 16) * (p.x - 16) + (p.z + 12) * (p.z + 12));
    if (distToTrough < 4) {
      if (GAME.animals) {
        var fed = GAME.animals.feed(p.x, p.z);
        if (fed) { GAME.audio.play('chime'); return; }
      }
    }
    if (GAME.animals) {
      var collected = GAME.animals.collect(p.x, p.z);
      if (collected) { GAME.audio.play('coin'); return; }
    }
    var tool = this.state.selectedTool;
    if (tool === 0) { this.plowClosest(); GAME.audio.play('step'); }
    else if (tool === 1) { this.waterClosest(); GAME.audio.play('water'); }
    else if (tool === 2) { this.plantClosest('wheat'); GAME.audio.play('step'); }
    else if (tool === 3) { this.plantClosest('tomato'); GAME.audio.play('step'); }
    else if (tool === 4) { this.plantClosest('carrot'); GAME.audio.play('step'); }
    else if (tool === 5) { this.harvestClosest(); GAME.audio.play('harvest'); }
  },

  findClosestPlot: function(state) {
    var p = GAME.player.mesh.position;
    var closest = null, minDist = 3;
    for (var i = 0; i < this.state.plots.length; i++) {
      var plot = this.state.plots[i];
      if (state && plot.state !== state) continue;
      var dx = p.x - plot.x, dz = p.z - plot.z;
      var dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }
    return closest;
  },

  plowClosest: function() {
    var idx = this.findClosestPlot('empty');
    if (idx === null) { GAME.ui.showNotification('❌ No empty plots nearby', 'error'); return; }
    if (this.state.energy < 5) { GAME.ui.showNotification('❌ Too tired!', 'error'); return; }
    this.state.plots[idx].state = 'plowed';
    this.state.energy -= 5;
    var plot = this.state.plots[idx];
    var dirtMat = new THREE.MeshLambertMaterial({ color: 0x4a2a0a });
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 2.2), dirtMat);
    mesh.position.set(plot.x, 0.08, plot.z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    plot.mesh = mesh;
    GAME.ui.showNotification('✅ Plowed!', 'success');
  },

  waterClosest: function() {
    var idx = this.findClosestPlot('planted');
    if (idx === null) { GAME.ui.showNotification('❌ No planted crops nearby', 'error'); return; }
    if (this.state.energy < 3) { GAME.ui.showNotification('❌ Too tired!', 'error'); return; }
    this.state.plots[idx].watered = true;
    this.state.energy -= 3;
    GAME.ui.showNotification('💧 Watered crops!', 'success');
  },

  plantClosest: function(crop) {
    var idx = this.findClosestPlot('plowed');
    if (idx === null) { GAME.ui.showNotification('❌ No plowed plots nearby', 'error'); return; }
    var price = { wheat: 10, tomato: 20, carrot: 15 };
    if (this.state.money < price[crop]) { GAME.ui.showNotification('❌ Not enough money! $' + price[crop], 'error'); return; }
    if (this.state.energy < 8) { GAME.ui.showNotification('❌ Too tired!', 'error'); return; }
    this.state.money -= price[crop];
    this.state.energy -= 8;
    this.state.plots[idx].state = 'planted';
    this.state.plots[idx].crop = crop;
    this.state.plots[idx].growth = 0;
    this.state.plots[idx].watered = false;
    var plot = this.state.plots[idx];
    var cropMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    var plant = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.3), cropMat);
    plant.position.set(plot.x, 0.2, plot.z);
    this.scene.add(plant);
    plot.mesh = plant;
    GAME.ui.showNotification('🌱 Planted ' + crop + '!', 'success');
  },

  harvestClosest: function() {
    var idx = this.findClosestPlot('ready');
    if (idx === null) { GAME.ui.showNotification('❌ No crops ready to harvest', 'error'); return; }
    if (this.state.energy < 10) { GAME.ui.showNotification('❌ Too tired!', 'error'); return; }
    var plot = this.state.plots[idx];
    var prices = { wheat: 25, tomato: 40, carrot: 35 };
    this.state.money += prices[plot.crop] || 25;
    this.state.energy -= 10;
    if (plot.mesh) { this.scene.remove(plot.mesh); }
    plot.state = 'plowed';
    plot.crop = null;
    plot.growth = 0;
    plot.watered = false;
    var dirtMat = new THREE.MeshLambertMaterial({ color: 0x4a2a0a });
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 2.2), dirtMat);
    mesh.position.set(plot.x, 0.08, plot.z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    plot.mesh = mesh;
    GAME.ui.showNotification('💰 Harvested! +$' + prices[plot.crop], 'success');
  },

  buySeed: function(type) {
    var prices = { wheat: 10, tomato: 20, carrot: 15 };
    if (this.state.money < prices[type]) {
      GAME.ui.showNotification('❌ Not enough money!', 'error');
      return;
    }
    this.state.money -= prices[type];
    this.state.inventory[type] = (this.state.inventory[type] || 0) + 1;
    GAME.ui.showNotification('🌱 Bought ' + type + ' seed!', 'success');
  },

  sellItem: function(type) {
    if (!this.state.inventory[type] || this.state.inventory[type] <= 0) {
      GAME.ui.showNotification('❌ No ' + type + ' to sell!', 'error');
      return;
    }
    var prices = { wheat: 25, tomato: 40, carrot: 35 };
    var amt = this.state.inventory[type];
    this.state.money += prices[type] * amt;
    this.state.inventory[type] = 0;
    GAME.ui.showNotification('💰 Sold ' + amt + ' ' + type + ' for $' + (prices[type] * amt), 'success');
  },

  sleep: function() {
    this.state.health = Math.min(100, this.state.health + 30);
    this.state.energy = 100;
    this.state.day++;
    this.state.time = 6;
    GAME.ui.showNotification('🌙 Slept! Day ' + this.state.day + ' ☀️', 'success');
  },

  update: function(delta) {
    if (this.isPaused || this.isShopOpen) return;
    var state = this.state;
    state.time += delta * 0.01 * state.timeScale;
    if (state.time >= 24) {
      state.time -= 24;
      state.day++;
    }
    if (state.energy < 100) state.energy += delta * 1.5;
    if (state.energy > 100) state.energy = 100;
    if (state.health < 100) state.health += delta * 0.5;
    if (state.health > 100) state.health = 100;
    for (var i = 0; i < state.plots.length; i++) {
      var plot = state.plots[i];
      if (plot.state === 'planted') {
        var growthRate = plot.watered ? 1.5 : 0.5;
        plot.growth += delta * growthRate * 0.02;
        if (plot.growth >= 1) {
          plot.state = 'ready';
          plot.growth = 1;
          if (plot.mesh) {
            this.scene.remove(plot.mesh);
            var cropColors = { wheat: 0xdaa520, tomato: 0xff4444, carrot: 0xff8c00 };
            var color = cropColors[plot.crop] || 0xdaa520;
            var cropMat = new THREE.MeshLambertMaterial({ color: color });
            var plant = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 0.7, 6), cropMat);
            plant.position.set(plot.x, 0.4, plot.z);
            this.scene.add(plant);
            plot.mesh = plant;
            GAME.ui.showNotification('🌾 Crops ready to harvest!', 'success');
          }
        } else if (plot.mesh && plot.growth > 0.3) {
          var s = 1 + plot.growth * 1.5;
          plot.mesh.scale.set(1, s, 1);
        }
      }
    }
    GAME.player.update(delta);
    if (GAME.player.isMoving) {
      this._stepTimer = (this._stepTimer || 0) + delta;
      if (this._stepTimer > 0.4) {
        GAME.audio.play('step');
        this._stepTimer = 0;
      }
    }
    if (GAME.animals) GAME.animals.update(delta);
    if (GAME.weather) GAME.weather.update(delta);
    this.updateInteractionHints();
    GAME.ui.updateHUD(state);
  },

  updateInteractionHints: function() {
    if (this.isPaused || this.isShopOpen) return;
    var p = GAME.player.mesh.position;
    var hints = [];
    if (Math.sqrt(p.x * p.x + (p.z + 22) * (p.z + 22)) < 5) hints.push('[E] Shop');
    if (Math.sqrt((p.x + 15) * (p.x + 15) + (p.z + 15) * (p.z + 15)) < 4) hints.push('[E] Sleep');
    if (Math.sqrt((p.x - 16) * (p.x - 16) + (p.z + 12) * (p.z + 12)) < 4) hints.push('[E/F] Feed Animals');
    if (GAME.animals) {
      for (var i = 0; i < GAME.animals.list.length; i++) {
        var a = GAME.animals.list[i];
        if (a.hasProduct) {
          var dx = p.x - a.x, dz = p.z - a.z;
          if (Math.sqrt(dx * dx + dz * dz) < 3) { hints.push('[E] Collect ' + a.type + ' product'); break; }
        }
      }
    }
    GAME.ui.showInteractionHint(hints.length > 0 ? hints[0] : null);
  },

  animate: function() {
    var self = this;
    function loop() {
      if (!self.isRunning) return;
      requestAnimationFrame(loop);
      var delta = Math.min(self.clock.getDelta(), 0.05);
      self.update(delta);
      self.renderer.render(self.scene, GAME.camera.camera);
    }
    loop();
  }
};

GAME.game.init();
