/**
 * EnhancedSaveSystem.js - نظام الحفظ/التحميل المحسّن
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - حفظ تلقائي كل 60 ثانية (قابل للتعديل)
 * - حفظ يدوي عند إغلاق الصفحة (beforeunload)
 * - حفظ احتياطي متعدد (آخر 3 نسخ)
 * - تشفير بسيط للبيانات (base64 + XOR)
 * - فحص سلامة البيانات (validation)
 * - استعادة تلقائية عند تلف البيانات
 * - تجميع البيانات من جميع الأنظمة
 * - دعم الترقية (version migration)
 */

var GAME = GAME || {};

// ============================================================
// 🔐 EnhancedSaveSystem
// ============================================================
GAME.EnhancedSaveSystem = {

  // --- الإعدادات ---
  SAVE_KEY: 'farmGameSave',
  BACKUP_KEY_PREFIX: 'farmGameBackup_',
  MAX_BACKUPS: 3,
  AUTO_SAVE_INTERVAL: 60000,  // 60 ثانية
  SAVE_VERSION: '3.0.0',
  ENCRYPTION_KEY: 'FarmGame3D_Enhanced_2024', // مفتاح تشفير بسيط
  USE_CLOUD_SAVE: true, // تفعيل الحفظ السحابي
  CLOUD_SAVE_SLOT: 1, // رقم_SLOT الافتراضي

  // --- الحالة ---
  autoSaveTimer: null,
  game: null,
  _lastSaveTime: 0,
  _saveCount: 0,
  _initialized: false,

  // ============================================================
  // 🚀 التهيئة
  // ============================================================
  init: function(game) {
    this.game = game;
    this._initialized = true;
    this._lastSaveTime = Date.now();
    this._saveCount = 0;

    console.log('[EnhancedSaveSystem] 🚀 Initialized');
    console.log('[EnhancedSaveSystem] ⏱️ Auto-save interval: ' + (this.AUTO_SAVE_INTERVAL / 1000) + 's');

    // بدء الحفظ التلقائي
    this.startAutoSave();

    // حفظ عند إغلاق الصفحة
    this.setupBeforeUnload();

    // محاولة تحميل بيانات محفوظة سابقاً
    this.tryRestoreLastSession();
  },

  // ============================================================
  // 💾 الحفظ الرئيسي (يدعم السحابة + المحلي)
  // ============================================================
  save: async function() {
    if (!this.game) {
      console.warn('[EnhancedSaveSystem] ⚠️ No game reference — save aborted');
      return false;
    }

    try {
      // 1. تجميع البيانات من جميع الأنظمة
      var saveData = this.createSaveData();

      // 2. حفظ نسخة احتياطية قبل الكتابة
      this.createBackup();

      // 3. حفظ سحابي إذا كان متاحاً
      if (this.USE_CLOUD_SAVE && GAME.DatabaseService && GAME.DatabaseService.isConnected) {
        var cloudResult = await GAME.DatabaseService.saveGame(this.CLOUD_SAVE_SLOT, saveData);
        if (cloudResult.success) {
          console.log('[EnhancedSaveSystem] ☁️ Saved to cloud (slot ' + this.CLOUD_SAVE_SLOT + ')');
        }
      }

      // 4. حفظ محلي دائماً كنسخة احتياطية
      var serialized = JSON.stringify(saveData);
      var encrypted = this.encrypt(serialized);
      localStorage.setItem(this.SAVE_KEY, encrypted);

      // 5. تحديث الإحصائيات
      this._lastSaveTime = Date.now();
      this._saveCount++;

      console.log('[EnhancedSaveSystem] 💾 Game saved successfully (save #' + this._saveCount + ')');
      return true;

    } catch (err) {
      console.error('[EnhancedSaveSystem] ❌ Save failed:', err.message);
      return false;
    }
  },

  // ============================================================
  // 📂 التحميل الرئيسي (يدعم السحابة + المحلي)
  // ============================================================
  load: async function() {
    // محاولة التحميل من السحابة أولاً
    if (this.USE_CLOUD_SAVE && GAME.DatabaseService && GAME.DatabaseService.isConnected && GAME.DatabaseService.user) {
      try {
        var cloudResult = await GAME.DatabaseService.loadGame(this.CLOUD_SAVE_SLOT);
        if (cloudResult.data) {
          console.log('[EnhancedSaveSystem] ☁️ Loaded from cloud (slot ' + this.CLOUD_SAVE_SLOT + ')');
          
          // فحص سلامة البيانات
          if (!this.validateSaveData(cloudResult.data)) {
            console.warn('[EnhancedSaveSystem] ⚠️ Cloud save validation failed — trying local');
          } else {
            return cloudResult.data;
          }
        }
      } catch (e) {
        console.warn('[EnhancedSaveSystem] ⚠️ Cloud load failed:', e.message);
      }
    }
    
    // التحميل من التخزين المحلي
    try {
      var encrypted = localStorage.getItem(this.SAVE_KEY);
      if (!encrypted) {
        console.log('[EnhancedSaveSystem] 📂 No save data found');
        return null;
      }

      // فك التشفير
      var serialized = this.decrypt(encrypted);
      var data = JSON.parse(serialized);

      // فحص سلامة البيانات
      if (!this.validateSaveData(data)) {
        console.warn('[EnhancedSaveSystem] ⚠️ Save data validation failed — attempting restore');
        return this.attemptRestore();
      }

      console.log('[EnhancedSaveSystem] 📂 Save data loaded (version: ' + (data.version || 'unknown') + ')');
      return data;

    } catch (err) {
      console.error('[EnhancedSaveSystem] ❌ Load failed:', err.message);
      return this.attemptRestore();
    }
  },

  // ============================================================
  // 📦 إنشاء بيانات الحفظ (تجميع من جميع الأنظمة)
  // ============================================================
  createSaveData: function() {
    var game = this.game;
    var data = {
      version: this.SAVE_VERSION,
      timestamp: Date.now(),
      saveCount: this._saveCount,

      // === بيانات اللاعب الأساسية ===
      player: {
        health: game.state ? game.state.health : 100,
        energy: game.state ? game.state.energy : 100,
        money: game.state ? game.state.money : 200,
        xp: game.state ? game.state.xp : 0,
        level: game.state ? game.state.level : 1,
        day: game.state ? game.state.day : 1,
        time: game.state ? game.state.time : 6,
        selectedTool: game.state ? game.state.selectedTool : 0,
        timeScale: game.state ? game.state.timeScale : 60,
        position: this._getPlayerPosition()
      },

      // === المخزون ===
      inventory: game.state ? JSON.parse(JSON.stringify(game.state.inventory)) : {},

      // === الإحصائيات ===
      stats: game.state ? JSON.parse(JSON.stringify(game.state.stats || {})) : {},

      // === الأنظمة ===
      farming: this._collectFarmingData(),
      animals: this._collectAnimalsData(),
      buildings: this._collectBuildingsData(),
      economy: this._collectEconomyData(),
      npcs: this._collectNPCsData(),
      world: this._collectWorldData(),
      quests: game.state ? JSON.parse(JSON.stringify(game.state.quests || [])) : [],

      // === نظام الترقيات ===
      upgrades: this._collectUpgradesData(),

      // === نظام الحرف ===
      crafting: this._collectCraftingData()
    };

    return data;
  },

  // ============================================================
  // 📊 جمع البيانات من كل نظام
  // ============================================================

  _getPlayerPosition: function() {
    try {
      if (GAME.player && GAME.player.mesh && GAME.player.mesh.position) {
        var pos = GAME.player.mesh.position;
        return { x: pos.x, y: pos.y, z: pos.z };
      }
    } catch (e) {}
    return { x: 0, y: 0, z: 15 };
  },

  _collectFarmingData: function() {
    try {
      if (GAME.FarmingSystem && GAME.FarmingSystem.plots) {
        return {
          plots: GAME.FarmingSystem.plots.map(function(plot) {
            return {
              index: plot.index,
              state: plot.state,
              cropType: plot.cropType || null,
              growthProgress: plot.growthProgress || 0,
              quality: plot.quality || 'base',
              watered: plot.watered || false,
              fertilized: plot.fertilized || null,
              wateredToday: plot.wateredToday || false,
              dayPlanted: plot.dayPlanted || 0,
              x: plot.x,
              z: plot.z
            };
          }),
          totalPlanted: GAME.FarmingSystem.totalPlanted || 0,
          totalHarvested: GAME.FarmingSystem.totalHarvested || 0
        };
      }
    } catch (e) {
      console.warn('[EnhancedSaveSystem] Farming data collection failed:', e.message);
    }
    return { plots: [], totalPlanted: 0, totalHarvested: 0 };
  },

  _collectAnimalsData: function() {
    try {
      if (GAME.AnimalsSystem && GAME.AnimalsSystem.animals) {
        return {
          animals: GAME.AnimalsSystem.animals.map(function(animal) {
            return {
              id: animal.id,
              type: animal.type,
              name: animal.name || animal.type,
              health: animal.health || 100,
              happiness: animal.happiness || 100,
              isFedToday: animal.isFedToday || false,
              productsReady: animal.productsReady || 0,
              totalProducts: animal.totalProducts || 0,
              dayBought: animal.dayBought || 0,
              age: animal.age || 0,
              breedingCooldown: animal.breedingCooldown || 0,
              building: animal.building || null,
              position: animal.position ? { x: animal.position.x, y: animal.position.y, z: animal.position.z } : null
            };
          }),
          totalAnimalsBought: GAME.AnimalsSystem.totalAnimalsBought || 0
        };
      }
    } catch (e) {
      console.warn('[EnhancedSaveSystem] Animals data collection failed:', e.message);
    }
    return { animals: [], totalAnimalsBought: 0 };
  },

  _collectBuildingsData: function() {
    try {
      if (GAME.BuildingsSystem && GAME.BuildingsSystem.buildings) {
        var buildings = {};
        for (var key in GAME.BuildingsSystem.buildings) {
          var b = GAME.BuildingsSystem.buildings[key];
          buildings[key] = {
            level: b.level || 0,
            isBuilt: b.isBuilt || false,
            buildProgress: b.buildProgress || 0,
            dayBuilt: b.dayBuilt || 0,
            upgradeProgress: b.upgradeProgress || 0
          };
        }
        return { buildings: buildings };
      }
    } catch (e) {
      console.warn('[EnhancedSaveSystem] Buildings data collection failed:', e.message);
    }
    return { buildings: {} };
  },

  _collectEconomyData: function() {
    try {
      if (GAME.EconomySystem) {
        return {
          stats: GAME.EconomySystem.stats ? {
            totalEarned: GAME.EconomySystem.stats.totalEarned || 0,
            totalExpenses: GAME.EconomySystem.stats.totalExpenses || 0,
            totalSold: GAME.EconomySystem.stats.totalSold || 0,
            totalBought: GAME.EconomySystem.stats.totalBought || 0
          } : {},
          marketPrices: GAME.EconomySystem.marketPrices ? JSON.parse(JSON.stringify(GAME.EconomySystem.marketPrices)) : {},
          dailyPriceSeed: GAME.EconomySystem.dailyPriceSeed || 0
        };
      }
    } catch (e) {
      console.warn('[EnhancedSaveSystem] Economy data collection failed:', e.message);
    }
    return { stats: {}, marketPrices: {}, dailyPriceSeed: 0 };
  },

  _collectNPCsData: function() {
    try {
      if (GAME.NPCsSystem && GAME.NPCsSystem.save) {
        return GAME.NPCsSystem.save();
      }
    } catch (e) {
      console.warn('[EnhancedSaveSystem] NPCs data collection failed:', e.message);
    }
    return null;
  },

  _collectWorldData: function() {
    try {
      if (GAME.WorldExpansionInstance) {
        var w = GAME.WorldExpansionInstance;
        return {
          currentZone: w.currentZone || 'farm',
          unlockedZones: w.unlockedZones ? JSON.parse(JSON.stringify(w.unlockedZones)) : { farm: true },
          discoveredPOIs: w.discoveredPOIs ? JSON.parse(JSON.stringify(w.discoveredPOIs)) : {},
          totalResourcesGathered: w.totalResourcesGathered ? JSON.parse(JSON.stringify(w.totalResourcesGathered)) : {}
        };
      }
    } catch (e) {
      console.warn('[EnhancedSaveSystem] World data collection failed:', e.message);
    }
    return { currentZone: 'farm', unlockedZones: { farm: true }, discoveredPOIs: {}, totalResourcesGathered: {} };
  },

  _collectUpgradesData: function() {
    try {
      if (GAME.UpgradesSystem && GAME.UpgradesSystem.upgrades) {
        var upgrades = {};
        for (var key in GAME.UpgradesSystem.upgrades) {
          upgrades[key] = {
            purchased: GAME.UpgradesSystem.upgrades[key].purchased || false,
            level: GAME.UpgradesSystem.upgrades[key].level || 0
          };
        }
        return { upgrades: upgrades };
      }
    } catch (e) {
      console.warn('[EnhancedSaveSystem] Upgrades data collection failed:', e.message);
    }
    return { upgrades: {} };
  },

  _collectCraftingData: function() {
    try {
      if (GAME.CraftingSystem && GAME.CraftingSystem.craftingQueue) {
        return {
          queue: GAME.CraftingSystem.craftingQueue.map(function(item) {
            return {
              recipe: item.recipe,
              startTime: item.startTime,
              quantity: item.quantity || 1
            };
          }),
          craftedCounts: GAME.CraftingSystem.craftedCounts ? JSON.parse(JSON.stringify(GAME.CraftingSystem.craftedCounts)) : {}
        };
      }
    } catch (e) {
      console.warn('[EnhancedSaveSystem] Crafting data collection failed:', e.message);
    }
    return { queue: [], craftedCounts: {} };
  },

  // ============================================================
  // 🔍 فحص سلامة البيانات
  // ============================================================
  validateSaveData: function(data) {
    if (!data || typeof data !== 'object') {
      console.warn('[EnhancedSaveSystem] ❌ Validation: data is not an object');
      return false;
    }

    // فحص الإصدار
    if (!data.version) {
      console.warn('[EnhancedSaveSystem] ❌ Validation: missing version');
      return false;
    }

    // فحص بيانات اللاعب الأساسية
    if (!data.player || typeof data.player !== 'object') {
      console.warn('[EnhancedSaveSystem] ❌ Validation: missing player data');
      return false;
    }

    // فحص القيم الأساسية
    if (typeof data.player.health !== 'number' || typeof data.player.money !== 'number') {
      console.warn('[EnhancedSaveSystem] ❌ Validation: invalid player stats');
      return false;
    }

    // فحص المخزون
    if (!data.inventory || typeof data.inventory !== 'object') {
      console.warn('[EnhancedSaveSystem] ❌ Validation: missing inventory');
      return false;
    }

    // فحص الحدود المنطقية
    if (data.player.health < 0 || data.player.health > 100) {
      console.warn('[EnhancedSaveSystem] ⚠️ Validation: health out of range, clamping');
      data.player.health = Math.max(0, Math.min(100, data.player.health));
    }
    if (data.player.energy < 0 || data.player.energy > 100) {
      console.warn('[EnhancedSaveSystem] ⚠️ Validation: energy out of range, clamping');
      data.player.energy = Math.max(0, Math.min(100, data.player.energy));
    }
    if (data.player.money < 0) {
      console.warn('[EnhancedSaveSystem] ⚠️ Validation: negative money, clamping');
      data.player.money = 0;
    }
    if (data.player.day < 1) {
      data.player.day = 1;
    }
    if (data.player.time < 0 || data.player.time >= 24) {
      data.player.time = 6;
    }

    // فحص البيانات المتداخلة
    if (data.farming && !Array.isArray(data.farming.plots)) {
      console.warn('[EnhancedSaveSystem] ⚠️ Validation: farming plots not array, resetting');
      data.farming.plots = [];
    }

    if (data.animals && !Array.isArray(data.animals.animals)) {
      console.warn('[EnhancedSaveSystem] ⚠️ Validation: animals not array, resetting');
      data.animals.animals = [];
    }

    return true;
  },

  // ============================================================
  // 🔐 التشفير والفك (XOR + Base64)
  // ============================================================
  encrypt: function(data) {
    try {
      // XOR مع المفتاح
      var encrypted = '';
      for (var i = 0; i < data.length; i++) {
        var charCode = data.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
        encrypted += String.fromCharCode(charCode);
      }
      // Base64 encode
      return btoa(unescape(encodeURIComponent(encrypted)));
    } catch (e) {
      console.error('[EnhancedSaveSystem] Encrypt failed:', e.message);
      return btoa(unescape(encodeURIComponent(data)));
    }
  },

  decrypt: function(data) {
    try {
      // Base64 decode
      var decoded = decodeURIComponent(escape(atob(data)));
      // XOR مع المفتاح
      var decrypted = '';
      for (var i = 0; i < decoded.length; i++) {
        var charCode = decoded.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
        decrypted += String.fromCharCode(charCode);
      }
      return decrypted;
    } catch (e) {
      // fallback: try raw base64
      try {
        return decodeURIComponent(escape(atob(data)));
      } catch (e2) {
        console.error('[EnhancedSaveSystem] Decrypt failed:', e2.message);
        return null;
      }
    }
  },

  // ============================================================
  // 📦 النسخ الاحتياطي
  // ============================================================
  createBackup: function() {
    try {
      var currentSave = localStorage.getItem(this.SAVE_KEY);
      if (!currentSave) return;

      // دوران النسخ الاحتياطية (rotate backups)
      for (var i = this.MAX_BACKUPS - 1; i >= 1; i--) {
        var prevKey = this.BACKUP_KEY_PREFIX + (i - 1);
        var currKey = this.BACKUP_KEY_PREFIX + i;
        var prevData = localStorage.getItem(prevKey);
        if (prevData) {
          localStorage.setItem(currKey, prevData);
        }
      }

      // حفظ النسخة الحالية كنسخة احتياطية 0
      localStorage.setItem(this.BACKUP_KEY_PREFIX + '0', currentSave);

      console.log('[EnhancedSaveSystem] 📦 Backup created');
    } catch (e) {
      console.warn('[EnhancedSaveSystem] ⚠️ Backup creation failed:', e.message);
    }
  },

  // ============================================================
  // 🔄 الاستعادة عند تلف البيانات
  // ============================================================
  attemptRestore: function() {
    console.log('[EnhancedSaveSystem] 🔄 Attempting restore from backups...');

    for (var i = 0; i < this.MAX_BACKUPS; i++) {
      var backupKey = this.BACKUP_KEY_PREFIX + i;
      var backupData = localStorage.getItem(backupKey);

      if (!backupData) continue;

      try {
        var decrypted = this.decrypt(backupData);
        var parsed = JSON.parse(decrypted);

        if (this.validateSaveData(parsed)) {
          console.log('[EnhancedSaveSystem] ✅ Restored from backup #' + i);
          // حفظ البيانات المستعادة كحفظ رئيسي
          localStorage.setItem(this.SAVE_KEY, backupData);
          return parsed;
        }
      } catch (e) {
        console.warn('[EnhancedSaveSystem] ⚠️ Backup #' + i + ' corrupted');
      }
    }

    console.warn('[EnhancedSaveSystem] ❌ All backups failed — starting fresh');
    return null;
  },

  // ============================================================
  // 📂 استعادة الجلسة الأخيرة
  // ============================================================
  tryRestoreLastSession: function() {
    var data = this.load();
    if (!data) {
      console.log('[EnhancedSaveSystem] 📂 No previous session to restore');
      return false;
    }

    // تطبيق البيانات على اللعبة
    this.applySaveData(data);
    return true;
  },

  // ============================================================
  // 🔧 تطبيق البيانات المحفوظة على اللعبة
  // ============================================================
  applySaveData: function(data) {
    if (!data || !this.game) return false;

    var game = this.game;

    try {
      // === تطبيق بيانات اللاعب ===
      if (data.player && game.state) {
        game.state.health = data.player.health;
        game.state.energy = data.player.energy;
        game.state.money = data.player.money;
        game.state.xp = data.player.xp || 0;
        game.state.level = data.player.level || 1;
        game.state.day = data.player.day || 1;
        game.state.time = data.player.time || 8;
        game.state.selectedTool = data.player.selectedTool || 0;
        game.state.timeScale = data.player.timeScale || 5;

        // استعادة موقع اللاعب
        if (data.player.position && GAME.player && GAME.player.mesh) {
          GAME.player.mesh.position.set(
            data.player.position.x,
            data.player.position.y,
            data.player.position.z
          );
        }
      }

      // === تطبيق المخزون ===
      if (data.inventory && game.state) {
        game.state.inventory = data.inventory;
      }

      // === تطبيق الإحصائيات ===
      if (data.stats && game.state) {
        game.state.stats = data.stats;
      }

      // === تطبيق بيانات الزراعة ===
      if (data.farming && GAME.FarmingSystem) {
        this._applyFarmingData(data.farming);
      }

      // === تطبيق بيانات الحيوانات ===
      if (data.animals && GAME.AnimalsSystem && GAME.AnimalsSystem.load) {
        GAME.AnimalsSystem.load(data.animals);
      }

      // === تطبيق بيانات المباني ===
      if (data.buildings && GAME.BuildingsSystem) {
        this._applyBuildingsData(data.buildings);
      }

      // === تطبيق بيانات الاقتصاد ===
      if (data.economy && GAME.EconomySystem) {
        this._applyEconomyData(data.economy);
      }

      // === تطبيق بيانات NPCs ===
      if (data.npcs && GAME.NPCsSystem && GAME.NPCsSystem.load) {
        GAME.NPCsSystem.load(data.npcs);
      }

      // === تطبيق بيانات العالم ===
      if (data.world && GAME.WorldExpansionInstance) {
        this._applyWorldData(data.world);
      }

      // === تطبيق بيانات الترقيات ===
      if (data.upgrades && GAME.UpgradesSystem) {
        this._applyUpgradesData(data.upgrades);
      }

      // === تطبيق المهام ===
      if (data.quests && game.state) {
        game.state.quests = data.quests;
      }

      // === تطبيق الأدوات ===
      if (game.state && typeof game.selectTool === 'function') {
        game.selectTool(game.state.selectedTool);
      }

      console.log('[EnhancedSaveSystem] ✅ Save data applied successfully');
      return true;

    } catch (err) {
      console.error('[EnhancedSaveSystem] ❌ Failed to apply save data:', err.message);
      return false;
    }
  },

  // ============================================================
  // 🔧 مساعدات تطبيق البيانات لكل نظام
  // ============================================================

  _applyFarmingData: function(farmingData) {
    try {
      if (!GAME.FarmingSystem || !farmingData.plots) return;

      // استعادة الأراضي
      GAME.FarmingSystem.plots = farmingData.plots.map(function(plotData) {
        return {
          index: plotData.index,
          state: plotData.state || 'empty',
          cropType: plotData.cropType || null,
          growthProgress: plotData.growthProgress || 0,
          quality: plotData.quality || 'base',
          watered: plotData.watered || false,
          fertilized: plotData.fertilized || null,
          wateredToday: plotData.wateredToday || false,
          dayPlanted: plotData.dayPlanted || 0,
          x: plotData.x,
          z: plotData.z,
          mesh: null, // سيتم إعادة إنشاؤه
          waterMarker: null,
          fertilizerMarker: null
        };
      });

      GAME.FarmingSystem.totalPlanted = farmingData.totalPlanted || 0;
      GAME.FarmingSystem.totalHarvested = farmingData.totalHarvested || 0;

      // إعادة إنشاء الأشكال ثلاثية الأبعاد للأراضي المزروعة
      if (GAME.FarmingSystem._rebuildVisuals) {
        GAME.FarmingSystem._rebuildVisuals();
      }

      console.log('[EnhancedSaveSystem] 🌾 Farming data restored (' + farmingData.plots.length + ' plots)');
    } catch (e) {
      console.warn('[EnhancedSaveSystem] ⚠️ Failed to apply farming data:', e.message);
    }
  },

  _applyBuildingsData: function(buildingsData) {
    try {
      if (!GAME.BuildingsSystem || !buildingsData.buildings) return;

      for (var key in buildingsData.buildings) {
        if (GAME.BuildingsSystem.buildings && GAME.BuildingsSystem.buildings[key]) {
          var saved = buildingsData.buildings[key];
          var building = GAME.BuildingsSystem.buildings[key];
          building.level = saved.level || 0;
          building.isBuilt = saved.isBuilt || false;
          building.buildProgress = saved.buildProgress || 0;
          building.dayBuilt = saved.dayBuilt || 0;
          building.upgradeProgress = saved.upgradeProgress || 0;
        }
      }

      console.log('[EnhancedSaveSystem] 🏠 Buildings data restored');
    } catch (e) {
      console.warn('[EnhancedSaveSystem] ⚠️ Failed to apply buildings data:', e.message);
    }
  },

  _applyEconomyData: function(economyData) {
    try {
      if (!GAME.EconomySystem) return;

      if (economyData.stats) {
        GAME.EconomySystem.stats = GAME.EconomySystem.stats || {};
        GAME.EconomySystem.stats.totalEarned = economyData.stats.totalEarned || 0;
        GAME.EconomySystem.stats.totalExpenses = economyData.stats.totalExpenses || 0;
        GAME.EconomySystem.stats.totalSold = economyData.stats.totalSold || 0;
        GAME.EconomySystem.stats.totalBought = economyData.stats.totalBought || 0;
      }

      if (economyData.marketPrices) {
        GAME.EconomySystem.marketPrices = economyData.marketPrices;
      }

      if (economyData.dailyPriceSeed) {
        GAME.EconomySystem.dailyPriceSeed = economyData.dailyPriceSeed;
      }

      console.log('[EnhancedSaveSystem] 💰 Economy data restored');
    } catch (e) {
      console.warn('[EnhancedSaveSystem] ⚠️ Failed to apply economy data:', e.message);
    }
  },

  _applyWorldData: function(worldData) {
    try {
      if (!GAME.WorldExpansionInstance) return;

      var w = GAME.WorldExpansionInstance;
      if (worldData.currentZone) w.currentZone = worldData.currentZone;
      if (worldData.unlockedZones) w.unlockedZones = worldData.unlockedZones;
      if (worldData.discoveredPOIs) w.discoveredPOIs = worldData.discoveredPOIs;
      if (worldData.totalResourcesGathered) w.totalResourcesGathered = worldData.totalResourcesGathered;

      console.log('[EnhancedSaveSystem] 🌍 World data restored (zone: ' + (worldData.currentZone || 'farm') + ')');
    } catch (e) {
      console.warn('[EnhancedSaveSystem] ⚠️ Failed to apply world data:', e.message);
    }
  },

  _applyUpgradesData: function(upgradesData) {
    try {
      if (!GAME.UpgradesSystem || !upgradesData.upgrades) return;

      for (var key in upgradesData.upgrades) {
        if (GAME.UpgradesSystem.upgrades && GAME.UpgradesSystem.upgrades[key]) {
          var saved = upgradesData.upgrades[key];
          GAME.UpgradesSystem.upgrades[key].purchased = saved.purchased || false;
          GAME.UpgradesSystem.upgrades[key].level = saved.level || 0;
        }
      }

      console.log('[EnhancedSaveSystem] ⬆️ Upgrades data restored');
    } catch (e) {
      console.warn('[EnhancedSaveSystem] ⚠️ Failed to apply upgrades data:', e.message);
    }
  },

  // ============================================================
  // ⏱️ الحفظ التلقائي
  // ============================================================
  startAutoSave: function() {
    var self = this;
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(function() {
      if (self.game && self.game.state) {
        var success = self.save();
        if (success) {
          // إشعار صامت (فقط في console)
          console.log('[EnhancedSaveSystem] ⏱️ Auto-save completed');
        }
      }
    }, this.AUTO_SAVE_INTERVAL);

    console.log('[EnhancedSaveSystem] ⏱️ Auto-save started (every ' + (this.AUTO_SAVE_INTERVAL / 1000) + 's)');
  },

  stopAutoSave: function() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('[EnhancedSaveSystem] ⏱️ Auto-save stopped');
    }
  },

  // ============================================================
  // 🚪 حفظ عند إغلاق الصفحة
  // ============================================================
  setupBeforeUnload: function() {
    var self = this;
    window.addEventListener('beforeunload', function() {
      if (self.game && self.game.state) {
        console.log('[EnhancedSaveSystem] 🚪 Saving on page unload...');
        self.save();
      }
    });

    // حفظ عند تغيير التبويب (visibilitychange)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden && self.game && self.game.state) {
        console.log('[EnhancedSaveSystem] 👁️ Tab hidden — saving...');
        self.save();
      }
    });
  },

  // ============================================================
  // 🗑️ حذف بيانات الحفظ
  // ============================================================
  deleteSave: function() {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      for (var i = 0; i < this.MAX_BACKUPS; i++) {
        localStorage.removeItem(this.BACKUP_KEY_PREFIX + i);
      }
      this._saveCount = 0;
      console.log('[EnhancedSaveSystem] 🗑️ All save data deleted');
      return true;
    } catch (e) {
      console.error('[EnhancedSaveSystem] ❌ Failed to delete save:', e.message);
      return false;
    }
  },

  // ============================================================
  // 📊 معلومات الحفظ
  // ============================================================
  getSaveInfo: function() {
    var encrypted = localStorage.getItem(this.SAVE_KEY);
    var info = {
      hasData: !!encrypted,
      size: encrypted ? encrypted.length : 0,
      sizeKB: encrypted ? (encrypted.length / 1024).toFixed(1) : '0',
      lastSaveTime: this._lastSaveTime,
      saveCount: this._saveCount,
      backupsAvailable: 0
    };

    // عد النسخ الاحتياطية
    for (var i = 0; i < this.MAX_BACKUPS; i++) {
      if (localStorage.getItem(this.BACKUP_KEY_PREFIX + i)) {
        info.backupsAvailable++;
      }
    }

    // محاولة قراءة الإصدار
    if (encrypted) {
      try {
        var decrypted = this.decrypt(encrypted);
        var data = JSON.parse(decrypted);
        info.version = data.version;
        info.gameDay = data.player ? data.player.day : null;
        info.timestamp = data.timestamp;
      } catch (e) {}
    }

    return info;
  },

  // ============================================================
  // 🔄 التحقق من وجود حفظ
  // ============================================================
  hasSaveData: function() {
    return !!localStorage.getItem(this.SAVE_KEY);
  },

  // ============================================================
  // 📤 تصدير البيانات (للنسخ الاحتياطي الخارجي)
  // ============================================================
  exportSave: function() {
    var encrypted = localStorage.getItem(this.SAVE_KEY);
    if (!encrypted) return null;
    return {
      data: encrypted,
      version: this.SAVE_VERSION,
      timestamp: Date.now()
    };
  },

  // ============================================================
  // 📥 استيراد البيانات (من نسخة احتياطية خارجية)
  // ============================================================
  importSave: function(saveExport) {
    if (!saveExport || !saveExport.data) return false;

    try {
      var decrypted = this.decrypt(saveExport.data);
      var data = JSON.parse(decrypted);

      if (!this.validateSaveData(data)) {
        console.error('[EnhancedSaveSystem] ❌ Imported data failed validation');
        return false;
      }

      // حفظ نسخة احتياطية أولاً
      this.createBackup();

      // حفظ البيانات المستوردة
      localStorage.setItem(this.SAVE_KEY, saveExport.data);

      // تطبيق البيانات
      this.applySaveData(data);

      console.log('[EnhancedSaveSystem] 📥 Save data imported successfully');
      return true;
    } catch (e) {
      console.error('[EnhancedSaveSystem] ❌ Import failed:', e.message);
      return false;
    }
  }
};

console.log('[EnhancedSaveSystem] 📦 Module loaded');
