/**
 * LeaderboardSystem.js - نظام لوحة الصدارة
 * يتتبع أعلى النتائج في 5 فئات: المال، المحاصيل، الحيوانات، الصداقة، الإنجازات
 * يحفظ البيانات في localStorage
 */

GAME.LeaderboardSystem = {
  leaderboards: {
    money: { title: '💰 Richest Farmer', entries: [] },
    crops: { title: '🌾 Best Harvester', entries: [] },
    animals: { title: '🐄 Animal Master', entries: [] },
    friendship: { title: '❤️ Most Friendly', entries: [] },
    achievements: { title: '🏆 Achievement Hunter', entries: [] }
  },

  init: function(game) {
    this.game = game;
    this.load();
  },

  addScore: function(category, name, score) {
    var board = this.leaderboards[category];
    if (!board) return;
    
    board.entries.push({ name: name, score: score, date: Date.now() });
    board.entries.sort(function(a, b) { return b.score - a.score; });
    board.entries = board.entries.slice(0, 10); // top 10
    
    this.save();
  },

  getTopScores: function(category, limit) {
    limit = limit || 5;
    var board = this.leaderboards[category];
    if (!board) return [];
    return board.entries.slice(0, limit);
  },

  getPlayerRank: function(category, playerName) {
    var board = this.leaderboards[category];
    if (!board) return -1;
    for (var i = 0; i < board.entries.length; i++) {
      if (board.entries[i].name === playerName) {
        return i + 1;
      }
    }
    return -1;
  },

  save: function() {
    localStorage.setItem('farmGameLeaderboards', JSON.stringify(this.leaderboards));
  },

  load: function() {
    var saved = localStorage.getItem('farmGameLeaderboards');
    if (saved) {
      this.leaderboards = JSON.parse(saved);
    }
  }
};
