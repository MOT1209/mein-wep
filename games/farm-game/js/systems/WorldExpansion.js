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
    unlocked: true,
    unlockCost: 0,
    size: { width: 64, depth: 64 },
    spawnPoint: { x: 0, y: 0, z: 0 },
    color: 0x7EC850,
    bgMusic: 'farm_theme',
    ambientSounds: ['birds', 'wind', 'insects'],
    resources: [],
    enemies: [],
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
    unlockCost: 0,
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
        respawnTime: 60,
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
        spawnChance: 0.15
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
        chargeAttack: true,
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
        bonusMultiplier: 2,
        description: 'شجرة ضخمة عتيقة - المحاصيل حولها أفضل',
        descriptionAr: 'شجرة ضخمة عتيقة - المحاصيل حولها أفضل'
      },
      {
        id: 'fairy_spring', name: 'Fairy Spring', nameAr: 'ينبوع الجن',
        icon: '🧚', position: { x: -10, y: 0, z: 12 },
        radius: 3, interactable: true,
        type: 'healing',
        healAmount: 50,
        cooldown: 180,
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
        minLevel: 5
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
        flying: true,
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
        armor: 10,
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
        targetDepth: 1,
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
        description: 'مخيم لإصلاح الأدوات وإعادة الطاقة',
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
// 🎮 نظام WorldExpansion - نظام توسيع العالم (Object Literal)
// ============================================================
GAME.WorldExpansion = {
  // ---- الخصائص ----
  game: null,
  currentZone: 'farm',
  zones: null,
  playerPosition: { x: 0, y: 0, z: 0 },
  playerDirection: { x: 0, z: 1 },
  discoveredPOIs: {},
  resourceNodes: {},
  enemies: {},
  transitioning: false,
  unlockedZones: { farm: true },
  totalResourcesGathered: {},

  // ---- التهيئة ----
  init: function(game) {
    this.game = game || null;
    this.currentZone = 'farm';
    this.zones = JSON.parse(JSON.stringify(GAME.WORLD_ZONES));
    this.playerPosition = { x: 0, y: 0, z: 0 };
    this.playerDirection = { x: 0, z: 1 };
    this.discoveredPOIs = {};
    this.resourceNodes = {};
    this.enemies = {};
    this.transitioning = false;
    this.unlockedZones = { farm: true };
    this.totalResourcesGathered = {};

    console.log('🗺️ تم تهيئة نظام توسيع العالم');
    this.spawnResourceNodes(this.currentZone);
    this.spawnEnemies(this.currentZone);
  },

  // ============================================================
  // 🚀 نظام الانتقال بين المناطق
  // ============================================================

  /**
   * الانتقال إلى منطقة جديدة
   * @param {string} zoneId - معرف المنطقة المستهدفة
   * @returns {boolean} - هل نجح الانتقال
   */
  travelToZone: function(zoneId) {
    if (this.transitioning) {
      console.warn('⚠️ انتقال جارٍ - لا يمكن الانتقال مرة أخرى');
      return false;
    }

    var targetZone = this.zones[zoneId];
    if (!targetZone) {
      console.error('❌ المنطقة غير موجودة:', zoneId);
      return false;
    }

    // التحقق من فتح المنطقة
    if (!this.unlockedZones[zoneId]) {
      if (!this.unlockZone(zoneId)) {
        return false;
      }
    }

    this.transitioning = true;
    console.log('🔄 الانتقال من ' + this.getCurrentZone().nameAr + ' إلى ' + targetZone.nameAr + '...');

    this.executeTransition(zoneId);
    return true;
  },

  /**
   * تنفيذ الانتقال الفعلي
   */
  executeTransition: function(zoneId) {
    var targetZone = this.zones[zoneId];
    var previousZone = this.currentZone;

    this.currentZone = zoneId;
    this.playerPosition = {
      x: targetZone.spawnPoint.x,
      y: targetZone.spawnPoint.y,
      z: targetZone.spawnPoint.z
    };

    this.spawnResourceNodes(zoneId);
    this.spawnEnemies(zoneId);

    if (this.game && this.game.events) {
      this.game.events.emit('zoneChanged', {
        previousZone: previousZone,
        currentZone: zoneId,
        zoneData: targetZone
      });
    }

    console.log('✅ وصلت إلى ' + targetZone.nameAr);
    this.transitioning = false;
    this.showZoneWelcome(targetZone);
  },

  /**
   * عرض رسالة ترحيب بالمنطقة
   */
  showZoneWelcome: function(zone) {
    if (this.game && this.game.ui) {
      this.game.ui.showMessage(
        zone.icon + ' ' + zone.nameAr,
        zone.descriptionAr,
        3000
      );
    }
  },

  // ============================================================
  // 🔓 نظام فتح المناطق
  // ============================================================

  /**
   * محاولة فتح منطقة جديدة
   */
  unlockZone: function(zoneId) {
    var zone = this.zones[zoneId];
    if (!zone) return false;

    if (this.unlockedZones[zoneId]) {
      console.log('ℹ️ المنطقة ' + zone.nameAr + ' مفتوحة بالفعل');
      return true;
    }

    var playerGold = this.getPlayerGold();
    if (playerGold < zone.unlockCost) {
      console.warn('❌ لا تملك ما يكفي لفتح ' + zone.nameAr + '. تحتاج ' + zone.unlockCost + ' ذهب، لديك ' + playerGold);
      if (this.game && this.game.ui) {
        this.game.ui.showMessage(
          '❌ منطقة مقفلة',
          'تحتاج ' + zone.unlockCost + ' ذهب لفتح ' + zone.nameAr,
          3000
        );
      }
      return false;
    }

    this.spendPlayerGold(zone.unlockCost);
    this.unlockedZones[zoneId] = true;
    zone.unlocked = true;

    console.log('🔓 تم فتح منطقة ' + zone.nameAr + ' بتكلفة ' + zone.unlockCost + ' ذهب');

    if (this.game && this.game.ui) {
      this.game.ui.showMessage(
        '🔓 تم فتح ' + zone.nameAr + '!',
        'يمكنك الآن زيارة ' + zone.nameAr,
        4000
      );
    }

    return true;
  },

  /**
   * التحقق مما إذا كانت المنطقة مفتوحة
   */
  isZoneUnlocked: function(zoneId) {
    return !!this.unlockedZones[zoneId];
  },

  /**
   * الحصول على قائمة المناطق المفتوحة
   */
  getUnlockedZones: function() {
    var self = this;
    return Object.keys(this.unlockedZones)
      .filter(function(id) { return self.unlockedZones[id]; })
      .map(function(id) { return self.zones[id]; });
  },

  /**
   * الحصول على قائمة المناطق المقفلة
   */
  getLockedZones: function() {
    var self = this;
    return Object.values(this.zones)
      .filter(function(z) { return !self.unlockedZones[z.id]; });
  },

  // ============================================================
  // 📍 نظام نقاط الاهتمام (POI)
  // ============================================================

  /**
   * الحصول على نقاط الاهتمام القريبة
   */
  getNearbyPOIs: function(radius) {
    radius = radius || 10;
    var zone = this.getCurrentZone();
    if (!zone) return [];

    var self = this;
    return zone.pointsOfInterest.filter(function(poi) {
      var dx = poi.position.x - self.playerPosition.x;
      var dz = poi.position.z - self.playerPosition.z;
      var distance = Math.sqrt(dx * dx + dz * dz);
      return distance <= (radius || poi.radius);
    });
  },

  /**
   * التفاعل مع نقطة اهتمام
   */
  interactWithPOI: function(poiId) {
    var zone = this.getCurrentZone();
    var poi = zone.pointsOfInterest.find(function(p) { return p.id === poiId; });
    if (!poi) {
      console.error('❌ نقطة الاهتمام غير موجودة:', poiId);
      return null;
    }

    var dx = poi.position.x - this.playerPosition.x;
    var dz = poi.position.z - this.playerPosition.z;
    var distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > poi.radius + 2) {
      console.warn('⚠️ أنت بعيد عن هذه النقطة');
      return { error: 'too_far' };
    }

    this.discoveredPOIs[poiId] = true;
    return this.handlePOIInteraction(poi);
  },

  /**
   * معالجة التفاعل حسب نوع النقطة
   */
  handlePOIInteraction: function(poi) {
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
        console.log('ℹ️ تفاعل مع: ' + poi.nameAr);
        return { type: poi.type, data: poi };
    }
  },

  // ---- معالجات أنواع نقاط الاهتمام ----

  handleZoneExit: function(poi) {
    console.log('🚪 الانتقال إلى ' + poi.targetZone);
    this.travelToZone(poi.targetZone);
    return { type: 'travel', target: poi.targetZone };
  },

  handleShop: function(poi) {
    console.log('🏪 فتح المتجر: ' + poi.nameAr);
    if (this.game && this.game.shop) {
      this.game.shop.open(poi.shopType);
    }
    return { type: 'shop', shopType: poi.shopType };
  },

  handleUpgrade: function(poi) {
    console.log('🔨 فتح ورشة: ' + poi.nameAr);
    if (this.game && this.game.upgrade) {
      this.game.upgrade.open(poi.services);
    }
    return { type: 'upgrade', services: poi.services };
  },

  handleHealing: function(poi) {
    if (this.game && this.game.player) {
      var currentHealth = this.game.player.health || 100;
      var maxHealth = this.game.player.maxHealth || 100;

      if (currentHealth >= maxHealth) {
        console.log('❤️ صحتك ممتلئة بالفعل');
        return { type: 'healing', healed: false, reason: 'full_health' };
      }

      this.game.player.health = Math.min(currentHealth + poi.healAmount, maxHealth);
      console.log('❤️ شُفيت بـ ' + poi.healAmount + ' نقطة صحة');
      return { type: 'healing', healed: true, amount: poi.healAmount };
    }
    return { type: 'healing', healed: false, reason: 'no_player' };
  },

  handleRestPoint: function(poi) {
    console.log('⛺ الراحة في ' + poi.nameAr);
    if (this.game && this.game.player) {
      if (this.game.player.stamina !== undefined) {
        this.game.player.stamina = this.game.player.maxStamina || 100;
      }
    }
    return { type: 'rest' };
  },

  handleResourceBonus: function(poi) {
    console.log('✨ مكافأة الموارد: ' + poi.bonusMultiplier + 'x');
    return { type: 'resource_bonus', resourceId: poi.resourceId, multiplier: poi.bonusMultiplier };
  },

  handleHarvestBonus: function(poi) {
    console.log('🌳 مكافأة الحصاد: ' + poi.bonusMultiplier + 'x حول الشجرة القديمة');
    return { type: 'harvest_bonus', multiplier: poi.bonusMultiplier };
  },

  handleViewpoint: function(poi) {
    console.log('👁️ كشف الخريطة: ' + poi.nameAr);
    if (poi.revealsMap) {
      return { type: 'viewpoint', revealed: true, zone: this.currentZone };
    }
    return { type: 'viewpoint', revealed: false };
  },

  handleTreasure: function(poi) {
    if (poi.locked) {
      console.log('🔒 الكنز مقفل - تحتاج ' + poi.keyRequired);
      return { type: 'treasure', locked: true, keyRequired: poi.keyRequired };
    }
    console.log('💰 فتح الكنز: ' + poi.nameAr);
    return { type: 'treasure', locked: false, loot: poi.loot };
  },

  handleCooking: function(poi) {
    console.log('🍳 الطهي في ' + poi.nameAr);
    if (this.game && this.game.cooking) {
      this.game.cooking.open();
    }
    return { type: 'cooking' };
  },

  handleSavePoint: function(poi) {
    console.log('💾 حفظ التقدم في ' + poi.nameAr);
    if (this.game && this.game.save) {
      this.game.save();
    }
    return { type: 'save' };
  },

  handleQuestLocation: function(poi) {
    console.log('📋 موقع المهمة: ' + poi.nameAr);
    return { type: 'quest', location: poi };
  },

  handleDungeonEntrance: function(poi) {
    console.log('🕳️ دخول الزنزانة: المستوى ' + poi.targetDepth);
    return { type: 'dungeon', depth: poi.targetDepth };
  },

  // ============================================================
  // 🌿 نظام الموارد
  // ============================================================

  /**
   * توليد عقد الموارد لمنطقة معينة
   */
  spawnResourceNodes: function(zoneId) {
    var zone = this.zones[zoneId];
    if (!zone) return;

    this.resourceNodes[zoneId] = [];
    var self = this;

    zone.resources.forEach(function(resource) {
      var count = self.getRandomResourceCount(resource);

      for (var i = 0; i < count; i++) {
        var position = self.getRandomPosition(zone.size);

        self.resourceNodes[zoneId].push({
          id: resource.id + '_' + i,
          resourceId: resource.id,
          position: position,
          quantity: self.getRandomInt(resource.quantity.min, resource.quantity.max),
          depleted: false,
          respawnTimer: 0,
          data: resource
        });
      }
    });

    console.log('🌿 تم توليد ' + this.resourceNodes[zoneId].length + ' مورد في ' + zone.nameAr);
  },

  /**
   * الحصول على عدد عشوائي من الموارد
   */
  getRandomResourceCount: function(resource) {
    if (resource.spawnChance) {
      if (Math.random() > resource.spawnChance) return 0;
    }
    return this.getRandomInt(3, 8);
  },

  /**
   * جمع مورد
   */
  gatherResource: function(nodeId) {
    var nodes = this.resourceNodes[this.currentZone];
    if (!nodes) return null;

    var node = null;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].id === nodeId) { node = nodes[i]; break; }
    }
    if (!node || node.depleted) {
      console.warn('⚠️ المورد غير متاح');
      return null;
    }

    var resource = node.data;

    if (resource.toolRequired) {
      if (!this.hasRequiredTool(resource.toolRequired)) {
        console.warn('⚠️ تحتاج ' + resource.toolRequired + ' لجمع ' + resource.nameAr);
        return { error: 'tool_required', tool: resource.toolRequired };
      }
    }

    var gathered = {
      id: resource.id,
      name: resource.name,
      nameAr: resource.nameAr,
      icon: resource.icon,
      quantity: node.quantity,
      value: resource.value
    };

    if (!this.totalResourcesGathered[resource.id]) {
      this.totalResourcesGathered[resource.id] = 0;
    }
    this.totalResourcesGathered[resource.id] += node.quantity;

    node.depleted = true;
    node.respawnTimer = resource.respawnTime;

    console.log('✅ تم جمع ' + node.quantity + 'x ' + resource.nameAr);

    if (this.game && this.game.inventory) {
      this.game.inventory.addItem(resource.id, node.quantity);
    }

    if (this.game && this.game.events) {
      this.game.events.emit('resourceGathered', gathered);
    }

    return gathered;
  },

  /**
   * تحديث موارد (يُنادى كل ثانية)
   */
  updateResources: function(deltaTime) {
    var nodes = this.resourceNodes[this.currentZone];
    if (!nodes) return;

    var self = this;
    nodes.forEach(function(node) {
      if (node.depleted && node.respawnTimer > 0) {
        node.respawnTimer -= deltaTime;
        if (node.respawnTimer <= 0) {
          node.depleted = false;
          node.quantity = self.getRandomInt(
            node.data.quantity.min,
            node.data.quantity.max
          );
          console.log('🌱 عاد مورد ' + node.data.nameAr);
        }
      }
    });
  },

  /**
   * الحصول على الموارد المتوفرة
   */
  getAvailableResources: function() {
    var nodes = this.resourceNodes[this.currentZone];
    if (!nodes) return [];
    return nodes.filter(function(n) { return !n.depleted; });
  },

  /**
   * البحث عن مورد بالقرب
   */
  findNearestResource: function(resourceId, maxDistance) {
    maxDistance = maxDistance || 15;
    var nodes = this.resourceNodes[this.currentZone];
    if (!nodes) return null;

    var self = this;
    var nearest = null;
    var nearestDist = maxDistance;

    nodes.filter(function(n) { return !n.depleted && n.resourceId === resourceId; }).forEach(function(node) {
      var dx = node.position.x - self.playerPosition.x;
      var dz = node.position.z - self.playerPosition.z;
      var dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = node;
      }
    });

    return nearest;
  },

  // ============================================================
  // 👾 نظام الأعداء
  // ============================================================

  /**
   * توليد أعداء المنطقة
   */
  spawnEnemies: function(zoneId) {
    var zone = this.zones[zoneId];
    if (!zone) return;

    this.enemies[zoneId] = [];
    var self = this;

    zone.enemies.forEach(function(enemyType) {
      var count = self.getRandomInt(3, 6);

      for (var i = 0; i < count; i++) {
        var position = self.getRandomPosition(zone.size);

        self.enemies[zoneId].push({
          id: enemyType.id + '_' + i,
          type: enemyType.id,
          position: { x: position.x, y: position.y, z: position.z },
          health: enemyType.health,
          maxHealth: enemyType.health,
          damage: enemyType.damage,
          speed: enemyType.speed,
          alive: true,
          data: enemyType,
          patrol: self.generatePatrolPath(position, zone.size),
          patrolIndex: 0,
          lastAttack: 0
        });
      }
    });

    console.log('👾 تم توليد ' + this.enemies[zoneId].length + ' عدو في ' + zone.nameAr);
  },

  /**
   * تحديث أعداء المنطقة
   */
  updateEnemies: function(deltaTime) {
    var enemies = this.enemies[this.currentZone];
    if (!enemies) return;

    var now = Date.now();
    var self = this;

    enemies.forEach(function(enemy) {
      if (!enemy.alive) return;

      self.moveEnemyPatrol(enemy, deltaTime);

      var dx = self.playerPosition.x - enemy.position.x;
      var dz = self.playerPosition.z - enemy.position.z;
      var distToPlayer = Math.sqrt(dx * dx + dz * dz);

      if (distToPlayer <= enemy.data.aggroRange) {
        enemy.position.x += (dx / distToPlayer) * enemy.speed * deltaTime * 0.5;
        enemy.position.z += (dz / distToPlayer) * enemy.speed * deltaTime * 0.5;

        if (distToPlayer <= 2) {
          if (now - enemy.lastAttack > 1500) {
            self.enemyAttackPlayer(enemy);
            enemy.lastAttack = now;
          }
        }
      }
    });
  },

  /**
   * هجوم العدو على اللاعب
   */
  enemyAttackPlayer: function(enemy) {
    if (this.game && this.game.player) {
      var damage = enemy.damage;

      if (enemy.data.chargeAttack && Math.random() < 0.3) {
        damage *= 2;
        console.log('⚡ ' + enemy.data.nameAr + ' يهاجم بشدة!');
      }

      this.game.player.takeDamage(damage);
      console.log('💔 تلقيت ' + damage + ' ضرر من ' + enemy.data.nameAr);

      if (this.game && this.game.events) {
        this.game.events.emit('enemyAttack', { enemy: enemy, damage: damage });
      }
    }
  },

  /**
   * هجوم اللاعب على العدو
   */
  playerAttackEnemy: function(enemyId, damage) {
    damage = damage || 10;
    var enemies = this.enemies[this.currentZone];
    if (!enemies) return null;

    var enemy = null;
    for (var i = 0; i < enemies.length; i++) {
      if (enemies[i].id === enemyId) { enemy = enemies[i]; break; }
    }
    if (!enemy || !enemy.alive) return null;

    var actualDamage = Math.max(1, damage - (enemy.data.armor || 0));
    enemy.health -= actualDamage;

    console.log('⚔️ ضربت ' + enemy.data.nameAr + ' بـ ' + actualDamage + ' ضرر');

    if (enemy.health <= 0) {
      return this.killEnemy(enemy);
    }

    return { enemy: enemy.id, damage: actualDamage, alive: true, health: enemy.health };
  },

  /**
   * قتل العدو
   */
  killEnemy: function(enemy) {
    enemy.alive = false;
    console.log('☠️ قتلت ' + enemy.data.nameAr + '!');

    var drops = [];
    var self = this;
    if (enemy.data.drops) {
      enemy.data.drops.forEach(function(drop) {
        if (Math.random() < drop.chance) {
          drops.push({ id: drop.id, nameAr: drop.nameAr, value: drop.value });
          if (self.game && self.game.inventory) {
            self.game.inventory.addItem(drop.id, 1);
          }
        }
      });
    }

    if (this.game && this.game.player) {
      this.game.player.addXP(enemy.data.xpReward);
    }

    setTimeout(function() {
      self.respawnEnemy(enemy);
    }, 30000);

    if (this.game && this.game.events) {
      this.game.events.emit('enemyKilled', { enemy: enemy, drops: drops });
    }

    return {
      enemy: enemy.id,
      damage: 0,
      alive: false,
      drops: drops,
      xp: enemy.data.xpReward
    };
  },

  /**
   * إعادة توليد العدو
   */
  respawnEnemy: function(enemy) {
    var zone = this.zones[this.currentZone];
    enemy.position = this.getRandomPosition(zone.size);
    enemy.health = enemy.maxHealth;
    enemy.alive = true;
    console.log('🔄 عاد ' + enemy.data.nameAr);
  },

  /**
   * توليد مسار دورية عشوائي
   */
  generatePatrolPath: function(center, zoneSize) {
    var path = [];
    var numPoints = 4;
    var range = 8;

    for (var i = 0; i < numPoints; i++) {
      path.push({
        x: center.x + (Math.random() - 0.5) * range * 2,
        z: center.z + (Math.random() - 0.5) * range * 2
      });
    }

    return path;
  },

  /**
   * تحريك العدو في مسار الدورية
   */
  moveEnemyPatrol: function(enemy, deltaTime) {
    if (!enemy.patrol || enemy.patrol.length === 0) return;

    var target = enemy.patrol[enemy.patrolIndex];
    var dx = target.x - enemy.position.x;
    var dz = target.z - enemy.position.z;
    var dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.5) {
      enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
    } else {
      enemy.position.x += (dx / dist) * enemy.speed * deltaTime * 0.3;
      enemy.position.z += (dz / dist) * enemy.speed * deltaTime * 0.3;
    }
  },

  /**
   * الحصول على الأعداء القريبة
   */
  getNearbyEnemies: function(radius) {
    radius = radius || 15;
    var enemies = this.enemies[this.currentZone];
    if (!enemies) return [];

    var self = this;
    return enemies.filter(function(e) {
      if (!e.alive) return false;
      var dx = e.position.x - self.playerPosition.x;
      var dz = e.position.z - self.playerPosition.z;
      return Math.sqrt(dx * dx + dz * dz) <= radius;
    });
  },

  // ============================================================
  // 🔄 تحديث عام
  // ============================================================

  /**
   * تحديث نظام العالم (يُنادى كل إطار)
   */
  update: function(deltaTime) {
    if (this.transitioning) return;
    this.updateResources(deltaTime);
    this.updateEnemies(deltaTime);
  },

  // ============================================================
  // 💾 حفظ وتحميل
  // ============================================================

  /**
   * حفظ حالة نظام العالم
   */
  saveState: function() {
    return {
      currentZone: this.currentZone,
      playerPosition: { x: this.playerPosition.x, y: this.playerPosition.y, z: this.playerPosition.z },
      unlockedZones: JSON.parse(JSON.stringify(this.unlockedZones)),
      discoveredPOIs: JSON.parse(JSON.stringify(this.discoveredPOIs)),
      totalResourcesGathered: JSON.parse(JSON.stringify(this.totalResourcesGathered))
    };
  },

  /**
   * تحميل حالة نظام العالم
   */
  loadState: function(state) {
    if (!state) return;

    this.currentZone = state.currentZone || 'farm';
    this.playerPosition = state.playerPosition || { x: 0, y: 0, z: 0 };
    this.unlockedZones = state.unlockedZones || { farm: true };
    this.discoveredPOIs = state.discoveredPOIs || {};
    this.totalResourcesGathered = state.totalResourcesGathered || {};

    this.spawnResourceNodes(this.currentZone);
    this.spawnEnemies(this.currentZone);

    console.log('💾 تم تحميل حالة نظام العالم');
  },

  // ============================================================
  // 🔧 أدوات مساعدة
  // ============================================================

  /**
   * الحصول على المنطقة الحالية
   */
  getCurrentZone: function() {
    return this.zones[this.currentZone];
  },

  /**
   * الحصول على معرف المنطقة الحالية
   */
  getCurrentZoneId: function() {
    return this.currentZone;
  },

  /**
   * الحصول على مواقع الأعداء (للعرض)
   */
  getEnemyPositions: function() {
    var enemies = this.enemies[this.currentZone];
    if (!enemies) return [];
    return enemies.filter(function(e) { return e.alive; }).map(function(e) {
      return {
        id: e.id,
        type: e.type,
        position: e.position,
        health: e.health,
        maxHealth: e.maxHealth,
        data: e.data
      };
    });
  },

  /**
   * الحصول على مواقع الموارد (للعرض)
   */
  getResourcePositions: function() {
    var nodes = this.resourceNodes[this.currentZone];
    if (!nodes) return [];
    return nodes.filter(function(n) { return !n.depleted; }).map(function(n) {
      return {
        id: n.id,
        resourceId: n.resourceId,
        position: n.position,
        quantity: n.quantity,
        data: n.data
      };
    });
  },

  /**
   * تحديث موقع اللاعب
   */
  updatePlayerPosition: function(x, y, z) {
    this.playerPosition = { x: x, y: y, z: z };
  },

  /**
   * الحصول على ذهب اللاعب
   */
  getPlayerGold: function() {
    if (this.game && this.game.economy) {
      return this.game.economy.getGold ? this.game.economy.getGold() : 0;
    }
    return 0;
  },

  /**
   * إنفاق ذهب اللاعب
   */
  spendPlayerGold: function(amount) {
    if (this.game && this.game.economy) {
      if (this.game.economy.spendGold) {
        return this.game.economy.spendGold(amount);
      }
    }
    return false;
  },

  /**
   * التحقق من توفر الأداة
   */
  hasRequiredTool: function(toolId) {
    if (this.game && this.game.inventory) {
      return this.game.inventory.hasItem ? this.game.inventory.hasItem(toolId) : false;
    }
    return false;
  },

  /**
   * توليد موقع عشوائي داخل المنطقة
   */
  getRandomPosition: function(zoneSize) {
    return {
      x: (Math.random() - 0.5) * zoneSize.width * 0.8,
      y: 0,
      z: (Math.random() - 0.5) * zoneSize.depth * 0.8
    };
  },

  /**
   * الحصول على عدد عشوائي
   */
  getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * الحصول على إحصائيات نظام العالم
   */
  getStats: function() {
    var totalPOIs = 0;
    var self = this;
    Object.values(this.zones).forEach(function(z) {
      totalPOIs += z.pointsOfInterest.length;
    });

    return {
      currentZone: this.currentZone,
      unlockedZones: Object.keys(this.unlockedZones).length,
      totalZones: Object.keys(this.zones).length,
      discoveredPOIs: Object.keys(this.discoveredPOIs).length,
      totalPOIs: totalPOIs,
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
  mountain: { village: 'north' }
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
