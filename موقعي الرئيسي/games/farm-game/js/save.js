// Farm Game — Save & Load System
var GAME = GAME || {};
GAME.game = GAME.game || {};

GAME.game.loadGame = function() {
  try {
    // محاولة التحميل عبر EnhancedSaveSystem أولاً
    if (GAME.EnhancedSaveSystem && GAME.EnhancedSaveSystem._initialized) {
      var restored = GAME.EnhancedSaveSystem.tryRestoreLastSession();
      if (restored) {
        GAME.ui.showNotification('🌾 Welcome back, farmer! (Enhanced Save)', 'success');
        return;
      }
    }
    // fallback: التحميل القديم
    var saved = localStorage.getItem('farmGameSave');
    if (saved) {
      var data = JSON.parse(saved);
      this.state.health = (typeof data.health === 'number') ? data.health : 100;
      this.state.energy = (typeof data.energy === 'number') ? data.energy : 100;
      this.state.money = (typeof data.money === 'number') ? data.money : 200;
      this.state.day = (typeof data.day === 'number') ? data.day : 1;
      this.state.time = (typeof data.time === 'number') ? data.time : 6;
      this.state.inventory = (data.inventory && typeof data.inventory === 'object') ?
        { wheat: data.inventory.wheat || 0, tomato: data.inventory.tomato || 0, carrot: data.inventory.carrot || 0, apple: data.inventory.apple || 0, fertilizer: data.inventory.fertilizer || 0 } :
        { wheat: 0, tomato: 0, carrot: 0, apple: 0, fertilizer: 0 };
      this.state.crafted = (data.crafted && typeof data.crafted === 'object') ?
        { bread: data.crafted.bread || 0, ketchup: data.crafted.ketchup || 0, juice: data.crafted.juice || 0 } :
        { bread: 0, ketchup: 0, juice: 0 };
      this.state.xp = (typeof data.xp === 'number') ? data.xp : 0;
      this.state.level = (typeof data.level === 'number') ? data.level : 1;
      this.state.selectedTool = (typeof data.selectedTool === 'number') ? data.selectedTool : 0;
      this.state.achievements = (data.achievements && Array.isArray(data.achievements)) ? data.achievements : [];
      this.state.stats = (data.stats && typeof data.stats === 'object') ?
        { totalPlanted: data.stats.totalPlanted || 0, totalHarvested: data.stats.totalHarvested || 0,
          totalEarned: data.stats.totalEarned || 0, totalCrafted: data.stats.totalCrafted || 0,
          totalWatered: data.stats.totalWatered || 0, totalFertilized: data.stats.totalFertilized || 0,
          totalSlept: data.stats.totalSlept || 0, totalAnimals: data.stats.totalAnimals || 0, totalApples: data.stats.totalApples || 0 } :
        { totalPlanted: 0, totalHarvested: 0, totalEarned: 0, totalCrafted: 0,
          totalWatered: 0, totalFertilized: 0, totalSlept: 0, totalAnimals: 0, totalApples: 0 };
      GAME.game.selectTool(this.state.selectedTool);
      this._atMenu = false;
      GAME.ui.hideMenu();
      GAME.ui.showNotification('\uD83C\uDF3E Welcome back, farmer!', 'success');
    } else {
      this.startNew();
    }
  } catch (e) {
    console.warn('Save corrupted, starting new game');
    this.startNew();
  }
};

GAME.game.saveGame = function() {
  if (!this.state) return;
  // محاولة الحفظ عبر EnhancedSaveSystem أولاً
  if (GAME.EnhancedSaveSystem && GAME.EnhancedSaveSystem._initialized) {
    var success = GAME.EnhancedSaveSystem.save();
    if (success) {
      GAME.ui.showNotification('\uD83D\uDCBE Game saved! (Enhanced)', 'success');
    } else {
      GAME.ui.showNotification('\u274C Save failed!', 'error');
    }
    return;
  }
  // fallback: الحفظ القديم
  try {
    var data = {
      health: this.state.health,
      energy: this.state.energy,
      money: this.state.money,
      day: this.state.day,
      time: this.state.time,
      inventory: this.state.inventory,
      crafted: this.state.crafted,
      selectedTool: this.state.selectedTool,
      xp: this.state.xp,
      level: this.state.level,
      achievements: this.state.achievements,
      stats: this.state.stats
    };
    localStorage.setItem('farmGameSave', JSON.stringify(data));
    GAME.ui.showNotification('\uD83D\uDCBE Game saved!', 'success');
  } catch (e) {
    GAME.ui.showNotification('\u274C Save failed!', 'error');
  }
};

GAME.game.quitToMenu = function() {
  this.isPaused = false;
  this._atMenu = true;
  document.getElementById('pause-menu').classList.add('hidden');
  document.getElementById('hud').style.opacity = '0';
  GAME.ui.showMenu();
};
