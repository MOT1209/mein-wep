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
  isLocked: false,
  sensitivity: 10,
  invertY: false,

  init: function() {
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 6, 12);
    this.loadSettings();
    var self = this;

    document.addEventListener('click', function() {
      // لا تقفل المؤشر إذا كانت أي نافذة مفتوحة (قائمة/إعدادات/متجر/مخزون/إيقاف)
      if (!self.isLocked && !GAME.ui.isUIBlocking() && self._pointerLockEnabled !== false) {
        document.body.requestPointerLock();
      }
    });
    document.addEventListener('pointerlockchange', function() {
      self.isLocked = document.pointerLockElement === document.body;
      var crosshair = document.getElementById('crosshair');
      if (crosshair) crosshair.style.opacity = self.isLocked ? '1' : '0';
    });
    document.addEventListener('mousemove', function(e) {
      if (!self.isLocked) return;
      // معامل أنعم: عند القيمة الافتراضية 10 → 0.004 بدل 0.01 (أبطأ ~2.5×)
      var sens = self.sensitivity * 0.0004;
      var dx = e.movementX * sens;
      var dy = e.movementY * sens * (self.invertY ? -1 : 1);
      self.targetTheta -= dx;
      self.targetPhi = Math.max(0.1, Math.min(1.2, self.targetPhi + dy));
    });
    document.addEventListener('wheel', function(e) {
      self.targetDistance = Math.max(self.minDist, Math.min(self.maxDist, self.targetDistance + e.deltaY * 0.01));
    }, { passive: true });

    window.addEventListener('resize', function() {
      self.camera.aspect = window.innerWidth / window.innerHeight;
      self.camera.updateProjectionMatrix();
    });
  },

  loadSettings: function() {
    try {
      var s = JSON.parse(localStorage.getItem('farmSettings') || '{}');
      this.sensitivity = s.sensitivity || 10;
      this.invertY = s.invertY || false;
      this._pointerLockEnabled = s.pointerLock !== false;
    } catch(e) {}
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
