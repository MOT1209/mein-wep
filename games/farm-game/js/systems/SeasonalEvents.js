/**
 * SeasonalEvents.js - نظام الأحداث الموسمية المتكامل
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - أحداث خاصة لكل موسم (ربيع، صيف، خريف، شتاء)
 * - 3-4 أحداث لكل موسم مع مكافآت فريدة
 * - تأثيرات بصرية (جسيمات، موسيقى، ديكور)
 * - جدولة الأحداث حسب يوم الموسم (seasonDay)
 * - مكافآت تلقائية عند بدء/نهاية الحدث
 * - تكامل مع TimeSystem, Inventory, EconomySystem, UI
 * - حفظ وتحميل حالة الأحداث النشطة
 * - تتبع الأحداث المكتملة
 */

var GAME = GAME || {};

// ============================================================
// 📅 تعريف الأحداث لكل موسم (12 حدث إجمالي)
// ============================================================
GAME.SEASONAL_EVENTS = {
  // 🌸 الربيع (4 أحداث)
  spring: [
    {
      id: 'cherry_blossom',
      name: 'Cherry Blossom Festival',
      nameAr: 'مهرجان أزهار الكرز',
      icon: '🌸',
      description: 'Beautiful cherry blossoms bloom across the farm!',
      descriptionAr: 'تزهر أزهار الكرز الجميلة في جميع أنحاء المزرعة!',
      startDay: 3,      // يوم 3 من الموسم
      duration: 4,       // 4 أيام
      rewards: {
        money: 200,
        xp: 50,
        items: { cherry_seed: 5, flower_bouquet: 2 }
      },
      effects: {
        particles: 'cherry_blossom',
        music: 'spring_festival',
        ambientColor: 0xffc0cb,
        ambientIntensity: 0.9
      },
      specialOffers: {
        shopDiscount: 0.15,  // خصم 15% في المتجر
        seedMultiplier: 2    // مرتين من البذور
      }
    },
    {
      id: 'easter_hunt',
      name: 'Easter Egg Hunt',
      nameAr: 'البحث عن بيض عيد الفصح',
      icon: '🥚',
      description: 'Find hidden eggs around the farm for special prizes!',
      descriptionAr: 'ابحث عن البيض المخفي حول المزرعة للفوز بجوائز خاصة!',
      startDay: 8,
      duration: 3,
      rewards: {
        money: 150,
        xp: 40,
        items: { egg: 10, chocolate_egg: 5, candy: 8 }
      },
      effects: {
        spawnEggs: true,
        music: 'playful',
        decorations: ['egg_nest', 'bunny']
      },
      specialOffers: {
        animalProductBonus: 1.5  // 50% مكافأة إضافية على منتجات الحيوانات
      }
    },
    {
      id: 'spring_planting',
      name: 'Spring Planting Day',
      nameAr: 'يوم الزراعة الربيعي',
      icon: '🌱',
      description: 'Special bonuses for planting spring crops!',
      descriptionAr: 'مكافآت خاصة لزراعة محاصيل الربيع!',
      startDay: 14,
      duration: 3,
      rewards: {
        money: 100,
        xp: 60,
        items: { wheat_seed: 8, carrot_seed: 5, lettuce_seed: 5 }
      },
      effects: {
        particles: 'leaves',
        music: 'nature',
        growthMultiplier: 1.5  // نمو أسرع 50%
      },
      specialOffers: {
        seedDiscount: 0.25,    // خصم 25% على البذور
        growthBonus: 1.5
      }
    },
    {
      id: 'rain_dance',
      name: 'Rain Dance Festival',
      nameAr: 'مهرجان رقص المطر',
      icon: '🌧️',
      description: 'A mystical rain dance blesses your crops!',
      descriptionAr: 'رقص مطر صوفي يبارك محاصيلك!',
      startDay: 22,
      duration: 2,
      rewards: {
        money: 180,
        xp: 45,
        items: { water_crystal: 3 }
      },
      effects: {
        weather: 'rain',
        music: 'mystical',
        autoWater: true  // ري تلقائي
      },
      specialOffers: {
        waterBonus: 2.0,  // ضعف مكافأة الري
        energyCost: 0.5   // تكلفة طاقة أقل
      }
    }
  ],

  // ☀️ الصيف (3 أحداث)
  summer: [
    {
      id: 'beach_party',
      name: 'Beach Party',
      nameAr: 'حفلة الشاطئ',
      icon: '🏖️',
      description: 'Special items and fish available at the beach!',
      descriptionAr: 'عناصر وسمك متاحان بشكل خاص على الشاطئ!',
      startDay: 2,
      duration: 4,
      rewards: {
        money: 250,
        xp: 55,
        items: { tuna: 3, tropical_fish: 2, shell: 5 }
      },
      effects: {
        particles: 'confetti',
        music: 'summer_party',
        beachDecor: true,
        ambientColor: 0x87ceeb,
        ambientIntensity: 1.0
      },
      specialOffers: {
        fishMultiplier: 2,      // ضعف صيد الأسماك
        fishRarityBonus: 0.3    // فرصة أكبر للأسماك النادرة
      }
    },
    {
      id: 'crop_festival',
      name: 'Summer Crop Festival',
      nameAr: 'مهرجان المحاصيل الصيفية',
      icon: '🌽',
      description: 'Show off your best summer crops for bonus rewards!',
      descriptionAr: 'أظهر أفضل محاصيلك الصيفية للحصول على مكافآت إضافية!',
      startDay: 10,
      duration: 2,
      rewards: {
        money: 500,
        xp: 80,
        items: { tomato_seed: 10, corn_seed: 8, medal_gold: 1 }
      },
      effects: {
        festivalDecor: true,
        music: 'celebration',
        sellMultiplier: 1.5  // 50% مكافأة على البيع
      },
      specialOffers: {
        sellBonus: 1.5,
        xpMultiplier: 2
      }
    },
    {
      id: 'summer_nights',
      name: 'Summer Night Market',
      nameAr: 'سوق ليالي الصيف',
      icon: '🌙',
      description: 'A special night market with rare items appears!',
      descriptionAr: 'يظهر سوق ليلي خاص بعناصر نادرة!',
      startDay: 20,
      duration: 3,
      rewards: {
        money: 300,
        xp: 65,
        items: { rare_seed: 3, night_butterfly: 2, star_dust: 1 }
      },
      effects: {
        particles: 'fireflies',
        music: 'night_market',
        nightDecor: true,
        ambientColor: 0x1a1a2e,
        ambientIntensity: 0.6
      },
      specialOffers: {
        rareItemChance: 0.4,  // 40% فرصة للعناصر النادرة
        nightFishBonus: 1.5
      }
    }
  ],

  // 🍂 الخريف (3 أحداث)
  autumn: [
    {
      id: 'harvest_festival',
      name: 'Harvest Festival',
      nameAr: 'مهرجان الحصاد',
      icon: '🎃',
      description: 'Celebrate the harvest with special rewards and decorations!',
      descriptionAr: 'احتفال الحصاد بمكافآت وديكورات خاصة!',
      startDay: 3,
      duration: 5,
      rewards: {
        money: 400,
        xp: 70,
        items: { wheat: 20, pumpkin: 10, apple: 15, pie: 3 }
      },
      effects: {
        particles: 'falling_leaves',
        music: 'harvest_festival',
        pumpkinDecor: true,
        ambientColor: 0xff8c00,
        ambientIntensity: 0.85
      },
      specialOffers: {
        harvestBonus: 2.0,    // ضعف مكافأة الحصاد
        craftDiscount: 0.2    // خصم 20% على الصناعة
      }
    },
    {
      id: 'trick_or_treat',
      name: 'Trick or Treat',
      nameAr: 'حلاوة ولا مقالعة',
      icon: '🍬',
      description: 'Collect candy from NPCs and complete spooky quests!',
      descriptionAr: 'اجمع الحلوى من الشخصيات وأكمل المهمات المرعبة!',
      startDay: 15,
      duration: 3,
      rewards: {
        money: 200,
        xp: 50,
        items: { candy: 15, chocolate: 8, pumpkin_seed: 5, spooky_mask: 1 }
      },
      effects: {
        nightDecor: true,
        music: 'spooky',
        spawnCandy: true,
        ambientColor: 0x2d1b69,
        ambientIntensity: 0.5
      },
      specialOffers: {
        npcGiftBonus: 2,      // ضعف هدايا الشخصيات
        scarecrowEffect: 1.5  // ردع الحيوانات البرية أقوى
      }
    },
    {
      id: 'mushroom_hunt',
      name: 'Mushroom Foraging Days',
      nameAr: 'أيام تجميع الفطر',
      icon: '🍄',
      description: 'Rare mushrooms appear across the farm!',
      descriptionAr: 'يظهر فطر نادر في جميع أنحاء المزرعة!',
      startDay: 22,
      duration: 4,
      rewards: {
        money: 350,
        xp: 60,
        items: { mushroom_rare: 5, mushroom_common: 12, truffle: 2 }
      },
      effects: {
        particles: 'spores',
        music: 'mysterious',
        mushroomSpawn: true,
        ambientColor: 0x3d5a3d,
        ambientIntensity: 0.7
      },
      specialOffers: {
        forageMultiplier: 3,  // 3 أضعاف تجميع الفطر
        cookingBonus: 1.5     // مكافأة طهي إضافية
      }
    }
  ],

  // ❄️ الشتاء (3 أحداث)
  winter: [
    {
      id: 'snow_day',
      name: 'Snow Day',
      nameAr: 'يوم الثلج',
      icon: '❄️',
      description: 'Special winter crops and decorations appear!',
      descriptionAr: 'تظهر محاصيل وديكورات شتوية خاصة!',
      startDay: 2,
      duration: 5,
      rewards: {
        money: 250,
        xp: 55,
        items: { winter_seed: 5, snowdrop: 3, hot_cocoa: 4 }
      },
      effects: {
        particles: 'snow',
        music: 'winter_wonderland',
        snowDecor: true,
        ambientColor: 0xe8e8e8,
        ambientIntensity: 0.95
      },
      specialOffers: {
        winterCropGrowth: 1.5,  // نمو أسرع للمحاصيل الشتوية
        warmth: 20              // مكافأة دفء
      }
    },
    {
      id: 'gift_exchange',
      name: 'Gift Exchange',
      nameAr: 'تبادل الهدايا',
      icon: '🎁',
      description: 'Exchange gifts with NPCs for friendship and rewards!',
      descriptionAr: 'تبادل الهدايا مع الشخصيات لتعزيز الصداقة والمكافآت!',
      startDay: 12,
      duration: 3,
      rewards: {
        money: 300,
        xp: 70,
        friendship: 20,
        items: { gift_box: 5, golden_star: 1 }
      },
      effects: {
        giftDecor: true,
        music: 'festive',
        npcGiftBonus: true
      },
      specialOffers: {
        friendshipMultiplier: 3,  // 3 أضعاف مكافأة الصداقة
        shopPrices: 0.8            // أسعار المتجر أقل 20%
      }
    },
    {
      id: 'winter_solstice',
      name: 'Winter Solstice',
      nameAr: 'انقلاب شتاء',
      icon: '🕯️',
      description: 'The shortest day brings magical bonuses!',
      descriptionAr: 'أقصر يوم يجلب مكافآت سحرية!',
      startDay: 24,
      duration: 2,
      rewards: {
        money: 400,
        xp: 90,
        items: { magic_candle: 2, star_fragment: 1, ancient_seed: 1 }
      },
      effects: {
        particles: 'aurora',
        music: 'ethereal',
        nightDecor: true,
        ambientColor: 0x4a0e6b,
        ambientIntensity: 0.4,
        magicGlow: true
      },
      specialOffers: {
        xpMultiplier: 2,        // ضعف XP
        rareDropChance: 0.5,    // 50% فرصة للعناصر الأسطورية
        energyRegen: 2           // تعافي طاقة أسرع
      }
    }
  ]
};

// ============================================================
// 🎮 كائن SeasonalEvents الرئيسي
// ============================================================
GAME.SeasonalEvents = {
  game: null,
  currentEvent: null,
  eventTimer: 0,
  eventRemainingTime: 0,
  completedEvents: {},    // { eventId: lastCompletionDay }
  activeParticles: [],    // الجسيمات النشطة
  pendingRewards: [],     // المكافآت المعلقة
  _lastSeasonDay: -1,     // لتتبع تغيير اليوم

  // ============================================================
  // 🚀 التهيئة
  // ============================================================
  init: function(game) {
    this.game = game;
    this.currentEvent = null;
    this.eventTimer = 0;
    this.eventRemainingTime = 0;
    this.completedEvents = {};
    this.activeParticles = [];
    this.pendingRewards = [];
    this._lastSeasonDay = -1;

    // تحميل الحالة المحفوظة
    this._loadState();

    // فحص الأحداث المكتملة
    this._loadCompletedEvents();

    console.log('[SeasonalEvents] 🎉 Initialized — checking for active events');
  },

  // ============================================================
  // ⏱️ التحديث الدوري
  // ============================================================
  update: function(dt) {
    if (!GAME.TimeSystem) return;

    var seasonDay = GAME.TimeSystem.seasonDay;
    var season = GAME.TimeSystem.season;

    // فحص يوم جديد
    if (seasonDay !== this._lastSeasonDay) {
      this._lastSeasonDay = seasonDay;
      this._checkForNewEvent(season, seasonDay);
    }

    // تحديث مؤقت الحدث النشط
    if (this.currentEvent) {
      this.eventTimer -= dt;
      this.eventRemainingTime = Math.max(0, this.eventTimer);

      if (this.eventTimer <= 0) {
        this._endCurrentEvent();
      }
    }

    // تحديث الجسيمات
    this._updateParticles(dt);
  },

  // ============================================================
  // 🔍 فحص أحداث جديدة
  // ============================================================
  _checkForNewEvent: function(season, seasonDay) {
    var events = GAME.SEASONAL_EVENTS[season];
    if (!events) return;

    for (var i = 0; i < events.length; i++) {
      var event = events[i];

      // هل هذا هو يوم بدء الحدث؟
      if (seasonDay === event.startDay) {
        // تحقق ألا يكون مكتملاً هذا اليوم
        if (!this._isEventCompletedToday(event.id)) {
          this._startEvent(event);
          return; // حدث واحد فقط في كل مرة
        }
      }
    }
  },

  // ============================================================
  // 🎉 بدء حدث
  // ============================================================
  _startEvent: function(event) {
    // إنهاء الحدث الحالي إن وجد
    if (this.currentEvent) {
      this._endCurrentEvent();
    }

    this.currentEvent = event;
    // المؤقت بالأيام (كل يوم = 10 دقائق في الوقت الحقيقي)
    this.eventTimer = event.duration * GAME.TimeSystem.dayLength;
    this.eventRemainingTime = this.eventTimer;

    // إشعار البدء
    var msg = event.icon + ' ' + event.name + ' has started! (' + event.duration + ' days)';
    if (this.game && this.game.ui) {
      this.game.ui.showNotification(msg, 'success');
    } else if (GAME.ui) {
      GAME.ui.showNotification(msg, 'success');
    }

    // تطبيق التأثيرات
    this._applyEventEffects(event);

    // منح مكافأة البدء
    this._grantRewards(event.rewards, 'event_start');

    // عرض معلومات الحدث
    this._showEventInfo(event);

    console.log('[SeasonalEvents] 🎉 Started:', event.name, 'for', event.duration, 'days');
  },

  // ============================================================
  // 🏁 نهاية حدث
  // ============================================================
  _endCurrentEvent: function() {
    if (!this.currentEvent) return;

    var event = this.currentEvent;

    // إشعار النهاية
    var msg = event.icon + ' ' + event.name + ' has ended! Thanks for participating!';
    if (this.game && this.game.ui) {
      this.game.ui.showNotification(msg, 'info');
    } else if (GAME.ui) {
      GAME.ui.showNotification(msg, 'info');
    }

    // إزالة التأثيرات
    this._removeEventEffects(event);

    // تسجيل كمكتمل
    this._markEventCompleted(event.id);

    // منح مكافأة النهاية (إذا وجدت)
    if (event.rewards && event.rewards.bonus) {
      this._grantRewards(event.rewards.bonus, 'event_end');
    }

    // حفظ الحالة
    this._saveState();

    console.log('[SeasonalEvents] 🏁 Ended:', event.name);
    this.currentEvent = null;
    this.eventTimer = 0;
    this.eventRemainingTime = 0;
  },

  // ============================================================
  // ✨ تطبيق تأثيرات الحدث
  // ============================================================
  _applyEventEffects: function(event) {
    if (!event.effects) return;

    var effects = event.effects;

    // تغيير لون الإضاءة المحيطة
    if (effects.ambientColor !== undefined) {
      this._setAmbientColor(effects.ambientColor, effects.ambientIntensity || 0.8);
    }

    // تشغيل موسيقى الحدث
    if (effects.music && GAME.audio && typeof GAME.audio.play === 'function') {
      GAME.audio.play(effects.music);
    }

    // بدء الجسيمات
    if (effects.particles) {
      this._startEventParticles(effects.particles);
    }

    // تأثيرات خاصة
    if (effects.autoWater) {
      this._applyAutoWater();
    }

    if (effects.growthMultiplier) {
      this._setGrowthMultiplier(effects.growthMultiplier);
    }

    if (effects.spawnEggs) {
      this._spawnEasterEggs();
    }

    if (effects.spawnCandy) {
      this._spawnCandy();
    }

    if (effects.mushroomSpawn) {
      this._spawnMushrooms();
    }

    // ديكورات
    if (effects.beachDecor || effects.festivalDecor || effects.pumpkinDecor ||
        effects.nightDecor || effects.giftDecor || effects.snowDecor) {
      this._applyDecorations(event);
    }

    // تطبيق عروض المتجر الخاصة
    if (event.specialOffers) {
      this._applySpecialOffers(event.specialOffers);
    }
  },

  // ============================================================
  // 🧹 إزالة تأثيرات الحدث
  // ============================================================
  _removeEventEffects: function(event) {
    if (!event.effects) return;

    var effects = event.effects;

    // إعادة الإضاءة المحيطة
    if (effects.ambientColor !== undefined) {
      this._resetAmbientColor();
    }

    // إيقاف الجسيمات
    this._stopEventParticles();

    // إلغاء مضاعف النمو
    if (effects.growthMultiplier) {
      this._setGrowthMultiplier(1.0);
    }

    // إلغاء الري التلقائي
    if (effects.autoWater) {
      this._applyAutoWater(false);
    }

    // إزالة عروض المتجر
    if (event.specialOffers) {
      this._removeSpecialOffers(event.specialOffers);
    }
  },

  // ============================================================
  // 🎁 منح المكافآت
  // ============================================================
  _grantRewards: function(rewards, source) {
    if (!rewards) return;

    var granted = [];

    // المال
    if (rewards.money && GAME.state) {
      GAME.state.money += rewards.money;
      granted.push('+$' + rewards.money);
    }

    // الخبرة
    if (rewards.xp && GAME.EconomySystem && typeof GAME.EconomySystem.addXP === 'function') {
      GAME.EconomySystem.addXP(rewards.xp);
      granted.push('+' + rewards.xp + ' XP');
    } else if (rewards.xp && GAME.state) {
      GAME.state.xp = (GAME.state.xp || 0) + rewards.xp;
      granted.push('+' + rewards.xp + ' XP');
    }

    // الصداقة
    if (rewards.friendship && GAME.NPCsSystem && typeof GAME.NPCsSystem.addFriendship === 'function') {
      GAME.NPCsSystem.addFriendship(rewards.friendship);
      granted.push('+' + rewards.friendship + ' Friendship');
    }

    // العناصر
    if (rewards.items) {
      for (var itemId in rewards.items) {
        if (rewards.items.hasOwnProperty(itemId)) {
          var qty = rewards.items[itemId];
          if (GAME.Inventory && typeof GAME.Inventory.add === 'function') {
            GAME.Inventory.add(itemId, qty);
          } else if (this.game && this.game.inventory) {
            this.game.inventory[itemId] = (this.game.inventory[itemId] || 0) + qty;
          } else if (GAME.state && GAME.state.inventory) {
            // محاولة الإضافة إلى الفئات المناسبة
            this._addToInventory(itemId, qty);
          }
          granted.push('+' + qty + ' ' + itemId);
        }
      }
    }

    // إشعار المكافآت
    if (granted.length > 0) {
      var rewardMsg = '🎁 Rewards: ' + granted.join(', ');
      if (this.game && this.game.ui) {
        this.game.ui.showNotification(rewardMsg, 'success');
      } else if (GAME.ui) {
        GAME.ui.showNotification(rewardMsg, 'success');
      }
    }
  },

  // ============================================================
  // 📦 إضافة عنصر للمخزون
  // ============================================================
  _addToInventory: function(itemId, quantity) {
    var inv = GAME.state.inventory;
    if (!inv) return;

    // البحث في الفئات المختلفة
    var categories = ['seeds', 'harvest', 'fertilizer', 'animal', 'crafted'];
    for (var c = 0; c < categories.length; c++) {
      var cat = categories[c];
      if (inv[cat] && inv[cat].hasOwnProperty(itemId)) {
        inv[cat][itemId] += quantity;
        return;
      }
    }

    // إذا لم يوجد، أضفه في harvest كخيار افتراضي
    if (inv.harvest) {
      inv.harvest[itemId] = (inv.harvest[itemId] || 0) + quantity;
    }
  },

  // ============================================================
  // 🌟 تطبيق عروض المتجر الخاصة
  // ============================================================
  _applySpecialOffers: function(offers) {
    if (!GAME.EconomySystem) return;

    // تخزين القيم الأصلية
    if (!this._originalOffers) this._originalOffers = {};

    if (offers.shopDiscount !== undefined) {
      this._originalOffers.shopDiscount = GAME.EconomySystem.shopDiscount || 0;
      GAME.EconomySystem.shopDiscount = offers.shopDiscount;
    }
    if (offers.seedDiscount !== undefined) {
      this._originalOffers.seedDiscount = GAME.EconomySystem.seedDiscount || 0;
      GAME.EconomySystem.seedDiscount = offers.seedDiscount;
    }
    if (offers.sellMultiplier !== undefined) {
      this._originalOffers.sellMultiplier = GAME.EconomySystem.sellMultiplier || 1;
      GAME.EconomySystem.sellMultiplier = offers.sellMultiplier;
    }
    if (offers.xpMultiplier !== undefined) {
      this._originalOffers.xpMultiplier = GAME.EconomySystem.xpMultiplier || 1;
      GAME.EconomySystem.xpMultiplier = offers.xpMultiplier;
    }
  },

  _removeSpecialOffers: function(offers) {
    if (!GAME.EconomySystem || !this._originalOffers) return;

    if (offers.shopDiscount !== undefined && this._originalOffers.shopDiscount !== undefined) {
      GAME.EconomySystem.shopDiscount = this._originalOffers.shopDiscount;
    }
    if (offers.seedDiscount !== undefined && this._originalOffers.seedDiscount !== undefined) {
      GAME.EconomySystem.seedDiscount = this._originalOffers.seedDiscount;
    }
    if (offers.sellMultiplier !== undefined && this._originalOffers.sellMultiplier !== undefined) {
      GAME.EconomySystem.sellMultiplier = this._originalOffers.sellMultiplier;
    }
    if (offers.xpMultiplier !== undefined && this._originalOffers.xpMultiplier !== undefined) {
      GAME.EconomySystem.xpMultiplier = this._originalOffers.xpMultiplier;
    }

    this._originalOffers = null;
  },

  // ============================================================
  // 🎨 إدارة الإضاءة المحيطة
  // ============================================================
  _setAmbientColor: function(color, intensity) {
    if (!this.game || !this.game.scene) return;
    var scene = this.game.scene;

    // حفظ الألوان الأصلية
    if (!this._originalAmbient) {
      this._originalAmbient = {};
      if (scene.ambientLight) {
        this._originalAmbient.color = scene.ambientLight.color ? scene.ambientLight.color.clone() : null;
        this._originalAmbient.intensity = scene.ambientLight.intensity;
      }
    }

    if (scene.ambientLight) {
      scene.ambientLight.color.set(color);
      scene.ambientLight.intensity = intensity;
    }
  },

  _resetAmbientColor: function() {
    if (!this._originalAmbient) return;
    if (!this.game || !this.game.scene) return;

    var scene = this.game.scene;
    if (scene.ambientLight && this._originalAmbient) {
      if (this._originalAmbient.color) {
        scene.ambientLight.color.copy(this._originalAmbient.color);
      }
      if (this._originalAmbient.intensity !== undefined) {
        scene.ambientLight.intensity = this._originalAmbient.intensity;
      }
    }

    this._originalAmbient = null;
  },

  // ============================================================
  // ✨ إدارة الجسيمات
  // ============================================================
  _startEventParticles: function(type) {
    this._stopEventParticles(); // إيقاف الجسيمات الحالية

    var particleConfig = {
      cherry_blossom: { count: 50, color: 0xffb7c5, size: 0.3, fallSpeed: 0.5, spread: 15 },
      snow: { count: 80, color: 0xffffff, size: 0.2, fallSpeed: 0.8, spread: 15 },
      falling_leaves: { count: 30, color: 0xff8c00, size: 0.4, fallSpeed: 0.3, spread: 12 },
      confetti: { count: 40, color: 0xffd700, size: 0.25, fallSpeed: 1.0, spread: 10 },
      fireflies: { count: 20, color: 0xffff00, size: 0.15, fallSpeed: 0.1, spread: 10 },
      spores: { count: 25, color: 0x90ee90, size: 0.2, fallSpeed: 0.2, spread: 8 },
      aurora: { count: 60, color: 0x00ff88, size: 0.35, fallSpeed: 0.15, spread: 18 },
      leaves: { count: 35, color: 0x90ee90, size: 0.3, fallSpeed: 0.4, spread: 12 }
    };

    var config = particleConfig[type];
    if (!config || !this.game || !this.game.scene) return;

    var scene = this.game.scene;

    for (var i = 0; i < config.count; i++) {
      var geometry = new THREE.SphereGeometry(config.size, 4, 4);
      var material = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.7
      });
      var particle = new THREE.Mesh(geometry, material);

      // وضع عشوائي
      particle.position.set(
        (Math.random() - 0.5) * config.spread,
        Math.random() * 10 + 5,
        (Math.random() - 0.5) * config.spread
      );

      // خصائص الحركة
      particle.userData = {
        fallSpeed: config.fallSpeed + Math.random() * 0.3,
        swaySpeed: Math.random() * 2,
        swayAmount: Math.random() * 0.5,
        type: type
      };

      scene.add(particle);
      this.activeParticles.push(particle);
    }

    console.log('[SeasonalEvents] ✨ Started particles:', type, 'count:', config.count);
  },

  _stopEventParticles: function() {
    if (!this.game || !this.game.scene) return;
    var scene = this.game.scene;

    for (var i = 0; i < this.activeParticles.length; i++) {
      var p = this.activeParticles[i];
      if (p.parent === scene) {
        scene.remove(p);
      }
      if (p.geometry) p.geometry.dispose();
      if (p.material) p.material.dispose();
    }

    this.activeParticles = [];
  },

  _updateParticles: function(dt) {
    var time = Date.now() * 0.001;

    for (var i = this.activeParticles.length - 1; i >= 0; i--) {
      var p = this.activeParticles[i];
      if (!p || !p.userData) continue;

      // السقوط
      p.position.y -= p.userData.fallSpeed * dt;

      // التمايل الجانبي
      p.position.x += Math.sin(time * p.userData.swaySpeed) * p.userData.swayAmount * dt;

      // الدوران
      p.rotation.x += dt * 0.5;
      p.rotation.z += dt * 0.3;

      // إعادة تدوير من الأعلى
      if (p.position.y < -1) {
        p.position.y = 12 + Math.random() * 5;
        p.position.x = (Math.random() - 0.5) * 15;
        p.position.z = (Math.random() - 0.5) * 15;
      }

      // تأثير الرياح الخفيفة
      p.position.x += Math.sin(time * 0.3 + i) * 0.002;
    }
  },

  // ============================================================
  // 💧 الري التلقائي
  // ============================================================
  _applyAutoWater: function(enable) {
    if (enable === false) {
      this._autoWaterEnabled = false;
      return;
    }
    this._autoWaterEnabled = true;

    // ري جميع المحاصيل في البداية
    if (GAME.FarmingSystem && typeof GAME.FarmingSystem.waterAll === 'function') {
      GAME.FarmingSystem.waterAll();
    } else if (GAME.state && GAME.state.plots) {
      for (var i = 0; i < GAME.state.plots.length; i++) {
        if (GAME.state.plots[i].planted) {
          GAME.state.plots[i].watered = true;
        }
      }
    }
  },

  // ============================================================
  // 🌱 مضاعف النمو
  // ============================================================
  _setGrowthMultiplier: function(multiplier) {
    this._growthMultiplier = multiplier;
    if (GAME.FarmingSystem) {
      GAME.FarmingSystem.growthMultiplier = multiplier;
    }
  },

  // ============================================================
  // 🥚 توزيع بيض عيد الفصح
  // ============================================================
  _spawnEasterEggs: function() {
    // سيتم تنفيذه عبر الـ update أو عند التفاعل
    this._easterEggsActive = true;
    console.log('[SeasonalEvents] 🥚 Easter eggs will spawn on the farm');
  },

  // ============================================================
  // 🍬 توزيع الحلوى
  // ============================================================
  _spawnCandy: function() {
    this._candySpawnActive = true;
    console.log('[SeasonalEvents] 🍬 Candy spawn active');
  },

  // ============================================================
  // 🍄 توزيع الفطر
  // ============================================================
  _spawnMushrooms: function() {
    this._mushroomSpawnActive = true;
    console.log('[SeasonalEvents] 🍄 Mushroom spawn active');
  },

  // ============================================================
  // 🎄 تطبيق الديكورات
  // ============================================================
  _applyDecorations: function(event) {
    // سيتم ربطه بنظام الديكور في المشهد
    if (this.game && this.game.world && typeof this.game.world.setDecorations === 'function') {
      this.game.world.setDecorations(event.id, event.effects);
    }
    console.log('[SeasonalEvents] 🎄 Applied decorations for:', event.name);
  },

  // ============================================================
  // 📝 عرض معلومات الحدث
  // ============================================================
  _showEventInfo: function(event) {
    var infoMsg = event.icon + ' ' + event.nameAr + '\n' + event.descriptionAr;
    if (event.rewards) {
      var rewardParts = [];
      if (event.rewards.money) rewardParts.push('$' + event.rewards.money);
      if (event.rewards.xp) rewardParts.push(event.rewards.xp + ' XP');
      if (event.rewards.items) {
        var itemCount = 0;
        for (var k in event.rewards.items) itemCount++;
        rewardParts.push(itemCount + ' items');
      }
      if (rewardParts.length > 0) {
        infoMsg += '\n🎁 Rewards: ' + rewardParts.join(', ');
      }
    }

    // استخدام مؤقت لتأخير الإشعار الثاني
    var self = this;
    setTimeout(function() {
      if (self.game && self.game.ui) {
        self.game.ui.showNotification(infoMsg, 'info');
      } else if (GAME.ui) {
        GAME.ui.showNotification(infoMsg, 'info');
      }
    }, 2000);
  },

  // ============================================================
  // 🔍 فحص إذا كان الحدث مكتملاً اليوم
  // ============================================================
  _isEventCompletedToday: function(eventId) {
    if (!this.completedEvents[eventId]) return false;
    var completedDay = this.completedEvents[eventId];
    var currentDay = GAME.TimeSystem ? GAME.TimeSystem.day : 0;
    // إكمال واحد فقط لكل موسم (28 يوم)
    return (currentDay - completedDay) < 28;
  },

  _markEventCompleted: function(eventId) {
    this.completedEvents[eventId] = GAME.TimeSystem ? GAME.TimeSystem.day : 0;
    this._saveCompletedEvents();
  },

  // ============================================================
  // 📊 واجهة عامة للاستعلامات
  // ============================================================

  /**
   * هل يوجد حدث نشط حالياً؟
   */
  isEventActive: function() {
    return this.currentEvent !== null;
  },

  /**
   * الحصول على الحدث النشط
   */
  getActiveEvent: function() {
    return this.currentEvent;
  },

  /**
   * الحصول على الحدث النشط في موسم محدد
   */
  getEventForSeason: function(season) {
    if (!GAME.TimeSystem) return null;
    var seasonDay = GAME.TimeSystem.seasonDay;
    var events = GAME.SEASONAL_EVENTS[season];
    if (!events) return null;

    for (var i = 0; i < events.length; i++) {
      if (seasonDay >= events[i].startDay && seasonDay < events[i].startDay + events[i].duration) {
        return events[i];
      }
    }
    return null;
  },

  /**
   * الحصول على جميع أحداث موسم
   */
  getSeasonEvents: function(season) {
    return GAME.SEASONAL_EVENTS[season] || [];
  },

  /**
   * الحصول على الوقت المتبقي للحدث الحالي (بالثواني)
   */
  getEventTimeRemaining: function() {
    return this.eventRemainingTime / 1000;
  },

  /**
   * الحصول على نص الوقت المتبقي
   */
  getTimeRemainingString: function() {
    if (!this.currentEvent) return '';
    var seconds = Math.floor(this.eventRemainingTime / 1000);
    var hours = Math.floor(seconds / 3600);
    var mins = Math.floor((seconds % 3600) / 60);
    return hours + 'h ' + mins + 'm';
  },

  /**
   * هل الحدث يوفر خصم في المتجر؟
   */
  hasShopDiscount: function() {
    return this.currentEvent && this.currentEvent.specialOffers &&
           this.currentEvent.specialOffers.shopDiscount !== undefined;
  },

  /**
   * الحصول على نسبة الخصم الحالية
   */
  getShopDiscount: function() {
    if (!this.hasShopDiscount()) return 0;
    return this.currentEvent.specialOffers.shopDiscount;
  },

  /**
   * هل الحدث يوفر مضاعف XP؟
   */
  hasXPBonus: function() {
    return this.currentEvent && this.currentEvent.specialOffers &&
           this.currentEvent.specialOffers.xpMultiplier !== undefined;
  },

  /**
   * الحصول على مضاعف XP الحالي
   */
  getXPMultiplier: function() {
    if (!this.hasXPBonus()) return 1;
    return this.currentEvent.specialOffers.xpMultiplier;
  },

  /**
   * الحصول على مضاعف النمو الحالي
   */
  getGrowthMultiplier: function() {
    return this._growthMultiplier || 1;
  },

  /**
   * هل الري التلقائي مفعل؟
   */
  isAutoWaterActive: function() {
    return this._autoWaterEnabled === true;
  },

  /**
   * هل بيض عيد الفصح نشط؟
   */
  areEasterEggsActive: function() {
    return this._easterEggsActive === true;
  },

  /**
   * هل الحلوى نشطة؟
   */
  isCandySpawnActive: function() {
    return this._candySpawnActive === true;
  },

  /**
   * هل الفطر نشط؟
   */
  isMushroomSpawnActive: function() {
    return this._mushroomSpawnActive === true;
  },

  /**
   * الحصول على جميع الأحداث المكتملة
   */
  getCompletedEvents: function() {
    return this.completedEvents;
  },

  /**
   * عدد الأحداث المكتملة هذا الموسم
   */
  getSeasonCompletionCount: function(season) {
    var events = GAME.SEASONAL_EVENTS[season] || [];
    var count = 0;
    for (var i = 0; i < events.length; i++) {
      if (this.completedEvents[events[i].id]) {
        count++;
      }
    }
    return count;
  },

  /**
   * الحصول على التقدم في الأحداث (%)
   */
  getSeasonProgress: function(season) {
    var events = GAME.SEASONAL_EVENTS[season] || [];
    if (events.length === 0) return 0;
    return this.getSeasonCompletionCount(season) / events.length;
  },

  /**
   * الحصول على إحصائيات الأحداث
   */
  getStats: function() {
    var totalEvents = 0;
    var completedEvents = 0;
    var seasons = ['spring', 'summer', 'autumn', 'winter'];

    for (var s = 0; s < seasons.length; s++) {
      var events = GAME.SEASONAL_EVENTS[seasons[s]] || [];
      totalEvents += events.length;
      completedEvents += this.getSeasonCompletionCount(seasons[s]);
    }

    return {
      totalEvents: totalEvents,
      completedEvents: completedEvents,
      currentEvent: this.currentEvent ? this.currentEvent.name : null,
      eventTimeRemaining: this.getTimeRemainingString()
    };
  },

  // ============================================================
  // 💾 حفظ وتحميل الحالة
  // ============================================================
  _saveState: function() {
    try {
      var state = {
        completedEvents: this.completedEvents,
        currentEventId: this.currentEvent ? this.currentEvent.id : null
      };
      localStorage.setItem('farmGameSeasonalEvents', JSON.stringify(state));
    } catch (e) {
      console.warn('[SeasonalEvents] Failed to save state:', e);
    }
  },

  _loadState: function() {
    try {
      var saved = localStorage.getItem('farmGameSeasonalEvents');
      if (saved) {
        var state = JSON.parse(saved);
        this.completedEvents = state.completedEvents || {};
        console.log('[SeasonalEvents] 💾 Loaded state —', Object.keys(this.completedEvents).length, 'completed events');
      }
    } catch (e) {
      console.warn('[SeasonalEvents] Failed to load state:', e);
    }
  },

  _saveCompletedEvents: function() {
    this._saveState();
  },

  _loadCompletedEvents: function() {
    this._loadState();
  },

  // ============================================================
  // 🔧 للتكامل مع EnhancedSaveSystem
  // ============================================================
  save: function() {
    return {
      completedEvents: this.completedEvents,
      currentEventId: this.currentEvent ? this.currentEvent.id : null,
      eventTimer: this.eventTimer
    };
  },

  load: function(data) {
    if (!data) return;
    this.completedEvents = data.completedEvents || {};

    // إعادة تنشيط الحدث الحالي إذا كان لا يزال نشطاً
    if (data.currentEventId && data.eventTimer > 0) {
      var season = GAME.TimeSystem ? GAME.TimeSystem.getSeason() : 'spring';
      var events = GAME.SEASONAL_EVENTS[season] || [];
      for (var i = 0; i < events.length; i++) {
        if (events[i].id === data.currentEventId) {
          this.currentEvent = events[i];
          this.eventTimer = data.eventTimer;
          this.eventRemainingTime = data.eventTimer;
          this._applyEventEffects(events[i]);
          console.log('[SeasonalEvents] 🔄 Restored active event:', events[i].name);
          break;
        }
      }
    }
  },

  // ============================================================
  // 🧹 التنظيف عند إيقاف الحدث
  // ============================================================
  destroy: function() {
    if (this.currentEvent) {
      this._removeEventEffects(this.currentEvent);
    }
    this._stopEventParticles();
    this._resetAmbientColor();
    this.currentEvent = null;
    this.eventTimer = 0;
    console.log('[SeasonalEvents] 🧹 Destroyed');
  }
};

console.log('[SeasonalEvents] 🎉 System loaded — 12 seasonal events across 4 seasons');
