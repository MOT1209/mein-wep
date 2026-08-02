/**
 * AnimationManager.js - نظام إدارة الأنيميشن المحسّن
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - إدارة أنيميشنات اللاعب والحيوانات والكائنات
 * - Interpolation للقيم الرقمية والمتجهات (Vector3)
 * - 6 أنواع easing functions (linear, easeIn, easeOut, easeInOut, bounce, elastic)
 * - تتبع الأنيميشنات النشطة وحذفها تلقائياً عند الانتهاء
 * - دعم خصائص متداخلة (nested properties) مثل position.x
 * - تقليل استهلاك الموارد عبر إدارة فعالة للذاكرة
 * - واجهة بسيطة: register → play → stop
 */

var GAME = GAME || {};

GAME.AnimationManager = {
  // ─── الحالة ───
  isInitialized: false,
  
  // ─── التخزين ───
  animations: {},
  activeAnimations: [],
  
  // ─── الإحصائيات ───
  stats: {
    totalCreated: 0,
    totalCompleted: 0,
    activeCount: 0
  },

  /**
   * تهيئة نظام الأنيميشن
   * @param {Object} game - كائن اللعبة الرئيسي
   */
  init: function(game) {
    this.game = game;
    this.isInitialized = true;
    this.animations = {};
    this.activeAnimations = [];
    this.stats = { totalCreated: 0, totalCompleted: 0, activeCount: 0 };
    
    console.log('[AnimationManager] تم التهيئة بنجاح');
  },

  /**
   * تسجيل أنيميشن جديد
   * @param {string} id - معرّف فريد للأنيميشن
   * @param {Object} target - الكائن المستهدف (مثلاً: mesh.position)
   * @param {string} property - الخاصية المطلوب تغييرها (مثلاً: 'x' أو 'opacity')
   * @param {*} startValue - القيمة الأولية
   * @param {*} endValue - القيمة النهائية
   * @param {number} duration - المدة بالثواني
   * @param {string} easing - نوع التسهيل (linear, easeIn, easeOut, easeInOut, bounce, elastic)
   * @returns {boolean} - نجاح التسجيل
   */
  register: function(id, target, property, startValue, endValue, duration, easing) {
    if (!id || !target) {
      console.warn('[AnimationManager] معرّف أو هدف غير صالح');
      return false;
    }
    
    this.animations[id] = {
      id: id,
      target: target,
      property: property,
      startValue: startValue,
      endValue: endValue,
      duration: duration || 1,
      easing: easing || 'linear',
      elapsed: 0,
      active: false,
      onComplete: null,
      onUpdate: null
    };
    
    this.stats.totalCreated++;
    return true;
  },

  /**
   * تسجيل أنيميشن مع callback عند الانتهاء
   */
  registerWithCallback: function(id, target, property, startValue, endValue, duration, easing, onComplete, onUpdate) {
    var registered = this.register(id, target, property, startValue, endValue, duration, easing);
    if (registered && this.animations[id]) {
      this.animations[id].onComplete = onComplete || null;
      this.animations[id].onUpdate = onUpdate || null;
    }
    return registered;
  },

  /**
   * تشغيل أنيميشن مسجّل
   * @param {string} id - معرّف الأنيميشن
   * @returns {boolean} - نجاح التشغيل
   */
  play: function(id) {
    var anim = this.animations[id];
    if (!anim) {
      console.warn('[AnimationManager] أنيميشن غير موجود:', id);
      return false;
    }
    
    // إعادة تعيين إذا كان نشطاً بالفعل
    if (anim.active) {
      this.stop(id);
    }
    
    anim.active = true;
    anim.elapsed = 0;
    
    // إضافة إلى القائمة النشطة إذا لم يكن موجوداً
    if (this.activeAnimations.indexOf(id) === -1) {
      this.activeAnimations.push(id);
    }
    
    this.stats.activeCount = this.activeAnimations.length;
    return true;
  },

  /**
   * إيقاف أنيميشن
   * @param {string} id - معرّف الأنيميشن
   */
  stop: function(id) {
    var anim = this.animations[id];
    if (!anim) return;
    
    anim.active = false;
    
    var index = this.activeAnimations.indexOf(id);
    if (index > -1) {
      this.activeAnimations.splice(index, 1);
    }
    
    this.stats.activeCount = this.activeAnimations.length;
  },

  /**
   * إيقاف جميع الأنيميشنات النشطة
   */
  stopAll: function() {
    for (var i = 0; i < this.activeAnimations.length; i++) {
      var anim = this.animations[this.activeAnimations[i]];
      if (anim) anim.active = false;
    }
    this.activeAnimations = [];
    this.stats.activeCount = 0;
  },

  /**
   * حذف أنيميشن من التخزين
   * @param {string} id - معرّف الأنيميشن
   */
  remove: function(id) {
    this.stop(id);
    delete this.animations[id];
  },

  /**
   * تحديث جميع الأنيميشنات النشطة
   * @param {number} dt - الوقت المنقضي بالثواني
   */
  update: function(dt) {
    if (this.activeAnimations.length === 0) return;
    
    var completed = [];
    
    for (var i = 0; i < this.activeAnimations.length; i++) {
      var id = this.activeAnimations[i];
      var anim = this.animations[id];
      
      if (!anim || !anim.active) continue;
      
      // تحديث الوقت المنقضي
      anim.elapsed += dt;
      
      // حساب نسبة التقدم (0 إلى 1)
      var progress = Math.min(anim.elapsed / anim.duration, 1);
      
      // تطبيق دالة التسهيل
      var easedProgress = this.ease(progress, anim.easing);
      
      // استخراج القيمة الحالية
      var currentValue = this.interpolate(anim.startValue, anim.endValue, easedProgress);
      
      // تطبيق القيمة على الكائن المستهدف
      this.setProperty(anim.target, anim.property, currentValue);
      
      // استدعاء callback التحديث إذا وجد
      if (anim.onUpdate) {
        anim.onUpdate(currentValue, progress);
      }
      
      // التحقق من اكتمال الأنيميشن
      if (progress >= 1) {
        anim.active = false;
        this.stats.totalCompleted++;
        
        // استدعاء callback الاكتمال إذا وجد
        if (anim.onComplete) {
          anim.onComplete();
        }
        
        completed.push(id);
      }
    }
    
    // حذف الأنيميشنات المكتملة من القائمة النشطة
    for (var j = 0; j < completed.length; j++) {
      var index = this.activeAnimations.indexOf(completed[j]);
      if (index > -1) {
        this.activeAnimations.splice(index, 1);
      }
    }
    
    this.stats.activeCount = this.activeAnimations.length;
  },

  /**
   * استخراج القيمة الحالية من الأنيميشن
   * @param {string} id - معرّف الأنيميشن
   * @returns {*} - القيمة الحالية أو null
   */
  getCurrentValue: function(id) {
    var anim = this.animations[id];
    if (!anim) return null;
    
    var progress = Math.min(anim.elapsed / anim.duration, 1);
    var easedProgress = this.ease(progress, anim.easing);
    return this.interpolate(anim.startValue, anim.endValue, easedProgress);
  },

  /**
   * التحقق من حالة الأنيميشن
   * @param {string} id - معرّف الأنيميشن
   * @returns {boolean} - هل الأنيميشن نشط؟
   */
  isActive: function(id) {
    var anim = this.animations[id];
    return anim ? anim.active : false;
  },

  /**
   * استخراج عدد الأنيميشنات النشطة
   * @returns {number}
   */
  getActiveCount: function() {
    return this.activeAnimations.length;
  },

  // ─── الدوال الداخلية ───

  /**
   * استخراج القيمة الحالية عبر Interpolation
   * يدعم الأرقام والمتجهات (Vector3 من Three.js)
   */
  interpolate: function(start, end, t) {
    // للقيم الرقمية
    if (typeof start === 'number' && typeof end === 'number') {
      return start + (end - start) * t;
    }
    
    // للمتجهات Three.js (Vector3, Vector2)
    if (start && typeof start === 'object' && start.lerp) {
      return start.clone().lerp(end, t);
    }
    
    // للنماذج البسيطة (对象)
    if (start && typeof start === 'object' && end && typeof end === 'object') {
      var result = {};
      for (var key in start) {
        if (start.hasOwnProperty(key) && end.hasOwnProperty(key)) {
          if (typeof start[key] === 'number') {
            result[key] = start[key] + (end[key] - start[key]) * t;
          } else {
            result[key] = start[key];
          }
        }
      }
      return result;
    }
    
    // للقيم النصية والمنطقية - لا توجد Interpolation
    return t >= 1 ? end : start;
  },

  /**
   * تطبيق قيمة على خاصية الكائن المستهدف
   * يدعم الخصائص المتداخلة (مثل 'position.x')
   */
  setProperty: function(target, property, value) {
    if (!target || !property) return;
    
    var props = property.split('.');
    var obj = target;
    
    // الوصول إلى الكائن الأب
    for (var i = 0; i < props.length - 1; i++) {
      if (obj === null || obj === undefined) return;
      obj = obj[props[i]];
    }
    
    // تطبيق القيمة
    var lastProp = props[props.length - 1];
    if (obj !== null && obj !== undefined) {
      obj[lastProp] = value;
    }
  },

  /**
   * دالة التسهيل (Easing Functions)
   * تدعم 6 أنواع: linear, easeIn, easeOut, easeInOut, bounce, elastic
   */
  ease: function(t, type) {
    switch (type) {
      case 'linear':
        return t;
        
      case 'easeIn':
        return t * t;
        
      case 'easeOut':
        return 1 - (1 - t) * (1 - t);
        
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
      case 'bounce':
        return this.bounceEase(t);
        
      case 'elastic':
        return this.elasticEase(t);
        
      default:
        return t;
    }
  },

  /**
   * دالة التسهيل المتحركة (Bounce Ease)
   * محاكاة ارتداد الكرة
   */
  bounceEase: function(t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      t -= 1.5 / 2.75;
      return 7.5625 * t * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      t -= 2.25 / 2.75;
      return 7.5625 * t * t + 0.9375;
    } else {
      t -= 2.625 / 2.75;
      return 7.5625 * t * t + 0.984375;
    }
  },

  /**
   * دالة التسهيل المرنة (Elastic Ease)
   * محاكاة تأثير النبض المرن
   */
  elasticEase: function(t) {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
  },

  // ─── دوال مساعدة سريعة ───

  /**
   * إنشاء أنيميشن اختفاء (Fade Out)
   */
  fadeOut: function(target, duration, onComplete) {
    var id = 'fade_' + Date.now();
    var startOpacity = target.material ? target.material.opacity : 1;
    
    this.registerWithCallback(
      id,
      target.material || target,
      'opacity',
      startOpacity,
      0,
      duration || 0.5,
      'easeIn',
      function() {
        if (target.visible !== undefined) target.visible = false;
        if (onComplete) onComplete();
      }
    );
    
    this.play(id);
    return id;
  },

  /**
   * إنشاء أنيميشن ظهور (Fade In)
   */
  fadeIn: function(target, duration, onComplete) {
    var id = 'fade_' + Date.now();
    var endOpacity = target.material ? target.material.opacity : 1;
    
    target.visible = true;
    
    this.registerWithCallback(
      id,
      target.material || target,
      'opacity',
      0,
      endOpacity,
      duration || 0.5,
      'easeOut',
      onComplete
    );
    
    this.play(id);
    return id;
  },

  /**
   * إنشاء أنيميشن حركة三点
   */
  moveTo: function(target, destination, duration, easing, onComplete) {
    var id = 'move_' + Date.now();
    var startPos = target.position.clone();
    
    this.registerWithCallback(
      id,
      target.position,
      'x',
      startPos.x,
      destination.x,
      duration || 1,
      easing || 'easeInOut',
      onComplete
    );
    
    // تسجيل Y و Z بشكل منفصل
    this.register(id + '_y', target.position, 'y', startPos.y, destination.y, duration || 1, easing || 'easeInOut');
    this.register(id + '_z', target.position, 'z', startPos.z, destination.z, duration || 1, easing || 'easeInOut');
    
    this.play(id);
    this.play(id + '_y');
    this.play(id + '_z');
    
    return id;
  },

  /**
   * إنشاء أنيميشن دوران
   */
  rotateTo: function(target, targetRotation, duration, easing, onComplete) {
    var id = 'rotate_' + Date.now();
    
    this.registerWithCallback(
      id,
      target.rotation,
      'y',
      target.rotation.y,
      targetRotation,
      duration || 1,
      easing || 'linear',
      onComplete
    );
    
    this.play(id);
    return id;
  },

  /**
   * إنشاء أنيميشن تكبير/تصغير
   */
  scaleTo: function(target, scale, duration, easing, onComplete) {
    var id = 'scale_' + Date.now();
    
    this.registerWithCallback(
      id,
      target.scale,
      'x',
      target.scale.x,
      scale,
      duration || 0.5,
      easing || 'bounce',
      onComplete
    );
    
    this.register(id + '_y', target.scale, 'y', target.scale.y, scale, duration || 0.5, easing || 'bounce');
    this.register(id + '_z', target.scale, 'z', target.scale.z, scale, duration || 0.5, easing || 'bounce');
    
    this.play(id);
    this.play(id + '_y');
    this.play(id + '_z');
    
    return id;
  },

  /**
   * إنشاء أنيميشن اهتزاز
   */
  shake: function(target, intensity, duration, onComplete) {
    var id = 'shake_' + Date.now();
    var originalX = target.position.x;
    var originalY = target.position.y;
    var elapsed = 0;
    var shakeDuration = duration || 0.5;
    var self = this;
    
    var shakeInterval = setInterval(function() {
      elapsed += 0.016;
      if (elapsed >= shakeDuration) {
        target.position.x = originalX;
        target.position.y = originalY;
        clearInterval(shakeInterval);
        if (onComplete) onComplete();
        return;
      }
      
      var decay = 1 - (elapsed / shakeDuration);
      target.position.x = originalX + (Math.random() - 0.5) * intensity * decay;
      target.position.y = originalY + (Math.random() - 0.5) * intensity * decay;
    }, 16);
    
    return id;
  },

  /**
   * مسح جميع الأنيميشنات والذاكرة
   */
  clear: function() {
    this.stopAll();
    this.animations = {};
    this.activeAnimations = [];
    this.stats = { totalCreated: 0, totalCompleted: 0, activeCount: 0 };
    console.log('[AnimationManager] تم مسح جميع الأنيميشنات');
  },

  /**
   * الحصول على إحصائيات النظام
   */
  getStats: function() {
    return {
      registered: Object.keys(this.animations).length,
      active: this.activeAnimations.length,
      totalCreated: this.stats.totalCreated,
      totalCompleted: this.stats.totalCompleted
    };
  },

  /**
   * تنظيف الموارد
   */
  dispose: function() {
    this.clear();
    this.isInitialized = false;
    console.log('[AnimationManager] تم التخلص من الموارد');
  }
};

// تصدير النظام
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME.AnimationManager;
}
