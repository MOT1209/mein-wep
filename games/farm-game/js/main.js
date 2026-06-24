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
    inventory: { wheat: 0, tomato: 0, carrot: 0, apple: 0 },
    crafted: { bread: 0, ketchup: 0, juice: 0 },
    selectedTool: 0,
    plots: [],
    timeScale: 60,
    xp: 0,
    level: 1
  },

  recipes: {
    bread: { name: '🍞 Bread', icon: '🍞', inputs: { wheat: 2 }, sellPrice: 65, xpReward: 10 },
    ketchup: { name: '🥫 Ketchup', icon: '🥫', inputs: { tomato: 2 }, sellPrice: 100, xpReward: 15 },
    juice: { name: '🧃 Carrot Juice', icon: '🧃', inputs: { carrot: 2 }, sellPrice: 80, xpReward: 12 }
  },

  init: function() {
    var self = this;
    GAME.ui.init();

    var loadingSteps = [
      { at: 10, msg: 'Preparing world...' },
      { at: 25, msg: 'Planting trees...' },
      { at: 40, msg: 'Raising animals...' },
      { at: 55, msg: 'Setting up weather...' },
      { at: 70, msg: 'Tuning audio...' },
      { at: 85, msg: 'Almost ready...' },
    ];
    var stepIdx = 0;
    var loadInterval = setInterval(function() {
      var p = 10 + stepIdx * 15;
      GAME.ui.showLoading(p);
      var txt = document.querySelector('.loader-text');
      if (txt && stepIdx < loadingSteps.length) txt.textContent = loadingSteps[stepIdx].msg;
      stepIdx++;
      if (stepIdx > 6) clearInterval(loadInterval);
    }, 80);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 30, 60);

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
    GAME.AIAgent.init(this.scene); // Initialize AI Agent System

    this._autoSave = setInterval(function() { self.saveGame(); }, 30000);

    var muteBtn = document.getElementById('mute-btn');
    if (muteBtn && GAME.audio && GAME.audio.muted) muteBtn.textContent = '🔇';

    setTimeout(function() {
      GAME.ui.hideLoading();
      GAME.ui.showMenu();
    }, 800);

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
          fertilized: false,
          growthStage: 0,
          mesh: null,
          waterMarker: null,
          fertilizerMarker: null
        });
      }
    }
    this.state.plots = plots;
  },

  startNew: function() {
    this.state = {
      health: 100, energy: 100, money: 200,
      day: 1, time: 6,
      inventory: { wheat: 0, tomato: 0, carrot: 0, apple: 0 },
      crafted: { bread: 0, ketchup: 0, juice: 0 },
      selectedTool: 0,
      plots: [],
      timeScale: 60,
      xp: 0,
      level: 1
    };
    this.initPlots();
    this.selectTool(0);
    GAME.ui.hideMenu();
    GAME.ui.showNotification('🌾 Welcome to your new farm!', 'success');
    GAME.audio.play('chime');
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
        this.state.inventory = data.inventory || { wheat: 0, tomato: 0, carrot: 0, apple: 0, fertilizer: 0 };
        this.state.crafted = data.crafted || { bread: 0, ketchup: 0, juice: 0 };
        this.state.xp = data.xp || 0;
        this.state.level = data.level || 1;
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
        crafted: this.state.crafted,
        selectedTool: this.state.selectedTool,
        xp: this.state.xp,
        level: this.state.level
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
    if (el) el.classList.toggle('hidden', !this.isPaused);
    if (this.isPaused && document.pointerLockElement) {
      document.exitPointerLock();
    }
  },

  selectTool: function(index) {
    this.state.selectedTool = index;
    var slots = document.querySelectorAll('.tool-slot');
    for (var i = 0; i < slots.length; i++) {
      slots[i].classList.toggle('active', i === index);
    }
  },

  addXP: function(amount) {
    this.state.xp += amount;
    var needed = this.state.level * 100;
    if (this.state.xp >= needed) {
      this.state.xp -= needed;
      this.state.level++;
      GAME.ui.showNotification('⭐ Level up! You\'re now level ' + this.state.level + '!', 'success');
      GAME.audio.play('chime');
    }
  },

  getEnergyCost: function(base) {
    var reduction = Math.min(base - 1, Math.floor((this.state.level - 1) / 2));
    return Math.max(1, base - reduction);
  },

  getSellPriceBonus: function() {
    return 1 + (this.state.level - 1) * 0.03;
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
    else if (tool === 6) { this.plantClosest('apple'); GAME.audio.play('step'); }
    else if (tool === 7) { this.fertilizeClosest(); GAME.audio.play('step'); }
  },

  fertilizeClosest: function() {
    var idx = this.findClosestPlot('planted');
    if (idx === null) {
      // Try to find ready plants too
      idx = this.findClosestPlot('ready');
    }
    if (idx === null) {
      GAME.ui.showNotification('❌ No plants nearby to fertilize', 'error');
      return;
    }
    if ((this.state.inventory.fertilizer || 0) <= 0) {
      GAME.ui.showNotification('❌ No fertilizer in inventory', 'error');
      return;
    }
    this.state.plots[idx].fertilized = true;
    this.state.inventory.fertilizer--;
    
    // Update fertilizer marker
    var plot = this.state.plots[idx];
    if (plot.fertilizerMarker) {
      plot.fertilizerMarker.material.opacity = 0.8;
    }
    
    GAME.ui.showNotification('🌱 Fertilized! Growth boosted.', 'success');
    GAME.ui.refreshInventory();
  },
  
  addGrowthMarkers: function(plot) {
    // Add water marker (animated water droplets)
    if (!plot.waterMarker) {
      // Create a group for water droplets
      var waterGroup = new THREE.Group();
      
      // Create multiple water droplets for animation effect
      for (var i = 0; i < 3; i++) {
        var dropletGeo = new THREE.SphereGeometry(0.1, 8, 8);
        var dropletMat = new THREE.MeshBasicMaterial({ 
          color: 0x3498db, 
          transparent: true, 
          opacity: 0 
        });
        var droplet = new THREE.Mesh(dropletGeo, dropletMat);
        droplet.position.set(
          plot.x + (Math.random() - 0.5) * 0.3,
          0.1 + i * 0.15,
          plot.z + (Math.random() - 0.5) * 0.3
        );
        droplet.userData = {
          originalY: droplet.position.y,
          speed: 0.5 + Math.random() * 0.5
        };
        waterGroup.add(droplet);
      }
      
      plot.waterMarker = waterGroup;
      this.scene.add(plot.waterMarker);
    }
    
    // Add fertilizer marker (animated fertilizer packets)
    if (!plot.fertilizerMarker) {
      // Create a group for fertilizer packets
      var fertGroup = new THREE.Group();
      
      // Create fertilizer packet visual
      var packetGeo = new THREE.BoxGeometry(0.2, 0.1, 0.2);
      var packetMat = new THREE.MeshBasicMaterial({ 
        color: 0x8B4513, 
        transparent: true, 
        opacity: 0 
      });
      var packet = new THREE.Mesh(packetGeo, packetMat);
      packet.position.set(plot.x, 0.1, plot.z);
      
      // Add a small bag-like shape on top
      var bagGeo = new THREE.ConeGeometry(0.12, 0.08, 4);
      var bagMat = new THREE.MeshBasicMaterial({ 
        color: 0x654321, 
        transparent: true, 
        opacity: 0 
      });
      var bag = new THREE.Mesh(bagGeo, bagMat);
      bag.position.set(0, 0.05, 0);
      bag.rotation.x = Math.PI / 2;
      
      packet.add(bag);
      fertGroup.add(packet);
      
      plot.fertilizerMarker = fertGroup;
      this.scene.add(plot.fertilizerMarker);
    }
  },
  
  updatePlantVisual: function(plot, delta) {
    // If delta is not provided, use a default value for animation
    if (delta === undefined) delta = 0.016; // Approximately 60 FPS
    // Update water marker animation
    if (plot.waterMarker) {
      // Animate water droplets when plant is watered
      if (plot.watered) {
        // Animate droplets rising and fading
        for (var i = 0; i < plot.waterMarker.children.length; i++) {
          var droplet = plot.waterMarker.children[i];
          droplet.position.y += droplet.userData.speed * (delta || 0.016);
          
          // Fade out as it goes up
          var progress = (droplet.position.y - droplet.userData.originalY) / 0.3;
          droplet.material.opacity = Math.max(0, 0.8 - progress * 0.8);
          
          // Reset droplet when it goes too high
          if (droplet.position.y > droplet.userData.originalY + 0.3) {
            droplet.position.y = droplet.userData.originalY;
            droplet.material.opacity = 0;
          }
        }
      } else {
        // Fade out droplets when not watered
        for (var i = 0; i < plot.waterMarker.children.length; i++) {
          var droplet = plot.waterMarker.children[i];
          if (droplet.material.opacity > 0) {
            droplet.material.opacity -= 0.02;
          }
        }
      }
    }
    
    // Update fertilizer marker (pulse when active)
    if (plot.fertilizerMarker) {
      if (plot.fertilized) {
        // Pulse the fertilizer packet
        var pulse = Math.sin(Date.now() * 0.003) * 0.2 + 0.8; // Oscillate between 0.6 and 1.0
        plot.fertilizerMarker.children[0].material.opacity = 0.6 * pulse;
        // Also pulse the bag
        plot.fertilizerMarker.children[0].children[0].material.opacity = 0.6 * pulse;
      } else {
        // Fade out when not fertilized
        for (var i = 0; i < plot.fertilizerMarker.children.length; i++) {
          var obj = plot.fertilizerMarker.children[i];
          if (obj.material.opacity > 0) {
            obj.material.opacity -= 0.02;
          }
          if (obj.children && obj.children.length > 0 && obj.children[0].material.opacity > 0) {
            obj.children[0].material.opacity -= 0.02;
          }
        }
      }
    }
    
    // Define growth stages for different crops
    var growthStages = {
      wheat: [
        { height: 0.2, color: 0x8b4513 }, // Seed (brown)
        { height: 0.3, color: 0x8b4513 }, // Sprout (brown)
        { height: 0.5, color: 0x228b22 }, // Seedling (green)
        { height: 0.8, color: 0x228b22 }, // Mature (green)
        { height: 1.0, color: 0xdaa520 }  // Ready (golden)
      ],
      tomato: [
        { height: 0.2, color: 0x8b4513 }, // Seed (brown)
        { height: 0.3, color: 0x8b4513 }, // Sprout (brown)
        { height: 0.5, color: 0x228b22 }, // Seedling (green)
        { height: 0.8, color: 0xff4500 }, // Mature (orange-red)
        { height: 1.0, color: 0xff4444 }  // Ready (red)
      ],
      carrot: [
        { height: 0.2, color: 0x8b4513 }, // Seed (brown)
        { height: 0.3, color: 0x8b4513 }, // Sprout (brown)
        { height: 0.4, color: 0xff8c00 }, // Seedling (orange)
        { height: 0.6, color: 0xff8c00 }, // Mature (orange)
        { height: 1.0, color: 0xff8c00 }  // Ready (orange)
      ],
      apple: [
        { height: 0.2, color: 0x8b5a2b }, // Sapling (brown)
        { height: 0.4, color: 0x8b5a2b }, // Young tree (brown)
        { height: 0.6, color: 0x8b5a2b }, // Growing tree (brown)
        { height: 0.8, color: 0x8b5a2b }, // Mature tree (brown)
        { height: 1.0, color: 0x8b5a2b }  // Fruit-bearing (brown with apples - handled separately)
      ]
    };
    
    var stages = growthStages[plot.crop] || growthStages.wheat; // Default to wheat
    var stage = stages[Math.min(plot.growthStage, stages.length - 1)];
    
    if (plot.crop === 'apple') {
      // For apple trees, we don't scale the trunk/leaves, but we could add fruit visualization
      // For simplicity, we'll just ensure the tree exists
      if (!plot.mesh) {
        // Create tree if it doesn't exist
        var trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
        var leafMat = new THREE.MeshLambertMaterial({ color: 0x3a7d2c });
        var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.5), trunkMat);
        trunk.position.set(plot.x, 0.3, plot.z);
        this.scene.add(trunk);
        var leaf = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 6), leafMat);
        leaf.position.set(plot.x, 0.8, plot.z);
        leaf.scale.y = 0.7;
        this.scene.add(leaf);
        var group = new THREE.Group();
        group.add(trunk);
        group.add(leaf);
        plot.mesh = group;
        
        // Add apples when tree is mature (growthStage >= 3)
        if (plot.growthStage >= 3) {
          // Add some apples
          for (var i = 0; i < 3; i++) {
            var appleGeo = new THREE.SphereGeometry(0.08, 6, 6);
            var appleMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
            var apple = new THREE.Mesh(appleGeo, appleMat);
            // Position apple randomly around the tree
            var angle = Math.random() * Math.PI * 2;
            var radius = 0.3 + Math.random() * 0.2;
            apple.position.set(
              plot.x + Math.cos(angle) * radius,
              0.6 + Math.random() * 0.3,
              plot.z + Math.sin(angle) * radius
            );
            this.scene.add(apple);
            // Store reference to apples so we can remove them when harvesting
            if (!plot.apples) plot.apples = [];
            plot.apples.push(apple);
          }
        }
      } else if (plot.growthStage >= 3 && plot.apples) {
        // Ensure apples are visible when tree is mature
        for (var i = 0; i < plot.apples.length; i++) {
          plot.apples[i].visible = true;
        }
      }
    } else if (plot.mesh) {
      // For crops, update the plant mesh
      plot.mesh.scale.set(0.2, stage.height, 0.2);
      var mat = new THREE.MeshLambertMaterial({ color: stage.color });
      plot.mesh.material = mat;
      
      // Add growth stage indicator (small floating number)
      if (!plot.stageIndicator) {
        // Create a simple text sprite for growth stage
        // Since we don't have text rendering easily, we'll use a colored sphere
        var indicatorGeo = new THREE.SphereGeometry(0.05, 6, 6);
        var indicatorMat = new THREE.MeshBasicMaterial({ 
          color: 0xffff00, 
          transparent: true, 
          opacity: 0.7 
        });
        plot.stageIndicator = new THREE.Mesh(indicatorGeo, indicatorMat);
        plot.stageIndicator.position.set(plot.x, 0.2 + stage.height, plot.z);
        this.scene.add(plot.stageIndicator);
      }
      
      // Update indicator position and visibility
      if (plot.stageIndicator) {
        plot.stageIndicator.position.set(plot.x, 0.2 + stage.height * 1.1, plot.z);
        // Show indicator for early growth stages
        plot.stageIndicator.material.opacity = plot.growthStage < 2 ? 0.7 : 0;
      }
    }
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
    var cost = this.getEnergyCost(5);
    if (this.state.energy < cost) { GAME.ui.showNotification('❌ Too tired!', 'error'); return; }
    this.state.plots[idx].state = 'plowed';
    this.state.plots[idx].crop = null;
    this.state.plots[idx].growth = 0;
    this.state.plots[idx].watered = false;
    this.state.plots[idx].fertilized = false;
    this.state.energy -= cost;
    var plot = this.state.plots[idx];
    var dirtMat = new THREE.MeshLambertMaterial({ color: 0x4a2a0a });
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 2.2), dirtMat);
    mesh.position.set(plot.x, 0.08, plot.z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    plot.mesh = mesh;
    this.addXP(5);
    GAME.ui.showNotification('✅ Plowed! +5 XP', 'success');
  },

  waterClosest: function() {
    var idx = this.findClosestPlot('planted');
    if (idx === null) { GAME.ui.showNotification('❌ No planted crops nearby', 'error'); return; }
    var cost = this.getEnergyCost(3);
    if (this.state.energy < cost) { GAME.ui.showNotification('❌ Too tired!', 'error'); return; }
    this.state.plots[idx].watered = true;
    this.state.energy -= cost;
    this.addXP(3);
    GAME.ui.showNotification('💧 Watered crops! +3 XP', 'success');
    
    // Update water marker visibility
    var plot = this.state.plots[idx];
    if (plot.waterMarker) {
      plot.waterMarker.material.opacity = 0.6;
    }
  },

  plantClosest: function(crop) {
    var idx = this.findClosestPlot('plowed');
    if (idx === null) { GAME.ui.showNotification('❌ No plowed plots nearby', 'error'); return; }
    var prices = { wheat: 10, tomato: 20, carrot: 15, apple: 50 };
    var energyBase = { wheat: 8, tomato: 8, carrot: 8, apple: 12 };
    var cost = this.getEnergyCost(energyBase[crop] || 8);
    if (!prices[crop]) return;
    if (this.state.energy < cost) { GAME.ui.showNotification('❌ Too tired!', 'error'); return; }
    if ((this.state.inventory[crop] || 0) > 0) {
      this.state.inventory[crop]--;
    } else if (this.state.money >= prices[crop]) {
      this.state.money -= prices[crop];
    } else {
      GAME.ui.showNotification('❌ Need $' + prices[crop] + ' or a seed in inventory!', 'error');
      return;
    }
    this.state.energy -= cost;
    this.state.plots[idx].state = 'planted';
    this.state.plots[idx].crop = crop;
    this.state.plots[idx].growth = 0;
    this.state.plots[idx].watered = false;
    this.state.plots[idx].fertilized = false;
    this.state.plots[idx].growthStage = 0;
    var plot = this.state.plots[idx];
    var isTree = crop === 'apple';

    if (isTree) {
      var trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
      var leafMat = new THREE.MeshLambertMaterial({ color: 0x3a7d2c });
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.5), trunkMat);
      trunk.position.set(plot.x, 0.3, plot.z);
      this.scene.add(trunk);
      var leaf = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 6), leafMat);
      leaf.position.set(plot.x, 0.8, plot.z);
      leaf.scale.y = 0.7;
      this.scene.add(leaf);
      var group = new THREE.Group();
      group.add(trunk);
      group.add(leaf);
      plot.mesh = group;
    } else {
      var cropMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
      var plant = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.3), cropMat);
      plant.position.set(plot.x, 0.2, plot.z);
      this.scene.add(plant);
      plot.mesh = plant;
      
      // Add water and fertilizer markers
      this.addGrowthMarkers(plot);
    }
    this.addXP(8);
    GAME.ui.showNotification('🌱 Planted ' + crop + '! +8 XP', 'success');
  },

  harvestClosest: function() {
    var idx = this.findClosestPlot('ready');
    if (idx === null) { GAME.ui.showNotification('❌ No crops ready to harvest', 'error'); return; }
    var cost = this.getEnergyCost(10);
    if (this.state.energy < cost) { GAME.ui.showNotification('❌ Too tired!', 'error'); return; }
    var plot = this.state.plots[idx];
    var cropType = plot.crop;
    var prices = { wheat: 25, tomato: 40, carrot: 35, apple: 80 };
    var bonus = this.getSellPriceBonus();
    var salePrice = Math.floor((prices[cropType] || 25) * bonus);
    this.state.money += salePrice;
    this.state.energy -= cost;

    if (cropType === 'apple') {
      // For apple trees, reset growth but keep the tree
      if (plot.mesh) {
        // Keep the tree structure, just reset growth visuals
        plot.growth = 0;
        plot.growthStage = 0;
        plot.state = 'planted';
        plot.watered = false;
        plot.fertilized = false;
        this.updatePlantVisual(plot);
      }
      GAME.ui.showNotification('🍎 Apple harvested! Tree regrowing... +$' + salePrice, 'success');
    } else {
      // For crops, remove plant and reset to plowed state
      if (plot.mesh) { this.scene.remove(plot.mesh); }
      
      // Remove growth markers
      if (plot.waterMarker) {
        this.scene.remove(plot.waterMarker);
        plot.waterMarker = null;
      }
      if (plot.fertilizerMarker) {
        this.scene.remove(plot.fertilizerMarker);
        plot.fertilizerMarker = null;
      }
      
      var dirtMat = new THREE.MeshLambertMaterial({ color: 0x4a2a0a });
      var mesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 2.2), dirtMat);
      mesh.position.set(plot.x, 0.08, plot.z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      plot.mesh = mesh;
      plot.state = 'plowed';
      plot.crop = null;
      plot.growth = 0;
      plot.growthStage = 0;
      plot.watered = false;
      plot.fertilized = false;
      this.state.inventory[cropType] = (this.state.inventory[cropType] || 0) + 1;
      GAME.ui.showNotification('💰 Harvested ' + cropType + '! +$' + salePrice, 'success');
    }
    this.addXP(15);
  },

  craftItem: function(recipeId) {
    var recipe = this.recipes[recipeId];
    if (!recipe) return;
    for (var ingredient in recipe.inputs) {
      var needed = recipe.inputs[ingredient];
      var have = this.state.inventory[ingredient] || 0;
      if (have < needed) {
        GAME.ui.showNotification('❌ Need ' + needed + ' ' + ingredient + ' for ' + recipe.name, 'error');
        return;
      }
    }
    for (var ingredient in recipe.inputs) {
      this.state.inventory[ingredient] -= recipe.inputs[ingredient];
    }
    this.state.crafted[recipeId] = (this.state.crafted[recipeId] || 0) + 1;
    this.addXP(recipe.xpReward);
    GAME.ui.showNotification('🔨 Crafted ' + recipe.name + '! +' + recipe.xpReward + ' XP', 'success');
    GAME.audio.play('chime');
    GAME.ui.refreshInventory();
  },

  buySeed: function(type) {
    var prices = { wheat: 10, tomato: 20, carrot: 15, apple: 50 };
    if (!prices[type]) return;
    if (this.state.money < prices[type]) {
      GAME.ui.showNotification('❌ Not enough money!', 'error');
      return;
    }
    this.state.money -= prices[type];
    this.state.inventory[type] = (this.state.inventory[type] || 0) + 1;
    GAME.ui.showNotification('🌱 Bought ' + type + ' seed!', 'success');
  },

  sellItem: function(type) {
    var producePrices = { wheat: 25, tomato: 40, carrot: 35, apple: 80 };
    var craftedPrices = { bread: 65, ketchup: 100, juice: 80 };

    if (craftedPrices[type] !== undefined) {
      var amt = this.state.crafted[type] || 0;
      if (amt <= 0) {
        GAME.ui.showNotification('❌ No ' + type + ' to sell!', 'error');
        return;
      }
      var bonus = this.getSellPriceBonus();
      var price = Math.floor(craftedPrices[type] * bonus);
      this.state.money += price * amt;
      this.state.crafted[type] = 0;
      GAME.ui.showNotification('💰 Sold ' + amt + ' ' + type + ' for $' + (price * amt), 'success');
      return;
    }

    if (!this.state.inventory[type] || this.state.inventory[type] <= 0) {
      GAME.ui.showNotification('❌ No ' + type + ' to sell!', 'error');
      return;
    }
    var bonus = this.getSellPriceBonus();
    var price = Math.floor((producePrices[type] || 25) * bonus);
    var amt = this.state.inventory[type];
    this.state.money += price * amt;
    this.state.inventory[type] = 0;
    GAME.ui.showNotification('💰 Sold ' + amt + ' ' + type + ' for $' + (price * amt), 'success');
  },

  buyFertilizer: function() {
    var price = 15;
    if (this.state.money < price) {
      GAME.ui.showNotification('❌ Not enough money! Need $' + price, 'error');
      return;
    }
    this.state.money -= price;
    this.state.inventory.fertilizer = (this.state.inventory.fertilizer || 0) + 1;
    GAME.ui.showNotification('🌱 Bought fertilizer!', 'success');
  },

  sleep: function() {
    this.state.health = Math.min(100, this.state.health + 30);
    this.state.energy = 100;
    this.state.day++;
    this.state.time = 6;
    this.addXP(5);
    GAME.ui.showNotification('🌙 Slept! Day ' + this.state.day + ' ☀️ +5 XP', 'success');
  },

  update: function(delta) {
    if (this.isPaused || this.isShopOpen) return;
    var state = this.state;

    if (state.health <= 0) {
      this.handleDeath();
      return;
    }

    state.time += delta * 0.01 * state.timeScale;
    if (state.time >= 24) {
      state.time -= 24;
      state.day++;
    }
    if (state.energy < 100) state.energy += delta * 1.5;
    if (state.energy > 100) state.energy = 100;
    if (state.health < 100) state.health += delta * 0.5;
    if (state.health > 100) state.health = 100;
    
    // Update growth markers visibility
    for (var i = 0; i < state.plots.length; i++) {
      var plot = state.plots[i];
      if (plot.waterMarker) {
        plot.waterMarker.material.opacity = plot.watered ? 0.6 : 0;
      }
      if (plot.fertilizerMarker) {
        plot.fertilizerMarker.material.opacity = plot.fertilized ? 0.8 : 0;
      }
    }
    
    for (var i = 0; i < state.plots.length; i++) {
      var plot = state.plots[i];
      if (plot.state === 'planted') {
        // Base growth rate
        var baseGrowthRate = 0.5;
        
        // Water bonus
        if (plot.watered) {
          baseGrowthRate = 1.5;
        }
        
        // Fertilizer bonus
        if (plot.fertilized) {
          baseGrowthRate *= 1.5;
        }
        
        // Weather effect
        var weatherMultiplier = 1.0;
        if (GAME.weather && GAME.weather.current === 'rainy') {
          weatherMultiplier = 1.3; // Rain boosts growth
        } else if (GAME.weather && GAME.weather.current === 'stormy') {
          weatherMultiplier = 0.8; // Storm slightly hinders growth
        }
        
        // Crop-specific growth rates
        var cropGrowthRates = {
          wheat: 1.0,
          tomato: 1.2,
          carrot: 0.9,
          apple: 0.4 // Trees grow slower
        };
        var cropMultiplier = cropGrowthRates[plot.crop] || 1.0;
        
        // Level bonus
        var levelBonus = 1 + (state.level - 1) * 0.02;
        
        // Tree multiplier
        var treeMultiplier = plot.crop === 'apple' ? 0.33 : 1;
        
        // Calculate final growth
        var growthRate = baseGrowthRate * weatherMultiplier * cropMultiplier * levelBonus * treeMultiplier;
        plot.growth += delta * growthRate * 0.02;
        
        // Update growth stage (0-4: seed, sprout, seedling, mature, ready)
        var newGrowthStage = Math.floor(plot.growth * 4);
        if (newGrowthStage > plot.growthStage) {
          plot.growthStage = newGrowthStage;
          this.updatePlantVisual(plot, delta);
        }
        
        if (plot.growth >= 1) {
          plot.state = 'ready';
          plot.growth = 1;
          // Ensure final visual state
          plot.growthStage = 4;
          this.updatePlantVisual(plot, delta);
          
          // Special handling for trees (they reset after harvest)
          if (plot.crop === 'apple') {
            // Tree resets to planted state after harvest, but keeps growing
            plot.state = 'planted';
            plot.growth = 0;
            plot.growthStage = 0;
          }
        } else if (plot.mesh && plot.crop !== 'apple') {
          // Smooth growth animation for non-tree crops
          var scale = 0.2 + plot.growth * 0.8; // From 0.2 to 1.0
          plot.mesh.scale.set(scale, scale, scale);
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
    if (GAME.AIAgent) GAME.AIAgent.update(delta); // Update AI Agents
    this.updateInteractionHints();
    GAME.ui.updateHUD(state);
  },

  handleDeath: function() {
    this.isPaused = true;
    GAME.ui.showNotification('💀 You passed out from exhaustion!', 'error');
    var self = this;
    setTimeout(function() {
      self.state.health = 50;
      self.state.energy = 50;
      self.state.money = Math.max(0, self.state.money - 50);
      self.state.time = 6;
      self.state.xp = Math.max(0, self.state.xp - 20);
      self.isPaused = false;
      GAME.player.mesh.position.set(0, 0, 15);
      GAME.ui.showNotification('💀 Lost $50 and 20 XP. Be more careful!', 'error');
    }, 2000);
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
