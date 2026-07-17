var GAME = GAME || {};
GAME.collision = {
  boxes: [],
  addBox: function(min, max) {
    this.boxes.push({ min: new THREE.Vector3(min[0], min[1], min[2]), max: new THREE.Vector3(max[0], max[1], max[2]) });
  },
  clear: function() {
    this.boxes = [];
  },
  checkPoint: function(x, y, z) {
    for (var i = 0; i < this.boxes.length; i++) {
      var b = this.boxes[i];
      if (x >= b.min.x && x <= b.max.x && z >= b.min.z && z <= b.max.z) return true;
    }
    return false;
  },
  resolveCollision: function(pos, radius) {
    for (var i = 0; i < this.boxes.length; i++) {
      var b = this.boxes[i];
      var cx = Math.max(b.min.x, Math.min(pos.x, b.max.x));
      var cz = Math.max(b.min.z, Math.min(pos.z, b.max.z));
      var dx = pos.x - cx;
      var dz = pos.z - cz;
      var dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < radius) {
        if (dist === 0) {
          pos.x = b.max.x + radius;
          return;
        }
        var overlap = radius - dist;
        pos.x += (dx / dist) * overlap;
        pos.z += (dz / dist) * overlap;
      }
    }
    pos.x = Math.max(-58, Math.min(58, pos.x));
    pos.z = Math.max(-58, Math.min(58, pos.z));
  }
};
