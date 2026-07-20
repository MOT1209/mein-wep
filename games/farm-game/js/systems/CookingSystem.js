/**
 * CookingSystem.js - نظام الطهي المتكامل
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - 8 وصفات طهي مختلفة
 * - تأثيرات متنوعة (صحة، طاقة، سعادة)
 * - وقت طهي لكل وصفة
 * - طابور طهي متعدد
 * - التحقق من المكونات
 * - XP والمكافآت
 * - حفظ وتحميل الحالة
 * - تكامل مع Inventory, EconomySystem, TimeSystem
 */

var GAME = GAME || {};

// ============================================================
// 🍳 تعريف الوصفات (8 وصفات)
// ============================================================
GAME.COOKING_RECIPES = {
  scrambledEggs: {
    id: 'scrambledEggs',
    name: 'Scrambled Eggs',
    nameAr: 'بيض مقلي',
    icon: '🍳',
    category: 'breakfast',
    ingredients: { egg: 2 },
    cookTime: 5,
    effects: { health: 20 },
    xp: 10,
    value: 25,
    description: 'بيض مقلي مقرمش ولذيذ',
    descriptionAr: 'بيض مقلي مقرمش ولذيذ',
    unlockLevel: 1
  },
  omelette: {
    id: 'omelette',
    name: 'Omelette',
    nameAr: 'أومليت',
    icon: '🥚',
    category: 'breakfast',
    ingredients: { egg: 2, cheese: 1 },
    cookTime: 8,
    effects: { health: 35 },
    xp: 15,
    value: 45,
    description: 'أومليت جبنة كريمية',
    descriptionAr: 'أومليت جبنة كريمية',
    unlockLevel: 2
  },
  grilledFish: {
    id: 'grilledFish',
    name: 'Grilled Fish',
    nameAr: 'سمك مشوي',
    icon: '🐟',
    category: 'main',
    ingredients: { bass: 1 },
    cookTime: 10,
    effects: { health: 30, energy: 10 },
    xp: 20,
    value: 40,
    description: 'سمك مشوي طازج من النهر',
    descriptionAr: 'سمك مشوي طازج من النهر',
    unlockLevel: 2
  },
  vegetableStew: {
    id: 'vegetableStew',
    name: 'Vegetable Stew',
    nameAr: 'يخنة خضروات',
    icon: '🥘',
    category: 'main',
    ingredients: { potato: 2, carrot: 1 },
    cookTime: 15,
    effects: { health: 50 },
    xp: 25,
    value: 60,
    description: 'يخنة خضروات مغذية ومليئة بالنكهات',
    descriptionAr: 'يخنة خضروات مغذية ومليئة بالنكهات',
    unlockLevel: 3
  },
  fishAndChips: {
    id: 'fishAndChips',
    name: 'Fish and Chips',
    nameAr: 'سمك ورقائق',
    icon: '🍟',
    category: 'main',
    ingredients: { bass: 1, potato: 2 },
    cookTime: 12,
    effects: { health: 40, energy: 20 },
    xp: 30,
    value: 70,
    description: 'سمك مقرمش مع رقائق بطاطا ذهبية',
    descriptionAr: 'سمك مقرمش مع رقائق بطاطا ذهبية',
    unlockLevel: 3
  },
  birthdayCake: {
    id: 'birthdayCake',
    name: 'Birthday Cake',
    nameAr: 'كعكة عيد ميلاد',
    icon: '🎂',
    category: 'dessert',
    ingredients: { wheat: 3, egg: 2, milk: 1, sugar: 1 },
    cookTime: 20,
    effects: { happiness: 50 },
    xp: 40,
    value: 100,
    description: 'كعكة عيد ميلاد فاخرة بالكريمة',
    descriptionAr: 'كعكة عيد ميلاد فاخرة بالكريمة',
    unlockLevel: 4
  },
  fruitSalad: {
    id: 'fruitSalad',
    name: 'Fruit Salad',
    nameAr: 'سلطة فواكه',
    icon: '🥗',
    category: 'dessert',
    ingredients: { apple: 2, orange: 2 },
    cookTime: 5,
    effects: { health: 25, energy: 15 },
    xp: 10,
    value: 35,
    description: 'سلطة فواكه طازجة ولذيذة',
    descriptionAr: 'سلطة فواكه طازجة ولذيذة',
    unlockLevel: 1
  },
  beefStew: {
    id: 'beefStew',
    name: 'Beef Stew',
    nameAr: 'لحم بقري مطهو',
    icon: '🥩',
    category: 'main',
    ingredients: { beef: 2, potato: 2, carrot: 1 },
    cookTime: 18,
    effects: { health: 60, energy: 25 },
    xp: 35,
    value: 85,
    description: 'لحم بقري مطهو ببطء مع الخضروات',
    descriptionAr: 'لحم بقري مطهو ببطء مع الخضروات',
    unlockLevel: 4
  }
};

// ============================================================
// 🍳 CookingSystem - نظام الطهي
// ============================================================
GAME.CookingSystem = {
  // --- الحالة ---
  queue: [],            // طابور الطهي النشط [{recipeId, quantity, timer, totalTime}]
  maxQueueSize: 3,      // الحد الأقصى للطابور
  playerLevel: 1,       // مستوى اللاعب
  totalCooked: 0,       // إجمالي الأطباق المطهوة
  cookingXP: 0,         // خبرة الطهي

  // ============================================================
  // 🔧 التهيئة
  // ============================================================
  init: function(game) {
    this.game = game;
    this.queue = [];
    this.totalCooked = 0;
    this.cookingXP = 0;
    this.playerLevel = (game && game.playerLevel) || 1;
    console.log('🍳 CookingSystem initialized');
  },

  // ============================================================
  // 🔄 التحديث (يُستدعى كل frame)
  // ============================================================
  update: function(dt) {
    if (this.queue.length === 0) return;

    for (var i = this.queue.length - 1; i >= 0; i--) {
      var item = this.queue[i];
      item.timer -= dt;

      if (item.timer <= 0) {
        this._completeCooking(i);
      }
    }
  },

  // ============================================================
  // 🍳 الطهي
  // ============================================================
  cook: function(recipeId, quantity) {
    quantity = quantity || 1;
    var recipe = GAME.COOKING_RECIPES[recipeId];
    if (!recipe) {
      console.warn('🍳 Recipe not found:', recipeId);
      return false;
    }

    // التحقق من المستوى
    if (this.playerLevel < recipe.unlockLevel) {
      console.warn('🍳 Level too low. Need:', recipe.unlockLevel);
      return false;
    }

    // التحقق من الطابور
    if (this.queue.length >= this.maxQueueSize) {
      console.warn('🍳 Cooking queue is full');
      return false;
    }

    // التحقق من المكونات
    if (!this.canCook(recipeId, quantity)) {
      return false;
    }

    // خصم المكونات
    for (var item in recipe.ingredients) {
      var needed = recipe.ingredients[item] * quantity;
      if (GAME.Inventory && typeof GAME.Inventory.remove === 'function') {
        GAME.Inventory.remove(item, needed);
      }
    }

    // إضافة إلى الطابور
    this.queue.push({
      recipeId: recipeId,
      quantity: quantity,
      timer: recipe.cookTime,
      totalTime: recipe.cookTime
    });

    console.log('🍳 Cooking started:', recipe.name, 'x' + quantity);
    return true;
  },

  // ============================================================
  // ✅ التحقق من إمكانية الطهي
  // ============================================================
  canCook: function(recipeId, quantity) {
    quantity = quantity || 1;
    var recipe = GAME.COOKING_RECIPES[recipeId];
    if (!recipe) return false;

    // التحقق من المستوى
    if (this.playerLevel < recipe.unlockLevel) return false;

    // التحقق من الطابور
    if (this.queue.length >= this.maxQueueSize) return false;

    // التحقق من المكونات
    for (var item in recipe.ingredients) {
      var needed = recipe.ingredients[item] * quantity;
      var has = false;

      if (GAME.Inventory && typeof GAME.Inventory.has === 'function') {
        has = GAME.Inventory.has(item, needed);
      } else if (this.game && this.game.inventory) {
        // بديل: التحقق من المخزون مباشرة
        var count = this.game.inventory[item] || 0;
        has = count >= needed;
      }

      if (!has) return false;
    }

    return true;
  },

  // ============================================================
  // 📋 الحصول على معلومات الوصفة
  // ============================================================
  getRecipe: function(recipeId) {
    return GAME.COOKING_RECIPES[recipeId] || null;
  },

  getAllRecipes: function() {
    return GAME.COOKING_RECIPES;
  },

  // ============================================================
  // 📊 الحصول على الوصفات المتاحة للمستوى الحالي
  // ============================================================
  getAvailableRecipes: function() {
    var available = {};
    for (var id in GAME.COOKING_RECIPES) {
      var recipe = GAME.COOKING_RECIPES[id];
      if (this.playerLevel >= recipe.unlockLevel) {
        available[id] = recipe;
      }
    }
    return available;
  },

  // ============================================================
  // 📦 الحصول على الوصفات حسب الفئة
  // ============================================================
  getRecipesByCategory: function(category) {
    var result = {};
    for (var id in GAME.COOKING_RECIPES) {
      var recipe = GAME.COOKING_RECIPES[id];
      if (recipe.category === category && this.playerLevel >= recipe.unlockLevel) {
        result[id] = recipe;
      }
    }
    return result;
  },

  // ============================================================
  // 📋 حالة الطابور
  // ============================================================
  getQueue: function() {
    return this.queue.map(function(item) {
      var recipe = GAME.COOKING_RECIPES[item.recipeId];
      return {
        recipeId: item.recipeId,
        name: recipe ? recipe.name : item.recipeId,
        nameAr: recipe ? recipe.nameAr : '',
        icon: recipe ? recipe.icon : '🍳',
        quantity: item.quantity,
        timeLeft: Math.max(0, item.timer),
        totalTime: item.totalTime,
        progress: Math.max(0, Math.min(1, 1 - (item.timer / item.totalTime)))
      };
    });
  },

  getQueueLength: function() {
    return this.queue.length;
  },

  isQueueFull: function() {
    return this.queue.length >= this.maxQueueSize;
  },

  // ============================================================
  // ⏱️ تسريع الطهي (اختياري)
  // ============================================================
  speedUpCooking: function(index, timeReduction) {
    if (index < 0 || index >= this.queue.length) return false;
    timeReduction = timeReduction || 5;
    this.queue[index].timer = Math.max(0, this.queue[index].timer - timeReduction);
    return true;
  },

  // ============================================================
  // 🔄 ترتيب الطهي (إلغاء وصفة من الطابور)
  // ============================================================
  cancelCooking: function(index) {
    if (index < 0 || index >= this.queue.length) return false;

    var item = this.queue[index];
    var recipe = GAME.COOKING_RECIPES[item.recipeId];

    // إعادة نصف المكونات كتعويض
    if (recipe) {
      for (var ingredient in recipe.ingredients) {
        var refund = Math.ceil(recipe.ingredients[ingredient] * item.quantity * 0.5);
        if (GAME.Inventory && typeof GAME.Inventory.add === 'function') {
          GAME.Inventory.add(ingredient, refund);
        }
      }
    }

    this.queue.splice(index, 1);
    console.log('🍳 Cooking cancelled:', item.recipeId);
    return true;
  },

  // ============================================================
  // ✅ إكمال الطهي
  // ============================================================
  _completeCooking: function(index) {
    var item = this.queue[index];
    var recipe = GAME.COOKING_RECIPES[item.recipeId];

    if (!recipe) {
      this.queue.splice(index, 1);
      return;
    }

    // إضافة الطبق إلى المخزون
    if (GAME.Inventory && typeof GAME.Inventory.add === 'function') {
      GAME.Inventory.add(item.recipeId, item.quantity);
    }

    // إضافة XP
    var totalXP = recipe.xp * item.quantity;
    if (GAME.EconomySystem && typeof GAME.EconomySystem.addXP === 'function') {
      GAME.EconomySystem.addXP(totalXP);
    }
    this.cookingXP += totalXP;

    // تطبيق التأثيرات
    this._applyEffects(recipe.effects, item.quantity);

    // تحديث الإحصائيات
    this.totalCooked += item.quantity;

    console.log('🍳 Cooking complete:', recipe.name, 'x' + item.quantity,
      '| XP:', totalXP, '| Effects:', JSON.stringify(recipe.effects));

    // إزالة من الطابور
    this.queue.splice(index, 1);

    // إطلاق حدث
    if (this.game && this.game.events && typeof this.game.events.emit === 'function') {
      this.game.events.emit('cookingComplete', {
        recipeId: item.recipeId,
        quantity: item.quantity,
        effects: recipe.effects
      });
    }
  },

  // ============================================================
  // 💪 تطبيق التأثيرات على اللاعب
  // ============================================================
  _applyEffects: function(effects, quantity) {
    if (!effects || !this.game) return;

    quantity = quantity || 1;

    // الصحة
    if (effects.health && this.game.player) {
      var currentHealth = this.game.player.health || 100;
      var maxHealth = this.game.player.maxHealth || 100;
      this.game.player.health = Math.min(maxHealth, currentHealth + (effects.health * quantity));
    }

    // الطاقة
    if (effects.energy && this.game.player) {
      var currentEnergy = this.game.player.energy || 100;
      var maxEnergy = this.game.player.maxEnergy || 100;
      this.game.player.energy = Math.min(maxEnergy, currentEnergy + (effects.energy * quantity));
    }

    // السعادة
    if (effects.happiness && this.game.player) {
      var currentHappiness = this.game.player.happiness || 50;
      var maxHappiness = this.game.player.maxHappiness || 100;
      this.game.player.happiness = Math.min(maxHappiness, currentHappiness + (effects.happiness * quantity));
    }
  },

  // ============================================================
  // 📊 الإحصائيات
  // ============================================================
  getStats: function() {
    return {
      totalCooked: this.totalCooked,
      cookingXP: this.cookingXP,
      queueLength: this.queue.length,
      maxQueueSize: this.maxQueueSize,
      playerLevel: this.playerLevel,
      availableRecipes: Object.keys(this.getAvailableRecipes()).length,
      totalRecipes: Object.keys(GAME.COOKING_RECIPES).length
    };
  },

  // ============================================================
  // ⬆️ ترقية مستوى الطهي
  // ============================================================
  setLevel: function(level) {
    this.playerLevel = level;
  },

  // ============================================================
  // 💾 حفظ الحالة
  // ============================================================
  getSaveData: function() {
    return {
      queue: this.queue.map(function(item) {
        return {
          recipeId: item.recipeId,
          quantity: item.quantity,
          timer: item.timer,
          totalTime: item.totalTime
        };
      }),
      totalCooked: this.totalCooked,
      cookingXP: this.cookingXP,
      playerLevel: this.playerLevel
    };
  },

  // ============================================================
  // 📂 تحميل الحالة
  // ============================================================
  loadSaveData: function(data) {
    if (!data) return false;

    this.queue = data.queue || [];
    this.totalCooked = data.totalCooked || 0;
    this.cookingXP = data.cookingXP || 0;
    this.playerLevel = data.playerLevel || 1;

    console.log('🍳 CookingSystem loaded:', this.totalCooked, 'total cooked');
    return true;
  }
};

console.log('✅ CookingSystem.js loaded');
