/**
 * TutorialSystem.js - نظام التعليم التفاعلي للمبتدئين
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - 10 خطوات تعليمية تفاعلية
 * - تتبع إجراءات اللاعب (حركة، كاميرا، زراعة، ماء، حصاد)
 * - عرض إشعارات موجهة في أعلى الشاشة
 * - إمكانية التخطي مع حفظ الحالة
 * - حفظ التقدم في localStorage
 * - تكامل مع جميع الأنظمة (Farming, Animals, UI, Economy, etc.)
 * - واجهة تعليمية مرئية (overlay + progress bar)
 * - دعم RTL/LTR
 */

var GAME = GAME || {};

GAME.TutorialSystem = {
  // ─── الحالة ───
  currentStep: 0,
  isComplete: false,
  isSkipped: false,
  isActive: false,
  overlayEl: null,
  progressEl: null,
  tooltipEl: null,
  _movementDetected: false,
  _cameraDetected: false,
  _plowDetected: false,
  _waterDetected: false,
  _plantDetected: false,
  _harvestDetected: false,
  _shopDetected: false,
  _feedDetected: false,

  // ─── الخطوات التعليمية (10 خطوات) ───
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Farm Game! 🌾',
      description: 'You\'re about to start your farming adventure. Follow the steps to learn the basics!',
      descriptionAr: 'أنت على وشك بدء مغامرة الزراعة. اتبع الخطوات لتتعلم الأساسيات!',
      icon: '🌾',
      action: null,
      position: 'center',
      tip: 'Press OK or click to continue',
      tipAr: 'اضغط OK أو اضغط للمتابعة'
    },
    {
      id: 'movement',
      title: 'Step 1: Movement 🚶',
      description: 'Use WASD or Arrow Keys to walk around your farm.',
      descriptionAr: 'استخدم WASD أو مفاتيح الأسهم للمشي حول مزرعتك.',
      icon: '🚶',
      action: 'move',
      position: 'top',
      tip: 'Try walking to the nearby soil plots!',
      tipAr: 'حاول المشي إلى الأراضي القريبة!'
    },
    {
      id: 'camera',
      title: 'Step 2: Camera Control 🎥',
      description: 'Move your mouse to look around. Hold RIGHT CLICK and drag to rotate the camera.',
      descriptionAr: 'حرّك الماوس للنظر حولك. اضغط زر الماوس الأيمن واسحب لتدوير الكاميرا.',
      icon: '🎥',
      action: 'rotate',
      position: 'top',
      tip: 'Move your mouse left/right to look around',
      tipAr: 'حرّك الماوس يسار/يمين للنظر حولك'
    },
    {
      id: 'first_plot',
      title: 'Step 3: Plowing Land 🌱',
      description: 'Walk to a brown soil plot and press SPACE to plow it.',
      descriptionAr: 'مشِ إلى قطعة أرض بنية واضغط SPACE للحرث.',
      icon: '🌱',
      action: 'plow',
      position: 'top',
      tip: 'Get close to the soil, then press SPACE',
      tipAr: 'اقترب من التربة، ثم اضغط SPACE'
    },
    {
      id: 'watering',
      title: 'Step 4: Watering 💧',
      description: 'Select the watering can (press 1) and press SPACE to water your plot.',
      descriptionAr: 'اختر دلو الماء (اضغط 1) واضغط SPACE لسقي الأرض.',
      icon: '💧',
      action: 'water',
      position: 'top',
      tip: 'Press key 1, then walk to plowed soil and press SPACE',
      tipAr: 'اضغط المفتاح 1، ثم مشِ إلى الأرض المحرثة واضغط SPACE'
    },
    {
      id: 'planting',
      title: 'Step 5: Planting Seeds 🌿',
      description: 'Select seeds (press 2 for wheat) and press SPACE to plant on watered soil.',
      descriptionAr: 'اختر البذور (اضغط 2 للقمح) واضغط SPACE للزراعة على التربة المروية.',
      icon: '🌿',
      action: 'plant',
      position: 'top',
      tip: 'Press 2, then go to watered soil and press SPACE',
      tipAr: 'اضغط 2، ثم اذهب إلى التربة المروية واضغط SPACE'
    },
    {
      id: 'harvesting',
      title: 'Step 6: Harvesting 🌾',
      description: 'When your crops are ready (glowing), press SPACE to harvest them.',
      descriptionAr: 'عندما تكون محاصيلك جاهزة (تلمع)، اضغط SPACE لحصادها.',
      icon: '🌾',
      action: 'harvest',
      position: 'top',
      tip: 'Crops glow when ready — walk close and press SPACE',
      tipAr: 'تلمع المحاصيل عند النضج — اقترب واضغط SPACE'
    },
    {
      id: 'shop',
      title: 'Step 7: The Shop 🏪',
      description: 'Press B to open the shop. Buy seeds and sell your harvest!',
      descriptionAr: 'اضغط B لفتح المتجر. اشترِ بذوراً وبِع محاصيلك!',
      icon: '🏪',
      action: 'shop',
      position: 'top',
      tip: 'Press B to open the shop menu',
      tipAr: 'اضغط B لفتح قائمة المتجر'
    },
    {
      id: 'animals',
      title: 'Step 8: Animal Care 🐔',
      description: 'Visit the coop area and press SPACE near animals to feed them.',
      descriptionAr: 'قم بزيارة منطقة الدجاج واضغط SPACE بالقرب من الحيوانات لإطعامها.',
      icon: '🐔',
      action: 'feed',
      position: 'top',
      tip: 'Walk near the coop, then press SPACE to interact',
      tipAr: 'مشِ بالقرب من الدجاج، ثم اضغط SPACE للتفاعل'
    },
    {
      id: 'complete',
      title: 'Tutorial Complete! 🎉',
      description: 'You\'re ready to farm! Explore, grow, and build your dream farm!',
      descriptionAr: 'أنت جاهز للزراعة! استكشف، زرع، وابنِ مزرعة أحلامك!',
      icon: '🎉',
      action: null,
      position: 'center',
      tip: 'Have fun farming! 🌾',
      tipAr: 'استمتع بالزراعة! 🌾'
    }
  ],

  // ─── التهيئة ───
  init: function(game) {
    this.game = game || GAME;
    this._loadProgress();
    this._createOverlay();
    console.log('[TutorialSystem] Initialized. Complete:', this.isComplete);
  },

  // ─── تحميل الحفظ ───
  _loadProgress: function() {
    try {
      var saved = localStorage.getItem('farmGameTutorial');
      if (saved) {
        var data = JSON.parse(saved);
        if (data && data.complete) {
          this.isComplete = true;
          this.isSkipped = data.skipped === true;
          this.currentStep = this.steps.length;
        } else if (data && typeof data.step === 'number') {
          this.currentStep = data.step;
          this.isComplete = false;
        }
      }
    } catch (e) {
      console.warn('[TutorialSystem] Could not load progress:', e);
    }
  },

  // ─── حفظ الحالة ───
  _saveProgress: function() {
    try {
      var data = {
        complete: this.isComplete,
        skipped: this.isSkipped,
        step: this.currentStep
      };
      localStorage.setItem('farmGameTutorial', JSON.stringify(data));
    } catch (e) {
      console.warn('[TutorialSystem] Could not save progress:', e);
    }
  },

  // ─── إنشاء واجهة Overlay ───
  _createOverlay: function() {
    // حاوية التعليمة الرئيسية
    if (this.overlayEl) return;

    var overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.style.cssText = [
      'position: fixed',
      'top: 0', 'left: 0', 'right: 0',
      'z-index: 10000',
      'pointer-events: none',
      'font-family: Inter, sans-serif',
      'transition: opacity 0.3s ease'
    ].join(';');

    // شريط التقدم
    var progressBar = document.createElement('div');
    progressBar.id = 'tutorial-progress';
    progressBar.style.cssText = [
      'width: 100%',
      'height: 4px',
      'background: rgba(0,0,0,0.2)',
      'position: relative'
    ].join(';');

    var progressFill = document.createElement('div');
    progressFill.id = 'tutorial-progress-fill';
    progressFill.style.cssText = [
      'height: 100%',
      'background: linear-gradient(90deg, #4CAF50, #8BC34A)',
      'width: 0%',
      'transition: width 0.4s ease',
      'border-radius: 0 2px 2px 0'
    ].join(';');
    progressBar.appendChild(progressFill);

    // صندوق التعليمة
    var tooltip = document.createElement('div');
    tooltip.id = 'tutorial-tooltip';
    tooltip.style.cssText = [
      'max-width: 520px',
      'margin: 12px auto',
      'padding: 18px 24px',
      'background: linear-gradient(135deg, rgba(30,60,20,0.95), rgba(45,90,39,0.95))',
      'border: 2px solid rgba(139,195,74,0.5)',
      'border-radius: 14px',
      'color: #fff',
      'text-align: center',
      'box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      'backdrop-filter: blur(8px)',
      'pointer-events: auto',
      'transform: translateY(-10px)',
      'opacity: 0',
      'transition: transform 0.4s ease, opacity 0.4s ease'
    ].join(';');

    overlay.appendChild(progressBar);
    overlay.appendChild(tooltip);
    document.body.appendChild(overlay);

    this.overlayEl = overlay;
    this.progressEl = progressFill;
    this.tooltipEl = tooltip;
  },

  // ─── بدء التعليم ───
  start: function() {
    if (this.isComplete || this.isActive) return;
    this.isActive = true;
    this.currentStep = 0;
    this._showStep();
  },

  // ─── إظهار الخطوة الحالية ───
  _showStep: function() {
    if (this.currentStep >= this.steps.length) {
      this.completeTutorial();
      return;
    }

    var step = this.steps[this.currentStep];
    var lang = (GAME.state && GAME.state.lang) || 'en';
    var desc = (lang === 'ar' && step.descriptionAr) ? step.descriptionAr : step.description;
    var tip = (lang === 'ar' && step.tipAr) ? step.tipAr : step.tip;
    var stepNum = this.currentStep + 1;
    var total = this.steps.length;

    // تحديث شريط التقدم
    var pct = Math.round((stepNum / total) * 100);
    if (this.progressEl) {
      this.progressEl.style.width = pct + '%';
    }

    // بناء محتوى التعليمة
    if (this.tooltipEl) {
      this.tooltipEl.textContent = '';

      var stepCounter = document.createElement('div');
      stepCounter.style.cssText = 'margin-bottom:6px;font-size:13px;opacity:0.7;letter-spacing:1px;';
      stepCounter.textContent = 'STEP ' + stepNum + ' / ' + total;
      this.tooltipEl.appendChild(stepCounter);

      var iconDiv = document.createElement('div');
      iconDiv.style.cssText = 'font-size:28px;margin-bottom:6px;';
      iconDiv.textContent = step.icon;
      this.tooltipEl.appendChild(iconDiv);

      var titleDiv = document.createElement('div');
      titleDiv.style.cssText = 'font-size:18px;font-weight:700;margin-bottom:6px;';
      titleDiv.textContent = step.title;
      this.tooltipEl.appendChild(titleDiv);

      var descDiv = document.createElement('div');
      descDiv.style.cssText = 'font-size:14px;opacity:0.9;margin-bottom:10px;line-height:1.5;';
      descDiv.textContent = desc;
      this.tooltipEl.appendChild(descDiv);

      var tipDiv = document.createElement('div');
      tipDiv.style.cssText = 'font-size:12px;opacity:0.6;font-style:italic;';
      tipDiv.textContent = '💡 ' + tip;
      this.tooltipEl.appendChild(tipDiv);

      // أزرار التحكم
      var btnRow = document.createElement('div');
      btnRow.style.cssText = 'margin-top:14px;display:flex;gap:10px;justify-content:center;';

      // زر التخطي
      var skipButton = document.createElement('button');
      skipButton.id = 'tutorial-skip-btn';
      skipButton.style.cssText = 'padding:8px 20px;border:1px solid rgba(255,255,255,0.3);border-radius:8px;' +
        'background:rgba(255,255,255,0.1);color:#fff;font-size:13px;cursor:pointer;' +
        'transition:background 0.2s;';
      skipButton.textContent = 'Skip Tutorial ✕';
      skipButton.addEventListener('mouseover', function() { skipButton.style.background = 'rgba(255,255,255,0.2)'; });
      skipButton.addEventListener('mouseout', function() { skipButton.style.background = 'rgba(255,255,255,0.1)'; });
      btnRow.appendChild(skipButton);

      // زر المتابعة (للخطوات بدون إجراء)
      if (!step.action) {
        var nextButton = document.createElement('button');
        nextButton.id = 'tutorial-next-btn';
        nextButton.style.cssText = 'padding:8px 24px;border:none;border-radius:8px;' +
          'background:linear-gradient(135deg,#4CAF50,#8BC34A);color:#fff;' +
          'font-size:13px;font-weight:600;cursor:pointer;' +
          'transition:transform 0.2s,box-shadow 0.2s;' +
          'box-shadow:0 4px 12px rgba(76,175,80,0.4);';
        nextButton.textContent = 'OK →';
        nextButton.addEventListener('mouseover', function() { nextButton.style.transform = 'scale(1.05)'; });
        nextButton.addEventListener('mouseout', function() { nextButton.style.transform = 'scale(1)'; });
        btnRow.appendChild(nextButton);
      }

      this.tooltipEl.appendChild(btnRow);

      this.tooltipEl.style.transform = 'translateY(0)';
      this.tooltipEl.style.opacity = '1';
    }

    // إنشاء الأحداث
    var self = this;
    setTimeout(function() {
      var skipBtn = document.getElementById('tutorial-skip-btn');
      var nextBtn = document.getElementById('tutorial-next-btn');
      if (skipBtn) {
        skipBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          self.skip();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          self.nextStep();
        });
      }
    }, 50);

    // إشعار في واجهة اللعبة أيضاً
    if (this.game && this.game.ui && this.game.ui.showNotification) {
      this.game.ui.showNotification(step.title, 'info');
    }
  },

  // ─── التعامل مع الإجراءات ───
  onAction: function(action) {
    if (this.isComplete || this.isSkipped || !this.isActive) return;

    var step = this.steps[this.currentStep];
    if (!step) return;

    // تتبع الحركة (أي حركة كانت كافية)
    if (action === 'move' && step.action === 'move') {
      this._movementDetected = true;
      this.nextStep();
      return;
    }

    // تتبع الكاميرا
    if (action === 'rotate' && step.action === 'rotate') {
      this._cameraDetected = true;
      this.nextStep();
      return;
    }

    // تتبع الحرث
    if (action === 'plow' && step.action === 'plow') {
      this._plowDetected = true;
      this.nextStep();
      return;
    }

    // تتبع السقي
    if (action === 'water' && step.action === 'water') {
      this._waterDetected = true;
      this.nextStep();
      return;
    }

    // تتبع الزراعة
    if (action === 'plant' && step.action === 'plant') {
      this._plantDetected = true;
      this.nextStep();
      return;
    }

    // تتبع الحصاد
    if (action === 'harvest' && step.action === 'harvest') {
      this._harvestDetected = true;
      this.nextStep();
      return;
    }

    // تتبع فتح المتجر
    if (action === 'shop' && step.action === 'shop') {
      this._shopDetected = true;
      this.nextStep();
      return;
    }

    // تتبع إطعام الحيوانات
    if (action === 'feed' && step.action === 'feed') {
      this._feedDetected = true;
      this.nextStep();
      return;
    }
  },

  // ─── الخطوة التالية ───
  nextStep: function() {
    this.currentStep++;
    this._saveProgress();

    if (this.currentStep >= this.steps.length) {
      this.completeTutorial();
    } else {
      this._showStep();
    }
  },

  // ─── التخطي ───
  skip: function() {
    this.isSkipped = true;
    this.completeTutorial();

    if (this.game && this.game.ui && this.game.ui.showNotification) {
      this.game.ui.showNotification('📚 Tutorial skipped! You can replay it from Settings.', 'info');
    }
  },

  // ─── إعادة تشغيل ───
  restart: function() {
    this.currentStep = 0;
    this.isComplete = false;
    this.isSkipped = false;
    this.isActive = false;
    this._movementDetected = false;
    this._cameraDetected = false;
    this._plowDetected = false;
    this._waterDetected = false;
    this._plantDetected = false;
    this._harvestDetected = false;
    this._shopDetected = false;
    this._feedDetected = false;
    this._saveProgress();
    this.start();
  },

  // ─── إكمال التعليم ───
  completeTutorial: function() {
    this.isComplete = true;
    this.isActive = false;
    this._saveProgress();

    // إخفاء التعليمة بـ animation
    var self = this;
    if (this.tooltipEl) {
      this.tooltipEl.style.transform = 'translateY(-10px)';
      this.tooltipEl.style.opacity = '0';
    }
    if (this.overlayEl) {
      setTimeout(function() {
        self.overlayEl.style.opacity = '0';
        setTimeout(function() {
          self.overlayEl.style.display = 'none';
        }, 400);
      }, 500);
    }

    // إشعار النجاح
    if (this.game && this.game.ui && this.game.ui.showNotification) {
      this.game.ui.showNotification('🎓 Tutorial complete! Happy farming! 🌾', 'success');
    }

    console.log('[TutorialSystem] Tutorial completed!');
  },

  // ─── إعادة إظهار الـ overlay ───
  _showOverlay: function() {
    if (this.overlayEl) {
      this.overlayEl.style.display = '';
      this.overlayEl.style.opacity = '1';
    }
  },

  // ─── هل هو نشط؟ ───
  isTutorialActive: function() {
    return this.isActive && !this.isComplete && !this.isSkipped;
  },

  // ─── الحصول على نسبة الإنجاز ───
  getProgress: function() {
    if (this.isComplete) return 100;
    return Math.round((this.currentStep / this.steps.length) * 100);
  },

  // ─── حفظ الحالة للنظام المحسّن ───
  getState: function() {
    return {
      currentStep: this.currentStep,
      isComplete: this.isComplete,
      isSkipped: this.isSkipped,
      progress: this.getProgress()
    };
  },

  // ─── تحميل الحالة من النظام المحسّن ───
  loadState: function(data) {
    if (!data) return;
    if (typeof data.currentStep === 'number') this.currentStep = data.currentStep;
    if (typeof data.isComplete === 'boolean') this.isComplete = data.isComplete;
    if (typeof data.isSkipped === 'boolean') this.isSkipped = data.isSkipped;
    this._saveProgress();
  },

  // ─── التحقق من إكمال خطوة معينة ───
  isStepComplete: function(stepId) {
    for (var i = 0; i < this.steps.length; i++) {
      if (this.steps[i].id === stepId) {
        return i < this.currentStep;
      }
    }
    return false;
  },

  // ─── تحديث (يُدعى كل frame) ───
  update: function(deltaTime) {
    // لا شيء需要 تحديث في كل frame حالياً
    // يمكن إضافة أنيميشن أو تحقق من الأحداث هنا
  },

  // ─── تنظيف الموارد ───
  dispose: function() {
    if (this.overlayEl && this.overlayEl.parentNode) {
      this.overlayEl.parentNode.removeChild(this.overlayEl);
    }
    this.overlayEl = null;
    this.progressEl = null;
    this.tooltipEl = null;
  }
};
