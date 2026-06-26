// Farm Game — Daily Quests System
var GAME = GAME || {};
GAME.quests = {

  questPool: [
    { id: 'harvest', title: '🌾 Harvester', desc: 'Harvest crops', target: 3, rewardXP: 30 },
    { id: 'harvest', title: '🌾 Big Harvest', desc: 'Harvest crops', target: 8, rewardXP: 70 },
    { id: 'earn', title: '💰 Entrepreneur', desc: 'Earn money', target: 100, rewardXP: 25 },
    { id: 'earn', title: '💰 Tycoon', desc: 'Earn money', target: 300, rewardXP: 80 },
    { id: 'plant', title: '🌱 Sower', desc: 'Plant seeds', target: 5, rewardXP: 20 },
    { id: 'plant', title: '🌱 Green Thumb', desc: 'Plant seeds', target: 10, rewardXP: 45 },
    { id: 'water', title: '💧 Waterer', desc: 'Water crops', target: 5, rewardXP: 15 },
    { id: 'fertilize', title: '🧪 Nourisher', desc: 'Fertilize crops', target: 3, rewardXP: 30 },
    { id: 'craft', title: '🔨 Crafter', desc: 'Craft items', target: 2, rewardXP: 35 },
    { id: 'craft', title: '🔨 Artisan', desc: 'Craft items', target: 5, rewardXP: 75 }
  ],

  generateDaily: function() {
    var day = GAME.game.state.day;
    // Pick 3 quests based on day number (cycle through pool)
    var shuffled = this.questPool.slice();
    // Simple shuffle seeded by day so same quests don't repeat daily
    var seed = day * 7;
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = (seed + i) % (i + 1);
      var tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }
    // اختر 3 مهام بأنواع مختلفة (تجنّب تكرار نفس النوع في اليوم نفسه)
    var selected = [];
    var usedIds = {};
    for (var k = 0; k < shuffled.length && selected.length < 3; k++) {
      if (usedIds[shuffled[k].id]) continue;
      usedIds[shuffled[k].id] = true;
      selected.push(shuffled[k]);
    }
    var quests = [];
    for (var q = 0; q < selected.length; q++) {
      quests.push({
        id: selected[q].id,
        title: selected[q].title,
        desc: selected[q].desc,
        current: 0,
        target: selected[q].target,
        rewardXP: selected[q].rewardXP,
        completed: false
      });
    }
    return quests;
  },

  // Call after any player action that might progress a quest
  track: function(questId, amount) {
    var quests = GAME.game.state.quests;
    if (!quests || quests.length === 0) return;
    for (var i = 0; i < quests.length; i++) {
      var q = quests[i];
      if (q.id === questId && !q.completed) {
        q.current = Math.min(q.target, q.current + amount);
        if (q.current >= q.target) {
          q.completed = true;
          GAME.game.addXP(q.rewardXP);
          GAME.ui.showNotification('⭐ Quest complete: ' + q.title + '! +' + q.rewardXP + ' XP', 'success');
          GAME.audio.play('chime');
          GAME.ui.refreshInventory();
        }
      }
    }
  },

  // Reset quests for a new day
  checkNewDay: function() {
    var savedKey = 'farmQuestsDay_' + GAME.game.state.day;
    if (localStorage.getItem(savedKey)) {
      // Already generated quests for this day
      return;
    }
    GAME.game.state.quests = this.generateDaily();
    localStorage.setItem(savedKey, '1');
  }
};
