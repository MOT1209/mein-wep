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

    var self = this;
    shopBody.textContent = '';

    // بناء صف عنصر متجر واحد كعناصر DOM حقيقية (بدون innerHTML)
    function buildShopItem(icon, name, qtyText, priceText, btnClass, btnLabel, onClick) {
      var row = document.createElement('div');
      row.className = 'shop-item';

      if (icon !== null) {
        var iconEl = document.createElement('span');
        iconEl.className = 'item-icon';
        iconEl.textContent = icon;
        row.appendChild(iconEl);
      }

      var nameEl = document.createElement('span');
      nameEl.className = 'item-name';
      nameEl.textContent = name;
      row.appendChild(nameEl);

      if (qtyText !== null) {
        var qtyEl = document.createElement('span');
        qtyEl.className = 'item-qty';
        qtyEl.textContent = qtyText;
        row.appendChild(qtyEl);
      }

      var priceEl = document.createElement('span');
      priceEl.className = 'item-price';
      priceEl.textContent = priceText;
      row.appendChild(priceEl);

      var btn = document.createElement('button');
      btn.className = btnClass;
      btn.textContent = btnLabel;
      btn.addEventListener('click', onClick);
      row.appendChild(btn);

      return row;
    }

    // ── Seeds ──
    var seedsSection = document.createElement('div');
    seedsSection.className = 'shop-section';
    var seedsHeader = document.createElement('h3');
    seedsHeader.textContent = '🌱 Seeds';
    seedsSection.appendChild(seedsHeader);

    seeds.forEach(function (item) {
      var itemId = item.id || item.key;
      seedsSection.appendChild(buildShopItem(
        item.icon || '🌱',
        item.name || item.id,
        null,
        '$' + (item.price || 0),
        'shop-buy-btn',
        'Buy',
        function () { self.buySeed(itemId); }
      ));
    });
    shopBody.appendChild(seedsSection);

    // ── Animals ──
    var animalsSection = document.createElement('div');
    animalsSection.className = 'shop-section';
    var animalsHeader = document.createElement('h3');
    animalsHeader.textContent = '🐑 Animals';
    animalsSection.appendChild(animalsHeader);

    var animals = [
      { icon: '🐔', name: 'Chicken', price: 50, type: 'chicken' },
      { icon: '🐄', name: 'Cow', price: 200, type: 'cow' },
      { icon: '🐑', name: 'Sheep', price: 150, type: 'sheep' }
    ];
    animals.forEach(function (animal) {
      animalsSection.appendChild(buildShopItem(
        animal.icon,
        animal.name,
        null,
        '$' + animal.price,
        'shop-buy-btn',
        'Buy',
        function () { self.buyAnimal(animal.type); }
      ));
    });
    shopBody.appendChild(animalsSection);

    // ── Sell ──
    var sellSection = document.createElement('div');
    sellSection.className = 'shop-section';
    var sellHeader = document.createElement('h3');
    sellHeader.textContent = '💰 Sell Produce';
    sellSection.appendChild(sellHeader);

    var sellItems = ['wheat', 'tomato', 'carrot', 'apple'];
    sellItems.forEach(function (id) {
      var qty = (GAME.state && GAME.state.inventory) ? (GAME.state.inventory[id] || 0) : 0;
      if (qty > 0) {
        var price = GAME.EconomySystem.sellPrice ? GAME.EconomySystem.sellPrice(id) : 25;
        sellSection.appendChild(buildShopItem(
          null,
          id,
          'x' + qty,
          '$' + price + ' / ea',
          'shop-sell-btn',
          'Sell All',
          function () { self.sellItem(id); }
        ));
      }
    });
    shopBody.appendChild(sellSection);
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
    // كل عنصر مصدره جزء مختلف من inventory: المحاصيل من harvest، الأسمدة كائن فرعي
    // بثلاثة أنواع (يُجمع لرقم واحد)، والمصنَّع/منتجات الحيوانات من crafted/animal
    var items = [
      { key: 'wheat',      path: 'harvest',    icon: '🌾', name: 'Wheat' },
      { key: 'tomato',     path: 'harvest',    icon: '🍅', name: 'Tomato' },
      { key: 'carrot',     path: 'harvest',    icon: '🥕', name: 'Carrot' },
      { key: 'apple',      path: 'harvest',    icon: '🍎', name: 'Apple' },
      { key: 'corn',       path: 'harvest',    icon: '🌽', name: 'Corn' },
      { key: 'potato',     path: 'harvest',    icon: '🥔', name: 'Potato' },
      { key: 'strawberry', path: 'harvest',    icon: '🍓', name: 'Strawberry' },
      { key: 'fertilizer', path: 'fertilizer', icon: '🧪', name: 'Fertilizer', sum: true },
      { key: 'bread',      path: 'crafted',    icon: '🍞', name: 'Bread' },
      { key: 'ketchup',    path: 'crafted',    icon: '🥫', name: 'Ketchup' },
      { key: 'juice',      path: 'crafted',    icon: '🧃', name: 'Carrot Juice' },
      { key: 'cheese',     path: 'crafted',    icon: '🧀', name: 'Cheese' },
      { key: 'milk',       path: 'animal',     icon: '🥛', name: 'Milk' },
      { key: 'egg',        path: 'animal',     icon: '🥚', name: 'Egg' },
      { key: 'wool',       path: 'animal',     icon: '🧶', name: 'Wool' }
    ];

    var self = this;
    items.forEach(function (item) {
      var el = document.getElementById('inv-' + item.key);
      if (!el) return;
      var group = inv[item.path] || {};
      var value;
      if (item.sum) {
        value = 0;
        for (var subKey in group) { value += group[subKey] || 0; }
      } else {
        value = group[item.key] || 0;
      }
      el.textContent = value;
    });

    // تحديث واجهة المخزون الديناميكية (إذا وُجد grid)
    var grid = document.querySelector('.inventory-grid');
    if (grid) {
      grid.textContent = '';
      var hasItems = false;
      items.forEach(function (item) {
        var itemGroup = inv[item.path] || {};
        var qty = item.sum
          ? Object.keys(itemGroup).reduce(function (sum, k) { return sum + (itemGroup[k] || 0); }, 0)
          : (itemGroup[item.key] || 0);
        if (qty > 0) {
          hasItems = true;
          var itemEl = document.createElement('div');
          itemEl.className = 'inv-item';
          itemEl.dataset.id = item.key;

          var iconEl = document.createElement('div');
          iconEl.className = 'inv-item-icon';
          iconEl.textContent = item.icon;
          itemEl.appendChild(iconEl);

          var countEl = document.createElement('div');
          countEl.className = 'inv-item-count';
          countEl.textContent = qty;
          itemEl.appendChild(countEl);

          var nameEl = document.createElement('div');
          nameEl.className = 'inv-item-name';
          nameEl.textContent = item.name;
          itemEl.appendChild(nameEl);

          grid.appendChild(itemEl);
        }
      });
      if (!hasItems) {
        var emptyEl = document.createElement('p');
        emptyEl.className = 'inv-empty';
        emptyEl.textContent = 'Inventory is empty';
        grid.appendChild(emptyEl);
      }
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

      var self = this;
      container.textContent = '';
      var hasRecipes = false;

      for (var id in recipes) {
        hasRecipes = true;
        var r = recipes[id];
        var check = GAME.CraftingSystem.canCraft(id);
        var canCraft = check && check.canCraft;

        var recipeEl = document.createElement('div');
        recipeEl.className = 'craft-recipe' + (canCraft ? '' : ' craft-locked');
        recipeEl.dataset.recipe = id;

        var infoEl = document.createElement('div');
        infoEl.className = 'craft-info';

        var iconEl = document.createElement('span');
        iconEl.className = 'craft-icon';
        iconEl.textContent = r.icon || '🔨';
        infoEl.appendChild(iconEl);

        var nameEl = document.createElement('span');
        nameEl.className = 'craft-name';
        nameEl.textContent = r.name || id;
        infoEl.appendChild(nameEl);

        // المكونات
        var inputs = r.inputs || {};
        var costEl = document.createElement('div');
        costEl.className = 'craft-cost';
        for (var ing in inputs) {
          var have = inv[ing] || 0;
          var need = inputs[ing];
          var ok = have >= need;
          var ingEl = document.createElement('span');
          ingEl.className = 'craft-ingredient ' + (ok ? 'has' : 'missing');
          ingEl.textContent = ing + ' ' + have + '/' + need;
          costEl.appendChild(ingEl);
          costEl.appendChild(document.createTextNode(' '));
        }
        infoEl.appendChild(costEl);

        var resultEl = document.createElement('span');
        resultEl.className = 'craft-result';
        resultEl.textContent = '→ ' + (r.quantity || 1) + ' ' + (r.name || id);
        infoEl.appendChild(resultEl);

        recipeEl.appendChild(infoEl);

        var btn = document.createElement('button');
        btn.className = 'craft-btn';
        btn.disabled = !canCraft;
        btn.textContent = 'Craft';
        (function (recipeId) {
          btn.addEventListener('click', function () { self.doCraft(recipeId); });
        })(id);
        recipeEl.appendChild(btn);

        container.appendChild(recipeEl);
      }

      if (!hasRecipes) {
        var emptyEl = document.createElement('p');
        emptyEl.style.color = 'rgba(255,255,255,0.5)';
        emptyEl.style.textAlign = 'center';
        emptyEl.style.padding = '20px';
        emptyEl.textContent = 'No recipes available';
        container.appendChild(emptyEl);
      }
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

    container.textContent = '';

    if (!GAME.QuestSystem) {
      var noSysEl = document.createElement('p');
      noSysEl.style.color = 'rgba(255,255,255,0.5)';
      noSysEl.style.textAlign = 'center';
      noSysEl.style.padding = '20px';
      noSysEl.textContent = 'Quest system not loaded';
      container.appendChild(noSysEl);
      return;
    }

    var quests = typeof GAME.QuestSystem.getActiveQuests === 'function'
      ? GAME.QuestSystem.getActiveQuests()
      : (GAME.QuestSystem.activeQuests || []);

    function buildQuestCard(q, withComplete, withRewards) {
      var progress = q.progress || 0;
      var target = (q.target && q.target.amount) ? q.target.amount : 1;
      var pct = Math.min(100, Math.round((progress / target) * 100));
      var complete = pct >= 100;

      var card = document.createElement('div');
      card.className = 'quest-card' + (withComplete && complete ? ' quest-complete' : '');

      var header = document.createElement('div');
      header.className = 'quest-header';

      var nameEl = document.createElement('span');
      nameEl.className = 'quest-name';
      nameEl.textContent = q.descriptionEn || q.description || q.id;
      header.appendChild(nameEl);

      var badgeEl = document.createElement('span');
      badgeEl.className = 'quest-progress-badge';
      badgeEl.textContent = progress + '/' + target;
      header.appendChild(badgeEl);

      card.appendChild(header);

      var bar = document.createElement('div');
      bar.className = 'quest-bar';
      var barFill = document.createElement('div');
      barFill.className = 'quest-bar-fill';
      barFill.style.width = pct + '%';
      bar.appendChild(barFill);
      card.appendChild(bar);

      if (withRewards && q.rewards) {
        var rewardsEl = document.createElement('div');
        rewardsEl.className = 'quest-rewards';
        if (q.rewards.money) {
          var moneyEl = document.createElement('span');
          moneyEl.className = 'quest-reward';
          moneyEl.textContent = '💰 $' + q.rewards.money;
          rewardsEl.appendChild(moneyEl);
        }
        if (q.rewards.xp) {
          var xpEl = document.createElement('span');
          xpEl.className = 'quest-reward';
          xpEl.textContent = '⭐ ' + q.rewards.xp + ' XP';
          rewardsEl.appendChild(xpEl);
        }
        card.appendChild(rewardsEl);
      }

      return card;
    }

    function buildSection(title, list, withComplete, withRewards) {
      if (list.length === 0) return null;
      var section = document.createElement('div');
      section.className = 'quest-section';
      var h3 = document.createElement('h3');
      h3.textContent = title;
      section.appendChild(h3);
      list.forEach(function (q) {
        section.appendChild(buildQuestCard(q, withComplete, withRewards));
      });
      return section;
    }

    // ── يومية ──
    var daily = quests.filter(function (q) { return q.type === 'daily'; });
    // ── أسبوعية ──
    var weekly = quests.filter(function (q) { return q.type === 'weekly'; });
    // ── قصة ──
    var story = quests.filter(function (q) { return q.type === 'story'; });

    var dailySection = buildSection('📅 Daily Quests', daily, true, true);
    var weeklySection = buildSection('📆 Weekly Quests', weekly, true, true);
    var storySection = buildSection('📖 Story Quests', story, false, false);

    var hasAny = false;
    [dailySection, weeklySection, storySection].forEach(function (sec) {
      if (sec) { container.appendChild(sec); hasAny = true; }
    });

    if (!hasAny) {
      var emptyEl = document.createElement('p');
      emptyEl.style.color = 'rgba(255,255,255,0.5)';
      emptyEl.style.textAlign = 'center';
      emptyEl.style.padding = '20px';
      emptyEl.textContent = 'No active quests';
      container.appendChild(emptyEl);
    }
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

    container.textContent = '';
    var categories = { farming: '🌾 Farming', animals: '🐄 Animals', economy: '💰 Economy', social: '💬 Social', exploration: '🗺️ Exploration' };
    var hasAny = false;

    for (var cat in categories) {
      var catItems = [];
      for (var id in achievements) {
        var a = achievements[id];
        if (a.category === cat) catItems.push({ id: id, data: a });
      }
      if (catItems.length === 0) continue;
      hasAny = true;

      var section = document.createElement('div');
      section.className = 'achievement-section';
      var h3 = document.createElement('h3');
      h3.textContent = categories[cat];
      section.appendChild(h3);

      catItems.forEach(function (item) {
        var a = item.data;
        var unlocked = a.unlocked || a.earned || false;
        var progress = a.progress || 0;
        var total = a.total || 1;
        var pct = Math.min(100, Math.round((progress / total) * 100));

        var card = document.createElement('div');
        card.className = 'achievement-card' + (unlocked ? ' unlocked' : '');

        var iconEl = document.createElement('div');
        iconEl.className = 'achievement-icon';
        iconEl.textContent = a.icon || '🏅';
        card.appendChild(iconEl);

        var infoEl = document.createElement('div');
        infoEl.className = 'achievement-info';

        var nameEl = document.createElement('div');
        nameEl.className = 'achievement-name';
        nameEl.textContent = a.name || item.id;
        infoEl.appendChild(nameEl);

        var descEl = document.createElement('div');
        descEl.className = 'achievement-desc';
        descEl.textContent = a.description || '';
        infoEl.appendChild(descEl);

        if (!unlocked && total > 1) {
          var barEl = document.createElement('div');
          barEl.className = 'achievement-bar';
          var barFillEl = document.createElement('div');
          barFillEl.className = 'achievement-bar-fill';
          barFillEl.style.width = pct + '%';
          barEl.appendChild(barFillEl);
          infoEl.appendChild(barEl);

          var progTextEl = document.createElement('span');
          progTextEl.className = 'achievement-progress-text';
          progTextEl.textContent = progress + ' / ' + total;
          infoEl.appendChild(progTextEl);
        }

        card.appendChild(infoEl);

        if (unlocked) {
          var badgeEl = document.createElement('div');
          badgeEl.className = 'achievement-badge';
          badgeEl.textContent = '✅';
          card.appendChild(badgeEl);
        }

        section.appendChild(card);
      });

      container.appendChild(section);
    }

    if (!hasAny) {
      var emptyEl = document.createElement('p');
      emptyEl.style.color = 'rgba(255,255,255,0.5)';
      emptyEl.style.textAlign = 'center';
      emptyEl.style.padding = '20px';
      emptyEl.textContent = 'No achievements yet — keep farming!';
      container.appendChild(emptyEl);
    }
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

    function showMessage(text) {
      grid.textContent = '';
      var msgEl = document.createElement('p');
      msgEl.style.color = 'rgba(255,255,255,0.5)';
      msgEl.style.textAlign = 'center';
      msgEl.style.padding = '20px';
      msgEl.textContent = text;
      grid.appendChild(msgEl);
    }

    if (!GAME.UpgradesSystem) {
      showMessage('Upgrades system not loaded');
      return;
    }

    var data = GAME.UPGRADES_DATA ? GAME.UPGRADES_DATA[category] : null;
    if (!data) {
      showMessage('No upgrades in this category');
      return;
    }

    var state = (GAME.state && GAME.state.inventory) ? GAME.state.inventory : {};
    var money = (GAME.state && GAME.state.money !== undefined) ? GAME.state.money : 0;
    var playerLevel = (GAME.state && GAME.state.level !== undefined) ? GAME.state.level : 1;

    var self = this;
    grid.textContent = '';

    for (var id in data) {
      var upg = data[id];
      var check = GAME.UpgradesSystem.canUpgrade ? GAME.UpgradesSystem.canUpgrade(category, id) : { canUpgrade: false, missing: [] };
      var canBuy = check && check.canUpgrade;
      var isPurchased = check && check.purchased;
      var locked = check && check.missing && check.missing.length > 0;

      // فحص المستوى المطلوب
      var levelOk = !upg.requiredLevel || playerLevel >= upg.requiredLevel;

      var card = document.createElement('div');
      card.className = 'upgrade-card' +
        (isPurchased ? ' purchased' : '') +
        (locked || !levelOk ? ' locked' : '');

      var iconEl = document.createElement('div');
      iconEl.className = 'upgrade-icon';
      iconEl.textContent = upg.icon || '⬆️';
      card.appendChild(iconEl);

      var infoEl = document.createElement('div');
      infoEl.className = 'upgrade-info';

      var nameEl = document.createElement('div');
      nameEl.className = 'upgrade-name';
      nameEl.textContent = upg.nameAr || upg.name || id;
      infoEl.appendChild(nameEl);

      var descEl = document.createElement('div');
      descEl.className = 'upgrade-desc';
      descEl.textContent = upg.descriptionAr || upg.description || '';
      infoEl.appendChild(descEl);

      // التكلفة
      if (upg.cost && !isPurchased) {
        var costEl = document.createElement('div');
        costEl.className = 'upgrade-cost';
        if (upg.cost.money) {
          var hasMoney = money >= upg.cost.money;
          var moneyEl = document.createElement('span');
          moneyEl.className = 'cost-item ' + (hasMoney ? 'has' : 'missing');
          moneyEl.textContent = '💰 $' + upg.cost.money;
          costEl.appendChild(moneyEl);
        }
        if (upg.cost.wood) {
          var hasWood = (state.wood || 0) >= upg.cost.wood;
          var woodEl = document.createElement('span');
          woodEl.className = 'cost-item ' + (hasWood ? 'has' : 'missing');
          woodEl.textContent = '🪵 ' + (state.wood || 0) + '/' + upg.cost.wood;
          costEl.appendChild(woodEl);
        }
        if (upg.cost.stone) {
          var hasStone = (state.stone || 0) >= upg.cost.stone;
          var stoneEl = document.createElement('span');
          stoneEl.className = 'cost-item ' + (hasStone ? 'has' : 'missing');
          stoneEl.textContent = '🪨 ' + (state.stone || 0) + '/' + upg.cost.stone;
          costEl.appendChild(stoneEl);
        }
        infoEl.appendChild(costEl);
      }

      if (upg.requiredLevel && !levelOk) {
        var reqLevelEl = document.createElement('div');
        reqLevelEl.className = 'upgrade-req';
        reqLevelEl.textContent = '🔒 Requires Level ' + upg.requiredLevel;
        infoEl.appendChild(reqLevelEl);
      }
      if (locked && check.missing) {
        var reqMissingEl = document.createElement('div');
        reqMissingEl.className = 'upgrade-req';
        reqMissingEl.textContent = '🔒 Requires: ' + check.missing.join(', ');
        infoEl.appendChild(reqMissingEl);
      }

      card.appendChild(infoEl);

      if (isPurchased) {
        var statusEl = document.createElement('div');
        statusEl.className = 'upgrade-status purchased-badge';
        statusEl.textContent = '✅ Owned';
        card.appendChild(statusEl);
      } else {
        var btn = document.createElement('button');
        btn.className = 'upgrade-buy-btn';
        btn.disabled = !(canBuy && levelOk);
        btn.textContent = 'Upgrade';
        (function (cat, upgradeId) {
          btn.addEventListener('click', function () { self.buyUpgrade(cat, upgradeId); });
        })(category, id);
        card.appendChild(btn);
      }

      grid.appendChild(card);
    }
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
