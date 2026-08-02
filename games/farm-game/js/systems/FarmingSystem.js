/**
 * FarmingSystem.js - نظام الزراعة المتقدم
 * Farm Game 3D - Production Quality
 */

var GAME = GAME || {};

// ============================================================
// 📊 بيانات المحاصيل (تكيفية حسب الموسم)
// ============================================================
GAME.CROPS_DATA = {
  // الربيع
  wheat: {
    name: 'Wheat', nameAr: 'قمح',
    season: 'spring', daysToGrow: 4, stages: 6,
    sellPrice: { base: 25, silver: 35, gold: 50, iridium: 100 },
    buyPrice: 10, xpReward: 10,
    waterBonus: 1.5, fertilizerBonus: 1.5,
    toolRequired: null, harvestTool: null
  },
  carrot: {
    name: 'Carrot', nameAr: 'جزر',
    season: 'spring', daysToGrow: 6, stages: 6,
    sellPrice: { base: 35, silver: 50, gold: 70, iridium: 140 },
    buyPrice: 15, xpReward: 15,
    waterBonus: 1.3, fertilizerBonus: 1.3,
    toolRequired: null, harvestTool: null
  },
  potato: {
    name: 'Potato', nameAr: 'بطاطس',
    season: 'spring', daysToGrow: 5, stages: 6,
    sellPrice: { base: 30, silver: 42, gold: 60, iridium: 120 },
    buyPrice: 12, xpReward: 12,
    waterBonus: 1.4, fertilizerBonus: 1.4,
    toolRequired: null, harvestTool: null
  },
  lettuce: {
    name: 'Lettuce', nameAr: 'خس',
    season: 'spring', daysToGrow: 4, stages: 5,
    sellPrice: { base: 28, silver: 40, gold: 55, iridium: 110 },
    buyPrice: 11, xpReward: 11,
    waterBonus: 1.5, fertilizerBonus: 1.4,
    toolRequired: null, harvestTool: null
  },
  turnip: {
    name: 'Turnip', nameAr: 'لفت',
    season: 'spring', daysToGrow: 5, stages: 6,
    sellPrice: { base: 32, silver: 45, gold: 65, iridium: 130 },
    buyPrice: 14, xpReward: 13,
    waterBonus: 1.4, fertilizerBonus: 1.4,
    toolRequired: null, harvestTool: null
  },
  parsnip: {
    name: 'Parsnip', nameAr: 'جزر أبيض',
    season: 'spring', daysToGrow: 5, stages: 6,
    sellPrice: { base: 38, silver: 54, gold: 75, iridium: 150 },
    buyPrice: 16, xpReward: 14,
    waterBonus: 1.3, fertilizerBonus: 1.5,
    toolRequired: null, harvestTool: null
  },

  // الصيف
  tomato: {
    name: 'Tomato', nameAr: 'طماطم',
    season: 'summer', daysToGrow: 7, stages: 6,
    sellPrice: { base: 40, silver: 56, gold: 80, iridium: 160 },
    buyPrice: 20, xpReward: 16,
    waterBonus: 1.4, fertilizerBonus: 1.4,
    toolRequired: null, harvestTool: null
  },
  corn: {
    name: 'Corn', nameAr: 'ذرة',
    season: 'summer', daysToGrow: 8, stages: 6,
    sellPrice: { base: 50, silver: 70, gold: 100, iridium: 200 },
    buyPrice: 25, xpReward: 18,
    waterBonus: 1.5, fertilizerBonus: 1.5,
    toolRequired: null, harvestTool: null
  },
  watermelon: {
    name: 'Watermelon', nameAr: 'بطيخ',
    season: 'summer', daysToGrow: 10, stages: 7,
    sellPrice: { base: 80, silver: 112, gold: 160, iridium: 320 },
    buyPrice: 40, xpReward: 22,
    waterBonus: 1.6, fertilizerBonus: 1.6,
    toolRequired: null, harvestTool: null
  },
  pepper: {
    name: 'Pepper', nameAr: 'فلفل',
    season: 'summer', daysToGrow: 6, stages: 6,
    sellPrice: { base: 38, silver: 53, gold: 75, iridium: 150 },
    buyPrice: 18, xpReward: 15,
    waterBonus: 1.4, fertilizerBonus: 1.4,
    toolRequired: null, harvestTool: null
  },
  eggplant: {
    name: 'Eggplant', nameAr: 'باذنجان',
    season: 'summer', daysToGrow: 7, stages: 6,
    sellPrice: { base: 42, silver: 59, gold: 85, iridium: 170 },
    buyPrice: 22, xpReward: 17,
    waterBonus: 1.3, fertilizerBonus: 1.5,
    toolRequired: null, harvestTool: null
  },
  sunflower: {
    name: 'Sunflower', nameAr: 'عباد الشمس',
    season: 'summer', daysToGrow: 6, stages: 6,
    sellPrice: { base: 45, silver: 63, gold: 90, iridium: 180 },
    buyPrice: 24, xpReward: 16,
    waterBonus: 1.4, fertilizerBonus: 1.4,
    toolRequired: null, harvestTool: null
  },

  // الخريف
  pumpkin: {
    name: 'Pumpkin', nameAr: 'يقطين',
    season: 'autumn', daysToGrow: 10, stages: 7,
    sellPrice: { base: 100, silver: 140, gold: 200, iridium: 400 },
    buyPrice: 50, xpReward: 25,
    waterBonus: 1.5, fertilizerBonus: 1.5,
    toolRequired: null, harvestTool: null
  },
  cranberries: {
    name: 'Cranberries', nameAr: 'توت أحمر',
    season: 'autumn', daysToGrow: 7, stages: 6,
    sellPrice: { base: 55, silver: 77, gold: 110, iridium: 220 },
    buyPrice: 28, xpReward: 18,
    waterBonus: 1.4, fertilizerBonus: 1.4,
    toolRequired: null, harvestTool: null
  },
  grape: {
    name: 'Grape', nameAr: 'عنب',
    season: 'autumn', daysToGrow: 8, stages: 6,
    sellPrice: { base: 48, silver: 67, gold: 95, iridium: 190 },
    buyPrice: 26, xpReward: 17,
    waterBonus: 1.3, fertilizerBonus: 1.5,
    toolRequired: null, harvestTool: null
  },
  apple: {
    name: 'Apple', nameAr: 'تفاح',
    season: 'autumn', daysToGrow: 12, stages: 8,
    sellPrice: { base: 80, silver: 112, gold: 160, iridium: 320 },
    buyPrice: 50, xpReward: 24,
    waterBonus: 1.2, fertilizerBonus: 1.4,
    toolRequired: null, harvestTool: null,
    isTree: true, treeHarvest: true
  },

  // الشتاء (في الـ greenhouse فقط)
  winter_melon: {
    name: 'Winter Melon', nameAr: 'بطيخ شتوي',
    season: 'winter', daysToGrow: 10, stages: 7,
    sellPrice: { base: 120, silver: 168, gold: 240, iridium: 480 },
    buyPrice: 60, xpReward: 28,
    waterBonus: 1.5, fertilizerBonus: 1.5,
    greenhouseOnly: true, toolRequired: null, harvestTool: null
  },
  flower: {
    name: 'Flower', nameAr: 'زهرة',
    season: 'any', daysToGrow: 5, stages: 5,
    sellPrice: { base: 30, silver: 42, gold: 60, iridium: 120 },
    buyPrice: 15, xpReward: 12,
    waterBonus: 1.4, fertilizerBonus: 1.3,
    greenhouseOnly: true, toolRequired: null, harvestTool: null
  }
};

// ============================================================
// 💩 بيانات الأسمدة
// ============================================================
GAME.FERTILIZERS_DATA = {
  basic: { name: 'Basic Fertilizer', nameAr: 'سماد أساسي', cost: 10, growthBonus: 1.2, qualityBonus: 1.0 },
  quality: { name: 'Quality Fertilizer', nameAr: 'سماد جيد', cost: 25, growthBonus: 1.4, qualityBonus: 1.3 },
  deluxe: { name: 'Deluxe Fertilizer', nameAr: 'سماد فاخر', cost: 50, growthBonus: 1.6, qualityBonus: 1.6 },
  master: { name: 'Master Fertilizer', nameAr: 'سماد ماستر', cost: 100, growthBonus: 2.0, qualityBonus: 2.0 },
  speed: { name: 'Speed-Gro', nameAr: 'مسرع نمو', cost: 20, growthBonus: 1.5, qualityBonus: 1.0, effect: 'speed' },
  deluxe_speed: { name: 'Deluxe Speed-Gro', nameAr: 'مسرع فاخر', cost: 45, growthBonus: 2.0, qualityBonus: 1.0, effect: 'speed' }
};

// ============================================================
// 🌱 نظام الزراعة
// ============================================================
GAME.FarmingSystem = {
  plots: [],
  scene: null,
  plotMeshMap: new Map(),
  fertilizerMeshMap: new Map(),
  maxPlots: 100,

  init: function(scene) {
    this.scene = scene;
    this.plots = [];
    this.plotMeshMap.clear();
    this.fertilizerMeshMap.clear();
    console.log('[FarmingSystem] ✅ Initialized with ' + Object.keys(GAME.CROPS_DATA).length + ' crops');
  },

  // إنشاء قطعة أرض جديدة
  createPlot: function(x, z, index) {
    var plot = {
      id: index,
      x: x,
      z: z,
      state: 'empty', // empty, plowed, planted, ready, overripe
      crop: null,
      growthProgress: 0, // 0-100
      growthStage: 0, // 0 to stages-1
      watered: false,
      fertilized: false,
      fertilizerType: null,
      wateredToday: false,
      quality: 'normal', // normal, silver, gold, iridium
      mesh: null,
      fertilizerMesh: null,
      stageMeshes: []
    };

    // إنشاء الـ visual
    this._createPlotVisual(plot);

    this.plots.push(plot);
    return plot;
  },

  // إنشاء الـ visual للقطعة
  _createPlotVisual: function(plot) {
    if (!this.scene) return;

    // أرض فارغة - أخضر
    var emptyMat = new THREE.MeshLambertMaterial({ color: 0x3a5f0b });
    var emptyGeo = new THREE.BoxGeometry(2.2, 0.15, 2.2);
    var mesh = new THREE.Mesh(emptyGeo, emptyMat);
    mesh.position.set(plot.x, 0.08, plot.z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    plot.mesh = mesh;
    this.plotMeshMap.set(plot.id, mesh);
  },

  // حرث الأرض
  plow: function(plotIndex) {
    var plot = this.plots[plotIndex];
    if (!plot || plot.state !== 'empty') return false;
    if (GAME.game.state.energy < GAME.game.getEnergyCost(5)) {
      GAME.ui.showNotification('❌ Too tired!', 'error');
      return false;
    }

    GAME.game.state.energy -= GAME.game.getEnergyCost(5);

    // تغيير الـ visual إلى تربة
    plot.state = 'plowed';
    if (plot.mesh) {
      plot.mesh.material.color.setHex(0x4a2a0a); // لون التربة
    }

    // جسيمات الحرث
    GAME.game.spawnPlowParticles(plot.x, plot.z);

    GAME.game.addXP(5);
    GAME.quests.track('plow', 1);
    GAME.game.state.stats.totalPlanted++;

    GAME.ui.showNotification('✅ Plowed! +5 XP', 'success');
    return true;
  },

  // زراعة محصول
  plant: function(plotIndex, cropType) {
    var plot = this.plots[plotIndex];
    if (!plot || plot.state !== 'plowed') {
      GAME.ui.showNotification('❌ Need plowed soil!', 'error');
      return false;
    }

    var cropData = GAME.CROPS_DATA[cropType];
    if (!cropData) {
      GAME.ui.showNotification('❌ Unknown crop!', 'error');
      return false;
    }

    // التحقق من الموسم
    var currentSeason = GAME.TimeSystem ? GAME.TimeSystem.getSeason() : 'spring';
    if (cropData.season !== 'any' && cropData.season !== currentSeason && !cropData.greenhouseOnly) {
      GAME.ui.showNotification('❌ Not the right season!', 'error');
      return false;
    }

    var energyCost = GAME.game.getEnergyCost(8);
    if (GAME.game.state.energy < energyCost) {
      GAME.ui.showNotification('❌ Too tired!', 'error');
      return false;
    }

    // التحقق من البذور أو المال
    var hasSeeds = (GAME.game.state.inventory.seeds && GAME.game.state.inventory.seeds[cropType]) > 0;
    var hasMoney = GAME.game.state.money >= cropData.buyPrice;

    if (!hasSeeds && !hasMoney) {
      GAME.ui.showNotification('❌ Need seeds or $' + cropData.buyPrice, 'error');
      return false;
    }

    if (hasSeeds) {
      GAME.game.state.inventory.seeds[cropType]--;
    } else {
      GAME.game.state.money -= cropData.buyPrice;
    }

    GAME.game.state.energy -= energyCost;

    // إعداد قطعة الأرض
    plot.state = 'planted';
    plot.crop = cropType;
    plot.growthProgress = 0;
    plot.growthStage = 0;
    plot.watered = false;
    plot.fertilized = false;
    plot.wateredToday = false;
    plot.quality = 'normal';

    // إنشاء الـ visual للنبات
    this._createCropVisual(plot);

    // جسيمات الزراعة
    var plantColors = { wheat: 0x228B22, tomato: 0x228B22, carrot: 0x228B22 };
    GAME.game.spawnParticles(plot.x, 0.5, plot.z, plantColors[cropType] || 0x228B22, 12, 2, 0.08, 0.6);

    GAME.game.addXP(8);
    GAME.quests.track('plant', 1);

    GAME.ui.showNotification('🌱 Planted ' + cropData.name + '! +8 XP', 'success');
    return true;
  },

  // إنشاء الـ visual للمحصول
  _createCropVisual: function(plot) {
    if (!this.scene || !plot.crop) return;

    var cropData = GAME.CROPS_DATA[plot.crop];
    var color = this._getCropColor(plot.crop, 0);

    var plantMat = new THREE.MeshLambertMaterial({ color: color });
    var plant;

    if (cropData.isTree) {
      // شجرة
      var trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.5), trunkMat);
      trunk.position.set(plot.x, 0.3, plot.z);
      
      var leafMat = new THREE.MeshLambertMaterial({ color: 0x3a7d2c });
      var leaf = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 6), leafMat);
      leaf.position.set(plot.x, 0.8, plot.z);
      leaf.scale.y = 0.7;
      
      plant = new THREE.Group();
      plant.add(trunk);
      plant.add(leaf);
    } else {
      // محصول عادي
      plant = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.3), plantMat);
      plant.position.set(plot.x, 0.2, plot.z);
    }

    plant.castShadow = true;
    this.scene.add(plant);
    plot.mesh = plant;

    // إضافة علامات المياه والسماد
    this._updateFertilizerVisual(plot);
  },

  // الحصول على لون المحصول حسب مرحلة النمو
  _getCropColor: function(cropType, stage) {
    var colors = {
      wheat: [0x8b4513, 0x228b22, 0x228b22, 0x228b22, 0xdaa520, 0xdaa520],
      tomato: [0x8b4513, 0x228b22, 0x228b22, 0xff4500, 0xff4444, 0xff4444],
      carrot: [0x8b4513, 0x8b4513, 0xff8c00, 0xff8c00, 0xff8c00, 0xff8c00],
      potato: [0x8b4513, 0x228b22, 0x228b22, 0x8B4513, 0x8B4513, 0x8B4513],
      corn: [0x228b22, 0x228b22, 0x228b22, 0xdaa520, 0xdaa520, 0xdaa520],
      pumpkin: [0x228b22, 0x228b22, 0x228b22, 0x228b22, 0xff6600, 0xff6600],
      apple: [0x8B5A2B, 0x8B5A2B, 0x3a7d2c, 0x3a7d2c, 0x3a7d2c, 0x3a7d2c, 0xff0000, 0xff0000]
    };

    var cropColors = colors[cropType] || [0x228b22, 0x228b22, 0x228b22, 0x228b22, 0x228b22, 0x228b22];
    return cropColors[Math.min(stage, cropColors.length - 1)];
  },

  // سقي المحصول
  water: function(plotIndex) {
    var plot = this.plots[plotIndex];
    if (!plot || plot.state !== 'planted') return false;
    if (plot.wateredToday) {
      GAME.ui.showNotification('❌ Already watered today!', 'error');
      return false;
    }
    if (GAME.game.state.energy < GAME.game.getEnergyCost(3)) {
      GAME.ui.showNotification('❌ Too tired!', 'error');
      return false;
    }

    GAME.game.state.energy -= GAME.game.getEnergyCost(3);
    plot.watered = true;
    plot.wateredToday = true;

    // تحديث اللون
    if (plot.mesh) {
      plot.mesh.material.color.setHex(0x4fc3f7);
    }

    // جسيمات الماء
    GAME.game.spawnWaterParticles(plot.x, plot.z);

    GAME.game.addXP(3);
    GAME.quests.track('water', 1);
    GAME.game.state.stats.totalWatered++;

    GAME.ui.showNotification('💧 Watered! +3 XP', 'success');
    return true;
  },

  // تسميد المحصول
  fertilize: function(plotIndex, fertilizerType) {
    var plot = this.plots[plotIndex];
    if (!plot || plot.state !== 'planted' && plot.state !== 'plowed') return false;

    var fertData = GAME.FERTILIZERS_DATA[fertilizerType];
    if (!fertData) {
      GAME.ui.showNotification('❌ Unknown fertilizer!', 'error');
      return false;
    }

    var playerFertilizer = GAME.game.state.inventory.fertilizer || {};
    if (!playerFertilizer[fertilizerType] || playerFertilizer[fertilizerType] <= 0) {
      GAME.ui.showNotification('❌ No ' + fertData.name + '!', 'error');
      return false;
    }

    playerFertilizer[fertilizerType]--;
    plot.fertilized = true;
    plot.fertilizerType = fertilizerType;

    // تحديث الـ visual
    this._updateFertilizerVisual(plot);

    // جسيمات السماد
    GAME.game.spawnFertilizerParticles(plot.x, plot.z);

    GAME.game.addXP(4);
    GAME.quests.track('fertilize', 1);
    GAME.game.state.stats.totalFertilized++;

    GAME.ui.showNotification('🌱 Fertilized with ' + fertData.name + '! +4 XP', 'success');
    return true;
  },

  // تحديث الـ visual للسماد
  _updateFertilizerVisual: function(plot) {
    if (!this.scene) return;

    // إزالة الـ old mesh
    if (plot.fertilizerMesh) {
      this.scene.remove(plot.fertilizerMesh);
      plot.fertilizerMesh = null;
    }

    if (!plot.fertilized || !plot.fertilizerType) return;

    var fertData = GAME.FERTILIZERS_DATA[plot.fertilizerType];
    var color = fertData && fertData.effect === 'speed' ? 0x00ff00 : 0x8B4513;

    var fertGroup = new THREE.Group();

    var packetGeo = new THREE.BoxGeometry(0.2, 0.1, 0.2);
    var packetMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.7 });
    var packet = new THREE.Mesh(packetGeo, packetMat);
    packet.position.set(plot.x, 0.15, plot.z);
    fertGroup.add(packet);

    this.scene.add(fertGroup);
    plot.fertilizerMesh = fertGroup;
    this.fertilizerMeshMap.set(plot.id, fertGroup);
  },

  // حصاد المحصول
  harvest: function(plotIndex) {
    var plot = this.plots[plotIndex];
    if (!plot || (plot.state !== 'ready' && plot.state !== 'overripe')) {
      GAME.ui.showNotification('❌ Nothing ready to harvest!', 'error');
      return false;
    }
    if (GAME.game.state.energy < GAME.game.getEnergyCost(10)) {
      GAME.ui.showNotification('❌ Too tired!', 'error');
      return false;
    }

    var cropData = GAME.CROPS_DATA[plot.crop];
    if (!cropData) return false;

    GAME.game.state.energy -= GAME.game.getEnergyCost(10);

    // حساب السعر والجودة
    var basePrice = cropData.sellPrice.base;
    var qualityMulti = { normal: 1, silver: 1.4, gold: 2, iridium: 4 };
    var sellPrice = Math.floor(basePrice * qualityMulti[plot.quality]);

    // إضافة للمحصول للمخزون
    var invKey = plot.isTree ? plot.crop : plot.crop;
    GAME.game.state.inventory[invKey] = (GAME.game.state.inventory[invKey] || 0) + 1;

    // بيع إذا كان هناك إعداد للبيع التلقائي
    if (GAME.game.state.autoSell) {
      GAME.game.state.money += sellPrice;
      GAME.ui.showNotification('💰 Sold for $' + sellPrice, 'success');
    } else {
      GAME.game.state.money += sellPrice;
      GAME.ui.showNotification('💰 Harvested ' + cropData.name + '! +$' + sellPrice, 'success');
    }

    // جسيمات الحصاد
    var colors = { wheat: 0xdaa520, tomato: 0xff4444, carrot: 0xff8c00, apple: 0xff0000 };
    GAME.game.spawnHarvestParticles(plot.x, plot.z, plot.crop);

    // إعادة تعيين قطعة الأرض
    this._resetPlot(plot);

    GAME.game.addXP(15);
    GAME.quests.track('harvest', 1);
    GAME.game.state.stats.totalHarvested++;

    return true;
  },

  // إعادة تعيين قطعة الأرض
  _resetPlot: function(plot) {
    plot.state = 'plowed';
    plot.crop = null;
    plot.growthProgress = 0;
    plot.growthStage = 0;
    plot.watered = false;
    plot.wateredToday = false;
    plot.fertilized = false;
    plot.fertilizerType = null;
    plot.quality = 'normal';

    // إزالة الـ meshes
    if (plot.mesh) {
      this.scene.remove(plot.mesh);
      plot.mesh.geometry.dispose();
      plot.mesh.material.dispose();
      plot.mesh = null;
    }
    if (plot.fertilizerMesh) {
      this.scene.remove(plot.fertilizerMesh);
      plot.fertilizerMesh = null;
    }

    // إعادة إنشاء التربة
    this._createPlotVisual(plot);
  },

  // تحديث نظام الزراعة (كل إطار)
  update: function(delta) {
    if (!GAME.game || !GAME.game.state || GAME.game.isPaused) return;

    var dayProgress = GAME.TimeSystem ? GAME.TimeSystem.getDayProgress() : 0;
    var isNewDay = dayProgress < 0.01; // بداية يوم جديد

    for (var i = 0; i < this.plots.length; i++) {
      var plot = this.plots[i];

      // إعادة تعيين المياه كل يوم جديد
      if (isNewDay) {
        plot.wateredToday = false;
      }

      // تطور المحاصيل
      if (plot.state === 'planted' && plot.crop) {
        this._updateCropGrowth(plot, delta);
      }
    }
  },

  // تحديث نمو المحصول
  _updateCropGrowth: function(plot, delta) {
    var cropData = GAME.CROPS_DATA[plot.crop];
    if (!cropData) return;

    // معدل النمو الأساسي
    var growthRate = 100 / (cropData.daysToGrow * 24); // 24 ticks per day

    // bonuses
    if (plot.watered) growthRate *= cropData.waterBonus || 1.5;
    if (plot.fertilized && plot.fertilizerType) {
      var fertData = GAME.FERTILIZERS_DATA[plot.fertilizerType];
      if (fertData) growthRate *= fertData.growthBonus || 1.5;
    }

    // تأثير الطقس
    if (GAME.weather && GAME.weather.current) {
      var weather = GAME.weather.current;
      if (weather === 'rainy') growthRate *= 1.3;
      else if (weather === 'stormy') growthRate *= 0.8;
      else if (weather === 'snowy') growthRate *= 0.5;
    }

    // تطبيق النمو
    plot.growthProgress += growthRate * delta;

    // تحديث مرحلة النمو
    var newStage = Math.min(cropData.stages - 1, Math.floor(plot.growthProgress / 100 * cropData.stages));
    if (newStage !== plot.growthStage) {
      plot.growthStage = newStage;
      this._updateCropVisual(plot);
    }

    // التحقق من Readiness
    if (plot.growthProgress >= 100) {
      plot.state = 'ready';
      plot.growthProgress = 100;

      // حساب الجودة
      this._calculateQuality(plot);

      // notification
      GAME.ui.showNotification('🌾 ' + cropData.name + ' is ready!', 'success');
    }
  },

  // حساب جودة المحصول
  _calculateQuality: function(plot) {
    var roll = Math.random() * 100;
    var qualityBonus = 0;

    if (plot.fertilized && plot.fertilizerType) {
      var fertData = GAME.FERTILIZERS_DATA[plot.fertilizerType];
      qualityBonus = (fertData ? fertData.qualityBonus : 1) - 1;
    }

    roll += qualityBonus * 30; // bonus chance

    if (roll >= 95) plot.quality = 'iridium';
    else if (roll >= 80) plot.quality = 'gold';
    else if (roll >= 50) plot.quality = 'silver';
    else plot.quality = 'normal';
  },

  // تحديث الـ visual حسب مرحلة النمو
  _updateCropVisual: function(plot) {
    if (!plot.mesh || !plot.crop) return;

    var cropData = GAME.CROPS_DATA[plot.crop];
    var color = this._getCropColor(plot.crop, plot.growthStage);

    if (cropData.isTree) {
      // للشجار - تحديث حجم الأوراق والألوان
      var scale = 0.5 + plot.growthStage * 0.1;
      if (plot.mesh.children[1]) {
        plot.mesh.children[1].scale.setScalar(scale);
      }
      if (plot.growthStage >= 4 && cropData.treeHarvest) {
        plot.mesh.children[1].material.color.setHex(0xff0000); // تفاح أحمر
      }
    } else {
      // للمحاصيل العادية
      var scale = 0.2 + (plot.growthStage / cropData.stages) * 0.8;
      plot.mesh.scale.set(scale, scale, scale);
      if (plot.mesh.material) {
        plot.mesh.material.color.setHex(color);
      }
    }
  },

  // البحث عن أقرب قطعة
  findClosestPlot: function(x, z, state, maxDist) {
    maxDist = maxDist || 3;
    var closest = null;
    var minDist = maxDist;

    for (var i = 0; i < this.plots.length; i++) {
      var plot = this.plots[i];
      if (state && plot.state !== state) continue;

      var dx = x - plot.x;
      var dz = z - plot.z;
      var dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }

    return closest;
  },

  // حفظ حالة الزراعة
  save: function() {
    return this.plots.map(function(plot) {
      return {
        id: plot.id,
        x: plot.x,
        z: plot.z,
        state: plot.state,
        crop: plot.crop,
        growthProgress: plot.growthProgress,
        growthStage: plot.growthStage,
        watered: plot.watered,
        fertilized: plot.fertilized,
        fertilizerType: plot.fertilizerType,
        quality: plot.quality
      };
    });
  },

  // تحميل حالة الزراعة
  load: function(data) {
    this.plots = [];
    for (var i = 0; i < data.length; i++) {
      var p = data[i];
      var plot = this.createPlot(p.x, p.z, p.id);
      plot.state = p.state;
      plot.crop = p.crop;
      plot.growthProgress = p.growthProgress;
      plot.growthStage = p.growthStage;
      plot.watered = p.watered;
      plot.fertilized = p.fertilized;
      plot.fertilizerType = p.fertilizerType;
      plot.quality = p.quality || 'normal';

      // إعادة إنشاء الـ visual
      if (plot.state === 'plowed' && plot.mesh) {
        plot.mesh.material.color.setHex(0x4a2a0a);
      } else if (plot.state === 'planted' && plot.crop) {
        this._createCropVisual(plot);
      }
    }
  }
};

// ============================================================
// ⏰ نظام الوقت
// ============================================================
GAME.TimeSystem = {
  dayLength: 10 * 60 * 1000, // 10 دقائق реально
  timeOfDay: 6, // 6:00 صباحاً
  day: 1,
  season: 'spring',
  seasonDay: 1,
  seasons: ['spring', 'summer', 'autumn', 'winter'],
  paused: false,

  init: function() {
    this.timeOfDay = 6;
    this.day = 1;
    this.season = 'spring';
    this.seasonDay = 1;
  },

  update: function(delta) {
    if (this.paused || !GAME.game.state) return;

    // تحديث الوقت (10 دقائق = يوم كامل)
    var timeIncrement = (delta / this.dayLength) * 24;
    this.timeOfDay += timeIncrement;

    // إذا انتهى اليوم
    if (this.timeOfDay >= 24) {
      this._nextDay();
    }
  },

  _nextDay: function() {
    this.timeOfDay -= 24;
    this.day++;
    this.seasonDay++;

    // تغيير الموسم
    if (this.seasonDay > 28) {
      this.seasonDay = 1;
      var seasonIndex = this.seasons.indexOf(this.season);
      this.season = this.seasons[(seasonIndex + 1) % 4];
    }

    // إعلام النظم الأخرى بيوم جديد
    if (GAME.FarmingSystem) {
      // سيتم إعادة تعيين المياه في update
    }

    console.log('[Time] Day ' + this.day + ', ' + this.season + ' day ' + this.seasonDay);
  },

  getSeason: function() {
    return this.season;
  },

  getDayProgress: function() {
    return this.timeOfDay / 24;
  },

  getTimeString: function() {
    var hours = Math.floor(this.timeOfDay);
    var mins = Math.floor((this.timeOfDay % 1) * 60);
    var ampm = hours >= 12 ? 'PM' : 'AM';
    var h12 = hours % 12 || 12;
    return h12 + ':' + mins.toString().padStart(2, '0') + ' ' + ampm;
  },

  save: function() {
    return {
      timeOfDay: this.timeOfDay,
      day: this.day,
      season: this.season,
      seasonDay: this.seasonDay
    };
  },

  load: function(data) {
    this.timeOfDay = data.timeOfDay;
    this.day = data.day;
    this.season = data.season;
    this.seasonDay = data.seasonDay;
  }
};

console.log('[FarmingSystem] 💾 Systems loaded');