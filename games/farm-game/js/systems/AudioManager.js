/**
 * AudioManager.js - نظام الموسيقى والأصوات المحسّن
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - إدارة موسيقى منفصلة لكل منطقة ووقت
 * - Crossfade سلس بين الموسيقات
 * - 11+ مؤثر صوتي للإجراءات المختلفة
 * - التحكم في مستوى الصوت (موسيقى + أصوات)
 * - حفظ الإعدادات في localStorage
 * - كتم الصوت السريع
 * - تتبع الحالة الحالية
 * - نظام أقراص موسيقى متعدد
 * - دعم تبديل المنطقة والوقت تلقائياً
 */

var GAME = GAME || {};

GAME.AudioManager = {
  // ─── الحالة ───
  isInitialized: false,
  isMuted: false,
  previousMuted: false,
  
  // ─── مستوى الصوت ───
  musicVolume: 0.3,
  sfxVolume: 0.5,
  masterVolume: 1.0,
  
  // ─── الحالة الحالية ───
  currentMusic: null,
  currentRegion: 'farm',
  currentPeriod: 'morning',
  previousMusic: null,
  isCrossfading: false,
  crossfadeProgress: 0,
  crossfadeDuration: 1.5,
  
  // ─── مسارات الموسيقى ───
  musicTracks: {
    farm: {
      morning: { id: 'farm_morning', file: 'music/farm_morning.mp3', bpm: 90, mood: 'peaceful' },
      afternoon: { id: 'farm_afternoon', file: 'music/farm_afternoon.mp3', bpm: 100, mood: 'cheerful' },
      evening: { id: 'farm_evening', file: 'music/farm_evening.mp3', bpm: 80, mood: 'calm' },
      night: { id: 'farm_night', file: 'music/farm_night.mp3', bpm: 60, mood: 'serene' }
    },
    village: {
      morning: { id: 'village_morning', file: 'music/village_morning.mp3', bpm: 110, mood: 'lively' },
      afternoon: { id: 'village_afternoon', file: 'music/village_afternoon.mp3', bpm: 115, mood: 'bustling' },
      evening: { id: 'village_evening', file: 'music/village_evening.mp3', bpm: 85, mood: 'cozy' },
      night: { id: 'village_night', file: 'music/village_night.mp3', bpm: 70, mood: 'quiet' }
    },
    forest: {
      morning: { id: 'forest_morning', file: 'music/forest_morning.mp3', bpm: 75, mood: 'mystical' },
      afternoon: { id: 'forest_afternoon', file: 'music/forest_afternoon.mp3', bpm: 85, mood: 'adventurous' },
      evening: { id: 'forest_evening', file: 'music/forest_evening.mp3', bpm: 70, mood: 'enigmatic' },
      night: { id: 'forest_night', file: 'music/forest_night.mp3', bpm: 55, mood: 'eerie' }
    },
    mine: {
      default: { id: 'mine_theme', file: 'music/mine_theme.mp3', bpm: 95, mood: 'industrial' }
    },
    beach: {
      default: { id: 'beach_theme', file: 'music/beach_theme.mp3', bpm: 100, mood: 'tropical' }
    },
    mountain: {
      default: { id: 'mountain_theme', file: 'music/mountain_theme.mp3', bpm: 80, mood: 'epic' }
    },
    ocean: {
      default: { id: 'ocean_theme', file: 'music/ocean_theme.mp3', bpm: 60, mood: 'peaceful' }
    },
    desert: {
      default: { id: 'desert_theme', file: 'music/desert_theme.mp3', bpm: 75, mood: 'mysterious' }
    },
    winter: {
      default: { id: 'winter_theme', file: 'music/winter_theme.mp3', bpm: 65, mood: 'cold' }
    },
    special: {
      festival: { id: 'festival_theme', file: 'music/festival_theme.mp3', bpm: 120, mood: 'festive' },
      boss: { id: 'boss_theme', file: 'music/boss_theme.mp3', bpm: 140, mood: 'intense' },
      victory: { id: 'victory_theme', file: 'music/victory_theme.mp3', bpm: 130, mood: 'triumphant' },
      shop: { id: 'shop_theme', file: 'music/shop_theme.mp3', bpm: 100, mood: 'shopping' }
    }
  },
  
  // ─── المؤثرات الصوتية ───
  sfx: {
    // أصوات الزراعة
    plow: { id: 'sfx_plow', file: 'sfx/plow.mp3', volume: 0.6 },
    water: { id: 'sfx_water', file: 'sfx/water.mp3', volume: 0.5 },
    plant: { id: 'sfx_plant', file: 'sfx/plant.mp3', volume: 0.4 },
    harvest: { id: 'sfx_harvest', file: 'sfx/harvest.mp3', volume: 0.5 },
    fertilize: { id: 'sfx_fertilize', file: 'sfx/fertilize.mp3', volume: 0.4 },
    
    // أصوات التجارة
    sell: { id: 'sfx_sell', file: 'sfx/sell.mp3', volume: 0.5 },
    buy: { id: 'sfx_buy', file: 'sfx/buy.mp3', volume: 0.5 },
    coins: { id: 'sfx_coins', file: 'sfx/coins.mp3', volume: 0.4 },
    
    // أصوات الحيوانات
    feed: { id: 'sfx_feed', file: 'sfx/feed.mp3', volume: 0.5 },
    collect: { id: 'sfx_collect', file: 'sfx/collect.mp3', volume: 0.5 },
    animal_happy: { id: 'sfx_animal_happy', file: 'sfx/animal_happy.mp3', volume: 0.4 },
    animal_sad: { id: 'sfx_animal_sad', file: 'sfx/animal_sad.mp3', volume: 0.4 },
    
    // أصوات الصناعة
    craft: { id: 'sfx_craft', file: 'sfx/craft.mp3', volume: 0.5 },
    craft_complete: { id: 'sfx_craft_complete', file: 'sfx/craft_complete.mp3', volume: 0.6 },
    cooking: { id: 'sfx_cooking', file: 'sfx/cooking.mp3', volume: 0.4 },
    
    // أصوات التقدم
    levelup: { id: 'sfx_levelup', file: 'sfx/levelup.mp3', volume: 0.7 },
    achievement: { id: 'sfx_achievement', file: 'sfx/achievement.mp3', volume: 0.6 },
    quest_complete: { id: 'sfx_quest_complete', file: 'sfx/quest_complete.mp3', volume: 0.6 },
    skill_up: { id: 'sfx_skill_up', file: 'sfx/skill_up.mp3', volume: 0.5 },
    
    // أصوات الواجهة
    click: { id: 'sfx_click', file: 'sfx/click.mp3', volume: 0.3 },
    hover: { id: 'sfx_hover', file: 'sfx/hover.mp3', volume: 0.2 },
    open: { id: 'sfx_open', file: 'sfx/open.mp3', volume: 0.4 },
    close: { id: 'sfx_close', file: 'sfx/close.mp3', volume: 0.4 },
    error: { id: 'sfx_error', file: 'sfx/error.mp3', volume: 0.5 },
    success: { id: 'sfx_success', file: 'sfx/success.mp3', volume: 0.5 },
    
    // أصوات البيئة
    rain: { id: 'sfx_rain', file: 'sfx/rain.mp3', volume: 0.3, loop: true },
    thunder: { id: 'sfx_thunder', file: 'sfx/thunder.mp3', volume: 0.6 },
    wind: { id: 'sfx_wind', file: 'sfx/wind.mp3', volume: 0.2, loop: true },
    birds: { id: 'sfx_birds', file: 'sfx/birds.mp3', volume: 0.2, loop: true },
    
    // أصوات الحركة
    footsteps_grass: { id: 'sfx_footsteps_grass', file: 'sfx/footsteps_grass.mp3', volume: 0.3 },
    footsteps_dirt: { id: 'sfx_footsteps_dirt', file: 'sfx/footsteps_dirt.mp3', volume: 0.3 },
    footsteps_wood: { id: 'sfx_footsteps_wood', file: 'sfx/footsteps_wood.mp3', volume: 0.3 },
    footsteps_stone: { id: 'sfx_footsteps_stone', file: 'sfx/footsteps_stone.mp3', volume: 0.3 },
    swim: { id: 'sfx_swim', file: 'sfx/swim.mp3', volume: 0.4 }
  },
  
  // ─── ذاكرة التخزين المؤقت ───
  _cache: {},
  _sfxInstances: {},
  _ambientSounds: {},
  
  // ─── الإعدادات الافتراضية ───
  _defaults: {
    musicVolume: 0.3,
    sfxVolume: 0.5,
    masterVolume: 1.0,
    isMuted: false
  },

  // ═══════════════════════════════════════════════════════
  // التهيئة
  // ═══════════════════════════════════════════════════════
  
  init: function(game) {
    this.game = game;
    
    // تحميل الإعدادات المحفوظة
    this.loadSettings();
    
    // إعداد Web Audio API إذا كان متاحاً
    this._initAudioContext();
    
    // تحميل مسارات الصوت الأساسية
    this._preloadCriticalAssets();
    
    this.isInitialized = true;
    console.log('[AudioManager] تم التهيئة بنجاح');
  },

  _initAudioContext: function() {
    try {
      // محاولة إنشاء سياق الصوت
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this._audioContext = new AudioContext();
        
        // إنشاء عقدة التحكم بالصوت الرئيسية
        this._masterGain = this._audioContext.createGain();
        this._masterGain.connect(this._audioContext.destination);
        this._masterGain.gain.value = this.masterVolume;
        
        // عقدة الموسيقى
        this._musicGain = this._audioContext.createGain();
        this._musicGain.connect(this._masterGain);
        this._musicGain.gain.value = this.musicVolume;
        
        // عقدة المؤثرات الصوتية
        this._sfxGain = this._audioContext.createGain();
        this._sfxGain.connect(this._masterGain);
        this._sfxGain.gain.value = this.sfxVolume;
        
        console.log('[AudioManager] Web Audio API جاهز');
      }
    } catch (e) {
      console.warn('[AudioManager] لم يتمكن من تهيئة Web Audio API:', e);
    }
  },

  _preloadCriticalAssets: function() {
    // تحميل الأصوات المهمة مسبقاً
    var criticalSfx = ['click', 'success', 'error', 'coins'];
    var self = this;

    criticalSfx.forEach(function(name) {
      self._loadSFX(name);
    });
  },

  /**
   * تحميل مؤثر صوتي إلى الكاش مسبقاً (بدون تشغيله)
   * @param {string} name - اسم المؤثر في this.sfx
   */
  _loadSFX: function(name) {
    var sfxData = this.sfx[name];
    if (!sfxData || !this._audioContext || this._cache[sfxData.file]) return;

    var self = this;
    var request = new XMLHttpRequest();
    request.open('GET', sfxData.file, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      self._audioContext.decodeAudioData(request.response, function(buffer) {
        self._cache[sfxData.file] = buffer;
      }, function(error) {
        console.warn('[AudioManager] خطأ في تحميل SFX:', sfxData.file, error);
      });
    };

    request.send();
  },

  // ═══════════════════════════════════════════════════════
  // التحكم بالموسيقى
  // ═══════════════════════════════════════════════════════

  /**
   * تشغيل موسيقى مع crossfade
   * @param {string} trackId - معرف المسار
   * @param {boolean} forcePlay - إجبار التشغيل حتى لو كانت نفس الموسيقى
   */
  playMusic: function(trackId, forcePlay) {
    if (!this.isInitialized || this.isMuted) return;
    if (this.currentMusic === trackId && !forcePlay) return;
    
    var track = this._findTrack(trackId);
    if (!track) {
      console.warn('[AudioManager] مسار غير موجود:', trackId);
      return;
    }
    
    // حفظ المسار السابق
    this.previousMusic = this.currentMusic;
    this.currentMusic = trackId;
    
    // بدء crossfade
    if (this._audioContext) {
      this._crossfadeMusic(track);
    }
    
    console.log('[AudioManager] تشغيل موسيقى:', trackId);
  },

  /**
   * توقف الموسيقى مع fade out
   */
  stopMusic: function(fadeDuration) {
    var duration = fadeDuration || 1.0;
    
    if (this._currentMusicSource) {
      this._fadeOut(this._currentMusicSource, duration);
    }
    
    this.currentMusic = null;
  },

  /**
   * إيقاف مؤقت للموسيقى
   */
  pauseMusic: function() {
    if (this._audioContext && this._audioContext.state === 'running') {
      this._audioContext.suspend();
    }
  },

  /**
   * استئناف الموسيقى
   */
  resumeMusic: function() {
    if (this._audioContext && this._audioContext.state === 'suspended') {
      this._audioContext.resume();
    }
  },

  /**
   * العودة للموسيقى السابقة
   */
  playPreviousMusic: function() {
    if (this.previousMusic) {
      this.playMusic(this.previousMusic);
    }
  },

  // ═══════════════════════════════════════════════════════
  // التحكم بالمؤثرات الصوتية
  // ═══════════════════════════════════════════════════════

  /**
   * تشغيل مؤثر صوتي
   * @param {string} name - اسم المؤثر
   * @param {object} options - خيارات إضافية
   */
  playSFX: function(name, options) {
    if (!this.isInitialized || this.isMuted) return;
    
    var sfxData = this.sfx[name];
    if (!sfxData) {
      console.warn('[AudioManager] مؤثر غير موجود:', name);
      return;
    }
    
    var opts = options || {};
    var volume = (sfxData.volume || 0.5) * this.sfxVolume;
    if (opts.volume !== undefined) {
      volume = opts.volume * this.sfxVolume;
    }
    
    // تشغيل الصوت
    if (this._audioContext) {
      this._playSFXWebAudio(sfxData, volume, opts);
    } else {
      this._playSFXFallback(sfxData, volume);
    }
  },

  /**
   * تشغيل سلسلة من المؤثرات
   * @param {string[]} sfxNames - مصفوفة أسماء المؤثرات
   * @param {number} delay - التأخير بين كل مؤثر (بالميلي ثانية)
   */
  playSFXSequence: function(sfxNames, delay) {
    var self = this;
    var delayMs = delay || 200;
    
    sfxNames.forEach(function(name, index) {
      setTimeout(function() {
        self.playSFX(name);
      }, index * delayMs);
    });
  },

  /**
   * إيقاف مؤثر صوتي
   */
  stopSFX: function(name) {
    var instance = this._sfxInstances[name];
    if (instance) {
      if (instance.stop) {
        instance.stop();
      }
      delete this._sfxInstances[name];
    }
  },

  /**
   * إيقاف جميع المؤثرات
   */
  stopAllSFX: function() {
    var self = this;
    Object.keys(this._sfxInstances).forEach(function(name) {
      self.stopSFX(name);
    });
  },

  // ═══════════════════════════════════════════════════════
  // التحكم بالصوت
  // ═══════════════════════════════════════════════════════

  /**
   * تغيير مستوى صوت الموسيقى
   * @param {number} vol - المستوى (0-1)
   */
  setMusicVolume: function(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    
    if (this._musicGain) {
      this._musicGain.gain.setValueAtTime(this.musicVolume, this._audioContext.currentTime);
    }
    
    this.saveSettings();
  },

  /**
   * تغيير مستوى صوت المؤثرات
   * @param {number} vol - المستوى (0-1)
   */
  setSFXVolume: function(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    
    if (this._sfxGain) {
      this._sfxGain.gain.setValueAtTime(this.sfxVolume, this._audioContext.currentTime);
    }
    
    this.saveSettings();
  },

  /**
   * تغيير المستوى الرئيسي للصوت
   * @param {number} vol - المستوى (0-1)
   */
  setMasterVolume: function(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    
    if (this._masterGain) {
      this._masterGain.gain.setValueAtTime(this.masterVolume, this._audioContext.currentTime);
    }
    
    this.saveSettings();
  },

  /**
   * كتم/إلغاء كتم الصوت
   */
  toggleMute: function() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  },

  /**
   * كتم الصوت
   */
  mute: function() {
    this.previousMuted = this.isMuted;
    this.isMuted = true;
    
    if (this._masterGain) {
      this._masterGain.gain.setValueAtTime(0, this._audioContext.currentTime);
    }
    
    this.saveSettings();
  },

  /**
   * إلغاء كتم الصوت
   */
  unmute: function() {
    this.isMuted = false;
    
    if (this._masterGain) {
      this._masterGain.gain.setValueAtTime(this.masterVolume, this._audioContext.currentTime);
    }
    
    this.saveSettings();
  },

  // ═══════════════════════════════════════════════════════
  // المنطقة والوقت
  // ═══════════════════════════════════════════════════════

  /**
   * تغيير المنطقة الحالية وتشغيل موسيقتها
   * @param {string} region - اسم المنطقة
   */
  setRegion: function(region) {
    if (this.currentRegion === region) return;
    
    this.currentRegion = region;
    this._updateMusicForContext();
  },

  /**
   * تغيير الفترة الزمنية وتشغيل موسيقتها
   * @param {string} period - الفترة (morning, afternoon, evening, night)
   */
  setPeriod: function(period) {
    if (this.currentPeriod === period) return;
    
    this.currentPeriod = period;
    this._updateMusicForContext();
  },

  /**
   * تحديث الموسيقى بناءً على المنطقة والوقت الحاليين
   */
  _updateMusicForContext: function() {
    var regionTracks = this.musicTracks[this.currentRegion];
    if (!regionTracks) return;
    
    var track;
    if (regionTracks[this.currentPeriod]) {
      track = regionTracks[this.currentPeriod];
    } else if (regionTracks.default) {
      track = regionTracks.default;
    } else {
      // استخدام أي مسار متاح
      var keys = Object.keys(regionTracks);
      if (keys.length > 0) {
        track = regionTracks[keys[0]];
      }
    }
    
    if (track) {
      this.playMusic(track.id);
    }
  },

  /**
   * تعيين منطقة بدون تغيير الموسيقى تلقائياً
   */
  setRegionOnly: function(region) {
    this.currentRegion = region;
  },

  /**
   * تعيين فترة زمنية بدون تغيير الموسيقى تلقائياً
   */
  setPeriodOnly: function(period) {
    this.currentPeriod = period;
  },

  // ═══════════════════════════════════════════════════════
  // الأصوات المحيطة
  // ═══════════════════════════════════════════════════════

  /**
   * تشغيل صوت محيطي مستمر
   */
  playAmbient: function(name, volume) {
    if (this._ambientSounds[name]) return;
    
    var sfxData = this.sfx[name];
    if (!sfxData || !sfxData.loop) {
      console.warn('[AudioManager] هذا الصوت ليس صوتاً محيطاً:', name);
      return;
    }
    
    var ambientVolume = volume || sfxData.volume || 0.3;
    this._ambientSounds[name] = {
      volume: ambientVolume,
      playing: true
    };
    
    // تشغيل الصوت المتكرر
    if (this._audioContext) {
      this._playAmbientWebAudio(sfxData, ambientVolume, name);
    }
  },

  /**
   * إيقاف صوت محيطي
   */
  stopAmbient: function(name) {
    var ambient = this._ambientSounds[name];
    if (ambient) {
      ambient.playing = false;
      delete this._ambientSounds[name];
    }
  },

  /**
   * إيقاف جميع الأصوات المحيطة
   */
  stopAllAmbient: function() {
    var self = this;
    Object.keys(this._ambientSounds).forEach(function(name) {
      self.stopAmbient(name);
    });
  },

  /**
   * تغيير مستوى صوت صوت محيطي
   */
  setAmbientVolume: function(name, volume) {
    var ambient = this._ambientSounds[name];
    if (ambient) {
      ambient.volume = Math.max(0, Math.min(1, volume));
    }
  },

  // ═══════════════════════════════════════════════════════
  // الدوال الداخلية
  // ═══════════════════════════════════════════════════════

  _findTrack: function(trackId) {
    // البحث في جميع المناطق
    for (var region in this.musicTracks) {
      var regionData = this.musicTracks[region];
      for (var period in regionData) {
        var track = regionData[period];
        if (track.id === trackId) {
          return track;
        }
      }
    }
    return null;
  },

  _crossfadeMusic: function(newTrack) {
    var self = this;
    
    // إيقاف المسار الحالي
    if (this._currentMusicSource) {
      this._fadeOut(this._currentMusicSource, this.crossfadeDuration);
    }
    
    // تشغيل المسار الجديد
    this._loadAndPlayTrack(newTrack, function(source) {
      self._currentMusicSource = source;
      self._fadeIn(source, self.crossfadeDuration);
    });
  },

  _loadAndPlayTrack: function(track, callback) {
    if (!this._audioContext) return;
    
    var self = this;
    var url = track.file;
    
    // التحقق من الكاش
    if (this._cache[url]) {
      this._playBuffer(this._cache[url], callback);
      return;
    }
    
    // تحميل الملف الصوتي
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    
    request.onload = function() {
      self._audioContext.decodeAudioData(request.response, function(buffer) {
        self._cache[url] = buffer;
        self._playBuffer(buffer, callback);
      }, function(error) {
        console.warn('[AudioManager] خطأ في تحميل الصوت:', url, error);
      });
    };
    
    request.onerror = function() {
      console.warn('[AudioManager] فشل تحميل:', url);
    };
    
    request.send();
  },

  _playBuffer: function(buffer, callback) {
    if (!this._audioContext) return;
    
    var source = this._audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this._musicGain);
    
    source.start(0);
    
    if (callback) {
      callback(source);
    }
  },

  _playSFXWebAudio: function(sfxData, volume, options) {
    var self = this;
    
    // التحقق من الكاش
    if (this._cache[sfxData.file]) {
      this._playSFXBuffer(this._cache[sfxData.file], volume, sfxData.id, options);
      return;
    }
    
    // تحميل الملف
    var request = new XMLHttpRequest();
    request.open('GET', sfxData.file, true);
    request.responseType = 'arraybuffer';
    
    request.onload = function() {
      self._audioContext.decodeAudioData(request.response, function(buffer) {
        self._cache[sfxData.file] = buffer;
        self._playSFXBuffer(buffer, volume, sfxData.id, options);
      }, function(error) {
        console.warn('[AudioManager] خطأ في تحميل SFX:', sfxData.file, error);
      });
    };
    
    request.send();
  },

  _playSFXBuffer: function(buffer, volume, sfxId, options) {
    var self = this;
    var source = this._audioContext.createBufferSource();
    
    source.buffer = buffer;
    source.connect(this._sfxGain);
    
    // التحكم بالصوت
    var gainNode = this._audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, this._audioContext.currentTime);
    source.disconnect();
    source.connect(gainNode);
    gainNode.connect(this._sfxGain);
    
    // التكرار إذا كان مطلوباً
    if (options && options.loop) {
      source.loop = true;
      this._sfxInstances[sfxId] = source;
    }
    
    // التشغيل
    source.start(0);
    
    // تنظيف بعد الانتهاء
    if (!options || !options.loop) {
      source.onended = function() {
        source.disconnect();
      };
    }
  },

  _playSFXFallback: function(sfxData, volume) {
    // استخدام Audio element كبديل
    try {
      var audio = new Audio(sfxData.file);
      audio.volume = volume;
      audio.play().catch(function() {
        // تجاهل أخطاء التشغيل التلقائي
      });
    } catch (e) {
      // الصمت
    }
  },

  _playAmbientWebAudio: function(sfxData, volume, name) {
    var self = this;
    
    if (this._cache[sfxData.file]) {
      this._startAmbientLoop(this._cache[sfxData.file], volume, name);
      return;
    }
    
    var request = new XMLHttpRequest();
    request.open('GET', sfxData.file, true);
    request.responseType = 'arraybuffer';
    
    request.onload = function() {
      self._audioContext.decodeAudioData(request.response, function(buffer) {
        self._cache[sfxData.file] = buffer;
        self._startAmbientLoop(buffer, volume, name);
      });
    };
    
    request.send();
  },

  _startAmbientLoop: function(buffer, volume, name) {
    var source = this._audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    var gainNode = this._audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, this._audioContext.currentTime);
    
    source.connect(gainNode);
    gainNode.connect(this._sfxGain);
    
    source.start(0);
    
    // حفظ المرجع
    this._ambientSounds[name] = {
      source: source,
      gainNode: gainNode,
      volume: volume,
      playing: true
    };
  },

  _fadeOut: function(source, duration) {
    if (!this._audioContext || !source) return;
    
    var gainNode = this._audioContext.createGain();
    source.disconnect();
    source.connect(gainNode);
    gainNode.connect(this._musicGain);
    
    gainNode.gain.setValueAtTime(1, this._audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, this._audioContext.currentTime + duration);
    
    setTimeout(function() {
      try {
        source.stop();
      } catch (e) {
        // تم إيقافه بالفعل
      }
    }, duration * 1000);
  },

  _fadeIn: function(source, duration) {
    if (!this._audioContext || !source) return;
    
    var gainNode = this._audioContext.createGain();
    source.disconnect();
    source.connect(gainNode);
    gainNode.connect(this._musicGain);
    
    gainNode.gain.setValueAtTime(0, this._audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, this._audioContext.currentTime + duration);
  },

  // ═══════════════════════════════════════════════════════
  // الحفظ والتحميل
  // ═══════════════════════════════════════════════════════

  saveSettings: function() {
    var settings = {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      masterVolume: this.masterVolume,
      isMuted: this.isMuted,
      currentRegion: this.currentRegion,
      currentPeriod: this.currentPeriod
    };
    
    try {
      localStorage.setItem('farmGameAudio', JSON.stringify(settings));
    } catch (e) {
      console.warn('[AudioManager] خطأ في حفظ الإعدادات:', e);
    }
  },

  loadSettings: function() {
    try {
      var saved = localStorage.getItem('farmGameAudio');
      if (saved) {
        var data = JSON.parse(saved);
        
        this.musicVolume = data.musicVolume !== undefined ? data.musicVolume : this._defaults.musicVolume;
        this.sfxVolume = data.sfxVolume !== undefined ? data.sfxVolume : this._defaults.sfxVolume;
        this.masterVolume = data.masterVolume !== undefined ? data.masterVolume : this._defaults.masterVolume;
        this.isMuted = data.isMuted !== undefined ? data.isMuted : this._defaults.isMuted;
        this.currentRegion = data.currentRegion || 'farm';
        this.currentPeriod = data.currentPeriod || 'morning';
      }
    } catch (e) {
      console.warn('[AudioManager] خطأ في تحميل الإعدادات:', e);
      // استخدام القيم الافتراضية
      this.musicVolume = this._defaults.musicVolume;
      this.sfxVolume = this._defaults.sfxVolume;
      this.masterVolume = this._defaults.masterVolume;
      this.isMuted = this._defaults.isMuted;
    }
  },

  /**
   * إعادة تعيين الإعدادات للقيم الافتراضية
   */
  resetSettings: function() {
    this.musicVolume = this._defaults.musicVolume;
    this.sfxVolume = this._defaults.sfxVolume;
    this.masterVolume = this._defaults.masterVolume;
    this.isMuted = this._defaults.isMuted;
    
    this.saveSettings();
  },

  // ═══════════════════════════════════════════════════════
  // التحديث والدورة الرئيسية
  // ═══════════════════════════════════════════════════════

  update: function(dt) {
    if (!this.isInitialized) return;
    
    // تحديث crossfade إذا كان جارياً
    if (this.isCrossfading) {
      this.crossfadeProgress += dt / this.crossfadeDuration;
      if (this.crossfadeProgress >= 1) {
        this.isCrossfading = false;
        this.crossfadeProgress = 0;
      }
    }
  },

  // ═══════════════════════════════════════════════════════
  // مساعدة واستعلامات
  // ═══════════════════════════════════════════════════════

  /**
   * الحصول على مستوى صوت الموسيقى
   */
  getMusicVolume: function() {
    return this.musicVolume;
  },

  /**
   * الحصول على مستوى صوت المؤثرات
   */
  getSFXVolume: function() {
    return this.sfxVolume;
  },

  /**
   * الحصول على المستوى الرئيسي
   */
  getMasterVolume: function() {
    return this.masterVolume;
  },

  /**
   * التحقق من كتم الصوت
   */
  isAudioMuted: function() {
    return this.isMuted;
  },

  /**
   * الحصول على المسار الحالي
   */
  getCurrentMusic: function() {
    return this.currentMusic;
  },

  /**
   * الحصول على المنطقة الحالية
   */
  getCurrentRegion: function() {
    return this.currentRegion;
  },

  /**
   * الحصول على الفترة الزمنية الحالية
   */
  getCurrentPeriod: function() {
    return this.currentPeriod;
  },

  /**
   * التحقق من وجود مسار موسيقى
   */
  hasTrack: function(trackId) {
    return this._findTrack(trackId) !== null;
  },

  /**
   * الحصول على جميع مسارات منطقة معينة
   */
  getRegionTracks: function(region) {
    return this.musicTracks[region] || null;
  },

  /**
   * الحصول على جميع المؤثرات المتاحة
   */
  getAvailableSFX: function() {
    return Object.keys(this.sfx);
  },

  /**
   * التحقق من جاهزية النظام
   */
  isReady: function() {
    return this.isInitialized;
  },

  // ═══════════════════════════════════════════════════════
  // التدمير والتنظيف
  // ═══════════════════════════════════════════════════════

  destroy: function() {
    this.stopMusic();
    this.stopAllSFX();
    this.stopAllAmbient();
    
    if (this._audioContext) {
      this._audioContext.close();
    }
    
    this._cache = {};
    this._sfxInstances = {};
    this._ambientSounds = {};
    
    this.isInitialized = false;
    
    console.log('[AudioManager] تم التدمير');
  }
};
