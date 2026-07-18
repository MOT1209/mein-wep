var GAME = GAME || {};
GAME.achievements = {
  list: [
    { id: 'first_plant', title: '🌱 First Steps', desc: 'Plant your first crop', icon: '🌱',
      category: 'farming', check: function(s) { return s.stats.totalPlanted >= 1; }, rewardXP: 10, rewardMoney: 20 },
    { id: 'farmer_10', title: '🌾 Apprentice Farmer', desc: 'Plant 10 crops', icon: '🌾',
      category: 'farming', check: function(s) { return s.stats.totalPlanted >= 10; }, rewardXP: 50, rewardMoney: 50 },
    { id: 'farmer_50', title: '🌿 Expert Farmer', desc: 'Plant 50 crops', icon: '🌿',
      category: 'farming', check: function(s) { return s.stats.totalPlanted >= 50; }, rewardXP: 150, rewardMoney: 150 },
    { id: 'farmer_100', title: '🌳 Master Farmer', desc: 'Plant 100 crops', icon: '🌳',
      category: 'farming', check: function(s) { return s.stats.totalPlanted >= 100; }, rewardXP: 400, rewardMoney: 500 },
    { id: 'first_harvest', title: '🧺 First Harvest', desc: 'Harvest your first crop', icon: '🧺',
      category: 'farming', check: function(s) { return s.stats.totalHarvested >= 1; }, rewardXP: 15, rewardMoney: 30 },
    { id: 'harvest_50', title: '🍅 Bumper Crop', desc: 'Harvest 50 crops', icon: '🍅',
      category: 'farming', check: function(s) { return s.stats.totalHarvested >= 50; }, rewardXP: 200, rewardMoney: 200 },
    { id: 'money_100', title: '💰 Penny Saver', desc: 'Earn $100 total', icon: '💰',
      category: 'money', check: function(s) { return s.stats.totalEarned >= 100; }, rewardXP: 20, rewardMoney: 30 },
    { id: 'money_1000', title: '💵 Money Maker', desc: 'Earn $1,000 total', icon: '💵',
      category: 'money', check: function(s) { return s.stats.totalEarned >= 1000; }, rewardXP: 100, rewardMoney: 150 },
    { id: 'money_5000', title: '💎 Farm Tycoon', desc: 'Earn $5,000 total', icon: '💎',
      category: 'money', check: function(s) { return s.stats.totalEarned >= 5000; }, rewardXP: 500, rewardMoney: 1000 },
    { id: 'first_craft', title: '🔨 Beginner Crafter', desc: 'Craft your first item', icon: '🔨',
      category: 'crafting', check: function(s) { return s.stats.totalCrafted >= 1; }, rewardXP: 15, rewardMoney: 25 },
    { id: 'craft_25', title: '⚒️ Skilled Artisan', desc: 'Craft 25 items', icon: '⚒️',
      category: 'crafting', check: function(s) { return s.stats.totalCrafted >= 25; }, rewardXP: 150, rewardMoney: 200 },
    { id: 'water_20', title: '💧 Water Master', desc: 'Water crops 20 times', icon: '💧',
      category: 'farming', check: function(s) { return s.stats.totalWatered >= 20; }, rewardXP: 50, rewardMoney: 60 },
    { id: 'fertilize_10', title: '🧪 Green Thumb', desc: 'Fertilize crops 10 times', icon: '🧪',
      category: 'farming', check: function(s) { return s.stats.totalFertilized >= 10; }, rewardXP: 80, rewardMoney: 100 },
    { id: 'apple_tree', title: '🍎 Apple Orchard', desc: 'Harvest 10 apples', icon: '🍎',
      category: 'farming', check: function(s) { return s.stats.totalApples >= 10; }, rewardXP: 100, rewardMoney: 200 },
    { id: 'day_10', title: '☀️ Seasoned Farmer', desc: 'Survive 10 days', icon: '☀️',
      category: 'exploration', check: function(s) { return s.day >= 10; }, rewardXP: 50, rewardMoney: 80 },
    { id: 'day_30', title: '🌙 Veteran Farmer', desc: 'Survive 30 days', icon: '🌙',
      category: 'exploration', check: function(s) { return s.day >= 30; }, rewardXP: 200, rewardMoney: 300 },
    { id: 'level_5', title: '⭐ Rising Star', desc: 'Reach level 5', icon: '⭐',
      category: 'exploration', check: function(s) { return s.level >= 5; }, rewardXP: 100, rewardMoney: 100 },
    { id: 'level_10', title: '🌟 Farm Legend', desc: 'Reach level 10', icon: '🌟',
      category: 'exploration', check: function(s) { return s.level >= 10; }, rewardXP: 500, rewardMoney: 800 },
    { id: 'sleep_10', title: '🛌 Well Rested', desc: 'Sleep 10 times', icon: '🛌',
      category: 'exploration', check: function(s) { return s.stats.totalSlept >= 10; }, rewardXP: 30, rewardMoney: 50 },
    { id: 'buy_animal', title: '🐄 Animal Friend', desc: 'Buy your first animal', icon: '🐄',
      category: 'money', check: function(s) { return s.stats.totalAnimals >= 1; }, rewardXP: 25, rewardMoney: 40 }
  ],

  init: function() {
    var state = GAME.game.state;
    if (!state.achievements) {
      state.achievements = [];
    }
    if (!state.stats) {
      state.stats = {
        totalPlanted: 0, totalHarvested: 0, totalEarned: 0,
        totalCrafted: 0, totalWatered: 0, totalFertilized: 0,
        totalSlept: 0, totalAnimals: 0, totalApples: 0
      };
    }
  },

  checkAll: function() {
    var state = GAME.game.state;
    if (!state || !state.achievements) return;
    var unlocked = 0;
    for (var i = 0; i < this.list.length; i++) {
      var ach = this.list[i];
      if (state.achievements.indexOf(ach.id) !== -1) continue;
      if (ach.check(state)) {
        state.achievements.push(ach.id);
        GAME.game.addXP(ach.rewardXP);
        state.money += ach.rewardMoney;
        GAME.ui.showNotification('🏆 Achievement: ' + ach.title + '! +' + ach.rewardXP + ' XP, +$' + ach.rewardMoney, 'success');
        GAME.audio.play('chime');
        unlocked++;
      }
    }
    if (unlocked > 0) {
      GAME.ui.refreshInventory();
    }
    return unlocked;
  }
};
