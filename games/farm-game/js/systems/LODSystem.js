/**
 * LODSystem.js - Level of Detail System
 * تقليل تفاصيل الكائنات البعيدة لتحسين الأداء
 * 3 مستويات: high, medium, low - تبديل تلقائي بناءً على المسافة
 */

GAME.LODSystem = {
  lodLevels: {
    high: { distance: 50, quality: 1.0 },
    medium: { distance: 100, quality: 0.5 },
    low: { distance: 200, quality: 0.25 }
  },
  
  lodObjects: [],
  
  init: function(game) {
    this.game = game;
    this.startUpdate();
  },
  
  startUpdate: function() {
    var self = this;
    setInterval(function() {
      self.updateLODs();
    }, 500);
  },
  
  registerObject: function(object, highDetail, mediumDetail, lowDetail) {
    this.lodObjects.push({
      object: object,
      meshes: {
        high: highDetail,
        medium: mediumDetail,
        low: lowDetail
      },
      currentLOD: 'high'
    });
  },
  
  updateLODs: function() {
    if (!GAME.player || !GAME.player.mesh) return;
    
    var playerPos = GAME.player.mesh.position;
    
    for (var i = 0; i < this.lodObjects.length; i++) {
      var lodObj = this.lodObjects[i];
      var distance = playerPos.distanceTo(lodObj.object.position);
      var newLOD = this.getLODForDistance(distance);
      
      if (newLOD !== lodObj.currentLOD) {
        this.switchLOD(lodObj, newLOD);
      }
    }
  },
  
  getLODForDistance: function(distance) {
    if (distance < this.lodLevels.high.distance) {
      return 'high';
    } else if (distance < this.lodLevels.medium.distance) {
      return 'medium';
    } else {
      return 'low';
    }
  },
  
  switchLOD: function(lodObj, newLOD) {
    // Hide current LOD
    if (lodObj.meshes[lodObj.currentLOD]) {
      lodObj.meshes[lodObj.currentLOD].visible = false;
    }
    
    // Show new LOD
    if (lodObj.meshes[newLOD]) {
      lodObj.meshes[newLOD].visible = true;
    }
    
    lodObj.currentLOD = newLOD;
  },
  
  unregisterObject: function(object) {
    this.lodObjects = this.lodObjects.filter(function(lod) {
      return lod.object !== object;
    });
  }
};
