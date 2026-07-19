/**
 * BuildingsSystem.js - نظام المباني المتقدم
 * Farm Game 3D - Production Quality
 * 
 * يدعم:
 * - 8 أنواع مباني (منزل، إسطبل، دجاجة، إسطبل حصان، بيت زجاجي، مستودع، ورشة، بئر)
 * - نظام ترقيات (مستوى 1-3) لكل مبنى
 * - مواد بناء مطلوبة لكل مبنى وترقيته
 * - فايدة فريدة لكل مبنى (تخزين، حيوانات، زراعة شتوية، حرف)
 * - حجم على الخريطة (footprint)
 * - بناء وترقيات وحصاد يومي
 * - حفظ وتحميل الحالة
 * - تكامل مع الأنظمة الأخرى (FarmingSystem, AnimalsSystem, TimeSystem)
 */

var GAME = GAME || {};

// ============================================================
// 🏠 بيانات المباني
// ============================================================
GAME.BUILDINGS_DATA = {
  house: {
    name: 'House', nameAr: 'المنزل',
    icon: '🏠',
    description: 'المنزل الرئيسي - يخزّن الأغراض ويوفر مبيت',
    descriptionAr: 'المنزل الرئيسي - يخزّن الأغراض ويوفر مبيت',
    maxLevel: 3,
    footprint: { width: 4, depth: 4 }, // حجم على الخريطة (مربعات)
    position: { x: 0, z: 0 }, // الموقع الافتراضي
    // تكلفة البناء لكل مستوى
    levels: {
      1: {
        name: 'House Lv.1', nameAr: 'المنزل - المستوى 1',
        cost: 1000,
        materials: { wood: 20, stone: 10, nails: 5 },
        storageCapacity: 20,   // مكان إضافي في المخزون
        maxEnergy: 100,        // الطاقة القصوى
        comfort: 10,           // الراحة (تستعيد الطاقة أسرع)
        description: 'بيت بسيط مع مخزون أساسي',
        buildTime: 1 // أيام للبناء
      },
      2: {
        name: 'House Lv.2', nameAr: 'المنزل - المستوى 2',
        cost: 3000,
        materials: { wood: 40, stone: 25, nails: 15, glass: 5 },
        storageCapacity: 40,
        maxEnergy: 150,
        comfort: 25,
        description: 'منزل أكبر مع مخزون متوسط',
        buildTime: 2
      },
      3: {
        name: 'House Lv.3', nameAr: 'المنزل - المستوى 3',
        cost: 8000,
        materials: { wood: 80, stone: 50, nails: 30, glass: 15, iron: 10 },
        storageCapacity: 80,
        maxEnergy: 200,
        comfort: 50,
        description: 'منزل فاخر مع مخزون ضخم',
        buildTime: 3
      }
    }
  },

  barn: {
    name: 'Barn', nameAr: 'الإسطبل',
    icon: '🐄',
    description: 'للحيوانات الكبيرة - بقر وخنازير',
    descriptionAr: 'للحيوانات الكبيرة - بقر وخنازير',
    maxLevel: 3,
    footprint: { width: 5, depth: 4 },
    position: { x: 15, z: -8 },
    levels: {
      1: {
        name: 'Barn Lv.1', nameAr: 'الإسطبل - المستوى 1',
        cost: 1500,
        materials: { wood: 30, stone: 15, hay: 10 },
        animalCapacity: 4,    // عدد الحيوانات المدعومة
        autoFeeder: false,    // إطعام تلقائي
        hayStorage: 20,       // تخزين العلف
        description: 'إسطبل بسيط يتسع 4 حيوانات',
        buildTime: 2
      },
      2: {
        name: 'Barn Lv.2', nameAr: 'الإسطبل - المستوى 2',
        cost: 5000,
        materials: { wood: 60, stone: 30, hay: 25, iron: 5 },
        animalCapacity: 8,
        autoFeeder: true,
        hayStorage: 50,
        description: 'إسطبل أكبر مع إطعام تلقائي',
        buildTime: 3
      },
      3: {
        name: 'Barn Lv.3', nameAr: 'الإسطبل - المستوى 3',
        cost: 12000,
        materials: { wood: 100, stone: 60, hay: 50, iron: 15, glass: 10 },
        animalCapacity: 12,
        autoFeeder: true,
        hayStorage: 100,
        breedingBonus: 0.02, // زيادة فرصة التكاثر
        description: 'إسطبل فاخر يتسع 12 حيوان مع تكاثر محسّن',
        buildTime: 4
      }
    }
  },

  coop: {
    name: 'Coop', nameAr: 'الدجاجة',
    icon: '🐔',
    description: 'للحيوانات الصغيرة - دجاج وبط',
    descriptionAr: 'للحيوانات الصغيرة - دجاج وبط',
    maxLevel: 3,
    footprint: { width: 4, depth: 3 },
    position: { x: -12, z: -10 },
    levels: {
      1: {
        name: 'Coop Lv.1', nameAr: 'الدجاجة - المستوى 1',
        cost: 800,
        materials: { wood: 15, hay: 8, nails: 3 },
        animalCapacity: 4,
        autoFeeder: false,
        eggCollection: false, // جمع بيض تلقائي
        description: 'دجاجة بسيطة يتسع 4 حيوانات',
        buildTime: 1
      },
      2: {
        name: 'Coop Lv.2', nameAr: 'الدجاجة - المستوى 2',
        cost: 2500,
        materials: { wood: 35, hay: 20, nails: 10, iron: 3 },
        animalCapacity: 8,
        autoFeeder: true,
        eggCollection: true,
        description: 'دجاجة أكبر مع جمع بيض تلقائي',
        buildTime: 2
      },
      3: {
        name: 'Coop Lv.3', nameAr: 'الدجاجة - المستوى 3',
        cost: 6000,
        materials: { wood: 60, hay: 40, nails: 20, iron: 8, glass: 5 },
        animalCapacity: 12,
        autoFeeder: true,
        eggCollection: true,
        breedingBonus: 0.03,
        description: 'دجاجة فاخرة مع تكاثر محسّن',
        buildTime: 3
      }
    }
  },

  stable: {
    name: 'Stable', nameAr: 'إسطبل الحصان',
    icon: '🐴',
    description: 'لإسطبل الحصان - يمكن ركوب الحصان',
    descriptionAr: 'لإسطبل الحصان - يمكن ركوب الحصان',
    maxLevel: 3,
    footprint: { width: 4, depth: 5 },
    position: { x: 0, z: -18 },
    levels: {
      1: {
        name: 'Stable Lv.1', nameAr: 'الإسطبل - المستوى 1',
        cost: 3000,
        materials: { wood: 40, hay: 20, iron: 5, nails: 10 },
        animalCapacity: 2,
        autoFeeder: false,
        mountSpeedBonus: 0,   // لا يوجد مكافأة سرعة
        description: 'إسطبل يتسع حصانين',
        buildTime: 2
      },
      2: {
        name: 'Stable Lv.2', nameAr: 'الإسطبل - المستوى 2',
        cost: 8000,
        materials: { wood: 70, hay: 40, iron: 15, nails: 20, glass: 5 },
        animalCapacity: 4,
        autoFeeder: true,
        mountSpeedBonus: 1.0, // زيادة سرعة الحصان
        description: 'إسطبل أكبر مع زيادة سرعة الحصان',
        buildTime: 3
      },
      3: {
        name: 'Stable Lv.3', nameAr: 'الإسطبل - المستوى 3',
        cost: 15000,
        materials: { wood: 120, hay: 60, iron: 30, nails: 30, glass: 15 },
        animalCapacity: 6,
        autoFeeder: true,
        mountSpeedBonus: 2.0,
        description: 'إسطبل فاخر مع سرعة حصان عالية',
        buildTime: 4
      }
    }
  },

  greenhouse: {
    name: 'Greenhouse', nameAr: 'البيت الزجاجي',
    icon: '🌿',
    description: 'للزراعة في الشتاء - يمكن زراعة أي محصول',
    descriptionAr: 'للزراعة في الشتاء - يمكن زراعة أي محصول',
    maxLevel: 3,
    footprint: { width: 6, depth: 5 },
    position: { x: -18, z: 5 },
    levels: {
      1: {
        name: 'Greenhouse Lv.1', nameAr: 'البيت الزجاجي - المستوى 1',
        cost: 5000,
        materials: { wood: 30, stone: 10, glass: 20, iron: 5 },
        plotCount: 12,          // عدد قطع الأرض المتاحة
        growthBonus: 1.0,       // لا يوجد مكافأة
        seasonOverride: true,   // يسمح بالزراعة في أي موسم
        description: 'بيت زجاجي بسيط مع 12 قطعة أرض',
        buildTime: 3
      },
      2: {
        name: 'Greenhouse Lv.2', nameAr: 'البيت الزجاجي - المستوى 2',
        cost: 12000,
        materials: { wood: 50, stone: 20, glass: 40, iron: 10, clay: 10 },
        plotCount: 24,
        growthBonus: 1.3,       // 30% زيادة في النمو
        seasonOverride: true,
        irrigation: true,       // سقي تلقائي
        description: 'بيت زجاجي أكبر مع سقي تلقائي',
        buildTime: 4
      },
      3: {
        name: 'Greenhouse Lv.3', nameAr: 'البيت الزجاجي - المستوى 3',
        cost: 25000,
        materials: { wood: 80, stone: 40, glass: 60, iron: 20, clay: 20, gold: 5 },
        plotCount: 36,
        growthBonus: 1.6,       // 60% زيادة في النمو
        seasonOverride: true,
        irrigation: true,
        qualityBonus: 1.5,      // زيادة جودة المحاصيل
        description: 'بيت زجاجي فاخر مع نمو محسّن وجودة عالية',
        buildTime: 5
      }
    }
  },

  warehouse: {
    name: 'Warehouse', nameAr: 'المستودع',
    icon: '📦',
    description: 'لتخزين الأغراض الزائدة',
    descriptionAr: 'لتخزين الأغراض الزائدة',
    maxLevel: 3,
    footprint: { width: 3, depth: 3 },
    position: { x: 12, z: 8 },
    levels: {
      1: {
        name: 'Warehouse Lv.1', nameAr: 'المستودع - المستوى 1',
        cost: 1000,
        materials: { wood: 15, nails: 5 },
        storageCapacity: 50,   // أماكن تخزين إضافية
        categories: ['crops', 'seeds'], // فئات التخزين
        description: 'مستودع بسيط لتخزين المحاصيل والبذور',
        buildTime: 1
      },
      2: {
        name: 'Warehouse Lv.2', nameAr: 'المستودع - المستوى 2',
        cost: 3000,
        materials: { wood: 30, nails: 15, iron: 5, stone: 10 },
        storageCapacity: 120,
        categories: ['crops', 'seeds', 'tools', 'fertilizer'],
        description: 'مستودع أكبر مع فئات تخزين متعددة',
        buildTime: 2
      },
      3: {
        name: 'Warehouse Lv.3', nameAr: 'المستودع - المستوى 3',
        cost: 7000,
        materials: { wood: 60, nails: 30, iron: 15, stone: 25, glass: 5 },
        storageCapacity: 250,
        categories: ['crops', 'seeds', 'tools', 'fertilizer', 'animal_products', 'crafting'],
        autoSorting: true,     // فرز تلقائي
        description: 'مستودع ضخم مع فرز تلقائي',
        buildTime: 3
      }
    }
  },

  workshop: {
    name: 'Workshop', nameAr: 'الورشة',
    icon: '🔨',
    description: 'لصناعة الأدوات والأشياء',
    descriptionAr: 'لصناعة الأدوات والأشياء',
    maxLevel: 3,
    footprint: { width: 4, depth: 3 },
    position: { x: -8, z: 10 },
    levels: {
      1: {
        name: 'Workshop Lv.1', nameAr: 'الورشة - المستوى 1',
        cost: 2000,
        materials: { wood: 25, stone: 15, iron: 5, nails: 10 },
        craftingSlots: 4,       // عدد أ_slots الصنعة المتاحة
        recipes: ['basic_tools', 'basic_fertilizer'], // وصفات متاحة
        craftingSpeed: 1.0,     // سرعة الصنعة
        description: 'ورشة بسيطة لأدوات أساسية',
        buildTime: 2
      },
      2: {
        name: 'Workshop Lv.2', nameAr: 'الورشة - المستوى 2',
        cost: 6000,
        materials: { wood: 50, stone: 30, iron: 15, nails: 20, coal: 10 },
        craftingSlots: 8,
        recipes: ['basic_tools', 'basic_fertilizer', 'advanced_tools', 'fences', 'sprinklers'],
        craftingSpeed: 1.5,
        autoCraft: false,       // صنعة تلقائية (غير متاح بعد)
        description: 'ورشة أكبر مع أدوات متقدمة',
        buildTime: 3
      },
      3: {
        name: 'Workshop Lv.3', nameAr: 'الورشة - المستوى 3',
        cost: 15000,
        materials: { wood: 80, stone: 50, iron: 30, nails: 40, coal: 25, gold: 5 },
        craftingSlots: 16,
        recipes: ['basic_tools', 'basic_fertilizer', 'advanced_tools', 'fences', 'sprinklers', 'machines', 'decorations'],
        craftingSpeed: 2.0,
        autoCraft: true,
        description: 'ورشة احترافية مع صنعة تلقائية',
        buildTime: 4
      }
    }
  },

  well: {
    name: 'Well', nameAr: 'البئر',
    icon: '💧',
    description: 'للماء - يملأ الحوض تلقائياً',
    descriptionAr: 'للماء - يملأ الحوض تلقائياً',
    maxLevel: 3,
    footprint: { width: 2, depth: 2 },
    position: { x: 8, z: 12 },
    levels: {
      1: {
        name: 'Well Lv.1', nameAr: 'البئر - المستوى 1',
        cost: 500,
        materials: { stone: 10, wood: 5 },
        waterCapacity: 50,      // سعة الماء
        refillRate: 10,         // ملء كل يوم (وحدة ماء)
        irrigationRange: 0,     // لا يوجد ري
        description: 'بئر بسيط للماء',
        buildTime: 1
      },
      2: {
        name: 'Well Lv.2', nameAr: 'البئر - المستوى 2',
        cost: 2000,
        materials: { stone: 25, wood: 10, iron: 5, clay: 5 },
        waterCapacity: 120,
        refillRate: 25,
        irrigationRange: 5,     // ري قطع أرض قريبة
        description: 'بئر أكبر مع ري تلقائي',
        buildTime: 2
      },
      3: {
        name: 'Well Lv.3', nameAr: 'البئر - المستوى 3',
        cost: 5000,
        materials: { stone: 50, wood: 20, iron: 15, clay: 15, glass: 5 },
        waterCapacity: 250,
        refillRate: 50,
        irrigationRange: 10,    // ري منطقة واسعة
        qualityWater: true,     // ماء عالي الجودة (يزيد نمو المحاصيل)
        description: 'بئر ضخم مع ري منطقة واسعة',
        buildTime: 3
      }
    }
  }
};

// ============================================================
// 🪵 بيانات المواد الخام (Materials)
// ============================================================
GAME.BUILDING_MATERIALS = {
  wood: { name: 'Wood', nameAr: 'خشب', icon: '🪵', buyPrice: 5 },
  stone: { name: 'Stone', nameAr: 'حجر', icon: '🪨', buyPrice: 8 },
  iron: { name: 'Iron', nameAr: 'حديد', icon: '⚙️', buyPrice: 20 },
  nails: { name: 'Nails', nameAr: 'مسامير', icon: '📌', buyPrice: 3 },
  hay: { name: 'Hay', nameAr: 'تبن', icon: '🌾', buyPrice: 4 },
  glass: { name: 'Glass', nameAr: 'زجاج', icon: '🪟', buyPrice: 15 },
  clay: { name: 'Clay', nameAr: 'طين', icon: '🧱', buyPrice: 6 },
  coal: { name: 'Coal', nameAr: 'فحم', icon: '⚫', buyPrice: 12 },
  gold: { name: 'Gold', nameAr: 'ذهب', icon: '✨', buyPrice: 50 }
};

// ============================================================
// 🏗️ نظام المباني الرئيسي
// ============================================================
GAME.BuildingsSystem = {
  buildings: {},      // المباني المبنية { type: { level, position, mesh, ... } }
  constructionQueue: [], // طابور البناء الجاري
  scene: null,
  buildingMeshMap: new Map(),
  plotMeshMap: new Map(),   // خريطة قطع أرض البيت الزجاجي
  wellMeshMap: new Map(),

  // تهيئة النظام
  init: function(scene) {
    this.scene = scene;
    this.buildings = {};
    this.constructionQueue = [];
    this.buildingMeshMap.clear();
    this.plotMeshMap.clear();
    this.wellMeshMap.clear();

    // إنشاء المباني الافتراضية (المنزل موجود دائماً)
    this.buildings.house = {
      type: 'house',
      level: 1,
      constructed: true,
      constructing: false,
      constructionProgress: 0,
      constructionDaysLeft: 0,
      mesh: null,
      plots: [],       // قطع أرض البيت الزجاجي
      storageBonus: 0
    };

    // إنشاء visual للمنزل
    this._createBuildingVisual('house');

    console.log('[BuildingsSystem] ✅ Initialized with ' + Object.keys(GAME.BUILDINGS_DATA).length + ' building types');
  },

  // ============================================================
  // 🔨 بناء وترقيات
  // ============================================================

  // التحقق من إمكانية بناء مبنى
  canBuild: function(buildingType) {
    var buildingData = GAME.BUILDINGS_DATA[buildingType];
    if (!buildingData) return { can: false, reason: 'نوع مبنى غير معروف' };

    // التحقق من عدم وجود المبنى بالفعل
    if (this.buildings[buildingType] && this.buildings[buildingType].constructed) {
      return { can: false, reason: 'المبنى موجود بالفعل' };
    }

    // التحقق من عدم البناء الجاري
    if (this.buildings[buildingType] && this.buildings[buildingType].constructing) {
      return { can: false, reason: 'البناء جاري بالفعل' };
    }

    // التحقق من المواد والمال
    var level1 = buildingData.levels[1];
    var playerMaterials = GAME.game.state.inventory.materials || {};
    var missingMaterials = [];

    for (var mat in level1.materials) {
      if ((playerMaterials[mat] || 0) < level1.materials[mat]) {
        missingMaterials.push(GAME.BUILDING_MATERIALS[mat].nameAr + ': ' + 
          level1.materials[mat] + ' (يوجد ' + (playerMaterials[mat] || 0) + ')');
      }
    }

    if (GAME.game.state.money < level1.cost) {
      missingMaterials.push('المال: $' + level1.cost + ' (يوجد $' + GAME.game.state.money + ')');
    }

    if (missingMaterials.length > 0) {
      return { can: false, reason: 'مواد ناقصة:\n' + missingMaterials.join('\n') };
    }

    return { can: true };
  },

  // بناء مبنى جديد
  build: function(buildingType) {
    var check = this.canBuild(buildingType);
    if (!check.can) {
      GAME.ui.showNotification('❌ ' + check.reason, 'error');
      return false;
    }

    var buildingData = GAME.BUILDINGS_DATA[buildingType];
    var level1 = buildingData.levels[1];

    // خصم المواد
    var playerMaterials = GAME.game.state.inventory.materials || {};
    for (var mat in level1.materials) {
      playerMaterials[mat] = (playerMaterials[mat] || 0) - level1.materials[mat];
    }
    GAME.game.state.money -= level1.cost;

    // إنشاء سجل المبنى
    this.buildings[buildingType] = {
      type: buildingType,
      level: 1,
      constructed: level1.buildTime <= 0,
      constructing: level1.buildTime > 0,
      constructionProgress: 0,
      constructionDaysLeft: level1.buildTime,
      mesh: null,
      plots: [],
      storageBonus: 0
    };

    // إذا كان البناء فوري
    if (level1.buildTime <= 0) {
      this._completeConstruction(buildingType);
    } else {
      // إضافة للطابور
      this.constructionQueue.push({
        type: buildingType,
        daysLeft: level1.buildTime,
        totalDays: level1.buildTime
      });

      GAME.ui.showNotification('🔨 Building ' + buildingData.nameAr + '... (' + level1.buildTime + ' days)', 'info');
    }

    GAME.game.addXP(25);
    GAME.quests.track('build', 1);
    GAME.game.state.stats.totalBuildingsBuilt = (GAME.game.state.stats.totalBuildingsBuilt || 0) + 1;

    return true;
  },

  // التحقق من إمكانية الترقية
  canUpgrade: function(buildingType) {
    var building = this.buildings[buildingType];
    if (!building || !building.constructed) {
      return { can: false, reason: 'المبنى غير موجود أو لم يكتمل بناؤه' };
    }

    var buildingData = GAME.BUILDINGS_DATA[buildingType];
    var nextLevel = building.level + 1;

    if (nextLevel > buildingData.maxLevel) {
      return { can: false, reason: 'المبنى في أعلى مستوى' };
    }

    var levelData = buildingData.levels[nextLevel];

    // التحقق من المواد والمال
    var playerMaterials = GAME.game.state.inventory.materials || {};
    var missingMaterials = [];

    for (var mat in levelData.materials) {
      if ((playerMaterials[mat] || 0) < levelData.materials[mat]) {
        missingMaterials.push(GAME.BUILDING_MATERIALS[mat].nameAr + ': ' + 
          levelData.materials[mat] + ' (يوجد ' + (playerMaterials[mat] || 0) + ')');
      }
    }

    if (GAME.game.state.money < levelData.cost) {
      missingMaterials.push('المال: $' + levelData.cost + ' (يوجد $' + GAME.game.state.money + ')');
    }

    if (missingMaterials.length > 0) {
      return { can: false, reason: 'مواد ناقصة:\n' + missingMaterials.join('\n') };
    }

    return { can: true, nextLevel: nextLevel };
  },

  // ترقية مبنى
  upgrade: function(buildingType) {
    var check = this.canUpgrade(buildingType);
    if (!check.can) {
      GAME.ui.showNotification('❌ ' + check.reason, 'error');
      return false;
    }

    var building = this.buildings[buildingType];
    var buildingData = GAME.BUILDINGS_DATA[buildingType];
    var levelData = buildingData.levels[check.nextLevel];

    // خصم المواد
    var playerMaterials = GAME.game.state.inventory.materials || {};
    for (var mat in levelData.materials) {
      playerMaterials[mat] = (playerMaterials[mat] || 0) - levelData.materials[mat];
    }
    GAME.game.state.money -= levelData.cost;

    // بدء الترقية
    building.constructing = true;
    building.constructionDaysLeft = levelData.buildTime;
    building.constructionProgress = 0;

    // إضافة للطابور
    this.constructionQueue.push({
      type: buildingType,
      daysLeft: levelData.buildTime,
      totalDays: levelData.buildTime,
      isUpgrade: true,
      targetLevel: check.nextLevel
    });

    GAME.ui.showNotification('🔨 Upgrading ' + buildingData.nameAr + ' to Lv.' + check.nextLevel + '...', 'info');
    GAME.game.addXP(30);

    return true;
  },

  // إكمال البناء أو الترقية
  _completeConstruction: function(buildingType) {
    var building = this.buildings[buildingType];
    if (!building) return;

    var buildingData = GAME.BUILDINGS_DATA[buildingType];
    var levelData = buildingData.levels[building.level];

    building.constructed = true;
    building.constructing = false;
    building.constructionDaysLeft = 0;
    building.constructionProgress = 100;

    // تطبيق مكافآت المستوى
    this._applyLevelBonuses(buildingType);

    // إنشاء الـ visual
    this._createBuildingVisual(buildingType);

    // إذا كان البيت الزجاجي - إنشاء قطع الأرض
    if (buildingType === 'greenhouse') {
      this._createGreenhousePlots(buildingType);
    }

    GAME.ui.showNotification('✅ ' + buildingData.nameAr + ' constructed! Lv.' + building.level, 'success');
    GAME.game.addXP(50);
    GAME.quests.track('constructBuilding', 1);
  },

  // تطبيق مكافآت المستوى
  _applyLevelBonuses: function(buildingType) {
    var building = this.buildings[buildingType];
    var buildingData = GAME.BUILDINGS_DATA[buildingType];
    var levelData = buildingData.levels[building.level];

    switch (buildingType) {
      case 'house':
        // زيادة الطاقة القصوى والتخزين
        GAME.game.state.maxEnergy = levelData.maxEnergy;
        GAME.game.state.inventoryCapacity = (GAME.game.state.inventoryCapacity || 20) + levelData.storageCapacity;
        break;

      case 'barn':
        // تحديث سعة الحيوانات
        if (GAME.AnimalsSystem && GAME.AnimalsSystem.buildings.barn) {
          GAME.AnimalsSystem.buildings.barn.capacity = levelData.animalCapacity;
        }
        break;

      case 'coop':
        // تحديث سعة الحيوانات
        if (GAME.AnimalsSystem && GAME.AnimalsSystem.buildings.coop) {
          GAME.AnimalsSystem.buildings.coop.capacity = levelData.animalCapacity;
        }
        break;

      case 'stable':
        // تحديث سعة الحيوانات وسرعة الحصان
        if (GAME.AnimalsSystem && GAME.AnimalsSystem.buildings.stable) {
          GAME.AnimalsSystem.buildings.stable.capacity = levelData.animalCapacity;
        }
        break;

      case 'greenhouse':
        // سيتم تطبيقه عند إنشاء قطع الأرض
        break;

      case 'warehouse':
        // زيادة التخزين
        GAME.game.state.inventoryCapacity = (GAME.game.state.inventoryCapacity || 20) + levelData.storageCapacity;
        break;

      case 'workshop':
        // تحديث سرعة الصنعة والوصفيات
        if (GAME.CraftingSystem) {
          GAME.CraftingSystem.craftingSpeed = levelData.craftingSpeed;
          GAME.CraftingSystem.slots = levelData.craftingSlots;
        }
        break;

      case 'well':
        // تحديث سعة الماء ومدى الري
        break;
    }
  },

  // ============================================================
  // 🌿 البيت الزجاجي - قطع أرض
  // ============================================================

  // إنشاء قطع أرض البيت الزجاجي
  _createGreenhousePlots: function(buildingType) {
    var building = this.buildings[buildingType];
    var buildingData = GAME.BUILDINGS_DATA[buildingType];
    var levelData = buildingData.levels[building.level];
    var pos = buildingData.position;

    // مسح القطع القديمة
    for (var i = 0; i < building.plots.length; i++) {
      if (building.plots[i].mesh) {
        this.scene.remove(building.plots[i].mesh);
      }
    }
    building.plots = [];

    // حساب تخطيط القطع
    var plotsPerRow = Math.ceil(Math.sqrt(levelData.plotCount));
    var rows = Math.ceil(levelData.plotCount / plotsPerRow);
    var plotSize = 1.8;
    var gap = 0.3;
    var startX = pos.x - (plotsPerRow * (plotSize + gap)) / 2 + plotSize / 2;
    var startZ = pos.z - (rows * (plotSize + gap)) / 2 + plotSize / 2;

    var plotIndex = 0;
    for (var row = 0; row < rows && plotIndex < levelData.plotCount; row++) {
      for (var col = 0; col < plotsPerRow && plotIndex < levelData.plotCount; col++) {
        var plotX = startX + col * (plotSize + gap);
        var plotZ = startZ + row * (plotSize + gap);

        var plot = {
          id: 'greenhouse_' + plotIndex,
          x: plotX,
          z: plotZ,
          state: 'empty',
          crop: null,
          growthProgress: 0,
          growthStage: 0,
          watered: false,
          fertilized: false,
          fertilizerType: null,
          wateredToday: false,
          quality: 'normal',
          mesh: null
        };

        // إنشاء visual للقطعة
        this._createGreenhousePlotVisual(plot);
        building.plots.push(plot);
        plotIndex++;
      }
    }

    console.log('[BuildingsSystem] 🌿 Created ' + building.plots.length + ' greenhouse plots');
  },

  // إنشاء visual لقطة البيت الزجاجي
  _createGreenhousePlotVisual: function(plot) {
    if (!this.scene) return;

    var emptyMat = new THREE.MeshLambertMaterial({ color: 0x3a5f0b });
    var emptyGeo = new THREE.BoxGeometry(1.6, 0.12, 1.6);
    var mesh = new THREE.Mesh(emptyGeo, emptyMat);
    mesh.position.set(plot.x, 0.06, plot.z);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    this.scene.add(mesh);
    plot.mesh = mesh;
    this.plotMeshMap.set(plot.id, mesh);
  },

  // ============================================================
  // 💧 البئر - ري تلقائي
  // ============================================================

  // ري الأراضي القريبة من البئر
  irrigateNearbyPlots: function() {
    var building = this.buildings.well;
    if (!building || !building.constructed) return;

    var buildingData = GAME.BUILDINGS_DATA.well;
    var levelData = buildingData.levels[building.level];
    var pos = buildingData.position;
    var range = levelData.irrigationRange;

    if (range <= 0) return;

    // ري قطع الأرض في الزراعة العادية
    if (GAME.FarmingSystem) {
      for (var i = 0; i < GAME.FarmingSystem.plots.length; i++) {
        var plot = GAME.FarmingSystem.plots[i];
        var dx = plot.x - pos.x;
        var dz = plot.z - pos.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        if (dist <= range && !plot.wateredToday) {
          plot.watered = true;
          plot.wateredToday = true;
          if (plot.mesh && plot.mesh.material) {
            plot.mesh.material.color.setHex(0x4fc3f7);
          }
        }
      }
    }

    // ري قطع الأرض في البيت الزجاجي
    var greenhouse = this.buildings.greenhouse;
    if (greenhouse && greenhouse.constructed) {
      for (var i = 0; i < greenhouse.plots.length; i++) {
        var plot = greenhouse.plots[i];
        if (!plot.wateredToday) {
          plot.watered = true;
          plot.wateredToday = true;
          if (plot.mesh && plot.mesh.material) {
            plot.mesh.material.color.setHex(0x4fc3f7);
          }
        }
      }
    }
  },

  // ============================================================
  // 📦 المستودع - تخزين
  // ============================================================

  // الحصول على سعة التخزين الإضافية
  getStorageBonus: function() {
    var totalBonus = 0;

    // المنزل
    if (this.buildings.house && this.buildings.house.constructed) {
      var houseData = GAME.BUILDINGS_DATA.house.levels[this.buildings.house.level];
      totalBonus += houseData.storageCapacity;
    }

    // المستودع
    if (this.buildings.warehouse && this.buildings.warehouse.constructed) {
      var warehouseData = GAME.BUILDINGS_DATA.warehouse.levels[this.buildings.warehouse.level];
      totalBonus += warehouseData.storageCapacity;
    }

    return totalBonus;
  },

  // ============================================================
  // 🔨 الورشة - صنعة
  // ============================================================

  // التحقق من وجود ورشة ووصفيات الصنعة
  getAvailableRecipes: function() {
    if (!this.buildings.workshop || !this.buildings.workshop.constructed) {
      return [];
    }

    var workshopData = GAME.BUILDINGS_DATA.workshop.levels[this.buildings.workshop.level];
    return workshopData.recipes || [];
  },

  // الحصول على سرعة الصنعة
  getCraftingSpeed: function() {
    if (!this.buildings.workshop || !this.buildings.workshop.constructed) {
      return 0.5; // سرعة بطيئة بدون ورشة
    }

    var workshopData = GAME.BUILDINGS_DATA.workshop.levels[this.buildings.workshop.level];
    return workshopData.craftingSpeed;
  },

  // ============================================================
  // 📅 تحديث يومي
  // ============================================================

  // تطبيق التحديثات اليومية
  applyDailyUpdate: function() {
    var completedBuildings = [];

    // تحديث طابور البناء
    for (var i = this.constructionQueue.length - 1; i >= 0; i--) {
      var job = this.constructionQueue[i];
      job.daysLeft--;

      var building = this.buildings[job.type];
      if (building) {
        building.constructionDaysLeft = job.daysLeft;
        building.constructionProgress = Math.floor(((job.totalDays - job.daysLeft) / job.totalDays) * 100);
      }

      if (job.daysLeft <= 0) {
        // إكمال البناء
        if (job.isUpgrade) {
          building.level = job.targetLevel;
          building.constructing = false;
          building.constructed = true;
          building.constructionDaysLeft = 0;
          building.constructionProgress = 100;

          this._applyLevelBonuses(job.type);

          if (job.type === 'greenhouse') {
            this._createGreenhousePlots(job.type);
          }

          var buildingData = GAME.BUILDINGS_DATA[job.type];
          GAME.ui.showNotification('✅ ' + buildingData.nameAr + ' upgraded to Lv.' + building.level + '!', 'success');
          GAME.game.addXP(50);
        } else {
          this._completeConstruction(job.type);
        }

        completedBuildings.push(job.type);
        this.constructionQueue.splice(i, 1);
      }
    }

    // الري التلقائي من البئر
    this.irrigateNearbyPlots();

    // تحديث العلف التلقائي للحيوانات (إذا كان المبنى يدعمه)
    this._updateAutoFeeders();

    // تحديث البيت الزجاجي (نمو المحاصيل في الشتاء)
    this._updateGreenhouseGrowth();

    if (completedBuildings.length > 0) {
      console.log('[BuildingsSystem] 📅 Completed buildings: ' + completedBuildings.join(', '));
    }
  },

  // تحديث الإطعام التلقائي
  _updateAutoFeeders: function() {
    if (!GAME.AnimalsSystem) return;

    // Barn
    if (this.buildings.barn && this.buildings.barn.constructed) {
      var barnData = GAME.BUILDINGS_DATA.barn.levels[this.buildings.barn.level];
      if (barnData.autoFeeder) {
        var barnAnimals = GAME.AnimalsSystem.getAnimalsInBuilding('barn');
        for (var i = 0; i < barnAnimals.length; i++) {
          if (!barnAnimals[i].isFedToday) {
            barnAnimals[i].isFedToday = true;
            barnAnimals[i].hunger = Math.min(100, barnAnimals[i].hunger + 30);
          }
        }
      }
    }

    // Coop
    if (this.buildings.coop && this.buildings.coop.constructed) {
      var coopData = GAME.BUILDINGS_DATA.coop.levels[this.buildings.coop.level];
      if (coopData.autoFeeder) {
        var coopAnimals = GAME.AnimalsSystem.getAnimalsInBuilding('coop');
        for (var i = 0; i < coopAnimals.length; i++) {
          if (!coopAnimals[i].isFedToday) {
            coopAnimals[i].isFedToday = true;
            coopAnimals[i].hunger = Math.min(100, coopAnimals[i].hunger + 30);
          }
        }
      }
    }

    // Stable
    if (this.buildings.stable && this.buildings.stable.constructed) {
      var stableData = GAME.BUILDINGS_DATA.stable.levels[this.buildings.stable.level];
      if (stableData.autoFeeder) {
        var stableAnimals = GAME.AnimalsSystem.getAnimalsInBuilding('stable');
        for (var i = 0; i < stableAnimals.length; i++) {
          if (!stableAnimals[i].isFedToday) {
            stableAnimals[i].isFedToday = true;
            stableAnimals[i].hunger = Math.min(100, stableAnimals[i].hunger + 30);
          }
        }
      }
    }
  },

  // تحديث نمو البيت الزجاجي
  _updateGreenhouseGrowth: function() {
    var greenhouse = this.buildings.greenhouse;
    if (!greenhouse || !greenhouse.constructed) return;

    var buildingData = GAME.BUILDINGS_DATA.greenhouse;
    var levelData = buildingData.levels[greenhouse.level];

    for (var i = 0; i < greenhouse.plots.length; i++) {
      var plot = greenhouse.plots[i];
      if (plot.state !== 'planted' || !plot.crop) continue;

      var cropData = GAME.CROPS_DATA[plot.crop];
      if (!cropData) continue;

      // حساب معدل النمو
      var growthRate = 100 / (cropData.daysToGrow * 24);
      growthRate *= levelData.growthBonus;

      if (plot.watered) growthRate *= cropData.waterBonus || 1.5;
      if (plot.fertilized && plot.fertilizerType) {
        var fertData = GAME.FERTILIZERS_DATA[plot.fertilizerType];
        if (fertData) growthRate *= fertData.growthBonus || 1.5;
      }

      // السقي التلقائي
      if (levelData.irrigation) {
        plot.watered = true;
        plot.wateredToday = true;
      }

      plot.growthProgress += growthRate;

      // تحديث مرحلة النمو
      var newStage = Math.min(cropData.stages - 1, Math.floor(plot.growthProgress / 100 * cropData.stages));
      if (newStage !== plot.growthStage) {
        plot.growthStage = newStage;
        this._updateGreenhousePlotVisual(plot);
      }

      // التحقق من الجاهزية
      if (plot.growthProgress >= 100) {
        plot.state = 'ready';
        plot.growthProgress = 100;

        // حساب الجودة
        this._calculateGreenhouseQuality(plot, levelData);

        GAME.ui.showNotification('🌾温室 ' + cropData.nameAr + ' جاهز!', 'success');
      }
    }
  },

  // حساب جودة محصول البيت الزجاجي
  _calculateGreenhouseQuality: function(plot, levelData) {
    var roll = Math.random() * 100;
    var qualityBonus = (levelData.qualityBonus || 1) - 1;
    roll += qualityBonus * 40;

    if (roll >= 95) plot.quality = 'iridium';
    else if (roll >= 80) plot.quality = 'gold';
    else if (roll >= 50) plot.quality = 'silver';
    else plot.quality = 'normal';
  },

  // تحديث visual لقطة البيت الزجاجي
  _updateGreenhousePlotVisual: function(plot) {
    if (!plot.mesh || !plot.crop) return;

    var cropData = GAME.CROPS_DATA[plot.crop];
    var color = 0x228b22;

    if (plot.growthStage >= cropData.stages - 1) {
      // محصول جاهز
      var readyColors = { wheat: 0xdaa520, tomato: 0xff4444, carrot: 0xff8c00, apple: 0xff0000 };
      color = readyColors[plot.crop] || 0x228b22;
    }

    plot.mesh.material.color.setHex(color);
    var scale = 0.3 + (plot.growthStage / cropData.stages) * 0.7;
    plot.mesh.scale.set(scale, scale, scale);
  },

  // ============================================================
  // 🎨 إدارة الـ Visual
  // ============================================================

  // إنشاء الـ visual للمبنى
  _createBuildingVisual: function(buildingType) {
    if (!this.scene) return;

    var buildingData = GAME.BUILDINGS_DATA[buildingType];
    var building = this.buildings[buildingType];
    if (!building || !building.constructed) return;

    var pos = buildingData.position;
    var levelData = buildingData.levels[building.level];
    var footprint = buildingData.footprint;

    var group = new THREE.Group();

    // ألوان المباني حسب النوع
    var buildingColors = {
      house: { wall: 0x8B4513, roof: 0xCC3333, door: 0x5C4033 },
      barn: { wall: 0xB22222, roof: 0x8B0000, door: 0x5C4033 },
      coop: { wall: 0xD2B48C, roof: 0x8B4513, door: 0x5C4033 },
      stable: { wall: 0xA0522D, roof: 0x654321, door: 0x5C4033 },
      greenhouse: { wall: 0x87CEEB, roof: 0x87CEEB, door: 0x5C4033 },
      warehouse: { wall: 0x808080, roof: 0x696969, door: 0x5C4033 },
      workshop: { wall: 0xCD853F, roof: 0x8B4513, door: 0x5C4033 },
      well: { wall: 0x808080, roof: 0x808080, door: null }
    };

    var colors = buildingColors[buildingType] || { wall: 0x808080, roof: 0x606060, door: 0x5C4033 };

    // الارتفاع يعتمد على المستوى
    var wallHeight = 2 + building.level * 0.5;
    var roofHeight = 1.2 + building.level * 0.3;

    if (buildingType === 'well') {
      // تصميم خاص للبئر
      this._createWellVisual(group, pos, colors, building.level);
    } else if (buildingType === 'greenhouse') {
      // تصميم خاص للبيت الزجاجي
      this._createGreenhouseVisual(group, pos, colors, footprint, wallHeight, building.level);
    } else {
      // تصميم المباني العادية
      this._createStandardBuildingVisual(group, pos, colors, footprint, wallHeight, roofHeight, building.level);
    }

    group.position.set(pos.x, 0, pos.z);
    this.scene.add(group);
    building.mesh = group;
    this.buildingMeshMap.set(buildingType, group);
  },

  // إنشاء visual لمبني قياسي
  _createStandardBuildingVisual: function(group, pos, colors, footprint, wallHeight, roofHeight, level) {
    // الجدران
    var wallGeo = new THREE.BoxGeometry(footprint.width, wallHeight, footprint.depth);
    var wallMat = new THREE.MeshLambertMaterial({ color: colors.wall });
    var walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = wallHeight / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // السقف
    var roofGeo = new THREE.ConeGeometry(
      Math.max(footprint.width, footprint.depth) * 0.75,
      roofHeight,
      4
    );
    var roofMat = new THREE.MeshLambertMaterial({ color: colors.roof });
    var roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = wallHeight + roofHeight / 2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // الباب
    if (colors.door) {
      var doorGeo = new THREE.BoxGeometry(0.8, 1.4, 0.1);
      var doorMat = new THREE.MeshLambertMaterial({ color: colors.door });
      var door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 0.7, footprint.depth / 2 + 0.05);
      group.add(door);
    }

    // النافذة
    var windowGeo = new THREE.BoxGeometry(0.6, 0.6, 0.1);
    var windowMat = new THREE.MeshLambertMaterial({ color: 0xADD8E6, transparent: true, opacity: 0.7 });
    
    var leftWindow = new THREE.Mesh(windowGeo, windowMat);
    leftWindow.position.set(-footprint.width * 0.25, wallHeight * 0.6, footprint.depth / 2 + 0.05);
    group.add(leftWindow);

    var rightWindow = new THREE.Mesh(windowGeo, windowMat);
    rightWindow.position.set(footprint.width * 0.25, wallHeight * 0.6, footprint.depth / 2 + 0.05);
    group.add(rightWindow);

    // مؤشر المستوى
    if (level > 1) {
      var starGeo = new THREE.SphereGeometry(0.15, 6, 6);
      var starMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
      for (var i = 0; i < level; i++) {
        var star = new THREE.Mesh(starGeo, starMat);
        star.position.set(-0.3 + i * 0.3, wallHeight + roofHeight + 0.5, 0);
        group.add(star);
      }
    }
  },

  // إنشاء visual للبيت الزجاجي
  _createGreenhouseVisual: function(group, pos, colors, footprint, wallHeight, level) {
    // جدران زجاجية شفافة
    var wallGeo = new THREE.BoxGeometry(footprint.width, wallHeight, footprint.depth);
    var wallMat = new THREE.MeshLambertMaterial({ 
      color: 0x87CEEB, 
      transparent: true, 
      opacity: 0.4 
    });
    var walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = wallHeight / 2;
    walls.receiveShadow = true;
    group.add(walls);

    // إطار معدني
    var frameMat = new THREE.MeshLambertMaterial({ color: 0xA9A9A9 });
    
    // أعمدة الزوايا
    var cornerPositions = [
      { x: -footprint.width / 2, z: -footprint.depth / 2 },
      { x: footprint.width / 2, z: -footprint.depth / 2 },
      { x: -footprint.width / 2, z: footprint.depth / 2 },
      { x: footprint.width / 2, z: footprint.depth / 2 }
    ];

    for (var i = 0; i < cornerPositions.length; i++) {
      var pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, wallHeight + 0.5);
      var pillar = new THREE.Mesh(pillarGeo, frameMat);
      pillar.position.set(cornerPositions[i].x, (wallHeight + 0.5) / 2, cornerPositions[i].z);
      pillar.castShadow = true;
      group.add(pillar);
    }

    // سقف زجاجي
    var roofGeo = new THREE.BoxGeometry(footprint.width + 0.2, 0.1, footprint.depth + 0.2);
    var roofMat = new THREE.MeshLambertMaterial({ color: 0xADD8E6, transparent: true, opacity: 0.5 });
    var roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = wallHeight + 0.25;
    group.add(roof);

    // باب
    var doorGeo = new THREE.BoxGeometry(0.8, 1.4, 0.1);
    var doorMat = new THREE.MeshLambertMaterial({ color: 0x5C4033 });
    var door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.7, footprint.depth / 2 + 0.05);
    group.add(door);

    // مؤشر المستوى
    if (level > 1) {
      var starGeo = new THREE.SphereGeometry(0.15, 6, 6);
      var starMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
      for (var i = 0; i < level; i++) {
        var star = new THREE.Mesh(starGeo, starMat);
        star.position.set(-0.3 + i * 0.3, wallHeight + 0.8, 0);
        group.add(star);
      }
    }
  },

  // إنشاء visual للبئر
  _createWellVisual: function(group, pos, colors, level) {
    var wellRadius = 0.8 + level * 0.2;
    var wellHeight = 0.8 + level * 0.2;

    // حجر البئر الدائري
    var wellGeo = new THREE.CylinderGeometry(wellRadius, wellRadius, wellHeight, 12);
    var wellMat = new THREE.MeshLambertMaterial({ color: 0x808080 });
    var well = new THREE.Mesh(wellGeo, wellMat);
    well.position.y = wellHeight / 2;
    well.castShadow = true;
    well.receiveShadow = true;
    group.add(well);

    // الماء داخل البئر
    var waterGeo = new THREE.CylinderGeometry(wellRadius * 0.85, wellRadius * 0.85, 0.1, 12);
    var waterMat = new THREE.MeshLambertMaterial({ color: 0x4FC3F7, transparent: true, opacity: 0.8 });
    var water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = wellHeight * 0.7;
    group.add(water);

    // سقف البئر ( poles + سقف)
    var poleMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    var leftPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, wellHeight + 1), poleMat);
    leftPole.position.set(-wellRadius * 0.6, (wellHeight + 1) / 2, 0);
    leftPole.castShadow = true;
    group.add(leftPole);

    var rightPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, wellHeight + 1), poleMat);
    rightPole.position.set(wellRadius * 0.6, (wellHeight + 1) / 2, 0);
    rightPole.castShadow = true;
    group.add(rightPole);

    // سقف صغير
    var roofGeo = new THREE.BoxGeometry(wellRadius * 1.6, 0.08, 0.8);
    var roofMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    var roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = wellHeight + 1;
    roof.castShadow = true;
    group.add(roof);

    // دلو
    var bucketGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.2, 8);
    var bucketMat = new THREE.MeshLambertMaterial({ color: 0xA0522D });
    var bucket = new THREE.Mesh(bucketGeo, bucketMat);
    bucket.position.set(0, wellHeight * 0.5, 0);
    group.add(bucket);

    // مؤشر المستوى
    if (level > 1) {
      var starGeo = new THREE.SphereGeometry(0.12, 6, 6);
      var starMat = new THREE.MeshBasicMaterial({ color: 0x4FC3F7 }); // أزرق للماء
      for (var i = 0; i < level; i++) {
        var star = new THREE.Mesh(starGeo, starMat);
        star.position.set(-0.2 + i * 0.2, wellHeight + 1.3, 0);
        group.add(star);
      }
    }
  },

  // ============================================================
  // 🔄 التحديث الرئيسي
  // ============================================================

  update: function(delta) {
    if (!GAME.game || !GAME.game.state || GAME.game.isPaused) return;

    // تحديث يومي عند تغير اليوم
    var currentDay = GAME.TimeSystem ? GAME.TimeSystem.day : 1;
    if (this._lastUpdateDay && this._lastUpdateDay !== currentDay) {
      this.applyDailyUpdate();
    }
    this._lastUpdateDay = currentDay;

    // تحديث تقدم البناء (essler)
    for (var i = 0; i < this.constructionQueue.length; i++) {
      var job = this.constructionQueue[i];
      var building = this.buildings[job.type];
      if (building) {
        building.constructionProgress = Math.floor(((job.totalDays - job.daysLeft) / job.totalDays) * 100);
      }
    }
  },

  // ============================================================
  // 💾 حفظ وتحميل
  // ============================================================

  // حفظ حالة نظام المباني
  save: function() {
    var savedBuildings = {};
    for (var type in this.buildings) {
      var b = this.buildings[type];
      savedBuildings[type] = {
        type: b.type,
        level: b.level,
        constructed: b.constructed,
        constructing: b.constructing,
        constructionProgress: b.constructionProgress,
        constructionDaysLeft: b.constructionDaysLeft,
        plots: b.plots ? b.plots.map(function(p) {
          return {
            id: p.id,
            x: p.x,
            z: p.z,
            state: p.state,
            crop: p.crop,
            growthProgress: p.growthProgress,
            growthStage: p.growthStage,
            watered: p.watered,
            fertilized: p.fertilized,
            fertilizerType: p.fertilizerType,
            quality: p.quality
          };
        }) : []
      };
    }

    return {
      buildings: savedBuildings,
      constructionQueue: this.constructionQueue.map(function(job) {
        return {
          type: job.type,
          daysLeft: job.daysLeft,
          totalDays: job.totalDays,
          isUpgrade: job.isUpgrade || false,
          targetLevel: job.targetLevel || null
        };
      })
    };
  },

  // تحميل حالة نظام المباني
  load: function(data) {
    if (!data) return;

    // مسح المباني الحالية
    for (var type in this.buildings) {
      if (this.buildingMeshMap.has(type)) {
        this.scene.remove(this.buildingMeshMap.get(type));
        this.buildingMeshMap.delete(type);
      }
    }

    this.buildings = {};
    this.constructionQueue = [];
    this.buildingMeshMap.clear();
    this.plotMeshMap.clear();

    // تحميل المباني
    if (data.buildings) {
      for (var type in data.buildings) {
        var savedBuilding = data.buildings[type];
        var buildingData = GAME.BUILDINGS_DATA[type];

        if (!buildingData) continue;

        this.buildings[type] = {
          type: type,
          level: savedBuilding.level,
          constructed: savedBuilding.constructed,
          constructing: savedBuilding.constructing,
          constructionProgress: savedBuilding.constructionProgress,
          constructionDaysLeft: savedBuilding.constructionDaysLeft,
          mesh: null,
          plots: [],
          storageBonus: 0
        };

        // إعادة إنشاء الـ visual إذا كان مبنياً
        if (savedBuilding.constructed) {
          this._createBuildingVisual(type);
          this._applyLevelBonuses(type);

          // إعادة إنشاء قطع الأرض للبيت الزجاجي
          if (type === 'greenhouse' && savedBuilding.plots && savedBuilding.plots.length > 0) {
            var greenhouse = this.buildings[type];
            for (var i = 0; i < savedBuilding.plots.length; i++) {
              var p = savedBuilding.plots[i];
              var plot = {
                id: p.id,
                x: p.x,
                z: p.z,
                state: p.state,
                crop: p.crop,
                growthProgress: p.growthProgress,
                growthStage: p.growthStage,
                watered: p.watered,
                fertilized: p.fertilized,
                fertilizerType: p.fertilizerType,
                quality: p.quality || 'normal',
                wateredToday: false,
                mesh: null
              };
              this._createGreenhousePlotVisual(plot);
              greenhouse.plots.push(plot);
            }
          }
        }
      }
    }

    // تحميل طابور البناء
    if (data.constructionQueue) {
      for (var i = 0; i < data.constructionQueue.length; i++) {
        var job = data.constructionQueue[i];
        this.constructionQueue.push({
          type: job.type,
          daysLeft: job.daysLeft,
          totalDays: job.totalDays,
          isUpgrade: job.isUpgrade || false,
          targetLevel: job.targetLevel || null
        });
      }
    }

    console.log('[BuildingsSystem] 💾 Loaded ' + Object.keys(this.buildings).length + ' buildings');
  },

  // ============================================================
  // 🔧 دوال مساعدة
  // ============================================================

  // الحصول على مبنى
  getBuilding: function(buildingType) {
    return this.buildings[buildingType] || null;
  },

  // التحقق من وجود مبنى
  hasBuilding: function(buildingType) {
    return this.buildings[buildingType] && this.buildings[buildingType].constructed;
  },

  // الحصول على مستوى المبنى
  getBuildingLevel: function(buildingType) {
    var building = this.buildings[buildingType];
    return building ? building.level : 0;
  },

  // الحصول على جميع المبانيConstructed
  getConstructedBuildings: function() {
    var constructed = [];
    for (var type in this.buildings) {
      if (this.buildings[type].constructed) {
        constructed.push(type);
      }
    }
    return constructed;
  },

  // الحصول على إحصائيات النظام
  getStats: function() {
    var stats = {
      totalBuildings: 0,
      constructedBuildings: 0,
      constructingBuildings: 0,
      totalLevels: 0,
      byType: {}
    };

    for (var type in this.buildings) {
      var building = this.buildings[type];
      stats.totalBuildings++;
      if (building.constructed) stats.constructedBuildings++;
      if (building.constructing) stats.constructingBuildings++;
      stats.totalLevels += building.level;
      stats.byType[type] = { level: building.level, constructed: building.constructed };
    }

    return stats;
  },

  // الحصول على وصف المبنى بالتفصيل
  getBuildingInfo: function(buildingType) {
    var building = this.buildings[buildingType];
    var buildingData = GAME.BUILDINGS_DATA[buildingType];
    if (!buildingData) return '';

    var info = buildingData.icon + ' ' + buildingData.nameAr + '\n';
    info += buildingData.descriptionAr + '\n';

    if (!building) {
      info += '🔴 غير مبني\n';
      info += '💰 التكلفة: $' + buildingData.levels[1].cost;
    } else if (building.constructed) {
      info += '🟢 المستوى ' + building.level + '/' + buildingData.maxLevel + '\n';
      
      var levelData = buildingData.levels[building.level];
      info += '📊 ' + levelData.description + '\n';

      if (buildingType === 'barn' || buildingType === 'coop' || buildingType === 'stable') {
        info += '🐄 السعة: ' + levelData.animalCapacity + ' حيوانات';
      } else if (buildingType === 'greenhouse') {
        info += '🌱 قطع أرض: ' + levelData.plotCount;
      } else if (buildingType === 'warehouse') {
        info += '📦 تخزين: ' + levelData.storageCapacity + ' مكان';
      } else if (buildingType === 'well') {
        info += '💧 سعة الماء: ' + levelData.waterCapacity;
      } else if (buildingType === 'workshop') {
        info += '🔨 slots: ' + levelData.craftingSlots;
      }

      // عرض الترقية التالية
      if (building.level < buildingData.maxLevel) {
        var nextLevelData = buildingData.levels[building.level + 1];
        info += '\n⬆️ الترقية التالية: $' + nextLevelData.cost;
      }
    } else if (building.constructing) {
      info += '🔨 قيد البناء... ' + building.constructionDaysLeft + ' يوم متبقي';
    }

    return info;
  },

  // الحصول على مواد البناء المطلوبة
  getRequiredMaterials: function(buildingType, level) {
    var buildingData = GAME.BUILDINGS_DATA[buildingType];
    if (!buildingData || !buildingData.levels[level]) return null;
    return buildingData.levels[level].materials;
  },

  // التحقق من توفر جميع المواد
  hasRequiredMaterials: function(buildingType, level) {
    var materials = this.getRequiredMaterials(buildingType, level);
    if (!materials) return false;

    var playerMaterials = GAME.game.state.inventory.materials || {};
    for (var mat in materials) {
      if ((playerMaterials[mat] || 0) < materials[mat]) {
        return false;
      }
    }

    return true;
  },

  // شراء مواد بناء من السوق
  buyMaterial: function(materialType, quantity) {
    var materialData = GAME.BUILDING_MATERIALS[materialType];
    if (!materialData) {
      GAME.ui.showNotification('❌ مادة غير معروفة!', 'error');
      return false;
    }

    var totalCost = materialData.buyPrice * quantity;
    if (GAME.game.state.money < totalCost) {
      GAME.ui.showNotification('❌ تحتاج $' + totalCost + '!', 'error');
      return false;
    }

    GAME.game.state.money -= totalCost;

    if (!GAME.game.state.inventory.materials) {
      GAME.game.state.inventory.materials = {};
    }
    GAME.game.state.inventory.materials[materialType] = 
      (GAME.game.state.inventory.materials[materialType] || 0) + quantity;

    GAME.ui.showNotification('🪵 اشتريت ' + quantity + ' ' + materialData.nameAr + '! -$' + totalCost, 'success');
    return true;
  }
};

console.log('[BuildingsSystem] 💾 Buildings system loaded');
