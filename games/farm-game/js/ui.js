var GAME = GAME || {};
GAME.ui = {
  isInitialized: false,
  notificationTimeout: null,

  init: function() {
    GAME.keys = {};

    document.addEventListener('keydown', function(e) {
      GAME.keys[e.code] = true;
      if (e.code === 'Escape') {
        var settings = document.getElementById('settings-panel');
        if (settings && !settings.classList.contains('hidden')) {
          closeSettings();
          return;
        }
        if (typeof togglePause === 'function') togglePause();
      }
      if (e.code === 'KeyE') {
        if (typeof interact === 'function') interact();
      }
      if (e.code === 'KeyF') {
        if (typeof doAction === 'function') doAction();
      }
      if (e.code === 'KeyB') {
        if (typeof toggleShop === 'function') toggleShop();
      }
      if (e.code === 'KeyI') {
        if (typeof toggleInventory === 'function') toggleInventory();
      }
      var num = parseInt(e.key);
      if (num >= 1 && num <= 8) {
        if (typeof selectTool === 'function') selectTool(num - 1);
      }
    });

    document.addEventListener('keyup', function(e) {
      GAME.keys[e.code] = false;
    });

    window.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    window.addEventListener('blur', function() {
      if (GAME.keys) {
        for (var k in GAME.keys) GAME.keys[k] = false;
      }
    });

    this.setupSettings();
    this.setupTouchControls();
    this.setupToolbarClicks();
    this.isInitialized = true;
  },

  setupSettings: function() {
    var self = this;
    var sliderMap = {
      'vol-master': function(v) { if (GAME.audio) GAME.audio.setMasterVol(v); },
      'vol-sfx': function(v) { if (GAME.audio) GAME.audio.setSfxVol(v); },
      'sens-slider': function(v) { if (GAME.camera) { GAME.camera.sensitivity = v; } }
    };
    document.addEventListener('input', function(e) {
      var fn = sliderMap[e.target.id];
      if (fn) fn(parseFloat(e.target.value));
    });
    document.addEventListener('change', function(e) {
      if (e.target.id === 'invert-y' && GAME.camera) {
        GAME.camera.invertY = e.target.checked;
      }
      if (e.target.id === 'pointer-lock') {
        if (GAME.camera) GAME.camera._pointerLockEnabled = e.target.checked;
      }
    });
    var loadBtn = document.getElementById('render-dist');
    if (loadBtn) {
      loadBtn.addEventListener('change', function() {
        if (GAME.camera) GAME.camera.maxDist = parseFloat(this.value);
      });
    }
  },

  setupToolbarClicks: function() {
    document.addEventListener('click', function(e) {
      var slot = e.target.closest('.tool-slot');
      if (slot) {
        var idx = parseInt(slot.dataset.tool);
        if (!isNaN(idx) && typeof selectTool === 'function') selectTool(idx);
      }
    });
  },

  isMenuVisible: function() {
    var menu = document.getElementById('main-menu');
    return menu && menu.style.display !== 'none' && window.getComputedStyle(menu).opacity !== '0';
  },

  // هل هناك واجهة تمنع اللعب (قائمة/إيقاف/أي نافذة منبثقة مفتوحة)؟
  // تُستخدم لمنع قفل مؤشر الموس أثناء التفاعل مع الإعدادات/المتجر/المخزون
  isUIBlocking: function() {
    if (this.isMenuVisible()) return true;
    if (GAME.game && GAME.game.isPaused) return true;
    var overlays = document.querySelectorAll('.modal-overlay');
    for (var i = 0; i < overlays.length; i++) {
      if (!overlays[i].classList.contains('hidden')) return true;
    }
    return false;
  },

  showLoading: function(progress) {
    var fill = document.querySelector('.loader-fill');
    if (fill) fill.style.width = Math.min(100, Math.max(0, progress)) + '%';
  },

  hideLoading: function() {
    var screen = document.getElementById('loading-screen');
    if (screen) screen.style.opacity = '0';
    setTimeout(function() {
      if (screen) screen.style.display = 'none';
    }, 500);
  },

  showMenu: function() {
    var menu = document.getElementById('main-menu');
    if (menu) { menu.style.display = 'flex'; menu.style.opacity = '1'; }
    var hud = document.getElementById('hud');
    if (hud) { hud.style.opacity = '0'; hud.setAttribute('aria-hidden', 'true'); }
    var crosshair = document.getElementById('crosshair');
    if (crosshair) crosshair.style.opacity = '0';
    if (document.pointerLockElement) document.exitPointerLock();
  },

  hideMenu: function() {
    var menu = document.getElementById('main-menu');
    if (menu) menu.style.opacity = '0';
    setTimeout(function() {
      if (menu) menu.style.display = 'none';
      var hud = document.getElementById('hud');
      if (hud) { hud.style.opacity = '1'; hud.setAttribute('aria-hidden', 'false'); }
      var crosshair = document.getElementById('crosshair');
      if (crosshair) crosshair.style.opacity = '1';
    }, 300);
  },

  updateHUD: function(state) {
    var healthFill = document.getElementById('health-fill');
    var energyFill = document.getElementById('energy-fill');
    var healthVal = document.getElementById('health-val');
    var energyVal = document.getElementById('energy-val');
    var moneyVal = document.getElementById('money-val');
    var dayEl = document.getElementById('day-val');
    var timeEl = document.getElementById('time-val');
    var compassEl = document.getElementById('compass-dir');
    var weatherIcon = document.getElementById('weather-icon');

    // 🎨 Day/night HUD theme
    var hudEl = document.getElementById('hud');
    if (state.time >= 19 || state.time <= 6) {
      if (hudEl) hudEl.className = 'night';
    } else {
      if (hudEl) hudEl.className = 'day';
    }

    var hp = Math.round(state.health);
    var ep = Math.round(state.energy);
    if (healthFill) healthFill.style.width = Math.max(0, Math.min(100, hp)) + '%';
    if (energyFill) energyFill.style.width = Math.max(0, Math.min(100, ep)) + '%';
    if (healthVal) healthVal.textContent = hp;
    if (energyVal) energyVal.textContent = ep;
    if (moneyVal) moneyVal.textContent = Math.round(state.money);
    if (dayEl) dayEl.textContent = 'Day ' + state.day;

    // ⏰ Time + weather icon
    if (timeEl) {
      var hours = Math.floor(state.time);
      var mins = Math.floor((state.time % 1) * 60);
      var ampm = hours >= 12 ? 'PM' : 'AM';
      var h12 = hours % 12 || 12;
      var w = (GAME.weather && GAME.weather.current) ? GAME.weather.current : 'sunny';
      if (hours < 6 || hours >= 18) var icon = '🌙';
      else if (w === 'rainy') icon = '🌧️';
      else if (w === 'stormy') icon = '⛈️';
      else if (w === 'cloudy') icon = '⛅';
      else icon = '☀️';
      timeEl.textContent = icon + ' ' + h12.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0') + ' ' + ampm;
    }

    // 🧭 Compass
    if (compassEl && GAME.camera && GAME.camera.camera) {
      var forward = new THREE.Vector3();
      GAME.camera.camera.getWorldDirection(forward);
      var heading = Math.atan2(forward.x, forward.z) * (180 / Math.PI);
      if (heading < 0) heading += 360;
      var dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      var idx = Math.round(heading / 45) % 8;
      compassEl.textContent = dirs[idx];
    }

    // 🌤️ Weather icon separate
    if (weatherIcon && GAME.weather && GAME.weather.current) {
      var map = { sunny: '☀️', cloudy: '⛅', rainy: '🌧️', stormy: '⛈️', snow: '❄️' };
      weatherIcon.textContent = map[GAME.weather.current] || '☀️';
    }

    var levelEl = document.getElementById('level-val');
    if (levelEl) levelEl.textContent = 'Lv.' + state.level;

    var healthFillEl = document.getElementById('health-fill');
    if (healthFillEl && hp < 25) {
      healthFillEl.style.background = 'linear-gradient(90deg, #ff6b6b, #ff0000)';
    } else if (healthFillEl) {
      healthFillEl.style.background = 'linear-gradient(90deg, #ff6b6b, #ff4757)';
    }
  },

  showNotification: function(text, type) {
    var container = document.getElementById('notif-container');
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'notification ' + (type || 'info');
    el.textContent = text;
    container.appendChild(el);
    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(function() {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 2800);
  },

  showInteractionHint: function(text) {
    var el = document.getElementById('interaction-hint');
    if (!el) return;
    if (text) {
      el.textContent = text;
      el.className = 'interaction-hint';
    } else {
      el.className = 'interaction-hint hidden';
    }
  },

  openSettings: function() {
    var panel = document.getElementById('settings-panel');
    if (!panel) return;
    panel.classList.remove('hidden');
    if (document.pointerLockElement) document.exitPointerLock(); // حرّر الموس للتفاعل
    this._populateSettings();
  },

  closeSettings: function() {
    var panel = document.getElementById('settings-panel');
    if (!panel) return;
    panel.classList.add('hidden');
    this._saveSettings();
  },

  _populateSettings: function() {
    try {
      var s = JSON.parse(localStorage.getItem('farmSettings') || '{}');
      var setVal = function(id, val) {
        var el = document.getElementById(id);
        if (el && el.type === 'range') el.value = val;
      };
      setVal('vol-master', s.masterVol !== undefined ? s.masterVol : 50);
      setVal('vol-sfx', s.sfxVol !== undefined ? s.sfxVol : 80);
      setVal('sens-slider', s.sensitivity !== undefined ? s.sensitivity : 10);
      setVal('render-dist', s.renderDist !== undefined ? s.renderDist : 8);

      var invertEl = document.getElementById('invert-y');
      if (invertEl) invertEl.checked = !!s.invertY;
      var plEl = document.getElementById('pointer-lock');
      if (plEl) plEl.checked = s.pointerLock !== false;
      var shadowEl = document.getElementById('shadows');
      if (shadowEl) shadowEl.checked = s.shadows !== false;
      var qualityEl = document.getElementById('quality-select');
      if (qualityEl) qualityEl.value = s.quality || 'high';
      var autoQualityEl = document.getElementById('auto-quality');
      if (autoQualityEl) autoQualityEl.checked = s.autoQuality !== false;
    } catch(e) {}
  },

  _saveSettings: function() {
    var s = {};
    var getVal = function(id) {
      var el = document.getElementById(id);
      return el ? parseFloat(el.value) : null;
    };
    s.masterVol = getVal('vol-master') || 50;
    s.sfxVol = getVal('vol-sfx') || 80;
    s.sensitivity = getVal('sens-slider') || 10;
    s.renderDist = getVal('render-dist') || 8;
    var invertEl = document.getElementById('invert-y');
    s.invertY = invertEl ? invertEl.checked : false;
    var plEl = document.getElementById('pointer-lock');
    s.pointerLock = plEl ? plEl.checked : true;
    var shadowEl = document.getElementById('shadows');
    s.shadows = shadowEl ? shadowEl.checked : true;
    var qualityEl = document.getElementById('quality-select');
    s.quality = qualityEl ? qualityEl.value : 'high';
    var autoQualityEl = document.getElementById('auto-quality');
    s.autoQuality = autoQualityEl ? autoQualityEl.checked : true;
    try { localStorage.setItem('farmSettings', JSON.stringify(s)); } catch(e) {}
    if (GAME.camera) {
      GAME.camera.sensitivity = s.sensitivity;
      GAME.camera.invertY = s.invertY;
    }
    if (GAME.audio) {
      GAME.audio.setMasterVol(s.masterVol);
      GAME.audio.setSfxVol(s.sfxVol);
    }
    if (GAME.game) {
      GAME.game._autoQuality = s.autoQuality;
      if (!s.autoQuality) {
        GAME.game.setQuality(s.quality);
      }
      // Apply shadows toggle
      if (GAME.game.renderer) {
        GAME.game.renderer.shadowMap.enabled = s.shadows;
      }
      // Apply render distance
      if (GAME.game.scene) {
        GAME.game.scene.fog = new THREE.Fog(0x87CEEB, s.renderDist * 3, s.renderDist * 6);
      }
    }
  },

  setupTouchControls: function() {
    var joystick = document.getElementById('touch-joystick');
    var knob = document.getElementById('joystick-knob');
    if (!joystick || !knob) return;
    var touchId = null;
    var centerX = 0, centerY = 0;
    var maxDist = 30;

    function onStart(e) {
      e.preventDefault();
      var touch = e.changedTouches[0];
      touchId = touch.identifier;
      var rect = joystick.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
      onMove(e);
    }
    function onMove(e) {
      e.preventDefault();
      for (var i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          var t = e.changedTouches[i];
          var dx = t.clientX - centerX;
          var dy = t.clientY - centerY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > maxDist) { dx = dx / dist * maxDist; dy = dy / dist * maxDist; }
          knob.style.transform = 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px)';
          var normX = dx / maxDist, normY = dy / maxDist;
          GAME.keys['KeyW'] = normY < -0.3;
          GAME.keys['KeyS'] = normY > 0.3;
          GAME.keys['KeyA'] = normX < -0.3;
          GAME.keys['KeyD'] = normX > 0.3;
          return;
        }
      }
    }
    function onEnd(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
          knob.style.transform = 'translate(-50%,-50%) translate(0,0)';
          GAME.keys['KeyW'] = false;
          GAME.keys['KeyS'] = false;
          GAME.keys['KeyA'] = false;
          GAME.keys['KeyD'] = false;
        }
      }
    }
    joystick.addEventListener('touchstart', onStart, { passive: false });
    joystick.addEventListener('touchmove', onMove, { passive: false });
    joystick.addEventListener('touchend', onEnd);
    joystick.addEventListener('touchcancel', onEnd);
  }
};

function startGame() {
  if (typeof GAME !== 'undefined' && GAME.game) {
    GAME.game.startNew();
  }
}

function continueGame() {
  if (typeof GAME !== 'undefined' && GAME.game) {
    GAME.game.loadGame();
  }
}

function togglePause() {
  if (typeof GAME !== 'undefined' && GAME.game) {
    GAME.game.togglePause();
  }
}

function resumeGame() {
  if (typeof GAME !== 'undefined' && GAME.game && GAME.game.isPaused) {
    GAME.game.togglePause();
  }
}

function saveAndQuit() {
  if (typeof GAME !== 'undefined' && GAME.game) {
    GAME.game.saveGame();
    GAME.game.quitToMenu();
  }
}

function toggleShop() {
  var el = document.getElementById('shop-ui');
  if (!el) return;
  var isOpen = !el.classList.contains('hidden');
  el.classList.toggle('hidden');
  if (typeof GAME !== 'undefined' && GAME.game) {
    GAME.game.isShopOpen = !isOpen;
  }
  if (!isOpen && document.pointerLockElement) document.exitPointerLock(); // حرّر الموس عند فتح المتجر
  if (!isOpen && GAME.game) {
    var bonus = GAME.game.getSellPriceBonus ? GAME.game.getSellPriceBonus() : 1;
    var prices = { bread: 65, ketchup: 100, juice: 80 };
    var elMap = { bread: 'bread-price', ketchup: 'ketchup-price', juice: 'juice-price' };
    for (var key in elMap) {
      var pel = document.getElementById(elMap[key]);
      if (pel) pel.textContent = '$' + Math.floor(prices[key] * bonus) + ' / ea';
    }
  }
}

function openSettings() {
  if (GAME.ui) GAME.ui.openSettings();
}

function closeSettings() {
  if (GAME.ui) GAME.ui.closeSettings();
}

function buySeed(type) {
  if (typeof GAME !== 'undefined' && GAME.game) {
    GAME.game.buySeed(type);
  }
}

function sellItem(type) {
  if (typeof GAME !== 'undefined' && GAME.game) {
    GAME.game.sellItem(type);
  }
}

function selectTool(index) {
  if (typeof GAME !== 'undefined' && GAME.game) {
    GAME.game.selectTool(index);
  }
}

function interact() {
  if (typeof GAME !== 'undefined' && GAME.game && !GAME.game.isPaused) {
    GAME.game.interact();
  }
}

function doAction() {
  if (typeof GAME !== 'undefined' && GAME.game && !GAME.game.isPaused) {
    GAME.game.doAction();
  }
}

function buyAnimal(type) {
  if (typeof GAME !== 'undefined' && GAME.animals) {
    GAME.animals.buy(type);
  }
}

function toggleMute() {
  if (typeof GAME !== 'undefined' && GAME.audio) {
    var isOn = GAME.audio.toggle();
    var btn = document.getElementById('mute-btn');
    if (btn) btn.textContent = isOn ? '🔊' : '🔇';
  }
}

function touchInteract() { if (typeof interact === 'function') interact(); }
function touchAction() { if (typeof doAction === 'function') doAction(); }

function toggleInventory() {
  var el = document.getElementById('inventory-ui');
  if (!el) return;
  var isOpen = !el.classList.contains('hidden');
  el.classList.toggle('hidden');
  if (!isOpen && document.pointerLockElement) document.exitPointerLock(); // حرّر الموس عند فتح المخزون
  if (!isOpen && GAME.ui) GAME.ui.refreshInventory();
}

function switchInvTab(tab) {
  var tabs = document.querySelectorAll('.inv-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.toggle('active', tabs[i].dataset.tab === tab);
  }
  var panels = document.querySelectorAll('.inv-panel');
  for (var i = 0; i < panels.length; i++) {
    panels[i].classList.toggle('active', panels[i].id === 'inv-' + tab);
  }
}

function craftItem(recipeId) {
  if (typeof GAME !== 'undefined' && GAME.game) {
    GAME.game.craftItem(recipeId);
  }
}

GAME.ui.refreshInventory = function() {
  var s = GAME.game && GAME.game.state;
  if (!s) return;
  // المحاصيل المحصودة تعيش تحت inventory.harvest، والسماد تحت inventory.fertilizer (عدة درجات)
  var cropMap = { wheat: 'inv-wheat', tomato: 'inv-tomato', carrot: 'inv-carrot', apple: 'inv-apple' };
  var harvest = s.inventory.harvest || {};
  for (var cropKey in cropMap) {
    var cropEl = document.getElementById(cropMap[cropKey]);
    if (cropEl) cropEl.textContent = harvest[cropKey] !== undefined ? harvest[cropKey] : (s.inventory[cropKey] || 0);
  }
  var fertEl = document.getElementById('inv-fertilizer');
  if (fertEl) {
    var fert = s.inventory.fertilizer;
    fertEl.textContent = (fert && typeof fert === 'object')
      ? (fert.basic || 0) + (fert.quality || 0) + (fert.premium || 0)
      : (fert || 0);
  }
  // المنتجات المصنّعة (bread/ketchup/juice) محفوظة أيضاً في state.crafted للتوافق
  var craftedMap = { bread: 'inv-bread', ketchup: 'inv-ketchup', juice: 'inv-juice' };
  for (var craftedKey in craftedMap) {
    var craftedEl = document.getElementById(craftedMap[craftedKey]);
    if (craftedEl && s.crafted[craftedKey] !== undefined) craftedEl.textContent = s.crafted[craftedKey];
  }
  // Refresh quests list
  GAME.ui.refreshQuests();
  // Refresh achievements
  GAME.ui.refreshAchievements();
};

GAME.ui.refreshQuests = function() {
  var container = document.getElementById('quests-list');
  if (!container) return;
  var quests = GAME.game && GAME.game.state && GAME.game.state.quests;
  if (!quests || quests.length === 0) {
    container.innerHTML = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">No quests today. Sleep to get new ones!</p>';
    return;
  }
  var html = '';
  for (var i = 0; i < quests.length; i++) {
    var q = quests[i];
    var pct = Math.min(100, Math.floor((q.current / q.target) * 100));
    var done = q.completed ? '✅' : '';
    html += '<div class="quest-row' + (q.completed ? ' quest-done' : '') + '">' +
      '<div class="quest-header">' +
        '<span class="quest-title">' + (q.completed ? '✅ ' : '📋 ') + q.title + ' — ' + q.desc + ' (' + q.current + '/' + q.target + ')</span>' +
        '<span class="quest-reward">+' + q.rewardXP + ' XP</span>' +
      '</div>' +
      '<div class="quest-bar-wrap"><div class="quest-bar-fill" style="width:' + pct + '%"></div></div>' +
    '</div>';
  }
  container.innerHTML = html;
};

GAME.ui.refreshAchievements = function() {
  var container = document.getElementById('inv-achievements');
  if (!container) return;
  var state = GAME.game && GAME.game.state;
  if (!state || !state.achievements) {
    container.innerHTML = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">Loading achievements...</p>';
    return;
  }
  var unlocked = state.achievements || [];
  var html = '';
  for (var i = 0; i < GAME.achievements.list.length; i++) {
    var ach = GAME.achievements.list[i];
    var isUnlocked = unlocked.indexOf(ach.id) !== -1;
    var canUnlock = !isUnlocked && ach.check(state);
    html += '<div class="ach-row' + (isUnlocked ? ' ach-unlocked' : '') + (canUnlock ? ' ach-ready' : '') + '">' +
      '<div class="ach-icon">' + ach.icon + '</div>' +
      '<div class="ach-info">' +
        '<div class="ach-title">' + (isUnlocked ? '✅ ' : '🔒 ') + ach.title + '</div>' +
        '<div class="ach-desc">' + ach.desc + '</div>' +
      '</div>' +
      '<div class="ach-reward">+' + ach.rewardXP + ' XP<br/>+$' + ach.rewardMoney + '</div>' +
    '</div>';
  }
  container.innerHTML = html;
};
