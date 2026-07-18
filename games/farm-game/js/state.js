// Farm Game — Game State & Recipes
var GAME = GAME || {};
GAME.game = GAME.game || {};

GAME.game.state = {
  health: 100,
  energy: 100,
  money: 200,
  day: 1,
  time: 6,
  inventory: { wheat: 0, tomato: 0, carrot: 0, apple: 0 },
  crafted: { bread: 0, ketchup: 0, juice: 0 },
  selectedTool: 0,
  plots: [],
  timeScale: 60,
  xp: 0,
  level: 1,
  quests: [],
  achievements: [],
  stats: {
    totalPlanted: 0, totalHarvested: 0, totalEarned: 0,
    totalCrafted: 0, totalWatered: 0, totalFertilized: 0,
    totalSlept: 0, totalAnimals: 0, totalApples: 0
  }
};

GAME.game.recipes = {
  bread: { name: '\uD83C\uDF5E Bread', icon: '\uD83C\uDF5E', inputs: { wheat: 2 }, sellPrice: 65, xpReward: 10 },
  ketchup: { name: '\uD83E\uDD5B Ketchup', icon: '\uD83E\uDD5B', inputs: { tomato: 2 }, sellPrice: 100, xpReward: 15 },
  juice: { name: '\uD83E\uDD67 Carrot Juice', icon: '\uD83E\uDD67', inputs: { carrot: 2 }, sellPrice: 80, xpReward: 12 }
};

GAME.game.initPlots = function() {
  var plots = [];
  var rows = 6, cols = 6;
  var spacing = 2.8;
  var startX = -(cols - 1) * spacing / 2;
  var startZ = 2;
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      plots.push({
        row: r, col: c,
        x: startX + c * spacing,
        z: startZ + r * spacing,
        state: 'empty',
        crop: null,
        growth: 0,
        watered: false,
        fertilized: false,
        growthStage: 0,
        mesh: null,
        waterMarker: null,
        fertilizerMarker: null
      });
    }
  }
  this.state.plots = plots;
};
