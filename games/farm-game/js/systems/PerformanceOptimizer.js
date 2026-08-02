/**
 * PerformanceOptimizer.js - نظام تحسين الأداء التلقائي
 * 
 * يكتشف أجهزة المستخدم ويعمل على:
 * 1. كشف مستوى الجودة تلقائياً (high/medium/low/potato)
 * 2. مراقبة FPS وتعديل الجودة ديناميكياً
 * 3. تقليل استهلاك الذاكرة والـ GPU
 * 4. تقديم إحصائيات الأداء للنظام
 */
const PerformanceOptimizer = {
  fps: 0,
  frameCount: 0,
  lastTime: 0,
  targetFPS: 60,
  qualityLevel: 'high',
  _monitoringInterval: null,
  _onQualityChangeCallbacks: [],

  qualitySettings: {
    high: {
      particles: 100,
      shadows: true,
      reflections: true,
      drawDistance: 500,
      shadowMapSize: 2048,
      antialiasing: true,
      pixelRatio: Math.min(window.devicePixelRatio, 2)
    },
    medium: {
      particles: 50,
      shadows: true,
      reflections: false,
      drawDistance: 300,
      shadowMapSize: 1024,
      antialiasing: true,
      pixelRatio: 1
    },
    low: {
      particles: 20,
      shadows: false,
      reflections: false,
      drawDistance: 150,
      shadowMapSize: 512,
      antialiasing: false,
      pixelRatio: 1
    },
    potato: {
      particles: 5,
      shadows: false,
      reflections: false,
      drawDistance: 75,
      shadowMapSize: 256,
      antialiasing: false,
      pixelRatio: 0.75
    }
  },

  /**
   * تهيئة نظام تحسين الأداء
   * @param {Object} game - مرجع كائن اللعبة الرئيسي
   */
  init: function (game) {
    this.game = game;
    this.detectQuality();
    this.startMonitoring();
    console.log('[PerformanceOptimizer] Initialized – quality:', this.qualityLevel);
  },

  /**
   * كشف أجهزة المستخدم تلقائياً واختيار مستوى الجودة المناسب
   */
  detectQuality: function () {
    // 1) كشف WebGL Renderer
    try {
      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        this.qualityLevel = 'potato';
        this._applyQuality();
        return;
      }

      var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        var renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        if (renderer.includes('intel') || renderer.includes('mesa') || renderer.includes('swiftshader')) {
          this.qualityLevel = 'low';
        } else if (
          renderer.includes('nvidia') ||
          renderer.includes('amd') ||
          renderer.includes('radeon') ||
          renderer.includes('geforce') ||
          renderer.includes('rtx')
        ) {
          this.qualityLevel = 'high';
        } else {
          this.qualityLevel = 'medium';
        }
      } else {
        this.qualityLevel = 'medium';
      }

      // تنظيف WebGL context
      var ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    } catch (_e) {
      this.qualityLevel = 'medium';
    }

    // 2) كشف ذاكرة الجهاز (Chrome only)
    if (navigator.deviceMemory) {
      if (navigator.deviceMemory < 2) {
        this.qualityLevel = 'potato';
      } else if (navigator.deviceMemory < 4 && this.qualityLevel === 'high') {
        this.qualityLevel = 'medium';
      }
    }

    // 3) كشف عدد الأنوية
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
      if (this.qualityLevel === 'high') this.qualityLevel = 'medium';
    }

    // 4) كشف الاتصال بالإنترنت
    if (navigator.connection) {
      var conn = navigator.connection;
      if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
        this.qualityLevel = 'potato';
      } else if (conn.effectiveType === '3g' && this.qualityLevel === 'high') {
        this.qualityLevel = 'medium';
      }
    }

    this._applyQuality();
  },

  /**
   * تطبيق إعدادات الجودة على مشهد Three.js
   */
  _applyQuality: function () {
    var settings = this.qualitySettings[this.qualityLevel];
    if (!settings) return;

    var renderer = this.game && this.game.renderer;
    var scene = this.game && this.game.scene;
    var camera = this.game && this.game.camera;

    // تحديث pixel ratio
    if (renderer) {
      renderer.setPixelRatio(settings.pixelRatio);
    }

    // تحديث الظلال
    if (renderer) {
      renderer.shadowMap.enabled = settings.shadows;
      renderer.shadowMap.type = settings.shadows ? THREE.PCFSoftShadowMap : THREE.NoShadow;
    }

    // تحديث حجم خريطة الظلال
    if (scene && scene.traverse) {
      scene.traverse(function (obj) {
        if (obj.isLight && obj.shadow) {
          obj.shadow.mapSize.width = settings.shadowMapSize;
          obj.shadow.mapSize.height = settings.shadowMapSize;
          if (obj.shadow.map) {
            obj.shadow.map.dispose();
            obj.shadow.map = null;
          }
        }
      });
    }

    // تحديث مسافة الرسم
    if (camera) {
      camera.far = settings.drawDistance;
      camera.updateProjectionMatrix();
    }

    // تحديث雾 (Fog)
    if (scene && scene.fog) {
      scene.fog.far = settings.drawDistance * 0.8;
      scene.fog.near = settings.drawDistance * 0.3;
    }

    // تحديث عدد الجسيمات
    if (this.game && this.game.systems) {
      var particleSystem = this.game.systems.particles || this.game.systems.particleSystem;
      if (particleSystem && typeof particleSystem.setMaxParticles === 'function') {
        particleSystem.setMaxParticles(settings.particles);
      } else if (particleSystem) {
        particleSystem.maxParticles = settings.particles;
      }
    }

    // إخطار المراجعינים بتغيير الجودة
    this._notifyQualityChange();
  },

  /**
   * بدء مراقبة FPS
   */
  startMonitoring: function () {
    this.lastTime = performance.now();
    this.frameCount = 0;

    var self = this;
    this._monitoringInterval = setInterval(function () {
      self._updateFPS();
    }, 1000);
  },

  /**
   * إيقاف المراقبة
   */
  stopMonitoring: function () {
    if (this._monitoringInterval) {
      clearInterval(this._monitoringInterval);
      this._monitoringInterval = null;
    }
  },

  /**
   * تحديث عداد FPS وضبط الجودة تلقائياً
   */
  _updateFPS: function () {
    var now = performance.now();
    var elapsed = now - this.lastTime;
    this.fps = Math.round((this.frameCount * 1000) / elapsed);
    this.lastTime = now;
    this.frameCount = 0;

    // ضبط الجودة تلقائياً
    if (this.fps < 30 && this.qualityLevel !== 'potato') {
      this.lowerQuality();
    } else if (this.fps > 55 && this.qualityLevel !== 'high') {
      this.raiseQuality();
    }
  },

  /**
   * خفض مستوى الجودة خطوة
   */
  lowerQuality: function () {
    var levels = ['high', 'medium', 'low', 'potato'];
    var idx = levels.indexOf(this.qualityLevel);
    if (idx < levels.length - 1) {
      this.qualityLevel = levels[idx + 1];
      this._applyQuality();
      console.log('[PerformanceOptimizer] Quality lowered →', this.qualityLevel);
    }
  },

  /**
   * رفع مستوى الجودة خطوة
   */
  raiseQuality: function () {
    var levels = ['high', 'medium', 'low', 'potato'];
    var idx = levels.indexOf(this.qualityLevel);
    if (idx > 0) {
      this.qualityLevel = levels[idx - 1];
      this._applyQuality();
      console.log('[PerformanceOptimizer] Quality raised →', this.qualityLevel);
    }
  },

  /**
   * ضبط الجودة يدوياً
   * @param {'high'|'medium'|'low'|'potato'} level
   */
  setQuality: function (level) {
    if (this.qualitySettings[level]) {
      this.qualityLevel = level;
      this._applyQuality();
      console.log('[PerformanceOptimizer] Quality set manually →', level);
    }
  },

  /**
   * تسجيل عداد الإطارات (يُستدعى كل إطار)
   */
  incrementFrame: function () {
    this.frameCount++;
  },

  /**
   * تسجيل callback عند تغيير الجودة
   * @param {Function} fn
   */
  onQualityChange: function (fn) {
    if (typeof fn === 'function') {
      this._onQualityChangeCallbacks.push(fn);
    }
  },

  _notifyQualityChange: function () {
    var settings = this.qualitySettings[this.qualityLevel];
    for (var i = 0; i < this._onQualityChangeCallbacks.length; i++) {
      try {
        this._onQualityChangeCallbacks[i](this.qualityLevel, settings);
      } catch (e) {
        console.warn('[PerformanceOptimizer] Callback error:', e);
      }
    }
  },

  /**
   * الحصول على إحصائيات الأداء الحالية
   * @returns {Object}
   */
  getStats: function () {
    var mem = this.getMemoryUsage();
    return {
      fps: this.fps,
      quality: this.qualityLevel,
      settings: this.qualitySettings[this.qualityLevel],
      memory: mem,
      uptime: this._monitoringInterval ? Math.round(performance.now() / 1000) : 0
    };
  },

  /**
   * قياس استخدام الذاكرة (Chrome only)
   * @returns {Object|null}
   */
  getMemoryUsage: function () {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  },

  /**
   * تنظيف 자원 عند الدمار
   */
  dispose: function () {
    this.stopMonitoring();
    this._onQualityChangeCallbacks = [];
    console.log('[PerformanceOptimizer] Disposed');
  }
};

// ربط بالـ namespace العام
if (typeof GAME !== 'undefined') {
  GAME.PerformanceOptimizer = PerformanceOptimizer;
}

// تصدير للوحدات
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceOptimizer;
}
