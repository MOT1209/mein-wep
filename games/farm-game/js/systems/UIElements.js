/**
 * UIElements.js — Generates all HTML overlay UI and wires up events.
 * Must be loaded after UIManager.js.
 */
GAME.UIElements = {
  init: function (game) {
    this.game = game;
    this.createShopUI();
    this.createInventoryUI();
    this.createCraftingUI();
    this.createQuestUI();
    this.createAchievementUI();
    this.createSettingsUI();
    this.createDialogueUI();
    this.createUpgradesUI();
    this.createMapUI();
    this.createChestUI();
    this.createMailboxUI();
    this.createDailyRewardsUI();
    this.createChallengesUI();
    this.createGalleryUI();
    this.createStatsUI();
    this.createNotificationContainer();
    this.createTooltipElement();
    this.setupKeyboardShortcuts();
  },

  /* ─── SHOP ─── */
  createShopUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'shop-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="shop-container">
        <div class="shop-header">
          <h2 class="shop-title">🏪 Shop</h2>
          <button class="shop-close ui-close-btn">✕</button>
        </div>
        <div class="shop-tabs">
          <button class="shop-tab active" data-tab="seeds">🌱 Seeds</button>
          <button class="shop-tab" data-tab="animals">🐔 Animals</button>
          <button class="shop-tab" data-tab="tools">🔧 Tools</button>
          <button class="shop-tab" data-tab="upgrades">⬆️ Upgrades</button>
        </div>
        <div class="shop-content">
          <div class="shop-grid"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.shop-close').addEventListener('click', function () {
      GAME.UIManager.closeShop();
    });

    // Tab switching
    overlay.querySelectorAll('.shop-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        overlay.querySelectorAll('.shop-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        // Populate grid based on tab
        if (GAME.UIManager.populateShop) {
          GAME.UIManager.populateShop(tab.dataset.tab);
        }
      });
    });
  },

  /* ─── INVENTORY ─── */
  createInventoryUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'inventory-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="inventory-container">
        <div class="inventory-header">
          <h2 class="inventory-title">🎒 Inventory</h2>
          <button class="inventory-close ui-close-btn">✕</button>
        </div>
        <div class="inventory-tabs">
          <button class="inventory-tab active" data-tab="all">All</button>
          <button class="inventory-tab" data-tab="seeds">🌱 Seeds</button>
          <button class="inventory-tab" data-tab="crops">🌾 Crops</button>
          <button class="inventory-tab" data-tab="animals">🐔 Animal Products</button>
          <button class="inventory-tab" data-tab="tools">🔧 Tools</button>
        </div>
        <div class="inventory-content">
          <div class="inventory-grid"></div>
          <div class="item-details" style="display:none;"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.inventory-close').addEventListener('click', function () {
      GAME.UIManager.closeInventory();
    });

    overlay.querySelectorAll('.inventory-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        overlay.querySelectorAll('.inventory-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        if (GAME.UIManager.populateInventory) {
          GAME.UIManager.populateInventory(tab.dataset.tab);
        }
      });
    });
  },

  /* ─── CRAFTING ─── */
  createCraftingUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'crafting-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="crafting-container">
        <div class="crafting-header">
          <h2 class="crafting-title">🔨 Crafting</h2>
          <button class="crafting-close ui-close-btn">✕</button>
        </div>
        <div class="crafting-tabs">
          <button class="crafting-tab active" data-tab="food">🍞 Food</button>
          <button class="crafting-tab" data-tab="tools">🔧 Tools</button>
          <button class="crafting-tab" data-tab="buildings">🏠 Buildings</button>
          <button class="crafting-tab" data-tab="gifts">🎁 Gifts</button>
        </div>
        <div class="crafting-content">
          <div class="crafting-grid"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.crafting-close').addEventListener('click', function () {
      GAME.UIManager.closeCrafting();
    });

    overlay.querySelectorAll('.crafting-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        overlay.querySelectorAll('.crafting-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        if (GAME.UIManager.populateCrafting) {
          GAME.UIManager.populateCrafting(tab.dataset.tab);
        }
      });
    });
  },

  /* ─── QUESTS ─── */
  createQuestUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'quests-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="quests-container">
        <div class="quests-header">
          <h2 class="quests-title">📋 Quests</h2>
          <button class="quests-close ui-close-btn">✕</button>
        </div>
        <div class="quests-tabs">
          <button class="quest-tab active" data-tab="daily">Daily</button>
          <button class="quest-tab" data-tab="weekly">Weekly</button>
          <button class="quest-tab" data-tab="story">Story</button>
        </div>
        <div class="quests-content">
          <div class="quests-list"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.quests-close').addEventListener('click', function () {
      GAME.UIManager.closeQuests();
    });

    overlay.querySelectorAll('.quest-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        overlay.querySelectorAll('.quest-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        if (GAME.UIManager.populateQuests) {
          GAME.UIManager.populateQuests(tab.dataset.tab);
        }
      });
    });
  },

  /* ─── ACHIEVEMENTS ─── */
  createAchievementUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'achievements-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="achievements-container">
        <div class="achievements-header">
          <h2 class="achievements-title">🏆 Achievements</h2>
          <button class="achievements-close ui-close-btn">✕</button>
        </div>
        <div class="achievements-progress">
          <div class="achievements-progress-bar">
            <div class="achievements-progress-fill" style="width: 0%"></div>
          </div>
          <span class="achievements-progress-text">0/25</span>
        </div>
        <div class="achievements-tabs">
          <button class="achievement-tab active" data-tab="all">All</button>
          <button class="achievement-tab" data-tab="farming">🌾 Farming</button>
          <button class="achievement-tab" data-tab="animals">🐄 Animals</button>
          <button class="achievement-tab" data-tab="economy">💰 Economy</button>
          <button class="achievement-tab" data-tab="social">❤️ Social</button>
          <button class="achievement-tab" data-tab="exploration">🗺️ Exploration</button>
        </div>
        <div class="achievements-content">
          <div class="achievements-grid"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.achievements-close').addEventListener('click', function () {
      GAME.UIManager.closeAchievements();
    });

    overlay.querySelectorAll('.achievement-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        overlay.querySelectorAll('.achievement-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        if (GAME.UIManager.populateAchievements) {
          GAME.UIManager.populateAchievements(tab.dataset.tab);
        }
      });
    });
  },

  /* ─── SETTINGS ─── */
  createSettingsUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'settings-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="settings-container">
        <div class="settings-header">
          <h2 class="settings-title">⚙️ Settings</h2>
          <button class="settings-close ui-close-btn">✕</button>
        </div>
        <div class="settings-content">
          <div class="settings-section">
            <h3 class="settings-section-title">🔊 Audio</h3>
            <div class="settings-option">
              <span class="settings-option-label">Music Volume</span>
              <input type="range" class="settings-slider" min="0" max="100" value="50">
            </div>
            <div class="settings-option">
              <span class="settings-option-label">SFX Volume</span>
              <input type="range" class="settings-slider" min="0" max="100" value="50">
            </div>
          </div>
          <div class="settings-section">
            <h3 class="settings-section-title">🖥️ Graphics</h3>
            <div class="settings-option">
              <span class="settings-option-label">Quality</span>
              <select class="settings-select">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="potato">Potato</option>
              </select>
            </div>
          </div>
          <div class="settings-section">
            <h3 class="settings-section-title">🎮 Controls</h3>
            <div class="settings-option">
              <span class="settings-option-label">Touch Controls</span>
              <div class="settings-toggle active"></div>
            </div>
          </div>
          <button class="settings-btn danger">Reset Progress</button>
          <div class="settings-version">Farm Game v2.5.0</div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.settings-close').addEventListener('click', function () {
      GAME.UIManager.closeSettings();
    });
  },

  /* ─── DIALOGUE ─── */
  createDialogueUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'dialogue-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="dialogue-container">
        <div class="dialogue-header">
          <div class="dialogue-npc-image">👨‍🌾</div>
          <div class="dialogue-npc-info">
            <div class="dialogue-npc-name">Villager</div>
            <div class="dialogue-npc-title">Local Farmer</div>
          </div>
          <div class="dialogue-friendship">
            <span class="dialogue-heart">❤️</span>
            <span class="dialogue-friendship-level">Level 1</span>
          </div>
        </div>
        <div class="dialogue-text">Hello there! Welcome to our village!</div>
        <div class="dialogue-choices">
          <button class="dialogue-choice">👋 Talk</button>
          <button class="dialogue-choice gift">🎁 Give Gift</button>
          <button class="dialogue-choice shop">🏪 Open Shop</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  },

  /* ─── UPGRADES ─── */
  createUpgradesUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'upgrades-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="upgrades-container">
        <div class="upgrades-header">
          <h2 class="upgrades-title">⬆️ Upgrades</h2>
          <button class="upgrades-close ui-close-btn">✕</button>
        </div>
        <div class="upgrades-tabs">
          <button class="upgrade-tab active" data-tab="buildings">🏠 Buildings</button>
          <button class="upgrade-tab" data-tab="tools">🔧 Tools</button>
          <button class="upgrade-tab" data-tab="animals">🐔 Animals</button>
        </div>
        <div class="upgrades-content">
          <div class="upgrades-grid"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.upgrades-close').addEventListener('click', function () {
      GAME.UIManager.closeUpgrades();
    });
  },

  /* ─── MAP ─── */
  createMapUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'map-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="map-container">
        <div class="map-header">
          <h2 class="map-title">🗺️ World Map</h2>
          <button class="map-close ui-close-btn">✕</button>
        </div>
        <div class="map-content">
          <div class="map-canvas">
            <div class="map-zone" data-zone="farm" style="left:40%;top:40%;width:20%;height:20%;">
              <div class="map-zone-icon">🏠</div>
              <div class="map-zone-name">Farm</div>
            </div>
            <div class="map-zone" data-zone="village" style="left:65%;top:30%;width:15%;height:15%;">
              <div class="map-zone-icon">🏘️</div>
              <div class="map-zone-name">Village</div>
            </div>
            <div class="map-zone" data-zone="forest" style="left:20%;top:20%;width:18%;height:18%;">
              <div class="map-zone-icon">🌲</div>
              <div class="map-zone-name">Forest</div>
            </div>
            <div class="map-zone" data-zone="mine" style="left:75%;top:60%;width:15%;height:15%;">
              <div class="map-zone-icon">⛏️</div>
              <div class="map-zone-name">Mine</div>
            </div>
            <div class="map-zone" data-zone="beach" style="left:10%;top:65%;width:20%;height:18%;">
              <div class="map-zone-icon">🏖️</div>
              <div class="map-zone-name">Beach</div>
            </div>
            <div class="map-zone" data-zone="mountain" style="left:50%;top:10%;width:18%;height:15%;">
              <div class="map-zone-icon">⛰️</div>
              <div class="map-zone-name">Mountain</div>
            </div>
            <div class="map-zone-player" style="left:50%;top:50%;"></div>
          </div>
          <button class="map-travel-btn">✈️ Travel to Selected Zone</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.map-close').addEventListener('click', function () {
      GAME.UIManager.closeMap();
    });
  },

  /* ─── CHEST ─── */
  createChestUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'chest-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="chest-container">
        <div class="chest-header">
          <h2 class="chest-title">📦 Chest</h2>
          <button class="chest-close ui-close-btn">✕</button>
        </div>
        <div class="chest-content">
          <div class="chest-slots"></div>
          <div class="chest-actions">
            <button class="chest-action-btn deposit">📥 Deposit</button>
            <button class="chest-action-btn withdraw">📤 Withdraw</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.chest-close').addEventListener('click', function () {
      GAME.UIManager.closeChest();
    });
  },

  /* ─── MAILBOX ─── */
  createMailboxUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'mailbox-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="mailbox-container">
        <div class="mailbox-header">
          <h2 class="mailbox-title">📬 Mailbox</h2>
          <button class="mailbox-close ui-close-btn">✕</button>
        </div>
        <div class="mailbox-content">
          <div class="mailbox-list"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.mailbox-close').addEventListener('click', function () {
      GAME.UIManager.closeMailbox();
    });
  },

  /* ─── DAILY REWARDS ─── */
  createDailyRewardsUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'daily-rewards-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="daily-rewards-container">
        <div class="daily-rewards-header">
          <div class="daily-rewards-icon">🎁</div>
          <h2 class="daily-rewards-title">Daily Rewards</h2>
          <p class="daily-rewards-subtitle">Claim your daily bonus!</p>
        </div>
        <div class="daily-rewards-grid">
          <div class="daily-reward-day"><div class="daily-reward-day-number">Day 1</div><div class="daily-reward-day-icon">💰</div><div class="daily-reward-day-amount">100</div></div>
          <div class="daily-reward-day"><div class="daily-reward-day-number">Day 2</div><div class="daily-reward-day-icon">🌱</div><div class="daily-reward-day-amount">5 Seeds</div></div>
          <div class="daily-reward-day"><div class="daily-reward-day-number">Day 3</div><div class="daily-reward-day-icon">💰</div><div class="daily-reward-day-amount">200</div></div>
          <div class="daily-reward-day"><div class="daily-reward-day-number">Day 4</div><div class="daily-reward-day-icon">🐔</div><div class="daily-reward-day-amount">1 Chicken</div></div>
          <div class="daily-reward-day"><div class="daily-reward-day-number">Day 5</div><div class="daily-reward-day-icon">💰</div><div class="daily-reward-day-amount">500</div></div>
          <div class="daily-reward-day"><div class="daily-reward-day-number">Day 6</div><div class="daily-reward-day-icon">🎁</div><div class="daily-reward-day-amount">Mystery Box</div></div>
          <div class="daily-reward-day"><div class="daily-reward-day-number">Day 7</div><div class="daily-reward-day-icon">👑</div><div class="daily-reward-day-amount">Legendary!</div></div>
        </div>
        <button class="daily-rewards-claim">Claim Reward</button>
        <button class="daily-rewards-close">Maybe Later</button>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.daily-rewards-close').addEventListener('click', function () {
      overlay.style.display = 'none';
    });
  },

  /* ─── CHALLENGES ─── */
  createChallengesUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'challenges-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="challenges-container">
        <div class="challenges-header">
          <h2 class="challenges-title">🎯 Challenges</h2>
          <button class="challenges-close ui-close-btn">✕</button>
        </div>
        <div class="challenges-tabs">
          <button class="challenge-tab active" data-tab="daily">Daily</button>
          <button class="challenge-tab" data-tab="weekly">Weekly</button>
          <button class="challenge-tab" data-tab="special">Special</button>
        </div>
        <div class="challenges-content">
          <div class="challenges-list"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.challenges-close').addEventListener('click', function () {
      overlay.style.display = 'none';
    });
  },

  /* ─── GALLERY ─── */
  createGalleryUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'gallery-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="gallery-container">
        <div class="gallery-header">
          <h2 class="gallery-title">🖼️ Gallery</h2>
          <button class="gallery-close ui-close-btn">✕</button>
        </div>
        <div class="gallery-tabs">
          <button class="gallery-tab active" data-tab="achievements">🏆 Achievements</button>
          <button class="gallery-tab" data-tab="fish">🐟 Fish</button>
          <button class="gallery-tab" data-tab="crops">🌾 Crops</button>
        </div>
        <div class="gallery-content">
          <div class="gallery-grid"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.gallery-close').addEventListener('click', function () {
      overlay.style.display = 'none';
    });
  },

  /* ─── STATS ─── */
  createStatsUI: function () {
    var overlay = document.createElement('div');
    overlay.className = 'stats-overlay ui-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="stats-container">
        <div class="stats-header">
          <h2 class="stats-title">📊 Statistics</h2>
          <button class="stats-close ui-close-btn">✕</button>
        </div>
        <div class="stats-content">
          <div class="stats-section">
            <h3 class="stats-section-title">🌾 Farming</h3>
            <div class="stats-grid">
              <div class="stat-card"><div class="stat-card-icon">🌱</div><div class="stat-card-value">0</div><div class="stat-card-label">Seeds Planted</div></div>
              <div class="stat-card"><div class="stat-card-icon">🌾</div><div class="stat-card-value">0</div><div class="stat-card-label">Crops Harvested</div></div>
            </div>
          </div>
          <div class="stats-section">
            <h3 class="stats-section-title">💰 Economy</h3>
            <div class="stats-grid">
              <div class="stat-card"><div class="stat-card-icon">💵</div><div class="stat-card-value">0</div><div class="stat-card-label">Money Earned</div></div>
              <div class="stat-card"><div class="stat-card-icon">🛒</div><div class="stat-card-value">0</div><div class="stat-card-label">Items Sold</div></div>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.stats-close').addEventListener('click', function () {
      overlay.style.display = 'none';
    });
  },

  /* ─── NOTIFICATION CONTAINER ─── */
  createNotificationContainer: function () {
    if (document.getElementById('notification-container')) return;
    var container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  },

  /* ─── TOOLTIP ─── */
  createTooltipElement: function () {
    if (document.getElementById('game-tooltip')) return;
    var tip = document.createElement('div');
    tip.id = 'game-tooltip';
    tip.style.cssText = 'position:fixed;display:none;z-index:10001;pointer-events:none;';
    document.body.appendChild(tip);
  },

  /* ─── KEYBOARD SHORTCUTS ─── */
  setupKeyboardShortcuts: function () {
    var self = this;
    document.addEventListener('keydown', function (e) {
      // Don't fire when typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      switch (e.code) {
        case 'KeyB': // Shop
          self.toggleShop();
          e.preventDefault();
          break;
        case 'KeyI': // Inventory
          self.toggleInventory();
          e.preventDefault();
          break;
        case 'KeyC': // Crafting
          self.toggleCrafting();
          e.preventDefault();
          break;
        case 'KeyM': // Map
          self.toggleMap();
          e.preventDefault();
          break;
        case 'Escape': // Close all
          GAME.UIManager.closeAll();
          e.preventDefault();
          break;
      }
    });
  },

  /* ─── TOGGLE HELPERS ─── */
  toggleShop: function () {
    if (GAME.UIManager.isOpen.shop) {
      GAME.UIManager.closeShop();
    } else {
      GAME.UIManager.openShop();
    }
  },

  toggleInventory: function () {
    if (GAME.UIManager.isOpen.inventory) {
      GAME.UIManager.closeInventory();
    } else {
      GAME.UIManager.openInventory();
    }
  },

  toggleCrafting: function () {
    if (GAME.UIManager.isOpen.crafting) {
      GAME.UIManager.closeCrafting();
    } else {
      GAME.UIManager.openCrafting();
    }
  },

  toggleMap: function () {
    if (GAME.UIManager.isOpen.map) {
      GAME.UIManager.closeMap();
    } else {
      GAME.UIManager.openMap();
    }
  }
};
