/**
 * NPCsSystem.js - نظام الشخصيات غير القابلة للعب (NPC)
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - 5 NPCs أساسيين (البلدية، تاجر، مزارع، حداد، شيف)
 * - نظام حوار بسيط (3 خيارات لكل NPC)
 * - نظام مهام يومية
 * - نظام صداقه (0-100)
 * - نظام هدايا
 * - NPCs يتحركون في أوقات محدده
 * - حفظ وتحميل الحالة
 * - تكامل مع الأنظمة الأخرى
 */

var GAME = GAME || {};

// ============================================================
// 👥 بيانات الشخصيات الأساسية (5 NPCs)
// ============================================================
GAME.NPC_DATA = {
  mayor: {
    name: 'Mayor Lewis', nameAr: 'العم Lewis',
    role: 'Mayor', roleAr: 'البلدية',
    icon: '🎩',
    color: 0x4169E1, // أزرق ملكي
    skinColor: 0xFFDBAC,
    shirtColor: 0x4169E1,
    pantsColor: 0x2F2F2F,
    size: { width: 0.5, height: 1.0, depth: 0.5 },
    // مواقع NPC على الخريطة
    homePosition: { x: -20, y: 0, z: 15 }, // خارج البلدية
    workPosition: { x: -20, y: 0, z: 10 }, // مكتب البلدية
    // جدول الحركة اليومي
    schedule: {
      6: { x: -20, y: 0, z: 10, action: 'work', label: 'يبدأ العمل' },      // 6 صباحاً
      12: { x: -15, y: 0, z: 5, action: 'eat', label: 'غداء' },             // 12 ظهراً
      14: { x: -20, y: 0, z: 10, action: 'work', label: 'يعود للعمل' },     // 2 ظهراً
      18: { x: -20, y: 0, z: 15, action: 'home', label: 'يعود للبيت' },     // 6 مساءً
      22: { x: -20, y: 0, z: 15, action: 'sleep', label: 'ينام' }           // 10 مساءً
    },
    // هدايا يحبها
    lovedGifts: ['wine', 'cheese', 'pumpkin_pie'],
    likedGifts: ['bread', 'jam', 'salad'],
    hatedGifts: ['wheat', 'potato'],
    dialogueOptions: [
      { id: 'greeting', text: 'مرحباً! كيف حالك اليوم؟', textEn: 'Hello! How are you today?' },
      { id: 'quest_info', text: 'هل هناك أي مهام للبلدية؟', textEn: 'Any tasks for the town?' },
      { id: 'about_town', text: 'أخبرني عن هذا المكان', textEn: 'Tell me about this place' }
    ],
    dialogues: {
      greeting: [
        { response: 'أهلاً بك! أنت تبدو جيداً اليوم', responseEn: 'Welcome! You look good today' },
        { response: 'الحمد لله، البلد تحتاج من يعتني بها', responseEn: 'Praise God, the town needs caring' },
        { response: 'أنت من أفضل أهل القرية', responseEn: 'You are one of the best townsfolk' }
      ],
      quest_info: [
        { response: 'نعم، نحتاج من يجمع بعض الخضروات للحديقة العامة', responseEn: 'Yes, we need someone to collect vegetables for the public park' },
        { response: 'يمكنك مساعدتنا في تجميل شوارع القرية', responseEn: 'You can help us beautify the village streets' },
        { response: 'لدي مهمة خاصة... أحضر لي 5 منتجات زراعية', responseEn: "I have a special task... bring me 5 farm products" }
      ],
      about_town: [
        { response: 'هذه القرية سلام، أسسها جدّي قبل 50 سنة', responseEn: 'This is a peaceful village, my grandfather founded it 50 years ago' },
        { response: 'الجميع هنا كأحد الأسرة', responseEn: 'Everyone here is like family' },
        { response: 'نأمل أن تكون سعيداً هنا', responseEn: 'We hope you will be happy here' }
      ]
    }
  },

  shopkeeper: {
    name: 'Shopkeeper Pierre', nameAr: 'التاجر Pierre',
    role: 'Shopkeeper', roleAr: 'تاجر',
    icon: '🏪',
    color: 0x228B22, // أخضر
    skinColor: 0xFFDBAC,
    shirtColor: 0x228B22,
    pantsColor: 0x8B4513,
    size: { width: 0.5, height: 0.9, depth: 0.5 },
    homePosition: { x: 15, y: 0, z: -5 },
    workPosition: { x: 15, y: 0, z: -5 },
    schedule: {
      7: { x: 15, y: 0, z: -5, action: 'open_shop', label: 'يفتح المتجر' },
      12: { x: 15, y: 0, z: 0, action: 'eat', label: 'استراحة غداء' },
      13: { x: 15, y: 0, z: -5, action: 'work', label: 'يعود للعمل' },
      20: { x: 15, y: 0, z: -5, action: 'close_shop', label: 'يغلق المتجر' },
      22: { x: 18, y: 0, z: -5, action: 'sleep', label: 'ينام' }
    },
    lovedGifts: ['wine', 'jam', 'juice'],
    likedGifts: ['bread', 'cheese', 'butter'],
    hatedGifts: ['rotten_apple', 'weed'],
    dialogueOptions: [
      { id: 'greeting', text: 'مرحباً! ما الجديد في المتجر؟', textEn: "Hello! What's new at the shop?" },
      { id: 'shop_deals', text: 'هل لديك عروض خاصة اليوم؟', textEn: 'Any special deals today?' },
      { id: 'rare_items', text: 'هل تحصل على أشياء نادرة؟', textEn: 'Do you get rare items?' }
    ],
    dialogues: {
      greeting: [
        { response: 'أهلاً بك! تفضل بالتصفح', responseEn: 'Welcome! Feel free to browse' },
        { response: 'لدي منتجات جديدة اليوم', responseEn: 'I have new products today' },
        { response: 'يسعدني خدمتك دائماً', responseEn: 'Always happy to serve you' }
      ],
      shop_deals: [
        { response: 'نعم! خصم 20% على الخضروات الطازجة', responseEn: 'Yes! 20% off on fresh vegetables' },
        { response: 'اشترِ 2 واحصل على 1 مجاناً على البذور', responseEn: 'Buy 2 get 1 free on seeds' },
        { response: 'عندما تشتري بالجملة أضمن لك أفضل الأسعار', responseEn: 'When you buy wholesale I guarantee the best prices' }
      ],
      rare_items: [
        { response: 'أحياناً أحضر أصنافاً خاصة من المسافرين', responseEn: 'Sometimes I bring special items from travelers' },
        { response: 'إذا أردت شيئاً خاصاً أخبرني وسأبحث عنه', responseEn: 'If you want something special, tell me and I will look for it' },
        { response: 'لدي بلاتينيوم من حديقة الأزهار، هل تهتم؟', responseEn: 'I have platinum from the flower garden, interested?' }
      ]
    }
  },

  farmer: {
    name: 'Farmer Clint', nameAr: 'المزارع Clint',
    role: 'Farmer', roleAr: 'مزارع',
    icon: '👨‍🌾',
    color: 0xDAA520, // ذهبي
    skinColor: 0xD2B48C,
    shirtColor: 0xDAA520,
    pantsColor: 0x654321,
    size: { width: 0.5, height: 1.0, depth: 0.5 },
    homePosition: { x: -10, y: 0, z: 20 },
    workPosition: { x: -5, y: 0, z: 15 }, // الحقل
    schedule: {
      5: { x: -5, y: 0, z: 15, action: 'farm_work', label: 'يعمل في الحقل' },
      8: { x: 0, y: 0, z: 20, action: 'eat_breakfast', label: 'فطور' },
      9: { x: -5, y: 0, z: 15, action: 'farm_work', label: 'يعود للحقل' },
      13: { x: 0, y: 0, z: 20, action: 'eat', label: 'غداء' },
      14: { x: -5, y: 0, z: 15, action: 'farm_work', label: 'يعود للحقل' },
      18: { x: -10, y: 0, z: 20, action: 'home', label: 'يعود للبيت' },
      21: { x: -10, y: 0, z: 20, action: 'sleep', label: 'ينام' }
    },
    lovedGifts: ['wine', 'jam', 'sunflower_oil'],
    likedGifts: ['wheat', 'tomato', 'potato', 'carrot'],
    hatedGifts: ['rotten_apple'],
    dialogueOptions: [
      { id: 'greeting', text: 'كيف حالك يا مزارع؟', textEn: 'How are you, farmer?' },
      { id: 'farming_tips', text: 'هل لديك نصائح للزراعة؟', textEn: 'Any farming tips?' },
      { id: 'season_info', text: 'ماذا عن الموسم الحالي؟', textEn: 'What about the current season?' }
    ],
    dialogues: {
      greeting: [
        { response: 'الحمد لله، الحقل يحتاج عناية دائمة', responseEn: 'Praise God, the field needs constant care' },
        { response: 'أنا سعيد لأن المحصول نما جيداً', responseEn: 'I am happy the crop grew well' },
        { response: 'المطر اليوم كان بركة', responseEn: 'The rain today was a blessing' }
      ],
      farming_tips: [
        { response: 'اسقِ المحاصيل كل يوم، النباتات تحتاج ماء', responseEn: 'Water your crops every day, plants need water' },
        { response: 'السماد الطبيعي أفضل من الصناعي', responseEn: 'Natural fertilizer is better than artificial' },
        { response: 'لا تزرع في الشتاء، انتظر الربيع', responseEn: "Don't plant in winter, wait for spring" }
      ],
      season_info: [
        { response: 'الربيع هو الأفضل للزراعة، ابدأ بالخضروات', responseEn: 'Spring is best for farming, start with vegetables' },
        { response: 'الصيف حار، ازرع الطماطم والخيار', responseEn: "Summer is hot, plant tomatoes and cucumbers" },
        { response: 'الخريف موسم الحصاد، لا تفوّت الفرصة', responseEn: "Autumn is harvest season, don't miss the chance" }
      ]
    }
  },

  blacksmith: {
    name: 'Blacksmith Clint', nameAr: 'الحداد Clint',
    role: 'Blacksmith', roleAr: 'حداد',
    icon: '🔨',
    color: 0x808080, // رمادي
    skinColor: 0xD2B48C,
    shirtColor: 0x4A4A4A,
    pantsColor: 0x2F2F2F,
    size: { width: 0.55, height: 1.05, depth: 0.55 },
    homePosition: { x: 20, y: 0, z: 15 },
    workPosition: { x: 20, y: 0, z: 10 }, // المشغل
    schedule: {
      7: { x: 20, y: 0, z: 10, action: 'work', label: 'يفتح المشغل' },
      10: { x: 22, y: 0, z: 12, action: 'break', label: 'استراحة قهوة' },
      11: { x: 20, y: 0, z: 10, action: 'work', label: 'يعود للعمل' },
      13: { x: 18, y: 0, z: 15, action: 'eat', label: 'غداء' },
      14: { x: 20, y: 0, z: 10, action: 'work', label: 'يعود للعمل' },
      19: { x: 20, y: 0, z: 15, action: 'home', label: 'يغلق المشغل' },
      22: { x: 20, y: 0, z: 15, action: 'sleep', label: 'ينام' }
    },
    lovedGifts: ['gold_bar', 'diamond', 'wine'],
    likedGifts: ['iron_bar', 'coal', 'cheese'],
    hatedGifts: ['flower', 'salad'],
    dialogueOptions: [
      { id: 'greeting', text: 'مرحباً يا حداد!', textEn: 'Hello, blacksmith!' },
      { id: 'upgrade_tools', text: 'هل يمكنك ترقية أدواتي؟', textEn: 'Can you upgrade my tools?' },
      { id: 'repair', text: 'أحتاج إصلاح بعض الأشياء', textEn: 'I need to fix some things' }
    ],
    dialogues: {
      greeting: [
        { response: 'مرحباً! الأداة تصلح بالحديد والنار', responseEn: 'Hello! Tools are fixed with iron and fire' },
        { response: 'الحدادة فن قديم، أنا أحبه', responseEn: 'Blacksmithing is an ancient art, I love it' },
        { response: 'اشتغل في ورشتي طول اليوم', responseEn: 'I work in my workshop all day' }
      ],
      upgrade_tools: [
        { response: 'نعم، أحضر لي 5 قضبان حديد وسأرقّي لك', responseEn: "Yes, bring me 5 iron bars and I'll upgrade it" },
        { response: 'ترقية المنجل تستغرق يوماً واحداً فقط', responseEn: 'Upgrading the sickle takes just one day' },
        { response: 'الأداة الفضية أقوى بمرتين من العادية', responseEn: 'Silver tools are twice as strong as normal ones' }
      ],
      repair: [
        { response: 'أحضر ما تحتاجه وسأصلحه لك', responseEn: 'Bring what you need and I will fix it for you' },
        { response: 'الإصلاح بسيط، التكلفة قليلة', responseEn: 'Repair is simple, the cost is low' },
        { response: 'أحب أن أرى الأدوات تعود للحياة', responseEn: 'I love seeing tools come back to life' }
      ]
    }
  },

  chef: {
    name: 'Chef Leo', nameAr: 'الشيف Leo',
    role: 'Chef', roleAr: 'شيف',
    icon: '👨‍🍳',
    color: 0xFF6347, // أحمر طماطم
    skinColor: 0xFFDBAC,
    shirtColor: 0xFFFFFF, // أبيض الشيف
    hatColor: 0xFFFFFF,
    pantsColor: 0x2F2F2F,
    size: { width: 0.45, height: 0.95, depth: 0.45 },
    homePosition: { x: -15, y: 0, z: -10 },
    workPosition: { x: -15, y: 0, z: -10 }, // المطعم
    schedule: {
      6: { x: -15, y: 0, z: -10, action: 'prepare_food', label: 'يحضر الطعام' },
      8: { x: -15, y: 0, z: -8, action: 'serve_breakfast', label: 'يقدم الفطور' },
      12: { x: -15, y: 0, z: -8, action: 'serve_lunch', label: 'يقدم الغداء' },
      15: { x: -15, y: 0, z: -12, action: 'rest', label: 'استراحة' },
      18: { x: -15, y: 0, z: -8, action: 'serve_dinner', label: 'يقدم العشاء' },
      22: { x: -15, y: 0, z: -10, action: 'clean', label: 'ينظف المطبخ' },
      23: { x: -15, y: 0, z: -12, action: 'sleep', label: 'ينام' }
    },
    lovedGifts: ['wine', 'jam', 'pumpkin_pie'],
    likedGifts: ['bread', 'cheese', 'butter', 'salad'],
    hatedGifts: ['raw_meat', 'mud'],
    dialogueOptions: [
      { id: 'greeting', text: 'مرحباً يا شيف!', textEn: 'Hello, chef!' },
      { id: 'recipes', text: 'هل يمكنك تعليمي وصفة؟', textEn: 'Can you teach me a recipe?' },
      { id: 'special_dish', text: 'هل لديك طبق خاص اليوم؟', textEn: 'Do you have a special dish today?' }
    ],
    dialogues: {
      greeting: [
        { response: 'أهلاً! المطبخ مليء بالروائح اللذيذة اليوم', responseEn: 'Hello! The kitchen is full of delicious smells today' },
        { response: 'الطبخ فن يحتاج صبر وممارسة', responseEn: 'Cooking is an art that needs patience and practice' },
        { response: 'هل تريد أن تأكل شيئاً لذيذاً؟', responseEn: 'Do you want to eat something delicious?' }
      ],
      recipes: [
        { response: 'السر هو استخدام مكونات طازجة فقط', responseEn: 'The secret is using only fresh ingredients' },
        { response: 'تعلم صنع العجينة أولاً، ثم كل شيء سهل', responseEn: 'Learn to make dough first, then everything is easy' },
        { response: 'أحب أن أشارك أسراري مع المزارعين', responseEn: 'I love sharing my secrets with farmers' }
      ],
      special_dish: [
        { response: 'اليوم عندي حساء خضار خاص بالمزرعة', responseEn: "Today I have a special farm vegetable soup" },
        { response: 'لدي فطيرة تفاح بمكوناتك المزرعة', responseEn: "I have an apple pie with your farm's ingredients" },
        { response: 'جرب سلطة الصيف الطازجة!', responseEn: 'Try the fresh summer salad!' }
      ]
    }
  }
};

// ============================================================
// 📋 بيانات المهام اليومية
// ============================================================
GAME.NPC_DAILY_QUESTS = {
  mayor_town_clean: {
    npcId: 'mayor',
    title: 'تنظيف القرية', titleEn: 'Clean the Village',
    description: 'اجمع 10 قمامة من شوارع القرية', descriptionEn: 'Collect 10 trash from village streets',
    icon: '🧹',
    requirements: { trash: 10 },
    rewards: { gold: 200, xp: 50, friendship: 10 },
    timeLimit: 24, // ساعات
    repeatable: true
  },
  mayor_harvest: {
    npcId: 'mayor',
    title: 'جمع المحاصيل', titleEn: 'Collect Harvest',
    description: 'أحضر 5 منتجات زراعية متنوعة', descriptionEn: 'Bring 5 different farm products',
    icon: '🌾',
    requirements: { any_farm_product: 5 },
    rewards: { gold: 350, xp: 75, friendship: 15 },
    timeLimit: 48,
    repeatable: true
  },
  shopkeeper_delivery: {
    npcId: 'shopkeeper',
    title: 'توصيل طلب', titleEn: 'Deliver Order',
    description: 'سَلِّم 3 خضروات للشيف', descriptionEn: 'Deliver 3 vegetables to the chef',
    icon: '📦',
    requirements: { vegetable: 3 },
    rewards: { gold: 150, xp: 40, friendship: 8 },
    timeLimit: 12,
    repeatable: true
  },
  shopkeeper_rare_find: {
    npcId: 'shopkeeper',
    title: 'البحث عن نادر', titleEn: 'Rare Find',
    description: 'أحضر فاكهة نادرة من الغابة', descriptionEn: 'Bring a rare fruit from the forest',
    icon: '🔍',
    requirements: { rare_fruit: 1 },
    rewards: { gold: 500, xp: 100, friendship: 20 },
    timeLimit: 36,
    repeatable: false
  },
  farmer_weeding: {
    npcId: 'farmer',
    title: 'إزالة الأعشاب', titleEn: 'Remove Weeds',
    description: 'ازرع 3 محاصيل ناضجة', descriptionEn: 'Harvest 3 mature crops',
    icon: '🌱',
    requirements: { harvest: 3 },
    rewards: { gold: 180, xp: 45, friendship: 10 },
    timeLimit: 24,
    repeatable: true
  },
  farmer_fertilize: {
    npcId: 'farmer',
    title: 'تسوية الأراضي', titleEn: 'Prepare Land',
    description: 'حرث 5 قطع أرض', descriptionEn: 'Plow 5 land plots',
    icon: '🚜',
    requirements: { plow: 5 },
    rewards: { gold: 120, xp: 30, friendship: 8 },
    timeLimit: 12,
    repeatable: true
  },
  blacksmith_repair: {
    npcId: 'blacksmith',
    title: 'إصلاح أدوات', titleEn: 'Repair Tools',
    description: 'أحضر 3 قضبان حديد للحداد', descriptionEn: 'Bring 3 iron bars to the blacksmith',
    icon: '⚒️',
    requirements: { iron_bar: 3 },
    rewards: { gold: 250, xp: 60, friendship: 12 },
    timeLimit: 24,
    repeatable: true
  },
  blacksmith_upgrade: {
    npcId: 'blacksmith',
    title: 'ترقية الأدوات', titleEn: 'Upgrade Tools',
    description: 'أحضر 5 قضبان فضة لترقية أدواتك', descriptionEn: 'Bring 5 silver bars to upgrade tools',
    icon: '⚡',
    requirements: { silver_bar: 5 },
    rewards: { gold: 400, xp: 90, friendship: 18 },
    timeLimit: 48,
    repeatable: false
  },
  chef_cooking: {
    npcId: 'chef',
    title: 'مسابقة الطبخ', titleEn: 'Cooking Contest',
    description: 'أحضر 2 طبق مطبوخ مختلف', descriptionEn: 'Bring 2 different cooked dishes',
    icon: '🍳',
    requirements: { cooked_dish: 2 },
    rewards: { gold: 300, xp: 80, friendship: 15 },
    timeLimit: 24,
    repeatable: true
  },
  chef_ingredients: {
    npcId: 'chef',
    title: 'جمع المكونات', titleEn: 'Gather Ingredients',
    description: 'أحضر 5 خضروات طازجة', descriptionEn: 'Bring 5 fresh vegetables',
    icon: '🥕',
    requirements: { fresh_vegetable: 5 },
    rewards: { gold: 200, xp: 55, friendship: 10 },
    timeLimit: 12,
    repeatable: true
  }
};

// ============================================================
// 🎁 بيانات الهدايا
// ============================================================
GAME.NPC_GIFTS = {
  // فئة الهدايا
  categories: {
    food: { name: 'طعام', nameEn: 'Food', icon: '🍽️' },
    flower: { name: 'زهور', nameEn: 'Flowers', icon: '🌸' },
    mineral: { name: 'معادن', nameEn: 'Minerals', icon: '💎' },
    crafted: { name: 'مصنوعات', nameEn: 'Crafted', icon: '🔧' }
  },
  // مكافآت الصداقه حسب فئة الهدية
  rewards: {
    loved: 25,   // يحب (+25 صداقة)
    liked: 10,   // يعجبه (+10 صداقة)
    neutral: 0,  // محايد (لا يتغير)
    disliked: -5, // لا يعجبه (-5 صداقة)
    hated: -15    // يكره (-15 صداقة)
  },
  // عدد الهدايا المسموح بها يومياً
  dailyLimit: 2,
  // وصفات الهدايا المفضلة
  favoriteCombos: {
    mayor: ['wine', 'cheese', 'pumpkin_pie'],
    shopkeeper: ['wine', 'jam', 'juice'],
    farmer: ['wine', 'jam', 'sunflower_oil'],
    blacksmith: ['gold_bar', 'diamond', 'wine'],
    chef: ['wine', 'jam', 'pumpkin_pie']
  }
};

// ============================================================
// 👥 نظام الشخصيات (NPCs System)
// ============================================================
GAME.NPCsSystem = {
  npcs: {},           // جميع NPCs
  friendships: {},    // مستويات الصداقه مع كل NPC
  activeQuests: [],   // المهام النشطة
  completedQuests: [], // المهام المكتملة
  giftsGiven: {},     // الهدايا المعطاة (للتتبع اليومي)
  dailyQuests: {},    // المهام اليومية المتاحة
  scene: null,        // مشهد Three.js
  npcMeshMap: new Map(), // خريطة meshes الـ NPCs
  currentPlayerPos: null, // موقع اللاعب الحالي
  currentHour: 0,     // الساعة الحالية في اللعبة
  timeSystem: null,   // مرجع لنظام الوقت

  // تهيئة النظام
  init: function(scene, timeSystem) {
    this.scene = scene;
    this.timeSystem = timeSystem || null;
    this.npcs = {};
    this.friendships = {};
    this.activeQuests = [];
    this.completedQuests = [];
    this.giftsGiven = {};
    this.dailyQuests = {};
    this.npcMeshMap.clear();
    this.currentHour = 6; // البداية الساعة 6 صباحاً

    // إنشاء جميع NPCs
    for (var npcId in GAME.NPC_DATA) {
      var npcData = GAME.NPC_DATA[npcId];
      this.npcs[npcId] = {
        id: npcId,
        data: npcData,
        position: { ...npcData.homePosition },
        currentAction: 'idle',
        mesh: null,
        isActive: true,
        lastDialogueTime: 0,
        questsGivenToday: 0,
        dailyGiftsReceived: 0
      };
      this.friendships[npcId] = 50; // صداقه متوسطة للبداية
      this.giftsGiven[npcId] = [];
      this.dailyQuests[npcId] = [];
    }

    // إنشاء meshes الـ NPCs
    this.createNPCMeshes();

    console.log('[NPCsSystem] ✅ Initialized with ' + Object.keys(GAME.NPC_DATA).length + ' NPCs');
  },

  // ============================================================
  // 🎨 إنشاء meshes الـ NPCs
  // ============================================================
  createNPCMeshes: function() {
    if (!this.scene) return;

    for (var npcId in this.npcs) {
      var npc = this.npcs[npcId];
      var data = npc.data;

      // إنشاء المجموعة الأساسية
      var group = new THREE.Group();
      group.name = 'npc_' + npcId;

      // الجسم (الجسم الرئيسي)
      var bodyGeometry = new THREE.BoxGeometry(
        data.size.width,
        data.size.height * 0.6,
        data.size.depth
      );
      var bodyMaterial = new THREE.MeshLambertMaterial({ color: data.shirtColor });
      var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = data.size.height * 0.3 + 0.1;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      // الرأس
      var headGeometry = new THREE.SphereGeometry(data.size.width * 0.35, 8, 8);
      var headMaterial = new THREE.MeshLambertMaterial({ color: data.skinColor });
      var head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.y = data.size.height * 0.6 + 0.1;
      head.castShadow = true;
      group.add(head);

      // العيون
      var eyeGeometry = new THREE.SphereGeometry(0.03, 4, 4);
      var eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      var leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-0.08, data.size.height * 0.65 + 0.1, 0.1);
      group.add(leftEye);
      var rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      rightEye.position.set(0.08, data.size.height * 0.65 + 0.1, 0.1);
      group.add(rightEye);

      // القبعة (مخصصة لكل NPC)
      if (npcId === 'chef') {
        // قبعة الشيف البيضاء
        var hatGeometry = new THREE.CylinderGeometry(0.08, 0.18, 0.25, 8);
        var hatMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        var hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = data.size.height * 0.85 + 0.1;
        group.add(hat);
      } else if (npcId === 'mayor') {
        // قبعة البلدية
        var topHatGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8);
        var topHatMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a2e });
        var topHat = new THREE.Mesh(topHatGeometry, topHatMaterial);
        topHat.position.y = data.size.height * 0.8 + 0.1;
        group.add(topHat);
      } else if (npcId === 'farmer') {
        // قبعة المزارع
        var strawHatGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.1, 8);
        var strawHatMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
        var strawHat = new THREE.Mesh(strawHatGeometry, strawHatMaterial);
        strawHat.position.y = data.size.height * 0.78 + 0.1;
        group.add(strawHat);
      }

      // الساقان
      var legGeometry = new THREE.BoxGeometry(data.size.width * 0.35, data.size.height * 0.35, data.size.depth * 0.35);
      var legMaterial = new THREE.MeshLambertMaterial({ color: data.pantsColor });
      var leftLeg = new THREE.Mesh(legGeometry, legMaterial);
      leftLeg.position.set(-data.size.width * 0.2, 0.1, 0);
      leftLeg.castShadow = true;
      group.add(leftLeg);
      var rightLeg = new THREE.Mesh(legGeometry, legMaterial);
      rightLeg.position.set(data.size.width * 0.2, 0.1, 0);
      rightLeg.castShadow = true;
      group.add(rightLeg);

      // تحديد موقع الـ NPC
      group.position.set(npc.position.x, npc.position.y, npc.position.z);
      group.userData = { npcId: npcId, type: 'npc' };

      // إضافة اسم الـ NPC فوق الرأس
      this.createNPCLabel(group, data.nameAr, data.size.height + 0.5);

      // إضافة للمشهد
      this.scene.add(group);
      npc.mesh = group;
      this.npcMeshMap.set(npcId, group);
    }
  },

  // إنشاء تسمية فوق الـ NPC
  createNPCLabel: function(parent, text, yOffset) {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    var ctx = canvas.getContext('2d');

    // خلفية شفافة
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.roundRect(0, 0, 256, 64, 8);
    ctx.fill();

    // النص
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    var texture = new THREE.CanvasTexture(canvas);
    var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.5, 0.4, 1);
    sprite.position.y = yOffset;
    parent.add(sprite);
  },

  // ============================================================
  // ⏰ تحديث حركة NPCs حسب الوقت
  // ============================================================
  updateNPCsSchedule: function(gameHour) {
    this.currentHour = gameHour;

    for (var npcId in this.npcs) {
      var npc = this.npcs[npcId];
      if (!npc.isActive) continue;

      var schedule = npc.data.schedule;
      var targetPos = null;
      var targetAction = 'idle';

      // إيجاد أقرب موعد في الجدول
      var lastTime = 0;
      for (var timeStr in schedule) {
        var time = parseInt(timeStr);
        if (gameHour >= time && time > lastTime) {
          lastTime = time;
          targetPos = schedule[timeStr];
        }
      }

      if (targetPos) {
        targetAction = targetPos.action;

        // تحريك الـ NPC نحو الموقع المستهدف
        var dx = targetPos.x - npc.position.x;
        var dz = targetPos.z - npc.position.z;
        var distance = Math.sqrt(dx * dx + dz * dz);

        if (distance > 0.5) {
          // التحرك نحو الموقع
          var speed = 2.0; // سرعة الحركة
          npc.position.x += (dx / distance) * speed * 0.016;
          npc.position.z += (dz / distance) * speed * 0.016;

          // تحديث الموقع الفعلي
          if (npc.mesh) {
            npc.mesh.position.x = npc.position.x;
            npc.mesh.position.z = npc.position.z;

            // تدوير الـ NPC في اتجاه الحركة
            npc.mesh.rotation.y = Math.atan2(dx, dz);
          }
        } else {
          npc.position.x = targetPos.x;
          npc.position.z = targetPos.z;
          if (npc.mesh) {
            npc.mesh.position.x = npc.position.x;
            npc.mesh.position.z = npc.position.z;
          }
        }
      }

      npc.currentAction = targetAction;
    }
  },

  // ============================================================
  // 💬 نظام الحوار
  // ============================================================

  // بدء محادثة مع NPC
  startDialogue: function(npcId) {
    var npc = this.npcs[npcId];
    if (!npc) {
      console.error('[NPCsSystem] NPC not found:', npcId);
      return null;
    }

    var data = npc.data;
    var dialogueOptions = data.dialogueOptions.map(function(option) {
      return {
        id: option.id,
        text: option.text,
        textEn: option.textEn
      };
    });

    return {
      npcId: npcId,
      npcName: data.nameAr,
      npcRole: data.roleAr,
      npcIcon: data.icon,
      friendship: this.friendships[npcId],
      options: dialogueOptions,
      currentHour: this.currentHour
    };
  },

  // الحصول على رد NPC بناءً على الخيار المختار
  getDialogueResponse: function(npcId, optionId) {
    var npc = this.npcs[npcId];
    if (!npc) return null;

    var dialogues = npc.data.dialogues[optionId];
    if (!dialogues || dialogues.length === 0) return null;

    // اختيار رد عشوائي
    var randomIndex = Math.floor(Math.random() * dialogues.length);
    var selectedDialogue = dialogues[randomIndex];

    return {
      npcId: npcId,
      npcName: npc.data.nameAr,
      response: selectedDialogue.response,
      responseEn: selectedDialogue.responseEn,
      friendship: this.friendships[npcId]
    };
  },

  // ============================================================
  // 💝 نظام الصداقه
  // ============================================================

  // زيادة الصداقه
  increaseFriendship: function(npcId, amount) {
    if (!this.friendships.hasOwnProperty(npcId)) return false;

    var oldValue = this.friendships[npcId];
    this.friendships[npcId] = Math.min(100, this.friendships[npcId] + amount);

    console.log('[NPCsSystem] 💝 ' + GAME.NPC_DATA[npcId].nameAr + ': ' + oldValue + ' → ' + this.friendships[npcId]);
    return true;
  },

  // تقليل الصداقه
  decreaseFriendship: function(npcId, amount) {
    if (!this.friendships.hasOwnProperty(npcId)) return false;

    var oldValue = this.friendships[npcId];
    this.friendships[npcId] = Math.max(0, this.friendships[npcId] - amount);

    console.log('[NPCsSystem] 💔 ' + GAME.NPC_DATA[npcId].nameAr + ': ' + oldValue + ' → ' + this.friendships[npcId]);
    return true;
  },

  // الحصول على مستوى الصداقه
  getFriendshipLevel: function(npcId) {
    var friendship = this.friendships[npcId] || 0;
    if (friendship >= 80) return { level: 'Best Friend', levelAr: 'صديق مقرّب', stars: '⭐⭐⭐', color: 0xFFD700 };
    if (friendship >= 60) return { level: 'Good Friend', levelAr: 'صديق جيد', stars: '⭐⭐', color: 0xC0C0C0 };
    if (friendship >= 40) return { level: 'Friend', levelAr: 'صديق', stars: '⭐', color: 0xCD7F32 };
    if (friendship >= 20) return { level: 'Acquaintance', levelAr: 'معارف', stars: '', color: 0x808080 };
    return { level: 'Stranger', levelAr: 'غريب', stars: '', color: 0xFF0000 };
  },

  // ============================================================
  // 🎁 نظام الهدايا
  // ============================================================

  // إعطاء هدية لـ NPC
  giveGift: function(npcId, giftItemId) {
    var npc = this.npcs[npcId];
    if (!npc) return { success: false, message: 'NPC غير موجود' };

    // التحقق من حد الهدايا اليومي
    if (npc.dailyGiftsReceived >= GAME.NPC_GIFTS.dailyLimit) {
      return { success: false, message: 'لقد أعطيت هدايا كثيرة اليوم! حاول غداً' };
    }

    // تحديد رد الفعل بناءً على الهدية
    var reaction = this.getGiftReaction(npcId, giftItemId);

    // تحديث الصداقه
    var friendshipChange = GAME.NPC_GIFTS.rewards[reaction.type] || 0;
    if (friendshipChange > 0) {
      this.increaseFriendship(npcId, friendshipChange);
    } else if (friendshipChange < 0) {
      this.decreaseFriendship(npcId, Math.abs(friendshipChange));
    }

    // تحديث عداد الهدايا
    npc.dailyGiftsReceived++;

    // تسجيل الهدية
    if (!this.giftsGiven[npcId]) this.giftsGiven[npcId] = [];
    this.giftsGiven[npcId].push({
      itemId: giftItemId,
      reaction: reaction.type,
      timestamp: Date.now()
    });

    return {
      success: true,
      reaction: reaction.type,
      reactionText: reaction.text,
      reactionTextEn: reaction.textEn,
      friendshipChange: friendshipChange,
      newFriendship: this.friendships[npcId],
      friendshipLevel: this.getFriendshipLevel(npcId)
    };
  },

  // تحديد رد فعل الـ NPC على الهدية
  getGiftReaction: function(npcId, giftItemId) {
    var npcData = GAME.NPC_DATA[npcId];
    if (!npcData) return { type: 'neutral', text: 'شكراً', textEn: 'Thanks' };

    if (npcData.lovedGifts.includes(giftItemId)) {
      return { type: 'loved', text: 'أحببت هذه الهدية كثيراً! ❤️', textEn: 'I love this gift so much! ❤️' };
    }
    if (npcData.likedGifts.includes(giftItemId)) {
      return { type: 'liked', text: 'إلى هذا جيد، شكراً! 😊', textEn: 'This is nice, thanks! 😊' };
    }
    if (npcData.hatedGifts.includes(giftItemId)) {
      return { type: 'hated', text: 'لا أحب هذا أبداً! 😠', textEn: "I don't like this at all! 😠" };
    }
    if (npcData.dislikedGifts && npcData.dislikedGifts.includes(giftItemId)) {
      return { type: 'disliked', text: 'هذا ليس مفضلتي...', textEn: "This isn't my favorite..." };
    }

    return { type: 'neutral', text: 'شكراً لك', textEn: 'Thank you' };
  },

  // ============================================================
  // 📋 نظام المهام اليومية
  // ============================================================

  // توليد مهام يومية جديدة
  generateDailyQuests: function() {
    this.dailyQuests = {};

    for (var npcId in GAME.NPC_DATA) {
      var npcQuests = [];
      var questKeys = Object.keys(GAME.NPC_DAILY_QUESTS).filter(function(key) {
        return GAME.NPC_DAILY_QUESTS[key].npcId === npcId;
      });

      // اختيار مهمة واحدة لكل NPC (أو حسب الصداقه)
      if (questKeys.length > 0) {
        var randomIndex = Math.floor(Math.random() * questKeys.length);
        var selectedQuest = GAME.NPC_DAILY_QUESTS[questKeys[randomIndex]];

        npcQuests.push({
          id: questKeys[randomIndex],
          ...selectedQuest,
          startTime: Date.now(),
          completed: false,
          expired: false
        });
      }

      this.dailyQuests[npcId] = npcQuests;
    }

    console.log('[NPCsSystem] 📋 Daily quests generated for all NPCs');
    return this.dailyQuests;
  },

  // قبول مهمة
  acceptQuest: function(npcId, questId) {
    var questData = GAME.NPC_DAILY_QUESTS[questId];
    if (!questData) return { success: false, message: 'المهمة غير موجودة' };

    // التحقق من عدم وجود المهمة مسبقاً
    var alreadyAccepted = this.activeQuests.find(function(q) {
      return q.id === questId;
    });
    if (alreadyAccepted) return { success: false, message: 'لقد قبلت هذه المهمة بالفعل' };

    // التحقق من الحد اليومي
    var npc = this.npcs[npcId];
    if (npc && npc.questsGivenToday >= 3) {
      return { success: false, message: 'لقد أعطيتك 3 مهام اليوم بالفعل' };
    }

    var activeQuest = {
      ...questData,
      id: questId,
      startTime: Date.now(),
      progress: {},
      completed: false,
      expired: false
    };

    this.activeQuests.push(activeQuest);
    if (npc) npc.questsGivenToday++;

    console.log('[NPCsSystem] 📋 Quest accepted: ' + questData.title);
    return { success: true, quest: activeQuest };
  },

  // تحديث تقدم المهمة
  updateQuestProgress: function(questId, itemId, amount) {
    var quest = this.activeQuests.find(function(q) {
      return q.id === questId && !q.completed && !q.expired;
    });
    if (!quest) return false;

    if (!quest.progress[itemId]) {
      quest.progress[itemId] = 0;
    }
    quest.progress[itemId] += amount;

    // التحقق من اكتمال المهمة
    var requirements = quest.requirements;
    var completed = true;
    for (var reqItem in requirements) {
      if ((quest.progress[reqItem] || 0) < requirements[reqItem]) {
        completed = false;
        break;
      }
    }

    if (completed) {
      this.completeQuest(quest.id);
    }

    return {
      progress: quest.progress,
      completed: completed,
      requirements: requirements
    };
  },

  // إكمال المهمة
  completeQuest: function(questId) {
    var questIndex = this.activeQuests.findIndex(function(q) {
      return q.id === questId;
    });
    if (questIndex === -1) return false;

    var quest = this.activeQuests[questIndex];
    quest.completed = true;

    // منح المكافآت
    var rewards = quest.rewards;
    if (rewards.gold && GAME.EconomySystem) {
      GAME.EconomySystem.addGold(rewards.gold);
    }
    if (rewards.friendship) {
      this.increaseFriendship(quest.npcId, rewards.friendship);
    }

    // نقل إلى المهام المكتملة
    this.completedQuests.push(quest);
    this.activeQuests.splice(questIndex, 1);

    console.log('[NPCsSystem] ✅ Quest completed: ' + quest.title);
    return true;
  },

  // التحقق من انتهاء المهمة
  checkQuestExpiry: function() {
    var currentTime = Date.now();
    var expiredQuests = [];

    this.activeQuests = this.activeQuests.filter(function(quest) {
      var elapsed = (currentTime - quest.startTime) / (1000 * 60 * 60); // ساعات
      if (elapsed > quest.timeLimit) {
        quest.expired = true;
        expiredQuests.push(quest);
        return false;
      }
      return true;
    });

    return expiredQuests;
  },

  // ============================================================
  // 🔄 تحديث النظام
  // ============================================================
  update: function(deltaTime) {
    // تحديث جدول حركة NPCs
    this.updateNPCsSchedule(this.currentHour);

    // التحقق من انتهاء المهام
    this.checkQuestExpiry();
  },

  // تحديث الساعة الحالية
  setCurrentHour: function(hour) {
    this.currentHour = hour;
    this.updateNPCsSchedule(hour);
  },

  // ============================================================
  // 💾 حفظ وتحميل الحالة
  // ============================================================

  // حفظ حالة النظام
  save: function() {
    var saveData = {
      friendships: this.friendships,
      giftsGiven: this.giftsGiven,
      activeQuests: this.activeQuests,
      completedQuests: this.completedQuests,
      dailyQuests: this.dailyQuests,
      npcPositions: {}
    };

    // حفظ مواقع NPCs
    for (var npcId in this.npcs) {
      saveData.npcPositions[npcId] = {
        x: this.npcs[npcId].position.x,
        y: this.npcs[npcId].position.y,
        z: this.npcs[npcId].position.z,
        action: this.npcs[npcId].currentAction
      };
    }

    return saveData;
  },

  // تحميل حالة النظام
  load: function(saveData) {
    if (!saveData) return false;

    if (saveData.friendships) {
      this.friendships = saveData.friendships;
    }
    if (saveData.giftsGiven) {
      this.giftsGiven = saveData.giftsGiven;
    }
    if (saveData.activeQuests) {
      this.activeQuests = saveData.activeQuests;
    }
    if (saveData.completedQuests) {
      this.completedQuests = saveData.completedQuests;
    }
    if (saveData.dailyQuests) {
      this.dailyQuests = saveData.dailyQuests;
    }

    // تحميل مواقع NPCs
    if (saveData.npcPositions) {
      for (var npcId in saveData.npcPositions) {
        if (this.npcs[npcId]) {
          var pos = saveData.npcPositions[npcId];
          this.npcs[npcId].position = { x: pos.x, y: pos.y, z: pos.z };
          this.npcs[npcId].currentAction = pos.action;

          // تحديث meshes
          if (this.npcs[npcId].mesh) {
            this.npcs[npcId].mesh.position.set(pos.x, pos.y, pos.z);
          }
        }
      }
    }

    console.log('[NPCsSystem] 💾 State loaded successfully');
    return true;
  },

  // ============================================================
  // 🔍 دوال مساعدة
  // ============================================================

  // الحصول على NPC بالقرب من موقع
  getNearestNPC: function(x, z, maxDistance) {
    maxDistance = maxDistance || 3.0;
    var nearest = null;
    var nearestDist = maxDistance;

    for (var npcId in this.npcs) {
      var npc = this.npcs[npcId];
      var dx = npc.position.x - x;
      var dz = npc.position.z - z;
      var distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < nearestDist) {
        nearestDist = distance;
        nearest = npc;
      }
    }

    return nearest;
  },

  // الحصول على جميع NPCs النشطين
  getActiveNPCs: function() {
    var active = [];
    for (var npcId in this.npcs) {
      if (this.npcs[npcId].isActive) {
        active.push(this.npcs[npcId]);
      }
    }
    return active;
  },

  // الحصول على إحصائيات NPCs
  getStats: function() {
    var stats = {
      totalNPCs: Object.keys(this.npcs).length,
      activeNPCs: 0,
      friendships: {},
      activeQuests: this.activeQuests.length,
      completedQuests: this.completedQuests.length
    };

    for (var npcId in this.npcs) {
      if (this.npcs[npcId].isActive) stats.activeNPCs++;

      stats.friendships[npcId] = {
        value: this.friendships[npcId],
        level: this.getFriendshipLevel(npcId)
      };
    }

    return stats;
  }
};

// تصدير النظام للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME.NPCsSystem;
}
