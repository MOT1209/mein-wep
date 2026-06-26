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
    this.setupSunRays();
    this.nextChange = 30 + Math.random() * 60;
    // Lightning properties
    this.lightningTimer = 0;
    this.lightningDelay = 5 + Math.random() * 10; // 5-15 seconds
  },

  setupSunRays: function() {
    // أشعة الشمس التزيينية — عدسة ضوئية بسيطة
    if (!this.scene) return;
    var spriteMap = (function(){
      var canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      var ctx = canvas.getContext('2d');
      var gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,240,200,0.3)');
      gradient.addColorStop(0.5, 'rgba(255,220,100,0.1)');
      gradient.addColorStop(1, 'rgba(255,200,50,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    })();
    var spriteMat = new THREE.SpriteMaterial({
      map: spriteMap,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true
    });
    this.sunRays = new THREE.Sprite(spriteMat);
    this.sunRays.position.set(30, 45, 20);
    this.sunRays.scale.set(25, 25, 1);
    this.scene.add(this.sunRays);
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
    // إشعار بتغيّر الطقس — فقط أثناء اللعب الفعلي (لا في القائمة)
    if (GAME.game && GAME.game.state && GAME.ui && GAME.ui.showNotification) {
      var names = { sunny: '☀️ Sunny skies', cloudy: '⛅ Cloudy', rainy: '🌧️ Rain — crops grow faster!', stormy: '⛈️ Storm — growth slowed' };
      GAME.ui.showNotification(names[type] || type, 'info');
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
    } else if (this.current === 'cloudy') {
      this.scene.background.setHSL(0.6, 0.1, 0.62); // غائم — سماء رمادية فاتحة
      if (this.scene.fog) this.scene.fog.color.setHSL(0.6, 0.1, 0.58);
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
      var weathers = ['sunny', 'sunny', 'sunny', 'cloudy', 'cloudy', 'rainy', 'rainy', 'stormy'];
      var newWeather = weathers[Math.floor(Math.random() * weathers.length)];
      this.setWeather(newWeather);
    }
  }
};
