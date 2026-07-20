/**
 * FrustumCulling.js - نظام إخفاء الكائنات خارج مجال الرؤية
 * يحسن الأداء بإخفاء الكائنات غير المرئية للكاميرا
 * يستخدم Bounding Spheres لفحص التداخل مع Frustum
 */

GAME.FrustumCulling = {
  frustum: null,
  cullableObjects: [],
  updateInterval: 100, // تحديث كل 100 ميلي ثانية
  
  init: function(game) {
    this.game = game;
    this.frustum = new THREE.Frustum();
    this.startCulling();
    console.log('[FrustumCulling] تم تهيئة نظام إخفاء الكائنات');
  },
  
  startCulling: function() {
    var self = this;
    this._intervalId = setInterval(function() {
      self.update();
    }, this.updateInterval);
  },
  
  registerObject: function(object) {
    if (object.geometry || object.children.length > 0) {
      this.cullableObjects.push(object);
    }
  },
  
  unregisterObject: function(object) {
    this.cullableObjects = this.cullableObjects.filter(function(obj) {
      return obj !== object;
    });
  },
  
  update: function() {
    if (!GAME.camera || !GAME.camera.camera) return;
    
    // Update frustum from camera
    var camera = GAME.camera.camera;
    var projScreenMatrix = new THREE.Matrix4();
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(projScreenMatrix);
    
    // Cull objects
    for (var i = 0; i < this.cullableObjects.length; i++) {
      var obj = this.cullableObjects[i];
      var visible = this.isObjectVisible(obj);
      this.setVisibility(obj, visible);
    }
  },
  
  isObjectVisible: function(object) {
    // Create bounding sphere if not exists
    if (!object.boundingSphere) {
      if (object.geometry) {
        object.geometry.computeBoundingSphere();
        object.boundingSphere = object.geometry.boundingSphere.clone();
      } else {
        return true;
      }
    }
    
    // Check if bounding sphere is in frustum
    var worldPos = new THREE.Vector3();
    object.getWorldPosition(worldPos);
    
    var sphere = new THREE.Sphere(
      worldPos,
      object.boundingSphere.radius * Math.max(object.scale.x, object.scale.y, object.scale.z)
    );
    
    return this.frustum.intersectsSphere(sphere);
  },
  
  setVisibility: function(object, visible) {
    object.visible = visible;
    
    // Also hide/show children
    object.traverse(function(child) {
      child.visible = visible;
    });
  },
  
  clear: function() {
    this.cullableObjects = [];
  }
};
