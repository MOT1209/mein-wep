/**
 * NotificationSystem.js - نظام الإشعارات المحسّن
 * Farm Game 3D - Production Quality
 *
 * يدعم:
 * - 5 أنواع إشعارات (info, success, warning, error, achievement)
 * - أنيميشن دخول وخروج سلس
 * - ترتيب الإشعارات في قائمة انتظار
 * - عرض إشعارات متعددة في نفس الوقت
 * - إزالة تلقائية بعد مدة
 * - حفظ الإشعارات المهمة في localStorage
 * - دعم RTL/LTR
 * - تأثيرات صوتية اختيارية
 * - إشعارات مجمعة (تجميع إشعارات متشابهة)
 */

var GAME = GAME || {};

GAME.NotificationSystem = {
  // ─── الحالة ───
  notifications: [],
  history: [],
  queue: [],
  maxVisible: 5,
  maxHistory: 50,
  container: null,
  isPaused: false,
  soundEnabled: true,
  _soundCache: {},

  // ─── أنواع الإشعارات ───
  types: {
    info: {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: 'ℹ️',
      sound: 'info',
      duration: 4000
    },
    success: {
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      icon: '✅',
      sound: 'success',
      duration: 3500
    },
    warning: {
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      icon: '⚠️',
      sound: 'warning',
      duration: 5000
    },
    error: {
      gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
      icon: '❌',
      sound: 'error',
      duration: 6000
    },
    achievement: {
      gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
      icon: '🏆',
      sound: 'achievement',
      duration: 5000
    },
    money: {
      gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
      icon: '💰',
      sound: 'coins',
      duration: 3000
    },
    xp: {
      gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      icon: '⭐',
      sound: 'xp',
      duration: 3000
    },
    weather: {
      gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      icon: '🌤️',
      sound: 'weather',
      duration: 4000
    },
    levelup: {
      gradient: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
      icon: '🎉',
      sound: 'levelup',
      duration: 5000
    },
    error_critical: {
      gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
      icon: '🚨',
      sound: 'critical',
      duration: 8000
    }
  },

  // ─── الإعدادات الافتراضية ───
  defaults: {
    position: 'top-right',
    animationDuration: 300,
    maxVisible: 5,
    soundEnabled: true,
    enableGrouping: true,
    groupDelay: 2000
  },

  // ─── التهيئة ───
  init: function(game) {
    this.game = game;
    this.createContainer();
    this.loadHistory();
    this.setupEventListeners();
    
    console.log('🔔 NotificationSystem initialized');
    return this;
  },

  // ─── إنشاء الحاوية ───
  createContainer: function() {
    // حاوية الإشعارات الرئيسية
    var container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = [
      'position:fixed',
      'top:20px',
      'right:20px',
      'z-index:10000',
      'display:flex',
      'flex-direction:column',
      'gap:10px',
      'pointer-events:none',
      'max-width:350px',
      'font-family:Arial,Helvetica,sans-serif'
    ].join(';');
    document.body.appendChild(container);
    this.container = container;

    // حاوية الإشعارات المجمعة
    var groupContainer = document.createElement('div');
    groupContainer.id = 'notification-group-container';
    groupContainer.style.cssText = [
      'position:fixed',
      'bottom:20px',
      'right:20px',
      'z-index:9999',
      'display:flex',
      'flex-direction:column',
      'gap:8px',
      'pointer-events:none',
      'max-width:300px'
    ].join(';');
    document.body.appendChild(groupContainer);
    this.groupContainer = groupContainer;

    // إضافة الأنماط CSS
    this.injectStyles();
  },

  // ─── إضافة الأنماط ───
  injectStyles: function() {
    var style = document.createElement('style');
    style.textContent = [
      '.notification-item {',
      '  position:relative;',
      '  padding:14px 18px;',
      '  border-radius:12px;',
      '  color:white;',
      '  box-shadow:0 4px 20px rgba(0,0,0,0.3);',
      '  transform:translateX(120%);',
      '  transition:all 0.3s cubic-bezier(0.68,-0.55,0.265,1.55);',
      '  pointer-events:auto;',
      '  cursor:pointer;',
      '  overflow:hidden;',
      '  backdrop-filter:blur(10px);',
      '  border:1px solid rgba(255,255,255,0.2);',
      '  font-size:14px;',
      '  line-height:1.4;',
      '}',
      '.notification-item.show {',
      '  transform:translateX(0);',
      '}',
      '.notification-item.hide {',
      '  transform:translateX(120%);',
      '  opacity:0;',
      '}',
      '.notification-item .icon {',
      '  font-size:20px;',
      '  margin-right:10px;',
      '  vertical-align:middle;',
      '}',
      '.notification-item .content {',
      '  display:inline;',
      '  vertical-align:middle;',
      '}',
      '.notification-item .progress-bar {',
      '  position:absolute;',
      '  bottom:0;',
      '  left:0;',
      '  height:3px;',
      '  background:rgba(255,255,255,0.7);',
      '  transition:width linear;',
      '}',
      '.notification-item .close-btn {',
      '  position:absolute;',
      '  top:5px;',
      '  right:8px;',
      '  background:none;',
      '  border:none;',
      '  color:white;',
      '  font-size:16px;',
      '  cursor:pointer;',
      '  opacity:0.7;',
      '  transition:opacity 0.2s;',
      '  pointer-events:auto;',
      '}',
      '.notification-item .close-btn:hover {',
      '  opacity:1;',
      '}',
      '.notification-grouped {',
      '  padding:10px 14px;',
      '  border-radius:8px;',
      '  background:rgba(0,0,0,0.8);',
      '  color:white;',
      '  font-size:13px;',
      '  transform:translateY(100%);',
      '  transition:all 0.3s ease;',
      '  pointer-events:auto;',
      '}',
      '.notification-grouped.show {',
      '  transform:translateY(0);',
      '}',
      '.notification-grouped .group-count {',
      '  background:rgba(255,255,255,0.2);',
      '  padding:2px 6px;',
      '  border-radius:10px;',
      '  font-size:11px;',
      '  margin-left:8px;',
      '}',
      '@keyframes notification-shake {',
      '  0%,100% { transform:translateX(0); }',
      '  25% { transform:translateX(-5px); }',
      '  75% { transform:translateX(5px); }',
      '}',
      '.notification-item.shake {',
      '  animation:notification-shake 0.5s ease;',
      '}',
      '@keyframes notification-pulse {',
      '  0%,100% { box-shadow:0 4px 20px rgba(0,0,0,0.3); }',
      '  50% { box-shadow:0 4px 30px rgba(255,255,255,0.4); }',
      '}',
      '.notification-item.pulse {',
      '  animation:notification-pulse 1s ease infinite;',
      '}',
      '@keyframes notification-bounce {',
      '  0%,100% { transform:translateX(0); }',
      '  50% { transform:translateX(-10px); }',
      '}',
      '.notification-item.bounce {',
      '  animation:notification-bounce 0.6s ease 3;',
      '}',
      '@media (max-width:480px) {',
      '  #notification-container {',
      '    right:10px;',
      '    left:10px;',
      '    max-width:100%;',
      '  }',
      '  .notification-item {',
      '    font-size:13px;',
      '    padding:12px 14px;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  },

  // ─── إعداد مستمعي الأحداث ───
  setupEventListeners: function() {
    var self = this;
    
    // استقبال أحداث الإشعارات من الأنظمة الأخرى
    document.addEventListener('game:notification', function(e) {
      if (e.detail) {
        self.show(e.detail.message, e.detail.type, e.detail.options);
      }
    });

    // إرسال إشعارات عند حدوث أحداث اللعبة
    if (this.game && this.game.events) {
      this.game.events.on('money:earned', function(amount) {
        self.show('+' + amount + ' 💰', 'money');
      });
      
      this.game.events.on('money:spent', function(amount) {
        self.show('-' + amount + ' 💰', 'warning');
      });
      
      this.game.events.on('xp:gained', function(amount) {
        self.show('+' + amount + ' XP ⭐', 'xp');
      });
      
      this.game.events.on('level:up', function(level) {
        self.show('Level Up! 🎉', 'levelup');
      });
      
      this.game.events.on('achievement:unlocked', function(achievement) {
        self.show(achievement.name, 'achievement', { duration: 6000 });
      });
      
      this.game.events.on('weather:changed', function(weather) {
        self.show('Weather: ' + weather.name, 'weather');
      });
    }
  },

  // ─── عرض إشعار ───
  show: function(message, type, options) {
    options = options || {};
    type = type || 'info';
    
    var typeConfig = this.types[type] || this.types.info;
    var duration = options.duration || typeConfig.duration;
    var icon = options.icon || typeConfig.icon;
    var sound = options.sound !== undefined ? options.sound : typeConfig.sound;
    var group = options.group || null;
    var priority = options.priority || 0;
    var persistent = options.persistent || false;
    var onClick = options.onClick || null;

    // التحقق من التجميع
    if (group && this.defaults.enableGrouping) {
      this.addToGroup(group, message, type);
      return null;
    }

    // التحقق من التكرار (تجميع متشابه)
    if (this.defaults.enableGrouping) {
      var existing = this.findSimilar(message, type);
      if (existing) {
        existing.count++;
        this.updateGroupCount(existing);
        return existing;
      }
    }

    var notification = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      message: message,
      type: type,
      icon: icon,
      duration: duration,
      priority: priority,
      persistent: persistent,
      onClick: onClick,
      count: 1,
      timestamp: Date.now(),
      element: null
    };

    // إضافة إلى القائمة
    this.notifications.push(notification);

    // إنشاء العنصر
    notification.element = this.createNotificationElement(notification);
    this.container.appendChild(notification.element);

    // تشغيل الصوت
    if (sound && this.soundEnabled) {
      this.playSound(sound);
    }

    // إزالة الإشعارات القديمة
    this.trimNotifications();

    // حفظ في السجل
    this.addToHistory(notification);

    // إزالة تلقائية
    if (!persistent) {
      notification.timer = setTimeout(function() {
        this.remove(notification.id);
      }.bind(this), duration);
    }

    // عرض مع تأخير للأنيميشن
    var self = this;
    setTimeout(function() {
      if (notification.element) {
        notification.element.classList.add('show');
      }
    }, 10);

    return notification;
  },

  // ─── إنشاء عنصر الإشعار ───
  createNotificationElement: function(notification) {
    var self = this;
    var typeConfig = this.types[notification.type] || this.types.info;

    var el = document.createElement('div');
    el.className = 'notification-item notification-' + notification.type;
    el.id = 'notification-' + notification.id;
    el.style.background = typeConfig.gradient;
    el.style.animationDuration = notification.duration + 'ms';

    // الأيقونة
    var iconEl = document.createElement('span');
    iconEl.className = 'icon';
    iconEl.textContent = notification.icon;
    el.appendChild(iconEl);

    // المحتوى
    var contentEl = document.createElement('span');
    contentEl.className = 'content';
    contentEl.textContent = notification.message;
    el.appendChild(contentEl);

    // زر الإغلاق
    var closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '×';
    closeBtn.onclick = function(e) {
      e.stopPropagation();
      self.remove(notification.id);
    };
    el.appendChild(closeBtn);

    // شريط التقدم
    var progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = '100%';
    el.appendChild(progressBar);

    // بدء العد التنازلي لشريط التقدم
    setTimeout(function() {
      progressBar.style.transition = 'width ' + notification.duration + 'ms linear';
      progressBar.style.width = '0%';
    }, 50);

    // النقر
    el.onclick = function() {
      if (notification.onClick) {
        notification.onClick(notification);
      }
      self.remove(notification.id);
    };

    // إيقاف المؤقت عند التحويم
    el.onmouseenter = function() {
      if (notification.timer) {
        clearTimeout(notification.timer);
      }
      progressBar.style.transitionPlayState = 'paused';
    };

    el.onmouseleave = function() {
      if (!notification.persistent) {
        notification.timer = setTimeout(function() {
          self.remove(notification.id);
        }.bind(self), 1000);
      }
      progressBar.style.transitionPlayState = 'running';
    };

    return el;
  },

  // ─── إزالة إشعار ───
  remove: function(id) {
    var self = this;
    var index = this.notifications.findIndex(function(n) { return n.id === id; });
    
    if (index === -1) return;

    var notification = this.notifications[index];
    
    // إيقاف المؤقت
    if (notification.timer) {
      clearTimeout(notification.timer);
    }

    // إخفاء
    if (notification.element) {
      notification.element.classList.remove('show');
      notification.element.classList.add('hide');
      
      setTimeout(function() {
        if (notification.element && notification.element.parentNode) {
          notification.element.parentNode.removeChild(notification.element);
        }
        self.notifications.splice(index, 1);
      }, 300);
    } else {
      this.notifications.splice(index, 1);
    }
  },

  // ─── إزالة حسب النوع ───
  removeByType: function(type) {
    var self = this;
    var toRemove = this.notifications.filter(function(n) { return n.type === type; });
    toRemove.forEach(function(n) {
      self.remove(n.id);
    });
  },

  // ─── إزالة الكل ───
  clear: function() {
    var self = this;
    var ids = this.notifications.map(function(n) { return n.id; });
    ids.forEach(function(id) {
      self.remove(id);
    });
    this.queue = [];
  },

  // ─── تقليم الإشعارات ───
  trimNotifications: function() {
    while (this.notifications.length > this.maxVisible) {
      var oldest = this.notifications.find(function(n) { return !n.persistent; });
      if (oldest) {
        this.remove(oldest.id);
      } else {
        break;
      }
    }
  },

  // ─── التجميع ───
  addToGroup: function(group, message, type) {
    var existing = this.groupedNotifications && this.groupedNotifications[group];
    
    if (existing) {
      existing.count++;
      existing.lastMessage = message;
      this.updateGroupElement(existing);
    } else {
      if (!this.groupedNotifications) {
        this.groupedNotifications = {};
      }
      
      this.groupedNotifications[group] = {
        group: group,
        message: message,
        type: type,
        count: 1,
        element: null
      };
      
      this.createGroupElement(this.groupedNotifications[group]);
    }
  },

  createGroupElement: function(groupData) {
    var self = this;
    var el = document.createElement('div');
    el.className = 'notification-grouped';
    el.textContent = '<span>' + groupData.message + '</span><span class="group-count">x' + groupData.count + '</span>';
    
    this.groupContainer.appendChild(el);
    groupData.element = el;
    
    setTimeout(function() {
      el.classList.add('show');
    }, 10);

    // إزالة تلقائية بعد 5 ثوانٍ
    setTimeout(function() {
      self.removeGroup(groupData.group);
    }, 5000);
  },

  updateGroupElement: function(groupData) {
    if (groupData.element) {
      var countEl = groupData.element.querySelector('.group-count');
      if (countEl) {
        countEl.textContent = 'x' + groupData.count;
      }
    }
  },

  removeGroup: function(group) {
    var groupData = this.groupedNotifications && this.groupedNotifications[group];
    if (groupData && groupData.element) {
      groupData.element.classList.remove('show');
      setTimeout(function() {
        if (groupData.element && groupData.element.parentNode) {
          groupData.element.parentNode.removeChild(groupData.element);
        }
      }, 300);
      delete this.groupedNotifications[group];
    }
  },

  // ─── البحث عن إشعار مشابه ───
  findSimilar: function(message, type) {
    return this.notifications.find(function(n) {
      return n.message === message && n.type === type;
    });
  },

  // ─── تحديث عدد التجميع ───
  updateGroupCount: function(notification) {
    if (notification.element) {
      var contentEl = notification.element.querySelector('.content');
      if (contentEl) {
        contentEl.textContent = notification.message + ' (x' + notification.count + ')';
      }
    }
  },

  // ─── السجل ───
  addToHistory: function(notification) {
    this.history.push({
      id: notification.id,
      message: notification.message,
      type: notification.type,
      timestamp: notification.timestamp
    });

    // حفظ آخر 50 إشعار
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    this.saveHistory();
  },

  saveHistory: function() {
    try {
      localStorage.setItem('farmgame_notification_history', JSON.stringify(this.history));
    } catch (e) {
      console.warn('Could not save notification history:', e);
    }
  },

  loadHistory: function() {
    try {
      var saved = localStorage.getItem('farmgame_notification_history');
      if (saved) {
        this.history = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load notification history:', e);
      this.history = [];
    }
  },

  // ─── الصوت ───
  playSound: function(soundName) {
    if (!this.soundEnabled) return;
    
    try {
      if (!this._soundCache[soundName]) {
        this._soundCache[soundName] = new Audio('sounds/notification/' + soundName + '.mp3');
      }
      this._soundCache[soundName].cloneNode().play().catch(function() {});
    } catch (e) {
      // تجاهل أخطاء الصوت
    }
  },

  setSoundEnabled: function(enabled) {
    this.soundEnabled = enabled;
  },

  // ─── دوال مساعدة ───
  info: function(message, options) {
    return this.show(message, 'info', options);
  },

  success: function(message, options) {
    return this.show(message, 'success', options);
  },

  warning: function(message, options) {
    return this.show(message, 'warning', options);
  },

  error: function(message, options) {
    return this.show(message, 'error', options);
  },

  achievement: function(message, options) {
    return this.show(message, 'achievement', options);
  },

  money: function(amount, options) {
    var sign = amount >= 0 ? '+' : '';
    return this.show(sign + amount + ' 💰', amount >= 0 ? 'money' : 'warning', options);
  },

  xp: function(amount, options) {
    return this.show('+' + amount + ' XP ⭐', 'xp', options);
  },

  weather: function(weatherName, options) {
    return this.show('Weather: ' + weatherName, 'weather', options);
  },

  levelup: function(level, options) {
    return this.show('Level ' + level + '! 🎉', 'levelup', options);
  },

  // ─── إشعار اهتزاز ───
  shake: function(message, type, options) {
    var notification = this.show(message, type, options);
    if (notification && notification.element) {
      notification.element.classList.add('shake');
    }
    return notification;
  },

  // ─── إشعار نبض ───
  pulse: function(message, type, options) {
    var notification = this.show(message, type, options);
    if (notification && notification.element) {
      notification.element.classList.add('pulse');
    }
    return notification;
  },

  // ─── إشعار ارتداد ───
  bounce: function(message, type, options) {
    var notification = this.show(message, type, options);
    if (notification && notification.element) {
      notification.element.classList.add('bounce');
    }
    return notification;
  },

  // ─── إشعار دائم ───
  persistent: function(message, type, options) {
    options = options || {};
    options.persistent = true;
    return this.show(message, type, options);
  },

  // ─── إشعار مع نقر ───
  clickable: function(message, type, onClick, options) {
    options = options || {};
    options.onClick = onClick;
    return this.show(message, type, options);
  },

  // ─── قائمة انتظار ───
  enqueue: function(message, type, options) {
    this.queue.push({ message: message, type: type, options: options });
    this.processQueue();
  },

  processQueue: function() {
    if (this.notifications.length < this.maxVisible && this.queue.length > 0) {
      var next = this.queue.shift();
      this.show(next.message, next.type, next.options);
      
      if (this.queue.length > 0) {
        setTimeout(this.processQueue.bind(this), 500);
      }
    }
  },

  // ─── إيقاف مؤقت / استئناف ───
  pause: function() {
    this.isPaused = true;
    this.notifications.forEach(function(n) {
      if (n.timer) clearTimeout(n.timer);
    });
  },

  resume: function() {
    this.isPaused = false;
    var self = this;
    this.notifications.forEach(function(n) {
      if (!n.persistent) {
        n.timer = setTimeout(function() {
          self.remove(n.id);
        }, 2000);
      }
    });
  },

  // ─── الحصول على السجل ───
  getHistory: function(type, limit) {
    limit = limit || 20;
    var filtered = type ? this.history.filter(function(h) { return h.type === type; }) : this.history;
    return filtered.slice(-limit);
  },

  // ─── مسح السجل ───
  clearHistory: function() {
    this.history = [];
    this.saveHistory();
  },

  // ─── حفظ / تحميل ───
  save: function() {
    try {
      var data = {
        soundEnabled: this.soundEnabled,
        maxVisible: this.maxVisible,
        history: this.history.slice(-20) // حفظ آخر 20 فقط
      };
      localStorage.setItem('farmgame_notifications', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save notification settings:', e);
    }
  },

  load: function() {
    try {
      var saved = localStorage.getItem('farmgame_notifications');
      if (saved) {
        var data = JSON.parse(saved);
        this.soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
        this.maxVisible = data.maxVisible || 5;
      }
    } catch (e) {
      console.warn('Could not load notification settings:', e);
    }
  },

  // ─── تدمير ───
  destroy: function() {
    this.clear();
    this.save();
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    if (this.groupContainer && this.groupContainer.parentNode) {
      this.groupContainer.parentNode.removeChild(this.groupContainer);
    }
    
    this.notifications = [];
    this.history = [];
    this.queue = [];
    this.groupedNotifications = {};
  }
};

// تصدير للاستخدام كوحدة
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME.NotificationSystem;
}
