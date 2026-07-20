/**
 * AchievementSystem.js - نظام الإنجازات المتقدم
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - 25+ إنجاز على 5 فئات (زراعة، حيوانات، اقتصاد، اجتماعي، استكشاف)
 * - شارات ونقاط لكل إنجاز
 * - تتبع التقدم والإحصائيات
 * - مكافآت فورية (مال + XP)
 * - حفظ وتحميل من localStorage
 * - تكامل مع الأنظمة الأخرى (EconomySystem, FarmingSystem, NPCsSystem)
 */

var GAME = GAME || {};

GAME.AchievementSystem = {
  // ============================================================
  // 🏆 الإنجازات (25 إنجاز على 5 فئات)
  // ============================================================
  achievements: {
    // ════════════════════════════════════════
    // 🌾 فئة الزراعة (Farming) — 6 إنجازات
    // ════════════════════════════════════════
    first_harvest: {
      name: 'First Harvest',
      nameAr: 'أول حصاد',
      description: 'Harvest your first crop',
      descriptionAr: 'احصد محصولك الأول',
      category: 'farming',
      icon: '🌾',
      badge: 'bronze',
      rewards: { money: 50, xp: 25 },
      unlocked: false
    },
    green_thumb: {
      name: 'Green Thumb',
      nameAr: 'إبهام أخضر',
      description: 'Harvest 100 crops',
      descriptionAr: 'احصد 100 محصول',
      category: 'farming',
      icon: '🌱',
      badge: 'silver',
      rewards: { money: 200, xp: 100 },
      unlocked: false
    },
    crop_master: {
      name: 'Crop Master',
      nameAr: 'سيد المحاصيل',
      description: 'Grow all 18 crop types',
      descriptionAr: 'ازرع جميع أنواع المحاصيل الـ 18',
      category: 'farming',
      icon: '👨‍🌾',
      badge: 'gold',
      rewards: { money: 1000, xp: 500 },
      unlocked: false
    },
    water_wizard: {
      name: 'Water Wizard',
      nameAr: 'ساحر الماء',
      description: 'Water crops 500 times',
      descriptionAr: 'اسقِ المحاصيل 500 مرة',
      category: 'farming',
      icon: '💧',
      badge: 'silver',
      rewards: { money: 300, xp: 150 },
      unlocked: false
    },
    fertilizer_king: {
      name: 'Fertilizer King',
      nameAr: 'ملك الأسمدة',
      description: 'Use 100 fertilizers',
      descriptionAr: 'استخدم 100 سماد',
      category: 'farming',
      icon: '🧪',
      badge: 'gold',
      rewards: { money: 500, xp: 250 },
      unlocked: false
    },
    speed_farmer: {
      name: 'Speed Farmer',
      nameAr: 'المزارع السريع',
      description: 'Harvest 50 crops in one day',
      descriptionAr: 'احصد 50 محصولاً في يوم واحد',
      category: 'farming',
      icon: '⚡',
      badge: 'gold',
      rewards: { money: 800, xp: 400 },
      unlocked: false
    },

    // ════════════════════════════════════════
    // 🐄 فئة الحيوانات (Animals) — 5 إنجازات
    // ════════════════════════════════════════
    animal_friend: {
      name: 'Animal Friend',
      nameAr: 'صديق الحيوانات',
      description: 'Feed 50 animals',
      descriptionAr: 'أطعم 50 حيوان',
      category: 'animals',
      icon: '🐄',
      badge: 'bronze',
      rewards: { money: 150, xp: 75 },
      unlocked: false
    },
    animal_master: {
      name: 'Animal Master',
      nameAr: 'سيد الحيوانات',
      description: 'Collect 200 animal products',
      descriptionAr: 'اجمع 200 منتج حيواني',
      category: 'animals',
      icon: '🐔',
      badge: 'silver',
      rewards: { money: 400, xp: 200 },
      unlocked: false
    },
    zoo_owner: {
      name: 'Zoo Owner',
      nameAr: 'صاحب حديقة الحيوان',
      description: 'Own all 5 animal types',
      descriptionAr: 'امتلك جميع أنواع الحيوانات الـ 5',
      category: 'animals',
      icon: '🦁',
      badge: 'gold',
      rewards: { money: 600, xp: 300 },
      unlocked: false
    },
    truffle_hunter: {
      name: 'Truffle Hunter',
      nameAr: 'صياد الكمأة',
      description: 'Find 20 truffles',
      descriptionAr: 'ابحث عن 20 كمأة',
      category: 'animals',
      icon: '🍄',
      badge: 'silver',
      rewards: { money: 350, xp: 175 },
      unlocked: false
    },
    animal_whisperer: {
      name: 'Animal Whisperer',
      nameAr: 'هامس الحيوانات',
      description: 'Max happiness with 5 animals',
      descriptionAr: 'اجعل 5 حيوانات في أعلى سعادة',
      category: 'animals',
      icon: '💖',
      badge: 'gold',
      rewards: { money: 500, xp: 250 },
      unlocked: false
    },

    // ════════════════════════════════════════
    // 💰 فئة الاقتصاد (Economy) — 5 إنجازات
    // ════════════════════════════════════════
    first_sale: {
      name: 'First Sale',
      nameAr: 'أول بيع',
      description: 'Sell your first item',
      descriptionAr: 'بع أول منتج لك',
      category: 'economy',
      icon: '💰',
      badge: 'bronze',
      rewards: { money: 25, xp: 10 },
      unlocked: false
    },
    money_maker: {
      name: 'Money Maker',
      nameAr: 'صانع المال',
      description: 'Earn 10,000 money total',
      descriptionAr: 'اكسب 10,000 مال',
      category: 'economy',
      icon: '💵',
      badge: 'silver',
      rewards: { money: 500, xp: 250 },
      unlocked: false
    },
    tycoon: {
      name: 'Tycoon',
      nameAr: 'تايكون',
      description: 'Earn 100,000 money total',
      descriptionAr: 'اكسب 100,000 مال',
      category: 'economy',
      icon: '🏦',
      badge: 'gold',
      rewards: { money: 2000, xp: 1000 },
      unlocked: false
    },
    master_crafter: {
      name: 'Master Crafter',
      nameAr: 'الحرفي الأول',
      description: 'Craft 100 items',
      descriptionAr: 'اصنع 100 منتج',
      category: 'economy',
      icon: '🔨',
      badge: 'silver',
      rewards: { money: 400, xp: 200 },
      unlocked: false
    },
    bulk_seller: {
      name: 'Bulk Seller',
      nameAr: 'بائع بالجملة',
      description: 'Sell 500 items total',
      descriptionAr: 'بع 500 منتج',
      category: 'economy',
      icon: '📦',
      badge: 'gold',
      rewards: { money: 1500, xp: 750 },
      unlocked: false
    },

    // ════════════════════════════════════════
    // ❤️ فئة اجتماعية (Social) — 4 إنجازات
    // ════════════════════════════════════════
    people_person: {
      name: 'People Person',
      nameAr: 'إنسان اجتماعي',
      description: 'Reach friendship level 5 with 3 NPCs',
      descriptionAr: 'ارتقِ لمستوى صداقة 5 مع 3 أشخاص',
      category: 'social',
      icon: '❤️',
      badge: 'silver',
      rewards: { money: 300, xp: 150 },
      unlocked: false
    },
    social_butterfly: {
      name: 'Social Butterfly',
      nameAr: 'فراشة اجتماعية',
      description: 'Talk to all NPCs in one day',
      descriptionAr: 'تحدث مع جميع NPCs في يوم واحد',
      category: 'social',
      icon: '💬',
      badge: 'bronze',
      rewards: { money: 100, xp: 50 },
      unlocked: false
    },
    gift_giver: {
      name: 'Gift Giver',
      nameAr: 'مانح الهدايا',
      description: 'Give 50 gifts to NPCs',
      descriptionAr: 'أهدي 50 هدية لـ NPCs',
      category: 'social',
      icon: '🎁',
      badge: 'silver',
      rewards: { money: 250, xp: 125 },
      unlocked: false
    },
    everyone_loves_you: {
      name: 'Everyone Loves You',
      nameAr: 'الجميع يحبك',
      description: 'Max friendship with all NPCs',
      descriptionAr: 'ارتقِ لأعلى صداقة مع جميع NPCs',
      category: 'social',
      icon: '🌟',
      badge: 'gold',
      rewards: { money: 1000, xp: 500 },
      unlocked: false
    },

    // ════════════════════════════════════════
    // 🗺️ فئة الاستكشاف (Exploration) — 5 إنجازات
    // ════════════════════════════════════════
    explorer: {
      name: 'Explorer',
      nameAr: 'مستكشف',
      description: 'Visit all 5 zones',
      descriptionAr: 'زُر جميع المناطق الـ 5',
      category: 'exploration',
      icon: '🗺️',
      badge: 'bronze',
      rewards: { money: 200, xp: 100 },
      unlocked: false
    },
    treasure_hunter: {
      name: 'Treasure Hunter',
      nameAr: 'صياد الكنوز',
      description: 'Find 10 hidden items',
      descriptionAr: 'ابحث عن 10 عناصر مخفية',
      category: 'exploration',
      icon: '💎',
      badge: 'silver',
      rewards: { money: 300, xp: 150 },
      unlocked: false
    },
    seasoned_survivor: {
      name: 'Seasoned Survivor',
      nameAr: 'ناجٍ مخضرم',
      description: 'Survive 30 in-game days',
      descriptionAr: 'اعيش 30 يوماً في اللعبة',
      category: 'exploration',
      icon: '☀️',
      badge: 'silver',
      rewards: { money: 350, xp: 175 },
      unlocked: false
    },
    level_master: {
      name: 'Level Master',
      nameAr: 'سيد المستويات',
      description: 'Reach level 15',
      descriptionAr: 'ارتقِ للمستوى 15',
      category: 'exploration',
      icon: '⭐',
      badge: 'gold',
      rewards: { money: 800, xp: 400 },
      unlocked: false
    },
    night_owl: {
      name: 'Night Owl',
      nameAr: 'بومة الليل',
      description: 'Play through 10 full day-night cycles',
      descriptionAr: 'العب عبر 10 دورات نهار وليل كاملة',
      category: 'exploration',
      icon: '🦉',
      badge: 'bronze',
      rewards: { money: 150, xp: 75 },
      unlocked: false
    }
  },

  // ============================================================
  // 📊 الإحصائيات
  // ============================================================
  stats: {
    cropsHarvested: 0,
    animalsFed: 0,
    moneyEarned: 0,
    itemsSold: 0,
    npcsMet: 0,
    zonesVisited: 0,
    itemsFound: 0,
    cropsPlanted: 0,
    itemsWatered: 0,
    fertilizersUsed: 0,
    itemsCrafted: 0,
    animalsOwned: 0,
    giftsGiven: 0,
    npcTalkCount: {},
    cropsGrown: {},      // tracks unique crop types grown
    dayNightCycles: 0
  },

  // ============================================================
  // 🏷️ الفئات
  // ============================================================
  categories: {
    farming: { name: 'Farming', nameAr: 'الزراعة', icon: '🌾', color: '#4CAF50' },
    animals: { name: 'Animals', nameAr: 'الحيوانات', icon: '🐄', color: '#FF9800' },
    economy: { name: 'Economy', nameAr: 'الاقتصاد', icon: '💰', color: '#FFD700' },
    social: { name: 'Social', nameAr: 'الاجتماعي', icon: '❤️', color: '#E91E63' },
    exploration: { name: 'Exploration', nameAr: 'الاستكشاف', icon: '🗺️', color: '#2196F3' }
  },

  // ============================================================
  // ⚡ التهيئة
  // ============================================================
  init: function(game) {
    this.game = game;
    this.loadProgress();
    console.log('[AchievementSystem] 🏆 Initialized — ' + this.getProgress().unlocked + '/' + this.getProgress().total + ' unlocked');
  },

  // ============================================================
  // 🔍 فحص الإنجازات
  // ============================================================
  checkAchievements: function() {
    var newlyUnlocked = [];
    for (var id in this.achievements) {
      var achievement = this.achievements[id];
      if (achievement.unlocked) continue;
      if (this.checkCondition(id, achievement)) {
        this.unlock(id);
        newlyUnlocked.push(achievement);
      }
    }
    return newlyUnlocked;
  },

  /**
   * فحص شرط إنجاز معين
   * @param {string} id - معرف الإنجاز
   * @param {Object} achievement - بيانات الإنجاز
   * @returns {boolean} هل تم تحقق الشرط؟
   */
  checkCondition: function(id, achievement) {
    var s = this.stats;
    switch (id) {
      // ═══ الزراعة ═══
      case 'first_harvest':     return s.cropsHarvested >= 1;
      case 'green_thumb':       return s.cropsHarvested >= 100;
      case 'crop_master':       return this._getUniqueCropsGrown() >= 18;
      case 'water_wizard':      return s.itemsWatered >= 500;
      case 'fertilizer_king':   return s.fertilizersUsed >= 100;
      case 'speed_farmer':      return s._cropsHarvestedToday >= 50;

      // ═══ الحيوانات ═══
      case 'animal_friend':       return s.animalsFed >= 50;
      case 'animal_master':       return s.animalProductsCollected >= 200;
      case 'zoo_owner':           return s.animalsOwned >= 5;
      case 'truffle_hunter':      return s.trufflesFound >= 20;
      case 'animal_whisperer':    return s.maxHappinessAnimals >= 5;

      // ═══ الاقتصاد ═══
      case 'first_sale':        return s.itemsSold >= 1;
      case 'money_maker':       return s.moneyEarned >= 10000;
      case 'tycoon':            return s.moneyEarned >= 100000;
      case 'master_crafter':    return s.itemsCrafted >= 100;
      case 'bulk_seller':       return s.itemsSold >= 500;

      // ═══ اجتماعي ═══
      case 'people_person':       return this._getMaxFriendshipNpcCount(5) >= 3;
      case 'social_butterfly':    return this._talkedToAllNpcsToday();
      case 'gift_giver':          return s.giftsGiven >= 50;
      case 'everyone_loves_you':  return this._getMaxFriendshipNpcCount(10) >= this._getTotalNpcCount();

      // ═══ استكشاف ═══
      case 'explorer':             return s.zonesVisited >= 5;
      case 'treasure_hunter':      return s.itemsFound >= 10;
      case 'seasoned_survivor':    return (this.game && this.game.state && this.game.state.day >= 30) || s.dayNightCycles >= 30;
      case 'level_master':         return (this.game && this.game.state && this.game.state.level >= 15);
      case 'night_owl':            return s.dayNightCycles >= 10;

      default: return false;
    }
  },

  // ============================================================
  // 🔓 فتح إنجاز
  // ============================================================
  /**
   * فتح/إطلاق إنجاز معين
   * @param {string} id - معرف الإنجاز
   */
  unlock: function(id) {
    var achievement = this.achievements[id];
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();

    // تقديم المكافآت
    this.giveRewards(achievement.rewards);

    // إشعار
    if (this.game && this.game.showNotification) {
      this.game.showNotification('🏆 Achievement Unlocked: ' + achievement.name);
    }

    // إشعار الصوت (إن وُجد)
    if (GAME.audio && GAME.audio.play) {
      try { GAME.audio.play('achievement'); } catch(e) { /* ignore */ }
    }

    // تحديث لوحة الصدارة إن وُجدت
    if (GAME.LeaderboardSystem) {
      var unlockedCount = this.getProgress().unlocked;
      GAME.LeaderboardSystem.addScore('achievements', 'Player', unlockedCount);
    }

    console.log('[AchievementSystem] 🏆 Unlocked:', id, '-', achievement.name);
    this.saveProgress();
  },

  // ============================================================
  // 🎁 تقديم المكافآت
  // ============================================================
  /**
   * تقديم مكافآت الإنجاز للاعب
   * @param {Object} rewards - المكافآت {money, xp}
   */
  giveRewards: function(rewards) {
    if (!this.game || !this.game.state) return;

    if (rewards.money) {
      this.game.state.money += rewards.money;
    }
    if (rewards.xp) {
      if (GAME.EconomySystem && GAME.EconomySystem.addXP) {
        GAME.EconomySystem.addXP(rewards.xp);
      } else {
        this.game.state.xp = (this.game.state.xp || 0) + rewards.xp;
      }
    }
  },

  // ============================================================
  // 📈 تحديث الإحصائيات
  // ============================================================
  /**
   * تحديث إحصائية معينة وإعادة فحص الإنجازات
   * @param {string} stat - اسم الإحصائية
   * @param {number} amount - المبلغ المضاف (افتراضي: 1)
   */
  updateStats: function(stat, amount) {
    amount = amount || 1;
    if (this.stats.hasOwnProperty(stat)) {
      this.stats[stat] += amount;
      this.checkAchievements();
    }
  },

  /**
   * تسجيل حصاد محصول (يتتبع الأنواع الفريدة)
   * @param {string} cropType - نوع المحصول
   */
  onCropHarvested: function(cropType) {
    this.stats.cropsHarvested++;
    if (cropType) {
      if (!this.stats.cropsGrown[cropType]) {
        this.stats.cropsGrown[cropType] = 0;
      }
      this.stats.cropsGrown[cropType]++;
    }
    this.checkAchievements();
  },

  /**
   * تسجيل إضافة حيوان جديد
   */
  onAnimalOwned: function() {
    this.stats.animalsOwned++;
    this.checkAchievements();
  },

  /**
   * تسجيل جمع منتج حيواني
   */
  onAnimalProductCollected: function() {
    if (!this.stats.animalProductsCollected) this.stats.animalProductsCollected = 0;
    this.stats.animalProductsCollected++;
    this.checkAchievements();
  },

  /**
   * تسجيل العثور على كمأة
   */
  onTruffleFound: function() {
    if (!this.stats.trufflesFound) this.stats.trufflesFound = 0;
    this.stats.trufflesFound++;
    this.checkAchievements();
  },

  /**
   * تسجيل وصول حيوان لأعلى سعادة
   */
  onAnimalMaxHappiness: function() {
    if (!this.stats.maxHappinessAnimals) this.stats.maxHappinessAnimals = 0;
    this.stats.maxHappinessAnimals++;
    this.checkAchievements();
  },

  /**
   * تسجيل حديث مع NPC
   * @param {string} npcId - معرف NPC
   */
  onNpcTalk: function(npcId) {
    if (!this.stats.npcTalkCount) this.stats.npcTalkCount = {};
    if (!this.stats.npcTalkCount[npcId]) this.stats.npcTalkCount[npcId] = 0;
    this.stats.npcTalkCount[npcId]++;
    this.checkAchievements();
  },

  /**
   * تسجيل إعطاء هدية
   */
  onGiftGiven: function() {
    this.stats.giftsGiven = (this.stats.giftsGiven || 0) + 1;
    this.checkAchievements();
  },

  /**
   * تسجيل زيارة منطقة
   * @param {string} zoneId - معرف المنطقة
   */
  onZoneVisited: function(zoneId) {
    if (!this.stats.visitedZones) this.stats.visitedZones = {};
    this.stats.visitedZones[zoneId] = true;
    var visitedCount = Object.keys(this.stats.visitedZones).length;
    if (visitedCount > this.stats.zonesVisited) {
      this.stats.zonesVisited = visitedCount;
    }
    this.checkAchievements();
  },

  /**
   * تسجيل العثور على عنصر مخفي
   */
  onItemFound: function() {
    this.stats.itemsFound++;
    this.checkAchievements();
  },

  /**
   * تسجيل اكتمال دورة نهار/ليل
   */
  onDayNightCycleComplete: function() {
    this.stats.dayNightCycles++;
    this.checkAchievements();
  },

  /**
   * إعادة تعيين عداد اليوم (يُستدعى عند بداية يوم جديد)
   */
  resetDailyCounters: function() {
    this.stats._cropsHarvestedToday = 0;
    this.stats._talkedNpcsToday = {};
  },

  /**
   * تسجيل حصاد يومي
   */
  onCropHarvestedToday: function() {
    this.stats._cropsHarvestedToday = (this.stats._cropsHarvestedToday || 0) + 1;
  },

  // ============================================================
  // 🛠️ دوال مساعدة خاصة
  // ============================================================
  _getUniqueCropsGrown: function() {
    return Object.keys(this.stats.cropsGrown || {}).length;
  },

  _getMaxFriendshipNpcCount: function(level) {
    if (!GAME.NPCsSystem || !GAME.NPCsSystem.npcs) return 0;
    var count = 0;
    var npcs = GAME.NPCsSystem.npcs;
    for (var i = 0; i < npcs.length; i++) {
      if (npcs[i].friendship && npcs[i].friendship >= level) {
        count++;
      }
    }
    return count;
  },

  _getTotalNpcCount: function() {
    if (!GAME.NPCsSystem || !GAME.NPCsSystem.npcs) return 5;
    return GAME.NPCsSystem.npcs.length || 5;
  },

  _talkedToAllNpcsToday: function() {
    if (!GAME.NPCsSystem || !GAME.NPCsSystem.npcs) return false;
    var npcs = GAME.NPCsSystem.npcs;
    var today = this.game && this.game.state ? this.game.state.day : 0;
    if (!this.stats._talkedNpcsToday) this.stats._talkedNpcsToday = {};
    var talkedCount = Object.keys(this.stats._talkedNpcsToday).length;
    return talkedCount >= npcs.length;
  },

  // ============================================================
  // 📊 الحصول على التقدم
  // ============================================================
  /**
   * الحصول على إحصائيات التقدم العامة
   * @returns {Object} {total, unlocked, percentage, byCategory}
   */
  getProgress: function() {
    var total = 0;
    var unlocked = 0;
    var byCategory = {};

    for (var id in this.achievements) {
      var achievement = this.achievements[id];
      var cat = achievement.category;
      if (!byCategory[cat]) {
        byCategory[cat] = { total: 0, unlocked: 0 };
      }
      total++;
      byCategory[cat].total++;
      if (achievement.unlocked) {
        unlocked++;
        byCategory[cat].unlocked++;
      }
    }

    return {
      total: total,
      unlocked: unlocked,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      byCategory: byCategory
    };
  },

  /**
   * الحصول على جميع الإنجازات المفتوحة
   * @returns {Array} مصفوفة بالإنجازات المفتوحة
   */
  getUnlockedAchievements: function() {
    var result = [];
    for (var id in this.achievements) {
      if (this.achievements[id].unlocked) {
        result.push({ id: id, achievement: this.achievements[id] });
      }
    }
    return result;
  },

  /**
   * الحصول على الإنجازات حسب الفئة
   * @param {string} category - اسم الفئة
   * @returns {Array} مصفوفة بالإنجازات في هذه الفئة
   */
  getByCategory: function(category) {
    var result = [];
    for (var id in this.achievements) {
      if (this.achievements[id].category === category) {
        result.push({ id: id, achievement: this.achievements[id] });
      }
    }
    return result;
  },

  /**
   * الحصول على الإنجازات غير المفتوحة
   * @returns {Array} مصفوفة بالإنجازات المتبقية
   */
  getLockedAchievements: function() {
    var result = [];
    for (var id in this.achievements) {
      if (!this.achievements[id].unlocked) {
        result.push({ id: id, achievement: this.achievements[id] });
      }
    }
    return result;
  },

  /**
   * الحصول على آخر إنجاز تم فتحه
   * @returns {Object|null} آخر إنجاز أو null
   */
  getLatestUnlock: function() {
    var latest = null;
    for (var id in this.achievements) {
      var a = this.achievements[id];
      if (a.unlocked && a.unlockedAt) {
        if (!latest || a.unlockedAt > latest.unlockedAt) {
          latest = { id: id, achievement: a };
        }
      }
    }
    return latest;
  },

  // ============================================================
  // 🎨 توليد واجهة الإنجازات
  // ============================================================
  /**
   * إنشاء لوحة إنجازات HTML
   * @returns {string} HTML string للوحة الإنجازات
   */
  renderPanel: function() {
    var progress = this.getProgress();
    var html = '<div class="achievement-panel">';

    // Header
    html += '<div class="achievement-header">';
    html += '<h2>🏆 Achievements</h2>';
    html += '<div class="achievement-progress">';
    html += '<span>' + progress.unlocked + ' / ' + progress.total + '</span>';
    html += '<div class="progress-bar"><div class="progress-fill" style="width:' + progress.percentage + '%"></div></div>';
    html += '<span>' + progress.percentage + '%</span>';
    html += '</div>';
    html += '</div>';

    // Categories
    var catOrder = ['farming', 'animals', 'economy', 'social', 'exploration'];
    for (var c = 0; c < catOrder.length; c++) {
      var catId = catOrder[c];
      var catInfo = this.categories[catId];
      var catProgress = progress.byCategory[catId] || { total: 0, unlocked: 0 };

      html += '<div class="achievement-category">';
      html += '<h3 style="color:' + catInfo.color + '">' + catInfo.icon + ' ' + catInfo.name;
      html += ' <span class="cat-count">(' + catProgress.unlocked + '/' + catProgress.total + ')</span></h3>';

      var catAchievements = this.getByCategory(catId);
      for (var i = 0; i < catAchievements.length; i++) {
        var a = catAchievements[i];
        var ach = a.achievement;
        var stateClass = ach.unlocked ? 'unlocked' : 'locked';
        var badgeClass = 'badge-' + (ach.badge || 'bronze');

        html += '<div class="achievement-item ' + stateClass + ' ' + badgeClass + '">';
        html += '<div class="ach-icon">' + ach.icon + '</div>';
        html += '<div class="ach-info">';
        html += '<div class="ach-name">' + ach.name + '</div>';
        html += '<div class="ach-desc">' + ach.description + '</div>';
        if (ach.unlocked) {
          html += '<div class="ach-rewards">';
          if (ach.rewards.money) html += '<span>💰' + ach.rewards.money + '</span> ';
          if (ach.rewards.xp) html += '<span>⭐' + ach.rewards.xp + '</span>';
          html += '</div>';
        } else {
          html += '<div class="ach-locked">🔒 Locked</div>';
        }
        html += '</div>';
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  // ============================================================
  // 💾 حفظ وتحميل
  // ============================================================
  /**
   * حفظ التقدم في localStorage
   */
  saveProgress: function() {
    try {
      var data = {
        achievements: {},
        stats: this.stats
      };
      for (var id in this.achievements) {
        data.achievements[id] = {
          unlocked: this.achievements[id].unlocked,
          unlockedAt: this.achievements[id].unlockedAt || null
        };
      }
      localStorage.setItem('farmGameAchievements', JSON.stringify(data));
    } catch (e) {
      console.error('[AchievementSystem] ❌ Save error:', e.message);
    }
  },

  /**
   * تحميل التقدم من localStorage
   */
  loadProgress: function() {
    try {
      var saved = localStorage.getItem('farmGameAchievements');
      if (!saved) return;

      var data = JSON.parse(saved);
      if (data.achievements) {
        for (var id in data.achievements) {
          if (this.achievements[id]) {
            this.achievements[id].unlocked = data.achievements[id].unlocked || false;
            this.achievements[id].unlockedAt = data.achievements[id].unlockedAt || null;
          }
        }
      }
      if (data.stats) {
        // Merge stats carefully — preserve existing defaults
        for (var key in data.stats) {
          this.stats[key] = data.stats[key];
        }
      }
    } catch (e) {
      console.error('[AchievementSystem] ❌ Load error:', e.message);
    }
  },

  /**
   * إعادة تعيين جميع الإنجازات (للتطوير فقط)
   */
  resetAll: function() {
    for (var id in this.achievements) {
      this.achievements[id].unlocked = false;
      this.achievements[id].unlockedAt = null;
    }
    this.stats = {
      cropsHarvested: 0,
      animalsFed: 0,
      moneyEarned: 0,
      itemsSold: 0,
      npcsMet: 0,
      zonesVisited: 0,
      itemsFound: 0,
      cropsPlanted: 0,
      itemsWatered: 0,
      fertilizersUsed: 0,
      itemsCrafted: 0,
      animalsOwned: 0,
      giftsGiven: 0,
      npcTalkCount: {},
      cropsGrown: {},
      dayNightCycles: 0,
      animalProductsCollected: 0,
      trufflesFound: 0,
      maxHappinessAnimals: 0,
      visitedZones: {},
      _cropsHarvestedToday: 0,
      _talkedNpcsToday: {}
    };
    localStorage.removeItem('farmGameAchievements');
    console.log('[AchievementSystem] 🔄 All achievements reset');
  },

  // ============================================================
  // 📊 تصدير الإحصائيات
  // ============================================================
  /**
   * الحصول على إحصائيات ملخصة
   * @returns {Object} إحصائيات شاملة
   */
  getStatsSummary: function() {
    return {
      totalUnlocked: this.getProgress().unlocked,
      totalAchievements: this.getProgress().total,
      percentage: this.getProgress().percentage,
      stats: this.stats,
      categories: this.categories
    };
  }
};
