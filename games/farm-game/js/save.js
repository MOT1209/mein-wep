// Farm Game — Save & Load System
var GAME = GAME || {};
GAME.game = GAME.game || {};

GAME.game.loadGame = function() {
  try {
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
      level: this.state.level
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
