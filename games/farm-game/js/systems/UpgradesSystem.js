/**
 * UpgradesSystem.js - نظام الترقيات المتقدم
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - ترقيات المباني (مستوى 2 و 3): إسطبل، دجاجة، مخزن، ورشة، بئر
 * - ترقيات الأدوات: دلو ري، فأس، فأس حجر، صنارة، منجل
 * - ترقيات الحيوانات: علف محسّن لزيادة إنتاج البيض والحليب والصوف
 * - تتبع حالة كل ترقية (مُستخدمة / غير مستخدمة)
 * - تطبيق التأثيرات على الأنظمة الأخرى
 * - حفظ وتحميل الحالة
 */

var GAME = GAME || {};

// ============================================================
// 📊 بيانات الترقيات
// ============================================================

/**
 * ترقيات المباني
 * كل ترقية لها: cost (مال + مواد)، effects (التأثير على المبنى)، requires (ترقيات سابقة مطلوبة)
 */
GAME.UPGRADES_DATA = {
  buildings: {
    barn_level2: {
      name: 'Barn Upgrade Lv.2', nameAr: 'ترقية الإسطبل - المستوى 2',
      icon: '🐄',
      description: 'توسيع الإسطبل لاستيعاب 4 حيوانات إضافية',
      descriptionAr: 'توسيع الإسطبل لاستيعاب 4 حيوانات إضافية',
      cost: { money: 500, wood: 30, stone: 15 },
      effects: { capacity: 4 },
      requires: null, // لا يتطلب ترقية سابقة (لأن المستوى 1 هو الافتراضي)
      requiredLevel: 2,
      apply: function(game) {
        // زيادة سعة الإسطبل
        if (GAME.AnimalsSystem && GAME.AnimalsSystem.buildings && GAME.AnimalsSystem.buildings.barn) {
          GAME.AnimalsSystem.buildings.barn.capacity = (GAME.AnimalsSystem.buildings.barn.capacity || 4) + 4;
        }
      }
    },
    barn_level3: {
      name: 'Barn Upgrade Lv.3', nameAr: 'ترقية الإسطبل - المستوى 3',
      icon: '🐄',
      description: 'توسيع الإسطبل بشكل كبير لاستيعاب 8 حيوانات إضافية',
      descriptionAr: 'توسيع الإسطبل بشكل كبير لاستيعاب 8 حيوانات إضافية',
      cost: { money: 1500, wood: 60, stone: 30 },
      effects: { capacity: 8 },
      requires: 'barn_level2',
      requiredLevel: 4,
      apply: function(game) {
        if (GAME.AnimalsSystem && GAME.AnimalsSystem.buildings && GAME.AnimalsSystem.buildings.barn) {
          GAME.AnimalsSystem.buildings.barn.capacity = (GAME.AnimalsSystem.buildings.barn.capacity || 4) + 8;
        }
      }
    },
    coop_level2: {
      name: 'Coop Upgrade Lv.2', nameAr: 'ترقية الدجاجة - المستوى 2',
      icon: '🐔',
      description: 'توسيع الدجاجة لاستيعاب 3 دجاجات إضافية',
      descriptionAr: 'توسيع الدجاجة لاستيعاب 3 دجاجات إضافية',
      cost: { money: 400, wood: 25, stone: 10 },
      effects: { capacity: 3 },
      requires: null,
      requiredLevel: 2,
      apply: function(game) {
        if (GAME.AnimalsSystem && GAME.AnimalsSystem.buildings && GAME.AnimalsSystem.buildings.coop) {
          GAME.AnimalsSystem.buildings.coop.capacity = (GAME.AnimalsSystem.buildings.coop.capacity || 4) + 3;
        }
      }
    },
    coop_level3: {
      name: 'Coop Upgrade Lv.3', nameAr: 'ترقية الدجاجة - المستوى 3',
      icon: '🐔',
      description: 'توسيع الدجاجة بشكل كبير لاستيعاب 6 دجاجات إضافية',
      descriptionAr: 'توسيع الدجاجة بشكل كبير لاستيعاب 6 دجاجات إضافية',
      cost: { money: 1200, wood: 50, stone: 25 },
      effects: { capacity: 6 },
      requires: 'coop_level2',
      requiredLevel: 4,
      apply: function(game) {
        if (GAME.AnimalsSystem && GAME.AnimalsSystem.buildings && GAME.AnimalsSystem.buildings.coop) {
          GAME.AnimalsSystem.buildings.coop.capacity = (GAME.AnimalsSystem.buildings.coop.capacity || 4) + 6;
        }
      }
    },
    silo_level2: {
      name: 'Silo Upgrade Lv.2', nameAr: 'ترقية المخزن - المستوى 2',
      icon: '🏚️',
      description: 'زيادة سعة المخزن بـ 50 وحدة إضافية',
      descriptionAr: 'زيادة سعة المخزن بـ 50 وحدة إضافية',
      cost: { money: 300, wood: 20, stone: 10 },
      effects: { capacity: 50 },
      requires: null,
      requiredLevel: 2,
      apply: function(game) {
        // زيادة سعة التخزين في الحالة
        if (game && game.state) {
          game.state.siloCapacity = (game.state.siloCapacity || 100) + 50;
        }
      }
    },
    silo_level3: {
      name: 'Silo Upgrade Lv.3', nameAr: 'ترقية المخزن - المستوى 3',
      icon: '🏚️',
      description: 'زيادة سعة المخزن بـ 100 وحدة إضافية',
      descriptionAr: 'زيادة سعة المخزن بـ 100 وحدة إضافية',
      cost: { money: 900, wood: 40, stone: 20 },
      effects: { capacity: 100 },
      requires: 'silo_level2',
      requiredLevel: 4,
      apply: function(game) {
        if (game && game.state) {
          game.state.siloCapacity = (game.state.siloCapacity || 100) + 100;
        }
      }
    },
    workshop_level2: {
      name: 'Workshop Upgrade Lv.2', nameAr: 'ترقية الورشة - المستوى 2',
      icon: '🔨',
      description: 'فتح 8 وصفات صناعة جديدة',
      descriptionAr: 'فتح 8 وصفات صناعة جديدة في الورشة',
      cost: { money: 600, wood: 35, stone: 20 },
      effects: { recipes: 8 },
      requires: null,
      requiredLevel: 3,
      apply: function(game) {
        // فتح وصفات جديدة عبر EconomySystem
        if (GAME.EconomySystem) {
          GAME.EconomySystem.unlockedRecipes = (GAME.EconomySystem.unlockedRecipes || 12) + 8;
        }
      }
    },
    workshop_level3: {
      name: 'Workshop Upgrade Lv.3', nameAr: 'ترقية الورشة - المستوى 3',
      icon: '🔨',
      description: 'فتح 12 وصفة صناعة إضافية',
      descriptionAr: 'فتح 12 وصفة صناعة إضافية في الورشة',
      cost: { money: 1800, wood: 70, stone: 40 },
      effects: { recipes: 12 },
      requires: 'workshop_level2',
      requiredLevel: 5,
      apply: function(game) {
        if (GAME.EconomySystem) {
          GAME.EconomySystem.unlockedRecipes = (GAME.EconomySystem.unlockedRecipes || 12) + 12;
        }
      }
    },
    well_level2: {
      name: 'Well Upgrade Lv.2', nameAr: 'ترقية البئر - المستوى 2',
      icon: '💧',
      description: 'زيادة نطاق الري بـ 25 متر',
      descriptionAr: 'زيادة نطاق الري بـ 25 متر',
      cost: { money: 200, stone: 15 },
      effects: { range: 25 },
      requires: null,
      requiredLevel: 2,
      apply: function(game) {
        // زيادة نطاق الري
        if (game && game.state) {
          game.state.wellRange = (game.state.wellRange || 15) + 25;
        }
      }
    },
    well_level3: {
      name: 'Well Upgrade Lv.3', nameAr: 'ترقية البئر - المستوى 3',
      icon: '💧',
      description: 'زيادة نطاق الري بـ 35 متر إضافي',
      descriptionAr: 'زيادة نطاق الري بـ 35 متر إضافي',
      cost: { money: 600, stone: 30 },
      effects: { range: 35 },
      requires: 'well_level2',
      requiredLevel: 3,
      apply: function(game) {
        if (game && game.state) {
          game.state.wellRange = (game.state.wellRange || 15) + 35;
        }
      }
    }
  },

  tools: {
    wateringCan: {
      name: 'Iron Watering Can', nameAr: 'دلو ري حديدي',
      icon: '🪣',
      description: 'دلو ري متقدم يسرّع عملية الري ويغطي مساحة أكبر',
      descriptionAr: 'دلو ري حديدي متقدم - أسرع وأكبر نطاقاً',
      cost: { money: 200, iron: 5 },
      effects: { speed: 1.5, area: 2 },
      requires: null,
      requiredLevel: 2,
      apply: function(game) {
        // تطبيق تأثير على سرعة الري ونطاقها
        if (game && game.state) {
          game.state.wateringSpeed = (game.state.wateringSpeed || 1) * 1.5;
          game.state.wateringArea = (game.state.wateringArea || 1) + 1;
        }
      }
    },
    axe: {
      name: 'Iron Axe', nameAr: 'فأس حديدي',
      icon: '🪓',
      description: 'فأس حديدي يقطع الأشجار بسرعة مضاعفة',
      descriptionAr: 'فأس حديدي متين - ضرر مضاعف للأشجار',
      cost: { money: 150, iron: 3 },
      effects: { damage: 2 },
      requires: null,
      requiredLevel: 2,
      apply: function(game) {
        if (game && game.state) {
          game.state.axeDamage = (game.state.axeDamage || 1) * 2;
        }
      }
    },
    pickaxe: {
      name: 'Iron Pickaxe', nameAr: 'فأس حجر حديدي',
      icon: '⛏️',
      description: 'فأس حجر حديدي يكسر الصخور بسرعة مضاعفة',
      descriptionAr: 'فأس حجر حديدي - ضرر مضاعف للصخور',
      cost: { money: 180, iron: 4 },
      effects: { damage: 2 },
      requires: null,
      requiredLevel: 2,
      apply: function(game) {
        if (game && game.state) {
          game.state.pickaxeDamage = (game.state.pickaxeDamage || 1) * 2;
        }
      }
    },
    rod: {
      name: 'Iron Fishing Rod', nameAr: 'صنارة صيد حديدية',
      icon: '🎣',
      description: 'صنارة صيد حديدية تزيد نسبة التقاط الأسماك',
      descriptionAr: 'صنارة صيد حديدية - نسبة التقاط أعلى',
      cost: { money: 100, iron: 2 },
      effects: { catchRate: 1.3 },
      requires: null,
      requiredLevel: 2,
      apply: function(game) {
        if (game && game.state) {
          game.state.fishingCatchRate = (game.state.fishingCatchRate || 1) * 1.3;
        }
      }
    },
    scythe: {
      name: 'Iron Scythe', nameAr: 'منجل حديدي',
      icon: '🌾',
      description: 'منجل حديدي يحصد المحاصيل على مساحة أكبر',
      descriptionAr: 'منجل حديدي - مساحة حصاد أكبر',
      cost: { money: 250, iron: 6 },
      effects: { harvestArea: 2 },
      requires: null,
      requiredLevel: 3,
      apply: function(game) {
        if (game && game.state) {
          game.state.harvestArea = (game.state.harvestArea || 1) + 1;
        }
      }
    }
  },

  animals: {
    chicken_feed: {
      name: 'Premium Chicken Feed', nameAr: 'علف دجاج ممتاز',
      icon: '🐔',
      description: 'علف ممتاز يزيد نسبة إنتاج البيض بنسبة 20%',
      descriptionAr: 'علف دجاج ممتاز - إنتاج بيض أعلى',
      cost: { money: 50, wheat: 10 },
      effects: { eggRate: 1.2 },
      requires: null,
      requiredLevel: 2,
      apply: function(game) {
        if (GAME.AnimalsSystem) {
          GAME.AnimalsSystem.eggRateMultiplier = (GAME.AnimalsSystem.eggRateMultiplier || 1) * 1.2;
        }
      }
    },
    cow_feed: {
      name: 'Premium Cow Feed', nameAr: 'علف بقر ممتاز',
      icon: '🐄',
      description: 'علف ممتاز يزيد نسبة إنتاج الحليب بنسبة 20%',
      descriptionAr: 'علف بقر ممتاز - إنتاج حليب أعلى',
      cost: { money: 80, wheat: 15 },
      effects: { milkRate: 1.2 },
      requires: null,
      requiredLevel: 2,
      apply: function(game) {
        if (GAME.AnimalsSystem) {
          GAME.AnimalsSystem.milkRateMultiplier = (GAME.AnimalsSystem.milkRateMultiplier || 1) * 1.2;
        }
      }
    },
    sheep_feed: {
      name: 'Premium Sheep Feed', nameAr: 'علف خروف ممتاز',
      icon: '🐑',
      description: 'علف ممتاز يزيد نسبة إنتاج الصوف بنسبة 20%',
      descriptionAr: 'علف خروف ممتاز - إنتاج صوف أعلى',
      cost: { money: 70, wheat: 12 },
      effects: { woolRate: 1.2 },
      requires: null,
      requiredLevel: 2,
      apply: function(game) {
        if (GAME.AnimalsSystem) {
          GAME.AnimalsSystem.woolRateMultiplier = (GAME.AnimalsSystem.woolRateMultiplier || 1) * 1.2;
        }
      }
    }
  }
};

// ============================================================
// 🏗️ UpgradesSystem - النظام الرئيسي
// ============================================================

GAME.UpgradesSystem = {
  // === المتغيرات الداخلية ===
  game: null,
  purchasedUpgrades: {},  // { 'buildings': { 'barn_level2': true, ... }, ... }
  initialized: false,

  // ============================================================
  // 🚀 التهيئة
  // ============================================================
  init: function(game) {
    this.game = game;
    this.purchasedUpgrades = {
      buildings: {},
      tools: {},
      animals: {}
    };
    this.initialized = true;
    console.log('[UpgradesSystem] ✅ تم التهيئة - ' + this._countTotalUpgrades() + ' ترقية متاحة');
  },

  // ============================================================
  // 🔄 تحميل الحالة المحفوظة
  // ============================================================
  loadState: function(savedState) {
    if (!savedState) return;
    this.purchasedUpgrades = savedState.purchasedUpgrades || {
      buildings: {},
      tools: {},
      animals: {}
    };
    // إعادة تطبيق التأثيرات للترقيات المشتراة
    this._reapplyAllEffects();
    console.log('[UpgradesSystem] 📥 تم تحميل الحالة - ' + this._countPurchased() + ' ترقية مشتراة');
  },

  // ============================================================
  // 💾 حفظ الحالة
  // ============================================================
  saveState: function() {
    return {
      purchasedUpgrades: JSON.parse(JSON.stringify(this.purchasedUpgrades))
    };
  },

  // ============================================================
  // ⬆️ ترقية
  // ============================================================
  /**
   * ترقية فئة معينة
   * @param {string} category - الفئة: 'buildings', 'tools', أو 'animals'
   * @param {string} upgradeId - معرف الترقية
   * @returns {object} { success: boolean, message: string }
   */
  upgrade: function(category, upgradeId) {
    // التحقق من صحة المدخلات
    var categoryData = GAME.UPGRADES_DATA[category];
    if (!categoryData) {
      console.error('[UpgradesSystem] ❌ فئة غير صحيحة: ' + category);
      return { success: false, message: 'فئة غير صحيحة: ' + category };
    }

    var upgrade = categoryData[upgradeId];
    if (!upgrade) {
      console.error('[UpgradesSystem] ❌ ترقية غير موجودة: ' + upgradeId);
      return { success: false, message: 'ترقية غير موجودة: ' + upgradeId };
    }

    // التحقق مما إذا كانت الترقية مشتراة بالفعل
    if (this.purchasedUpgrades[category] && this.purchasedUpgrades[category][upgradeId]) {
      return { success: false, message: 'الترقية مشتراة بالفعل!' };
    }

    // التحقق من المتطلبات (ترقية سابقة)
    if (upgrade.requires) {
      if (!this.purchasedUpgrades[category] || !this.purchasedUpgrades[category][upgrade.requires]) {
        var reqUpgrade = categoryData[upgrade.requires];
        var reqName = reqUpgrade ? (reqUpgrade.nameAr || reqUpgrade.name) : upgrade.requires;
        return { success: false, message: 'يتطلب ترقية سابقة: ' + reqName };
      }
    }

    // التحقق من مستوى اللاعب
    var state = this.game && this.game.state ? this.game.state : null;
    if (state && upgrade.requiredLevel && state.level < upgrade.requiredLevel) {
      return { success: false, message: 'المستوى المطلوب: ' + upgrade.requiredLevel + ' | مستواك: ' + state.level };
    }

    // التحقق من توفر المال والمواد
    var costCheck = this._canAffordCost(upgrade.cost);
    if (!costCheck.canAfford) {
      return { success: false, message: costCheck.message };
    }

    // خصم المال والمواد
    this._deductCost(upgrade.cost);

    // تسجيل الترقية كمشتراة
    if (!this.purchasedUpgrades[category]) {
      this.purchasedUpgrades[category] = {};
    }
    this.purchasedUpgrades[category][upgradeId] = true;

    // تطبيق التأثيرات
    if (typeof upgrade.apply === 'function') {
      upgrade.apply(this.game);
    }

    // إشعار النجاح
    var successMsg = '🎉 تمت ترقية: ' + (upgrade.nameAr || upgrade.name);
    console.log('[UpgradesSystem] ' + successMsg);
    if (GAME.ui && GAME.ui.showNotification) {
      GAME.ui.showNotification(successMsg, 'success');
    }
    if (GAME.audio && GAME.audio.play) {
      GAME.audio.play('chime');
    }

    return { success: true, message: successMsg };
  },

  // ============================================================
  // 🔍 الحصول على ترقية محددة
  // ============================================================
  /**
   * الحصول على بيانات ترقية معينة
   * @param {string} category - الفئة
   * @param {string} upgradeId - معرف الترقية
   * @returns {object|null} بيانات الترقية مع حالة الشراء
   */
  getUpgrade: function(category, upgradeId) {
    var categoryData = GAME.UPGRADES_DATA[category];
    if (!categoryData || !categoryData[upgradeId]) return null;

    var upgrade = categoryData[upgradeId];
    var isPurchased = !!(this.purchasedUpgrades[category] && this.purchasedUpgrades[category][upgradeId]);
    var canUp = this.canUpgrade(category, upgradeId);

    return {
      id: upgradeId,
      category: category,
      name: upgrade.name,
      nameAr: upgrade.nameAr,
      icon: upgrade.icon,
      description: upgrade.description,
      descriptionAr: upgrade.descriptionAr,
      cost: upgrade.cost,
      effects: upgrade.effects,
      requires: upgrade.requires,
      requiredLevel: upgrade.requiredLevel,
      purchased: isPurchased,
      canUpgrade: canUp.canAfford,
      canUpgradeMessage: canUp.message
    };
  },

  // ============================================================
  // ✅ التحقق من إمكانية الترقية
  // ============================================================
  /**
   * التحقق مما إذا كان بإمكان اللاعب الشراء
   * @param {string} category - الفئة
   * @param {string} upgradeId - معرف الترقية
   * @returns {object} { canAfford: boolean, message: string }
   */
  canUpgrade: function(category, upgradeId) {
    var categoryData = GAME.UPGRADES_DATA[category];
    if (!categoryData || !categoryData[upgradeId]) {
      return { canAfford: false, message: 'ترقية غير موجودة' };
    }

    var upgrade = categoryData[upgradeId];

    // مُشتراة بالفعل
    if (this.purchasedUpgrades[category] && this.purchasedUpgrades[category][upgradeId]) {
      return { canAfford: false, message: 'مُشتراة بالفعل' };
    }

    // تحقق من الترقية المطلوبة
    if (upgrade.requires) {
      if (!this.purchasedUpgrades[category] || !this.purchasedUpgrades[category][upgrade.requires]) {
        var reqUpgrade = categoryData[upgrade.requires];
        var reqName = reqUpgrade ? (reqUpgrade.nameAr || reqUpgrade.name) : upgrade.requires;
        return { canAfford: false, message: 'يتطلب: ' + reqName };
      }
    }

    // تحقق من المستوى
    var state = this.game && this.game.state ? this.game.state : null;
    if (state && upgrade.requiredLevel && state.level < upgrade.requiredLevel) {
      return { canAfford: false, message: 'المستوى المطلوب: ' + upgrade.requiredLevel };
    }

    // تحقق من المال والمواد
    var costCheck = this._canAffordCost(upgrade.cost);
    if (!costCheck.canAfford) {
      return costCheck;
    }

    return { canAfford: true, message: 'جاهز للشراء!' };
  },

  // ============================================================
  // 📋 الحصول على الترقيات المتاحة
  // ============================================================
  /**
   * الحصول على جميع الترقيات في فئة معينة (أو كل الفئات)
   * @param {string|null} category - الفئة (null = كل الفئات)
   * @returns {object} مصفوفة من الترقيات مع بياناتها
   */
  getAvailableUpgrades: function(category) {
    var result = {};
    var categories = category ? [category] : ['buildings', 'tools', 'animals'];

    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];
      var catData = GAME.UPGRADES_DATA[cat];
      if (!catData) continue;

      result[cat] = [];
      for (var key in catData) {
        if (!catData.hasOwnProperty(key)) continue;
        var upgradeInfo = this.getUpgrade(cat, key);
        if (upgradeInfo) {
          result[cat].push(upgradeInfo);
        }
      }
    }

    return result;
  },

  // ============================================================
  // 📊 إحصائيات
  // ============================================================
  /**
   * الحصول على إحصائيات الترقيات
   * @returns {object} إحصائيات شاملة
   */
  getStats: function() {
    var total = this._countTotalUpgrades();
    var purchased = this._countPurchased();
    var totalSpent = this._calculateTotalSpent();

    return {
      totalUpgrades: total,
      purchasedUpgrades: purchased,
      availableUpgrades: total - purchased,
      totalSpentMoney: totalSpent.money,
      totalSpentMaterials: totalSpent.materials,
      byCategory: {
        buildings: {
          total: this._countCategory('buildings'),
          purchased: this._countCategoryPurchased('buildings')
        },
        tools: {
          total: this._countCategory('tools'),
          purchased: this._countCategoryPurchased('tools')
        },
        animals: {
          total: this._countCategory('animals'),
          purchased: this._countCategoryPurchased('animals')
        }
      }
    };
  },

  // ============================================================
  // 🔄 إعادة تطبيق جميع التأثيرات
  // ============================================================
  _reapplyAllEffects: function() {
    for (var category in this.purchasedUpgrades) {
      if (!this.purchasedUpgrades.hasOwnProperty(category)) continue;
      var catData = GAME.UPGRADES_DATA[category];
      if (!catData) continue;

      for (var upgradeId in this.purchasedUpgrades[category]) {
        if (!this.purchasedUpgrades[category].hasOwnProperty(upgradeId)) continue;
        if (!this.purchasedUpgrades[category][upgradeId]) continue;

        var upgrade = catData[upgradeId];
        if (upgrade && typeof upgrade.apply === 'function') {
          upgrade.apply(this.game);
        }
      }
    }
  },

  // ============================================================
  // 💰 التحقق من توفر التكلفة
  // ============================================================
  _canAffordCost: function(cost) {
    var state = this.game && this.game.state ? this.game.state : null;
    if (!state) {
      return { canAfford: false, message: 'الحالة غير متوفرة' };
    }

    // التحقق من المال
    if (cost.money && state.money < cost.money) {
      return {
        canAfford: false,
        message: 'المال غير كافٍ - المطلوب: $' + cost.money + ' | المتوفر: $' + state.money
      };
    }

    // التحقق من المواد
    if (state.inventory) {
      for (var material in cost) {
        if (!cost.hasOwnProperty(material) || material === 'money') continue;
        var needed = cost[material];
        var available = state.inventory[material] || 0;
        if (available < needed) {
          return {
            canAfford: false,
            message: material + ' غير كافٍ - المطلوب: ' + needed + ' | المتوفر: ' + available
          };
        }
      }
    }

    return { canAfford: true, message: 'يمكن الشراء' };
  },

  // ============================================================
  // 💸 خصم التكلفة
  // ============================================================
  _deductCost: function(cost) {
    var state = this.game && this.game.state ? this.game.state : null;
    if (!state) return;

    // خصم المال
    if (cost.money) {
      state.money -= cost.money;
      if (state.stats) {
        state.stats.totalEarned = (state.stats.totalEarned || 0) - cost.money;
      }
    }

    // خصم المواد
    if (state.inventory) {
      for (var material in cost) {
        if (!cost.hasOwnProperty(material) || material === 'money') continue;
        state.inventory[material] = (state.inventory[material] || 0) - cost[material];
      }
    }
  },

  // ============================================================
  // 📊 عدّاد الترقيات
  // ============================================================
  _countTotalUpgrades: function() {
    var count = 0;
    for (var category in GAME.UPGRADES_DATA) {
      if (!GAME.UPGRADES_DATA.hasOwnProperty(category)) continue;
      for (var key in GAME.UPGRADES_DATA[category]) {
        if (GAME.UPGRADES_DATA[category].hasOwnProperty(key)) count++;
      }
    }
    return count;
  },

  _countPurchased: function() {
    var count = 0;
    for (var category in this.purchasedUpgrades) {
      if (!this.purchasedUpgrades.hasOwnProperty(category)) continue;
      for (var key in this.purchasedUpgrades[category]) {
        if (this.purchasedUpgrades[category][key]) count++;
      }
    }
    return count;
  },

  _countCategory: function(category) {
    var catData = GAME.UPGRADES_DATA[category];
    if (!catData) return 0;
    var count = 0;
    for (var key in catData) {
      if (catData.hasOwnProperty(key)) count++;
    }
    return count;
  },

  _countCategoryPurchased: function(category) {
    var catPurchased = this.purchasedUpgrades[category];
    if (!catPurchased) return 0;
    var count = 0;
    for (var key in catPurchased) {
      if (catPurchased[key]) count++;
    }
    return count;
  },

  _calculateTotalSpent: function() {
    var result = { money: 0, materials: {} };
    for (var category in this.purchasedUpgrades) {
      if (!this.purchasedUpgrades.hasOwnProperty(category)) continue;
      var catData = GAME.UPGRADES_DATA[category];
      if (!catData) continue;

      for (var key in this.purchasedUpgrades[category]) {
        if (!this.purchasedUpgrades[category][key]) continue;
        var upgrade = catData[key];
        if (!upgrade || !upgrade.cost) continue;

        result.money += upgrade.cost.money || 0;
        for (var mat in upgrade.cost) {
          if (!upgrade.cost.hasOwnProperty(mat) || mat === 'money') continue;
          result.materials[mat] = (result.materials[mat] || 0) + upgrade.cost[mat];
        }
      }
    }
    return result;
  },

  // ============================================================
  // 🎯 الحصول على الترقيات المشتراة لفئة
  // ============================================================
  getPurchasedByCategory: function(category) {
    var catPurchased = this.purchasedUpgrades[category];
    if (!catPurchased) return [];

    var result = [];
    var catData = GAME.UPGRADES_DATA[category] || {};
    for (var key in catPurchased) {
      if (!catPurchased[key]) continue;
      var upgrade = catData[key];
      if (upgrade) {
        result.push({
          id: key,
          name: upgrade.name,
          nameAr: upgrade.nameAr,
          icon: upgrade.icon,
          effects: upgrade.effects
        });
      }
    }
    return result;
  },

  // ============================================================
  // 🔍 فحص ما إذا كانت ترقية محددة مُشتراة
  // ============================================================
  isPurchased: function(category, upgradeId) {
    return !!(this.purchasedUpgrades[category] && this.purchasedUpgrades[category][upgradeId]);
  },

  // ============================================================
  // 📈 تطبيق تأثيرات جميع الترقيات المشتراة (لبدء اللعبة)
  // ============================================================
  applyAllEffects: function(game) {
    this.game = game;
    this._reapplyAllEffects();
    console.log('[UpgradesSystem] 🔄 تم تطبيق تأثيرات ' + this._countPurchased() + ' ترقية مشتراة');
  }
};

console.log('[UpgradesSystem] 📦 تم تحميل النظام - ' + (function() {
  var count = 0;
  for (var cat in GAME.UPGRADES_DATA) {
    if (GAME.UPGRADES_DATA.hasOwnProperty(cat)) {
      for (var k in GAME.UPGRADES_DATA[cat]) {
        if (GAME.UPGRADES_DATA[cat].hasOwnProperty(k)) count++;
      }
    }
  }
  return count;
})() + ' ترقية متاحة');
