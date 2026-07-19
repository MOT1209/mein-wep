/**
 * WorldExpansion.js - نظام توسيع العالم
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - 5 مناطق جديدة (قرية، غابة، مناجم، شاطئ، جبل)
 * - نظام انتقال بين المناطق
 * - نقاط اهتمام (POI) في كل منطقة
 * - موارد متنوعة لكل منطقة
 * - أعداء بسيطين في الغابة والمناجم
 * - نظام استكشاف وفتح المناطق
 * - حفظ وتحميل الحالة
 * - تكامل مع الأنظمة الأخرى
 */

var GAME = GAME || {};

// ============================================================
// 🗺️ بيانات المناطق
// ============================================================
GAME.WORLD_ZONES = {
  // ---- المزرعة (المنطقة الأساسية) ----
  farm: {
    id: 'farm',
    name: 'Farm', nameAr: 'المزرعة',
    icon: '🌾',
    description: 'مزرعتك الشخصية - مكان الزراعة والأنشطة اليومية',
    descriptionAr: 'مزرعتك الشخصية - مكان الزراعة والأنشطة اليومية',
    unlocked: true, // مفتوحة افتراضياً
    unlockCost: 0,
    size: { width: 64, depth: 64 }, // حجم المنطقة بالمربعات
    spawnPoint: { x: 0, y: 0, z: 0 }, // نقطة الظهور
    color: 0x7EC850, // لون أخضر
    bgMusic: 'farm_theme',
    ambientSounds: ['birds', 'wind', 'insects'],
    resources: [], // لا توجد موارد قابلة للجمع - المزرعة للزراعة فقط
    enemies: [], // لا أعداء
    pointsOfInterest: [
      {
        id: 'farmhouse', name: 'Farmhouse', nameAr: 'البيت',
        icon: '🏠', position: { x: -8, y: 0, z: -8 },
        radius: 4, interactable: true,
        description: 'منزلك الرئيسي', descriptionAr: 'منزلك الرئيسي'
      },
      {
        id: 'farm_entrance', name: 'Farm Gate', nameAr: 'بوابة المزرعة',
        icon: '🚪', position: { x: 0, y: 0, z: 30 },
        radius: 3, interactable: true,
        type: 'zone_exit',
        targetZone: 'village',
        description: 'البوابة leading to the village',
        descriptionAr: 'بوابة تؤدي إلى القرية'
      }
    ]
  },

  // ---- القرية ----
  village: {
    id: 'village',
    name: 'Village', nameAr: 'القرية',
    icon: '🏘️',
    description: 'قرية المزارعين - تجارة و NPCs ومهمات',
    descriptionAr: 'قرية المزارعين - تجارة و شخصيات ومهمات',
    unlocked: false,
    unlockCost: 0, // مفتوحة بالعديد من المزرعة
    size: { width: 48, depth: 48 },
    spawnPoint: { x: 0, y: 0, z: -28 },
    color: 0xD4A574,
    bgMusic: 'village_theme',
    ambientSounds: ['chatter', 'blacksmith', 'market'],
    resources: [],
    enemies: [],
    pointsOfInterest: [
      {
        id: 'general_store', name: 'General Store', nameAr: 'المتجر العام',
        icon: '🏪', position: { x: 10, y: 0, z: -10 },
        radius: 4, interactable: true,
        type: 'shop',
        shopType: 'general',
        description: 'متجر بائع الخضروات والبذور',
        descriptionAr: 'متجر بائع الخضروات والبذور'
      },
      {
        id: 'blacksmith', name: 'Blacksmith', nameAr: 'الحداد',
        icon: '🔨', position: { x: -12, y: 0, z: -8 },
        radius: 4, interactable: true,
        type: 'upgrade',
        services: ['tool_upgrade', 'weapon_craft'],
        description: 'ترقية الأدوات وصناعة الأسلحة',
        descriptionAr: 'ترقية الأدوات وصناعة الأسلحة'
      },
      {
        id: 'tavern', name: 'Tavern', nameAr: 'المقهى',
        icon: '🍺', position: { x: 5, y: 0, z: -20 },
        radius: 5, interactable: true,
        type: 'social',
        description: 'مقهى القرية - تحدث مع السكان',
        descriptionAr: 'مقهى القرية - تحدث مع السكان'
      },
      {
        id: 'church', name: 'Church', nameAr: 'الكنيسة',
        icon: '⛪', position: { x: -5, y: 0, z: -25 },
        radius: 3, interactable: true,
        type: 'save_point',
        description: 'مكان لحفظ التقدم',
        descriptionAr: 'مكان لحفظ التقدم'
      },
      {
        id: 'village_entrance_farm', name: 'Farm Gate', nameAr: 'بوابة المزرعة',
        icon: '🚪', position: { x: 0, y: 0, z: 24 },
        radius: 3, interactable: true,
        type: 'zone_exit',
        targetZone: 'farm',
        description: 'العودة إلى المزرعة',
        descriptionAr: 'العودة إلى المزرعة'
      },
      {
        id: 'village_entrance_forest', name: 'Forest Path', nameAr: 'مسار الغابة',
        icon: '🚪', position: { x: 22, y: 0, z: 0 },
        radius: 3, interactable: true,
        type: 'zone_exit',
        targetZone: 'forest',
        description: 'الدخول إلى الغابة',
        descriptionAr: 'الدخول إلى الغابة'
      },
      {
        id: 'village_entrance_mine', name: 'Mine Entrance', nameAr: 'مدخل المناجم',
        icon: '🚪', position: { x: -22, y: 0, z: 0 },
        radius: 3, interactable: true,
        type: 'zone_exit',
        targetZone: 'mine',
        description: 'الدخول إلى المناجم',
        descriptionAr: 'الدخول إلى المناجم'
      },
      {
        id: 'village_entrance_beach', name: 'Beach Road', nameAr: 'طريق الشاطئ',
        icon: '🚪', position: { x: 15, y: 0, z: 20 },
        radius: 3, interactable: true,
        type: 'zone_exit',
        targetZone: 'beach',
        description: 'الذهاب إلى الشاطئ',
        descriptionAr: 'الذهاب إلى الشاطئ'
      }
    ]
  },

  // ---- الغابة ----
  forest: {
    id: 'forest',
    name: 'Forest', nameAr: 'الغابة',
    icon: '🌲',
    description: 'غابة كثيفة - خشب وفطر وأعداء',
    descriptionAr: 'غابة كثيفة - خشب وفطر وأعداء',
    unlocked: false,
    unlockCost: 500,
    size: { width: 48, depth: 48 },
    spawnPoint: { x: -20, y: 0, z: 0 },
    color: 0x228B22,
    bgMusic: 'forest_theme',
    ambientSounds: ['forest_birds', 'rustling_leaves', 'creek'],
    resources: [
      {
        id: 'wood', name: 'Wood', nameAr: 'خشب',
        icon: '🪵', type: 'tree',
        respawnTime: 60, // ثانية
        quantity: { min: 2, max: 5 },
        toolRequired: 'axe',
        harvestAnimation: 'chop',
        value: 15
      },
      {
        id: 'oak_wood', name: 'Oak Wood', nameAr: 'خشب بلوط',
        icon: '🪵', type: 'tree',
        respawnTime: 90,
        quantity: { min: 1, max: 3 },
        toolRequired: 'axe',
        harvestAnimation: 'chop',
        value: 25
      },
      {
        id: 'mushroom', name: 'Mushroom', nameAr: 'فطر',
        icon: '🍄', type: 'ground',
        respawnTime: 45,
        quantity: { min: 1, max: 3 },
        toolRequired: null,
        harvestAnimation: 'pick',
        value: 20
      },
      {
        id: 'rare_mushroom', name: 'Rare Mushroom', nameAr: 'فطر نادر',
        icon: '🍄', type: 'ground',
        respawnTime: 120,
        quantity: { min: 1, max: 1 },
        toolRequired: null,
        harvestAnimation: 'pick',
        value: 80,
        spawnChance: 0.15 // 15% فقط
      },
      {
        id: 'herbs', name: 'Wild Herbs', nameAr: 'أعشاب برية',
        icon: '🌿', type: 'ground',
        respawnTime: 40,
        quantity: { min: 1, max: 4 },
        toolRequired: null,
        harvestAnimation: 'pick',
        value: 12
      },
      {
        id: 'berries', name: 'Wild Berries', nameAr: 'توت بري',
        icon: '🫐', type: 'bush',
        respawnTime: 50,
        quantity: { min: 2, max: 4 },
        toolRequired: null,
        harvestAnimation: 'pick',
        value: 18
      }
    ],
    enemies: [
      {
        id: 'forest_slime', name: 'Green Slime', nameAr: ' slimy أخضر',
        icon: '🟢',
        health: 30, damage: 5,
        speed: 0.8,
        drops: [{ id: 'slime_gel', nameAr: 'مخاط', chance: 0.8, value: 10 }],
        xpReward: 15,
        aggroRange: 8,
        color: 0x00FF00,
        size: { width: 0.6, height: 0.4, depth: 0.6 }
      },
      {
        id: 'wild_boar', name: 'Wild Boar', nameAr: 'خنزير بري',
        icon: '🐗',
        health: 60, damage: 12,
        speed: 1.2,
        drops: [
          { id: 'boar_meat', nameAr: 'لحم خنزير بري', chance: 0.7, value: 30 },
          { id: 'boar_hide', nameAr: 'جلد خنزير', chance: 0.3, value: 25 }
        ],
        xpReward: 30,
        aggroRange: 6,
        chargeAttack: true, // يهاجم بسرعة
        color: 0x8B4513,
        size: { width: 0.8, height: 0.6, depth: 1.0 }
      }
    ],
    pointsOfInterest: [
      {
        id: 'old_tree', name: 'Ancient Tree', nameAr: 'الشجرة القديمة',
        icon: '🌳', position: { x: 10, y: 0, z: -15 },
        radius: 5, interactable: true,
        type: 'harvest_bonus',
        bonusMultiplier: 2, // ضعف المحاصيل حولها
        description: 'شجرة ضخمة عتيقة - المحاصيل حولها أفضل',
        descriptionAr: 'شجرة ضخمة عتيقة - المحاصيل حولها أفضل'
      },
      {
        id: 'fairy_spring', name: 'Fairy Spring', nameAr: 'ينبوع الجن',
        icon: '🧚', position: { x: -10, y: 0, z: 12 },
        radius: 3, interactable: true,
        type: 'healing',
        healAmount: 50,
        cooldown: 180, // ثانية
        description: 'ينبوع سحري يشفيك',
        descriptionAr: 'ينبوع سحري يشفيك'
      },
      {
        id: 'herb_garden', name: 'Herb Garden', nameAr: 'حديقة الأعشاب',
        icon: '🌿', position: { x: 15, y: 0, z: 8 },
        radius: 4, interactable: true,
        type: 'resource_bonus',
        resourceId: 'herbs',
        bonusMultiplier: 3,
        description: 'منطقة خصبة بالأعشاب النادرة',
        descriptionAr: 'منطقة خصبة بالأعشاب النادرة'
      },
      {
        id: 'forest_camp', name: 'Forest Camp', nameAr: 'مخيم الغابة',
        icon: '⛺', position: { x: 0, y: 0, z: 0 },
        radius: 3, interactable: true,
        type: 'rest_point',
        description: 'مكان للراحة وإعادة الطاقة',
        descriptionAr: 'مكان للراحة وإعادة الطاقة'
      },
      {
        id: 'forest_exit', name: 'Forest Exit', nameAr: 'مخرج الغابة',
        icon: '🚪', position: { x: 20, y: 0, z: 0 },
        radius: 3, interactable: true,
        type: 'zone_exit',
        targetZone: 'village',
        description: 'العودة إلى القرية',
        descriptionAr: 'العودة إلى القرية'
      }
    ]
  },

  // ---- المناجم ----
  mine: {
    id: 'mine',
    name: 'Mine', nameAr: 'المناجم',
    icon: '⛏️',
    description: 'مناجم عميقة - أحجار كريمة ومعادن ثمينة',
    descriptionAr: 'مناجم عميقة - أحجار كريمة ومعادن ثمينة',
    unlocked: false,
    unlockCost: 800,
    size: { width: 32, depth: 48 },
    spawnPoint: { x: 20, y: 0, z: 0 },
    color: 0x8B7355,
    bgMusic: 'mine_theme',
    ambientSounds: ['dripping_water', 'pickaxe', 'echoes'],
    resources: [
      {
        id: 'stone', name: 'Stone', nameAr: 'حجر',
        icon: '🪨', type: 'rock',
        respawnTime: 50,
        quantity: { min: 2, max: 4 },
        toolRequired: 'pickaxe',
        harvestAnimation: 'mine',
        value: 10
      },
      {
        id: 'copper', name: 'Copper Ore', nameAr: 'خام النحاس',
        icon: '🟤', type: 'rock',
        respawnTime: 70,
        quantity: { min: 1, max: 3 },
        toolRequired: 'pickaxe',
        harvestAnimation: 'mine',
        value: 35
      },
      {
        id: 'iron', name: 'Iron Ore', nameAr: 'خام الحديد',
        icon: '⚫', type: 'rock',
        respawnTime: 90,
        quantity: { min: 1, max: 2 },
        toolRequired: 'pickaxe',
        harvestAnimation: 'mine',
        value: 50,
        minLevel: 5 // مستوى اللاعب الأدنى
      },
      {
        id: 'gold_ore', name: 'Gold Ore', nameAr: 'خام الذهب',
        icon: '🟡', type: 'rock',
        respawnTime: 120,
        quantity: { min: 1, max: 1 },
        toolRequired: 'pickaxe',
        harvestAnimation: 'mine',
        value: 100,
        minLevel: 10,
        spawnChance: 0.3
      },
      {
        id: 'crystal', name: 'Crystal', nameAr: 'كريستال',
        icon: '💎', type: 'rock',
        respawnTime: 180,
        quantity: { min: 1, max: 1 },
        toolRequired: 'pickaxe',
        harvestAnimation: 'mine',
        value: 150,
        minLevel: 15,
        spawnChance: 0.1
      },
      {
        id: 'coal', name: 'Coal', nameAr: 'فحم',
        icon: '⬛', type: 'rock',
        respawnTime: 60,
        quantity: { min: 1, max: 3 },
        toolRequired: 'pickaxe',
        harvestAnimation: 'mine',
        value: 20
      }
    ],
    enemies: [
      {
        id: 'mine_bat', name: 'Cave Bat', nameAr: 'خفاش الكهف',
        icon: '🦇',
        health: 25, damage: 8,
        speed: 1.5,
        drops: [
          { id: 'bat_wing', nameAr: 'جناح خفاش', chance: 0.6, value: 15 },
          { id: 'bat_fang', nameAr: 'ناب خفاش', chance: 0.2, value: 30 }
        ],
        xpReward: 20,
        aggroRange: 10,
        flying: true, // يطير
        color: 0x4A4A4A,
        size: { width: 0.4, height: 0.3, depth: 0.4 }
      },
      {
        id: 'rock_golem', name: 'Rock Golem', nameAr: 'وحش الصخر',
        icon: '🗿',
        health: 120, damage: 20,
        speed: 0.5,
        drops: [
          { id: 'golem_core', nameAr: 'نواة الوحش', chance: 0.3, value: 100 },
          { id: 'rare_stone', nameAr: 'حجر نادر', chance: 0.5, value: 40 }
        ],
        xpReward: 60,
        aggroRange: 5,
        armor: 10, // درع يقلل الضرر
        color: 0x8B7355,
        size: { width: 1.2, height: 1.5, depth: 1.0 }
      }
    ],
    pointsOfInterest: [
      {
        id: 'mine_shaft', name: 'Deep Shaft', nameAr: 'بئر عميق',
        icon: '🕳️', position: { x: -8, y: -1, z: -20 },
        radius: 3, interactable: true,
        type: 'dungeon_entrance',
        targetDepth: 1, // مستوى أول
        description: 'بئر يقود إلى طوابق أعمق',
        descriptionAr: 'بئر يقود إلى طوابق أعمق'
      },
      {
        id: 'crystal_cave', name: 'Crystal Cave', nameAr: 'كهف الكريستال',
        icon: '✨', position: { x: 8, y: 0, z: -15 },
        radius: 4, interactable: true,
        type: 'resource_bonus',
        resourceId: 'crystal',
        bonusMultiplier: 5,
        description: 'كهف مليء بالكريستالات اللامعة',
        descriptionAr: 'كهف مليء بالكريستالات اللامعة'
      },
      {
        id: 'mine_camp', name: 'Mining Camp', nameAr: 'مخيم التعدين',
        icon: '⛺', position: { x: 15, y: 0, z: 0 },
        radius: 3, interactable: true,
        type: 'rest_point',
        services: ['repair_tools'],
        description: 'مخيم ل修工具 وإعادة الطاقة',
        descriptionAr: 'مخيم لإصلاح الأدوات وإعادة الطاقة'
      },
      {
        id: 'treasure_room', name: 'Treasure Room', nameAr: 'غرفة الكنز',
        icon: '💰', position: { x: 0, y: 0, z: -22 },
        radius: 3, interactable: true,
        type: 'treasure',
        loot: [
          { id: 'gold_bar', value: 200 },
          { id: 'rare_gem', value: 500 }
        ],
        locked: true,
        keyRequired: 'mine_key',
        description: 'غرفة مفتوحة بمفتاح خاص',
        descriptionAr: 'غرفة مفتوحة بمفتاح خاص'
      },
      {
        id: 'mine_exit', name: 'Mine Exit', nameAr: 'مخرج المناجم',
        icon: '🚪', position: { x: 20, y: 0, z: 0 },
        radius: 3, interactable: true,
        type: 'zone_exit',
        targetZone: 'village',
        description: 'العودة إلى القرية',
        descriptionAr: 'العودة إلى القرية'
      }
    ]
  },

  // ---- الشاطئ ----
  beach: {
    id: 'beach',
    name: 'Beach', nameAr: 'الشاطئ',
    icon: '🏖️',
    description: 'شاطئ جميل - صيد الأسماك واستجمام',
    descriptionAr: 'شاطئ جميل - صيد الأسماك واستجمام',
    unlocked: false,
    unlockCost: 600,
    size: { width: 48, depth: 32 },
    spawnPoint: { x: 0, y: 0, z: -12 },
    color: 0xF4D03F,
    bgMusic: 'beach_theme',
    ambientSounds: ['waves', 'seagulls', 'wind'],
    resources: [
      {
        id: 'fish_common', name: 'Common Fish', nameAr: 'سمكة عادية',
        icon: '🐟', type: 'fishing',
        respawnTime: 30,
        quantity: { min: 1, max: 1 },
        toolRequired: 'fishing_rod',
        harvestAnimation: 'fish',
        value: 25
      },
      {
        id: 'fish_rare', name: 'Rare Fish', nameAr: 'سمكة نادرة',
        icon: '🐠', type: 'fishing',
        respawnTime: 60,
        quantity: { min: 1, max: 1 },
        toolRequired: 'fishing_rod',
        harvestAnimation: 'fish',
        value: 75,
        spawnChance: 0.25
      },
      {
        id: 'shell', name: 'Shell', nameAr: 'صدفة',
        icon: '🐚', type: 'ground',
        respawnTime: 45,
        quantity: { min: 1, max: 2 },
        toolRequired: null,
        harvestAnimation: 'pick',
        value: 15
      },
      {
        id: 'seaweed', name: 'Seaweed', nameAr: 'أعشاب بحرية',
        icon: '🌊', type: 'water',
        respawnTime: 40,
        quantity: { min: 1, max: 3 },
        toolRequired: null,
        harvestAnimation: 'pick',
        value: 10
      },
      {
        id: 'coral', name: 'Coral', nameAr: 'مرجان',
        icon: '🪸', type: 'water',
        respawnTime: 120,
        quantity: { min: 1, max: 1 },
        toolRequired: 'diving_gear',
        harvestAnimation: 'pick',
        value: 60,
        spawnChance: 0.2
      },
      {
        id: 'pearl', name: 'Pearl', nameAr: 'لؤلؤة',
        icon: '🫧', type: 'fishing',
        respawnTime: 300,
        quantity: { min: 1, max: 1 },
        toolRequired: 'fishing_rod',
        harvestAnimation: 'fish',
        value: 200,
        spawnChance: 0.05
      }
    ],
    enemies: [],
    pointsOfInterest: [
      {
        id: 'fishing_spot', name: 'Prime Fishing', nameAr: 'مكان صيد ممتاز',
        icon: '🎣', position: { x: 0, y: 0, z: 12 },
        radius: 5, interactable: true,
        type: 'fishing_bonus',
        bonusMultiplier: 2,
        description: 'مكان ممتاز للصيد - فرصة أفضل للأسماك النادرة',
        descriptionAr: 'مكان ممتاز للصيد - فرصة أفضل للأسماك النادرة'
      },
      {
        id: 'tide_pool', name: 'Tide Pool', nameAr: 'بركة المد',
        icon: '🏊', position: { x: -12, y: 0, z: 8 },
        radius: 3, interactable: true,
        type: 'resource_bonus',
        resourceId: 'shell',
        bonusMultiplier: 3,
        description: 'بركة صغيرة مليئة بالصدف والأصداف',
        descriptionAr: 'بركة صغيرة مليئة بالصدف والأصداف'
      },
      {
        id: 'beach_campfire', name: 'Campfire', nameAr: 'نار المخيم',
        icon: '🔥', position: { x: 10, y: 0, z: -5 },
        radius: 3, interactable: true,
        type: 'cooking',
        services: ['cook_fish'],
        description: 'اطبخ الأسماك التي صدحتها',
        descriptionAr: 'اطبخ الأسماك التي صدحتها'
      },
      {
        id: 'lighthouse', name: 'Lighthouse', nameAr: 'المنارة',
        icon: '🏗️', position: { x: 18, y: 0, z: 10 },
        radius: 4, interactable: true,
        type: 'viewpoint',
        revealsMap: true,
        description: 'منارة قديمة - يمكنك رؤية المنطقة بأكملها',
        descriptionAr: 'منارة قديمة - يمكنك رؤية المنطقة بأكملها'
      },
      {
        id: 'beach_exit', name: 'Beach Exit', nameAr: 'مخرج الشاطئ',
        icon: '🚪', position: { x: 0, y: 0, z: -14 },
        radius: 3, interactable: true,
        type: 'zone_exit',
        targetZone: 'village',
        description: 'العودة إلى القرية',
        descriptionAr: 'العودة إلى القرية'
      }
    ]
  },

  // ---- الجبل ----
  mountain: {
    id: 'mountain',
    name: 'Mountain', nameAr: 'الجبل',
    icon: '⛰️',
    description: 'جبل شاهق - مناظر خلابة وموارد نادرة',
    descriptionAr: 'جبل شاهق - مناظر خلابة وموارد نادرة',
    unlocked: false,
    unlockCost: 1500,
    size: { width: 32, depth: 32 },
    spawnPoint: { x: 0, y: 0, z: 14 },
    color: 0x808080,
    bgMusic: 'mountain_theme',
    ambientSounds: ['wind_howl', 'eagles', 'rockfall'],
    resources: [
      {
        id: 'mountain_stone', name: 'Mountain Stone', nameAr: 'حجر جبلي',
        icon: '🪨', type: 'rock',
        respawnTime: 60,
        quantity: { min: 2, max: 4 },
        toolRequired: 'pickaxe',
        harvestAnimation: 'mine',
        value: 15
      },
      {
        id: 'gem', name: 'Gemstone', nameAr: 'حجر كريم',
        icon: '💠', type: 'rock',
        respawnTime: 180,
        quantity: { min: 1, max: 1 },
        toolRequired: 'pickaxe',
        harvestAnimation: 'mine',
        value: 120,
        spawnChance: 0.15
      },
      {
        id: 'mountain_herbs', name: 'Alpine Herbs', nameAr: 'أعشاب جبلية',
        icon: '🌿', type: 'ground',
        respawnTime: 50,
        quantity: { min: 1, max: 3 },
        toolRequired: null,
        harvestAnimation: 'pick',
        value: 25
      },
      {
        id: 'eagle_feather', name: 'Eagle Feather', nameAr: 'ريش نسر',
        icon: '🪶', type: 'drop',
        quantity: { min: 1, max: 1 },
        value: 50
      },
      {
        id: 'mountain_spring', name: 'Spring Water', nameAr: 'ماء نبع',
        icon: '💧', type: 'water',
        respawnTime: 30,
        quantity: { min: 1, max: 2 },
        toolRequired: null,
        harvestAnimation: 'fill',
        value: 30
      }
    ],
    enemies: [
      {
        id: 'mountain_goat', name: 'Wild Goat', nameAr: 'ماعز بري',
        icon: '🐐',
        health: 40, damage: 8,
        speed: 1.3,
        drops: [
          { id: 'goat_horn', nameAr: 'قرن ماعز', chance: 0.4, value: 35 },
          { id: 'goat_fur', nameAr: 'فراء ماعز', chance: 0.6, value: 20 }
        ],
        xpReward: 25,
        aggroRange: 4,
        color: 0xD2B48C,
        size: { width: 0.6, height: 0.8, depth: 0.8 }
      }
    ],
    pointsOfInterest: [
      {
        id: 'summit', name: 'Mountain Summit', nameAr: 'قمة الجبل',
        icon: '🏔️', position: { x: 0, y: 3, z: -12 },
        radius: 5, interactable: true,
        type: 'viewpoint',
        revealsMap: true,
        description: 'قمة الجبل - منظر بانورامي رائع',
        descriptionAr: 'قمة الجبل - منظر بانورامي رائع'
      },
      {
        id: 'hot_spring', name: 'Hot Spring', nameAr: 'ينبوع حار',
        icon: '♨️', position: { x: -8, y: 0, z: -5 },
        radius: 3, interactable: true,
        type: 'healing',
        healAmount: 100,
        cooldown: 300,
        description: 'ينبوع حار طبيعي - يشفيك بالكامل',
        descriptionAr: 'ينبوع حار طبيعي - يشفيك بالكامل'
      },
      {
        id: 'eagle_nest', name: 'Eagle Nest', nameAr: 'عش النسر',
        icon: '🦅', position: { x: 8, y: 2, z: -8 },
        radius: 3, interactable: true,
        type: 'treasure',
        loot: [
          { id: 'eagle_feather', value: 50 },
          { id: 'golden_egg', value: 300 }
        ],
        description: 'عش نسر عالي - احصل على ريش نادر',
        descriptionAr: 'عش نسر عالي - احصل على ريش نادر'
      },
      {
        id: 'ancient_ruins', name: 'Ancient Ruins', nameAr: 'أطلال قديمة',
        icon: '🏚️', position: { x: -5, y: 0, z: -10 },
        radius: 4, interactable: true,
        type: 'quest_location',
        description: 'أطلال حضارة قديمة - قد تحتوي على أسرار',
        descriptionAr: 'أطلال حضارة قديمة - قد تحتوي على أسرار'
      },
      {
        id: 'mountain_exit', name: 'Mountain Path', nameAr: 'مسار الجبل',
        icon: '🚪', position: { x: 0, y: 0, z: 14 },
        radius: 3, interactable: true,
        type: 'zone_exit',
        targetZone: 'village',
        description: 'العودة إلى القرية',
        descriptionAr: 'العودة إلى القرية'
      }
    ]
  }
};

// ============================================================
// 🎮 فئة WorldExpansion - نظام توسيع العالم
// ============================================================
GAME.WorldExpansion = class WorldExpansion {
  constructor(game) {
    this.game = game;
    this.currentZone = 'farm'; // المنطقة الحالية
    this.zones = JSON.parse(JSON.stringify(GAME.WORLD_ZONES));
    this.playerPosition = { x: 0, y: 0, z: 0 };
    this.playerDirection = { x: 0, z: 1 };
    this.discoveredPOIs = {}; // نقاط الاهتمام المكتشفة
    this.resourceNodes = {}; // عقد الموارد الحالية
    this.enemies = {}; // الأعداء الحاليون
    this.transitioning = false; // هل يوجد انتقال جارٍ
    this.unlockedZones = { farm: true }; // المناطق المفتوحة
    this.totalResourcesGathered = {}; // إجمالي الموارد المجمعة

    this.init();
  }

  // ---- التهيئة ----
  init() {
    console.log('🗺️ تم تهيئة نظام توسيع العالم');

    // تهيئة عقد الموارد والأعداء للمنطقة الحالية
    this.spawnResourceNodes(this.currentZone);
    this.spawnEnemies(this.currentZone);
  }

  // ============================================================
  // 🚀 نظام الانتقال بين المناطق
  // ============================================================

  /**
   * الانتقال إلى منطقة جديدة
   * @param {string} zoneId - معرف المنطقة المستهدفة
   * @returns {boolean} - هل نجح الانتقال
   */
  travelToZone(zoneId) {
    if (this.transitioning) {
      console.warn('⚠️ انتقال جارٍ - لا يمكن الانتقال مرة أخرى');
      return false;
    }

    const targetZone = this.zones[zoneId];
    if (!targetZone) {
      console.error('❌ المنطقة غير موجودة:', zoneId);
      return false;
    }

    // التحقق من فتح المنطقة
    if (!this.unlockedZones[zoneId]) {
      // محاولة فتح المنطقة
      if (!this.unlockZone(zoneId)) {
        return false;
      }
    }

    this.transitioning = true;
    console.log(`🔄 الانتقال من ${this.getCurrentZone().nameAr} إلى ${targetZone.nameAr}...`);

    // تنفيذ الانتقال
    this.executeTransition(zoneId);
    return true;
  }

  /**
   * تنفيذ الانتقال الفعلي
   */
  executeTransition(zoneId) {
    const targetZone = this.zones[zoneId];
    const previousZone = this.currentZone;

    // تحديث المنطقة الحالية
    this.currentZone = zoneId;

    // نقل اللاعب إلى نقطة الظهور
    this.playerPosition = { ...targetZone.spawnPoint };

    // إعادة توليد الموارد والأعداء
    this.spawnResourceNodes(zoneId);
    this.spawnEnemies(zoneId);

    // إطلاق حدث الانتقال
    if (this.game && this.game.events) {
      this.game.events.emit('zoneChanged', {
        previousZone,
        currentZone: zoneId,
        zoneData: targetZone
      });
    }

    console.log(`✅ وصلت إلى ${targetZone.nameAr}`);

    this.transitioning = false;

    // عرض رسالة ترحيب
    this.showZoneWelcome(targetZone);
  }

  /**
   * عرض رسالة ترحيب بالمنطقة
   */
  showZoneWelcome(zone) {
    if (this.game && this.game.ui) {
      this.game.ui.showMessage(
        `${zone.icon} ${zone.nameAr}`,
        zone.descriptionAr,
        3000 // 3 ثواني
      );
    }
  }

  // ============================================================
  // 🔓 نظام فتح المناطق
  // ============================================================

  /**
   * محاولة فتح منطقة جديدة
   */
  unlockZone(zoneId) {
    const zone = this.zones[zoneId];
    if (!zone) return false;

    if (this.unlockedZones[zoneId]) {
      console.log(`ℹ️ المنطقة ${zone.nameAr} مفتوحة بالفعل`);
      return true;
    }

    // التحقق من التكلفة
    const playerGold = this.getPlayerGold();
    if (playerGold < zone.unlockCost) {
      console.warn(`❌ لا تملك ما يكفي لفتح ${zone.nameAr}. تحتاج ${zone.unlockCost} ذهب، لديك ${playerGold}`);
      if (this.game && this.game.ui) {
        this.game.ui.showMessage(
          '❌ منطقة مقفلة',
          `تحتاج ${zone.unlockCost} ذهب لفتح ${zone.nameAr}`,
          3000
        );
      }
      return false;
    }

    // خصم التكلفة
    this.spendPlayerGold(zone.unlockCost);
    this.unlockedZones[zoneId] = true;
    zone.unlocked = true;

    console.log(`🔓 تم فتح منطقة ${zone.nameAr} بتكلفة ${zone.unlockCost} ذهب`);

    if (this.game && this.game.ui) {
      this.game.ui.showMessage(
        `🔓 تم فتح ${zone.nameAr}!`,
        `يمكنك الآن زيارة ${zone.nameAr}`,
        4000
      );
    }

    return true;
  }

  /**
   * التحقق مما إذا كانت المنطقة مفتوحة
   */
  isZoneUnlocked(zoneId) {
    return !!this.unlockedZones[zoneId];
  }

  /**
   * الحصول على قائمة المناطق المفتوحة
   */
  getUnlockedZones() {
    return Object.keys(this.unlockedZones)
      .filter(id => this.unlockedZones[id])
      .map(id => this.zones[id]);
  }

  /**
   * الحصول على قائمة المناطق المقفلة
   */
  getLockedZones() {
    return Object.values(this.zones)
      .filter(z => !this.unlockedZones[z.id]);
  }

  // ============================================================
  // 📍 نظام نقاط الاهتمام (POI)
  // ============================================================

  /**
   * الحصول على نقاط الاهتمام القريبة
   */
  getNearbyPOIs(radius = 10) {
    const zone = this.getCurrentZone();
    if (!zone) return [];

    return zone.pointsOfInterest.filter(poi => {
      const dx = poi.position.x - this.playerPosition.x;
      const dz = poi.position.z - this.playerPosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      return distance <= (radius || poi.radius);
    });
  }

  /**
   * التفاعل مع نقطة اهتمام
   */
  interactWithPOI(poiId) {
    const zone = this.getCurrentZone();
    const poi = zone.pointsOfInterest.find(p => p.id === poiId);
    if (!poi) {
      console.error('❌ نقطة الاهتمام غير موجودة:', poiId);
      return null;
    }

    // التحقق من المسافة
    const dx = poi.position.x - this.playerPosition.x;
    const dz = poi.position.z - this.playerPosition.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > poi.radius + 2) {
      console.warn('⚠️ أنت بعيد عن هذه النقطة');
      return { error: 'too_far' };
    }

    // تسجيل الاكتشاف
    this.discoveredPOIs[poiId] = true;

    // معالجة حسب النوع
    return this.handlePOIInteraction(poi);
  }

  /**
   * معالجة التفاعل حسب نوع النقطة
   */
  handlePOIInteraction(poi) {
    switch (poi.type) {
      case 'zone_exit':
        return this.handleZoneExit(poi);

      case 'shop':
        return this.handleShop(poi);

      case 'upgrade':
        return this.handleUpgrade(poi);

      case 'healing':
        return this.handleHealing(poi);

      case 'rest_point':
        return this.handleRestPoint(poi);

      case 'fishing_bonus':
      case 'resource_bonus':
        return this.handleResourceBonus(poi);

      case 'harvest_bonus':
        return this.handleHarvestBonus(poi);

      case 'viewpoint':
        return this.handleViewpoint(poi);

      case 'treasure':
        return this.handleTreasure(poi);

      case 'cooking':
        return this.handleCooking(poi);

      case 'save_point':
        return this.handleSavePoint(poi);

      case 'quest_location':
        return this.handleQuestLocation(poi);

      case 'dungeon_entrance':
        return this.handleDungeonEntrance(poi);

      default:
        console.log(`ℹ️ تفاعل مع: ${poi.nameAr}`);
        return { type: poi.type, data: poi };
    }
  }

  // ---- معالجات أنواع نقاط الاهتمام ----

  handleZoneExit(poi) {
    console.log(`🚪 الانتقال إلى ${poi.targetZone}`);
    this.travelToZone(poi.targetZone);
    return { type: 'travel', target: poi.targetZone };
  }

  handleShop(poi) {
    console.log(`🏪 فتح المتجر: ${poi.nameAr}`);
    if (this.game && this.game.shop) {
      this.game.shop.open(poi.shopType);
    }
    return { type: 'shop', shopType: poi.shopType };
  }

  handleUpgrade(poi) {
    console.log(`🔨 فتح ورشة: ${poi.nameAr}`);
    if (this.game && this.game.upgrade) {
      this.game.upgrade.open(poi.services);
    }
    return { type: 'upgrade', services: poi.services };
  }

  handleHealing(poi) {
    if (this.game && this.game.player) {
      const currentHealth = this.game.player.health || 100;
      const maxHealth = this.game.player.maxHealth || 100;

      if (currentHealth >= maxHealth) {
        console.log('❤️ صحتك ممتلئة بالفعل');
        return { type: 'healing', healed: false, reason: 'full_health' };
      }

      this.game.player.health = Math.min(currentHealth + poi.healAmount, maxHealth);
      console.log(`❤️ شُفيت بـ ${poi.healAmount} نقطة صحة`);
      return { type: 'healing', healed: true, amount: poi.healAmount };
    }
    return { type: 'healing', healed: false, reason: 'no_player' };
  }

  handleRestPoint(poi) {
    console.log(`⛺ الراحة في ${poi.nameAr}`);
    if (this.game && this.game.player) {
      // إعادة الطاقة.partially
      if (this.game.player.stamina !== undefined) {
        this.game.player.stamina = this.game.player.maxStamina || 100;
      }
    }
    return { type: 'rest' };
  }

  handleResourceBonus(poi) {
    console.log(`✨ مكافأة الموارد: ${poi.bonusMultiplier}x`);
    return { type: 'resource_bonus', resourceId: poi.resourceId, multiplier: poi.bonusMultiplier };
  }

  handleHarvestBonus(poi) {
    console.log(`🌳 مكافأة الحصاد: ${poi.bonusMultiplier}x حول الشجرة القديمة`);
    return { type: 'harvest_bonus', multiplier: poi.bonusMultiplier };
  }

  handleViewpoint(poi) {
    console.log(`👁️ كشف الخريطة: ${poi.nameAr}`);
    if (poi.revealsMap) {
      return { type: 'viewpoint', revealed: true, zone: this.currentZone };
    }
    return { type: 'viewpoint', revealed: false };
  }

  handleTreasure(poi) {
    if (poi.locked) {
      console.log(`🔒 الكنز مقفل - تحتاج ${poi.keyRequired}`);
      return { type: 'treasure', locked: true, keyRequired: poi.keyRequired };
    }

    console.log(`💰 فتح الكنز: ${poi.nameAr}`);
    return { type: 'treasure', locked: false, loot: poi.loot };
  }

  handleCooking(poi) {
    console.log(`🍳 الطهي في ${poi.nameAr}`);
    if (this.game && this.game.cooking) {
      this.game.cooking.open();
    }
    return { type: 'cooking' };
  }

  handleSavePoint(poi) {
    console.log(`💾 حفظ التقدم في ${poi.nameAr}`);
    if (this.game && this.game.save) {
      this.game.save();
    }
    return { type: 'save' };
  }

  handleQuestLocation(poi) {
    console.log(`📋 موقع المهمة: ${poi.nameAr}`);
    return { type: 'quest', location: poi };
  }

  handleDungeonEntrance(poi) {
    console.log(`🕳️ دخول الزنزانة: المستوى ${poi.targetDepth}`);
    return { type: 'dungeon', depth: poi.targetDepth };
  }

  // ============================================================
  // 🌿 نظام الموارد
  // ============================================================

  /**
   * توليد عقد الموارد لمنطقة معينة
   */
  spawnResourceNodes(zoneId) {
    const zone = this.zones[zoneId];
    if (!zone) return;

    this.resourceNodes[zoneId] = [];

    zone.resources.forEach(resource => {
      const count = this.getRandomResourceCount(resource);

      for (let i = 0; i < count; i++) {
        const position = this.getRandomPosition(zone.size);

        this.resourceNodes[zoneId].push({
          id: `${resource.id}_${i}`,
          resourceId: resource.id,
          position,
          quantity: this.getRandomInt(resource.quantity.min, resource.quantity.max),
          depleted: false,
          respawnTimer: 0,
          data: resource
        });
      }
    });

    console.log(`🌿 تم توليد ${this.resourceNodes[zoneId].length} مورد في ${zone.nameAr}`);
  }

  /**
   * الحصول على عدد عشوائي من الموارد
   */
  getRandomResourceCount(resource) {
    // بعض الموارد نادرة (لديها spawnChance)
    if (resource.spawnChance) {
      if (Math.random() > resource.spawnChance) return 0;
    }

    return this.getRandomInt(3, 8);
  }

  /**
   * جمع مورد
   */
  gatherResource(nodeId) {
    const nodes = this.resourceNodes[this.currentZone];
    if (!nodes) return null;

    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.depleted) {
      console.warn('⚠️ المورد غير متاح');
      return null;
    }

    const resource = node.data;

    // التحقق من الأداة المطلوبة
    if (resource.toolRequired) {
      if (!this.hasRequiredTool(resource.toolRequired)) {
        console.warn(`⚠️ تحتاج ${resource.toolRequired} لجمع ${resource.nameAr}`);
        return { error: 'tool_required', tool: resource.toolRequired };
      }
    }

    // جمع المورد
    const gathered = {
      id: resource.id,
      name: resource.name,
      nameAr: resource.nameAr,
      icon: resource.icon,
      quantity: node.quantity,
      value: resource.value
    };

    // تسجيل الإجمالي
    if (!this.totalResourcesGathered[resource.id]) {
      this.totalResourcesGathered[resource.id] = 0;
    }
    this.totalResourcesGathered[resource.id] += node.quantity;

    // تفريغ العقدة
    node.depleted = true;
    node.respawnTimer = resource.respawnTime;

    console.log(`✅ تم جمع ${node.quantity}x ${resource.nameAr}`);

    // إضافة للمخزون
    if (this.game && this.game.inventory) {
      this.game.inventory.addItem(resource.id, node.quantity);
    }

    // إطلاق حدث
    if (this.game && this.game.events) {
      this.game.events.emit('resourceGathered', gathered);
    }

    return gathered;
  }

  /**
   * تحديث موارد (يُنادى كل ثانية)
   */
  updateResources(deltaTime) {
    const nodes = this.resourceNodes[this.currentZone];
    if (!nodes) return;

    nodes.forEach(node => {
      if (node.depleted && node.respawnTimer > 0) {
        node.respawnTimer -= deltaTime;
        if (node.respawnTimer <= 0) {
          node.depleted = false;
          node.quantity = this.getRandomInt(
            node.data.quantity.min,
            node.data.quantity.max
          );
          console.log(`🌱 عاد مورد ${node.data.nameAr}`);
        }
      }
    });
  }

  /**
   * الحصول على الموارد المتوفرة
   */
  getAvailableResources() {
    const nodes = this.resourceNodes[this.currentZone];
    if (!nodes) return [];
    return nodes.filter(n => !n.depleted);
  }

  /**
   * البحث عن مورد بالقرب
   */
  findNearestResource(resourceId, maxDistance = 15) {
    const nodes = this.resourceNodes[this.currentZone];
    if (!nodes) return null;

    let nearest = null;
    let nearestDist = maxDistance;

    nodes.filter(n => !n.depleted && n.resourceId === resourceId).forEach(node => {
      const dx = node.position.x - this.playerPosition.x;
      const dz = node.position.z - this.playerPosition.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = node;
      }
    });

    return nearest;
  }

  // ============================================================
  // 👾 نظام الأعداء
  // ============================================================

  /**
   * توليد أعداء المنطقة
   */
  spawnEnemies(zoneId) {
    const zone = this.zones[zoneId];
    if (!zone) return;

    this.enemies[zoneId] = [];

    zone.enemies.forEach(enemyType => {
      const count = this.getRandomInt(3, 6);

      for (let i = 0; i < count; i++) {
        const position = this.getRandomPosition(zone.size);

        this.enemies[zoneId].push({
          id: `${enemyType.id}_${i}`,
          type: enemyType.id,
          position: { ...position },
          health: enemyType.health,
          maxHealth: enemyType.health,
          damage: enemyType.damage,
          speed: enemyType.speed,
          alive: true,
          data: enemyType,
          patrol: this.generatePatrolPath(position, zone.size),
          patrolIndex: 0,
          lastAttack: 0
        });
      }
    });

    console.log(`👾 تم توليد ${this.enemies[zoneId].length} عدو في ${zone.nameAr}`);
  }

  /**
   * تحديث أعداء المنطقة
   */
  updateEnemies(deltaTime) {
    const enemies = this.enemies[this.currentZone];
    if (!enemies) return;

    const now = Date.now();

    enemies.forEach(enemy => {
      if (!enemy.alive) return;

      // حركة الدورية
      this.moveEnemyPatrol(enemy, deltaTime);

      // التحقق من مسافة اللاعب
      const dx = this.playerPosition.x - enemy.position.x;
      const dz = this.playerPosition.z - enemy.position.z;
      const distToPlayer = Math.sqrt(dx * dx + dz * dz);

      // مهاجمة اللاعب إذا كان قريبًا
      if (distToPlayer <= enemy.data.aggroRange) {
        // التوجه نحو اللاعب
        enemy.position.x += (dx / distToPlayer) * enemy.speed * deltaTime * 0.5;
        enemy.position.z += (dz / distToPlayer) * enemy.speed * deltaTime * 0.5;

        // هجوم إذا كان قريبًا بما يكفي
        if (distToPlayer <= 2) {
          if (now - enemy.lastAttack > 1500) { // هجوم كل 1.5 ثانية
            this.enemyAttackPlayer(enemy);
            enemy.lastAttack = now;
          }
        }
      }
    });
  }

  /**
   * هجوم العدو على اللاعب
   */
  enemyAttackPlayer(enemy) {
    if (this.game && this.game.player) {
      let damage = enemy.damage;

      // هجوم الشحن
      if (enemy.data.chargeAttack && Math.random() < 0.3) {
        damage *= 2;
        console.log(`⚡ ${enemy.data.nameAr} يهاجم بشدة!`);
      }

      this.game.player.takeDamage(damage);
      console.log(`💔 تلقيت ${damage} ضرر من ${enemy.data.nameAr}`);

      if (this.game && this.game.events) {
        this.game.events.emit('enemyAttack', { enemy, damage });
      }
    }
  }

  /**
   * هجوم اللاعب على العدو
   */
  playerAttackEnemy(enemyId, damage = 10) {
    const enemies = this.enemies[this.currentZone];
    if (!enemies) return null;

    const enemy = enemies.find(e => e.id === enemyId);
    if (!enemy || !enemy.alive) return null;

    // تطبيق الدروع
    const actualDamage = Math.max(1, damage - (enemy.data.armor || 0));
    enemy.health -= actualDamage;

    console.log(`⚔️ ضربت ${enemy.data.nameAr} بـ ${actualDamage} ضرر`);

    if (enemy.health <= 0) {
      return this.killEnemy(enemy);
    }

    return { enemy: enemy.id, damage: actualDamage, alive: true, health: enemy.health };
  }

  /**
   * قتل العدو
   */
  killEnemy(enemy) {
    enemy.alive = false;
    console.log(`☠️ قتلت ${enemy.data.nameAr}!`);

    // إسقاط الأغراض
    const drops = [];
    if (enemy.data.drops) {
      enemy.data.drops.forEach(drop => {
        if (Math.random() < drop.chance) {
          drops.push({ id: drop.id, nameAr: drop.nameAr, value: drop.value });
          if (this.game && this.game.inventory) {
            this.game.inventory.addItem(drop.id, 1);
          }
        }
      });
    }

    // إضافة خبرة
    if (this.game && this.game.player) {
      this.game.player.addXP(enemy.data.xpReward);
    }

    // إعادة توليد العدو بعد مدة
    setTimeout(() => {
      this.respawnEnemy(enemy);
    }, 30000); // 30 ثانية

    if (this.game && this.game.events) {
      this.game.events.emit('enemyKilled', { enemy, drops });
    }

    return {
      enemy: enemy.id,
      damage: 0,
      alive: false,
      drops,
      xp: enemy.data.xpReward
    };
  }

  /**
   * إعادة توليد العدو
   */
  respawnEnemy(enemy) {
    const zone = this.zones[this.currentZone];
    enemy.position = this.getRandomPosition(zone.size);
    enemy.health = enemy.maxHealth;
    enemy.alive = true;
    console.log(`🔄 عاد ${enemy.data.nameAr}`);
  }

  /**
   * توليد مسار دورية عشوائي
   */
  generatePatrolPath(center, zoneSize) {
    const path = [];
    const numPoints = 4;
    const range = 8;

    for (let i = 0; i < numPoints; i++) {
      path.push({
        x: center.x + (Math.random() - 0.5) * range * 2,
        z: center.z + (Math.random() - 0.5) * range * 2
      });
    }

    return path;
  }

  /**
   * تحريك العدو في مسار الدورية
   */
  moveEnemyPatrol(enemy, deltaTime) {
    if (!enemy.patrol || enemy.patrol.length === 0) return;

    const target = enemy.patrol[enemy.patrolIndex];
    const dx = target.x - enemy.position.x;
    const dz = target.z - enemy.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.5) {
      // وصل إلى النقطة - انتقل للتالية
      enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
    } else {
      // التحرك نحو النقطة
      enemy.position.x += (dx / dist) * enemy.speed * deltaTime * 0.3;
      enemy.position.z += (dz / dist) * enemy.speed * deltaTime * 0.3;
    }
  }

  /**
   * الحصول على الأعداء القريبة
   */
  getNearbyEnemies(radius = 15) {
    const enemies = this.enemies[this.currentZone];
    if (!enemies) return [];

    return enemies.filter(e => {
      if (!e.alive) return false;
      const dx = e.position.x - this.playerPosition.x;
      const dz = e.position.z - this.playerPosition.z;
      return Math.sqrt(dx * dx + dz * dz) <= radius;
    });
  }

  // ============================================================
  // 🔄 تحديث عام
  // ============================================================

  /**
   * تحديث نظام العالم (يُنادى كل إطار)
   */
  update(deltaTime) {
    if (this.transitioning) return;

    // تحديث الموارد
    this.updateResources(deltaTime);

    // تحديث الأعداء
    this.updateEnemies(deltaTime);
  }

  // ============================================================
  // 💾 حفظ وتحميل
  // ============================================================

  /**
   * حفظ حالة نظام العالم
   */
  saveState() {
    return {
      currentZone: this.currentZone,
      playerPosition: { ...this.playerPosition },
      unlockedZones: { ...this.unlockedZones },
      discoveredPOIs: { ...this.discoveredPOIs },
      totalResourcesGathered: { ...this.totalResourcesGathered }
    };
  }

  /**
   * تحميل حالة نظام العالم
   */
  loadState(state) {
    if (!state) return;

    this.currentZone = state.currentZone || 'farm';
    this.playerPosition = state.playerPosition || { x: 0, y: 0, z: 0 };
    this.unlockedZones = state.unlockedZones || { farm: true };
    this.discoveredPOIs = state.discoveredPOIs || {};
    this.totalResourcesGathered = state.totalResourcesGathered || {};

    // إعادة توليد الموارد والأعداء
    this.spawnResourceNodes(this.currentZone);
    this.spawnEnemies(this.currentZone);

    console.log('💾 تم تحميل حالة نظام العالم');
  }

  // ============================================================
  // 🔧 أدوات مساعدة
  // ============================================================

  /**
   * الحصول على المنطقة الحالية
   */
  getCurrentZone() {
    return this.zones[this.currentZone];
  }

  /**
   * الحصول على معرف المنطقة الحالية
   */
  getCurrentZoneId() {
    return this.currentZone;
  }

  /**
   * الحصول على مواقع الأعداء (للعرض)
   */
  getEnemyPositions() {
    const enemies = this.enemies[this.currentZone];
    if (!enemies) return [];
    return enemies.filter(e => e.alive).map(e => ({
      id: e.id,
      type: e.type,
      position: e.position,
      health: e.health,
      maxHealth: e.maxHealth,
      data: e.data
    }));
  }

  /**
   * الحصول على مواقع الموارد (للعرض)
   */
  getResourcePositions() {
    const nodes = this.resourceNodes[this.currentZone];
    if (!nodes) return [];
    return nodes.filter(n => !n.depleted).map(n => ({
      id: n.id,
      resourceId: n.resourceId,
      position: n.position,
      quantity: n.quantity,
      data: n.data
    }));
  }

  /**
   * تحديث موقع اللاعب
   */
  updatePlayerPosition(x, y, z) {
    this.playerPosition = { x, y, z };
  }

  /**
   * الحصول على ذهب اللاعب
   */
  getPlayerGold() {
    if (this.game && this.game.economy) {
      return this.game.economy.getGold ? this.game.economy.getGold() : 0;
    }
    return 0;
  }

  /**
   * إنفاق ذهب اللاعب
   */
  spendPlayerGold(amount) {
    if (this.game && this.game.economy) {
      if (this.game.economy.spendGold) {
        return this.game.economy.spendGold(amount);
      }
    }
    return false;
  }

  /**
   * التحقق من توفر الأداة
   */
  hasRequiredTool(toolId) {
    if (this.game && this.game.inventory) {
      return this.game.inventory.hasItem ? this.game.inventory.hasItem(toolId) : false;
    }
    return false;
  }

  /**
   * توليد موقع عشوائي داخل المنطقة
   */
  getRandomPosition(zoneSize) {
    const halfW = zoneSize.width / 2;
    const halfD = zoneSize.depth / 2;
    return {
      x: (Math.random() - 0.5) * zoneSize.width * 0.8,
      y: 0,
      z: (Math.random() - 0.5) * zoneSize.depth * 0.8
    };
  }

  /**
   * الحصول على عدد عشوائي
   */
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * الحصول على إحصائيات نظام العالم
   */
  getStats() {
    return {
      currentZone: this.currentZone,
      unlockedZones: Object.keys(this.unlockedZones).length,
      totalZones: Object.keys(this.zones).length,
      discoveredPOIs: Object.keys(this.discoveredPOIs).length,
      totalPOIs: Object.values(this.zones).reduce(
        (sum, z) => sum + z.pointsOfInterest.length, 0
      ),
      resourcesGathered: this.totalResourcesGathered
    };
  }
};

// ============================================================
// 🌍 تصنيف أنواع الموارد والأعداء
// ============================================================

GAME.WORLD_RESOURCE_TYPES = {
  tree: { name: 'شجرة', harvestMethod: 'chop', toolType: 'axe' },
  rock: { name: 'صخرة', harvestMethod: 'mine', toolType: 'pickaxe' },
  ground: { name: 'أرضية', harvestMethod: 'pick', toolType: null },
  bush: { name: 'شجيرات', harvestMethod: 'pick', toolType: null },
  water: { name: 'ماء', harvestMethod: 'fish', toolType: 'fishing_rod' },
  fishing: { name: 'صيد', harvestMethod: 'fish', toolType: 'fishing_rod' },
  drop: { name: 'إسقاط', harvestMethod: 'auto', toolType: null }
};

GAME.WORLD_ENEMY_TYPES = {
  passive: { behavior: 'flee', aggroRange: 0 },
  neutral: { behavior: 'patrol', aggroRange: 3 },
  aggressive: { behavior: 'chase', aggroRange: 8 },
  elite: { behavior: 'chase', aggroRange: 10, abilities: ['charge', 'armor'] }
};

// ============================================================
// 📊 خريطة الاتصال بين المناطق
// ============================================================

GAME.WORLD_MAP_CONNECTIONS = {
  farm: { village: 'south' },
  village: {
    farm: 'north',
    forest: 'east',
    mine: 'west',
    beach: 'southeast'
  },
  forest: { village: 'west' },
  mine: { village: 'east' },
  beach: { village: 'northwest' },
  mountain: { village: 'north' } // Mountain متاحة من القرية أيضاً (قريبة)
};

// إضافة خيار الوصول للجبل من القرية
if (GAME.WORLD_ZONES.village) {
  GAME.WORLD_ZONES.village.pointsOfInterest.push({
    id: 'village_entrance_mountain',
    name: 'Mountain Trail', nameAr: 'مسار الجبل',
    icon: '🚪', position: { x: -15, y: 0, z: 20 },
    radius: 3, interactable: true,
    type: 'zone_exit',
    targetZone: 'mountain',
    description: 'الطريق إلى الجبل',
    descriptionAr: 'الطريق إلى الجبل'
  });
}

console.log('🌍 تم تحميل نظام توسيع العالم');
