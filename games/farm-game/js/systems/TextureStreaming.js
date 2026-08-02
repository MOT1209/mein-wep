/**
 * TextureStreaming - نظام تحميل الملمس الذكي
 * يحمّل الملمس حسب الحاجة ويقلل استهلاك الذاكرة
 * 
 * الميزات:
 * - تحميل الملمس عن طريق المسافة
 * - إدارة ذاكرة التخزين المؤقت بحد أقصى 50MB
 * - إزالة الملمس القديم باستخدام LRU
 * - جدولة تحميل الأولوية
 */

(function() {
  'use strict';

  var TextureStreaming = {
    textureCache: {},
    loadingTextures: {},
    textureSizes: {},
    accessTimes: {},
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    currentCacheSize: 0,
    loadingQueue: [],
    isLoading: false,
    maxConcurrentLoads: 4,
    stats: {
      loaded: 0,
      cached: 0,
      unloaded: 0,
      errors: 0
    },
    qualityLevels: {
      high: { suffix: '_high', maxDistance: 50 },
      medium: { suffix: '_medium', maxDistance: 100 },
      low: { suffix: '_low', maxDistance: Infinity }
    },
    listeners: {},
    game: null,

    /**
     * تهيئة نظام تحميل الملمس
     */
    init: function(game) {
      this.game = game;
      this.textureCache = {};
      this.loadingTextures = {};
      this.textureSizes = {};
      this.accessTimes = {};
      this.currentCacheSize = 0;
      this.loadingQueue = [];
      this.isLoading = false;
      
      console.log('[TextureStreaming] Initialized with max cache: ' + 
        (this.maxCacheSize / 1024 / 1024).toFixed(1) + 'MB');
      
      return this;
    },

    /**
     * تحميل ملمس واحد
     */
    loadTexture: function(path, priority) {
      var self = this;
      priority = priority || 'normal';
      
      // إرجاع الملمس المخزن مؤقتاً إذا كان موجوداً
      if (this.textureCache[path]) {
        this.updateAccessTime(path);
        this.stats.cached++;
        return Promise.resolve(this.textureCache[path]);
      }
      
      // إرجاع Promise التحميل إذا كان قيد التحميل بالفعل
      if (this.loadingTextures[path]) {
        return this.loadingTextures[path];
      }
      
      // إنشاء Promise جديد للتحميل
      var promise = new Promise(function(resolve, reject) {
        var loader = new THREE.TextureLoader();
        
        // تحسين إعدادات التحميل
        loader.crossOrigin = 'anonymous';
        
        loader.load(
          path,
          function(texture) {
            // إعداد خصائص الملمس
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            
            // حساب حجم الملمس
            var size = self.calculateTextureSize(texture);
            
            // حفظ في التخزين المؤقت
            self.textureCache[path] = texture;
            self.textureSizes[path] = size;
            self.updateAccessTime(path);
            self.currentCacheSize += size;
            
            delete self.loadingTextures[path];
            
            // التحقق من حجم التخزين المؤقت
            self.checkCacheSize();
            
            self.stats.loaded++;
            self.emit('textureLoaded', { path: path, size: size });
            
            console.log('[TextureStreaming] Loaded: ' + path + ' (' + 
              (size / 1024).toFixed(1) + 'KB)');
            
            resolve(texture);
          },
          function(progress) {
            // يمكن إضافة تحديثات التقدم هنا
          },
          function(error) {
            delete self.loadingTextures[path];
            self.stats.errors++;
            self.emit('textureError', { path: path, error: error });
            console.warn('[TextureStreaming] Failed to load: ' + path, error);
            reject(error);
          }
        );
      });
      
      this.loadingTextures[path] = promise;
      return promise;
    },

    /**
     * تحميل ملمس بناءً على المسافة
     */
    loadTextureForDistance: function(path, distance, callback) {
      var self = this;
      var quality = this.getQualityForDistance(distance);
      
      // بناء المسار بالجودة المناسبة
      var texturedPath = path + this.qualityLevels[quality].suffix;
      
      return this.loadTexture(texturedPath, 'normal').then(function(texture) {
        if (callback) callback(texture, quality);
        return texture;
      });
    },

    /**
     * تحميل مجموعة من الملمسات
     */
    loadTextures: function(paths, priority) {
      var self = this;
      var promises = paths.map(function(path) {
        return self.loadTexture(path, priority);
      });
      return Promise.all(promises);
    },

    /**
     * تحميل ملمس مع أولوية عالية (لل物体 المهمة)
     */
    loadTextureHighPriority: function(path) {
      return this.loadTexture(path, 'high');
    },

    /**
     * إضافة ملمس إلى قائمة الانتظار
     */
    queueTexture: function(path, priority) {
      if (this.textureCache[path] || this.loadingTextures[path]) {
        return;
      }
      
      this.loadingQueue.push({
        path: path,
        priority: priority || 'normal',
        timestamp: Date.now()
      });
      
      // ترتيب حسب الأولوية
      this.loadingQueue.sort(function(a, b) {
        var priorityOrder = { high: 0, normal: 1, low: 2 };
        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
      });
      
      this.processQueue();
    },

    /**
     * معالجة قائمة الانتظار
     */
    processQueue: function() {
      var self = this;
      
      if (this.isLoading || this.loadingQueue.length === 0) {
        return;
      }
      
      var concurrent = Math.min(
        this.maxConcurrentLoads,
        this.loadingQueue.length
      );
      
      this.isLoading = true;
      
      var batch = this.loadingQueue.splice(0, concurrent);
      var promises = batch.map(function(item) {
        return self.loadTexture(item.path, item.priority);
      });
      
      Promise.all(promises).then(function() {
        self.isLoading = false;
        self.processQueue();
      }).catch(function() {
        self.isLoading = false;
        self.processQueue();
      });
    },

    /**
     * تحميل ملمسات المشهد الأولي
     */
    preloadSceneTextures: function(texturePaths) {
      var self = this;
      var promises = texturePaths.map(function(path) {
        return self.loadTexture(path, 'high');
      });
      
      return Promise.all(promises).then(function(textures) {
        console.log('[TextureStreaming] Preloaded ' + textures.length + 
          ' scene textures');
        return textures;
      });
    },

    /**
     * تحميل ملمسات المنطقة المحيطة
     */
    loadNearbyTextures: function(center, radius, textureMap) {
      var self = this;
      var promises = [];
      
      for (var path in textureMap) {
        var position = textureMap[path];
        var distance = this.calculateDistance(center, position);
        
        if (distance <= radius) {
          var quality = this.getQualityForDistance(distance);
          var texturedPath = path + this.qualityLevels[quality].suffix;
          promises.push(this.loadTexture(texturedPath, 'normal'));
        }
      }
      
      return Promise.all(promises);
    },

    /**
     * تفريغ الملمسات البعيدة
     */
    unloadDistantTextures: function(playerPos, maxDistance) {
      var self = this;
      var unloaded = 0;
      
      for (var key in this.textureCache) {
        // التحقق من المسافة (يحتاج مواقع الأشياء)
        // حالياً نتحقق فقط من حجم التخزين المؤقت
        var accessTime = this.accessTimes[key] || 0;
        var timeSinceAccess = Date.now() - accessTime;
        
        // تفريغ الملمسات التي لم تُستخدم منذ أكثر من 5 دقائق
        if (timeSinceAccess > 5 * 60 * 1000) {
          this.unloadTexture(key);
          unloaded++;
        }
      }
      
      this.checkCacheSize();
      
      if (unloaded > 0) {
        console.log('[TextureStreaming] Unloaded ' + unloaded + 
          ' distant textures');
      }
      
      return unloaded;
    },

    /**
     * تفريغ ملمس واحد
     */
    unloadTexture: function(path) {
      if (this.textureCache[path]) {
        this.textureCache[path].dispose();
        
        var size = this.textureSizes[path] || 0;
        this.currentCacheSize -= size;
        
        delete this.textureCache[path];
        delete this.textureSizes[path];
        delete this.accessTimes[path];
        
        this.stats.unloaded++;
        this.emit('textureUnloaded', { path: path });
        
        return true;
      }
      return false;
    },

    /**
     * تفريغ جميع الملمسات
     */
    clearCache: function() {
      var count = 0;
      for (var key in this.textureCache) {
        this.textureCache[key].dispose();
        count++;
      }
      
      this.textureCache = {};
      this.textureSizes = {};
      this.accessTimes = {};
      this.currentCacheSize = 0;
      
      console.log('[TextureStreaming] Cache cleared (' + count + 
        ' textures removed)');
      
      this.emit('cacheCleared', { count: count });
      return count;
    },

    /**
     * تفريغ ملمسات فئة معينة
     */
    clearCategory: function(category) {
      var self = this;
      var count = 0;
      
      Object.keys(this.textureCache).forEach(function(key) {
        if (key.indexOf(category) !== -1) {
          self.unloadTexture(key);
          count++;
        }
      });
      
      console.log('[TextureStreaming] Cleared category: ' + category + 
        ' (' + count + ' textures)');
      
      return count;
    },

    /**
     * التحقق من حجم التخزين المؤقت
     */
    checkCacheSize: function() {
      while (this.currentCacheSize > this.maxCacheSize) {
        var oldestKey = this.getOldestTexture();
        if (oldestKey) {
          this.unloadTexture(oldestKey);
        } else {
          break;
        }
      }
    },

    /**
     * حساب حجم الملمس
     */
    calculateTextureSize: function(texture) {
      if (texture.image) {
        var width = texture.image.width || 256;
        var height = texture.image.height || 256;
        var bytesPerPixel = 4; // RGBA
        return width * height * bytesPerPixel;
      }
      return 0;
    },

    /**
     * تحديث وقت الوصول
     */
    updateAccessTime: function(path) {
      this.accessTimes[path] = Date.now();
    },

    /**
     * الحصول على الجودة المناسبة للمسافة
     */
    getQualityForDistance: function(distance) {
      if (distance <= this.qualityLevels.high.maxDistance) {
        return 'high';
      } else if (distance <= this.qualityLevels.medium.maxDistance) {
        return 'medium';
      }
      return 'low';
    },

    /**
     * حساب المسافة بين نقطتين
     */
    calculateDistance: function(pos1, pos2) {
      var dx = pos1.x - pos2.x;
      var dy = pos1.y - pos2.y;
      var dz = pos1.z - pos2.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },

    /**
     * الحصول على الملمس الأقدم
     */
    getOldestTexture: function() {
      var oldestKey = null;
      var oldestTime = Infinity;
      
      for (var key in this.accessTimes) {
        if (this.accessTimes[key] < oldestTime) {
          oldestTime = this.accessTimes[key];
          oldestKey = key;
        }
      }
      
      return oldestKey;
    },

    /**
     * تحسين الملمسات للموبايل
     */
    optimizeForMobile: function() {
      this.maxCacheSize = 25 * 1024 * 1024; // 25MB للموبايل
      this.maxConcurrentLoads = 2;
      
      // تقليل جودة الملمسات المحملة
      for (var key in this.textureCache) {
        var texture = this.textureCache[key];
        if (texture && texture.image) {
          // يمكن تقليل الدقة هنا إذا لزم الأمر
        }
      }
      
      console.log('[TextureStreaming] Optimized for mobile');
    },

    /**
     * تحسين الملمسات للـ Desktop
     */
    optimizeForDesktop: function() {
      this.maxCacheSize = 100 * 1024 * 1024; // 100MB للديسكتوب
      this.maxConcurrentLoads = 8;
      
      console.log('[TextureStreaming] Optimized for desktop');
    },

    /**
     * تحسين الملمسات للـ VR
     */
    optimizeForVR: function() {
      this.maxCacheSize = 200 * 1024 * 1024; // 200MB للـ VR
      this.maxConcurrentLoads = 16;
      
      console.log('[TextureStreaming] Optimized for VR');
    },

    /**
     * جدولة تفريغ دوري
     */
    startPeriodicCleanup: function(intervalMs) {
      var self = this;
      intervalMs = intervalMs || 60000; // كل دقيقة افتراضياً
      
      this._cleanupInterval = setInterval(function() {
        self.checkCacheSize();
        self.unloadDistantTextures(null, Infinity);
      }, intervalMs);
      
      console.log('[TextureStreaming] Periodic cleanup started (' + 
        intervalMs + 'ms interval)');
    },

    /**
     * إيقاف التفريغ الدوري
     */
    stopPeriodicCleanup: function() {
      if (this._cleanupInterval) {
        clearInterval(this._cleanupInterval);
        this._cleanupInterval = null;
        console.log('[TextureStreaming] Periodic cleanup stopped');
      }
    },

    /**
     * الحصول على إحصائيات
     */
    getStats: function() {
      return {
        cacheSize: this.currentCacheSize,
        cacheSizeMB: (this.currentCacheSize / 1024 / 1024).toFixed(2),
        maxSizeMB: (this.maxCacheSize / 1024 / 1024).toFixed(2),
        textureCount: Object.keys(this.textureCache).length,
        loadingCount: Object.keys(this.loadingTextures).length,
        queueLength: this.loadingQueue.length,
        stats: Object.assign({}, this.stats)
      };
    },

    /**
     * الحصول على حالة ملمس معين
     */
    getTextureStatus: function(path) {
      if (this.textureCache[path]) {
        return 'cached';
      }
      if (this.loadingTextures[path]) {
        return 'loading';
      }
      return 'not_loaded';
    },

    /**
     * التحقق من وجود ملمس
     */
    hasTexture: function(path) {
      return !!this.textureCache[path];
    },

    /**
     * الحصول على ملمس من التخزين المؤقت
     */
    getTexture: function(path) {
      if (this.textureCache[path]) {
        this.updateAccessTime(path);
        return this.textureCache[path];
      }
      return null;
    },

    /**
     * تسجيل حدث
     */
    on: function(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
      return this;
    },

    /**
     * إلغاء تسجيل حدث
     */
    off: function(event, callback) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(function(cb) {
          return cb !== callback;
        });
      }
      return this;
    },

    /**
     * إطلاق حدث
     */
    emit: function(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(function(callback) {
          callback(data);
        });
      }
    },

    /**
     * تدمير النظام
     */
    destroy: function() {
      this.stopPeriodicCleanup();
      this.clearCache();
      this.loadingQueue = [];
      this.loadingTextures = {};
      this.listeners = {};
      
      console.log('[TextureStreaming] Destroyed');
    }
  };

  // ربط النظام بنطاق اللعبة
  if (typeof GAME !== 'undefined') {
    GAME.TextureStreaming = TextureStreaming;
  } else {
    window.GAME = window.GAME || {};
    window.GAME.TextureStreaming = TextureStreaming;
  }

  console.log('[TextureStreaming] System loaded');
})();
