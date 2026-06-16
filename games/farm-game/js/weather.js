var GAME = GAME || {};
GAME.weather = {
  current: 'sunny',
  nextChange: 60,
  rainParticles: null,
  particleSystem: null,
  rainCount: 1500,
  scene: null,
  originalBg: null,

  init: function(scene) {
    this.scene = scene;
    this.originalBg = new THREE.Color(0x87CEEB);
    this.setupRain();
    this.nextChange = 30 + Math.random() * 60;
  },

  setupRain: function() {
    var positions = new Float32Array(this.rainCount * 3);
    var velocities = new Float32Array(this.rainCount);
    for (var i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
      velocities[i] = 8 + Math.random() * 4;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this._rainVelocities = velocities;
    var mat = new THREE.PointsMaterial({
      color: 0x8899cc,
      size: 0.08,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.particleSystem = new THREE.Points(geo, mat);
    this.particleSystem.visible = false;
    this.scene.add(this.particleSystem);
  },

  setWeather: function(type) {
    if (type === this.current) return;
    this.current = type;
    if (type === 'rainy' || type === 'stormy') {
      this.particleSystem.visible = true;
      if (type === 'stormy') {
        this.particleSystem.material.size = 0.12;
        this.particleSystem.material.color.setHex(0x6677aa);
      } else {
        this.particleSystem.material.size = 0.08;
        this.particleSystem.material.color.setHex(0x8899cc);
      }
    } else {
      this.particleSystem.visible = false;
    }
  },

  update: function(delta) {
    if (!this.scene) return;
    var game = GAME.game;
    if (!game || !game.state) return;
    var t = game.state.time;

    var dayFactor = Math.sin((t - 6) / 24 * Math.PI * 2);
    var isNight = t < 5 || t > 19;
    if (isNight) {
      var nightAmount = t < 5 ? (5 - t) / 5 : (t - 19) / 5;
      nightAmount = Math.min(1, nightAmount);
      if (this.scene.fog) this.scene.fog.color.setHSL(0.6, 0.3, 0.1 * (1 - nightAmount));
      this.scene.background.setHSL(0.6, 0.4, 0.05 + nightAmount * 0.1);
    } else if (this.current === 'rainy' || this.current === 'stormy') {
      this.scene.background.setHSL(0.6, 0.2, 0.5);
      if (this.scene.fog) this.scene.fog.color.setHSL(0.6, 0.2, 0.4);
    } else {
      this.scene.background.copy(this.originalBg);
      if (this.scene.fog) this.scene.fog.color.setHSL(0.58, 0.3, 0.5);
    }

    if (this.current !== 'sunny') {
      var rainOpacity = this.current === 'stormy' ? 0.6 : 0.3;
      this.particleSystem.material.opacity += (rainOpacity - this.particleSystem.material.opacity) * 0.02;
      var positions = this.particleSystem.geometry.attributes.position.array;
      var wind = this.current === 'stormy' ? 0.5 : 0.1;
      for (var i = 0; i < this.rainCount; i++) {
        positions[i * 3 + 1] -= this._rainVelocities[i] * delta;
        positions[i * 3] += wind * delta;
        positions[i * 3 + 2] += Math.sin(Date.now() * 0.001 + i) * 0.02;
        if (positions[i * 3 + 1] < -2) {
          positions[i * 3 + 1] = 28 + Math.random() * 4;
          positions[i * 3] = (Math.random() - 0.5) * 120;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
        }
      }
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    this.nextChange -= delta;
    if (this.nextChange <= 0) {
      this.nextChange = 40 + Math.random() * 80;
      var weathers = ['sunny', 'sunny', 'sunny', 'rainy', 'rainy', 'stormy'];
      var newWeather = weathers[Math.floor(Math.random() * weathers.length)];
      this.setWeather(newWeather);
    }
  }
};
