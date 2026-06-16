var GAME = GAME || {};
GAME.camera = {
  camera: null,
  distance: 8,
  minDist: 3,
  maxDist: 16,
  theta: 0,
  phi: 0.45,
  targetTheta: 0,
  targetPhi: 0.45,
  targetDistance: 8,
  isDragging: false,
  prevMouse: { x: 0, y: 0 },
  sensitivity: 0.005,

  init: function() {
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 6, 12);

    var self = this;
    document.addEventListener('mousedown', function(e) {
      if (e.button === 0 || e.button === 2) {
        self.isDragging = true;
        self.prevMouse.x = e.clientX;
        self.prevMouse.y = e.clientY;
      }
    });
    document.addEventListener('mousemove', function(e) {
      if (!self.isDragging) return;
      var dx = e.clientX - self.prevMouse.x;
      var dy = e.clientY - self.prevMouse.y;
      self.targetTheta -= dx * self.sensitivity;
      self.targetPhi = Math.max(0.1, Math.min(1.2, self.targetPhi + dy * self.sensitivity));
      self.prevMouse.x = e.clientX;
      self.prevMouse.y = e.clientY;
    });
    document.addEventListener('mouseup', function() { self.isDragging = false; });
    document.addEventListener('mouseleave', function() { self.isDragging = false; });
    document.addEventListener('wheel', function(e) {
      self.targetDistance = Math.max(self.minDist, Math.min(self.maxDist, self.targetDistance + e.deltaY * 0.01));
    }, { passive: true });

    window.addEventListener('resize', function() {
      self.camera.aspect = window.innerWidth / window.innerHeight;
      self.camera.updateProjectionMatrix();
    });
  },

  update: function(targetPos) {
    this.theta += (this.targetTheta - this.theta) * 0.08;
    this.phi += (this.targetPhi - this.phi) * 0.08;
    this.distance += (this.targetDistance - this.distance) * 0.08;

    var offset = new THREE.Vector3(
      this.distance * Math.sin(this.theta) * Math.cos(this.phi),
      this.distance * Math.sin(this.phi),
      this.distance * Math.cos(this.theta) * Math.cos(this.phi)
    );
    this.camera.position.copy(targetPos).add(offset);
    this.camera.lookAt(targetPos.x, targetPos.y + 0.8, targetPos.z);
  },

  getForward: function() {
    var dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    dir.y = 0;
    return dir.normalize();
  }
};
