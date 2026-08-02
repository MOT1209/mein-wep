/**
 * EnhancedSoundManager.js - نظام إدارة الصوت المحسّن
 * Farm Game 3D - Production Quality
 *
 * نظام صوت خفيف ومحسّن يكمل AudioManager الأساسي
 * يدعم:
 * - إدارة صوت متعدد مع حد أقصى للتشغيل المتزامن
 * - إعادة تدوير عناصر الصوت لتقليل استهلاك الذاكرة
 * - تأثيرات صوتية للبيئة
 * - تقليل استهلاك الموارد
 * - واجهة بسيطة وسريعة
 */

var GAME = GAME || {};

GAME.EnhancedSoundManager = {
  // ═══════════════════════════════════════════════════════
  // المتغيرات
  // ═══════════════════════════════════════════════════════
  
  /**
   * خريطة الأصوات المحملة
   * @type {Object.<string, HTMLAudioElement>}
   */
  sounds: {},
  
  /**
   * قائمة الأصوات النشطة حالياً
   * @type {HTMLAudioElement[]}
   */
  activeSounds: [],
  
  /**
   * الحد الأقصى للتشغيل المتزامن
   * @type {number}
   */
  maxConcurrent: 5,
  
  /**
   * مستوى الصوت الافتراضي
   * @type {number}
   */
  volume: 0.5,
  
  /**
   * مرجع للعبة الرئيسية
   * @type {Object}
   */
  game: null,
  
  /**
   * سياق Web Audio API
   * @type {AudioContext}
   */
  audioContext: null,
  
  /**
   * عقدة التحكم بالصوت الرئيسية
   * @type {GainNode}
   */
  masterGain: null,
  
  /**
   * حالة التهيئة
   * @type {boolean}
   */
  isInitialized: false,
  
  // ═══════════════════════════════════════════════════════
  // التهيئة
  // ═══════════════════════════════════════════════════════
  
  /**
   * تهيئة نظام الصوت المحسّن
   * @param {Object} game - مرجع اللعبة الرئيسية
   */
  init: function(game) {
    this.game = game;
    this.setupAudioContext();
    this.isInitialized = true;
    console.log('[EnhancedSoundManager] تم التهيئة بنجاح');
  },
  
  /**
   * إعداد سياق الصوت باستخدام Web Audio API
   */
  setupAudioContext: function() {
    try {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        
        // إنشاء عقدة التحكم بالصوت الرئيسية
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = this.volume;
        
        console.log('[EnhancedSoundManager] Web Audio API جاهز');
      }
    } catch (e) {
      console.warn('[EnhancedSoundManager] Web Audio API غير مدعوم، استخدام البديل');
    }
  },
  
  // ═══════════════════════════════════════════════════════
  // تحميل الأصوات
  // ═══════════════════════════════════════════════════════
  
  /**
   * تحميل ملف صوتي
   * @param {string} id - المعرف الفريد للصوت
   * @param {string} path - المسار للملف الصوتي
   * @returns {Promise<HTMLAudioElement>}
   */
  loadSound: function(id, path) {
    var self = this;
    
    return new Promise(function(resolve, reject) {
      // التحقق من وجود الصوت مسبقاً
      if (self.sounds[id]) {
        resolve(self.sounds[id]);
        return;
      }
      
      var audio = new Audio();
      audio.src = path;
      audio.preload = 'auto';
      
      audio.oncanplaythrough = function() {
        self.sounds[id] = audio;
        resolve(audio);
      };
      
      audio.onerror = function(error) {
        reject(error);
      };
    });
  },
  
  /**
   * تحميل مجموعة من الأصوات دفعة واحدة
   * @param {Object.<string, string>} soundMap - خريطة المعرفات والمسارات
   * @returns {Promise<void>}
   */
  loadSounds: function(soundMap) {
    var self = this;
    var promises = [];
    
    Object.keys(soundMap).forEach(function(id) {
      promises.push(self.loadSound(id, soundMap[id]));
    });
    
    return Promise.all(promises).then(function() {
      console.log('[EnhancedSoundManager] تم تحميل ' + promises.length + ' ملفات صوتية');
    });
  },
  
  // ═══════════════════════════════════════════════════════
  // تشغيل وإيقاف الأصوات
  // ═══════════════════════════════════════════════════════
  
  /**
   * تشغيل صوت
   * @param {string} id - معرف الصوت
   * @param {Object} options - خيارات التشغيل
   * @param {number} [options.volume] - مستوى الصوت (0-1)
   * @param {boolean} [options.loop] - تكرار الصوت
   * @param {number} [options.fadeIn] - مدة الظهور التدريجي (بالميلي ثانية)
   * @returns {HTMLAudioElement|null}
   */
  play: function(id, options) {
    if (!this.sounds[id]) {
      console.warn('[EnhancedSoundManager] صوت غير موجود:', id);
      return null;
    }
    
    options = options || {};
    
    // إنشاء نسخة جديدة من الصوت
    var sound = this.sounds[id].cloneNode();
    var playVolume = (options.volume !== undefined ? options.volume : this.volume) * this.volume;
    
    // التحقق من الحد الأقصى للتشغيل المتزامن
    if (this.activeSounds.length >= this.maxConcurrent) {
      var oldest = this.activeSounds.shift();
      if (oldest) {
        oldest.pause();
        oldest.currentTime = 0;
        oldest.volume = 0;
      }
    }
    
    // تطبيق الإعدادات
    sound.volume = playVolume;
    sound.loop = options.loop || false;
    
    // تأثير الظهور التدريجي
    if (options.fadeIn && options.fadeIn > 0) {
      sound.volume = 0;
      var fadeStep = playVolume / (options.fadeIn / 50);
      var currentVolume = 0;
      var fadeInterval = setInterval(function() {
        currentVolume += fadeStep;
        if (currentVolume >= playVolume) {
          sound.volume = playVolume;
          clearInterval(fadeInterval);
        } else {
          sound.volume = currentVolume;
        }
      }, 50);
    }
    
    // تشغيل الصوت
    var playPromise = sound.play();
    if (playPromise !== undefined) {
      playPromise.catch(function(error) {
        console.warn('[EnhancedSoundManager] خطأ في التشغيل:', error);
      });
    }
    
    // إضافة إلى القائمة النشطة
    this.activeSounds.push(sound);
    
    // إزالة تلقائي بعد الانتهاء (إذا لم يكن مكرراً)
    if (!sound.loop) {
      sound.onended = function() {
        var index = GAME.EnhancedSoundManager.activeSounds.indexOf(sound);
        if (index > -1) {
          GAME.EnhancedSoundManager.activeSounds.splice(index, 1);
        }
      };
    }
    
    return sound;
  },
  
  /**
   * تشغيل صوت بمجرد نقرة
   * @param {string} id - معرف الصوت
   */
  playClick: function(id) {
    return this.play(id, { volume: 0.3 });
  },
  
  /**
   * تشغيل صوت البيئة المستمر
   * @param {string} id - معرف الصوت
   * @param {number} [volume] - مستوى الصوت
   * @returns {HTMLAudioElement|null}
   */
  playAmbient: function(id, volume) {
    return this.play(id, {
      loop: true,
      volume: volume || 0.2
    });
  },
  
  /**
   * إيقاف صوت محدد
   * @param {HTMLAudioElement} sound - عنصر الصوت
   * @param {number} [fadeOut] - مدة الاختفاء التدريجي (بالميلي ثانية)
   */
  stop: function(sound, fadeOut) {
    if (!sound) return;
    
    if (fadeOut && fadeOut > 0) {
      var self = this;
      var originalVolume = sound.volume;
      var fadeStep = originalVolume / (fadeOut / 50);
      var currentVolume = originalVolume;
      
      var fadeInterval = setInterval(function() {
        currentVolume -= fadeStep;
        if (currentVolume <= 0) {
          sound.volume = 0;
          sound.pause();
          sound.currentTime = 0;
          clearInterval(fadeInterval);
          
          var index = self.activeSounds.indexOf(sound);
          if (index > -1) {
            self.activeSounds.splice(index, 1);
          }
        } else {
          sound.volume = currentVolume;
        }
      }, 50);
    } else {
      sound.pause();
      sound.currentTime = 0;
      
      var index = this.activeSounds.indexOf(sound);
      if (index > -1) {
        this.activeSounds.splice(index, 1);
      }
    }
  },
  
  /**
   * إيقاف جميع الأصوات النشطة
   */
  stopAll: function() {
    this.activeSounds.forEach(function(sound) {
      sound.pause();
      sound.currentTime = 0;
      sound.volume = 0;
    });
    this.activeSounds = [];
  },
  
  /**
   * إيقاف جميع الأصوات المكررة (البيئة)
   */
  stopAllLooping: function() {
    var self = this;
    var soundsToRemove = [];
    
    this.activeSounds.forEach(function(sound) {
      if (sound.loop) {
        soundsToRemove.push(sound);
      }
    });
    
    soundsToRemove.forEach(function(sound) {
      self.stop(sound);
    });
  },
  
  // ═══════════════════════════════════════════════════════
  // التحكم بالصوت
  // ═══════════════════════════════════════════════════════
  
  /**
   * تغيير مستوى الصوت الرئيسي
   * @param {number} vol - المستوى الجديد (0-1)
   */
  setVolume: function(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    }
    
    // تحديث جميع الأصوات النشطة
    this.activeSounds.forEach(function(sound) {
      sound.volume = vol;
    });
  },
  
  /**
   * تغيير الحد الأقصى للتشغيل المتزامن
   * @param {number} max - العدد الأقصى
   */
  setMaxConcurrent: function(max) {
    this.maxConcurrent = Math.max(1, Math.min(20, max));
  },
  
  /**
   * الحصول على عدد الأصوات النشطة
   * @returns {number}
   */
  getActiveCount: function() {
    return this.activeSounds.length;
  },
  
  /**
   * الحصول على الحد الأقصى للتشغيل المتزامن
   * @returns {number}
   */
  getMaxConcurrent: function() {
    return this.maxConcurrent;
  },
  
  // ═══════════════════════════════════════════════════════
  // إدارة الموارد
  // ═══════════════════════════════════════════════════════
  
  /**
   * تحرير الذاكرة من الأصوات غير المستخدمة
   */
  cleanup: function() {
    var soundsToKeep = [];
    
    this.activeSounds.forEach(function(sound) {
      if (!sound.paused || sound.loop) {
        soundsToKeep.push(sound);
      } else {
        sound.src = '';
      }
    });
    
    this.activeSounds = soundsToKeep;
  },
  
  /**
   * الحصول على إحصائيات النظام
   * @returns {Object}
   */
  getStats: function() {
    return {
      loadedSounds: Object.keys(this.sounds).length,
      activeSounds: this.activeSounds.length,
      maxConcurrent: this.maxConcurrent,
      volume: this.volume
    };
  },
  
  // ═══════════════════════════════════════════════════════
  // التدمير
  // ═══════════════════════════════════════════════════════
  
  /**
   * تدمير النظام وتحرير جميع الموارد
   */
  destroy: function() {
    this.stopAll();
    this.sounds = {};
    this.activeSounds = [];
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.masterGain = null;
    this.isInitialized = false;
    
    console.log('[EnhancedSoundManager] تم التدمير');
  }
};