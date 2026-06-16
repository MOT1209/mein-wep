var GAME = GAME || {};
GAME.ui = {
  isInitialized: false,
  notificationTimeout: null,

  init: function() {
    GAME.keys = {};

    document.addEventListener('keydown', function(e) {
      GAME.keys[e.code] = true;
      if (e.code === 'Escape') {
        if (typeof togglePause === 'function') togglePause();
      }
      if (e.code === 'KeyE') {
        if (typeof interact === 'function') interact();
      }
      if (e.code === 'KeyF') {
        if (typeof doAction === 'function') doAction();
      }
      var num = parseInt(e.key);
      if (num >= 1 && num <= 6) {
        if (typeof selectTool === 'function') selectTool(num - 1);
      }
    });

    document.addEventListener('keyup', function(e) {
      GAME.keys[e.code] = false;
    });

    window.addEventListener('contextmenu', function(e) { e.preventDefault(); });

    this.setupTouchControls();
    this.isInitialized = true;
  },

  setupTouchControls: function() {
    var joystick = document.getElementById('touch-joystick');
    var knob = document.getElementById('joystick-knob');
    if (!joystick || !knob) return;
    var self = this;
    var touchId = null;
    var centerX = 0, centerY = 0;
    var maxDist = 30;
    var activeKeys = {};

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
  },

  showLoading: function(progress) {
    var fill = document.querySelector('.loader-fill');
    if (fill) fill.style.width = progress + '%';
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
    if (menu) menu.style.display = 'flex';
    var hud = document.getElementById('hud');
    if (hud) hud.style.opacity = '0';
    var blocker = document.getElementById('blocker');
    if (blocker) blocker.style.display = 'block';
    var crosshair = document.getElementById('crosshair');
    if (crosshair) crosshair.style.opacity = '0';
  },

  hideMenu: function() {
    var menu = document.getElementById('main-menu');
    if (menu) menu.style.opacity = '0';
    setTimeout(function() {
      if (menu) menu.style.display = 'none';
      var hud = document.getElementById('hud');
      if (hud) hud.style.opacity = '1';
      var blocker = document.getElementById('blocker');
      if (blocker) blocker.style.display = 'none';
      var crosshair = document.getElementById('crosshair');
      if (crosshair) crosshair.style.opacity = '1';
    }, 300);
  },

  updateHUD: function(state) {
    var healthEl = document.getElementById('health-val');
    var energyEl = document.getElementById('energy-val');
    var moneyEl = document.getElementById('money-val');
    var dayEl = document.getElementById('day-val');
    var timeEl = document.getElementById('time-val');
    if (healthEl) healthEl.textContent = Math.round(state.health);
    if (energyEl) energyEl.textContent = Math.round(state.energy);
    if (moneyEl) moneyEl.textContent = Math.round(state.money);
    if (dayEl) dayEl.textContent = 'Day ' + state.day;
    if (timeEl) {
      var hours = Math.floor(state.time);
      var mins = Math.floor((state.time % 1) * 60);
      var ampm = hours >= 12 ? 'PM' : 'AM';
      var h12 = hours % 12 || 12;
      var icon = hours >= 6 && hours < 18 ? '☀️' : '🌙';
      timeEl.textContent = icon + ' ' + h12.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0') + ' ' + ampm;
    }
  },

  showNotification: function(text, type) {
    var el = document.getElementById('notif');
    if (!el) return;
    el.textContent = text;
    el.className = 'notification ' + (type || '');
    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(function() {
      el.className = 'notification hidden';
    }, 2500);
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
