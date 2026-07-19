/**
 * FishingSystem.js - نظام الصيد المتكامل
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - 6 أنواع أسماك مختلفة
 * - Mini-game بسيط (اضغط Space في الوقت المناسب)
 * - أوقات مختلفة لتغير أنواع الأسماك
 * - صعوبة متفاوتة
 * - نظام XP والمكافآت
 * - حفظ وتحميل الحالة
 * - تكامل مع EconomySystem و TimeSystem
 *
 * منطقة الصيد: Beach
 * التحكم: Space للبدء، Space للإمساك
 */

var GAME = GAME || {};

// ============================================================
// 🐟 تعريف أنواع الأسماك (6 أنواع)
// ============================================================
GAME.FISH_TYPES = {
  bass: {
    id: 'bass',
    name: 'Bass',
    nameAr: 'باس',
    icon: '🐟',
    difficulty: 0.3,
    value: 15,
    xp: 10,
    time: ['morning', 'afternoon'],
    rarity: 0.4,
    description: 'سمكة شائعة تعيش في المياه العذبة',
    descriptionAr: 'سمكة باس شائعة تعيش في البحيرات والأنهار',
    minLength: 20,
    maxLength: 45,
    weight: { min: 0.5, max: 2.0 }
  },
  trout: {
    id: 'trout',
    name: 'Trout',
    nameAr: 'تروت',
    icon: '🐠',
    difficulty: 0.4,
    value: 20,
    xp: 15,
    time: ['morning', 'evening'],
    rarity: 0.3,
    description: 'سمكة سريعة تفضل المياه الباردة',
    descriptionAr: 'سمكة تروت سريعة تفضل المياه الباردة والصافية',
    minLength: 25,
    maxLength: 50,
    weight: { min: 0.8, max: 3.0 }
  },
  salmon: {
    id: 'salmon',
    name: 'Salmon',
    nameAr: 'سلمون',
    icon: '🐡',
    difficulty: 0.5,
    value: 30,
    xp: 20,
    time: ['afternoon'],
    rarity: 0.2,
    description: 'سمكة فاخرة تهاجر عبر الأنهار',
    descriptionAr: 'سمكة سلمون فاخرة تهاجر عبر الأنهار للتكاثر',
    minLength: 30,
    maxLength: 60,
    weight: { min: 1.5, max: 5.0 }
  },
  tuna: {
    id: 'tuna',
    name: 'Tuna',
    nameAr: 'تونا',
    icon: '🐋',
    difficulty: 0.6,
    value: 40,
    xp: 25,
    time: ['night'],
    rarity: 0.15,
    description: 'سمكة كبيرة وقوية تعيش في أعماق البحر',
    descriptionAr: 'سمكة تونا كبيرة وقوية تعيش في أعماق المحيط',
    minLength: 50,
    maxLength: 100,
    weight: { min: 5.0, max: 20.0 }
  },
  catfish: {
    id: 'catfish',
    name: 'Catfish',
    nameAr: 'سلور',
    icon: '🐱',
    difficulty: 0.7,
    value: 50,
    xp: 30,
    time: ['night', 'morning'],
    rarity: 0.1,
    description: 'سمكة ليلية صعبة الإمساك',
    descriptionAr: 'سمكة سلور ليلية صعبة الإمساك تعيش في القاع',
    minLength: 35,
    maxLength: 70,
    weight: { min: 2.0, max: 8.0 }
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary Fish',
    nameAr: 'السمكة الأسطورية',
    icon: '👑',
    difficulty: 0.9,
    value: 100,
    xp: 50,
    time: ['night'],
    rarity: 0.05,
    description: 'سمكة نادرة جداً وأسطورية',
    descriptionAr: 'سمكة أسطورية نادرة جداً لا يمسكها إلا المحترفون',
    minLength: 80,
    maxLength: 150,
    weight: { min: 10.0, max: 30.0 }
  }
};

// ============================================================
// 🎣 نظام الصيد الرئيسي
// ============================================================
GAME.FishingSystem = {
  // === المتغيرات الأساسية ===
  isFishing: false,           // هل يستعد للصيد
  isCatching: false,          // هل في مرحلة الإمساك
  currentFish: null,          // السمكة الحالية
  biteTime: 0,                // وقت العضة (ثوانٍ)
  catchWindow: 0,             // نافذة الإمساك (ثوانٍ)
  catchTimer: 0,              // عداد نافذة الإمساك
  energyCost: 5,              // تكلفة الطاقة لكل محاولة

  // === معلومات الصيد ===
  fishingRod: 'basic',       // نوع الصنبورة
  bait: null,                 // نوع الطُعم
  lastCatchTime: 0,          // آخر وقت صيد

  // === الإحصائيات ===
  stats: {
    totalAttempts: 0,        // محاولات الصيد الكلي
    totalCatches: 0,         // الأسماك المصادة
    totalFailed: 0,          // المحاولات الفاشلة
    bestFish: null,          // أفضل سمكة
    bestValue: 0,            // أعلى قيمة
    fishCaught: {},          // عدد كل نوع من الأسماك
    totalValue: 0,           // إجمالي قيمة الأسماك المصادة
    totalXP: 0,              // إجمالي XP المحصل
    currentStreak: 0,        // سلسلة الصيد الحالية
    bestStreak: 0            // أفضل سلسلة
  },

  // === UI ===
  uiElement: null,
  promptElement: null,
  initialized: false,

  // ============================================================
  // 🚀 التهيئة
  // ============================================================
  init: function(game) {
    this.game = game || GAME.game;
    this.isFishing = false;
    this.isCatching = false;
    this.currentFish = null;
    this.biteTime = 0;
    this.catchWindow = 0;
    this.catchTimer = 0;
    this.lastCatchTime = 0;

    // إعادة تعيين الإحصائيات
    this.stats = {
      totalAttempts: 0,
      totalCatches: 0,
      totalFailed: 0,
      bestFish: null,
      bestValue: 0,
      fishCaught: {},
      totalValue: 0,
      totalXP: 0,
      currentStreak: 0,
      bestStreak: 0
    };

    // تهيئة عداد الأسماك
    for (var fishKey in GAME.FISH_TYPES) {
      if (GAME.FISH_TYPES.hasOwnProperty(fishKey)) {
        this.stats.fishCaught[fishKey] = 0;
      }
    }

    // ربط المفاتيح
    this.setupInput();

    this.initialized = true;
    console.log('[FishingSystem] ✅ تم التهيئة - ' + Object.keys(GAME.FISH_TYPES).length + ' نوع سمكة');
    console.log('[FishingSystem] 🎣 منطقة الصيد: Beach | تكلفة الطاقة: ' + this.energyCost);
  },

  // ============================================================
  // 🔄 التحديث (يُستدعى كل frame)
  // ============================================================
  update: function(deltaTime) {
    if (!this.initialized) return;

    // تحديث عداد العضة
    if (this.isFishing && !this.isCatching) {
      this.biteTime -= deltaTime;
      if (this.biteTime <= 0) {
        this.fishBite();
      }
    }

    // تحديث نافذة الإمساك
    if (this.isCatching) {
      this.catchTimer -= deltaTime;
      if (this.catchTimer <= 0) {
        this.catchFailed();
      }
    }
  },

  // ============================================================
  // 🎣 بدء الصيد
  // ============================================================
  startFishing: function() {
    // التحقق من عدم وجود صيد نشط
    if (this.isFishing || this.isCatching) {
      return { success: false, message: '🎣 أنت بالفعل تستعد للصيد!' };
    }

    // التحقق من الطاقة
    var state = this.game ? this.game.state : null;
    if (state && state.energy !== undefined && state.energy < this.energyCost) {
      return { success: false, message: '⚡ طاقة غير كافية! المطلوب: ' + this.energyCost + ' | المتوفر: ' + Math.floor(state.energy) };
    }

    // خصم الطاقة
    if (state && state.energy !== undefined) {
      state.energy -= this.energyCost;
    }

    // بدء الصيد
    this.isFishing = true;
    this.biteTime = 2 + Math.random() * 4; // 2-6 ثوانٍ للعضة
    this.stats.totalAttempts++;

    // عرض واجهة الصيد
    this.showFishingUI('🎣 جاري الانتظار...');

    console.log('[FishingSystem] 🎣 بدأ الصيد - وقت العضة: ' + this.biteTime.toFixed(1) + ' ثانية');

    return {
      success: true,
      message: '🎣 جاري الانتظار لعضة السمكة...',
      biteTimeEstimate: this.biteTime.toFixed(1)
    };
  },

  // ============================================================
  // 🐟 عضة السمكة
  // ============================================================
  fishBite: function() {
    // اختيار سمكة بناءً على الوقت والصدفة
    this.currentFish = this.selectFish();

    if (!this.currentFish) {
      this.showFishingUI('❌ لا توجد أسماك في هذا الوقت');
      this.isFishing = false;
      return;
    }

    // حساب نافذة الإمساك (أصغر كلما زادت الصعوبة)
    this.catchWindow = 2 - (this.currentFish.difficulty * 1.5);
    this.catchTimer = this.catchWindow;
    this.isCatching = true;

    // عرض موجز الإمساك
    this.showCatchPrompt();

    console.log('[FishingSystem] 🐟 عضة! السمكة: ' + this.currentFish.nameAr + ' | صعوبة: ' + this.currentFish.difficulty + ' | نافذة: ' + this.catchWindow.toFixed(2) + ' ثانية');
  },

  // ============================================================
  // ✅ الإمساك بالسمكة
  // ============================================================
  catchFish: function() {
    if (!this.isCatching || !this.currentFish) {
      return { success: false, message: '❌ لا يوجد سمكة للإمساك' };
    }

    // حساب جودة الإمساك بناءً على السرعة
    var speedRatio = this.catchTimer / this.catchWindow;
    var quality = this.calculateQuality(speedRatio);

    // إنشاء سمكة مصادة
    var caughtFish = this.createCaughtFish(quality);

    // إضافة للإحصائيات
    this.stats.totalCatches++;
    this.stats.totalValue += caughtFish.value;
    this.stats.totalXP += caughtFish.xp;
    this.stats.currentStreak++;

    if (this.stats.currentStreak > this.stats.bestStreak) {
      this.stats.bestStreak = this.stats.currentStreak;
    }

    // تحديث أفضل سمكة
    if (caughtFish.value > this.stats.bestValue) {
      this.stats.bestValue = caughtFish.value;
      this.stats.bestFish = caughtFish.id;
    }

    // تحديث عدد الأسماك المصادة
    this.stats.fishCaught[caughtFish.id] = (this.stats.fishCaught[caughtFish.id] || 0) + 1;

    // إضافة للخزينة
    var state = this.game ? this.game.state : null;
    if (state && state.inventory) {
      var fishKey = 'fish_' + caughtFish.id;
      state.inventory[fishKey] = (state.inventory[fishKey] || 0) + 1;
    }

    // إضافة XP
    if (state && state.xp !== undefined) {
      state.xp += caughtFish.xp;
    }

    // إضافة للسوق إذا كان متاحاً
    if (GAME.EconomySystem && GAME.EconomySystem.addXP) {
      GAME.EconomySystem.addXP(caughtFish.xp);
    }

    // عرض النتيجة
    this.showCatchSuccess(caughtFish);

    // إعادة تعيين الحالة
    this.isFishing = false;
    this.isCatching = false;
    this.currentFish = null;
    this.catchTimer = 0;
    this.lastCatchTime = Date.now();

    console.log('[FishingSystem] ✅ تم الإمساك بـ ' + caughtFish.qualityName + ' ' + this.currentFish.nameAr);
    console.log('[FishingSystem] 📊 القيمة: ' + caughtFish.value + ' | XP: ' + caughtFish.xp);

    return {
      success: true,
      message: '✅ تم الإمساك بـ ' + caughtFish.qualityName + ' ' + this.currentFish.nameAr + '!',
      fish: caughtFish,
      quality: quality,
      streak: this.stats.currentStreak
    };
  },

  // ============================================================
  // ❌ فشل الإمساك
  // ============================================================
  catchFailed: function() {
    this.stats.totalFailed++;
    this.stats.currentStreak = 0;

    this.showCatchFailed();

    // إعادة تعيين الحالة
    this.isFishing = false;
    this.isCatching = false;
    this.currentFish = null;
    this.catchTimer = 0;

    console.log('[FishingSystem] ❌ فشل الإمساك! السماكة هربت');

    return {
      success: false,
      message: '❌ فشل الإمساك! السمكة هربت',
      streak: 0
    };
  },

  // ============================================================
  // ⏹️ إلغاء الصيد
  // ============================================================
  cancelFishing: function() {
    if (!this.isFishing && !this.isCatching) {
      return { success: false, message: '❌ أنت لا تستعد للصيد' };
    }

    this.isFishing = false;
    this.isCatching = false;
    this.currentFish = null;
    this.biteTime = 0;
    this.catchWindow = 0;
    this.catchTimer = 0;

    this.hideFishingUI();

    console.log('[FishingSystem] ⏹️ تم إلغاء الصيد');

    return {
      success: true,
      message: '⏹️ تم إلغاء الصيد'
    };
  },

  // ============================================================
  // 🐟 اختيار سمكة بناءً على الوقت والصدفة
  // ============================================================
  selectFish: function() {
    var currentTime = this.getCurrentTimeOfDay();
    var eligibleFish = [];

    // جمع الأسماك المتاحة في الوقت الحالي
    for (var fishKey in GAME.FISH_TYPES) {
      if (!GAME.FISH_TYPES.hasOwnProperty(fishKey)) continue;
      var fish = GAME.FISH_TYPES[fishKey];

      if (fish.time.indexOf(currentTime) !== -1) {
        eligibleFish.push(fish);
      }
    }

    if (eligibleFish.length === 0) {
      return null;
    }

    // اختيار عشوائي بناءً على الصدفة
    var totalRarity = 0;
    for (var i = 0; i < eligibleFish.length; i++) {
      totalRarity += eligibleFish[i].rarity;
    }

    var random = Math.random() * totalRarity;
    var cumulative = 0;

    for (var j = 0; j < eligibleFish.length; j++) {
      cumulative += eligibleFish[j].rarity;
      if (random <= cumulative) {
        return eligibleFish[j];
      }
    }

    // العودة بأول سمكة كخيار افتراضي
    return eligibleFish[0];
  },

  // ============================================================
  // ⏰ جلب الوقت الحالي من TimeSystem
  // ============================================================
  getCurrentTimeOfDay: function() {
    var timeSystem = GAME.TimeSystem;

    if (timeSystem && timeSystem.getTimeOfDay) {
      return timeSystem.getTimeOfDay();
    }

    if (timeSystem && timeSystem.timeOfDay) {
      return timeSystem.timeOfDay;
    }

    // قيمة افتراضية
    return 'morning';
  },

  // ============================================================
  // ⭐ حساب جودة الإمساك
  // ============================================================
  calculateQuality: function(speedRatio) {
    if (speedRatio > 0.8) {
      return { tier: 'iridium', nameAr: 'إيريديوم', multiplier: 4 };
    } else if (speedRatio > 0.6) {
      return { tier: 'gold', nameAr: 'ذهبية', multiplier: 3 };
    } else if (speedRatio > 0.4) {
      return { tier: 'silver', nameAr: 'فضية', multiplier: 2 };
    } else {
      return { tier: 'normal', nameAr: 'عادية', multiplier: 1 };
    }
  },

  // ============================================================
  // 🐟 إنشاء سمكة مصادة
  // ============================================================
  createCaughtFish: function(quality) {
    var fish = this.currentFish;
    var length = fish.minLength + Math.random() * (fish.maxLength - fish.minLength);
    var weight = fish.weight.min + Math.random() * (fish.weight.max - fish.weight.min);

    return {
      id: fish.id,
      name: fish.name,
      nameAr: fish.nameAr,
      icon: fish.icon,
      quality: quality.tier,
      qualityName: quality.nameAr,
      qualityMultiplier: quality.multiplier,
      length: Math.round(length * 10) / 10,
      weight: Math.round(weight * 100) / 100,
      value: Math.round(fish.value * quality.multiplier * (1 + weight / 10)),
      xp: Math.round(fish.xp * quality.multiplier),
      caughtAt: Date.now(),
      timeOfDay: this.getCurrentTimeOfDay()
    };
  },

  // ============================================================
  // 🎮 ربط المفاتيح
  // ============================================================
  setupInput: function() {
    var self = this;

    document.addEventListener('keydown', function(e) {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();

        // إذا كان يستعد للصيد → لا نفعل شيء (ينتظر العضة)
        if (self.isFishing && !self.isCatching) {
          return;
        }

        // إذا كانت هناك عضة → محاولة الإمساك
        if (self.isCatching) {
          self.catchFish();
          return;
        }
      }

      // Escape للإلغاء
      if (e.code === 'Escape') {
        if (self.isFishing || self.isCatching) {
          self.cancelFishing();
        }
      }
    });

    console.log('[FishingSystem] 🎮 تم ربط المفاتيح: Space للصيد/الإمساك | Escape للإلغاء');
  },

  // ============================================================
  // 📊 جلب معلومات السمكة المحددة
  // ============================================================
  getFishInfo: function(fishId) {
    return GAME.FISH_TYPES[fishId] || null;
  },

  // ============================================================
  // 📋 جلب جميع أنواع الأسماك
  // ============================================================
  getAllFishTypes: function() {
    var result = [];
    for (var key in GAME.FISH_TYPES) {
      if (GAME.FISH_TYPES.hasOwnProperty(key)) {
        result.push(GAME.FISH_TYPES[key]);
      }
    }
    return result;
  },

  // ============================================================
  // 📋 جلب الأسماك المتاحة في وقت معين
  // ============================================================
  getAvailableFish: function(timeOfDay) {
    timeOfDay = timeOfDay || this.getCurrentTimeOfDay();
    var result = [];

    for (var key in GAME.FISH_TYPES) {
      if (!GAME.FISH_TYPES.hasOwnProperty(key)) continue;
      var fish = GAME.FISH_TYPES[key];
      if (fish.time.indexOf(timeOfDay) !== -1) {
        result.push(fish);
      }
    }

    return result;
  },

  // ============================================================
  // 🎣 تغيير الصنبورة
  // ============================================================
  setFishingRod: function(rodType) {
    var validRods = ['basic', 'steel', 'gold', 'iridium'];
    if (validRods.indexOf(rodType) === -1) {
      return { success: false, message: '❌ نوع صنبورة غير صالح' };
    }

    this.fishingRod = rodType;

    // تعديل تكلفة الطاقة بناءً على الصنبورة
    var energyCosts = {
      'basic': 5,
      'steel': 4,
      'gold': 3,
      'iridium': 2
    };
    this.energyCost = energyCosts[rodType] || 5;

    console.log('[FishingSystem] 🎣 تم تغيير الصنبورة إلى: ' + rodType + ' | تكلفة الطاقة: ' + this.energyCost);

    return {
      success: true,
      message: '🎣 تم تغيير الصنبورة إلى ' + rodType,
      energyCost: this.energyCost
    };
  },

  // ============================================================
  // 🪱 تغيير الطُعم
  // ============================================================
  setBait: function(baitType) {
    var validBaits = ['none', 'worm', 'cricket', 'magic'];
    if (validBaits.indexOf(baitType) === -1) {
      return { success: false, message: '❌ نوع طعم غير صالح' };
    }

    this.bait = baitType === 'none' ? null : baitType;

    console.log('[FishingSystem] 🪱 تم تغيير الطعم إلى: ' + (this.bait || 'بدون'));

    return {
      success: true,
      message: '🪱 تم تغيير الطعم إلى ' + (this.bait || 'بدون'),
      bait: this.bait
    };
  },

  // ============================================================
  // 📊 إحصائيات الصيد
  // ============================================================
  getStats: function() {
    var catchRate = this.stats.totalAttempts > 0
      ? Math.round((this.stats.totalCatches / this.stats.totalAttempts) * 100)
      : 0;

    return {
      totalAttempts: this.stats.totalAttempts,
      totalCatches: this.stats.totalCatches,
      totalFailed: this.stats.totalFailed,
      catchRate: catchRate + '%',
      bestFish: this.stats.bestFish ? GAME.FISH_TYPES[this.stats.bestFish] : null,
      bestValue: this.stats.bestValue,
      currentStreak: this.stats.currentStreak,
      bestStreak: this.stats.bestStreak,
      totalValue: this.stats.totalValue,
      totalXP: this.stats.totalXP,
      fishCaught: this.stats.fishCaught
    };
  },

  // ============================================================
  // 🎣 واجهة الصيد
  // ============================================================
  showFishingUI: function(message) {
    // إنشاء أو تحديث واجهة الصيد
    if (!this.uiElement) {
      this.uiElement = document.createElement('div');
      this.uiElement.id = 'fishing-ui';
      this.uiElement.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#4FC3F7;padding:20px 40px;border-radius:12px;font-size:18px;z-index:1000;text-align:center;border:2px solid #4FC3F7;min-width:300px;';
      document.body.appendChild(this.uiElement);
    }

    this.uiElement.textContent = message || '🎣 اضغط Space للصيد';
    this.uiElement.style.display = 'block';
  },

  // ============================================================
  // ⚡ موجز الإمساك
  // ============================================================
  showCatchPrompt: function() {
    if (!this.uiElement) return;

    this.uiElement.textContent = '';

    // عنوان السمكة
    var title = document.createElement('div');
    title.style.cssText = 'font-size:24px;margin-bottom:10px;color:#FFD700;';
    title.textContent = this.currentFish.icon + ' ' + this.currentFish.nameAr + '!';
    this.uiElement.appendChild(title);

    // موجز الإمساك
    var prompt = document.createElement('div');
    prompt.style.cssText = 'font-size:16px;color:#81C784;margin-bottom:10px;';
    prompt.textContent = '⚡ اضغط Space الآن!';
    this.uiElement.appendChild(prompt);

    // شريط التقدم
    var progressBar = document.createElement('div');
    progressBar.id = 'fishing-progress';
    progressBar.style.cssText = 'width:100%;height:8px;background:#333;border-radius:4px;overflow:hidden;';
    progressBar.textContent = '<div id="fishing-progress-bar" style="width:100%;height:100%;background:#4FC3F7;transition:width 0.1s linear;"></div>';
    this.uiElement.appendChild(progressBar);

    // معلومات الصعوبة
    var info = document.createElement('div');
    info.style.cssText = 'font-size:12px;color:#B0BEC5;margin-top:10px;';
    info.textContent = 'الصعوبة: ' + (this.currentFish.difficulty * 100).toFixed(0) + '% | القيمة: ' + this.currentFish.value;
    this.uiElement.appendChild(info);

    this.uiElement.style.display = 'block';

    // تحديث شريط التقدم
    this.updateProgressBar();
  },

  // ============================================================
  // 📊 تحديث شريط التقدم
  // ============================================================
  updateProgressBar: function() {
    var self = this;
    var progressBar = document.getElementById('fishing-progress-bar');
    if (!progressBar) return;

    var updateInterval = setInterval(function() {
      if (!self.isCatching || self.catchTimer <= 0) {
        clearInterval(updateInterval);
        return;
      }

      var percentage = (self.catchTimer / self.catchWindow) * 100;
      progressBar.style.width = Math.max(0, percentage) + '%';

      // تغيير اللون حسب الوقت المتبقي
      if (percentage > 60) {
        progressBar.style.background = '#4FC3F7';
      } else if (percentage > 30) {
        progressBar.style.background = '#FFB74D';
      } else {
        progressBar.style.background = '#E53935';
      }
    }, 50);
  },

  // ============================================================
  // ✅ عرض نجاح الإمساك
  // ============================================================
  showCatchSuccess: function(fish) {
    if (!this.uiElement) return;

    this.uiElement.textContent = '';

    // أيقونة النجاح
    var icon = document.createElement('div');
    icon.style.cssText = 'font-size:48px;margin-bottom:10px;';
    icon.textContent = fish.icon;
    this.uiElement.appendChild(icon);

    // اسم السمكة
    var title = document.createElement('div');
    title.style.cssText = 'font-size:24px;margin-bottom:5px;color:#FFD700;';
    title.textContent = '✅ تم الإمساك!';
    this.uiElement.appendChild(title);

    // تفاصيل السمكة
    var details = document.createElement('div');
    details.style.cssText = 'font-size:18px;margin-bottom:10px;';
    details.textContent = fish.qualityName + ' ' + fish.nameAr;
    this.uiElement.appendChild(details);

    // المقاسات
    var stats = document.createElement('div');
    stats.style.cssText = 'font-size:14px;color:#B0BEC5;margin-bottom:10px;';
    stats.textContent = 'الطول: ' + fish.length + ' سم | الوزن: ' + fish.weight + ' كجم';
    this.uiElement.appendChild(stats);

    // القيمة والـ XP
    var rewards = document.createElement('div');
    rewards.style.cssText = 'font-size:16px;color:#81C784;';
    rewards.textContent = '💰 ' + fish.value + ' | ⭐ ' + fish.xp + ' XP';
    this.uiElement.appendChild(rewards);

    // السلسلة
    if (this.stats.currentStreak > 1) {
      var streak = document.createElement('div');
      streak.style.cssText = 'font-size:14px;color:#FFB74D;margin-top:10px;';
      streak.textContent = '🔥 سلسلة: ' + this.stats.currentStreak;
      this.uiElement.appendChild(streak);
    }

    this.uiElement.style.display = 'block';

    // إخفاء بعد 3 ثوانٍ
    var self = this;
    setTimeout(function() {
      self.hideFishingUI();
    }, 3000);
  },

  // ============================================================
  // ❌ عرض فشل الإمساك
  // ============================================================
  showCatchFailed: function() {
    if (!this.uiElement) return;

    this.uiElement.textContent = '';

    // أيقونة الفشل
    var icon = document.createElement('div');
    icon.style.cssText = 'font-size:48px;margin-bottom:10px;';
    icon.textContent = '💨';
    this.uiElement.appendChild(icon);

    // رسالة الفشل
    var title = document.createElement('div');
    title.style.cssText = 'font-size:24px;margin-bottom:10px;color:#E53935;';
    title.textContent = '❌ فشل الإمساك!';
    this.uiElement.appendChild(title);

    var message = document.createElement('div');
    message.style.cssText = 'font-size:16px;color:#B0BEC5;';
    message.textContent = 'السمكة هربت... حاول مرة أخرى!';
    this.uiElement.appendChild(message);

    this.uiElement.style.display = 'block';

    // إخفاء بعد ثانيتين
    var self = this;
    setTimeout(function() {
      self.hideFishingUI();
    }, 2000);
  },

  // ============================================================
  // 🙈 إخفاء واجهة الصيد
  // ============================================================
  hideFishingUI: function() {
    if (this.uiElement) {
      this.uiElement.style.display = 'none';
    }
  },

  // ============================================================
  // 💾 حفظ حالة نظام الصيد
  // ============================================================
  saveState: function() {
    return {
      fishingRod: this.fishingRod,
      bait: this.bait,
      energyCost: this.energyCost,
      stats: JSON.parse(JSON.stringify(this.stats)),
      lastCatchTime: this.lastCatchTime
    };
  },

  // ============================================================
  // 📂 تحميل حالة نظام الصيد
  // ============================================================
  loadState: function(savedData) {
    if (!savedData) return false;

    // استعادة الإعدادات
    if (savedData.fishingRod) this.fishingRod = savedData.fishingRod;
    if (savedData.bait) this.bait = savedData.bait;
    if (savedData.energyCost) this.energyCost = savedData.energyCost;
    if (savedData.lastCatchTime) this.lastCatchTime = savedData.lastCatchTime;

    // استعادة الإحصائيات
    if (savedData.stats) {
      this.stats = savedData.stats;
    }

    console.log('[FishingSystem] 📂 تم تحميل الحالة - محاولات: ' + this.stats.totalAttempts + ' | نجاح: ' + this.stats.totalCatches);
    return true;
  }
};

console.log('[FishingSystem] 🎣 تم تعريف النظام - ' + Object.keys(GAME.FISH_TYPES).length + ' نوع سمكة');
