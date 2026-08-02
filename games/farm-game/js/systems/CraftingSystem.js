/**
 * CraftingSystem.js - نظام الصناعة المتكامل
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - 20+ وصفة صناعة عبر 4 فئات
 * - وقت صناعة حقيقي (بالثواني)
 * - طابور صناعة متعدد (حد أقصى 3)
 * - متطلبات مستوى ومواد خام
 * - جودة المنتج (عادي، فضة، ذهب، إيريديوم)
 * - XP ومكافآت
 * - حفظ وتحميل الحالة
 * - تكامل مع EconomySystem و FARMING_SYSTEM
 */

var GAME = GAME || {};

// ============================================================
// 📋 تعريف الوصفات الكامل (20+ وصفة)
// ============================================================
GAME.CRAFTING_RECIPES_FULL = {
  // ========================================
  // 🍞 فئة: طعام (Food) - 10 وصفات
  // ========================================
  bread: {
    id: 'bread',
    name: 'Bread', nameAr: 'خبز',
    icon: '🍞',
    category: 'food',
    inputs: { wheat: 3 },
    craftTime: 8,           // ثوانٍ
    quantity: 2,            // عدد المنتج النهائي
    sellPrice: { base: 80, silver: 112, gold: 160, iridium: 320 },
    xpReward: 15,
    description: 'خبز طازج من القمح المطحون',
    descriptionAr: 'خبز طازج من القمح المطحون',
    unlockLevel: 1
  },
  flour: {
    id: 'flour',
    name: 'Flour', nameAr: 'طحين',
    icon: '🌾',
    category: 'food',
    inputs: { wheat: 2 },
    craftTime: 5,
    quantity: 3,
    sellPrice: { base: 45, silver: 63, gold: 90, iridium: 180 },
    xpReward: 8,
    description: 'طحين ناعم جاهز للطبخ',
    descriptionAr: 'طحين ناعم جاهز للطبخ',
    unlockLevel: 1
  },
  cheese: {
    id: 'cheese',
    name: 'Cheese', nameAr: 'جبنة',
    icon: '🧀',
    category: 'food',
    inputs: { milk: 2 },
    craftTime: 12,
    quantity: 1,
    sellPrice: { base: 120, silver: 168, gold: 240, iridium: 480 },
    xpReward: 20,
    description: 'جبنة طازجة من الحليب',
    descriptionAr: 'جبنة طازجة مصنوعة من حليب البقر',
    unlockLevel: 2
  },
  butter: {
    id: 'butter',
    name: 'Butter', nameAr: 'زبدة',
    icon: '🧈',
    category: 'food',
    inputs: { milk: 1 },
    craftTime: 8,
    quantity: 2,
    sellPrice: { base: 90, silver: 126, gold: 180, iridium: 360 },
    xpReward: 12,
    description: 'زبدة طازجة من حليب البقر',
    descriptionAr: 'زبدة طازجة من حليب البقر',
    unlockLevel: 1
  },
  ice_cream: {
    id: 'ice_cream',
    name: 'Ice Cream', nameAr: 'آيس كريم',
    icon: '🍦',
    category: 'food',
    inputs: { milk: 1, sugar: 1 },
    craftTime: 15,
    quantity: 1,
    sellPrice: { base: 150, silver: 210, gold: 300, iridium: 600 },
    xpReward: 25,
    description: 'آيس كريم مجمد بنكهة الفواكه',
    descriptionAr: 'آيس كريم مجمد بنكهة الفواكه',
    unlockLevel: 3
  },
  jam: {
    id: 'jam',
    name: 'Fruit Jam', nameAr: 'مربى فاكهة',
    icon: '🫙',
    category: 'food',
    inputs: { apple: 2, sugar: 1 },
    craftTime: 10,
    quantity: 2,
    sellPrice: { base: 110, silver: 154, gold: 220, iridium: 440 },
    xpReward: 18,
    description: 'مربى تفاح طازج ومحلى',
    descriptionAr: 'مربى تفاح طازج ومحلى',
    unlockLevel: 2
  },
  soup: {
    id: 'soup',
    name: 'Vegetable Soup', nameAr: 'حساء خضار',
    icon: '🍲',
    category: 'food',
    inputs: { tomato: 2, carrot: 1, potato: 1 },
    craftTime: 14,
    quantity: 1,
    sellPrice: { base: 130, silver: 182, gold: 260, iridium: 520 },
    xpReward: 22,
    description: 'حساء خضار ساخن ولذيذ',
    descriptionAr: 'حساء خضار متنوع مطبوخ على نار هادئة',
    unlockLevel: 2
  },
  salad: {
    id: 'salad',
    name: 'Fresh Salad', nameAr: 'سلطة طازجة',
    icon: '🥗',
    category: 'food',
    inputs: { lettuce: 2, tomato: 1 },
    craftTime: 5,
    quantity: 2,
    sellPrice: { base: 75, silver: 105, gold: 150, iridium: 300 },
    xpReward: 10,
    description: 'سلطة خضار طازجة ومتنوعة',
    descriptionAr: 'سلطة خضار خضراء متنوعة',
    unlockLevel: 1
  },
  pumpkin_pie: {
    id: 'pumpkin_pie',
    name: 'Pumpkin Pie', nameAr: 'فطيرة يقطين',
    icon: '🥧',
    category: 'food',
    inputs: { pumpkin: 1, egg: 2, wheat: 1, sugar: 1 },
    craftTime: 20,
    quantity: 1,
    sellPrice: { base: 250, silver: 350, gold: 500, iridium: 1000 },
    xpReward: 35,
    description: 'فطيرة يقطين بالقرفة والبهارات',
    descriptionAr: 'فطيرة يقطين تقليدية مع بهارات особية',
    unlockLevel: 4
  },
  sandwich: {
    id: 'sandwich',
    name: 'Sandwich', nameAr: 'ساندويتش',
    icon: '🥪',
    category: 'food',
    inputs: { wheat: 2, lettuce: 1, tomato: 1 },
    craftTime: 6,
    quantity: 2,
    sellPrice: { base: 95, silver: 133, gold: 190, iridium: 380 },
    xpReward: 14,
    description: 'ساندويتش طازج بالخضار',
    descriptionAr: 'ساندويتش مقرمش بالخضار الطازجة',
    unlockLevel: 1
  },

  // ========================================
  // 🔧 فئة: أدوات (Tools) - 4 وصفات
  // ========================================
  fertilizer_basic: {
    id: 'fertilizer_basic',
    name: 'Basic Fertilizer', nameAr: 'سماد أساسي',
    icon: '🧪',
    category: 'tools',
    inputs: { wheat: 2, stone: 1 },
    craftTime: 6,
    quantity: 3,
    sellPrice: { base: 30, silver: 42, gold: 60, iridium: 120 },
    xpReward: 8,
    description: 'سماد أساسي لتحسين نمو المحاصيل',
    descriptionAr: 'سماد أساسي يحسن نمو المحاصيل بنسبة 25%',
    unlockLevel: 1
  },
  fertilizer_quality: {
    id: 'fertilizer_quality',
    name: 'Quality Fertilizer', nameAr: 'سماد جيد',
    icon: '⚗️',
    category: 'tools',
    inputs: { wheat: 3, stone: 2, sugar: 1 },
    craftTime: 10,
    quantity: 2,
    sellPrice: { base: 65, silver: 91, gold: 130, iridium: 260 },
    xpReward: 15,
    description: 'سماد جيد يحسن جودة المحصول',
    descriptionAr: 'سماد ممتاز يرفع احتمالية الجودة العالية',
    unlockLevel: 3
  },
  feed_mix: {
    id: 'feed_mix',
    name: 'Animal Feed Mix', nameAr: 'خلطة علف حيوانات',
    icon: '🌾',
    category: 'tools',
    inputs: { wheat: 3, corn: 2 },
    craftTime: 8,
    quantity: 5,
    sellPrice: { base: 40, silver: 56, gold: 80, iridium: 160 },
    xpReward: 10,
    description: 'خلطة علف غنية للحيوانات',
    descriptionAr: 'خلطة علف متوازنة تحسن سعادة الحيوانات',
    unlockLevel: 2
  },
  seeds_pack: {
    id: 'seeds_pack',
    name: 'Seed Pack', nameAr: 'حزمة بذور',
    icon: '🌱',
    category: 'tools',
    inputs: { wheat: 4, sunflower: 2 },
    craftTime: 12,
    quantity: 6,
    sellPrice: { base: 55, silver: 77, gold: 110, iridium: 220 },
    xpReward: 12,
    description: 'حزمة بذور متنوعة للزراعة',
    descriptionAr: 'حزمة تحتوي بذور متنوعة من المحاصيل الموسمية',
    unlockLevel: 2
  },

  // ========================================
  // 🏠 فئة: مباني (Buildings) - 4 وصفات
  // ========================================
  wooden_fence: {
    id: 'wooden_fence',
    name: 'Wooden Fence', nameAr: 'سياج خشبي',
    icon: '🪵',
    category: 'buildings',
    inputs: { wood: 5, nails: 2 },
    craftTime: 15,
    quantity: 4,
    sellPrice: { base: 60, silver: 84, gold: 120, iridium: 240 },
    xpReward: 18,
    description: 'سياج خشبي لحماية المزرعة',
    descriptionAr: 'سياج خشبي متين لتجميد حدود المزرعة',
    unlockLevel: 1
  },
  scarecrow: {
    id: 'scarecrow',
    name: 'Scarecrow', nameAr: 'ف scarecrow',
    icon: '🎃',
    category: 'buildings',
    inputs: { wheat: 5, wood: 3, cloth: 1 },
    craftTime: 20,
    quantity: 1,
    sellPrice: { base: 100, silver: 140, gold: 200, iridium: 400 },
    xpReward: 25,
    description: 'ف scarecrow لطرد العصافير',
    descriptionAr: 'ف scarecrow تقليدي يحمي المحاصيل من العصافير',
    unlockLevel: 2
  },
  sprinkler: {
    id: 'sprinkler',
    name: 'Sprinkler', nameAr: 'رشاش ماء',
    icon: '💧',
    category: 'buildings',
    inputs: { iron: 3, glass: 2, stone: 2 },
    craftTime: 25,
    quantity: 1,
    sellPrice: { base: 180, silver: 252, gold: 360, iridium: 720 },
    xpReward: 30,
    description: 'رشاش ماء آلي لري المحاصيل',
    descriptionAr: 'رشاش ماء أوتوماتيكي يروي المحاصيل القريبة',
    unlockLevel: 3
  },
  compost_bin: {
    id: 'compost_bin',
    name: 'Compost Bin', nameAr: 'علبة تسميد',
    icon: '♻️',
    category: 'buildings',
    inputs: { wood: 4, stone: 3, hay: 2 },
    craftTime: 18,
    quantity: 1,
    sellPrice: { base: 120, silver: 168, gold: 240, iridium: 480 },
    xpReward: 22,
    description: 'علبة تسميد لتحويل النفايات',
    descriptionAr: 'علبة تسميد عضوي لتحويل بقايا المحاصيل إلى سماد',
    unlockLevel: 2
  },

  // ========================================
  // 🎁 فئة: هدايا (Gifts) - 4 وصفات
  // ========================================
  cloth: {
    id: 'cloth',
    name: 'Cloth', nameAr: 'قماش',
    icon: '🧶',
    category: 'gifts',
    inputs: { wool: 2, egg: 1 },
    craftTime: 10,
    quantity: 1,
    sellPrice: { base: 90, silver: 126, gold: 180, iridium: 360 },
    xpReward: 14,
    description: 'قماش ناعم من الصوف',
    descriptionAr: 'قماش منسوج من أجود أنواع الصوف',
    unlockLevel: 2
  },
  bouquet: {
    id: 'bouquet',
    name: 'Flower Bouquet', nameAr: 'باقة زهور',
    icon: '💐',
    category: 'gifts',
    inputs: { sunflower: 2, lettuce: 1 },
    craftTime: 8,
    quantity: 1,
    sellPrice: { base: 110, silver: 154, gold: 220, iridium: 440 },
    xpReward: 20,
    description: 'باقة زهور جميلة للهدايا',
    descriptionAr: 'باقة زهور طازجة وملونة لتهدية الأصدقاء',
    unlockLevel: 2
  },
  wine: {
    id: 'wine',
    name: 'Wine', nameAr: 'نبيذ',
    icon: '🍷',
    category: 'gifts',
    inputs: { grape: 4, sugar: 1 },
    craftTime: 30,
    quantity: 1,
    sellPrice: { base: 200, silver: 280, gold: 400, iridium: 800 },
    xpReward: 30,
    description: 'نبيذ معتّق من أجود أنواع العنب',
    descriptionAr: 'نبيذ فاخر من أجود أنواع العنب المعتّق',
    unlockLevel: 4
  },
  truffle_oil: {
    id: 'truffle_oil',
    name: 'Truffle Oil', nameAr: 'زيت كمأة',
    icon: '🫒',
    category: 'gifts',
    inputs: { truffle: 1, sunflower: 2 },
    craftTime: 20,
    quantity: 1,
    sellPrice: { base: 280, silver: 392, gold: 560, iridium: 1120 },
    xpReward: 35,
    description: 'زيت كمأة فاخر للطبخ والهدايا',
    descriptionAr: 'زيت كمأة نقي مستخلص من أجود أنواع الكمأة',
    unlockLevel: 4
  }
};

// ============================================================
// 🏗️ نظام الصناعة الرئيسي
// ============================================================
GAME.CraftingSystem = {
  // === المتغيرات الداخلية ===
  activeQueue: [],          // طابور الصناعة النشط (حد أقصى 3)
  maxQueueSize: 3,          // الحد الأقصى لعدد الوظائف النشطة
  completedItems: [],       // المنتجات المكتملة بانتظار التجميع
  stats: {
    totalCrafted: 0,
    totalCraftingTime: 0,
    recipesUnlocked: 0,
    bestItem: null,
    bestValue: 0
  },
  initialized: false,

  // ============================================================
  // 🚀 التهيئة
  // ============================================================
  init: function(game) {
    this.game = game || GAME.game;
    this.activeQueue = [];
    this.completedItems = [];
    this.stats = {
      totalCrafted: 0,
      totalCraftingTime: 0,
      recipesUnlocked: 0,
      bestItem: null,
      bestValue: 0
    };

    this.initialized = true;
    console.log('[CraftingSystem] ✅ تم التهيئة - ' + this.getRecipeCount() + ' وصفة متاحة');
    console.log('[CraftingSystem] 📋 الفئات: طعام(' + this.getRecipesByCategory('food').length + ') | أدوات(' + this.getRecipesByCategory('tools').length + ') | مباني(' + this.getRecipesByCategory('buildings').length + ') | هدايا(' + this.getRecipesByCategory('gifts').length + ')');
  },

  // ============================================================
  // 🔄 التحديث (يُستدعى كل frame)
  // ============================================================
  update: function(deltaTime) {
    if (!this.initialized) return;

    // تحديث طابور الصناعة
    this.processQueue(deltaTime);
  },

  // ============================================================
  // 🍳 الصناعة - الدالة الرئيسية
  // ============================================================
  craft: function(recipeId, quantity) {
    quantity = quantity || 1;

    // التحقق من وجود الوصفة
    var recipe = this.getRecipe(recipeId);
    if (!recipe) {
      return { success: false, message: '❌ الوصفة غير موجودة: ' + recipeId };
    }

    // التحقق من حالة اللعبة
    var state = this.game ? this.game.state : null;
    if (!state) {
      return { success: false, message: '❌ لا يوجد حالة لعبة' };
    }

    // التحقق من المستوى المطلوب
    if (state.level < recipe.unlockLevel) {
      return {
        success: false,
        message: '🔒 المستوى المطلوب: ' + recipe.unlockLevel + ' | مستواك الحالي: ' + state.level
      };
    }

    // التحقق من عدد الوظائف النشطة
    if (this.activeQueue.length >= this.maxQueueSize) {
      return {
        success: false,
        message: '⏳ طابور الصناعة ممتلئ (' + this.activeQueue.length + '/' + this.maxQueueSize + ') - انتظر حتى تكتمل وظيفة'
      };
    }

    // التحقق من توفر المواد
    var checkResult = this.canCraft(recipeId, quantity);
    if (!checkResult.canCraft) {
      return {
        success: false,
        message: '❌ مواد ناقصة:\n' + checkResult.missing.join('\n')
      };
    }

    // إزالة المواد من المخزون
    for (var ingredient in recipe.inputs) {
      if (!recipe.inputs.hasOwnProperty(ingredient)) continue;
      var required = recipe.inputs[ingredient] * quantity;
      state.inventory[ingredient] = (state.inventory[ingredient] || 0) - required;
    }

    // حساب وقت الصناعة الكلي (بالثواني)
    var totalTime = recipe.craftTime * quantity;

    // إنشاء وظيفة الصناعة
    var craftJob = {
      id: this.generateJobId(),
      recipeId: recipeId,
      recipe: recipe,
      quantity: quantity,
      timeRemaining: totalTime,
      totalTime: totalTime,
      startTime: Date.now(),
      category: recipe.category,
      status: 'crafting'
    };

    // إضافة للطابور
    this.activeQueue.push(craftJob);

    // تحديث الإحصائيات
    this.stats.totalCraftingTime += totalTime;

    // XP Reward (يُحصل عليه فوراً)
    if (state.xp !== undefined) {
      state.xp += recipe.xpReward * quantity;
    }

    var result = {
      success: true,
      message: '🍳 جاري تحضير ' + recipe.nameAr + '...',
      jobId: craftJob.id,
      recipe: recipe.nameAr,
      recipeId: recipeId,
      quantity: quantity,
      craftTime: totalTime,
      xpGained: recipe.xpReward * quantity,
      category: recipe.category,
      queuePosition: this.activeQueue.length
    };

    console.log('[CraftingSystem] 🍳 صناعة ' + quantity + 'x ' + recipe.nameAr + ' - وقت: ' + totalTime + ' ثانية');
    console.log('[CraftingSystem] 📋 الطابور: ' + this.activeQueue.length + '/' + this.maxQueueSize);

    return result;
  },

  // ============================================================
  // ✅ التحقق من إمكانية الصناعة
  // ============================================================
  canCraft: function(recipeId, quantity) {
    quantity = quantity || 1;

    var recipe = this.getRecipe(recipeId);
    if (!recipe) {
      return { canCraft: false, missing: ['الوصفة غير موجودة'] };
    }

    var state = this.game ? this.game.state : null;
    if (!state) {
      return { canCraft: false, missing: ['لا يوجد حالة لعبة'] };
    }

    var missing = [];

    // التحقق من المستوى
    if (state.level < recipe.unlockLevel) {
      missing.push('المستوى المطلوب: ' + recipe.unlockLevel + ' (مستواك: ' + state.level + ')');
    }

    // التحقق من الطابور
    if (this.activeQueue.length >= this.maxQueueSize) {
      missing.push('طابور الصناعة ممتلئ (' + this.activeQueue.length + '/' + this.maxQueueSize + ')');
    }

    // التحقق من المواد
    for (var ingredient in recipe.inputs) {
      if (!recipe.inputs.hasOwnProperty(ingredient)) continue;
      var required = recipe.inputs[ingredient] * quantity;
      var available = state.inventory[ingredient] || 0;
      if (available < required) {
        var ingName = this.getItemName(ingredient);
        missing.push(ingName + ' (المطلوب: ' + required + ' | المتوفر: ' + available + ')');
      }
    }

    return {
      canCraft: missing.length === 0,
      missing: missing,
      ingredients: this.getIngredientStatus(recipe, quantity)
    };
  },

  // ============================================================
  // 🔍 جلب وصفة بالاسم
  // ============================================================
  getRecipe: function(recipeId) {
    return GAME.CRAFTING_RECIPES_FULL[recipeId] || null;
  },

  // ============================================================
  // 📋 جلب جميع الوصفات
  // ============================================================
  getAllRecipes: function() {
    return GAME.CRAFTING_RECIPES_FULL;
  },

  // ============================================================
  // 📂 جلب وصفات حسب الفئة
  // ============================================================
  getRecipesByCategory: function(category) {
    var recipes = GAME.CRAFTING_RECIPES_FULL;
    var result = [];

    for (var key in recipes) {
      if (recipes.hasOwnProperty(key) && recipes[key].category === category) {
        result.push(recipes[key]);
      }
    }

    return result;
  },

  // ============================================================
  // 🔓 جلب الوصفات المفتوحة حسب مستوى اللاعب
  // ============================================================
  getUnlockedRecipes: function(level) {
    var state = this.game ? this.game.state : null;
    level = level || (state ? state.level : 1);

    var recipes = GAME.CRAFTING_RECIPES_FULL;
    var result = [];

    for (var key in recipes) {
      if (recipes.hasOwnProperty(key) && recipes[key].unlockLevel <= level) {
        result.push(recipes[key]);
      }
    }

    return result;
  },

  // ============================================================
  // 🔒 جلب الوصفات المقفلة
  // ============================================================
  getLockedRecipes: function(level) {
    var state = this.game ? this.game.state : null;
    level = level || (state ? state.level : 1);

    var recipes = GAME.CRAFTING_RECIPES_FULL;
    var result = [];

    for (var key in recipes) {
      if (recipes.hasOwnProperty(key) && recipes[key].unlockLevel > level) {
        result.push(recipes[key]);
      }
    }

    return result;
  },

  // ============================================================
  // ⏱️ معالجة طابور الصناعة
  // ============================================================
  processQueue: function(deltaTime) {
    if (this.activeQueue.length === 0) return;

    for (var i = this.activeQueue.length - 1; i >= 0; i--) {
      var job = this.activeQueue[i];
      if (job.status !== 'crafting') continue;

      // تقلptimeRemaining
      job.timeRemaining -= deltaTime;

      // التحقق من الاكتمال
      if (job.timeRemaining <= 0) {
        this.completeJob(job, i);
      }
    }
  },

  // ============================================================
  // ✅ إكمال وظيفة صناعة
  // ============================================================
  completeJob: function(job, queueIndex) {
    var state = this.game ? this.game.state : null;

    // إضافة المنتج النهائي للمخزون
    if (state && state.inventory) {
      var outputKey = job.recipeId;
      if (!state.inventory[outputKey]) state.inventory[outputKey] = 0;
      state.inventory[outputKey] += job.recipe.quantity * job.quantity;
    }

    // تحديث الإحصائيات
    this.stats.totalCrafted += job.recipe.quantity * job.quantity;

    // تتبع أفضل صناعة
    var itemValue = job.recipe.sellPrice.base * job.recipe.quantity * job.quantity;
    if (itemValue > this.stats.bestValue) {
      this.stats.bestValue = itemValue;
      this.stats.bestItem = job.recipeId;
    }

    // إضافة للمنتجات المكتملة
    this.completedItems.push({
      recipeId: job.recipeId,
      recipe: job.recipe,
      quantity: job.recipe.quantity * job.quantity,
      completedAt: Date.now()
    });

    // إزالة من الطابور
    this.activeQueue.splice(queueIndex, 1);

    var itemName = job.recipe.nameAr;
    console.log('[CraftingSystem] ✅ اكتملت صناعة ' + (job.recipe.quantity * job.quantity) + 'x ' + itemName);
    console.log('[CraftingSystem] 📦 المنتج جاهز للجمع!');
  },

  // ============================================================
  // 📦 جمع المنتجات المكتملة
  // ============================================================
  collectCompleted: function() {
    if (this.completedItems.length === 0) {
      return { success: false, message: '📦 لا توجد منتجات مكتملة بانتظار التجميع' };
    }

    var collected = this.completedItems.slice();
    this.completedItems = [];

    var summary = collected.map(function(item) {
      return item.recipe.icon + ' ' + item.quantity + 'x ' + item.recipe.nameAr;
    }).join(', ');

    console.log('[CraftingSystem] 📦 تم جمع: ' + summary);

    return {
      success: true,
      message: '📦 تم جمع المنتجات: ' + summary,
      items: collected
    };
  },

  // ============================================================
  // ❌ إلغاء وظيفة صناعة
  // ============================================================
  cancelJob: function(jobId) {
    var state = this.game ? this.game.state : null;

    for (var i = 0; i < this.activeQueue.length; i++) {
      var job = this.activeQueue[i];
      if (job.id === jobId) {
        // إعادة المواد للمخزون
        if (state && state.inventory) {
          for (var ingredient in job.recipe.inputs) {
            if (!job.recipe.inputs.hasOwnProperty(ingredient)) continue;
            var refund = job.recipe.inputs[ingredient] * job.quantity;
            state.inventory[ingredient] = (state.inventory[ingredient] || 0) + refund;
          }
        }

        var itemName = job.recipe.nameAr;
        this.activeQueue.splice(i, 1);

        console.log('[CraftingSystem] ❌ تم إلغاء صناعة ' + itemName);

        return {
          success: true,
          message: '❌ تم إلغاء صناعة ' + itemName + ' وإعادة المواد',
          recipe: itemName
        };
      }
    }

    return { success: false, message: '❌ الوظيفة غير موجودة' };
  },

  // ============================================================
  // 📊 حالة طابور الصناعة
  // ============================================================
  getQueueStatus: function() {
    return {
      active: this.activeQueue.length,
      max: this.maxQueueSize,
      available: this.maxQueueSize - this.activeQueue.length,
      jobs: this.activeQueue.map(function(job) {
        return {
          id: job.id,
          recipe: job.recipe.nameAr,
          icon: job.recipe.icon,
          quantity: job.recipe.quantity * job.quantity,
          timeRemaining: Math.max(0, Math.ceil(job.timeRemaining)),
          totalTime: job.totalTime,
          progress: Math.max(0, Math.min(100, Math.round(((job.totalTime - job.timeRemaining) / job.totalTime) * 100)))
        };
      }),
      completed: this.completedItems.length
    };
  },

  // ============================================================
  // 📊 إحصائيات الصناعة
  // ============================================================
  getStats: function() {
    return {
      totalCrafted: this.stats.totalCrafted,
      totalCraftingTime: this.stats.totalCraftingTime,
      bestItem: this.stats.bestItem ? this.getRecipe(this.stats.bestItem) : null,
      bestValue: this.stats.bestValue,
      recipesUnlocked: this.getUnlockedRecipes().length,
      totalRecipes: this.getRecipeCount(),
      queueStatus: this.getQueueStatus()
    };
  },

  // ============================================================
  // 🔢 عدد الوصفات الكلي
  // ============================================================
  getRecipeCount: function() {
    return Object.keys(GAME.CRAFTING_RECIPES_FULL).length;
  },

  // ============================================================
  // 🏷️ جلب اسم صنف من Marketplace
  // ============================================================
  getItemName: function(itemKey) {
    if (GAME.MARKETPLACE_ITEMS && GAME.MARKETPLACE_ITEMS[itemKey]) {
      return GAME.MARKETPLACE_ITEMS[itemKey].nameAr || itemKey;
    }
    // البحث في وصفة أخرى
    var recipe = this.getRecipe(itemKey);
    if (recipe) return recipe.nameAr;
    return itemKey;
  },

  // ============================================================
  // 📋 حالة المكونات لوصفة معينة
  // ============================================================
  getIngredientStatus: function(recipe, quantity) {
    quantity = quantity || 1;
    var state = this.game ? this.game.state : null;
    var result = [];

    for (var ingredient in recipe.inputs) {
      if (!recipe.inputs.hasOwnProperty(ingredient)) continue;
      var required = recipe.inputs[ingredient] * quantity;
      var available = state ? (state.inventory[ingredient] || 0) : 0;

      result.push({
        key: ingredient,
        name: this.getItemName(ingredient),
        required: required,
        available: available,
        sufficient: available >= required
      });
    }

    return result;
  },

  // ============================================================
  // 🔧 توليد معرف فريد للوظيفة
  // ============================================================
  generateJobId: function() {
    return 'craft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  },

  // ============================================================
  // 💾 حفظ حالة نظام الصناعة
  // ============================================================
  saveState: function() {
    return {
      activeQueue: this.activeQueue.map(function(job) {
        return {
          id: job.id,
          recipeId: job.recipeId,
          quantity: job.quantity,
          timeRemaining: Math.max(0, job.timeRemaining),
          totalTime: job.totalTime,
          startTime: job.startTime,
          category: job.category,
          status: job.status
        };
      }),
      completedItems: this.completedItems.map(function(item) {
        return {
          recipeId: item.recipeId,
          quantity: item.quantity,
          completedAt: item.completedAt
        };
      }),
      stats: JSON.parse(JSON.stringify(this.stats))
    };
  },

  // ============================================================
  // 📂 تحميل حالة نظام الصناعة
  // ============================================================
  loadState: function(savedData) {
    if (!savedData) return false;

    // استعادة طابور الصناعة
    if (savedData.activeQueue) {
      this.activeQueue = savedData.activeQueue.map(function(jobData) {
        var recipe = GAME.CRAFTING_RECIPES_FULL[jobData.recipeId];
        return {
          id: jobData.id,
          recipeId: jobData.recipeId,
          recipe: recipe,
          quantity: jobData.quantity,
          timeRemaining: jobData.timeRemaining,
          totalTime: jobData.totalTime,
          startTime: jobData.startTime,
          category: jobData.category,
          status: jobData.status
        };
      }).filter(function(job) {
        return job.recipe !== null; // تصفية الوصفات غير الموجودة
      });
    }

    // استعادة المنتجات المكتملة
    if (savedData.completedItems) {
      this.completedItems = savedData.completedItems.map(function(itemData) {
        var recipe = GAME.CRAFTING_RECIPES_FULL[itemData.recipeId];
        return {
          recipeId: itemData.recipeId,
          recipe: recipe,
          quantity: itemData.quantity,
          completedAt: itemData.completedAt
        };
      }).filter(function(item) {
        return item.recipe !== null;
      });
    }

    // استعادة الإحصائيات
    if (savedData.stats) {
      this.stats = savedData.stats;
    }

    console.log('[CraftingSystem] 📂 تم تحميل الحالة - طابور: ' + this.activeQueue.length + ' | مكتمل: ' + this.completedItems.length);
    return true;
  }
};

console.log('[CraftingSystem] 📋 تم تعريف النظام - ' + Object.keys(GAME.CRAFTING_RECIPES_FULL).length + ' وصفة');
