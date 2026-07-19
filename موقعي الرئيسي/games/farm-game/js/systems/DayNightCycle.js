/**
 * DayNightCycle.js - نظام الدورة النهارية والليلية المتقدم
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - 6 فترات زمنية: dawn, morning, noon, afternoon, dusk, night
 * - تدرجات ألوان السماء لكل فترة مع انتقالات سلسة
 * - تأثير على النباتات والحيوانات (نمو، نشاط، إنتاج)
 * - NPC schedule بناءً على الوقت
 * - أحداث خاصة ببعض الأوقات (sunrise events, midnight events)
 * - تكامل مع TimeSystem, FarmingSystem, AnimalsSystem, NPCsSystem
 * - حفظ وتحميل من localStorage
 */

var GAME = GAME || {};

GAME.DayNightCycle = {
  // ══════════════════════════════════════════════════════
  // ⏱️ الحالة الأساسية
  // ══════════════════════════════════════════════════════
  initialized: false,
  enabled: true,

  // ══════════════════════════════════════════════════════
  // 🌅 تعريف الفترات الزمنية (6 فترات)
  // ══════════════════════════════════════════════════════
  periods: {
    dawn: {
      name: 'Dawn',
      nameAr: 'الفجر',
      startHour: 5,
      endHour: 7,
      skyColor: 0xffa07a,       // سلمون فاتح
      skyColorEnd: 0xffd700,    // ذهبي
      ambientColor: 0xffe4b5,
      ambientIntensity: 0.4,
      sunColor: 0xff8c00,
      sunIntensity: 0.3,
      sunAngle: 10,
      fogDensity: 0.03,
      starVisibility: 0.3,
      temperature: 12,
      humidity: 0.7,
      description: 'بداية اليوم مع شروق الشمس',
      descriptionAr: 'بداية اليوم مع شروق الشمس'
    },
    morning: {
      name: 'Morning',
      nameAr: 'الصباح',
      startHour: 7,
      endHour: 11,
      skyColor: 0x87ceeb,
      skyColorEnd: 0x00bfff,
      ambientColor: 0xffffff,
      ambientIntensity: 0.6,
      sunColor: 0xffffff,
      sunIntensity: 0.7,
      sunAngle: 35,
      fogDensity: 0.015,
      starVisibility: 0,
      temperature: 18,
      humidity: 0.5,
      description: 'أفضل وقت للعمل في المزرعة',
      descriptionAr: 'أفضل وقت للعمل في المزرعة'
    },
    noon: {
      name: 'Noon',
      nameAr: 'الظهيرة',
      startHour: 11,
      endHour: 14,
      skyColor: 0x00bfff,
      skyColorEnd: 0x1e90ff,
      ambientColor: 0xfff8dc,
      ambientIntensity: 0.8,
      sunColor: 0xfff8dc,
      sunIntensity: 1.0,
      sunAngle: 85,
      fogDensity: 0.01,
      starVisibility: 0,
      temperature: 28,
      humidity: 0.3,
      description: 'أقصى شدة للشمس -ระวوا الحرارة',
      descriptionAr: 'أقصى شدة للشمس - اระวوا الحرارة'
    },
    afternoon: {
      name: 'Afternoon',
      nameAr: 'بعد الظهر',
      startHour: 14,
      endHour: 17,
      skyColor: 0x87ceeb,
      skyColorEnd: 0xfa8072,
      ambientColor: 0xffdead,
      ambientIntensity: 0.6,
      sunColor: 0xffa500,
      sunIntensity: 0.8,
      sunAngle: 55,
      fogDensity: 0.012,
      starVisibility: 0,
      temperature: 25,
      humidity: 0.4,
      description: 'وقت جيد لリلاحي الحيوانات',
      descriptionAr: 'وقت جيد لリلاحي الحيوانات'
    },
    dusk: {
      name: 'Dusk',
      nameAr: 'المغرب',
      startHour: 17,
      endHour: 19,
      skyColor: 0xff6347,
      skyColorEnd: 0x4b0082,
      ambientColor: 0xff7f50,
      ambientIntensity: 0.4,
      sunColor: 0xff4500,
      sunIntensity: 0.4,
      sunAngle: 15,
      fogDensity: 0.025,
      starVisibility: 0.5,
      temperature: 20,
      humidity: 0.6,
      description: 'غروب الشمس وبداية الليل',
      descriptionAr: 'غروب الشمس وبداية الليل'
    },
    night: {
      name: 'Night',
      nameAr: 'الليل',
      startHour: 19,
      endHour: 5,
      skyColor: 0x191970,
      skyColorEnd: 0x0a0a2e,
      ambientColor: 0x1a1a4e,
      ambientIntensity: 0.2,
      sunColor: 0x4169e1,
      sunIntensity: 0.0,
      sunAngle: -20,
      fogDensity: 0.04,
      starVisibility: 1.0,
      temperature: 10,
      humidity: 0.8,
      description: 'وقت الراحة والنوم',
      descriptionAr: 'وقت الراحة والنوم'
    }
  },

  // ══════════════════════════════════════════════════════
  // 👥 جداول NPC حسب الفترة
  // ══════════════════════════════════════════════════════
  npcSchedules: {
    dawn: {
      active: ['farmer', 'animals'],
      sleepState: 'waking_up',
      description: 'ال farmers يستيقظون ويجهزون الحيوانات',
      descriptionAr: 'المزارعون يستيقظون ويجهزون الحيوانات'
    },
    morning: {
      active: ['farmer', 'merchant', 'animals'],
      sleepState: 'working',
      description: 'وقت العمل الرئيسي -المتاجر مفتوحة',
      descriptionAr: 'وقت العمل الرئيسي -المتاجر مفتوحة'
    },
    noon: {
      active: ['merchant', 'animals'],
      sleepState: 'resting',
      description: 'استراحة الغداء - بعض المتاجر تغلق',
      descriptionAr: 'استراحة الغداء - بعض المتاجر تغلق'
    },
    afternoon: {
      active: ['farmer', 'merchant', 'animals', 'fisherman'],
      sleepState: 'working',
      description: 'فترة عمل ثانية - الصيادون ينشطون',
      descriptionAr: 'فترة عمل ثانية - الصيادون ينشطون'
    },
    dusk: {
      active: ['farmer', 'animals'],
      sleepState: 'going_home',
      description: 'العودة للبيت وإطعام الحيوانات',
      descriptionAr: 'العودة للبيت وإطعام الحيوانات'
    },
    night: {
      active: [],
      sleepState: 'sleeping',
      description: 'الجميع نائم - بعض الحيوانات الليلية تنشط',
      descriptionAr: 'الجميع نائم - بعض الحيوانات الليلية تنشط'
    }
  },

  // ══════════════════════════════════════════════════════
  // 🌱 تأثيرات الفترة على النباتات
  // ══════════════════════════════════════════════════════
  cropEffects: {
    dawn: {
      growthMultiplier: 1.2,
      waterNeed: 0.8,
      sunlightNeeded: true,
      description: 'نمو ممتاز بفضل الرطوبة العالية'
    },
    morning: {
      growthMultiplier: 1.5,
      waterNeed: 1.0,
      sunlightNeeded: true,
      description: 'أفضل وقت للنمو - ضوء كافٍ'
    },
    noon: {
      growthMultiplier: 0.8,
      waterNeed: 1.5,
      sunlightNeeded: true,
      description: 'خطر الجفاف - يحتاج ري إضافي'
    },
    afternoon: {
      growthMultiplier: 1.2,
      waterNeed: 1.2,
      sunlightNeeded: true,
      description: 'نمو جيد مع مراقبة الرطوبة'
    },
    dusk: {
      growthMultiplier: 0.5,
      waterNeed: 0.5,
      sunlightNeeded: false,
      description: 'توقف تدريجي عن النمو'
    },
    night: {
      growthMultiplier: 0.1,
      waterNeed: 0.3,
      sunlightNeeded: false,
      description: 'rest period - نمو بطيء جداً'
    }
  },

  // ══════════════════════════════════════════════════════
  // 🐄 تأثيرات الفترة على الحيوانات
  // ══════════════════════════════════════════════════════
  animalEffects: {
    dawn: {
      happiness: 1.1,
      productivity: 1.0,
      activity: 'waking_up',
      description: 'الحيوانات تستيقظ'
    },
    morning: {
      happiness: 1.3,
      productivity: 1.2,
      activity: 'grazing',
      description: 'وقت المراعي والنشاط'
    },
    noon: {
      happiness: 0.8,
      productivity: 0.7,
      activity: 'resting',
      description: 'استراحة من الحر'
    },
    afternoon: {
      happiness: 1.1,
      productivity: 1.0,
      activity: 'feeding',
      description: 'وقت إطعام بعد الظهر'
    },
    dusk: {
      happiness: 1.2,
      productivity: 0.9,
      activity: 'returning_home',
      description: 'العودة إلى الحظائر'
    },
    night: {
      happiness: 1.0,
      productivity: 0.5,
      activity: 'sleeping',
      description: 'وقت النوم'
    }
  },

  // ══════════════════════════════════════════════════════
  // 🎉 أحداث خاصة ببعض الأوقات
  // ══════════════════════════════════════════════════════
  specialEvents: {
    sunrise: {
      triggerHour: 5.5,
      triggerTolerance: 0.25,
      name: 'Sunrise Bonus',
      nameAr: 'مكافأة الشروق',
      description: 'Harvest at dawn for quality bonus',
      descriptionAr: 'احصد عند الفجر لمكافأة جودة',
      effect: { qualityBonus: 1, xpMultiplier: 1.5 },
      oncePerDay: true
    },
    goldenHour: {
      triggerHour: 17.5,
      triggerTolerance: 0.5,
      name: 'Golden Hour',
      nameAr: 'الساعة الذهبية',
      description: 'Special sales prices at dusk',
      descriptionAr: 'أسعار مبيعات خاصة عند المغرب',
      effect: { sellPriceMultiplier: 1.5 },
      oncePerDay: true
    },
    midnightMystery: {
      triggerHour: 0,
      triggerTolerance: 0.5,
      name: 'Midnight Mystery',
      nameAr: 'لغز منتصف الليل',
      description: 'Chance of finding rare items at midnight',
      descriptionAr: 'فرصة للعثور على أ Items نادرة عند منتصف الليل',
      effect: { rareItemChance: 0.1 },
      oncePerDay: true
    },
    noonHeat: {
      triggerHour: 12.5,
      triggerTolerance: 0.5,
      name: 'Noon Heat',
      nameAr: 'حر الظهيرة',
      description: 'Crops need extra water at noon',
      descriptionAr: 'النباتات تحتاج ري إضافي عند الظهيرة',
      effect: { extraWaterNeed: 1.5 },
      oncePerDay: true
    },
    eveningChill: {
      triggerHour: 20,
      triggerTolerance: 1.0,
      name: 'Evening Chill',
      nameAr: 'برودة المساء',
      description: 'Growth slows significantly at night',
      descriptionAr: 'النمو يتباطأ بشكل كبير في الليل',
      effect: { growthPenalty: 0.3 },
      oncePerDay: true
    },
    preDawnDew: {
      triggerHour: 4.5,
      triggerTolerance: 0.5,
      name: 'Pre-Dawn Dew',
      nameAr: 'ندى ما قبل الفجر',
      description: 'Free water on crops before sunrise',
      descriptionAr: 'ماء مجاني على المحاصيل قبل الشروق',
      effect: { freeWater: true },
      oncePerDay: true
    }
  },

  // ══════════════════════════════════════════════════════
  // 🌙 بيانات الفصول للسماء الليلية
  // ══════════════════════════════════════════════════════
  seasonalNightSky: {
    spring: { starCount: 200, moonPhase: 'waxing', meteorChance: 0.05 },
    summer: { starCount: 150, moonPhase: 'full', meteorChance: 0.1 },
    autumn: { starCount: 250, moonPhase: 'waning', meteorChance: 0.08 },
    winter: { starCount: 350, moonPhase: 'new', meteorChance: 0.15 }
  },

  // ══════════════════════════════════════════════════════
  // 📊 الحالة الحالية
  // ══════════════════════════════════════════════════════
  currentPeriod: 'morning',
  previousPeriod: null,
  currentHour: 6,
  transitionProgress: 0,
  isTransitioning: false,
  triggeredEventsToday: {},
  lastPeriodChangeHour: -1,
  periodChangeCallbacks: [],

  // ══════════════════════════════════════════════════════
  // 🔧 الإعدادات المحفوظة
  // ══════════════════════════════════════════════════════
  settings: {
    enabled: true,
    transitionSpeed: 2.0,
    showClock: true,
    showPeriodNotifications: true,
    showSpecialEventNotifications: true,
    nightDarkness: 0.8,
    enableStars: true,
    enableWeatherIntegration: true
  },

  // ══════════════════════════════════════════════════════
  // 🚀 التهيئة
  // ══════════════════════════════════════════════════════
  init: function(game) {
    console.log('[DayNightCycle] 🌅 جاري التهيئة...');

    this.game = game || GAME;
    this.enabled = this.settings.enabled;

    // تحميل الإعدادات المحفوظة
    this._loadSettings();

    // تزامن مع TimeSystem
    this._syncWithTimeSystem();

    // تهيئة الأحداث المفعلة اليوم
    this.triggeredEventsToday = {};

    // تهيئة callbacks
    this.periodChangeCallbacks = [];

    this.initialized = true;
    console.log('[DayNightCycle] ✅ تم التهيئة - الفترة الحالية: ' + this.currentPeriod);
    console.log('[DayNightCycle] 🕐 الوقت: ' + this.getTimeString());
  },

  // ══════════════════════════════════════════════════════
  // 🔄 التحديث الرئيسي
  // ══════════════════════════════════════════════════════
  update: function(dt) {
    if (!this.initialized || !this.enabled) return;

    // تزامن مع TimeSystem كل frame
    this._syncWithTimeSystem();

    // تحديث الفترة الحالية
    var periodChanged = this._updatePeriod();

    // تحديث الإضاءة
    this._updateLighting(dt);

    // تحديث السماء (نجوم، سحب)
    this._updateSky();

    // فحص الأحداث الخاصة
    this._checkSpecialEvents();

    // تحديث تأثيرات النباتات
    this._updateCropEffects();

    // تحديث تأثيرات الحيوانات
    this._updateAnimalEffects();

    // تحديث جدول NPC
    this._updateNPCSchedule();
  },

  // ══════════════════════════════════════════════════════
  // 🔄 التزامن مع TimeSystem
  // ══════════════════════════════════════════════════════
  _syncWithTimeSystem: function() {
    if (GAME.TimeSystem) {
      this.currentHour = GAME.TimeSystem.timeOfDay;
    } else {
      // fallback: تحديث يدوي
      this.currentHour = 6;
    }
  },

  // ══════════════════════════════════════════════════════
  // 🕐 تحديث الفترة الحالية
  // ══════════════════════════════════════════════════════
  _updatePeriod: function() {
    var newPeriod = this._getPeriodForHour(this.currentHour);

    if (newPeriod !== this.currentPeriod) {
      this.previousPeriod = this.currentPeriod;
      this.currentPeriod = newPeriod;
      this.lastPeriodChangeHour = this.currentHour;
      this.isTransitioning = true;
      this.transitionProgress = 0;

      console.log('[DayNightCycle] 🌓 الفترة: ' + this.periods[newPeriod].nameAr + ' (' + this.periods[newPeriod].name + ')');

      // إشعارات تغيير الفترة
      if (this.settings.showPeriodNotifications && GAME.NotificationSystem) {
        var periodData = this.periods[newPeriod];
        GAME.NotificationSystem.show({
          type: 'info',
          title: '☀️ ' + periodData.nameAr,
          message: periodData.descriptionAr,
          icon: this._getPeriodIcon(newPeriod),
          duration: 3000
        });
      }

      // استدعاء callbacks
      this._triggerPeriodChangeCallbacks(newPeriod, this.previousPeriod);

      return true;
    }

    // تحديث تقدم الانتقال
    if (this.isTransitioning) {
      this.transitionProgress += dt * this.settings.transitionSpeed;
      if (this.transitionProgress >= 1) {
        this.transitionProgress = 1;
        this.isTransitioning = false;
      }
    }

    return false;
  },

  // ══════════════════════════════════════════════════════
  // 🔍 تحديد الفترة من الوقت
  // ══════════════════════════════════════════════════════
  _getPeriodForHour: function(hour) {
    // معالجة خاصة لفترة الليل التي تتجاوز منتصف الليل
    if (hour >= 19 || hour < 5) {
      return 'night';
    }

    for (var periodName in this.periods) {
      if (periodName === 'night') continue;
      var period = this.periods[periodName];
      if (hour >= period.startHour && hour < period.endHour) {
        return periodName;
      }
    }

    return 'morning'; // fallback
  },

  // ══════════════════════════════════════════════════════
  // 💡 تحديث الإضاءة
  // ══════════════════════════════════════════════════════
  _updateLighting: function(dt) {
    var period = this.periods[this.currentPeriod];

    // حساب شدة الإضاءة الحالية مع الانتقال السلس
    var targetAmbient = period.ambientIntensity;
    var targetSun = period.sunIntensity;

    // تطبيق الانتقال
    if (this.isTransitioning && this.previousPeriod) {
      var prevPeriod = this.periods[this.previousPeriod];
      var t = this._easeInOutCubic(this.transitionProgress);
      targetAmbient = this._lerp(prevPeriod.ambientIntensity, period.ambientIntensity, t);
      targetSun = this._lerp(prevPeriod.sunIntensity, period.sunIntensity, t);
    }

    // تطبيق على المشهد
    if (this.game && this.game.scene) {
      // تحديث fog
      if (this.game.scene.fog) {
        var targetColor = period.skyColor;
        if (this.isTransitioning && this.previousPeriod) {
          var t = this._easeInOutCubic(this.transitionProgress);
          targetColor = this._lerpColor(this.periods[this.previousPeriod].skyColor, period.skyColor, t);
        }
        this.game.scene.fog.color.setHex(targetColor);
        this.game.scene.fog.density = this._lerp(
          this.game.scene.fog.density,
          period.fogDensity,
          0.02
        );
      }

      // تحديث ambient light
      if (this.game.ambientLight) {
        this.game.ambientLight.intensity = targetAmbient;
        var ambientColor = period.ambientColor;
        if (this.isTransitioning && this.previousPeriod) {
          var t = this._easeInOutCubic(this.transitionProgress);
          ambientColor = this._lerpColor(this.periods[this.previousPeriod].ambientColor, period.ambientColor, t);
        }
        this.game.ambientLight.color.setHex(ambientColor);
      }

      // تحديث sun/directional light
      if (this.game.sun) {
        this.game.sun.intensity = targetSun;
        var sunColor = period.sunColor;
        if (this.isTransitioning && this.previousPeriod) {
          var t = this._easeInOutCubic(this.transitionProgress);
          sunColor = this._lerpColor(this.periods[this.previousPeriod].sunColor, period.sunColor, t);
        }
        this.game.sun.color.setHex(sunColor);

        // تحريك زاوية الشمس
        var sunAngle = period.sunAngle;
        if (this.game.sun.position) {
          var rad = (sunAngle * Math.PI) / 180;
          this.game.sun.position.y = Math.sin(rad) * 100;
          this.game.sun.position.z = Math.cos(rad) * 100;
        }
      }
    }

    // تحديث skybox color
    this._updateSkybox(period);
  },

  // ══════════════════════════════════════════════════════
  // 🌌 تحديث السماء (نجوم، سحب، moon)
  // ══════════════════════════════════════════════════════
  _updateSky: function() {
    if (!this.game || !this.game.scene) return;

    var period = this.periods[this.currentPeriod];
    var starVisibility = period.starVisibility;

    // تطبيق رؤية النجوم
    if (this.game.stars && this.settings.enableStars) {
      this.game.stars.visible = starVisibility > 0.1;
      if (this.game.stars.material) {
        this.game.stars.material.opacity = starVisibility;
      }
    }

    // تحديث phase القمر بناءً على الموسم
    if (this.game.moon && GAME.TimeSystem) {
      var season = GAME.TimeSystem.season || 'spring';
      var nightSky = this.seasonalNightSky[season];
      // يمكن إضافة منطق تحديث القمر هنا
    }

    // تحديث سحب WeatherSystem
    if (this.settings.enableWeatherIntegration && GAME.WeatherSystem) {
      // WeatherSystem يتعامل مع السحب بشكل منفصل
    }
  },

  // ══════════════════════════════════════════════════════
  // 🎉 فحص الأحداث الخاصة
  // ══════════════════════════════════════════════════════
  _checkSpecialEvents: function() {
    for (var eventName in this.specialEvents) {
      var event = this.specialEvents[eventName];

      // فحص إذا كان الحدث مفعلاً اليوم
      if (event.oncePerDay && this.triggeredEventsToday[eventName]) {
        continue;
      }

      // فحص الوقت
      var distance = Math.abs(this.currentHour - event.triggerHour);
      if (distance <= event.triggerTolerance) {
        this._triggerSpecialEvent(eventName, event);
      }
    }
  },

  // ══════════════════════════════════════════════════════
  // 🎯 تفعيل حدث خاص
  // ══════════════════════════════════════════════════════
  _triggerSpecialEvent: function(eventName, event) {
    this.triggeredEventsToday[eventName] = true;

    console.log('[DayNightCycle] 🎉 حدث خاص: ' + event.nameAr);

    // إشعار
    if (this.settings.showSpecialEventNotifications && GAME.NotificationSystem) {
      GAME.NotificationSystem.show({
        type: 'special',
        title: '✨ ' + event.nameAr,
        message: event.descriptionAr,
        icon: '🎉',
        duration: 4000
      });
    }

    // تطبيق تأثيرات الحدث
    this._applyEventEffects(event.effect);

    // إنجازات
    if (GAME.AchievementSystem) {
      this._checkTimeAchievements(eventName);
    }
  },

  // ══════════════════════════════════════════════════════
  // ⚡ تطبيق تأثيرات الحدث
  // ══════════════════════════════════════════════════════
  _applyEventEffects: function(effect) {
    if (!effect) return;

    // تأثير جودة المحاصيل
    if (effect.qualityBonus && GAME.FarmingSystem) {
      GAME.FarmingSystem._tempQualityBonus = effect.qualityBonus;
      setTimeout(function() {
        if (GAME.FarmingSystem) GAME.FarmingSystem._tempQualityBonus = 0;
      }, 60000); // دقيقة واحدة
    }

    // تأثير مضاعف البيع
    if (effect.sellPriceMultiplier && GAME.EconomySystem) {
      GAME.EconomySystem._tempSellMultiplier = effect.sellPriceMultiplier;
      setTimeout(function() {
        if (GAME.EconomySystem) GAME.EconomySystem._tempSellMultiplier = 1;
      }, 120000); // دقيقتان
    }

    // تأثير فرصة العثور على أ Items نادرة
    if (effect.rareItemChance) {
      // يمكن تطبيقه على نظام الصيد أو الاستكشاف
      if (GAME.FishingSystem) {
        GAME.FishingSystem._tempRareChance = effect.rareItemChance;
      }
    }

    // تأثير ماء مجاني
    if (effect.freeWater && GAME.FarmingSystem) {
      if (GAME.FarmingSystem.waterAllCrops) {
        GAME.FarmingSystem.waterAllCrops();
      }
    }
  },

  // ══════════════════════════════════════════════════════
  // 🌱 تحديث تأثيرات النباتات
  // ══════════════════════════════════════════════════════
  _updateCropEffects: function() {
    if (!GAME.FarmingSystem) return;

    var effects = this.cropEffects[this.currentPeriod];
    if (!effects) return;

    // تطبيق مضاعف النمو
    if (GAME.FarmingSystem.setGrowthMultiplier) {
      GAME.FarmingSystem.setGrowthMultiplier(effects.growthMultiplier);
    }

    // تطبيق حاجة المياه
    if (GAME.FarmingSystem.setWaterNeedMultiplier) {
      GAME.FarmingSystem.setWaterNeedMultiplier(effects.waterNeed);
    }
  },

  // ══════════════════════════════════════════════════════
  // 🐄 تحديث تأثيرات الحيوانات
  // ══════════════════════════════════════════════════════
  _updateAnimalEffects: function() {
    if (!GAME.AnimalsSystem) return;

    var effects = this.animalEffects[this.currentPeriod];
    if (!effects) return;

    // تحديث حالة النشاط
    if (GAME.AnimalsSystem.setActivityState) {
      GAME.AnimalsSystem.setActivityState(effects.activity);
    }

    // تحديث مضاعف السعادة
    if (GAME.AnimalsSystem.setHappinessMultiplier) {
      GAME.AnimalsSystem.setHappinessMultiplier(effects.happiness);
    }

    // تحديث مضاعف الإنتاجية
    if (GAME.AnimalsSystem.setProductivityMultiplier) {
      GAME.AnimalsSystem.setProductivityMultiplier(effects.productivity);
    }
  },

  // ══════════════════════════════════════════════════════
  // 👥 تحديث جدول NPC
  // ══════════════════════════════════════════════════════
  _updateNPCSchedule: function() {
    if (!GAME.NPCsSystem) return;

    var schedule = this.npcSchedules[this.currentPeriod];
    if (!schedule) return;

    // تحديث NPCs النشطين
    if (GAME.NPCsSystem.setActiveNPCs) {
      GAME.NPCsSystem.setActiveNPCs(schedule.active);
    }

    // تحديث حالة النوم
    if (GAME.NPCsSystem.setSleepState) {
      GAME.NPCsSystem.setSleepState(schedule.sleepState);
    }
  },

  // ══════════════════════════════════════════════════════
  // 🎨 تحديث Skybox
  // ══════════════════════════════════════════════════════
  _updateSkybox: function(period) {
    if (!this.game || !this.game.scene) return;

    // تحديث skybox materials
    if (this.game.skybox) {
      var skyColor = period.skyColor;
      if (this.game.skybox.material) {
        if (Array.isArray(this.game.skybox.material)) {
          this.game.skybox.material.forEach(function(mat) {
            mat.color.setHex(skyColor);
          });
        } else {
          this.game.skybox.material.color.setHex(skyColor);
        }
      }
    }
  },

  // ══════════════════════════════════════════════════════
  // 🏆 فحص إنجازات الوقت
  // ══════════════════════════════════════════════════════
  _checkTimeAchievements: function(eventName) {
    if (!GAME.AchievementSystem) return;

    var achievementMap = {
      'sunrise': 'early_bird',
      'goldenHour': 'golden_seller',
      'midnightMystery': 'night_owl',
      'preDawnDew': 'dew_collector'
    };

    var achievementId = achievementMap[eventName];
    if (achievementId && GAME.AchievementSystem.unlock) {
      GAME.AchievementSystem.unlock(achievementId);
    }
  },

  // ══════════════════════════════════════════════════════
  // 📅 إعادة تعيين أحداث اليوم
  // ══════════════════════════════════════════════════════
  resetDailyEvents: function() {
    this.triggeredEventsToday = {};
    console.log('[DayNightCycle] 🔄 تم إعادة تعيين أحداث اليوم');
  },

  // ══════════════════════════════════════════════════════
  // 📝 callbacks لتغيير الفترة
  // ══════════════════════════════════════════════════════
  onPeriodChange: function(callback) {
    if (typeof callback === 'function') {
      this.periodChangeCallbacks.push(callback);
    }
  },

  _triggerPeriodChangeCallbacks: function(newPeriod, oldPeriod) {
    for (var i = 0; i < this.periodChangeCallbacks.length; i++) {
      try {
        this.periodChangeCallbacks[i](newPeriod, oldPeriod);
      } catch (e) {
        console.warn('[DayNightCycle] خطأ في callback:', e);
      }
    }
  },

  // ══════════════════════════════════════════════════════
  // ⏰ الحصول على الوقت كنص
  // ══════════════════════════════════════════════════════
  getTimeString: function() {
    var hours = Math.floor(this.currentHour);
    var minutes = Math.floor((this.currentHour % 1) * 60);
    var ampm = hours >= 12 ? 'PM' : 'AM';
    var h12 = hours % 12 || 12;
    return h12 + ':' + minutes.toString().padStart(2, '0') + ' ' + ampm;
  },

  // ══════════════════════════════════════════════════════
  // 🌓 الحصول على الفترة الحالية
  // ══════════════════════════════════════════════════════
  getPeriod: function() {
    return this.currentPeriod;
  },

  // ══════════════════════════════════════════════════════
  // 📊 الحصول على بيانات الفترة
  // ══════════════════════════════════════════════════════
  getPeriodData: function(periodName) {
    return this.periods[periodName || this.currentPeriod];
  },

  // ══════════════════════════════════════════════════════
  // 🌙 هل هو ليل؟
  // ══════════════════════════════════════════════════════
  isNight: function() {
    return this.currentPeriod === 'night';
  },

  // ══════════════════════════════════════════════════════
  // ☀️ هل هو نهار؟
  // ══════════════════════════════════════════════════════
  isDay: function() {
    return this.currentPeriod !== 'night';
  },

  // ══════════════════════════════════════════════════════
  // 🌡️ الحصول على درجة الحرارة الحالية
  // ══════════════════════════════════════════════════════
  getTemperature: function() {
    var base = this.periods[this.currentPeriod].temperature;

    // تعديل حسب الموسم
    if (GAME.TimeSystem) {
      var season = GAME.TimeSystem.season;
      var seasonModifier = {
        spring: 0,
        summer: 8,
        autumn: -2,
        winter: -10
      };
      base += seasonModifier[season] || 0;
    }

    return base;
  },

  // ══════════════════════════════════════════════════════
  // 💧 الحصول على الرطوبة الحالية
  // ══════════════════════════════════════════════════════
  getHumidity: function() {
    var base = this.periods[this.currentPeriod].humidity;

    // تعديل حسب الطقس
    if (GAME.WeatherSystem) {
      var weather = GAME.WeatherSystem.currentWeather;
      var weatherModifier = {
        rainy: 0.3,
        stormy: 0.4,
        snowy: 0.2,
        cloudy: 0.1,
        clear: 0,
        windy: -0.1
      };
      base += weatherModifier[weather] || 0;
    }

    return Math.min(1, Math.max(0, base));
  },

  // ══════════════════════════════════════════════════════
  // 🎨 رمز الفترة
  // ══════════════════════════════════════════════════════
  _getPeriodIcon: function(period) {
    var icons = {
      dawn: '🌅',
      morning: '☀️',
      noon: '🌞',
      afternoon: '🌤️',
      dusk: '🌇',
      night: '🌙'
    };
    return icons[period] || '⏰';
  },

  // ══════════════════════════════════════════════════════
  // 🧮 دوال مساعدة للحسابات
  // ══════════════════════════════════════════════════════
  _lerp: function(a, b, t) {
    return a + (b - a) * t;
  },

  _lerpColor: function(colorA, colorB, t) {
    var rA = (colorA >> 16) & 0xff;
    var gA = (colorA >> 8) & 0xff;
    var bA = colorA & 0xff;

    var rB = (colorB >> 16) & 0xff;
    var gB = (colorB >> 8) & 0xff;
    var bB = colorB & 0xff;

    var r = Math.round(rA + (rB - rA) * t);
    var g = Math.round(gA + (gB - gA) * t);
    var b = Math.round(bA + (bB - bA) * t);

    return (r << 16) | (g << 8) | b;
  },

  _easeInOutCubic: function(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  // ══════════════════════════════════════════════════════
  // ⚙️ تحديث الإعدادات
  // ══════════════════════════════════════════════════════
  updateSettings: function(newSettings) {
    for (var key in newSettings) {
      if (this.settings.hasOwnProperty(key)) {
        this.settings[key] = newSettings[key];
      }
    }
    this.enabled = this.settings.enabled;
    this._saveSettings();
    console.log('[DayNightCycle] ⚙️ تم تحديث الإعدادات');
  },

  // ══════════════════════════════════════════════════════
  // 💾 حفظ الإعدادات
  // ══════════════════════════════════════════════════════
  _saveSettings: function() {
    try {
      localStorage.setItem('farmGameDayNight', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('[DayNightCycle] تعذر حفظ الإعدادات:', e);
    }
  },

  // ══════════════════════════════════════════════════════
  // 📂 تحميل الإعدادات
  // ══════════════════════════════════════════════════════
  _loadSettings: function() {
    try {
      var saved = localStorage.getItem('farmGameDayNight');
      if (saved) {
        var parsed = JSON.parse(saved);
        for (var key in parsed) {
          if (this.settings.hasOwnProperty(key)) {
            this.settings[key] = parsed[key];
          }
        }
        console.log('[DayNightCycle] 📂 تم تحميل الإعدادات المحفوظة');
      }
    } catch (e) {
      console.warn('[DayNightCycle] تعذر تحميل الإعدادات:', e);
    }
  },

  // ══════════════════════════════════════════════════════
  // 💾 حفظ الحالة
  // ══════════════════════════════════════════════════════
  save: function() {
    return {
      currentPeriod: this.currentPeriod,
      triggeredEventsToday: this.triggeredEventsToday,
      settings: this.settings
    };
  },

  // ══════════════════════════════════════════════════════
  // 📂 تحميل الحالة
  // ══════════════════════════════════════════════════════
  load: function(data) {
    if (!data) return;

    this.currentPeriod = data.currentPeriod || 'morning';
    this.triggeredEventsToday = data.triggeredEventsToday || {};

    if (data.settings) {
      for (var key in data.settings) {
        if (this.settings.hasOwnProperty(key)) {
          this.settings[key] = data.settings[key];
        }
      }
    }

    console.log('[DayNightCycle] 📂 تم تحميل الحالة');
  },

  // ══════════════════════════════════════════════════════
  // 🧹 التنظيف
  // ══════════════════════════════════════════════════════
  dispose: function() {
    this.periodChangeCallbacks = [];
    this.triggeredEventsToday = {};
    this.initialized = false;
    console.log('[DayNightCycle] 🧹 تم التنظيف');
  },

  // ══════════════════════════════════════════════════════
  // 📊 الحصول على معلومات التصحيح
  // ══════════════════════════════════════════════════════
  getDebugInfo: function() {
    return {
      currentHour: this.currentHour,
      currentPeriod: this.currentPeriod,
      periodName: this.periods[this.currentPeriod].nameAr,
      timeString: this.getTimeString(),
      temperature: this.getTemperature(),
      humidity: this.getHumidity(),
      isNight: this.isNight(),
      eventsTriggered: Object.keys(this.triggeredEventsToday).length,
      callbacksCount: this.periodChangeCallbacks.length
    };
  }
};

console.log('[DayNightCycle] ✅ تم تحميل النظام - 6 فترات زمنية');
