var GAME = GAME || {};
GAME.player = {
  mesh: null,
  body: null,
  head: null,
  leftArm: null,
  rightArm: null,
  targetPos: new THREE.Vector3(0, 0, 15),
  speed: 4.5,
  radius: 0.35,
  height: 1.6,
  isMoving: false,
  armSwing: 0,

  init: function(scene) {
    var group = new THREE.Group();
    var bodyMat = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
    var skinMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
    var armMat = new THREE.MeshLambertMaterial({ color: 0x1976D2 });

    this.body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.45), bodyMat);
    this.body.position.y = 0.5;
    this.body.castShadow = true;
    group.add(this.body);

    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
    this.head.position.y = 1.25;
    this.head.castShadow = true;
    group.add(this.head);

    this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.18), armMat);
    this.leftArm.position.set(-0.44, 0.65, 0);
    group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.18), armMat);
    this.rightArm.position.set(0.44, 0.65, 0);
    group.add(this.rightArm);

    var legMat = new THREE.MeshLambertMaterial({ color: 0x1565C0 });
    this.leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.22), legMat);
    this.leftLeg.position.set(-0.15, 0.3, 0);
    group.add(this.leftLeg);
    this.rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.22), legMat);
    this.rightLeg.position.set(0.15, 0.3, 0);
    group.add(this.rightLeg);

    this.mesh = group;
    this.mesh.position.copy(this.targetPos);
    scene.add(this.mesh);
  },

  update: function(delta) {
    if (!GAME.keys || !GAME.camera) return;
    var keys = GAME.keys;
    var forward = new THREE.Vector3();
    GAME.camera.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    var right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    var move = new THREE.Vector3();
    if (keys['KeyW'] || keys['ArrowUp']) move.add(forward);
    if (keys['KeyS'] || keys['ArrowDown']) move.sub(forward);
    if (keys['KeyA'] || keys['ArrowLeft']) move.sub(right);
    if (keys['KeyD'] || keys['ArrowRight']) move.add(right);

    this.isMoving = move.lengthSq() > 0.001;
    if (this.isMoving) {
      move.normalize().multiplyScalar(this.speed * delta);
      var newPos = this.mesh.position.clone().add(move);
      GAME.collision.resolveCollision(newPos, this.radius);
      this.mesh.position.copy(newPos);
      var targetAngle = Math.atan2(move.x, move.z);
      var currentAngle = this.mesh.rotation.y;
      var diff = targetAngle - currentAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.mesh.rotation.y += diff * 10 * delta;
      this.armSwing += delta * 6;
      if (this.leftArm) {
        var swing = Math.sin(this.armSwing) * 0.4;
        this.leftArm.rotation.x = swing;
        this.rightArm.rotation.x = -swing;
        this.leftLeg.rotation.x = -swing * 0.6;
        this.rightLeg.rotation.x = swing * 0.6;
      }
    } else {
      if (this.leftArm) {
        this.leftArm.rotation.x *= 0.9;
        this.rightArm.rotation.x *= 0.9;
        this.leftLeg.rotation.x *= 0.9;
        this.rightLeg.rotation.x *= 0.9;
      }
    }

    if (GAME.camera) {
      GAME.camera.update(this.mesh.position);
    }
  }
};
