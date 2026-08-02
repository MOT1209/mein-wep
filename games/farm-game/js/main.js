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
    // يُلغى تلقائياً عند نجاح التهيئة حتى لا يظهر التحذير في الحالة الطبيعية
    this._fallbackTimer = setTimeout(function() {
      GAME.ui.hideLoading();
      GAME.ui.showMenu();
      console.warn('[FarmGame] ⏰ Fallback timeout triggered — menu forced at 3s');
    }, 3000);

    // ⚠️ Wrap heavy 3D init in try-catch لالتقاط أخطاء WebGL/THREE
    try {
      // 🔍 تحقق من دعم WebGL قبل أي شيء — رسالة واضحة بدل خطأ غامض في الـ console
      var _testCv = document.createElement('canvas');
      var _glOk = !!(window.WebGLRenderingContext &&
        (_testCv.getContext('webgl') || _testCv.getContext('experimental-webgl')));
      if (!_glOk) throw new Error('WebGL not supported on this device/browser');

      // 📱 كشف الأجهزة المحمولة/الضعيفة لضبط الجودة الافتراضية تلقائياً
      var isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      var lowEnd = isMobile || (navigator.hardwareConcurrency || 4) <= 4;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87CEEB);
      this.scene.fog = new THREE.Fog(0x87CEEB, 30, 60);

      var renderer = new THREE.WebGLRenderer({
        antialias: !lowEnd,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowEnd ? 1.5 : 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      document.body.prepend(renderer.domElement);
      this.renderer = renderer;

      // 🛡️ معالجة فقدان/استعادة سياق WebGL (يمنع تجمّد اللعبة عند فقدان الـ GPU)
      renderer.domElement.addEventListener('webglcontextlost', function(e) {
        e.preventDefault();
        self.isRunning = false;
        console.warn('[FarmGame] ⚠️ WebGL context lost — paused rendering');
      }, false);
      renderer.domElement.addEventListener('webglcontextrestored', function() {
        console.warn('[FarmGame] ✅ WebGL context restored — resuming');
        if (!self.isRunning) { self.isRunning = true; self.animate(); }
      }, false);

      // أنظمة أساسية (فشلها فادح — يلتقطه catch الخارجي)
      GAME.camera.init();
      GAME.world.init(this.scene);
      GAME.player.init(this.scene);
      // نظام الزراعة الجديد
      GAME.TimeSystem.init();
      GAME.FarmingSystem.init(this.scene);
      // إنشاء قطع الأراضي
      GAME.game.initPlots();
      // نظام إدارة الذاكرة (Object Pooling + Safe Disposal)
      // لا يحتاج init — يُحمّل تلقائياً عند تحميل الملف
      // أنظمة ثانوية معزولة — فشل أيها لا يمنع تشغيل اللعبة
      this._safe('animals.init', function() { GAME.animals.init(self.scene); });
      this._safe('weather.init', function() { GAME.weather.init(self.scene); });
      this._safe('audio.init', function() { GAME.audio.init(); });
      this._safe('AIAgent.init', function() { GAME.AIAgent.init(self.scene); });
      this._safe('achievements.init', function() { GAME.achievements.init(); });
      // === الأنظمة الجديدة ===
      this._safe('AnimalsSystem.init', function() { GAME.AnimalsSystem.init(self.scene); });
      this._safe('BuildingsSystem.init', function() { GAME.BuildingsSystem.init(self.scene); });
      this._safe('EconomySystem.init', function() { GAME.EconomySystem.init(); });
      this._safe('NPCsSystem.init', function() { GAME.NPCsSystem.init(self.scene, GAME.TimeSystem); });
      this._safe('WorldExpansion.init', function() { GAME.WorldExpansion.init(self); GAME.WorldExpansionInstance = GAME.WorldExpansion; });
      this._safe('CraftingSystem.init', function() { GAME.CraftingSystem.init(self); });
      this._safe('CookingSystem.init', function() { GAME.CookingSystem.init(self); });
      // نظام الحفظ المحسّن
      this._safe('EnhancedSaveSystem.init', function() { GAME.EnhancedSaveSystem.init(self); });
      // تحسينات الواجهة
      this._safe('UIEnhancements.init', function() { GAME.UIEnhancements.init(); });
      // نظام التعليم التفاعلي
      this._safe('TutorialSystem.init', function() { GAME.TutorialSystem.init(self); });
      // === الأنظمة المتبقية ===
      this._safe('DatabaseService.init', function() { GAME.DatabaseService.init(); });
      this._safe('TextureStreaming.init', function() { GAME.TextureStreaming.init(self); });
      // ObjectPool/DisposeManager: أدوات تُستدعى عند الحاجة فقط — لا init/update دوري (راجع تعليق أعلاه)
      this._safe('CombatSystem.init', function() { GAME.CombatSystem.init(self); });
      this._safe('FishingSystem.init', function() { GAME.FishingSystem.init(self); });
      this._safe('SeasonalEvents.init', function() { GAME.SeasonalEvents.init(self); });
      this._safe('QuestSystem.init', function() { GAME.QuestSystem.init(self); });
      this._safe('AchievementSystem.init', function() { GAME.AchievementSystem.init(self); });
      this._safe('LeaderboardSystem.init', function() { GAME.LeaderboardSystem.init(self); });
      this._safe('NotificationSystem.init', function() { GAME.NotificationSystem.init(self); });
      this._safe('AudioManager.init', function() { GAME.AudioManager.init(self); });
      this._safe('WeatherSystem.init', function() { GAME.WeatherSystem.init(self); });
      this._safe('DayNightCycle.init', function() { GAME.DayNightCycle.init(self); });
      this._safe('UpgradesSystem.init', function() { GAME.UpgradesSystem.init(self); });

      // الحفظ التلقائي عبر EnhancedSaveSystem (يبدأ تلقائياً في init)
      // الاحتفاظ بالحالة القديمة للتوافق
      this._autoSave = null;  // EnhancedSaveSystem يدير الحفظ التلقائي

      var muteBtn = document.getElementById('mute-btn');
      if (muteBtn && GAME.audio && GAME.audio.muted) muteBtn.textContent = '🔇';

      // 📱 خفض الجودة افتراضياً على الأجهزة المحمولة/الضعيفة (auto-quality سيضبط أكثر عند الحاجة)
      if (lowEnd) this.setQuality('medium');

      setTimeout(function() {
        GAME.ui.hideLoading();
        GAME.ui.showMenu();
      }, 800);

      this.clock = new THREE.Clock();
      this.isRunning = true;
      this._fpStart = performance.now();

      // ✅ التهيئة نجحت — ألغِ شبكة الأمان حتى لا يظهر تحذير الـ fallback في كل تحميل
      if (this._fallbackTimer) { clearTimeout(this._fallbackTimer); this._fallbackTimer = null; }

      this.animate();
    } catch (err) {
      console.error('[FarmGame] ❌ Init error:', err.message, err.stack);
      // التهيئة فشلت فعلاً — ألغِ مؤقت الـ fallback ودع معالج الخطأ يعرض القائمة
      if (this._fallbackTimer) { clearTimeout(this._fallbackTimer); this._fallbackTimer = null; }
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
      day: 1, time: 8, // كانت 6 (فجر معتم) — الآن تبدأ اللعبة في صباح مضيء بالكامل
      // FarmingSystem-compatible inventory (seeds + harvest + products)
      inventory: {
        seeds: { wheat: 5, tomato: 3, carrot: 3, apple: 1 },
        harvest: { wheat: 0, tomato: 0, carrot: 0, apple: 0 },
        fertilizer: { basic: 2, quality: 0, premium: 0 },
        animal: { egg: 0, milk: 0, truffle: 0, duck_egg: 0, wool: 0 },
        crafted: { bread: 0, flour: 0, cheese: 0, butter: 0, ice_cream: 0, cake: 0, ketchup: 0, juice: 0, mayonnaise: 0 }},
      crafted: { bread: 0, ketchup: 0, juice: 0 },  // legacy compat for sellItem
      selectedTool: 0,
      plots: [],
      timeScale: 5, // كان 60 (يوم كامل كل 40 ثانية فقط) — الآن يوم واحد ≈ 8 دقائق حقيقية
      xp: 0,
      level: 1,
      quests: [],
      achievements: [],
      stats: {
        totalPlanted: 0, totalHarvested: 0, totalEarned: 0,
        totalCrafted: 0, totalWatered: 0, totalFertilized: 0,
        totalSlept: 0, totalAnimals: 0, totalApples: 0
      }
    };
    this.initPlots();
    GAME.quests.generateDaily();
    this.state.quests = GAME.quests.generateDaily();
    this.selectTool(0);
    this._atMenu = false;
    GAME.ui.hideMenu();
    GAME.ui.showNotification('🌾 Welcome to your new farm!', 'success');
    GAME.audio.play('chime');
    // بدء التعليم إذا لم يكتمل بعد
    if (GAME.TutorialSystem && !GAME.TutorialSystem.isComplete) {
      var self = this;
      setTimeout(function() { GAME.TutorialSystem.start(); }, 1500);
    }
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
      if (GAME.TutorialSystem) GAME.TutorialSystem.onAction('shop');
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
        if (fed) {
          GAME.audio.play('chime');
          if (GAME.TutorialSystem) GAME.TutorialSystem.onAction('feed');
        }
      }
      return;
    }
    if (GAME.animals) {
      var collected = GAME.animals.collect(p.x, p.z);
      if (collected) { GAME.audio.play('coin'); return; }
    }
    GAME.ui.showInteractionHint(null);
  },

  // --- Unified action dispatcher --- Delegates directly to new systems ---
  doAction: function() {
    var p = GAME.player.mesh.position;
    var tool = this.state.selectedTool;

    // --- 1. Animal interactions (feed / collect) via AnimalsSystem ---
    var distToTrough = Math.sqrt((p.x - 16) * (p.x - 16) + (p.z + 12) * (p.z + 12));
    if (distToTrough < 4 && GAME.AnimalsSystem) {
      var closestAnimal = GAME.AnimalsSystem.findClosestAnimal(p.x, p.z, null, 3);
      if (closestAnimal) {
        if (!closestAnimal.isFedToday && GAME.AnimalsSystem.feedAnimal(closestAnimal.id)) {
          GAME.audio.play('chime');
          if (GAME.TutorialSystem) GAME.TutorialSystem.onAction('feed');
          return;
        }
        if (closestAnimal.productsReady > 0 && GAME.AnimalsSystem.collectProduct(closestAnimal.id)) {
          GAME.audio.play('coin');
          return;
        }
      }
    }

    // --- 2. Tool-based farming actions (via FarmingSystem) ---
    var toolMap = [
      { action: 'plow',      state: 'empty',   sound: 'step' },
      { action: 'water',     state: 'planted', sound: 'water' },
      { action: 'plant',     state: 'plowed',  sound: 'step', crop: 'wheat' },
      { action: 'plant',     state: 'plowed',  sound: 'step', crop: 'tomato' },
      { action: 'plant',     state: 'plowed',  sound: 'step', crop: 'carrot' },
      { action: 'harvest',   state: 'ready',   sound: 'harvest' },
      { action: 'plant',     state: 'plowed',  sound: 'step', crop: 'apple' },
      { action: 'fertilize', state: 'planted', sound: 'step' }
    ];
    var mapping = toolMap[tool];
    if (!mapping) return;

    // Fertilize also accepts 'ready' plots
    var plotIdx = GAME.FarmingSystem.findClosestPlot(p.x, p.z, mapping.state, 3);
    if (plotIdx === null && mapping.action === 'fertilize') {
      plotIdx = GAME.FarmingSystem.findClosestPlot(p.x, p.z, 'ready', 3);
    }
    if (plotIdx === null) {
      var hints = {
        plow: 'No empty plots nearby', water: 'No planted crops nearby',
        plant: 'No plowed plots nearby', harvest: 'No crops ready to harvest',
        fertilize: 'No plants nearby to fertilize'
      };
      GAME.ui.showNotification('❌ ' + (hints[mapping.action] || 'Nothing to do'), 'error');
      return;
    }

    var success = false;
    switch (mapping.action) {
      case 'plow':      success = GAME.FarmingSystem.plow(plotIdx); break;
      case 'water':     success = GAME.FarmingSystem.water(plotIdx); break;
      case 'plant':     success = GAME.FarmingSystem.plant(plotIdx, mapping.crop); break;
      case 'harvest':   success = GAME.FarmingSystem.harvest(plotIdx); break;
      case 'fertilize': success = GAME.FarmingSystem.fertilize(plotIdx, 'basic'); break;
    }
    if (success) {
      GAME.audio.play(mapping.sound);
      if (GAME.TutorialSystem) GAME.TutorialSystem.onAction(mapping.action);
    }
  },

  // --- Thin delegates to new systems (no fallback logic) ---
  buySeed: function(type) {
    if (GAME.EconomySystem) GAME.EconomySystem.buyItem(type, 1);
  },

  sellItem: function(type) {
    if (GAME.EconomySystem) GAME.EconomySystem.sellItem(type, 1);
  },

  buyFertilizer: function() {
    if (GAME.EconomySystem) GAME.EconomySystem.buyItem('basic_fert', 1);
  },

  craftItem: function(recipeId) {
    if (GAME.CraftingSystem && GAME.CraftingSystem.craft) {
      GAME.CraftingSystem.craft(recipeId);
    } else if (GAME.EconomySystem && GAME.EconomySystem.craft) {
      GAME.EconomySystem.craft(recipeId);
    }
  },

  sleep: function() {
    this.state.health = Math.min(100, this.state.health + 30);
    this.state.energy = 100;
    this.state.day++;
    this.state.time = 6;
    this.state.quests = GAME.quests.generateDaily();
    this.addXP(5);
    this.state.stats.totalSlept++;
    GAME.achievements.checkAll();
    GAME.ui.showNotification('🌙 Slept! Day ' + this.state.day + ' ☀️ +5 XP', 'success');
  },

  // 🛡️ منفّذ آمن: يعزل أخطاء كل نظام حتى لا يُسقط خطأٌ واحد اللعبة كلها (ويسجّل مرة واحدة فقط)
  _safe: function(label, fn) {
    try { fn(); }
    catch (e) {
      if (!this._errored) this._errored = {};
      if (!this._errored[label]) {
        this._errored[label] = true;
        console.error('[FarmGame] ⚠️ ' + label + ' failed (suppressed further):', e.message);
      }
    }
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
    
    // ===== تحديث الأنظمة الجديدة (FarmingSystem يدير النمو والبصريات) =====
    this._safe('TimeSystem', function() { GAME.TimeSystem.update(delta); });
    this._safe('FarmingSystem', function() { GAME.FarmingSystem.update(delta); });
    // === تحديث الأنظمة الجديدة ===
    this._safe('AnimalsSystem', function() { GAME.AnimalsSystem.update(delta); });
    this._safe('BuildingsSystem', function() { GAME.BuildingsSystem.update(delta); });
    if (GAME.WorldExpansionInstance) this._safe('WorldExpansion', function() { GAME.WorldExpansionInstance.update(delta); });
    this._safe('NPCsSystem', function() { GAME.NPCsSystem.update(delta); });
    this._safe('CraftingSystem', function() { GAME.CraftingSystem.update(delta); });
    this._safe('CookingSystem', function() { GAME.CookingSystem.update(delta); });
    // تحسينات الواجهة
    this._safe('UIEnhancements', function() { GAME.UIEnhancements.update(delta); });
    // === تحديث الأنظمة المتبقية ===
    this._safe('CombatSystem', function() { GAME.CombatSystem.update(delta); });
    this._safe('FishingSystem', function() { GAME.FishingSystem.update(delta); });
    this._safe('SeasonalEvents', function() { GAME.SeasonalEvents.update(delta); });
    this._safe('QuestSystem', function() { GAME.QuestSystem.update(delta); });
    // AchievementSystem/LeaderboardSystem/NotificationSystem/UpgradesSystem: أنظمة تعتمد على أحداث صريحة
    // (unlock/addScore/show/upgrade) وليس تحديثاً دورياً — لا تملك update()
    this._safe('AudioManager', function() { GAME.AudioManager.update(delta); });
    this._safe('WeatherSystem', function() { GAME.WeatherSystem.update(delta); });
    this._safe('DayNightCycle', function() { GAME.DayNightCycle.update(delta); });
    // ObjectPool/DisposeManager: أدوات تُستدعى عند الحاجة فقط — لا update دوري
    
    // 🛡️ كل نظام معزول — خطأٌ في أحدها لا يوقف البقية ولا يطرد اللاعب للقائمة
    var self = this;
    this._safe('player', function() {
      GAME.player.update(delta);
      if (GAME.player.isMoving) {
        self._stepTimer = (self._stepTimer || 0) + delta;
        if (self._stepTimer > 0.4) { GAME.audio.play('step'); self._stepTimer = 0; }
      }
    });
    if (GAME.animals) this._safe('animals', function() { GAME.animals.update(delta); });
    if (GAME.weather) this._safe('weather', function() { GAME.weather.update(delta); });
    if (GAME.world && GAME.world.updateLighting) this._safe('world.lighting', function() { GAME.world.updateLighting(state.time); });
    if (GAME.world && GAME.world.updateWind) this._safe('world.wind', function() { GAME.world.updateWind(delta); });
    if (GAME.AIAgent) this._safe('AIAgent', function() { GAME.AIAgent.update(delta); });
    this._safe('particles', function() { self.updateParticles(delta); }); // 🎆
    this._safe('minimap', function() { self.renderMinimap(); }); // 🗺️
    this._safe('hints', function() { self.updateInteractionHints(); });
    this._safe('hud', function() { GAME.ui.updateHUD(state); });
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
    if (GAME.DisposeManager) {
      GAME.DisposeManager.disposeMesh(plot.mesh);
    } else {
      this.scene.remove(plot.mesh);
      if (plot.mesh.geometry) plot.mesh.geometry.dispose();
      if (plot.mesh.material) plot.mesh.material.dispose();
    }
    plot.mesh = null;
  },

  // Helper: properly dispose a plot marker (water or fertilizer)
  _disposePlotMarker: function(plot, key) {
    var marker = plot[key];
    if (!marker) return;
    if (GAME.DisposeManager) {
      GAME.DisposeManager.disposeMesh(marker);
    } else {
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
    }
    plot[key] = null;
  },

  animate: function() {
    var self = this;
    function loop() {
      if (!self.isRunning) return;
      requestAnimationFrame(loop);
      var delta = Math.min(self.clock.getDelta(), 0.05);
      var now = performance.now();

      // ⚡ خفض معدل الرسم في القائمة/الإيقاف لتوفير المعالج (المشهد ثابت هناك)
      var playing = !!self.state && !self.isPaused && !self.isShopOpen && !self._atMenu;
      if (!playing) {
        // أعد ضبط عدّاد الـ FPS حتى لا يُساء حسابه عند العودة للعب
        self._fpFrames = 0;
        self._fpStart = now;
        self._idleFrame = (self._idleFrame || 0) + 1;
        if (self._idleFrame % 2 !== 0) return; // ارسم إطاراً من كل اثنين فقط
      }

      self.update(delta);
      self.renderer.render(self.scene, GAME.camera.camera);

      // 📊 قياس FPS الحقيقي (بالوقت الفعلي، لا بـ delta المقيّد) لضبط الجودة بدقة
      self._fpFrames++;
      if (!self._fpStart) self._fpStart = now;
      var elapsed = now - self._fpStart;
      if (playing && elapsed >= 1000) { // افحص كل ثانية
        var fps = self._fpFrames * 1000 / elapsed;
        self._fpFrames = 0;
        self._fpStart = now;
        if (self._autoQuality) {
          if (fps < 25) {
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
    // ⚡ ضبط دقة خريطة الظل حسب الجودة (أثقل عنصر على الأجهزة الضعيفة)
    if (GAME.world && GAME.world.sunLight) {
      var sz = level === 'high' ? 2048 : (level === 'medium' ? 1024 : 512);
      var sh = GAME.world.sunLight.shadow;
      if (sh.mapSize.width !== sz) {
        sh.mapSize.set(sz, sz);
        if (sh.map) { sh.map.dispose(); sh.map = null; } // إعادة توليد الخريطة بالحجم الجديد
      }
    }
    // Re-apply fog/render distance — preserve dynamic color, only update near/far
    var rd = document.getElementById('render-dist');
    var dist = rd ? parseFloat(rd.value) : 8;
    if (this.scene.fog) {
      this.scene.fog.near = dist * 3;
      this.scene.fog.far  = dist * 6;
    } else {
      this.scene.fog = new THREE.Fog(0x87CEEB, dist * 3, dist * 6);
    }
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

// ─── Cleanup on page unload (prevent memory leaks) ───────────
window.addEventListener('beforeunload', function() {
  if (GAME.DisposeManager) {
    GAME.DisposeManager.disposeAll();
  }
});
