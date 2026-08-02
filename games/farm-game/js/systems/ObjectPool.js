/**
 * ObjectPool.js - نظام إدارة الذاكرة لتقليل التأثير (Object Pooling)
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - إنشاء وتخزين وإعادة استخدام كائنات Three.js
 * - تقليل عمليات الإنشاء والتدمير المتكررة
 * - تعبئة مسبقة (prewarm) للكائنات الأكثر استخداماً
 * - حماية الذاكرة عبر تنظيف آمن للموارد
 * - دمج مع DisposeManager للتنزيل الآمن
 * - إحصائيات الأداء والتحكم في الحجم الأقصى
 *
 * Usage:
 *   GAME.ObjectPool.create('particle', factoryFn, 50);
 *   const obj = GAME.ObjectPool.get('particle');
 *   // ... use obj ...
 *   GAME.ObjectPool.release('particle', obj);
 */

var GAME = GAME || {};

// ============================================================
// ObjectPool - نظام إدارة الكائنات المتكررة
// ============================================================
GAME.ObjectPool = {
  // بيانات المجمعات (pools)
  pools: {},

  // إحصائيات الأداء
  stats: {
    totalCreated: 0,
    totalReused: 0,
    totalReleased: 0,
    activeObjects: 0
  },

  // الحجم الأقصى لكل مجمع (لمنع التوغير اللامحدود)
  maxPoolSize: 1000,

  /**
   * إنشاء مجمع جديد
   * @param {string} key - مفتاح المجمع (مثلاً: 'particle', 'bullet', 'resource')
   * @param {Function} factory - دالة إنشاء الكائنات الجديدة
   * @param {number} initialSize - عدد الكائنات الأولية
   * @param {Object} options - خيارات إضافية
   * @returns {Object} معلومات المجمع
   */
  create: function(key, factory, initialSize, options) {
    options = options || {};

    if (this.pools[key]) {
      console.warn('[ObjectPool] Pool "' + key + '" already exists. Use prewarm() to add more.');
      return this.pools[key];
    }

    initialSize = initialSize || 0;

    this.pools[key] = {
      key: key,
      factory: factory,
      available: [],       // الكائنات الجاهزة للاستخدام
      active: new Set(),   // الكائنات المستخدمة حالياً
      maxSize: options.maxSize || this.maxPoolSize,
      initialSize: initialSize,
      createdAt: Date.now()
    };

    // تعبئة مسبقة إذا كان العدد أكبر من 0
    if (initialSize > 0) {
      this.prewarm(key, factory, initialSize);
    }

    console.log('[ObjectPool] Created pool "' + key + '" with ' + this.pools[key].available.length + ' objects.');
    return this.pools[key];
  },

  /**
   * الحصول على كائن من المجمع
   * @param {string} key - مفتاح المجمع
   * @returns {Object|null} الكائن المتاح، أو null إذا فشل الإنشاء
   */
  get: function(key) {
    const pool = this.pools[key];

    if (!pool) {
      console.error('[ObjectPool] Pool "' + key + '" does not exist. Create it first.');
      return null;
    }

    let obj = null;

    if (pool.available.length > 0) {
      // إعادة استخدام كائن موجود
      obj = pool.available.pop();
      this.stats.totalReused++;
    } else {
      // إنشاء كائن جديد إذا لم نتجاوز الحد الأقصى
      if (pool.active.size < pool.maxSize) {
        obj = pool.factory();
        this.stats.totalCreated++;
      } else {
        console.warn('[ObjectPool] Pool "' + key + '" reached max size (' + pool.maxSize + ').');
        return null;
      }
    }

    if (obj !== null && obj !== undefined) {
      pool.active.add(obj);
      this.stats.activeObjects++;
    }

    return obj;
  },

  /**
   * إعادة كائن إلى المجمع
   * @param {string} key - مفتاح المجمع
   * @param {Object} obj - الكائن المراد إعادته
   * @returns {boolean} هل تمت الإعادة بنجاح
   */
  release: function(key, obj) {
    const pool = this.pools[key];

    if (!pool) {
      console.error('[ObjectPool] Pool "' + key + '" does not exist.');
      return false;
    }

    if (!pool.active.has(obj)) {
      console.warn('[ObjectPool] Object not found in active pool "' + key + '".');
      return false;
    }

    // إزالة من القائمة النشطة
    pool.active.delete(obj);
    this.stats.activeObjects--;

    // إعادة تعيين خصائص الكائن إذا كان عليه واجهة معينة
    if (typeof obj.reset === 'function') {
      obj.reset();
    }

    // التحقق من عدم تجاوز الحد الأقصى
    if (pool.available.length < pool.maxSize) {
      pool.available.push(obj);
      this.stats.totalReleased++;
    } else {
      // إذا كنا نتجاوز الحد، ندمر الكائن بدلإعادته
      this._safeDispose(obj);
    }

    return true;
  },

  /**
   * تعبئة مسبقة للكائنات
   * @param {string} key - مفتاح المجمع
   * @param {Function} factory - دالة إنشاء الكائنات (اختياري، يستخدم الخاصية المحفوظة)
   * @param {number} count - عدد الكائنات المراد إنشاؤها
   */
  prewarm: function(key, factory, count) {
    const pool = this.pools[key];

    if (!pool) {
      console.error('[ObjectPool] Pool "' + key + '" does not exist. Create it first.');
      return;
    }

    const fn = factory || pool.factory;
    count = count || 0;

    for (let i = 0; i < count; i++) {
      if (pool.available.length < pool.maxSize) {
        const obj = fn();
        if (obj !== null && obj !== undefined) {
          pool.available.push(obj);
          this.stats.totalCreated++;
        }
      } else {
        console.warn('[ObjectPool] Prewarm stopped: pool "' + key + '" reached max size.');
        break;
      }
    }

    console.log('[ObjectPool] Prewarmed "' + key + '": ' + count + ' objects created. Total available: ' + pool.available.length);
  },

  /**
   * تحرير جميع الكائنات في مجمع معين
   * @param {string} key - مفتاح المجمع
   */
  dispose: function(key) {
    const pool = this.pools[key];

    if (!pool) {
      console.warn('[ObjectPool] Pool "' + key + '" does not exist.');
      return;
    }

    // تحرير جميع الكائنات النشطة
    const activeArray = Array.from(pool.active);
    for (let i = 0; i < activeArray.length; i++) {
      this._safeDispose(activeArray[i]);
    }

    // تحرير جميع الكائنات المتاحة
    for (let i = 0; i < pool.available.length; i++) {
      this._safeDispose(pool.available[i]);
    }

    // تحديث الإحصائيات
    this.stats.activeObjects -= activeArray.length;

    // حذف المجمع
    delete this.pools[key];

    console.log('[ObjectPool] Disposed pool "' + key + '" (' + activeArray.length + ' active + ' + pool.available.length + ' available objects released).');
  },

  /**
   * تحرير جميع المجمعات
   */
  disposeAll: function() {
    const keys = Object.keys(this.pools);
    for (let i = 0; i < keys.length; i++) {
      this.dispose(keys[i]);
    }

    console.log('[ObjectPool] All pools disposed.');
  },

  /**
   * إعادة تعيين جميع المجمعات (إعادة تعبئة بعد التصفير)
   */
  reset: function() {
    const keys = Object.keys(this.pools);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const pool = this.pools[key];

      // تحرير الكائنات النشطة
      pool.active.clear();

      // إعادة تعبئة المجمع
      this.prewarm(key, pool.factory, pool.initialSize);
    }

    this.stats.activeObjects = 0;
    console.log('[ObjectPool] All pools reset.');
  },

  /**
   * الحصول على إحصائيات الأداء
   * @returns {Object} إحصائيات مفصلة
   */
  getStats: function() {
    const poolStats = {};
    const keys = Object.keys(this.pools);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const pool = this.pools[key];
      poolStats[key] = {
        available: pool.available.length,
        active: pool.active.size,
        total: pool.available.length + pool.active.size,
        maxSize: pool.maxSize,
        utilization: pool.active.size / pool.maxSize
      };
    }

    return {
      totalCreated: this.stats.totalCreated,
      totalReused: this.stats.totalReused,
      totalReleased: this.stats.totalReleased,
      activeObjects: this.stats.activeObjects,
      pools: poolStats,
      reuseRatio: this.stats.totalCreated > 0
        ? (this.stats.totalReused / (this.stats.totalCreated + this.stats.totalReused) * 100).toFixed(1) + '%'
        : '0%'
    };
  },

  /**
   * تقليل حجم المجمع (إزالة الكائنات الزائدة)
   * @param {string} key - مفتاح المجمع
   * @param {number} targetSize - الحجم المطلوب
   */
  shrink: function(key, targetSize) {
    const pool = this.pools[key];

    if (!pool) {
      console.warn('[ObjectPool] Pool "' + key + '" does not exist.');
      return;
    }

    let removed = 0;
    while (pool.available.length > targetSize && pool.available.length > 0) {
      const obj = pool.available.pop();
      this._safeDispose(obj);
      removed++;
    }

    console.log('[ObjectPool] Shrank "' + key + '": removed ' + removed + ' objects. Remaining: ' + pool.available.length);
  },

  /**
   * تنظيف آمن للكائن (يستخدم DisposeManager إذا كان متاحاً)
   * @param {Object} obj - الكائن المراد تنظيفه
   * @private
   */
  _safeDispose: function(obj) {
    if (!obj) return;

    // استخدام DisposeManager إذا كان متاحاً
    if (GAME.DisposeManager && typeof GAME.DisposeManager.dispose === 'function') {
      GAME.DisposeManager.dispose(obj);
      return;
    }

    // تنظيف يدوي آمن
    // Three.js objects
    if (typeof obj.geometry !== 'undefined' && obj.geometry) {
      if (typeof obj.geometry.dispose === 'function') {
        obj.geometry.dispose();
      }
    }
    if (typeof obj.material !== 'undefined' && obj.material) {
      this._disposeMaterial(obj.material);
    }
    if (typeof obj.texture !== 'undefined' && obj.texture) {
      if (typeof obj.texture.dispose === 'function') {
        obj.texture.dispose();
      }
    }

    // إزالة من المشهد إذا كان عليه parent
    if (obj.parent && typeof obj.parent.remove === 'function') {
      obj.parent.remove(obj);
    }
  },

  /**
   * تنظيف آمن للمادة (Material) مع دعم المواد المتعددة
   * @param {Object} material - المادة المراد تنظيفها
   * @private
   */
  _disposeMaterial: function(material) {
    if (!material) return;

    if (Array.isArray(material)) {
      for (let i = 0; i < material.length; i++) {
        this._disposeMaterial(material[i]);
      }
      return;
    }

    if (typeof material.dispose === 'function') {
      material.dispose();
    }
  },

  /**
   * التحقق من وجود مجمع
   * @param {string} key - مفتاح المجمع
   * @returns {boolean}
   */
  has: function(key) {
    return !!this.pools[key];
  },

  /**
   * الحصول على عدد الكائنات المتاحة في مجمع
   * @param {string} key - مفتاح المجمع
   * @returns {number}
   */
  availableCount: function(key) {
    const pool = this.pools[key];
    return pool ? pool.available.length : 0;
  },

  /**
   * الحصول على عدد الكائنات النشطة في مجمع
   * @param {string} key - مفتاح المجمع
   * @returns {number}
   */
  activeCount: function(key) {
    const pool = this.pools[key];
    return pool ? pool.active.size : 0;
  },

  /**
   * عرض معلومات جميع المجمعات (للتشخيص)
   */
  printAll: function() {
    console.log('=== ObjectPool Status ===');
    console.log('Total created:', this.stats.totalCreated);
    console.log('Total reused:', this.stats.totalReused);
    console.log('Total released:', this.stats.totalReleased);
    console.log('Active objects:', this.stats.activeObjects);
    console.log('---');

    const keys = Object.keys(this.pools);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const pool = this.pools[key];
      console.log(key + ':', pool.available.length, 'available |', pool.active.size, 'active | max:', pool.maxSize);
    }
    console.log('========================');
  }
};

// ============================================================
// ObjectPool Presets - مجمعات جاهزة للاستخدام
// ============================================================
GAME.ObjectPool.presets = {
  /**
   * مجمع الجسيمات (Particles)
   */
  particle: function(scene) {
    return {
      position: new GAME.THREE.Vector3(),
      velocity: new GAME.THREE.Vector3(),
      life: 0,
      maxLife: 1,
      size: 1,
      color: new GAME.THREE.Color(),
      reset: function() {
        this.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.life = 0;
        this.maxLife = 1;
        this.size = 1;
      }
    };
  },

  /**
   * مجمع الأعداء (Enemies)
   */
  enemy: function(scene) {
    return {
      mesh: null,
      health: 100,
      speed: 1,
      damage: 10,
      position: new GAME.THREE.Vector3(),
      reset: function() {
        this.health = 100;
        this.speed = 1;
        this.damage = 10;
        this.position.set(0, 0, 0);
      }
    };
  },

  /**
   * مجمع الموارد (Resources)
   */
  resource: function(scene) {
    return {
      mesh: null,
      type: 'wood',
      amount: 1,
      position: new GAME.THREE.Vector3(),
      reset: function() {
        this.type = 'wood';
        this.amount = 1;
        this.position.set(0, 0, 0);
      }
    };
  }
};

// ============================================================
// ObjectPool Helper - وظائف مساعدة
// ============================================================
GAME.ObjectPoolHelpers = {
  /**
   * إنشاء مجمعات اللعبة الأساسية
   * @param {Object} scene - مشهد Three.js
   */
  initGamePools: function(scene) {
    // مجمع الجسيمات
    GAME.ObjectPool.create(
      'particles',
      function() { return GAME.ObjectPool.presets.particle(scene); },
      100,
      { maxSize: 500 }
    );

    // مجمع الأعداء
    GAME.ObjectPool.create(
      'enemies',
      function() { return GAME.ObjectPool.presets.enemy(scene); },
      10,
      { maxSize: 50 }
    );

    // مجمع الموارد
    GAME.ObjectPool.create(
      'resources',
      function() { return GAME.ObjectPool.presets.resource(scene); },
      50,
      { maxSize: 200 }
    );

    console.log('[ObjectPool] Game pools initialized.');
  },

  /**
   * الحصول على تقرير شامل عن استخدام الذاكرة
   */
  getMemoryReport: function() {
    const stats = GAME.ObjectPool.getStats();
    let report = '=== Memory Report ===\n';
    report += 'Objects Created: ' + stats.totalCreated + '\n';
    report += 'Objects Reused: ' + stats.totalReused + '\n';
    report += 'Objects Released: ' + stats.totalReleased + '\n';
    report += 'Currently Active: ' + stats.activeObjects + '\n';
    report += 'Reuse Ratio: ' + stats.reuseRatio + '\n';
    report += '---\n';

    const poolKeys = Object.keys(stats.pools);
    for (let i = 0; i < poolKeys.length; i++) {
      const key = poolKeys[i];
      const pool = stats.pools[key];
      report += key + ': ' + pool.total + '/' + pool.maxSize +
        ' (' + (pool.utilization * 100).toFixed(1) + '% utilized)\n';
    }

    return report;
  }
};

console.log('[ObjectPool.js] Object Pool system loaded.');
