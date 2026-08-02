/**
 * EconomySystem.js - نظام الاقتصاد المتقدم
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - نظام صناعة (Crafting) مع 12+ وصفة
 * - سوق ديناميكي (Marketplace) بأسعار تتغير يومياً
 * - نظام الضرائب (5%)
 * - نظام القروض
 * - إحصائيات البيع والشراء
 * - عرض وطلب على المنتجات
 * - خصم بالجملة
 * - حفظ وتحميل الحالة
 * - تكامل مع الأنظمة الأخرى (FarmingSystem, AnimalsSystem, BuildingsSystem)
 */

var GAME = GAME || {};

// ============================================================
// 🍞 بيانات الوصفات (12 وصفة)
// ============================================================
GAME.CRAFTING_RECIPES = {
  // === وصفات المخزن (Grain-based) ===
  bread: {
    name: 'Bread', nameAr: 'خبز',
    icon: '🍞',
    category: 'bakery',
    inputs: { wheat: 3 },
    craftTime: 1, // ساعات
    sellPrice: { base: 80, silver: 112, gold: 160, iridium: 320 },
    xpReward: 15,
    description: 'خبز طازج من القمح',
    descriptionAr: 'خبز طازج من القمح المطحون',
    unlockLevel: 1
  },
  flour: {
    name: 'Flour', nameAr: 'طحين',
    icon: '🌾',
    category: 'bakery',
    inputs: { wheat: 2 },
    craftTime: 0.5,
    sellPrice: { base: 45, silver: 63, gold: 90, iridium: 180 },
    xpReward: 8,
    description: 'طحين ناعم',
    descriptionAr: 'طحين ناعم جاهز للطبخ',
    unlockLevel: 1
  },

  // === وصفات الألبان (Dairy) ===
  cheese: {
    name: 'Cheese', nameAr: 'جبنة',
    icon: '🧀',
    category: 'dairy',
    inputs: { milk: 2 },
    craftTime: 2,
    sellPrice: { base: 120, silver: 168, gold: 240, iridium: 480 },
    xpReward: 20,
    description: 'جبنة طازجة من الحليب',
    descriptionAr: 'جبنة طازجة مصنوعة من حليب البقر',
    unlockLevel: 2
  },
  butter: {
    name: 'Butter', nameAr: 'زبدة',
    icon: '🧈',
    category: 'dairy',
    inputs: { milk: 1 },
    craftTime: 1,
    sellPrice: { base: 90, silver: 126, gold: 180, iridium: 360 },
    xpReward: 12,
    description: 'زبدة طازجة',
    descriptionAr: 'زبدة طازجة من حليب البقر',
    unlockLevel: 1
  },
  ice_cream: {
    name: 'Ice Cream', nameAr: 'آيس كريم',
    icon: '🍦',
    category: 'dairy',
    inputs: { milk: 1, sugar: 1 },
    craftTime: 3,
    sellPrice: { base: 150, silver: 210, gold: 300, iridium: 600 },
    xpReward: 25,
    description: 'آيس كريم بنكهة الفراولة',
    descriptionAr: 'آيس كريم مجمد بنكهة الفواكه',
    unlockLevel: 3
  },

  // === وصفات الفاكهة (Fruit) ===
  jam: {
    name: 'Fruit Jam', nameAr: 'مربى فاكهة',
    icon: '🫙',
    category: 'preserves',
    inputs: { apple: 2, sugar: 1 },
    craftTime: 2,
    sellPrice: { base: 110, silver: 154, gold: 220, iridium: 440 },
    xpReward: 18,
    description: 'مربى تفاح لذيذة',
    descriptionAr: 'مربى تفاح طازج ومحلى',
    unlockLevel: 2
  },
  juice: {
    name: 'Apple Juice', nameAr: 'عصير تفاح',
    icon: '🧃',
    category: 'beverage',
    inputs: { apple: 3 },
    craftTime: 1.5,
    sellPrice: { base: 100, silver: 140, gold: 200, iridium: 400 },
    xpReward: 14,
    description: 'عصير تفاح طازج',
    descriptionAr: 'عصير تفاح طبيعي 100%',
    unlockLevel: 1
  },
  wine: {
    name: 'Wine', nameAr: 'نبيذ',
    icon: '🍷',
    category: 'beverage',
    inputs: { grape: 4 },
    craftTime: 5,
    sellPrice: { base: 200, silver: 280, gold: 400, iridium: 800 },
    xpReward: 30,
    description: 'نبيذ فاخر من العنب',
    descriptionAr: 'نبيذ معتّق من أجود أنواع العنب',
    unlockLevel: 4
  },
  grape_juice: {
    name: 'Grape Juice', nameAr: 'عصير عنب',
    icon: '🍇',
    category: 'beverage',
    inputs: { grape: 3 },
    craftTime: 1.5,
    sellPrice: { base: 105, silver: 147, gold: 210, iridium: 420 },
    xpReward: 15,
    description: 'عصير عنب طازج',
    descriptionAr: 'عصير عنب طبيعي بدون سكر',
    unlockLevel: 2
  },

  // === وصفات مطبخية (Cooking) ===
  soup: {
    name: 'Vegetable Soup', nameAr: 'حساء خضار',
    icon: '🍲',
    category: 'cooking',
    inputs: { tomato: 2, carrot: 1, potato: 1 },
    craftTime: 2,
    sellPrice: { base: 130, silver: 182, gold: 260, iridium: 520 },
    xpReward: 22,
    description: 'حساء خضار ساخن ولذيذ',
    descriptionAr: 'حساء خضار متنوع مطبوخ على نار هادئة',
    unlockLevel: 2
  },
  salad: {
    name: 'Fresh Salad', nameAr: 'سلطة طازجة',
    icon: '🥗',
    category: 'cooking',
    inputs: { lettuce: 2, tomato: 1 },
    craftTime: 0.5,
    sellPrice: { base: 75, silver: 105, gold: 150, iridium: 300 },
    xpReward: 10,
    description: 'سلطة خضار طازجة',
    descriptionAr: 'سلطة خضار خضراء متنوعة',
    unlockLevel: 1
  },

  // === وصفات خاصة (Specialty) ===
  pumpkin_pie: {
    name: 'Pumpkin Pie', nameAr: 'فطيرة يقطين',
    icon: '🥧',
    category: 'dessert',
    inputs: { pumpkin: 1, egg: 2, wheat: 1, sugar: 1 },
    craftTime: 4,
    sellPrice: { base: 250, silver: 350, gold: 500, iridium: 1000 },
    xpReward: 35,
    description: 'فطيرة يقطين بالقرفة',
    descriptionAr: 'فطيرة يقطين تقليدية مع بهارات 특ية',
    unlockLevel: 4
  },
  sunflower_oil: {
    name: 'Sunflower Oil', nameAr: 'زيت عباد الشمس',
    icon: '🫒',
    category: 'oil',
    inputs: { sunflower: 3 },
    craftTime: 2,
    sellPrice: { base: 135, silver: 189, gold: 270, iridium: 540 },
    xpReward: 18,
    description: 'زيت عباد الشمس النقي',
    descriptionAr: 'زيت نباتي مستخلص من بذور عباد الشمس',
    unlockLevel: 3
  }
};

// ============================================================
// 🛒 بيانات السوق (Marketplace) - أسعار أساسية للمنتجات
// ============================================================
GAME.MARKETPLACE_ITEMS = {
  // === مبيعات الزراعة ===
  wheat: { name: 'Wheat', nameAr: 'قمح', category: 'crop', icon: '🌾', basePrice: 25 },
  carrot: { name: 'Carrot', nameAr: 'جزر', category: 'crop', icon: '🥕', basePrice: 35 },
  potato: { name: 'Potato', nameAr: 'بطاطس', category: 'crop', icon: '🥔', basePrice: 30 },
  tomato: { name: 'Tomato', nameAr: 'طماطم', category: 'crop', icon: '🍅', basePrice: 40 },
  corn: { name: 'Corn', nameAr: 'ذرة', category: 'crop', icon: '🌽', basePrice: 50 },
  apple: { name: 'Apple', nameAr: 'تفاح', category: 'crop', icon: '🍎', basePrice: 80 },
  pumpkin: { name: 'Pumpkin', nameAr: 'يقطين', category: 'crop', icon: '🎃', basePrice: 100 },
  grape: { name: 'Grape', nameAr: 'عنب', category: 'crop', icon: '🍇', basePrice: 48 },
  lettuce: { name: 'Lettuce', nameAr: 'خس', category: 'crop', icon: '🥬', basePrice: 28 },
  sunflower: { name: 'Sunflower', nameAr: 'عباد الشمس', category: 'crop', icon: '🌻', basePrice: 45 },
  cranberries: { name: 'Cranberries', nameAr: 'توت أحمر', category: 'crop', icon: '🫐', basePrice: 55 },
  pepper: { name: 'Pepper', nameAr: 'فلفل', category: 'crop', icon: '🌶️', basePrice: 38 },
  eggplant: { name: 'Eggplant', nameAr: 'باذنجان', category: 'crop', icon: '🍆', basePrice: 42 },

  // === مبيعات الحيوانات ===
  egg: { name: 'Egg', nameAr: 'بيضة', category: 'animal', icon: '🥚', basePrice: 50 },
  milk: { name: 'Milk', nameAr: 'حليب', category: 'animal', icon: '🥛', basePrice: 125 },
  truffle: { name: 'Truffle', nameAr: 'كمأة', category: 'animal', icon: '🍄', basePrice: 200 },
  duck_egg: { name: 'Duck Egg', nameAr: 'بيضة بطة', category: 'animal', icon: '🥚', basePrice: 60 },
  wool: { name: 'Wool', nameAr: 'صوف', category: 'animal', icon: '🧶', basePrice: 150 },

  // === مبيعات الصناعة (الوصفات) ===
  bread: { name: 'Bread', nameAr: 'خبز', category: 'crafted', icon: '🍞', basePrice: 80 },
  flour: { name: 'Flour', nameAr: 'طحين', category: 'crafted', icon: '🌾', basePrice: 45 },
  cheese: { name: 'Cheese', nameAr: 'جبنة', category: 'crafted', icon: '🧀', basePrice: 120 },
  butter: { name: 'Butter', nameAr: 'زبدة', category: 'crafted', icon: '🧈', basePrice: 90 },
  ice_cream: { name: 'Ice Cream', nameAr: 'آيس كريم', category: 'crafted', icon: '🍦', basePrice: 150 },
  jam: { name: 'Fruit Jam', nameAr: 'مربى فاكهة', category: 'crafted', icon: '🫙', basePrice: 110 },
  juice: { name: 'Apple Juice', nameAr: 'عصير تفاح', category: 'crafted', icon: '🧃', basePrice: 100 },
  wine: { name: 'Wine', nameAr: 'نبيذ', category: 'crafted', icon: '🍷', basePrice: 200 },
  soup: { name: 'Vegetable Soup', nameAr: 'حساء خضار', category: 'crafted', icon: '🍲', basePrice: 130 },
  salad: { name: 'Fresh Salad', nameAr: 'سلطة طازجة', category: 'crafted', icon: '🥗', basePrice: 75 },
  pumpkin_pie: { name: 'Pumpkin Pie', nameAr: 'فطيرة يقطين', category: 'crafted', icon: '🥧', basePrice: 250 },
  sunflower_oil: { name: 'Sunflower Oil', nameAr: 'زيت عباد الشمس', category: 'crafted', icon: '🫒', basePrice: 135 },

  // === مواد مشتراة (للبيع فقط) ===
  wood: { name: 'Wood', nameAr: 'خشب', category: 'material', icon: '🪵', basePrice: 5 },
  stone: { name: 'Stone', nameAr: 'حجر', category: 'material', icon: '🪨', basePrice: 5 },
  nails: { name: 'Nails', nameAr: 'مسامير', category: 'material', icon: '🔩', basePrice: 8 },
  hay: { name: 'Hay', nameAr: 'تبن', category: 'material', icon: '🌾', basePrice: 3 },
  iron: { name: 'Iron', nameAr: 'حديد', category: 'material', icon: '⛓️', basePrice: 15 },
  glass: { name: 'Glass', nameAr: 'زجاج', category: 'material', icon: '🔍', basePrice: 12 },
  sugar: { name: 'Sugar', nameAr: 'سكر', category: 'material', icon: '🍬', basePrice: 10 },
  egg: { name: 'Egg', nameAr: 'بيضة', category: 'animal', icon: '🥚', basePrice: 50 }
};

// ============================================================
// 📦 بيانات مواد الشراء (يمكن شراؤها من السوق)
// ============================================================
GAME.SHOP_ITEMS = {
  seeds: {
    wheat_seed: { name: 'Wheat Seeds', nameAr: 'بذور قمح', item: 'wheat', cost: 10, category: 'seeds' },
    carrot_seed: { name: 'Carrot Seeds', nameAr: 'بذور جزر', item: 'carrot', cost: 15, category: 'seeds' },
    potato_seed: { name: 'Potato Seeds', nameAr: 'بذور بطاطس', item: 'potato', cost: 12, category: 'seeds' },
    tomato_seed: { name: 'Tomato Seeds', nameAr: 'بذور طماطم', item: 'tomato', cost: 20, category: 'seeds' },
    corn_seed: { name: 'Corn Seeds', nameAr: 'بذور ذرة', item: 'corn', cost: 25, category: 'seeds' },
    apple_seed: { name: 'Apple Sapling', nameAr: 'شتلة تفاح', item: 'apple', cost: 50, category: 'seeds' },
    pumpkin_seed: { name: 'Pumpkin Seeds', nameAr: 'بذور يقطين', item: 'pumpkin', cost: 50, category: 'seeds' },
    grape_seed: { name: 'Grape Seeds', nameAr: 'بذور عنب', item: 'grape', cost: 26, category: 'seeds' },
    sunflower_seed: { name: 'Sunflower Seeds', nameAr: 'بذور عباد الشمس', item: 'sunflower', cost: 24, category: 'seeds' }
  },
  fertilizers: {
    basic_fert: { name: 'Basic Fertilizer', nameAr: 'سماد أساسي', cost: 10, category: 'fertilizer' },
    quality_fert: { name: 'Quality Fertilizer', nameAr: 'سماد جيد', cost: 25, category: 'fertilizer' },
    deluxe_fert: { name: 'Deluxe Fertilizer', nameAr: 'سماد فاخر', cost: 50, category: 'fertilizer' }
  },
  materials: {
    sugar: { name: 'Sugar', nameAr: 'سكر', cost: 10, category: 'material' },
    nails: { name: 'Nails', nameAr: 'مسامير', cost: 8, category: 'material' },
    hay: { name: 'Hay', nameAr: 'تبن', cost: 3, category: 'material' }
  }
};

// ============================================================
// 🏦 نظام الضرائب
// ============================================================
GAME.TAX_CONFIG = {
  rate: 0.05,            // 5% ضريبة على المبيعات
  minThreshold: 100,     // لا ضريبة على مبيعات أقل من 100
  exemptions: [          // معفون من الضريبة
    'wood', 'stone', 'nails', 'hay', 'iron', 'glass'
  ],
  dailyTaxReport: true   // عرض تقرير الضرائب يومياً
};

// ============================================================
// 💰 نظام القروض
// ============================================================
GAME.LOAN_CONFIG = {
  maxLoans: 3,           // الحد الأقصى للقروض النشطة
  interestRate: 0.02,    // 2% فائدة يومية
  maxAmount: 50000,      // الحد الأقصى للقرض
  minAmount: 500,        // الحد الأدنى للقرض
  gracePeriod: 3,        // أيام السماح قبل فرض الفائدة
  penaltyRate: 0.05      // 5% غرامة تأخير
};

// ============================================================
// 📊 نظام إحصائيات البيع والشراء
// ============================================================
GAME.ECONOMY_STATS_DEFAULT = {
  totalSold: 0,           // إجمالي عدد العناصر المباعة
  totalPurchased: 0,      // إجمالي عدد العناصر المشتراة
  totalRevenue: 0,        // إجمالي الإيرادات
  totalExpenses: 0,       // إجمالي المصروفات
  totalTaxes: 0,          // إجمالي الضرائب المدفوعة
  totalLoanInterest: 0,   // إجمالي فوائد القروض
  totalCrafted: 0,        // إجمالي عدد المنتجات المصنوعة
  totalCraftingValue: 0,  // إجمالي قيمة المنتجات المصنوعة
  itemsSold: {},          // عدد كل صنف مباع
  itemsPurchased: {},     // عدد كل صنف مشترى
  dailySales: [],         // سجل المبيعات اليومية (آخر 30 يوم)
  dailyPurchases: [],     // سجل المشتريات اليومية (آخر 30 يوم)
  bestSaleDay: 0,         // أفضل يوم مبيعات
  bestSaleAmount: 0,      // أعلى مبلغ مبيعة في يوم واحد
  richestDay: 0,          // أغنى يوم (صافي ربح)
  richestAmount: 0        // أعلى صافي ربح في يوم واحد
};

// ============================================================
// 💰 نظام EconomySystem الرئيسي
// ============================================================
GAME.EconomySystem = {
  // === المتغيرات الداخلية ===
  marketPrices: {},         // الأسعار الحالية للسوق
  priceHistory: {},         // سجل تغير الأسعار (آخر 30 يوم)
  activeLoans: [],          // القروض النشطة
  stats: {},                // إحصائيات البيع والشراء
  craftingQueue: [],        // طابور الصناعة النشط
  initialized: false,

  // ============================================================
  // 🚀 التهيئة
  // ============================================================
  init: function() {
    // تهيئة الأسعار الحالية
    this.marketPrices = {};
    this.priceHistory = {};
    this.activeLoans = [];
    this.stats = JSON.parse(JSON.stringify(GAME.ECONOMY_STATS_DEFAULT));
    this.craftingQueue = [];

    // توليد أسعار البداية لكل صنف
    var items = GAME.MARKETPLACE_ITEMS;
    for (var key in items) {
      if (items.hasOwnProperty(key)) {
        var item = items[key];
        this.marketPrices[key] = item.basePrice;
        this.priceHistory[key] = [];
      }
    }

    this.initialized = true;
    console.log('[EconomySystem] ✅ تم التهيئة - ' + Object.keys(items).length + ' صنف في السوق');
    console.log('[EconomySystem] 💰 الضرائب: ' + (GAME.TAX_CONFIG.rate * 100) + '% | الحد الأدنى: ' + GAME.TAX_CONFIG.minThreshold);
    console.log('[EconomySystem] 🏦 القروض: فائدة ' + (GAME.LOAN_CONFIG.interestRate * 100) + '% يومياً');
  },

  // ============================================================
  // 📅 تحديث يومي (يُستدعى مع تغيير اليوم)
  // ============================================================
  updateDay: function(newDay) {
    console.log('[EconomySystem] 📅 تحديث يوم ' + newDay);

    // 1. تحديث أسعار السوق
    this.updateMarketPrices();

    // 2. معالجة القروض (فوائد)
    this.processLoans(newDay);

    // 3. تحديث طابور الصناعة (تقل وقت التحضير)
    this.processCraftingQueue();

    // 4. حفظ إحصائيات اليوم
    this.recordDailyStats(newDay);

    // 5. طباعة ملخص يومي
    this.printDailySummary(newDay);
  },

  // ============================================================
  // 🛒 تحديث أسعار السوق (ديناميكي)
  // ============================================================
  updateMarketPrices: function() {
    var items = GAME.MARKETPLACE_ITEMS;
    var seasonPrices = this.getSeasonalMultipliers();

    for (var key in items) {
      if (!items.hasOwnProperty(key)) continue;
      var item = items[key];

      // حفظ السعر القديم في السجل
      if (!this.priceHistory[key]) this.priceHistory[key] = [];
      this.priceHistory[key].push(this.marketPrices[key]);
      if (this.priceHistory[key].length > 30) {
        this.priceHistory[key].shift(); // حفظ آخر 30 يوم فقط
      }

      // حساب التغيير العشوائي (-15% إلى +15%)
      var randomChange = (Math.random() - 0.5) * 0.3; // -0.15 إلى +0.15

      // حساب تأثير العرض والطلب (بناءً على المخزون الحالي)
      var supplyDemand = this.getSupplyDemandFactor(key);

      // حساب المضاعف الموسمي
      var seasonMult = seasonPrices[item.category] || 1.0;

      // حساب السعر الجديد
      var newPrice = this.marketPrices[key] * (1 + randomChange + supplyDemand);
      newPrice *= seasonMult;

      // تحديد السعر ضمن الحدود合理性
      var minPrice = Math.floor(item.basePrice * 0.5); // لا يقل عن 50% من السعر الأساسي
      var maxPrice = Math.ceil(item.basePrice * 3.0);  // لا يزيد عن 300% من السعر الأساسي
      newPrice = Math.max(minPrice, Math.min(maxPrice, Math.round(newPrice)));

      this.marketPrices[key] = newPrice;
    }

    console.log('[EconomySystem] 🔄 تم تحديث أسعار السوق');
  },

  // ============================================================
  // 🌡️ المضاعفات الموسمية
  // ============================================================
  getSeasonalMultipliers: function() {
    var season = GAME.game && GAME.game.state ? (GAME.game.state.season || 'spring') : 'spring';

    var multipliers = {
      spring: { crop: 1.0, animal: 1.1, crafted: 1.0, material: 1.0 },
      summer: { crop: 0.9, animal: 1.2, crafted: 1.1, material: 1.0 },
      autumn: { crop: 1.2, animal: 1.0, crafted: 1.2, material: 1.0 },
      winter: { crop: 1.5, animal: 0.8, crafted: 1.3, material: 1.1 }
    };

    return multipliers[season] || multipliers.spring;
  },

  // ============================================================
  // 📊 حساب معامل العرض والطلب
  // ============================================================
  getSupplyDemandFactor: function(itemKey) {
    var state = GAME.game ? GAME.game.state : null;
    if (!state || !state.inventory) return 0;

    // إذا كان المخزون كبير جداً → انخفاض السعر
    var stock = state.inventory[itemKey] || 0;
    if (stock > 50) return -0.10;   // خصم 10% إذا المخزون > 50
    if (stock > 20) return -0.05;   // خصم 5% إذا المخزون > 20
    if (stock > 10) return -0.02;   // خصم 2% إذا المخزون > 10

    // إذا كان المخزون قليلاً → ارتفاع السعر
    if (stock < 2) return 0.10;     // زيادة 10% إذا المخزون < 2
    if (stock < 5) return 0.05;     // زيادة 5% إذا المخزون < 5

    return 0; // لا تغيير
  },

  // ============================================================
  // 🏷️ بيع منتج
  // ============================================================
  sellItem: function(itemKey, quantity, quality) {
    quality = quality || 'base'; // base, silver, gold, iridium
    quantity = quantity || 1;

    // التحقق من وجود المنتج في المخزون
    var state = GAME.game ? GAME.game.state : null;
    if (!state || !state.inventory) {
      return { success: false, message: 'لا يوجد حالة لعبة' };
    }

    var currentStock = state.inventory[itemKey] || 0;
    if (currentStock < quantity) {
      return { success: false, message: 'مخزون غير كافٍ - المتوفر: ' + currentStock };
    }

    // التحقق من أن المنتج معفي من الضريبة
    var taxConfig = GAME.TAX_CONFIG;
    var isExempt = taxConfig.exemptions.indexOf(itemKey) !== -1;

    // حساب السعر
    var basePrice = this.marketPrices[itemKey] || 0;
    var qualityMultiplier = this.getQualityMultiplier(quality);
    var subtotal = Math.round(basePrice * qualityMultiplier * quantity);

    // حساب الخصم بالجملة
    var bulkDiscount = this.getBulkDiscount(quantity);
    var discountedTotal = Math.round(subtotal * (1 - bulkDiscount));

    // حساب الضريبة
    var taxAmount = 0;
    if (!isExempt && discountedTotal >= taxConfig.minThreshold) {
      taxAmount = Math.round(discountedTotal * taxConfig.rate);
    }

    var finalAmount = discountedTotal - taxAmount;

    // تنفيذ البيع
    state.inventory[itemKey] -= quantity;
    state.money += finalAmount;
    state.stats.totalEarned += finalAmount;

    // تحديث الإحصائيات
    this.stats.totalSold += quantity;
    this.stats.totalRevenue += finalAmount;
    this.stats.totalTaxes += taxAmount;
    if (!this.stats.itemsSold[itemKey]) this.stats.itemsSold[itemKey] = 0;
    this.stats.itemsSold[itemKey] += quantity;

    // طباعة تفاصيل البيع
    var itemName = (GAME.MARKETPLACE_ITEMS[itemKey] || {}).nameAr || itemKey;
    var result = {
      success: true,
      message: '✅ تم البيع بنجاح',
      item: itemName,
      quantity: quantity,
      quality: quality,
      unitPrice: basePrice,
      subtotal: subtotal,
      bulkDiscount: bulkDiscount,
      discountAmount: subtotal - discountedTotal,
      tax: taxAmount,
      finalAmount: finalAmount,
      newBalance: state.money
    };

    console.log('[EconomySystem] 💰 بيع ' + quantity + 'x ' + itemName + ' = ' + finalAmount + ' عملة');
    if (bulkDiscount > 0) {
      console.log('[EconomySystem] 🏷️ خصم بالجملة: ' + (bulkDiscount * 100) + '% (وفرت ' + (subtotal - discountedTotal) + ')');
    }
    if (taxAmount > 0) {
      console.log('[EconomySystem] 🏛️ ضريبة: ' + taxAmount + ' عملة');
    }

    return result;
  },

  // ============================================================
  // 🛒 شراء منتج
  // ============================================================
  buyItem: function(itemKey, quantity) {
    quantity = quantity || 1;

    // البحث عن المنتج في المتجر
    var shopItem = this.findShopItem(itemKey);
    if (!shopItem) {
      return { success: false, message: 'المنتج غير موجود في المتجر' };
    }

    var state = GAME.game ? GAME.game.state : null;
    if (!state) {
      return { success: false, message: 'لا يوجد حالة لعبة' };
    }

    var totalCost = shopItem.cost * quantity;

    // التحقق من الرصيد
    if (state.money < totalCost) {
      return { success: false, message: 'الرصيد غير كافٍ - المطلوب: ' + totalCost + ' | المتوفر: ' + state.money };
    }

    // تنفيذ الشراء
    state.money -= totalCost;
    state.stats.totalEarned -= totalCost;

    // إضافة المنتج للمخزون (إذا كان بذور، أضف للإسم المناسب)
    var inventoryKey = shopItem.item || itemKey;
    if (!state.inventory[inventoryKey]) state.inventory[inventoryKey] = 0;
    state.inventory[inventoryKey] += quantity;

    // تحديث الإحصائيات
    this.stats.totalPurchased += quantity;
    this.stats.totalExpenses += totalCost;
    if (!this.stats.itemsPurchased[itemKey]) this.stats.itemsPurchased[itemKey] = 0;
    this.stats.itemsPurchased[itemKey] += quantity;

    var itemName = shopItem.nameAr || itemKey;
    var result = {
      success: true,
      message: '✅ تم الشراء بنجاح',
      item: itemName,
      quantity: quantity,
      unitCost: shopItem.cost,
      totalCost: totalCost,
      newBalance: state.money
    };

    console.log('[EconomySystem] 🛒 شراء ' + quantity + 'x ' + itemName + ' = ' + totalCost + ' عملة');

    return result;
  },

  // ============================================================
  // 🔍 البحث عن منتج في المتجر
  // ============================================================
  findShopItem: function(itemKey) {
    var shops = GAME.SHOP_ITEMS;
    for (var category in shops) {
      if (shops[category][itemKey]) {
        return shops[category][itemKey];
      }
    }
    return null;
  },

  // ============================================================
  // 🏷️ خصم بالجملة
  // ============================================================
  getBulkDiscount: function(quantity) {
    if (quantity >= 100) return 0.15;  // 15% خصم
    if (quantity >= 50) return 0.10;   // 10% خصم
    if (quantity >= 20) return 0.07;   // 7% خصم
    if (quantity >= 10) return 0.05;   // 5% خصم
    return 0;
  },

  // ============================================================
  // ⭐ مضاعف الجودة
  // ============================================================
  getQualityMultiplier: function(quality) {
    var multipliers = {
      base: 1.0,
      silver: 1.4,
      gold: 2.0,
      iridium: 4.0
    };
    return multipliers[quality] || 1.0;
  },

  // ============================================================
  // 🍳 الصناعة (Crafting)
  // ============================================================
  craft: function(recipeKey, quantity) {
    quantity = quantity || 1;

    var recipe = GAME.CRAFTING_RECIPES[recipeKey];
    if (!recipe) {
      return { success: false, message: 'الوصفة غير موجودة: ' + recipeKey };
    }

    var state = GAME.game ? GAME.game.state : null;
    if (!state) {
      return { success: false, message: 'لا يوجد حالة لعبة' };
    }

    // التحقق من المستوى المطلوب
    if (state.level < recipe.unlockLevel) {
      return { success: false, message: 'المستوى المطلوب: ' + recipe.unlockLevel + ' | مستواك: ' + state.level };
    }

    // التحقق من توفر المواد
    var missingItems = [];
    for (var ingredient in recipe.inputs) {
      if (!recipe.inputs.hasOwnProperty(ingredient)) continue;
      var required = recipe.inputs[ingredient] * quantity;
      var available = state.inventory[ingredient] || 0;
      if (available < required) {
        var ingName = (GAME.MARKETPLACE_ITEMS[ingredient] || {}).nameAr || ingredient;
        missingItems.push(ingName + ' (المطلوب: ' + required + ' | المتوفر: ' + available + ')');
      }
    }

    if (missingItems.length > 0) {
      return {
        success: false,
        message: '❌ مواد ناقصة:\n' + missingItems.join('\n')
      };
    }

    // إزالة المواد من المخزون
    for (var ing in recipe.inputs) {
      if (!recipe.inputs.hasOwnProperty(ing)) continue;
      state.inventory[ing] -= recipe.inputs[ing] * quantity;
    }

    // حساب وقت التحضير الكلي
    var totalTime = recipe.craftTime * quantity;

    // إضافة لطابور الصناعة
    var craftJob = {
      recipeKey: recipeKey,
      recipe: recipe,
      quantity: quantity,
      timeRemaining: totalTime,
      totalTime: totalTime,
      startTime: Date.now(),
      category: recipe.category
    };
    this.craftingQueue.push(craftJob);

    // تحديث الإحصائيات
    this.stats.totalCrafted += quantity;
    var craftValue = recipe.sellPrice.base * quantity;
    this.stats.totalCraftingValue += craftValue;

    // XP Reward
    if (state.xp !== undefined) {
      state.xp += recipe.xpReward * quantity;
    }

    var result = {
      success: true,
      message: '🍳 جاري التحضير...',
      recipe: recipe.nameAr,
      quantity: quantity,
      craftTime: totalTime,
      xpGained: recipe.xpReward * quantity,
      category: recipe.category
    };

    console.log('[EconomySystem] 🍳 صناعة ' + quantity + 'x ' + recipe.nameAr + ' - وقت: ' + totalTime + ' ساعات');

    return result;
  },

  // ============================================================
  // ⏱️ معالجة طابور الصناعة
  // ============================================================
  processCraftingQueue: function() {
    var completedItems = [];

    for (var i = this.craftingQueue.length - 1; i >= 0; i--) {
      var job = this.craftingQueue[i];
      job.timeRemaining -= 1; // تقلptimeRemaining بساعة واحدة لكل يوم

      if (job.timeRemaining <= 0) {
        // الصناعة اكتملت - إضافة للمنتج النهائي
        var state = GAME.game ? GAME.game.state : null;
        if (state && state.inventory) {
          if (!state.inventory[job.recipeKey]) state.inventory[job.recipeKey] = 0;
          state.inventory[job.recipeKey] += job.quantity;

          var itemName = (GAME.MARKETPLACE_ITEMS[job.recipeKey] || {}).nameAr || job.recipeKey;
          completedItems.push({
            item: itemName,
            quantity: job.quantity
          });

          console.log('[EconomySystem] ✅ اكتملت صناعة ' + job.quantity + 'x ' + itemName);
        }

        this.craftingQueue.splice(i, 1);
      }
    }

    return completedItems;
  },

  // ============================================================
  // 🏦 نظام القروض
  // ============================================================
  takeLoan: function(amount) {
    // التحقق من الحد الأقصى للقروض النشطة
    if (this.activeLoans.length >= GAME.LOAN_CONFIG.maxLoans) {
      return { success: false, message: '❌ الحد الأقصى للقروض: ' + GAME.LOAN_CONFIG.maxLoans };
    }

    // التحقق من المبلغ
    if (amount < GAME.LOAN_CONFIG.minAmount) {
      return { success: false, message: '❌ الحد الأدنى للقرض: ' + GAME.LOAN_CONFIG.minAmount };
    }
    if (amount > GAME.LOAN_CONFIG.maxAmount) {
      return { success: false, message: '❌ الحد الأقصى للقرض: ' + GAME.LOAN_CONFIG.maxAmount };
    }

    // التحقق من عدم وجود قرض متأخر
    for (var i = 0; i < this.activeLoans.length; i++) {
      if (this.activeLoans[i].daysOverdue > 0) {
        return { success: false, message: '❌ لديك قرض متأخر - سدد أولاً' };
      }
    }

    var state = GAME.game ? GAME.game.state : null;
    if (!state) {
      return { success: false, message: 'لا يوجد حالة لعبة' };
    }

    // إنشاء القرض
    var loan = {
      id: Date.now(),
      amount: amount,
      remaining: amount,
      daysActive: 0,
      daysOverdue: 0,
      totalInterestPaid: 0,
      startDate: state.day || 1,
      isActive: true
    };

    this.activeLoans.push(loan);
    state.money += amount;

    var result = {
      success: true,
      message: '🏦 تم الحصول على قرض بنجاح',
      loanId: loan.id,
      amount: amount,
      interestRate: (GAME.LOAN_CONFIG.interestRate * 100) + '% يومياً',
      newBalance: state.money
    };

    console.log('[EconomySystem] 🏦 قرض جديد: ' + amount + ' عملة | فائدة: ' + (GAME.LOAN_CONFIG.interestRate * 100) + '%');

    return result;
  },

  repayLoan: function(loanId, amount) {
    var state = GAME.game ? GAME.game.state : null;
    if (!state) {
      return { success: false, message: 'لا يوجد حالة لعبة' };
    }

    // البحث عن القرض
    var loan = null;
    for (var i = 0; i < this.activeLoans.length; i++) {
      if (this.activeLoans[i].id === loanId && this.activeLoans[i].isActive) {
        loan = this.activeLoans[i];
        break;
      }
    }

    if (!loan) {
      return { success: false, message: '❌ القرض غير موجود أو مسدود' };
    }

    // حساب المبلغ المطلوب (المتبقي + فوائد)
    var interest = Math.round(loan.remaining * GAME.LOAN_CONFIG.interestRate * loan.daysOverdue);
    var totalDue = loan.remaining + interest;

    // التحقق من الرصيد
    var repayAmount = Math.min(amount, totalDue);
    if (state.money < repayAmount) {
      return { success: false, message: '❌ الرصيد غير كافٍ - المطلوب: ' + totalDue + ' | المتوفر: ' + state.money };
    }

    // سداد القرض
    state.money -= repayAmount;
    loan.remaining -= (repayAmount - interest);
    loan.totalInterestPaid += interest;
    this.stats.totalLoanInterest += interest;

    var result = {
      success: true,
      message: '✅ تم سداد جزء من القرض',
      amountPaid: repayAmount,
      principalPaid: repayAmount - interest,
      interestPaid: interest,
      remaining: loan.remaining,
      newBalance: state.money
    };

    console.log('[EconomySystem] 💳 سداد: ' + repayAmount + ' عملة (الأساس: ' + (repayAmount - interest) + ' | الفائدة: ' + interest + ')');

    // التحقق من السداد الكامل
    if (loan.remaining <= 0) {
      loan.isActive = false;
      result.message = '🎉 تم سداد القرض بالكامل!';
      result.fullyRepaid = true;
      console.log('[EconomySystem] 🎉 تم سداد القرض بالكامل!');
    }

    return result;
  },

  // ============================================================
  // 🏦 معالجة القروض يومياً
  // ============================================================
  processLoans: function(newDay) {
    var config = GAME.LOAN_CONFIG;

    for (var i = 0; i < this.activeLoans.length; i++) {
      var loan = this.activeLoans[i];
      if (!loan.isActive) continue;

      loan.daysActive++;

      // حساب الفائدة بعد فترة السماح
      if (loan.daysActive > config.gracePeriod) {
        var interest = Math.round(loan.remaining * config.interestRate);
        loan.remaining += interest;
        loan.totalInterestPaid += interest;
        this.stats.totalLoanInterest += interest;

        console.log('[EconomySystem] 📈 فائدة قرض: +' + interest + ' عملة (المتبقي: ' + loan.remaining + ')');
      }

      // التحقق من التأخر
      if (loan.daysActive > config.gracePeriod + 7) {
        loan.daysOverdue++;
        var penalty = Math.round(loan.remaining * config.penaltyRate);
        loan.remaining += penalty;
        console.log('[EconomySystem] ⚠️ غرامة تأخير: +' + penalty + ' عملة');
      }
    }
  },

  // ============================================================
  // 📊 حفظ إحصائيات اليوم
  // ============================================================
  recordDailyStats: function(day) {
    var state = GAME.game ? GAME.game.state : null;
    if (!state) return;

    var dailyRecord = {
      day: day,
      revenue: this.stats.totalRevenue,
      expenses: this.stats.totalExpenses,
      taxes: this.stats.totalTaxes,
      balance: state.money,
      itemsSold: { ...this.stats.itemsSold }
    };

    this.stats.dailySales.push(dailyRecord);
    if (this.stats.dailySales.length > 30) {
      this.stats.dailySales.shift(); // حفظ آخر 30 يوم
    }

    // تحديث أفضل يوم مبيعات
    if (this.stats.totalRevenue > this.stats.bestSaleAmount) {
      this.stats.bestSaleAmount = this.stats.totalRevenue;
      this.stats.bestSaleDay = day;
    }

    // حساب صافي الربح اليومي
    var dailyProfit = this.stats.totalRevenue - this.stats.totalExpenses - this.stats.totalTaxes;
    if (dailyProfit > this.stats.richestAmount) {
      this.stats.richestAmount = dailyProfit;
      this.stats.richestDay = day;
    }
  },

  // ============================================================
  // 📋 طباعة ملخص يومي
  // ============================================================
  printDailySummary: function(day) {
    var state = GAME.game ? GAME.game.state : null;
    if (!state) return;

    console.log('========================================');
    console.log('📊 ملخص يوم ' + day);
    console.log('========================================');
    console.log('💰 الرصيد: ' + state.money + ' عملة');
    console.log('🛒 مبيعات: ' + this.stats.totalSold + ' صنف');
    console.log('📦 مشتريات: ' + this.stats.totalPurchased + ' صنف');
    console.log('🏛️ ضرائب: ' + this.stats.totalTaxes + ' عملة');
    console.log('🏦 قروض نشطة: ' + this.activeLoans.length);
    console.log('🍳 قيد الصناعة: ' + this.craftingQueue.length);
    console.log('========================================');
  },

  // ============================================================
  // 💾 حفظ الحالة
  // ============================================================
  save: function() {
    return {
      marketPrices: { ...this.marketPrices },
      priceHistory: JSON.parse(JSON.stringify(this.priceHistory)),
      activeLoans: JSON.parse(JSON.stringify(this.activeLoans)),
      stats: JSON.parse(JSON.stringify(this.stats)),
      craftingQueue: this.craftingQueue.map(function(job) {
        return {
          recipeKey: job.recipeKey,
          quantity: job.quantity,
          timeRemaining: job.timeRemaining,
          totalTime: job.totalTime,
          category: job.category
        };
      })
    };
  },

  // ============================================================
  // 📂 تحميل الحالة
  // ============================================================
  load: function(saveData) {
    if (!saveData) return false;

    this.marketPrices = saveData.marketPrices || {};
    this.priceHistory = saveData.priceHistory || {};
    this.activeLoans = saveData.activeLoans || [];
    this.stats = saveData.stats || JSON.parse(JSON.stringify(GAME.ECONOMY_STATS_DEFAULT));

    // إعادة بناء craftingQueue مع بيانات الوصفة الكاملة
    this.craftingQueue = (saveData.craftingQueue || []).map(function(job) {
      return {
        recipeKey: job.recipeKey,
        recipe: GAME.CRAFTING_RECIPES[job.recipeKey],
        quantity: job.quantity,
        timeRemaining: job.timeRemaining,
        totalTime: job.totalTime,
        category: job.category
      };
    });

    this.initialized = true;
    console.log('[EconomySystem] 📂 تم تحميل الحالة');
    return true;
  },

  // ============================================================
  // 📊 الحصول على إحصائيات كاملة
  // ============================================================
  getFullStats: function() {
    var state = GAME.game ? GAME.game.state : null;
    var currentMoney = state ? state.money : 0;

    var netWorth = currentMoney;
    var totalAssets = 0;

    // حساب قيمة المخزون
    if (state && state.inventory) {
      for (var key in state.inventory) {
        if (state.inventory[key] > 0) {
          var price = this.marketPrices[key] || 0;
          totalAssets += price * state.inventory[key];
        }
      }
    }

    // حساب قيمة القروض المتبقية
    var totalDebt = 0;
    for (var i = 0; i < this.activeLoans.length; i++) {
      if (this.activeLoans[i].isActive) {
        totalDebt += this.activeLoans[i].remaining;
      }
    }

    netWorth = currentMoney + totalAssets - totalDebt;

    return {
      // الرصيد
      currentMoney: currentMoney,
      totalAssets: totalAssets,
      totalDebt: totalDebt,
      netWorth: netWorth,

      // المبيعات
      totalSold: this.stats.totalSold,
      totalRevenue: this.stats.totalRevenue,
      itemsSold: this.stats.itemsSold,

      // المشتريات
      totalPurchased: this.stats.totalPurchased,
      totalExpenses: this.stats.totalExpenses,
      itemsPurchased: this.stats.itemsPurchased,

      // الضرائب والفوائد
      totalTaxes: this.stats.totalTaxes,
      totalLoanInterest: this.stats.totalLoanInterest,

      // الصناعة
      totalCrafted: this.stats.totalCrafted,
      totalCraftingValue: this.stats.totalCraftingValue,
      craftingQueueLength: this.craftingQueue.length,

      // القروض
      activeLoans: this.activeLoans.filter(function(l) { return l.isActive; }).length,

      // الأرقام القياسية
      bestSaleDay: this.stats.bestSaleDay,
      bestSaleAmount: this.stats.bestSaleAmount,
      richestDay: this.stats.richestDay,
      richestAmount: this.stats.richestAmount,

      // صافي الربح
      netProfit: this.stats.totalRevenue - this.stats.totalExpenses - this.stats.totalTaxes
    };
  },

  // ============================================================
  // 📋 عرض جميع الوصفات المتاحة
  // ============================================================
  getAvailableRecipes: function(level) {
    level = level || 1;
    var available = [];

    for (var key in GAME.CRAFTING_RECIPES) {
      if (!GAME.CRAFTING_RECIPES.hasOwnProperty(key)) continue;
      var recipe = GAME.CRAFTING_RECIPES[key];
      available.push({
        key: key,
        name: recipe.name,
        nameAr: recipe.nameAr,
        icon: recipe.icon,
        category: recipe.category,
        inputs: recipe.inputs,
        sellPrice: recipe.sellPrice,
        craftTime: recipe.craftTime,
        xpReward: recipe.xpReward,
        unlockLevel: recipe.unlockLevel,
        unlocked: level >= recipe.unlockLevel
      });
    }

    return available;
  },

  // ============================================================
  // 📋 عرض جميع المنتجات في السوق
  // ============================================================
  getMarketItems: function() {
    var items = [];
    for (var key in GAME.MARKETPLACE_ITEMS) {
      if (!GAME.MARKETPLACE_ITEMS.hasOwnProperty(key)) continue;
      var item = GAME.MARKETPLACE_ITEMS[key];
      items.push({
        key: key,
        name: item.name,
        nameAr: item.nameAr,
        category: item.category,
        icon: item.icon,
        currentPrice: this.marketPrices[key] || item.basePrice,
        basePrice: item.basePrice,
        priceChange: ((this.marketPrices[key] - item.basePrice) / item.basePrice * 100).toFixed(1) + '%'
      });
    }
    return items;
  },

  // ============================================================
  // 📋 عرض المتجر
  // ============================================================
  getShopItems: function() {
    var allItems = {};
    var shops = GAME.SHOP_ITEMS;
    for (var category in shops) {
      if (!shops.hasOwnProperty(category)) continue;
      for (var key in shops[category]) {
        if (!shops[category].hasOwnProperty(key)) continue;
        allItems[key] = shops[category][key];
      }
    }
    return allItems;
  }
};

// ============================================================
// 📢 تحديث واجهة المستخدم (يُستدعى عند تغير الأسعار)
// ============================================================
GAME.EconomySystem.updateUI = function() {
  if (typeof GAME.UI !== 'undefined' && GAME.UI.showMarketPrices) {
    GAME.UI.showMarketPrices(this.marketPrices);
  }
};

// ============================================================
// 🎯 دوال مساعدة للتكامل مع الأنظمة الأخرى
// ============================================================

// حساب إجمالي مبيعات المخزون (لحساب صافي القيمة)
GAME.EconomySystem.calculateInventoryValue = function(inventory) {
  var total = 0;
  for (var key in inventory) {
    if (inventory[key] > 0) {
      total += (this.marketPrices[key] || 0) * inventory[key];
    }
  }
  return total;
};

// حساب متوسط سعر صنف خلال آخر N يوم
GAME.EconomySystem.getAveragePrice = function(itemKey, days) {
  days = days || 7;
  var history = this.priceHistory[itemKey] || [];
  if (history.length === 0) return this.marketPrices[itemKey] || 0;

  var recentPrices = history.slice(-days);
  var sum = 0;
  for (var i = 0; i < recentPrices.length; i++) {
    sum += recentPrices[i];
  }
  return Math.round(sum / recentPrices.length);
};

// التحقق من توفر المواد لوصفة معينة
GAME.EconomySystem.canCraft = function(recipeKey, quantity) {
  quantity = quantity || 1;
  var recipe = GAME.CRAFTING_RECIPES[recipeKey];
  if (!recipe) return { canCraft: false, missing: ['وصفة غير موجودة'] };

  var state = GAME.game ? GAME.game.state : null;
  if (!state) return { canCraft: false, missing: ['لا يوجد حالة لعبة'] };

  var missing = [];
  for (var ingredient in recipe.inputs) {
    if (!recipe.inputs.hasOwnProperty(ingredient)) continue;
    var required = recipe.inputs[ingredient] * quantity;
    var available = state.inventory[ingredient] || 0;
    if (available < required) {
      missing.push((GAME.MARKETPLACE_ITEMS[ingredient] || {}).nameAr + ': ' + available + '/' + required);
    }
  }

  return {
    canCraft: missing.length === 0,
    missing: missing,
    levelOk: state.level >= recipe.unlockLevel
  };
};

// ============================================================
// 🚀 تهيئة تلقائية عند التحميل
// ============================================================
if (typeof window !== 'undefined') {
  // في بيئة المتصفح - التهيئة عند جاهزية DOM
  document.addEventListener('DOMContentLoaded', function() {
    if (!GAME.EconomySystem.initialized) {
      GAME.EconomySystem.init();
    }
  });
}

console.log('[EconomySystem] 📦 تم تحميل النظام');
console.log('[EconomySystem] 🍳 الوصفات: ' + Object.keys(GAME.CRAFTING_RECIPES).length);
console.log('[EconomySystem] 🛒 منتجات السوق: ' + Object.keys(GAME.MARKETPLACE_ITEMS).length);
console.log('[EconomySystem] 🏷️ الضرائب: ' + (GAME.TAX_CONFIG.rate * 100) + '%');
