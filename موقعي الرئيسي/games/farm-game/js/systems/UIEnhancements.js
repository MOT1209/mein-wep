/**
 * UIEnhancements.js - تحسينات واجهة المستخدم
 * Farm Game 3D - HUD متطور، شريط أدوات، مخزون، إشعارات، خريطة مصغرة
 */

var GAME = GAME || {};
GAME.UIEnhancements = GAME.UIEnhancements || {};

// ============================================================
// 🎨 تهيئة التحسينات
// ============================================================
GAME.UIEnhancements.init = function() {
  console.log('[UIEnhancements] 🎨 بدء تهيئة تحسينات الواجهة...');

  // إضافة عناصر CSS للتحسينات
  this._injectStyles();

  // تحسين شريط HUD (إضافة شريط XP)
  this._enhanceHUD();

  // تحسين شريط الأدوات (إضافة عدّاد المخزون لكل أداة)
  this._enhanceToolbar();

  // تحسين الإشعارات (Toast system متطور)
  this._enhanceNotifications();

  // تحسين الخريطة المصغرة
  this._enhanceMinimap();

  // إضافة شاشة الإحصائيات السريعة
  this._addStatsPanel();

  // ربط أحداث التحسينات
  this._bindEvents();

  console.log('[UIEnhancements] ✅ تحسينات الواجهة جاهزة');
};

// ============================================================
// 🎨 حقن CSS خاص بالتحسينات
// ============================================================
GAME.UIEnhancements._injectStyles = function() {
  var style = document.createElement('style');
  style.id = 'ui-enhancements-style';
  style.textContent = `
    /* === تحسينات HUD === */
    .hud-xp-bar {
      position: relative;
      width: 100px;
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      overflow: hidden;
      margin: 2px 0;
    }
    .hud-xp-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #faca15, #ff8c00);
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    .hud-xp-text {
      font-size: 9px;
      color: rgba(255,255,255,0.6);
      display: block;
      text-align: center;
      line-height: 1;
    }
    .hud-compact-stats {
      display: flex;
      gap: 4px;
      align-items: center;
      font-size: 11px;
      color: var(--text-muted, rgba(255,255,255,0.6));
    }
    .hud-compact-stats span {
      background: rgba(0,0,0,0.3);
      padding: 1px 6px;
      border-radius: 4px;
    }

    /* === تحسين شريط الأدوات === */
    .tool-slot .tool-count {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: var(--gold-dark, #d4a017);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      min-width: 16px;
      height: 16px;
      line-height: 16px;
      text-align: center;
      border-radius: 8px;
      padding: 0 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      display: none;
    }
    .tool-slot .tool-count.show {
      display: block;
    }
    .tool-slot .tool-shortcut {
      position: absolute;
      top: -6px;
      left: -6px;
      background: var(--green-light, #4a8c3f);
      color: #fff;
      font-size: 8px;
      font-weight: 700;
      width: 18px;
      height: 18px;
      line-height: 18px;
      text-align: center;
      border-radius: 50%;
      border: 2px solid rgba(0,0,0,0.3);
    }

    /* === تحسين الإشعارات (Toast) === */
    .notification.enhanced {
      transform: translateX(120%);
      opacity: 0;
      animation: toastSlideIn 0.3s ease forwards, toastFadeOut 0.4s ease 2.4s forwards;
    }
    @keyframes toastSlideIn {
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes toastFadeOut {
      to { transform: translateX(120%); opacity: 0; }
    }
    .notification.enhanced .notif-icon {
      margin-right: 8px;
      font-size: 18px;
    }
    .notification.enhanced .notif-text {
      flex: 1;
      font-size: 13px;
    }
    .notification.enhanced .notif-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background: rgba(255,255,255,0.3);
      animation: notifProgress 2.5s linear forwards;
    }
    @keyframes notifProgress {
      from { width: 100%; }
      to { width: 0%; }
    }

    /* === تحسين الخريطة المصغرة === */
    #minimap {
      position: fixed;
      bottom: 90px;
      right: 12px;
      z-index: 100;
      border: 2px solid rgba(255,255,255,0.15);
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      transition: transform 0.2s ease, border-color 0.2s ease;
      cursor: pointer;
    }
    #minimap:hover {
      transform: scale(1.05);
      border-color: rgba(255,255,255,0.3);
    }
    #minimap-canvas {
      display: block;
      width: 140px;
      height: 140px;
    }
    #minimap-label {
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 8px;
      color: rgba(255,255,255,0.3);
      letter-spacing: 2px;
      pointer-events: none;
    }
    /* تصغير الخريطة على الشاشات الصغيرة */
    @media (max-width: 600px) {
      #minimap {
        bottom: 110px;
        right: 8px;
      }
      #minimap-canvas {
        width: 90px;
        height: 90px;
      }
    }

    /* === شاشة الإحصائيات السريعة === */
    #stats-panel {
      position: fixed;
      top: 8px;
      left: 8px;
      z-index: 90;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 10px;
      color: rgba(255,255,255,0.5);
      line-height: 1.5;
      display: none;
      pointer-events: none;
      max-width: 160px;
    }
    #stats-panel.visible {
      display: block;
    }
    #stats-panel .stat-line {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    #stats-panel .stat-line .stat-label {
      color: rgba(255,255,255,0.35);
    }
    #stats-panel .stat-line .stat-value {
      color: rgba(255,255,255,0.7);
      font-weight: 500;
    }

    /* === علامات جودة المحصول === */
    .quality-badge {
      display: inline-block;
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 3px;
      margin-left: 4px;
      font-weight: 700;
    }
    .quality-badge.silver { background: #c0c0c0; color: #222; }
    .quality-badge.gold { background: #ffd700; color: #222; }
    .quality-badge.iridium { background: #b565d9; color: #fff; }

    /* === تأثيرات الأدوات النشطة === */
    .tool-slot.active {
      box-shadow: 0 0 12px rgba(250, 202, 21, 0.4), inset 0 0 8px rgba(250, 202, 21, 0.1);
      border-color: var(--gold, #faca15) !important;
    }
    .tool-slot:active:not(.active) {
      transform: scale(0.92);
    }
  `;
  document.head.appendChild(style);
};

// ============================================================
// 📊 تحسين HUD - إضافة شريط XP وعناصر إضافية
// ============================================================
GAME.UIEnhancements._enhanceHUD = function() {
  // إضافة شريط XP تحت مستوى اللاعب
  var levelStat = document.querySelector('.level-stat');
  if (levelStat) {
    var xpBar = document.createElement('div');
    xpBar.className = 'hud-xp-bar';
    xpBar.innerHTML = '<div class="hud-xp-fill" id="ue-xp-fill"></div>';
    var xpText = document.createElement('span');
    xpText.className = 'hud-xp-text';
    xpText.id = 'ue-xp-text';
    xpText.textContent = '0 / 100 XP';
    levelStat.appendChild(xpBar);
    levelStat.appendChild(xpText);
  }

  // إضافة إحصائيات مضغوطة (عدد القطع المزروعة، المحصودة)
  var hudTopLeft = document.querySelector('.hud-top-left');
  if (hudTopLeft) {
    var compactStats = document.createElement('div');
    compactStats.className = 'hud-compact-stats';
    compactStats.id = 'ue-compact-stats';
    compactStats.innerHTML = `
      <span id="ue-plots-count">🌱 0</span>
      <span id="ue-ready-count">🧺 0</span>
      <span id="ue-day-count">📅 0</span>
    `;
    hudTopLeft.appendChild(compactStats);
  }
};

// ============================================================
// 🔧 تحسين شريط الأدوات - إضافة عدّادات
// ============================================================
GAME.UIEnhancements._enhanceToolbar = function() {
  var slots = document.querySelectorAll('.tool-slot');
  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];

    // إضافة عدّاد المخزون (للأدوات التي تزرع)
    var count = document.createElement('span');
    count.className = 'tool-count';
    count.id = 'ue-tool-count-' + i;
    slot.appendChild(count);

    // إضافة اختصار المفتاح
    var key = document.createElement('span');
    key.className = 'tool-shortcut';
    key.textContent = (i + 1);
    slot.appendChild(key);

    // جعل الأداة قابلة للسحب بزر الفأرة الأيسر
    slot.addEventListener('click', function(e) {
      var idx = parseInt(this.dataset.tool);
      if (!isNaN(idx) && typeof selectTool === 'function') {
        selectTool(idx);
      }
    });
  }
};

// ============================================================
// 🔔 تحسين الإشعارات (Toast Notifications)
// ============================================================
GAME.UIEnhancements._enhanceNotifications = function() {
  // تحسين دالة showNotification الموجودة
  var originalShow = GAME.ui.showNotification;
  GAME.ui.showNotification = function(text, type) {
    var container = document.getElementById('notif-container');
    if (!container) {
      if (originalShow) originalShow.call(GAME.ui, text, type);
      return;
    }

    var el = document.createElement('div');
    el.className = 'notification enhanced ' + (type || 'info');

    // أيقونة حسب النوع
    var icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    var icon = icons[type] || 'ℹ️';

    el.innerHTML = '<span class="notif-icon">' + icon + '</span>' +
                   '<span class="notif-text">' + text + '</span>' +
                   '<div class="notif-progress"></div>';

    container.appendChild(el);

    // إزالة بعد 2.5 ثانية
    setTimeout(function() {
      if (el.parentNode) {
        el.style.transform = 'translateX(120%)';
        el.style.opacity = '0';
        setTimeout(function() {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 400);
      }
    }, 2500);
  };
};

// ============================================================
// 🗺️ تحسين الخريطة المصغرة
// ============================================================
GAME.UIEnhancements._enhanceMinimap = function() {
  var minimap = document.getElementById('minimap');
  if (!minimap) {
    // إنشاء خريطة مصغرة إذا لم تكن موجودة
    var mm = document.createElement('div');
    mm.id = 'minimap';
    mm.innerHTML = '<canvas id="minimap-canvas" width="140" height="140"></canvas>' +
                   '<div id="minimap-label">MAP</div>';
    document.body.appendChild(mm);
  }

  // النقر على الخريطة لتكبيرها مؤقتاً
  var canvas = document.getElementById('minimap-canvas');
  if (canvas) {
    canvas.addEventListener('click', function() {
      var mm = document.getElementById('minimap');
      if (mm) {
        if (mm.style.transform === 'scale(2)') {
          mm.style.transform = 'scale(1)';
          mm.style.borderRadius = '50%';
        } else {
          mm.style.transform = 'scale(2)';
          mm.style.borderRadius = '12px';
          mm.style.transformOrigin = 'bottom right';
        }
      }
    });
  }
};

// ============================================================
// 📈 شاشة الإحصائيات السريعة
// ============================================================
GAME.UIEnhancements._addStatsPanel = function() {
  if (document.getElementById('stats-panel')) return;

  var panel = document.createElement('div');
  panel.id = 'stats-panel';
  panel.innerHTML = `
    <div class="stat-line"><span class="stat-label">🌾 مزروع</span><span class="stat-value" id="ue-stat-planted">0</span></div>
    <div class="stat-line"><span class="stat-label">🧺 محصود</span><span class="stat-value" id="ue-stat-harvested">0</span></div>
    <div class="stat-line"><span class="stat-label">💰 مكتسب</span><span class="stat-value" id="ue-stat-earned">$0</span></div>
    <div class="stat-line"><span class="stat-label">🔨 مصنوع</span><span class="stat-value" id="ue-stat-crafted">0</span></div>
  `;
  document.body.appendChild(panel);

  // إظهار الإحصائيات عند الضغط على مفتاح P
  document.addEventListener('keydown', function(e) {
    if (e.code === 'KeyP' && GAME.game && GAME.game.state) {
      panel.classList.toggle('visible');
    }
  });
};

// ============================================================
// 🔗 ربط الأحداث
// ============================================================
GAME.UIEnhancements._bindEvents = function() {
  // مراقبة تغيير الأدوات لتحديث العدّادات
  var originalSelect = GAME.game.selectTool;
  if (originalSelect) {
    GAME.game.selectTool = function(index) {
      originalSelect.call(GAME.game, index);
      // تحديث عدّاد الأدوات
      GAME.UIEnhancements._updateToolCounts();
    };
  }
};

// ============================================================
// 🔄 تحديث دوري
// ============================================================
GAME.UIEnhancements.update = function(delta) {
  var state = GAME.game && GAME.game.state;
  if (!state) return;

  // تحديث شريط XP
  this._updateXPBar(state);

  // تحديث عدّاد المخزون في الأدوات
  this._updateToolCounts();

  // تحديث الإحصائيات المضغوطة في HUD
  this._updateCompactStats(state);

  // تحديث شاشة الإحصائيات
  this._updateStatsPanel(state);
};

// ============================================================
// 📊 تحديث شريط XP
// ============================================================
GAME.UIEnhancements._updateXPBar = function(state) {
  var fill = document.getElementById('ue-xp-fill');
  var text = document.getElementById('ue-xp-text');
  if (!fill || !text) return;

  var needed = state.level * 100;
  var pct = Math.min(100, (state.xp / needed) * 100);
  fill.style.width = pct + '%';
  text.textContent = state.xp + ' / ' + needed + ' XP';
};

// ============================================================
// 🔧 تحديث عدّاد المخزون في الأدوات
// ============================================================
GAME.UIEnhancements._updateToolCounts = function() {
  var state = GAME.game && GAME.game.state;
  if (!state) return;

  // خريطة: رقم الأداة -> مفتاح المخزون
  var toolInventoryMap = {
    2: 'wheat',  // أداة زراعة القمح
    3: 'tomato', // أداة زراعة الطماطم
    4: 'carrot', // أداة زراعة الجزر
    6: 'apple',  // أداة زراعة التفاح
    7: 'fertilizer' // أداة السماد
  };

  for (var toolIdx in toolInventoryMap) {
    var countEl = document.getElementById('ue-tool-count-' + toolIdx);
    if (!countEl) continue;

    var item = toolInventoryMap[toolIdx];
    var count = state.inventory[item] || 0;
    if (count > 0) {
      countEl.textContent = count;
      countEl.classList.add('show');
    } else {
      countEl.classList.remove('show');
    }
  }
};

// ============================================================
// 📊 تحديث الإحصائيات المضغوطة
// ============================================================
GAME.UIEnhancements._updateCompactStats = function(state) {
  var plotsEl = document.getElementById('ue-plots-count');
  var readyEl = document.getElementById('ue-ready-count');
  var dayEl = document.getElementById('ue-day-count');
  if (!plotsEl || !readyEl || !dayEl) return;

  var plots = state.plots || [];
  var total = plots.length;
  var ready = 0;
  for (var i = 0; i < plots.length; i++) {
    if (plots[i].state === 'ready') ready++;
  }

  plotsEl.textContent = '🌱 ' + total;
  readyEl.textContent = '🧺 ' + ready;
  dayEl.textContent = '📅 ' + state.day;
};

// ============================================================
// 📈 تحديث شاشة الإحصائيات
// ============================================================
GAME.UIEnhancements._updateStatsPanel = function(state) {
  var stats = state.stats;
  if (!stats) return;

  var plantedEl = document.getElementById('ue-stat-planted');
  var harvestedEl = document.getElementById('ue-stat-harvested');
  var earnedEl = document.getElementById('ue-stat-earned');
  var craftedEl = document.getElementById('ue-stat-crafted');

  if (plantedEl) plantedEl.textContent = stats.totalPlanted || 0;
  if (harvestedEl) harvestedEl.textContent = stats.totalHarvested || 0;
  if (earnedEl) earnedEl.textContent = '$' + (stats.totalEarned || 0);
  if (craftedEl) craftedEl.textContent = stats.totalCrafted || 0;
};

// ============================================================
// 🔚 تصدير للاستخدام العام
// ============================================================
console.log('[UIEnhancements] 📦 وحدة تحسينات الواجهة محملة');
