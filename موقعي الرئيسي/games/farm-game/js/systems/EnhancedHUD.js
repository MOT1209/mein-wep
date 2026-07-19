/**
 * EnhancedHUD.js — HUD overlay for health, energy, money, XP, level,
 * time, weather, quest tracker, tool slots, and mini-map.
 * Must be loaded after UIElements.js and before main.js.
 */
GAME.EnhancedHUD = {
  elements: {},
  _updateInterval: null,

  init: function (game) {
    this.game = game;
    this.createHUD();
    this.startUpdate();
  },

  /* ──────────────────────────────────────────────────────
     Create full HUD DOM structure
     ────────────────────────────────────────────────────── */
  createHUD: function () {
    var hud = document.createElement('div');
    hud.className = 'game-hud';
    hud.innerHTML =
      '<div class="hud-top">' +
        '<div class="hud-left">' +
          '<div class="health-bar">' +
            '<div class="health-bar-fill" style="width:100%"></div>' +
            '<span class="health-bar-text">100/100</span>' +
          '</div>' +
          '<div class="energy-bar">' +
            '<div class="energy-bar-fill" style="width:100%"></div>' +
            '<span class="energy-bar-text">100/100</span>' +
          '</div>' +
          '<div class="money-display">' +
            '<span class="money-icon">💰</span>' +
            '<span class="money-amount">0</span>' +
          '</div>' +
          '<div class="level-display">' +
            '<span class="level-icon">⭐</span>' +
            '<span class="level-number">1</span>' +
          '</div>' +
          '<div class="xp-bar">' +
            '<div class="xp-bar-fill" style="width:0%"></div>' +
          '</div>' +
        '</div>' +
        '<div class="hud-center">' +
          '<div class="time-display">' +
            '<span class="time-icon">🕐</span>' +
            '<span class="time-text">06:00</span>' +
          '</div>' +
          '<div class="weather-display">' +
            '<span class="weather-icon">☀️</span>' +
            '<span class="weather-text">Clear</span>' +
          '</div>' +
        '</div>' +
        '<div class="hud-right">' +
          '<div class="quest-tracker">' +
            '<div class="quest-tracker-title">📋 Quests</div>' +
            '<div class="quest-tracker-list"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tool-slots">' +
        '<div class="tool-slot selected" data-tool="0">' +
          '<div class="tool-slot-icon">🔧</div>' +
          '<div class="tool-slot-key">1</div>' +
        '</div>' +
        '<div class="tool-slot" data-tool="1">' +
          '<div class="tool-slot-icon">💧</div>' +
          '<div class="tool-slot-key">2</div>' +
        '</div>' +
        '<div class="tool-slot" data-tool="2">' +
          '<div class="tool-slot-icon">🌱</div>' +
          '<div class="tool-slot-key">3</div>' +
        '</div>' +
        '<div class="tool-slot" data-tool="3">' +
          '<div class="tool-slot-icon">🌾</div>' +
          '<div class="tool-slot-key">4</div>' +
        '</div>' +
        '<div class="tool-slot" data-tool="4">' +
          '<div class="tool-slot-icon">🧪</div>' +
          '<div class="tool-slot-key">5</div>' +
        '</div>' +
      '</div>' +
      '<div class="mini-map">' +
        '<canvas class="mini-map-canvas"></canvas>' +
        '<div class="mini-map-player"></div>' +
      '</div>';
    document.body.appendChild(hud);

    this.elements = {
      hud: hud,
      healthBar: hud.querySelector('.health-bar-fill'),
      healthText: hud.querySelector('.health-bar-text'),
      energyBar: hud.querySelector('.energy-bar-fill'),
      energyText: hud.querySelector('.energy-bar-text'),
      moneyAmount: hud.querySelector('.money-amount'),
      levelNumber: hud.querySelector('.level-number'),
      xpBar: hud.querySelector('.xp-bar-fill'),
      timeText: hud.querySelector('.time-text'),
      weatherIcon: hud.querySelector('.weather-icon'),
      weatherText: hud.querySelector('.weather-text'),
      questList: hud.querySelector('.quest-tracker-list'),
      toolSlots: hud.querySelectorAll('.tool-slot'),
      miniMapCanvas: hud.querySelector('.mini-map-canvas')
    };

    this._initMiniMapCanvas();
    this._setupToolSlots();
    this._setupKeyboardShortcuts();
  },

  /* ──────────────────────────────────────────────────────
     Mini-map canvas setup
     ────────────────────────────────────────────────────── */
  _initMiniMapCanvas: function () {
    var canvas = this.elements.miniMapCanvas;
    if (!canvas) return;
    canvas.width = 150;
    canvas.height = 150;
  },

  /* ──────────────────────────────────────────────────────
     Tool-slot click handlers
     ────────────────────────────────────────────────────── */
  _setupToolSlots: function () {
    var self = this;
    this.elements.toolSlots.forEach(function (slot) {
      slot.addEventListener('click', function () {
        var toolIndex = parseInt(slot.dataset.tool, 10);
        self.selectTool(toolIndex);
      });
    });
  },

  /* ──────────────────────────────────────────────────────
     Keyboard shortcuts 1-5 for tool slots
     ────────────────────────────────────────────────────── */
  _setupKeyboardShortcuts: function () {
    var self = this;
    document.addEventListener('keydown', function (e) {
      var key = e.key;
      if (key >= '1' && key <= '5') {
        self.selectTool(parseInt(key, 10) - 1);
      }
    });
  },

  /* ──────────────────────────────────────────────────────
     Select a tool slot by index
     ────────────────────────────────────────────────────── */
  selectTool: function (index) {
    this.elements.toolSlots.forEach(function (slot, i) {
      slot.classList.toggle('selected', i === index);
    });
    if (GAME.state) {
      GAME.state.selectedTool = index;
    }
    // Trigger equip animation on the selected slot
    var slot = this.elements.toolSlots[index];
    if (slot) {
      slot.classList.remove('equip');
      void slot.offsetWidth; // reflow to restart animation
      slot.classList.add('equip');
    }
  },

  /* ──────────────────────────────────────────────────────
     Start periodic HUD update
     ────────────────────────────────────────────────────── */
  startUpdate: function () {
    var self = this;
    this._updateInterval = setInterval(function () {
      self.update();
    }, 100);
  },

  /* ──────────────────────────────────────────────────────
     Stop periodic HUD update
     ────────────────────────────────────────────────────── */
  stopUpdate: function () {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
  },

  /* ──────────────────────────────────────────────────────
     Main update tick (every 100 ms)
     ────────────────────────────────────────────────────── */
  update: function () {
    if (!GAME.state) return;

    /* ── Health ── */
    var health = GAME.state.health || 0;
    var maxHealth = GAME.state.maxHealth || 100;
    var healthPct = Math.max(0, Math.min(100, (health / maxHealth) * 100));
    this.elements.healthBar.style.width = healthPct + '%';
    this.elements.healthText.textContent = health + '/' + maxHealth;
    // low-health pulse
    var healthBar = this.elements.healthBar.parentElement;
    if (healthPct <= 25) {
      healthBar.classList.add('low');
    } else {
      healthBar.classList.remove('low');
    }

    /* ── Energy ── */
    var energy = GAME.state.energy || 0;
    var maxEnergy = GAME.state.maxEnergy || 100;
    var energyPct = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));
    this.elements.energyBar.style.width = energyPct + '%';
    this.elements.energyText.textContent = energy + '/' + maxEnergy;

    /* ── Money ── */
    this.elements.moneyAmount.textContent = GAME.state.money || 0;

    /* ── Level ── */
    this.elements.levelNumber.textContent = GAME.state.level || 1;

    /* ── XP ── */
    var xp = GAME.state.xp || 0;
    var xpNeeded = (GAME.state.level || 1) * 100;
    var xpPct = Math.max(0, Math.min(100, (xp / xpNeeded) * 100));
    this.elements.xpBar.style.width = xpPct + '%';

    /* ── Time ── */
    if (GAME.TimeSystem && typeof GAME.TimeSystem.getTimeString === 'function') {
      this.elements.timeText.textContent = GAME.TimeSystem.getTimeString();
    }

    /* ── Weather ── */
    if (GAME.WeatherSystem && GAME.WeatherSystem.weatherTypes) {
      var weatherData = GAME.WeatherSystem.weatherTypes[GAME.WeatherSystem.currentWeather];
      if (weatherData) {
        var parts = weatherData.name.split(' ');
        this.elements.weatherIcon.textContent = parts[0] || '☀️';
        this.elements.weatherText.textContent = parts.slice(1).join(' ') || 'Clear';
      }
    }

    /* ── Quests ── */
    this._updateQuests();

    /* ── Mini-map ── */
    this._drawMiniMap();
  },

  /* ──────────────────────────────────────────────────────
     Update quest tracker (DOM-safe, no innerHTML with data)
     ────────────────────────────────────────────────────── */
  _updateQuests: function () {
    if (!GAME.QuestSystem) return;

    var list = this.elements.questList;
    var quests = GAME.QuestSystem.activeQuests || [];
    var visibleQuests = quests.filter(function (q) { return !q.completed; }).slice(0, 3);

    // Ensure we have the right number of child elements
    while (list.children.length < visibleQuests.length) {
      var item = document.createElement('div');
      item.className = 'quest-tracker-item';

      var header = document.createElement('div');
      header.className = 'quest-tracker-item-header';

      var title = document.createElement('span');
      title.className = 'quest-tracker-item-title';
      header.appendChild(title);

      var progress = document.createElement('span');
      progress.className = 'quest-tracker-item-progress';
      header.appendChild(progress);

      item.appendChild(header);

      var bar = document.createElement('div');
      bar.className = 'quest-tracker-progress-bar';

      var fill = document.createElement('div');
      fill.className = 'quest-tracker-progress-fill';
      bar.appendChild(fill);

      item.appendChild(bar);
      list.appendChild(item);
    }

    // Remove excess children
    while (list.children.length > visibleQuests.length) {
      list.removeChild(list.lastChild);
    }

    // Update each quest item
    var items = list.children;
    for (var i = 0; i < visibleQuests.length; i++) {
      var quest = visibleQuests[i];
      var el = items[i];

      var questProgress = quest.progress || 0;
      var target = (quest.target && quest.target.amount) || 1;
      var pct = Math.min(100, (questProgress / target) * 100);

      el.querySelector('.quest-tracker-item-title').textContent = quest.description || '';
      el.querySelector('.quest-tracker-item-progress').textContent = questProgress + '/' + target;
      el.querySelector('.quest-tracker-progress-fill').style.width = pct + '%';
    }
  },

  /* ──────────────────────────────────────────────────────
     Draw mini-map
     ────────────────────────────────────────────────────── */
  _drawMiniMap: function () {
    var canvas = this.elements.miniMapCanvas;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'rgba(34, 60, 34, 0.8)';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    for (var x = 0; x < w; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (var y = 0; y < h; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw plots if available
    if (GAME.state && GAME.state.plots) {
      var plots = GAME.state.plots;
      var worldSize = 100; // assume 100x100 world grid
      var scaleX = w / worldSize;
      var scaleY = h / worldSize;

      for (var p = 0; p < plots.length; p++) {
        var plot = plots[p];
        var px = (plot.x || 0) * scaleX;
        var py = (plot.z || 0) * scaleY;

        if (plot.hasCrop) {
          ctx.fillStyle = 'rgba(76, 175, 80, 0.7)'; // green for planted
        } else if (plot.plowed) {
          ctx.fillStyle = 'rgba(139, 90, 43, 0.7)'; // brown for plowed
        } else {
          ctx.fillStyle = 'rgba(100, 100, 100, 0.3)'; // gray for empty
        }
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      }
    }

    // Player dot
    var playerDot = this.elements.miniMapPlayer;
    if (playerDot && GAME.player && GAME.player.mesh) {
      var pos = GAME.player.mesh.position;
      var worldHalf = 50; // half of worldSize
      var dotX = ((pos.x + worldHalf) / (worldHalf * 2)) * w;
      var dotY = ((pos.z + worldHalf) / (worldHalf * 2)) * h;
      playerDot.style.left = dotX + 'px';
      playerDot.style.top = dotY + 'px';
    }
  },

  /* ──────────────────────────────────────────────────────
     Show / Hide
     ────────────────────────────────────────────────────── */
  show: function () {
    this.elements.hud.style.display = 'block';
  },

  hide: function () {
    this.elements.hud.style.display = 'none';
  },

  /* ──────────────────────────────────────────────────────
     Destroy (cleanup interval)
     ────────────────────────────────────────────────────── */
  destroy: function () {
    this.stopUpdate();
    if (this.elements.hud && this.elements.hud.parentNode) {
      this.elements.hud.parentNode.removeChild(this.elements.hud);
    }
    this.elements = {};
  }
};
