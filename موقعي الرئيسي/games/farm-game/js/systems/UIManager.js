/**
 * UIManager.js - نظام إدارة واجهات المستخدم المركزي
 * Farm Game 3D - Production Quality
 *
 * يدير فتح/إغلاق جميع النوافذ:
 * - Shop (المتجر)
 * - Inventory (المخزون)
 * - Crafting (الصناعة)
 * - Quests (المهام)
 * - Achievements (الإنجازات)
 * - Settings (الإعدادات)
 * - Dialogue (الحوارات)
 * - Upgrades (الترقيات)
 *
 * يتبع نمط:
 *   GAME.UIManager.open*()  / close*() / update*UI()
 */

var GAME = GAME || {};

GAME.UIManager = {
  // ─── حالة الفتح/الإغلاق ───
  isOpen: {
    shop: false,
    inventory: false,
    crafting: false,
    quests: false,
    achievements: false,
    settings: false,
    dialogue: false,
    upgrades: false
  },

  // ─── مراجع DOM (تُملأ عند init) ───
  panels: {},
  game: null,
  _initialized: false,

  // ═══════════════════════════════════════════
  //  التهيئة (init)
  // ═══════════════════════════════════════════
  init: function (game) {
    if (this._initialized) return;
    this.game = game || {};
    this._cacheElements();
    this._setupEventListeners();
    this._createDynamicPanels();
    this._initialized = true;
    console.log('[UIManager] ✅ Initialized');
  },

  // ═══════════════════════════════════════════
  //  خزّن مراجع DOM
  // ═══════════════════════════════════════════
  _cacheElements: function () {
    this.panels = {
      shop:        document.getElementById('shop-ui'),
      inventory:   document.getElementById('inventory-ui'),
      pause:       document.getElementById('pause-menu'),
      settings:    document.getElementById('settings-panel'),
      minimap:     document.getElementById('minimap'),
      hud:         document.getElementById('hud'),
      notif:       document.getElementById('notif-container')
    };
  },

  // ═══════════════════════════════════════════
  //  إعداد مستمعي الأحداث
  // ═══════════════════════════════════════════
  _setupEventListeners: function () {
    var self = this;

    // ── إغلاق بالضغط على زر ✕ داخل أي panel ──
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('modal-close')) {
        var overlay = e.target.closest('.modal-overlay');
        if (overlay) self._closeOverlay(overlay);
      }
    });

    // ── إغلاق بالضغط على الخلفية ──
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('modal-overlay')) {
        self._closeOverlay(e.target);
      }
    });

    // ── اختصارات لوحة المفاتيح ──
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case 'escape':
          self._handleEscape();
          break;
        case 'i':
          e.preventDefault();
          self.toggleInventory();
          break;
        case 'b':
          e.preventDefault();
          self.toggleShop();
          break;
        case 'c':
          e.preventDefault();
          self.toggleCrafting();
          break;
        case 'u':
          e.preventDefault();
          self.toggleUpgrades();
          break;
      }
    });
  },

  // ═══════════════════════════════════════════
  //  إنشاء عناصر UI الديناميكية
  // ═══════════════════════════════════════════
  _createDynamicPanels: function () {
    // Quests panel (داخل inventory-ui tabs)
    this._ensureQuestsPanel();
    // Achievements panel
    this._ensureAchievementsPanel();
    // Upgrades overlay
    this._ensureUpgradesPanel();
    // Dialogue overlay
    this._ensureDialoguePanel();
  },

  _ensureQuestsPanel: function () {
    var container = document.getElementById('inv-quests');
    if (!container) return;
    // سيملأه updateQuestsUI
  },

  _ensureAchievementsPanel: function () {
    var container = document.getElementById('inv-achievements');
    if (!container) return;
    // سيملأه updateAchievementsUI
  },

  _ensureUpgradesPanel: function () {
    if (document.getElementById('upgrades-overlay')) return;

    var html = '' +
      '<div id="upgrades-overlay" class="modal-overlay hidden" role="dialog" aria-label="Upgrades" aria-modal="true">' +
        '<div class="modal-box upgrades-box">' +
          '<div class="modal-header">' +
            '<h2><span class="modal-icon">⬆️</span> Upgrades</h2>' +
            '<button class="modal-close" aria-label="Close upgrades">✕</button>' +
          '</div>' +
          '<div class="upgrades-tabs" id="upgrades-tabs">' +
            '<button class="upgrade-tab active" data-cat="buildings">🏗️ Buildings</button>' +
            '<button class="upgrade-tab" data-cat="tools">🛠️ Tools</button>' +
            '<button class="upgrade-tab" data-cat="animals">🐄 Animals</button>' +
          '</div>' +
          '<div class="modal-body">' +
            '<div class="upgrades-grid" id="upgrades-grid"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);

    // ربط أزرار التصنيف
    var self = this;
    var tabs = document.getElementById('upgrades-tabs');
    if (tabs) {
      tabs.addEventListener('click', function (e) {
        var btn = e.target.closest('.upgrade-tab');
        if (!btn) return;
        tabs.querySelectorAll('.upgrade-tab').forEach(function (t) { t.classList.remove('active'); });
        btn.classList.add('active');
        self._renderUpgradesCategory(btn.dataset.cat);
      });
    }
  },

  _ensureDialoguePanel: function () {
    if (document.getElementById('dialogue-overlay')) return;

    var html = '' +
      '<div id="dialogue-overlay" class="modal-overlay hidden" role="dialog" aria-label="Dialogue" aria-modal="true">' +
        '<div class="dialogue-box">' +
          '<div class="dialogue-portrait" id="dialogue-portrait">🧑‍🌾</div>' +
          '<div class="dialogue-content">' +
            '<div class="dialogue-name" id="dialogue-name">NPC</div>' +
            '<div class="dialogue-text" id="dialogue-text"></div>' +
            '<div class="dialogue-choices" id="dialogue-choices"></div>' +
          '</div>' +
          '<button class="dialogue-next" id="dialogue-next" aria-label="Next">▶</button>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
  },

  // ═══════════════════════════════════════════
  //  أدوات مساعدة
  // ═══════════════════════════════════════════
  _show: function (id) {
    var el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) {
      el.classList.remove('hidden');
      el.style.display = '';
    }
  },

  _hide: function (id) {
    var el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) {
      el.classList.add('hidden');
      el.style.display = 'none';
    }
  },

  _closeOverlay: function (overlay) {
    if (!overlay) return;
    var id = overlay.id;
    this._hide(overlay);
    // تحديث الحالة
    for (var key in this.isOpen) {
      if (this.isOpen[key] && overlay.id && overlay.id.indexOf(key) !== -1) {
        this.isOpen[key] = false;
      }
    }
    // إرجاع المؤشر
    if (this.game && this.game.requestPointerLock && typeof this.game.requestPointerLock === 'function') {
      this.game.requestPointerLock();
    }
  },

  _handleEscape: function () {
    // ترتيب الأولوية: آخر فتح يُغلق أولاً
    if (this.isOpen.dialogue)    { this.closeDialogue(); return; }
    if (this.isOpen.upgrades)    { this.closeUpgrades(); return; }
    if (this.isOpen.shop)        { this.closeShop(); return; }
    if (this.isOpen.inventory)   { this.closeInventory(); return; }
    if (this.isOpen.crafting)    { this.closeCrafting(); return; }
    if (this.isOpen.quests)      { this.closeQuests(); return; }
    if (this.isOpen.achievements){ this.closeAchievements(); return; }
    if (this.isOpen.settings)    { this.closeSettings(); return; }
    // لا شيء مفتوح → افتح القائمة المؤقتة
    if (this.game && typeof this.game.togglePause === 'function') {
      this.game.togglePause();
    }
  },

  isAnyOpen: function () {
    for (var k in this.isOpen) {
      if (this.isOpen[k]) return true;
    }
    return false;
  },

  closeAll: function () {
    this.closeShop();
    this.closeInventory();
    this.closeCrafting();
    this.closeQuests();
    this.closeAchievements();
    this.closeSettings();
    this.closeDialogue();
    this.closeUpgrades();
  },

  // ═══════════════════════════════════════════
  //  🏪 المتجر (Shop)
  // ═══════════════════════════════════════════
  toggleShop: function () {
    this.isOpen.shop ? this.closeShop() : this.openShop();
  },

  openShop: function () {
    this.closeAll();
    this.isOpen.shop = true;
    this.updateShopUI();
    this._show('shop-ui');
    if (this.game && typeof this.game.exitPointerLock === 'function') {
      this.game.exitPointerLock();
    }
  },

  closeShop: function () {
    this.isOpen.shop = false;
    this._hide('shop-ui');
  },

  updateShopUI: function () {
    if (!GAME.EconomySystem) return;

    // ── Seeds ──
    var seeds = GAME.EconomySystem.shopItems
      ? GAME.EconomySystem.shopItems.filter(function (i) { return i.category === 'seed'; })
      : [];

    // ── Fallback: إذا لم تتوفر shopItems نبني من الصناديق المحددة ──
    if (seeds.length === 0) {
      seeds = this._getDefaultSeeds();
    }

    var shopBody = document.querySelector('#shop-ui .modal-body');
    if (!shopBody) return;

    var html = '<div class="shop-section"><h3>🌱 Seeds</h3>';
    seeds.forEach(function (item) {
      html += '<div class="shop-item">' +
        '<span class="item-icon">' + (item.icon || '🌱') + '</span>' +
        '<span class="item-name">' + (item.name || item.id) + '</span>' +
        '<span class="item-price">$' + (item.price || 0) + '</span>' +
        '<button class="shop-buy-btn" onclick="GAME.UIManager.buySeed(\'' + (item.id || item.key) + '\')">Buy</button>' +
        '</div>';
    });
    html += '</div>';

    // ── Animals ──
    html += '<div class="shop-section"><h3>🐑 Animals</h3>';
    html += '<div class="shop-item"><span class="item-icon">🐔</span><span class="item-name">Chicken</span><span class="item-price">$50</span><button class="shop-buy-btn" onclick="GAME.UIManager.buyAnimal(\'chicken\')">Buy</button></div>';
    html += '<div class="shop-item"><span class="item-icon">🐄</span><span class="item-name">Cow</span><span class="item-price">$200</span><button class="shop-buy-btn" onclick="GAME.UIManager.buyAnimal(\'cow\')">Buy</button></div>';
    html += '<div class="shop-item"><span class="item-icon">🐑</span><span class="item-name">Sheep</span><span class="item-price">$150</span><button class="shop-buy-btn" onclick="GAME.UIManager.buyAnimal(\'sheep\')">Buy</button></div>';
    html += '</div>';

    // ── Sell ──
    html += '<div class="shop-section"><h3>💰 Sell Produce</h3>';
    var sellItems = ['wheat', 'tomato', 'carrot', 'apple'];
    sellItems.forEach(function (id) {
      var qty = (GAME.state && GAME.state.inventory) ? (GAME.state.inventory[id] || 0) : 0;
      if (qty > 0) {
        var price = GAME.EconomySystem.sellPrice ? GAME.EconomySystem.sellPrice(id) : 25;
        html += '<div class="shop-item">' +
          '<span class="item-name">' + id + '</span>' +
          '<span class="item-qty">x' + qty + '</span>' +
          '<span class="item-price">$' + price + ' / ea</span>' +
          '<button class="shop-sell-btn" onclick="GAME.UIManager.sellItem(\'' + id + '\')">Sell All</button>' +
          '</div>';
      }
    });
    html += '</div>';

    shopBody.textContent = html;
  },

  _getDefaultSeeds: function () {
    var seeds = [];
    var items = [
      { id: 'wheat_seed', name: 'Wheat Seed', icon: '🌾', price: 10 },
      { id: 'tomato_seed', name: 'Tomato Seed', icon: '🍅', price: 20 },
      { id: 'carrot_seed', name: 'Carrot Seed', icon: '🥕', price: 15 },
      { id: 'apple_sapling', name: 'Apple Sapling', icon: '🌳', price: 50 },
      { id: 'corn_seed', name: 'Corn Seed', icon: '🌽', price: 15 },
      { id: 'potato_seed', name: 'Potato Seed', icon: '🥔', price: 12 },
      { id: 'strawberry_seed', name: 'Strawberry Seed', icon: '🍓', price: 25 }
    ];
    return items;
  },

  buySeed: function (seedId) {
    var success = false;
    if (GAME.EconomySystem && typeof GAME.EconomySystem.buyItem === 'function') {
      success = GAME.EconomySystem.buyItem(seedId, 1);
    } else if (GAME.FarmingSystem && typeof GAME.FarmingSystem.buySeed === 'function') {
      success = GAME.FarmingSystem.buySeed(seedId);
    }
    this._notify(success ? '✅ Purchased!' : '❌ Not enough money');
    this.updateShopUI();
    if (success) this.updateInventoryUI();
  },

  buyAnimal: function (type) {
    var success = false;
    if (GAME.AnimalsSystem && typeof GAME.AnimalsSystem.buyAnimal === 'function') {
      success = GAME.AnimalsSystem.buyAnimal(type);
    }
    this._notify(success ? '✅ Bought ' + type + '!' : '❌ Cannot buy');
  },

  sellItem: function (itemId) {
    var qty = (GAME.state && GAME.state.inventory) ? (GAME.state.inventory[itemId] || 0) : 0;
    if (qty <= 0) { this._notify('❌ Nothing to sell'); return; }
    var success = false;
    if (GAME.EconomySystem && typeof GAME.EconomySystem.sellItem === 'function') {
      success = GAME.EconomySystem.sellItem(itemId, qty);
    }
    this._notify(success ? '💰 Sold ' + qty + ' ' + itemId : '❌ Sell failed');
    this.updateShopUI();
    this.updateInventoryUI();
  },

  // ═══════════════════════════════════════════
  //  🎒 المخزون (Inventory)
  // ═══════════════════════════════════════════
  toggleInventory: function () {
    this.isOpen.inventory ? this.closeInventory() : this.openInventory();
  },

  openInventory: function () {
    this.closeAll();
    this.isOpen.inventory = true;
    this.updateInventoryUI();
    this._show('inventory-ui');
    if (this.game && typeof this.game.exitPointerLock === 'function') {
      this.game.exitPointerLock();
    }
  },

  closeInventory: function () {
    this.isOpen.inventory = false;
    this._hide('inventory-ui');
  },

  updateInventoryUI: function () {
    var inv = (GAME.state && GAME.state.inventory) ? GAME.state.inventory : {};
    var items = [
      { key: 'wheat',      icon: '🌾', name: 'Wheat' },
      { key: 'tomato',     icon: '🍅', name: 'Tomato' },
      { key: 'carrot',     icon: '🥕', name: 'Carrot' },
      { key: 'apple',      icon: '🍎', name: 'Apple' },
      { key: 'corn',       icon: '🌽', name: 'Corn' },
      { key: 'potato',     icon: '🥔', name: 'Potato' },
      { key: 'strawberry', icon: '🍓', name: 'Strawberry' },
      { key: 'fertilizer', icon: '🧪', name: 'Fertilizer' },
      { key: 'bread',      icon: '🍞', name: 'Bread' },
      { key: 'ketchup',    icon: '🥫', name: 'Ketchup' },
      { key: 'juice',      icon: '🧃', name: 'Carrot Juice' },
      { key: 'cheese',     icon: '🧀', name: 'Cheese' },
      { key: 'milk',       icon: '🥛', name: 'Milk' },
      { key: 'egg',        icon: '🥚', name: 'Egg' },
      { key: 'wool',       icon: '🧶', name: 'Wool' }
    ];

    var self = this;
    items.forEach(function (item) {
      var el = document.getElementById('inv-' + item.key);
      if (el) {
        el.textContent = inv[item.key] || 0;
      }
    });

    // تحديث واجهة المخزون الديناميكية (إذا وُجد grid)
    var grid = document.querySelector('.inventory-grid');
    if (grid) {
      var html = '';
      items.forEach(function (item) {
        var qty = inv[item.key] || 0;
        if (qty > 0) {
          html += '<div class="inv-item" data-id="' + item.key + '">' +
            '<div class="inv-item-icon">' + item.icon + '</div>' +
            '<div class="inv-item-count">' + qty + '</div>' +
            '<div class="inv-item-name">' + item.name + '</div>' +
            '</div>';
        }
      });
      grid.textContent = html || '<p class="inv-empty">Inventory is empty</p>';
    }

    // تحديث Crafting tab
    this.updateCraftingUI();
  },

  // ═══════════════════════════════════════════
  //  🔨 الصناعة (Crafting)
  // ═══════════════════════════════════════════
  toggleCrafting: function () {
    this.isOpen.crafting ? this.closeCrafting() : this.openCrafting();
  },

  openCrafting: function () {
    this.closeAll();
    this.isOpen.crafting = true;
    this.updateCraftingUI();
    // عرض عبر inventory tab
    this._show('inventory-ui');
    this._switchInvTab('crafting');
    if (this.game && typeof this.game.exitPointerLock === 'function') {
      this.game.exitPointerLock();
    }
  },

  closeCrafting: function () {
    this.isOpen.crafting = false;
    this._hide('inventory-ui');
  },

  _switchInvTab: function (tabName) {
    var tabs = document.querySelectorAll('.inv-tab');
    var panels = document.querySelectorAll('.inv-panel');
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === tabName);
    });
    panels.forEach(function (p) {
      p.classList.toggle('active', p.id === 'inv-' + tabName);
    });
  },

  updateCraftingUI: function () {
    // تحديث من CraftingSystem
    if (GAME.CraftingSystem && typeof GAME.CraftingSystem.getAllRecipes === 'function') {
      var recipes = GAME.CraftingSystem.getAllRecipes();
      var inv = (GAME.state && GAME.state.inventory) ? GAME.state.inventory : {};
      var container = document.getElementById('inv-crafting');
      if (!container) return;

      var html = '';
      for (var id in recipes) {
        var r = recipes[id];
        var check = GAME.CraftingSystem.canCraft(id);
        var canCraft = check && check.canCraft;

        html += '<div class="craft-recipe' + (canCraft ? '' : ' craft-locked') + '" data-recipe="' + id + '">';
        html += '<div class="craft-info">';
        html += '<span class="craft-icon">' + (r.icon || '🔨') + '</span>';
        html += '<span class="craft-name">' + (r.name || id) + '</span>';

        // المكونات
        var inputs = r.inputs || {};
        var inputStr = '';
        for (var ing in inputs) {
          var have = inv[ing] || 0;
          var need = inputs[ing];
          var ok = have >= need;
          inputStr += '<span class="craft-ingredient ' + (ok ? 'has' : 'missing') + '">' +
            ing + ' ' + have + '/' + need + '</span> ';
        }
        html += '<div class="craft-cost">' + inputStr + '</div>';
        html += '<span class="craft-result">→ ' + (r.quantity || 1) + ' ' + (r.name || id) + '</span>';
        html += '</div>';
        html += '<button class="craft-btn" ' + (canCraft ? '' : 'disabled') +
          ' onclick="GAME.UIManager.doCraft(\'' + id + '\')">Craft</button>';
        html += '</div>';
      }
      container.textContent = html || '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">No recipes available</p>';
      return;
    }

    // Fallback: العناصر الثابتة في HTML
    var fallbackRecipes = ['bread', 'ketchup', 'juice'];
    fallbackRecipes.forEach(function (id) {
      var el = document.querySelector('.craft-recipe[data-recipe="' + id + '"]');
      if (el) {
        var btn = el.querySelector('.craft-btn');
        if (btn) btn.disabled = false;
      }
    });
  },

  doCraft: function (recipeId) {
    var result = null;
    if (GAME.CraftingSystem && typeof GAME.CraftingSystem.craft === 'function') {
      result = GAME.CraftingSystem.craft(recipeId);
    } else if (GAME.EconomySystem && typeof GAME.EconomySystem.craft === 'function') {
      result = GAME.EconomySystem.craft(recipeId);
    }
    if (result) {
      this._notify('✅ Crafted!');
      this.updateCraftingUI();
      this.updateInventoryUI();
    } else {
      this._notify('❌ Cannot craft — missing materials');
    }
  },

  // ═══════════════════════════════════════════
  //  📋 المهام (Quests)
  // ═══════════════════════════════════════════
  toggleQuests: function () {
    this.isOpen.quests ? this.closeQuests() : this.openQuests();
  },

  openQuests: function () {
    this.closeAll();
    this.isOpen.quests = true;
    this.updateQuestsUI();
    this._show('inventory-ui');
    this._switchInvTab('quests');
    if (this.game && typeof this.game.exitPointerLock === 'function') {
      this.game.exitPointerLock();
    }
  },

  closeQuests: function () {
    this.isOpen.quests = false;
    this._hide('inventory-ui');
  },

  updateQuestsUI: function () {
    var container = document.getElementById('quests-list') || document.getElementById('inv-quests');
    if (!container) return;

    if (!GAME.QuestSystem) {
      container.textContent = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">Quest system not loaded</p>';
      return;
    }

    var quests = typeof GAME.QuestSystem.getActiveQuests === 'function'
      ? GAME.QuestSystem.getActiveQuests()
      : (GAME.QuestSystem.activeQuests || []);

    var html = '';

    // ── يومية ──
    var daily = quests.filter(function (q) { return q.type === 'daily'; });
    if (daily.length > 0) {
      html += '<div class="quest-section"><h3>📅 Daily Quests</h3>';
      daily.forEach(function (q, i) {
        var progress = q.progress || 0;
        var target = (q.target && q.target.amount) ? q.target.amount : 1;
        var pct = Math.min(100, Math.round((progress / target) * 100));
        var complete = pct >= 100;

        html += '<div class="quest-card' + (complete ? ' quest-complete' : '') + '">';
        html += '<div class="quest-header">';
        html += '<span class="quest-name">' + (q.descriptionEn || q.description || q.id) + '</span>';
        html += '<span class="quest-progress-badge">' + progress + '/' + target + '</span>';
        html += '</div>';
        html += '<div class="quest-bar"><div class="quest-bar-fill" style="width:' + pct + '%"></div></div>';
        if (q.rewards) {
          html += '<div class="quest-rewards">';
          if (q.rewards.money) html += '<span class="quest-reward">💰 $' + q.rewards.money + '</span>';
          if (q.rewards.xp) html += '<span class="quest-reward">⭐ ' + q.rewards.xp + ' XP</span>';
          html += '</div>';
        }
        html += '</div>';
      });
      html += '</div>';
    }

    // ── أسبوعية ──
    var weekly = quests.filter(function (q) { return q.type === 'weekly'; });
    if (weekly.length > 0) {
      html += '<div class="quest-section"><h3>📆 Weekly Quests</h3>';
      weekly.forEach(function (q) {
        var progress = q.progress || 0;
        var target = (q.target && q.target.amount) ? q.target.amount : 1;
        var pct = Math.min(100, Math.round((progress / target) * 100));
        var complete = pct >= 100;

        html += '<div class="quest-card' + (complete ? ' quest-complete' : '') + '">';
        html += '<div class="quest-header">';
        html += '<span class="quest-name">' + (q.descriptionEn || q.description || q.id) + '</span>';
        html += '<span class="quest-progress-badge">' + progress + '/' + target + '</span>';
        html += '</div>';
        html += '<div class="quest-bar"><div class="quest-bar-fill" style="width:' + pct + '%"></div></div>';
        if (q.rewards) {
          html += '<div class="quest-rewards">';
          if (q.rewards.money) html += '<span class="quest-reward">💰 $' + q.rewards.money + '</span>';
          if (q.rewards.xp) html += '<span class="quest-reward">⭐ ' + q.rewards.xp + ' XP</span>';
          html += '</div>';
        }
        html += '</div>';
      });
      html += '</div>';
    }

    // ── قصة ──
    var story = quests.filter(function (q) { return q.type === 'story'; });
    if (story.length > 0) {
      html += '<div class="quest-section"><h3>📖 Story Quests</h3>';
      story.forEach(function (q) {
        var progress = q.progress || 0;
        var target = (q.target && q.target.amount) ? q.target.amount : 1;
        var pct = Math.min(100, Math.round((progress / target) * 100));

        html += '<div class="quest-card">';
        html += '<div class="quest-header">';
        html += '<span class="quest-name">' + (q.descriptionEn || q.description || q.id) + '</span>';
        html += '<span class="quest-progress-badge">' + progress + '/' + target + '</span>';
        html += '</div>';
        html += '<div class="quest-bar"><div class="quest-bar-fill" style="width:' + pct + '%"></div></div>';
        html += '</div>';
      });
      html += '</div>';
    }

    container.textContent = html || '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">No active quests</p>';
  },

  // ═══════════════════════════════════════════
  //  🏆 الإنجازات (Achievements)
  // ═══════════════════════════════════════════
  toggleAchievements: function () {
    this.isOpen.achievements ? this.closeAchievements() : this.openAchievements();
  },

  openAchievements: function () {
    this.closeAll();
    this.isOpen.achievements = true;
    this.updateAchievementsUI();
    this._show('inventory-ui');
    this._switchInvTab('achievements');
    if (this.game && typeof this.game.exitPointerLock === 'function') {
      this.game.exitPointerLock();
    }
  },

  closeAchievements: function () {
    this.isOpen.achievements = false;
    this._hide('inventory-ui');
  },

  updateAchievementsUI: function () {
    var container = document.getElementById('inv-achievements');
    if (!container) return;

    // محاولة الحصول على الإنجازات
    var achievements = {};
    if (GAME.AchievementSystem && typeof GAME.AchievementSystem.getProgress === 'function') {
      achievements = GAME.AchievementSystem.getProgress();
    } else if (GAME.QuestSystem && typeof GAME.QuestSystem.getAchievements === 'function') {
      var list = GAME.QuestSystem.getAchievements();
      if (Array.isArray(list)) {
        list.forEach(function (a) { achievements[a.id] = a; });
      }
    }

    var html = '';
    var categories = { farming: '🌾 Farming', animals: '🐄 Animals', economy: '💰 Economy', social: '💬 Social', exploration: '🗺️ Exploration' };

    for (var cat in categories) {
      var catItems = [];
      for (var id in achievements) {
        var a = achievements[id];
        if (a.category === cat) catItems.push({ id: id, data: a });
      }
      if (catItems.length === 0) continue;

      html += '<div class="achievement-section">';
      html += '<h3>' + categories[cat] + '</h3>';
      catItems.forEach(function (item) {
        var a = item.data;
        var unlocked = a.unlocked || a.earned || false;
        var progress = a.progress || 0;
        var total = a.total || 1;
        var pct = Math.min(100, Math.round((progress / total) * 100));

        html += '<div class="achievement-card' + (unlocked ? ' unlocked' : '') + '">';
        html += '<div class="achievement-icon">' + (a.icon || '🏅') + '</div>';
        html += '<div class="achievement-info">';
        html += '<div class="achievement-name">' + (a.name || item.id) + '</div>';
        html += '<div class="achievement-desc">' + (a.description || '') + '</div>';
        if (!unlocked && total > 1) {
          html += '<div class="achievement-bar"><div class="achievement-bar-fill" style="width:' + pct + '%"></div></div>';
          html += '<span class="achievement-progress-text">' + progress + ' / ' + total + '</span>';
        }
        html += '</div>';
        if (unlocked) html += '<div class="achievement-badge">✅</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    container.textContent = html || '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">No achievements yet — keep farming!</p>';
  },

  // ═══════════════════════════════════════════
  //  ⚙ الإعدادات (Settings)
  // ═══════════════════════════════════════════
  toggleSettings: function () {
    this.isOpen.settings ? this.closeSettings() : this.openSettings();
  },

  openSettings: function () {
    this.closeAll();
    this.isOpen.settings = true;
    this._show('settings-panel');
    if (this.game && typeof this.game.exitPointerLock === 'function') {
      this.game.exitPointerLock();
    }
  },

  closeSettings: function () {
    this.isOpen.settings = false;
    this._hide('settings-panel');
  },

  // ═══════════════════════════════════════════
  //  ⬆ الترقيات (Upgrades)
  // ═══════════════════════════════════════════
  toggleUpgrades: function () {
    this.isOpen.upgrades ? this.closeUpgrades() : this.openUpgrades();
  },

  openUpgrades: function () {
    this.closeAll();
    this.isOpen.upgrades = true;
    this.updateUpgradesUI('buildings');
    this._show('upgrades-overlay');
    if (this.game && typeof this.game.exitPointerLock === 'function') {
      this.game.exitPointerLock();
    }
  },

  closeUpgrades: function () {
    this.isOpen.upgrades = false;
    this._hide('upgrades-overlay');
  },

  updateUpgradesUI: function (category) {
    this._renderUpgradesCategory(category || 'buildings');
  },

  _renderUpgradesCategory: function (category) {
    var grid = document.getElementById('upgrades-grid');
    if (!grid) return;

    if (!GAME.UpgradesSystem) {
      grid.textContent = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">Upgrades system not loaded</p>';
      return;
    }

    var data = GAME.UPGRADES_DATA ? GAME.UPGRADES_DATA[category] : null;
    if (!data) {
      grid.textContent = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">No upgrades in this category</p>';
      return;
    }

    var state = (GAME.state && GAME.state.inventory) ? GAME.state.inventory : {};
    var money = (GAME.state && GAME.state.money !== undefined) ? GAME.state.money : 0;
    var playerLevel = (GAME.state && GAME.state.level !== undefined) ? GAME.state.level : 1;

    var html = '';
    for (var id in data) {
      var upg = data[id];
      var check = GAME.UpgradesSystem.canUpgrade ? GAME.UpgradesSystem.canUpgrade(category, id) : { canUpgrade: false, missing: [] };
      var canBuy = check && check.canUpgrade;
      var isPurchased = check && check.purchased;
      var locked = check && check.missing && check.missing.length > 0;

      // فحص المستوى المطلوب
      var levelOk = !upg.requiredLevel || playerLevel >= upg.requiredLevel;

      html += '<div class="upgrade-card' +
        (isPurchased ? ' purchased' : '') +
        (locked || !levelOk ? ' locked' : '') + '">';
      html += '<div class="upgrade-icon">' + (upg.icon || '⬆️') + '</div>';
      html += '<div class="upgrade-info">';
      html += '<div class="upgrade-name">' + (upg.nameAr || upg.name || id) + '</div>';
      html += '<div class="upgrade-desc">' + (upg.descriptionAr || upg.description || '') + '</div>';

      // التكلفة
      if (upg.cost && !isPurchased) {
        html += '<div class="upgrade-cost">';
        if (upg.cost.money) {
          var hasMoney = money >= upg.cost.money;
          html += '<span class="cost-item ' + (hasMoney ? 'has' : 'missing') + '">💰 $' + upg.cost.money + '</span>';
        }
        if (upg.cost.wood) {
          var hasWood = (state.wood || 0) >= upg.cost.wood;
          html += '<span class="cost-item ' + (hasWood ? 'has' : 'missing') + '">🪵 ' + (state.wood || 0) + '/' + upg.cost.wood + '</span>';
        }
        if (upg.cost.stone) {
          var hasStone = (state.stone || 0) >= upg.cost.stone;
          html += '<span class="cost-item ' + (hasStone ? 'has' : 'missing') + '">🪨 ' + (state.stone || 0) + '/' + upg.cost.stone + '</span>';
        }
        html += '</div>';
      }

      if (upg.requiredLevel && !levelOk) {
        html += '<div class="upgrade-req">🔒 Requires Level ' + upg.requiredLevel + '</div>';
      }
      if (locked && check.missing) {
        html += '<div class="upgrade-req">🔒 Requires: ' + check.missing.join(', ') + '</div>';
      }

      html += '</div>';

      if (isPurchased) {
        html += '<div class="upgrade-status purchased-badge">✅ Owned</div>';
      } else {
        html += '<button class="upgrade-buy-btn" ' + (canBuy && levelOk ? '' : 'disabled') +
          ' onclick="GAME.UIManager.buyUpgrade(\'' + category + '\',\'' + id + '\')">Upgrade</button>';
      }

      html += '</div>';
    }

    grid.textContent = html;
  },

  buyUpgrade: function (category, upgradeId) {
    var result = null;
    if (GAME.UpgradesSystem && typeof GAME.UpgradesSystem.upgrade === 'function') {
      result = GAME.UpgradesSystem.upgrade(category, upgradeId);
    }
    if (result) {
      this._notify('⬆️ Upgrade purchased!');
      this._renderUpgradesCategory(category);
    } else {
      this._notify('❌ Cannot afford upgrade');
    }
  },

  // ═══════════════════════════════════════════
  //  💬 الحوارات (Dialogue)
  // ═══════════════════════════════════════════
  toggleDialogue: function () {
    this.isOpen.dialogue ? this.closeDialogue() : this.openDialogue();
  },

  openDialogue: function (npcId, lines) {
    this.closeAll();
    this.isOpen.dialogue = true;
    this._show('dialogue-overlay');

    var portrait = document.getElementById('dialogue-portrait');
    var nameEl = document.getElementById('dialogue-name');
    var textEl = document.getElementById('dialogue-text');
    var nextBtn = document.getElementById('dialogue-next');

    // بيانات NPC
    var npcData = null;
    if (GAME.NPCsSystem && typeof GAME.NPCsSystem.getNpc === 'function') {
      npcData = GAME.NPCsSystem.getNpc(npcId);
    }

    if (portrait) portrait.textContent = (npcData && npcData.icon) ? npcData.icon : '🧑‍🌾';
    if (nameEl) nameEl.textContent = (npcData && npcData.name) ? npcData.name : (npcId || 'NPC');
    if (textEl) textEl.textContent = '';

    // تخزين السياق
    this._dialogue = {
      npcId: npcId,
      lines: lines || (npcData && npcData.dialogue) || ['Hello there!'],
      current: 0
    };

    this._showDialogueLine();

    // ربط زر التالي
    var self = this;
    if (nextBtn) {
      nextBtn.onclick = function () { self._advanceDialogue(); };
    }

    if (this.game && typeof this.game.exitPointerLock === 'function') {
      this.game.exitPointerLock();
    }
  },

  closeDialogue: function () {
    this.isOpen.dialogue = false;
    this._dialogue = null;
    this._hide('dialogue-overlay');
    if (this.game && typeof this.game.requestPointerLock === 'function') {
      this.game.requestPointerLock();
    }
  },

  _showDialogueLine: function () {
    if (!this._dialogue) return;
    var d = this._dialogue;
    var textEl = document.getElementById('dialogue-text');
    var nextBtn = document.getElementById('dialogue-next');

    if (d.current >= d.lines.length) {
      this.closeDialogue();
      return;
    }

    var line = d.lines[d.current];
    if (typeof line === 'string') {
      if (textEl) textEl.textContent = line;
    } else if (line && line.text) {
      if (textEl) textEl.textContent = line.text;
    }

    if (nextBtn) {
      nextBtn.textContent = (d.current >= d.lines.length - 1) ? '✕' : '▶';
    }
  },

  _advanceDialogue: function () {
    if (!this._dialogue) return;
    this._dialogue.current++;
    if (this._dialogue.current >= this._dialogue.lines.length) {
      this.closeDialogue();
    } else {
      this._showDialogueLine();
    }
  },

  // ═══════════════════════════════════════════
  //  🔔 إشعارات
  // ═══════════════════════════════════════════
  _notify: function (message) {
    if (this.game && typeof this.game.showNotification === 'function') {
      this.game.showNotification(message);
      return;
    }
    // Fallback: NotificationSystem أو notif container
    if (GAME.NotificationSystem && typeof GAME.NotificationSystem.show === 'function') {
      GAME.NotificationSystem.show(message);
      return;
    }
    var container = document.getElementById('notif-container');
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'notification';
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function () { el.remove(); }, 3000);
  },

  // ═══════════════════════════════════════════
  //  🔄 تحديث شامل
  // ═══════════════════════════════════════════
  update: function () {
    if (this.isOpen.shop)        this.updateShopUI();
    if (this.isOpen.inventory)   this.updateInventoryUI();
    if (this.isOpen.crafting)    this.updateCraftingUI();
    if (this.isOpen.quests)      this.updateQuestsUI();
    if (this.isOpen.achievements) this.updateAchievementsUI();
    if (this.isOpen.upgrades)    this.updateUpgradesUI('buildings');
  },

  // ═══════════════════════════════════════════
  //  حفظ/تحميل الحالة
  // ═══════════════════════════════════════════
  saveState: function () {
    return { isOpen: JSON.parse(JSON.stringify(this.isOpen)) };
  },

  loadState: function (saved) {
    if (!saved || !saved.isOpen) return;
    // لا نفتح النوافذ تلقائياً عند التحميل
  }
};
