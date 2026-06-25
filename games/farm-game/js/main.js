var GAME = GAME || {};

// 🛡️ شبكة أمان عالمية: أي خطأ غير متوقع يظهر القائمة
window.addEventListener('error', function(e) {
  console.error('[FarmGame] 💥 Uncaught:', e.message);
  var txt = document.querySelector('.loader-text');
  if (txt) txt.textContent = '⚠️ Error: ' + (e.message || 'unknown');
  try {
    if (typeof GAME !== 'undefined' && GAME.ui && GAME.ui.hideLoading) GAME.ui.hideLoading();
    if (typeof GAME !== 'undefined' && GAME.ui && GAME.ui.showMenu) GAME.ui.showMenu();
  } catch(ex) { /* last resort */ }
});

// Merge with existing GAME.game (from state.js), don't overwrite
Object.assign(GAME.game, {
  scene: null,
  renderer: null,
  clock: null,
  isRunning: false,
  isPaused: false,
  isShopOpen: false,
  qualityLevel: 'high',
  _autoQuality: true,
  _fpFrames: 0,
  _fpTime: 0,
  _fpLowCounter: 0,
  particles: [],

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

    // 🛡️ Fallback: after 3s show menu anyway (حتى لو صار خطأ بالتهيئة)
    setTimeout(function() {
      GAME.ui.hideLoading();
      GAME.ui.showMenu();
      console.warn('[FarmGame] ⏰ Fallback timeout triggered — menu forced at 3s');
    }, 3000);

    // ⚠️ Wrap heavy 3D init in try-catch لالتقاط أخطاء WebGL/THREE
    try {
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
      GAME.AIAgent.init(this.scene);

      this._autoSave = setInterval(function() { self.saveGame(); }, 30000);

      var muteBtn = document.getElementById('mute-btn');
      if (muteBtn && GAME.audio && GAME.audio.muted) muteBtn.textContent = '🔇';

      setTimeout(function() {
        GAME.ui.hideLoading();
        GAME.ui.showMenu();
      }, 800);

      this.clock = new THREE.Clock();
      this.isRunning = true;

      this.animate();
    } catch (err) {
      console.error('[FarmGame] ❌ Init error:', err.message, err.stack);
      // Show error on loading screen للمساعدة في التشخيص
      var txt = document.querySelector('.loader-text');
      if (txt) txt.textContent = '⚠️ Error: ' + err.message;
      GAME.ui.showLoading(100);
      // Force menu after error message
      setTimeout(function() {
        GAME.ui.hideLoading();
        GAME.ui.showMenu();
      }, 2000);
    }
  },

  startNew: function() {
    this.state = {
      health: 100, energy: 100, money: 200,
      day: 1, time: 6,
      inventory: { wheat: 0, tomato: 0, carrot: 0, apple: 0, fertilizer: 0 },
      crafted: { bread: 0, ketchup: 0, juice: 0 },
      selectedTool: 0,
      plots: [],
      timeScale: 60,
      xp: 0,
      level: 1,
      quests: []
    };
    this.initPlots();
    GAME.quests.generateDaily();
    this.state.quests = GAME.quests.generateDaily();
    this.selectTool(0);
    GAME.ui.hideMenu();
    GAME.ui.showNotification('🌾 Welcome to your new farm!', 'success');
    GAME.audio.play('chime');
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
    var plot = this.state.plots[idx];
    this.spawnFertilizerParticles(plot.x, plot.z); // 🎆 جسيمات السماد
    
    // Update fertilizer marker
    this.updatePlantVisual(plot);
    
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
    this.spawnPlowParticles(plot.x, plot.z); // 🎆 جسيمات الحرث
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
    GAME.quests.track('water', 1);
    GAME.ui.showNotification('💧 Watered crops! +3 XP', 'success');
    var plot = this.state.plots[idx];
    this.spawnWaterParticles(plot.x, plot.z); // 🎆 جسيمات الماء
    
    // Update water marker visibility
    this.updatePlantVisual(plot);
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
    GAME.quests.track('plant', 1);
    GAME.ui.showNotification('🌱 Planted ' + crop + '! +8 XP', 'success');
    // 🎆 جسيمات الزراعة
    var plantColors = { wheat: 0x228B22, tomato: 0x228B22, carrot: 0x228B22, apple: 0x8B5A2B };
    this.spawnParticles(plot.x, 0.5, plot.z, plantColors[crop] || 0x228B22, 12, 2, 0.08, 0.6);
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
    // 🎆 جسيمات الحصاد
    this.spawnHarvestParticles(plot.x, plot.z, cropType);

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
      this._disposePlotMesh(plot);
      
      // Remove growth markers
      this._disposePlotMarker(plot, 'waterMarker');
      this._disposePlotMarker(plot, 'fertilizerMarker');
      
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
    GAME.quests.track('harvest', 1);
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
    GAME.quests.track('craft', 1);
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
      GAME.quests.track('earn', price * amt);
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
    GAME.quests.track('earn', price * amt);
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
    this.state.quests = GAME.quests.generateDaily();
    this.addXP(5);
    GAME.ui.showNotification('🌙 Slept! Day ' + this.state.day + ' ☀️ +5 XP', 'success');
  },

  update: function(delta) {
    if (this.isPaused || this.isShopOpen) return;
    var state = this.state;
    if (!state) return; // 🛡️ اللعبة لم تبدأ بعد (القائمة الرئيسةة ظاهرة)

    if (state.health <= 0) {
      this.handleDeath();
      return;
    }

    state.time += delta * 0.01 * state.timeScale;
    if (state.time >= 24) {
      state.time -= 24;
      state.day++;
      state.quests = GAME.quests.generateDaily();
    }
    if (state.energy < 100) state.energy += delta * 1.5;
    if (state.energy > 100) state.energy = 100;
    if (state.health < 100) state.health += delta * 0.5;
    if (state.health > 100) state.health = 100;
    
    // ===== دمج التحديث البصري + النمو في حلقة واحدة =====
    for (var i = 0; i < state.plots.length; i++) {
      var plot = state.plots[i];
      
      // تحديث العلامات البصرية (مياه، سماد)
      this.updatePlantVisual(plot, delta);
      
      if (plot.state === 'planted') {
        // معدل النمو الأساسي
        var baseGrowthRate = 0.5;
        
        // مكافأة السقي
        if (plot.watered) baseGrowthRate = 1.5;
        
        // مكافأة التسميد
        if (plot.fertilized) baseGrowthRate *= 1.5;
        
        // تأثير الطقس
        var weatherMult = 1.0;
        if (GAME.weather) {
          if (GAME.weather.current === 'rainy') weatherMult = 1.3;
          else if (GAME.weather.current === 'stormy') weatherMult = 0.8;
        }
        
        // معدل نمو حسب نوع المحصول
        var cropRates = { wheat: 1.0, tomato: 1.2, carrot: 0.9, apple: 0.35 };
        var cropMult = cropRates[plot.crop] || 1.0;
        
        // مكافأة المستوى
        var levelMult = 1 + (state.level - 1) * 0.02;
        
        // الحساب النهائي
        var growthRate = baseGrowthRate * weatherMult * cropMult * levelMult;
        plot.growth += delta * growthRate * 0.02;
        
        // تحديث مرحلة النمو (0-4: بذرة، برعم، شتلة، ناضج، جاهز)
        var newStage = Math.min(4, Math.floor(plot.growth * 4));
        if (newStage > plot.growthStage) {
          plot.growthStage = newStage;
          this.updatePlantVisual(plot, delta);
        }
        
        // المحصول جاهز للحصاد
        if (plot.growth >= 1) {
          plot.state = 'ready';
          plot.growth = 1;
          plot.growthStage = 4;
          this.updatePlantVisual(plot, delta);
          // ⭐ أشجار التفاح تبقى في حالة 'ready' حتى يحصدها اللاعب!
        } else if (plot.mesh && plot.crop !== 'apple') {
          // حركة نمو سلسة للمحاصيل العادية
          var s = 0.2 + plot.growth * 0.8;
          plot.mesh.scale.set(s, s, s);
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
    this.updateParticles(delta); // 🎆 تحديث الجسيمات
    this.renderMinimap(); // 🗺️ تحديث الخريطة المصغرة
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

  // Helper: properly dispose a plot's crop/tree mesh
  _disposePlotMesh: function(plot) {
    if (!plot.mesh) return;
    this.scene.remove(plot.mesh);
    if (plot.mesh.geometry) plot.mesh.geometry.dispose();
    if (plot.mesh.material) plot.mesh.material.dispose();
    // If mesh is a Group, dispose children recursively
    if (plot.mesh.isGroup && plot.mesh.children) {
      for (var i = 0; i < plot.mesh.children.length; i++) {
        var child = plot.mesh.children[i];
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
    }
    plot.mesh = null;
  },

  // Helper: properly dispose a plot marker (water or fertilizer)
  _disposePlotMarker: function(plot, key) {
    var marker = plot[key];
    if (!marker) return;
    this.scene.remove(marker);
    if (marker.children) {
      for (var i = 0; i < marker.children.length; i++) {
        var child = marker.children[i];
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
    }
    if (marker.geometry) marker.geometry.dispose();
    if (marker.material) marker.material.dispose();
    plot[key] = null;
  },

  animate: function() {
    var self = this;
    function loop() {
      if (!self.isRunning) return;
      requestAnimationFrame(loop);
      var delta = Math.min(self.clock.getDelta(), 0.05);
      self.update(delta);
      self.renderer.render(self.scene, GAME.camera.camera);
      
      // FPS tracking for auto quality
      self._fpFrames++;
      self._fpTime += delta;
      if (self._fpTime >= 2) { // Check every 2 seconds
        var fps = self._fpFrames / self._fpTime;
        self._fpFrames = 0;
        self._fpTime = 0;
        if (self._autoQuality) {
          if (fps < 20) {
            self._fpLowCounter++;
          } else {
            self._fpLowCounter = Math.max(0, self._fpLowCounter - 1);
          }
          if (self._fpLowCounter >= 2 && self.qualityLevel !== 'low') {
            self.setQuality('low');
            GAME.ui.showNotification('⚡ Lowered graphics for smoother gameplay', 'info');
          } else if (self._fpLowCounter >= 1 && self.qualityLevel === 'high') {
            self.setQuality('medium');
            GAME.ui.showNotification('⚡ Adjusted graphics quality', 'info');
          }
        }
      }
    }
    loop();
  },

  setQuality: function(level) {
    if (level === this.qualityLevel) return;
    this.qualityLevel = level;
    switch (level) {
      case 'low':
        this.renderer.shadowMap.enabled = false;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        this.renderer.toneMapping = THREE.NoToneMapping;
        break;
      case 'medium':
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        break;
      case 'high':
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        break;
    }
    // Re-apply fog/render distance from settings
    var rd = document.getElementById('render-dist');
    var dist = rd ? parseFloat(rd.value) : 8;
    this.scene.fog = new THREE.Fog(0x87CEEB, dist * 3, dist * 6);
  },

  // ===== 🎆 نظام الجسيمات (Particle Effects) =====
  spawnParticles: function(x, y, z, color, count, speed, size, lifetime) {
    if (!this.scene) return;
    count = count || 20;
    speed = speed || 3;
    size = size || 0.15;
    lifetime = lifetime || 1.0;
    var colorObj = new THREE.Color(color);
    var pts = [];
    for (var i = 0; i < count; i++) {
      var geo = new THREE.SphereGeometry(size * (0.5 + Math.random() * 0.5), 4, 4);
      var mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1
      });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      var vx = (Math.random() - 0.5) * speed;
      var vy = Math.random() * speed * 0.8 + 0.5;
      var vz = (Math.random() - 0.5) * speed;
      mesh.userData = {
        vx: vx, vy: vy, vz: vz,
        life: lifetime,
        maxLife: lifetime,
        rotSpeed: (Math.random() - 0.5) * 6
      };
      this.scene.add(mesh);
      pts.push(mesh);
    }
    this.particles = this.particles.concat(pts);
  },

  updateParticles: function(delta) {
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var p = this.particles[i];
      var d = p.userData;
      p.position.x += d.vx * delta;
      p.position.y += d.vy * delta;
      p.position.z += d.vz * delta;
      d.vy -= 2.0 * delta; // جاذبية
      d.life -= delta;
      p.rotation.x += d.rotSpeed * delta;
      p.rotation.y += d.rotSpeed * delta;
      var lifeRatio = Math.max(0, d.life / d.maxLife);
      p.material.opacity = lifeRatio;
      p.scale.setScalar(0.3 + lifeRatio * 0.7);
      if (d.life <= 0) {
        this.scene.remove(p);
        p.geometry.dispose();
        p.material.dispose();
        this.particles.splice(i, 1);
      }
    }
  },

  // ===== 🌟 تأثيرات الأدوات =====
  spawnPlowParticles: function(x, z) {
    this.spawnParticles(x, 0.3, z, 0x8B6914, 15, 2, 0.12, 0.8);
  },
  spawnWaterParticles: function(x, z) {
    this.spawnParticles(x, 0.5, z, 0x4fc3f7, 25, 3, 0.08, 0.6);
  },
  spawnHarvestParticles: function(x, z, cropType) {
    var colors = { wheat: 0xdaa520, tomato: 0xff4444, carrot: 0xff8c00, apple: 0xff0000 };
    this.spawnParticles(x, 0.5, z, colors[cropType] || 0xdaa520, 30, 4, 0.1, 0.9);
  },
  spawnFertilizerParticles: function(x, z) {
    this.spawnParticles(x, 0.3, z, 0x8B4513, 12, 1.5, 0.1, 0.7);
  },

  // ===== 🗺️ الخريطة المصغرة (MiniMap) =====
  renderMinimap: function() {
    var canvas = document.getElementById('minimap-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    var mapScale = 0.9; // world coords to canvas ratio
    var cx = w / 2, cy = h / 2;
    
    // خلفية شبه شفافة
    ctx.fillStyle = 'rgba(0, 20, 0, 0.6)';
    ctx.fillRect(0, 0, w, h);
    
    // شبكة
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    for (var i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 20, 0); ctx.lineTo(i * 20, h);
      ctx.moveTo(0, i * 20); ctx.lineTo(w, i * 20);
      ctx.stroke();
    }
    
    function worldToMap(wx, wz) {
      return { x: cx + wx * mapScale, y: cy - wz * mapScale };
    }
    
    // رسم المباني (كمستطيلات)
    var buildings = [
      { x: -15, z: -15, w: 10, h: 8, c: '#d4a574', label: '🏠' }, // House
      { x: 16, z: -12, w: 11, h: 9, c: '#a83232', label: '🏠' }, // Barn
      { x: 0, z: -22, w: 7, h: 7, c: '#e67e22', label: '🏪' } // Market
    ];
    for (var b = 0; b < buildings.length; b++) {
      var bd = buildings[b];
      var p = worldToMap(bd.x, bd.z);
      var bw = bd.w * mapScale;
      var bh = bd.h * mapScale;
      ctx.fillStyle = bd.c;
      ctx.fillRect(p.x - bw/2, p.y - bh/2, bw, bh);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bd.label, p.x, p.y + 2.5);
    }
    
    // رسم قطع الأراضي
    if (this.state && this.state.plots) {
      for (var i = 0; i < this.state.plots.length; i++) {
        var pl = this.state.plots[i];
        var pp = worldToMap(pl.x, pl.z);
        var s = 3.5;
        if (pl.state === 'empty') ctx.fillStyle = 'rgba(60,40,20,0.4)';
        else if (pl.state === 'plowed') ctx.fillStyle = 'rgba(100,60,20,0.5)';
        else if (pl.state === 'planted') ctx.fillStyle = 'rgba(34, 139, 34, 0.6)';
        else if (pl.state === 'ready') {
          ctx.fillStyle = pl.crop === 'apple' ? 'rgba(139, 90, 43, 0.7)' : 'rgba(218, 165, 32, 0.8)';
          // وميض للمحاصيل الجاهزة
          var pulse = Math.sin(Date.now() * 0.004) * 0.3 + 0.7;
          ctx.globalAlpha = pulse;
        }
        ctx.fillRect(pp.x - s, pp.y - s, s * 2, s * 2);
        ctx.globalAlpha = 1.0;
      }
    }
    
    // رسم حدود العالم
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    var tl = worldToMap(-58, -58);
    var br = worldToMap(58, 58);
    ctx.strokeRect(tl.x, br.y, br.x - tl.x, tl.y - br.y);
    
    // رسم اتجاه الشمال
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', cx, 10);
    ctx.beginPath();
    ctx.moveTo(cx, 12); ctx.lineTo(cx, 5); ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.stroke();
    
    // رسم اللاعب
    if (GAME.player && GAME.player.mesh) {
      var pPos = GAME.player.mesh.position;
      var pp = worldToMap(pPos.x, pPos.z);
      // نقطة اللاعب
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#4fc3f7';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // اتجاه اللاعب
      var angle = GAME.player.mesh.rotation.y;
      ctx.beginPath();
      ctx.moveTo(pp.x + Math.sin(angle) * 6, pp.y - Math.cos(angle) * 6);
      ctx.lineTo(pp.x, pp.y);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
});

GAME.game.init();
